import { stegaClean } from "@sanity/client/stega";
import { editProps } from "@/lib/sanity/edit-props";

/**
 * Text whose letters roll up to a copy when the nearest `motion-host` is hovered or focused
 * (globals.css → .roll). Screen readers get the plain text once. Each letter is in the markup once: the
 * copy it rolls up to is drawn by CSS from data-c.
 *
 * `truncate`: a name too long for its box ends in an ellipsis. The letters are laid out as a line of text
 * (a block, not the usual inline-flex row), so the browser can cut it at the last whole letter that fits.
 *
 * The text is shown without the click-to-edit markers the studio's live preview adds to content (they
 * would be split into letters too); `edit` puts the field it comes from on the visible letters instead, lifted
 * above the link's own hit area (.hit) so the pointer reaches them.
 *
 * @param {{ children?: import("react").ReactNode, truncate?: boolean, edit?: string }} props
 */
export default function RollText({ children, truncate = false, edit }) {
	const text = stegaClean(String(children ?? ""));
	return (
		<>
			<span className="sr-only">{text}</span>
			<span aria-hidden="true" {...editProps(edit)} className={`${truncate ? "roll block! truncate" : "roll"}${edit ? " relative z-1" : ""}`}>
				{[...text].map((c, i) => (
					<span key={i} className="roll-letter" style={{ "--i": i }}>
						<span data-c={c}>{c}</span>
					</span>
				))}
			</span>
		</>
	);
}
