import { describe, expect, it } from "vitest"
import {
    calcDayDiff,
    constructUniformDatetimeRanges,
    getTodayWeek,
    intToTime,
    timeToInt,
} from "$lib/timeutils.js"
import { blankAvailability } from "$lib/Availability.js"
import { HOUR, TIME_STEP } from "$lib/units.js"

const easternTzOffset = 240
const someWeek = [
    new Date("5/5/25"),
    new Date("5/6/25"),
    new Date("5/7/25"),
    new Date("5/8/25"),
    new Date("5/9/25"),
    new Date("5/10/25"),
    new Date("5/11/25"),
]
const someMonday = someWeek[0] // local time
const someSunday = someWeek[6] // local time
const mondayMs = someMonday.getTime()
const am7 = 7 * HOUR
const pm10 = (10 + 12) * HOUR
const pm730 = (7.5 + 12) * HOUR

describe("time to int", () => {
    it("7:00 am", () => {
        expect(timeToInt("7:00 am")).toBe(am7)
    })

    it("7:30 pm", () => {
        expect(timeToInt("7:30 pm")).toBe(pm730)
    })

    it("19:30", () => {
        expect(timeToInt("19:30")).toBe(pm730)
    })
})

describe("int to time", () => {
    it("7:00 am", () => {
        expect(intToTime(am7)).toBe("7:00 AM")
    })

    it("7:30 pm", () => {
        expect(intToTime(pm730)).toBe("7:30 PM")
    })

    it("19:30", () => {
        expect(intToTime(pm730, true)).toBe("19:30")
    })

    it("12:00 pm", () => {
        expect(intToTime(12 * HOUR)).toBe("12:00 PM")
    })
})

describe("get week dates", () => {
    it("Monday", () => {
        expect(getTodayWeek(someMonday)).toEqual(someWeek)
    })

    it("Sunday", () => {
        expect(getTodayWeek(someSunday)).toEqual(someWeek)
    })
})

describe("make ranges", () => {
    it("Monday 7am-10pm", () => {
        const ranges = constructUniformDatetimeRanges([someMonday], [am7, pm10])
        expect(ranges).toEqual([[mondayMs + am7, mondayMs + pm10]])
    })
})

describe("make blank availability", () => {
    it("Monday 7am-10pm", () => {
        const ranges = constructUniformDatetimeRanges([someMonday], [am7, pm10])
        const availability = blankAvailability(ranges)
        const availabilityKeys = Array.from(availability.keys())
        expect(availabilityKeys[1] - availabilityKeys[0]).toBe(TIME_STEP)
        expect(availabilityKeys[0]).toBe(mondayMs + am7)
        expect(availabilityKeys.at(-1)).toBe(mondayMs + pm10 - TIME_STEP)
    })
})

describe("calculate day difference", () => {
    it("11:59pm to 1am next day", () => {
        const date1 = new Date("2024-01-01T23:59:00")
        const date2 = new Date("2024-01-02T01:00:00")
        expect(calcDayDiff(date2, date1)).toBe(1)
    })
})
