import { PrismicRichText } from "@prismicio/react";

/**
 * "The Project" description on the left, label/value details (Client, Sector, …) in two columns on the right.
 * Live values: 1vw font (1.4vw tablet, 3vw phone); description 1.1em, 144% line height, -0.352px tracking.
 *
 * @typedef {import("@prismicio/client").Content.ProjectBriefSlice} ProjectBriefSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<ProjectBriefSlice>} ProjectBriefProps
 * @type {import("react").FC<ProjectBriefProps>}
 */
const ProjectBrief = ({ slice }) => (
	<section
		data-slice-type={slice.slice_type}
		data-slice-variation={slice.variation}
		className="flex flex-col px-[2vw] pt-[5vw] pb-[6vw] text-[3vw] md:flex-row md:items-start md:justify-between md:pt-[2vw] md:pb-[4vw] md:text-[1.4vw] lg:text-[1vw]"
	>
		<div className="md:w-[54%]">
			<p className="text-[1.1em]">The Project</p>
			<div className="pt-[1em] pb-[2em] md:pb-0">
				<div className="w-[85%] text-[1.1em] leading-[144%] tracking-[-0.352px]">
					<PrismicRichText field={slice.primary.description} />
				</div>
			</div>
		</div>
		<dl className="mt-[1em] flex flex-wrap items-start justify-between md:mt-0 md:w-[45.75%]">
			{slice.primary.details.map((item, i) => (
				<div key={i} className="mt-[2.5em] w-[45%] md:w-[42%]">
					<dt className="text-[0.8em] text-[#31331B]">{item.label}</dt>
					<dd className="w-[90%] pt-[0.5em]">{item.value}</dd>
				</div>
			))}
		</dl>
	</section>
);

export default ProjectBrief;
