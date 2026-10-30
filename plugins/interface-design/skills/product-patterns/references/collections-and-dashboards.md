# Collections and dashboards

## Which view first

| The items… | Primary view | Second view |
|---|---|---|
| Move through stages (to do → in progress → review → done) | Board: columns in the order work moves | List, grouped by status |
| Happen at a time (visits, meetings, deadlines) | Week board with Week, 3 days and Day spans | List, grouped by day |
| Are compared on many fields (members, invoices) | Table | — |
| Are browsed by place (folders, projects) | Grid or list of places | — |

**Board columns** run left to right in workflow order, each headed by its status glyph, name and count; the done column sits last and may collapse. A column that work skips is still shown, so the board reads the same every day.

**Both views share everything but the container**: data, filters, sort, row rendering and the row menu (`layout-and-hierarchy` law 8). A filter set on the board is still set on the list.

## Remembering the view

On a working page the reader returns to daily, the view and span are remembered **per page**, not globally — the reader set the tasks board deliberately and the meetings list deliberately — with the switch always visible in the page header (`layout-and-hierarchy` law 9 owns the rule; this is the code).

```ts
const key = (page: string) => `view:${page}`;

export function useRememberedView<T extends string>(page: string, fallback: T, opts?: { pinned?: boolean }) {
  const [view, setView] = useState<T>(() => {
    if (opts?.pinned) return fallback;            // the default is the point
    try { return (localStorage.getItem(key(page)) as T) ?? fallback; } catch { return fallback; }
  });
  const choose = (next: T) => {
    setView(next);
    if (!opts?.pinned) try { localStorage.setItem(key(page), next); } catch {}
  };
  return [view, choose] as const;
}
```

**Pinned pages** are those whose job is one view: folders open on folders, a calendar opens on this week. The reader can still switch for a visit; it just isn't remembered. List the remembered and pinned pages in `DESIGN.md` under `## Patterns`.

## Optimistic moves with rollback

```ts
let seq = 0;

async function moveCard(id: string, to: { column: string; index: number }) {
  const mine = ++seq;
  const before = board.positionOf(id);
  board.move(id, to);                                  // now
  try {
    await api.move(id, to);
  } catch (err) {
    if (mine !== seq && board.positionOf(id) !== to) return; // a later move owns this card
    board.move(id, before);                            // visibly put it back
    toast.error("Couldn't move task", { action: { label: "Retry", onClick: () => moveCard(id, to) } });
  }
}
```

- **Animate the rollback** with the same travel as the move (`interface-motion`), so the reader sees the card go back rather than finding it there later.
- **Keep sequence**: if two moves race, only the newest one's failure rolls back.
- **Don't disable the board while saving.** Saving is background work.
- **Never optimistic**: deletes without Undo, sends, payments, invitations — anything another person sees at once or the server decides.

## The keyboard map

| Key | Does | Where |
|---|---|---|
| ⌘K / Ctrl+K | Command palette: go to, create, run any action by name | Everywhere |
| J / K | Next / previous row or card | Lists and boards |
| Enter / O | Open the focused item | Lists and boards |
| F | Open filters | Lists and boards |
| C | Create in the current collection | Lists and boards |
| Enter | Send | Composer |
| Shift+Enter | New line | Composer |
| Escape | Close the innermost layer only | Everywhere |
| ? | Show the shortcut list | Everywhere |

```ts
const layers: Array<() => void> = []; // push on open, pop on close

window.addEventListener("keydown", (e) => {
  const t = e.target as HTMLElement;
  const typing = t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);
  if (e.key === "Escape" && layers.length) { e.preventDefault(); layers.pop()!(); return; }
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openPalette(); return; }
  if (typing || e.metaKey || e.ctrlKey || e.altKey) return; // single keys never fire while typing
  shortcuts[e.key]?.(e);
});
```

**Every drag has a keyboard path**: the row menu's "Move to…" opens a list of columns or dates; on a focused card, a shortcut can open it directly. **Shortcuts are shown where the action lives** — beside the menu item, in the tooltip, in the palette — from the one map in `DESIGN.md`, so the three never disagree.

## Launchers and toolbars

**A launcher asks the fewest questions the task has.** A record button that opens a form of six fields makes the most frequent action the slowest. Ask the one question that routes the result — which project, or a personal note — and default everything else, editable afterwards.

**Toolbar filters are icons with tooltips**, each with its active state shown on the icon and a count when it holds several values. Text on every filter crowds the bar and pushes the page's own actions off narrow screens. The active filters show as removable chips under the bar, where they also explain an empty result.

**Long admin lists** group into collapsible bars, closed by default:

```
▸ Admins        3 of 12 with access
▸ Members       9 of 12 with access
▸ Guests        0 of 4
```

Each bar's summary answers what the reader would open it to check. A search opens every group it matches and highlights the match; clearing the search restores what was open before.

## Dashboards

**The order**: overview (where things stand: a few figures), trends (which way they're moving: one or two charts over a sensible window), action items (what needs the reader: a short list, each item one click from done). Anything that answers none of the three goes — a recent-activity feed is the usual casualty.

**Wireframe first**, in boxes and words, and share it before building. Questions to settle on the wireframe:

- Which three to five figures, and what each one counts — its label names the noun.
- Which figures report a problem (and so take a status colour while they do) and which are plain counts.
- What the reader does next from each action item.
- What the page shows on a new account with no data — usually the action items section offering the first action.

**A long page is fine.** Hiding action items behind tabs to keep the page short moves the cost to the reader.

**A scoped overview reuses the global pipeline**:

```ts
// one pipeline, two scopes
const overview = (sources: Source[]) => buildOverview(sources);
const global = overview(allSources);
const project = overview(allSources.filter((s) => s.projectId === id));
```

Two queries for one view drift: a filter fixed in one, a status added to the other, and the project's overdue count stops matching the global one for the same project.

**Figures that filter.** On a list page, the figures under the header can each apply their filter to the table below. They are then controls: focusable, `aria-pressed` when active, no hover lift (`interface-motion`), laid out as one hairline-parted row (`layout-and-hierarchy` law 3).
