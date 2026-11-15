import { describe, expect, it } from 'vitest'
import { auswahlAndere, auswahlBauen, ausText, einheitBauen, fehlerBauen, fehlerKorrektur, luecke, lueckeBauen, mitSichtbar, nachAenderung, sichtbar, woerter, zuText } from './antippen'
import { textZuTeilen } from './lueckentext'

describe('Antipp-Modus', () => {
  const beispiele = [
    'Ich weiß, [dass] du kommst.',
    'Wir gehen [Rad fahren/radfahren : Rad + fahren].',
    'Ich weiß, [das | *dass] du kommst.',
    '[Der kleine Hund = Subjekt] bellt.',
    'Ich [weis -> weiß] es.',
    'Um [12:30] geht es los.',
  ]
  it('hin und zurück bleibt der Text gleich', () => {
    for (const t of beispiele) expect(zuText(ausText(t))).toBe(t)
  })
  it('klar-Text zeigt das sichtbare Wort', () => {
    expect(ausText(beispiele[1]).klar).toBe('Wir gehen Rad fahren.')
    expect(ausText(beispiele[2]).klar).toBe('Ich weiß, dass du kommst.')
    expect(ausText(beispiele[4]).klar).toBe('Ich weis es.')
    expect(sichtbar('12:30')).toBe('12:30')
  })
  it('nicht geschlossene Klammer bleibt Text', () => {
    expect(ausText('a [b c').klar).toBe('a [b c')
  })
  it('Tippen vor, hinter und in einer Marke', () => {
    const a = ausText('Ich weiß, [dass] du kommst.')
    expect(zuText(nachAenderung(a, 'Na, ich weiß, dass du kommst.'))).toBe('Na, ich weiß, [dass] du kommst.')
    expect(zuText(nachAenderung(a, 'Ich weiß, dass du heute kommst.'))).toBe('Ich weiß, [dass] du heute kommst.')
    expect(zuText(nachAenderung(a, 'Ich weiß, daß du kommst.'))).toBe('Ich weiß, daß du kommst.')
  })
  it('Wörter ohne Satzzeichen', () => {
    const k = 'Ich weiß, dass Rad-fahren geht.'
    expect(woerter(k).map((w) => k.slice(w.start, w.ende))).toEqual(['Ich', 'weiß', 'dass', 'Rad-fahren', 'geht'])
  })
  it('Stellen bauen ergibt gültige Klammern', () => {
    expect(lueckeBauen('Rad fahren', 'radfahren', 'Rad + fahren')).toBe('Rad fahren/radfahren : Rad + fahren')
    expect(luecke('Rad fahren/radfahren : Rad + fahren')).toEqual({ weitere: 'radfahren', hinweis: 'Rad + fahren' })
    expect(auswahlBauen('dass', 'das', 1)).toBe('das | *dass')
    expect(auswahlAndere('das | *dass')).toBe('das')
    expect(fehlerBauen('weis', 'weiß / weiss')).toBe('weis -> weiß/weiss')
    expect(fehlerKorrektur('weis -> weiß/weiss')).toBe('weiß / weiss')
    expect(mitSichtbar('Rad : Hinweis', 'Rad fahren')).toBe('Rad fahren : Hinweis')
    expect(mitSichtbar('das | *dass', 'dass du')).toBe('das | *dass du')
    for (const innen of ['Rad fahren/radfahren : Rad + fahren', 'das | *dass']) expect(textZuTeilen(`[${innen}]`).fehler).toEqual([])
    expect(textZuTeilen(`[${einheitBauen('Hund', 'Nomen')}]`, true).fehler).toEqual([])
    expect(textZuTeilen(`[${fehlerBauen('weis', 'weiß')}]`, 'fehler').fehler).toEqual([])
  })
})
