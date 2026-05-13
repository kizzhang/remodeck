# References · Assets

## Asset sources

Three ways to bring imagery in:

1. **AI-generated** via Vertex AI Imagen (e.g. `imagen-3.0-fast-generate-001`)
2. **Splash URL** from unsplash / your own host (downloaded to `public/images/` for bundling)
3. **Local file** in `public/images/` or `public/videos/`

All three live in `public/<images|videos>/` and are referenced from slides with relative paths like `/images/P15-hero.jpg`. The build step rewrites these to `./images/P15-hero.jpg` and the bundler base64-inlines them.

## Naming convention

```
public/images/<PNN>-<semantic>.<ext>
public/videos/<PNN>-<semantic>.<ext>
```

Examples:
- `public/images/P05-hinton-portrait.jpg`
- `public/images/P11-agent-loop-bg.png`
- `public/videos/P22-demo-clip.mp4`

Page-keyed names make audit / replace trivial.

## Lightweight manifest

Maintain `assets/_manifest.json` as a flat list of {filename, source, prompt?}:

```json
{
  "images/P05-hinton-portrait.jpg": {
    "source": "splash",
    "url": "https://example.com/hinton.jpg",
    "license": "fair use / cite original"
  },
  "images/P15-instruction-email.png": {
    "source": "ai-generated",
    "model": "imagen-3.0-fast-generate-001",
    "prompt": "minimal email client interface on warm dark background, paper-magazine texture, no UI gloss, editorial photography mood",
    "generated_at": "2026-05-13"
  },
  "images/P22-stat-card-bg.jpg": {
    "source": "local",
    "note": "company-internal photo, do not redistribute"
  }
}
```

**Not enforced at runtime** (no ajv schema, no manifest-asserter). Human-audited. The visual-reviewer subagent verifies the manifest exists and a manifest entry matches each `<img src=>` reference.

## Vertex AI Imagen prompt template

Use this scaffold; fill the SLOTS:

```
<SUBJECT> · <COMPOSITION>, <STYLE DESCRIPTOR FROM SPEC>, <LIGHTING>, <MOOD>, no <ANTI-PATTERN>
```

Concrete:

```
A worn black-and-white photograph of a young scientist seated at a 1980s CRT terminal, three-quarter view, soft window light, contemplative, no AI sloppy detail, no oversaturation, no plastic skin
```

The "STYLE DESCRIPTOR" is the one-line phrase the brainstorm captured in Step 1 question 5 (e.g. "warm editorial paper texture, serif typography mood, generous negative space, no stock-photo gloss"). Inject it into every prompt — this is what keeps multi-image decks visually consistent.

## Vertex AI Imagen call (Step 0 should set env vars)

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa-key.json
export GOOGLE_CLOUD_PROJECT=<your-project>
export GOOGLE_CLOUD_LOCATION=us-central1
```

Generation snippet (Node, called from the user's project — not the skill repo):

```js
import { VertexAI } from "@google-cloud/vertexai";
const vertex = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: process.env.GOOGLE_CLOUD_LOCATION,
});
const model = vertex.getGenerativeModel({ model: "imagen-3.0-fast-generate-001" });
const result = await model.generateImages({
  prompt: PROMPT,
  numberOfImages: 1,
  aspectRatio: "16:9", // or "3:2", "4:5", "1:1"
});
// result.images[0].bytesBase64 → save to public/images/<PNN>-<semantic>.png
```

(Not committed as a script in templates/ — it's a one-shot in the user's project, the user runs it directly when needed.)

## Splash URL fetch

For unsplash / other public URLs:

```bash
curl -L -o public/images/P05-hinton-portrait.jpg "<URL>"
```

Then add to `_manifest.json`. Always download — referencing live URLs in slides means the bundled single HTML breaks offline.

## Sizing & aspect

| Slot | Aspect | Min resolution |
|---|---|---|
| Hero / full-bleed | 16:9 | 1920×1080 |
| Half-slide | 4:5 portrait or 3:2 landscape | 1200×1500 / 1500×1000 |
| Sidebar / thumbnail | 1:1 or 4:5 | 800×800 |
| Quote backdrop | 16:9 | 1920×1080 |

**Don't crop subjects**. Use `objectFit: "contain"` for portraits; `cover` only for textural backdrops.

## Anti-patterns

- Live-URL references in slides (breaks offline single-HTML)
- Cropping faces / focal subjects to fit a layout slot
- Stock-photo "diverse-people-around-laptop" cliché
- Generic AI gradients with no subject
- Emoji as icon (the visual-reviewer rejects this on axis F)
