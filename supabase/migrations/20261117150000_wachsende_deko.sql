-- Wachsende Deko (docs/farm/dekorationen.md Abschnitt 3 und 4, Jazz 2026-11-17):
-- 8 Dekorationen (W1 bis W8) stehen von Anfang an auf der Farm und wachsen, wenn das Kind dazulernt.
-- Je Kompetenz einmal: „neu“ (erster Lernstand), „besser“, „deutlich“ (springt eine Kompetenz direkt auf „deutlich“, zählen beide).
-- Jeder Schritt geht an die Deko, die am wenigsten weit ist (Gleichstand: W1 zuerst). Nichts wächst je zurück.
-- Kinder bekommen nur Stufen, nie Kompetenz, Punkte oder Anzahl der Schritte. „Ergebnisse zurücksetzen“ lässt beide Tabellen stehen.

create table public.wachstum_ereignisse (
  schueler_id uuid not null references public.schueler (id) on delete cascade,
  kompetenz_id uuid not null, -- bewusst ohne Verknüpfung: Löschen einer Kompetenz nimmt keinen Schritt zurück
  art text not null check (art in ('neu', 'besser', 'deutlich')),
  erstellt_am timestamptz not null default now(),
  primary key (schueler_id, kompetenz_id, art)
);
alter table public.wachstum_ereignisse enable row level security;
create policy "Lehrkraft: Wachstum eigener Schüler:innen lesen" on public.wachstum_ereignisse
  for select to authenticated
  using (exists (select 1 from public.schueler s where s.id = schueler_id and s.owner = (select auth.uid())));
grant select on public.wachstum_ereignisse to authenticated;

create table public.wachstum_stufen (
  schueler_id uuid not null references public.schueler (id) on delete cascade,
  deko text not null check (deko in ('W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8')),
  stufe integer not null check (stufe between 1 and 5),
  gewachsen_am timestamptz,
  gesehen boolean not null default true,
  primary key (schueler_id, deko)
);
alter table public.wachstum_stufen enable row level security;
create policy "Lehrkraft: Stufen eigener Schüler:innen lesen" on public.wachstum_stufen
  for select to authenticated
  using (exists (select 1 from public.schueler s where s.id = schueler_id and s.owner = (select auth.uid())));
grant select on public.wachstum_stufen to authenticated;

-- Stufen nach n Schritten. Stufenzahl je Deko: Kirschbaum 5, Wildblumen 4, Sonnenblume 4, Seerosen 4, Beerenbusch 3,
-- Vogelhaus 5, Eiche 5, Sonnenblume 4 (zusammen 26 Schritte bis ausgewachsen). Muss zu WACHSENDE_DEKO in src/lib/landschaft.ts passen.
create function public.wachstum_verteilen(p_schritte integer) returns table (w_deko text, w_stufe integer)
language plpgsql immutable set search_path = '' as $$
declare
  v_name text[] := array['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'];
  v_max integer[] := array[5, 4, 4, 4, 3, 5, 5, 4];
  v_st integer[] := array[1, 1, 1, 1, 1, 1, 1, 1];
  v_best integer;
begin
  for i in 1 .. least(greatest(p_schritte, 0), 26) loop
    v_best := null;
    for j in 1 .. 8 loop
      if v_st[j] < v_max[j] and (v_best is null
         or (v_st[j] - 1)::numeric / (v_max[j] - 1) < (v_st[v_best] - 1)::numeric / (v_max[v_best] - 1)) then
        v_best := j;
      end if;
    end loop;
    v_st[v_best] := v_st[v_best] + 1;
  end loop;
  return query select v_name[k], v_st[k] from generate_subscripts(v_name, 1) k order by k;
end
$$;

-- Neue Schritte eintragen, Stufen nur erhöhen, alle Stufen zurückgeben ("neu" = gewachsen und noch nicht gezeigt)
create function public.wachstum_holen(p_token text) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
  v_kc text := public.schueler_kc(v_s);
  e public.einstellungen;
  r record;
  a jsonb;
  v_kat text;
  v_n integer;
begin
  select * into e from public.einstellungen where owner = v_s.owner;
  if v_kc is not null and e.owner is not null then
    for r in
      select k.id from public.kompetenzen k
      where k.owner = v_s.owner and k.kerncurriculum = v_kc and not k.ausgeblendet
        and (select count(*) from public.wachstum_ereignisse w where w.schueler_id = v_s.id and w.kompetenz_id = k.id) < 3
        and exists (
          select 1 from public.versuche v
          join public.aufgabe_kompetenzen ak on ak.aufgabe_id = v.aufgabe_id and ak.kompetenz_id = k.id
          where v.schueler_id = v_s.id
        )
    loop
      a := public.auswertung(v_s.id, r.id, e);
      v_kat := public.lern_kategorie(a, e);
      if (a ->> 'punkte') is not null then
        insert into public.wachstum_ereignisse (schueler_id, kompetenz_id, art) values (v_s.id, r.id, 'neu') on conflict do nothing;
      end if;
      if v_kat in ('besser', 'deutlich') then
        insert into public.wachstum_ereignisse (schueler_id, kompetenz_id, art) values (v_s.id, r.id, 'besser') on conflict do nothing;
      end if;
      if v_kat = 'deutlich' then
        insert into public.wachstum_ereignisse (schueler_id, kompetenz_id, art) values (v_s.id, r.id, 'deutlich') on conflict do nothing;
      end if;
    end loop;
  end if;

  select count(*) into v_n from public.wachstum_ereignisse where schueler_id = v_s.id;
  insert into public.wachstum_stufen (schueler_id, deko, stufe, gewachsen_am, gesehen)
  select v_s.id, v.w_deko, v.w_stufe, case when v.w_stufe > 1 then now() end, v.w_stufe = 1
  from public.wachstum_verteilen(v_n) v
  on conflict (schueler_id, deko) do update set stufe = excluded.stufe, gewachsen_am = now(), gesehen = false
    where excluded.stufe > public.wachstum_stufen.stufe;

  return (
    select jsonb_agg(jsonb_build_object('deko', w.deko, 'stufe', w.stufe, 'neu', not w.gesehen) order by w.deko)
    from public.wachstum_stufen w where w.schueler_id = v_s.id
  );
end
$$;

-- Die Meldung „… ist gewachsen“ wurde gezeigt
create function public.wachstum_gesehen(p_token text) returns void
language plpgsql volatile security definer set search_path = '' as $$
declare
  v_s public.schueler := public.schueler_zum_token(p_token);
begin
  update public.wachstum_stufen set gesehen = true where schueler_id = v_s.id and not gesehen;
end
$$;

revoke execute on function public.wachstum_verteilen(integer) from public, anon, authenticated;
revoke execute on function public.wachstum_holen(text), public.wachstum_gesehen(text) from public;
grant execute on function public.wachstum_holen(text), public.wachstum_gesehen(text) to anon, authenticated;
