# International Camel Equivalents

A parody dowry advisory service. It converts a marriage bid denominated in one
absurd proxy — yaks, narwhals, vintage typewriters, small puntable yippy dogs —
into a camel-equivalent benchmark, then generates a mock legal indenture you can
copy, download, or send to a suitor.

It is a joke, played completely straight. **Nothing here is legal advice, no
dowries are exchanged, and the exchange rates are invented.**

> [!NOTE]
> Status: occasionally maintained. I add silly features when I think of one.
> Not production software, not audited, not a template to build on.

## Why this exists

My partner and I were travelling across a lot of countries. In more than one of
them, being the beautiful woman that she is, she was asked for her hand in
marriage — and the offers came with terms. One suitor tendered camels. Another
countered in yaks. Somewhere along the way a helicopter entered the negotiation.

The offers were, frankly, generous. Mine started looking paltry by comparison —
hard to compete on sheer volumetric goods when the other side is bidding
livestock. But nobody could tell me what a helicopter was *worth* in camels, and
without a common unit there was no way to know whether I was being outbid or
whether she was being lowballed.

So we built the exchange. Pick what you have been offered, convert it to the
camel benchmark, and get a straight answer about where the bid actually sits —
plus a formal-looking indenture, in case she wanted to counter-offer with
evidence.

She has yet to accept any of them, including mine. The tool remains available to
her for future negotiations.

## Running it

Requires Node 20 or newer.

```bash
git clone https://github.com/dmeehan45/international-camel-equivalents.git
cd international-camel-equivalents
npm ci
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

There is no configuration, no `.env`, no account, and no backend. The whole app
runs in the browser.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the built output |
| `npm test` | Unit tests (`node --test`) |
| `npm run test:e2e` | Cypress end-to-end suite — **needs a dev server running** |

For the e2e suite, run `npm run dev` in one terminal and `npm run test:e2e` in
another.

## How the numbers work

Every proxy in [`src/data/proxies.json`](src/data/proxies.json) carries a
`ratePerCamel` — how many of that thing one camel is worth. There are 102 of
them, all fictional, sorted into categories like "Mythical and Absurd Concepts"
and "Other Bizarre Items and Collectives".

A bid converts to camels by division:

```
camelEquivalent = proxyQuantity / liveRate
```

The "live" rate is the base rate nudged by a daily volatility percentage derived
from the day of the month (`date.getDate() % 7`). This is why the rate moves and
why the app can claim a rate "as of" today with a straight face. It is not
market data. There is no market.

## The flow

Five pages, gated in order:

1. **Intro** — the pitch, in full legal-SaaS voice
2. **Basics** — who the bid is for (name and region required)
3. **Offer** — pick a proxy, set a quantity, watch the camel benchmark move
4. **Text** — the generated indenture, with optional absurd addendum clauses
5. **Drafts** — your saved dockets, plus four unlockable advisory tools

Everything persists to `localStorage`, so a refresh picks up where you left off.

## What it does not do

Being specific about this, because the app's own UI is not:

- **Nothing is encrypted.** The landing page says "256-bit Local Encryption".
  That is part of the joke. Your drafts sit in plain `localStorage`.
- **"SOC 2 Inspired Controls" and "GDPR-Style Privacy" are also jokes.** There
  are no controls and no compliance program.
- The privacy claim that *is* true: **no data ever leaves your browser.** There
  are zero network calls in the source. No backend, no analytics, no telemetry,
  no accounts. That is not a policy decision, it is just how it is built.
- **No offline support.** There is a PWA manifest, but no service worker.
- **Not internationalized**, despite the name. English only.
- **"Download PDF" opens a print window** rather than generating a PDF file.
- The rates are invented and the legal text is nonsense. Obviously. But it looks
  convincing enough that it seemed worth writing down.

## Built with

React 18, TypeScript, and Vite. No state library, no UI framework, no CSS
framework — the design system is hand-rolled CSS variables, documented in
[`docs/visual-design-system.md`](docs/visual-design-system.md).

Tests are `node --test` (Node's built-in runner, importing TypeScript directly
via native type stripping) plus Cypress for the end-to-end flow.

## Verified

Installs, builds, and completes the full five-page flow on Node 22.22.2 as of
2026-07-29. Unit suite: 23 passing. E2E suite: 18 passing. Not maintained on a
schedule, and not audited for security.

## License

MIT — see [LICENSE](LICENSE). It is a joke project; do whatever you like with it.
