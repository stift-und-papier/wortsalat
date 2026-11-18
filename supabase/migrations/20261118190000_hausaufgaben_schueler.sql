-- Klassen-Aufgaben Teilaufgabe 4 (Jazz 2026-11-18, Konzept docs/umbau/konzept-klassen-aufgaben.md, Abschnitt 2):
-- Schülerseite der Hausaufgaben. Nur Funktionen, keine Schemaänderung.
-- Während der Frist gilt nur die Versuchszahl (Tagesregel aus). Nach der Frist: nur ein angefangener Durchgang läuft weiter.
-- Ein Versuch zählt, wenn er nach dem Beginn (bzw. „Versuche neu geben“) begonnen und fertig gespielt wurde.

-- Hausaufgabe eines Pakets für ein Kind (wie kindStand in src/lib/hausaufgaben.ts). Keine Zeile: keine Hausaufgabe
-- (nie eine, freigegeben, oder für ein später gekommenes Kind ohne eigene Frist).
create function public.hausaufgabe_stand(p_s public.schueler, p_paket uuid)
returns table (ab timestamptz, frist timestamptz, versuche smallint)
language sql stable security definer set search_path = '' as $$
  select greatest(z.hausaufgabe_ab, e.neustart_ab),
         coalesce(e.frist, case when p_s.erstellt_am > z.hausaufgabe_ab then null else z.frist end),
         z.versuche_erlaubt
  from public.zuweisungen_fuer(p_s) z
  left join public.zuweisung_einzeln e on e.zuweisung_id = z.id and e.schueler_id = p_s.id
  where z.paket_id = p_paket and z.hausaufgabe_ab is not null
    and coalesce(e.freigegeben_am, z.freigegeben_am) is null
    and coalesce(e.frist, case when p_s.erstellt_am > z.hausaufgabe_ab then null else z.frist end) is not null
  order by (z.schueler_id is not null) desc
  limit 1
$$;
revoke execute on function public.hausaufgabe_stand(public.schueler, uuid) from public, anon, authenticated;

-- Gezählte Versuche einer Übung seit p_ab
create function public.hausaufgabe_versuche(p_schueler uuid, p_aufgabe uuid, p_ab timestamptz) returns integer
language sql stable security definer set search_path = '' as $$
  select count(*)::integer from public.durchgaenge
  where schueler_id = p_schueler and aufgabe_id = p_aufgabe and fertig_am is not null and begonnen_am >= p_ab
$$;
revoke execute on function public.hausaufgabe_versuche(uuid, uuid, timestamptz) from public, anon, authenticated;

-- Wie 20261113180000_uebung_doppelt.sql, dazu die Hausaufgabe vor dem Anlegen eines neuen Durchgangs
create or replace function public.uebung_starten_um(p_s public.schueler, p_paket_id uuid, p_aufgabe_id uuid, p_jetzt timestamptz) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_a public.aufgaben := public.zugewiesene_aufgabe(p_s, p_paket_id, p_aufgabe_id);
  v_d public.durchgaenge;
  v_frei date;
  v_h record;
begin
  if not public.ist_uebung(v_a) then
    raise exception 'Das ist keine Übung.' using errcode = '22023';
  end if;
  select * into v_d from public.durchgaenge
  where schueler_id = p_s.id and aufgabe_id = v_a.id and fertig_am is null
  for update;
  -- Lehrkraft hat die Übung geändert: angefangener Durchgang beginnt neu (Jazz, Schritt 5, Frage 5)
  if found and v_d.fassung <> v_a.geaendert_am then
    delete from public.durchgaenge where id = v_d.id;
    v_d := null;
  end if;
  -- angefangen: weiterspielen, auch nach der Frist
  if v_d.id is not null then
    return public.durchgang_daten(v_d, v_a);
  end if;

  select * into v_h from public.hausaufgabe_stand(p_s, p_paket_id);
  if found then
    if p_jetzt >= v_h.frist then
      return jsonb_build_object('status', 'vorbei', 'monster', v_a.monster, 'befreundet', public.befreundet(p_s.id, v_a.id));
    end if;
    if v_h.versuche is not null and public.hausaufgabe_versuche(p_s.id, v_a.id, v_h.ab) >= v_h.versuche then
      return jsonb_build_object('status', 'verbraucht', 'monster', v_a.monster, 'befreundet', public.befreundet(p_s.id, v_a.id));
    end if;
    -- laufende Hausaufgabe: Tagesregel aus
  else
    select max(frei_ab) into v_frei from public.durchgaenge
    where schueler_id = p_s.id and aufgabe_id = v_a.id and fertig_am is not null;
    if v_frei > public.berlin_tag(p_jetzt) then
      return jsonb_build_object('status', 'morgen', 'monster', v_a.monster, 'befreundet', public.befreundet(p_s.id, v_a.id));
    end if;
  end if;

  insert into public.durchgaenge (schueler_id, aufgabe_id, paket_id, tag, runden, fassung, begonnen_am)
  values (p_s.id, v_a.id, p_paket_id, public.berlin_tag(p_jetzt), public.runden_ziehen(p_s, v_a), v_a.geaendert_am, p_jetzt)
  on conflict (schueler_id, aufgabe_id) where fertig_am is null do nothing
  returning * into v_d;
  -- ein gleichzeitiger Aufruf war schneller: dessen Durchgang nehmen
  if v_d.id is null then
    select * into v_d from public.durchgaenge where schueler_id = p_s.id and aufgabe_id = v_a.id and fertig_am is null;
  end if;
  return public.durchgang_daten(v_d, v_a);
