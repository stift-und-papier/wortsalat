# Analyse Münzen (Teilaufgabe 1, nur gelesen)

Stand: Branch `lehrkraftseite` = `main` (758fc78), 2026-11-17. Nichts geändert.
Geprüft durch Lesen der Migrationen (jeweils die **letzte** Fassung einer Funktion) und Lese-Abfragen in der Live-Datenbank
(Preise, Anzahl Übungen). Alle Münzen rechnet nur der Server.

## 1. Grundsätze im Code

- Jede Münzbewegung ist eine Zeile in `muenz_ereignisse` (`grund`, `schluessel`, `muenzen`); ein eindeutiger Schlüssel verhindert doppelte Vergabe.
- **Kontostand** = Summe aller Ereignisse − Summe der Kaufpreise in `besitz` (`kontostand`, `20261112140000_shop.sql`).
- **„Verdient“** (für das Freischalten im Shop) = Summe **aller** Ereignisse, also **auch Verkäufe und Geschenke der Lehrkraft** (`verdient`, ebd.).
- Münzen werden nie abgezogen. Einzige Ausnahme: Die Lehrkraft drückt **„Ergebnisse zurücksetzen“**. Das löscht Münzen, Besitz, Pflanzen, Vorrat
  und Belohnungen des Kindes komplett (`ergebnisse_zuruecksetzen`, `20261113150000_uebungen_runden.sql`, Zeile ~400).

## 2. Quellen (Münzen rein)

| Quelle | Betrag | Wie oft | Datei |
|---|---|---|---|
| **Übung** (neues System, Runden) | ★ 20 / ★★ 30 / ★★★ 40 × Anteil richtiger Runden (abgerundet) | **je Übung insgesamt höchstens einmal der volle Betrag**: beim Wiederholen nur die Differenz zum besten bisherigen Ergebnis | `muenzen_fuer_durchgang`, `20261113150000_uebungen_runden.sql` |
| **Freundschaft** (Übung ganz richtig bzw. Diktat ≥ 95 %) | ★ 10 / ★★ 15 / ★★★ 20 | einmal je Übung | ebd. |
| **Diktat 100 %** in einem späteren Durchgang | ★ 10 / ★★ 15 / ★★★ 20 | einmal je Diktat | ebd. (`diktat_voll`) |
| **Erklärseite gelesen** | 5 | einmal je Erklärseite | `muenzen_fuer_versuch`, `20261113100000_muenz_tag_server.sql` |
| Alte Aufgaben (vor dem Umbau) | ★ 10/15/20, halb im 2. Versuch, je Aufgabe 1× pro Tag | nicht mehr erreichbar (archiviert) | ebd. |
| **Verkauf** von Ernte, Eiern, Milch, Obst | 20 bis 100 je Stück (Tabelle unten) | beliebig oft | `verkaufen`, `20261112190000_einsammeln.sql` |
| **Geschenk der Lehrkraft** | frei wählbar | beliebig | `muenzen_schenken`, `20261112120000_muenzen.sql` |
| Belohnung Lernfortschritt | **keine Münzen**, sondern Samen bzw. Deko | einmal je Kompetenz und Stufe | `20261112270000_belohnungen.sql` |
| Farm-Monster | **keine Münzen**, sondern ein Shop-Samen montags und donnerstags | 2 × pro Woche | `20261115160000_farm_monster_einmal.sql` |

Zu **Runde** und **Diktat** einzeln gibt es keine Münzen: Gezahlt wird erst am Ende eines Durchgangs (Anteil richtiger Runden bzw. Zeichen).
**Hausaufgaben** gibt es im Code nicht (kein eigener Begriff, keine eigenen Münzen). Siehe Rückfrage 4.

### Höchstbetrag je Übung (Grund + Freundschaft)

| Sterne | ganz richtig | halb richtig, später ganz richtig |
|---|---|---|
| ★ | 30 | 10 + 10 + 10 = 30 (Differenz + Freundschaft) |
| ★★ | 45 | 15 + 15 + 15 = 45 |
| ★★★ | 60 | 20 + 20 + 20 = 60 |

**Wiederholen bringt also keine zusätzlichen Münzen.** Das alte Schlupfloch („jeden Tag dieselbe Aufgabe“) ist im neuen System zu.

