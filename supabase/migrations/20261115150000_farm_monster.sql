-- Monster auf der Farm (Jazz 2026-11-15, Vorschlag angenommen):
-- Hat man sich mit demselben Monster in 4 verschiedenen Übungen angefreundet, zieht es auf die Farm (Fenster „Ein Monster möchte
-- bei dir wohnen!“). Immer nur ein Monster; wechseln unter „Farm einrichten“ (alle Monster mit 4 Freundschaften).
-- Montags und donnerstags legt es einen zufälligen Samen aus dem Shop neben sich (vorrat.liegt_bei = 'monster:<name>');
-- beim Einsammeln wird daraus ein Samen zum Pflanzen (besitz). Nach einer Pause gibt es nur den letzten fälligen Samen, nicht alle.

alter table public.schueler
  add column farm_monster text check (farm_monster ~ '^[a-z0-9_]{1,30}$'),
  add column farm_monster_neu boolean not null default false,
  add column monster_geschenk_am date;

alter table public.vorrat drop constraint vorrat_liegt_bei_check;
alter table public.vorrat add constraint vorrat_liegt_bei_check
  check (liegt_bei ~ '^(feld:\d+|(tier|baum):[0-9a-f-]{36}|monster:[a-z0-9_]{1,30})$');

-- Monster, mit denen man sich in mindestens 4 verschiedenen Übungen angefreundet hat (in der Reihenfolge, in der es soweit war)
create function public.monster_kandidaten(p_s public.schueler) returns text[]
language sql stable set search_path = '' as $$
  select coalesce(array_agg(m.monster order by m.vierte), '{}')
  from (
    select x.monster, (array_agg(x.erst order by x.erst))[4] as vierte
    from (
      select a.monster, a.id, min(d.fertig_am) as erst
      from public.durchgaenge d join public.aufgaben a on a.id = d.aufgabe_id
      where d.schueler_id = p_s.id and d.befreundet and a.monster <> 'kein'
      group by a.monster, a.id
    ) x
    group by x.monster
    having count(*) >= 4
  ) m
$$;

-- Beim Öffnen der Farm: neues Monster einziehen lassen, fälligen Samen hinlegen
create function public.farm_monster_pflegen(p_s public.schueler) returns void
language plpgsql volatile set search_path = '' as $$
declare
  v_s public.schueler := p_s;
  v_k text[] := public.monster_kandidaten(p_s);
  v_heute date := public.heute();
  -- letzter Montag oder Donnerstag bis heute (isodow: 1 = Montag, 4 = Donnerstag)
  v_tag date := v_heute - least((extract(isodow from v_heute)::int + 6) % 7, (extract(isodow from v_heute)::int + 3) % 7);
  v_samen text;
begin
  if v_s.farm_monster is null and cardinality(v_k) > 0 then
    update public.schueler set farm_monster = v_k[1], farm_monster_neu = true, monster_geschenk_am = v_heute
    where id = v_s.id returning * into v_s;
  end if;
  if v_s.farm_monster is not null and (v_s.monster_geschenk_am is null or v_s.monster_geschenk_am < v_tag) then
    select a.id into v_samen from public.shop_artikel a where a.art = 'samen' and a.ab_verdient is not null order by random() limit 1;
    if v_samen is not null then
      insert into public.vorrat (schueler_id, sorte, liegt_bei) values (v_s.id, v_samen, 'monster:' || v_s.farm_monster);
    end if;
    update public.schueler set monster_geschenk_am = v_heute where id = v_s.id;
  end if;
end
$$;
revoke execute on function public.monster_kandidaten(public.schueler), public.farm_monster_pflegen(public.schueler)
  from public, anon, authenticated;

