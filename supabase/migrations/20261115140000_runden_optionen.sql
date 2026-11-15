-- Lehrkraftseite, Wünsche von Jazz (2026-11-15, alle Vorschläge angenommen):
-- 1. Formate pro Runde: loesung.runden[i].typ (optional) überschreibt aufgaben.typ für diese Runde (nur die sechs Standardformate).
--    inhalt.runden[i] bekommt das Format als 'typ' mit.
-- 2. spiel.reihenfolge = true: Runden in der Reihenfolge der Lehrkraft statt gemischt (Pool-Auswahl bleibt).
-- 3. Merkdiktat: spiel.teil_grenze (50–100, Standard 100) = ab wie viel % ein Teil als geschafft gilt (Herz trifft).
-- 5. monster = 'kein': Übung ohne Monsterkampf; zählt nicht fürs Sammelalbum.

-- ---------- Inhalt ohne Lösung: Format je Runde ----------
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
    new.inhalt := jsonb_build_object('runden', (
      select jsonb_agg(case when new.typ = 'fallende_woerter'
                         then jsonb_build_object('wort', public.diktat_norm(r ->> 'wort'), 'teile', '[]'::jsonb)
                         else public.inhalt_ohne_loesung(coalesce(r ->> 'typ', new.typ), r)
                              || jsonb_build_object('typ', coalesce(r ->> 'typ', new.typ)) end order by n)
      from jsonb_array_elements(new.loesung -> 'runden') with ordinality x (r, n)
    ));
  else
    new.inhalt := public.inhalt_ohne_loesung(new.typ, new.loesung);
  end if;
  new.geaendert_am := now();
  return new;
end
$$;

-- ---------- Runden ziehen: Reihenfolge der Lehrkraft, wenn gewünscht ----------
create or replace function public.runden_ziehen(p_s public.schueler, p_a public.aufgaben) returns smallint[]
language sql volatile set search_path = '' as $$
  with alle as (
    select (n - 1)::smallint as nr from generate_series(1, jsonb_array_length(p_a.loesung -> 'runden')) n
  ),
  zuletzt as (
    select distinct on ((e ->> 'nr')::int) (e ->> 'nr')::int as nr, (e ->> 'richtig')::boolean as richtig
    from public.durchgaenge d, jsonb_array_elements(d.ergebnisse) e
    where d.schueler_id = p_s.id and d.aufgabe_id = p_a.id and d.fertig_am is not null
    order by (e ->> 'nr')::int, d.fertig_am desc
  ),
  gewaehlt as (
    select a.nr, random() as zufall
    from alle a left join zuletzt z on z.nr = a.nr
    order by case when z.nr is null then 0 when not z.richtig then 1 else 2 end, random()
    limit case when p_a.typ = 'diktat' then null else p_a.runden_je_durchgang end
  )
  select array_agg(nr order by case when p_a.typ = 'diktat' or coalesce((p_a.spiel ->> 'reihenfolge')::boolean, false) then nr end, zufall)
  from gewaehlt
$$;

-- ---------- Durchgang an die App: Lösung im Format der Runde ----------
create or replace function public.durchgang_daten(p_d public.durchgaenge, p_a public.aufgaben) returns jsonb
language sql stable set search_path = '' as $$
  select jsonb_build_object(
    'status', 'offen',
    'durchgang', p_d.id,
    'typ', p_a.typ,
    'monster', p_a.monster,
    'spiel', p_a.spiel,
    'befreundet', public.befreundet(p_d.schueler_id, p_a.id),
    'runden', (select jsonb_agg(jsonb_build_object('nr', r, 'inhalt', p_a.inhalt -> 'runden' -> r::int) order by i)
               from unnest(p_d.runden) with ordinality u (r, i)),
    'gespielt', coalesce((select jsonb_agg(jsonb_build_object(
                  'nr', e -> 'nr', 'richtig', e -> 'richtig', 'ergebnis', e -> 'ergebnis',
                  'loesung', public.nur_loesung(coalesce(p_a.loesung -> 'runden' -> (e ->> 'nr')::int ->> 'typ', p_a.typ),
                                                p_a.loesung -> 'runden' -> (e ->> 'nr')::int)))
                from jsonb_array_elements(p_d.ergebnisse) e), '[]'::jsonb)
  )
$$;

-- ---------- Eine Runde prüfen: Format der Runde, Merkdiktat-Grenze ----------
create or replace function public.runde_pruefen_um(p_s public.schueler, p_durchgang uuid, p_nr integer, p_antworten jsonb, p_jetzt timestamptz)
returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_d public.durchgaenge;
  v_a public.aufgaben;
  v_runde jsonb;
  v_typ text;
  v_erg jsonb;
  v_alt jsonb;
  v_abschluss jsonb := null;
  v_zeichen integer := 1;
  v_fehler integer;
  v_grenze numeric;
