# Layout der leeren Farm (Teilaufgabe 2, Vorschlag)

Stand: 2026-11-17, Branch `lehrkraftseite`. **Nur Vorschlag und Mockup, am Spiel ist nichts geändert.**
Grundlage: `analyse-farm.md` und die Antworten von Jazz vom 2026-11-17 (siehe `docs/umbau/STATUS.md`).

- Mockup: `docs/farm/layout-leer.html`. Am besten über den Entwicklungs-Server öffnen:
  `http://localhost:5174/wortsalat/docs/farm/layout-leer.html`.
  - Mit `?plaetze=1` oder der Taste **P** sieht man alle Zonen und Plätze.
  - Das Mockup nutzt die echten Bilder und Stile des Spiels (nur gelesen) und prüft sich selbst. Steht unten rechts „Prüfung ok“, liegt alles auf Gras, nichts überdeckt sich und keine Tippflächen überlappen.
- Bildschirmfotos liegen in `docs/farm/bilder/`:
  - `layout-leer-1024x768.png`, `-1180x820.png`, `-1366x1024.png`: so sieht das Kind die Farm;
  - dieselben mit `-plaetze`: Zonen, Plätze und Tippflächen eingezeichnet;
  - `layout-leer-hochformat-768x1024.png`: Hinweis im Hochformat.

## 1. Der Hauptvorschlag in Kürze

1. **Das Spielfenster nutzt die ganze Breite.**
   - Holzrahmen von Rand zu Rand. Innen ist überall Meer, die Insel liegt in der Mitte.
   - Heute bleiben neben der Farm 26 bis 43 % der Breite leer. Künftig füllt das Fenster etwa 93 % der Breite.
2. **Die Insel wird breiter: 27 statt 21 Kacheln.**
   - Sie bleibt 15 Kacheln hoch. In diesem „Kern“ liegen alle Plätze.
   - Links und rechts kommen je **4 Spalten Landstreifen nur mit Landschaft** dazu (Bäume, Gras), ohne Plätze.
   - Auf breiten iPads sieht man mehr davon, auf schmalen werden sie am Rahmen abgeschnitten. Es fehlt dabei nie etwas, das man antippen kann.
3. **Vergrößerung nur ganzzahlig: 2-fach oder 3-fach.**
   - Der Faktor ist die größte ganze Zahl, bei der das ganze Gras des Kerns (25 × 13 Kacheln) in das Fenster passt.
   - Halbe Stufen (2,5-fach) entfallen. Alle Pixel sind damit gleich groß.
4. **Die Farm-Knöpfe wandern in die Kopfzeile**, die dadurch 72 statt 116 px hoch wird.
   - Links: Sammelalbum und Vorrat. In der Mitte: das Schild „Meine Farm“. Rechts: Shop, Farm einrichten und Münzen.
   - Die eigene Leiste über der Farm entfällt. Zusammen spart das gut 110 px Höhe.
5. **Die Meldung** ist ein Papier-Banner unten im Meer.
   - Dort stehen aktuelle Hinweise zur Farm.
   - **Einstein kommt nicht auf die Farm** (Jazz).
6. **Tippflächen sind immer mindestens 48 × 48 px.**
   - Kleine Dinge (Feld, Huhn, Deko) bekommen eine unsichtbar größere Tippfläche.
   - Dafür liegt zwischen zwei kleinen antippbaren Dingen immer mindestens eine freie Kachel.
7. **Im Hochformat** steht nur der Hinweis „Dreh dein iPad, dann siehst du deine Farm.“ Kopfzeile und Menü bleiben bedienbar.

## 2. Größen auf den drei iPads (gemessen im Mockup)

| Fenster (Querformat) | Faktor | 1 Kachel | Insel-Kern | Innenfläche Spielfenster | sichtbarer Landstreifen | heute (zum Vergleich) |
|---|---|---|---|---|---|---|
| 1024 × 768 | 2 | 32 px | 864 × 480 | 940 × 539 | je ~38 px (gut 1 Kachel) | Farm 672 px breit, Seite scrollt 16 px |
| 1180 × 820 | 2 | 32 px | 864 × 480 | 1096 × 591 | je ~116 px (gut 3½ Kacheln) | Farm 672 px breit, 43 % leer |
| 1366 × 1024 | 3 | 48 px | 1296 × 720 | 1282 × 795 | keiner (der Wasserrand des Kerns wird je 7 px abgeschnitten) | Farm 1008 px breit |

