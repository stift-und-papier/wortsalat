// Klassen-Aufgaben Teilaufgabe 3 (Jazz 2026-11-18): Ansicht „Hausaufgaben“ im Reiter Aufgaben der Klassenseite.
// Anlegen nur hier (aus einer zugeteilten Aufgabe), laufend oben, vergangen eingeklappt. Klassenliste mit bestem Versuch
// (Lernstand-Zeichen, nur Lehrkraft), Frist/Versuche ändern, freigeben und Versuche neu geben für alle oder einzelne.
import { useCallback, useEffect, useState } from 'react'
import { fehlerText } from '../lib/fehler'
import { berlinFelder, berlinIso, fristText, naechsterSchultag } from '../lib/frist'
import { kindStand, versucheDerUebung, type Durchgang, type HaZeile, type KindStand } from '../lib/hausaufgaben'
import { stufeAusPunkte, type Einstellungen } from '../lib/lernstand'
import { supabase } from '../lib/supabase'
import type { Klasse } from '../lib/typen'
import { StufenFeld } from './LernstandAnzeige'

type Kind = { id: string; pseudonym: string; erstellt_am: string }
type Uebung = { id: string; titel: string; typ: string; stufe: number }
type PaketInfo = { id: string; titel: string; paket_aufgaben: { position: number; aufgaben: Uebung | null }[] }
type Zeile = HaZeile & { pakete: PaketInfo | null; erstellt_am: string }
type Gruppe = { schluessel: string; paket: PaketInfo; zeilen: Zeile[]; kinder: { kind: Kind; stand: KindStand }[]; laufend: boolean; frist: string | null; aktiv: boolean }

const uebungenVon = (p: PaketInfo) =>
  [...p.paket_aufgaben]
    .sort((a, b) => a.position - b.position)
    .flatMap((pa) => (pa.aufgaben && pa.aufgaben.typ !== 'erklaerung' ? [pa.aufgaben] : []))
const versucheText = (n: number | null) => (n === null ? 'beliebig oft' : n === 1 ? '1 Versuch je Übung' : `${n} Versuche je Übung`)
const zeit = (iso: string) =>
  new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
const tag = (iso: string) => new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', day: '2-digit', month: '2-digit' }).format(new Date(iso))

