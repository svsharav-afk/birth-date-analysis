const DATE_SEPARATORS = /[.\\/ -]/;

function countDigits(text) {
  return (text.match(/\d/g) ?? []).length;
}

function caretAtDigit(value, position) {
  const digits = countDigits(value.slice(0, position));
  return digits + Number(digits > 2) + Number(digits > 4);
}

function groupDigits(digits) {
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
}

// Formats typing/paste only; calendar parsing and validation stay in parse-date.js.
export function formatDateInput(value, selectionStart = value.length, selectionEnd = selectionStart, options = {}) {
  const { autoFormatEnabled = false, inputType = "", insertedText = "" } = options;
  if (value === "") return { value: "", selectionStart: 0, selectionEnd: 0, autoFormatEnabled: false };
  if (/[^\d.\\/ -]/.test(value)) return { value, selectionStart, selectionEnd, autoFormatEnabled: false };
  const hasSeparator = DATE_SEPARATORS.test(value);
  const manualSeparator = /[.\\/ -]/.test(insertedText) && inputType.startsWith("insert");
  const formattedPaste = inputType === "insertFromPaste" && hasSeparator;
  const shouldFormat = !manualSeparator && !formattedPaste && (!hasSeparator || autoFormatEnabled);
  if (!shouldFormat) return { value, selectionStart, selectionEnd, autoFormatEnabled: false };

  const digits = value.replace(/\D/g, "");
  return {
    value: groupDigits(digits),
    selectionStart: caretAtDigit(value, selectionStart),
    selectionEnd: caretAtDigit(value, selectionEnd),
    autoFormatEnabled: digits.length > 0
  };
}
