# Dekorationskonzept (Teilaufgabe 4, Vorschlag)

Stand: 2026-11-17, Branch `lehrkraftseite`. **Nur Vorschlag und Mockup, am Spiel ist nichts geändert.**
Grundlage: Plätze aus Teilaufgabe 2 (`layout-leer.md`), volle Farm aus Teilaufgabe 3 (`layout-voll.md`), Lernstand und Belohnungen
aus den Migrationen `lernstand`, `belohnungen` und `uebungen_runden` (nur gelesen).

**Zum Ansehen:**
- `docs/farm/wachsende-deko.html`: alle 8 wachsenden Dekorationen in allen Stufen, 4-fach. Foto: `bilder/wachsende-deko-stufen.png`.
- `docs/farm/layout-leer.html` zeigt sie in Stufe 1, `layout-voll.html` in der letzten Stufe (Fotos in `bilder/` erneuert).
- Die Bilder liest das Mockup direkt aus dem Paketordner `assets/`. Das geht nur auf Ihrem Rechner, weil die Pakete nicht im Repo liegen.

## 1. Kurz gesagt

- Auf der Farm stehen von Anfang an **8 wachsende Dekorationen** in Stufe 1, zum Beispiel ein Kirschbaum-Keimling und ein Pfahl für ein Vogelhaus.
- Sie wachsen nur, wenn das Kind **dazulernt**, also wenn sich der Lernstand verbessert. Münzen haben darauf keinen Einfluss.
- Sie wachsen **nur vorwärts**. Nichts welkt und nichts schrumpft.
- Keine Dekoration gehört zu einem Lernbereich. Darum verrät die Farm nicht, worin ein Kind gut oder schwach ist.
- Wenn etwas gewachsen ist, sagt das **Meldungsfeld** einen kurzen Satz (Einstein ist nicht auf der Farm, Jazz).
- Dazu gibt es **kaufbare Deko** in 4 Platzarten (Beet, klein, groß, Wasser), die das Kind selbst aufstellt.

## 2. Die 8 wachsenden Dekorationen

| Platz | Deko | Größe | Stufen (Beschreibung) | Bilder |
|---|---|---|---|---|
| W1 (unter der Bucht, x 13, y 4) | **Kirschbaum** | 2 × 2 | 1. ein winziger Keimling · 2. ein Zweig mit rosa Blättern · 3. ein runder rosa Busch · 4. ein schmales Bäumchen · 5. ein Kirschbaum in voller Blüte | vorhanden |
| W2 (x 11, y 4) | **Wildblumen** | 1 × 2 | 1. ein paar Grashalme · 2. ein dichter Grasbüschel · 3. eine Lavendel-Knospe · 4. ein hoher Lavendel (Jazz: Bild aus `assets/objects.png`, Gras im Grün seiner Blätter) | vorhanden, umgefärbt |
| W3 (am Hühnerstall, x 17, y 7) | **Sonnenblume** | 1 × 2 | 1. ein Grashalm · 2. eine kleine gelbe Blüte · 3. eine große Knospe · 4. eine hohe Sonnenblume | vorhanden |
| W4 (Wasser am Südufer, x 10, y 12) | **Seerosen** | 2 × 1 Wasser | 1. ein kleines Blatt · 2. ein großes Blatt · 3. ein Blatt mit rosa Knospe · 4. eine blühende Seerose | vorhanden |
| W5 (x 11, y 7) | **Beerenbusch** | 1 × 1 | 1. ein kleiner Busch · 2. ein voller Busch · 3. ein Busch mit roten Beeren (nur Deko, nicht zum Ernten); dunkles Grün | vorhanden, umgefärbt |
| W6 (rechter Rand beim Baum, x 25, y 6) | **Vogelhaus** | 1 × 2 | 1. ein Pfahl · 2. ein Pfahl mit Brett · 3. ein Vogelhaus · 4. Futter liegt im Vogelhaus · 5. ein Vogel sitzt auf dem Dach (Standbild, bewegt sich nicht) | **neu** |
| W7 (linker Rand am Obstgarten, x 0, y 5) | **Eiche** | 1 × 2 | 1. eine Eichel · 2. die Eichel keimt · 3. ein Sprössling · 4. ein kleiner Baum · 5. eine junge Eiche; helles Gelbgrün | vorhanden, umgefärbt |
| W8 (zwischen Acker und Hütte, x 8, y 8) | **Windrad** | 1 × 2 | 1. ein Pfahl · 2. ein Gestell · 3. ein Windrad mit zwei Flügeln · 4. ein Windrad mit vier Flügeln und Fähnchen (dreht sich nicht dauernd, siehe Bewegungs-Budget) | **neu** |

