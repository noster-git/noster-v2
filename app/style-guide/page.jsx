import NosterLogo from "@/components/NosterLogo";
import LineCta from "@/components/LineCta";
import RollText from "@/components/RollText";
import Arrow, { ArrowIcon } from "@/components/Arrow";
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
	{ name: "Compact", when: "≤ 900px, or ≤ 1100px upright", prefix: "(base)", cols: "5", body: "11 / 12px", line: "12px" },
	{ name: "Desk", when: "≥ 901px landscape, or ≥ 1101px", prefix: "desk:", cols: "10", body: "12 / 15px", line: "15px" },
	{ name: "Wide", when: "≥ 1800px", prefix: "wide:", cols: "10", body: "13 / 16px", line: "16px" },
];

// Specimens use the real classes. Sizes: compact → desk (→ wide where it changes).
const TYPE = [
	{ token: "text-display", size: "12vw → 115px at 1440", spec: "line 0.8 · tracking −0.055em · regular", use: "One big word or line: Works title, Behind the Scenes, Let’s Build Together.", sample: "Workspaces" },
	{ token: "text-title", size: "28px → 46px at 1440", spec: "line 1.02 · tracking −0.025em · light", use: "Page and section titles, the home hero, project names.", sample: ":Featured Works" },
	{ token: "text-lead", size: "17px → 32px (2.1vw above 1520)", spec: "line 1.18 → 1.1 → 1.05 · tracking −0.015em · light", use: "Statements and intros: Our Approach, The Project, Contact.", sample: "We design, build and furnish workspaces for technology companies." },
	{ token: "text-heading", size: "20px → 32px", spec: "line 1 · tracking −0.025em · regular", use: "Block headings and the line CTA.", sample: "View all projects" },
	{ token: "text-body", size: "11px → 12px → 13px", spec: "line = one spacing unit · tracking −0.025em", use: "Everything that is read: body, captions, nav, footer, details. The page default.", sample: "Trivandrum · Kochi · Hyderabad — Noster designs, builds and furnishes offices." },
	{ token: "text-body", size: "as body", spec: "the label style, sentence case", use: "Section labels (Our approach), project names on cards.", sample: "Our approach" },
	{ token: "text-body text-muted", size: "as body", spec: "#666", use: "Secondary text: addresses, detail labels.", sample: "↳ Brand identity, workspace design" },
];

const SPACES = [1, 2, 3, 4, 6, 8, 12];

const COLOURS = [
	{ name: "Paper", value: "#FFFFFF", token: "bg-(--paper)", use: "Page background. Turns black in the dark theme.", swatch: "bg-white" },
	{ name: "Ink", value: "#000000", token: "text-(--ink)", use: "Text, rules and hover fills. Turns white in the dark theme.", swatch: "bg-black" },
	{ name: "Lime", value: "#D3FD5E", token: "text-lime", use: "The only accent: the home hero title.", swatch: "bg-lime" },
	{ name: "Muted", value: "#666666", token: "text-muted", use: "Secondary text (5.7:1 on white, passes AA).", swatch: "bg-muted" },
	{ name: "Footer ink", value: "#14120E", token: "text-[rgb(20,18,14)]", use: "Footer text, a warm near-black.", swatch: "bg-[#14120E]" },
];

