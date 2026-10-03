import { isValidDate } from "./date.js";

const SIGNS = [
  { name: "Козерог", symbol: "♑", start: 1222 },
  { name: "Водолей", symbol: "♒", start: 120 },
  { name: "Рыбы", symbol: "♓", start: 219 },
  { name: "Овен", symbol: "♈", start: 321 },
  { name: "Телец", symbol: "♉", start: 420 },
  { name: "Близнецы", symbol: "♊", start: 521 },
  { name: "Рак", symbol: "♋", start: 621 },
  { name: "Лев", symbol: "♌", start: 723 },
  { name: "Дева", symbol: "♍", start: 823 },
  { name: "Весы", symbol: "♎", start: 923 },
  { name: "Скорпион", symbol: "♏", start: 1023 },
  { name: "Стрелец", symbol: "♐", start: 1122 }
].sort((a, b) => a.start - b.start);

export function getZodiacSign(birthDate) {
  if (!isValidDate(birthDate)) throw new RangeError("Invalid birth date");
  const key = birthDate.month * 100 + birthDate.day;
  let sign = SIGNS.at(-1);
  for (const candidate of SIGNS) {
    if (candidate.start > key) break;
    sign = candidate;
  }
  return { name: sign.name, symbol: sign.symbol };
}
