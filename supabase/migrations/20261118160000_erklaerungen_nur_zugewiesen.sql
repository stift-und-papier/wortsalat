-- Jazz 2026-11-17 (Antwort 9), umgesetzt 2026-11-18: Erklärseiten erscheinen unter „Erklärungen“ nur, wenn sie in einem Paket vorkommen,
-- das dem Kind (oder seiner Klasse) zugewiesen ist. Vorher sah ein Kind alle Erklärseiten seines Jahrgangs (Schlupfloch 5: Münzen fürs Antippen).
-- Schon gelesene Erklärseiten aus nicht zugewiesenen Paketen verschwinden aus der Liste; ihre Münzen bleiben.

create function public.erklaerung_zugewiesen(p_s public.schueler, p_aufgabe uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.paket_aufgaben pa join public.pakete p on p.id = pa.paket_id
    where pa.aufgabe_id = p_aufgabe and not p.archiviert
      and exists (select 1 from public.zuweisungen z where z.paket_id = p.id and (z.schueler_id = p_s.id or z.klasse_id = p_s.klasse_id))
  )
$$;
revoke execute on function public.erklaerung_zugewiesen(public.schueler, uuid) from public, anon, authenticated;

create or replace function public.erklaerungen_liste(p_token text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
begin
  return coalesce((
    select jsonb_agg(e order by e ->> 'bereich', e ->> 'titel')
    from (
      select jsonb_build_object(
        'id', a.id,
        'typ', a.typ,
        'titel', a.titel,
        'anweisung', a.anweisung,
        'farbig', a.farbig,
        'hinweis', a.hinweis,
        'stufe', a.stufe,
        'inhalt', a.inhalt,
        'versuche', (select count(*) from public.versuche v where v.schueler_id = v_s.id and v.aufgabe_id = a.id),
        'geloest', exists (select 1 from public.versuche v where v.schueler_id = v_s.id and v.aufgabe_id = a.id and v.richtig),
        'loesung_angesehen', false,
        'jahrgaenge', (select min(p.jahrgaenge) from public.paket_aufgaben pa join public.pakete p on p.id = pa.paket_id
                       where pa.aufgabe_id = a.id and p.jahrgaenge <> '{}'),
        'bereich', public.aufgabe_bereich(a.id, public.schueler_kc(v_s))
      ) as e
      from public.aufgaben a
      where a.typ = 'erklaerung' and not a.archiviert
        and a.owner = (select k.owner from public.klassen k where k.id = v_s.klasse_id)
        and public.erklaerung_zugewiesen(v_s, a.id)
    ) x
  ), '[]'::jsonb);
end
$$;

-- Abgeben („Gelesen“) geht nur noch für Erklärseiten aus zugewiesenen Paketen
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
          and exists (
            select 1 from public.zuweisungen z
            where z.paket_id = p_paket_id and (z.schueler_id = p_s.id or z.klasse_id = p_s.klasse_id)
          )
      )
    );
  if not found then
    raise exception 'Diese Aufgabe ist dir nicht zugewiesen.' using errcode = 'P0002';
  end if;
  return v_a;
end
$$;
