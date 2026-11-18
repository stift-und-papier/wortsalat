-- Klassen-Aufgaben Teilaufgabe 3 (Jazz 2026-11-18): Hausaufgaben anlegen, ändern, freigeben, Versuche neu geben.
-- Keine Schemaänderung, nur Funktionen für die Lehrkraft (security invoker: RLS gilt, nur eigene Klassen).
-- Eine Hausaufgabe = alle wirksamen Zuteilungen eines Pakets in einer Klasse (Klassen-Zeile und Einzel-Zeilen ihrer Kinder).

/** Je Kind der Klasse die Hausaufgaben-Zuteilung dieses Pakets (p_schueler = null: alle Kinder, die sie haben) */
create function public.hausaufgabe_kinder(p_paket uuid, p_klasse uuid, p_schueler uuid[]) returns table (zuweisung_id uuid, schueler_id uuid)
language sql stable security invoker set search_path = '' as $$
  select z.id, s.id
  from public.schueler s
  join public.zuweisungen z on z.paket_id = p_paket and z.entfernt_am is null and z.hausaufgabe_ab is not null
    and (z.schueler_id = s.id or (z.klasse_id = s.klasse_id and not exists (
      select 1 from public.zuweisung_einzeln e where e.zuweisung_id = z.id and e.schueler_id = s.id and e.entfernt_am is not null)))
  where s.klasse_id = p_klasse and (p_schueler is null or s.id = any (p_schueler))
$$;
revoke execute on function public.hausaufgabe_kinder(uuid, uuid, uuid[]) from public, anon;
grant execute on function public.hausaufgabe_kinder(uuid, uuid, uuid[]) to authenticated;

/** Eine zugeteilte Aufgabe zur Hausaufgabe machen. War sie schon eine (vorbei oder freigegeben), entsteht eine neue
    Zuteilung mit neuer Zählung; die alte bleibt ausgeblendet als Verlauf stehen (Jazz: „alte bleibt sichtbar“). */
create function public.hausaufgabe_machen(p_paket uuid, p_klasse uuid, p_frist timestamptz, p_versuche smallint) returns integer
language plpgsql security invoker set search_path = '' as $$
declare
  v_z public.zuweisungen;
  v_neu uuid;
  v_n integer := 0;
begin
  if p_frist <= now() then
    raise exception 'Die Frist muss in der Zukunft liegen.' using errcode = '22023';
  end if;
  for v_z in
    select z.* from public.zuweisungen z
    where z.paket_id = p_paket and z.entfernt_am is null
      and (z.klasse_id = p_klasse or z.schueler_id in (select s.id from public.schueler s where s.klasse_id = p_klasse))
  loop
    if v_z.hausaufgabe_ab is null then
      update public.zuweisungen set hausaufgabe_ab = now(), frist = p_frist, versuche_erlaubt = p_versuche where id = v_z.id;
    elsif v_z.freigegeben_am is null and v_z.frist > now() then
      raise exception 'Diese Hausaufgabe läuft schon. Ändern Sie dort Frist und Versuche.' using errcode = '22023';
    else
      update public.zuweisungen set entfernt_am = now() where id = v_z.id;
      insert into public.zuweisungen (paket_id, klasse_id, schueler_id, hausaufgabe_ab, frist, versuche_erlaubt)
      values (v_z.paket_id, v_z.klasse_id, v_z.schueler_id, now(), p_frist, p_versuche) returning id into v_neu;
      -- herausgenommene Kinder bleiben herausgenommen
      insert into public.zuweisung_einzeln (zuweisung_id, schueler_id, entfernt_am)
      select v_neu, e.schueler_id, e.entfernt_am from public.zuweisung_einzeln e where e.zuweisung_id = v_z.id and e.entfernt_am is not null;
    end if;
    v_n := v_n + 1;
  end loop;
  if v_n = 0 then
    raise exception 'Dieses Paket ist der Klasse nicht zugeteilt.' using errcode = 'P0002';
  end if;
  return v_n;
end
$$;
revoke execute on function public.hausaufgabe_machen(uuid, uuid, timestamptz, smallint) from public, anon;
grant execute on function public.hausaufgabe_machen(uuid, uuid, timestamptz, smallint) to authenticated;

/** Frist (und für alle auch Versuche) ändern. p_schueler = null: für alle; dann gilt die Frist auch für Kinder, die erst
    nach dem Anlegen in die Klasse kamen, und eine Freigabe für alle wird aufgehoben. Sonst: eigene Frist je Kind. */
