// src/gameData.js — 순수 데이터 상수

export const GC = 40;
export const GR = 20;
export const TICK = 3000;
export const SL = 30;
export const SAVE_KEY = "parktycoon_v2_saves";

export const SEASONS = [
  {name:"🌸 봄",  mult:1.0, color:"#FFB8D1",events:[["🌸 벚꽃 축제! 단체 방문↑",0.08],["🌧️ 봄비로 방문객 감소",0.06]]},
  {name:"☀️ 여름",mult:1.4, color:"#FECA57",events:[["🎉 방학 특수! 가족 폭증",0.10],["🌡️ 폭염 — 워터시설 대기 급증",0.07]]},
  {name:"🍂 가을",mult:0.85,color:"#FF9F43",events:[["🍂 단풍 시즌 — 커플↑",0.07],["🎃 할로윈 대박!",0.05]]},
  {name:"❄️ 겨울",mult:0.55,color:"#74B9FF",events:[["🎄 크리스마스 특수!",0.09],["🌨️ 폭설 — 급감",0.08]]},
];

export const HOLIDAY_EVENTS = [
  {id:"cherry_blossom",emoji:"🌸",season:0,name:{ko:"벚꽃 축제",en:"Cherry Blossom Festival"},desc:{ko:"커플·가족 방문객 급증!",en:"Couples & families surge!"},duration:8,startDayInSeason:5,visMult:1.30,coupleBonus:0.25,satMod:8,specialBld:null},
  {id:"summer_fiesta",emoji:"🎆",season:1,name:{ko:"여름 축제",en:"Summer Fiesta"},desc:{ko:"방문객 폭발! 워터시설 인기↑",en:"Visitor boom! Water rides popular!"},duration:10,startDayInSeason:8,visMult:1.45,coupleBonus:0.10,satMod:5,specialBld:null},
  {id:"halloween",emoji:"🎃",season:2,name:{ko:"할로윈 파티",en:"Halloween Party"},desc:{ko:"스릴 시설 인기 폭발!",en:"Thrill rides soar!"},duration:7,startDayInSeason:12,visMult:1.25,thrillBonus:0.40,satMod:6,specialBld:null},
  {id:"christmas",emoji:"🎄",season:3,name:{ko:"크리스마스 스페셜",en:"Christmas Special"},desc:{ko:"가족·커플 만족도 급상승!",en:"Family & couple satisfaction soars!"},duration:10,startDayInSeason:10,visMult:1.35,coupleBonus:0.20,satMod:15,specialBld:null},
];

export const INVESTOR_OFFERS = [
  {id:"angel",emoji:"😇",amount:30000,name:{ko:"엔젤 투자자",en:"Angel Investor"},desc:{ko:"초기 투자! 빠른 성장을 기대합니다.",en:"Seed investment! Expecting rapid growth."},condition:{minDay:25,minVis:80,minStars:2},goal:{days:20,target:"vis",value:200,desc:{ko:"20일 내 방문객 200명",en:"200 visitors in 20 days"}},penalty:0.15},
  {id:"venture",emoji:"💼",amount:100000,name:{ko:"벤처 투자자",en:"Venture Investor"},desc:{ko:"성장 가능성을 봅니다. 증명해보세요.",en:"Betting on your potential. Prove it."},condition:{minDay:50,minVis:200,minStars:3},goal:{days:25,target:"stars",value:4,desc:{ko:"25일 내 4성 달성",en:"Reach 4 stars in 25 days"}},penalty:0.20},
  {id:"series_a",emoji:"🏦",amount:250000,name:{ko:"시리즈 A 투자",en:"Series A Investment"},desc:{ko:"대규모 투자! 최고를 향해 달려가세요.",en:"Major investment! Aim for the top."},condition:{minDay:80,minVis:400,minStars:4},goal:{days:30,target:"net",value:8000,desc:{ko:"30일 내 일 순이익 $8k",en:"$8k daily profit in 30 days"}},penalty:0.25},
];

export const MAP_TYPES = [
  {id:"default",emoji:"🌿",name:{ko:"기본 공원",en:"Default Park"},desc:{ko:"균형 잡힌 표준 공원",en:"Balanced standard park"},color:"#5EF6A0",segBonus:{},visMultSeason:[1,1,1,1],admMult:1.0},
  {id:"urban",emoji:"🏙️",name:{ko:"도심 공원",en:"Urban Park"},desc:{ko:"높은 입장료, 직장인 방문객 多",en:"High admission, office workers"},color:"#48DBFB",segBonus:{general:0.15,couple:0.10},visMultSeason:[0.9,1.0,1.1,0.8],admMult:1.3},
  {id:"beach",emoji:"🏖️",name:{ko:"해변 공원",en:"Beach Park"},desc:{ko:"여름 특수! 커플·가족 인기",en:"Summer boom! Couples & families"},color:"#FECA57",segBonus:{couple:0.20,family:0.15},visMultSeason:[0.9,1.6,0.85,0.5],admMult:1.1},
  {id:"mountain",emoji:"🗻",name:{ko:"산악 공원",en:"Mountain Park"},desc:{ko:"스릴 시커 천국! 어드벤처 특화",en:"Thrill seekers paradise!"},color:"#FF9F43",segBonus:{thrill:0.25,child:-0.05},visMultSeason:[1.1,1.2,1.3,0.6],admMult:1.0},
  {id:"forest",emoji:"🌲",name:{ko:"숲속 공원",en:"Forest Park"},desc:{ko:"자연 테마 보너스, 가족 친화",en:"Nature bonus, family-friendly"},color:"#1DD1A1",segBonus:{family:0.20,child:0.10},visMultSeason:[1.2,1.0,1.3,0.7],admMult:0.9},
];

export const LEAGUES = [
  {id:"bronze",emoji:"🥉",name:{ko:"브론즈 리그",en:"Bronze League"},color:"#CD7F32",req:{medals:1,type:"bronze"}},
  {id:"silver",emoji:"🥈",name:{ko:"실버 리그",en:"Silver League"},color:"#C0C0C0",req:{medals:3,type:"silver"}},
  {id:"gold",emoji:"🥇",name:{ko:"골드 리그",en:"Gold League"},color:"#FFD700",req:{medals:5,type:"gold"}},
  {id:"diamond",emoji:"💎",name:{ko:"다이아 리그",en:"Diamond League"},color:"#A8D8EA",req:{medals:5,type:"gold",allScenarios:true}},
];

export const BREAK_CHANCE = {entrance:0.004,ferrisWheel:0.04,rollerCoaster:0.07,carousel:0.03,thrillRide:0.055,waterRide:0.045,bumperCars:0.03,dropTower:0.06,miniTrain:0.025,hauntedHouse:0.02,cinema4D:0.015,balloonRide:0.035};
export const ZONES = {thrill:{emoji:"🎢",color:"#FF4757",bg:"#FF475718"},family:{emoji:"👨‍👩‍👧",color:"#FF9F43",bg:"#FF9F4318"},food:{emoji:"🍔",color:"#FECA57",bg:"#FECA5718"},nature:{emoji:"🌳",color:"#1DD1A1",bg:"#1DD1A118"},vip:{emoji:"⭐",color:"#A29BFE",bg:"#A29BFE18"}};
export const PARCELS = [
  {id:"westA",cost:8000, cols:[8,11], icon:"🌿",req:null,   label:{ko:"서쪽 A구역",en:"West Wing A"}},
  {id:"westB",cost:20000,cols:[4,7],  icon:"🌲",req:"westA",label:{ko:"서쪽 B구역",en:"West Wing B"}},
  {id:"westC",cost:38000,cols:[0,3],  icon:"🏔️",req:"westB",label:{ko:"서쪽 C구역",en:"West Wing C"}},
  {id:"eastA",cost:8000, cols:[28,31],icon:"🏕️",req:null,   label:{ko:"동쪽 A구역",en:"East Wing A"}},
  {id:"eastB",cost:20000,cols:[32,35],icon:"🏞️",req:"eastA",label:{ko:"동쪽 B구역",en:"East Wing B"}},
  {id:"eastC",cost:38000,cols:[36,39],icon:"🌄",req:"eastB",label:{ko:"동쪽 C구역",en:"East Wing C"}},
];
export const SEGS = {family:{emoji:"👨‍👩‍👧",color:"#FF9F43",spendMult:1.2},couple:{emoji:"💑",color:"#FF6B9D",spendMult:1.5},thrill:{emoji:"🎢",color:"#FF6B6B",spendMult:0.8},child:{emoji:"👦",color:"#48DBFB",spendMult:0.5},general:{emoji:"🧑",color:"#C7B8EA",spendMult:1.0}};
export const SEG_PULL = {ferrisWheel:{family:2,couple:4},rollerCoaster:{thrill:5},carousel:{family:3,child:4},thrillRide:{thrill:4},waterRide:{thrill:3,family:2},foodStall:{family:3,child:2},iceCream:{child:4,family:1},giftShop:{couple:2,family:1},restroom:{family:3},garden:{couple:4,family:1},fountain:{couple:5},bumperCars:{child:3,thrill:2},dropTower:{thrill:5},miniTrain:{child:4,family:3},hauntedHouse:{thrill:3,couple:2},cinema4D:{couple:3,general:2},balloonRide:{couple:4,family:2},miniGolf:{family:4,couple:2},arcade:{child:5,general:2},vipLounge:{couple:5,general:1}};

export const CAMPAIGNS_DATA = {tv:{emoji:"📺",cost:3000,days:10,boost:0.30},sns:{emoji:"📱",cost:1500,days:7,boost:0.15},event:{emoji:"🎪",cost:800,days:5,boost:0.20},billboard:{emoji:"🪧",cost:2000,days:8,boost:0.25},celebrity:{emoji:"⭐",cost:5000,days:12,boost:0.45}};
export const VIP_EVENTS = [{id:"school",emoji:"🎒",bonusVis:160,bonusRev:2200,presBonus:3,req:{restroom:2,foodStall:1}},{id:"corp",emoji:"💼",bonusVis:90,bonusRev:6000,presBonus:5,req:{}},{id:"media",emoji:"📸",bonusVis:0,bonusRev:0,presBonus:15,req:{}},{id:"influencer",emoji:"🌟",bonusVis:220,bonusRev:800,presBonus:8,req:{}},{id:"sports",emoji:"🏆",bonusVis:130,bonusRev:3500,presBonus:4,req:{foodStall:2}}];
export const RB_BRANCHES = {ride:{emoji:"🎡",color:"#FF6B9D"},commerce:{emoji:"💰",color:"#FECA57"},ops:{emoji:"⚙️",color:"#48DBFB"},prestige:{emoji:"⭐",color:"#A29BFE"},expansion:{emoji:"🚀",color:"#5EF6A0"}};

