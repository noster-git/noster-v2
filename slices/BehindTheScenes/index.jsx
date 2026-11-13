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
const BehindTheScenes = ({ slice, context }) => {
	const photos = slice.primary.photos.filter((p) => isFilled.image(p.image));

	return (
		<section
			data-slice-type={slice.slice_type}
			data-slice-variation={slice.variation}
			className="relative mt-2 h-[min(60vw,100svh)] w-full px-g text-[1vw] max-[1180px]:hidden"
		>
			{/* text-[1vw] above is the board's measuring unit (Canvas.jsx lays photos out in em), not a type size. */}
			<div className="relative h-full overflow-hidden rounded-media bg-black/[0.04]">
				<Canvas>
					{/* Sits at the board's centre, so it starts mid-frame and moves with the board when dragged. */}
					<h2
						data-title
						className="absolute top-1/2 left-1/2 z-10 -translate-1/2 text-center text-display whitespace-nowrap text-white select-none"
					>
						<span className="bg-black px-g">Behind</span>
						<br />
						<span className="bg-black px-g">
							the Scenes
						</span>
					</h2>
					{photos.map((p, i) => (
						<figure key={i} data-photo className="invisible absolute scale-0 overflow-hidden rounded-media">
							<PrismicNextImage
								field={{ ...p.image, alt: p.image.alt || `${context?.projectName ?? "Project"} behind the scenes, photo ${i + 1}` }}
								sizes="40vw"
								className="size-full object-cover"
								draggable={false}
							/>
						</figure>
					))}
				</Canvas>
			</div>
		</section>
	);
};

export default BehindTheScenes;
