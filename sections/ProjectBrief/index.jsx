import Reveal from "@/components/Reveal";
import SectionLabel from "@/components/SectionLabel";
import RichText from "@/components/RichText";
import { editProps } from "@/lib/sanity/edit-props";

/**
 * "The project", on the stone band. Desk: a sidebar in columns 1–3 with the indexed label and the
 * label/value facts (Client, Sector, …) stacked under it, held in view while the text scrolls; the text in
 * columns 4–10 at a reading measure (about 65 characters a line). Compact layouts put the text first, then
 * the facts two to a row.
 * As the section scrolls in (Reveal): the label fades up, the facts fade up one after another, then the
 * text rises line by line.
 * The facts are written from the project's details (lib/project-facts.js). In the studio's live preview each
 * opens the field it comes from, and the text opens its own.
 *
 * @param {{ summary?: Array<any> | null, facts: Array<{ label: string, value: string, field: string }>, edit: import("@/lib/sanity/edit").Edit }} props
 */
const ProjectBrief = ({ summary, facts, edit }) => (
	<Reveal className="grid-site bg-stone px-m pt-8 pb-10">
		{/* Compact: `contents`, so the label and facts sit on the page grid themselves (facts last). */}
		<div className="contents desk:sticky desk:top-nav desk:col-span-3 desk:block desk:self-start">
			<SectionLabel as="h2" data-reveal className="col-span-5 mb-3 desk:mb-4">
				The project
			</SectionLabel>
			<dl className="order-last col-span-5 mt-5 grid grid-cols-2 gap-x-g gap-y-2 desk:mt-0 desk:grid-cols-1 desk:pr-4">
				{facts.map((fact) => (
					<div key={fact.label} data-reveal {...editProps(edit(fact.field))} className="desk:border-t desk:border-rule desk:pt-rule">
						<dt className="text-muted">{fact.label}</dt>
						<dd className="whitespace-pre-line">{fact.value}</dd>
					</div>
				))}
			</dl>
		</div>
		<div className="col-span-5 desk:col-span-7">
			<div data-reveal="lines" {...editProps(edit("summary"))} className="max-w-brief text-brief text-pretty [&>p+p]:mt-[1em]">
				<RichText value={summary} />
			</div>
		</div>
	</Reveal>
);

export default ProjectBrief;