export const RESEARCH = [
  {id:"r1",branch:"ride",tier:1,emoji:"⚡",cost:5,req:null}, {id:"r2",branch:"ride",tier:1,emoji:"🛡️",cost:7,req:null}, {id:"r3",branch:"ride",tier:2,emoji:"🔋",cost:10,req:"r1"}, {id:"r4",branch:"ride",tier:3,emoji:"🛋️",cost:11,req:"r3"},
  {id:"c1",branch:"commerce",tier:1,emoji:"📈",cost:5,req:null}, {id:"c2",branch:"commerce",tier:1,emoji:"🎫",cost:7,req:null}, {id:"c3",branch:"commerce",tier:2,emoji:"💎",cost:10,req:"c1"}, {id:"c4",branch:"commerce",tier:3,emoji:"🏆",cost:11,req:"c3"},
  {id:"o1",branch:"ops",tier:1,emoji:"⚙️",cost:5,req:null}, {id:"o2",branch:"ops",tier:1,emoji:"🤖",cost:6,req:null}, {id:"o3",branch:"ops",tier:2,emoji:"🌱",cost:10,req:"o1"}, {id:"o4",branch:"ops",tier:3,emoji:"🧠",cost:11,req:"o3"},
  {id:"p1",branch:"prestige",tier:1,emoji:"📺",cost:5,req:null}, {id:"p2",branch:"prestige",tier:1,emoji:"📱",cost:6,req:null}, {id:"p3",branch:"prestige",tier:2,emoji:"🥇",cost:10,req:"p1"}, {id:"p4",branch:"prestige",tier:3,emoji:"🌍",cost:11,req:"p3"},
  {id:"ex1",branch:"expansion",tier:1,emoji:"🎪",cost:8,req:null}, {id:"ex2",branch:"expansion",tier:2,emoji:"🌐",cost:12,req:"ex1"}, {id:"ex3",branch:"expansion",tier:2,emoji:"🤖",cost:12,req:"ex1"}, {id:"ex4",branch:"expansion",tier:3,emoji:"🔮",cost:13,req:"ex2"},
];

export const MISSIONS = [
  {id:"m1", emoji:"👥",reward:{$:3000, rp:1},check:s=>s.vis>=50,   desc:{ko:"동시 방문객 50명 달성",           en:"Have 50 visitors at once"}},
  {id:"m2", emoji:"👥",reward:{$:6000, rp:2},check:s=>s.vis>=100,  desc:{ko:"동시 방문객 100명 달성",          en:"Have 100 visitors at once"}},
  {id:"m3", emoji:"👥",reward:{$:12000,rp:3},check:s=>s.vis>=200,  desc:{ko:"동시 방문객 200명 달성",          en:"Have 200 visitors at once"}},
  {id:"m4", emoji:"😊",reward:{$:5000, rp:2},check:s=>s.sat>=70,   desc:{ko:"만족도 70% 이상 유지",            en:"Maintain 70%+ satisfaction"}},
  {id:"m5", emoji:"😊",reward:{$:10000,rp:4},check:s=>s.sat>=85,   desc:{ko:"만족도 85% 이상 유지",            en:"Maintain 85%+ satisfaction"}},
  {id:"m6", emoji:"🧹",reward:{$:4000, rp:2},check:s=>s.clean>=90, desc:{ko:"청결도 90% 이상 달성",            en:"Reach 90%+ cleanliness"}},
  {id:"m7", emoji:"🎡",reward:{$:8000, rp:3},check:s=>s.rides>=5,  desc:{ko:"어트랙션 5개 이상 건설",          en:"Build 5+ attractions"}},
  {id:"m8", emoji:"🎡",reward:{$:18000,rp:5},check:s=>s.rides>=10, desc:{ko:"어트랙션 10개 이상 건설",         en:"Build 10+ attractions"}},
  {id:"m9", emoji:"⭐",reward:{$:10000,rp:4},check:s=>s.pres>=3,   desc:{ko:"공원 명성 ⭐×3 달성",             en:"Reach ⭐×3 park prestige"}},
  {id:"m10",emoji:"⭐",reward:{$:30000,rp:8},check:s=>s.pres>=5,   desc:{ko:"공원 명성 ⭐×5 달성",             en:"Reach ⭐×5 park prestige"}},
  {id:"m11",emoji:"🎫",reward:{$:15000,rp:4},check:s=>s.pass>=100, desc:{ko:"시즌권 누적 100개 이상 판매",      en:"Sell 100+ season passes total"}},
  {id:"m12",emoji:"🎒",reward:{$:20000,rp:5},check:s=>s.vips>=5,   desc:{ko:"VIP 이벤트 5회 이상 유치",        en:"Host 5+ VIP events"}},
  {id:"m13",emoji:"🎨",reward:{$:8000, rp:3},check:s=>s.zones>=10, desc:{ko:"구역(Zone) 타일 10개 이상 지정",  en:"Paint 10+ zone tiles"}},
  {id:"m14",emoji:"💰",reward:{$:12000,rp:4},check:s=>s.net>=5000, desc:{ko:"일 순이익 $5,000 달성",           en:"Earn $5,000 net profit in a day"}},
  {id:"m15",emoji:"🔬",reward:{$:10000,rp:3},check:s=>s.research>=5,desc:{ko:"연구 항목 5개 이상 완료",         en:"Complete 5+ research items"}},
];
export const DISASTERS = [{id:"fire",emoji:"🔥",dur:5,resolveCost:3000,visMult:0.5,revMult:0.7,satPen:15},{id:"power",emoji:"⚡",dur:4,resolveCost:1500,visMult:0.6,revMult:0,satPen:10},{id:"storm",emoji:"🌪️",dur:3,resolveCost:0,visMult:0.1,revMult:0.1,satPen:5},{id:"accident",emoji:"🚨",dur:7,resolveCost:5000,visMult:0.3,revMult:0.4,satPen:25},{id:"strike",emoji:"✊",dur:5,resolveCost:4000,visMult:0.8,revMult:0.8,satPen:8}];
export const WEATHERS = [
  {id:"sunny",emoji:"☀️",name:{ko:"맑음",en:"Sunny"},visMult:1.12,satMod:3,maintMod:0.9,dur:[2,4]},
  {id:"cloudy",emoji:"⛅",name:{ko:"흐림",en:"Cloudy"},visMult:0.95,satMod:0,maintMod:1.0,dur:[1,3]},
  {id:"rainy",emoji:"🌧️",name:{ko:"비",en:"Rainy"},visMult:0.72,satMod:-5,maintMod:1.15,dur:[1,3]},
  {id:"stormy",emoji:"⛈️",name:{ko:"폭풍우",en:"Storm"},visMult:0.35,satMod:-14,maintMod:1.4,dur:[1,2]},
  {id:"foggy",emoji:"🌫️",name:{ko:"안개",en:"Foggy"},visMult:0.80,satMod:-2,maintMod:1.05,dur:[1,2]},
  {id:"rainbow",emoji:"🌈",name:{ko:"무지개",en:"Rainbow"},visMult:1.45,satMod:12,maintMod:0.75,dur:[1,2]},
];
export const WEATHER_WEIGHTS = [[40,25,20,5,5,5],[45,20,15,5,5,10],[30,30,25,8,5,2],[15,25,15,20,25,0]];

export const DEFAULT_RIDE_PRICES = {ferrisWheel:4,rollerCoaster:8,carousel:3,thrillRide:6,waterRide:5,bumperCars:3,dropTower:7,miniTrain:2,hauntedHouse:5,cinema4D:4,balloonRide:4,arcade:2,miniGolf:3,vipLounge:12};
export const DEFAULT_SHOP_MULTS = {foodStall:1.0,iceCream:1.0,giftShop:1.0,arcade:1.0,vipLounge:1.0};
export const MAX_FEE_BY_STARS = [0,15,25,40,55,70];

