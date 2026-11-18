// Simulation Münzsystem (Teilaufgabe 5, Jazz 2026-11-18). Ändert nichts am Spiel oder an Daten: liest nur die Preisliste unten
// (Stand Live-Datenbank 2026-11-18) und rechnet. Aufruf: node docs/farm/simulation/simulation.mjs  → schreibt ergebnis.md daneben.
// Gerechnet wird mit Durchschnittswerten (kein Zufall): jedes Kind bekommt je Übung den Erwartungswert seiner Münzen.
import { writeFileSync } from 'node:fs'

// ---------- Preise heute (shop_artikel, Live-Datenbank 2026-11-18) ----------
const SAMEN = { // preis, verkauf, bedarf (Wachstumsstufen), güte (Futter), ab (verdient)
  karotte: [15, 20, 4, 1, 0], salat: [15, 20, 4, 1, 0], rettich: [20, 25, 4, 1, 0],
  tomate: [25, 35, 6, 2, 200], weizen: [25, 35, 6, 2, 200], gurke: [30, 40, 6, 2, 200],
  blumenkohl: [30, 40, 6, 2, 600], rote_bete: [35, 45, 6, 2, 600],
  aubergine: [40, 55, 8, 3, 1200], kuerbis: [45, 60, 8, 3, 1200], sternfrucht: [45, 60, 8, 3, 2200],
}
const EI = [25, 50, 80], MILCH = [35, 65, 100] // Verkauf je Güte 1–3
const OBST = { orangenbaum: [300, 600, 30], pfirsichbaum: [350, 1200, 35], birnenbaum: [400, 2200, 40] } // preis, ab, Frucht
// Deko: [id, platzart, preis, ab, höchstens]
const DEKO = [
  ['busch', 'klein', 25, 0], ['klee', 'klein', 30, 0], ['pilz', 'klein', 30, 200], ['fels', 'klein', 30, 600], ['stein', 'klein', 40, 600],
  ['truhe', 'klein', 75, 600], ['baumstumpf', 'klein', 75, 600], ['schild', 'klein', 75, 600], ['briefkasten', 'klein', 75, 1200],
  ['pilzhaus', 'klein', 100, 2200], ['blume_gelb', 'beet', 25, 200], ['glockenblume', 'beet', 30, 200], ['blume_lila', 'beet', 40, 600],
  ['schilf', 'wasser', 75, 1200], ['wassersteine', 'wasser', 75, 1200], ['frosch', 'wasser', 250, 2200, 1],
  ['bienenstock', 'gross', 250, 2200, 1], ['boot', 'fest', 120, 600, 1], ['brunnen', 'fest', 150, 2200, 1],
]
const PLAETZE = { klein: 21, beet: 16, wasser: 4, gross: 1, fest: 2 } // G2 kann man heute nicht füllen (nur Bienenstock, höchstens 1)
const FELD = [40, 0], HUHN = [220, 200], KUH = [450, 1200]

// ---------- Kindertypen ----------
// pakete: neue Pakete je Woche (je 6 Übungen + 1 Erklärseite, Sterne im Schnitt ★★), richtig: Anteil richtiger Runden im ersten Durchgang,
// ganz: Anteil Übungen, die (irgendwann) ganz richtig sind (Freundschaft), farmTage: Tage pro Woche mit der Farm,
// wdh: Wiederholungen alter Übungen pro Farm-Tag nur zum Gießen, handel: füttert immer mit dem besten Futter und verkauft alles
const KINDER = [
  { name: 'regelmäßig', pakete: 1, richtig: 0.8, ganz: 0.6, farmTage: 3, wdh: 2, handel: false }, // Jazz 2026-11-18: ein neues Paket pro Woche, dazu Wiederholung
  { name: 'durchschnittlich', pakete: 0.75, richtig: 0.7, ganz: 0.4, farmTage: 2, wdh: 1, handel: false },
  { name: 'sporadisch', pakete: 0.25, richtig: 0.6, ganz: 0.3, farmTage: 1, wdh: 0, handel: false },
  { name: 'Vielspieler', pakete: 1, richtig: 0.8, ganz: 0.6, farmTage: 7, wdh: 2, handel: true },
  // Empfindlichkeit: wie „regelmäßig“, aber zwei neue Pakete pro Woche (so war es im ersten Vorschlag angenommen)
  { name: 'regelmäßig, 2 neue Pakete pro Woche', pakete: 2, richtig: 0.8, ganz: 0.6, farmTage: 3, wdh: 0, handel: false },
  { name: 'Schlupflöcher', pakete: 0.5, richtig: 0.7, ganz: 0.4, farmTage: 7, wdh: 3, handel: true },
]
const WOCHEN = 38, UEBUNGEN_JE_PAKET = 6, RUNDEN = 6

