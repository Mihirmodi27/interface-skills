# UI copy

Copy in a product is interface, not prose: it is scanned in passing, compared across screens, and read again a thousand times. Each rule below makes a label faster to recognise the second time.

## Labels

| Instead of | Write | Why |
|---|---|---|
| Record a voice note | Record | The surrounding screen already says what is recorded |
| Request a feature | Help & feedback | The item also takes questions and bug reports; a label covers everything behind it |
| Submit | Send · Save changes · Create project | Say what happens, not that a form was posted |
| OK · Yes | Delete project · Sign out | The confirm button repeats the dialog's verb, so it reads correctly without the question |
| Click here to view details | View details · or make the row itself the link | "Click here" carries no information out of context |
| Are you sure you want to delete? | Delete "Riverside"? | Name the thing, drop the hedge |
| Manage Team Members | Members | Sentence case; the verb is implied by the page |
| NEW TASK | New task | Uppercase strips word shapes and reads as shouting |

**Verb first, object only when needed.** One primary action on a screen needs no object ("Save"). Two verbs that could be confused do ("Save draft", "Publish"). A destructive button always takes its object ("Delete project"), because the object is what's lost.

**Labels in menus are nouns or verbs, not both styles at once.** A menu of "Rename", "Duplicate", "Move to…", "Delete" is all verbs; "Settings", "Members", "Billing" is all places. An ellipsis means the item asks for more before acting.

**Tooltips on icon buttons say the same words a text button would**, plus the shortcut: "Filter  F".

## Sentence case, including generated labels

Every label, title, column header, tab, field name and toast is sentence case. Keep acronyms, proper nouns and third-party product names as written ("Export to CSV", "Connect GitHub").

Labels assembled from keys need a converter with an exception list, or the first acronym breaks it:

```ts
const KEEP = new Set(["ID", "URL", "API", "CSV", "PDF", "AI", "SSO"]);

export function labelFromKey(key: string): string {
  const words = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .split(/\s+/);
  return words
    .map((w, i) => {
      const upper = w.toUpperCase();
      if (KEEP.has(upper)) return upper;
      const lower = w.toLowerCase();
      return i === 0 ? lower[0].toUpperCase() + lower.slice(1) : lower;
    })
    .join(" ");
}
// dueDate → "Due date"; project_id → "Project ID"; AI_summary → "AI summary"
```

Prefer a hand-written label map for anything the reader sees often; the converter is the fallback for long-tail keys, tool names and imported fields.

## Row second lines

The formula is **`{type} from {origin}`**, in the product's nouns:

| Instead of | Write |
|---|---|
| Issue added to Riverside | Task from Riverside |
| Created by voice note on 3 Mar | Note from site walk |
| New item in Inbox | Request from Northgate |
| Riverside · Task · Open · 2h ago · Sam | Task from Riverside — with status as a glyph, time and owner in their own slots |

- **Type** is the kind of thing, from the product's glossary. If the list holds one type only, drop it: "From Riverside".
- **Origin** is where it came from or lives: a project, a meeting, a person, a source. Pick the one the reader sorts by.
- **No verbs of history** ("added", "created", "moved"). They describe one moment, and the moment is already in the time slot.
- **No status in the sentence.** Status has a glyph and a colour (`color-and-theming`); words would say it twice.

## The glossary

One noun per kind of thing, everywhere: navigation, page titles, row lines, toasts, empty states, buttons. Record it in `DESIGN.md`:

```markdown
## Patterns

**Nouns** — task (never "issue", "item" or "action"); note (a recording once processed); project; member (never "user" in UI).
**Row second line** — `{type} from {origin}`; origin is the project, or "Personal" for notes outside one.
```

A synonym in one corner of the product reads as a second kind of thing. When a new screen needs a word, look it up first.

## Messages

**Toasts** say what happened, then offer the one thing to do about it:

| Case | Write |
|---|---|
| Undo window | Task moved to Done · Undo |
| Failure, retryable | Couldn't move task — Retry |
| Failure, needs the reader | Couldn't save: the project was archived · View project |
| Result off screen | Note added to Riverside · Open |

Never "Successfully …" (the outcome is the message), never an exclamation mark, never an error code without words. A move the reader watched happen needs no toast.

**Errors** say what to do, not what went wrong inside: "Enter a date after the start date", not "Invalid date range". Field errors replace the field's hint (`references/actions-and-forms.md`).

**Empty states** — one line on what goes here, and the action that makes the first one:

| Case | Line | Action |
|---|---|---|
| New, nothing yet | Tasks from your notes and meetings land here. | New task |
| Filtered to nothing | No tasks match "Overdue" and "Assigned to me". | Clear filters |
| Search with no results | Nothing matches "riverbank". | Search all projects |

**Confirmations** — the title asks with the thing's name; the body says what is lost in plain words; the button repeats the verb:

> **Delete "Riverside"?**
> Its 48 tasks, 12 notes and every file attached to them will be deleted for everyone. This can't be undone.
> [Cancel] [Delete project]

## Numbers in copy

Counts beside a noun agree with it ("1 task", "3 tasks", "No tasks" — never "0 task(s)"). Use the platform's plural rules (`Intl.PluralRules`) once there is more than one language. A count that reports a problem takes its status colour; a plain count stays in ink (`color-and-theming`).
