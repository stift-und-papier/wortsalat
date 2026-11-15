// Jazz 2026-11-15: Ist die Feststelltaste an, erscheint ein Hinweis mit einem Bild der Taste (viele Kinder kennen sie nicht).
// Erkennt die Taste an jedem Tastendruck auf der Seite (getModifierState). Ohne Tastendruck weiß der Browser es nicht, dann bleibt der Hinweis weg.
import { useEffect, useState } from 'react'

export function FeststellHinweis() {
  const [an, setAn] = useState(false)
  useEffect(() => {
    const pruefen = (e: KeyboardEvent) => {
      if (typeof e.getModifierState === 'function') setAn(e.getModifierState('CapsLock'))
    }
    window.addEventListener('keydown', pruefen)
    window.addEventListener('keyup', pruefen)
    return () => {
      window.removeEventListener('keydown', pruefen)
      window.removeEventListener('keyup', pruefen)
    }
  }, [])
  if (!an) return null
  return (
    <p className="feststell-hinweis" role="alert">
      <FeststellTaste />
      <span>
        <strong>Die Feststelltaste ist an.</strong> Drücke sie einmal, dann schreibst du wieder normal. Sie ist links neben dem A.
      </span>
    </p>
  )
}

/** Pixel-Bild der Taste: Tastenkappe mit Pfeil nach oben und Strich darunter (⇪), wie auf deutschen Tastaturen */
function FeststellTaste() {
  return (
    <svg className="feststell-taste" viewBox="0 0 24 20" width="72" height="60" shapeRendering="crispEdges" aria-hidden="true">
      {/* Kappe mit dunklerer Kante unten */}
      <path d="M2 1h20v1h1v15h-1v1H2v-1H1V2h1Z" fill="#6b4b5b" />
      <path d="M2 2h20v13H2Z" fill="#f3e5c2" />
      <path d="M2 15h20v2H2Z" fill="#c49a6c" />
      {/* Pfeil (Umriss) und Strich */}
      <path d="M11 3h2v1h1v1h1v1h1v1h1v1h-3v3h-4v-3H7V7h1V6h1V5h1V4h1Z M11 5v1h-1v1H9v1h2v3h2V8h2V7h-1V6h-1V5Z" fill="#6b4b5b" fillRule="evenodd" />
      <path d="M10 12h4v2h-4Z" fill="#6b4b5b" />
    </svg>
  )
}
