// Farm als Landschaft (Lehrkraft 2026-11-12): Insel mit Acker, Hühnerstall und Scheune, Bäumen und Deko.
// Jazz 2026-11-17 (docs/farm/layout-leer.md): Spielfenster in voller Breite, Meer drumherum, 2- oder 3-fach; Knöpfe in der Kopfzeile.
// Die Figur läuft dorthin, wo man tippt. Feld oder Tier antippen öffnet ein Menü (UI Pack) mit Samen bzw. Futter.
// Alles bleibt auch ohne Figur bedienbar (Felder und Tiere sind Knöpfe). Wachstum und Füttern rechnet der Server.
import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Sprite } from '../gemeinsam/Sprite'
import { Symbol } from '../gemeinsam/Symbol'
import { GRAFIK } from '../grafik'
import { fehlerText } from '../lib/fehler'
import { figur as figurAus } from '../lib/figur'
import {
  ablagePlaetze, BAEUME, BAUM_PLAETZE, BOOT, BRUNNEN, DEKO_PLAETZE, FELD_PLAETZE, FIGUR_START, GRAS_KERN, grundKacheln, HEU, HUETTE, HUETTE_KLEIN, hindernisse,
  HUHN_PLAETZE, istGras, KACHEL, KUH_PLAETZE, MONSTER_PLATZ, NAPF_PLAETZE, nebenan, RAND, scheunenKacheln, SPALTEN, STALL, tierFlaeche, TROG, WACHSENDE_DEKO, weg, ZEILEN,
  type Ort,
} from '../lib/landschaft'
import { artikelBild, DEKO_NAME, OBSTBAUM, SORTE, SORTE_NAME, vorratDing, type Farm as FarmDaten } from '../lib/shop'
import { einzelbild, type Grafik } from '../lib/sprite'
import { farmMal, monster as monsterAus } from '../lib/monster'
import { supabase } from '../lib/supabase'
import { FigurWahl } from './FigurWahl'
import { FarmTier } from './FarmTier'

const TEMPO = 50 // Grafik-Pixel pro Sekunde
const RAND_UNTEN = 8 // Luft zwischen Farm und Menü unten (CSS-Pixel)
const MEER_RAND = { oben: 10, seite: 12 } // durchsichtiger Außenrand des Rahmenbilds (2-fach)
const RAHMEN_B = 68, RAHMEN_H = 66 // Holzrahmen des Spielfensters links + rechts bzw. oben + unten (CSS-Pixel)
const flaecheVon = (o: Ort, breite: number): Ort[] => Array.from({ length: breite }, (_, i) => ({ x: o.x + i, y: o.y }))
const ruhig = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const TIER_NAME: Record<string, string> = { huhn: 'Huhn', kuh: 'Kuh' }
// Mitte einer Kachel, Füße der Figur etwas unterhalb der Mitte
const mitte = (o: Ort) => ({ x: o.x * KACHEL + 8, y: o.y * KACHEL + 12 })
/** Spalte im Figurenbild: 0 hoch, 1 rechts oben, 2 rechts, … 6 links, 7 links oben */
const richtungZu = (dx: number, dy: number) => (Math.round(Math.atan2(dx, -dy) / (Math.PI / 4)) + 8) % 8

type Menue = { art: 'feld'; feld: number } | { art: 'tier'; id: string }
// shortcut: ausgeblendete Deko merkt sich nur dieses Gerät (wie Dunkler Modus). Soll es auf jedem iPad gelten, in die Datenbank (wie figur).
const DEKO_AUS = 'wortsalat-farm-deko-aus'

