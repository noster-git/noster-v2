import { stegaClean } from "next-sanity";
import Reveal from "@/components/Reveal";
import SectionLabel from "@/components/SectionLabel";
import { editProps } from "@/lib/sanity/edit-props";

/**
 * The description: its opening sentence (the statement), then the rest as paragraphs, split at blank lines.
 */
function split(description) {
	const [first = "", ...paragraphs] = (description ?? "")
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
 * The description is split without its click-to-edit markers; in the studio's live preview the statement
 * and the paragraphs each open the description instead.
 *
 * @param {{ section: { title?: string | null, description?: string | null }, edit: import("@/lib/sanity/edit").Edit }} props
 */
const OurApproach = ({ section, edit }) => {
	const { statement, paragraphs } = split(stegaClean(section.description));

	return (
		<Reveal className="grid-site bg-stone px-m pt-8 pb-10" {...editProps(edit())}>
			<SectionLabel as="h2" data-reveal className="col-span-5 mb-3 self-start desk:sticky desk:top-nav desk:col-span-3 desk:mb-0">
				{section.title}
			</SectionLabel>
			<div className="col-span-5 desk:col-span-7">
				{statement && (
					<p data-reveal="lines" {...editProps(edit("description"))} className="text-title">
						{statement}
					</p>
				)}
				{paragraphs.length > 0 && (
					// Columns 6–10 of the page grid: the 7 columns of this side, from its third.
					<div className="mt-5 grid grid-cols-5 gap-x-g desk:mt-8 desk:grid-cols-7">
						<div data-reveal="lines" {...editProps(edit("description"))} className="col-span-5 text-brief text-pretty desk:col-start-3 [&>p+p]:mt-[1em]">
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
