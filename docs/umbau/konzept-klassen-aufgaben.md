# Konzept: Reiter „Aufgaben“ und Hausaufgaben je Klasse

Teilaufgabe 1 (nur gelesen, nichts geändert). Branch `klassen-aufgaben` (vom Hauptstand `main`, Commit c6f21be).
`uebungsumbau`, `lehrkraftseite`, `farm-umsetzung` und `ui-umbau` sind vollständig in `main` enthalten.

Begriffe in der Oberfläche: **Aufgabe** = ein zugeteiltes Paket. **Hausaufgabe** = eine Aufgabe mit Frist und Versuchszahl.
Der Menüpunkt **„Übungen“** (Übungsliste und Editor) bleibt unverändert.

---

## 1. Bestand

### Klassenseite
- `src/lehrkraft/KlasseDetail.tsx` ist **eine lange Seite ohne Reiter**: Name, Kerncurriculum, Jahrgang, Schülertabelle
  (Pseudonym, Link, Lernstand/Zurücksetzen, Münzen, Löschen), Münzen vergeben, „Versuch früher freigeben“
  (`Freigeben.tsx`), Schüler:innen hinzufügen, Ergebnisse zurücksetzen, Klasse löschen.
- Eigene Unterseiten per Adresse: `#/lehrkraft/klassen/<id>/links` (Linkliste) und `…/lernstand` (Lernstand der Klasse).
- Schülerliste: Tabelle `schueler` (`klasse_id`, `pseudonym`, `token`), nach Pseudonym sortiert.

### Zuweisungen heute
- Tabelle `zuweisungen` (seit `20261111180000_pakete_ueben.sql`): `paket_id`, **entweder** `klasse_id` **oder** `schueler_id`,
  `owner`, `erstellt_am`. Je Paket höchstens eine Zuweisung pro Klasse und eine pro Schüler:in. RLS: `owner = auth.uid()`.
- Zugewiesen wird bisher **nur auf der Paketseite** (`PaketDetail.tsx`, „Zuweisen an“ Klasse oder einzelne Person,
  „Zuweisung entfernen“ = Zeile löschen). Die Paketliste zeigt „n× zugewiesen“.
- Löschen einer Zuweisung löscht **keine** Ergebnisse (`versuche`, `durchgaenge` hängen an der Übung, nicht an der Zuweisung).

### Was Schüler:innen sehen und wo Versuche gezählt werden
- `schueler_start` liefert alle nicht archivierten Pakete mit einer Zuweisung an die Person oder ihre Klasse,
  neueste Zuweisung zuerst. Die Startseite ist „Mein Lernweg“; darüber spricht **Einstein** (`SchuelerBereich.tsx`,
  Texte in `src/schueler/einstein.md`, z. B. `uebung-neu` mit dem Übungsnamen als Link).
- Eine Übung wird über `uebung_starten_um` gestartet: Prüfung „zugewiesen?“ (`zugewiesene_aufgabe`), dann die
  **Tagesregel**: nach einem fertigen Durchgang gilt `frei_ab` = nächster Kalendertag (Europe/Berlin, `berlin_tag`).
  Ein angefangener Durchgang wird fortgesetzt.
- **Ein Versuch = ein Durchgang** (`durchgaenge`: `begonnen_am`, `fertig_am`, `anteil`, `befreundet`, `paket_id`).
  Fertig wird er im Server, wenn die letzte Runde geprüft ist (`runde_pruefen_um` → `durchgang_beenden`), bei Diktaten
  ebenso über `durchgang_beenden`. Abbruch = Durchgang bleibt offen, zählt nicht. Das passt genau zur gewünschten Regel.
- Münzen beim Wiederholen gibt es schon heute nur für die Verbesserung (Differenz, Migration `muenzen_lernen_zaehlt`).
- „Versuch früher freigeben“ (`versuch_freigeben`) setzt nur `frei_ab` auf heute, löscht nichts.
  „Ergebnisse zurücksetzen“ (`ergebnisse_zuruecksetzen`) löscht Antworten und Lernstand, Münzen und Farm bleiben.

