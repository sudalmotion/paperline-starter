# Paperline Starter (free)
*by Sudal Motion*

**Paper-style explainer videos from a script — made in code, no AI images.**
A free Claude Code skill + Remotion templates for faceless YouTube, Reels and Shorts.

Paste a script, ask Claude for a video, get an MP4 with paper textures, ink charts and burned-in captions. Every frame is drawn by code, so you can change any word or number and re-render.

---

## What's inside (free)

- **6 scene templates**: title, chapter, big number, bar chart, list, quote
- **Landscape (16:9) and vertical (9:16)** from the same file
- **Claude Code skill** that plans scenes from your script, writes the video file, checks it and renders it
- **Validator** that catches overflowing text and scenes that are too short for their narration
- Demo projects in landscape and vertical

## Requirements

- [Node.js](https://nodejs.org) 18 or newer
- [Claude Code](https://claude.com/claude-code) for the AI workflow (the kit also works by hand)
- Internet while rendering (fonts load from Google Fonts; Chrome Headless downloads once on the first render)
- Optional: [ffmpeg](https://ffmpeg.org) for the contact sheet (`sheet.jpg`) and -14 LUFS loudness

## Setup

**Option A — as a Claude Code skill** (from any folder):

```bash
npx skills add sudalmotion/paperline-starter
```

Then ask Claude for a video; the skill sets the project up on first use.

**Option B — get the project directly:**

```bash
npx degit sudalmotion/paperline-starter paperline-starter   # or git clone
cd paperline-starter
npm install
npm run still -- demo     # one still per scene → projects/demo/out/
npm run render -- demo    # → projects/demo/out/video.mp4
```

The official source is [github.com/sudalmotion/paperline-starter](https://github.com/sudalmotion/paperline-starter). Star it to follow new scenes.

## Make a video with Claude Code

Open Claude Code in this folder and say:

> Make a 60-second Paperline video about why concert tickets got so expensive. Vertical. Sample data is fine for now.

Claude follows `.claude/skills/paperline/SKILL.md`: plans the scenes, writes `projects/<name>/video.json`, validates, checks stills, renders.

## By hand

1. Copy `projects/demo` to `projects/my-video`, edit `video.json` (reference: `.claude/skills/paperline/reference/scenes.md`).
2. `npm run plan -- my-video --write` — scene lengths from the narration
3. `npm run validate -- my-video`
4. `npm run studio -- my-video` (live preview; restart after edits) or `npm run still -- my-video`
5. `npm run render -- my-video`

---

## Want the full kit?

**Paperline** adds everything you need for 10-minute faceless explainers:

| | Starter | Paperline |
|---|---|---|
| Title, chapter, big number, bars, list, quote | ✓ | ✓ |
| Camera moves, page transitions, paper / grid / map backgrounds | ✓ | ✓ |
| Automatic sound effects (original, royalty-free) | ✓ | ✓ |
| **Photo collages** (tape prints, torn paper, cutouts, halftone, Ken Burns) | | ✓ |
| **Maps** (highlight countries, pins, travelling routes) | | ✓ |
| **Stick figures** (6 poses, speech bubbles, signs) | | ✓ |
| **Line charts** that draw themselves | | ✓ |
| **Timelines** (horizontal + vertical) | | ✓ |
| **Documents & rubber stamps** | | ✓ |
| **Versus** comparisons | | ✓ |
| **Progress** ("32 of 45") | | ✓ |
| **AI narration in one command** (ElevenLabs, word-timed captions, scenes fit to the voice) | | ✓ |
| Voiceover + .srt import that fits the video to your voice | | ✓ |
| Background music track | | ✓ |
| Updates with new scenes | | ✓ |

→ **[Get Paperline](https://sudalmotion.netlify.app/#editions)**

## License

Free for personal and commercial videos — see `LICENSE.md`. Remotion is free for individuals and companies of up to 3 people; larger organisations need a [Remotion Company License](https://www.remotion.pro/license).
