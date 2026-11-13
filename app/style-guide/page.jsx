import NosterLogo from "@/components/NosterLogo";
import LineCta from "@/components/LineCta";
import RollText from "@/components/RollText";
import Arrow from "@/components/Arrow";
import Rise from "./Rise";
import "./motion.css";
import { m } from "./motion";

/**
 * Internal style guide: the site's design system, documented with the live tokens and components.
 * Not for search engines: noindex here, an X-Robots-Tag header in next.config.mjs, and left out of the sitemap.
 * Every value shown comes from app/globals.css or components/, so keep this page in step with them.
 */
export const metadata = {
	title: "Style Guide | Noster",
	description: "Internal reference for the Noster website design system.",
	robots: {
		index: false,
		follow: false,
		nocache: true,
		googleBot: { index: false, follow: false, noimageindex: true },
	},
};

const SECTIONS = [
	{ id: "principles", title: "Principles" },
	{ id: "layout", title: "Layout" },
	{ id: "typography", title: "Typography" },
	{ id: "spacing", title: "Spacing" },
	{ id: "colour", title: "Colour" },
	{ id: "components", title: "Components" },
	{ id: "motion", title: "Motion" },
	{ id: "transitions", title: "Transitions" },
];

const LAYOUTS = [
	{ name: "Compact", when: "< 768px (phones)", prefix: "(base)", cols: "5", body: "12 / 16px", line: "7.35px unit", margin: "12px" },
	{ name: "Desk", when: "≥ 768px (tablets, laptops, desktops)", prefix: "desk:", cols: "10", body: "12 / 15px", line: "10.5px unit at 1440", margin: "24px at 1440" },
	{ name: "Wide", when: "≥ 1800px", prefix: "(automatic)", cols: "10", body: "13 / 16px", line: "16px", margin: "24px" },
];

// Specimens use the real classes. Sizes: compact → desk (→ wide where it changes).
const TYPE = [
	{ token: "text-display", size: "12vw → 115px at 1440", spec: "line 0.8 · tracking −0.055em · regular", use: "One big word or line: Works title, Behind the Scenes, Let’s Build Together.", sample: "Workspaces" },
	{ token: "text-title", size: "26px → 46px at 1440", spec: "line 1.1 → 1.02 · tracking −0.025em · light", use: "Page and section titles, the home hero, project names.", sample: ":Featured Works" },
	{ token: "text-lead", size: "19px → 32px at 1440 (2.1vw above 1520)", spec: "line 1.25 → 1.1 → 1.05 · tracking −0.015em · light", use: "Statements and intros: Our Approach, Contact.", sample: "We design, build and furnish workspaces for technology companies." },
	{ token: "text-brief", size: "17px → 24px at 1440", spec: "line 1.35 → 1.3 · tracking −0.015em · light", use: "Project descriptions (The project).", sample: "A workspace that blends industrial aesthetics with colour." },
	{ token: "text-heading", size: "19px → 32px at 1440", spec: "line 1 · tracking −0.025em · regular", use: "Block headings and the line CTA.", sample: "View all projects" },
	{ token: "text-body", size: "12px → 12px → 13px", spec: "line 16 → 15 → 16px · tracking −0.025em", use: "Everything that is read: body, captions, nav, footer, details. The page default.", sample: "Trivandrum · Kochi · Hyderabad — Noster designs, builds and furnishes offices." },
	{ token: "text-body", size: "as body", spec: "the label style, sentence case", use: "Section labels (Our approach).", sample: "Our approach" },
	{ token: "text-name", size: "14px → 16px at 1440", spec: "line 1.2 · tracking −0.02em", use: "Project names on cards.", sample: "Geeky Wolf" },
	{ token: "text-long", size: "14px", spec: "line 21px", use: "Long-form reading: the privacy policy.", sample: "We use your data to provide and improve the service." },
	{ token: "text-body text-muted", size: "as body", spec: "#666", use: "Secondary text: addresses, detail labels.", sample: "↳ Brand identity, workspace design" },
];

const SPACES = [1, 2, 3, 4, 6, 8, 12];

const COLOURS = [
	{ name: "Paper", value: "#FFFFFF", token: "bg-(--paper)", use: "Page background.", swatch: "bg-white" },
	{ name: "Ink", value: "#000000", token: "text-(--ink)", use: "Text, rules and hover fills.", swatch: "bg-black" },
	{ name: "Lime", value: "#D3FD5E", token: "text-lime", use: "The accent: the home hero title, the curtain and the footer.", swatch: "bg-lime" },
	{ name: "Muted", value: "#666666", token: "text-muted", use: "Secondary text (5.7:1 on white, passes AA).", swatch: "bg-muted" },
];

