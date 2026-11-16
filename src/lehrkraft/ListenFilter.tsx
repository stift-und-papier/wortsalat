// alt (Übungswiese), auf die Lehrkraft-Ansicht „ruhig“ (lk-*) umgestellt
import { useEffect, useState } from 'react'
import { DOPPELJAHRGAENGE, LEERER_FILTER, passt, type Filter, type FilterKompetenz } from '../lib/filter'
import { fehlerText } from '../lib/fehler'
import { supabase } from '../lib/supabase'
import { ZWEIGE, type Kompetenz } from '../lib/typen'

export type ListenKompetenz = FilterKompetenz & Pick<Kompetenz, 'kurzname' | 'kompetenz' | 'kerncurriculum'>

/** Alle Kompetenzen der Lehrkraft als Nachschlagetabelle (für passt()) */
export function useKompetenzen(setFehler: (text: string) => void) {
  const [kompetenzen, setKompetenzen] = useState<Map<string, ListenKompetenz>>(new Map())
  useEffect(() => {
    void supabase
      .from('kompetenzen')
      .select('id, bereich, stufe, kurzname, kompetenz, kerncurriculum')
      .order('sortierung')
      .then(({ data, error }) =>
        // ohne Kompetenzen wäre jeder Eintrag „ohne Zuordnung“ – das muss sichtbar sein
        error
          ? setFehler(`Kompetenzen konnten nicht geladen werden, der Filter stimmt deshalb nicht. ${fehlerText(error)}`)
          : setKompetenzen(new Map(((data ?? []) as ListenKompetenz[]).map((k) => [k.id, k]))),
      )
  }, [setFehler])
  return kompetenzen
}

/**
 * Wie useState, aber bis zum Schließen des Browserfensters gemerkt (Suche, Filter, Sortierung beim Wechsel der Seiten, Teilaufgabe 5).
 * Ohne sessionStorage (z. B. privates Fenster) gilt einfach der Startwert.
 */
export function useGemerkt<T>(schluessel: string, start: T): [T, (neu: T) => void] {
  const [wert, setWert] = useState<T>(() => {
    try {
      const roh = sessionStorage.getItem(`wortsalat-${schluessel}`)
      if (roh === null) return start
      const gespeichert = JSON.parse(roh) as T
      // neue Felder (z. B. ein neuer Filter) bekommen ihren Startwert
      return start && typeof start === 'object' && !Array.isArray(start) ? { ...start, ...gespeichert } : gespeichert
    } catch {
      return start
    }
  })
  const setzen = (neu: T) => {
    setWert(neu)
    try {
      sessionStorage.setItem(`wortsalat-${schluessel}`, JSON.stringify(neu))
    } catch {
      // nicht speicherbar: gilt nur auf dieser Seite
    }
  }
  return [wert, setzen]
}

type Props = {
  filter: Filter
  onChange: (f: Filter) => void
  /** Kompetenzen, die in der Liste vorkommen – nur diese stehen zur Auswahl */
  verwendet: ListenKompetenz[]
  treffer: number
  gesamt: number
  suchText: string
  /** Aufgabenarten (Kennung → Name): zeigt die Auswahl „Aufgabenart“ */
  arten?: Record<string, string>
  /** zeigt die Auswahl „Stufe“ (Sterne) */
  stufen?: boolean
}

// Filterleiste: Titelsuche, Jahrgang (aus der KC-Stufe der Kompetenzen), Bereich (heißt in der Oberfläche „Kernkompetenz“, Jazz 2026-11-13), einzelne Kompetenz.
export function ListenFilter({ filter, onChange, verwendet, treffer, gesamt, suchText, arten, stufen }: Props) {
  const bereiche = [...new Set(verwendet.map((k) => k.bereich))].sort((a, b) => a.localeCompare(b, 'de'))
  const imBereich = verwendet.filter(
    (k) => k.bereich === filter.bereich && passt('', [k.id], { ...LEERER_FILTER, jahrgang: filter.jahrgang }, new Map([[k.id, k]])),
  )
  const mehrereKc = new Set(imBereich.map((k) => k.kerncurriculum)).size > 1
  const aktiv = JSON.stringify(filter) !== JSON.stringify(LEERER_FILTER)

  return (
    <div className="lk-formular">
      <div className="lk-zeile">
        <label>
          Suchen
          <input className="lk-feld" value={filter.suche} onChange={(e) => onChange({ ...filter, suche: e.target.value })} placeholder={suchText} />
        </label>
        <label>
          Schulform
          <select className="lk-feld" value={filter.schulform} onChange={(e) => onChange({ ...filter, schulform: e.target.value })}>
            <option value="">alle</option>
            {ZWEIGE.map((z) => (
              <option key={z}>{z}</option>
            ))}
          </select>
        </label>
        {arten && (
          <label>
            Aufgabenart
            <select className="lk-feld" value={filter.art} onChange={(e) => onChange({ ...filter, art: e.target.value })}>
              <option value="">alle</option>
              {Object.entries(arten).map(([art, name]) => (
                <option key={art} value={art}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        )}
        {stufen && (
          <label>
            Stufe
            <select className="lk-feld" value={filter.stufe} onChange={(e) => onChange({ ...filter, stufe: e.target.value })}>
              <option value="">alle</option>
              <option value="1">★☆☆ leicht</option>
              <option value="2">★★☆ mittel</option>
              <option value="3">★★★ schwer</option>
            </select>
          </label>
        )}
        <label>
          Jahrgang
          <select className="lk-feld" value={filter.jahrgang} onChange={(e) => onChange({ ...filter, jahrgang: e.target.value as Filter['jahrgang'], kompetenz: '' })}>
            <option value="">alle</option>
            {DOPPELJAHRGAENGE.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
            <option value="ohne">ohne Kompetenz-Zuordnung</option>
          </select>
        </label>
        <label>
          Kernkompetenz
          <select className="lk-feld"
            value={filter.bereich}
            disabled={filter.jahrgang === 'ohne'}
            onChange={(e) => onChange({ ...filter, bereich: e.target.value, kompetenz: '' })}
          >
            <option value="">alle</option>
            {bereiche.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </label>
        <label>
          Kompetenz
          <select className="lk-feld"
            value={filter.kompetenz}
            disabled={!filter.bereich || filter.jahrgang === 'ohne'}
            onChange={(e) => onChange({ ...filter, kompetenz: e.target.value })}
          >
            <option value="">{filter.bereich ? 'alle in der Kernkompetenz' : 'erst Kernkompetenz wählen'}</option>
            {imBereich.map((k) => (
              <option key={k.id} value={k.id}>
                {k.kurzname?.trim() || k.kompetenz}
                {mehrereKc ? ` (${k.kerncurriculum})` : ''}
              </option>
            ))}
          </select>
        </label>
      </div>
      {aktiv && (
        <p className="lk-leise">
          {treffer} von {gesamt} angezeigt{' '}
          <button type="button" className="lk-knopf" onClick={() => onChange(LEERER_FILTER)}>
            Filter zurücksetzen
          </button>
        </p>
      )}
    </div>
  )
}
