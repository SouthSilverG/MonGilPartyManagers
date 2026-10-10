const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const R=path.resolve(__dirname,'..'),context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(R,'Statcal','stats-data.js'),'utf8'),context);const D=context.window.STAT_DATA;
const E=require('../Statcal/stats-engine.js').make(D);
const manualDefaults=()=>({...E.defaults(),autoEffects:false});
const char=id=>Object.keys(D.maps.characters).find(k=>D.maps.characters[k]===String(id));
const slot=id=>({character:char(id),artifact:null,legendMonster:null,equipment:{hat:null,top:null,gloves:null,shoes:null},rings:{ring1:[null,null,null,null],ring2:[null,null,null,null],ring3:[null,null,null,null]},ringMonsters:{ring1:null,ring2:null,ring3:null}});
// In-game comparison: superconductor fusion converts destroyer mastery to capped crit.
const fusionParty={slots:[slot(101901),slot(104001),slot(101401)]},fusionDetail=manualDefaults();
fusionParty.slots[0].artifact=Object.keys(D.maps.artifacts).find(k=>D.maps.artifacts[k]==='1100048');
fusionDetail.slots[0].overlap=3;
let fusionResult=E.calculate(fusionParty,fusionDetail).slots[0];
assert.ok(Math.abs(fusionResult.values.crit-11.46)<1e-9,'1078 destroyer gives 6.468 crit plus base 5');
fusionDetail.slots[0].overlap=5;
fusionParty.slots[0].equipment.shoes='test-shoes';
fusionDetail.slots[0].equipment.shoes={crit:45};
fusionResult=E.calculate(fusionParty,fusionDetail).slots[0];
assert.equal(fusionResult.values.destroyerFlat,3853,'shoe mastery adds to character role');
assert.equal(fusionResult.values.crit,65,'5 base + 45 equipment + capped 15 fusion');
assert.equal(fusionResult.values.atk,15,'fusion 5 also grants capped attack conversion');
fusionDetail.slots[0].overlap=2;
assert.equal(E.calculate(fusionParty,fusionDetail).slots[0].values.crit,50,'fusion crit requires overlap 3');
// Check every artifact fusion group, with shoes on characters of all four roles.
const roleKeys={1:'brawlerFlat',2:'slayerFlat',3:'destroyerFlat',4:'supporterFlat'};
for(const overlap of E.rows('CUBE_OVERLAP').filter(x=>x.OVERLAP_LEVEL===5)){
 const artifact=Object.keys(D.maps.artifacts).find(k=>D.maps.artifacts[k]===String(overlap.CUBE_ID));
 assert.ok(artifact,'artifact mapping exists');
 const role=E.T.ITEM_CUBE[overlap.CUBE_ID].CLASS_TYPE;
 const characterId=Object.entries(E.T.CHARACTER_LIST).find(([id,c])=>c.STATUS_TYPE===role&&char(id))?.[0];
 assert.ok(characterId,'matching character role');
 const testParty={slots:[slot(characterId),slot(104001),slot(101401)]},testDetail=manualDefaults();
 testParty.slots[0].artifact=artifact;testParty.slots[0].equipment.shoes='test-shoes';testDetail.slots[0].overlap=5;
 const calculated=E.calculate(testParty,testDetail);
 for(const threshold of [3,5])if(overlap['FUSION_VALUE_'+threshold]){
  const group=overlap['FUSION_VALUE_'+threshold],effect=calculated.effects.find(x=>x.owner===0&&x.gid===group);
  assert.ok(effect&&!effect.unsupported&&effect.applied,'every fusion group is calculated');
  assert.ok(effect.conversions.length,'fusion uses stat conversion');
  for(const conversion of effect.conversions){
   assert.equal(conversion.from,roleKeys[role],'artifact reads matching role stat');
   const mastery=calculated.slots[0].values[conversion.from];
   assert.ok(mastery>=2775,'shoes included in source stat');
   const expected=Math.floor((Math.min(mastery*conversion.ratio,conversion.cap)+1e-9)*100)/100;
   const log=calculated.slots[0].logs.find(x=>x.label===effect.label+' · 전환'&&x.key===conversion.to);
   assert.equal(log.value,expected,'conversion ratio and cap match raw table');
  }
 }
}
console.log('PASS: fusion thresholds, all 42 artifacts, four shoe mastery roles, conversion caps');
const sharedParty={slots:[slot(101901),slot(101401),slot(104001)]},sharedDetail=manualDefaults();
const legendIds=Object.keys(D.maps.legends);
sharedParty.slots[0].legendMonster=legendIds[0];sharedParty.slots[1].legendMonster=legendIds[0];sharedParty.slots[2].legendMonster=legendIds[1];
sharedDetail.slots[0].legend.types=['trait_atk','trait_crit_dmg','trait_atk',null];
sharedDetail.slots[2].legend.types=['trait_boss_monster_dmg',null,null,null];
sharedDetail.slots[0].sanctuary=40;sharedDetail.slots[1].sanctuary=10;
let sharedState=E.shared(sharedParty,sharedDetail);
assert.deepEqual(sharedState.slots[0].legend.types,['trait_atk','trait_crit_dmg',null,null]);
assert.deepEqual(sharedState.slots[1].legend.types,sharedState.slots[0].legend.types,'same legend shares options');
assert.equal(sharedState.slots[2].legend.types[0],'trait_boss_monster_dmg','different legend remains independent');
assert.equal(sharedState.slots[1].sanctuary,40,'same element shares sanctuary level');
sharedState.legendOptions[legendIds[0]][2]='trait_weak_dmg';sharedState.sanctuaryLevels[3]=25;
sharedState=E.shared(sharedParty,JSON.parse(JSON.stringify(sharedState)));
assert.equal(sharedState.slots[1].legend.types[2],'trait_weak_dmg','shared options survive save restore');
assert.equal(sharedState.slots[0].sanctuary,25);assert.equal(sharedState.slots[1].sanctuary,25);
sharedParty.slots[0].legendMonster=legendIds[1];sharedState=E.shared(sharedParty,sharedState);
assert.equal(sharedState.slots[0].legend.types[0],'trait_boss_monster_dmg','switching legend restores that legend configuration');
console.log('PASS: shared legend options, duplicate removal, independent legend types, elemental sanctuary, save restore');
const party={slots:[slot(101901),slot(104001),slot(101401)]},d=manualDefaults();
let r=E.calculate(party,d);assert.equal(r.slots[0].values.crit,5);assert.equal(r.slots[0].values.ice||0,0);
d.slots[1].effects['1:skill-104007']={on:true,stacks:1};r=E.calculate(party,d);for(const s of r.slots)assert.equal(s.values.atk,20,'summer attack applies to every party member');
d.slots[2].effects['2:skill-101406']={on:true};r=E.calculate(party,d);assert.equal(r.slots[0].values.ice,50);assert.equal(r.slots[2].values.ice,50);assert.equal(r.slots[1].values.earth||0,0,'ice effect must not leak to earth');
d.slots[2].canto=4;d.slots[2].effects['2:skill-101435']={on:true};r=E.calculate(party,d);assert.equal(r.slots[0].values.ice,E.compile(101435,4).deltas[0].value);
d.slots[1].canto=6;d.slots[1].effects['1:skill-104009']={on:true};r=E.calculate(party,d);assert.equal(r.slots[0].values.atk,E.compile(104009,6).deltas[0].value,'enhanced buff replaces base buff');
d.slots[1].effects['1:skill-104003']={on:true,stacks:99};r=E.calculate(party,d);assert.equal(r.slots[0].values.boss,E.compile(104003).deltas[0].value*3,'stack cap');
const f=manualDefaults();f.foodMain='51111';r=E.calculate(party,f);for(const s of r.slots)assert.equal(s.values.hp,11,'party-wide food HP');
const t=manualDefaults();t.slots[0].ring.ring1.values[0]=50;party.slots[0].ringMonsters.ring1=Object.keys(D.maps.monsters)[0];party.slots[0].rings.ring1[0]='trait_incap_dmg';t.slots[0].effects['0:skill-101928']={on:true};r=E.calculate(party,t);assert.ok(Math.abs(r.slots[0].values.atk-Math.min((12.18+7.5)*0.26,15))<1e-9,'role groggy plus prime option feed the 26% attack conversion');
const sanitized=E.sanitize({slots:[{canto:100,level:-4,effects:{x:{on:'true',stacks:Infinity}},equipment:{hat:{crit:999}}}]});assert.equal(sanitized.slots[0].canto,6);assert.equal(sanitized.slots[0].level,60);assert.equal(sanitized.slots[0].equipment.hat.crit,999);assert.equal(sanitized.slots[0].effects.x.on,false);assert.equal(E.sanitize(null).foodMain,null);
// Exercise existing PNG codec without needing DOM or a browser.
const app=fs.readFileSync(path.join(R,'app.js'),'utf8'),start=app.indexOf('const PARTY_PNG_KEYWORD'),end=app.indexOf('// 지금 파티 상태');
const codec={TextEncoder,TextDecoder,Uint8Array,Uint32Array,DataView,ArrayBuffer,console};vm.createContext(codec);vm.runInContext(app.slice(start,end)+';globalThis.codec={embedPartyDataInPng,extractPartyDataFromPng};',codec);
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3ioAAAAASUVORK5CYII=','base64');
for(const payload of [{app:'mongil-stardive-party',schema:1,slots:party.slots},{app:'mongil-stardive-party',schema:1,slots:party.slots,detailedStats:d}]){const json=JSON.stringify(payload),b=codec.codec.embedPartyDataInPng(png.buffer.slice(png.byteOffset,png.byteOffset+png.byteLength),json);assert.equal(codec.codec.extractPartyDataFromPng(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)),json);}
const fixed=manualDefaults();party.slots[0].equipment.gloves='test-selected';fixed.slots[0].equipment.gloves={atk:200,crit:120,critDmg:400};let before=E.calculate(party,manualDefaults()).slots[0];r=E.calculate(party,fixed);assert.equal(r.slots[0].values.atkFlat-before.values.atkFlat,200,'equipment ATK is flat, not percentage');assert.equal(r.slots[0].values.atk,before.values.atk);assert.equal(r.slots[0].values.crit,100);assert.equal(r.slots[0].excess.crit,25);assert.equal(r.slots[0].values.critDmg,300);assert.equal(r.slots[0].excess.critDmg,150);assert.equal(D.equipmentMax.gloves.value,846);assert.equal(D.equipmentMax.gloves.level,18);
const prime=manualDefaults();party.slots[0].rings.ring1[0]='trait_crit_dmg';prime.slots[0].ring.ring1.grade=1;prime.slots[0].ring.ring1.values[0]=999;let primeResult=E.calculate(party,prime);assert.equal(primeResult.slots[0].values.critDmg,65,'selected prime option automatically adds 15%, ignoring manual values');assert.equal(primeResult.detail.slots[0].ring.ring1.grade,5);party.slots[0].legendMonster=Object.keys(D.maps.legends)[0];prime.slots[0].legend.types[0]='trait_crit_dmg';primeResult=E.calculate(party,prime);assert.equal(primeResult.slots[0].values.critDmg,80,'legend prime crit damage is automatic');assert.ok(D.foodImages['51111']);
console.log('PASS: buffs, conversions, PNG round-trip, flat equipment, caps, automatic prime and legend options, food icon mapping');
const penetration=manualDefaults();penetration.slots[0].effects['0:skill-101938']={on:true};assert.equal(E.calculate(party,penetration).slots[0].values.penetration,15,'energy 100 activates 15% penetration');penetration.slots[0].canto=6;penetration.slots[0].effects['0:skill-101952']={on:true};assert.equal(E.calculate(party,penetration).slots[0].values.penetration,32.89,'canto 6 penetration stacks with energy effect');

