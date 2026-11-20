# MITMIMIC

**M**imic **I**n **T**he **M**iddle **I**nvisibly **M**ending **I**ncorrect **C**ontent.

Small fixes for dnd5e content that imports wrong or automates poorly. MITMIMIC works on top of
your own imported items, so your descriptions stay exactly as you imported them.

## Requirements

| | |
|---|---|
| Foundry VTT | v13 or v14 (verified on 14) |
| System | dnd5e 5.0.0 or newer |
| Module | [Midi-QOL](https://gitlab.com/tposney/midi-qol) |

## Install

In Foundry, open **Add-on Modules → Install Module** and paste this into **Manifest URL**:

```
https://github.com/RevivalPending/mitmimic/releases/latest/download/module.json
```

Then enable **MITMIMIC** in your world.

## Set up your characters

1. Open **Game Settings → Configure Settings → Module Settings**.
2. Find **MITMIMIC** and click **Patch** (GM only).
3. A message tells you how many characters were set up.

Run **Patch** again whenever you import or re-import characters. Finished characters stay as they are.

## What changes

### Triage Expert

- **Bedside Manner:** now adds one extra die to healing spells and drops the lowest one rolled.
- **Bedside Manner:** now applies to the Blood and Bone feature.
- **Blood and Bone:** now asks the target if they want to spend a Hit Die, and the roll benefits from Bedside Manner.
- **Blood and Bone:** now spends one use of the character's Healer's Kit.
- **Blood and Bone:** now links to a new Healer's Kit automatically when the character picks one up.

## Status

Early release (0.0.2). The **Patch** button sets up Triage Expert for your characters.

## Support and license

Report problems on the [issue tracker](https://github.com/RevivalPending/mitmimic/issues).
Released under the [MIT License](LICENSE).

Author: **!mimic**
