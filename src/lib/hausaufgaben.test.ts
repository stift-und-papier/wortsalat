import { describe, expect, it } from 'vitest'
import { kindStand, versucheDerUebung, versucheSatz, type Durchgang, type HaZeile } from './hausaufgaben'

const zeile: HaZeile = {
  id: 'z',
  paket_id: 'p',
  klasse_id: 'k',
  schueler_id: null,
  entfernt_am: null,
  hausaufgabe_ab: '2026-11-18T10:00:00+00:00',
  frist: '2026-11-20T07:00:00+00:00',
  versuche_erlaubt: 2,
  freigegeben_am: null,
  zuweisung_einzeln: [
    { schueler_id: 'raus', entfernt_am: '2026-11-18T11:00:00+00:00', neustart_ab: null, frist: null, freigegeben_am: null },
    { schueler_id: 'krank', entfernt_am: null, neustart_ab: '2026-11-19T00:00:00+00:00', frist: '2026-11-25T07:00:00+00:00', freigegeben_am: null },
  ],
}
const alt = '2026-01-01T00:00:00+00:00'
const jetzt = Date.parse('2026-11-21T12:00:00Z')

describe('Hausaufgabe je Kind', () => {
  it('wirksame Frist, Status und Herausgenommene', () => {
    expect(kindStand([zeile], { id: 'a', erstellt_am: alt }, jetzt)?.status).toBe('vorbei')
    expect(kindStand([zeile], { id: 'krank', erstellt_am: alt }, jetzt)?.status).toBe('laufend')
    expect(kindStand([zeile], { id: 'raus', erstellt_am: alt }, jetzt)).toBeNull()
    expect(kindStand([zeile], { id: 'neu', erstellt_am: '2026-11-19T00:00:00+00:00' }, jetzt)?.status).toBe('ohne_frist')
  })
  it('zählt Versuche ab Beginn bzw. Neustart, bester Versuch über alle', () => {
    const d = (beg: string, anteil: number): Durchgang => ({ schueler_id: 'krank', aufgabe_id: 'u', begonnen_am: beg, fertig_am: beg, anteil })
    const s = kindStand([zeile], { id: 'krank', erstellt_am: alt }, jetzt)!
    const v = versucheDerUebung([d('2026-11-17T09:00:00+00:00', 1), d('2026-11-18T12:00:00+00:00', 0.8), d('2026-11-19T09:00:00+00:00', 0.5)], 'krank', 'u', s)
    expect(v.liste).toHaveLength(2) // der Durchgang vor dem Beginn zählt nicht
    expect(v.zaehlen).toBe(1) // nur der nach dem Neustart
    expect(v.bester).toBe(0.8)
  })
  it('Einsteins Satz zu den Versuchen', () => {
    expect(versucheSatz(1, [1, 1])).toEqual({ kennung: 'hausaufgabe-versuch', zahl: 1 })
    expect(versucheSatz(3, [3, 3])).toEqual({ kennung: 'hausaufgabe-versuche', zahl: 3 })
    expect(versucheSatz(3, [2, 3])).toEqual({ kennung: 'hausaufgabe-noch-versuche', zahl: 2 })
    expect(versucheSatz(3, [0, 1])).toEqual({ kennung: 'hausaufgabe-noch-versuch', zahl: 1 })
    expect(versucheSatz(2, [0, 0])).toBeNull() // alles verbraucht: keine Nachricht
    expect(versucheSatz(null, [null])?.kennung).toBe('hausaufgabe-beliebig')
    expect(versucheSatz(null, [])).toBeNull() // nur Erklärseiten
  })
})
