const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const file=path.join(__dirname,'../mod/PBZSoulsMenu/config.js'),source=fs.readFileSync(file,'utf8');
const results=[];function test(name,fn){fn();results.push('PASS '+name);}
function load(text,{saveFail=false,readThrow=false,exists}={}){
    const logs=[],writes=[];let saved=text;
    const UE={KismetSystemLibrary:{GetProjectSavedDirectory:()=> 'X:/User/Saved'},BlueprintPathsLibrary:{FileExists:()=>exists===undefined?saved!==undefined:exists},EasyCsv:{LoadStringFromLocalFile(p,r){if(readThrow)throw Error('read failed');if(saved===undefined)return false;r.value=saved;return true;},SaveStringToFileWithFullPath(t,p){writes.push({t,p});if(saveFail)return false;saved=t;return true;}}};
    const puerts={$ref:value=>({value}),$unref:r=>r.value},module={exports:{}};
    vm.runInNewContext('(function(module,require,console){'+source+'\n})') (module,id=>id==='ue'?UE:puerts,{log:s=>logs.push(s)});
    return {cfg:module.exports,logs,writes,get text(){return saved;}};
}
test('first launch creates a UTF-8 CFG in Saved and retains accepted defaults',()=>{
    const s=load();assert.equal(s.writes.length,1);assert.equal(s.cfg.settingsPath,'X:/User/Saved/PBZSoulsMenu.cfg');
    assert.equal(s.cfg.enabled,true);assert.equal(s.cfg.noPause,true);assert.equal(s.cfg.showNotifications,false);assert.equal(s.cfg.allowAccessoryInCombat,true);
    assert.equal(s.cfg.detailsGamepadKey,'Gamepad_LeftThumbstick');assert.equal(s.cfg.detailsMouseButton,'');
    assert(s.text.includes('[Weapons]'));assert(s.text.includes('ShowNotifications=false'));
});
test('an existing file is read without being rewritten',()=>{const s=load('[General]\nPauseGame=true\n[Weapons]\nAutoSwitchSkill=false');assert.equal(s.writes.length,0);assert.equal(s.cfg.noPause,false);assert.equal(s.cfg.autoSwitchSkill,false);});
test('old INI files enable combat accessories by default while an explicit opt-out survives reload',()=>{
    const old=load('[Menu]\nAllowInCombat=true\nAllowMovement=false');assert.equal(old.cfg.allowAccessoryInCombat,true);assert.equal(old.cfg.allowMovement,false);assert.equal(old.writes.length,0);
    const off=load('[Menu]\nAllowInCombat=true\nAllowAccessoryInCombat=false');assert.equal(off.cfg.allowAccessoryInCombat,false);assert.equal(off.cfg.allowInCombat,true);assert.equal(off.writes.length,0);
});
test('all feature flags and independent bindings can be edited together',()=>{
    const s=load('[General]\nEnabled=false\nPauseGame=on\nShowNotifications=yes\n[Menu]\nAllowInCombat=false\nAllowMovement=false\nEscapeClosesAll=false\nSwapMainWeaponSlots=false\nSwapShadowWeaponSlots=false\nHideDetailsByDefault=true\nRightBackdropOpacity=0.65\n[Weapons]\nAutoSwitchSkill=false\nFixedWeaponOrder=false\n[Input]\nToggleDetailsGamepad=Gamepad_RightThumbstick\nToggleDetailsKeyboard=C\nToggleDetailsMouse=MiddleMouseButton\nSortModifierGamepad=None\nSortModifierKeyboard=Alt\nStickDeadZone=0');
    for(const k of ['enabled','noPause','allowInCombat','allowMovement','escapeClosesAll','swapMainWeaponSlots','swapShadowWeaponSlots','autoSwitchSkill','fixedWeaponOrder'])assert.equal(s.cfg[k],false,k);
    assert.equal(s.cfg.showNotifications,true);assert.equal(s.cfg.hideDetailsByDefault,true);assert.equal(s.cfg.rightBackdropOpacity,0.65);assert.equal(s.cfg.stickDeadZone,0);assert.equal(s.cfg.detailsGamepadKey,'Gamepad_RightThumbstick');assert.equal(s.cfg.detailsKeyboardKey,'C');assert.equal(s.cfg.detailsMouseButton,'MiddleMouseButton');assert.equal(s.cfg.sortGamepadModifier,'');assert.equal(s.cfg.sortKeyboardModifier,'Alt');
});
test('BOM, CRLF, mixed case, inline comments and partial settings are accepted',()=>{
    const s=load('\uFEFF[general]\r\npausegame = TRUE ; pause menus\r\n[input]\r\nsortmodifierkeyboard=shift\r\n');assert.equal(s.cfg.noPause,false);assert.equal(s.cfg.sortKeyboardModifier,'Shift');assert.equal(s.cfg.autoSwitchSkill,true);
});
test('invalid values fall back individually and preserve the original file',()=>{
    const text='[General]\nEnabled=banana\nPauseGame=true\n[Menu]\nRightBackdropOpacity=900\n[Input]\nStickDeadZone=NaN\nToggleDetailsGamepad=Gamepad_FaceButton_Bottom\nToggleDetailsMouse=LeftMouseButton\nSortModifierKeyboard=Meta\nUnknown=7';
    const s=load(text);assert.equal(s.cfg.enabled,true);assert.equal(s.cfg.noPause,false);assert.equal(s.cfg.rightBackdropOpacity,0);assert.equal(s.cfg.stickDeadZone,0.2);assert.equal(s.cfg.detailsGamepadKey,'Gamepad_LeftThumbstick');assert.equal(s.cfg.detailsMouseButton,'');assert.equal(s.cfg.sortKeyboardModifier,'Control');assert.equal(s.writes.length,0);assert.equal(s.text,text);assert(s.logs.some(l=>l.includes('ignored unknown')));
});
test('disabled detail bindings are represented as empty strings',()=>{const s=load('[Input]\nToggleDetailsGamepad=None\nToggleDetailsKeyboard=None\nToggleDetailsMouse=None');for(const k of ['detailsGamepadKey','detailsKeyboardKey','detailsMouseButton'])assert.equal(s.cfg[k],'');});
test('INI contents are parsed as data rather than evaluated as code',()=>{const s=load('[General]\nEnabled=(globalThis.secret=1)\n');assert.equal(s.cfg.enabled,true);assert.equal(s.writes.length,0);});
test('file creation failure still provides usable defaults and a diagnostic',()=>{const s=load(undefined,{saveFail:true});assert.equal(s.cfg.enabled,true);assert(s.logs.some(l=>l.includes('could not create')));});
test('an existing file that cannot be read is kept instead of overwritten',()=>{
    const s=load(undefined,{exists:true});assert.equal(s.writes.length,0);assert.equal(s.cfg.enabled,true);
});
test('a read exception uses defaults without overwriting a file',()=>{const s=load('private',{readThrow:true});assert.equal(s.cfg.noPause,true);assert.equal(s.writes.length,0);assert.equal(s.text,'private');});
test('master-disabled main never imports or patches the game classes',()=>{
    const module={exports:{}},imports=[];vm.runInNewContext('(function(module,exports,require,console){'+fs.readFileSync(path.join(__dirname,'../mod/PBZSoulsMenu/main.js'),'utf8')+'\n})')(module,module.exports,id=>{imports.push(id);assert.equal(id,'./config');return{enabled:false};},{log(){}});
    assert.deepEqual(imports,['./config']);assert.equal(typeof module.exports.stop,'function');assert.doesNotThrow(()=>module.exports.stop());
});
const report=results.join('\n')+'\n\n'+results.length+' configuration checks passed.\n';fs.writeFileSync(path.join(__dirname,'../.build/config-verification.txt'),report);console.log(report);

