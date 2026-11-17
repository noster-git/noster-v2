import { defineArrayMember, defineField, defineType } from "sanity";

export const project = defineType({
	name: "project",
	title: "Project",
	type: "document",
	fields: [
		defineField({
			name: "slug",
			title: "Web address ending",
			type: "slug",
			description: "The last part of the project web address, for example \"villa-aurora\". Click Generate to create it from the project title.",
			options: { source: (doc) => doc.sections?.find((s) => s._type === "projectHero")?.title || "", maxLength: 96 },
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "sections",
			title: "Sections",
			type: "array",
			description: "The project page is built from these blocks, top to bottom. Drag to reorder, or add a new one.",
			of: ["projectHero", "projectBrief", "projectImages", "nextProject"].map((type) => defineArrayMember({ type })),
		}),
		defineField({
			name: "seo",
			title: "Search and sharing",
			type: "seo",
			description: "How this project looks in Google results and in shared links.",
		}),
	],
	preview: {
		select: { sections: "sections", slug: "slug.current" },
		prepare: ({ sections, slug }) => {
			const hero = sections?.find((s) => s._type === "projectHero");
			return { title: hero?.title || slug || "Untitled project", subtitle: slug ? `/${slug}` : undefined, media: hero?.image };
		},
	},
});
