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
