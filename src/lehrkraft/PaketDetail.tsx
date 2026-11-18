// alt (Übungswiese), auf die Lehrkraft-Ansicht „ruhig“ (lk-*) umgestellt
import { useCallback, useEffect, useState } from 'react'
import { AufgabeBearbeiten } from '../gemeinsam/AufgabeBearbeiten'
import { fehlerText } from '../lib/fehler'
import { gehe } from '../lib/router'
import { supabase } from '../lib/supabase'
import type { Aufgabe, Klasse, LueckentextInhaltSchueler, Paket, Pruefergebnis, Schueler, Stufe, Zuweisung } from '../lib/typen'
import { Sprite } from '../gemeinsam/Sprite'
import { monster } from '../lib/monster'
import { TYP_NAMEN } from './AufgabenListe'
import { PaketTags, TagAuswahl } from './PaketTags'
import { UebungAuswahl } from './UebungAuswahl'
import { closestCenter, DndContext, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export type PaketAufgabe = Aufgabe & { inhalt: LueckentextInhaltSchueler }
type Daten = {
  paket: Paket
  inhalt: { aufgabe_id: string; position: number; aufgabe: PaketAufgabe }[]
  zuweisungen: (Zuweisung & { zuweisung_einzeln: { schueler_id: string; entfernt_am: string | null }[] })[]
  klassen: Klasse[]
  schueler: Pick<Schueler, 'id' | 'klasse_id' | 'pseudonym'>[]
}

const sterne = (s: Stufe) => '★'.repeat(s) + '☆'.repeat(3 - s)

/** Ein Eintrag im Paket: ziehen (Griff ⠿) oder mit ↑ ↓ verschieben, entfernen */
function PaketEintrag(props: { aufgabe: PaketAufgabe; erste: boolean; letzte: boolean; hoch: () => void; runter: () => void; entfernen: () => void }) {
  const a = props.aufgabe
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: a.id })
  return (
    <li ref={setNodeRef} className="lk-eintrag" data-zieht={isDragging || undefined} style={{ transform: CSS.Transform.toString(transform), transition }}>
      <span>
        <button type="button" className="lk-griff" aria-label={`${a.titel} ziehen, um die Reihenfolge zu ändern`} {...attributes} {...listeners}>
          ⠿
        </button>
        {a.typ !== 'erklaerung' && a.monster !== 'kein' && (
          <span className="lk-monster-klein" title={monster(a.monster).name}>
            <Sprite grafik={monster(a.monster).grafik} mal={Math.max(1, monster(a.monster).mal - 1)} />
          </span>
        )}
        <a href={`#/lehrkraft/${a.typ === 'erklaerung' ? 'erklaerungen' : 'aufgaben'}/${a.id}`}>{a.titel}</a>
        <span className="lk-leise">
          {' '}
          · {TYP_NAMEN[a.typ]}
          {a.typ !== 'erklaerung' && <span aria-label={`Stufe ${a.stufe} von 3`}> · {sterne(a.stufe)}</span>}
        </span>
      </span>
      <span className="lk-knopfreihe">
        <button type="button" className="lk-knopf" disabled={props.erste} onClick={props.hoch} aria-label={`${a.titel} nach oben`}>
          ↑
        </button>
        <button type="button" className="lk-knopf" disabled={props.letzte} onClick={props.runter} aria-label={`${a.titel} nach unten`}>
          ↓
        </button>
        <button type="button" className="lk-knopf" onClick={props.entfernen}>
          Entfernen
        </button>
      </span>
    </li>
  )
}

