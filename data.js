/* =====================================================================
   data.js — 여기에 실제 게임 데이터(캐릭터, 장비, 몬스터링 옵션)를 채워 넣으세요.
   이 파일만 수정하면 화면에 자동으로 반영됩니다. (index.html, app.js는 건드릴 필요 없음)

   이미지 경로는 이 파일(=사이트 루트) 기준 상대경로입니다.
   예) assets/characters/warrior.png 처럼 폴더를 만들어 넣고 경로만 맞춰주면 됩니다.
   image를 비워두거나 잘못된 경로를 넣으면 "이미지 없음" 플레이스홀더가 대신 표시됩니다.

   CHARACTERS(25명)와 MONSTERS(165마리), EQUIPMENT(장비 세트 21종), RING_OPTIONS(특성 27종)
   전부 이미지 + 이름까지 채워져 있습니다. 그대로 쓰거나, 원하는 값으로 자유롭게 바꿔도 됩니다.
   ===================================================================== */

/* -----------------------------------------------------------
   1) 캐릭터 목록 (25명, 실제 이름 + 이미지로 채워둠)
   각 항목: { id: 고유값(영문/숫자 추천), name: 표시될 이름, image: 이미지 경로 }
   이름을 더 다듬고 싶으면 name 값만 바꾸면 됩니다.
----------------------------------------------------------- */
const CHARACTERS = [
  { id: "char_francissummer", name: "프란시스: 서머 다이브!", image: "assets/characters/francissummer.jpg" },
  { id: "char_vernasummer", name: "베르나: 서머 다이브!", image: "assets/characters/vernasummer.jpg" },
  { id: "char_maybell", name: "메이벨", image: "assets/characters/maybell.jpg" },
  { id: "char_nagi", name: "나기", image: "assets/characters/nagi.jpg" },
  { id: "char_angel", name: "엔젤", image: "assets/characters/angel.jpg" },
  { id: "char_bonney", name: "보니", image: "assets/characters/bonney.jpg" },
  { id: "char_esde", name: "에스데", image: "assets/characters/esde.jpg" },
  { id: "char_reina", name: "레이나", image: "assets/characters/reina.jpg" },
  { id: "char_ophelia", name: "오필리아", image: "assets/characters/ophelia.jpg" },
  { id: "char_ellie", name: "엘리", image: "assets/characters/ellie.jpg" },
  { id: "char_sera", name: "세라", image: "assets/characters/sera.jpg" },
  { id: "char_flare", name: "플레아", image: "assets/characters/flare.jpg" },
  { id: "char_benjamin", name: "벤자민", image: "assets/characters/benjamin.jpg" },
  { id: "char_gabi", name: "가비", image: "assets/characters/gabi.jpg" },
  { id: "char_jiwon", name: "지원", image: "assets/characters/jiwon.jpg" },
  { id: "char_leeho", name: "이호", image: "assets/characters/leeho.jpg" },
  { id: "char_sangun", name: "산군", image: "assets/characters/sangun.jpg" },
  { id: "char_narae", name: "나래", image: "assets/characters/narae.jpg" },
  { id: "char_daisy", name: "데이지", image: "assets/characters/daisy.jpg" },
  { id: "char_yeonhwa", name: "연화", image: "assets/characters/yeonhwa.jpg" },
  { id: "char_penny", name: "페니", image: "assets/characters/penny.jpg" },
  { id: "char_mina", name: "미나", image: "assets/characters/mina.jpg" },
  { id: "char_francis", name: "프란시스", image: "assets/characters/francis.jpg" },
  { id: "char_cloud", name: "클라우드", image: "assets/characters/cloud.jpg" },
  { id: "char_verna", name: "베르나", image: "assets/characters/verna.jpg" },
  { id: "char_vivian", name: "비비안", image: "assets/characters/vivian.jpg" },
  { id: "char_bristol1", name: "브리셸", image: "assets/characters/Bristol.jpg" },
];

