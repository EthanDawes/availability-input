import { HOUR } from "$lib/units.js"

export const easternTzOffset = 240
export const someWeek = [
    new Date("5/5/25"),
    new Date("5/6/25"),
    new Date("5/7/25"),
    new Date("5/8/25"),
    new Date("5/9/25"),
    new Date("5/10/25"),
    new Date("5/11/25"),
]
export const someMonday = someWeek[0] // local time
export const someSunday = someWeek[6] // local time
export const mondayMs = someMonday.getTime()
export const am7 = 7 * HOUR
export const pm10 = (10 + 12) * HOUR
export const pm730 = (7.5 + 12) * HOUR
