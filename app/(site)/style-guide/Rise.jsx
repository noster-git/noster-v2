"use client";

import { useEffect, useRef, useState } from "react";
import { m } from "./motion";

/**
 * Reveals every [data-rise] child once the wrapper scrolls into view (CSS in motion.css).
 * Children are staggered 0.11s in groups of three. Renders as `as` (default section).
 */
export default function Rise({ as: Tag = "section", className = "", children, ...props }) {
	const ref = useRef(null);
	const [state, setState] = useState("");

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		el.querySelectorAll("[data-rise]").forEach((child, i) => child.style.setProperty("--d", `${(i % 3) * 0.11}s`));
		setState(m.ready);
		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				setState(`${m.ready} ${m.in}`);
				observer.disconnect();
			},
			{ rootMargin: "0px 0px -15% 0px" },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<Tag ref={ref} className={`${className} ${state}`} {...props}>
			{children}
		</Tag>
	);
}
