/* Pure calculation core. Source values use 100 = 1 percentage point. */
(function(root){
 'use strict';
 const fields={1:'atkFlat',2:'defFlat',3:'hpFlat',85:'atk',86:'def',96:'hp',4:'crit',6:'critDmg',8:'penetration',97:'suppress',108:'groggy',73:'weakness',102:'earthRes',109:'normal',110:'boss',78:'support',107:'brawl',11:'fire',13:'ice',15:'lightning',17:'wind',19:'earth',29:'physical',76:'cooldown'};
 const elements={1:'physical',2:'fire',3:'ice',4:'lightning',5:'wind',6:'earth'};
 const names={atk:'공격력',def:'방어력',hp:'체력',crit:'치명타 확률',critDmg:'치명타 피해',penetration:'관통률',suppress:'제압 피해',groggy:'무력화 피해',weakness:'약점 속성 피해',boss:'보스 몬스터 피해',support:'지원 피해',brawl:'난전 피해',fire:'불 속성 피해',ice:'얼음 속성 피해',lightning:'번개 속성 피해',wind:'바람 속성 피해',earth:'땅 속성 피해',physical:'물리 속성 피해'};
 const plain=s=>String(s||'').replace(/<[^>]*>/g,'').replace(/\\n/g,'\n');
 function make(data){
  const T=data.tables,L=data.local,rows=n=>Object.values(T[n]||{}),loc=k=>plain(L[k]||''),by=(n,f,v)=>rows(n).filter(r=>r[f]===v);
  const cache=new Map();
  function resolve(token,canto,level){
   if(!token.includes(':'))return Number.isFinite(Number(token))?Number(token):null;
   let [kind,id]=token.split(':');id=id.replace('+LV',String(Math.max(1,level||1)).padStart(2,'0'));
   let p=T.ABILITY_PARAMETER[id];
   if(kind.startsWith('AbilityCanto'))p=T.ABILITY_PARAMETER_CANTO[id];
   if(p){
    const override=rows('ABILITY_PARAMETER_CANTO').find(r=>r.ABILITY_PARAMETER_ID===Number(id)&&r.CANTO_LEVEL_MIN<=canto&&r.CANTO_LEVEL_MAX>=canto);
    p=override?{...p,...override}:p;
    const m=kind.match(/_P([1-6])/);
    if(m){let v=p['PARAM_'+m[1]];if(kind.includes('Elemental_Type'))return names[elements[v]]?.replace(' 속성 피해','')||v;if(kind.includes('Status_Type')||kind.endsWith('_Stat'))return names[fields[v]]||v;if(kind.endsWith('_R'))return v/100;if(kind.endsWith('_T'))return v/1000;return v;}
    if(kind==='Ability_Max_Stack')return p.MAX_STACK;if(kind==='Ability_Tick')return p.TICK/1000;
   }
   if(/TIME$/i.test(kind)){let r=T.ITEM_ABILITY_GROUP[id]||T.SKILL_ABILITY_GROUP[id]||T.SYSTEM_ABILITY_GROUP[id];if(r)return r.TIME/1000;}
   if(kind.startsWith('BOOSTER_VALUE')&&T.BOOSTER[id])return T.BOOSTER[id].VALUE/(kind.endsWith('_R')?100:1);
   return null;
  }
  function description(key,tokens,canto=0,level=1){const vals=String(tokens||'').split(',').map(t=>resolve(t,canto,level));return loc(key).replace(/\{(\d+)\}/g,(m,i)=>vals[i]===null||vals[i]===undefined?m:String(vals[i]));}
  function compile(gid,canto=0,level=1){
   const ck=[gid,canto,level].join(':');if(cache.has(ck))return cache.get(ck);
   let info=T.ABILITY_GROUP_INFO[String(gid)]||{},text=description(info.ABILITY_GROUP_DESC_LOCAL,info.ABILITY_GROUP_DESC_LOCAL_PARAM,canto,level);
   let pars=by('ABILITY_PARAMETER','ABILITY_GROUP_ID',Number(gid)).filter(p=>p.ABILITY_SKILL_LEVEL===1||p.ABILITY_SKILL_LEVEL===level);
   let conversions=[],deltas=[],remainder=[];
   // Conversion parameters directly name the source and destination status codes.
   for(let p of pars){const ov=rows('ABILITY_PARAMETER_CANTO').find(r=>r.ABILITY_PARAMETER_ID===Number(Object.keys(T.ABILITY_PARAMETER).find(k=>T.ABILITY_PARAMETER[k]===p))&&r.CANTO_LEVEL_MIN<=canto&&r.CANTO_LEVEL_MAX>=canto);if(ov)p={...p,...ov};
    if(p.ABILITY_TYPE===10048&&fields[p.PARAM_1]&&fields[p.PARAM_3])conversions.push({from:fields[p.PARAM_1],to:fields[p.PARAM_3],ratio:p.PARAM_2/10000,cap:p.PARAM_4/(String(fields[p.PARAM_3]).endsWith('Flat')?1:100)});
   }
   const keyAliases=[['공격력','atk'],['방어력','def'],['최대 체력','hp'],['치명타 확률','crit'],['치명타 피해','critDmg'],['관통률','penetration'],['제압 피해','suppress'],['무력화 피해','groggy'],['약점 속성 피해','weakness'],['보스 몬스터 피해','boss'],['지원 피해','support'],['난전 피해','brawl'],['불 속성 피해','fire'],['얼음 속성 피해','ice'],['바람 속성 피해','wind'],['번개 속성 피해','lightning'],['땅 속성 피해','earth'],['물리 속성 피해','physical']];
   if(!conversions.length)for(const [label,key] of keyAliases){
    const rx=new RegExp(label+'(?:가|이|은|는|의)?\\s*([0-9]+(?:\\.[0-9]+)?)%?\\s*(?:로\\s*)?증가','g');let m;
    while((m=rx.exec(text))){const before=text.slice(Math.max(0,m.index-22),m.index);if(/특수 스킬|기본 공격|궁극 스킬|교체 스킬/.test(before)&&!['groggy','boss'].includes(key)){remainder.push(m[0]+' (특정 스킬 한정)');continue;}deltas.push({key,value:Number(m[1])});}
   }
   if(!deltas.some(d=>d.key==='penetration'))for(const p of pars)if(p.ABILITY_TYPE===1395)deltas.push({key:'penetration',value:p.PARAM_1/100});
   const max=Math.max(1,...pars.map(p=>p.MAX_STACK||1),Number((text.match(/최대\s*(\d+)\s*(?:회|중첩)/)||[])[1])||1);
   const result={gid:Number(gid),title:loc(info.ABILITY_GROUP_TITLE_LOCAL)||'효과 '+gid,text,deltas,conversions,maxStack:max,conditional:/시[,\s]|동안|중첩|보유|적중|성공|피격|발동|일정|공격 시/.test(text),team:/모든 팀원|팀원의|팀원에게|파티원/.test(text),unsupported:!deltas.length&&!conversions.length,remainder};cache.set(ck,result);return result;
  }
  function emptySlot(){return {level:60,levelGrade:4,canto:0,artifactLevel:60,artifactGrade:4,overlap:1,skillLevel:1,sanctuary:0,ring:{ring1:{grade:5,slot:'A',level:60,levelGrade:0,values:[0,0,0,0]},ring2:{grade:5,slot:'A',level:60,levelGrade:0,values:[0,0,0,0]},ring3:{grade:5,slot:'A',level:60,levelGrade:0,values:[0,0,0,0]}},legend:{grade:5,slot:'A',level:60,levelGrade:4,values:[0,0,0,0],types:[null,null,null,null]},equipment:{},effects:{}};}
  function defaults(){return {version:3,autoEffects:true,foodMain:null,foodSide:null,slots:[emptySlot(),emptySlot(),emptySlot()]};}
  function sanitize(raw){const d=defaults(),num=(v,min,max,def)=>Number.isFinite(Number(v))?Math.min(max,Math.max(min,Number(v))):def;if(!raw||typeof raw!=='object')return d;
   d.autoEffects=raw.autoEffects!==false;
   for(const f of ['foodMain','foodSide'])if(typeof raw[f]==='string'&&T.ITEM_LIST[raw[f]]?.ITEM_TYPE===41)d[f]=raw[f];
   if(d.foodMain===d.foodSide)d.foodSide=null;
   d.slots=d.slots.map((s,i)=>{let r=raw.slots?.[i];if(!r||typeof r!=='object')return s;for(const [f,min,max] of [['level',1,60],['levelGrade',0,6],['canto',0,6],['artifactLevel',1,60],['artifactGrade',0,5],['overlap',1,5],['skillLevel',1,16],['sanctuary',0,50]])s[f]=num(r[f],min,max,s[f]);
    for(const k of ['ring1','ring2','ring3','legend']){let q=k==='legend'?r.legend:r.ring?.[k],z=k==='legend'?s.legend:s.ring[k];if(q){for(const [f,min,max] of [['grade',1,5],['level',1,60],['levelGrade',0,4]])z[f]=num(q[f],min,max,z[f]);z.grade=5;z.level=60;z.slot=['A','B','C'].includes(q.slot)?q.slot:'A';z.values=Array.from({length:4},(_,j)=>num(q.values?.[j],0,10000,0));if(k==='legend')z.types=Array.from({length:4},(_,j)=>typeof q.types?.[j]==='string'?q.types[j]:null);}}
    for(const [k,q] of Object.entries(r.equipment||{}))if(['hat','top','gloves','shoes'].includes(k)&&q&&typeof q==='object')s.equipment[k]={atk:num(raw.version>=2?q.atk:0,0,100000,0),crit:num(q.crit,0,10000,0),critDmg:num(q.critDmg,0,10000,0),mainType:fields[Number(q.mainType)]?Number(q.mainType):1,mainValue:num(q.mainValue,0,100000,0)};
    for(const [k,q] of Object.entries(r.effects||{}))if(/^[-\w:]+$/.test(k)&&q&&typeof q==='object')s.effects[k]={on:q.on===true,stacks:num(q.stacks,1,100,1),scope:q.scope==='team'?'team':'self'};s.level=60;s.levelGrade=4;s.artifactLevel=60;s.artifactGrade=4;return s;});return d;
  }
  function character(id){return T.CHARACTER_LIST[data.maps.characters[id]]||null;}
  function card(id,kind,grade){let first=T.ITEM_CARD[data.maps[kind][id]];if(!first)return null;return rows('ITEM_CARD').find(r=>r.MONSTER_ID===first.MONSTER_ID&&r.RARE_GRADE===grade)||first;}
  function optionKey(id,element){const k={trait_atk:'atk',trait_def:'def',trait_hp:'hp',trait_crit_rate:'crit',trait_crit_dmg:'critDmg',trait_support_dmg:'support',trait_suppress_dmg:'suppress',trait_brawl_dmg:'brawl',trait_incap_dmg:'groggy',trait_normal_monster_dmg:'normal',trait_skill_cd:'cooldown',trait_skill_cooldown:'cooldown',trait_boss_monster_dmg:'boss',trait_earth_res:'earthRes',trait_weak_dmg:'weakness',trait_weakness_dmg:'weakness',trait_physical_dmg:'physical',trait_fire_dmg:'fire',trait_ice_dmg:'ice',trait_wind_dmg:'wind',trait_lightning_dmg:'lightning',trait_earth_dmg:'earth'}[id];return k||null;}
  function primeOption(id,cardRow){const key=optionKey(id),code=Object.keys(fields).find(n=>fields[n]===key);if(!code||!cardRow)return null;const candidates=by('CARD_OPTION_GROUP','STATUS_GROUP',cardRow.CARD_STATUS_GROUP).filter(r=>r.STATUS_TYPE===Number(code)&&r.CARD_OPTION_RANK===5);const row=candidates[0];return row?{key,value:row.STATUS_VALUE/(key.endsWith('Flat')?1:100),row}:null;}
  function effectList(party,detail){let out=[];
   party.slots.forEach((s,i)=>{const c=character(s.character),q=detail.slots[i];if(!c)return;
    const push=(gid,key,label,forced={})=>{const e=compile(gid,q.canto,q.skillLevel);let targetElement=0;for(const [name,n] of [['물리',1],['불',2],['얼음',3],['번개',4],['바람',5],['땅',6]])if(new RegExp(name+'\\s*속성(?:인|의)?\\s*(?:캐릭터|팀원)').test(e.text))targetElement=n;if(/같은 속성/.test(e.text))targetElement=c.ELEMENTAL_TYPE;out.push({...e,owner:i,key:i+':'+key,label,targetElement,...forced});};
    const sets={};for(const id of Object.values(s.equipment)){const group=data.maps.equipmentSets?.[id];if(group)sets[group]=(sets[group]||0)+1;}for(const [group,count] of Object.entries(sets))for(const r of rows('EQUIP_SET'))if(r.SET_OPTION_GROUP===Number(group)&&r.SET_COUNT<=count)push(r.ITEM_ABILITY_GROUP,'set-'+r.ITEM_ABILITY_GROUP,'장비 '+r.SET_COUNT+'세트');
    let a=T.ITEM_CUBE[data.maps.artifacts[s.artifact]],ov=a&&rows('CUBE_OVERLAP').find(r=>r.CUBE_ID===Number(data.maps.artifacts[s.artifact])&&r.OVERLAP_LEVEL===q.overlap);if(ov)push(ov.OPTION_VALUE,'artifact','아티팩트');
    for(const rk of ['ring1','ring2','ring3']){let r=card(s.ringMonsters[rk],'monsters',q.ring[rk].grade);if(r)push(r.ABILITY_VALUE,rk,rk.replace('ring','몬스터링 '));}
    let legend=card(s.legendMonster,'legends',q.legend.grade);if(legend)for(const f of ['ABILITY_VALUE','ABILITY_LEGEND_01','ABILITY_LEGEND_02'])if(legend[f])push(legend[f],'legend-'+f,'전설 몬스터링');
    // Verified activation/target rules for the example party. Enhanced versions replace their base versions.
    const cid=Number(data.maps.characters[s.character]);
    let verified=[];
    if(cid===101401)verified=[[q.canto>=4?101435:101406,'나래 · 특수 스킬 / 얼음 팀원',{team:true,targetElement:3,conditional:true}], [101416,'나래 · 보호막 보유',{conditional:true}]];
    if(cid===101401&&q.canto>=2)verified.push([101418,'나래 · 돌파 2 / 보호막 획득',{team:true,conditional:true}]);
    if(cid===101901)verified=[[101929,'이자벨라 · 빙결 발동',{conditional:true}],[101928,'이자벨라 · 빙결 / 무력화 피해 전환',{conditional:true}]];
    if(cid===101901)verified.push([101938,'이자벨라 · 특수 스킬 / 에너지 100 소모',{conditional:true}]);
    if(cid===101901&&q.canto>=6)verified.push([101952,'이자벨라 · 돌파 6 / 빙결 발동',{conditional:true}]);
    if(cid===101901&&q.canto>=2)verified.push([101954,'이자벨라 · 에너지 획득',{conditional:true}]);
    if(cid===104001)verified=[[q.canto>=6?104009:104007,'서머 프란시스 · 여름 검진 결과',{team:true,conditional:true}],[q.canto>=6?104008:104006,'서머 프란시스 · 땅 팀원',{team:true,targetElement:6,conditional:true}]];
    if(cid===104001&&q.canto>=2)verified.push([104003,'서머 프란시스 · 돌파 2 / 지원·궁극 스킬',{team:true,conditional:true,maxStack:3}]);
    if(verified.length)for(const [gid,label,rules] of verified)push(gid,'skill-'+gid,label,rules);
    else for(const [gid,info] of Object.entries(T.ABILITY_GROUP_INFO))if(gid.startsWith(String(cid).slice(0,4))&&gid.length<=7){const e=compile(gid,q.canto,q.skillLevel);if(!e.unsupported)push(gid,'skill-'+gid,e.title,{conditional:true,scopeUnverified:true});}
    for(const [id,r] of Object.entries(T.CHARACTER_CANTO))if(r.CHARACTER_ID===cid&&r.CANTO_LEVEL<=q.canto)for(const g of r.ABILITY_GROUP_ADD||[])if(g&&!verified.some(v=>v[0]===g))push(g,'canto-'+g,'돌파 '+r.CANTO_LEVEL,{conditional:true});
   });return out;
  }
  function calculate(party,raw){const detail=sanitize(raw),effects=effectList(party,detail);let logs=[],missing=[];
   const result=party.slots.map((s,i)=>{const c=character(s.character),q=detail.slots[i],v={atkFlat:0,defFlat:0,hpFlat:0,atk:0,def:0,hp:0,crit:T.CHARACTER_CONFIG.BASE_CRITICAL_RATE.VALUE/100,critDmg:T.CHARACTER_CONFIG.BASE_CRITICAL_DMG_RATE.VALUE/100,weakness:T.CHARACTER_CONFIG.BASE_WEAKNESS_ATK.VALUE/100,support:T.CHARACTER_CONFIG.BASE_SUPPORT_DMG.VALUE/100};
    if(!c)return {selected:false,values:v,element:null,logs:[],warnings:[]};let warnings=[];
    const add=(key,value,label)=>{v[key]=(v[key]||0)+value;logs.push({slot:i,key,value,label});};
    let base=by('CHARACTER_STATUS','STATUS_GROUP_ID',c.STATUS_GROUP_ID).filter(r=>r.LEVEL===q.level).sort((a,b)=>Math.abs(a.LEVEL_GRADE-q.levelGrade)-Math.abs(b.LEVEL_GRADE-q.levelGrade))[0];if(base){add('atkFlat',base.ATK,'캐릭터 기본');add('defFlat',base.DEF,'캐릭터 기본');add('hpFlat',base.HP,'캐릭터 기본');}else warnings.push('선택한 캐릭터의 기본 스탯 없음');
    const addStats=(r,label)=>{const map={ATK:'atkFlat',DEF:'defFlat',HP:'hpFlat',CRITICAL_RATE:'crit',CRITICAL_DAMAGE:'critDmg',ATK_RATE:'atk',DEF_RATE:'def',FIRE_ATK:'fire',ICE_ATK:'ice',WIND_ATK:'wind',EARTH_ATK:'earth',LIGHTNING_ATK:'lightning'};for(const [f,key] of Object.entries(map))if(r?.[f])add(key,r[f]/(key.endsWith('Flat')?1:100),label);};
    for(const rk of ['ring1','ring2','ring3','legend']){const z=rk==='legend'?q.legend:q.ring[rk],id=rk==='legend'?s.legendMonster:s.ringMonsters[rk],r=card(id,rk==='legend'?'legends':'monsters',z.grade);if(!r){if(id)warnings.push('몬스터링 원본 미연결: '+id);continue;}
     const candidates=by('CARD_STATUS','STATUS_GROUP_ID',r['STATUS_TYPE_'+z.slot]).filter(x=>x.LEVEL===z.level);const st=candidates.find(x=>x.LEVEL_GRADE===z.levelGrade)||candidates[0];addStats(st,rk==='legend'?'전설 몬스터링':'몬스터링 '+rk.slice(-1));const opts=rk==='legend'?z.types:s.rings[rk];opts.forEach((id,j)=>{const option=primeOption(id,r);if(option)add(option.key,option.value,(rk==='legend'?'전설 프라임 옵션':'몬스터링 프라임 옵션')+' '+(j+1));else if(id)warnings.push('계산 미지원 몬스터링 옵션: '+id);});}
    let a=T.ITEM_CUBE[data.maps.artifacts[s.artifact]];if(a){let rs=by('CUBE_STATUS','STATUS_GROUP_ID',a.CUBE_STATUS_GROUP_ID).filter(r=>r.LEVEL===q.artifactLevel),st=rs.find(r=>r.LEVEL_GRADE===q.artifactGrade)||rs[0];addStats(st,'아티팩트 기본');}else if(s.artifact)warnings.push('아티팩트 원본 미연결');
    for(const ek of ['hat','top','gloves','shoes'])if(s.equipment[ek]){const z=q.equipment[ek]||{};const primary=data.equipmentMax?.[ek];if(primary&&fields[primary.type])add(fields[primary.type],primary.value,'장비 5등급 '+primary.level+'강 '+ek);for(const f of ['atk','crit','critDmg'])add(f==='atk'?'atkFlat':f,Number(z[f])||0,'장비 입력 '+ek);}
    for(const f of [detail.foodMain,detail.foodSide])if(f){for(const b of by('BOOSTER','BOOSTER_GROUP',Number(f))){const text=description(b.BOOSTER_DESC,b.BOOSTER_DESC_PARAM);const m=text.match(/(공격력|방어력|최대 체력|치명타 확률|치명타 피해|보스 몬스터 피해|제압 피해|무력화 피해|약점 속성 피해|지원 피해)\s*([\d.]+)%?\s*증가/);const k={'공격력':'atk','방어력':'def','최대 체력':'hp','치명타 확률':'crit','치명타 피해':'critDmg','보스 몬스터 피해':'boss','제압 피해':'suppress','무력화 피해':'groggy','약점 속성 피해':'weakness','지원 피해':'support'}[m?.[1]];if(k)add(k,Number(m[2]),'요리 · '+loc(T.ITEM_LIST[f].ITEM_NAME_LOCAL));else if(!/스태미나|회복/.test(text))warnings.push('계산 미지원 음식 효과: '+text);}}
    if(q.sanctuary){const bs=rows('DUNGEON_ELEMENTAL_BONUS').filter(r=>r.ELEMENTAL===c.ELEMENTAL_TYPE&&r.LEVEL<=q.sanctuary&&r.BONUS_TYPE===0);for(const b of bs)if(fields[b.PARAM1])add(fields[b.PARAM1],b.PARAM2/(fields[b.PARAM1].endsWith('Flat')?1:100),'속성의 성소 '+b.LEVEL+'단계');}
    return {selected:true,values:v,element:c.ELEMENTAL_TYPE,warnings,logs:[]};
   });
   let conversions=[];
   for(const e of effects){let settings=detail.slots[e.owner].effects[e.key],active=detail.autoEffects?!e.unsupported:(settings?settings.on:!e.conditional&&!e.scopeUnverified);e.applied=false;e.appliedTo=[];e.appliedStacks=detail.autoEffects?e.maxStack:Math.min(e.maxStack,settings?.stacks||1);if(!active)continue;if(!detail.autoEffects&&e.scopeUnverified&&!settings?.scope){missing.push(e.label+' 적용 대상 미확인');continue;}const team=e.team||(!detail.autoEffects&&settings?.scope==='team');const targets=(team?[0,1,2]:[e.owner]).filter(i=>result[i].selected&&(!e.targetElement||e.targetElement===result[i].element));e.appliedTo=targets;e.applied=targets.length>0;
    for(const i of targets){if(!result[i].selected||(e.targetElement&&e.targetElement!==result[i].element))continue;let stacks=e.appliedStacks;for(const d of e.deltas){result[i].values[d.key]=(result[i].values[d.key]||0)+d.value*stacks;logs.push({slot:i,key:d.key,value:d.value*stacks,label:e.label});}for(const conv of e.conversions)conversions.push({slot:i,owner:e.owner,...conv,label:e.label});if(e.unsupported)result[i].warnings.push('계산 미지원: '+e.title);}
   }
   // Conversion snapshot excludes conversion output, preventing feedback loops.
   const snapshot=result.map(r=>({...r.values}));
   for(const c of conversions){const source=snapshot[c.owner];let amount=source[c.from]||0;if(c.from.endsWith('Flat'))amount*=1+(source[c.from.slice(0,-4)]||0)/100;let bonus=Math.min(Math.max(0,amount*c.ratio),c.cap>0?c.cap:Infinity);result[c.slot].values[c.to]=(result[c.slot].values[c.to]||0)+bonus;logs.push({slot:c.slot,key:c.to,value:bonus,label:c.label+' · 전환'});}
   for(let i=0;i<3;i++){let r=result[i],v=r.values;r.atk=Math.floor(v.atkFlat*(1+v.atk/100));r.def=Math.floor(v.defFlat*(1+v.def/100));r.hp=Math.floor(v.hpFlat*(1+v.hp/100));r.rawValues={...v};r.caps={};r.excess={};for(const [key,config] of Object.entries({crit:'MAX_CRITICAL_RATE',critDmg:'MAX_CRITICAL_DMG_RATE',suppress:'MAX_FORCE',groggy:'MAX_STAGGER',brawl:'MAX_TUSSLE',support:'MAX_SUPPORT_DMG',weakness:'MAX_WEAKNESS_ATK',cooldown:'MAX_SKILL_COOLDOWN'})){const cap=T.CHARACTER_CONFIG[config]?.VALUE/100;if(Number.isFinite(cap)){r.caps[key]=cap;r.excess[key]=Math.max(0,(v[key]||0)-cap);v[key]=Math.min(cap,v[key]||0);}}r.logs=logs.filter(l=>l.slot===i);}
   return {slots:result,effects,missing,detail};
  }
  return {T,L,loc,rows,by,compile,description,defaults,sanitize,character,card,optionKey,primeOption,effectList,calculate,fields,elements,names};
 }
 root.MongilStatsEngine={make};if(typeof module!=='undefined')module.exports=root.MongilStatsEngine;
})(typeof window!=='undefined'?window:globalThis);
