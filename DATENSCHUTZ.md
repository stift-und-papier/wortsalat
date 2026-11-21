# Datenschutz – Wortsalat

Stand: 21. November 2026. Dieses Dokument beschreibt **technische Fakten**: welche Daten die App speichert, wo, wer sie
sieht und wie sie gelöscht werden. Es ist **keine Rechtsberatung** und ersetzt nicht die Prüfung durch die Schulleitung bzw.
die oder den Datenschutzbeauftragten (DSB). Es kann als Grundlage für das Verzeichnis von Verarbeitungstätigkeiten dienen.
Der Datenschutz der Schule hat dem Einsatz zugestimmt, mit der Bedingung, dass die Schülerdaten **jedes Jahr zum
Schuljahresende gelöscht** werden (siehe „Speicherdauer und Löschen“).

Teil A richtet sich an Schulleitung und DSB, Teil B an Schüler:innen und Eltern (derselbe Text steht in der App unter
**Hilfe → Für Eltern und Schüler:innen**).

---

## Teil A – für Schulleitung und Datenschutzbeauftragte

### Zweck
Übungsplattform für den Deutschunterricht (Sek I). Die Lehrkraft stellt Übungen, Erklärungen und Hausaufgaben bereit,
Schüler:innen bearbeiten sie auf dem iPad. Für gelöste Übungen gibt es Münzen für eine kleine Farm (Spiel zur Motivation).
Die Lehrkraft sieht die Ergebnisse, um den Unterricht zu planen und Rückmeldung zu geben. Die App vergibt **keine Noten**.

### Grundsätze
- **Keine Klarnamen:** Schüler:innen erscheinen nur unter einem Pseudonym (z. B. „Fuchs-07“). Die Zuordnung
  Pseudonym → Person hat nur die Lehrkraft (z. B. auf der ausgedruckten Linkliste), sie liegt nicht in der App.
- **Keine Konten für Schüler:innen:** kein Name, keine E-Mail-Adresse, kein Passwort. Zugang über einen persönlichen
  Link mit einer Zufallskennung (192 Bit). Wer den Link hat, kann die Übungen dieser Person bearbeiten. Der Link ist
  deshalb wie ein Schlüssel zu behandeln.
- **Keine Tracking-, Analyse- oder Werbedienste**, keine Cookies, keine eingebundenen Schriften oder Skripte von fremden
  Servern (alles wird mit der App selbst ausgeliefert).
- **Keine Ranglisten, keine Vergleiche:** Schüler:innen sehen nur ihre eigenen Daten, nie die anderer.
- **Datensparsamkeit:** Gespeichert wird nur, was für Übung, Rückmeldung und das Farm-Spiel nötig ist (siehe Tabelle).
  Keine Tonaufnahmen, keine Fotos, keine Standortdaten, keine freien Texte an andere Personen.

### Welche Daten gespeichert werden