export const LANG_FLAGS = {ko:"🇰🇷 한국어",en:"🇺🇸 English"};
export const TR = {
  ko:{
    "tab.build":"건설","tab.manage":"경영","tab.finance":"재무","tab.marketing":"마케팅","tab.research":"연구","tab.mission":"미션",
    "menu.newGame":"새 게임","menu.loadGame":"불러오기","menu.emptySlot":"빈 슬롯","menu.deleteSlot":"삭제","menu.back":"← 뒤로",
    "mode.campaign":"캠페인 모드","mode.sandbox":"샌드박스 모드","mode.challenge":"챌린지 모드",
    "mode.campaign.desc":"시나리오를 클리어하며\n공원 경영을 배우세요","mode.sandbox.desc":"제한 없이 꿈의 공원을\n자유롭게 건설하세요","mode.challenge.desc":"난이도를 선택해\n도전하세요",
    "scn.select":"시나리오 선택","diff.select":"난이도 선택",
    "diff.easy":"🟢 쉬움","diff.normal":"🟡 보통","diff.hard":"🔴 어려움","diff.extreme":"💀 극한",
    "diff.easy.desc":"여유로운 자금, 재난 희귀","diff.normal.desc":"기본 설정, 균형잡힌 경영","diff.hard.desc":"자금 부족, 재난 빈번","diff.extreme.desc":"생존 경영, 최강 도전",
    "lbl.budget":"자금","lbl.ticket":"입장료","lbl.visitors":"방문객","lbl.satisfaction":"만족도","lbl.cleanliness":"청결도","lbl.day":"일차","lbl.loan":"대출","lbl.disaster":"재난","lbl.research":"연구","lbl.pass":"패스","lbl.campaign":"캠페인","lbl.mode":"모드",
    "bld.hint":"건물 선택 후 그리드 클릭","bld.cancel":"✕ {name} 취소","bld.demolish":"🔨 철거","bld.repair":"🔧 {cost}","bld.upgrade":"⬆️ {cost}","bld.max":"✅ 최고","bld.pathNote":"통로 미연결 -40%","bld.locked":"연구 필요","bld.free":"무료",
    "cat.ride":"🎠 어트랙션","cat.shop":"🍔 상업","cat.facility":"🌿 편의","cat.path":"🛤️ 통로","cat.deco":"🌸 장식",
    "b.entrance":"입구 게이트","b.ferrisWheel":"관람차","b.rollerCoaster":"롤러코스터","b.carousel":"회전목마","b.thrillRide":"스릴 라이드","b.waterRide":"워터 슬라이드","b.bumperCars":"범퍼카","b.dropTower":"자이로드롭","b.miniTrain":"미니 기차","b.hauntedHouse":"귀신의 집","b.cinema4D":"4D 시네마","b.balloonRide":"열기구","b.foodStall":"푸드코트","b.iceCream":"아이스크림","b.giftShop":"기념품점","b.arcade":"오락실","b.vipLounge":"VIP 라운지","b.restroom":"화장실","b.garden":"정원","b.fountain":"분수대","b.miniGolf":"미니 골프","b._path":"통로","b._pathFancy":"고급 통로","b.bench":"벤치","b.lamp":"가로등","b.flowerBed":"화단","b.parkSign":"안내판",
    "mgr.admission":"입장료","mgr.limit":"한도","mgr.staff":"직원","mgr.loan":"대출","mgr.hire":"고용","mgr.fire":"해고","mgr.wages":"인건비","mgr.take":"실행",
    "fin.rating":"공원 평점","fin.weakest":"약점이 전체를 결정","fin.lowest":"최저","fin.pricing":"요금 전략","fin.ridePrices":"탑승 요금","fin.shopMults":"상업 가격 배율","fin.revBreak":"수익 구성","fin.revTrend":"수익 추이 ({days}일)","fin.estProfit":"예상 순이익/d","fin.limit":"한도",
    "pm.admission":"입장료 전용","pm.admission.desc":"입장료만 수익, 방문객↑","pm.per_ride":"어트랙션 요금제","pm.per_ride.desc":"무료 입장, 탑승마다 요금","pm.hybrid":"복합 요금제","pm.hybrid.desc":"입장료 + 탑승료 병행",
    "met.attraction":"어트랙션","met.scenery":"경관","met.satisfaction":"만족도","met.operations":"운영",
    "rev.admission":"입장료","rev.rides":"어트랙션","rev.shop":"상업시설","rev.pass":"패스",
    "mkt.pass":"연간 패스","mkt.holders":"보유자","mkt.income":"일 수익",
    "res.points":"연구 포인트","res.complete":"완료", "res.failDesc":"목표를 달성하지 못했습니다",
    "mis.title":"🎯 미션","mis.resolve":"즉시 해결","mis.timeLeft":"{days}일 남음","mis.goal":"목표","mis.achieved":"달성",
    "z.thrill":"스릴 존","z.family":"패밀리 존","z.food":"푸드 스트리트","z.nature":"자연 존","z.vip":"VIP 존","z.clear":"구역 지우기",
    "z.thrill.desc":"어트랙션 +25%","z.family.desc":"편의시설 +30%","z.food.desc":"상업 +30%","z.nature.desc":"정원·분수 +30%","z.vip.desc":"지출 +20%","z.clear.desc":"초기화",
    "st.janitor":"청소부","st.mechanic":"정비공","st.security":"안전요원","st.entertainer":"퍼포머",
    "tut.skip":"건너뛰기","btn.accept":"수락","btn.decline":"거절","btn.menu":"☰ 메뉴","btn.save":"💾","btn.load":"불러오기","btn.start":"시작",
    "res.success":"목표 달성!","res.timeout":"시간 초과!","res.backMenu":"메뉴로","res.continue":"계속 플레이",
    "map.land":"토지","map.done":"완료","map.buy":"구매",
    "misc.just":"방금","misc.minsAgo":"분 전","misc.hrsAgo":"시간 전","misc.daysAgo":"일 전","misc.free":"무료","misc.owned":"보유 중","misc.done":"완료","misc.sandbox":"🏗️ 샌드박스","misc.day":"Day",
    "vip.accept":"수락","vip.decline":"거절","vip.metReq":"✅ 요건 충족","vip.noReq":"❌ 요건 미충족",
    "welcome":"환영합니다! 메인 메뉴에서 게임 모드를 선택하세요.",
    "lang.select":"언어 / Language",
    "log.unownedLand": "🔒 미구매 토지입니다.", "log.alreadyBuilt": "⚠️ 이미 건물이 있습니다.", "log.noMoney": "💸 자금 부족!", "log.locked": "🔒 연구 필요!", "log.oneEntrance": "⚠️ 입구는 하나만!", "log.build": "🏗️ {name} 건설!", "log.upgrade": "⬆️ {name} Lv{lv}!", "log.repairNoMoney": "💸 수리 자금 부족!", "log.repair": "🔧 수리 완료!", "log.demolish": "🔨 철거.", "log.hire": "👋 {name} 고용!", "log.fire": "📤 {name} 해고.", "log.loan": "💳 대출!", "log.needPrevParcel": "⚠️ 선행 부지 먼저!", "log.parcelBought": "🏕️ {name} 구매!", "log.campaignStart": "📣 {name} 시작!", "log.vipReqFail": "❌ {name} 요건 미충족!", "log.vipSuccess": "🎊 {name} 성공!", "log.resolveNoMoney": "💸 해결 자금 부족!", "log.disasterSolved": "✅ 재난 해결!", "log.rpLacking": "💡 RP 부족!", "log.resReq": "🔒 선행 연구 필요!", "log.resComplete": "🔬 연구 완료: {name}!", "log.disasterEnd": "✅ {name} 종료", "log.disasterStart": "🚨 재난: {name} — {desc} ({dur}일)", "log.missionClear": "✅ 미션: {name}! +${reward}", "log.medalAchieved": "🏆 {medal} 달성! {desc}", "log.timeout": "⏰ 시간 초과! 목표 미달성", "log.warnBroken": "⚠️ 시설 {cnt}개 고장!", "log.warnCongest": "🚶 혼잡 초과!", "log.warnTrash": "🗑️ 심각한 오염!", "log.warnFee": "💸 입장료 초과! (${fee}한도)", "log.daySummary": "📊 Day {day} — {vis}명  {net}", "log.startSandbox": "🏗️ 샌드박스 모드: 무제한으로 마음껏 건설하세요!", "log.startCampaign": "🎯 캠페인: {name} — {desc}", "log.startChallenge": "⚡ 챌린지 모드 [{name}] — 시작 자금 ${money}", "log.saved": "💾 슬롯 {slot}에 저장됨!",
    "fmt.dayLog": "Day {day}", "fmt.visitors": "{vis}명",
    "scn.s1": "빈 땅의 꿈", "scn.s1.desc": "아무것도 없는 빈 땅에서 방문객이 사랑하는 공원을 만드세요.", "scn.s2": "커플의 천국", "scn.s2.desc": "로맨틱한 분위기로 커플 방문객을 끌어들이세요.", "scn.s3": "폐허에서 꿈으로", "scn.s3.desc": "낡은 공원을 재건하세요. 자금이 부족합니다.", "scn.s4": "도심 소형 공원", "scn.s4.desc": "제한된 부지를 활용해 높은 수익을 내세요.", "scn.s5": "어린이 낙원", "scn.s5.desc": "어린이들이 행복한 공원! 가족 시설을 건설하세요.",
    "scn.s6": "해변의 로맨스", "scn.s6.desc": "커플이 사랑하는 해변 공원! 워터라이드와 낭만적인 시설로 커플 방문객을 사로잡으세요.",
    "scn.s7": "공포의 밤", "scn.s7.desc": "스릴과 공포로 가득한 테마파크! 고장난 귀신의 집을 수리하고 최고의 공포 공원을 만드세요.",
    "scn.s8": "VIP 럭셔리 파크", "scn.s8.desc": "최고급 시설로 5성 공원을 달성하세요. 높은 자금으로 시작하지만 목표도 그만큼 높습니다.",
    "dis.fire": "화재!", "dis.fire.desc": "시설 고장", "dis.power": "정전!", "dis.power.desc": "수익 중단", "dis.storm": "태풍!", "dis.storm.desc": "방문객 이탈", "dis.accident": "안전 사고!", "dis.accident.desc": "방문객 급감", "dis.strike": "파업!", "dis.strike.desc": "직원 효과 없음",
    "mis.m1": "첫 방문객", "mis.m2": "100명 클럽", "mis.m3": "인기 공원", "mis.m4": "만족도 70%", "mis.m5": "명품 서비스", "mis.m6": "청결한 공원", "mis.m7": "놀이기구 5개", "mis.m8": "놀이기구 10개", "mis.m9": "3성 공원", "mis.m10": "5성 명품 공원", "mis.m11": "패스 100명", "mis.m12": "VIP 5회", "mis.m13": "구역 10칸", "mis.m14": "순이익 $5k", "mis.m15": "연구 5개",
    "camp.tv": "TV 광고", "camp.sns": "SNS 캠페인", "camp.event": "지역 이벤트", "camp.billboard": "옥외 광고", "camp.celebrity": "셀럽 초청",
    "vip.school": "학교 단체", "vip.corp": "기업 행사", "vip.media": "미디어 취재", "vip.influencer": "인플루언서", "vip.sports": "스포츠팀",
    "res.r1.name": "고성능 엔진", "res.r1.effect": "어트랙션 +15%", "res.r2.name": "안전 시스템", "res.r2.effect": "고장 -50%", "res.r3.name": "수용력 강화", "res.r3.effect": "수용 +25%", "res.r4.name": "VIP 라운지 해금", "res.r4.effect": "VIP 라운지 해금", "res.c1.name": "동적 가격제", "res.c1.effect": "입장료 +20%", "res.c2.name": "로열티 프로그램", "res.c2.effect": "패스 구매율 +50%", "res.c3.name": "프리미엄 상업", "res.c3.effect": "상업 수익 +20%", "res.c4.name": "멤버십 강화", "res.c4.effect": "패스 수익 +50%", "res.o1.name": "운영 효율화", "res.o1.effect": "유지비 -15%", "res.o2.name": "스마트 청소", "res.o2.effect": "청결도 +5/d", "res.o3.name": "에너지 절감", "res.o3.effect": "유지비 -25%", "res.o4.name": "AI 관리 시스템", "res.o4.effect": "자동수리 강화", "res.p1.name": "미디어 홍보팀", "res.p1.effect": "명성 +30%", "res.p2.name": "SNS 운영팀", "res.p2.effect": "커플 +20%", "res.p3.name": "국제 어워드", "res.p3.effect": "명성 효과 강화", "res.p4.name": "글로벌 브랜드", "res.p4.effect": "방문객 +25%",
    "loan.small": "소형 $10k", "loan.medium": "중형 $25k", "loan.large": "대형 $50k",
    "br.ride": "어트랙션", "br.commerce": "상업", "br.ops": "운영", "br.prestige": "명성", "br.expansion": "확장",
    "res.ex1.name": "이벤트 전문가", "res.ex1.effect": "이벤트 효과 +30%",
    "res.ex2.name": "글로벌 네트워크", "res.ex2.effect": "해외 방문객 +20%",
    "res.ex3.name": "스마트 운영", "res.ex3.effect": "전 유지비 -20%, 자동수리↑",
    "res.ex4.name": "차세대 기술", "res.ex4.effect": "모든 어트랙션 +30%"
  },
  en:{
    "tab.build":"Build","tab.manage":"Manage","tab.finance":"Finance","tab.marketing":"Marketing","tab.research":"Research","tab.mission":"Mission",
    "menu.newGame":"New Game","menu.loadGame":"Load Game","menu.emptySlot":"Empty Slot","menu.deleteSlot":"Delete","menu.back":"← Back",
    "mode.campaign":"Campaign","mode.sandbox":"Sandbox","mode.challenge":"Challenge",
    "mode.campaign.desc":"Clear scenarios to master\npark management","mode.sandbox.desc":"Build your dream park\nwithout limits","mode.challenge.desc":"Choose a difficulty and\ntest your skills",
    "scn.select":"Select Scenario","diff.select":"Select Difficulty",
    "diff.easy":"🟢 Easy","diff.normal":"🟡 Normal","diff.hard":"🔴 Hard","diff.extreme":"💀 Extreme",
    "diff.easy.desc":"Relaxed budget, rare disasters","diff.normal.desc":"Standard settings, balanced","diff.hard.desc":"Tight budget, frequent disasters","diff.extreme.desc":"Survival mode, max challenge",
    "lbl.budget":"Budget","lbl.ticket":"Ticket","lbl.visitors":"Visitors","lbl.satisfaction":"Happiness","lbl.cleanliness":"Cleanliness","lbl.day":"Day","lbl.loan":"Loan","lbl.disaster":"Disaster","lbl.research":"Research","lbl.pass":"Pass","lbl.campaign":"Boost","lbl.mode":"Mode",
    "bld.hint":"Select a building, then click the grid","bld.cancel":"✕ Cancel {name}","bld.demolish":"🔨 Demolish","bld.repair":"🔧 {cost}","bld.upgrade":"⬆️ {cost}","bld.max":"✅ Max","bld.pathNote":"No path connection -40%","bld.locked":"Research needed","bld.free":"Free",
    "cat.ride":"🎠 Attractions","cat.shop":"🍔 Shops","cat.facility":"🌿 Facilities","cat.path":"🛤️ Paths","cat.deco":"🌸 Decorations",
    "b.entrance":"Entrance Gate","b.ferrisWheel":"Ferris Wheel","b.rollerCoaster":"Roller Coaster","b.carousel":"Carousel","b.thrillRide":"Thrill Ride","b.waterRide":"Water Slide","b.bumperCars":"Bumper Cars","b.dropTower":"Drop Tower","b.miniTrain":"Mini Train","b.hauntedHouse":"Haunted House","b.cinema4D":"4D Cinema","b.balloonRide":"Hot Air Balloon","b.foodStall":"Food Court","b.iceCream":"Ice Cream","b.giftShop":"Gift Shop","b.arcade":"Arcade","b.vipLounge":"VIP Lounge","b.restroom":"Restroom","b.garden":"Garden","b.fountain":"Fountain","b.miniGolf":"Mini Golf","b._path":"Path","b._pathFancy":"Fancy Path","b.bench":"Bench","b.lamp":"Lamp Post","b.flowerBed":"Flower Bed","b.parkSign":"Park Sign",
    "mgr.admission":"Admission Fee","mgr.limit":"limit","mgr.staff":"Staff","mgr.loan":"Loans","mgr.hire":"Hire","mgr.fire":"Fire","mgr.wages":"Wages","mgr.take":"Take Loan",
    "fin.rating":"Park Rating","fin.weakest":"Weakest metric determines rating","fin.lowest":"Lowest","fin.pricing":"Pricing Strategy","fin.ridePrices":"Ride Ticket Prices","fin.shopMults":"Shop Price Multipliers","fin.revBreak":"Revenue Breakdown","fin.revTrend":"Revenue Trend ({days} days)","fin.estProfit":"Est. Net Profit/day","fin.limit":"limit",
    "pm.admission":"Admission Only","pm.admission.desc":"Entry fee only, more visitors","pm.per_ride":"Per-Ride Pricing","pm.per_ride.desc":"Free entry, charge per ride","pm.hybrid":"Hybrid Pricing","pm.hybrid.desc":"Entry fee + per-ride charges",
    "met.attraction":"Attraction","met.scenery":"Scenery","met.satisfaction":"Happiness","met.operations":"Operations",
    "rev.admission":"Admission","rev.rides":"Rides","rev.shop":"Shops","rev.pass":"Pass",
    "mkt.pass":"Annual Pass","mkt.holders":"Holders","mkt.income":"Daily Income",
    "res.points":"Research Points","res.complete":"Complete", "res.failDesc":"You failed to achieve the goal.",
    "mis.title":"🎯 Missions","mis.resolve":"Resolve Now","mis.timeLeft":"{days} days left","mis.goal":"Goal","mis.achieved":"Achieved",
    "z.thrill":"Thrill Zone","z.family":"Family Zone","z.food":"Food Street","z.nature":"Nature Zone","z.vip":"VIP Zone","z.clear":"Clear Zone",
    "z.thrill.desc":"Attractions +25%","z.family.desc":"Facilities +30%","z.food.desc":"Shops +30%","z.nature.desc":"Garden/Fountain +30%","z.vip.desc":"Spending +20%","z.clear.desc":"Reset zone",
    "st.janitor":"Janitor","st.mechanic":"Mechanic","st.security":"Security","st.entertainer":"Entertainer",
    "tut.skip":"Skip","btn.accept":"Accept","btn.decline":"Decline","btn.menu":"☰ Menu","btn.save":"💾","btn.load":"Load","btn.start":"Start",
    "res.success":"Goal Achieved!","res.timeout":"Time's Up!","res.backMenu":"Main Menu","res.continue":"Keep Playing",
    "map.land":"Land","map.done":"Done","map.buy":"Buy",
    "misc.just":"Just now","misc.minsAgo":" min ago","misc.hrsAgo":" hr ago","misc.daysAgo":" d ago","misc.free":"Free","misc.owned":"Owned","misc.done":"Done","misc.sandbox":"🏗️ Sandbox","misc.day":"Day",
    "vip.accept":"Accept","vip.decline":"Decline","vip.metReq":"✅ Requirements met","vip.noReq":"❌ Not met",
    "welcome":"Welcome! Choose a game mode from the main menu.",
    "lang.select":"Language",
    "log.unownedLand": "🔒 Unowned land.", "log.alreadyBuilt": "⚠️ Building already exists.", "log.noMoney": "💸 Not enough money!", "log.locked": "🔒 Research required!", "log.oneEntrance": "⚠️ Only one entrance allowed!", "log.build": "🏗️ Built {name}!", "log.upgrade": "⬆️ {name} Lv{lv}!", "log.repairNoMoney": "💸 Not enough money to repair!", "log.repair": "🔧 Repaired!", "log.demolish": "🔨 Demolished.", "log.hire": "👋 Hired {name}!", "log.fire": "📤 Fired {name}.", "log.loan": "💳 Loan taken!", "log.needPrevParcel": "⚠️ Buy previous parcel first!", "log.parcelBought": "🏕️ {name} bought!", "log.campaignStart": "📣 Started {name}!", "log.vipReqFail": "❌ {name} requirements not met!", "log.vipSuccess": "🎊 {name} succeeded!", "log.resolveNoMoney": "💸 Not enough money to resolve!", "log.disasterSolved": "✅ Disaster resolved!", "log.rpLacking": "💡 Not enough RP!", "log.resReq": "🔒 Prerequisite research needed!", "log.resComplete": "🔬 Research complete: {name}!", "log.disasterEnd": "✅ {name} ended", "log.disasterStart": "🚨 Disaster: {name} — {desc} ({dur} days)", "log.missionClear": "✅ Mission: {name}! +${reward}", "log.medalAchieved": "🏆 {medal} Achieved! {desc}", "log.timeout": "⏰ Time's up! Goal failed", "log.warnBroken": "⚠️ {cnt} facilities broken!", "log.warnCongest": "🚶 Overcrowded!", "log.warnTrash": "🗑️ Very dirty!", "log.warnFee": "💸 Fee exceeds limit! (${fee} max)", "log.daySummary": "📊 Day {day} — {vis} visitors  {net}", "log.startSandbox": "🏗️ Sandbox Mode: Build freely with unlimited resources!", "log.startCampaign": "🎯 Campaign: {name} — {desc}", "log.startChallenge": "⚡ Challenge Mode [{name}] — Start Money ${money}", "log.saved": "💾 Saved to slot {slot}!",
    "fmt.dayLog": "Day {day}", "fmt.visitors": "{vis} visitors",
    "scn.s1": "Dream of Empty Land", "scn.s1.desc": "Build a park that visitors love from scratch.", "scn.s2": "Couple's Paradise", "scn.s2.desc": "Attract couples with a romantic vibe. Vibe is key!", "scn.s3": "Ruins to Dreams", "scn.s3.desc": "Rebuild an old park with broken facilities.", "scn.s4": "Urban Mini Park", "scn.s4.desc": "Maximize profit in a limited area.", "scn.s5": "Kids' Paradise", "scn.s5.desc": "A park where kids are happy!",
    "scn.s6": "Beach Romance", "scn.s6.desc": "A beach park that couples love! Attract couple visitors with water rides and romantic facilities.",
    "scn.s7": "Night of Fear", "scn.s7.desc": "A theme park full of thrills and horror! Repair the broken haunted house and build the ultimate horror park.",
    "scn.s8": "VIP Luxury Park", "scn.s8.desc": "Reach 5 stars with premium facilities. You start with more funds, but the goals are equally ambitious.",
    "dis.fire": "Fire!", "dis.fire.desc": "Facilities broken", "dis.power": "Outage!", "dis.power.desc": "Revenue halted", "dis.storm": "Storm!", "dis.storm.desc": "Visitors leave", "dis.accident": "Accident!", "dis.accident.desc": "Vis/Rev drop", "dis.strike": "Strike!", "dis.strike.desc": "Staff disabled",
    "mis.m1": "First Visitor", "mis.m2": "100 Club", "mis.m3": "Popular Park", "mis.m4": "Happiness 70%", "mis.m5": "Luxury Service", "mis.m6": "Clean Park", "mis.m7": "5 Rides", "mis.m8": "10 Rides", "mis.m9": "3-Star Park", "mis.m10": "5-Star Park", "mis.m11": "100 Passes", "mis.m12": "5 VIPs", "mis.m13": "10 Zones", "mis.m14": "$5k Net Profit", "mis.m15": "5 Researches",
    "camp.tv": "TV Ad", "camp.sns": "SNS Campaign", "camp.event": "Local Event", "camp.billboard": "Billboard", "camp.celebrity": "Invite Celebrity",
    "vip.school": "School Trip", "vip.corp": "Corporate Event", "vip.media": "Media Coverage", "vip.influencer": "Influencer", "vip.sports": "Sports Team",
    "res.r1.name": "High Perf. Engine", "res.r1.effect": "Attraction +15%", "res.r2.name": "Safety System", "res.r2.effect": "Breakdowns -50%", "res.r3.name": "Capacity Boost", "res.r3.effect": "Capacity +25%", "res.r4.name": "Unlock VIP Lounge", "res.r4.effect": "VIP Lounge Unlocked", "res.c1.name": "Dynamic Pricing", "res.c1.effect": "Admission +20%", "res.c2.name": "Loyalty Program", "res.c2.effect": "Pass Sales +50%", "res.c3.name": "Premium Shops", "res.c3.effect": "Shop Revenue +20%", "res.c4.name": "Enhanced Membership", "res.c4.effect": "Pass Income +50%", "res.o1.name": "Efficient Ops", "res.o1.effect": "Maintenance -15%", "res.o2.name": "Smart Cleaning", "res.o2.effect": "Cleanliness +5/d", "res.o3.name": "Energy Saver", "res.o3.effect": "Maintenance -25%", "res.o4.name": "AI Management", "res.o4.effect": "Enhanced Auto-Repair", "res.p1.name": "Media PR Team", "res.p1.effect": "Prestige +30%", "res.p2.name": "SNS Team", "res.p2.effect": "Couples +20%", "res.p3.name": "Intl. Award", "res.p3.effect": "Prestige Effect x1.5", "res.p4.name": "Global Brand", "res.p4.effect": "Base Visitors +25%",
    "loan.small": "Small $10k", "loan.medium": "Medium $25k", "loan.large": "Large $50k",
    "br.ride": "Attractions", "br.commerce": "Commerce", "br.ops": "Operations", "br.prestige": "Prestige", "br.expansion": "Expansion",
    "res.ex1.name": "Event Specialist", "res.ex1.effect": "Event effect +30%",
    "res.ex2.name": "Global Network", "res.ex2.effect": "Int'l visitors +20%",
    "res.ex3.name": "Smart Operations", "res.ex3.effect": "All maintenance -20%, auto-repair↑",
    "res.ex4.name": "Next-Gen Tech", "res.ex4.effect": "All attractions +30%"
  }
};

