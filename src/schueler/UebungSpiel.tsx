// Übungsumbau Schritt 8 und 9, Lehrkraftseite Teilaufgabe 3 (Diktat, Fallende Wörter): eine Übung spielen. Ablauf (Konzept Abschnitt 10):
// uebung_starten → je Runde einmal „Prüfen“ (runde_pruefen), danach Lösung sichtbar und „Weiter“ → Abschluss mit Münzen.
// Der Server wertet alles; die App zeigt nur. Ohne Internet bleibt die Eingabe stehen („Nochmal senden“).
import { useEffect, useRef, useState } from 'react'
import { Abschreiben } from '../gemeinsam/DiktatAnzeige'
import { Eingabe } from '../gemeinsam/Eingabe'
import { FeststellHinweis } from '../gemeinsam/FeststellHinweis'
import { FallendeWoerter, type WortErgebnis } from '../gemeinsam/FallendeWoerter'
import { falscheWoerter, vereinheitliche } from '../lib/diktat'
import { Anweisung } from '../gemeinsam/Anweisung'
import { alleBeantwortet, nochOffenText } from '../gemeinsam/AufgabeBearbeiten'
import { EinsteinSagt } from '../gemeinsam/Einstein'
import { LueckentextAnzeige } from '../gemeinsam/LueckentextAnzeige'
import { MuenzenPlus } from '../gemeinsam/MuenzenPlus'
import { fehlerText, istNetzwerkfehler } from '../lib/fehler'
import { supabase } from '../lib/supabase'
import type { Antwort, Antworten, Durchgang, Loesung, Pruefergebnis, RundeErgebnis, SchuelerAufgabe } from '../lib/typen'
import { Spielszene, type Schuss } from './Spielszene'

// Formate, die als Spiel laufen
const IM_SPIEL = new Set(['lueckentext', 'auswahl', 'zuordnen', 'fehler', 'reihenfolge', 'ueberarbeiten', 'diktat', 'fallende_woerter'])

// Texte von Jazz (Schritt 3 und 8)
const TEXT_FREUND = 'Juhu, ihr seid jetzt Freunde! Das Monster hat sich über deine Herzen gefreut.'
const TEXT_MORGEN = 'Das Monster braucht noch etwas Zeit, um Freundschaft zu schließen. Morgen kannst du es noch einmal versuchen!'
// Vorschlag Claude (Schritt 8): schon befreundet, diesmal nicht alles richtig
const TEXT_SCHON_FREUND = 'Ihr seid schon Freunde. Morgen kannst du wieder mit dem Monster üben.'
// Übung ohne Monster (Jazz 2026-11-15, Vorschlag Claude)
const OHNE = { freund: 'Geschafft! Du hast alles richtig gemacht.', morgen: 'Morgen kannst du es noch einmal versuchen!', schon: 'Diese Übung hast du schon einmal ganz geschafft. Morgen kannst du wieder üben.' }

type Props = {
  token: string
  paketId: string
  aufgabe: SchuelerAufgabe
  /** nach der letzten Runde: Startdaten neu laden (Münzen, Paketliste) */
  nachAbschluss: () => void
  naechste: string | null
  /** gewählte Spielfigur (Einstellungen) */
  figur: string
  zumPaket: string
}

type Gespielt = { richtig: boolean; ergebnis: Pruefergebnis; loesung: Loesung; antworten?: Antworten }

const loesungenAus = (l: Loesung) => Object.fromEntries(l.luecken.map((x) => [x.id, x.loesungen]))

