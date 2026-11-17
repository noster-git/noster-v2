import { defineArrayMember, defineField } from "sanity";
import { hero } from "./hero.js";
import { ourApproach } from "./ourApproach.js";
import { collaborators } from "./collaborators.js";
import { featuredWorks } from "./featuredWorks.js";
import { contact } from "./contact.js";
import { photos } from "./photos.js";

/** Every section a page can be built from. */
export const sectionTypes = [hero, ourApproach, collaborators, featuredWorks, contact, photos];

/** The sections for pages (home and new pages): all of them. */
export const PAGE_SECTIONS = sectionTypes.map((type) => type.name);

/** The extra sections a project page can add under its photos: no hero, the project has its own. */
export const PROJECT_SECTIONS = ["ourApproach", "photos", "featuredWorks", "collaborators", "contact"];

// The add-section menu: grouped, with a picture of each section (public/studio-sections) in the grid view.
const GROUPS = [
	{ name: "opening", title: "Opening", of: ["hero"] },
	{ name: "text", title: "Text", of: ["ourApproach", "contact"] },
	{ name: "work", title: "Projects and clients", of: ["featuredWorks", "collaborators"] },
	{ name: "photos", title: "Photos", of: ["photos"] },
];

/**
 * A page's `sections` field: the given section types, in the order editors place them, with the grouped
 * add-section menu.
 *
 * @param {{ of: string[], description: string, group?: string }} options
 */
export function sectionsField({ of, description, group }) {
	return defineField({
		name: "sections",
		title: "Sections",
		type: "array",
		group,
		description,
		of: of.map((type) => defineArrayMember({ type })),
		options: {
			insertMenu: {
				filter: false,
				groups: GROUPS.map((g) => ({ ...g, of: g.of.filter((type) => of.includes(type)) })).filter((g) => g.of.length),
				views: [{ name: "grid", previewImageUrl: (type) => `/studio-sections/${type}.jpg` }, { name: "list" }],
			},
		},
	});
}
