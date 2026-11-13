/** Structured data for search and answer engines (schema.org JSON-LD). */
export default function JsonLd({ data }) {
	return (
		<script
			type="application/ld+json"
			// "<" escaped so content can't close the script tag.
			dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
		/>
	);
}
