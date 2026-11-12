import type * as prismic from "@prismicio/client";

type Simplify<T> = { [KeyType in keyof T]: T[KeyType] };


type PickContentRelationshipFieldData<
	TRelationship extends prismic.CustomTypeModelFetchCustomTypeLevel1 | prismic.CustomTypeModelFetchCustomTypeLevel2 | prismic.CustomTypeModelFetchGroupLevel1 | prismic.CustomTypeModelFetchGroupLevel2,
	TData extends Record<string, prismic.AnyRegularField | prismic.GroupField | prismic.NestedGroupField | prismic.SliceZone>,
	TLang extends string
> = |
	// Content relationship fields
	{
		[TSubRelationship in Extract<
			TRelationship["fields"][number], prismic.CustomTypeModelFetchContentRelationshipLevel1
		> as TSubRelationship["id"]]:
			ContentRelationshipFieldWithData<TSubRelationship["customtypes"], TLang>;
	} &
	// Group
	{
		[TGroup in Extract<
			TRelationship["fields"][number], prismic.CustomTypeModelFetchGroupLevel1 | prismic.CustomTypeModelFetchGroupLevel2
		> as TGroup["id"]]:
			TData[TGroup["id"]] extends prismic.GroupField<infer TGroupData>
				? prismic.GroupField<PickContentRelationshipFieldData<TGroup, TGroupData, TLang>>
				: never
	} &
	// Other fields
	{
		[TFieldKey in Extract<TRelationship["fields"][number], string>]:
			TFieldKey extends keyof TData ? TData[TFieldKey] : never;
	};

type ContentRelationshipFieldWithData<
	TCustomType extends readonly (prismic.CustomTypeModelFetchCustomTypeLevel1 | string)[] | readonly (prismic.CustomTypeModelFetchCustomTypeLevel2 | string)[],
	TLang extends string = string
> = {
	[ID in Exclude<TCustomType[number], string>["id"]]:
		prismic.ContentRelationshipField<
			ID,
			TLang,
			PickContentRelationshipFieldData<
				Extract<TCustomType[number], { id: ID }>,
				Extract<prismic.Content.AllDocumentTypes, { type: ID }>["data"],
				TLang
			>
		>
}[Exclude<TCustomType[number], string>["id"]];

type HomeDocumentDataSlicesSlice = HeroSlice | OurApproachSlice | CollaboratorsSlice | FeaturedWorksSlice | ContactSlice

/**
 * Content for Home documents
 */
interface HomeDocumentData {
	/**
	 * Slice Zone field in *Home*
	 *
	 * - **Field Type**: Slice Zone
	 * - **Placeholder**: *None*
	 * - **API ID Path**: home.slices[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/slices
	 */
	slices: prismic.SliceZone<HomeDocumentDataSlicesSlice>;/**
	 * Meta Title field in *Home*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: A title of the page used for social media and search engines
	 * - **API ID Path**: home.meta_title
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_title: prismic.KeyTextField;
	
	/**
	 * Meta Description field in *Home*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: A brief summary of the page
	 * - **API ID Path**: home.meta_description
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	meta_description: prismic.KeyTextField;
	
	/**
	 * Meta Image field in *Home*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: home.meta_image
	 * - **Tab**: SEO & Metadata
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	meta_image: prismic.ImageField<never>;
}

/**
 * Home document from Prismic
 *
 * - **API ID**: `home`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type HomeDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<HomeDocumentData>, "home", Lang>;

/**
 * Item in *Navigation → Links*
 */
export interface NavigationDocumentDataLinksItem {
	/**
	 * Label field in *Navigation → Links*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: navigation.links[].label
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	label: prismic.KeyTextField;
	
	/**
	 * Link field in *Navigation → Links*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: navigation.links[].link
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
}

/**
 * Content for Navigation documents
 */
interface NavigationDocumentData {
	/**
	 * Links field in *Navigation*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: navigation.links[]
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	links: prismic.GroupField<Simplify<NavigationDocumentDataLinksItem>>;
	
	/**
	 * CTA label field in *Navigation*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: navigation.cta_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	cta_label: prismic.KeyTextField;
	
	/**
	 * CTA link field in *Navigation*
	 *
	 * - **Field Type**: Link
	 * - **Placeholder**: *None*
	 * - **API ID Path**: navigation.cta_link
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/link
	 */
	cta_link: prismic.LinkField<string, string, unknown, prismic.FieldState, never>;
	
