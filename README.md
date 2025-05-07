# Availability Input Component

Reusable Svelte component for inputting, combining, and visualising personal time availability.

[🌐 Take me to the demo!](https://ethandawes.github.io/availability-input/)

Anticipated use-case is for applications where multiple people need to find a common time to meet, similar to [schej.it](https://schej.it/) or [when2meet](https://www.when2meet.com/)

## Usage
Add to your project with `npm i availability-input` ([view on npm](https://www.npmjs.com/package/availability-input))

**Quick-Start**
```sveltehtml
<script>
  import { Availability, blankAvailability, constructUniformDatetimeRanges, getTodayWeek, timeToInt } from "availability-input"
</script>

<Availability availabilities={
  blankAvailability(
    constructUniformDatetimeRanges(
      getTodayWeek(),
      [timeToInt("7:00 am"), timeToInt("10:00 pm")]
    ),
  )}
/>
```
Props are documented on the [AvailabilityProps](https://github.com/EthanDawes/availability-input/blob/main/src/lib/availability.ts) interface

For more examples, view the [Storybook files](https://github.com/EthanDawes/availability-input/tree/main/src/stories)

### Import the styles
**Tailwind**
Add `@source '../node_modules/availability-input/dist'` to `app.css` ([why?](https://tailwindcss.com/docs/detecting-classes-in-source-files#explicitly-registering-sources))

**No Tailwind**

## Developing
1. Install pnpm
2. Install dependencies: `pnpm install`
3. Run Storybook to preview and test: `npm run storybook`
4. Run automated tests in watch mode: `npm run test:unit`