export function KlassenHausaufgaben({ klasse }: { klasse: Klasse }) {
  const [daten, setDaten] = useState<{ zeilen: Zeile[]; aktiv: { paket_id: string; titel: string; hausaufgabe_ab: string | null }[]; kinder: Kind[]; durchgaenge: Durchgang[]; e: Einstellungen } | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)
  const [meldung, setMeldung] = useState<string | null>(null)
  const [offen, setOffen] = useState<string | null>(null)
  const [neu, setNeu] = useState(false)

  const laden = useCallback(async () => {
    const k = await supabase.from('schueler').select('id, pseudonym, erstellt_am').eq('klasse_id', klasse.id).order('pseudonym')
    if (k.error) return setFehler(fehlerText(k.error))
    const kinder = k.data as Kind[]
    const wer = kinder.length ? `klasse_id.eq.${klasse.id},schueler_id.in.(${kinder.map((s) => s.id).join(',')})` : `klasse_id.eq.${klasse.id}`
    const [z, e] = await Promise.all([
      supabase
        .from('zuweisungen')
        .select('id, paket_id, klasse_id, schueler_id, erstellt_am, entfernt_am, hausaufgabe_ab, frist, versuche_erlaubt, freigegeben_am, zuweisung_einzeln(schueler_id, entfernt_am, neustart_ab, frist, freigegeben_am), pakete(id, titel, archiviert, paket_aufgaben(position, aufgaben(id, titel, typ, stufe)))')
        .or(wer),
      supabase.from('einstellungen').select('*').single(),
    ])
    if (z.error || e.error) return setFehler(fehlerText(z.error ?? e.error))
    const alle = (z.data as unknown as (Zeile & { pakete: (PaketInfo & { archiviert: boolean }) | null })[]).filter((x) => x.pakete && !x.pakete.archiviert)
    const zeilen = alle.filter((x) => x.hausaufgabe_ab)
    const ids = [...new Set(zeilen.flatMap((x) => uebungenVon(x.pakete!).map((u) => u.id)))]
    const d = ids.length && kinder.length
      ? await supabase.from('durchgaenge').select('schueler_id, aufgabe_id, begonnen_am, fertig_am, anteil').in('aufgabe_id', ids).in('schueler_id', kinder.map((s) => s.id)).not('fertig_am', 'is', null)
      : { data: [], error: null }
    if (d.error) return setFehler(fehlerText(d.error))
    const aktiv = alle.filter((x) => !x.entfernt_am).map((x) => ({ paket_id: x.paket_id, titel: x.pakete!.titel, hausaufgabe_ab: x.hausaufgabe_ab }))
    setDaten({ zeilen, aktiv, kinder, durchgaenge: d.data as Durchgang[], e: e.data as Einstellungen })
  }, [klasse.id])

  useEffect(() => {
    void laden()
  }, [laden])

  // Eine Hausaufgabe = alle Zeilen eines Pakets mit demselben Beginn (so legt hausaufgabe_machen sie an)
  const gruppen: Gruppe[] = []
  for (const z of daten?.zeilen ?? []) {
    const schluessel = `${z.paket_id}|${Date.parse(z.hausaufgabe_ab)}`
    const g = gruppen.find((x) => x.schluessel === schluessel)
    if (g) g.zeilen.push(z)
    else gruppen.push({ schluessel, paket: z.pakete!, zeilen: [z], kinder: [], laufend: false, frist: z.frist, aktiv: false })
  }
  for (const g of gruppen) {
    g.kinder = (daten?.kinder ?? []).flatMap((kind) => {
      const stand = kindStand(g.zeilen, kind)
      return stand ? [{ kind, stand }] : []
    })
    g.laufend = g.kinder.some((k) => k.stand.status === 'laufend')
    g.aktiv = g.zeilen.some((z) => !z.entfernt_am)
  }
  const laufend = gruppen.filter((g) => g.laufend).sort((a, b) => (a.frist ?? '').localeCompare(b.frist ?? ''))
  const vergangen = gruppen.filter((g) => !g.laufend).sort((a, b) => (b.frist ?? '').localeCompare(a.frist ?? ''))
  const gezeigt = gruppen.find((g) => g.schluessel === offen)
  const fertig = (g: Gruppe) => g.kinder.filter(({ kind, stand }) => uebungenVon(g.paket).every((u) => versucheDerUebung(daten!.durchgaenge, kind.id, u.id, stand).liste.length > 0)).length

  async function rufe(name: string, args: Record<string, unknown>, text: string) {
    const { error } = await supabase.rpc(name, args)
    if (error) return setFehler(fehlerText(error))
    setFehler(null)
    setMeldung(text)
    await laden()
  }

  if (!daten) return fehler ? <p className="lk-hinweis" role="alert">{fehler}</p> : <p className="lk-leise" role="status">Lädt …</p>

  const meldungen = (
    <>
      {fehler && <p className="lk-hinweis" role="alert">{fehler}</p>}
      {meldung && <p className="lk-erfolg" role="status">{meldung}</p>}
    </>
  )

  if (gezeigt)
    return (
      <>
        <button type="button" className="lk-zurueck" onClick={() => setOffen(null)}>
          ← Hausaufgaben
        </button>
        {meldungen}
        <KlassenListe gruppe={gezeigt} klasse={klasse} durchgaenge={daten.durchgaenge} e={daten.e} rufe={rufe} />
      </>
    )

  // Anlegen: zugeteilte Aufgaben, die gerade keine laufende Hausaufgabe sind
  const laufendePakete = new Set(laufend.filter((g) => g.aktiv).map((g) => g.paket.id))
  const waehlbar = [...new Map(daten.aktiv.filter((a) => !laufendePakete.has(a.paket_id)).map((a) => [a.paket_id, a.titel])).entries()]

  const eintrag = (g: Gruppe) => {
    const z = g.zeilen[0]
    const frei = g.zeilen.find((x) => x.freigegeben_am)?.freigegeben_am
    const ende = g.zeilen.find((x) => x.entfernt_am)?.entfernt_am
    return (
      <li key={g.schluessel}>
        <button type="button" className="lk-eintrag" onClick={() => { setMeldung(null); setOffen(g.schluessel) }}>
          <strong>{g.paket.titel}</strong>
          <span className="lk-leise">
            {z.frist ? `bis ${fristText(z.frist)}` : 'ohne Frist'} · {versucheText(z.versuche_erlaubt)} ·{' '}
            {g.kinder.length === daten.kinder.length ? 'ganze Klasse' : `${g.kinder.length} Schüler:innen`} · {fertig(g)} von {g.kinder.length} fertig
            {frei && ` · freigegeben am ${tag(frei)}`}
            {!frei && ende && ` · beendet am ${tag(ende)}`}
          </span>
        </button>
      </li>
    )
  }

  return (
    <>
      {meldungen}
      <section className="lk-abschnitt">
        <h2>Hausaufgaben</h2>
        <p className="lk-leise">Eine Hausaufgabe ist eine zugeteilte Aufgabe mit Frist und Versuchszahl. Nach der Frist ist sie gesperrt, bis Sie sie verlängern oder freigeben.</p>
        {!neu ? (
          <div className="lk-knopfreihe">
            <button type="button" className="lk-knopf lk-knopf--haupt" disabled={waehlbar.length === 0} onClick={() => setNeu(true)}>
              + Hausaufgabe aus einer Aufgabe machen
            </button>
          </div>
        ) : (
          <NeueHausaufgabe
            waehlbar={waehlbar}
            onAbbrechen={() => setNeu(false)}
            onAnlegen={(paket, titel, frist, versuche) => {
              setNeu(false)
              void rufe('hausaufgabe_machen', { p_paket: paket, p_klasse: klasse.id, p_frist: frist, p_versuche: versuche }, `„${titel}“ ist jetzt eine Hausaufgabe bis ${fristText(frist)}.`)
            }}
          />
        )}
        {waehlbar.length === 0 && !neu && <p className="lk-leise">Teilen Sie der Klasse zuerst unter „Aufgaben“ ein Paket zu.</p>}
      </section>

      <section className="lk-abschnitt">
        <h3>Laufend</h3>
        {laufend.length === 0 ? <p className="lk-leise">Gerade läuft keine Hausaufgabe.</p> : <ul className="lk-liste">{laufend.map(eintrag)}</ul>}
      </section>

      {vergangen.length > 0 && (
        <details className="lk-abschnitt">
          <summary className="lk-aufklapp">Vergangen ({vergangen.length})</summary>
          <ul className="lk-liste">{vergangen.map(eintrag)}</ul>
        </details>
      )}
    </>
  )
}

