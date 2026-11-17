// alt (Übungswiese), Klassen auf den Pixel-Look umgestellt
import { useEffect, useState } from 'react'
import type { Antwort, Antworten, Pruefergebnis, VersionenOhneLoesung } from '../lib/typen'

type Props = {
  teile: VersionenOhneLoesung[]
  antworten: Antworten
  onAntwort: (id: number, wert: Antwort) => void
  ergebnis?: Pruefergebnis | null
  loesungen?: Record<number, string[]> | null
  gesperrt?: boolean
}

// Format „Multiple Choice“ (Jazz 2026-11-16, früher „Sätze verbessern“): je Frage 2 bis 6 Antworten untereinander.
// Ist mehr als eine richtig (mehrfach), dürfen mehrere angetippt werden; richtig = genau die richtigen gewählt.
// Nach dem Prüfen steht unter jeder Version ihr Begründungshinweis (kommt erst mit dem Ergebnis aus der Datenbank).
// Die Hinweise bleiben stehen, auch wenn danach eine andere Version gewählt wird.
export function VersionenAnzeige({ teile, antworten, onAntwort, ergebnis, loesungen, gesperrt }: Props) {
  const [hinweise, setHinweise] = useState<Record<number, string[]>>({})
  useEffect(() => {
    const neu = ergebnis?.luecken.filter((l) => l.id !== null && l.hinweise?.length)
    if (neu?.length) setHinweise((alt) => ({ ...alt, ...Object.fromEntries(neu.map((l) => [l.id, l.hinweise])) }))
  }, [ergebnis])

  return (
    <div className="reihen">
      {teile.map((teil, nr) => {
        const richtig = ergebnis?.luecken.find((l) => l.id === teil.id)?.richtig
        const gewaehlt = Array.isArray(antworten[teil.id]) ? (antworten[teil.id] as number[]).map(Number) : []
        const zustand = richtig === true ? ' versionen--richtig' : richtig === false ? ' versionen--nochmal' : ''
        return (
          <div key={teil.id} className="reihe" role="group" aria-label={`Frage ${nr + 1}`}>
            <p className="reihe__nr">
              Frage {nr + 1}
              {richtig === true && <span className="marke marke--richtig" aria-label="richtig"> ✓</span>}
              {richtig === false && <span className="marke marke--nochmal" aria-label="schau nochmal hin"> ↻</span>}
            </p>
            {teil.kontext && <p className="versionen__kontext">{teil.kontext}</p>}
            {teil.mehrfach && <p className="leise">Mehrere Antworten sind richtig.</p>}
            <div className={`versionen${zustand}`}>
              {teil.optionen.map((o, i) => (
                <div key={i} className="version">
                  <button
                    type="button"
                    className="chip version"
                    aria-pressed={gewaehlt.includes(i)}
                    disabled={gesperrt || richtig === true}
                    onClick={() =>
                      onAntwort(teil.id, teil.mehrfach ? (gewaehlt.includes(i) ? gewaehlt.filter((x) => x !== i) : [...gewaehlt, i].sort((a, b) => a - b)) : gewaehlt[0] === i ? [] : [i])
                    }
                  >
                    <span className="version__haken" aria-hidden="true">
                      {gewaehlt.includes(i) ? '✓' : ''}
                    </span>
                    {o}
                  </button>
                  {hinweise[teil.id]?.[i] && <p className="version__hinweis">{hinweise[teil.id][i]}</p>}
                </div>
              ))}
            </div>
            {loesungen?.[teil.id] && (
              <p className="reihe__loesung">
                <span className="loesung-anzeige">Richtig: {loesungen[teil.id].join(' / ')}</span>
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
