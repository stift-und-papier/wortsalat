// Wachsende Deko (Teilaufgabe 4, Vorschlag): 8 Dinge, die von Anfang an auf der Farm stehen und mit dem Lernfortschritt wachsen.
// Gemeinsam genutzt von farm-mockup.js (leer = Stufe 1, voll = letzte Stufe) und wachsende-deko.html (alle Stufen).
// Bild-Ausschnitte: [Bilderbogen {u, w, h}, x, y, Breite, Höhe] in Original-Pixeln; ohne Ausschnitt = neue Grafik (Platzhalter).
// shortcut: liest direkt aus dem Paketordner assets/ (nicht im Repo, nur auf dem Rechner der Lehrkraft); im Spiel kämen Einzelbilder nach src/grafik/
const PAKET = '../../assets/entpackt/'
const KIRSCHE = { u: PAKET + 'Sprout Sorry pack/Early Access/Plant update 2/Cherry Blossom Biom.png', w: 160, h: 80 }
const SEEROSE = { u: PAKET + 'Sprout Sorry pack/Early Access/Plant update 2/Cherry Blossom Biom water plants.png', w: 96, h: 32 }
const BAEUME2 = { u: PAKET + 'Sprout Sorry pack/Early Access/Plant update 2/Trees, stumps and bushes v2.png', w: 192, h: 128 }
const BLUMEN = { u: PAKET + 'Sprout Lands - Sprites - premium pack/Objects/Mushrooms, Flowers, Stones.png', w: 192, h: 80 }

const WACHS = [
  { n: 'W1', name: 'Kirschbaum', x: 13, y: 4, b: 2, h: 2, stufen: [
    ['Keimling', [KIRSCHE, 34, 37, 10, 10]], ['Zweig mit Blättern', [KIRSCHE, 48, 2, 16, 13]], ['Busch', [KIRSCHE, 80, 64, 16, 16]],
    ['Bäumchen', [KIRSCHE, 65, 18, 14, 29]], ['Kirschbaum in Blüte', [KIRSCHE, 84, 16, 24, 31]]] },
  { n: 'W2', name: 'Wildblumen', x: 11, y: 5, b: 1, h: 1, stufen: [
    ['Grashalme', [BLUMEN, 33, 37, 14, 10]], ['Grasbüschel', [BLUMEN, 48, 34, 16, 13]], ['erste Blüte', [BLUMEN, 98, 68, 11, 10]],
    ['Lavendel', [BLUMEN, 34, 64, 13, 16]]] },
  { n: 'W3', name: 'Sonnenblume', x: 17, y: 7, b: 1, h: 2, stufen: [
    ['Grashalm', [BLUMEN, 33, 37, 14, 10]], ['kleine Blüte', [BLUMEN, 18, 54, 11, 9]], ['Knospe', [BLUMEN, 35, 51, 11, 12]],
    ['Sonnenblume', [BLUMEN, 49, 49, 14, 29]]] },
  { n: 'W4', name: 'Seerosen', x: 10, y: 12, b: 2, h: 1, wasser: true, stufen: [
    ['kleines Blatt', [SEEROSE, 0, 5, 13, 9]], ['großes Blatt', [SEEROSE, 32, 4, 14, 11]], ['Blatt mit Knospe', [SEEROSE, 1, 19, 13, 9]],
    ['Seerose blüht', [SEEROSE, 49, 17, 14, 12]]] },
  { n: 'W5', name: 'Beerenbusch', x: 11, y: 7, b: 1, h: 1, stufen: [
    ['kleiner Busch', [BAEUME2, 145, 19, 13, 12]], ['Busch', [BAEUME2, 144, 32, 16, 16]], ['Busch mit Beeren', [BAEUME2, 128, 64, 16, 16]]] },
  // V3 (Jazz): W6 bis W8 liegen nicht mehr an den engen Stellen (rechts vom Stall, oben Mitte)
  { n: 'W6', name: 'Vogelhaus', x: 25, y: 6, b: 1, h: 2, stufen: [
    ['Pfahl'], ['Pfahl mit Brett'], ['Vogelhaus'], ['Vogelhaus mit Futter'], ['Vogel sitzt auf dem Dach']] },
  { n: 'W7', name: 'Eiche', x: 0, y: 5, b: 1, h: 2, stufen: [
    ['Eichel', [BAEUME2, 3, 4, 9, 9]], ['Eichel keimt', [BAEUME2, 2, 20, 10, 11]], ['Sprössling', [BAEUME2, 2, 37, 10, 10]],
    ['kleiner Baum', [BAEUME2, 18, 16, 12, 15]], ['junge Eiche', [BAEUME2, 49, 17, 14, 29]]] },
  { n: 'W8', name: 'Windrad', x: 8, y: 8, b: 1, h: 2, stufen: [
    ['Pfahl'], ['Gestell'], ['Windrad mit zwei Flügeln'], ['Windrad mit vier Flügeln und Fähnchen']] },
]

// Bild einer Stufe, unten mittig im Platz (b × h Kacheln), Faktor mal; neue Grafik = beschrifteter Platzhalter
function wachsBild(w, s, mal) {
  const [t, q] = w.stufen[s]
  if (!q) return `<div class="platzhalter" style="position:absolute;inset:0">neu: ${w.name}<br>${t}</div>`
  const [datei, x, y, bw, bh] = q
  const links = Math.round((w.b * 16 - bw) / 2) * mal, oben = Math.max(0, w.h * 16 - bh) * mal
  return `<div class="sprite" style="position:absolute;left:${links}px;top:${oben}px;width:${bw * mal}px;height:${bh * mal}px;` +
    `background:url('${datei.u}') -${x * mal}px -${y * mal}px/${datei.w * mal}px ${datei.h * mal}px"></div>`
}