/* -----------------------------------------------------------
   1-1) 몬스터 목록 (165마리, 실제 이름 + 이미지로 채워둠)
   몬스터링1/2/3 라벨칸을 클릭하면 여기서 몬스터 자체를 고를 수 있습니다.
   (옵션 4칸과는 별개로, "이 링에 어떤 몬스터를 넣을지"를 고르는 용도입니다)
----------------------------------------------------------- */
const MONSTERS = [
  { id: "mons_chopy", name: "쵸피", image: "assets/monsters/chopy.png" },
  { id: "mons_slime", name: "슬라군", image: "assets/monsters/slime.png" },
  { id: "mons_goblin", name: "고블린 훈련병", image: "assets/monsters/goblin.png" },
  { id: "mons_goblinbow", name: "고블린 일병", image: "assets/monsters/goblinbow.png" },
  { id: "mons_goblinshield", name: "고블린 상병", image: "assets/monsters/goblinshield.png" },
  { id: "mons_werewolf", name: "하얀 늑대", image: "assets/monsters/werewolf.png" },
  { id: "mons_chopyking", name: "쵸피맘", image: "assets/monsters/chopyking.png" },
  { id: "mons_slimeking", name: "슬라킹", image: "assets/monsters/slimeking.png" },
  { id: "mons_spoonmuggerfork", name: "포크머거", image: "assets/monsters/spoonmuggerfork.png" },
  { id: "mons_goblinchief", name: "타그락", image: "assets/monsters/goblinchief.png" },
  { id: "mons_werewolfmagic", name: "하얀 서리", image: "assets/monsters/werewolfmagic.png" },
  { id: "mons_haka", name: "하카", image: "assets/monsters/haka.png" },
  { id: "mons_golemblack", name: "쿠스토스", image: "assets/monsters/golemblack.png" },
  { id: "mons_sylphi_mountain", name: "실피", image: "assets/monsters/sylphi_mountain.png" },
  { id: "mons_sylphi_grassland", name: "반피", image: "assets/monsters/sylphi_grassland.png" },
  { id: "mons_sylphispear", name: "풀피", image: "assets/monsters/sylphispear.png" },
  { id: "mons_blackknightagesoldier", name: "수확자", image: "assets/monsters/blackknightagesoldier.png" },
  { id: "mons_blackknightagepriest", name: "벡투스", image: "assets/monsters/blackknightagepriest.png" },
  { id: "mons_orc", name: "오크 전사", image: "assets/monsters/orc.png" },
  { id: "mons_orcaxe", name: "오크 돌격병", image: "assets/monsters/orcaxe.png" },
  { id: "mons_troll", name: "트롤", image: "assets/monsters/troll.png" },
  { id: "mons_wolf", name: "이리", image: "assets/monsters/wolf.png" },
  { id: "mons_chopythrow", name: "쵸푸", image: "assets/monsters/chopythrow.png" },
  { id: "mons_chopypoison", name: "쵸파", image: "assets/monsters/chopypoison.png" },
  { id: "mons_wolfhuge", name: "이리도커", image: "assets/monsters/wolfhuge.png" },
  { id: "mons_minotagrassland", name: "평원 미노타", image: "assets/monsters/minotagrassland.png" },
  { id: "mons_stoneguycrystal", name: "얼음주먹 가이", image: "assets/monsters/stoneguycrystal.png" },
  { id: "mons_gargoyle", name: "가고일", image: "assets/monsters/gargoyle.png" },
  { id: "mons_gargoylegrassland", name: "가고이", image: "assets/monsters/gargoylegrassland.png" },
  { id: "mons_spidergrassland", name: "스파더", image: "assets/monsters/spidergrassland.png" },
  { id: "mons_spiderforest", name: "스포더", image: "assets/monsters/spiderforest.png" },
  { id: "mons_spidermountain", name: "스푸더", image: "assets/monsters/spidermountain.png" },
  { id: "mons_slimeling", name: "슬라링", image: "assets/monsters/slimeling.png" },
  { id: "mons_spadupa", name: "스파두파", image: "assets/monsters/spadupa.png" },
  { id: "mons_minotamountain", name: "산악 미노타", image: "assets/monsters/minotamountain.png" },
  { id: "mons_spoonmugger", name: "스푼머거", image: "assets/monsters/spoonmugger.png" },
  { id: "mons_stoneguy", name: "돌주먹 가이", image: "assets/monsters/stoneguy.png" },
  { id: "mons_avadanblack", name: "아바단", image: "assets/monsters/avadanblack.png" },
  { id: "mons_soranyong", name: "소라뇽", image: "assets/monsters/soranyong.png" },
  { id: "mons_odongseed", name: "오동씨", image: "assets/monsters/odongseed.png" },
  { id: "mons_geuseunsaesmall", name: "꼬마 그슨새", image: "assets/monsters/geuseunsaesmall.png" },
  { id: "mons_geuseunsae", name: "그슨새", image: "assets/monsters/geuseunsae.png" },
  { id: "mons_kkebi", name: "퍽깨비", image: "assets/monsters/kkebi.png" },
  { id: "mons_kkebigreen", name: "팡깨비", image: "assets/monsters/kkebigreen.png" },
  { id: "mons_kimodong", name: "김오동", image: "assets/monsters/kimodong.png" },
  { id: "mons_goblinshieldkkebi", name: "깨비대장", image: "assets/monsters/goblinshieldkkebi.png" },
  { id: "mons_duoxini", name: "두억시니", image: "assets/monsters/duoxini.png" },
  { id: "mons_chopythrowuncle", name: "쵸푸엉클", image: "assets/monsters/chopythrowuncle.png" },
  { id: "mons_hanul", name: "한울", image: "assets/monsters/hanul.png" },
  { id: "mons_slimethunder", name: "슬라릿", image: "assets/monsters/slimethunder.png" },
  { id: "mons_dugi", name: "두지", image: "assets/monsters/dugi.png" },
  { id: "mons_dugi_slingshot", name: "더지", image: "assets/monsters/dugi_slingshot.png" },
  { id: "mons_molly", name: "몰리", image: "assets/monsters/molly.png" },
  { id: "mons_werewolf_magicianlightning", name: "하얀 번개", image: "assets/monsters/werewolf_magicianlightning.png" },
  { id: "mons_chopadaddy", name: "쵸파대디", image: "assets/monsters/chopadaddy.png" },
  { id: "mons_doranyong", name: "도라뇽", image: "assets/monsters/doranyong.png" },
  { id: "mons_doranyongking", name: "왕도라뇽", image: "assets/monsters/doranyongking.png" },
  { id: "mons_trollking", name: "우르가쉬", image: "assets/monsters/trollking.png" },
  { id: "mons_wolfhugescar", name: "스카", image: "assets/monsters/wolfhugescar.png" },
  { id: "mons_soranyongking", name: "왕소라뇽", image: "assets/monsters/soranyongking.png" },
  { id: "mons_amon", name: "아몬", image: "assets/monsters/amon.png" },
  { id: "mons_chopypurple", name: "쵸베리", image: "assets/monsters/chopypurple.png" },
  { id: "mons_chopykingslimeling", name: "리피맘", image: "assets/monsters/chopykingslimeling.png" },
  { id: "mons_slimeblack", name: "까막군", image: "assets/monsters/slimeblack.png" },
  { id: "mons_chopathrowuncle1", name: "쵸파 브로", image: "assets/monsters/chopathrowuncle1.png" },
  { id: "mons_slimered", name: "스칼렛퀸", image: "assets/monsters/slimered.png" },
  { id: "mons_goblinpink", name: "고블린 소위", image: "assets/monsters/goblinpink.png" },
  { id: "mons_goblinchiefwhite", name: "고블린 큰형님", image: "assets/monsters/goblinchiefwhite.png" },
  { id: "mons_hakapurple", name: "달의 그림자에 물든 하카", image: "assets/monsters/hakapurple.png" },
  { id: "mons_moleygold", name: "돈이 너무 좋은 몰리", image: "assets/monsters/moleygold.png" },
  { id: "mons_golemgold", name: "황금향의 파수꾼", image: "assets/monsters/golemgold.png" },
  { id: "mons_chopythrowblue", name: "쵸푸르다", image: "assets/monsters/chopythrowblue.png" },
  { id: "mons_chopypoisonorange", name: "쵸렌지", image: "assets/monsters/chopypoisonorange.png" },
  { id: "mons_whitewolf_hostileblack", name: "검은 늑대", image: "assets/monsters/whitewolf_hostileblack.png" },
  { id: "mons_werewolfmagicianred", name: "붉은 서리", image: "assets/monsters/werewolfmagicianred.png" },
  { id: "mons_slimethunderyellow", name: "골든 슬라릿", image: "assets/monsters/slimethunderyellow.png" },
  { id: "mons_dugigold", name: "금두지", image: "assets/monsters/dugigold.png" },
  { id: "mons_slimeice", name: "슬라꽁", image: "assets/monsters/slimeice.png" },
  { id: "mons_slimefire", name: "슬라불", image: "assets/monsters/slimefire.png" },
  { id: "mons_blackknightagesoldierspear", name: "집행자", image: "assets/monsters/blackknightagesoldierspear.png" },
  { id: "mons_blackknightagemonk", name: "공허 수도사", image: "assets/monsters/blackknightagemonk.png" },
  { id: "mons_soranyongmutation01", name: "소라뿅", image: "assets/monsters/soranyongmutation01.png" },
  { id: "mons_doranyongmutation01", name: "도라뿅", image: "assets/monsters/doranyongmutation01.png" },
  { id: "mons_wolfwhite", name: "알비노울프", image: "assets/monsters/wolfwhite.png" },
  { id: "mons_orcaxepink", name: "핑킹 오크 가이", image: "assets/monsters/orcaxepink.png" },
  { id: "mons_trollblue", name: "나이트롤", image: "assets/monsters/trollblue.png" },
  { id: "mons_blackknightagemonkwhite", name: "수도사의 그림자", image: "assets/monsters/blackknightagemonkwhite.png" },
  { id: "mons_stoneguygold", name: "황금주먹 가이", image: "assets/monsters/stoneguygold.png" },
  { id: "mons_minotaforestwind", name: "미녹타", image: "assets/monsters/minotaforestwind.png" },
  { id: "mons_wolfhugescarwhite", name: "프로스트바이트", image: "assets/monsters/wolfhugescarwhite.png" },
  { id: "mons_goblinenforcer", name: "고리크", image: "assets/monsters/goblinenforcer.png" },
  { id: "mons_slimequeen", name: "슬라퀸", image: "assets/monsters/slimequeen.png" },
  { id: "mons_sylphispearcaptin", name: "풀피대장", image: "assets/monsters/sylphispearcaptin.png" },
  { id: "mons_avadan", name: "아바단의 마나", image: "assets/monsters/avadan.png" },
  { id: "mons_spoonmuggerqueen", name: "챱스틱머거", image: "assets/monsters/spoonmuggerqueen.png" },
  { id: "mons_rabbitbackah", name: "낭인 토낑", image: "assets/monsters/rabbitbackah.png" },
  { id: "mons_hermanturtlebackah", name: "낭인 거북", image: "assets/monsters/hermanturtlebackah.png" },
  { id: "mons_treebackah", name: "나무 요괴", image: "assets/monsters/treebackah.png" },
  { id: "mons_duoxinimiddle", name: "투귀", image: "assets/monsters/duoxinimiddle.png" },
  { id: "mons_duoxinimiddleboss", name: "그늘탈", image: "assets/monsters/duoxinimiddleboss.png" },
  { id: "mons_hermanturtlepojol", name: "거북", image: "assets/monsters/hermanturtlepojol.png" },
  { id: "mons_raccoonpojol", name: "너굴", image: "assets/monsters/raccoonpojol.png" },
  { id: "mons_raccoonbackah", name: "낭인 너굴", image: "assets/monsters/raccoonbackah.png" },
  { id: "mons_amonwhite", name: "아몬의 그림자", image: "assets/monsters/amonwhite.png" },
  { id: "mons_doranyongkinghat", name: "바이쿙", image: "assets/monsters/doranyongkinghat.png" },
  { id: "mons_slimeicegreen", name: "슬라끙", image: "assets/monsters/slimeicegreen.png" },
  { id: "mons_slimequeenred", name: "슬라로열퀸", image: "assets/monsters/slimequeenred.png" },
  { id: "mons_spiderhat", name: "스파디그", image: "assets/monsters/spiderhat.png" },
  { id: "mons_spadupagreen", name: "그파두파", image: "assets/monsters/spadupagreen.png" },
  { id: "mons_gargoylemountain", name: "가고삼", image: "assets/monsters/gargoylemountain.png" },
  { id: "mons_sylphiblack", name: "뱀피", image: "assets/monsters/sylphiblack.png" },
  { id: "mons_sylphispearcaptinblack", name: "뱀피 더 풀문", image: "assets/monsters/sylphispearcaptinblack.png" },
  { id: "mons_rabbitpojol", name: "토낑", image: "assets/monsters/rabbitpojol.png" },
  { id: "mons_meoguri", name: "머구리", image: "assets/monsters/meoguri.png" },
  { id: "mons_meogurired", name: "대구리", image: "assets/monsters/meogurired.png" },
  { id: "mons_nachuchu", name: "나추추", image: "assets/monsters/nachuchu.png" },
  { id: "mons_nasusu", name: "나수수", image: "assets/monsters/nasusu.png" },
  { id: "mons_kimodongswamp", name: "이오동", image: "assets/monsters/kimodongswamp.png" },
  { id: "mons_kimodongmaple", name: "박오동", image: "assets/monsters/kimodongmaple.png" },
  { id: "mons_duoxinimiddlewhite", name: "백귀", image: "assets/monsters/duoxinimiddlewhite.png" },
  { id: "mons_duoxinimiddlebosswhite", name: "잿더미탈", image: "assets/monsters/duoxinimiddlebosswhite.png" },
  { id: "mons_duoxinired", name: "이매망량", image: "assets/monsters/duoxinired.png" },
  { id: "mons_raccoonmask", name: "너굴탈", image: "assets/monsters/raccoonmask.png" },
  { id: "mons_rabbitkkebigreen", name: "가면토낑", image: "assets/monsters/rabbitkkebigreen.png" },
  { id: "mons_hermanturtlesilver", name: "은동", image: "assets/monsters/hermanturtlesilver.png" },
  { id: "mons_geuseunsaesky", name: "성불그슨새", image: "assets/monsters/geuseunsaesky.png" },
  { id: "mons_geuseunsaegreen", name: "덤불그슨새", image: "assets/monsters/geuseunsaegreen.png" },
  { id: "mons_treebackahaxe", name: "패대기", image: "assets/monsters/treebackahaxe.png" },
  { id: "mons_meogurishieldboss", name: "보르보그", image: "assets/monsters/meogurishieldboss.png" },
  { id: "mons_flowerbackah", name: "뒤틀린 뼈오름 꽃", image: "assets/monsters/flowerbackah.png" },
  { id: "mons_flowerbackahmiddle", name: "뒤틀린 피오름 꽃", image: "assets/monsters/flowerbackahmiddle.png" },
  { id: "mons_geuseunsaeblack", name: "검은 그슨새", image: "assets/monsters/geuseunsaeblack.png" },
  { id: "mons_manwollok", name: "만월록", image: "assets/monsters/manwollok.png" },
  { id: "mons_hakabackah", name: "온새", image: "assets/monsters/hakabackah.png" },
  { id: "mons_nachuchukimchi", name: "김추추", image: "assets/monsters/nachuchukimchi.png" },
  { id: "mons_nasusubutter", name: "군수수", image: "assets/monsters/nasusubutter.png" },
  { id: "mons_meogurishieldbossgold", name: "금동", image: "assets/monsters/meogurishieldbossgold.png" },
  { id: "mons_meoguriblue", name: "딱구리", image: "assets/monsters/meoguriblue.png" },
  { id: "mons_hanulwhite", name: "굴각", image: "assets/monsters/hanulwhite.png" },
  { id: "mons_hakabackahblack", name: "잉걸불", image: "assets/monsters/hakabackahblack.png" },
  { id: "mons_manwollokblack", name: "녹정", image: "assets/monsters/manwollokblack.png" },
  { id: "mons_rabbitbackahwhite", name: "표백단 토낑", image: "assets/monsters/rabbitbackahwhite.png" },
  { id: "mons_raccoonbackahwhite", name: "표백단 너굴", image: "assets/monsters/raccoonbackahwhite.png" },
  { id: "mons_flowerbackahmiddleblue", name: "멍든 피오름 꽃", image: "assets/monsters/flowerbackahmiddleblue.png" },
  { id: "mons_hermanlizardbow", name: "도마궁", image: "assets/monsters/hermanlizardbow.png" },
  { id: "mons_hermanlizard", name: "도마린", image: "assets/monsters/hermanlizard.png" },
  { id: "mons_hermanlizardhat", name: "도마경", image: "assets/monsters/hermanlizardhat.png" },
  { id: "mons_hermancrocodile", name: "아고", image: "assets/monsters/hermancrocodile.png" },
  { id: "mons_hermancrocodiledora", name: "아고뇽", image: "assets/monsters/hermancrocodiledora.png" },
  { id: "mons_hermanturtle", name: "철갑부기", image: "assets/monsters/hermanturtle.png" },
  { id: "mons_hermanturtlebrown", name: "거목부기", image: "assets/monsters/hermanturtlebrown.png" },
  { id: "mons_meogurishield", name: "두껍구리", image: "assets/monsters/meogurishield.png" },
  { id: "mons_childghost", name: "소아령", image: "assets/monsters/childghost.png" },
  { id: "mons_childghostsquirrel", name: "다람령", image: "assets/monsters/childghostsquirrel.png" },
  { id: "mons_ghostwind", name: "질풍령", image: "assets/monsters/ghostwind.png" },
  { id: "mons_ghostwindmiddle", name: "천시령", image: "assets/monsters/ghostwindmiddle.png" },
  { id: "mons_ghostwindmiddlered", name: "천시원령", image: "assets/monsters/ghostwindmiddlered.png" },
  { id: "mons_hermanlizardbowred", name: "황멸궁", image: "assets/monsters/hermanlizardbowred.png" },
  { id: "mons_nagimiddle", name: "비아미", image: "assets/monsters/nagimiddle.png" },
  { id: "mons_nagimiddlepink", name: "비화", image: "assets/monsters/nagimiddlepink.png" },
  { id: "mons_snowybeast", name: "설귀호", image: "assets/monsters/snowybeast.png" },
  { id: "mons_snowybeastblack", name: "석괴호", image: "assets/monsters/snowybeastblack.png" },
  { id: "mons_wetlandmaster", name: "적영", image: "assets/monsters/wetlandmaster.png" },
  { id: "mons_wetlandmasterblue", name: "청영", image: "assets/monsters/wetlandmasterblue.png" },
  { id: "mons_knightrabbit_evil", name: "무사 토낑", image: "assets/monsters/knightrabbit_evil.png" },
];

