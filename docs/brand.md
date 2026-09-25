# Brand colours in the platform

## The short version

Buildour's orange is set in **one place**. To change it:

```bash
node scripts/brand.mjs "#YOUR-HEX"     # prints the derived palette and checks it
```

Then paste the values it prints into the three token blocks in
`apps/web/src/app/globals.css`. Nothing else needs touching, because no component
hard-codes a colour.

> **The orange currently in the code is a placeholder.** It is marked as such in
> `globals.css`. Send the real hex and this becomes a one-command change.

## Why there are two oranges

Brand oranges are bright, and bright colours cannot carry white text. Buildour's placeholder
orange sits at 3.0:1 against white. Readable text needs 4.5:1. Shipping white-on-orange buttons
at 3:1 means anyone reading on a phone in daylight cannot make out the label.

So the orange exists twice:

| Token | What it is | Where it goes |
|-------|-----------|---------------|
| `--brand` | The real logo orange, untouched | Logo mark, badges, the cart count, numbered steps, the progress bar |
| `--brand-action` | The same orange darkened 18% | Buttons and links, anywhere words sit on top of the colour |
| `--brand-highlight` | The band behind the headline word | Darkened further in dark mode, where the text on it is near-white |
| `--brand-wash` | The orange at 12% over the background | Selected cards, soft fills |

Someone looking at the page sees one orange. The darker one only appears under text, where the
difference reads as depth rather than as a second colour.

## What the script checks

Eight pairs, across light and dark themes. Every pair where text sits on a brand colour must
clear 4.5:1. If one fails, the script exits with an error rather than printing a palette, so a
bad brand colour cannot reach the site quietly.

Run it any time the orange changes, and read the output rather than assuming.

## The logo

`apps/web/src/app/icon.svg` is the browser tab icon and
`apps/web/src/components/site-header.tsx` draws the header mark. **Both are placeholders**: a
monogram, not Buildour's real logo.

To replace them, send the logo as SVG, or PNG with a transparent background. The icon-only mark
matters most, since that is what appears in the header and the tab. A full wordmark is a bonus
and would replace the mark-plus-text pairing in the header.

## Rules worth keeping

- **Never two orange buttons side by side.** The point of one loud button is that it tells the
  reader where to go. Two of them tell them nothing. The secondary action uses `.btn--quiet`.
- **Never put text on `--brand` without checking it.** Use `--brand-action` instead, or dark text
  via `--brand-ink`.
- **Semantic colours stay separate from the brand.** Warnings, errors and success states have
  their own hues. A warning that shows up in brand orange stops reading as a warning.
