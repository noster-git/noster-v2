import { hourlyFetch } from "@/lib/sanity/live";
import { SITEMAP } from "@/lib/sanity/queries";
import { absolute } from "@/lib/site";

const PRIORITY = { home: 1, works: 0.9, project: 0.8, page: 0.6, privacyPolicy: 0.2 };

/**
 * Every page and project, with its last edit: Home and Our Works always, then the projects (latest edit
 * first), the pages built from sections (by address), then the privacy policy when it exists. Published
 * content, re-read every hour.
 */
export default async function sitemap() {
	const { data } = await hourlyFetch({ query: SITEMAP }).catch(() => ({ data: null }));
	const docs = data ?? [];
	const of = (type) => docs.filter((d) => d._type === type);
	const entry = (path, doc, type) => ({
		url: absolute(path),
		lastModified: doc?._updatedAt ? new Date(doc._updatedAt) : undefined,
		priority: PRIORITY[type],
	});
	const projects = of("project")
		.filter((p) => p.path)
		.sort((a, b) => b._updatedAt.localeCompare(a._updatedAt));

	return [
		entry("/", of("home")[0], "home"),
		entry("/works", of("works")[0], "works"),
		...projects.map((p) => entry(p.path, p, "project")),
		...of("page")
			.filter((p) => p.path)
			.sort((a, b) => a.path.localeCompare(b.path))
			.map((p) => entry(p.path, p, "page")),
		...of("privacyPolicy").slice(0, 1).map((p) => entry("/privacy_policy", p, "privacyPolicy")),
	];
}
