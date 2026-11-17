// Farbtausch für die Farm-Mockups (Teilaufgabe 4, Vorschlag): tauscht Farben eines Bildausschnitts nach Regeln, nur im Browser.
// Alle neuen Farben stammen aus der Sprout-Lands-Palette (assets/Sprout Lands defautlt palette.png): je Reihe 8 Töne, dunkel → hell.
// shortcut: färbt beim Anzeigen per <canvas>; im Spiel kämen fertig gefärbte Einzelbilder nach src/grafik/
const RAMPEN = {
  rosa: ['#713970', '#8a4a70', '#a35b70', '#af6776', '#bd757e', '#d99a9a', '#e8b5ac', '#f3d8c5'],
  orange: ['#6b4b5b', '#865161', '#a16159', '#ba7c54', '#d79e61', '#eeba77', '#f2cf8c', '#f7ebaa'],
  gelb: ['#795e53', '#957a4b', '#b09643', '#bfa954', '#d4c169', '#eae178', '#eeee9b', '#f3f2c0'],
  gruen: ['#566560', '#67835c', '#78a158', '#8db15d', '#a4c263', '#c0d470', '#d2e077', '#e8eeaa'],
  tuerkisgruen: ['#505e77', '#5f7a79', '#6e967c', '#82a884', '#97bb8e', '#aed499', '#c2e09a', '#dff0bb'],
  tuerkis: ['#4a588e', '#577297', '#658ca1', '#7ba6b4', '#8cbfc2', '#9bd4c3', '#b1e0be', '#d6f1cd'],
  blau: ['#4c468b', '#555793', '#5f699c', '#7180b1', '#8599c7', '#92b2d4', '#99c5de', '#cbe0de'],
  indigo: ['#504086', '#5c4e92', '#685d9e', '#766daa', '#867fb8', '#a09dd4', '#bcafde', '#ddd5de'],
  lila: ['#583f83', '#694a87', '#7b568c', '#90689f', '#a77bb3', '#c89dd1', '#d8b1e0', '#ebd6e0'],
  braun: ['#754c60', '#90625d', '#aa7959', '#b68962', '#c49a6c', '#dcb98a', '#e8cfa6', '#f3e5c2'],
  sand: ['#645552', '#7b6762', '#8c7369', '#9d866f', '#b2a486', '#c4bc93', '#ded9ab', '#f0efb9'],
  grau: ['#353738', '#474a4b', '#545959', '#6b7470', '#818b83', '#9da89a', '#c1c8b9', '#dce0d2'],
}

// Farbtabelle: Reihe von → Reihe nach, gleiche Helligkeit (+ versatz), nur Töne ab..bis der Ausgangsreihe
function rampe(von, nach, versatz = 0, ab = 0, bis = 7) {
  const m = {}
  for (let i = ab; i <= bis; i++) m[RAMPEN[von][i]] = RAMPEN[nach][Math.max(0, Math.min(7, i + versatz))]
  return m
}

// Lavendel und Knospe aus assets/objects.png (kräftige Farben) auf die Palette gebracht, Blätter wie das Gras der Farm
const OBJEKTE = { u: '../../assets/objects.png', w: 144, h: 61 }
const OBJEKTE_PALETTE = {
  '#37017e': '#504086', '#4c00c7': '#5c4e92', '#6930f8': '#766daa', '#7c70ff': '#867fb8', '#d7a8ff': '#bcafde',
  '#470576': '#504086', '#7100bd': '#5c4e92', '#900acb': '#685d9e', '#bf25f0': '#867fb8', '#f676ff': '#bcafde',
  '#152a29': '#474a4b', '#174a31': '#566560', '#1b5d5f': '#5f7a79', '#2d9543': '#78a158', '#447722': '#67835c', '#93b734': '#a4c263',
  '#b76f51': '#aa7959', '#954163': '#90625d',
}

// Pilzhütte ohne Totenkopf: Kopf-Pixel werden Hutfarbe, dazu drei helle Tupfen
const OHNE_TOTENKOPF = [
  { in: [3, 2, 10, 5], tausch: { '#ebd6e0': '#a77bb3', '#7b568c': '#a77bb3' } },
  { in: [3, 6, 12, 7], tausch: { '#ebd6e0': '#90689f' } },
  { punkte: [[5, 3, '#ebd6e0'], [9, 4, '#ebd6e0'], [6, 6, '#ebd6e0']] },
]

