# Layout der leeren Farm (Teilaufgabe 2, Vorschlag)

Stand: 2026-11-17, Branch `lehrkraftseite`. **Nur Vorschlag und Mockup, am Spiel ist nichts geändert.**
Grundlage sind `analyse-farm.md` und die Antworten von Jazz vom 2026-11-17 (siehe `docs/umbau/STATUS.md`).
Überarbeitet nach den Rückmeldungen von Jazz zu E1 bis E5 und E6 bis E8 (Abschnitt 9).

**Mockup:** `docs/farm/layout-leer.html`.
- Am besten über den Entwicklungs-Server öffnen: `http://localhost:5174/wortsalat/docs/farm/layout-leer.html`.
- Mit `?plaetze=1` oder der Taste **P** sieht man alle Zonen und Plätze.
- Das Mockup nutzt die echten Bilder und Stile des Spiels (nur gelesen).
- Es prüft sich selbst. Steht unten rechts „Prüfung ok“, liegt alles auf Gras bzw. im Wasser, nichts überdeckt sich und keine Tippflächen überlappen.

**Bildschirmfotos** in `docs/farm/bilder/`:
- `layout-leer-1024x768.png`, `-1180x820.png`, `-1366x1024.png`: so sieht das Kind die Farm.
- Dieselben mit `-plaetze`: Zonen, Plätze und Tippflächen eingezeichnet.
- `layout-leer-hochformat-768x1024.png`: Hinweis im Hochformat.

## 1. Der Hauptvorschlag in Kürze

1. **Das Spielfenster nutzt die ganze Breite.**
   - Holzrahmen von Rand zu Rand, innen überall Meer, die Insel in der Mitte.
   - Heute bleiben neben der Farm 26 bis 43 % der Breite leer. Künftig füllt das Fenster etwa 93 % der Breite.
2. **Die Insel wird breiter: 27 statt 21 Kacheln.**
   - Sie bleibt 15 Kacheln hoch. In diesem „Kern“ liegen alle Plätze.
   - Links und rechts kommen je **4 Spalten Landstreifen nur mit Landschaft** dazu (Bäume, Gras), ohne Plätze.
   - Auf breiten iPads sieht man mehr davon, auf schmalen werden sie am Rahmen abgeschnitten.
3. **Vergrößerung nur 2-fach oder 3-fach (ganzzahlig).**
   - Es gilt die größte ganze Zahl, bei der das ganze Gras des Kerns (25 × 13 Kacheln) ins Fenster passt.
4. **Farm-Knöpfe in der Kopfzeile** (64 statt 116 px hoch).
   - Links: Sammelalbum und Vorrat. Rechts: Shop, Farm einrichten und Münzen.
   - **Die Überschrift „Meine Farm“ entfällt auf der Farm** (Jazz). Das spart Platz.
   - **Der Shop-Knopf ersetzt den Menüpunkt „Shop“ unten.** Er ist breiter und trägt neben dem Symbol das Wort **„Laden“** (Jazz). Das Menü hat dann 5 Punkte: Lernweg, Übungen, Erklärungen, Farm, Hilfe.
   - **Das Buch im Sammelalbum-Knopf wird kleiner**, etwa so groß wie die Truhe (siehe Abschnitt 8).
5. **Die Meldung** ist ein Papier-Banner unten im Meer. Dort stehen aktuelle Hinweise zur Farm. Einstein kommt nicht auf die Farm.
6. **Felder liegen dicht wie heute (4 × 3).**
   - Das hat sich in Tests bewährt.
   - Der gewonnene Platz geht an die Deko: **26 Deko-Plätze statt 18** in drei Größen, dazu **16 Blumenplätze in 6 Beeten**.
7. **Tippflächen:**
   - Hühner und Deko bekommen mindestens 48 × 48 px.
   - Felder bleiben bei 2-fach 32 px. Das ist eine bewusste Ausnahme (Jazz, E3).
8. **Im Hochformat** steht nur der Hinweis „Dreh dein iPad, dann siehst du deine Farm.“

## 2. Größen auf den drei iPads (gemessen im Mockup)

