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

## What changes

### Triage Expert

- **Bedside Manner:** now adds one extra die to healing spells and drops the lowest one rolled.
- **Bedside Manner:** now applies to the Blood and Bone feature.
- **Blood and Bone:** now asks the target if they want to spend a Hit Die, and the roll benefits from Bedside Manner.

## Status

Early release (0.0.1). For now, Triage Expert is set up by hand with a small tag. A tool to do
that for you is coming.

## Support and license

Report problems on the [issue tracker](https://github.com/RevivalPending/mitmimic/issues).
Released under the [MIT License](LICENSE).

Author: **!mimic**
