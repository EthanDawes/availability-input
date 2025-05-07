import { type DatetimeRange, offsetDate, UTCMidnight } from "./timeutils.js"
import {
    arrayRemoveItem,
    DAY,
    numberComparator,
    range,
    steppedCeil,
    steppedFloor,
    TIME_STEP,
} from "$lib/index.js"

export type DateCompatible = number | string | Date

/** Mapping of availability block to user names */
export type AvailabilityBlockUsersMap = Map<number, string[]>

export interface HoverData {
    /** Element that is being hovered */
    target: HTMLElement
    /** start global UTC datetime object of block */
    time: Date
    everyone: string[]
    /** List of people available in that block */
    available: string[]
    /** List of people unavailable in that block */
    unavailable: string[]
}

export interface AvailabilityProps {
    /** All inputable availability blocks along with who is available during that 15-minute block as ms since epoch. Should be in UTC time, not localized */
    // Despite thinking that "just using the ranges will be more efficient", just the ranges do not account for if a range spans overnight into two days
    // I removed the `localAvailability` convenience map because it was unnecessary
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
    /** Will be passed to root html element. Useful for styling or targeting */
    id?: string
}

export function blankAvailability(ranges: DatetimeRange[]) {
    return new Map(
        ranges
            .flatMap(([rangeStart, rangeStop]) =>
                range(
                    // rangeStart and rangeStop should (although not necessarily) align with TIME_STEP boundaries.
                    steppedFloor(rangeStart, TIME_STEP),
                    steppedCeil(rangeStop, TIME_STEP),
                    TIME_STEP,
                ),
            )
            .map(block => [block, [] as string[]]),
    )
}

/** Given two availabilities, combine them and return new copy. If block exists in one but not the other, it will be created in combined copy. */
export function combineAvailability(availabilities: AvailabilityBlockUsersMap[]) {
    return availabilities.reduce((acc, availability) => {
        availability.forEach((users, block) => {
            const existingUsers = acc.get(block) ?? []
            acc.set(block, [...new Set([...existingUsers, ...users])])
        })
        return acc
    }, new Map() as AvailabilityBlockUsersMap)
}

/** Convert Availabilities object to json map entries string */
export function serializeAvailability(availabilities: AvailabilityBlockUsersMap) {
    return JSON.stringify(Array.from(availabilities.entries()))
}

/** Convert json stringified map entries to Availabilities map */
export function deserializeAvailability(availabilities: string) {
    return new Map<number, string[]>(JSON.parse(availabilities))
}

/** Mutate passed `availabilities` such that user `fillName` is marked available/unavailable (`fillState`) in all blocks that are within `corners`
 * @description if corners = [monday 10am, tuesday 7am], it will fill monday 7-10am and tuesday 7-10am */
export function fillRect(
    availabilities: AvailabilityBlockUsersMap,
    corners: [number, number],
    fillState: boolean,
    fillName = "me",
    tzOffset = 0,
) {
    const dateRange = corners.map(UTCMidnight).sort(numberComparator)
    const timeRange = [corners[0] % DAY, corners[1] % DAY].sort(numberComparator)
    for (let day = dateRange[0]; day <= dateRange[1]; day += DAY) {
        for (let time = timeRange[0]; time <= timeRange[1]; time += TIME_STEP) {
            const globalDatetimeCursor = offsetDate(day + time, tzOffset).getTime()
            const peopleAvailable = availabilities.get(globalDatetimeCursor)
            if (peopleAvailable !== undefined) {
                if (fillState) {
                    if (!peopleAvailable.includes(fillName)) {
                        peopleAvailable.push(fillName)
                    }
                } else {
                    arrayRemoveItem(peopleAvailable, fillName)
                }
            }
        }
    }
}
