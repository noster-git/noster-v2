import { defineField, defineType } from "sanity";
import { LaunchIcon } from "@sanity/icons/Launch";
import { LINK_PREVIEW, describeLink } from "./link.js";

/** A button: its words, and where it goes. Every button on the site whose words or target are edited is one. */
export const cta = defineType({
	name: "cta",
	title: "Button",
	type: "object",
	icon: LaunchIcon,
	fields: [
		defineField({
			name: "label",
			title: "Words on the button",
			type: "string",
			description: "Short and clear, for example \"View all projects\".",
			validation: (rule) => rule.required().error("Add the words shown on the button."),
		}),
		defineField({
			name: "link",
			title: "Where it goes",
			type: "link",
			description: "The page, project, website, place on the page, phone number or email address the button opens.",
			validation: (rule) => rule.required().error("Choose where the button goes."),
		}),
	],
	preview: {
		select: { title: "label", ...LINK_PREVIEW("link") },
		prepare: ({ title, ...target }) => ({ title: title || "Button", subtitle: describeLink(target) }),
	},
});
