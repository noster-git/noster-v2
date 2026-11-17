"use client";

import { Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Img from "@/components/Img";
import WorksGrid, { valueStore } from "@/components/WorksGrid";
import Reveal from "@/components/Reveal";
import RollText from "@/components/RollText";
import Arrow from "@/components/Arrow";

const noop = () => () => {};
const useIsClient = () => useSyncExternalStore(noop, () => true, () => false);
const pad = (n) => String(n).padStart(2, "0");

/**
 * /works: every project, as the photo grid (WorksGrid) or as a ruled list, switched with the Grid / List
 * toggle above them. The choice is kept in the address (?view=list; the grid has none), so a shared or
 * reloaded link opens the same view.
 *
 * The entrances (cards unmasking, rows rising) play on the page's first view only. A view chosen with
 * the toggle is simply faded in (200ms), already in place.
 *
 * @param {{ works: import("react").ComponentProps<typeof WorksGrid>["works"] }} props
 */
export default function WorksIndex({ works }) {
	const [view, setView] = useState("grid");
	const [switched, setSwitched] = useState(false);
	const router = useRouter();
	const pathname = usePathname();

	const choose = (v) => {
		if (v !== view) setSwitched(true);
		setView(v);
		const params = new URLSearchParams(window.location.search);
		if (v === "list") params.set("view", "list");
		else params.delete("view");
		const query = params.toString();
		router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
	};

	// Each view is a new element (keyed below): once the toggle has been used, it fades in as it mounts.
	const fadeIn = useCallback(
		(el) => {
			if (el && switched) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: "cubic-bezier(0.33, 1, 0.68, 1)" });
		},
		[switched],
	);

	return (
		<>
			{/* The page is prerendered without the address's query: the grid is in the HTML and the view
			    follows ?view once the page runs in the browser. */}
			<Suspense fallback={null}>
				<ViewParam onView={setView} />
			</Suspense>
			{/* overflow-x-clip: the last button's 44px touch area (.hit) would reach past the page edge on phones. */}
			<div role="group" aria-label="Show projects as" className="flex justify-end gap-[24px] overflow-x-clip px-m pb-2">
				{["grid", "list"].map((v) => (
					<button
						key={v}
						type="button"
						aria-pressed={view === v}
						onClick={() => choose(v)}
						// Text buttons: the active one underlined (the underline fades between them); keyboard focus
						// thickens the underline at once, no box. Pressing dims the label on touch too.
						className={`hit cursor-pointer capitalize underline underline-offset-2 transition-[opacity,color,text-decoration-color] duration-200 ease-out hover:opacity-60 focus-visible:decoration-current focus-visible:decoration-2 focus-visible:outline-none active:opacity-50 active:duration-100 ${view === v ? "" : "text-muted decoration-transparent"}`}
					>
						{v}
					</button>
				))}
			</div>
			<div key={view} ref={fadeIn}>
				{view === "grid" ? <WorksGrid works={works} lead entrance={!switched} /> : <WorksList works={works} entrance={!switched} />}
			</div>
		</>
	);
}

/** Reads the view from the address (?view=list) and hands it up whenever it changes. Renders nothing. */
function ViewParam({ onView }) {
	const view = useSearchParams().get("view") === "list" ? "list" : "grid";
	useEffect(() => onView(view), [view, onView]);
	return null;
}

/**
 * The list: one ruled row per project, its number, its name at heading size and the arrow. Hovering the list
 * dims the other rows; with a mouse the hovered project's photo follows the pointer (all the photos are laid
 * on top of each other and only the hovered one shows, so switching rows never waits for a download).
 * Rows open the project with the page curtain. `entrance`: the rows rise in as they scroll into view
 * (Reveal); without it they are simply there.
 */
function WorksList({ works, entrance = true }) {
	// The hovered row lives outside the list's state, so hovering re-renders only the preview.
	const [hovered] = useState(() => valueStore(-1));
	const List = entrance ? Reveal : "ul";

	return (
		<>
			<Preview works={works} hovered={hovered} />
			<List {...(entrance && { as: "ul" })} className="group/list px-m pb-8" onMouseLeave={() => hovered.set(-1)}>
				{works.map((work, i) => (
					<li key={work.href} data-reveal={entrance || undefined} className="border-t border-rule last:border-b">
						<Link
							href={work.href}
							onMouseEnter={() => hovered.set(i)}
							onFocus={() => hovered.set(-1)}
							// Studio preview: the row opens the project's entry, its name the name. Not dragged (newest first).
							data-sanity={work.edit?.item}
							data-sanity-drag-disable={work.edit ? "true" : undefined}
							className="motion-host grid-site items-baseline py-2 transition-opacity duration-300 ease-out group-hover/list:opacity-30 hover:opacity-100! focus-visible:outline-offset-0"
						>
							<span aria-hidden="true" className="col-span-1 text-muted tabular-nums">
								{pad(i + 1)}
							</span>
							<span className="col-span-3 min-w-0 text-heading desk:col-span-8">
								<RollText truncate edit={work.edit?.name}>
									{work.name}
								</RollText>
							</span>
							{/* Centred on the row rather than on the baseline, so it lines up with the name's capitals. */}
							<span className="col-span-1 flex justify-end self-center text-heading">
								<Arrow />
							</span>
						</Link>
					</li>
				))}
			</List>
		</>
	);
}

/**
 * The hovered project's photo (`hovered`, a valueStore), 4:3 and 22vw wide, trailing the pointer (with a mouse only).
 * Moving between rows, the new photo fades in on top of the last one, which stays fully shown under it until
 * the fade is done, so the page never shows through mid-swap.
 */
function Preview({ works, hovered }) {
	const ref = useRef(null);
	const client = useIsClient();
	const active = useSyncExternalStore(hovered.subscribe, hovered.get, () => -1);

	useEffect(() => {
		const move = (e) => {
			if (ref.current) ref.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
		};
		document.addEventListener("pointermove", move);
		return () => document.removeEventListener("pointermove", move);
	}, []);

	if (!client) return null;
	return createPortal(
		<div
			ref={ref}
			aria-hidden="true"
			// The transition trails the pointer a little, so the photo glides rather than sticks.
			className="pointer-events-none fixed top-0 left-0 z-30 hidden transition-transform duration-500 ease-out-quint will-change-transform desk-mouse:block motion-reduce:transition-none"
		>
			<div
				className={`relative aspect-[4/3] w-[22vw] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-ui transition-[scale,opacity] duration-300 ease-out-quint ${active >= 0 ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
			>
				{works.map((work, i) => (
					<Img
						key={work.href}
						image={work.image}
						fill
						sizes="22vw"
						fallbackAlt=""
						className={`object-cover transition-opacity ${i === active ? "z-1 opacity-100 duration-200 ease-out" : "opacity-0 delay-200 duration-0"}`}
					/>
				))}
			</div>
		</div>,
		document.body,
	);
}
