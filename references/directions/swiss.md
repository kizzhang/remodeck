# Direction · Swiss

**Mood**: Carbon-grid Helvetian rigor. Inter sans + JetBrains Mono. Klein blue IKB as default accent. ASCII / dot-matrix WebGL background optional (canvas.bg layer).

## Theme presets

| Preset slug | Accent | Bg | Use when |
|---|---|---|---|
| `swiss-ikb` | Klein blue #002FA7 | cream #fafaf8 | default; tech / product / serious |
| `swiss-yellow` | Field yellow #ffd000 | cream #fafaf8 | bold campaign / hi-energy |
| `swiss-sumi` | yellow on near-black | charcoal #1a1a1a | dark deck, presentations under lights |
| `swiss-walnut` | walnut #6b3a17 | cream #f5efe6 | warm humanist take, books / writing |

## Layout recipes (className configurations)

Each recipe is a CSS classname + a sketch of expected children. Apply via `<div className="lay-...">` inside a `<Slide>` body.

### `lay-swiss-hero`
- Use case: P01 cover.
- Children: `<h1 class="hero-title">`, `<p class="hero-subtitle">`, `<div class="hero-meta">`.
- Layout: 12 columns; title spans cols 2–10 at 220px font, subtitle at 28px, meta lower-left in mono.

### `lay-swiss-12col-split`
- Use case: P-mid · headline on left, content on right.
- Children: `<aside class="col-left">` (cols 1–4: kicker + headline), `<div class="col-right">` (cols 5–12: stat cards / list / image).

### `lay-swiss-3stat`
- Use case: 3 stats with click-to-reveal stages.
- Children: `<div class="stat" data-stage="1|2|3">` × 3 with `.stat-num`, `.stat-label`, `.stat-note`.

### `lay-swiss-pipeline`
- Use case: process flow / agent loop diagram.
- Children: `<div class="step" data-stage="N">` in a horizontal scroll with mono labels and connecting rules.

### `lay-swiss-quote-fullbleed`
- Use case: pull-quote slide.
- Children: `<blockquote>` cols 2–11, attribution at bottom-right in italic.

### `lay-swiss-image-split`
- Use case: image left, caption right (or reverse via `lay-swiss-image-split--rev`).
- Children: `<figure>` (cols 1–7 image, 7–12 caption).

### `lay-swiss-chapter`
- Use case: section divider.
- Children: oversized chapter number (cols 1–3), chapter title (cols 4–12), thin accent rule below.

### `lay-swiss-closing`
- Use case: P-last takeaway.
- Children: takeaway bullets centered, footer with talk metadata + accent rule.

## Recommended motion recipes

- `stagger-list` for bullet reveals (motion.div with `animate=` + `transition.delayChildren`)
- `pipeline` for left-to-right step reveals
- `counter` for numeric tickers (use motion's `useTransform` + `useSpring`)
- `fade-in-stack` for layered overlay reveals

See `references/ANIMATIONS.md` for the recipe code.

## Recommended Remotion density

**Medium**. Swiss is happy with no Remotion at all (motion handles 95% of needs). Use Remotion only for data-density frames you can't do in CSS: animated charts, multi-element choreography with timing dependencies, time-precise narrative beats. Reuse codex `A06_AlignmentFailure` pattern for "narrative inside one slide".

## Recommended slide count

15–30 slides for a 30–45 minute talk. Swiss style holds more density per slide than magazine, so fewer slides are usually OK.

## Don't

- Don't add ornament or decorative serif. Swiss = restraint.
- Don't put more than 3 semantic blocks per slide.
- Don't use accent color for body text — it's for rules + chrome + numeric highlights only.