**Farben (Jazz, 2026-11-17):** Die Obstbäume sind türkisgrün. Damit sich die wachsenden Pflanzen davon abheben, ist die Eiche hell gelbgrün und der Beerenbusch dunkelgrün; die 2. Kirschbaum-Stufe ist rosa wie die übrigen. Umgefärbt wird nur mit Farben der Sprout-Lands-Palette (`docs/farm/farben.js`, Reihe gegen Reihe gleicher Helligkeit).

Das sind **26 Wachstumsschritte**, bis alles in der letzten Stufe ist (4 + 3 + 3 + 3 + 2 + 4 + 4 + 3).

**Weitere Ideen als Ersatz** (falls Jazz eine der 8 tauschen möchte):

| Idee | Größe | Stufen | Bilder | Warum nicht in der Auswahl |
|---|---|---|---|---|
| Tanne | 2 × 2 | Zapfen, Sprössling, Bäumchen, Tanne (4) | vorhanden (`Pine Tree Biome.png`) | Mit Kirschbaum und Eiche wären es drei Bäume. |
| Zaun am Hofweg | 3 × 1 | Pfosten, zwei Pfosten, Zaun mit Latten, Zaun mit Blumenranke (4) | Zaun vorhanden (`Fences.png`), Ranke neu | Braucht einen langen Platz. Den gibt es auf der vollen Farm nicht mehr ohne Umbau. |
| Vogelnest | 1 × 1 | Nest, Nest mit Ei, Küken, Vogel (4) | Nest und Ei vorhanden, Küken und Vogel neu | Das Ei im Nest sieht aus wie ein Ei zum Einsammeln. Das verwirrt neben dem Hühnerstall. |

**Was nicht doppelt vorkommt:** Sonnenblume, Seerosen und Beerenbusch wachsen. Darum verkauft der Shop sie nicht mehr; im Vorschlag aus `layout-leer.md` Abschnitt 8 werden sie gestrichen. So bleiben sie etwas Besonderes.

## 3. Wie das Wachstum gesteuert wird

### 3.1 Was einen Wachstumsschritt bringt

Grundlage ist die heutige Einteilung im Lernweg. Je Kompetenz gibt es die Stufen „erste Ergebnisse“, „dranbleiben“, „wird besser“ und „deutlich besser“ (Funktion `lern_kategorie`).

| Ereignis je Kompetenz | Schritte | einmalig? |
|---|---|---|
| **Neu dazugelernt:** zum ersten Mal genug Aufgaben für einen Lernstand (heute 4 gewertete Versuche, Einstellung `min_versuche`) | 1 | ja, je Kompetenz einmal |
| **Wird besser** (Trend positiv) | 1 | ja, je Kompetenz einmal |
| **Deutlich besser** (Trend positiv um mindestens 2 Stufen) | 1 | ja, je Kompetenz einmal; springt eine Kompetenz direkt auf „deutlich“, zählen „besser“ und „deutlich“ zusammen (2 Schritte), wie heute bei den Belohnungen |

