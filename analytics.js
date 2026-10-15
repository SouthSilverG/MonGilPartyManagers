(function(){
  'use strict';
  const config=window.MONGIL_ANALYTICS_CONFIG||{},id=config.measurementId||'';
  const optOutKey='mongil-analytics-opt-out';
  let active=false;
  const events=new Set(['page_view','png_save_clicked','png_generated','png_generation_failed','png_import_started','png_import_succeeded','png_import_failed','png_download_requested','png_preview_opened','png_share_requested']);
  const reasons=new Set(['canvas_empty','capture_failed','invalid_type','missing_metadata','invalid_png_or_data']);
  function editor(){return /\/calculator(?:\/|$)/i.test(location.pathname)?'calculator':/\/Statcal(?:\/|$)/i.test(location.pathname)?'detail':'party';}
  function optedOut(){try{return localStorage.getItem(optOutKey)==='1';}catch(_){return false;}}
  const browserOptOut=()=>navigator.globalPrivacyControl===true||navigator.doNotTrack==='1';
  function track(name,params={}){
    try{
      if(!active||optedOut()||browserOptOut()||!events.has(name))return false;
      const safe={editor:editor(),device_type:/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)?'mobile':'desktop',send_to:id};
      if(reasons.has(params.reason))safe.reason=params.reason;
      if(config.debug===true)safe.debug_mode=true;
      window.gtag('event',name,safe);return true;
    }catch(_){return false;}
  }
  window.MongilAnalytics=Object.freeze({track});
  const hostAllowed=Array.isArray(config.allowedHostnames)&&config.allowedHostnames.some(host=>String(host).toLowerCase()===location.hostname.toLowerCase());
  if(config.enabled!==true||!/^G-[A-Z0-9]+$/.test(id)||location.protocol!=='https:'||!hostAllowed)return;
  function notice(){
    const row=document.createElement('aside');row.id='analyticsNotice';row.setAttribute('aria-label','이용 통계 설정');
    row.style.cssText='padding:14px 20px;text-align:center;color:#a8aabd;font:12px/1.7 sans-serif;background:#101116';
    const label=document.createElement('span');label.textContent='방문 및 PNG 기능 이용 통계를 Google Analytics로 수집합니다. ';
    const link=document.createElement('a');link.href=new URL('analytics-privacy.html',document.currentScript?.src||scriptUrl).href;link.textContent='수집 정보 안내';link.style.color='#b6adff';
    const button=document.createElement('button');button.type='button';button.style.cssText='margin-left:12px;padding:8px;color:#ddd;background:#242333;border:1px solid #666;border-radius:6px;cursor:pointer';
    button.textContent=optedOut()?'통계 수집 켜기':'통계 수집 끄기';
    button.onclick=()=>{try{const next=!optedOut();localStorage.setItem(optOutKey,next?'1':'0');window['ga-disable-'+id]=next;location.reload();}catch(_){button.textContent='브라우저 설정에서 추적 방지를 사용해주세요';}};
    row.append(label,link,button);document.body.appendChild(row);
  }
  const scriptUrl=document.currentScript?.src||new URL('analytics.js',document.baseURI).href;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',notice,{once:true});else notice();
  if(optedOut()||browserOptOut()){window['ga-disable-'+id]=true;return;}
  window.dataLayer=window.dataLayer||[];
  window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};
  let referrer='';try{referrer=document.referrer?new URL(document.referrer).origin+'/':'';}catch(_){}
  window.gtag('js',new Date());
  window.gtag('config',id,{send_page_view:false,page_location:location.origin+location.pathname,page_referrer:referrer,page_title:document.title,allow_google_signals:false,allow_ad_personalization_signals:false,cookie_flags:'SameSite=Lax;Secure'});
  const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(id);script.onerror=()=>{active=false;};document.head.appendChild(script);
  active=true;track('page_view');
  document.addEventListener('click',event=>{if(event.target.closest?.('#btnSavePng'))track('png_save_clicked');},true);
})();
