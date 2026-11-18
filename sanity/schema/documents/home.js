import { defineField, defineType } from "sanity";
import { HomeIcon } from "@sanity/icons/Home";
import { PAGE_SECTIONS, sectionsField } from "../sections/index.js";
import { CONTENT, SEO } from "./groups.js";

export const home = defineType({
	name: "home",
	title: "Home page",
	type: "document",
	icon: HomeIcon,
	groups: [CONTENT, SEO],
	fields: [
		sectionsField({
			of: PAGE_SECTIONS,
			group: "content",
			description: "The home page is built from these blocks, top to bottom. Drag to reorder, or add a new one.",
		}),
		defineField({
			name: "seo",
			title: "Search and sharing",
			type: "seo",
			group: "seo",
			description: "How the home page looks in Google results and in shared links.",
		}),
	],
	preview: { prepare: () => ({ title: "Home page" }) },
});
