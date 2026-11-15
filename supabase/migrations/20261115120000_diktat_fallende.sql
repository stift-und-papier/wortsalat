-- Lehrkraftseite Teilaufgabe 3 (Jazz 2026-11-15, alle Vorschläge angenommen):
-- Abschreiben: eine Runde, die App schickt die Fehlerstellen; Runde und Freundschaft ab 95 % Genauigkeit.
-- Merkdiktat: jeder Teil ist eine eigene Runde {modus: 'merken', saetze: [Teil]}; Herz nur bei ganz richtigem Teil;
--             Genauigkeit des Durchgangs über alle Zeichen (lange Teile zählen mehr).
-- Fallende Wörter: loesung.runden = [{wort}], das Wort ist ohnehin zu sehen. Antwort {fehler: Fehltasten, gelandet};
--             richtig = keine Fehltaste und nicht gelandet (die App meldet das, wie beim Abschreiben).
-- Einstellungen (Zeichen je Herz, Tempo, gleichzeitig, ohne Zeitdruck) stehen in aufgaben.spiel; der Server braucht sie nicht.

-- ---------- Inhalt ohne Lösung: Fallende Wörter je Runde nur das Wort ----------
create or replace function public.aufgabe_vorbereiten() returns trigger
language plpgsql set search_path = '' as $$
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
    new.inhalt := jsonb_build_object('runden', (
      select jsonb_agg(case when new.typ = 'fallende_woerter'
                         then jsonb_build_object('wort', public.diktat_norm(r ->> 'wort'), 'teile', '[]'::jsonb)
                         else public.inhalt_ohne_loesung(new.typ, r) end order by n)
      from jsonb_array_elements(new.loesung -> 'runden') with ordinality x (r, n)
    ));
  else
    new.inhalt := public.inhalt_ohne_loesung(new.typ, new.loesung);
  end if;
  new.geaendert_am := now();
  return new;
end
$$;

-- ---------- Durchgang beenden: Diktat-Genauigkeit über alle Zeichen ----------
create or replace function public.durchgang_beenden(p_d public.durchgaenge, p_a public.aufgaben, p_jetzt timestamptz) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_d public.durchgaenge := p_d;
  v_s public.schueler;
  v_vorher boolean := public.befreundet(p_d.schueler_id, p_a.id);
  v_v public.versuche;
  v_muenzen integer;
begin
  select * into v_s from public.schueler where id = p_d.schueler_id;
  v_d.anteil := case when p_a.typ = 'diktat'
    then (select sum((e ->> 'anteil')::numeric * greatest(1, coalesce((e ->> 'zeichen')::int, 1)))
               / sum(greatest(1, coalesce((e ->> 'zeichen')::int, 1)))
          from jsonb_array_elements(p_d.ergebnisse) e)
    else (select count(*) filter (where (e ->> 'richtig')::boolean)::numeric / count(*) from jsonb_array_elements(p_d.ergebnisse) e)
  end;
  v_d.anteil := round(v_d.anteil, 3);
  v_d.befreundet := v_d.anteil >= case when p_a.typ = 'diktat' then 0.95 else 1 end;
  v_d.fertig_am := p_jetzt;
  v_d.frei_ab := public.berlin_tag(p_jetzt) + 1;

  -- ein Versuch je Durchgang (client_id = Durchgang → nie doppelt) für Lernstand und Sterne
  insert into public.versuche (client_id, schueler_id, aufgabe_id, paket_id, antworten, ergebnis,
                               anteil_richtig, richtig, zaehlt_fuer_lernstand, bearbeitet_am, gespeichert_am)
  values (p_d.id, p_d.schueler_id, p_a.id, p_d.paket_id,
          jsonb_build_object('durchgang', p_d.id),
          jsonb_build_object('runden', (select jsonb_agg(jsonb_build_object('nr', e -> 'nr', 'richtig', e -> 'richtig', 'anteil', e -> 'anteil'))
                                         from jsonb_array_elements(p_d.ergebnisse) e)),
          v_d.anteil, v_d.befreundet, true, p_jetzt, p_jetzt)
  returning * into v_v;
  v_d.versuch_id := v_v.id;

  update public.durchgaenge
  set anteil = v_d.anteil, befreundet = v_d.befreundet, fertig_am = v_d.fertig_am, frei_ab = v_d.frei_ab, versuch_id = v_d.versuch_id
  where id = p_d.id;

  perform public.stufen_aktualisieren(v_s);
  v_muenzen := public.muenzen_fuer_durchgang(v_d, p_a);
  -- Schüler:innen sehen keine Prozente: nur befreundet und Münzen
  return jsonb_build_object(
    'befreundet', v_d.befreundet or v_vorher,
    'neu_befreundet', v_d.befreundet and not v_vorher,
    'muenzen', v_muenzen,
    'kontostand', public.kontostand(p_d.schueler_id)
  );
