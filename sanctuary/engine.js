(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MongilSanctuary=api;})(typeof window==='undefined'?globalThis:window,function(){
 'use strict';
 function create(data){
  const elements=new Map(data.elements.map(x=>[x.id,x])),groups=new Map(data.groups.map(x=>[x.id,x])),variants=new Map();
  for(const group of data.groups)for(const variant of group.variants)variants.set(variant.id,{group,variant});
  const normalize=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/\s+/g,'');
  function list(element,category=0,query=''){const q=normalize(query);return data.groups.filter(g=>g.element===element&&(!category||g.category===category)&&(!q||normalize([g.name,g.description,...g.variants.map(v=>v.description)].join(' ')).includes(q)));}
  function sanitize(element,ids){const selected=new Map();if(!elements.has(element))return selected;for(const id of Array.from(ids).slice(0,380)){const row=variants.get(String(id));if(row?.group.element===element)selected.set(row.group.id,row.variant.id);}return selected;}
  function toggle(element,selected,id){const next=sanitize(element,selected.values()),row=variants.get(id);if(!row||row.group.element!==element)return next;if(next.get(row.group.id)===id)next.delete(row.group.id);else next.set(row.group.id,id);return next;}
  function summary(element,selected){const valid=sanitize(element,selected.values());const rows=data.groups.filter(g=>valid.has(g.id)).map(g=>({group:g,variant:variants.get(valid.get(g.id)).variant}));return {rows,count:rows.length,level:rows.reduce((n,r)=>n+r.variant.level,0)};}
  function encode(element,selected){if(!elements.has(element))return '';const params=new URLSearchParams({element:String(element)}),ids=summary(element,selected).rows.map(r=>r.variant.id);if(ids.length)params.set('relics',ids.join(','));return '#'+params;}
  function decode(hash){const params=new URLSearchParams(String(hash).replace(/^#/,''));const element=Number(params.get('element'));return {element:elements.has(element)?element:null,selected:sanitize(element,(params.get('relics')||'').split(','))};}
  function payload(element,selected){return {app:'mongil-sanctuary',schema:1,element,relics:summary(element,selected).rows.map(r=>r.variant.id)};}
  function restore(raw){
   if(!raw||raw.app!=='mongil-sanctuary'||raw.schema!==1||!elements.has(raw.element)||!Array.isArray(raw.relics)||raw.relics.length>24)throw new Error('성소 선택 정보의 형식이 올바르지 않습니다.');
   const next=new Map();for(const id of raw.relics){const row=typeof id==='string'&&variants.get(id);if(!row||row.group.element!==raw.element||next.has(row.group.id))throw new Error('유물 선택 정보가 올바르지 않습니다.');next.set(row.group.id,id);}return {element:raw.element,selected:next};
  }
  return {elements,groups,variants,list,sanitize,toggle,summary,encode,decode,payload,restore};
 }
 return {create};
});