export function Farm({ token, shop, album, figur: figurName, nachFigur }: { token: string; shop: string; album: string; figur: string; nachFigur: () => void }) {
  const [daten, setDaten] = useState<FarmDaten | null>(null)
  const [meldung, setMeldung] = useState<string | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)
  const [menue, setMenue] = useState<Menue | null>(null)
  const [herz, setHerz] = useState<string | null>(null) // Tier, über dem gerade ein Herz erscheint
  const [faellt, setFaellt] = useState<string | null>(null) // Obstbaum, von dem gerade die Früchte fallen
  const [mal, setMal] = useState(2)
  const [flaeche, setFlaeche] = useState({ breite: 0, hoehe: 0 }) // Innenfläche des Spielfensters (ohne Holzrahmen)
  // Jazz 2026-11-17 (E5): Sammelalbum, Vorrat, Laden und Zahnrad stehen in der Kopfzeile der Seite (Plätze legt SchuelerBereich an)
  const [kopf, setKopf] = useState<{ links: HTMLElement | null; mitte: HTMLElement | null; rechts: HTMLElement | null }>({ links: null, mitte: null, rechts: null })
  useEffect(() => setKopf({ links: document.getElementById('kopf-links'), mitte: document.getElementById('kopf-mitte'), rechts: document.getElementById('kopf-rechts') }), [])
  const [figur, setFigur] = useState({ ...mitte(FIGUR_START), richtung: 4, dauer: 0 })
  const rahmen = useRef<HTMLDivElement>(null)
  const leinwand = useRef<HTMLCanvasElement>(null)
  const ankunft = useRef<number>(undefined)
  const [blase, setBlase] = useState(true) // Sprechblase „… kann geerntet werden!“, bis man zum ersten Mal tippt
  const [einrichten, setEinrichten] = useState(false) // Fenster hinter dem Zahnrad: Figur und Deko
  const [vorratOffen, setVorratOffen] = useState(false) // Jazz 2026-11-15: Vorrat als Fenster hinter dem Truhen-Knopf
  const [dekoAus, setDekoAus] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(DEKO_AUS) ?? '[]') as string[]
    } catch {
      return []
    }
  })

  const laden = useCallback(async () => {
    const { data, error } = await supabase.rpc('schueler_farm', { p_token: token })
    if (error) setFehler(fehlerText(error))
    else setDaten(data as FarmDaten)
  }, [token])

  useEffect(() => {
    void laden()
  }, [laden])

  // Wachsende Deko (Jazz 2026-11-17): Stufen rechnet der Server aus dem Lernfortschritt; Gewachsenes glitzert einmal und
  // die Meldung sagt es (Vorrang vor „hungrig“). Ohne Antwort stehen alle in Stufe 1.
  const [stufen, setStufen] = useState<Record<string, number>>({})
  const [glitzert, setGlitzert] = useState<string[]>([])
  useEffect(() => {
    let uhr: number | undefined
    void supabase.rpc('wachstum_holen', { p_token: token }).then(({ data, error }) => {
      if (error || !data) return
      const liste = data as { deko: string; stufe: number; neu: boolean }[]
      setStufen(Object.fromEntries(liste.map((w) => [w.deko, w.stufe])))
      const neu = WACHSENDE_DEKO.filter((w) => liste.some((x) => x.deko === w.id && x.neu))
      if (!neu.length) return
      const fertig = (w: (typeof WACHSENDE_DEKO)[number]) => liste.find((x) => x.deko === w.id)!.stufe >= w.stufen
      setMeldung(
        WACHSENDE_DEKO.every(fertig)
          ? 'Alles auf deiner Farm ist ausgewachsen. Super!'
          : neu.length > 1
            ? 'Du hast dazugelernt. Auf deiner Farm ist einiges gewachsen!'
            : fertig(neu[0]) ? neu[0].fertig : `Du hast dazugelernt. ${neu[0].gewachsen}`,
      )
      setGlitzert(neu.map((w) => w.id))
      uhr = window.setTimeout(() => setGlitzert([]), 5200) // wie farm-glitzern-weg in bausteine.css
      void supabase.rpc('wachstum_gesehen', { p_token: token }).then() // .then() schickt die Anfrage erst ab
    })
    return () => window.clearTimeout(uhr)
  }, [token])

  // Größe (Jazz 2026-11-17, E1): Das Spielfenster füllt Breite und Höhe bis zum Menü unten. Faktor 2 oder 3 (ganzzahlig): der größte,
  // bei dem das ganze Gras des Kerns hineinpasst; der Rest ist Meer, die Landstreifen werden am Rand abgeschnitten.
  useEffect(() => {
    const el = rahmen.current
    if (!el) return
    const passen = () => {
      const oben = el.getBoundingClientRect().top + window.scrollY
      const menue = document.querySelector('nav.menue')?.getBoundingClientRect().height ?? 0
      const breite = el.clientWidth - RAHMEN_B
      const hoehe = Math.max(GRAS_KERN.hoehe * KACHEL * 2, window.innerHeight - oben - menue - RAND_UNTEN - RAHMEN_H)
      const m = Math.min(breite / (GRAS_KERN.breite * KACHEL), hoehe / (GRAS_KERN.hoehe * KACHEL))
      setMal(Math.max(2, Math.min(3, Math.floor(m))))
      setFlaeche({ breite, hoehe })
    }
    const beob = new ResizeObserver(passen)
    beob.observe(el)
    // die Meldung oben kann die Kopfzeile höher machen: dann neu rechnen, damit die Seite nicht scrollt
    const kopfzeile = document.querySelector('.muenzen-stand')
    if (kopfzeile) beob.observe(kopfzeile)
    window.addEventListener('resize', passen)
    return () => {
      beob.disconnect()
      window.removeEventListener('resize', passen)
    }
  }, [daten === null])

  const felder = daten ? Math.min(daten.felder, FELD_PLAETZE.length) : 0
  const huehner = daten?.tiere.filter((t) => t.art === 'huhn').slice(0, HUHN_PLAETZE.length) ?? []
  const kuehe = daten?.tiere.filter((t) => t.art === 'kuh').slice(0, KUH_PLAETZE.length) ?? []
  // Jazz 2026-11-17 (E4): statt Ausrufezeichen zeigt ein leerer Napf bzw. Trog, dass Tiere hungrig sind
  const trogVoll = kuehe.length > 0 && kuehe.every((t) => t.satt)

  // Hintergrund in Originalgröße zeichnen (Wasser, Gras, Acker, Stall, Scheune, Bäume); die Seite vergrößert ihn pixelgenau
  useEffect(() => {
    const ctx = leinwand.current?.getContext('2d')
    if (!ctx || !daten) return
    const namen = ['wasser', 'gras', 'gras_deko', 'feld', 'wand', 'heu', 'baum', 'baum_klein', 'stall'] as const
    const bilder = Object.fromEntries(namen.map((n) => [n, Object.assign(new Image(), { src: GRAFIK[n].url })])) as Record<(typeof namen)[number], HTMLImageElement>
    const kachel = (name: (typeof namen)[number], nummer: number, x: number, y: number) => {
      const q = einzelbild(GRAFIK[name], nummer)
      ctx.drawImage(bilder[name], q.x, q.y, KACHEL, KACHEL, x * KACHEL, y * KACHEL, KACHEL, KACHEL)
    }
    let aktiv = true
    void Promise.all(Object.values(bilder).map((b) => b.decode())).then(() => {
      if (!aktiv) return
      ctx.clearRect(0, 0, SPALTEN * KACHEL, ZEILEN * KACHEL)
      for (const k of grundKacheln()) kachel(k.grafik, k.nummer, k.x, k.y)
      // Felder einzeln (Lehrkraft 2026-11-12): Ackerstück 14 × 14 mitten in der Kachel, so bleibt ringsum ein kleiner Abstand
      for (const o of FELD_PLAETZE.slice(0, felder)) ctx.drawImage(bilder.feld, o.x * KACHEL + 1, o.y * KACHEL + 1)
      // Jazz 2026-11-17 (E2): Stall und Scheune stehen von Anfang an, auch leer
      ctx.drawImage(bilder.stall, STALL.x * KACHEL, STALL.y * KACHEL)
      for (const k of scheunenKacheln()) kachel('wand', k.nummer, k.x, k.y)
      ctx.drawImage(bilder.heu, HEU.x * KACHEL, HEU.y * KACHEL)
      for (const b of BAEUME) ctx.drawImage(bilder[b.grafik], b.x * KACHEL, b.y * KACHEL)
    })
    return () => {
      aktiv = false
    }
  }, [daten === null, felder])

  useEffect(() => () => window.clearTimeout(ankunft.current), [])

  // Jazz 2026-11-14: Die Figur startet in der Mitte der Farm und bleibt stehen, bis man tippt. Die Blase steht links von ihr.

  /**
   * Figur auf kürzestem Weg um Hindernisse herum zur nächsten Kachel laufen lassen, für die `ziel` gilt; danach `dann`.
   * Gibt es keinen Weg, passiert `dann` sofort (alles bleibt bedienbar).
   */
  function gehe(ziel: (o: Ort) => boolean, dann?: () => void) {
    window.clearTimeout(ankunft.current)
    setBlase(false)
    const start = { x: Math.floor(figur.x / KACHEL), y: Math.floor(figur.y / KACHEL) }
    const pfad = weg(start, ziel, besetzt)
    if (!pfad) return dann?.()
    // nur Knickpunkte anlaufen
    const punkte = pfad.filter((o, i) => {
      const vor = i ? pfad[i - 1] : start
      const nach = pfad[i + 1]
      return !nach || nach.x - o.x !== o.x - vor.x || nach.y - o.y !== o.y - vor.y
    })
    const schritt = (i: number, von: { x: number; y: number }) => {
      if (i === punkte.length) {
        setFigur((f) => ({ ...f, dauer: 0 }))
        return dann?.()
      }
      const p = mitte(punkte[i])
      const dauer = ruhig() ? 0 : Math.round((Math.hypot(p.x - von.x, p.y - von.y) / TEMPO) * 1000)
      setFigur({ ...p, richtung: richtungZu(p.x - von.x, p.y - von.y), dauer })
      ankunft.current = window.setTimeout(() => schritt(i + 1, p), dauer)
    }
    schritt(0, figur)
  }

  async function ausfuehren(rpc: 'pflanzen' | 'ernten' | 'fuettern' | 'einsammeln' | 'farm_monster_waehlen', args: Record<string, unknown>, erfolg: string | ((neu: FarmDaten) => string)) {
    setFehler(null)
    const { data, error } = await supabase.rpc(rpc, { p_token: token, ...args })
    if (error) return setFehler(fehlerText(error))
    setDaten(data as FarmDaten)
    setMenue(null)
    setMeldung(typeof erfolg === 'string' ? erfolg : erfolg(data as FarmDaten))
    return true
  }

  if (!daten) return <p className="karte" role={fehler ? 'alert' : 'status'}>{fehler ?? 'Einen Moment …'}</p>

  function feldAntippen(feld: number) {
    const p = daten!.pflanzen.find((x) => x.feld === feld)
    setMeldung(null)
    if (!p) return setMenue({ art: 'feld', feld })
    if (p.reif) return void ausfuehren('ernten', { p_feld: feld }, `Geerntet! ${SORTE_NAME[p.sorte]} liegt jetzt beim Feld. Tippe es an zum Einsammeln.`)
    setMeldung(`${SORTE_NAME[p.sorte]} wächst noch. Jede gelöste Aufgabe gießt deine Felder.`)
  }

  function inDieLandschaft(e: MouseEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget && e.target !== leinwand.current) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / mal
    const y = (e.clientY - r.top) / mal
    const ziel = { x: Math.floor(x / KACHEL), y: Math.floor(y / KACHEL) }
    if (istGras(ziel.x, ziel.y) && !besetzt.has(`${ziel.x},${ziel.y}`)) gehe((o) => o.x === ziel.x && o.y === ziel.y)
  }

  const px = (kacheln: number) => kacheln * KACHEL * mal
  // Lage der Insel im Spielfenster: Kern (27 Kacheln) waagerecht und senkrecht mittig (Rahmen 34 bzw. 32 px)
  const insel = {
    links: 34 + Math.floor((flaeche.breite - 27 * KACHEL * mal) / 2) - RAND * KACHEL * mal,
    oben: 32 + Math.floor((flaeche.hoehe - ZEILEN * KACHEL * mal) / 2), // unten liegt keine Meldung mehr: Insel senkrecht mittig
  }
  // Deko lässt sich im Fenster „Farm einrichten“ ausblenden (gekauft bleibt sie)
  const dekoArten = daten.dinge.map((d) => d.artikel).filter((id) => !['huhn', 'kuh'].includes(id))
  const dinge = daten.dinge.filter((d) => !dekoAus.includes(d.artikel))
  const deko = dinge
    .filter((d) => !['huhn', 'kuh', 'brunnen', 'boot'].includes(d.artikel))
    .flatMap((d) => Array(d.anzahl).fill(d.artikel) as string[])
    .slice(0, DEKO_PLAETZE.length)
  const hatBrunnen = dinge.some((d) => d.artikel === 'brunnen')
  const hatBoot = dinge.some((d) => d.artikel === 'boot')
  function dekoSchalten(id: string) {
    const neu = dekoAus.includes(id) ? dekoAus.filter((x) => x !== id) : [...dekoAus, id]
    setDekoAus(neu)
    try {
      localStorage.setItem(DEKO_AUS, JSON.stringify(neu))
    } catch {
      // Speicher gesperrt (privater Modus): gilt dann nur, bis die Seite neu lädt
    }
  }
  const baeume = daten.baeume.filter((b) => BAUM_PLAETZE[b.art])
  const besetzt = hindernisse({
    deko: deko.length, brunnen: hatBrunnen, huehner: huehner.length, kuehe: kuehe.length, obstbaeume: baeume.map((b) => b.art),
    monster: Boolean(daten.monster),
  })
  const farmMonster = daten.monster ? monsterAus(daten.monster) : null
  const monsterMal = farmMonster ? farmMal(farmMonster, mal) : mal
  // Geschenk des Monsters ist ein Samen zum Pflanzen (Samentüte), alles andere Ernte, Ei, Milch oder Obst
  const liegtDing = (d: { sorte: string; bei: string }) =>
    d.bei.startsWith('monster:') ? { name: `Samen: ${SORTE_NAME[d.sorte] ?? d.sorte}`, grafik: GRAFIK.saatgut, nummer: (SORTE[d.sorte] ?? 0) * 2 } : vorratDing(d.sorte)
  const ernte = daten.vorrat.filter((v) => v.sorte in SORTE)
  // Was auf der Farm liegt: Ernte beim Feld, Ei/Milch beim Tier (Plätze rechnet ablagePlaetze, nichts überdeckt sich)
  const tierOrt = new Map<string, Ort[]>([
    ...huehner.map((t, i) => [`tier:${t.id}`, tierFlaeche(HUHN_PLAETZE[i], 1)] as const),
    ...kuehe.map((t, i) => [`tier:${t.id}`, tierFlaeche(KUH_PLAETZE[i], 2)] as const),
    ...baeume.map((b) => [`baum:${b.id}`, tierFlaeche(BAUM_PLAETZE[b.art], 2)] as const),
    // Geschenk rechts neben der Laufbahn des Monsters (darunter läge es unter der Meldung)
    ...(daten.monster ? [[`monster:${daten.monster}`, tierFlaeche({ x: MONSTER_PLATZ.x + 3, y: MONSTER_PLATZ.y }, 1)] as const] : []),
  ])
  const bepflanzt = new Set(daten.pflanzen.map((p) => `${FELD_PLAETZE[p.feld].x},${FELD_PLAETZE[p.feld].y}`))
  const liegenOrte = ablagePlaetze(
    daten.liegen.map((d) => (d.bei.startsWith('feld:') ? [FELD_PLAETZE[Number(d.bei.slice(5))]] : (tierOrt.get(d.bei) ?? [FIGUR_START]))),
    besetzt,
    bepflanzt,
  )

  // Wie weit das Bild wandern darf: eine Kuh allein in der Scheune nutzt die ganze Breite (der Platz daneben ist dann gesperrt,
  // siehe hindernisse), zwei Kühe drinnen nur wenig; draußen und Hühner ein kleines Stück.
  const bereich = (art: string, i: number): [number, number] =>
    art === 'huhn' ? [-6, 6] : i >= 2 ? [-8, 8] : kuehe.length === 1 ? [0, 2 * KACHEL] : i === 0 ? [-2, 4] : [-4, 2]

  // Obstbaum ernten (Lehrkraft 2026-11-12): Früchte fallen einmal herunter, danach sind die 3 Früchte im Vorrat (nichts liegt herum)
  async function baumErnten(id: string, name: string, fruechte: string) {
    setFehler(null)
    setMeldung(null)
    setFaellt(id)
    const [{ data, error }] = await Promise.all([
      supabase.rpc('baum_ernten', { p_token: token, p_baum: id }),
      new Promise((fertig) => window.setTimeout(fertig, ruhig() ? 0 : 1200)),
    ])
    setFaellt(null)
    if (error) return setFehler(fehlerText(error))
    setDaten(data as FarmDaten)
    setMeldung(`Geerntet! 3 ${fruechte} vom ${name} sind jetzt in deinem Vorrat.`)
  }

  // Obstbaum: steht still (mit Obst, wenn reif); nur beim Ernten bewegt er sich
  function baumKnopf(b: { id: string; art: string; tage: number }) {
    const o = BAUM_PLAETZE[b.art]
    const info = OBSTBAUM[b.art]
    const reif = b.tage === 0
    const zeile =
      faellt === b.id
        ? { grafik: info.grafik, nummer: 36, bilder: 12 }
        : reif
          ? { grafik: info.grafik, nummer: 0, bilder: 1 }
          : { grafik: GRAFIK.baum_ohne_obst, nummer: 0, bilder: 1 }
    const wann = b.tage === 1 ? 'morgen' : `in ${b.tage} Tagen`
    return (
      <button
        key={b.id}
        type="button"
        className="farm-ding farm-baum"
        style={{ left: px(o.x), top: px(o.y), width: px(2), height: px(2), zIndex: (o.y + 2) * KACHEL }}
        aria-label={reif ? `${info.name}: reif, antippen zum Ernten` : `${info.name}: trägt ${wann} wieder Früchte`}
        onClick={() =>
          gehe(nebenan(tierFlaeche(o, 2)), () => {
            if (!reif) return setMeldung(`Der ${info.name} trägt ${wann} wieder Früchte. Du kannst Obstbäume einmal pro Woche ernten.`)
            void baumErnten(b.id, info.name, info.fruechte)
          })
        }
      >
        <span
          className="farm-baum__bild"
          data-faellt={faellt === b.id || undefined}
          style={{ left: -8 * mal, top: -12 * mal, ['--bilder' as string]: zeile.bilder, ['--lauf' as string]: `${-zeile.bilder * 48 * mal}px` }}
        >
          <Sprite key={zeile.grafik.url + zeile.nummer} grafik={zeile.grafik} nummer={zeile.nummer} mal={mal} />
        </span>
      </button>
    )
  }

  function tierKnopf(t: { id: string; art: string; satt: boolean }, o: { x: number; y: number }, groesse: number, i: number) {
    return (
      <button
        key={t.id}
        type="button"
        className="farm-ding farm-tier"
        style={{ left: px(o.x), top: px(o.y), zIndex: (o.y + groesse) * KACHEL }}
        aria-label={`${TIER_NAME[t.art]} füttern${t.satt ? '' : ', hat Hunger'}`}
        onClick={() => gehe(nebenan(tierFlaeche(o, groesse)), () => setMenue({ art: 'tier', id: t.id }))}
      >
        <FarmTier art={t.art === 'kuh' ? 'kuh' : 'huhn'} mal={mal} von={bereich(t.art, i)[0]} bis={bereich(t.art, i)[1]}>
        </FarmTier>
        {herz === t.id && (
          <span className="farm-herz">
            <Sprite grafik={GRAFIK.herz} mal={mal} titel="Herz" />
          </span>
        )}
      </button>
    )
  }

  // Jazz 2026-11-17: Napf und Trog antippen öffnet das Füttern für das erste hungrige Tier daran (sonst das erste)
  function futterKnopf(key: string, name: string, tiere: { id: string; satt: boolean }[], grafik: Grafik, nummer: number, o: Ort, breite: number, bild: { x: number; y: number }) {
    const ziel = tiere.find((t) => !t.satt) ?? tiere[0]
    return (
      <button
        key={key}
        type="button"
        className="farm-ding farm-futter"
        style={{ left: px(o.x), top: px(o.y), width: px(breite), height: px(1), zIndex: (o.y + 1) * KACHEL }}
        aria-label={!tiere.length ? `${name}, leer` : ziel.satt ? `${name}, voll` : `${name}, leer: antippen zum Füttern`}
        onClick={() =>
          gehe(nebenan(flaecheVon(o, breite)), () =>
            ziel ? setMenue({ art: 'tier', id: ziel.id }) : setMeldung(name === 'Trog' ? 'Hier fressen deine Kühe. Kühe gibt es im Laden.' : 'Hier fressen deine Hühner. Hühner gibt es im Laden.'),
          )
        }
      >
        <span className="farm-ding" style={{ left: bild.x - px(o.x), top: bild.y - px(o.y) }}>
          <Sprite grafik={grafik} nummer={nummer} mal={mal} />
        </span>
      </button>
    )
  }

  const tier = menue?.art === 'tier' ? daten.tiere.find((t) => t.id === menue.id) : undefined

  // Lehrkraft 2026-11-12: statt Haken sagt die Figur, was reif ist
  const reifes = [
    ...daten.pflanzen.filter((p) => p.feld < felder && p.reif).map((p) => SORTE_NAME[p.sorte]),
    ...daten.baeume.filter((b) => b.tage === 0 && b.art in BAUM_PLAETZE).map((b) => OBSTBAUM[b.art].name),
  ]
  // Jazz 2026-11-17 (E4): Meldung, solange ein Tier hungrig ist
  const hungrigH = huehner.some((t) => !t.satt), hungrigK = kuehe.some((t) => !t.satt)
  // Jazz 2026-11-17: die Meldung sagt auch, was man antippt
  const hungerText = hungrigH && hungrigK
    ? 'Deine Tiere sind hungrig. Tippe ein Tier, den Napf oder den Trog an.'
    : hungrigH
      ? 'Deine Hühner sind hungrig. Tippe ein Huhn oder den Napf an.'
      : hungrigK
        ? 'Deine Kühe sind hungrig. Tippe eine Kuh oder den Trog an.'
        : null
  const grundText = hungerText ?? (daten.pflanzen.length === 0 && felder > 0 ? 'Tippe ein Feld an und pflanze deinen ersten Samen.' : 'Tippe irgendwohin, dann läuft deine Figur hin. Tippe Felder, Tiere und Bäume an.')
  const blasenText = reifes.length > 1 ? 'Ich kann mehrere Dinge ernten!' : reifes.length ? `${reifes[0]} kann geerntet werden!` : null

  return (
    // Jazz 2026-11-14: Spiel-Oberfläche statt Karte. Leiste (Sammelalbum, Zahnrad), Spielfenster in voller Breite, Vorrat als Tafel.
    // Jazz 2026-11-17 (E1): Spielfenster über die ganze Breite, innen Meer; die Insel steht oben mittig, unten bleibt Meer für die Meldung
    <section className="farm">
      {kopf.links &&
        createPortal(
          <>
            {/* Jazz 2026-11-15: nur Bilder, ohne Wort (Name für Vorlesehilfen in aria-label); Buch = Zeichnung der Lehrkraft, braun */}
            <a className="farm-bildknopf" href={album} aria-label="Sammelalbum">
              <Sprite grafik={GRAFIK.buch_symbol} mal={1.5} />
            </a>
            <button type="button" className="farm-bildknopf" aria-label="Vorrat" onClick={() => setVorratOffen(true)}>
              <Sprite grafik={GRAFIK.truhe} mal={2} />
            </button>
          </>,
          kopf.links,
        )}
      {kopf.rechts &&
        createPortal(
          <>
            {/* Jazz 2026-11-17 (E5): Der Laden-Knopf ersetzt den Menüpunkt „Shop“ unten, breiter und mit dem Wort */}
            {/* Jazz 2026-11-17: Holz gefüllt wie der Hauptknopf, damit man den Laden schnell findet */}
            <a className="knopf knopf--haupt farm-laden" href={shop}>
              <Symbol name="shop" />
              Laden
            </a>
            {/* Jazz 2026-11-17: doch wieder der alte Holzknopf mit Zahnrad */}
            <button type="button" className="holzknopf" aria-label="Farm einrichten" onClick={() => setEinrichten(true)}>
              <Symbol name="einstellungen" />
            </button>
          </>,
          kopf.rechts,
        )}
      {/* Usability-Test 2026-11-13: Meldungen an festem Platz; Jazz 2026-11-17: als Papier-Schild oben in der Kopfzeile (Mitte) */}
      {kopf.mitte &&
        createPortal(
          <div className="farm-meldung">
            {fehler ? (
              <p role="alert">{fehler}</p>
            ) : (
              <p role="status" className={meldung || hungerText ? undefined : 'leise'}>
                {meldung ?? grundText}
              </p>
            )}
          </div>,
          kopf.mitte,
        )}
      {/* Jazz 2026-11-17: im Hochformat nur dieser Hinweis (bausteine.css) */}
      <p className="farm-drehen" role="status">
        Dreh dein iPad, dann siehst du deine Farm.
      </p>
      <div ref={rahmen} className="farm-rahmen">
        {/* Jazz 2026-11-14: Holzrahmen wie ein Spielfenster; liegt über dem Rand (bausteine.css), innen Meer in Kachelgröße */}
        <div
          className="spiel-fenster"
          style={{ height: flaeche.hoehe + RAHMEN_H }}
        >
        {/* Meer und Insel nur innerhalb des Rahmens: das Rahmenbild ist außen 10 bis 12 px durchsichtig (MEER_RAND), dort nichts zeigen */}
        <div className="farm-meer" style={{ inset: `${MEER_RAND.oben}px ${MEER_RAND.seite}px ${MEER_RAND.seite}px`, backgroundImage: `url(${GRAFIK.wasser.url})`, backgroundSize: px(1), backgroundPosition: `${insel.links - MEER_RAND.seite}px ${insel.oben - MEER_RAND.oben}px` }}>
        <div className="farm-landschaft" style={{ width: px(SPALTEN), height: px(ZEILEN), left: insel.links - MEER_RAND.seite, top: insel.oben - MEER_RAND.oben }} onClick={inDieLandschaft}>
          <canvas ref={leinwand} width={SPALTEN * KACHEL} height={ZEILEN * KACHEL} style={{ width: px(SPALTEN), height: px(ZEILEN) }} aria-hidden="true" />

          {Array.from({ length: felder }, (_, feld) => {
            const ort = FELD_PLAETZE[feld]
            const p = daten.pflanzen.find((x) => x.feld === feld)
            const name = p ? SORTE_NAME[p.sorte] : ''
            const text = !p ? 'leer, antippen zum Pflanzen' : p.reif ? `${name}, reif, antippen zum Ernten` : `${name}, wächst`
            return (
              <button
                key={feld}
                type="button"
                className="farm-feld"
                style={{ left: px(ort.x), top: px(ort.y), width: px(1), height: px(1), zIndex: (ort.y + 1) * KACHEL }}
                aria-pressed={menue?.art === 'feld' && menue.feld === feld}
                aria-label={`Feld ${feld + 1}: ${text}`}
                onClick={() => gehe(nebenan([ort]), () => feldAntippen(feld))}
              >
                {p && <Sprite grafik={GRAFIK.pflanzen} nummer={SORTE[p.sorte] * 4 + p.bild} mal={mal} />}
              </button>
            )
          })}

          {hatBoot && (
            <span className="farm-ding farm-boot" style={{ left: px(BOOT.x), top: px(BOOT.y), zIndex: BOOT.y * KACHEL, ['--lauf' as string]: `${-96 * mal}px` }}>
              <Sprite grafik={GRAFIK.deko_boot} mal={mal} />
            </span>
          )}
          {baeume.map((b) => baumKnopf(b))}
          {hatBrunnen && <Ding grafik={GRAFIK.brunnen} x={px(BRUNNEN.x)} y={px(BRUNNEN.y)} mal={mal} z={(BRUNNEN.y + 2) * KACHEL} />}
          {deko.map((id, i) => {
            const b = artikelBild(id)
            const o = DEKO_PLAETZE[i]
            return <Ding key={i} grafik={b.grafik} nummer={b.nummer} x={px(o.x)} y={px(o.y)} mal={mal} z={(o.y + 1) * KACHEL} />
          })}
          {/* Wachsende Deko: Bild unten bündig, waagerecht mittig auf ihrem Platz (Höheres ragt nach oben), nicht antippbar */}
          {WACHSENDE_DEKO.map((w) => {
            const g = GRAFIK[`wachs_${w.id.toLowerCase()}` as keyof typeof GRAFIK]
            const links = px(w.x) + Math.round((w.b * KACHEL - g.bildBreite) / 2) * mal, unten = px(w.y + w.h)
            return (
              <span key={w.id}>
                <Ding grafik={g} nummer={Math.min(stufen[w.id] ?? 1, w.stufen) - 1} x={links} y={unten - g.bildHoehe * mal} mal={mal} z={(w.y + w.h) * KACHEL} />
                {glitzert.includes(w.id) && (
                  <span
                    className="farm-ding farm-glitzern"
                    style={{ left: px(w.x) + ((w.b - 1) * KACHEL * mal) / 2, top: unten - (g.bildHoehe / 2 + 5) * mal, zIndex: 9000, ['--lauf' as string]: `${-48 * mal}px` }}
                  >
                    <Sprite grafik={GRAFIK.glitzern} mal={mal} />
                  </span>
                )}
              </span>
            )
          })}
          {farmMonster && (
            // Jazz 2026-11-15: Hütte in der Dachfarbe des Monsters, nur solange ein Monster da ist; 2026-11-17 (E10): kleine Monster in der kleinen Hütte
            'klein' in farmMonster ? (
              <Ding grafik={GRAFIK.huette_klein} nummer={farmMonster.klein} x={px(HUETTE_KLEIN.x)} y={px(HUETTE_KLEIN.y)} mal={mal} z={(HUETTE_KLEIN.y + 3) * KACHEL} />
            ) : (
              <Ding grafik={GRAFIK.huette} nummer={farmMonster.dach} x={px(HUETTE.x)} y={px(HUETTE.y)} mal={mal} z={(HUETTE.y + 4) * KACHEL} />
            )
          )}
          {farmMonster && (
            <button
              type="button"
              className="farm-ding farm-monster"
              style={{
                left: px(MONSTER_PLATZ.x) - ((farmMonster.grafik.bildBreite * monsterMal) - KACHEL * mal) / 2,
                top: px(MONSTER_PLATZ.y + 1) - farmMonster.grafik.bildHoehe * monsterMal,
                zIndex: (MONSTER_PLATZ.y + 1) * KACHEL,
              }}
              aria-label={`${farmMonster.name}, wohnt auf deiner Farm`}
              onClick={() =>
                gehe(nebenan([MONSTER_PLATZ]), () =>
                  setMeldung(`${farmMonster.name} wohnt bei dir. Montags und donnerstags legt es dir einen Samen hin.`),
                )
              }
            >
              <FarmTier art="monster" grafik={farmMonster.grafik} mal={monsterMal} wegMal={mal} von={0} bis={2 * KACHEL} />
            </button>
          )}
          {/* Jazz 2026-11-17 (E4): Napf links für Huhn 1 und 3, rechts für Huhn 2 und 4; leer, solange eines davon hungrig ist */}
          {NAPF_PLAETZE.map((o, n) => {
            const seine = huehner.filter((_, i) => i % 2 === n)
            if (!seine.length) return null
            return futterKnopf(`napf${n}`, 'Napf', seine, GRAFIK.napf, seine.every((t) => t.satt) ? 1 : 0, o, 1, { x: px(o.x) + mal, y: px(o.y) + 8 * mal })
          })}
          {futterKnopf('trog', 'Trog', kuehe, GRAFIK.trog, trogVoll ? 0 : 2, TROG, 2, { x: px(TROG.x), y: px(TROG.y) })}
          {huehner.map((t, i) => tierKnopf(t, HUHN_PLAETZE[i], 1, i))}
          {kuehe.map((t, i) => tierKnopf(t, KUH_PLAETZE[i], 2, i))}
          {daten.liegen.map((d, i) => {
            const o = liegenOrte[i]
            const ding = liegtDing(d)
            return (
              <button
                key={d.id}
                type="button"
                className="farm-ding farm-liegt"
                style={{ left: px(o.x), top: px(o.y), width: px(1), height: px(1), zIndex: (o.y + 1) * KACHEL + 1 }}
                aria-label={`${ding.name} einsammeln`}
                onClick={() =>
                  gehe(
                    (z) => z.x === o.x && z.y === o.y,
                    () =>
                      void ausfuehren(
                        'einsammeln',
                        { p_ding: d.id },
                        d.bei.startsWith('monster:')
                          ? `Eingesammelt: ${ding.name}. Du kannst ihn jetzt auf ein leeres Feld pflanzen.`
                          : `Eingesammelt: ${ding.name}. Es liegt jetzt in deinem Vorrat.`,
                      ),
                  )
                }
              >
                <Sprite grafik={ding.grafik} nummer={ding.nummer} mal={mal} />
              </button>
            )
          })}

          <span
            className={`farm-figur${figur.dauer > 0 ? ' farm-figur--laeuft' : ''}`}
            aria-hidden="true"
            style={{
              left: (figur.x - 8) * mal,
              top: (figur.y - 30) * mal,
              width: 16 * mal,
              height: 32 * mal,
              zIndex: Math.round(figur.y),
              transition: `left ${figur.dauer}ms linear, top ${figur.dauer}ms linear`,
              backgroundImage: `url(${figurAus(figurName).grafik.url})`, // gewählte Figur (Einstellungen)
              backgroundSize: `${128 * mal}px ${96 * mal}px`,
              backgroundPositionX: -figur.richtung * 16 * mal,
              backgroundPositionY: -32 * mal, // Stehen (mittlere Zeile)
              ['--lauf' as string]: `${-96 * mal}px`,
            }}
          />

          {blase && blasenText && (
            <span
              className="farm-blase"
              style={{
                ['--bild' as string]: `url(${GRAFIK.dialog_blase.url})`,
                right: (SPALTEN * KACHEL - figur.x + 6) * mal,
                top: (figur.y - 22) * mal,
                // Jazz 2026-11-14: nie über den Holzrahmen hinaus (links 34 px Rahmen, dazu etwas Luft)
                maxWidth: (figur.x - 6) * mal - 48,
              }}
            >
              {blasenText}
            </span>
          )}
        </div>
        </div>
        </div>
      </div>


      {menue?.art === 'feld' && (
        <FarmMenue titel={`Feld ${menue.feld + 1}: Was möchtest du pflanzen?`} schliessen={() => setMenue(null)}>
          {daten.samen.length === 0 ? (
            <p>
              Du hast noch keine Samen. <a href={shop}>Im Shop</a> gibt es welche.
            </p>
          ) : (
            <MenueListe>
              {daten.samen.map((s) => (
                <MenuePlatz
                  key={s.sorte}
                  grafik={GRAFIK.saatgut}
                  nummer={SORTE[s.sorte] * 2}
                  name={SORTE_NAME[s.sorte]}
                  anzahl={s.anzahl}
                  waehlen={() => void ausfuehren('pflanzen', { p_feld: menue.feld, p_sorte: s.sorte }, `${SORTE_NAME[s.sorte]} gepflanzt! Jede gelöste Aufgabe gießt deine Felder.`)}
                />
              ))}
            </MenueListe>
          )}
        </FarmMenue>
      )}

      {tier && (
        <FarmMenue titel={`${TIER_NAME[tier.art]} füttern`} schliessen={() => setMenue(null)}>
          {tier.satt ? (
            <p>Heute ist es satt und zufrieden. Morgen frisst es wieder.</p>
          ) : ernte.length === 0 ? (
            <p>Ernte zuerst etwas auf deinen Feldern. Dann kannst du füttern.</p>
          ) : (
            <>
            <p>Gib {tier.art === 'huhn' ? 'dem Huhn' : 'der Kuh'} etwas aus deinem Vorrat. Dafür bekommst du {tier.art === 'huhn' ? 'ein Ei' : 'Milch'}.</p>
            <MenueListe>
              {ernte.map((v) => (
                <MenuePlatz
                  key={v.sorte}
                  grafik={GRAFIK.saatgut}
                  nummer={SORTE[v.sorte] * 2 + 1}
                  name={SORTE_NAME[v.sorte]}
                  anzahl={v.anzahl}
                  waehlen={() =>
                    void ausfuehren(
                      'fuettern',
                      { p_tier: tier.id, p_sorte: v.sorte },
                      (neu) => {
                        // das Neueste, was jetzt beim Tier liegt (Ei bzw. Milch in der Güte des Futters)
                        const ding = neu.liegen.filter((x) => x.bei === `tier:${tier.id}`).at(-1)
                        const was = ding ? vorratDing(ding.sorte).name : tier.art === 'huhn' ? 'Ei' : 'Milch'
                        return `${tier.art === 'huhn' ? 'Das Huhn freut sich. Neben ihm' : 'Die Kuh freut sich. Neben ihr'} liegt jetzt: ${was}. Tippe es an zum Einsammeln.`
                      },
                    ).then((ok) => {
                      if (!ok) return
                      setHerz(tier.id)
                      window.setTimeout(() => setHerz(null), 2500)
                    })
                  }
                />
              ))}
            </MenueListe>
            </>
          )}
        </FarmMenue>
      )}

      {einrichten && (
        <FarmMenue titel="Farm einrichten" schliessen={() => setEinrichten(false)}>
          <h4>Deine Figur</h4>
          <FigurWahl token={token} figur={figurName} nachWahl={nachFigur} />
          <h4>Dein Monster</h4>
          {!daten.monster_wahl?.length ? (
            <p>Freunde dich in 4 Übungen mit demselben Monster an. Dann zieht es auf deine Farm.</p>
          ) : (
            <div className="farm-deko-wahl">
              {daten.monster_wahl.map((m) => (
                <button
                  key={m}
                  type="button"
                  className="chip"
                  aria-pressed={daten.monster === m}
                  onClick={() => void ausfuehren('farm_monster_waehlen', { p_monster: m }, `${monsterAus(m).name} wohnt jetzt auf deiner Farm.`).then(() => setEinrichten(false))}
                >
                  <Sprite grafik={monsterAus(m).grafik} mal={monsterAus(m).grafik.bildHoehe <= 16 ? 2 : 1} />
                  {monsterAus(m).name}
                </button>
              ))}
            </div>
          )}
          <h4>Deko auf der Farm</h4>
          {dekoArten.length === 0 ? (
            <p>
              Du hast noch keine Deko. <a href={shop}>Im Shop</a> gibt es welche.
            </p>
          ) : (
            <div className="farm-deko-wahl">
              {dekoArten.map((id) => (
                <button key={id} type="button" role="switch" aria-checked={!dekoAus.includes(id)} className="schalter" onClick={() => dekoSchalten(id)}>
                  <span className="schalter__bahn" aria-hidden="true">
                    <span className="schalter__knopf" />
                  </span>
                  {DEKO_NAME[id] ?? id}
                </button>
              ))}
            </div>
          )}
        </FarmMenue>
      )}

      {daten.monster_neu && farmMonster && daten.monster && (
        <FarmMenue titel="Ein Monster möchte bei dir wohnen!" schliessen={() => void ausfuehren('farm_monster_waehlen', { p_monster: daten.monster }, `${farmMonster.name} wohnt jetzt auf deiner Farm.`)}>
          <p className="farm-monster-neu">
            <Sprite grafik={farmMonster.grafik} mal={3} />
          </p>
          <p>
            Du hast dich in 4 Übungen mit {farmMonster.name} angefreundet. Jetzt zieht es auf deine Farm. Montags und donnerstags legt es dir
            einen Samen hin. Unter „Farm einrichten“ kannst du später ein anderes Monster wählen.
          </p>
          <div className="knopf-reihe">
            <button
              type="button"
              className="knopf knopf--haupt"
              onClick={() => void ausfuehren('farm_monster_waehlen', { p_monster: daten.monster }, `${farmMonster.name} wohnt jetzt auf deiner Farm.`)}
            >
              Willkommen!
            </button>
          </div>
        </FarmMenue>
      )}

      {vorratOffen && (
        <FarmMenue titel="Dein Vorrat" schliessen={() => setVorratOffen(false)}>
        {daten.vorrat.length === 0 ? (
          <p>Noch leer. Was du erntest und einsammelst, liegt hier.</p>
        ) : (
          <ul className="farm-vorrat">
            {daten.vorrat.map((v) => {
              const d = vorratDing(v.sorte)
              return (
                <li key={v.sorte}>
                  <span className="farm-menue__bild">
                    <Sprite grafik={d.grafik} nummer={d.nummer} mal={3} />
                    <span className="farm-menue__anzahl">{v.anzahl}</span>
                  </span>
                  {d.name}
                </li>
              )
            })}
          </ul>
        )}
        </FarmMenue>
      )}
    </section>
  )
}

