import { isFilled } from "@prismicio/client";
import { PrismicRichText } from "@prismicio/react";
import Reveal from "@/components/Reveal";
import LogoShuffle from "./LogoShuffle";

/**
 * "Our Collaborators": title + a fixed row of logo slots that swap in place with a blur (LogoShuffle).
 * 3 slots compact, 6 desk; logos 22px tall compact, 30px desk (30 / 40px when Large), colour on hover.
 *
 * @typedef {import("@prismicio/client").Content.CollaboratorsSlice} CollaboratorsSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<CollaboratorsSlice>} CollaboratorsProps
 * @type {import("react").FC<CollaboratorsProps>}
 */
const Collaborators = ({ slice }) => {
	const logos = slice.primary.logos.filter((item) => isFilled.image(item.logo));

	return (
		<Reveal
			data-slice-type={slice.slice_type}
			data-slice-variation={slice.variation}
			className="pt-8 pb-12"
		>
			<div data-reveal className="mb-6 px-g text-center desk:mb-8">
				<div>
					<PrismicRichText
						field={slice.primary.title}
						components={{
							heading2: ({ children }) => <h2>{children}</h2>,
						}}
					/>
				</div>
			</div>
			<div data-reveal>
				<LogoShuffle logos={logos} />
			</div>
		</Reveal>
	);
};

export default Collaborators;
