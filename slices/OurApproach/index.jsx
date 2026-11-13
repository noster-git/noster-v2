import { PrismicRichText } from "@prismicio/react";
import Reveal from "@/components/Reveal";

/**
 * "Our Approach": the title as a label in columns 1–3, the description as a lead statement across
 * columns 4–10 (desk). Compact layouts stack them.
 *
 * @typedef {import("@prismicio/client").Content.OurApproachSlice} OurApproachSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<OurApproachSlice>} OurApproachProps
 * @type {import("react").FC<OurApproachProps>}
 */
const OurApproach = ({ slice }) => {
	return (
		<Reveal data-slice-type={slice.slice_type} data-slice-variation={slice.variation} className="grid-site px-g pt-8 pb-8">
			<div data-reveal className="col-span-5 mb-2 desk:col-span-3 desk:mb-0">
				<PrismicRichText
					field={slice.primary.title}
					components={{
						heading2: ({ children }) => <h2>{children}</h2>,
					}}
				/>
			</div>
			<div data-reveal className="col-span-5 desk:col-span-7">
				<div className="text-lead text-pretty [&>p+p]:mt-[1em]">
					<PrismicRichText field={slice.primary.description} />
				</div>
			</div>
		</Reveal>
	);
};

export default OurApproach;
