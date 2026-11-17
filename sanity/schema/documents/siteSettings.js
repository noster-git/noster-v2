import { defineArrayMember, defineField, defineType } from "sanity";
import { CogIcon } from "@sanity/icons/Cog";
import { CONTENT, SEO } from "./groups.js";

export const siteSettings = defineType({
	name: "siteSettings",
	title: "Site settings",
	type: "document",
	icon: CogIcon,
	groups: [{ ...CONTENT, title: "Studio" }, SEO],
	fields: [
		defineField({
			name: "name",
			title: "Studio name",
			type: "string",
			description: "The studio's full name, for example \"Noster Associates\". Used in the footer and for search engines.",
			group: "content",
			validation: (rule) => rule.required().error("Add the studio's name."),
		}),
		defineField({
			name: "email",
			title: "Main email address",
			type: "string",
			description: "The address for new business, shown in the contact details at the foot of every page.",
			group: "content",
			validation: (rule) => rule.regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { name: "email address" }).error("This doesn't look like an email address."),
		}),
		defineField({
			name: "phones",
			title: "Phone numbers",
			type: "array",
			description: "The numbers shown under the email in the contact details. Drag to change the order.",
			group: "content",
			of: [
				defineArrayMember({
					type: "object",
					name: "phoneNumber",
					title: "Phone number",
					fields: [
						defineField({
							name: "number",
							title: "Number",
							type: "string",
							description: "As it should appear, with the country code, for example +91 88484 343 03.",
							validation: (rule) => rule.required().regex(/^\+?[\d\s()-]{6,}$/, { name: "phone number" }).error("Use digits only, with the country code."),
						}),
					],
					preview: { select: { title: "number" } },
				}),
			],
		}),
		defineField({
			name: "offices",
			title: "Offices",
			type: "array",
			description: "The offices in the footer, in this order. Drag to change the order; edit an office's address in Library › Offices.",
			group: "content",
			of: [defineArrayMember({ type: "reference", to: [{ type: "office" }], options: { disableNew: false } })],
			validation: (rule) => rule.unique().error("Each office can be listed once."),
		}),
		defineField({
			name: "socials",
			title: "Social links",
			type: "array",
			description: "The studio's social media pages, in the footer and for search engines. Drag to change the order.",
			group: "content",
			of: [
				defineArrayMember({
					type: "object",
					name: "social",
					title: "Social link",
					fields: [
						defineField({
							name: "label",
							title: "Label",
							type: "string",
							description: "The name shown for the link, for example \"Instagram\".",
							validation: (rule) => rule.required().error("Add the name shown for the link."),
						}),
						defineField({
							name: "url",
							title: "Web address",
							type: "url",
							description: "The full address of the page, starting with https://",
							validation: (rule) => rule.required().uri({ scheme: ["https", "http"] }).error("Add the page's full address, starting with https://"),
						}),
					],
					preview: { select: { title: "label", subtitle: "url" } },
				}),
			],
		}),
		defineField({
			name: "seo",
			title: "Default search and sharing",
			type: "seo",
			description: "Used by any page whose own Search & sharing fields are empty.",
			group: "seo",
		}),
		defineField({
			name: "organizationDescription",
			title: "Studio description for search engines",
			type: "text",
			rows: 3,
			description: "One or two sentences about the studio that search engines and AI tools read as its description.",
			group: "seo",
			validation: (rule) => rule.max(300).warning("Keep it to about two sentences."),
		}),
	],
	preview: { prepare: () => ({ title: "Site settings" }) },
});
