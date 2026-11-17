// Aufbau der Farm-Landschaft (Lehrkraft 2026-11-12: wie das Sprout-Lands-Titelbild, verspielte Inselform, Platz für Deko).
// Jazz 2026-11-17 (Farm-Layout, docs/farm/layout-leer.md): Insel-Kern 27 × 15 Kacheln mit allen Plätzen, links und rechts je
// 4 Spalten Landstreifen nur mit Landschaft (dürfen am Fensterrand abgeschnitten werden). Alle Angaben in Kacheln zu 16 Pixeln,
// gezählt ab dem linken Landstreifen (Kern-Spalte 0 = Spalte 4). Scheune und Hühnerstall stehen von Anfang an.
export const KACHEL = 16
export const RAND = 4 // Landstreifen links und rechts

// # = Gras, . = Wasser. Neue Plätze für Deko einfach auf Gras legen (der Test prüft das).
const KERN = [
  '...........................',
  '...#########....########...',
  '..##########....###########',
  '############....###########',
  '###########################',
  '###########################',
  '###########################',
  '###########################',
  '###########################',
  '###########################',
  '###########################',
  '###########################',
  '...#######...##############',
  '....#####.....#########....',
  '...........................',
]
const LINKS = ['....', '....', '....', '..##', '.###', '.###', '.###', '.###', '.###', '..##', '..##', '...#', '....', '....', '....']
const RECHTS = ['....', '....', '#...', '##..', '###.', '###.', '###.', '###.', '###.', '###.', '##..', '##..', '#...', '....', '....']
const KARTE = KERN.map((z, i) => LINKS[i] + z + RECHTS[i])
export const SPALTEN = KARTE[0].length
export const ZEILEN = KARTE.length
export const istGras = (x: number, y: number) => KARTE[y]?.[x] === '#'
/** Gras des Kerns ohne Wasserrand (Kern-Spalten 1 bis 25, Zeilen 1 bis 13): muss immer ganz ins Fenster passen */
export const GRAS_KERN = { x: RAND + 1, y: 1, breite: 25, hoehe: 13 }

export type Ort = { x: number; y: number }
type Rechteck = { x0: number; y0: number; x1: number; y1: number }
const kern = (x: number, y: number): Ort => ({ x: x + RAND, y })

