<script lang="ts">
    import { Tooltip } from "flowbite-svelte"
    import TooltipContent from "./TooltipContent.svelte"
    import Availability from "$lib/Availability.svelte"
    import type { AvailabilityProps, HoverData } from "$lib/availability.js"

    let props: AvailabilityProps = $props()

    let hoverData: Partial<HoverData> = $state({})
</script>

<Availability
    {...props}
    isDisabled={true}
    onHoverChange={data => (hoverData = data)}
/>
<Tooltip
    class="pointer-events-none z-[1000]"
    triggeredBy=".available"
    color="default"
>
    <TooltipContent
        everyone={hoverData.everyone ?? []}
        available={hoverData.available ?? []}
    />
</Tooltip>
