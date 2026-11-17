import { hasImage } from "@/lib/sanity/image";
import { item } from "@/lib/sanity/edit";
import Reveal from "@/components/Reveal";
import SectionLabel from "@/components/SectionLabel";
import LogoShuffle from "./LogoShuffle";
import { editProps } from "@/lib/sanity/edit-props";

/**
 * "Our Collaborators", on the stone band (it follows Our Approach, so the two read as one band): the indexed
 * label in columns 1–3, the logo row across columns 4–10 between two rules that draw in. Four logo slots
 * that swap in place (LogoShuffle); logos sized to the same area so they balance whatever their
 * upload (Large nudges one up), colour on hover. Compact layouts stack them.
 * In the studio's live preview each logo opens its entry in the list.
 *
 * @param {{ section: { title?: string | null, logos?: Array<{ _key: string, large?: boolean | null, logo?: import("@/lib/sanity/image").SanityImage | null }> | null }, edit: import("@/lib/sanity/edit").Edit }} props
 */
const Collaborators = ({ section, edit }) => {
	const logos = (section.logos ?? [])
		.filter((entry) => hasImage(entry.logo))
		// Only in the live preview: visitors' logos go to the page as they are.
		.map((entry) => (edit.doc ? { ...entry, edit: edit(["logos", item(entry._key)]) } : entry));

	return (
		<Reveal className="grid-site items-center bg-stone px-m pb-10" {...editProps(edit())}>
			<SectionLabel as="h2" data-reveal className="col-span-5 mb-3 desk:col-span-3 desk:mb-0">
				{section.title}
			</SectionLabel>
			<div className="relative col-span-5 desk:col-span-7">
				<span data-reveal="rule" aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-black/15" />
				{/* Stone here too: the reveal's opacity isolates this box, so the logos' multiply blend (which
				    drops their white backgrounds) only sees what is inside it. */}
				<div data-reveal className="bg-stone">
					<LogoShuffle logos={logos} />
				</div>
				<span data-reveal="rule" aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-black/15" />
			</div>
		</Reveal>
	);
};

export default Collaborators;
