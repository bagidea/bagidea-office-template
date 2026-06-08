# Building a BagIdea Office plugin — notes for Claude

You are working inside a **BagIdea Office plugin** repo. This file tells you the
conventions so you can extend or rewrite it correctly.

## What a plugin is
A folder (this repo) with a `plugin.json` at its root. Optional `index.js`
(server side) and `panel.html` (a UI the user opens). No build step, zero npm
dependencies — plain Node + HTML. When installed it lives at
`plugins/<id>/` inside the office and is loaded by `daemon/plugins.js`.

## The three files
- **`plugin.json`** — `id`, `name`, `version`, `description`, optional `panel`,
  and `commands: [{name, args, desc}]`. The `commands` are surfaced to every
  office agent automatically. Do **not** set `"core": true` (that's reserved for
  the office's own shipped plugins and blocks uninstall).
- **`index.js`** — `module.exports = (ctx) => ({ onCommand?, routes? })`.
  - `onCommand(cmd, args, reply)` handles `POST /plugin/<id>/cmd {cmd,args}`.
    Call `reply(jsonObject)` exactly once (sync return, a Promise, or later).
  - `routes` is `{ name(req, res, { readBody, readBodyRaw }) {...} }`, served at
    `/plugin/<id>/<name>`. Write to `res` yourself for JSON/binary/streaming.
- **`panel.html`** — a normal page rendered in the overlay webview. Fetch your
  routes with relative URLs (`/plugin/<id>/...`). Keep the dark theme
  (`background:#0c1322; color:#dbe7ff; accent #5ec8ff`).

## `ctx` — the office API (passed to your factory)
| field | use |
|---|---|
| `ctx.reg` | live registry — `reg.agents`, `reg.roles`, `reg.skills`, `reg.lang`, settings. READ. |
| `ctx.saveReg()` | persist changes after mutating `ctx.reg`. |
| `ctx.feed(text, agentId?)` | post a visible line to the office feed stream. |
| `ctx.broadcast(event)` | push a live event to every open panel + the office (WS). Use `{type:"plugin.event", plugin:"<id>", ...}`. |
| `ctx.runClaude(agentId, prompt, opts?)` | run a real Claude Code turn as that agent (advanced). |
| `ctx.dataDir` | `plugins/<id>/data` — your private, persistent storage. Never hard-code paths. |
| `ctx.pluginDir` | this plugin's folder (bundled files live under `static/`). |
| `ctx.daemonDir` | the office daemon folder (read office data files if needed). |
| `ctx.manifest` | your parsed `plugin.json`. |
| `ctx.log(msg)` | write to the daemon log. |

## Live updates
When you change something an agent or the user should see, call
`ctx.broadcast({type:"plugin.event", plugin:"<id>", ...})`. The panel listens on
`ws://127.0.0.1:8787/ws` and re-reads its state when it sees its own
`plugin.event`.

## Reload while developing
`curl -s -X POST http://127.0.0.1:8787/plugins/reload -H "x-bagidea-ui: 1"`

## Rules
- Keep it self-contained: stdlib `fs`/`path` only, no external packages.
- Don't touch other plugins' folders or the office's own files destructively.
- One command = one clear `reply()`. Validate `args` before acting.
- Match the office dark theme in any UI.

Full reference (always defer to it): the office repo's
`docs/guide/plugins.md`.
