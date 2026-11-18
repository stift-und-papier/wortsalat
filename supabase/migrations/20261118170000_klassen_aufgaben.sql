-- Klassen-Aufgaben Teilaufgabe 2 (Jazz 2026-11-18, Konzept docs/umbau/konzept-klassen-aufgaben.md, Abschnitt 2):
-- Zuteilen und Herausnehmen auf der Klassenseite. Herausnehmen blendet nur aus, Ergebnisse bleiben.
-- Die Hausaufgaben-Spalten kommen schon jetzt dazu (Teilaufgabe 3 und 4 nutzen sie), damit es nur eine Schemaänderung gibt.

alter table public.zuweisungen
  add column entfernt_am timestamptz,
  add column hausaufgabe_ab timestamptz,
  add column frist timestamptz,
  add column versuche_erlaubt smallint check (versuche_erlaubt between 1 and 20), -- null = beliebig oft
  add column freigegeben_am timestamptz;

-- Je Paket höchstens eine wirksame Klassen- bzw. Einzel-Zuteilung; ausgeblendete bleiben als Verlauf stehen.
drop index public.zuweisungen_paket_id_klasse_id_idx;
drop index public.zuweisungen_paket_id_schueler_id_idx;
create unique index zuweisungen_paket_klasse_aktiv on public.zuweisungen (paket_id, klasse_id) where klasse_id is not null and entfernt_am is null;
create unique index zuweisungen_paket_schueler_aktiv on public.zuweisungen (paket_id, schueler_id) where schueler_id is not null and entfernt_am is null;

-- Was nur für ein Kind einer Zuteilung gilt. Wirksam ist: Angabe hier, sonst die der Zuteilung.
create table public.zuweisung_einzeln (
  zuweisung_id uuid not null references public.zuweisungen (id) on delete cascade,
  schueler_id uuid not null references public.schueler (id) on delete cascade,
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  entfernt_am timestamptz,    -- aus einer Klassen-Zuteilung herausgenommen
  neustart_ab timestamptz,    -- Versuche neu gegeben (Teilaufgabe 3)
  frist timestamptz,          -- eigene Frist (Teilaufgabe 3)
  freigegeben_am timestamptz, -- nur für dieses Kind unbegrenzt freigegeben (Teilaufgabe 3)
  primary key (zuweisung_id, schueler_id)
);
create index on public.zuweisung_einzeln (schueler_id);
alter table public.zuweisung_einzeln enable row level security;
revoke all on public.zuweisung_einzeln from anon;
create policy "Lehrkraft: eigene Einzel-Angaben" on public.zuweisung_einzeln
  for all to authenticated
  using (owner = (select auth.uid()))
  with check (
    owner = (select auth.uid())
    and exists (select 1 from public.zuweisungen z where z.id = zuweisung_id and z.owner = (select auth.uid()))
    and exists (select 1 from public.schueler s where s.id = schueler_id and s.owner = (select auth.uid()))
  );

-- Zuteilungen, die für ein Kind gerade gelten (Teilaufgabe 4 ergänzt hier Frist und Versuche)
create function public.zuweisungen_fuer(p_s public.schueler) returns setof public.zuweisungen
language sql stable security definer set search_path = '' as $$
  select z.* from public.zuweisungen z
  where z.entfernt_am is null
    and (z.schueler_id = p_s.id or z.klasse_id = p_s.klasse_id)
    and not exists (
      select 1 from public.zuweisung_einzeln e
      where e.zuweisung_id = z.id and e.schueler_id = p_s.id and e.entfernt_am is not null
    )
$$;
revoke execute on function public.zuweisungen_fuer(public.schueler) from public, anon, authenticated;

/** Pakete zuteilen. p_schueler = null oder alle Kinder der Klasse: Klassen-Zuteilung (neue Kinder bekommen sie mit).
    Sonst je Kind eine Einzel-Zuteilung. Eine neue Zuteilung ersetzt die alte desselben Pakets für dieselben Kinder. */
create function public.zuteilen(p_pakete uuid[], p_klasse uuid, p_schueler uuid[] default null) returns integer
language plpgsql security invoker set search_path = '' as $$
declare
  v_alle uuid[];
  v_kinder uuid[];
  v_p uuid;
  v_klassen_zw uuid;
begin
  -- RLS: nur eigene Klassen, Kinder und Pakete sind sichtbar
  if not exists (select 1 from public.klassen k where k.id = p_klasse) then
    raise exception 'Diese Klasse gibt es nicht.' using errcode = 'P0002';
  end if;
  select coalesce(array_agg(s.id), '{}') into v_alle from public.schueler s where s.klasse_id = p_klasse;
  if p_schueler is not null then
    select coalesce(array_agg(s.id), '{}') into v_kinder from public.schueler s where s.klasse_id = p_klasse and s.id = any (p_schueler);
    if cardinality(v_kinder) = 0 then
      raise exception 'Bitte mindestens eine Schülerin oder einen Schüler auswählen.' using errcode = '22023';
    end if;
    if v_alle <@ v_kinder then v_kinder := null; end if; -- alle angetippt = ganze Klasse
  end if;

  foreach v_p in array p_pakete loop
    if not exists (select 1 from public.pakete p where p.id = v_p and not p.archiviert) then
      raise exception 'Dieses Paket gibt es nicht mehr oder es ist archiviert.' using errcode = 'P0002';
    end if;
    if v_kinder is null then
      update public.zuweisungen set entfernt_am = now()
      where paket_id = v_p and entfernt_am is null and (klasse_id = p_klasse or schueler_id = any (v_alle));
      insert into public.zuweisungen (paket_id, klasse_id) values (v_p, p_klasse);
    else
      update public.zuweisungen set entfernt_am = now()
      where paket_id = v_p and entfernt_am is null and schueler_id = any (v_kinder);
      select id into v_klassen_zw from public.zuweisungen where paket_id = v_p and klasse_id = p_klasse and entfernt_am is null;
      if v_klassen_zw is not null then
        insert into public.zuweisung_einzeln (zuweisung_id, schueler_id, entfernt_am)
        select v_klassen_zw, k, now() from unnest(v_kinder) k
        on conflict (zuweisung_id, schueler_id) do update set entfernt_am = coalesce(public.zuweisung_einzeln.entfernt_am, excluded.entfernt_am);
      end if;
      insert into public.zuweisungen (paket_id, schueler_id) select v_p, k from unnest(v_kinder) k;
    end if;
  end loop;
  return cardinality(p_pakete);
