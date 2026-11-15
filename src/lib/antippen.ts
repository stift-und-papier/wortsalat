// Antipp-Modus im Editor (Jazz 2026-11-15, Teilaufgabe 6): Die Lehrkraft schreibt den Text wie die Schüler:innen ihn sehen und tippt
// Wörter an, die zur Lücke, Auswahl, Zuordnung oder zum Fehler werden. Gespeichert wird weiter die Schreibweise mit [Klammern]
// (src/lib/lueckentext.ts); dieses Modul rechnet zwischen beiden hin und her.
//   klar   = Text ohne Klammern, an jeder Stelle steht das sichtbare Wort (Lösung, richtige Möglichkeit, Fehlerwort, Einheit)
//   marken = Stellen im klar-Text (start bis ende) mit dem Inhalt ihrer Klammer

export type Marke = { start: number; ende: number; innen: string }
export type Antipp = { klar: string; marken: Marke[] }

const trenneHinweis = (innen: string) => innen.split(/:(?!\d)/)

/** Das Wort, das im Text an der Stelle steht */
export function sichtbar(innen: string): string {
  if (innen.includes('->')) return innen.slice(0, innen.indexOf('->')).trim()
  if (innen.includes('|')) {
    const o = innen.split('|').map((s) => s.trim())
    return (o.find((x) => x.startsWith('*')) ?? o[0]).replace(/^\*\s*/, '').trim()
  }
  if (innen.includes('=')) return innen.slice(0, innen.lastIndexOf('=')).trim()
  return trenneHinweis(innen)[0].split('/')[0].trim()
}

/** Dieselbe Stelle mit einem anderen sichtbaren Wort (z. B. um das nächste Wort erweitert) */
export function mitSichtbar(innen: string, neu: string): string {
  if (innen.includes('->')) return `${neu} ->${innen.slice(innen.indexOf('->') + 2)}`
  if (innen.includes('|')) {
    const o = innen.split('|').map((s) => s.trim())
    const anker = Math.max(0, o.findIndex((x) => x.startsWith('*')))
    o[anker] = (o[anker].startsWith('*') ? '*' : '') + neu
    return o.join(' | ')
  }
  if (innen.includes('=')) return `${neu} =${innen.slice(innen.lastIndexOf('=') + 1)}`
  const [vorne, ...hinten] = trenneHinweis(innen)
  const loesungen = vorne.split('/').map((l) => l.trim())
  loesungen[0] = neu
  return loesungen.join('/') + (hinten.length ? ` : ${hinten.join(':').trim()}` : '')
}

/** [Klammer]-Text → klar + marken. Eine nicht geschlossene „[“ bleibt normaler Text. */
export function ausText(text: string): Antipp {
  let klar = ''
  const marken: Marke[] = []
  let i = 0
  while (i < text.length) {
    const ende = text[i] === '[' ? text.indexOf(']', i + 1) : -1
    const naechste = text.indexOf('[', i + 1)
    if (ende !== -1 && (naechste === -1 || naechste > ende)) {
      const innen = text.slice(i + 1, ende)
      const wort = sichtbar(innen)
      marken.push({ start: klar.length, ende: klar.length + wort.length, innen })
      klar += wort
      i = ende + 1
    } else {
      klar += text[i]
      i++
    }
  }
  return { klar, marken }
}

/** klar + marken → [Klammer]-Text */
export function zuText({ klar, marken }: Antipp): string {
  let text = ''
  let pos = 0
  for (const m of [...marken].sort((a, b) => a.start - b.start)) {
    text += klar.slice(pos, m.start) + `[${m.innen}]`
    pos = m.ende
  }
  return text + klar.slice(pos)
}

/**
 * Der klar-Text wurde im Textfeld geändert: Marken vor und hinter der geänderten Stelle bleiben (hinten verschoben),
 * Marken, in denen getippt wurde, fallen weg.
 */