| Fenster (Querformat) | Faktor | 1 Kachel | Insel-Kern | Innenfläche Spielfenster | sichtbarer Landstreifen | heute (zum Vergleich) |
|---|---|---|---|---|---|---|
| 1024 × 768 | 2 | 32 px | 864 × 480 | 940 × 547 | je ~38 px (gut 1 Kachel) | Farm 672 px breit, Seite scrollt 16 px |
| 1180 × 820 | 2 | 32 px | 864 × 480 | 1096 × 599 | je ~116 px (gut 3½ Kacheln) | Farm 672 px breit, 43 % leer |
| 1366 × 1024 | 3 | 48 px | 1296 × 720 | 1282 × 803 | keiner (der Wasserrand des Kerns wird je 7 px abgeschnitten) | Farm 1008 px breit |

So ist gerechnet:
- **Innenfläche:** Fensterbreite minus 2 × 8 px Rand und 68 px Holzrahmen.
- **Höhe:** Fensterhöhe minus Kopfzeile (64), Menü (83), 8 px Rand und 66 px Holzrahmen.
- Die Insel steht oben. Darunter bleibt Meer für die Meldung.

**Safari am echten iPad** zieht oben noch Adress- und Tableiste ab, geschätzt 50 bis 70 px.
- Bei 1024 × 768 bleiben dann etwa 480 px Höhe. Das Gras braucht 416 px, es passt also.
- **Nicht getestet**, weil kein iPad zur Hand war.
- Am sichersten ist die Farm als Web-App auf dem Home-Bildschirm. Dann gibt es keine Safari-Leisten.

## 3. Zonen und Plätze (Kachelangaben im Kern: 0 bis 26 waagerecht, 0 bis 14 senkrecht)

| Zone | Wo | Plätze | heute | Bemerkung |
|---|---|---|---|---|
| **Acker** | links (x 3 bis 6, y 4 bis 6) | **12 Felder** dicht (4 zu Beginn, 8 im Shop) | 12 Felder dicht | wie heute (Jazz, E3) |
| **Obstgarten** | links oben (y 1 bis 3) | 3 Obstbäume: Orange, Pfirsich, Birne | über dem Acker bzw. vor dem Stall | jetzt alle drei nebeneinander |
| **Scheune** | rechts oben (x 18 bis 23, y 1 bis 6) | **2 Kühe** | 4 Kühe | Jazz: höchstens 2 |
| **Hühnerstall** | rechts unten (Stall bei x 19, y 9) | **4 Hühner** rund um den Stall | 4 | je mit freier Kachel dazwischen |
| **Monster-Hütte** | links, unter dem Acker (Platz x 4 bis 7, y 8 bis 11) | Hütte und Laufweg des Monsters vor der Tür (x 5 bis 6, y 12) | links unten am Ufer | **Weiter oben, der Eingang zeigt nicht aufs Wasser** (Jazz). **Das Monster läuft nie ins Wasser:** links und rechts vom Laufweg und darunter liegt Gras; das Mockup prüft das. **Zwei Größen:** große Monster (Rübchen, Schleime, Fledermaus) wohnen in der heutigen Hütte (4 × 4); kleine Monster (Gespenst, Spinnen, Maus) bekommen eine **kleine Hütte 2 × 3** unten mittig auf dem Platz: den **kleinen Hühnerstall mit einem Fenster** aus dem Premium-Paket (`Chikcen_Houses.png`, 32 × 48, 6 Dachfarben; Jazz). Keine neue Grafik nötig. |
| **Brunnen** | Mitte (x 13 bis 14, y 7 bis 8) | 1 | Mitte | |
| **Boot** | Bucht oben Mitte (x 12 bis 14, y 1 bis 2) | 1 (im Wasser) | Bucht oben | |
| **Deko klein** (1 × 1) | verstreut: am Rand, beim Baum, am Brunnen, am Hofweg, am Ufer | **20 Plätze** D1 bis D20 | 18 | Steine, Pilze, Schilder, Baumstumpf, Laterne, Briefkasten und Ähnliches. Bewusst nicht in Reihen (Jazz). |
| **Deko groß** (2 × 2) | neben dem Acker, vor der Scheune | **2 Plätze** G1, G2 | – | Picknick, Bank mit Tisch, Bienenstock, Kirschblütenbusch |
| **Deko im Wasser** (1 × 1) | nur oben: Bucht und Ufer | **4 Plätze** S1 bis S4 | – | Seerosen, Schilf, Steine im Wasser, Frosch |
| **Blumenbeete** (Jazz: mehr Blumen) | am Acker, am Brunnen, an der Hütte, an der Scheunentür, am Ufer, am Obstgarten | **6 Beete mit 16 Blumenplätzen** (je 2 bis 4 Kacheln) | – | Die Blumen eines Beets stehen dicht wie die Felder. Antippen öffnet unter „Farm einrichten“ die Auswahl für das Beet. Nur Blumen passen hinein. |
| **Wachsende Deko** | gut sichtbar verteilt | **8 Plätze** W1 bis W8 (1 × 1 bis 2 × 2) | – | Kirschbaum, Wildblumen, Sonnenblume, Seerosen, Beerenbusch, Vogelhaus, Eiche, Windrad; Stufen und Plätze in `dekorationen.md`. Sie sind nicht antippbar. |
| **Figur** | Start im Hof (x 16, y 8) | – | Mitte | |
| **Liegendes** (Ernte, Ei, Milch, Monster-Geschenk) | Ernte auf dem Feld selbst; Ei/Milch und Geschenk an einem festen Platz neben Tier bzw. Hütte | – | „daneben“ | Geschenke **hüpfen weiter** (Jazz, E4). |
| **Meldung** | Banner unten im Meer | – | Banner im Spielfenster | Hinweise zur Farm, siehe Abschnitt 6 |
| **Knöpfe** | Kopfzeile | Sammelalbum, Vorrat, Shop, Farm einrichten | Leiste über der Farm | Der Shop ist nicht mehr im Menü unten. |

