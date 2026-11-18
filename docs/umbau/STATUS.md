# Übungsumbau – Stand

## Erledigt
- **Schritt 0 – Sicherung und Arbeitsumgebung** (2026-11-13)
  - Git geprüft: `main` war sauber und gleich mit GitHub (Commit 5b1de9c).
  - Tag `vor-uebungsumbau` auf 5b1de9c gesetzt, Branch `uebungsumbau` angelegt.
  - Arbeitsplan nach `docs/umbau/ARBEITSPLAN.md` verschoben, Pfade zu Tastenheld und Assets eingetragen.
  - `usability-test/` und `sicherung-*/` in `.gitignore` (nur lokal, nie ins öffentliche Repo).
  - Hinweis in `CLAUDE.md`: beim Übungsumbau zuerst ARBEITSPLAN.md und STATUS.md lesen.
  - Datensicherung: alle 19 Tabellen (Schema `public`) als JSON nach `sicherung-2026-11-13/` (nur lokal, 2,6 MB).
    Zeilenzahl je Tabelle geprüft, z. B. aufgaben 475, pakete 180, paket_aufgaben 1752, versuche 42, schueler 7.
    Nicht gesichert: das Lehrkraft-Konto (Supabase-Anmeldung, liegt außerhalb `public`) – ändert der Umbau nicht.
- **Schritt 1 – Bestandsanalyse** (2026-11-13): `docs/umbau/analyse-wortsalat.md` (nur gelesen: Code und Live-Datenbank,
  nichts im Browser getestet). Kernpunkte: Aufgaben löschen löscht ihre Versuche (cascade) → nur markieren; Erklärseiten
  stecken als `typ = 'erklaerung'` in den alten Paketen; Leseschrift ist heute nur auf dem Gerät gespeichert.

- **Schritt 2 – Analyse Tastenheld, Assets, Lizenz** (2026-11-13): `docs/umbau/analyse-tastenheld.md` und
  `docs/umbau/asset-inventar.md` (nur gelesen, ZIP nur im Scratchpad entpackt, nichts im Browser getestet).
  Kernpunkte: TastenHeld ist reines JS ohne Framework, für Laptops; kein eigener Diktatmodus (nächster: „race“);
  Regen-Modus ohne Fehler bei Landung; keine Töne; keine Lizenzdatei (Erlaubnis des Urhebers).

- **Schritt 3 – Konzept und Plan** (2026-11-13): `docs/umbau/konzept.md`, von Jazz freigegeben (kein Code, nichts getestet).
  Übung = Zeile in `aufgaben` mit Runden in `loesung.runden`; neue Tabelle `durchgaenge`; je fertigem Durchgang ein `versuch`.

- **Schritt 4 – Archivierung** (2026-11-13): Migration `archiv` (Spalte `archiviert` in `aufgaben` und `pakete`).
  404 alte Übungen und alle 180 Pakete archiviert, die 71 Erklärseiten nicht. Nichts gelöscht: danach weiter 475 Aufgaben,
  180 Pakete, 42 Versuche, 2 Zuweisungen; `geaendert_am` der alten Aufgaben unverändert (Trigger beim Markieren aus).
  Server: `schueler_start`, `sichtbare_aufgaben`, `zugewiesene_aufgabe` (also auch Abgeben und Lösung) ohne Archiviertes;
  Erklärseiten der eigenen Lehrkraft sind ohne Paket lesbar; neue Funktion `erklaerungen_liste`.
  Lehrkraft: Aufgabenliste, Paketliste, Aufgabenauswahl im Paket ohne Archiviertes; Paket/Aufgabe per alter Adresse zeigt
  „gibt es nicht mehr oder archiviert“. Schüler:innen: Menüpunkt „Erklärungen“ (Klasse 5/6, 7/8, 9/10 aufklappbar, darin nach
  Bereich), Leerzustand „Hier kommen bald neue Übungen.“ (Übungen und Einstein auf der Startseite).
  **Getestet:** `npm run test:datenbank` → ALLE TESTS BESTANDEN (132), neuer Block 16 (Archiv, 5 Prüfungen); `npm test` 138 bestanden;
  `lint` und `build` ohne Fehler. Browser (Test-Schüler Otter-33, 1024 × 768 und 1180 × 820): Übungen leer mit neuem Satz,
  Erklärungen mit drei Gruppen, Erklärseite „Großschreibung“ geöffnet und gelesen (+5 Münzen, 115 → 120, danach „Gelesen“),
  Startseite mit neuer Begrüßung, Lernweg zeigt die alten Ergebnisse weiter, keine Fehler in der Konsole.
  **Nicht getestet:** Lehrkraft-Ansicht im Browser (braucht die echte Anmeldung der Lehrkraft); in der Datenbank geprüft:
  0 nicht archivierte Pakete, 71 sichtbare Aufgaben (= Erklärseiten).
  Nachtrag (Jazz): Aufgabenliste der Lehrkraft hat im Filter eine Auswahl **„Aufgabenart“** (z. B. nur Erklärungen)
  (`src/lib/filter.ts`, `src/lehrkraft/ListenFilter.tsx`, `src/lehrkraft/AufgabenListe.tsx`). Getestet: tsc, lint, `npm test` 138, build;
  im Browser nicht getestet (Lehrkraft-Anmeldung nötig).
  Nachtrag 2 (Jazz): Filter-Auswahl „Bereich“ heißt jetzt **„Kernkompetenz“** (Aufgaben- und Paketliste, `ListenFilter.tsx`).

- **Schritt 5 – Datenmodell und Spiellogik** (2026-11-13, ohne Oberfläche): Migration `uebungen_runden`.
  - Übung = `aufgaben` mit `loesung.runden`; neue Spalten `monster` (Standard `ruebchen`), `runden_je_durchgang` (Standard 6),
    `spiel`; Typ `fallende_woerter` erlaubt (Prüfung erst Schritt 11); `schueler.leseschrift`. Trigger schreibt `inhalt.runden` ohne Lösungen.
  - Tabelle `durchgaenge` (Lehrkraft darf nur lesen). Funktionen für Schüler:innen: `uebung_starten` (neu, fortsetzen oder „morgen“),
    `runde_pruefen` (ein Prüfen je Runde, danach Lösung dieser Runde; doppelt gesendet = altes Ergebnis). Nach der letzten Runde beendet
    der Server den Durchgang selbst (statt eigener Funktion `uebung_beenden`, sicherer bei wackligem WLAN): ein `versuch`,
    Sterne, Münzen; an die App gehen nur befreundet und Münzen, keine Prozente.
  - Lehrkraft: `versuch_freigeben(Schüler-ids, Übung oder alle)`. `ergebnisse_zuruecksetzen` löscht auch Durchgänge.
  - Münzen: ★ 20/30/40 × Anteil (abgerundet), Wiederholen nur Differenz, Freundschaft +10/15/20 einmalig, Diktat 100 % im
    Wiederholen +10/15/20. Pool bevorzugt nie gespielte, dann falsche Runden. Sterne-Regel: mindestens 2, Anteil im ersten Versuch ≥ 80 %.
  - `schueler_start` liefert je Übung zusätzlich `uebung`, `monster`, `befreundet`, `angefangen`, `morgen` und oben `leseschrift`.
  **Getestet:** `npm run test:datenbank` → ALLE TESTS BESTANDEN (146), neuer Block 17 mit 14 Prüfungen: Inhalt ohne Lösung, Start/Fortsetzen,
  Runde nur einmal prüfbar, Münzen 20 → +10 +15 → 0, Freundschaft bleibt, Kalendertag Berlin (23:59:30 gleich, 00:00:30 neuer Tag, obwohl UTC
  noch Vortag), ein Versuch je Durchgang, Pool, fremde Token/Lehrkraft, Freigabe, geänderte Übung, Sterne-Aufstieg, Zurücksetzen.
  Test 6.16 an die neue Sterne-Regel angepasst. `npm test` 138, lint, build ohne Fehler. Echte Daten danach unverändert
  (475 Aufgaben, 43 Versuche, 2 Sterne-Stufen, 690 Münzen). **Nicht getestet:** Diktat-Schwelle 95 % und 100 %-Zusatz (Diktat-Runden
  kommen in Schritt 10), Browser (keine Oberfläche in diesem Schritt).
  Nachtrag (Jazz): **Gießen** neu (Migration `giessen`, Funktion `wachstum`): jede fertige Übung +1 je richtiger Runde, mindestens +1,
  auch ohne neue Münzen; Übungs-, Freundschafts- und Diktat-Zusatzmünzen gießen nicht. Test 17.15 (+2, +1, Lehrkraft-Münzen 0);
  `npm run test:datenbank` → ALLE TESTS BESTANDEN (147). Spec in `docs/SPEC-felder.md` ergänzt.

- **Schritt 6 – Lehrkrafteditor** (2026-11-13, keine Migration):
  - Editor: Reiter „Runde 1, Runde 2 … + Runde“, darin alles wie bisher (Text mit [Klammern] oder Formular, Vorschau der gewählten Runde),
    „Runde n entfernen“ ohne Nachfrage, Feld „Runden pro Durchgang“ (Standard 6) mit Hinweis zum Pool. Gespeichert als `loesung.runden`.
    Diktate ohne Reiter, gespeichert als eine einzige Runde (zählen so als Übung).
  - Monster-Auswahl mit Bildern (10 Monster, Standard Rübchen), Bilder per `scripts/grafik-holen.mjs` nach `src/grafik/monster_*.png`
    (je eine Zeile der Ruhe-Animation), Liste in `src/lib/monster.ts`, Herkunft in `src/grafik/LIZENZ.md`.
  - Pakete: Zeilen mit kleinem Monster, Wörter „Übung“; Paket-Vorschau zeigt jede Runde als eigenen Schritt.
  - „Versuch früher freigeben“ (`src/lehrkraft/Freigeben.tsx`): Klassenseite (Pseudonyme antippen, Übung oder alle, ohne Nachfrage)
    und Lernstand-Seite der Schüler:in (je wartender Übung ein Knopf).
  - Lehrkraft-Ansicht sagt „Übung“ statt „Aufgabe“ (Menü, Liste, Neue Übung, Formatwahl, Pakete).
  **Getestet** (Browser, als Lehrkraft angemeldet, 1024 × 768 und 1180 × 820): Übung „Test: das oder dass (Runden)“ mit 3 Runden und Gespenst
  angelegt, gespeichert, neu geladen (3 Runden, Gespenst, Formular je Runde zeigt die richtige Runde); in der Datenbank 3 Runden, `inhalt`
  ohne Lösung, `ist_uebung` = ja. Merkdiktat „Test: Merkdiktat“ ohne Reiter gespeichert (1 Runde, 2 Teile, Übung = ja). „Testpaket Runden“
  (Jg. 5, Realschule) mit beiden Übungen angelegt und der Klasse „Test“ zugewiesen; Vorschau Runde 1 von 3 geprüft („dass“ → richtig).
  Freigeben: Dachs-19 (Testklasse) hat per Datenbank-Funktionen einen Durchgang beendet (gesperrt bis 14.11.) → Lernstand-Seite „Früher freigeben“
  → neuer Durchgang „offen“; zweiter Durchgang beendet → Klassenseite „Für alle freigeben“ → „✓ Freigegeben (1 Übung)“.
  Schüleransicht von Dachs-19 lädt und zeigt das Paket. `npm test` 138, lint, build ohne Fehler. Konsole ohne Fehler.
  **Nicht getestet:** Übung als Schüler:in spielen (Oberfläche kommt in Schritt 8), `npm run test:datenbank` (keine Datenbank-Änderung).
  Testdaten bleiben: zwei Testübungen, „Testpaket Runden“ (Klasse Test), zwei Durchgänge und 45 Münzen bei Dachs-19.

- **Schritt 7 – Asset-Vorbereitung Einstein „schießend“** (2026-11-13): `docs/umbau/bildprompt-einstein-schiessend.md` mit Beschreibung
  von Einstein (52 × 47, frontal, schwarzer Umriss, 15 Farben), englischem Gemini-Prompt, Nachbesserungen und Einfüge-Anleitung
  (`assets/einstein-schiessend.png`, Einbau in Schritt 8 nach `src/grafik/einstein_schiessend.png`; bis dahin Platzhalter normaler Einstein).
  Vorlagebild `assets/einstein-vorlage-gross.png` (8-fach, nur lokal, nicht im Repo). Monster-Animationen geprüft (Pixel je Einzelbild
  gezählt und angesehen): alle 10 vollständig; Fledermaus Bild 1 sitzt (ruckt), Maus und Spinne schauen nach rechts, Hurt nur bei Schleimen.
  **Nicht getestet:** den Prompt bei Gemini (erzeugt Jazz selbst). Kein Code geändert, darum kein Browser- oder Programmtest.