	/**
	 * Mobile CTA label field in *Navigation*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: navigation.mobile_cta_label
	 * - **Tab**: Main
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	mobile_cta_label: prismic.KeyTextField;
}

/**
 * Navigation document from Prismic
 *
 * - **API ID**: `navigation`
 * - **Repeatable**: `false`
 * - **Documentation**: https://prismic.io/docs/content-modeling
 *
 * @typeParam Lang - Language API ID of the document.
 */
export type NavigationDocument<Lang extends string = string> = prismic.PrismicDocumentWithoutUID<Simplify<NavigationDocumentData>, "navigation", Lang>;

export type AllDocumentTypes = HomeDocument | NavigationDocument;

/**
 * Item in *Collaborators → Default → Primary → Logos*
 */
export interface CollaboratorsSliceDefaultPrimaryLogosItem {
	/**
	 * Logo field in *Collaborators → Default → Primary → Logos*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: collaborators.default.primary.logos[].logo
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	logo: prismic.ImageField<never>;
	
	/**
	 * Large field in *Collaborators → Default → Primary → Logos*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **Default Value**: false
	 * - **API ID Path**: collaborators.default.primary.logos[].large
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	large: prismic.BooleanField;
}

/**
 * Primary content in *Collaborators → Default → Primary*
 */
export interface CollaboratorsSliceDefaultPrimary {
	/**
	 * Title field in *Collaborators → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Our Collaborators
	 * - **API ID Path**: collaborators.default.primary.title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	title: prismic.RichTextField;
	
	/**
	 * Logos field in *Collaborators → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: collaborators.default.primary.logos[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	logos: prismic.GroupField<Simplify<CollaboratorsSliceDefaultPrimaryLogosItem>>;
}

/**
 * Default variation for Collaborators Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type CollaboratorsSliceDefault = prismic.SharedSliceVariation<"default", Simplify<CollaboratorsSliceDefaultPrimary>, never>;

/**
 * Slice variation for *Collaborators*
 */
type CollaboratorsSliceVariation = CollaboratorsSliceDefault

/**
 * Collaborators Shared Slice
 *
 * - **API ID**: `collaborators`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type CollaboratorsSlice = prismic.SharedSlice<"collaborators", CollaboratorsSliceVariation>;

/**
 * Item in *Contact → Default → Primary → Contacts*
 */
export interface ContactSliceDefaultPrimaryContactsItem {
	/**
	 * Email or phone field in *Contact → Default → Primary → Contacts*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: info@noster.in or +91 88484 343 03
	 * - **API ID Path**: contact.default.primary.contacts[].value
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	value: prismic.KeyTextField;
}

/**
 * Primary content in *Contact → Default → Primary*
 */
export interface ContactSliceDefaultPrimary {
	/**
	 * Title field in *Contact → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Let's Build Together
	 * - **API ID Path**: contact.default.primary.title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	title: prismic.RichTextField;
	
	/**
	 * Intro text field in *Contact → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: For new business inquiries contact us:
	 * - **API ID Path**: contact.default.primary.intro
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	intro: prismic.KeyTextField;
	
	/**
	 * Contacts field in *Contact → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: contact.default.primary.contacts[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	contacts: prismic.GroupField<Simplify<ContactSliceDefaultPrimaryContactsItem>>;
}

/**
 * Default variation for Contact Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type ContactSliceDefault = prismic.SharedSliceVariation<"default", Simplify<ContactSliceDefaultPrimary>, never>;

/**
 * Slice variation for *Contact*
 */
type ContactSliceVariation = ContactSliceDefault

/**
 * Contact Shared Slice
 *
 * - **API ID**: `contact`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type ContactSlice = prismic.SharedSlice<"contact", ContactSliceVariation>;

/**
 * Item in *Featured Works → Default → Primary → Projects*
 */
export interface FeaturedWorksSliceDefaultPrimaryProjectsItem {
	/**
	 * Name field in *Featured Works → Default → Primary → Projects*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: featured_works.default.primary.projects[].name
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	name: prismic.KeyTextField;
	
	/**
	 * Description field in *Featured Works → Default → Primary → Projects*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: *None*
	 * - **API ID Path**: featured_works.default.primary.projects[].description
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	description: prismic.KeyTextField;
	
	/**
	 * Image field in *Featured Works → Default → Primary → Projects*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: featured_works.default.primary.projects[].image
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	image: prismic.ImageField<never>;
	
	/**
	 * Project link field in *Featured Works → Default → Primary → Projects*
	 *
	 * - **Field Type**: Content Relationship
	 * - **Placeholder**: *None*
	 * - **API ID Path**: featured_works.default.primary.projects[].link
	 * - **Documentation**: https://prismic.io/docs/fields/content-relationship
	 */
	link: prismic.ContentRelationshipField;
}

/**
 * Primary content in *Featured Works → Default → Primary*
 */
export interface FeaturedWorksSliceDefaultPrimary {
	/**
	 * Title field in *Featured Works → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Featured Works
	 * - **API ID Path**: featured_works.default.primary.title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	title: prismic.RichTextField;
	
	/**
	 * Projects field in *Featured Works → Default → Primary*
	 *
	 * - **Field Type**: Group
	 * - **Placeholder**: *None*
	 * - **API ID Path**: featured_works.default.primary.projects[]
	 * - **Documentation**: https://prismic.io/docs/fields/repeatable-group
	 */
	projects: prismic.GroupField<Simplify<FeaturedWorksSliceDefaultPrimaryProjectsItem>>;
	