/* -----------------------------------------------------------
   2) 장비 목록 (부위별로 나뉘어 있음: hat/top/gloves/shoes)
   부위별 목록은 서로 다른 팝업에 뜹니다.
   실제 게임 "세트" 화면 아이콘에서 가져온 장비 세트 21종이 들어있습니다.
   name에는 개별 부위 이름이 아니라 "세트 이름"이 들어있어서, 화면에는
   세트 이름만 표시됩니다 (옵션/능력치 같은 텍스트는 넣지 않았습니다).
   세트마다 실제로 존재하는 부위만 들어있어서 세트별로 개수가 다를 수 있습니다
   (모자+장갑만 있는 세트, 4부위가 다 있는 세트 등).
----------------------------------------------------------- */
const EQUIPMENT = {
  hat: [
    { id: "hat_eternal_frost_heart", name: "영원한 서리의 심장", image: "assets/equipment/hat_eternal_frost_heart.png" },
    { id: "hat_gourmand_realm", name: "식신의 경지", image: "assets/equipment/hat_gourmand_realm.png" },
    { id: "hat_ancient_bedrock", name: "태고의 반석", image: "assets/equipment/hat_ancient_bedrock.png" },
    { id: "hat_towering_might", name: "군림하는 태산의 위엄", image: "assets/equipment/hat_towering_might.png" },
    { id: "hat_spirit_king", name: "정령왕", image: "assets/equipment/hat_spirit_king.png" },
    { id: "hat_forest_tyrant", name: "숲의 폭군", image: "assets/equipment/hat_forest_tyrant.png" },
    { id: "hat_wolf_star", name: "천랑성", image: "assets/equipment/hat_wolf_star.png" },
    { id: "hat_abyss", name: "심연", image: "assets/equipment/hat_abyss.png" },
    { id: "hat_judge", name: "심판자", image: "assets/equipment/hat_judge.png" },
    { id: "hat_gourmet_feast", name: "미식가의 성대한 만찬", image: "assets/equipment/hat_gourmet_feast.png" },
    { id: "hat_hanul_roar", name: "한울의 포효", image: "assets/equipment/hat_hanul_roar.png" },
    { id: "hat_full_moon_night", name: "만월의 밤", image: "assets/equipment/hat_full_moon_night.png" },
    { id: "hat_haneuibaram", name: "하늬바람", image: "assets/equipment/hat_haneuibaram.png" },
    { id: "hat_ancient_tree", name: "천 년 묵은 고목", image: "assets/equipment/hat_ancient_tree.png" },
    { id: "hat_swamp_lord", name: "습지의 주인", image: "assets/equipment/hat_swamp_lord.png" },
  ],
  top: [
    { id: "top_gourmand_realm", name: "식신의 경지", image: "assets/equipment/top_gourmand_realm.png" },
    { id: "top_vanguard_commander", name: "개전의 선봉대장", image: "assets/equipment/top_vanguard_commander.png" },
    { id: "top_towering_might", name: "군림하는 태산의 위엄", image: "assets/equipment/top_towering_might.png" },
    { id: "top_spirit_king", name: "정령왕", image: "assets/equipment/top_spirit_king.png" },
    { id: "top_forest_tyrant", name: "숲의 폭군", image: "assets/equipment/top_forest_tyrant.png" },
    { id: "top_wolf_star", name: "천랑성", image: "assets/equipment/top_wolf_star.png" },
    { id: "top_abyss", name: "심연", image: "assets/equipment/top_abyss.png" },
    { id: "top_judge", name: "심판자", image: "assets/equipment/top_judge.png" },
    { id: "top_gourmet_feast", name: "미식가의 성대한 만찬", image: "assets/equipment/top_gourmet_feast.png" },
    { id: "top_hanul_roar", name: "한울의 포효", image: "assets/equipment/top_hanul_roar.png" },
    { id: "top_full_moon_night", name: "만월의 밤", image: "assets/equipment/top_full_moon_night.png" },
    { id: "top_haneuibaram", name: "하늬바람", image: "assets/equipment/top_haneuibaram.png" },
    { id: "top_ancient_tree", name: "천 년 묵은 고목", image: "assets/equipment/top_ancient_tree.png" },
    { id: "top_swamp_lord", name: "습지의 주인", image: "assets/equipment/top_swamp_lord.png" },
    { id: "top_blooming_peach", name: "만개한 도화", image: "assets/equipment/top_blooming_peach.png" },
  ],
  gloves: [
    { id: "gloves_eternal_frost_heart", name: "영원한 서리의 심장", image: "assets/equipment/gloves_eternal_frost_heart.png" },
    { id: "gloves_gourmand_realm", name: "식신의 경지", image: "assets/equipment/gloves_gourmand_realm.png" },
    { id: "gloves_towering_might", name: "군림하는 태산의 위엄", image: "assets/equipment/gloves_towering_might.png" },
    { id: "gloves_spirit_king", name: "정령왕", image: "assets/equipment/gloves_spirit_king.png" },
    { id: "gloves_forest_tyrant", name: "숲의 폭군", image: "assets/equipment/gloves_forest_tyrant.png" },
    { id: "gloves_wolf_star", name: "천랑성", image: "assets/equipment/gloves_wolf_star.png" },
    { id: "gloves_abyss", name: "심연", image: "assets/equipment/gloves_abyss.png" },
    { id: "gloves_judge", name: "심판자", image: "assets/equipment/gloves_judge.png" },
    { id: "gloves_abyss_predator", name: "심연의 포식자", image: "assets/equipment/gloves_abyss_predator.png" },
    { id: "gloves_hanul_roar", name: "한울의 포효", image: "assets/equipment/gloves_hanul_roar.png" },
    { id: "gloves_full_moon_night", name: "만월의 밤", image: "assets/equipment/gloves_full_moon_night.png" },
    { id: "gloves_yeoho_spirit", name: "요호의 투지", image: "assets/equipment/gloves_yeoho_spirit.png" },
    { id: "gloves_haneuibaram", name: "하늬바람", image: "assets/equipment/gloves_haneuibaram.png" },
    { id: "gloves_victory_general", name: "개선장군의 예장", image: "assets/equipment/gloves_victory_general.png" },
    { id: "gloves_swamp_lord", name: "습지의 주인", image: "assets/equipment/gloves_swamp_lord.png" },
  ],
  shoes: [
    { id: "shoes_vanguard_commander", name: "개전의 선봉대장", image: "assets/equipment/shoes_vanguard_commander.png" },
    { id: "shoes_ancient_bedrock", name: "태고의 반석", image: "assets/equipment/shoes_ancient_bedrock.png" },
    { id: "shoes_gourmand_realm", name: "식신의 경지", image: "assets/equipment/shoes_gourmand_realm.png" },
    { id: "shoes_towering_might", name: "군림하는 태산의 위엄", image: "assets/equipment/shoes_towering_might.png" },
    { id: "shoes_spirit_king", name: "정령왕", image: "assets/equipment/shoes_spirit_king.png" },
    { id: "shoes_forest_tyrant", name: "숲의 폭군", image: "assets/equipment/shoes_forest_tyrant.png" },
    { id: "shoes_wolf_star", name: "천랑성", image: "assets/equipment/shoes_wolf_star.png" },
    { id: "shoes_abyss", name: "심연", image: "assets/equipment/shoes_abyss.png" },
    { id: "shoes_judge", name: "심판자", image: "assets/equipment/shoes_judge.png" },
    { id: "shoes_abyss_predator", name: "심연의 포식자", image: "assets/equipment/shoes_abyss_predator.png" },
    { id: "shoes_hanul_roar", name: "한울의 포효", image: "assets/equipment/shoes_hanul_roar.png" },
    { id: "shoes_full_moon_night", name: "만월의 밤", image: "assets/equipment/shoes_full_moon_night.png" },
    { id: "shoes_yeoho_spirit", name: "요호의 투지", image: "assets/equipment/shoes_yeoho_spirit.png" },
    { id: "shoes_haneuibaram", name: "하늬바람", image: "assets/equipment/shoes_haneuibaram.png" },
    { id: "shoes_victory_general", name: "개선장군의 예장", image: "assets/equipment/shoes_victory_general.png" },
    { id: "shoes_swamp_lord", name: "습지의 주인", image: "assets/equipment/shoes_swamp_lord.png" },
    { id: "shoes_blooming_peach", name: "만개한 도화", image: "assets/equipment/shoes_blooming_peach.png" },
  ],
};

