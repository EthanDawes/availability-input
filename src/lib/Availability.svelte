<script lang="ts">
    import { currentTzOffset, intToTime, offsetDate, UTCMidnight } from "$lib/timeutils.js"
    import { DAY, HOUR, TIME_STEP } from "$lib/units.js"
    import AvailabilityComponent from "$lib/AvailabilityTooltip.svelte"
    import { Tooltip } from "flowbite-svelte"
    import type { AvailabilityBlockUsersMap } from "$lib/Availability.js"
    import { arrayRemoveItem } from "$lib/index.js"

    interface HoverData {
        /** Element that is being hovered */
        target: HTMLElement
        /** start global UTC datetime object of block */
        time: Date
        /** List of people available in that block */
        available: string[]
        /** List of people unavailable in that block */
        unavailable: string[]
    }

    interface Props {
        /** All inputable availability blocks along with who is available during that 15-minute block as ms since epoch. Should be in UTC time, not localized */
        // Despite thinking that "just using the ranges will be more efficient", just the ranges do not account for if a range spans overnight into two days
        // I removed the `localAvailability` convenience map because it was unnessisary
        availabilities: AvailabilityBlockUsersMap
        /** The name of the user to add to the availability representation
         * @default "me"
         */
        myUsername?: string
        /** UTC time - tzOffset (minutes) = Local time.
         * @default current timezone */
        tzOffset?: number
        /** Whether to allow input.
         * @default false */
        isDisabled?: boolean
        /** If true, only show days of week (monday, tues, etc). Useful for recurring weekly meetings. If false, also show day of month (eg 13th)
         * @default false */
        shouldUseWeekdays?: boolean
        /** Fired after the user has finished dragging. Provided with whole, current availability
         * @default no-op */
        onDataChange?: (_: AvailabilityBlockUsersMap) => void
        /** Fired when hovered cell changes (including once none are hovered)
         * @default no-op */
        onHoverChange?: (_: HoverData) => void
    }

    let {
        availabilities,
        myUsername = "me",
        tzOffset = currentTzOffset(),
        isDisabled = false,
        shouldUseWeekdays = false,
        onDataChange = () => {},
        onHoverChange = () => {},
    }: Props = $props()

    // Must know all possible days (x axis) and times (y axis) for formatting
    let allLocalMidnights = $derived(
        [
            ...new Set(
                availabilities.keys().map(block => UTCMidnight(offsetDate(block, tzOffset))),
            ),
        ].sort(),
    )

    /** Array of starting times in 15-minute intervals since midnight for all possible blocks. Changes with timezone */
    // Need this in addition to dateBlocks b/c must know whether to render a row (eg: monday ranges 7-10 but other days range 8-12)
    let allLocalDayTimes = $derived(
        [
            ...new Set(
                availabilities.keys().map(block => offsetDate(block, tzOffset).getTime() % DAY),
            ),
        ].sort(),
    )

    let allParticipants = $derived([...new Set(availabilities.values().flatMap(i => i))])

    // ============ SECTION: event handling ++++++++++++++++++++++++++

    type globalUTCTimestamp = number
    let dragStart: globalUTCTimestamp | undefined
    let dragNow: globalUTCTimestamp | undefined
    let dragState: boolean | undefined
    let preDragAvailabilities: AvailabilityBlockUsersMap | undefined

    function toggleAvailability(timestamp: globalUTCTimestamp) {
        if (dragState == undefined) {
            dragState = !availabilities.get(timestamp)!.length
        }

        dragNow = timestamp
        applyDragPreview()
    }

    // Had to implement 2 separate touch and mouse handlers (instead of using pointer handler) b/c `touch-none` prevents 2-finger panning but without it, page scrolls while selecting
    function convertTouchEvent(ev: TouchEvent): globalUTCTimestamp | undefined {
        if (ev.touches.length > 1) handlePointerUp()
        else {
            ev.preventDefault()
            const target = document.elementFromPoint(
                ev.touches[0].clientX,
                ev.touches[0].clientY,
            ) as HTMLElement | null
            if (!target || !target.classList.contains("availability-cell")) return undefined
            const utcDatetime = Number.parseInt(target.id)
            if (!dragStart && !isDisabled) dragStart = dragNow = utcDatetime
            return utcDatetime
        }
        return undefined
    }

    function handleMouseDown(timestamp: globalUTCTimestamp) {
        if (isDisabled) return
        preDragAvailabilities = structuredClone(availabilities)
        dragStart = dragNow = timestamp
        toggleAvailability(timestamp)
    }

    function handlePointerEnter(timestamp?: globalUTCTimestamp) {
        if (timestamp == undefined) return
        if (dragStart) {
            toggleAvailability(timestamp)
        } else {
            onHoverChange({
                time: new Date(timestamp),
                available: availabilities.get(timestamp)!,
                target: document.createElement("div"), // TODO
                unavailable: [], // TODO
            })
        }
    }

    function handlePointerUp() {
        if (dragStart) {
            onDataChange(availabilities)
            dragStart = dragNow = dragState = preDragAvailabilities = undefined
        }
    }

    /** Using dragStart, dragNow, and dragState, mark all cells within the dragged rectangle with their new respective value */
    function applyDragPreview() {
        if (!dragNow || !dragStart || !preDragAvailabilities) return
        availabilities = structuredClone(preDragAvailabilities)
        const corners = [dragStart, dragNow]
            .map(date => offsetDate(date, tzOffset).getTime())
            .sort()
        const dateRange = corners.map(UTCMidnight)
        const timeRange = [corners[0] % DAY, corners[1] % DAY]
        for (let day = dateRange[0]; day <= dateRange[1]; day += DAY) {
            for (let time = timeRange[0]; time <= timeRange[1]; time += TIME_STEP) {
                const globalDatetimeCursor = offsetDate(day + time, -tzOffset).getTime()
                const peopleAvailable = availabilities.get(globalDatetimeCursor)
                if (peopleAvailable !== undefined) {
                    if (dragState) {
                        if (!peopleAvailable.includes(myUsername)) {
                            peopleAvailable.push(myUsername)
                        }
                    } else {
                        arrayRemoveItem(peopleAvailable, myUsername)
                    }
                }
            }
        }
    }

    $inspect(availabilities)