end
$$;

-- ---------- Eine Runde prüfen: Diktat-Schwellen und Fallende Wörter ----------
create or replace function public.runde_pruefen_um(p_s public.schueler, p_durchgang uuid, p_nr integer, p_antworten jsonb, p_jetzt timestamptz)
returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_d public.durchgaenge;
  v_a public.aufgaben;
  v_runde jsonb;
  v_erg jsonb;
  v_alt jsonb;
  v_abschluss jsonb := null;
  v_zeichen integer := 1;
  v_fehler integer;
begin
  if p_antworten is null or jsonb_typeof(p_antworten) <> 'object' or length(p_antworten::text) > 20000 then
    raise exception 'Ungültige Antwort.' using errcode = '22023';
  end if;
  select * into v_d from public.durchgaenge where id = p_durchgang and schueler_id = p_s.id for update;
  if not found then
    raise exception 'Diese Übung ist dir nicht zugewiesen.' using errcode = 'P0002';
  end if;
  select * into v_a from public.aufgaben where id = v_d.aufgabe_id;

  select e into v_alt from jsonb_array_elements(v_d.ergebnisse) e where (e ->> 'nr')::int = p_nr;
  if v_alt is not null then
    return jsonb_build_object('ergebnis', v_alt -> 'ergebnis', 'richtig', v_alt -> 'richtig',
      'loesung', public.nur_loesung(v_a.typ, v_a.loesung -> 'runden' -> p_nr), 'fertig', v_d.fertig_am is not null);
  end if;
  if v_d.fertig_am is not null or not (p_nr = any (v_d.runden)) then
    raise exception 'Diese Runde gehört nicht zu deiner Übung.' using errcode = '22023';
  end if;
  if v_a.archiviert or v_d.fassung <> v_a.geaendert_am then
    raise exception 'Deine Lehrkraft hat die Übung geändert. Starte sie bitte neu.' using errcode = 'P0002';
  end if;

  v_runde := v_a.loesung -> 'runden' -> p_nr;
  if v_a.typ = 'fallende_woerter' then
    v_fehler := case when jsonb_typeof(p_antworten -> 'fehler') = 'number' then least(999, greatest(0, (p_antworten ->> 'fehler')::numeric::int)) else 0 end;
    v_erg := jsonb_build_object('luecken', '[]'::jsonb, 'fehler', v_fehler,
      'gelandet', coalesce((p_antworten ->> 'gelandet')::boolean, false));
    v_erg := v_erg || jsonb_build_object('richtig', v_fehler = 0 and not (v_erg ->> 'gelandet')::boolean);
    v_erg := v_erg || jsonb_build_object('anteil', case when (v_erg ->> 'richtig')::boolean then 1 else 0 end);
  else
    v_erg := public.pruefe_aufgabe(v_a.typ, v_runde, p_antworten);
    if v_a.typ = 'diktat' then
      v_zeichen := greatest(1, length(public.diktat_norm(
        (select string_agg(s, ' ' order by n) from jsonb_array_elements_text(coalesce(v_runde -> 'saetze', '[]'::jsonb)) with ordinality x (s, n)))));
      -- Merkdiktat: Herz nur bei ganz richtigem Teil; Abschreiben: ab 95 % (Jazz 2026-11-15)
      v_erg := v_erg || jsonb_build_object('richtig', case when v_runde ->> 'modus' = 'merken'
        then coalesce((v_erg ->> 'fehlerfrei')::boolean, false) else (v_erg ->> 'anteil')::numeric >= 0.95 end);
    end if;
  end if;
  v_d.ergebnisse := v_d.ergebnisse || jsonb_build_array(jsonb_build_object(
    'nr', p_nr, 'richtig', (v_erg ->> 'richtig')::boolean, 'anteil', (v_erg ->> 'anteil')::numeric, 'zeichen', v_zeichen,
    'antworten', p_antworten, 'ergebnis', v_erg));
  update public.durchgaenge set ergebnisse = v_d.ergebnisse where id = v_d.id;

  if jsonb_array_length(v_d.ergebnisse) = cardinality(v_d.runden) then
    v_abschluss := public.durchgang_beenden(v_d, v_a, p_jetzt);
  end if;
  return jsonb_build_object('ergebnis', v_erg, 'richtig', (v_erg ->> 'richtig')::boolean,
    'loesung', public.nur_loesung(v_a.typ, v_runde), 'fertig', v_abschluss is not null, 'abschluss', v_abschluss);
