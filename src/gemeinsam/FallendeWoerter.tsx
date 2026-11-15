// Fallende Wörter (Lehrkraftseite Teilaufgabe 3, Konzept Abschnitt 7). Fall-Logik nach TastenHeld (js/modes/rain.js,
// ChalkJunkie/TastenHeld, Erlaubnis des Urhebers liegt vor): das unterste Wort ist das Ziel, der Cursor wartet auf das
// richtige Zeichen. Ein gelandetes Wort kommt einmal wieder, danach fällt alles etwas langsamer; es zählt aber nicht mehr.
// Ohne Zeitdruck sinken die Wörter nur bis zur Mitte und warten dort.
import { useEffect, useRef, useState } from 'react'
import { vereinheitliche } from '../lib/diktat'
import type { SpielEinstellungen } from '../lib/typen'
import { Eingabe } from './Eingabe'
import { FeststellHinweis, useFeststelltaste } from './FeststellHinweis'

export type WortErgebnis = { fehler: number; gelandet: boolean }

type Props = {
  woerter: string[]
  einstellungen: SpielEinstellungen
  /** einmal je Wort beim ersten Mal: fertig getippt oder gelandet (Wiederholungen melden nichts) */
  onWort: (index: number, ergebnis: WortErgebnis) => void
  /** alle Wörter (auch die Wiederholungen) sind weg */
  onFertig?: () => void
  /** Vorschau im Editor: nicht selbst den Cursor holen (sonst springt er beim Tippen der Wortliste weg) */
  autoFocus?: boolean
}

// Sekunden bis zum Boden (Konzept: langsam / mittel / schnell)
const DAUER = { langsam: 25, mittel: 18, schnell: 12 }
const MITTE = 0.5

type Fallend = { index: number; wort: string[]; y: number; pos: number; fehler: number; wiederholt: boolean; spalte: number }

