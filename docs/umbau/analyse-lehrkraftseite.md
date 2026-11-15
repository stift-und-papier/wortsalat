# Analyse der Lehrkraftseite (Teilaufgabe 1)

Stand: 2026-11-15, Branch `uebungsumbau` (Commit d0a01d2). Es wurde nichts geändert, nur diese Datei ist neu.

## Wie geprüft wurde

- **Gelesen (Code):** `src/lehrkraft/AufgabeEditor.tsx`, `FormatWahl.tsx`, `AufgabenListe.tsx`, `ListenFilter.tsx`, `PaketListe.tsx`,
  `PaketDetail.tsx`, `PaketTags.tsx`, `src/lib/filter.ts`, `src/schueler/UebungSpiel.tsx`, Migration `uebungen_runden`.
- **Im Browser getestet** (als Lehrkraft angemeldet, 1180 × 820, Editor zusätzlich 1024 × 768; nichts gespeichert, nichts geändert):
  - Menü: Klassen, Übungen, Pakete, Kompetenzen, Einstellungen. Übungsliste: 73 Zeilen, davon 71 Erklärseiten und 2 Übungen
    („"Das" oder "dass"?“ Lückentext, „Test: Merkdiktat“).
  - „+ Neue Übung“ zeigt 8 Kacheln (kein „Fallende Wörter“).
  - Editor Lückentext: Nach „+ Runde“ bleibt der Cursor auf dem Knopf, nicht im Textfeld. „Runde 1 entfernen“ löscht sofort samt Text,
    ohne Nachfrage. Formular zeigt „+ Text, + Lücke, + Auswahl, + Zuordnung, + Fehler“. „Speichern“ ohne Titel: Meldung steht
    etwa 700 Bildpunkte unter dem Titelfeld, ganz am Ende der Seite. Die Seite ist rund 2000 Bildpunkte hoch (2 bis 3 Bildschirme).
    Bei 1024 × 768 steht die Vorschau unter der Eingabe statt daneben; kein Scrollen zur Seite.
  - Seite mit ungespeichertem Text verlassen: keine Warnung, Text weg.
  - Diktat-Editor: keine Runden-Reiter, Knöpfe „Abschreiben“ und „Merkdiktat“, Hilfetext nennt noch „Geschafft ab 90 %“.
  - Paket „Heißt es "das" oder "dass?"“: Aufklappliste „Übung hinzufügen“ hat 71 Einträge, 70 davon Erklärseiten.
  - Übungsliste: Suche „dass“ zeigt 3 Treffer; nach Wechsel zu „Pakete“ und zurück ist das Suchfeld leer (73 Zeilen).
  - Konsole: ein Fehler „400“ ohne nähere Angabe, Ursache nicht geklärt (vermutlich ein Anmeldeversuch).
- **Nicht getestet:** das Speichern einer Übung, Hinzufügen, Verschieben und Zuweisen im Paket (hätte Daten geändert; Teilaufgabe 1
  ist „nur lesen“). Die Klickzahlen in Abschnitt 3 und 4 sind deshalb **aus dem Code gezählt**. Ebenfalls nicht getestet: die Formate
  außer Lückentext als Schüler:in („kommt bald“ steht so im Code).

## 1. Runden im Editor: was geht heute, was nicht

| Format | Runden im Editor | Als Schüler:in spielbar |
|---|---|---|
| Lückentext | ja (Reiter „Runde 1, 2 … + Runde“) | **ja** |
| Auswahl | ja | nein („Diese Übung kommt bald.“) |
| Zuordnen | ja | nein |
| Fehler finden | ja | nein |
| Reihenfolge | ja | nein |
| Sätze verbessern (Textüberarbeitung) | ja | nein |
| Diktat (Abschreiben, Merkdiktat) | nein, mit Absicht (Entscheidung Schritt 6: Diktate haben keine Runden) | nein |
| Fallende Wörter | gibt es im Editor nicht | nein |
| Erklärung | keine Runden (ist keine Übung) | ja (eigener Menüpunkt) |

Was bei den Runden im Editor fehlt (alle Formate):

- **Duplizieren** einer Runde: gibt es nicht.
- **Umsortieren**: gibt es nicht.
- **Entfernen**: geht, aber ohne Nachfrage und ohne „Rückgängig“. Es wird nicht geprüft, ob es schon Ergebnisse gibt.
- Bei „Reihenfolge“ und „Sätze verbessern“ kann **eine** Runde mehrere Sätze enthalten (Leerzeile = neuer Satz).
  Entscheidung Jazz 2026-11-15: Das bleibt so, damit schwerere Runden möglich sind.
- Die Vorschau im Editor zeigt die **alte** Aufgabenansicht (mehrmals prüfen), nicht das Spiel mit Monster.