// ---------- Regeln ----------
// heute: wie im Spiel. Die Vorschläge ändern nur die genannten Stellen.
const HEUTE = { name: 'heute', preis: 1, verkaufFaktor: 1, tierPlus: null, verkaufZaehlt: true, giessenNurNeu: false, verkaufDeckel: Infinity, wochenBonus: 0, obstAlle: 7, uebungFaktor: 1 }
const MODELLE = [
  HEUTE,
  // A: Lernen zählt. Verkauf zählt nicht als „verdient“, kleine Gewinnspannen (Ernte = Samenpreis + 5, Ei = Futter + 5, Milch = Futter + 10),
  //    Obstbäume alle 14 Tage, Dauerhaftes (Felder, Tiere, Bäume, Deko) ×2 (Jazz: ein neues Paket pro Woche) passend zur Zieldauer, Samen wie heute. Üben gießt weiter (auch Wiederholen ist Üben).
  { ...HEUTE, name: 'A Lernen zählt', preis: 2, verkaufFaktor: 0, tierPlus: [5, 10], verkaufZaehlt: false, obstAlle: 14 },
  // A2: wie A, aber Gießen nur durch Übungen, die neue Münzen bringen (schließt Wiederholen nur zum Gießen)
  { ...HEUTE, name: 'A2 wie A, Gießen nur bei neuen Münzen', preis: 2, verkaufFaktor: 0, tierPlus: [5, 10], verkaufZaehlt: false, giessenNurNeu: true, obstAlle: 14 },
  // B: wie heute, aber höchstens 150 Münzen Verkauf pro Tag und Dauerhaftes ×2
  { ...HEUTE, name: 'B Tagesdeckel', preis: 2, verkaufDeckel: 150 },
  // C: wie A, dazu 20 Münzen Wochenbonus für regelmäßiges Üben (mindestens ein Paket in der Woche, nicht für Dauerspielen)
  { ...HEUTE, name: 'C wie A + Wochenbonus', preis: 2, verkaufFaktor: 0, tierPlus: [5, 10], verkaufZaehlt: false, obstAlle: 14, wochenBonus: 20 },
]

const rund = (x) => Math.round(x / 5) * 5
/** Einkaufsliste für die volle Farm (nach Preis heute): 8 Felder, 4 Hühner, 2 Kühe, 3 Bäume, jede Deko einmal, Rest mit der günstigsten */
function bauplan(m) {
  const p = (x) => Math.max(5, rund(x * m.preis))
  const liste = []
  for (let i = 0; i < 8; i++) liste.push({ was: 'feld', preis: p(FELD[0]), ab: FELD[1] })
  for (let i = 0; i < 4; i++) liste.push({ was: 'huhn', preis: p(HUHN[0]), ab: HUHN[1] })
  for (const [id, [preis, ab]] of Object.entries(OBST)) liste.push({ was: id, preis: p(preis), ab })
  for (let i = 0; i < 2; i++) liste.push({ was: 'kuh', preis: p(KUH[0]), ab: KUH[1] })
  for (const [art, n] of Object.entries(PLAETZE)) {
    const arten = DEKO.filter((d) => d[1] === art).sort((a, b) => a[2] - b[2])
    for (let i = 0; i < n; i++) {
      const d = arten[i] ?? arten.find((x) => !x[4])
      if (d) liste.push({ was: d[0], preis: p(d[2]), ab: d[3] })
    }
  }
  return liste.sort((a, b) => a.ab - b.ab || a.preis - b.preis)
}

