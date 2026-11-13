import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";
import { asImageSrc } from "@prismicio/client";
import { PrismicRichText } from "@prismicio/react";
import { cacheTagPrismicPages, getPreviewRef } from "@prismicio/next";
import { createClient } from "@/prismicio";

// Live values (1vw font, 3vw on phones ≤580px). Body text is Haffer Regular, subtitles Inter.
// Block paddings reproduce the live slices' spacing (1em = 1vw above and below each old slice),
// written in each block's own em, e.g. 0.535em on the 1.87em titles.
const HAFFER = "font-(family-name:--font-haffer-r-face)";
const BODY = "leading-[144%] tracking-[-0.022vw]";

/** @type {import("@prismicio/react").JSXMapSerializer} */
const components = {
	// The first paragraph is the intro (1.1em); the rest are section descriptions (1em).
	paragraph: ({ children }) => (
		<p className={`${HAFFER} ${BODY} pb-[1em] first:py-[0.909em] first:text-[1.1em]`}>{children}</p>
	),
	// Section title, e.g. "Interpretation and Definitions"
	heading2: ({ children }) => <h2 className={`${HAFFER} py-[0.535em] text-[1.87em] font-normal`}>{children}</h2>,
	// Subtitle, e.g. "Types of Data Collected"
	heading3: ({ children }) => <h3 className="font-normal">{children}</h3>,
	// Topic, e.g. "Interpretation", "Definitions"
	heading4: ({ children }) => <h4 className={`${HAFFER} pt-[0.625em] pb-[0.625em] text-[1.6em] font-normal`}>{children}</h4>,
	// Lead line above a list, e.g. "For the purposes of this Privacy Policy:"
	heading5: ({ children }) => <p className={`${HAFFER} text-[1.4em]`}>{children}</p>,
	list: ({ children }) => <ul className={`${HAFFER} list-disc px-[2em] pt-[0.5em] pb-[1.5em]`}>{children}</ul>,
	oList: ({ children }) => <ol className={`${HAFFER} list-decimal px-[2em] pt-[0.5em] pb-[1.5em]`}>{children}</ol>,
	listItem: ({ children }) => <li className={`${BODY} py-[0.45em]`}>{children}</li>,
	oListItem: ({ children }) => <li className={`${BODY} py-[0.45em]`}>{children}</li>,
};

export default async function Page() {
	const page = (await getPage(await getPreviewRef())) ?? notFound();
	const heading = `:${page.data.title || "Privacy Policy"}`;

	return (
		<div className="px-[9vw] pt-[25vw] pb-[18vw] text-[3vw] text-black min-[581px]:px-[3vw] min-[581px]:py-[6vw] min-[581px]:text-[1vw]">
			<div className="relative flex flex-col min-[581px]:items-end">
				{/* Desktop: the heading scrolls with the page, then stays 10% from the top. */}
				<div className="w-full min-[581px]:absolute min-[581px]:inset-y-0 min-[581px]:left-0 min-[581px]:w-auto">
					<h1 className="text-[3em] leading-[normal] font-normal min-[581px]:sticky min-[581px]:top-[10vh] min-[681px]:text-[5em]">
						{heading}
					</h1>
				</div>
				<div className="w-full min-[581px]:w-[60%]">
					<PrismicRichText field={page.data.content} components={components} />
				</div>
			</div>
		</div>
	);
}

export async function generateMetadata() {
	const page = await getPage(await getPreviewRef());
	const { meta_title, meta_description, meta_image } = page?.data ?? {};

	return {
		title: meta_title || "Privacy Policy | Noster",
		description: meta_description || undefined,
		openGraph: {
			images: [{ url: asImageSrc(meta_image) ?? "/noster-meta.png" }],
		},
	};
}

/**
 * @param {string} [ref]
 */
async function getPage(ref) {
	"use cache";
	cacheLife("max");
	// Errors thrown inside "use cache" abort prerendering, so a missing page comes back as null → 404.
	const page = await createClient()
		.getSingle("privacy_policy", { ref })
		.catch(() => null);
	if (page) cacheTagPrismicPages([page]);
	return page;
}
