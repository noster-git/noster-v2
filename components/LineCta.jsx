import Link from "next/link";
import Img from "@/components/Img";
import Reveal from "./Reveal";
import RollText from "./RollText";
import Arrow from "./Arrow";
import CmsLink from "./CmsLink";
import { linkHref } from "@/lib/content";
import { editProps } from "@/lib/sanity/edit-props";

/**
 * Full-width ruled link inside the page margins: a heading-size label with the arrow, and optionally a
 * small 5:3 photo before the label. On hover it fills with ink from the top, the text turns paper, the
 * letters roll and the arrow swaps. As it scrolls in (Reveal): the top rule draws across, the label fades
 * up, then the bottom rule draws.
 * Used for Featured Works' button (Home), "View Next Project" (project pages, with the next project's photo)
 * and the 404's way home. Goes to `href`, a path on this site, or to `link`, a link from the CMS (any
 * kind: CmsLink); with neither, or a link not filled in, there is no button.
 * Click-to-edit in the studio's live preview: `edit` for the link, `editLabel` for its words.
 *
 * @param {{ href?: string, link?: import("@/lib/content").Link | null, children: import("react").ReactNode, image?: import("@/lib/sanity/image").SanityImage | null, label?: string, className?: string, edit?: string, editLabel?: string }} props
 */
export default function LineCta({ href, link, children, image, label, className = "pt-2 pb-6", edit, editLabel }) {
	if (link ? !linkHref(link) : !href) return null;
	const To = link ? CmsLink : Link;
	return (
		<Reveal as="div" className={`px-m ${className}`}>
			<To {...(link ? { link } : { href })} aria-label={label} {...editProps(edit)} className="motion-host group relative z-10 flex">
				<span data-reveal="rule" aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-(--ink)" />
				<span
					aria-hidden="true"
					className="absolute inset-0 -z-10 origin-top scale-y-0 bg-(--ink) transition-[scale] duration-450 ease-out-quint group-hover:scale-y-100"
				/>
				<span
					data-reveal
					className="flex w-full max-w-full min-w-0 items-center justify-center gap-icon py-2 text-heading transition-colors duration-450 ease-out-quint group-hover:text-(--paper)"
				>
					{image && (
						<span className="relative mr-[0.2em] block aspect-[5/3] h-[1.5em] shrink-0 overflow-hidden rounded-ui">
							<Img image={image} fill sizes="160px" alt="" className="object-cover" />
						</span>
					)}
					<RollText truncate edit={editLabel}>
						{children}
					</RollText>
					<Arrow />
				</span>
				<span data-reveal="rule" aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-(--ink)" />
			</To>
		</Reveal>
	);
}