/* -----------------------------------------------------------
   장비 부위 이름표(라벨)입니다. 화면에 그대로 표시됩니다.
----------------------------------------------------------- */
const EQUIPMENT_LABELS = {
  hat: "장비 모자",
  top: "장비 상의",
  gloves: "장비 장갑",
  shoes: "장비 신발",
};

/* -----------------------------------------------------------
   3) 몬스터링 옵션 목록 (게임 내 "필터 > 특성" 목록 기준)
   몬스터링1 / 몬스터링2 / 몬스터링3 이 전부 같은 옵션 풀(TRAIT_OPTIONS)을
   공유하도록 되어 있습니다. 옵션 목록 자체를 바꾸고 싶으면
   TRAIT_OPTIONS 배열만 수정하면 세 링 전부에 반영됩니다.
   (링마다 다른 옵션 풀을 쓰고 싶으면 ring1/ring2/ring3 각각에
   별도 배열을 넣으면 됩니다.)
----------------------------------------------------------- */
const TRAIT_OPTIONS = [
  { id: "trait_atk", name: "공격력" },
  { id: "trait_def", name: "방어력" },
  { id: "trait_hp", name: "체력" },
  { id: "trait_crit_rate", name: "치명타 확률" },
  { id: "trait_crit_dmg", name: "치명타 피해" },
  { id: "trait_support_dmg", name: "지원 피해 증가" },
  { id: "trait_suppress_dmg", name: "제압 피해 증가" },
  { id: "trait_brawl_dmg", name: "난전 피해 증가" },
  { id: "trait_incap_dmg", name: "무력화 피해 증가" },
  { id: "trait_normal_monster_dmg", name: "일반 몬스터 피해 증가" },
  { id: "trait_boss_monster_dmg", name: "보스 몬스터 피해 증가" },
  { id: "trait_skill_cd", name: "특수 스킬 재사용 대기시간 감소" },
  { id: "trait_weak_dmg", name: "약점 속성 피해 증가" },
  { id: "trait_physical_dmg", name: "물리 속성 피해 증가" },
  { id: "trait_fire_dmg", name: "불 속성 피해 증가" },
  { id: "trait_ice_dmg", name: "얼음 속성 피해 증가" },
  { id: "trait_wind_dmg", name: "바람 속성 피해 증가" },
  { id: "trait_lightning_dmg", name: "번개 속성 피해 증가" },
  { id: "trait_earth_dmg", name: "땅 속성 피해 증가" },
  { id: "trait_physical_res", name: "물리 속성 저항" },
  { id: "trait_fire_res", name: "불 속성 저항" },
  { id: "trait_ice_res", name: "얼음 속성 저항" },
  { id: "trait_wind_res", name: "바람 속성 저항" },
  { id: "trait_lightning_res", name: "번개 속성 저항" },
  { id: "trait_earth_res", name: "땅 속성 저항" },
  { id: "trait_water_res", name: "물 속성 저항" },
  { id: "trait_dark_res", name: "암흑 속성 저항" },
];

const RING_OPTIONS = {
  ring1: TRAIT_OPTIONS,
  ring2: TRAIT_OPTIONS,
  ring3: TRAIT_OPTIONS,
};

/* 몬스터링 라벨(화면에 표시되는 이름) */
const RING_LABELS = {
  ring1: "몬스터링1",
  ring2: "몬스터링2",
  ring3: "몬스터링3",
};

/* -----------------------------------------------------------
   "링크체인" 배지를 표시할 링(ring key)입니다.
   여기 적힌 링에는 라벨 옆에 작은 "링크체인" 배지가 붙습니다.
----------------------------------------------------------- */
const LINK_CHAIN_RING = "ring1";

/* -----------------------------------------------------------
   4) 슬롯 개수 (기본 3개). 늘리고 싶으면 이 숫자만 바꾸면 됩니다.
----------------------------------------------------------- */
const SLOT_COUNT = 3;
