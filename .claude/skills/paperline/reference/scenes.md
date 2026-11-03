# Scene catalog (Starter)

Every scene has `type`, `duration` (seconds) and optional `say` (narration), `badge` (top-left date/label, e.g. `"1987"`), `source` (bottom-left note).

Every scene also takes:
- `camera`: `drift` (default — slow push with a slight slide), `push`, `pull`, `pan-left`, `pan-right`, `still`
- `transition` (how the scene leaves): `slide` (default), `page` (a sheet of paper sweeps across — use at chapter breaks), `fade`
- `sfx: false` mutes that scene's sound effects (paper drops, pen strokes, stamps, pops, ticks and whooshes are placed automatically on every animation)

Video-wide in `meta`: `stage` = `paper` (default) / `grid` (graph paper) / `map` (faint world map behind everything), `transition` = the default exit for all scenes, `sfxVolume` = sound effects level 0–1 (default 0.6, or 0.45 with a voiceover; 0 = off).

Character limits are where text still fits comfortably at 1080p. `npm run validate` warns when you go over.

---

## title — opening / section headline
Big serif headline, small kicker above, hand-drawn underline under one word.
```json
{ "type": "title", "duration": 4, "kicker": "Explained", "title": "Why rent never goes down", "underline": "never", "accent": "mustard" }
```
- `title` ≤ 60 chars. `underline` must be a word inside `title`.

## chapter — divider card
```json
{ "type": "chapter", "duration": 3, "number": 2, "title": "The landlord's side" }
```
- `title` ≤ 34 chars. Use every 4–8 scenes in videos over ~3 minutes.

## bigNumber — one striking figure that counts up
```json
{ "type": "bigNumber", "duration": 4, "value": 2.4, "decimals": 1, "prefix": "$", "suffix": "T", "label": "Global household debt added in 2025", "accent": "red" }
```
- `label` ≤ 70 chars. Best hook scene after `title`.

## bars — compare up to 7 values
```json
{ "type": "bars", "duration": 5, "title": "Monthly rent, 1-bed", "prefix": "$", "items": [
  { "label": "New York", "value": 3900, "highlight": true },
  { "label": "Chicago", "value": 2100 },
  { "label": "Houston", "value": 1400 } ] }
```
- `highlight` the bar the narration is about (turns red). `unit` goes after the value (`"%"`, `"M"`).

## list — steps, reasons, tips
```json
{ "type": "list", "duration": 5, "title": "3 things that lower rent", "style": "number", "items": ["More supply", "Remote work", "Rent caps"] }
```
- `style`: `check` (good things), `cross` (mistakes/myths), `number` (steps). ≤ 6 items, ≤ 42 chars each.

## quote — a line worth pausing on
```json
{ "type": "quote", "duration": 4.5, "quote": "Housing is the one market everyone is forced to buy.", "author": "Economist, 2024" }
```
- ≤ 140 chars. Good closer.
