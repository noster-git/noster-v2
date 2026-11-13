// Shared motion. Every entrance on the site uses these, so the page moves as one.
// expo.out: a fast start that settles softly (cubic-bezier(0.16, 1, 0.3, 1) in CSS).

export const EASE = "expo.out";

/** Scroll reveal: fade and rise 32px, 1.1s, 0.08s between items (components/Reveal.jsx). */
export const reveal = { from: { autoAlpha: 0, y: 32 }, to: { autoAlpha: 1, y: 0, duration: 1.1, ease: EASE, stagger: 0.08 } };

/** Masked line rise: lines slide up out of their own clip (hero title, SplitText). */
export const lineRise = { from: { yPercent: 110 }, to: { yPercent: 0, duration: 1.2, ease: EASE, stagger: 0.09 } };
