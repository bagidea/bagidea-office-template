// 👋 Hello Office — the BagIdea Office plugin template (server side).
//
// A plugin's index.js exports a single factory: (ctx) => ({ ... }).
// `ctx` is your gateway into the running office. This template uses every
// part of it at least once, with comments, so you can copy the pattern you
// need and delete the rest.
//
//   ctx.reg        the live registry — agents, roles, skills, settings (READ)
//   ctx.saveReg()  persist changes you made to ctx.reg
//   ctx.feed(t,a)  post a visible line to the office feed (a = agent id)
//   ctx.broadcast(ev)  push a live event to every open panel + the office (WS)
//   ctx.runClaude(agentId, prompt, opts)  run a real Claude Code turn (advanced)
//   ctx.dataDir    plugins/<id>/data — your private, persistent storage
//   ctx.pluginDir  this plugin's folder (for bundled files under static/)
//   ctx.daemonDir  the daemon folder — read office data files if you must
//   ctx.manifest   your parsed plugin.json
//   ctx.log(msg)   write a line to the daemon log
//
// Full guide: https://github.com/bagidea/bagidea-office/blob/main/docs/guide/plugins.md

const fs = require("fs");
const path = require("path");

module.exports = (ctx) => {
  // ---- private storage -------------------------------------------------------
  // Keep your own state in ctx.dataDir, never a hard-coded path. Here we just
  // count how many times the plugin has been "pinged".
  const stateFile = path.join(ctx.dataDir, "state.json");
  const load = () => { try { return JSON.parse(fs.readFileSync(stateFile, "utf8")); } catch { return { greets: 0 }; } };
  const save = (s) => fs.writeFileSync(stateFile, JSON.stringify(s));

  // ---- reading live office data ---------------------------------------------
  // A snapshot built from the registry the office is running on right now.
  const snapshot = () => {
    const agents = Object.entries(ctx.reg.agents || {})
      .map(([id, a]) => ({ id, name: a.name, role: a.role }));
    return {
      agents,
      agentCount: agents.length,
      roles: ctx.reg.roles || [],
      language: ctx.reg.lang || "en",
      greets: load().greets,
    };
  };

  return {
    // Called when an AGENT or the panel POSTs /plugin/hello/cmd {cmd, args}.
    // Agents see these commands automatically (they're listed in plugin.json),
    // so "greet the office" from an agent runs the exact same code as the
    // button in the panel.
    onCommand(cmd, args, reply) {
      if (cmd === "greet") {
        const who = (args && String(args).trim()) || "everyone";
        const s = load(); s.greets++; save(s);
        ctx.feed(`👋 Hello, ${who}! (from the Hello Office plugin)`, "main");
        ctx.broadcast({ type: "plugin.event", plugin: "hello", greets: s.greets });
        return reply({ ok: true, greets: s.greets });
      }
      if (cmd === "roster") {
        const snap = snapshot();
        return reply({ ok: true, agentCount: snap.agentCount, agents: snap.agents });
      }
      return reply({ ok: false, msg: "unknown command: " + cmd });
    },

    // Custom HTTP routes live at /plugin/hello/<name>. The panel calls these.
    routes: {
      // GET /plugin/hello/state  → the live office snapshot for the panel.
      state(req, res) {
        res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(snapshot()));
      },
    },
  };
};