export const SCENARIOS = [
  {id:"s1",emoji:"🌱",difficulty:1,color:"#5EF6A0",startMoney:40000,timeLimit:60,preBuilt:[
    {type:"entrance",r:9,c:15,level:0,broken:false},
    {type:"_path",   r:9,c:17,level:0,broken:false},
    {type:"_path",   r:9,c:18,level:0,broken:false},
    {type:"carousel",r:9,c:19,level:0,broken:false},
  ],gridRestrict:null,goals:[
    {id:"bronze",medal:"🥉",desc:{ko:"방문객 50명",en:"50 visitors"},check:s=>s.vis>=50},
    {id:"silver",medal:"🥈",desc:{ko:"방문객 100명 + 만족도 65%",en:"100 visitors + 65% happiness"},check:s=>s.vis>=100&&s.sat>=65},
    {id:"gold",medal:"🥇",desc:{ko:"방문객 200명 + 만족도 75%",en:"200 visitors + 75% happiness"},check:s=>s.vis>=200&&s.sat>=75}]},
  {id:"s2",emoji:"💑",difficulty:2,color:"#FF6B9D",startMoney:38000,timeLimit:50,preBuilt:[],gridRestrict:null,
   obstacles:[{r:7,c:21,type:"water"},{r:7,c:22,type:"water"},{r:8,c:21,type:"water"},{r:8,c:22,type:"water"}],
   goals:[
    {id:"bronze",medal:"🥉",desc:{ko:"커플 비율 40%",en:"40% couple ratio"},check:s=>s.coupleRatio>=0.4},
    {id:"silver",medal:"🥈",desc:{ko:"커플 55% + 입장료 $20",en:"55% couples + $20 fee"},check:s=>s.coupleRatio>=0.55&&s.fee>=20},
    {id:"gold",medal:"🥇",desc:{ko:"커플 65% + 순이익 $2k",en:"65% couples + $2k profit"},check:s=>s.coupleRatio>=0.65&&s.net>=2000}]},
  {id:"s3",emoji:"🔧",difficulty:3,color:"#FF9F43",startMoney:22000,timeLimit:55,preBuilt:[{type:"entrance",r:9,c:15,level:0,broken:false},{type:"ferrisWheel",r:5,c:12,level:0,broken:true},{type:"carousel",r:11,c:18,level:0,broken:true},{type:"restroom",r:8,c:17,level:0,broken:false},{type:"foodStall",r:12,c:15,level:0,broken:false}],gridRestrict:null,
   obstacles:[{r:3,c:20,type:"rubble"},{r:3,c:21,type:"rubble"},{r:4,c:20,type:"rubble"},{r:14,c:19,type:"rubble"},{r:15,c:19,type:"rubble"}],
   goals:[
    {id:"bronze",medal:"🥉",desc:{ko:"공원 2성",en:"2-star park"},check:s=>s.pres>=2},
    {id:"silver",medal:"🥈",desc:{ko:"3성 + 고장 없음",en:"3 stars + no breakdowns"},check:s=>s.pres>=3&&s.brokenCount===0},
    {id:"gold",medal:"🥇",desc:{ko:"4성 + 만족도 75%",en:"4 stars + 75% happiness"},check:s=>s.pres>=4&&s.sat>=75}]},
  {id:"s4",emoji:"🏙️",difficulty:3,color:"#48DBFB",startMoney:45000,timeLimit:60,preBuilt:[],gridRestrict:{cols:[14,25]},
   obstacles:[{r:5,c:14,type:"rock"},{r:5,c:15,type:"rock"},{r:14,c:14,type:"rock"},{r:14,c:15,type:"rock"}],
   goals:[
    {id:"bronze",medal:"🥉",desc:{ko:"순이익 $1,000/일",en:"$1,000 daily profit"},check:s=>s.net>=1000},
    {id:"silver",medal:"🥈",desc:{ko:"순이익 $3,000/일",en:"$3,000 daily profit"},check:s=>s.net>=3000},
    {id:"gold",medal:"🥇",desc:{ko:"순이익 $5k + 만족도 75%",en:"$5k profit + 75% happiness"},check:s=>s.net>=5000&&s.sat>=75}]},
  {id:"s5",emoji:"👦",difficulty:2,color:"#FECA57",startMoney:42000,timeLimit:55,preBuilt:[],gridRestrict:null,goals:[
    {id:"bronze",medal:"🥉",desc:{ko:"어린이 비율 40%",en:"40% child ratio"},check:s=>s.childRatio>=0.4},
    {id:"silver",medal:"🥈",desc:{ko:"어린이 55% + 만족도 70%",en:"55% children + 70% happiness"},check:s=>s.childRatio>=0.55&&s.sat>=70},
    {id:"gold",medal:"🥇",desc:{ko:"어린이 65% + 방문객 150명",en:"65% children + 150 visitors"},check:s=>s.childRatio>=0.65&&s.vis>=150}]},
  {id:"s6",emoji:"🏖️",difficulty:2,color:"#54A0FF",startMoney:42000,timeLimit:65,preBuilt:[
    {type:"entrance",r:9,c:15,level:0,broken:false},
    {type:"_path",   r:9,c:17,level:0,broken:false},
    {type:"_path",   r:9,c:18,level:0,broken:false},
    {type:"waterRide",r:8,c:19,level:0,broken:true},
  ],gridRestrict:null,goals:[
    {id:"bronze",medal:"🥉",desc:{ko:"커플 35% + 방문객 80명",en:"35% couples + 80 visitors"},check:s=>s.coupleRatio>=0.35&&s.vis>=80},
    {id:"silver",medal:"🥈",desc:{ko:"커플 50% + 만족도 70%",en:"50% couples + 70% happiness"},check:s=>s.coupleRatio>=0.50&&s.sat>=70&&s.vis>=130},
    {id:"gold",medal:"🥇",desc:{ko:"커플 60% + 방문객 220명 + 순이익 $2k",en:"60% couples + 220 visitors + $2k profit"},check:s=>s.coupleRatio>=0.60&&s.vis>=220&&s.net>=2000}]},
  {id:"s7",emoji:"👻",difficulty:4,color:"#5F27CD",startMoney:38000,timeLimit:55,preBuilt:[
    {type:"entrance",    r:9,c:15,level:0,broken:false},
    {type:"_path",       r:9,c:17,level:0,broken:false},
    {type:"_path",       r:9,c:18,level:0,broken:false},
    {type:"hauntedHouse",r:9,c:19,level:0,broken:true},
  ],gridRestrict:null,
   obstacles:[{r:2,c:13,type:"deadtree"},{r:2,c:14,type:"deadtree"},{r:16,c:20,type:"deadtree"},{r:16,c:21,type:"deadtree"},{r:5,c:23,type:"deadtree"}],
   goals:[
    {id:"bronze",medal:"🥉",desc:{ko:"방문객 60명 + 순이익 $800",en:"60 visitors + $800 profit"},check:s=>s.vis>=60&&s.net>=800},
    {id:"silver",medal:"🥈",desc:{ko:"방문객 120명 + 3성 + 만족도 65%",en:"120 visitors + 3 stars + 65% happiness"},check:s=>s.vis>=120&&s.pres>=3&&s.sat>=65},
    {id:"gold",medal:"🥇",desc:{ko:"방문객 200명 + 4성 + 만족도 75%",en:"200 visitors + 4 stars + 75% happiness"},check:s=>s.vis>=200&&s.pres>=4&&s.sat>=75}]},
  {id:"s8",emoji:"👑",difficulty:5,color:"#FECA57",startMoney:65000,timeLimit:82,preBuilt:[],gridRestrict:null,
   obstacles:[{r:4,c:16,type:"rock"},{r:4,c:17,type:"rock"},{r:10,c:13,type:"water"},{r:10,c:14,type:"water"},{r:15,c:22,type:"rock"},{r:7,c:23,type:"rock"}],
   goals:[
    {id:"bronze",medal:"🥉",desc:{ko:"3성 + 순이익 $1,500",en:"3 stars + $1,500 profit"},check:s=>s.pres>=3&&s.net>=1500},
    {id:"silver",medal:"🥈",desc:{ko:"4성 + 순이익 $3,000 + 만족도 75%",en:"4 stars + $3,000 profit + 75% happiness"},check:s=>s.pres>=4&&s.net>=3000&&s.sat>=75},
    {id:"gold",medal:"🥇",desc:{ko:"5성 + 순이익 $5,000 + 만족도 80%",en:"5 stars + $5,000 profit + 80% happiness"},check:s=>s.pres>=5&&s.net>=5000&&s.sat>=80}]},
];

