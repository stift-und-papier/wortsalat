import type { AufgabenTyp } from '../lib/typen'
import { FORMATE } from './AufgabeEditor'

// alt (Übungswiese), ohne Pixel-Symbole: „+ Neue Aufgabe“ zeigt je Format eine Kachel (Name, ein Satz, Mini-Beispiel).
export function FormatWahl() {
  return (
    <>
      <a className="lk-zurueck" href="#/lehrkraft/aufgaben">
        ← Alle Übungen
      </a>
      <h1>Neue Übung</h1>
      <p>Welches Format soll die Übung haben? Sie können es beim Erstellen noch ändern.</p>
      <ul className="lk-kacheln">
        {(Object.keys(FORMATE) as AufgabenTyp[]).filter((typ) => typ !== 'erklaerung').map((typ) => (
          <li key={typ}>
            <a className="lk-eintrag lk-kachel" href={`#/lehrkraft/aufgaben/neu-${typ}`}>
              <strong>{FORMATE[typ].name}</strong>
              <span>{FORMATE[typ].kurz}</span>
              <span className="lk-leise">{FORMATE[typ].mini}</span>
            </a>
          </li>
        ))}
        {/* Jazz 2026-11-16: jede Runde mit eigenem Format, eigener Anweisung und eigenem Tipp (ohne Diktat und Fallende Wörter) */}
        <li>
          <a className="lk-eintrag lk-kachel" href="#/lehrkraft/aufgaben/neu-gemischt">
            <strong>Gemischt</strong>
            <span>Jede Runde hat ihr eigenes Format, ihre eigene Arbeitsanweisung und ihren eigenen Tipp.</span>
            <span className="lk-leise">Runde 1 Lückentext · Runde 2 Multiple Choice …</span>
          </a>
        </li>
      </ul>
    </>
  )
}
