import Link from "next/link";
import { cacheLife } from "next/cache";
import { isFilled } from "@prismicio/client";
import { PrismicNextLink, cacheTagPrismicPages } from "@prismicio/next";
import { createClient } from "@/prismicio";
import RollText from "./RollText";
import Arrow from "./Arrow";

export async function getFooter() {
	"use cache";
	cacheLife("max");
	const footer = await createClient()
		.getSingle("footer")
		.catch(() => null);
	if (footer) cacheTagPrismicPages([footer]);
	return footer;
}

// A footer link: underline-free, rolls on hover, "↳" in front like every link list on the site.
const LINK = "motion-host inline-flex items-center gap-[0.3em] before:content-['↳'] transition-colors duration-200 hover:text-muted";

/** One labelled block: the label on its own line, the content indented beneath it. */
function Block({ label, className = "", children }) {
	return (
		<div className={`mb-2 desk:mb-0 ${className}`}>
			<p>{label}</p>
			<div className="pl-[2.4em]">{children}</div>
		</div>
	);
}

/**
 * Site footer, content from the Prismic "footer" single type. On the page grid: one block per office
 * (two columns each), socials, then rights and copyright at the bottom. Compact layouts stack the blocks.
 * Always white with dark text.
 */
export default async function Footer() {
	const footer = await getFooter();
	if (!footer) return null;
	const { rights_text, copyright_text, offices, socials_title, socials } = footer.data;

	return (
		<footer className="relative flex flex-col bg-white px-g pt-[64px] pb-g text-[rgb(20,18,14)] desk:pt-[120px]">
			<div className="desk:grid-site">
				{offices.map((office, i) => (
					<Block key={i} label={office.city} className="desk:col-span-2">
						<p className="whitespace-pre-line text-muted">{office.address}</p>
						{isFilled.link(office.directions_link) && (
							<PrismicNextLink field={office.directions_link} className={LINK}>
								<RollText>View directions</RollText>
								<Arrow />
							</PrismicNextLink>
						)}
						{office.phone && (
							<p>
								<a href={`tel:${office.phone.replace(/\s+/g, "")}`} className={LINK}>
									<RollText>{office.phone}</RollText>
								</a>{" "}
								<span className="text-muted">(Sales)</span>
							</p>
						)}
					</Block>
				))}

				<Block label={socials_title} className="desk:col-span-2 desk:col-start-9">
					<ul>
						{socials.map((s, i) =>
							isFilled.link(s.link) ? (
								<li key={i}>
									<PrismicNextLink field={s.link} className={LINK}>
										<RollText>{s.label}</RollText>
									</PrismicNextLink>
								</li>
							) : null,
						)}
						<li>
							<Link href="/privacy_policy" className={LINK}>
								<RollText>Privacy Policy</RollText>
							</Link>
						</li>
					</ul>
				</Block>
			</div>

			<div className="pt-3 desk:grid-site">
				<p className="desk:col-span-4">{rights_text}</p>
				<p className="desk:col-span-4">{copyright_text}</p>
			</div>
		</footer>
	);
}
