-- Jazz 2026-11-18: Ein Napf für alle Hühner reicht; wo der rechte Napf stand, ist jetzt der kleine Deko-Platz D21.
-- Damit gibt es 21 kleine Plätze (auch die Grenze für Mehrfachkäufe steigt auf 21). Nichts Gekauftes ändert sich.
create or replace function public.deko_platzart(p_platz text) returns text
language sql immutable set search_path = '' as $$
  select case
    when p_platz ~ '^B([1-9]|1[0-6])$' then 'beet'
    when p_platz ~ '^D([1-9]|1[0-9]|2[01])$' then 'klein'
    when p_platz ~ '^G[12]$' then 'gross'
    when p_platz ~ '^S[1-4]$' then 'wasser'
    when p_platz in ('brunnen', 'boot') then 'fest'
  end
$$;
create or replace function public.deko_plaetze(p_platzart text) returns integer
language sql immutable set search_path = '' as $$
  select case p_platzart when 'beet' then 16 when 'klein' then 21 when 'gross' then 2 when 'wasser' then 4 else 1 end
$$;
