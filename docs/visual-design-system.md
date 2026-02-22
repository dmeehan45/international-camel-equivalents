# Legal Editorial Design System (Harvey.ai Transactional Inspired)

This design system translates the visual language from:
`https://www.harvey.ai/solutions/transactional`

Goal: keep the existing app behavior, but restyle it with a polished “legal product” look—deep navy foundations, restrained gold accents, editorial serif headings, and crisp data-first UI surfaces.

## Extracted style signals

- **Premium legal tone**: dark, confident backgrounds with high-contrast ivory text.
- **Editorial hierarchy**: serif-forward headings paired with modern sans-serif body copy.
- **Structured surfaces**: cool white cards with subtle gradients and hard-working border lines.
- **Selective accenting**: minimal warm gold highlights for active states and emphasis.
- **Low-noise interactions**: soft hover/focus transitions and restrained radius values.

## Token mapping for this project

Implemented via CSS variables in `src/design/theme.css` and consumed in `src/app.css` + `src/design/legal-theme.css`.

- App backdrop: layered navy gradient (`--ccc-surface-0`)
- Primary card surface: white-to-cool-white gradient (`--ccc-surface-1`)
- Text palette:
  - dark text (`--ccc-ink`)
  - muted body text (`--ccc-slate` / `--ccc-steel`)
  - inverse text on dark surfaces (`#dbe6ff`)
- Accent palette:
  - legal gold (`--ccc-gold`)
  - soft gold glow (`--ccc-gold-soft`)

## Typography system

- Heading: `"Ivar Text", "Canela", "Times New Roman", Georgia, serif`
- Body/UI: `"Inter", "Avenir Next", "Segoe UI", Arial, sans-serif`
- Usage:
  - headings and contract-style output use serif
  - controls, inputs, body copy stay sans-serif for readability

## Component guidance

- **Top navigation**: translucent dark bar + subtle blur + gold-tinted divider.
- **Progress chips/buttons**: dark by default; active state uses understated gold gradient.
- **Cards/drawers**: cool white backgrounds, thin lines, generous but controlled shadows.
- **Inputs/focus**: neutral border with warm gold focus ring.
- **Persistent legal disclaimer**: dark glass effect with lighter legal-copy text.

## Accessibility notes

- Focus styles remain explicit on all form controls.
- Contrast remains high for primary text and critical actions.
- Decorative gold accents never carry meaning alone.
