"use client";

import { useEffect, useState } from "react";

/** Phone-only floating CTA pill. Fades out while the footer is on screen so it never covers the contact details. */
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
			className={`fixed bottom-[8%] left-1/2 z-40 -translate-x-1/2 rounded-full border border-black/17 bg-white p-[2vw] transition-opacity duration-500 ease-quart md:hidden ${hidden ? "opacity-0" : "opacity-100"}`}
		>
			{children}
		</div>
	);
}
