import test from "node:test";
import assert from "node:assert/strict";
import { formatDateInput } from "../lib/input-date.js";

function typeText(text) {
  let state = { value: "", selectionStart: 0, selectionEnd: 0, autoFormatEnabled: false };
  for (const character of text) {
    const raw = state.value.slice(0, state.selectionStart) + character + state.value.slice(state.selectionEnd);
    const caret = state.selectionStart + character.length;
    state = formatDateInput(raw, caret, caret, {
      autoFormatEnabled: state.autoFormatEnabled,
      inputType: "insertText",
      insertedText: character
    });
  }
  return state;
}

test("formats compact dates while the user types one digit at a time", () => {
  const states = [..."02081994"].map((_, index, chars) => typeText(chars.slice(0, index + 1).join("")).value);
  assert.deepEqual(states, ["0", "02", "02.0", "02.08", "02.08.1", "02.08.19", "02.08.199", "02.08.1994"]);
});

test("formats compact paste and a replacement of the selected input", () => {
  assert.equal(formatDateInput("02081994").value, "02.08.1994");
  assert.equal(formatDateInput("31122000", 8, 8).value, "31.12.2000");
});

test("keeps already separated input formats unchanged", () => {
  assert.equal(formatDateInput("2.8.1994", 8, 8, { inputType: "insertFromPaste" }).value, "2.8.1994");
  assert.equal(formatDateInput("02/08/1994", 10, 10, { inputType: "insertFromPaste" }).value, "02/08/1994");
});

test("supports empty and incomplete values without coercing them into dates", () => {
  assert.equal(formatDateInput("").value, "");
  assert.equal(formatDateInput("02.08.19", 8, 8, { inputType: "insertFromPaste" }).value, "02.08.19");
});

test("does not discard unrelated characters typed while editing", () => {
  assert.equal(formatDateInput("02.08x", 6, 6, { autoFormatEnabled: true, inputType: "insertText", insertedText: "x" }).value, "02.08x");
});

test("deleting an automatic separator keeps digits and puts the caret before the separator", () => {
  const full = typeText("02081994");
  const raw = full.value.slice(0, 2) + full.value.slice(3);
  const edited = formatDateInput(raw, 2, 2, { autoFormatEnabled: true, inputType: "deleteContentBackward" });
  assert.equal(edited.value, "02.08.1994");
  assert.equal(edited.selectionStart, 2);
});

test("backspace removes a digit and Delete across a separator does not corrupt the value", () => {
  const full = typeText("02081994");
  const backspaceRaw = full.value.slice(0, -1);
  const backspaced = formatDateInput(backspaceRaw, backspaceRaw.length, backspaceRaw.length, {
    autoFormatEnabled: true,
    inputType: "deleteContentBackward"
  });
  assert.equal(backspaced.value, "02.08.199");

  const deleteRaw = full.value.slice(0, 2) + full.value.slice(3);
  const deleted = formatDateInput(deleteRaw, 2, 2, { autoFormatEnabled: true, inputType: "deleteContentForward" });
  assert.equal(deleted.value, "02.08.1994");
  assert.equal(deleted.selectionStart, 2);
});

test("editing in the middle preserves a digit-based caret position", () => {
  const full = typeText("02081994");
  const raw = full.value.slice(0, 5) + "7" + full.value.slice(5);
  const edited = formatDateInput(raw, 6, 6, { autoFormatEnabled: true, inputType: "insertText", insertedText: "7" });
  assert.equal(edited.value, "02.08.71994");
  assert.equal(edited.selectionStart, 7);
});

test("typing a separator switches to free-form formatted editing", () => {
  const output = formatDateInput("02.", 3, 3, { autoFormatEnabled: true, inputType: "insertText", insertedText: "." });
  assert.equal(output.value, "02.");
  assert.equal(output.autoFormatEnabled, false);
});
