/**
 * Text whose letters roll up to a copy when the nearest `motion-host` is hovered or focused
 * (globals.css → .roll). Screen readers get the plain text once.
 */
export default function RollText({ children }) {
	const text = String(children ?? "");
	return (
		<>
			<span className="sr-only">{text}</span>
			<span aria-hidden="true" className="roll">
				{[...text].map((c, i) => (
					<span key={i} className="roll-letter" style={{ "--i": i }}>
						<span>{c}</span>
						<span>{c}</span>
					</span>
				))}
			</span>
		</>
	);
}
