import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { PrismicRichText } from "@prismicio/react";
import { cacheTagPrismicPages, getPreviewRef } from "@prismicio/next";
import { createClient } from "@/prismicio";
import Reveal from "@/components/Reveal";
import JsonLd from "@/components/JsonLd";
import { page as pageSchema } from "@/lib/schema";
import { SITE_NAME, OPEN_GRAPH, shareImage } from "@/lib/site";

// Type and spacing come from the design system in app/globals.css (spacing unit = one body line).
// Long-form reading: the text-long tier (14px, generous lines).
const BODY = "text-long";

/** @type {import("@prismicio/react").JSXMapSerializer} */
const components = {
	// The first paragraph is the intro (1.1em); the rest are section descriptions (1em).
	paragraph: ({ children }) => (
		<p className={`${BODY} pb-1 first:pb-3 first:text-lead`}>{children}</p>
	),
	// Section title, e.g. "Interpretation and Definitions"
	heading2: ({ children }) => <h2 className="pt-3 pb-1 text-heading">{children}</h2>,
	// Subtitle, e.g. "Types of Data Collected"
	heading3: ({ node, children }) => <Heading node={node} className={`${BODY} pt-1 font-medium`}>{children}</Heading>,
	// Topic, e.g. "Interpretation", "Definitions"
	heading4: ({ node, children }) => <Heading node={node} className={`${BODY} pt-2 pb-1 font-medium`}>{children}</Heading>,
	// Lead line above a list, e.g. "For the purposes of this Privacy Policy:"
	heading5: ({ children }) => <p className={`${BODY} pt-1 text-muted`}>{children}</p>,
	list: ({ children }) => <ul className="list-disc pb-1 pl-[2.4em]">{children}</ul>,
	oList: ({ children }) => <ol className="list-decimal pb-1 pl-[2.4em]">{children}</ol>,
	listItem: ({ children }) => <li className={BODY}>{children}</li>,
	oListItem: ({ children }) => <li className={BODY}>{children}</li>,
};

/** A heading at its place in the outline (see outline); its look stays the level chosen in Prismic. */
const Heading = ({ node, className, children }) => {
	const Tag = `h${node.level ?? node.type.slice(-1)}`;
	return <Tag className={className}>{children}</Tag>;
};

/**
 * Heading levels as the page outline needs them: the content can step from a section title (h2) straight
 * to a topic (h4); such a heading is rendered one level below the heading it sits under (h3), so no level
 * is skipped for screen readers, and headings side by side keep the same level. Each node keeps its type,
 * so it keeps its style.
 */
function outline(content) {
	const parents = []; // open sections: { type level, rendered level }
	return content.map((node) => {
		const m = /^heading([2-4])$/.exec(node.type);
		if (!m) return node;
		const type = Number(m[1]);
		while (parents.length && parents.at(-1).type >= type) parents.pop();
		const level = (parents.at(-1)?.level ?? 1) + 1; // under the page title (h1) at the top
		parents.push({ type, level });
		return { ...node, level };
	});
}

export default async function Page() {
	const page = (await getPage(await getPreviewRef())) ?? notFound();
	const heading = page.data.title || "Privacy Policy";

	return (
		<>
		<JsonLd data={pageSchema("/privacy_policy", heading)} />
		{/* Reveal: the heading rises line by line, then the text fades up. */}
		<Reveal as="div" className="grid-site items-start px-m pt-page pb-8">
			{/* Desk: the heading stays in columns 1–3 as the text scrolls past it. */}
			<h1 data-reveal="lines" className="col-span-5 mb-4 text-title desk:sticky desk:top-nav desk:col-span-3 desk:mb-0">
				{heading}
			</h1>
			{/* min-w-0 + break-words: long URLs and emails wrap instead of widening the grid past the screen. */}
			<div data-reveal className="col-span-5 max-w-long min-w-0 break-words desk:col-span-6 desk:col-start-5">
				<PrismicRichText field={outline(page.data.content)} components={components} />
			</div>
		</Reveal>
		</>
	);
}

export async function generateMetadata() {
	const page = await getPage(await getPreviewRef());
	const title = page?.data.meta_title || `Privacy Policy | ${SITE_NAME}`;
	const description = page?.data.meta_description || "How Noster Associates collects, uses and protects personal data on noster.in.";

	return {
		title,
		description,
		alternates: { canonical: "/privacy_policy" },
		openGraph: {
			...OPEN_GRAPH,
			url: "/privacy_policy",
			title,
			description,
			images: [shareImage([page?.data.meta_image])],
		},
	};
}

/**
 * @param {string} [ref]
 */
async function getPage(ref) {
	"use cache";
	cacheLife("max");
	cacheTag("prismic");
	// Errors thrown inside "use cache" abort prerendering, so a missing page comes back as null → 404.
	const page = await createClient()
		.getSingle("privacy_policy", { ref })
		.catch(() => null);
	if (page) cacheTagPrismicPages([page]);
	return page;
}