- **Schritt 8 – Spielansicht, Pilot Lückentext** (2026-11-13):
  - Spielszene `src/schueler/Spielszene.tsx` (180 px hoch): Wiese (Ausschnitt aus `assets/orig.png`, 2-fach), Einstein 3-fach links,
    Monster rechts mit Ruhe-Animation (16-px-Monster 6-fach, 32-px-Monster 3-fach; Maus und Spinnen gespiegelt), Herz fliegt
    (Treffer: Monster wackelt; daneben: Herz fliegt drüber, Monster hüpft). Einstein geschockt bis zum nächsten Treffer.
    Befreundet: `herz.png` schwebt über dem Monster. Bewegung reduzieren: Standbilder, Herz ohne Flug. Kein Herzzähler.
  - Ablauf `src/schueler/UebungSpiel.tsx`: `uebung_starten` → je Runde einmal „Prüfen“ (`runde_pruefen`), danach Lösung im Satz und
    „Weiter“ (Rückmeldung neben dem Knopf); oben „Runde n von m“. Abschluss: Einstein mit Satz, Münzen, „Zur nächsten Übung“ / „Zurück
    zum Paket“. Angefangener Durchgang geht nach Neuladen bei der offenen Runde weiter. Ohne Internet „Nochmal senden“.
    Heute schon gespielt: Szene mit „Morgen kannst du es noch einmal versuchen“. Andere Formate: „Diese Übung kommt bald.“
  - Paketseite: Monster statt Nummer, Herz bei Freundschaft, Stand „Neu / Angefangen / Morgen wieder / Ihr seid Freunde …“.
    „Dein nächster Schritt“ überspringt Übungen, die erst morgen wieder gehen.
  - Leseschrift: Spalte „Leseschrift“ (Haken) auf der Klassenseite; schaltet OpenDyslexic ein, solange am Gerät nichts anderes gewählt ist
    (`src/lib/leseschrift.ts` speichert jetzt auch „aus“).
  - Grafiken (`scripts/grafik-holen.mjs`): `spiel_wiese.png`, `herz_flug.png` (Sprout Lands UI Premium), Fledermaus ohne sitzendes Bild.
    `src/grafik/LIZENZ.md` ergänzt (Wiese: craftpix-Lizenz laut `License.txt` im Paket). Einstein „schiesst“ = Platzhalter Bild 0.
  **Getestet** (Browser): Kater-73 (Klasse Test, 1024 × 768): Runde 1 richtig (Herz fliegt, trifft), Runde 2 falsch (Einstein geschockt,
  Herz fliegt vorbei, Lösung „Das“ erscheint), Runde 3 richtig (Einstein wieder normal) → Abschluss mit Satz „braucht noch etwas Zeit …“,
  +20 Münzen, Kontostand 135 → 155; Paketseite „Morgen wieder“; Übung erneut öffnen → Morgen-Ansicht. Specht-01 (1180 × 820): alles richtig
  → „Juhu, ihr seid jetzt Freunde! …“, Herz über dem Gespenst, Einstein freut sich, +45 Münzen (30 + 15); Herz auf der Paketseite.
  Dachs-19 (1024 × 768): Falsch-Rückmeldung und „Weiter“ passen ohne Scrollen über die Menüleiste (Knopf unten 660 px, Menü ab 689 px);
  Neuladen mitten in der Übung → weiter bei Runde 2. Eingabefeld: autocorrect, autocapitalize, autocomplete aus, spellcheck false.
  Lehrkraft: Haken „Leseschrift“ bei Specht-01 gesetzt → Schüleransicht in OpenDyslexic; am Gerät ausgeschaltet → bleibt aus.
  Merkdiktat zeigt „Diese Übung kommt bald.“ `npm test` 138, lint, build ohne Fehler; Konsole nach der Korrektur doppelter Schlüssel ohne Fehler.
  **Nicht getestet:** „Bewegung reduzieren“ (lässt sich im Browser-Fenster nicht einstellen, nur CSS geschrieben), echtes Offline-Verhalten
  („Nochmal senden“), iPad (macht Jazz nach der Checkliste D), `npm run test:datenbank` (keine Datenbank-Änderung).
  Testdaten: Kater-73, Specht-01 und Dachs-19 haben Durchgänge und Münzen; Specht-01 hat Leseschrift an und (durch einen inzwischen
  behobenen Fehler) einen offenen Durchgang beim Merkdiktat.
  **Nachtrag Schritt 8 (Jazz, nach Ansicht):**
  - Sätze: falsche Runde „Daneben. Schau dir die richtige Lösung an!“; keine neuen Münzen „Diesmal gibt es keine neuen Münzen. Versuche dich
    zu verbessern!“ (Satz „Ihr seid schon Freunde …“ bleibt). Gespenst, Maus und Spinnen werden schon beim Ausschneiden gespiegelt (überall).
  - **Statt Einstein kämpft die Spielfigur.** Drei Figuren zur Wahl: **Grün** (bisherige), **Blau** (von Jazz umgefärbt, `assets/Female character.png`
    auf 16 × 32 zurückgerechnet), **Katze** (Basic Charakter aus Sprout Lands, auf den gleichen Aufbau gebracht). Die gewählte Figur läuft auf
    der Farm und kämpft im Spiel (5-fach): steht nach rechts, Treffer = Schritt nach vorn, daneben = dreht sich zu uns und wackelt (bis zum
    nächsten Treffer), befreundet = hüpft. Einstein spricht weiter den Satz am Ende und begrüßt auf der Startseite.
  - Neuer Reiter **„Einstellungen“** (Schüleransicht): Figur wählen (gespeichert in `schueler.figur`, Migration `figur`, Funktion `figur_waehlen`),
    Dunkler Modus und Leseschrift (vorher oben auf der Hilfe-Seite).
  - Fehler behoben (Migration `uebung_doppelt`): zwei gleichzeitige Starts derselben Übung (Doppeltipp, zwei Tabs) gaben „duplicate key“.
  **Getestet** (Browser, 1024 × 768 und 1180 × 820): Kater-73 wählt „Blau“ → in der Datenbank `blau`, Farm zeigt die blaue Figur, Treffer im
  Spiel (Schritt, Herz fliegt). Dachs-19 wählt „Katze“ → Fehlschuss: Katze dreht sich zu uns, neuer Satz. Freigeben „Für alle“ → „3 Übungen“.
  Menüleiste mit 7 Reitern passt; Hilfe ohne Schalter. `npm run test:datenbank`: ALLE TESTS BESTANDEN (148) (neuer Block 18 Figur; einmal
  vorher der bekannte Ausreißer Block 15.0, danach zweimal bestanden). `npm test` 138, lint, build ohne Fehler.
  **Nicht getestet:** gleichzeitige Starts direkt in der Datenbank (nur im Browser: Fehler weg); Figur „hüpft“ bei Freundschaft mit Blau/Katze
  (bei Grün nicht neu angesehen); iPad.
  **Nachtrag 2 (Jazz):** Blaue Figur war in der Seitenansicht unvollständig. Ursache: In der Vorlage sind Teile der Seitenansichten um ein
  halbes Pixel verrutscht; das Umrechnen prüft jetzt je Block auch das um 4 verschobene Raster, Hintergrund nur noch vom Rand her
  (helle Stellen innen bleiben). Blaue Figur, Schleime und Rübchen haben jetzt nur Farben der **Sprout-Lands-Palette** (97 Farben,
  `aufPalette` in `scripts/grafik-holen.mjs`, nächste Farbe nach „redmean“). Dadurch sind grüner und blauer Schleim und die blaue Figur
  etwas gedämpfter (die Palette hat keine kräftigen Türkis- und Blautöne). Angesehen: alle 24 Bilder der blauen Figur, Schleime und
  Rübchen vorher/nachher, blaue Figur im Spiel (1024 × 768). `npm test` 138, lint, build ohne Fehler.
  **Nachtrag 3 (Jazz):** „Blau“ ist jetzt Variante 2: die Sprout-Lands-Figur direkt umgefärbt (Haare blau, Shirt lila, Palettenfarben),
  dadurch in allen Richtungen vollständig. Die Fassung aus `assets/Female character.png` (mit Schleife) ist nicht mehr in Gebrauch.
  **Nachtrag 4 (Jazz, 2026-11-14): Spiel-Look.** Alle 7 Vorschläge angenommen, dazu Wiese in Palettenfarben.
  - Spielfenster-Rahmen (Vorschlag D, Holz mit Pfosten, `rahmen_spiel.png`, 2-fach) um Kampfszene und Farm. Farm: Rahmen liegt über dem
    äußeren Wasserstreifen der Karte (braucht keinen Platz, Antippen rechnet unverändert). Kampfszene 136 px hoch (Wiese 68 Zeilen,
    Sprout-Lands-Palette), Figur 4-fach.
  - Shop: Holzschild „Shop“, helle Tafel (`tafel.png`), Reiter (Samen, Tiere, Obstbäume, Deko, Felder, Verkaufen), Ware in Inventar-Plätzen
    (`menue_platz.png`). Sammelalbum: Holzumschlag, Reiter Pflanzen/Tiere/Deko, Papierseite bleibt, Dinge in Inventar-Plätzen.
  - Holz und Papier bleiben im dunklen Modus hell, Schrift darauf dunkel (`--color-album-tinte`). Schrift bleibt Nunito/OpenDyslexic.
  **Getestet** (Browser): Shop und Album bei 1024 × 768 (dunkel) und 1180 × 820 (hell); Farm mit Rahmen ohne Scrollbalken (672 px);
  Kampfszene mit Rückmeldung: „Weiter“ endet 682 px, Menü ab 689 px (passt ohne Scrollen); Treffer und Fehlschuss im Rahmen.
  `npm test` 138, lint, build ohne Fehler. **Nicht getestet:** iPad; Shop-Reiter „Verkaufen“ (Kater-73 hat nichts im Vorrat).
  `docs/umbau/rahmen-vorschlag.png` (Vorschaubild mit Paket-Grafiken) bleibt absichtlich ungespeichert (nicht im Repo).

- **Lehrkraftseite, Teilaufgabe 1 – Bestandsaufnahme** (2026-11-15, nur gelesen): `docs/umbau/analyse-lehrkraftseite.md`.
  Kernpunkte: Runden-Reiter gibt es in allen sechs Formaten, aber ohne Duplizieren und Umsortieren, Entfernen ohne Nachfrage;
  spielbar ist nur Lückentext; Diktat und Merkdiktat nur im Editor; Fallende Wörter fehlt ganz; Paket-Auswahl ist eine Aufklappliste
  mit 71 Einträgen (70 Erklärseiten); ungespeicherte Eingaben gehen beim Verlassen ohne Warnung verloren. 14 Vorschläge für die Eingabe.
  **Getestet** (Browser, als Lehrkraft, 1180 × 820 und 1024 × 768): siehe „Wie geprüft wurde“ in der Datei. **Nicht getestet:** alles,
  was Daten ändert (Speichern, Paket füllen, Zuweisen); Klickzahlen aus dem Code gezählt.
  Achtung: `uebungsumbau` liegt 9 Commits hinter `main`; drei eingespielte Migrationen gibt es nur auf `main`.

- **Leseschrift Andika** (2026-11-15): ersetzt OpenDyslexic auf allen Schülerseiten (`andika-latin-400/700-normal.woff2` aus
  `@fontsource/andika` 5.3.0, je 19 KB, OFL; OpenDyslexic-Dateien entfernt). **Getestet** (Browser, Dachs-19, 1024 × 768): Text und
  Überschriften in Andika, beide Schnitte geladen, kein Scrollen zur Seite, Konsole ohne Fehler.
- **Lehrkraftseite, Teilaufgabe 2 – Runden in allen Formaten** (2026-11-15, keine Migration, Speicherformat unverändert):
  - Editor: alle Runden **untereinander** statt Reiter; je Runde „Kopieren“ (Kopie direkt darunter, Cursor darin), ↑, ↓, „Entfernen“.
    Nach „+ Runde“ steht der Cursor im neuen Feld. Unter jeder Runde steht, was erkannt wurde, oder ihr Fehler. Die Vorschau zeigt die
    zuletzt angeklickte Runde (blauer Rand links). Text- und Formular-Modus gelten für alle Runden. Diktat unverändert ohne Runden.
  - Entfernen fragt nach: mit Ergebnissen „Zu dieser Übung gibt es schon Ergebnisse … Sterne, Münzen und Lernstand bleiben erhalten.“,
    sonst bei Runden mit Text „Runde n mit ihrem Text entfernen?“. Bekannte Grenze: Ergebnisse hängen an der Rundennummer; nach Entfernen
    oder Umsortieren stimmt nur „welche Runden kamen schon dran“ beim Wiederholen nicht mehr genau.
  - Spiel: Auswahl, Zuordnen, Fehler finden, Reihenfolge und Sätze verbessern laufen jetzt wie Lückentext (einmal „Prüfen“ je Runde,
    danach Lösung, Herz trifft oder fliegt vorbei). `alleBeantwortet` und `nochOffenText` aus `AufgabeBearbeiten.tsx` für beide Ansichten.
  **Getestet** (Browser): Lehrkraft 1180 × 820 (Editor auch 1024 × 768, kein Scrollen zur Seite): „Test: Auswahl das oder dass“ von Hand
  angelegt (tippen, „+ Runde“ und weitertippen ohne Klick, Kopieren, ↑, Entfernen mit Nein und Ja, Speichern, neu geladen: 3 Runden in
  der neuen Reihenfolge). Fünf weitere Testübungen (Lückentext, Zuordnen, Fehler finden, Reihenfolge, Sätze verbessern, je 3 Runden)
  per Skript in dieselben Felder eingetragen und gespeichert; Formular-Modus bei „Reihenfolge“ zeigt je Runde ihre Sätze, ↑ verschiebt
  sie mit. Nachfrage bei Übung mit Ergebnissen erscheint. „Testpaket Formate“ angelegt und Klasse „Test“ zugewiesen.
  Dachs-19 (1024 × 768) hat alle sechs Übungen durchgespielt: Auswahl, Zuordnen, Fehler finden, Reihenfolge je eine Runde absichtlich
  falsch (Lösung erscheint, „Daneben“, +20 Münzen, „Morgen wieder“); Sätze verbessern und Lückentext alles richtig („Juhu, ihr seid jetzt
  Freunde!“, +45). Münzen 65 → 235. Runde mit zwei Sätzen (Reihenfolge) geht. Konsole der Schülerseite ohne Fehler.
  `npm test` 140, lint, build ohne Fehler. **Nicht getestet:** `npm run test:datenbank` (keine Datenbank-Änderung), iPad, Ziehen der
  Bausteine mit dem Finger (nur Antippen), „Fehler finden“ mit Verbessern (eintippen), Dropdown-Auswahl, Mehrfachauswahl im Spiel.
  Aufgefallen: Beim Zuordnen steht die Lösung des letzten Wortes hinter dem Satzpunkt. In der Lehrkraft-Konsole steht weiter ein
  ungeklärter Fehler „400“ (schon vor den Änderungen).
  Testdaten: sechs Übungen „Test: …“, „Testpaket Formate“ (Klasse Test), sechs Durchgänge und 170 Münzen mehr bei Dachs-19.