// Menü im Papier-Look (UI Pack): Titel, X zum Schließen, Inhalt scrollt bei vielen Gegenständen
function FarmMenue({ titel, schliessen, children }: { titel: string; schliessen: () => void; children: ReactNode }) {
  useEffect(() => {
    const taste = (e: KeyboardEvent) => e.key === 'Escape' && schliessen()
    window.addEventListener('keydown', taste)
    return () => window.removeEventListener('keydown', taste)
  }, [schliessen])
  return (
    <div className="fenster-hintergrund" onClick={(e) => e.target === e.currentTarget && schliessen()}>
      <div className="farm-menue" role="dialog" aria-modal="true" aria-label={titel}>
        <div className="farm-menue__kopf">
          <h3>{titel}</h3>
          {/* eslint-disable-next-line jsx-a11y/no-autofocus -- Fenster: Fokus muss hinein */}
          <button type="button" className="farm-menue__zu" onClick={schliessen} aria-label="Menü schließen" autoFocus>
            <Sprite grafik={GRAFIK.knopf_x} mal={3} />
          </button>
        </div>
        <div className="farm-menue__inhalt">{children}</div>
      </div>
    </div>
  )
}

const MenueListe = ({ children }: { children: ReactNode }) => <ul className="farm-menue__liste">{children}</ul>

function MenuePlatz(props: { grafik: Grafik; nummer: number; name: string; anzahl: number; waehlen: () => void }) {
  return (
    <li>
      <button type="button" className="farm-menue__platz" onClick={props.waehlen}>
        <span className="farm-menue__bild">
          <Sprite grafik={props.grafik} nummer={props.nummer} mal={3} />
          <span className="farm-menue__anzahl">{props.anzahl}</span>
        </span>
        {props.name}
      </button>
    </li>
  )
}

// Ein Gegenstand in der Landschaft (Deko); z = untere Kante in Grafik-Pixeln, damit Vorderes vorne liegt
function Ding(props: { grafik: Grafik; nummer?: number; x: number; y: number; mal: number; z: number }) {
  return (
    <span className="farm-ding" style={{ left: props.x, top: props.y, zIndex: props.z }}>
      <Sprite grafik={props.grafik} nummer={props.nummer} mal={props.mal} />
    </span>
  )
}
