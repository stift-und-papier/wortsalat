// Teilaufgabe 4 und 5 (Jazz 2026-11-15): Übungen und Erklärungen ins Paket holen. Statt einer Aufklappliste: Reiter Übungen/Erklärungen,
// Suche (Titel, Anweisung, Kompetenz), Filter, Sortierung, Tags (Jahrgang, Schulform), Anzahl Runden, Kästchen für mehrere auf einmal,
// „Ansehen“ zeigt die Übung wie im Spiel. Suche, Filter, Sortierung und Reiter bleiben bis zum Schließen des Fensters gemerkt.
import { useEffect, useState } from 'react'
import { SterneText } from '../gemeinsam/Sterne'
import { fehlerText } from '../lib/fehler'
import { LEERER_FILTER } from '../lib/filter'
import { sortiere, type Sortierung } from '../lib/sortierung'
import { supabase } from '../lib/supabase'
import { ARTEN, filtere, TYP_NAMEN, useListenAufgaben, type ListenAufgabe } from './AufgabenListe'
import { ListenFilter, useGemerkt } from './ListenFilter'
import { Durchgehen, type PaketAufgabe } from './PaketDetail'

const SORTIERUNGEN: { wert: string; name: string; s: Sortierung }[] = [
  { wert: 'geaendert', name: 'zuletzt geändert', s: { spalte: 'geaendert', absteigend: false } },
  { wert: 'titel', name: 'Titel (A bis Z)', s: { spalte: 'titel', absteigend: false } },
  { wert: 'format', name: 'Format', s: { spalte: 'format', absteigend: false } },
  { wert: 'stufe', name: 'Stufe (leicht zuerst)', s: { spalte: 'stufe', absteigend: false } },
]

type Props = { paketId: string; imPaket: Set<string>; naechstePosition: number; onHinzugefuegt: () => void; onFehler: (text: string) => void }

