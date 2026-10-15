(function(){
 'use strict';
 const config=window.MONGIL_BUILD_DB_CONFIG||{},key='mongil-analytics-opt-out',pending=new Map(),done=new Set();
 let sdkPromise=null,lastError=null;
 function allowed(){
  try{return config.enabled===true&&location.protocol==='https:'&&config.allowedHostnames?.includes(location.hostname.toLowerCase())&&config.firebase?.apiKey&&config.firebase?.projectId&&config.firebase?.appId&&localStorage.getItem(key)!=='1'&&navigator.doNotTrack!=='1'&&navigator.globalPrivacyControl!==true;}catch(_){return false;}
 }
 const id=(value,list)=>typeof value==='string'&&list.some(x=>x.id===value)?value:null;
 function normalize(payload){
  const data=typeof payload==='string'?JSON.parse(payload):payload;if(!Array.isArray(data?.slots))return [];
  return data.slots.slice(0,3).flatMap((slot,index)=>{
   if(!slot||!id(slot.character,CHARACTERS))return [];
   const rings={};
   for(const position of ['legend','ring1','ring2','ring3']){
    const legendary=position==='legend',catalog=legendary?LEGEND_MONSTERS:MONSTERS;
    let monster=id(legendary?slot.legendMonster:slot.ringMonsters?.[position],catalog);
    if(!legendary&&monster&&LEGEND_MONSTERS.some(l=>l.name===catalog.find(x=>x.id===monster)?.name))monster=null;
    const input=legendary?(data.detailedStats?.legendOptions?.[monster]||data.detailedStats?.slots?.[index]?.legend?.types):slot.rings?.[position];
    const options=monster?[...new Set(Array.from({length:4},(_,j)=>id(input?.[j],TRAIT_OPTIONS)).filter(Boolean))].sort():[];
    rings[position]={monsterId:monster,options};
   }
   const equipment={};for(const part of ['hat','top','gloves','shoes'])equipment[part]=id(slot.equipment?.[part],EQUIPMENT[part]);
   const artifactId=id(slot.artifact,ARTIFACTS);
   return [{schemaVersion:1,characterId:slot.character,artifactId,equipment,rings,complete:!!artifactId&&Object.values(equipment).every(Boolean)&&Object.values(rings).every(x=>x.monsterId&&x.options.length===4)}];
  });
 }
 async function hash(build){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(build)));return Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join('');}
 async function load(){
  if(!sdkPromise)sdkPromise=(async()=>{
   const base='https://www.gstatic.com/firebasejs/12.19.0/';
   const [appSDK,authSDK,dbSDK]=await Promise.all([import(base+'firebase-app.js'),import(base+'firebase-auth.js'),import(base+'firebase-firestore.js')]);
   const app=appSDK.getApps().find(a=>a.name==='mongil-builds')||appSDK.initializeApp(config.firebase,'mongil-builds');
   if(config.appCheckSiteKey){const check=await import(base+'firebase-app-check.js');check.initializeAppCheck(app,{provider:new check.ReCaptchaV3Provider(config.appCheckSiteKey),isTokenAutoRefreshEnabled:true});}
   const auth=authSDK.getAuth(app);await auth.authStateReady();if(!auth.currentUser)await authSDK.signInAnonymously(auth);
   return {uid:auth.currentUser.uid,db:dbSDK.getFirestore(app),...dbSDK};
  })().catch(error=>{sdkPromise=null;throw error;});
  return sdkPromise;
 }
 async function store(build,source){
  if(!allowed())return;
  const digest=await hash(build);if(done.has(digest))return;
  if(pending.has(digest))return pending.get(digest);
  const job=(async()=>{
   const sdk=await load();if(!allowed())return;
   const ref=sdk.doc(sdk.db,'builds',sdk.uid+'_'+digest);
   const existing=await sdk.getDoc(ref);if(existing.exists()){done.add(digest);return;}
   if(!allowed())return;
   try{await sdk.setDoc(ref,{...build,ownerId:sdk.uid,buildHash:digest,source,editor:/\/Statcal(?:\/|$)/i.test(location.pathname)?'detail':'party',dataVersion:config.dataVersion,createdAt:sdk.serverTimestamp()});}
   catch(error){if(error.code!=='permission-denied'||!(await sdk.getDoc(ref)).exists())throw error;}
   done.add(digest);lastError=null;
  })();pending.set(digest,job);try{await job;}finally{pending.delete(digest);}
 }
 function submit(payload,source){
  if(!allowed()||!['png_save','png_import'].includes(source))return Promise.resolve();
  try{return Promise.all(normalize(payload).map(b=>store(b,source))).catch(error=>{lastError=String(error.code||'collection_failed');console.warn('세팅 통계 DB 전송 실패:',lastError);});}
  catch(_){lastError='invalid_payload';return Promise.resolve();}
 }
 window.MongilBuildDB=Object.freeze({submit,normalize,getStatus:()=>({enabled:!!allowed(),pending:pending.size,lastError})});
})();