create function public.hausaufgabe_aendern(p_paket uuid, p_klasse uuid, p_frist timestamptz, p_versuche smallint, p_schueler uuid[] default null) returns integer
language plpgsql security invoker set search_path = '' as $$
declare
  v_n integer;
begin
  if p_frist <= now() then
    raise exception 'Die Frist muss in der Zukunft liegen.' using errcode = '22023';
  end if;
  if p_schueler is null then
    update public.zuweisungen z set frist = p_frist, versuche_erlaubt = p_versuche, freigegeben_am = null
    where z.id in (select k.zuweisung_id from public.hausaufgabe_kinder(p_paket, p_klasse, null) k);
    get diagnostics v_n = row_count;
    update public.zuweisung_einzeln e set frist = null
    where e.zuweisung_id in (select k.zuweisung_id from public.hausaufgabe_kinder(p_paket, p_klasse, null) k);
    insert into public.zuweisung_einzeln (zuweisung_id, schueler_id, frist)
    select k.zuweisung_id, k.schueler_id, p_frist
    from public.hausaufgabe_kinder(p_paket, p_klasse, null) k
    join public.schueler s on s.id = k.schueler_id
    join public.zuweisungen z on z.id = k.zuweisung_id
    where s.erstellt_am > z.hausaufgabe_ab
    on conflict (zuweisung_id, schueler_id) do update set frist = excluded.frist;
  else
    insert into public.zuweisung_einzeln (zuweisung_id, schueler_id, frist)
    select k.zuweisung_id, k.schueler_id, p_frist from public.hausaufgabe_kinder(p_paket, p_klasse, p_schueler) k
    on conflict (zuweisung_id, schueler_id) do update set frist = excluded.frist, freigegeben_am = null;
    get diagnostics v_n = row_count;
  end if;
  return v_n;
end
$$;
revoke execute on function public.hausaufgabe_aendern(uuid, uuid, timestamptz, smallint, uuid[]) from public, anon;
grant execute on function public.hausaufgabe_aendern(uuid, uuid, timestamptz, smallint, uuid[]) to authenticated;

/** Unbegrenzt freigeben (ab da normale Aufgabe). p_schueler = null: für alle, sonst nur für diese Kinder. */
create function public.hausaufgabe_freigeben(p_paket uuid, p_klasse uuid, p_schueler uuid[] default null) returns integer
language plpgsql security invoker set search_path = '' as $$
declare
  v_n integer;
begin
  if p_schueler is null then
    update public.zuweisungen z set freigegeben_am = now()
    where z.freigegeben_am is null and z.id in (select k.zuweisung_id from public.hausaufgabe_kinder(p_paket, p_klasse, null) k);
  else
    insert into public.zuweisung_einzeln (zuweisung_id, schueler_id, freigegeben_am)
    select k.zuweisung_id, k.schueler_id, now() from public.hausaufgabe_kinder(p_paket, p_klasse, p_schueler) k
    on conflict (zuweisung_id, schueler_id) do update set freigegeben_am = excluded.freigegeben_am;
  end if;
  get diagnostics v_n = row_count;
  return v_n;
end
$$;
revoke execute on function public.hausaufgabe_freigeben(uuid, uuid, uuid[]) from public, anon;
grant execute on function public.hausaufgabe_freigeben(uuid, uuid, uuid[]) to authenticated;

/** Versuche neu geben: gezählt werden ab jetzt nur Durchgänge, die danach beginnen. Löscht nichts. */
create function public.hausaufgabe_neustart(p_paket uuid, p_klasse uuid, p_schueler uuid[] default null) returns integer
language plpgsql security invoker set search_path = '' as $$
declare
  v_n integer;
begin
  insert into public.zuweisung_einzeln (zuweisung_id, schueler_id, neustart_ab)
  select k.zuweisung_id, k.schueler_id, now() from public.hausaufgabe_kinder(p_paket, p_klasse, p_schueler) k
  on conflict (zuweisung_id, schueler_id) do update set neustart_ab = excluded.neustart_ab;
  get diagnostics v_n = row_count;
  return v_n;
end
$$;
revoke execute on function public.hausaufgabe_neustart(uuid, uuid, uuid[]) from public, anon;
grant execute on function public.hausaufgabe_neustart(uuid, uuid, uuid[]) to authenticated;