- **Lehrkraftseite, Teilaufgabe 3 – Diktat, Merkdiktat, Fallende Wörter** (2026-11-15, Jazz: alle sieben Vorschläge angenommen):
  - Migration `20261115120000_diktat_fallende.sql` (eingespielt): Abschreiben = eine Runde, richtig und befreundet ab 95 %;
    Merkdiktat = **ein Teil je Runde**, Herz nur bei ganz richtigem Teil, Genauigkeit des Durchgangs über **alle Zeichen** (gewichtet);
    Fallende Wörter = ein Wort je Runde, Antwort `{fehler, gelandet}`, richtig nur ohne Fehltaste und nicht gelandet; Inhalt = nur das Wort.
    Bestehende Merkdiktate umgerechnet („Test: Merkdiktat“ hat jetzt 2 Runden). Einstellungen in `aufgaben.spiel` (keine neue Spalte).
  - Editor: neues Format „Fallende Wörter“ (Wortliste, Tempo langsam/mittel/schnell, 1 oder 2 Wörter gleichzeitig, Haken „Ohne Zeitdruck“,
    „Wörter pro Durchgang“, Standard 10) mit spielbarer Vorschau; Abschreiben mit Feld „Ein Herz je … richtig getippte Zeichen“ (5–30, Standard 10).
    Merkdiktat und Wortliste bleiben je ein Textfeld. Hilfetext „Geschafft ab 90 %“ → „Freundschaft ab 95 %“.
  - Spiel: Abschreiben (Laufband, Herz je N beim ersten Mal richtige Zeichen, Fehltaste = Fehlschuss), Merkdiktat (Teil zeigen, „Gemerkt“ oder
    Leertaste, tippen, Prüfen, danach richtiger Text mit ↻), Fallende Wörter (`src/gemeinsam/FallendeWoerter.tsx`, Fall-Logik nach TastenHeld
    rain.js; gelandete Wörter kommen einmal wieder, danach langsamer; ohne Zeitdruck warten sie in der Mitte). Einstein erklärt das neue Format.
  **Getestet** (Browser): `npm run test:datenbank` ALLE TESTS BESTANDEN (151, Block 19 neu), `npm test` 140, lint, build ohne Fehler.
  Lehrkraft (1180 × 820, Editor auch 1024 × 768 ohne Scrollen zur Seite): „Test: Abschreiben“ (5 Zeichen je Herz), „Test: Merkdiktat drei
  Teile“, „Test: Fallende Wörter“ (schnell, zwei) angelegt, gespeichert, neu geladen: alles bleibt. Vorschau der Fallenden Wörter läuft und holt
  den Cursor nicht aus der Wortliste. „Testpaket Diktat“ der Klasse Test zugewiesen. Dachs-19 (1024 × 768): Abschreiben mit einem Fehler
  (24/25 = 96 %) → befreundet, +43; Merkdiktat Teil 1 falsch („Je.“ statt „Ja.“, ↻ markiert), Teile 2 und 3 per Leertaste und Enter richtig →
  97,7 % → befreundet, +44 (Durchschnitt der Teile wäre 88,9 % gewesen); Fallende Wörter: 1 Treffer, 1 Fehltaste, 2 gelandet (kamen einmal
  wieder) → 25 %, +7, nicht befreundet. Danach „Ohne Zeitdruck“ gesetzt, Versuch freigegeben: nach 20 s ohne Tippen warten beide Wörter in
  der Mitte; alle vier richtig → befreundet, +38. Gespeicherte Durchgänge in der Datenbank nachgesehen (Anteile 0,96 / 0,977 / 0,25).
  **Nicht getestet:** iPad und Bildschirmtastatur (Tottasten ^ ´), Abschreiben und Merkdiktat ohne Internet („Nochmal senden“),
  Schüleransicht bei 1180 × 820, „Bewegung reduzieren“ (die Wörter fallen trotzdem, das ist das Spiel).
  Testdaten: drei Übungen „Test: …“, „Testpaket Diktat“ (Klasse Test), vier Durchgänge bei Dachs-19.
  Nachtrag (Jazz 2026-11-15): Einstein sagt auf der Startseite „Es gibt eine neue Übung! „…““ bzw., wenn eine schon gespielte Übung wieder
  frei ist (die wird dann zuerst vorgeschlagen), „Du hast eine Übung, bei der du weiter üben kannst! „…““ (`uebung-neu`, `uebung-verbessern`
  in `einstein.md`). Diktat-Runden laufen immer in der Reihenfolge der Lehrkraft (war schon so, DB-Test 19.2). **Getestet im iPad-Format**
  (alle Versuche von Dachs-19 freigegeben): Startseite 1180 × 820 zeigt den Verbessern-Satz mit Knopf; Merkdiktat 1180 × 820; Fallende Wörter
  820 × 1180 (Hochformat, kein Scrollen zur Seite, Tippen geht); Editor 820 × 1180. **Nicht getestet:** echtes iPad mit Bildschirmtastatur
  (sie verdeckt im Hochformat etwa die halbe Höhe; ob das Fallfeld dann sichtbar bleibt, ist offen).

## Datenorte
- **Datenbank Supabase** (Projekt `diwpqkxhmuetdpxxcoar`, Frankfurt): Klassen, Pseudonyme, Aufgaben, Pakete, Zuweisungen,
  Versuche, Lernstände, Münzen, Farm, Besitz. Aufbau nur über `supabase/migrations/` (31 Migrationen).
- **Aufgaben-Quelltexte** im Repo: `inhalte/*.txt` (21 Dateien), eingespielt per `scripts/inhalte-sql.ts`.
- **Auf dem iPad** (localStorage, nur Komfort): Leseschrift, Dunkler Modus, Entwürfe/Warteliste (`src/schueler/speicher.ts`).
- **Tastenheld:** `C:\Users\jrkug\Projekte\TastenHeld-main.zip`, Assets darin unter `TastenHeld-main\assets`.

## Zurück zum alten Stand
- Alter Stand = Tag `vor-uebungsumbau`; alles Neue nur auf Branch `uebungsumbau`; die Webseite baut nur aus `main`.
- Verwerfen: auf `main` wechseln, Branch löschen; Datenbank aus `sicherung-2026-11-13/` zurückspielen.

## Entscheidungen
- 2026-11-13 (Jazz): alle Vorschläge aus Schritt 0 angenommen (Plan verschieben, `usability-test/` ignorieren,
  Datensicherung als JSON lokal, Hinweis in CLAUDE.md). Assets = Ordner in der Tastenheld-ZIP.
- 2026-11-13 (Jazz, Schritt 1, alle Vorschläge angenommen):
  1. Archivieren = Markierung, nie löschen (Versuche/Lernstand bleiben).
  2. Erklärseiten bekommen einen eigenen Menüpunkt „Erklärungen“ für alle Schüler:innen, geordnet nach Doppeljahrgang
     und Thema (genaue Form im Konzept, Schritt 3).
  3. Leseschrift: Haken je Schüler:in durch die Lehrkraft (schaltet ein) **und** weiterhin selbst umschaltbar am Gerät
     (braucht Datenbank-Änderung, vor dem Bauen nochmal Bescheid geben).
  4. „Versuch früher freigeben“ ist ein eigener, sanfter Knopf, der nichts löscht; „Ergebnisse zurücksetzen“ bleibt wie es ist.
  5. `scripts/inhalte-sql.ts` läuft ab dem Umbau nicht mehr (würde Archiviertes zurückholen).
  6. Nach „Prüfen“ zeigt jede Runde sofort die richtige Lösung; „Lösung ansehen“ und „Nochmal prüfen“ entfallen
     (Einzelheiten im Konzept, Schritt 3).
- 2026-11-13 (Jazz, Schritt 2, alle Vorschläge mit Änderungen):
  1. **Neu bauen** in Wortsalat (React/TS, Eingabefeld, Server-Wertung); nur kleine Teile aus TastenHeld als TS übernehmen
     und mit Herkunft kennzeichnen (Fehlerzählung `Tracker`, Fall-Logik aus `rain`, fliegender Schuss, Spielschleife).
  2. Monster: Sprout-Sorry-Pack (Gespenst, Spinnen, Mäuse, Fledermäuse), craftpix-Schleime **und Rübchen**
     (`assets/chomp_idle.png`, 32 × 32, animiert). Keine Orks.
  3. Hintergrund: **`assets/Wiese.png`** (1024 × 576, eigentlich WebP), nicht die TastenHeld-Wiese.
  4. Keine Töne.
  5. TastenHeld-Erlaubnis: In `CREDITS.md` nur „Erlaubnis des Urhebers liegt vor“, ohne Namen oder Mail.
  6. Fallende Wörter: **erst einmal kein Modus ganz ohne Zeitdruck**.
- 2026-11-13 (Jazz, Schritt 3): Konzept freigegeben, alle 14 Punkte wie vorgeschlagen (siehe `konzept.md`, Abschnitt 14), außer:
  - Satz bei nicht befreundet: „Das Monster braucht noch etwas Zeit, um Freundschaft zu schließen. Morgen kannst du es noch einmal versuchen!“
  - Hintergrund ist **`assets/orig.png`** (576 × 324), Quelle https://free-game-assets.itch.io/nature-landscapes-free-pixel-art,
    frei verfügbar (ersetzt `Wiese.png` aus Schritt 2).
  - Kurz: Münzen ★ 20/30/40 × Anteil, Freundschaft +10/15/20 einmalig, Wiederholen nur Differenz, Diktat 100 % im Wiederholen +10/15/20;
    6 Runden je Durchgang mit Pool; Abschreiben ein Herz je Wort; Sterne-Aufstieg ab 2 Übungen je Bereich und Stufe;
    Standard-Monster Rübchen; ohne Internet „Nochmal senden“.
- 2026-11-13 (Jazz, Schritt 4): Archivieren per Migration wie vorgeschlagen; **kein** zusätzlicher Export nach `archiv/`
  (Texte in `inhalte/*.txt`, Sicherung lokal); alte Ergebnisse zählen weiter im Lernstand; Menüpunkt „Erklärungen“ zwischen
  Übungen und Lernweg, Erklärseiten bleiben in der Aufgabenliste der Lehrkraft.
- 2026-11-13 (Jazz, Schritt 5, alle Vorschläge): Migration wie im Konzept; Übung = hat Runden, Erklärseiten bleiben; Diktat-Feinheiten in
  Schritt 10, Fallende Wörter in Schritt 11; Münzen erst am Ende eines Durchgangs; geänderte Übung → angefangener Durchgang beginnt neu;
  Zurücksetzen löscht auch Durchgänge; Sterne-Aufstieg ab 2 Übungen sofort.
- 2026-11-13 (Jazz, Schritt 6, alle Vorschläge, dazu): **Diktate zählen immer als Übung und haben keine Runden.** Herzen:
  Abschreiben (fortlaufend) **ein Herz je 10 richtige Zeichen** (ersetzt „ein Herz je Wort“ aus dem Konzept), Merkdiktat ein Herz je
  richtig abgeschicktem Teil. Umsetzung in Schritt 10. Freigeben ohne Nachfrage. Leseschrift-Haken je Schüler:in erst in Schritt 8.
- 2026-11-13 (Jazz, Schritt 7, alle Vorschläge): Einstein **wirft** das Herz mit ausgestrecktem Arm nach rechts (keine Waffe), Herz nicht im Bild,
  ein einziges Bild, Prompt auf Englisch; Datei `assets/einstein-schiessend.png`. Fledermaus (nur Bilder 2–5) und Spiegeln von Maus/Spinne
  in Schritt 8. Schleime grün, blau und Feuer bleiben.
- 2026-11-13 (Jazz, Schritt 8, alle Vorschläge): Pilot Lückentext; Satz befreundet „Juhu, ihr seid jetzt Freunde! Das Monster hat sich über
  deine Herzen gefreut.“; Ablauf und Größen wie vorgeschlagen; fliegendes Herz aus Sprout Lands; Paketseite mit Monster; Leseschrift-Haken
  auf der Klassenseite; kein TastenHeld-Code, darum noch keine `CREDITS.md`.
