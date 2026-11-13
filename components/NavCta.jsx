"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";

// Pages that open on a full-screen hero (home, project pages): the button starts white there, so it
// doesn't flash black before the first check.
const startsOnHero = (path) => path === "/" || /^\/works\/[^/]+/.test(path);

/**
 * The top-right CTA, outside the nav's mix-blend: white while it sits over a hero ([data-nav-hero]),
 * black the moment any part of it leaves the hero (scrolled past, or a page without one).
 * Children: the link, styled with group-data-[on-hero]: for the white state.
 */
export default function NavCta({ children }) {
	const ref = useRef(null);
	const pathname = usePathname();
	const [onHero, setOnHero] = useState(() => startsOnHero(pathname));

	const check = useCallback(() => {
		const el = ref.current;
		if (!el) return;
		const b = el.getBoundingClientRect();
		// The visible hero (the previous page can stay in the DOM, hidden, after a navigation).
		const hero = [...document.querySelectorAll("[data-nav-hero]")].map((h) => h.getBoundingClientRect()).find((r) => r.height > 0);
		setOnHero(!!hero && hero.top <= b.top && hero.bottom >= b.bottom);
	}, []);

	useLenis(check, [check]);
	useEffect(() => {
		check();
		const t = setTimeout(check, 100); // after a navigation, once the new page has laid out
		window.addEventListener("scroll", check, { passive: true });
		window.addEventListener("resize", check);
		return () => {
			clearTimeout(t);
			window.removeEventListener("scroll", check);
			window.removeEventListener("resize", check);
		};
	}, [check, pathname]);

	return (
		<div
			ref={ref}
			data-on-hero={onHero ? "" : undefined}
			// Same spot as the nav row.
			className="group fixed top-0 right-0 z-50 hidden px-g pt-[12px] text-nav-link desk:block"
		>
			{children}
		</div>
	);
}
