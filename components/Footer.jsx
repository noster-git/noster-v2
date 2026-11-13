import Link from "next/link";
import { cacheLife } from "next/cache";
import { isFilled } from "@prismicio/client";
import { PrismicNextLink, cacheTagPrismicPages } from "@prismicio/next";
import { createClient } from "@/prismicio";

async function getFooter() {
	"use cache";
	cacheLife("max");
	const footer = await createClient()
		.getSingle("footer")
		.catch(() => null);
	if (footer) cacheTagPrismicPages([footer]);
	return footer;
}

// Old .footer-texts: 0.86em of the footer size (1.4em on phones), Haffer.
const TXT = "text-[0.86em] max-[680px]:text-[1.4em]";

// The desktop copy has the 0.8em gap and 1.2em line-height; the phone copy (under the socials) has neither, like live.
function Rights({ rights, copyright, className, spaced }) {
	return (
		<div className={`flex-col ${className}`}>
			<p className={`${TXT} ${spaced ? "mb-[0.8em]" : ""}`}>{rights}</p>
			<p className={`${TXT} ${spaced ? "leading-[1.2em]" : ""}`}>{copyright}</p>
		</div>
	);
}

function ArrowIcon() {
	return (
		<svg viewBox="0 0 10 9" fill="currentColor" aria-hidden="true" className="size-[0.6em]">
			<path d="M5.12 7.984L8.416 4.72H0V3.856H8.416L5.104 0.576L5.712 0L10 4.288L5.712 8.576L5.12 7.984Z" />
		</svg>
	);
}

/**
 * Site footer, content from the Prismic "footer" single type. Sizes and breakpoints copied from the old
 * .footer CSS (desktop-first: 1vw, ≤1500 1.2vw, ≤1200 1.4vw, ≤680 3vw). Always white with dark text, like live.
 */
export default async function Footer() {
	const footer = await getFooter();
	if (!footer) return null;
	const { rights_text, copyright_text, offices, socials_title, socials } = footer.data;

	return (
		<footer className="relative flex justify-between bg-white px-[2vw] pt-[7vw] pb-[6vw] font-(family-name:--font-haffer-r-face) text-[1vw] text-[rgb(20,18,14)] max-[1500px]:text-[1.2vw] max-[1200px]:text-[1.4vw] max-[680px]:flex-col max-[680px]:pt-[4vw] max-[680px]:pb-[8vw] max-[680px]:text-[3vw]">
			<div className="flex gap-[8em] max-[1200px]:gap-[2em] max-[680px]:mb-[2em] max-[680px]:flex-col">
				<Rights rights={rights_text} copyright={copyright_text} className="flex w-[10%] max-[680px]:hidden" spaced />

				<div className="flex w-[55%] gap-[4em] max-[1500px]:w-[66%] max-[1200px]:w-[90%] max-[1200px]:gap-[2em] max-[680px]:flex-wrap">
					{offices.map((office, i) => (
						<div key={i} className="flex flex-col">
							<p className={`${TXT} mb-[0.8em] font-bold`}>{office.city}</p>
							<p className={`${TXT} mb-[0.8em] grow leading-[1.4em] text-[grey] max-[1500px]:w-[90%]`}>{office.address}</p>
							{isFilled.link(office.directions_link) && (
								<PrismicNextLink field={office.directions_link} className={`${TXT} mb-[0.6em] flex items-center gap-[0.26em] font-bold underline`}>
									View directions
									<ArrowIcon />
								</PrismicNextLink>
							)}
							{office.phone && (
								<a href={`tel:${office.phone.replace(/\s+/g, "")}`} className={`${TXT} mt-[0.1em] flex w-full items-center gap-[0.26em]`}>
									<b className="shrink-0 underline">{office.phone}</b> (Sales)
								</a>
							)}
						</div>
					))}
				</div>
			</div>

			<div className="flex w-[20%] items-start justify-end gap-[3em] max-[680px]:w-full max-[680px]:flex-col max-[680px]:gap-[2em]">
				<div>
					<p className={`${TXT} mb-[0.8em]`}>{socials_title}</p>
					<ul className="flex flex-col gap-[0.3em]">
						{socials.map((s, i) =>
							isFilled.link(s.link) ? (
								<li key={i} className="flex">
									<PrismicNextLink field={s.link} className={`${TXT} underline`}>
										{s.label}
									</PrismicNextLink>
								</li>
							) : null,
						)}
					</ul>
					<Rights rights={rights_text} copyright={copyright_text} className="mt-[1.8em] hidden max-[680px]:flex" />
				</div>
				<Link href="/privacy_policy" className={`${TXT} underline`}>
					Privacy Policy
				</Link>
			</div>
		</footer>
	);
}