- 2026-11-13 (Jazz, Nachtrag Schritt 8): Spielfigur kämpft statt Einstein; Figuren Grün, Blau, Katze (Namen ohne Geschlecht), Wahl im neuen
  Reiter „Einstellungen“ (dort auch Dunkler Modus und Leseschrift), gespeichert je Schüler:in in der Datenbank. Blaue Figur hat Jazz selbst
  mit einem Bildeditor umgefärbt. Gespenst, Maus, Spinnen gespiegelt; Sätze siehe Erledigt.
- 2026-11-15 (Jazz, Lehrkraftseite Teilaufgabe 1): Eine Runde darf mehrere Sätze enthalten (schwerere Runden).
  Gesucht: Ersatz für OpenDyslexic, LRS-freundlich, passend zum Look der Schülerseiten (Vorschläge gemacht, Entscheidung offen).
- 2026-11-15 (Jazz, Teilaufgabe 3, alle Vorschläge): Diktat und Fallende Wörter sind **zwei getrennte Formate**; Abschreiben ein Herz je
  10 beim ersten Mal richtige Zeichen (Lehrkraft stellt 5–30 ein); 95 % = richtige Stellen ÷ alle Stellen; Merkdiktat Herz je ganz richtigem
  Teil, Freundschaft ab 95 % über alle Zeichen; Fallende Wörter mit Wortliste, Tempo, 1/2 gleichzeitig, 10 je Durchgang, alles stellt die
  Lehrkraft ein; **Modus ohne Zeitdruck** als Haken je Übung (Wörter warten in der Mitte), Freundschaft nur wenn alle Wörter richtig;
  Migration freigegeben. Neu gewünscht: **Übungen ohne Monsterkampf anlegen** (noch nicht gebaut, Rückfrage offen).

## Geänderte Dateien
- Lehrkraftseite Teilaufgabe 3: `supabase/migrations/20261115120000_diktat_fallende.sql` (neu), `supabase/tests/zugriffsregeln.sql`,
  `src/gemeinsam/FallendeWoerter.tsx` (neu), `src/gemeinsam/DiktatAnzeige.tsx`, `src/schueler/UebungSpiel.tsx`, `src/schueler/SchuelerBereich.tsx`,
  `src/schueler/einstein.md`, `src/lehrkraft/AufgabeEditor.tsx`, `src/lehrkraft/AufgabenListe.tsx`, `src/lib/typen.ts`, `src/design/bausteine.css`,
  `docs/umbau/STATUS.md`, `CLAUDE.md`
- Andika: `src/design/fonts/` (2 neu, Lizenz neu, 3 OpenDyslexic entfernt), `src/design/tokens.css`, `src/design/bausteine.css`, `CLAUDE.md`
- Lehrkraftseite Teilaufgabe 2: `src/lehrkraft/AufgabeEditor.tsx`, `src/design/lehrkraft.css`, `src/gemeinsam/AufgabeBearbeiten.tsx`,
  `src/schueler/UebungSpiel.tsx`, `docs/umbau/STATUS.md`
- Lehrkraftseite Teilaufgabe 1: `docs/umbau/analyse-lehrkraftseite.md` (neu), `docs/umbau/STATUS.md`
- Schritt 0: `docs/umbau/STATUS.md`, `docs/umbau/ARBEITSPLAN.md` (neu), `.gitignore`, `CLAUDE.md`
- Schritt 1: `docs/umbau/analyse-wortsalat.md` (neu), `docs/umbau/STATUS.md`
- Schritt 2: `docs/umbau/analyse-tastenheld.md` (neu), `docs/umbau/asset-inventar.md` (neu), `docs/umbau/STATUS.md`

- Schritt 3: `docs/umbau/konzept.md` (neu), `docs/umbau/asset-inventar.md`, `docs/umbau/STATUS.md`
- Schritt 4: `supabase/migrations/20261113140000_archiv.sql` (neu), `supabase/tests/zugriffsregeln.sql`,
  `src/schueler/Erklaerungen.tsx` (neu), `src/schueler/SchuelerBereich.tsx`, `src/schueler/speicher.ts`, `src/schueler/einstein.md`,
  `src/gemeinsam/Symbol.tsx`, `src/design/bausteine.css`, `src/lehrkraft/AufgabenListe.tsx`, `src/lehrkraft/PaketListe.tsx`,
  `src/lehrkraft/PaketDetail.tsx`, `src/lehrkraft/AufgabeEditor.tsx`, `docs/umbau/STATUS.md`
  Nachträge: `src/lib/filter.ts`, `src/lehrkraft/ListenFilter.tsx`, `src/lehrkraft/AufgabenListe.tsx`
- Schritt 5: `supabase/migrations/20261113150000_uebungen_runden.sql` (neu), `supabase/tests/zugriffsregeln.sql`, `docs/umbau/STATUS.md`
  Nachtrag Gießen: `supabase/migrations/20261113160000_giessen.sql` (neu), `supabase/tests/zugriffsregeln.sql`, `docs/SPEC-felder.md`
- Schritt 6: `src/lehrkraft/AufgabeEditor.tsx`, `src/lehrkraft/PaketDetail.tsx`, `src/lehrkraft/Freigeben.tsx` (neu),
  `src/lehrkraft/KlasseDetail.tsx`, `src/lehrkraft/Lernstand.tsx`, `src/lehrkraft/AufgabenListe.tsx`, `src/lehrkraft/PaketListe.tsx`,
  `src/lehrkraft/FormatWahl.tsx`, `src/lehrkraft/LehrkraftRahmen.tsx`, `src/lib/monster.ts` (neu), `src/lib/typen.ts`,
  `src/design/lehrkraft.css`, `scripts/grafik-holen.mjs`, `src/grafik/index.ts`, `src/grafik/monster_*.png` (10 neu), `src/grafik/LIZENZ.md`,
  `docs/umbau/konzept.md`, `docs/umbau/STATUS.md`
- Schritt 7: `docs/umbau/bildprompt-einstein-schiessend.md` (neu), `docs/umbau/STATUS.md`
- Schritt 8: `src/schueler/Spielszene.tsx` (neu), `src/schueler/UebungSpiel.tsx` (neu), `src/schueler/SchuelerBereich.tsx`,
  `src/gemeinsam/Einstein.tsx`, `src/lib/monster.ts`, `src/lib/typen.ts`, `src/lib/leseschrift.ts`, `src/lehrkraft/KlasseDetail.tsx`,
  `src/design/bausteine.css`, `scripts/grafik-holen.mjs`, `src/grafik/index.ts`, `src/grafik/spiel_wiese.png` (neu), `src/grafik/herz_flug.png` (neu),
  `src/grafik/monster_fledermaus.png`, `src/grafik/LIZENZ.md`, `docs/umbau/STATUS.md`
  Nachtrag: `supabase/migrations/20261113170000_figur.sql` (neu), `supabase/migrations/20261113180000_uebung_doppelt.sql` (neu),
  `supabase/tests/zugriffsregeln.sql`, `src/lib/figur.ts` (neu), `src/schueler/Einstellungen.tsx` (neu), `src/schueler/Hilfe.tsx`, `src/schueler/Farm.tsx`,
  `src/gemeinsam/Symbol.tsx`, `src/grafik/figur_blau.png` (neu), `src/grafik/figur_katze.png` (neu), `src/grafik/monster_gespenst.png`,
  `src/grafik/monster_maus.png`, `src/grafik/monster_spinne_*.png`

## Offene Fragen
- Übungen ohne Monsterkampf (Wunsch Jazz 2026-11-15): Was zeigt die Übung statt Monster und Herzen, zählt Freundschaft/Sammelalbum? Rückfrage gestellt.
- Merkdiktat: Die Arbeitsanweisung bleibt „Tippe den Text genau ab.“, wenn man im Editor auf „Merkdiktat“ umschaltet (von Hand ändern).
- Editor-Vorschau des Merkdiktats nutzt noch den alten Ablauf (Teil mit Fehler wird neu gemerkt); im Spiel gilt der neue.

- Bitte im Browser als Lehrkraft prüfen: Aufgabenliste zeigt nur die 71 Erklärseiten, Paketliste ist leer.
- „Mein Lernweg“ sagt unter „Dein nächster Schritt“ weiter „Mach weiter mit deinen Übungen. Weiter üben“, auch wenn es gerade
  keine Übungen gibt. Erledigt sich mit den neuen Übungen; sonst später anpassen.
- DB-Test Block 15 (Belohnungen, Igel-11) schlug einmal fehl (1 / 1) und lief danach dreimal durch; vermutlich zeitabhängig. Beobachten.
- Erklärungen sind innerhalb einer Klassenstufe alphabetisch nach Bereich geordnet (Rechtschreibung, Satzglieder …).

- Einstein „schießt“ entfällt (die Spielfigur kämpft). `assets/einstein-schiessend.webp` bleibt ungenutzt liegen.
- Die blaue Figur ist aus einem unscharfen Großbild zurückgerechnet; einzelne Bilder haben kleine Pixelfehler. Bei Bedarf sauberere Vorlage
  (16 × 32 je Bild, durchsichtig) nach `assets/` legen.
- Einsteins Format-Erklärung beim ersten Mal entfällt im Spiel (Platz); ggf. in Schritt 9 wieder einbauen.

## Nächster Schritt
- Lehrkraftseite (Branch **`lehrkraftseite`**, ab 2026-11-15; `main` ist in `uebungsumbau` geholt, Commit 820a2d0, danach
  `npm test` 140, lint, build ohne Fehler, `npm run test:datenbank` ALLE TESTS BESTANDEN (148)).
  Jazz 2026-11-15: **sechs Teilaufgaben** in der Reihenfolge von „fertig, wenn“ (1 Analyse, 2 Runden in allen Formaten samt Spielansicht
  für die fünf fehlenden Formate, 3 Diktat und Fallende Wörter, 4 Erklärungen als eigener Menüpunkt, 5 Paket mit Suche/Filter/Sortierung,
  6 Eingabe verbessern). Leseschrift: **Andika** ersetzt OpenDyslexic (noch nicht eingebaut, Schriftdatei muss erst geholt werden).
  Die Arbeit an der Lehrkraftseite läuft auf `lehrkraftseite`, nicht mehr auf `uebungsumbau` (Wunsch von Jazz, weicht von A.5 ab).
  Teilaufgabe 2 und 3 sind fertig. Offen aus Teilaufgabe 3: **Übungen ohne Monsterkampf** (Rückfrage an Jazz gestellt, danach bauen).
  Danach **Teilaufgabe 4** (Erklärungen als eigener Menüpunkt der Lehrkraft), zuerst Rückfragen.
- Jazz testet auf dem iPad (Checkliste D im Arbeitsplan), danach Schritt 9 – alle bestehenden Aufgabenformate anbinden.
- 2026-11-15 (Jazz): alle sechs Vorschläge angenommen (Mischen-Haken, ohne Monster, Merkdiktat-Grenze je Teil, Formate pro Runde,
  Monster auf der Farm, Reihenfolge 2 → 5 → 3 → 1 → 4). Einstein: Übungsname im Satz ist der Link, kein eigener Knopf mehr (erledigt,
  im Browser geprüft). **Alle fünf Wünsche sind jetzt gebaut** (siehe unten). Als Nächstes: **Teilaufgabe 4**, zuerst Rückfragen.
