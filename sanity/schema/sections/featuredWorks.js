import { defineArrayMember, defineField, defineType } from "sanity";
import { ThLargeIcon } from "@sanity/icons/ThLarge";

export const featuredWorks = defineType({
	name: "featuredWorks",
	title: "Featured Works",
	type: "object",
	icon: ThLargeIcon,
	description: "A selection of projects shown as photo cards, with a button under them.",
	fields: [
		defineField({
			name: "title",
			title: "Title",
			type: "text",
			rows: 2,
			description: "The section heading, for example \"Featured Works\".",
		}),
		defineField({
			name: "projects",
			title: "Projects",
			type: "array",
			description: "One card per project, in this order. Drag to change the order.",
			of: [
				defineArrayMember({
					type: "object",
					name: "featuredProject",
					title: "Project card",
					fields: [
						defineField({
							name: "project",
							title: "Project",
							type: "reference",
							to: [{ type: "project" }],
							description: "The project the card shows and opens.",
							validation: (rule) => rule.required().error("Choose the project."),
						}),
						defineField({
							name: "image",
							title: "Photo for this card (optional)",
							type: "imageWithAlt",
							description: "Leave empty to use the project's own card photo. Add one only to show a different photo here.",
						}),
					],
					preview: {
						select: { title: "project.name", hero: "project.heroImage", card: "project.cardImage", image: "image" },
						prepare: ({ title, hero, card, image }) => ({ title: title || "Choose a project", media: image?.asset ? image : card?.asset ? card : hero }),
					},
				}),
			],
			validation: (rule) => [
				rule.max(15).warning("More than 15 cards make the home page very long."),
				rule.custom((items) => {
					const refs = (items ?? []).map((entry) => entry.project?._ref).filter(Boolean);
					return new Set(refs).size === refs.length ? true : "Each project can have one card.";
				}),
			],
		}),
		defineField({
			name: "cta",
			title: "Button",
			type: "cta",
			description: "The button under the cards, for example \"View all projects\", leading to the Works page.",
		}),
	],
	preview: {
		select: { title: "title", projects: "projects", media: "projects.0.project.heroImage" },
		prepare: ({ title, projects, media }) => ({
			title: title?.replace(/\s+/g, " ") || "Featured Works",
			subtitle: `Featured Works, ${projects?.length || 0} projects`,
			media,
		}),
	},
});
