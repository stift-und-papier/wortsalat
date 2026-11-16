// alt (Übungswiese), auf die Lehrkraft-Ansicht „ruhig“ (lk-*) umgestellt
import { useEffect, useState } from 'react'
import { SterneText } from '../gemeinsam/Sterne'
import { fehlerText } from '../lib/fehler'
import { jahrgaengeVon, LEERER_FILTER, passt, type Filter, type FilterKompetenz } from '../lib/filter'
import { naechsteSortierung, sortiere, type Sortierung, type Spalte } from '../lib/sortierung'
import { supabase } from '../lib/supabase'
import { ZWEIGE, type Aufgabe } from '../lib/typen'
import { ListenFilter, useGemerkt, useKompetenzen } from './ListenFilter'

export const TYP_NAMEN: Record<Aufgabe['typ'], string> = { lueckentext: 'Lückentext', auswahl: 'Auswahl', zuordnen: 'Zuordnen', fehler: 'Fehler finden', reihenfolge: 'Reihenfolge', ueberarbeiten: 'Sätze verbessern', erklaerung: 'Erklärung', diktat: 'Diktat', fallende_woerter: 'Fallende Wörter' }
/** Formate der Übungen (ohne Erklärung) für den Filter */
export const ARTEN = Object.fromEntries(Object.entries(TYP_NAMEN).filter(([t]) => t !== 'erklaerung'))

const SPALTEN: { spalte: Spalte; name: string }[] = [
  { spalte: 'titel', name: 'Titel' },
  { spalte: 'format', name: 'Format' },
  { spalte: 'stufe', name: 'Stufe' },
  { spalte: 'kompetenz', name: 'Kompetenz' },
  { spalte: 'kc', name: 'Schulform' },
]

type AufgabeMitKompetenzen = Pick<Aufgabe, 'id' | 'typ' | 'titel' | 'stufe' | 'monster' | 'anweisung' | 'geaendert_am'> & {
  runden: unknown[] | null
  aufgabe_kompetenzen: { kompetenz_id: string }[]
  paket_aufgaben: { pakete: { zweige: string[] } | null }[]
}

/** Übung bzw. Erklärseite mit allem, was Listen und die Auswahl im Paket zeigen, filtern und sortieren */
export type ListenAufgabe = AufgabeMitKompetenzen & {
  kompetenzIds: string[]
  kompetenz: string
  kc: string
  schulformen: string[]
  jahrgaenge: string[]
  anzahlRunden: number
}

/** Alle nicht archivierten Übungen und Erklärseiten der Lehrkraft, zuletzt geänderte zuerst */
export function useListenAufgaben(setFehler: (text: string) => void) {
  const [aufgaben, setAufgaben] = useState<AufgabeMitKompetenzen[] | null>(null)
  const kompetenzen = useKompetenzen(setFehler)
  useEffect(() => {
    void supabase
      .from('aufgaben')
      .select('id, typ, titel, stufe, monster, anweisung, geaendert_am, runden:loesung->runden, aufgabe_kompetenzen(kompetenz_id), paket_aufgaben(pakete(zweige))')
      .eq('archiviert', false) // Übungsumbau: alte Aufgaben sind archiviert
      .order('geaendert_am', { ascending: false })
      .then(({ data, error }) => (error ? setFehler(fehlerText(error)) : setAufgaben(data as unknown as AufgabeMitKompetenzen[])))
  }, [setFehler])
  const liste: ListenAufgabe[] | null =
    aufgaben?.map((a) => {
      const kompetenzIds = a.aufgabe_kompetenzen.map((z) => z.kompetenz_id)
      const ks = kompetenzIds.flatMap((id) => kompetenzen.get(id) ?? [])
      // Schulform = Kerncurricula der Kompetenzen und Zweige der Pakete, feste Reihenfolge
      const alle = [...ks.map((k) => k.kerncurriculum), ...a.paket_aufgaben.flatMap((pa) => pa.pakete?.zweige ?? [])]
      const schulformen = ZWEIGE.filter((z) => alle.includes(z))
      return {
        ...a,
        kompetenzIds,
        kompetenz: [...new Set(ks.map((k) => k.kurzname?.trim() || k.kompetenz))].join(', '),
        kc: schulformen.join(', '),
        schulformen,
        jahrgaenge: jahrgaengeVon(ks),
        anzahlRunden: Array.isArray(a.runden) ? a.runden.length : 1,
      }
    }) ?? null
  return { liste, kompetenzen }
}

/** Filter anwenden. Suche findet Titel, Arbeitsanweisung und Kompetenz (Teilaufgabe 5). */
export function filtere(liste: ListenAufgabe[], filter: Filter, kompetenzen: Map<string, FilterKompetenz>) {
  return liste.filter(
    (a) =>
      (!filter.art || a.typ === filter.art) &&
      (!filter.stufe || a.typ === 'erklaerung' || String(a.stufe) === filter.stufe) &&
      passt(`${a.titel} ${a.anweisung} ${a.kompetenz}`, a.kompetenzIds, filter, kompetenzen, a.schulformen),
  )
}

