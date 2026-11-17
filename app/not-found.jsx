import LineCta from "@/components/LineCta";

export const metadata = {
	title: "Page not found | Noster",
	robots: { index: false, follow: true },
};

/** Any address with no page (and every notFound() call), inside the site's nav and footer. */
export default function NotFound() {
	return (
		<>
			<div className="grid-site items-start px-m pt-page pb-4">
				<h1 className="col-span-5 text-title desk:col-span-6">Page not found</h1>
				<p className="col-span-5 mt-2 text-muted desk:col-span-6">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
			</div>
			<LineCta href="/">Back to home</LineCta>
		</>
	);
}
