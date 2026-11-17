// alt (Übungswiese), auf die Lehrkraft-Ansicht „ruhig“ (lk-*) umgestellt
import { useEffect, useMemo, useRef, useState } from 'react'
import { AufgabeBearbeiten } from '../gemeinsam/AufgabeBearbeiten'
import { fehlerText } from '../lib/fehler'
import {
  bloeckeZuText,
  kategorienAus,
  ohneLoesung,
  reihenZuTeilen,
  teileZuText,
  textZuTeilen,
  versionenBloecke,
  versionenZuTeilen,
  type VersionenBlock,
} from '../lib/lueckentext'
import { nachSaetzenTrennen, saetzeTeilen, textAusTrennungen, woerterUndTrennungen } from '../lib/diktat'
import { gehe } from '../lib/router'
import { supabase } from '../lib/supabase'
import {
  type Antworten,
  type Aufgabe,
  type AufgabenTyp,
  type Darstellung,
  type LueckentextTeil,
  type Pruefergebnis,
  type SpielEinstellungen,
  type Stufe,
} from '../lib/typen'
import { Sprite } from '../gemeinsam/Sprite'
import { MONSTER, type MonsterName } from '../lib/monster'
import { KompetenzAuswahl } from './KompetenzAuswahl'
import { AntippModus } from './AntippModus'
import { antippMeldung, ausText } from '../lib/antippen'
import { FallendeWoerter } from '../gemeinsam/FallendeWoerter'

// Je Format: Name, kurze Beschreibung und Mini-Beispiel (Format-Kacheln), Standard-Arbeitsanweisung und
// Beispiel für den Texteingabe-Modus. Die Reihenfolge hier ist die Reihenfolge der Kacheln.
export const FORMATE: Record<AufgabenTyp, { name: string; kurz: string; mini: string; anweisung: string; beispiel: string }> = {
  lueckentext: {
    name: 'Lückentext',
    kurz: 'Schüler:innen tippen fehlende Wörter ein.',
    mini: 'Ich weiß, ____ du kommst.',
    anweisung: 'Ergänze die Lücken.',
    beispiel: 'Ich weiß, [dass] du heute [Rad fährst/radfährst : Rad + fahren].',
  },
  auswahl: {
    name: 'Auswahl',
    kurz: 'Schüler:innen tippen die richtige Möglichkeit an, auch mehrere.',
    mini: 'Ich weiß, [das | dass] du kommst.',
    anweisung: 'Tippe die richtige Antwort an.',
    beispiel: 'Ich weiß, [das | *dass] du kommst.\n\nWelche Wörter sind Nomen?\n[*Hund | laufen | *Baum | schnell]',
  },
  zuordnen: {
    name: 'Zuordnen',
    kurz: 'Schüler:innen markieren Wörter mit einem Kategorie-„Stift“.',
    mini: 'Hund → Nomen · läuft → Verb',
    anweisung: 'Wähle oben eine Kategorie und tippe die passenden Wörter an.',
    beispiel: 'Der [Hund = Nomen] [läuft = Verb] [schnell = Adjektiv] über die [Wiese = Nomen].',
  },
  fehler: {
    name: 'Fehler finden',
    kurz: 'Schüler:innen tippen Fehlerwörter an und verbessern sie auf Wunsch.',
    mini: 'Ich weis nicht … → weiß',
    anweisung: 'Finde die Fehler im Text.',
    beispiel: 'Ich [weis -> weiß] nicht, ob mein Bruder heute [komt -> kommt]. Wir wollen [radfahren -> Rad fahren].',
  },
  reihenfolge: {
    name: 'Reihenfolge',
    kurz: 'Schüler:innen bringen Satzbausteine in eine richtige Reihenfolge.',
    mini: 'ins Kino · gestern · gegangen · bin ich',
    anweisung: 'Bring die Bausteine in die richtige Reihenfolge.',
    beispiel:
      'Varianten: 2\ngestern | bin ich | ins Kino | gegangen.\nins Kino | bin ich | gestern | gegangen.\n\nder Hund | bellt | laut.',
  },
  // Jazz 2026-11-16: Multiple Choice ersetzt „Sätze verbessern“ (gleiche Kennung, gleiches Speicherformat 'versionen')
  ueberarbeiten: {
    name: 'Multiple Choice',
    kurz: 'Eine Frage mit mehreren Antworten. Eine oder mehrere sind richtig.',
    mini: 'Welche Wörter sind Nomen? ☐ Hund ☐ laufen ☐ Haus',
    anweisung: 'Tippe die richtigen Antworten an.',
    beispiel: 'Frage: Welche Wörter sind Nomen?\n*Hund\nlaufen\n*Haus\nHinweis: Nomen schreibt man groß.',
  },
  erklaerung: {
    name: 'Erklärung',
    kurz: 'Eine Seite, die ein Thema erklärt, mit Merkkasten und Beispielen. Steht im Paket zwischen den Übungen.',
    mini: 'Merke: „dass“ lässt sich nicht durch „dieses“ ersetzen.',
    anweisung: '',
    beispiel: '',
  },
  diktat: {
    name: 'Diktat',
    kurz: 'Schüler:innen tippen einen Text ab oder merken sich Satz für Satz und schreiben ihn aus dem Gedächtnis.',
    mini: 'Gestern war ich im Zoo. → abtippen',
    anweisung: 'Tippe den Text genau ab.',
    beispiel: 'Gestern war ich mit meiner Klasse im Zoo. | Die Affen turnten in den Bäumen, | während die Löwen schliefen. | Wann gehen wir wieder hin?',
  },
  fallende_woerter: {
    name: 'Fallende Wörter',
    kurz: 'Wörter fallen von oben. Schüler:innen tippen sie ab, bevor sie landen.',
    mini: 'Fahrrad ↓ → tippen',
    anweisung: 'Tippe die Wörter, bevor sie landen.',
    beispiel: 'Fahrrad\nRad fahren\nder Fußball\nschwimmen',
  },
}

/** Formate, die man je Runde wählen kann (Diktate, Fallende Wörter und Erklärseiten sind eigene Übungen) */
const RUNDEN_FORMATE: AufgabenTyp[] = ['lueckentext', 'auswahl', 'zuordnen', 'fehler', 'reihenfolge', 'ueberarbeiten']

/** Fallende Wörter: ein Wort oder eine Wortgruppe pro Zeile */
const woerterAus = (t: string) => t.split('\n').map((w) => w.replace(/\s+/g, ' ').trim()).filter(Boolean)

/** Aufgabenformat aus der Adresse („neu-auswahl“ → auswahl), sonst null */
export function formatAusAdresse(id: string): AufgabenTyp | null {
  const typ = id.replace(/^neu-/, '')
  return id.startsWith('neu-') && typ in FORMATE ? (typ as AufgabenTyp) : null
}

// Aufklappbarer Bereich: Anfangszustand einmal festgelegt (z. B. Erklärung offen, solange noch kein Text da ist),
// danach klappt die Lehrkraft selbst auf und zu.
function Aufklappbar(p: { offen: boolean; titel: string; klasse: string; titelKlasse: string; children: React.ReactNode }) {
  const [auf, setAuf] = useState(p.offen)
  return (
    <details className={p.klasse} open={auf} onToggle={(e) => setAuf(e.currentTarget.open)}>
      <summary className={p.titelKlasse}>{p.titel}</summary>
      {p.children}
    </details>
  )
}

const Erklaerung = ({ offen, children }: { offen: boolean; children: React.ReactNode }) => (
  <Aufklappbar offen={offen} titel="So schreiben Sie die Aufgabe" klasse="lk-erklaerung" titelKlasse="lk-aufklapp">
    {children}
  </Aufklappbar>
)

