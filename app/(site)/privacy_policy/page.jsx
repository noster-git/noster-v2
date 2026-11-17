import { notFound } from "next/navigation";
import { stegaClean } from "next-sanity";
import { fetchOptions, fetchOrNull } from "@/lib/sanity/live";
import { PRIVACY } from "@/lib/sanity/queries";
import Reveal from "@/components/Reveal";
import RichText from "@/components/RichText";
import JsonLd from "@/components/JsonLd";
import { page as pageSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/site";
import { getSettings } from "@/lib/settings";

// Type and spacing come from the design system in app/(site)/globals.css (spacing unit = one body line).
// Long-form reading: the text-long tier (14px, generous lines).
const BODY = "text-long";

/** @type {import("@portabletext/react").PortableTextComponents} */
const components = {
	block: {
		// The first paragraph is the intro (1.1em); the rest are section descriptions (1em).
		normal: ({ children }) => <p className={`${BODY} pb-1 first:pb-3 first:text-lead`}>{children}</p>,
		// Section title, e.g. "Interpretation and Definitions"
		h2: ({ children }) => <h2 className="pt-3 pb-1 text-heading">{children}</h2>,
		// Subtitle, e.g. "Types of Data Collected"
		h3: ({ value, children }) => <Heading block={value} className={`${BODY} pt-1 font-medium`}>{children}</Heading>,
		// Topic, e.g. "Interpretation", "Definitions"
		h4: ({ value, children }) => <Heading block={value} className={`${BODY} pt-2 pb-1 font-medium`}>{children}</Heading>,
		// Lead line above a list, e.g. "For the purposes of this Privacy Policy:"
		h5: ({ children }) => <p className={`${BODY} pt-1 text-muted`}>{children}</p>,
	},
	list: {
		bullet: ({ children }) => <ul className="list-disc pb-1 pl-[2.4em]">{children}</ul>,
		number: ({ children }) => <ol className="list-decimal pb-1 pl-[2.4em]">{children}</ol>,
	},
	listItem: {
		bullet: ({ children }) => <li className={BODY}>{children}</li>,
		number: ({ children }) => <li className={BODY}>{children}</li>,
	},
};

/** A heading at its place in the outline (see outline); its look stays the style chosen in the CMS. */
const Heading = ({ block, className, children }) => {
	const Tag = `h${block.level ?? stegaClean(block.style).slice(-1)}`;
	return <Tag className={className}>{children}</Tag>;
};

/**
 * Heading levels as the page outline needs them: the content can step from a section title (h2) straight
 * to a topic (h4); such a heading is rendered one level below the heading it sits under (h3), so no level
 * is skipped for screen readers, and headings side by side keep the same level. Each block keeps its style,
 * so it keeps its look.
 */
function outline(content) {
	const parents = []; // open sections: { type level, rendered level }
	return (content ?? []).map((node) => {
		const m = stegaClean(node._type) === "block" && /^h([2-4])$/.exec(stegaClean(node.style));
		if (!m) return node;
		const type = Number(m[1]);
		while (parents.length && parents.at(-1).type >= type) parents.pop();
		const level = (parents.at(-1)?.level ?? 1) + 1; // under the page title (h1) at the top
		parents.push({ type, level });
		return { ...node, level };
	});
}

export default async function Page() {
	// No privacy document (or no answer from the CMS): a 404.
	const page = (await getPage()) ?? notFound();
	const heading = page.title || "Privacy Policy";

	return (
		<>
		<JsonLd data={pageSchema("/privacy_policy", stegaClean(heading))} />
		{/* Reveal: the heading rises line by line, then the text fades up. */}
		<Reveal as="div" className="grid-site items-start px-m pt-page pb-8">
			{/* Desk: the heading stays in columns 1–3 as the text scrolls past it. */}
			<h1 data-reveal="lines" className="col-span-5 mb-4 text-title desk:sticky desk:top-nav desk:col-span-3 desk:mb-0">
				{heading}
			</h1>
			{/* min-w-0 + break-words: long URLs and emails wrap instead of widening the grid past the screen.
			    data-lcp: the text is the page's main element, painted under the load curtain (globals.css). */}
			<div data-reveal data-lcp className="col-span-5 max-w-long min-w-0 break-words desk:col-span-6 desk:col-start-5">
				<RichText value={outline(page.content)} components={components} />
			</div>
		</Reveal>
		</>
	);
}

export async function generateMetadata() {
	const [page, settings] = await Promise.all([getPage(), fetchOptions().then(getSettings)]);
	return pageMetadata({
		path: "/privacy_policy",
		seo: page?.seo,
		settings,
		title: "Privacy Policy | Noster",
		description: "How Noster Associates collects, uses and protects personal data on noster.in.",
	});
}

/** The privacy policy document, or null when there is none or the CMS can't be read. */
async function getPage() {
	return fetchOrNull({ query: PRIVACY, ...(await fetchOptions()) }).catch(() => null);
}
