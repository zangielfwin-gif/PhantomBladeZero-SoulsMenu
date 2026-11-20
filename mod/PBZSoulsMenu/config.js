"use strict";
const UE=require("ue"),puerts=require("puerts");
// Kept outside managed mod files so updates preserve personal settings.
const TEMPLATE=`; PBZ SoulsMenu 0.5.1 - UTF-8
; 修改后完全退出并重新启动游戏。Changes apply after restarting the game.
; true=开启/on, false=关闭/off. None=禁用该按键/disable binding.

[General]
Enabled=true
PauseGame=false
ShowNotifications=false

[Menu]
AllowInCombat=true
; 战斗中更换／卸下戒指和饰品。Requires AllowInCombat=true.
AllowAccessoryInCombat=true
AllowMovement=true
EscapeClosesAll=true
SwapMainWeaponSlots=true
SwapShadowWeaponSlots=true
HideDetailsByDefault=false
; 隐藏详情时的背景不透明度。0=完全透明，1=不透明。Opacity while details are hidden.
RightBackdropOpacity=0

[Weapons]
AutoSwitchSkill=true
FixedWeaponOrder=true

[Input]
; 左摇杆按下=L3, 右摇杆按下=R3. Supported gamepad buttons: L3 or R3.
ToggleDetailsGamepad=Gamepad_LeftThumbstick
ToggleDetailsKeyboard=F6
ToggleDetailsMouse=None
; 共用同一摇杆按键时：单按隐藏，按住+十字键排序。Tap hides; hold+D-pad sorts.
SortModifierGamepad=Gamepad_LeftThumbstick
; Control / Shift / Alt
SortModifierKeyboard=Control
; 左摇杆死区 0..0.95. Left-stick dead zone.
StickDeadZone=0.20
`;
const fields=[
    ["General","Enabled","enabled",true],
    ["General","PauseGame","noPause",false,"invert"],
    ["General","ShowNotifications","showNotifications",false],
    ["Menu","AllowInCombat","allowInCombat",true],
    ["Menu","AllowAccessoryInCombat","allowAccessoryInCombat",true],
    ["Menu","AllowMovement","allowMovement",true],
    ["Menu","EscapeClosesAll","escapeClosesAll",true],
    ["Menu","SwapMainWeaponSlots","swapMainWeaponSlots",true],
    ["Menu","SwapShadowWeaponSlots","swapShadowWeaponSlots",true],
    ["Menu","HideDetailsByDefault","hideDetailsByDefault",false],
    ["Menu","RightBackdropOpacity","rightBackdropOpacity",0,[0,1]],
    ["Weapons","AutoSwitchSkill","autoSwitchSkill",true],
    ["Weapons","FixedWeaponOrder","fixedWeaponOrder",true],
    ["Input","ToggleDetailsGamepad","detailsGamepadKey","Gamepad_LeftThumbstick","pad"],
    ["Input","ToggleDetailsKeyboard","detailsKeyboardKey","F6","key"],
    ["Input","ToggleDetailsMouse","detailsMouseButton","None","mouse"],
    ["Input","SortModifierGamepad","sortGamepadModifier","Gamepad_LeftThumbstick","pad"],
    ["Input","SortModifierKeyboard","sortKeyboardModifier","Control",["Control","Shift","Alt"]],
    ["Input","StickDeadZone","stickDeadZone",0.20,[0,0.95]]
];
function log(message){console.log("[PBZSoulsMenu] config "+message);}
function parse(text){
    const values=new Map();let section="";
    const known=new Set(fields.map(f=>(f[0]+"."+f[1]).toLowerCase()));
    for(let line of String(text).replace(/^\uFEFF/,"").split(/\r?\n/)){
        line=line.trim();if(!line||/^[;#]/.test(line))continue;
        const header=/^\[([A-Za-z]+)\]\s*(?:[;#].*)?$/.exec(line);
        if(header){section=header[1].toLowerCase();continue;}
        const pair=/^([A-Za-z][A-Za-z0-9]*)\s*=\s*(.*?)\s*(?:\s[;#].*)?$/.exec(line);
        if(!pair){log("ignored malformed line");continue;}
        const key=section+"."+pair[1].toLowerCase();
        if(!known.has(key)){log("ignored unknown setting: "+key);continue;}
        values.set(key,pair[2].trim());
    }
    return values;
}
function convert(raw,f){
    const def=f[3],rule=f[4];
    if(typeof def==="boolean"){
        if(/^(true|1|yes|on)$/i.test(raw))return true;
        if(/^(false|0|no|off)$/i.test(raw))return false;
        throw Error("expected true/false");
    }
    if(typeof def==="number"){
        const n=Number(raw);if(raw===""||!Number.isFinite(n)||n<rule[0]||n>rule[1])throw Error("number out of range");return n;
    }
    if(Array.isArray(rule)){
        const item=rule.find(s=>s.toLowerCase()===raw.toLowerCase());if(!item)throw Error("unsupported modifier");return item;
    }
    if(!raw||/^none$/i.test(raw))return "None";
    if(rule==="pad"&&!/^Gamepad_(Left|Right)Thumbstick$/.test(raw))throw Error("use L3 or R3 key name");
    if(rule==="key"&&!/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(raw))throw Error("invalid key name");
    if(rule==="mouse"&&!/^(MiddleMouseButton|ThumbMouseButton|ThumbMouseButton2)$/.test(raw))throw Error("unsupported mouse button");
    return raw;
}
let settingsPath="",values=new Map();
try{
    let dir=String(UE.KismetSystemLibrary.GetProjectSavedDirectory()||"");
    if(UE.BlueprintPathsLibrary&&typeof UE.BlueprintPathsLibrary.ConvertRelativePathToFull==="function")dir=String(UE.BlueprintPathsLibrary.ConvertRelativePathToFull(dir,""));
    if(!dir||/\/SaveGames(?:\/|$)/i.test(dir.replace(/\\/g,"/")))throw Error("invalid Saved directory");
    settingsPath=dir.replace(/\\/g,"/").replace(/\/+$/,"")+"/PBZSoulsMenu.cfg";
    const ref=puerts.$ref("");
    UE.EasyCsv.LoadStringFromLocalFile(settingsPath,ref);
    const text=String(puerts.$unref(ref)||"");
    const exists=!!(UE.BlueprintPathsLibrary&&UE.BlueprintPathsLibrary.FileExists&&UE.BlueprintPathsLibrary.FileExists(settingsPath));
    if(text.trim())values=parse(text);
    else if(!exists&&!UE.EasyCsv.SaveStringToFileWithFullPath(TEMPLATE,settingsPath))log("could not create settings file; defaults used");
    log("file="+settingsPath);
}catch(error){log("read failed; defaults used: "+String(error));}
const settings={settingsPath};
for(const f of fields){
    const key=(f[0]+"."+f[1]).toLowerCase();let value=f[3];
    if(values.has(key))try{value=convert(values.get(key),f);}catch(error){log("invalid "+f[0]+"."+f[1]+"; default used: "+error.message);}
    settings[f[2]]=f[4]==="invert"?!value:(value==="None"?"":value);
}
module.exports=settings;

