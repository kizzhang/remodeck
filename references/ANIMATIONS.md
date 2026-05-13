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
