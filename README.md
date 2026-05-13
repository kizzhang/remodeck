# remodeck

Claude Code skill for building portable single-HTML talk decks with React + Vite + motion + Remotion. Brainstorm-driven, multi-direction (magazine / swiss / editorial-dark), user-gated.

## Install

```bash
# one-time: symlink the skill into Claude Code's skill directory
ln -snf "$(pwd)" ~/.claude/skills/remodeck
```

## Use

Invoke `Skill remodeck` from inside Claude Code and follow the prompts. The skill walks you through 5 steps:

1. Pick a direction (magazine / swiss / editorial-dark) + theme preset, then bootstrap a Vite project from `templates/`.
2. Brainstorm the talk (topic, audience, narrative arc, Remotion-animation plan).
3. Write per-page prose spec (5-line format per page) into `docs/brainstorm/<topic>-spec.md`.
4. Generate 3 representative slides → user reviews layout/animation in dev server → iterate.
5. Generate remaining slides → run visual-reviewer subagent → user approves → bundle to portable single HTML.

See `SKILL.md` for the full workflow contract and `references/` for the knowledge base.

## Layout

```
SKILL.md                       # 5-step orchestrator (~6KB)
agents/visual-reviewer.md      # only subagent
references/                    # knowledge base (BRAINSTORM / SPEC / ARCHITECTURE / ANIMATIONS / ASSETS + directions/)
templates/                     # files the bootstrap step copies into a fresh Vite project
docs/                          # design specs + implementation plans (this repo's own docs)
```

## Verified pipeline

End-to-end smoke test (2026-05-13): scaffold a Vite project from `templates/` via the SKILL.md Step 0 script, drop a single `Slide`-wrapped page, `npm install && npm run build && npm run bundle` → produces a self-contained `exports/<topic>-single-file.html` (264 KB for one-slide minimum, with the Remotion `staticFile` shim + `window.__REMODECK_ASSETS__` map inlined at the top of the document).

## License

MIT.
