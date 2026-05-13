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
