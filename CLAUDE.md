# Paperline kit

This folder makes paper-style explainer videos with Remotion. For any video request, follow the `paperline` skill in `.claude/skills/paperline/SKILL.md`.

- One video = one folder in `projects/<slug>/` with a `video.json`. Rendered files go to `projects/<slug>/out/`.
- Do not change `src/` (the look and the scenes) unless the user asks for a new scene type or a style change.
- Ask before using paid services (e.g. AI voice APIs) and never write API keys into files.
