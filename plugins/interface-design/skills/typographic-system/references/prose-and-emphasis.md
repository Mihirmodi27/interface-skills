# Prose and emphasis

The reading half: blocks sharing the body size and what separates them, emphasis per preset, and imported prose. Spacing values between blocks belong to `layout-and-hierarchy`; this file names only the ratios that are type signals.

## The container sets the register

One wrapper carries the reading size, leading and tier; every block inside overrides only what differs.

```css
.prose {
  font-size: var(<type.body size>);
  line-height: var(<type.body leading>);
  color: var(<text.primary>);
  max-inline-size: var(<measure.reading>);
}
```

A paragraph setting its own size inside `.prose` is a finding: it has opted out of the register, and the next restyle will miss it.

## Reading blocks, and the axis each owns

Each block at body size needs a signal the others don't use (law 4). A typical set:

| Block | Role | Its signal | What it must not do |
|---|---|---|---|
| Body | `type.body` | none — the baseline | set its own size |
| Lead | `type.lead` | more open leading, more space below | be larger than the heading above it |
| Keyline | project role under `type.body` | `weight.strong`, symmetric space | appear twice in one section |
| Dek | `type.supporting` | `text.secondary`, tighter leading | read as the first paragraph |
| Pull quote | project role under `type.body` | a solid bar and an indent | step down a tier — at body size it just looks de-emphasised |
| Note | project role under `type.meta` | one size down, `text.tertiary`, a lighter rule | share the quote's rule weight |
| Caption | `type.meta` | one size down, `text.tertiary` | sit at body size, competing with the next paragraph |

**Dek and lead are the tightest pairing** — often adjacent, told apart only by tier and leading. Check them first when a page looks undifferentiated.

**Two indented rules on one page must be unmistakable.** If quote and note both carry a left rule, the rules differ in weight (a heavy bar against a hairline) *and* their type in size and tier. The Glass quote's bar is three times the note's rule; the note is a step smaller and two tiers quieter.

**Heading space is asymmetric, and the ratio is the type signal**: about 3:1 above to below, so a heading belongs to what it introduces; equal space floats it between sections. The keyline is the deliberate exception, symmetric because it belongs to neither neighbour.

## Two block types worth having

Both came from one Glass diagnosis: a hundred-odd paragraphs and nothing else. Not too much content — **one texture**.

**The keyline — the one sentence a section is for.** Promote a sentence out of its paragraph and delete it there; that discipline is the point, so a section that gains a keyline gets shorter. One per section, never two.

**The note — an aside outside the argument**: a caveat, a scope limit, provenance. With somewhere to go, qualifications leave the main text.

Enforce the discipline at build time: fail on a blank keyline or note, two keylines in one section, or a keyline grown back to paragraph length.

## Quotes

At body size the bar is the whole signal, so it has to be a real one:

```css
.quote { display: flex; gap: var(<space.tight>); }
.quote::before {
  content: "";
  flex: none;
  inline-size: 3px;           /* rule.emphasis */
  border-radius: 999px;
  background: var(<mark>);
}
.quote cite { display: block; font-style: normal; font-size: var(<type.meta size>); color: var(<text.tertiary>); }
```

A flex child, not `border-inline-start`: a border can't be rounded alone, and a squared bar reads as a table rule. With no vertical margin, flex's stretch runs it the full height, citation included. Wherever italic is off, `cite` needs `font-style: normal`: `<cite>` and `<blockquote>` carry user-agent italics a global `em` rule doesn't reach.

## Lists

Markers sit a tier below the text: `li::marker { color: var(<mark>) }`; at text colour, bullets pull the eye down the left edge. Ordered markers take `font-variant-numeric: tabular-nums` so item 10 doesn't shift its text. Items sit closer to each other than to what follows the list.

## Emphasis, per preset

Keep the semantic tags — assistive technology announces them — and map their look onto an existing axis.

| | editorial | product | expressive |
|---|---|---|---|
| `<strong>` | `weight.strong` + `text.primary` | `weight.strong` | `weight.strong` |
| `<em>` | true italic, if the family ships one; else `text.secondary`, no slant | `text.secondary`, no slant | true italic if the family ships one |
| `<cite>`, titles of works | true italic, or the `<em>` mapping | the `<em>` mapping | true italic |
| `<b>`, `<i>` | same as `strong`, `em` | same | same |

`<em>` on a quieter tier gives two-directional emphasis — strong advances, em recedes — that a bold-only system can't, and suits interfaces without a usable italic. Where the family has a real text italic, use it: editorial without italic loses the convention readers rely on for titles and terms.

Three rules hold whatever the mapping:

```css
html { font-synthesis: none; }       /* a missing style is a gap you see, not a smear you ship */
strong, b { font-weight: var(<weight.strong>); }   /* not the UA's 700 */
```

- **Never heavier than a heading.** `<strong>` at 700 under a 500 heading outranks it (law 3, inside a line).
- **Short.** Longer than a few words, it wants to be its own block (law 9).
- **Weight only on states that don't follow the pointer.** Emphasis that changes on hover shifts the line.

## Prose you can't put classes on

Markdown, a CMS rich-text field, a README: a string with nothing to hang a class on. Style by element inside one scoped class, each element mapped onto an existing role:

```css
.prose-imported { font-size: var(<type.body size>); line-height: var(<type.body leading>); }
.prose-imported > :first-child { margin-block-start: 0; }
.prose-imported h1,
.prose-imported h2 { font-size: var(<type.heading size>); line-height: var(<type.heading leading>);
                     letter-spacing: var(<type.heading tracking>); font-weight: var(<weight.strong>); }
.prose-imported h3 { font-size: var(<type.subheading size>); font-weight: var(<weight.strong>); }
.prose-imported h4 { font-size: var(<type.meta size>); font-weight: var(<weight.strong>);
                     color: var(<text.secondary>); }
.prose-imported code { font-family: var(<family.mono>); font-size: 0.875em; }
.prose-imported pre,
.prose-imported .table-scroll { overflow-x: auto; }
.prose-imported table { font-size: var(<type.meta size>); font-variant-numeric: tabular-nums; }
.prose-imported li::marker { color: var(<mark>); font-variant-numeric: tabular-nums; }
```

What this must get right that authored prose doesn't (add a role only where the document needs something your pages don't):

- **A document `h1` is not the page's title.** Map it to `type.heading`, or the imported text outranks its page.
- **The first child's top margin goes**, or an opening heading pushes its space above nothing.
- **Three heading levels, not two.** Documents nest deeper than designed pages: `h3` takes `type.subheading`, and `h4` a real role, not a browser default.
- **Code blocks and tables scroll inside their own box**, being Markdown's two unbounded things. Wrap each `<table>` in a scrolling element at render time; the page never scrolls sideways.
- **Your own markers.** A UA disc at body size is usually the heaviest thing on the page.
- **Only mapped elements.** Unmapped ones — `<dl>`, `<kbd>`, `<sup>` — fall through to the browser. List what the source can emit and map each, or strip it at render.

**Imported prose is a guest in the type system, not a second one.** A role added for it — only where the document needs something the pages don't — is a project role with a `DESIGN.md` row like any other.