const automatic=E.defaults();automatic.slots[1].canto=2;automatic.slots[2].canto=4;automatic.slots[1].effects['1:skill-104007']={on:false};const ar=E.calculate(party,automatic);assert.ok(ar.slots[0].values.atk>=20,'party ATK auto applies despite old off checkbox');assert.ok(ar.slots[1].values.earth>=40,'earth character receives earth buff');assert.ok(ar.slots[0].values.ice>=90,'ice character receives Nara ice buff');assert.equal(ar.slots[0].values.earth||0,0,'earth buff excludes ice character');const se=ar.effects.find(e=>e.gid===104003);assert.equal(se.appliedStacks,3,'automatic effects use max stacks');console.log('PASS: automatic activation, legacy off-state ignored, elemental target filtering, max stacks');

// Sanctuary unlock levels, party-element targets and passive conversion dependencies.
const linkedParty={slots:[slot(101901),slot(104001),slot(101401)]},linkedDetail=E.defaults();
linkedDetail.slots.forEach(q=>{q.canto=6;q.sanctuary=40;});
let linked=E.calculate(linkedParty,linkedDetail);
const sanctuary=linked.effects.find(e=>e.owner===0&&e.label==='성소 해금 10레벨');
assert.equal(sanctuary.deltas.find(x=>x.key==='basicDamage').value,37.9);
assert.deepEqual(sanctuary.appliedTo,[0,2],'ice sanctuary tag buff only affects ice party members');
assert.ok(linked.effects.find(e=>e.gid===104028&&e.applied),'summer earth-to-attack passive is connected');
assert.equal(linked.slots[1].logs.find(l=>l.label==='패시브·교체·전투 스킬 · 전환'&&l.key==='atk').value,25);
assert.deepEqual(linked.effects.find(e=>e.gid===101437).appliedTo,[1],'non-ice ranged buff applies to summer Francis');
linkedDetail.sanctuaryLevels={3:3,6:3};linked=E.calculate(linkedParty,linkedDetail);
assert.ok(!linked.effects.some(e=>e.label.startsWith('성소 해금')),'sanctuary skill is locked below level 4');
const chainParty={slots:[slot(101901),slot(104001),slot(101401)]},chainDetail=E.defaults();
chainParty.slots[0].artifact=Object.keys(D.maps.artifacts).find(k=>D.maps.artifacts[k]==='1100048');
chainParty.slots[0].ringMonsters.ring1=Object.keys(D.maps.monsters)[0];chainParty.slots[0].rings.ring1[0]='trait_incap_dmg';
chainDetail.slots[0].overlap=5;chainDetail.slots[0].canto=6;
const chain=E.calculate(chainParty,chainDetail).slots[0];
assert.ok(chain.values.basicDamage>0,'superconductor converts groggy to basic attack damage');
assert.ok(chain.values.specialAtk>0,'special-only artifact attack is separately calculated');
assert.ok(chain.logs.some(l=>l.label.startsWith('아티팩트 · 안정된 초전도체')&&l.key==='specialAtk'));
console.log('PASS: sanctuary unlocks, ice targets, passive graph, exclusive branches, artifact-specific conversions');