- **Wünsche von Jazz nach Teilaufgabe 3** (2026-11-15, Migrationen `20261115140000_runden_optionen`, `20261115150000_farm_monster`,
  `20261115160000_farm_monster_einmal`, eingespielt):
  - **Formate pro Runde:** Jede Runde hat im Editor eine Auswahl „Format“ (die sechs Standardformate). Gespeichert als `loesung.runden[i].typ`,
    nur wenn es vom Format der Übung abweicht; Inhalt je Runde nennt das Format. Server prüft und zeigt die Lösung im Format der Runde.
  - **„Runden zufällig mischen“** (Haken, Standard an; bei Fallenden Wörtern „Wörter …“). Aus = Reihenfolge der Lehrkraft (`spiel.reihenfolge`),
    die Auswahl bei mehr Runden als „pro Durchgang“ bleibt.
  - **Merkdiktat-Grenze:** „Ein Teil zählt als geschafft ab … %“ (50–100, Standard 100, `spiel.teil_grenze`); ganz richtige Teile treffen immer.
    Nach einem Teil mit Fehlern erscheint der richtige Text mit ↻ immer, auch wenn das Herz getroffen hat.
  - **Ohne Monster:** Knopf „Ohne Monster“ (`monster = 'kein'`): kein Kampfbild, „Richtig!“ ohne Monster-Satz, Ende „Geschafft! Du hast alles richtig
    gemacht.“, Paketliste mit Nummer/Häkchen; zählt nicht fürs Sammelalbum und nicht fürs Farm-Monster.
  - **Monster auf der Farm:** mit demselben Monster in 4 verschiedenen Übungen befreundet → Fenster „Ein Monster möchte bei dir wohnen!“, Monster steht
    unten zwischen Baum und Hühnerstall (`MONSTER_PLATZ` 12/12). Montags und donnerstags (beim Öffnen der Farm) liegt ein zufälliger Shop-Samen daneben;
    Einsammeln macht daraus einen Samen zum Pflanzen. Nach einer Pause nur ein Samen, nicht alle verpassten. Wechseln unter „Farm einrichten“.
  - DB-Test: Block 20 (Formate pro Runde, Reihenfolge, Grenze, ohne Monster) und 21 (Farm-Monster), Block 15 legt Igel-11 und seine Aufgaben selbst an,
    wenn sie in der echten Datenbank fehlen (fehlten nach dem Aufräumen). **ALLE TESTS BESTANDEN (158).** `npm test` 140, lint, build ohne Fehler.
  **Getestet** (Browser): Lehrkraft 1180 × 820: „Test: Zwei Formate ohne Monster“ (Runde 1 Lückentext, Runde 2 Auswahl, Mischen aus, ohne Monster) angelegt,
  gespeichert, neu geladen, alles da; Merkdiktat-Grenze 60 % gespeichert. Dachs-19 (1024 × 768): Zwei-Formate-Übung in Reihenfolge, ohne Kampfbild,
  „Geschafft!“, +45; Merkdiktat „Je.“ statt „Ja.“ trifft bei 60 %, ↻-Text erscheint; Farm: Rübchen zieht ein (Dachs-19 hatte schon 4 Rübchen-Freundschaften),
  Willkommens-Fenster, Samen liegt daneben, Einsammeln geht. Gefunden und behoben: zwei gleichzeitige Farm-Aufrufe legten zwei Samen hin.
  iPad-Hochformat 820 × 1180: „Farm einrichten“ mit Monster-Wahl, Paketliste; kein Scrollen zur Seite, Konsole ohne Fehler.
  **Nicht getestet:** Monster wechseln mit zwei möglichen Monstern (Dachs-19 hat nur Rübchen; DB-Test prüft das Wählen), Formular-Modus bei gemischten
  Formaten, echtes iPad. Testdaten: „Test: Zwei Formate ohne Monster“ im „Testpaket Diktat“, Rübchen auf der Farm von Dachs-19, 1 Salat-Samen.
- **Farm-Wünsche von Jazz** (2026-11-15, Teil 1 von 3 der neuen Liste: Farm, dann Fallende Wörter, dann Lehrkraft; alle Vorschläge angenommen):
  - **Monster-Größe:** höchstens so groß wie die Spielfigur (21 Pixel). Rübchen (25) und Schleime (23) werden in halben Stufen verkleinert
    (`farm` in `src/lib/monster.ts`, `farmMal`); Spinnen, Maus, Gespenst, Fledermaus bleiben (Spinnen und Maus sind so groß wie ein Huhn).
  - **Hütte links unten** (`huette.png`, Village pack „small hut“, 9 Dachfarben; Dach in der Farbe des Monsters, `dach` in `monster.ts`), nur mit Monster.
    Monster läuft davor hin und her (`FarmTier` mit `art="monster"`), still bei „Bewegung reduzieren“. Dafür verschoben: kleiner Baum (4, 12) → (2, 3),
    Deko-Plätze (2, 8) → (1, 9), (3, 10) → (15, 1), (5, 9) → (7, 2). Test: mit Monster und Hütte bleibt alles erreichbar.
  - **Ausrufezeichen-Blase** (`blase_ausruf.png`, 3 Bilder, wackelt) über hungrigen Tieren und über dem Monster, solange sein Samen daliegt; wandert mit.
    Das Geschenk liegt jetzt rechts neben der Laufbahn (sonst unter der Meldung).
  - **Vorrat** als Knopf mit Truhe (Sprout Lands Basic, `truhe.png`) neben dem Sammelalbum oben links; öffnet ein Fenster „Dein Vorrat“. Liste unter der Farm entfällt.
  - **Ohne Scrollen am iPad:** Größe nach Breite und Höhe bis zum Menü unten, in halben Stufen (Sprite erlaubt jetzt 2,5-fach usw.), mindestens 2-fach.
    Meldung als Papier-Banner unten im Spielfenster (über Rahmen und Wasser), Leiste flacher (Schild mit einfachem Rahmen, Knöpfe mit dünnerem Rand),
    Standardsatz kürzer („Tippe irgendwohin, dann läuft deine Figur hin. Tippe Felder, Tiere und Bäume an.“).
  **Getestet** (Browser, Dachs-19): 1180 × 820, 820 × 1180 und 1024 × 768: ganze Karte sichtbar über dem Menü (bei 1024 × 768 bleiben 25 px leerer
  Seitenrand zum Scrollen), 2-fach. Hütte mit grünem Dach, Rübchen läuft davor, Blase wandert mit; Huhn hungrig (Testdaten kurz geändert, danach zurück) →
  Blase; Samen fällig → Blase am Monster, Samen rechts daneben, Einsammeln → Blase weg, Meldung im Banner. Vorrat-Fenster öffnet und schließt (Esc).
  `npm test` 141, Build ohne Fehler, Konsole ohne Fehler. **Nicht getestet:** echtes iPad in Safari (Safaris Leisten nehmen Höhe weg; dann kann die Farm
  knapp unter das Menü rutschen), Füttern lässt die Blase verschwinden (Dachs-19 hatte kein Futter), andere Monster als Rübchen auf der Farm.
  Gefunden, nicht behoben (war schon vorher so): mit allen 18 Deko-Stücken **und** dem Birnbaum kommt die Figur nicht an das rechte Huhn bei (17, 10).
- **Nach der Farm** (Jazz 2026-11-15): Monster läuft nur auf dem Gras vor der Hütte (Weg 0 bis 2 Kacheln nach rechts). Überschrift **jeder Schülerseite**
  (Lernweg, Übungen, Farm, Erklärungen, Hilfe) als kleines Holzschild in der Kopfzeile zwischen Dunkel-Schalter und Münzen (`titel` in `Rahmen`);
  Paket- und Übungsseite behalten ihre Kopfzeile mit Zurück-Knopf. Dunkel-Schalter 2-fach statt 3-fach. Sammelalbum- und Vorrat-Knopf nur mit Bild
  (Name in `aria-label`): Buch = Zeichnung der Lehrkraft (`buch_symbol.png`, braun), Truhe. Alles bis 2d3b5cd nach `main` gepusht und veröffentlicht.
- **Fallende Wörter** (Jazz 2026-11-15, Teil 2 der Liste, alle Vorschläge angenommen): Hintergrund Wiese mit Wolken (`fallen_wiese.png`, Nature Landscapes
  nature_2, Sprout-Lands-Farben) mit leichtem hellem Schleier; jedes Wort in einem Papier-Kästchen (Tafel aus dem UI Pack), getippte Buchstaben blasser;
  aktives Kästchen mit dickem dunklem Rahmen, der jede halbe Sekunde blinkt (still bei „Bewegung reduzieren“), daneben = Pfirsich-Rahmen ohne Blinken.
  **Feststelltaste:** `FeststellHinweis` (Pfirsich-Kasten mit gezeichneter Taste ⇪, „Die Feststelltaste ist an. Drücke sie einmal, dann schreibst du wieder
  normal. Sie ist links neben dem A.“) bei Fallenden Wörtern (über dem Spielfeld), Abschreiben und Merkdiktat (Spiel und alte Ansicht).
  **Getestet** (Browser 1180 × 820): Editor-Vorschau und Schüleransicht Dachs-19 (dunkler Modus): Hintergrund, Kästchen, Blinken (Farbe wechselt alle 0,5 s),
  falsches Zeichen → Pfirsich-Rahmen und „Schau genau hin“; Hinweis erscheint bei Tastendruck mit Feststelltaste (per Skript ausgelöst) und verschwindet
  ohne. Kopfzeile auf Hilfe und Farm. `npm test` 141, lint, build ohne Fehler. **Nicht getestet:** echte Feststelltaste (der Testbrowser kann sie nicht drücken)
  und ob iPad-Tastaturen sie melden; Hinweis beim Abschreiben und Merkdiktat nur im Code eingebaut, nicht angesehen. **Gefunden, nicht behoben (war schon so):**
  im Querformat 1180 × 820 liegt der untere Teil des Spielfelds unter dem Menü, man muss etwa 150 px scrollen.
- **Nachtrag** (Jazz 2026-11-15): Sammelalbum- und Vorrat-Knopf kleiner (56 × 60) auf hellem Papier (Tafel aus dem UI Pack, auch im dunklen Modus hell;
  vorher Flieder bzw. Holz, das braune Buch war schlecht zu sehen). **Feststelltaste an → Fallende Wörter halten an** (es fallen auch keine neuen), Hinweis
  sagt zusätzlich „Die Wörter warten so lange.“ **Spielfeld im Querformat:** beim Start scrollt die Seite so, dass das ganze Spielfeld über dem Menü liegt.
  **Getestet** (1180 × 820, Dachs-19): Spielfeld unten bei 685 px, Menü ab 737 px, Monsterszene bleibt sichtbar; Feststelltaste (per Skript) → Wort bleibt
  2 s auf derselben Höhe, danach fällt es weiter; Knöpfe hell und dunkel angesehen. **Nicht getestet:** echte Feststelltaste, Hochformat.
- **Teilaufgabe 6 (Eingabe verbessern) vorgezogen, Lehrkraft-Teil der Liste** (Jazz 2026-11-15, alle Vorschläge angenommen, Antippen ist Standard):
  - **„Wörter antippen“** ersetzt „Per Formular“ und ist Standard; „Als Text mit [Klammern]“ wählt man selbst. Text in ein Feld schreiben, darunter
    Wörter antippen (`src/lehrkraft/AntippModus.tsx`, Umrechnung `src/lib/antippen.ts` mit Tests). Lückentext: Wort → Lücke (Felder: weitere Lösungen,
    Hinweis); Auswahl: Wort = richtige Möglichkeit (Feld: falsche Möglichkeiten; Platz der richtigen wechselt je Wort); Fehler finden: Text mit Fehlern
    schreiben, Fehlerwort antippen, Verbesserung eintragen; Zuordnen: Wort bzw. erstes und letztes Wort einer Gruppe, dann Kategorie (vorhandene als Knöpfe
    oder neue eintippen). Noch einmal antippen = wieder Text; „+ nächstes Wort“ für Lösungen aus mehreren Wörtern. Weitertippen im Text behält die Stellen
    davor und dahinter. Meldungen ohne Klammern und mit „Sie“. Gespeichert wird weiter der [Klammer]-Text (kein neues Speicherformat).
    Reihenfolge und Sätze verbessern behalten ihre Formulare, Diktat und Fallende Wörter ihr Textfeld. Altes `FormularModus` entfernt.
  - **Klicks** (Beispiel „Ich weiß, dass du kommst, weil das Wetter schön ist.“ mit 3 Lücken): **vorher 14** (altes Formular: 7 Stücke, je „+ Text“/„+ Lücke“
    und Klick ins neue Feld; aus dem Aufbau des alten Formulars gezählt, nicht nachgeklickt), **nachher 4** (Textfeld + 3 Wörter, im Browser geklickt).
    Fehler finden mit 2 Fehlern: vorher 10, nachher 3 (Verbesserungsfeld hat sofort den Cursor). Zuordnen „Der kleine Hund bellt laut.“ mit Gruppe und
    2 Kategorien: vorher 8 plus Schreibweise „= Kategorie“, nachher 6 (gezählt).
  - **Für Excel speichern** (`src/lib/excel.ts`, CSV mit BOM und Semikolon, Zellen mit = + - @ bekommen ein Leerzeichen davor, damit Excel keine Formel
    daraus macht): Übungen (wie gefiltert/sortiert), Pakete (wie gefiltert), Lernstand der Klasse (wie angezeigt, Zeichen -- bis ++), Links der Klasse.
  **Getestet** (Browser, Lehrkraft 1180 × 820 und 820 × 1180): neue Lückentext-Übung (nicht gespeichert) mit 3 Lücken, Vorschau zeigt sie; Text davor
  ergänzt → Lücken bleiben; Wechsel zu Klammern zeigt `[dass] … [weil] [das]`; Fehler finden, Auswahl, Zuordnen (Gruppe, neue und vorhandene Kategorie)
  ergeben gültige Klammern ohne Meldung; bestehende Übung „Test: Zwei Formate ohne Monster“ lädt richtig. Alle vier Excel-Dateien abgefangen und gelesen
  (Kopfzeilen ohne Knopf- und Pfeiltexte). `npm test` 149, lint, build ohne Fehler. **Nicht getestet:** Öffnen der Dateien in Excel (kein Excel hier),
  Antippen mit dem Finger am echten iPad, Speichern einer im Antipp-Modus angelegten Übung (Speichern selbst unverändert).
- **Nachtrag Jazz (2026-11-15):** „Für Excel speichern“ nur noch bei Lernstand und Linkliste (bei Übungen und Paketen entfernt). Statt der zwei Reiter
  ein **Schalter „Textmodus“** (`.lk-schalter`, `role="switch"`): aus = Wörter antippen (Standard), an = Text mit [Klammern].
  Getestet bei 1024 × 768 (dunkel) und 820 × 1180 (hell): Schalter wechselt die Ansicht, Übungs- und Paketliste ohne Excel-Knopf. `npm test` 149, lint ohne Fehler.
