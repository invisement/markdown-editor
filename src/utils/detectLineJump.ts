import PocketEditor from "../index.ts";

type LineJumpReturn = {
  line: HTMLElement;
  dir: "down" | "up";
};

export default function detectLineJump(
  self: PocketEditor,
  ev: KeyboardEvent,
): LineJumpReturn | undefined {
  // Do nothing if not arrow or selection
  if (!ev.key.includes("Arrow") || !window.getSelection()?.anchorNode) {
    return;
  }

  const editable = ev.target as HTMLElement;
  const line = self.getLineFromEditable(editable);
  const range = window?.getSelection()?.getRangeAt(0);
  const txtLen = range?.startContainer?.nodeValue?.length ?? 0;

  if (!range || !line) return;

  const prevSibling = self.getPrevLine(line);
  const nextSibling = self.getNextLine(line);
  const isCaretAtZero = Math.min(range?.endOffset, range?.startOffset) === 0;
  const isCaretAtEnd =
    Math.max(range?.endOffset, range?.startOffset) === txtLen;

  if (ev.key === "ArrowLeft" && isCaretAtZero && prevSibling) {
    return { line, dir: "up" };
  }
  if (ev.key === "ArrowRight" && isCaretAtEnd && nextSibling) {
    return { line, dir: "down" };
  }

  let top = false;
  let bottom = false;
  const rr = range?.getBoundingClientRect();
  const lr = line?.getBoundingClientRect();
  const noRanges = !lr || !rr || rr.y === 0;

  // just accept when undefined (it seems to be undefined just after a jump)
  if (noRanges) {
    top = true;
    bottom = true;
  } // "range will go above current line after this key press"
  else {
    top = lr.top - rr.top + rr.height > 0;
    bottom = rr.bottom + rr.height - lr.bottom > 0;
  }

  if (ev.key === "ArrowUp" && prevSibling && top) return { line, dir: "up" };
  if (ev.key === "ArrowDown" && nextSibling && bottom) {
    return { line, dir: "down" };
  }
}
