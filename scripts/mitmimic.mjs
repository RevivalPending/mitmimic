// MITMIMIC: Mimic In The Middle Invisibly Mending Incorrect Content.

const CHANNEL = "module.mitmimic";

Hooks.once("init", () => console.log("mitmimic | init"));

Hooks.once("ready", () => {
  console.log("mitmimic | ready");

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