### Was es heute insgesamt zu verdienen gibt (Live-Datenbank)

- **50 aktive Übungen** (7 × ★, 30 × ★★, 13 × ★★★; davon 3 Diktate): zusammen **höchstens 2.340 Münzen** (+ Diktat-Zusatz bis 45).
- **79 Erklärseiten**, die **alle** Kinder unter „Erklärungen“ sehen (alle Jahrgänge): **395 Münzen** nur fürs Antippen von „Gelesen“.
- Ohne Farm-Handel ist das Verdienen also durch die Zahl der zugewiesenen Übungen begrenzt.

## 3. Senken (Münzen raus): Preise im Shop (Live-Datenbank)

| Art | Artikel (Preis, im Shop ab „verdient“) |
|---|---|
| Feld | 40 (ab 0), 4 Felder von Anfang an, bis 12 |
| Samen | Karotte, Salat 15 · Rettich 20 (ab 0) · Weizen, Tomate 25 · Gurke 30 (ab 200) · Blumenkohl 30, Rote Bete 35 (ab 600) · Aubergine 40, Kürbis 45 (ab 1200) · Sternfrucht 45 (ab 2200) |
| Tiere | Huhn 220 (ab 200), Kuh 450 (ab 1200), je bis 4 |
| Obstbäume | Orange 300 (ab 600), Pfirsich 350 (ab 1200), Birne 400 (ab 2200), je 1 |
| Deko | Busch 25 (ab 0), Blume gelb 25, Pilz 30 (ab 200), Stein 40, Blume lila 40, Boot 120 (ab 600), Pilzhaus 100, Brunnen 150 (ab 2200); 18 Deko-Plätze |
| Nur Belohnung | Tulpe, Rose (Samen), Katzenblume rosa/blau (Deko), Preis 0 |

**Volle Farm** (alle Plätze belegt, ohne verbrauchte Samen): 8 Felder 320 + 4 Hühner 880 + 4 Kühe 1.800 + 3 Bäume 1.050 + Boot 120
+ Brunnen 150 + 18 Deko 450 bis 900 ≈ **4.800 bis 5.200 Münzen**.

## 4. Der Farm-Kreislauf (Verkaufspreise aus `shop_artikel.verkauf`)

| Kauf → Verkauf | Gewinn je Stück |
|---|---|
| Karotte/Salat 15 → 20, Rettich 20 → 25 | +5 |
| Weizen/Tomate 25 → 35, Gurke/Blumenkohl 30 → 40, Rote Bete 35 → 45 | +10 |
| Aubergine 40 → 55, Kürbis/Sternfrucht 45 → 60 | +15 |
| Futter Güte 2 (z. B. Tomate, Samen 25) → Huhn: Rosa Ei 50 / Kuh: Erdbeermilch 65 | +25 / +40 |
| Futter Güte 3 (Aubergine, Samen 40) → Huhn: Blaues Ei 80 / Kuh: Blaubeermilch 100 | **+40 / +60** |
| Obstbaum, jede Woche 3 Früchte ohne Gießen | Orange 90, Pfirsich 105, Birne 120 je Woche |

**Wachstum** (`wachstum`, `20261113160000_giessen.sql`): Jede fertige Übung gießt **alle** Felder um die Zahl richtiger Runden (mindestens 1),
**auch beim Wiederholen ohne Münzen**. Jede gelesene Erklärseite gießt +1. Dazu wächst jede Pflanze 1 Stufe pro Tag von selbst, höchstens bis zur Hälfte.

## 5. Rechenbeispiele: Wo es zu schnell geht

**A. Übungen allein (gedeckelt):** Ein fleißiges Kind macht alle 50 Übungen mit je etwa 4 Minuten (≈ 3,5 Stunden) und liest die
79 Erklärseiten: 2.340 + 395 ≈ **2.700 Münzen**. Das schaltet fast den ganzen Shop frei (bis 2.200). Wie schnell das geht, hängt nur davon ab,
wie viele Übungen die Lehrkraft auf einmal zuweist. Bei 7 zugewiesenen Paketen wäre das in **einer Woche** möglich.