// Felder dicht wie heute (Jazz, E3), 4 × 3 links
export const FELD_PLAETZE: Ort[] = Array.from({ length: 12 }, (_, i) => kern(3 + (i % 4), 4 + Math.floor(i / 4)))
export const STALL: Ort = kern(19, 9) // 3 × 3 Kacheln
export const HUHN_PLAETZE: Ort[] = [kern(17, 10), kern(23, 10), kern(18, 12), kern(21, 12)] // Jazz 2026-11-17: Huhn 4 nicht am Ufer
// Napf (Jazz, E4): links vom Stall für Huhn 1 und 3, rechts für Huhn 2 und 4; leer, solange eines davon hungrig ist
export const NAPF_PLAETZE: Ort[] = [kern(17, 9), kern(23, 9)]
// Scheune von oben mit offenem Dach; unten in der Mitte ein Durchgang ohne Tür (2 Kacheln).
// Heu und Trog stehen hinten an der Wand, die zwei Kühe davor (Jazz 2026-11-17: höchstens 2 Kühe).
export const SCHEUNE: Rechteck = { x0: RAND + 18, y0: 1, x1: RAND + 23, y1: 6 }
export const TUER: Ort = kern(20, 6)
export const HEU: Ort = kern(19, 2) // 2 × 1
export const TROG: Ort = kern(21, 2) // 2 × 1
export const KUH_PLAETZE: Ort[] = [kern(19, 3), kern(21, 3)] // je 2 × 2
export const BAEUME: (Ort & { grafik: 'baum' | 'baum_klein' })[] = [
  { grafik: 'baum', ...kern(13, 10) }, { grafik: 'baum_klein', ...kern(24, 6) }, { grafik: 'baum_klein', ...kern(2, 2) },
  { grafik: 'baum_klein', ...kern(12, 4) }, { grafik: 'baum_klein', ...kern(2, 9) },
  // auf den Landstreifen (nur Landschaft)
  { grafik: 'baum', ...kern(-3, 6) }, { grafik: 'baum_klein', ...kern(-2, 9) }, { grafik: 'baum', ...kern(28, 5) }, { grafik: 'baum_klein', ...kern(27, 9) },
]
export const BRUNNEN: Ort = kern(13, 7) // 2 × 2
// Obstbäume nebeneinander im Obstgarten über dem Acker (je 2 × 2 Kacheln Stamm und Krone; das Bild 48 × 48 ragt darüber hinaus)
export const BAUM_PLAETZE: Record<string, Ort> = { orangenbaum: kern(3, 2), pfirsichbaum: kern(6, 2), birnenbaum: kern(9, 2) }
// Boot (3 × 2 Kacheln) in der Bucht oben; kein Hindernis (Wasser ist es schon)
export const BOOT: Ort = kern(12, 1)
// 20 kleine Deko-Plätze, bewusst nicht in Reihen (Jazz, E9); zwischen zwei antippbaren kleinen Dingen liegt eine freie Kachel
export const DEKO_PLAETZE: Ort[] = [
  [1, 4], [1, 7], [1, 9], [2, 11], [8, 13], [11, 9], [11, 11], [16, 3], [24, 3], [25, 5],
  [15, 10], [13, 12], [15, 12], [24, 12], [25, 8], [25, 10], [3, 9], [15, 7], [9, 7], [9, 10],
].map(([x, y]) => kern(x, y))
// Wachsende Deko (Jazz 2026-11-17, docs/farm/dekorationen.md): steht von Anfang an, wächst mit dem Lernfortschritt, nicht antippbar.
// b × h Kacheln (das Bild ragt ggf. darüber hinaus), stufen = Zahl der Bilder (muss zu wachstum_verteilen in der Datenbank passen).
export const WACHSENDE_DEKO = [
  { id: 'W1', name: 'Kirschbaum', ...kern(13, 4), b: 2, h: 2, stufen: 5, gewachsen: 'Dein Kirschbaum ist gewachsen!', fertig: 'Dein Kirschbaum blüht jetzt!' },
  { id: 'W2', name: 'Wildblumen', ...kern(11, 5), b: 1, h: 1, stufen: 4, gewachsen: 'Deine Wildblumen sind gewachsen!', fertig: 'Dein Lavendel blüht jetzt!' },
  { id: 'W3', name: 'Sonnenblume', ...kern(17, 7), b: 1, h: 2, stufen: 4, gewachsen: 'Deine Sonnenblume ist gewachsen!', fertig: 'Deine Sonnenblume blüht jetzt!' },
  { id: 'W4', name: 'Seerosen', ...kern(10, 12), b: 2, h: 1, stufen: 4, wasser: true, gewachsen: 'Deine Seerosen sind gewachsen!', fertig: 'Deine Seerose blüht jetzt!' },
  { id: 'W5', name: 'Beerenbusch', ...kern(11, 7), b: 1, h: 1, stufen: 3, gewachsen: 'Dein Beerenbusch ist gewachsen!', fertig: 'An deinem Busch hängen jetzt Beeren!' },
  { id: 'W6', name: 'Vogelhaus', ...kern(25, 6), b: 1, h: 2, stufen: 5, gewachsen: 'An deinem Vogelhaus wurde weitergebaut!', fertig: 'Ein Vogel wohnt jetzt in deinem Vogelhaus!' },
  { id: 'W7', name: 'Eiche', ...kern(0, 5), b: 1, h: 2, stufen: 5, gewachsen: 'Deine Eiche ist gewachsen!', fertig: 'Deine Eiche ist jetzt ein Baum!' },
  { id: 'W8', name: 'Sonnenblume', ...kern(8, 8), b: 1, h: 2, stufen: 4, gewachsen: 'Deine Sonnenblume ist gewachsen!', fertig: 'Deine Sonnenblume blüht jetzt!' },
] as const
/** Kacheln, die eine wachsende Deko auf dem Land belegt (Seerosen liegen im Wasser) */
export const wachsKacheln = (): Ort[] => WACHSENDE_DEKO.filter((w) => !('wasser' in w)).flatMap((w) => flaeche(w, w.b, w.h))
// Monster, das auf der Farm wohnt (Jazz 2026-11-15/17): Hütte links unter dem Acker, Eingang nicht am Wasser; Laufweg vor der Tür.
// Große Hütte 4 × 4 (Hindernis die unteren 2 Reihen), kleine Hütte 2 × 3 unten mittig für kleine Monster (Jazz, E10).
export const HUETTE: Ort = kern(4, 8)
export const HUETTE_KLEIN: Ort = kern(5, 9)
export const huettenKacheln = (): Ort[] => flaeche({ x: HUETTE.x, y: HUETTE.y + 2 }, 4, 2)
export const MONSTER_PLATZ: Ort = kern(5, 12) // läuft 2 Kacheln nach rechts, ringsum Gras (Jazz, E6)
export const FIGUR_START: Ort = kern(16, 8) // im Hof
// Kleine Halme und Blümchen auf dem Gras (nur innen, nie am Rand)
export const GRAS_DEKO: (Ort & { nummer: number })[] = [
  [10, 6], [8, 7], [16, 11], [10, 4], [12, 9], [15, 6], [17, 12], [21, 8], [17, 5], [2, 8], [10, 10], [9, 9], [20, 8], [16, 6], [-1, 4], [28, 7],
].map(([x, y], i) => ({ ...kern(x, y), nummer: [0, 3, 5, 1, 9, 7, 4, 11, 2, 10, 6, 8][i % 12] }))