// User-supplied level weight table: own role only, then downstream conversions.
assert.equal(E.positionWeights.length,101);assert.equal(E.positionWeights[1],2083);assert.equal(E.positionWeights[60],113);assert.equal(E.positionWeights[100],49);
for(const [role,conversion] of Object.entries(E.roleConversions)){
 const cid=Object.entries(E.T.CHARACTER_LIST).find(([id,c])=>c.STATUS_TYPE===Number(role)&&char(id))[0];
 const p={slots:[slot(cid),slot(104001),slot(101401)]},d=manualDefaults();p.slots[0].equipment.shoes='test-shoes';
 const out=E.calculate(p,d).slots[0];
 const log=out.logs.find(l=>l.label==='역할 능력치 · 60레벨 환산 · 전환');
 assert.equal(log.key,conversion.to);assert.ok(Math.abs(log.value-Math.floor((out.values[conversion.from]*0.0113+1e-9)*100)/100)<1e-9);
 assert.equal(out.logs.filter(l=>l.label==='역할 능력치 · 60레벨 환산 · 전환').length,1);
}
const nativeParty={slots:[slot(101901),slot(104001),slot(101401)]},nativeDetail=E.defaults();
nativeParty.slots[0].artifact=Object.keys(D.maps.artifacts).find(k=>D.maps.artifacts[k]==='1100048');nativeParty.slots[0].equipment.shoes='test-shoes';nativeDetail.slots[0].canto=6;nativeDetail.slots[0].overlap=5;
const native=E.calculate(nativeParty,nativeDetail).slots[0];
assert.ok(Math.abs(native.values.groggy-43.53)<1e-9);
assert.ok(native.logs.some(l=>l.key==='atk'&&l.label==='이자벨라 · 빙결 / 무력화 피해 전환 · 전환'&&Math.abs(l.value-35.2)<1e-9));
assert.ok(native.logs.some(l=>l.key==='basicDamage'&&l.label.startsWith('아티팩트 · 안정된 초전도체')&&Math.abs(l.value-43.53*2.664)<1e-9));
assert.equal(native.values.specialAtk,70);
console.log('PASS: 1–100 level weights, four own-role conversions, 3853 mastery → 43.5389% groggy, downstream artifact/passive');

