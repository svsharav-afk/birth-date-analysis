import {compareDates,isValidDate} from "./date.js";
const SRC=String.raw`(\d{1,2})([.\\/ -])\s*(\d{1,2})\2\s*(\d{4})`;
export function parseDateCandidate(text){const m=new RegExp(`^\\s*${SRC}\\s*$`).exec(text);if(!m)return {ok:false,error:"invalid-format"};const date={day:+m[1],month:+m[3],year:+m[4]};if(!isValidDate(date))return {ok:false,error:"invalid-date"};return {ok:true,date}}
export function parseManualDate(text,ref){const p=parseDateCandidate(text);if(!p.ok)return p;if(ref&&compareDates(p.date,ref)>0)return {ok:false,error:"future-date"};return p}
export function findSelectionCandidates(text){return Array.from(text.matchAll(new RegExp(SRC,"g")),m=>{const date={day:+m[1],month:+m[3],year:+m[4]};return {raw:m[0],date,valid:isValidDate(date)}})}
export function parseSelectionText(text,ref){const all=findSelectionCandidates(text),valid=all.filter(x=>x.valid);if(!valid.length)return {ok:false,error:all.length?"invalid-date":"no-date"};if(valid.length>1)return {ok:false,error:"multiple-dates",candidates:valid.map(x=>x.date)};if(ref&&compareDates(valid[0].date,ref)>0)return {ok:false,error:"future-date"};return {ok:true,date:valid[0].date}}
