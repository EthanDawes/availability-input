import { describe, expect, it } from "vitest"
import {
    constructUniformDatetimeRanges,
    getTodayWeek,
    intToTime,
    timeToInt,
} from "$lib/timeutils.js"
import { HOUR } from "$lib/units.js"
import {
    am7,
    mondayMs,
    pm10,
    pm730,
    someMonday,
    someSunday,
    someWeek,
} from "$lib/testing_common.js"

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
