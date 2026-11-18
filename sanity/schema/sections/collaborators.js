import { defineArrayMember, defineField, defineType } from "sanity";
import { UsersIcon } from "@sanity/icons/Users";

export const collaborators = defineType({
	name: "collaborators",
	title: "Collaborators",
	type: "object",
	icon: UsersIcon,
	description: "A row of logos of the companies the studio works with.",
	fields: [
		defineField({
			name: "title",
			title: "Title",
			type: "text",
			rows: 2,
			description: "The section heading, for example \"Our Collaborators\".",
		}),
		defineField({
			name: "clients",
			title: "Clients",
			type: "array",
			description: "The clients whose logos are shown. Only clients with a logo can be picked. Drag to change the order.",
			of: [
				defineArrayMember({
					type: "reference",
					to: [{ type: "client" }],
					options: { filter: "defined(logo.asset)" },
				}),
			],
			validation: (rule) => rule.unique().error("Each client can be in the row once."),
		}),
	],
	preview: {
		select: { title: "title", clients: "clients", logo: "clients.0.logo" },
		prepare: ({ title, clients, logo }) => ({
			title: title?.replace(/\s+/g, " ") || "Collaborators",
			subtitle: `Collaborators, ${clients?.length || 0} logos`,
			media: logo,
		}),
	},
});
