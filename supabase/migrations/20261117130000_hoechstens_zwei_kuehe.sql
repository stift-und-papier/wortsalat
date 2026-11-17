-- Jazz 2026-11-17 (Farm-Layout, docs/farm/layout-leer.md Abschnitt 7): Die Scheune hat 2 Plätze, darum verkauft der Shop höchstens 2 Kühe.
-- Schon gekaufte Kühe bleiben im Besitz (nur die Testfarm Pfau-99 hat 4; Jazz: Testkonten dürfen sich ändern).
create or replace function public.kaufen(p_token text, p_artikel text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
  v_a public.shop_artikel;
begin
  -- Sperre je Person: zwei gleichzeitige Käufe können den Kontostand nicht unterlaufen
  perform 1 from public.schueler where id = v_s.id for update;
  select * into v_a from public.shop_artikel where id = p_artikel;
  if not found or v_a.ab_verdient is null or v_a.ab_verdient > public.verdient(v_s.id) then
    raise exception 'Das gibt es im Shop noch nicht.' using errcode = 'P0001';
  end if;
  if public.kontostand(v_s.id) < v_a.preis then
    raise exception 'Dafür reichen deine Münzen noch nicht.' using errcode = 'P0001';
  end if;
  if v_a.art = 'feld' and (select count(*) from public.besitz where schueler_id = v_s.id and artikel_id = 'feld') >= 8 then
    raise exception 'Mehr Felder passen nicht auf deine Farm.' using errcode = 'P0001';
  end if;
  if v_a.id = 'kuh' and (select count(*) from public.besitz where schueler_id = v_s.id and artikel_id = 'kuh') >= 2 then
    raise exception 'In deine Scheune passen nur 2 Kühe.' using errcode = 'P0001';
  end if;
  if (v_a.art = 'baum' or v_a.id = 'boot') and exists (select 1 from public.besitz where schueler_id = v_s.id and artikel_id = v_a.id) then
    raise exception 'Das hast du schon. Davon passt nur eins auf deine Farm.' using errcode = 'P0001';
  end if;
  insert into public.besitz (schueler_id, artikel_id, preis) values (v_s.id, v_a.id, v_a.preis);
  return jsonb_build_object('kontostand', public.kontostand(v_s.id));
end
$$;