Das Kind wählt unter „Farm einrichten“, was auf welchem Deko-Platz steht (Jazz: ja). Jeder Deko-Gegenstand passt nur auf Plätze seiner Größe (klein, groß, Wasser). Genaueres folgt in Teilaufgabe 4.

**Alle heutigen Funktionen haben einen Platz:**
- Felder pflanzen und ernten;
- Tiere füttern;
- Obstbäume, Brunnen und Boot;
- Deko und Farm einrichten;
- Farm-Monster mit Hütte und Geschenk;
- Vorrat und Sammelalbum;
- Shop;
- Meldungen;
- Laufen der Figur.

## 4. Tippflächen

- **Hühner und Deko:** Bei 2-fach ist eine Kachel 32 px groß.
  - Kleine Dinge bekommen eine **unsichtbare Tippfläche von 48 × 48 px**.
  - Zwischen zwei kleinen antippbaren Dingen liegt dafür mindestens eine freie Kachel. Das Mockup prüft das.
- **Felder** sind die Ausnahme. Sie liegen dicht, ihre Tippfläche ist bei 2-fach 32 px und bei 3-fach 48 px.
  - Laut Jazz hat das in Tests gut funktioniert.
  - Ein Fehlgriff ist harmlos, weil zuerst ein Menü aufgeht.
- **Bei 3-fach** ist schon jede Kachel 48 px groß.
- **Große Dinge** (Kuh, Obstbaum, Boot, Brunnen, Monster, große Deko) sind mindestens 64 px groß.
- **Knöpfe in der Kopfzeile:** 56 × 56 px. Nichts hängt von Hover ab.

## 5. Der Startzustand sieht einladend aus

Ein neues Kind sieht:
- die Insel mit Ufer, Meer und Holzrahmen;
- **4 Felder**;
- **Scheune und Hühnerstall, schon da, aber leer** (angenommen);
- 9 feste Bäume, davon 4 auf den Landstreifen;
- kleine Gras-Halme;
- die **8 wachsenden Dekorationen in Stufe 1**;
- die Figur;
- die erste Meldung „Tippe ein Feld an und pflanze deinen ersten Samen.“

## 6. Hungrige Tiere und Monster-Geschenk (entschieden, E4)

- **Hungrige Tiere** zeigen keine Blase mehr.
  - Neben jedem hungrigen Huhn steht ein **leerer Napf**, in der Scheune ein **leerer Trog**.
  - Nach dem Füttern sind Napf bzw. Trog gefüllt.
  - Napf und Trog bewegen sich nicht.
- **Meldung**, solange mindestens ein Tier hungrig ist:
  - „Deine Hühner sind hungrig.“ (nur Hühner);
  - „Deine Kühe sind hungrig.“ (nur Kühe);
  - „Deine Tiere sind hungrig.“ (Hühner und Kühe).
- **Monster:** kein Ausrufezeichen mehr. Sein Geschenk liegt sichtbar neben der Hütte und **hüpft weiter**.
- Grafik:
  - `trog.png` gibt es schon. Gebraucht werden ein Bild „leer“ und ein Bild „voll“.
  - Der **Napf ist neu** (16 × 16, leer und voll). Im Paket gibt es keinen fertigen Napf.

## 7. Höchstens 2 Kühe

