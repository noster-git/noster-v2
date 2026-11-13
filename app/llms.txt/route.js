import { cacheLife } from "next/cache";
import { asText } from "@prismicio/client";
import { createClient } from "@/prismicio";
import { getFooter } from "@/components/Footer";
import { toWorks } from "@/slices/FeaturedWorks";
import { SITE_NAME, DEFAULT_DESCRIPTION, absolute, excerpt } from "@/lib/site";

/**
 * /llms.txt: a plain-text guide to the site for AI answer engines (llmstxt.org format):
 * who the studio is, where its offices are, and a link plus one-line summary for every project.
 */
export async function GET() {
	return new Response(await buildText(), { headers: { "content-type": "text/plain; charset=utf-8" } });
}

async function buildText() {
	"use cache";
	cacheLife("hours");
	const client = createClient();
	const [home, footer, projects] = await Promise.all([
		client.getSingle("home").catch(() => null),
		getFooter(),
		client.getAllByType("project").catch(() => []),
	]);

	const approach = home?.data.slices.find((s) => s.slice_type === "our_approach");
	const featured = home?.data.slices.find((s) => s.slice_type === "featured_works");
	// Newest first, as on /works; projects not on Home's list go last.
	const order = featured ? toWorks(featured.primary.projects).map((w) => w.href) : [];
	const rank = (p) => {
		const i = order.indexOf(p.url);
		return i === -1 ? order.length : i;
	};

	const projectLine = (p) => {
		const slices = p.data.slices;
		const name =
			slices.find((s) => s.slice_type === "project_hero")?.primary.title?.replace(/\s+/g, " ").trim() ||
			p.data.meta_title?.split("|")[0].trim() ||
			p.uid;
		const brief = slices.find((s) => s.slice_type === "project_brief")?.primary;
		const facts = (brief?.details ?? []).map((d) => `${d.label}: ${d.value?.replace(/\s+/g, " ").trim()}`).join("; ");
		const summary = p.data.meta_description || excerpt(asText(brief?.description), 200);
		return `- [${name}](${absolute(p.url)}): ${summary}${facts ? ` (${facts})` : ""}`;
	};

	const offices = (footer?.data.offices ?? []).map((o) => `- ${o.city}: ${o.address}${o.phone ? ` (${o.phone})` : ""}`);

	return [
		`# ${SITE_NAME}`,
		"",
		`> ${home?.data.meta_description || DEFAULT_DESCRIPTION}`,
		"",
		approach ? asText(approach.primary.description) : "",
		"",
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
