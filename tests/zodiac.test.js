import test from "node:test";
import assert from "node:assert/strict";
import { getZodiacSign } from "../lib/zodiac.js";

const d = (day, month) => ({ day, month, year: 2000 });
const ranges = [
  ["Козерог", [22, 12], [19, 1], [21, 12], [20, 1], "♑"],
  ["Водолей", [20, 1], [18, 2], [19, 1], [19, 2], "♒"],
  ["Рыбы", [19, 2], [20, 3], [18, 2], [21, 3], "♓"],
  ["Овен", [21, 3], [19, 4], [20, 3], [20, 4], "♈"],
  ["Телец", [20, 4], [20, 5], [19, 4], [21, 5], "♉"],
  ["Близнецы", [21, 5], [20, 6], [20, 5], [21, 6], "♊"],
  ["Рак", [21, 6], [22, 7], [20, 6], [23, 7], "♋"],
  ["Лев", [23, 7], [22, 8], [22, 7], [23, 8], "♌"],
  ["Дева", [23, 8], [22, 9], [22, 8], [23, 9], "♍"],
  ["Весы", [23, 9], [22, 10], [22, 9], [23, 10], "♎"],
  ["Скорпион", [23, 10], [21, 11], [22, 10], [22, 11], "♏"],
  ["Стрелец", [22, 11], [21, 12], [21, 11], [22, 12], "♐"]
];

test("all 12 zodiac ranges include their first and last dates and exclude adjacent dates", () => {
  for (const [name, first, last, before, after, symbol] of ranges) {
    assert.deepEqual(getZodiacSign(d(...first)), { name, symbol }, `${name} first day`);
    assert.deepEqual(getZodiacSign(d(...last)), { name, symbol }, `${name} last day`);
    assert.notEqual(getZodiacSign(d(...before)).name, name, `${name} previous day`);
    assert.notEqual(getZodiacSign(d(...after)).name, name, `${name} next day`);
  }
});

test("February 29 is classified as Pisces", () => {
  assert.equal(getZodiacSign(d(29, 2)).name, "Рыбы");
});

test("invalid dates are rejected", () => {
  assert.throws(() => getZodiacSign({ day: 31, month: 4, year: 2000 }), /invalid/i);
});
