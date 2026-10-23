# Image prompts for the Circumskill site

The site ships with no raster images: the hero visual, icons and logo are CSS and
inline SVG, so the page works as-is. These prompts are for optional imagery, one
per slot. They are written for OpenAI's image models (GPT Image / DALL·E).
Paste a prompt as-is, then regenerate with the "Style" block tweaked if the result
drifts off-brand.

## Brand style block (prepend to any prompt)

> Style: minimal, editorial, flat vector illustration with subtle paper grain.
> Palette: warm cream background (#F6F3EC), near-black ink (#15140F), one accent
> of signal orange (#FF4D00), small touches of muted green (#1F8A4C) for "kept"
> and muted red (#D0382B) for "cut". No gradients, no 3D, no glossy highlights,
> no photographic realism, no text or letters anywhere in the image. Generous
> negative space. Clean geometric shapes with precise edges.

## 1. Open Graph / social card — `assets/og.png` (1200×630)

> [Style block]. A wide composition for a social share card. On the left, a tall
> stack of thin horizontal bars representing lines of a document, most of them
> drawn in faded gray with a crisp orange strike-through; on the right, a much
> shorter stack of the same bars in solid black, aligned to the same baseline.
> Between them, a single thin orange circle with a short horizontal line passing
> through it, like a lens or a cutting guide. Flat, centered, lots of cream
> negative space around the edges so a title can be overlaid later.

Where it goes: add `<meta property="og:image" content="https://<your-domain>/assets/og.png">`
to the `<head>` of `index.html`.

## 2. Hero background texture — `assets/hero-bg.png` (2400×1400, optional)

> [Style block]. An abstract, very low-contrast background: a faint grid of thin
> horizontal lines like ruled paper on warm cream, with a soft orange glow
> concentrated in the upper-right corner that fades to nothing by the center.
> Extremely subtle, almost invisible, intended to sit behind text. No shapes,
> no objects, no text.

Where it goes: replace the `.hero::before` gradient in `css/styles.css` with
`background: url("../assets/hero-bg.png") center / cover no-repeat;`.

## 3. "Why trim" section illustration — `assets/why.png` (1200×900)

> [Style block]. A conceptual illustration of a context window as a budget: a
> tall, narrow vertical container outlined in black, filled from the bottom with
> stacked gray blocks that nearly reach the top, each block a bloated document
> icon. A small orange blade shape slices through the upper blocks, and the
> same container beside it holds only three compact black blocks with a large
> empty space above them marked by a thin green outline. Flat, side-by-side
> comparison, no labels.

Where it goes: a new `<figure>` inside `#why` above `.cards-3`, or as a
background image on the section at low opacity.

## 4. "How it works" step icons — four square icons, 512×512 each

Generate as one request per icon so they match in weight.

> [Style block]. A single line icon on cream, black strokes of uniform thickness
> with one orange detail, centered, no background shape, no text:
> - **Scan**: a magnifying glass over three short horizontal lines, the middle
>   line orange.
> - **Trim**: a pair of open scissors with a dashed orange line passing between
>   the blades.
> - **Verify**: two overlapping document outlines with a green check mark where
>   they overlap.
> - **Ship**: a paper airplane with a short orange motion line behind it.

Where they go: inside each `.step` in `#how`, above `.step-num`.

## 5. Final CTA backdrop — `assets/cta-bg.png` (2400×1000)

> [Style block] but on a near-black background (#15140F) instead of cream. A
> faint orange radial glow at the top center fading into black, overlaid with
> an extremely sparse field of tiny thin horizontal dashes in dark gray, like
> trimmed-away lines drifting. Abstract, no objects, no text, very dark overall
> so white text stays readable on top.

Where it goes: `.cta-final::before` in `css/styles.css`.

## 6. Logo refinement — `assets/logo.png` (1024×1024, transparent)

> [Style block]. A logo mark only, no wordmark: a bold black circle outline with
> a single orange horizontal line passing straight through its center and
> extending slightly past both edges, and a small orange chevron pointing right
> at the line's right end. Perfectly symmetrical, thick uniform strokes,
> transparent background, nothing else.

Where it goes: the current mark is inline SVG in `index.html` (`.brand-mark`);
swap it for an `<img>` only if you prefer the generated version.
