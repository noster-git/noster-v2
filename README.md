# Noster

The Noster website: Next.js, with every page's text and photos edited in Sanity.

## Setup

Create `.env.local` with:

- `NEXT_PUBLIC_SANITY_PROJECT_ID`: the Sanity project.
- `NEXT_PUBLIC_SANITY_DATASET`: the dataset, `production` by default.
- `SANITY_API_READ_TOKEN`: a Viewer token from the Sanity project's API settings. The dataset is private, so the site reads all its content with it.

Set the same three in Vercel for both Production and Preview. A production build stops if the project ID or the token is missing. Never commit tokens.

Then run `npm run dev` and open [http://localhost:3000](http://localhost:3000).

## Editing content

Open `/studio` on the site (for example [http://localhost:3000/studio](http://localhost:3000/studio)) and sign in with your Sanity account. The Presentation tab shows the site beside the editor: click any text or photo to edit it, and unpublished changes appear as you type.

All uploaded photos and videos are in the **Media** tab (beside Structure and Presentation): search them, tag them, see where each is used, edit an image's alt text and credit, and delete ones nothing uses. An image field's "Select" opens the same library.

The studio's menu, top to bottom: **Pages**: Home, Works (its title and the order projects are listed in), the privacy policy, and other pages. **Projects**. **Navigation**: the menu links and the button at the top of every page. **Footer**: the footer's headings. **Library**: clients, sectors, services, cities and offices, the records projects and pages point at. **Settings**: the company's name and contact details (email, phone numbers, offices, social links, shown in the footer, the Contact section and to search engines) and the default search and sharing fields. A project picks its client, sector, city, services and next project from the Library rather than typing them, so a name is fixed in one place; a new record can be made straight from the picker. A project or record that is in use (picked on a project, a page or in Settings) can't be deleted until it is removed from where it is used.

A new page (Pages › Other pages) is built from the same sections as Home (Hero, Our Approach, Collaborators, Featured Works, Contact, Photos), lives at its own address (`/about`) and is added to the sitemap and `/llms.txt` once published. Projects can add sections under their photos.

Every button is a Button: its words and where it goes: a page, a project, another website, a place on the page (`contact`, the contact details at the foot of every page), a phone number or an email address. Menu links work the same way.

In the Presentation tab, sections, project photos, menu links, phone numbers, offices and social links can be dragged into a new order on the page (hover one and use its handle). Right-click a section (or any item in a list) for its menu: move it, duplicate or remove it, or insert a new one before or after it.

Publishing updates the live site within a few seconds, with no rebuild. The sitemap and `/llms.txt` refresh every hour.

Each address the studio or site runs on (for example `http://localhost:3000`, `https://www.noster.in`, a new domain) must be added to the Sanity project's CORS origins, with credentials allowed.

## Code

Content queries and fetching live in `lib/sanity/`, the studio's schema in `sanity/`. Each page section (`sections/`) is a component keyed by its type in `sections/index.js`; a project's facts are written from its details in `lib/project-facts.js`. `npm test` runs the tests, `npm run lint` the linter.
