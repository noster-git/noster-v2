import { defineArrayMember, defineField, defineType } from "sanity";

export const projectBrief = defineType({
	name: "projectBrief",
	title: "Project Brief",
	type: "object",
	description: "A written summary of the project and a list of facts such as client and location.",
	fields: [
		defineField({
			name: "description",
			title: "Description",
			type: "briefContent",
			description: "A few paragraphs about the project. You can use bold, italic and links.",
		}),
		defineField({
			name: "details",
			title: "Details",
			type: "array",
			description: "Facts about the project, shown as label and value pairs. Drag to change the order.",
			of: [
				defineArrayMember({
					type: "object",
					name: "detail",
					fields: [
						defineField({
							name: "label",
							title: "Label",
							type: "string",
							description: "What the fact is, for example \"Client\" or \"Location\".",
						}),
						defineField({
							name: "value",
							title: "Value",
							type: "string",
							description: "The fact itself, for example the client's name.",
						}),
					],
					preview: { select: { title: "label", subtitle: "value" } },
				}),
			],
		}),
	],
	preview: {
		select: { details: "details" },
		prepare: ({ details }) => ({ title: "Project Brief", subtitle: `${details?.length || 0} details` }),
	},
});
