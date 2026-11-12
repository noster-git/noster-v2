"use client";

import { useState } from "react";
import { useLenis } from "lenis/react";

const BLEND_AFTER = 300; // px scrolled before the nav switches to mix-blend-difference

/** The <nav> element: plain white at the top of the page, colour-inverting (mix-blend-difference) once scrolled. */
export default function NavBar({ className, children }) {
	const [blend, setBlend] = useState(false);

	useLenis(({ scroll }) => setBlend(scroll > BLEND_AFTER));

	return <nav className={`${className} ${blend ? "mix-blend-difference" : ""}`}>{children}</nav>;
}
