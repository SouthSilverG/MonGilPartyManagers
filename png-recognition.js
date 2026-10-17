/* Small upload fallback; OCR is loaded only after the user chooses Recognize. */
(function(){
 'use strict';
 const base=new URL('.',document.currentScript.src);let busy=false,loader;
 function script(name){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=new URL(name+'?v=20261017-detail3',base);s.onload=resolve;s.onerror=()=>{s.remove();reject(new Error('인식 기능을 불러오지 못했습니다. 연결을 확인해주세요.'));};document.head.append(s);});}
 function load(){if(!loader)loader=(async()=>{try{if(!window.MONGIL_RECOGNITION_CATALOG)await script('recognition-catalog.js');if(!window.MongilImageReader)await script('image-reader.js');}catch(e){loader=null;throw e;}})();return loader;}
 function prompt(){return new Promise(resolve=>{const dialog=document.createElement('dialog');dialog.className='png-recognition-dialog';dialog.setAttribute('aria-label','이미지에서 편성 읽기');dialog.innerHTML='<form method="dialog"><h2>이미지에서 편성 읽기</h2><p>편성 정보가 없는 이미지입니다. 에디터 형식의 이미지에서 편성을 인식할까요?</p><p class="png-recognition-note">세 슬롯의 캐릭터·아티팩트·몬스터링·옵션·장비가 모두 채워진 PNG를 지원하며 요리와 콘텐츠도 인식합니다. 제목·비고는 복원하지 않습니다. 인식할 때만 추가 파일을 내려받습니다. 이미지는 서버로 전송하지 않습니다. 형식이 다르거나 항목을 읽지 못하면 적용하지 않습니다.</p><div class="png-recognition-actions"><button value="cancel">취소</button><button value="recognize">인식</button></div></form>';document.body.append(dialog);dialog.addEventListener('close',()=>{const yes=dialog.returnValue==='recognize';dialog.remove();resolve(yes);},{once:true});dialog.showModal();dialog.querySelector('[value="cancel"]').focus();});}
 async function request(file,catalog){
  if(busy)return null;if(!await prompt())return null;busy=true;
  const dialog=document.createElement('dialog');dialog.className='png-recognition-dialog';dialog.setAttribute('aria-label','이미지 인식 중');const heading=document.createElement('h2');heading.textContent='이미지 인식 중';const status=document.createElement('p');status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.textContent='인식 기능을 준비하고 있습니다…';dialog.append(heading,status);dialog.addEventListener('cancel',ev=>ev.preventDefault());document.body.append(dialog);dialog.showModal();
  try{await load();return await window.MongilImageReader.recognize(file,{...window.MONGIL_RECOGNITION_CATALOG,...catalog,detailDefaults:catalog.detailDefaults||window.MONGIL_RECOGNITION_CATALOG.detailDefaults},message=>{status.textContent=message;});}
  finally{busy=false;dialog.close();dialog.remove();}
 }
 window.MongilPngRecognition=Object.freeze({request});
})();
