import { describe, expect, it } from 'vitest'
import { berlinFelder, berlinIso, fristLang, fristText, naechsterSchultag } from './frist'

describe('Fristen in Europe/Berlin', () => {
  it('rechnet Winter- und Sommerzeit um', () => {
    expect(berlinIso('2026-11-21', '08:00')).toBe('2026-11-21T07:00:00.000Z')
    expect(berlinIso('2026-06-01', '08:00')).toBe('2026-06-01T06:00:00.000Z')
    expect(berlinFelder('2026-11-21T07:00:00.000Z')).toEqual({ datum: '2026-11-21', uhr: '08:00' })
  })
  it('nächster Schultag überspringt das Wochenende', () => {
    expect(naechsterSchultag(new Date('2026-11-18T12:00:00Z'))).toEqual({ datum: '2026-11-19', uhr: '08:00' }) // Mi → Do
    expect(naechsterSchultag(new Date('2026-11-20T12:00:00Z')).datum).toBe('2026-11-23') // Fr → Mo
    expect(naechsterSchultag(new Date('2026-11-21T23:30:00Z')).datum).toBe('2026-11-23') // So 00:30 Berlin → Mo
  })
  it('zeigt die Frist kurz an', () => {
    expect(fristText('2026-11-21T07:00:00.000Z')).toBe('Sa, 21.11., 08:00 Uhr')
    expect(fristLang('2026-11-20T07:00:00.000Z')).toEqual({ tag: 'Freitag, 20.11.', uhr: '08:00' })
  })
})
