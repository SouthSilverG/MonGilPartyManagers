/* Conservative, local OCR for the editor's full three-slot exports. */
(function(){
 'use strict';
 const assetBase=typeof document==='undefined'?null:new URL('.',document.currentScript.src);
 const normalize=s=>String(s||'').normalize('NFKC').replace(/[^가-힣a-zA-Z0-9.%]/g,'').toLowerCase();
 const center=r=>({x:(r.bbox.x0+r.bbox.x1)/2,y:(r.bbox.y0+r.bbox.y1)/2});
 const error=message=>{throw new Error(message||'지원하는 에디터 이미지 형식이 아니거나 모든 항목을 확실히 읽지 못했습니다. 기존 편성은 변경하지 않았습니다.');};
 function records(data){
  const out=[],words=[];const add=x=>{if(x?.text?.trim()&&x.bbox)out.push({text:x.text,bbox:x.bbox,confidence:x.confidence??0});};
  for(const block of data.blocks||[])for(const paragraph of block.paragraphs||[]){add(paragraph);const lines=paragraph.lines||[];for(let i=0;i<lines.length;i++){
   const line=lines[i];add(line);for(const w of line.words||[])words.push(w);
   for(let j=i+1;j<Math.min(lines.length,i+3);j++){const span=lines.slice(i,j+1);add({text:span.map(x=>x.text).join(' '),confidence:Math.min(...span.map(x=>x.confidence||0)),bbox:{x0:Math.min(...span.map(x=>x.bbox.x0)),y0:span[0].bbox.y0,x1:Math.max(...span.map(x=>x.bbox.x1)),y1:span.at(-1).bbox.y1}});}
   const ws=line.words||[];for(let a=0;a<ws.length;a++)for(let b=a;b<Math.min(ws.length,a+8);b++){const span=ws.slice(a,b+1);add({text:span.map(x=>x.text).join(' '),confidence:Math.min(...span.map(x=>x.confidence||0)),bbox:{x0:span[0].bbox.x0,y0:Math.min(...span.map(x=>x.bbox.y0)),x1:span.at(-1).bbox.x1,y1:Math.max(...span.map(x=>x.bbox.y1))}});}
  }}
  // Sparse OCR can split one caption into separate blocks; join words on the same baseline.
  const lines=[];for(const word of [...words].filter(w=>w.confidence>=70).sort((a,b)=>a.bbox.y0-b.bbox.y0)){let line=lines.find(l=>Math.abs(l.y-center(word).y)<Math.max(6,(word.bbox.y1-word.bbox.y0)*.45));if(!line){line={y:center(word).y,words:[]};lines.push(line);}line.words.push(word);}
  for(const line of lines){const ws=line.words.sort((a,b)=>a.bbox.x0-b.bbox.x0);for(let i=0;i<ws.length;i++)for(let j=i;j<Math.min(ws.length,i+10);j++){const span=ws.slice(i,j+1);if(span.at(-1).bbox.x1-span[0].bbox.x0>800)break;add({text:span.map(w=>w.text).join(' '),confidence:Math.min(...span.map(w=>w.confidence)),bbox:{x0:span[0].bbox.x0,y0:Math.min(...span.map(w=>w.bbox.y0)),x1:span.at(-1).bbox.x1,y1:Math.max(...span.map(w=>w.bbox.y1))}});}}
  return {records:out,words};
 }
 function parse(data,width,height,catalog){
  const all=data.records||records(data).records,words=data.words||records(data).words;
  const inside=(r,b)=>{const p=center(r);return p.x>=b.x0&&p.x<b.x1&&p.y>=b.y0&&p.y<b.y1;};
  const within=(b)=>all.filter(r=>inside(r,b)&&r.confidence>=70);
  function matches(items,b){const found=[];for(const item of items){const n=normalize(item.name);for(const r of within(b))if(normalize(r.text)===n&&r.confidence>=(items===catalog.options?75:n.length<=3?85:75)){
   if(!found.some(x=>x.id===item.id&&Math.abs(center(x).x-center(r).x)<10&&Math.abs(center(x).y-center(r).y)<10))found.push({...r,id:item.id,name:item.name});
  }}return found.filter(a=>!found.some(b=>a.id!==b.id&&normalize(b.name).includes(normalize(a.name))&&b.bbox.x0<=a.bbox.x0+3&&b.bbox.x1>=a.bbox.x1-3&&b.bbox.y0<=a.bbox.y0+3&&b.bbox.y1>=a.bbox.y1-3));}
  const one=(items,b)=>{
   let a=matches(items,b);
   if(!a.length){
    const parts=within(b).filter(r=>r.confidence>=75),extra=[];
    for(const item of items){const target=normalize(item.name);const pieces=parts.filter(r=>normalize(r.text).length>=2&&target.includes(normalize(r.text)));
     function visit(text,last,chosen){if(text===target){extra.push({id:item.id,name:item.name,text:item.name,confidence:Math.min(...chosen.map(x=>x.confidence)),bbox:{x0:Math.min(...chosen.map(x=>x.bbox.x0)),y0:Math.min(...chosen.map(x=>x.bbox.y0)),x1:Math.max(...chosen.map(x=>x.bbox.x1)),y1:Math.max(...chosen.map(x=>x.bbox.y1))}});return;}
      if(chosen.length>=5)return;for(const piece of pieces){if(chosen.includes(piece))continue;const next=text+normalize(piece.text);if(next.length<=text.length||!target.startsWith(next))continue;if(last&&(center(piece).y<center(last).y-8||(Math.abs(center(piece).y-center(last).y)<8&&piece.bbox.x0<last.bbox.x0)))continue;visit(next,piece,[...chosen,piece]);}
     }visit('',null,[]);
    }a=extra;
   }
   const ids=[...new Set(a.map(x=>x.id))];if(ids.length!==1)error();return a.sort((a,b)=>b.confidence-a.confidence)[0];
  };
  const whole={x0:0,y0:0,x1:width,y1:height},anchors=[];
  for(let i=1;i<=3;i++){const a=within(whole).filter(r=>normalize(r.text)===i+'번슬롯');if(!a.length)error();anchors.push(a.sort((a,b)=>b.confidence-a.confidence)[0]);}
  const points=anchors.map(center),horizontal=points[2].x-points[0].x>width*.4&&Math.max(...points.map(p=>p.y))-Math.min(...points.map(p=>p.y))<height*.06;
  const vertical=points[2].y-points[0].y>height*.35&&Math.max(...points.map(p=>p.x))-Math.min(...points.map(p=>p.x))<width*.12;
  if(!horizontal&&!vertical)error();
  if(vertical&&!catalog.detailDefaults)error('상세 스탯 이미지는 상세 스탯 에디터에서 업로드해주세요.');
  const detail=vertical?JSON.parse(JSON.stringify(catalog.detailDefaults)):null;
  const order=(a,b)=>center(a).y-center(b).y||center(a).x-center(b).x;
  function numberBelow(label,b,min,max){const a=within(b).filter(r=>normalize(r.text)===normalize(label));if(!a.length)error();const anchor=a.sort((a,b)=>b.confidence-a.confidence)[0],p=center(anchor),scale=width/(vertical?1600:1440);const choices=words.filter(r=>r.confidence>=85&&inside(r,b)&&/^\d+(?:\.\d+)?$/.test(r.text.trim())&&Math.abs(center(r).x-p.x)<40*scale&&r.bbox.y0>=anchor.bbox.y1&&r.bbox.y0-anchor.bbox.y1<85*scale).sort((a,b)=>a.bbox.y0-b.bbox.y0);if(!choices.length)error();const value=Number(choices[0].text);if(value<min||value>max||choices.some(r=>Math.abs(r.bbox.y0-choices[0].bbox.y0)<8*scale&&Number(r.text)!==value))error();return value;}
  const header={x0:width*.66,x1:width,y0:0,y1:Math.min(anchors[0].bbox.y0*.45,width/1600*115)};
  let contentId=null;
  if(catalog.contents){const choices=matches(catalog.contents,header);const ids=[...new Set(choices.map(x=>x.id))];if(ids.length===1)contentId=ids[0];else if(ids.length||!within(header).some(r=>['컨텐츠설정','콘텐츠설정'].includes(normalize(r.text))))error('콘텐츠를 확실히 읽지 못했습니다. 기존 편성은 변경하지 않았습니다.');}
  if(vertical){
   const top=anchors[0].bbox.y0,foodLabels=['메인 요리','사이드 요리'];
   for(let j=0;j<2;j++){
    const box={x0:width*(j? .66:.33),x1:width*(j?1:.66),y0:header.y1,y1:top};
    const key=j?'foodSide':'foodMain';const empty=within(box).some(r=>normalize(r.text)==='요리선택');
    const candidates=matches(catalog.foods?.[key]||[],box),ids=[...new Set(candidates.map(x=>x.id))];
    if(ids.length===1&&!empty)detail[key]=ids[0];else if(!ids.length&&empty)detail[key]=null;else error(foodLabels[j]+'의 등급·대성공 여부를 확실히 읽지 못했습니다.');
   }
  }
  const slots=anchors.map((anchor,i)=>{
   const b=horizontal?{x0:i?((points[i-1].x+points[i].x)/2):0,x1:i===2?width:((points[i].x+points[i+1].x)/2),y0:anchor.bbox.y0,y1:height}:{x0:0,x1:width*.79,y0:anchor.bbox.y0,y1:i===2?height:anchors[i+1].bbox.y0};
   const character=one(catalog.characters,b),artifact=one(catalog.artifacts,b),legend=one(catalog.legends,b);
   const ringStart=vertical?within(b).filter(r=>normalize(r.text)==='몬스터링옵션').sort(order)[0]?.bbox.y1:artifact.bbox.y1;
   if(!ringStart)error();
   const ringBounds={...b,y0:ringStart};const monsters=matches(catalog.monsters,ringBounds).sort(order);if(monsters.length!==3)error();
   const opts=matches(catalog.options,ringBounds).filter(r=>center(r).x>(vertical?width*.28:b.x0+(b.x1-b.x0)*.32));
   if(opts.length!==(vertical?16:12))error();
   const rows=vertical?[one(catalog.legends,ringBounds),...monsters]:monsters;const ringMonsters={},rings={};
   for(let j=0;j<rows.length;j++){
    const row=rows[j],others=rows.filter((_,k)=>k!==j);const gap=Math.min(...rows.slice(1).map((r,k)=>Math.abs(center(r).y-center(rows[k]).y))),offset=vertical?gap*.2:gap*.22;const group=opts.filter(r=>others.every(other=>Math.abs(center(r).y-(center(row).y-offset))<=Math.abs(center(r).y-(center(other).y-offset))));
    if(group.length!==4)error();
    const byY=[...group].sort(order);const byX=(a,b)=>center(a).x-center(b).x;const sorted=vertical?group.sort(byX):[...byY.slice(0,2).sort(byX),...byY.slice(2).sort(byX)];
    if(new Set(sorted.map(x=>x.id)).size!==4)error();
    if(vertical&&j===0){detail.slots[i].legend.types=sorted.map(x=>x.id);detail.legendOptions[legend.id]=sorted.map(x=>x.id);}else{const key='ring'+(vertical?j:j+1);ringMonsters[key]=row.id;rings[key]=sorted.map(x=>x.id);}
   }
   const gearBounds=vertical?{...b,y1:ringStart}: {...b,y0:Math.max(...opts.map(x=>x.bbox.y1))};
   const equipment={};
   ['hat','top','gloves','shoes'].forEach((key,j)=>{
    let box;
    if(horizontal){const cell=(gearBounds.x1-gearBounds.x0)/4;box={...gearBounds,x0:gearBounds.x0+j*cell,x1:gearBounds.x0+(j+1)*cell};}
    else{const head=within(gearBounds).find(r=>normalize(r.text)===['모자','상의','장갑','신발'][j]);if(!head)error();const col=j%2;box={x0:col?width*.5:width*.17,x1:col?width*.79:width*.5,y0:head.bbox.y0,y1:head.bbox.y0+155*width/1600};}
    equipment[key]=one(catalog.equipment[key],box).id;
    if(vertical)detail.slots[i].equipment[key]={atk:numberBelow('공격력',box,0,100000),crit:numberBelow('치확 %',box,0,100),critDmg:numberBelow('치피 %',box,0,100)};
   });
   if(vertical){detail.slots[i].canto=numberBelow('캐릭터 돌파',b,0,6);detail.slots[i].overlap=numberBelow('아티팩트 결합',b,1,5);detail.slots[i].sanctuary=numberBelow('속성의 성소',b,0,50);if(![detail.slots[i].canto,detail.slots[i].overlap,detail.slots[i].sanctuary].every(Number.isInteger))error();}
   return {character:character.id,artifact:artifact.id,legendMonster:legend.id,equipment,ringMonsters,rings};
  });
  if(detail){for(let i=0;i<slots.length;i++)for(let j=0;j<i;j++)if(slots[i].legendMonster===slots[j].legendMonster&&JSON.stringify(detail.slots[i].legend.types)!==JSON.stringify(detail.slots[j].legend.types))error();}
  return {app:'mongil-stardive-party',schema:1,partyTitle:'',contentId,remarks:'',slots,detailedStats:detail};
 }

 // Match only icons at the fixed exported cell positions, never a whole arbitrary picture.
 async function addVisualIcons(canvas,data,catalog){
  const extracted=data.records?data:records(data),rs=extracted.records,w=canvas.width,scale=w/1440;
  const anchors=[1,2,3].map(i=>rs.find(r=>normalize(r.text)===i+'번슬롯'&&r.confidence>=85));
  if(anchors.some(x=>!x)||center(anchors[2]).x-center(anchors[0]).x<w*.4)return extracted;
  const refCanvas=document.createElement('canvas');refCanvas.width=32;refCanvas.height=32;const rc=refCanvas.getContext('2d',{willReadFrequently:true});
  const refs=new Map();
  async function templates(items,circle){const result=[];for(const item of items){if(!item.image)continue;const img=new Image();img.src=new URL(item.image,assetBase);try{await img.decode();}catch(_){continue;}rc.clearRect(0,0,32,32);rc.fillStyle=circle?'#0d0e12':'#24233d';rc.fillRect(0,0,32,32);if(circle){const k=Math.min(31.05/img.width,31.05/img.height);rc.drawImage(img,(32-img.width*k)/2,(32-img.height*k)/2,img.width*k,img.height*k);}else rc.drawImage(img,0,0,32,32);result.push({item,pixels:rc.getImageData(0,0,32,32).data});}return result;}
  async function match(items,circle,cx,cy,size){
   const key=circle?'legend':'monster';if(!refs.has(key))refs.set(key,await templates(items,circle));const list=refs.get(key),scores=new Map();
   for(const dy of [-8,-4,0,4,8])for(const dx of [-8,-4,0,4,8])for(const factor of [.94,1,1.06]){const side=size*factor;rc.clearRect(0,0,32,32);rc.drawImage(canvas,cx-side/2+dx*scale,cy-side/2+dy*scale,side,side,0,0,32,32);const patch=rc.getImageData(0,0,32,32).data;
    for(const ref of list){let sum=0,n=0;for(let y=5;y<27;y++)for(let x=5;x<27;x++){if(circle&&(x-16)**2+(y-16)**2>100)continue;const k=(y*32+x)*4;for(let ch=0;ch<3;ch++){sum+=(patch[k+ch]-ref.pixels[k+ch])**2;n++;}}const score=sum/n/65025;if(score<(scores.get(ref.item.id)?.score??Infinity))scores.set(ref.item.id,{item:ref.item,score});}}
   const best=[...scores.values()].sort((a,b)=>a.score-b.score);if(!best.length||best[0].score>.025||(best[1]&&best[1].score-best[0].score<.004))return null;return best[0].item;
  }
  for(let i=0;i<3;i++){
   const cx=center(anchors[i]).x,iw=((1440-56-40)/3-30)*scale,left=cx-iw/2;
   const inSlot=r=>Math.abs(center(r).x-cx)<w/6;
   const char=rs.filter(inSlot).filter(r=>catalog.characters.some(c=>normalize(c.name)===normalize(r.text))&&r.confidence>=75).sort((a,b)=>normalize(b.text).length-normalize(a.text).length)[0];if(!char)continue;
   if(!rs.filter(inSlot).some(r=>catalog.legends.some(m=>normalize(m.name)===normalize(r.text))&&r.confidence>=85)){
    const portraitBottom=char.bbox.y0-10*scale,lcx=left+iw*(1-.06-.29/2),lcy=portraitBottom-iw*.06-28*scale-iw*.29/2;
    const item=await match(catalog.legends,true,lcx,lcy,iw*.29);if(item)rs.push({text:item.name,confidence:96,bbox:{x0:lcx-20,y0:lcy-5,x1:lcx+20,y1:lcy+5}});
   }
   const opts=rs.filter(inSlot).filter(r=>center(r).y>char.bbox.y1&&center(r).x>left+iw*.32&&r.confidence>=75&&catalog.options.some(x=>normalize(x.name)===normalize(r.text))).sort((a,b)=>b.confidence-a.confidence).filter((r,j,a)=>!a.slice(0,j).some(x=>normalize(x.text)===normalize(r.text)&&Math.abs(center(x).x-center(r).x)<10&&Math.abs(center(x).y-center(r).y)<10)).sort((a,b)=>center(a).y-center(b).y);
   if(opts.length!==12)continue;
   for(let j=0;j<3;j++){const group=opts.slice(j*4,j*4+4),rowY=(Math.min(...group.map(r=>center(r).y))+Math.max(...group.map(r=>center(r).y)))/2,rx=left+iw*(1.7/5.7)/2;
    const exists=rs.filter(inSlot).some(r=>r.confidence>=85&&Math.abs(center(r).y-rowY)<48*scale&&catalog.monsters.some(x=>normalize(x.name)===normalize(r.text)));if(exists)continue;
    const item=await match(catalog.monsters,false,rx,rowY-14*scale,46*scale);if(item)rs.push({text:item.name,confidence:96,bbox:{x0:rx-20,x1:rx+20,y0:rowY+15*scale,y1:rowY+21*scale}});
   }
  }
  return extracted;
 }
 async function refineRingCaptions(canvas,data,worker,catalog){
  const scale=canvas.width/1600,rows=[];for(const r of data.records){const p=center(r);if(r.confidence<85||p.x<canvas.width*.28||p.x>canvas.width*.36||!catalog.options.some(o=>normalize(o.name)===normalize(r.text)))continue;if(!rows.some(y=>Math.abs(y-p.y)<15*scale))rows.push(p.y);}
  await worker.setParameters({tessedit_pageseg_mode:'6'});
  for(const row of rows){const x=Math.round(canvas.width*.18),y=Math.round(row+2*scale),w=Math.round(canvas.width*.065),h=Math.round(50*scale),crop=document.createElement('canvas');crop.width=w*3;crop.height=h*3;const ctx=crop.getContext('2d',{willReadFrequently:true});ctx.drawImage(canvas,x,y,w,h,0,0,crop.width,crop.height);const pixels=ctx.getImageData(0,0,crop.width,crop.height);for(let i=0;i<pixels.data.length;i+=4){const v=Math.min(pixels.data[i],pixels.data[i+1],pixels.data[i+2])>125?0:255;pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=v;}ctx.putImageData(pixels,0,0);try{const found=records((await timed(worker.recognize(crop,{}, {text:true,blocks:true}),30000)).data);for(const key of ['records','words'])for(const r of found[key])data[key].push({...r,bbox:{x0:x+r.bbox.x0/3,x1:x+r.bbox.x1/3,y0:y+r.bbox.y0/3,y1:y+r.bbox.y1/3}});}finally{crop.width=0;crop.height=0;}}
  await worker.setParameters({tessedit_pageseg_mode:'11'});return data;
 }
 async function refineDetail(canvas,data,worker){
  const clean=document.createElement('canvas');clean.width=canvas.width;clean.height=canvas.height;const ctx=clean.getContext('2d',{willReadFrequently:true});ctx.drawImage(canvas,0,0);const pixels=ctx.getImageData(0,0,clean.width,clean.height);for(let i=0;i<pixels.data.length;i+=4){const v=Math.min(pixels.data[i],pixels.data[i+1],pixels.data[i+2])>125?0:255;pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=v;}ctx.putImageData(pixels,0,0);
  try{const found=await readCanvas(clean,worker);data.records.push(...found.records);data.words.push(...found.words);}finally{clean.width=0;clean.height=0;}return data;
 }
 async function refineFoods(canvas,data,worker){
  const scale=canvas.width/1600;
  for(const label of ['메인요리','사이드요리']){
   const anchor=data.records.find(r=>normalize(r.text)===label&&r.confidence>=85);if(!anchor)continue;
   const x=Math.round(anchor.bbox.x0+50*scale),y=Math.round(anchor.bbox.y1+16*scale),w=Math.round(210*scale),h=Math.round(32*scale),crop=document.createElement('canvas');crop.width=w*3;crop.height=h*3;const ctx=crop.getContext('2d',{willReadFrequently:true});ctx.drawImage(canvas,x,y,w,h,0,0,crop.width,crop.height);const pixels=ctx.getImageData(0,0,crop.width,crop.height);for(let i=0;i<pixels.data.length;i+=4){const v=Math.min(pixels.data[i],pixels.data[i+1],pixels.data[i+2])>125?0:255;pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=v;}ctx.putImageData(pixels,0,0);
   try{await worker.setParameters({tessedit_pageseg_mode:'7'});const found=records((await timed(worker.recognize(crop,{}, {text:true,blocks:true}),30000)).data);for(const key of ['records','words'])for(const r of found[key])data[key].push({...r,bbox:{x0:x+r.bbox.x0/3,x1:x+r.bbox.x1/3,y0:y+r.bbox.y0/3,y1:y+r.bbox.y1/3}});}finally{crop.width=0;crop.height=0;}
  }await worker.setParameters({tessedit_pageseg_mode:'11'});return data;
 }
 async function readCanvas(canvas,worker){
  if(canvas.height<=canvas.width*1.5)return records((await timed(worker.recognize(canvas,{}, {text:true,blocks:true}),120000)).data);
  const result={records:[],words:[]},step=Math.min(canvas.height,Math.floor(5000000/canvas.width)),overlap=60;
  for(let y=0;y<canvas.height;y+=step){
   const top=Math.max(0,y-overlap),bottom=Math.min(canvas.height,y+step+overlap),tile=document.createElement('canvas');tile.width=canvas.width;tile.height=bottom-top;tile.getContext('2d').drawImage(canvas,0,top,canvas.width,bottom-top,0,0,tile.width,tile.height);
   try{const found=records((await timed(worker.recognize(tile,{}, {text:true,blocks:true}),120000)).data);for(const key of ['records','words'])for(const r of found[key]){const cy=center(r).y+top;if(cy<y||cy>=y+step)continue;result[key].push({...r,bbox:{...r.bbox,y0:r.bbox.y0+top,y1:r.bbox.y1+top}});}}finally{tile.width=0;tile.height=0;}
  }return result;
 }
 const timed=(promise,ms)=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('인식 시간이 초과됐습니다. 원본 PNG로 다시 시도해주세요.')),ms);promise.then(value=>{clearTimeout(timer);resolve(value);},err=>{clearTimeout(timer);reject(err);});});
 let library;
 function loadOcr(){if(window.Tesseract)return Promise.resolve();if(!library)library=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.min.js';script.onload=resolve;script.onerror=()=>{script.remove();library=null;reject(new Error('문자 인식 파일을 내려받지 못했습니다. 네트워크 연결을 확인해주세요.'));};document.head.append(script);});return library;}
 async function recognize(file,catalog,progress){
  if(file.size>25*1024*1024)error('25MB 이하의 PNG로 시도해주세요.');let worker,bitmap,canvas,initialization;
  try{
   const header=new Uint8Array(await file.slice(0,24).arrayBuffer());if(header.length<24||![137,80,78,71,13,10,26,10].every((x,i)=>header[i]===x))error();const view=new DataView(header.buffer),originalWidth=view.getUint32(16),originalHeight=view.getUint32(20);
   if(originalWidth<900||originalHeight<500||originalWidth*originalHeight>40000000)error('이미지가 너무 작거나 큽니다. 원본 에디터 PNG로 시도해주세요.');
   const ratio=Math.min(1,2400/originalWidth,Math.sqrt((originalHeight>originalWidth*1.5?16000000:8000000)/(originalWidth*originalHeight))),targetWidth=Math.round(originalWidth*ratio),targetHeight=Math.round(originalHeight*ratio);
   bitmap=await createImageBitmap(file);canvas=document.createElement('canvas');canvas.width=targetWidth;canvas.height=targetHeight;const ctx=canvas.getContext('2d',originalHeight>originalWidth*1.5?{}:{willReadFrequently:true});ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();bitmap=null;
   const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;let dark=0,total=0;for(let i=0;i<pixels.length;i+=160){total++;if(Math.max(pixels[i],pixels[i+1],pixels[i+2])<95)dark++;}if(dark/total<.5)error();
   await timed(loadOcr(),30000);initialization=Tesseract.createWorker('kor+eng',1,{logger:event=>{if(event.status==='recognizing text')progress('문자와 표를 읽고 있습니다… '+Math.round(event.progress*100)+'%');else progress('인식 파일을 준비하고 있습니다…');}});worker=await timed(initialization,120000);await worker.setParameters({tessedit_pageseg_mode:'11'});
   const result=await readCanvas(canvas,worker);if(canvas.height>canvas.width*1.5){await refineDetail(canvas,result,worker);await refineFoods(canvas,result,worker);await refineRingCaptions(canvas,result,worker,catalog);}progress('에디터 형식과 모든 항목을 확인하고 있습니다…');const extracted=await addVisualIcons(canvas,result,catalog);return parse(extracted,canvas.width,canvas.height,catalog);
  }finally{bitmap?.close();if(worker)await worker.terminate();else if(initialization)initialization.then(late=>late.terminate(),()=>{});if(canvas){canvas.width=0;canvas.height=0;}}
 }
 window.MongilImageReader=Object.freeze({recognize,parse,normalize,records,refineRingCaptions,refineDetail,refineFoods,readCanvas,matchIcons:addVisualIcons});
})();
