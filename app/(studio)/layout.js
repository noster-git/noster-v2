export { metadata, viewport } from "next-sanity/studio";

// The studio is its own document: no site styles, scripts, navigation or footer.
export default function StudioLayout({ children }) {
	return (
		<html lang="en">
			<body style={{ margin: 0 }}>{children}</body>
		</html>
	);
}
