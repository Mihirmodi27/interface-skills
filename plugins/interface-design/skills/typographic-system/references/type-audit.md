# Type audit and sweeps

The static audit in `SKILL.md` finds values in source. This file checks what renders, and sweeps a product after a type decision so no instance is left on the old value.

## Why source isn't enough

The same class renders differently through inheritance, a component's own default and a variant prop, and a merge utility can drop a class without a trace. A raw `text-sm` doesn't say which role it was meant to be, so grep can count it but not judge it. Partial updates — the list rows on the new weight, the board cards still on the old — are the commonest type bug, and only the rendered page shows them.

## The rendered inventory

Every route has to be reachable: where pages need a backend, run the real app on mock data. Then, per route, list every distinct text style and how often it appears:

```js
const seen = new Map();
for (const el of document.querySelectorAll("body *")) {
  const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
  if (!own || !el.getClientRects().length) continue;
  const s = getComputedStyle(el);
  const key = [s.fontSize, s.lineHeight, s.fontWeight, s.letterSpacing, s.textTransform].join(" · ");
  const hit = seen.get(key) ?? { count: 0, sample: el.textContent.trim().slice(0, 40) };
  hit.count++; seen.set(key, hit);
}
console.table([...seen].map(([style, v]) => ({ style, ...v })).sort((a, b) => b.count - a.count));
```

Read it against the `## Type` table:

- **A style with no row** is a stray or an unnamed role; say which.
- **A style used once or twice** is usually a component that missed the last change.
- **Two styles for one element across routes** — a header title at 13/500 here and 14/600 there — is law 2, by path.
- **A role row in two weights in one set** — some card titles lifted, some not — is a partial update.

## Icons beside text

```js
for (const svg of document.querySelectorAll("svg")) {
  const host = svg.parentElement; if (!host?.textContent.trim()) continue;
  const text = parseFloat(getComputedStyle(host).fontSize), icon = svg.getBoundingClientRect().height;
  if (icon / text > 1.15 || icon / text < 0.9) console.log(Math.round(icon), "px icon beside", text, "px text", host);
}
```

Then compare stroke widths across siblings in one strip: two buttons whose icons differ in size or stroke are a finding, fixed toward the better one.

## Inputs on touch

At a phone width, any `input`, `textarea` or `select` whose computed `font-size` is under 16px makes iOS Safari zoom on focus. Check one form per template.

## Migrating raw sizes to roles

Migrate by what the element is doing, not by its current value: two `text-sm` may be two roles — a nav row is `type.ui` and should have been 13, a description is `type.body`. Against the product ladder in `ladders.md`:

| Raw value | Usually |
|---|---|
| `text-xs`, 12px | `type.label` or `type.meta`, told apart by tier |
| `text-[13px]` | `type.ui`, or `type.data` with tabular figures |
| `text-sm`, 14px | `type.body`, `type.subheading`, or a `type.ui` that drifted up |
| `text-base`, 16px | `type.heading`, or an input on touch |

Every instance moved to a role token is one less to find next time; a sweep that leaves raw values behind has to be repeated by hand.

## The `tailwind-merge` trap

`tailwind-merge` resolves conflicts by class group, and `text-*` is shared by size and colour. A name it doesn't know as a size — `text-label` — it files as a colour, so `cn("text-label", "text-muted-foreground")` keeps only the last and the size vanishes, with no error and no warning. Weights have the same trap: `font-strong` is filed as a family and loses to `font-sans`. Register the role names:

```ts
import { extendTailwindMerge } from "tailwind-merge";

export const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["title", "heading", "body", "ui", "label", "meta", "code"] }],
      "font-weight": [{ font: ["regular", "strong"] }],
    },
  },
});
```

Use the project's names, and keep the list beside the theme tokens so a new role is registered in the same edit. To check, pass a role size and a text colour through `cn()` in one component and read the computed `font-size`.

## The sweep

After any change to a role — a size, a weight step, a tracking value:

1. **Change the token, not the instances.** If the change needs instance edits, those instances weren't on the role; migrate them first.
2. **Grep for the old value** in the role's raw forms (`font-semibold`, `text-[14px]`, `font-weight: 600`) and decide each hit.
3. **Run the rendered inventory on every route**, not the route the change was asked about.
4. **Check the generated strings** for case while you're there: field names, column headers, tool labels, dialog titles and toasts that arrive in Title Case from a schema or a config.
   `rg -n "(label|title|header|name):\s*['\"][A-Z][a-z]+ [A-Z][a-z]+" src`
5. **Report what moved**, by role and by page, and anything left on the old value with its reason, so the change can be checked rather than trusted.
