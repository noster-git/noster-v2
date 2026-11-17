import assert from "node:assert/strict";
import { test } from "node:test";
import { stegaEncodeSourceMap } from "@sanity/client/stega";
import { describeProject, lineBreaks, linkHref, plainText } from "./content.js";

/** A project as PROJECT_BY_SLUG returns it, with a brief and (optionally) a hero title. */
const project = ({ heroTitle, details = [], description = [], seo } = {}) => ({
	_id: "project-technopark",
	_type: "project",
	slug: "the-atomic_technopark",
	seo,
	sections: [
		...(heroTitle ? [{ _key: "h", _type: "projectHero", title: heroTitle }] : []),
		{ _key: "b", _type: "projectBrief", description, details },
	],
});

/** Encodes every string in `value` the way draft mode does, as if each came from the project's brief. */
function stega(value) {
	const paths = [];
	const mappings = {};
	for (const key of Object.keys(value)) {
		mappings[`$['${key}']`] = { source: { document: 0, path: paths.length, type: "documentValue" }, type: "value" };
		paths.push(`$['sections'][1]['details'][0]['${key}']`);
	}
	return stegaEncodeSourceMap(value, { documents: [{ _id: "project-technopark", _type: "project" }], paths, mappings }, { enabled: true, studioUrl: "/studio" });
}

test("linkHref gives the resolved href of a filled link", () => {
	assert.equal(linkHref({ kind: "internal", href: "/works/a" }), "/works/a");
	assert.equal(linkHref({ kind: "external", href: "https://example.com", openInNewTab: true }), "https://example.com");
});

test("linkHref gives null for an empty or half-filled link", () => {
	assert.equal(linkHref({ kind: "external" }), null);
	assert.equal(linkHref({ kind: "internal", href: null }), null);
	assert.equal(linkHref(undefined), null);
	assert.equal(linkHref(null), null);
});

test("plainText joins the text of every block", () => {
	const blocks = [
		{ _type: "block", children: [{ _type: "span", text: "One " }, { _type: "span", text: "two." }] },
		{ _type: "block", children: [{ _type: "span", text: "Three." }] },
	];
	assert.equal(plainText(blocks), "One two.\nThree.");
	assert.equal(plainText(undefined), "");
});

test("describeProject reads the location from the brief, without the state, even when the label is stega-encoded", () => {
	const detail = stega({ label: "Location", value: "Technopark, Trivandrum, Kerala" });
	assert.notEqual(detail.label, "Location"); // the fixture really is encoded
	const { location, locationPath } = describeProject(project({ heroTitle: "The Atomic", details: [{ _key: "0", ...detail }] }));
	assert.deepEqual(locationPath, ["sections", { _key: "b" }, "details", { _key: "0" }, "value"]);
	assert.equal(location, "Technopark, Trivandrum");
});

test("describeProject puts a multi-line location on one line", () => {
	const { location } = describeProject(project({ details: [{ _key: "0", label: "Location", value: "Infopark,\nKochi, Kerala" }] }));
	assert.equal(location, "Infopark, Kochi");
});

test("describeProject takes the name from the hero title, on one line", () => {
	assert.equal(describeProject(project({ heroTitle: "Good\nMethods  Global" })).name, "Good Methods Global");
});

test("describeProject without a hero title falls back to the search title, then to the title-cased slug", () => {
	assert.equal(describeProject(project({ seo: { title: "The Atomic | Noster" } })).name, "The Atomic");
	assert.equal(describeProject(project()).name, "The Atomic Technopark");
});

test("describeProject describes the project from its search description, else from the brief text", () => {
	const description = [{ _type: "block", children: [{ _type: "span", text: "A calm,\n\nbright office." }] }];
	assert.equal(describeProject(project({ description, seo: { description: "Set in search." } })).description, "Set in search.");
	assert.equal(describeProject(project({ description })).description, "A calm, bright office.");
	assert.equal(describeProject(project()).description, undefined);
});

test("lineBreaks gives each line break inside a span a span of its own, which renders as <br />, and drops empty lines' text", () => {
	const blocks = [
		{
			_key: "b",
			_type: "block",
			markDefs: [],
			children: [
				{ _key: "s0", _type: "span", marks: ["strong"], text: "One\n\nTwo" },
				{ _key: "s1", _type: "span", marks: [], text: " three" },
			],
		},
		{ _key: "i", _type: "image" },
	];
	assert.deepEqual(lineBreaks(blocks), [
		{
			_key: "b",
			_type: "block",
			markDefs: [],
			children: [
				{ _key: "s0", _type: "span", marks: ["strong"], text: "One" },
				{ _key: "s0-br1", _type: "span", marks: ["strong"], text: "\n" },
				{ _key: "s0-br2", _type: "span", marks: ["strong"], text: "\n" },
				{ _key: "s0-2", _type: "span", marks: ["strong"], text: "Two" },
				{ _key: "s1", _type: "span", marks: [], text: " three" },
			],
		},
		{ _key: "i", _type: "image" },
	]);
	assert.equal(lineBreaks(blocks)[0].children.at(-1), blocks[0].children[1]); // spans without a break are kept as they are
	assert.equal(lineBreaks(undefined), undefined);
});
