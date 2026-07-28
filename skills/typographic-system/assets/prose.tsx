/**
 * Long-form prose renderer — the reading half of the type system.
 *
 * The wrapper sets the register (16/1.75, primary colour) and each block
 * overrides only what differs. Spacing is deliberately asymmetric around
 * headings: 44px above, 12px below, so a heading belongs to the paragraph
 * that follows it rather than floating between two sections.
 *
 * Colour comes from the color-and-theming skill: `gray-1000`/`gray-900` for
 * the two upper text tiers, and the `muted`/`quiet` tokens below them (which
 * are deliberately NOT ramp steps — 500–800 are border values and fail as
 * text in a light theme). `gray-500` stays on list markers, which carry no
 * text. `reveal` comes from interface-motion.
 */

import { Fragment, type ReactNode } from "react";

export type Block =
  | { type: "p" | "lead"; text: string }
  | { type: "h2"; text: string }
  | { type: "quote"; text: string; cite?: string }
  | { type: "ul" | "ol"; items: string[] };

export function Prose({ blocks }: { blocks: Block[] }) {
  return (
    <div className="text-[16px] leading-[1.75] text-gray-1000">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "lead":
          case "p":
            return (
              <p key={i} className="reveal mb-6">
                {renderInline(b.text)}
              </p>
            );

          /* 19px against 16px body is a small step — the weight, the tight
             leading and the 44px above do the real work. */
          case "h2":
            return (
              <h2
                key={i}
                className="reveal mt-11 mb-3 text-[19px] font-medium leading-[1.3] tracking-[-0.015em] text-gray-1000"
              >
                {renderInline(b.text)}
              </h2>
            );

          /* Set apart by texture, not decoration: a size step up, a leading
             step DOWN (1.5 vs the body's 1.75), a step down the colour ramp,
             and a hairline rule. No italic, no quote marks, no background —
             the words aren't yours, so they recede even as they grow. */
          case "quote":
            return (
              <blockquote
                key={i}
                className="reveal my-8 border-l-2 border-gray-alpha-300 pl-5 text-[19px] leading-[1.5] tracking-[-0.01em] text-gray-900"
              >
                {renderInline(b.text)}
                {/* not-italic is required — <cite> carries UA italics that the
                    global `em, i { font-style: normal }` rule doesn't reach. */}
                {b.cite && (
                  <cite className="mt-2 block text-[13px] not-italic text-quiet">— {b.cite}</cite>
                )}
              </blockquote>
            );

          /* marker: drops the bullets to the quiet tier. At the text colour
             they read as a column of dark dots pulling the eye down the left
             edge; quiet, they read as structure. space-y-2 inside vs mb-6
             below — items belong to each other more than to what follows. */
          case "ul":
            return (
              <ul key={i} className="reveal mb-6 list-disc space-y-2 pl-5 marker:text-gray-500">
                {b.items.map((it, j) => (
                  <li key={j}>{renderInline(it)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="reveal mb-6 list-decimal space-y-2 pl-5 marker:text-gray-500">
                {b.items.map((it, j) => (
                  <li key={j}>{renderInline(it)}</li>
                ))}
              </ol>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}

/**
 * Inline markdown for **strong** and *em*, mapped onto the system's two axes
 * instead of bold and italic:
 *
 *   **strong** → weight 500 + primary colour   (advances)
 *   *em*       → muted colour, no slant        (recedes)
 *
 * This gives genuinely two-directional emphasis, which a bold-only system
 * can't express. The semantic tags stay — screen readers still announce them.
 */
export function renderInline(text: string): ReactNode {
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return (
    <>
      {tokens.map((tok, i) => {
        if (tok.startsWith("**") && tok.endsWith("**")) {
          return (
            <strong key={i} className="font-medium text-gray-1000">
              {tok.slice(2, -2)}
            </strong>
          );
        }
        if (tok.startsWith("*") && tok.endsWith("*")) {
          return (
            <em key={i} className="text-muted">
              {tok.slice(1, -1)}
            </em>
          );
        }
        return <Fragment key={i}>{tok}</Fragment>;
      })}
    </>
  );
}
