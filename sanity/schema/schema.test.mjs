import assert from "node:assert/strict";
import { test } from "node:test";
import { LIBRARY_TYPES, SINGLETON_TYPES, schemaTypes } from "./index.js";
import { PAGE_SECTIONS, PROJECT_SECTIONS } from "./sections/index.js";
import { describeLink, linkProblem } from "./objects/link.js";
import { RESERVED_SLUGS, checkPageSlug, slugify } from "./documents/page.js";

const byName = (name) => schemaTypes.find((t) => t.name === name);
const field = (type, name) => byName(type).fields.find((f) => f.name === name);
const memberTypes = (type) => field(type, "sections").of.map((m) => m.type);

test("every type the site reads exists, and no section type is left over", () => {
	const names = schemaTypes.map((t) => t.name).sort();
	assert.deepEqual(names, [
		"blockContent", "briefContent", "city", "client", "collaborators", "contact", "cta", "featuredWorks",
		"footer", "hero", "home", "imageWithAlt", "link", "navigation", "office", "ourApproach", "page", "photos",
		"privacyPolicy", "project", "sector", "seo", "service", "siteSettings", "works",
	]);
	for (const type of [...SINGLETON_TYPES, ...LIBRARY_TYPES]) assert.equal(byName(type).type, "document", type);
});

test("pages share one section library; projects add extras without a hero", () => {
	assert.deepEqual(PAGE_SECTIONS, ["hero", "ourApproach", "collaborators", "featuredWorks", "contact", "photos"]);
	assert.deepEqual(memberTypes("home"), PAGE_SECTIONS);
	assert.deepEqual(memberTypes("page"), PAGE_SECTIONS);
	assert.deepEqual(memberTypes("project"), PROJECT_SECTIONS);
	assert.ok(!PROJECT_SECTIONS.includes("hero"));
	const menu = field("page", "sections").options.insertMenu;
	assert.deepEqual(menu.groups.flatMap((g) => g.of).sort(), [...PAGE_SECTIONS].sort());
	assert.equal(menu.views[0].previewImageUrl("hero"), "/studio-sections/hero.jpg");
});

test("records are linked, not copied", () => {
	const refs = (type, name) => {
		const f = field(type, name);
		return (f.type === "array" ? f.of : [f]).flatMap((m) => m.to?.map((t) => t.type) ?? []);
	};
	assert.deepEqual(refs("project", "clients"), ["client"]);
	assert.deepEqual(refs("project", "sectors"), ["sector"]);
	assert.deepEqual(refs("project", "services"), ["service"]);
	assert.deepEqual(refs("project", "city"), ["city"]);
	assert.deepEqual(refs("project", "nextProject"), ["project"]);
	assert.deepEqual(refs("office", "city"), ["city"]);
	assert.deepEqual(refs("siteSettings", "offices"), ["office"]);
	assert.deepEqual(refs("works", "projects"), ["project"]);
	const collaborators = byName("collaborators").fields.find((f) => f.name === "clients").of[0];
	assert.deepEqual(collaborators.to, [{ type: "client" }]);
	assert.equal(collaborators.options.filter, "defined(logo.asset)");
	const card = byName("featuredWorks").fields.find((f) => f.name === "projects").of[0];
	assert.deepEqual(card.fields.find((f) => f.name === "project").to, [{ type: "project" }]);
});

test("every button is a cta: words and a link", () => {
	const cta = byName("cta");
	assert.deepEqual(cta.fields.map((f) => [f.name, f.type]), [["label", "string"], ["link", "link"]]);
	assert.equal(field("navigation", "cta").type, "cta");
	assert.equal(byName("featuredWorks").fields.find((f) => f.name === "cta").type, "cta");
});

test("project details are tabs: content, details, search and sharing", () => {
	const project = byName("project");
	assert.deepEqual(project.groups.map((g) => g.name), ["content", "details", "seo"]);
	for (const f of project.fields) assert.ok(f.group, `project.${f.name} has no tab`);
});

test("images carry alt and hotspot", () => {
	const image = byName("imageWithAlt");
	assert.equal(image.options.hotspot, true);
	assert.ok(image.fields.some((f) => f.name === "alt"));
});

test("every field has a description", () => {
	const missing = [];
	const walk = (fields, path) => {
		for (const f of fields ?? []) {
			if (!f.description) missing.push(`${path}.${f.name}`);
			if (f.fields) walk(f.fields, `${path}.${f.name}`);
			for (const m of f.of ?? []) if (m.fields) walk(m.fields, `${path}.${f.name}[]`);
		}
	};
	for (const t of schemaTypes) if (t.fields && t.name !== "imageWithAlt") walk(t.fields, t.name);
	assert.deepEqual(missing, []);
});

test("a link needs the target its kind asks for", () => {
	const ok = [
		{ kind: "page", page: { _ref: "works" } },
		{ kind: "project", project: { _ref: "project-adesso" } },
		{ kind: "url", url: "https://example.com" },
		{ kind: "anchor", anchor: "contact" },
		{ kind: "anchor", anchor: "#contact" },
		{ kind: "phone", phone: "+91 88484 343 03" },
		{ kind: "email", email: "info@noster.in" },
	];
	for (const link of ok) assert.equal(linkProblem(link), null, JSON.stringify(link));
	assert.equal(linkProblem(undefined), null);
	const bad = [
		[{ kind: "page" }, "page"],
		[{ kind: "project" }, "project"],
		[{ kind: "url" }, "url"],
		[{ kind: "url", url: "/works" }, "url"],
		[{ kind: "url", url: "javascript:alert(1)" }, "url"],
		[{ kind: "url", url: "https://x.com/\t/evil" }, "url"],
		[{ kind: "anchor", anchor: "two words" }, "anchor"],
		[{ kind: "phone", phone: "call us" }, "phone"],
		[{ kind: "email", email: "info" }, "email"],
		[{}, "kind"],
	];
	for (const [link, fieldName] of bad) assert.equal(linkProblem(link)?.field, fieldName, JSON.stringify(link));
});

test("a link is described in a few words for previews", () => {
	assert.equal(describeLink({ kind: "page", pageType: "works" }), "Page: Works");
	assert.equal(describeLink({ kind: "project", project: "Adesso" }), "Project: Adesso");
	assert.equal(describeLink({ kind: "anchor", anchor: "contact" }), "#contact");
	assert.equal(describeLink({ kind: "phone", phone: "+91 1" }), "+91 1");
});

test("a page's web address can't take one the site already uses", () => {
	for (const slug of ["about", "careers-2026", "a"]) assert.equal(checkPageSlug({ current: slug }), true, slug);
	for (const slug of [...RESERVED_SLUGS, "Works", "about/team", "about us", "-about", undefined]) {
		assert.notEqual(checkPageSlug(slug === undefined ? undefined : { current: slug }), true, String(slug));
	}
	assert.equal(slugify(" About Us! "), "about-us");
});
