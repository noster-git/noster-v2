import assert from "node:assert/strict";
import { test } from "node:test";
import { resolve } from "./presentation.js";
import { schemaTypes } from "./schema/index.js";

const hrefs = (state) => state?.locations?.map((l) => l.href);
const DOCUMENT_TYPES = schemaTypes.filter((t) => t.type === "document").map((t) => t.name);

test("every document type lists where it shows", () => {
	assert.deepEqual(Object.keys(resolve.locations).sort(), [...DOCUMENT_TYPES].sort());
});

test("one-off pages point at their own page", () => {
	assert.deepEqual(hrefs(resolve.locations.works), ["/works"]);
	assert.deepEqual(hrefs(resolve.locations.privacyPolicy), ["/privacy_policy"]);
	assert.equal(hrefs(resolve.locations.home)[0], "/");
	for (const type of ["home", "navigation", "footer"]) assert.deepEqual(hrefs(resolve.locations[type]), ["/", "/works", "/privacy_policy"]);
});

test("a project points at its page, titled with its hero title", () => {
	const { select, resolve: locate } = resolve.locations.project;
	assert.deepEqual(select, { slug: "slug.current", sections: "sections" });
	const doc = { slug: "villa-aurora", sections: [{ _type: "projectBrief" }, { _type: "projectHero", title: " Villa\nAurora " }] };
	assert.deepEqual(locate(doc), { locations: [{ title: "Villa Aurora", href: "/works/villa-aurora" }] });
	assert.deepEqual(locate({ slug: "villa-aurora" }), { locations: [{ title: "villa-aurora", href: "/works/villa-aurora" }] });
	assert.equal(locate({ sections: [] }), null);
	assert.equal(locate(null), null);
});

test("each page opens its document", () => {
	const byRoute = Object.fromEntries(resolve.mainDocuments.map((d) => [d.route, d]));
	assert.equal(byRoute["/"].type, "home");
	assert.equal(byRoute["/works"].type, "works");
	assert.equal(byRoute["/privacy_policy"].type, "privacyPolicy");
	const project = byRoute["/works/:slug"];
	assert.equal(project.filter, `_type == "project" && slug.current == $slug`);
	assert.deepEqual(project.params({ origin: "http://localhost", path: "/works/villa-aurora", params: { slug: "villa-aurora" } }), { slug: "villa-aurora" });
});