Wichtig für das Entfernen und Umsortieren: Die Datenbank merkt sich Ergebnisse je Runde über die **Nummer** der Runde.
Fällt eine Runde weg oder rutscht sie, stimmen die Nummern der alten Ergebnisse nicht mehr. Die Sterne, Münzen und der Lernstand
bleiben richtig (die hängen am fertigen Durchgang). Falsch würde nur die Auswahl „welche Runden kamen schon dran“ beim Wiederholen.
Ein angefangener Durchgang beginnt nach jeder Änderung der Übung ohnehin neu.

## 2. Stand Diktat, Merkdiktat, Fallende Wörter

- **Diktat (Abschreiben)**: im Editor anlegbar (Text einfügen, Knopf „Abschreiben“). Im Spiel **nicht** spielbar.
  Es fehlen: Herz je 10 richtige Zeichen, Freundschaft ab 95 %, Zusatzmünzen bei 100 % im Wiederholen (Server rechnet vorerst mit einer Runde).
  Der Hilfetext im Editor sagt noch „Geschafft ab 90 %“ (alte Regel).
- **Merkdiktat**: im Editor anlegbar (Trennstellen per Klick oder `|`, Knopf „Nach jedem Satz trennen“). Im Spiel **nicht** spielbar.
  Der Server zählt es vorerst als eine Runde statt je Teil.
- **Fallende Wörter**: Die Datenbank kennt den Namen des Formats, mehr nicht. Kein Editor, keine Spielansicht, keine Prüfung
  (der Server antwortet „Diese Übung gibt es noch nicht.“). Wortliste, Tempo und Modus ohne Zeitdruck müssen neu gebaut werden.
  Am 2026-11-13 hatten Sie „erst einmal kein Modus ganz ohne Zeitdruck“ entschieden. Der neue Auftrag verlangt ihn. Das frage ich in Teilaufgabe 3 nach.

Die Schritte 9 (übrige Formate ins Spiel), 10 (Diktat) und 11 (Fallende Wörter) des Arbeitsplans sind also noch offen.
Teilaufgabe 2 und 3 decken sie mit ab.

## 3. Ablauf heute: eine Übung eingeben

Beispiel: Lückentext mit 6 Runden, als Text mit [Klammern].

| Schritt | Klicks |
|---|---|
| Menü „Übungen“, „+ Neue Übung“, Kachel „Lückentext“ | 3 |
| In das Textfeld klicken, Runde 1 tippen | 1 |
| Für Runde 2 bis 6: je „+ Runde“ und wieder ins Textfeld klicken | 10 |
| Nach unten: Titel anklicken und tippen | 1 |
| Stufe und Monster wählen | 2 |
| Kompetenz: Auswahl öffnen, Schulform, Jahrgang (Liste auf, Eintrag), Suchfeld, Haken | etwa 6 |
| „Speichern“ | 1 |
| **Summe** | **etwa 24 Klicks**, dazu Scrollen |

Im Formular-Modus kommen je Runde etwa 4 bis 6 Klicks dazu („+ Text“, „+ Lücke“, Felder anklicken).

Reibungspunkte:

1. Nach „+ Runde“ steht der Cursor nicht im Textfeld. Man muss jedes Mal klicken.
2. Man sieht immer nur **eine** Runde. Keine Übersicht aller Runden, kein schnelles Eingeben „eine Zeile = eine Runde“.
3. Bei vielen Runden wird die Reiter-Leiste sehr lang.
4. **Kein Schutz vor Verlust:** Wer vor dem Speichern auf „← Alle Übungen“ oder einen Menüpunkt tippt, verliert alles. Es gibt keine Warnung und keinen Entwurf.
5. „Runde entfernen“ löscht sofort, ohne Nachfrage.
6. Der Titel steht unten in Abschnitt 2. Fehlt er, erscheint die Meldung erst ganz unten nach „Speichern“.
7. Fehler in anderen Runden zeigt nur das Wort „(Fehler)“ am Reiter. Was falsch ist, sieht man erst nach dem Anklicken.
8. Das Formular bietet in jedem Format alle Bausteine an („+ Lücke“, „+ Auswahl“, „+ Zuordnung“, „+ Fehler“), auch die, die dort nicht passen.
9. Einstellungen für die ganze Übung (Groß-/Kleinschreibung, Antippen oder Dropdown, Kategorien, Runden pro Durchgang) stehen mitten im Runden-Kasten. Man kann meinen, sie gelten nur für diese Runde.
10. **Eine Übung kopieren geht nicht.** Der Hinweis im Paket empfiehlt aber, dieselbe Übung in mehreren Stufen anzulegen.
11. „Übung löschen“ (im Editor und in jeder Zeile der Liste) löscht auch alle Ergebnisse dazu. Das widerspricht der Grundregel „nichts löschen, nur archivieren“.
12. Übungen haben keine eigenen Tags (Jahrgang, Zweig) und keine Stichwörter. Jahrgang und Schulform werden aus den Kompetenzen und aus den Paketen abgeleitet. Für Teilaufgabe 4 (Suche nach Stichwörtern, Tags neben jeder Übung) braucht es eine Entscheidung, siehe Rückfragen.

## 4. Ablauf heute: ein Paket zusammenstellen

Beispiel: neues Paket mit 6 Übungen, einer Klasse zuweisen.

