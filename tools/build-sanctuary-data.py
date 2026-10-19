"""Build a small sanctuary catalog from trusted extracted tables; no runtime table dump."""
import json,re,sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]
source=Path(sys.argv[1]) if len(sys.argv)>1 else root.parent/'STARDIVE_Extract'/'tables_json'
def rows(name):
    return next(x['Rows'] for x in json.loads((source/(name+'.json')).read_text(encoding='utf-8-sig')) if 'Rows' in x)
local={k:v.get('TEXT','') for k,v in rows('LOCAL').items()}
items,groups,abilities,parameters=(rows(n) for n in ['ITEM_LIST','LIMITATION_GROUP','ABILITY_GROUP_INFO','ABILITY_PARAMETER'])
def text(key):
    return re.sub(r'<[^>]*>','',local.get(key,'')).replace('\\n','\n')
def resolve(token):
    if token=='None':return None
    kind,id=token.split(':');p=parameters[id]
    if kind=='Ability_Tick':return p['TICK']/1000
    field=re.search(r'_P([1-6])',kind)
    if not field:raise ValueError(token)
    v=p['PARAM_'+field[1]]
    if kind.endswith('_E_Skill_Type'):return {0:'기본 공격',1:'특수 스킬',2:'궁극 스킬',3:'교체 스킬',7:'지원 스킬'}[v]
    if kind.endswith('_R'):return v/100
    if kind.endswith('_T'):return v/1000
    return v

def description(row):
    ability=abilities[str(row['LIMITATION_LOCAL_ABILITY_GROUP_ID'])]
    template=text(ability['ABILITY_GROUP_DESC_LOCAL'])
    values=[resolve(t) for t in ability['ABILITY_GROUP_DESC_LOCAL_PARAM'].split(',')]
    def sub(m):
        v=values[int(m[1])]
        if v is None:raise ValueError('Unresolved description '+str(row))
        # The source stores reductions as signed deltas; the Korean template already says 'decrease'.
        if isinstance(v,(float,int)) and v<0 and re.match(r'\s*%?\s*(?:만큼\s*)?감소',template[m.end():]):
            v=abs(v)
        return format(v,'g') if isinstance(v,(float,int)) else str(v)
    return re.sub(r'\{(\d+)\}',sub,template)

element_names=[(2,'불','적염의 제단','fire'),(3,'얼음','혹한의 빙원','ice'),(5,'바람','질풍의 회랑','wind'),(6,'땅','대지의 성역','earth'),(4,'번개','뇌전의 봉우리','lightning')]
result={'elements':[{'id':e,'name':n,'title':t,'key':k,'image':'assets/contents/ele_'+('lightn' if k=='lightning' else k)+'.png','thumbnail':'sanctuary/assets/ele_'+('lightn' if k=='lightning' else k)+'.png'} for e,n,t,k in element_names],
        'categories':[{'id':i,'name':n} for i,n in [(1,'보스 강화'),(2,'캐릭터 약화'),(3,'실패 조건'),(4,'편성 조건'),(5,'특수 시련')]],'groups':[]}
# Retain only the three displayed percentages, deduplicating identical element profiles.
level_rows=rows('DUNGEON_ELEMENTAL_LEVEL')
result['bossProfiles']=[]
for element in result['elements']:
    profile=[None]*101
    for row in level_rows.values():
        if row['ELEMENTAL']!=element['id']:continue
        level=row['LEVEL']
        assert 1<=level<=100
        values=[row[k] for k in ('ATK_RATIO','HP_RATIO','DEF_RATIO')]
        assert profile[level] is None or profile[level]==values, 'Boss stats differ by difficulty'
        profile[level]=values
    assert all(v is not None for v in profile[1:])
    if profile not in result['bossProfiles']:result['bossProfiles'].append(profile)
    element['bossProfile']=result['bossProfiles'].index(profile)
all_rows=rows('DUNGEON_ELEMENTAL_LIMITATION')
for elem,_,_,_ in element_names:
    dungeon=next(r['DUNGEON_GROUP'] for r in all_rows.values() if r['ELEMENTAL']==elem)
    for meta in sorted((r for r in groups.values() if r['DUNGEON_GROUP']==dungeon),key=lambda r:(r['ORDER'],r['GROUP'])):
        variants=[]
        for id,r in all_rows.items():
            if r['ELEMENTAL']!=elem or r['GROUP']!=meta['GROUP']:continue
            item=items[str(r['ITEM_ID'])]
            variants.append({'id':id,'name':text(item['ITEM_NAME_LOCAL']),'grade':item['RARE_GRADE'],'level':r['LEVEL'],'stepMin':r['STEP_MIN'],'description':description(r)})
        if variants:
            result['groups'].append({'id':str(dungeon)+'-'+str(meta['GROUP']),'element':elem,'category':meta['ORDER'],'name':text(meta['GROUP_LOCAL']),'description':text(meta['GROUP_DESC_LOCAL']),'image':'assets/sanctuary/'+items[variants[0]['id']]['ICON']['AssetPathName'].split('/')[-1].split('.')[0]+'.webp','variants':sorted(variants,key=lambda r:(r['grade'],r['level'],r['id']))})
assert sum(len(g['variants']) for g in result['groups'])==len(all_rows)==380
for g in result['groups']:
    assert g['name'] and g['category'] in range(1,6)
    assert len({v['grade'] for v in g['variants']})==len(g['variants'])
    for v in g['variants']:assert v['description'] and not re.search(r'\{\d+\}',v['description'])
output=root/'sanctuary'/'data.js'
output.write_text('/* Generated from DUNGEON_ELEMENTAL_LIMITATION / LIMITATION_GROUP. */\nwindow.MONGIL_SANCTUARY='+json.dumps(result,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
print('Built',len(result['groups']),'relic groups / 380 variants;',output.stat().st_size,'bytes')
