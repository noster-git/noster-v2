import { PrismicRichText } from "@prismicio/react";
import Reveal from "@/components/Reveal";

/**
 * "Our Approach": title left (55%), description right (45%); stacked on phones.
 * Sizes match the live site (section font-size 3vw / 1.6vw / 1vw, text 1.1em).
 *
 * @typedef {import("@prismicio/client").Content.OurApproachSlice} OurApproachSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<OurApproachSlice>} OurApproachProps
 * @type {import("react").FC<OurApproachProps>}
 */
const OurApproach = ({ slice }) => {
	return (
		<Reveal
			data-slice-type={slice.slice_type}
			data-slice-variation={slice.variation}
			className="bg-white font-haffer px-[3vw] pt-[8vw] pb-[4vw] text-[3vw] text-black md:px-[2vw] md:pt-[1.75vw] md:text-[1.6vw] lg:text-[1vw]"
		>
			<div className="flex flex-col items-start justify-between md:flex-row">
				<div data-reveal className="mb-[1em] w-full md:mb-0 md:w-[55%]">
					<PrismicRichText
						field={slice.primary.title}
						components={{
							heading2: ({ children }) => <h2 className="text-[1.1em] leading-[normal] font-normal">{children}</h2>,
						}}
					/>
				</div>
				<div data-reveal className="w-[90%] md:w-[45%]">
					<div className="w-[85%] text-[1.1em] leading-[1.44] tracking-[-0.022vw] [&>p+p]:mt-[1.44em]">
						<PrismicRichText field={slice.primary.description} />
					</div>
				</div>
			</div>
		</Reveal>
	);
};

export default OurApproach;