/** Teil eines 3 × 3-Rahmens (0 links oben … 4 Mitte … 8 rechts unten) für die Kachel (x, y) im Rechteck r */
export function neunerTeil(x: number, y: number, r: Rechteck): number {
  const spalte = x === r.x0 ? 0 : x === r.x1 ? 2 : 1
  const zeile = y === r.y0 ? 0 : y === r.y1 ? 2 : 1
  return zeile * 3 + spalte
}

// Kachelsatz „Blob“ (Gras und Acker): Nachbarn als 3 × 3-Muster (Zeilen von oben, 1 = belegt) → Nummer im Blatt (11 Spalten).
// Ausgelesen aus „Bitmask references 2.png“ des Pakets. Ecken zählen nur, wenn beide angrenzenden Seiten belegt sind.
const BLOB: Record<string, number> = {
  '110110000': 24, '110110010': 18, '110110110': 13, '110111000': 38, '110111010': 43, '110111011': 9, '110111110': 49,
  '110111111': 27, '111111000': 23, '111111010': 19, '111111011': 17, '111111110': 16, '111111111': 12, '000011011': 0,
  '000111111': 1, '000110110': 2, '000010010': 3, '000011010': 4, '000111110': 5, '000111011': 6, '000110010': 7,
  '000111010': 8, '011011011': 11, '010010010': 14, '011011010': 15, '011111110': 20, '011011000': 22, '010010000': 25,
  '010011011': 26, '011111111': 28, '010110110': 29, '010111111': 30, '010111011': 31, '010111110': 32, '000011000': 33,
  '000111000': 34, '000110000': 35, '000010000': 36, '010011000': 37, '011111000': 39, '010110000': 40, '010111000': 41,
  '011111010': 42, '010011010': 48, '011111011': 50, '010110010': 51, '010111010': 52,
}

/** Passendes Teil aus dem Blob-Kachelsatz für Kachel (x, y), wenn `belegt` sagt, welche Kacheln dazugehören */
export function blobTeil(x: number, y: number, belegt: (x: number, y: number) => boolean): number {
  const n = belegt(x, y - 1), s = belegt(x, y + 1), w = belegt(x - 1, y), o = belegt(x + 1, y)
  const b = (v: boolean) => (v ? '1' : '0')
  const muster =
    b(n && w && belegt(x - 1, y - 1)) + b(n) + b(n && o && belegt(x + 1, y - 1)) +
    b(w) + '1' + b(o) +
    b(s && w && belegt(x - 1, y + 1)) + b(s) + b(s && o && belegt(x + 1, y + 1))
  return BLOB[muster] ?? 12
}

