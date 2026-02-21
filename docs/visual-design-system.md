# Camel Courtship Calculator Visual System (Implemented Foundation)

This repository currently contains core conversion logic and data assets, so this update adds **drop-in design foundations** that can be wired into the React/PWA UI without altering conversion behavior.

## Added assets

- `src/design/tokens.js`: JavaScript token map for light/dark colors, typography, radii, motion, and gradients.
- `src/design/theme.css`: CSS custom properties and utility classes for app background, cards, headings, buttons, and inputs.

## How to use in React

1. Import stylesheet once in app entrypoint:
   - `import './design/theme.css';`
2. Wrap app root with `<main className="ccc-app">`.
3. Use classes on components:
   - Card container: `ccc-card`
   - Primary heading: `ccc-heading`
   - CTA button: `ccc-button-primary`
   - Inputs: `ccc-input`
4. Enable dark mode with a root attribute:
   - `<html data-theme="dark">` or `<body data-theme="dark">`

## Accessibility notes

- Interactive controls keep a minimum 44px target.
- Motion is reduced automatically via `prefers-reduced-motion`.
- Palette maintains semantic separation (success/error/accent) for clear affordance.