begin
  if p_antworten is null or jsonb_typeof(p_antworten) <> 'object' or length(p_antworten::text) > 20000 then
    raise exception 'Ungültige Antwort.' using errcode = '22023';
  end if;
  select * into v_d from public.durchgaenge where id = p_durchgang and schueler_id = p_s.id for update;
  if not found then
    raise exception 'Diese Übung ist dir nicht zugewiesen.' using errcode = 'P0002';
  end if;
  select * into v_a from public.aufgaben where id = v_d.aufgabe_id;
  v_runde := v_a.loesung -> 'runden' -> p_nr;
  v_typ := coalesce(v_runde ->> 'typ', v_a.typ);

  select e into v_alt from jsonb_array_elements(v_d.ergebnisse) e where (e ->> 'nr')::int = p_nr;
  if v_alt is not null then
    return jsonb_build_object('ergebnis', v_alt -> 'ergebnis', 'richtig', v_alt -> 'richtig',
      'loesung', public.nur_loesung(v_typ, v_runde), 'fertig', v_d.fertig_am is not null);
  end if;
  if v_d.fertig_am is not null or not (p_nr = any (v_d.runden)) then
    raise exception 'Diese Runde gehört nicht zu deiner Übung.' using errcode = '22023';
  end if;
  if v_a.archiviert or v_d.fassung <> v_a.geaendert_am then
    raise exception 'Deine Lehrkraft hat die Übung geändert. Starte sie bitte neu.' using errcode = 'P0002';
  end if;

  if v_typ = 'fallende_woerter' then
    v_fehler := case when jsonb_typeof(p_antworten -> 'fehler') = 'number' then least(999, greatest(0, (p_antworten ->> 'fehler')::numeric::int)) else 0 end;
    v_erg := jsonb_build_object('luecken', '[]'::jsonb, 'fehler', v_fehler,
      'gelandet', coalesce((p_antworten ->> 'gelandet')::boolean, false));
    v_erg := v_erg || jsonb_build_object('richtig', v_fehler = 0 and not (v_erg ->> 'gelandet')::boolean);
    v_erg := v_erg || jsonb_build_object('anteil', case when (v_erg ->> 'richtig')::boolean then 1 else 0 end);
  else
    v_erg := public.pruefe_aufgabe(v_typ, v_runde, p_antworten);
    if v_typ = 'diktat' then
      v_zeichen := greatest(1, length(public.diktat_norm(
        (select string_agg(s, ' ' order by n) from jsonb_array_elements_text(coalesce(v_runde -> 'saetze', '[]'::jsonb)) with ordinality x (s, n)))));
      -- Merkdiktat: ganz richtig trifft immer, sonst ab der Grenze der Lehrkraft; Abschreiben: ab 95 %
      v_grenze := least(100, greatest(50, coalesce((v_a.spiel ->> 'teil_grenze')::numeric, 100))) / 100;
      v_erg := v_erg || jsonb_build_object('richtig', case when v_runde ->> 'modus' = 'merken'
        then coalesce((v_erg ->> 'fehlerfrei')::boolean, false) or (v_erg ->> 'anteil')::numeric >= v_grenze
        else (v_erg ->> 'anteil')::numeric >= 0.95 end);
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
    'loesung', public.nur_loesung(v_typ, v_runde), 'fertig', v_abschluss is not null, 'abschluss', v_abschluss);
end
$$;

-- ---------- Sammelalbum: Übungen ohne Monster zählen nicht ----------
create or replace function public.schueler_album(p_token text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
begin
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', a.id, 'art', a.art, 'gesammelt', g.ja, 'name', case when g.ja then a.name end
    ) order by array_position(array['samen', 'baum', 'tier', 'deko'], a.art), a.reihenfolge, a.id)
    from public.shop_artikel a
    cross join lateral (
      select exists (select 1 from public.besitz b where b.schueler_id = v_s.id and b.artikel_id = a.id)
          or exists (select 1 from public.vorrat v where v.schueler_id = v_s.id and v.sorte = a.id)
          or exists (select 1 from public.pflanzungen p where p.schueler_id = v_s.id and p.sorte = a.id) as ja
    ) g
    where a.art in ('samen', 'baum', 'tier', 'deko')
  ), '[]'::jsonb) || coalesce((
    select jsonb_agg(jsonb_build_object('id', m.monster, 'art', 'monster', 'gesammelt', true, 'name', null) order by m.monster)
    from (
      select distinct a.monster
      from public.durchgaenge d
      join public.aufgaben a on a.id = d.aufgabe_id
      where d.schueler_id = v_s.id and d.befreundet and a.monster <> 'kein'
    ) m
  ), '[]'::jsonb);
end
$$;
