import { generateLine, transformLine } from "./lib/generateLine"
import { toHTML, toMarkdown } from "./lib/contentConversion"
import clipboardControl from "./lib/clipboardControl"
import lineSelection from "./lib/lineSelection"
import lineDeletion from "./lib/lineDeletion"
import caretControl from "./lib/caretControl"

import removeModifier from "./utils/removeModifier"

export default function tinyNotes(initWrapper: string) {
	const container = document.createElement("div")
	const transform = transformLine()

	function classicParagraphInsert(target: HTMLElement, range: Range) {
		const text = range.startContainer?.nodeValue || ""
		const lineClasses = target.parentElement?.classList

		function appendLine(line: HTMLElement) {
			const nextLine = target.parentElement?.nextElementSibling

			// append line where it is supposed to be, then focus
			nextLine ? container.insertBefore(line, nextLine) : container?.appendChild(line)
			line.querySelector<HTMLElement>(".editable")?.focus()
		}

		// Remove mod if line is empty with modif
		if (range.startOffset === 0 && lineClasses?.contains("modif-line")) {
			removeModifier(target)
			return
		}

		// create new line if or if br (for now)
		if (range.startContainer.nodeType !== 3) {
			appendLine(generateLine())
			return
		}

		// Does it need transformation ?
		let modif
		if (lineClasses?.contains("todo-list")) modif = "todo"
		if (lineClasses?.contains("unordered-list")) modif = "unordered"

		// put text between caret and EOL on new line
		const nextLineText = text.slice(range?.startOffset) || ""

		// Remove newlined text to previous line
		if (range.startContainer.textContent) {
			range.startContainer.textContent = text.slice(0, range.startOffset)
		}

		// append line
		appendLine(generateLine({ text: nextLineText, modif }))
	}

	function lineKeyboardEvent(e: InputEvent) {
		const range = window.getSelection()?.getRangeAt(0)
		const target = e.target as HTMLElement

		if (!range || !target || !container) return

		if (e.inputType === "insertParagraph") {
			e.preventDefault()
			classicParagraphInsert(target, range)
		}

		const { startOffset } = range
		const targetText = target.textContent || ""
		const textWithInput = targetText.slice(0, startOffset) + e.data + targetText.slice(startOffset)

		// Big Heading
		if (targetText.startsWith("#")) {
			if (e.inputType === "insertText" && textWithInput.startsWith("# ")) {
				transform.toHeading(target, "h1")
				e.preventDefault()
			}
		}

		// Medium Heading
		if (targetText.startsWith("##")) {
			if (e.inputType === "insertText" && textWithInput.startsWith("## ")) {
				transform.toHeading(target, "h2")
				e.preventDefault()
			}
		}

		// Small Heading
		if (targetText.startsWith("###")) {
			if (e.inputType === "insertText" && textWithInput.startsWith("### ")) {
				transform.toHeading(target, "h3")
				e.preventDefault()
			}
		}

		// Prevent modif on already modified line
		if (target?.parentElement?.classList.contains("modif-line")) {
			return
		}

		// Unordered List
		if (targetText.startsWith("-")) {
			if (e.inputType === "insertText" && textWithInput.startsWith("- ")) {
				transform.toUnorderedList(target)
				e.preventDefault()
			}
		}

		// Checkbox List
		if (targetText.startsWith("[ ]")) {
			if (e.inputType === "insertText" && textWithInput.startsWith("[ ] ")) {
				transform.toTodolist(target)
				e.preventDefault()
			}
		}

		if (targetText.startsWith("[x]")) {
			if (e.inputType === "insertText" && textWithInput.startsWith("[x] ")) {
				transform.toTodolist(target)
				e.preventDefault()
			}
		}
	}

	function set(string: string) {
		// Delete all content before & append generated HTML
		Object.values(container.children).forEach((node) => node.remove())
		container.appendChild(toHTML(string))
	}

	function get() {
		const lines = Object.values(container.querySelectorAll(".notes-line"))
		if (lines) return toMarkdown(lines)

		console.log("Failed to get lines")
		return ""
	}

	container.id = "tiny-notes"

	lineSelection(container) // Add line selection feature
	caretControl(container) // Add keyboard line jump control
	clipboardControl(container) // cpoy and paste control

	container.addEventListener("beforeinput", lineKeyboardEvent)
	container.addEventListener("beforeinput", lineDeletion)

	container.appendChild(generateLine({ text: "" }))
	document.getElementById(initWrapper)?.appendChild(container)

	return { set, get }
}