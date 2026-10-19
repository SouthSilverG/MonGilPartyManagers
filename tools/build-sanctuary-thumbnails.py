"""Create sanctuary-only 96px thumbnails; retain original content images for PNG export."""
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]
out=root/'sanctuary/assets';out.mkdir(parents=True,exist_ok=True)
for key in ['fire','ice','wind','earth','lightn']:
    source=root/'assets/contents'/('ele_'+key+'.png')
    with Image.open(source) as image:
        image=image.convert('RGBA');image.thumbnail((96,96),Image.Resampling.LANCZOS)
        image.save(out/('ele_'+key+'.png'),optimize=True)
print('Five sanctuary thumbnails:',sum(p.stat().st_size for p in out.glob('ele_*.png')),'bytes')
