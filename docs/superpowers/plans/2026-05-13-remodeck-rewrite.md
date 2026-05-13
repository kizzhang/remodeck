# Remodeck Skill Rewrite — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing `~/.claude/skills/remodeck/` with a leaner, multi-direction, brainstorm-driven PPT-generation skill that produces a portable single-HTML talk deck via React + Vite + motion + Remotion.

**Architecture:** The skill source lives in this repo (`/Users/kaneki/Projects/PPT/Skills/`, remote `github.com/kizzhang/remodeck`). The repo root mirrors `~/.claude/skills/remodeck/` directly — `SKILL.md` orchestrates, `agents/` holds the one subagent (visual-reviewer), `references/` holds long-form knowledge (BRAINSTORM, SPEC, ARCHITECTURE, ANIMATIONS, ASSETS) and the 3 direction docs (magazine / swiss / editorial-dark), `templates/` holds the React/Vite/Remotion files plus 12 token CSS presets the bootstrap step copies into a fresh project. After Task 19, the repo is installed at `~/.claude/skills/remodeck/` via symlink so edits are live.

**Tech Stack:** Markdown (skill content), TSX/TS (templates targeting React 18 + Vite 5 + Remotion 4.0.260 + motion 11 + @remotion/google-fonts), Node mjs (single-file bundler), CSS custom properties (12 token presets across 3 directions).

---

## File structure

Pre-existing in repo:
- `docs/superpowers/specs/2026-05-13-remodeck-rewrite-design.md` (committed in root commit `fd6154b`)

Files this plan creates (all paths relative to repo root):

```
.gitignore
README.md
SKILL.md
agents/
  visual-reviewer.md
references/
  BRAINSTORM.md
  SPEC.md
  ARCHITECTURE.md
  ANIMATIONS.md
  ASSETS.md
  directions/
    magazine.md
    swiss.md
    editorial-dark.md
templates/
  package.template.json
  vite.config.template.ts
  tsconfig.template.json
  index.template.html
  main.template.tsx
  App.template.tsx
  DeckStage.template.tsx
  Slide.template.tsx
  animationBus.template.ts
  styles.template.css
  make-single-html.template.mjs
  _tokens/
    magazine-monocle.template.css
    magazine-wired.template.css
    magazine-kinfolk.template.css
    magazine-domus.template.css
    magazine-lab.template.css
    swiss-ikb.template.css
    swiss-yellow.template.css
    swiss-sumi.template.css
    swiss-walnut.template.css
    editorial-dark-standard.template.css
    editorial-dark-plum.template.css
    editorial-dark-navy.template.css
docs/superpowers/plans/2026-05-13-remodeck-rewrite.md   ← this file
```

Files this plan modifies: none (this is a greenfield skill rewrite; the existing `~/.claude/skills/remodeck/` will be replaced wholesale in Task 19 after a one-time backup).

**Each file has one job:**
- `SKILL.md` orchestrates the 5-step workflow; it points to references for detail rather than inlining
- Each `references/<TOPIC>.md` is a self-contained knowledge base for one topic
- Each `references/directions/<NAME>.md` declares the design DNA + layout recipes for one direction
- Each `templates/*` file is a copy-target that lands in the user's fresh Vite project at a fixed path
- Each `templates/_tokens/<preset>.template.css` is the `:root` block for one theme preset within one direction
- `agents/visual-reviewer.md` is the only subagent; it runs at end of Step 4 only

---

## Conventions used in this plan

- **"Repo root"** = `/Users/kaneki/Projects/PPT/Skills/`
- **"Codex"** = `/Users/kaneki/Projects/PPT/ai-club-talk codex/` (template source for templates/*)
- **"Swiss pitch"** = `/Users/kaneki/Projects/PPT/ai-productivity-pitch-swiss/index.html` (token source for swiss direction)
- **`<TOPIC>` slot** in templates = literal string `__TOPIC__` (engineer-time placeholder the bootstrap script replaces with the actual deck name)
- **Verify step pattern** for TSX templates: `npx -y typescript@5.6.3 --noEmit --jsx react-jsx --module esnext --moduleResolution bundler --target es2020 --strict --skipLibCheck templates/<file>.tsx` (skipLibCheck because templates reference React types not installed in the skill repo)
- **Commit per task** after verification passes

---

## Phase 1 · Repo scaffolding

### Task 1: Add `.gitignore` and `README.md`

**Files:**
- Create: `.gitignore`
- Create: `README.md`

- [ ] **Step 1.1: Create `.gitignore`**

Write to `.gitignore`:

```
# macOS
.DS_Store

# editors
.idea/
.vscode/
*.swp

# node (in case engineer scaffolds a test project inside repo)
node_modules/
dist/
exports/

# claude
.claude/
```

- [ ] **Step 1.2: Create `README.md`**

Write to `README.md`:

```markdown
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

## License

MIT.
```

- [ ] **Step 1.3: Verify the files exist and are nonempty**

Run: `wc -l .gitignore README.md`
Expected: both > 0 lines.

- [ ] **Step 1.4: Commit**

```bash
git add .gitignore README.md
git commit -m "scaffold: add .gitignore and README"
```

---

## Phase 2 · Templates copied from codex

Tasks 2–10 each create one file in `templates/`. Each template is a copy of the corresponding codex file with `ai-club-talk`-specific strings replaced by the `__TOPIC__` slot or by direction-driven CSS variables.

### Task 2: `templates/package.template.json`

**Files:**
- Create: `templates/package.template.json`

- [ ] **Step 2.1: Write the package template**

Write to `templates/package.template.json`:

```json
{
  "name": "__TOPIC__",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "bundle": "node scripts/make-single-html.mjs"
  },
  "dependencies": {
    "@remotion/google-fonts": "^4.0.260",
    "@remotion/player": "^4.0.260",
    "motion": "^11.13.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "remotion": "^4.0.260"
  },
  "devDependencies": {
    "@types/node": "^25.6.0",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.6.3",
    "vite": "^5.4.11"
  }
}
```

- [ ] **Step 2.2: Verify it parses as JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('templates/package.template.json'))" && echo OK`
Expected: `OK`

- [ ] **Step 2.3: Commit**

```bash
git add templates/package.template.json
git commit -m "templates: add package.template.json (react/vite/remotion/motion deps from codex)"
```

### Task 3: `templates/vite.config.template.ts`

**Files:**
- Create: `templates/vite.config.template.ts`

- [ ] **Step 3.1: Write the vite config**

Write to `templates/vite.config.template.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    target: "es2020",
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
});
```

The `base: "./"` is critical: it makes the built `index.html` reference assets with relative paths, which `make-single-html.mjs` then rewrites to base64.

- [ ] **Step 3.2: Verify it parses**

Run: `node -e "(async () => { const m = await import('typescript'); m.default.transpileModule(require('fs').readFileSync('templates/vite.config.template.ts','utf8'), {compilerOptions:{module:'esnext',target:'es2020'}}); console.log('OK'); })()"` (if `typescript` is not globally installed, run `npx -p typescript@5.6.3 tsc --noEmit templates/vite.config.template.ts --module esnext --target es2020 --moduleResolution bundler --skipLibCheck` instead).
Expected: `OK` (or no errors).

- [ ] **Step 3.3: Commit**

```bash
git add templates/vite.config.template.ts
git commit -m "templates: add vite.config.template.ts"
```

### Task 4: `templates/tsconfig.template.json`

**Files:**
- Create: `templates/tsconfig.template.json`

- [ ] **Step 4.1: Write the tsconfig**

Write to `templates/tsconfig.template.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

- [ ] **Step 4.2: Verify JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('templates/tsconfig.template.json'))" && echo OK`
Expected: `OK`

- [ ] **Step 4.3: Commit**

```bash
git add templates/tsconfig.template.json
git commit -m "templates: add tsconfig.template.json"
```

### Task 5: `templates/index.template.html`

**Files:**
- Create: `templates/index.template.html`

- [ ] **Step 5.1: Write the html shell**

Write to `templates/index.template.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>__TOPIC__</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5.2: Commit**

```bash
git add templates/index.template.html
git commit -m "templates: add index.template.html shell"
```

### Task 6: `templates/main.template.tsx`

**Files:**
- Create: `templates/main.template.tsx`

- [ ] **Step 6.1: Write the React entry point**

Write to `templates/main.template.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tokens.css";
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 6.2: Commit**

```bash
git add templates/main.template.tsx
git commit -m "templates: add main.template.tsx entry"
```

### Task 7: `templates/App.template.tsx` (from codex)

**Files:**
- Create: `templates/App.template.tsx`

- [ ] **Step 7.1: Write the App component**

Source: `/Users/kaneki/Projects/PPT/ai-club-talk codex/src/App.tsx` (108 lines). The codex version is generic — only the slide-array import path is project-specific. Write to `templates/App.template.tsx` (verbatim copy with no changes; codex's App.tsx is already direction-agnostic):

```tsx
import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import DeckStage from "./deck/DeckStage";
import { slides } from "./slides";
import { tryAnimationNav } from "./deck/animationBus";

const TOTAL = slides.length;

function readSlideFromUrl(): number {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("slide");
  if (!raw) return 0;
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(TOTAL - 1, n - 1));
}

function writeSlideToUrl(idx: number) {
  const url = new URL(window.location.href);
  url.searchParams.set("slide", String(idx + 1));
  window.history.replaceState({}, "", url.toString());
}

export default function App() {
  const [idx, setIdx] = useState<number>(() => readSlideFromUrl());

  const go = useCallback((next: number) => {
    setIdx(() => {
      const clamped = Math.max(0, Math.min(TOTAL - 1, next));
      writeSlideToUrl(clamped);
      return clamped;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
        case " ":
        case "Enter":
          e.preventDefault();
          if (tryAnimationNav(1)) break;
          setIdx((i) => {
            const next = Math.min(TOTAL - 1, i + 1);
            writeSlideToUrl(next);
            return next;
          });
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          if (tryAnimationNav(-1)) break;
          setIdx((i) => {
            const next = Math.max(0, i - 1);
            writeSlideToUrl(next);
            return next;
          });
          break;
        case "Home":
          e.preventDefault();
          go(0);
          break;
        case "End":
          e.preventDefault();
          go(TOTAL - 1);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  useEffect(() => {
    const onPop = () => setIdx(readSlideFromUrl());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const Current = slides[idx];

  if (!Current) {
    return (
      <>
        <DeckStage>
          <div
            style={{
              width: 1920,
              height: 1080,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--ink)",
              opacity: 0.4,
              fontFamily: "var(--mono, ui-monospace, monospace)",
              fontSize: 24,
              letterSpacing: "0.06em",
            }}
          >
            no slides yet · add files in src/slides/ and re-export from index.ts
          </div>
        </DeckStage>
        <div className="deck-hud">
          <b>00</b>
          <span> / 00</span>
        </div>
      </>
    );
  }

  return (
    <>
      <DeckStage>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
            style={{ width: 1920, height: 1080 }}
          >
            <Current />
          </motion.div>
        </AnimatePresence>
      </DeckStage>
      <div className="deck-hud">
        <b>{String(idx + 1).padStart(2, "0")}</b>
        <span> / {String(TOTAL).padStart(2, "0")}</span>
      </div>
      <div className="deck-hud-hint">← → space  ·  home/end</div>
    </>
  );
}
```

> **Diff vs codex App.tsx**: added the `if (!Current)` empty-slides guard so the dev server doesn't crash between Step 0 (bootstrap, empty slides) and Step 3 (first slide added).

- [ ] **Step 7.2: Commit**

```bash
git add templates/App.template.tsx
git commit -m "templates: add App.template.tsx (from codex, key + AnimatePresence routing)"
```

### Task 8: `templates/DeckStage.template.tsx` (from codex)

**Files:**
- Create: `templates/DeckStage.template.tsx`

- [ ] **Step 8.1: Write the DeckStage component**

Source: `/Users/kaneki/Projects/PPT/ai-club-talk codex/src/deck/DeckStage.tsx` (66 lines, verbatim copy — already direction-agnostic). Write to `templates/DeckStage.template.tsx`:

```tsx
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const SLIDE_W = 1920;
const SLIDE_H = 1080;

function computeScale(w: number, h: number): number {
  return Math.min(w / SLIDE_W, h / SLIDE_H);
}

export default function DeckStage({ children }: Props) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState<number>(() => {
    if (typeof window === "undefined") return 1;
    return computeScale(window.innerWidth, window.innerHeight);
  });

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const recalc = () => {
      const rect = el.getBoundingClientRect();
      const next = computeScale(rect.width, rect.height);
      setScale((prev) => (Math.abs(prev - next) < 0.0005 ? prev : next));
    };

    recalc();

    const ro = new ResizeObserver(recalc);
    ro.observe(el);
    window.addEventListener("resize", recalc);
    window.addEventListener("orientationchange", recalc);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recalc);
      window.removeEventListener("orientationchange", recalc);
    };
  }, []);

  useEffect(() => {
    if (!("fonts" in document)) return;
    document.fonts.ready.then(() => {
      const el = stageRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setScale(computeScale(rect.width, rect.height));
    });
  }, []);

  return (
    <div className="deck-stage" ref={stageRef}>
      <div
        className="deck-frame"
        style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 8.2: Commit**

```bash
git add templates/DeckStage.template.tsx
git commit -m "templates: add DeckStage.template.tsx (1920x1080 fit-to-viewport scaler)"
```

### Task 9: `templates/Slide.template.tsx` (sanitized from codex)

**Files:**
- Create: `templates/Slide.template.tsx`

The codex `Slide.tsx` hardcodes `"AI Club"` / `"Spring 2026"` defaults and uses `var(--ele-cream)` / `var(--ele-charcoal-900)` / `var(--ele-copper-gold)` which are specific to the codex direction. The template makes these direction-agnostic by:
1. Defaulting backgrounds/colors to `--bg` / `--ink` / `--accent` tokens (which every direction defines)
2. Defaulting `name`/`date` to empty strings so each direction's chrome/foot supplies them via `LogoMark` or chrome
3. Removing the codex-specific `LogoMark` import (each direction defines its own chrome inside slide files)

- [ ] **Step 9.1: Write the sanitized Slide component**

Write to `templates/Slide.template.tsx`:

```tsx
import type { CSSProperties, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  /** Optional speaker / chrome label */
  name?: string;
  /** Optional date / chrome metadata */
  date?: string;
  /** Background CSS color or var(); defaults to direction token --bg */
  bg?: string;
  /** Foreground / ink color; defaults to direction token --ink */
  inkColor?: string;
  /** Accent color for rules / chrome marks; defaults to direction token --accent */
  accentColor?: string;
  /** Show top chrome strip (left: chrome label, right: page nb). Direction-specific styling via .deck-chrome class. */
  showHeader?: boolean;
  /** Show bottom foot strip (left: name / date, right: accent rule). Direction-specific styling via .deck-foot class. */
  showFooter?: boolean;
  /** Stage index for click-to-reveal slides (defaults 0). data-stage="N" on slide root. */
  stage?: number;
}

