/** Lucide "arrow-right" (ISC licence), inlined so the site needs no icon package. Sized by its parent. */
export function ArrowIcon({ className = "size-full" }) {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
			<path d="M5 12h14" />
			<path d="m12 5 7 7-7 7" />
		</svg>
	);
}

/** Lucide "corner-down-right" (ISC licence): the ↳ in front of project names. Sized by its parent. */
export function CornerIcon({ className = "size-full" }) {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
			<path d="m15 10 5 5-5 5" />
			<path d="M4 4v7a4 4 0 0 0 4 4h12" />
		</svg>
	);
}

/**
 * The site's arrow: 0.9em, follows the text colour. Inside a `motion-host` link it slides out to the
 * right and back in from the left on hover (globals.css → .arrow).
 */
export default function Arrow({ className = "" }) {
	return (
		<span aria-hidden="true" className={`arrow ${className}`}>
			<span>
				<ArrowIcon />
			</span>
			<span>
				<ArrowIcon />
			</span>
		</span>
	);
}
