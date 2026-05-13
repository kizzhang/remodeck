# Direction · Magazine

**Mood**: Print-magazine spread translated to slide. Serif display headlines, sans body, mono metadata, generous gutters, full-bleed splash, horizontal turn-the-page feel. Five sub-directions cover the genre.

## Sub-direction presets

| Preset slug | Reference | Accent | Bg | Vibe |
|---|---|---|---|---|
| `magazine-monocle` | Monocle / Tiempos | signature red #b8302a | warm beige #f3eee5 | refined / lifestyle / global |
| `magazine-wired` | WIRED / Big Bold | bright red #d4061b | off-cream #f7f6f0 | tech / forceful / culture |
| `magazine-kinfolk` | Kinfolk / Cereal | sage #6e8268 | soft cream #f5f1e8 | quiet / craft / story |
| `magazine-domus` | Domus / IL | arch red #a01818 | industrial gray #ececea | architecture / design / serious |
| `magazine-lab` | Nature / Aeon Lab | cobalt #1a3a8a | cool gray #ecedef | research / scholarly / data |

## Shared layout recipes

### `lay-mag-cover`
- Use case: P01 cover.
- Children: large serif title spanning cols 2–11 at 200–260px, subtitle in italic serif, mono masthead at top, mono issue/date footer.

### `lay-mag-spread`
- Use case: 2-page magazine spread feel — image left, copy right.
- Children: `<figure>` cols 1–6 (image with thin rule), `<article>` cols 7–12 (kicker + headline + body paragraphs).

### `lay-mag-pullquote`
- Use case: pull quote with attribution.
- Children: oversized opening glyph, blockquote serif italic 90px+, attribution mono.

### `lay-mag-3up`
- Use case: 3 items side-by-side (people / stats / cards) with click-to-reveal stages.
- Children: 3-column grid with rules between, each col has `data-stage="N"`.

### `lay-mag-fullbleed-image`
- Use case: cover-style image takeover with text overlay.
- Children: `<figure>` filling slide, title overlaid bottom-left in serif white with subtle backdrop blur, mono caption.

### `lay-mag-list-numbered`
- Use case: numbered list of items (manifesto-style).
- Children: each item shows oversized index number in accent + serif item title + sans body.

### `lay-mag-chapter`
- Use case: section divider with chapter number.
- Children: chapter number (huge serif), chapter title beneath, thin accent rule below.

### `lay-mag-mini-feature`
- Use case: micro-essay format with sidebar.
- Children: main body cols 2–8 (serif drop-cap intro + sans body), sidebar cols 9–11 (mono pull-data + small chart).

### `lay-mag-closing`
- Use case: takeaway / colophon.
- Children: takeaway serif centered, colophon mono with credits + url.

## Recommended motion recipes

- `stagger-list` for bullet reveals
- `fade-in-stack` for spread reveals (image then text or vice versa)
- `pipeline` rare — magazine doesn't usually use linear flow diagrams

## Recommended Remotion density

**Low**. Magazine identity is print-static; Remotion breaks the spell. Use motion-only for entry/exit and `data-stage` reveals. If you absolutely need an animated narrative, use a small Remotion player in a sidebar slot, not full-bleed.

## Recommended slide count

20–35 slides for a 30–45 minute talk. Magazine pacing is slower per slide (full spreads take time to read), but per-slide info density is moderate.

## Don't

- Don't mix sub-directions in one deck. Pick one at Step 0 and stay.
- Don't use saturated accent for body or large fills; it's for marks and small rules.
- Don't use modern san-serif-only typography; magazine = serif headline.
