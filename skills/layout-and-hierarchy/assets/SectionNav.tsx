/**
 * Two presentations of one tree — the canonical "fork the container, share
 * the data" example.
 *
 *   SectionNav         the sticky rail that lives in the left margin
 *   SectionNavCompact  the disclosure that replaces it when there's no margin
 *
 * Both render the same nodes through the same `Rows` component. Only the
 * container differs, because only the container's interaction model differs.
 *
 * Rows are real in-page anchors, so they work without JavaScript and can be
 * copied as links; the click handler takes over to scroll smoothly and keep
 * the URL in step.
 *
 * Pair with useActiveSection (interface-motion skill) for the scroll spy, and
 * give every heading a scroll-margin-top just under its READING_LINE.
 */

import { useMemo, useState } from "react";

export type TocNode = {
  /** Id of the heading this row jumps to. */
  id: string;
  label: string;
  children?: TocNode[];
};

/** Flattens the tree into document order — what the scroll spy measures. */
export function tocIds(nodes: TocNode[]): string[] {
  return nodes.flatMap((n) => [n.id, ...tocIds(n.children ?? [])]);
}

/** child id → parent id, so the section an active row belongs to stays lit. */
function parentMap(nodes: TocNode[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const n of nodes) for (const c of n.children ?? []) map.set(c.id, n.id);
  return map;
}

type RowState = "active" | "ancestor" | "rest";

function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="h-3.5 w-3.5"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/**
 * One row.
 *
 * Top-level rows sit flush and carry no marker — they read as the headings
 * they are, and the active one takes a heavier WEIGHT so its state isn't
 * signalled by colour alone (WCAG 1.4.1). Weight is a genuine second channel:
 * it survives greyscale, colour-blindness and low-contrast displays, and it's
 * cheaper than a background pill in a list that's meant to be quiet.
 *
 * Nested rows carry a horizontal marker that extends and darkens when active,
 * and which doubles as their indent. It sits in a FIXED-WIDTH box so growing
 * it never nudges the label.
 *
 * Three tiers of tone and marker, not two: `ancestor` (the section you're
 * inside, when a child is active) sits between active and rest, so you never
 * lose the larger context.
 */
function Row({
  node,
  state,
  nested,
  onJump,
}: {
  node: TocNode;
  state: RowState;
  nested?: boolean;
  onJump: (id: string) => void;
}) {
  const tone =
    state === "active"
      ? "text-gray-1000"
      : state === "ancestor"
        ? "text-gray-900"
        : "text-gray-600 hover:text-gray-1000";

  const marker =
    state === "active"
      ? "w-4 bg-gray-1000"
      : state === "ancestor"
        ? "w-2.5 bg-gray-600"
        : "w-2 bg-gray-500";

  return (
    <a
      href={`#${node.id}`}
      aria-current={state === "active" ? "true" : undefined}
      onClick={(e) => {
        e.preventDefault();
        onJump(node.id);
      }}
      className={`flex items-start gap-2.5 py-[3px] text-[13px] leading-[1.4] transition-colors duration-150 ease-geist ${tone} ${
        !nested && state === "active" ? "font-medium" : ""
      }`}
    >
      {nested && (
        <span aria-hidden className="mt-[9px] w-4 shrink-0">
          <span
            className={`block h-px transition-[width,background-color] duration-150 ease-geist motion-reduce:transition-none ${marker}`}
          />
        </span>
      )}
      {node.label}
    </a>
  );
}

/** Shared tree rendering. Both presentations go through this. */
function Rows({
  nodes,
  active,
  parents,
  onJump,
}: {
  nodes: TocNode[];
  active: string;
  parents: Map<string, string>;
  onJump: (id: string) => void;
}) {
  const state = (id: string): RowState =>
    id === active ? "active" : parents.get(active) === id ? "ancestor" : "rest";

  return (
    <>
      {nodes.map((n) => (
        <li key={n.id}>
          <Row node={n} state={state(n.id)} onJump={onJump} />
          {n.children && (
            <ul className="flex flex-col">
              {n.children.map((c) => (
                <li key={c.id}>
                  <Row node={c} state={state(c.id)} nested onJump={onJump} />
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </>
  );
}

/**
 * The sticky rail. Mount it as an absolute child of the wider frame, so it
 * sits outside the reading column:
 *
 *   <div className="relative mx-auto max-w-[1280px]">
 *     <div className="absolute inset-y-0 left-8 hidden w-[196px] xl:block">
 *       <div className="sticky top-28 max-h-[calc(100dvh-11rem)] overflow-y-auto">
 *         <SectionNav {...nav} />
 *       </div>
 *     </div>
 *     <div className="col">…</div>
 *   </div>
 *
 * The absolute wrapper spans the section's full height so the sticky child
 * has a track to travel. The dvh cap plus overflow-y-auto means a long
 * contents scrolls inside itself rather than running off the screen.
 */
export function SectionNav({
  nodes,
  active,
  onJump,
}: {
  nodes: TocNode[];
  active: string;
  onJump: (id: string) => void;
}) {
  const parents = useMemo(() => parentMap(nodes), [nodes]);

  return (
    <nav aria-label="On this page">
      <ul className="flex flex-col">
        <Rows nodes={nodes} active={active} parents={parents} onJump={onJump} />
      </ul>
    </nav>
  );
}

/**
 * The narrow-screen contents: collapsed to a single row, so it costs one line
 * above the article — which is the constraint that makes putting a nav in the
 * reading flow acceptable at all. Closes itself once you've jumped.
 *
 * <details> rather than a div and state, because it brings keyboard behaviour,
 * aria-expanded, and find-in-page (browsers open a closed <details> to reveal
 * a match) for free, and it works with JS disabled. Mirroring `open` into
 * state is only so the disclosure can close itself after a jump.
 *
 * group-open:rotate-180 reads the parent's `open` attribute directly — no
 * state needed for the chevron.
 */
export function SectionNavCompact({
  nodes,
  active,
  onJump,
}: {
  nodes: TocNode[];
  active: string;
  onJump: (id: string) => void;
}) {
  const parents = useMemo(() => parentMap(nodes), [nodes]);
  const [open, setOpen] = useState(false);

  const jump = (id: string) => {
    setOpen(false);
    onJump(id);
  };

  return (
    <details
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
      className="group rounded-xl border border-gray-alpha-300"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3.5 py-2.5 text-[13px] text-gray-1000 [&::-webkit-details-marker]:hidden">
        On this page
        <span className="text-gray-600 transition-transform duration-200 ease-geist group-open:rotate-180 motion-reduce:transition-none">
          <ChevronDownIcon />
        </span>
      </summary>
      <ul className="flex flex-col border-t border-gray-alpha-300 px-3.5 py-2">
        <Rows nodes={nodes} active={active} parents={parents} onJump={jump} />
      </ul>
    </details>
  );
}
