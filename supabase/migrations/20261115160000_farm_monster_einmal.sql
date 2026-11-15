-- Farm-Monster: zwei gleichzeitige Aufrufe von schueler_farm legten zwei Samen hin (im Browser getestet).
-- Jetzt entscheidet ein bedingtes UPDATE (wartet auf den anderen Aufruf und prüft dann neu), ob es etwas zu tun gibt.
create or replace function public.farm_monster_pflegen(p_s public.schueler) returns void
language plpgsql volatile set search_path = '' as $$
declare
  v_k text[] := public.monster_kandidaten(p_s);
  v_heute date := public.heute();
  -- letzter Montag oder Donnerstag bis heute (isodow: 1 = Montag, 4 = Donnerstag)
  v_tag date := v_heute - least((extract(isodow from v_heute)::int + 6) % 7, (extract(isodow from v_heute)::int + 3) % 7);
  v_monster text;
  v_samen text;
begin
  if cardinality(v_k) > 0 then
    update public.schueler set farm_monster = v_k[1], farm_monster_neu = true, monster_geschenk_am = v_heute
    where id = p_s.id and farm_monster is null;
  end if;
  update public.schueler set monster_geschenk_am = v_heute
  where id = p_s.id and farm_monster is not null and (monster_geschenk_am is null or monster_geschenk_am < v_tag)
  returning farm_monster into v_monster;
  if v_monster is not null then
    select a.id into v_samen from public.shop_artikel a where a.art = 'samen' and a.ab_verdient is not null order by random() limit 1;
    if v_samen is not null then
      insert into public.vorrat (schueler_id, sorte, liegt_bei) values (p_s.id, v_samen, 'monster:' || v_monster);
    end if;
  end if;
end
$$;
