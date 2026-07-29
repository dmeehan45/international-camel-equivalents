# Legal Editorial Design System

The joke only lands if the app looks expensive. This design system chases the
house style of enterprise legal-tech marketing sites — deep navy foundations,
restrained gold accents, editorial serif headings, crisp data-first surfaces —
and applies it to a tool that values fiancées in narwhals.

Nothing here is copied from anyone: no fonts are bundled, no assets are
borrowed, and the three SVGs in `public/icons/` are hand-drawn. This is a
description of an aesthetic, reimplemented from scratch in CSS variables.

## Style signals being chased

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

No webfonts are loaded or bundled. The first names in each stack are commercial
faces that a few designers will happen to have installed locally; everyone else
gets the system fallbacks, which is what the app was actually designed against.

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
