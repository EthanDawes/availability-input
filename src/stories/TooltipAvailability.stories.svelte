<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf"
    import TooltipAvailability from "./TooltipAvailability.svelte"
    import { fn } from "@storybook/test"
    import { multiFilledAvailability } from "./Availability.stories.svelte"

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
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story
    name="Default"
    args={{
        availabilities: multiFilledAvailability,
    }}
/>
