import { asText } from "@prismicio/client";
import ContactClient from "./ContactClient";

/**
 * "Let's Build Together": huge title (×3 on desktop), intro text left, email/phone links right.
 * Scroll behaviour (page turns dark, title copies slide in, lines draw) lives in ContactClient.
 *
 * @typedef {import("@prismicio/client").Content.ContactSlice} ContactSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<ContactSlice>} ContactProps
 * @type {import("react").FC<ContactProps>}
 */
const Contact = ({ slice }) => {
	const contacts = slice.primary.contacts
		.map((c) => c.value?.trim())
		.filter(Boolean)
		.map((value) => ({
			value,
			href: value.includes("@") ? `mailto:${value}` : `tel:${value.replace(/\s+/g, "")}`,
		}));

	return (
		<ContactClient
			sliceType={slice.slice_type}
			variation={slice.variation}
			title={asText(slice.primary.title)}
			intro={slice.primary.intro}
			contacts={contacts}
		/>
	);
};

export default Contact;
