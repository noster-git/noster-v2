import { asLink } from "@prismicio/client";
import { getPreviewRef } from "@prismicio/next";
import LineCta from "@/components/LineCta";
import { getProjectMedia } from "@/lib/projects";

/**
 * "View Next Project" line link at the end of a project page, spaced like Home's sections, with a
 * small 5:3 crop of the next project's hero photo before the label.
 *
 * @typedef {import("@prismicio/client").Content.NextProjectSlice} NextProjectSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<NextProjectSlice>} NextProjectProps
 * @type {import("react").FC<NextProjectProps>}
 */
const NextProject = async ({ slice }) => {
	const href = asLink(slice.primary.project);
	if (!href) return null;
	const media = await getProjectMedia(await getPreviewRef());
	const next = media[href];

	return (
		<div data-slice-type={slice.slice_type} data-slice-variation={slice.variation}>
			{/* The accessible name starts with the visible words and adds which project comes next. */}
			<LineCta href={href} image={next?.hero} label={next?.name ? `View Next Project: ${next.name}` : undefined} className="pt-6 pb-6">
				View Next Project
			</LineCta>
		</div>
	);
};

export default NextProject;
