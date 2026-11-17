// Übungspakete „Grammatik Klasse 7“ nach den Arbeitsblättern DS01–DS07 von Jazz (2026-11-17), ohne Krabat-Inhalte.
// Inhalte: inhalte/reihe7-grammatik.ts. Jede Runde wird mit den Prüfregeln des Editors gelesen; ein Fehler bricht ab.
// Aufruf: node scripts/reihe7-sql.ts <ausgabe.sql>  → danach: npx supabase db query --linked -f <ausgabe.sql>
// Wiederholbar: feste ids (md5 aus einem Schlüssel); vorhandene Übungen werden aktualisiert, Versuche bleiben erhalten.
import { createHash } from 'node:crypto'
import { writeFileSync } from 'node:fs'
import { kategorienAus, reihenZuTeilen, textZuTeilen, versionenZuTeilen } from '../src/lib/lueckentext.ts'
import { PAKETE, type Format, type Runde } from '../inhalte/reihe7-grammatik.ts'

const ANWEISUNG: Record<Format, string> = {
  lueckentext: 'Ergänze die Lücken.',
  auswahl: 'Tippe die richtige Antwort an.',
  zuordnen: 'Wähle oben eine Kategorie und tippe die passenden Wörter an.',
  fehler: 'Finde die Fehler und schreibe das Wort richtig.',
  reihenfolge: 'Bring die Bausteine in die richtige Reihenfolge.',
  ueberarbeiten: 'Tippe die richtigen Antworten an.',
}

const uuid = (schluessel: string) => {
  const h = createHash('md5').update(`reihe7:${schluessel}`).digest('hex')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`
}
// wiederholbarer Zufall (gleiche Kennungen der Bausteine bei jedem Lauf)
let saat = 7
const zufall = () => ((saat = (saat * 16807) % 2147483647) - 1) / 2147483646
const sql = (s: string) => `'${s.replace(/'/g, "''")}'`
const json = (v: unknown) => `${sql(JSON.stringify(v))}::jsonb`
const OWNER = `(select owner from public.klassen where name = 'Test' limit 1)`

/** Eine Runde wie der Editor speichern (Format, Kategorien, Optionen) */
function rundeLoesung(r: Runde, wo: string, basis?: Format) {
  const { teile, fehler } =
    r.typ === 'reihenfolge'
      ? reihenZuTeilen(r.text, zufall)
      : r.typ === 'ueberarbeiten'
        ? versionenZuTeilen(r.text)
        : textZuTeilen(r.text, r.typ === 'fehler' ? 'fehler' : r.typ === 'zuordnen')
  if (fehler.length) throw new Error(`${wo}: ${fehler.join(' ')}\n${r.text}`)
  if (!teile.some((t) => t.t !== 'text')) throw new Error(`${wo}: keine Stelle\n${r.text}`)
  const kategorien = r.typ === 'zuordnen' ? kategorienAus(teile, r.kategorien ?? []) : []
  return {
    text: r.text,
    gross_klein_beachten: true,
    darstellung: 'antippen',
    kategorien,
    ...(r.typ === 'fehler' ? { korrigieren: true, anzahl_zeigen: true } : {}),
    ...(basis && r.typ !== basis ? { typ: r.typ } : {}),
    ...(r.anweisung !== undefined ? { anweisung: r.anweisung, hinweis: r.hinweis ?? '' } : {}),
    teile,
  }
}

const aus: string[] = ['-- erzeugt von scripts/reihe7-sql.ts, nicht von Hand ändern', 'begin;']
const kompetenzen = (id: string, namen: string[]) => {
  aus.push(`delete from public.aufgabe_kompetenzen where aufgabe_id = '${id}';`)
  aus.push(
    `insert into public.aufgabe_kompetenzen (aufgabe_id, kompetenz_id) select '${id}', k.id from public.kompetenzen k where k.kerncurriculum = 'Gymnasium' and k.kurzname in (${namen.map(sql).join(', ')});`,
  )
}
const aufgabe = (id: string, f: { typ: string; titel: string; anweisung: string; hinweis?: string; loesung: unknown; monster: string; je: number; spiel: unknown }) =>
  aus.push(
    `insert into public.aufgaben (id, owner, typ, titel, anweisung, hinweis, stufe, loesung, monster, runden_je_durchgang, spiel) values ('${id}', ${OWNER}, ${sql(f.typ)}, ${sql(f.titel)}, ${sql(f.anweisung)}, ${f.hinweis ? sql(f.hinweis) : 'null'}, 2, ${json(f.loesung)}, ${sql(f.monster)}, ${f.je}, ${json(f.spiel)})` +
      ` on conflict (id) do update set typ = excluded.typ, titel = excluded.titel, anweisung = excluded.anweisung, hinweis = excluded.hinweis, stufe = 2, loesung = excluded.loesung, monster = excluded.monster, runden_je_durchgang = excluded.runden_je_durchgang, spiel = excluded.spiel, archiviert = false;`,
  )

