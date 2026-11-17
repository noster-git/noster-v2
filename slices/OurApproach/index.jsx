import { asText } from "@prismicio/client";
import Reveal from "@/components/Reveal";
import SectionLabel from "@/components/SectionLabel";

/**
 * The description as plain text: its opening sentence (the statement), then the rest as paragraphs.
 * Blank lines in the text count as paragraph breaks too, as editors often write them inside one block.
 */
function split(description) {
	const [first = "", ...paragraphs] = asText(description, { separator: "\n\n" })
		.split(/\n\s*\n/)
		.map((p) => p.trim())
		.filter(Boolean);
	const [statement, ...sentences] = first.split(/(?<=[.!?])\s+/);
	const rest = sentences.join(" ");
	return { statement, paragraphs: rest ? [rest, ...paragraphs] : paragraphs };
}

/**
 * "Our Approach", on the stone band. Desk: the indexed label in columns 1–3, held in view while the text
 * scrolls; the opening sentence as a statement at title size across columns 4–10; the rest of the text
 * smaller, in columns 6–10 under it. Compact layouts stack them.
 *
 * @typedef {import("@prismicio/client").Content.OurApproachSlice} OurApproachSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<OurApproachSlice>} OurApproachProps
 * @type {import("react").FC<OurApproachProps>}
 */
const OurApproach = ({ slice }) => {
	const { statement, paragraphs } = split(slice.primary.description);

	return (
		<Reveal data-slice-type={slice.slice_type} data-slice-variation={slice.variation} className="grid-site bg-stone px-m pt-8 pb-10">
			<SectionLabel as="h2" data-reveal className="col-span-5 mb-3 self-start desk:sticky desk:top-nav desk:col-span-3 desk:mb-0">
				{asText(slice.primary.title)}
			</SectionLabel>
			<div className="col-span-5 desk:col-span-7">
				{statement && (
					<p data-reveal="lines" className="text-title">
						{statement}
					</p>
				)}
				{paragraphs.length > 0 && (
					// Columns 6–10 of the page grid: the 7 columns of this side, from its third.
					<div className="mt-5 grid grid-cols-5 gap-x-g desk:mt-8 desk:grid-cols-7">
						<div data-reveal="lines" className="col-span-5 text-brief text-pretty desk:col-start-3 [&>p+p]:mt-[1em]">
							{paragraphs.map((p, i) => (
								<p key={i}>{p}</p>
							))}
						</div>
					</div>
				)}
			</div>
		</Reveal>
	);
};

export default OurApproach;
