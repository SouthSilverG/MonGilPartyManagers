/* =====================================================================
   monling/data.js — 몬링(monling.net) 도감 데이터를 그대로 옮겨온 파일입니다.
   "몬스터링 도감" 탭(링크체인 속성 / 품종 속성 / 링크체인 유무 / 링크체인 레벨별 수치 /
   품종효과)이 전부 이 파일 하나로 돌아갑니다. 이 파일만 손보면 화면에
   자동으로 반영되고, index.html / app.js / style.css는 건드릴 필요 없습니다.

   [새 몬스터링 데이터 추가하는 법 - 에피소드7 몬스터처럼 나중에 늘어날 때]
   아래 MONSTERLINGS 배열에 항목 하나를 통째로 복사해서 붙여넣고 값만
   바꿔주면 됩니다. 각 필드 의미:

   - id            : 메인 파티 매니저 쪽 몬스터 id와 최대한 맞춰두면 좋습니다
                      (같은 몬스터면 아이콘을 공유하니까요). 모르면 아무 고유
                      문자열이나 적어도 됩니다(예: "monling_새몬스터1").
   - name / nameEn : 한글 이름 / 영문 이름
   - image         : 아이콘 이미지 경로. 메인 몬스터 목록에 이미 있는
                      몬스터면 "../assets/monsters/파일명.png"처럼 그 아이콘을
                      그대로 재사용하면 됩니다. 새 몬스터라서 아이콘이 아직
                      없으면 "" 로 비워두세요(이미지 없음 표시로 대체됩니다).
   - breedEffect   : 품종효과 정보.
       - text      : 화면에 그대로 보여줄 원문 설명
       - element   : "품종 속성" 칸/필터에 쓰이는 값. 효과가 특정 속성에
                      묶여 있으면 그 속성("불"/"얼음"/"땅"/"바람"/"번개"/
                      "물"/"물리" 등). 다음과 같이 특정 속성에 묶여 있지
                      않은 효과는 전부 "공용"으로 적습니다:
                      (1) 텍스트에 "OO 속성" 자체가 아예 없는 경우(치명타
                          확률/피해, 방어력, 공격력처럼 속성과 무관한 일반
                          수치 버프 - 예: "보스 몬스터 공격 시 / 10초 동안
                          대상의 공격력 2.75% 감소"는 어느 팀이든 똑같이
                          적용되므로 "공용"),
                      (2) "약점 속성"을 노리는 효과(어떤 속성이든 약점이면
                          다 적용되니까),
                      (3) "모든 팀원"을 대상으로 하는 팀 전체 버프(공격
                          조건에 우연히 불/물 같은 속성 단어가 있어도, 효과
                          자체는 속성과 무관하므로 "공용").
       - value     : 수치(%), 숫자만. 없으면 null
       - direction : "증가" / "감소" / "회복" 중 하나(없으면 "")
       - stat      : 어떤 능력치인지(피해/확률/방어력/공격력/저항/체력 등)
       - cooldownSeconds : "OO초에 1회 발동" 식으로 쿨타임이 적혀 있으면 그
                      숫자, 없으면 null(상시 효과 또는 조건 충족시 즉시 발동)
   - hasLinkChain  : 링크체인이 있는 몬스터인지(true/false)
   - linkChain     : 링크체인 정보(hasLinkChain이 false면 빈 값으로 둬도 됩니다)
       - name      : 링크체인 이름
       - element   : "링크체인 속성" 칸/필터에 쓰이는 값. 대미지보다 버프/
                      디버프가 게임 메타의 핵심이므로, 공격 자체의 피해
                      속성이 아니라 extraEffects가 실제로 주는 버프/디버프를
                      기준으로 정합니다.
                        · extraEffects 중 "OO 속성 저항 감소"가 있으면 그
                          속성(예: "불", "땅"). 예: "불 속성 저항 감소" → "불".
                        · extraEffects에 "약점"이 들어간 효과(예: "받는 약점
                          속성 피해 증가")가 있으면 특정 속성 전용이 아니라
                          "공용"(어떤 속성이 약점이든 다 적용되므로).
                        · 그 외(버프/디버프가 아예 없거나, 슈퍼아머·기절·
                          빙결·속박·이동속도감소·스태미나회복처럼 속성과
                          무관한 효과만 있는 경우)는 "없음".
       - intro     : 링크체인 설명 원문
       - appearanceConditions : 등장 조건 텍스트
       - stages    : [{ stage: 1~5단계, damagePercent: 그 단계의 캐릭터 피해량(%),
                        cooldownSeconds: 그 단계의 재발동 대기시간(초) }, ...]
                      화면의 "링크체인 레벨" 화살표(◀ N ▶)가 바로 이 배열의
                      인덱스를 넘나드는 겁니다. 몬스터마다 단계 수가 다를 수
                      있으니 꼭 5단계일 필요는 없습니다.
       - extraEffects : 링크체인 공격에 추가로 붙는 효과 이름 목록(수치 없는
                      상태이상/디버프 이름이 대부분입니다. 예: "빙결 상태")
----------------------------------------------------------------------- */

