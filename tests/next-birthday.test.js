import test from "node:test";
import assert from "node:assert/strict";
import {getNextBirthday} from "../lib/next-birthday.js";
const d=(day,month,year)=>({day,month,year});
test("next birthday for ordinary date",()=>{assert.deepEqual(getNextBirthday(d(3,10,2000),d(4,10,2026)),{date:d(3,10,2027),daysUntil:364,isToday:false})});
test("birthday today has explicit state",()=>{assert.deepEqual(getNextBirthday(d(3,10,2000),d(3,10,2026)),{date:d(3,10,2026),daysUntil:0,isToday:true})});
test("next birthday crosses year boundary",()=>{assert.deepEqual(getNextBirthday(d(1,1,2000),d(31,12,2026)),{date:d(1,1,2027),daysUntil:1,isToday:false})});
test("Feb 29 uses leap day in leap year",()=>{assert.deepEqual(getNextBirthday(d(29,2,2000),d(1,3,2023)),{date:d(29,2,2024),daysUntil:365,isToday:false})});
test("Feb 29 anniversary is Feb 28 in non-leap year",()=>{assert.deepEqual(getNextBirthday(d(29,2,2000),d(1,3,2025)),{date:d(28,2,2026),daysUntil:364,isToday:false});assert.equal(getNextBirthday(d(29,2,2000),d(28,2,2025)).isToday,true)});
