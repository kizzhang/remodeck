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
