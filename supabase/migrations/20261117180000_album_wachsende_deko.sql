-- Sammelalbum (Jazz 2026-11-17): ausgewachsene wachsende Deko bekommt einen Sticker (Seite Deko, nach der gekauften Deko).
-- Gesammelt, sobald die Deko ihre letzte Stufe erreicht hat; beide Sonnenblumen (W3, W8) teilen sich einen Sticker.
-- Die ids sind die Schlüssel in STICKER_NUMMER (src/grafik/index.ts). Sonst unverändert wie in runden_optionen.
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
    select jsonb_agg(jsonb_build_object('id', w.id, 'art', 'deko', 'gesammelt', g.ja, 'name', case when g.ja then w.name end) order by w.nr)
    from (values
      (1, 'wachs_kirschbaum', 'Kirschbaum', array['W1']), (2, 'wachs_lavendel', 'Lavendel', array['W2']),
      (3, 'wachs_sonnenblume', 'Sonnenblume', array['W3', 'W8']), (4, 'wachs_seerose', 'Seerose', array['W4']),
      (5, 'wachs_beerenbusch', 'Beerenbusch', array['W5']), (6, 'wachs_vogelhaus', 'Vogelhaus', array['W6']),
      (7, 'wachs_eiche', 'Eiche', array['W7'])
    ) w (nr, id, name, deko)
    cross join lateral (
      select exists (
        select 1 from public.wachstum_stufen st
        join public.wachstum_verteilen(26) m on m.w_deko = st.deko
        where st.schueler_id = v_s.id and st.deko = any (w.deko) and st.stufe >= m.w_stufe
      ) as ja
    ) g
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
