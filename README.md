# Wortsalat

Übungsplattform für Deutsch (Sek I): Rechtschreibung, Grammatik und Textüberarbeitung.
Lehrkräfte erstellen Aufgaben und Pakete. Schüler:innen üben am iPad über einen persönlichen Link, ohne Konto.
Für gelöste Aufgaben gibt es Münzen für die eigene kleine Farm.

- Adresse: https://stift-und-papier.github.io/wortsalat/
- Beschreibung: `docs/SPEC.md` · Bauplan: `tasks/plan.md` · Aufgaben: `tasks/todo.md`

## Entwickeln

```
npm install
npm run dev      # Entwicklungsserver
npm test         # Tests
npm run build    # Bauen
```

Die Seite wird bei jedem Push auf `main` automatisch veröffentlicht.

## Supabase wieder starten

Die Datenbank liegt in einem kostenlosen Supabase-Projekt. Wird es etwa **eine Woche lang nicht benutzt** (zum Beispiel in
den Ferien), schläft es ein („paused“). Dann lädt Wortsalat keine Übungen mehr, Schüler:innen und Lehrkraft sehen nur
Fehlermeldungen. Es gehen dabei **keine Daten verloren**.

So wecken Sie es wieder auf:

1. https://supabase.com/dashboard öffnen und anmelden (mit dem Konto, unter dem das Projekt angelegt wurde).
2. Das Projekt **wortsalat** anklicken. Oben steht ein Hinweis, dass das Projekt pausiert ist.
3. Auf **Restore project** (Projekt wiederherstellen) klicken und bestätigen.
4. Ein paar Minuten warten, bis das Projekt wieder „Healthy“ ist. Danach Wortsalat im Browser neu laden.

Hinweise:
- Nach etwa 90 Tagen Pause lässt sich das Projekt im Dashboard nicht mehr per Knopf wiederherstellen. Es also besser
  nicht so lange schlafen lassen (zum Beispiel in den Sommerferien einmal Wortsalat öffnen).
- Die jährliche Löschung der Schülerdaten (ab 1. September, siehe `DATENSCHUTZ.md`) läuft im Projekt selbst. War es
  eingeschlafen, holt der Server die Löschung innerhalb einer Stunde nach dem Aufwecken nach.

## Datenschutz

Welche Daten gespeichert und wann sie gelöscht werden: `DATENSCHUTZ.md`.

## Grafiken

Pixel-Grafiken: Assets – From: Sprout Lands – By: Cup Nooble (gekauft; die Pakete selbst liegen nur lokal in `assets/`
und werden nie hochgeladen). Ideen, Code und Grafiken aus TastenHeld mit Erlaubnis der Programmiererin.
