// Antipp-Modus (Jazz 2026-11-15, Teilaufgabe 6, Standard im Editor): Text so schreiben, wie ihn die Schüler:innen sehen, dann Wörter
// antippen. Lückentext: Wort wird Lücke; Auswahl: Wort ist die richtige Möglichkeit; Fehler finden: Wort ist das Fehlerwort;
// Zuordnen: Wort (oder erstes und letztes Wort einer Gruppe) antippen, dann die Kategorie. Gespeichert wird der [Klammer]-Text.
import { useEffect, useState, type ReactNode } from 'react'
import {
  auswahlAndere, auswahlBauen, ausText, einheitBauen, fehlerBauen, fehlerKorrektur, kategorie, luecke, lueckeBauen, mitSichtbar, nachAenderung,
  sichtbar, woerter, zuText, type Antipp, type Marke,
} from '../lib/antippen'

type Typ = 'lueckentext' | 'auswahl' | 'zuordnen' | 'fehler'
type Bereich = { start: number; ende: number }

const ANLEITUNG: Record<Typ, string> = {
  lueckentext: 'Tippen Sie unten auf jedes Wort, das zur Lücke werden soll. Noch einmal tippen macht es wieder zu normalem Text.',
  auswahl: 'Tippen Sie unten auf das richtige Wort und schreiben Sie dann die falschen Möglichkeiten dazu.',
  fehler: 'Schreiben Sie den Text mit den Fehlern, so wie ihn die Schüler:innen sehen. Tippen Sie dann jedes Fehlerwort an und schreiben Sie, wie es richtig heißt.',
  zuordnen: 'Tippen Sie unten ein Wort an (bei einer Wortgruppe das erste und das letzte Wort) und dann die Kategorie.',
}

