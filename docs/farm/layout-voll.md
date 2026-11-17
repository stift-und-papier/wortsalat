# Layout der voll ausgebauten Farm (Teilaufgabe 3, Vorschlag)

Stand: 2026-11-17, Branch `lehrkraftseite`. **Nur Vorschlag und Mockup, am Spiel ist nichts geändert.**
Die Karte und die Plätze stammen aus Teilaufgabe 2 (`layout-leer.md`). Hier ist alles gekauft und jeder Platz belegt.

**Mockup:** `docs/farm/layout-voll.html`.
- Am besten über den Entwicklungs-Server öffnen: `http://localhost:5174/wortsalat/docs/farm/layout-voll.html`.
- `?plaetze=1` oder die Taste **P** zeigt die Zonen und Plätze.
- Leere und volle Farm nutzen dasselbe Skript `farm-mockup.js` und dieselben Stile `farm-mockup.css`.

**Fotos** in `docs/farm/bilder/`:
- `layout-voll-1024x768.png`, `-1180x820.png`, `-1366x1024.png`;
- dieselben mit `-plaetze`;
- `layout-voll-hochformat-768x1024.png`.

**Kopfzeile wie im Spiel** (Wunsch von Jazz), in leerer und voller Farm:
- Dunkel-Schalter aus dem UI-Pack;
- Zahnrad als runder Holzknopf (`Symbol` „einstellungen“);
- Sammelalbum und Vorrat als Bildknöpfe auf Tafel-Hintergrund;
- Shop-Knopf breiter, mit Symbol und dem Wort „Laden“ (Jazz);
- als Seitenhintergrund die Wiese des Spiels.

## 1. Was „voll“ heißt (realistisches Maximum)

| Bereich | in der vollen Farm |
|---|---|
| Acker | 12 Felder, alle bepflanzt, verschiedene Sorten und Stufen, 3 davon reif |
| Obstgarten | 3 Obstbäume mit Früchten |
| Scheune | 2 Kühe, davon eine hungrig (Trog leer), daneben 1 Flasche Milch zum Einsammeln |
| Hühnerstall | 4 Hühner, 2 davon hungrig (Napf leer), 1 Ei zum Einsammeln |
| Monster | Hütte, Monster vor der Hütte, sein Geschenk (Samentüte) liegt daneben |
| Brunnen, Boot | beide gekauft |
| Blumenbeete (6 Beete, 16 Plätze) | alle bepflanzt, gemischt aus heutigen Blumen-Bildern und neuen Blumen (Platzhalter) |
| Deko klein (20) | 14 mit heutigen Bildern, 6 mit neuen Bildern aus den Paketen (im Mockup als Platzhalter) |
| Deko groß (2) | Picknick, Bienenstock (neu) |
| Deko im Wasser (4) | Seerosen, Schilf, Frosch, Steine (neu) |
| Wachsende Deko (8) | alle in der letzten Stufe |
| Figur | im Hof |
| Meldung | „Deine Hühner sind hungrig.“ |
| Münzen | 4-stellig (1.240): Die Anzeige reicht dafür. |

Das sind knapp **100 Dinge** auf der Insel. Mehr geht nicht, weil jeder Platz belegt ist.

## 2. Bewegungs-Budget

**Was sich in der vollen Farm im Mockup gleichzeitig bewegt (13):**
- 4 Hühner, die laufen und picken;
- 2 Kühe, die hin und her gehen;
- 1 Monster, das vor der Hütte läuft;
- 1 Boot, das schaukelt;
- 3 liegende Dinge, die hüpfen (Ei, Milch, Geschenk);
- 1 Bienenstock mit Bienen;
- 1 Frosch.

Dazu kommt die Figur, solange sie läuft. Das sind **14**.

**Schlimmster Fall heute:**
- Alles Liegende hüpft einzeln. Wenn das Kind lange nicht einsammelt, sind das 12 Ernten, 4 Eier, 2 Milch und 1 Geschenk, also bis zu **19 hüpfende Dinge** zusätzlich zu den Tieren.
- Das wäre zu unruhig.

**Vorschlag für das Budget:**

| Regel | Wert |
|---|---|
| Eigenständige Bewegungen gleichzeitig (Tiere, Monster, Figur, Boot, bewegte Deko) | **höchstens 12** |
| Bewegte Deko (Bienen, Frosch, Lagerfeuer), gleichzeitig aufgestellt | **höchstens 2** (im Shop beschrieben als „bewegt sich“; die dritte kann man kaufen, aber nur 2 bewegen sich, die übrigen stehen still) |
| Alles Liegende (Ernte, Ei, Milch, Geschenk) | hüpft weiter (Jazz, E4), aber **alle im selben Takt** und nur 1 Bildpunkt hoch. So wirkt es wie eine einzige ruhige Bewegung. |
| Takt | höchstens 2 Bilder pro Sekunde für Dauerbewegungen (wie heute bei Tieren) |
| Blinken, Wackeln, Blasen | keine (die Ausrufezeichen entfallen, E4) |
| „Bewegung reduzieren“ am iPad | alles steht still, wie heute |

