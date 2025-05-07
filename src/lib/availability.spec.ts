import { describe, expect, it } from "vitest"
import { constructUniformDatetimeRanges } from "$lib/timeutils.js"
import { blankAvailability } from "$lib/availability.js"
import { HOUR, TIME_STEP } from "$lib/units.js"
import { am7, mondayMs, pm10, someMonday } from "$lib/testing_common.js"

describe("make blank availability", () => {
    it("Monday 7am-10pm", () => {
        const ranges = constructUniformDatetimeRanges([someMonday], [am7, pm10])
        const availability = blankAvailability(ranges)
        const availabilityKeys = Array.from(availability.keys())
        expect(availabilityKeys[1] - availabilityKeys[0]).toBe(TIME_STEP)
        expect(availabilityKeys[0]).toBe(mondayMs + am7)
        expect(availabilityKeys.at(-1)).toBe(mondayMs + pm10 - TIME_STEP)
    })

    it("overnight availability", () => {
        const availability = Array.from(
            blankAvailability([[mondayMs - HOUR, mondayMs + HOUR]]).keys(),
        ).map(
            date => new Date(date).toLocaleDateString() + " " + new Date(date).toLocaleTimeString(),
        )
        expect(availability).toEqual([
            "5/4/2025 11:00:00 PM",
            "5/4/2025 11:15:00 PM",
            "5/4/2025 11:30:00 PM",
            "5/4/2025 11:45:00 PM",
            "5/5/2025 12:00:00 AM",
            "5/5/2025 12:15:00 AM",
            "5/5/2025 12:30:00 AM",
            "5/5/2025 12:45:00 AM",
        ])
    })
})