export function PaketDetail({ paketId, vorschau }: { paketId: string; vorschau: boolean }) {
  const sensoren = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const [daten, setDaten] = useState<Daten | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)

  const laden = useCallback(async () => {
    const [p, pa, z, k, s] = await Promise.all([
      supabase.from('pakete').select('*').eq('id', paketId).eq('archiviert', false).maybeSingle(),
      supabase.from('paket_aufgaben').select('aufgabe_id, position, aufgabe:aufgaben(*)').eq('paket_id', paketId).order('position'),
      supabase.from('zuweisungen').select('*, zuweisung_einzeln(schueler_id, entfernt_am)').eq('paket_id', paketId).is('entfernt_am', null).order('erstellt_am'),
      supabase.from('klassen').select('id, name, kerncurriculum').order('name'),
      supabase.from('schueler').select('id, klasse_id, pseudonym').order('pseudonym'),
    ])
    const fehlerhaft = [p, pa, z, k, s].find((r) => r.error)
    if (fehlerhaft?.error) return setFehler(fehlerText(fehlerhaft.error))
    if (!p.data) return setFehler('Dieses Paket gibt es nicht mehr oder es ist archiviert.')
    setDaten({
      paket: p.data as Paket,
      inhalt: pa.data as unknown as Daten['inhalt'],
      zuweisungen: z.data as Daten['zuweisungen'],
      klassen: k.data as Klasse[],
      schueler: s.data as Daten['schueler'],
    })
  }, [paketId])

  useEffect(() => {
    void laden()
  }, [laden])

  if (!daten) return fehler ? <p className="lk-hinweis" role="alert">{fehler}</p> : <p className="lk-leise" role="status">Lädt …</p>
  if (vorschau) return <PaketVorschau daten={daten} />

  const { paket, inhalt, zuweisungen, klassen, schueler } = daten
  const imPaket = new Set(inhalt.map((i) => i.aufgabe_id))
  const klassenName = (id: string | null) => klassen.find((k) => k.id === id)?.name ?? '?'

  async function ausfuehren(aktion: PromiseLike<{ error: unknown }>) {
    const { error } = await aktion
    if (error) setFehler(fehlerText(error))
    else {
      setFehler(null)
      void laden()
    }
  }

  // Teilaufgabe 5: neue Reihenfolge sofort zeigen, dann speichern (ohne alles neu zu laden); bei einem Fehler wieder laden
  async function neueReihenfolge(neu: Daten['inhalt']) {
    setDaten({ ...daten!, inhalt: neu.map((e, i) => ({ ...e, position: i })) })
    const { error } = await supabase.from('paket_aufgaben').upsert(neu.map((e, i) => ({ paket_id: paket.id, aufgabe_id: e.aufgabe_id, position: i })))
    if (error) {
      setFehler(fehlerText(error))
      void laden()
    } else setFehler(null)
  }
  const verschieben = (von: number, nach: number) => void neueReihenfolge(arrayMove(inhalt, von, nach))

  return (
    <>
      <a className="lk-zurueck" href="#/lehrkraft/pakete">
        ← Alle Pakete
      </a>
      <PaketKopf paket={paket} onGeaendert={laden} onFehler={setFehler} />
      {fehler && <p className="lk-hinweis" role="alert">{fehler}</p>}

      <section className="lk-abschnitt">
        <h2>Übungen in diesem Paket</h2>
        {inhalt.length === 0 ? (
          <p>Noch keine Übungen.</p>
        ) : (
          <DndContext sensors={sensoren} collisionDetection={closestCenter} onDragEnd={(e) => {
            const von = inhalt.findIndex((x) => x.aufgabe_id === e.active.id)
            const nach = inhalt.findIndex((x) => x.aufgabe_id === e.over?.id)
            if (von >= 0 && nach >= 0 && von !== nach) verschieben(von, nach)
          }}>
            <SortableContext items={inhalt.map((e) => e.aufgabe_id)} strategy={verticalListSortingStrategy}>
              <ol className="lk-liste">
                {inhalt.map((e, i) => (
                  <PaketEintrag
                    key={e.aufgabe_id}
                    aufgabe={e.aufgabe}
                    erste={i === 0}
                    letzte={i === inhalt.length - 1}
                    hoch={() => verschieben(i, i - 1)}
                    runter={() => verschieben(i, i + 1)}
                    entfernen={() => void ausfuehren(supabase.from('paket_aufgaben').delete().eq('paket_id', paket.id).eq('aufgabe_id', e.aufgabe_id))}
                  />
                ))}
              </ol>
            </SortableContext>
          </DndContext>
        )}
        <UebungAuswahl
          paketId={paket.id}
          imPaket={imPaket}
          naechstePosition={Math.max(-1, ...inhalt.map((x) => x.position)) + 1}
          onHinzugefuegt={() => {
            setFehler(null)
            void laden()
          }}
          onFehler={setFehler}
        />
        <p className="lk-leise">
          Schüler:innen, denen Sie das Paket zuweisen, sehen alle Übungen darin. Die Sterne zeigen nur, wie schwer eine Übung ist.
        </p>
        {inhalt.length > 0 && (
          <div className="lk-knopfreihe">
            <a className="lk-knopf" href={`#/lehrkraft/pakete/${paket.id}/vorschau`}>
              Vorschau: Paket wie Schüler:innen durcharbeiten
            </a>
          </div>
        )}
      </section>

      <section className="lk-abschnitt">
        <h2>Zugewiesen an</h2>
        {zuweisungen.length === 0 ? (
          <p>Noch niemandem. Schüler:innen sehen das Paket erst nach dem Zuweisen.</p>
        ) : (
          <ul className="lk-liste">
            {zuweisungen.map((z) => {
              const s = schueler.find((x) => x.id === z.schueler_id)
              return (
                <li key={z.id} className="lk-eintrag">
                  <span>
                    {z.klasse_id ? (
                      <>
                        Klasse <strong>{klassenName(z.klasse_id)}</strong> (
                        {(() => {
                          const raus = z.zuweisung_einzeln.filter((e) => e.entfernt_am).map((e) => schueler.find((x) => x.id === e.schueler_id)?.pseudonym)
                          return raus.length ? `alle außer ${raus.join(', ')}` : 'alle'
                        })()}
                        )
                      </>
                    ) : (
                      <>
                        <strong>{s?.pseudonym}</strong> ({klassenName(s?.klasse_id ?? null)})
                      </>
                    )}
                  </span>
                  <button type="button" className="lk-knopf" onClick={() => void ausfuehren(supabase.from('zuweisungen').update({ entfernt_am: new Date().toISOString() }).eq('id', z.id))}>
                    Zuweisung entfernen
                  </button>
                </li>
              )
            })}
          </ul>
        )}
        <form
          className="lk-zeile"
          onSubmit={(e) => {
            e.preventDefault()
            const wert = new FormData(e.currentTarget).get('ziel') as string
            if (!wert) return
            const [art, id] = wert.split(':')
            // Klassen-Aufgaben (Jazz 2026-11-18): über zuteilen, damit eine neue Zuteilung die alte ersetzt; Entfernen blendet nur aus
            const klasse = art === 'k' ? id : (schueler.find((s) => s.id === id)?.klasse_id ?? '')
            void ausfuehren(supabase.rpc('zuteilen', { p_pakete: [paket.id], p_klasse: klasse, p_schueler: art === 'k' ? null : [id] }))
          }}
        >
          <label>
            Zuweisen an
            <select className="lk-feld" name="ziel">
              {klassen.map((k) => (
                <optgroup key={k.id} label={`Klasse ${k.name}`}>
                  <option value={`k:${k.id}`}>Ganze Klasse {k.name}</option>
                  {schueler
                    .filter((s) => s.klasse_id === k.id)
                    .map((s) => (
                      <option key={s.id} value={`s:${s.id}`}>
                        nur {s.pseudonym}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </label>
          <button className="lk-knopf lk-knopf--haupt" disabled={klassen.length === 0}>
            Zuweisen
          </button>
        </form>
      </section>

      <section className="lk-abschnitt">
        <div className="lk-knopfreihe">
          <button
            type="button"
            className="lk-knopf lk-knopf--gefahr"
            onClick={async () => {
              if (!window.confirm(`Paket „${paket.titel}“ löschen?\n\nDie Aufgaben selbst bleiben erhalten. Schüler:innen sehen das Paket danach nicht mehr.`)) return
              const { error } = await supabase.from('pakete').delete().eq('id', paket.id)
              if (error) setFehler(fehlerText(error))
              else gehe('/lehrkraft/pakete')
            }}
          >
            Paket löschen
          </button>
        </div>
      </section>
    </>
  )
}

function PaketKopf({ paket, onGeaendert, onFehler }: { paket: Paket; onGeaendert: () => void; onFehler: (f: string) => void }) {
  const [bearbeiten, setBearbeiten] = useState(false)
  const [titel, setTitel] = useState(paket.titel)
  const [beschreibung, setBeschreibung] = useState(paket.beschreibung ?? '')
  const [tags, setTags] = useState({ jahrgaenge: paket.jahrgaenge, zweige: paket.zweige })

  if (!bearbeiten) {
    return (
      <>
        <h1>{paket.titel}</h1>
        {paket.beschreibung && <p>{paket.beschreibung}</p>}
        <p>
          <PaketTags jahrgaenge={paket.jahrgaenge} zweige={paket.zweige} />
        </p>
        <div className="lk-knopfreihe">
          <button type="button" className="lk-knopf" onClick={() => setBearbeiten(true)}>
            Titel, Beschreibung, Tags ändern
          </button>
        </div>
      </>
    )
  }
  return (
    <form
      className="lk-abschnitt"
      onSubmit={async (e) => {
        e.preventDefault()
        const { error } = await supabase
          .from('pakete')
          .update({ titel: titel.trim(), beschreibung: beschreibung.trim() || null, ...tags })
          .eq('id', paket.id)
        if (error) return onFehler(fehlerText(error))
        setBearbeiten(false)
        onGeaendert()
      }}
    >
      <div className="lk-zeile">
        <label>
          Titel
          <input className="lk-feld" value={titel} onChange={(e) => setTitel(e.target.value)} required maxLength={120} />
        </label>
        <label>
          Beschreibung für Schüler:innen (freiwillig)
          <input className="lk-feld" value={beschreibung} onChange={(e) => setBeschreibung(e.target.value)} maxLength={300} />
        </label>
      </div>
      <TagAuswahl wert={tags} onChange={setTags} />
      <div className="lk-knopfreihe">
        <button className="lk-knopf lk-knopf--haupt">Speichern</button>
        <button type="button" className="lk-knopf" onClick={() => setBearbeiten(false)}>
          Abbrechen
        </button>
      </div>
    </form>
  )
}

/** Lösung zum Anzeigen aus der Eingabe der Lehrkraft (wie nur_loesung in der Datenbank) */
function loesungAus(a: Aufgabe): Record<number, string[]> {
  return Object.fromEntries(
    a.loesung.teile.flatMap((t) =>
      t.t === 'luecke'
        ? [[t.id, t.loesungen]]
        : t.t === 'auswahl' || t.t === 'versionen'
          ? [[t.id, t.richtig.map((nr) => t.optionen[nr])]]
          : t.t === 'einheit' && t.kategorie
            ? [[t.id, [t.kategorie]]]
            : t.t === 'wort' && t.korrekturen
              ? [[t.id, t.korrekturen]]
              : t.t === 'reihe'
                ? [[t.id, t.loesungen.map((l) => l.join(' '))]]
                : [],
    ),
  )
}

// Vorschau: das Paket so durcharbeiten, wie Schüler:innen es sehen (alle Stufen). Es wird nichts gespeichert.
function PaketVorschau({ daten }: { daten: Daten }) {
  return (
    <>
      <a className="lk-zurueck" href={`#/lehrkraft/pakete/${daten.paket.id}`}>
        ← Vorschau beenden
      </a>
      <h1>{daten.paket.titel}</h1>
      <Durchgehen
        aufgaben={daten.inhalt.map((i) => i.aufgabe)}
        ende={{ text: 'Vorschau beenden', ziel: () => gehe(`/lehrkraft/pakete/${daten.paket.id}`) }}
      />
    </>
  )
}

/** Übungen Schritt für Schritt so zeigen, wie Schüler:innen sie sehen (Paket-Vorschau und „Ansehen“ beim Zusammenstellen) */
export function Durchgehen({ aufgaben, ende }: { aufgaben: PaketAufgabe[]; ende: { text: string; ziel: () => void } }) {
  const [index, setIndex] = useState(0)
  // Übungen: jede Runde als eigener Schritt (wie im Spiel); Erklärseiten als ein Schritt
  const schritte = aufgaben.flatMap((a) =>
    a.loesung.runden
      ? a.loesung.runden.map((r, i) => ({
          a: { ...a, loesung: r, inhalt: a.inhalt.runden?.[i] ?? { teile: [] } },
          runde: a.loesung.runden!.length > 1 ? ` · Runde ${i + 1} von ${a.loesung.runden!.length}` : '',
        }))
      : [{ a, runde: '' }],
  )
  const schritt = schritte[index]
  if (!schritt) return <p>Das Paket ist leer.</p>
  const a = schritt.a
  let versuche = 0
  return (
    <>
      <p className="lk-leise">
        Vorschau: Schritt {index + 1} von {schritte.length}{schritt.runde}. Hier sehen Sie alle Stufen; es wird nichts gespeichert.
      </p>
      <div className="lk-vorschau">
        <AufgabeBearbeiten
          key={`${a.id}-${index}`}
          aufgabe={{ ...a, versuche: 0, geloest: false, loesung_angesehen: false }}
          pruefen={async (antworten) => {
            const { data, error } = await supabase.rpc('pruefe_aufgabe', { p_typ: a.typ, p_loesung: a.loesung, p_antworten: antworten })
            if (error) throw new Error(fehlerText(error))
            const ergebnis = data as Pruefergebnis
            versuche++
            return { ergebnis, rueckmeldung: ergebnis.richtig ? null : a.rueckmeldung_fehler, versuche }
          }}
          loesungHolen={async () => loesungAus(a)}
          weiter={
            index + 1 < schritte.length
              ? { text: 'Weiter', ziel: () => setIndex(index + 1) }
              : ende
          }
        />
      </div>
      <div className="lk-knopfreihe">
        <button type="button" className="lk-knopf" disabled={index === 0} onClick={() => setIndex(index - 1)}>
          Zurück
        </button>
        <button type="button" className="lk-knopf" disabled={index + 1 >= schritte.length} onClick={() => setIndex(index + 1)}>
          Überspringen
        </button>
      </div>
    </>
  )
}
