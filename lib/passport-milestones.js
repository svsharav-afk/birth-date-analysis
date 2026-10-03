import {addYearsClamped,compareDates,isValidDate} from "./date.js";
export function getPassportMilestones(birth,ref){if(!isValidDate(birth)||!isValidDate(ref))throw new RangeError("Invalid calendar date");return [14,20,45].map(age=>{const date=addYearsClamped(birth,age),c=compareDates(date,ref);return {age,date,status:c<0?"past":c===0?"today":"future"}})}