/** Frist (Datum und Uhrzeit, Berlin) und auf Wunsch Versuche */
function FristFelder(props: { datum: string; uhr: string; onChange: (d: string, u: string) => void }) {
  return (
    <div className="lk-zeile">
      <label>
        Frist: Datum
        <input className="lk-feld" type="date" required value={props.datum} onChange={(e) => props.onChange(e.target.value, props.uhr)} />
      </label>
      <label>
        Uhrzeit
        <input className="lk-feld" type="time" required value={props.uhr} onChange={(e) => props.onChange(props.datum, e.target.value)} />
      </label>
    </div>
  )
}

function VersucheFelder(props: { wert: number | null; onChange: (n: number | null) => void }) {
  return (
    <fieldset className="lk-feldgruppe">
      <legend>Versuche je Übung</legend>
      <label className="lk-wahlzeile">
        <input type="radio" name="versuche" checked={props.wert === null} onChange={() => props.onChange(null)} />
        beliebig oft
      </label>
      <label className="lk-wahlzeile">
        <input type="radio" name="versuche" checked={props.wert !== null} onChange={() => props.onChange(1)} />
        begrenzt auf
        <input
          className="lk-feld lk-feld--zahl"
          type="number"
          min={1}
          max={20}
          aria-label="Anzahl Versuche"
          value={props.wert ?? 1}
          onChange={(e) => props.onChange(Math.min(20, Math.max(1, Number(e.target.value) || 1)))}
        />
      </label>
    </fieldset>
  )
}

function NeueHausaufgabe(props: { waehlbar: [string, string][]; onAbbrechen: () => void; onAnlegen: (paket: string, titel: string, frist: string, versuche: number | null) => void }) {
  const [paket, setPaket] = useState(props.waehlbar[0]?.[0] ?? '')
  const [f, setF] = useState(naechsterSchultag())
  const [versuche, setVersuche] = useState<number | null>(1)
  const [fehler, setFehler] = useState<string | null>(null)
  return (
    <form
      className="lk-ganz"
      onSubmit={(e) => {
        e.preventDefault()
        const frist = berlinIso(f.datum, f.uhr)
        if (Date.parse(frist) <= Date.now()) return setFehler('Die Frist muss in der Zukunft liegen.')
        props.onAnlegen(paket, props.waehlbar.find(([id]) => id === paket)?.[1] ?? '', frist, versuche)
      }}
    >
      <label>
        Aufgabe
        <select className="lk-feld" value={paket} onChange={(e) => setPaket(e.target.value)}>
          {props.waehlbar.map(([id, titel]) => (
            <option key={id} value={id}>
              {titel}
            </option>
          ))}
        </select>
      </label>
      <FristFelder datum={f.datum} uhr={f.uhr} onChange={(datum, uhr) => setF({ datum, uhr })} />
      <VersucheFelder wert={versuche} onChange={setVersuche} />
      {fehler && <p className="lk-hinweis" role="alert">{fehler}</p>}
      <div className="lk-knopfreihe">
        <button type="button" className="lk-knopf" onClick={props.onAbbrechen}>
          Abbrechen
        </button>
        <button className="lk-knopf lk-knopf--haupt">Hausaufgabe anlegen</button>
      </div>
    </form>
  )
}

