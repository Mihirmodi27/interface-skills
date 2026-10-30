# Agents and live states

Two patterns for output the reader didn't write and can't fully predict: an agent taking actions, and text arriving as it's produced. Both fail the same way — they ask for trust instead of showing their work.

## The tool-call card

Every tool call is one card in the conversation, in the order it happened.

| Part | Holds |
|---|---|
| Header row | Status glyph · tool name in sentence case ("Search tasks", not `search_tasks`) · a one-line summary of the arguments ("Overdue, Riverside") · duration once done |
| Arguments | Key–value pairs with labels from the glossary; long values truncated with "Show all" |
| Result | A summary first ("12 tasks"), the raw result behind a disclosure |
| Approval | Only when the step needs one — inline, under the card |

**Open or closed.** A running step is open, so the reader can watch it; a finished one collapses to its header; a failed one stays open with the error in words and a Retry where retrying is safe. The reader's own open or closed choice wins over all three until the conversation reloads.

**Status shape, not just colour.** The glyph changes shape between running, done, failed and waiting for approval (shape carries state, colour confirms it: `color-and-theming`); a spinner inside the glyph is fine, a spinner instead of the card is not.

```tsx
<details open={state !== "done"} className="tool-call">
  <summary>
    <StatusGlyph state={state} />
    <span className="tool-name">{label(tool.name)}</span>
    <span className="tool-args">{summarise(tool.args)}</span>
    {state === "done" && <time>{formatDuration(ms)}</time>}
  </summary>
  <ArgsList args={tool.args} />
  <ToolResult result={result} />
</details>
```

A native `<details>` keeps the content in the page for find-in-page and copy (`layout-and-hierarchy` law 11).

## Inline approvals

A step that changes something outside the conversation — sends a message, edits records, spends money — waits for approval under its own card:

```
┌ ◌ Send email · to 3 members ─────────────────────┐
│ Subject   Site walk moved to Thursday             │
│ To        Sam, Priya, Jo                          │
└───────────────────────────────────────────────────┘
  [Send email]  [Don't send]
```

- **The approve button names the action** and takes the brand action colour; reject is a muted ghost button. Not "Approve" and "Reject": the reader should be able to read the button alone.
- **Never a modal.** The card above it, and the turns above that, are the evidence for the decision; a modal covers them.
- **Never focused by default**, and never on Enter from the composer: an approval is a decision, not a keystroke the reader was already making.
- **After the answer**, the buttons give way to a line saying what was decided ("Sent", "Not sent"), so the record stays readable.
- **Several pending steps** each keep their own buttons; an "Approve all" may sit above them only when every step is the same kind of action.

## Conversation layout

- **No avatar per message.** Two speakers don't need faces to be told apart.
- **The reader's turns** sit right-aligned, on a light tint, at most about two-thirds of the panel's width.
- **The agent's turns** run full width with no fill — they are the content, and they hold tables, cards and code that need the width.
- **AI-made content elsewhere** in the product — a summary on a record, a suggested title — carries one small mark in brand beside it, not a robot face or a coloured block (`color-and-theming`).
- **The panel is non-modal**: a side panel or sheet the reader can work beside, keyboard-reachable, closed by Escape when focus is inside it.
- **The composer**: Enter sends, Shift+Enter adds a line; the send button is disabled while empty and becomes Stop while the agent is working.

## Live text

A live transcript or a streaming answer has two kinds of text, and they must look different:

| Part | Treatment |
|---|---|
| Committed segments | Ink, final; never rewritten |
| The phrase still forming | Muted, with a brand caret at its end |
| Speaker or time markers | Meta tier, at each change, not on every line |

**Following the bottom.** Follow while the reader is at the bottom; stop the moment they scroll up; show "Jump to latest" until they return:

```ts
function useFollowBottom(el: HTMLElement | null, deps: unknown[]) {
  const atBottom = useRef(true);
  useEffect(() => {
    if (!el) return;
    const onScroll = () => {
      atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [el]);
  useLayoutEffect(() => {
    if (el && atBottom.current) el.scrollTop = el.scrollHeight;
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return atBottom;
}
```

**The top fade** says more is above, and costs nothing to layout:

```css
.live-scroll {
  mask-image: linear-gradient(to bottom, transparent 0, #000 32px);
}
```

**Announcing.** Put committed segments in a polite live region, one segment at a time; keep the forming phrase out of it, or a screen reader re-reads every word as it changes. A visually hidden region beside the visible text is often simpler than making the visible list live.

## Paused, stopped, failed

| State | Shows | Offers |
|---|---|---|
| Live | Moving level bars or the one "working" signal | Pause; on hover and focus the live control becomes Stop |
| Paused | Everything still; the forming phrase committed or dropped | View (the text so far), Copy, Resume |
| Stopped | The full text, final | Copy, and whatever the product does next with it |
| Failed | What was captured, kept | Retry, and the captured text never lost |

**Paused means still**: any motion that represented "live" stops or holds low (`interface-motion`); only a progress indicator for work genuinely under way keeps moving. A live state is not danger, so it doesn't take the destructive colour; a small live dot is enough (`color-and-theming`).
