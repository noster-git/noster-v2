import assert from "node:assert/strict";
import { test } from "node:test";

process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = "abc123";
process.env.NEXT_PUBLIC_SANITY_DATASET = "production";
const { hasImage, imageSize, imageUrl, sourceUrl, withImageUrls } = await import("./image.js");

const asset = {
	_id: "image-9b95e5a92b5ac34902d8fde3830f3faf5db2ecce-1500x1000-jpg",
	url: "https://cdn.sanity.io/images/abc123/production/9b95e5a92b5ac34902d8fde3830f3faf5db2ecce-1500x1000.jpg",
	metadata: { dimensions: { width: 1500, height: 1000 } },
};
const params = (url) => new URL(url).searchParams;

test("hasImage is true only for an image with an asset", () => {
	assert.equal(hasImage({ asset }), true);
	assert.equal(hasImage({ asset: { _ref: asset._id } }), true);
	assert.equal(hasImage({ asset: null }), false);
	assert.equal(hasImage({ alt: "A photo" }), false);
	assert.equal(hasImage(undefined), false);
});

test("imageUrl asks the CDN for the best format at the given width", () => {
	const url = imageUrl({ asset }, { w: 800 });
	assert.ok(url.startsWith("https://cdn.sanity.io/images/abc123/production/"));
	assert.ok(url.includes("auto=format"));
	assert.ok(url.includes("w=800"));
});

test("imageUrl crops around the hotspot when width and height are both set", () => {
	const hotspot = { x: 0.9, y: 0.5, width: 0.1, height: 0.1 };
	const p = params(imageUrl({ asset, hotspot }, { w: 600, h: 600 }));
	assert.equal(p.get("w"), "600");
	assert.equal(p.get("h"), "600");
	assert.equal(p.get("fit"), "crop");
	// A square from a 3:2 photo, pushed to the right edge where the hotspot is: 1000×1000 from x = 500.
	assert.equal(p.get("rect"), "500,0,1000,1000");
});

test("imageUrl sends a fixed format and quality when asked, in place of the best format", () => {
	const p = params(imageUrl({ asset }, { w: 1200, h: 630, fm: "jpg", q: 80 }));
	assert.equal(p.get("fm"), "jpg");
	assert.equal(p.get("q"), "80");
	assert.equal(p.get("auto"), null);
	assert.equal(p.get("fit"), "crop");
});

test("imageSize is the asset's size, less any crop", () => {
	assert.deepEqual(imageSize({ asset }), { width: 1500, height: 1000 });
	assert.deepEqual(imageSize({ asset, crop: { top: 0.1, bottom: 0.1, left: 0, right: 0.2 } }), { width: 1200, height: 800 });
	assert.deepEqual(imageSize({ asset: { _ref: asset._id } }), { width: 1500, height: 1000 });
});

test("sourceUrl caps a large photo at 3840px wide, in high quality, for the site's image optimizer", () => {
	const big = { _ref: "image-9b95e5a92b5ac34902d8fde3830f3faf5db2ecce-9504x6336-jpg" };
	const p = params(sourceUrl({ asset: big }));
	assert.equal(p.get("w"), "3840");
	assert.equal(p.get("fit"), "max");
	assert.equal(p.get("q"), "90");
	assert.equal(p.get("auto"), null);
	// A smaller photo keeps its own size; a studio crop is kept.
	const small = params(sourceUrl({ asset, crop: { top: 0, bottom: 0, left: 0, right: 0.5 } }));
	assert.equal(small.get("w"), null);
	assert.equal(small.get("rect"), "0,0,750,1000");
});

test("sourceUrl turns an SVG logo into a PNG, named .png, so the optimizer resizes it", () => {
	const url = new URL(sourceUrl({ asset: { _ref: "image-9b95e5a92b5ac34902d8fde3830f3faf5db2ecce-408x87-svg" } }));
	assert.equal(url.searchParams.get("fm"), "png");
	assert.ok(url.pathname.endsWith("9b95e5a92b5ac34902d8fde3830f3faf5db2ecce-408x87.svg/logo.png"));
});

test("withImageUrls gives every image in a result its address and size, and leaves the rest alone", () => {
	const crop = { top: 0, bottom: 0, left: 0, right: 0.5 };
	const data = { title: "Home", sections: [{ _key: "a", image: { alt: "Lobby", crop, asset: { _ref: asset._id } } }, { _key: "b", image: null }] };
	const out = withImageUrls(data);
	const image = out.sections[0].image;
	assert.equal(out.title, "Home");
	assert.equal(out.sections[1].image, null);
	assert.equal(image.alt, "Lobby");
	assert.deepEqual([image.width, image.height], [750, 1000]);
	assert.ok(image.src.startsWith("https://cdn.sanity.io/images/abc123/production/"));
	assert.equal(image.src, sourceUrl(data.sections[0].image));
	assert.equal(hasImage(image), true);
	// The original is unchanged.
	assert.equal(data.sections[0].image.src, undefined);
});
