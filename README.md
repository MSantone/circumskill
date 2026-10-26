# Circumskill — website

Marketing site for **Circumskill**, a tool that minifies and trims bloated AI
agent skills to their essentials.

The site is a single static page with no build step and no dependencies beyond
Google Fonts.

```
index.html          page markup
css/styles.css      styles (light theme, dark mode via prefers-color-scheme)
js/main.js          nav toggle, copy buttons, hero counter, playground trimmer
assets/             favicon, logo mark, social card, step icons, CTA backdrop
assets/IMAGE_PROMPTS.md  image slot status and prompts for the ones still open
```

## Run locally

Any static server works:

```sh
npx http-server -p 8080 .
# or
python3 -m http.server 8080
```

Then open <http://localhost:8080>.

## Deploy

The page is plain HTML, so it can be served from GitHub Pages, Netlify, Vercel or
an S3 bucket. For GitHub Pages: Settings → Pages → deploy from the branch root.

## Editing

- **Copy and numbers.** Headline stats, pricing tiers and the sample CLI output
  are placeholders chosen to read well. Adjust them in `index.html`.
- **Colors and fonts.** All design tokens live at the top of `css/styles.css`
  under `:root` (light) and the dark-mode blocks.
- **Playground.** The in-browser trimmer in `js/main.js` is a heuristic demo
  (hedge removal, duplicate collapse, whitespace cleanup) so visitors can see the
  idea without a backend. The `RULES` array is the place to add or remove phrases.
- **Links.** GitHub and docs links point at this repository; the "Talk to us"
  button uses a placeholder email address. The `og:image` URL assumes GitHub
  Pages at `msantone.github.io/circumskill`; change it if you deploy elsewhere.