### Kann die Frist auf dem Server geprüft werden?
**Ja.** Alle Schritte laufen über Datenbankfunktionen, die `now()` der Datenbank benutzen (nicht die Uhr des iPads):
Start (`uebung_starten`), jede Runde (`runde_pruefen`), Ende (`durchgang_beenden`). `begonnen_am` setzt der Server.
Damit gilt: **Starten nur, wenn `now()` vor der Frist liegt**; ein vorher begonnener Durchgang darf weiterlaufen
(die Rundenprüfung fragt die Zuweisung heute ohnehin nicht neu ab). Die Geräteuhr kann die Frist nicht umgehen.
Zu beachten beim Bauen: `uebung_starten_um` dient auch zum **Fortsetzen**; dort muss ein offener Durchgang nach der
Frist weiter geöffnet werden dürfen, ein neuer nicht.

### Paketliste mit Suche, Filter, Sortierung
- `PaketListe.tsx` nutzt schon `ListenFilter` (Suche, Schulform, Doppeljahrgang, Bereich, Kompetenz) und `passt` aus
  `src/lib/filter.ts`. Die Sortierung steckt in `UebungAuswahl.tsx` (`SORTIERUNGEN`). Archivierte Pakete fehlen dort schon.
  Für den neuen Reiter werden diese Teile **wiederverwendet** (Sortierung dazu herausziehen, nicht kopieren).

### Lernstand-Darstellung für „wie gut“
- `StufenFeld` (`LernstandAnzeige.tsx`) zeigt Farbe **und** Zeichen `--` bis `++`; `stufeAusPunkte` rechnet Punkte mit den
  Grenzen aus den Einstellungen um. Nur für die Lehrkraft. Kinder sehen das nie.

---

## 2. Datenmodell (Vorschlag, erst nach Freigabe bauen)

Grundidee: **keine neue Zuteilungs-Tabelle**, sondern die vorhandene `zuweisungen` erweitern. So sehen die Paketseite,
`schueler_start` und alle bisherigen Prüfungen die neuen Zuteilungen sofort mit.

**Spalten neu in `zuweisungen`:**

| Spalte | Bedeutung |
|---|---|
| `entfernt_am timestamptz` | „Herausnehmen“ = ausblenden statt löschen. Ergebnisse, Lernstand und die Hausaufgaben-Übersicht bleiben. |
| `hausaufgabe_ab timestamptz` | Seit wann es eine Hausaufgabe ist. Nur Durchgänge, die danach **begonnen** wurden, zählen. |
| `frist timestamptz` | Ende der Hausaufgabe (gespeichert als Zeitpunkt, eingegeben und angezeigt in Europe/Berlin). |
| `versuche_erlaubt smallint` | `null` = beliebig oft, sonst 1 bis 20. |
| `freigegeben_am timestamptz` | „Unbegrenzt freigeben“: ab da normale Zuteilung, Tagesregel gilt wieder. |

**Neue kleine Tabelle `zuweisung_einzeln`** (`zuweisung_id`, `schueler_id`, `owner`, je Paar eine Zeile): alles, was nur
für **ein Kind** einer Zuteilung gilt (nach Jazz, Frage 5 und 6):
- `entfernt_am`: Kind aus einer Klassen-Zuteilung herausgenommen (die Klassen-Zuteilung bleibt bestehen).
- `neustart_ab`: Reset-Knopf. Gezählt werden nur Durchgänge, die danach begonnen wurden. So gibt es wieder die
  **ursprünglich gewährte Zahl**, ohne etwas zu löschen.
- `frist`: eigene Frist für dieses Kind (verlängert, oder neu gesetzt für ein später angelegtes Kind).
- `freigegeben_am`: nur für dieses Kind unbegrenzt freigegeben.
Wirksam ist für ein Kind immer: Angabe in `zuweisung_einzeln`, sonst die der Zuteilung.

**Neue Kinder** (Jazz, Frage 6): Ein Kind, das nach dem Zuteilen in die Klasse kommt, bekommt alle Klassen-Zuteilungen.
War die Zuteilung da schon eine Hausaufgabe (`schueler.erstellt_am` nach `hausaufgabe_ab`), ist sie für dieses Kind
**offen ohne Frist** (normale Aufgabe, Tagesregel). Die Lehrkraft kann ihm in der Klassenliste eine eigene Frist setzen.

