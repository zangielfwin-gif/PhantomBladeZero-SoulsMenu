# PBZ SoulsMenu — Combat Equipment Menus

**Change weapons and accessories during combat, with a menu that fits your controls.**

SoulsMenu brings a Dark Souls 3-inspired equipment-menu workflow to Phantom Blade Zero. Open the main-weapon or accessory list during combat, keep moving in an unpaused menu, and arrange your most-used weapons where you expect to find them.

## Features

- **Combat weapon and accessory changes.** Replace or unequip rings/accessories through the game's native interfaces. Slot unlocks, story locks, duplicate-equipment rules and accessory-type limits remain in effect.
- **Movement inside unpaused menus.** Use WASD or the left stick to move with the camera locked. Select menu items with the mouse or D-pad.
- **Current equipment on top.** Swap the current/backup UI positions for main and shadow weapons without changing their actual combat slot indices.
- **Hide the details panel.** Tap L3 and release, or press F6, to toggle right-hand details. The hidden backdrop defaults to fully transparent, with adjustable opacity.
- **Persistent weapon ordering.** Keep main/shadow weapon lists in a custom order. Use Ctrl+arrows or hold L3+D-pad to swap adjacent positions. Sorting does not also toggle the details panel.
- **Direct Esc exit.** Leave the entire menu with Esc from secondary main/shadow weapon selection.
- **Optional native equip/draw ability.** After replacing the current main weapon, request the native current-slot `.UI` ability once the menu closes and loading finishes. Native state restrictions still apply; backup weapons and accessories do not trigger it.

## Local configuration

Nineteen settings cover pausing, combat accessories, menu movement, slot mapping, the optional ability request, weapon ordering, bindings, backdrop opacity and stick dead zone. Green screen notifications are off by default.

The first launch creates:

```text
%LOCALAPPDATA%\ProjectPBZ\Saved\PBZSoulsMenu.cfg
```

Edit as UTF-8, then fully restart the game. Existing settings survive updates. Missing options in an older INI use the defaults. Combat accessories require both `AllowInCombat=true` and `AllowAccessoryInCombat=true` under `[Menu]`.

## Installation

Install **PBZModLoader** separately, then choose one archive:

- **Manual/Nexus:** merge `ProjectPBZ` from `PBZ_SoulsMenu-0.5.1-Nexus-Manual.zip` into the game directory.
- **Heybox:** import `PBZ_SoulsMenu-0.5.1-Heybox.zip`, enable and deploy with the PhantomBladeZero extension. The extension also checks its shared UE4SS prerequisite.

Exit the game before installing or updating, and restart afterward. Do not hot-reload this mod.

Target game build: Steam `26367565`. Game updates or other mods patching the same UI methods may prevent loading. Simulated checks do not replace in-game acceptance of accessory stats, effects and UI updates.

**Version 0.5.1 · zangielfwin-gif**

[Source and full instructions](https://github.com/zangielfwin-gif/PhantomBladeZero-SoulsMenu) · [Downloads](https://github.com/zangielfwin-gif/PhantomBladeZero-SoulsMenu/releases/tag/v0.5.1)
