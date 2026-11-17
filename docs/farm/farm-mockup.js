// Gemeinsames Skript der Farm-Mockups (layout-leer.html, layout-voll.html). window.VOLL = true zeichnet die voll ausgebaute Farm.
// ---------- Karte: Kern 27 × 15 Kacheln mit allen Plätzen, links und rechts je 4 Spalten nur Landschaft (Vorschlag) ----------
// Alle Platz-Angaben unten sind Kern-Koordinaten (0–26). Die Landstreifen (x −4 … −1 und 27 … 30) tragen keine Plätze und
// dürfen am Fensterrand abgeschnitten werden; auf breiten iPads sieht man mehr davon.
const K = 16, G = '../../src/grafik/'
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
const OX = 4, SP = 27, ZE = 15, SP_GANZ = OX + SP + 4
const KARTE = KERN.map((z, i) => LINKS[i] + z + RECHTS[i])
const fehler = []
KARTE.forEach((z, i) => { if (z.length !== SP_GANZ) fehler.push(`Zeile ${i} hat ${z.length} Zeichen`) })
const grasGanz = (x, y) => KARTE[y]?.[x] === '#'
const gras = (x, y) => grasGanz(x + OX, y) // Kern-Koordinaten

// Plätze (x, y in Kacheln; b × h)
// Jazz 2026-11-17 (E3): Felder dicht wie heute (4 × 3), das hat sich in Tests bewährt; dafür mehr Platz für Deko
const FELDER = Array.from({ length: 12 }, (_, i) => ({ x: 3 + (i % 4), y: 4 + Math.floor(i / 4) }))
const START_FELDER = 4
const OBSTBAEUME = [{ x: 3, y: 1, n: 'Orange' }, { x: 6, y: 1, n: 'Pfirsich' }, { x: 9, y: 1, n: 'Birne' }] // Bild 3 × 3
const SCHEUNE = { x: 18, y: 1, b: 6, h: 6 }
const KUEHE = [{ x: 19, y: 3 }, { x: 21, y: 3 }] // je 2 × 2, höchstens 2 (Jazz 2026-11-17)
const STALL = { x: 19, y: 9 } // 3 × 3
const HUEHNER = [{ x: 17, y: 10 }, { x: 23, y: 10 }, { x: 18, y: 12 }, { x: 22, y: 12 }]
const HUETTE = { x: 4, y: 10 } // Bild 4 × 4
// Jazz 2026-11-17: Monster läuft nie ins Wasser. Laufweg 2 Kacheln vor der Hütte; links, rechts und darunter ist Gras (Prüfung unten)
const MONSTER = { x: 8, y: 11 }
const BRUNNEN = { x: 13, y: 7 } // 2 × 2
const BOOT = { x: 12, y: 1 } // 3 × 2 im Wasser
const FIGUR = { x: 16, y: 8 } // Füße auf Zeile 9
const WACHSEND = [ // Teilaufgabe 4 legt fest, was hier wächst; hier nur Platz und Größe
  { x: 13, y: 4, b: 2, h: 2, n: 'W1' }, { x: 11, y: 5, b: 1, h: 1, n: 'W2' }, { x: 17, y: 7, b: 1, h: 1, n: 'W3' },
  { x: 10, y: 12, b: 2, h: 1, n: 'W4', wasser: true }, { x: 11, y: 7, b: 1, h: 1, n: 'W5' }, { x: 22, y: 8, b: 1, h: 1, n: 'W6' },
  { x: 16, y: 1, b: 1, h: 1, n: 'W7' }, { x: 24, y: 11, b: 1, h: 1, n: 'W8' },
]
// Deko-Plätze in drei Größen: klein 1 × 1 (D), groß 2 × 2 (G), im Wasser 1 × 1 (S)
const DEKO = [[1, 4], [1, 7], [1, 9], [2, 11], [8, 13], [11, 9], [11, 11], [16, 3], [24, 3], [25, 5],
  [15, 10], [13, 12], [15, 12], [20, 13], [25, 8], [25, 10], [3, 8], [5, 8], [7, 8], [9, 8]].map(([x, y]) => ({ x, y }))
