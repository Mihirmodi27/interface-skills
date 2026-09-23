# Prose and emphasis

How the reading half of a type system is set: the blocks that share the body size and what separates each, emphasis mapped per preset, and imported prose you can't put classes on. Spacing values between blocks belong to `layout-and-hierarchy`; this file names only the ratios that are type signals.

## The container sets the register

One wrapper carries the reading size, leading and tier; every block inside inherits and overrides only what differs.

```css
.prose {
  font-size: var(<type.body size>);
  line-height: var(<type.body leading>);
  color: var(<text.primary>);
  max-inline-size: var(<measure.reading>);
}
```

A paragraph that sets its own size inside `.prose` is a finding. It means one block has opted out of the column's register, and the next person to restyle the column will miss it.

## Reading blocks, and the axis each owns

When several blocks share the body size, each needs a signal the others don't use (law 4). A typical set:

| Block | Role | Its signal | What it must not do |
|---|---|---|---|
| Body | `type.body` | none — the baseline | set its own size |
| Lead | `type.lead` | more open leading, more space below | be larger than the heading above it |
| Keyline | project role under `type.body` | `weight.strong`, symmetric space | appear twice in one section |
| Dek | `type.supporting` | `text.secondary`, tighter leading | read as the first paragraph |
| Pull quote | project role under `type.body` | a solid bar and an indent | step down a tier — at body size it just looks de-emphasised |
| Note | project role under `type.meta` | one size down, `text.tertiary`, a lighter rule | share the quote's rule weight |
| Caption | `type.meta` | one size down, `text.tertiary` | sit at body size, where it competes with the next paragraph |

**The dek and the lead are the tightest pairing.** They are often adjacent, at one size, told apart only by tier and leading. Check that pair first when a page starts to look undifferentiated.

**Two indented rules on one page must be unmistakable.** If both the quote and the note carry a left rule, make them different in weight (a heavy bar against a hairline) *and* the type inside them different in size and tier. In the Glass package the quote's bar is three times the note's rule and the note is a step smaller and two tiers quieter.

**Heading space is asymmetric, and the ratio is the type signal.** More space above a heading than below it — about 3:1 — so it belongs to the paragraph it introduces. A heading with equal space either side floats between sections. The keyline is the deliberate exception: symmetric, because it belongs to neither neighbour.

## Two block types worth having

Both came out of the same diagnosis in the Glass package: a body of writing that was a hundred-odd paragraphs and nothing else. Not too much content — **one texture**.

**The keyline — the one sentence a section is for.** Promote a sentence out of a paragraph and delete it from the paragraph. That discipline is what makes it work: a section that gains a keyline gets shorter. One per section, never two.

**The note — an aside set outside the argument.** A caveat, a scope limit, a piece of provenance. Once there is somewhere for a qualification to go, the main text stops carrying qualifications it doesn't need.

A block type that only works when authored with discipline needs the discipline enforced. Validate content at build time: fail on a blank keyline or note, two keylines in one section, or a keyline that has grown back to paragraph length.

## Quotes

The bar is the whole signal once the quote is at body size, so it has to be a real one:

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

A flex child rather than `border-inline-start`, because a border can't be rounded on its own and a squared bar reads as a table rule. With no vertical margin, flex's default stretch runs it the full height, citation included. `font-style: normal` on `cite` is required wherever italic is off: `<cite>` and `<blockquote>` carry user-agent italics a global `em` rule doesn't reach.

## Lists

Drop markers a tier below the text: `li::marker { color: var(<mark>) }`. At the text colour a column of bullets pulls the eye down the left edge; quieter, it reads as structure. Ordered-list markers take `font-variant-numeric: tabular-nums` so item 10 doesn't shift its text. Space between items tighter than space after the list, so the items belong to each other more than to what follows.

## Emphasis, per preset

Keep the semantic tags — assistive technology announces them — and map their look onto an axis the system already has.

| | editorial | product | expressive |
|---|---|---|---|
| `<strong>` | `weight.strong` + `text.primary` | `weight.strong` | `weight.strong` |
| `<em>` | true italic, if the family ships one; else `text.secondary`, no slant | `text.secondary`, no slant | true italic if the family ships one |
| `<cite>`, titles of works | true italic, or the `<em>` mapping | the `<em>` mapping | true italic |
| `<b>`, `<i>` | same as `strong`, `em` | same | same |

Mapping `<em>` onto a quieter tier gives a two-directional emphasis — strong advances, em recedes — which a bold-only system can't express. It suits interfaces without a usable italic. Where the family has a real italic drawn for text, use it: an editorial system without italic loses the convention readers rely on for titles and terms.

Three rules hold whatever the mapping:

```css
html { font-synthesis: none; }       /* a missing style is a gap you see, not a smear you ship */
strong, b { font-weight: var(<weight.strong>); }   /* not the UA's 700 */
```

- **Never heavier than a heading.** `<strong>` at 700 under a 500 heading outranks it (law 3, inside a line).
- **Short.** At heading weight and body size, a long strong run reads as a keyline or heading that failed to get its own line. Anything longer than a few words wants to be its own block.
- **Weight only on states that don't follow the pointer.** Emphasis that changes on hover shifts the line.

## Prose you can't put classes on

Markdown rendered to HTML, a CMS rich-text field, a README. It arrives as a string, so there's nothing to hang a class on and no component to vary. Style by element inside one scoped class and map every element onto a role you already have:

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

What this has to get right that authored prose doesn't:

- **An `h1` inside the document is not the page's title.** The page already has one. Map a document `h1` to `type.heading`, or the imported text outranks the page it sits on.
- **The first child's top margin goes.** A document starting with a heading otherwise pushes a heading's worth of space above nothing.
- **Three heading levels, not two.** Documents nest deeper than designed pages; `h4` gets a real role instead of a browser default.
- **Code blocks and tables scroll inside their own box.** They are the two unbounded things Markdown has and designed pages don't. Wrap each `<table>` in a scrolling element at render time; the page body must never scroll sideways.
- **Your own markers.** A UA disc at body size is usually heavier than anything else on the page.
- **Only mapped elements.** An element you haven't mapped — `<dl>`, `<kbd>`, `<sup>` — falls through to the browser. List what the source can emit and map each, or strip it at render.

The principle: **imported prose is a guest in the type system, not a second one.** Add a role for it only where the document needs something the pages genuinely don't — and then it's a project role with a row in `DESIGN.md` like any other.