end
$$;

-- nur_loesung kennt Fallende Wörter nicht: das Wort war ohnehin zu sehen
create or replace function public.nur_loesung(p_typ text, p_loesung jsonb) returns jsonb
language plpgsql immutable set search_path = '' as $$
begin
  if p_typ in ('erklaerung', 'diktat', 'fallende_woerter') then
    return jsonb_build_object('luecken', '[]'::jsonb);
  end if;
  return jsonb_build_object(
    'luecken', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', t -> 'id',
        'loesungen', case
          when t ->> 't' in ('auswahl', 'versionen') then
            (select coalesce(jsonb_agg(t -> 'optionen' -> (i::int) order by i::int), '[]'::jsonb)
             from jsonb_array_elements_text(public.indexliste(t -> 'richtig')) i)
          when t ->> 't' = 'einheit' then jsonb_build_array(t -> 'kategorie')
          when t ->> 't' = 'wort' then t -> 'korrekturen'
          when t ->> 't' = 'reihe' then
            (select coalesce(jsonb_agg((select string_agg(x, ' ' order by n) from jsonb_array_elements_text(l) with ordinality s (x, n))), '[]'::jsonb)
             from jsonb_array_elements(t -> 'loesungen') l)
          else t -> 'loesungen'
        end))
      from jsonb_array_elements(p_loesung -> 'teile') t
      where t ->> 't' in ('luecke', 'auswahl', 'reihe', 'versionen')
         or (t ->> 't' = 'einheit' and t ->> 'kategorie' is not null)
         or (t ->> 't' = 'wort' and jsonb_typeof(t -> 'korrekturen') = 'array')
    ), '[]'::jsonb)
  );
end
$$;

-- ---------- Bestehende Merkdiktate: ein Teil = eine Runde ----------
update public.aufgaben a
set loesung = jsonb_build_object('runden', (
  select jsonb_agg(jsonb_build_object('modus', 'merken', 'text', s, 'saetze', jsonb_build_array(s),
                                      'teile', '[]'::jsonb, 'gross_klein_beachten', true) order by n)
  from jsonb_array_elements_text(a.loesung -> 'runden' -> 0 -> 'saetze') with ordinality x (s, n)))
where a.typ = 'diktat' and a.loesung ? 'runden' and jsonb_array_length(a.loesung -> 'runden') = 1
  and a.loesung -> 'runden' -> 0 ->> 'modus' = 'merken'
  and jsonb_array_length(coalesce(a.loesung -> 'runden' -> 0 -> 'saetze', '[]'::jsonb)) > 1;
