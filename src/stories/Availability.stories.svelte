<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf"
    import Availability from "$lib/Availability.svelte"
    import { fn } from "@storybook/test"
    import { blankAvailability } from "$lib/Availability.js"

    // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
    const { Story } = defineMeta({
        title: "Availability",
        component: Availability,
        tags: ["autodocs"],
        argTypes: {},
        args: {
            onDataChange: fn,
            onHoverChange: fn,
        },
    })
</script>

<script>
    import { constructUniformDatetimeRanges, getTodayWeek, timeToInt } from "$lib/timeutils.js"
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story
    name="Primary"
    args={{
        availabilities: blankAvailability(
            constructUniformDatetimeRanges(getTodayWeek(), [
                timeToInt("7:00 am"),
                timeToInt("10:00 pm"),
            ]),
        ),
    }}
/>
