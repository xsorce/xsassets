# xsassets

Personal library of no-build web components, served to other sites from GitHub via jsDelivr (`https://cdn.jsdelivr.net/gh/xsorce/xsassets@<tag>/components/<name>/<name>.js`).

## Component conventions

- One folder per component: `components/<name>/<name>.js` + `components/<name>/demo.html`. Tag name is `xs-<name>`.
- Single self-contained ES module. No dependencies, no build step, no npm.
- Shadow DOM for all markup and styles. `@font-face` can't live in a shadow root, so inject font `<link>`s into `document.head` once (see `koi-home.js` `connectedCallback`).
- Header comment lists attributes, children, events, methods, properties, and theming CSS variables. Keep it accurate; it's the API doc.
- Configure via attributes; expose behavior via element methods; communicate out via `CustomEvent` with `bubbles: true, composed: true`.
- Size to the container, not the viewport: use `container` queries, `ResizeObserver`, and `host.getBoundingClientRect()` for pointer math.
- Clean up fully in `disconnectedCallback`: an `AbortController` for every listener, cancel `requestAnimationFrame`, clear timers, disconnect observers. Re-adding the element must work.
- Guard registration: `if (!customElements.get('xs-x')) customElements.define('xs-x', X)`.
- Persist per-viewer settings in `localStorage` under a `storage-key` attribute, wrapped in try/catch.
- Respect `prefers-reduced-motion`. Keep keyboard and screen-reader access (roles, `aria-*`, focus states).
- Reference implementation: `components/koi-home/koi-home.js` (`mount()` returns a cleanup function).

## Releasing

Sites pin to tags, so never move or delete a pushed tag. New features or fixes → new tag (`v0.x.y`), then update the version in README usage examples.

## Verifying

Serve with `python -m http.server 5517` (configured in `.claude/launch.json`) and check the component's `demo.html` at desktop and 375px widths with no console errors.