/** Feste Kacheln des Hintergrunds in Zeichen-Reihenfolge: Wasser, Gras, Grasdeko */
export function grundKacheln(): (Ort & { grafik: 'wasser' | 'gras' | 'gras_deko'; nummer: number })[] {
  const liste: (Ort & { grafik: 'wasser' | 'gras' | 'gras_deko'; nummer: number })[] = []
  for (let y = 0; y < ZEILEN; y++)
    for (let x = 0; x < SPALTEN; x++) {
      liste.push({ grafik: 'wasser', nummer: 0, x, y })
      if (istGras(x, y)) liste.push({ grafik: 'gras', nummer: blobTeil(x, y, istGras), x, y })
    }
  for (const d of GRAS_DEKO) liste.push({ grafik: 'gras_deko', ...d })
  return liste
}

/** Kacheln der Scheune: Wand-Rahmen mit Holzboden innen; an der Tür Boden statt Wand */
export function scheunenKacheln(): (Ort & { nummer: number })[] {
  const liste: (Ort & { nummer: number })[] = []
  for (let y = SCHEUNE.y0; y <= SCHEUNE.y1; y++)
    for (let x = SCHEUNE.x0; x <= SCHEUNE.x1; x++) {
      const tuer = y === TUER.y && (x === TUER.x || x === TUER.x + 1)
      liste.push({ x, y, nummer: tuer ? 4 : neunerTeil(x, y, SCHEUNE) })
    }
  return liste
}

/** Alle belegten Kacheln (für den Test: nichts überdeckt sich, alles liegt auf Gras) */
export function belegung(): Map<string, string> {
  const belegt = new Map<string, string>()
  const setze = (name: string, o: Ort, breite = 1, hoehe = 1) => {
    for (let dy = 0; dy < hoehe; dy++)
      for (let dx = 0; dx < breite; dx++) {
        const k = `${o.x + dx},${o.y + dy}`
        if (belegt.has(k)) throw new Error(`${name} überdeckt ${belegt.get(k)} bei ${k}`)
        belegt.set(k, name)
      }
  }
  FELD_PLAETZE.forEach((o, i) => setze(`Feld ${i}`, o))
  setze('Stall', STALL, 3, 3)
  HUHN_PLAETZE.forEach((o, i) => setze(`Huhn ${i}`, o))
  setze('Scheune', { x: SCHEUNE.x0, y: SCHEUNE.y0 }, SCHEUNE.x1 - SCHEUNE.x0 + 1, SCHEUNE.y1 - SCHEUNE.y0 + 1)
  NAPF_PLAETZE.forEach((o, i) => setze(`Napf ${i}`, o))
  BAEUME.forEach((b) => setze(b.grafik, b, b.grafik === 'baum' ? 2 : 1, 2))
  setze('Brunnen', BRUNNEN, 2, 2)
  Object.entries(BAUM_PLAETZE).forEach(([name, o]) => setze(name, o, 2, 2))
  DEKO_PLAETZE.forEach((o, i) => setze(`Deko ${i}`, o))
  huettenKacheln().forEach((o) => setze('Hütte', o))
  setze('Monster', MONSTER_PLATZ)
  wachsKacheln().forEach((o) => setze('wachsende Deko', o))
  setze('Figur', FIGUR_START)
  return belegt
}

export type Stand = { deko: number; brunnen: boolean; huehner: number; kuehe: number; obstbaeume?: string[]; monster?: boolean }
function flaeche(o: Ort, breite: number, hoehe: number): Ort[] {
  return Array.from({ length: breite * hoehe }, (_, i) => ({ x: o.x + (i % breite), y: o.y + Math.floor(i / breite) }))
}
/** Kacheln, die ein Tier belegt (Huhn 1 × 1, Kuh 2 × 2) oder ein Obstbaum (2 × 2) */
export const tierFlaeche = (o: Ort, groesse: number) => flaeche(o, groesse, groesse)