	/**
	 * Button text field in *Featured Works → Default → Primary*
	 *
	 * - **Field Type**: Text
	 * - **Placeholder**: View all projects
	 * - **API ID Path**: featured_works.default.primary.button_text
	 * - **Documentation**: https://prismic.io/docs/fields/text
	 */
	button_text: prismic.KeyTextField;
}

/**
 * Default variation for Featured Works Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type FeaturedWorksSliceDefault = prismic.SharedSliceVariation<"default", Simplify<FeaturedWorksSliceDefaultPrimary>, never>;

/**
 * Slice variation for *Featured Works*
 */
type FeaturedWorksSliceVariation = FeaturedWorksSliceDefault

/**
 * Featured Works Shared Slice
 *
 * - **API ID**: `featured_works`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type FeaturedWorksSlice = prismic.SharedSlice<"featured_works", FeaturedWorksSliceVariation>;

/**
 * Primary content in *Hero → Default → Primary*
 */
export interface HeroSliceDefaultPrimary {
	/**
	 * Title field in *Hero → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Hero headline
	 * - **API ID Path**: hero.default.primary.title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	title: prismic.RichTextField;
	
	/**
	 * Picture or Video field in *Hero → Default → Primary*
	 *
	 * - **Field Type**: Boolean
	 * - **Placeholder**: *None*
	 * - **Default Value**: true
	 * - **API ID Path**: hero.default.primary.is_video
	 * - **Documentation**: https://prismic.io/docs/fields/boolean
	 */
	is_video: prismic.BooleanField;
	
	/**
	 * Video field in *Hero → Default → Primary*
	 *
	 * - **Field Type**: Link to Media
	 * - **Placeholder**: *None*
	 * - **API ID Path**: hero.default.primary.video
	 * - **Documentation**: https://prismic.io/docs/fields/link-to-media
	 */
	video: prismic.LinkToMediaField<prismic.FieldState, never>;
	
