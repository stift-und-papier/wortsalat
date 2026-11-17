// Vogelhaus (5 Stufen), Lavendel (2 Stufen) und Napf (leer, voll) von Hand in Sprout-Lands-Art gezeichnet (Teilaufgabe 4, Jazz 2026-11-17):
// Vorlage waren die Gemini-Bilder von Jazz; Umriss = dunkler Ton der eigenen Farbe, nur Palettenfarben, Blätter wie die Traubenblume.
// Aufruf aus dem Projektordner: node docs/farm/handgezeichnet.cjs  → assets/neu/vogelhaus_1..5.png, lavendel_1..2.png, napf_1..2.png
const fs = require('fs'); const { PNG } = require(process.cwd() + '/node_modules/pngjs')
const F = {
  A: '#90625d', B: '#754c60', C: '#b68962', D: '#aa7959', // Holz
  r: '#8a4a70', s: '#a35b70', q: '#bd757e', p: '#d99a9a', // Dach
  b: '#555793', m: '#7180b1', k: '#92b2d4', y: '#eeba77', // Vogel
  e: '#eae178', E: '#d4c169', // Körner
  O: '#5c4e92', M: '#766daa', L: '#867fb8', H: '#a09dd4', W: '#bcafde', // Lavendel
  f: '#67835c', g: '#c0d470', h: '#78a158', i: '#8db15d', j: '#566560', // Blätter wie deko_blume_lila
}
const leer = '..............'
const vogel = ['....bbb.......', '...bkkkb......', '..ybkbkkb.....', '...bkkmmb.....', '....bmmb......']
const dach = ['......rr......', '.....rppr.....', '....rpqqsr....', '...rpqqqssr...', '..rpqqqqsssr..', '.rpqqqqqssssr.', '.rrrrrrrrrrrr.']
const haus = ['..ACCCCCCDDB..', '..ACCCCCCDDB..', '..ACCCCCCDDB..', '..ACCBBBCDDB..', '..ACCBBBCDDB..', '..ACCCCCDDDB..', '..ACCCCCDDDB..']
const brett = ['.AAAAAAAAAAAB.', '.ACCCCCCDDDDB.', '.BBBBBBBBBBBB.']
const koerner = ['.AeEeAAEeAAAB.', '.ACCCCCCDDDDB.', '.BBBBBBBBBBBB.']
const pfahl = Array(7).fill('.....ACDB.....')
const gras = ['..f..fACDBf..f', '..fgifffffigf.', '...jjjjjjjjj..']
const vogelhaus = [
  [...Array(18).fill(leer), '.....AAAB.....', ...Array(3).fill('.....ACDB.....'), ...pfahl, ...gras], // 1 Pfahl
  [...Array(19).fill(leer), ...brett, ...pfahl, ...gras], // 2 Pfahl mit Brett
  [...Array(5).fill(leer), ...dach, ...haus, ...brett, ...pfahl, ...gras], // 3 Vogelhaus
  [...Array(5).fill(leer), ...dach, ...haus, ...koerner, ...pfahl, ...gras], // 4 mit Futter
  [...vogel, ...dach, ...haus, ...koerner, ...pfahl, ...gras], // 5 Vogel auf dem Dach
]
const blaetter = ['.......f........', '...fff.f..fggf..', '...fggffhfiigj..', '...jgiiijiiij...', '....jjjj.jjj....', '................']
const lavendel = [
  [...Array(5).fill('................'), '.......O........', '......OMO.......', '......OHMO......', '......OMMO......', '.......Of.......', ...blaetter], // Knospe
  ['.......O........', '......OWO.......', '......OHMO......', '.....OWLMO......', '......OHLMO.....', '.....OWLMO......', '......OHLMO.....',
    '.....OWLMMO.....', '......OLMO......', '.......Of.......', ...blaetter], // Lavendel
]
const napfRand = ['...AAAAAAAAB..']
const napfUnten = ['.ACCCCCCCCDDDB', '..ACCCCCCDDDB.', '...BBBBBBBBB..']
const napf = [
  [...napfRand, '..ACCCCCCCDDB.', '.ACDBBBBBBBDDB', '.ACBBBBBBBBBDB', '.ACCBBBBBBBDDB', ...napfUnten], // leer
  [...napfRand, '..ACCCeECCDDB.', '.ACDeeEeeEeDDB', '.ACEeEeeEeEEDB', '.ACCEEEEEEEDDB', ...napfUnten], // voll mit Körnern
]
function male(zeilen, datei) {
  const w = zeilen[0].length, h = zeilen.length, o = new PNG({ width: w, height: h })
  zeilen.forEach((z, y) => { if (z.length !== w) throw new Error(`${datei}: Zeile ${y} hat ${z.length} statt ${w} Zeichen`)
    ;[...z].forEach((c, x) => { if (c === '.') return; const f = F[c]; if (!f) throw new Error(`${datei}: unbekannte Farbe ${c}`)
      const i = (y * w + x) * 4; for (let n = 0; n < 3; n++) o.data[i + n] = parseInt(f.slice(1 + 2 * n, 3 + 2 * n), 16); o.data[i + 3] = 255 }) })
  fs.writeFileSync(datei, PNG.sync.write(o)); console.log(datei, w + '×' + h)
}
vogelhaus.forEach((z, i) => male(z, `assets/neu/vogelhaus_${i + 1}.png`))
lavendel.forEach((z, i) => male(z, `assets/neu/lavendel_${i + 1}.png`))
napf.forEach((z, i) => male(z, `assets/neu/napf_${i + 1}.png`))
