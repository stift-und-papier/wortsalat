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
