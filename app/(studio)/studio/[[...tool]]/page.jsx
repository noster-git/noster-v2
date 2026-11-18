import { Suspense } from "react";
import Studio from "./Studio";

// The studio is one client-side app: the server sends an empty shell and the studio renders in the browser.
export default function StudioPage() {
	return (
		<Suspense fallback={null}>
			<Studio />
		</Suspense>
	);
}
