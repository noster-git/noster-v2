import Link from "next/link";
import { cacheLife, cacheTag } from "next/cache";
import { isFilled } from "@prismicio/client";
import { PrismicNextLink, cacheTagPrismicPages, getPreviewRef } from "@prismicio/next";
import { createClient } from "@/prismicio";
import NosterLogo from "./NosterLogo";
import MobileCta from "./MobileCta";
import RollText from "./RollText";
import Arrow from "./Arrow";
import { TAG, BUTTON } from "@/lib/buttons";

/**
 * @param {string} [ref]
 */
async function getNavigation(ref) {
	"use cache";
	cacheLife("max");
	cacheTag("prismic");
	const nav = await createClient()
		.getSingle("navigation", { ref })
		.catch(() => null);
	if (nav) cacheTagPrismicPages([nav]);
	return nav;
}

// Until links are set in Prismic, the nav shows these.
const DEFAULT_LINKS = [
	{ label: "Works", href: "/works" },
	{ label: "Contact", href: "#contact" }, // the footer
];

/**
 * Fixed top bar on the page grid: logo (columns 1–2), links (from column 3), CTA tag (right), and a 2px
 * scroll-progress line along the very top (globals.css → .scroll-progress).
 * Logo, links and the progress line: white with mix-blend-difference, so they invert over whatever is under them.
 * The CTA sits outside the blending: lime with black text, the one solid accent on every page.
 * Compact: logo and a Works link; the CTA moves to a button at the bottom of the screen (MobileCta).
 */
export default async function Navigation() {
	const nav = await getNavigation(await getPreviewRef());
	const { links = [], cta_label, cta_link, mobile_cta_label } = nav?.data ?? {};
	const hasCta = isFilled.link(cta_link) && cta_label;
	const cmsLinks = links.filter((item) => isFilled.link(item.link));
	const linkClass = "motion-host hit flex focus-visible:outline-white";

	return (
		<>
			<div aria-hidden="true" className="scroll-progress pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px] bg-white mix-blend-difference" />
			<nav className="grid-site fixed inset-x-0 top-0 z-50 items-center px-m pt-[12px] pb-g text-white mix-blend-difference">
				<div className="col-span-2">
					{/* Focus rings white: the nav is mix-blend-difference, where a black ring vanishes. */}
					<Link href="/" aria-label="Noster home" data-intro className="hit flex focus-visible:outline-white">
						<NosterLogo className="h-[13px] w-auto desk:h-[15px]" />
					</Link>
				</div>

				{/* Compact: the links row is hidden, so Works stays one tap away at the right of the bar. */}
				<div className="col-span-3 flex justify-end desk:hidden">
					<Link href="/works" data-intro className={linkClass}>
						<RollText>Works</RollText>
					</Link>
				</div>

				<ul className="hidden gap-[14px] desk:col-span-5 desk:flex">
					{cmsLinks.length
						? cmsLinks.map((item, i) => (
								<li key={i} data-intro>
									<PrismicNextLink field={item.link} className={linkClass}>
										<RollText>{item.label}</RollText>
									</PrismicNextLink>
								</li>
							))
						: DEFAULT_LINKS.map((item) => {
								// In-page anchors are plain links: Lenis glides to them (SmoothScroll: anchors).
								const A = item.href.startsWith("#") ? "a" : Link;
								return (
									<li key={item.href} data-intro>
										<A href={item.href} className={linkClass}>
											<RollText>{item.label}</RollText>
										</A>
									</li>
								);
							})}
				</ul>
			</nav>

			{/* The CTA sits outside the blended nav, so it keeps its lime; same spot as the nav row. */}
			{hasCta && (
				<div className="fixed top-0 right-0 z-50 hidden px-m pt-[8px] desk:block">
					<PrismicNextLink
						field={cta_link}
						data-intro
						className={`${TAG} hit flex transition-[scale] duration-150 ease-out active:scale-[0.97]`}
					>
						<RollText>{cta_label}</RollText>
						<Arrow />
					</PrismicNextLink>
				</div>
			)}

			{isFilled.link(cta_link) && mobile_cta_label && (
				<MobileCta>
					{/* data-intro="up": at the foot of the screen it rises in, where the header items drop in. A label
					    too long for the screen ends in an ellipsis rather than running off its edges. */}
					<PrismicNextLink
						field={cta_link}
						data-intro="up"
						className={`${BUTTON} flex max-w-[calc(100vw-24px)] whitespace-nowrap transition-[scale] duration-150 ease-out active:scale-[0.97]`}
					>
						<RollText truncate>{mobile_cta_label}</RollText>
						<Arrow />
					</PrismicNextLink>
				</MobileCta>
			)}
		</>
	);
}