function simuliere(kind, m) {
  const plan = bauplan(m)
  const samenPreis = (s) => SAMEN[s][0] // Samen bleiben überall beim heutigen Preis (Verbrauchsware; ein Kind soll nach einer Übung pflanzen können)
  const verkauf = (s) => (m.verkaufFaktor ? SAMEN[s][1] : samenPreis(s) + 5)
  const tier = (art, s) => (m.tierPlus ? samenPreis(s) + m.tierPlus[art === 'kuh' ? 1 : 0] : (art === 'kuh' ? MILCH : EI)[SAMEN[s][3] - 1])
  let konto = 0, verdient = 0, gekauft = 0, felder = 4, huehner = 0, kuehe = 0, baeume = 0, voll = null, handelSumme = 0, lernSumme = 0, saat = 0
  const feld = [] // je Feld: { sorte, stufe, tage }
  const vorrat = []
  const verlauf = []
  const ein = (x, lernen) => { konto += x; if (lernen || m.verkaufZaehlt) verdient += x; if (lernen) lernSumme += x; else handelSumme += x }
  for (let tag = 0; tag < WOCHEN * 7; tag++) {
    const woche = Math.floor(tag / 7), wt = tag % 7
    // Üben: Pakete verteilt auf Mo bis Fr
    let giessen = 0
    const paketeHeute = wt < 5 ? kind.pakete / 5 : 0
    if (paketeHeute) {
      const uebungen = paketeHeute * UEBUNGEN_JE_PAKET
      const grund = 30 * m.uebungFaktor * kind.richtig, freund = 15 * m.uebungFaktor * kind.ganz
      ein(uebungen * (grund + freund) + paketeHeute * 5, true)
      giessen += uebungen * Math.max(1, RUNDEN * kind.richtig) + paketeHeute
    }
    if (m.wochenBonus && wt === 4 && kind.pakete > 0 && (woche * kind.pakete) % 1 < kind.pakete) ein(m.wochenBonus, true)
    const farmTag = wt < kind.farmTage
    if (farmTag && kind.wdh && !m.giessenNurNeu) giessen += kind.wdh * RUNDEN * kind.richtig // Wiederholen ohne Münzen gießt (heute)
    // Pflanzen wachsen (Gießen + 1 pro Tag bis zur Hälfte)
    for (const f of feld) if (f) { f.tage++; f.stufe += giessen; f.zeit = Math.min(f.tage, SAMEN[f.sorte][2] / 2) }
    if (!farmTag) { verlauf[woche] = konto; continue }
    // Ernten
    for (let i = 0; i < feld.length; i++) {
      const f = feld[i]
      if (f && f.stufe + f.zeit >= SAMEN[f.sorte][2]) { vorrat.push(f.sorte); feld[i] = null }
    }
    // Füttern (einmal am Tag je Tier) mit dem besten Futter, Ei/Milch verkaufen
    let heuteVerkauf = 0
    // Tagesdeckel: was den Deckel überschreiten würde, bleibt im Vorrat (Tiere werden dann erst morgen gefüttert)
    const frei = (x) => heuteVerkauf + x <= m.verkaufDeckel
    const verkaufe = (x) => { heuteVerkauf += x; ein(x, false) }
    vorrat.sort((a, b) => SAMEN[b][3] - SAMEN[a][3])
    for (const [art, n] of [['huhn', huehner], ['kuh', kuehe]])
      for (let i = 0; i < n && vorrat.length && frei(tier(art, vorrat[0])); i++) verkaufe(tier(art, vorrat.shift()))
    if (wt === 0 && woche % (m.obstAlle / 7) === 0) for (const [id] of Object.entries(OBST).slice(0, baeume)) verkaufe(Math.min(m.verkaufDeckel, 3 * OBST[id][2] * (m.obstAlle === 7 ? 1 : 0.5)))
    // Rest verkaufen (Händler behalten nichts zurück, andere behalten Futter für ihre Tiere)
    const behalten = kind.handel ? 0 : huehner + kuehe
    while (vorrat.length > behalten && frei(verkauf(vorrat.at(-1)))) verkaufe(verkauf(vorrat.pop()))
    // Kaufen nach Plan, solange Geld da ist
    while (gekauft < plan.length && plan[gekauft].ab <= verdient && konto >= plan[gekauft].preis) {
      const k = plan[gekauft++]; konto -= k.preis
      if (k.was === 'feld') felder++; else if (k.was === 'huhn') huehner++; else if (k.was === 'kuh') kuehe++; else if (k.was in OBST) baeume++
    }
    if (gekauft === plan.length && voll === null) voll = woche + 1
    // Pflanzen: bester freigeschalteter Samen, den man bezahlen kann; Händler nehmen den mit dem besten Futter
    const samen = Object.keys(SAMEN).filter((s) => SAMEN[s][4] <= verdient).sort((a, b) => (kind.handel ? SAMEN[b][3] - SAMEN[a][3] : 0) || samenPreis(a) - samenPreis(b))
    for (let i = 0; i < felder; i++) if (!feld[i]) {
      const s = kind.handel ? samen[0] : samen[Math.min(samen.length - 1, 2)]
      if (!s || konto < samenPreis(s) || vorrat.length > 2 * felder) break
      konto -= samenPreis(s); saat += samenPreis(s); feld[i] = { sorte: s, stufe: 0, tage: 0, zeit: 0 }
    }
    verlauf[woche] = konto
  }
  const kosten = plan.reduce((s, k) => s + k.preis, 0)
  return { voll, kosten, gekauft, plan: plan.length, lern: Math.round(lernSumme), handel: Math.round(handelSumme - saat), verlauf: verlauf.map(Math.round) }
}

