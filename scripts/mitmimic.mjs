// MITMIMIC: Mimic In The Middle Invisibly Mending Incorrect Content.

const CHANNEL = "module.mitmimic";

Hooks.once("init", () => {
  console.log("mitmimic | init");

  // Settings button: Configure Settings -> Module Settings -> MITMIMIC -> "Patch".
  // Foundry opens a menu with `new type().render(true)`, so this class runs the patch in render()
  // and opens no window: one click, one notification. This reserves the menu spot.
  //
  // FUTURE ME: the plan is to replace this with a real window, a file-tree style list of checkboxes
  // (broad categories that expand down to individual items) so the DM can pick exactly what to patch.
  // Keep patchWorld() free of UI so that window can call it with a list of chosen items. See TODO.md.
  class PatchMenu extends foundry.applications.api.ApplicationV2 {
    async render() {
      await patchWorld();
      return this;
    }
  }

  game.settings.registerMenu("mitmimic", "patch", {
    name: "MITMIMIC",
    label: "Patch",
    hint: "Tags every character's Triage Expert so MITMIMIC's fixes apply. Safe to run again, for example after a D&D Beyond re-import.",
    icon: "fa-solid fa-wrench",
    type: PatchMenu,
    restricted: true // GM only
  });
});

/**
 * Set up Triage Expert on every world character:
 *   1. tag the feat (flags.mitmimic.bedsideManner)
 *   2. make sure it has a "Blood and Bone" activity (the D&D Beyond import usually has one)
 *   3. make that activity spend 1 use of the character's Healer's Kit
 * Safe to run again: anything already done is left alone. dnd5e itself blocks the activity with a
 * message when the kit is out of uses or missing, so no extra check is needed here.
 * Returns a summary object so a future window can show it.
 */
async function patchWorld() {
  const summary = { changed: [], alreadyDone: [], noKit: [], kitNoUses: [], failed: [] };

  for (const actor of game.actors) {
    const item = actor.items.find(i => i.type === "feat" && i.name === "Triage Expert");
    if (!item) continue;

    try {
      let changed = false;

      // 1. tag
      if (!item.getFlag("mitmimic", "bedsideManner")) {
        await item.setFlag("mitmimic", "bedsideManner", true);
        changed = true;
      }

      // 2. activity (create a plain Utility activity if the import left it out)
      let activity = item.system.activities?.find(a => a.name === "Blood and Bone");
      if (!activity) {
        await item.createActivity("utility", {
          name: "Blood and Bone",
          activation: { type: "action", value: 1 },
          range: { value: "5", units: "ft" },
          target: { prompt: true, affects: { count: "1", type: "creature" } }
        }, { renderSheet: false });
        activity = item.system.activities.find(a => a.name === "Blood and Bone");
        changed = true;
      }

      // 3. consumption: 1 use of this character's Healer's Kit
      const link = await linkKit(actor, item, activity);
      if (link.status === "noKit") summary.noKit.push(actor.name);
      if (link.kitNoUses) summary.kitNoUses.push(actor.name);
      if (link.status === "linked") changed = true;

      (changed ? summary.changed : summary.alreadyDone).push(actor.name);
    } catch (err) {
      console.error(`mitmimic | patch failed for ${actor.name}`, err);
      summary.failed.push(actor.name);
    }
  }

  const list = names => names.join(", ");
  const lines = [`MITMIMIC: patched ${summary.changed.length}, already set up ${summary.alreadyDone.length}.`];
  if (summary.noKit.length) lines.push(`No Healer's Kit found: ${list(summary.noKit)}.`);
  if (summary.kitNoUses.length) lines.push(`Healer's Kit has no uses set: ${list(summary.kitNoUses)}.`);
  if (summary.failed.length) lines.push(`Failed (see console): ${list(summary.failed)}.`);
  const level = summary.failed.length ? "error" : (summary.noKit.length || summary.kitNoUses.length) ? "warn" : "info";
  ui.notifications[level](lines.join(" "));
  console.log("mitmimic | patch summary", summary);
  return summary;
}

const KIT_NAME = /^healer.?s kit/i;

/**
 * Point Blood and Bone at the actor's Healer's Kit (1 use per activation).
 * Drops item-uses targets whose item no longer exists (a kit that was used up or replaced): a dead
 * target blocks every use with "missing item". This only runs when a kit exists. With no kit the old
 * target stays, so Blood and Bone keeps blocking until the character has one.
 * Returns { status: "linked" | "already" | "noKit", kitNoUses }.
 */
async function linkKit(actor, feat, activity) {
  const kit = actor.items.find(i => KIT_NAME.test(i.name));
  if (!kit) return { status: "noKit", kitNoUses: false };
  const kitNoUses = !kit.system.uses?.max;

  const existing = activity.consumption.targets.map(t => t.toObject());
  const live = existing.filter(t => !(t.type === "itemUses" && t.target && !actor.items.has(t.target)));
  const linked = live.some(t => t.type === "itemUses" && t.target === kit.id);
  if (linked && live.length === existing.length) return { status: "already", kitNoUses };

  if (!linked) live.push({ type: "itemUses", target: kit.id, value: "1" });
  await feat.updateActivity(activity.id, { consumption: { targets: live } });
  return { status: "linked", kitNoUses };
}