| Daten | Beispiel | Wo | Wer sieht sie |
|---|---|---|---|
| Lehrkraft-Konto | E-Mail-Adresse, Passwort (nur verschlüsselt als Hash) | Datenbank (Supabase) | nur die Lehrkraft selbst; technisch der Betreiber des Supabase-Projekts |
| Klassen | Name (z. B. „7b“), Jahrgang, Kerncurriculum | Datenbank | nur die eigene Lehrkraft |
| Schüler:innen | Pseudonym, Link-Kennung, Klasse, gewählte Spielfigur, Leseschrift an/aus, Zeitpunkt des Anlegens | Datenbank | nur die eigene Lehrkraft; die Person selbst nur ihr eigenes Pseudonym |
| Übungsergebnisse | Antworten je Runde, richtig/falsch, Zeitpunkt; bei Diktaten und „Fallenden Wörtern“ die getippten Zeichen und die Fehlerzahl; gelesene Erklärungen | Datenbank | Lehrkraft: alles; Schüler:in: nur eigene Rückmeldungen |
| Hausaufgaben | zugeteilte Übungen, Frist, ob erledigt, Versuche neu gegeben | Datenbank | Lehrkraft: alles; Schüler:in: nur eigene |
| Abgeleitete Werte | Lernstand je Kompetenz, Entwicklung im „Lernweg“ | Datenbank (berechnet) | Lehrkraft: alles; Schüler:in: nur Entwicklung in Worten („wird besser“ usw.), **nie** Punkte, Prozente, Stufen `--` bis `++` oder Noten |
| Spieldaten | Münzen (Zahl), Käufe im Shop, Felder und Pflanzen, Vorrat, Tiere und Fütterungen, Deko, befreundete Monster, Geschenke der Lehrkraft mit kurzer Nachricht | Datenbank | Lehrkraft: Münzen; Schüler:in: eigene Farm |
| Übungen, Erklärungen, Pakete, Kompetenzen | von der Lehrkraft erstellt | Datenbank | nur die eigene Lehrkraft; Schüler:innen nur Zugeteiltes **ohne Lösungen** |
| Zwischenspeicher auf dem Gerät | angefangene Antworten, noch nicht gesendete Antworten (offline), heller/dunkler Modus | Browser-Speicher (localStorage) des iPads | wer das iPad benutzt |
| Anmeldung der Lehrkraft | Sitzungsschlüssel | Browser-Speicher des Lehrkraft-Geräts | wer das Gerät benutzt |

Die Zugriffsregeln (wer was sieht) sind **in der Datenbank** festgelegt (Row Level Security und Datenbankfunktionen mit
Prüfung der Link-Kennung), nicht nur in der Oberfläche. Antworten, Münzen, Käufe und das Wachsen der Pflanzen rechnet nur
der Server. Lösungen werden nie an die Geräte der Schüler:innen geschickt. Automatische Tests prüfen diese Regeln nach
jeder Änderung.

### Wo die Daten liegen (Dienstleister)
- **Datenbank:** Supabase (Supabase Inc.), Rechenzentrum in **Frankfurt am Main** (AWS-Region `eu-central-1`).
  Supabase führt technische Protokolle (u. a. IP-Adressen von Anfragen) für kurze Zeit.
  *Zu prüfen durch die Schule:* Auftragsverarbeitungsvertrag (DPA) von Supabase, Sitz des Unternehmens in den USA.
- **Auslieferung der App:** GitHub Pages (GitHub Inc., Microsoft). Ausgeliefert werden nur die Programmdateien, **keine
  Schülerdaten**. GitHub erfasst beim Abruf technisch die IP-Adresse. Die Link-Kennung steht hinter dem `#` in der
  Adresse und wird deshalb **nicht** an GitHub gesendet.
  *Zu prüfen durch die Schule:* Datenschutzhinweise von GitHub.
- Der Quellcode ist öffentlich einsehbar. Er enthält **keine** Schülerdaten und keine Passwörter.

### Speicherdauer und Löschen

**Jährliche Löschung zum Schuljahresende (Pflicht):**
- Ab **1. August** zeigt die Lehrkraft-Ansicht oben einen Hinweis mit dem Knopf **„Jetzt löschen“**. Der Hinweis erinnert
  daran, den Lernstand vorher zu sichern („Für Excel“ oder „Drucken oder als PDF“ auf der Lernstand-Seite einer Klasse).
- Löscht die Lehrkraft bis zum 31. August nicht selbst, löscht der Server ab **1. September** (deutsche Zeit)
  **automatisch**. Er prüft das stündlich; war das Projekt in den Ferien eingeschlafen, holt er es nach dem Aufwecken nach.
- Gelöscht werden alle Schüler:innen, die **vor dem 1. August** angelegt wurden, mit Pseudonym, Link, Antworten,
  Lernstand, Münzen, Farm und Hausaufgaben-Stand. Der Link funktioniert danach nicht mehr.
- **Ausnahme für Klassen, die die Lehrkraft weiter unterrichtet:** Im Hinweis kann sie diese Klassen ankreuzen. Dort bleiben
  Pseudonym, Link, Münzen und Farm; gelöscht werden die Lernergebnisse von vor dem 1. August (Antworten, Lernstand).
