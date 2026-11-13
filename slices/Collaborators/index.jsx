import { isFilled } from "@prismicio/client";
import { PrismicRichText } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";
import Reveal from "@/components/Reveal";

/**
 * "Our Collaborators": title + endless logo strip (two identical tracks sliding left, edges masked).
 * Sizes match the live site: section font-size 3vw phone / 1vw tablet+; logos 3.4em tall (4.6em when Large).
 *
 * @typedef {import("@prismicio/client").Content.CollaboratorsSlice} CollaboratorsSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<CollaboratorsSlice>} CollaboratorsProps
 * @type {import("react").FC<CollaboratorsProps>}
 */
const Collaborators = ({ slice }) => {
	const logos = slice.primary.logos.filter((item) => isFilled.image(item.logo));

	const track = (hidden) => (
		<div
			aria-hidden={hidden || undefined}
			className="inline-flex animate-[marquee_30s_linear_infinite] items-center justify-between motion-reduce:[animation-play-state:paused]"
		>
			{logos.map((item, i) => (
				<div key={i} className={`mx-[4em] ${item.large ? "h-[4.6em]" : "h-[3.4em]"}`}>
					<PrismicNextImage field={item.logo} fallbackAlt="" className="h-full w-auto max-w-none" />
				</div>
			))}
		</div>
	);

	return (
		<Reveal
			data-slice-type={slice.slice_type}
			data-slice-variation={slice.variation}
			className="px-[2vw] pt-[8vw] pb-[18vw] text-[3vw] md:px-0 md:pb-[12vw] md:text-[1vw]"
		>
			<div data-reveal className="mb-[6em] text-left md:mb-[12em] md:text-center">
				<PrismicRichText
					field={slice.primary.title}
					components={{
						heading2: ({ children }) => <h2 className="text-[2em] font-medium">{children}</h2>,
					}}
				/>
			</div>
			<div className="overflow-hidden whitespace-nowrap [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]">
				{track(false)}
				{track(true)}
			</div>
		</Reveal>
	);
};

export default Collaborators;