const FILES = [
	["app/globals.css", "Breakpoints (desk, wide), grid-site, type and spacing tokens, radii, colours, hover motion"],
	["components/Arrow.jsx", "The arrow (Lucide arrow-right) and its hover swap"],
	["components/RollText.jsx", "Letter roll on hover"],
	["components/LineCta.jsx", "Full-width ruled link"],
	["components/Navigation.jsx", "Header, CTA tag, compact CTA button"],
	["components/WorksGrid.jsx", "Project grid (Home, /works), card reveals, View pill"],
	["components/Intro.jsx", "Page-load curtain, its sweep reveal and the header entrance"],
	["components/SiteSweep.jsx", "Glimm sweep between pages (lib/sweep.js: the shared look)"],
	["lib/intro.js", "No-flash script and the entrance gate"],
	["lib/projects.js", "Each project's hero photo, which its card preloads for the open transition"],
	["components/Footer.jsx", "Footer blocks"],
	["lib/motion.js", "Scroll reveal settings (GSAP)"],
];

const Code = ({ children }) => <code className="font-mono text-[0.92em] break-all">{children}</code>;
const Caption = ({ children, className = "" }) => <p className={`text-muted before:mr-[0.35em] before:content-['↳'] ${className}`}>{children}</p>;

/** A labelled row on the page grid: label in columns 1–3, content in 4–10 (stacked on compact). */
function Block({ label, children }) {
	return (
		<div className="grid-site">
			<p className="col-span-5 mb-1 desk:col-span-3 desk:mb-0">{label}</p>
			<div className="col-span-5 min-w-0 desk:col-span-7">{children}</div>
		</div>
	);
}

function Section({ id, index, title, intro, children }) {
	return (
		<Rise id={id} className="scroll-mt-6 border-t border-black/10 pt-1 pb-8">
			<div data-rise className="grid-site mb-6">
				<p className="col-span-5 mb-2 desk:col-span-3 desk:mb-0">{String(index).padStart(2, "0")}</p>
				<div className="col-span-5 desk:col-span-7">
					<h2 className="text-title">:{title}</h2>
					{intro && <p className="mt-1 max-w-[46em] text-muted">{intro}</p>}
				</div>
			</div>
			<div data-rise className="flex flex-col gap-6">
				{children}
			</div>
		</Rise>
	);
}

function Rows({ items, render }) {
	return (
		<ul className="border-t border-black/10">
			{items.map((item, i) => (
				<li key={i} className="border-b border-black/10 py-1">
					{render(item)}
				</li>
			))}
		</ul>
	);
}

const TAG = "motion-host inline-flex items-center gap-g rounded-ui bg-black px-[8.5px] py-[4px] leading-none text-white";
const BUTTON = "motion-host inline-flex items-center gap-[8px] rounded-ui bg-black px-[20px] py-[14px] text-[13px] leading-[16px] text-white";
const CHIP = "motion-host inline-flex items-center gap-g rounded-ui border border-black/18 px-[14px] py-[9px] leading-none transition-colors duration-200 hover:border-black";
const LINK = "motion-host inline-flex items-center gap-[0.3em] before:content-['↳'] transition-colors duration-200 hover:text-muted";