// Aufgabe anlegen oder bearbeiten (alle Formate) – wahlweise als Text mit [Klammern] oder per Formular.
export function AufgabeEditor({ aufgabeId, neuerTyp = 'lueckentext', neuGemischt = false }: { aufgabeId: string | null; neuerTyp?: AufgabenTyp; neuGemischt?: boolean }) {
  const [typ, setTyp] = useState<AufgabenTyp>(neuerTyp)
  // Jazz 2026-11-16: „Gemischt“ = jede Runde mit eigenem Format, eigener Anweisung und eigenem Tipp; sonst gilt das Format für alle Runden
  const [gemischt, setGemischt] = useState(neuGemischt)
  // Id einer hier neu angelegten Aufgabe, solange die Seite noch "neu" ist (erneutes Speichern aktualisiert sie)
  const angelegt = useRef<string | null>(null)
  const [darstellung, setDarstellung] = useState<Darstellung>('antippen')
  // Zuordnen: selbst eingetragene Kategorien (z. B. zusätzliche „Ablenker-Kategorien“), mit Komma getrennt
  const [kategorienText, setKategorienText] = useState('')
  // Fehler finden: auch die richtige Form eintippen lassen? Anzahl der Fehler anzeigen?
  const [korrigieren, setKorrigieren] = useState(false)
  const [anzahlZeigen, setAnzahlZeigen] = useState(true)
  const [titel, setTitel] = useState('')
  const [anweisung, setAnweisung] = useState(FORMATE[neuerTyp].anweisung)
  const [hinweis, setHinweis] = useState('')
  const [rueckmeldung, setRueckmeldung] = useState('')
  const [stufe, setStufe] = useState<Stufe>(2)
  const [farbig, setFarbig] = useState(true)
  const [grossKlein, setGrossKlein] = useState(true)
  // Übungsumbau: eine Übung hat mehrere Runden (Reiter), jede Runde ist ein eigener Aufgabentext im bisherigen Format
  // k = fester Schlüssel der Runde im Editor (bleibt beim Umsortieren, damit Formularfelder zu ihrer Runde gehören)
  const naechsterK = useRef(1)
  // typ: eigenes Format dieser Runde (Jazz 2026-11-15); leer = Format der Übung. anweisung/hinweis nur bei „Gemischt“
  type Runde = { k: number; text: string; typ?: AufgabenTyp; anweisung?: string; hinweis?: string }
  const neueRunde = (text = '', typ?: AufgabenTyp, anw?: string): Runde =>
    gemischt ? { k: naechsterK.current++, text, typ: typ ?? 'lueckentext', anweisung: anw ?? FORMATE[typ ?? 'lueckentext'].anweisung, hinweis: '' } : { k: naechsterK.current++, text, typ }
  const [runden, setRunden] = useState<Runde[]>(() => [neuGemischt ? { k: 0, text: '', typ: 'lueckentext', anweisung: FORMATE.lueckentext.anweisung, hinweis: '' } : { k: 0, text: '' }])
  const setRundeFeld = (i: number, teil: Partial<Runde>) => setRunden((alt) => alt.map((r, j) => (j === i ? { ...r, ...teil } : r)))
  const [aktiv, setAktiv] = useState(0)
  const text = runden[aktiv]?.text ?? ''
  const setRundeText = (i: number, neu: string) => setRunden((alt) => alt.map((r, j) => (j === i ? { ...r, text: neu } : r)))
  const setText = (neu: string) => setRundeText(aktiv, neu)
  // Gibt es schon Durchgänge von Schüler:innen zu dieser Übung? Dann fragt „Entfernen“ nach.
  const [hatErgebnisse, setHatErgebnisse] = useState(false)
  // Nach „+ Runde“ und „Kopieren“ steht der Cursor gleich im neuen Textfeld
  const [fokusK, setFokusK] = useState<number | null>(null)
  useEffect(() => {
    if (fokusK === null) return
    document.getElementById(`runde-${fokusK}`)?.focus()
    setFokusK(null)
  }, [fokusK])

  // Jazz 2026-11-16: eine neue Runde klappt die bisherigen ein (Schlüssel r.k); von Hand wieder aufklappbar
  const [zu, setZu] = useState<number[]>([])
  function rundeEinfuegen(nach: number, text = '', rtyp?: AufgabenTyp, anw?: string) {
    // Gemischt: neue Runde übernimmt das Format der Runde davor
    const neu = neueRunde(text, rtyp ?? (gemischt ? runden[nach]?.typ : undefined), anw)
    setZu(runden.map((r) => r.k))
    setRunden([...runden.slice(0, nach + 1), neu, ...runden.slice(nach + 1)])
    setAktiv(nach + 1)
    setFokusK(neu.k)
  }
  function rundeVerschieben(i: number, richtung: -1 | 1) {
    const neu = [...runden]
    const [r] = neu.splice(i, 1)
    neu.splice(i + richtung, 0, r)
    setRunden(neu)
    setAktiv(i + richtung)
  }
  function rundeEntfernen(i: number) {
    if (hatErgebnisse) {
      const ok = window.confirm(
        `Zu dieser Übung gibt es schon Ergebnisse von Schüler:innen.\n\nRunde ${i + 1} trotzdem entfernen? Sterne, Münzen und Lernstand bleiben erhalten.`,
      )
      if (!ok) return
    } else if (runden[i].text.trim() && !window.confirm(`Runde ${i + 1} mit ihrem Text entfernen?`)) return
    setRunden(runden.filter((_, j) => j !== i))
    setAktiv(Math.max(0, Math.min(aktiv, runden.length - 2)))
  }
  const [rundenJe, setRundenJe] = useState(neuerTyp === 'fallende_woerter' ? 10 : 6)
  // Einstellungen je Übung (Abschreiben: Zeichen je Herz; Fallende Wörter: Tempo, gleichzeitig, ohne Zeitdruck)
  const [spiel, setSpiel] = useState<SpielEinstellungen>({})
  const [monsterName, setMonsterName] = useState<string>('ruebchen')
  // Jazz 2026-11-15: Antippen ist Standard, die Schreibweise mit [Klammern] wählt man selbst
  const [modus, setModus] = useState<'antippen' | 'text'>('antippen')
  const [fehler, setFehler] = useState<string | null>(null)
  const [gespeichert, setGespeichert] = useState(false)
  const [geladen, setGeladen] = useState(aufgabeId === null)
  const [kompetenzIds, setKompetenzIds] = useState<Set<string>>(new Set())
  const [kompetenzIdsAlt, setKompetenzIdsAlt] = useState<Set<string>>(new Set())
  // Erklärseite: Erklärtext, Merkkasten, Beispiele (eine Zeile je Beispiel)
  const [erkl, setErkl] = useState({ text: '', merke: '', beispiele: '' })
  // Diktat: Abschreiben oder Merkdiktat (docs/SPEC-diktat.md)
  const [diktatModus, setDiktatModus] = useState<'abschreiben' | 'merken'>('abschreiben')

  useEffect(() => {
    if (!aufgabeId) return
    void supabase
      .from('aufgabe_kompetenzen')
      .select('kompetenz_id')
      .eq('aufgabe_id', aufgabeId)
      .then(({ data }) => {
        const ids = new Set((data ?? []).map((z) => z.kompetenz_id as string))
        setKompetenzIds(ids)
        setKompetenzIdsAlt(ids)
      })
    void supabase
      .from('durchgaenge')
      .select('id', { count: 'exact', head: true })
      .eq('aufgabe_id', aufgabeId)
      .then(({ count }) => setHatErgebnisse((count ?? 0) > 0))
    void supabase
      .from('aufgaben')
      .select('id, typ, titel, anweisung, farbig, hinweis, rueckmeldung_fehler, stufe, loesung, geaendert_am, monster, runden_je_durchgang, spiel')
      .eq('id', aufgabeId)
      .eq('archiviert', false)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) return setFehler(fehlerText(error))
        if (!data) return setFehler('Diese Übung gibt es nicht mehr oder sie ist archiviert.')
        const a = data as Aufgabe
        setTyp(a.typ)
        setMonsterName(a.monster)
        setRundenJe(a.runden_je_durchgang ?? 6)
        // Einstellungen gelten für die ganze Übung und stehen in jeder Runde gleich; gelesen aus der ersten
        const l = a.loesung.runden?.[0] ?? a.loesung
        setSpiel(a.spiel ?? {})
        const gespeichert = a.loesung.runden ?? [a.loesung]
        // Merkdiktat (ein Teil je Runde) und Fallende Wörter (ein Wort je Runde) bearbeitet man in einem Textfeld
        if (a.typ === 'diktat') setRunden([{ k: naechsterK.current++, text: gespeichert.map((r) => r.text).join(' | ') }])
        else if (a.typ === 'fallende_woerter') setRunden([{ k: naechsterK.current++, text: gespeichert.map((r) => r.wort ?? r.text).join('\n') }])
        else {
          // Gemischt: gespeichert als loesung.gemischt; ältere Übungen mit eigenem Format je Runde gelten auch als gemischt
          const gem = Boolean(a.loesung.gemischt) || gespeichert.some((r) => r.typ)
          setGemischt(gem)
          setRunden(
            gespeichert.map((r) => ({
              k: naechsterK.current++,
              text: r.text ?? teileZuText(r.teile),
              typ: gem ? (r.typ ?? a.typ) : undefined,
              ...(gem ? { anweisung: r.anweisung ?? a.anweisung, hinweis: r.hinweis ?? a.hinweis ?? '' } : {}),
            })),
          )
        }
        setDarstellung(l.darstellung ?? 'antippen')
        setKategorienText((l.kategorien ?? []).join(', '))
        setKorrigieren(l.korrigieren ?? false)
        setAnzahlZeigen(l.anzahl_zeigen ?? true)
        setTitel(a.titel)
        setAnweisung(a.anweisung)
        setHinweis(a.hinweis ?? '')
        setRueckmeldung(a.rueckmeldung_fehler ?? '')
        setStufe(a.stufe)
        setFarbig(a.farbig)
        setGrossKlein(l.gross_klein_beachten ?? true)
        if (l.modus) setDiktatModus(l.modus)
        if (l.erklaerung)
          setErkl({ text: l.erklaerung.text, merke: l.erklaerung.merke, beispiele: l.erklaerung.beispiele.join('\n') })
        setGeladen(true)
      })
  }, [aufgabeId])

  // Format wechseln (nur neue Aufgaben): Standard-Anweisung mitwechseln, wenn sie nicht selbst geändert wurde.
  // Der Text bleibt stehen; ein leerer Text bekommt so die passende Erklärung.
  function formatWechseln(neu: AufgabenTyp) {
    if (anweisung === FORMATE[typ].anweisung) setAnweisung(FORMATE[neu].anweisung)
    if (neu === 'fallende_woerter' && rundenJe === 6) setRundenJe(10)
    setTyp(neu)
  }

  const istErklaerung = typ === 'erklaerung'
  // Teilaufgabe 4: Erklärseiten haben einen eigenen Menüpunkt
  const liste = istErklaerung ? '/lehrkraft/erklaerungen' : '/lehrkraft/aufgaben'
  const erklaerung = {
    text: erkl.text.trim(),
    merke: erkl.merke.trim(),
    beispiele: erkl.beispiele.split('\n').map((b) => b.trim()).filter(Boolean),
  }
  // Jede Runde einzeln zerlegen; angezeigt (Formular, Vorschau) wird die gewählte Runde
  const zerlegt = useMemo(
    () =>
      runden.map(({ text: t, typ: rt }) => {
        const ty = rt ?? typ
        return typ === 'erklaerung'
          ? { teile: [], fehler: [] }
          : typ === 'diktat'
            ? { teile: [], fehler: saetzeTeilen(t).length ? [] : ['Bitte fügen Sie einen Text ein.'] }
            : typ === 'fallende_woerter'
            ? {
                teile: [],
                fehler: [
                  ...(woerterAus(t).length ? [] : ['Bitte schreiben Sie mindestens ein Wort.']),
                  ...(woerterAus(t).length > 100 ? ['Höchstens 100 Wörter.'] : []),
                  ...woerterAus(t).filter((w) => w.length > 60).map((w) => `„${w.slice(0, 20)}…“ ist zu lang (höchstens 60 Zeichen).`),
                ],
              }
            : ty === 'reihenfolge'
              ? reihenZuTeilen(t)
              : ty === 'ueberarbeiten'
                ? versionenZuTeilen(t)
                : textZuTeilen(t, ty === 'fehler' ? 'fehler' : ty === 'zuordnen')
      }),
    [runden, typ],
  )
  const { teile, fehler: textFehler } = zerlegt[aktiv] ?? zerlegt[0]
  // Runden mit Fehlern (außer der gewählten, deren Fehler direkt unter dem Textfeld stehen)
  const fehlerRunden = zerlegt.flatMap((z, i) => (z.fehler.length || !runden[i].text.trim() ? [i + 1] : []))
  // Formate, die in dieser Übung vorkommen (je Runde wählbar), und das Format der gewählten Runde
  const typen = new Set(runden.map((x) => x.typ ?? typ))
  const aktivTyp = runden[aktiv]?.typ ?? typ
  const kategorien = typen.has('zuordnen')
    ? kategorienAus(zerlegt.filter((_, i) => (runden[i].typ ?? typ) === 'zuordnen').flatMap((z) => z.teile), kategorienText.split(','))
    : undefined
  const fehlerOptionen = typen.has('fehler') ? { korrigieren, anzahl_zeigen: anzahlZeigen } : {}
  // Spalte loesung (mit Lösungen); die Schüler-Fassung (inhalt) erzeugt die Datenbank daraus
  const istDiktat = typ === 'diktat'
  const istFallend = typ === 'fallende_woerter'
  // Diktat und Fallende Wörter: ein Textfeld statt Runden-Liste
  const einFeld = istDiktat || istFallend
  const saetze = istDiktat ? saetzeTeilen(text) : []
  const woerter = istFallend ? woerterAus(text) : []
  const zeichenJeHerz = spiel.zeichen_je_herz ?? 10
  const teilGrenze = spiel.teil_grenze ?? 100
  // Gemischt: die Übung hat das Format der ersten Runde, jede andere Runde nennt ihr eigenes
  const basisTyp = gemischt ? (runden[0]?.typ ?? typ) : typ
  const rundeLoesung = (t: string, tl: LueckentextTeil[], rt?: AufgabenTyp, r?: Runde) =>
    istDiktat
      ? { text: t, gross_klein_beachten: true, teile: [], modus: diktatModus, saetze: saetzeTeilen(t) }
      : {
          text: t, gross_klein_beachten: grossKlein, darstellung, kategorien, ...fehlerOptionen,
          ...(rt && rt !== basisTyp ? { typ: rt } : {}),
          ...(gemischt && r ? { anweisung: (r.anweisung ?? '').trim(), hinweis: (r.hinweis ?? '').trim() } : {}),
          teile: tl,
        }
  // gewählte Runde (für die Vorschau)
  const loesung = istErklaerung ? { text: '', gross_klein_beachten: true, teile: [], erklaerung } : rundeLoesung(text, teile, runden[aktiv]?.typ)
  // Diktate haben keine Runden (Jazz, Schritt 6): gespeichert als eine einzige Runde, damit sie als Übung zählen
  const erklaerungLeer = !erklaerung.text && !erklaerung.merke
  // Vorschau: bei „Gemischt“ Anweisung und Tipp der gewählten Runde
  const vorschauAnweisung = gemischt ? (runden[aktiv]?.anweisung ?? '') : anweisung
  const vorschauHinweis = gemischt ? (runden[aktiv]?.hinweis ?? '') : hinweis
  const format = FORMATE[typ]
  const BEISPIEL = format.beispiel
  const hatLuecke = teile.some((t) => t.t === 'luecke') || (aktivTyp === 'fehler' && korrigieren)
  const hatAuswahl = teile.some((t) => t.t === 'auswahl')

  async function speichern() {
    setFehler(null)
    if (!titel.trim()) return setFehler('Bitte einen Titel eingeben.')
    if (istErklaerung && erklaerungLeer) return setFehler('Bitte einen Erklärtext oder einen Merksatz schreiben.')
    if (!istErklaerung && fehlerRunden.length)
      return setFehler(
        istDiktat
          ? 'Der Text fehlt noch oder hat Fehler (siehe oben).'
          : `${fehlerRunden.length === 1 ? 'Runde' : 'Runden'} ${fehlerRunden.join(', ')}: Der Aufgabentext fehlt noch oder hat Fehler.`,
      )
    const ohneAnweisung = gemischt ? runden.flatMap((r, i) => (r.anweisung?.trim() ? [] : [i + 1])) : []
    if (ohneAnweisung.length) return setFehler(`${ohneAnweisung.length === 1 ? 'Runde' : 'Runden'} ${ohneAnweisung.join(', ')}: Bitte eine Arbeitsanweisung schreiben.`)
    const datensatz = {
      typ: basisTyp,
      titel: titel.trim(),
      // Gemischt: Anweisung der ersten Runde steht auch an der Übung (Liste, Suche); der Tipp gilt nur je Runde
      anweisung: gemischt ? (runden[0].anweisung ?? '').trim() : anweisung.trim(),
      hinweis: gemischt ? null : hinweis.trim() || null,
      rueckmeldung_fehler: rueckmeldung.trim() || null,
      farbig,
      stufe,
      loesung: istErklaerung
        ? loesung
        : istDiktat && diktatModus === 'merken'
          ? // Merkdiktat: jeder Teil eine Runde (Jazz 2026-11-15)
            { runden: saetze.map((t) => ({ text: t, gross_klein_beachten: true, teile: [], modus: 'merken', saetze: [t] })) }
          : istFallend
            ? { runden: woerter.map((w) => ({ wort: w, text: w, gross_klein_beachten: true, teile: [] })) }
            : { ...(gemischt ? { gemischt: true } : {}), runden: runden.map((r, i) => rundeLoesung(r.text, zerlegt[i].teile, r.typ, r)) },
      monster: monsterName,
      runden_je_durchgang: Math.min(50, Math.max(1, Math.round(rundenJe) || 6)),
      spiel: istDiktat
        ? diktatModus === 'abschreiben'
          ? { zeichen_je_herz: Math.min(30, Math.max(5, Math.round(zeichenJeHerz) || 10)) }
          : { teil_grenze: Math.min(100, Math.max(50, Math.round(teilGrenze) || 100)) }
        : {
            ...(istFallend ? { tempo: spiel.tempo ?? 'mittel', gleichzeitig: spiel.gleichzeitig ?? 1, ohne_zeitdruck: spiel.ohne_zeitdruck ?? false } : {}),
            ...(spiel.reihenfolge ? { reihenfolge: true } : {}),
          },
    }
    const id = aufgabeId ?? angelegt.current
    const { data, error } = id
      ? await supabase.from('aufgaben').update(datensatz).eq('id', id).select('id').single()
      : await supabase.from('aufgaben').insert(datensatz).select('id').single()
    if (error) return setFehler(fehlerText(error))
    // Neue Aufgabe ist jetzt gespeichert: scheitert gleich die Kompetenz-Zuordnung, aktualisiert erneutes Speichern sie (kein zweites Anlegen)
    angelegt.current = data.id

    // Kompetenz-Zuordnung angleichen
    const entfernt = [...kompetenzIdsAlt].filter((id) => !kompetenzIds.has(id))
    const neu = [...kompetenzIds].filter((id) => !kompetenzIdsAlt.has(id))
    if (entfernt.length) {
      const r = await supabase.from('aufgabe_kompetenzen').delete().eq('aufgabe_id', data.id).in('kompetenz_id', entfernt)
      if (r.error) return setFehler(fehlerText(r.error))
    }
    if (neu.length) {
      const r = await supabase.from('aufgabe_kompetenzen').insert(neu.map((kompetenz_id) => ({ aufgabe_id: data.id, kompetenz_id })))
      if (r.error) return setFehler(fehlerText(r.error))
    }
    setKompetenzIdsAlt(new Set(kompetenzIds))
    setGespeichert(true)
    window.setTimeout(() => setGespeichert(false), 2500)
    if (!aufgabeId) gehe(`${liste}/${data.id}`)
  }

  async function loeschen() {
    if (!aufgabeId) return
    const ok = window.confirm(
      `Diese ${istErklaerung ? 'Erklärseite' : 'Übung'} endgültig löschen?\n\nSie verschwindet aus allen Paketen, und alle Ergebnisse der Schüler:innen dazu werden gelöscht.`,
    )
    if (!ok) return
    const { error } = await supabase.from('aufgaben').delete().eq('id', aufgabeId)
    if (error) setFehler(fehlerText(error))
    else gehe(liste)
  }

  if (!geladen) return fehler ? <p className="lk-hinweis" role="alert">{fehler}</p> : <p>Lädt …</p>

  return (
    <>
      <a className="lk-zurueck" href={`#${liste}`}>
        {istErklaerung ? '← Alle Erklärungen' : '← Alle Übungen'}
      </a>
      <div className="lk-zeile">
        <h1>{aufgabeId ? `${gemischt ? 'Gemischte Übung' : format.name} bearbeiten` : istErklaerung ? 'Neue Erklärseite' : gemischt ? 'Neue gemischte Übung' : 'Neue Übung'}</h1>
        {/* Format nur bei neuen Aufgaben umschaltbar – gespeicherte Antworten passen sonst nicht mehr */}
        {!aufgabeId && !istErklaerung && !gemischt && (
          <label>
            Format
            <select className="lk-feld" value={typ} onChange={(e) => formatWechseln(e.target.value as AufgabenTyp)}>
              {(Object.keys(FORMATE) as AufgabenTyp[]).filter((t) => t !== 'erklaerung').map((t) => (
                <option key={t} value={t}>
                  {FORMATE[t].name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="lk-formular">
        {/* Jazz 2026-11-16: Einordnung zuerst (legt die Grundlagen fest) */}
        <section className="lk-abschnitt">
          <h2>1 · Einordnen</h2>
          <label>
            Titel (sehen auch die Schüler:innen)
            <input className="lk-feld" value={titel} onChange={(e) => setTitel(e.target.value)} maxLength={120} placeholder="z. B. das oder dass?" />
          </label>
          {istErklaerung ? (
            // Jazz 2026-11-17: auch Erklärseiten bekommen Kompetenzen (Suche, Filter, Ordnung in der Liste); für den Lernstand zählen sie nie
            <>
              <p className="lk-leise">
                Erklärseiten zählen im Paket als erledigt, sobald Schüler:innen „Verstanden“ antippen, aber nie für den
                Lernstand. Darum gibt es hier keine Stufe. Die Kompetenzen helfen beim Suchen und Filtern.
              </p>
              <KompetenzAuswahl ausgewaehlt={kompetenzIds} onChange={setKompetenzIds} erklaerung />
            </>
          ) : (
            <>
          <fieldset>
            <legend>Stufe</legend>
            <div className="lk-reiter" role="group">
              {([1, 2, 3] as const).map((s) => (
                <button type="button" key={s} className="lk-knopf" aria-pressed={stufe === s} onClick={() => setStufe(s)} aria-label={`Stufe ${s} von 3`}>
                  {'★'.repeat(s) + '☆'.repeat(3 - s)}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Monster</legend>
            <div className="lk-reiter lk-monster" role="group" aria-label="Monster der Übung">
              {(Object.keys(MONSTER) as MonsterName[]).map((m) => (
                <button type="button" key={m} className="lk-knopf" aria-pressed={monsterName === m} onClick={() => setMonsterName(m)}>
                  <Sprite grafik={MONSTER[m].grafik} mal={MONSTER[m].mal} />
                  {MONSTER[m].name}
                </button>
              ))}
              {/* Jazz 2026-11-15: Übung ohne Monsterkampf (zählt nicht fürs Sammelalbum) */}
              <button type="button" className="lk-knopf" aria-pressed={monsterName === 'kein'} onClick={() => setMonsterName('kein')}>
                Ohne Monster
              </button>
            </div>
          </fieldset>
          <KompetenzAuswahl ausgewaehlt={kompetenzIds} onChange={setKompetenzIds} />
            </>
          )}
        </section>

        <section className="lk-abschnitt">
          <h2>2 · Inhalt</h2>
          <div className="lk-editor">
            <div className="lk-formular">
          {istErklaerung ? (
            <>
              <label>
                Erklärtext (Leerzeile = neuer Absatz; [Wort] wird hervorgehoben)
                <textarea className="lk-feld"
                  rows={6}
                  value={erkl.text}
                  onChange={(e) => setErkl({ ...erkl, text: e.target.value })}
                  placeholder="„das“ ist ein Artikel oder ein Pronomen. „dass“ ist eine Konjunktion: Es leitet einen Nebensatz ein."
                />
              </label>
              <label>
                Merkkasten (erscheint als „Merke“-Kasten)
                <textarea className="lk-feld"
                  rows={3}
                  value={erkl.merke}
                  onChange={(e) => setErkl({ ...erkl, merke: e.target.value })}
                  placeholder="Kannst du „dieses“, „jenes“ oder „welches“ einsetzen, schreibst du „das“."
                />
              </label>
              <label>
                Beispiele (ein Beispielsatz pro Zeile; [Wort] wird hervorgehoben)
                <textarea className="lk-feld"
                  rows={4}
                  value={erkl.beispiele}
                  onChange={(e) => setErkl({ ...erkl, beispiele: e.target.value })}
                  placeholder={'Ich hoffe, [dass] du kommst.\n[Das] Buch ist spannend.'}
                />
              </label>
            </>
          ) : (
          <>
          {!gemischt && (
            <label>
              Arbeitsanweisung (sehen die Schüler:innen über der Aufgabe)
              <input className="lk-feld" value={anweisung} onChange={(e) => setAnweisung(e.target.value)} />
            </label>
          )}
          <label className="lk-haken">
            <input type="checkbox" checked={farbig} onChange={(e) => setFarbig(e.target.checked)} />
            Fachbegriffe in der Anweisung farbig zeigen (z. B. „Verben“ rot)
          </label>

          <fieldset>
            <legend>{istDiktat ? 'Aufgabentext' : istFallend ? 'Wortliste' : 'Runden'}</legend>
            {istDiktat ? (
              <div className="lk-reiter" role="group" aria-label="Art des Diktats">
                <button type="button" className="lk-knopf" aria-pressed={diktatModus === 'abschreiben'} onClick={() => setDiktatModus('abschreiben')}>
                  Abschreiben
                </button>
                <button type="button" className="lk-knopf" aria-pressed={diktatModus === 'merken'} onClick={() => setDiktatModus('merken')}>
                  Merkdiktat
                </button>
              </div>
            ) : istFallend ? null : (
            // Jazz 2026-11-15: Schalter „Textmodus“ (aus = Wörter antippen, an = Text mit [Klammern])
            <button type="button" role="switch" className="lk-schalter" aria-checked={modus === 'text'} onClick={() => setModus(modus === 'text' ? 'antippen' : 'text')}>
              <span className="lk-schalter__bahn" aria-hidden="true" />
              Textmodus
            </button>
            )}

            {modus === 'text' || einFeld ? (
              <>
                <Erklaerung offen={!runden.some((r) => r.text)}>
                  {istDiktat ? (
                    <p>
                      Fügen Sie den Text ein. Beim <strong>Abschreiben</strong> steht er die ganze Zeit da; bei einem falschen
                      Zeichen wartet der Cursor auf das richtige. Beim <strong>Merkdiktat</strong> erscheint immer ein Teil,
                      nach „gemerkt“ verschwindet er und wird aus dem Gedächtnis getippt. <strong>Sie bestimmen, wo getrennt wird:</strong>{' '}
                      mit <strong>|</strong> im Text oder per Klick zwischen zwei Wörter in der Ansicht unter dem Textfeld. Es zählen Buchstaben,
                      Groß-/Kleinschreibung und Satzzeichen; „ “ und der lange Strich gelten wie " und -. Freundschaft mit dem
                      Monster ab 95 % richtig getippter Zeichen.
                    </p>
                  ) : istFallend ? (
                    <p>
                      Schreiben Sie <strong>jedes Wort oder jede Wortgruppe in eine eigene Zeile</strong>. Die Wörter fallen
                      nacheinander von oben; Schüler:innen tippen sie ab, bevor sie landen. Bei einem falschen Zeichen wartet der
                      Cursor. Ein Herz trifft nur, wenn das Wort ohne falsche Taste getippt wurde und nicht gelandet ist.
                    </p>
                  ) : typ === 'ueberarbeiten' ? (
                    <p>
                      Schreiben Sie zuerst <code>Frage: …</code> und darunter jede Antwort in eine <strong>eigene Zeile</strong>{' '}
                      (2 bis 6 Antworten). Markieren Sie jede richtige mit <strong>*</strong>, auch mehrere. Unter einer Antwort darf
                      eine Zeile <code>Hinweis: …</code> stehen, die Schüler:innen erst nach dem Prüfen sehen. Eine{' '}
                      <strong>Leerzeile</strong> beginnt eine neue Frage. Die Antworten erscheinen in der Reihenfolge, in der Sie sie schreiben.
                    </p>
                  ) : typ === 'reihenfolge' ? (
                    <p>
                      Schreiben Sie jeden Satz in die richtige Reihenfolge und trennen Sie die Bausteine mit <strong>|</strong>.
                      Gibt es weitere richtige Reihenfolgen, schreiben Sie sie in die Zeilen <strong>direkt darunter</strong>.
                      Eine <strong>Leerzeile</strong> beginnt einen neuen Satz. Schreiben Sie das erste Wort so, wie es mitten
                      im Satz stünde (z. B. <code>gestern</code>), und setzen Sie das Satzzeichen ans Ende. Schüler:innen
                      sehen Bausteine gemischt, ohne großen Satzanfang und ohne Satzzeichen. Beides erscheint erst, wenn der
                      Satz richtig ist. Die Satzart wird aus dem Satzzeichen erkannt (. ? !); sonst eine Zeile{' '}
                      <code>Satzart: Ausrufesatz</code> darüber schreiben. Sollen mehrere richtige Sätze gebildet werden,
                      schreiben Sie z. B. <code>Varianten: 2</code> darüber.
                    </p>
                  ) : typ === 'fehler' ? (
                    <p>
                      Schreiben Sie den Text und setzen Sie jedes Fehlerwort so in Klammern:{' '}
                      <strong>[Fehlerwort -&gt; Verbesserung]</strong>, z. B. <code>[weis -&gt; weiß]</code>. Mehrere richtige
                      Verbesserungen trennen Sie mit <strong>/</strong>. Für Zeichensetzung markieren Sie das Wort davor, z. B.{' '}
                      <code>[weiß -&gt; weiß,]</code>. Alle übrigen Wörter sind ebenfalls antippbar, aber fehlerfrei.
                    </p>
                  ) : typ === 'zuordnen' ? (
                    <p>
                      Schreiben Sie den Satz und setzen Sie jedes Wort oder jede Wortgruppe, die zugeordnet werden soll, so in
                      Klammern: <strong>[Wort = Kategorie]</strong>, z. B. <code>[Der kleine Hund = Subjekt]</code>. Alle
                      übrigen Wörter sind für Schüler:innen ebenfalls antippbar, gehören aber zu keiner Kategorie.
                    </p>
                  ) : typ === 'auswahl' ? (
                    <p>
                      Setzen Sie jede Auswahl in <strong>[eckige Klammern]</strong>, trennen Sie die Möglichkeiten mit{' '}
                      <strong>|</strong> und markieren Sie die richtige mit <strong>*</strong>. Mehrere <strong>*</strong> ergeben
                      eine Mehrfachauswahl. Lücken zum Eintippen (<code>[Lösung]</code>) können Sie dazwischen mischen.
                    </p>
                  ) : (
                    <p>
                      Schreiben Sie den Text und setzen Sie jedes gesuchte Wort in <strong>[eckige Klammern]</strong>. Gibt es
                      mehrere richtige Lösungen, trennen Sie sie mit <strong>/</strong>. Einen <strong>Hinweis</strong> für
                      die Schüler:innen schreiben Sie nach einem <strong>Doppelpunkt</strong>:{' '}
                      <code>[Rad fahren : Rad + fahren]</code>. Er erscheint in Klammern hinter der Lücke. Eine Auswahl zum
                      Antippen schreiben Sie so: <code>[das | *dass]</code>.
                    </p>
                  )}
                  <p>
                    Beispiel: <code>{BEISPIEL}</code>{' '}
                    <button type="button" className="lk-knopf" onClick={() => setText(BEISPIEL)}>
                      Beispiel einfügen
                    </button>
                  </p>
                </Erklaerung>
                {einFeld && (
                  <>
                    <textarea className="lk-feld"
                      rows={istFallend ? 10 : 7}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder={BEISPIEL}
                      spellCheck={false}
                      aria-label={istFallend ? 'Wortliste' : 'Aufgabentext'}
                    />
                    {diktatModus === 'merken' && text.trim() && <TrennAnsicht text={text} onChange={setText} />}
                  </>
                )}
              </>
            ) : null}

            {einFeld ? (
              <>
                {text && textFehler.length > 0 && (
                  <ul className="lk-hinweis" role="alert">
                    {textFehler.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                )}
                {text && textFehler.length === 0 && (
                  <p className="lk-leise">
                    {istFallend
                      ? `✓ ${woerter.length === 1 ? '1 Wort' : `${woerter.length} Wörter`} erkannt.`
                      : diktatModus === 'merken'
                        ? `✓ ${saetze.length === 1 ? '1 Teil' : `${saetze.length} Teile`} zum Merken.`
                        : '✓ Text erkannt.'}
                  </p>
                )}
                {istDiktat && diktatModus === 'abschreiben' && (
                  <label>
                    Ein Herz je richtig getippte Zeichen
                    <input className="lk-feld lk-feld--zahl" type="number" min={5} max={30} value={zeichenJeHerz}
                      onChange={(e) => setSpiel({ ...spiel, zeichen_je_herz: Number(e.target.value) })} />
                    <span className="lk-leise">Leerzeichen und Satzzeichen zählen mit. Erlaubt sind 5 bis 30.</span>
                  </label>
                )}
                {istFallend && (
                  <>
                    <div>
                      <p className="lk-leise" style={{ margin: 0 }}>Tempo (Zeit bis zum Boden)</p>
                      <div className="lk-reiter" role="group" aria-label="Tempo">
                        {([['langsam', 'Langsam (25 s)'], ['mittel', 'Mittel (18 s)'], ['schnell', 'Schnell (12 s)']] as const).map(([t, name]) => (
                          <button type="button" key={t} className="lk-knopf" aria-pressed={(spiel.tempo ?? 'mittel') === t} onClick={() => setSpiel({ ...spiel, tempo: t })}>
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="lk-leise" style={{ margin: 0 }}>Wie viele Wörter fallen gleichzeitig?</p>
                      <div className="lk-reiter" role="group" aria-label="Wörter gleichzeitig">
                        {([1, 2] as const).map((g) => (
                          <button type="button" key={g} className="lk-knopf" aria-pressed={(spiel.gleichzeitig ?? 1) === g} onClick={() => setSpiel({ ...spiel, gleichzeitig: g })}>
                            {g === 1 ? 'Eins' : 'Zwei'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <label className="lk-haken">
                      <input type="checkbox" checked={spiel.ohne_zeitdruck ?? false} onChange={(e) => setSpiel({ ...spiel, ohne_zeitdruck: e.target.checked })} />
                      Ohne Zeitdruck: Die Wörter sinken nur bis zur Mitte und warten dort, bis sie getippt sind.
                    </label>
                  </>
                )}
              </>
            ) : (
              <>
                {/* Alle Runden untereinander (Jazz 2026-11-15): kopieren, verschieben, entfernen; die Vorschau zeigt die zuletzt angeklickte */}
                <ol className="lk-runden">
                  {runden.map((r, i) => (
                    <li key={r.k} className="lk-runde" data-aktiv={i === aktiv || undefined} onFocusCapture={() => setAktiv(i)}>
                      <div className="lk-runde__kopf">
                        <button
                          type="button"
                          className="lk-aufklapp lk-runde__klapp"
                          aria-expanded={!zu.includes(r.k)}
                          onClick={() => setZu(zu.includes(r.k) ? zu.filter((k) => k !== r.k) : [...zu, r.k])}
                        >
                          <span aria-hidden="true">{zu.includes(r.k) ? '▸' : '▾'}</span> <strong>Runde {i + 1}</strong>
                        </button>
                        {gemischt && (
                          <select
                            className="lk-feld lk-feld--klein"
                            value={r.typ ?? typ}
                            onChange={(e) => {
                              const neu = e.target.value as AufgabenTyp
                              // Standard-Anweisung mitwechseln, wenn sie nicht selbst geändert wurde
                              setRundeFeld(i, { typ: neu, ...(r.anweisung === FORMATE[r.typ ?? typ].anweisung ? { anweisung: FORMATE[neu].anweisung } : {}) })
                            }}
                            aria-label={`Format von Runde ${i + 1}`}
                          >
                            {RUNDEN_FORMATE.map((f) => (
                              <option key={f} value={f}>
                                {FORMATE[f].name}
                              </option>
                            ))}
                          </select>
                        )}
                        <span className="lk-knopfreihe">
                          <button type="button" className="lk-knopf" onClick={() => rundeEinfuegen(i, r.text, r.typ, r.anweisung)} disabled={runden.length >= 100} aria-label={`Runde ${i + 1} kopieren`}>
                            Kopieren
                          </button>
                          <button type="button" className="lk-knopf" disabled={i === 0} onClick={() => rundeVerschieben(i, -1)} aria-label={`Runde ${i + 1} nach oben`}>
                            ↑
                          </button>
                          <button type="button" className="lk-knopf" disabled={i === runden.length - 1} onClick={() => rundeVerschieben(i, 1)} aria-label={`Runde ${i + 1} nach unten`}>
                            ↓
                          </button>
                          <button type="button" className="lk-knopf" disabled={runden.length === 1} onClick={() => rundeEntfernen(i)} aria-label={`Runde ${i + 1} entfernen`}>
                            Entfernen
                          </button>
                        </span>
                      </div>
                      {gemischt && !zu.includes(r.k) && (
                        <div className="lk-formular">
                          <label>
                            Arbeitsanweisung dieser Runde
                            <input className="lk-feld" value={r.anweisung ?? ''} maxLength={500} onChange={(e) => setRundeFeld(i, { anweisung: e.target.value })} />
                          </label>
                          <label>
                            Tipp (freiwillig)
                            <input className="lk-feld" value={r.hinweis ?? ''} maxLength={500} onChange={(e) => setRundeFeld(i, { hinweis: e.target.value })} placeholder="z. B. Kannst du „dieses“ einsetzen?" />
                          </label>
                        </div>
                      )}
                      {zu.includes(r.k) ? (
                        <p className="lk-leise lk-runde__kurz">{ausText(r.text).klar.replace(/\s+/g, ' ').trim() || '(noch leer)'}</p>
                      ) : modus === 'text' ? (
                        <textarea className="lk-feld"
                          id={`runde-${r.k}`}
                          rows={3}
                          value={r.text}
                          onChange={(e) => setRundeText(i, e.target.value)}
                          placeholder={FORMATE[r.typ ?? typ].beispiel}
                          spellCheck={false}
                          aria-label={`Aufgabentext Runde ${i + 1}`}
                        />
                      ) : (r.typ ?? typ) === 'reihenfolge' ? (
                        <ReihenFormular text={r.text} onChange={(t) => setRundeText(i, t)} />
                      ) : (r.typ ?? typ) === 'ueberarbeiten' ? (
                        <VersionenFormular text={r.text} onChange={(t) => setRundeText(i, t)} />
                      ) : (
                        <AntippModus
                          text={r.text}
                          typ={(r.typ ?? typ) as 'lueckentext' | 'auswahl' | 'zuordnen' | 'fehler'}
                          kategorien={kategorien ?? []}
                          platzhalter={ausText(FORMATE[r.typ ?? typ].beispiel).klar}
                          beschriftung={`Aufgabentext Runde ${i + 1}`}
                          onChange={(t) => setRundeText(i, t)}
                        />
                      )}
                      {r.text && zerlegt[i].fehler.length > 0 && (
                        <ul className="lk-hinweis" role="alert">
                          {zerlegt[i].fehler.map((f) => (modus === 'antippen' ? antippMeldung(f) : f)).map((f) => (
                            <li key={f}>{f}</li>
                          ))}
                        </ul>
                      )}
                      {r.text && zerlegt[i].fehler.length === 0 && <p className="lk-leise">✓ {rundeInfo(r.typ ?? typ, zerlegt[i].teile)} erkannt.</p>}
                    </li>
                  ))}
                </ol>
                <div className="lk-knopfreihe">
                  <button type="button" className="lk-knopf" disabled={runden.length >= 100} onClick={() => rundeEinfuegen(runden.length - 1)}>
                    + Runde
                  </button>
                </div>
              </>
            )}

            {hatLuecke && (
              <label className="lk-haken">
                <input type="checkbox" checked={grossKlein} onChange={(e) => setGrossKlein(e.target.checked)} />
                Groß-/Kleinschreibung wird bewertet
              </label>
            )}
            {typen.has('fehler') && (
              <div>
                <div className="lk-reiter" role="group">
                  <button type="button" className="lk-knopf" aria-pressed={!korrigieren} onClick={() => setKorrigieren(false)}>
                    Nur Fehler finden
                  </button>
                  <button type="button" className="lk-knopf" aria-pressed={korrigieren} onClick={() => setKorrigieren(true)}>
                    Finden und verbessern (eintippen)
                  </button>
                </div>
                <label className="lk-haken">
                  <input type="checkbox" checked={anzahlZeigen} onChange={(e) => setAnzahlZeigen(e.target.checked)} />
                  Anzahl der Fehler anzeigen („Finde {teile.filter((t) => t.t === 'wort' && t.korrekturen).length} Fehler“)
                </label>
              </div>
            )}
            {typen.has('zuordnen') && (
              <label>
                Kategorien („Stifte“). Die im Text verwendeten kommen automatisch dazu. Weitere als Ablenker mit Komma trennen:
                <input className="lk-feld"
                  value={kategorienText}
                  onChange={(e) => setKategorienText(e.target.value)}
                  placeholder="z. B. Nomen, Verb, Adjektiv, Artikel"
                />
                {kategorien && kategorien.length > 0 && <span className="lk-leise">Schüler:innen sehen: {kategorien.join(' · ')}</span>}
              </label>
            )}
            {hatAuswahl && (
              <div>
                <p className="lk-leise" style={{ margin: 0 }}>
                  So wählen Schüler:innen aus (Mehrfachauswahl immer per Antippen):
                </p>
                <div className="lk-reiter" role="group">
                  <button type="button" className="lk-knopf" aria-pressed={darstellung === 'antippen'} onClick={() => setDarstellung('antippen')}>
                    Antippen
                  </button>
                  <button type="button" className="lk-knopf" aria-pressed={darstellung === 'dropdown'} onClick={() => setDarstellung('dropdown')}>
                    Dropdown in der Lücke
                  </button>
                </div>
              </div>
            )}
            {!istDiktat && (
              <label>
                {istFallend ? 'Wörter pro Durchgang' : 'Runden pro Durchgang'}
                <input className="lk-feld lk-feld--zahl" type="number" min={1} max={50} value={rundenJe} onChange={(e) => setRundenJe(Number(e.target.value))} />
                <span className="lk-leise">
                  {istFallend
                    ? woerter.length > rundenJe
                      ? `Jeder Durchgang zieht ${rundenJe} von ${woerter.length} Wörtern, bevorzugt neue und früher falsche.`
                      : 'Tragen Sie mehr Wörter ein, kommen beim Wiederholen andere.'
                    : runden.length > rundenJe
                      ? `Jeder Durchgang zieht ${rundenJe} von ${runden.length} Runden, bevorzugt neue und früher falsche.`
                      : 'Tragen Sie mehr Runden ein, kommen beim Wiederholen andere Beispiele.'}
                </span>
              </label>
            )}
            {!istDiktat && (
              <label className="lk-haken">
                <input type="checkbox" checked={!spiel.reihenfolge} onChange={(e) => setSpiel({ ...spiel, reihenfolge: !e.target.checked })} />
                {istFallend ? 'Wörter zufällig mischen' : 'Runden zufällig mischen'} (sonst in Ihrer Reihenfolge)
              </label>
            )}
            {istDiktat && diktatModus === 'merken' && (
              <label>
                Ein Teil zählt als geschafft ab … % richtig getippter Zeichen
                <input className="lk-feld lk-feld--zahl" type="number" min={50} max={100} value={teilGrenze}
                  onChange={(e) => setSpiel({ ...spiel, teil_grenze: Number(e.target.value) })} />
                <span className="lk-leise">100 = nur ganz richtige Teile treffen. Ganz richtige Teile treffen immer. Freundschaft gibt es ab 95 % über alle Teile.</span>
              </label>
            )}
          </fieldset>
          </>
          )}
            </div>

            {/* Live-Vorschau: so sehen es Schüler:innen; „Prüfen“ prüft wie echt, speichert aber nichts */}
            <div className="lk-editor__vorschau">
              <h3>So sehen es Schüler:innen{!istErklaerung && !einFeld && runden.length > 1 ? ` (Runde ${aktiv + 1})` : ''}</h3>
              {istFallend && text && textFehler.length === 0 ? (
                <div className="lk-vorschau">
                  <FallendeWoerter key={JSON.stringify([woerter, spiel])} woerter={woerter} einstellungen={spiel} onWort={() => undefined} autoFocus={false} />
                  <p className="lk-leise">Probieren Sie die Wörter hier aus. In der Vorschau wird nichts gespeichert.</p>
                </div>
              ) : (istErklaerung ? !erklaerungLeer : text && textFehler.length === 0) ? (
                <div className="lk-vorschau">
                  <AufgabeBearbeiten
                    key={JSON.stringify([loesung, vorschauAnweisung, vorschauHinweis, farbig, diktatModus])}
                    aufgabe={{
                      id: aufgabeId ?? 'vorschau',
                      typ: aktivTyp,
                      titel: titel || (gemischt ? FORMATE[aktivTyp].name : format.name),
                      anweisung: vorschauAnweisung,
                      farbig,
                      hinweis: vorschauHinweis || null,
                      stufe,
                      inhalt: istErklaerung ? { teile: [], erklaerung } : istDiktat ? { teile: [], modus: diktatModus, saetze } : ohneLoesung(teile, darstellung, kategorien, fehlerOptionen),
                      versuche: 0,
                      geloest: false,
                      loesung_angesehen: false,
                    }}
                    pruefen={vorschauPruefen(aktivTyp, loesung, rueckmeldung)}
                  />
                  <p className="lk-leise">Probieren Sie die Aufgabe hier aus. In der Vorschau wird nichts gespeichert.</p>
                </div>
              ) : (
                <p className="lk-leise">
                  {text ? 'Die Vorschau erscheint, sobald der Aufgabentext keine Fehler mehr hat.' : 'Hier erscheint die Aufgabe, sobald Sie Text eingeben.'}
                </p>
              )}
            </div>
          </div>
        </section>

        {!istErklaerung && (
        <Aufklappbar
          offen={Boolean(hinweis || rueckmeldung)}
          titel={gemischt ? '3 · Extras (freiwillig): Rückmeldung' : '3 · Extras (freiwillig): Tipp und Rückmeldung'}
          klasse="editor-abschnitt"
          titelKlasse="editor-abschnitt__titel"
        >
          {!gemischt && (
            <label>
              Tipp (Schüler:innen können ihn aufklappen)
              <input className="lk-feld" value={hinweis} onChange={(e) => setHinweis(e.target.value)} placeholder="z. B. Kannst du „dieses“ oder „welches“ einsetzen?" />
            </label>
          )}
          <label>
            Rückmeldung bei Fehlern (erscheint nach falschem Prüfen)
            <input className="lk-feld"
              value={rueckmeldung}
              onChange={(e) => setRueckmeldung(e.target.value)}
              placeholder="z. B. Denk an die Ersatzprobe: „das“ kann man durch „dieses“ ersetzen."
            />
          </label>
        </Aufklappbar>
        )}

        {fehler && <p className="lk-hinweis" role="alert">{fehler}</p>}
        <div className="lk-knopfreihe">
          <button type="button" className="lk-knopf lk-knopf--haupt" onClick={() => void speichern()}>
            {gespeichert ? '✓ Gespeichert' : 'Speichern'}
          </button>
          {aufgabeId && (
            <button type="button" className="lk-knopf lk-knopf--gefahr" onClick={() => void loeschen()}>
              {istErklaerung ? 'Erklärseite löschen' : 'Übung löschen'}
            </button>
          )}
        </div>
      </div>
    </>
  )
}

/** Was in einer Runde erkannt wurde, z. B. „2 Lücken“ (steht unter jeder Runde) */
function rundeInfo(typ: AufgabenTyp, teile: LueckentextTeil[]): string {
  const zahl = (n: number, eins: string, viele: string) => `${n} ${n === 1 ? eins : viele}`
  if (typ === 'reihenfolge') return `${zahl(teile.length, 'Satz', 'Sätze')} zum Ordnen`
  if (typ === 'ueberarbeiten') return `${zahl(teile.length, 'Frage', 'Fragen')} mit Antworten`
  if (typ === 'zuordnen') return zahl(teile.filter((t) => t.t === 'einheit' && t.kategorie).length, 'Zuordnung', 'Zuordnungen')
  if (typ === 'fehler') return zahl(teile.filter((t) => t.t === 'wort' && t.korrekturen).length, 'Fehler', 'Fehler')
  const luecken = teile.filter((t) => t.t === 'luecke').length
  const auswahl = teile.filter((t) => t.t === 'auswahl').length
  return [luecken ? zahl(luecken, 'Lücke', 'Lücken') : '', auswahl ? zahl(auswahl, 'Auswahl-Stelle', 'Auswahl-Stellen') : ''].filter(Boolean).join(' und ') || 'Text ohne Lücke'
}

// Formular für „Reihenfolge“: je Satz Satzart, Anzahl Varianten und ein Feld mit den Reihenfolgen.
type SatzFeld = { satzart: string; varianten: number; zeilen: string }
const SATZARTEN = ['Aussagesatz', 'Fragesatz', 'Aufforderungssatz', 'Ausrufesatz']

function satzFeldAus(block: string): SatzFeld {
  const feld: SatzFeld = { satzart: '', varianten: 1, zeilen: '' }
  const zeilen: string[] = []
  for (const z of block.split('\n')) {
    const art = /^\s*satzart\s*:\s*(.*)$/i.exec(z)
    const anzahl = /^\s*varianten\s*:\s*(.*)$/i.exec(z)
    if (art) feld.satzart = art[1].trim()
    else if (anzahl) feld.varianten = Number(anzahl[1]) || 1
    else zeilen.push(z)
  }
  feld.zeilen = zeilen.join('\n')
  return feld
}

function satzFeldZuText(f: SatzFeld): string {
  return [...(f.varianten > 1 ? [`Varianten: ${f.varianten}`] : []), ...(f.satzart ? [`Satzart: ${f.satzart}`] : []), f.zeilen.trim()]
    .join('\n')
    .trim()
}

function ReihenFormular({ text, onChange }: { text: string; onChange: (text: string) => void }) {
  const [saetze, setSaetze] = useState<SatzFeld[]>(() => {
    const liste = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)
    return (liste.length ? liste : ['']).map(satzFeldAus)
  })
  function setzen(neu: SatzFeld[]) {
    setSaetze(neu)
    onChange(neu.filter((s) => s.zeilen.trim()).map(satzFeldZuText).join('\n\n'))
  }
  const aendern = (i: number, teil: Partial<SatzFeld>) => setzen(saetze.map((x, j) => (j === i ? { ...x, ...teil } : x)))
  return (
    <div className="lk-formular">
      {saetze.map((s, i) => (
        <div key={i} className="lk-teil lk-teil--spalte">
          <label>
            Satz {i + 1}: Satzart
            <select className="lk-feld" value={s.satzart} onChange={(e) => aendern(i, { satzart: e.target.value })}>
              <option value="">automatisch (aus . ? !)</option>
              {[...SATZARTEN, ...(s.satzart && !SATZARTEN.includes(s.satzart) ? [s.satzart] : [])].map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
          <label>
            Wie viele verschiedene richtige Sätze sollen gebildet werden?
            <input className="lk-feld"
              type="number"
              min={1}
              max={10}
              value={s.varianten}
              onChange={(e) => aendern(i, { varianten: Math.min(10, Math.max(1, Number(e.target.value) || 1)) })}
            />
          </label>
          <label>
            Bausteine in richtiger Reihenfolge, mit | getrennt, Satzzeichen ans Ende. Weitere richtige Reihenfolgen in neue Zeilen.
            <textarea className="lk-feld"
              rows={2}
              value={s.zeilen}
              onChange={(e) => aendern(i, { zeilen: e.target.value.replace(/\n\s*\n/g, '\n') })}
              spellCheck={false}
              placeholder="gestern | bin ich | ins Kino | gegangen."
            />
          </label>
          <button
            type="button"
            className="lk-knopf"
            onClick={() => setzen(saetze.filter((_, j) => j !== i))}
            aria-label={`Satz ${i + 1} entfernen`}
          >
            ✕
          </button>
        </div>
      ))}
      <div className="lk-knopfreihe">
        <button type="button" className="lk-knopf" onClick={() => setSaetze([...saetze, satzFeldAus('')])}>
          + Satz
        </button>
      </div>
    </div>
  )
}

// Formular für Multiple Choice (Jazz 2026-11-16, früher „Sätze verbessern“): je Frage 2 bis 6 Antworten, richtige ankreuzen (eine oder mehrere).
// Hinweise je Antwort gibt es nur noch im Textmodus („Hinweis: …“); vorhandene bleiben beim Bearbeiten erhalten.
const leereVersion = () => ({ text: '', hinweis: '', besser: false })

function VersionenFormular({ text, onChange }: { text: string; onChange: (text: string) => void }) {
  const [bloecke, setBloecke] = useState<VersionenBlock[]>(() => {
    const liste = versionenBloecke(text)
    return liste.length ? liste : [{ kontext: '', versionen: [leereVersion(), leereVersion()] }]
  })
  function setzen(neu: VersionenBlock[]) {
    setBloecke(neu)
    onChange(bloeckeZuText(neu))
  }
  const blockAendern = (i: number, b: VersionenBlock) => setzen(bloecke.map((x, j) => (j === i ? b : x)))
  return (
    <div className="lk-formular">
      {bloecke.map((b, i) => (
        <fieldset key={i} className="lk-teil">
          <legend>Frage {i + 1}</legend>
          <label>
            Frage
            <input className="lk-feld" value={b.kontext} onChange={(e) => blockAendern(i, { ...b, kontext: e.target.value })} placeholder="z. B. Welche Wörter sind Nomen?" />
          </label>
          <p className="lk-leise">Antworten: Kreuzen Sie jede richtige an (eine oder mehrere).</p>
          {b.versionen.map((v, j) => {
            const versionAendern = (neu: Partial<typeof v>) =>
              blockAendern(i, { ...b, versionen: b.versionen.map((x, k) => (k === j ? { ...x, ...neu } : x)) })
            return (
              <div key={j} className="lk-mc-antwort">
                <label className="lk-haken">
                  <input type="checkbox" checked={v.besser} onChange={(e) => versionAendern({ besser: e.target.checked })} />
                  richtig
                </label>
                <input className="lk-feld" value={v.text} onChange={(e) => versionAendern({ text: e.target.value })} aria-label={`Antwort ${j + 1}`} placeholder={`Antwort ${j + 1}`} />
                {b.versionen.length > 2 && (
                  <button type="button" className="lk-knopf" onClick={() => blockAendern(i, { ...b, versionen: b.versionen.filter((_, k) => k !== j) })} aria-label={`Antwort ${j + 1} entfernen`}>
                    ✕
                  </button>
                )}
              </div>
            )
          })}
          <div className="lk-knopfreihe">
            {b.versionen.length < 6 && (
              <button type="button" className="lk-knopf" onClick={() => blockAendern(i, { ...b, versionen: [...b.versionen, leereVersion()] })}>
                + Antwort
              </button>
            )}
            {bloecke.length > 1 && (
              <button type="button" className="lk-knopf" onClick={() => setzen(bloecke.filter((_, j) => j !== i))}>
                Frage {i + 1} entfernen
              </button>
            )}
          </div>
        </fieldset>
      ))}
      <div className="lk-knopfreihe">
        <button type="button" className="lk-knopf" onClick={() => setBloecke([...bloecke, { kontext: '', versionen: [leereVersion(), leereVersion()] }])}>
          + Frage
        </button>
      </div>
    </div>
  )
}

// In der Vorschau prüft die Datenbank mit derselben Logik wie bei Schüler:innen – ohne zu speichern.
function vorschauPruefen(typ: AufgabenTyp, loesung: object, rueckmeldung: string) {
  let versuche = 0
  return async (antworten: Antworten) => {
    const { data, error } = await supabase.rpc('pruefe_aufgabe', { p_typ: typ, p_loesung: loesung, p_antworten: antworten })
    if (error) throw new Error(fehlerText(error))
    const ergebnis = data as Pruefergebnis
    versuche++
    return { ergebnis, rueckmeldung: ergebnis.richtig ? null : rueckmeldung || null, versuche }
  }
}

// Merkdiktat: Trennstellen per Klick setzen (Lehrkraft 2026-11-11). Zwischen zwei Wörtern liegt je ein Knopf;
// gesetzt = blauer Strich. Die Striche im Textfeld passen sich an.
function TrennAnsicht({ text, onChange }: { text: string; onChange: (text: string) => void }) {
  const { woerter, trennungen } = woerterUndTrennungen(text)
  const umschalten = (i: number) => onChange(textAusTrennungen(woerter, trennungen.map((t, j) => (j === i ? !t : t))))
  return (
    <div className="lk-trennen">
      <div className="lk-zeile">
        <p className="lk-leise">Klicken Sie zwischen zwei Wörter, um dort zu trennen. Noch einmal klicken hebt die Trennung auf.</p>
        <button type="button" className="lk-knopf" onClick={() => onChange(nachSaetzenTrennen(text))}>
          Nach jedem Satz trennen
        </button>
      </div>
      <p className="lk-trennen__text">
        {woerter.map((w, i) => (
          <span key={i}>
            {w}
            {i < woerter.length - 1 && (
              <button
                type="button"
                className="lk-trenner"
                aria-pressed={trennungen[i]}
                aria-label={`Nach „${w}“ ${trennungen[i] ? 'nicht mehr trennen' : 'trennen'}`}
                onClick={() => umschalten(i)}
              >
                <span aria-hidden="true">{trennungen[i] ? '|' : '·'}</span>
              </button>
            )}
          </span>
        ))}
      </p>
    </div>
  )
}