So ist das gerechnet:
- Die Innenfläche ist die Fensterbreite minus 2 × 8 px Rand und 68 px Holzrahmen.
- Die Höhe ist die Fensterhöhe minus Kopfzeile (72), Menü (83), 8 px Rand und 66 px Holzrahmen.
- Die Insel steht oben (eine halbe Wasserreihe ist sichtbar). Darunter bleibt Meer für die Meldung, also für 1 bis 2 Zeilen Text.

**Safari am echten iPad** zieht oben noch die Adress- und Tableiste ab, geschätzt etwa 50 bis 70 px.
- Bei 1024 × 768 bleiben dann noch etwa 470 px Höhe.
- Das Gras des Kerns braucht 13 × 32 = 416 px. Es passt also, nur die Meldung rückt dann näher an die Insel.
- **Nicht getestet**, weil kein iPad zur Hand war.
- Am sichersten ist die Farm als **Web-App auf dem Home-Bildschirm** („Zum Home-Bildschirm“, dann ohne Safari-Leisten).

## 3. Zonen und Plätze (alle Kachelangaben im Kern, 0 bis 26 waagerecht, 0 bis 14 senkrecht)

| Zone | Wo | Plätze | heute | Bemerkung |
|---|---|---|---|---|
| **Acker** | links (x 3 bis 9, y 4 bis 8) | **12 Felder** im Abstand von 2 Kacheln (4 zu Beginn, 8 im Shop) | 12 Felder dicht an dicht | Zwischen den Feldern verläuft ein Grasweg. So hat jedes Feld 48 px Tippfläche, und die Figur kommt überall hin. |
| **Obstgarten** | links oben (y 1 bis 3) | 3 Obstbäume: Orange, Pfirsich, Birne | über dem Acker bzw. vor dem Stall | jetzt alle drei nebeneinander |
| **Scheune** | rechts oben (x 18 bis 23, y 1 bis 6) | **2 Kühe** (Jazz: höchstens 2) | 4 Kühe, 2 davon vor der Scheune | Der Platz vor der Scheune wird frei. |
| **Hühnerstall** | rechts unten (Stall bei x 19, y 9) | **4 Hühner** rund um den Stall | 4 Hühner | je mit freier Kachel dazwischen |
| **Monster-Hütte** | links unten (x 4 bis 7, y 10 bis 13) | Hütte + Laufweg des Monsters (x 8 bis 9, y 12) | links unten | unverändert, nur verschoben |
| **Brunnen** | Mitte (x 13 bis 14, y 7 bis 8) | 1 | Mitte | |
| **Boot** | Bucht oben Mitte (x 12 bis 14, y 1 bis 2) | 1 (im Wasser) | Bucht oben | |
| **Deko (kaufbar)** | verteilt am Rand und im Hof | **18 Plätze** D1 bis D18 | 18 | Das Kind wählt unter „Farm einrichten“, was auf welchem Platz steht (Jazz: ja). Genaueres in Teilaufgabe 4. |
| **Wachsende Deko** | gut sichtbar verteilt | **8 Plätze** W1 bis W8 (1 × 1, 2 × 1 oder 2 × 2) | gibt es nicht | Was dort wächst, legt Teilaufgabe 4 fest. Im Mockup sind es beschriftete Platzhalter. W4 ist ein Steg in der unteren Bucht. Sie sind nicht antippbar, nur zum Anschauen. |
| **Figur** | Start im Hof (x 16, y 8) | – | Mitte | |
| **Liegendes** (Ernte, Ei, Milch, Monster-Geschenk) | Ernte liegt **auf dem Feld selbst**, Ei/Milch und Geschenk an einem festen Platz neben Tier bzw. Hütte | – | „daneben“, automatisch gesucht | Ein fester Platz hält die Tippflächen frei. |
| **Meldung** | Banner unten im Meer | – | Banner unten im Spielfenster | Hinweise zur Farm (z. B. „Tippe ein Feld an und pflanze deinen ersten Samen.“) |
| **Knöpfe** | Kopfzeile | Sammelalbum, Vorrat, **Shop (neu)**, Farm einrichten | Leiste über der Farm (ohne Shop) | Shop bleibt außerdem im Menü unten. |