const DEKO_GROSS = [{ x: 8, y: 4 }, { x: 16, y: 4 }]
// Wasser-Plätze nur oben (Jazz: unten lag S2 im Meldungsfeld)
const DEKO_WASSER = [[14, 3], [1, 2], [15, 1], [24, 1]].map(([x, y]) => ({ x, y }))
const BAEUME_FEST = [{ g: 'baum', x: 13, y: 10, b: 2, h: 2 }, { g: 'baum_klein', x: 24, y: 6, b: 1, h: 2 }, { g: 'baum_klein', x: 2, y: 2, b: 1, h: 2 },
  { g: 'baum_klein', x: 12, y: 4, b: 1, h: 2 }, { g: 'baum_klein', x: 2, y: 9, b: 1, h: 2 },
  // auf den Landstreifen (nur Landschaft)
  { g: 'baum', x: -3, y: 6, b: 2, h: 2 }, { g: 'baum_klein', x: -2, y: 9, b: 1, h: 2 }, { g: 'baum', x: 28, y: 5, b: 2, h: 2 }, { g: 'baum_klein', x: 27, y: 9, b: 1, h: 2 }]
const GRAS_DEKO = [[10, 6], [8, 7], [4, 9], [10, 4], [12, 9], [15, 6], [17, 12], [21, 8], [15, 4], [2, 8], [10, 10], [9, 9], [19, 7], [16, 6], [-2, 4], [29, 8]]

// ---------- Selbstprüfung: alles auf Gras, nichts überdeckt sich, Tippflächen 48 px überlappen nicht ----------
const belegt = new Map()
function lege(name, x, y, b = 1, h = 1, aufWasser = false) {
  for (let i = x; i < x + b; i++) for (let j = y; j < y + h; j++) {
    if (!aufWasser && !gras(i, j)) fehler.push(`${name} (${i}, ${j}) liegt nicht auf Gras`)
    const k = `${i},${j}`
    if (belegt.has(k)) fehler.push(`${name} überdeckt ${belegt.get(k)} bei (${i}, ${j})`)
    belegt.set(k, name)
  }
}
FELDER.forEach((o, i) => lege('Feld ' + (i + 1), o.x, o.y))
OBSTBAEUME.forEach((o) => lege(o.n + 'baum', o.x, o.y, 3, 3))
lege('Scheune', SCHEUNE.x, SCHEUNE.y, SCHEUNE.b, SCHEUNE.h)
lege('Stall', STALL.x, STALL.y, 3, 3)
HUEHNER.forEach((o, i) => lege('Huhn ' + (i + 1), o.x, o.y))
lege('Hütte', HUETTE.x, HUETTE.y, 4, 4)
lege('Monster', MONSTER.x, MONSTER.y, 2, 1)
lege('Brunnen', BRUNNEN.x, BRUNNEN.y, 2, 2)
lege('Boot', BOOT.x, BOOT.y, 3, 2, true)
lege('Figur', FIGUR.x, FIGUR.y, 1, 2)
WACHSEND.forEach((w) => lege(w.n, w.x, w.y, w.b, w.h, w.wasser))
DEKO.forEach((d, i) => lege('Deko ' + (i + 1), d.x, d.y))
DEKO_GROSS.forEach((d, i) => lege('Deko groß ' + (i + 1), d.x, d.y, 2, 2))
DEKO_WASSER.forEach((d, i) => { lege('Deko Wasser ' + (i + 1), d.x, d.y, 1, 1, true); if (gras(d.x, d.y)) fehler.push(`Wasser-Deko ${i + 1} liegt auf Gras`) })
BAEUME_FEST.forEach((t) => lege(t.g, t.x, t.y, t.b, t.h))
// Monster: Laufweg auf Gras, daneben (links/rechts) Gras oder Hütte, darunter Gras
for (let i = MONSTER.x - 1; i <= MONSTER.x + 2; i++) {
  const huette = i >= HUETTE.x && i < HUETTE.x + 4
  if (!huette && !gras(i, MONSTER.y)) fehler.push(`Monster-Laufweg grenzt an Wasser bei (${i}, ${MONSTER.y})`)
  if (i >= MONSTER.x && i <= MONSTER.x + 1 && !gras(i, MONSTER.y + 1)) fehler.push(`Unter dem Monster ist Wasser bei (${i}, ${MONSTER.y + 1})`)
}
// Nichts Antippbares im Wasser unter der Insel (dort liegt das Meldungsfeld)
DEKO_WASSER.forEach((d, i) => { if (d.y >= 12) fehler.push(`Wasser-Deko ${i + 1} liegt zu weit unten`) })
GRAS_DEKO.forEach(([x, y]) => { if (belegt.has(`${x},${y}`) || !gras(x, y)) fehler.push(`Grasdeko (${x}, ${y}) liegt schlecht`) })
// Antippbare 1 × 1-Dinge brauchen ringsum eine freie Kachel (dann passt bei 2-fach eine Tippfläche von 48 × 48 px ohne Überlappung)
// Ausnahme (Jazz, E3): Felder untereinander liegen dicht, ihre Tippfläche bleibt bei 2-fach 32 px
const klein = [...FELDER.map((o) => ['Feld', o]), ...HUEHNER.map((o) => ['Huhn', o]), ...DEKO.map((o) => ['Deko', o]), ...DEKO_WASSER.map((o) => ['Wasser-Deko', o])]
for (let i = 0; i < klein.length; i++) for (let j = i + 1; j < klein.length; j++) {
  const [na, a] = klein[i], [nb, b] = klein[j]
  if (na === 'Feld' && nb === 'Feld') continue
  if (Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)) < 2) fehler.push(`${na} (${a.x}, ${a.y}) zu nah an ${nb} (${b.x}, ${b.y})`)
}

