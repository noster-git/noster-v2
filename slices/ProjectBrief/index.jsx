import { PrismicRichText } from "@prismicio/react";
import Reveal from "@/components/Reveal";

/**
 * "The Project": a label in columns 1–3, the description as a lead statement across columns 4–10,
 * then the label/value details (Client, Sector, …) three to a row underneath (two on compact layouts).
 * Label, statement and details fade up in turn as the section scrolls in (Reveal).
 *
 * @typedef {import("@prismicio/client").Content.ProjectBriefSlice} ProjectBriefSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<ProjectBriefSlice>} ProjectBriefProps
 * @type {import("react").FC<ProjectBriefProps>}
 */
const ProjectBrief = ({ slice }) => (
	<Reveal data-slice-type={slice.slice_type} data-slice-variation={slice.variation} className="grid-site px-g pt-8 pb-8">
		<p data-reveal className="col-span-5 mb-2 uppercase desk:col-span-3 desk:mb-0">
			The Project
		</p>
		<div className="col-span-5 desk:col-span-7">
			<div data-reveal className="text-lead text-pretty [&>p+p]:mt-[1em]">
				<PrismicRichText field={slice.primary.description} />
			</div>
			<dl className="mt-4 grid grid-cols-2 gap-x-g gap-y-2 desk:grid-cols-3">
				{slice.primary.details.map((item, i) => (
					<div key={i} data-reveal>
						<dt className="text-muted">{item.label}</dt>
						<dd className="whitespace-pre-line">{item.value}</dd>
					</div>
				))}
			</dl>
		</div>
	</Reveal>
);

export default ProjectBrief;
