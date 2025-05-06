import type { DateStr, DatetimeRange } from "./timeutils.ts"
import { range, steppedCeil, steppedFloor, TIME_STEP } from "$lib/index.js"

/** Key: the date in any parsable format. Value: array of indices to time blocks.
 * For example, if you ask for times starting at 8am and use 15 min intervals, 9:30 will be index 5  */
export type Availability = Record<DateStr, number[]>
export type InternalAvailability = Record<DateStr, string[][]>
export type GenericAvailability = Availability | InternalAvailability
export type DateCompatible = number | string | Date

/** Mapping of availability block to user names */
export type AvailabilityBlockUsersMap = Map<number, string[]>

export interface UserAvailability {
    availability: Availability
    username: string
}

/** `loadAvailability` but assumes username = "me"
 * @see loadAvailability
 */
export function loadAvailabilityOne(availability: Availability) {
    return loadAvailability({ availability, username: "me" })
}

/** Converts availability from format in database or localstorage into format component can read */
export function loadAvailability(...availabilities: UserAvailability[]) {
    const unpackedAvailability: InternalAvailability = {}
    for (const availability of availabilities) {
        for (const key in availability.availability) {
            if (!(key in unpackedAvailability)) unpackedAvailability[key] = []
            for (const idx of availability.availability[key]) {
                if (unpackedAvailability[key][idx] == undefined) unpackedAvailability[key][idx] = []
                unpackedAvailability[key][idx].push(availability.username)
            }
        }
    }
    return unpackedAvailability
}

/**
 * Converts from component representation to database representation
 * @returns tuple, 1st element is specific availability, 2nd element is availability for days of the week
 */
export function compactAvailability(availability: InternalAvailability) {
    const formattedAvailability: Availability = {}
    const weeklyAvailability: Availability = {}
    for (const key in availability) {
        formattedAvailability[key] = availability[key]
            .map((numbAvailable, idx) => (numbAvailable.length ? idx : null))
            .filter((a): a is number => a != null)
        weeklyAvailability[new Date(key).getDay()] = formattedAvailability[key]
    }
    return [formattedAvailability, weeklyAvailability] as const
}

/**
 * Convert an availability that you know into a new Availability range based on days of the week
 * @param dates The new timeframe you want to shift the availability into
 * @param availability Date & time of availability that you know
 */
export function applyAvailability(dates: DateCompatible[], availability: Availability) {
    const out: Availability = {}
    for (const date of dates) {
        out[new Date(date).toLocaleDateString()] = availability[new Date(date).getDay()] ?? []
    }
    return loadAvailabilityOne(out)
}

export function mergeAvailability(
    existing: InternalAvailability,
    newer: Availability,
    user = "me",
) {
    for (const existingDateStr in existing) {
        for (const newDateStr in newer) {
            for (const timeBlock of newer[newDateStr]) {
                const usersAvailable = existing[existingDateStr][timeBlock] as string[] | undefined
                if (
                    !usersAvailable?.includes(user) &&
                    (new Date(newDateStr).getDay() === new Date(existingDateStr).getDay() ||
                        newDateStr === existingDateStr)
                ) {
                    if (usersAvailable) usersAvailable.push(user)
                    else existing[existingDateStr][timeBlock] = [user]
                }
            }
        }
    }
    return existing
}

/**
 * Merges two availabilities similar to `mergeAvailability`,
 * except that if `newer` does not contain a block `existing` contains, it is not included in the resultant availability
 */
export function mergeServerLocal(existing: InternalAvailability, newer: Availability, user = "me") {
    mergeAvailability(existing, newer, user)
    for (const existingDateStr in existing) {
        for (let timeBlock = 0; timeBlock < existing[existingDateStr].length; timeBlock++) {
            // Remove if not included in `newer`
            const availableBlocksNewer = newer[existingDateStr] ?? []
            if (!availableBlocksNewer.includes(timeBlock)) {
                const rmIdx = existing[existingDateStr][timeBlock]?.indexOf(user)
                if (rmIdx == undefined || rmIdx < 0) continue
                existing[existingDateStr][timeBlock].splice(rmIdx, 1)
                if (existing[existingDateStr][timeBlock].length === 0)
                    delete existing[existingDateStr][timeBlock]
            }
        }
    }
    return existing
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

export function enforceAvailabilityValidity<T extends GenericAvailability>(
    availability: T,
    dates: DateStr[],
) {
    for (const date of dates) {
        if (!(date in availability)) availability[date] = []
    }
    return availability
}

export function combineAvailability(availabilities: AvailabilityBlockUsersMap) {
    // TODO
}

export function serializeAvailability(availabilities: AvailabilityBlockUsersMap) {
    return JSON.stringify(Array.from(availabilities.entries()))
}

export function deserializeAvailability(availabilities: string) {
    return new Map<number, string[]>(JSON.parse(availabilities))
}
