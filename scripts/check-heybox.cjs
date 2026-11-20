const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const ext=require(path.resolve(process.argv[2])),root=path.resolve(__dirname,'..'),handlers=[],results=[];
function files(dir,prefix=''){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name),prefix+e.name+'/'):[prefix+e.name]);}
async function test(name,fn){await fn();results.push('PASS '+name);}
async function run(){
    await ext.default({registerGame(){},registerModType(){},registerExtensionAction(){},registerInstaller(id,priority,check,install){handlers.push({id,priority,check,install});}});
    const heyRoot=path.join(root,'.build/Heybox'),nxRoot=path.join(root,'.build/Nexus'),hey=files(heyRoot),nx=files(nxRoot);
    const supported=list=>handlers.filter(h=>h.check(list,4115450).supported),js=supported(hey),manual=supported(nx);
    await test('Heybox package is recognized exclusively as one PBZModLoader JS mod',()=>{assert.deepEqual(js.map(h=>h.id),['4115450-pbzmodloader-mod']);});
    await test('Nexus manual package is recognized exclusively as a game-root layout',()=>{assert.deepEqual(manual.map(h=>h.id),['4115450-root']);});
    const plan=await js[0].install(hey,'staging/SoulsMenu.installing');
    const copy=plan.instructions.filter(i=>i.type==='copy'),dest='ProjectPBZ/PBZModLoader/mods/PBZSoulsMenu/';
    await test('Heybox installs every payload file under the exact existing mod ID',()=>{
        assert.equal(plan.modType,'4115450-pbzmodloader-mod');assert.deepEqual(plan.instructions.find(i=>i.type==='attribute').value,['PBZSoulsMenu']);
        assert.equal(copy.length,hey.filter(f=>f.startsWith('PBZSoulsMenu/')).length);assert.equal(new Set(copy.map(i=>i.destination)).size,copy.length);
        assert(copy.every(i=>i.destination===dest+i.source.slice('PBZSoulsMenu/'.length)));assert(copy.some(i=>i.destination===dest+'main.js'));
    });
    await test('Nexus and Heybox contain byte-identical mod payloads',()=>{for(const i of copy)assert(fs.readFileSync(path.join(heyRoot,i.source)).equals(fs.readFileSync(path.join(nxRoot,i.destination))));});
    await test('an extra user archive wrapper preserves the mod ID and destinations',async()=>{
        const wrapped=hey.map(f=>'User download/'+f),s=supported(wrapped);assert.equal(s.length,1);
        const p=await s[0].install(wrapped,'elsewhere');assert.deepEqual(p.instructions.filter(i=>i.type==='copy').map(i=>i.destination),copy.map(i=>i.destination));
    });
    await test('a configuration example does not misclassify the JS mod as ReShade',()=>{assert(hey.some(f=>f.endsWith('.cfg.example')));assert(!hey.some(f=>f.toLowerCase().endsWith('.ini')));assert(!handlers.find(h=>h.id==='4115450-binaries').check(hey,4115450).supported);});
    await test('the extension rejects these packages for another game ID',()=>{assert(handlers.every(h=>!h.check(hey,0).supported&&!h.check(nx,0).supported));});
    const fixture=path.resolve(root,'.build/deploy-fixture'),sentinel=path.join(fixture,'ProjectPBZ/PBZModLoader/mods/OtherMod/main.js'),settings=path.join(fixture,'Saved/PBZSoulsMenu.cfg');
    fs.mkdirSync(path.dirname(sentinel),{recursive:true});fs.mkdirSync(path.dirname(settings),{recursive:true});fs.writeFileSync(sentinel,'unrelated');fs.writeFileSync(settings,'personal settings');
    const targets=[];
    for(const i of copy){const target=path.resolve(fixture,i.destination);assert(target.startsWith(fixture+path.sep));fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(heyRoot,i.source),target);targets.push(target);}
    await test('simulated deployment produces files matching the release manifest',()=>{const m=JSON.parse(fs.readFileSync(path.join(fixture,dest,'manifest.json')));assert.equal(m.version,'0.5.1');for(const [name,hash] of Object.entries(m.files))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(fixture,dest,name))).digest('hex'),hash);});
    await test('deployment and manager-style uninstall preserve other mods and local settings',()=>{for(const target of targets){assert(target.startsWith(path.resolve(fixture,dest)+path.sep));fs.unlinkSync(target);}assert.equal(fs.readFileSync(sentinel,'utf8'),'unrelated');assert.equal(fs.readFileSync(settings,'utf8'),'personal settings');assert(!fs.existsSync(path.join(fixture,dest,'main.js')));});
    const report=results.join('\n')+'\n\n'+results.length+' Heybox extension contract/deployment checks passed. The Heybox UI and the game were not operated.\n';
    fs.writeFileSync(path.join(root,'.build/heybox-verification.txt'),report);console.log(report);
}
run().catch(e=>{console.error(e);process.exitCode=1;});

