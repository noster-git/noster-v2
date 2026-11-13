import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";
import { asImageSrc } from "@prismicio/client";
import { PrismicRichText } from "@prismicio/react";
import { cacheTagPrismicPages, getPreviewRef } from "@prismicio/next";
import { createClient } from "@/prismicio";

// Type and spacing come from the design system in app/globals.css (spacing unit = one body line).
// Long-form reading: a step up from the 11–12px interface text, with more generous lines.
const BODY = "text-[13px] leading-[19px] desk:text-[14px] desk:leading-[21px]";

/** @type {import("@prismicio/react").JSXMapSerializer} */
const components = {
	// The first paragraph is the intro (1.1em); the rest are section descriptions (1em).
	paragraph: ({ children }) => (
		<p className={`${BODY} pb-1 first:pb-3 first:text-lead`}>{children}</p>
	),
	// Section title, e.g. "Interpretation and Definitions"
	heading2: ({ children }) => <h2 className="pt-3 pb-1 text-heading">{children}</h2>,
	// Subtitle, e.g. "Types of Data Collected"
	heading3: ({ children }) => <h3 className={`${BODY} pt-1 font-medium`}>{children}</h3>,
	// Topic, e.g. "Interpretation", "Definitions"
	heading4: ({ children }) => <h4 className={`${BODY} pt-2 pb-1 font-medium`}>{children}</h4>,
	// Lead line above a list, e.g. "For the purposes of this Privacy Policy:"
	heading5: ({ children }) => <p className={`${BODY} pt-1 text-muted`}>{children}</p>,
	list: ({ children }) => <ul className="list-disc pb-1 pl-[2.4em]">{children}</ul>,
	oList: ({ children }) => <ol className="list-decimal pb-1 pl-[2.4em]">{children}</ol>,
	listItem: ({ children }) => <li className={BODY}>{children}</li>,
	oListItem: ({ children }) => <li className={BODY}>{children}</li>,
};

export default async function Page() {
	const page = (await getPage(await getPreviewRef())) ?? notFound();
	const heading = `:${page.data.title || "Privacy Policy"}`;

	return (
		<div className="grid-site items-start px-g pt-[84px] pb-8 text-black desk:pt-[120px]">
			{/* Desk: the heading stays in columns 1–3 as the text scrolls past it. */}
			<h1 className="col-span-5 mb-4 text-title desk:sticky desk:top-[84px] desk:col-span-3 desk:mb-0">{heading}</h1>
			<div className="col-span-5 max-w-[46em] desk:col-span-6 desk:col-start-5">
				<PrismicRichText field={page.data.content} components={components} />
			</div>
		</div>
	);
}

export async function generateMetadata() {
	const page = await getPage(await getPreviewRef());
	const { meta_title, meta_description, meta_image } = page?.data ?? {};

	return {
		title: meta_title || "Privacy Policy | Noster",
		description: meta_description || "How Noster Associates collects, uses and protects personal data on noster.in.",
		alternates: { canonical: "/privacy_policy" },
		openGraph: {
			url: "/privacy_policy",
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