export function FallendeWoerter({ woerter, einstellungen, onWort, onFertig, autoFocus = true }: Props) {
  const dauer = DAUER[einstellungen.tempo ?? 'mittel']
  const gleichzeitig = einstellungen.gleichzeitig ?? 1
  const ohneZeitdruck = einstellungen.ohne_zeitdruck ?? false
  // Spielstand in einer Ref (ändert sich jedes Bild), gezeichnet über takt
  const stand = useRef({
    warten: woerter.map((w, index) => ({ index, wort: [...vereinheitliche(w)], wiederholt: false })),
    fallend: [] as Fallend[],
    tempo: 1,
    naechsteSpalte: 0,
    fertig: false,
  })
  const [, setTakt] = useState(0)
  const [daneben, setDaneben] = useState(false)
  const feld = useRef<HTMLInputElement>(null)
  const schreibt = useRef(false)
  const rueckruf = useRef({ onWort, onFertig })
  rueckruf.current = { onWort, onFertig }
  // Jazz 2026-11-15: Feststelltaste an → die Wörter halten an, bis sie wieder aus ist (korrigieren ohne Zeitdruck)
  const feststell = useFeststelltaste()
  const angehalten = useRef(false)
  angehalten.current = feststell
  const aussen = useRef<HTMLDivElement>(null)
  // Jazz 2026-11-15: im Querformat lag der untere Teil des Spielfelds unter dem Menü; beim Start ganz ins Bild holen (nicht in der Editor-Vorschau)
  useEffect(() => {
    if (autoFocus) aussen.current?.scrollIntoView({ block: 'end', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }, [autoFocus])

  useEffect(() => {
    let bild = 0
    let zuletzt = performance.now()
    const schritt = (jetzt: number) => {
      const s = stand.current
      const dt = angehalten.current ? 0 : Math.min(0.1, (jetzt - zuletzt) / 1000)
      zuletzt = jetzt
      // neues Wort, wenn Platz ist (bei zwei Wörtern: das untere ist schon ein Stück gefallen)
      const unten = Math.max(-1, ...s.fallend.map((f) => f.y))
      if (!angehalten.current && s.warten.length && s.fallend.length < gleichzeitig && (s.fallend.length === 0 || unten >= 0.4)) {
        const w = s.warten.shift()!
        s.fallend.push({ ...w, y: 0, pos: 0, fehler: 0, spalte: s.naechsteSpalte })
        s.naechsteSpalte = 1 - s.naechsteSpalte
      }
      // Ohne Zeitdruck wartet das untere Wort in der Mitte, das zweite etwas darüber
      const ziele = [...s.fallend].sort((a, b) => b.y - a.y)
      for (const f of s.fallend) {
        f.y += dt / (dauer * s.tempo)
        if (ohneZeitdruck) f.y = Math.min(f.y, MITTE - ziele.indexOf(f) * 0.25)
      }
      for (const f of s.fallend.filter((x) => x.y >= 1)) landen(f)
      if (!s.fertig && !s.warten.length && !s.fallend.length) {
        s.fertig = true
        rueckruf.current.onFertig?.()
      }
      setTakt((t) => t + 1)
      if (!s.fertig) bild = requestAnimationFrame(schritt)
    }
    bild = requestAnimationFrame(schritt)
    return () => cancelAnimationFrame(bild)
  }, [dauer, gleichzeitig, ohneZeitdruck])

  function landen(f: Fallend) {
    const s = stand.current
    s.fallend = s.fallend.filter((x) => x !== f)
    if (f.wiederholt) return
    rueckruf.current.onWort(f.index, { fehler: f.fehler, gelandet: true })
    s.warten.push({ index: f.index, wort: f.wort, wiederholt: true })
    s.tempo *= 1.15
    setDaneben(false)
  }

  // Ziel = das unterste Wort
  const ziel = () => stand.current.fallend.reduce<Fallend | null>((a, f) => (!a || f.y > a.y ? f : a), null)

  function tippen(eingabe: string) {
    for (const roh of eingabe) {
      for (const z of roh === ' ' ? [' '] : [...vereinheitliche(roh)]) {
        const f = ziel()
        if (!f) return
        if (z === f.wort[f.pos]) {
          f.pos++
          setDaneben(false)
          if (f.pos >= f.wort.length) {
            stand.current.fallend = stand.current.fallend.filter((x) => x !== f)
            if (!f.wiederholt) rueckruf.current.onWort(f.index, { fehler: f.fehler, gelandet: false })
          }
        } else if (z === ' ' && f.pos === 0) continue
        else {
          f.fehler++
          setDaneben(true)
        }
      }
    }
    setTakt((t) => t + 1)
  }

  const z = ziel()
  return (
    <div className="fallen" ref={aussen} onClick={() => feld.current?.focus()}>
      <FeststellHinweis zusatz="Die Wörter warten so lange." />
      <div className="fallen__feld" role="img" aria-label={z ? `Tippe: ${z.wort.join('')}` : 'Gleich kommt das nächste Wort.'}>
        {stand.current.fallend.map((f) => (
          <span
            key={`${f.index}-${f.wiederholt}`}
            aria-hidden="true"
            className={`fallen__wort${f === z ? ' fallen__wort--ziel' : ''}${f === z && daneben ? ' fallen__wort--daneben' : ''}`}
            style={{ top: `calc(${f.y} * (100% - 3.75rem))`, left: f.spalte ? '52%' : '8%' }}
          >
            {f.wort.map((b, i) => (
              <span key={i} className={i < f.pos ? 'diktat__z diktat__z--fertig' : 'diktat__z'}>
                {b}
              </span>
            ))}
          </span>
        ))}
        <div className="fallen__boden" aria-hidden="true" />
      </div>
      <p className="leise" aria-live="polite">
        {daneben ? 'Schau genau hin: Welches Zeichen kommt jetzt?' : 'Tippe das unterste Wort. Der Cursor wartet, bis das Zeichen stimmt.'}
      </p>
      <Eingabe
        ref={feld}
        className="diktat__eingabe"
        aria-label="Hier tippen"
        autoFocus={autoFocus}
        value=""
        onCompositionStart={() => {
          schreibt.current = true
        }}
        onCompositionEnd={(e) => {
          schreibt.current = false
          tippen(e.data)
        }}
        onChange={(e) => {
          if (!schreibt.current) tippen(e.target.value)
        }}
      />
    </div>
  )
}
