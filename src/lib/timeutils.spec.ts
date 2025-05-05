import { describe, expect, it } from "vitest"
import { getTodayWeek, intToTime, timeToInt } from "$lib/timeutils.js"

const easternTzOffset = 240

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

    it("Monday", () => {
        expect(getTodayWeek(someMonday)).toEqual(someWeek)
    })

    it("Sunday", () => {
        expect(getTodayWeek(someSunday)).toEqual(someWeek)
    })
})
