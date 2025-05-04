<script lang="ts">
    import { type DateStr, type DatetimeRange, intToTime, offsetDate } from "$lib/timeutils.js"
    import { DAY, TIME_STEP } from "$lib/units.js"
    import AvailabilityComponent from "$lib/AvailabilityTooltip.svelte"
    import { Tooltip } from "flowbite-svelte"

    /** List of epoch ms timestamps. If a timestamp is present in this list, that means the user is free in that 15-minute block */
    // Is a set instead of list to allow efficient querying and removing of specific availabilities
    type AvailabilityList = Set<number>

    /** Mapping of availability block to user names */
    type UsersAvailabilityLists = Map<number, string[]>

    interface Props {
        /** The availability ranges that are shown as inputs */
        ranges: DatetimeRange[]
        availabilities: UsersAvailabilityLists
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
        onDataChange?: (_: UsersAvailabilityLists) => void
        /** Fired when hovered cell changes (including once none are hovered)
         * @default no-op */
        onHoverChange?: () => void
    }

    let {
        availabilities,
        myUsername = "me",
        tzOffset = new Date().getTimezoneOffset(),
        isDisabled = false,
        shouldUseWeekdays = false,
        onDataChange = () => {},
        onHoverChange = () => {},
    }: Props = $props()

    /*function groupByLocalizedDate(dates: number[], locale = undefined, options = undefined) {
        return Object.groupBy(dates, date => new Date(date).toLocaleDateString(locale, options))
        // TODO: these should be offset midnight timestamps so I cab format later
    }*/

    // Must know all possible days (x axis) and times (y axis) for formatting

    // TODO: rename to localized blocks: ms since epoch. In utc time, which represents time in time zone.
    // I can then reduce into set of local midnights (x axis)
    // I can then make a set of all possible blocks

    // Set of all epoch ms timestamps representing the start of a 15-minute block within the given ranges. UTC time is set to what local time would be. */

    let localAvailability = $derived(
        new Map(
            [...availabilities].map(([block, people]) => [
                offsetDate(block, tzOffset).getTime(),
                people,
            ]),
        ),
    )
    // Despite thinking that "just using the ranges will be more efficient", just the ranges do not account for if a range spans overnight into two days

    let allLocalMidnights = $derived(
        [
            ...new Set(
                localAvailability.keys().map(block => new Date(block).setUTCHours(0, 0, 0, 0)),
            ),
        ].sort(),
    )

    /** Array of starting times in 15-minute intervals since midnight for all possible blocks. Changes with timezone */
    // Need this in addition to dateBlocks b/c must know whether to render a row (eg: monday ranges 7-10 but other days range 8-12)
    /*let allLocalDayTimes = $derived(
        range(0, DAY, TIME_STEP).filter(block =>
            timeInRange(offsetRanges(ranges, tzOffset), block),
        ),
    )*/
    // right now range(0, DAY / TIME_STEP) is num mins in a day / 15 which is num blocks in a day

    let allLocalDayTimes = $derived(
        [...new Set(localAvailability.keys().map(block => block % DAY))].sort(),
    )

    let allParticipants = $derived([...new Set(availabilities.values().flatMap(i => i))])

    // ============ SECTION: event handling ++++++++++++++++++++++++++

    // Had to implement 2 separate touch and mouse handlers (instead of using pointer handler) b/c `touch-none` prevents 2-finger panning but without it, page scrolls while selecting
    function convertTouchEvent(ev: TouchEvent): [DateStr | undefined, number | undefined] {
        return [undefined, undefined]
    }

    const handleMouseDown = (date: DateStr, timeIndex: number) => {}

    const handlePointerEnter = (date?: DateStr, timeIndex?: number) => {}

    const handlePointerUp = () => {}
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
                {block % 2 === 0 ? intToTime(block * TIME_STEP).replace(" ", "\xa0") : " "}
            </div>
            <!-- Cells -->
            {#each allLocalMidnights as localDate}
                {@const localDatetime = block + localDate}
                {@const utcDatetime = offsetDate(localDatetime, -tzOffset)}
                {@const peopleAvailable = availabilities.get(localDatetime)}
                {#if peopleAvailable}
                    <div
                        class="availability-cell flex flex-grow"
                        data-utcDatetime={utcDatetime}
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
                        onmousedown={() => {}}
                        onmouseenter={() => {}}
                        ontouchmove={ev => handlePointerEnter(...convertTouchEvent(ev))}
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