**B. Farm-Handel (nicht gedeckelt):** Mit 4 Hühnern und 4 Kühen und Futter der Güte 3:
4 × 40 + 4 × 60 = **400 Münzen Gewinn pro Tag**, dazu 315 je Woche von den Obstbäumen.
Nötig sind dafür etwa 8 reife Auberginen am Tag. Auberginen brauchen 8 Wachstumsstufen: 4 kommen von selbst, der Rest durch Gießen.
Ein einziger Durchgang mit 6 richtigen Runden gießt alle 12 Felder um 6 Stufen. **Schon eine Wiederholung ohne neue Münzen alle zwei Tage hält den Kreislauf am Laufen.**
Eine volle Farm bringt so etwa **2.000 bis 3.000 Münzen pro Woche**, eine perfekte ★★-Übung bringt 45.

**C. Vergleich:** Nach etwa zwei Wochen mit Tieren verdient ein Kind auf der Farm in einem Tag so viel wie mit 9 perfekten Übungen.
Das Verdienen löst sich vom Üben. Das ist vermutlich das „zu schnell“, das Jazz beobachtet hat.
(Testfarm Pfau-99 hat 6.180 Münzen, davon 6.040 als Lehrkraft-Geschenk: das sind Testdaten, kein echtes Spiel.)

## 6. Schlupflöcher (geprüft im Code)

| # | Schlupfloch | Wirkung | Stelle |
|---|---|---|---|
| 1 | **Gießen durch Wiederholen** ohne Münzen | Jede Wiederholung (am nächsten Tag oder nach „Versuch früher freigeben“) gießt alle Felder → Farm-Handel läuft ohne Lernfortschritt. | `wachstum` |
| 2 | **Tierfutter Güte 3** | +40 / +60 je Tier und Tag, unabhängig vom Üben | `fuettern`, `verkaufen` |
| 3 | **Obstbäume** | Einkommen jede Woche ohne Üben (Amortisation nach 3–4 Wochen) | `baum_ernten` |
| 4 | **Verkauf zählt als „verdient“** | Teure Freischaltungen (1.200, 2.200) werden durch Handel statt durch Üben erreicht. | `verdient` |
| 5 | **Alle 79 Erklärseiten** für alle Jahrgänge | 395 Münzen + 79 × Gießen für reines Antippen | `muenzen_fuer_versuch`, `Erklaerungen.tsx` |
| 6 | „Versuch früher freigeben“ (Lehrkraft) | bringt keine Münzen (nur Differenz), aber Gießen (siehe 1) | `versuch_freigeben` |
| 7 | **„Ergebnisse zurücksetzen“** | umgekehrtes Problem: löscht Münzen **und gekaufte Dinge** des Kindes. Widerspricht „Münzen nie streichen“. | `ergebnisse_zuruecksetzen` |
| – | Wiederholen derselben Übung für Münzen | **geschlossen** (nur Differenz zum besten Ergebnis) | `muenzen_fuer_durchgang` |
| – | Diktat-Zusatzmünzen | klein und einmalig (10–20 je Diktat), kein Schlupfloch | ebd. |
| – | Hausaufgaben-Versuche | gibt es nicht als eigenen Fall; Hausaufgaben sind normale Übungen | – |

## 7. Folgerungen für den Vorschlag (Teilaufgabe 5)

1. Der Hebel liegt weniger bei den Übungs-Münzen (die sind gedeckelt) als beim **Farm-Handel**: Gewinnspannen, Gießen ohne Lernen, Obstbäume.
2. „Verdient“ für das Freischalten sollte nur aus **Lernen** kommen (Übungen, Freundschaft), nicht aus Verkauf.
3. Gießen könnte an **neue richtige Runden** gekoppelt werden statt an jede Wiederholung.
4. Die Menge der Lern-Münzen hängt stark davon ab, **wie viele Übungen zugewiesen sind**: Eine Zieldauer („volle Farm nach einem Schuljahr“)
   braucht Annahmen über die Übungshäufigkeit (Rückfrage 1).

**Nicht getestet:** keine Münz-Abläufe im Browser durchgespielt (nur Code gelesen und Preise/Anzahlen in der Datenbank abgefragt);
die Rechenbeispiele sind gerechnet, nicht gespielt.
