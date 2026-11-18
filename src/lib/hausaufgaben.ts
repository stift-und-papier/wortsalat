// Klassen-Aufgaben Teilaufgabe 3: was für ein Kind bei einer Hausaufgabe gilt (wie in der Datenbank, Konzept Abschnitt 2).
// Wirksam ist die Angabe in zuweisung_einzeln, sonst die der Zuteilung.

export type Einzel = { schueler_id: string; entfernt_am: string | null; neustart_ab: string | null; frist: string | null; freigegeben_am: string | null }
export type HaZeile = {
  id: string
  paket_id: string
  klasse_id: string | null
  schueler_id: string | null
  entfernt_am: string | null
  hausaufgabe_ab: string
  frist: string | null
  versuche_erlaubt: number | null
  freigegeben_am: string | null
  zuweisung_einzeln: Einzel[]
}
export type Durchgang = { schueler_id: string; aufgabe_id: string; begonnen_am: string; fertig_am: string | null; anteil: number | null }
export type Status = 'laufend' | 'ohne_frist' | 'vorbei' | 'freigegeben' | 'beendet'
export type KindStand = { zeile: HaZeile; frist: string | null; frei: string | null; ab: string; status: Status }

const t = (iso: string) => Date.parse(iso)

/** Gilt die Hausaufgabe (diese Zeilen = eine Hausaufgabe) für das Kind, und wie? null = Kind hat sie nicht. */
export function kindStand(zeilen: HaZeile[], kind: { id: string; erstellt_am: string }, jetzt = Date.now()): KindStand | null {
  const zeile =
    zeilen.find((z) => z.schueler_id === kind.id) ??
    zeilen.find((z) => z.klasse_id && !z.zuweisung_einzeln.some((e) => e.schueler_id === kind.id && e.entfernt_am))
  if (!zeile) return null
  const e = zeile.zuweisung_einzeln.find((x) => x.schueler_id === kind.id)
  const frei = e?.freigegeben_am ?? zeile.freigegeben_am
  // später in die Klasse gekommen: offen ohne Frist, bis die Lehrkraft eine setzt (Jazz, Frage 6)
  const ohne = !e?.frist && t(kind.erstellt_am) > t(zeile.hausaufgabe_ab)
  const frist = e?.frist ?? (ohne ? null : zeile.frist)
  const ab = e?.neustart_ab && t(e.neustart_ab) > t(zeile.hausaufgabe_ab) ? e.neustart_ab : zeile.hausaufgabe_ab
  const status: Status = zeile.entfernt_am ? 'beendet' : frei ? 'freigegeben' : frist === null ? 'ohne_frist' : t(frist) > jetzt ? 'laufend' : 'vorbei'
  return { zeile, frist, frei, ab, status }
}

/** Fertige Durchgänge einer Übung, die zur Hausaufgabe zählen: nach dem Beginn begonnen, vor Freigabe oder Ende.
    `zaehlen` = davon seit „Versuche neu geben“ (verbraucht die erlaubte Zahl). */
export function versucheDerUebung(alle: Durchgang[], kindId: string, aufgabeId: string, s: KindStand) {
  const ende = [s.frei, s.zeile.entfernt_am].filter((x): x is string => !!x).map(t)
  const bis = ende.length ? Math.min(...ende) : Infinity
  const liste = alle
    .filter((d) => d.schueler_id === kindId && d.aufgabe_id === aufgabeId && d.fertig_am)
    .filter((d) => t(d.begonnen_am) >= t(s.zeile.hausaufgabe_ab) && t(d.begonnen_am) < bis)
    .sort((a, b) => t(a.fertig_am!) - t(b.fertig_am!))
  const zaehlen = liste.filter((d) => t(d.begonnen_am) >= t(s.ab)).length
  const bester = liste.reduce<number | null>((m, d) => (d.anteil === null ? m : Math.max(m ?? 0, d.anteil)), null)
  return { liste, zaehlen, bester }
}

/** Einstein (Schülerseite): Satz zu den Versuchen einer laufenden Hausaufgabe. `uebrig` = versuche_uebrig der Übungen im Paket.
    Genannt wird die kleinste übrige Zahl unter den Übungen, die noch nicht verbraucht sind (Konzept, Frage 1). null = keine Nachricht. */
export function versucheSatz(versuche: number | null, uebrig: (number | null | undefined)[]): { kennung: string; zahl: number } | null {
  if (!uebrig.length) return null
  if (versuche === null) return { kennung: 'hausaufgabe-beliebig', zahl: 0 }
  const offen = uebrig.filter((x): x is number => typeof x === 'number' && x > 0)
  if (!offen.length) return null
  const zahl = Math.min(...offen)
  const noch = uebrig.some((x) => typeof x === 'number' && x < versuche)
  return { kennung: `hausaufgabe-${noch ? 'noch-' : ''}${zahl === 1 ? 'versuch' : 'versuche'}`, zahl }
}
