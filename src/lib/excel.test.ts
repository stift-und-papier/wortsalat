import { describe, expect, it } from 'vitest'
import { csvText } from './excel'

describe('Liste für Excel', () => {
  it('Semikolon, Anführungszeichen, Umlaute und BOM', () => {
    expect(csvText([['Name', 'Notiz'], ['Fuchs-07', 'a; "b"'], ['Bär', 3]])).toBe('﻿Name;Notiz\r\nFuchs-07;"a; ""b"""\r\nBär;3\r\n')
  })
  it('Zellen, die wie Formeln beginnen, werden Text', () => {
    expect(csvText([['--', '=SUMME(A1)', '12', 5]])).toBe('﻿ --; =SUMME(A1);12;5\r\n')
  })
})
