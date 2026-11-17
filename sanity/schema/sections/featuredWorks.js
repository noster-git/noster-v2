import { defineArrayMember, defineField, defineType } from "sanity";

export const featuredWorks = defineType({
	name: "featuredWorks",
	title: "Featured Works",
	type: "object",
	description: "A selection of projects shown as cards on the home page.",
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
			description: "One card per project. Drag to change the order.",
			of: [
				defineArrayMember({
					type: "object",
					name: "featuredProject",
					fields: [
						defineField({
							name: "name",
							title: "Name",
							type: "string",
							description: "The project name shown on the card.",
						}),
						defineField({
							name: "description",
							title: "Description",
							type: "string",
							description: "A short line under the name, such as the place or type of project.",
						}),
						defineField({
							name: "image",
							title: "Photo",
							type: "imageWithAlt",
							description: "The photo shown on the card.",
						}),
						defineField({
							name: "project",
							title: "Project page",
							type: "reference",
							to: [{ type: "project" }],
							description: "The project page the card opens.",
						}),
					],
					preview: {
						select: { title: "name", subtitle: "description", media: "image" },
					},
				}),
			],
		}),
		defineField({
			name: "buttonText",
			title: "Button text",
			type: "string",
			description: "The label on the button that opens the full list of projects, for example \"View all projects\".",
		}),
	],
	preview: {
		select: { title: "title", projects: "projects" },
		prepare: ({ title, projects }) => ({
			title: title || "Featured Works",
			subtitle: `Featured Works, ${projects?.length || 0} projects`,
			media: projects?.[0]?.image,
		}),
	},
});
