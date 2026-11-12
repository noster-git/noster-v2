import Link from "next/link";
import { cacheLife } from "next/cache";
import { isFilled } from "@prismicio/client";
import { PrismicNextLink, cacheTagPrismicPages } from "@prismicio/next";
import { createClient } from "@/prismicio";
import NosterLogo from "./NosterLogo";
import MobileCta from "./MobileCta";

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
 * Fixed top bar. mix-blend-difference makes the white logo and text invert over light sections,
 * so it reads on both the dark hero and white pages without scroll listeners.
 * Phone: only the logo up top; the CTA moves to a floating pill at the bottom (MobileCta).
 */
export default async function Navigation() {
	const nav = await getNavigation();
	const { links = [], cta_label, cta_link, mobile_cta_label } = nav?.data ?? {};
	const hasCta = isFilled.link(cta_link) && cta_label;

	return (
		<>
			<nav className="fixed top-0 left-0 z-50 flex w-full items-center justify-between px-[1.9vw] py-[6.4vw] text-[1.6vw] text-white mix-blend-difference md:py-[1.95vw] lg:text-[1vw]">
				<div className="w-1/3">
					<Link href="/" aria-label="Noster home" className="inline-block">
						<NosterLogo className="h-[25px] w-[150px]" />
					</Link>
				</div>

				<ul className="hidden w-1/3 items-center justify-evenly md:flex">
					{links.map((item, i) =>
						isFilled.link(item.link) ? (
							<li key={i} className="flex w-1/4 justify-center">
								<PrismicNextLink field={item.link}>{item.label}</PrismicNextLink>
							</li>
						) : null,
					)}
				</ul>

				<div className="hidden w-1/3 justify-end md:flex">
					{hasCta && (
						<PrismicNextLink field={cta_link} className="flex items-center">
							{cta_label}
							<span
								aria-hidden="true"
								className="ml-[0.6em] flex size-[1.13em] items-center justify-center rounded-[0.13em] bg-white text-black"
							>
								-&gt;
							</span>
						</PrismicNextLink>
					)}
				</div>
			</nav>

			{isFilled.link(cta_link) && mobile_cta_label && (
				<MobileCta>
					<PrismicNextLink field={cta_link} className="flex items-center rounded-full bg-[#1e1e1e] p-[14px] text-[16px] text-white">
						{mobile_cta_label}
						<span
							aria-hidden="true"
							className="ml-[10px] flex size-[18px] items-center justify-center rounded-[2px] bg-white text-black"
						>
							-&gt;
						</span>
					</PrismicNextLink>
				</MobileCta>
			)}
		</>
	);
}
