"""User-confirmed released set only. Resolve 4-star primary stats from original tables."""
from pathlib import Path
import json,re,sys
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT.parent/'STARDIVE_Extract/tables_json'
def rows(n):return next(x['Rows'] for x in json.loads((SOURCE/(n+'.json')).read_text(encoding='utf-8-sig')) if 'Rows'in x)
items,groups,levels,rein=(rows(n) for n in ['ITEM_EQUIP','EQUIP_STATUS_GROUP','EQUIP_STATUS_LEVEL','REINFORCE'])
overrides={};sets={}
for part,item_id in [('top','723637'),('gloves','733537')]:
 item=items[item_id];assert item['RARE_GRADE']==4
 maxlevel=max(r['REINFORCE_LEVEL'] for r in rein.values() if r['REINFORCE_GROUP']==item['REINFORCE_GROUP'])
 group=next(r for r in groups.values() if r['STATUS_GROUP']==item['REINFORCE_STATUS_GROUP'] and r['OPTION_CATEGORY']==1)
 stat=next(r for r in levels.values() if r['STATUS_LEVEL_GROUP']==group['STATUS_LEVEL_GROUP'] and r['LEVEL']==maxlevel)
 id=part+'_silent_dismantler';overrides[id]={'part':part,'itemId':item_id,'grade':4,'level':maxlevel,'type':stat['STATUS_TYPE'],'value':stat['STATUS_VALUE']};sets[id]=item['EQUIP_SET']
patch='\n/* BEGIN released silent dismantler */\nObject.assign(window.STAT_DATA.maps.equipmentSets,'+json.dumps(sets,separators=(',',':'))+');\nwindow.STAT_DATA.equipmentById=Object.assign(window.STAT_DATA.equipmentById||{},'+json.dumps(overrides,separators=(',',':'))+');\n/* END released silent dismantler */\n'
path=Path(sys.argv[1]) if len(sys.argv)>1 else ROOT/'Statcal/stats-data.js'
text=path.read_text(encoding='utf-8');text=re.sub(r'\n/\* BEGIN released silent dismantler \*/.*?/\* END released silent dismantler \*/\n?','',text,flags=re.S);path.write_text(text+patch,encoding='utf-8')
print(json.dumps(overrides))
