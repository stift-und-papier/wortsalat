// Inhalte „Grammatik Klasse 7“ nach den Arbeitsblättern DS01–DS07 von Jazz (2026-11-17), allgemein formuliert (kein Krabat).
// Schreibweise wie im Editor (Textmodus): Lücke [Lösung : Hinweis], Auswahl [falsch | *richtig], Zuordnen [Wort = Kategorie],
// Fehler [falsch -> richtig], Reihenfolge „Baustein | Baustein.“, Multiple Choice „Frage: …“ und je Antwort eine Zeile (* = richtig).
// Erzeugen und einspielen: scripts/reihe7-sql.ts
export type Format = 'lueckentext' | 'auswahl' | 'zuordnen' | 'fehler' | 'reihenfolge' | 'ueberarbeiten'
export type Runde = { typ: Format; text: string; kategorien?: string[]; anweisung?: string; hinweis?: string }
type Uebung = { titel: string; typ: Format; anweisung?: string; hinweis?: string; kategorien?: string[]; kompetenzen?: string[]; runden: string[] }
type Paket = {
  kurz: string
  titel: string
  monster: string
  kompetenzen: string[]
  erklaerung: { titel: string; text: string; merke: string; beispiele: string[] }
  /** von leicht nach schwer; { vorhanden: id } = Übung, die Jazz schon angelegt hat */
  uebungen: (Uebung | { vorhanden: string })[]
  abschlussTitel: string
  /** je Format eine Runde, von leicht nach schwer */
  abschluss: Runde[]
}

const ZEIT = ['Verben und Zeitformen']

