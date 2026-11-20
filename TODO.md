# MITMIMIC to-do

Known gaps and next steps. Tick them off as they land, and add a line to the README "What changes"
list for anything players will notice.

## Next up

- [ ] **Setup tool:** one button or macro that tags a DM's imported Triage Expert and sets up Blood and
  Bone for them. Today the tag is set by hand.
- [ ] **Tag the activity too:** match Blood and Bone by its own tag, so renaming the activity keeps working.
- [ ] **Healer's Kit:** have the setup tool link Blood and Bone to the character's Healer's Kit.
- [ ] **Re-apply after a D&D Beyond re-import:** the importer overwrites changes, so the tool should
  detect that and offer to patch the item again.
- [ ] **DM install test:** install from the manifest link on a fresh world and confirm it loads.

## To test

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
