import { imageWithAlt } from "./objects/imageWithAlt.js";
import { seo } from "./objects/seo.js";
import { link } from "./objects/link.js";
import { blockContent, briefContent } from "./objects/blockContent.js";
import { hero } from "./sections/hero.js";
import { ourApproach } from "./sections/ourApproach.js";
import { collaborators } from "./sections/collaborators.js";
import { featuredWorks } from "./sections/featuredWorks.js";
import { contact } from "./sections/contact.js";
import { projectHero } from "./sections/projectHero.js";
import { projectBrief } from "./sections/projectBrief.js";
import { projectImages } from "./sections/projectImages.js";
import { nextProject } from "./sections/nextProject.js";
import { home } from "./documents/home.js";
import { works } from "./documents/works.js";
import { privacyPolicy } from "./documents/privacyPolicy.js";
import { navigation } from "./documents/navigation.js";
import { footer } from "./documents/footer.js";
import { project } from "./documents/project.js";

/** One-off pages: a single document each, with the document ID equal to the type name. */
export const SINGLETON_TYPES = ["home", "works", "privacyPolicy", "navigation", "footer"];

export const schemaTypes = [
	home, works, privacyPolicy, navigation, footer, project,
	hero, ourApproach, collaborators, featuredWorks, contact,
	projectHero, projectBrief, projectImages, nextProject,
	seo, link, imageWithAlt, blockContent, briefContent,
];
