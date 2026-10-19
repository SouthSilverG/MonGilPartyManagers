"""Decode original Texture2D icons; resize to 128px and encode lossless WebP."""
from pathlib import Path
import json,re,struct,sys
from PIL import Image
root=Path(__file__).resolve().parents[1]
source=Path(sys.argv[1]) if len(sys.argv)>1 else root.parent/'Output/Exports/BigCat/Content/BigCat/UI/Texture/Icon_Limitation'
tables=root.parent/'STARDIVE_Extract/tables_json'
def rows(n):return next(x['Rows'] for x in json.loads((tables/(n+'.json')).read_text(encoding='utf-8-sig')) if 'Rows'in x)
items=rows('ITEM_LIST');relics=rows('DUNGEON_ELEMENTAL_LIMITATION');names=set()
for r in relics.values():
    asset=items[str(r['ITEM_ID'])]['ICON']['AssetPathName'].split('/')[-1].split('.')[0]
    if not re.fullmatch(r'LIMITATION_\d+',asset):raise ValueError(asset)
    names.add(asset)
out=root/'assets/sanctuary';out.mkdir(parents=True,exist_ok=True)
formats={'PF_BC7':(7,16),'PF_DXT5':(3,16),'PF_DXT1':(1,8)}
for name in sorted(names):
    raw=(source/(name+'.uasset')).read_bytes()
    for match in re.finditer(rb'PF_[A-Za-z0-9_]+\x00',raw[:4096]):
        fmt=match.group()[:-1].decode();p=match.start()
        if fmt not in formats or p<16:continue
        w,h,slices,strlen=struct.unpack_from('<4I',raw,p-16)
        if not (0<w<=2048 and 0<h<=2048 and slices==1 and strlen==len(match.group())):continue
        mip0,mips,cooked=struct.unpack_from('<3I',raw,match.end())
        if mips!=1 or cooked!=0:continue
        decoder,size=formats[fmt];length=((w+3)//4)*((h+3)//4)*size;start=match.end()+12;end=start+length
        if end+12>len(raw) or struct.unpack_from('<3I',raw,end)!=(w,h,1):continue
        image=Image.frombytes('RGBA',(w,h),raw[start:end],'bcn',(decoder,fmt[3:]));image.thumbnail((128,128),Image.Resampling.LANCZOS);target=out/(name+'.webp');image.save(target,format='WEBP',lossless=True,method=4,exact=True)
        with Image.open(target) as saved:assert saved.size==image.size and saved.tobytes()==image.tobytes()
        break
    else:raise ValueError('Unsupported icon: '+name)
print('Decoded',len(names),'original icons;',sum((out/(n+'.webp')).stat().st_size for n in names),'bytes; 128px lossless WebP')