export function UebungAuswahl({ paketId, imPaket, naechstePosition, onHinzugefuegt, onFehler }: Props) {
  const [ladeFehler, setLadeFehler] = useState<string | null>(null)
  const { liste, kompetenzen } = useListenAufgaben(setLadeFehler)
  const [reiter, setReiter] = useGemerkt<'uebungen' | 'erklaerungen'>('paket-reiter', 'uebungen')
  const erklaerungen = reiter === 'erklaerungen'
  const [filter, setFilter] = useGemerkt(erklaerungen ? 'paket-filter-erklaerungen' : 'paket-filter-uebungen', LEERER_FILTER)
  const [sortWert, setSortWert] = useGemerkt('paket-sortierung', 'geaendert')
  const [gewaehlt, setGewaehlt] = useState<string[]>([])
  const [offen, setOffen] = useState<string | null>(null)
  const [laeuft, setLaeuft] = useState(false)

  const imReiter = liste?.filter((a) => (a.typ === 'erklaerung') === erklaerungen && !imPaket.has(a.id))
  const gefiltert = imReiter && filtere(imReiter, filter, kompetenzen)
  const sortierung = SORTIERUNGEN.find((x) => x.wert === sortWert)?.s ?? null
  const sortiert = gefiltert && sortiere(gefiltert, sortierung, (typ) => TYP_NAMEN[typ])
  const verwendet = [...new Set((imReiter ?? []).flatMap((a) => a.kompetenzIds))].flatMap((id) => kompetenzen.get(id) ?? [])
  // Gewählte, die gerade ausgefiltert sind, zählen trotzdem (die Zahl auf dem Knopf sagt es)
  const auswahl = gewaehlt.filter((id) => !imPaket.has(id))

  function umschalten(id: string) {
    setGewaehlt((alt) => (alt.includes(id) ? alt.filter((x) => x !== id) : [...alt, id]))
  }

  async function hinzufuegen() {
    if (!auswahl.length || !liste) return
    setLaeuft(true)
    // Reihenfolge im Paket = Reihenfolge der Liste, wie sie gerade sortiert ist (Ausgefilterte ans Ende)
    const reihe = [...(sortiert ?? []).map((a) => a.id).filter((id) => auswahl.includes(id)), ...auswahl.filter((id) => !sortiert?.some((a) => a.id === id))]
    const { error } = await supabase.from('paket_aufgaben').insert(reihe.map((aufgabe_id, i) => ({ paket_id: paketId, aufgabe_id, position: naechstePosition + i })))
    setLaeuft(false)
    if (error) return onFehler(fehlerText(error))
    setGewaehlt([])
    onHinzugefuegt()
  }

  return (
    <div className="lk-auswahl">
      <h3>Hinzufügen</h3>
      <div className="lk-reiter" role="group" aria-label="Was hinzufügen?">
        <button type="button" className="lk-knopf" aria-pressed={!erklaerungen} onClick={() => (setReiter('uebungen'), setOffen(null))}>
          Übungen
        </button>
        <button type="button" className="lk-knopf" aria-pressed={erklaerungen} onClick={() => (setReiter('erklaerungen'), setOffen(null))}>
          Erklärungen
        </button>
      </div>
      {ladeFehler && <p className="lk-hinweis" role="alert">{ladeFehler}</p>}
      {imReiter && imReiter.length > 0 && (
        <>
          <ListenFilter
            filter={filter}
            onChange={setFilter}
            verwendet={verwendet}
            treffer={gefiltert?.length ?? 0}
            gesamt={imReiter.length}
            suchText="Titel, Anweisung, Kompetenz …"
            arten={erklaerungen ? undefined : ARTEN}
            stufen={!erklaerungen}
          />
          <label className="lk-auswahl__sortieren">
            Sortieren nach
            <select className="lk-feld" value={sortWert} onChange={(e) => setSortWert(e.target.value)}>
              {SORTIERUNGEN.filter((x) => !erklaerungen || (x.wert !== 'format' && x.wert !== 'stufe')).map((x) => (
                <option key={x.wert} value={x.wert}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>
        </>
      )}
      {!sortiert ? (
        <p className="lk-leise" role="status">Lädt …</p>
      ) : imReiter?.length === 0 ? (
        <p className="lk-leise">
          {erklaerungen ? 'Alle Ihre Erklärungen sind schon in diesem Paket.' : 'Alle Ihre Übungen sind schon in diesem Paket.'}{' '}
          <a href={erklaerungen ? '#/lehrkraft/erklaerungen/neu-erklaerung' : '#/lehrkraft/aufgaben/neu'}>{erklaerungen ? 'Neue Erklärung anlegen' : 'Neue Übung anlegen'}</a>
        </p>
      ) : sortiert.length === 0 ? (
        <div className="lk-hinweis" role="status">
          <p>Keine {erklaerungen ? 'Erklärung' : 'Übung'} passt zu Ihrer Suche.</p>
          <button type="button" className="lk-knopf" onClick={() => setFilter(LEERER_FILTER)}>
            Filter zurücksetzen
          </button>
        </div>
      ) : (
        <ul className="lk-auswahl__liste">
          {sortiert.map((a) => (
            <Zeile key={a.id} a={a} gewaehlt={auswahl.includes(a.id)} offen={offen === a.id} umschalten={() => umschalten(a.id)} ansehen={() => setOffen(offen === a.id ? null : a.id)} />
          ))}
        </ul>
      )}
      <div className="lk-auswahl__leiste">
        <button type="button" className="lk-knopf lk-knopf--haupt" disabled={!auswahl.length || laeuft} onClick={() => void hinzufuegen()}>
          {auswahl.length ? `${auswahl.length} ausgewählte hinzufügen` : 'Erst ankreuzen, dann hinzufügen'}
        </button>
        {auswahl.length > 0 && (
          <button type="button" className="lk-knopf" onClick={() => setGewaehlt([])}>
            Auswahl aufheben
          </button>
        )}
      </div>
    </div>
  )
}

function Zeile({ a, gewaehlt, offen, umschalten, ansehen }: { a: ListenAufgabe; gewaehlt: boolean; offen: boolean; umschalten: () => void; ansehen: () => void }) {
  const ist = a.typ === 'erklaerung'
  return (
    <li className="lk-auswahl__zeile" data-gewaehlt={gewaehlt || undefined}>
      <label className="lk-auswahl__wahl">
        <input type="checkbox" checked={gewaehlt} onChange={umschalten} />
        <span>
          <strong>{a.titel}</strong>
          <span className="lk-leise">
            {ist ? (a.kompetenz || 'ohne Kompetenz') : <>{a.gemischt ? 'Gemischt' : TYP_NAMEN[a.typ]} · <SterneText stufe={a.stufe} /> · {a.anzahlRunden === 1 ? '1 Runde' : `${a.anzahlRunden} Runden`}</>}
          </span>
        </span>
      </label>
      <span className="lk-auswahl__tags">
        {a.jahrgaenge.map((j) => (
          <span key={j} className="lk-marke">
            {j}
          </span>
        ))}
        {a.schulformen.map((z) => (
          <span key={z} className="lk-marke">
            {z}
          </span>
        ))}
        <button type="button" className="lk-knopf" aria-expanded={offen} aria-label={`${a.titel} ${offen ? "schließen" : "ansehen"}`} onClick={ansehen}>
          {offen ? 'Schließen' : 'Ansehen'}
        </button>
      </span>
      {offen && <Vorschau id={a.id} schliessen={ansehen} />}
    </li>
  )
}

/** Eine Übung ganz laden und wie im Spiel zeigen */
function Vorschau({ id, schliessen }: { id: string; schliessen: () => void }) {
  const [aufgabe, setAufgabe] = useState<PaketAufgabe | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)
  useEffect(() => {
    void supabase
      .from('aufgaben')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => (error ? setFehler(fehlerText(error)) : setAufgabe(data as PaketAufgabe)))
  }, [id])
  return (
    <div className="lk-vorschau lk-auswahl__vorschau">
      {fehler ? <p className="lk-hinweis" role="alert">{fehler}</p> : aufgabe ? <Durchgehen aufgaben={[aufgabe]} ende={{ text: 'Vorschau schließen', ziel: schliessen }} /> : <p className="lk-leise" role="status">Lädt …</p>}
    </div>
  )
}
