import { einzelbild, type Grafik } from '../lib/sprite'

/**
 * Pixel-Grafik, ganzzahlig vergrößert und scharf (keine verwaschenen Kanten).
 * `nummer` wählt ein Einzelbild aus einem Spritesheet. Ohne `titel` ist die Grafik reine Verzierung
 * und für Vorlesehilfen unsichtbar.
 */
export function Sprite({ grafik, nummer = 0, mal = 2, titel }: { grafik: Grafik; nummer?: number; mal?: number; titel?: string }) {
  // nur ganze oder halbe Vielfache (Jazz 2026-11-15, Farm ohne Scrollen): auf dem iPad (2 Bildpunkte je CSS-Pixel) bleiben alle Pixel gleich breit
  const m = Math.max(1, Math.round(mal * 2) / 2)
  const { x, y } = einzelbild(grafik, nummer)
  return (
    <span
      className="sprite"
      role={titel ? 'img' : undefined}
      aria-label={titel}
      aria-hidden={titel ? undefined : true}
      style={{
        width: grafik.bildBreite * m,
        height: grafik.bildHoehe * m,
        backgroundImage: `url(${grafik.url})`,
        backgroundSize: `${grafik.breite * m}px ${grafik.hoehe * m}px`,
        backgroundPosition: `${-x * m}px ${-y * m}px`,
      }}
    />
  )
}
