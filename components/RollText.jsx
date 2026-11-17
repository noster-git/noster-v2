/**
 * Text whose letters roll up to a copy when the nearest `motion-host` is hovered or focused
 * (globals.css → .roll). Screen readers get the plain text once. Each letter is in the markup once: the
 * copy it rolls up to is drawn by CSS from data-c.
 *
 * `truncate`: a name too long for its box ends in an ellipsis. The letters are laid out as a line of text
 * (a block, not the usual inline-flex row), so the browser can cut it at the last whole letter that fits.
 */
export default function RollText({ children, truncate = false }) {
	const text = String(children ?? "");
	return (
		<>
			<span className="sr-only">{text}</span>
			<span aria-hidden="true" className={truncate ? "roll block! truncate" : "roll"}>
				{[...text].map((c, i) => (
					<span key={i} className="roll-letter" style={{ "--i": i }}>
						<span data-c={c}>{c}</span>
					</span>
				))}
			</span>
		</>
	);
}