const MONSTERLINGS = [
 {
  "id": "mons_chopy",
  "gameId": 1200011,
  "name": "쵸피",
  "nameEn": "Cappy",
  "image": "../assets/monsters/chopy.png",
  "breedEffect": {
   "text": "특수 스킬의 치명타 확률 5% 증가\n(20초에 1회 발동)",
   "element": "공용",
   "value": 5,
   "direction": "증가",
   "stat": "확률",
   "cooldownSeconds": 20
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_slime",
  "gameId": 1200021,
  "name": "슬라군",
  "nameEn": "Slimelet",
  "image": "../assets/monsters/slime.png",
  "breedEffect": {
   "text": "물리 속성의 몬스터에게 치명타 피해 5% 증가",
   "element": "물리",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_goblin",
  "gameId": 1200031,
  "name": "고블린 훈련병",
  "nameEn": "Goblin Recruit",
  "image": "../assets/monsters/goblin.png",
  "breedEffect": {
   "text": "기본 공격 10회 적중 시\n5초 동안 치명타 피해 5% 증가\n(20초에 1회 발동)",
   "element": "공용",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": 20
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_goblinbow",
  "gameId": 1200041,
  "name": "고블린 일병",
  "nameEn": "Pvt. Goblin",
  "image": "../assets/monsters/goblinbow.png",
  "breedEffect": {
   "text": "기본 공격 10회 적중 시\n5초 동안 물리 속성 피해 5% 증가\n(20초에 1회 발동)",
   "element": "물리",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": 20
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_goblinshield",
  "gameId": 1200051,
  "name": "고블린 상병",
  "nameEn": "Cpl. Goblin",
  "image": "../assets/monsters/goblinshield.png",
  "breedEffect": {
   "text": "기본 공격 10회 적중 시\n5초 동안 제압 피해 5% 증가\n(20초에 1회 발동)",
   "element": "공용",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": 20
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_werewolf",
  "gameId": 1200061,
  "name": "하얀 늑대",
  "nameEn": "White Wolf Warrior",
  "image": "../assets/monsters/werewolf.png",
  "breedEffect": {
   "text": "치명타 공격 성공 시\n5초 동안 난전 피해 5% 증가\n(20초에 1회 발동)",
   "element": "공용",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": 20
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_chopyking",
  "gameId": 1200071,
  "name": "쵸피맘",
  "nameEn": "Cappy Mama",
  "image": "../assets/monsters/chopyking.png",
  "breedEffect": {
   "text": "특수 스킬 적중 시\n최대 체력의 1.65% 회복\n(15초에 1회 발동)",
   "element": "공용",
   "value": 1.65,
   "direction": "회복",
   "stat": "체력",
   "cooldownSeconds": 15
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "쵸피맘",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 점프한 후 엉덩이로 내려찍으며 물리 속성 피해 를 줍니다.",
   "appearanceConditions": "특수 스킬 사용 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 60,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 130,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 160,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 200,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": []
  }
 },
 {
  "id": "mons_slimeking",
  "gameId": 1200081,
  "name": "슬라킹",
  "nameEn": "King Slime",
  "image": "../assets/monsters/slimeking.png",
  "breedEffect": {
   "text": "물 속성 몬스터 공격 시\n5초 동안 모든 팀원의 방어력 4.5% 증가\n(10초에 1회 발동)",
   "element": "공용",
   "value": 4.5,
   "direction": "증가",
   "stat": "방어력",
   "cooldownSeconds": 10
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "슬라킹",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 점프한 후 내려찍으며 물 속성 피해 를 주고 추가 효과 를 부여합니다.",
   "appearanceConditions": "특수 스킬 사용 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 60,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 130,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 160,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 200,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": [
    "이동 속도 감소"
   ]
  }
 },
 {
  "id": "mons_spoonmuggerfork",
  "gameId": 1200091,
  "name": "포크머거",
  "nameEn": "Forkmugger",
  "image": "../assets/monsters/spoonmuggerfork.png",
  "breedEffect": {
   "text": "대상의 약점 속성으로 공격 시\n5초 동안 대상의 물리 속성 저항 6%감소\n(15초에 1회 발동)",
   "element": "물리",
   "value": 6,
   "direction": "감소",
   "stat": "저항",
   "cooldownSeconds": 15
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "포크머거",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 포크에 꽂힌 감자를 내려찍으며 물리 속성 피해 를 줍니다.",
   "appearanceConditions": "회피 반격 사용 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 100,
     "cooldownSeconds": 5
    },
    {
     "stage": 2,
     "damagePercent": 120,
     "cooldownSeconds": 5
    },
    {
     "stage": 3,
     "damagePercent": 200,
     "cooldownSeconds": 5
    },
    {
     "stage": 4,
     "damagePercent": 220,
     "cooldownSeconds": 5
    },
    {
     "stage": 5,
     "damagePercent": 250,
     "cooldownSeconds": 5
    }
   ],
   "extraEffects": []
  }
 },
 {
  "id": "mons_goblinchief",
  "gameId": 1200101,
  "name": "타그락",
  "nameEn": "Taglock",
  "image": "../assets/monsters/goblinchief.png",
  "breedEffect": {
   "text": "공격 20회 성공 시 10초 동안 공격력 3%증가\n(20초에 1회 발동)",
   "element": "공용",
   "value": 3,
   "direction": "증가",
   "stat": "공격력",
   "cooldownSeconds": 20
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "타그락",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 점프한 후 해머를 내려찍으며 물리 속성 피해 를 주고 적을 공중에 띄웁니다.",
   "appearanceConditions": "교체 스킬 사용 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 60,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 130,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 160,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 200,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": []
  }
 },
 {
  "id": "mons_werewolfmagic",
  "gameId": 1200111,
  "name": "하얀 서리",
  "nameEn": "Frostjaw",
  "image": "../assets/monsters/werewolfmagic.png",
  "breedEffect": {
   "text": "치명타 공격의 얼음 속성 피해 5% 증가",
   "element": "얼음",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_haka",
  "gameId": 1200121,
  "name": "하카",
  "nameEn": "Lupe",
  "image": "../assets/monsters/haka.png",
  "breedEffect": {
   "text": "치명타 공격 성공 시\n10초 동안 무력화 피해 6% 증가\n(20초에 1회 발동)",
   "element": "공용",
   "value": 6,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": 20
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "하카",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 달려들어 얼음 속성 피해 를 주고 추가 효과 를 부여합니다.",
   "appearanceConditions": "얼음 속성 공격 적중 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 20,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 80,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 100,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 100,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": [
    "빙결 상태"
   ]
  }
 },
 {
  "id": "mons_golemblack",
  "gameId": 1200131,
  "name": "쿠스토스",
  "nameEn": "Custos",
  "image": "../assets/monsters/golemblack.png",
  "breedEffect": {
   "text": "땅 속성 공격으로 치명타 공격 시\n5초 동안 대상의 방어력 4.5% 감소",
   "element": "땅",
   "value": 4.5,
   "direction": "감소",
   "stat": "방어력",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "쿠스토스",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 응축된 자연의 기운을 던져 땅 속성 피해 를 주고 적을 끌어오며 추가 효과 를 부여하고 적을 공중에 띄웁니다.",
   "appearanceConditions": "특수 스킬 사용 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 60,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 130,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 160,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 200,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": [
    "무력화 저항 감소"
   ]
  }
 },
 {
  "id": "mons_sylphi_mountain",
  "gameId": 1200141,
  "name": "실피",
  "nameEn": "Sylphid",
  "image": "../assets/monsters/sylphi_mountain.png",
  "breedEffect": {
   "text": "공중에 뜬 대상에게 땅 속성 피해 5% 증가",
   "element": "땅",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_sylphi_grassland",
  "gameId": 1200151,
  "name": "반피",
  "nameEn": "Healphid",
  "image": "../assets/monsters/sylphi_grassland.png",
  "breedEffect": {
   "text": "공중에 뜬 대상에게 얼음 속성 피해 5% 증가",
   "element": "얼음",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_sylphispear",
  "gameId": 1200161,
  "name": "풀피",
  "nameEn": "Stickphid",
  "image": "../assets/monsters/sylphispear.png",
  "breedEffect": {
   "text": "공중에 뜬 대상에게 치명타 피해 5% 증가",
   "element": "공용",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_blackknightagesoldier",
  "gameId": 1200171,
  "name": "수확자",
  "nameEn": "Harvester",
  "image": "../assets/monsters/blackknightagesoldier.png",
  "breedEffect": {
   "text": "피격 시 5초 동안 치명타 확률 5% 증가\n(20초에 1회 발동)",
   "element": "공용",
   "value": 5,
   "direction": "증가",
   "stat": "확률",
   "cooldownSeconds": 20
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_blackknightagepriest",
  "gameId": 1200181,
  "name": "벡투스",
  "nameEn": "Vectus",
  "image": "../assets/monsters/blackknightagepriest.png",
  "breedEffect": {
   "text": "피격 시 10초 동안 공격력 2.75% 증가\n(20초에 1회 발동)",
   "element": "공용",
   "value": 2.75,
   "direction": "증가",
   "stat": "공격력",
   "cooldownSeconds": 20
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "벡투스",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 공허의 기운을 머금은 가시관을 소환하고 이를 폭발시켜 암흑 속성 피해 를 주고 적을 공중에 띄웁니다.",
   "appearanceConditions": "치명타 발생 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 20,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 80,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 100,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 100,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": []
  }
 },
 {
  "id": "mons_orc",
  "gameId": 1200191,
  "name": "오크 전사",
  "nameEn": "Orc Warrior",
  "image": "../assets/monsters/orc.png",
  "breedEffect": {
   "text": "일반 몬스터에게 물리 속성 피해 5% 증가\n(20초에 1회 발동)",
   "element": "물리",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": 20
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_orcaxe",
  "gameId": 1200201,
  "name": "오크 돌격병",
  "nameEn": "Orc Raider",
  "image": "../assets/monsters/orcaxe.png",
  "breedEffect": {
   "text": "일반 몬스터에게 치명타 확률 5% 증가\n(20초에 1회 발동)",
   "element": "공용",
   "value": 5,
   "direction": "증가",
   "stat": "확률",
   "cooldownSeconds": 20
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_troll",
  "gameId": 1200211,
  "name": "트롤",
  "nameEn": "Troll",
  "image": "../assets/monsters/troll.png",
  "breedEffect": {
   "text": "궁극 스킬의 무력화 피해 5% 증가",
   "element": "공용",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_wolf",
  "gameId": 1200221,
  "name": "이리",
  "nameEn": "Wolf",
  "image": "../assets/monsters/wolf.png",
  "breedEffect": {
   "text": "치명타 공격 성공 시\n5초 동안 물리 속성 피해 5% 증가",
   "element": "물리",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_chopythrow",
  "gameId": 1200231,
  "name": "쵸푸",
  "nameEn": "Brown Cappy",
  "image": "../assets/monsters/chopythrow.png",
  "breedEffect": {
   "text": "특수 스킬의 치명타 피해 5% 증가\n(20초에 1회 발동)",
   "element": "공용",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": 20
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_chopypoison",
  "gameId": 1200241,
  "name": "쵸파",
  "nameEn": "Green Cappy",
  "image": "../assets/monsters/chopypoison.png",
  "breedEffect": {
   "text": "특수 스킬의 무력화 피해 5% 증가\n(15초에 1회 발동)",
   "element": "공용",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": 15
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_wolfhuge",
  "gameId": 1200251,
  "name": "이리도커",
  "nameEn": "Behemo-Wolf",
  "image": "../assets/monsters/wolfhuge.png",
  "breedEffect": {
   "text": "치명타 공격 성공 시\n10초 동안 제압 피해 5.5% 증가",
   "element": "공용",
   "value": 5.5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "이리도커",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 도약 후 포효하여 주변의 대상에게 물리 속성 피해 를 줍니다.",
   "appearanceConditions": "공격 적중 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 20,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 80,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 100,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 100,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": []
  }
 },
 {
  "id": "mons_minotagrassland",
  "gameId": 1200261,
  "name": "평원 미노타",
  "nameEn": "Plains Minotaur",
  "image": "../assets/monsters/minotagrassland.png",
  "breedEffect": {
   "text": "그로기 상태의 보스 몬스터에게 바람 속성 피해 6% 증가",
   "element": "바람",
   "value": 6,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "평원 미노타",
   "element": "바람",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 도끼를 거세게 휘둘러 바람 속성 피해 를 주고 적을 공격하는 회오리를 생성하며 추가 효과 를 부여합니다.",
   "appearanceConditions": "교체 스킬 사용 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 60,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 130,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 160,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 200,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": [
    "바람 속성 저항 감소"
   ]
  }
 },
 {
  "id": "mons_stoneguycrystal",
  "gameId": 1200271,
  "name": "얼음주먹 가이",
  "nameEn": "Ice Fist Dude",
  "image": "../assets/monsters/stoneguycrystal.png",
  "breedEffect": {
   "text": "약점 속성 공격의 치명타 확률 6% 증가",
   "element": "공용",
   "value": 6,
   "direction": "증가",
   "stat": "확률",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "얼음주먹 가이",
   "element": "얼음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 회전하며 수차례 얼음 파편을 날려 얼음 속성 피해 를 주고 추가 효과 를 부여합니다.",
   "appearanceConditions": "특수 스킬 사용 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 60,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 130,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 160,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 200,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": [
    "얼음 속성 저항 감소",
    "빙결 상태"
   ]
  }
 },
 {
  "id": "mons_gargoyle",
  "gameId": 1200281,
  "name": "가고일",
  "nameEn": "Gargoyle",
  "image": "../assets/monsters/gargoyle.png",
  "breedEffect": {
   "text": "강습 공격 시 5초 동안 대상의 방어력 3.75% 감소",
   "element": "공용",
   "value": 3.75,
   "direction": "감소",
   "stat": "방어력",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_gargoylegrassland",
  "gameId": 1200291,
  "name": "가고이",
  "nameEn": "Grassgoyle",
  "image": "../assets/monsters/gargoylegrassland.png",
  "breedEffect": {
   "text": "강습 공격의 물리 속성 피해 5% 증가",
   "element": "물리",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_spidergrassland",
  "gameId": 1200301,
  "name": "스파더",
  "nameEn": "Spaider",
  "image": "../assets/monsters/spidergrassland.png",
  "breedEffect": {
   "text": "몬스터 10마리 처치 시\n5초 동안 방어력 3.75% 증가",
   "element": "공용",
   "value": 3.75,
   "direction": "증가",
   "stat": "방어력",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_spiderforest",
  "gameId": 1200311,
  "name": "스포더",
  "nameEn": "Sparder",
  "image": "../assets/monsters/spiderforest.png",
  "breedEffect": {
   "text": "몬스터 10마리 처치 시\n5초 동안 일반 몬스터 피해 5% 증가",
   "element": "공용",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_spidermountain",
  "gameId": 1200321,
  "name": "스푸더",
  "nameEn": "Spooder",
  "image": "../assets/monsters/spidermountain.png",
  "breedEffect": {
   "text": "몬스터 10마리 처치 시\n5초 동안 치명타 피해 5% 증가",
   "element": "공용",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_slimeling",
  "gameId": 1200331,
  "name": "슬라링",
  "nameEn": "Ring Slime",
  "image": "../assets/monsters/slimeling.png",
  "breedEffect": {
   "text": "물리 속성의 몬스터에게 공격력 2.75% 증가",
   "element": "물리",
   "value": 2.75,
   "direction": "증가",
   "stat": "공격력",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "슬라링",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 두 차례 돌진하여 적을 강타하고 물 속성 피해 를 줍니다.",
   "appearanceConditions": "공격 적중 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 20,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 80,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 100,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 100,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": []
  }
 },
 {
  "id": "mons_spadupa",
  "gameId": 1200341,
  "name": "스파두파",
  "nameEn": "Spadupa",
  "image": "../assets/monsters/spadupa.png",
  "breedEffect": {
   "text": "몬스터 10마리 처치 시\n10초 동안 땅 속성 피해 5.5% 증가",
   "element": "땅",
   "value": 5.5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "스파두파",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 거미줄을 날려 땅 속성 피해 를 주고 추가 효과 를 부여합니다.",
   "appearanceConditions": "강습 공격 사용 시 | 회피 반격 사용 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 100,
     "cooldownSeconds": 5
    },
    {
     "stage": 2,
     "damagePercent": 120,
     "cooldownSeconds": 5
    },
    {
     "stage": 3,
     "damagePercent": 200,
     "cooldownSeconds": 5
    },
    {
     "stage": 4,
     "damagePercent": 220,
     "cooldownSeconds": 5
    },
    {
     "stage": 5,
     "damagePercent": 250,
     "cooldownSeconds": 5
    }
   ],
   "extraEffects": [
    "이동 속도 감소"
   ]
  }
 },
 {
  "id": "mons_minotamountain",
  "gameId": 1200351,
  "name": "산악 미노타",
  "nameEn": "Mountaintaur",
  "image": "../assets/monsters/minotamountain.png",
  "breedEffect": {
   "text": "그로기 상태의 보스 몬스터에게\n치명타 피해 6% 증가",
   "element": "공용",
   "value": 6,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "산악 미노타",
   "element": "불",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 화염을 내뿜어 불 속성 피해 를 주고 추가 효과 를 부여합니다.",
   "appearanceConditions": "교체 스킬 사용 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 60,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 130,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 160,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 200,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": [
    "불 속성 저항 감소"
   ]
  }
 },
 {
  "id": "mons_spoonmugger",
  "gameId": 1200361,
  "name": "스푼머거",
  "nameEn": "Spoonmugger",
  "image": "../assets/monsters/spoonmugger.png",
  "breedEffect": {
   "text": "약점 속성으로 공격 시\n5초 동안 대상의 번개 속성 저항 6% 감소",
   "element": "번개",
   "value": 6,
   "direction": "감소",
   "stat": "저항",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "스푼머거",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 화려한 몸놀림으로 아군을 응원하여 이로운 추가 효과 를 부여합니다.",
   "appearanceConditions": "스태미나 전부 소모 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 0,
     "cooldownSeconds": 300
    },
    {
     "stage": 2,
     "damagePercent": 0,
     "cooldownSeconds": 240
    },
    {
     "stage": 3,
     "damagePercent": 0,
     "cooldownSeconds": 180
    },
    {
     "stage": 4,
     "damagePercent": 0,
     "cooldownSeconds": 120
    },
    {
     "stage": 5,
     "damagePercent": 0,
     "cooldownSeconds": 60
    }
   ],
   "extraEffects": [
    "스태미나 40 회복"
   ]
  }
 },
 {
  "id": "mons_stoneguy",
  "gameId": 1200371,
  "name": "돌주먹 가이",
  "nameEn": "Rock Fist Dude",
  "image": "../assets/monsters/stoneguy.png",
  "breedEffect": {
   "text": "약점 속성으로 공격 시\n해당 공격의 땅 속성 피해 6% 증가",
   "element": "땅",
   "value": 6,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "돌주먹 가이",
   "element": "땅",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 에너지를 발사해 땅 속성 피해 를 주고 추가 효과 를 부여합니다.",
   "appearanceConditions": "교체 스킬 사용 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 60,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 130,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 160,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 200,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": [
    "땅 속성 저항 감소"
   ]
  }
 },
 {
  "id": "mons_avadanblack",
  "gameId": 1200381,
  "name": "아바단",
  "nameEn": "Avardan",
  "image": "../assets/monsters/avadanblack.png",
  "breedEffect": {
   "text": "보스 몬스터에게 피격 시\n10초 동안 모든 팀원의 궁극 스킬 피해 6% 증가",
   "element": "공용",
   "value": 6,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "아바단",
   "element": "땅",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 강하게 온 몸을 내려 찍어 땅 속성 피해 를 주고 추가 효과 를 부여하며 적을 공중에 띄웁니다.",
   "appearanceConditions": "특수 스킬 사용 시 | 궁극 스킬 적중 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 60,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 130,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 160,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 200,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": [
    "땅 속성 저항 감소",
    "무력화 저항 감소"
   ]
  }
 },
 {
  "id": "mons_soranyong",
  "gameId": 1200391,
  "name": "소라뇽",
  "nameEn": "Shellymander",
  "image": "../assets/monsters/soranyong.png",
  "breedEffect": {
   "text": "10회 피격 시\n5초 동안 물리 속성 피해 5% 증가",
   "element": "물리",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_odongseed",
  "gameId": 1200401,
  "name": "오동씨",
  "nameEn": "Odong Seed",
  "image": "../assets/monsters/odongseed.png",
  "breedEffect": {
   "text": "교체 스킬의 땅 속성 피해 5% 증가",
   "element": "땅",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_geuseunsaesmall",
  "gameId": 1200411,
  "name": "꼬마 그슨새",
  "nameEn": "Li'l Hauntstack",
  "image": "../assets/monsters/geuseunsaesmall.png",
  "breedEffect": {
   "text": "교체 스킬의 치명타 피해 5% 증가",
   "element": "공용",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_geuseunsae",
  "gameId": 1200421,
  "name": "그슨새",
  "nameEn": "Hauntstack",
  "image": "../assets/monsters/geuseunsae.png",
  "breedEffect": {
   "text": "교체 스킬의 치명타 확률 5% 증가",
   "element": "공용",
   "value": 5,
   "direction": "증가",
   "stat": "확률",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_kkebi",
  "gameId": 1200431,
  "name": "퍽깨비",
  "nameEn": "Bop-kkaebi",
  "image": "../assets/monsters/kkebi.png",
  "breedEffect": {
   "text": "궁극 스킬의 치명타 피해 5% 증가",
   "element": "공용",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_kkebigreen",
  "gameId": 1200441,
  "name": "팡깨비",
  "nameEn": "Pew-kkaebi",
  "image": "../assets/monsters/kkebigreen.png",
  "breedEffect": {
   "text": "궁극 스킬의 불 속성 피해 5% 증가",
   "element": "불",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_kimodong",
  "gameId": 1200491,
  "name": "김오동",
  "nameEn": "Odong",
  "image": "../assets/monsters/kimodong.png",
  "breedEffect": {
   "text": "교체 스킬의 공격력 3% 증가",
   "element": "공용",
   "value": 3,
   "direction": "증가",
   "stat": "공격력",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "김오동",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 나무 뿌리로 휘감아 땅 속성 피해 를 주고 추가 효과 를 부여합니다.",
   "appearanceConditions": "특수 스킬 사용 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 60,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 130,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 160,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 200,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": [
    "속박 상태"
   ]
  }
 },
 {
  "id": "mons_goblinshieldkkebi",
  "gameId": 1200501,
  "name": "깨비대장",
  "nameEn": "Kkaebi Herder",
  "image": "../assets/monsters/goblinshieldkkebi.png",
  "breedEffect": {
   "text": "궁극 스킬 사용 시\n5초 동안 일반 몬스터 피해 5% 증가",
   "element": "공용",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_duoxini",
  "gameId": 1200521,
  "name": "두억시니",
  "nameEn": "Duoxini",
  "image": "../assets/monsters/duoxini.png",
  "breedEffect": {
   "text": "특수 스킬로 불 속성 공격 시\n10초 동안 대상의 불 속성 저항 6% 감소",
   "element": "불",
   "value": 6,
   "direction": "감소",
   "stat": "저항",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "두억시니",
   "element": "불",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 토템으로 내려찍은 뒤 주변의 적들을 끌어당기고 큰 폭발을 일으켜 불 속성 피해 를 주고 추가 효과 를 부여하며 적을 공중에 띄웁니다.",
   "appearanceConditions": "교체 스킬 사용 시 | 궁극 스킬 사용 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 60,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 130,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 160,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 200,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": [
    "불 속성 저항 감소",
    "무력화 저항 감소"
   ]
  }
 },
 {
  "id": "mons_chopythrowuncle",
  "gameId": 1200531,
  "name": "쵸푸엉클",
  "nameEn": "Uncle Cappy",
  "image": "../assets/monsters/chopythrowuncle.png",
  "breedEffect": {
   "text": "특수 스킬의 불 속성 피해 5.5% 증가\n(15초에 1회 발동)",
   "element": "불",
   "value": 5.5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": 15
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "쵸푸엉클",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 폭탄 버섯을 발로 차며 불 속성 피해 를 줍니다.",
   "appearanceConditions": "회피기 사용 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 20,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 80,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 100,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 100,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": []
  }
 },
 {
  "id": "mons_hanul",
  "gameId": 1200541,
  "name": "한울",
  "nameEn": "Hahnul",
  "image": "../assets/monsters/hanul.png",
  "breedEffect": {
   "text": "보스 몬스터에게 치명타 성공 시\n10초 동안 모든 팀원의 교체 스킬 피해 6% 증가",
   "element": "공용",
   "value": 6,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "한울",
   "element": "번개",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 도약하며 번개를 휘감은 앞발을 휘둘러 번개 속성 피해 를 주고 추가 효과 를 부여하며 적을 공중에 띄웁니다.",
   "appearanceConditions": "특수 스킬 사용 시 | 궁극 스킬 적중 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 60,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 130,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 160,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 200,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": [
    "번개 속성 저항 감소",
    "무력화 저항 감소"
   ]
  }
 },
 {
  "id": "mons_slimethunder",
  "gameId": 1200551,
  "name": "슬라릿",
  "nameEn": "Spark Slime",
  "image": "../assets/monsters/slimethunder.png",
  "breedEffect": {
   "text": "번개 속성의 몬스터에게 치명타 확률 5% 증가",
   "element": "번개",
   "value": 5,
   "direction": "증가",
   "stat": "확률",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_dugi",
  "gameId": 1200561,
  "name": "두지",
  "nameEn": "Digger Mole",
  "image": "../assets/monsters/dugi.png",
  "breedEffect": {
   "text": "바닥에 쓰러진 상태의 대상에게\n치명타 확률 5% 증가",
   "element": "공용",
   "value": 5,
   "direction": "증가",
   "stat": "확률",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_dugi_slingshot",
  "gameId": 1200571,
  "name": "더지",
  "nameEn": "Tunneler Mole",
  "image": "../assets/monsters/dugi_slingshot.png",
  "breedEffect": {
   "text": "바닥에 쓰러진 상태의 대상에게\n땅 속성 피해 5% 증가",
   "element": "땅",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_molly",
  "gameId": 1200581,
  "name": "몰리",
  "nameEn": "Moley Mole",
  "image": "../assets/monsters/molly.png",
  "breedEffect": {
   "text": "바닥에 쓰러진 상태의 대상에게 제압 피해 5.5% 증가",
   "element": "공용",
   "value": 5.5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "몰리",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 삽을 휘두르며 돌진하여 물리 속성 피해 를 줍니다.",
   "appearanceConditions": "적 공중에 띄울 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 20,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 80,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 100,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 100,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": []
  }
 },
 {
  "id": "mons_werewolf_magicianlightning",
  "gameId": 1200591,
  "name": "하얀 번개",
  "nameEn": "White Wolf Fulminator",
  "image": "../assets/monsters/werewolf_magicianlightning.png",
  "breedEffect": {
   "text": "치명타 공격의 번개 속성 피해 5.5% 증가",
   "element": "번개",
   "value": 5.5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "하얀 번개",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 점프한 후 지팡이로 내려찍고 폭발을 일으켜 번개 속성 피해 를 줍니다.",
   "appearanceConditions": "회피 반격 사용 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 100,
     "cooldownSeconds": 5
    },
    {
     "stage": 2,
     "damagePercent": 120,
     "cooldownSeconds": 5
    },
    {
     "stage": 3,
     "damagePercent": 200,
     "cooldownSeconds": 5
    },
    {
     "stage": 4,
     "damagePercent": 220,
     "cooldownSeconds": 5
    },
    {
     "stage": 5,
     "damagePercent": 250,
     "cooldownSeconds": 5
    }
   ],
   "extraEffects": []
  }
 },
 {
  "id": "mons_chopadaddy",
  "gameId": 1200601,
  "name": "쵸파대디",
  "nameEn": "Green Cappy Papa",
  "image": "../assets/monsters/chopadaddy.png",
  "breedEffect": {
   "text": "특수 스킬의 공격력 2.75% 증가\n(15초에 1회 발동)",
   "element": "공용",
   "value": 2.75,
   "direction": "증가",
   "stat": "공격력",
   "cooldownSeconds": 15
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "쵸파대디",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 한 바퀴 돌며 버섯 포자 폭발을 일으켜 땅 속성 피해 를 줍니다.",
   "appearanceConditions": "피해 발생 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 20,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 80,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 100,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 100,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": []
  }
 },
 {
  "id": "mons_doranyong",
  "gameId": 1200611,
  "name": "도라뇽",
  "nameEn": "Rockymander",
  "image": "../assets/monsters/doranyong.png",
  "breedEffect": {
   "text": "적에게 10회 피격 시\n5초 동안 치명타 피해 5% 증가",
   "element": "공용",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_doranyongking",
  "gameId": 1200621,
  "name": "왕도라뇽",
  "nameEn": "Bouldermander",
  "image": "../assets/monsters/doranyongking.png",
  "breedEffect": {
   "text": "적에게 10회 피격 시\n5초 동안 특수 스킬 피해 5% 증가",
   "element": "공용",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_trollking",
  "gameId": 1200631,
  "name": "우르가쉬",
  "nameEn": "Urgash",
  "image": "../assets/monsters/trollking.png",
  "breedEffect": {
   "text": "궁극 스킬의 약점 속성 피해 5.5% 증가",
   "element": "공용",
   "value": 5.5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "우르가쉬",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 도약하며 수차례 내려찍어 물리 속성 피해 를 줍니다.",
   "appearanceConditions": "버스트 발동 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 200,
     "cooldownSeconds": 5
    },
    {
     "stage": 2,
     "damagePercent": 250,
     "cooldownSeconds": 5
    },
    {
     "stage": 3,
     "damagePercent": 400,
     "cooldownSeconds": 5
    },
    {
     "stage": 4,
     "damagePercent": 450,
     "cooldownSeconds": 5
    },
    {
     "stage": 5,
     "damagePercent": 500,
     "cooldownSeconds": 5
    }
   ],
   "extraEffects": []
  }
 },
 {
  "id": "mons_wolfhugescar",
  "gameId": 1200641,
  "name": "스카",
  "nameEn": "Scar",
  "image": "../assets/monsters/wolfhugescar.png",
  "breedEffect": {
   "text": "치명타 공격 성공 시\n5초 동안 보스 몬스터 피해 5.5% 증가",
   "element": "공용",
   "value": 5.5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "스카",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 빠르게 연속으로 돌진한 뒤 늑대의 영혼을 발사하여 암흑 속성 피해 를 줍니다.",
   "appearanceConditions": "치명타 발생 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 20,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 80,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 100,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 100,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": []
  }
 },
 {
  "id": "mons_soranyongking",
  "gameId": 1200651,
  "name": "왕소라뇽",
  "nameEn": "Swellymander",
  "image": "../assets/monsters/soranyongking.png",
  "breedEffect": {
   "text": "10회 피격 시\n5초 동안 기본 공격 피해 5% 증가",
   "element": "공용",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_amon",
  "gameId": 1200661,
  "name": "아몬",
  "nameEn": "Amon",
  "image": "../assets/monsters/amon.png",
  "breedEffect": {
   "text": "보스 몬스터 10회 공격 시\n10초 동안 모든 팀원의 치명타 확률 6% 증가",
   "element": "공용",
   "value": 6,
   "direction": "증가",
   "stat": "확률",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "아몬",
   "element": "공용",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 점프한 후 검을 강하게 내려찍으며 암흑 속성 피해 를 주고 추가 효과 를 부여하며 적을 공중에 띄웁니다.",
   "appearanceConditions": "특수 스킬 사용 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 60,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 130,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 160,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 200,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": [
    "받는 약점 속성 피해 증가"
   ]
  }
 },
 {
  "id": "mons_chopypurple",
  "gameId": 1200681,
  "name": "쵸베리",
  "nameEn": "Cappyberry",
  "image": "../assets/monsters/chopypurple.png",
  "breedEffect": {
   "text": "특수 스킬의 치명타 확률 5.25% 증가\n(20초에 1회 발동)",
   "element": "공용",
   "value": 5.25,
   "direction": "증가",
   "stat": "확률",
   "cooldownSeconds": 20
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_chopykingslimeling",
  "gameId": 1200691,
  "name": "리피맘",
  "nameEn": "Leafy Mama",
  "image": "../assets/monsters/chopykingslimeling.png",
  "breedEffect": {
   "text": "특수 스킬 사용 시\n최대 체력의 1.74% 회복\n(15초에 1회 발동)",
   "element": "공용",
   "value": 1.74,
   "direction": "회복",
   "stat": "체력",
   "cooldownSeconds": 15
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "리피맘",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 주변 아군을 위한 응원 춤을 선보이고 춤사위가 끝나면 아군에게 추가 효과 가 적용됩니다.",
   "appearanceConditions": "HP 50% 이하일 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 0,
     "cooldownSeconds": 300
    },
    {
     "stage": 2,
     "damagePercent": 0,
     "cooldownSeconds": 240
    },
    {
     "stage": 3,
     "damagePercent": 0,
     "cooldownSeconds": 180
    },
    {
     "stage": 4,
     "damagePercent": 0,
     "cooldownSeconds": 120
    },
    {
     "stage": 5,
     "damagePercent": 0,
     "cooldownSeconds": 60
    }
   ],
   "extraEffects": [
    "최대 체력의  회복"
   ]
  }
 },
 {
  "id": "mons_slimeblack",
  "gameId": 1200701,
  "name": "까막군",
  "nameEn": "Inklet",
  "image": "../assets/monsters/slimeblack.png",
  "breedEffect": {
   "text": "물리 속성의 몬스터에게 치명타 피해 5.25% 증가",
   "element": "물리",
   "value": 5.25,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_chopathrowuncle1",
  "gameId": 1200711,
  "name": "쵸파 브로",
  "nameEn": "Green Cappy Bro",
  "image": "../assets/monsters/chopathrowuncle1.png",
  "breedEffect": {
   "text": "특수 스킬의 불 속성 피해 5.78% 증가\n(15초에 1회 발동)",
   "element": "불",
   "value": 5.78,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": 15
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "쵸파 브로",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적의 주변에 맹독성 버섯을 생성하여 땅 속성 피해 를 줍니다.",
   "appearanceConditions": "특수 스킬 사용 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 60,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 130,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 160,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 200,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": []
  }
 },
 {
  "id": "mons_slimered",
  "gameId": 1200721,
  "name": "스칼렛퀸",
  "nameEn": "Scarlet Queen",
  "image": "../assets/monsters/slimered.png",
  "breedEffect": {
   "text": "물 속성 몬스터 공격 시\n10초 동안 공격력 3.15% 증가\n(20초에 1회 발동)",
   "element": "물",
   "value": 3.15,
   "direction": "증가",
   "stat": "공격력",
   "cooldownSeconds": 20
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "스칼렛퀸",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 돌진한 뒤 점프하여 온몸으로 내려찍으며 물 속성 피해 를 주고 추가 효과 를 부여하며 적을 공중에 띄웁니다.",
   "appearanceConditions": "특수 스킬 사용 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 60,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 130,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 160,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 200,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": [
    "이동 속도 감소"
   ]
  }
 },
 {
  "id": "mons_goblinpink",
  "gameId": 1200731,
  "name": "고블린 소위",
  "nameEn": "2nd Lt. Goblin",
  "image": "../assets/monsters/goblinpink.png",
  "breedEffect": {
   "text": "기본 공격 10회 적중 시\n5초 동안 치명타 피해 5.25% 증가\n(20초에 1회 발동)",
   "element": "공용",
   "value": 5.25,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": 20
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_goblinchiefwhite",
  "gameId": 1200741,
  "name": "고블린 큰형님",
  "nameEn": "Big Bro Goblin",
  "image": "../assets/monsters/goblinchiefwhite.png",
  "breedEffect": {
   "text": "기본 공격 10회 적중 시\n모든 팀원의 체력 1.89% 회복\n(20초에 1회 발동)",
   "element": "공용",
   "value": 1.89,
   "direction": "회복",
   "stat": "체력",
   "cooldownSeconds": 20
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "고블린 큰형님",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 두 차례 해머를 강하게 내려찍으며 물리 속성 피해 를 주고 적을 공중에 띄웁니다.",
   "appearanceConditions": "교체 스킬 사용 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 60,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 130,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 160,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 200,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": []
  }
 },
 {
  "id": "mons_hakapurple",
  "gameId": 1200751,
  "name": "달의 그림자에 물든 하카",
  "nameEn": "Moon Shadow Lupe",
  "image": "../assets/monsters/hakapurple.png",
  "breedEffect": {
   "text": "치명타 공격 성공 시\n10초 동안 대상의 얼음 속성 저항 6.3% 감소",
   "element": "얼음",
   "value": 6.3,
   "direction": "감소",
   "stat": "저항",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "달의 그림자에 물든 하카",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 빠르게 돌진하여 강타한 뒤 날카로운 발톱으로 한번 더 공격하며 얼음 속성 피해 를 주고 추가 효과 를 부여합니다.",
   "appearanceConditions": "특수 스킬 사용 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 60,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 130,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 160,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 200,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": [
    "빙결 상태"
   ]
  }
 },
 {
  "id": "mons_moleygold",
  "gameId": 1200761,
  "name": "돈이 너무 좋은 몰리",
  "nameEn": "Gold Digger Moley Mole",
  "image": "../assets/monsters/moleygold.png",
  "breedEffect": {
   "text": "바닥에 쓰러진 상태의 대상에게 제압 피해 5.78% 증가",
   "element": "공용",
   "value": 5.78,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "돈이 너무 좋은 몰리",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 빠르게 두 번 돌진하여 물리 속성 피해 를 주고 적을 공중에 띄웁니다.",
   "appearanceConditions": "적 공중에 띄울 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 20,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 80,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 100,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 100,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": []
  }
 },
 {
  "id": "mons_golemgold",
  "gameId": 1200771,
  "name": "황금향의 파수꾼",
  "nameEn": "El Dorado Guardian",
  "image": "../assets/monsters/golemgold.png",
  "breedEffect": {
   "text": "보스 몬스터에게 약점 속성으로 공격 시\n10초 동안 모든 팀원의 공격력 3.15% 증가\n(20초에 1회 발동)",
   "element": "공용",
   "value": 3.15,
   "direction": "증가",
   "stat": "공격력",
   "cooldownSeconds": 20
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "황금향의 파수꾼",
   "element": "공용",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 맹렬하게 에너지를 방출해 땅 속성 피해 를 주고 추가 효과 를 부여합니다.",
   "appearanceConditions": "그로기 상태인 대상 공격 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 200,
     "cooldownSeconds": 5
    },
    {
     "stage": 2,
     "damagePercent": 250,
     "cooldownSeconds": 5
    },
    {
     "stage": 3,
     "damagePercent": 400,
     "cooldownSeconds": 5
    },
    {
     "stage": 4,
     "damagePercent": 450,
     "cooldownSeconds": 5
    },
    {
     "stage": 5,
     "damagePercent": 500,
     "cooldownSeconds": 5
    }
   ],
   "extraEffects": [
    "받는 약점 속성 피해 증가"
   ]
  }
 },
 {
  "id": "mons_chopythrowblue",
  "gameId": 1200781,
  "name": "쵸푸르다",
  "nameEn": "Teal Cappy",
  "image": "../assets/monsters/chopythrowblue.png",
  "breedEffect": {
   "text": "특수 스킬의 치명타 피해 5.25% 증가\n(20초에 1회 발동)",
   "element": "공용",
   "value": 5.25,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": 20
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_chopypoisonorange",
  "gameId": 1200791,
  "name": "쵸렌지",
  "nameEn": "Orange Cappy",
  "image": "../assets/monsters/chopypoisonorange.png",
  "breedEffect": {
   "text": "특수 스킬의 무력화 피해 5.25% 증가\n(15초에 1회 발동)",
   "element": "공용",
   "value": 5.25,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": 15
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_whitewolf_hostileblack",
  "gameId": 1200801,
  "name": "검은 늑대",
  "nameEn": "Black Wolf",
  "image": "../assets/monsters/whitewolf_hostileblack.png",
  "breedEffect": {
   "text": "치명타 공격 성공 시\n5초 동안 난전 피해 5.25% 증가\n(20초에 1회 발동)",
   "element": "공용",
   "value": 5.25,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": 20
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_werewolfmagicianred",
  "gameId": 1200811,
  "name": "붉은 서리",
  "nameEn": "Crimsonjaw",
  "image": "../assets/monsters/werewolfmagicianred.png",
  "breedEffect": {
   "text": "치명타 공격의 얼음 속성 피해 5.25% 증가",
   "element": "얼음",
   "value": 5.25,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_slimethunderyellow",
  "gameId": 1200821,
  "name": "골든 슬라릿",
  "nameEn": "Golden Spark Slime",
  "image": "../assets/monsters/slimethunderyellow.png",
  "breedEffect": {
   "text": "번개 속성의 몬스터에게 치명타 확률 5.25% 증가",
   "element": "번개",
   "value": 5.25,
   "direction": "증가",
   "stat": "확률",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_dugigold",
  "gameId": 1200831,
  "name": "금두지",
  "nameEn": "Gold Digger Mole",
  "image": "../assets/monsters/dugigold.png",
  "breedEffect": {
   "text": "바닥에 쓰러진 상태의 대상에게 치명타 확률 5.25%증가",
   "element": "공용",
   "value": 5.25,
   "direction": "증가",
   "stat": "확률",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_slimeice",
  "gameId": 1200841,
  "name": "슬라꽁",
  "nameEn": "Ice Slime",
  "image": "../assets/monsters/slimeice.png",
  "breedEffect": {
   "text": "얼음 속성 몬스터에게 약점 속성 피해 5% 증가",
   "element": "공용",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_slimefire",
  "gameId": 1200851,
  "name": "슬라불",
  "nameEn": "Fire Slime",
  "image": "../assets/monsters/slimefire.png",
  "breedEffect": {
   "text": "불 속성 몬스터에게 약점 속성 피해 5% 증가",
   "element": "공용",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_blackknightagesoldierspear",
  "gameId": 1200861,
  "name": "집행자",
  "nameEn": "Enforcer",
  "image": "../assets/monsters/blackknightagesoldierspear.png",
  "breedEffect": {
   "text": "피격 시 5초 동안 방어력 3.75% 증가\n(20초에 1회 발동)",
   "element": "공용",
   "value": 3.75,
   "direction": "증가",
   "stat": "방어력",
   "cooldownSeconds": 20
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_blackknightagemonk",
  "gameId": 1200871,
  "name": "공허 수도사",
  "nameEn": "Void Friar",
  "image": "../assets/monsters/blackknightagemonk.png",
  "breedEffect": {
   "text": "피격 시 5초 동안 약점 속성 피해 5% 증가\n(20초에 1회 발동)",
   "element": "공용",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": 20
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_soranyongmutation01",
  "gameId": 1200881,
  "name": "소라뿅",
  "nameEn": "Mollumander",
  "image": "../assets/monsters/soranyongmutation01.png",
  "breedEffect": {
   "text": "10회 피격 시\n5초 동안 물리 속성 피해 5.25% 증가",
   "element": "물리",
   "value": 5.25,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_doranyongmutation01",
  "gameId": 1200891,
  "name": "도라뿅",
  "nameEn": "Leafymander",
  "image": "../assets/monsters/doranyongmutation01.png",
  "breedEffect": {
   "text": "적에게 10회 피격 시\n5초 동안 치명타 피해 5.25% 증가",
   "element": "공용",
   "value": 5.25,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_wolfwhite",
  "gameId": 1200901,
  "name": "알비노울프",
  "nameEn": "Albino Wolf",
  "image": "../assets/monsters/wolfwhite.png",
  "breedEffect": {
   "text": "치명타 공격 성공 시\n5초 동안 물리 속성 피해 5.25% 증가",
   "element": "물리",
   "value": 5.25,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_orcaxepink",
  "gameId": 1200911,
  "name": "핑킹 오크 가이",
  "nameEn": "Pink Orc Dude",
  "image": "../assets/monsters/orcaxepink.png",
  "breedEffect": {
   "text": "일반 몬스터에게 물리 속성 피해 5.25% 증가\n(20초에 1회 발동)",
   "element": "물리",
   "value": 5.25,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": 20
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_trollblue",
  "gameId": 1200921,
  "name": "나이트롤",
  "nameEn": "Noxtroll",
  "image": "../assets/monsters/trollblue.png",
  "breedEffect": {
   "text": "궁극 스킬의 무력화 피해 5.25% 증가",
   "element": "공용",
   "value": 5.25,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_blackknightagemonkwhite",
  "gameId": 1200931,
  "name": "수도사의 그림자",
  "nameEn": "Monk's Shadow",
  "image": "../assets/monsters/blackknightagemonkwhite.png",
  "breedEffect": {
   "text": "피격 시 5초 동안 약점 속성 피해 5.25% 증가\n(20초에 1회 발동)",
   "element": "공용",
   "value": 5.25,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": 20
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_stoneguygold",
  "gameId": 1200941,
  "name": "황금주먹 가이",
  "nameEn": "Golden Fist Dude",
  "image": "../assets/monsters/stoneguygold.png",
  "breedEffect": {
   "text": "약점 속성으로 공격 시\n해당 공격의 무력화 피해 6.3% 증가",
   "element": "공용",
   "value": 6.3,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "황금주먹 가이",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 방어 태세로 등장하여 주변의 아군에게 추가 효과 를 부여합니다.",
   "appearanceConditions": "교체 스킬 사용 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 60,
     "cooldownSeconds": 13
    },
    {
     "stage": 3,
     "damagePercent": 130,
     "cooldownSeconds": 12
    },
    {
     "stage": 4,
     "damagePercent": 160,
     "cooldownSeconds": 10
    },
    {
     "stage": 5,
     "damagePercent": 200,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": [
    "캐릭터 슈퍼아머 부여"
   ]
  }
 },
 {
  "id": "mons_minotaforestwind",
  "gameId": 1200951,
  "name": "미녹타",
  "nameEn": "Tealtaur",
  "image": "../assets/monsters/minotaforestwind.png",
  "breedEffect": {
   "text": "그로기 상태의 보스 몬스터에게 불 속성 피해 6.3% 증가",
   "element": "불",
   "value": 6.3,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "미녹타",
   "element": "불",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 두 차례 강하게 도끼를 내려찍어 불 속성 피해 를 주고 적을 공중에 띄웁니다.",
   "appearanceConditions": "교체 스킬 사용 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 60,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 130,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 160,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 200,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": [
    "불 속성 저항 감소"
   ]
  }
 },
 {
  "id": "mons_wolfhugescarwhite",
  "gameId": 1200961,
  "name": "프로스트바이트",
  "nameEn": "Frostbite",
  "image": "../assets/monsters/wolfhugescarwhite.png",
  "breedEffect": {
   "text": "치명타 공격 성공 시\n10초 동안 특수 스킬 피해 5.78% 증가",
   "element": "공용",
   "value": 5.78,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "프로스트바이트",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 공허의 균열에서 튀어나와 적을 공격한 뒤 공허의 기운이 담긴 검으로 적을 베어 암흑 속성 피해 를 주고 적을 공중에 띄웁니다.",
   "appearanceConditions": "치명타 발생 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 20,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 80,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 100,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 100,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": []
  }
 },
 {
  "id": "mons_goblinenforcer",
  "gameId": 1200971,
  "name": "고리크",
  "nameEn": "Gorrik",
  "image": "../assets/monsters/goblinenforcer.png",
  "breedEffect": {
   "text": "기본 공격 10회 적중 시\n최대 체력의 1.65% 회복",
   "element": "공용",
   "value": 1.65,
   "direction": "회복",
   "stat": "체력",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "고리크",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 도약하며 공격 후 검을 두 차례 내려쳐 물리 속성 피해 를 줍니다.",
   "appearanceConditions": "공격 적중 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 20,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 80,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 100,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 100,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": []
  }
 },
 {
  "id": "mons_slimequeen",
  "gameId": 1200981,
  "name": "슬라퀸",
  "nameEn": "Queen Slime",
  "image": "../assets/monsters/slimequeen.png",
  "breedEffect": {
   "text": "물리 속성 몬스터 공격 시\n5초 동안 물리 속성 피해 5.5% 증가",
   "element": "물리",
   "value": 5.5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "슬라퀸",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 주먹으로 적을 강타해 물리 속성 피해 를 주고 적을 공중에 띄웁니다.",
   "appearanceConditions": "회피 반격 사용 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 100,
     "cooldownSeconds": 5
    },
    {
     "stage": 2,
     "damagePercent": 120,
     "cooldownSeconds": 5
    },
    {
     "stage": 3,
     "damagePercent": 200,
     "cooldownSeconds": 5
    },
    {
     "stage": 4,
     "damagePercent": 220,
     "cooldownSeconds": 5
    },
    {
     "stage": 5,
     "damagePercent": 250,
     "cooldownSeconds": 5
    }
   ],
   "extraEffects": []
  }
 },
 {
  "id": "mons_sylphispearcaptin",
  "gameId": 1200991,
  "name": "풀피대장",
  "nameEn": "Head Stickphid",
  "image": "../assets/monsters/sylphispearcaptin.png",
  "breedEffect": {
   "text": "공중에 뜬 대상에게 치명타 확률 5% 증가",
   "element": "공용",
   "value": 5,
   "direction": "증가",
   "stat": "확률",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_avadan",
  "gameId": 1201001,
  "name": "아바단의 마나",
  "nameEn": "Avardan's Mana",
  "image": "../assets/monsters/avadan.png",
  "breedEffect": {
   "text": "그로기 상태의 보스 몬스터 공격 시\n모든 팀원의 체력 1.89% 회복\n(10초에 1회 발동)",
   "element": "공용",
   "value": 1.89,
   "direction": "회복",
   "stat": "체력",
   "cooldownSeconds": 10
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "아바단의 마나",
   "element": "공용",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 대지의 힘을 내뿜어 땅 속성 피해 를 주고 추가 효과 를 부여합니다.",
   "appearanceConditions": "그로기 상태인 대상 공격 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 200,
     "cooldownSeconds": 5
    },
    {
     "stage": 2,
     "damagePercent": 250,
     "cooldownSeconds": 5
    },
    {
     "stage": 3,
     "damagePercent": 400,
     "cooldownSeconds": 5
    },
    {
     "stage": 4,
     "damagePercent": 450,
     "cooldownSeconds": 5
    },
    {
     "stage": 5,
     "damagePercent": 500,
     "cooldownSeconds": 5
    }
   ],
   "extraEffects": [
    "받는 약점 속성 피해 증가"
   ]
  }
 },
 {
  "id": "mons_spoonmuggerqueen",
  "gameId": 1201011,
  "name": "챱스틱머거",
  "nameEn": "Stickmugger",
  "image": "../assets/monsters/spoonmuggerqueen.png",
  "breedEffect": {
   "text": "약점 속성으로 공격 시\n10초 동안 번개 속성 피해 6.3% 증가",
   "element": "번개",
   "value": 6.3,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "챱스틱머거",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 화려한 몸놀림으로 아군을 응원하여 이로운 추가 효과 를 부여합니다.",
   "appearanceConditions": "스태미나 전부 소모 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 0,
     "cooldownSeconds": 300
    },
    {
     "stage": 2,
     "damagePercent": 0,
     "cooldownSeconds": 240
    },
    {
     "stage": 3,
     "damagePercent": 0,
     "cooldownSeconds": 180
    },
    {
     "stage": 4,
     "damagePercent": 0,
     "cooldownSeconds": 120
    },
    {
     "stage": 5,
     "damagePercent": 0,
     "cooldownSeconds": 60
    }
   ],
   "extraEffects": [
    "스태미나 80 회복"
   ]
  }
 },
 {
  "id": "mons_rabbitbackah",
  "gameId": 1201021,
  "name": "낭인 토낑",
  "nameEn": "Ronin Bunnie",
  "image": "../assets/monsters/rabbitbackah.png",
  "breedEffect": {
   "text": "회피 반격 사용 시\n5초 동안 바람 속성 피해 5% 증가",
   "element": "바람",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_hermanturtlebackah",
  "gameId": 1201031,
  "name": "낭인 거북",
  "nameEn": "Ronin Turtlie",
  "image": "../assets/monsters/hermanturtlebackah.png",
  "breedEffect": {
   "text": "보스 몬스터에게 피격 시\n5초 동안 물리 속성 피해 5% 증가\n(20초에 1회 발동)",
   "element": "물리",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": 20
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_treebackah",
  "gameId": 1201041,
  "name": "나무 요괴",
  "nameEn": "Tree Youkai",
  "image": "../assets/monsters/treebackah.png",
  "breedEffect": {
   "text": "교체 스킬의 불 속성 피해 5% 증가",
   "element": "불",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_duoxinimiddle",
  "gameId": 1201051,
  "name": "투귀",
  "nameEn": "Battle Spirit",
  "image": "../assets/monsters/duoxinimiddle.png",
  "breedEffect": {
   "text": "보스 몬스터에게 불 속성 피해 5% 증가",
   "element": "불",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_duoxinimiddleboss",
  "gameId": 1201061,
  "name": "그늘탈",
  "nameEn": "Shademask",
  "image": "../assets/monsters/duoxinimiddleboss.png",
  "breedEffect": {
   "text": "보스 몬스터 공격 시\n10초 동안 대상의 공격력 2.75% 감소\n(20초에 1회 발동)",
   "element": "공용",
   "value": 2.75,
   "direction": "감소",
   "stat": "공격력",
   "cooldownSeconds": 20
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "그늘탈",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 도약한 뒤 수차례 공격하여 불 속성 피해 를 줍니다.",
   "appearanceConditions": "공격 적중 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 20,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 80,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 100,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 100,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": []
  }
 },
 {
  "id": "mons_hermanturtlepojol",
  "gameId": 1201071,
  "name": "거북",
  "nameEn": "Turtlie",
  "image": "../assets/monsters/hermanturtlepojol.png",
  "breedEffect": {
   "text": "보스 몬스터에게 피격 시\n5초 동안 모든 팀원의 지원 피해 5% 증가",
   "element": "공용",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_raccoonpojol",
  "gameId": 1201081,
  "name": "너굴",
  "nameEn": "Raccoonie",
  "image": "../assets/monsters/raccoonpojol.png",
  "breedEffect": {
   "text": "회피 반격 사용 시\n5초 동안 대상의 물리 속성 저항 5% 감소",
   "element": "물리",
   "value": 5,
   "direction": "감소",
   "stat": "저항",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_raccoonbackah",
  "gameId": 1201091,
  "name": "낭인 너굴",
  "nameEn": "Ronin Raccoonie",
  "image": "../assets/monsters/raccoonbackah.png",
  "breedEffect": {
   "text": "회피 반격 사용 시\n5초 동안 보스 몬스터 피해 5% 증가",
   "element": "공용",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_amonwhite",
  "gameId": 1201101,
  "name": "아몬의 그림자",
  "nameEn": "Amon's Shadow",
  "image": "../assets/monsters/amonwhite.png",
  "breedEffect": {
   "text": "회피 반격 사용 시\n10초 동안 모든 팀원의 치명타 확률 6.3% 증가",
   "element": "공용",
   "value": 6.3,
   "direction": "증가",
   "stat": "확률",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "아몬의 그림자",
   "element": "공용",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 쌍검으로 적을 벤 후 점프하여 검을 내려찍으며 암흑 속성 피해 를 주고 추가 효과 를 부여하며 적을 공중에 띄웁니다.",
   "appearanceConditions": "특수 스킬 사용 시 | 궁극 스킬 적중 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 60,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 130,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 160,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 200,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": [
    "받는 약점 속성 피해 증가"
   ]
  }
 },
 {
  "id": "mons_doranyongkinghat",
  "gameId": 1201111,
  "name": "바이쿙",
  "nameEn": "Vikkymander",
  "image": "../assets/monsters/doranyongkinghat.png",
  "breedEffect": {
   "text": "적에게 10회 피격 시\n5초 동안 특수 스킬 피해 5.25% 증가",
   "element": "공용",
   "value": 5.25,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_slimeicegreen",
  "gameId": 1201121,
  "name": "슬라끙",
  "nameEn": "Slimeboo",
  "image": "../assets/monsters/slimeicegreen.png",
  "breedEffect": {
   "text": "물리 속성의 몬스터에게 치명타 피해 5.25% 증가",
   "element": "물리",
   "value": 5.25,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_slimequeenred",
  "gameId": 1201131,
  "name": "슬라로열퀸",
  "nameEn": "Empress Slime",
  "image": "../assets/monsters/slimequeenred.png",
  "breedEffect": {
   "text": "물리 속성 몬스터 공격 시\n10초 동안 공격력 2.89% 증가\n(20초에 1회 발동)",
   "element": "물리",
   "value": 2.89,
   "direction": "증가",
   "stat": "공격력",
   "cooldownSeconds": 20
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "슬라로열퀸",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 눈에 보이지 않는 속도로 주먹 세례를 퍼부어 물리 속성 피해 를 주고 추가 효과 를 부여하며 적을 공중에 띄웁니다.",
   "appearanceConditions": "회피 반격 사용 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 100,
     "cooldownSeconds": 5
    },
    {
     "stage": 2,
     "damagePercent": 120,
     "cooldownSeconds": 5
    },
    {
     "stage": 3,
     "damagePercent": 200,
     "cooldownSeconds": 5
    },
    {
     "stage": 4,
     "damagePercent": 220,
     "cooldownSeconds": 5
    },
    {
     "stage": 5,
     "damagePercent": 250,
     "cooldownSeconds": 5
    }
   ],
   "extraEffects": [
    "무력화 저항 감소"
   ]
  }
 },
 {
  "id": "mons_spiderhat",
  "gameId": 1201141,
  "name": "스파디그",
  "nameEn": "Spardig",
  "image": "../assets/monsters/spiderhat.png",
  "breedEffect": {
   "text": "몬스터 10마리 처치 시\n5초 동안 일반 몬스터 피해 5.25% 증가",
   "element": "공용",
   "value": 5.25,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_spadupagreen",
  "gameId": 1201151,
  "name": "그파두파",
  "nameEn": "Greenpadupa",
  "image": "../assets/monsters/spadupagreen.png",
  "breedEffect": {
   "text": "몬스터 10마리 처치 시\n10초 동안 공격력 2.89% 증가",
   "element": "공용",
   "value": 2.89,
   "direction": "증가",
   "stat": "공격력",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "그파두파",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 공중에 매달린 채 적을 향해 거미줄을 날려 땅 속성 피해 를 주고 추가 효과 를 부여합니다.",
   "appearanceConditions": "강습 공격 사용 시 | 회피 반격 사용 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 100,
     "cooldownSeconds": 5
    },
    {
     "stage": 2,
     "damagePercent": 120,
     "cooldownSeconds": 5
    },
    {
     "stage": 3,
     "damagePercent": 200,
     "cooldownSeconds": 5
    },
    {
     "stage": 4,
     "damagePercent": 220,
     "cooldownSeconds": 5
    },
    {
     "stage": 5,
     "damagePercent": 250,
     "cooldownSeconds": 5
    }
   ],
   "extraEffects": [
    "이동 속도 감소"
   ]
  }
 },
 {
  "id": "mons_gargoylemountain",
  "gameId": 1201161,
  "name": "가고삼",
  "nameEn": "Soilgoyle",
  "image": "../assets/monsters/gargoylemountain.png",
  "breedEffect": {
   "text": "강습 공격의 물리 속성 피해 5.25% 증가",
   "element": "물리",
   "value": 5.25,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_sylphiblack",
  "gameId": 1201171,
  "name": "뱀피",
  "nameEn": "Vamphid",
  "image": "../assets/monsters/sylphiblack.png",
  "breedEffect": {
   "text": "공중에 뜬 대상에게 땅 속성 피해 5.25% 증가",
   "element": "땅",
   "value": 5.25,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_sylphispearcaptinblack",
  "gameId": 1201181,
  "name": "뱀피 더 풀문",
  "nameEn": "Full Moon Vamphid",
  "image": "../assets/monsters/sylphispearcaptinblack.png",
  "breedEffect": {
   "text": "공중에 뜬 대상에게 치명타 확률 5.25% 증가",
   "element": "공용",
   "value": 5.25,
   "direction": "증가",
   "stat": "확률",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_rabbitpojol",
  "gameId": 1201191,
  "name": "토낑",
  "nameEn": "Bunnie",
  "image": "../assets/monsters/rabbitpojol.png",
  "breedEffect": {
   "text": "회피 반격 사용 시\n5초 동안 물리 속성 피해 5% 증가",
   "element": "물리",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_meoguri",
  "gameId": 1201201,
  "name": "머구리",
  "nameEn": "Hop-alee",
  "image": "../assets/monsters/meoguri.png",
  "breedEffect": {
   "text": "강습 공격의 치명타 확률 5% 증가",
   "element": "공용",
   "value": 5,
   "direction": "증가",
   "stat": "확률",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_meogurired",
  "gameId": 1201211,
  "name": "대구리",
  "nameEn": "Brute-alee",
  "image": "../assets/monsters/meogurired.png",
  "breedEffect": {
   "text": "강습 공격의 치명타 피해 5% 증가",
   "element": "공용",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_nachuchu",
  "gameId": 1201221,
  "name": "나추추",
  "nameEn": "Cacabagge",
  "image": "../assets/monsters/nachuchu.png",
  "breedEffect": {
   "text": "일반 몬스터에게 땅 속성 피해 5% 증가\n(20초에 1회 발동)",
   "element": "땅",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": 20
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_nasusu",
  "gameId": 1201231,
  "name": "나수수",
  "nameEn": "Cocorn",
  "image": "../assets/monsters/nasusu.png",
  "breedEffect": {
   "text": "일반 몬스터에게 치명타 피해 5% 증가\n(20초에 1회 발동)",
   "element": "공용",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": 20
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_kimodongswamp",
  "gameId": 1201241,
  "name": "이오동",
  "nameEn": "Swamp Odong",
  "image": "../assets/monsters/kimodongswamp.png",
  "breedEffect": {
   "text": "교체 스킬 사용 시\n10초 동안 대상의 땅 속성 저항 5.5% 감소",
   "element": "땅",
   "value": 5.5,
   "direction": "감소",
   "stat": "저항",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "이오동",
   "element": "땅",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 맹독 지대를 생성해 땅 속성 피해 를 주고 추가 효과 를 부여합니다.",
   "appearanceConditions": "특수 스킬 사용 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 60,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 130,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 160,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 200,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": [
    "땅 속성 저항 감소"
   ]
  }
 },
 {
  "id": "mons_kimodongmaple",
  "gameId": 1201251,
  "name": "박오동",
  "nameEn": "Maple Odong",
  "image": "../assets/monsters/kimodongmaple.png",
  "breedEffect": {
   "text": "교체 스킬의 공격력 3.15% 증가",
   "element": "공용",
   "value": 3.15,
   "direction": "증가",
   "stat": "공격력",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "박오동",
   "element": "땅",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 나무 뿌리로 적을 속박하며 맹독지대를 생성해 땅 속성 피해 를 주고 추가 효과 를 부여합니다.",
   "appearanceConditions": "특수 스킬 사용 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 60,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 130,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 160,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 200,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": [
    "땅 속성 저항 감소",
    "속박 상태"
   ]
  }
 },
 {
  "id": "mons_duoxinimiddlewhite",
  "gameId": 1201261,
  "name": "백귀",
  "nameEn": "White Wraith",
  "image": "../assets/monsters/duoxinimiddlewhite.png",
  "breedEffect": {
   "text": "보스 몬스터에게 불 속성 피해 5.25% 증가",
   "element": "불",
   "value": 5.25,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_duoxinimiddlebosswhite",
  "gameId": 1201271,
  "name": "잿더미탈",
  "nameEn": "Ashen Mask",
  "image": "../assets/monsters/duoxinimiddlebosswhite.png",
  "breedEffect": {
   "text": "보스 몬스터 공격 시\n10초 동안 대상의 공격력 2.75% 감소\n(20초에 1회 발동)",
   "element": "공용",
   "value": 2.75,
   "direction": "감소",
   "stat": "공격력",
   "cooldownSeconds": 20
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "잿더미탈",
   "element": "불",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 화염구를 발사하여 불 속성 피해 를 주고 무작위 속성 지대를 생성하여 추가 효과 를 부여합니다.",
   "appearanceConditions": "특수 스킬 사용 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 60,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 130,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 160,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 200,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": [
    "속성 지대 유지 시간",
    "불 속성 저항 감소",
    "땅 속성 저항 감소",
    "얼음 속성 저항 감소"
   ]
  }
 },
 {
  "id": "mons_duoxinired",
  "gameId": 1201281,
  "name": "이매망량",
  "nameEn": "Fiend",
  "image": "../assets/monsters/duoxinired.png",
  "breedEffect": {
   "text": "특수 스킬로 불 속성 공격 시\n특수 스킬의 불 속성 피해 6.3% 증가",
   "element": "불",
   "value": 6.3,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "이매망량",
   "element": "공용",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 지면을 향해 토템을 던져 불 속성 피해 를 주고 토템 위에 올라타 범위 내 추가 효과 를 부여하고 적을 공중에 띄웁니다.",
   "appearanceConditions": "교체 스킬 사용 시 | 궁극 스킬 사용 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 60,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 130,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 160,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 200,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": [
    "토템 유지 시간",
    "캐릭터 슈퍼아머 부여",
    "받는 약점 속성 피해 증가"
   ]
  }
 },
 {
  "id": "mons_raccoonmask",
  "gameId": 1201291,
  "name": "너굴탈",
  "nameEn": "Masked Raccoonie",
  "image": "../assets/monsters/raccoonmask.png",
  "breedEffect": {
   "text": "회피 반격 사용 시\n5초 동안 대상의 물리 속성 저항 5.25% 감소",
   "element": "물리",
   "value": 5.25,
   "direction": "감소",
   "stat": "저항",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_rabbitkkebigreen",
  "gameId": 1201301,
  "name": "가면토낑",
  "nameEn": "Masked Bunnie",
  "image": "../assets/monsters/rabbitkkebigreen.png",
  "breedEffect": {
   "text": "회피 반격 사용 시\n5초 동안 물리 속성 피해 5.25% 증가",
   "element": "물리",
   "value": 5.25,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_hermanturtlesilver",
  "gameId": 1201311,
  "name": "은동",
  "nameEn": "Silvershell",
  "image": "../assets/monsters/hermanturtlesilver.png",
  "breedEffect": {
   "text": "보스 몬스터에게 피격 시\n5초 동안 모든 팀원의 지원 피해 5.25% 증가",
   "element": "공용",
   "value": 5.25,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_geuseunsaesky",
  "gameId": 1201321,
  "name": "성불그슨새",
  "nameEn": "Sacred Hauntstack",
  "image": "../assets/monsters/geuseunsaesky.png",
  "breedEffect": {
   "text": "교체 스킬의 치명타 피해 5.25% 증가",
   "element": "공용",
   "value": 5.25,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_geuseunsaegreen",
  "gameId": 1201331,
  "name": "덤불그슨새",
  "nameEn": "Brush Hauntstack",
  "image": "../assets/monsters/geuseunsaegreen.png",
  "breedEffect": {
   "text": "그로기 상태의 보스 몬스터에게 얼음 속성 피해 5.25% 증가",
   "element": "얼음",
   "value": 5.25,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_treebackahaxe",
  "gameId": 1201341,
  "name": "패대기",
  "nameEn": "Stumpster",
  "image": "../assets/monsters/treebackahaxe.png",
  "breedEffect": {
   "text": "교체 스킬의 불 속성 피해 5.25% 증가",
   "element": "불",
   "value": 5.25,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_meogurishieldboss",
  "gameId": 1201351,
  "name": "보르보그",
  "nameEn": "Borborg",
  "image": "../assets/monsters/meogurishieldboss.png",
  "breedEffect": {
   "text": "보스 몬스터 10회 공격 시\n5초 동안 방어력 4.13% 증가",
   "element": "공용",
   "value": 4.13,
   "direction": "증가",
   "stat": "방어력",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "보르보그",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 빠르게 회전하며 공격하여 물리 속성 피해 를 줍니다.",
   "appearanceConditions": "공격 적중 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 20,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 80,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 100,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 100,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": []
  }
 },
 {
  "id": "mons_flowerbackah",
  "gameId": 1201361,
  "name": "뒤틀린 뼈오름 꽃",
  "nameEn": "Twisted Spineflower",
  "image": "../assets/monsters/flowerbackah.png",
  "breedEffect": {
   "text": "번개 속성 몬스터 10회 공격 시\n번개 속성 피해 5% 증가",
   "element": "번개",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_flowerbackahmiddle",
  "gameId": 1201371,
  "name": "뒤틀린 피오름 꽃",
  "nameEn": "Twisted Bloodflower",
  "image": "../assets/monsters/flowerbackahmiddle.png",
  "breedEffect": {
   "text": "번개 속성 몬스터 5회 공격 시\n5초 동안 대상의 번개 속성 저항 5% 감소\n(20초에 1회 발동)",
   "element": "번개",
   "value": 5,
   "direction": "감소",
   "stat": "저항",
   "cooldownSeconds": 20
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_geuseunsaeblack",
  "gameId": 1201381,
  "name": "검은 그슨새",
  "nameEn": "Black Hauntstack",
  "image": "../assets/monsters/geuseunsaeblack.png",
  "breedEffect": {
   "text": "그로기 상태의 보스 몬스터에게 얼음 속성 피해 5.5% 증가",
   "element": "얼음",
   "value": 5.5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "검은 그슨새",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 스스로 회오리가 되어 주변의 적을 공격하며 물 속성 피해 를 주고 마지막 낙하 공격에 맞은 적을 공중에 띄웁니다.",
   "appearanceConditions": "공격 적중 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 20,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 80,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 100,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 100,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": []
  }
 },
 {
  "id": "mons_manwollok",
  "gameId": 1201391,
  "name": "만월록",
  "nameEn": "Manwol",
  "image": "../assets/monsters/manwollok.png",
  "breedEffect": {
   "text": "회피 반격 사용 시\n5초 동안 치명타 확률 6% 증가",
   "element": "공용",
   "value": 6,
   "direction": "증가",
   "stat": "확률",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "만월록",
   "element": "바람",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 전방을 향해 깃털을 날려 공격한 뒤 적을 공격하는 회오리를 생성하여 바람 속성 피해 를 주고 적을 끌어오며 추가 효과 를 부여하고 적을 공중에 띄웁니다.",
   "appearanceConditions": "바람 속성 공격 적중 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 20,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 80,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 100,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 100,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": [
    "바람 속성 저항 감소"
   ]
  }
 },
 {
  "id": "mons_hakabackah",
  "gameId": 1201401,
  "name": "온새",
  "nameEn": "Onsae",
  "image": "../assets/monsters/hakabackah.png",
  "breedEffect": {
   "text": "궁극 스킬의 치명타 공격 성공 시\n5초 동안 치명타 피해 6% 증가",
   "element": "공용",
   "value": 6,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "온새",
   "element": "불",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 여러 번 회전하며 불 속성 피해 를 주고 추가 효과 를 부여합니다.",
   "appearanceConditions": "불 속성 공격 적중 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 20,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 80,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 100,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 100,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": [
    "불 속성 저항 감소"
   ]
  }
 },
 {
  "id": "mons_nachuchukimchi",
  "gameId": 1201411,
  "name": "김추추",
  "nameEn": "Kimkimchi",
  "image": "../assets/monsters/nachuchukimchi.png",
  "breedEffect": {
   "text": "일반 몬스터에게 땅 속성 피해 5.25% 증가\n(20초에 1회 발동)",
   "element": "땅",
   "value": 5.25,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": 20
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_nasusubutter",
  "gameId": 1201421,
  "name": "군수수",
  "nameEn": "Rococorn",
  "image": "../assets/monsters/nasusubutter.png",
  "breedEffect": {
   "text": "일반 몬스터에게 치명타 피해 5.25% 증가\n(20초에 1회 발동)",
   "element": "공용",
   "value": 5.25,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": 20
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_meogurishieldbossgold",
  "gameId": 1201431,
  "name": "금동",
  "nameEn": "Goald",
  "image": "../assets/monsters/meogurishieldbossgold.png",
  "breedEffect": {
   "text": "보스 몬스터 10회 공격 시\n5초 동안 방어력 4.34% 증가",
   "element": "공용",
   "value": 4.34,
   "direction": "증가",
   "stat": "방어력",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "금동",
   "element": "불",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 빠르게 회전하며 공격하여 물리 속성 피해 를 주고 추가 효과 를 부여합니다.",
   "appearanceConditions": "불 속성 공격 적중 시 | 얼음 속성 공격 적중 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 20,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 80,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 100,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 100,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": [
    "불 속성 저항 감소",
    "얼음 속성 저항 감소"
   ]
  }
 },
 {
  "id": "mons_meoguriblue",
  "gameId": 1201441,
  "name": "딱구리",
  "nameEn": "Salt-alee",
  "image": "../assets/monsters/meoguriblue.png",
  "breedEffect": {
   "text": "강습 공격의 치명타 확률 5.25% 증가",
   "element": "공용",
   "value": 5.25,
   "direction": "증가",
   "stat": "확률",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_hanulwhite",
  "gameId": 1201451,
  "name": "굴각",
  "nameEn": "Gulgak",
  "image": "../assets/monsters/hanulwhite.png",
  "breedEffect": {
   "text": "보스 몬스터에게 치명타 성공 시\n5초 동안 대상의 방어력 4.73% 감소",
   "element": "공용",
   "value": 4.73,
   "direction": "감소",
   "stat": "방어력",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "굴각",
   "element": "공용",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 번개를 휘감은 앞발로 지면을 강타한 뒤 크게 포효하며 번개 속성 피해 를 주고 추가 효과 를 부여하며 적을 공중에 띄웁니다.",
   "appearanceConditions": "특수 스킬 사용 시 | 궁극 스킬 적중 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 60,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 130,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 160,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 200,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": [
    "번개 속성 저항 감소",
    "받는 약점 속성 피해 증가"
   ]
  }
 },
 {
  "id": "mons_hakabackahblack",
  "gameId": 1201461,
  "name": "잉걸불",
  "nameEn": "Cinder",
  "image": "../assets/monsters/hakabackahblack.png",
  "breedEffect": {
   "text": "궁극 스킬의 치명타 공격 성공 시\n5초 동안 치명타 피해 6.3% 증가",
   "element": "공용",
   "value": 6.3,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "잉걸불",
   "element": "불",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 불을 내뿜으며 불 속성 피해 를 주고 추가 효과 를 부여합니다.",
   "appearanceConditions": "불 속성 공격 적중 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 20,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 80,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 100,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 100,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": [
    "불 속성 저항 감소"
   ]
  }
 },
 {
  "id": "mons_manwollokblack",
  "gameId": 1201471,
  "name": "녹정",
  "nameEn": "Nokjung",
  "image": "../assets/monsters/manwollokblack.png",
  "breedEffect": {
   "text": "회피 반격 사용 시\n5초 동안 치명타 확률 6.3% 증가",
   "element": "공용",
   "value": 6.3,
   "direction": "증가",
   "stat": "확률",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "녹정",
   "element": "바람",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 두 차례 깃털을 날려 공격 한 뒤 적을 향해 돌진하여 바람 속성 피해 를 주고 추가 효과 를 부여하며 적을 공중에 띄웁니다.",
   "appearanceConditions": "바람 속성 공격 적중 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 20,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 80,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 100,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 100,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": [
    "바람 속성 저항 감소"
   ]
  }
 },
 {
  "id": "mons_rabbitbackahwhite",
  "gameId": 1201481,
  "name": "표백단 토낑",
  "nameEn": "Bleacher Bunnie",
  "image": "../assets/monsters/rabbitbackahwhite.png",
  "breedEffect": {
   "text": "회피 반격 사용 시\n5초 동안 바람 속성 피해 5.25% 증가",
   "element": "바람",
   "value": 5.25,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_raccoonbackahwhite",
  "gameId": 1201491,
  "name": "표백단 너굴",
  "nameEn": "Bleacher Raccoonie",
  "image": "../assets/monsters/raccoonbackahwhite.png",
  "breedEffect": {
   "text": "회피 반격 사용 시\n5초 동안 보스 몬스터 피해 5.25% 증가",
   "element": "공용",
   "value": 5.25,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_flowerbackahmiddleblue",
  "gameId": 1201501,
  "name": "멍든 피오름 꽃",
  "nameEn": "Bruised Bloodflower",
  "image": "../assets/monsters/flowerbackahmiddleblue.png",
  "breedEffect": {
   "text": "번개 속성 몬스터 5회 공격 시\n5초 동안 대상의 번개 속성 저항 5.25% 감소",
   "element": "번개",
   "value": 5.25,
   "direction": "감소",
   "stat": "저항",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_hermanlizardbow",
  "gameId": 1201511,
  "name": "도마궁",
  "nameEn": "Lizarcher",
  "image": "../assets/monsters/hermanlizardbow.png",
  "breedEffect": {
   "text": "불 속성 몬스터 10회 공격 시\n5초 방어력 3.75% 증가",
   "element": "불",
   "value": 3.75,
   "direction": "증가",
   "stat": "방어력",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_hermanlizard",
  "gameId": 1201521,
  "name": "도마린",
  "nameEn": "Lizcout",
  "image": "../assets/monsters/hermanlizard.png",
  "breedEffect": {
   "text": "피격 시 10초 동안 땅 속성 공격력 5% 증가\n(20초에 1회 발동)",
   "element": "땅",
   "value": 5,
   "direction": "증가",
   "stat": "공격력",
   "cooldownSeconds": 20
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_hermanlizardhat",
  "gameId": 1201531,
  "name": "도마경",
  "nameEn": "Master Lizcout",
  "image": "../assets/monsters/hermanlizardhat.png",
  "breedEffect": {
   "text": "",
   "element": "데이터없음",
   "value": null,
   "direction": "",
   "stat": "",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_hermancrocodile",
  "gameId": 1201541,
  "name": "아고",
  "nameEn": "Kroko",
  "image": "../assets/monsters/hermancrocodile.png",
  "breedEffect": {
   "text": "일반 몬스터 10회 공격 시\n5초 동안 방어력 3.75% 증가",
   "element": "공용",
   "value": 3.75,
   "direction": "증가",
   "stat": "방어력",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_hermancrocodiledora",
  "gameId": 1201551,
  "name": "아고뇽",
  "nameEn": "Krokomander",
  "image": "../assets/monsters/hermancrocodiledora.png",
  "breedEffect": {
   "text": "",
   "element": "데이터없음",
   "value": null,
   "direction": "",
   "stat": "",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_hermanturtle",
  "gameId": 1201561,
  "name": "철갑부기",
  "nameEn": "Irontoise",
  "image": "../assets/monsters/hermanturtle.png",
  "breedEffect": {
   "text": "보스 몬스터에게 치명타 성공 시\n10초 동안 모든 팀원의 방어력 4.13% 증가",
   "element": "공용",
   "value": 4.13,
   "direction": "증가",
   "stat": "방어력",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "철갑부기",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 돌진하며 철퇴로 수차례 공격하여 물리 속성 피해 를 주고 적을 공중에 띄웁니다.",
   "appearanceConditions": "공격 적중 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 20,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 80,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 100,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 100,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": []
  }
 },
 {
  "id": "mons_hermanturtlebrown",
  "gameId": 1201571,
  "name": "거목부기",
  "nameEn": "Treetoise",
  "image": "../assets/monsters/hermanturtlebrown.png",
  "breedEffect": {
   "text": "",
   "element": "데이터없음",
   "value": null,
   "direction": "",
   "stat": "",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "거목부기",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 빠르게 석궁을 연사한 뒤 적을 철퇴로 내려쳐 물리 속성 피해 를 주고 추가 효과 를 부여합니다.",
   "appearanceConditions": "공격 적중 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 20,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 80,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 100,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 100,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": [
    "기절 상태",
    "무력화 저항 감소"
   ]
  }
 },
 {
  "id": "mons_meogurishield",
  "gameId": 1201581,
  "name": "두껍구리",
  "nameEn": "Toad-alee",
  "image": "../assets/monsters/meogurishield.png",
  "breedEffect": {
   "text": "보스 몬스터에게 피격 시\n5초 동안 모든 팀원의 방어력 4.13% 증가\n(20초에 1회 발동)",
   "element": "공용",
   "value": 4.13,
   "direction": "증가",
   "stat": "방어력",
   "cooldownSeconds": 20
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "두껍구리",
   "element": "없음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 공중에서 방패로 내려찍은 뒤 눈앞의 적을 수차례 공격하며 이후 한 번 더 방패로 내려찍어 물리 속성 피해 를 주고 적을 공중에 띄웁니다.",
   "appearanceConditions": "강습 공격 사용 시 | 회피 반격 사용 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 100,
     "cooldownSeconds": 5
    },
    {
     "stage": 2,
     "damagePercent": 120,
     "cooldownSeconds": 5
    },
    {
     "stage": 3,
     "damagePercent": 200,
     "cooldownSeconds": 5
    },
    {
     "stage": 4,
     "damagePercent": 220,
     "cooldownSeconds": 5
    },
    {
     "stage": 5,
     "damagePercent": 250,
     "cooldownSeconds": 5
    }
   ],
   "extraEffects": []
  }
 },
 {
  "id": "mons_childghost",
  "gameId": 1201591,
  "name": "소아령",
  "nameEn": "Baby Spirit",
  "image": "../assets/monsters/childghost.png",
  "breedEffect": {
   "text": "바람 속성 몬스터 10회 공격 시\n5초 동안 일반 몬스터 피해 5% 증가",
   "element": "바람",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_childghostsquirrel",
  "gameId": 1201601,
  "name": "다람령",
  "nameEn": "Chipmunk Spirit",
  "image": "../assets/monsters/childghostsquirrel.png",
  "breedEffect": {
   "text": "",
   "element": "데이터없음",
   "value": null,
   "direction": "",
   "stat": "",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_ghostwind",
  "gameId": 1201611,
  "name": "질풍령",
  "nameEn": "Wind Spirit",
  "image": "../assets/monsters/ghostwind.png",
  "breedEffect": {
   "text": "바람 속성 몬스터 10회 공격 시\n공격력 2.5% 증가",
   "element": "바람",
   "value": 2.5,
   "direction": "증가",
   "stat": "공격력",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_ghostwindmiddle",
  "gameId": 1201621,
  "name": "천시령",
  "nameEn": "Grudge Spirit",
  "image": "../assets/monsters/ghostwindmiddle.png",
  "breedEffect": {
   "text": "교체 스킬 사용 시\n5초 동안 모든 팀원의 지원 피해 5% 증가",
   "element": "공용",
   "value": 5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_ghostwindmiddlered",
  "gameId": 1201631,
  "name": "천시원령",
  "nameEn": "Grudge Revenant",
  "image": "../assets/monsters/ghostwindmiddlered.png",
  "breedEffect": {
   "text": "",
   "element": "데이터없음",
   "value": null,
   "direction": "",
   "stat": "",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_hermanlizardbowred",
  "gameId": 1201641,
  "name": "황멸궁",
  "nameEn": "Sun Lizarcher",
  "image": "../assets/monsters/hermanlizardbowred.png",
  "breedEffect": {
   "text": "",
   "element": "데이터없음",
   "value": null,
   "direction": "",
   "stat": "",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_nagimiddle",
  "gameId": 1201651,
  "name": "비아미",
  "nameEn": "Sunek",
  "image": "../assets/monsters/nagimiddle.png",
  "breedEffect": {
   "text": "바람 속성 몬스터 10회 공격 시\n5초 방어력 3.75% 증가",
   "element": "바람",
   "value": 3.75,
   "direction": "증가",
   "stat": "방어력",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_nagimiddlepink",
  "gameId": 1201661,
  "name": "비화",
  "nameEn": "Suhwa",
  "image": "../assets/monsters/nagimiddlepink.png",
  "breedEffect": {
   "text": "",
   "element": "데이터없음",
   "value": null,
   "direction": "",
   "stat": "",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 },
 {
  "id": "mons_snowybeast",
  "gameId": 1201671,
  "name": "설귀호",
  "nameEn": "Phantom Snow Tiger",
  "image": "../assets/monsters/snowybeast.png",
  "breedEffect": {
   "text": "교체 스킬 사용 시\n5초 동안 제압 피해 5.5% 증가",
   "element": "공용",
   "value": 5.5,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "설귀호",
   "element": "얼음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 차가운 냉기의 숨결을 내뿜어 적에게 얼음 속성 피해 을 주고 추가 효과 를 부여합니다.",
   "appearanceConditions": "교체 스킬 사용 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 60,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 130,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 160,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 200,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": [
    "빙결 상태",
    "얼음 속성 저항 감소"
   ]
  }
 },
 {
  "id": "mons_snowybeastblack",
  "gameId": 1201681,
  "name": "석괴호",
  "nameEn": "Phantom Stone Tiger",
  "image": "../assets/monsters/snowybeastblack.png",
  "breedEffect": {
   "text": "",
   "element": "데이터없음",
   "value": null,
   "direction": "",
   "stat": "",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "석괴호",
   "element": "땅",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 적을 향해 낙하하여 큰 충격과 함께 땅 속성 피해 를 주고 추가 효과 를 부여합니다.",
   "appearanceConditions": "교체 스킬 사용 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 60,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 130,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 160,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 200,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": [
    "석화 상태",
    "땅 속성 저항 감소"
   ]
  }
 },
 {
  "id": "mons_wetlandmaster",
  "gameId": 1201691,
  "name": "적영",
  "nameEn": "Red Shadow",
  "image": "../assets/monsters/wetlandmaster.png",
  "breedEffect": {
   "text": "특수 스킬로 얼음 속성 공격 시\n4초 동안 치명타 피해 6% 증가",
   "element": "얼음",
   "value": 6,
   "direction": "증가",
   "stat": "피해",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "적영",
   "element": "얼음",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 땅속으로 들어간 뒤 적을 향해 튀어나오며 얼음 속성 피해 를 주고 추가 효과 를 부여하며 적을 공중에 띄웁니다.",
   "appearanceConditions": "특수 스킬 사용 시 | 궁극 스킬 적중 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 60,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 130,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 160,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 200,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": [
    "얼음 속성 저항 감소",
    "무력화 저항 감소"
   ]
  }
 },
 {
  "id": "mons_wetlandmasterblue",
  "gameId": 1201701,
  "name": "청영",
  "nameEn": "Blue Shadow",
  "image": "../assets/monsters/wetlandmasterblue.png",
  "breedEffect": {
   "text": "",
   "element": "데이터없음",
   "value": null,
   "direction": "",
   "stat": "",
   "cooldownSeconds": null
  },
  "hasLinkChain": true,
  "linkChain": {
   "name": "청영",
   "element": "공용",
   "intro": "몬스터링 장착 시 등장 조건에 따라 나타나 거센 소용돌이로 수차례 공격한 뒤 수면 위로 튀어 올라 적에게 얼음 속성 피해 를 주고 추가 효과 를 부여하며 적을 공중에 띄웁니다.",
   "appearanceConditions": "특수 스킬 사용 시 | 궁극 스킬 적중 시",
   "stages": [
    {
     "stage": 1,
     "damagePercent": 40,
     "cooldownSeconds": 15
    },
    {
     "stage": 2,
     "damagePercent": 60,
     "cooldownSeconds": 15
    },
    {
     "stage": 3,
     "damagePercent": 130,
     "cooldownSeconds": 15
    },
    {
     "stage": 4,
     "damagePercent": 160,
     "cooldownSeconds": 15
    },
    {
     "stage": 5,
     "damagePercent": 200,
     "cooldownSeconds": 8
    }
   ],
   "extraEffects": [
    "얼음 속성 저항 감소",
    "받는 약점 속성 피해 증가"
   ]
  }
 },
 {
  "id": "mons_knightrabbit_evil",
  "gameId": 1201711,
  "name": "무사 토낑",
  "nameEn": "Bunnie Swordsman",
  "image": "../assets/monsters/knightrabbit_evil.png",
  "breedEffect": {
   "text": "회피 반격 사용 시\n5초 동안 대상의 바람 속성 저항 5% 감소",
   "element": "바람",
   "value": 5,
   "direction": "감소",
   "stat": "저항",
   "cooldownSeconds": null
  },
  "hasLinkChain": false,
  "linkChain": {
   "name": "",
   "element": "",
   "intro": "",
   "appearanceConditions": "",
   "stages": [],
   "extraEffects": []
  }
 }
];
