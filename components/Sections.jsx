import { stegaClean } from "next-sanity";
import { components } from "@/sections";

/**
 * A page's sections in order, each rendered by the component for its type (sections/index.js). A section
 * of a type the site has no component for is skipped. `context` is passed to every section.
 *
 * @param {{ sections: Array<{ _type: string, _key: string }> | null | undefined, context?: Record<string, unknown> }} props
 */
export default function Sections({ sections, context }) {
	return (sections ?? []).map((section) => {
		const Section = components[stegaClean(section._type)];
		return Section ? <Section key={section._key} section={section} context={context} /> : null;
	});
}
