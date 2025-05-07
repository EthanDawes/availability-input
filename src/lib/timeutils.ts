import { HOUR, MINUTE } from "./units.js"
import type { DateCompatible } from "$lib/availability.js"

/** Milliseconds since epoch representing start and stop datetimes. In global UTC time */
// Using ms instead of minutes b/c even though I don't need ms precision, it is more standard, won't cause issues, and will be easier if consistent
export type DatetimeRange = [number, number]

/** convert "2:50 AM" or "15:43" to milliseconds since midnight */
export function timeToInt(timeString: string) {
    const [hours, minutes, ampm] = timeString.split(/[: ]/)

    // Calculate the total minutes since midnight
    return (
        (Number(hours) + Number(ampm?.toLowerCase() === "pm") * 12) * HOUR +
        Number(minutes) * MINUTE
    )
}

/** Converts milliseconds since midnight to "2:50 AM" or "15:43" */
export function intToTime(midnightOffset: number, military = false) {
    let hours = Math.floor(midnightOffset / HOUR)
    const minutes = (midnightOffset % HOUR) / MINUTE
    const isPM = hours >= 12
    hours = military ? hours : isPM ? (hours > 12 ? hours % 12 : hours) : hours
    if (hours === 0 && !military) hours = 12
    return `${hours}:${String(minutes).padStart(2, "0")}` + (military ? "" : isPM ? " PM" : " AM")
}

/** Add the specified number of minutes to `date` copy & return it
 * @param date if number, will assume milliseconds
 * @param offsetMin minutes to add
 */
export function offsetDate(date: Date | string | number, offsetMin: number) {
    const dateObj = new Date(date)
    return new Date(dateObj.getTime() - offsetMin * MINUTE)
}

/**
 * @return A timezone offset in minutes given a timezone name
 * @see https://stackoverflow.com/a/68593283
 */
export function getTzOffset(timeZone = "UTC", date = new Date()) {
    const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }))
    const tzDate = new Date(date.toLocaleString("en-US", { timeZone }))
    return tzDate.getTime() - utcDate.getTime()
}

export const currentTzOffset = () => new Date().getTimezoneOffset()

export const getLocalTzName = () => Intl.DateTimeFormat().resolvedOptions().timeZone

export const getAllTzNames = () => Intl.supportedValuesOf("timeZone")

/**
 * Constructs DatetimeRanges for the same interval every day in the given timezone. Global UTC time
 * @param dates
 * @param times ms
 */
export function constructUniformDatetimeRanges(dates: Date[], times: [number, number]) {
    return dates.map(
        date => [date.getTime() + times[0], date.getTime() + times[1]] as DatetimeRange,
    )
}

/**
 * Get the week belonging to `current` starting from monday
 * @param [current=today] week to start. Is not mutated
 * @see Adapted from https://stackoverflow.com/a/43008875
 */
export function getTodayWeek(current?: Date) {
    current = current ? new Date(current) : new Date()
    current.setHours(0, 0, 0, 0)
    const week: Date[] = []
    // Starting Monday not Sunday
    current.setDate(current.getDate() - ((current.getDay() || 7) - 1))
    for (let i = 0; i < 7; i++) {
        week.push(new Date(current))
        current.setDate(current.getDate() + 1)
    }
    return week
}

export function UTCMidnight(date: DateCompatible) {
    return new Date(date).setUTCHours(0, 0, 0, 0)
}
