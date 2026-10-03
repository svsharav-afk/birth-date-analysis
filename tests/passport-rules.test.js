import test from "node:test";
import assert from "node:assert/strict";
import { getPassportRules } from "../lib/passport-rules.js";

const d = (day, month, year) => ({ day, month, year });

test("returns the 14, 20, and 45 year events with their 90-day calendar boundaries", () => {
  const rules = getPassportRules(d(2, 8, 1994), d(3, 8, 2026));
  assert.deepEqual(rules.events.map(({ age, date, boundaryDate, kind }) => ({ age, date, boundaryDate, kind })), [
    { age: 14, date: d(2, 8, 2008), boundaryDate: d(31, 10, 2008), kind: "first-issue" },
    { age: 20, date: d(2, 8, 2014), boundaryDate: d(31, 10, 2014), kind: "replacement" },
    { age: 45, date: d(2, 8, 2039), boundaryDate: d(31, 10, 2039), kind: "replacement" }
  ]);
});

test("adapts the highlighted passport stage for people below 14, aged 16, 30, and 50", () => {
  assert.deepEqual(((r) => [r.lastCompletedEvent, r.nextEvent])(getPassportRules(d(2, 8, 2014), d(1, 8, 2028))), [null, 14]);
  assert.deepEqual(((r) => [r.lastCompletedEvent, r.nextEvent])(getPassportRules(d(2, 8, 2010), d(3, 8, 2026))), [14, 20]);
  assert.deepEqual(((r) => [r.lastCompletedEvent, r.nextEvent])(getPassportRules(d(2, 8, 1996), d(3, 8, 2026))), [20, 45]);
  const older = getPassportRules(d(2, 8, 1976), d(3, 8, 2026));
  assert.deepEqual([older.lastCompletedEvent, older.nextEvent, older.after45AgeTermIsIndefinite], [45, null, true]);
});

test("counts the boundary from the day after the milestone and handles year and leap crossings", () => {
  assert.deepEqual(getPassportRules(d(30, 11, 1980), d(1, 1, 2026)).events[1].boundaryDate, d(28, 2, 2001));
  assert.deepEqual(getPassportRules(d(1, 12, 1979), d(1, 1, 2026)).events[1].boundaryDate, d(29, 2, 2000));
});

test("marks leap-day milestone dates that use the product convention", () => {
  const rules = getPassportRules(d(29, 2, 2000), d(1, 1, 2026));
  assert.equal(rules.leapDayDatesUseProductConvention, true);
  assert.deepEqual(rules.events.map((event) => event.usesFeb28ProductConvention), [true, false, true]);
  assert.deepEqual(rules.events[0].date, d(28, 2, 2014));
  assert.deepEqual(rules.events[0].boundaryDate, d(29, 5, 2014));
});

test("rejects impossible dates", () => {
  assert.throws(() => getPassportRules(d(31, 2, 2000), d(1, 1, 2026)), /invalid/i);
});
