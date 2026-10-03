import { addDays, addYearsClamped, compareDates, isLeapYear, isValidDate } from "./date.js";
import { calculateAge } from "./age.js";

const MILESTONE_AGES = [14, 20, 45];

export function getPassportRules(birthDate, referenceDate) {
  if (!isValidDate(birthDate) || !isValidDate(referenceDate)) throw new RangeError("Invalid calendar date");
  const age = calculateAge(birthDate, referenceDate);
  const hasLeapDayBirth = birthDate.month === 2 && birthDate.day === 29;
  const events = MILESTONE_AGES.map((ageAtEvent) => {
    const date = addYearsClamped(birthDate, ageAtEvent);
    const comparison = compareDates(date, referenceDate);
    return {
      age: ageAtEvent,
      kind: ageAtEvent === 14 ? "first-issue" : "replacement",
      date,
      boundaryDate: addDays(date, 90),
      boundaryType: ageAtEvent === 14 ? "document-submission-period" : "previous-passport-validity-cap",
      status: comparison < 0 ? "past" : comparison === 0 ? "today" : "future",
      usesFeb28ProductConvention: hasLeapDayBirth && !isLeapYear(date.year)
    };
  });

  const years = age.years;
  return {
    events,
    lastCompletedEvent: years >= 45 ? 45 : years >= 20 ? 20 : years >= 14 ? 14 : null,
    nextEvent: years < 14 ? 14 : years < 20 ? 20 : years < 45 ? 45 : null,
    after45AgeTermIsIndefinite: years >= 45,
    leapDayDatesUseProductConvention: hasLeapDayBirth
  };
}
