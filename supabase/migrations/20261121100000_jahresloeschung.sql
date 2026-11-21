-- Aufgabe 43 (Jazz 2026-11-21): jährliche Löschung der Schülerdaten zum Schuljahresende.
-- Ab 1. August Hinweis in der Lehrkraft-Ansicht mit Knopf „Jetzt löschen“. Tut die Lehrkraft nichts, löscht der Server
-- ab 1. September (Europe/Berlin) selbst. Gelöscht werden Schüler:innen (Pseudonym, Link und alles, was daran hängt:
-- Antworten, Münzen, Farm, Hausaufgaben-Stand), die VOR dem 1. August angelegt wurden. Klassen, Übungen und Pakete bleiben.
-- Klassen, die die Lehrkraft weiterführt (klassen.weiter_im_jahr = Jahr), behalten Pseudonyme, Links, Münzen und Farm;
-- dort werden nur die Lernergebnisse von vor dem 1. August gelöscht (wie „Ergebnisse zurücksetzen“).

create extension if not exists pg_cron with schema pg_catalog;

alter table public.einstellungen
  add column loeschung_jahr smallint,                          -- Jahr der letzten Jahreslöschung
  add column loeschung_automatisch boolean not null default false; -- true = der Server hat gelöscht, nicht der Knopf
alter table public.klassen add column weiter_im_jahr smallint;  -- bei der Löschung in diesem Jahr weiterführen

-- Vor diesem Schuljahr gab es keine echten Daten: erste Löschung erst 2027.
update public.einstellungen set loeschung_jahr = 2026;

-- Kern der Löschung für eine Lehrkraft (nur intern; Datum als Jahr, damit der DB-Test es simulieren kann).
create function public.jahresloeschung_fuer(p_owner uuid, p_jahr smallint, p_automatisch boolean) returns integer
language plpgsql security definer set search_path = '' as $$
declare
  v_stichtag timestamptz := make_timestamptz(p_jahr, 8, 1, 0, 0, 0, 'Europe/Berlin');
  v_weiter uuid[];
  v_anzahl integer;
begin
  select coalesce(array_agg(s.id), '{}') into v_weiter
  from public.schueler s join public.klassen k on k.id = s.klasse_id
  where s.owner = p_owner and k.weiter_im_jahr = p_jahr and s.erstellt_am < v_stichtag;
  delete from public.durchgaenge where schueler_id = any(v_weiter) and begonnen_am < v_stichtag;
  delete from public.versuche where schueler_id = any(v_weiter) and gespeichert_am < v_stichtag;
  delete from public.loesung_angesehen where schueler_id = any(v_weiter) and angesehen_am < v_stichtag;
  delete from public.schueler_stufen where schueler_id = any(v_weiter);

  delete from public.schueler s using public.klassen k
  where k.id = s.klasse_id and s.owner = p_owner and s.erstellt_am < v_stichtag
    and k.weiter_im_jahr is distinct from p_jahr;
  get diagnostics v_anzahl = row_count;

  insert into public.einstellungen (owner, loeschung_jahr, loeschung_automatisch) values (p_owner, p_jahr, p_automatisch)
  on conflict (owner) do update set loeschung_jahr = excluded.loeschung_jahr, loeschung_automatisch = excluded.loeschung_automatisch;
  return v_anzahl;
end
$$;
revoke all on function public.jahresloeschung_fuer(uuid, smallint, boolean) from public, anon, authenticated;

-- Knopf der Lehrkraft: nur eigene Daten, ab 1. August, einmal im Jahr. Gibt die Zahl gelöschter Schüler:innen zurück.
create function public.jahresloeschung() returns integer
language plpgsql security definer set search_path = '' as $$
declare
  v_heute date := (now() at time zone 'Europe/Berlin')::date;
  v_jahr smallint := extract(year from v_heute);
begin
  if (select auth.uid()) is null then raise exception 'Bitte melden Sie sich an.'; end if;
  if extract(month from v_heute) < 8 then raise exception 'Die Löschung zum Schuljahresende ist erst ab 1. August möglich.'; end if;
  if (select loeschung_jahr from public.einstellungen where owner = (select auth.uid())) >= v_jahr then
    raise exception 'Die Daten wurden in diesem Jahr schon gelöscht.';
  end if;
  return public.jahresloeschung_fuer((select auth.uid()), v_jahr, false);
end
$$;
revoke all on function public.jahresloeschung() from public, anon;
grant execute on function public.jahresloeschung() to authenticated;

-- Automatisch ab 1. September für alle Lehrkräfte, die im August nicht gelöscht haben. Gibt die Zahl der Lehrkräfte zurück.
create function public.jahresloeschung_automatisch(p_heute date default (now() at time zone 'Europe/Berlin')::date) returns integer
language plpgsql security definer set search_path = '' as $$
declare
  v_jahr smallint := extract(year from p_heute);
  v_owner uuid;
  v_anzahl integer := 0;
begin
  if extract(month from p_heute) < 9 then return 0; end if;
  for v_owner in select owner from public.einstellungen where coalesce(loeschung_jahr, 0) < v_jahr loop
    perform public.jahresloeschung_fuer(v_owner, v_jahr, true);
    v_anzahl := v_anzahl + 1;
  end loop;
  return v_anzahl;
end
$$;
revoke all on function public.jahresloeschung_automatisch(date) from public, anon, authenticated;

-- Stündlich prüfen (fast immer ohne Wirkung). Stündlich statt einmal am 1. September, weil das kostenlose Projekt in den
-- Ferien einschlafen kann: nach dem Aufwecken holt der nächste Lauf die Löschung nach.
select cron.schedule('wortsalat-jahresloeschung', '17 * * * *', $$select public.jahresloeschung_automatisch()$$);
