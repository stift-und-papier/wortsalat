-- Kaufbare Deko mit Plätzen und Farben (docs/farm/dekorationen.md Abschnitt 5, Jazz 2026-11-17, Schritt 3a):
-- Jeder Laden-Artikel der Art „deko“ hat eine Platzart: beet (16 Beet-Plätze B1–B16), klein (D1–D20), gross (G1, G2), wasser (S1–S4)
-- oder fest (Brunnen, Boot: eigener Platz mit dem Namen des Artikels). Gekaufte Deko hat einen Platz (leer = liegt in der Truhe)
-- und eine Farbe (laufende Nummer je Artikel; welche Farben es gibt, weiß die App). Kein Kauf geht verloren.

alter table public.shop_artikel add column platzart text check (platzart in ('beet', 'klein', 'gross', 'wasser', 'fest'));
update public.shop_artikel set platzart = case
  when id in ('blume_gelb', 'blume_lila', 'katze_rosa', 'katze_blau') then 'beet'
  when id in ('busch', 'pilz', 'stein', 'pilzhaus') then 'klein'
  when id in ('brunnen', 'boot') then 'fest'
end where art = 'deko';
-- Jazz: Gelb gibt es nur noch bei der wachsenden Sonnenblume; die Blume kommt in Rosa, Blau, Lila, Weiß, Orange
update public.shop_artikel set name = 'Blume' where id = 'blume_gelb';
update public.shop_artikel set name = 'Traubenblume' where id = 'blume_lila';

alter table public.besitz add column platz text, add column farbe integer not null default 0 check (farbe >= 0);
create unique index besitz_ein_ding_je_platz on public.besitz (schueler_id, platz) where platz is not null;

-- Platzart eines Platzes (null = gibt es nicht)
create function public.deko_platzart(p_platz text) returns text
language sql immutable set search_path = '' as $$
  select case
    when p_platz ~ '^B([1-9]|1[0-6])$' then 'beet'
    when p_platz ~ '^D([1-9]|1[0-9]|20)$' then 'klein'
    when p_platz ~ '^G[12]$' then 'gross'
    when p_platz ~ '^S[1-4]$' then 'wasser'
    when p_platz in ('brunnen', 'boot') then 'fest'
  end
$$;
-- Wie viele Plätze es je Platzart gibt (Grenze für Mehrfachkäufe)
create function public.deko_plaetze(p_platzart text) returns integer
language sql immutable set search_path = '' as $$
  select case p_platzart when 'beet' then 16 when 'klein' then 20 when 'gross' then 2 when 'wasser' then 4 else 1 end
$$;

-- Schon Gekauftes wie bisher aufstellen: Reihenfolge wie die Farm es bisher zeigte (nach Artikel, dann Kaufzeit);
-- Farben in Kaufreihenfolge (Jazz: Testkonten dürfen sich ändern, auch die gelbe Blume bekommt eine Farbe)
with deko as (
  select b.id, a.platzart, a.id as artikel,
    row_number() over (partition by b.schueler_id, a.platzart order by a.id, b.erstellt_am, b.id) as nr,
    row_number() over (partition by b.schueler_id, a.id order by b.erstellt_am, b.id) - 1 as farbe
  from public.besitz b join public.shop_artikel a on a.id = b.artikel_id
  where a.art = 'deko'
)
update public.besitz b set farbe = d.farbe, platz = case
    when d.platzart = 'fest' and d.nr = 1 then d.artikel
    when d.platzart = 'beet' and d.nr <= 16 then 'B' || d.nr
    when d.platzart = 'klein' and d.nr <= 20 then 'D' || d.nr
  end
from deko d where d.id = b.id;

-- Kaufen: wie bisher, dazu Farbe vergeben und Grenze „so oft, wie Plätze da sind“; gibt die Nummer des neuen Besitzes zurück
create or replace function public.kaufen(p_token text, p_artikel text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
  v_a public.shop_artikel;
  v_anzahl integer;
  v_id uuid;
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
  select count(*) into v_anzahl from public.besitz where schueler_id = v_s.id and artikel_id = v_a.id;
  if v_a.art = 'feld' and v_anzahl >= 8 then
    raise exception 'Mehr Felder passen nicht auf deine Farm.' using errcode = 'P0001';
  end if;
  if (v_a.art = 'baum' or v_a.platzart = 'fest') and v_anzahl > 0 then
    raise exception 'Das hast du schon. Davon passt nur eins auf deine Farm.' using errcode = 'P0001';
  end if;
  if v_a.art = 'deko' and v_anzahl >= public.deko_plaetze(v_a.platzart) then
    raise exception 'Davon hast du schon so viele, wie Plätze auf deiner Farm sind.' using errcode = 'P0001';
  end if;
  if v_a.id = 'kuh' and v_anzahl >= 2 then
    raise exception 'In deine Scheune passen nur 2 Kühe.' using errcode = 'P0001';
  end if;
  insert into public.besitz (schueler_id, artikel_id, preis, farbe, platz)
  values (v_s.id, v_a.id, v_a.preis, v_anzahl, case when v_a.platzart = 'fest' then v_a.id end)
  returning id into v_id;
  return jsonb_build_object('kontostand', public.kontostand(v_s.id), 'besitz', v_id, 'platzart', v_a.platzart);
end
$$;

-- Aufstellen, tauschen, wegräumen: p_platz = null legt die Deko in die Truhe. Steht dort schon etwas, kommt es in die Truhe.
create function public.deko_aufstellen(p_token text, p_besitz uuid, p_platz text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
  v_platzart text;
begin
  select a.platzart into v_platzart from public.besitz b join public.shop_artikel a on a.id = b.artikel_id
  where b.id = p_besitz and b.schueler_id = v_s.id and a.art = 'deko' for update of b;
  if not found then raise exception 'Diese Deko gehört dir nicht.' using errcode = 'P0001'; end if;
  if p_platz is not null then
    if public.deko_platzart(p_platz) is distinct from v_platzart
       or v_platzart = 'fest' and p_platz <> (select artikel_id from public.besitz where id = p_besitz) then
      raise exception 'Das passt dort nicht hin.' using errcode = 'P0001';
    end if;
    update public.besitz set platz = null where schueler_id = v_s.id and platz = p_platz and id <> p_besitz;
  end if;
  update public.besitz set platz = p_platz where id = p_besitz;
  return public.farm_daten(v_s);
end
$$;
revoke execute on function public.deko_aufstellen(text, uuid, text) from public;
grant execute on function public.deko_aufstellen(text, uuid, text) to anon, authenticated;
revoke execute on function public.deko_platzart(text), public.deko_plaetze(text) from public, anon, authenticated;

-- Farm-Daten: zusätzlich jede gekaufte Deko einzeln mit Platz und Farbe („dinge“ zählt weiter Tiere und Deko je Artikel)
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
    'deko', coalesce((
      select jsonb_agg(jsonb_build_object('id', b.id, 'artikel', b.artikel_id, 'platzart', a.platzart, 'platz', b.platz, 'farbe', b.farbe)
        order by a.reihenfolge, b.erstellt_am, b.id)
      from public.besitz b join public.shop_artikel a on a.id = b.artikel_id
      where b.schueler_id = p_s.id and a.art = 'deko'
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
