import { defineArrayMember, defineField, defineType } from "sanity";

const linkAnnotation = {
	name: "link",
	title: "Link",
	type: "object",
	fields: [
		defineField({
			name: "href",
			title: "Web address",
			type: "url",
			description: "Where the selected words lead. Start with https://",
			validation: (rule) => rule.uri({ scheme: ["http", "https", "mailto", "tel"] }),
		}),
	],
};

const decorators = [
	{ title: "Bold", value: "strong" },
	{ title: "Italic", value: "em" },
];

/** Rich text for the privacy policy: headings, lists, bold, italic and links. */
export const blockContent = defineType({
	name: "blockContent",
	title: "Rich text",
	type: "array",
	of: [
		defineArrayMember({
			type: "block",
			styles: [
				{ title: "Paragraph", value: "normal" },
				{ title: "Section title (H2)", value: "h2" },
				{ title: "Subtitle (H3)", value: "h3" },
				{ title: "Topic (H4)", value: "h4" },
				{ title: "Lead line (H5)", value: "h5" },
			],
			lists: [
				{ title: "Bullets", value: "bullet" },
				{ title: "Numbers", value: "number" },
			],
			marks: { decorators, annotations: [linkAnnotation] },
		}),
	],
});

/** Rich text for a project brief: paragraphs, bold, italic and links only. */
export const briefContent = defineType({
	name: "briefContent",
	title: "Brief text",
	type: "array",
	of: [
		defineArrayMember({
			type: "block",
			styles: [{ title: "Paragraph", value: "normal" }],
			lists: [],
			marks: { decorators, annotations: [linkAnnotation] },
		}),
	],
});
