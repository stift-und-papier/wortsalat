// Listen für Excel speichern (Jazz 2026-11-15): CSV-Datei, die Excel per Doppelklick richtig öffnet
// (UTF-8 mit BOM für die Umlaute, Semikolon als Trenner wie im deutschen Excel). Keine Bibliothek nötig.

/** Zeilen → CSV-Text. Felder mit ; " oder Zeilenumbruch kommen in Anführungszeichen. */
export function csvText(zeilen: (string | number)[][]): string {
  const feld = (v: string | number) => {
    // Beginnt eine Zelle mit = + - @, liest Excel sie als Formel (Lernstand „--“, aber auch absichtlich eingeschleuste Formeln):
    // ein Leerzeichen davor macht sie zu Text
    const s = typeof v === 'string' && /^[=+@-]/.test(v) ? ` ${v}` : String(v)
    return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return '﻿' + zeilen.map((z) => z.map(feld).join(';')).join('\r\n') + '\r\n'
}

/** Datei herunterladen (Name ohne Endung; Sonderzeichen werden ersetzt) */
export function csvSpeichern(name: string, zeilen: (string | number)[][]) {
  const url = URL.createObjectURL(new Blob([csvText(zeilen)], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `${name.replace(/[\\/:*?"<>|]+/g, '-').trim()}.csv`
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * Sichtbare Tabelle → Zeilen. Knöpfe nur fürs Bildschirm (.lk-nicht-drucken) und Spalten ohne Überschrift
 * (z. B. „Löschen“) bleiben weg.
 */
export function tabelleZeilen(tabelle: HTMLTableElement): string[][] {
  const text = (zelle: Element) => {
    const kopie = zelle.cloneNode(true) as Element
    kopie.querySelectorAll('.lk-nicht-drucken, .lk-unsichtbar, [aria-hidden="true"]').forEach((e) => e.remove())
    return (kopie.textContent ?? '').replace(/\s+/g, ' ').trim()
  }
  const zeilen = [...tabelle.rows].map((r) => [...r.cells].map(text))
  const leer = zeilen[0]?.flatMap((z, i) => (z === '' ? [i] : [])) ?? []
  return zeilen.map((z) => z.filter((_, i) => !leer.includes(i)))
}