export default function Page() {
	return (
		<div className="px-m pt-[84px] desk:pt-[120px]">
			<header className="pb-8">
				<h1 className={`text-display ${m.enter}`}>Style Guide</h1>
				<div className="grid-site mt-2">
					<p className="col-span-5 text-lead desk:col-span-7 desk:col-start-4">
						The design system behind noster.in: grid, type, spacing, colour, components and motion, shown with the real
						tokens. For the team only; search engines are told not to index this page.
					</p>
					<nav aria-label="Style guide sections" className="col-span-5 mt-2 flex flex-wrap gap-g desk:col-span-7 desk:col-start-4">
						{SECTIONS.map((s, i) => (
							<a key={s.id} href={`#${s.id}`} className={CHIP}>
								<span className="text-muted">{String(i + 1).padStart(2, "0")}</span>
								<RollText>{s.title}</RollText>
							</a>
						))}
					</nav>
				</div>
			</header>

			<Section id="principles" index={1} title="Principles" intro="What every page has in common.">
				<ol className="grid grid-cols-1 gap-g min-[600px]:grid-cols-2 desk:grid-cols-4">
					{[
						["One grid.", "Ten columns on desk, five on compact, 6px apart. 12px from the edge on compact, 24px on desk. Everything sits on it."],
						["Small, fixed type.", "Body is 11–13px. Size jumps are big and few: body, heading, lead, title, display."],
						["Spacing in units.", "One spacing unit sets every gap and section padding; phones run 30% tighter so content sits closer on a small screen."],
						["Black, white, one lime.", "The photography carries the colour; the interface stays monochrome."],
					].map(([t, d], i) => (
						<li key={t} className="flex min-h-[220px] flex-col justify-between rounded-media bg-black/[0.04] p-g">
							<span>{String(i + 1).padStart(2, "0")}</span>
							<div>
								<p className="text-heading">{t}</p>
								<p className="mt-1 text-muted">{d}</p>
							</div>
						</li>
					))}
				</ol>
			</Section>

			<Section
				id="layout"
				index={2}
				title="Layout"
				intro="Two layouts, switched by the desk: variant. Phones get compact; tablets, laptops and desktops get desk, which scales down from 1440 so a small laptop looks like 1440."
			>
				<Block label="Layouts">
					<Rows
						items={LAYOUTS}
						render={(l) => (
							<div className="grid grid-cols-2 gap-x-g gap-y-[2px] desk:grid-cols-7">
								<p className="desk:col-span-1">{l.name}</p>
								<p className="desk:col-span-2">{l.when}</p>
								<p className="text-muted desk:col-span-1">
									<Code>{l.prefix}</Code>
								</p>
								<p className="text-muted desk:col-span-1">{l.cols} columns</p>
								<p className="text-muted desk:col-span-2">
									body {l.body} · unit {l.line} · margin {l.margin}
								</p>
							</div>
						)}
					/>
				</Block>
				<div>
					<p className="mb-1">Grid · grid-site</p>
					<div className="-mx-m bg-black/[0.06] px-m">
						<div className="grid-site h-[120px]">
							{Array.from({ length: 10 }, (_, i) => (
								<div key={i} className={`flex items-end rounded-media bg-lime/60 p-[4px] ${i >= 5 ? "hidden desk:flex" : ""}`}>
									{i + 1}
								</div>
							))}
						</div>
					</div>
					<div className="grid-site">
						<Caption className="col-span-5 mt-1 desk:col-span-7 desk:col-start-4">
							This strip is the live page grid, drawn edge to edge: the grey bands either side are the page margin. Resize the window to see it go from 10
							columns to 5 and the margin from 24 to 12px. Column gap is <Code>g</Code> (6px, <Code>gap-g</Code>); page margin is <Code>m</Code> (
							<Code>px-m</Code>).
						</Caption>
					</div>
				</div>
				<Block label="Placing things">
					<div className="flex flex-col gap-g">
						<div className="grid-site">
							<div className="col-span-5 rounded-media bg-black/[0.06] p-[4px] desk:col-span-3">label · col-span-3</div>
							<div className="col-span-5 mt-g rounded-media bg-black/10 p-[4px] desk:col-span-7 desk:mt-0">content · col-span-7</div>
						</div>
					</div>
					<Caption className="mt-1">
						Sections: a label in columns 1–3 and the content in 4–10.
					</Caption>
				</Block>
			</Section>

			<Section id="typography" index={3} title="Typography" intro="Geist, from next/font. Eight sizes; light weight for lead, brief and title, regular for the rest. No bold.">
				<Rows
					items={TYPE}
					render={(t) => (
						<div className="grid-site gap-y-1">
							<div className="col-span-5 desk:col-span-3">
								<p>
									<Code>{t.token}</Code>
								</p>
								<p className="text-muted">{t.size}</p>
								<p className="text-muted">{t.spec}</p>
								<Caption>{t.use}</Caption>
							</div>
							<div className="col-span-5 min-w-0 overflow-hidden desk:col-span-7">
								<p className={t.token}>{t.sample}</p>
							</div>
						</div>
					)}
				/>
				<Block label="Conventions">
					<div className="grid gap-g min-[600px]:grid-cols-3">
						<div>
							<p className="text-heading">The colon</p>
							<p className="mt-1 text-muted">Page and section titles start with a colon, “:Featured Works”. The CMS stores the plain title and the code adds it.</p>
						</div>
						<div>
							<p className="text-heading">↳ for lists</p>
							<p className="mt-1 text-muted">Card descriptions and footer links start with ↳, added by CSS (<Code>before:content-[&apos;↳&apos;]</Code>).</p>
						</div>
						<div>
							<p className="text-heading">Labels</p>
							<p className="mt-1 text-muted">Section labels are body size in sentence case, never a bigger size or all caps.</p>
						</div>
					</div>
				</Block>
			</Section>

			<Section id="spacing" index={4} title="Spacing" intro="The spacing unit is 10.5px at 1440, scaling down with the page on smaller laptops and tablets; 11.2px on wide; 7.35px on phones, 30% tighter. p-1 is one unit, pt-8 is eight. Desk sizes marked &quot;at 1440&quot; scale the same way, never below their compact size.">
				<Block label="Scale">
					<Rows
						items={SPACES}
						render={(n) => (
							<div className="grid grid-cols-[4em_1fr] items-center gap-x-g desk:grid-cols-[4em_8em_1fr]">
								<Code>{n}</Code>
								<p className="hidden text-muted desk:block">
									{+(n * 7.35).toFixed(1)} / {+(n * 10.5).toFixed(1)} / {+(n * 11.2).toFixed(1)}px
								</p>
								<div className="h-[6px] rounded-full bg-black" style={{ width: `calc(var(--su) * ${n})` }} />
							</div>
						)}
					/>
					<Caption className="mt-1">px for compact / desk at 1440 / wide. The bars are drawn at this screen’s unit.</Caption>
				</Block>
				<Block label="In use">
					<Rows
						items={[
							["Section padding", "pt-6 pb-6", "Between sections."],
							["Section title to content", "mb-4 / mb-6", "Inside a section."],
							["Label to text", "mb-1 / mb-2", "Stacked label above its content on compact."],
							["Page top", "pt-[84px] → desk:pt-[120px]", "Pages without a hero, clear of the header."],
							["Footer", "p-m: the page margin on every side", ""],
							["Gutter", "gap-g", "6px: grid and column gaps."],
							["Page margin", "px-m", "12px compact, 24px desk: left and right page inset."],
						]}
						render={([name, cls, note]) => (
							<div className="grid grid-cols-1 gap-x-g desk:grid-cols-7">
								<p className="desk:col-span-2">{name}</p>
								<p className="desk:col-span-2">
									<Code>{cls}</Code>
								</p>
								<p className="text-muted desk:col-span-3">{note}</p>
							</div>
						)}
					/>
				</Block>
				<Block label="Radius">
					<div className="flex flex-wrap items-end gap-3">
						{[
							["size-[75px] rounded-ui bg-black", "rounded-ui · 6px · buttons, tags"],
							["size-[75px] rounded-media bg-black", "rounded-media · 3px compact, 6px desk · photos"],
							["h-[75px] w-[130px] rounded-full bg-black", "rounded-full · spacing bars only"],
						].map(([cls, label]) => (
							<div key={label} className="flex max-w-[12em] flex-col gap-1">
								<div className={cls} />
								<span className="text-muted">{label}</span>
							</div>
						))}
					</div>
				</Block>
			</Section>

			<Section id="colour" index={5} title="Colour" intro="One light theme. Paper and Ink are CSS variables; Lime and Muted are Tailwind colours.">
				<ul className="grid grid-cols-2 gap-x-g gap-y-3 min-[600px]:grid-cols-3 desk:grid-cols-5">
					{COLOURS.map((c) => (
						<li key={c.name}>
							<div className={`aspect-square w-full rounded-media border border-black/10 ${c.swatch}`} />
							<div className="mt-[6px] flex items-baseline justify-between gap-g">
								<p>{c.name}</p>
								<Code>{c.value}</Code>
							</div>
							<Caption>
								<Code>{c.token}</Code>
							</Caption>
							<p className="mt-1">{c.use}</p>
						</li>
					))}
				</ul>
			</Section>

			<Section id="components" index={6} title="Components" intro="Shared pieces, live. Hover them: letters roll and arrows swap.">
				<Block label="Arrow">
					<div className="flex flex-wrap items-center gap-3">
						<span className="flex items-center gap-g">
							<Arrow />
							<span className="text-muted">body</span>
						</span>
						<span className="flex items-center gap-g text-heading">
							<Arrow />
							<span className="text-body text-muted">heading</span>
						</span>
						<span className="flex items-center gap-g text-title">
							<Arrow />
							<span className="text-body text-muted">title</span>
						</span>
					</div>
					<Caption className="mt-1">
						components/Arrow.jsx · Lucide arrow-right, 0.9em, 2px stroke, round ends, text colour. The only arrow on the site.
					</Caption>
				</Block>

				<Block label="Buttons">
					<div className="flex flex-wrap items-center gap-g">
						<span className="rounded-ui bg-black/[0.06] p-g">
							<a href="#components" className={TAG}>
								<RollText>Book an Appointment</RollText>
								<Arrow />
							</a>
						</span>
						<a href="#components" className={BUTTON}>
							<RollText>Talk to us</RollText>
							<Arrow />
						</a>
						<a href="#components" className={CHIP}>
							<RollText>Chip</RollText>
						</a>
					</div>
					<Rows
						items={[
							["Tag", "padding 4 × 8.5px · body size · 6px radius", "Header CTA (white, inverts with the header)."],
							["Button", "padding 12 × 20px · 13 / 16px · 6px radius", "Compact CTA, fixed 16px above the bottom of the screen."],
							["Chip", "padding 9 × 14px · 1px border at 18% · 6px radius", "Filters and in-page navigation (this page)."],
						]}
						render={([name, spec, use]) => (
							<div className="grid grid-cols-1 gap-x-g desk:grid-cols-7">
								<p className="desk:col-span-1">{name}</p>
								<p className="desk:col-span-3">{spec}</p>
								<p className="text-muted desk:col-span-3">{use}</p>
							</div>
						)}
					/>
				</Block>

				<Block label="Line CTA">
					<div className="-mx-g">
						<LineCta href="/works" className="">
							View all projects
						</LineCta>
					</div>
					<Caption className="mt-1">components/LineCta.jsx · heading size, ruled top and bottom; fills with ink from the top on hover.</Caption>
				</Block>

				<Block label="Links">
					<div className="flex flex-wrap items-center gap-3">
						<a href="#components" className={LINK}>
							<RollText>View directions</RollText>
							<Arrow />
						</a>
						<a href="#components" className={LINK}>
							<RollText>Instagram</RollText>
						</a>
						<a href="#components" className="underline underline-offset-2 transition-opacity duration-200 hover:opacity-50">
							Play showreel
						</a>
					</div>
					<Caption className="mt-1">List links: ↳, letter roll, muted on hover. A lone inline action: underlined, fades to 50%.</Caption>
				</Block>

				<Block label="Project grid">
					<div className="grid grid-cols-10 gap-g desk:max-w-[60%]">
						{[
							["col-span-3", "aspect-square"],
							["col-span-4", "aspect-[4/3]"],
							["col-span-3", "aspect-square"],
							["col-span-5", "aspect-[5/3]"],
							["col-span-5", "aspect-[5/3]"],
						].map(([span, shape], i) => (
							<span key={i} className={`${span} ${shape} block rounded-media bg-black/10`} />
						))}
					</div>
					<Caption className="mt-1">
						components/WorksGrid.jsx · Home and /works. Rows of 3 + 4 + 3 columns, then 5 + 5, every row full width and the same height
						(square, 4:3 and 5:3 photos ≈ 0.29 × the page width). The name sits above each photo with the Lucide corner-down-right arrow.
						Phones: two per row, every third full width, 4:3. Cards rise in as they scroll in, the photo unmasking from the bottom;
						on hover the View project pill follows the pointer.
					</Caption>
				</Block>

				<Block label="Wordmark">
					<div className="grid gap-g min-[600px]:grid-cols-2">
						<div className="flex h-[180px] items-center justify-center rounded-media bg-black/[0.04]">
							<NosterLogo className="h-auto w-[50%]" />
						</div>
						<div className="flex h-[180px] items-center justify-center rounded-media bg-black text-white">
							<NosterLogo className="h-auto w-[50%]" />
						</div>
					</div>
					<Caption className="mt-1">components/NosterLogo.jsx · text colour · 13px tall in the header (15px desk).</Caption>
				</Block>

				<Block label="Where things live">
					<Rows
						items={FILES}
						render={([file, what]) => (
							<div className="grid grid-cols-1 gap-x-g desk:grid-cols-7">
								<p className="desk:col-span-3">
									<Code>{file}</Code>
								</p>
								<p className="text-muted desk:col-span-4">{what}</p>
							</div>
						)}
					/>
				</Block>
			</Section>

			<Section id="motion" index={7} title="Motion" intro="Hovers are quick and precise; page motion is slower. Everything stops under reduced motion.">
				<Rows
					items={[
						["Letter roll", "0.55s · cubic-bezier(0.76, 0, 0.24, 1) · 16ms per letter", "Links, buttons, chips (RollText inside a motion-host)."],
						["Arrow swap", "0.5s · same curve · copy enters 80ms later", "Every arrow inside a motion-host."],
						["Colour and opacity", "0.2s", "Link to muted, button opacity, chip border."],
						["Card hover", "the View project pill follows the pointer over the photo; no zoom", "Project cards."],
						["View pill", "scale 0 → 1 · 0.28s · cubic-bezier(0.2, 0.8, 0.2, 1)", "Follows the pointer over project photos."],
						["Line CTA fill", "0.6s · ease-quart, cubic-bezier(0.76, 0, 0.24, 1)", "Ink fills from the top."],
						["Curtain", "lime, covers the first paint; wordmark in from a 12px blur · 0.9s · cubic-bezier(0.22, 1, 0.36, 1); covers the page at once on a page change; holds 0.2s once the page is ready; revealed by the page sweep", "Page loads and page changes (Intro, SiteSweep)."],
						["Page sweep", "glimm band rises up the screen · 0.8s · easeInOutQuint, new page behind it", "Reveals the page from the curtain (lib/sweep.js → PAGE_SWEEP)."],
						["Hero entrance", "photo 1.12× → 1 · 2.4s; title lines rise from masks 1.2s · 0.09s apart", "SplitText lines (lib/motion.js → lineRise)."],
						["Scroll reveal", "fade and rise 32px · 1.1s · expo.out · 0.08s stagger", "<Reveal> with data-reveal children (lib/motion.js)."],
						["Project cards", "rise 40px, photo unmasks from the bottom (1.3s) and settles from 1.15×", "ScrollTrigger.batch, 90ms apart (360ms at most)."],
						["No flash", "start states held by CSS from the first frame (html.js-anim)", "Animations only ever play in; nothing hides after load."],
						["Project open", "press 0.98 · 0.1s; grow 0.75s · cubic-bezier(0.16, 1, 0.3, 1), no zoom; page fades out 0.35s; corners square off over the last 25%; shade to 25%; title rises on landing", "Card photo grows into the project hero (ProjectTransition)."],
					]}
					render={([name, spec, use]) => (
						<div className="motion-host grid grid-cols-1 gap-x-g desk:grid-cols-10">
							<p className="desk:col-span-3">
								<RollText>{name}</RollText>
							</p>
							<p className="desk:col-span-4">{spec}</p>
							<p className="text-muted desk:col-span-3">{use}</p>
						</div>
					)}
				/>
			</Section>

			<Section id="transitions" index={8} title="Transitions" intro="How pages arrive. Nothing is ever shown and then hidden: start states are held by CSS from the first frame.">
				<Rows
					items={[
						["Intro", "every page load: the lime curtain covers the page, its wordmark comes in from a blur; once fonts and the hero are ready it holds 0.2s and the site's glimm sweep rises over it, revealing the page as the hero and header take over", "components/Intro.jsx"],
						["Page to page", "exactly as a page load: the lime curtain covers the page at once and the new page loads behind it; once its hero photo is ready the curtain holds 0.2s and the glimm sweep reveals the page; its entrances play as it is revealed", "components/SiteSweep.jsx"],
						["Project open", "the card gives on press, then its photo grows out of its place into the project hero (no zoom, rounded corners until the edges, shade fading in) while the page fades out; the project page loads underneath mid-grow, the photo hands over in one frame and the title rises in", "components/ProjectTransition.jsx"],
						["Entrances", "hero and big titles rise line by line from masks; sections fade and rise; project cards unmask from the bottom", "lib/motion.js, components/Reveal.jsx"],
						["No flash", "an inline script marks <html> js-anim before the first paint; CSS holds start states only then", "lib/intro.js (INTRO_SCRIPT), globals.css"],
						["Reduced motion", "no curtain, no sweeps, nothing hidden: pages simply appear", ""],
					]}
					render={([name, what, where]) => (
						<div className="grid grid-cols-1 gap-x-g desk:grid-cols-10">
							<p className="desk:col-span-2">{name}</p>
							<p className="desk:col-span-5">{what}</p>
							<p className="text-muted desk:col-span-3">{where}</p>
						</div>
					)}
				/>
			</Section>
		</div>
	);
}