// ---------- Blob-Kachelsatz (Kopie der Tabelle aus src/lib/landschaft.ts) ----------
const BLOB = { '110110000': 24, '110110010': 18, '110110110': 13, '110111000': 38, '110111010': 43, '110111011': 9, '110111110': 49,
  '110111111': 27, '111111000': 23, '111111010': 19, '111111011': 17, '111111110': 16, '111111111': 12, '000011011': 0,
  '000111111': 1, '000110110': 2, '000010010': 3, '000011010': 4, '000111110': 5, '000111011': 6, '000110010': 7,
  '000111010': 8, '011011011': 11, '010010010': 14, '011011010': 15, '011111110': 20, '011011000': 22, '010010000': 25,
  '010011011': 26, '011111111': 28, '010110110': 29, '010111111': 30, '010111011': 31, '010111110': 32, '000011000': 33,
  '000111000': 34, '000110000': 35, '000010000': 36, '010011000': 37, '011111000': 39, '010110000': 40, '010111000': 41,
  '011111010': 42, '010011010': 48, '011111011': 50, '010110010': 51, '010111010': 52 }
function blob(x, y) { // Koordinaten der ganzen Karte
  const g = grasGanz
  const n = g(x, y - 1), s = g(x, y + 1), w = g(x - 1, y), o = g(x + 1, y), b = (v) => (v ? '1' : '0')
  const m = b(n && w && g(x - 1, y - 1)) + b(n) + b(n && o && g(x + 1, y - 1)) + b(w) + '1' + b(o) + b(s && w && g(x - 1, y + 1)) + b(s) + b(s && o && g(x + 1, y + 1))
  if (!(m in BLOB)) fehler.push(`Kein Ufer-Teil für (${x}, ${y})`)
  return BLOB[m] ?? 12
}

