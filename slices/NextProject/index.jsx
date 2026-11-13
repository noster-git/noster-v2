import { asLink } from "@prismicio/client";
import LineCta from "@/components/LineCta";

/**
 * "View Next Project" line link at the end of a project page, one line above the footer.
 *
 * @typedef {import("@prismicio/client").Content.NextProjectSlice} NextProjectSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<NextProjectSlice>} NextProjectProps
 * @type {import("react").FC<NextProjectProps>}
 */
const NextProject = ({ slice }) => {
	const href = asLink(slice.primary.project);
	if (!href) return null;

	return (
		<div data-slice-type={slice.slice_type} data-slice-variation={slice.variation}>
			<LineCta href={href} className="pt-8">
				View Next Project
			</LineCta>
		</div>
	);
};

export default NextProject;
