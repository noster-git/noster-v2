import { stegaClean } from "next-sanity";
import Img from "@/components/Img";
import Parallax from "@/components/Parallax";
import TitleRise from "./TitleRise";
import { editProps } from "@/lib/sanity/edit-props";

/**
 * Project page hero: the project name in white at display size with its location under it, anchored bottom-left within the page margins like
 * the home hero's, over a darkened, edge-to-edge photo that drifts with scroll. Full screen on desk and half
 * the screen on phones (--hero-h).
 *
 * data-project-hero: the page-load curtain waits for this photo before it lifts (components/Intro.jsx).
 * In the studio's live preview the section (the photo with it) opens as a whole, so it can be dragged too;
 * the title opens its field and the location the brief's Location detail.
 *
 * @param {{ section: { title?: string | null, image?: import("@/lib/sanity/image").SanityImage | null }, context?: { location?: string, editLocation?: string }, edit: import("@/lib/sanity/edit").Edit }} props
 */
const ProjectHero = ({ section, context, edit }) => (
	<section
		data-project-hero
		{...editProps(edit())}
		className="relative isolate flex h-(--hero-h) items-end overflow-hidden px-m pb-m text-white"
	>
		<div className="absolute inset-0 -z-10">
			<Parallax className="relative h-[110%] w-full">
				{/* The photo's own alt text if set, otherwise the project name. */}
				<Img
					image={section.image}
					fallbackAlt={`${stegaClean(section.title)?.replace(/\s+/g, " ")} office interior`}
					fill
					loading="eager"
					fetchPriority="high"
					sizes="100vw"
					className="object-cover"
				/>
				<div className="absolute inset-0 bg-black/25" />
				{/* A darker band at the top, so the blended nav stays legible over a light ceiling or sky. */}
				<div aria-hidden="true" className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black/50 to-transparent" />
			</Parallax>
		</div>
		<TitleRise className="w-full text-display whitespace-pre-line text-balance desk:w-[80%]">
			{section.title}
			{/* Where the project is, from the brief's Location detail: small under the name, but part of the
			    heading, so the page's h1 says what and where. The hidden comma keeps the two apart as text. */}
			{context?.location && (
				<>
					<span className="sr-only">, </span>
					<span {...editProps(context.editLocation)} className="mt-2 block text-body before:mr-[0.35em] before:content-['↳']">
						{context.location}
					</span>
				</>
			)}
		</TitleRise>
	</section>
);

export default ProjectHero;
