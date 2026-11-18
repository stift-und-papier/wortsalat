# Münzsystem: Vorschlag (Teilaufgabe 5)

Stand 2026-11-18, Branch `farm-umsetzung`. Nur ein Vorschlag: am Spiel und an den Daten ist nichts geändert.
Die Zahlen stammen aus der Simulation `docs/farm/simulation/simulation.mjs`
(Aufruf `node docs/farm/simulation/simulation.mjs`, Ergebnis in `docs/farm/simulation/ergebnis.md`).
Die Preise darin sind die heutigen Preise aus der Datenbank (gelesen am 2026-11-18).

## 1. Das Wichtigste in Kürze

Grundlage (Jazz 2026-11-18): **Ein Kind bekommt ein neues Paket pro Woche**, dazu wiederholt es ältere Übungen.

- **Das Problem ist der Handel auf der Farm, nicht das Üben.**
  - Ein Kind, das regelmäßig übt, verdient im Schuljahr etwa 7.700 Münzen durch Lernen.
  - Durch Verkaufen kommen heute noch einmal 12.000 dazu.
  - Wer viel spielt, macht durch Handel bis zu 80.000. Wer die Schlupflöcher nutzt, 58.000, obwohl es wenig übt.
  - Heute ist die Farm darum schon nach **12 bis 27 Wochen** voll.
- **Empfehlung: Modell A „Lernen zählt“.**
  - Verkaufen bringt nur noch wenig Gewinn und zählt nicht mehr zum Freischalten.
  - Dauerhafte Dinge kosten **doppelt so viel**. Samen bleiben so billig wie heute.
  - Dann ist die Farm bei regelmäßigem Üben nach etwa **36 Wochen** voll, also am Ende des Schuljahres.
  - Viel Spielen macht nur wenig schneller (33 Wochen). Mit Schlupflöchern wird die Farm im Schuljahr nicht voll.
- **Preisfaktor 2** passt zu einem neuen Paket pro Woche (Abschnitt 5). Ein wiederholtes Paket bringt keine neuen Münzen.

## 2. Annahmen der Simulation

**Ablauf**
- Ein Schuljahr hat 38 Wochen.
- Ein Paket hat 6 Übungen mit je 6 Runden und eine Erklärseite. Die Übungen haben im Schnitt ★★.
- Die Münzen je Übung sind dieselben wie heute: ★★ = 30 × Anteil richtiger Runden, dazu 15 für Freundschaft, wenn die Übung ganz richtig ist.
- Pflanzen wachsen wie heute: durch Üben (jede richtige Runde) und einmal am Tag von selbst, höchstens bis zur Hälfte.
- Die Kinder kaufen in einer festen Reihenfolge, bis die Farm voll ist (61 Käufe):
  8 Felder, 4 Hühner, 3 Obstbäume, 2 Kühe, Boot, Brunnen und alle Deko-Plätze.
  Jede Deko wird einmal gekauft, die übrigen Plätze bekommen die günstigste.

**Kindertypen**

| Kind | neue Pakete pro Woche | richtig im 1. Versuch | Farm-Tage pro Woche | Besonderes |
|---|---|---|---|---|
| regelmäßig | 1 (wie von Ihnen festgelegt) | 80 % | 3 | wiederholt an Farm-Tagen 2 Übungen |
| durchschnittlich | 0,75 | 70 % | 2 | wiederholt 1 Übung |
| sporadisch | 0,25 | 60 % | 1 | |
| Vielspieler | 1 | 80 % | 7 | füttert immer mit dem besten Futter, verkauft alles |
| regelmäßig, 2 neue Pakete pro Woche | 2 | 80 % | 3 | prüft, was passiert, wenn es mehr neue Pakete gibt |
| Schlupflöcher | 0,5 | 70 % | 7 | wiederholt täglich 3 Übungen nur zum Gießen, handelt wie der Vielspieler |

**Grenzen der Simulation**
- Gerechnet wird mit Durchschnittswerten, ohne Zufall. Echte Kinder streuen stärker.
- Belohnungen für Lernfortschritt (Tulpe, Rose, Katzenblumen) und das Farm-Monster sind nicht eingerechnet. Sie machen alle Kinder etwas schneller.

## 3. Drei Modelle

