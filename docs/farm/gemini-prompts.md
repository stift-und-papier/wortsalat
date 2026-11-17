# Prompts für Gemini: neue Farm-Grafiken (Teilaufgabe 4)

Stand 2026-11-17. Diese Grafiken gibt es in keinem gekauften Paket: Vogelhaus (5 Stufen), Windrad (4 Stufen), Glitzern (3 Bilder), Napf (leer und voll), Buch klein.

## So gehen Sie vor

1. Öffnen Sie Gemini und starten Sie für jede Grafik einen **neuen Chat**.
2. Hängen Sie zwei Bilder an (Büroklammer):
   - `assets/Sprout Lands defautlt palette.png`, die Farbpalette;
   - ein **Vorbild im Stil**, z. B. `src/grafik/brunnen.png` oder `src/grafik/deko_pilzhaus.png`. Beim Buch hängen Sie `assets/Buch.png` an.
3. Fügen Sie zuerst den **Grundblock** ein und direkt darunter den Block der Grafik.
4. Speichern Sie das Ergebnis als PNG in `assets/` (nicht ins Repo). Den Namen finden Sie über jedem Block, z. B. `assets/neu_vogelhaus.png`.
5. Danach übernehme ich: Ich verkleinere das Bild auf die echte Pixelgröße, tausche jede Farbe gegen die nächste Palettenfarbe und mache den Hintergrund durchsichtig.

**Gut zu wissen:**
- Gemini zeichnet selten genau 16 Pixel breit. Das macht nichts, solange das Bild ein klares Raster hat und jedes Feld nur Flächen ohne Verlauf zeigt.
- Statt „durchsichtig“ malt Gemini oft ein Schachbrett. Darum bittet der Prompt um einen **einfarbigen Magenta-Hintergrund** (#FF00FF), den ich sauber entfernen kann.
- Passt etwas nicht, schreiben Sie im selben Chat nach, z. B. „Make the outline darker and use fewer colours.“ oder „Keep exactly the same post in every frame.“

## Grundblock (immer zuerst einfügen)

```text
You are a pixel artist. Draw game sprites in the exact style of the attached reference sprite
(cozy top-down farming game, "Sprout Lands" style):
- true low-resolution pixel art, every pixel a clean square, no anti-aliasing, no gradients, no blur, no dithering noise
- soft, muted pastel colours; use ONLY colours from the attached palette image
- a 1-pixel outline in a darker shade of each object's own colour (never pure black)
- light comes from the top left; one lighter highlight shade and one darker shadow shade per material
- seen from the front with a slight top-down angle, like the reference
- a small soft shadow under the object in a darker grass-green is allowed
- background: one flat solid magenta colour #FF00FF everywhere outside the sprites (no checkerboard, no scenery, no text, no frame)
- all frames side by side in ONE row, equal frame size, frames separated by 4 pixels of magenta
- the object stands on the bottom edge of each frame, horizontally centred
Output one PNG image.
```

## 1. Vogelhaus, 5 Stufen

Datei: `assets/neu_vogelhaus.png`. Größe je Bild: 16 × 32 Pixel (5 Bilder nebeneinander).

```text
Sprite sheet: a wooden bird house that is being built step by step. 5 frames, each frame 16 pixels wide and 32 pixels tall.
The post is the same in every frame (same position, same height, same wood colours) so the frames line up.
Wood in warm light browns like the reference (palette browns #aa7959, #c49a6c, #dcb98a, outline #90625d).
Frame 1: only a thin wooden post standing in a little tuft of grass.
Frame 2: the same post with a small flat board nailed on top.
Frame 3: a small bird house on the board: box with a round dark entrance hole and a pitched roof in muted red-pink (#a35b70, #bd757e).
Frame 4: the same bird house with a few yellow seeds on the little ledge in front of the hole.
Frame 5: the same as frame 4 plus one small round light-blue bird (#8599c7, #99c5de) sitting on the roof.
Cute and simple, no text.
```

## 2. Windrad, 4 Stufen

Datei: `assets/neu_windrad.png`. Größe je Bild: 16 × 32 Pixel (4 Bilder nebeneinander).

```text
Sprite sheet: a small garden pinwheel windmill that is being built step by step. 4 frames, each frame 16 pixels wide and 32 pixels tall.
The wooden pole is the same in every frame (same position and height) so the frames line up.
Wood in light browns (#aa7959, #c49a6c, outline #90625d), cloth sails in soft cream (#f3e5c2) with muted blue stripes (#7180b1).
Frame 1: only a thin wooden pole in a little tuft of grass.
Frame 2: the pole with a small wooden cross-frame and a hub at the top, no sails yet.
Frame 3: the windmill with two cloth sails (one up, one down).
Frame 4: the finished windmill with four cloth sails in an X shape and a tiny pink flag (#bd757e) on a short stick at the very top.
Still image, not spinning. Cute and simple, no text.
```

## 3. Glitzern beim Wachsen, 3 Bilder

Datei: `assets/neu_glitzern.png`. Größe je Bild: 16 × 16 Pixel (3 Bilder nebeneinander, das ist eine kurze Animation).

Vorher kurz prüfen, ob die Sterne aus dem UI Pack (`special icons/stars.png`) schon passen. Dann braucht es dieses Bild nicht.

```text
Sprite sheet: a short sparkle animation that plays once when a plant grows. 3 frames, each 16 x 16 pixels.
Small four-pointed sparkles in soft yellow (#f7ebaa, #eeba77) and white (#f3f4e7), outline #d79e61, no other colours.
Frame 1: one tiny sparkle in the centre.
Frame 2: three sparkles of different sizes spread around the centre, the middle one biggest.
Frame 3: the sparkles fading: two small dots and one tiny sparkle near the edges.
Gentle and calm, not flashy. No text.
```

## 4. Napf leer und voll, 2 Bilder

Datei: `assets/neu_napf.png`. Größe je Bild: 16 × 16 Pixel (2 Bilder nebeneinander).

```text
Sprite sheet: a small round feeding bowl for chickens, seen from the front with a slight top-down angle. 2 frames, each 16 x 16 pixels.
The bowl is the same in both frames: shallow wooden bowl in light browns (#b68962, #c49a6c, #dcb98a, outline #90625d).
Frame 1: the bowl is empty, you can see the darker inside bottom.
Frame 2: the same bowl filled with a small heap of yellow grains (#eae178, #d4c169, #b09643).
No text.
```

## 5. Buch klein für den Sammelalbum-Knopf, 1 Bild

Datei: `assets/neu_buch_klein.png`. Größe: 16 × 16 Pixel. Als Vorbild `assets/Buch.png` anhängen (statt Brunnen oder Pilzhütte).

```text
Redraw the attached book picture as a tiny 16 x 16 pixel icon. Keep its shape, its brown cover colours and its look,
but simplify it so that it reads clearly at 16 x 16 pixels: closed book, seen slightly from the front,
cover in browns (#90625d, #aa7959, #c49a6c), pages in cream (#f3e5c2), 1-pixel darker brown outline.
One frame only. No text, no letters on the cover.
```

## Nachher (übernimmt Claude)

- auf die echte Größe bringen (16 × 32 bzw. 16 × 16), jede Farbe auf die Palette setzen, Magenta entfernen;
- als Stufen in `docs/farm/wachsende-deko.js` eintragen, sodass die Platzhalter in den Mockups verschwinden;
- ins Spiel (`src/grafik/` mit `LIZENZ.md`) erst bei der Umsetzung. **Offen:** Wie sollen KI-Bilder in `LIZENZ.md` und in der Namensnennung der App stehen? Das klären wir vor der Umsetzung.