export function UebungSpiel({ token, paketId, aufgabe, nachAbschluss, naechste, zumPaket, figur }: Props) {
  const [daten, setDaten] = useState<Durchgang | null>(null)
  const [ladeFehler, setLadeFehler] = useState<string | null>(null)
  const [index, setIndex] = useState(0)
  const [gespielt, setGespielt] = useState<Gespielt[]>([])
  const [antworten, setAntworten] = useState<Antworten>({})
  const [schuss, setSchuss] = useState<Schuss | null>(null)
  const [beschaeftigt, setBeschaeftigt] = useState(false)
  const [meldung, setMeldung] = useState<{ text: string; offline: boolean } | null>(null)
  // Abschluss kommt mit der letzten Runde, gezeigt wird er erst nach „Weiter“ (vorher fliegt noch das Herz)
  const [abschlussDaten, setAbschlussDaten] = useState<RundeErgebnis['abschluss']>(null)
  const [abschluss, setAbschluss] = useState<RundeErgebnis['abschluss']>(null)
  const [tippOffen, setTippOffen] = useState(false)
  // Diktat und Fallende Wörter: jedes Herz ist ein eigener Schuss (Zähler startet die Animation neu)
  const schussNr = useRef(0)
  const schiessen = (treffer: boolean) => setSchuss({ nr: ++schussNr.current, treffer })
  const richtigeZeichen = useRef(0)
  // Merkdiktat: Teil ansehen → tippen
  const [merkPhase, setMerkPhase] = useState<'merken' | 'tippen'>('merken')
  const [merkText, setMerkText] = useState('')
  // Fallende Wörter: alle Wörter sind weg; noch nicht gesendete Ergebnisse (ohne Internet)
  const [regenFertig, setRegenFertig] = useState(false)
  const [offen, setOffen] = useState<{ nr: number; antworten: Antworten }[]>([])

  const imSpiel = IM_SPIEL.has(aufgabe.typ)
  useEffect(() => {
    // noch nicht angebundene Formate: keinen Durchgang anlegen
    if (!imSpiel) return
    let aus = false
    void supabase.rpc('uebung_starten', { p_token: token, p_paket_id: paketId, p_aufgabe_id: aufgabe.id }).then(({ data, error }) => {
      if (aus) return
      if (error) return setLadeFehler(fehlerText(error))
      const d = data as Durchgang
      setDaten(d)
      // angefangener Durchgang: bei der ersten offenen Runde weitermachen
      if (d.status === 'offen') {
        setGespielt(d.gespielt)
        setIndex(Math.min(d.gespielt.length, d.runden.length - 1))
      }
    })
    return () => {
      aus = true
    }
  }, [token, paketId, aufgabe.id, imSpiel])

  const merkdiktatSichtbar = daten?.status === 'offen' && aufgabe.typ === 'diktat' && daten.runden[index]?.inhalt.modus === 'merken' && !gespielt[index] && merkPhase === 'merken' && !abschluss
  useEffect(() => {
    if (!merkdiktatSichtbar) return
    const taste = (e: KeyboardEvent) => {
      if (e.key !== ' ' || (e.target as HTMLElement | null)?.closest?.('input, textarea, button')) return
      e.preventDefault()
      setMerkPhase('tippen')
    }
    window.addEventListener('keydown', taste)
    return () => window.removeEventListener('keydown', taste)
  }, [merkdiktatSichtbar])

  // Fallende Wörter: Abschluss erst, wenn auch die Wiederholungen weg sind
  useEffect(() => {
    if (regenFertig && abschlussDaten && !abschluss) setAbschluss(abschlussDaten)
  }, [regenFertig, abschlussDaten, abschluss])

  if (!imSpiel) return <p className="karte">Diese Übung kommt bald.</p>
  if (ladeFehler) return <p className="karte" role="alert">{ladeFehler}</p>
  if (!daten) return <p className="karte" role="status">Einen Moment …</p>

  if (daten.status === 'morgen') {
    return (
      <>
        {daten.monster !== 'kein' && <Spielszene figurName={figur} monsterName={daten.monster} schuss={null} befreundet={daten.befreundet} ende="morgen" />}
        <div className="karte aufgabe">
          <p>{daten.monster === 'kein' ? (daten.befreundet ? OHNE.schon : 'Heute hast du diese Übung schon gemacht. ' + OHNE.morgen) : daten.befreundet ? TEXT_SCHON_FREUND : 'Heute hast du mit diesem Monster schon geübt. Morgen kannst du es noch einmal versuchen!'}</p>
          <div className="knopf-reihe">
            <a className="knopf knopf--haupt" href={zumPaket}>Zurück zum Paket</a>
          </div>
        </div>
      </>
    )
  }

  const runde = daten.runden[index]
  const jetzt = gespielt[index] as Gespielt | undefined
  const befreundetVorher = daten.befreundet
  const anzahl = daten.runden.length

  // ---------- Abschluss ----------
  if (abschluss) {
    // Diktat: Freundschaft ab 95 % rechnet nur der Server
    const allesRichtig = aufgabe.typ === 'diktat' ? abschluss.neu_befreundet : gespielt.every((g) => g.richtig)
    const ohne = daten.monster === 'kein'
    const text = allesRichtig ? (ohne ? OHNE.freund : TEXT_FREUND) : abschluss.befreundet ? (ohne ? OHNE.schon : TEXT_SCHON_FREUND) : ohne ? OHNE.morgen : TEXT_MORGEN
    return (
      <>
        {daten.monster !== 'kein' && <Spielszene figurName={figur} monsterName={daten.monster} schuss={null} befreundet={abschluss.befreundet} ende={allesRichtig ? 'freund' : 'morgen'} />}
        <div className="karte aufgabe">
          <EinsteinSagt pose={allesRichtig ? 'freut-sich' : 'erklaert'}>
            <p>{text}</p>
          </EinsteinSagt>
          {abschluss.muenzen > 0 ? (
            <MuenzenPlus anzahl={abschluss.muenzen} />
          ) : (
            <p>Diesmal gibt es keine neuen Münzen. Versuche dich zu verbessern!</p>
          )}
          <div className="knopf-reihe">
            {naechste && (
              <a className="knopf knopf--haupt" href={naechste}>
                Zur nächsten Übung
              </a>
            )}
            <a className={naechste ? 'knopf' : 'knopf knopf--haupt'} href={zumPaket}>
              Zurück zum Paket
            </a>
          </div>
        </div>
      </>
    )
  }

  // ---------- eine Runde ----------
  const alleAusgefuellt = alleBeantwortet(runde.inhalt.teile, antworten)

  // Eine Runde an den Server; i = Stelle im Durchgang. Ergebnis null = nicht angekommen (Meldung steht da)
  async function senden(i: number, a: Antworten): Promise<RundeErgebnis | null> {
    if (!daten || daten.status !== 'offen') return null
    setBeschaeftigt(true)
    setMeldung(null)
    const { data, error } = await supabase.rpc('runde_pruefen', { p_token: token, p_durchgang: daten.durchgang, p_nr: daten.runden[i].nr, p_antworten: a })
    setBeschaeftigt(false)
    if (error) {
      setMeldung(
        istNetzwerkfehler(error)
          ? { text: 'Gerade ist kein Internet da. Deine Eingabe bleibt stehen. Tippe gleich auf „Nochmal senden“.', offline: true }
          : { text: fehlerText(error), offline: false },
      )
      return null
    }
    const r = data as RundeErgebnis
    setGespielt((alt) => {
      const neu = [...alt]
      neu[i] = { richtig: r.richtig, ergebnis: r.ergebnis, loesung: r.loesung, antworten: a }
      return neu
    })
    if (r.abschluss) {
      setAbschlussDaten(r.abschluss)
      nachAbschluss()
    }
    return r
  }

  async function pruefen() {
    const r = await senden(index, antworten)
    if (r) setSchuss({ nr: index, treffer: r.richtig })
  }

  // Fallende Wörter: jedes Wort sofort senden; ohne Internet sammeln
  async function wortSenden(i: number, e: WortErgebnis) {
    const a = { fehler: e.fehler, gelandet: e.gelandet }
    schiessen(e.fehler === 0 && !e.gelandet)
    if (!(await senden(i, a))) setOffen((alt) => [...alt, { nr: i, antworten: a }])
  }
  async function nochmalSenden() {
    const liste = offen
    setOffen([])
    for (const o of liste) if (!(await senden(o.nr, o.antworten))) setOffen((alt) => [...alt, o])
  }

  function weiter() {
    if (abschlussDaten || index === anzahl - 1) {
      setAbschluss(abschlussDaten ?? { befreundet: befreundetVorher, neu_befreundet: false, muenzen: 0, kontostand: 0 })
      return
    }
    setIndex(index + 1)
    setAntworten({})
    setTippOffen(false)
    setMeldung(null)
    setMerkPhase('merken')
    setMerkText('')
  }

  const kopf = (
    <>
      <header className="aufgabe__kopf">
        <h2>{aufgabe.titel}</h2>
        {aufgabe.typ === 'diktat' && runde.inhalt.modus !== 'merken' ? null : (
          <span className="leise">
            {aufgabe.typ === 'fallende_woerter' ? `${daten.runden.length} Wörter` : aufgabe.typ === 'diktat' ? 'Teil' : 'Runde'}
            {aufgabe.typ === 'fallende_woerter' ? '' : ` ${index + 1} von ${daten.runden.length}`}
          </span>
        )}
      </header>
      {aufgabe.anweisung && (
        <div className="aufgabe__anweisung">
          <Anweisung text={aufgabe.anweisung} farbig={aufgabe.farbig} />
        </div>
      )}
    </>
  )
  const weiterKnopf = (
    <button type="button" className="knopf knopf--haupt" onClick={weiter} autoFocus>
      Weiter
    </button>
  )

  // ---------- Fallende Wörter: ein Regen für den ganzen Durchgang ----------
  if (aufgabe.typ === 'fallende_woerter') {
    // angefangener Durchgang: nur die noch offenen Wörter fallen
    const start = daten.gespielt.length
    return (
      <>
        {daten.monster !== 'kein' && <Spielszene figurName={figur} monsterName={daten.monster} schuss={schuss} befreundet={befreundetVorher} />}
        <div className="karte aufgabe">
          {kopf}
          <FallendeWoerter
            woerter={daten.runden.slice(start).map((x) => x.inhalt.wort ?? '')}
            einstellungen={daten.spiel ?? {}}
            onWort={(i, e) => void wortSenden(start + i, e)}
            onFertig={() => setRegenFertig(true)}
          />
          {meldung && <p role="alert">{meldung.text}</p>}
          {offen.length > 0 && (
            <div className="knopf-reihe">
              <button type="button" className="knopf knopf--haupt" onClick={() => void nochmalSenden()} disabled={beschaeftigt}>
                Nochmal senden
              </button>
            </div>
          )}
        </div>
      </>
    )
  }

  // ---------- Diktat ----------
  if (aufgabe.typ === 'diktat') {
    const merken = runde.inhalt.modus === 'merken'
    const soll = vereinheitliche((runde.inhalt.saetze ?? []).join(' '))
    const zeichenJeHerz = daten.spiel?.zeichen_je_herz ?? 10
    const fehlerZahl = jetzt
      ? merken
        ? falscheWoerter(soll, String(jetzt.antworten?.[0] ?? '')).length
        : Array.isArray(jetzt.antworten?.fehler)
          ? jetzt.antworten.fehler.length
          : 0
      : 0
    const markiert = jetzt && merken ? falscheWoerter(soll, String(jetzt.antworten?.[0] ?? '')) : []
    return (
      <>
        {daten.monster !== 'kein' && <Spielszene figurName={figur} monsterName={daten.monster} schuss={schuss} befreundet={befreundetVorher} />}
        <div className="karte aufgabe">
          {kopf}
          {!jetzt && !merken && (
            <Abschreiben
              key={runde.nr}
              text={soll}
              onZeichen={(art) => {
                if (art === 'falsch') return schiessen(false)
                if (art === 'richtig' && ++richtigeZeichen.current % zeichenJeHerz === 0) schiessen(true)
              }}
              onFertig={(a) => {
                setAntworten(a)
                void senden(index, a)
              }}
            />
          )}
          {!jetzt && merken && merkPhase === 'merken' && (
            <div className="diktat">
              <p className="diktat__satz">{soll}</p>
              <div className="knopf-reihe">
                <button type="button" className="knopf knopf--haupt" autoFocus onClick={() => setMerkPhase('tippen')}>
                  Gemerkt
                </button>
              </div>
              <p className="leise">Du kannst auch die Leertaste drücken.</p>
            </div>
          )}
          {!jetzt && merken && merkPhase === 'tippen' && (
            <form
              className="diktat__formular"
              onSubmit={(e) => {
                e.preventDefault()
                if (!merkText.trim() || beschaeftigt) return
                setAntworten({ 0: merkText })
                void senden(index, { 0: merkText }).then((r) => r && setSchuss({ nr: ++schussNr.current, treffer: r.richtig }))
              }}
            >
              <FeststellHinweis />
              <Eingabe className="luecke diktat__feld" aria-label={`Teil ${index + 1} aus dem Gedächtnis`} autoFocus value={merkText} onChange={(e) => setMerkText(e.target.value)} />
              <div className="knopf-reihe">
                <button
                  type="button"
                  className="knopf"
                  onClick={() => {
                    setMerkText('')
                    setMerkPhase('merken')
                  }}
                >
                  Nochmal ansehen
                </button>
                <button type="submit" className="knopf knopf--haupt" disabled={!merkText.trim() || beschaeftigt}>
                  {beschaeftigt ? 'Wird geprüft …' : meldung?.offline ? 'Nochmal senden' : 'Prüfen'}
                </button>
              </div>
              <p className="leise">„Nochmal ansehen“ löscht, was du schon getippt hast.</p>
            </form>
          )}
          {!jetzt && !merken && meldung?.offline && (
            <div className="knopf-reihe">
              <button type="button" className="knopf knopf--haupt" onClick={() => void senden(index, antworten)} disabled={beschaeftigt}>
                Nochmal senden
              </button>
            </div>
          )}
          {meldung && <p role="alert">{meldung.text}</p>}

          {jetzt && markiert.length > 0 && (
            <div className="diktat__loesung">
              <h3>So ist es richtig</h3>
              <p className="diktat__satz">
                {soll.split(' ').map((w, j) => (
                  <span key={j}>
                    {j > 0 && ' '}
                    {markiert.includes(j) ? (
                      <span className="diktat__wort--nochmal">
                        {w}
                        <span className="marke marke--nochmal" aria-label="hier war ein Fehler">↻</span>
                      </span>
                    ) : (
                      w
                    )}
                  </span>
                ))}
              </p>
              <p className="leise">Die Wörter mit ↻ hast du anders geschrieben.</p>
            </div>
          )}
          {jetzt && (
            <div className="knopf-reihe spiel-zeile">
              {jetzt.richtig ? (
                <div className="rueckmeldung rueckmeldung--richtig" role="status">
                  <span className="rueckmeldung__zeichen" aria-hidden="true">✓</span>
                  <p>
                    <strong>{fehlerZahl === 0 ? 'Fehlerfrei, super!' : 'Gut gemacht!'}</strong>
                    {fehlerZahl > 0 && ` Du hast ${fehlerZahl === 1 ? 'einen Fehler' : `${fehlerZahl} Fehler`} gemacht.`}
                  </p>
                </div>
              ) : (
                <div className="rueckmeldung rueckmeldung--nochmal" role="status">
                  <span className="rueckmeldung__zeichen" aria-hidden="true">!</span>
                  <p>
                    <strong>{merken ? 'Daneben.' : 'Geschafft, aber noch nicht genau genug.'}</strong> Du hast{' '}
                    {fehlerZahl === 1 ? 'einen Fehler' : `${fehlerZahl} Fehler`} gemacht.
                  </p>
                </div>
              )}
              {weiterKnopf}
            </div>
          )}
        </div>
      </>
    )
  }

  return (
    <>
      {daten.monster !== 'kein' && <Spielszene figurName={figur} monsterName={daten.monster} schuss={schuss} befreundet={befreundetVorher} />}
      <form
        className="karte aufgabe"
        onSubmit={(e) => {
          e.preventDefault()
          if (alleAusgefuellt && !beschaeftigt && !jetzt) void pruefen()
        }}
      >
        <header className="aufgabe__kopf">
          <h2>{aufgabe.titel}</h2>
          <span className="leise">
            Runde {index + 1} von {daten.runden.length}
          </span>
        </header>
        {aufgabe.anweisung && (
          <div className="aufgabe__anweisung">
            <Anweisung text={aufgabe.anweisung} farbig={aufgabe.farbig} />
          </div>
        )}
        <LueckentextAnzeige
          key={runde.nr}
          inhalt={runde.inhalt}
          antworten={antworten}
          onAntwort={(id: number, wert: Antwort) => {
            const neu: Antworten = { ...antworten, [id]: wert }
            if (wert === '' || wert === false || (Array.isArray(wert) && wert.length === 0)) delete neu[id]
            setAntworten(neu)
          }}
          ergebnis={jetzt?.ergebnis}
          loesungen={jetzt && !jetzt.richtig ? loesungenAus(jetzt.loesung) : null}
          gesperrt={Boolean(jetzt)}
        />

        {aufgabe.hinweis && tippOffen && (
          <EinsteinSagt pose="erklaert">
            <p>
              <strong>Tipp: </strong>
              {aufgabe.hinweis}
            </p>
          </EinsteinSagt>
        )}
        {meldung && <p role="alert">{meldung.text}</p>}

        {/* Rückmeldung neben „Weiter“, damit bei 1024 × 768 nichts unter die Menüleiste rutscht */}
        <div className="knopf-reihe spiel-zeile">
          {jetzt &&
            (jetzt.richtig ? (
              <div className="rueckmeldung rueckmeldung--richtig" role="status">
                <span className="rueckmeldung__zeichen" aria-hidden="true">✓</span>
                <p>
                  <strong>Richtig!</strong>{daten.monster !== 'kein' && ' Dein Herz hat das Monster getroffen.'}
                </p>
              </div>
            ) : (
              <div className="rueckmeldung rueckmeldung--nochmal" role="status">
                <span className="rueckmeldung__zeichen" aria-hidden="true">!</span>
                <p>
                  <strong>Daneben.</strong> Schau dir die richtige Lösung an!
                </p>
              </div>
            ))}
          {aufgabe.hinweis && !jetzt && (
            <button type="button" className="knopf" onClick={() => setTippOffen(!tippOffen)} aria-expanded={tippOffen}>
              {tippOffen ? 'Tipp ausblenden' : 'Tipp anzeigen'}
            </button>
          )}
          {jetzt ? (
            <button type="button" className="knopf knopf--haupt" onClick={weiter} autoFocus>
              Weiter
            </button>
          ) : (
            <button type="submit" className="knopf knopf--haupt" disabled={!alleAusgefuellt || beschaeftigt}>
              {beschaeftigt ? 'Wird geprüft …' : meldung?.offline ? 'Nochmal senden' : 'Prüfen'}
            </button>
          )}
        </div>
        {!alleAusgefuellt && !jetzt && <p className="leise">{nochOffenText(runde.inhalt.teile)}</p>}
      </form>
    </>
  )
}