**Status** wird berechnet, nicht gespeichert:
- *laufend*: `hausaufgabe_ab` gesetzt, nicht freigegeben, `frist` > jetzt
- *vergangen*: `frist` ≤ jetzt, nicht freigegeben
- *freigegeben*: `freigegeben_am` gesetzt (normale Aufgabe, steht in der Hausaufgaben-Ansicht unter „Vergangen“ mit dem Hinweis „freigegeben“)

**Regeln im Server:**
- Ein Kind hat je Paket **höchstens eine wirksame Zuteilung**. Teilt man ein Paket neu zu, ersetzt die neue die alte
  (die alte wird mit `entfernt_am` ausgeblendet). Klassen-Zuteilung und Einzel-Zuteilung desselben Pakets laufen so nie gegeneinander.
- Herausnehmen **für einzelne Kinder** aus einer Klassen-Zuteilung: `zuweisung_einzeln.entfernt_am` für diese Kinder;
  die Klassen-Zuteilung bleibt, neue Kinder bekommen sie weiter.
- `schueler_start` blendet aus: entfernte Zuteilungen, Hausaufgaben nach der Frist (außer mit offenem Durchgang) und
  Übungen ohne übrige Versuche (außer offen). Dazu liefert es je Hausaufgabe `frist`, `versuche_uebrig` für die Einstein-Nachricht.
- `uebung_starten_um`: Bei laufender Hausaufgabe gilt nur die Versuchszahl (Tagesregel `frei_ab` wird übergangen).
  Nach der Frist: nur Fortsetzen eines offenen Durchgangs.
- Erklärseiten im Paket haben keine Versuche und zählen nicht.

**Zugriff:** neue Spalten unter der bestehenden RLS (`owner = auth.uid()`), neue Tabelle ebenso mit `owner`.
Jede Lehrkraft sieht nur ihre Klassen. Mit-Lehrkräfte werden nicht gebaut; `owner` bleibt eine Spalte je Zeile,
so kann später eine Freigabe-Tabelle für Kolleg:innen dazukommen, ohne etwas umzubauen.

**DB-Tests** (`supabase/tests/zugriffsregeln.sql`): Frist abgelaufen → Start verweigert, offener Durchgang läuft weiter;
Versuche verbraucht → Start verweigert; Neustart gibt die volle Zahl; Freigabe → Tagesregel; fremde Lehrkraft sieht nichts;
Schüler-Funktionen geben weiter keine Lösungen heraus.

---

## 3. Bildschirm-Skizzen (Text)

### Klassenseite mit Reitern
```
← Alle Klassen
Klasse 6b
[ Schüler:innen ]  [ Aufgaben ]                     ← Reiter (bisheriger Inhalt = „Schüler:innen“)
```
Adresse `#/lehrkraft/klassen/<id>/aufgaben`, damit „Zurück“ im Browser funktioniert.

### Reiter „Aufgaben“, Ansicht „Aufgaben“
```
[ Aufgaben ] [ Hausaufgaben ]                        ← Umschalter

Zugeteilt an diese Klasse
┌──────────────────────────────────────────────────────────────────────┐
│ Wortarten 5/6 ★   ganze Klasse · seit 12.11.        [Herausnehmen ▾] │
│ Kommas ★★         4 Schüler:innen (Fuchs-07, …)     [Herausnehmen ▾] │
│                    Hausaufgabe bis Fr, 21.11., 08:00                  │
└──────────────────────────────────────────────────────────────────────┘
„Herausnehmen ▾“: für die ganze Klasse · für einzelne (Pseudonyme antippen)

Pakete
[ Zuteilen ]  (gesperrt, solange kein Haken gesetzt ist)
[Suche „Paketname …“] [Schulform ▾] [Jahrgang ▾] [Bereich ▾] [Kompetenz ▾]  Sortieren [▾]
☐ Wortarten 5/6 ★        Realschule · 5/6 · Wortarten          schon zugeteilt
☑ Kommas ★★              …
```

