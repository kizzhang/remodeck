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