let anzahl = 0
for (const p of PAKETE) {
  const paketId = uuid(`paket:${p.kurz}`)
  const ids: string[] = []
  // Erklärseite
  const eId = uuid(`${p.kurz}:erklaerung`)
  aufgabe(eId, {
    typ: 'erklaerung', titel: p.erklaerung.titel, anweisung: '', monster: 'kein', je: 6, spiel: {},
    loesung: { text: '', gross_klein_beachten: true, teile: [], erklaerung: { text: p.erklaerung.text, merke: p.erklaerung.merke, beispiele: p.erklaerung.beispiele } },
  })
  kompetenzen(eId, p.kompetenzen)
  ids.push(eId)
  // Übungen ohne Monster, je Aufgabe des Arbeitsblatts eine
  for (const [nr, u] of p.uebungen.entries()) {
    if ('vorhanden' in u) {
      ids.push(u.vorhanden)
      continue
    }
    const id = uuid(`${p.kurz}:uebung:${nr}`)
    if (u.runden.length < 6) throw new Error(`${p.kurz} ${u.titel}: zu wenige Runden`)
    const runden = u.runden.map((text, i) => rundeLoesung({ typ: u.typ, text, kategorien: u.kategorien }, `${p.kurz} ${u.titel} Runde ${i + 1}`))
    aufgabe(id, { typ: u.typ, titel: u.titel, anweisung: u.anweisung ?? ANWEISUNG[u.typ], hinweis: u.hinweis, loesung: { runden }, monster: 'kein', je: 5, spiel: {} })
    kompetenzen(id, u.kompetenzen ?? p.kompetenzen)
    ids.push(id)
    anzahl++
  }
  // gemischte Abschlussübung mit Monster: je Format eine Runde, von leicht nach schwer, in dieser Reihenfolge
  const aId = uuid(`${p.kurz}:abschluss`)
  const basis = p.abschluss[0].typ
  const runden = p.abschluss.map((r, i) =>
    rundeLoesung({ ...r, anweisung: r.anweisung ?? ANWEISUNG[r.typ] }, `${p.kurz} Abschluss Runde ${i + 1}`, basis),
  )
  aufgabe(aId, {
    typ: basis, titel: p.abschlussTitel, anweisung: p.abschluss[0].anweisung ?? ANWEISUNG[basis], loesung: { gemischt: true, runden },
    monster: p.monster, je: runden.length, spiel: { reihenfolge: true },
  })
  kompetenzen(aId, p.kompetenzen)
  ids.push(aId)
  anzahl++
  // Paket (Jahrgang 7, Gymnasium), Reihenfolge neu
  aus.push(
    `insert into public.pakete (id, owner, titel, jahrgaenge, zweige) values ('${paketId}', ${OWNER}, ${sql(p.titel)}, '{7}', '{Gymnasium}') on conflict (id) do update set titel = excluded.titel, archiviert = false;`,
  )
  aus.push(`delete from public.paket_aufgaben where paket_id = '${paketId}';`)
  aus.push(`insert into public.paket_aufgaben (paket_id, aufgabe_id, position) values ${ids.map((a, i) => `('${paketId}', '${a}', ${i})`).join(', ')};`)
}
aus.push('commit;')
aus.push(`select p.titel, count(*) as aufgaben from public.pakete p join public.paket_aufgaben pa on pa.paket_id = p.id where p.id in (${PAKETE.map((p) => `'${uuid(`paket:${p.kurz}`)}'`).join(', ')}) group by p.titel order by p.titel;`)

const ziel = process.argv[2]
if (!ziel) throw new Error('Bitte eine Ausgabedatei angeben.')
writeFileSync(ziel, aus.join('\n') + '\n')
console.log(`${PAKETE.length} Pakete, ${anzahl} Übungen → ${ziel}`)
