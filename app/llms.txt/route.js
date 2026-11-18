import { cacheLife } from "next/cache";
import { hourlyFetch } from "@/lib/sanity/live";
import { HOME, PAGE_SUMMARIES, PROJECT_ORDER, PROJECT_SUMMARIES, SETTINGS } from "@/lib/sanity/queries";
import { plainText } from "@/lib/content";
import { projectFacts } from "@/lib/project-facts";
import { SITE_NAME, DEFAULT_DESCRIPTION, absolute, excerpt } from "@/lib/site";

/**
 * /llms.txt: a plain-text guide to the site for AI answer engines (llmstxt.org format):
 * who the studio is, where its offices are, its pages, and a link plus one-line summary for every project.
 */
export async function GET() {
	return new Response(await buildText(), { headers: { "content-type": "text/plain; charset=utf-8" } });
}

/** A query's published result, re-read every hour, or `fallback` when the CMS can't be read. */
const read = (query, fallback) =>
	hourlyFetch({ query })
		.then(({ data }) => data ?? fallback)
		.catch(() => fallback);

/** One line, single spaces. */
const oneLine = (text) => text?.replace(/\s+/g, " ").trim();

async function buildText() {
	"use cache";
	cacheLife("hours");
	const [home, settings, projects, order, pages] = await Promise.all([
		read(HOME, null),
		read(SETTINGS, null),
		read(PROJECT_SUMMARIES, []),
		read(PROJECT_ORDER, []),
		read(PAGE_SUMMARIES, []),
	]);

	const approach = home?.sections?.find((s) => s._type === "ourApproach");
	// In the Works page order.
	const ids = order.map((p) => p._id);
	const rank = (p) => {
		const i = ids.indexOf(p._id);
		return i === -1 ? ids.length : i;
	};

	const projectLine = (p) => {
		const name = oneLine(p.name) || p.seo?.title?.split("|")[0].trim() || p.slug;
		const facts = projectFacts(p)
			.map((f) => `${f.label}: ${oneLine(f.value)}`)
			.join("; ");
		const summary = p.seo?.description || excerpt(plainText(p.summary), 200);
		return `- [${name}](${absolute(p.href)}): ${summary}${facts ? ` (${facts})` : ""}`;
	};

	const contacts = [
		...(settings?.email?.trim() ? [`- Email: ${settings.email.trim()}`] : []),
		...(settings?.phones ?? [])
			.map((p) => p.number?.trim())
			.filter(Boolean)
			.map((v) => `- Phone: ${v}`),
	];
	const offices = (settings?.offices ?? []).filter((o) => o?.city?.name).map((o) => `- ${o.city.name}: ${o.address}${o.phone ? ` (${o.phone})` : ""}`);
	const pageLines = pages
		.filter((p) => oneLine(p.title))
		.map((p) => `- [${oneLine(p.title)}](${absolute(p.href)})${p.seo?.description ? `: ${p.seo.description}` : ""}`);

	return [
		`# ${settings?.name || SITE_NAME}`,
		"",
		`> ${home?.seo?.description || DEFAULT_DESCRIPTION}`,
		"",
		approach?.description ?? "",
		"",
		...(contacts.length ? ["## Contact", ...contacts, ""] : []),
		"## Offices",
		...offices,
		"",
		"## Pages",
		`- [Home](${absolute("/")}): studio overview, approach, collaborators and featured projects`,
		`- [Our Works](${absolute("/works")}): every completed project`,
		`- [Privacy Policy](${absolute("/privacy_policy")})`,
		...pageLines,
		"",
		"## Projects",
		...[...projects].sort((a, b) => rank(a) - rank(b)).map(projectLine),
		"",
	].join("\n");
}
