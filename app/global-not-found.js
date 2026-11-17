import SiteLayout, { metadata as siteMetadata, viewport } from "./(site)/layout";
import NotFound, { metadata as notFoundMetadata } from "./(site)/not-found";

// An address no route matches. With two root layouts there is no single layout to wrap the not-found page
// in, so this renders it inside the site's own layout, nav and footer included.
export const metadata = { ...siteMetadata, ...notFoundMetadata };
export { viewport };

export default function GlobalNotFound() {
	return (
		<SiteLayout>
			<NotFound />
		</SiteLayout>
	);
}