// In-game shoe comparison: role conversion truncates to two decimal places.
const shoesParty={slots:[slot(101901),slot(104001),slot(101401)]},shoesDetail=manualDefaults();
shoesParty.slots[0].artifact=Object.keys(D.maps.artifacts).find(k=>D.maps.artifacts[k]==='1100048');shoesDetail.slots[0].overlap=5;
shoesParty.slots[0].ringMonsters.ring1=Object.keys(D.maps.monsters)[0];shoesParty.slots[0].rings.ring1[0]='trait_incap_dmg';
let noShoes=E.calculate(shoesParty,shoesDetail).slots[0];assert.equal(noShoes.values.groggy,19.68);
shoesParty.slots[0].equipment.shoes='test-shoes';shoesDetail.slots[0].equipment.shoes={crit:10.8,critDmg:18.5};
let withShoes=E.calculate(shoesParty,shoesDetail).slots[0];assert.equal(withShoes.values.groggy,51.03);
assert.ok(Math.abs(withShoes.values.crit-noShoes.values.crit-19.34)<1e-9);
assert.equal(withShoes.values.critDmg-noShoes.values.critDmg,18.5);
console.log('PASS: game shoe delta, 19.68 → 51.03 groggy, +19.34 crit, +18.5 crit damage');

// Mina signature artifact: overlap 5 converts Brawler to Fire, independently of native Brawl damage.
const minaParty={slots:[slot(100501),slot(104001),slot(101401)]},minaDetail=manualDefaults();
minaParty.slots[0].artifact=Object.keys(D.maps.artifacts).find(k=>D.maps.artifacts[k]==='1100023');
minaDetail.slots[0].overlap=4;const minaFour=E.calculate(minaParty,minaDetail).slots[0];
minaDetail.slots[0].overlap=5;const minaFive=E.calculate(minaParty,minaDetail).slots[0];
const minaConversion=E.compile(60231105).conversions[0];
assert.equal(minaConversion.from,'brawlerFlat');assert.equal(minaConversion.to,'fire');assert.equal(minaConversion.ratio,0.006);assert.equal(minaConversion.cap,15);
const minaBonus=Math.floor((Math.min(minaFive.values.brawlerFlat*0.006,15)+1e-9)*100)/100;
assert.ok(!minaFour.logs.some(l=>l.key==='fire'&&l.label==='아티팩트 결합 5단계 · 전환'),'fusion 5 fire bonus absent at overlap 4');assert.equal(minaFive.logs.find(l=>l.key==='fire'&&l.label==='아티팩트 결합 5단계 · 전환').value,minaBonus);
minaParty.slots[0].equipment.shoes='test-shoes';const minaShoes=E.calculate(minaParty,minaDetail).slots[0];
assert.equal(minaShoes.values.brawlerFlat-minaFive.values.brawlerFlat,2775);
assert.equal(minaShoes.logs.find(l=>l.key==='fire'&&l.label==='아티팩트 결합 5단계 · 전환').value,15,'shoe Brawler reaches fusion fire cap');
assert.ok(minaShoes.logs.some(l=>l.key==='brawl'&&l.label==='역할 능력치 · 60레벨 환산 · 전환'),'native Brawler-to-Brawl is a separate conversion');
assert.equal(minaShoes.values.destroyerFlat||0,0,'no wrong role mastery');
console.log('PASS: Mina + Flame Nine-Tailed Fox fusion 5, without shoes '+minaBonus+'% fire, with shoes 15%, overlap threshold and separate Brawl damage');

