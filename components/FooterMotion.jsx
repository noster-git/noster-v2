"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { EASE, lineRise, reveal } from "@/lib/motion";
import { ready } from "@/lib/intro";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/**
 * The <footer> element and its entrance, played once when its top reaches 70% of the screen:
 * - the NOSTER wordmark [data-footer-mark] rises out of its mask (1.4s);
 * - the rules [data-rule] draw left → right, 0.1s apart;
 * - the title [data-split] rises line by line (lineRise);
 * - everything marked [data-fade] fades and lifts in (reveal).
 * Start states are held by CSS (.js-anim, globals.css), so nothing flashes; without JS or with reduced
 * motion everything is simply there.
 */
export default function FooterMotion({ className = "", children }) {
	const scope = useRef(null);

	useGSAP(
		() => {
			if (!document.documentElement.classList.contains("js-anim")) return;
			const el = scope.current;
			// Built as soon as the fonts are in (not in the frame the curtain lifts); plays once in view and
			// the entrances are released.
			let split;
			let trigger;
			let live = true;
			document.fonts.ready.then(() => {
				if (!live || !el.isConnected) return;
				const q = (sel) => gsap.utils.toArray(sel, el);
				const tl = gsap.timeline({ paused: true });

				tl.fromTo(q("[data-footer-mark]"), { y: 0, yPercent: 100 }, { yPercent: 0, duration: 1.4, ease: EASE }, 0);
				tl.fromTo(q("[data-rule]"), { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: "expo.inOut", stagger: 0.1 }, 0.15);

				const heading = el.querySelector("[data-split]");
				if (heading) {
					split = SplitText.create(heading, { type: "lines", mask: "lines" });
					gsap.set(heading, { autoAlpha: 1 });
					gsap.set(split.lines, lineRise.from);
					tl.to(split.lines, lineRise.to, 0.35);
				}

				tl.fromTo(q("[data-fade]"), reveal.from, reveal.to, 0.5);

				trigger = ScrollTrigger.create({ trigger: el, start: "top 70%", once: true, onEnter: () => ready().then(() => live && tl.play()) });
			});
			return () => {
				live = false;
				trigger?.kill();
				split?.revert();
			};
		},
		{ scope },
	);

	return (
		<footer ref={scope} className={className}>
			{children}
		</footer>
	);
}