**Warum auch „neu dazugelernt“?**
- Ein Kind, das schon sehr gut ist, kann sich kaum verbessern. Ohne diesen Schritt würde seine Farm fast nicht wachsen.
- „Neu dazugelernt“ hängt nicht davon ab, wie gut das Kind ist, sondern nur davon, dass es ein neues Thema geübt hat.
- Das ist eine Entscheidung für Jazz (D2).

**Was keinen Schritt bringt:** Münzen, Käufe, Füttern, Ernten, Münzen von der Lehrkraft, Wiederholen derselben Übung ohne neuen Lernstand.

### 3.2 Welche Deko wächst

- Jeder Schritt geht an die Deko, die **am wenigsten weit** ist (gemessen am Anteil ihrer Stufen). Bei Gleichstand gilt die feste Reihenfolge W1 bis W8.
- So wächst die Farm gleichmäßig. Es gibt keine Deko „für Rechtschreibung“ oder „für Wortarten“.
- Darum kann niemand an einer kleinen Deko ablesen, dass ein Kind in einem Bereich schwach ist.

### 3.3 Tempo (Schätzung, wird in Teilaufgabe 5 simuliert)

- Bis alles ausgewachsen ist, braucht es 26 Schritte.
- Ein Kind, das wie geplant übt (1 Paket pro Woche plus 1 als Hausaufgabe), kommt im Schuljahr grob auf **10 bis 15 neue Kompetenzen** und dazu einige „besser“. Das ergibt etwa **15 bis 30 Schritte**. Die Farm kann also im Schuljahr fertig werden (Jazz: Zieldauer ein Schuljahr).
- Diese Zahl ist **geschätzt, nicht gemessen**. Die Simulation in Teilaufgabe 5 prüft sie für die fünf Kindertypen.
- Ist es zu langsam oder zu schnell, ändert man nur die Zahl der Schritte je Stufe auf dem Server. Wegen 3.4 schrumpft dabei nichts.

### 3.4 Regeln, damit nichts zurückwächst

| Fall | Was passiert |
|---|---|
| Der Lernstand einer Kompetenz sinkt wieder | nichts; Schritte werden nie zurückgenommen |
| Die Lehrkraft ändert Lernstand-Einstellungen (z. B. Trend-Grenzen) | nichts; schon erreichte Schritte bleiben |
| Die Lehrkraft löscht eine Aufgabe oder Kompetenz | nichts; die Schritte hängen nicht an der Aufgabe |
| „Ergebnisse zurücksetzen“ | Die Farm bleibt (Jazz, Antwort 8), also auch alle Stufen. Bereits gezählte Kompetenzen zählen danach nicht noch einmal. |
| Man ändert später das Tempo (3.3) | Die Stufe ist immer das Höchste aus „gespeicherter Stufe“ und „neu berechneter Stufe“. |
| Neues Schuljahr | Alles bleibt ausgewachsen. Ob danach neue wachsende Deko kommt, ist offen (D5). |

### 3.5 Meldung, wenn etwas gewachsen ist

- Die Meldung erscheint **einmal**, beim ersten Öffnen der Farm nach dem Wachsen. Sie hat Vorrang vor „hungrig“ und „etwas zum Einsammeln“; danach kommen wieder die normalen Hinweise.
- Die gewachsene Deko glitzert einmal kurz (etwa 1 Sekunde). Bei „Bewegung reduzieren“ glitzert nichts.
- Die Texte nennen nie ein Fach, eine Kompetenz, eine Zahl oder eine Stufe.

| Fall | Meldung |
|---|---|
| eine Deko gewachsen | „Du hast dazugelernt. Dein Kirschbaum ist gewachsen!“ |
| mehrere gewachsen | „Du hast dazugelernt. Auf deiner Farm ist einiges gewachsen!“ |
| letzte Stufe erreicht | „Dein Kirschbaum ist jetzt ganz groß!“ |
| alles ausgewachsen | „Alles auf deiner Farm ist ausgewachsen. Super!“ |

