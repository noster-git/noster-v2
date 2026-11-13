import Link from "next/link";

/**
 * Full-width outlined link (top/bottom rule) that fills black from the top on hover, text turning white.
 * Live site: "View all projects" on Home and /works, "View Next Project" on project pages.
 */
export default function LineCta({ href, children, spacing = "pt-[2em] pb-[8em]" }) {
	return (
		<div className={`mt-[1em] flex justify-center text-[3vw] md:mt-0 md:text-[1vw] ${spacing}`}>
			<Link href={href} className="group relative z-10 flex w-[96%] border-y border-(--ink)">
				<span
					aria-hidden="true"
					className="absolute inset-x-0 top-0 -z-10 h-0 bg-(--ink) transition-[height] duration-600 ease-[cubic-bezier(0.85,0,0.15,1)] group-hover:h-full"
				/>
				<span className="flex w-full items-center justify-center py-[0.8em] text-[1.625em] transition-colors duration-600 ease-quart group-hover:text-(--paper)">
					{children}
				</span>
			</Link>
		</div>
	);
}
