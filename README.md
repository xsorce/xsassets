# xsassets

Drop-in web components for my sites and projects. Each component is a single ES module with no dependencies and no build step, so it works in plain HTML, React, Vue, Svelte, Astro, or anything else that renders HTML.

**Live gallery:** https://xsorce.github.io/xsassets/

## Use a component

Load it from the jsDelivr CDN, pinned to a release tag:

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/xsorce/xsassets@v0.1.0/components/koi-home/koi-home.js"></script>

<xs-koi-home name="Zain" name-ar="زين"></xs-koi-home>
```

Pinning to a tag (`@v0.1.0`) means updates to this repo never change a live site until you bump the tag. Alternatively, copy the component's `.js` file into your project and point the script tag at it.

## Components

### `<xs-koi-home>`

A full-screen homepage: pixel-filtered koi swimming over a dark pond, a rotating Arabic greeting (hover for Arabizi and English), an ask box with a demo chat, a `/` command menu, and a Tweaks panel with sliders and a swappable image/GIF/video background.

| | |
|---|---|
| Attributes | `name`, `name-ar`, `bg` (image/GIF/video URL), `storage-key` |
| Children | `<a>` or `<button>` elements become nav tabs; `style="--c:#hex"` sets the dot color |
| Event | `koi:ask` (`detail` = message). Call `e.preventDefault()` to replace the demo replies with your own |
| Methods | `ask(text)`, `reply(text)`, `status(text)`, `command(name)`, `newChat()`, `set(key, value)` |
| Properties | `config`, `commands`, `phrases` (get or replace the phrase list) |
| Theming | `xs-koi-home { --bg; --glass; --text; --muted }` |

Connect a backend:

```js
const koi = document.querySelector('xs-koi-home');
koi.addEventListener('koi:ask', async e => {
  e.preventDefault();
  koi.status('Searching…');
  const res = await fetch('/api/ask', { method: 'POST', body: e.detail });
  koi.reply(await res.text());
});
```

[Demo](https://xsorce.github.io/xsassets/components/koi-home/demo.html) · [Source](components/koi-home/koi-home.js)

## Add a component

1. Create `components/<name>/<name>.js` defining `<xs-<name>>`, and `components/<name>/demo.html`.
2. Follow the conventions in [CLAUDE.md](CLAUDE.md).
3. Add a card to `index.html` and a section to this README.
4. Commit, then tag a release: `git tag v0.2.0 && git push --tags`.

## Develop locally

```bash
python -m http.server 5517
```

Then open http://localhost:5517. ES modules don't load from `file://`, so a local server is required.

## License

MIT