const SLIDE_W = 1920;
const SLIDE_H = 1080;

export default function Slide({
  children,
  name = "",
  date = "",
  bg = "var(--bg)",
  inkColor = "var(--ink)",
  accentColor = "var(--accent)",
  showHeader = false,
  showFooter = false,
  stage = 0,
}: Props) {
  const root: CSSProperties = {
    position: "relative",
    width: SLIDE_W,
    height: SLIDE_H,
    overflow: "hidden",
    background: bg,
    color: inkColor,
    ["--slide-accent" as string]: accentColor,
  };

  return (
    <div className="deck-slide" data-stage={stage} style={root}>
      {showHeader && (
        <div className="deck-chrome">
          <span className="deck-chrome-mark" style={{ color: accentColor }}>
            ◆
          </span>
        </div>
      )}
      {children}
      {showFooter && (
        <div className="deck-foot">
          <span className="deck-foot-meta">
            {name}
            {name && date ? " · " : ""}
            {date}
          </span>
          <span className="deck-foot-rule" style={{ background: accentColor }} />
        </div>
      )}
    </div>
  );
}
```

The `.deck-chrome`, `.deck-foot`, `.deck-chrome-mark`, `.deck-foot-rule` classes are styled by `templates/styles.template.css` (Task 12) and each direction can re-style them in `tokens.css` if needed.

- [ ] **Step 9.2: Verify it tsc-parses**

Run: `npx -y -p typescript@5.6.3 tsc --noEmit --jsx react-jsx --module esnext --moduleResolution bundler --target es2020 --strict --skipLibCheck templates/Slide.template.tsx 2>&1 | head -20`
Expected: no errors (or only "Cannot find module 'react'" since react isn't installed in the skill repo — that's OK, we use `--skipLibCheck` and the engineer will install react in the user's project).

If the React module-not-found error blocks, run with `--types` empty: `npx -y -p typescript@5.6.3 tsc --noEmit --jsx react-jsx --module esnext --moduleResolution bundler --target es2020 --noResolve templates/Slide.template.tsx 2>&1 | grep -v "Cannot find" | head`
Expected: nothing (only filtered-out missing-react messages).

- [ ] **Step 9.3: Commit**

```bash
git add templates/Slide.template.tsx
git commit -m "templates: add Slide.template.tsx (direction-agnostic shell with --bg/--ink/--accent tokens)"
```

### Task 10: `templates/animationBus.template.ts` (from codex)

**Files:**
- Create: `templates/animationBus.template.ts`

- [ ] **Step 10.1: Write the animation bus**

Source: `/Users/kaneki/Projects/PPT/ai-club-talk codex/src/deck/animationBus.ts` (19 lines, verbatim). Write to `templates/animationBus.template.ts`:

```ts
/**
 * Module-level mailbox so the active animation slide can intercept the
 * deck's left/right arrow keys for stage-by-stage playback. App.tsx
 * always tries the bus first; if it returns false (no animation mounted,
 * or the animation is at its first/last stage and the user wants to
 * cross the boundary), the slide-level navigation takes over.
 */
export type AnimationHandler = (dir: -1 | 1) => boolean;

let registered: AnimationHandler | null = null;

export function registerAnimationHandler(h: AnimationHandler | null): void {
  registered = h;
}

export function tryAnimationNav(dir: -1 | 1): boolean {
  return registered ? registered(dir) : false;
}
```

- [ ] **Step 10.2: Commit**

```bash
git add templates/animationBus.template.ts
git commit -m "templates: add animationBus.template.ts (verbatim from codex)"
```

### Task 11: `templates/make-single-html.template.mjs` (consolidated from codex)

**Files:**
- Create: `templates/make-single-html.template.mjs`

The codex pipeline splits responsibilities across two scripts:
- `export-deck.mjs` (uses playwright + pptxgen + sharp) dumps dist/ → `exports/<name>-html/` and rewrites `/assets/` → `./assets/`
- `make-single-html.mjs` reads `exports/<name>-html/` and inlines everything into one file

For remodeck we don't need playwright/pptxgen/sharp (no PPTX export, no screenshots in bundle step). The template consolidates the *minimal* portable-rewrite + inline pipeline into one script and drops the heavy deps:

1. Reads `dist/` directly (caller runs `npm run build` first)
2. Copies dist/ → `exports/<topic>-html/` and applies the portable URL rewrite (`/assets/` → `./assets/`)
3. Walks for `assets/` + `images/` + `videos/` files, base64-encodes them
4. Reads `index.html`, inlines `<link rel="stylesheet">` CSS (with `url(...)` rewrites to base64) and `<script type="module">` JS (with quoted asset-string swaps + Remotion staticFile patch)
5. Writes `exports/<topic>-single-file.html`

The `__TOPIC__` slot appears in three places: output filename, the `window.__<TOPIC>_ASSETS__` global name, and the htmlDir name. The bootstrap script (Task 18, Step 18.5) replaces all `__TOPIC__` occurrences with the upper-snake-cased deck name (e.g. `ai-club-talk` → `AI_CLUB_TALK`).

- [ ] **Step 11.1: Write the consolidated bundler**

Write to `templates/make-single-html.template.mjs`:

```js
#!/usr/bin/env node
/**
 * remodeck single-file bundler.
 *
 * Pipeline:
 *   1. assert dist/ exists (caller must run `npm run build` first)
 *   2. mirror dist/ → exports/__TOPIC__-html/ with portable URL rewrites
 *   3. inline CSS / JS into a single HTML file with base64 assets
 *
 * The `__TOPIC__` slot is replaced by the bootstrap script with the deck slug.
 */
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "dist");
const exportDir = path.join(root, "exports");
const htmlDir = path.join(exportDir, "__TOPIC__-html");
const outFile = path.join(exportDir, "__TOPIC__-single-file.html");
const ASSETS_GLOBAL = "__REMODECK_ASSETS__";

const mimeByExt = {
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".mp4": "video/mp4",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
};

function mimeFor(file) {
  return mimeByExt[path.extname(file).toLowerCase()] ?? "application/octet-stream";
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function walk(dir) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else {
      files.push(full);
    }
  }
  return files;
}