**Satzteile je Deko** (damit die Grammatik stimmt):

| Deko | gewachsen | letzte Stufe |
|---|---|---|
| Kirschbaum | Dein Kirschbaum ist gewachsen! | Dein Kirschbaum blüht jetzt! |
| Wildblumen | Deine Wildblumen sind gewachsen! | Deine Wildblumen blühen jetzt! |
| Sonnenblume | Deine Sonnenblume ist gewachsen! | Deine Sonnenblume blüht jetzt! |
| Seerosen | Deine Seerosen sind gewachsen! | Deine Seerose blüht jetzt! |
| Beerenbusch | Dein Beerenbusch ist gewachsen! | An deinem Busch hängen jetzt Beeren! |
| Vogelhaus | An deinem Vogelhaus wurde weitergebaut! | Ein Vogel wohnt jetzt in deinem Vogelhaus! |
| Eiche | Deine Eiche ist gewachsen! | Deine Eiche ist jetzt ein Baum! |
| Windrad | An deinem Windrad wurde weitergebaut! | Dein Windrad ist fertig! |

- **Hilfe-Seite** „Deine Farm“ bekommt einen Satz dazu: „Manche Pflanzen auf deiner Farm wachsen, wenn du dazulernst. Sie werden nie kleiner.“
- Die wachsende Deko bleibt **nicht antippbar** (wie in Teilaufgabe 2 festgelegt).

## 4. Technische Kopplung (Vorschlag, braucht später eine Migration)

**Ablauf:**
1. Beim Öffnen der Farm ruft die App eine Server-Funktion auf, so wie heute `belohnungen_holen`.
2. Der Server prüft je Kompetenz den Lernstand (vorhandene Funktion `lern_kategorie`) und trägt neue Ereignisse ein.
3. Der Server rechnet die Stufen aus und speichert sie.
4. Die App bekommt **nur** die Stufen und welche Deko gerade gewachsen ist.

**Neue Tabellen** (Schema-Änderung, erst nach Ihrer Freigabe und in einem eigenen Auftrag):

| Tabelle | Spalten | Zweck |
|---|---|---|
| `wachstum_ereignisse` | Schüler:in, Kompetenz-Kennung (als Text, ohne Verknüpfung, damit Löschen nichts mitreißt), Art (`neu`, `besser`, `deutlich`), Zeitpunkt; eindeutig je Schüler:in, Kompetenz und Art | merkt sich, was schon gezählt hat |
| `wachstum_stufen` | Schüler:in, Deko (W1 bis W8), Stufe, gewachsen am, gesehen | die Stufe, die das Kind sieht; wird nur mit „höher als bisher“ geändert |

**Was das Kind bekommt** (Antwort der Funktion, Beispiel):
`[{ "deko": "W1", "stufe": 3, "neu": true }, { "deko": "W2", "stufe": 2, "neu": false }, …]`

**Schutz der Lernstand-Details:**
- Die Antwort enthält **keine** Kompetenz, keinen Bereich, keine Punkte, keine Lernstand-Stufe, keine Anzahl der Schritte.
- Die Ereignis-Tabelle ist für Kinder nicht lesbar (RLS, nur über die Funktion mit Token-Prüfung, wie heute).
- Die Lehrkraft darf beide Tabellen lesen. Ändern kann nur der Server.
- „Ergebnisse zurücksetzen“ löscht die beiden Tabellen **nicht** (Farm bleibt). Löscht die Lehrkraft ein Kind, verschwinden sie mit.
- Bleibt ein Rest: Kinder können ihre Farmen nebeneinander halten und sehen, wessen Farm größer ist. Das zeigt nur, wie oft jemand dazugelernt hat, nicht wie gut er ist. Eine Rangliste gibt es nicht.

