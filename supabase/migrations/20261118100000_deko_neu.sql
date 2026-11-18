-- Neue kaufbare Deko (Jazz 2026-11-17, Schritt 3b): nur, was im Mockup der vollen Farm vorkommt. Vorläufige Preise nach Preisstufe
-- (A 30, B 75, C 160, D 250; Jazz: genaue Preise in Teilaufgabe 5), Freischalten nach verdienten Münzen wie die übrige Deko.
-- Große und bewegte Deko gibt es je einmal (shop_artikel.hoechstens); sonst so oft, wie Plätze dafür da sind.
alter table public.shop_artikel add column hoechstens integer check (hoechstens > 0);
insert into public.shop_artikel (id, art, name, preis, ab_verdient, reihenfolge, platzart, hoechstens) values
  ('klee',         'deko', 'Klee',          30,    0, 62, 'klein',  null),
  ('glockenblume', 'deko', 'Glockenblume',  30,  200, 63, 'beet',   null),
  ('fels',         'deko', 'Fels',          30,  600, 64, 'klein',  null),
  ('schild',       'deko', 'Holzschild',    75,  600, 65, 'klein',  null),
  ('baumstumpf',   'deko', 'Baumstumpf',    75,  600, 66, 'klein',  null),
  ('briefkasten',  'deko', 'Briefkasten',   75, 1200, 67, 'klein',  null),
  ('schilf',       'deko', 'Schilf',        75, 1200, 68, 'wasser', null),
  ('wassersteine', 'deko', 'Steine im Wasser', 75, 1200, 69, 'wasser', null),
  ('picknick',     'deko', 'Picknick',     160, 1200, 70, 'gross',  1),
  ('bienenstock',  'deko', 'Bienenstock',  250, 2200, 71, 'gross',  1),
  ('frosch',       'deko', 'Frosch',       250, 2200, 72, 'wasser', 1);

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
