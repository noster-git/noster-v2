"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";

// px scrolled before the nav switches to mix-blend-difference: 100 on phones (≤680px), 300 above
const blendAfter = () => (window.innerWidth <= 680 ? 100 : 300);

// Pages that start on white rather than a dark hero, so the nav inverts from the top.
const ALWAYS_BLEND = ["/works"];

/** The <nav> element: plain white at the top of the page, colour-inverting (mix-blend-difference) once scrolled. */
export default function NavBar({ className, children }) {
	const [scrolled, setScrolled] = useState(false);
	const pathname = usePathname();
	const blend = scrolled || ALWAYS_BLEND.includes(pathname);

	useLenis(({ scroll }) => setScrolled(scroll > blendAfter()));

	return <nav className={`${className} ${blend ? "mix-blend-difference" : ""}`}>{children}</nav>;
}