**Zu den heutigen Belohnungen** (Samen bei „besser“, Katzenblume bei „deutlich besser“): Sie bleiben im Vorschlag bestehen und laufen unabhängig weiter (D3). Kommen beide gleichzeitig, sagt die Meldung zuerst das Wachsen; das Geschenk-Fenster kommt wie heute.

## 5. Kaufbare Deko

### 5.1 Platzarten

| Platzart | Anzahl | Was passt | Kategorien im Shop |
|---|---|---|---|
| **Beet** (6 Beete) | 16 Plätze | nur Blumen | Blumen |
| **klein** 1 × 1 | 20 Plätze (D1 bis D20) | alles Kleine | Pflanzen und Pilze, Steine und Holz, Schilder und Kleines, Jahreszeit |
| **groß** 2 × 2 | 2 Plätze (G1, G2) | große Deko | Hof und Garten |
| **Wasser** 1 × 1 | 4 Plätze (S1 bis S4) | nur Wasser-Deko | Am Wasser |
| fest | Brunnen, Boot | genau dieses Ding | wie heute |

Im Shop steht bei jedem Artikel die Platzart als Bild und Wort, z. B. „für ein Beet“ oder „für einen großen Platz“.

### 5.2 Kategorien und Beispiele

Alle Bilder unten sind schon gekauft (Liste und Quellen: `layout-leer.md` Abschnitt 8). Die wachsenden Motive sind gestrichen.

| Kategorie | Platz | Beispiele | Preisstufe |
|---|---|---|---|
| **Blumen** | Beet | Blumenbüschel in Rosa, Blau, Lila, Weiß; Kirschblüten-Büschel; Kleeblüten; heutige Blume (ohne Gelb) und Traubenblume, je in mehreren Farben | A |
| **Pflanzen und Pilze** | klein | Busch (heute), rosa Busch, Pilze (heute), rosa Pilze, Klee | A |
| **Steine und Holz** | klein | Stein (heute), großer Stein, Baumstumpf, Holzstamm, Pilz auf Stumpf | A bis B |
| **Schilder und Kleines** | klein | Holzschild mit Bild (Herz, Blume, Stern, …), Briefkasten, Laterne, Truhe, Pilzhaus (heute) | B |
| **Hof und Garten** | groß | Picknickdecke mit Korb, Bank mit Tisch, Kirschblütenbusch, Zaunstück | C |
| **Bewegte Deko** | groß oder Wasser | Bienenstock mit Bienen, Frosch, Lagerfeuer | D |
| **Am Wasser** | Wasser | Schilf, Steine im Wasser | B |
| **Jahreszeit** (nur zeitweise) | klein oder groß | Kürbis im Herbst, Weihnachtsbaum und Geschenke im Winter | B |

**Grenzen:**
- Bewegte Deko: höchstens 2 bewegen sich gleichzeitig (Bewegungs-Budget, V2). Der Shop schreibt dazu „bewegt sich“.
- Der Frosch passt nur auf S1, S2 oder S4, nicht auf S3 (oben Mitte, V3). S3 bekommt nur ruhige Deko.
- Jeden kleinen Artikel kann man **mehrmals** kaufen (höchstens so oft, wie Plätze dafür da sind). Große und bewegte Deko gibt es je einmal.

### 5.2a Mehrfach gekaufte Deko in Farben (Jazz, 2026-11-17)

Wer dasselbe Ding mehrmals kauft, bekommt **jedes Mal eine andere Farbe**: das 1. Stück in Farbe 1, das 2. in Farbe 2 und so weiter; nach der letzten Farbe geht es von vorn los. **Gelb** gibt es nur bei der wachsenden Sonnenblume. Alle Farben sind auf `wachsende-deko.html` (unten) zu sehen.

