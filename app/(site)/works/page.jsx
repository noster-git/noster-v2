import { stegaClean } from "next-sanity";
import { fetchOptions, fetchOrNull } from "@/lib/sanity/live";
import { WORKS } from "@/lib/sanity/queries";
import WorksIndex from "@/components/WorksIndex";
import Reveal from "@/components/Reveal";
import SectionLabel from "@/components/SectionLabel";
import JsonLd from "@/components/JsonLd";
import { worksList } from "@/lib/schema";
import { pageMetadata } from "@/lib/site";
import { getProjects, toWorks } from "@/lib/projects";
import { getSettings } from "@/lib/settings";
import { editor, scope } from "@/lib/sanity/edit";

/**
 * Our Works: every project, in the order set on the Works page (then any not in it, newest first), as a grid
 * or a list (WorksIndex). The heading and search fields come from the Works page document; without one, the
 * defaults below. In the studio's live preview a card opens its place in the Works page's project order.
 */
export default async function Page() {
	const options = await fetchOptions();
	const [page, projects] = await Promise.all([fetchOrNull({ query: WORKS, ...options }).catch(() => null), getProjects(options)]);
	const title = page?.title || "Our Works";
	const works = toWorks(projects, { list: scope(editor(page, options.stega), "projects"), stega: options.stega });

	return (
		<>
			<JsonLd data={worksList(stegaClean(works))} />
			<Reveal as="div" className="px-m pt-page pb-2">
				<SectionLabel as="div" top>
					<h1 data-reveal="lines" className="min-w-0 text-display">
						{title}
					</h1>
				</SectionLabel>
			</Reveal>
			<WorksIndex works={works} />
		</>
	);
}

export async function generateMetadata() {
	const options = await fetchOptions();
	const [page, settings] = await Promise.all([fetchOrNull({ query: WORKS, ...options }).catch(() => null), getSettings(options)]);
	return pageMetadata({ path: "/works", seo: page?.seo, settings, title: "Office Interior Projects in Trivandrum & Kochi | Noster" });
}
