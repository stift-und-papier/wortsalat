-- Jazz 2026-11-16 (alle Vorschläge angenommen):
-- 1. Gemischte Übung: jede Runde darf eine eigene Arbeitsanweisung und einen eigenen Tipp haben
--    (loesung.runden[i].anweisung / .hinweis, je höchstens 500 Zeichen). Beides geht in inhalt.runden[i] (keine Lösung).
-- 2. Multiple Choice (statt „Sätze verbessern“, gleiches Format 'ueberarbeiten' / Teil 'versionen'): Schüler:innen erfahren,
--    ob mehrere Antworten richtig sind ('mehrfach'), aber nicht welche.

create or replace function public.aufgabe_vorbereiten() returns trigger
language plpgsql set search_path = '' as $$
declare
  c_standard constant text[] := array['lueckentext', 'auswahl', 'zuordnen', 'fehler', 'reihenfolge', 'ueberarbeiten'];
begin
  if new.loesung ? 'runden' then
    if jsonb_typeof(new.loesung -> 'runden') <> 'array' or jsonb_array_length(new.loesung -> 'runden') not between 1 and 100 then
      raise exception 'Eine Übung braucht 1 bis 100 Runden.' using errcode = '22023';
    end if;
    if new.typ = 'fallende_woerter' and exists (
      select 1 from jsonb_array_elements(new.loesung -> 'runden') r
      where coalesce(btrim(r ->> 'wort'), '') = '' or length(r ->> 'wort') > 60
    ) then
      raise exception 'Jedes Wort braucht 1 bis 60 Zeichen.' using errcode = '22023';
    end if;
    if exists (
      select 1 from jsonb_array_elements(new.loesung -> 'runden') r
      where r ? 'typ' and not (new.typ = any (c_standard) and r ->> 'typ' = any (c_standard))
    ) then
      raise exception 'Dieses Format geht in einer Runde nicht.' using errcode = '22023';
    end if;
    if exists (
      select 1 from jsonb_array_elements(new.loesung -> 'runden') r
      where length(coalesce(r ->> 'anweisung', '')) > 500 or length(coalesce(r ->> 'hinweis', '')) > 500
    ) then
      raise exception 'Arbeitsanweisung und Tipp einer Runde dürfen höchstens 500 Zeichen haben.' using errcode = '22023';
    end if;
    new.inhalt := jsonb_build_object('runden', (
      select jsonb_agg(case when new.typ = 'fallende_woerter'
                         then jsonb_build_object('wort', public.diktat_norm(r ->> 'wort'), 'teile', '[]'::jsonb)
                         else public.inhalt_ohne_loesung(coalesce(r ->> 'typ', new.typ), r)
                              || jsonb_build_object('typ', coalesce(r ->> 'typ', new.typ))
                              -- leere Felder fallen weg, dann gilt Anweisung bzw. Tipp der Übung
                              || jsonb_strip_nulls(jsonb_build_object(
                                   'anweisung', nullif(btrim(coalesce(r ->> 'anweisung', '')), ''),
                                   'hinweis', nullif(btrim(coalesce(r ->> 'hinweis', '')), ''))) end order by n)
      from jsonb_array_elements(new.loesung -> 'runden') with ordinality x (r, n)
    ));
  else
    new.inhalt := public.inhalt_ohne_loesung(new.typ, new.loesung);
  end if;
  new.geaendert_am := now();
  return new;
end
$$;

create or replace function public.inhalt_ohne_loesung(p_typ text, p_loesung jsonb) returns jsonb
language plpgsql immutable set search_path = '' as $$
begin
  -- Diktat: nur der Text, der ohnehin zu sehen ist (Sätze ohne die | der Lehrkraft)
  if p_typ = 'diktat' then
    return jsonb_build_object('modus', coalesce(p_loesung ->> 'modus', 'abschreiben'),
      'saetze', coalesce(p_loesung -> 'saetze', '[]'::jsonb), 'teile', '[]'::jsonb);
  end if;
  if p_typ = 'erklaerung' then
    -- Erklärseiten enthalten keine Lösungen
    return jsonb_build_object('teile', '[]'::jsonb, 'erklaerung', jsonb_build_object(
      'text', coalesce(p_loesung -> 'erklaerung' -> 'text', '""'::jsonb),
      'merke', coalesce(p_loesung -> 'erklaerung' -> 'merke', '""'::jsonb),
      'beispiele', coalesce(p_loesung -> 'erklaerung' -> 'beispiele', '[]'::jsonb)));
  end if;
  -- Achtung: "text" (Eingabetext der Lehrkraft) enthält die Lösungen und wird bewusst weggelassen.
  return jsonb_build_object(
    'darstellung', coalesce(p_loesung ->> 'darstellung', 'antippen'),
    'kategorien', coalesce(p_loesung -> 'kategorien', '[]'::jsonb),
    'korrigieren', coalesce((p_loesung ->> 'korrigieren')::boolean, false),
    'anzahl_fehler', case when coalesce((p_loesung ->> 'anzahl_zeigen')::boolean, false) then (
      select count(*) from jsonb_array_elements(p_loesung -> 'teile') t
      where t ->> 't' = 'wort' and jsonb_typeof(t -> 'korrekturen') = 'array'
    ) end,
    'teile', coalesce((
      select jsonb_agg(
        case
          when t ->> 't' = 'text' then jsonb_build_object('t', 'text', 'v', t -> 'v')
          when t ->> 't' = 'luecke' then jsonb_strip_nulls(jsonb_build_object('t', 'luecke', 'id', t -> 'id', 'hinweis', t -> 'hinweis'))
          when t ->> 't' = 'auswahl' then
            jsonb_build_object('t', 'auswahl', 'id', t -> 'id', 'optionen', t -> 'optionen',
              'mehrfach', jsonb_array_length(public.indexliste(t -> 'richtig')) > 1)
          when t ->> 't' in ('einheit', 'wort') then jsonb_build_object('t', t -> 't', 'id', t -> 'id', 'v', t -> 'v')
          when t ->> 't' = 'versionen' then
            -- Frage und Antworten; welche richtig sind und die Hinweise bleiben in der Datenbank, nur „mehrere richtig“ geht mit
            jsonb_build_object('t', 'versionen', 'id', t -> 'id', 'kontext', coalesce(t -> 'kontext', '""'::jsonb),
              'optionen', t -> 'optionen', 'mehrfach', jsonb_array_length(public.indexliste(t -> 'richtig')) > 1)
          when t ->> 't' = 'reihe' then
            -- Bausteine nach zufälliger Kennung sortiert = gemischt
            jsonb_build_object('t', 'reihe', 'id', t -> 'id',
              'satzart', t -> 'satzart', 'zeichen', t -> 'zeichen',
              'varianten', coalesce((t ->> 'varianten')::int, 1),
              'bausteine', (
                select coalesce(jsonb_agg(jsonb_build_object('k', b -> 'k', 'v', b -> 'v') order by b ->> 'k'), '[]'::jsonb)
                from jsonb_array_elements(t -> 'bausteine') b))
        end
        order by nr)
      from jsonb_array_elements(p_loesung -> 'teile') with ordinality e (t, nr)
      -- Unbekanntes fällt weg (statt null)
      where t ->> 't' in ('text', 'luecke', 'auswahl', 'einheit', 'wort', 'versionen', 'reihe')
    ), '[]'::jsonb)
  );
end
$$;

-- Aufgaben mit Multiple-Choice-Teilen neu berechnen (nur diese, damit „zuletzt geändert“ der anderen bleibt)
update public.aufgaben set loesung = loesung where loesung::text like '%"versionen"%';
