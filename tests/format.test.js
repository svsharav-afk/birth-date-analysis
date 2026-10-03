import test from "node:test";
import assert from "node:assert/strict";
import {formatAgeDetail,formatAgeYears,formatDate,formatMilestoneStatus,russianPlural} from "../lib/format.js";
test("formats date with leading zeros",()=>{assert.equal(formatDate({day:1,month:2,year:1990}),"01.02.1990")});
test("Russian year plural forms",()=>{assert.equal(formatAgeYears(1),"1 год");assert.equal(formatAgeYears(2),"2 года");assert.equal(formatAgeYears(5),"5 лет");assert.equal(formatAgeYears(21),"21 год");assert.equal(formatAgeYears(12),"12 лет")});
test("month and day plural forms",()=>{assert.equal(formatAgeDetail({years:1,months:2,days:5}),"1 год, 2 месяца, 5 дней");assert.equal(russianPlural(4,"месяц","месяца","месяцев"),"месяца")});
test("formats milestone states",()=>{assert.equal(formatMilestoneStatus("past"),"уже наступила");assert.equal(formatMilestoneStatus("today"),"сегодня");assert.equal(formatMilestoneStatus("future"),"предстоит")});
