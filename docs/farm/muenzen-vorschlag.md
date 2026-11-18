# Münzsystem: Vorschlag (Teilaufgabe 5)

Stand 2026-11-18, Branch `farm-umsetzung`. Nur ein Vorschlag: am Spiel und an den Daten ist nichts geändert.
Die Zahlen stammen aus der Simulation `docs/farm/simulation/simulation.mjs`
(Aufruf `node docs/farm/simulation/simulation.mjs`, Ergebnis in `docs/farm/simulation/ergebnis.md`).
Die Preise darin sind die heutigen Preise aus der Datenbank (gelesen am 2026-11-18).

## 1. Das Wichtigste in Kürze

- **Das Problem ist der Handel auf der Farm, nicht das Üben.**
  - Ein Kind, das regelmäßig übt, verdient im Schuljahr etwa 15.000 Münzen durch Lernen.
  - Durch Verkaufen kommen heute noch einmal 16.000 dazu.
  - Wer viel spielt, macht durch Handel bis zu 66.000. Wer die Schlupflöcher nutzt, sogar 78.000.
  - Heute ist die Farm darum schon nach **8 bis 17 Wochen** voll.
- **Empfehlung: Modell A „Lernen zählt“.**
  - Verkaufen bringt nur noch wenig Gewinn und zählt nicht mehr zum Freischalten.
  - Dauerhafte Dinge kosten mehr. Samen bleiben so billig wie heute.
  - Dann ist die Farm bei regelmäßigem Üben nach etwa **27 Wochen** voll, also im Schuljahr.
  - Viel Spielen macht kaum schneller (26 Wochen). Schlupflöcher bringen fast nichts mehr.
- **Eine Zahl müssen Sie festlegen:** Wie viele **neue** Pakete bekommt ein Kind im Schuljahr?
  - Danach richtet sich, wie viel teurer der Laden werden muss (Abschnitt 5).
  - Ein Paket, das ein Kind wiederholt, bringt keine neuen Münzen mehr.

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
| regelmäßig | 2 (1 + 1 Hausaufgabe, wie mit Ihnen besprochen) | 80 % | 3 | |
| durchschnittlich | 1,5 | 70 % | 2 | |
| sporadisch | 0,5 | 60 % | 1 | |
| Vielspieler | 2 | 80 % | 7 | füttert immer mit dem besten Futter, verkauft alles |
| regelmäßig, nur 20 neue Pakete | etwa 0,5 neu, dazu Wiederholungen | 80 % | 3 | prüft, was passiert, wenn es nicht genug neue Pakete gibt |
| Schlupflöcher | 1 | 70 % | 7 | wiederholt täglich 3 Übungen nur zum Gießen, handelt wie der Vielspieler |

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
| Felder, Tiere, Bäume, Deko | × 2,5 | × 2,5 | × 2,5 |
| Samen | wie heute | wie heute | wie heute |
| Bonus | keiner | keiner | 20 Münzen in jeder Woche mit mindestens einem Paket |

**Variante A2** schließt zusätzlich das Gießen durch Wiederholen: Gießen nur, wenn die Übung neue Münzen bringt.
- Das bremst Kinder mit Schlupflöchern noch etwas mehr (54 statt 58 von 61 Käufen).
- Es bremst aber auch ehrliche Kinder, die ein Paket noch einmal üben. Darum **empfehle ich A2 nicht**: Auch Wiederholen ist Üben.

## 4. Ergebnis: Wann ist die Farm voll?

| Kind | heute | A | B | C |
|---|---|---|---|---|
| regelmäßig | 11 Wochen | **27 Wochen** | 27 Wochen | 26 Wochen |
| durchschnittlich | 17 Wochen | 59 von 61 Käufen | 59 von 61 | 60 von 61 |
| sporadisch | 53 von 61 Käufen | 37 von 61 | 37 von 61 | 38 von 61 |
| Vielspieler | **8 Wochen** | 26 Wochen | 21 Wochen | 25 Wochen |
| regelmäßig, nur 20 neue Pakete | 28 Wochen | 48 von 61 | 47 von 61 | 48 von 61 |
| Schlupflöcher | **13 Wochen** | 58 von 61 | 33 Wochen | 59 von 61 |

„58 von 61“ heißt: Am Ende des Schuljahres fehlen noch 3 Dinge.

Gewinn aus Handel im Schuljahr (Verkauf minus Samen):

| Kind | heute | A | B | C |
|---|---|---|---|---|
| regelmäßig | 16.000 | 6.100 | 7.630 | 6.330 |
| Vielspieler | 66.410 | 8.180 | 17.375 | 8.565 |
| Schlupflöcher | 78.215 | 4.993 | 11.240 | 4.875 |