- Der Shop verkauft nur noch 2 Kühe, und die Scheune hat genau 2 Plätze.
- Heute hat **nur die Testfarm Pfau-99** mehr als 2 Kühe, nämlich 4 (Abfrage in der Datenbank am 2026-11-17). Echte Kinder sind nicht betroffen.
- Gekauftes geht trotzdem nie verloren. Eine 3. und 4. Kuh bleiben im Besitz und erscheinen im Sammelalbum.
- Ob es dafür eine Gutschrift gibt, kläre ich in Teilaufgabe 5.

## 8. Mehr Deko für den Shop: passende Bilder aus den gekauften Paketen

Heute verkauft der Shop 8 Deko-Gegenstände: Busch, Blume gelb, Blume lila, Pilz, Stein, Pilzhaus, Boot und Brunnen. Dazu kommen 2 Katzenblumen als Belohnung.

Alle Bilder unten sind schon gekauft. Sie liegen in `assets/entpackt/` und sind noch nicht im Spiel. Die Lizenz erlaubt, einzelne Bilder nach `src/grafik/` zu übernehmen.

| Gruppe | Platz | Vorschläge | Quelle (Bilderbogen) |
|---|---|---|---|
| **Blumen für die Beete** (Jazz: mehr Blumen) | Beet | Blumenbüschel in Gelb, Rosa, Blau, Lila und Weiß; Tulpe und Rose (gibt es schon als Pflanzen); Kirschblüten-Büschel; Kleeblüten; die heutigen Blumen gelb und lila sowie die Katzenblumen | Premium `Objects/Mushrooms, Flowers, Stones.png` (mehrere Blumenbüschel in verschiedenen Farben), Basic `Basic_Grass_Biom_things.png`, Sorry Pack `Cherry Blossom Biom.png`, heutige `pflanzen.png` (Tulpe, Rose in Blüte) |
| **Blumen und Pflanzen** | klein | Blumenbüschel in mehreren Farben, rosa Pilze, Kleeblatt-Büschel, rosa Busch (Sonnenblume und Beerenbusch wachsen jetzt, Teilaufgabe 4) | Sprout Lands Premium `Objects/Mushrooms, Flowers, Stones.png`, `Trees, stumps and bushes.png`; Basic `Basic_Grass_Biom_things.png`; Sorry Pack `Cherry Blossom Biom.png` |
| **Steine und Holz** | klein | großer Stein, bemooster Fels, Baumstumpf, Holzstamm, Pilz auf Stumpf | `Mushrooms, Flowers, Stones.png`, `Trees, stumps and bushes.png`, Sorry Pack `Birch wood Biom.png` |
| **Schilder und Kleines** | klein | Holzschild mit Bild (24 Motive, z. B. Herz, Blume, Stern), Briefkasten, Laterne, Truhe (Holz, Silber, Gold) | Premium `Objects/signs.png`, `Tilesets/Building parts/Mailbox Animation Frames.png`; Sorry Pack `Furniture/*_Chest.png` |
| **Hof und Garten** | groß | Picknickdecke mit Korb, Bank mit Tisch, Bienenstock (mit Bienen), Lagerfeuer, Kirschblütenbusch, Zaunstück | Premium `Piknik blanket.png`, `Piknik basket.png`; Sorry Pack `Furniture/new Wooden Furniture.png`, `Bee/beehive.png`, `Sprout winter/campfire.png`; Premium `Fences.png` |
| **Am und im Wasser** | Wasser | Schilf, Steine im Wasser, Frosch (Seerosen wachsen jetzt, Teilaufgabe 4) | Premium `Objects/Water Objects.png`; Sorry Pack `Plant update 2/frog/` |
| **Jahreszeit** (Vorschlag, nur zeitweise im Shop) | klein/groß | Weihnachtsbaum, Geschenke, geschnitzter Kürbis | Sorry Pack `Sprout winter/`, `halloween/carved_halloween_pumpkins.png` |

Das ergibt **etwa 40 neue Deko-Gegenstände**, davon gut 10 Blumen, ohne ein einziges Bild neu zu zeichnen.

**Grenzen:**
- Bewegte Deko (Bienen, Frosch, Lagerfeuer) zählt zum Bewegungs-Budget aus Teilaufgabe 3 und steht bei „Bewegung reduzieren“ still.
- Aus `halloween/` nur Kürbisse. Gräber und Spinnennetze passen nicht zur Schule.

Preise und Freischaltung folgen in Teilaufgabe 5, die genaue Auswahl in Teilaufgabe 4.

