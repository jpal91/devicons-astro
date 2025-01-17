# devicons-astro

## 0.4.0

### Minor Changes

- 5d16f71: Fixed an issue involving a collision that caused style errors when using multiple icons

  When two or more "original" (usually) icons were used on the same page and both had `<defs>` tags, there could sometimes be definition collisions.

  Devicons reused simply named ids in `<linear-gradient>` tags, for example, that were named letters of the alphabet (so `#a`, as an example). When
  more than one icon had `<defs>`, there would be two icons attempting to point back to `id="url(#a)`, which could be the wrong style definition.

  Fix was to iterate over the children and update id names that were more unique (ie `#astro-original-a`) to avoid collisions. To do this more simply,
  I added on the `svgson` package which parses `svg` into `json`. All logic using string regex replacement was changed to this.

  I wish I knew about `svgson` when I started so kudos to them and the `devicons-react` package for giving me the idea!

## 0.3.3

### Patch Changes

- Reworked variant logic so that variant arrays will choose the higher priority picks first using named versions or aliases instead of prioritizing named versions

## 0.3.2

### Patch Changes

- Fixing version tag issue

## 0.3.0

### Minor Changes

- Added new responsive colors prop to DevIcon

## 0.2.0

### Minor Changes

- Added ability to quietly fail and go to fallback

## 0.1.9

### Patch Changes

- Changed an issue that would effect astro build

## 0.1.8

### Patch Changes

- Updated for release

## 0.1.2

### Patch Changes

- Updated build script

## 0.1.1

### Patch Changes

- Initial