export const SCENARIO_DIFFICULTY = {
  easy:   { moneyMult:1.5,  timeMult:1.3,  emoji:"🟢", color:"#00E5A0", diffKey:"easy",   label:{ko:"쉬움",   en:"Easy"},   desc:{ko:"자금 +50%, 시간 +30%, 재난 희귀",     en:"+50% funds, +30% time, rare disasters"} },
  medium: { moneyMult:1.0,  timeMult:1.0,  emoji:"🟡", color:"#FECA57", diffKey:"normal", label:{ko:"보통",   en:"Medium"}, desc:{ko:"기본 설정, 균형잡힌 경영",           en:"Standard settings, balanced play"} },
  hard:   { moneyMult:0.65, timeMult:0.78, emoji:"🔴", color:"#FF5757", diffKey:"hard",   label:{ko:"어려움", en:"Hard"},   desc:{ko:"자금 -35%, 시간 -22%, 재난 빈번",   en:"-35% funds, -22% time, frequent disasters"} },
};

export const DIFFICULTY_SETTINGS = {easy:{emoji:"🟢",startMoney:70000,disasterMult:0.4,maintenanceMult:0.8},normal:{emoji:"🟡",startMoney:55000,disasterMult:1.0,maintenanceMult:1.0},hard:{emoji:"🔴",startMoney:30000,disasterMult:2.0,maintenanceMult:1.3},extreme:{emoji:"💀",startMoney:18000,disasterMult:3.0,maintenanceMult:1.4}};

