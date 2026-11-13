import { isFilled } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import Canvas from "./Canvas";

/**
 * "Behind the Scenes": a draggable board of photos behind a big title. Desktop only (hidden ≤1180px, like live).
 *
 * @typedef {import("@prismicio/client").Content.BehindTheScenesSlice} BehindTheScenesSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<BehindTheScenesSlice>} BehindTheScenesProps
 * @type {import("react").FC<BehindTheScenesProps>}
 */
const BehindTheScenes = ({ slice }) => {
	const photos = slice.primary.photos.filter((p) => isFilled.image(p.image));

	return (
		<section
			data-slice-type={slice.slice_type}
			data-slice-variation={slice.variation}
			className="relative mt-[2em] flex h-[60em] w-full items-center justify-center text-[1vw] max-[1180px]:hidden"
		>
			<div className="relative h-full w-[96%] overflow-hidden border-y border-black">
				<Canvas>
					{/* Sits at the board's centre, so it starts mid-frame and moves with the board when dragged. */}
					<h2
						data-title
						className="absolute top-1/2 left-1/2 z-10 -translate-1/2 text-center text-[6.25em] whitespace-nowrap font-normal text-white select-none"
					>
						<span className="bg-black px-[8px]">Behind</span>
						<br />
						<span className="bg-black px-[8px]">
							<span className="font-haffer italic">the </span>Scenes
						</span>
					</h2>
					{photos.map((p, i) => (
						<figure key={i} data-photo className="invisible absolute scale-0 overflow-hidden">
							<PrismicNextImage field={p.image} alt="" sizes="40vw" className="size-full object-cover" draggable={false} />
						</figure>
					))}
				</Canvas>
			</div>
		</section>
	);
};

export default BehindTheScenes;
