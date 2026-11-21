import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Aufgabe 43 (Jazz 2026-11-21): Löschung der Schülerdaten zum Schuljahresende.
// Im August oben in der Lehrkraft-Ansicht ein Hinweis mit Knopf, im September nach der automatischen Löschung eine Nachricht.
// Gelöscht wird nur auf dem Server (Migration jahresloeschung); hier wird nur angezeigt und der Knopf gedrückt.

type Klasse = { id: string; name: string; weiter_im_jahr: number | null }

/** Heutiges Datum; beim Entwickeln testweise per ?heute=2027-08-05 in der Adresse (nur Anzeige, der Server prüft selbst). */
function heute(): Date {
  const test = import.meta.env.DEV ? new URLSearchParams(location.search).get('heute') : null
  return test ? new Date(`${test}T12:00:00`) : new Date()
}

export function Jahresloeschung() {
  const [stand, setStand] = useState<{ jahr: number | null; automatisch: boolean } | null>(null)
  const [klassen, setKlassen] = useState<Klasse[]>([])
  const [meldung, setMeldung] = useState('')
  const [fehler, setFehler] = useState('')
  const [laeuft, setLaeuft] = useState(false)
  const tag = heute()
  const jahr = tag.getFullYear()
  const monat = tag.getMonth() + 1

  useEffect(() => {
    if (monat !== 8 && monat !== 9) return
    void supabase.from('einstellungen').select('loeschung_jahr, loeschung_automatisch').maybeSingle()
      .then(({ data }) => data && setStand({ jahr: data.loeschung_jahr, automatisch: data.loeschung_automatisch }))
    void supabase.from('klassen').select('id, name, weiter_im_jahr').order('name')
      .then(({ data }) => setKlassen(data ?? []))
  }, [monat])

  if (meldung) return <p className="lk-erfolg lk-jahresende" role="status">{meldung}</p>
  if (!stand) return null

  if (monat === 9 && stand.jahr === jahr && stand.automatisch)
    return (
      <p className="lk-hinweis lk-jahresende" role="status">
        Zum Schuljahresende hat Wortsalat am 1. September die Daten Ihrer Schüler:innen gelöscht. Klassen, Übungen und Pakete
        sind noch da. Legen Sie für das neue Schuljahr neue Schüler:innen an.
      </p>
    )
  if (monat !== 8 || (stand.jahr ?? 0) >= jahr) return null

  const tage = 32 - tag.getDate() // bis einschließlich 31. August

  async function weiterfuehren(k: Klasse, an: boolean) {
    const wert = an ? jahr : null
    const { error } = await supabase.from('klassen').update({ weiter_im_jahr: wert }).eq('id', k.id)
    if (error) setFehler('Das hat nicht geklappt. Bitte versuchen Sie es noch einmal.')
    else setKlassen((alt) => alt.map((x) => (x.id === k.id ? { ...x, weiter_im_jahr: wert } : x)))
  }

  async function loeschen() {
    const weiter = klassen.filter((k) => k.weiter_im_jahr === jahr).map((k) => k.name)
    const ok = window.confirm(
      'Jetzt die Schülerdaten zum Schuljahresende löschen?\n\n' +
        (weiter.length ? `Weitergeführt (nur der Lernstand wird gelöscht): ${weiter.join(', ')}.\n\n` : '') +
        'Alle anderen Schüler:innen werden mit Link, Lernstand, Münzen und Farm endgültig gelöscht. Das lässt sich nicht rückgängig machen.',
    )
    if (!ok) return
    setLaeuft(true)
    setFehler('')
    const { data, error } = await supabase.rpc('jahresloeschung')
    setLaeuft(false)
    if (error) setFehler(error.message)
    else setMeldung(`Erledigt: ${data} Schüler:innen gelöscht. Ihre Klassen, Übungen und Pakete sind noch da.`)
  }

  return (
    <section className="lk-hinweis lk-jahresende" aria-labelledby="jahresende-titel">
      <h2 id="jahresende-titel">Schuljahresende: Schülerdaten löschen</h2>
      <p>
        Zum Ende des Schuljahres werden die Daten Ihrer Schüler:innen gelöscht. Wenn Sie nichts tun, löscht Wortsalat sie am
        1. September automatisch ({tage === 1 ? 'heute ist der letzte Tag' : `noch ${tage} Tage`}).
      </p>
      <p>
        Gelöscht werden Pseudonyme und Links, Antworten und Lernstand, Münzen und Farm. Ihre Klassen, Übungen, Erklärungen und
        Pakete bleiben. Schüler:innen, die Sie ab dem 1. August angelegt haben, bleiben auch.
      </p>
      <p>
        <strong>Vorher sichern:</strong> Öffnen Sie bei einer Klasse den Lernstand und wählen Sie „Für Excel“ oder „Drucken
        oder als PDF“.
      </p>
      {klassen.length > 0 && (
        <fieldset className="lk-jahresende__klassen">
          <legend>Klassen, die Sie weiter unterrichten (Pseudonyme, Links, Münzen und Farm bleiben, nur der Lernstand wird gelöscht):</legend>
          {klassen.map((k) => (
            <label key={k.id} className="lk-haken">
              <input type="checkbox" checked={k.weiter_im_jahr === jahr} onChange={(e) => void weiterfuehren(k, e.target.checked)} />
              {k.name} weiterführen
            </label>
          ))}
        </fieldset>
      )}
      {fehler && <p role="alert">{fehler}</p>}
      <div className="lk-knopfreihe">
        <button type="button" className="lk-knopf lk-knopf--gefahr" disabled={laeuft} onClick={() => void loeschen()}>
          Jetzt löschen
        </button>
      </div>
    </section>
  )
}
