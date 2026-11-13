"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import { GlimmProvider, useGlimm } from "glimm/next";
import { CURTAIN_HOLD_MS, PAGE_SWEEP } from "@/lib/sweep";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { finishIntro, holdEntrances, shown, transitioning } from "@/lib/intro";

/**
 * Page changes and page loads share one transition: the lime curtain covers the page, then the glimm
 * sweep (lib/sweep.js → PAGE_SWEEP) rises over it and reveals the page behind the band. Loads: Intro.
 * Page changes: SweepLinks below. Project cards opt out (data-glimm-skip): their photo grows into the
 * project hero instead (ProjectTransition). Above the curtain (z 1000), so the sweep passes over it.
 */
export default function SiteSweep({ children }) {
	return (
		<GlimmProvider {...PAGE_SWEEP} zIndex={1100}>
			<SweepLinks />
			<ScrollSync />
			{children}
		</GlimmProvider>
	);
}

const WAIT_MS = 3000; // longest it waits for the new page and its hero photo

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));
async function until(fn, ms) {
	const end = Date.now() + ms;
	while (!fn() && Date.now() < end) await sleep(16);
}

/**
 * Page change, exactly as a page load (Intro):
 *   click   the lime curtain covers the page at once, its wordmark coming in from a blur; the new page
 *           loads underneath
 *   ready   the new page is in and its hero photo decoded, then the curtain holds (CURTAIN_HOLD_MS)
 *   reveal  the sweep rises over the curtain and reveals the new page; its entrances play as it passes
 *           (ready(), lib/intro.js)
 *
 * Catches clicks on internal links before next/link does (window, capture phase): next/link handles the
 * click itself and cancels it, so a listener further down never sees it. Links to the page already open,
 * in-page anchors, new-tab and modified clicks, downloads and data-glimm-skip links (project cards) are
 * left alone. Without the curtain (reduced motion, no JS) the sweep alone runs.
 */
function SweepLinks() {
	const router = useRouter();
	const lenis = useLenis();
	const { sweep } = useGlimm();

	useEffect(() => {
		const onClick = (e) => {
			if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
			const a = e.target?.closest?.("a[href]");
			if (!a || a.dataset.glimmSkip !== undefined || a.hasAttribute("download")) return;
			if (a.target && a.target !== "_self") return;
			const url = new URL(a.href, location.href);
			if (url.origin !== location.origin) return;
			if (url.pathname === location.pathname && url.search === location.search) return;
			e.preventDefault();
			const root = document.documentElement;
			const curtain = document.querySelector("[data-curtain]");
			const animated = curtain && root.classList.contains("js-anim");
			// One at a time: not while a page change or project open runs, nor under the load curtain.
			if (transitioning() || (animated && !root.classList.contains("intro-skip"))) return;
			const href = url.pathname + url.search + url.hash;
			if (!animated) return sweep(() => router.push(href));

			const from = location.pathname;
			root.dataset.transition = "";
			lenis?.stop();
			curtain.style.display = "block"; // replays the wordmark's blur-in
			holdEntrances(); // the new page's entrances wait for the reveal
			router.push(href);
			Promise.resolve()
				.then(async () => {
					// The new page (or wherever Back/Forward went meanwhile) is in.
					await until(() => location.pathname !== from, WAIT_MS);
					const hero = shown("[data-hero-media] img, [data-project-hero] img");
					if (hero?.decode) await Promise.race([hero.decode().catch(() => {}), sleep(WAIT_MS)]);
					await sleep(CURTAIN_HOLD_MS);
					const reveal = sweep(() => {
						curtain.style.display = "";
					});
					await reveal.midpoint;
				})
				.finally(() => {
					finishIntro(); // the new page's entrances play as it is revealed
					curtain.style.display = "";
					lenis?.start();
					delete root.dataset.transition;
					// The link that was clicked may now be hidden with the old page: start keyboard focus at the content.
					if (!document.activeElement || document.activeElement === document.body || !document.activeElement.checkVisibility()) {
						document.getElementById("main")?.focus({ preventScroll: true });
					}
				});
		};
		window.addEventListener("click", onClick, { capture: true });
		return () => window.removeEventListener("click", onClick, { capture: true });
	}, [router, sweep, lenis]);

	return null;
}

/**
 * After a page change Next scrolls the window to the top; bring Lenis' own position along with it, and
 * re-measure scroll triggers once the new page has laid out (the footer's, in the layout, was measured
 * on the page before).
 */
function ScrollSync() {
	const pathname = usePathname();
	const lenis = useLenis();
	useEffect(() => {
		lenis?.scrollTo(window.scrollY, { immediate: true, force: true });
		const id = requestAnimationFrame(() => ScrollTrigger.refresh());
		return () => cancelAnimationFrame(id);
	}, [pathname, lenis]);
	return null;
}
