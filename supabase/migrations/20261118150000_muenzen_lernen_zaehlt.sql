-- Münzsystem Modell A „Lernen zählt“ (docs/farm/muenzen-vorschlag.md, Jazz 2026-11-18: M1 bis M9).
-- Bestand (M7): Kontostände und Gekauftes bleiben. Gekauftes behält seinen alten Kaufpreis (besitz.preis), neue Preise gelten nur für neue Käufe.

-- M1/M9: Fürs Freischalten zählen Verkäufe ab jetzt nicht mehr. Was bis heute durch Verkauf verdient wurde, zählt weiter (M7, nichts wird weggenommen).
-- Geschenke der Lehrkraft zählen weiter (die Lehrkraft entscheidet selbst darüber).
create or replace function public.verdient(p_schueler uuid) returns integer
language sql stable set search_path = '' as $$
  select coalesce(sum(muenzen), 0)::integer from public.muenz_ereignisse
  where schueler_id = p_schueler and (grund <> 'verkauf' or erstellt_am < timestamptz '2026-11-18 18:00:00+01')
$$;

-- M1: kleine Gewinnspannen. Ernte = Samenpreis + 5 (Samenpreise bleiben, M5).
update public.shop_artikel set verkauf = preis + 5 where art = 'samen' and preis > 0;
-- Ei und Milch: teuerster Futtersamen der Güte + 5 (Ei) bzw. + 10 (Milch), so macht Füttern nie Verlust
-- (Güte 1: Samen bis 20, Güte 2: bis 35, Güte 3: bis 45). Rechnung im Vorschlag: Futter + 5 / + 10.
update public.shop_artikel set verkauf = v.verkauf from (values
  ('ei', 25), ('milch', 30), ('ei_rosa', 40), ('milch_erdbeer', 45), ('ei_blau', 50), ('milch_blaubeer', 55),
  -- M6: Obst etwa halb so viel wie bisher, Bäume tragen nur noch alle 14 Tage
  ('orange', 15), ('pfirsich', 18), ('birne', 20)
) as v(id, verkauf) where public.shop_artikel.id = v.id;

-- M2: Dauerhaftes kostet doppelt so viel (Felder, Tiere, Bäume, Deko); Samen und Belohnungen (Preis 0) bleiben.
update public.shop_artikel set preis = preis * 2 where art in ('feld', 'tier', 'baum', 'deko') and preis > 0;

-- M6: Obstbäume tragen alle 14 Tage
create or replace function public.baum_tage(p_b public.besitz) returns integer
language sql stable set search_path = '' as $$
  select case when p_b.geerntet_am is null then 0
    else greatest(0, 14 - (public.heute() - (p_b.geerntet_am at time zone 'Europe/Berlin')::date)) end
$$;