| Deko | Farben |
|---|---|
| Blume (heute „Gelbe Blume“) | rosa, blau, lila, weiß, orange |
| Traubenblume (heute „Blume lila“) | lila, blau, rosa, weiß |
| Pilz | rot, braun, orange, blau |
| Pilzhütte | lila, rot, blau, braun; **ohne Totenkopf**, dafür mit drei hellen Tupfen |
| Busch | grün, gelbgrün, blaugrün, Herbst |
| Stein | grau, Sandstein, rötlich, bläulich |
| Katzenblumen | rosa und blau wie heute (Belohnung, nicht im Shop) |

Neue kaufbare Deko aus den Paketen bekommt bei der Umsetzung ebenfalls mehrere Farben, wenn man sie mehrmals kaufen kann.

**Technik dazu:** Der Besitz merkt sich die Farbe (z. B. Spalte `besitz.farbe`, eine Zahl); der Server vergibt beim Kauf die nächste. Schon gekaufte Deko behält ihr heutiges Aussehen, auch eine schon gekaufte gelbe Blume bleibt gelb (Vorschlag); nur neue Käufe sind nie gelb. Ausnahme ist die Pilzhütte: Sie verliert überall den Totenkopf. Das ist eine Schema-Änderung, also erst nach Ihrer Freigabe. Die Bilder kämen fertig gefärbt nach `src/grafik/`; im Mockup färbt `farben.js` sie nur beim Anzeigen.

### 5.3 Preisstufen (grob, genaue Preise in Teilaufgabe 5)

| Stufe | Was | grober Preis | heute zum Vergleich |
|---|---|---|---|
| **A** einfach | Blumen fürs Beet, Busch, Pilze, Klee, kleiner Stein | 20 bis 40 | Busch 25, Gelbe Blume 25, Pilze 30, Stein 40 |
| **B** besonders klein | Schilder, Laterne, Briefkasten, Truhe, Baumstumpf, Wasser-Deko, Jahreszeit | 50 bis 100 | Pilzhaus 100 |
| **C** groß | Picknick, Bank mit Tisch, Kirschblütenbusch, Zaunstück | 120 bis 200 | Brunnen 150 |
| **D** bewegt | Bienenstock, Frosch, Lagerfeuer | 200 bis 300 | – |

Wie heute schalten sich teurere Stufen erst nach und nach frei (nach insgesamt verdienten Münzen). Gekauftes bleibt immer erhalten, auch wenn sich Preise ändern.

### 5.4 Wie das Kind aufstellt („Farm einrichten“)

1. Nach dem Kauf fragt der Shop: „Möchtest du es gleich aufstellen?“
   - Bei **Ja** öffnet sich die Farm, und die freien passenden Plätze leuchten hell (ohne gestrichelte Linie, die heißt in der App „hier schreiben“).
   - Bei **Nein** liegt die Deko in der Truhe (Vorrat) unter „Deko“.
2. Ein **freier Platz** in „Farm einrichten“ antippen: Es öffnet sich die Liste der eigenen Deko, die dort passt.
3. Einen **belegten Platz** antippen: „Tauschen“ oder „In die Truhe“.
4. Nichts geht verloren. Weggeräumte Deko liegt in der Truhe und bleibt im Sammelalbum.
5. Ein ganzes Beet kann man in einem Schritt bepflanzen („Alle Plätze mit dieser Blume“).

**Technik dazu:** Der Besitz bekommt einen Platz (z. B. Spalte `besitz.platz`, leer = in der Truhe). Das ist eine Schema-Änderung, also erst nach Ihrer Freigabe.

## 6. Asset-Liste

Größen in Original-Pixeln (16 px = 1 Kachel). „Vorhanden“ heißt: im gekauften Paket, muss nur als Einzelbild nach `src/grafik/` (mit `LIZENZ.md`).

### 6.1 Wachsende Deko

