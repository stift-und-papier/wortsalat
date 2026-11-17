# Analyse Farm (Teilaufgabe 1, nur gelesen)

Stand: Branch `lehrkraftseite` = `main` (Commit 758fc78), 2026-11-17. Nichts geändert.
Geprüft durch Lesen des Codes und Messen im Browser (Test-Schüler **Pfau-99**, voll ausgebaute Testfarm).

## 1. Aufbau der Ansicht

| Teil | Datei | Was es tut |
|---|---|---|
| Seite „Meine Farm“ | `src/schueler/SchuelerBereich.tsx` (Bereich `farm`) | Eigener Menüpunkt. Kopfzeile: Dunkel-Schalter links, Holzschild „Meine Farm“ Mitte, Münzen rechts. Menü unten (Lernweg, Übungen, Erklärungen, Farm, Shop, Hilfe). |
| Farm selbst | `src/schueler/Farm.tsx` (686 Zeilen) | Leiste (Sammelalbum, Vorrat, Zahnrad „Farm einrichten“), Spielfenster mit Holzrahmen, Meldungs-Banner unten im Fenster, Menüs (Pflanzen, Füttern, Vorrat, Einrichten). |
| Bewegte Tiere/Monster | `src/schueler/FarmTier.tsx` | Kuh, Huhn, Monster laufen ein paar Pixel hin und her; still bei „Bewegung reduzieren“. |
| Karte, Plätze, Wegsuche | `src/lib/landschaft.ts` | Textbild `KARTE` (21 × 15 Kacheln zu 16 px), alle festen Plätze, Hindernisse, Wegsuche `weg` (A*-artige Breitensuche). |
| Shop | `src/schueler/Shop.tsx`, `src/lib/shop.ts` | Eigene Seite (Menüpunkt Shop). |
| Monster | `src/lib/monster.ts` | Größe auf der Farm (`farmMal`), Dachfarbe der Hütte. |
| Styles | `src/design/bausteine.css` (`.farm*`) | Rahmen, Leiste, Banner, Menüs. |
| Server | `supabase/migrations/*felder*`, `*tiere*`, `*einsammeln*`, `*obstbaeume_boot*`, `*farm_monster*` | `farm_daten`, `pflanzen`, `ernten`, `fuettern`, `einsammeln`, `baum_ernten`, Monster-Samen. |

**Einstein steht nicht auf der Farm**, sondern auf der Startseite „Mein Lernweg“. Der **Shop** ist eine eigene Seite, auf der Farm gibt es keinen Shop-Knopf (nur Links in leeren Menüs „Im Shop gibt es welche“).

## 2. Layout-Technik und Größen

- **Hintergrund** (Wasser, Gras, Acker, Scheune, Stall, feste Bäume) wird einmal auf ein `<canvas>` in Originalgröße 336 × 240 Pixel gemalt
  und per CSS pixelgenau vergrößert (`image-rendering: pixelated`).
- **Alles Antippbare** (Felder, Tiere, Deko, Bäume, Boot, Monster, Liegendes, Figur) sind absolut positionierte HTML-Elemente über dem Canvas,
  Position = Kachel × 16 × Faktor.
- **Faktor `mal`** (`Farm.tsx`, Zeile 67–77): so groß, wie Breite **und** Höhe bis zum Menü erlauben, in **halben Stufen** (2; 2,5; 3; …),
  mindestens 2, höchstens 4. Halbe Stufen sind gewollt (Sprite kann x,5-fach); streng ganzzahlig ist das Bild dann nicht mehr.
- Die Karte ist immer **21 × 15 Kacheln** (Seitenverhältnis 1,4 : 1). Die iPads im Querformat sind 1,33 bis 1,44 : 1 – die Höhe begrenzt also,
  und weil oben Kopfzeile + Leiste (184 px) und unten das Menü (83 px) Platz kosten, bleibt die Farm schmal.

### Gemessen im Browser (Pfau-99, Querformat)

