import { isFilled } from "@prismicio/client";
import Img from "@/components/Img";
import SectionLabel from "@/components/SectionLabel";
import Canvas from "./Canvas";

/**
 * "Behind the Scenes": above 1180px, a draggable board of photos behind a big title; at 1180px and below,
 * a row of photos that swipes sideways.
 *
 * @typedef {import("@prismicio/client").Content.BehindTheScenesSlice} BehindTheScenesSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<BehindTheScenesSlice>} BehindTheScenesProps
 * @type {import("react").FC<BehindTheScenesProps>}
 */
const BehindTheScenes = ({ slice, context }) => {
	const photos = slice.primary.photos.filter((p) => isFilled.image(p.image));
	const alt = (p, i) => p.image.alt || `${context?.projectName ?? "Project"} behind the scenes, photo ${i + 1}`;

	return (
		<>
		{/* ≤1180px (touch and small screens): the indexed title, then the photos in a row that swipes sideways,
		    snapping photo by photo, the next one peeking in from the edge. */}
		<section aria-label="Behind the Scenes" className="mt-8 board:hidden">
			<SectionLabel as="h2" className="px-m">
				Behind the Scenes
			</SectionLabel>
			{/* Focusable, so the row also scrolls with the arrow keys; the ring sits inside, as the row runs edge to edge. */}
			<div
				tabIndex={0}
				role="region"
				aria-label="Behind the scenes photos"
				className="mt-3 snap-x snap-mandatory scroll-px-m overflow-x-auto overscroll-x-contain [scrollbar-width:none] focus-visible:-outline-offset-2"
			>
				<ul className="flex w-max gap-g px-m pb-2">
					{photos.map((p, i) => (
						<li key={i} className="relative aspect-[4/5] w-[70vw] shrink-0 snap-start overflow-hidden rounded-ui desk:w-[40vw]">
							<Img field={{ ...p.image, alt: alt(p, i) }} fill sizes="(max-width: 767px) 70vw, 40vw" className="object-cover" />
						</li>
					))}
				</ul>
			</div>
		</section>
		<section
			data-slice-type={slice.slice_type}
			data-slice-variation={slice.variation}
			className="relative mt-2 h-[min(60vw,100svh)] w-full px-m hidden text-[1vw] board:block"
		>
			{/* text-[1vw] above is the board's measuring unit (Canvas.jsx lays photos out in em), not a type size. */}
			<div className="relative h-full overflow-hidden rounded-ui bg-wash has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-(--ink)">
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
						<figure key={i} data-photo className="invisible absolute overflow-hidden rounded-ui">
							<Img
								field={{ ...p.image, alt: alt(p, i) }}
								sizes="40vw"
								className="size-full object-cover"
								draggable={false}
							/>
						</figure>
					))}
				</Canvas>
			</div>
		</section>
		</>
	);
};

export default BehindTheScenes;