export const STAGES = [
  {id:1,emoji:"🌱",color:"#5EF6A0",gradFrom:"#0A2010",gradTo:"#0D0D1A",
   name:{ko:"소규모 공원",en:"Starter Park"},
   desc:{ko:"초보 공원주. 입구와 놀이기구를 갖추세요.",en:"New park owner. Place rides and paths."},
   req:{bld:0,stars:1,money:0},
   next:{bld:5,stars:2,money:10000},
   bonus:{ko:"기본 운영",en:"Base operations"}},
  {id:2,emoji:"🏗️",color:"#FECA57",gradFrom:"#201800",gradTo:"#0D0D1A",
   name:{ko:"성장 중인 공원",en:"Growing Park"},
   desc:{ko:"방문객이 늘고 있어요! 다양한 시설을 추가하세요.",en:"Visitors growing! Add variety."},
   req:{bld:5,stars:2,money:10000},
   next:{bld:12,stars:3,money:50000},
   bonus:{ko:"방문객 +10%",en:"Visitors +10%"}},
  {id:3,emoji:"🎪",color:"#FF9F43",gradFrom:"#201000",gradTo:"#0D0D1A",
   name:{ko:"인기 공원",en:"Popular Park"},
   desc:{ko:"지역 명소로 떠올랐어요! 명성을 높이세요.",en:"Local attraction! Build prestige."},
   req:{bld:12,stars:3,money:50000},
   next:{bld:20,stars:4,money:120000},
   bonus:{ko:"수익 +10%, 방문객 +15%",en:"Revenue +10%, Visitors +15%"}},
  {id:4,emoji:"🏆",color:"#A29BFE",gradFrom:"#150E30",gradTo:"#0D0D1A",
   name:{ko:"프리미엄 공원",en:"Premium Park"},
   desc:{ko:"최고급 시설로 VIP를 유치하세요.",en:"Premium facilities attract VIPs."},
   req:{bld:20,stars:4,money:120000},
   next:{bld:30,stars:5,money:300000},
   bonus:{ko:"수익 +20%, 방문객 +25%",en:"Revenue +20%, Visitors +25%"}},
  {id:5,emoji:"🌟",color:"#FF6B9D",gradFrom:"#200A15",gradTo:"#0D0D1A",
   name:{ko:"세계 최고 공원",en:"World-Class Park"},
   desc:{ko:"전설적인 공원! 세계가 주목합니다.",en:"Legendary park! World-renowned."},
   req:{bld:30,stars:5,money:300000},
   next:null,
   bonus:{ko:"수익 +30%, 방문객 +40%",en:"Revenue +30%, Visitors +40%"}},
];

