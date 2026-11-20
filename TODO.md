# MITMIMIC to-do

Known gaps and next steps. Tick them off as they land, and add a line to the README "What changes"
list for anything players will notice.

## Next up

- [ ] **Kit chooser (idea):** a dialog at use time to pick which Healer's Kit to spend when a character
  has several, skipped when there is only one. Needs a check of dnd5e and Midi hook timing first.
- [ ] **Tag the activity too:** match Blood and Bone by its own tag, so renaming the activity keeps working.
- [ ] **Re-apply after a D&D Beyond re-import:** the importer overwrites changes, so the tool should
  detect that and offer to patch the item again.
- [ ] **DM install test:** install from the manifest link on a fresh world and confirm it loads.
- [ ] **Patch window (planned upgrade of the settings button):** today the **Patch** button in
  Module Settings patches everything in one click. Replace it with a file-tree style window: broad
  categories (for example a feature such as Triage Expert) that expand down to individual characters or
  items, each with a checkbox, so the DM controls exactly what gets patched. Expect this module to grow
  complicated, so design it for many fixes. `patchWorld()` and `linkKit()` in `scripts/mitmimic.mjs` are
  the parts to reuse.

## To test

- [ ] Patch with a stale Blood and Bone link (the kit was deleted and a new one exists): the dead target is dropped.
- [ ] A Healer's Kit added through the bridge relinks the same way as one dragged onto the sheet.
- [ ] Patch on a D&D Beyond re-import, with and without a Healer's Kit.
- [ ] A Healer's Kit with auto-destroy off at 0 uses: Blood and Bone blocks with a "no uses left" message.
- [ ] The "No Healer's Kit found" warning text appears when Patch meets a character without a kit.
- [ ] Healing spells cast at a higher level (the extra die on a scaled formula).
- [ ] Heal formulas that begin with something other than plain dice, such as `@mod + 2d8`.
- [ ] Blood and Bone on an NPC target, on an unlinked token, and on a target with no Hit Dice left.
- [ ] Blood and Bone when the target's owner is offline (the popup goes to the GM).
- [ ] Targets owned by more than one player.
- [ ] A fresh install with only the required modules enabled.

## To verify

Check that each of these works the way the rules describe, and note what needs fixing.

- [ ] **Install from the repo:** use Foundry's Install Module dialog with the manifest link (not the local copy).
- [ ] **Caltrops**
- [ ] **Ball Bearings**
- [ ] **Bardic Inspiration**
- [ ] **Combat Inspiration**
- [ ] **Hide**
- [ ] **Shove**
- [ ] **Grapple**
- [ ] **Grant's spell list:** each unique D&D spell on it.

## Ideas

- [ ] Count more than spells as "magic": magic items and class features that heal.
- [ ] Set a minimum Midi-QOL version once more versions have been tested (tested on 14.0.11 so far).
- [ ] Split `scripts/mitmimic.mjs` into one file per fix under `scripts/features/` when the second fix arrives.
- [ ] Add an author link to `module.json`.
- [ ] Publish releases from a GitHub workflow so each tag builds its own `module.zip`.
- [ ] More fixes for imported content, added one at a time.

## Done

- [x] Bedside Manner on healing spells.
- [x] Blood and Bone Hit Die prompt with Bedside Manner.
- [x] Release 0.0.1 published with working manifest and download links.
- [x] **Patch button** in Module Settings (GM only): tags Triage Expert, adds Blood and Bone if missing, and
  links it to the character's Healer's Kit. Re-running leaves finished characters alone. Tested on Zanoba,
  Zanoba2 and Dusten.
- [x] **Kit relinking:** Patch drops Blood and Bone links to a deleted kit, and a new Healer's Kit added to a
  tagged character is linked automatically. Tested on Dusten.

## Decisions

- Blood and Bone spends the Healer's Kit use even when the target has no Hit Dice left. The healer cannot
  know that beforehand, so this stays as is. The target's owner sees a "no Hit Dice left" warning.
- Characters without a Healer's Kit can still use Blood and Bone until a kit is linked (Patch lists them).
  A used-up kit that was deleted keeps blocking the activity until a new kit arrives.
