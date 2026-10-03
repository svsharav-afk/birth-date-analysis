export function isLeapYear(y){return y%4===0&&(y%100!==0||y%400===0)}
export function daysInMonth(y,m){if(!Number.isInteger(y)||!Number.isInteger(m)||m<1||m>12)return 0;if(m===2)return isLeapYear(y)?29:28;return [4,6,9,11].includes(m)?30:31}
export function isValidDate(d){return Boolean(d&&Number.isInteger(d.year)&&d.year>=1&&d.year<=9999&&Number.isInteger(d.month)&&d.month>=1&&d.month<=12&&Number.isInteger(d.day)&&d.day>=1&&d.day<=daysInMonth(d.year,d.month))}
export function compareDates(a,b){return Math.sign(a.year-b.year||a.month-b.month||a.day-b.day)}
export function toOrdinal(d){if(!isValidDate(d))throw new RangeError("Invalid calendar date");const y=d.year-1,b=365*y+Math.floor(y/4)-Math.floor(y/100)+Math.floor(y/400),o=[0,31,isLeapYear(d.year)?60:59,90,120,151,181,212,243,273,304,334];return b+o[d.month-1]+d.day}
export function daysBetween(a,b){return toOrdinal(b)-toOrdinal(a)}
export function addDays(date,count){if(!isValidDate(date)||!Number.isInteger(count))throw new RangeError("Invalid date or day count");let year=date.year,month=date.month,day=date.day;const direction=Math.sign(count);for(let i=0;i<Math.abs(count);i++){day+=direction;if(day>daysInMonth(year,month)){day=1;month++;if(month>12){month=1;year++}}else if(day<1){month--;if(month<1){month=12;year--}day=daysInMonth(year,month)}}const result={year,month,day};if(!isValidDate(result))throw new RangeError("Date outside supported range");return result}
// February 29 anniversaries are February 28 in non-leap years.
export function addYearsClamped(d,n){const year=d.year+n;return {year,month:d.month,day:Math.min(d.day,daysInMonth(year,d.month))}}
export function addMonthsClamped(d,n){const i=d.year*12+d.month-1+n,y=Math.floor(i/12),m=((i%12)+12)%12+1;return {year:y,month:m,day:Math.min(d.day,daysInMonth(y,m))}}
export function localToday(now=new Date()){return {year:now.getFullYear(),month:now.getMonth()+1,day:now.getDate()}}
