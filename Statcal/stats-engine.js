/* Pure calculation core. Source values use 100 = 1 percentage point. */
(function(root){
 'use strict';
 const fields={70:'ultimateGauge',112:'brawler',114:'destroyer',116:'slayer',118:'supporter',5:'roleFlat',111:'brawlerFlat',113:'destroyerFlat',115:'slayerFlat',117:'supporterFlat',1:'atkFlat',2:'defFlat',3:'hpFlat',85:'atk',86:'def',96:'hp',4:'crit',6:'critDmg',8:'penetration',97:'suppress',108:'groggy',73:'weakness',102:'earthRes',109:'normal',110:'boss',78:'support',107:'brawl',11:'fire',13:'ice',15:'lightning',17:'wind',19:'earth',29:'physical',76:'cooldown'};
 const positionWeights=[0,2083,1889,1724,1588,1334,1250,1177,1111,1053,935,874,819,772,730,660,629,600,574,551,510,485,462,442,423,395,380,366,353,341,322,282,273,264,256,244,237,230,224,218,209,191,186,181,176,170,166,162,158,154,149,139,136,133,130,126,123,121,118,116,113,107,104,102,100,98,96,94,92,91,89,85,83,81,80,78,77,76,74,73,72,69,68,67,65,64,63,62,61,60,59,57,56,56,55,54,53,52,51,51,49];
 const roleConversions={1:{from:'brawlerFlat',to:'brawl'},2:{from:'slayerFlat',to:'suppress'},3:{from:'destroyerFlat',to:'groggy'},4:{from:'supporterFlat',to:'support'}};
 const elements={1:'physical',2:'fire',3:'ice',4:'lightning',5:'wind',6:'earth'};
 const names={specialAtk:'특수 스킬 한정 공격력 증가',basicDamage:'기본 공격 피해',specialDamage:'특수 스킬 피해',ultimateDamage:'궁극 스킬 피해',tagDamage:'교체 스킬 피해',damageReduction:'받는 피해 감소',ultimateGauge:'궁극 스킬 충전율',roleFlat:'역할 특화',brawlerFlat:'난투',destroyerFlat:'파괴',slayerFlat:'암살',supporterFlat:'지원',atk:'공격력',def:'방어력',hp:'체력',crit:'치명타 확률',critDmg:'치명타 피해',penetration:'관통률',suppress:'제압 피해',groggy:'무력화 피해',weakness:'약점 속성 피해',boss:'보스 몬스터 피해',support:'지원 피해',brawl:'난전 피해',fire:'불 속성 피해',ice:'얼음 속성 피해',lightning:'번개 속성 피해',wind:'바람 속성 피해',earth:'땅 속성 피해',physical:'물리 속성 피해'};
 const plain=s=>String(s||'').replace(/<[^>]*>/g,'').replace(/\\n/g,'\n');
 function make(data){
  const T=data.tables,L=data.local,rows=n=>Object.values(T[n]||{}),loc=k=>plain(L[k]||''),by=(n,f,v)=>rows(n).filter(r=>r[f]===v);
  const cache=new Map(),parameterGroups=new Map(),cantoOverrides=new Map();
  for(const [id,p] of Object.entries(T.ABILITY_PARAMETER)){const list=parameterGroups.get(p.ABILITY_GROUP_ID)||[];list.push({...p,sourceId:Number(id)});parameterGroups.set(p.ABILITY_GROUP_ID,list);}
  for(const p of rows('ABILITY_PARAMETER_CANTO')){const list=cantoOverrides.get(p.ABILITY_PARAMETER_ID)||[];list.push(p);cantoOverrides.set(p.ABILITY_PARAMETER_ID,list);}
  function resolve(token,canto,level){
   if(!token.includes(':'))return Number.isFinite(Number(token))?Number(token):null;
   let [kind,id]=token.split(':');id=id.replace('+LV',String(Math.max(1,level||1)).padStart(2,'0'));
   let p=T.ABILITY_PARAMETER[id];
   if(kind.startsWith('AbilityCanto'))p=T.ABILITY_PARAMETER_CANTO[id];
   if(p){
    const override=rows('ABILITY_PARAMETER_CANTO').find(r=>r.ABILITY_PARAMETER_ID===Number(id)&&r.CANTO_LEVEL_MIN<=canto&&r.CANTO_LEVEL_MAX>=canto);
    p=override?{...p,...override}:p;
    const m=kind.match(/_P([1-6])/);
    if(m){let v=p['PARAM_'+m[1]];if(kind.includes('Skill_Type')||kind.endsWith('_S_T'))return ({0:'기본 공격',1:'특수 스킬',2:'궁극 스킬',3:'교체 스킬',7:'지원 스킬'})[v]||v;if(kind.includes('Elemental_Type'))return names[elements[v]]?.replace(' 속성 피해','')||v;if(kind.includes('Status_Type')||kind.endsWith('_Stat'))return names[fields[v]]||v;if(kind.endsWith('_R'))return v/(p.ABILITY_TYPE===1389&&m[1]==='2'?100000:100);if(kind.endsWith('_T'))return v/1000;return v;}
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
   let pars=parameters(gid,canto,level);
   let conversions=[],deltas=[],remainder=[];
   // Conversion parameters directly name the source and destination status codes.
   for(const p of pars){
    if(p.ABILITY_TYPE===1389&&fields[p.PARAM_1]&&fields[p.PARAM_3])conversions.push({from:fields[p.PARAM_1],to:fields[p.PARAM_3],truncatePercent:true,ratio:p.PARAM_2/1000000,cap:p.PARAM_4/(String(fields[p.PARAM_3]).endsWith('Flat')?1:100)});
    if(p.ABILITY_TYPE===10093&&fields[p.PARAM_1]&&({0:'basicDamage',1:'specialDamage',2:'ultimateDamage',3:'tagDamage',7:'support'})[p.PARAM_3])conversions.push({from:fields[p.PARAM_1],to:({0:'basicDamage',1:'specialDamage',2:'ultimateDamage',3:'tagDamage',7:'support'})[p.PARAM_3],ratio:p.PARAM_2/10000,cap:p.PARAM_4/100});
    if(p.ABILITY_TYPE===10048&&fields[p.PARAM_1]&&fields[p.PARAM_3])conversions.push({from:fields[p.PARAM_1],to:fields[p.PARAM_3],ratio:p.PARAM_2/10000,cap:p.PARAM_4/(String(fields[p.PARAM_3]).endsWith('Flat')?1:100)});
   }
   const keyAliases=[['기본 공격 피해','basicDamage'],['특수 스킬 피해','specialDamage'],['궁극 스킬 피해','ultimateDamage'],['교체 스킬 피해','tagDamage'],['공격력','atk'],['방어력','def'],['최대 체력','hp'],['치명타 확률','crit'],['치명타 피해','critDmg'],['관통률','penetration'],['제압 피해','suppress'],['무력화 피해','groggy'],['약점 속성 피해','weakness'],['보스 몬스터 피해','boss'],['지원 피해','support'],['난전 피해','brawl'],['불 속성 피해','fire'],['얼음 속성 피해','ice'],['바람 속성 피해','wind'],['번개 속성 피해','lightning'],['땅 속성 피해','earth'],['물리 속성 피해','physical']];
   if(!conversions.length)for(const [label,key] of keyAliases){
    const rx=new RegExp(label+'(?:가|이|은|는|의)?\\s*([0-9]+(?:\\.[0-9]+)?)%?\\s*(?:로\\s*)?증가','g');let m;
    while((m=rx.exec(text))){const before=text.slice(Math.max(0,m.index-22),m.index);if(/(?:특수 스킬|기본 공격|궁극 스킬|교체 스킬)(?:의|에만|에\s+한정)\s*$/.test(before)&&!['groggy','boss'].includes(key)){remainder.push(m[0]+' (특정 스킬 한정)');continue;}deltas.push({key,value:Number(m[1])});}
   }
   for(const p of pars)if(p.ABILITY_TYPE===1157){const key=({0:'basicDamage',1:'specialDamage',2:'ultimateDamage',3:'tagDamage',7:'support'})[p.PARAM_1];if(key&&!deltas.some(d=>d.key===key))deltas.push({key,value:p.PARAM_2/100});}
   if(!text&&conversions.length)text=conversions.map(c=>(names[c.from]||c.from)+'의 '+(c.ratio*100)+'%만큼 '+(names[c.to]||c.to)+' 증가'+(c.cap?' (최대 '+c.cap+'%)':'')).join(' / ');
   if(!deltas.some(d=>d.key==='penetration'))for(const p of pars)if(p.ABILITY_TYPE===1395)deltas.push({key:'penetration',value:p.PARAM_1/100});
   const max=Math.max(1,...pars.map(p=>p.MAX_STACK||1),Number((text.match(/최대\s*(\d+)\s*(?:회|중첩)/)||[])[1])||1);
   const result={gid:Number(gid),title:loc(info.ABILITY_GROUP_TITLE_LOCAL)||'효과 '+gid,text,deltas,conversions,maxStack:max,conditional:/시[,\s]|동안|중첩|보유|적중|성공|피격|발동|일정|공격 시/.test(text),team:/모든 팀원|팀원의|팀원에게|파티원/.test(text),unsupported:!deltas.length&&!conversions.length,remainder};cache.set(ck,result);return result;
  }
  function parameters(gid,canto=0,level=1){const all=parameterGroups.get(Number(gid))||[];const chosen=Math.max(1,...all.filter(p=>p.ABILITY_SKILL_LEVEL<=level).map(p=>p.ABILITY_SKILL_LEVEL));return all.filter(p=>p.ABILITY_SKILL_LEVEL===chosen).map(p=>{const ov=(cantoOverrides.get(p.sourceId)||[]).find(r=>r.CANTO_LEVEL_MIN<=canto&&r.CANTO_LEVEL_MAX>=canto);return ov?{...p,...ov}:p;});}
  function linkedEffects(roots,canto,level){const found=new Map(),visited=new Set();function visit(gid,team=false,targetElement=0){const key=[gid,team,targetElement].join(':');if(!gid||visited.has(key))return;visited.add(key);const e=compile(gid,canto,level);if(!e.unsupported)found.set(gid,{...e,team:e.team||team,targetElement});for(const p of parameters(gid,canto,level)){if(p.ABILITY_TYPE===501){const cond=T.ABILITY_CONDITION[p.PARAM_1];visit(p.PARAM_4,team,cond?.ABILITY_CONDITION_INVOKE===2&&T.CHARACTER_LIST[cond.CONDITION_VALUE]&&cond.TARGET_ELEMENTAL?cond.TARGET_ELEMENTAL:targetElement);}if(p.ABILITY_TYPE===503)visit(p.PARAM_2,p.PARAM_1===6||team,p.PARAM_1===6&&elements[p.PARAM_4]?p.PARAM_4:targetElement);}}for(const g of roots)visit(g);return [...found.values()];}
  function sanctuaryEffect(cid,q){const c=T.CHARACTER_LIST[cid];const unlocked=rows('DUNGEON_ELEMENTAL_BONUS').filter(r=>r.ELEMENTAL===c.ELEMENTAL_TYPE&&r.BONUS_TYPE===1&&r.LEVEL<=q.sanctuary).reduce((n,r)=>n+(r.PARAM1||0),0);if(!unlocked)return null;const candidates=rows('DUNGEON_ELEMENTAL_SKILL').filter(r=>r.CHARACTER_ID===cid&&r.CANTO<=q.canto&&r.SKILL_LEVEL<=unlocked).sort((a,b)=>b.CANTO-a.CANTO||b.SKILL_LEVEL-a.SKILL_LEVEL);const row=candidates[0];if(!row)return null;const text=description(row.ABIL_LOCAL_DESC,row.ABIL_LOCAL_DESC_PARAM,q.canto,row.SKILL_LEVEL),deltas=[];const aliases=[['공격력','atk'],['치명타 확률','crit'],['치명타 피해','critDmg'],['관통률','penetration'],['기본 공격 피해','basicDamage'],['특수 스킬 피해','specialDamage'],['궁극 스킬 피해','ultimateDamage'],['불 속성 피해','fire'],['얼음 속성 피해','ice'],['바람 속성 피해','wind'],['번개 속성 피해','lightning'],['땅 속성 피해','earth']];for(const [label,key] of aliases){const rx=new RegExp(label+'(?:가|이|은|는)?\\s*([\\d.]+)%\\s*증가','g');for(const m of text.matchAll(rx))deltas.push({key,value:Number(m[1])});}const reduced=text.match(/받는 피해가?\s*([\d.]+)%\s*감소/);if(reduced)deltas.push({key:'damageReduction',value:Number(reduced[1])});let targetElement=0;for(const [label,id] of [['물리',1],['불',2],['얼음',3],['번개',4],['바람',5],['땅',6]])if(text.replace(/편성된 [^,.]+명 이상[^,.]*[,.]?/g,'').includes(label+' 속성 팀원'))targetElement=id;const team=/모든 팀원|속성 팀원|교체된 팀원/.test(text);const count=text.match(/편성된 (불|얼음|번개|바람|땅) 속성 팀원이 (\d+)명 이상/);return {gid:row.ABIL_GROUP_ID[0],title:loc(row.ABIL_LOCAL_TITLE)||'성소 해금 스킬',text,deltas,conversions:[],maxStack:Number(text.match(/최대\s*(\d+)중첩/)?.[1])||1,team,targetElement,conditional:true,unsupported:false,nonStat:!deltas.length,conditionCount:count?{element:({불:2,얼음:3,번개:4,바람:5,땅:6})[count[1]],count:Number(count[2])}:null,level:row.SKILL_LEVEL,remainder:[]};}
  function artifactEffects(aid,ov,q){
   const root=compile(ov.OPTION_VALUE,q.canto,q.skillLevel),found=[],seen=new Set();
   const skillKeys={0:'basicDamage',1:'specialDamage',2:'ultimateDamage',3:'tagDamage',7:'support'};
   function visit(gid){if(!gid||seen.has(gid))return;seen.add(gid);const ps=parameters(gid,q.canto,q.skillLevel),deltas=[],conversions=[];
    for(const p of ps){const direct={1105:'atk',1106:'atk',1111:'crit',1131:'critDmg',1385:'groggy',1159:'ultimateGauge'}[p.ABILITY_TYPE];
     if(direct)deltas.push({key:direct,value:p.PARAM_1/100*(p.ABILITY_TYPE===1106?-1:1),stacks:Math.max(1,p.MAX_STACK||1)});
     if(p.ABILITY_TYPE===10044&&elements[p.PARAM_1])deltas.push({key:elements[p.PARAM_1],value:p.PARAM_2/100,stacks:Math.max(1,p.MAX_STACK||1)});
     if(p.ABILITY_TYPE===1157&&skillKeys[p.PARAM_1])deltas.push({key:skillKeys[p.PARAM_1],value:p.PARAM_2/100,stacks:Math.max(1,p.MAX_STACK||1)});
     if([10048,10093,1389].includes(p.ABILITY_TYPE)){const e=compile(gid,q.canto,q.skillLevel);for(const c of e.conversions)if(!conversions.some(x=>JSON.stringify(x)===JSON.stringify(c)))conversions.push({...c,offset:p.ABILITY_TYPE===10093?p.PARAM_5/100:0});}
     if(p.ABILITY_TYPE===501)visit(p.PARAM_4);if(p.ABILITY_TYPE===503)visit(p.PARAM_2);if([200,205,1393].includes(p.ABILITY_TYPE))visit(p.PARAM_3);
    }
    if(!deltas.length&&!conversions.length)return;
    let team=false,targetElement=0,targetRange=0;
    const child=gid!==Number(ov.OPTION_VALUE);
    if(aid===1100011&&child)team=true;
    if(aid===1100024&&child)team=true;
    if([1100032,1100038,1100050,1100051].includes(aid))team=true;
    if(aid===1100036){team=true;const edge=parameters(ov.OPTION_VALUE,q.canto,q.skillLevel).find(p=>p.PARAM_4===gid);targetElement=edge?.PARAM_1===10134?3:0;}
    if(aid===1100050&&deltas.some(d=>d.key==='basicDamage'))targetElement=6;
    if(aid===1100051&&deltas.some(d=>d.key==='critDmg'))targetElement=2;
    if(aid===1100042)targetRange=2;
    if(aid===1100031&&deltas.some(d=>d.key==='groggy'&&d.value<15))return; // strengthened state replaces its base state
    if(aid===1100048)for(const c of conversions)if(c.to==='atk')c.to='specialAtk';
    found.push({...root,gid,team,targetElement,targetRange,deltas,conversions,maxStack:Math.max(1,...deltas.map(d=>d.stacks)),conditional:child||root.conditional,unsupported:false,label:'아티팩트 · '+loc(T.ITEM_CUBE[aid].ITEM_NAME_LOCAL)+(targetElement?' / '+names[elements[targetElement]]+' 캐릭터':'')});
   }
   visit(ov.OPTION_VALUE);
   if(!found.length)found.push({...root,deltas:[],conversions:[],unsupported:true,label:'아티팩트 · '+loc(T.ITEM_CUBE[aid].ITEM_NAME_LOCAL),remainder:['캐릭터 스탯 증가 외 효과: 보호막·회복·자원 충전 등은 합산 제외']});
   return found;
  }
  function emptySlot(){return {level:60,levelGrade:4,canto:0,artifactLevel:60,artifactGrade:4,overlap:1,skillLevel:1,sanctuary:0,ring:{ring1:{grade:5,slot:'A',level:60,levelGrade:0,values:[0,0,0,0]},ring2:{grade:5,slot:'A',level:60,levelGrade:0,values:[0,0,0,0]},ring3:{grade:5,slot:'A',level:60,levelGrade:0,values:[0,0,0,0]}},legend:{grade:5,slot:'A',level:60,levelGrade:4,values:[0,0,0,0],types:[null,null,null,null]},equipment:{},effects:{}};}
  function defaults(){return {version:3,autoEffects:true,foodMain:null,foodSide:null,legendOptions:{},sanctuaryLevels:{},slots:[emptySlot(),emptySlot(),emptySlot()]};}
  function sanitize(raw){const d=defaults(),num=(v,min,max,def)=>Number.isFinite(Number(v))?Math.min(max,Math.max(min,Number(v))):def;if(!raw||typeof raw!=='object')return d;
   d.autoEffects=raw.autoEffects!==false;
   const uniqueTypes=a=>{const seen=new Set();return Array.from({length:4},(_,i)=>{const v=a?.[i];if(typeof v!=='string'||seen.has(v))return null;seen.add(v);return v;});};
   for(const [id,a] of Object.entries(raw.legendOptions||{}))if(data.maps.legends[id])d.legendOptions[id]=uniqueTypes(a);
   for(const [elm,v] of Object.entries(raw.sanctuaryLevels||{}))if(elements[elm])d.sanctuaryLevels[elm]=num(v,0,50,0);
   for(const f of ['foodMain','foodSide'])if(typeof raw[f]==='string'&&T.ITEM_LIST[raw[f]]?.ITEM_TYPE===41)d[f]=raw[f];
   if(d.foodMain===d.foodSide)d.foodSide=null;
   d.slots=d.slots.map((s,i)=>{let r=raw.slots?.[i];if(!r||typeof r!=='object')return s;for(const [f,min,max] of [['level',1,60],['levelGrade',0,6],['canto',0,6],['artifactLevel',1,60],['artifactGrade',0,5],['overlap',1,5],['skillLevel',1,16],['sanctuary',0,50]])s[f]=num(r[f],min,max,s[f]);
    for(const k of ['ring1','ring2','ring3','legend']){let q=k==='legend'?r.legend:r.ring?.[k],z=k==='legend'?s.legend:s.ring[k];if(q){for(const [f,min,max] of [['grade',1,5],['level',1,60],['levelGrade',0,4]])z[f]=num(q[f],min,max,z[f]);z.grade=5;z.level=60;z.slot=['A','B','C'].includes(q.slot)?q.slot:'A';z.values=Array.from({length:4},(_,j)=>num(q.values?.[j],0,10000,0));if(k==='legend'){z.types=uniqueTypes(q.types);z.monsterId=typeof q.monsterId==='string'?q.monsterId:null;}}}
    for(const [k,q] of Object.entries(r.equipment||{}))if(['hat','top','gloves','shoes'].includes(k)&&q&&typeof q==='object')s.equipment[k]={atk:num(raw.version>=2?q.atk:0,0,100000,0),crit:num(q.crit,0,10000,0),critDmg:num(q.critDmg,0,10000,0),mainType:fields[Number(q.mainType)]?Number(q.mainType):1,mainValue:num(q.mainValue,0,100000,0)};
    for(const [k,q] of Object.entries(r.effects||{}))if(/^[-\w:]+$/.test(k)&&q&&typeof q==='object')s.effects[k]={on:q.on===true,stacks:num(q.stacks,1,100,1),scope:q.scope==='team'?'team':'self'};s.level=60;s.levelGrade=4;s.artifactLevel=60;s.artifactGrade=4;return s;});return d;
  }
  function shared(party,raw){const d=sanitize(raw);
   party.slots.forEach((s,i)=>{const id=s.legendMonster,q=d.slots[i].legend;if(id&&!Object.hasOwn(d.legendOptions,id)){const candidates=party.slots.map((other,j)=>({other,q:d.slots[j].legend})).filter(x=>x.other.legendMonster===id&&(!x.q.monsterId||x.q.monsterId===id));const chosen=candidates.find(x=>x.q.types.some(Boolean));d.legendOptions[id]=chosen?[...chosen.q.types]:[null,null,null,null];}if(id){q.types=[...d.legendOptions[id]];q.monsterId=id;}else{q.types=[null,null,null,null];q.monsterId=null;}
    const elm=character(s.character)?.ELEMENTAL_TYPE;if(elm&&!Object.hasOwn(d.sanctuaryLevels,elm))d.sanctuaryLevels[elm]=Math.max(...party.slots.map((x,j)=>character(x.character)?.ELEMENTAL_TYPE===elm?d.slots[j].sanctuary:0));
   });party.slots.forEach((s,i)=>{const elm=character(s.character)?.ELEMENTAL_TYPE;if(elm)d.slots[i].sanctuary=d.sanctuaryLevels[elm];});return d;
  }
  function character(id){const cid=Number(data.maps.characters[id]);return [102501,104201,104301].includes(cid)?null:T.CHARACTER_LIST[cid]||null;}
  function card(id,kind,grade){let first=T.ITEM_CARD[data.maps[kind][id]];if(!first)return null;return rows('ITEM_CARD').find(r=>r.MONSTER_ID===first.MONSTER_ID&&r.RARE_GRADE===grade)||first;}
  function optionKey(id,element){const k={trait_atk:'atk',trait_def:'def',trait_hp:'hp',trait_crit_rate:'crit',trait_crit_dmg:'critDmg',trait_support_dmg:'support',trait_suppress_dmg:'suppress',trait_brawl_dmg:'brawl',trait_incap_dmg:'groggy',trait_normal_monster_dmg:'normal',trait_skill_cd:'cooldown',trait_skill_cooldown:'cooldown',trait_boss_monster_dmg:'boss',trait_earth_res:'earthRes',trait_weak_dmg:'weakness',trait_weakness_dmg:'weakness',trait_physical_dmg:'physical',trait_fire_dmg:'fire',trait_ice_dmg:'ice',trait_wind_dmg:'wind',trait_lightning_dmg:'lightning',trait_earth_dmg:'earth'}[id];return k||null;}
  function primeOption(id,cardRow){const key=optionKey(id),code=Object.keys(fields).find(n=>fields[n]===key);if(!code||!cardRow)return null;const candidates=by('CARD_OPTION_GROUP','STATUS_GROUP',cardRow.CARD_STATUS_GROUP).filter(r=>r.STATUS_TYPE===Number(code)&&r.CARD_OPTION_RANK===5);const row=candidates[0];return row?{key,value:row.STATUS_VALUE/(key.endsWith('Flat')?1:100),row}:null;}
  function effectList(party,detail){let out=[];
   party.slots.forEach((s,i)=>{const c=character(s.character),q=detail.slots[i];if(!c)return;
    const push=(gid,key,label,forced={})=>{const e=compile(gid,q.canto,q.skillLevel);let targetElement=0;for(const [name,n] of [['물리',1],['불',2],['얼음',3],['번개',4],['바람',5],['땅',6]])if(new RegExp(name+'\\s*속성(?:인|의)?\\s*(?:캐릭터|팀원)').test(e.text))targetElement=n;if(/같은 속성/.test(e.text))targetElement=c.ELEMENTAL_TYPE;out.push({...e,owner:i,key:i+':'+key,label,targetElement,...forced});};
    const sets={};for(const id of Object.values(s.equipment)){const group=data.maps.equipmentSets?.[id];if(group)sets[group]=(sets[group]||0)+1;}for(const [group,count] of Object.entries(sets))for(const r of rows('EQUIP_SET'))if(r.SET_OPTION_GROUP===Number(group)&&r.SET_COUNT<=count)push(r.ITEM_ABILITY_GROUP,'set-'+r.ITEM_ABILITY_GROUP,'장비 '+r.SET_COUNT+'세트');
    let a=T.ITEM_CUBE[data.maps.artifacts[s.artifact]],ov=a&&rows('CUBE_OVERLAP').find(r=>r.CUBE_ID===Number(data.maps.artifacts[s.artifact])&&r.OVERLAP_LEVEL===q.overlap);if(ov){push(ov.OPTION_VALUE,'artifact','아티팩트');for(const n of [3,5])if(q.overlap>=n&&ov['FUSION_VALUE_'+n])push(ov['FUSION_VALUE_'+n],'artifact-fusion-'+n,'아티팩트 결합 '+n+'단계');}
    if(ov){out=out.filter(e=>e.key!==i+':artifact');for(const e of artifactEffects(Number(data.maps.artifacts[s.artifact]),ov,q))out.push({...e,owner:i,key:i+':artifact-node-'+e.gid});}
    for(const rk of ['ring1','ring2','ring3']){let r=card(s.ringMonsters[rk],'monsters',q.ring[rk].grade);if(r)push(r.ABILITY_VALUE,rk,rk.replace('ring','몬스터링 '));}
    let legend=card(s.legendMonster,'legends',q.legend.grade);if(legend)for(const f of ['ABILITY_VALUE','ABILITY_LEGEND_01','ABILITY_LEGEND_02'])if(legend[f])push(legend[f],'legend-'+f,'전설 몬스터링');
    // Verified activation/target rules for the example party. Enhanced versions replace their base versions.
    const cid=Number(data.maps.characters[s.character]);
    let verified=[];
    if(cid===101401)verified=[[q.canto>=4?101435:101406,'나래 · 특수 스킬 / 얼음 팀원',{team:true,targetElement:3,conditional:true}], [101416,'나래 · 보호막 보유',{conditional:true}]];
    if(cid===101401)verified.push([q.canto>=4?101436:101432,'나래 · 얼음 팀원 특수 스킬 피해',{team:true,targetElement:3,conditional:true}],[q.canto>=4?101437:101433,'나래 · 얼음 외 원거리 팀원 특수 스킬 피해',{team:true,excludeElement:3,targetRange:2,conditional:true}]);
    if(cid===101401&&q.canto>=2)verified.push([101418,'나래 · 돌파 2 / 보호막 획득',{team:true,conditional:true}]);
    if(cid===101901)verified=[[101929,'이자벨라 · 빙결 발동',{conditional:true}],[101928,'이자벨라 · 빙결 / 무력화 피해 전환',{conditional:true}]];
    if(cid===101901)verified.push([101938,'이자벨라 · 특수 스킬 / 에너지 100 소모',{conditional:true}]);
    if(cid===101901&&q.canto>=6)verified.push([101952,'이자벨라 · 돌파 6 / 빙결 발동',{conditional:true}]);
    if(cid===101901&&q.canto>=2)verified.push([101954,'이자벨라 · 에너지 획득',{conditional:true}]);
    if(cid===104001)verified=[[q.canto>=6?104009:104007,'서머 프란시스 · 여름 검진 결과',{team:true,conditional:true}],[q.canto>=6?104008:104006,'서머 프란시스 · 땅 팀원',{team:true,targetElement:6,conditional:true}]];
    if(cid===104001&&q.canto>=2)verified.push([104003,'서머 프란시스 · 돌파 2 / 지원·궁극 스킬',{team:true,conditional:true,maxStack:3}]);
    if(verified.length)for(const [gid,label,rules] of verified)push(gid,'skill-'+gid,label,rules);
    const skillRoots=rows('CHARACTER_SKILL_LEVEL').filter(r=>{const sk=T.CHARACTER_SKILL[r.SKILL_ID];return sk&&sk.SKILL_SET_ID===c.SKILL_SET_ID&&[1,2,3,4,7].includes(sk.SKILL_TYPE)&&sk.CANTO_LEVEL<=q.canto&&r.SKILL_LEVEL===q.skillLevel;}).flatMap(r=>r.ACTION_ABILITY_GROUP_ID||[]);
    const excluded=new Set([...(cid===101401?[101406,101435,101416,101418,101432,101433,101436,101437]:[]),...(cid===104001?[104003,104006,104007,104008,104009]:[]),...(cid===101901?[101929,101928,101938,101952,101954]:[])]);
    for(const e of linkedEffects(skillRoots,q.canto,q.skillLevel))if(!excluded.has(e.gid)&&!out.some(x=>x.owner===i&&x.gid===e.gid))out.push({...e,owner:i,key:i+':linked-'+e.gid,label:'패시브·교체·전투 스킬',conditional:true});
    const sanctuary=sanctuaryEffect(cid,q);if(sanctuary)out.push({...sanctuary,owner:i,key:i+':sanctuary-'+sanctuary.gid,label:'성소 해금 '+sanctuary.level+'레벨'});
    for(const [id,r] of Object.entries(T.CHARACTER_CANTO))if(r.CHARACTER_ID===cid&&r.CANTO_LEVEL<=q.canto)for(const g of r.ABILITY_GROUP_ADD||[])if(g&&!verified.some(v=>v[0]===g))push(g,'canto-'+r.CANTO_LEVEL+'-'+g,'돌파 '+r.CANTO_LEVEL,{conditional:true});
   });return out;
  }
  function calculate(party,raw){const detail=shared(party,raw),effects=effectList(party,detail);let logs=[],missing=[];
   const result=party.slots.map((s,i)=>{const c=character(s.character),q=detail.slots[i],v={atkFlat:0,defFlat:0,hpFlat:0,atk:0,def:0,hp:0,crit:T.CHARACTER_CONFIG.BASE_CRITICAL_RATE.VALUE/100,critDmg:T.CHARACTER_CONFIG.BASE_CRITICAL_DMG_RATE.VALUE/100,weakness:T.CHARACTER_CONFIG.BASE_WEAKNESS_ATK.VALUE/100,support:T.CHARACTER_CONFIG.BASE_SUPPORT_DMG.VALUE/100,ultimateGauge:T.CHARACTER_CONFIG.GET_ULTIMATE_GAUGE_RATE.VALUE/100};
    if(!c)return {selected:false,values:v,element:null,logs:[],warnings:[]};let warnings=[];
    const add=(key,value,label)=>{v[key]=(v[key]||0)+value;logs.push({slot:i,key,value,label});};
    let base=by('CHARACTER_STATUS','STATUS_GROUP_ID',c.STATUS_GROUP_ID).filter(r=>r.LEVEL===q.level).sort((a,b)=>Math.abs(a.LEVEL_GRADE-q.levelGrade)-Math.abs(b.LEVEL_GRADE-q.levelGrade))[0];if(base){add('atkFlat',base.ATK,'캐릭터 기본');add('defFlat',base.DEF,'캐릭터 기본');add('hpFlat',base.HP,'캐릭터 기본');for(const [col,key] of [['BRAWLER','brawlerFlat'],['DESTROYER','destroyerFlat'],['SLAYER','slayerFlat'],['SUPPORTER','supporterFlat']])if(base[col])add(key,base[col],'캐릭터 기본 역할');}else warnings.push('선택한 캐릭터의 기본 스탯 없음');
    const addStats=(r,label)=>{const map={ATK:'atkFlat',DEF:'defFlat',HP:'hpFlat',CRITICAL_RATE:'crit',CRITICAL_DAMAGE:'critDmg',ATK_RATE:'atk',DEF_RATE:'def',FIRE_ATK:'fire',ICE_ATK:'ice',WIND_ATK:'wind',EARTH_ATK:'earth',LIGHTNING_ATK:'lightning'};for(const [f,key] of Object.entries(map))if(r?.[f])add(key,r[f]/(key.endsWith('Flat')?1:100),label);};
    for(const rk of ['ring1','ring2','ring3','legend']){const z=rk==='legend'?q.legend:q.ring[rk],id=rk==='legend'?s.legendMonster:s.ringMonsters[rk],r=card(id,rk==='legend'?'legends':'monsters',z.grade);if(!r){if(id)warnings.push('몬스터링 원본 미연결: '+id);continue;}
     const candidates=by('CARD_STATUS','STATUS_GROUP_ID',r['STATUS_TYPE_'+z.slot]).filter(x=>x.LEVEL===z.level);const st=candidates.find(x=>x.LEVEL_GRADE===z.levelGrade)||candidates[0];addStats(st,rk==='legend'?'전설 몬스터링':'몬스터링 '+rk.slice(-1));const opts=rk==='legend'?z.types:s.rings[rk];opts.forEach((id,j)=>{const option=primeOption(id,r);if(option)add(option.key,option.value,(rk==='legend'?'전설 프라임 옵션':'몬스터링 프라임 옵션')+' '+(j+1));else if(id)warnings.push('계산 미지원 몬스터링 옵션: '+id);});}
    let a=T.ITEM_CUBE[data.maps.artifacts[s.artifact]];if(a){let rs=by('CUBE_STATUS','STATUS_GROUP_ID',a.CUBE_STATUS_GROUP_ID).filter(r=>r.LEVEL===q.artifactLevel),st=rs.find(r=>r.LEVEL_GRADE===q.artifactGrade)||rs[0];addStats(st,'아티팩트 기본');}else if(s.artifact)warnings.push('아티팩트 원본 미연결');
    for(const ek of ['hat','top','gloves','shoes'])if(s.equipment[ek]){const z=q.equipment[ek]||{};const primary=data.equipmentMax?.[ek];if(primary&&fields[primary.type])add(primary.type===5?({1:'brawlerFlat',3:'destroyerFlat',2:'slayerFlat',4:'supporterFlat'}[c.STATUS_TYPE]||'roleFlat'):fields[primary.type],primary.value,'장비 5등급 '+primary.level+'강 '+ek);for(const f of ['atk','crit','critDmg'])add(f==='atk'?'atkFlat':f,Number(z[f])||0,'장비 입력 '+ek);}
    for(const f of [detail.foodMain,detail.foodSide])if(f){for(const b of by('BOOSTER','BOOSTER_GROUP',Number(f))){const text=description(b.BOOSTER_DESC,b.BOOSTER_DESC_PARAM);const m=text.match(/(공격력|방어력|최대 체력|치명타 확률|치명타 피해|보스 몬스터 피해|제압 피해|무력화 피해|약점 속성 피해|지원 피해)\s*([\d.]+)%?\s*증가/);const k={'공격력':'atk','방어력':'def','최대 체력':'hp','치명타 확률':'crit','치명타 피해':'critDmg','보스 몬스터 피해':'boss','제압 피해':'suppress','무력화 피해':'groggy','약점 속성 피해':'weakness','지원 피해':'support'}[m?.[1]];if(k)add(k,Number(m[2]),'요리 · '+loc(T.ITEM_LIST[f].ITEM_NAME_LOCAL));else if(!/스태미나|회복/.test(text))warnings.push('계산 미지원 음식 효과: '+text);}}
    if(q.sanctuary){const bs=rows('DUNGEON_ELEMENTAL_BONUS').filter(r=>r.ELEMENTAL===c.ELEMENTAL_TYPE&&r.LEVEL<=q.sanctuary&&r.BONUS_TYPE===0);for(const b of bs)if(fields[b.PARAM1])add(fields[b.PARAM1],b.PARAM2/(fields[b.PARAM1].endsWith('Flat')?1:100),'속성의 성소 '+b.LEVEL+'단계');}
    return {selected:true,values:v,element:c.ELEMENTAL_TYPE,warnings,logs:[]};
   });
   let conversions=[];
   for(const e of effects){let settings=detail.slots[e.owner].effects[e.key],active=detail.autoEffects?!e.unsupported:(settings?settings.on:!e.conditional&&!e.scopeUnverified);e.applied=false;e.appliedTo=[];e.appliedStacks=detail.autoEffects?e.maxStack:Math.min(e.maxStack,settings?.stacks||1);if(e.conditionCount&&party.slots.filter(s=>character(s.character)?.ELEMENTAL_TYPE===e.conditionCount.element).length<e.conditionCount.count)active=false;if(!active)continue;if(!detail.autoEffects&&e.scopeUnverified&&!settings?.scope){missing.push(e.label+' 적용 대상 미확인');continue;}const team=e.team||(!detail.autoEffects&&settings?.scope==='team');const targets=(team?[0,1,2]:[e.owner]).filter(i=>result[i].selected&&(!e.targetElement||e.targetElement===result[i].element)&&(!e.excludeElement||e.excludeElement!==result[i].element)&&(!e.targetRange||character(party.slots[i].character)?.RANGE_TYPE===e.targetRange));e.appliedTo=targets;e.applied=targets.length>0;
    for(const i of targets){if(!result[i].selected||(e.targetElement&&e.targetElement!==result[i].element))continue;let stacks=e.appliedStacks;for(const d of e.deltas){const ds=detail.autoEffects?(d.stacks||stacks):Math.min(d.stacks||stacks,stacks);result[i].values[d.key]=(result[i].values[d.key]||0)+d.value*ds;logs.push({slot:i,key:d.key,value:d.value*ds,label:e.label});}for(const conv of e.conversions)conversions.push({slot:i,owner:e.owner,...conv,label:e.label});if(e.unsupported)result[i].warnings.push('계산 미지원: '+e.title);}
   }
   // User-provided level weights: only the character's own role converts to damage.
   party.slots.forEach((s,i)=>{const c=character(s.character),conversion=c&&roleConversions[c.STATUS_TYPE],weight=positionWeights[detail.slots[i].level];if(result[i].selected&&conversion&&Number.isFinite(weight))conversions.push({slot:i,owner:i,...conversion,ratio:weight/10000,truncatePercent:true,cap:0,label:'역할 능력치 · '+detail.slots[i].level+'레벨 환산'});});
   // Resolve dependencies once: role conversion precedes buffs derived from its result.
   const pending=[...conversions],ordered=[];while(pending.length){const idx=pending.findIndex(c=>!pending.some(other=>other!==c&&other.slot===c.owner&&other.to===c.from));if(idx<0){missing.push('순환 스탯 전환: '+pending.map(c=>c.label).join(', '));break;}ordered.push(pending.splice(idx,1)[0]);}
   for(const c of ordered){const source=result[c.owner].values;let amount=source[c.from]||0;if(c.from.endsWith('Flat'))amount*=1+(source[c.from.slice(0,-4)]||0)/100;let bonus=Math.min(Math.max(0,Math.max(0,amount-(c.offset||0))*c.ratio),c.cap>0?c.cap:Infinity);if(c.truncatePercent&&!c.to.endsWith('Flat'))bonus=Math.floor((bonus+1e-9)*100)/100;result[c.slot].values[c.to]=(result[c.slot].values[c.to]||0)+bonus;logs.push({slot:c.slot,key:c.to,value:bonus,label:c.label+' · 전환'});}
   for(let i=0;i<3;i++){let r=result[i],v=r.values;r.atk=Math.floor(v.atkFlat*(1+v.atk/100));r.def=Math.floor(v.defFlat*(1+v.def/100));r.hp=Math.floor(v.hpFlat*(1+v.hp/100));r.rawValues={...v};r.caps={};r.excess={};for(const [key,config] of Object.entries({crit:'MAX_CRITICAL_RATE',critDmg:'MAX_CRITICAL_DMG_RATE',suppress:'MAX_FORCE',groggy:'MAX_STAGGER',brawl:'MAX_TUSSLE',support:'MAX_SUPPORT_DMG',weakness:'MAX_WEAKNESS_ATK',damageReduction:'MAX_DMG_REDUCTION',cooldown:'MAX_SKILL_COOLDOWN'})){const cap=T.CHARACTER_CONFIG[config]?.VALUE/100;if(Number.isFinite(cap)){r.caps[key]=cap;r.excess[key]=Math.max(0,(v[key]||0)-cap);v[key]=Math.min(cap,v[key]||0);}}r.logs=logs.filter(l=>l.slot===i);}
   return {slots:result,effects,missing,detail};
  }
  return {T,L,loc,rows,by,compile,description,defaults,sanitize,shared,parameters,linkedEffects,sanctuaryEffect,character,card,optionKey,primeOption,effectList,calculate,artifactEffects,positionWeights,roleConversions,fields,elements,names};
 }
 root.MongilStatsEngine={make};if(typeof module!=='undefined')module.exports=root.MongilStatsEngine;
})(typeof window!=='undefined'?window:globalThis);
