// Hausaufgaben-Fristen: Eingabe und Anzeige immer in Europe/Berlin, gespeichert als Zeitpunkt (ISO)
const ZONE = 'Europe/Berlin'

function teile(d: Date) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone: ZONE, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'short' })
      .formatToParts(d)
      .map((x) => [x.type, x.value]),
  )
  return p as Record<'year' | 'month' | 'day' | 'hour' | 'minute' | 'weekday', string>
}

/** Datum „2026-11-21“ und Uhrzeit „08:00“ in Berlin → ISO-Zeitpunkt */
export function berlinIso(datum: string, uhr: string): string {
  const naiv = new Date(`${datum}T${uhr}:00Z`)
  const p = teile(naiv)
  const alsBerlin = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute)
  return new Date(naiv.getTime() - (alsBerlin - naiv.getTime())).toISOString()
}

/** ISO-Zeitpunkt → Felder für <input type="date"> und <input type="time"> (Berlin) */
export function berlinFelder(iso: string): { datum: string; uhr: string } {
  const p = teile(new Date(iso))
  return { datum: `${p.year}-${p.month}-${p.day}`, uhr: `${p.hour}:${p.minute}` }
}

/** Vorgabe für eine neue Frist: nächster Schultag (Mo bis Fr, ohne Ferien), 08:00 Uhr */
export function naechsterSchultag(jetzt = new Date()): { datum: string; uhr: string } {
  const p = teile(jetzt)
  const tag = new Date(Date.UTC(+p.year, +p.month - 1, +p.day))
  do tag.setUTCDate(tag.getUTCDate() + 1)
  while (tag.getUTCDay() === 0 || tag.getUTCDay() === 6)
  return { datum: tag.toISOString().slice(0, 10), uhr: '08:00' }
}

/** „Fr, 21.11., 08:00 Uhr“ */
export function fristText(iso: string): string {
  const d = new Date(iso)
  const wt = new Intl.DateTimeFormat('de-DE', { timeZone: ZONE, weekday: 'short' }).format(d).replace('.', '')
  const p = teile(d)
  return `${wt}, ${p.day}.${p.month}., ${p.hour}:${p.minute} Uhr`
}