export function nachAenderung(alt: Antipp, neu: string): Antipp {
  const a = alt.klar
  let vorn = 0
  while (vorn < a.length && vorn < neu.length && a[vorn] === neu[vorn]) vorn++
  let hinten = 0
  while (hinten < a.length - vorn && hinten < neu.length - vorn && a[a.length - 1 - hinten] === neu[neu.length - 1 - hinten]) hinten++
  const altEnde = a.length - hinten
  const delta = neu.length - a.length
  const marken = alt.marken.flatMap((m) =>
    m.ende <= vorn ? [m] : m.start >= altEnde ? [{ ...m, start: m.start + delta, ende: m.ende + delta }] : [],
  )
  return { klar: neu, marken }
}

/** Antippbare Wörter (Buchstaben und Ziffern, mit Bindestrich und Apostroph; Satzzeichen gehören nicht dazu) */
export function woerter(klar: string): { start: number; ende: number }[] {
  return [...klar.matchAll(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu)].map((m) => ({ start: m.index, ende: m.index + m[0].length }))
}

/** Meldungen des Klammer-Lesers (lueckentext.ts) für den Antipp-Modus umformulieren (dort ist von Klammern nicht die Rede) */
export function antippMeldung(f: string): string {
  if (f.startsWith('Der Text hat noch keine Lücke')) return 'Tippen Sie unten mindestens ein Wort an.'
  if (f.startsWith('Markieren Sie mindestens einen Fehler')) return 'Tippen Sie unten mindestens ein Fehlerwort an.'
  if (f.startsWith('Markieren Sie mindestens ein Wort')) return 'Tippen Sie unten mindestens ein Wort an und wählen Sie seine Kategorie.'
  if (f.includes('[Fehlerwort -> Verbesserung]')) return f.replace(/Bitte so schreiben:.*/, 'Bitte schreiben Sie, wie es richtig heißt.')
  if (f.includes('Eine Möglichkeit ist leer') || f.includes('mindestens zwei Möglichkeiten')) return f.replace(/(Eine Möglichkeit ist leer|Eine Auswahl braucht).*/, 'Bitte tragen Sie die falschen Möglichkeiten ein.')
  return f
}

// ---- Stellen bauen und lesen (Felder unter dem Text) ----

export const teile = (s: string) => s.split('/').map((x) => x.trim()).filter(Boolean)

export function luecke(innen: string) {
  const [vorne, ...hinten] = trenneHinweis(innen)
  const l = vorne.split('/').map((x) => x.trim())
  return { weitere: l.slice(1).filter(Boolean).join(' / '), hinweis: hinten.join(':').trim() }
}
export function lueckeBauen(wort: string, weitere: string, hinweis: string) {
  return [wort, ...teile(weitere)].join('/') + (hinweis.trim() ? ` : ${hinweis.trim()}` : '')
}

/** Auswahl: die übrigen Möglichkeiten; weitere richtige behalten ihr * */
export function auswahlAndere(innen: string) {
  if (!innen.includes('|')) return ''
  const o = innen.split('|').map((s) => s.trim())
  const anker = Math.max(0, o.findIndex((x) => x.startsWith('*')))
  return o.filter((_, i) => i !== anker).join(' / ')
}
/** platz: an welcher Stelle die richtige Möglichkeit steht (die Reihenfolge sehen die Schüler:innen so) */
export function auswahlBauen(wort: string, andere: string, platz: number) {
  const o = teile(andere)
  o.splice(platz % (o.length + 1), 0, `*${wort}`)
  return o.join(' | ')
}

export const fehlerKorrektur = (innen: string) => (innen.includes('->') ? innen.slice(innen.indexOf('->') + 2).trim().split('/').map((x) => x.trim()).join(' / ') : '')
export const fehlerBauen = (wort: string, richtig: string) => `${wort} -> ${teile(richtig).join('/')}`

export const kategorie = (innen: string) => (innen.includes('=') && !innen.includes('|') ? innen.slice(innen.lastIndexOf('=') + 1).trim() : '')
export const einheitBauen = (wort: string, kat: string) => `${wort} = ${kat}`
