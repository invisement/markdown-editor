import removeModifier from "../utils/removeModifier.ts";
import lineTransform from "./lineTransform.ts";
import PocketEditor from "../index.ts";

export default async function keybindings(
  self: PocketEditor,
  ev: KeyboardEvent,
) {
  const editable = ev.target as HTMLElement;
  const ctrl = ev.ctrlKey || ev.metaKey;
  const isValid = ctrl && ev.shiftKey && ev.code.includes("Digit");
  const line = self.getLineFromEditable(editable);

  if (isValid && editable) {
    const index = parseInt(ev.code.replace("Digit", "")) - 1;
    const mods = Object.keys(self.mods);
    const targetMod = mods[index];
    const currentModIsTarget = line?.hasAttribute(`data-${targetMod}`);

    if (currentModIsTarget || index === 5) {
      ev.preventDefault();
      removeModifier(editable);
      return;
    }

    if (targetMod in self.mods && targetMod !== "todo-checked") {
      ev.preventDefault();
      lineTransform(self, editable, targetMod as keyof typeof self.mods);
    }
  }
}
