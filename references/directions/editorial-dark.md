# Direction · Editorial-dark

**Mood**: Aeon / Slate / NYT Magazine dark. Warm umber or sunken plum background, copper or brass rule, DM Serif Display headline, Inter body. Built for Remotion-heavy decks where the dark canvas yields visual focus to A* compositions.

## Theme presets

| Preset slug | Bg | Accent | Use when |
|---|---|---|---|
| `editorial-dark-standard` | warm umber #1a1410 | copper #b97a48 | default; story / longform / interview-style talk |
| `editorial-dark-plum` | aubergine #1c1320 | brass #c8a14a | atmospheric / reflective talks |
| `editorial-dark-navy` | midnight #0e1624 | brass #c8a14a | data + atmosphere mix; later-night talks |

## Layout recipes

### `lay-edark-cover`
- Use case: P01 cover with oversized serif title.
- Children: chrome (top-left mono kicker), `<h1 class="cover-title">` (DM Serif Display 260px), thin copper rule under title, mono meta footer.

### `lay-edark-fullbleed-anim`
- Use case: Remotion-driven slide (e.g. P15 alignment-failure).
- Children: top-quarter chrome with mono kicker + serif headline; bottom three-quarters dedicated to `<RemotionPlayer>` composition or full-bleed motion canvas.

### `lay-edark-quote`
- Use case: pull quote, large serif italic.
- Children: oversized opening glyph, blockquote in italic serif spanning cols 2–11, mono attribution lower-right.

### `lay-edark-stat-row`
- Use case: 2–3 large stats with click-to-reveal.
- Children: row of large stat numbers (DM Serif Display) with mono labels beneath, copper rules between.

### `lay-edark-chapter`
- Use case: section divider.
- Children: oversized chapter number in copper, serif chapter title in ink, thin copper rule above.

### `lay-edark-pipeline-anim`
- Use case: timeline with Remotion-driven beats.
- Children: vertical or horizontal step layout, each step contains a small Remotion composition or animated SVG.

### `lay-edark-imagery`
- Use case: AI-generated or splash full-bleed image with text overlay.
- Children: `<figure class="hero-image">` (entire slide bg with darken mask), text block bottom-left.

### `lay-edark-closing`
- Use case: takeaway with mono signature.
- Children: serif takeaway centered, mono signature + url + accent rule at footer.

## Recommended motion recipes

- `fade-in-stack` for layered chrome reveals
- `counter` for stat tickers
- Plus Remotion for narrative beats — this direction is where A* shines.

## Recommended Remotion density

**High**. This direction's identity comes from intercutting one or two Remotion narratives (~12–15s each) into the deck. Copy `A06_AlignmentFailure` from codex as a starter and adapt. See `references/ANIMATIONS.md` for the Remotion-vs-motion decision tree.

## Recommended slide count

10–20 slides. Editorial-dark prefers fewer, more atmospheric slides.

## Don't

- Don't use saturated brand colors; copper/brass is your only accent.
- Don't add multiple serif fonts; just one.
- Don't make the dark bg pure black — warm umber feels print-grade, pure black feels Powerpoint.
