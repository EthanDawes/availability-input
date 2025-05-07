/** Makes a list of numbers from start (inclusive) to stop (exclusive) in `step` increments */
export function range(start: number, stop: number, step = 1) {
    // pretty nieve implementation but idk
    return [...Array(Math.ceil((stop - start) / step))].map((_, i) => i * step + start)
}

function steppedOperation(operator: (x: number) => number, number: number, step: number) {
    return operator(number / step) * step
}

export const steppedFloor = steppedOperation.bind(null, Math.floor)

export const steppedCeil = steppedOperation.bind(null, Math.ceil)

/** Serches and removes specified item from array. Mutates and returns same array! */
export function arrayRemoveItem<T>(array: T[], item: T) {
    const index = array.indexOf(item)
    if (index > -1) {
        array.splice(index, 1)
    }
    return array
}

export function numberComparator(a: number, b: number) {
    return a - b
}

export * from "./units.js"
export * from "./timeutils.js"
export { default as Availability } from "./Availability.svelte"
