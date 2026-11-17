import { imageWithAlt } from "./objects/imageWithAlt.js";
import { seo } from "./objects/seo.js";
import { link } from "./objects/link.js";
import { cta } from "./objects/cta.js";
import { blockContent, briefContent } from "./objects/blockContent.js";
import { sectionTypes } from "./sections/index.js";
import { siteSettings } from "./documents/siteSettings.js";
import { home } from "./documents/home.js";
import { works } from "./documents/works.js";
import { privacyPolicy } from "./documents/privacyPolicy.js";
import { navigation } from "./documents/navigation.js";
import { footer } from "./documents/footer.js";
import { page } from "./documents/page.js";
import { project } from "./documents/project.js";
import { client } from "./documents/client.js";
import { sector } from "./documents/sector.js";
import { service } from "./documents/service.js";
import { city } from "./documents/city.js";
import { office } from "./documents/office.js";

/** One-off documents: a single document each, with the document ID equal to the type name. */
export const SINGLETON_TYPES = ["siteSettings", "home", "works", "privacyPolicy", "navigation", "footer"];

/** Records other documents point at: listed in the studio's Library. */
export const LIBRARY_TYPES = ["client", "sector", "service", "city", "office"];

export const schemaTypes = [
	siteSettings, home, works, privacyPolicy, navigation, footer,
	page, project,
	client, sector, service, city, office,
	...sectionTypes,
	seo, link, cta, imageWithAlt, blockContent, briefContent,
];