export function AntippModus(props: { text: string; typ: Typ; kategorien: string[]; platzhalter: string; beschriftung: string; onChange: (text: string) => void }) {
  const { text, typ, onChange } = props
  const [a, setA] = useState<Antipp>(() => ausText(text))
  const [aktiv, setAktiv] = useState<number | null>(null) // start der gewählten Marke
  const [wahl, setWahl] = useState<Bereich | null>(null) // Zuordnen: angetippte Wörter, noch ohne Kategorie
  const [neueKat, setNeueKat] = useState('')

  // Text von außen geändert (Beispiel, Runde kopiert, Klammer-Modus): neu einlesen
  useEffect(() => {
    if (text !== zuText(a)) {
      setA(ausText(text))
      setAktiv(null)
      setWahl(null)
    }
  }, [text])

  function setzen(neu: Antipp) {
    setA(neu)
    onChange(zuText(neu))
  }
  const marken = [...a.marken].sort((x, y) => x.start - y.start)
  const wortListe = woerter(a.klar)
  const frei = (b: Bereich) => !marken.some((m) => m.start < b.ende && b.start < m.ende)
  const ersetzen = (m: Marke, neu: Marke | null) => setzen({ ...a, marken: a.marken.flatMap((x) => (x === m ? (neu ? [neu] : []) : [x])) })

  function wortAntippen(w: Bereich) {
    const wort = a.klar.slice(w.start, w.ende)
    if (typ === 'zuordnen') {
      setAktiv(null)
      if (!wahl || (wahl.start === w.start && wahl.ende === w.ende)) return setWahl(wahl ? null : w)
      const b = { start: Math.min(wahl.start, w.start), ende: Math.max(wahl.ende, w.ende) }
      return setWahl(frei(b) ? b : w)
    }
    const innen = typ === 'lueckentext' ? wort : typ === 'auswahl' ? `*${wort} | ` : `${wort} -> `
    setzen({ ...a, marken: [...a.marken, { ...w, innen }] })
    setAktiv(w.start)
  }

  function markeAntippen(m: Marke) {
    setWahl(null)
    if (aktiv === m.start) {
      ersetzen(m, null)
      setAktiv(null)
    } else setAktiv(m.start)
  }

  function kategorieWaehlen(kat: string) {
    const k = kat.trim()
    if (!k) return
    const m = marken.find((x) => x.start === aktiv)
    if (wahl) {
      setzen({ ...a, marken: [...a.marken, { ...wahl, innen: einheitBauen(a.klar.slice(wahl.start, wahl.ende), k) }] })
      setWahl(null)
    } else if (m) ersetzen(m, { ...m, innen: einheitBauen(sichtbar(m.innen), k) })
    setNeueKat('')
  }

  // Text mit antippbaren Wörtern und markierten Stellen
  const stuecke: ReactNode[] = []
  const textBis = (von: number, bis: number) => {
    let p = von
    for (const w of wortListe) {
      if (w.start < von || w.ende > bis) continue
      if (w.start > p) stuecke.push(a.klar.slice(p, w.start))
      const gewaehlt = wahl !== null && w.start >= wahl.start && w.ende <= wahl.ende
      stuecke.push(
        <button key={w.start} type="button" className="lk-antipp-wort" aria-pressed={gewaehlt} onClick={() => wortAntippen(w)}>
          {a.klar.slice(w.start, w.ende)}
        </button>,
      )
      p = w.ende
    }
    if (bis > p) stuecke.push(a.klar.slice(p, bis))
  }
  let pos = 0
  for (const m of marken) {
    textBis(pos, m.start)
    stuecke.push(
      <button key={`m${m.start}`} type="button" className="lk-antipp-stelle" aria-pressed={aktiv === m.start} onClick={() => markeAntippen(m)}>
        {a.klar.slice(m.start, m.ende) || '___'}
        <small>{zusatz(m.innen)}</small>
      </button>,
    )
    pos = Math.max(pos, m.ende)
  }
  textBis(pos, a.klar.length)

  const gewaehlt = marken.find((m) => m.start === aktiv)
  const katListe = [...new Set([...props.kategorien, ...marken.map((m) => kategorie(m.innen)).filter(Boolean)])]
  const naechstes = gewaehlt && wortListe.find((w) => w.start >= gewaehlt.ende)

  return (
    <div className="lk-antippen">
      <textarea
        className="lk-feld"
        rows={3}
        value={a.klar}
        onChange={(e) => {
          setzen(nachAenderung(a, e.target.value))
          setAktiv(null)
          setWahl(null)
        }}
        placeholder={props.platzhalter}
        spellCheck={false}
        aria-label={props.beschriftung}
      />
      {a.klar.trim() && (
        <>
          <p className="lk-leise">{ANLEITUNG[typ]}</p>
          <p className="lk-antipp-text">{stuecke}</p>
        </>
      )}
      {typ === 'zuordnen' && a.klar.trim() && (
        <div className="lk-knopfreihe" role="group" aria-label="Kategorie wählen">
          {katListe.map((k) => (
            <button key={k} type="button" className="lk-knopf" disabled={!wahl && gewaehlt === undefined} aria-pressed={gewaehlt !== undefined && kategorie(gewaehlt.innen) === k} onClick={() => kategorieWaehlen(k)}>
              {k}
            </button>
          ))}
          <input className="lk-feld lk-feld--klein" value={neueKat} onChange={(e) => setNeueKat(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && kategorieWaehlen(neueKat)} placeholder="neue Kategorie" aria-label="Neue Kategorie" />
          <button type="button" className="lk-knopf" disabled={!neueKat.trim() || (!wahl && gewaehlt === undefined)} onClick={() => kategorieWaehlen(neueKat)}>
            Zuordnen
          </button>
        </div>
      )}
      {gewaehlt && (
        <StellenFelder
          key={gewaehlt.start}
          marke={gewaehlt}
          nummer={marken.indexOf(gewaehlt)}
          aendern={(innen) => ersetzen(gewaehlt, { ...gewaehlt, innen })}
          erweitern={
            naechstes && frei({ start: gewaehlt.ende, ende: naechstes.ende })
              ? () => {
                  const neu = a.klar.slice(gewaehlt.start, naechstes.ende)
                  ersetzen(gewaehlt, { ...gewaehlt, ende: naechstes.ende, innen: mitSichtbar(gewaehlt.innen, neu) })
                }
              : undefined
          }
          entfernen={() => {
            ersetzen(gewaehlt, null)
            setAktiv(null)
          }}
        />
      )}
    </div>
  )
}

/** kleiner Zusatz hinter der markierten Stelle: was dazugehört */
function zusatz(innen: string) {
  if (innen.includes('->')) return ` → ${fehlerKorrektur(innen) || '?'}`
  if (innen.includes('|')) return ` (Auswahl)`
  if (kategorie(innen)) return ` · ${kategorie(innen)}`
  return ' (Lücke)'
}

/** Felder zur gewählten Stelle. Eigener Zustand je Feld, damit beim Tippen nichts verschwindet (z. B. ein „/“ am Ende). */
function StellenFelder(props: { marke: Marke; nummer: number; aendern: (innen: string) => void; erweitern?: () => void; entfernen: () => void }) {
  const { marke, aendern } = props
  const wort = sichtbar(marke.innen)
  const art = marke.innen.includes('->') ? 'fehler' : marke.innen.includes('|') ? 'auswahl' : kategorie(marke.innen) ? 'einheit' : 'luecke'
  const [f1, setF1] = useState(art === 'fehler' ? fehlerKorrektur(marke.innen) : art === 'auswahl' ? auswahlAndere(marke.innen) : luecke(marke.innen).weitere)
  const [f2, setF2] = useState(luecke(marke.innen).hinweis)
  // Platz der richtigen Möglichkeit: aus Stellennummer und Wort, damit sie nicht immer vorn steht (bleibt beim Weitertippen gleich)
  const platz = props.nummer + [...wort].reduce((n, z) => n + z.charCodeAt(0), 0)

  return (
    <div className="lk-teil lk-antipp-felder">
      <div className="lk-formular">
        <strong>„{wort}“</strong>
        {art === 'luecke' && (
          <>
            <label>
              Weitere richtige Lösungen (mit / trennen)
              <input className="lk-feld" value={f1} spellCheck={false} onChange={(e) => (setF1(e.target.value), aendern(lueckeBauen(wort, e.target.value, f2)))} placeholder="z. B. radfahren" />
            </label>
            <label>
              Hinweis in Klammern hinter der Lücke (freiwillig)
              <input className="lk-feld" value={f2} spellCheck={false} onChange={(e) => (setF2(e.target.value), aendern(lueckeBauen(wort, f1, e.target.value)))} placeholder="z. B. Rad + fahren" />
            </label>
          </>
        )}
        {art === 'auswahl' && (
          <label>
            Falsche Möglichkeiten (mit / trennen)
            <input className="lk-feld" value={f1} spellCheck={false} autoFocus onChange={(e) => (setF1(e.target.value), aendern(auswahlBauen(wort, e.target.value, platz)))} placeholder="z. B. das" />
            <span className="lk-leise">Schüler:innen sehen: {marke.innen.split('|').map((o) => o.trim().replace(/^\*\s*/, '')).filter(Boolean).join(' · ')}</span>
          </label>
        )}
        {art === 'fehler' && (
          <label>
            So ist es richtig (mehrere mit / trennen)
            <input className="lk-feld" value={f1} spellCheck={false} autoFocus onChange={(e) => (setF1(e.target.value), aendern(fehlerBauen(wort, e.target.value)))} placeholder="z. B. weiß" />
          </label>
        )}
        {art === 'einheit' && <p className="lk-leise">Kategorie: {kategorie(marke.innen)}. Zum Ändern oben eine andere Kategorie antippen.</p>}
      </div>
      <span className="lk-knopfreihe">
        {props.erweitern && (
          <button type="button" className="lk-knopf" onClick={props.erweitern}>
            + nächstes Wort
          </button>
        )}
        <button type="button" className="lk-knopf" onClick={props.entfernen}>
          Wieder normaler Text
        </button>
      </span>
    </div>
  )
}
