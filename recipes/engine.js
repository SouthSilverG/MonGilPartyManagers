(function(){
 'use strict';
 function create(data){
  const monsters=new Map(data.monsters.map(x=>[x.id,x])),byResult=new Map(),byIngredient=new Map();
  for(const recipe of data.recipes){
   if(!monsters.has(recipe.result)||recipe.ingredients.some(id=>!monsters.has(id)))throw new Error('조합 데이터에 없는 몬스터링입니다.');
   if(byResult.has(recipe.result))throw new Error('중복 결과 조합입니다.');
   byResult.set(recipe.result,recipe);
   for(const id of new Set(recipe.ingredients)){if(!byIngredient.has(id))byIngredient.set(id,[]);byIngredient.get(id).push(recipe);}
  }
  const normalize=value=>String(value).normalize('NFKC').toLocaleLowerCase('ko').replace(/[\s:!·]/g,'');
  function search(query){const q=normalize(query);return [...monsters.values()].filter(x=>normalize(x.name).includes(q)).sort((a,b)=>(normalize(b.name)===q)-(normalize(a.name)===q)||Number(byResult.has(b.id))-Number(byResult.has(a.id))||a.name.localeCompare(b.name,'ko'));}
  function tree(id,path=new Set()){
   if(path.has(id))throw new Error('순환 조합입니다.');
   const recipe=byResult.get(id),next=new Set(path);next.add(id);
   return {monster:monsters.get(id),recipe:recipe||null,children:recipe?recipe.ingredients.map(child=>tree(child,next)):[]};
  }
  function leaves(id){const counts=new Map();function visit(node){if(!node.recipe){counts.set(node.monster.id,(counts.get(node.monster.id)||0)+1);return;}node.children.forEach(visit);}visit(tree(id));return [...counts].map(([key,count])=>({...monsters.get(key),count}));}
  function ancestors(id){const found=new Set(),queue=[id];while(queue.length){const current=queue.shift();for(const recipe of byIngredient.get(current)||[])if(recipe.result!==id&&!found.has(recipe.result)){found.add(recipe.result);queue.push(recipe.result);}}return [...found].map(key=>monsters.get(key));}
  // These trees include all ingredients of every reachable final result, not only the searched branch.
  function roots(id){const all=ancestors(id),keys=new Set(all.map(x=>x.id));return all.filter(x=>!(byIngredient.get(x.id)||[]).some(recipe=>keys.has(recipe.result)));}
  return {monsters,byResult,byIngredient,search,tree,leaves,ancestors,roots};
 }
 window.MongilRecipeEngine=Object.freeze({create});
})();