async function makeBuildPortable(dir) {
  const files = await walk(dir);
  const textFiles = files.filter((file) => /\.(html|js|css)$/.test(file));
  for (const file of textFiles) {
    const original = await fsp.readFile(file, "utf8");
    const portable = original
      .replace(/(["'`])\/(assets|images|videos)\//g, "$1./$2/")
      .replace(/url\(\s*\/(assets|images|videos)\//g, "url(./$1/");
    if (portable !== original) await fsp.writeFile(file, portable);
  }
}

function toDataUri(file) {
  const bytes = fs.readFileSync(file);
  return `data:${mimeFor(file)};base64,${bytes.toString("base64")}`;
}

function replaceQuotedAssetStrings(source, assetRels) {
  let next = source;
  for (const rel of assetRels) {
    const escaped = escapeRegExp(rel);
    for (const prefix of ["./", "/"]) {
      const quoted = new RegExp(`(["'\`])${escapeRegExp(prefix)}${escaped}\\1`, "g");
      next = next.replace(quoted, `window.${ASSETS_GLOBAL}[${JSON.stringify(rel)}]`);
    }
  }
  return next;
}

function replaceCssAssetUrls(source, assetMap) {
  let next = source;
  for (const [rel, dataUri] of Object.entries(assetMap)) {
    const escaped = escapeRegExp(rel);
    for (const prefix of ["./", "/"]) {
      const urlPattern = new RegExp(
        `url\\(\\s*(["']?)${escapeRegExp(prefix)}${escaped}\\1\\s*\\)`,
        "g"
      );
      next = next.replace(urlPattern, `url("${dataUri}")`);
    }
  }
  return next;
}

function patchRemotionStaticFile(source) {
  // Remotion's minified staticFile helper inlines paths at build time.
  // Patch the published shape to read from our embedded asset map first.
  const needle = "Hi=e=>{";
  const replacement =
    `Hi=e=>{if(typeof window<"u"&&window.${ASSETS_GLOBAL}&&window.${ASSETS_GLOBAL}[e])return window.${ASSETS_GLOBAL}[e];`;
  if (!source.includes(needle)) {
    return source;
  }
  return source.replace(needle, replacement);
}

async function main() {
  if (!fs.existsSync(path.join(distDir, "index.html"))) {
    throw new Error(`Missing dist/index.html. Run \`npm run build\` first.`);
  }

  await fsp.rm(htmlDir, { recursive: true, force: true });
  await fsp.mkdir(exportDir, { recursive: true });
  await fsp.cp(distDir, htmlDir, { recursive: true });
  await makeBuildPortable(htmlDir);

  const files = await walk(htmlDir);
  const assetFiles = files.filter((file) => {
    const rel = path.relative(htmlDir, file).replaceAll(path.sep, "/");
    return (
      /^(assets|images|videos)\//.test(rel) &&
      !/\.(css|js)$/.test(rel) &&
      !rel.includes("/.")
    );
  });

  const assetMap = {};
  for (const file of assetFiles) {
    const rel = path.relative(htmlDir, file).replaceAll(path.sep, "/");
    assetMap[rel] = toDataUri(file);
  }

  const indexPath = path.join(htmlDir, "index.html");
  let html = await fsp.readFile(indexPath, "utf8");

  html = html.replace(/<link rel="preconnect"[^>]+>\s*/g, "");
  html = html.replace(
    /<link\s+href="https:\/\/fonts\.googleapis\.com\/[^"]+"\s+rel="stylesheet"\s*\/?>\s*/g,
    ""
  );

  const cssLinks = [...html.matchAll(/<link rel="stylesheet" crossorigin href="([^"]+)">/g)];
  for (const match of cssLinks) {
    const href = match[1];
    const cssPath = path.join(htmlDir, href.replace(/^\.\//, ""));
    let css = await fsp.readFile(cssPath, "utf8");
    css = replaceCssAssetUrls(css, assetMap);
    html = html.replace(match[0], () => `<style>\n${css}\n</style>`);
  }

  const scriptTags = [
    ...html.matchAll(/<script type="module" crossorigin src="([^"]+)"><\/script>/g),
  ];
  for (const match of scriptTags) {
    const src = match[1];
    const jsPath = path.join(htmlDir, src.replace(/^\.\//, ""));
    let js = await fsp.readFile(jsPath, "utf8");
    js = patchRemotionStaticFile(js);
    js = replaceQuotedAssetStrings(js, Object.keys(assetMap));
    html = html.replace(
      match[0],
      () =>
        `<script>\nwindow.${ASSETS_GLOBAL}=${JSON.stringify(assetMap)};\n</script>\n<script type="module">\n${js.replaceAll("</script", "<\\/script")}\n</script>`
    );
  }

  await fsp.writeFile(outFile, html);
  const stat = await fsp.stat(outFile);
  process.stdout.write(`Single file HTML: ${outFile}\n`);
  process.stdout.write(`Size: ${(stat.size / 1024 / 1024).toFixed(1)} MB\n`);
  process.stdout.write(`Embedded assets: ${assetFiles.length}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

- [ ] **Step 11.2: Verify syntax with `node --check`**

Run: `node --check templates/make-single-html.template.mjs && echo OK`
Expected: `OK`

- [ ] **Step 11.3: Commit**

```bash
git add templates/make-single-html.template.mjs
git commit -m "templates: add make-single-html.template.mjs (consolidated portable+inline from codex)"
```

### Task 12: `templates/styles.template.css` (global base styles)

**Files:**
- Create: `templates/styles.template.css`

Direction-neutral global stylesheet. Defines the deck-stage / deck-frame / deck-hud layout chrome the App + DeckStage components reference. Direction tokens override colors via `--bg` / `--ink` / `--accent`.

- [ ] **Step 12.1: Write the base styles**

Write to `templates/styles.template.css`:

```css
/* remodeck base layer · direction-neutral · all colors via tokens */

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body,
#root {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--sans, system-ui), var(--sans-zh, sans-serif);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

/* deck stage scales 1920x1080 frame to viewport via DeckStage.tsx */
.deck-stage {
  position: fixed;
  inset: 0;
  display: block;
  background: var(--bg);
}
.deck-frame {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 1920px;
  height: 1080px;
  transform-origin: 0 0;
}

/* slide root rendered inside .deck-frame; direction tokens style backgrounds */
.deck-slide {
  position: relative;
  width: 1920px;
  height: 1080px;
  overflow: hidden;
}

/* HUD: bottom-right page counter + key hints */
.deck-hud {
  position: fixed;
  right: 24px;
  bottom: 24px;
  color: var(--ink);
  opacity: 0.55;
  font-family: var(--mono, ui-monospace, monospace);
  font-size: 14px;
  letter-spacing: 0.06em;
  pointer-events: none;
  z-index: 100;
}
.deck-hud b {
  font-weight: 600;
}
.deck-hud-hint {
  position: fixed;
  left: 24px;
  bottom: 24px;
  color: var(--ink);
  opacity: 0.35;
  font-family: var(--mono, ui-monospace, monospace);
  font-size: 12px;
  letter-spacing: 0.06em;
  pointer-events: none;
  z-index: 100;
}

/* generic chrome / foot styling — directions can override .deck-chrome / .deck-foot */
.deck-chrome {
  position: absolute;
  left: 96px;
  top: 64px;
  display: flex;
  align-items: center;
  gap: 16px;
  font-family: var(--mono, ui-monospace, monospace);
  font-size: 14px;
  letter-spacing: 0.08em;
  opacity: 0.6;
}
.deck-chrome-mark {
  font-size: 18px;
}
.deck-foot {
  position: absolute;
  left: 96px;
  right: 96px;
  bottom: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--mono, ui-monospace, monospace);
  font-size: 14px;
  letter-spacing: 0.08em;
  opacity: 0.6;
}
.deck-foot-rule {
  display: inline-block;
  width: 120px;
  height: 2px;
  background: var(--accent);
}

/* honor reduced-motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 12.2: Commit**

```bash
git add templates/styles.template.css
git commit -m "templates: add styles.template.css (direction-neutral base)"
```

---

## Phase 3 · Direction tokens + docs

Each direction gets one markdown reference plus N CSS preset files. Token blocks define `:root` only — base styles in `styles.template.css` reference the tokens.

Each direction file specifies the **fixed contract** every preset must define:

| Token | Meaning |
|---|---|
| `--bg` | Slide background base color |
| `--ink` | Body text / foreground color |
| `--accent` | Primary accent for rules, marks, chrome |
| `--accent-on` | Foreground that reads on accent fills |
| `--sans` | Primary sans-serif stack |
| `--sans-zh` | CJK sans-serif stack |
| `--serif` | Serif display stack (magazine + editorial-dark; swiss may omit) |
| `--mono` | Monospace stack |
| `--text-secondary` | Muted body text |
| `--text-helper` | Helper / caption text |
| `--border-subtle` | Subtle rule color |
| `--border-strong` | Strong rule color |

Presets may add direction-specific tokens (e.g. `--paper-rgb` for backdrop blur, `--copper` for editorial-dark rule color) but **must** define the 12 above.

### Task 13: Swiss direction (1 doc + 4 token presets)

**Files:**
- Create: `references/directions/swiss.md`
- Create: `templates/_tokens/swiss-ikb.template.css`
- Create: `templates/_tokens/swiss-yellow.template.css`
- Create: `templates/_tokens/swiss-sumi.template.css`
- Create: `templates/_tokens/swiss-walnut.template.css`

Source: tokens extracted from `/Users/kaneki/Projects/PPT/ai-productivity-pitch-swiss/index.html` lines 14–78. The IKB preset is the verbatim swiss-pitch defaults; the other 3 presets swap the accent + paper tones to Field Yellow / Sumi (high-contrast black on cream) / Walnut.

- [ ] **Step 13.1: Write `templates/_tokens/swiss-ikb.template.css`**

```css
/* swiss-ikb · Klein blue IKB on neutral paper · Inter + JetBrains Mono */
:root {
  --bg: #fafaf8;
  --paper-rgb: 250, 250, 248;
  --ink: #0a0a0a;
  --ink-rgb: 10, 10, 10;
  --grey-1: #f0f0ee;
  --grey-2: #d4d4d2;
  --grey-3: #737373;
  --accent: #002fa7;
  --accent-rgb: 0, 47, 167;
  --accent-on: #ffffff;
  --accent-bright: #5b7bff;

  --text-primary: #0a0a0a;
  --text-secondary: #525252;
  --text-helper: #737373;
  --text-placeholder: #a3a3a3;
  --text-on-color: #ffffff;
  --border-subtle: #e0e0e0;
  --border-strong: #a3a3a3;

  --sans: "Inter", "Helvetica Neue", "Helvetica", "Arial", system-ui, -apple-system, sans-serif;
  --sans-zh: "PingFang SC", "Hiragino Sans GB", "Source Han Sans SC", "Noto Sans SC", sans-serif;
  --serif: "Inter", system-ui, sans-serif;
  --mono: "JetBrains Mono", "IBM Plex Mono", "SF Mono", ui-monospace, monospace;

  --sp-3: 8px;
  --sp-4: 12px;
  --sp-5: 16px;
  --sp-6: 24px;
  --sp-7: 32px;
  --sp-8: 40px;
  --sp-9: 48px;
  --sp-10: 64px;
  --sp-11: 80px;
  --sp-12: 96px;
  --sp-13: 160px;
}
```

- [ ] **Step 13.2: Write `templates/_tokens/swiss-yellow.template.css`**

```css
/* swiss-yellow · Field yellow on neutral paper */
:root {
  --bg: #fafaf8;
  --paper-rgb: 250, 250, 248;
  --ink: #0a0a0a;
  --ink-rgb: 10, 10, 10;
  --grey-1: #f0f0ee;
  --grey-2: #d4d4d2;
  --grey-3: #737373;
  --accent: #ffd000;
  --accent-rgb: 255, 208, 0;
  --accent-on: #0a0a0a;
  --accent-bright: #ffe566;

  --text-primary: #0a0a0a;
  --text-secondary: #525252;
  --text-helper: #737373;
  --text-placeholder: #a3a3a3;
  --text-on-color: #0a0a0a;
  --border-subtle: #e0e0e0;
  --border-strong: #a3a3a3;

  --sans: "Inter", "Helvetica Neue", "Helvetica", "Arial", system-ui, -apple-system, sans-serif;
  --sans-zh: "PingFang SC", "Hiragino Sans GB", "Source Han Sans SC", "Noto Sans SC", sans-serif;
  --serif: "Inter", system-ui, sans-serif;
  --mono: "JetBrains Mono", "IBM Plex Mono", "SF Mono", ui-monospace, monospace;

  --sp-3: 8px; --sp-4: 12px; --sp-5: 16px; --sp-6: 24px; --sp-7: 32px;
  --sp-8: 40px; --sp-9: 48px; --sp-10: 64px; --sp-11: 80px; --sp-12: 96px; --sp-13: 160px;
}
```

- [ ] **Step 13.3: Write `templates/_tokens/swiss-sumi.template.css`**

```css
/* swiss-sumi · Black-on-cream high-contrast (sumi = japanese ink) */
:root {
  --bg: #1a1a1a;
  --paper-rgb: 26, 26, 26;
  --ink: #fafaf8;
  --ink-rgb: 250, 250, 248;
  --grey-1: #262626;
  --grey-2: #404040;
  --grey-3: #a3a3a3;
  --accent: #ffd000;
  --accent-rgb: 255, 208, 0;
  --accent-on: #0a0a0a;
  --accent-bright: #ffe566;

  --text-primary: #fafaf8;
  --text-secondary: #d4d4d2;
  --text-helper: #a3a3a3;
  --text-placeholder: #737373;
  --text-on-color: #0a0a0a;
  --border-subtle: #404040;
  --border-strong: #737373;

  --sans: "Inter", "Helvetica Neue", "Helvetica", "Arial", system-ui, -apple-system, sans-serif;
  --sans-zh: "PingFang SC", "Hiragino Sans GB", "Source Han Sans SC", "Noto Sans SC", sans-serif;
  --serif: "Inter", system-ui, sans-serif;
  --mono: "JetBrains Mono", "IBM Plex Mono", "SF Mono", ui-monospace, monospace;

  --sp-3: 8px; --sp-4: 12px; --sp-5: 16px; --sp-6: 24px; --sp-7: 32px;
  --sp-8: 40px; --sp-9: 48px; --sp-10: 64px; --sp-11: 80px; --sp-12: 96px; --sp-13: 160px;
}
```

- [ ] **Step 13.4: Write `templates/_tokens/swiss-walnut.template.css`**

```css
/* swiss-walnut · warm walnut brown on cream paper */
:root {
  --bg: #f5efe6;
  --paper-rgb: 245, 239, 230;
  --ink: #2b1a0e;
  --ink-rgb: 43, 26, 14;
  --grey-1: #ebe3d6;
  --grey-2: #c7b9a3;
  --grey-3: #8a7a64;
  --accent: #6b3a17;
  --accent-rgb: 107, 58, 23;
  --accent-on: #f5efe6;
  --accent-bright: #b87738;

  --text-primary: #2b1a0e;
  --text-secondary: #5a4733;
  --text-helper: #8a7a64;
  --text-placeholder: #b3a48a;
  --text-on-color: #f5efe6;
  --border-subtle: #d8cdb8;
  --border-strong: #8a7a64;

  --sans: "Inter", "Helvetica Neue", "Helvetica", "Arial", system-ui, -apple-system, sans-serif;
  --sans-zh: "PingFang SC", "Hiragino Sans GB", "Source Han Sans SC", "Noto Sans SC", sans-serif;
  --serif: "Inter", system-ui, sans-serif;
  --mono: "JetBrains Mono", "IBM Plex Mono", "SF Mono", ui-monospace, monospace;

  --sp-3: 8px; --sp-4: 12px; --sp-5: 16px; --sp-6: 24px; --sp-7: 32px;
  --sp-8: 40px; --sp-9: 48px; --sp-10: 64px; --sp-11: 80px; --sp-12: 96px; --sp-13: 160px;
}
```

- [ ] **Step 13.5: Write `references/directions/swiss.md`**

```markdown
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
```

- [ ] **Step 13.6: Commit**

```bash
git add references/directions/swiss.md templates/_tokens/swiss-*.template.css
git commit -m "directions: add swiss (4 presets: ikb / yellow / sumi / walnut)"
```

### Task 14: Editorial-dark direction (1 doc + 3 token presets)

**Files:**
- Create: `references/directions/editorial-dark.md`
- Create: `templates/_tokens/editorial-dark-standard.template.css`
- Create: `templates/_tokens/editorial-dark-plum.template.css`
- Create: `templates/_tokens/editorial-dark-navy.template.css`

Mood: Aeon / Slate / NYT Magazine dark — warm-dark backgrounds, copper rule, serif display headlines. Built for Remotion-heavy decks where the dark canvas yields visual focus to A* compositions.

- [ ] **Step 14.1: Write `templates/_tokens/editorial-dark-standard.template.css`**

```css
/* editorial-dark-standard · warm umber dark + copper rule + Serif Display */
:root {
  --bg: #1a1410;
  --paper-rgb: 26, 20, 16;
  --ink: #f3ebde;
  --ink-rgb: 243, 235, 222;
  --grey-1: #2a221c;
  --grey-2: #4a3e30;
  --grey-3: #8a7a64;
  --accent: #b97a48;
  --accent-rgb: 185, 122, 72;
  --accent-on: #1a1410;
  --accent-bright: #d99e6c;
  --copper: #b97a48;

  --text-primary: #f3ebde;
  --text-secondary: #c7b9a3;
  --text-helper: #8a7a64;
  --text-placeholder: #5a4733;
  --text-on-color: #1a1410;
  --border-subtle: #2a221c;
  --border-strong: #4a3e30;

  --sans: "Inter", "Helvetica Neue", system-ui, -apple-system, sans-serif;
  --sans-zh: "PingFang SC", "Hiragino Sans GB", "Source Han Sans SC", "Noto Sans SC", sans-serif;
  --serif: "DM Serif Display", "Playfair Display", "Times New Roman", Georgia, serif;
  --mono: "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace;

  --sp-3: 8px; --sp-4: 12px; --sp-5: 16px; --sp-6: 24px; --sp-7: 32px;
  --sp-8: 40px; --sp-9: 48px; --sp-10: 64px; --sp-11: 80px; --sp-12: 96px; --sp-13: 160px;
}
```

- [ ] **Step 14.2: Write `templates/_tokens/editorial-dark-plum.template.css`**

```css
/* editorial-dark-plum · sunken plum / aubergine + brass rule */
:root {
  --bg: #1c1320;
  --paper-rgb: 28, 19, 32;
  --ink: #efe5f1;
  --ink-rgb: 239, 229, 241;
  --grey-1: #2b2030;
  --grey-2: #4a3b52;
  --grey-3: #806a8a;
  --accent: #c8a14a;
  --accent-rgb: 200, 161, 74;
  --accent-on: #1c1320;
  --accent-bright: #e0c171;
  --copper: #c8a14a;

  --text-primary: #efe5f1;
  --text-secondary: #c2b3c8;
  --text-helper: #806a8a;
  --text-placeholder: #5a4863;
  --text-on-color: #1c1320;
  --border-subtle: #2b2030;
  --border-strong: #4a3b52;

  --sans: "Inter", "Helvetica Neue", system-ui, -apple-system, sans-serif;
  --sans-zh: "PingFang SC", "Hiragino Sans GB", "Source Han Sans SC", "Noto Sans SC", sans-serif;
  --serif: "DM Serif Display", "Playfair Display", "Times New Roman", Georgia, serif;
  --mono: "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace;

  --sp-3: 8px; --sp-4: 12px; --sp-5: 16px; --sp-6: 24px; --sp-7: 32px;
  --sp-8: 40px; --sp-9: 48px; --sp-10: 64px; --sp-11: 80px; --sp-12: 96px; --sp-13: 160px;
}
```

- [ ] **Step 14.3: Write `templates/_tokens/editorial-dark-navy.template.css`**

```css
/* editorial-dark-navy · midnight navy + brass-gold rule */
:root {
  --bg: #0e1624;
  --paper-rgb: 14, 22, 36;
  --ink: #e8eef7;
  --ink-rgb: 232, 238, 247;
  --grey-1: #1a2335;
  --grey-2: #324159;
  --grey-3: #6a7990;
  --accent: #c8a14a;
  --accent-rgb: 200, 161, 74;
  --accent-on: #0e1624;
  --accent-bright: #e0c171;
  --copper: #c8a14a;

  --text-primary: #e8eef7;
  --text-secondary: #b8c2d6;
  --text-helper: #6a7990;
  --text-placeholder: #4a5670;
  --text-on-color: #0e1624;
  --border-subtle: #1a2335;
  --border-strong: #324159;

  --sans: "Inter", "Helvetica Neue", system-ui, -apple-system, sans-serif;
  --sans-zh: "PingFang SC", "Hiragino Sans GB", "Source Han Sans SC", "Noto Sans SC", sans-serif;
  --serif: "DM Serif Display", "Playfair Display", "Times New Roman", Georgia, serif;
  --mono: "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace;

  --sp-3: 8px; --sp-4: 12px; --sp-5: 16px; --sp-6: 24px; --sp-7: 32px;
  --sp-8: 40px; --sp-9: 48px; --sp-10: 64px; --sp-11: 80px; --sp-12: 96px; --sp-13: 160px;
}
```

- [ ] **Step 14.4: Write `references/directions/editorial-dark.md`**

```markdown
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
```

- [ ] **Step 14.5: Commit**

```bash
git add references/directions/editorial-dark.md templates/_tokens/editorial-dark-*.template.css
git commit -m "directions: add editorial-dark (3 presets: standard / plum / navy)"
```

### Task 15: Magazine direction (1 doc + 5 token presets)

**Files:**
- Create: `references/directions/magazine.md`
- Create: `templates/_tokens/magazine-monocle.template.css`
- Create: `templates/_tokens/magazine-wired.template.css`
- Create: `templates/_tokens/magazine-kinfolk.template.css`
- Create: `templates/_tokens/magazine-domus.template.css`
- Create: `templates/_tokens/magazine-lab.template.css`

Each preset is a recognizable magazine reference: Monocle (beige/black serif), WIRED (red/black saturated), Kinfolk (cream/sage soft), Domus (industrial gray/red), Lab (academic blue/gray).

- [ ] **Step 15.1: Write `templates/_tokens/magazine-monocle.template.css`**

```css
/* magazine-monocle · refined beige + signature red highlight + Tiempos-style serif */
:root {
  --bg: #f3eee5;
  --paper-rgb: 243, 238, 229;
  --ink: #18130d;
  --ink-rgb: 24, 19, 13;
  --grey-1: #e6dfd0;
  --grey-2: #b8aa8a;
  --grey-3: #7a6e54;
  --accent: #b8302a;
  --accent-rgb: 184, 48, 42;
  --accent-on: #f3eee5;
  --accent-bright: #d05a4c;

  --text-primary: #18130d;
  --text-secondary: #4a4030;
  --text-helper: #7a6e54;
  --text-placeholder: #aa9e80;
  --text-on-color: #f3eee5;
  --border-subtle: #d6cdb6;
  --border-strong: #7a6e54;

  --sans: "Inter", "Helvetica Neue", system-ui, -apple-system, sans-serif;
  --sans-zh: "PingFang SC", "Hiragino Sans GB", "Source Han Sans SC", "Noto Sans SC", sans-serif;
  --serif: "DM Serif Display", "Tiempos Headline", "Playfair Display", Georgia, serif;
  --mono: "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace;

  --sp-3: 8px; --sp-4: 12px; --sp-5: 16px; --sp-6: 24px; --sp-7: 32px;
  --sp-8: 40px; --sp-9: 48px; --sp-10: 64px; --sp-11: 80px; --sp-12: 96px; --sp-13: 160px;
}
```

- [ ] **Step 15.2: Write `templates/_tokens/magazine-wired.template.css`**

```css
/* magazine-wired · high-saturation red + matte black + bold sans */
:root {
  --bg: #f7f6f0;
  --paper-rgb: 247, 246, 240;
  --ink: #0d0d0d;
  --ink-rgb: 13, 13, 13;
  --grey-1: #e8e6dc;
  --grey-2: #a8a59a;
  --grey-3: #6a6a60;
  --accent: #d4061b;
  --accent-rgb: 212, 6, 27;
  --accent-on: #f7f6f0;
  --accent-bright: #ff3b51;

  --text-primary: #0d0d0d;
  --text-secondary: #3a3a36;
  --text-helper: #6a6a60;
  --text-placeholder: #9a9a90;
  --text-on-color: #f7f6f0;
  --border-subtle: #d4d1c5;
  --border-strong: #6a6a60;

  --sans: "Inter", "Helvetica Neue", "Arial Black", system-ui, sans-serif;
  --sans-zh: "PingFang SC", "Hiragino Sans GB", "Source Han Sans SC", "Noto Sans SC", sans-serif;
  --serif: "DM Serif Display", "Playfair Display", Georgia, serif;
  --mono: "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace;

  --sp-3: 8px; --sp-4: 12px; --sp-5: 16px; --sp-6: 24px; --sp-7: 32px;
  --sp-8: 40px; --sp-9: 48px; --sp-10: 64px; --sp-11: 80px; --sp-12: 96px; --sp-13: 160px;
}
```

- [ ] **Step 15.3: Write `templates/_tokens/magazine-kinfolk.template.css`**

```css
/* magazine-kinfolk · soft cream + sage green + airy serif */
:root {
  --bg: #f5f1e8;
  --paper-rgb: 245, 241, 232;
  --ink: #2a2e25;
  --ink-rgb: 42, 46, 37;
  --grey-1: #ebe5d6;
  --grey-2: #c8c2b0;
  --grey-3: #888272;
  --accent: #6e8268;
  --accent-rgb: 110, 130, 104;
  --accent-on: #f5f1e8;
  --accent-bright: #93a48b;

  --text-primary: #2a2e25;
  --text-secondary: #565a4e;
  --text-helper: #888272;
  --text-placeholder: #b3ad9d;
  --text-on-color: #f5f1e8;
  --border-subtle: #d8d2c0;
  --border-strong: #888272;

  --sans: "Inter", "Helvetica Neue", system-ui, -apple-system, sans-serif;
  --sans-zh: "PingFang SC", "Hiragino Sans GB", "Source Han Sans SC", "Noto Sans SC", sans-serif;
  --serif: "DM Serif Display", "Lyon Display", "Playfair Display", Georgia, serif;
  --mono: "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace;

  --sp-3: 8px; --sp-4: 12px; --sp-5: 16px; --sp-6: 24px; --sp-7: 32px;
  --sp-8: 40px; --sp-9: 48px; --sp-10: 64px; --sp-11: 80px; --sp-12: 96px; --sp-13: 160px;
}
```

- [ ] **Step 15.4: Write `templates/_tokens/magazine-domus.template.css`**

```css
/* magazine-domus · industrial gray + arch-red + tight sans */
:root {
  --bg: #ececea;
  --paper-rgb: 236, 236, 234;
  --ink: #161616;
  --ink-rgb: 22, 22, 22;
  --grey-1: #dcdcd9;
  --grey-2: #a0a09e;
  --grey-3: #6a6a68;
  --accent: #a01818;
  --accent-rgb: 160, 24, 24;
  --accent-on: #ececea;
  --accent-bright: #c83838;

  --text-primary: #161616;
  --text-secondary: #3a3a3a;
  --text-helper: #6a6a68;
  --text-placeholder: #9a9a98;
  --text-on-color: #ececea;
  --border-subtle: #cdcdcb;
  --border-strong: #6a6a68;

  --sans: "Inter", "Helvetica Neue", system-ui, -apple-system, sans-serif;
  --sans-zh: "PingFang SC", "Hiragino Sans GB", "Source Han Sans SC", "Noto Sans SC", sans-serif;
  --serif: "DM Serif Display", "Playfair Display", Georgia, serif;
  --mono: "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace;

  --sp-3: 8px; --sp-4: 12px; --sp-5: 16px; --sp-6: 24px; --sp-7: 32px;
  --sp-8: 40px; --sp-9: 48px; --sp-10: 64px; --sp-11: 80px; --sp-12: 96px; --sp-13: 160px;
}
```

- [ ] **Step 15.5: Write `templates/_tokens/magazine-lab.template.css`**

```css
/* magazine-lab · academic blue-gray + cobalt accent + scholarly serif */
:root {
  --bg: #ecedef;
  --paper-rgb: 236, 237, 239;
  --ink: #131822;
  --ink-rgb: 19, 24, 34;
  --grey-1: #dcdee2;
  --grey-2: #a4a8b2;
  --grey-3: #6a6e78;
  --accent: #1a3a8a;
  --accent-rgb: 26, 58, 138;
  --accent-on: #ecedef;
  --accent-bright: #3960c9;

  --text-primary: #131822;
  --text-secondary: #3a3f4a;
  --text-helper: #6a6e78;
  --text-placeholder: #9aa0aa;
  --text-on-color: #ecedef;
  --border-subtle: #ccced4;
  --border-strong: #6a6e78;

  --sans: "Inter", "Helvetica Neue", system-ui, -apple-system, sans-serif;
  --sans-zh: "PingFang SC", "Hiragino Sans GB", "Source Han Sans SC", "Noto Sans SC", sans-serif;
  --serif: "DM Serif Display", "EB Garamond", Georgia, serif;
  --mono: "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace;

  --sp-3: 8px; --sp-4: 12px; --sp-5: 16px; --sp-6: 24px; --sp-7: 32px;
  --sp-8: 40px; --sp-9: 48px; --sp-10: 64px; --sp-11: 80px; --sp-12: 96px; --sp-13: 160px;
}
```

- [ ] **Step 15.6: Write `references/directions/magazine.md`**

```markdown
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
```

- [ ] **Step 15.7: Commit**

```bash
git add references/directions/magazine.md templates/_tokens/magazine-*.template.css
git commit -m "directions: add magazine (5 sub-directions: monocle/wired/kinfolk/domus/lab)"
```

---

## Phase 4 · References

Five reference docs. Each is self-contained knowledge.

### Task 16: `references/BRAINSTORM.md`

**Files:**
- Create: `references/BRAINSTORM.md`

- [ ] **Step 16.1: Write the brainstorm reference**

Write to `references/BRAINSTORM.md`:

```markdown
# References · Brainstorm (Step 1)

Main-thread, one question at a time. No subagent. The output of this step is `docs/brainstorm/<topic>-spec.md` with two sections: **Outline** and **Animation plan**.

## The 5 questions

Ask in order. Wait for an answer before asking the next.

### 1. Topic + audience

> "What's the topic, and who's the audience? Roughly how long is the talk?"

Drives slide_count and lexical register. Examples:
- "AI alignment for an academic CS audience, 45 min" → 18–25 slides, formal, lab/editorial-dark
- "Productivity tools for startup people, 25 min" → 12–18 slides, sharp, swiss-ikb or magazine-wired

### 2. Narrative arc

> "What's the through-line? Got a one-sentence pitch, or do you want me to suggest a 5-act structure?"

If user has a pitch, use it. If user has no arc, **only then** offer the 5-act template (default = opt-in):
1. **Hook** — surprising claim or question
2. **Context** — what's broken / what we know so far
3. **Core** — the new idea or evidence
4. **Shift** — implications / what changes
5. **Takeaway** — single takeaway with action

### 3. Hard constraints

> "Anything that MUST be on a specific slide (a name, an image, a claim)? Anything that absolutely can't appear?"

Capture verbatim. These become invariants the per-page spec must honor.

### 4. Remotion animation plan

> "Do any pages need a frame-precise animation — something CSS/motion can't do? (E.g. 'show 80 emails arrive, then counter ticks 12 → 1847, then a STOP button intervenes — all in one continuous 15s composition.') If yes, roughly which pages and what each does."

Output for each:
- Slide number (P-NN)
- Duration (seconds)
- 1-line plot synopsis
- Whether to reuse a codex `A*` pattern (e.g. "A06_AlignmentFailure")

### 5. Image / asset plan

> "For images — splash URLs you'll provide, AI-generated, or both? Any reference style for AI-generated ones?"

Capture URL list + style descriptor for AI-generated ones (e.g. "warm editorial paper texture, serif typography mood").

## Output template (write to `docs/brainstorm/<topic>-spec.md`)

```markdown
# <Topic> · Brainstorm

**Audience**: ...
**Length**: ... min
**Direction**: <direction>-<preset> (locked in Step 0)
**Estimated slide count**: ...

## Outline

P01 · <name>
P02 · <name>
...

## Hard constraints

- Must include: ...
- Must not include: ...

## Animation plan

- P-NN · <duration>s · <synopsis> · (reuse: <A* name or "new">)
- ...

## Style descriptor (for AI-generated images)

<one-line description, e.g. "warm editorial paper texture, serif typography mood, generous negative space, no stock-photo gloss">
```

## After Step 1

Append **per-page prose specs** in Step 2 to the **same file** (under a `## Per-page spec` heading). See `references/SPEC.md` for the 5-line format.
```

- [ ] **Step 16.2: Commit**

```bash
git add references/BRAINSTORM.md
git commit -m "references: add BRAINSTORM.md (Step 1 5-question template + outline arc)"
```

### Task 17: `references/SPEC.md`

**Files:**
- Create: `references/SPEC.md`

- [ ] **Step 17.1: Write the spec-format reference**

Write to `references/SPEC.md`:

```markdown
# References · Per-page Spec (Step 2)

Each slide gets one 5-line prose block appended to `docs/brainstorm/<topic>-spec.md` under `## Per-page spec`. **No YAML.** Five fields, one line each.

## The format

```markdown
### P<NN> · <slot> · <name>

- **文字**: <headline / subhead / list / quote / kicker> 或 "无 (纯视觉页)"
- **图片**: "AI 生成 + <prompt>" 或 "splash <URL>" 或 "本地 <path>" + <位置 / 占比>; 或 "无"
- **Remotion 动画**: "是 · <Ns> · <N 场景> · <情节>" 或 "是 · 复用 <A* 名>" 或 "无"
- **排版**: 一句话描述大致摆位 (不画 grid 坐标; layout 在 Step 3 直观验)
- **stages**: <N stages> / <念稿秒数估算>
```

## Hard rules (the spec spec)

- Headlines ≤ 12 Chinese chars or ≤ 8 English words; body paragraphs ≤ 60 chars each; list items ≤ 5 per slide (split into multiple stages otherwise)
- The 排版 line is **prose only** — no `top: 200px` or `cols 1-4` numbers. Visual layout is verified at Step 3, not specified here.
- `stages` is the # of click-to-reveal layers + estimated narration seconds. Surface seconds catches over-stuffed slides early.
- Use 中文 if the talk is 中文, 英文 if 英文 — match the talk language.

## 10 typical-page examples (copy-paste templates)

### 1. Cover (P01)

```markdown
### P01 · Cover · "AI Productivity Plan"

- **文字**: hero "AI Productivity Plan" + 副标 "Field Note 01" + 元数据 "Spring 2026 · AI Club"
- **图片**: 无
- **Remotion 动画**: 无 (motion stagger 入场即可)
- **排版**: 左半屏大字 hero, 右半屏让给背景, 底部 chrome 1/30
- **stages**: 1 stage 一次性入场 / 念稿 ~45 秒
```

### 2. Quote / pull-quote

```markdown
### P07 · Quote · Karpathy on agents

- **文字**: 引文 "An agent doesn't reason, it iterates." · 署名 Andrej Karpathy · 出处 2024 talk
- **图片**: 无
- **Remotion 动画**: 无
- **排版**: 引文居中放大, 署名右下角斜体小, 上下细分隔线
- **stages**: 1 stage / 念稿 ~30 秒
```

### 3. Stat-card row

```markdown
### P22 · 三档生产力 · 高密度对比页

- **文字**: 3 张 stat 卡 · "10× 倍" / "3 类岗位重塑" / "65% 渗透率" + 每卡一行注释
- **图片**: splash https://images.unsplash.com/photo-... (3:2), 放右下角占 30% 宽
- **Remotion 动画**: 无
- **排版**: 12 列 grid, 左 4 列大 kicker + headline, 右 8 列横排 3 张 stat 卡
- **stages**: 4 stages 逐张点出来 (先框架→1→2→3) / 念稿 ~90 秒
```

### 4. Pipeline / process flow

```markdown
### P11 · Agent loop · "感知 → 规划 → 行动 → 反思"

- **文字**: 4 步标签 + 每步一行说明
- **图片**: 无
- **Remotion 动画**: 无 (motion pipeline recipe 就够)
- **排版**: 横向 4 节, 节间细 accent rule 连接, 念到哪节哪节亮起
- **stages**: 5 stages (框架 + 逐节) / 念稿 ~75 秒
```

### 5. Image-split (image + copy)

```markdown
### P05 · 起源 · Hinton 的 1986

- **文字**: kicker "ORIGIN" + headline "Hinton 1986" + 引文一段
- **图片**: splash https://upload.wikimedia.org/.../hinton.jpg (4:5 portrait), 占左 5 列
- **Remotion 动画**: 无
- **排版**: 左 5 列竖排人像, 右 7 列上 kicker 中 headline 下 引文
- **stages**: 1 stage / 念稿 ~50 秒
```

### 6. Full-Remotion (narrative inside one slide)

```markdown
### P15 · 对齐失败 · Summer Yue · "AI 也会失控"

- **文字**: kicker "ALIGNMENT FAILURE" + headline "Summer Yue 的 1,847 封删信" + 引文一段
- **图片**: 无 (动画占视觉重心)
- **Remotion 动画**: 是 · 15s · 5 场景 · 指令邮件 → 收件箱涌入 80 封 + 计数器 12→1847 → 自动删信 pulsing 红 → STOP 按钮 → 引言定格. 复用 codex A06_AlignmentFailure 思路
- **排版**: 上半屏 headline + kicker, 下半屏整个让给 Remotion composition
- **stages**: 1 stage (动画自播) / 念稿 ~60 秒
```

### 7. Chapter divider

```markdown
### P13 · Part II · "代理人"

- **文字**: 大字 chapter number "02" + chapter title "代理人" + 副标 "Agents"
- **图片**: 无
- **Remotion 动画**: 无
- **排版**: 左下角巨型 02, 右上 chapter title, 中间一条 accent rule
- **stages**: 1 stage / 念稿 ~15 秒
```

### 8. Question slide

```markdown
### P20 · 提问 · "如果模型真的赢了, 我们会做什么?"

- **文字**: 单一问题 (60-90 字), 无答案
- **图片**: 无
- **Remotion 动画**: 无
- **排版**: 问题居中放大, 周围大量留白
- **stages**: 1 stage / 念稿 ~40 秒 (含停顿)
```

### 9. Comparison (vs / vs)

```markdown
### P09 · "用 AI 写代码 vs 让 AI 写代码"

- **文字**: 左栏 "用 AI 写代码" + 4 bullet · 右栏 "让 AI 写代码" + 4 bullet
- **图片**: 无
- **Remotion 动画**: 无
- **排版**: 左右两栏对称, 中间一条 vertical accent rule, 上方共享 headline
- **stages**: 5 stages (框架 + 左 1 + 左 2 + 右 1 + 右 2 / 或按行同步) / 念稿 ~75 秒
```

### 10. Closing / takeaway

```markdown
### P28 · 结语 · "三件事"

- **文字**: takeaway list 3 项 + 演讲者署名 + 联系方式
- **图片**: 无
- **Remotion 动画**: 无
- **排版**: 居中 takeaway list, 下方 mono 署名 + 链接, accent rule 收尾
- **stages**: 4 stages (框架 + 逐条) / 念稿 ~60 秒
```

## Filling the prose

When unsure of a field, prefer **explicit "无"** over leaving it blank. The reader (you, in Step 3) needs to know "无 图片" is intentional, not a forgotten field.

When the 文字 field is long (e.g. an extended quote), inline the full text — the spec doc is the source of truth for content. Just keep individual lines ≤ 60 chars to keep the prose readable.
```

- [ ] **Step 17.2: Commit**

```bash
git add references/SPEC.md
git commit -m "references: add SPEC.md (5-line prose format + 10 page-type examples)"
```

### Task 18: `references/ARCHITECTURE.md`

**Files:**
- Create: `references/ARCHITECTURE.md`

- [ ] **Step 18.1: Write the architecture reference**

Write to `references/ARCHITECTURE.md`:

```markdown
# References · Architecture

The fresh Vite project bootstrapped in Step 0 has this shape:

```
<topic>/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── scripts/
│   └── make-single-html.mjs
├── src/
│   ├── main.tsx
│   ├── App.tsx                 # key routing + AnimatePresence + DeckStage
│   ├── styles/
│   │   ├── tokens.css          # active direction preset (from _tokens/)
│   │   └── global.css          # base styles
│   ├── deck/
│   │   ├── DeckStage.tsx       # 1920x1080 fit-to-viewport scaler
│   │   ├── Slide.tsx           # slide shell with chrome/foot toggles
│   │   └── animationBus.ts     # key-routing mailbox for stages
│   ├── slides/
│   │   ├── index.ts            # exports the slides[] array
│   │   ├── P01_Cover.tsx
│   │   ├── P02_Outline.tsx
│   │   └── ...
│   └── animations/             # Remotion compositions when needed
│       ├── A01_*.tsx
│       └── ...
├── public/
│   ├── images/                 # splash URLs cached locally + AI-generated
│   └── videos/
├── assets/
│   └── _manifest.json          # lightweight {filename: source/prompt} map
├── docs/
│   └── brainstorm/
│       └── <topic>-spec.md
└── exports/
    ├── <topic>-html/           # generated by make-single-html.mjs (intermediate)
    └── <topic>-single-file.html
```

## Slide.tsx props

```ts
interface SlideProps {
  children?: ReactNode;
  name?: string;        // chrome/foot speaker label
  date?: string;        // chrome/foot date
  bg?: string;          // defaults var(--bg)
  inkColor?: string;    // defaults var(--ink)
  accentColor?: string; // defaults var(--accent)
  showHeader?: boolean;
  showFooter?: boolean;
  stage?: number;       // current click-to-reveal stage (data-stage="N" on root)
}
```

The `stage` prop becomes `data-stage="N"` on the slide root. CSS targets stages with `[data-stage="2"] .my-block { opacity: 1 }` for declarative reveals.

## DeckStage.tsx

Fixed 1920×1080 inner frame, scaled with `Math.min(viewportW / 1920, viewportH / 1080)` to fit the viewport with letterboxing. Recomputes on resize + on `document.fonts.ready` (Chinese display fonts shift layout post-load).

## animationBus.ts

Module-level mailbox. A slide containing a Remotion composition (or a multi-stage motion animation) registers a handler at mount; App's key handler calls `tryAnimationNav(±1)` first and only advances the slide index if it returns `false`.

```ts
export type AnimationHandler = (dir: -1 | 1) => boolean;
export function registerAnimationHandler(h: AnimationHandler | null): void;
export function tryAnimationNav(dir: -1 | 1): boolean;
```

Pattern for a multi-stage slide:

```tsx
import { useEffect, useState } from "react";
import { registerAnimationHandler } from "../deck/animationBus";

export default function P11_AgentLoop() {
  const [stage, setStage] = useState(0);
  const MAX = 4;

  useEffect(() => {
    registerAnimationHandler((dir) => {
      const next = stage + dir;
      if (next < 0 || next > MAX) return false; // let App switch slides
      setStage(next);
      return true;
    });
    return () => registerAnimationHandler(null);
  }, [stage]);

  return (
    <Slide stage={stage} showHeader showFooter>
      {/* stages styled via CSS [data-stage="N"] selectors */}
    </Slide>
  );
}
```

## URL ?slide= persistence

App reads `?slide=N` on mount, writes back on every navigation via `history.replaceState`. Deep-linkable + survives reloads. No router needed.

## slides/index.ts contract

```ts
import P01_Cover from "./P01_Cover";
// ...

export const slides = [
  P01_Cover,
  // ...
] as const;
```

Order = presentation order. Add a slide = import + push to the array.

## Build artifacts

- `npm run dev` → vite serves at `http://localhost:5173/?slide=1`
- `npm run build` → `dist/`
- `npm run bundle` → reads `dist/`, writes `exports/<topic>-single-file.html`

Bundle step is only triggered by user authorization (Gate B). Never run automatically.
```

- [ ] **Step 18.2: Commit**

```bash
git add references/ARCHITECTURE.md
git commit -m "references: add ARCHITECTURE.md (project layout / Slide props / animationBus / URL routing)"
```

### Task 19: `references/ANIMATIONS.md`

**Files:**
- Create: `references/ANIMATIONS.md`

- [ ] **Step 19.1: Write the animations reference**

Write to `references/ANIMATIONS.md`:

```markdown
# References · Animations (motion + Remotion)

## When to use motion vs Remotion

| Question | Use |
|---|---|
| UI reveal on click / keyboard / scroll? | **motion** (event-driven) |
| Frame-precise timeline (10s, 80 elements, choreographed)? | **Remotion** (frame-driven) |
| Hover / focus / drag state transitions? | **motion** |
| Multi-element synced animation lasting > 5s? | **Remotion** |
| Per-slide entry / exit between slides? | **motion** (App.tsx AnimatePresence) |
| Numeric counter that ticks from X to Y over Ns? | **motion** (`useSpring` + `useTransform`) for short; **Remotion** for long + integrated narrative |

Default to **motion**. Only reach for Remotion when motion can't choreograph the beats — typically narrative animations like `A06_AlignmentFailure` (15s, 5 scenes, 80 elements).

## motion recipes (copy-paste)

### `stagger-list` — reveal list items one by one on stage advance

```tsx
import { motion } from "motion/react";

<motion.ul>
  {items.map((item, i) => (
    <motion.li
      key={i}
      initial={{ opacity: 0, y: 12 }}
      animate={stage > i ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1], delay: 0.05 * i }}
    >
      {item}
    </motion.li>
  ))}
</motion.ul>
```

### `pipeline` — horizontal step reveal

```tsx
{steps.map((s, i) => (
  <motion.div
    key={s.id}
    className="step"
    initial={{ opacity: 0.3 }}
    animate={{ opacity: stage > i ? 1 : 0.3 }}
    transition={{ duration: 0.4, ease: [0.4, 0.14, 0.3, 1] }}
  >
    <span className="step-label">{s.label}</span>
  </motion.div>
))}
```

### `counter` — ticker from 0 to N

```tsx
import { useMotionValue, useSpring, useTransform } from "motion/react";

function Counter({ to }: { to: number }) {
  const value = useMotionValue(0);
  const rounded = useTransform(useSpring(value, { stiffness: 60, damping: 20 }), (v) =>
    Math.round(v).toLocaleString()
  );
  useEffect(() => { value.set(to); }, [to, value]);
  return <motion.span>{rounded}</motion.span>;
}
```

### `fade-in-stack` — layered reveal on stage change

```tsx
<motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={stage >= layerStage ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
  transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
>
  ...
</motion.div>
```

### `slide-cross` — page-level cross-fade (already in App.tsx)

`AnimatePresence mode="wait"` with `initial: { opacity: 0, x: 24 }`, `animate: { opacity: 1, x: 0 }`, `exit: { opacity: 0, x: -24 }`.

### `accent-rule-draw` — animated rule reveal

```tsx
<motion.span
  className="rule-accent"
  initial={{ scaleX: 0 }}
  animate={stage > 0 ? { scaleX: 1 } : { scaleX: 0 }}
  style={{ originX: 0 }}
  transition={{ duration: 0.6, ease: [0.4, 0.14, 0.3, 1] }}
/>
```

### `chrome-fade` — chrome reveals after main content

```tsx
<motion.div
  className="chrome"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.4, delay: 0.6 }}
/>
```

### `dot-matrix-pulse` — subtle ambient bg motion

For background canvas pulses, use raw `requestAnimationFrame` (not motion) — motion is for UI events, not ambient bg loops.

## Remotion patterns

### When to use Remotion in a slide

1. The slide has a self-contained narrative arc lasting 8–25 seconds
2. Multiple elements must animate in concert with timing dependencies (e.g. "after 1.5s, 80 emails arrive in sequence over 3s, then counter starts ticking from frame 80…")
3. Frame-precision matters (export to PPTX-style snapshot, video, archival)

### Embedding a Remotion composition in a slide

```tsx
import { Player } from "@remotion/player";
import { AlignmentFailureComposition } from "../animations/A06_AlignmentFailure";

export default function P15_AlignmentFailure() {
  return (
    <Slide showHeader showFooter>
      <div className="lay-edark-fullbleed-anim">
        {/* upper-quarter text */}
        <div className="kicker">ALIGNMENT FAILURE</div>
        <h2 className="headline">Summer Yue 的 1,847 封删信</h2>

        {/* full-bleed composition fills the rest */}
        <div className="anim-container">
          <Player
            component={AlignmentFailureComposition}
            durationInFrames={450}
            fps={30}
            compositionWidth={1920}
            compositionHeight={780}
            style={{ width: "100%", height: "100%" }}
            autoPlay
            loop={false}
            controls={false}
          />
        </div>
      </div>
    </Slide>
  );
}
```

The Remotion composition itself uses `useCurrentFrame()` + `interpolate` + `spring` to choreograph beats:

```tsx
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

export const AlignmentFailureComposition = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // beat 1: instruction email lands (0–30 frames = 0–1s)
  const beat1Opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  // beat 2: 80 emails fill grid (45–135 frames = 1.5–4.5s, stagger by 1 frame each)
  // ...

  return <AbsoluteFill>...</AbsoluteFill>;
};
```

### Reusing codex A* compositions

Codex `/Users/kaneki/Projects/PPT/ai-club-talk codex/src/animations/A01_*.tsx` through `A13_*.tsx` provide 13 reference compositions. Patterns to copy:

- **A06_AlignmentFailure** — 5-scene narrative with email grid + counter + STOP-button pulsing red. Use for any "AI fails / safety incident" slide.
- The naming convention: `A<NN>_<Topic>.tsx`, exports a default component named `<Topic>Composition`.

When adapting:
1. Copy the file into `src/animations/A<NN>_<NewName>.tsx`
2. Rename the export
3. Swap `useVideoConfig()` `fps` if you want a different frame rate (codex uses 30)
4. Tune beats by changing the `interpolate` input ranges
5. Update colors to use your direction's `--accent` / `--ink` tokens (read from getComputedStyle in a useEffect, or pass via prop)

### Decision tree for "should this slide be Remotion?"

```
Is the animation > 5 seconds long?
├── No → motion
└── Yes →
    Does it have > 3 elements with timing dependencies?
    ├── No → motion (stagger + delays usually work)
    └── Yes →
        Does the user want frame-perfect / re-runnable timing?
        ├── No → motion (small accuracy loss vs simpler code is fine)
        └── Yes → Remotion
```

## Reduced motion

The base stylesheet (`templates/styles.template.css`) honors `prefers-reduced-motion`. motion-driven animations get duration → 0.01ms automatically. Remotion compositions don't auto-honor it — gate them in code:

```tsx
const reduced = useReducedMotion();
if (reduced) return <StaticFinalFrame />;
```
```

- [ ] **Step 19.2: Commit**

```bash
git add references/ANIMATIONS.md
git commit -m "references: add ANIMATIONS.md (motion recipes + Remotion decision tree + codex A* reuse)"
```

### Task 20: `references/ASSETS.md`

**Files:**
- Create: `references/ASSETS.md`

- [ ] **Step 20.1: Write the assets reference**

Write to `references/ASSETS.md`:

```markdown
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

- ❌ Live-URL references in slides (breaks offline single-HTML)
- ❌ Cropping faces / focal subjects to fit a layout slot
- ❌ Stock-photo "diverse-people-around-laptop" cliché
- ❌ Generic AI gradients with no subject
- ❌ Emoji as icon (the visual-reviewer rejects this on axis F)
```

- [ ] **Step 20.2: Commit**

```bash
git add references/ASSETS.md
git commit -m "references: add ASSETS.md (3 sources + naming / manifest / Imagen / sizing)"
```

---

## Phase 5 · Visual-reviewer subagent

### Task 21: `agents/visual-reviewer.md` (fork existing)

**Files:**
- Create: `agents/visual-reviewer.md`

Per spec §8 default, fork the existing `~/.claude/skills/remodeck/agents/visual-reviewer.md` (153 lines) with these adjustments to fit the new workflow:

- Strip references to `outline.ts.designLanguage`, `manifest.design_language_source`, `style_descriptor` field-checks (the new spec doesn't formalize those — visual-reviewer instead reads the direction file + `docs/brainstorm/<topic>-spec.md` "Style descriptor" line)
- Keep the 6-axis rubric, 8-shot calibration, pair scoring, JSON output verbatim — these are the parts that matter
- Update axes D and E to reference `references/directions/<direction>.md` instead of `outline.ts`
- Update Step 1 to read `references/directions/<direction>.md` for the direction's mood/palette claims

- [ ] **Step 21.1: Write the forked subagent**

Write to `agents/visual-reviewer.md`:

```markdown
---
name: visual-reviewer
description: |
  Reviews rendered remodeck slide PNGs (1920×1080) for production readiness. Uses
  6-axis rubric (contrast / typography / proportion / direction-lock / asset / authenticity)
  with UICrit-style 8-shot calibration from qa-fixtures/ and pair-scoring (vs reference)
  instead of absolute-score thresholds. Cross-checks against the chosen direction
  preset (references/directions/<name>.md tokens + mood) and the project's
  Step 1 brainstorm spec. Spawn AFTER all slides are implemented and screenshots
  are captured. Output is a per-axis pair-scoring report with blocking issues and
  concrete revision actions. Verdict not "ship" → blocks done.
tools: Read, Bash, Glob
model: opus
---

You are the **visual-reviewer** for a remodeck project. You score rendered slide PNGs against approved references and against the project's chosen direction, with research-backed methodology.

## Methodology

1. **6-axis rubric** (not generic "looks good")
2. **8-shot calibration** — load `qa-fixtures/` references + failure examples first
3. **Pair scoring** — judge candidate vs nearest reference, NOT absolute 0–10

Vision-LLM exact-score accuracy is ~37% per [MLLM-as-UI-Judge](https://arxiv.org/html/2510.08783v1); pair scoring >85%. UICrit shows 8-shot in-context examples improve quality 55%.

## What you receive

- A slide ID (e.g. "P04") or "ALL"
- 1+ PNG files per slide (typically 1 frame, or 3 if animated: start / mid / end)
- The slide's prose spec from `docs/brainstorm/<topic>-spec.md` (the per-page block)
- The chosen direction: `references/directions/<direction>.md` (mood + token claims)
- Path to `qa-fixtures/` directory
- The project's `_manifest.json`

## Workflow

### Step 1 — Load calibration

```bash
ls qa-fixtures/*.png
cat qa-fixtures/meta.json
```

Read approved + failed examples. Identify 2–3 references most similar to candidate (by `tags` in `meta.json`).

### Step 2 — Load context

Read the candidate PNGs + the per-page prose spec + `references/directions/<direction>.md` + `_manifest.json`.

### Step 3 — Score 6 axes (pair scoring)

For each axis: **明显更好 / 相当 / 明显更差 / n/a**

| Axis | What you're judging |
|---|---|
| **A. Contrast** | Body text ≥ 4.5:1 WCAG AA against bg; large text (≥30px) ≥ 3:1; line-art / icons readable |
| **B. Typography hierarchy** | display vs body vs UI clearly distinguishable; weight/size/spacing contrast adequate; H1:body ratio ≥ 3:1; fonts match direction tokens (`--serif` for display, `--sans` for body, `--mono` for meta) |
| **C. Content proportion** | Negative space generous; no overpacking; ≥22px body @1080p; max ~3 semantic blocks per slide; gutter respected |
| **D. Direction lock** | Palette matches direction preset tokens — no hex outside declared `:root` block; mood matches direction file claim (e.g. magazine-monocle = refined beige; swiss-ikb = Klein blue rigor; editorial-dark-standard = warm umber + copper); ai-generated images visibly reflect the brainstorm's style descriptor |
| **E. Asset correctness** | Image not cropped (`contain` not `cover` on focal subjects); not over-scaled; occupies visual focus appropriately (≥20% of slide for hero); video plays; manifest entry exists for each image |
| **F. Authenticity / AI slop** | No placeholder / lorem / emoji-as-icon; no fabricated stats; no "AI sloppy" tells (over-symmetric layouts, generic blob shapes, randomly-floating UI chrome) |

### Step 4 — Output JSON

```json
{
  "slide_id": "P04",
  "frames_reviewed": ["P04-start.png", "P04-mid.png", "P04-end.png"],
  "references_used": ["qa-fixtures/swiss_ikb_stat_v3_approved.png"],
  "axis_A_contrast": {
    "rating": "相当",
    "reason": "Body text ink-on-paper measured ~7:1 from declared --ink/--bg tokens.",
    "actions": []
  },
  "axis_B_typography": {
    "rating": "明显更差",
    "reason": "H1 60px and body 30px give only 2:1 ratio. Reference has 4.3:1.",
    "actions": [
      "Bump P04 title to ~130px font-size",
      "OR drop body to 22px to widen ratio"
    ]
  },
  "axis_C_proportion": { "rating": "...", "reason": "...", "actions": [] },
  "axis_D_direction_lock": {
    "rating": "...",
    "reason": "Palette + mood vs references/directions/<direction>.md check.",
    "direction_match": "match | drift | conflict",
    "actions": []
  },
  "axis_E_asset": {
    "rating": "...",
    "reason": "...",
    "manifest_present": true,
    "actions": []
  },
  "axis_F_authenticity": { "rating": "...", "reason": "...", "actions": [] },
  "verdict": "iterate",
  "blocking_issues": ["axis_B: H1/body hierarchy too weak"],
  "summary": "Strong on color and proportion; typography hierarchy needs more contrast."
}
```

Append a short Markdown summary (3–5 lines max).

### Step 5 — Decision

- All ratings ≥ "相当" + no manifest issues + direction match → `verdict: "ship"`
- Any rating "明显更差" + non-asset issue → `verdict: "iterate"` + blocking_issues
- Asset-layer issue (image cropped / wrong image / placeholder / fabricated chart) → `verdict: "reshoot"`
- Direction conflict (`axis_D.direction_match == "conflict"`) → `verdict: "reshoot"` with note: "regenerate asset honoring direction tokens, or revise direction if change is intentional"
- Missing manifest entry → `verdict: "reshoot"` + note: "register asset in _manifest.json before re-spawning"

## Critical: be specific in actions

❌ "再调一下排版" — useless
❌ "字号偏小" — vague
✅ "axis_B: title at 60px and body at 30px give 2:1 — bump title to ~130px for 4.3:1 ratio matching qa-fixture P02."
✅ "axis_E: image `P05-hinton-portrait.jpg` positioned at right:128px occupies only 28% of slide. Move to center, scale to ~50% width via `width: 960; height: 540; objectFit: 'contain'`."

## Calibration anchors

When `qa-fixtures/` is empty or missing:
- **Refuse to score**
- Output `{"verdict": "blocked", "reason": "qa-fixtures/ has no approved references — add at least 3: 1 approved current best, 1 reference from the direction's archetype, 1 deliberately-bad failed example."}`

### Building qa-fixtures from scratch

If the project is new and has no approved slides yet, suggest the user populate `qa-fixtures/`:
1. One slide from the 3 representative slides approved in Step 3 (re-screenshot)
2. One archetype example from `references/directions/<direction>.md` if it links to canonical examples
3. One deliberately-bad AI-generated example labeled `failed`

Then re-spawn this agent.

## What you don't do

- ❌ Don't review the prose spec — that's done at Step 2 with the user
- ❌ Don't review code quality
- ❌ Don't fix the issue yourself — output actions, let the implementer apply
- ❌ Don't mention WCAG without computing actual contrast ratio
- ❌ Don't use absolute scoring — always pair-score vs `qa-fixtures/`

## Tone

Direct, specific, calibrated to references. Don't praise. Cite specific axes + frames + reference filenames. Cite the token names in actions (`--accent`, `--bg`) not raw hex values.
```

- [ ] **Step 21.2: Commit**

```bash
git add agents/visual-reviewer.md
git commit -m "agents: fork visual-reviewer (6-axis pair scoring, direction-aware D/E axes)"
```

---

## Phase 6 · SKILL.md (the orchestrator)

### Task 22: `SKILL.md`

**Files:**
- Create: `SKILL.md`

The skill's main file. Compact (~6KB) — points to references for details. Five workflow steps, each step's intro paragraph + the user-gate prompt + the reference link to expand.

- [ ] **Step 22.1: Write SKILL.md**

Write to `SKILL.md`:

````markdown
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
Step 3 ─ ✋ Gate A: 3 representative slides, user reviews in browser
Step 4 ─ Batch-generate remaining slides → spawn visual-reviewer
Step 5 ─ ✋ Gate B: user says "bundle" → run make-single-html.mjs
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

## Step 3 · 3 representative slides ✋ Gate A

Pick 3 slides from the outline that span the typology:
1. **P01 cover** — direction's headline / chrome feel
2. **A high-density mid-deck slide** — stat row, image-split, or Remotion-heavy
3. **A quote or closing slide** — quiet typography contrast

Implement these 3 only. Write them at `src/slides/P01_*.tsx`, `src/slides/P<NN>_*.tsx`, etc. Update `src/slides/index.ts` to export them.

`npm run dev` is already running. Open `?slide=1`, `?slide=2`, `?slide=3`. **Tell the user the URLs** and ask them to review.

If user wants changes: revise the prose spec AND the 3 slides. Iterate until user approves all 3.

✋ **DO NOT proceed to Step 4 without explicit user approval.**

## Step 4 · Batch-generate remaining slides

After Gate A, build out every remaining slide from the prose spec. Each slide gets a file at `src/slides/P<NN>_<name>.tsx`. Update `src/slides/index.ts` to import and export them in order.

For animation-heavy slides, use `references/ANIMATIONS.md` to decide motion vs Remotion. If Remotion, copy a codex `A*` composition (from `/Users/kaneki/Projects/PPT/ai-club-talk codex/src/animations/`) into `src/animations/` and adapt.

After all slides exist:

1. **User reviews in browser** — they walk through all slides at `localhost:5173/?slide=1` and report issues.
2. **Spawn visual-reviewer** subagent (see `agents/visual-reviewer.md`):
   - User screenshots each slide at 1920×1080 (cmd+shift+4 area capture, or `?export=1` flag if implemented) → save to `qa-fixtures/` plus the slide files to review
   - Pass each PNG to the subagent along with the slide's prose spec, the direction file, and `_manifest.json`
3. **Apply reviewer's blocking_issues actions**, re-screenshot, re-spawn until verdict = "ship" for every slide

✋ **DO NOT proceed to Step 5 without explicit user request to bundle.**

## Step 5 · Bundle to portable HTML ✋ Gate B

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
````

- [ ] **Step 22.2: Verify file size is approximately 6KB**

Run: `wc -c SKILL.md`
Expected: ~5500–7500 bytes (~6KB target per spec).

- [ ] **Step 22.3: Commit**

```bash
git add SKILL.md
git commit -m "skill: add SKILL.md (5-step orchestrator with 2 user gates)"
```

---

## Phase 7 · Install + smoke test

### Task 23: Back up + install skill to `~/.claude/skills/remodeck/`

**Files:**
- Modify: `~/.claude/skills/remodeck/` (replaced wholesale; backed up first)

- [ ] **Step 23.1: Back up the existing skill**

Run: `mv ~/.claude/skills/remodeck ~/.claude/skills/remodeck.backup-2026-05-13 && ls -la ~/.claude/skills/remodeck.backup-2026-05-13/`
Expected: existing files listed; the directory has been renamed.

- [ ] **Step 23.2: Symlink the repo into the skill directory**

Run: `ln -snf /Users/kaneki/Projects/PPT/Skills ~/.claude/skills/remodeck && ls -la ~/.claude/skills/remodeck/`
Expected: symlink resolves, `SKILL.md` / `agents/` / `references/` / `templates/` visible.

- [ ] **Step 23.3: Verify the skill loads in Claude Code**

In a fresh Claude Code session (or via subagent dispatch), check whether the skill is discoverable. If running from this session, you can simply confirm structure:

Run: `[ -f ~/.claude/skills/remodeck/SKILL.md ] && head -3 ~/.claude/skills/remodeck/SKILL.md`
Expected: prints the `---` + `name: remodeck` + `description:` lines from the SKILL.md frontmatter.

### Task 24: End-to-end smoke test

**Files:**
- Create (temporary): `/tmp/remodeck-smoke/`

Verify a fresh user can: pick `swiss-ikb` direction, bootstrap, build, bundle to portable HTML. This catches template/script bugs.

- [ ] **Step 24.1: Run the bootstrap manually in /tmp**

```bash
cd /tmp && rm -rf remodeck-smoke
SKILL=~/.claude/skills/remodeck
TOPIC=remodeck-smoke
PRESET=swiss-ikb

npm create vite@latest "$TOPIC" -- --template react-ts
cd "$TOPIC"
mkdir -p src/slides src/animations src/deck src/styles public/images public/videos assets docs/brainstorm scripts exports qa-fixtures

sed "s/__TOPIC__/$TOPIC/g" "$SKILL/templates/package.template.json" > package.json
sed "s/__TOPIC__/$TOPIC/g" "$SKILL/templates/index.template.html" > index.html
sed "s/__TOPIC__/$TOPIC/g" "$SKILL/templates/make-single-html.template.mjs" > scripts/make-single-html.mjs

cp "$SKILL/templates/vite.config.template.ts" vite.config.ts
cp "$SKILL/templates/tsconfig.template.json" tsconfig.json
cp "$SKILL/templates/main.template.tsx" src/main.tsx
cp "$SKILL/templates/App.template.tsx" src/App.tsx
cp "$SKILL/templates/DeckStage.template.tsx" src/deck/DeckStage.tsx
cp "$SKILL/templates/Slide.template.tsx" src/deck/Slide.tsx
cp "$SKILL/templates/animationBus.template.ts" src/deck/animationBus.ts
cp "$SKILL/templates/styles.template.css" src/styles/global.css
cp "$SKILL/templates/_tokens/$PRESET.template.css" src/styles/tokens.css

echo "export const slides = [] as const;" > src/slides/index.ts
echo "{}" > assets/_manifest.json

npm install
```

Expected: `npm install` completes without errors (warnings OK).

- [ ] **Step 24.2: Add a dummy slide so the build has something to render**

Write to `/tmp/remodeck-smoke/src/slides/P01_Smoke.tsx`:

```tsx
import Slide from "../deck/Slide";

export default function P01_Smoke() {
  return (
    <Slide showHeader showFooter name="Smoke Test" date="2026-05-13">
      <div style={{ position: "absolute", left: 96, top: 480, fontSize: 220, fontWeight: 700, fontFamily: "var(--sans)" }}>
        Smoke
      </div>
    </Slide>
  );
}
```

Update `/tmp/remodeck-smoke/src/slides/index.ts`:

```ts
import P01_Smoke from "./P01_Smoke";
export const slides = [P01_Smoke] as const;
```

- [ ] **Step 24.3: Run the build**

```bash
cd /tmp/remodeck-smoke && npm run build
```

Expected: dist/ directory created; `dist/index.html` exists; no TypeScript errors.

- [ ] **Step 24.4: Run the bundle**

```bash
cd /tmp/remodeck-smoke && npm run bundle
```

Expected: `exports/remodeck-smoke-single-file.html` exists; stdout reports `Single file HTML: ...`, `Size: ...`, `Embedded assets: 0`.

- [ ] **Step 24.5: Sanity-check the single HTML opens**

```bash
open /tmp/remodeck-smoke/exports/remodeck-smoke-single-file.html
```

Expected: browser shows the "Smoke" headline on a swiss-ikb cream background with HUD `01 / 01` bottom-right. ← → keys do nothing (only 1 slide). Close browser when verified.

- [ ] **Step 24.6: Clean up smoke test**

```bash
rm -rf /tmp/remodeck-smoke
```

- [ ] **Step 24.7: Commit a CHANGELOG entry noting smoke test passed**

(No code change; document the smoke result so future readers know the pipeline was tested.)

Append to `README.md`:

```markdown

## Verified pipeline

Smoke-tested 2026-05-13: bootstrap → build → bundle on swiss-ikb preset produces a working single-file HTML with embedded styles + module.
```

Run:

```bash
git add README.md
git commit -m "docs: log smoke test result (swiss-ikb bootstrap → bundle works end-to-end)"
```

- [ ] **Step 24.8: Push final state**

```bash
git push
```

Expected: branch `main` up to date with `origin/main`.

---

## Self-review (do this after the last task)

After completing all 24 tasks, run through this checklist before declaring the plan done:

**1. Spec coverage** — each spec section maps to at least one task:
- §0 Motivation → addressed implicitly by the whole rewrite (no task needed)
- §1 Workflow 5 steps → Task 22 (SKILL.md sections), Task 16 (Step 1 BRAINSTORM), Task 17 (Step 2 SPEC), Task 21 (Step 4 visual-reviewer), Task 11 (Step 5 bundle script)
- §2 Per-page prose format → Task 17 (SPEC.md)
- §3 Direction system → Tasks 13–15 (3 directions)
- §4.1 Skill layout → Tasks 1, 22 (README + SKILL), Tasks 13–21 (everything in references / agents)
- §4.2 Bootstrap → Task 22 step 22.1 (the bash block embedded in SKILL.md)
- §4.3 Build gate → Task 11 (make-single-html.template.mjs)
- §5 Cutoff → Task 22 SKILL.md "Scope cutoff" table
- §6 Diff vs current → addressed by removing plan-checker/design-extractor/deck-brainstormer (not creating them); spec §6 is descriptive, no implementation
- §7 References detail → Tasks 16–21 + 13–15 (every reference doc + direction doc covers the listed content)
- §8 Plan-stage decisions → Task 11 (codex consolidation), Tasks 13–15 (className recipes per spec default), Task 21 (fork visual-reviewer), Task 16 (outline arc opt-in only)

**2. Placeholder scan** — every step contains real content; no TBD / TODO / "implement later" / "appropriate error handling" / "tests for the above" without code.

**3. Type consistency** — `slides` export is consistently `as const`; `AnimationHandler` type identical in template and reference; `Slide` props identical between Task 9 and Task 18.

**4. Path consistency** — `<topic>`, `<PRESET>`, `__TOPIC__` slot names consistent across SKILL.md / templates / smoke test.

If any issue: fix inline and re-run this checklist for that section only.
