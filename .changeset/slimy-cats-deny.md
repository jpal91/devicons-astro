---
"devicons-astro": minor
---

Fixed an issue involving a collision that caused style errors when using multiple icons

When two or more "original" (usually) icons were used on the same page and both had `<defs>` tags, there could sometimes be definition collisions.

Devicons reused simply named ids in `<linear-gradient>` tags, for example, that were named letters of the alphabet (so `#a`, as an example). When
more than one icon had `<defs>`, there would be two icons attempting to point back to `id="url(#a)`, which could be the wrong style definition.

Fix was to iterate over the children and update id names that were more unique (ie `#astro-original-a`) to avoid collisions. To do this more simply,
I added on the `svgson` package which parses `svg` into `json`. All logic using string regex replacement was changed to this.

I wish I knew about `svgson` when I started so kudos to them and the `devicons-react` package for giving me the idea!