const FILES = [
	["app/globals.css", "Breakpoints (desk, wide), grid-site, type and spacing tokens, radii, colours, hover motion"],
	["components/Arrow.jsx", "The arrow (Lucide arrow-right) and its hover swap"],
	["components/RollText.jsx", "Letter roll on hover"],
	["components/LineCta.jsx", "Full-width ruled link"],
	["components/Navigation.jsx", "Header, CTA tag, compact CTA button"],
	["components/WorksGrid.jsx", "Project grid (Home, /works), card reveals, View pill"],
	["components/Intro.jsx", "First-visit curtain and header entrance"],
	["components/PageTransition.jsx", "Veil transition between pages"],
	["components/PhotoReveal.jsx", "Photos unmasking as they scroll in"],
	["lib/intro.js", "No-flash script and the entrance gate"],
	["lib/projects.js", "City, sector and year for the index, read from each project's brief"],
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

const TAG = "motion-host inline-flex items-center gap-[6px] rounded-ui bg-black px-[8.5px] py-[4px] leading-none text-white";
const BUTTON = "motion-host inline-flex items-center gap-[8px] rounded-ui bg-black px-[20px] py-[12px] text-[13px] leading-[16px] text-white";
const CHIP = "motion-host inline-flex items-center gap-[6px] rounded-ui border border-black/18 px-[14px] py-[9px] leading-none transition-colors duration-200 hover:border-black";
const LINK = "motion-host inline-flex items-center gap-[0.3em] before:content-['↳'] transition-colors duration-200 hover:text-muted";

export default function Page() {
	return (
		<div className="px-g pt-[84px] desk:pt-[120px]">
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
						["One grid.", "Ten columns on desk, five on compact, 6px apart and 6px from the edge. Everything sits on it."],
						["Small, fixed type.", "Body is 11–13px. Size jumps are big and few: body, heading, lead, title, display."],
						["Spacing in lines.", "One spacing unit is one line of body text, so gaps and text keep the same rhythm."],
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
				intro="Two layouts, switched by the desk: variant. Phones and tablets held upright get compact; landscape tablets, laptops and desktops get desk."
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
									body {l.body} · unit {l.line}
								</p>
							</div>
						)}
					/>
				</Block>
				<Block label="Grid · grid-site">
					<div className="grid-site h-[120px]">
						{Array.from({ length: 10 }, (_, i) => (
							<div key={i} className={`flex items-end rounded-[3px] bg-lime/60 p-[4px] ${i >= 5 ? "hidden desk:flex" : ""}`}>
								{i + 1}
							</div>
						))}
					</div>
					<Caption className="mt-1">
						This strip is a live grid-site: resize the window to see it go from 10 to 5 columns. Gap and page margin are <Code>g</Code> (6px):{" "}
						<Code>px-g</Code>, <Code>gap-g</Code>.
					</Caption>
				</Block>
				<Block label="Placing things">
					<div className="flex flex-col gap-g">
						<div className="grid-site">
							<div className="col-span-5 rounded-[3px] bg-black/[0.06] p-[4px] desk:col-span-3">label · col-span-3</div>
							<div className="col-span-5 mt-g rounded-[3px] bg-black/10 p-[4px] desk:col-span-7 desk:mt-0">content · col-span-7</div>
						</div>
						<div className="grid grid-cols-[clamp(60px,6vw,84px)_1fr_clamp(170px,17.14vw,240px)_clamp(90px,9.14vw,120px)_clamp(30px,3vw,48px)] gap-[clamp(14px,1.71vw,24px)] rounded-[3px] bg-black/[0.06] p-[4px] *:truncate">
							<span>no.</span>
							<span>name</span>
							<span>city</span>
							<span>sector</span>
							<span>year</span>
						</div>
					</div>
					<Caption className="mt-1">
						Sections: a label in columns 1–3 and the content in 4–10. The works rail runs down the centre on its own.
					</Caption>
				</Block>
			</Section>

			<Section id="typography" index={3} title="Typography" intro="Geist, from next/font. Five sizes; light weight for lead and title, regular for the rest. No bold.">
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

			<Section id="spacing" index={4} title="Spacing" intro="The spacing unit is one line of body text: 12px on compact, 15px on desk, 16px on wide. p-1 is one line, pt-8 is eight.">
				<Block label="Scale">
					<Rows
						items={SPACES}
						render={(n) => (
							<div className="grid grid-cols-[4em_1fr] items-center gap-x-g desk:grid-cols-[4em_8em_1fr]">
								<Code>{n}</Code>
								<p className="hidden text-muted desk:block">
									{n * 12} / {n * 15} / {n * 16}px
								</p>
								<div className="h-[6px] rounded-full bg-black" style={{ width: `calc(var(--bl) * ${n})` }} />
							</div>
						)}
					/>
					<Caption className="mt-1">px for compact / desk / wide. The bars are drawn at this screen’s unit.</Caption>
				</Block>
				<Block label="In use">
					<Rows
						items={[
							["Section padding", "pt-8 pb-8", "Between sections."],
							["Section title to content", "mb-6", "Inside a section."],
							["Label to text", "mb-1 / mb-2", "Stacked label above its content on compact."],
							["Page top", "pt-[84px] → desk:pt-[120px]", "Pages without a hero, clear of the header."],
							["Footer top", "pt-[64px] → desk:pt-[120px]", ""],
							["Gutter", "px-g · gap-g", "6px: page margin and grid gap."],
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

			<Section id="colour" index={5} title="Colour" intro="Paper and Ink are CSS variables that swap in the dark theme. Lime and Muted are Tailwind colours.">
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
					<div className="grid grid-cols-10 gap-[3px] desk:max-w-[60%]">
						{[
							["col-span-3", "aspect-square"],
							["col-span-4", "aspect-[4/3]"],
							["col-span-3", "aspect-square"],
							["col-span-5", "aspect-[5/3]"],
							["col-span-5", "aspect-[5/3]"],
						].map(([span, shape], i) => (
							<span key={i} className={`${span} ${shape} block rounded-[3px] bg-black/10`} />
						))}
					</div>
					<Caption className="mt-1">
						components/WorksGrid.jsx · Home and /works. Rows of 3 + 4 + 3 columns, then 5 + 5, every row full width and the same height
						(square, 4:3 and 5:3 photos ≈ 0.29 × the page width). The name sits above each photo with the Lucide corner-down-right arrow.
						Phones: two per row, every third full width, 4:3. Cards rise in as they scroll in, the photo unmasking from the bottom;
						on hover the photo zooms to 1.04× and the View project pill follows the pointer.
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
						["Card hover", "photo zooms to 1.04× · 1.2s · ease-out-quint", "Project cards."],
						["View pill", "scale 0 → 1 · 0.28s · cubic-bezier(0.2, 0.8, 0.2, 1)", "Follows the pointer over project photos."],
						["Line CTA fill", "0.6s · cubic-bezier(0.85, 0, 0.15, 1)", "Ink fills from the top."],
						["Page transition", "veil up 0.7s, veil off 0.9s · expo.inOut", "Every internal link but project photos."],
						["Page-load intro", "first visit: logo rises 0.9s, curtain lifts 1.1s expo.inOut; then hero and header", "components/Intro.jsx; once per session."],
						["Hero entrance", "photo 1.12× → 1 · 2.4s; title lines rise from masks 1.2s · 0.09s apart", "SplitText lines (lib/motion.js → lineRise)."],
						["Scroll reveal", "fade and rise 32px · 1.1s · expo.out · 0.08s stagger", "<Reveal> with data-reveal children (lib/motion.js)."],
						["Project cards", "rise 40px, photo unmasks from the bottom (1.3s) and settles from 1.15×", "ScrollTrigger.batch, 0.1s apart."],
						["No flash", "start states held by CSS from the first frame (html.js-anim)", "Animations only ever play in; nothing hides after load."],
						["Project open", "0.9s · power3.inOut", "Card photo grows into the project hero (ProjectTransition)."],
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
						["Intro", "first visit of a session, on Home: the logo rises into a white curtain, the curtain lifts (≈1.9s), the hero and header take over", "components/Intro.jsx"],
						["Page to page", "a white veil rises over the page (0.7s) as it eases up, the route changes, the veil lifts off the new page (0.9s) as its entrances play", "components/PageTransition.jsx"],
						["Project photo", "clicking a project photo grows it into the project hero; the title rises in after", "components/ProjectTransition.jsx"],
						["Entrances", "hero and big titles rise line by line from masks; sections fade and rise; photos unmask from the bottom", "lib/motion.js, components/Reveal.jsx, PhotoReveal.jsx"],
						["No flash", "an inline script marks <html> js-anim before the first paint; CSS holds start states only then", "lib/intro.js (INTRO_SCRIPT), globals.css"],
						["Reduced motion", "no curtain, no veil, nothing hidden: pages simply appear", ""],
					]}
					render={([name, what, where]) => (
						<div className="grid grid-cols-1 gap-x-g desk:grid-cols-10">
							<p className="uppercase desk:col-span-2">{name}</p>
							<p className="desk:col-span-5">{what}</p>
							<p className="text-muted desk:col-span-3">{where}</p>
						</div>
					)}
				/>
			</Section>
		</div>
	);
}
