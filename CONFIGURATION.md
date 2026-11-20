# 配置 / Configuration

文件：`%LOCALAPPDATA%/ProjectPBZ/Saved/PBZSoulsMenu.cfg`。首次启动时创建；也可提前复制包内 `settings.default.ini.example` 并改名。修改后完全退出并重新启动游戏。UTF-8；分号开头为注释；`true/false` 表示开关。已有文件不会被自动重写；新版本新增但未填写的项使用默认值。

| 分区 / Section | 配置项 / Key | 默认 / Default | 含义 / Meaning |
| --- | --- | --- | --- |
| General | Enabled | true | 整个 Mod 开关 / Master switch |
| General | PauseGame | false | 开菜单时暂停；关闭后恢复 / Pause menus |
| General | ShowNotifications | false | 绿色版本、排序及保存结果提示；关闭时仍记日志 / Onscreen notifications |
| Menu | AllowInCombat | true | 战斗中允许系统／主武器菜单；原有死亡、剧情等限制保留 / Allow combat menus |
| Menu | AllowAccessoryInCombat | true | 战斗中更换／卸下戒指和饰品，需 AllowInCombat=true；旧配置未填时默认开启 / Combat accessory swaps and unequip |
| Menu | AllowMovement | true | 不暂停菜单中 WASD／左摇杆移动；视角始终锁定 / Movement in unpaused menus |
| Menu | EscapeClosesAll | true | 二级主武器／影之武装菜单 Esc 直退 / Esc closes the whole weapon menu |
| Menu | SwapMainWeaponSlots | true | 主武器上下槽位映射对调 / Swap main weapon UI slots |
| Menu | SwapShadowWeaponSlots | true | 影之武装上下槽位映射对调 / Swap shadow weapon UI slots |
| Menu | HideDetailsByDefault | false | 启动后默认隐藏右侧详情 / Start with details hidden |
| Menu | RightBackdropOpacity | 0 | 详情隐藏时的背景不透明度，0..1；模糊同时关闭 / Backdrop opacity when hidden |
| Weapons | AutoSwitchSkill | true | 更换当前主武器并关菜单后，请求原生当前槽切换／拔刀能力 / Native current-slot ability request |
| Weapons | FixedWeaponOrder | true | 固定列表位置，允许手动排序与保存 / Persistent manual ordering |
| Input | ToggleDetailsGamepad | Gamepad_LeftThumbstick | 隐藏详情：L3=`Gamepad_LeftThumbstick`，R3=`Gamepad_RightThumbstick`，None=禁用 / Details button |
| Input | ToggleDetailsKeyboard | F6 | 隐藏详情键，使用 UE 键名（如 F6、C）；None=禁用 / Details keyboard key |
| Input | ToggleDetailsMouse | None | 可选 MiddleMouseButton、ThumbMouseButton、ThumbMouseButton2；None=禁用 / Optional mouse binding |
| Input | SortModifierGamepad | Gamepad_LeftThumbstick | 排序修饰键，支持 L3、R3 对应键名或 None；按住并按十字键 / Hold with D-pad to sort |
| Input | SortModifierKeyboard | Control | 排序修饰键：Control、Shift 或 Alt；配合方向键 / Keyboard sorting modifier |
| Input | StickDeadZone | 0.20 | 左摇杆径向死区，0..0.95 / Radial movement dead zone |

手柄隐藏键与排序修饰键相同时，单按在松开时切换详情，按住＋十字键只排序。即使在列表边缘未能移动，也不会误触隐藏。普通十字键继续选择物品。

键盘隐藏键不要设为 Escape、W/A/S/D 或现有菜单常用键，以免抢占它们。鼠标左／右键保留给菜单交互，不支持设置为隐藏键。

`PauseGame=true` 时 `AllowMovement` 不会让已暂停世界中的人物运动。`AutoSwitchSkill` 只对更换当前主武器有效，原生技能是否能激活仍由游戏状态决定。分类筛选共用同一排序的相对顺序。

Examples / 示例：

```ini
[General]
PauseGame=true

[Weapons]
AutoSwitchSkill=false

[Input]
ToggleDetailsKeyboard=C
SortModifierGamepad=Gamepad_RightThumbstick
```

只填写少量项也可，其余使用默认值。修改后重启游戏，查看新会话 loader.log 中 `config file=` 路径确认读取位置。无效项回退默认并记日志，原文件保留以便手动修正。


