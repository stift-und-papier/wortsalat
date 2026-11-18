-- Jazz 2026-11-17 (Antwort 8), umgesetzt 2026-11-18: „Ergebnisse zurücksetzen“ behält Münzen und Farm.
-- Gelöscht werden nur die Lernergebnisse (Antworten, Durchgänge, „Lösung angesehen“, Sterne-Stufen).
-- Es bleiben: Münz-Ereignisse (Kontostand), Besitz, Pflanzen, Vorrat, Belohnungen, wachsende Deko (wachstum_*), Farm-Monster.
-- Weil die Münz-Ereignisse bleiben, bringt dieselbe Übung nach dem Zurücksetzen keine Münzen doppelt (muenzen_fuer_durchgang zählt sie);
-- Belohnungen und Wachstumsschritte kommen aus demselben Grund nicht noch einmal. versuch_id in muenz_ereignisse wird beim Löschen leer (on delete set null).
create or replace function public.ergebnisse_zuruecksetzen(p_schueler uuid[]) returns integer
language plpgsql security definer set search_path = '' as $$
declare
  v_ids uuid[];
begin
  select coalesce(array_agg(id), '{}') into v_ids
  from public.schueler where id = any(p_schueler) and owner = (select auth.uid());
  delete from public.durchgaenge where schueler_id = any(v_ids);
  delete from public.versuche where schueler_id = any(v_ids);
  delete from public.loesung_angesehen where schueler_id = any(v_ids);
  delete from public.schueler_stufen where schueler_id = any(v_ids);
  return cardinality(v_ids);
end
$$;
