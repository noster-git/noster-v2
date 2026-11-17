import { cacheLife } from "next/cache";
import { hourlyFetch } from "@/lib/sanity/live";
import { FOOTER, HOME, PROJECT_SUMMARIES } from "@/lib/sanity/queries";
import { toWorks } from "@/sections/FeaturedWorks";
import { plainText } from "@/lib/content";
import { SITE_NAME, DEFAULT_DESCRIPTION, absolute, excerpt } from "@/lib/site";

/**
 * /llms.txt: a plain-text guide to the site for AI answer engines (llmstxt.org format):
 * who the studio is, where its offices are, and a link plus one-line summary for every project.
 */
export async function GET() {
	return new Response(await buildText(), { headers: { "content-type": "text/plain; charset=utf-8" } });
}

/** A query's published result, re-read every hour, or `fallback` when the CMS can't be read. */
const read = (query, fallback) =>
	hourlyFetch({ query })
		.then(({ data }) => data ?? fallback)
		.catch(() => fallback);

async function buildText() {
	"use cache";
	cacheLife("hours");
	const [home, footer, projects] = await Promise.all([read(HOME, null), read(FOOTER, null), read(PROJECT_SUMMARIES, [])]);

	const section = (type) => home?.sections?.find((s) => s._type === type);
	const approach = section("ourApproach");
	// Newest first, as on /works; projects not on Home's list go last.
	const order = toWorks(section("featuredWorks")?.projects).map((w) => w.href);
	const rank = (p) => {
		const i = order.indexOf(p.href);
		return i === -1 ? order.length : i;
	};

	const projectLine = (p) => {
		const name = p.name?.replace(/\s+/g, " ").trim() || p.seo?.title?.split("|")[0].trim() || p.slug;
		const facts = (p.brief?.details ?? []).map((d) => `${d.label}: ${d.value?.replace(/\s+/g, " ").trim()}`).join("; ");
		const summary = p.seo?.description || excerpt(plainText(p.brief?.description), 200);
		return `- [${name}](${absolute(p.href)}): ${summary}${facts ? ` (${facts})` : ""}`;
	};

	const contacts = (section("contact")?.contacts ?? [])
		.map((c) => c.value?.trim())
		.filter(Boolean)
		.map((v) => `- ${v.includes("@") ? "Email" : "Phone"}: ${v}`);
	const offices = (footer?.offices ?? []).map((o) => `- ${o.city}: ${o.address}${o.phone ? ` (${o.phone})` : ""}`);

	return [
		`# ${SITE_NAME}`,
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
		"",
		"## Projects",
		...[...projects].sort((a, b) => rank(a) - rank(b)).map(projectLine),
		"",
	].join("\n");
}
