"use strict";
const config=require("./config");
if(!config.enabled){
    console.log("[PBZSoulsMenu] v0.5.1 disabled in PBZSoulsMenu.cfg");
    exports.stop=function(){};
}else{
console.log("[PBZSoulsMenu] v0.5.1 loader entry reached");
const runtime = require("./runtime");
const controls = require("./controls");
const ordering = require("./order");
const switchSkill = require("./switchskill");
const UE = require("ue");
const puerts = require("puerts");
const character = require("UI/Widget/Character_V2").CharacterUI_V2MixinInterface.prototype;
const page = require("UI/Widget/Character_V3").CharacterUI_V3MixinInterface.prototype;
const system = require("UI/Widget/SystemBase").SystemBaseMixinInterface.prototype;
const player = require("Gameplay/RenewalPlayer").RenewalPlayerinXinInterface.prototype;
const combat = require("./combat");
const features = require("./features");
const accessories = require("./accessories");
const combatAccessories=config.allowInCombat!==false&&config.allowAccessoryInCombat!==false;
const gameplay = require("Gameplay/UIGameplayLogicComponent").uiGameplayLogicMixinInterface.prototype;
const mandatory = [[character,"BP_FirstInitWidget"],[character,"BP_InitWidget"],[character,"Tick"],
    [character,"FinishCurrentWidget"],[character,"ClickWeapon"],[system,"TsConstruct"],
    [system,"TsDestruct"],[player,"BeforePushSystemV1"],[player,"PushSystemUI"],
    [gameplay,"activateSwitchAbilityAndScheduleCooldownReset"],[gameplay,"ReceiveEndPlay"]];
for (const [target,name] of mandatory) {
    const d=Object.getOwnPropertyDescriptor(target,name);
    if (!d || typeof d.value!=="function" || !d.configurable)
        throw Error("PBZSoulsMenu: required method unavailable: "+name+"; nothing installed");
}
for(const name of Object.keys(features.expected)){
    const d=Object.getOwnPropertyDescriptor(character,name);
    if(!d||!d.configurable||Function.prototype.toString.call(d.value).replace(/\r\n/g,"\n")!==features.expected[name])
        throw Error("PBZSoulsMenu: game method differs: "+name+"; nothing installed");
}
if(combatAccessories)for(const name of Object.keys(accessories.expected)){
    const d=Object.getOwnPropertyDescriptor(character,name);
    if(!d||!d.configurable||Function.prototype.toString.call(d.value).replace(/\r\n/g,"\n")!==accessories.expected[name])
        throw Error("PBZSoulsMenu: accessory method differs: "+name+"; nothing installed");
}
if (globalThis.__PBZSoulsMenuV02 || globalThis.__PBZSoulsMenuV03 || globalThis.__PBZSoulsMenuV031 || globalThis.__PBZSoulsMenuV032 || globalThis.__PBZSoulsMenuV04 || globalThis.__PBZSoulsMenuV05) throw Error("PBZSoulsMenu: already installed; restart required");
const patches=[];
function replace(target,name,value) {
    const old=Object.getOwnPropertyDescriptor(target,name);
    if (old && !old.configurable) throw Error("PBZSoulsMenu: locked method "+name);
    patches.push([target,name,old]);
    Object.defineProperty(target,name,{configurable:true,writable:true,value});
}
function wrap(target,name,callback) {
    const original=target[name];
    replace(target,name,function(...args){return callback.call(this,original,args);});
}
function inputs(target) {
    for(const name of ["OnPreviewKeyDown","OnKeyDown"]) {
        const original=target[name];
        replace(target,name,function(geometry,event) {
            if(runtime.key(this,event)||controls.key(this,event,true)) return UE.WidgetBlueprintLibrary.Handled();
            return typeof original==="function" ? original.call(this,geometry,event) : UE.WidgetBlueprintLibrary.Unhandled();
        });
    }
    for(const [name,handler] of [["OnKeyUp",(o,e)=>runtime.keyUp(o,e)||controls.key(o,e,false)],["OnAnalogValueChanged",(o,e)=>controls.analog(o,e)]]) {
        const original=target[name];
        replace(target,name,function(geometry,event){
            if(handler(this,event))return UE.WidgetBlueprintLibrary.Handled();
            return typeof original==="function"?original.call(this,geometry,event):UE.WidgetBlueprintLibrary.Unhandled();
        });
    }
    const removed=target.OnRemovedFromFocusPath;
    replace(target,"OnRemovedFromFocusPath",function(event){
        if(controls.owns(this)){controls.clear();runtime.clearHeld();}
        if(typeof removed==="function")return removed.call(this,event);
    });
    for(const name of ["OnPreviewMouseButtonDown","OnMouseButtonDown"]) {
        const original=target[name];
        replace(target,name,function(geometry,event) {
            if(runtime.mouse(this,event)) return UE.WidgetBlueprintLibrary.Handled();
            return typeof original==="function" ? original.call(this,geometry,event) : UE.WidgetBlueprintLibrary.Unhandled();
        });
    }
}
try {
    for(const name of Object.keys(features.expected))replace(character,name,features.replacement[name]);
    if(combatAccessories){
        for(const name of Object.keys(accessories.expected))replace(character,name,accessories.replacement[name]);
        console.log("[PBZSoulsMenu] combat accessory entry and accessory-only unequip installed");
    }
    wrap(gameplay,"activateSwitchAbilityAndScheduleCooldownReset",function(original,args){
        if(!switchSkill.gate(this,original))return original.apply(this,args);
    });
    wrap(gameplay,"ReceiveEndPlay",function(original,args){switchSkill.endPlay(this);return original.apply(this,args);});
    wrap(character,"BP_FirstInitWidget",function(original,args){
        runtime.swapSlots(this);
        runtime.swapShaChiSlots(this);
        return original.apply(this,args);
    });
    wrap(character,"BP_InitWidget",function(original,args){
        runtime.swapSlots(this);
        runtime.swapShaChiSlots(this);
        const result=original.apply(this,args);
        runtime.beginCharacter(this);
        return result;
    });
    wrap(character,"Tick",function(original,args){
        const result=original.apply(this,args);
        runtime.tickCharacter(this,args[1]);
        return result;
    });
    wrap(character,"FinishCurrentWidget",function(original,args){
        runtime.endCharacter(this);
        return original.apply(this,args);
    });
    wrap(system,"TsConstruct",function(original,args){
        const result=original.apply(this,args);
        runtime.beginSystem(this);
        return result;
    });
    wrap(system,"TsDestruct",function(original,args){
        runtime.endSystem(this);
        return original.apply(this,args);
    });
    wrap(player,"PushSystemUI",function(original,args){
        runtime.beforeOpen(this);
        return original.apply(this,args);
    });
    wrap(player,"BeforePushSystemV1",function(original,args){
        runtime.beforePush(args[0]);
        return original.apply(this,args);
    });
    replace(system,"BP_GetDesiredInputConfig",function(){return controls.desiredConfig(this);});
    replace(player,"CanOpenSystemUI",function(CanOpen){
        const allowed=runtime.canOpen(this);
        if(CanOpen!==undefined && CanOpen!==null) puerts.$set(CanOpen,allowed);
        return allowed;
    });
    // Avoid replacing the whole character script. Only replace this entry method
    // if its runtime source matches the stock method this package was built from.
    const oldClick=Function.prototype.toString.call(character.ClickWeapon).replace(/\r\n/g,"\n");
    if(config.allowInCombat!==false&&oldClick===combat.expected.replace(/\r\n/g,"\n")) {
        replace(character,"ClickWeapon",combat.replacement);
        console.log("[PBZSoulsMenu] combat weapon-list entry installed");
    } else if(config.allowInCombat!==false){
        console.warn("[PBZSoulsMenu] combat weapon-list entry skipped: runtime source differs; other features remain installed; source prefix="+oldClick.slice(0,160));
    }
    inputs(character); inputs(page); inputs(system);
    globalThis.__PBZSoulsMenuV05=true;
} catch(error) {
    for(const [target,name,old] of patches.reverse()) {
        if(old) Object.defineProperty(target,name,old); else delete target[name];
    }
    throw error;
}
exports.stop=function(){throw Error("PBZSoulsMenu modifies engine mixin dispatch; disable and restart the game, do not hot-reload.");};
console.log("[PBZSoulsMenu] v0.5.1 installed; mode="+(runtime.noPause?"NoPause":"Paused")+"; original game scripts preserved");
}