// ---------- Größe: größter ganzzahliger Faktor, bei dem die Insel ganz passt; Meer füllt den Rest ----------
const q = new URLSearchParams(location.search), plaetze = q.has("plaetze")
const VOLL = !!window.VOLL
// ?b=1024&h=768 legt die Seitengröße fest (für Bildschirmfotos im Kopfmodus von Edge, der beim Laden kleiner misst)
if (q.has("b")) Object.assign(document.documentElement.style, { width: q.get("b") + "px", height: q.get("h") + "px" })
const bild = (n) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = G + n + '.png' })
let mal = 2
async function zeichnen() {
  const fenster = document.getElementById('fenster'), buehne = document.getElementById('buehne')
  const kopf = 64, menue = 83, rand = 8, rahmenB = 68, rahmenH = 66
  const W = q.has("b") ? +q.get("b") : document.documentElement.clientWidth, H = q.has("b") ? +q.get("h") : document.documentElement.clientHeight
  const breite = W - 2 * rand - rahmenB
  const hoehe = H - kopf - menue - rand - rahmenH
  // Maßgeblich ist das Gras (Spalten 1–25, Zeilen 1–13 = 25 × 13 Kacheln); der Wasserrand darf abgeschnitten werden
  mal = Math.max(2, Math.floor(Math.min(breite / (25 * K), hoehe / (13 * K))))
  const p = K * mal
  buehne.style.width = breite + 'px'
  buehne.style.height = hoehe + 'px'
  // Insel waagerecht mittig; oben bündig mit halber Wasserreihe Abstand, damit unten Platz für die Meldung bleibt
  const links = Math.floor((breite - SP * p) / 2), oben = Math.min(-Math.floor(p / 2), Math.floor((hoehe - ZE * p) / 2))
  buehne.style.backgroundSize = p + 'px'
  buehne.style.backgroundPosition = `${links}px ${oben}px`

  const namen = ['wasser', 'gras', 'gras_deko', 'feld', 'baum', 'baum_klein', 'figur', 'wand', 'heu', 'trog', 'stall']
  const B = Object.fromEntries(await Promise.all(namen.map(async (n) => [n, await bild(n)])))
  buehne.querySelectorAll('.ding, .platzhalter, .zone, .platz').forEach((e) => e.remove()) // erst nach dem Laden, sonst doppelt/leer
  const c = document.getElementById('insel')
  c.width = SP_GANZ * K; c.height = ZE * K
  c.style.width = SP_GANZ * p + 'px'; c.style.height = ZE * p + 'px'; c.style.left = links - OX * p + 'px'; c.style.top = oben + 'px'
  const ctx = c.getContext('2d')
  const teil = (img, nr, spalten, x, y) => ctx.drawImage(img, (nr % spalten) * K, Math.floor(nr / spalten) * K, K, K, x * K, y * K, K, K)
  for (let y = 0; y < ZE; y++) for (let x = 0; x < SP_GANZ; x++) { ctx.drawImage(B.wasser, x * K, y * K); if (grasGanz(x, y)) teil(B.gras, blob(x, y), 11, x, y) }
  ctx.translate(OX * K, 0) // ab hier Kern-Koordinaten
  GRAS_DEKO.forEach(([x, y], i) => teil(B.gras_deko, [0, 3, 5, 1, 9, 7, 4, 11, 2, 10, 6, 8, 0, 3][i], 6, x, y))
  FELDER.slice(0, VOLL ? 12 : START_FELDER).forEach((o) => ctx.drawImage(B.feld, o.x * K + 1, o.y * K + 1))
  BAEUME_FEST.forEach((t) => ctx.drawImage(B[t.g], t.x * K, t.y * K))
  // Vorschlag: Scheune und Hühnerstall stehen von Anfang an (leer), damit die Farm wie eine Farm aussieht
  for (let y = SCHEUNE.y; y < SCHEUNE.y + SCHEUNE.h; y++) for (let x = SCHEUNE.x; x < SCHEUNE.x + SCHEUNE.b; x++) {
    const sp = x === SCHEUNE.x ? 0 : x === SCHEUNE.x + SCHEUNE.b - 1 ? 2 : 1, ze = y === SCHEUNE.y ? 0 : y === SCHEUNE.y + SCHEUNE.h - 1 ? 2 : 1
    const tuer = y === SCHEUNE.y + SCHEUNE.h - 1 && (x === 20 || x === 21)
    teil(B.wand, tuer ? 4 : ze * 3 + sp, 3, x, y)
  }
  ctx.drawImage(B.heu, 19 * K, 2 * K); ctx.drawImage(B.trog, 21 * K, 2 * K)
  ctx.drawImage(B.stall, STALL.x * K, STALL.y * K)
  ctx.setTransform(1, 0, 0, 1, 0, 0)

  const auf = (x, y) => ({ left: links + x * p, top: oben + y * p })
  const setze = (el, x, y, b, h) => { const a = auf(x, y); Object.assign(el.style, { left: a.left + 'px', top: a.top + 'px', width: b * p + 'px', height: h * p + 'px' }); buehne.appendChild(el); return el }
  // Figur (Standbild 0 aus figur.png, 16 × 32)
  const f = document.createElement('div'); f.className = 'ding'
  f.innerHTML = `<div class="sprite" style="width:${p}px;height:${2 * p}px;background:url(${G}figur.png) 0 0/${8 * p}px ${6 * p}px"></div>`
  setze(f, FIGUR.x, FIGUR.y, 1, 2)
  // Wachsende Deko: leer = Stufe 1, voll = letzte Stufe; neue Grafiken (Teilaufgabe 4), hier beschriftete Platzhalter
  const platzhalter = (t, x, y, b, h, bewegt) => { const d = document.createElement('div'); d.className = 'platzhalter' + (bewegt ? ' bewegt' : ''); d.textContent = t; return setze(d, x, y, b, h) }
  WACHSEND.forEach((w) => platzhalter(w.n + (VOLL ? ' Stufe 5' : ' wächst'), w.x, w.y, w.b, w.h))
  if (VOLL) volleFarm(p, setze, platzhalter)

  if (plaetze) {
    const zone = (t, x, y, b, h) => { const z = document.createElement('div'); z.className = 'zone'; z.innerHTML = `<b>${t}</b>`; setze(z, x, y, b, h) }
    zone('Obstgarten (3 Bäume, Shop)', 3, 1, 9, 3)
    zone('Acker: 12 Felder, 4 zu Beginn', 3, 4, 4, 3)
    zone('Scheune: 2 Kühe', SCHEUNE.x, SCHEUNE.y, SCHEUNE.b, SCHEUNE.h)
    zone('Hühnerstall + 4 Hühner', 17, 9, 7, 4)
    zone('Monster-Hütte', HUETTE.x, HUETTE.y, 4, 4)
    zone('Monster', MONSTER.x, MONSTER.y, 2, 1)
    zone('Boot', BOOT.x, BOOT.y, 3, 2)
    zone('Brunnen', BRUNNEN.x, BRUNNEN.y, 2, 2)
    // Tippflächen der kleinen Dinge (48 × 48 px bei 2-fach, sonst eine Kachel)

    const kreis = (t, o, ziel = Math.max(48, p)) => { const a = auf(o.x, o.y), k = document.createElement('div'); k.className = 'platz'
      Object.assign(k.style, { left: a.left + p / 2 - ziel / 2 + 'px', top: a.top + p / 2 - ziel / 2 + 'px', width: ziel + 'px', height: ziel + 'px' })
      k.innerHTML = `<span>${t}</span>`; buehne.appendChild(k) }
    FELDER.forEach((o, i) => kreis('F' + (i + 1), o, p))
    HUEHNER.forEach((o, i) => kreis('H' + (i + 1), o))
    DEKO.forEach((o, i) => kreis('D' + (i + 1), o))
    DEKO_WASSER.forEach((o, i) => kreis('S' + (i + 1), o))
    DEKO_GROSS.forEach((o, i) => { const g = document.createElement('div'); g.className = 'platz platz--gross'; g.innerHTML = `<span>G${i + 1}</span>`; setze(g, o.x, o.y, 2, 2) })
  }
  const info = document.getElementById('info')
  const bewegt = buehne.querySelectorAll('.bewegt').length
  info.textContent = `Mockup · ${W} × ${H} · Faktor ${mal} · Insel ${SP * p} × ${ZE * p} px · ${bewegt} bewegt · ${fehler.length ? fehler.length + ' Fehler (Konsole)' : 'Prüfung ok'}`
  if (fehler.length) console.error(fehler.join('\n'))
}
zeichnen()
addEventListener('resize', () => zeichnen())
addEventListener('keydown', (e) => { if (e.key === 'p') { const u = new URL(location.href); plaetze ? u.searchParams.delete('plaetze') : u.searchParams.set('plaetze', '1'); location.href = u } })