/** Teilaufgabe 4 (Jazz 2026-11-15): Übungen und Erklärungen haben je eine eigene Liste */
export function AufgabenListe({ erklaerungen = false }: { erklaerungen?: boolean }) {
  const [fehler, setFehler] = useState<string | null>(null)
  const { liste, kompetenzen } = useListenAufgaben(setFehler)
  const [filter, setFilter] = useGemerkt(erklaerungen ? 'filter-erklaerungen' : 'filter-uebungen', LEERER_FILTER)
  // null = wie geladen (zuletzt geändert zuerst)
  const [sortierung, setSortierung] = useGemerkt<Sortierung>(erklaerungen ? 'sortierung-erklaerungen' : 'sortierung-uebungen', null)
  const [geloescht, setGeloescht] = useState<string[]>([])
  const aufgaben = liste?.filter((a) => (a.typ === 'erklaerung') === erklaerungen && !geloescht.includes(a.id))
  const gefiltert = aufgaben && filtere(aufgaben, filter, kompetenzen)
  const sortiert = gefiltert && sortiere(gefiltert, sortierung, (typ) => TYP_NAMEN[typ])
  const ort = erklaerungen ? 'erklaerungen' : 'aufgaben'
  const spalten = erklaerungen ? SPALTEN.filter((s) => s.spalte !== 'format' && s.spalte !== 'stufe') : SPALTEN
  async function loeschen(a: ListenAufgabe) {
    const ok = window.confirm(
      `„${a.titel}“ endgültig löschen?

Sie verschwindet aus allen Paketen, und alle Ergebnisse der Schüler:innen dazu werden gelöscht.`,
    )
    if (!ok) return
    const { error } = await supabase.from('aufgaben').delete().eq('id', a.id)
    if (error) setFehler(fehlerText(error))
    else setGeloescht((alt) => [...alt, a.id])
  }
  const verwendet = [...new Set((aufgaben ?? []).flatMap((a) => a.kompetenzIds))].flatMap((id) => kompetenzen.get(id) ?? [])

  return (
    <>
      <h1>{erklaerungen ? 'Erklärungen' : 'Übungen'}</h1>
      {erklaerungen && <p className="lk-leise">Erklärseiten erklären ein Thema. Sie fügen sie wie Übungen zu Paketen hinzu.</p>}
      <div className="lk-knopfreihe">
        <a className="lk-knopf lk-knopf--haupt" href={erklaerungen ? '#/lehrkraft/erklaerungen/neu-erklaerung' : '#/lehrkraft/aufgaben/neu'}>
          {erklaerungen ? '+ Neue Erklärung' : '+ Neue Übung'}
        </a>
      </div>
      {fehler && <p className="lk-hinweis" role="alert">{fehler}</p>}
      {aufgaben && aufgaben.length > 0 && (
        <ListenFilter
          filter={filter}
          onChange={setFilter}
          verwendet={verwendet}
          treffer={gefiltert?.length ?? 0}
          gesamt={aufgaben.length}
          suchText="Titel, Anweisung, Kompetenz …"
          arten={erklaerungen ? undefined : ARTEN}
          stufen={!erklaerungen}
        />
      )}
      {gefiltert === undefined ? (
        <p>Lädt …</p>
      ) : aufgaben?.length === 0 ? (
        <p>{erklaerungen ? 'Noch keine Erklärungen.' : 'Noch keine Übungen.'}</p>
      ) : gefiltert.length === 0 ? (
        <p>Nichts passt zu diesem Filter.</p>
      ) : (
        <div className="lk-rollen">
        <table className="lk-tabelle">
          <thead>
            <tr>
              {spalten.map(({ spalte, name }) => {
                const aktiv = sortierung?.spalte === spalte
                const richtung = aktiv ? (sortierung.absteigend ? 'descending' : 'ascending') : undefined
                return (
                  <th key={spalte} aria-sort={richtung}>
                    <button type="button" className="lk-sortieren" onClick={() => setSortierung(naechsteSortierung(sortierung, spalte))}>
                      {name}
                      <span aria-hidden="true">
                        {aktiv ? (sortierung.absteigend ? '▼' : '▲') : '↕'}
                      </span>
                    </button>
                  </th>
                )
              })}
              <th><span className="lk-unsichtbar">Löschen</span></th>
            </tr>
          </thead>
          <tbody>
            {sortiert?.map((a) => (
              <tr key={a.id}>
                <td>
                  <a href={`#/lehrkraft/${ort}/${a.id}`}>{a.titel}</a>
                </td>
                {!erklaerungen && <td>{TYP_NAMEN[a.typ]}</td>}
                {!erklaerungen && <td><SterneText stufe={a.stufe} /></td>}
                <td>{a.kompetenz || <span className="lk-leise">keine</span>}</td>
                <td>{a.kc || <span className="lk-leise">–</span>}</td>
                <td>
                  <button type="button" className="lk-knopf lk-knopf--gefahr" onClick={() => void loeschen(a)} aria-label={`„${a.titel}“ löschen`}>
                    Löschen
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </>
  )
}
