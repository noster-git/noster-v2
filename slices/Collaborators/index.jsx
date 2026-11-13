import { isFilled } from "@prismicio/client";
import { PrismicRichText } from "@prismicio/react";
import Reveal from "@/components/Reveal";
import LogoShuffle from "./LogoShuffle";

/**
 * "Our Collaborators": title + a row of logo slots that swap in place with a blur (LogoShuffle).
 * 1 slot phone, 2 tablet, 4 desktop; logos 22px tall compact, 30px desk (30 / 40px when Large), colour on hover.
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
			className="pt-6 pb-8"
		>
			<div data-reveal="lines" className="mb-4 px-m text-center desk:mb-6">
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