end
$$;

-- Wie 20261118170000_klassen_aufgaben.sql, dazu je Paket „hausaufgabe“ (Frist, Versuche, vorbei) und je Übung
-- „versuche_uebrig“ (null = beliebig oft oder keine Hausaufgabe) und „gesperrt“ (Frist vorbei oder alles verbraucht).
-- Pakete mit abgelaufener Frist fehlen, außer eine Übung darin ist angefangen. Laufende Hausaufgaben stehen oben (früheste Frist zuerst).
create or replace function public.schueler_start(p_token text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
  v_heute date := public.berlin_tag(now());
begin
  return jsonb_build_object(
    'pseudonym', v_s.pseudonym,
    'leseschrift', v_s.leseschrift,
    'figur', v_s.figur,
    'formate_geuebt', coalesce((
      select jsonb_agg(distinct a.typ) from public.versuche v join public.aufgaben a on a.id = v.aufgabe_id
      where v.schueler_id = v_s.id
    ), '[]'::jsonb),
    'pakete', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', p.id,
          'titel', p.titel,
          'beschreibung', p.beschreibung,
          'hausaufgabe', case when h.frist is not null then jsonb_build_object('frist', h.frist, 'versuche', h.versuche, 'vorbei', h.frist <= now()) end,
          'aufgaben', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'id', a.id,
                'typ', a.typ,
                'titel', a.titel,
                'anweisung', a.anweisung,
                'farbig', a.farbig,
                'hinweis', a.hinweis,
                'stufe', a.stufe,
                -- Übungen holen ihre Runden über uebung_starten
                'inhalt', case when public.ist_uebung(a) then null else a.inhalt end,
                'uebung', public.ist_uebung(a),
                'monster', a.monster,
                'versuche', (select count(*) from public.versuche v where v.schueler_id = v_s.id and v.aufgabe_id = a.id),
                'geloest', exists (select 1 from public.versuche v where v.schueler_id = v_s.id and v.aufgabe_id = a.id and v.richtig),
                'loesung_angesehen', exists (select 1 from public.loesung_angesehen l where l.schueler_id = v_s.id and l.aufgabe_id = a.id),
                'befreundet', public.befreundet(v_s.id, a.id),
                'angefangen', o.offen,
                'versuche_uebrig', case when public.ist_uebung(a) and h.frist > now() and h.versuche is not null
                                        then greatest(h.versuche - public.hausaufgabe_versuche(v_s.id, a.id, h.ab), 0) end,
                'gesperrt', public.ist_uebung(a) and h.frist is not null and not o.offen
                            and (h.frist <= now() or (h.versuche is not null and public.hausaufgabe_versuche(v_s.id, a.id, h.ab) >= h.versuche)),
                -- Tagesregel nur ohne Hausaufgabe
                'morgen', h.frist is null and not o.offen
                          and coalesce((select max(d.frei_ab) from public.durchgaenge d
                                        where d.schueler_id = v_s.id and d.aufgabe_id = a.id and d.fertig_am is not null) > v_heute, false)
              )
              order by pa.position, a.titel
            )
            from public.paket_aufgaben pa
            join public.aufgaben a on a.id = pa.aufgabe_id
            cross join lateral (
              select exists (select 1 from public.durchgaenge d where d.schueler_id = v_s.id and d.aufgabe_id = a.id and d.fertig_am is null) as offen
            ) o
            where pa.paket_id = p.id and a.id in (select public.sichtbare_aufgaben(v_s, p.id))
          ), '[]'::jsonb)
        )
        order by case when h.frist > now() then h.frist end nulls last, z.zugewiesen desc
      )
      from public.pakete p
      join lateral (
        select max(zw.erstellt_am) as zugewiesen
        from public.zuweisungen_fuer(v_s) zw
        where zw.paket_id = p.id
      ) z on z.zugewiesen is not null
      left join lateral public.hausaufgabe_stand(v_s, p.id) h on true
      where not p.archiviert
        and (h.frist is null or h.frist > now() or exists (
          select 1 from public.durchgaenge d join public.paket_aufgaben pa on pa.aufgabe_id = d.aufgabe_id and pa.paket_id = p.id
          where d.schueler_id = v_s.id and d.fertig_am is null
        ))
    ), '[]'::jsonb)
  );
end
$$;