	/**
	 * Image field in *Hero → Default → Primary*
	 *
	 * - **Field Type**: Image
	 * - **Placeholder**: *None*
	 * - **API ID Path**: hero.default.primary.image
	 * - **Documentation**: https://prismic.io/docs/fields/image
	 */
	image: prismic.ImageField<never>;
}

/**
 * Default variation for Hero Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type HeroSliceDefault = prismic.SharedSliceVariation<"default", Simplify<HeroSliceDefaultPrimary>, never>;

/**
 * Slice variation for *Hero*
 */
type HeroSliceVariation = HeroSliceDefault

/**
 * Hero Shared Slice
 *
 * - **API ID**: `hero`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type HeroSlice = prismic.SharedSlice<"hero", HeroSliceVariation>;

/**
 * Primary content in *Our Approach → Default → Primary*
 */
export interface OurApproachSliceDefaultPrimary {
	/**
	 * Title field in *Our Approach → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: Our Approach
	 * - **API ID Path**: our_approach.default.primary.title
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	title: prismic.RichTextField;
	
	/**
	 * Description field in *Our Approach → Default → Primary*
	 *
	 * - **Field Type**: Rich Text
	 * - **Placeholder**: About the studio
	 * - **API ID Path**: our_approach.default.primary.description
	 * - **Documentation**: https://prismic.io/docs/fields/rich-text
	 */
	description: prismic.RichTextField;
}

/**
 * Default variation for Our Approach Slice
 *
 * - **API ID**: `default`
 * - **Description**: Default
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type OurApproachSliceDefault = prismic.SharedSliceVariation<"default", Simplify<OurApproachSliceDefaultPrimary>, never>;

/**
 * Slice variation for *Our Approach*
 */
type OurApproachSliceVariation = OurApproachSliceDefault

/**
 * Our Approach Shared Slice
 *
 * - **API ID**: `our_approach`
 * - **Description**: *None*
 * - **Documentation**: https://prismic.io/docs/slices
 */
export type OurApproachSlice = prismic.SharedSlice<"our_approach", OurApproachSliceVariation>;

declare module "@prismicio/client" {
	interface CreateClient {
		(repositoryNameOrEndpoint: string, options?: prismic.ClientConfig): prismic.Client<AllDocumentTypes>;
	}
	
	interface CreateWriteClient {
		(repositoryNameOrEndpoint: string, options: prismic.WriteClientConfig): prismic.WriteClient<AllDocumentTypes>;
	}
	
	interface CreateMigration {
		(): prismic.Migration<AllDocumentTypes>;
	}
	
	namespace Content {
		export type {
			HomeDocument,
			HomeDocumentData,
			HomeDocumentDataSlicesSlice,
			NavigationDocument,
			NavigationDocumentData,
			NavigationDocumentDataLinksItem,
			AllDocumentTypes,
			CollaboratorsSlice,
			CollaboratorsSliceDefaultPrimaryLogosItem,
			CollaboratorsSliceDefaultPrimary,
			CollaboratorsSliceVariation,
			CollaboratorsSliceDefault,
			ContactSlice,
			ContactSliceDefaultPrimaryContactsItem,
			ContactSliceDefaultPrimary,
			ContactSliceVariation,
			ContactSliceDefault,
			FeaturedWorksSlice,
			FeaturedWorksSliceDefaultPrimaryProjectsItem,
			FeaturedWorksSliceDefaultPrimary,
			FeaturedWorksSliceVariation,
			FeaturedWorksSliceDefault,
			HeroSlice,
			HeroSliceDefaultPrimary,
			HeroSliceVariation,
			HeroSliceDefault,
			OurApproachSlice,
			OurApproachSliceDefaultPrimary,
			OurApproachSliceVariation,
			OurApproachSliceDefault
		}
	}
}