-- Farm-Daten wie bisher, dazu das Monster
create or replace function public.farm_daten(p_s public.schueler) returns jsonb
language sql stable set search_path = '' as $$
  select jsonb_build_object(
    'felder', 4 + (select count(*) from public.besitz b where b.schueler_id = p_s.id and b.artikel_id = 'feld'),
    'pflanzen', coalesce((
      select jsonb_agg(jsonb_build_object(
        'feld', p.feld, 'sorte', p.sorte,
        'bild', case when w.schritte >= a.bedarf then 3 else least(2, w.schritte * 3 / a.bedarf) end,
        'reif', w.schritte >= a.bedarf
      ) order by p.feld)
      from public.pflanzungen p
      join public.shop_artikel a on a.id = p.sorte
      cross join lateral (select public.wachstum(p) as schritte) w
      where p.schueler_id = p_s.id
    ), '[]'::jsonb),
    'samen', coalesce((
      select jsonb_agg(jsonb_build_object('sorte', x.artikel_id, 'anzahl', x.n) order by x.artikel_id)
      from (
        select b.artikel_id, count(*) as n from public.besitz b join public.shop_artikel a on a.id = b.artikel_id
        where b.schueler_id = p_s.id and a.art = 'samen' and b.verbraucht_am is null group by b.artikel_id
      ) x
    ), '[]'::jsonb),
    'tiere', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', b.id, 'art', b.artikel_id,
        'satt', exists (select 1 from public.fuetterungen f where f.tier_id = b.id and f.tag = public.heute())
      ) order by b.erstellt_am, b.id)
      from public.besitz b join public.shop_artikel a on a.id = b.artikel_id
      where b.schueler_id = p_s.id and a.art = 'tier'
    ), '[]'::jsonb),
    'baeume', coalesce((
      select jsonb_agg(jsonb_build_object('id', b.id, 'art', b.artikel_id, 'tage', public.baum_tage(b)) order by b.artikel_id)
      from public.besitz b join public.shop_artikel a on a.id = b.artikel_id
      where b.schueler_id = p_s.id and a.art = 'baum'
    ), '[]'::jsonb),
    'dinge', coalesce((
      select jsonb_agg(jsonb_build_object('artikel', x.artikel_id, 'anzahl', x.n) order by x.artikel_id)
      from (
        select b.artikel_id, count(*) as n from public.besitz b join public.shop_artikel a on a.id = b.artikel_id
        where b.schueler_id = p_s.id and a.art in ('tier', 'deko') group by b.artikel_id
      ) x
    ), '[]'::jsonb),
    'vorrat', coalesce((
      select jsonb_agg(jsonb_build_object('sorte', x.sorte, 'anzahl', x.n) order by x.sorte)
      from (
        select v.sorte, count(*) as n from public.vorrat v
        where v.schueler_id = p_s.id and v.verbraucht_am is null and v.liegt_bei is null group by v.sorte
      ) x
    ), '[]'::jsonb),
    'liegen', coalesce((
      select jsonb_agg(jsonb_build_object('id', v.id, 'sorte', v.sorte, 'bei', v.liegt_bei) order by v.erstellt_am, v.id)
      from public.vorrat v
      where v.schueler_id = p_s.id and v.verbraucht_am is null and v.liegt_bei is not null
    ), '[]'::jsonb),
    'monster', s.farm_monster,
    'monster_neu', s.farm_monster_neu,
    'monster_wahl', to_jsonb(public.monster_kandidaten(s))
  )
  from public.schueler s where s.id = p_s.id
$$;

create or replace function public.schueler_farm(p_token text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
begin
  perform public.farm_monster_pflegen(v_s);
  return public.farm_daten(v_s);
end
$$;

-- Monster wählen (nur eines mit 4 Freundschaften); dasselbe nochmal wählen schließt das Willkommens-Fenster
create function public.farm_monster_waehlen(p_token text, p_monster text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
begin
  if not (p_monster = any (public.monster_kandidaten(v_s))) then
    raise exception 'Mit diesem Monster bist du noch nicht oft genug befreundet.' using errcode = 'P0001';
  end if;
  update public.schueler set farm_monster = p_monster, farm_monster_neu = false where id = v_s.id;
  return public.farm_daten(v_s);
end
$$;
revoke execute on function public.farm_monster_waehlen(text, text) from public, anon, authenticated;
grant execute on function public.farm_monster_waehlen(text, text) to anon, authenticated;

-- Einsammeln: Geschenk des Monsters wird ein Samen zum Pflanzen, alles andere kommt in den Vorrat
create or replace function public.einsammeln(p_token text, p_ding uuid) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
  v_v public.vorrat;
begin
  select * into v_v from public.vorrat
  where id = p_ding and schueler_id = v_s.id and verbraucht_am is null and liegt_bei is not null for update;
  if not found then raise exception 'Das liegt hier nicht (mehr).' using errcode = 'P0001'; end if;
  if v_v.liegt_bei like 'monster:%' then
    delete from public.vorrat where id = v_v.id;
    insert into public.besitz (schueler_id, artikel_id, preis) values (v_s.id, v_v.sorte, 0);
  else
    update public.vorrat set liegt_bei = null where id = v_v.id;
  end if;
  return public.farm_daten(v_s);
end
$$;