| Fenster | Faktor | Farm (Bild) | leer links + rechts | Platz unter der Farm bis Menü | Scrollen |
|---|---|---|---|---|---|
| 1024 × 768 (iPad 9,7"/10,2") | 2 | 672 × 480 | je 169 px (33 %) | 21 px | **ja, 16 px** (Seite 784 hoch) |
| 1180 × 820 (iPad 10,9"/Air) | 2 | 672 × 480 | je 254 px (**43 %**) | 73 px | nein |
| 1366 × 1024 (iPad Pro 12,9") | 3 | 1008 × 720 | je 179 px (26 %) | 37 px | nein |

Bei 1180 × 820 würde 2,5-fach 600 px Höhe brauchen; ab Oberkante 184 px endet das bei 784 px, das Menü beginnt aber bei 737 px. Darum bleibt es 2-fach.
**Fazit:** Im Querformat bleiben 26 bis 43 % der Breite leer. Genau dort liegt der Platz für die geplante Erweiterung.

### Tippflächen (gemessen bei 1180 × 820, Faktor 2)

| Ding | kleinste Seite |
|---|---|
| Feld, Huhn, Deko, Liegendes | **32 px** |
| Monster | 48 px |
| Obstbaum, Boot, Kuh | 64 px |

Bei Faktor 2 sind Felder, Hühner und Deko **kleiner als 44 pt** (iPad: 1 CSS-Pixel = 1 pt). Bei 1366 × 1024 (Faktor 3) sind es 48 px.
Das ist ein heutiges Problem, das ein neues Layout lösen sollte.

## 3. Raster und Plätze (alles in Kacheln, `landschaft.ts`)

Karte 21 × 15, Gras-Insel mit Buchten (Zeilen 0 und 14 und Ränder sind Wasser).

| Was | Plätze | Größe | Bemerkung |
|---|---|---|---|
| Felder | 12 (4 × 3 ab Kachel 3/3) | 1 × 1 | 4 von Anfang an, 8 zukaufbar (je 40) |
| Hühner | 4 | 1 × 1 | Stall (3 × 3 bei 14/9) erscheint mit dem ersten Huhn |
| Kühe | 4 | 2 × 2 | 2 in der Scheune (13–18 / 2–7), 2 davor; Scheune erscheint mit der ersten Kuh |
| Obstbäume | 3 feste Plätze | 2 × 2 (Bild 48 × 48) | Orange 3/1, Pfirsich 5/1, Birne 11/9 |
| Feste Bäume | 4 | 2 × 2 bzw. 1 × 2 | Teil des Hintergrunds, nicht antippbar |
| Brunnen | 1 (8/6) | 2 × 2 | kaufbar |
| Boot | 1 (10/1, im Wasser) | 3 × 2 | kaufbar |
| Deko | **18 feste Plätze** | 1 × 1 | in Kaufreihenfolge belegt; im Fenster „Farm einrichten“ ausblendbar |
| Monster-Hütte | 1 (2/8) | 4 × 4 Bild | nur mit Farm-Monster, Monster läuft bei 4/12 |
| Gras-Deko | 10 | 1 × 1 | nur Schmuck im Hintergrund |
| Figur | Start 10/7 | 1 × 2 | läuft per Antippen (Wegsuche um Hindernisse) |
| Liegendes | automatisch (`ablagePlaetze`) | 1 × 1 | Ernte, Eier, Milch, Monster-Samen bis zum Einsammeln |

## 4. Wie Platzierungen gespeichert werden

- **Nicht frei platzierbar.** Gespeichert wird nur, *was* ein Kind besitzt (`besitz`), *was* auf welchem Feld wächst (`pflanzungen.feld` = Nummer 0–11)
  und *was* wo liegt (`vorrat.liegt_bei`, z. B. `feld:3`, `tier:<id>`, `monster:<name>`).
- **Wo** etwas steht, legt der Code fest: Felder, Tiere, Bäume, Deko werden der Reihe nach auf die festen Plätze in `landschaft.ts` gesetzt.
- Deko kann im Fenster „Farm einrichten“ ausgeblendet werden (gekauft bleibt sie).
- Folge für die Erweiterung: Neue Plätze = Änderung in `landschaft.ts` (Code), **keine Datenbank-Änderung**, solange das Kind nicht selbst
  platzieren soll. Freies Platzieren durch das Kind (Teilaufgabe 4) bräuchte neue Spalten (z. B. `besitz.platz`) → Schema-Änderung, vorher fragen.

## 5. Asset-Inventar der Farm (in `src/grafik/`, also schon im Spiel)

| Grafik | Größe je Bild | Bilder | Animation |
|---|---|---|---|
| `gras` (Blob-Kachelsatz Gras/Ufer), `wasser`, `gras_deko` | 16 × 16 | 55 / 1 / 12 | nein |
| `feld` (Acker einzeln) | 14 × 14 | 1 | nein |
| `pflanzen` (13 Sorten × 4 Wachstumsstufen) | 16 × 16 | 52 | Stufen statt Animation |
| `saatgut` (Samentüten) | 16 × 16 | 26 | nein |
| `huhn` | 16 × 16 | 24 | laufen, picken, stehen |
| `kuh` | 32 × 32 | 16 | laufen, stehen |
| `stall` (Hühnerstall) | 48 × 48 | 1 | nein |
| `wand` (Scheune 9-teilig), `heu`, `trog` | 16 × 16 / 32 × 16 | 9/1/1 | nein |
| `baum`, `baum_klein` | 32 × 32 / 16 × 32 | 1 | nein |
| `baum_orange`, `baum_pfirsich`, `baum_birne` | 48 × 48 | je 48 | Früchte fallen beim Ernten |
| `baum_ohne_obst` | 48 × 48 | 1 | nein |
| `brunnen` | 32 × 32 | 1 | nein |
| `deko_boot` | 48 × 32 | 2 | schaukelt |
| Deko: Busch, Blume gelb/lila, Pilz, Stein, Pilzhaus, Katzenblume rosa/blau | 16 × 16 | je 1 | nein |
| Erzeugnisse: Ei (3 Farben), Milch (3 Sorten), Früchte (4) | 16 × 16 | je 1 | hüpfen beim Liegen (CSS) |
| `figur`, `figur_blau`, `figur_katze` | 16 × 32 | je 24 | 8 Richtungen, laufen |
| Monster (10 Arten) | 16 × 16 bis 64 × 32 | 4–15 | laufen |
| `huette` (9 Dachfarben) | 64 × 64 | 9 | nein |
| `blase_ausruf`, `dialog_blase`, `herz` | 16 × 16 / 30 × 28 | 3 / 1 / 1 | Ausrufezeichen wackelt |
| `truhe`, `buch_symbol`, `tafel`, `menue_rahmen`, `menue_platz`, `knopf_x` | – | – | Knöpfe und Menüs |

**Gekauft, aber noch nicht im Spiel** (liegt in `assets/entpackt/`, Lizenz erlaubt einzelne Bilder): Sprout Lands Premium
(`Objects`: Bäume/Stümpfe/Büsche, Pilze/Blumen/Steine, Wasser-Objekte, Schilder, Picknick, Werkbank, Brunnen; `Animals`: Küken, Kälbchen,
Hühnernest/Ei; `Tilesets`: Gebäudeteile, Bodenkacheln), Sprout Lands Basic (Zäune, Wege, Holzbrücke, Möbel, Hügel, Wasser-Kachelsatz,
Holzhaus), Sprout Sorry Pack (Early Access: Dungeon, Halloween, Ocean, Plant update 2, Winter, Village), Nature Landscapes (Hintergründe),
Humble Gift Paper UI. Für viele Deko-Ideen gibt es also schon Grafiken; genauer prüfe ich das in Teilaufgabe 4.

## 6. Verhalten auf verschiedenen iPads (heute)

- **Querformat:** siehe Tabelle oben. Alles funktioniert, aber 26–43 % der Breite bleiben leer; bei 1024 × 768 scrollt die Seite um 16 px.
  In Safari am echten iPad fehlen zusätzlich die Höhe der Adressleiste und Tableiste → dort kann die Farm unter das Menü rutschen (laut STATUS
  nicht am echten iPad getestet).
- **Hochformat:** bisher unterstützt (in STATUS mit 820 × 1180 geprüft, Faktor 2, Karte passt in die Breite). Laut Auftrag wird Hochformat künftig
  nicht mehr genutzt.
- **Halbe Stufen:** 2,5-fach kommt bei keinem der drei gemessenen Formate vor (Höhe reicht nicht). Bei 2,5-fach wären Pixel nicht mehr alle gleich groß.
- **Bewegung:** gleichzeitig bewegen sich höchstens 4 Hühner, 4 Kühe, 1 Monster, 1 Figur, 1 Boot, Ausrufezeichen-Blasen und hüpfende Ernte;
  das läuft im Browser flüssig (Leistung am echten iPad nicht gemessen).

## 7. Was mir für die Erweiterung auffällt

1. **Breite:** Die Karte ist fest 21 × 15. Um die Breite zu nutzen, muss die Karte **breiter werden** (mehr Spalten), nicht nur größer.
   Bei gleicher Höhe (15 Kacheln) passen im Querformat etwa 30 bis 32 Spalten, bei Faktor 2 sind das 960–1024 px.
2. **Tippflächen** bei Faktor 2 zu klein (32 px). Lösung entweder größerer Faktor (dann weniger Kacheln) oder größere unsichtbare Tippflächen
   um kleine Dinge.
3. **Höhe:** Kopfzeile + Leiste kosten 184 px. Eine schlankere Leiste (z. B. Knöpfe ins Spielfenster) würde Höhe für Faktor 2,5 oder 3 freigeben.
4. **Einstein und Shop** haben auf der Farm heute keinen Platz. Wenn sie dort hinsollen, brauchen sie eine Zone.
5. Freies Platzieren durch das Kind gibt es nicht; feste Plätze sind einfach und robust (die Wegsuche bleibt geprüft).

**Nicht getestet:** echtes iPad (Safari-Leisten, Finger-Tippen, Leistung); Hochformat in dieser Runde (nur aus STATUS übernommen).
