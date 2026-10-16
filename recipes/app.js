(function(){
 'use strict';
 const graph=window.MongilRecipeEngine.create(window.MONGIL_RECIPES),input=document.getElementById('recipeSearch'),grid=document.getElementById('matchGrid'),detail=document.getElementById('recipeDetail'),more=document.getElementById('moreMatches');
 let selected=null,limit=12;
 const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;};
 function monsterButton(monster,cls='monster-chip',count){
  const button=el('button',cls);button.type='button';button.dataset.monsterId=monster.id;
  if(monster.id===selected)button.classList.add('is-selected');
  const img=el('img');img.src=monster.image;img.alt='';img.loading='lazy';img.width=56;img.height=56;button.append(img);
  const label=el('span','monster-label');label.append(el('strong','',monster.name));if(count)label.append(el('small','',`× ${count}`));button.append(label);
  if(monster.boss)button.append(el('span','boss-badge','BOSS'));
  button.addEventListener('click',()=>select(monster.id));return button;
 }
 function formula(node){
  const branch=el('li','recipe-branch'),card=el('div','formula');
  const materials=el('div','formula-materials');node.children.forEach((child,i)=>{if(i)materials.append(el('span','formula-plus','+'));materials.append(monsterButton(child.monster,'formula-monster'));});
  const arrow=el('div','formula-arrow');arrow.append(el('span','','→'),el('small','','100%'));
  const result=monsterButton(node.monster,'formula-monster formula-result');card.append(materials,arrow,result);branch.append(card);
  const children=node.children.filter(x=>x.recipe);if(children.length){const nested=el('ol','recipe-children');for(const child of children){const wrap=formula(child);wrap.prepend(el('p','branch-label',`${child.monster.name} 만드는 방법`));nested.append(wrap);}branch.append(nested);}
  return branch;
 }
 function treePanel(id){const list=el('ol','recipe-tree');list.append(formula(graph.tree(id)));return list;}
 function section(title,subtitle){const block=el('section','detail-section'),head=el('div','section-heading');head.append(el('h2','',title));if(subtitle)head.append(el('p','',subtitle));block.append(head);return block;}
 function renderDetail(){
  detail.replaceChildren();const monster=graph.monsters.get(selected);if(!monster)return;
  const hero=el('div','selected-heading');const img=el('img');img.src=monster.image;img.alt='';img.width=80;img.height=80;const text=el('div');text.append(el('p','recipe-eyebrow','SELECTED MONSTERLING'),el('h2','',monster.name));hero.append(img,text);detail.append(hero);
  if(graph.byResult.has(selected)){
   const ingredients=section('전체 재료 요약','하위 조합까지 펼친 기본 재료 · 완성품 1개 기준');const summary=el('div','material-summary');graph.leaves(selected).forEach(x=>summary.append(monsterButton(x,'monster-chip',x.count)));ingredients.append(summary);detail.append(ingredients);
   const making=section('만드는 방법','아래 조합을 먼저 완성한 뒤 위 조합의 재료로 사용하세요.');making.append(treePanel(selected));detail.append(making);
  }else{const base=section('기본 재료','이 몬스터링을 만드는 돌연변이 조합식은 등록되어 있지 않습니다.');detail.append(base);}
  const ancestors=graph.ancestors(selected),roots=graph.roots(selected);
  if(ancestors.length){
   const usages=section('이 재료로 만들 수 있어요',`선택한 몬스터링이 직접 또는 중간 재료로 쓰이는 결과 ${ancestors.length}종`),targets=el('div','related-targets');ancestors.forEach(x=>targets.append(monsterButton(x)));usages.append(targets);
   roots.forEach(x=>{const panel=el('div','upstream-panel');panel.append(el('h3','',`${x.name}까지 이어지는 전체 조합`),treePanel(x.id));usages.append(panel);});detail.append(usages);
  }else{detail.append(section('상위 조합','이 몬스터링을 재료로 사용하는 돌연변이 조합식은 없습니다.'));}
 }
 function renderMatches(){
  const matches=graph.search(input.value);grid.replaceChildren();for(const monster of matches.slice(0,limit)){const button=monsterButton(monster);button.setAttribute('aria-pressed',String(monster.id===selected));grid.append(button);}
  if(!matches.length)grid.append(el('p','empty-state','일치하는 몬스터링이 없습니다. 이름을 다시 확인해주세요.'));
  document.getElementById('matchCount').textContent=`${matches.length}종`;more.hidden=matches.length<=limit;
 }
 function select(id){if(!graph.monsters.has(id))return;selected=id;input.value=graph.monsters.get(id).name;limit=12;renderMatches();renderDetail();const url=new URL(location.href);url.hash=id;history.replaceState(null,'',url);}
 input.addEventListener('input',()=>{limit=12;const exact=graph.search(input.value).find(x=>x.name.replace(/\s/g,'')===input.value.replace(/\s/g,''));if(exact)select(exact.id);else renderMatches();});
 document.getElementById('searchForm').addEventListener('submit',event=>{event.preventDefault();const first=graph.search(input.value)[0];if(first)select(first.id);});
 document.getElementById('clearSearch').addEventListener('click',()=>{input.value='';limit=12;renderMatches();input.focus();});
 more.addEventListener('click',()=>{limit+=24;renderMatches();});
 for(const name of ['청영','석괴호','이매망량','콜로서스 얼터']){const monster=graph.search(name).find(x=>x.name===name);if(monster){const button=el('button','quick-button',name);button.type='button';button.addEventListener('click',()=>{input.value=name;limit=12;select(monster.id);});document.getElementById('quickSearch').append(button);}}
 window.addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(graph.monsters.has(id)){selected=id;renderMatches();renderDetail();}});
 const initial=location.hash.slice(1);select(graph.monsters.has(initial)?initial:graph.search('청영')[0].id);
})();