| Deko | Stufen × Größe | Status | Quelle |
|---|---|---|---|
| W1 Kirschbaum | 5 Stufen: 10 × 10, 16 × 13, 16 × 16, 14 × 29, 24 × 31 | vorhanden, Stufe 2 rosa umgefärbt | Sorry Pack `Plant update 2/Cherry Blossom Biom.png` |
| W2 Wildblumen | 4 Stufen: 14 × 10, 16 × 13, 12 × 17, 16 × 26 | vorhanden, umgefärbt | Gras: Premium `Objects/Mushrooms, Flowers, Stones.png`; Knospe und Lavendel: `assets/objects.png` (**Herkunft und Lizenz noch offen**), Farben auf die Palette gesetzt |
| W3 Sonnenblume | 4 Stufen: 14 × 10, 11 × 9, 11 × 12, 14 × 29 | vorhanden | Premium `Objects/Mushrooms, Flowers, Stones.png` |
| W4 Seerosen | 4 Stufen: 13 × 9, 14 × 11, 13 × 9, 14 × 12 | vorhanden | Sorry Pack `Plant update 2/Cherry Blossom Biom water plants.png` |
| W5 Beerenbusch | 3 Stufen: je bis 16 × 16 | vorhanden, dunkelgrün umgefärbt | Sorry Pack `Plant update 2/Trees, stumps and bushes v2.png` |
| W7 Eiche | 5 Stufen: 9 × 9, 10 × 11, 10 × 10, 12 × 15, 14 × 29 | vorhanden, gelbgrün umgefärbt | Sorry Pack `Plant update 2/Trees, stumps and bushes v2.png` |
| **W6 Vogelhaus** | **5 Stufen je 16 × 32** | **neu** | im 16-Bit-Stil von Sprout Lands: Holzfarben und Umriss wie Brunnen und Briefkasten |
| **W8 Windrad** | **4 Stufen je 16 × 32** | **neu** | im 16-Bit-Stil von Sprout Lands: Holz und Stoff in den Farben des Pakets |
| **Glitzern beim Wachsen** | **3 Bilder je 16 × 16** | **neu** (vorher prüfen, ob die Sterne aus dem UI Pack `special icons/stars.png` passen; nicht geprüft) | |

### 6.2 Übrige Grafiken aus Teilaufgabe 2 bis 4

| Grafik | Größe | Status | Quelle |
|---|---|---|---|
| Kleine Monster-Hütte | 32 × 48, 6 Dachfarben | vorhanden | Premium `Animal Structures/Chikcen_Houses.png` (kleiner Stall mit einem Fenster, Jazz) |
| **Napf** leer und voll | 2 × 16 × 16 | **neu** | |
| Trog leer und voll | 2 × 32 × 16 | `trog.png` vorhanden; ob es ein leeres Bild gibt, ist nicht geprüft | Spiel `src/grafik/trog.png` |
| **Buch klein** für den Sammelalbum-Knopf | 16 × 16 | **neu** (wie das heutige eigene Buch-Bild, nur kleiner) | |
| Kaufbare Deko (etwa 40 Gegenstände) | meist 16 × 16, groß bis 32 × 32 | vorhanden | `layout-leer.md` Abschnitt 8 |
| Farbvarianten der heutigen Deko | 25 Bilder je 16 × 16 (Abschnitt 5.2a) | aus den heutigen Bildern umgefärbt | `src/grafik/deko_*.png` mit `farben.js` |

**Neu zu zeichnen sind damit 15 Bilder:** Vogelhaus 5, Windrad 4, Glitzern 3 (falls die Sterne nicht passen), Napf 2, Buch 1. Wählt Jazz eine Ersatz-Idee, kommen deren neue Bilder dazu (Zaun: 1 Ranke, Vogelnest: 2).
Die Erzeugung der Bilder ist nicht Teil dieses Auftrags. **Prompts für Gemini** dazu stehen in `docs/farm/gemini-prompts.md`.

## 7. Enge Stellen aus Teilaufgabe 3 (V3) gelöst