const naraParty={slots:[slot(101901),slot(104001),slot(101401)]},naraDetail=E.defaults();
let nr=E.calculate(naraParty,naraDetail);
assert.deepEqual(nr.effects.find(e=>e.gid===101432).appliedTo,[0,2]);
assert.deepEqual(nr.effects.find(e=>e.gid===101433).appliedTo,[1]);
assert.equal(nr.effects.find(e=>e.gid===101433).targetElement,0);
assert.equal(nr.effects.find(e=>e.gid===101433).deltas[0].value,80);
naraDetail.slots[2].canto=4;nr=E.calculate(naraParty,naraDetail);
assert.ok(!nr.effects.some(e=>[101432,101433].includes(e.gid)));
assert.equal(nr.effects.find(e=>e.gid===101437).deltas[0].value,150);
console.log('PASS: Nara ice / non-ice ranged team buffs and canto replacement');

// Nara's ice and special damage must be applied together; signature artifact has distinct team scopes.
const naraBoth=E.calculate(naraParty,E.defaults());
assert.deepEqual(naraBoth.effects.find(e=>e.gid===101406).appliedTo,[0,2]);
assert.deepEqual(naraBoth.effects.find(e=>e.gid===101432).appliedTo,[0,2]);
assert.equal(naraBoth.effects.find(e=>e.gid===101406).deltas[0].value,50);
naraParty.slots[2].artifact=Object.keys(D.maps.artifacts).find(k=>D.maps.artifacts[k]==='1100036');
const naraArtifactDetail=E.defaults();naraArtifactDetail.slots[2].overlap=3;
const na=E.calculate(naraParty,naraArtifactDetail);
const naAll=na.effects.find(e=>e.gid===603632),naIce=na.effects.find(e=>e.gid===603633);
assert.deepEqual(naAll.appliedTo,[0,1,2]);assert.equal(naAll.deltas[0].value,18);
assert.deepEqual(naIce.appliedTo,[0,2]);assert.equal(naIce.deltas.find(d=>d.key==='basicDamage').value,30);assert.equal(naIce.deltas.find(d=>d.key==='critDmg').value,37.5);
console.log('PASS: Nara simultaneous ice/special buffs, signature artifact team + ice-only scopes');

