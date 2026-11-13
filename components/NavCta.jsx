"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Pages that open on a full-screen hero (home, project pages): the button starts white there, so it
// doesn't flash black before the first check.
const startsOnHero = (path) => path === "/" || /^\/works\/[^/]+/.test(path);

/**
 * The top-right CTA, outside the nav's mix-blend: white while it sits over a hero ([data-nav-hero]),
 * black the moment any part of it leaves the hero (scrolled past, or a page without one).
 * Children: the link, styled with group-data-[on-hero]: for the white state.
 *
 * Cheap on scroll: the hero's span on the page and the button's span on screen are measured only when
 * they can change (load, page change, resize, the hero resizing); each scroll then just compares them
 * with scrollY, which never forces the browser to recalculate layout mid-frame.
 */
export default function NavCta({ children }) {
	const ref = useRef(null);
	const pathname = usePathname();
	const [onHero, setOnHero] = useState(() => startsOnHero(pathname));
	const spans = useRef(null); // { button: on screen, hero: in page coordinates (or null) }

	const update = useCallback(() => {
		const s = spans.current;
		if (!s) return;
		const y = window.scrollY;
		const on = s.hero !== null && s.hero.top <= y + s.button.top && s.hero.bottom >= y + s.button.bottom;
		setOnHero((prev) => (prev === on ? prev : on));
	}, []);

	useEffect(() => {
		const measure = () => {
			const el = ref.current;
			if (!el) return;
			const b = el.getBoundingClientRect();
			// The visible hero (the previous page can stay in the DOM, hidden, after a navigation).
			const y = window.scrollY;
			const h = [...document.querySelectorAll("[data-nav-hero]")].map((n) => n.getBoundingClientRect()).find((r) => r.height > 0);
			spans.current = { button: { top: b.top, bottom: b.bottom }, hero: h ? { top: h.top + y, bottom: h.bottom + y } : null };
			update();
		};
		measure();
		// After a navigation: once the new page has laid out, and again once the curtain has lifted.
		const t = setTimeout(measure, 100);
		const t2 = setTimeout(measure, 1200);
		const heroes = new ResizeObserver(measure);
		document.querySelectorAll("[data-nav-hero]").forEach((n) => heroes.observe(n));
		window.addEventListener("scroll", update, { passive: true }); // Lenis scrolls the window too
		window.addEventListener("resize", measure);
		return () => {
			clearTimeout(t);
			clearTimeout(t2);
			heroes.disconnect();
			window.removeEventListener("scroll", update);
			window.removeEventListener("resize", measure);
		};
	}, [update, pathname]);

	return (
		<div
			ref={ref}
			data-on-hero={onHero ? "" : undefined}
			// Same spot as the nav row.
			className="group fixed top-0 right-0 z-50 hidden px-m pt-[12px] desk:block"
		>
			{children}
		</div>
	);
}
