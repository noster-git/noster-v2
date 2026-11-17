import { fetchOptions } from "@/lib/sanity/live";
import { getSettings } from "@/lib/settings";
import { editor } from "@/lib/sanity/edit";
import { editProps } from "@/lib/sanity/edit-props";
import Reveal from "@/components/Reveal";
import SectionLabel from "@/components/SectionLabel";
import ContactRows from "@/components/ContactRows";

/**
 * An invitation to get in touch: the title at display size with its section index, then the intro and the
 * studio's email and phone numbers from Settings (ContactRows), in columns 5–10 on desk. In the studio's
 * live preview the title and intro open the section, the contact details Settings.
 *
 * @param {{ section: { title?: string | null, intro?: string | null }, edit: import("@/lib/sanity/edit").Edit }} props
 */
const Contact = async ({ section, edit }) => {
	const options = await fetchOptions();
	const settings = await getSettings(options);

	return (
		<Reveal className="grid-site px-m pt-10 pb-6" {...editProps(edit())}>
			<SectionLabel as="div" top className="col-span-5 desk:col-span-10">
				<h2 data-reveal="lines" className="min-w-0 text-display text-balance">
					{section.title}
				</h2>
			</SectionLabel>
			<div className="col-span-5 mt-5 desk:col-span-6 desk:col-start-5 desk:mt-8">
				{section.intro && (
					<p data-reveal className="pb-rule">
						{section.intro}
					</p>
				)}
				<ContactRows data-reveal settings={settings} edit={editor(settings, options.stega)} />
			</div>
		</Reveal>
	);
};

export default Contact;
