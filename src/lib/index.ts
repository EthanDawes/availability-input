/** Makes a list of numbers from start (inclusive) to stop (exclusive) in `step` increments */
export function range(start: number, stop: number, step = 1) {
    // pretty nieve implementation but idk
    return [...Array(Math.ceil((stop - start) / step)).keys()].map(i => i * step + start)
}

export * from "./units.js"
export * from "./timeutils.js"
export { default as Availability } from "./Availability.svelte"
export { default as ManualInput } from "./ManualInput.svelte"
