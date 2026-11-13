"use client";

import { useEffect, useRef } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Keeps ScrollTrigger in step with Lenis' smoothed scroll position (must render inside ReactLenis).
function ScrollTriggerSync() {
  useLenis(ScrollTrigger.update);
  return null;
}

/**
 * Site-wide Lenis smooth scroll, driven by GSAP's ticker so scroll and animations share one frame loop.
 * lerp 0.075: each frame covers 7.5% of the remaining distance, a soft glide that settles in about a second.
 * Touch keeps the native scroll (Lenis default), so phones feel normal.
 */
export default function SmoothScroll({ children }) {
  const lenisRef = useRef(null);

  useEffect(() => {
    const update = (time) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(update);
  }, []);

  return (
    <ReactLenis root ref={lenisRef} options={{ autoRaf: false, lerp: 0.075, wheelMultiplier: 1, smoothWheel: true }}>
      <ScrollTriggerSync />
      {children}
    </ReactLenis>
  );
}