### Dialog „Zuteilen“
```
2 Pakete zuteilen: Kommas ★★, Satzglieder ★
Klasse  [ 6b ▾ ]                    ← vorbelegt mit der aktuellen Klasse; nur eigene Klassen
[✓] alle auswählen
[✓ Fuchs-07] [✓ Igel-11] [  Luchs-44] …          ← Pseudonyme antippen, Standard: alle
☐ Als Hausaufgabe
    Frist  [Datum] [Uhrzeit]        Versuche  ( ) beliebig oft  (•) [1]-mal je Übung
[ Abbrechen ]   [ Zuteilen ]
```

### Ansicht „Hausaufgaben“
```
[ + Hausaufgabe aus einer Aufgabe machen ]   ← Liste der zugeteilten Pakete, eines wählen, Frist + Versuche

Laufend
  Kommas ★★   bis Fr, 21.11., 08:00 Uhr · 1 Versuch je Übung · ganze Klasse   12 von 25 fertig
  …
▸ Vergangen (3)                              ← eingeklappt, neueste Frist zuerst
  Satzglieder ★   bis Mo, 10.11., 08:00 Uhr · freigegeben am 12.11.
```
„n von 25 fertig“ = Kinder, die alle Übungen mindestens einmal beendet haben (keine Punkte, nur Anzahl).

### Klassenliste einer Hausaufgabe (Klick auf eine Hausaufgabe)
```
← Hausaufgaben
Kommas ★★ · bis Fr, 21.11., 08:00 Uhr · 1 Versuch je Übung
[ Frist verlängern ]  [ Unbegrenzt freigeben ]

Pseudonym   Übung 1 „Komma bei …“      Übung 2 „…“            Versuche
Fuchs-07    [ + ]  2 Versuche          [ o ]  1 Versuch       [Versuche neu geben]
            ▸ 18.11., 14:02 · 19.11., 16:40
Igel-11     noch nicht begonnen        noch nicht begonnen    [Versuche neu geben]
```
- „wie gut“ = **bester Versuch** als `StufenFeld` (Farbe + Zeichen `--` bis `++`, wie im Lernstand).
- ▸ klappt alle Versuche mit Datum und Uhrzeit auf (Zeitpunkt = Ende des Durchgangs).
- „Versuche neu geben“ stellt die gewährte Zahl wieder her (je Kind, Nachfrage vorher).

### Schüler:innen-Startseite (Einstein-Sprechblase, wie heute oben auf „Mein Lernweg“)
```
Du hast eine wichtige Aufgabe zugeteilt bekommen! Kommas
Du hast bis Freitag, 21.11. um 08:00 Uhr Zeit, diese Aufgabe zu erledigen. Du hast einen Versuch.
```
- „Kommas“ ist der Link zum Paket. Mehrere Hausaufgaben untereinander, früheste Frist zuerst; danach der übliche Gruß.
- Satz am Ende: „Du hast einen Versuch.“ / „Du hast X Versuche.“ / „Du kannst es beliebig oft versuchen.“;
  nach dem ersten Versuch „Du hast noch X Versuche.“ (bei 1: „Du hast noch einen Versuch.“)
- Neue Texte kommen nach `src/schueler/einstein.md` (`hausaufgabe`, `hausaufgabe-versuche-…`).
- Frist vorbei oder alles verbraucht: Nachricht weg; eine angefangene Übung bleibt im Paket offen bis zum Ende.

---

## 4. Rückfragen (mit Vorschlag)

1. **Versuchszahl pro Übung oder pro Paket?** Vorschlag: **pro Übung** (X Versuche für jede Übung im Paket).
   Einstein sagt dann die kleinste noch übrige Zahl unter den Übungen, die noch nicht verbraucht sind.
2. **Dropdown Klasse im Zuteilen-Dialog:** Man kann eine **andere eigene Klasse** wählen (vorbelegt: aktuelle Klasse);
   die Schülerliste wechselt dann. Immer nur eine Klasse auf einmal. „Nicht zweigübergreifend“ heißt: **keine Auswahl
   nach Zweig** (H/R/G) und keine Auswahl über mehrere Klassen. Stimmt das?
