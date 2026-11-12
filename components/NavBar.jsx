"use client";

import { useState } from "react";
import { useLenis } from "lenis/react";

// px scrolled before the nav switches to mix-blend-difference: 100 on phones (≤680px), 300 above
const blendAfter = () => (window.innerWidth <= 680 ? 100 : 300);

/** The <nav> element: plain white at the top of the page, colour-inverting (mix-blend-difference) once scrolled. */
export default function NavBar({ className, children }) {
	const [blend, setBlend] = useState(false);

	useLenis(({ scroll }) => setBlend(scroll > blendAfter()));

	return <nav className={`${className} ${blend ? "mix-blend-difference" : ""}`}>{children}</nav>;
}