export const B = {
  entrance:    {emoji:"🎪",baseCost:0,    cat:"ride",   size:{w:2,h:1},color:"#FF6B6B",upgradeCost:[3000,8000],  stats:lv=>({attraction:5+lv*4,  rpv:0,      maintenance:0,         satBonus:0, cap:0})},
  ferrisWheel: {emoji:"🎡",baseCost:6500, cat:"ride",   size:{w:2,h:3},color:"#4ECDC4",upgradeCost:[4000,10000], flavor:{ko:"커플 명소 — 높은 수용인원",en:"Couple hotspot — high capacity"},stats:lv=>({attraction:15+lv*8, rpv:0,      maintenance:180+lv*60, satBonus:0, cap:50+lv*25})},
  rollerCoaster:{emoji:"🎢",baseCost:18000,cat:"ride",  size:{w:5,h:3},color:"#FF6B9D",upgradeCost:[10000,25000],flavor:{ko:"최강 어트랙션 — 별점 상승에 최고",en:"Peak attraction — best for star rating"},stats:lv=>({attraction:40+lv*15,rpv:0,      maintenance:450+lv*150,satBonus:0, cap:70+lv*30})},
  carousel:    {emoji:"🎠",baseCost:4500, cat:"ride",   size:{w:2,h:2},color:"#C7B8EA",upgradeCost:[2500,6000],  flavor:{ko:"가족·아이 전문 — 만족도 보너스",en:"Family & kid — satisfaction bonus"},stats:lv=>({attraction:12+lv*5, rpv:0,      maintenance:130+lv*40, satBonus:lv,cap:35+lv*15})},
  thrillRide:  {emoji:"🚀",baseCost:12000,cat:"ride",   size:{w:3,h:3},color:"#FF9F43",upgradeCost:[7000,18000], flavor:{ko:"스릴 마니아 전용 — 가성비 중간",en:"Thrill seekers — solid mid-tier value"},stats:lv=>({attraction:25+lv*12,rpv:0,      maintenance:300+lv*100,satBonus:0, cap:45+lv*20})},
  waterRide:   {emoji:"💦",baseCost:10000,cat:"ride",   size:{w:3,h:3},color:"#54A0FF",upgradeCost:[6000,15000], flavor:{ko:"여름 시즌 최강 — 높은 수용인원",en:"Summer season best — high capacity"},stats:lv=>({attraction:20+lv*10,rpv:0,      maintenance:250+lv*90, satBonus:0, cap:60+lv*25})},
  bumperCars:  {emoji:"🚗",baseCost:3200, cat:"ride",   size:{w:2,h:2},color:"#FF4757",upgradeCost:[2000,5000],  flavor:{ko:"저비용 초반 필수 — 만족도+어트랙션",en:"Budget early pick — satisfaction + attraction"},stats:lv=>({attraction:10+lv*5, rpv:0,      maintenance:100+lv*40, satBonus:2+lv,cap:40+lv*20})},
  dropTower:   {emoji:"🗼",baseCost:15000,cat:"ride",   size:{w:2,h:4},color:"#2F3542",upgradeCost:[8000,20000], flavor:{ko:"좁은 공간 고효율 — 수직형 배치 가능",en:"Small footprint, high draw — fits in tight spaces"},stats:lv=>({attraction:35+lv*14,rpv:0,      maintenance:400+lv*130,satBonus:0, cap:30+lv*15})},
  miniTrain:   {emoji:"🚂",baseCost:2800, cat:"ride",   size:{w:3,h:2},color:"#8B7355",upgradeCost:[1500,4000],  flavor:{ko:"아이·가족 특화 — 수용인원 최대",en:"Kid & family specialist — highest capacity"},stats:lv=>({attraction:8+lv*4,  rpv:0,      maintenance:80+lv*30,  satBonus:3+lv,cap:60+lv*30})},
  hauntedHouse:{emoji:"👻",baseCost:8500, cat:"ride",   size:{w:3,h:2},color:"#5F27CD",upgradeCost:[5000,12000], flavor:{ko:"커플·스릴 전용 — 야간 방문객 유인",en:"Couple & thrill draw — unique nighttime appeal"},stats:lv=>({attraction:22+lv*10,rpv:0,      maintenance:200+lv*80, satBonus:0, cap:25+lv*10})},
  cinema4D:    {emoji:"🎥",baseCost:8000, cat:"ride",   size:{w:3,h:2},color:"#3742FA",upgradeCost:[4000,10000], flavor:{ko:"유일한 라이드+수익 겸용 — 날씨 무관",en:"Only ride with shop revenue — weather immune"},stats:lv=>({attraction:18+lv*7, rpv:2+lv,   maintenance:160+lv*60, satBonus:2+lv,cap:80+lv*30})},
  balloonRide: {emoji:"🎈",baseCost:6000, cat:"ride",   size:{w:2,h:3},color:"#FF9FF3",upgradeCost:[3000,7000],  flavor:{ko:"커플·가족 분위기 — 높은 만족도 보너스",en:"Couple & family ambiance — strong sat bonus"},stats:lv=>({attraction:14+lv*6, rpv:0,      maintenance:140+lv*50, satBonus:3+lv,cap:20+lv*10})},
  foodStall:   {emoji:"🍔",baseCost:2500, cat:"shop",   size:{w:1,h:1},color:"#FECA57",upgradeCost:[2000,5000],  stats:lv=>({attraction:2+lv,    rpv:3+lv*2, maintenance:65+lv*25,  satBonus:lv,cap:0})},
  iceCream:    {emoji:"🍦",baseCost:1600, cat:"shop",   size:{w:1,h:1},color:"#48DBFB",upgradeCost:[1500,4000],  stats:lv=>({attraction:3+lv,    rpv:2+lv*2, maintenance:40+lv*16,  satBonus:0, cap:0})},
  giftShop:    {emoji:"🛍️",baseCost:4500, cat:"shop",   size:{w:2,h:2},color:"#FF9FF3",upgradeCost:[3000,8000],  stats:lv=>({attraction:1,       rpv:5+lv*4, maintenance:100+lv*40, satBonus:0, cap:0})},
  arcade:      {emoji:"🕹️",baseCost:3000, cat:"shop",   size:{w:2,h:2},color:"#A29BFE",upgradeCost:[2000,5000],  stats:lv=>({attraction:6+lv*3,  rpv:3+lv*2, maintenance:70+lv*25,  satBonus:0, cap:0})},
  vipLounge:   {emoji:"🛋️",baseCost:15000,cat:"shop",   size:{w:3,h:2},color:"#FECA57",upgradeCost:[8000,15000], locked:true, stats:lv=>({attraction:5+lv*3,  rpv:15+lv*8,maintenance:250+lv*80, satBonus:8+lv*4,cap:0})},
  restroom:    {emoji:"🚻",baseCost:1500, cat:"facility",size:{w:1,h:1},color:"#778CA3",upgradeCost:[1000,2500],  stats:lv=>({attraction:0,       rpv:0,      maintenance:45+lv*18,  satBonus:8+lv*4,cap:0})},
  garden:      {emoji:"🌳",baseCost:1000, cat:"facility",size:{w:2,h:2},color:"#5F27CD",upgradeCost:[800,2000],   stats:lv=>({attraction:4+lv*3,  rpv:0,      maintenance:30+lv*12,  satBonus:3+lv*2,cap:0})},
  fountain:    {emoji:"⛲",baseCost:2500, cat:"facility",size:{w:2,h:2},color:"#00D2D3",upgradeCost:[2000,5000],  stats:lv=>({attraction:6+lv*4,  rpv:0,      maintenance:70+lv*25,  satBonus:5+lv*3,cap:0})},
  miniGolf:    {emoji:"⛳",baseCost:4500, cat:"facility",size:{w:3,h:2},color:"#1DD1A1",upgradeCost:[2000,5000],  stats:lv=>({attraction:8+lv*4,  rpv:2+lv*2, maintenance:90+lv*30,  satBonus:4+lv,cap:0})},
  _path:       {emoji:"🟫",baseCost:100,  cat:"path",   size:{w:1,h:1},color:"#8B7355",upgradeCost:[600,0],      stats:lv=>({attraction:0,rpv:0,maintenance:2+lv*3,satBonus:0,cap:0})},
  _pathFancy:  {emoji:"🟨",baseCost:400,  cat:"path",   size:{w:1,h:1},color:"#D4AF37",upgradeCost:[0,0],        stats:()=>({attraction:0,rpv:0,maintenance:8,satBonus:1,cap:0})},
  bench:       {emoji:"🪑",baseCost:300,  cat:"deco",   size:{w:1,h:1},color:"#A0897A",upgradeCost:[0,0],        stats:()=>({attraction:0,rpv:0,maintenance:5,satBonus:3,cap:0})},
  lamp:        {emoji:"🏮",baseCost:500,  cat:"deco",   size:{w:1,h:1},color:"#FECA57",upgradeCost:[0,0],        stats:()=>({attraction:1,rpv:0,maintenance:10,satBonus:2,cap:0})},
  flowerBed:   {emoji:"🌸",baseCost:400,  cat:"deco",   size:{w:1,h:1},color:"#FF9FF3",upgradeCost:[0,0],        stats:()=>({attraction:2,rpv:0,maintenance:8,satBonus:2,cap:0})},
  parkSign:    {emoji:"🪧",baseCost:600,  cat:"deco",   size:{w:1,h:1},color:"#48DBFB",upgradeCost:[0,0],        stats:()=>({attraction:3,rpv:0,maintenance:4,satBonus:0,cap:0})},
};

export const STAFF = {janitor:{emoji:"🧹",hire:450,daily:150},mechanic:{emoji:"🔧",hire:600,daily:200},security:{emoji:"👮",hire:540,daily:180},entertainer:{emoji:"🎭",hire:360,daily:120}};
export const STAFF_UPGRADES = {
  janitor:    [{lv:1,upgCost:0},{lv:2,upgCost:3000,desc:{ko:"효율 청소기",en:"Efficient Cleaner"},clean:25,sat:5},{lv:3,upgCost:6000,desc:{ko:"프로 청소부",en:"Pro Janitor"},clean:35,sat:8}],
  mechanic:   [{lv:1,upgCost:0},{lv:2,upgCost:4000,desc:{ko:"숙련 정비공",en:"Skilled Mechanic"},repairMult:0.45,breakMult:0.4},{lv:3,upgCost:8000,desc:{ko:"마스터 정비공",en:"Master Mechanic"},repairMult:0.65,breakMult:0.55}],
  security:   [{lv:1,upgCost:0},{lv:2,upgCost:3500,desc:{ko:"전문 보안팀",en:"Pro Security"},sat:4,disasterPen:0.75},{lv:3,upgCost:7000,desc:{ko:"엘리트 경호대",en:"Elite Guard"},sat:7,disasterPen:0.55}],
  entertainer:[{lv:1,upgCost:0},{lv:2,upgCost:2500,desc:{ko:"인기 퍼포머",en:"Popular Performer"},visMult:0.10,sat:3},{lv:3,upgCost:5000,desc:{ko:"스타 퍼포머",en:"Star Performer"},visMult:0.18,sat:6}],
};
export const BONUS_EVENTS = [
  {id:"news",     emoji:"📰", name:{ko:"지역 뉴스 특집",   en:"Local News Feature"},   reward:{$:2000, rp:2}},
  {id:"donation", emoji:"🎁", name:{ko:"지역 사회 후원",   en:"Community Donation"},   reward:{$:3500, rp:0}},
  {id:"blog",     emoji:"✈️", name:{ko:"여행 블로그 소개", en:"Travel Blog Feature"},  reward:{$:1000, rp:4}},
  {id:"grant",    emoji:"🔬", name:{ko:"연구 지원금 수령", en:"Research Grant"},        reward:{$:500,  rp:6}},
  {id:"festival", emoji:"🎪", name:{ko:"지역 축제 연계",   en:"Local Festival Tie-in"},reward:{$:2500, rp:1}},
];
export const RIVAL_PARKS = [
  {id:"rival1",emoji:"🏟️",name:{ko:"행복 놀이공원",en:"Happy Land"},growRate:0.9,startDay:20,initPres:6},
  {id:"rival2",emoji:"🌟",name:{ko:"스타월드",en:"StarWorld"},growRate:1.6,startDay:45,initPres:12},
  {id:"rival3",emoji:"🌍",name:{ko:"메가파크",en:"MegaPark"},growRate:2.8,startDay:75,initPres:20},
];
export const FRANCHISES = {
  foodStall:[
    {id:"f_burger",emoji:"🍔",name:{ko:"버거킹",en:"BurgerKing"},rpvMult:1.4,satMod:-1,cost:5000},
    {id:"f_green",emoji:"🥗",name:{ko:"그린이츠",en:"GreenEats"},rpvMult:1.0,satMod:4,cost:3000},
    {id:"f_pizza",emoji:"🍕",name:{ko:"피자팰리스",en:"PizzaPalace"},rpvMult:1.2,satMod:2,cost:4000},
  ],
  iceCream:[
    {id:"ic_frost",emoji:"🍦",name:{ko:"프로스티",en:"Frosty"},rpvMult:1.2,satMod:3,cost:2000},
    {id:"ic_gourmet",emoji:"🍧",name:{ko:"고메젤라또",en:"GourmetGelato"},rpvMult:1.6,satMod:1,cost:4000},
  ],
  giftShop:[
    {id:"gs_park",emoji:"🛍️",name:{ko:"파크샵",en:"ParkShop"},rpvMult:1.0,satMod:1,cost:0},
    {id:"gs_lux",emoji:"💎",name:{ko:"럭셔리기프트",en:"LuxuryGifts"},rpvMult:1.8,satMod:0,cost:6000},
    {id:"gs_theme",emoji:"🎭",name:{ko:"테마샵",en:"ThemeShop"},rpvMult:1.3,satMod:3,cost:3500},
  ],
};
export const ZONE_MASTERY = {
  thrill:{cat:"ride",minBld:4,bonus:0.15},
  family:{cat:"facility",minBld:3,bonus:0.12},
  food:{cat:"shop",minBld:3,bonus:0.15},
  nature:{cat:"deco",minBld:4,bonus:0.12},
  vip:{cat:"shop",minBld:2,bonus:0.20},
};
export const LOAN_OPTS = [{id:"small", amount:10000,rate:0.04,days:30,icon:"💴"},{id:"medium", amount:25000,rate:0.055,days:50,icon:"💵"},{id:"large", amount:50000,rate:0.07,days:70,icon:"💰"}];
export const DOTS = ["🧑","👦","👧","🧒","🧔","👩","🧑‍🦱","👴","🧓","👱","🙋","🚶"];
export const TUTORIAL_STEPS = [
  {title:"🎪 입구 게이트 배치",text:"먼저 건설 탭에서 🎪 입구 게이트를 그리드에 배치하세요.\n입구가 없으면 방문객이 들어올 수 없어요!"},
  {title:"🛤️ 통로 연결",text:"건물 옆에 🟫 통로를 연결하세요.\n통로가 없는 시설은 방문객이 이용할 수 없어 수익이 -40%가 됩니다."},
  {title:"🎡 어트랙션 건설",text:"관람차·롤러코스터 등 어트랙션을 건설하세요.\n어트랙션이 많을수록 방문객이 늘고 공원 평점이 올라가요!"},
  {title:"🧹 직원 고용",text:"경영 탭에서 청소부·정비공을 고용하세요.\n청결도와 시설 고장률이 만족도에 큰 영향을 줍니다."},
  {title:"⏩ 속도 조절 & 확장",text:"상단 ▶▶ 버튼으로 게임 속도를 조절하세요.\n자금이 쌓이면 토지를 구매해 공원을 확장할 수 있어요!"},
];