| Schritt | Klicks |
|---|---|
| Menü „Pakete“, „+ Neues Paket“ | 2 |
| Titel, Jahrgang, Zweig, „Anlegen und Übungen wählen“ | 4 |
| Je Übung: Liste öffnen, Eintrag suchen und wählen, „Hinzufügen“ | 3 × 6 = 18 |
| Zuweisen: Liste öffnen, Klasse wählen, „Zuweisen“ | 3 |
| **Summe** | **etwa 27 Klicks** |

Reibungspunkte:

1. Übungen wählt man aus **einer einzigen Aufklappliste**, nach Titel sortiert. Keine Suche, kein Filter, keine andere Sortierung.
2. In dieser Liste stehen auch alle 71 Erklärseiten. Die wenigen Übungen gehen darin unter.
3. Immer nur **eine** Übung auf einmal. Keine Mehrfachauswahl.
4. In der Liste sieht man Titel, Format und Sterne. Jahrgang, Zweig und Anzahl der Runden sieht man nicht.
5. Keine Vorschau einer einzelnen Übung vor dem Hinzufügen (nur das ganze Paket danach).
6. Reihenfolge ändern geht nur mit ↑ und ↓, je Klick ein Platz. Nach jedem Klick lädt die Seite alles neu.
7. Die Übungsliste (Menü „Übungen“) hat Suche und Filter, vergisst sie aber beim Wechsel der Seite.
8. „Paket löschen“ löscht wirklich (Übungen bleiben). Auch hier wäre Archivieren passender.

Vorhanden und zu erhalten: Zuweisung an Klasse oder einzelne Schüler:innen, Paket-Tags, Monster-Bild je Übung, Sterne, Paket-Vorschau, „Versuch früher freigeben“, Lernstand.

## 5. Verbesserungsvorschläge für die Eingabe (Ideen, nichts beschlossen)

Sortiert nach Nutzen und Aufwand. Aufwand: klein = bis etwa eine Stunde, mittel = halber Tag, groß = mehr.

| Nr. | Vorschlag | Nutzen | Aufwand |
|---|---|---|---|
| 1 | **Alle Runden untereinander** als Liste statt Reiter, jede mit eigenem Textfeld und kleiner Vorschau-Zeile | sehr hoch | mittel |
| 2 | **Schnell-Eingabe:** mehrere Zeilen einfügen, jede Zeile wird eine Runde (z. B. aus einem Arbeitsblatt kopiert) | sehr hoch | klein |
| 3 | **Entwurf automatisch sichern** (auf dem Gerät) und Warnung beim Verlassen mit ungespeicherten Änderungen | sehr hoch | klein |
| 4 | **Tastatur:** Strg + Eingabe = neue Runde mit Cursor im Feld, Strg + S = speichern | hoch | klein |
| 5 | **Runde duplizieren, verschieben, entfernen** mit „Rückgängig“ (gehört zu Teilaufgabe 2) | hoch | klein |
| 6 | **Übung kopieren** („Als neue Übung speichern“), z. B. für eine andere Stufe | hoch | klein |
| 7 | **Titel nach oben** und Pflichtfelder gleich am Feld markieren, nicht erst unten nach „Speichern“ | mittel | klein |
| 8 | **Fehlermeldungen je Runde** direkt an der Runde, in ganzen Sätzen mit Beispiel („In Runde 3 fehlt die schließende Klammer ]“) | mittel | klein |
| 9 | Formular zeigt nur die Bausteine, die zum Format passen | mittel | klein |
| 10 | Einstellungen der ganzen Übung in einen eigenen Kasten „Gilt für alle Runden“ | mittel | klein |
| 11 | **Archivieren statt Löschen** bei Übungen und Paketen (Ergebnisse bleiben) | hoch (Sicherheit) | klein |
| 12 | Kompetenz, Stufe und Monster der letzten Übung als Voreinstellung für die nächste | mittel | klein |
| 13 | Vorschau zeigt die Runde so, wie sie im Spiel aussieht (einmal prüfen, Lösung) | mittel | mittel |
| 14 | Knöpfe über dem Textfeld, die die Klammern setzen (Wort markieren, „Lücke“ antippen) | mittel | mittel |

Mit 1 bis 4 sinkt das Beispiel aus Abschnitt 3 geschätzt von etwa 24 auf etwa 12 Klicks (nicht gemessen).

## 6. Was mir sonst aufgefallen ist

- Der Branch `uebungsumbau` liegt **9 Commits hinter `main`** (der UI-Umbau wurde am 14.11. veröffentlicht). In der Datenbank sind
  drei Migrationen eingespielt, die es nur auf `main` gibt. Bevor ich hier etwas an der Datenbank ändere, muss `main` in diesen
  Branch geholt werden, sonst meldet das Einspielen einen Fehler.
- Im Auftrag stehen fünf Teilaufgaben, unter „fertig, wenn“ aber sechs (dort ist „Erklärungen bekommen einen eigenen Menüpunkt“ die Nummer 4).