| | Modell A „Lernen zählt“ | Modell B „Tagesdeckel“ | Modell C „A + Wochenbonus“ |
|---|---|---|---|
| Verkauf zählt fürs Freischalten | nein | ja | nein |
| Gewinn beim Verkauf | klein: Ernte = Samenpreis + 5, Ei = Futter + 5, Milch = Futter + 10 | wie heute | wie A |
| Grenze pro Tag | keine | höchstens 150 Münzen Verkauf pro Tag | keine |
| Obstbäume | alle 14 Tage 3 Früchte, je 15 bis 20 Münzen | wie heute | wie A |
| Felder, Tiere, Bäume, Deko | × 2 | × 2 | × 2 |
| Samen | wie heute | wie heute | wie heute |
| Bonus | keiner | keiner | 20 Münzen in jeder Woche mit mindestens einem Paket |

**Variante A2** schließt zusätzlich das Gießen durch Wiederholen: Gießen nur, wenn die Übung neue Münzen bringt.
- Das bremst Kinder mit Schlupflöchern noch etwas mehr (46 statt 48 von 61 Käufen).
- Es bremst aber auch ehrliche Kinder, die ein Paket noch einmal üben. Darum **empfehle ich A2 nicht**: Auch Wiederholen ist Üben.

## 4. Ergebnis: Wann ist die Farm voll?

| Kind | heute | A | B | C |
|---|---|---|---|---|
| regelmäßig | 19 Wochen | **36 Wochen** | 35 Wochen | 34 Wochen |
| durchschnittlich | 27 Wochen | 53 von 61 Käufen | 52 von 61 | 54 von 61 |
| sporadisch | 39 von 61 Käufen | 24 von 61 | 24 von 61 | 29 von 61 |
| Vielspieler | **12 Wochen** | 33 Wochen | 25 Wochen | 30 Wochen |
| regelmäßig, 2 neue Pakete pro Woche | 11 Wochen | 22 Wochen | 22 Wochen | 21 Wochen |
| Schlupflöcher | **19 Wochen** | 48 von 61 | 58 von 61 | 52 von 61 |

„48 von 61“ heißt: Am Ende des Schuljahres fehlen noch 13 Dinge.

Gewinn aus Handel im Schuljahr (Verkauf minus Samen):

| Kind | heute | A | B | C |
|---|---|---|---|---|
| regelmäßig | 12.020 | 4.155 | 4.980 | 4.518 |
| Vielspieler | 79.640 | 6.673 | 14.835 | 8.110 |
| Schlupflöcher | 58.140 | 1.635 | 5.835 | 2.325 |

**Was man daraus sieht**
- **Heute** zieht der Handel davon. Wer viel spielt, ist fast doppelt so schnell fertig wie ein Kind, das regelmäßig übt.
  Mit Schlupflöchern geht es so schnell wie bei regelmäßigem Üben, obwohl das Kind nur halb so viel Neues übt.
- **Modell A** bindet die Farm an das Üben:
  - Vielspieler und regelmäßiges Kind liegen nah beieinander (33 und 36 Wochen).
  - Schlupflöcher bringen kaum noch Gewinn.
- **Modell B** bremst den Handel nur halb. Der Vielspieler ist weiter deutlich schneller (25 Wochen).
  Außerdem versteht ein Kind schwer, warum es plötzlich nichts mehr verkaufen kann.
- **Modell C** wirkt wie A. Der Wochenbonus belohnt regelmäßiges Üben (2 Wochen schneller), aber auch den Vielspieler.
- Die Zeile „2 neue Pakete pro Woche“ zeigt: Bekommen Kinder mehr neue Pakete, ist die Farm früher voll (22 Wochen).
  Dann sollte der Preisfaktor höher sein (Abschnitt 5).

**Empfehlung: Modell A.**
- Es ist einfach zu erklären: „Münzen gibt es fürs Lernen. Auf der Farm kannst du tauschen, aber nicht reich werden.“
- Es schließt die drei großen Schlupflöcher (Futter Güte 3, Obstbäume, Verkauf zählt fürs Freischalten).
- Den Wochenbonus aus C gibt es nicht (Jazz 2026-11-18, Entscheidung M3).

## 5. Preistabelle

**Wie teuer der Laden werden muss**, hängt davon ab, wie viele neue Pakete ein Kind im Jahr bekommt. Die Simulation rechnet das für Modell A aus
(volle Farm bei regelmäßigem Üben nach 30 bis 38 Wochen):

