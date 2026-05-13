---
name: remodeck
description: |
  Build portable single-HTML talk decks with React + Vite + motion + Remotion.
  Brainstorm-driven, multi-direction (magazine / swiss / editorial-dark), user-gated:
  user picks direction → main thread brainstorms → produces per-page prose spec →
  ships 3 representative slides for user review → batch-generates remaining slides →
  visual-reviewer subagent → user authorizes bundle to single portable HTML.
---

# remodeck

A skill for building portable single-HTML talk decks. The workflow has 5 user-gated steps. Do NOT skip ahead; do NOT auto-bundle.

## The 5 steps

```
Step 0 ─ Pick direction + theme preset + bootstrap project
Step 1 ─ Brainstorm (5 questions, prose answers)
Step 2 ─ Per-page prose spec (5-line format)
Step 3 ─ Gate A: 3 representative slides, user reviews in browser
Step 4 ─ Batch-generate remaining slides → spawn visual-reviewer
Step 5 ─ Gate B: user says "bundle" → run make-single-html.mjs
```

**Two user gates** — never cross without explicit user approval:
- **Gate A** (between Step 3 and Step 4): user must approve the 3 representative slides
- **Gate B** (between Step 4 and Step 5): user must explicitly request bundle. Never auto-run.

## Step 0 · Pick direction + bootstrap

1. Ask the user to pick a direction:
   - `magazine` — 5 sub-presets (monocle / wired / kinfolk / domus / lab) — print-magazine spread feel, serif headlines
   - `swiss` — 4 presets (ikb / yellow / sumi / walnut) — Carbon grid + Klein blue, Inter + JetBrains Mono
   - `editorial-dark` — 3 presets (standard / plum / navy) — warm dark + copper rule + DM Serif Display, ideal for Remotion-heavy decks
2. Once picked, read `references/directions/<direction>.md` to confirm the preset and mood with the user.
3. Run the bootstrap below (replace `<TOPIC>` with the topic slug; `<PRESET>` with the chosen preset slug):

```bash
SKILL=~/.claude/skills/remodeck
TOPIC=<topic-slug>           # kebab-case, e.g. ai-club-talk
PRESET=<preset-slug>         # e.g. swiss-ikb or magazine-monocle
TOPIC_UP=$(echo "$TOPIC" | tr '[:lower:]-' '[:upper:]_')

npm create vite@latest $TOPIC -- --template react-ts
cd $TOPIC
mkdir -p src/{slides,animations,deck,styles} public/{images,videos} assets docs/brainstorm scripts exports qa-fixtures

# Templates with __TOPIC__ slot get sed-rewritten
sed "s/__TOPIC__/$TOPIC/g" $SKILL/templates/package.template.json > package.json
sed "s/__TOPIC__/$TOPIC/g" $SKILL/templates/index.template.html > index.html
sed "s/__TOPIC__/$TOPIC/g" $SKILL/templates/make-single-html.template.mjs > scripts/make-single-html.mjs

# Verbatim copies
cp $SKILL/templates/vite.config.template.ts vite.config.ts
cp $SKILL/templates/tsconfig.template.json tsconfig.json
cp $SKILL/templates/main.template.tsx src/main.tsx
cp $SKILL/templates/App.template.tsx src/App.tsx
cp $SKILL/templates/DeckStage.template.tsx src/deck/DeckStage.tsx
cp $SKILL/templates/Slide.template.tsx src/deck/Slide.tsx
cp $SKILL/templates/animationBus.template.ts src/deck/animationBus.ts
cp $SKILL/templates/styles.template.css src/styles/global.css
cp $SKILL/templates/_tokens/$PRESET.template.css src/styles/tokens.css

# Empty slides index — Step 3 fills it
echo "export const slides = [] as const;" > src/slides/index.ts
echo "{}" > assets/_manifest.json

npm install
npm run dev
```

Verify: open `http://localhost:5173/?slide=1` — should show a blank stage with HUD `00 / 00`. Bootstrap done; move to Step 1.

## Step 1 · Brainstorm

Read `references/BRAINSTORM.md`. Ask the 5 questions, one at a time, in main thread. **No subagent.** Output: `docs/brainstorm/<topic>-spec.md` with `## Outline` + `## Hard constraints` + `## Animation plan` + `## Style descriptor`.