**Alle heutigen Funktionen haben einen Platz:**
- Felder pflanzen und ernten;
- Tiere füttern;
- Obstbäume, Brunnen und Boot;
- Deko und Farm einrichten;
- Farm-Monster mit Hütte und Geschenk;
- Vorrat und Sammelalbum;
- Meldungen;
- Laufen der Figur.

Neu sind Shop-Knopf und wachsende Deko.

## 4. Tippflächen

- Bei 2-fach ist eine Kachel 32 px groß. Felder, Hühner und Deko bekommen eine **unsichtbare Tippfläche von 48 × 48 px**, die mittig um das Bild liegt.
- Damit sich zwei Tippflächen nie überlappen, liegt zwischen zwei kleinen antippbaren Dingen **mindestens eine freie Kachel**. Das Mockup prüft das für alle 12 Felder, 4 Hühner und 18 Deko-Plätze.
- Bei 3-fach ist schon die Kachel 48 px groß.
- Große Dinge (Kuh, Obstbaum, Boot, Brunnen, Monster) sind ohnehin mindestens 64 px groß.
- Die Knöpfe in der Kopfzeile sind 56 × 56 px. Nichts hängt von Hover ab.

## 5. Der Startzustand soll einladend aussehen

Ein neues Kind sieht:
- die Insel mit Ufer, Meer und Holzrahmen;
- **4 Felder**;
- **Scheune und Hühnerstall, schon da, aber leer** (Vorschlag);
- 9 feste Bäume, davon 4 auf den Landstreifen;
- kleine Gras-Halme;
- die **8 wachsenden Dekorationen in Stufe 1**;
- die Figur im Hof;
- die erste Meldung.

**Neu gegenüber heute:** Scheune und Stall erscheinen heute erst mit der ersten Kuh bzw. dem ersten Huhn.
- Von Anfang an machen sie die Insel sofort zur Farm und zeigen dem Kind, dass hier einmal Tiere wohnen können.
- Das ist rein optisch und braucht keine Datenbank-Änderung. **Bitte bestätigen** (Entscheidung E2).

## 6. Hungrige Tiere und Monster-Geschenk (Jazz: Ausrufezeichen zu groß und zu unruhig)

Heute hängt über jedem hungrigen Tier und über dem Monster mit Geschenk eine wackelnde Ausrufezeichen-Blase (16 × 16, bei 2-fach 32 px). Bei 4 Hühnern, Kühen und Monster sind das bis zu 7 wackelnde Blasen.

Vorschläge:

| | Darstellung | Ruhe | Verständlich ohne Lesen | Grafik |
|---|---|---|---|---|
| **A (empfohlen)** | **Leerer Futternapf** neben jedem Huhn, **leerer Trog** in der Scheune. Nach dem Füttern ist er gefüllt. Ohne Bewegung. | sehr ruhig | ja (leer = Hunger, wie im echten Stall) | Trog gibt es (`trog.png`), Napf neu (8 × 8 oder 16 × 16, 2 Bilder: leer und voll) |
| B | Kleines **Herz mit Rand** (8 × 8) über dem Tier: leer = Hunger, nach dem Füttern gefüllt. Ohne Bewegung. | ruhig | mittel (Herz kennt das Kind vom Füttern) | `herz.png` gibt es, Umriss neu |
| C | Das **Tier zeigt es selbst**: Huhn pickt am Boden, Kuh schaut zum leeren Trog | ruhig, aber bewegt | mittel | neue Bilder für Kuh/Huhn nötig |
| D | Gar nichts am Tier, nur die **Meldung**: „Deine Hühner haben Hunger.“ | am ruhigsten | nein (man muss lesen) | keine |

