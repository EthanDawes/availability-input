import { describe, expect, it } from "vitest"
import {
    constructUniformDatetimeRanges,
    getTodayWeek,
    intToTime,
    timeToInt,
} from "$lib/timeutils.js"
import { blankAvailability } from "$lib/Availability.js"
import { TIME_STEP } from "$lib/units.js"

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
const am7 = timeToInt("7:00 am")
const pm10 = timeToInt("10:00 pm")

describe("time to int", () => {
    it("7:00 am", () => {
        expect(timeToInt("7:00 am")).toBe(2.52e7)
    })

    it("7:30 pm", () => {
        expect(timeToInt("7:30 pm")).toBe(7.02e7)
    })

    it("19:30", () => {
        expect(timeToInt("19:30")).toBe(7.02e7)
    })
})

describe("int to time", () => {
    it("7:00 am", () => {
        expect(intToTime(2.52e7)).toBe("7:00 AM")
    })

    it("7:30 pm", () => {
        expect(intToTime(7.02e7)).toBe("7:30 PM")
    })

    it("19:30", () => {
        expect(intToTime(7.02e7, true)).toBe("19:30")
    })
})

describe("get week dates", () => {
    it("Monday", () => {
        expect(getTodayWeek(someMonday)).toEqual(someWeek)
    })

    it.todo("Sunday", () => {
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
