# 👋 BagIdea Office — Plugin Template

The official starter for building a [BagIdea Office](https://github.com/bagidea/bagidea-office)
plugin. It's a tiny, working plugin called **Hello Office** that:

- reads **live data from the office** (its agents, roles, language) and shows it in a panel,
- exposes **commands agents can run** (`greet`, `roster`) — the same ones the panel uses,
- **posts to the office feed** and broadcasts live updates,
- keeps its own **private, persistent storage**.

Fork this repo, rename it, and you have a real plugin in minutes — for a human
or for Claude to extend.

---

## Try it in 30 seconds

In your office:

```bash
bagidea plugin install https://github.com/bagidea/bagidea-office-template
```

(or paste the URL into the 🧩 **Plugins** panel → **Install**). Then open the
🧩 panel and click **👋 Hello Office**. Remove it any time:

```bash
bagidea plugin remove hello
```

---

## What's in here

| File | What it is |
|---|---|
| `plugin.json` | The manifest — id, name, the commands agents can call. **Required.** |
| `index.js` | Server side — `(ctx) => ({ onCommand, routes })`. Where the logic lives. |
| `panel.html` | The UI the user opens. Talks to your routes; stays live over WebSocket. |

**Pop it out:** the user can open your panel as its own resizable window (the ⤢ button) — set a default size with `"window": { "w": 460, "h": 620, "resizable": true }` in `plugin.json`, and keep your layout fluid so it scales. Same `panel.html`, two ways to view it.
| `CLAUDE.md` | Context for Claude/AI agents extending this plugin. |
| `data/` | Auto-created private storage (gitignored). |

A plugin needs **only** `plugin.json`. Add `index.js` for server power and
`panel.html` for a UI.

---

## How it works

When installed, the office clones this repo into `plugins/hello/` and loads it.

- **Commands** in `plugin.json` are injected into every agent's prompt, so an
  agent can run them with a single HTTP call. The panel hits the *same* route,
  so "greet the office" works identically whether a human clicks the button or
  an agent decides to.
- **`ctx`** (passed to your factory in `index.js`) is your gateway into the
  running office — read the registry, post to the feed, broadcast events,
  persist state, even run a real Claude turn. Every field is documented at the
  top of `index.js`.
- **Routes** under `/plugin/hello/<name>` are yours to define; the panel calls
  `/plugin/hello/state` to fetch the live snapshot.

---

## Make it your own

1. Rename the repo (and set a new `id` + `name` in `plugin.json`).
2. Replace the `greet`/`roster` commands with yours.
3. Build out `panel.html` (keep the dark theme: `#0c1322` / `#5ec8ff`).
4. Reload while developing: `curl -s -X POST http://127.0.0.1:8787/plugins/reload -H "x-bagidea-ui: 1"`.

Read the full spec — `ctx` reference, HTTP routes, streaming, agent
integration — in the office repo:
**[docs/guide/plugins.md](https://github.com/bagidea/bagidea-office/blob/main/docs/guide/plugins.md)**.

---

## License

MIT — do anything, no warranty. See [LICENSE](LICENSE).