**Was man daraus sieht**
- **Heute** zieht der Handel davon. Wer viel spielt oder Schlupflöcher nutzt, ist doppelt so schnell fertig wie ein Kind, das regelmäßig übt.
- **Modell A** bindet die Farm an das Üben:
  - Vielspieler und regelmäßiges Kind sind gleich schnell.
  - Schlupflöcher bringen weniger Gewinn als bei einem Kind, das regelmäßig übt.
- **Modell B** bremst den Handel nur halb. Der Vielspieler ist weiter schneller, und mit Schlupflöchern wird die Farm trotzdem voll.
  Außerdem versteht ein Kind schwer, warum es plötzlich nichts mehr verkaufen kann.
- **Modell C** wirkt wie A. Der Wochenbonus belohnt regelmäßiges Üben, aber nur ein wenig (1 Woche schneller).
- Die Zeile „nur 20 neue Pakete“ zeigt: **Gibt es zu wenige neue Pakete, ist auch ein fleißiges Kind in A nicht fertig.**
  Darum hängt der Preisfaktor an Ihrer Antwort (Abschnitt 5).

**Empfehlung: Modell A.**
- Es ist einfach zu erklären: „Münzen gibt es fürs Lernen. Auf der Farm kannst du tauschen, aber nicht reich werden.“
- Es schließt die drei großen Schlupflöcher (Futter Güte 3, Obstbäume, Verkauf zählt fürs Freischalten).
- Den Wochenbonus aus C können Sie dazunehmen (Entscheidung M3). Er ändert wenig, ist aber eine freundliche Geste für Regelmäßigkeit.

## 5. Preistabelle

**Wie teuer der Laden werden muss**, hängt davon ab, wie viele neue Pakete ein Kind im Jahr bekommt. Die Simulation rechnet das für Modell A aus
(volle Farm bei regelmäßigem Üben nach 30 bis 38 Wochen):

| neue Pakete im Schuljahr | Faktor für Felder, Tiere, Bäume, Deko |
|---|---|
| 20 (etwa ein neues Paket alle zwei Wochen) | 1 bis 1,25 (wie heute) |
| 38 (ein neues Paket pro Woche) | 1,75 bis 2 |
| 57 | 2,25 bis 3 |
| 76 (zwei neue Pakete pro Woche) | 3 bis 3,75 |

Die Tabelle unten zeigt den Faktor 2,5. Bei einer anderen Antwort rechne ich sie neu.

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

**Dauerhafte Dinge** (Faktor 2,5, auf 5 gerundet):

| Artikel | heute | neu |
|---|---|---|
| Feld | 40 | 100 |
| Huhn | 220 | 550 |
| Kuh | 450 | 1.125 |
| Orangenbaum / Pfirsichbaum / Birnenbaum | 300 / 350 / 400 | 750 / 875 / 1.000 |
| Busch, Blume | 25 | 65 |
| Klee, Pilz, Fels, Glockenblume | 30 | 75 |
| Stein, Traubenblume | 40 | 100 |
| Truhe, Baumstumpf, Schild, Briefkasten, Kürbisgesicht, Geschenk, Schilf, Wassersteine | 75 | 190 |
| Pilzhaus | 100 | 250 |
| Boot | 120 | 300 |
| Brunnen | 150 | 375 |
| Frosch, Bienenstock | 250 | 625 |

**Freischalten** (ab wie viel verdienten Münzen etwas im Laden steht):
- Die Grenzen bleiben bei 0 / 200 / 600 / 1.200 / 2.200. Verdient zählt dann aber nur noch Lernen.
- Ein Kind, das regelmäßig übt, hat damit nach etwa 6 Wochen alles freigeschaltet.
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

## 8. Offene Entscheidungen für Sie

| # | Frage | Mein Vorschlag |
|---|---|---|
| M1 | Welches Modell? | **A** „Lernen zählt“ |
| M2 | Wie viele **neue** Pakete bekommt ein Kind im Schuljahr ungefähr? (bestimmt den Preisfaktor) | Ihre Schätzung. Bei „1 Paket + 1 Hausaufgabe pro Woche, immer neu“ wäre es Faktor 3. Bei vielen Wiederholungen eher 1,5 bis 2. |
| M3 | Wochenbonus 20 Münzen für eine Woche mit mindestens einem Paket? | ja, als freundliche Geste (kein Bonus für Dauerspielen, nur einmal pro Woche) |
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
