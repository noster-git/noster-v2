import { defineField, defineType } from "sanity";

export const nextProject = defineType({
	name: "nextProject",
	title: "Next Project",
	type: "object",
	description: "A link at the bottom of a project page that leads on to another project.",
	fields: [
		defineField({
			name: "project",
			title: "Project",
			type: "reference",
			to: [{ type: "project" }],
			description: "The project visitors are sent to next.",
		}),
	],
	preview: {
		select: { title: "project.slug.current" },
		prepare: ({ title }) => ({ title: title || "Next Project", subtitle: "Next Project" }),
	},
});
