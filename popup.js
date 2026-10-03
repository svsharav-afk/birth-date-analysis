import { calculateAge } from "./lib/age.js";
import { localToday } from "./lib/date.js";
import { formatDateInput } from "./lib/input-date.js";
import { formatAgeDetail, formatAgeYears, formatDate, russianPlural } from "./lib/format.js";
import { getNextBirthday } from "./lib/next-birthday.js";
import { parseManualDate, parseSelectionText } from "./lib/parse-date.js";
import { getPassportRules } from "./lib/passport-rules.js";
import { getZodiacSign } from "./lib/zodiac.js";

const SESSION_KEY = "pendingAgeSelection";
const THEME_KEY = "ageCalculatorTheme";
const form = document.querySelector("#date-form");
const input = document.querySelector("#birth-date");
const errorNode = document.querySelector("#date-error");
const result = document.querySelector("#result");
const themeToggle = document.querySelector("#theme-toggle");
let autoFormatEnabled = false;

const errors = {
  "invalid-format": "Введите дату в формате ДД.ММ.ГГГГ.",
  "invalid-date": "Такой календарной даты не существует.",
  "future-date": "Дата рождения не может быть в будущем.",
  "no-date": "В выделенном тексте не найдена дата.",
  "multiple-dates": "В выделенном тексте несколько дат. Укажите нужную вручную."
};

function showError(code) {
  errorNode.textContent = errors[code] ?? "Не удалось распознать дату.";
  result.hidden = true;
}

input.addEventListener("input", (event) => {
  const formatted = formatDateInput(
    input.value,
    input.selectionStart ?? input.value.length,
    input.selectionEnd ?? input.value.length,
    { autoFormatEnabled, inputType: event.inputType, insertedText: event.data ?? "" }
  );
  if (formatted.value !== input.value) {
    input.value = formatted.value;
    input.setSelectionRange(formatted.selectionStart, formatted.selectionEnd);
  }
  autoFormatEnabled = formatted.autoFormatEnabled;
});

function renderPassport(birthDate, referenceDate, age) {
  const rules = getPassportRules(birthDate, referenceDate);
  const byAge = new Map(rules.events.map((event) => [event.age, event]));
  const rows = [];

  if (age.years < 14) {
    rows.push({ event: byAge.get(14), title: "Первое получение", detail: "90-й календарный день для подачи документов" });
  } else if (age.years < 20) {
    rows.push({ event: byAge.get(14), title: "Первое получение", muted: true });
    rows.push({ event: byAge.get(20), title: "Следующая замена · 20 лет", detail: "Предел срока действия прежнего паспорта" });
  } else if (age.years < 45) {
    rows.push({ event: byAge.get(20), title: "Замена в 20 лет", detail: "Предел срока действия прежнего паспорта" });
    rows.push({ event: byAge.get(45), title: "Следующая замена · 45 лет", detail: "Предел срока действия прежнего паспорта" });
  } else {
    rows.push({ event: byAge.get(20), title: "Замена в 20 лет", muted: true });
    rows.push({ event: byAge.get(45), title: "Последняя возрастная замена · 45 лет", detail: "Предел срока действия прежнего паспорта" });
  }

  const list = document.querySelector("#passport-list");
  list.replaceChildren();
  let hasProxyDate = false;
  for (const row of rows) {
    const main = document.createElement("div");
    main.className = "event-main";
    const title = document.createElement("span");
    title.className = "event-title";
    title.textContent = row.title;
    const date = document.createElement("strong");
    date.textContent = age.years < 14 && row.event.age === 14
      ? formatDate(row.event.date)
      : row.event.age + " лет · " + formatDate(row.event.date);
    main.append(title, date);

    const item = document.createElement("li");
    if (row.muted) item.className = "historical";
    else item.className = "current";
    item.append(main);
    if (row.detail) {
      const detail = document.createElement("span");
      detail.className = "event-detail";
      detail.textContent = row.detail + " · " + formatDate(row.event.boundaryDate);
      main.append(detail);
    }
    if (row.event.usesFeb28ProductConvention) hasProxyDate = true;
    list.append(item);
  }
  document.querySelector("#leap-note").hidden = !hasProxyDate;
  if (rules.after45AgeTermIsIndefinite) {
    const note = document.createElement("p");
    note.className = "lifetime-note";
    note.textContent = "После замены в 45 лет возрастной срок паспорта бессрочный.";
    list.after(note);
  } else {
    document.querySelector(".lifetime-note")?.remove();
  }
}

function render(birthDate, referenceDate) {
  const age = calculateAge(birthDate, referenceDate);
  const birthday = getNextBirthday(birthDate, referenceDate);
  const zodiac = getZodiacSign(birthDate);
  document.querySelector("#normalized-date").textContent = formatDate(birthDate);
  document.querySelector("#age-years").textContent = formatAgeYears(age.years);
  document.querySelector("#age-detail").textContent = formatAgeDetail(age);
  document.querySelector("#zodiac").textContent = zodiac.name + " " + zodiac.symbol;
  document.querySelector("#birthday-value").textContent = birthday.isToday
    ? "Сегодня день рождения"
    : "Следующий день рождения: " + formatDate(birthday.date) + " · через " + birthday.daysUntil + " " + russianPlural(birthday.daysUntil, "день", "дня", "дней");
  renderPassport(birthDate, referenceDate, age);
  errorNode.textContent = "";
  result.hidden = false;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const referenceDate = localToday();
  const parsed = parseManualDate(input.value, referenceDate);
  if (!parsed.ok) return showError(parsed.error);
  input.value = formatDate(parsed.date);
  autoFormatEnabled = false;
  render(parsed.date, referenceDate);
});

async function consumeSelection() {
  try {
    const stored = await chrome.storage.session.get(SESSION_KEY);
    if (!Object.hasOwn(stored, SESSION_KEY)) return;
    const raw = stored[SESSION_KEY];
    await chrome.storage.session.remove(SESSION_KEY);
    const referenceDate = localToday();
    const parsed = parseSelectionText(String(raw), referenceDate);
    if (!parsed.ok) return showError(parsed.error);
    input.value = formatDate(parsed.date);
    autoFormatEnabled = false;
    render(parsed.date, referenceDate);
  } catch (error) {
    console.error("Could not read the selected date:", error);
    showError("invalid-format");
  }
}

async function applyTheme() {
  let theme = "dark";
  try {
    const saved = await chrome.storage.local.get(THEME_KEY);
    if (saved[THEME_KEY] === "light") theme = "light";
  } catch (error) {
    console.error("Could not load the theme preference:", error);
  }
  document.documentElement.dataset.theme = theme;
  updateThemeToggle(theme);
}

function updateThemeToggle(theme) {
  const nextTheme = theme === "dark" ? "light" : "dark";
  themeToggle.textContent = (nextTheme === "light" ? "☼ " : "☾ ") + (nextTheme === "light" ? "Светлая" : "Тёмная");
  themeToggle.setAttribute("aria-label", "Включить " + nextTheme + " тему");
  themeToggle.setAttribute("aria-pressed", String(theme === "light"));
}

themeToggle.addEventListener("click", async () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = nextTheme;
  updateThemeToggle(nextTheme);
  try {
    await chrome.storage.local.set({ [THEME_KEY]: nextTheme });
  } catch (error) {
    console.error("Could not save the theme preference:", error);
  }
});

applyTheme();
consumeSelection();
