# Actions and forms

## Destructive items in a menu

Every destroying or session-ending item takes the same place and treatment: last, after a divider, no icon, the danger treatment from `color-and-theming`.

```tsx
<Menu>
  <MenuItem onSelect={rename}>Rename</MenuItem>
  <MenuItem onSelect={duplicate}>Duplicate</MenuItem>
  <MenuItem onSelect={openMoveTo}>Move to…</MenuItem>
  <MenuSeparator />
  <MenuItem tone="danger" onSelect={() => openConfirm(row, triggerRef)}>Delete</MenuItem>
</Menu>
```

The same holds in the profile menu (Sign out last, alone), in settings (a "Delete workspace" section last on the page, its button in the same danger treatment), and in a bulk-action bar (Delete at the end, set apart).

| Item | Destructive or session-ending? |
|---|---|
| Delete, Remove from project, Clear history, Revoke access, Leave workspace, Sign out | Yes — one treatment |
| Archive (restorable), Mark as done, Hide | No — ordinary items, ideally with Undo |
| Cancel (an unsaved form) | No — a ghost button, not danger |

## Proof in proportion to the loss

| Loss | Ask for | Example |
|---|---|---|
| Reversible | Nothing; Undo in a toast for 5–8s | Archive a task, move a card, remove a tag |
| One item, irreversible | A dialog; the button repeats the verb | Delete a note |
| Many items, or someone else's work | A dialog that counts what goes ("48 tasks, 12 notes") | Delete a folder |
| An account, a project, a workspace | Type a word to confirm | Delete project, delete account |

Escalate on what is lost, not on how serious the screen looks: a bulk delete of 200 rows deserves more than a delete of one project with nothing in it.

## The type-to-confirm dialog

One component, used for every large delete. It is the system's dialog with different contents, never a bespoke surface (`surfaces-and-depth` law 1).

```tsx
export function ConfirmDestroy({ open, onOpenChange, title, consequence, word = "DELETE",
                                 action, pendingLabel, onConfirm, returnFocusTo }) {
  const [typed, setTyped] = useState("");
  const [state, setState] = useState<"idle" | "pending" | "error">("idle");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const matches = typed.trim().toLowerCase() === word.toLowerCase();

  async function confirm(e: React.FormEvent) {
    e.preventDefault();
    if (!matches || state === "pending") return;
    setState("pending");
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (err) {
      setState("error");
      setError(messageFor(err)); // words, not a code
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => state !== "pending" && onOpenChange(next)}
      initialFocus={inputRef}
      finalFocus={returnFocusTo}  /* the row or menu item that opened it */
    >
      <form onSubmit={confirm}>
        <DialogTitle>{title}</DialogTitle>
        <p>{consequence}</p>
        <label htmlFor="confirm-word">Type {word} to confirm</label>
        <input id="confirm-word" ref={inputRef} value={typed} autoComplete="off"
               onChange={(e) => setTyped(e.target.value)}
               aria-describedby={state === "error" ? "confirm-error" : undefined} />
        {state === "error" && <p id="confirm-error" role="alert">{error}</p>}
        <DialogFooter>
          <Button variant="ghost" type="button" onClick={() => onOpenChange(false)}
                  disabled={state === "pending"}>Cancel</Button>
          <Button tone="danger" type="submit" disabled={!matches || state === "pending"}>
            {state === "pending" ? pendingLabel : action}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
```

- **The input takes focus, not Cancel.** The typed word is the guard; focusing it saves a click without weakening it.
- **Case-insensitive**, trimmed: the reader proves intent, not typing accuracy.
- **Held open while pending**: Escape and the scrim do nothing until it settles, so a failure has somewhere to be reported.
- **Focus returns to what opened it.** A dialog opened from a row's menu has no trigger of its own for the primitive to fall back to; pass the row or the menu's button explicitly, or focus lands on `<body>` and a keyboard user starts again from the top. If the row no longer exists, return focus to the list.

## Undo instead of confirm

For anything reversible, act at once and offer Undo:

```ts
async function archive(task: Task) {
  const before = store.snapshot(task.id);
  store.archive(task.id);
  toast("Task archived", { action: { label: "Undo", onClick: () => store.restore(before) } });
  try { await api.archive(task.id); }
  catch { store.restore(before); toast.error("Couldn't archive task", { action: retry(() => archive(task)) }); }
}
```

A confirm dialog in front of every reversible action trains the reader to click through dialogs, which is how the dangerous one gets clicked through too.

## Field anatomy

Label above, control, hint below; an error takes the hint's place rather than adding a line.

```tsx
<div className="field">
  <label htmlFor={id}>{label}</label>
  <Control id={id} aria-invalid={!!error || undefined}
           aria-describedby={error || hint ? `${id}-note` : undefined} />
  {(error || hint) && (
    <p id={`${id}-note`} className={error ? "field-error" : "field-hint"}>
      {error ?? hint}
    </p>
  )}
</div>
```

Reserve the note's line height when a field has a hint, so the swap never moves the field below. Validate on blur and on submit, not on every keystroke; clear a field's error as soon as its value changes.

**A form-level failure** — the server refused, the network dropped — is one line above the primary button, with an icon and `role="alert"`, saying what to do next. The fields keep what the reader typed.

## The deciding field first

Order a form by dependency, not by importance:

| Instead of | Do |
|---|---|
| Description, then Category | Category (full width), then the fields it shapes, then Description |
| Free text, then "Is this private?" | Private or shared first, if it changes who can be mentioned |
| Every field shown, half disabled | Fields appear once the deciding answer allows them, in place, without reflowing what's above |

The deciding field is full width because it is the one question every reader answers; the rest can sit in pairs.

## The sign-in screen

| Region | Holds |
|---|---|
| Form column, about 360px, unboxed | Title ("Sign in"), one muted line, fields, the one brand button, the secondary path as a link ("Create an account") |
| Art panel, from a wide breakpoint | An inset panel on the other half — generative or illustrative, scoped to one theme so it looks the same in either; moving only if the auth routes are an `expressive` area in `## Profile`, otherwise one still frame |
| Phone | The form alone; the art is decoration and goes first |

- **No card around the form.** The page is the surface; a card on an otherwise empty page is a box around nothing.
- **One primary button**, reading the verb: "Sign in", "Create account", "Send link".
- **Errors**: field errors replace hints; "Wrong email or password" is a form-level line, never a field error that tells an attacker which half was right.
- **Password managers** need `autocomplete="email"` / `"current-password"` / `"new-password"` and real `<form>` submission.
- The panel's build and theme scope are `surfaces-and-depth`'s art-panel recipe (`references/elevation-recipes.md`); its motion is `interface-motion`'s ambient class, with a still frame under reduced motion; inputs at 16px on phones, so the browser doesn't zoom, are `typographic-system`.