**Leistung:**
- Alle Bewegungen sind einfache Bildwechsel und Verschiebungen per CSS, ohne Neuberechnung der Seite.
- Im Browser am Rechner läuft das Mockup flüssig.
- Am iPad ist das **nicht gemessen**.

## 3. Lesbarkeit und Überladung (geprüft an den Fotos)

| Prüfpunkt | Ergebnis | Vorschlag |
|---|---|---|
| Ist der Hof frei, damit die Figur und der Blick Platz haben? | ja: Brunnen und Figur in der Mitte, ringsum Gras | – |
| Liegt etwas unter der Meldung? | nein (Wasser-Deko nur oben, geprüft) | – |
| Sind die Zonen erkennbar (Acker, Obstgarten, Scheune, Stall, Hütte)? | ja, jede Zone hat ein großes Bild als Anker | – |
| Ist es **eng rechts neben dem Stall** (Deko D16, wachsende Deko W8, Huhn H2)? | etwas eng; durch Napf über dem Huhn schon entschärft | W8 in Teilaufgabe 4 an einen freieren Platz legen |
| Ist es **eng oben Mitte** (Boot, Wasser-Deko S1 und S3, W7, D8)? | etwas eng, vor allem mit Frosch und W7 | Wasser-Platz S3 nur für ruhige Deko (Seerosen, Schilf), Frosch auf S1 oder S2 |
| Wirken 20 kleine Deko-Plätze mit nur 8 heutigen Bildern unruhig? | Wiederholungen fallen auf (z. B. Pilz, Katzenblume) | Die neuen Deko-Bilder aus `layout-leer.md` Abschnitt 8 lösen das, weil sie mehr Abwechslung bringen. |
| Sind kleine Dinge bei 2-fach erkennbar? | Hühner, Ei, Milch, Deko: ja (32 px). Monster „Maus“ ist klein, aber erkennbar. | – |
| Überdecken sich Tippflächen in der vollen Farm? | **ja, an einer Stelle:** Liegendes direkt neben einem Tier (Ei neben Huhn, Milch neben Kuh) | siehe V1 |
| Sind hungrige Tiere ohne Lesen erkennbar? | ja, am leeren Napf bzw. Trog; die Meldung sagt es zusätzlich | – |

## 4. Vorschläge für Jazz (alle angenommen am 2026-11-17)

| Nr. | Frage | Vorschlag |
|---|---|---|
| V1 | Wo liegen Ei und Milch? Heute liegen sie direkt neben dem Tier, dann überlappen sich die Tippflächen von Tier und Ei. | Eier liegen **im Eingang des Hühnerstalls**, Milch **an der Scheunentür**. Ein Tipp dort sammelt alle Eier bzw. alle Milch ein. Das ist ein fester Platz, und nichts überlappt. |
| V2 | Bewegungs-Budget wie in Abschnitt 2: höchstens 12 eigene Bewegungen, höchstens 2 bewegte Deko, Liegendes hüpft im gemeinsamen Takt | annehmen |
| V3 | Enge Stellen (rechts vom Stall, oben Mitte) | beim Festlegen der wachsenden Deko (Teilaufgabe 4) einen Platz umlegen; der Frosch nicht neben W7 |
| V4 | Schlimmster Fall „viel Liegendes“ | keine Obergrenze nötig, weil alles im selben Takt hüpft (V2); die Meldung erinnert einmal: „Auf deiner Farm liegt etwas zum Einsammeln.“ |

## 5. Geprüft und nicht geprüft

**Geprüft:**
- das Mockup in der vollen Fassung bei 1024 × 768, 1180 × 820 und 1366 × 1024 (Querformat) sowie bei 768 × 1024 (Hochformat), Fotos mit Edge im Kopfmodus;
- die Selbstprüfung „Prüfung ok“ in allen drei Größen;
- der Zähler „13 bewegt“ im Mockup;
- kein waagerechtes Scrollen;
- die Kopfzeile mit Schalter und Zahnrad aus dem Spiel.

**Nicht getestet:**
- echtes iPad (Leistung mit allen Bewegungen, Finger), weil keines zur Hand war;
- dunkler Modus der Farm, weil das Mockup nur die hellen Farben zeigt;
- die neuen Deko-Bilder selbst: Sie sind im Mockup beschriftete Platzhalter.
