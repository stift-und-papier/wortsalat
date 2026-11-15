// Tier auf der Farm, das sich bewegt (Lehrkraft 2026-11-12): die Kuh läuft in der Scheune hin und her, Hühner laufen ein Stück
// und picken auf dem Boden. Nur Anzeige: Der Knopf (Tippfläche) und die Hindernisse bleiben am festen Platz, nur das Bild wandert
// ein paar Grafik-Pixel. Bei „Bewegung reduzieren“ steht das Tier still.
// Jazz 2026-11-15: auch das Monster vor seiner Hütte (pendelt wie die Kuh, sein Bild hat nur eine Zeile). children (z. B. die
// Ausrufezeichen-Blase) wandern mit, werden aber nicht gespiegelt.
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Sprite } from '../gemeinsam/Sprite'
import { GRAFIK } from '../grafik'
import type { Grafik } from '../lib/sprite'

type Art = 'huhn' | 'kuh' | 'monster'
type Zustand = 'steht' | 'laeuft' | 'pickt'

// Zeilen im Bild (8 Bilder je Zeile) und Zahl der Bilder; tempo in Grafik-Pixeln pro Sekunde
const TIERE = {
  huhn: { grafik: GRAFIK.huhn, tempo: 8, steht: [0, 4], laeuft: [1, 7], pickt: [2, 8] },
  kuh: { grafik: GRAFIK.kuh, tempo: 7, steht: [0, 3], laeuft: [1, 8], pickt: null },
} as const

const zufall = (von: number, bis: number) => von + Math.random() * (bis - von)

/** von/bis: wie weit das Bild vom Platz weg darf (Pixel der Farm, links negativ); mal: Größe des Bilds, wegMal: Größe der Farm */
export function FarmTier(props: { art: Art; grafik?: Grafik; mal: number; wegMal?: number; von: number; bis: number; children?: ReactNode }) {
  const { art, grafik, mal, von, bis } = props
  const wegMal = props.wegMal ?? mal
  const t = useMemo(() => {
    if (art !== 'monster' || !grafik) return TIERE[art === 'monster' ? 'huhn' : art]
    const n = grafik.breite / grafik.bildBreite
    return { grafik, tempo: 6, steht: [0, n], laeuft: [0, n], pickt: null } as const
  }, [art, grafik])
  const [z, setZ] = useState<{ zustand: Zustand; x: number; blick: 1 | -1; dauer: number }>({ zustand: 'steht', x: 0, blick: 1, dauer: 0 })

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let timer: number
    // Kuh (Lehrkraft 2026-11-12): läuft immer von einem Ende ihres Bereichs zum anderen, mit kurzer Pause dazwischen
    const pendeln = (x: number) => {
      const ziel = x - von < bis - x ? bis : von
      const dauer = (Math.abs(ziel - x) / t.tempo) * 1000
      setZ({ zustand: 'laeuft', x: ziel, blick: ziel > x ? 1 : -1, dauer })
      timer = window.setTimeout(() => {
        setZ((alt) => ({ ...alt, zustand: 'steht', dauer: 0 }))
        timer = window.setTimeout(() => pendeln(ziel), zufall(1000, 2500))
      }, dauer)
    }
    // Huhn: stehen, picken oder zu einer neuen Stelle laufen
    const weiter = (x: number) => {
      if (!t.pickt) return pendeln(x)
      const r = Math.random()
      if (t.pickt && r < 0.35) {
        setZ((alt) => ({ ...alt, zustand: 'pickt', dauer: 0 }))
        timer = window.setTimeout(() => weiter(x), zufall(1500, 3000))
      } else if (r < 0.65) {
        setZ((alt) => ({ ...alt, zustand: 'steht', dauer: 0 }))
        timer = window.setTimeout(() => weiter(x), zufall(1500, 4000))
      } else {
        const ziel = Math.round(zufall(von, bis))
        if (ziel === x) return weiter(x)
        const dauer = (Math.abs(ziel - x) / t.tempo) * 1000
        setZ({ zustand: 'laeuft', x: ziel, blick: ziel > x ? 1 : -1, dauer })
        timer = window.setTimeout(() => weiter(ziel), dauer)
      }
    }
    timer = window.setTimeout(() => weiter(0), zufall(0, 2000)) // nicht alle Tiere im Gleichtakt
    return () => window.clearTimeout(timer)
  }, [t, von, bis])

  const [reihe, bilder] = (z.zustand === 'pickt' && t.pickt) || (z.zustand === 'laeuft' ? t.laeuft : t.steht)
  return (
    <span
      className="farm-tier__weg"
      style={{ transform: `translateX(${z.x * wegMal}px)`, transition: `transform ${z.dauer}ms linear` }}
    >
      <span
        className="farm-tier__bild"
        data-zustand={z.zustand}
        style={{
          transform: z.blick < 0 ? 'scaleX(-1)' : undefined,
          ['--lauf' as string]: `${-bilder * t.grafik.bildBreite * mal}px`,
          ['--bilder' as string]: bilder,
        }}
      >
        <Sprite grafik={t.grafik} nummer={reihe * 8} mal={mal} />
      </span>
      {props.children}
    </span>
  )
}
