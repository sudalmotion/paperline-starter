# QA checklist (run on `out/sheet.jpg` and suspicious single stills)

Write problems as "scene N: what is wrong → fix", fix them in `video.json`, re-run `npm run still`.

**Readability**
- [ ] Every headline and label is fully visible (no clipping at card or frame edges).
- [ ] No text overlaps another element (stamps over headings, bubbles off-screen, timeline labels touching).
- [ ] Captions sit on one or two lines and never cover the main visual.
- [ ] Vertical videos: nothing important in the bottom 22% or top 8% (app UI covers it).

**Editing**
- [ ] No more than two scenes of the same type in a row.
- [ ] Each scene shows one message; on-screen text is shorter than the narration.
- [ ] The key number of the video appears as a `bigNumber`, `bars`, `line` or `progress` scene.
- [ ] Chapter cards break long videos into 4–8 scene blocks.

**Timing**
- [ ] `npm run validate` shows no "narration needs ~Xs" warnings (or they are intentional).
- [ ] No scene longer than ~8 s without something new appearing (split long scenes).
- [ ] With a voiceover: the last caption ends before the video does.

**Honesty**
- [ ] Every number comes from the user or a checkable source; placeholders are labelled "Sample data".
- [ ] No real people, logos, brand characters or app screenshots are drawn.
