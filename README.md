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

Publishing updates the live site within a few seconds, with no rebuild. The sitemap and `/llms.txt` refresh every hour.

Each address the studio or site runs on (for example `http://localhost:3000`, `https://www.noster.in`, a new domain) must be added to the Sanity project's CORS origins, with credentials allowed.

## Code

Content queries and fetching live in `lib/sanity/`, the studio's schema in `sanity/`. Each page section (`sections/`) is a component keyed by its type in `sections/index.js`. `npm test` runs the tests, `npm run lint` the linter.