// ---------- Voll ausgebaute Farm (Teilaufgabe 3): alles gekauft, alle Plätze belegt ----------
// Einzelbild aus einem Bilderbogen, pixelgenau vergrößert; die Klasse (laufen, schaukeln, huepfen) steht für eine Bewegung im Spiel
function sprite(name, bw, bh, sw, sh, nr, mal, klasse = '') {
  const sp = sw / bw, x = (nr % sp) * bw, y = Math.floor(nr / sp) * bh
  return `<div class="sprite ${klasse}" style="width:${bw * mal}px;height:${bh * mal}px;background:url(${G}${name}.png) -${x * mal}px -${y * mal}px/${sw * mal}px ${sh * mal}px"></div>`
}
function volleFarm(p, setze, platzhalter) {
  const m = p / K
  // bewegt = zählt zum Bewegungs-Budget (layout-voll.md, Abschnitt 3)
  const ding = (html, x, y, b, h, bewegt) => { const d = document.createElement('div'); d.className = 'ding' + (bewegt ? ' bewegt' : ''); d.innerHTML = html; return setze(d, x, y, b, h) }
  // Pflanzen auf allen 12 Feldern: verschiedene Sorten und Stufen, drei reif (die Ernte liegt dann auf dem Feld)
  FELDER.forEach((o, i) => ding(sprite('pflanzen', 16, 16, 64, 208, (i % 13) * 4 + [1, 2, 3, 2, 1, 3, 2, 2, 1, 2, 3, 1][i], m), o.x, o.y, 1, 1))
  // Obstbäume mit Früchten, Brunnen, Boot (schaukelt)
  const baeume = ['baum_orange', 'baum_pfirsich', 'baum_birne']
  baeume.forEach((g, i) => ding(sprite(g, 48, 48, 576, 192, 0, m), OBSTBAEUME[i].x, OBSTBAEUME[i].y, 3, 3))
  ding(sprite('brunnen', 32, 32, 32, 32, 0, m), BRUNNEN.x, BRUNNEN.y, 2, 2)
  ding(sprite('deko_boot', 48, 32, 96, 32, 0, m, 'schaukeln'), BOOT.x, BOOT.y, 3, 2, true)
  // 2 Kühe in der Scheune, 4 Hühner am Stall (laufen bzw. picken)
  KUEHE.forEach((o, i) => ding(sprite('kuh', 32, 32, 256, 64, i * 8, m, 'laufen'), o.x, o.y, 2, 2, true))
  HUEHNER.forEach((o, i) => ding(sprite('huhn', 16, 16, 128, 48, i % 2 ? 8 : 0, m, 'laufen'), o.x, o.y, 1, 1, true))
  // Hungrig (Jazz, E4): leerer Napf neben zwei Hühnern, leerer Trog in der Scheune (Napf ist eine neue Grafik)
  platzhalter('Napf leer', 17, 9, 1, 1) // Napf steht über dem Huhn, so bleibt rechts vom Stall Luft
  platzhalter('Napf leer', 23, 9, 1, 1)
  platzhalter('Trog leer', 21, 2, 2, 1)
  // Monster (Maus) vor seiner Hütte (Dach Nr. 3), läuft hin und her; sein Geschenk liegt daneben und hüpft
  ding(sprite('huette', 64, 64, 192, 192, 3, m), HUETTE.x, HUETTE.y, 4, 4)
  ding(sprite('monster_maus', 16, 16, 208, 16, 0, m, 'laufen'), MONSTER.x, MONSTER.y, 1, 1, true)
  // Liegendes hüpft: Ei, Milch, Monster-Geschenk (Samentüte)
  ding(sprite('ei', 16, 16, 16, 16, 0, m, 'huepfen'), 18, 11, 1, 1, true)
  ding(sprite('milch', 16, 16, 16, 16, 0, m, 'huepfen'), 19, 5, 1, 1, true)
  ding(sprite('saatgut', 16, 16, 32, 208, 4, m, 'huepfen'), 9, 12, 1, 1, true)
  // Deko: 14 kleine Plätze mit vorhandenen Bildern, 6 mit neuen aus den Paketen (Platzhalter, Liste in layout-leer.md Abschnitt 8)
  const vorhanden = ['deko_busch', 'deko_blume_gelb', 'deko_pilz', 'deko_stein', 'deko_blume_lila', 'deko_pilzhaus', 'deko_katze_rosa', 'deko_katze_blau']
  const neu = ['Sonnen-blume', 'Schild', 'Baum-stumpf', 'Laterne', 'Brief-kasten', 'Fels']
  DEKO.forEach((o, i) => (i < 14 ? ding(sprite(vorhanden[i % 8], 16, 16, 16, 16, 0, m), o.x, o.y, 1, 1) : platzhalter('neu: ' + neu[i - 14], o.x, o.y, 1, 1)))
  platzhalter('neu: Picknick', DEKO_GROSS[0].x, DEKO_GROSS[0].y, 2, 2)
  platzhalter('neu: Bienen-stock (bewegt)', DEKO_GROSS[1].x, DEKO_GROSS[1].y, 2, 2, true)
  const wasser = ['See-rosen', 'Schilf', 'Frosch (bewegt)', 'Steine']
  wasser.forEach((t, i) => platzhalter('neu: ' + t, DEKO_WASSER[i].x, DEKO_WASSER[i].y, 1, 1, i === 2))
}
