# PBZ SoulsMenu — 影之刃零魂式菜单

![PBZ SoulsMenu 宣传海报](https://raw.githubusercontent.com/zangielfwin-gif/PhantomBladeZero-SoulsMenu/main/docs/media/SoulsMenu-0.5.1-Poster.png)

[中文发布介绍](https://github.com/zangielfwin-gif/PhantomBladeZero-SoulsMenu/blob/main/docs/publishing/INTRO_ZH.md) · [English introduction](https://github.com/zangielfwin-gif/PhantomBladeZero-SoulsMenu/blob/main/docs/publishing/INTRO_EN.md) · [小黑盒短介绍](https://github.com/zangielfwin-gif/PhantomBladeZero-SoulsMenu/blob/main/docs/publishing/HEYBOX_INTRO.txt)

**0.5.1：支持战斗中更换、卸下戒指／饰品。** 主武器菜单、菜单内移动、详情隐藏和固定排序均可通过本地 INI 配置。

Configurable combat equipment menus for **Phantom Blade Zero**, including combat accessory replacement and unequip. Requires **PBZModLoader**, installed separately. Built against Steam game build **26367565**.

[下载 0.5.1 / Downloads](https://github.com/zangielfwin-gif/PhantomBladeZero-SoulsMenu/releases/tag/v0.5.1) · [全部配置 / Configuration](CONFIGURATION.md) · [更新记录 / Changelog](CHANGELOG.md)

## 安装 / Installation

只安装以下两种包中的一个 / Choose one archive:

| 安装方式 | 文件 | 操作 |
| --- | --- | --- |
| Nexus 手动安装 | `PBZ_SoulsMenu-0.5.1-Nexus-Manual.zip` | 把 `ProjectPBZ` 合并到游戏根目录，根目录内有 `platform/steam/PBZ.exe` |
| 小黑盒 Heybox | `PBZ_SoulsMenu-0.5.1-Heybox.zip` | 使用 PhantomBladeZero 扩展导入、启用并部署 |

最终文件应位于 `ProjectPBZ/PBZModLoader/mods/PBZSoulsMenu/main.js`。

先安装 PBZModLoader 前置，退出游戏后安装或更新，再重新启动游戏。小黑盒扩展还会统一检查 UE4SS 前置；本 Mod 本身使用 PBZModLoader。包内不含加载器 DLL。不要使用 Alt+F5 热重载，本 Mod 的引擎分发修改需要完整重启游戏。

Manual install: merge `ProjectPBZ` from the Nexus archive into the game directory. Heybox: import the Heybox archive, enable and deploy. Install PBZModLoader separately and fully restart the game after changes. Both archives contain the same mod payload; do not enable both.

## 功能 / Features

- 战斗中进入主武器和戒指／饰品菜单，允许原生更换及饰品卸下。饰品槽位锁、剧情锁和同类数量上限继续生效。
- 菜单暂停可选。不暂停时用 WASD／左摇杆移动，视角锁定；用鼠标／十字键选择菜单物品。
- 主武器及影之武装的当前／备用槽位在菜单中上下对调，不修改战斗中的实际槽位索引。
- 菜单中单按 L3（松开时生效）或按 F6 隐藏／显示右侧详情，隐藏时默认背景完全透明。
- 二级主武器／影之武装菜单中，Esc 直接退出整个菜单。
- 更换当前主武器后，关菜单并等待武器加载完成时，请求原生当前槽 `.UI` 切换／拔刀能力。备用武器和饰品不会触发该能力。
- 主武器、影之武装二级列表保持固定顺序；Ctrl＋方向键或按住 L3＋十字键手动交换相邻位置，排序会保存。组合键不会误触隐藏。
- 绿色屏幕说明默认关闭；诊断信息继续记录到日志。

Combat accessories use the original equip/unequip APIs and retain the game's slot, story and accessory-type restrictions. The optional current-weapon `.UI` ability request respects native ability restrictions; it does not force an attack. Fixed ordering applies to main/shadow weapon lists.

## 本地配置 / Local settings

首次启动会自动创建：

```text
%LOCALAPPDATA%\ProjectPBZ\Saved\PBZSoulsMenu.cfg
```

完全退出游戏，用记事本以 UTF-8 编辑，保存后重新启动。**19 项配置**包括功能开关、按键、透明度与摇杆死区。缺少的项使用默认值；已有 INI 不会被更新覆盖。可提前复制包内 `settings.default.ini.example` 到上述位置，并改名为 `PBZSoulsMenu.cfg`。

```ini
[General]
PauseGame=false
ShowNotifications=false

[Menu]
AllowInCombat=true
AllowAccessoryInCombat=true

[Weapons]
AutoSwitchSkill=true
```

`AllowAccessoryInCombat` 需要 `AllowInCombat=true`。旧版 INI 不含新项时，战斗饰品换装默认开启。`Enabled=false` 可在下次启动时停用全部 SoulsMenu 修改。

Settings are loaded once at startup. Edit the external INI and restart the game. [CONFIGURATION.md](CONFIGURATION.md) lists all 19 settings and valid values.

个人排序单独保存到 `Saved/PBZSoulsMenu-weapon-order-v1.json`，由本机不同存档共用；Mod 不修改游戏存档。

## 卸载 / Uninstall

使用小黑盒安装的版本，在小黑盒中停用并卸载。手动安装的版本，退出游戏后只移除 `ProjectPBZ/PBZModLoader/mods/PBZSoulsMenu`。保留共用加载器和其他 Mod。个人 INI 与排序文件默认保留；需要恢复默认时，关闭游戏后将它们改名。

Use the manager that installed the mod, or remove only the `PBZSoulsMenu` mod directory for a manual install. Shared loader files and personal settings remain.

## 兼容与检查 / Compatibility and validation

支持目标为 Steam build `26367565`。修改前会核对原版游戏方法；游戏更新或修改同一 UI 方法的其他 Mod 可能导致加载被拒绝。

日志：`ProjectPBZ/PBZModLoader/evidence/<session>/loader.log`。搜索 `[PBZSoulsMenu]`、`v0.5.1 installed`、`combat accessory entry` 和 `config file=`；加载失败时搜索 `failed PBZSoulsMenu`。配置实际路径以引擎日志为准。

开发阶段通过了 188 项模拟游戏逻辑回归、11 项配置检查和 9 项小黑盒扩展契约／部署检查。模拟检查不等于 Unreal Engine 内所有行为已实测；战斗换装后的属性、效果及界面同步应在游戏内验收。

The archive classification and deployment paths were checked against the [Heybox PhantomBladeZero extension](https://github.com/xiaoheihe-lab/heybox-mod-extensions/blob/main/dist/PhantomBladeZero/index.cjs). Reference details are in [docs/HEYBOX_REFERENCE.md](https://github.com/zangielfwin-gif/PhantomBladeZero-SoulsMenu/blob/main/docs/HEYBOX_REFERENCE.md). The Heybox UI was not automated.

## 从源码打包 / Build from source

需要 Python 3.10+ 和 Node.js 18+，不需要下载游戏资源或第三方 npm 包。

```text
npm test
python scripts/build.py
node scripts/check-heybox.cjs /path/to/PhantomBladeZero/index.cjs
```

两个安装包输出到 `dist/`。`mod/PBZSoulsMenu` 中的文件是可发布的完整 Mod 源码；校验用游戏原始方法签名已包含在补丁模块中。仓库不含完整游戏脚本导出、DLL、个人配置、存档或本机安装记录。