/** Kacheln, durch die die Figur nicht laufen kann (Wasser zählt extra) */
export function hindernisse(s: Stand): Set<string> {
  // Felder sind Boden: darauf darf man gehen (sonst kommt man an die mittleren nicht heran)
  const liste: Ort[] = [...DEKO_PLAETZE.slice(0, s.deko), ...wachsKacheln()]
  for (const b of BAEUME) liste.push(...flaeche(b, b.grafik === 'baum' ? 2 : 1, 2))
  if (s.brunnen) liste.push(...flaeche(BRUNNEN, 2, 2))
  if (s.monster) liste.push(MONSTER_PLATZ, ...huettenKacheln())
  for (const b of s.obstbaeume ?? []) if (BAUM_PLAETZE[b]) liste.push(...flaeche(BAUM_PLAETZE[b], 2, 2))
  // Stall und Scheune stehen von Anfang an (Jazz, E2)
  liste.push(...flaeche(STALL, 3, 3), ...NAPF_PLAETZE, ...scheunenKacheln().filter((k) => k.nummer !== 4), ...flaeche(HEU, 2, 1), ...flaeche(TROG, 2, 1))
  if (s.huehner) liste.push(...HUHN_PLAETZE.slice(0, s.huehner))
  if (s.kuehe) {
    // eine Kuh allein läuft in der ganzen Scheune hin und her (FarmTier): dann auch den zweiten Platz drinnen sperren
    for (const k of KUH_PLAETZE.slice(0, s.kuehe === 1 ? 2 : s.kuehe)) liste.push(...tierFlaeche(k, 2))
  }
  return new Set(liste.map((o) => `${o.x},${o.y}`))
}

/**
 * Kürzester Weg (8 Richtungen, keine Ecken abschneiden) von `start` zur nächsten Kachel, für die `ziel` gilt.
 * Ergebnis ohne die Startkachel; null, wenn kein Weg da ist.
 */
export function weg(start: Ort, ziel: (o: Ort) => boolean, besetzt: Set<string>): Ort[] | null {
  const frei = (x: number, y: number) => istGras(x, y) && !besetzt.has(`${x},${y}`)
  const herkunft = new Map<string, string | null>([[`${start.x},${start.y}`, null]])
  const schlange: Ort[] = [start]
  for (let i = 0; i < schlange.length; i++) {
    const o = schlange[i]
    if (ziel(o)) {
      const pfad: Ort[] = []
      for (let k: string | null = `${o.x},${o.y}`; k && herkunft.get(k) !== null; k = herkunft.get(k)!) {
        const [x, y] = k.split(',').map(Number)
        pfad.unshift({ x, y })
      }
      return pfad
    }
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const x = o.x + dx, y = o.y + dy, k = `${x},${y}`
        if ((!dx && !dy) || herkunft.has(k) || !frei(x, y)) continue
        if (dx && dy && (!frei(o.x + dx, o.y) || !frei(o.x, o.y + dy))) continue
        herkunft.set(k, `${o.x},${o.y}`)
        schlange.push({ x, y })
      }
  }
  return null
}

/** Ziel „neben einem Ding“: freie Kachel, die waagrecht oder senkrecht an eine der Kacheln grenzt */
export const nebenan = (kacheln: Ort[]) => (o: Ort) => kacheln.some((k) => Math.abs(k.x - o.x) + Math.abs(k.y - o.y) === 1)

/**
 * Plätze für Dinge, die auf der Farm liegen (Ernte beim Feld, Ei/Milch beim Tier): je Ding die nächste freie Graskachel
 * um seinen Ursprung herum, nicht auf Hindernissen, nicht in `gesperrt` (z. B. bepflanzte Felder) und nicht doppelt.
 */
export function ablagePlaetze(ursprung: Ort[][], besetzt: Set<string>, gesperrt: Set<string>): Ort[] {
  const vergeben = new Set<string>()
  return ursprung.map((start) => {
    const gesehen = new Set(start.map((o) => `${o.x},${o.y}`))
    const schlange = [...start]
    for (let i = 0; i < schlange.length; i++) {
      const o = schlange[i]
      const k = `${o.x},${o.y}`
      if (istGras(o.x, o.y) && !besetzt.has(k) && !gesperrt.has(k) && !vergeben.has(k)) {
        vergeben.add(k)
        return o
      }
      for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) {
        const n = { x: o.x + dx, y: o.y + dy }
        const nk = `${n.x},${n.y}`
        if (!gesehen.has(nk) && istGras(n.x, n.y)) {
          gesehen.add(nk)
          schlange.push(n)
        }
      }
    }
    return start[0] // shortcut: Insel ganz voll, dann eben auf den Ursprung
  })
}