**Sammelalbum-Knopf:** Das heutige Buch-Symbol (22 × 26 Pixel) ist in 2-fach größer als die Truhe (16 × 14).
- Vorschlag: ein eigenes kleines Buch-Bild in 16 × 16, 2-fach wie die Truhe.
- Im Mockup ist das heutige Bild nur kleiner gezeigt (32 px hoch), um die Größe zu zeigen.

## 9. Entscheidungen von Jazz (2026-11-17)

| Nr. | Frage | Entscheidung |
|---|---|---|
| E1 | Hauptvorschlag: volle Breite, Kern 27 × 15 mit Landstreifen, nur 2- oder 3-fach, Knöpfe in der Kopfzeile | angenommen |
| E2 | Scheune und Hühnerstall von Anfang an sichtbar (leer) | angenommen |
| E3 | Felder mit Grasweg dazwischen | **nein:** Felder dicht wie heute, dafür mehr Deko-Plätze und mehr Deko im Shop (Abschnitt 8) |
| E4 | Hungrige Tiere | Napf/Trog, Meldung „Deine Hühner/Kühe/Tiere sind hungrig.“, Monster ohne Ausrufezeichen, **Geschenke hüpfen weiter** |
| E5 | Shop-Knopf auf der Farm | Der Knopf **ersetzt** den Menüpunkt Shop unten. Das Buch im Sammelalbum-Knopf wird kleiner. |
| E6 | Monster | läuft nie ins Wasser (Laufweg vor der Hütte, ringsum Gras) |
| E7 | Überschrift „Meine Farm“ | entfällt auf der Farm |
| E10 | Monster-Hütte | weiter oben, Eingang nicht am Wasser; kleine Hütte für Gespenst, Spinnen und Maus: kleiner Hühnerstall mit einem Fenster (2 × 3, aus dem Premium-Paket) |
| E9 | Deko-Verteilung und Blumen | Baumstumpf, Laterne, Briefkasten, Fels verstreut statt in einer Reihe; 6 Blumenbeete mit 16 Plätzen; mehr Blumen im Shop |
| E8 | Wasser-Platz S2 lag unten im Meldungsfeld | Wasser-Plätze nur noch oben; unter der Insel liegt nichts Antippbares im Wasser (Prüfung im Mockup) |

## 10. Was später im Code zu ändern wäre (nicht jetzt)

- **`src/lib/landschaft.ts`:**
  - neue Karte;
  - neue Plätze (Deko in drei Größen, wachsende Deko);
  - Kuh-Plätze auf 2 gekürzt;
  - Test „kleine Dinge außer Feldern mit freier Kachel dazwischen“.
- **`src/schueler/Farm.tsx`:**
  - Größenregel;
  - Meer als Hintergrund;
  - Tippflächen;
  - Scheune und Stall von Anfang an;
  - Napf und Trog statt Blasen;
  - Meldungen.
- **`SchuelerBereich.tsx`:**
  - Kopfzeile mit Farm-Knöpfen;
  - Menü ohne Shop;
  - Hinweis im Hochformat.
- **Datenbank:**
  - Die Höchstzahl der Kühe und neue Deko-Artikel sind Datenänderungen im Shop-Angebot (vorher fragen).
  - Deko-Plätze, die das Kind selbst wählt, brauchen eine Spalte für den Platz. Das ist eine Schema-Änderung und wird in Teilaufgabe 4 geklärt.

## 11. Geprüft und nicht geprüft

**Geprüft:**
- Das Mockup im Browser bei 1024 × 768, 1180 × 820 und 1366 × 1024 im Querformat sowie bei 768 × 1024 im Hochformat, Fotos mit Edge im Kopfmodus.
- Kein waagerechtes Scrollen.
- Die Selbstprüfung meldet „Prüfung ok“ in allen drei Größen.
- Die Zahl der Kühe je Kind per Lese-Abfrage.
- Die Deko-Bilderbögen, angesehen in `assets/entpackt/`.

**Nicht getestet:**
- echtes iPad, weil keines zur Hand war;
- dunkler Modus und Bewegung im Mockup, weil das Mockup ein Standbild in hellen Farben ist;
- ob jedes vorgeschlagene Deko-Bild einzeln gut aussieht: Ich habe nur die Bilderbögen angesehen, nichts ausgeschnitten.

Im Mockup fehlen außerdem die Symbole im Menü unten; dort stehen nur die Wörter.