</script>

<div class="flex flex-col items-stretch select-none">
    <!-- Column headers -->
    {#if allLocalMidnights.length > 0}
        <div class="sticky top-0 flex">
            <div class="w-20"></div>
            <!-- Empty space for row headers -->
            {#each allLocalMidnights as localDate}
                <div
                    class="flex-grow text-center"
                    role="columnheader"
                >
                    {new Intl.DateTimeFormat(undefined, {
                        weekday: "short",
                        timeZone: "UTC",
                    }).format(localDate)}
                    {#if !shouldUseWeekdays}
                        <br />
                        <span class="text-sm">
                            {new Intl.DateTimeFormat(undefined, {
                                month: "short",
                                day: "numeric",
                                timeZone: "UTC",
                            }).format(localDate)}
                        </span>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}
    <!-- Rows -->
    {#each allLocalDayTimes as block}
        <div class="flex items-center">
            <!-- Row header -->
            <div class="relative bottom-2 w-20 pr-1 text-right leading-4">
                {block % HOUR === 0 ? intToTime(block).replace(" ", "\xa0") : " "}
            </div>
            <!-- Cells -->
            {#each allLocalMidnights as localDate}
                {@const localDatetime = block + localDate}
                {@const utcDatetime = offsetDate(localDatetime, -tzOffset).getTime()}
                {@const peopleAvailable = availabilities.get(utcDatetime)}
                {#if peopleAvailable}
                    <div
                        class="availability-cell flex flex-grow"
                        id={String(utcDatetime)}
                        style:--lightness={allParticipants.length
                            ? (1 -
                                  (peopleAvailable?.length ?? allParticipants.length) /
                                      allParticipants.length) *
                                  70 +
                              30 +
                              "%"
                            : "30%"}
                        class:cursor-pointer={!isDisabled}
                        class:cursor-not-allowed={isDisabled}
                        class:available={peopleAvailable?.length}
                        onmousedown={() => handleMouseDown(utcDatetime)}
                        onmouseenter={() => handlePointerEnter(utcDatetime)}
                        ontouchmove={ev => handlePointerEnter(convertTouchEvent(ev))}
                        role="cell"
                        tabindex="0"
                    ></div>
                    {#if allParticipants.length && peopleAvailable.length}
                        <Tooltip class="pointer-events-none z-[1000] bg-white">
                            <AvailabilityComponent
                                everyone={allParticipants}
                                available={peopleAvailable}
                            />
                        </Tooltip>
                    {/if}
                {:else}
                    <div class="h-[16px] flex-grow"></div>
                {/if}
            {/each}
        </div>
    {/each}
</div>
<svelte:window on:pointerup={handlePointerUp} />

<style>
    [role="columnheader"] {
        position: sticky;
        top: 0;
        background-color: var(--color-bg-1);
    }

    [role="columnheader"],
    .availability-cell {
        min-width: 2em;
    }

    .availability-cell {
        border: 1px solid #ccc;
        height: 16px;
        text-align: center;
        background-color: #f8f8f8;
        display: flex;
    }

    .available {
        /* I like how https://www.schemecolor.com/light-dark-green-gradient.php looks, but don't know how to replicate in code */
        background-color: hsl(120, 73%, var(--lightness));
    }
</style>
