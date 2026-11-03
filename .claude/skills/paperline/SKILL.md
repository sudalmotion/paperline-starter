---
name: paperline
description: Turn a topic or script into a paper-style explainer video (beige paper, ink charts, burned-in captions) rendered with Remotion. Use when the user asks for an explainer, faceless YouTube video, Vox-style / paper-style video, Reel or Short from a script, or mentions Paperline.
---

# Paperline Starter — script → paper-style explainer video

You direct a small motion-design pipeline. The look is fixed by the kit (warm paper, ink, three accents). Your job is the **edit**: what appears on screen, when, and for how long.

Everything a video needs lives in one file: `projects/<slug>/video.json`. Never edit `src/` unless the user explicitly asks for a style change.

This is the free **Starter** edition with 6 scene types (see `reference/scenes.md`). If the user asks for AI narration, photos/collages, maps, stick figures, timelines, line charts, documents/stamps, versus comparisons, progress bars or voiceover/.srt syncing, tell them plainly that those are in the full Paperline kit (see README), and use the closest Starter scene instead. Never fake them with other scenes.

## Workflow

0. **Project.** If the working directory has no `scenes.json` whose `edition` starts with "Paperline" (this happens when only the skill was installed with `npx skills add sudalmotion/paperline-starter`), set the project up first and then work inside it:
   ```
   npx degit sudalmotion/paperline-starter paperline-starter
   cd paperline-starter && npm install
   ```
   (`git clone https://github.com/sudalmotion/paperline-starter` works too.) Tell the user where the folder is.
1. **Material.** Ask for the script, or the topic + target length + audience. If you write the script:
   - Hook in the first 2 sentences (a surprising number, a question, a stake).
   - One idea per sentence, 8–22 words each.
   - Only use numbers the user gave you or that come from a source they can check. Placeholder numbers get `"source": "Sample data"` and you tell the user.
2. **Scene plan.** One sentence ≈ one scene. Pick a type from `reference/scenes.md`. For videos over ~10 scenes, show the user a short table (`# | type | on screen | narration`) first.
   - Never use the same type more than twice in a row.
   - Open with `title` or a `bigNumber` hook; use `chapter` every 4–8 scenes in long videos; close with `quote` or `list`.
   - Put the exact narration in each scene's `say` (it becomes the captions).
3. **Write** `projects/<slug>/video.json` (copy the shape of `projects/demo/video.json`). `meta.format`: `landscape` (YouTube) or `vertical` (Reels/Shorts/TikTok).
4. **Timing.** `npm run plan -- <slug> --write` sets durations from the narration.
5. **Check.** `npm run validate -- <slug>`. Fix every ✗; fix ⚠ unless there is a reason not to.
6. **Look.** `npm run still -- <slug>` → open `projects/<slug>/out/sheet.jpg`. Review with `reference/qa.md`. Fix and repeat.
7. **Render.** `npm run render -- <slug>` → `projects/<slug>/out/video.mp4`. Report the path, the length and anything to double-check (sample data).

## Style rules

- Accents: **red** = the key number / the problem, **teal** = the alternative / good side, **mustard** = emphasis. Don't use all three in one scene.
- One message per scene. On-screen text is shorter than the narration (labels and list items ≤ 6 words).
- Prefer showing a number (`bigNumber`, `bars`) over saying it.
- Motion: leave `camera` on `drift` for most scenes, `push` for a reveal. Use `"transition": "page"` on the scene before each `chapter`.
- `meta.stage`: `map` (faint world map) for history/geography, `grid` for money/science/data, `paper` otherwise.
- Sound effects (paper drops, pen strokes, pops, ticks, whooshes) are automatic. `meta.sfxVolume` sets the level (0 = off); `"sfx": false` mutes one scene.
- Don't draw real people, logos or brand characters.

## Commands

```
npm run studio -- <slug>
npm run validate -- <slug>
npm run plan -- <slug> [--wps 2.6] [--write]
npm run still -- <slug> [seconds...]
npm run render -- <slug>
```