**Empfehlung:** A, und dazu einmal pro Besuch die Meldung (wie D).
- Die Meldung erscheint nur, wenn mindestens ein Tier hungrig ist.
- **Monster-Geschenk:** keine Blase mehr. Der Samen liegt ohnehin sichtbar neben der Hütte.
- Liegendes **hüpft nicht mehr**, sondern liegt still. Das macht die Farm insgesamt ruhiger.
- Die Meldung sagt einmal: „Dein Monster hat dir etwas mitgebracht.“

## 7. Höchstens 2 Kühe

- Der Shop verkauft künftig nur noch 2 Kühe. Die Scheune hat genau 2 Plätze.
- Heute hat **nur die Testfarm Pfau-99** mehr als 2 Kühe, nämlich 4 (Abfrage in der Datenbank am 2026-11-17).
- Echte Kinder sind also nicht betroffen.
- Für den Fall der Fälle gilt: Gekauftes geht nie verloren. Eine 3. und 4. Kuh bleiben im Besitz, stehen aber nicht in der Scheune.
- Vorschlag dazu: Sie erscheinen im Sammelalbum. Im Münz-Vorschlag (Teilaufgabe 5) kläre ich, ob es dafür eine Gutschrift gibt.

## 8. Was später im Code zu ändern wäre (nicht jetzt)

- `src/lib/landschaft.ts`:
  - neue Karte (Kern 27 × 15 plus Landstreifen);
  - neue Plätze;
  - die Kuh-Plätze auf 2 gekürzt.
  - Die Tests in `landschaft.test.ts` prüfen schon „alles auf Gras, nichts überdeckt sich“. Dazu käme „kleine Dinge mit freier Kachel dazwischen“.
- `src/schueler/Farm.tsx`:
  - Größenregel (ganzzahlig, nach dem Gras des Kerns);
  - Meer als Hintergrund des ganzen Fensters;
  - Knöpfe in die Kopfzeile;
  - Tippflächen 48 px;
  - Scheune und Stall von Anfang an.
- `SchuelerBereich.tsx`: auf der Farm eine schlankere Kopfzeile mit den Farm-Knöpfen sowie der Hinweis im Hochformat.
- **Datenbank:**
  - keine Schema-Änderung;
  - die Höchstzahl der Kühe ist eine Datenänderung im Shop-Angebot (vorher fragen);
  - Deko „das Kind wählt den Platz“ braucht eine Spalte für den Platz. Das wird in Teilaufgabe 4 geklärt.

## 9. Entscheidungen für Jazz

| Nr. | Frage | Vorschlag |
|---|---|---|
| E1 | Hauptvorschlag (volle Breite, Kern 27 × 15 mit Landstreifen, nur 2- oder 3-fach, Knöpfe in der Kopfzeile) | annehmen |
| E2 | Scheune und Hühnerstall von Anfang an sichtbar (leer)? | ja |
| E3 | Felder mit Grasweg dazwischen statt dicht an dicht (für große Tippflächen)? | ja |
| E4 | Hungrige Tiere: Variante A (Napf/Trog) plus Meldung, keine Blasen mehr, Liegendes hüpft nicht | ja |
| E5 | Shop-Knopf auf der Farm zusätzlich zum Menüpunkt Shop | ja (Jazz hat zugestimmt, Platz: Kopfzeile rechts) |

## 10. Geprüft und nicht geprüft

**Geprüft:**
- Mockup im Browser bei 1024 × 768, 1180 × 820, 1366 × 1024 (Querformat) und 768 × 1024 (Hochformat), Fotos mit Edge im Kopfmodus.
- Kein waagerechtes Scrollen.
- Faktor und Maße wie in der Tabelle.
- Selbstprüfung „Prüfung ok“: alles auf Gras, nichts überdeckt sich, Tippflächen überlappen nicht.
- Zahl der Kühe je Kind per Lese-Abfrage.

**Nicht getestet:**
- echtes iPad (Safari-Leisten, Finger, Leistung), weil keines zur Hand war;
- dunkler Modus des Mockups, weil dafür die Farben der Kopfzeile im Mockup nicht nachgebaut sind;
- Bewegung (Tiere laufen), weil das Mockup ein Standbild ist.

Im Mockup fehlen außerdem die Symbole im Menü unten; dort stehen nur die Wörter.
