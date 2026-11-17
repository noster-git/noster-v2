import { SliceSimulator, getSlices } from "@prismicio/next";
import { SliceZone } from "@prismicio/react";

import { components } from "../../slices";

// The slice preview Slice Machine loads in an iframe: never a page for search engines.
export const metadata = { robots: { index: false, follow: false } };

export default async function SliceSimulatorPage({ searchParams }) {
	const { state } = await searchParams
	const slices = getSlices(state);

	return (
		<SliceSimulator>
			<SliceZone slices={slices} components={components} />
		</SliceSimulator>
	);
}