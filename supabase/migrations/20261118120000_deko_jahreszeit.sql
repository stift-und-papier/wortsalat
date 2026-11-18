-- Jazz 2026-11-18: Picknick weglassen; neu Truhe (Eiche, Silber, Gold), Kürbisgesicht (nur September bis November) und Geschenk (nur Dezember),
-- je kleine Plätze, Preisstufe B. Jahreszeit-Deko steht nur in ihren Monaten im Shop (shop_artikel.monate); Gekauftes bleibt immer.
-- Lagerfeuer ersetzt den wachsenden Lavendel (W2): Sticker im Album heißt jetzt wachs_lagerfeuer.
-- Picknick hatte nur das Testkonto Pfau-99 (Jazz: Testkonten dürfen sich ändern); der Kauf wird gelöscht, die Münzen kommen damit zurück.
delete from public.besitz where artikel_id = 'picknick';
delete from public.shop_artikel where id = 'picknick';

alter table public.shop_artikel add column monate integer[] check (monate <@ array[1,2,3,4,5,6,7,8,9,10,11,12]);
insert into public.shop_artikel (id, art, name, preis, ab_verdient, reihenfolge, platzart, monate) values
  ('truhe',          'deko', 'Truhe',          75, 600, 70, 'klein', null),
  ('kuerbisgesicht', 'deko', 'Kürbisgesicht',  75,   0, 73, 'klein', array[9, 10, 11]),
  ('geschenk',       'deko', 'Geschenk',       75,   0, 74, 'klein', array[12]);

-- Gibt es den Artikel in diesem Monat? (ohne Monate: immer)
create function public.in_der_saison(p_a public.shop_artikel) returns boolean
language sql stable set search_path = '' as $$
  select p_a.monate is null or extract(month from public.heute())::integer = any (p_a.monate)
$$;
revoke execute on function public.in_der_saison(public.shop_artikel) from public, anon, authenticated;

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
  if not found or v_a.ab_verdient is null or v_a.ab_verdient > public.verdient(v_s.id) or not public.in_der_saison(v_a) then
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
  if v_a.art = 'deko' and v_anzahl >= coalesce(v_a.hoechstens, public.deko_plaetze(v_a.platzart)) then
    raise exception '%', case when v_a.hoechstens = 1 then 'Das hast du schon. Davon passt nur eins auf deine Farm.' else 'Davon hast du schon so viele, wie Plätze auf deiner Farm sind.' end using errcode = 'P0001';
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
      from public.shop_artikel a where a.ab_verdient <= v_verdient and public.in_der_saison(a)
    ), '[]'::jsonb),
    'gesperrt', coalesce((
      select jsonb_agg(jsonb_build_object('art', a.art, 'fehlt', a.ab_verdient - v_verdient) order by a.ab_verdient, a.reihenfolge)
      from public.shop_artikel a where a.ab_verdient > v_verdient and public.in_der_saison(a)
    ), '[]'::jsonb)
  );
end
$$;

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
      (1, 'wachs_kirschbaum', 'Kirschbaum', array['W1']), (2, 'wachs_lagerfeuer', 'Lagerfeuer', array['W2']),
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