const STATUS_TEXT = { laufend: '', ohne_frist: 'ohne Frist', vorbei: 'Frist vorbei', freigegeben: 'freigegeben', beendet: 'beendet' }

/** Klassenliste einer Hausaufgabe: je Kind und Übung, ob, wann, wie oft und wie gut (bester Versuch) */
function KlassenListe(props: { gruppe: Gruppe; klasse: Klasse; durchgaenge: Durchgang[]; e: Einstellungen; rufe: (name: string, args: Record<string, unknown>, text: string) => Promise<void> }) {
  const { gruppe: g, klasse, e } = props
  const z = g.zeilen[0]
  const uebungen = uebungenVon(g.paket)
  const [wahl, setWahl] = useState<Set<string>>(new Set())
  const [aendern, setAendern] = useState(false)
  const [f, setF] = useState(z.frist ? berlinFelder(z.frist) : naechsterSchultag())
  const [versuche, setVersuche] = useState<number | null>(z.versuche_erlaubt)
  const [fehler, setFehler] = useState<string | null>(null)
  const basis = { p_paket: g.paket.id, p_klasse: klasse.id }
  const ausgewaehlt = [...wahl]
  const wer = g.kinder.filter((k) => wahl.has(k.kind.id)).map((k) => k.kind.pseudonym).join(', ')

  function fristOk() {
    const frist = berlinIso(f.datum, f.uhr)
    if (Date.parse(frist) <= Date.now()) {
      setFehler('Die Frist muss in der Zukunft liegen.')
      return null
    }
    setFehler(null)
    return frist
  }
  const fertigMit = (p: Promise<void>) => void p.then(() => setWahl(new Set()))

  return (
    <>
      <h2>{g.paket.titel}</h2>
      <p className="lk-leise">
        {z.frist ? `bis ${fristText(z.frist)}` : 'ohne Frist'} · {versucheText(z.versuche_erlaubt)}
      </p>

      {g.aktiv && (
        <section className="lk-abschnitt">
          <h3>Für alle</h3>
          {!aendern ? (
            <div className="lk-knopfreihe">
              <button type="button" className="lk-knopf" onClick={() => { setF(z.frist ? berlinFelder(z.frist) : naechsterSchultag()); setVersuche(z.versuche_erlaubt); setAendern(true) }}>
                Frist und Versuche ändern
              </button>
              <button
                type="button"
                className="lk-knopf"
                onClick={() => {
                  if (window.confirm(`„${g.paket.titel}“ für alle unbegrenzt freigeben?\n\nDanach ist es eine normale Aufgabe ohne Frist.`))
                    void props.rufe('hausaufgabe_freigeben', { ...basis, p_schueler: null }, 'Für alle freigegeben.')
                }}
              >
                Für alle freigeben
              </button>
              <button
                type="button"
                className="lk-knopf"
                onClick={() => {
                  if (window.confirm('Allen die Versuche neu geben?\n\nEs wird nichts gelöscht, nur die Zählung beginnt neu.'))
                    void props.rufe('hausaufgabe_neustart', { ...basis, p_schueler: null }, 'Alle haben ihre Versuche neu bekommen.')
                }}
              >
                Versuche für alle neu geben
              </button>
            </div>
          ) : (
            <form
              className="lk-ganz"
              onSubmit={(ev) => {
                ev.preventDefault()
                const frist = fristOk()
                if (!frist) return
                setAendern(false)
                void props.rufe('hausaufgabe_aendern', { ...basis, p_frist: frist, p_versuche: versuche, p_schueler: null }, `Geändert: bis ${fristText(frist)}, ${versucheText(versuche)}.`)
              }}
            >
              <FristFelder datum={f.datum} uhr={f.uhr} onChange={(datum, uhr) => setF({ datum, uhr })} />
              <VersucheFelder wert={versuche} onChange={setVersuche} />
              <p className="lk-leise">Eigene Fristen einzelner Schüler:innen werden dabei ersetzt.</p>
              <div className="lk-knopfreihe">
                <button type="button" className="lk-knopf" onClick={() => setAendern(false)}>
                  Abbrechen
                </button>
                <button className="lk-knopf lk-knopf--haupt">Für alle speichern</button>
              </div>
            </form>
          )}

          <h3>Für einzelne Schüler:innen</h3>
          <div className="lk-chips" role="group" aria-label="Schüler:innen auswählen">
            {g.kinder.map(({ kind }) => (
              <button
                key={kind.id}
                type="button"
                className="lk-knopf"
                aria-pressed={wahl.has(kind.id)}
                onClick={() => {
                  const neu = new Set(wahl)
                  if (neu.has(kind.id)) neu.delete(kind.id)
                  else neu.add(kind.id)
                  setWahl(neu)
                }}
              >
                {wahl.has(kind.id) && '✓ '}
                {kind.pseudonym}
              </button>
            ))}
          </div>
          {wahl.size > 0 && (
            <div className="lk-ganz">
              <FristFelder datum={f.datum} uhr={f.uhr} onChange={(datum, uhr) => setF({ datum, uhr })} />
              <div className="lk-knopfreihe">
                <button
                  type="button"
                  className="lk-knopf"
                  onClick={() => {
                    const frist = fristOk()
                    if (frist) fertigMit(props.rufe('hausaufgabe_aendern', { ...basis, p_frist: frist, p_versuche: z.versuche_erlaubt, p_schueler: ausgewaehlt }, `Neue Frist für ${wer}: bis ${fristText(frist)}.`))
                  }}
                >
                  Eigene Frist setzen
                </button>
                <button
                  type="button"
                  className="lk-knopf"
                  onClick={() => {
                    if (window.confirm(`Für ${wer} unbegrenzt freigeben?`)) fertigMit(props.rufe('hausaufgabe_freigeben', { ...basis, p_schueler: ausgewaehlt }, `Für ${wer} freigegeben.`))
                  }}
                >
                  Freigeben
                </button>
                <button
                  type="button"
                  className="lk-knopf"
                  onClick={() => {
                    if (window.confirm(`${wer} die Versuche neu geben?\n\nEs wird nichts gelöscht.`)) fertigMit(props.rufe('hausaufgabe_neustart', { ...basis, p_schueler: ausgewaehlt }, `${wer} hat die Versuche neu bekommen.`))
                  }}
                >
                  Versuche neu geben
                </button>
              </div>
            </div>
          )}
          {fehler && <p className="lk-hinweis" role="alert">{fehler}</p>}
        </section>
      )}

      <section className="lk-abschnitt lk-rollen">
        <table className="lk-tabelle">
          <thead>
            <tr>
              <th>Pseudonym</th>
              {uebungen.map((u, i) => (
                <th key={u.id}>
                  Übung {i + 1}: {u.titel}
                </th>
              ))}
              <th>Frist</th>
            </tr>
          </thead>
          <tbody>
            {g.kinder.map(({ kind, stand }) => (
              <tr key={kind.id}>
                <td>{kind.pseudonym}</td>
                {uebungen.map((u) => {
                  const v = versucheDerUebung(props.durchgaenge, kind.id, u.id, stand)
                  if (v.liste.length === 0) return <td key={u.id} className="lk-leise">noch nicht fertig</td>
                  const punkte = (v.bester ?? 0) * (u.stufe === 1 ? e.punkte_leicht : u.stufe === 2 ? e.punkte_mittel : e.punkte_schwer)
                  const erlaubt = stand.zeile.versuche_erlaubt
                  return (
                    <td key={u.id}>
                      <StufenFeld a={{ stufe: stufeAusPunkte(punkte, e), trend_gueltig: false, trend_punkte: null }} titel="bester Versuch" />{' '}
                      {v.liste.length === 1 ? '1 Versuch' : `${v.liste.length} Versuche`}
                      {erlaubt !== null && stand.status === 'laufend' && <span className="lk-leise"> · noch {Math.max(0, erlaubt - v.zaehlen)}</span>}
                      <details>
                        <summary className="lk-leise">wann?</summary>
                        {v.liste.map((d) => (
                          <div key={d.fertig_am}>{zeit(d.fertig_am!)} Uhr</div>
                        ))}
                      </details>
                    </td>
                  )
                })}
                <td>{stand.status === 'laufend' || (stand.status === 'vorbei' && stand.frist) ? `${stand.status === 'vorbei' ? 'vorbei: ' : 'bis '}${fristText(stand.frist!)}` : STATUS_TEXT[stand.status]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  )
}
