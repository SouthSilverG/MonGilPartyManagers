(function(){
 'use strict';
 const button=document.getElementById('analyticsToggle'),status=document.getElementById('analyticsStatus'),key='mongil-analytics-opt-out';
 function render(){try{const off=localStorage.getItem(key)==='1';button.textContent=off?'통계 수집 켜기':'통계 수집 끄기';status.textContent=off?'이 브라우저의 통계 수집이 꺼져 있습니다.':'이 브라우저의 통계 수집이 켜져 있습니다.';}catch(_){status.textContent='브라우저 저장소에 접근할 수 없습니다. 브라우저의 추적 방지 설정을 이용해주세요.';button.disabled=true;}}
 button.addEventListener('click',()=>{try{localStorage.setItem(key,localStorage.getItem(key)==='1'?'0':'1');const id=window.MONGIL_ANALYTICS_CONFIG?.measurementId;if(id)window['ga-disable-'+id]=localStorage.getItem(key)==='1';render();}catch(_){status.textContent='설정을 저장하지 못했습니다.';}});
 window.addEventListener('storage',render);render();
})();