- **Lehrkraftseite, Teilaufgabe 4 und 5** (2026-11-16, Jazz: alle Vorschläge angenommen, keine Migration, Speicherformat unverändert):
  - **Menüpunkt „Erklärungen“** (`AufgabenListe` mit `erklaerungen`): eigene Liste mit Suche, Schulform, Jahrgang, Kernkompetenz, „+ Neue Erklärung“.
    Die Übungsliste zeigt nur noch Übungen; „Neue Übung“ und das Format-Feld im Editor bieten keine Erklärung mehr an. Editor einer Erklärung:
    Zurück, Speichern und Löschen führen zur Erklärungsliste.
  - **Paket zusammenstellen** (`src/lehrkraft/UebungAuswahl.tsx`): Reiter Übungen/Erklärungen, Suche in Titel, Anweisung und Kompetenz,
    Filter Format, Stufe (neu), Jahrgang, Schulform, Kernkompetenz, Kompetenz; Sortieren nach zuletzt geändert, Titel, Format, Stufe;
    je Zeile Format, Sterne, Anzahl Runden und Tags (Jahrgang aus der KC-Stufe der Kompetenzen, Schulform); Kästchen und „N ausgewählte
    hinzufügen“ (Leiste bleibt unten sichtbar); „Ansehen“ zeigt die Übung wie im Spiel (`Durchgehen`, aus der Paket-Vorschau gelöst);
    „Keine Übung passt zu Ihrer Suche“ mit „Filter zurücksetzen“. Archivierte erscheinen nicht.
  - **Reihenfolge**: ziehen am Griff ⠿ (@dnd-kit, schon im Projekt) oder ↑ ↓; die Seite lädt dabei nicht mehr neu.
  - **Gemerkt** bis zum Schließen des Fensters (sessionStorage, `useGemerkt`): Suche/Filter/Sortierung der Übungs- und Erklärungsliste, Reiter,
    Filter und Sortierung der Auswahl im Paket.
  - **Testdaten:** 20 Übungen „Test 5: …“ (Inhalt aus vorhandenen Testübungen kopiert, Stufen 1–3, verschiedene Kompetenzen, drei ohne),
    Paket „Test 5: Paket zusammenstellen“. Nach dem Test archiviert.
  - **Getestet** (Browser, Lehrkraft, 1180 × 820; 1024 × 768 und 820 × 1180 nur Auswahl-Liste und Leiste): Erklärungen 71 / Übungen 32 getrennt;
    Suche „Komma“ findet Titel und Kompetenz; Unsinn-Suche zeigt den Hinweis; Stufe ★★★ und Jahrgang 7/8 mit Sortierung nach Stufe;
    3 Übungen auf einmal hinzugefügt (verschwinden aus der Auswahl); Erklärung über den Reiter hinzugefügt (Link führt zu „Erklärungen“);
    Erklärung per Ziehen an Platz 1, nach Neuladen gespeichert; ↓ verschiebt ohne Neuladen; „Ansehen“ zeigt die Erklärseite;
    Suche der Übungsliste nach Seitenwechsel noch da; kein seitliches Scrollen; Leiste im Hochformat direkt über dem Menü.
    `npm test` 151, lint, build ohne Fehler.
  - **Nicht getestet:** Ziehen mit dem Finger am echten iPad; Sortierung „zuletzt geändert“ mit echten Unterschieden (alle Testübungen haben
    dieselbe Uhrzeit, Test im Code); „Ansehen“ einer Übung mit mehreren Runden; Fehlerfall beim Speichern der Reihenfolge.
- **Wünsche von Jazz vom 2026-11-16, schnelle Punkte** (keine Migration):
  - Editor: **„1 · Einordnen“ steht oben**, „2 · Inhalt“ danach. **„+ Runde“ und „Kopieren“ klappen die bisherigen Runden ein**
    (▸/▾ am Rundennamen, eingeklappt zeigt eine Zeile den Text). **Reihenfolge im Antipp-Modus**: Formular untereinander (`.lk-teil--spalte`),
    vorher quetschte die lange Frage das Textfeld am iPad-Hochformat zusammen.
  - Farm: **Boot** in die Bucht oben (`BOOT` 10/1, Karte Zeile 2 um zwei Wasserkacheln breiter, kleiner Baum nach 12/3, Grasbüschel nach 10/4);
    unten verdeckte es das Meldungs-Banner. **Holzrahmen** bekommt eine eigene Ebene (`transform: translateZ(0)`), weil Safari am iPad das Kartenbild darüberlegte.
  - **Testdaten Lernstand:** 390 Versuche für alle 13 Schüler:innen der Klassen „Test“ und „AES - Zum Ausprobieren“ (je 5 Kompetenzen, je 6 Versuche über
    6 Wochen, Profile schwach / mittel / stark / wird deutlich besser). Markiert mit `antworten = {"testdaten":"lernstand"}`, löschbar mit
    `delete from versuche where antworten = '{"testdaten":"lernstand"}'`.
  - **Testfarm:** Schüler **Pfau-99** (Klasse „Test“): 12 Felder in allen Wachstumsstufen, 3 Obstbäume, Boot, Brunnen, 16 Deko, 4 Hühner, 4 Kühe,
    Monster Schleim blau, Vorrat mit 11 Dingen, 6180 Münzen. Link über die Linkliste der Klasse „Test“.
  - **Getestet** (Browser): Editor 820 × 1180 (Einordnen oben, Reihenfolge-Formular lesbar, nach „+ Runde“ ist Runde 1 eingeklappt mit Textzeile);
    Farm Dachs-19 bei 820 × 1180 und 1180 × 820 (Boot ganz sichtbar, Rahmen oben); Lernstand Klasse „Test“ mit Stufen und Verlauf je Kompetenz;
    Farm Pfau-99 bei 1180 × 820. `npm test` 151, lint, build ohne Fehler.
  - **Nicht getestet:** Holzrahmen am echten iPad (Fehler hier nicht nachstellbar; Lösung ist die übliche für Safari), Lernstand der Klasse „AES“ im Browser.
