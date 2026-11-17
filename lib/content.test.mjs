import assert from "node:assert/strict";
import { test } from "node:test";
import { stegaEncodeSourceMap } from "@sanity/client/stega";
import { describeProject, lineBreaks, linkHref, opensNewTab, plainText, safeHref, telHref } from "./content.js";

/** A project as PROJECT_BY_SLUG returns it. */
const project = (fields = {}) => ({
	_id: "project-adesso",
	_type: "project",
	slug: "adesso_kochi",
	clients: ["Adesso"],
	sectors: ["IT Services"],
	area: "Infopark",
	city: { name: "Kochi", state: "Kerala" },
	status: "delivered",
	completion: { year: 2024, month: 7 },
	services: ["Interior Design", "Construction", "Furniture Design"],
	size: 13000,
	...fields,
});

/** Encodes every string in `value` the way draft mode does, as if each came from the project. */
function stega(value) {
	const paths = [];
	const mappings = {};
	for (const key of Object.keys(value)) {
		if (typeof value[key] !== "string") continue;
		mappings[`$['${key}']`] = { source: { document: 0, path: paths.length, type: "documentValue" }, type: "value" };
		paths.push(`$['${key}']`);
	}
	return stegaEncodeSourceMap(value, { documents: [{ _id: "project-adesso", _type: "project" }], paths, mappings }, { enabled: true, studioUrl: "/studio" });
}

test("linkHref makes each kind of link's address", () => {
	assert.equal(linkHref({ kind: "page", path: "/works" }), "/works");
	assert.equal(linkHref({ kind: "project", path: "/works/adesso" }), "/works/adesso");
	assert.equal(linkHref({ kind: "url", url: "https://example.com" }), "https://example.com");
	assert.equal(linkHref({ kind: "anchor", anchor: "contact" }), "#contact");
	assert.equal(linkHref({ kind: "anchor", anchor: "#contact" }), "#contact");
	assert.equal(linkHref({ kind: "phone", phone: "+91 88484 343 03" }), "tel:+918848434303");
	assert.equal(linkHref({ kind: "email", email: " info@noster.in " }), "mailto:info@noster.in");
});

test("linkHref gives null for an empty or half-filled link, or a target of the wrong kind", () => {
	for (const link of [
		{ kind: "page" },
		{ kind: "project", path: null },
		{ kind: "url" },
		{ kind: "url", url: "/works" },
		{ kind: "url", url: "javascript:alert(1)" },
		{ kind: "anchor", anchor: " " },
		{ kind: "phone", phone: "call us" },
		{ kind: "email", email: "info" },
		{ kind: "something", path: "/works" },
		undefined,
		null,
	]) {
		assert.equal(linkHref(link), null, JSON.stringify(link));
	}
});

test("only a link to another website opens in a new tab", () => {
	assert.equal(opensNewTab({ kind: "url", url: "https://x.com", openInNewTab: true }), true);
	assert.equal(opensNewTab({ kind: "page", path: "/works", openInNewTab: true }), false);
	assert.equal(opensNewTab({ kind: "url", url: "https://x.com" }), false);
	assert.equal(telHref(" +91 (0) 88484-343 03 "), "tel:+9108848434303");
});

test("safeHref lets through web, email, phone, site and on-page addresses", () => {
	for (const href of ["https://example.com/a", "http://example.com", "mailto:hi@noster.in", "tel:+914712345678", "/works", "/works/a?x=1", "#contact", " /privacy_policy "]) {
		assert.equal(safeHref(href), href.trim(), href);
	}
});

test("safeHref turns away scripts, data, other-site paths and anything else, so the link renders as text", () => {
	for (const href of ["javascript:alert(1)", " JavaScript:alert(1)", "\u0001javascript:alert(1)", "java\tscript:alert(1)", "data:text/html,<b>x</b>", "vbscript:x", "//evil.example", "/\\evil.example", "/\t/evil.com", "/\n/evil.com", "/\r\n/evil.com", "ftp://x", "works", "", null, undefined]) {
		assert.equal(safeHref(href), null, String(href));
	}
});

test("plainText joins the text of every block", () => {
	const blocks = [
		{ _type: "block", children: [{ _type: "span", text: "One " }, { _type: "span", text: "two." }] },
		{ _type: "block", children: [{ _type: "span", text: "Three." }] },
	];
	assert.equal(plainText(blocks), "One two.\nThree.");
	assert.equal(plainText(undefined), "");
});

test("describeProject gives the hero's place without the state, and the facts, even with draft mode's markers", () => {
	const encoded = stega(project());
	assert.notEqual(encoded.area, "Infopark"); // the fixture really is encoded
	const { name, location, facts } = describeProject({ ...encoded, slug: "adesso_kochi", name: stega({ name: "Adesso" }).name });
	assert.equal(name, "Adesso");
	assert.equal(location, "Infopark, Kochi");
	assert.deepEqual(
		facts.map((f) => [f.label, f.value]),
		[
			["Client", "Adesso"],
			["Sector", "IT Services"],
			["Status", "Project delivered in\nJuly 2024"],
			["Location", "Infopark,\nKochi, Kerala"],
			["Scope", "Interior Design,\nConstruction, Furniture Design"],
			["Scale", "13,000 sq ft"],
		],
	);
});

test("describeProject without an area places the project in its city", () => {
	assert.equal(describeProject(project({ area: null })).location, "Kochi");
	assert.equal(describeProject(project({ area: null, city: null })).location, undefined);
});

test("describeProject takes the name on one line; without one, the search title, then the title-cased slug", () => {
	assert.equal(describeProject(project({ name: "Good\nMethods  Global" })).name, "Good Methods Global");
	assert.equal(describeProject(project({ seo: { title: "The Atomic | Noster" } })).name, "The Atomic");
	assert.equal(describeProject(project()).name, "Adesso Kochi");
});

test("describeProject describes the project from its search description, else from its text", () => {
	const summary = [{ _type: "block", children: [{ _type: "span", text: "A calm,\n\nbright office." }] }];
	assert.equal(describeProject(project({ summary, seo: { description: "Set in search." } })).description, "Set in search.");
	assert.equal(describeProject(project({ summary })).description, "A calm, bright office.");
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
