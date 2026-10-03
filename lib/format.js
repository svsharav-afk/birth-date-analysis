export function formatDate(d){return `${String(d.day).padStart(2,"0")}.${String(d.month).padStart(2,"0")}.${String(d.year).padStart(4,"0")}`}
export function russianPlural(v,one,few,many){const n=Math.abs(v)%100,last=n%10;if(n>10&&n<20)return many;if(last>1&&last<5)return few;if(last===1)return one;return many}
export function formatAgeYears(y){return `${y} ${russianPlural(y,"год","года","лет")}`}
export function formatAgeDetail({years,months,days}){return `${years} ${russianPlural(years,"год","года","лет")}, ${months} ${russianPlural(months,"месяц","месяца","месяцев")}, ${days} ${russianPlural(days,"день","дня","дней")}`}
export function formatMilestoneStatus(s){return ({past:"уже наступила",today:"сегодня",future:"предстоит"})[s]??s}