- Es bleiben: die Klassen selbst (leer), Übungen, Erklärungen, Pakete und Kompetenzen der Lehrkraft.

**Jederzeit von Hand:**

| Was | Wo in der App | Folge |
|---|---|---|
| Ergebnisse **einer** Schüler:in zurücksetzen | Klasse → Zeile der Person → „Ergebnisse zurücksetzen“ | Antworten, gelesene Erklärungen und Lernstand gelöscht; Pseudonym, Link, Münzen und Farm bleiben |
| Ergebnisse **einer Klasse** zurücksetzen | Klasse → „Ergebnisse zurücksetzen“ | wie oben für alle Schüler:innen der Klasse |
| Schüler:in löschen | Klasse → „Löschen“ | Pseudonym, Link, alle Ergebnisse, Münzen und Farm gelöscht; der Link funktioniert nicht mehr |
| Klasse löschen | Klasse → „Klasse löschen“ | Klasse, alle Schüler:innen und alle ihre Daten gelöscht |
| Lehrkraft-Konto löschen | nur im Supabase-Dashboard (Authentication → Users) | löscht automatisch **alle** Daten dieser Lehrkraft |

Gelöschte Daten sind sofort aus der App verschwunden und lassen sich in der App nicht wiederherstellen.
Der Zwischenspeicher auf dem iPad wird gelöscht, indem man in Safari die Website-Daten löscht
(Einstellungen → Safari → Erweitert → Website-Daten).

*Außerdem:* Ausgedruckte Linklisten vernichten, wenn sie nicht mehr gebraucht werden; gespeicherte Lernstand-Dateien
(Excel, PDF) nach den Regeln der Schule aufbewahren und löschen.

### Rechte der Betroffenen
Auskunft und Löschung erfolgen über die Lehrkraft: Sie kann den Lernstand einer Person ansehen, drucken oder als PDF
speichern sowie Ergebnisse oder die Person löschen (siehe oben).

---

## Teil B – für Schüler:innen und Eltern (einfache Sprache)

**Was speichert Wortsalat über mich?**
- Deinen **Fantasienamen** (zum Beispiel „Fuchs-07“). Deinen richtigen Namen kennt die App nicht.
- Deine **Antworten** zu den Übungen und wann du sie gemacht hast.
- Deine **Farm**: Münzen, was du gekauft, gepflanzt und geerntet hast, deine Tiere und Monster.
- Welche Spielfigur du gewählt hast und ob die Leseschrift an ist.
- Daraus rechnet die App aus, wie du dich entwickelst.

**Wer sieht das?**
- **Deine Lehrkraft** sieht deine Antworten, deinen Lernstand und deine Münzen. So kann sie dir helfen.
- **Du** siehst deine eigenen Übungen, deine Rückmeldungen und deine Farm. Noten oder Punkte siehst du nicht. Die gibt es
  in der App nicht.
- **Andere Schüler:innen** sehen nichts von dir.

**Wo liegen die Daten?**
In einer Datenbank in Frankfurt am Main. Auf deinem iPad merkt sich die App nur angefangene Antworten und Antworten, die
noch auf Internet warten, damit nichts verloren geht.

**Was ist mit meinem Link?**
Dein Link ist wie ein Schlüssel. Gib ihn nicht weiter. Wer ihn hat, kann in deinem Namen üben.

**Werden die Daten gelöscht?**
Ja. Am Ende jedes Schuljahres, spätestens am 1. September, werden deine Daten gelöscht: Fantasiename, Link, Antworten,
Münzen und Farm. Unterrichtet dich deine Lehrkraft im neuen Schuljahr weiter, kann sie deine Farm behalten. Dann werden
nur deine Antworten gelöscht. Deine Lehrkraft kann deine Daten auch früher löschen. Sprich sie an, wenn du das möchtest.

**Gibt es Werbung oder Tracking?**
Nein. Die App zeigt keine Werbung und schickt keine Daten an Werbe- oder Analysefirmen.
