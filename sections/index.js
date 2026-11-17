import Collaborators from "./Collaborators";
import FeaturedWorks from "./FeaturedWorks";
import Hero from "./Hero";
import NextProject from "./NextProject";
import OurApproach from "./OurApproach";
import ProjectBrief from "./ProjectBrief";
import ProjectHero from "./ProjectHero";
import ProjectImages from "./ProjectImages";

/** The component for each section type a page can hold, by its `_type`. */
export const components = {
	collaborators: Collaborators,
	featuredWorks: FeaturedWorks,
	hero: Hero,
	nextProject: NextProject,
	ourApproach: OurApproach,
	projectBrief: ProjectBrief,
	projectHero: ProjectHero,
	projectImages: ProjectImages,
};
