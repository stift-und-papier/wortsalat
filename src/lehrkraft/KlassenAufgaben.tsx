// Klassen-Aufgaben Teilaufgabe 2 (Jazz 2026-11-18, Konzept docs/umbau/konzept-klassen-aufgaben.md):
// Reiter „Aufgaben“ der Klassenseite. Zugeteilt werden nur fertige Pakete (in der Oberfläche heißt ein zugeteiltes Paket „Aufgabe“).
// Herausnehmen blendet nur aus (Funktion herausnehmen), Ergebnisse bleiben. Zuteilen über die Funktion zuteilen.
import { useCallback, useEffect, useState } from 'react'
import { fehlerText } from '../lib/fehler'
import { LEERER_FILTER, passt } from '../lib/filter'
import { supabase } from '../lib/supabase'
import type { Klasse, Paket } from '../lib/typen'
import { ListenFilter, useGemerkt, useKompetenzen } from './ListenFilter'
import { PaketTags } from './PaketTags'

type Kind = { id: string; pseudonym: string }
type PaketZeile = Paket & { paket_aufgaben: { aufgaben: { aufgabe_kompetenzen: { kompetenz_id: string }[] } | null }[] }
type Zuteilung = {
  id: string
  paket_id: string
  klasse_id: string | null
  schueler_id: string | null
  erstellt_am: string
  zuweisung_einzeln: { schueler_id: string; entfernt_am: string | null }[]
}

const SORTIERUNGEN = [
  { wert: 'neu', name: 'neueste zuerst' },
  { wert: 'titel', name: 'Titel (A bis Z)' },
]

const datum = (iso: string) => new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', day: '2-digit', month: '2-digit' }).format(new Date(iso))
const namen = (ids: string[], kinder: Kind[]) =>
  kinder
    .filter((k) => ids.includes(k.id))
    .map((k) => k.pseudonym)
    .join(', ')