- **Rechts vom Stall:** W8 lag bei x 24, y 11 zwischen Huhn, Napf und Deko D16. Jetzt steht dort nichts mehr; das Windrad steht beim Acker (x 8, y 8).
- **Oben Mitte:** W7 lag bei x 16, y 1 neben dem Boot und den Wasser-Plätzen. Die Eiche steht jetzt links am Obstgarten (x 0, y 5).
- **Frosch:** im Mockup auf S2 (links oben), S3 hat nur noch Steine.
- Das Vogelhaus steht am rechten Rand beim Baum (x 25, y 6), nicht mehr bei x 22, y 8 neben dem Stall.
- Die Selbstprüfung des Mockups ist danach in allen drei Größen „ok“ (leere und volle Farm).

## 8. Entscheidungen von Jazz (alle angenommen am 2026-11-17)

| Nr. | Frage | Vorschlag |
|---|---|---|
| D1 | Sind die 8 wachsenden Dekorationen und ihre Plätze so gut? | ja, wie in Abschnitt 2; bei Wunsch eine gegen Tanne, Zaun oder Vogelnest tauschen |
| D2 | Zählt „neu dazugelernt“ (erster Lernstand in einer Kompetenz) als Wachstumsschritt? | **ja**, sonst wachsen die Farmen starker Kinder kaum |
| D3 | Bleiben die heutigen Belohnungen (Samen, Katzenblume) neben dem Wachsen bestehen? | ja, sie laufen unabhängig weiter |
| D4 | Meldungstexte wie in Abschnitt 3.5? | ja |
| D5 | Was passiert im zweiten Schuljahr, wenn alles ausgewachsen ist? | vorerst nichts; später evtl. neue wachsende Deko für das neue Schuljahr (eigener Auftrag) |
| D6 | Wachsende Motive (Sonnenblume, Seerosen, Beerenbusch) nicht im Shop verkaufen? | ja, sie bleiben besonders |
| D7 | Kaufbare Deko: Kategorien, Platzarten, Mehrfachkauf kleiner Deko, Preisstufen A bis D | ja; genaue Preise in Teilaufgabe 5 |
| D8 | Aufstellen nach dem Kauf mit der Frage „Möchtest du es gleich aufstellen?“ | ja |
| D9 | Ein Vogel auf dem Vogelhaus und das Windrad bewegen sich nicht dauernd, nur das Glitzern beim Wachsen. | ja (Bewegungs-Budget) |

## 9. Geprüft und nicht geprüft

**Geprüft:**
- die Bilder in den gekauften Paketen, vergrößert angesehen und vermessen (Wachstumsstufen von Kirschbaum, Eiche, Tanne, Sonnenblume, Seerosen, Busch; kein Windrad und kein Vogelhaus in den Paketen);
- alle Stufen auf der Seite `wachsende-deko.html` (Foto mit Edge im Kopfmodus);
- die Mockups leer und voll mit den echten Stufen-Bildern bei 1024 × 768, 1180 × 820 und 1366 × 1024, Selbstprüfung „ok“;
- die umgefärbten Stufen und alle Deko-Farben auf `wachsende-deko.html` (Foto), die Mockups danach wieder mit Selbstprüfung „ok“ in allen drei Größen (Lavendel jetzt 1 × 2);
- im Code gelesen: `lern_kategorie`, `belohnungen_holen`, `ergebnisse_zuruecksetzen` (löscht heute auch Belohnungen und Besitz; nach Jazz' Antwort 8 soll die Farm bleiben).

**Nicht geprüft:**
- das Tempo (15 bis 30 Schritte im Schuljahr) ist geschätzt; die Simulation folgt in Teilaufgabe 5;
- echtes iPad, weil keines zur Hand war;
- dunkler Modus der neuen Bilder;
- ob die Sterne aus dem UI Pack als Glitzern passen;
- ob es den Trog schon leer gibt;
- woher `assets/objects.png` (Lavendel) stammt und ob die Lizenz die Nutzung im Spiel erlaubt;
- die Gemini-Prompts selbst (noch kein Bild damit erzeugt).