- **Gemischt, Anweisung/Tipp je Runde, Multiple Choice** (Jazz 2026-11-16: alle Vorschläge angenommen; Migration `gemischt_multiple_choice`, eingespielt):
  - **Kachel „Gemischt“** (`#/lehrkraft/aufgaben/neu-gemischt`): jede Runde wählt ihr Format (sechs Standardformate) und hat eigene **Arbeitsanweisung**
    (Pflicht) und **Tipp** (freiwillig, je höchstens 500 Zeichen). Gespeichert als `loesung.gemischt = true` und `loesung.runden[i].anweisung/hinweis`;
    die Datenbank gibt beides in `inhalt.runden[i]` weiter (leere fallen weg, dann gilt das der Übung). Bei allen anderen Formaten gilt das Format für alle
    Runden, die Formatwahl je Runde ist weg. Ältere Übungen mit eigenem Format je Runde öffnen als „Gemischt“. Liste und Paketauswahl zeigen „Gemischt“.
  - **Multiple Choice** ersetzt „Sätze verbessern“ (gleiche Kennung `ueberarbeiten` und Teil `versionen`, damit archivierte Übungen und ihre Ergebnisse
    lesbar bleiben): Frage, 2 bis 6 Antworten, eine oder mehrere richtig (mindestens eine falsch), Hinweis je Antwort freiwillig (nur im Textmodus,
    `Frage:` statt `Kontext:`, das alte Wort gilt weiter). Schüler:innen erfahren nur `mehrfach` („Mehrere Antworten sind richtig.“) und dürfen dann
    mehrere antippen; richtig = genau die richtigen. Formular im Antipp-Modus: Haken „richtig“, Antwort, ✕ in einer Zeile.
  - Behoben: Kurzzeile eingeklappter Runden entfernte jedes „s“ (Suchmuster ohne `\`).
  - **Getestet** (Browser, Lehrkraft 1180 × 820 und 820 × 1180; Dachs-19 1180 × 820): gemischte Übung mit Lückentext- und Multiple-Choice-Runde angelegt,
    Formatwechsel nimmt die passende Anweisung mit, Vorschau zeigt Anweisung/Format der Runde, nur „Hund“ = nochmal, „Hund“ + „Haus“ = richtig
    (Prüfung der Datenbank), gespeichert, neu geladen (Formate, Anweisungen, Tipp, Haken wieder da), Inhalt ohne Lösung (`mehrfach`, keine `richtig`);
    neue Lückentext-Übung ohne Formatwahl je Runde; Liste „Gemischt“; als Dachs-19 durchgespielt: Runde mit eigener Anweisung, Tipp der Runde.
    Testübung und Testpaket danach archiviert. `npm test` 152, lint, build, `npm run test:datenbank` ALLE TESTS BESTANDEN (161, Block 22 neu).
  - **Nicht getestet:** echtes iPad; Multiple Choice mit Hinweisen je Antwort; „Test: Zwei Formate ohne Monster“ steht in der Liste noch als „Lückentext“
    (hat kein Kennzeichen `gemischt`, öffnet aber als „Gemischt“ und bekommt es beim nächsten Speichern).
- **Alle sehen alle Sterne** (Jazz 2026-11-17, Migration `alle_sterne_sichtbar`, eingespielt): `sichtbare_aufgaben` gibt alle nicht archivierten Übungen
  eines zugewiesenen Pakets zurück; `stufen_aktualisieren` tut nichts mehr (kein automatischer Aufstieg). Sterne = nur Schwierigkeit (gewichten weiter die
  Lernstand-Punkte). `schueler_stufen` und `stufe_manuell` bleiben unangetastet in der Datenbank. Klassenseite ohne Spalte „Sterne-Stufe“, Texte in
  Paketseite, Zurücksetzen und Schüler-Hilfe angepasst. DB-Test Block 6.7/6.17/6.18/17.13 auf die neue Regel umgestellt: ALLE TESTS BESTANDEN (161).
  **Getestet:** Klassenseite „Test“ im Browser (keine Spalte, keine Fehler). **Nicht getestet:** Schüleransicht eines Pakets mit gemischten Sternen im Browser
  (nur über den DB-Test).
- **Übungspakete „Grammatik Klasse 7“ nach DS01–DS07** (Jazz 2026-11-17, alle Vorschläge angenommen; ohne Krabat-Inhalte): Inhalte in
  `inhalte/reihe7-grammatik.ts`, Skript `scripts/reihe7-sql.ts` (prüft jede Runde mit den Parsern des Editors, feste ids, wiederholbar:
  `node scripts/reihe7-sql.ts <datei.sql>`, dann `npx supabase db query --linked -f <datei.sql>`). Eingespielt: 7 Pakete (Jahrgang 7, Gymnasium,
  keiner Klasse zugewiesen), je 1 neue Erklärseite, 4 bzw. 5 Übungen ohne Monster mit je 8 Runden (5 pro Durchgang), 1 gemischte Abschlussübung mit
  Monster (je Format eine Runde, Reihenfolge fest; Rübchen, Schleim grün, Schleim blau, Feuerschleim, Maus, Spinne grün, Gespenst). Alle ★★.
  Kompetenzen (Gymnasium) wie vorgeschlagen, mehrere je Übung. DS01 enthält Jazz' vorhandene Übung „Satzstellungen bei Sätzen im Plusquamperfekt“;
  ihr Paket „Das Plusquamperfekt“ bleibt unverändert. Paket DS07: „Wiederholung: Zeitformen, Konjunktionen, Satzreihe, Satzgefüge, Nominalisierung“.
  **Getestet:** Skript (36 Übungen ohne Prüffehler), Datenbank (Reihenfolge im Paket, Kompetenzen je Übung, Runden), als Dachs-19 bei 820 × 1180
  (Paket kurz der Klasse „Test“ zugewiesen, danach wieder entfernt): Teilsätze zuordnen richtig, Satzgefüge bauen richtig (Satzanfang groß),
  Abschluss mit Monster (Maus) und 3 Runden. **Nicht getestet:** alle übrigen Übungen im Browser (nur geprüft durch die Parser), echtes iPad.
- **Kompetenzen bei Erklärseiten** (Jazz 2026-11-17): der Editor zeigt für Erklärseiten jetzt die Kompetenz-Auswahl (vorher nur der Satz „keine Kompetenzen“);
  Hinweis ohne Zuordnung passt zu Erklärseiten (Suche und Filter statt Lernstand). Speichern war schon für alle Arten vorhanden.
  **Getestet** (Browser): „Erklärung: Das Satzgefüge und sein Komma“: Kompetenz entfernt, gespeichert, neu geladen (3); über die Auswahl (Gymnasium, Suche
  „Einsch“) wieder angekreuzt, gespeichert, neu geladen (4). `npm test` 152, lint ohne Fehler.
- **Sterne der Grammatik-7-Übungen** (Jazz 2026-11-17): nach Schwierigkeit statt überall ★★: ★ erkennen/zuordnen, ★★ einsetzen/entscheiden, ★★★ selbst bilden
  oder berichtigen; Abschlussübungen ★★ (gemischt von leicht nach schwer). Im Paket nach Sternen sortiert (Kennungen unverändert). Jazz' Übung
  „Satzstellungen …“ behält ★ und steht in DS01 vor dem Abschluss. Vor dem Neueinspielen geprüft: keine Änderungen von Jazz an diesen Übungen,
  keine Zuweisungen. **Getestet:** Datenbank (Sterne und Reihenfolge je Paket). Skript-Lauf ohne Prüffehler.

## Farm erweitern und Münzsystem (Auftrag Jazz 2026-11-17, nur Vorschläge, Branch `lehrkraftseite`)
Sechs Teilaufgaben (1 Analyse, 2 Layout leer, 3 Layout voll, 4 Dekorationen, 5 Münzsystem, 6 Zusammenfassung). Ergebnisse nur unter `docs/farm/`,
**keine Änderungen am Spiel**, an Daten oder Assets.
- **Teilaufgabe 1 – Analyse** (2026-11-17): `docs/farm/analyse-farm.md`, `docs/farm/analyse-muenzen.md` (neu). Nichts geändert.
  Kernpunkte Farm: Karte fest 21 × 15 Kacheln, Faktor in halben Stufen nach Breite und Höhe; im Querformat bleiben 26–43 % der Breite leer
  (gemessen: 1024 × 768 Faktor 2 und 16 px Scrollen, 1180 × 820 Faktor 2, 1366 × 1024 Faktor 3); bei Faktor 2 sind Felder, Hühner, Deko nur 32 px
  zum Antippen (unter 44 pt); feste Plätze in `landschaft.ts`, gespeichert wird nur der Besitz; Einstein und Shop haben auf der Farm keinen Platz.
  Kernpunkte Münzen: Übungen sind gedeckelt (je Übung höchstens 30/45/60 inkl. Freundschaft, Wiederholen nur Differenz; heute 50 Übungen = max. 2.340);
  ungedeckelt ist der **Farm-Handel** (Futter Güte 3 → +40/+60 je Tier und Tag, Obstbäume, Gießen auch durch Wiederholen ohne Münzen),
  Verkauf zählt als „verdient“ fürs Freischalten, 79 Erklärseiten = 395 Münzen für alle; „Ergebnisse zurücksetzen“ löscht Münzen und Besitz.
  **Getestet:** Messung im Browser mit Pfau-99 (drei Größen), Preise und Anzahlen per Lese-Abfrage. **Nicht getestet:** echtes iPad, Münz-Abläufe
  im Browser (nur Code gelesen und gerechnet).
- **Antworten von Jazz (2026-11-17)** auf die Rückfragen 1–9:
  1. Übungshäufigkeit: etwa **ein Übungspaket pro Woche plus eins als Hausaufgabe**. Kinder üben immer Pakete, nie einzelne Übungen.
  2. Zieldauer: Die Farm soll **in einem Schuljahr fertig werden können**.
  3. iPads: Vorschlag angenommen (planen für 1024 × 768, prüfen 1180 × 820 und 1366 × 1024).
  4. Hausaufgaben werden **später eingebaut**; bis dahin normale Übungen.
  5. Shop als Knopf auf der Farm: ja. **Einstein kommt nicht auf die Farm**; das Meldungsfeld unten gibt aktuelle Hinweise zur Farm.
  6. Hinweis „Dreh dein iPad“ im Hochformat (nur Farm): ja.
  7. Deko: feste Plätze, das Kind wählt, was wohin kommt: ja.
  8. „Ergebnisse zurücksetzen“ behält Münzen und Farm: ja.
  9. Erklärseiten erscheinen **nur, wenn sie in einem zugewiesenen Paket vorkommen** (dann auch unter „Erklärungen“).
  Zusätzlich: Ausrufezeichen über hungrigen Tieren und dem Monster sind zu groß und zu unruhig, **Vorschläge für eine andere Darstellung**;
  **höchstens 2 Kühe**.
- **Teilaufgabe 2 – Layout leer** (2026-11-17): `docs/farm/layout-leer.md`, Mockup `docs/farm/layout-leer.html` (echte Bilder und Stile, nur gelesen;
  `?plaetze=1` zeigt Zonen; Selbstprüfung Gras/Überdeckung/Tippflächen), Fotos `docs/farm/bilder/layout-leer-*.png`. Nichts am Spiel geändert.
  Vorschlag: Spielfenster über die volle Breite mit Meer, Insel-Kern 27 × 15 mit allen Plätzen plus je 4 Spalten Landstreifen ohne Plätze
  (dürfen abgeschnitten werden), nur 2- oder 3-fach (nach dem Gras 25 × 13), Farm-Knöpfe inkl. Shop in die Kopfzeile (72 statt 116 px),
  Meldung unten im Meer, Tippflächen 48 px (freie Kachel zwischen kleinen Dingen, Felder mit Grasweg), Scheune (2 Kühe) und Stall von Anfang an,
  8 Plätze für wachsende Deko, 18 Deko-Plätze, Hochformat nur Hinweis. Hungrige Tiere: Variante A (leerer Napf/Trog) + Meldung, keine Blasen.
  Nur Testfarm Pfau-99 hat mehr als 2 Kühe (4). **Getestet:** Mockup bei 1024 × 768, 1180 × 820, 1366 × 1024, 768 × 1024 (Edge Kopfmodus),
  Selbstprüfung ok. **Nicht getestet:** echtes iPad (Safari-Leisten), dunkler Modus und Bewegung im Mockup.
- **Entscheidungen Jazz zu Teilaufgabe 2 (2026-11-17):** E1, E2 angenommen. E3: Felder **dicht wie heute** (4 × 3, Tippfläche 32 px bei 2-fach
  bewusst erlaubt), dafür mehr Deko-Plätze und mehr Deko im Shop. E4: Napf/Trog statt Blasen, Meldung „Deine Hühner/Kühe/Tiere sind hungrig.“,
  Monster ohne Ausrufezeichen, Geschenke hüpfen weiter. E5: Shop-Knopf über der Farm **ersetzt** den Menüpunkt Shop; Buch im Sammelalbum-Knopf kleiner.
  Umgesetzt im Mockup und in `layout-leer.md`: 27 Deko-Plätze (20 klein, 2 groß 2 × 2, 5 im Wasser), Liste von etwa 30 passenden Deko-Bildern aus den
  gekauften Paketen (Abschnitt 8). Selbstprüfung in allen drei Größen ok.
- **Nachtrag Jazz (2026-11-17):** Monster läuft nie ins Wasser (Laufweg vor der Hütte, Prüfung im Mockup), Überschrift „Meine Farm“ entfällt
  (Kopfzeile 64 px), Wasser-Deko nur oben (S2 lag im Meldungsfeld) → 26 Deko-Plätze (20 klein, 2 groß, 4 Wasser). Selbstprüfung in allen Größen ok.
- **Nachtrag Jazz:** Kopfzeile der Mockups mit Dunkel-Schalter und Zahnrad wie im Spiel (Klassen `garten-seite`, `muenzen-stand`, `holzknopf`).
  Mockup-Code liegt jetzt gemeinsam in `docs/farm/farm-mockup.js` und `farm-mockup.css`.
- **Teilaufgabe 3 – Layout voll** (2026-11-17): `docs/farm/layout-voll.md`, Mockup `docs/farm/layout-voll.html`, Fotos `docs/farm/bilder/layout-voll-*.png`.
  Alles gekauft, jeder Platz belegt (gut 80 Dinge, neue Deko als Platzhalter). Im Mockup bewegen sich 13 Dinge gleichzeitig (+ Figur beim Laufen).
  Vorschlag Budget: höchstens 12 eigene Bewegungen, höchstens 2 bewegte Deko, Liegendes hüpft im gemeinsamen Takt; schlimmster Fall heute bis
  19 einzeln hüpfende Dinge. Überladung: Hof frei, Zonen erkennbar; eng rechts vom Stall und oben Mitte; Tippflächen überlappen bei Ei/Milch
  neben dem Tier → V1: Eier im Stall-Eingang, Milch an der Scheunentür. **Getestet:** Mockup in drei Größen + Hochformat, Selbstprüfung ok.
  **Nicht getestet:** echtes iPad (Leistung), dunkler Modus, neue Deko-Bilder (nur Platzhalter).
- **Entscheidungen Jazz zu Teilaufgabe 3 (2026-11-17):** V1–V4 angenommen (Eier im Stall-Eingang, Milch an der Scheunentür; Bewegungs-Budget;
  enge Stellen in Teilaufgabe 4 lösen; Erinnerung an Liegendes per Meldung). Shop-Knopf breiter mit dem Wort „Laden“ (Mockups und Fotos erneuert).
- **Nachtrag Jazz:** Baumstumpf, Laterne, Briefkasten, Fels verstreut (Baum, Brunnen, Hofweg, Ufer) statt in einer Reihe; mehr Blumen:
  6 Blumenbeete mit 16 Plätzen (Blumen eines Beets dicht, Auswahl je Beet), Blumen-Vorschläge aus den Paketen in `layout-leer.md` Abschnitt 8.
  Selbstprüfung in allen Größen ok.
- **Nachtrag Jazz:** Monster-Hütte weiter oben (Platz 4 × 4 bei x 4, y 8; Eingang nicht mehr am Wasser, Laufweg vor der Tür auf Gras);
  kleine Monster (Gespenst, Spinnen, Maus) bekommen eine kleine Hütte: den kleinen Hühnerstall mit einem Fenster
  (Premium `Chikcen_Houses.png`, 32 × 48, 2 × 3 Kacheln, 6 Dachfarben; Jazz), keine neue Grafik.
- **Teilaufgabe 4 – Dekorationskonzept** (2026-11-17): `docs/farm/dekorationen.md`, Stufen-Seite `docs/farm/wachsende-deko.html` (+ `wachsende-deko.js`,
  Foto `bilder/wachsende-deko-stufen.png`); Mockups leer/voll zeigen die echten Stufen-Bilder (aus `assets/`, nur lokal).
  8 wachsende Deko (Kirschbaum, Wildblumen, Sonnenblume, Seerosen, Beerenbusch, Vogelhaus neu, Eiche, Windrad neu), 26 Schritte bis ausgewachsen.
  Schritt je Kompetenz einmal für „neu dazugelernt“ (erster Lernstand), „besser“, „deutlich besser“; Schritt geht an die am wenigsten gewachsene Deko
  (keine Zuordnung zu Bereichen); nur vorwärts (Stufe = Maximum, Zurücksetzen behält sie). Meldungsfeld-Texte je Deko. Technik: Tabellen
  `wachstum_ereignisse`, `wachstum_stufen` (Schema-Änderung, später). Kaufbare Deko: 4 Platzarten, 8 Kategorien, Preisstufen A–D, Aufstellen nach Kauf,
  `besitz.platz`. Asset-Liste: 15 neue Bilder (Vogelhaus 5, Windrad 4, Glitzern 3, Napf 2, Buch 1). V3 gelöst (W7 und W8 umgelegt, Frosch auf S2).
  Offen D1–D9. **Getestet:** Paketbilder vermessen, Stufen-Seite und Mockups in drei Größen, Selbstprüfung ok. **Nicht getestet:** Tempo (Schätzung
  15–30 Schritte/Jahr, Simulation in Teilaufgabe 5), echtes iPad, dunkler Modus.
- **Entscheidungen Jazz zu Teilaufgabe 4 (2026-11-17):** D1–D9 alle angenommen (8 wachsende Deko wie vorgeschlagen; „neu dazugelernt“ zählt;
  Belohnungen bleiben; Meldungstexte; im 2. Schuljahr vorerst nichts Neues; wachsende Motive nicht im Shop; Kategorien, Platzarten, Preisstufen A–D;
  „Möchtest du es gleich aufstellen?“; Vogelhaus und Windrad ohne Dauerbewegung).
- **Nachtrag Jazz zu Teilaufgabe 4 (2026-11-17):** Farben angepasst (Kirschbaum Stufe 2 rosa, Eiche gelbgrün, Beerenbusch dunkelgrün; Wildblumen enden im Lavendel aus `assets/objects.png`, eigenes Bild von Jazz, verkleinert auf Blumengröße, 1 × 1). Mehrfach gekaufte Deko bekommt je Stück eine andere Farbe (Busch und Stein einfarbig; schon Gekauftes darf sich ändern, nur Testkonten), Gelb nur bei der Sonnenblume, Pilzhaus ohne Totenkopf (`dekorationen.md` 5.2a, Mockup-Färbung `docs/farm/farben.js`). Prompts für die neuen Bilder: `docs/farm/gemini-prompts.md`; Vogelhaus, Windrad, Glitzern, Napf und kleiner Lavendel von Jazz mit Gemini erzeugt, aufbereitet mit `docs/farm/pixeln.cjs` nach `assets/neu/` (nicht im Repo), in den Mockups eingebaut. Windrad gestrichen, W8 ist eine zweite Sonnenblume (Jazz). Offen: kleines Buch.
- **Farm-Umsetzung Schritt 1** (2026-11-17, Branch `farm-umsetzung`, Jazz: Schritt für Schritt, Münzsystem später, Gemini-Bilder als eigene Bilder):
  neue Karte (Kern 27 × 15 + Landstreifen, alle Plätze aus dem Mockup, `landschaft.ts` mit Tests), Spielfenster über die ganze Breite mit Meer,
  Faktor 2 oder 3, Scheune und Stall von Anfang an, Napf und Trog statt Ausrufezeichen, Meldung „Deine … sind hungrig.“, kleine Hütte für kleine Monster,
  Kopfzeile mit Sammelalbum, Vorrat, Laden und Zahnrad, Menü ohne Shop, Hinweis im Hochformat. Migration `hoechstens_zwei_kuehe` (eingespielt,
  DB-Test 162 bestanden). Geprüft im Browser bei 1024 × 768, 1180 × 820, 1366 × 1024 (kein Scrollen), Feld-Menü und Laden-Knopf. Nicht geprüft: echtes iPad, Hochformat am iPad.
- **Rückmeldung Jazz zu Schritt 1 (2026-11-17), umgesetzt:** Meer nur innerhalb des Rahmens; Trog mit Heu statt Wasser, Trog und Napf antippbar (öffnen das Füttern); Huhn 4 nicht mehr am Ufer (Deko-Platz D14 nach x 24, y 12); Hunger-Meldung sagt, was man antippt; **Meldung oben in der Kopfzeile** statt unten (geprüft: längste Meldung zweizeilig bei 1024, 1180, 1366 px, kein Scrollen; Insel jetzt senkrecht mittig); Eiche im Mockup als Herbst-Eiche (kleiner Herbstbaum aus halloween/fall_trees.png, Stufe 4 herbstlich); neues Testkonto **Leer-01** (Klasse Test) für eine leere Farm. Danach (Jazz): Herbst-Eiche angenommen; Meldung oben im Stil von Einsteins Sprechblase (Rahmen --rahmen-blase, 2-fach, hell und dunkel geprüft). Laden-Knopf in Holz (Hauptknopf), (Jazz: passt so). Zahnrad doch wieder der alte Holzknopf (Jazz).
- **Schritt 2 (2026-11-17, Jazz: Datenbank freigegeben, rückwirkend):** wachsende Deko im Spiel. Migration `wachsende_deko`
  (`wachstum_ereignisse`, `wachstum_stufen`, `wachstum_verteilen`, `wachstum_holen`, `wachstum_gesehen`; DB-Test Block 15.6–15.9, 166 bestanden).
  Je Kompetenz ein Schritt für „neu“ (erster Lernstand), „besser“, „deutlich“; Schritt an die Deko, die am wenigsten weit ist; Stufen nur höher;
  „Ergebnisse zurücksetzen“ lässt beides stehen. Bilder aus den Mockup-Daten (`scripts/grafik-holen.mjs` liest `docs/farm/wachsende-deko.js`) nach
  `src/grafik/wachs_w1..8.png`, Glitzern `glitzern.png`. Plätze `WACHSENDE_DEKO` in `landschaft.ts` (Hindernisse, Test: Seerosen im Wasser).
  Meldung einmal beim Öffnen, Gewachsenes glitzert etwa 5 s immer wieder (Jazz) (aus bei „Bewegung reduzieren“). Hilfe: neuer Abschnitt. Geprüft im Browser mit Dachs-19
  (8 Ereignisse → alle Stufe 2, Meldung, Glitzern, „gesehen“ gespeichert). Zahnrad wieder der alte Holzknopf (Jazz).
  Nicht getestet: echtes iPad; Aussehen des Glitzerns (nur im Code geprüft, dass es erscheint und verschwindet).
- **Schritt 3a (2026-11-17, Jazz: erst Plätze, dann Bilder; Datenbank freigegeben; vorläufige Preise A 30 / B 75 / C 160 / D 250 für 3b):**
  Migrationen `deko_plaetze` und `deko_fest_platz`: `shop_artikel.platzart` (beet, klein, gross, wasser, fest), `besitz.platz` (leer = Truhe) und
  `besitz.farbe` (laufende Nummer je Artikel), `deko_aufstellen` (aufstellen, tauschen, in die Truhe), `kaufen` gibt die Besitz-Nummer zurück und
  begrenzt Deko auf die Zahl der Plätze (Brunnen und Boot je eins). Schon Gekauftes wurde wie bisher verteilt (Blumen und Katzenblumen in die Beete),
  Farben in Kaufreihenfolge. „Gelbe Blume“ heißt jetzt „Blume“ (rosa, blau, lila, weiß, orange), „Lila Blume“ heißt „Traubenblume“; Pilz und
  Pilzhütte in 4 Farben, Pilzhütte ohne Totenkopf (Bilder aus farben.js per grafik-holen.mjs). Plätze `DEKO_PLATZ`/`BEETE` in landschaft.ts (Tests:
  nichts überdeckt sich, alles erreichbar, Wasser-Plätze am Ufer). Farm: Zahnrad → „Deko aufstellen“, helle Plätze, Platz antippen → aufstellen,
  tauschen, in die Truhe, ganzes Beet auf einmal; Vorrat zeigt „Deko zum Aufstellen“; Laden fragt nach dem Kauf „Gleich aufstellen?“.
  Das Ausblenden von Deko nur auf dem Gerät (localStorage) entfällt. Belohnungs-Deko (Katzenblumen) kommt in die Truhe.
  Geprüft im Browser mit Pfau-99: Verteilung, in die Truhe, wieder aufstellen, Busch kaufen und gleich aufstellen. DB-Test 167, Tests 156.
  Nicht getestet: iPad; „ganzes Beet“ (kein Testkind hat genug gleiche Blumen in der Truhe); große Plätze und Wasser-Plätze (es gibt noch keine Deko dafür, kommt in 3b).
- **Nachträge zu 3a (2026-11-17, Jazz):** Laden hat den Haus-Knopf „Zurück zur Farm“ wie das Sammelalbum. Ausgewachsene wachsende Deko
  bekommt einen Sticker (Migration `album_wachsende_deko`, 7 Sticker, beide Sonnenblumen teilen sich einen; DB-Test 15.10). Pilzhütte im Album
  ohne Totenkopf (Sticker kommt aus dem umgefärbten Bild). Keine Aufstellplätze mehr am unteren Ufer: D4, D5, D7, D12, D14 und die Beete
  „an der Hütte“ (jetzt „über der Hütte“) und „am Ufer“ (jetzt „an der Scheune rechts“) ins Innere verschoben; Test: unter jedem Platz an Land ist Gras.
  Neue kaufbare Deko aus 3b bekommt ihren Sticker automatisch (Test: jedes deko_-Bild hat einen Sticker). Mockup-Plätze (docs/farm) nicht nachgezogen.
- **Schritt 3b (2026-11-18, Jazz: nur Deko, die laut Mockup gut auf die Farm passt):** 11 neue Laden-Artikel (Migrationen `deko_neu`,
  `shop_platzart`), vorläufige Preise A 30 / B 75 / C 160 / D 250: Klee, Fels, Baumstumpf, Briefkasten, Holzschild (5 Motive je Kauf) für kleine
  Plätze; Glockenblume (rosa, blau) fürs Beet; Schilf, Steine im Wasser (je 2 Formen) und Frosch (bewegt) im Wasser; Picknick und Bienenstock
  (bewegt) auf großen Plätzen. Große und bewegte Deko je einmal (`shop_artikel.hoechstens`). Laterne aus dem Mockup gibt es in keinem Paket,
  darum weggelassen. Bilder aus den Paketen zusammengesetzt in grafik-holen.mjs (Picknickdecke auf 2 × 2 verkürzt, Korb darauf; Bienen fliegen
  um den Stock, 8 Bilder; Frosch auf Seerosenblatt, 14 Bilder; still bei „Bewegung reduzieren“). Shop-Karte sagt „Passt auf …“ und „Bewegt sich.“
  Sticker im Album für alle neuen Dinge. Geprüft im Browser mit Pfau-99 (gekauft und aufgestellt). DB-Test 168, Tests 157.
  Nicht umgesetzt: Frosch nur auf S1/S2/S4 (V3), Jahreszeit-Deko (Kürbis, Weihnachten), Truhe, Bank mit Tisch, Lagerfeuer (nicht im Mockup).
- **Nachträge zu 3b (2026-11-18, Jazz):** Picknick weggelassen (Kauf von Pfau-99 gelöscht, Münzen zurück). Neu: Truhe (Eiche, Silber, Gold),
  Kürbisgesicht (4 Gesichter, nur September bis November) und Geschenk (3 Farben, nur Dezember), je kleine Plätze, 75 Münzen
  (`shop_artikel.monate`, Funktion `in_der_saison`, Migration `deko_jahreszeit`; DB-Test mit verschobenem Monat). Weihnachtsbaum (48 × 64)
  passt auf keinen großen Platz, Bank mit Tisch gibt es in keinem Paket (nur Möbel für drinnen): beide weggelassen.
  **Lagerfeuer statt Lavendel** als wachsende Deko W2 (ein Ast, zwei Äste, Holzstapel, Feuer brennt); in der letzten Stufe flackert das Feuer
  (16 Bilder). Bewegte Dinge jetzt höchstens 3 (Bienenstock, Frosch, Feuer). Sticker „Lagerfeuer“ statt „Lavendel“. Album geprüft
  (alle Sticker vorgetäuscht gesammelt): nur Brunnen und Boot stießen aneinander, darum steht das Boot jetzt weiter hinten (Migration
  `album_boot_reihenfolge`, auch im Shop). Mockup `wachsende-deko.js` nachgezogen (Lagerfeuer).
- **Nachträge (2026-11-18, Jazz):** Ein Napf für alle Hühner (links); wo der rechte stand, ist jetzt der kleine Platz **D21**
  (Migration `deko_platz_d21`: `deko_platzart`, `deko_plaetze` 21; Huhn 2 eine Kachel tiefer). Vorrat ohne sichtbare Namen (nur für
  Vorlesehilfen), weil Blaubeermilch und Erdbeermilch ineinanderliefen; Laden geprüft (alle Artikel bei 1024 und 768 Breite): nichts überlappt.
  Laden-Knopf mit Einkaufswagen aus Sprout Lands (UI Pack Premium, `laden.png`).
- **Teilaufgabe 5 – Münzsystem** (2026-11-18, nur Vorschlag, nichts am Spiel geändert): `docs/farm/muenzen-vorschlag.md`, Simulation
  `docs/farm/simulation/simulation.mjs` (ohne Abhängigkeiten, Ergebnis `ergebnis.md`). Heute ist die Farm nach 8 bis 17 Wochen voll (Handel bis 78.000
  Münzen im Jahr). Empfehlung **Modell A „Lernen zählt“**: Verkauf zählt nicht fürs Freischalten, kleine Gewinnspannen (Ernte und Erzeugnisse = Futter + 5/10),
  Obstbäume alle 14 Tage, Dauerhaftes ×2,5 (Samen wie heute) → regelmäßig 27 Wochen, Vielspieler 26, Schlupflöcher nicht fertig. Preisfaktor hängt an der Zahl
  neuer Pakete im Jahr (20 → 1, 76 → 3). Bestand: neue Regeln nur für die Zukunft (nur Testkonten). **Nicht geprüft:** echte Spieldaten, wachsende Deko
  (braucht Lernstand-Daten), nichts im Spiel ausprobiert.
- **Rückmeldung Jazz (2026-11-18):** Migration `deko_platz_d21` eingespielt (DB-Test 168 bestanden). Ein neues Paket pro Woche → Preisfaktor 2
  (Simulation und Vorschlag neu gerechnet: regelmäßig 36 Wochen, Vielspieler 33, Schlupflöcher nicht fertig; volle Farm 10.790). **Kein Wochenbonus** (M3).
  Hochformat-Hinweis „Dreh dein iPad“ greift jetzt auch mit Tastatur-Hülle samt Trackpad (`any-pointer: coarse`), die Farm-Meldung oben ist im Hochformat aus
  (geprüft im Browser mit Touch-Emulation 744 × 1024 und quer 1024 × 700; nicht am echten iPad).
- **Entscheidung Jazz (2026-11-18):** alle übrigen Vorschläge angenommen: Modell A „Lernen zählt“, keine Faktoren pro Klasse, Samen wie heute,
  Obstbäume alle 14 Tage, Bestand Variante 1 (neue Regeln nur für die Zukunft), Hausaufgaben-Bonus später, Freischalt-Grenzen bleiben (nur Lernmünzen).
- **Teilaufgabe 6 – Zusammenfassung** (2026-11-18): `docs/farm/zusammenfassung.md`: alle freigegebenen Entscheidungen, was schon im Spiel ist
  (Schritte 1–3), Reihenfolge der weiteren Umsetzung, gesamte Asset-Liste. Dabei geprüft: „Ergebnisse zurücksetzen“ löscht noch Münzen und Farm
  (Antwort 8 nicht gebaut), Erklärseiten zeigen noch alle des Jahrgangs (Antwort 9 nicht gebaut).
- **Umsetzung Schritt 4** (2026-11-18, Jazz: Schritt 4 zuerst, Schritt 7 kleines Buch gestrichen): „Ergebnisse zurücksetzen“ löscht nur noch
  Antworten, Durchgänge, „Lösung angesehen“ und Sterne-Stufen; Münzen, Besitz, Pflanzen, Vorrat, Belohnungen, wachsende Deko und Farm-Monster bleiben
  (Migration `zuruecksetzen_farm_bleibt`, eingespielt). Keine doppelten Münzen danach (Münz-Ereignisse bleiben). DB-Test 8.12, 9.7, 10.8 prüfen jetzt
  „bleibt“; Texte in der Klassenansicht und in `SPEC.md`/`SPEC-muenzen.md` angepasst. **Getestet:** DB-Test 168, Tests 157. **Nicht getestet:** Knopf im Browser
  (würde Testkonten verändern).
- **Nächster Schritt:** Schritt 5 Münzsystem Modell A (Migration, vorher Rückfrage), danach 6 Erklärseiten nur aus zugewiesenen Paketen, 8 iPad-Test und Merge.
