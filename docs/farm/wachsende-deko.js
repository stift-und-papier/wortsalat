// Wachsende Deko (Teilaufgabe 4, Vorschlag): 8 Dinge, die von Anfang an auf der Farm stehen und mit dem Lernfortschritt wachsen.
// Braucht farben.js davor. Gemeinsam genutzt von farm-mockup.js (leer = Stufe 1, voll = letzte Stufe) und wachsende-deko.html (alle Stufen).
// Bild-Ausschnitte: [Bilderbogen {u, w, h}, x, y, Breite, Höhe] in Original-Pixeln; ohne Ausschnitt = neue Grafik (Platzhalter).
// shortcut: liest direkt aus dem Paketordner assets/ (nicht im Repo, nur auf dem Rechner der Lehrkraft); im Spiel kämen Einzelbilder nach src/grafik/
const PAKET = '../../assets/entpackt/'
const KIRSCHE = { u: PAKET + 'Sprout Sorry pack/Early Access/Plant update 2/Cherry Blossom Biom.png', w: 160, h: 80 }
const SEEROSE = { u: PAKET + 'Sprout Sorry pack/Early Access/Plant update 2/Cherry Blossom Biom water plants.png', w: 96, h: 32 }
const BAEUME2 = { u: PAKET + 'Sprout Sorry pack/Early Access/Plant update 2/Trees, stumps and bushes v2.png', w: 192, h: 128 }
// Jazz: Eiche hellgrün, Beerenbusch dunkelgrün, damit sie sich von den Obstbäumen (Türkisgrün) abheben (Regeln aus farben.js)
const EICHE_GRUEN = rampe('tuerkisgruen', 'gruen')
const BUSCH_GRUEN = rampe('tuerkisgruen', 'gruen', -2)
const GRAS_WIE_LAVENDEL = rampe('tuerkisgruen', 'gruen')
// Neue Bilder: Vogelhaus, Lavendel, Napf von Claude nach den Gemini-Vorlagen von Jazz gezeichnet (handgezeichnet.cjs); liegen in assets/neu/ (nicht im Repo)
const NEU = (n, w, h) => [{ u: '../../assets/neu/' + n + '.png', w, h }, 0, 0, w, h]
const BLUMEN = { u: PAKET + 'Sprout Lands - Sprites - premium pack/Objects/Mushrooms, Flowers, Stones.png', w: 192, h: 80 }

const SONNENBLUME = [
  ['Grashalm', [BLUMEN, 33, 37, 14, 10]], ['kleine Blüte', [BLUMEN, 18, 54, 11, 9]], ['Knospe', [BLUMEN, 35, 51, 11, 12]],
  ['Sonnenblume', [BLUMEN, 49, 49, 14, 29]]]

const WACHS = [
  { n: 'W1', name: 'Kirschbaum', x: 13, y: 4, b: 2, h: 2, stufen: [
    ['Keimling', [KIRSCHE, 34, 37, 10, 10]], ['Zweig mit Blättern', [KIRSCHE, 48, 2, 16, 13], [rampe('gruen', 'rosa')]], ['Busch', [KIRSCHE, 80, 64, 16, 16]],
    ['Bäumchen', [KIRSCHE, 65, 18, 14, 29]], ['Kirschbaum in Blüte', [KIRSCHE, 84, 16, 24, 31]]] },
  // Jazz: Knospe und Lavendel neu gezeichnet in Blumen- und Pilzgröße; Gras davor im Grün seiner Blätter
  { n: 'W2', name: 'Wildblumen', x: 11, y: 5, b: 1, h: 1, stufen: [
    ['Grashalme', [BLUMEN, 33, 37, 14, 10], [GRAS_WIE_LAVENDEL]], ['Grasbüschel', [BLUMEN, 48, 34, 16, 13], [GRAS_WIE_LAVENDEL]],
    ['Knospe', NEU('lavendel_1', 16, 16)], ['Lavendel', NEU('lavendel_2', 16, 16)]] },
  { n: 'W3', name: 'Sonnenblume', x: 17, y: 7, b: 1, h: 2, stufen: SONNENBLUME },
  { n: 'W4', name: 'Seerosen', x: 10, y: 12, b: 2, h: 1, wasser: true, stufen: [
    ['kleines Blatt', [SEEROSE, 0, 5, 13, 9]], ['großes Blatt', [SEEROSE, 32, 4, 14, 11]], ['Blatt mit Knospe', [SEEROSE, 1, 19, 13, 9]],
    ['Seerose blüht', [SEEROSE, 49, 17, 14, 12]]] },
  { n: 'W5', name: 'Beerenbusch', x: 11, y: 7, b: 1, h: 1, stufen: [
    ['kleiner Busch', [BAEUME2, 145, 19, 13, 12], [BUSCH_GRUEN]], ['Busch', [BAEUME2, 144, 32, 16, 16], [BUSCH_GRUEN]], ['Busch mit Beeren', [BAEUME2, 128, 64, 16, 16], [BUSCH_GRUEN]]] },
  // V3 (Jazz): W6 bis W8 liegen nicht mehr an den engen Stellen (rechts vom Stall, oben Mitte)
  { n: 'W6', name: 'Vogelhaus', x: 25, y: 6, b: 1, h: 2, stufen: [
    ['Pfahl', NEU('vogelhaus_1', 14, 32)], ['Pfahl mit Brett', NEU('vogelhaus_2', 14, 32)], ['Vogelhaus', NEU('vogelhaus_3', 14, 32)],
    ['Vogelhaus mit Futter', NEU('vogelhaus_4', 14, 32)], ['Vogel sitzt auf dem Dach', NEU('vogelhaus_5', 14, 32)]] },
  { n: 'W7', name: 'Eiche', x: 0, y: 5, b: 1, h: 2, stufen: [
    ['Eichel', [BAEUME2, 3, 4, 9, 9], [EICHE_GRUEN]], ['Eichel keimt', [BAEUME2, 2, 20, 10, 11], [EICHE_GRUEN]], ['Sprössling', [BAEUME2, 2, 37, 10, 10], [EICHE_GRUEN]],
    ['kleiner Baum', [BAEUME2, 18, 16, 12, 15], [EICHE_GRUEN]], ['junge Eiche', [BAEUME2, 49, 17, 14, 29], [EICHE_GRUEN]]] },
  // Jazz: statt Windrad eine zweite Sonnenblume
  { n: 'W8', name: 'Sonnenblume', x: 8, y: 8, b: 1, h: 2, stufen: SONNENBLUME },
]

// Bild einer Stufe, unten mittig im Platz (b × h Kacheln), Faktor mal; neue Grafik = beschrifteter Platzhalter
function wachsBild(w, s, mal) {
  const [t, q, regeln] = w.stufen[s]
  if (!q) return `<div class="platzhalter" style="position:absolute;inset:0">neu: ${w.name}<br>${t}</div>`
  const [datei, x, y, qw, qh, bw = qw, bh = qh] = q
  const links = Math.round((w.b * 16 - bw) / 2) * mal, oben = Math.max(0, w.h * 16 - bh) * mal
  if (regeln) return farbBild(q, regeln, mal, `position:absolute;left:${links}px;top:${oben}px;`)
  return `<div class="sprite" style="position:absolute;left:${links}px;top:${oben}px;width:${bw * mal}px;height:${bh * mal}px;` +
    `background:url('${datei.u}') -${x * mal}px -${y * mal}px/${datei.w * mal}px ${datei.h * mal}px"></div>`
}
