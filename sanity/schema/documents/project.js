import { defineArrayMember, defineField, defineType } from "sanity";
import { ProjectsIcon } from "@sanity/icons/Projects";
import { PROJECT_SECTIONS, sectionsField } from "../sections/index.js";
import { CONTENT, DETAILS, SEO } from "./groups.js";

export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** An array of references to one library type; a new record can be made from the picker. */
const references = (type) => [defineArrayMember({ type: "reference", to: [{ type }], options: { disableNew: false } })];

/** The document's published ID, whether it is the draft or not. */
const publishedId = (id = "") => id.replace(/^drafts\./, "");

export const project = defineType({
	name: "project",
	title: "Project",
	type: "document",
	icon: ProjectsIcon,
	groups: [CONTENT, DETAILS, SEO],
	fieldsets: [
		{ name: "where", title: "Where", options: { columns: 2 } },
		{ name: "when", title: "When", options: { columns: 2 } },
	],
	fields: [
		defineField({
			name: "name",
			title: "Name",
			type: "string",
			group: "content",
			description: "The project name, shown large over its photo and on its card, for example \"Adesso\".",
			validation: (rule) => rule.required().error("Add the project's name."),
		}),
		defineField({
			name: "slug",
			title: "Web address ending",
			type: "slug",
			group: "content",
			description: "The last part of the project's web address: \"adesso\" makes /works/adesso. Click Generate to make it from the name.",
			options: { source: "name", maxLength: 96 },
			validation: (rule) => rule.required().error("Click Generate to make the web address."),
		}),
		defineField({
			name: "heroImage",
			title: "Main photo",
			type: "imageWithAlt",
			group: "content",
			description: "The large photo at the top of the project page. Also on the project's card unless a card photo is set.",
			validation: (rule) => rule.required().error("Add the main photo."),
		}),
		defineField({
			name: "cardImage",
			title: "Card photo (optional)",
			type: "imageWithAlt",
			group: "content",
			description: "A different photo for the project's card on the Home and Works pages. Leave empty to use the main photo.",
		}),
		defineField({
			name: "summary",
			title: "About the project",
			type: "briefContent",
			group: "content",
			description: "A few paragraphs about the project, beside its details. You can use bold, italic and links.",
		}),
		defineField({
			name: "photos",
			title: "Photos",
			type: "array",
			group: "content",
			description: "The project's photos, under the text. Drag to change the order.",
			of: [defineArrayMember({ type: "imageWithAlt" })],
			options: { layout: "grid" },
		}),
		sectionsField({
			of: PROJECT_SECTIONS,
			group: "content",
			description: "Optional extra blocks under the photos. Most projects need none.",
		}),
		defineField({
			name: "clients",
			title: "Client",
			type: "array",
			group: "details",
			description: "Who the project was for. Add a second client when two companies share the space; they are shown joined by \"&\".",
			of: references("client"),
			validation: (rule) => [rule.required().min(1).error("Choose the client."), rule.unique().error("Each client can be picked once.")],
		}),
		defineField({
			name: "sectors",
			title: "Sector",
			type: "array",
			group: "details",
			description: "The client's line of business, one or more, in the order they are shown.",
			of: references("sector"),
			validation: (rule) => rule.unique().error("Each sector can be picked once."),
		}),
		defineField({
			name: "area",
			title: "Area",
			type: "string",
			group: "details",
			fieldset: "where",
			description: "The business park or part of the city, for example \"Technopark Phase 3\".",
		}),
		defineField({
			name: "city",
			title: "City",
			type: "reference",
			group: "details",
			fieldset: "where",
			to: [{ type: "city" }],
			description: "The city the project is in.",
			options: { disableNew: false },
			validation: (rule) => rule.required().error("Choose the city."),
		}),
		defineField({
			name: "status",
			title: "Status",
			type: "string",
			group: "details",
			fieldset: "when",
			description: "Whether the project has been handed over.",
			options: {
				list: [
					{ title: "Delivered", value: "delivered" },
					{ title: "In progress", value: "inProgress" },
				],
				layout: "radio",
			},
			initialValue: "delivered",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "completion",
			title: "Handover",
			type: "object",
			group: "details",
			fieldset: "when",
			description: "The month and year it was handed over, or is due to be.",
			options: { columns: 2 },
			fields: [
				defineField({
					name: "month",
					title: "Month",
					type: "number",
					description: "Leave empty to show the year only.",
					options: { list: MONTHS.map((title, i) => ({ title, value: i + 1 })) },
				}),
				defineField({
					name: "year",
					title: "Year",
					type: "number",
					description: "For example 2024.",
					validation: (rule) => rule.integer().min(1990).max(2100).error("Use a four-digit year."),
				}),
			],
		}),
		defineField({
			name: "services",
			title: "Scope",
			type: "array",
			group: "details",
			description: "What the studio did, in the order shown, for example Interior Design, Construction, Furniture Design.",
			of: references("service"),
			validation: (rule) => rule.unique().error("Each service can be picked once."),
		}),
		defineField({
			name: "size",
			title: "Size in square feet",
			type: "number",
			group: "details",
			description: "The floor area as a plain number, for example 13000. Shown as \"13,000 sq ft\".",
			validation: (rule) => rule.positive().integer().error("Use a whole number of square feet."),
		}),
		defineField({
			name: "nextProject",
			title: "Next project (optional)",
			type: "reference",
			group: "details",
			to: [{ type: "project" }],
			description: "The project the button at the foot of the page leads to. Leave empty to lead to the next one in the Works page order.",
			options: {
				disableNew: true,
				filter: ({ document }) => {
					const id = publishedId(document._id);
					return { filter: "!(_id in [$id, $draft])", params: { id, draft: `drafts.${id}` } };
				},
			},
		}),
		defineField({
			name: "seo",
			title: "Search and sharing",
			type: "seo",
			group: "seo",
			description: "How this project looks in Google results and in shared links. Empty fields are filled in from the project.",
		}),
	],
	orderings: [
		{ title: "Name", name: "name", by: [{ field: "name", direction: "asc" }] },
		{ title: "Newest handover", name: "completion", by: [{ field: "completion.year", direction: "desc" }, { field: "completion.month", direction: "desc" }] },
	],
	preview: {
		select: { title: "name", media: "heroImage", area: "area", city: "city.name", year: "completion.year", status: "status" },
		prepare: ({ title, media, area, city, year, status }) => ({
			title: title || "New project",
			subtitle: [[area, city].filter(Boolean).join(", "), status === "inProgress" ? "In progress" : year].filter(Boolean).join(" · "),
			media,
		}),
	},
});