export function KlassenAufgaben({ klasse, schueler }: { klasse: Klasse; schueler: Kind[] }) {
  const [ansicht, setAnsicht] = useGemerkt<'aufgaben' | 'hausaufgaben'>('klasse-ansicht', 'aufgaben')
  const [pakete, setPakete] = useState<PaketZeile[] | null>(null)
  const [zuteilungen, setZuteilungen] = useState<Zuteilung[]>([])
  const [fehler, setFehler] = useState<string | null>(null)
  const [meldung, setMeldung] = useState<string | null>(null)
  const [filter, setFilter] = useGemerkt('klasse-pakete-filter', LEERER_FILTER)
  const [sortWert, setSortWert] = useGemerkt('klasse-pakete-sortierung', 'neu')
  const [gewaehlt, setGewaehlt] = useState<string[]>([])
  const [dialog, setDialog] = useState(false)
  const kompetenzen = useKompetenzen(setFehler)
  const schluessel = schueler.map((s) => s.id).join(',')

  const laden = useCallback(async () => {
    const wer = schluessel ? `klasse_id.eq.${klasse.id},schueler_id.in.(${schluessel})` : `klasse_id.eq.${klasse.id}`
    const [p, z] = await Promise.all([
      supabase
        .from('pakete')
        .select('*, paket_aufgaben(aufgaben(aufgabe_kompetenzen(kompetenz_id)))')
        .eq('archiviert', false)
        .order('erstellt_am', { ascending: false }),
      supabase
        .from('zuweisungen')
        .select('id, paket_id, klasse_id, schueler_id, erstellt_am, zuweisung_einzeln(schueler_id, entfernt_am)')
        .is('entfernt_am', null)
        .or(wer),
    ])
    if (p.error || z.error) return setFehler(fehlerText(p.error ?? z.error))
    setPakete(p.data as PaketZeile[])
    setZuteilungen(z.data as Zuteilung[])
  }, [klasse.id, schluessel])

  useEffect(() => {
    void laden()
  }, [laden])

  // Je Paket: wer hat es gerade? (Klassen-Zuteilung ohne Herausgenommene, dazu Einzel-Zuteilungen)
  const zugeteilt = (pakete ?? []).flatMap((p) => {
    const eigene = zuteilungen.filter((z) => z.paket_id === p.id)
    if (eigene.length === 0) return []
    const ganz = eigene.find((z) => z.klasse_id)
    const raus = new Set(ganz?.zuweisung_einzeln.filter((e) => e.entfernt_am).map((e) => e.schueler_id) ?? [])
    const einzeln = new Set(eigene.flatMap((z) => (z.schueler_id ? [z.schueler_id] : [])))
    const haben = schueler.filter((s) => (ganz && !raus.has(s.id)) || einzeln.has(s.id)).map((s) => s.id)
    const seit = eigene.map((z) => z.erstellt_am).sort()[0]
    return [{ paket: p, ganz: !!ganz, haben, seit }]
  })
  const schonZugeteilt = new Set(zugeteilt.map((z) => z.paket.id))

  const ids = (p: PaketZeile) => [...new Set(p.paket_aufgaben.flatMap((pa) => pa.aufgaben?.aufgabe_kompetenzen.map((z) => z.kompetenz_id) ?? []))]
  const gefiltert = pakete?.filter((p) => passt(p.titel, ids(p), filter, kompetenzen, p.zweige))
  const sortiert = sortWert === 'titel' ? gefiltert && [...gefiltert].sort((a, b) => a.titel.localeCompare(b.titel, 'de', { numeric: true })) : gefiltert
  const verwendet = [...new Set((pakete ?? []).flatMap(ids))].flatMap((id) => kompetenzen.get(id) ?? [])

  async function herausnehmen(paket: Paket, kinder: string[] | null) {
    const { error } = await supabase.rpc('herausnehmen', { p_paket: paket.id, p_klasse: klasse.id, p_schueler: kinder })
    if (error) return setFehler(fehlerText(error))
    setFehler(null)
    setMeldung(kinder ? `„${paket.titel}“ für ${namen(kinder, schueler)} herausgenommen. Die Ergebnisse bleiben erhalten.` : `„${paket.titel}“ für die ganze Klasse herausgenommen. Die Ergebnisse bleiben erhalten.`)
    void laden()
  }

  return (
    <>
      <div className="lk-reiter" role="group" aria-label="Ansicht">
        <button type="button" className="lk-knopf" aria-pressed={ansicht === 'aufgaben'} onClick={() => setAnsicht('aufgaben')}>
          Aufgaben
        </button>
        <button type="button" className="lk-knopf" aria-pressed={ansicht === 'hausaufgaben'} onClick={() => setAnsicht('hausaufgaben')}>
          Hausaufgaben
        </button>
      </div>
      {fehler && <p className="lk-hinweis" role="alert">{fehler}</p>}
      {meldung && <p className="lk-erfolg" role="status">{meldung}</p>}

      {ansicht === 'hausaufgaben' ? (
        <section className="lk-abschnitt">
          <h2>Hausaufgaben</h2>
          <p className="lk-leise">Die Hausaufgaben kommen im nächsten Schritt.</p>
        </section>
      ) : (
        <>
          <section className="lk-abschnitt">
            <h2>Zugeteilt an diese Klasse</h2>
            {pakete === null ? (
              <p className="lk-leise" role="status">Lädt …</p>
            ) : zugeteilt.length === 0 ? (
              <p>Noch keine Aufgaben. Wählen Sie unten Pakete aus und tippen Sie auf „Zuteilen“.</p>
            ) : (
              <ul className="lk-liste">
                {zugeteilt.map((z) => (
                  <ZugeteiltZeile key={z.paket.id} {...z} schueler={schueler} herausnehmen={(kinder) => void herausnehmen(z.paket, kinder)} />
                ))}
              </ul>
            )}
          </section>

          <section className="lk-abschnitt">
            <h2>Pakete</h2>
            <p className="lk-leise">Haken Sie Pakete an und tippen Sie auf „Zuteilen“. Archivierte Pakete stehen nicht in der Liste.</p>
            {pakete && pakete.length > 0 && (
              <>
                <ListenFilter filter={filter} onChange={setFilter} verwendet={verwendet} treffer={gefiltert?.length ?? 0} gesamt={pakete.length} suchText="Paketname …" />
                <div className="lk-zeile">
                  <label>
                    Sortieren
                    <select className="lk-feld" value={sortWert} onChange={(e) => setSortWert(e.target.value)}>
                      {SORTIERUNGEN.map((s) => (
                        <option key={s.wert} value={s.wert}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button type="button" className="lk-knopf lk-knopf--haupt" disabled={gewaehlt.length === 0} onClick={() => setDialog(true)}>
                    Zuteilen{gewaehlt.length > 0 && ` (${gewaehlt.length})`}
                  </button>
                </div>
              </>
            )}
            {sortiert === undefined ? null : pakete?.length === 0 ? (
              <p>Noch keine Pakete. Legen Sie unter „Pakete“ das erste an.</p>
            ) : sortiert.length === 0 ? (
              <p>Kein Paket passt zu diesem Filter.</p>
            ) : (
              <ul className="lk-liste">
                {sortiert.map((p) => (
                  <li key={p.id}>
                    <label className="lk-eintrag lk-wahlzeile">
                      <input
                        type="checkbox"
                        checked={gewaehlt.includes(p.id)}
                        onChange={() => setGewaehlt((alt) => (alt.includes(p.id) ? alt.filter((x) => x !== p.id) : [...alt, p.id]))}
                      />
                      <span className="lk-wahltext">
                        <strong>{p.titel}</strong>
                        <span className="lk-leise">
                          {p.paket_aufgaben.length} Übungen{schonZugeteilt.has(p.id) && ' · schon zugeteilt'}
                        </span>
                        <PaketTags jahrgaenge={p.jahrgaenge} zweige={p.zweige} />
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {dialog && pakete && (
        <ZuteilenDialog
          pakete={pakete.filter((p) => gewaehlt.includes(p.id))}
          klasse={klasse}
          onSchliessen={() => setDialog(false)}
          onFertig={(text) => {
            setDialog(false)
            setGewaehlt([])
            setFehler(null)
            setMeldung(text)
            void laden()
          }}
        />
      )}
    </>
  )
}

/** Eine zugeteilte Aufgabe mit „Herausnehmen“ (ganze Klasse oder einzelne Pseudonyme antippen) */
function ZugeteiltZeile(props: { paket: Paket; ganz: boolean; haben: string[]; seit: string; schueler: Kind[]; herausnehmen: (kinder: string[] | null) => void }) {
  const { paket, ganz, haben, seit, schueler } = props
  const [offen, setOffen] = useState(false)
  const [wahl, setWahl] = useState<Set<string>>(new Set())
  const ohne = schueler.filter((s) => !haben.includes(s.id)).map((s) => s.id)
  function los(kinder: string[] | null) {
    setOffen(false)
    setWahl(new Set())
    props.herausnehmen(kinder)
  }
  const wer = ganz
    ? ohne.length === 0
      ? 'ganze Klasse'
      : `ganze Klasse außer ${namen(ohne, schueler)}`
    : `${haben.length === 1 ? '1 Schüler:in' : `${haben.length} Schüler:innen`}: ${namen(haben, schueler)}`

  return (
    <li className="lk-eintrag">
      <span>
        <strong>{paket.titel}</strong>
        <br />
        <span className="lk-leise">
          {wer} · seit {datum(seit)}
        </span>
      </span>
      <button type="button" className="lk-knopf" aria-expanded={offen} onClick={() => setOffen(!offen)}>
        Herausnehmen {offen ? '▴' : '▾'}
      </button>
      {offen && (
        <div className="lk-ganz">
          <p className="lk-leise">Herausnehmen blendet die Aufgabe nur aus. Ergebnisse und Lernstand bleiben erhalten.</p>
          <div className="lk-knopfreihe">
            <button
              type="button"
              className="lk-knopf"
              onClick={() => {
                if (window.confirm(`„${paket.titel}“ für alle in dieser Klasse herausnehmen?\n\nDie Ergebnisse bleiben erhalten.`)) los(null)
              }}
            >
              Für alle herausnehmen
            </button>
          </div>
          <p>Oder nur für einzelne Schüler:innen:</p>
          <div className="lk-chips" role="group" aria-label="Für wen herausnehmen?">
            {schueler
              .filter((s) => haben.includes(s.id))
              .map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="lk-knopf"
                  aria-pressed={wahl.has(s.id)}
                  onClick={() => {
                    const neu = new Set(wahl)
                    if (neu.has(s.id)) neu.delete(s.id)
                    else neu.add(s.id)
                    setWahl(neu)
                  }}
                >
                  {wahl.has(s.id) && '✓ '}
                  {s.pseudonym}
                </button>
              ))}
          </div>
          <div className="lk-knopfreihe">
            <button type="button" className="lk-knopf" disabled={wahl.size === 0} onClick={() => los([...wahl])}>
              Für {wahl.size === 1 ? '1 Ausgewählte:n' : `${wahl.size} Ausgewählte`} herausnehmen
            </button>
          </div>
        </div>
      )}
    </li>
  )
}

/** Fenster „Zuteilen“: Klasse wählen (nur eigene), Schüler:innen antippen (Standard: alle) */
function ZuteilenDialog(props: { pakete: Paket[]; klasse: Klasse; onSchliessen: () => void; onFertig: (text: string) => void }) {
  const [klassen, setKlassen] = useState<Pick<Klasse, 'id' | 'name'>[]>([props.klasse])
  const [klasseId, setKlasseId] = useState(props.klasse.id)
  const [kinder, setKinder] = useState<Kind[] | null>(null)
  const [wahl, setWahl] = useState<Set<string>>(new Set())
  const [fehler, setFehler] = useState<string | null>(null)
  const [laeuft, setLaeuft] = useState(false)
  const { onSchliessen } = props

  useEffect(() => {
    void supabase
      .from('klassen')
      .select('id, name')
      .order('name')
      .then(({ data, error }) => (error ? setFehler(fehlerText(error)) : setKlassen(data)))
  }, [])

  useEffect(() => {
    setKinder(null)
    void supabase
      .from('schueler')
      .select('id, pseudonym')
      .eq('klasse_id', klasseId)
      .then(({ data, error }) => {
        if (error) return setFehler(fehlerText(error))
        const liste = (data as Kind[]).sort((a, b) => a.pseudonym.localeCompare(b.pseudonym, 'de', { numeric: true }))
        setKinder(liste)
        setWahl(new Set(liste.map((k) => k.id)))
      })
  }, [klasseId])

  useEffect(() => {
    const taste = (e: KeyboardEvent) => e.key === 'Escape' && onSchliessen()
    window.addEventListener('keydown', taste)
    return () => window.removeEventListener('keydown', taste)
  }, [onSchliessen])

  const alle = !!kinder && wahl.size === kinder.length
  const klassenName = klassen.find((k) => k.id === klasseId)?.name ?? ''

  async function zuteilen() {
    if (!kinder) return
    setLaeuft(true)
    const { error } = await supabase.rpc('zuteilen', { p_pakete: props.pakete.map((p) => p.id), p_klasse: klasseId, p_schueler: alle ? null : [...wahl] })
    setLaeuft(false)
    if (error) return setFehler(fehlerText(error))
    const was = props.pakete.length === 1 ? `„${props.pakete[0].titel}“` : `${props.pakete.length} Pakete`
    props.onFertig(alle ? `${was} an die ganze Klasse ${klassenName} zugeteilt.` : `${was} an ${namen([...wahl], kinder)} (Klasse ${klassenName}) zugeteilt.`)
  }

  return (
    <div className="lk-dialog-hinter" onClick={(e) => e.target === e.currentTarget && onSchliessen()}>
      <div className="lk-dialog" role="dialog" aria-modal="true" aria-labelledby="zuteilen-titel">
        <h2 id="zuteilen-titel">{props.pakete.length === 1 ? '1 Paket zuteilen' : `${props.pakete.length} Pakete zuteilen`}</h2>
        <p className="lk-leise">{props.pakete.map((p) => p.titel).join(', ')}</p>
        {fehler && <p className="lk-hinweis" role="alert">{fehler}</p>}
        <label>
          Klasse
          <select className="lk-feld" value={klasseId} onChange={(e) => setKlasseId(e.target.value)} autoFocus>
            {klassen.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name}
              </option>
            ))}
          </select>
        </label>
        {kinder === null ? (
          <p className="lk-leise" role="status">Lädt …</p>
        ) : kinder.length === 0 ? (
          <p>In dieser Klasse gibt es noch keine Schüler:innen. Neue Schüler:innen bekommen die Aufgabe automatisch.</p>
        ) : (
          <>
            <label className="lk-wahlzeile">
              <input type="checkbox" checked={alle} onChange={() => setWahl(alle ? new Set() : new Set(kinder.map((k) => k.id)))} />
              alle auswählen
            </label>
            <div className="lk-chips" role="group" aria-label="Für wen?">
              {kinder.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  className="lk-knopf"
                  aria-pressed={wahl.has(k.id)}
                  onClick={() => {
                    const neu = new Set(wahl)
                    if (neu.has(k.id)) neu.delete(k.id)
                    else neu.add(k.id)
                    setWahl(neu)
                  }}
                >
                  {wahl.has(k.id) && '✓ '}
                  {k.pseudonym}
                </button>
              ))}
            </div>
            <p className="lk-leise">
              {alle
                ? 'Die ganze Klasse bekommt die Aufgabe. Neue Schüler:innen dieser Klasse bekommen sie automatisch mit.'
                : 'Nur die Ausgewählten bekommen die Aufgabe.'}
            </p>
          </>
        )}
        <div className="lk-knopfreihe">
          <button type="button" className="lk-knopf" onClick={onSchliessen}>
            Abbrechen
          </button>
          <button type="button" className="lk-knopf lk-knopf--haupt" disabled={laeuft || !kinder || (kinder.length > 0 && wahl.size === 0)} onClick={() => void zuteilen()}>
            Zuteilen
          </button>
        </div>
      </div>
    </div>
  )
}
