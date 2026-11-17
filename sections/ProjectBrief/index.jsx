import { stegaClean } from "next-sanity";
import Reveal from "@/components/Reveal";
import SectionLabel from "@/components/SectionLabel";
import RichText from "@/components/RichText";
import Ordered from "@/components/Ordered";
import { item, scope } from "@/lib/sanity/edit";
import { editProps } from "@/lib/sanity/edit-props";

/**
 * "The project", on the stone band. Desk: a sidebar in columns 1–3 with the indexed label and the
 * label/value details (Client, Sector, …) stacked under it, held in view while the description scrolls;
 * the description in columns 4–10 at a reading measure (about 65 characters a line). Compact layouts put
 * the description first, then the details two to a row.
 * As the section scrolls in (Reveal): the label fades up, the details fade up one after another, then the
 * description rises line by line.
 * In the studio's live preview each detail opens as one entry (label and value), and can be dragged to a
 * new place in the list.
 *
 * @param {{ section: { description?: Array<any> | null, details?: Array<{ _key: string, label?: string | null, value?: string | null }> | null }, edit: import("@/lib/sanity/edit").Edit }} props
 */
const ProjectBrief = ({ section, edit }) => {
	const details = scope(edit, "details");
	return (
		<Reveal className="grid-site bg-stone px-m pt-8 pb-10" {...editProps(edit())}>
			{/* Compact: `contents`, so the label and details sit on the page grid themselves (details last). */}
			<div className="contents desk:sticky desk:top-nav desk:col-span-3 desk:block desk:self-start">
				<SectionLabel as="h2" data-reveal className="col-span-5 mb-3 desk:mb-4">
					The project
				</SectionLabel>
				<dl className="order-last col-span-5 mt-5 grid grid-cols-2 gap-x-g gap-y-2 desk:mt-0 desk:grid-cols-1 desk:pr-4" {...editProps(details())}>
					<Ordered
						edit={details}
						items={(section.details ?? [])
							.filter((entry) => entry.label?.trim() && entry.value?.trim())
							.map((entry) => ({
								key: entry._key,
								node: (
									<div key={entry._key} data-reveal {...editProps(details(item(entry._key)))} className="desk:border-t desk:border-rule desk:pt-rule">
										<dt className="text-muted">{stegaClean(entry.label)}</dt>
										<dd className="whitespace-pre-line">{stegaClean(entry.value)}</dd>
									</div>
								),
							}))}
					/>
				</dl>
			</div>
			<div className="col-span-5 desk:col-span-7">
				<div data-reveal="lines" className="max-w-brief text-brief text-pretty [&>p+p]:mt-[1em]">
					<RichText value={section.description} />
				</div>
			</div>
		</Reveal>
	);
};

export default ProjectBrief;
