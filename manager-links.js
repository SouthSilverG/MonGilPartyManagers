/* Shared sidebar for all party-manager tools. Resolve routes from this root script. */
(function(){'use strict';
 const root=new URL('.',document.currentScript.src),nav=document.querySelector('.app-sidebar__nav');if(!nav)return;
 const local=['localhost','127.0.0.1'].includes(location.hostname);
 const items=[['index.html','🎮','파티 에디터'],['Statcal/index.html','📊','상세 스탯 에디터'],['calculator/index.html','₩','과금 효율'],['sanctuary/index.html','✦','성소 시뮬레이터'],['equipment-score/index.html','◈','장비 부옵 점수'],[local?'http://127.0.0.1:8766/':'https://southsilverg.github.io/MonGilMonlingManager/','🧩','몬링 매니저 ↗']];
 nav.setAttribute('aria-label','도구 메뉴');const links=items.map(([path,icon,label],index)=>{const a=document.createElement('a');a.href=new URL(path,root).href;a.className='app-sidebar__item';const active=index<5&&new URL(a.href).pathname===location.pathname.replace(/\/$/,'/index.html');if(active){a.classList.add('is-active');a.setAttribute('aria-current','page');}if(index===5){a.target='_blank';a.rel='noopener noreferrer';}if(index===4)a.dataset.equipmentScoreLink='';if(index===5){a.dataset.monlingLink='';a.classList.add('manager-switch');}for(const [cls,text] of [['app-sidebar__icon',icon],['app-sidebar__label',label]]){const span=document.createElement('span');span.className=cls;span.textContent=text;a.appendChild(span);}return a;});nav.replaceChildren(...links);
})();
