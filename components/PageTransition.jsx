"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import { holdEntrances } from "@/lib/intro";

const COVER_S = 0.7; // veil rises over the page
const LIFT_S = 0.9; // veil lifts off the new page
const MAX_WAIT_MS = 4000; // longest the veil stays down waiting for the new page

/**
 * Seamless page-to-page transitions for every internal link except project photos (those grow into
 * the project hero: components/ProjectTransition.jsx).
 *
 *   click   → a white veil rises from the bottom over the page (0.7s expo.inOut) while the page eases up
 *   covered → the route changes underneath, scroll goes to the top
 *   arrived → the veil lifts off the top (0.9s expo.inOut) and the new page's own entrances play as it
 *             is revealed (they wait on lib/intro → ready(), held while the veil is down)
 *
 * Links are caught in the capture phase on window, before Next's <Link> handles them, so this covers
 * every link on the site (CMS links included) without wiring each one. Modified clicks, new tabs,
 * downloads, hashes, mail/tel, other sites and the current page navigate normally. Back/forward are
 * instant (the browser restores those), and the new page's entrances still play.
 */
export default function PageTransition() {
	const router = useRouter();
	const pathname = usePathname();
	const lenis = useLenis();
	const veil = useRef(null);
	const pending = useRef(null); // { path, release } while a transition is running

	// Let the new page's entrances go and lift the veil off it (once per transition).
	const lift = useCallback(() => {
		const p = pending.current;
		if (!p) return;
		pending.current = null;
		gsap.set("[data-page]", { clearProps: "transform,opacity,visibility" });
		p.release();
		gsap.fromTo(
			veil.current,
			{ clipPath: "inset(0% 0% 0% 0%)" },
			{ clipPath: "inset(0% 0% 100% 0%)", duration: LIFT_S, ease: "expo.inOut", onComplete: () => gsap.set(veil.current, { display: "none" }) },
		);
	}, []);

	useEffect(() => {
		const onClick = (e) => {
			if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
			const a = e.target.closest?.("a[href]");
			if (!a || a.target === "_blank" || a.hasAttribute("download") || a.hasAttribute("data-card-media")) return;
			const url = new URL(a.href, location.href);
			if (url.origin !== location.origin || url.pathname === location.pathname) return; // other site, or same page (#hash)
			if (!document.documentElement.classList.contains("js-anim") || pending.current || !veil.current) return;

			e.preventDefault();
			e.stopPropagation(); // Next's <Link> would navigate straight away
			const href = url.pathname + url.search + url.hash;
			router.prefetch(href);
			const p = { path: url.pathname, release: holdEntrances() };
			pending.current = p;
			lenis?.stop();

			gsap.timeline({
				onComplete: () => {
					lenis?.start();
					lenis?.scrollTo(0, { immediate: true, force: true });
					window.scrollTo(0, 0);
					router.push(href, { scroll: false });
					setTimeout(() => pending.current === p && lift(), MAX_WAIT_MS); // never leave the veil down
				},
			})
				.set(veil.current, { display: "block" })
				.fromTo(veil.current, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: COVER_S, ease: "expo.inOut" }, 0)
				.to("[data-page]", { y: -60, autoAlpha: 0.4, duration: COVER_S, ease: "expo.inOut" }, 0);
		};
		window.addEventListener("click", onClick, true);
		return () => window.removeEventListener("click", onClick, true);
	}, [router, lenis, lift]);

	// The new page has rendered under the veil: two frames later (painted, fonts settled), reveal it.
	useEffect(() => {
		if (pending.current?.path === pathname) requestAnimationFrame(() => requestAnimationFrame(lift));
	}, [pathname, lift]);

	return <div ref={veil} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[900] hidden bg-white" />;
}