// ---------- Ausgabe ----------
const zeilen = ['# Ergebnis der Simulation (erzeugt von simulation.mjs, nicht von Hand ändern)', '',
  `Schuljahr = ${WOCHEN} Wochen, je Paket ${UEBUNGEN_JE_PAKET} Übungen mit ${RUNDEN} Runden und eine Erklärseite, Sterne im Schnitt ★★.`, '']
for (const m of MODELLE) {
  const r0 = simuliere(KINDER[0], m)
  zeilen.push(`## ${m.name}`, '', `Volle Farm kostet ${r0.kosten} Münzen (${r0.plan} Käufe).`, '',
    '| Kind | volle Farm nach | gekauft (von ' + r0.plan + ') | Lernmünzen im Jahr | Gewinn aus Handel | Kontostand Woche 4 / 12 / 24 / 38 |', '|---|---|---|---|---|---|')
  for (const k of KINDER) {
    const r = simuliere(k, m)
    const v = r.verlauf
    zeilen.push(`| ${k.name} | ${r.voll ? r.voll + ' Wochen' : 'nicht im Schuljahr'} | ${r.gekauft} | ${r.lern} | ${r.handel} | ${[v[3], v[11], v[23], v[37]].join(' / ')} |`)
  }
  zeilen.push('')
}
// Welcher Preisfaktor (Modell A) passt zur Zieldauer „volle Farm nach etwa einem Schuljahr“ beim regelmäßigen Kind?
zeilen.push('## Preisfaktor für Modell A je nach Zahl neuer Pakete', '', '| neue Pakete im Jahr | Faktor, mit dem das regelmäßige Kind die volle Farm nach 30 bis 38 Wochen hat |', '|---|---|')
for (const n of [20, 38, 57, 76]) {
  const kind = { ...KINDER[0], pakete: n / 38, wdh: n < 76 ? 3 : 0 }
  const passt = []
  for (let f = 0.5; f <= 4; f += 0.25) {
    const r = simuliere(kind, { ...MODELLE[1], preis: f })
    if (r.voll && r.voll >= 30 && r.voll <= 38) passt.push(f)
  }
  zeilen.push(`| ${n} | ${passt.length ? `${passt[0]} bis ${passt.at(-1)}` : 'keiner'} |`)
}
zeilen.push('')
const text = zeilen.join('\n')
writeFileSync(new URL('./ergebnis.md', import.meta.url), text + '\n')
console.log(text)

// Selbstprüfung: heute ist der Händler schneller als das regelmäßige Kind; im Vorschlag A nicht mehr durch Handel
const heuteR = simuliere(KINDER[0], HEUTE), heuteS = simuliere(KINDER[4], HEUTE), aS = simuliere(KINDER[4], MODELLE[1]), aR = simuliere(KINDER[0], MODELLE[1])
console.assert(heuteS.handel > aS.handel, 'Schlupflöcher bringen im Vorschlag weniger')
console.assert(heuteR.voll !== null && aR.kosten > heuteR.kosten, 'Plausibel: heute volle Farm, Vorschlag teurer')
