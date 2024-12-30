# devicons-astro

![Devicons](icons.jpg)

A package that provides a component to use icons from the awesome [Devicons](https://devicon.dev/) collection.

## Usage

Install the package.

```bash
npm install devicons-astro
```

Import and use the `DevIcon` component into your `.astro` file.

```astro
---
import DevIcon from 'devicons-astro';
---

<DevIcon name="typescript" variant="original" size={64} />
```

### Props

```ts
import type { HTMLAttributes } from 'astro/types'

const Variants = [
  "original",
  "plain",
  "line",
  "original-wordmark",
  "plain-wordmark",
  "line-wordmark",
] as const;

interface Props extends HTMLAttributes<"svg"> {
    name: string;
    variant?: (typeof Variants)[number];
    size?: string | number;
}
```

1. Name (required) - The name of the icon to render. Will be the same as you would see it on the [Devicons website](https://devicon.dev).
The component will throw an error if it does not match exactly. All names are lowercase and generally do not have spaces or any other puntuation.
(ie 'Amazon Web Services' is 'amazonwebservices').
2. Variant (optional) - Each `Devicon` has several variants and you can use this to specify which you want (defaults to `original`).
3. Size (optional) - Sets width and height, defaults to 24px.
4. Any other valid svg props.

## Design/Caching

Because of the sheer number of icons (over 2000 variants), `devicons-astro` does not include built components but instead
pulls directly from the `jsdelivr` cdn at build time to minimize package size. An svg icon is generated as a result and passed to the `DevIcon` component.

While this is fine and efficient during build time (as the icon will only be fetched once), this does cause many queries to happen during development.
To minimize this impact, `devicons-astro` caches the result locally so it can be reused. When developing, you should only fetch the icon from the cdn once and reuse the
result from then on.

## Errors

Since there are many variations, `devicons-astro` attempts to provide some helpful errors to point you in the right direction when you pass invalid values:

```astro
<DevIcon name="nothing">
// Devicons does not contain the icon 'nothing'. Please see https://devicon.dev for all icons
<DevIcon name="typescript-original">
// You have likely included the variant type with the name. Pass the variant to the 'variant' prop separately instead (ie name="typescript" variant="original")
<DevIcon name="python" variant="line-wordmark">
// Devicon 'python' does not have a variant 'line-wordmark'. Valid variants: 'original, original-wordmark, plain, plain-wordmark'
```
