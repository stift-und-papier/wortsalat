-- Nachbesserung zu deko_plaetze: Boot und Brunnen wurden gemeinsam gezählt, darum lag der Brunnen in der Truhe.
-- Jetzt steht je Schüler:in das erste Boot bzw. der erste Brunnen auf seinem festen Platz.
update public.besitz b set platz = b.artikel_id
where b.artikel_id in ('brunnen', 'boot') and b.platz is null
  and b.id = (select b2.id from public.besitz b2 where b2.schueler_id = b.schueler_id and b2.artikel_id = b.artikel_id order by b2.erstellt_am, b2.id limit 1)
  and not exists (select 1 from public.besitz b3 where b3.schueler_id = b.schueler_id and b3.platz = b.artikel_id);
