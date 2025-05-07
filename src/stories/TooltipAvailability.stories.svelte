<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf"
    import TooltipAvailability from "./TooltipAvailability.svelte"
    import { fn } from "@storybook/test"
    import { multiFilledAvailability, overnightAvailability } from "./Availability.stories.svelte"
    import { combineAvailability } from "$lib/Availability.js"

    // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
    const { Story } = defineMeta({
        title: "Tooltip",
        component: TooltipAvailability,
        tags: ["autodocs"],
        argTypes: {},
        args: {
            onDataChange: fn(),
            onHoverChange: fn(),
        },
    })

    const combinedAvailability = combineAvailability([
        multiFilledAvailability,
        overnightAvailability,
    ])
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story
    name="Default"
    args={{
        availabilities: combinedAvailability,
    }}
/>
