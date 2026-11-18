-- Shop: Platzart mitgeben, damit die Karte sagt, wohin die Deko passt (dekorationen.md 5.1: „für ein Beet“ …)
create or replace function public.schueler_shop(p_token text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
  v_verdient integer := public.verdient(v_s.id);
begin
  return jsonb_build_object(
    'kontostand', public.kontostand(v_s.id),
    'angebot', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', a.id, 'art', a.art, 'name', a.name, 'preis', a.preis, 'platzart', a.platzart,
        'besitz', (select count(*) from public.besitz b where b.schueler_id = v_s.id and b.artikel_id = a.id and b.verbraucht_am is null)
      ) order by a.reihenfolge)
      from public.shop_artikel a where a.ab_verdient <= v_verdient
    ), '[]'::jsonb),
    'gesperrt', coalesce((
      select jsonb_agg(jsonb_build_object('art', a.art, 'fehlt', a.ab_verdient - v_verdient) order by a.ab_verdient, a.reihenfolge)
      from public.shop_artikel a where a.ab_verdient > v_verdient
    ), '[]'::jsonb)
  );
end
$$;
