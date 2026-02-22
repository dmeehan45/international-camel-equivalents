# Wedding Editorial Design System (The Knot Inspired)

This design system extracts the **visual language** from:
`https://www.theknot.com/us/courtney-colella-and-justin-kalusa-sep-2025`

It is now adapted for this project so the existing calculator UI keeps behavior but adopts a softer wedding-editorial presentation.

## Extracted style signals

- **Typography contrast**: elevated serif display headings with clean geometric sans-serif body copy.
- **Muted romantic palette**: ivory, eucalyptus gray-green, champagne, and dusty rose accents.
- **Lightweight controls**: slim borders, subtle rounded corners (not heavy pills), uppercase micro-labels.
- **Airy surfaces**: soft gradients, calm elevation, and low-contrast section cards.

## Token mapping for this project

Implemented in `src/design/tokens.js` and consumed in app styles via CSS variables in `src/app.css`.

- Base background: `#F8F6F2`
- Elevated panel: `#FFFFFF`
- Soft neutral section: `#EEF1ED`
- Border: `#D7DBD8`
- Primary text: `#747675`
- Accent tones: `#DCC8A0` (champagne), `#B89A95` (muted rose)

## Typography system

- Heading: `"Cormorant Infant", "Times New Roman", Georgia, serif`
- Body/UI: `"Josefin Sans", "Avenir Next", "Segoe UI", sans-serif`
- Hero treatment: uppercase + wide letter spacing for ceremony-style presentation.

## Component guidance

- **Buttons/step chips**: 6px radius, uppercase labels, subtle letter spacing.
- **Cards**: 18px radius with soft border and shadow.
- **Inputs/focus**: neutral borders with champagne-tinted focus ring.
- **Status + error colors**: softened/desaturated tones to match muted palette.

## Accessibility notes

- Focus-visible outlines remain explicit.
- Body copy preserves readable line-height.
- Contrast is intentionally soft but still foreground-first for key text.
