"use client";

import { useEffect, useState } from "react";

/**
 * Compact-only CTA button, fixed 16px above the bottom of the screen (clear of the home indicator).
 * Fades out while the footer is on screen so it never covers the contact details.
 */
export default function MobileCta({ children }) {
	const [hidden, setHidden] = useState(false);

	useEffect(() => {
		const footer = document.querySelector("footer");
		if (!footer) return;
		const observer = new IntersectionObserver(([entry]) => setHidden(entry.isIntersecting), { threshold: 0.3 });
		observer.observe(footer);
		return () => observer.disconnect();
	}, []);

	return (
		<div
			inert={hidden}
			className={`fixed bottom-[calc(16px+env(safe-area-inset-bottom))] left-1/2 z-40 -translate-x-1/2 transition-opacity duration-500 ease-quart desk:hidden ${hidden ? "opacity-0" : "opacity-100"}`}
		>
			{children}
		</div>
	);
}
