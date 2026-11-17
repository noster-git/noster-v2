import { PrismicRichText } from "@prismicio/react";
import Reveal from "@/components/Reveal";
import SectionLabel from "@/components/SectionLabel";

/**
 * "The project", on the stone band. Desk: a sidebar in columns 1–3 with the indexed label and the
 * label/value details (Client, Sector, …) stacked under it, held in view while the description scrolls;
 * the description in columns 4–10 at a reading measure (about 65 characters a line). Compact layouts put
 * the description first, then the details two to a row.
 * As the section scrolls in (Reveal): the label fades up, the details fade up one after another, then the
 * description rises line by line.
 *
 * @typedef {import("@prismicio/client").Content.ProjectBriefSlice} ProjectBriefSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<ProjectBriefSlice>} ProjectBriefProps
 * @type {import("react").FC<ProjectBriefProps>}
 */
const ProjectBrief = ({ slice }) => (
	<Reveal data-slice-type={slice.slice_type} data-slice-variation={slice.variation} className="grid-site bg-stone px-m pt-8 pb-10">
		{/* Compact: `contents`, so the label and details sit on the page grid themselves (details last). */}
		<div className="contents desk:sticky desk:top-nav desk:col-span-3 desk:block desk:self-start">
			<SectionLabel as="h2" data-reveal className="col-span-5 mb-3 desk:mb-4">
				The project
			</SectionLabel>
			<dl className="order-last col-span-5 mt-5 grid grid-cols-2 gap-x-g gap-y-2 desk:mt-0 desk:grid-cols-1 desk:pr-4">
				{slice.primary.details.map((item, i) => (
					<div key={i} data-reveal className="desk:border-t desk:border-rule desk:pt-[0.5em]">
						<dt className="text-muted">{item.label}</dt>
						<dd className="whitespace-pre-line">{item.value}</dd>
					</div>
				))}
			</dl>
		</div>
		<div className="col-span-5 desk:col-span-7">
			<div data-reveal="lines" className="max-w-brief text-brief text-pretty [&>p+p]:mt-[1em]">
				<PrismicRichText field={slice.primary.description} />
			</div>
		</div>
	</Reveal>
);

export default ProjectBrief;