// Kaufbare Deko, die es mehrfach gibt: jedes gekaufte Stück bekommt die nächste Farbe. Gelb bleibt der wachsenden Sonnenblume.
const DEKO_FARBEN = {
  deko_blume_gelb: [['rosa', [rampe('gelb', 'rosa', 1, 1)]], ['blau', [rampe('gelb', 'blau', 0, 1)]], ['lila', [rampe('gelb', 'lila', 0, 1)]],
    ['weiß', [rampe('gelb', 'grau', 2, 1)]], ['orange', [rampe('gelb', 'orange', 0, 1)]]],
  deko_blume_lila: [['lila', []], ['blau', [rampe('lila', 'blau')]], ['rosa', [rampe('lila', 'rosa', 1)]], ['weiß', [rampe('lila', 'grau', 2)]]],
  deko_pilz: [['rot', []], ['braun', [rampe('rosa', 'braun', 0, 0, 4)]], ['orange', [rampe('rosa', 'orange', 0, 0, 4)]], ['blau', [rampe('rosa', 'blau', 0, 0, 4)]]],
  deko_pilzhaus: [['lila', OHNE_TOTENKOPF], ['rot', [...OHNE_TOTENKOPF, rampe('lila', 'rosa')]],
    ['blau', [...OHNE_TOTENKOPF, rampe('lila', 'blau')]], ['braun', [...OHNE_TOTENKOPF, rampe('lila', 'braun')]]],
  deko_busch: [['grün', []], ['gelbgrün', [rampe('tuerkisgruen', 'gruen')]], ['blaugrün', [rampe('tuerkisgruen', 'tuerkis')]], ['Herbst', [rampe('tuerkisgruen', 'orange')]]],
  deko_stein: [['grau', []], ['Sandstein', [rampe('grau', 'sand')]], ['rötlich', [rampe('grau', 'braun')]], ['bläulich', [rampe('grau', 'blau')]]],
}

// Ausschnitt q = [Bilderbogen {u}, x, y, Breite, Höhe] mit Regeln als <canvas> (gefärbt wird kurz danach in faerbeAlle)
const FAERBEN = []
let faerbenGeplant = 0
function farbBild(q, regeln, mal, stil = '', klasse = '') {
  FAERBEN.push([q, regeln])
  clearTimeout(faerbenGeplant)
  faerbenGeplant = setTimeout(faerbeAlle, 0)
  return `<canvas class="sprite ${klasse}" data-f="${FAERBEN.length - 1}" width="${q[3]}" height="${q[4]}" style="${stil}width:${q[3] * mal}px;height:${q[4] * mal}px"></canvas>`
}

const bilder = {}
function ladeBild(u) {
  return (bilder[u] ??= new Promise((ok, fehler) => { const b = new Image(); b.onload = () => ok(b); b.onerror = () => fehler(new Error('Bild fehlt: ' + u)); b.src = u }))
}

const hex = (d, i) => '#' + [0, 1, 2].map((c) => d[i + c].toString(16).padStart(2, '0')).join('')
function wende(d, w, regeln) {
  for (const r of regeln) {
    if (r.punkte) { for (const [x, y, f] of r.punkte) setze(d, (y * w + x) * 4, f); continue }
    const [x0, y0, x1, y1] = r.in ?? [0, 0, w - 1, d.length / 4 / w - 1], t = r.tausch ?? r
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const i = (y * w + x) * 4
      if (d[i + 3] && t[hex(d, i)]) setze(d, i, t[hex(d, i)])
    }
  }
}
function setze(d, i, f) { for (let c = 0; c < 3; c++) d[i + c] = parseInt(f.slice(1 + 2 * c, 3 + 2 * c), 16); d[i + 3] = 255 }

async function faerbeAlle() {
  for (const c of document.querySelectorAll('canvas[data-f]:not([data-fertig])')) {
    c.dataset.fertig = '1'
    const [[datei, x, y, w, h], regeln] = FAERBEN[+c.dataset.f]
    const g = c.getContext('2d')
    g.drawImage(await ladeBild(datei.u), x, y, w, h, 0, 0, w, h)
    const bild = g.getImageData(0, 0, w, h)
    wende(bild.data, w, regeln)
    g.putImageData(bild, 0, 0)
  }
}

// Selbstprüfung: jede Regel-Farbe ist ein gültiges #rrggbb, jede Zielfarbe stammt aus der Palette
{
  const palette = new Set(Object.values(RAMPEN).flat())
  const ziele = [OBJEKTE_PALETTE, ...OHNE_TOTENKOPF.map((r) => r.tausch ?? {}), ...Object.values(DEKO_FARBEN).flatMap((v) => v.flatMap(([, rs]) => rs))]
    .flatMap((t) => Object.values(t.tausch ?? t)).filter((f) => typeof f === 'string')
  const falsch = ziele.filter((f) => !palette.has(f))
  if (falsch.length) console.error('Fehler: Farben nicht aus der Palette:', falsch.join(' '))
}