export const PAKETE: Paket[] = [
  // ---------------------------------------------------------------- DS01
  {
    kurz: 'ds01',
    titel: 'Zeitformen und Plusquamperfekt',
    monster: 'ruebchen',
    kompetenzen: ZEIT,
    erklaerung: {
      titel: 'Erklärung: Zeitformen und Plusquamperfekt',
      text:
        'Mit der Zeitform (dem Tempus) zeigst du, wann etwas geschieht.\nPräsens: Sie spielt.\nPräteritum: Sie spielte.\nPerfekt: Sie hat gespielt.\nFutur I: Sie wird spielen.\n\n' +
        'So bestimmst du die Zeitform: Suche zuerst das gebeugte Verb. Steht ein Hilfsverb im Satz, gehört noch eine zweite Verbform dazu, meist am Satzende. hat … gespielt oder ist … gelaufen ist Perfekt, wird … spielen ist Futur I.\n\n' +
        'Das Plusquamperfekt zeigt, dass etwas vor einem anderen vergangenen Geschehen passiert ist. Das nennt man Vorzeitigkeit. Du bildest es mit hatte oder war und dem Partizip II.',
      merke: 'Plusquamperfekt = [hatte] oder [war] + Partizip II. Es steht für das, was vorher passiert ist.',
      beispiele: [
        'Wir kamen zu spät zum Bahnhof. Der Zug [war] schon [abgefahren].',
        'Zuerst: [hatte gelernt] (Plusquamperfekt), danach: [schrieb] (Präteritum). Mia schrieb eine gute Arbeit, denn sie [hatte] viel [gelernt].',
      ],
    },
    uebungen: [
      {
        titel: 'Zeitformen bestimmen',
        typ: 'auswahl',
        anweisung: 'Welche Zeitform hat der Satz? Tippe sie an.',
        hinweis: 'Suche das gebeugte Verb. Gibt es noch eine zweite Verbform am Satzende?',
        runden: [
          'Morgen wird es regnen. Zeitform: [Präsens | Perfekt | *Futur I | Präteritum]',
          'Tim hat seinen Schlüssel verloren. Zeitform: [Präteritum | *Perfekt | Futur I | Präsens]',
          'Meine Schwester liest ein Buch. Zeitform: [*Präsens | Präteritum | Perfekt | Futur I]',
          'Die Kinder spielten im Garten. Zeitform: [Präsens | *Präteritum | Perfekt | Futur I]',
          'Lea ist zum Bäcker gelaufen. Zeitform: [Präteritum | Präsens | Futur I | *Perfekt]',
          'Ihr werdet die Prüfung bestehen. Zeitform: [Perfekt | Präsens | *Futur I | Präteritum]',
          'Der Hund bellte die ganze Nacht. Zeitform: [Perfekt | *Präteritum | Präsens | Futur I]',
          'Wir hatten den Film schon gesehen. Zeitform: [Perfekt | Präteritum | *Plusquamperfekt | Futur I]',
        ],
      },
      {
        titel: 'Verbformen bilden',
        typ: 'lueckentext',
        anweisung: 'Bilde die Formen für „er“.',
        hinweis: 'Perfekt: hat oder ist + Partizip II. Futur I: wird + Grundform.',
        runden: [
          'spielen: Präteritum: er [spielte] · Perfekt: er [hat gespielt] · Futur I: er [wird spielen]',
          'laufen: Präteritum: er [lief] · Perfekt: er [ist gelaufen] · Futur I: er [wird laufen]',
          'lachen: Präteritum: er [lachte] · Perfekt: er [hat gelacht] · Futur I: er [wird lachen]',
          'fahren: Präteritum: er [fuhr] · Perfekt: er [ist gefahren] · Futur I: er [wird fahren]',
          'schreiben: Präteritum: er [schrieb] · Perfekt: er [hat geschrieben] · Futur I: er [wird schreiben]',
          'träumen: Präteritum: er [träumte] · Perfekt: er [hat geträumt] · Futur I: er [wird träumen]',
          'springen: Präteritum: er [sprang] · Perfekt: er [ist gesprungen] · Futur I: er [wird springen]',
          'essen: Präteritum: er [aß] · Perfekt: er [hat gegessen] · Futur I: er [wird essen]',
        ],
      },
      {
        titel: 'Plusquamperfekt finden',
        typ: 'zuordnen',
        anweisung: 'Was ist zuerst passiert? Tippe die Verben an und ordne sie zu.',
        hinweis: 'Plusquamperfekt: hatte oder war + Partizip II. Ordne beide Teile zu.',
        kategorien: ['Plusquamperfekt', 'Präteritum'],
        runden: [
          'Wir [kamen = Präteritum] an. Der Zug [war = Plusquamperfekt] schon [abgefahren = Plusquamperfekt].',
          'Mia [hatte = Plusquamperfekt] fleißig [gelernt = Plusquamperfekt], deshalb [bestand = Präteritum] sie den Test.',
          'Nachdem Ben den Rasen [gemäht = Plusquamperfekt] [hatte = Plusquamperfekt], [ruhte = Präteritum] er sich aus.',
          'Die Katze [schlief = Präteritum], denn sie [war = Plusquamperfekt] den ganzen Tag [herumgelaufen = Plusquamperfekt].',
          'Als wir [ankamen = Präteritum], [hatte = Plusquamperfekt] das Konzert schon [begonnen = Plusquamperfekt].',
          'Lena [freute = Präteritum] sich, weil sie den Schlüssel [gefunden = Plusquamperfekt] [hatte = Plusquamperfekt].',
          'Ich [war = Plusquamperfekt] lange [gewandert = Plusquamperfekt] und [hatte = Präteritum] großen Hunger.',
          'Am Morgen [merkte = Präteritum] Tom, dass jemand sein Fahrrad [weggestellt = Plusquamperfekt] [hatte = Plusquamperfekt].',
        ],
      },
      {
        titel: 'Plusquamperfekt bilden',
        typ: 'lueckentext',
        anweisung: 'Setze das Verb in Klammern ins Plusquamperfekt.',
        hinweis: 'hatte oder war + Partizip II, z. B. hatte gelernt, war gelaufen.',
        runden: [
          'Lisa war müde, denn sie [hatte : haben] lange [trainiert : trainieren].',
          'Als wir ankamen, [war : sein] der Bus schon [abgefahren : abfahren].',
          'Paul freute sich, weil er die Arbeit gut [geschrieben hatte : schreiben].',
          'Der Boden war nass. Es [hatte : haben] in der Nacht [geregnet : regnen].',
          'Nachdem die Klasse das Lied [geübt hatte : üben], sang sie es vor.',
          'Ich erkannte ihn nicht, denn ich [hatte : haben] ihn noch nie [gesehen : sehen].',
          'Am Abend [waren : sein] alle Gäste schon [gegangen : gehen].',
          'Sara erschrak, denn jemand [hatte : haben] die Tür [geöffnet : öffnen].',
        ],
      },
      // von Jazz angelegt: „Satzstellungen bei Sätzen im Plusquamperfekt“ (Reihenfolge)
      { vorhanden: '99b22766-b22a-4c28-af81-d6855d049fc6' },
    ],
    abschlussTitel: 'Abschluss: Zeitformen und Plusquamperfekt',
    abschluss: [
      { typ: 'auswahl', anweisung: 'Welche Zeitform hat der Satz? Tippe sie an.', text: 'Der Bäcker hat frische Brötchen gebacken. Zeitform: [Präteritum | *Perfekt | Präsens | Futur I]' },
      { typ: 'lueckentext', anweisung: 'Setze das Verb in Klammern ins Plusquamperfekt.', text: 'Als wir zum Kino kamen, [hatte : haben] der Film schon [angefangen : anfangen].' },
      {
        typ: 'zuordnen',
        anweisung: 'Was ist zuerst passiert? Tippe die Verben an und ordne sie zu.',
        kategorien: ['Plusquamperfekt', 'Präteritum'],
        text: 'Nachdem Emma den Hund [gefüttert = Plusquamperfekt] [hatte = Plusquamperfekt], [ging = Präteritum] sie zur Schule.',
      },
      { typ: 'reihenfolge', text: 'Varianten: 2\ngestern | hatte | ich | den Schlüssel | verloren.\nich | hatte | gestern | den Schlüssel | verloren.' },
    ],
  },
  // ---------------------------------------------------------------- DS02
  {
    kurz: 'ds02',
    titel: 'hatte oder war? Zeiten richtig verwenden',
    monster: 'schleim_gruen',
    kompetenzen: [...ZEIT, 'Fehler finden und berichtigen'],
    erklaerung: {
      titel: 'Erklärung: hatte oder war?',
      text:
        'Die meisten Verben bilden das Plusquamperfekt mit hatte: er hatte gearbeitet. Mit war bildest du es bei Verben der Bewegung (laufen, fliegen), bei Verben, die eine Veränderung ausdrücken (einschlafen, verschwinden), und bei sein, werden und bleiben.\n\n' +
        'So findest du das Hilfsverb: Bilde zuerst das Perfekt und setze dann das Hilfsverb in die Vergangenheit: er ist geflogen → er war geflogen, er hat gelernt → er hatte gelernt.\n\n' +
        'Eine Erzählung steht im Präteritum. Alles, was davor geschehen ist, rutscht eine Stufe zurück ins Plusquamperfekt.',
      merke: 'Steht der Hauptsatz im Präteritum, steht der Teil mit [nachdem] im Plusquamperfekt.',
      beispiele: ['Nachdem wir [gegessen hatten], [spielten] wir draußen.', 'Er [war] schon [eingeschlafen], als das Telefon klingelte.'],
    },
    uebungen: [
      {
        titel: 'hatte oder war?',
        typ: 'auswahl',
        anweisung: 'Wähle das passende Hilfsverb.',
        hinweis: 'Bilde zuerst das Perfekt: ist gelaufen → war gelaufen, hat gelernt → hatte gelernt.',
        runden: [
          'Sie [*hatte | war] lange gearbeitet. Er [hatte | *war] nach Hause gelaufen.',
          'Das Kind [hatte | *war] schnell eingeschlafen. Wir [*hatten | waren] Vokabeln gelernt.',
          'Der Vogel [hatte | *war] davongeflogen. Ihr [*hattet | wart] laut gerufen.',
          'Ich [*hatte | war] lange geschwiegen. Du [hattest | *warst] zu Hause geblieben.',
          'Die Uhr [hatte | *war] stehen geblieben. Oma [*hatte | war] einen Kuchen gebacken.',
          'Der Schnee [hatte | *war] geschmolzen. Mein Bruder [*hatte | war] das Zimmer aufgeräumt.',
          'Wir [hatten | *waren] früh aufgewacht. Die Lehrerin [*hatte | war] die Hefte eingesammelt.',
          'Der Ball [hatte | *war] verschwunden. Die Kinder [hatten | *waren] um die Wette gerannt.',
        ],
      },
      {
        titel: 'Unregelmäßige Verben im Plusquamperfekt',
        typ: 'lueckentext',
        anweisung: 'Bilde das Plusquamperfekt für „er“.',
        hinweis: 'Diese Verben sind unregelmäßig. Denk an hatte oder war.',
        runden: [
          'schreiben: er [hatte geschrieben] · fallen: er [war gefallen]',
          'trinken: er [hatte getrunken] · werden: er [war geworden]',
          'denken: er [hatte gedacht] · kommen: er [war gekommen]',
          'finden: er [hatte gefunden] · schwimmen: er [war geschwommen]',
          'bringen: er [hatte gebracht] · bleiben: er [war geblieben]',
          'lesen: er [hatte gelesen] · steigen: er [war gestiegen]',
          'nehmen: er [hatte genommen] · fliegen: er [war geflogen]',
          'singen: er [hatte gesungen] · gehen: er [war gegangen]',
        ],
      },
      {
        titel: 'Sätze mit nachdem',
        typ: 'lueckentext',
        anweisung: 'Setze die Verben in die passende Zeitform: zuerst Plusquamperfekt, danach Präteritum.',
        hinweis: 'Der Teil mit nachdem ist zuerst passiert: Plusquamperfekt. Der Hauptsatz steht im Präteritum.',
        runden: [
          'Nachdem Tim die Hausaufgaben [gemacht hatte : machen], [ging : gehen] er nach draußen.',
          'Nachdem es aufgehört [hatte : haben] zu regnen, [spielten : spielen] wir Fußball.',
          'Nachdem die Klingel [geläutet hatte : läuten], [verließen : verlassen] alle den Raum.',
          'Nachdem Mia [eingeschlafen war : einschlafen], [schlich : schleichen] die Katze ins Zimmer.',
          'Nachdem wir den Berg [bestiegen hatten : besteigen], [machten : machen] wir eine Pause.',
          'Nachdem der Bus [angekommen war : ankommen], [stiegen : steigen] die Kinder ein.',
          'Nachdem Opa die Zeitung [gelesen hatte : lesen], [trank : trinken] er Kaffee.',
          'Nachdem ich das Fenster [geöffnet hatte : öffnen], [flog : fliegen] ein Vogel herein.',
        ],
      },
      {
        titel: 'Falsche Zeitform verbessern',
        typ: 'fehler',
        anweisung: 'Finde die falsche Verbform und schreibe sie richtig.',
        hinweis: 'Was vor einem vergangenen Geschehen passiert ist, steht im Plusquamperfekt.',
        runden: [
          'Nachdem ich gegessen [habe -> hatte], ging ich los.',
          'Als Lea aufwachte, [sind -> waren] die anderen schon aufgestanden.',
          'Tom war traurig, denn er seinen Ball verloren [hat -> hatte].',
          'Nachdem wir das Spiel gewonnen hatten, [feiern -> feierten] wir.',
          'Der Rasen war nass, weil es geregnet [hat -> hatte].',
          'Nachdem die Sonne untergegangen [ist -> war], wurde es kalt.',
          'Als wir am Strand ankamen, [ist -> war] die Flut schon gekommen.',
          'Sie [freut -> freute] sich, weil sie die Prüfung bestanden hatte.',
        ],
      },
    ],
    abschlussTitel: 'Abschluss: hatte oder war?',
    abschluss: [
      { typ: 'auswahl', anweisung: 'Wähle das passende Hilfsverb.', text: 'Die Kinder [hatten | *waren] in den See gesprungen.' },
      { typ: 'lueckentext', anweisung: 'Setze die Verben in die passende Zeitform.', text: 'Nachdem Max den Tisch [gedeckt hatte : decken], [aßen : essen] alle zusammen.' },
      { typ: 'fehler', anweisung: 'Finde die falsche Verbform und schreibe sie richtig.', text: 'Nachdem wir die Fahrräder repariert [haben -> hatten], fuhren wir los.' },
    ],
  },
  // ---------------------------------------------------------------- DS03
  {
    kurz: 'ds03',
    titel: 'Konjunktionen: Sätze verbinden',
    monster: 'schleim_blau',
    kompetenzen: ['Konjunktionen', 'Zahlwörter, Adverbien, Konjunktionen'],
    erklaerung: {
      titel: 'Erklärung: Konjunktionen',
      text:
        'Konjunktionen (Bindewörter) verbinden Wörter, Wortgruppen und Sätze.\n\n' +
        'Nebenordnende Konjunktionen (und, oder, aber, denn, sondern, doch) verbinden zwei Hauptsätze. Danach steht das gebeugte Verb an zweiter Stelle. Die Konjunktion zählt dabei nicht mit.\n\n' +
        'Unterordnende Konjunktionen (weil, dass, obwohl, als, wenn, nachdem, bevor, während, damit, ob) leiten einen Nebensatz ein. Danach steht das gebeugte Verb am Ende.\n\n' +
        'Konjunktionen drücken etwas aus: Grund (weil, da, denn), Gegensatz (aber, doch, sondern), Einschränkung (obwohl), Zeit (als, nachdem, bevor, während), Bedingung (wenn, falls), Zweck (damit).',
      merke: 'Merkwort ADUSO: [aber], [denn], [und], [sondern], [oder] sind nebenordnend, dazu kommt [doch].',
      beispiele: ['Ich bleibe drinnen, [denn] es [regnet] draußen.', 'Ich bleibe drinnen, [weil] es draußen [regnet].'],
    },
    uebungen: [
      {
        titel: 'Konjunktionen finden',
        typ: 'zuordnen',
        anweisung: 'Tippe die Konjunktionen an, die Sätze verbinden, und ordne sie zu.',
        hinweis: 'ADUSO + doch sind nebenordnend. Nach unterordnenden steht das Verb am Ende.',
        kategorien: ['nebenordnend', 'unterordnend'],
        runden: [
          'Ich wollte ins Kino, [aber = nebenordnend] der Film war ausverkauft.',
          'Wir blieben im Haus, [weil = unterordnend] es stürmte.',
          'Lina lernte viel, [denn = nebenordnend] sie wollte eine gute Note.',
          '[Als = unterordnend] die Glocke läutete, rannten alle hinaus.',
          'Ich weiß, [dass = unterordnend] du das schaffst.',
          'Tom ging nicht schwimmen, [sondern = nebenordnend] er spielte Tennis.',
          'Sie lachte, [obwohl = unterordnend] sie müde war, [und = nebenordnend] alle lachten mit.',
          'Er rief an, [doch = nebenordnend] niemand nahm ab, [weil = unterordnend] alle draußen waren.',
        ],
      },
      {
        titel: 'Nebenordnend oder unterordnend?',
        typ: 'ueberarbeiten',
        anweisung: 'Tippe die richtigen Antworten an.',
        runden: [
          'Frage: Welche Konjunktionen sind nebenordnend?\n*und\nweil\n*aber\ndass',
          'Frage: Welche Konjunktionen sind unterordnend?\n*obwohl\ndenn\n*nachdem\noder',
          'Frage: Nach welcher Konjunktion steht das gebeugte Verb am Ende?\n*weil\nund\nsondern\ndoch',
          'Frage: Welche Konjunktionen drücken einen Grund aus?\n*weil\n*denn\nobwohl\nbevor',
          'Frage: Welche Konjunktionen drücken eine Zeit aus?\n*als\n*während\nsondern\ndamit',
          'Frage: In welchen Sätzen steht eine unterordnende Konjunktion?\n*Ich bleibe, weil es regnet.\nIch bleibe, denn es regnet.\n*Ich bleibe, obwohl ich müde bin.\nIch bleibe, aber ich bin müde.',
          'Frage: Welche Konjunktion drückt einen Zweck aus?\n*damit\naber\noder\nals',
          'Frage: Welche Wörter gehören zum Merkwort ADUSO?\n*sondern\n*oder\nob\nwenn\n*denn',
        ],
      },
      {
        titel: 'Die passende Konjunktion',
        typ: 'auswahl',
        anweisung: 'Wähle die Konjunktion, die passt.',
        hinweis: 'Was drückt der Satz aus: Grund, Gegensatz, Zeit, Bedingung oder Zweck?',
        runden: [
          'Ich ziehe eine Jacke an, [*weil | obwohl | damit] es kalt ist.',
          'Wir wollten grillen, [denn | *aber | wenn] es fing an zu regnen.',
          '[Obwohl | *Als | Damit] der Film zu Ende war, gingen wir nach Hause.',
          'Ich weiß nicht, [*ob | denn | aber] er morgen kommt.',
          'Sie flüstert, [weil | *damit | obwohl] das Baby nicht aufwacht.',
          '[*Obwohl | Weil | Wenn] er krank war, ging er zur Schule.',
          'Wir gehen nicht ins Schwimmbad, [*sondern | denn | oder] wir fahren an den See.',
          '[Nachdem | *Wenn | Obwohl] du Zeit hast, kannst du mir helfen.',
        ],
      },
      {
        titel: 'Sätze verbinden',
        typ: 'reihenfolge',
        anweisung: 'Bilde einen Satz. Achte darauf, wo das gebeugte Verb steht.',
        hinweis: 'Nach weil, dass, obwohl, als, während steht das Verb am Ende. Nach denn, aber steht es an zweiter Stelle.',
        runden: [
          'ich bleibe zu Hause, | weil | ich | krank | bin.',
          'Mia lernt viel, | denn | sie | schreibt | morgen | eine Arbeit.',
          'wir spielen draußen, | obwohl | es | kalt | ist.',
          'der Hund bellt, | als | der Briefträger | klingelt.',
          'ich wollte schwimmen, | aber | das Bad | war | geschlossen.',
          'Opa liest, | während | die Kinder | im Garten | spielen.',
          'Lena übt jeden Tag, | damit | sie | besser | wird.',
          'wir wissen nicht, | ob | der Zug | pünktlich | kommt.',
        ],
      },
    ],
    abschlussTitel: 'Abschluss: Konjunktionen',
    abschluss: [
      {
        typ: 'zuordnen',
        anweisung: 'Tippe die Konjunktionen an und ordne sie zu.',
        kategorien: ['nebenordnend', 'unterordnend'],
        text: 'Ich ging früh ins Bett, [denn = nebenordnend] ich war müde, [obwohl = unterordnend] es erst acht Uhr war.',
      },
      { typ: 'ueberarbeiten', text: 'Frage: Welche Konjunktionen sind unterordnend?\n*während\naber\n*dass\nund' },
      { typ: 'auswahl', anweisung: 'Wähle die Konjunktion, die passt.', text: 'Wir fahren an den See, [*wenn | obwohl | denn] die Sonne scheint.' },
      { typ: 'reihenfolge', anweisung: 'Bilde einen Satz. Achte darauf, wo das gebeugte Verb steht.', text: 'ich freue mich, | dass | du | heute | kommst.' },
    ],
  },
  // ---------------------------------------------------------------- DS04
  {
    kurz: 'ds04',
    titel: 'Die Satzreihe und ihr Komma',
    monster: 'schleim_feuer',
    kompetenzen: ['Haupt- und Nebensatz', 'Komma zwischen Sätzen'],
    erklaerung: {
      titel: 'Erklärung: Die Satzreihe und ihr Komma',
      text:
        'Ein Hauptsatz kann allein stehen. Sein gebeugtes Verb steht an zweiter Satzgliedstelle: Der Hund bellt laut.\n\n' +
        'Eine Satzreihe besteht aus zwei oder mehr Hauptsätzen. Du verbindest sie mit einem Komma oder mit einer nebenordnenden Konjunktion: Es regnet, wir bleiben drinnen.\n\n' +
        'So erkennst du einen Hauptsatz: Stelle die Satzglieder um. Das gebeugte Verb bleibt an zweiter Stelle. Jeder Hauptsatz einer Satzreihe hat sein eigenes Subjekt und sein eigenes gebeugtes Verb. Teilen sich zwei Verben ein Subjekt (Tom lacht und tanzt), ist es nur ein Hauptsatz.\n\n' +
        'Zwischen Hauptsätzen ohne Konjunktion steht ein Komma. Vor und und oder steht meist kein Komma.',
      merke: 'Bei [aber], [denn], [doch] und [sondern] muss das Komma davor wandern.',
      beispiele: ['Der Bus kam[,] wir stiegen ein.', 'Ich wollte schwimmen[,] [aber] das Wasser war zu kalt.'],
    },
    uebungen: [
      {
        titel: 'Hauptsatz oder Satzreihe?',
        typ: 'auswahl',
        anweisung: 'Ist es ein einzelner Hauptsatz oder eine Satzreihe?',
        hinweis: 'Zähle die gebeugten Verben mit eigenem Subjekt.',
        runden: [
          'Der Hund lief durch den Park. → [*Hauptsatz | Satzreihe]',
          'Die Sonne schien, die Vögel sangen. → [Hauptsatz | *Satzreihe]',
          'Tom kam nach Hause und aß sein Brot. → [*Hauptsatz | Satzreihe]',
          'Lisa wollte spielen, aber sie musste lernen. → [Hauptsatz | *Satzreihe]',
          'Am Morgen fuhren wir mit dem Rad zur Schule. → [*Hauptsatz | Satzreihe]',
          'Ich blieb zu Hause, denn ich war krank. → [Hauptsatz | *Satzreihe]',
          'Mia ärgerte sich, doch sie sagte nichts. → [Hauptsatz | *Satzreihe]',
          'Die Kinder lachten, sangen und tanzten im Garten. → [*Hauptsatz | Satzreihe]',
        ],
      },
      {
        titel: 'Komma oder kein Komma?',
        typ: 'auswahl',
        anweisung: 'Braucht der Satz an dieser Stelle ein Komma?',
        hinweis: 'Vor aber, denn, doch, sondern steht immer ein Komma. Teilen sich zwei Verben ein Subjekt, steht kein Komma.',
        runden: [
          'Der Lehrer kam herein [*Komma | kein Komma] alle wurden still.',
          'Ben wollte gewinnen [*Komma | kein Komma] aber er verlor knapp.',
          'Lea lachte [Komma | *kein Komma] und erzählte einen Witz.',
          'Wir gingen nicht ins Kino [*Komma | kein Komma] sondern wir blieben zu Hause.',
          'Der Hund schlief [*Komma | kein Komma] denn er war müde.',
          'Paul schwieg [*Komma | kein Komma] doch er dachte nach.',
          'Die Katze sprang auf den Tisch [Komma | *kein Komma] und fraß den Käse.',
          'Es klingelte [*Komma | kein Komma] die Pause war vorbei.',
        ],
      },
      {
        titel: 'Kommaregeln der Satzreihe',
        typ: 'ueberarbeiten',
        anweisung: 'Tippe die richtigen Antworten an.',
        runden: [
          'Frage: Vor welchen Konjunktionen steht immer ein Komma?\n*aber\n*denn\nund\noder',
          'Frage: Woran erkennst du einen Hauptsatz?\n*Das gebeugte Verb steht an zweiter Stelle.\nDas gebeugte Verb steht am Ende.\n*Er kann allein stehen.\nEr beginnt immer mit weil.',
          'Frage: Welche Sätze sind Satzreihen?\n*Es schneite, wir bauten einen Schneemann.\nWir bauten einen Schneemann.\n*Es schneite, doch es war nicht kalt.\nLena rannte und sprang.',
          'Frage: Welche Sätze brauchen ein Komma vor der Konjunktion?\n*Ich bin müde aber ich gehe noch raus.\n*Er kommt nicht denn er ist krank.\nSie singt und tanzt.\nDu kannst Saft oder Wasser trinken.',
          'Frage: Was gilt für „und“ zwischen zwei Hauptsätzen?\n*Meist steht kein Komma.\n*Man darf ein Komma setzen, um die Sätze deutlich zu trennen.\nEs steht immer ein Komma.\nMan darf nie ein Komma setzen.',
          'Frage: Welche Konjunktionen sind nebenordnend?\n*doch\n*sondern\nweil\nobwohl',
          'Frage: In welchen Sätzen teilen sich zwei Verben ein Subjekt?\n*Tim lacht und winkt.\nTim lacht, Mia winkt.\n*Die Kinder rennen und rufen.\nDer Bus kommt, wir steigen ein.',
          'Frage: Wie viele Hauptsätze hat der Satz „Es regnete, der Wind heulte, wir blieben drinnen.“?\n*drei\nzwei\neiner\nvier',
        ],
      },
      {
        titel: 'Satzreihen bilden',
        typ: 'reihenfolge',
        anweisung: 'Bilde eine Satzreihe. Das gebeugte Verb steht in jedem Hauptsatz an zweiter Stelle.',
        hinweis: 'Die Konjunktion zählt nicht mit. Danach kommt das Subjekt oder ein anderes Satzglied, dann das Verb.',
        runden: [
          'der Laden war geschlossen, | denn | es | war | Feiertag.',
          'wir wollten grillen, | aber | es | regnete | den ganzen Tag.',
          'Tim spielt nicht Fußball, | sondern | er | geht | schwimmen.',
          'der Wecker klingelte, | doch | niemand | stand | auf.',
          'ich mag Äpfel, | aber | ich | esse | lieber | Birnen.',
          'die Sonne ging unter, | und | es | wurde | kalt.',
          'Lena lernt Gitarre, | denn | sie | möchte | in einer Band | spielen.',
          'das Spiel war spannend, | doch | am Ende | verloren | wir.',
        ],
      },
    ],
    abschlussTitel: 'Abschluss: Satzreihe und Komma',
    abschluss: [
      { typ: 'auswahl', anweisung: 'Braucht der Satz an dieser Stelle ein Komma?', text: 'Wir wollten wandern [*Komma | kein Komma] aber es gewitterte.' },
      { typ: 'ueberarbeiten', text: 'Frage: Welche Sätze sind Satzreihen?\n*Ich lese, mein Bruder spielt.\nIch lese ein spannendes Buch.\n*Ich lese, denn ich habe Zeit.\nIch lese und lache.' },
      { typ: 'reihenfolge', anweisung: 'Bilde eine Satzreihe. Das gebeugte Verb steht an zweiter Stelle.', text: 'der Hund bellte, | aber | niemand | öffnete | die Tür.' },
    ],
  },
  // ---------------------------------------------------------------- DS05
  {
    kurz: 'ds05',
    titel: 'Das Satzgefüge und sein Komma',
    monster: 'maus',
    kompetenzen: ['Haupt- und Nebensatz', 'Nebensatzarten', 'Komma zwischen Sätzen', 'Komma bei Einschüben'],
    erklaerung: {
      titel: 'Erklärung: Das Satzgefüge und sein Komma',
      text:
        'Ein Satzgefüge besteht aus einem Hauptsatz und mindestens einem Nebensatz. Der Nebensatz kann nicht allein stehen. Er beginnt oft mit einer unterordnenden Konjunktion (weil, dass, obwohl, als, wenn …), und sein gebeugtes Verb steht am Ende.\n\n' +
        'Der Nebensatz kann wandern:\nHS, NS: Wir blieben drinnen, weil es regnete.\nNS, HS: Weil es regnete, blieben wir drinnen.\nHS, NS, HS: Wir blieben, weil es regnete, im Haus.\n\n' +
        'Satzreihe oder Satzgefüge? Suche in jedem Teilsatz das gebeugte Verb. Steht es am Ende, ist es ein Nebensatz.',
      merke: 'Zwischen Haupt- und Nebensatz steht immer ein Komma. Ein eingeschobener Nebensatz bekommt [zwei Kommas].',
      beispiele: ['[Obwohl] es kalt [war][,] gingen wir schwimmen.', 'Der Film[,] den wir gestern [sahen][,] war spannend.'],
    },
    uebungen: [
      {
        titel: 'Hauptsatz und Nebensatz erkennen',
        typ: 'zuordnen',
        anweisung: 'Tippe jeden Teilsatz an und ordne ihn zu.',
        hinweis: 'Im Nebensatz steht das gebeugte Verb am Ende.',
        kategorien: ['Hauptsatz', 'Nebensatz'],
        runden: [
          '[Als der Mond aufging, = Nebensatz] [versammelten sich die Freunde am Feuer. = Hauptsatz]',
          '[Ich wusste, = Hauptsatz] [dass du kommst. = Nebensatz]',
          '[Wir spielten drinnen, = Hauptsatz] [weil es draußen stürmte. = Nebensatz]',
          '[Obwohl Lea müde war, = Nebensatz] [las sie noch ein Kapitel. = Hauptsatz]',
          '[Tom übte jeden Tag, = Hauptsatz] [damit er beim Konzert sicher war. = Nebensatz]',
          '[Wenn es schneit, = Nebensatz] [bauen wir einen Schneemann. = Hauptsatz]',
          '[Die Kinder mussten, = Hauptsatz] [weil der Bus ausfiel, = Nebensatz] [zu Fuß gehen. = Hauptsatz]',
          '[Nachdem alle gegessen hatten, = Nebensatz] [räumten wir den Tisch ab. = Hauptsatz]',
        ],
      },
      {
        titel: 'Kommas im Satzgefüge',
        typ: 'auswahl',
        anweisung: 'Braucht der Satz an dieser Stelle ein Komma?',
        hinweis: 'Vor das Einleitewort kommt ein Komma. Nach dem Verb am Ende kommt ein Komma, wenn der Satz weitergeht.',
        runden: [
          'Ich weiß [*Komma | kein Komma] dass du recht hast.',
          'Weil es regnete [*Komma | kein Komma] blieben wir drinnen.',
          'Max erschrak [*Komma | kein Komma] als das Telefon klingelte.',
          'Wir wissen nicht [*Komma | kein Komma] ob der Ausflug stattfindet.',
          'Obwohl Lisa krank war [*Komma | kein Komma] ging sie zum Training.',
          'Tim ging [*Komma | kein Komma] nachdem alle schliefen [*Komma | kein Komma] leise hinaus.',
          'Der Hund [*Komma | kein Komma] der im Garten bellt [*Komma | kein Komma] gehört dem Nachbarn.',
          'Mia lernt [Komma | *kein Komma] fleißig für die Arbeit.',
        ],
      },
      {
        titel: 'Satzreihe oder Satzgefüge?',
        typ: 'auswahl',
        anweisung: 'Ist es eine Satzreihe oder ein Satzgefüge?',
        hinweis: 'Satzgefüge: In einem Teilsatz steht das gebeugte Verb am Ende.',
        runden: [
          'Ich lernte fleißig, denn ich wollte eine gute Note. → [*Satzreihe | Satzgefüge]',
          'Ich lernte fleißig, weil ich eine gute Note wollte. → [Satzreihe | *Satzgefüge]',
          'Die Vögel flogen auf, als die Tür knarrte. → [Satzreihe | *Satzgefüge]',
          'Die Tür knarrte, und die Vögel flogen auf. → [*Satzreihe | Satzgefüge]',
          'Obwohl es spät war, spielten wir weiter. → [Satzreihe | *Satzgefüge]',
          'Es war spät, doch wir spielten weiter. → [*Satzreihe | Satzgefüge]',
          'Ich hoffe, dass morgen die Sonne scheint. → [Satzreihe | *Satzgefüge]',
          'Die Sonne scheint, wir gehen an den See. → [*Satzreihe | Satzgefüge]',
        ],
      },
      {
        titel: 'Satzgefüge bilden',
        typ: 'reihenfolge',
        anweisung: 'Bilde ein Satzgefüge. Im Nebensatz steht das gebeugte Verb am Ende.',
        hinweis: 'Nebensatz: Konjunktion, Subjekt, …, gebeugtes Verb.',
        runden: [
          'wir blieben zu Hause, | weil | es | stark | regnete.',
          'Tom hofft, | dass | sein Team | das Spiel | gewinnt.',
          'ich rufe dich an, | wenn | ich | zu Hause | bin.',
          'Lena war glücklich, | obwohl | sie | das Rennen | verloren hatte.',
          'wir gingen schlafen, | nachdem | der Film | zu Ende | war.',
          'Paul fragt, | ob | wir | morgen | Zeit | haben.',
          'die Katze versteckt sich, | wenn | es | draußen | donnert.',
          'ich spare mein Geld, | damit | ich | ein neues Fahrrad | kaufen kann.',
        ],
      },
    ],
    abschlussTitel: 'Abschluss: Satzgefüge und Komma',
    abschluss: [
      { typ: 'auswahl', anweisung: 'Braucht der Satz an dieser Stelle ein Komma?', text: 'Als der Regen aufhörte [*Komma | kein Komma] gingen wir hinaus.' },
      {
        typ: 'zuordnen',
        anweisung: 'Tippe jeden Teilsatz an und ordne ihn zu.',
        kategorien: ['Hauptsatz', 'Nebensatz'],
        text: '[Mein Bruder freute sich, = Hauptsatz] [weil er ein Tor geschossen hatte. = Nebensatz]',
      },
      { typ: 'reihenfolge', anweisung: 'Bilde ein Satzgefüge. Im Nebensatz steht das gebeugte Verb am Ende.', text: 'ich bleibe wach, | bis | meine Eltern | nach Hause | kommen.' },
    ],
  },
  // ---------------------------------------------------------------- DS06
  {
    kurz: 'ds06',
    titel: 'Groß oder klein? Nominalisierung',
    monster: 'spinne_gruen',
    kompetenzen: ['Großschreibung'],
    erklaerung: {
      titel: 'Erklärung: Nominalisierung und Signalwörter',
      text:
        'Verben und Adjektive können als Nomen gebraucht werden. Dann schreibst du sie groß. Das nennt man Nominalisierung. Du erkennst sie an Signalwörtern davor.\n\n' +
        'Artikel: das Laufen, ein Rufen\nPräposition mit Artikel: beim Lesen, zum Schlafen, im Dunkeln\nAdjektiv: das laute Klopfen\nMengenwort: etwas Neues, nichts Gutes, viel Schönes, alles Gute\nPronomen: sein Lachen, dieses Warten\n\n' +
        'Die Probe: Setze einen Artikel und ein Adjektiv davor. Klingt der Satz richtig, ist das Wort ein Nomen: Sie liebt das Singen → das schöne Singen. Klappt die Probe nicht, bleibt das Wort klein: Sie kann singen.',
      merke: 'Steht ein Signalwort davor, wird das Verb oder Adjektiv [großgeschrieben]. Das Adjektiv vor dem Nomen bleibt klein: das [laute] [Klopfen].',
      beispiele: ['[Beim] [Lesen] vergesse ich die Zeit.', 'Ich wünsche dir [alles] [Gute].'],
    },
    uebungen: [
      {
        titel: 'Signalwort und Nominalisierung finden',
        typ: 'zuordnen',
        anweisung: 'Tippe das Signalwort und die Nominalisierung an und ordne sie zu.',
        hinweis: 'Signalwörter: Artikel, beim/zum/im, Adjektiv, etwas/nichts/viel/alles, sein/dieses.',
        kategorien: ['Signalwort', 'Nominalisierung'],
        runden: [
          '[Beim = Signalwort] [Kochen = Nominalisierung] summt Papa gern ein Lied.',
          'Wir hörten ein [lautes = Signalwort] [Klopfen = Nominalisierung] an der Tür.',
          'Im Urlaub haben wir [viel = Signalwort] [Neues = Nominalisierung] gesehen.',
          '[Sein = Signalwort] [Lachen = Nominalisierung] steckte alle an.',
          '[Im = Signalwort] [Dunkeln = Nominalisierung] sieht man die Sterne besser.',
          'Zum Geburtstag wünsche ich dir [alles = Signalwort] [Gute = Nominalisierung].',
          '[Das = Signalwort] [Warten = Nominalisierung] auf den Bus dauerte ewig.',
          'Der Brief enthielt [nichts = Signalwort] [Wichtiges = Nominalisierung].',
        ],
      },
      {
        titel: 'Groß oder klein?',
        typ: 'auswahl',
        anweisung: 'Wähle die richtige Schreibweise.',
        hinweis: 'Steht ein Signalwort davor? Klappt die Probe mit Artikel und Adjektiv?',
        runden: [
          'Nach dem [*Essen | essen] gehen wir spazieren.',
          'Wir müssen heute noch viel [Lernen | *lernen].',
          'Ich möchte etwas [*Neues | neues] ausprobieren.',
          'Zum [*Schwimmen | schwimmen] brauche ich eine Badekappe.',
          'Der Hund kann sehr schnell [Rennen | *rennen].',
          'Das [Laute | *laute] Hupen weckte die Nachbarn.',
          'Beim [*Radfahren | radfahren] trage ich immer einen Helm.',
          'Lisa hat etwas [*Besonderes | besonderes] an sich.',
        ],
      },
      {
        titel: 'Die Probe mit Artikel und Adjektiv',
        typ: 'ueberarbeiten',
        anweisung: 'Tippe die richtigen Antworten an.',
        runden: [
          'Frage: In welchen Sätzen ist „lesen“ nominalisiert (also groß zu schreiben)?\n*Beim LESEN wird mir warm.\nIch will heute LESEN.\n*Das LESEN macht mir Spaß.\nKannst du LESEN?',
          'Frage: Welche Wörter sind Signalwörter für eine Nominalisierung?\n*beim\n*etwas\nund\nweil',
          'Frage: Welche Wörter sind in „Beim Laufen hörte ich etwas Seltsames.“ nominalisiert?\n*Laufen\n*Seltsames\nhörte\nich',
          'Frage: Welches Wort in „das laute Klopfen“ bleibt klein, obwohl ein Artikel davorsteht?\n*laute\nKlopfen',
          'Frage: In welchen Sätzen ist das Wort in Großbuchstaben klein zu schreiben?\n*Wir wollen heute SPIELEN.\nNach dem SPIELEN räumen wir auf.\n*Du musst nicht WARTEN.\nDas WARTEN nervt.',
          'Frage: Welche Mengenwörter können ein Signalwort sein?\n*viel\n*nichts\n*alles\nsehr',
          'Frage: Wie lautet die Probe für eine Nominalisierung?\n*Artikel und Adjektiv davorsetzen.\nDas Wort in die Mehrzahl setzen.\nDas Wort ans Satzende stellen.',
          'Frage: In welchen Sätzen steht eine Nominalisierung?\n*Zum Schlafen ist es zu hell.\nIch kann nicht schlafen.\n*Das schnelle Fahren ist gefährlich.\nWir fahren morgen weg.',
        ],
      },
      {
        titel: 'Fehler im Tagebuch',
        typ: 'fehler',
        anweisung: 'Finde die falsch geschriebenen Wörter und schreibe sie richtig.',
        hinweis: 'Achte auf Signalwörter vor Verben und Adjektiven.',
        runden: [
          'Heute war ein langer Tag. Schon beim [aufstehen -> Aufstehen] war ich müde.',
          'Das [schlimmste -> Schlimmste] war das lange Warten auf den Bus.',
          'Mama sagt, ich soll nicht so viel [Grübeln -> grübeln].',
          'Ich will unbedingt etwas [neues -> Neues] lernen.',
          'Beim [zeichnen -> Zeichnen] werde ich immer besser.',
          'Im [dunkeln -> Dunkeln] höre ich manchmal die Eulen rufen.',
          'Zum Glück ist bisher nichts [schlimmes -> Schlimmes] passiert.',
          'Morgen wollen wir im See [Schwimmen -> schwimmen] gehen.',
        ],
      },
    ],
    abschlussTitel: 'Abschluss: Groß oder klein?',
    abschluss: [
      {
        typ: 'zuordnen',
        anweisung: 'Tippe das Signalwort und die Nominalisierung an und ordne sie zu.',
        kategorien: ['Signalwort', 'Nominalisierung'],
        text: 'Wir haben [etwas = Signalwort] [Leckeres = Nominalisierung] gekocht.',
      },
      { typ: 'auswahl', anweisung: 'Wähle die richtige Schreibweise.', text: 'Beim [*Tanzen | tanzen] vergesse ich alles um mich herum.' },
      { typ: 'ueberarbeiten', text: 'Frage: In welchen Sätzen ist „spielen“ nominalisiert (also groß zu schreiben)?\n*Nach dem SPIELEN sind wir müde.\nWir wollen SPIELEN.\n*Beim SPIELEN lachen wir viel.' },
      { typ: 'fehler', anweisung: 'Finde die falsch geschriebenen Wörter und schreibe sie richtig.', text: 'Zum [lernen -> Lernen] brauche ich Ruhe, und im [hellen -> Hellen] lese ich besser.' },
    ],
  },
  // ---------------------------------------------------------------- DS07
  {
    kurz: 'ds07',
    titel: 'Wiederholung: Zeitformen, Konjunktionen, Satzreihe, Satzgefüge, Nominalisierung',
    monster: 'gespenst',
    kompetenzen: ['Verben und Zeitformen', 'Konjunktionen', 'Haupt- und Nebensatz', 'Komma zwischen Sätzen', 'Großschreibung', 'Fehler finden und berichtigen'],
    erklaerung: {
      titel: 'Erklärung: Das Wichtigste für die Klassenarbeit',
      text:
        'Plusquamperfekt (hatte/war + Partizip II) steht für das, was vor einem vergangenen Geschehen passiert ist.\n\n' +
        'Nebenordnende Konjunktion: Verb an zweiter Stelle. Unterordnende Konjunktion: Verb am Ende.\n\n' +
        'Satzreihe = Hauptsatz + Hauptsatz. Satzgefüge = Hauptsatz + Nebensatz. Zwischen Hauptsatz und Nebensatz steht immer ein Komma.\n\n' +
        'Nominalisierung: Mit Signalwort werden Verben und Adjektive großgeschrieben.\n\n' +
        'Tipp für die Fehlersuche: Lies einen Text mehrmals und achte jedes Mal nur auf eine Sache. Erst auf die Zeitformen, dann auf die Kommas, dann auf die Großschreibung.',
      merke: 'Vier Prüffragen: [Zeitform] richtig? [Verb] an der richtigen Stelle? [Komma] gesetzt? [Groß] mit Signalwort?',
      beispiele: ['Nachdem wir [gegessen hatten], spielten wir draußen.', 'Ich bleibe drinnen[,] [weil] es regnet.', '[Beim] [Lesen] wird mir warm.'],
    },
    uebungen: [
      {
        titel: 'Präteritum oder Plusquamperfekt?',
        typ: 'lueckentext',
        anweisung: 'Setze die Verben ins Präteritum oder ins Plusquamperfekt.',
        hinweis: 'Was zuerst passiert ist, steht im Plusquamperfekt.',
        kompetenzen: ['Verben und Zeitformen'],
        runden: [
          'Nachdem Ella die Jacke [ausgezogen hatte : ausziehen], [setzte : setzen] sie sich.',
          'Als der Lehrer [zurückkam : zurückkommen], [hatten : haben] alle schon [aufgeräumt : aufräumen].',
          'Ich [wusste : wissen] nicht, wer die Tür [geöffnet hatte : öffnen].',
          'Nachdem es [geschneit hatte : schneien], [rodelten : rodeln] wir den Hügel hinunter.',
          'Als wir [ankamen : ankommen], [war : sein] der Bus schon [abgefahren : abfahren].',
          'Tim [lachte : lachen], weil er den Witz schon [gehört hatte : hören].',
          'Nachdem die Gäste [gegangen waren : gehen], [spülten : spülen] wir ab.',
          'Mara [war : sein] stolz, weil sie das Bild allein [gemalt hatte : malen].',
        ],
      },
      {
        titel: 'Nebenordnend oder unterordnend?',
        typ: 'auswahl',
        anweisung: 'Ist die Konjunktion nebenordnend oder unterordnend?',
        hinweis: 'ADUSO + doch sind nebenordnend.',
        kompetenzen: ['Konjunktionen'],
        runden: [
          'obwohl → [nebenordnend | *unterordnend]',
          'denn → [*nebenordnend | unterordnend]',
          'sondern → [*nebenordnend | unterordnend]',
          'nachdem → [nebenordnend | *unterordnend]',
          'damit → [nebenordnend | *unterordnend]',
          'oder → [*nebenordnend | unterordnend]',
          'dass → [nebenordnend | *unterordnend]',
          'doch → [*nebenordnend | unterordnend]',
        ],
      },
      {
        titel: 'Komma setzen und bestimmen',
        typ: 'auswahl',
        anweisung: 'Fehlt ein Komma? Ist es eine Satzreihe oder ein Satzgefüge?',
        hinweis: 'Suche das gebeugte Verb in jedem Teilsatz.',
        kompetenzen: ['Haupt- und Nebensatz', 'Komma zwischen Sätzen'],
        runden: [
          'Die Hunde bellten laut [*Komma | kein Komma] denn ein Fremder kam näher. → [*Satzreihe | Satzgefüge]',
          'Weil Ida helfen wollte [*Komma | kein Komma] verriet sie ihm ein Geheimnis. → [Satzreihe | *Satzgefüge]',
          'Der Trainer lachte [*Komma | kein Komma] aber seine Augen blieben ernst. → [*Satzreihe | Satzgefüge]',
          'Ich wusste [*Komma | kein Komma] dass nur du mir helfen kannst. → [Satzreihe | *Satzgefüge]',
          'Es regnete [*Komma | kein Komma] wir blieben im Zelt. → [*Satzreihe | Satzgefüge]',
          'Als die Sonne aufging [*Komma | kein Komma] wachten die Vögel auf. → [Satzreihe | *Satzgefüge]',
          'Lukas wollte mitkommen [*Komma | kein Komma] doch er durfte nicht. → [*Satzreihe | Satzgefüge]',
          'Wir warten [*Komma | kein Komma] bis der Regen aufhört. → [Satzreihe | *Satzgefüge]',
        ],
      },
      {
        titel: 'Groß oder klein?',
        typ: 'lueckentext',
        anweisung: 'Schreibe das Wort in Klammern richtig: groß oder klein?',
        hinweis: 'Steht ein Signalwort davor? Dann groß.',
        kompetenzen: ['Großschreibung'],
        runden: [
          'Oma brachte uns etwas [Warmes : warm] zu trinken.',
          'Beim [Singen : singen] im Chor wird Ben ganz still.',
          'Ich kann nicht länger [warten : warten].',
          'Das [lange : lang] Warten machte uns unruhig.',
          'Zum [Schlafen : schlafen] ist es noch zu früh.',
          'Wir haben heute nichts [Besonderes : besonders] vor.',
          'Die Kinder wollen draußen [spielen : spielen].',
          'Im [Dunkeln : dunkel] leuchten die Glühwürmchen.',
        ],
      },
      {
        titel: 'Fehler im Text berichtigen',
        typ: 'fehler',
        anweisung: 'Finde die Fehler bei Zeitformen und Großschreibung und schreibe richtig.',
        hinweis: 'Lies zweimal: erst auf die Zeitformen achten, dann auf die Großschreibung.',
        kompetenzen: ['Fehler finden und berichtigen'],
        runden: [
          'Nachdem Sina das Haus verlassen [hat -> hatte], lief sie durch den Park.',
          'Sie war müde, denn sie [hat -> hatte] kaum geschlafen.',
          'Beim [laufen -> Laufen] dachte sie an ihre Freundin.',
          'Sie war froh, weil sie die Freundin lange nicht gesehen [hat -> hatte].',
          'Das [warten -> Warten] hatte sich gelohnt.',
          'Etwas [schönes -> Schönes] hatte sie lange nicht gehört.',
          'Nachdem es dunkel geworden [ist -> war], gingen sie nach Hause.',
          'Zum [abschied -> Abschied] umarmten sie sich.',
        ],
      },
    ],
    abschlussTitel: 'Abschluss: Fit für die Klassenarbeit',
    abschluss: [
      { typ: 'auswahl', anweisung: 'Ist die Konjunktion nebenordnend oder unterordnend?', text: 'weil → [nebenordnend | *unterordnend]' },
      { typ: 'lueckentext', anweisung: 'Schreibe das Wort in Klammern richtig: groß oder klein?', text: 'Nach dem [Turnen : turnen] tranken wir Wasser.' },
      { typ: 'fehler', anweisung: 'Finde die Fehler und schreibe richtig.', text: 'Nachdem wir gegessen [haben -> hatten], gingen wir schlafen, weil wir müde [sind -> waren].' },
    ],
  },
]
