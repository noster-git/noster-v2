import Link from "next/link";
import { cacheLife } from "next/cache";
import { isFilled } from "@prismicio/client";
import { PrismicNextLink, cacheTagPrismicPages } from "@prismicio/next";
import { createClient } from "@/prismicio";
import NosterLogo from "./NosterLogo";
import MobileCta from "./MobileCta";
import RollText from "./RollText";
import Arrow from "./Arrow";
import NavCta from "./NavCta";

async function getNavigation() {
	"use cache";
	cacheLife("max");
	const nav = await createClient()
		.getSingle("navigation")
		.catch(() => null);
	if (nav) cacheTagPrismicPages([nav]);
	return nav;
}

/**
 * Fixed top bar on the page grid: logo (columns 1–2), links (from column 3), CTA tag (right).
 * Logo and links: white with mix-blend-difference, so they invert over whatever is under them.
 * The CTA is its own element without blending (NavCta): white on a hero, black off it.
 * Compact: logo only; the CTA moves to a button at the bottom of the screen (MobileCta).
 */
export default async function Navigation() {
	const nav = await getNavigation();
	const { links = [], cta_label, cta_link, mobile_cta_label } = nav?.data ?? {};
	const hasCta = isFilled.link(cta_link) && cta_label;

	return (
		<>
			<nav className="grid-site fixed inset-x-0 top-0 z-50 items-center px-m pt-[12px] pb-g text-white mix-blend-difference">
				<div className="col-span-2">
					{/* Focus rings white: the nav is mix-blend-difference, where a black ring vanishes. */}
					<Link href="/" aria-label="Noster home" data-intro className="hit flex focus-visible:outline-white">
						<NosterLogo className="h-[13px] w-auto desk:h-[15px]" />
					</Link>
				</div>

				<ul className="hidden gap-[14px] desk:col-span-5 desk:flex">
					{links.map((item, i) =>
						isFilled.link(item.link) ? (
							<li key={i} data-intro>
								<PrismicNextLink field={item.link} className="motion-host hit flex focus-visible:outline-white">
									<RollText>{item.label}</RollText>
								</PrismicNextLink>
							</li>
						) : null,
					)}
				</ul>

			</nav>

			{/* The CTA sits outside the blended nav: white on a hero, black off it (NavCta). */}
			{hasCta && (
				<NavCta>
					<PrismicNextLink
						field={cta_link}
						data-intro
						className="motion-host hit flex items-center gap-g rounded-ui bg-black px-[8.5px] py-[4px] leading-none text-white transition-colors duration-200 group-data-[on-hero]:bg-white group-data-[on-hero]:text-black"
					>
						<RollText>{cta_label}</RollText>
						<Arrow />
					</PrismicNextLink>
				</NavCta>
			)}

			{isFilled.link(cta_link) && mobile_cta_label && (
				<MobileCta>
					<PrismicNextLink field={cta_link} data-intro className="motion-host flex items-center gap-[8px] rounded-ui bg-black px-[20px] py-[14px] text-[13px] leading-[16px] whitespace-nowrap text-white transition-[scale] duration-150 ease-out active:scale-[0.97]">
						<RollText>{mobile_cta_label}</RollText>
						<Arrow />
					</PrismicNextLink>
				</MobileCta>
			)}
		</>
	);
}