end
$$;
revoke execute on function public.zuteilen(uuid[], uuid, uuid[]) from public, anon;
grant execute on function public.zuteilen(uuid[], uuid, uuid[]) to authenticated;

/** Ein Paket in einer Klasse herausnehmen (nur ausblenden). p_schueler = null: für alle Kinder der Klasse;
    sonst nur für diese Kinder, eine Klassen-Zuteilung bleibt für die anderen und für neue Kinder bestehen. */
create function public.herausnehmen(p_paket uuid, p_klasse uuid, p_schueler uuid[] default null) returns integer
language plpgsql security invoker set search_path = '' as $$
declare
  v_kinder uuid[];
  v_n integer;
  v_m integer := 0;
begin
  select coalesce(array_agg(s.id), '{}') into v_kinder from public.schueler s
  where s.klasse_id = p_klasse and (p_schueler is null or s.id = any (p_schueler));
  update public.zuweisungen set entfernt_am = now()
  where paket_id = p_paket and entfernt_am is null
    and (schueler_id = any (v_kinder) or (p_schueler is null and klasse_id = p_klasse));
  get diagnostics v_n = row_count;
  if p_schueler is not null then
    insert into public.zuweisung_einzeln (zuweisung_id, schueler_id, entfernt_am)
    select z.id, k, now() from public.zuweisungen z cross join unnest(v_kinder) k
    where z.paket_id = p_paket and z.klasse_id = p_klasse and z.entfernt_am is null
    on conflict (zuweisung_id, schueler_id) do update set entfernt_am = coalesce(public.zuweisung_einzeln.entfernt_am, excluded.entfernt_am);
    get diagnostics v_m = row_count;
  end if;
  return v_n + v_m;
end
$$;
revoke execute on function public.herausnehmen(uuid, uuid, uuid[]) from public, anon;
grant execute on function public.herausnehmen(uuid, uuid, uuid[]) to authenticated;

-- Schüler-Funktionen: nur noch wirksame Zuteilungen zählen (sonst unverändert)
create or replace function public.erklaerung_zugewiesen(p_s public.schueler, p_aufgabe uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.paket_aufgaben pa join public.pakete p on p.id = pa.paket_id
    where pa.aufgabe_id = p_aufgabe and not p.archiviert
      and exists (select 1 from public.zuweisungen_fuer(p_s) z where z.paket_id = p.id)
  )
$$;

create or replace function public.zugewiesene_aufgabe(p_s public.schueler, p_paket_id uuid, p_aufgabe_id uuid) returns public.aufgaben
language plpgsql stable security definer set search_path = '' as $$
declare
  v_a public.aufgaben;
begin
  select a.* into v_a
  from public.aufgaben a
  where a.id = p_aufgabe_id
    and not a.archiviert
    and (
      (a.typ = 'erklaerung' and a.owner = (select k.owner from public.klassen k where k.id = p_s.klasse_id)
        and public.erklaerung_zugewiesen(p_s, a.id))
      or exists (
        select 1 from public.paket_aufgaben pa join public.pakete p on p.id = pa.paket_id
        where pa.aufgabe_id = a.id and pa.paket_id = p_paket_id and not p.archiviert
          and exists (select 1 from public.zuweisungen_fuer(p_s) z where z.paket_id = p_paket_id)
      )
    );
  if not found then
    raise exception 'Diese Aufgabe ist dir nicht zugewiesen.' using errcode = 'P0002';
  end if;
  return v_a;
end
$$;

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
                'angefangen', exists (select 1 from public.durchgaenge d where d.schueler_id = v_s.id and d.aufgabe_id = a.id and d.fertig_am is null),
                'morgen', not exists (select 1 from public.durchgaenge d where d.schueler_id = v_s.id and d.aufgabe_id = a.id and d.fertig_am is null)
                          and coalesce((select max(d.frei_ab) from public.durchgaenge d
                                        where d.schueler_id = v_s.id and d.aufgabe_id = a.id and d.fertig_am is not null) > v_heute, false)
              )
              order by pa.position, a.titel
            )
            from public.paket_aufgaben pa
            join public.aufgaben a on a.id = pa.aufgabe_id
            where pa.paket_id = p.id and a.id in (select public.sichtbare_aufgaben(v_s, p.id))
          ), '[]'::jsonb)
        )
        order by z.zugewiesen desc
      )
      from public.pakete p
      join lateral (
        select max(zw.erstellt_am) as zugewiesen
        from public.zuweisungen_fuer(v_s) zw
        where zw.paket_id = p.id
      ) z on z.zugewiesen is not null
      where not p.archiviert
    ), '[]'::jsonb)
  );
end
$$;
