import Link from "next/link";
import RollText from "./RollText";
import Arrow from "./Arrow";

/**
 * Full-width ruled link inside the page margins: a heading-size label with the arrow. On hover it fills
 * with ink from the top, the text turns paper, the letters roll and the arrow swaps.
 * Used for "View all projects" (Home) and "View Next Project" (project pages).
 */
export default function LineCta({ href, children, className = "pt-2 pb-8" }) {
	return (
		<div className={`px-g ${className}`}>
			<Link href={href} className="motion-host group relative z-10 flex border-y border-(--ink)">
				<span
					aria-hidden="true"
					className="absolute inset-x-0 top-0 -z-10 h-0 bg-(--ink) transition-[height] duration-600 ease-[cubic-bezier(0.85,0,0.15,1)] group-hover:h-full"
				/>
				<span className="flex w-full items-center justify-center gap-[0.3em] py-2 text-heading transition-colors duration-600 ease-quart group-hover:text-(--paper)">
					<RollText>{children}</RollText>
					<Arrow />
				</span>
			</Link>
		</div>
	);
}
