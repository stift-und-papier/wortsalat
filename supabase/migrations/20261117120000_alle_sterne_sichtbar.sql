-- Jazz 2026-11-17: Alle Schüler:innen sehen alle Übungen eines zugewiesenen Pakets, egal mit wie vielen Sternen.
-- Keine automatische Zuordnung oder Steigerung mehr; welche Übungen ein Kind bekommt, entscheidet die Lehrkraft über die Pakete.
-- Sterne zeigen nur noch die Schwierigkeit (und gewichten weiter die Punkte im Lernstand).
-- Nichts wird gelöscht: schueler_stufen und schueler.stufe_manuell bleiben stehen, werden aber nicht mehr benutzt.

create or replace function public.sichtbare_aufgaben(p_s public.schueler, p_paket uuid) returns setof uuid
language sql stable set search_path = '' as $$
  select a.id
  from public.paket_aufgaben pa join public.aufgaben a on a.id = pa.aufgabe_id
  where pa.paket_id = p_paket and not a.archiviert
$$;

-- Automatischer Aufstieg aus: die Funktion bleibt (wird von mehreren Stellen aufgerufen), tut aber nichts mehr
create or replace function public.stufen_aktualisieren(p_s public.schueler) returns void
language plpgsql volatile security definer set search_path = '' as $$
begin
  return;
end
$$;
