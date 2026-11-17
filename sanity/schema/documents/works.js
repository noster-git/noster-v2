import { defineArrayMember, defineField, defineType } from "sanity";
import { ThLargeIcon } from "@sanity/icons/ThLarge";
import { CONTENT, SEO } from "./groups.js";

export const works = defineType({
	name: "works",
	title: "Works page",
	type: "document",
	icon: ThLargeIcon,
	groups: [CONTENT, SEO],
	fields: [
		defineField({
			name: "title",
			title: "Title",
			type: "string",
			group: "content",
			description: "The heading at the top of the page with all projects, for example \"Our Works\".",
		}),
		defineField({
			name: "projects",
			title: "Project order",
			type: "array",
			group: "content",
			description:
				"The order projects are listed in on the Works page, first at the top. Drag to change it. A project left out of the list is shown after these, newest first. Each project's \"View Next Project\" link leads to the one after it.",
			of: [defineArrayMember({ type: "reference", to: [{ type: "project" }], options: { disableNew: true } })],
			validation: (rule) => rule.unique().error("Each project can be in the list once."),
		}),
		defineField({
			name: "nextProjectLabel",
			title: "Next project button",
			type: "string",
			group: "content",
			description: "The words on the button at the foot of every project page that opens the next project, for example \"View Next Project\".",
		}),
		defineField({
			name: "seo",
			title: "Search and sharing",
			type: "seo",
			group: "seo",
			description: "How the Works page looks in Google results and in shared links.",
		}),
	],
	preview: { prepare: () => ({ title: "Works page" }) },
});