Hooks.once("ready", () => {
  console.log("mitmimic | ready");

  /* ------------------------------------------------------------------ */
  /*  Healer's Kit added: relink Blood and Bone                          */
  /* ------------------------------------------------------------------ */

  // When a character with a tagged Triage Expert receives a Healer's Kit, relink Blood and Bone to it.
  // Only characters the DM already patched are touched. Only the active GM's browser runs this, so it
  // happens once per kit.
  Hooks.on("createItem", async (item) => {
    if (game.users.activeGM?.id !== game.user.id) return;
    const actor = item.parent;
    if (!actor?.items || !KIT_NAME.test(item.name)) return;

    const feat = actor.items.find(i => i.type === "feat" && i.getFlag("mitmimic", "bedsideManner"));
    const activity = feat?.system.activities?.find(a => a.name === "Blood and Bone");
    if (!activity) return;

    try {
      const link = await linkKit(actor, feat, activity);
      if (link.status === "linked") ui.notifications.info(`MITMIMIC: Blood and Bone now uses ${actor.name}'s new Healer's Kit.`);
    } catch (err) {
      console.error(`mitmimic | relink failed for ${actor.name}`, err);
    }
  });

  /* ------------------------------------------------------------------ */
  /*  Triage Expert / Bedside Manner: magic healing                      */
  /* ------------------------------------------------------------------ */

  // When a healer with the tagged feature heals with a spell, roll one extra die and drop
  // the lowest (2d8 + 3  ->  3d8dl + 3). Runs just before any damage or healing roll.
  Hooks.on("dnd5e.preRollDamageV2", (config) => {
    const activity = config.subject;
    if (activity?.type !== "heal") return;       // healing only
    if (activity.item?.type !== "spell") return; // "magic" (rough test)

    const tagged = activity.actor?.items.some(i => i.getFlag("mitmimic", "bedsideManner"));
    if (!tagged) return;

    for (const roll of config.rolls ?? []) {
      if (!roll.parts?.[0]) continue;
      roll.parts[0] = roll.parts[0].replace(/^(\d+)(d\d+)/, (m, n, d) => `${+n + 1}${d}dl`);
    }
  });

  /* ------------------------------------------------------------------ */
  /*  Triage Expert / Bedside Manner: Blood and Bone (Hit Die)           */
  /* ------------------------------------------------------------------ */

  // Hook B: a Hit Die roll that carries our key gets one extra die, drop the lowest.
  // The formula looks like  max(1, 1d8 + @abilities.con.mod)  ->  max(1, 2d8dl + @abilities.con.mod)
  Hooks.on("dnd5e.preRollHitDieV2", (config) => {
    if (!config.mitmimic?.bedsideManner) return;
    for (const roll of config.rolls ?? []) {
      if (!roll.parts?.[0]) continue;
      roll.parts[0] = roll.parts[0].replace(/1(d\d+)/, "2$1dl");
    }
  });

  // Hook A: when Blood and Bone finishes, offer each target a Hit Die.
  Hooks.on("midi-qol.RollComplete", async (workflow) => {
    const item = workflow.item;
    if (!item?.getFlag("mitmimic", "bedsideManner")) return;
    if (workflow.activity?.name !== "Blood and Bone") return;

    const healer = workflow.actor?.name ?? "Someone";
    for (const token of workflow.targets ?? []) {
      const actor = token.actor;
      if (!actor) continue;
      const user = recipientFor(actor);
      if (!user) continue;
      if (user.id === game.user.id) await promptHitDie(actor.uuid, healer);
      else game.socket.emit(CHANNEL, { type: "hitDiePrompt", userId: user.id, actorUuid: actor.uuid, healer });
    }
  });

  // The prompt runs on the browser of whoever owns the target (needs "socket": true in module.json).
  game.socket.on(CHANNEL, (msg) => {
    if (msg?.type === "hitDiePrompt" && msg.userId === game.user.id) promptHitDie(msg.actorUuid, msg.healer);
  });
});

/** An active non-GM owner of the actor if there is one, otherwise the active GM. */
function recipientFor(actor) {
  const owner = game.users.find(u => u.active && !u.isGM && actor.testUserPermission(u, "OWNER"));
  return owner ?? game.users.activeGM;
}

/** Hit Die sizes the actor still has available, e.g. ["d8", "d6"]. */
function availableDice(actor) {
  const hd = actor.system.attributes.hd;
  if (actor.system.isNPC) return hd.value ? [`d${hd.denomination}`] : [];
  const sizes = hd.classes.filter(c => c.system.hd.value).map(c => c.system.hd.denomination);
  return [...new Set(sizes)];
}

/** Ask the player whether to spend a Hit Die, then roll it with the Bedside Manner key. */
async function promptHitDie(actorUuid, healer) {
  const actor = await fromUuid(actorUuid);
  if (!actor) return;
  const dice = availableDice(actor);
  if (!dice.length) return ui.notifications.warn(`${actor.name} has no Hit Dice left.`);

  const choice = await foundry.applications.api.DialogV2.wait({
    window: { title: "Blood and Bone" },
    content: `<p>${healer} patched up ${actor.name}. Spend a Hit Die to recover?</p>`,
    buttons: [
      ...dice.map(d => ({ action: d, label: `Roll ${d}` })),
      { action: "no", label: "No thanks" }
    ],
    rejectClose: false
  });
  if (!choice || choice === "no") return;

  await actor.rollHitDie({ denomination: choice, mitmimic: { bedsideManner: true } });
}
