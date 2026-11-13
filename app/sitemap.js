import { cacheLife } from "next/cache";
import { createClient } from "@/prismicio";
import { absolute } from "@/lib/site";

/** Every page and project, from Prismic, with its last publish date. */
export default async function sitemap() {
	"use cache";
	cacheLife("hours");
	const client = createClient();
	const [singles, projects] = await Promise.all([
		client.getAllByType("home").catch(() => []),
		client.getAllByType("project").catch(() => []),
	]);
	const [works, privacy] = await Promise.all([
		client.getSingle("works").catch(() => null),
		client.getSingle("privacy_policy").catch(() => null),
	]);

	const entry = (path, doc, priority) => ({
		url: absolute(path),
		lastModified: doc?.last_publication_date ? new Date(doc.last_publication_date) : undefined,
		priority,
	});

	return [
		entry("/", singles[0], 1),
		entry("/works", works, 0.9),
		...projects.map((p) => entry(p.url || `/works/${p.uid}`, p, 0.8)),
		...(privacy ? [entry("/privacy_policy", privacy, 0.2)] : []),
	];
}