3. **Nachträglich zur Hausaufgabe gemacht:** Nach der Frist **gesperrt, bis freigegeben** (wie jede Hausaufgabe). Vorschlag: ja.
4. **Reset-Knopf („Versuche neu geben“):** Vorschlag: **löscht nichts** (wie „Versuch früher freigeben“). Alle alten Versuche
   bleiben in der Klassenliste sichtbar und zählen weiter für den Lernstand und das „beste Ergebnis“; nur die Zählung beginnt neu.
   Gilt nur vor der Frist; nach der Frist zusätzlich „Frist verlängern“ nötig. Einverstanden?
5. **Frist verlängern:** Vorschlag: für die **ganze Zuteilung** (alle Kinder dieser Hausaufgabe). Einzelne Kinder (z. B. krank)
   bekommen eine eigene Frist, indem man sie in der Klassenliste antippt („für Fuchs-07 verlängern“). Brauchen Sie das gleich mit?
   Vorschlag: zuerst nur für alle; Einzel-Verlängerung später, wenn gewünscht.
6. **Herausnehmen für einzelne Kinder** aus einer Klassen-Zuteilung: Vorschlag wie in Abschnitt 2 (wird zu Einzel-Zuteilungen).
   Folge: Ein später neu angelegtes Kind bekommt das Paket nicht automatisch. In Ordnung?
7. **Paketseite:** Dort gibt es schon „Zuweisen an“ und „Zuweisung entfernen“. Vorschlag: bleibt, zeigt aber auch die neuen
   Zuteilungen; „Zuweisung entfernen“ blendet dann nur noch aus (löscht die Zeile nicht mehr). Einverstanden?
8. **Wann zählt ein Versuch für die Hausaufgabe?** Vorschlag: Er muss **nach dem Hausaufgaben-Beginn begonnen** und
   **bis zum Ende gespielt** sein. Ein vor der Frist begonnener Durchgang zählt auch, wenn er nach der Frist endet.
9. **Klassenseite in Reiter teilen:** Vorschlag: zwei Reiter **„Schüler:innen“** (alles wie bisher) und **„Aufgaben“**. Oder
   soll der Reiter „Aufgaben“ nur ein Abschnitt auf der bisherigen langen Seite sein?
10. **Uhrzeit-Vorgabe** beim Anlegen: Vorschlag: nächster Schultag (Mo–Fr), **08:00 Uhr**, änderbar.
11. **Gleiche Übung in zwei Paketen:** Versuche und Tagesregel hängen heute an der Übung, nicht am Paket. Ein Durchgang in der
    Hausaufgabe sperrt dieselbe Übung in einem anderen, normalen Paket bis morgen. Vorschlag: so lassen (selten, kein Umbau).

### Antworten von Jazz (2026-11-18)
Alle Vorschläge angenommen, außer:
- **Frage 5:** Frist verlängern **und** unbegrenzt freigeben geht **für einzelne Kinder oder die ganze Klasse**
  (Klassenliste: Pseudonyme antippen oder „für alle“).
- **Frage 6:** Herausnehmen einzelner Kinder lässt die Klassen-Zuteilung bestehen. **Neue Kinder bekommen alle
  Klassen-Zuteilungen**; Hausaufgaben sind für sie offen ohne Frist, bis die Lehrkraft ihnen eine eigene Frist setzt.
Umsetzung: Tabelle `zuweisung_einzeln` (Abschnitt 2) statt `hausaufgabe_neustart`.

## 5. Umfang der nächsten Teilaufgaben (zur Orientierung)
- **TA 2:** Migration (Spalten + Tabelle + Funktionen fürs Zuteilen/Herausnehmen), Reiter, Paketliste mit Filter und Sortierung,
  Zuteilen-Dialog, Herausnehmen.
- **TA 3:** Hausaufgaben-Ansicht, Anlegen/nachträglich markieren, Klassenliste, Verlängern, Freigeben, Gruppierung, Reset.
- **TA 4:** `schueler_start`, `uebung_starten_um`, Einstein-Nachricht, Sperre nach Frist, Beenden angefangener Übungen.
- **TA 5:** Gesamttest mit Testklassen und Protokoll.