| neue Pakete im Schuljahr | Faktor für Felder, Tiere, Bäume, Deko |
|---|---|
| 20 (etwa ein neues Paket alle zwei Wochen) | 1 bis 1,25 (wie heute) |
| 38 (ein neues Paket pro Woche) | 1,75 bis 2 |
| 57 | 2,25 bis 3 |
| 76 (zwei neue Pakete pro Woche) | 3 bis 3,75 |

**Sie haben „ein neues Paket pro Woche“ festgelegt (etwa 38 im Schuljahr), darum Faktor 2.** Die Tabelle unten zeigt diesen Faktor.

**Samen** (Preis wie heute; im Modell A bringt jede Ernte 5 Münzen mehr, als der Samen gekostet hat):

| Samen | Preis | Verkauf heute | Verkauf neu |
|---|---|---|---|
| Karotte, Salat | 15 | 20 | 20 |
| Rettich | 20 | 25 | 25 |
| Tomate, Weizen | 25 | 35 | 30 |
| Gurke, Blumenkohl | 30 | 40 | 35 |
| Rote Bete | 35 | 45 | 40 |
| Aubergine | 40 | 55 | 45 |
| Kürbis, Sternfrucht | 45 | 60 | 50 |

**Erzeugnisse:**
- Ei = Preis des Futtersamens + 5, Milch = Preis des Futtersamens + 10.
  - Beispiel: Mit einer Aubergine (40) gefüttert gibt das Huhn ein Blaues Ei für 45 statt heute 80.
- Obst bringt 15 (Orange), 17 (Pfirsich) oder 20 (Birne). Ein Baum trägt alle 14 Tage 3 Früchte.

**Dauerhafte Dinge** (Faktor 2):

| Artikel | heute | neu |
|---|---|---|
| Feld | 40 | 80 |
| Huhn | 220 | 440 |
| Kuh | 450 | 900 |
| Orangenbaum / Pfirsichbaum / Birnenbaum | 300 / 350 / 400 | 600 / 700 / 800 |
| Busch, Blume | 25 | 50 |
| Klee, Pilz, Fels, Glockenblume | 30 | 60 |
| Stein, Traubenblume | 40 | 80 |
| Truhe, Baumstumpf, Schild, Briefkasten, Kürbisgesicht, Geschenk, Schilf, Wassersteine | 75 | 150 |
| Pilzhaus | 100 | 200 |
| Boot | 120 | 240 |
| Brunnen | 150 | 300 |
| Frosch, Bienenstock | 250 | 500 |

Die volle Farm kostet damit 10.790 statt heute 5.395 Münzen.

**Freischalten** (ab wie viel verdienten Münzen etwas im Laden steht):
- Die Grenzen bleiben bei 0 / 200 / 600 / 1.200 / 2.200. Verdient zählt dann aber nur noch Lernen.
- Ein Kind, das regelmäßig übt (etwa 200 Münzen pro Woche), hat damit nach etwa 11 Wochen alles freigeschaltet.
- Die volle Farm braucht danach noch Zeit. Das ist gewollt: Das Ziel bleibt sichtbar.

## 6. Schlupflöcher: heute und mit Modell A

| # | Schlupfloch (Analyse, Abschnitt 6) | heute | mit Modell A |
|---|---|---|---|
| 1 | Wiederholen nur zum Gießen | lohnt sich über den Handel | gießt weiter, bringt aber kaum Gewinn (Ernte + 5) |
| 2 | Futter Güte 3 | +40 / +60 je Tier und Tag | +5 / +10 |
| 3 | Obstbäume | 90 bis 120 pro Woche und Baum | 22 bis 30 pro Woche und Baum |
| 4 | Verkauf zählt fürs Freischalten | ja | nein |
| 5 | Alle 79 Erklärseiten lesen | 395 Münzen | geschlossen durch Ihre Antwort 9: nur Erklärseiten aus zugewiesenen Paketen |
| 6 | „Versuch früher freigeben“ | keine Münzen, aber Gießen | wie 1 |
| 7 | „Ergebnisse zurücksetzen“ löscht Münzen und Farm | ja | geklärt durch Ihre Antwort 8: Münzen und Farm bleiben |