// Mixed buffs use native per-node scopes and stack counts, not a whole-description multiplier.
function artifactNodes(id,overlap=1){const ov=E.rows('CUBE_OVERLAP').find(o=>o.CUBE_ID===id&&o.OVERLAP_LEVEL===overlap);return E.artifactEffects(id,ov,E.defaults().slots[0]);}
const mixedFive=artifactNodes(1100005);
assert.equal(mixedFive.flatMap(e=>e.deltas).find(d=>d.key==='basicDamage').stacks,1);
assert.equal(mixedFive.flatMap(e=>e.deltas).find(d=>d.key==='ultimateDamage').stacks,2);
const twoStar=artifactNodes(1100011);
assert.equal(twoStar.find(e=>e.deltas.some(d=>d.key==='ultimateDamage')).team,false);
assert.equal(twoStar.find(e=>e.deltas.some(d=>d.key==='atk')).team,true);
assert.equal(artifactNodes(1100007).flatMap(e=>e.deltas).find(d=>d.key==='atk').value,-10);
const vigor=artifactNodes(1100032);for(const key of ['basicDamage','specialDamage','ultimateDamage'])assert.ok(vigor.some(e=>e.team&&e.deltas.some(d=>d.key===key)));
const finale=artifactNodes(1100051);assert.equal(finale.find(e=>e.deltas.some(d=>d.key==='critDmg')).targetElement,2);
const summerArtifact=artifactNodes(1100050);assert.equal(summerArtifact.find(e=>e.deltas.some(d=>d.key==='basicDamage')).targetElement,6);
assert.equal(artifactNodes(1100039).flatMap(e=>e.conversions)[0].offset,50);
console.log('PASS: artifact per-buff stacks, self/team separation, negative attack, triple skill damage, elemental party scopes, excess crit conversion');