export const SCENARIO_CLEAR_REWARDS = {
  bronze: { rp: 5,  bonus: { ko: "+5 RP 보너스!", en: "+5 RP Bonus!" } },
  silver: { rp: 12, bonus: { ko: "+12 RP + 특별 연구 포인트!", en: "+12 RP + Special Research Points!" } },
  gold:   { rp: 25, bonus: { ko: "+25 RP + 황금 스테이터스!", en: "+25 RP + Gold Status!" } },
};

export const DAILY_CHALLENGES = [
  {id:"dc1",emoji:"👥",goal:{type:"vis",value:30},reward:{$:1000,rp:1},name:{ko:"방문객 30명 달성",en:"Get 30 visitors"}},
  {id:"dc2",emoji:"😊",goal:{type:"sat",value:70},reward:{$:1500,rp:1},name:{ko:"만족도 70% 유지",en:"Reach 70% happiness"}},
  {id:"dc3",emoji:"💰",goal:{type:"net",value:500},reward:{$:2000,rp:2},name:{ko:"순이익 $500 달성",en:"Earn $500 net profit"}},
  {id:"dc4",emoji:"👥",goal:{type:"vis",value:60},reward:{$:2500,rp:2},name:{ko:"방문객 60명 달성",en:"Get 60 visitors"}},
  {id:"dc5",emoji:"🧹",goal:{type:"clean",value:90},reward:{$:1200,rp:1},name:{ko:"청결도 90% 유지",en:"Keep 90% cleanliness"}},
  {id:"dc6",emoji:"😊",goal:{type:"sat",value:80},reward:{$:3000,rp:2},name:{ko:"만족도 80% 달성",en:"Reach 80% happiness"}},
  {id:"dc7",emoji:"👥",goal:{type:"vis",value:100},reward:{$:4000,rp:3},name:{ko:"방문객 100명 달성",en:"Get 100 visitors"}},
  {id:"dc8",emoji:"💰",goal:{type:"net",value:2000},reward:{$:5000,rp:3},name:{ko:"순이익 $2,000 달성",en:"Earn $2,000 net profit"}},
  {id:"dc9",emoji:"⭐",goal:{type:"pres",value:3},reward:{$:6000,rp:4},name:{ko:"공원 3성 달성",en:"Reach 3-star park"}},
];

// Phase 3-2: Rival Park Events
export const RIVAL_EVENTS = [
  {id:"price_war",     emoji:"💲", col:"#FF5757",
   name:{ko:"가격 전쟁",   en:"Price War"},
   desc:{ko:"경쟁사가 입장료를 대폭 할인! 방문객 -20% (3일)",en:"Rival slashes prices! Visitors -20% (3 days)"},
   visMult:0.80, satPen:0, dur:3},
  {id:"bad_press",     emoji:"📰", col:"#FF9F43",
   name:{ko:"부정적 언론",  en:"Bad Press"},
   desc:{ko:"경쟁사가 부정적 기사를 배포! 만족도 -10 (4일)",en:"Rival spreads bad press! Sat -10 (4 days)"},
   visMult:1.0, satPen:10, dur:4},
  {id:"grand_event",   emoji:"🎉", col:"#FF6B9D",
   name:{ko:"경쟁사 대형 이벤트",en:"Rival Mega Event"},
   desc:{ko:"경쟁사가 대규모 이벤트 개최! 방문객 -30% (2일)",en:"Rival runs mega event! Visitors -30% (2 days)"},
   visMult:0.70, satPen:0, dur:2},
];

// Phase 3-5: Achievement System
export const ACHIEVEMENTS = [
  {id:"ach_first",   emoji:"🎊", col:"#FFD93D", name:{ko:"첫 방문객!",    en:"First Visitor!"},     desc:{ko:"첫 번째 방문객 도착",         en:"Your first visitor arrived"},      check:s=>s.totalVis>=1},
  {id:"ach_100",     emoji:"👥", col:"#4D9FFF", name:{ko:"100명 돌파",    en:"100 Visitors"},       desc:{ko:"누적 방문객 100명",           en:"100 cumulative visitors"},         check:s=>s.totalVis>=100},
  {id:"ach_500",     emoji:"🎠", col:"#FF9FF3", name:{ko:"500명 돌파",    en:"500 Visitors"},       desc:{ko:"누적 방문객 500명",           en:"500 cumulative visitors"},         check:s=>s.totalVis>=500},
  {id:"ach_1000",    emoji:"🎡", col:"#5EF6A0", name:{ko:"1,000명 입장",  en:"1K Visitors"},        desc:{ko:"누적 방문객 1,000명",         en:"1,000 cumulative visitors"},       check:s=>s.totalVis>=1000},
  {id:"ach_5000",    emoji:"🌟", col:"#FF9F43", name:{ko:"5,000명 방문",  en:"5K Visitors"},        desc:{ko:"누적 방문객 5,000명",         en:"5,000 cumulative visitors"},       check:s=>s.totalVis>=5000},
  {id:"ach_3star",   emoji:"🌠", col:"#48DBFB", name:{ko:"3성 공원",      en:"3-Star Park"},        desc:{ko:"공원 별점 3성 달성",          en:"Achieved 3-star rating"},          check:s=>s.stars>=3},
  {id:"ach_5star",   emoji:"⭐", col:"#FFD93D", name:{ko:"5성 공원",      en:"5-Star Park"},        desc:{ko:"공원 별점 5성 달성",          en:"Achieved 5-star rating"},          check:s=>s.stars>=5},
  {id:"ach_100k",    emoji:"💵", col:"#A29BFE", name:{ko:"$10만 달성",    en:"$100K Earner"},       desc:{ko:"보유 자금 $100,000 달성",     en:"Reached $100,000"},                check:s=>s.money>=100000},
  {id:"ach_million", emoji:"💰", col:"#5EF6A0", name:{ko:"백만장자",      en:"Millionaire"},        desc:{ko:"보유 자금 $1,000,000",        en:"Reached $1,000,000"},              check:s=>s.money>=1000000},
  {id:"ach_stage3",  emoji:"🎯", col:"#1DD1A1", name:{ko:"성장하는 공원",  en:"Growing Park"},       desc:{ko:"Stage 3 달성",               en:"Reached Stage 3"},                 check:s=>s.stageId>=3},
  {id:"ach_stage5",  emoji:"🏆", col:"#FF6B9D", name:{ko:"전설의 공원",   en:"Legendary Park"},     desc:{ko:"Stage 5 달성",               en:"Reached Stage 5"},                 check:s=>s.stageId>=5},
  {id:"ach_clean",   emoji:"✨", col:"#4ECDC4", name:{ko:"완벽한 청결",   en:"Spotless Park"},      desc:{ko:"청결도 100% 달성",            en:"Achieved 100% cleanliness"},       check:s=>s.clean>=100},
  {id:"ach_sat80",   emoji:"😄", col:"#FF6B9D", name:{ko:"행복한 공원",   en:"Happy Park"},         desc:{ko:"만족도 80% 이상 달성",        en:"Satisfaction 80%+"},               check:s=>s.sat>=80},
  {id:"ach_happy",   emoji:"😊", col:"#FF9F43", name:{ko:"최고 만족도",   en:"Max Happiness"},      desc:{ko:"만족도 90% 이상",             en:"Satisfaction 90%+"},               check:s=>s.sat>=90},
  {id:"ach_day30",   emoji:"📆", col:"#9B7FFF", name:{ko:"한 달 운영",    en:"One Month"},          desc:{ko:"30일 이상 공원 운영",         en:"30 days of operation"},            check:s=>s.day>=30},
  {id:"ach_day50",   emoji:"📅", col:"#9B7FFF", name:{ko:"50일 운영",     en:"50-Day Veteran"},     desc:{ko:"50일 이상 공원 운영",         en:"50 days of operation"},            check:s=>s.day>=50},
  {id:"ach_day100",  emoji:"🌈", col:"#A29BFE", name:{ko:"100일 공원",    en:"Centennial Park"},    desc:{ko:"100일 이상 공원 운영",        en:"100 days of operation"},           check:s=>s.day>=100},
  {id:"ach_gold",    emoji:"🥇", col:"#FFD93D", name:{ko:"황금 메달",     en:"Gold Medalist"},      desc:{ko:"시나리오 골드 메달 획득",     en:"Earned a scenario gold medal"},    check:s=>s.goldMedals>=1},
  {id:"ach_noloans", emoji:"💳", col:"#00E5A0", name:{ko:"무빚 경영",     en:"Debt-Free"},          desc:{ko:"대출 없이 Day 50 달성",       en:"Reach Day 50 without loans"},      check:s=>s.day>=50&&s.totalLoans===0},
  {id:"ach_seasons", emoji:"🌦️", col:"#48DBFB", name:{ko:"사계절 공원",   en:"All Seasons"},        desc:{ko:"4계절 모두 경험",             en:"Experienced all 4 seasons"},       check:s=>s.day>=120},
];