## Step 2 · Per-page prose spec

Read `references/SPEC.md`. For each slide in the outline, append a 5-line prose block (文字 / 图片 / Remotion 动画 / 排版 / stages) to `docs/brainstorm/<topic>-spec.md` under `## Per-page spec`. User reviews and edits inline. **Do not pin layout coordinates here** — layout verification happens in Step 3.

## Step 3 · 3 representative slides · Gate A

Pick 3 slides from the outline that span the typology:
1. **P01 cover** — direction's headline / chrome feel
2. **A high-density mid-deck slide** — stat row, image-split, or Remotion-heavy
3. **A quote or closing slide** — quiet typography contrast

Implement these 3 only. Write them at `src/slides/P01_*.tsx`, `src/slides/P<NN>_*.tsx`, etc. Update `src/slides/index.ts` to export them.

`npm run dev` is already running. Open `?slide=1`, `?slide=2`, `?slide=3`. **Tell the user the URLs** and ask them to review.

If user wants changes: revise the prose spec AND the 3 slides. Iterate until user approves all 3.

**DO NOT proceed to Step 4 without explicit user approval.**

## Step 4 · Batch-generate remaining slides

After Gate A, build out every remaining slide from the prose spec. Each slide gets a file at `src/slides/P<NN>_<name>.tsx`. Update `src/slides/index.ts` to import and export them in order.

For animation-heavy slides, use `references/ANIMATIONS.md` to decide motion vs Remotion. If Remotion, copy a codex `A*` composition (from `/Users/kaneki/Projects/PPT/ai-club-talk codex/src/animations/`) into `src/animations/` and adapt.

After all slides exist:

1. **User reviews in browser** — they walk through all slides at `localhost:5173/?slide=1` and report issues.
2. **Spawn visual-reviewer** subagent (see `agents/visual-reviewer.md`):
   - User screenshots each slide at 1920×1080 (cmd+shift+4 area capture, or `?export=1` flag if implemented) → save to `qa-fixtures/` plus the slide files to review
   - Pass each PNG to the subagent along with the slide's prose spec, the direction file, and `_manifest.json`
3. **Apply reviewer's blocking_issues actions**, re-screenshot, re-spawn until verdict = "ship" for every slide

**DO NOT proceed to Step 5 without explicit user request to bundle.**

## Step 5 · Bundle to portable HTML · Gate B

Only after the user explicitly says "all good, bundle it" / "export the deck" / "make the single HTML":

```bash
npm run build
npm run bundle
# → exports/<topic>-single-file.html
```

Confirm file size + asset count to user. Done.

## Scope cutoff (this skill vs others)

| Want | Use |
|---|---|
| Brainstorm-driven multi-direction talk deck with motion + Remotion + single HTML | **remodeck** (this skill) |
| Whisper-aligned narrated MP4 with pixel-diff | → `narrated-deck` |
| Just an MP4 export from one composition | → `npx remotion render` directly |
| One self-contained Remotion animation (no deck) | → `remotion-best-practices` |
| Static HTML / no React | → `guizang-ppt` / `html-ppt-*` |
| Poster / single graphic | → `image-poster` / `magazine-poster` |

## Knowledge base

- `references/BRAINSTORM.md` — Step 1 question template + outline arc
- `references/SPEC.md` — per-page prose format + 10 page-type examples
- `references/ARCHITECTURE.md` — Slide props, DeckStage, animationBus, URL routing
- `references/ANIMATIONS.md` — motion recipes + Remotion decision tree + codex A* reuse
- `references/ASSETS.md` — Vertex AI Imagen + splash + lightweight manifest
- `references/directions/magazine.md` — 5 sub-presets, 8 layout recipes, low Remotion density
- `references/directions/swiss.md` — 4 presets, 8 layout recipes, medium Remotion density
- `references/directions/editorial-dark.md` — 3 presets, 8 layout recipes, high Remotion density
- `agents/visual-reviewer.md` — 6-axis pair-scoring (run at end of Step 4 only)
- `templates/` — Vite + React + Remotion scaffold the bootstrap copies into the user's project
