import test from "node:test";
import assert from "node:assert/strict";
import {getPassportMilestones} from "../lib/passport-milestones.js";
const d=(day,month,year)=>({day,month,year});
test("returns 14, 20, and 45 year dates with past, today, future statuses",()=>{assert.deepEqual(getPassportMilestones(d(1,2,1990),d(1,2,2025)),[{age:14,date:d(1,2,2004),status:"past"},{age:20,date:d(1,2,2010),status:"past"},{age:45,date:d(1,2,2035),status:"future"}])});
test("milestone on reference date is today",()=>{assert.equal(getPassportMilestones(d(1,2,2011),d(1,2,2025))[0].status,"today")});
test("Feb 29 milestone uses Feb 28 in non-leap target years",()=>{assert.deepEqual(getPassportMilestones(d(29,2,2000),d(28,2,2014))[0],{age:14,date:d(28,2,2014),status:"today"})});
