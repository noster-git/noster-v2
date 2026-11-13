import Link from "next/link";
import Image from "next/image";
import { cacheLife } from "next/cache";
import { asText, isFilled } from "@prismicio/client";
import { PrismicNextLink, cacheTagPrismicPages } from "@prismicio/next";
import { createClient } from "@/prismicio";
import RollText from "./RollText";
import Arrow from "./Arrow";
import FooterSubscribe from "./FooterSubscribe";
import FooterMotion from "./FooterMotion";

export async function getFooter() {
	"use cache";
	cacheLife("max");
	const footer = await createClient()
		.getSingle("footer")
		.catch(() => null);
	if (footer) cacheTagPrismicPages([footer]);
	return footer;
}

/**
 * "Let's Build Together" content, still edited in the Contact slice on the home page in Prismic.
 * The home page skips that slice (app/page.jsx): it is rendered here, on every page.
 */
async function getContact() {
	"use cache";
	cacheLife("max");
	const home = await createClient()
		.getSingle("home")
		.catch(() => null);
	if (!home) return null;
	cacheTagPrismicPages([home]);
	const slice = home.data.slices.find((s) => s.slice_type === "contact");
	if (!slice) return null;
	return {
		title: asText(slice.primary.title),
		intro: slice.primary.intro,
		contacts: (slice.primary.contacts ?? [])
			.map((c) => c.value?.trim())
			.filter(Boolean)
			.map((value) => ({ value, href: value.includes("@") ? `mailto:${value}` : `tel:${value.replace(/\s+/g, "")}` })),
	};
}

/** A 1px rule that draws in left → right with the footer's entrance (FooterMotion). */
function Rule() {
	return <div data-rule aria-hidden="true" className="h-px bg-current" />;
}

// A footer link: underline-free, rolls on hover, "↳" in front like every link list on the site.
// At least 24px tall with a mouse and 44px on touch, so the stacked links stay easy to hit without overlapping.
const LINK = "motion-host inline-flex min-h-[24px] pointer-coarse:min-h-[44px] items-center gap-[0.3em] before:content-['↳'] transition-opacity duration-200 hover:opacity-60";

/**
 * Site footer. Lime with black type: the NOSTER wordmark across the full width, then two sides under a rule:
 * - left (cols 1–6): "Let's Build Together", with the business-inquiries line and email / phones at its foot;
 * - right (cols 8–10): socials, newsletter sign-up, offices, then rights and copyright.
 * Both sides stretch to the same height, so the left's contacts line up with the credits.
 * Fixed, compact gaps: the footer is as tall as its content, which fits one screen on desk; nothing
 * stretches to fill the window, so tall windows get no gaps. Compact layouts stack the two sides.
 * Entrance animation: components/FooterMotion.jsx.
 */
// The newsletter form shows once a provider is connected in lib/subscribe.js (addSubscriber).
const SUBSCRIBE = false;

export default async function Footer() {
	const [footer, contact] = await Promise.all([getFooter(), getContact()]);
	if (!footer) return null;
	const { rights_text, copyright_text, offices, socials_title, socials } = footer.data;

	return (
		<FooterMotion className="relative flex flex-col bg-lime p-m text-black">
			{/* Wordmark in its own mask so it can rise into place */}
			<div className="overflow-hidden">
				<Image data-footer-mark src="/noster-logo.svg" alt="Noster Associates" width={3252} height={574} unoptimized className="h-auto w-full" />
			</div>

			<div className="mt-6 flex flex-col gap-6 desk:mt-3 desk:grid-site desk:gap-y-0">
				{/* Let's Build Together */}
				{contact && (
					<div className="flex flex-col justify-between gap-4 desk:col-span-6">
						{/* Top: the rule, the intro as a small eyebrow, then the title */}
						<div>
							<Rule />
							{contact.intro && (
								<p data-fade className="pt-[0.5em]">
									{contact.intro}
								</p>
							)}
							{/* Display size, shrinking with the window on desk so it stays on one line across the 6 columns */}
							<h2 data-split className="mt-1 text-display py-[0.08em] desk:text-[min(var(--t-display),7.2vw)] desk:whitespace-nowrap">
								{contact.title}
							</h2>
						</div>
						{/* Foot: one ruled row per contact across the full width; labels in the first two of six
						    columns, values left-aligned from the third, so both sit on the grid */}
						<ul data-fade className="border-b border-current">
							{contact.contacts.map((c) => (
								<li key={c.value} className="border-t border-current">
									<a href={c.href} className="grid grid-cols-6 items-baseline gap-x-g py-[0.35em] pointer-coarse:min-h-[44px] pointer-coarse:content-center transition-opacity duration-200 hover:opacity-60">
										<span className="col-span-2">{c.href.startsWith("mailto:") ? "Email" : "Phone"}</span>
										<span className="col-span-4 text-lead">{c.value}</span>
									</a>
								</li>
							))}
						</ul>
					</div>
				)}

				{/* Right column: fixed gaps; the credits sit at its foot, level with the last contact row */}
				<div className="flex flex-col gap-3 desk:col-span-3 desk:col-start-8">
					{/* Socials */}
					<div>
						<Rule />
						<div data-fade className="pt-[0.5em]">
							{socials_title && <p>{socials_title}</p>}
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
							</ul>
						</div>
					</div>

					{SUBSCRIBE && (
						<div data-fade>
							<FooterSubscribe />
						</div>
					)}

					{/* Offices */}
					<div>
						<Rule />
						<div data-fade className="grid grid-cols-2 gap-x-g gap-y-2 pt-[0.5em]">
							{offices.map((office, i) => (
								<div key={i}>
									<p>{office.city}</p>
									<p className="whitespace-pre-line">{office.address}</p>
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
											(Sales)
										</p>
									)}
								</div>
							))}
						</div>
					</div>

					{/* Credits, at the foot of the column */}
					<div data-fade className="flex items-end justify-between gap-g desk:mt-auto desk:pt-2">
						<div>
							<p>{rights_text}</p>
							<Link href="/privacy_policy" className={LINK}>
								<RollText>Privacy Policy</RollText>
							</Link>
						</div>
						<p className="text-right">{copyright_text}</p>
					</div>
				</div>
			</div>
		</FooterMotion>
	);
}
