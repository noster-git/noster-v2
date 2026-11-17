import LineCta from "@/components/LineCta";
import Reveal from "@/components/Reveal";

export const metadata = {
	title: "Page not found | Noster Associates",
	robots: { index: false, follow: true },
};

/** Any address with no page (and every notFound() call), inside the site's nav and footer. */
export default function NotFound() {
	return (
		<>
			<Reveal as="div" className="grid-site items-start px-m pt-page pb-4">
				<h1 data-reveal="lines" className="col-span-5 text-title desk:col-span-6">
					Page not found
				</h1>
				<p data-reveal className="col-span-5 mt-2 text-muted desk:col-span-6">
					The page you&apos;re looking for doesn&apos;t exist or has moved.
				</p>
			</Reveal>
			<LineCta href="/">Back to home</LineCta>
		</>
	);
}