Ob die Antworten 8 und 9 schon im Spiel umgesetzt sind, habe ich hier nicht geprüft. Sie gehören in die spätere Umsetzung.

## 7. Bestand: Was mit schon Verdientem passiert

Es gilt immer: **Münzen werden nie abgezogen, Gekauftes bleibt.**

| Variante | Was passiert | Vorteil | Nachteil |
|---|---|---|---|
| **1. Neue Regeln nur für die Zukunft** (Empfehlung) | Kontostand und Gekauftes bleiben. Neue Preise gelten für künftige Käufe, neue Verkaufspreise für künftige Verkäufe. Was bisher durch Verkauf „verdient“ wurde, zählt fürs Freischalten weiter. | einfach, nichts geht verloren | alte Münzen kaufen danach weniger |
| 2. Ausgleich in Münzen | Jedes Kind bekommt seinen Kontostand × (Faktor − 1) dazu, damit es gleich viel kaufen kann wie vorher. | niemand hat weniger Kaufkraft | große Kontostände (aus dem Handel) wachsen noch mehr |
| 3. Stichtag mit festem Geschenk | Alle bekommen einmal z. B. 200 Münzen als „Dankeschön für die neue Farm“. | freundlich, gleich für alle | willkürliche Zahl |

**Warum Variante 1:**
- Bisher gibt es nur **Testkonten**. Echte Klassen kommen erst nach der Datenschutz-Freigabe.
- Damit trifft Variante 1 kein echtes Kind.
- Kommt die Umstellung später, wenn schon echte Kinder spielen, empfehle ich Variante 3.

## 8. Entscheidungen

**Jazz 2026-11-18:** M2 und M3 wie unten vermerkt, **alle übrigen Vorschläge angenommen** (M1 Modell A, M4 nein, M5 bis M9 wie vorgeschlagen).

| # | Frage | Mein Vorschlag |
|---|---|---|
| M1 | Welches Modell? | **A** „Lernen zählt“ |
| M2 | Wie viele **neue** Pakete bekommt ein Kind im Schuljahr ungefähr? | **entschieden (Jazz 2026-11-18): eins pro Woche → Faktor 2** |
| M3 | Wochenbonus 20 Münzen für eine Woche mit mindestens einem Paket? | **entschieden (Jazz 2026-11-18): nein, kein Wochenbonus** |
| M4 | Soll die Lehrkraft Faktoren pro Klasse einstellen können? | **nein, vorerst nicht** (eine Zahl mehr, die man verstehen muss; erst Erfahrungen sammeln) |
| M5 | Samen bleiben so billig wie heute? | ja (ein Kind soll nach einer Übung etwas pflanzen können) |
| M6 | Obstbäume alle 14 Tage statt jede Woche? | ja |
| M7 | Umgang mit Bestand | Variante 1 (nur Testkonten betroffen) |
| M8 | Hausaufgaben-Bonus? | später, wenn es Hausaufgaben im Spiel gibt (Ihre Antwort 4). Vorschlag dann: höchstens 5 Münzen je Paket. |
| M9 | Freischalt-Grenzen 0 / 200 / 600 / 1.200 / 2.200 | bleiben, zählen aber nur Lernmünzen |

## 9. Was nicht geprüft ist

- **Keine echten Spieldaten:**
  - Die Simulation rechnet mit Durchschnittswerten.
  - Wie oft Kinder wirklich auf die Farm gehen und wie gut sie üben, ist geschätzt.
- **Wachsende Deko nicht simuliert:**
  - Sie hängt an neuen Kompetenzen und am Lernfortschritt, nicht an Münzen.
  - Für eine ehrliche Rechnung braucht es Lernstand-Daten echter Klassen. Die gibt es noch nicht.
  - Die Schätzung aus `dekorationen.md` 3.3 (15 bis 30 Schritte im Schuljahr) bleibt ungeprüft.
- **Nichts im Spiel ausprobiert:** Der Vorschlag ist nur gerechnet.
- **Selbstprüfung:** Das Skript prüft am Ende zwei Dinge:
  - Schlupflöcher bringen im Vorschlag weniger als heute.
  - Die volle Farm ist im Vorschlag teurer.
  - Beide Prüfungen sind beim Lauf am 2026-11-18 ohne Meldung durchgelaufen.
