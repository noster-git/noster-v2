import Link from "next/link";
import Img from "@/components/Img";
import Reveal from "./Reveal";
import RollText from "./RollText";
import Arrow from "./Arrow";

/**
 * Full-width ruled link inside the page margins: a heading-size label with the arrow, and optionally a
 * small 5:3 photo before the label. On hover it fills with ink from the top, the text turns paper, the
 * letters roll and the arrow swaps. As it scrolls in (Reveal): the top rule draws across, the label fades
 * up, then the bottom rule draws.
 * Used for "View all projects" (Home) and "View Next Project" (project pages, with the next project's photo).
 */
export default function LineCta({ href, children, image, className = "pt-2 pb-6" }) {
	return (
		<Reveal as="div" className={`px-m ${className}`}>
			<Link href={href} className="motion-host group relative z-10 flex">
				<span data-reveal="rule" aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-(--ink)" />
				<span
					aria-hidden="true"
					className="absolute inset-0 -z-10 origin-top scale-y-0 bg-(--ink) transition-[scale] duration-600 ease-quart group-hover:scale-y-100"
				/>
				<span
					data-reveal
					className="flex w-full items-center justify-center gap-[0.3em] py-2 text-heading transition-colors duration-600 ease-quart group-hover:text-(--paper)"
				>
					{image && (
						<span className="relative mr-[0.2em] block aspect-[5/3] h-[1.5em] shrink-0 overflow-hidden rounded-media">
							<Img field={image} fill sizes="160px" alt="" className="object-cover" />
						</span>
					)}
					<RollText>{children}</RollText>
					<Arrow />
				</span>
				<span data-reveal="rule" aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-(--ink)" />
			</Link>
		</Reveal>
	);
}
