"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { finishIntro, holdEntrances, shown, transitioning } from "@/lib/intro";
import { CURTAIN_HOLD_MS, CURTAIN_MS, REVEAL_AT, cover, lift } from "@/lib/curtain";

const WAIT_MS = 3000; // longest the curtain waits for the new page and its hero photo

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));
async function until(fn, ms) {
	const end = Date.now() + ms;
	while (!fn() && Date.now() < end) await sleep(16);
}

/**
 * Page-to-page transitions for every internal link except project cards (their photo grows into the
 * project hero: ProjectTransition). The same lime curtain as the page-load intro (lib/curtain.js):
 *
 *   click   the curtain wipes up over the page from below (0.7s), its wordmark in from a blur
 *   covered the route changes underneath
 *   ready   the new page is in and its hero photo decoded; the curtain holds (CURTAIN_HOLD_MS)
 *   lift    it wipes on up off the new page (0.7s); the page's entrances play as it is uncovered
 *           (ready(), lib/intro.js)
 *
 * Catches clicks on internal links before next/link does (window, capture phase): next/link handles the
 * click itself and cancels it, so a listener further down never sees it. Links to the page already open,
 * in-page anchors, new-tab and modified clicks, downloads and project cards (data-card-media) are left
 * alone. Without the curtain (reduced motion, no JS) links navigate normally.
 */
export default function PageTransition() {
	return (
		<>
			<CurtainLinks />
			<ScrollSync />
		</>
	);
}

function CurtainLinks() {
	const router = useRouter();
	const lenis = useLenis();

	useEffect(() => {
		const onClick = (e) => {
			if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
			const a = e.target?.closest?.("a[href]");
			if (!a || a.hasAttribute("data-card-media") || a.hasAttribute("download")) return;
			if (a.target && a.target !== "_self") return;
			const url = new URL(a.href, location.href);
			if (url.origin !== location.origin) return;
			if (url.pathname === location.pathname && url.search === location.search) return;
			const root = document.documentElement;
			const curtain = document.querySelector("[data-curtain]");
			if (!curtain || !root.classList.contains("js-anim")) return;
			e.preventDefault();
			// One at a time: not while a page change or project open runs, nor under the load curtain.
			if (transitioning() || !root.classList.contains("intro-skip")) return;

			const href = url.pathname + url.search + url.hash;
			const from = location.pathname;
			root.dataset.transition = "";
			router.prefetch(href);
			lenis?.stop();
			holdEntrances(); // the new page's entrances wait for the curtain to lift
			curtain.getAnimations().forEach((an) => an.cancel());
			curtain.style.display = "block"; // replays the wordmark's blur-in
			const down = cover(curtain);
			let up = null;

			down.finished
				.then(async () => {
					router.push(href);
					// The new page (or wherever Back/Forward went meanwhile) is in.
					await until(() => location.pathname !== from, WAIT_MS);
					const hero = shown("[data-hero-media] img, [data-project-hero] img");
					if (hero?.decode) await Promise.race([hero.decode().catch(() => {}), sleep(WAIT_MS)]);
					await sleep(CURTAIN_HOLD_MS);
					up = lift(curtain);
					lenis?.start();
					await sleep(CURTAIN_MS * REVEAL_AT);
					finishIntro(); // entrances play as the page is uncovered
					await up.finished;
				})
				.catch(() => {})
				.finally(() => {
					finishIntro();
					down.cancel();
					up?.cancel();
					curtain.style.display = ""; // hidden again (globals.css: .intro-skip)
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
	}, [router, lenis]);

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
