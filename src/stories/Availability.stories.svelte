<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf"
    import Availability from "$lib/Availability.svelte"
    import { fn } from "@storybook/test"
    import { blankAvailability, fillRect } from "$lib/Availability.js"
    import { constructUniformDatetimeRanges, getTodayWeek, timeToInt } from "$lib/timeutils.js"
    import { HOUR } from "$lib/index.js"

    // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
    const { Story } = defineMeta({
        title: "Availability",
        component: Availability,
        tags: ["autodocs"],
        argTypes: {},
        args: {
            onDataChange: fn(),
            onHoverChange: fn(),
        },
    })

    const todayWeek = getTodayWeek()
    const today = new Date().setHours(0, 0, 0, 0)

    const normalBlankAvailability = blankAvailability(
        constructUniformDatetimeRanges(todayWeek, [7 * HOUR, timeToInt("10:00 pm")]),
    )

    // const overnightAvailability = blankAvailability(
    //     constructUniformDatetimeRanges(todayWeek, [timeToInt("10:00 pm"), 1 * HOUR]),
    // )
    export const overnightAvailability = blankAvailability([[today - HOUR, today + HOUR]])

    const normalFilledAvailability = structuredClone(normalBlankAvailability)
    fillRect(
        normalFilledAvailability,
        [todayWeek[0].getTime() + 7 * HOUR, todayWeek[1].getTime() + 10 * HOUR],
        true,
    )

    export const multiFilledAvailability = structuredClone(normalFilledAvailability)
    fillRect(
        multiFilledAvailability,
        [todayWeek[1].getTime() + 9 * HOUR, todayWeek[2].getTime() + 11 * HOUR],
        true,
        "you",
    )
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story
    name="Blank Fillable"
    args={{
        availabilities: normalBlankAvailability,
    }}
/>

<Story
    name="Populated Disabled"
    args={{
        availabilities: normalFilledAvailability,
        isDisabled: true,
        id: "disabled",
    }}
/>

<Story
    name="Multiple"
    args={{
        availabilities: multiFilledAvailability,
    }}
/>

<Story
    name="Overnight"
    args={{
        availabilities: overnightAvailability,
    }}
/>

<style>
    :global(#disabled .disabled) {
        cursor: not-allowed;
    }
</style>
