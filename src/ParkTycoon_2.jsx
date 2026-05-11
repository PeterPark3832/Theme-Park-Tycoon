import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import {
  GC, GR, TICK, SL, SAVE_KEY,
  SEASONS, HOLIDAY_EVENTS, INVESTOR_OFFERS, MAP_TYPES, LEAGUES,
  BREAK_CHANCE, ZONES, PARCELS, SEGS, SEG_PULL,
  CAMPAIGNS_DATA, VIP_EVENTS, RB_BRANCHES, RESEARCH, MISSIONS, DISASTERS,
  WEATHERS, WEATHER_WEIGHTS, DEFAULT_RIDE_PRICES, DEFAULT_SHOP_MULTS, MAX_FEE_BY_STARS,
  LANG_FLAGS, TR, SCENARIOS, DIFFICULTY_SETTINGS, STAGES, B,
  STAFF, STAFF_UPGRADES, RIVAL_PARKS, FRANCHISES, ZONE_MASTERY, LOAN_OPTS, DOTS, TUTORIAL_STEPS, DAILY_CHALLENGES, SCENARIO_CLEAR_REWARDS, SCENARIO_DIFFICULTY,
} from './gameData.js';
import { getBuildingIcon, hasBuildingIcon } from './buildingIcons.jsx';
import {
  tFn, pickWeather, getReachablePaths, hasPath, hasBuildingPath, getZM, calcStats, calcSegs,
  segSatMod, checkVIPReq, bldCounts, calcParkRating, calcRideTicketRev, avgShopMult,
  calcStage, stageVisBonus, stageRevBonus, calcLeague, getRB,
  loadSaveSlots, writeSaveSlots, mkGrid, mkOwned, timeAgoL, playSound,
} from './gameLogic.js';

export default function ParkTycoon(){
  const [screen,setScreen]=useState("menu");
  const [gameMode,setGameMode]=useState(null);
  const [currentScenario,setCurrentScenario]=useState(null);
  const [pendingScenarioId,setPendingScenarioId]=useState(null); // 난이도 선택 대기 중인 시나리오
  const [scenarioTimeLimit,setScenarioTimeLimit]=useState(0); // 난이도 적용 후 실제 제한 시간
  const [difficulty,setDifficulty]=useState("normal");
  const [tutorialStep,setTutorialStep]=useState(0);
  const [saveSlots,setSaveSlots]=useState(loadSaveSlots);
  const [scenarioResult,setScenarioResult]=useState(null);
  const [menuSubScreen,setMenuSubScreen]=useState(null);
  const [lastSavedSlot,setLastSavedSlot]=useState(null);

  const [grid,setGrid]=useState(mkGrid);
  const [zoneGrid,setZoneGrid]=useState(()=>Array(GR).fill(null).map(()=>Array(GC).fill(null)));
  const [ownedGrid,setOwnedGrid]=useState(mkOwned);
  const [parcels,setParcels]=useState([]);
  const [money,setMoney]=useState(50000);
  const [day,setDay]=useState(1);
  const [visitors,setVisitors]=useState(0);
  const [sat,setSat]=useState(50);
  const [clean,setClean]=useState(100);
  const [fee,setFee]=useState(10);
  const [hired,setHired]=useState({janitor:0,mechanic:0,security:0,entertainer:0});
  const [selected,setSelected]=useState(null);
  const [clickedTile,setClickedTile]=useState(null);
  const [speed,setSpeed]=useState(0);
  const [logs,setLogs]=useState(()=>{const l=localStorage.getItem("pt_lang")||"ko";return[TR[l]?.["welcome"]||"환영합니다!"];});
  const [totalRev,setTotalRev]=useState(0);
  const [totalVis,setTotalVis]=useState(0);
  const [tab,setTab]=useState("build");
  const [loans,setLoans]=useState([]);
  const [hovered,setHovered]=useState(null);
  const [segData,setSegData]=useState({family:0.2,couple:0.2,thrill:0.2,child:0.1,general:0.3});
  const [zonePaint,setZonePaint]=useState(null);
  const [buildMode,setBuildMode]=useState("build");
  const [dots,setDots]=useState(()=>Array(12).fill(null).map((_,i)=>({id:i,r:Math.floor(Math.random()*GR),c:Math.floor(Math.random()*GC),emoji:DOTS[i%DOTS.length]})));
  const [campaigns,setCampaigns]=useState([]);
  const [pendingVIP,setPendingVIP]=useState(null);
  const [passOn,setPassOn]=useState(false);
  const [passPrice,setPassPrice]=useState(150);
  const [passHolders,setPassHolders]=useState(0);
  const [prestigeBonus,setPrestigeBonus]=useState(0);
  const [vipCount,setVipCount]=useState(0);
  const [researched,setResearched]=useState([]);
  const [researchPoints,setResearchPoints]=useState(0);
  const [activeMissions,setActiveMissions]=useState(["m1","m4","m7"]);
  const [completedMissions,setCompletedMissions]=useState([]);
  const [activeDisaster,setActiveDisaster]=useState(null);
  const [weather,setWeather]=useState(WEATHERS[0]);
  const [weatherTimer,setWeatherTimer]=useState(3);
  const [congestedCells,setCongestedCells]=useState(()=>new Set());
  const [ridePrices,setRidePrices]=useState(DEFAULT_RIDE_PRICES);
  const [shopMults,setShopMults]=useState(DEFAULT_SHOP_MULTS);
  const [pricingMode,setPricingMode]=useState("admission");
  const [dailyHistory,setDailyHistory]=useState([]);
  const [revBreak,setRevBreak]=useState({adm:0,ride:0,shop:0,pass:0});
  const [lang,setLang]=useState(()=>localStorage.getItem("pt_lang")||"ko");
  const t=useMemo(()=>tFn(lang),[lang]);
  const changeLang=useCallback(l=>{setLang(l);localStorage.setItem("pt_lang",l);},[]);

  // Phase 2 states
  const [staffLevels,setStaffLevels]=useState({janitor:1,mechanic:1,security:1,entertainer:1});
  const [rivals,setRivals]=useState([]);
  const [pressReviews,setPressReviews]=useState([]);
  const [pendingReview,setPendingReview]=useState(null);
  const [missionFlash,setMissionFlash]=useState(false); // 미션 달성 flash 연출
  const [investFailFlash,setInvestFailFlash]=useState(null); // 투자 실패 {amount}
  const [visitorRatings,setVisitorRatings]=useState([]);
  const [buildingFranchises,setBuildingFranchises]=useState({});

  // Phase 3 states
  const [activeHoliday,setActiveHoliday]=useState(null);
  const [holidayHistory,setHolidayHistory]=useState([]);
  const [pendingInvestor,setPendingInvestor]=useState(null);
  const [activeInvestment,setActiveInvestment]=useState(null);
  const [investmentHistory,setInvestmentHistory]=useState([]);
  const [mapType,setMapType]=useState("default");
  const [earnedMedals,setEarnedMedals]=useState([]);

  // UI-only states (not saved)
  const [isMobile,setIsMobile]=useState(()=>window.innerWidth<600);
  const [panelCollapsed,setPanelCollapsed]=useState(false);
  const [logCollapsed,setLogCollapsed]=useState(false);
  const [buildParticles,setBuildParticles]=useState([]); // [{id,r,c,color,particles:[{tx,ty,col}]}]
  const [saveConfirm,setSaveConfirm]=useState(null); // null | {slotIdx}
  const [stageUpFlash,setStageUpFlash]=useState(false);
  const prevStageRef=useRef(1);
  const [bubbles,setBubbles]=useState([]); // [{id,r,c,text,expires}]
  const [disasterWarning,setDisasterWarning]=useState(null); // null|{dis,countdown,mitigated}
  const [firstVisitorCelebration,setFirstVisitorCelebration]=useState(false);
  const [ftueGoalDone,setFtueGoalDone]=useState(false); // FTUE 첫 목표 완료 여부
  const firstVisitorRef=useRef(false);
  const [showVisBreakdown,setShowVisBreakdown]=useState(false);
  const [showSatTooltip,setShowSatTooltip]=useState(false);
  const [gridScale,setGridScale]=useState(1);
  const [gridScaleOrigin,setGridScaleOrigin]=useState({x:50,y:50});
  const pinchRef=useRef({active:false, startDist:0, startScale:1});

  // Saved states for daily challenge
  const [activeDailyChallenge,setActiveDailyChallenge]=useState(null); // null|{...dc, startDay, claimed}
  const [dailyChallengeHistory,setDailyChallengeHistory]=useState([]);
  const [bankruptcyDays,setBankruptcyDays]=useState(0); // 연속 적자 일수
  const [demolishConfirm,setDemolishConfirm]=useState(null); // null | {r,c,cell,refund}
  const [multiSelectedCells,setMultiSelectedCells]=useState(()=>new Set());
  const [overwriteConfirm,setOverwriteConfirm]=useState(null); // null | {r,c,existing,newType,refund}
  const [soundOn,setSoundOn]=useState(true);

  const ref=useRef();
  const diffSettings=DIFFICULTY_SETTINGS[difficulty]||DIFFICULTY_SETTINGS.normal;
  ref.current={grid,zoneGrid,ownedGrid,money,sat,clean,fee,hired,day,speed,loans,visitors,segData,campaigns,pendingVIP,passOn,passPrice,passHolders,prestigeBonus,totalVis:totalVis,researched,researchPoints,activeMissions,completedMissions,activeDisaster,ridePrices,shopMults,pricingMode,gameMode,currentScenario,difficulty,scenarioResult,weather,weatherTimer,staffLevels,rivals,pressReviews,visitorRatings,buildingFranchises,activeHoliday,holidayHistory,pendingInvestor,activeInvestment,investmentHistory,mapType,earnedMedals,disasterWarning,activeDailyChallenge,dailyChallengeHistory,bankruptcyDays,soundOn,ftueGoalDone,scenarioTimeLimit};

  const season=SEASONS[Math.floor(((day-1)%120)/SL)];
  const rb=getRB(researched);
  const addLog=msg=>setLogs(p=>[msg,...p.slice(0,9)]);

  const getFullState=useCallback(()=>({
    grid,zoneGrid,ownedGrid,parcels,money,day,visitors,sat,clean,fee,hired,totalRev,totalVis,loans,campaigns,passOn,passPrice,passHolders,prestigeBonus,vipCount,researched,researchPoints,activeMissions,completedMissions,ridePrices,shopMults,pricingMode,dailyHistory,gameMode,currentScenario,difficulty,scenarioTimeLimit,
    staffLevels,rivals,pressReviews,visitorRatings,buildingFranchises,
    activeHoliday,holidayHistory,pendingInvestor,activeInvestment,investmentHistory,mapType,earnedMedals,
    activeDailyChallenge,dailyChallengeHistory,
    meta:{day,money,stars:calcParkRating(grid,zoneGrid,calcStats(grid,zoneGrid,hired,rb),sat,clean).stars,mode:gameMode,scenario:currentScenario,savedAt:Date.now()},
  }),[grid,zoneGrid,ownedGrid,parcels,money,day,visitors,sat,clean,fee,hired,totalRev,totalVis,loans,campaigns,passOn,passPrice,passHolders,prestigeBonus,vipCount,researched,researchPoints,activeMissions,completedMissions,ridePrices,shopMults,pricingMode,dailyHistory,gameMode,currentScenario,difficulty,scenarioTimeLimit,rb,staffLevels,rivals,pressReviews,visitorRatings,buildingFranchises,activeHoliday,holidayHistory,pendingInvestor,activeInvestment,investmentHistory,mapType,earnedMedals,activeDailyChallenge,dailyChallengeHistory]);

  const saveToSlot=useCallback((slotIdx)=>{
    const state=getFullState();
    const newSlots=[...loadSaveSlots()];
    newSlots[slotIdx]=state;
    writeSaveSlots(newSlots);
    setSaveSlots(newSlots);
    setLastSavedSlot(slotIdx);
    addLog(t("log.saved", { slot: slotIdx + 1 }));
    setTimeout(()=>setLastSavedSlot(null),2000);
  },[getFullState, t]);

  const exportSaveURL = useCallback(() => {
    try {
      const state = getFullState();
      const json = JSON.stringify(state);
      const encoded = btoa(encodeURIComponent(json));
      const url = `${window.location.origin}${window.location.pathname}?save=${encoded}`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
          addLog(lang==="ko"?"📋 저장 URL이 클립보드에 복사됐습니다!":"📋 Save URL copied to clipboard!");
        });
      } else {
        window.prompt(lang==="ko"?"저장 URL (복사하세요):":"Save URL (copy this):", url);
      }
    } catch(e) {
      addLog(lang==="ko"?"❌ 내보내기 실패":"❌ Export failed");
    }
  }, [getFullState, addLog, lang]);

  const loadFromSlot=useCallback((slotData)=>{
    if(!slotData) return;
    setGrid(slotData.grid||mkGrid());
    setZoneGrid(slotData.zoneGrid||Array(GR).fill(null).map(()=>Array(GC).fill(null)));
    setOwnedGrid(slotData.ownedGrid||mkOwned());
    setParcels(slotData.parcels||[]);
    setMoney(slotData.money||50000);
    setDay(slotData.day||1);
    setVisitors(slotData.visitors||0);
    setSat(slotData.sat||50);
    setClean(slotData.clean||100);
    setFee(slotData.fee||10);
    setHired(slotData.hired||{janitor:0,mechanic:0,security:0,entertainer:0});
    setTotalRev(slotData.totalRev||0);
    setTotalVis(slotData.totalVis||0);
    setLoans(slotData.loans||[]);
    setCampaigns(slotData.campaigns||[]);
    setPassOn(slotData.passOn||false);
    setPassPrice(slotData.passPrice||150);
    setPassHolders(slotData.passHolders||0);
    setPrestigeBonus(slotData.prestigeBonus||0);
    setVipCount(slotData.vipCount||0);
    setResearched(slotData.researched||[]);
    setResearchPoints(slotData.researchPoints||0);
    setActiveMissions(slotData.activeMissions||["m1","m4","m7"]);
    setCompletedMissions(slotData.completedMissions||[]);
    setRidePrices(slotData.ridePrices||DEFAULT_RIDE_PRICES);
    setShopMults(slotData.shopMults||DEFAULT_SHOP_MULTS);
    setPricingMode(slotData.pricingMode||"admission");
    setDailyHistory(slotData.dailyHistory||[]);
    setGameMode(slotData.gameMode||"challenge");
    setCurrentScenario(slotData.currentScenario||null);
    setDifficulty(slotData.difficulty||"normal");
    setScenarioTimeLimit(slotData.scenarioTimeLimit||0);
    setStaffLevels(slotData.staffLevels||{janitor:1,mechanic:1,security:1,entertainer:1});
    setRivals(slotData.rivals||[]);
    setPressReviews(slotData.pressReviews||[]);
    setVisitorRatings(slotData.visitorRatings||[]);
    setBuildingFranchises(slotData.buildingFranchises||{});
    setPendingReview(null);
    setActiveHoliday(slotData.activeHoliday||null);
    setHolidayHistory(slotData.holidayHistory||[]);
    setPendingInvestor(slotData.pendingInvestor||null);
    setActiveInvestment(slotData.activeInvestment||null);
    setInvestmentHistory(slotData.investmentHistory||[]);
    setMapType(slotData.mapType||"default");
    setEarnedMedals(slotData.earnedMedals||[]);
    setActiveDailyChallenge(slotData.activeDailyChallenge||null);
    setDailyChallengeHistory(slotData.dailyChallengeHistory||[]);
    setScenarioResult(null);
    setSpeed(0);
    setScreen("game");
  },[]);

  const startGame=useCallback((mode,scenarioId,diff)=>{
    const diffConf=DIFFICULTY_SETTINGS[diff||"normal"];
    if(mode!=="campaign") setScenarioTimeLimit(0);
    let startMoney=diffConf.startMoney;
    let startRes=[];
    let startGrid=mkGrid();
    let startOwned=mkOwned();
    let startFee=10;

    if(mode==="sandbox"){
      startMoney=999999;startRes=RESEARCH.map(r=>r.id);startFee=15;
      startOwned=Array(GR).fill(null).map(()=>Array(GC).fill(true));
    } else if(mode==="campaign"&&scenarioId){
      const sc=SCENARIOS.find(s=>s.id===scenarioId);
      const sdiff=SCENARIO_DIFFICULTY[diff]||SCENARIO_DIFFICULTY.medium;
      startMoney=Math.floor(sc.startMoney*sdiff.moneyMult);
      const effTimeLimit=sc.timeLimit?Math.floor(sc.timeLimit*sdiff.timeMult):0;
      setScenarioTimeLimit(effTimeLimit);
      sc.preBuilt.forEach(b=>{
        const bd=B[b.type]; const bw=bd?.size?.w||1; const bh=bd?.size?.h||1;
        startGrid[b.r][b.c]={type:b.type,level:b.level,broken:b.broken};
        for(let dr=0;dr<bh;dr++) for(let dc=0;dc<bw;dc++){
          if(dr===0&&dc===0) continue;
          if(b.r+dr<GR&&b.c+dc<GC) startGrid[b.r+dr][b.c+dc]={type:b.type,ref:[b.r,b.c]};
        }
      });
      if(sc.gridRestrict) startOwned=mkOwned(sc.gridRestrict);
    }

    setGrid(startGrid);setZoneGrid(Array(GR).fill(null).map(()=>Array(GC).fill(null)));
    setOwnedGrid(startOwned);setParcels([]);setMoney(startMoney);setDay(1);
    setVisitors(0);setSat(50);setClean(100);setFee(startFee);
    setHired({janitor:0,mechanic:0,security:0,entertainer:0});
    setTotalRev(0);setTotalVis(0);setLoans([]);setCampaigns([]);
    setPassOn(false);setPassPrice(150);setPassHolders(0);setPrestigeBonus(0);setVipCount(0);
    setResearched(startRes);setResearchPoints(0);
    setActiveMissions(["m1","m4","m7"]);setCompletedMissions([]);
    setRidePrices(DEFAULT_RIDE_PRICES);setShopMults(DEFAULT_SHOP_MULTS);
    setPricingMode("admission");setDailyHistory([]);setRevBreak({adm:0,ride:0,shop:0,pass:0});
    setActiveDisaster(null);setGameMode(mode);setCurrentScenario(scenarioId||null);
    setDifficulty(diff||"normal");setScenarioResult(null);setSpeed(0);
    setStaffLevels({janitor:1,mechanic:1,security:1,entertainer:1});
    setRivals([]);setPressReviews([]);setVisitorRatings([]);setBuildingFranchises({});setPendingReview(null);
    setActiveHoliday(null);setHolidayHistory([]);setPendingInvestor(null);setActiveInvestment(null);setInvestmentHistory([]);
    setActiveDailyChallenge(null);setDailyChallengeHistory([]);setDisasterWarning(null);setBubbles([]);
    setFirstVisitorCelebration(false);firstVisitorRef.current=false;
    const newMapType=mode==="sandbox"?"default":mode==="campaign"?({s2:"beach",s3:"default",s5:"forest"}[scenarioId]||"default"):MAP_TYPES[Math.floor(Math.random()*MAP_TYPES.length)].id;
    setMapType(newMapType);
    setSelected(null);setClickedTile(null);setBuildMode("build");setZonePaint(null);setSaveConfirm(null);setStageUpFlash(false);prevStageRef.current=1;
    setTab("build");

    const isFirstTime=!localStorage.getItem("pt_tutorial_done");
    if((mode==="campaign"&&scenarioId==="s1")||isFirstTime){
      setTutorialStep(1);
      localStorage.setItem("pt_tutorial_done","1");
    } else {setTutorialStep(0);}

    const startLog = mode === "sandbox" 
      ? t("log.startSandbox")
      : mode === "campaign" 
      ? t("log.startCampaign", { name: t(`scn.${scenarioId}`), desc: t(`scn.${scenarioId}.desc`) }) 
      : t("log.startChallenge", { name: t(`diff.${diff}`), money: startMoney.toLocaleString() });
    
    setLogs([startLog]);
    setScreen("game");
  },[t]);

  useEffect(()=>{
    if(tutorialStep===0||screen!=="game") return;
    const hasEntrance=grid.some(r=>r.some(c=>c?.type==="entrance"));
    const hasPathTile=grid.some(r=>r.some(c=>c?.type==="_path"||c?.type==="_pathFancy"));
    const hasRide=grid.some(r=>r.some(c=>c&&B[c.type]?.cat==="ride"&&c.type!=="entrance"));
    if(tutorialStep===1&&hasEntrance) setTutorialStep(2);
    else if(tutorialStep===2&&hasPathTile) setTutorialStep(3);
    else if(tutorialStep===3&&hasRide) setTutorialStep(4);
    else if(tutorialStep===4&&speed>0) setTutorialStep(5);
    else if(tutorialStep===5){const timer=setTimeout(()=>setTutorialStep(0),4000);return()=>clearTimeout(timer);}
  },[grid,speed,tutorialStep,screen]);

  useEffect(()=>{
    const handleResize=()=>{
      const mobile=window.innerWidth<600;
      setIsMobile(mobile);
      if(mobile) setPanelCollapsed(true);
    };
    window.addEventListener('resize',handleResize);
    handleResize(); // call once on mount
    return()=>window.removeEventListener('resize',handleResize);
  },[]);

  useEffect(()=>{
    if(speed===0||screen!=="game") return;
    const ms=speed===3?TICK/5:speed===2?TICK/2.5:TICK;
    const id=setInterval(()=>{
      const{grid:g,zoneGrid:zg,sat:s0,clean:cl0,fee,hired,day,loans,campaigns:camps,passOn:pe,passPrice:pp,passHolders:ph,prestigeBonus:pb,researched:res,activeMissions:ams,completedMissions:cms,activeDisaster:ad,ridePrices:rp,shopMults:sm,pricingMode:pm,gameMode:gm,currentScenario:cs,difficulty:diff,scenarioResult:sr,weather:wth,weatherTimer:wthTimer,staffLevels:sLvls,rivals:rivalsCur,pressReviews:prevReviews,visitorRatings:vRatings,buildingFranchises:bFranch,activeHoliday:ah,holidayHistory:hhist,pendingInvestor:pinv,activeInvestment:ainv,investmentHistory:invHist,mapType:mtype,earnedMedals:emed}=ref.current;
      const ssn=SEASONS[Math.floor(((day-1)%120)/SL)];
      const seasonIdx=Math.floor(((day-1)%120)/SL);
      const rb=getRB(res);
      const diffConf=DIFFICULTY_SETTINGS[diff]||DIFFICULTY_SETTINGS.normal;

      // Phase 2-1: mechanic level bonuses
      const mechUpg=STAFF_UPGRADES.mechanic[Math.min(sLvls.mechanic-1,2)];
      const mechRepairMult=mechUpg.repairMult||0.3;
      const mechBreakMult=mechUpg.breakMult||0.3;
      const newGrid=g.map(row=>row.map(cell=>{
        if(!cell||cell.ref) return cell;
        const bc=BREAK_CHANCE[cell.type];if(!bc) return cell;
        if(cell.broken) return(hired.mechanic>0&&Math.random()<(hired.mechanic*mechRepairMult+rb.autoRepairBonus))?{...cell,broken:false}:cell;
        return Math.random()<Math.max(0.001,bc*rb.breakMult*(1-hired.mechanic*mechBreakMult))?{...cell,broken:true}:cell;
      }));

      const s=calcStats(newGrid,zg,hired,rb);

      // 일일 챌린지 생성 — 입구 유무와 무관하게 실행
      {
        const _adc=ref.current.activeDailyChallenge;
        const _hist=ref.current.dailyChallengeHistory||[];
        if((day+1)%5===0&&!_adc){
          const _pool=DAILY_CHALLENGES.filter(dc=>!_hist.includes(dc.id));
          const _src=_pool.length>0?_pool:DAILY_CHALLENGES;
          const _dc=_src[Math.floor(Math.random()*_src.length)];
          setActiveDailyChallenge({..._dc,startDay:day+1,claimed:false});
          addLog(`🎯 ${lang==="ko"?`새 챌린지: ${_dc.name.ko}`:`New challenge: ${_dc.name.en}`}`);
        }
      }

      if(!s.hasEntrance){setGrid(newGrid);setDay(d=>d+1);return;}

      const segs=calcSegs(newGrid);
      const spendMult=(segs.family||0)*1.2+(segs.couple||0)*1.5+(segs.thrill||0)*0.8+(segs.child||0)*0.5+(segs.general||0)*1.0;
      const parkRat=calcParkRating(newGrid,zg,s,s0,cl0);
      const maxFee=gm==="sandbox"?999:MAX_FEE_BY_STARS[parkRat.stars];
      const feePenalty=fee>maxFee?0.5:1.0;

      let visMult=1,revMult=1,satPenExtra=0,disWage=1;
      if(ad&&gm!=="sandbox"){visMult=ad.visMult||1;revMult=ad.revMult!==undefined?ad.revMult:1;satPenExtra=ad.satPen||0;if(ad.id==="strike") disWage=0;}

      const campBoost=camps.reduce((t,c)=>t+c.boost,0);
      const newCamps=camps.map(c=>({...c,remaining:c.remaining-1})).filter(c=>c.remaining>0);

      const cc2=bldCounts(newGrid);
      const totalBldCount=Object.values(cc2).reduce((t,v)=>t+v,0);
      const curStage=calcStage(totalBldCount,parkRat.stars,ref.current.money);
      const stgVisMult=1+stageVisBonus(curStage);
      const stgRevMult=1+stageRevBonus(curStage);

      const feeEff=pm==="per_ride"?1.25:Math.max(0.15,1.3-fee*0.022/(1+(parkRat.stars-1)*0.06));
      // Phase 2-1: entertainer level bonus
      const entUpg=STAFF_UPGRADES.entertainer[Math.min(sLvls.entertainer-1,2)];
      const entVisMult=entUpg.visMult||0;
      // Phase 2-4: visitor ratings boost
      const avgRating=vRatings.length>0?vRatings.reduce((s,r)=>s+r,0)/vRatings.length:3;
      const ratingVisMult=avgRating>=4.0?1.10:avgRating<2.5?0.90:1.0;
      // Phase 2-2: rival parks
      const newRivals=[...rivalsCur];
      RIVAL_PARKS.forEach(rp=>{
        if(day+1>=rp.startDay&&!newRivals.find(r=>r.id===rp.id)){
          newRivals.push({...rp,prestige:rp.initPres});
          addLog(`${rp.emoji} ${lang==="ko"?"경쟁 공원":"Rival park"} '${rp.name[lang]||rp.name.ko}' ${lang==="ko"?"등장!":"appeared!"}`);
        }
      });
      newRivals.forEach((r,i)=>{newRivals[i]={...r,prestige:r.prestige+r.growRate};});
      const totalRivalPres=newRivals.reduce((s,r)=>s+r.prestige,0);
      const rivalSteal=gm!=="sandbox"?Math.min(0.35,totalRivalPres/(parkRat.final*2+totalRivalPres+1)*0.4):0;
      const curMap=MAP_TYPES.find(m=>m.id===mtype)||MAP_TYPES[0];
      const mapVisMult=curMap.visMultSeason[seasonIdx]||1;
      const holidayVisMult=ah?(1+(ah.visMult-1)*rb.holidayEventMult):1;
      const rawVis=Math.max(0,Math.floor(s.attraction*2.5*(1+hired.entertainer*(0.05+entVisMult))*(0.4+(s0/100)*0.9)*ssn.mult*feeEff*(1+campBoost)*(1+(parkRat.stars-1)*0.10)*(1+rb.globalVisBonus)*(1+rb.coupleBonus*(segs.couple||0))*feePenalty*stgVisMult*wth.visMult*ratingVisMult*(1-rivalSteal)*mapVisMult*holidayVisMult));
      const congested=s.capacity>0&&rawVis>s.capacity;
      let vis=Math.floor(Math.max(0,(congested?s.capacity*1.05:rawVis)*visMult));
      if(s.hasEntrance&&s.attraction>0&&vis<3) vis=3;

      const admRev=pm!=="per_ride"?vis*fee*rb.admissionMult:0;
      const rideRev=calcRideTicketRev(cc2,vis,s.attraction,rp,pm);
      const shopMul=avgShopMult(cc2,sm);
      // Phase 2-5: franchise rpv multiplier
      let franchiseRpvBonus=0,franchiseSatMod=0;
      Object.entries(bFranch).forEach(([key,fid])=>{
        const [fr,fc]=key.split(",").map(Number);
        const cell=newGrid[fr]?.[fc];
        if(!cell) return;
        const flist=FRANCHISES[cell.type];
        if(!flist) return;
        const fdata=flist.find(f=>f.id===fid);
        if(!fdata) return;
        const baseRpv=B[cell.type]?.stats(cell.level).rpv||0;
        franchiseRpvBonus+=baseRpv*(fdata.rpvMult-1);
        franchiseSatMod+=fdata.satMod;
      });
      const shopRev=vis*(s.rpv+franchiseRpvBonus)*spendMult*shopMul;
      const passInc=pe?Math.floor(ph*pp/365*rb.passIncomeMult):0;
      const totalRevDay=Math.floor((admRev+rideRev+shopRev)*revMult*stgRevMult)+passInc;

      const wages=Object.entries(hired).reduce((t,[k,v])=>t+STAFF[k].daily*v,0)*disWage;
      let loanPay=0;
      const newLoans=loans.map(l=>{const p=Math.min(l.remaining,l.dailyPayment);loanPay+=p;return{...l,remaining:l.remaining-p};}).filter(l=>l.remaining>0);
      const maint=s.maintenance*diffConf.maintenanceMult*wth.maintMod;
      const net=totalRevDay-Math.round(maint)-wages-loanPay;

      // Phase 2-1: janitor/security level bonuses
      const janUpg=STAFF_UPGRADES.janitor[Math.min(sLvls.janitor-1,2)];
      const secUpg=STAFF_UPGRADES.security[Math.min(sLvls.security-1,2)];
      const janCleanBonus=janUpg.clean||18;
      const janSatBonus=janUpg.sat||3;
      const secSatBonus=secUpg.sat||2;
      const disasterPen=secUpg.disasterPen||1.0;
      const newClean=Math.min(100,Math.max(0,cl0-vis*0.035+hired.janitor*janCleanBonus+rb.cleanBonus-(ad?.id==="pest"?20:0)));
      const cleanMod=newClean<25?-10:newClean<50?-4:newClean>80?2:0;
      const holidaySatMod=ah?ah.satMod:0;
      // 기본 만족도 하락: -1 → -0.3/일 (너무 급격한 초반 하락 완화)
      // 방문객 없을 때 패널티 제거 (운영 안 하면 만족도 변화 없음)
      const baseSatDelta = vis > 0 ? -0.18 : 0;
      const newSat=Math.min(100,Math.max(5,s0+hired.janitor*janSatBonus+hired.security*secSatBonus+s.satBonus+baseSatDelta+cleanMod+(congested&&vis>0?-5:0)+Math.min(0,-s.brokenCount*2)+segSatMod(newGrid,segs)+Math.min(0,-s.isolatedCount)+(fee>maxFee?-6:0)-satPenExtra+wth.satMod+franchiseSatMod*0.5+holidaySatMod));

      let newDisaster=ad?{...ad,remaining:ad.remaining-1}:null;
      if(newDisaster?.remaining<=0){addLog(t("log.disasterEnd", {name: t(`dis.${newDisaster.id}`)}));newDisaster=null;}
      const dWarn=ref.current.disasterWarning;
      // 경고 카운트다운 처리
      if(dWarn&&!newDisaster){
        if(dWarn.countdown<=1){
          // 경고 기간 종료 → 재난 발생
          newDisaster={...dWarn.dis,remaining:dWarn.dis.dur,damage:dWarn.mitigated?0.5:1};
          setDisasterWarning(null);
          addLog(`🚨 ${lang==="ko"?"경고 무시! 재난 발생:":"Warning ignored! Disaster:"} ${t("dis."+dWarn.dis.id)}`);
          if(ref.current.soundOn) playSound("disaster");
        } else {
          setDisasterWarning(w=>w?{...w,countdown:w.countdown-1}:null);
        }
      }
      // 신규 재난/경고 생성
      if(!newDisaster&&!dWarn&&gm!=="sandbox"&&Math.random()<0.015*diffConf.disasterMult*disasterPen+(newSat<40?0.01:0)){
        const d=DISASTERS[Math.floor(Math.random()*DISASTERS.length)];
        if(Math.random()<0.6){
          // 60%는 경고 먼저
          setDisasterWarning({dis:d,countdown:3,mitigated:false});
          addLog(`⚡ ${lang==="ko"?`주의: ${t("dis."+d.id)} 위험 감지! 3일 내 발생 예정`:`Warning: ${t("dis."+d.id)} risk detected! 3 days remaining`}`);
          if(ref.current.soundOn) playSound("weather");
        } else {
          // 40%는 즉시 발생
          if(d.id==="fire"){
            setGrid(prev=>{
              const n=prev.map(r=>[...r]);
              const targets=[];
              for(let r=0;r<GR;r++) for(let c=0;c<GC;c++){
                const cell=n[r][c];
                if(cell&&!cell.ref&&BREAK_CHANCE[cell.type]&&!cell.broken) targets.push({r,c});
              }
              targets.sort(()=>Math.random()-0.5).slice(0,2).forEach(({r,c})=>{n[r][c]={...n[r][c],broken:true};});
              return n;
            });
          }
          newDisaster={...d,remaining:d.dur,damage:1};
          addLog(t("log.disasterStart", {name: t(`dis.${d.id}`), desc: t(`dis.${d.id}.desc`), dur: d.dur}));
          if(ref.current.soundOn) playSound("disaster");
        }
      }

      // Phase 2-3: press review (every 15 days)
      let newPressReviews=[...prevReviews];
      let newPendingReview=null;
      if((day+1)%15===0&&day>0){
        const score=Math.round(parkRat.final*0.5+newSat*0.3+newClean*0.2);
        let grade,emoji,headline,prestigeMod,visBoost;
        if(score>=75){grade="S";emoji="🏆";headline=lang==="ko"?"혁신적인 공원! 업계 최고수준":"Innovative park! Industry-leading quality";prestigeMod=8;visBoost=0.20;}
        else if(score>=60){grade="A";emoji="⭐";headline=lang==="ko"?"훌륭한 경험! 강력 추천":"Excellent experience! Highly recommended";prestigeMod=5;visBoost=0.10;}
        else if(score>=45){grade="B";emoji="😊";headline=lang==="ko"?"만족스러운 공원, 개선 여지 있음":"Satisfying park, room for improvement";prestigeMod=2;visBoost=0;}
        else if(score>=30){grade="C";emoji="😐";headline=lang==="ko"?"평범한 공원, 더 노력 필요":"Average park, needs more work";prestigeMod=0;visBoost=-0.05;}
        else{grade="D";emoji="👎";headline=lang==="ko"?"실망스러운 경험, 대폭 개선 필요":"Disappointing experience, major improvements needed";prestigeMod=-3;visBoost=-0.15;}
        newPressReviews=[...newPressReviews.slice(-19),{day:day+1,grade,score,headline,emoji}];
        newPendingReview={grade,emoji,headline,score,visBoost};
        addLog(`📰 ${lang==="ko"?"언론 평가":"Press Review"}: ${grade}${lang==="ko"?"등급":"grade"} — ${headline}`);
        if(prestigeMod!==0) setPrestigeBonus(pb=>pb+prestigeMod);
        if(ref.current.soundOn) playSound(grade==="S"||grade==="A"?"mission":"disaster");
      }

      // Phase 2-4: visitor ratings
      const ratingCount=Math.floor(vis*0.05);
      const newRating=Math.max(1,Math.min(5,Math.round(newSat/20+(Math.random()-0.5))));
      const addCount=Math.min(5,ratingCount);
      const newVisRatings=[...vRatings.slice(-29),...Array(addCount).fill(newRating)];

      const passBuyers=pe?Math.floor(vis*(s0/100)*0.025*parkRat.stars*0.3*rb.passRateMult):0;
      const newPH=Math.max(0,Math.floor(ph*0.998+passBuyers));

      const rideCount=Object.entries(cc2).filter(([k])=>B[k]?.cat==="ride"&&k!=="entrance").reduce((t,[,v])=>t+v,0);
      const pathCount=Object.entries(cc2).filter(([k])=>B[k]?.cat==="path").reduce((t,[,v])=>t+v,0);
      const zoneTiles=zg.reduce((t,row)=>t+row.filter(Boolean).length,0);
      const ms={vis,sat:newSat,clean:newClean,pres:parkRat.stars,pass:newPH,rides:rideCount,vips:ref.current.vipCount,zones:zoneTiles,net,research:res.length,debt:newLoans.reduce((t,l)=>t+l.remaining,0),paths:pathCount};
      const completing=[];const stillActive=[];
      for(const mId of ams){const m=MISSIONS.find(x=>x.id===mId);if(m&&m.check(ms)){completing.push(mId);}else{stillActive.push(mId);}}
      let mM=0,mR=0;completing.forEach(mId=>{const m=MISSIONS.find(x=>x.id===mId);if(!m) return;mM+=m.reward.$;mR+=m.reward.rp;addLog(t("log.missionClear", {name: t(`mis.${m.id}`), reward: m.reward.$.toLocaleString()}));if(ref.current.soundOn) playSound("mission");});
      if(completing.length>0){setMissionFlash(true);setTimeout(()=>setMissionFlash(false),800);}
      const newCompleted=[...cms,...completing];
      const pool=MISSIONS.filter(m=>!newCompleted.includes(m.id)&&!stillActive.includes(m.id));
      const newActive=[...stillActive];while(newActive.length<3&&pool.length>0){const idx=Math.floor(Math.random()*pool.length);newActive.push(pool.splice(idx,1)[0].id);}

      if(gm==="campaign"&&cs&&!sr){
        const scenario=SCENARIOS.find(s2=>s2.id===cs);
        if(scenario){
          const checkS={vis,sat:newSat,stars:parkRat.stars,net,brokenCount:s.brokenCount,fee,coupleRatio:segs.couple||0,childRatio:segs.child||0,pres:parkRat.stars};
          const alreadyEarnedIds=emed.filter(m=>m.scenarioId===cs).map(m=>m.medalId);
          const earnedMedalsNow=[...scenario.goals].filter(g=>g.check(checkS)&&!alreadyEarnedIds.includes(g.id));
          if(earnedMedalsNow.length>0){
            const best=earnedMedalsNow[earnedMedalsNow.length-1];
            setScenarioResult({medal:best.medal,medalId:best.id,scenario:cs,day:day+1});
            setSpeed(0);
            addLog(t("log.medalAchieved", {medal: best.medal, desc: best.desc}));
            setEarnedMedals(prev=>{
              const exists=prev.find(m=>m.scenarioId===cs&&m.medalId===best.id);
              if(exists) return prev;
              return [...prev,{scenarioId:cs,medalId:best.id,day:day+1}];
            });
            // C3: 클리어 보상 RP 지급
            const reward=SCENARIO_CLEAR_REWARDS[best.id];
            const rewardKey=`scenario_${cs}_${best.id}`;
            if(reward&&!cms.includes(rewardKey)){
              setResearchPoints(rp=>rp+reward.rp);
              addLog(`🏆 ${reward.bonus[lang]||reward.bonus.ko}`);
              setCompletedMissions(prev=>[...prev,rewardKey]);
            }
          } else if(ref.current.scenarioTimeLimit>0&&day+1>=ref.current.scenarioTimeLimit){
            setScenarioResult({medal:null,scenario:cs,day:day+1});
            setSpeed(0);
            addLog(t("log.timeout"));
          }
        }
      }

      // Daily Challenge logic
      const adc=ref.current.activeDailyChallenge;
      const adcHist=ref.current.dailyChallengeHistory;
      // 5일마다 새 챌린지 생성
      if((day+1)%5===0&&!adc){
        const available=DAILY_CHALLENGES.filter(dc=>!adcHist.includes(dc.id));
        const dcPool=available.length>0?available:DAILY_CHALLENGES;
        const dc=dcPool[Math.floor(Math.random()*dcPool.length)];
        setActiveDailyChallenge({...dc,startDay:day+1,claimed:false});
        addLog(`🎯 ${lang==="ko"?`새 챌린지: ${dc.name.ko}`:`New challenge: ${dc.name.en}`}`);
      }
      // 챌린지 달성 체크
      if(adc&&!adc.claimed){
        const dcMs={vis,sat:newSat,net,clean:newClean,pres:parkRat.stars};
        if(dcMs[adc.goal.type]>=adc.goal.value){
          setMoney(m=>m+adc.reward.$);
          setResearchPoints(rp=>rp+adc.reward.rp);
          setActiveDailyChallenge(prev=>prev?{...prev,claimed:true}:null);
          setDailyChallengeHistory(h=>[...h,adc.id]);
          addLog(`✅ ${lang==="ko"?`챌린지 완료: ${adc.name.ko}! +$${adc.reward.$.toLocaleString()} +${adc.reward.rp}RP`:`Challenge done: ${adc.name.en}! +$${adc.reward.$.toLocaleString()} +${adc.reward.rp}RP`}`);
          if(ref.current.soundOn) playSound("mission");
        }
      }

      const sEvt=ssn.events.find(([,p])=>Math.random()<p)?.[0]||null;
      const warn=!newDisaster&&s.brokenCount>2?t("log.warnBroken", {cnt: s.brokenCount}):(congested&&vis>0)?t("log.warnCongest"):newClean<30?t("log.warnTrash"):fee>maxFee?t("log.warnFee", {fee: maxFee}):null;

      // Weather update
      const si=Math.floor(((day-1)%120)/SL);
      let newWth=wth,newWthTimer=wthTimer-1;
      if(newWthTimer<=0){
        newWth=pickWeather(si);
        newWthTimer=newWth.dur[0]+Math.floor(Math.random()*(newWth.dur[1]-newWth.dur[0]+1));
        addLog(`${newWth.emoji} ${newWth.name.ko}`);
        if(ref.current.soundOn) playSound("weather");
      }

      // Phase 3-1: Holiday Event logic
      const dayInSeason=day%SL;
      let newAH=ah?{...ah,remaining:ah.remaining-1}:null;
      let newHHist=[...hhist];
      if(newAH&&newAH.remaining<=0){
        addLog(`${newAH.emoji} ${newAH.name[lang]||newAH.name.ko} ${lang==="ko"?"종료!":"ended!"}`);
        newHHist=[...newHHist,{id:newAH.id,day:day+1}];
        newAH=null;
      }
      if(!newAH){
        const evtForSeason=HOLIDAY_EVENTS.find(e=>e.season===seasonIdx&&e.startDayInSeason===dayInSeason);
        if(evtForSeason){
          newAH={...evtForSeason,remaining:evtForSeason.duration};
          addLog(`${evtForSeason.emoji} ${evtForSeason.name[lang]||evtForSeason.name.ko} ${lang==="ko"?"시작!":"started!"} ${evtForSeason.desc[lang]||evtForSeason.desc.ko} (${evtForSeason.duration}${lang==="ko"?"일간":"d"})`);
          if(ref.current.soundOn) playSound("mission");
        }
      }

      // Phase 3-2: Investor logic
      let newPendingInv=pinv?{...pinv,expiresIn:(pinv.expiresIn||3)-1}:null;
      if(newPendingInv&&newPendingInv.expiresIn<=0){newPendingInv=null;}
      let newActiveInv=ainv;
      let newInvHist=[...invHist];
      if(ainv&&day+1>=ainv.deadline){
        const goal=ainv.goal;
        const vis2=vis,stars2=parkRat.stars,net2=net;
        const achieved=(goal.target==="vis"&&vis2>=goal.value)||(goal.target==="stars"&&stars2>=goal.value)||(goal.target==="net"&&net2>=goal.value);
        if(achieved){
          addLog(`💼 ${lang==="ko"?"투자 목표 달성! 명성 +10":"Investment goal achieved! Prestige +10"}`);
          setPrestigeBonus(pb=>pb+10);
          newInvHist=[...newInvHist,{...ainv,result:"success"}];
        } else {
          const penalty=Math.floor(ainv.amount*INVESTOR_OFFERS.find(o=>o.id===ainv.offerId)?.penalty||0.15);
          addLog(`💼 ${lang==="ko"?`투자 목표 실패! -$${penalty.toLocaleString()}`:`Investment failed! -$${penalty.toLocaleString()}`}`);
          setMoney(m=>m-penalty);
          setInvestFailFlash({amount:penalty});setTimeout(()=>setInvestFailFlash(null),3000);
          if(ref.current.soundOn) playSound("disaster");
          newInvHist=[...newInvHist,{...ainv,result:"fail"}];
        }
        newActiveInv=null;
      }
      if(!newPendingInv&&!ainv){
        const offeredIds=new Set([...invHist.map(i=>i.offerId),...(ainv?[ainv.offerId]:[])]);
        const isSandbox=gm==="sandbox";
        for(const offer of INVESTOR_OFFERS){
          if(offeredIds.has(offer.id)) continue;
          const cond=offer.condition;
          const condMet=isSandbox||(day+1>=cond.minDay&&vis>=cond.minVis&&parkRat.stars>=cond.minStars);
          if(condMet){newPendingInv={offer,expiresIn:3};addLog(`${offer.emoji} ${offer.name[lang]||offer.name.ko} ${lang==="ko"?"등장! 3일 내 수락 필요":"appeared! Accept within 3 days"}`);break;}
        }
      }

      // Congestion tracking
      const newCongestedCells=new Set();
      if(congested){
        for(let r=0;r<GR;r++) for(let c=0;c<GC;c++){
          const cell=newGrid[r][c];
          if(cell&&!cell.ref&&B[cell.type]?.cat==="ride"&&cell.type!=="entrance"&&!cell.broken){
            newCongestedCells.add(`${r},${c}`);
          }
        }
      }

      if(vis>0&&ref.current.visitors===0&&!firstVisitorRef.current){
        firstVisitorRef.current=true;
        setFirstVisitorCelebration(true);
        setTimeout(()=>setFirstVisitorCelebration(false),4000);
        addLog(lang==="ko"?`🎊 첫 번째 방문객 ${vis}명 도착! 공원이 열렸습니다!`:`🎊 First ${vis} visitor(s) arrived! Park is open!`);
        if(ref.current.soundOn) playSound("mission");
        // FTUE 첫 목표: 첫 방문객 도착 = 완료
        if(!ref.current.ftueGoalDone) setFtueGoalDone(true);
      }
      setGrid(newGrid);setSat(newSat);setClean(newClean);setSegData(segs);
      setMoney(m=>m+net+mM);setVisitors(vis);setLoans(newLoans);setCampaigns(newCamps);
      setPassHolders(newPH);setActiveDisaster(newDisaster);
      setTotalRev(r=>r+Math.max(0,totalRevDay));setTotalVis(t=>t+vis);setDay(d=>d+1);
      // RP: 기본 2/일 + 방문객 20명당 +1 (최대 +5) + 미션 보상
      const rpGain=Math.min(7,2+Math.floor(vis/20))+mR;
      setResearchPoints(p=>p+rpGain);setActiveMissions(newActive);setCompletedMissions(newCompleted);
      setDailyHistory(h=>[...h.slice(-59),{day:day+1,revenue:totalRevDay,admRev:Math.floor(admRev*revMult),rideRev:Math.floor(rideRev*revMult),shopRev:Math.floor(shopRev*revMult),passInc,expenses:Math.round(maint)+wages+loanPay,net,visitors:vis,sat:Math.round(newSat)}]);
      setRevBreak({adm:Math.floor(admRev*revMult),ride:Math.floor(rideRev*revMult),shop:Math.floor(shopRev*revMult),pass:passInc});
      setWeather(newWth);setWeatherTimer(newWthTimer);setCongestedCells(newCongestedCells);
      // Phase 2 state updates
      setRivals(newRivals);
      setPressReviews(newPressReviews);
      if(newPendingReview) setPendingReview(newPendingReview);
      setVisitorRatings(newVisRatings);
      // Phase 3 state updates
      setActiveHoliday(newAH);
      setHolidayHistory(newHHist);
      if(newPendingInv&&!pinv) setPendingInvestor(newPendingInv);
      else if(newPendingInv&&pinv) setPendingInvestor(newPendingInv);
      else if(!newPendingInv&&pinv) setPendingInvestor(null);
      setActiveInvestment(newActiveInv);
      setInvestmentHistory(newInvHist);
      // 파산 체크
      const projMoney = ref.current.money + net;
      const isBankrupt = projMoney < -2000 && gm !== "sandbox";
      const curBkDays = ref.current.bankruptcyDays || 0;
      const newBkDays = isBankrupt ? curBkDays + 1 : 0;
      setBankruptcyDays(newBkDays);
      if (newBkDays >= 5) {
        setScenarioResult({medal:null, scenario:cs, day:day+1, bankrupt:true});
        setSpeed(0);
        addLog(lang==="ko" ? "💸 파산! 5일 연속 적자로 공원이 폐쇄됐습니다." : "💸 Bankrupt! Park closed due to sustained losses.");
        return;
      }
      if(!completing.length) addLog(warn||sEvt||t("log.daySummary", {day: day+1, vis, net: (net>=0?"+":"")+"$"+net.toLocaleString()}));
    },ms);
    return()=>clearInterval(id);
  },[speed,screen,t]);

  // === Pre-hook derivations (needed by useEffect dep arrays below) ===
  const stats=calcStats(grid,zoneGrid,hired,rb);
  const cc=bldCounts(grid);
  const parkRating=calcParkRating(grid,zoneGrid,stats,sat,clean);
  const totalBldCount=Object.values(cc).reduce((t,v)=>t+v,0);
  const currentStage=calcStage(totalBldCount,parkRating.stars,money);

  const lastAutoSaveDay=useRef(-1);
  useEffect(()=>{
    if(screen!=="game"||day<2) return;
    if(day%5===0&&lastAutoSaveDay.current!==day){
      lastAutoSaveDay.current=day;
      saveToSlot(0);
    }
  },[day,screen,saveToSlot]);

  useEffect(()=>{
    if(currentStage.id>prevStageRef.current&&screen==="game"){
      prevStageRef.current=currentStage.id;
      setStageUpFlash(true);
      if(soundOn) playSound("mission");
      addLog(`🏆 ${lang==="ko"?`단계 상승: ${currentStage.name.ko}!`:`Stage Up: ${currentStage.name.en}!`}`);
      setTimeout(()=>setStageUpFlash(false),3000);
    }
  },[currentStage.id]);

  useEffect(()=>{
    if(screen !== "game") return;
    const id=setInterval(()=>{
      const{grid,visitors,segData}=ref.current;
      if(visitors===0) return;
      const paths=[];for(let r=0;r<GR;r++) for(let c=0;c<GC;c++){const cell=grid[r][c];if(cell?.type==="_path"||cell?.type==="_pathFancy") paths.push({r,c});}
      const tiles=[];for(let r=0;r<GR;r++) for(let c=0;c<GC;c++){if(grid[r][c]&&!grid[r][c].broken) tiles.push({r,c});}
      const pool=paths.length>2?paths:tiles;if(!pool.length) return;
      setDots(prev=>prev.map(dot=>{
        const base=pool[Math.floor(Math.random()*pool.length)];
        const sk=Object.keys(SEGS).reduce((best,k)=>(segData[k]||0)>(segData[best]||0)?k:best,"general");
        return{...dot,r:Math.max(0,Math.min(GR-1,base.r+Math.floor(Math.random()*3)-1)),c:Math.max(0,Math.min(GC-1,base.c+Math.floor(Math.random()*3)-1)),emoji:SEGS[sk].emoji};
      }));
      // 15% 확률로 랜덤 방문객 말풍선
      if(Math.random()<0.15&&visitors>0){
        const curSat=ref.current.sat;
        const msgs=curSat>75
          ?["😊 재밌어요!","🎉 신났다!","👍 대박이야!","🎠 즐거워요!","⭐ 또 올게요!"]
          :curSat>50
          ?["🤔 그냥 그래요","😐 보통이네..","💭 더 있으면 좋겠는데"]
          :["😤 혼잡해!","💸 입장료 비싸!","😢 시설 고장났어요","🚫 별로예요"];
        const text=msgs[Math.floor(Math.random()*msgs.length)];
        setBubbles(prev=>{
          const now=Date.now();
          const alive=prev.filter(b=>b.expires>now).slice(-4);
          const r=Math.floor(Math.random()*GR);
          const c=Math.floor(Math.random()*GC);
          return [...alive,{id:now,r,c,text,expires:now+2800}];
        });
      }
    },1200);
    return()=>clearInterval(id);
  },[screen]);

  // 키보드 단축키
  useEffect(()=>{
    const handler=(e)=>{
      if(screen!=="game") return;
      if(e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA") return;
      if(e.code==="Space"){e.preventDefault();setSpeed(s=>s>0?0:1);}
      if(e.key==="1") setSpeed(1);
      if(e.key==="2") setSpeed(2);
      if(e.key==="3") setSpeed(3);
      if(e.code==="Escape"){setSelected(null);setClickedTile(null);setBuildMode("build");setDemolishConfirm(null);}
    };
    window.addEventListener("keydown",handler);
    return()=>window.removeEventListener("keydown",handler);
  },[screen]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const saveParam = params.get('save');
    if (saveParam && screen === 'menu') {
      try {
        const state = JSON.parse(decodeURIComponent(atob(saveParam)));
        loadFromSlot(state);
        window.history.replaceState({}, '', window.location.pathname);
        addLog(lang==="ko"?"📂 URL에서 세이브 불러옴!":"📂 Save loaded from URL!");
      } catch(e) {
        // silently fail
      }
    }
  }, []); // 마운트 시 1회만

  const handleGridClick=(r,c)=>{
    const{ownedGrid:og,grid:g,money:m}=ref.current;
    if(!og[r][c]){addLog(t("log.unownedLand"));return;}

    // 존 페인트 모드 — 멀티셀 건물이면 전체 footprint에 존 적용
    if(buildMode==="zone"&&zonePaint){
      const clickedCell=g[r][c];
      let ar=r,ac=c;
      if(clickedCell?.ref){[ar,ac]=clickedCell.ref;}
      const anchorCell=g[ar][ac];
      const bw=anchorCell?B[anchorCell.type]?.size?.w||1:1;
      const bh=anchorCell?B[anchorCell.type]?.size?.h||1:1;
      setZoneGrid(prev=>{
        const n=prev.map(row=>[...row]);
        for(let dr=0;dr<bh;dr++) for(let dc=0;dc<bw;dc++){
          if(ar+dr<GR&&ac+dc<GC) n[ar+dr][ac+dc]=zonePaint==="clear"?null:zonePaint;
        }
        return n;
      });
      return;
    }

    // 철거 모드 — 클릭한 건물의 모든 셀 선택 토글
    if(buildMode==="demolish"){
      if(g[r][c]){
        let ar=r,ac=c;
        if(g[r][c].ref){[ar,ac]=g[r][c].ref;}
        const anchorCell=g[ar][ac];
        const bw=B[anchorCell?.type]?.size?.w||1;
        const bh=B[anchorCell?.type]?.size?.h||1;
        const cells=[];
        for(let dr=0;dr<bh;dr++) for(let dc=0;dc<bw;dc++) cells.push(`${ar+dr},${ac+dc}`);
        setMultiSelectedCells(prev=>{
          const n=new Set(prev);
          const allSel=cells.every(k=>n.has(k));
          allSel?cells.forEach(k=>n.delete(k)):cells.forEach(k=>n.add(k));
          return n;
        });
      }
      return;
    }

    // 건물 없고 선택도 없으면 — ref는 앵커로 라우팅
    if(!selected){
      const clickedCell=g[r][c];
      if(!clickedCell){setClickedTile(null);return;}
      if(clickedCell.ref){const[ar,ac]=clickedCell.ref;setClickedTile({r:ar,c:ac,cell:g[ar][ac]});}
      else{setClickedTile({r,c,cell:clickedCell});}
      return;
    }

    const bd=B[selected];
    if(m<bd.baseCost){addLog(t("log.noMoney"));return;}
    if(bd.locked&&!researched.includes("r4")&&gameMode!=="sandbox"){addLog(t("log.locked"));return;}
    if(selected==="entrance"){for(const row of g) for(const cell of row) if(cell?.type==="entrance"){addLog(t("log.oneEntrance"));return;}}

    const bw=bd.size?.w||1, bh=bd.size?.h||1;
    // 범위 확인 및 빈 칸 확인
    for(let dr=0;dr<bh;dr++) for(let dc=0;dc<bw;dc++){
      const nr=r+dr,nc=c+dc;
      if(nr>=GR||nc>=GC){addLog(t("log.unownedLand"));return;}
      if(!og[nr][nc]){addLog(t("log.unownedLand"));return;}
      if(g[nr][nc]){addLog(t("log.alreadyBuilt"));return;}
    }

    setGrid(prev=>{
      const n=prev.map(row=>[...row]);
      n[r][c]={type:selected,level:0,broken:false};
      for(let dr=0;dr<bh;dr++) for(let dc=0;dc<bw;dc++){
        if(dr===0&&dc===0) continue;
        n[r+dr][c+dc]={type:selected,ref:[r,c]};
      }
      return n;
    });
    setMoney(mo=>mo-bd.baseCost);addLog(t("log.build",{name:t(`b.${selected}`)}));if(soundOn) playSound("build");
    const pId=Date.now();
    const pColor=B[selected]?.color||"#FFD93D";
    const particles=Array.from({length:8},(_,i)=>{
      const angle=(i/8)*Math.PI*2; const dist=30+Math.random()*25;
      return{tx:`${Math.cos(angle)*dist}px`,ty:`${Math.sin(angle)*dist}px`,col:pColor};
    });
    setBuildParticles(prev=>[...prev,{id:pId,r,c,color:pColor,particles}]);
    setTimeout(()=>setBuildParticles(prev=>prev.filter(p=>p.id!==pId)),700);
  };
  const upgradeBuilding=()=>{const{r,c,cell}=clickedTile;if(cell.level>=2||cell.broken) return;const cost=B[cell.type].upgradeCost[cell.level];if(!cost) return;if(ref.current.money<cost){addLog(t("log.noMoney"));return;}const lv=cell.level+1;setGrid(prev=>{const n=prev.map(r=>[...r]);n[r][c]={...cell,level:lv};return n;});setMoney(m=>m-cost);setClickedTile(p=>({...p,cell:{...p.cell,level:lv}}));addLog(t("log.upgrade", {name: t(`b.${cell.type}`), lv: lv+1}));if(soundOn) playSound("upgrade");};
  const repairBuilding=()=>{const{r,c,cell}=clickedTile;if(!cell.broken) return;const cost=Math.max(500,Math.floor(B[cell.type].baseCost*0.15));if(ref.current.money<cost){addLog(t("log.repairNoMoney"));return;}setGrid(prev=>{const n=prev.map(r=>[...r]);n[r][c]={...cell,broken:false};return n;});setMoney(m=>m-cost);setClickedTile(p=>({...p,cell:{...p.cell,broken:false}}));addLog(t("log.repair"));};
  const demolish=()=>{const{r,c,cell}=clickedTile;const refund=Math.floor(B[cell.type].baseCost*0.4);setDemolishConfirm({r,c,cell,refund});};
  const confirmDemolish=()=>{if(!demolishConfirm) return;const{r,c,cell,refund}=demolishConfirm;const bw=B[cell.type]?.size?.w||1;const bh=B[cell.type]?.size?.h||1;setGrid(prev=>{const n=prev.map(row=>[...row]);for(let dr=0;dr<bh;dr++) for(let dc=0;dc<bw;dc++) n[r+dr][c+dc]=null;return n;});setMoney(m=>m+refund);addLog(t("log.demolish"));setClickedTile(null);if(soundOn) playSound("demolish");setDemolishConfirm(null);};
  const hire=k=>{if(ref.current.money<STAFF[k].hire){addLog(t("log.noMoney"));return;}setHired(h=>({...h,[k]:h[k]+1}));setMoney(m=>m-STAFF[k].hire);addLog(t("log.hire", {name: t(`st.${k}`)}));};
  const fire=k=>{if(hired[k]<=0)return;setHired(h=>({...h,[k]:h[k]-1}));addLog(t("log.fire", {name: t(`st.${k}`)}));};
  const takeLoan=opt=>{const total=Math.floor(opt.amount*(1+opt.rate));const daily=Math.ceil(total/opt.days);setLoans(l=>[...l,{id:Date.now(),amount:opt.amount,remaining:total,dailyPayment:daily,rate:opt.rate}]);setMoney(m=>m+opt.amount);addLog(t("log.loan"));};
  const buyParcel=p=>{if(ref.current.money<p.cost){addLog(t("log.noMoney"));return;}if(p.req&&!parcels.includes(p.req)){addLog(t("log.needPrevParcel"));return;}setOwnedGrid(prev=>{const n=prev.map(r=>[...r]);for(let r=0;r<GR;r++) for(let co=p.cols[0];co<=p.cols[1];co++) n[r][co]=true;return n;});setParcels(prev=>[...prev,p.id]);setMoney(m=>m-p.cost);addLog(t("log.parcelBought",{name:p.label}));};
  const launchCampaign=key=>{const c=CAMPAIGNS_DATA[key];if(ref.current.money<c.cost){addLog(t("log.noMoney"));return;}setCampaigns(p=>[...p,{id:Date.now(),key,emoji:c.emoji,boost:c.boost,seg:c.seg,remaining:c.days,days:c.days}]);setMoney(m=>m-c.cost);addLog(t("log.campaignStart", {name: t(`camp.${key}`)}));};
  const acceptVIP=()=>{const evt=pendingVIP;const ok=checkVIPReq(ref.current.grid,evt.req);if(!ok){addLog(t("log.vipReqFail", {name: t(`vip.${evt.id}`)}));setPendingVIP(null);return;}setMoney(m=>m+evt.bonusRev);setPrestigeBonus(s=>s+evt.presBonus);setVipCount(v=>v+1);setPendingVIP(null);addLog(t("log.vipSuccess", {name: t(`vip.${evt.id}`)}));};
  const resolveDisaster=()=>{if(!activeDisaster?.resolveCost) return;if(ref.current.money<activeDisaster.resolveCost){addLog(t("log.resolveNoMoney"));return;}setMoney(m=>m-activeDisaster.resolveCost);setActiveDisaster(null);addLog(t("log.disasterSolved"));};
  const mitigateDisaster=()=>{
    const cost=800;
    if(money<cost){addLog(t("log.noMoney"));return;}
    setMoney(m=>m-cost);
    setDisasterWarning(null);
    addLog(`🛡️ ${lang==="ko"?"재난 대비 완료! 위험이 해소됐습니다.":"Disaster mitigated! Threat neutralized."}`);
    if(soundOn) playSound("build");
  };
  const takeSnapshot = () => {
    const CELL = 32;
    const W = GC * CELL;
    const H = GR * CELL;
    const canvas = document.createElement('canvas');
    canvas.width = W + 8;
    canvas.height = H + 40; // 하단 레이블 공간
    const ctx = canvas.getContext('2d');
    // 배경
    ctx.fillStyle = '#020510';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // 그리드 셀
    for (let r = 0; r < GR; r++) {
      for (let c = 0; c < GC; c++) {
        const x = c * CELL + 4;
        const y = r * CELL;
        const cell = grid[r][c];
        const owned = ownedGrid[r][c];
        const zone = zoneGrid[r][c];
        // 셀 배경
        ctx.fillStyle = owned
          ? (zone ? ZONES[zone]?.bg?.replace('18', '40') || '#1A1A30' : '#0D1128')
          : '#07090F';
        ctx.fillRect(x, y, CELL - 1, CELL - 1);
        // 소유 테두리
        ctx.strokeStyle = owned ? 'rgba(100,120,255,0.15)' : 'rgba(100,120,255,0.04)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x + 0.5, y + 0.5, CELL - 2, CELL - 2);
        // 이모지 (앵커 셀만)
        if (cell && !cell.ref) {
          const bd = B[cell.type];
          ctx.font = `${CELL * 0.55}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          if (cell.broken) ctx.globalAlpha = 0.5;
          ctx.fillText(bd?.emoji || '?', x + CELL / 2 - 1, y + CELL / 2);
          ctx.globalAlpha = 1;
        }
      }
    }
    // 하단 정보 레이블
    ctx.fillStyle = '#FFD93D';
    ctx.font = 'bold 11px Rajdhani, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`🎡 PARK TYCOON  Day ${day}  ⭐${parkRating.stars}  👥 ${visitors}명  😊 ${Math.round(sat)}%`, 8, H + 20);
    // 다운로드
    const link = document.createElement('a');
    link.download = `parktycoon-day${day}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    addLog(`📷 ${lang === "ko" ? "스냅샷 저장됨!" : "Snapshot saved!"}`);
  };
  const doResearch=id=>{const r=RESEARCH.find(x=>x.id===id);if(!r) return;if(researchPoints<r.cost){addLog(t("log.rpLacking"));return;}if(r.req&&!researched.includes(r.req)){addLog(t("log.resReq"));return;}if(researched.includes(id)) return;setResearched(p=>[...p,id]);setResearchPoints(p=>p-r.cost);addLog(t("log.resComplete", {name: t(`res.${r.id}.name`)}));};
  const upgradeStaff=k=>{const cur=staffLevels[k];if(cur>=3) return;const upg=STAFF_UPGRADES[k][cur];if(!upg) return;if(money<upg.upgCost){addLog(t("log.noMoney"));return;}setMoney(m=>m-upg.upgCost);setStaffLevels(p=>({...p,[k]:cur+1}));addLog(`⬆️ ${t(`st.${k}`)} Lv.${cur+1}!`);};
  const acceptInvestor=()=>{const offer=pendingInvestor.offer;setMoney(m=>m+offer.amount);setActiveInvestment({offerId:offer.id,amount:offer.amount,goal:offer.goal,deadline:day+offer.goal.days});setPendingInvestor(null);addLog(`💼 ${offer.name[lang]||offer.name.ko} ${lang==="ko"?"수락!":"accepted!"} +$${offer.amount.toLocaleString()}`);};
  const declineInvestor=()=>{setPendingInvestor(null);addLog(`💼 ${lang==="ko"?"투자 거절.":"Investment declined."}`);};;
  const applyFranchise=(r,c,fid)=>{const cell=grid[r][c];if(!cell) return;const flist=FRANCHISES[cell.type];if(!flist) return;const fdata=flist.find(f=>f.id===fid);if(!fdata) return;if(fdata.cost>0&&money<fdata.cost){addLog(t("log.noMoney"));return;}if(fdata.cost>0) setMoney(m=>m-fdata.cost);setBuildingFranchises(p=>({...p,[`${r},${c}`]:fid}));addLog(`🏪 ${fdata.name[lang]||fdata.name.ko}!`);};
  const removeFranchise=(r,c)=>{setBuildingFranchises(p=>{const n={...p};delete n[`${r},${c}`];return n;});};


  // stats, cc, parkRating, totalBldCount, currentStage computed above (pre-hook section)
  // 호버 footprint 계산 (선택된 건물의 배치 가능 여부 미리보기)
  const selBd=selected?B[selected]:null;
  const selW=selBd?.size?.w||1, selH=selBd?.size?.h||1;
  let hovFootprintValid=true;
  if(hovered&&selected){
    outer: for(let dr=0;dr<selH;dr++) for(let dc=0;dc<selW;dc++){
      const nr=hovered.r+dr,nc=hovered.c+dc;
      if(nr>=GR||nc>=GC||!ownedGrid[nr]?.[nc]||grid[nr]?.[nc]){hovFootprintValid=false;break outer;}
    }
  }
  const segs=calcSegs(grid);
  const spendMult=(segs.family||0)*1.2+(segs.couple||0)*1.5+(segs.thrill||0)*0.8+(segs.child||0)*0.5+(segs.general||0)*1.0;
  const wages=Object.entries(hired).reduce((t,[k,v])=>t+STAFF[k].daily*v,0);
  const loanPay=loans.reduce((t,l)=>t+l.dailyPayment,0);
  const totalDebt=loans.reduce((t,l)=>t+l.remaining,0);
  const campBoost=campaigns.reduce((t,c)=>t+c.boost,0);
  const passIncome=passOn?Math.floor(passHolders*passPrice/365*rb.passIncomeMult):0;
  const maxFee=gameMode==="sandbox"?999:MAX_FEE_BY_STARS[parkRating.stars];
  const shopMultiplier=avgShopMult(cc,shopMults);
  const rideTicketEst=calcRideTicketRev(cc,visitors,stats.attraction,ridePrices,pricingMode);
  const admRevEst=pricingMode!=="per_ride"?visitors*fee*rb.admissionMult:0;
  const shopRevEst=visitors*stats.rpv*spendMult*shopMultiplier;
  const estNet=Math.round(admRevEst+rideTicketEst+shopRevEst+passIncome-stats.maintenance*diffSettings.maintenanceMult-wages-loanPay);
  const ownedCount=ownedGrid.reduce((t,row)=>t+row.filter(Boolean).length,0);

  // Phase 2-6: Zone Mastery calculation
  const zoneMastery=useMemo(()=>{
    const result={};
    Object.entries(ZONE_MASTERY).forEach(([ztype,zm])=>{
      let zoneTiles=0,matchBlds=0;
      for(let r=0;r<GR;r++) for(let c=0;c<GC;c++){
        if(zoneGrid[r][c]===ztype){
          zoneTiles++;
          const cell=grid[r][c];
          if(cell&&!cell.ref&&!cell.broken&&B[cell.type]?.cat===zm.cat) matchBlds++;
        }
      }
      const ratio=zoneTiles>0?matchBlds/zoneTiles:0;
      const mastered=matchBlds>=zm.minBld&&ratio>=0.6;
      result[ztype]={zoneTiles,matchBlds,ratio,mastered,bonus:zm.bonus,minBld:zm.minBld,cat:zm.cat};
    });
    return result;
  },[grid,zoneGrid]);

  // Phase 2-4: average visitor rating
  const avgVisitorRating=visitorRatings.length>0?visitorRatings.reduce((s,r)=>s+r,0)/visitorRatings.length:3;
  const sc=season.color;
  // totalBldCount, currentStage already declared in pre-hook section above

  const anyGridPaths=grid.some(r=>r.some(c=>c?.type==="_path"||c?.type==="_pathFancy"));
  const reachablePaths=anyGridPaths?getReachablePaths(grid):new Set();
  const starStr="⭐".repeat(parkRating.stars)+"☆".repeat(5-parkRating.stars);
  const chartData=dailyHistory.slice(-14);
  const revPieData=useMemo(()=>[{name:t("rev.admission"),value:revBreak.adm,color:"#FECA57"},{name:t("rev.rides"),value:Math.round(revBreak.ride),color:"#FF6B9D"},{name:t("rev.shop"),value:Math.round(revBreak.shop),color:"#48DBFB"},{name:t("rev.pass"),value:revBreak.pass,color:"#5EF6A0"}].filter(d=>d.value>0),[revBreak, t]);
  const currentScenarioData=currentScenario?SCENARIOS.find(s=>s.id===currentScenario):null;
  const pm={width:20,height:20,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",color:"var(--text-primary)",borderRadius:4,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit",padding:0,transition:"all 0.15s"};

  const hasResearchAvailable=RESEARCH.some(r=>!researched.includes(r.id)&&researchPoints>=r.cost&&(!r.req||researched.includes(r.req)));

  const visitorZeroReason = screen === "game" && visitors === 0 && speed > 0 ? (
    !stats.hasEntrance ? { emoji: "🎪", msg: lang === "ko" ? "입구 게이트를 먼저 배치하세요" : "Place an Entrance Gate first" } :
    stats.attraction < 5 ? { emoji: "🎡", msg: lang === "ko" ? "어트랙션을 추가하면 방문객이 옵니다" : "Add attractions to attract visitors" } :
    fee > maxFee ? { emoji: "💸", msg: lang === "ko" ? `입장료가 너무 높습니다 (한도: $${maxFee})` : `Admission too high (limit: $${maxFee})` } :
    sat < 20 ? { emoji: "😔", msg: lang === "ko" ? "만족도가 너무 낮아 방문객이 오지 않습니다" : "Satisfaction too low for visitors" } :
    null
  ) : null;

  // 방문객 공식 분해
  const visitorFactors = screen==="game" ? (() => {
    const rb2 = getRB(researched);
    const ssn2 = SEASONS[Math.floor(((day-1)%120)/SL)];
    const diffS = DIFFICULTY_SETTINGS[difficulty]||DIFFICULTY_SETTINGS.normal;
    const feeEff2 = pricingMode==="per_ride"?1.25:Math.max(0.15,1.3-fee*0.022/(1+(parkRating.stars-1)*0.06));
    const campBoost2 = campaigns.reduce((t,c)=>t+c.boost,0);
    const stgVisMult2 = 1+stageVisBonus(currentStage);
    const baseVis = Math.round(stats.attraction * 2.5);
    return {
      attraction:  Math.round(stats.attraction),
      baseVis,
      weatherMult: weather.visMult,
      seasonMult:  ssn2.mult,
      feeMult:     Math.round(feeEff2*100)/100,
      campBoost:   Math.round(campBoost2*100),
      stageMult:   Math.round(stgVisMult2*100)/100,
      satMult:     Math.round((0.4+(sat/100)*0.9)*100)/100,
      estimated:   Math.round(baseVis * feeEff2 * ssn2.mult * weather.visMult * (0.4+(sat/100)*0.9) * stgVisMult2 * (1+campBoost2)),
    };
  })() : null;

  const rideList=Object.entries(B).filter(([,b])=>b.cat==="ride");
  const shopList=Object.entries(B).filter(([,b])=>b.cat==="shop");
  const facilList=Object.entries(B).filter(([,b])=>b.cat==="facility");
  const pathList=Object.entries(B).filter(([,b])=>b.cat==="path");
  const decoList=Object.entries(B).filter(([,b])=>b.cat==="deco");

  if(screen==="menu"){
    const slots=saveSlots;
    return(
      <div style={{fontFamily:"'Rajdhani','Barlow Condensed',sans-serif",background:"radial-gradient(ellipse at 50% 0%, #0D1535 0%, #020510 60%)",color:"var(--text-primary)",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div style={{width:"100%",maxWidth:680}}>
          <div style={{textAlign:"center",marginBottom:28}}>
            {/* 플로팅 이모지 장식 */}
            <div style={{display:"flex",justifyContent:"center",gap:16,marginBottom:12,fontSize:22,opacity:0.7}}>
              {["🎡","🎢","🎠","🎪","🚂","🎆"].map((em,i)=>(
                <span key={i} style={{display:"inline-block",animation:`float ${2+i*0.3}s ease-in-out infinite alternate`,animationDelay:`${i*0.2}s`}}>{em}</span>
              ))}
            </div>
            <div style={{fontSize:42,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:6,color:"#FFD93D",textShadow:"0 0 40px rgba(255,217,61,0.5), 0 0 80px rgba(255,159,67,0.3)",lineHeight:1}}>PARCADIA</div>
            <div style={{fontSize:11,letterSpacing:4,color:"#4A5880",fontWeight:600,fontFamily:"'Barlow Condensed',sans-serif",marginTop:6,marginBottom:4}}>BUILD · MANAGE · THRIVE</div>
            <div style={{fontSize:10,color:"#2E3A5C",letterSpacing:2}}>
              {lang==="ko"?"🎯 8개 시나리오  🏗️ 27종 건물  ⚡ 무료 플레이":"🎯 8 Scenarios  🏗️ 27 Buildings  ⚡ Free to Play"}
            </div>
          </div>
          <div style={{marginBottom:24}}>
            <div style={{fontSize:10,color:"#2E3A5C",textAlign:"center",letterSpacing:3,textTransform:"uppercase",marginBottom:8}}>{t("lang.select")}</div>
            <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap"}}>
              {Object.entries(LANG_FLAGS).map(([code,label])=>(
                <button key={code} style={{background:lang===code?"rgba(255,217,61,0.12)":"rgba(255,255,255,0.03)",border:`1px solid ${lang===code?"#FFD93D":"rgba(255,255,255,0.08)"}`,color:lang===code?"#FFD93D":"#6B7CA1",borderRadius:20,padding:"4px 12px",cursor:"pointer",fontSize:10,fontFamily:"inherit",fontWeight:lang===code?700:400,transition:"all 0.15s"}}
                  onClick={()=>changeLang(code)}>{label}</button>
              ))}
            </div>
          </div>

          {!menuSubScreen&&<>
            <div style={{fontSize:10,color:"#2E3A5C",textAlign:"center",letterSpacing:3,textTransform:"uppercase",marginBottom:12}}>{t("menu.newGame")}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:24}}>
              {[
                {mode:"campaign",emoji:"🎯",name:t("mode.campaign"),desc:t("mode.campaign.desc"),color:"#00E5A0",action:()=>setMenuSubScreen("scenario")},
                {mode:"sandbox", emoji:"🏗️",name:t("mode.sandbox"), desc:t("mode.sandbox.desc"), color:"#FFD93D",action:()=>startGame("sandbox",null,"normal")},
                {mode:"challenge",emoji:"⚡",name:t("mode.challenge"),desc:t("mode.challenge.desc"),color:"#FF6B9D",action:()=>setMenuSubScreen("difficulty")},
                {mode:"tutorial",emoji:"🎓",name:lang==="ko"?"튜토리얼":"Tutorial",desc:lang==="ko"?"처음 하시나요?\n단계별로 게임을 배워보세요":"New to the game?\nLearn step by step",color:"#9B7FFF",action:()=>{startGame("sandbox",null,"normal");setTutorialStep(1);}},
              ].map(({mode,emoji,name,desc,color,action})=>(
                <button key={mode} style={{background:"rgba(255,255,255,0.02)",border:`2px solid ${color}22`,borderRadius:14,padding:"20px 14px",cursor:"pointer",textAlign:"center",fontFamily:"inherit",transition:"all 0.2s",backdropFilter:"blur(4px)"}}
                  onMouseEnter={e=>{e.currentTarget.style.border=`2px solid ${color}`;e.currentTarget.style.background=color+"0A";e.currentTarget.style.boxShadow=`0 8px 30px ${color}22, inset 0 0 20px ${color}06`;}}
                  onMouseLeave={e=>{e.currentTarget.style.border=`2px solid ${color}22`;e.currentTarget.style.background="rgba(255,255,255,0.02)";e.currentTarget.style.boxShadow="none";}}
                  onClick={action}>
                  <div style={{fontSize:28,marginBottom:8}}>{emoji}</div>
                  <div style={{fontSize:12,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1,color,marginBottom:5}}>{name}</div>
                  <div style={{fontSize:10,color:"#6B7CA1",lineHeight:1.5,whiteSpace:"pre-line"}}>{desc}</div>
                </button>
              ))}
            </div>
            <div style={{fontSize:10,color:"#2E3A5C",textAlign:"center",letterSpacing:3,textTransform:"uppercase",marginBottom:10}}>{t("menu.loadGame")}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {slots.map((slot,i)=>(
                <div key={i} style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${slot?"rgba(100,120,255,0.15)":"rgba(255,255,255,0.06)"}`,borderRadius:10,padding:12}}>
                  {slot?.meta?(
                    <>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                        <div style={{fontSize:10,color:"#2E3A5C"}}>Slot {i+1}</div>
                        <div style={{fontSize:10,color:"#2E3A5C"}}>{timeAgoL(slot.meta.savedAt,t)}</div>
                      </div>
                      <div style={{fontSize:10,color:"#FFD93D",marginBottom:2}}>📅 {t("misc.day")} {slot.meta.day}</div>
                      <div style={{fontSize:10,color:"#00E5A0",marginBottom:2}}>💰 ${slot.meta.money?.toLocaleString()}</div>
                      <div style={{fontSize:10,marginBottom:8}}>{"⭐".repeat(slot.meta.stars||1)}</div>
                      <div style={{fontSize:10,color:"#9B7FFF",marginBottom:8}}>
                        {slot.meta.mode==="campaign"?`🎯 ${t(`scn.${slot.meta.scenario}`)||t("mode.campaign")}`:slot.meta.mode==="sandbox"?t("misc.sandbox"):`⚡ ${t("mode.challenge")}`}
                      </div>
                      <div style={{display:"flex",gap:4}}>
                        <button style={{flex:1,background:"rgba(155,127,255,0.12)",border:"1px solid rgba(155,127,255,0.3)",color:"#9B7FFF",borderRadius:5,padding:"4px 0",cursor:"pointer",fontSize:10,fontFamily:"inherit",transition:"all 0.15s"}} onClick={()=>loadFromSlot(slot)}>{t("menu.loadGame")}</button>
                        <button style={{background:"rgba(255,87,87,0.08)",border:"1px solid rgba(255,87,87,0.25)",color:"#FF5757",borderRadius:5,padding:"4px 6px",cursor:"pointer",fontSize:10,fontFamily:"inherit",transition:"all 0.15s"}} onClick={()=>{const n=[...slots];n[i]=null;writeSaveSlots(n);setSaveSlots(n);}}>{t("menu.deleteSlot")}</button>
                      </div>
                    </>
                  ):(
                    <div style={{textAlign:"center",padding:"12px 0"}}>
                      <div style={{fontSize:10,color:"#2E3A5C",marginBottom:4}}>Slot {i+1}</div>
                      <div style={{fontSize:11,color:"#2E3A5C"}}>{t("menu.emptySlot")}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>}

          {menuSubScreen==="scenario"&&<>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
              <button style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.10)",color:"#6B7CA1",borderRadius:5,padding:"4px 10px",cursor:"pointer",fontSize:10,fontFamily:"inherit",transition:"all 0.15s"}} onClick={()=>setMenuSubScreen(null)}>{t("menu.back")}</button>
              <div style={{fontSize:13,fontWeight:700,color:"#00E5A0",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1}}>🎯 {t("scn.select")}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
              {SCENARIOS.map(sc=>(
                <button key={sc.id} style={{background:"rgba(255,255,255,0.02)",border:`2px solid ${sc.color}22`,borderRadius:12,padding:"14px 12px",cursor:"pointer",textAlign:"left",fontFamily:"inherit",transition:"all 0.2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.border=`2px solid ${sc.color}`;e.currentTarget.style.background=sc.color+"0A";e.currentTarget.style.boxShadow=`0 8px 24px ${sc.color}18`;}}
                  onMouseLeave={e=>{e.currentTarget.style.border=`2px solid ${sc.color}22`;e.currentTarget.style.background="rgba(255,255,255,0.02)";e.currentTarget.style.boxShadow="none";}}
                  onClick={()=>{setPendingScenarioId(sc.id);setMenuSubScreen("scenario-diff");}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
                    <div style={{fontSize:24}}>{sc.emoji||"🎡"}</div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:2}}>
                      <div style={{fontSize:10,color:sc.color+"99"}}>{"★".repeat(sc.difficulty||1)}{"☆".repeat(5-(sc.difficulty||1))}</div>
                      {sc.id==="s1"&&<div style={{fontSize:9,background:"rgba(0,229,160,0.15)",border:"1px solid rgba(0,229,160,0.4)",color:"#00E5A0",borderRadius:3,padding:"1px 5px",letterSpacing:1}}>{lang==="ko"?"추천 시작":"STARTER"}</div>}
                    </div>
                  </div>
                  <div style={{fontSize:11,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",color:sc.color,marginBottom:3}}>{t(`scn.${sc.id}`)}</div>
                  <div style={{fontSize:10,color:"#5A6A8A",lineHeight:1.5,marginBottom:5}}>{t(`scn.${sc.id}.desc`)}</div>
                  <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:4}}>
                    {sc.goals.map(g=><span key={g.id} style={{fontSize:9,padding:"1px 5px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:3}}>{g.medal} {g.desc?.[lang]||g.desc?.ko||""}</span>)}
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#2E3A5C"}}>
                    <span>⏱ {sc.timeLimit}{lang==="ko"?"일":"d"}</span>
                    <span>💰 ${sc.startMoney.toLocaleString()}</span>
                  </div>
                </button>
              ))}
            </div>
          </>}

          {menuSubScreen==="scenario-diff"&&(()=>{
            const sc=SCENARIOS.find(s=>s.id===pendingScenarioId);
            if(!sc) return null;
            return(<>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
                <button style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.10)",color:"#6B7CA1",borderRadius:5,padding:"4px 10px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}} onClick={()=>setMenuSubScreen("scenario")}>{t("menu.back")}</button>
                <div style={{fontSize:13,fontWeight:700,color:sc.color,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1}}>{sc.emoji} {t(`scn.${sc.id}`)}</div>
              </div>

              {/* 시나리오 요약 카드 */}
              <div style={{background:`${sc.color}0A`,border:`1px solid ${sc.color}33`,borderRadius:10,padding:"10px 14px",marginBottom:16}}>
                <div style={{fontSize:10,color:"#6B7CA1",lineHeight:1.6,marginBottom:8}}>{t(`scn.${sc.id}.desc`)}</div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:6}}>
                  {sc.goals.map(g=><span key={g.id} style={{fontSize:9,padding:"1px 6px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:3}}>{g.medal} {g.desc?.[lang]||g.desc?.ko}</span>)}
                </div>
                <div style={{display:"flex",gap:10,fontSize:10,color:"#4A5880"}}>
                  <span>💰 ${sc.startMoney.toLocaleString()}</span>
                  <span>⏱ {sc.timeLimit}{lang==="ko"?"일":"d"}</span>
                  <span>{"★".repeat(sc.difficulty||1)}{"☆".repeat(5-(sc.difficulty||1))}</span>
                </div>
              </div>

              {/* 난이도 선택 */}
              <div style={{fontSize:10,color:"#2E3A5C",textAlign:"center",letterSpacing:3,textTransform:"uppercase",marginBottom:10}}>
                {lang==="ko"?"난이도 선택":"Select Difficulty"}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:8}}>
                {Object.entries(SCENARIO_DIFFICULTY).map(([key,sd])=>{
                  const effMoney=Math.floor(sc.startMoney*sd.moneyMult);
                  const effTime=Math.floor(sc.timeLimit*sd.timeMult);
                  return(
                    <button key={key}
                      style={{background:"rgba(255,255,255,0.02)",border:`2px solid ${sd.color}33`,borderRadius:12,padding:"16px 10px",cursor:"pointer",textAlign:"center",fontFamily:"inherit",transition:"all 0.2s"}}
                      onMouseEnter={e=>{e.currentTarget.style.border=`2px solid ${sd.color}`;e.currentTarget.style.background=sd.color+"0F";e.currentTarget.style.boxShadow=`0 8px 24px ${sd.color}22`;}}
                      onMouseLeave={e=>{e.currentTarget.style.border=`2px solid ${sd.color}33`;e.currentTarget.style.background="rgba(255,255,255,0.02)";e.currentTarget.style.boxShadow="none";}}
                      onClick={()=>startGame("campaign",pendingScenarioId,sd.diffKey)}>
                      <div style={{fontSize:24,marginBottom:6}}>{sd.emoji}</div>
                      <div style={{fontSize:13,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1,color:sd.color,marginBottom:4}}>{sd.label[lang]||sd.label.ko}</div>
                      <div style={{fontSize:10,color:"#4A5880",lineHeight:1.6,marginBottom:8}}>{sd.desc[lang]||sd.desc.ko}</div>
                      <div style={{background:"rgba(0,0,0,0.3)",borderRadius:6,padding:"6px 4px"}}>
                        <div style={{fontSize:10,color:"#FECA57",marginBottom:2}}>💰 ${effMoney.toLocaleString()}</div>
                        <div style={{fontSize:10,color:"#48DBFB"}}>⏱ {effTime}{lang==="ko"?"일":"d"}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>);
          })()}

          {menuSubScreen==="difficulty"&&<>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
              <button style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.10)",color:"#6B7CA1",borderRadius:5,padding:"4px 10px",cursor:"pointer",fontSize:10,fontFamily:"inherit",transition:"all 0.15s"}} onClick={()=>setMenuSubScreen(null)}>{t("menu.back")}</button>
              <div style={{fontSize:13,fontWeight:700,color:"#FF6B9D",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1}}>⚡ {t("diff.select")}</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {Object.entries(DIFFICULTY_SETTINGS).map(([key,diff])=>(
                <button key={key} style={{background:"rgba(255,255,255,0.02)",border:"2px solid rgba(255,107,157,0.15)",borderRadius:12,padding:"16px 12px",cursor:"pointer",textAlign:"left",fontFamily:"inherit",transition:"all 0.2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="#FF6B9D";e.currentTarget.style.background="rgba(255,107,157,0.06)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,107,157,0.15)";e.currentTarget.style.background="rgba(255,255,255,0.02)";}}
                  onClick={()=>startGame("challenge",null,key)}>
                  <div style={{fontSize:24,marginBottom:6}}>{diff.emoji}</div>
                  <div style={{fontSize:12,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",color:"#FF6B9D",marginBottom:3}}>{t(`diff.${key}`)}</div>
                  <div style={{fontSize:10,color:"#6B7CA1",marginBottom:6}}>{t(`diff.${key}.desc`)}</div>
                  <div style={{fontSize:10,fontWeight:700,color:"#FFD93D",fontFamily:"'Barlow Condensed',monospace"}}>${diff.startMoney.toLocaleString()}</div>
                </button>
              ))}
            </div>
          </>}

          {/* 하단 버전 정보 */}
          <div style={{textAlign:"center",marginTop:24,fontSize:10,color:"#1A2040",fontFamily:"'Space Mono',monospace"}}>
            v1.0.0 · Parcadia · {lang==="ko"?"무료 경영 시뮬레이션":"Free Management Sim"}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  // ── GAME SCREEN ─────────────────────────────────────────
  return(
    <div style={{fontFamily:"'Rajdhani','Barlow Condensed',sans-serif",background:"var(--bg-deep)",color:"var(--text-primary)",height:"100vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>

      {/* TOP BAR — 2행 구조 */}
      <div style={{background:"linear-gradient(180deg,#0A0D22 0%,#07091A 100%)",borderBottom:"1px solid rgba(100,120,255,0.15)",boxShadow:"0 2px 20px rgba(0,0,0,0.5)",flexShrink:0}}>
        {/* 1행: 로고 / 모드 / 날씨·별점·단계 / 저장·속도 */}
        <div className="topbar-row1" style={{display:"flex",alignItems:"center",gap:4,padding:"3px 8px",overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
          <button style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.10)",color:"#6B7CA1",borderRadius:5,padding:"3px 7px",cursor:"pointer",fontSize:10,fontFamily:"inherit",whiteSpace:"nowrap",transition:"all 0.15s"}} onClick={()=>{setSpeed(0);setScreen("menu");}}>{t("btn.menu")}</button>
          <div style={{fontSize:13,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:4,color:"transparent",background:"linear-gradient(135deg,#FFD93D,#FF9F43)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",whiteSpace:"nowrap"}}>🎡 PARK</div>
          <div style={{fontSize:10,borderRadius:4,padding:"2px 6px",background:gameMode==="sandbox"?"rgba(255,217,61,0.10)":gameMode==="campaign"?"rgba(0,229,160,0.10)":"rgba(255,107,157,0.10)",border:`1px solid ${gameMode==="sandbox"?"rgba(255,217,61,0.3)":gameMode==="campaign"?"rgba(0,229,160,0.3)":"rgba(255,107,157,0.3)"}`,color:gameMode==="sandbox"?"#FFD93D":gameMode==="campaign"?"#00E5A0":"#FF6B9D",whiteSpace:"nowrap",fontWeight:600}}>
            {gameMode==="sandbox"?t("misc.sandbox"):gameMode==="campaign"?`🎯 ${t(`scn.${currentScenarioData?.id}`)||"캠페인"}`:`⚡ ${t(`diff.${difficulty}`)}`}
          </div>
          {gameMode==="campaign"&&currentScenarioData?.timeLimit&&(
            <div style={{fontSize:10,padding:"2px 5px",background:day>currentScenarioData.timeLimit-5?"rgba(255,71,87,0.12)":"rgba(255,255,255,0.04)",border:`1px solid ${day>currentScenarioData.timeLimit-5?"rgba(255,71,87,0.5)":"rgba(255,255,255,0.08)"}`,borderRadius:4,color:day>currentScenarioData.timeLimit-5?"#FF5757":"#6B7CA1",whiteSpace:"nowrap"}}>
              ⏱ {Math.max(0,currentScenarioData.timeLimit-day)}d
            </div>
          )}
          <div style={{flex:1}}/>
          {/* 날씨 */}
          <div style={{display:"flex",alignItems:"center",gap:2,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:4,padding:"2px 6px"}}>
            <span style={{fontSize:12}}>{weather.emoji}</span>
            <span style={{fontSize:10,color:"#6B7CA1"}}>{weather.name[lang]||weather.name.ko}</span>
          </div>
          {/* 이벤트 배지 */}
          {activeHoliday&&<div style={{display:"flex",alignItems:"center",gap:2,background:"rgba(255,217,61,0.10)",border:"1px solid rgba(255,217,61,0.3)",borderRadius:4,padding:"2px 6px",animation:"pulse 2s infinite"}}>
            <span style={{fontSize:12}}>{activeHoliday.emoji}</span>
            <div>
              <div style={{fontSize:5,color:"#FFD93D",letterSpacing:1}}>EVENT</div>
              <div style={{fontSize:10,fontWeight:700,color:"#FFD93D"}}>{activeHoliday.name[lang]||activeHoliday.name.ko}</div>
            </div>
            <span style={{fontSize:10,color:"rgba(255,217,61,0.6)"}}>{activeHoliday.remaining}d</span>
          </div>}
          {/* 맵 타입 - 이모지만 */}
          {(()=>{const cm=MAP_TYPES.find(m=>m.id===mapType)||MAP_TYPES[0];return(<div title={cm.name[lang]||cm.name.ko} style={{display:"flex",alignItems:"center",background:cm.color+"18",border:`1px solid ${cm.color}44`,borderRadius:4,padding:"2px 4px"}}>
            <span style={{fontSize:12}}>{cm.emoji}</span>
          </div>);})()}
          {/* 별점 */}
          <div style={{display:"flex",alignItems:"center",gap:2,background:"rgba(155,127,255,0.08)",border:"1px solid rgba(155,127,255,0.2)",borderRadius:4,padding:"2px 6px",cursor:"pointer",transition:"all 0.15s"}} onClick={()=>setTab("finance")}>
            <span style={{fontSize:10}}>{starStr}</span><span style={{fontSize:10,fontWeight:700,color:"#9B7FFF"}}>{parkRating.final}</span>
          </div>
          {/* 단계 */}
          <div style={{display:"flex",alignItems:"center",gap:2,background:`${currentStage.color}12`,border:`1px solid ${currentStage.color}33`,borderRadius:4,padding:"2px 6px",cursor:"pointer",whiteSpace:"nowrap",transition:"all 0.15s"}} onClick={()=>setTab("mission")}>
            <span style={{fontSize:10}}>{currentStage.emoji}</span>
            <span style={{fontSize:10,fontWeight:700,color:currentStage.color}}>S{currentStage.id}</span>
          </div>
          {/* 저장 */}
          <div style={{display:"flex",gap:2}}>
            {[0,1,2].map(i=>(
              <button key={i} style={{background:lastSavedSlot===i?"rgba(0,229,160,0.12)":"rgba(255,255,255,0.05)",border:`1px solid ${lastSavedSlot===i?"rgba(0,229,160,0.4)":"rgba(255,255,255,0.10)"}`,color:lastSavedSlot===i?"#00E5A0":"#6B7CA1",borderRadius:6,padding:"3px 7px",cursor:"pointer",fontSize:10,fontWeight:600,fontFamily:"inherit",transition:"all 0.15s"}} onClick={()=>saveSlots[i]?.meta?setSaveConfirm({slotIdx:i}):saveToSlot(i)}>
                {lastSavedSlot===i?"✓":t("btn.save")}{i+1}
              </button>
            ))}
          </div>
          {/* 스냅샷 */}
          <button
            onClick={takeSnapshot}
            title={lang === "ko" ? "공원 스냅샷 저장" : "Save park snapshot"}
            style={{
              background: "rgba(100,120,255,0.08)",
              border: "1px solid rgba(100,120,255,0.2)",
              color: "#8899CC",
              borderRadius: 5,
              padding: "3px 7px",
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "inherit",
              transition: "all 0.15s",
            }}
          >
            📷
          </button>
          <button
            onClick={()=>setSoundOn(s=>!s)}
            title={soundOn?(lang==="ko"?"소리 끄기":"Mute"):(lang==="ko"?"소리 켜기":"Unmute")}
            style={{background:"rgba(100,120,255,0.08)",border:"1px solid rgba(100,120,255,0.2)",color:soundOn?"#8899CC":"#4A5880",borderRadius:5,padding:"3px 7px",cursor:"pointer",fontSize:12,fontFamily:"inherit",transition:"all 0.15s"}}
          >
            {soundOn?"🔊":"🔇"}
          </button>
          {/* URL Export */}
          <button
            onClick={exportSaveURL}
            title={lang==="ko"?"저장 URL 공유":"Share Save URL"}
            style={{background:"rgba(100,120,255,0.08)",border:"1px solid rgba(100,120,255,0.2)",color:"#8899CC",borderRadius:5,padding:"3px 7px",cursor:"pointer",fontSize:11,fontFamily:"inherit",transition:"all 0.15s"}}
          >
            🔗
          </button>
          {/* 속도 */}
          <div style={{display:"flex",gap:2}}>
            {[["⏸",0],["▶",1],["⏩",2],["⚡",3]].map(([ic,sp])=>{
              const spCol=sp===0?"#4A5880":sp===1?"#00E5A0":sp===2?"#FF9F43":"#FF6B9D";
              return(<button key={sp} title={sp===0?(lang==="ko"?"일시정지":"Pause"):sp===1?(lang==="ko"?"보통 속도":"Normal"):sp===2?(lang==="ko"?"빨리 감기":"Fast"):lang==="ko"?"매우 빨리 감기":"Very Fast"} style={{background:speed===sp?`${spCol}18`:"rgba(255,255,255,0.04)",border:`1px solid ${speed===sp?spCol:"rgba(255,255,255,0.08)"}`,color:speed===sp?spCol:"#4A5880",borderRadius:4,padding:"2px 4px",cursor:"pointer",fontSize:11,fontFamily:"inherit",transition:"all 0.15s",boxShadow:speed===sp?`0 0 8px ${spCol}44`:"none"}} onClick={()=>setSpeed(sp)}>{ic}</button>);
            })}
          </div>
        </div>
        {/* 2행: 스탯 카드 */}
        <div className="topbar-stats" style={{display:"flex",gap:4,padding:"4px 12px",borderTop:"1px solid rgba(255,255,255,0.06)",overflowX:"auto",alignItems:"center"}}>
          {[
            {ic:"💰",v:`$${money.toLocaleString()}`,l:t("lbl.budget"),  col:"#FFD93D",big:true,isVis:false},
            {ic:"👥",v:visitors.toLocaleString(),   l:t("lbl.visitors"), col:"#4D9FFF",big:true,isVis:true},
            {ic:"😊",v:`${Math.round(sat)}%`,        l:t("lbl.satisfaction"),col:sat>70?"#00E5A0":sat>40?"#FFD93D":"#FF5757",big:false,isVis:false,isSat:true},
            {ic:"🧹",v:`${Math.round(clean)}%`,      l:t("lbl.cleanliness"), col:clean>70?"#00E5A0":clean>40?"#FFD93D":"#FF5757",big:false,isVis:false},
            {ic:"📅",v:`Day ${day}`,                 l:t("lbl.day"),    col:"#9B7FFF",big:false,isVis:false},
            ...(totalDebt>0?[{ic:"💳",v:`$${(totalDebt/1000).toFixed(0)}k`,l:t("lbl.loan"),col:"#FF5757",big:false,isVis:false}]:[]),
            ...(activeDisaster?[{ic:"🚨",v:`${activeDisaster.remaining}d`,l:t("lbl.disaster"),col:"#FF5757",big:false,isVis:false}]:[]),
          ].map(({ic,v,l,col,big,isVis,isSat})=>(
            <div key={l} style={{position:"relative"}}>
              <div
                onClick={isVis?()=>setShowVisBreakdown(x=>!x):undefined}
                onMouseEnter={isSat?()=>setShowSatTooltip(true):undefined}
                onMouseLeave={isSat?()=>setShowSatTooltip(false):undefined}
                style={{display:"flex",alignItems:"center",gap:4,background:big?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.03)",border:`1px solid ${isVis&&showVisBreakdown?"#4D9FFF66":isSat&&showSatTooltip?col+"66":big?col+"33":"rgba(255,255,255,0.07)"}`,borderRadius:8,padding:big?"3px 10px":"3px 8px",whiteSpace:"nowrap",flexShrink:0,cursor:isVis||isSat?"pointer":"default",transition:"border-color 0.15s"}}>
                <span style={{fontSize:big?14:11}}>{ic}</span>
                <div>
                  <div style={{fontSize:9,color:"#3A4A6A",textTransform:"uppercase",letterSpacing:1,lineHeight:1,fontWeight:600}}>{l}{isVis&&<span style={{marginLeft:3,fontSize:8,color:"#4D9FFF44"}}>{showVisBreakdown?"▲":"▼"}</span>}{isSat&&<span style={{marginLeft:2,fontSize:7,color:col+"66"}}>▼</span>}</div>
                  <div style={{fontSize:big?16:12,fontWeight:big?900:700,fontFamily:"'Barlow Condensed',sans-serif",color:col,lineHeight:1.1}}>{v}</div>
                </div>
              </div>
              {/* 만족도 hover 툴팁 */}
              {isSat&&showSatTooltip&&(
                <div style={{position:"absolute",top:"100%",left:0,marginTop:4,background:"rgba(8,12,32,0.97)",border:`1px solid ${col}44`,borderRadius:8,padding:"8px 10px",zIndex:50,minWidth:180,backdropFilter:"blur(8px)",animation:"slide-in 0.15s ease",pointerEvents:"none"}}>
                  <div style={{fontSize:9,fontWeight:700,color:col,letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>😊 {lang==="ko"?"만족도 영향 요인":"Satisfaction Factors"}</div>
                  {[
                    {label:lang==="ko"?"🏗️ 시설 보너스":"🏗️ Facilities", val:+stats.satBonus.toFixed(1), pos:stats.satBonus>=0},
                    {label:lang==="ko"?`☀️ 날씨 (${weather.id})`:`☀️ Weather`, val:weather.satMod, pos:weather.satMod>=0},
                    {label:lang==="ko"?"🔧 고장 시설":"🔧 Broken", val:-(stats.brokenCount*5), pos:stats.brokenCount===0},
                    {label:lang==="ko"?"💸 입장료":"💸 Admission", val:fee>maxFee?-5:0, pos:fee<=maxFee},
                    {label:lang==="ko"?"🚶 혼잡도":"🚶 Crowd", val:congestedCells.size>0?-8:0, pos:congestedCells.size===0},
                    {label:lang==="ko"?"📉 자연 감소":"📉 Natural", val:-0.2, pos:false},
                  ].map(({label,val,pos})=>(
                    <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"1.5px 0",gap:8}}>
                      <span style={{fontSize:9,color:"#5A6A8A"}}>{label}</span>
                      <span style={{fontSize:10,fontWeight:700,color:pos?"#00E5A0":"#FF5757",fontFamily:"'Barlow Condensed',sans-serif",flexShrink:0}}>
                        {val>0?"+":""}{val}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        {/* 방문객 공식 breakdown 패널 */}
        {showVisBreakdown && visitorFactors && (
          <div style={{
            background:"rgba(10,15,40,0.95)",
            border:"1px solid rgba(77,159,255,0.3)",
            borderRadius:8, padding:"10px 14px",
            margin:"0 12px 4px",
            backdropFilter:"blur(8px)",
            animation:"slide-in 0.2s ease",
          }}>
            <div style={{fontSize:10,fontWeight:700,color:"#4D9FFF",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>
              👥 {lang==="ko"?"방문객 예상 공식":"Visitor Forecast"}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 16px"}}>
              {[
                {label:lang==="ko"?"⭐ 어트랙션 점수":"⭐ Attraction", val:visitorFactors.attraction, unit:"pts"},
                {label:lang==="ko"?"🌱 기본 예상":"🌱 Base Estimate", val:visitorFactors.baseVis, unit:"명", highlight:true},
                {label:lang==="ko"?"☀️ 날씨 보정":"☀️ Weather", val:`×${visitorFactors.weatherMult}`, unit:""},
                {label:lang==="ko"?"📅 계절 보정":"📅 Season", val:`×${visitorFactors.seasonMult}`, unit:""},
                {label:lang==="ko"?"😊 만족도":"😊 Happiness", val:`×${visitorFactors.satMult}`, unit:""},
                {label:lang==="ko"?"💸 요금 효율":"💸 Fee Eff.", val:`×${visitorFactors.feeMult}`, unit:""},
                ...(visitorFactors.campBoost>0?[{label:lang==="ko"?"📣 캠페인":"📣 Campaign", val:`+${visitorFactors.campBoost}%`, unit:""}]:[]),
              ].map(({label,val,unit,highlight})=>(
                <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"2px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                  <span style={{fontSize:9,color:"#5A6A8A"}}>{label}</span>
                  <span style={{fontSize:10,fontWeight:700,color:highlight?"#4D9FFF":"#8899CC",fontFamily:"'Barlow Condensed',sans-serif"}}>
                    {val}{unit&&<span style={{fontSize:8,color:"#3A4A6A",marginLeft:2}}>{unit}</span>}
                  </span>
                </div>
              ))}
            </div>
            <div style={{marginTop:8,paddingTop:6,borderTop:"1px solid rgba(77,159,255,0.2)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:10,color:"#6B7CA1"}}>{lang==="ko"?"최종 예상 방문객":"Estimated Visitors"}</span>
              <span style={{fontSize:16,fontWeight:900,color:"#4D9FFF",fontFamily:"'Barlow Condensed',sans-serif"}}>
                ~{visitorFactors.estimated}<span style={{fontSize:10,color:"#3A5A8A",marginLeft:3}}>{lang==="ko"?"명/틱":"per tick"}</span>
              </span>
            </div>
          </div>
        )}
      </div>

      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        {isMobile && !panelCollapsed && (
          <div onClick={() => setPanelCollapsed(true)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:49}} />
        )}
        <div className="side-panel" style={isMobile ? {position:"fixed",top:0,left:0,bottom:0,width:230,zIndex:50,transform:panelCollapsed?"translateX(-100%)":"translateX(0)",transition:"transform 0.25s ease",background:"linear-gradient(180deg,#090C20 0%,#070919 100%)",borderRight:"1px solid rgba(100,120,255,0.10)",boxShadow:"4px 0 20px rgba(0,0,0,0.3)",display:"flex",flexDirection:"column",overflowY:"auto"} : {width:panelCollapsed?0:190,minWidth:panelCollapsed?0:190,overflow:panelCollapsed?"hidden":"visible",transition:"width 0.2s",background:"linear-gradient(180deg,#090C20 0%,#070919 100%)",borderRight:"1px solid rgba(100,120,255,0.10)",boxShadow:"4px 0 20px rgba(0,0,0,0.3)",display:"flex",flexDirection:"column",flexShrink:0}}>
          <div style={{display:"flex",background:"rgba(0,0,0,0.3)",borderBottom:"1px solid rgba(255,255,255,0.06)",flexShrink:0,flexWrap:"wrap"}}>
            {[
              {k:"build",    ic:"🏗️", label:{ko:"건설",en:"Build"}},
              {k:"manage",   ic:"⚙️", label:{ko:"경영",en:"Mgmt"}},
              {k:"finance",  ic:"💰", label:{ko:"재무",en:"Fin"}},
              {k:"marketing",ic:"📣", label:{ko:"마케팅",en:"Mkt"}},
              {k:"research", ic:"🔬", label:{ko:"연구",en:"R&D"}},
              {k:"mission",  ic:"🎯", label:{ko:"미션",en:"Quest"}},
            ].map(({k,ic,label})=>(
              <button key={k} style={{flex:"1 1 30%",minWidth:0,padding:"5px 2px",background:tab===k?"rgba(255,255,255,0.08)":"transparent",border:"none",borderBottom:`2px solid ${tab===k?sc:"transparent"}`,color:tab===k?sc:"#3A4A70",cursor:"pointer",fontFamily:"inherit",fontWeight:tab===k?700:400,transition:"all 0.15s",position:"relative",display:"flex",flexDirection:"column",alignItems:"center",gap:1}} onClick={()=>setTab(k)}>
                <span style={{fontSize:13}}>{ic}</span>
                <span style={{fontSize:9,lineHeight:1}}>{label[lang]||label.ko}</span>
                {k==="research"&&hasResearchAvailable&&<div style={{position:"absolute",top:2,right:4,width:6,height:6,borderRadius:"50%",background:"#00E5A0",boxShadow:"0 0 4px #00E5A0"}}/>}
              </button>
            ))}
          </div>

          <div style={{flex:1,overflowY:"auto",padding:"5px 7px"}}>

            {tab==="build"&&<>
              <div style={{display:"flex",gap:2,marginBottom:4}}>
                {[["build","🏗️","tab.build"],["zone","🎨","zone"],["demolish","🔨","demolish"],["map","🗺️","map"]].map(([m,ic,lk])=>{
                  const label=lk==="tab.build"?t("tab.build"):lk==="zone"?(lang==="ko"?"구역":"Zone"):lk==="demolish"?(lang==="ko"?"철거":"Demo"):t("map.land");
                  const active=buildMode===m;
                  const col=m==="demolish"?"#FF6B6B":sc;
                  return(<button key={m} style={{flex:1,padding:"3px 0",background:active?(m==="demolish"?"#FF6B6B18":"#1E1E40"):"#181830",border:`1px solid ${active?col:"#2A2A4A"}`,color:active?col:"#6666AA",borderRadius:4,cursor:"pointer",fontSize:10,fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:1}} onClick={()=>{setBuildMode(m);setSelected(null);if(m!=="zone")setZonePaint(null);setMultiSelectedCells(new Set());}}>
                    <span style={{fontSize:11}}>{ic}</span>
                    <span>{label}</span>
                  </button>);
                })}
              </div>

              {buildMode==="demolish"&&<div style={{padding:"6px 5px",background:"#FF6B6B0D",border:"1px solid #FF6B6B33",borderRadius:5,marginBottom:4,textAlign:"center"}}>
                <div style={{fontSize:13,marginBottom:2}}>🔨</div>
                <div style={{fontSize:10,color:"#FF6B6B",fontWeight:700}}>{lang==="ko"?"철거 모드":"Demolish Mode"}</div>
                <div style={{fontSize:10,color:"#FF8888",marginTop:2}}>{lang==="ko"?"건물 클릭 → 선택, 다중 선택 가능":"Click to select, multi-select allowed"}</div>
                {multiSelectedCells.size>0&&<>
                  <div style={{fontSize:10,color:"#FF6B6B",marginTop:4}}>{lang==="ko"?`${multiSelectedCells.size}개 선택됨`:`${multiSelectedCells.size} selected`}</div>
                  <button style={{marginTop:4,width:"100%",padding:"5px 0",background:"rgba(255,87,87,0.18)",border:"2px solid rgba(255,87,87,0.5)",color:"#FF5757",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"inherit"}}
                    onClick={()=>{
                      let totalRefund=0;
                      setGrid(prev=>{const n=prev.map(row=>[...row]);multiSelectedCells.forEach(key=>{const[r,c]=key.split(",").map(Number);if(n[r][c]){if(!n[r][c].ref) totalRefund+=Math.floor(B[n[r][c].type].baseCost*0.4);n[r][c]=null;}});return n;});
                      setMoney(m=>m+totalRefund);
                      addLog(lang==="ko"?`🔨 ${multiSelectedCells.size}개 건물 철거 완료 (+$${totalRefund.toLocaleString()})`:`🔨 Demolished ${multiSelectedCells.size} buildings (+$${totalRefund.toLocaleString()})`);
                      setMultiSelectedCells(new Set());
                      if(soundOn) playSound("demolish");
                    }}>
                    {lang==="ko"?`🔨 전체 철거 (${multiSelectedCells.size})`:`🔨 Demolish All (${multiSelectedCells.size})`}
                  </button>
                </>}
              </div>}
              {buildMode==="build"&&<>
                {selected?<div style={{display:"flex",gap:2,marginBottom:3}}>
                  <button style={{flex:1,background:"#FF6B6B0E",border:"1px solid #FF6B6B44",color:"#FF6B6B",borderRadius:4,padding:3,cursor:"pointer",fontSize:10,fontFamily:"inherit"}} onClick={()=>setSelected(null)}>{t("bld.cancel", { name: t(`b.${selected}`) })}</button>
                </div>:<div style={{fontSize:10,color:"#3A4488",textAlign:"center",padding:"2px",background:"#14142A",borderRadius:3,marginBottom:3}}>{t("bld.hint")}</div>}
                {/* 클릭된 건물 패널을 목록 상단에 표시 */}
                {!selected&&clickedTile?.cell&&(()=>{
                  const{r,c,cell}=clickedTile,bd=B[cell.type];
                  const st=bd.stats(cell.level),upCost=cell.level<2?bd.upgradeCost[cell.level]:null;
                  const nextSt=cell.level<2?bd.stats(cell.level+1):null;
                  const attrDelta=nextSt?Math.round(nextSt.attraction-st.attraction):0;
                  const maintDelta=nextSt?Math.round(nextSt.maintenance-st.maintenance):0;
                  const capDelta=nextSt&&nextSt.cap>0?(nextSt.cap-st.cap):0;
                  const rpc=Math.max(500,Math.floor(bd.baseCost*0.15));
                  const anyPaths2=grid.some(r=>r.some(c=>c?.type==="_path"||c?.type==="_pathFancy"));
                  const reach3=anyPaths2?getReachablePaths(grid):new Set();
                  const ok3=bd.cat==="path"||bd.cat==="deco"||!anyPaths2||hasPath(reach3,r,c);
                  return(<div style={{marginBottom:8,padding:10,background:`linear-gradient(135deg,${bd.color}0A,rgba(255,255,255,0.02))`,border:`2px solid ${cell.broken?"rgba(255,87,87,0.4)":bd.color+"66"}`,borderRadius:10,boxShadow:`0 2px 12px ${cell.broken?"rgba(255,87,87,0.2)":bd.color+"22"}`}}>
                    {cell.broken&&<div style={{fontSize:10,color:"#FF5757",marginBottom:4,fontWeight:600}}>🔧 수리비: ${rpc.toLocaleString()}</div>}
                    {!ok3&&!cell.broken&&<div style={{fontSize:10,color:"#FF9F43",marginBottom:3,background:"rgba(255,159,67,0.08)",borderRadius:3,padding:"2px 5px"}}>{t("bld.pathNote")}</div>}
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                      <div style={{width:32,height:32,borderRadius:8,background:`${bd.color}22`,border:`1px solid ${bd.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,filter:cell.broken?"grayscale(1) opacity(0.4)":"none"}}>{bd.emoji}</div>
                      <div>
                        <div style={{fontSize:11,fontWeight:800,color:"var(--text-primary)"}}>{t(`b.${cell.type}`)}</div>
                        <div style={{display:"inline-block",fontSize:10,padding:"1px 6px",background:`${bd.color}22`,border:`1px solid ${bd.color}55`,borderRadius:4,color:bd.color,fontWeight:700,marginTop:1}}>Lv{cell.level+1}</div>
                      </div>
                      <button style={{marginLeft:"auto",fontSize:10,color:"#4A5880",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}} onClick={()=>setClickedTile(null)}>✕</button>
                    </div>
                    <div style={{fontSize:10,color:"#6B7CA1",marginBottom:6}}>
                      ⭐{Math.round(st.attraction)}{st.maintenance>0&&<> · 💰-${Math.round(st.maintenance)}</>}{st.cap>0&&<> · 👥{st.cap}</>}
                    </div>
                    {upCost&&nextSt&&<div style={{display:"flex",gap:6,marginBottom:3,padding:"3px 6px",background:"rgba(255,255,255,0.03)",borderRadius:4,fontSize:10,color:"#6B7CA1"}}>
                      <span style={{color:"#AABBFF"}}>Lv{cell.level+2}:</span>
                      {attrDelta>0&&<span>⭐+{attrDelta}</span>}
                      {maintDelta>0&&<span style={{color:"#FF9F43"}}>💰+${maintDelta}</span>}
                      {capDelta>0&&<span>👥+{capDelta}</span>}
                      {nextSt.rpv>st.rpv&&<span style={{color:"#5EF6A0"}}>💵+{Math.round(nextSt.rpv-st.rpv)}</span>}
                    </div>}
                    <div style={{display:"flex",gap:3}}>
                      {cell.broken
                        ?<button style={{flex:2,padding:"5px 0",background:money>=rpc?"rgba(255,159,67,0.15)":"transparent",border:`1px solid ${money>=rpc?"rgba(255,159,67,0.6)":"rgba(255,255,255,0.08)"}`,color:money>=rpc?"#FF9F43":"#2E3A5C",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"inherit"}} onClick={repairBuilding}>{t("bld.repair",{cost:`$${rpc.toLocaleString()}`})}</button>
                        :cell.level<2&&upCost>0
                        ?<button style={{flex:2,padding:"5px 0",background:money>=upCost?`${bd.color}22`:"transparent",border:`1px solid ${money>=upCost?bd.color+"77":"rgba(255,255,255,0.08)"}`,color:money>=upCost?bd.color:"#2E3A5C",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"inherit"}} onClick={upgradeBuilding}>{t("bld.upgrade",{cost:`$${upCost.toLocaleString()}`})}</button>
                        :<div style={{flex:2,fontSize:10,color:"#00E5A0",fontWeight:700,display:"flex",alignItems:"center"}}>✅ {t("bld.max")}</div>}
                      <button style={{flex:1,padding:"5px 0",background:"rgba(255,87,87,0.1)",border:"1px solid rgba(255,87,87,0.4)",color:"#FF5757",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"inherit"}} onClick={demolish}>🔨</button>
                    </div>
                  </div>);
                })()}
                {/* 카테고리 퀵점프 아이콘 바 */}
                <div style={{display:"flex",gap:2,marginBottom:6,background:"rgba(0,0,0,0.3)",borderRadius:6,padding:3}}>
                  {[["🎠","ride",t("cat.ride")],["🍔","shop",t("cat.shop")],["🌿","facility",t("cat.facility")],["🛤️","path",t("cat.path")],["🌸","deco",t("cat.deco")]].map(([ic,cat,lbl])=>{
                    const hasItems=[...rideList,...shopList,...facilList,...pathList,...decoList].filter(([,b])=>b.cat===cat).length>0;
                    if(!hasItems) return null;
                    return(
                      <button key={cat} title={lbl} onClick={()=>{
                        const el=document.querySelector(`[data-cat="${cat}"]`);
                        el?.scrollIntoView({behavior:"smooth",block:"nearest"});
                      }} style={{flex:1,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:4,padding:"3px 2px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:1,fontFamily:"inherit",transition:"all 0.15s"}}
                        onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.1)";}}
                        onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";}}>
                        <span style={{fontSize:13}}>{ic}</span>
                      </button>
                    );
                  })}
                </div>
                {[[t("cat.ride"),"ride",rideList],[t("cat.shop"),"shop",shopList],[t("cat.facility"),"facility",facilList],[t("cat.path"),"path",pathList],[t("cat.deco"),"deco",decoList]].map(([lbl,cat,list])=>(
                  <div key={lbl} data-cat={cat}>
                    <div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#4A5880",margin:"8px 0 4px",paddingLeft:4,borderLeft:"2px solid rgba(255,255,255,0.15)"}}>{lbl}</div>
                    {list.map(([id,bd])=>{
                      const isLocked=bd.locked&&!researched.includes("r4")&&gameMode!=="sandbox";
                      const ok=money>=bd.baseCost&&!isLocked,sel=selected===id;
                      const isBldHov=hovered===id;
                      const isTutTarget=(tutorialStep===1&&id==="entrance")||
                                        (tutorialStep===2&&(id==="_path"||id==="_pathFancy"))||
                                        (tutorialStep===3&&["ferrisWheel","carousel","thrillRide","miniTrain"].includes(id));
                      const baseShadow=sel?`0 0 12px ${bd.color}22, inset 0 0 12px ${bd.color}08`:"none";
                      return(<div key={id} onMouseEnter={()=>setHovered(id)} onMouseLeave={()=>setHovered(null)}>
                        <div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 8px",marginBottom:isBldHov?0:2,background:sel?`${bd.color}18`:"rgba(255,255,255,0.03)",border:sel?`1px solid ${bd.color}88`:`1px solid ${bd.color}22`,borderLeft:sel?`3px solid ${bd.color}`:`3px solid ${bd.color}66`,borderRadius:isBldHov?"6px 6px 0 0":6,cursor:ok?"pointer":isLocked?"not-allowed":"default",opacity:isLocked?0.35:ok?1:0.35,transition:"all 0.12s",outline:isTutTarget?"2px solid #FFD93D":"none",outlineOffset:isTutTarget?2:0,animation:isTutTarget?"pulse 1.5s infinite":"none",boxShadow:isTutTarget?`0 0 20px rgba(255,217,61,0.6), ${baseShadow}`:baseShadow}} onClick={()=>ok&&setSelected(sel?null:id)}>
                          <div style={{width:28,height:28,borderRadius:6,background:`${bd.color}18`,border:`1px solid ${bd.color}33`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,overflow:"hidden"}}>
                            {hasBuildingIcon(id)
                              ? getBuildingIcon(id, bd.color, 22)
                              : <span style={{fontSize:15}}>{bd.emoji}</span>}
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:10,fontWeight:700,color:"var(--text-primary)",lineHeight:1.2}}>{t(`b.${id}`)}{isLocked?" 🔒":""}</div>
                            <div style={{fontSize:10,fontWeight:600,color:money>=bd.baseCost?"#FFD93D":"#FF5757",fontFamily:"'Barlow Condensed',monospace"}}>{bd.baseCost===0?t("bld.free"):`$${bd.baseCost.toLocaleString()}`}</div>
                          </div>
                          {bd.stats(0).attraction>0&&<span style={{fontSize:10,padding:"1px 5px",background:"rgba(255,217,61,0.12)",border:"1px solid rgba(255,217,61,0.3)",borderRadius:4,color:"#FFD93D",fontWeight:700,fontFamily:"'Barlow Condensed',monospace",flexShrink:0}}>⭐{bd.stats(0).attraction}</span>}
                        </div>
                        {isBldHov&&<div style={{background:"#1A1A3A",borderRadius:"0 0 5px 5px",padding:"4px 6px",marginBottom:2,fontSize:10,color:"#C7B8EA",lineHeight:1.6,border:`1px solid ${bd.color}22`,borderTop:"none"}}>
                          {bd.stats(0).attraction>0&&<div>⭐ 어트랙션 +{bd.stats(0).attraction}</div>}
                          {bd.stats(0).maintenance>0&&<div>🔧 유지비 ${bd.stats(0).maintenance}/일</div>}
                          {bd.stats(0).satBonus>0&&<div>😊 만족도 +{bd.stats(0).satBonus}</div>}
                          {bd.stats(0).rpv>0&&<div>💰 수익/방문객 +{bd.stats(0).rpv}</div>}
                          {bd.stats(0).cap>0&&<div>👥 수용인원 +{bd.stats(0).cap}</div>}
                        </div>}
                      </div>);
                    })}
                  </div>
                ))}
                {clickedTile?.cell&&(()=>{
                  const{r,c,cell}=clickedTile,bd=B[cell.type];
                  const st=bd.stats(cell.level),upCost=cell.level<2?bd.upgradeCost[cell.level]:null;
                  const nextSt=cell.level<2?bd.stats(cell.level+1):null;
                  const attrDelta=nextSt?Math.round(nextSt.attraction-st.attraction):0;
                  const maintDelta=nextSt?Math.round(nextSt.maintenance-st.maintenance):0;
                  const capDelta=nextSt&&nextSt.cap>0?(nextSt.cap-st.cap):0;
                  const rpc=Math.max(500,Math.floor(bd.baseCost*0.15));
                  const anyPaths=grid.some(r=>r.some(c=>c?.type==="_path"||c?.type==="_pathFancy"));
                  const reach2=anyPaths?getReachablePaths(grid):new Set();
                  const ok2=bd.cat==="path"||bd.cat==="deco"||!anyPaths||hasPath(reach2,r,c);
                  // 패널을 항상 최상단에 표시 (sticky)
                  return(<div style={{marginBottom:8,padding:10,background:"linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))",border:`2px solid ${cell.broken?"rgba(255,87,87,0.4)":bd.color+"55"}`,borderRadius:10,backdropFilter:"blur(4px)",boxShadow:`0 4px 16px ${cell.broken?"rgba(255,87,87,0.15)":bd.color+"22"}`}}>
                    {cell.broken&&<div style={{fontSize:10,color:"#FF5757",marginBottom:4,fontWeight:600}}>{t("log.broken", { cost: rpc.toLocaleString() })}</div>}
                    {!ok2&&!cell.broken&&<div style={{fontSize:10,color:"#FF9F43",marginBottom:3}}>{t("bld.pathNote")}</div>}
                    <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:6}}>
                      <span style={{fontSize:18,filter:cell.broken?"grayscale(1) opacity(0.4)":"none"}}>{bd.emoji}</span>
                      <div><div style={{fontSize:12,fontWeight:800,color:"var(--text-primary)"}}>{t(`b.${cell.type}`)}</div><div style={{display:"inline-block",fontSize:10,padding:"2px 7px",background:`${bd.color}22`,border:`1px solid ${bd.color}66`,borderRadius:4,color:bd.color,fontWeight:700,marginTop:2}}>Lv{cell.level+1}</div></div>
                    </div>
                    <div style={{fontSize:10,color:"#6B7CA1",marginBottom:6}}>
                      {t("met.attraction")} <b style={{color:"#FFD93D"}}>{Math.round(st.attraction)}</b>
                      {st.maintenance>0&&<> · -<b style={{color:"#FF5757"}}>${Math.round(st.maintenance)}</b></>}
                      {st.cap>0&&<> · {t("mgr.limit")} <b style={{color:"#4D9FFF"}}>{st.cap}</b></>}
                    </div>
                    {upCost&&nextSt&&<div style={{display:"flex",gap:6,marginBottom:3,padding:"3px 6px",background:"rgba(255,255,255,0.03)",borderRadius:4,fontSize:10,color:"#6B7CA1"}}>
                      <span style={{color:"#AABBFF"}}>Lv{cell.level+2}:</span>
                      {attrDelta>0&&<span>⭐+{attrDelta}</span>}
                      {maintDelta>0&&<span style={{color:"#FF9F43"}}>💰+${maintDelta}</span>}
                      {capDelta>0&&<span>👥+{capDelta}</span>}
                      {nextSt.rpv>st.rpv&&<span style={{color:"#5EF6A0"}}>💵+{Math.round(nextSt.rpv-st.rpv)}</span>}
                    </div>}
                    <div style={{display:"flex",gap:3}}>
                      {cell.broken?<button style={{flex:2,padding:"5px 0",background:money>=rpc?`linear-gradient(135deg,rgba(255,159,67,0.15),rgba(255,159,67,0.05))`:"transparent",border:`1px solid ${money>=rpc?"rgba(255,159,67,0.5)":"rgba(255,255,255,0.08)"}`,color:money>=rpc?"#FF9F43":"#2E3A5C",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"inherit"}} onClick={repairBuilding}>{t("bld.repair", { cost: `$${rpc.toLocaleString()}` })}</button>
                      :cell.level<2&&upCost>0?<button style={{flex:2,padding:"5px 0",background:money>=upCost?`linear-gradient(135deg,${bd.color}22,${bd.color}0A)`:"transparent",border:`1px solid ${money>=upCost?bd.color+"66":"rgba(255,255,255,0.08)"}`,color:money>=upCost?bd.color:"#2E3A5C",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"inherit",boxShadow:money>=upCost?`0 2px 8px ${bd.color}22`:"none"}} onClick={upgradeBuilding}>{t("bld.upgrade", { cost: `$${upCost.toLocaleString()}` })}</button>
                      :<div style={{flex:2,fontSize:10,color:"#00E5A0",display:"flex",alignItems:"center",fontWeight:700}}>{t("bld.max")}</div>}
                      <button style={{flex:1,padding:"5px 0",background:"rgba(255,87,87,0.08)",border:"1px solid rgba(255,87,87,0.3)",color:"#FF5757",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"inherit"}} onClick={demolish}>{t("bld.demolish").split(" ")[0]}</button>
                    </div>
                    {/* Phase 2-5: Franchise UI for shop buildings */}
                    {bd.cat==="shop"&&FRANCHISES[cell.type]&&(()=>{
                      const key=`${r},${c}`;
                      const activeFid=buildingFranchises[key];
                      const activeFdata=activeFid?FRANCHISES[cell.type].find(f=>f.id===activeFid):null;
                      return(<div style={{marginTop:4,borderTop:"1px solid #2A2A4A",paddingTop:4}}>
                        <div style={{fontSize:10,color:"#FF9FF3",letterSpacing:1,marginBottom:3}}>🏪 {lang==="ko"?"프랜차이즈":"Franchise"}{activeFdata?`: ${activeFdata.name[lang]||activeFdata.name.ko}`:""}</div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:2}}>
                          {activeFdata&&<button style={{fontSize:10,background:"#FF6B6B11",border:"1px solid #FF6B6B44",color:"#FF6B6B",borderRadius:3,padding:"2px 4px",cursor:"pointer",fontFamily:"inherit"}} onClick={()=>removeFranchise(r,c)}>✕ {lang==="ko"?"제거":"Remove"}</button>}
                          {FRANCHISES[cell.type].map(f=>(
                            <button key={f.id} style={{fontSize:10,background:activeFid===f.id?"#FF9FF322":"#1A1A2A",border:`1px solid ${activeFid===f.id?"#FF9FF3":"#2A2A4A"}`,color:activeFid===f.id?"#FF9FF3":money>=f.cost||f.cost===0?"#C7B8EA":"#3A3A5A",borderRadius:3,padding:"2px 4px",cursor:(money>=f.cost||f.cost===0)&&activeFid!==f.id?"pointer":"default",fontFamily:"inherit"}} onClick={()=>{if(activeFid!==f.id) applyFranchise(r,c,f.id);}}>
                              {f.emoji} {f.name[lang]||f.name.ko}{f.cost>0?` $${f.cost.toLocaleString()}`:""}
                            </button>
                          ))}
                        </div>
                      </div>);
                    })()}
                    <button style={{fontSize:10,color:"#4444AA",background:"none",border:"none",cursor:"pointer",padding:"3px 0 0",fontFamily:"inherit"}} onClick={()=>setClickedTile(null)}>✕</button>
                  </div>);
                })()}
              </>}

              {buildMode==="zone"&&<>
                {/* Synergy info panel */}
                {(()=>{
                  const allZones=new Set();
                  for(let r=0;r<zoneGrid.length;r++) for(let c=0;c<zoneGrid[0].length;c++) if(zoneGrid[r][c]) allZones.add(zoneGrid[r][c]);
                  const divBonus=allZones.size>=4?15:allZones.size>=3?8:allZones.size>=2?3:0;
                  return allZones.size>0&&(<div style={{padding:"5px 6px",background:"rgba(162,155,254,0.08)",border:"1px solid rgba(162,155,254,0.2)",borderRadius:5,marginBottom:6}}>
                    <div style={{fontSize:10,color:"#A29BFE",fontWeight:700,marginBottom:2}}>⚡ {lang==="ko"?"구역 시너지":"Zone Synergy"}</div>
                    <div style={{fontSize:9,color:"#8888AA"}}>{lang==="ko"?`활성 구역 ${allZones.size}종 → 다양성 보너스 +${divBonus}%`:`${allZones.size} zone types → Diversity +${divBonus}%`}</div>
                    <div style={{fontSize:9,color:"#666688",marginTop:2}}>{lang==="ko"?"💡 3칸 이상 연결해야 구역 효과 활성화":"💡 Connect 3+ cells to activate zone bonus"}</div>
                    <div style={{fontSize:9,color:"#666688"}}>{lang==="ko"?"6칸+: 1.5배, 10칸+: 2배":"6+ cells: 1.5x, 10+ cells: 2x bonus"}</div>
                  </div>);
                })()}
                {[...Object.entries(ZONES),["clear",{emoji:"🚫",color:"#666688",bg:"#66668818"}]].map(([k,z])=>(
                  <div key={k} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 5px",marginBottom:2,background:zonePaint===k?z.bg:"#181830",border:`1px solid ${zonePaint===k?z.color:z.color+"33"}`,borderRadius:5,cursor:"pointer"}} onClick={()=>setZonePaint(zonePaint===k?null:k)}>
                    <span style={{fontSize:13}}>{z.emoji}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:10,fontWeight:700,color:z.color}}>{t(`z.${k}`)}</div>
                      <div style={{fontSize:9,color:"#666688"}}>{t(`z.${k}.desc`)}</div>
                      {k!=="clear"&&<div style={{fontSize:9,color:"#444466"}}>{lang==="ko"?"3칸↑활성·6칸↑1.5x·10칸↑2x":"3+:active·6+:1.5x·10+:2x"}</div>}
                    </div>
                    {zonePaint===k&&<span style={{color:z.color}}>●</span>}
                  </div>
                ))}
                {/* Cross-zone bonus hints */}
                <div style={{padding:"4px 5px",background:"rgba(0,0,0,0.2)",borderRadius:4,marginTop:4}}>
                  <div style={{fontSize:9,color:"#444466",marginBottom:2}}>{lang==="ko"?"인접 구역 시너지":"Adjacent Zone Synergy"}</div>
                  {[
                    {a:"🎢",b:"🍔",desc:lang==="ko"?"스릴+푸드 → 매출↑12%":"Thrill+Food → Rev↑12%"},
                    {a:"⭐",b:"🌳",desc:lang==="ko"?"VIP+자연 → 매력·매출↑10%":"VIP+Nature → Attr·Rev↑10%"},
                    {a:"🌳",b:"👨‍👩‍👧",desc:lang==="ko"?"자연+가족 → 만족도↑15%":"Nature+Family → Sat↑15%"},
                  ].map(({a,b,desc})=>(
                    <div key={a+b} style={{fontSize:9,color:"#556688",padding:"1px 0"}}>{a}+{b}: {desc}</div>
                  ))}
                </div>
              </>}

              {buildMode==="map"&&<>
                <div style={{fontSize:10,color:"#A29BFE",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>{t("map.land")} ({ownedCount})</div>
                {PARCELS.map(p=>{const owned=parcels.includes(p.id),reqOk=!p.req||parcels.includes(p.req);return(<div key={p.id} style={{display:"flex",alignItems:"center",gap:4,padding:5,marginBottom:3,background:"#181828",border:`1px solid ${owned?"#A29BFE33":"#222238"}`,borderRadius:5,opacity:owned?0.5:1}}>
                  <div style={{fontSize:18}}>{owned?"✅":p.icon}</div>
                  <div style={{flex:1}}><div style={{fontSize:10,fontWeight:700}}>{p.label}</div><div style={{fontSize:10,color:"#8888AA"}}>${p.cost.toLocaleString()}</div></div>
                  {!owned&&<button style={{background:reqOk&&money>=p.cost?"#A29BFE11":"transparent",border:`1px solid ${reqOk&&money>=p.cost?"#A29BFE":"#2A2A4A"}`,color:reqOk&&money>=p.cost?"#A29BFE":"#3A3A5A",borderRadius:4,padding:"3px 5px",cursor:reqOk&&money>=p.cost?"pointer":"default",fontSize:10,fontFamily:"inherit"}} onClick={()=>buyParcel(p)}>{t("map.buy")}</button>}
                </div>);})}
              </>}
            </>}

            {tab==="manage"&&<>
              <div style={{background:"#0C1128",border:"1px solid #FFD93D33",borderRadius:8,padding:8,marginBottom:8}}>
                <div style={{fontSize:10,fontWeight:700,color:"#FFD93D",marginBottom:5}}>😊 만족도 영향 요인</div>
                {[
                  {label:"🏗️ 시설 보너스", val:+stats.satBonus.toFixed(1), pos:true},
                  {label:"☀️ 날씨", val:weather.satMod, pos:weather.satMod>=0},
                  {label:"🔧 고장 시설", val:-(stats.brokenCount*5), pos:stats.brokenCount===0},
                  {label:"💸 입장료", val:fee>maxFee?-5:0, pos:fee<=maxFee},
                  {label:"🚶 혼잡도", val:congestedCells.size>0?-8:0, pos:congestedCells.size===0},
                  {label:"📉 자연 감소", val:-0.3, pos:false},
                ].map(({label,val,pos})=>(
                  <div key={label} style={{display:"flex",justifyContent:"space-between",fontSize:10,padding:"2px 0",borderBottom:"1px solid #1A1A30"}}>
                    <span style={{color:"#8888AA"}}>{label}</span>
                    <span style={{color:pos?"#00E5A0":"#FF5757",fontWeight:700}}>{val>0?"+":""}{val}</span>
                  </div>
                ))}
              </div>
              <div style={{background:"#1A1A2A",border:"1px solid #FECA5733",borderRadius:6,padding:8,marginBottom:7}}>
                <div style={{fontSize:10,color:"#FECA57",letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>🎟️ {t("mgr.admission")} {fee>maxFee&&<span style={{color:"#FF4757"}}>⚠️ ${maxFee} {t("mgr.limit")}</span>}</div>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                  <button style={{...pm,width:26,height:26,fontSize:13,borderColor:"#FECA5744",color:"#FECA57"}} onClick={()=>setFee(f=>Math.max(0,f-5))}>−</button>
                  <div style={{flex:1,textAlign:"center"}}><div style={{fontSize:22,fontWeight:900,color:fee>maxFee?"#FF4757":"#FECA57",lineHeight:1}}>${fee}</div></div>
                  <button style={{...pm,width:26,height:26,fontSize:13,borderColor:"#FECA5744",color:"#FECA57"}} onClick={()=>setFee(f=>Math.min(gameMode==="sandbox"?999:70,f+5))}>+</button>
                </div>
              </div>
              <div style={{fontSize:10,color:"#FECA57",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>{t("mgr.staff")}</div>
              {Object.entries(STAFF).map(([k,s])=>{
                const lv=staffLevels[k];
                const nextUpg=lv<3?STAFF_UPGRADES[k][lv]:null;
                const curUpg=STAFF_UPGRADES[k][lv-1];
                return(<div key={k} style={{marginBottom:4,background:"#181828",border:"1px solid #222238",borderRadius:5,overflow:"hidden"}}>
                  <div style={{display:"flex",alignItems:"center",gap:5,padding:5}}>
                    <div style={{fontSize:17}}>{s.emoji}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:10,fontWeight:700}}>{t(`st.${k}`)}</div>
                      <div style={{fontSize:10,color:"#FECA57"}}>${s.hire}·${s.daily}/d</div>
                      <div style={{fontSize:10,color:"#A29BFE"}}>Lv.{lv}{lv>1&&curUpg.desc?` ${curUpg.desc[lang]||curUpg.desc.ko}`:""}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:3}}>
                      <button style={pm} onClick={()=>fire(k)}>−</button>
                      <span style={{minWidth:12,textAlign:"center",fontSize:10,fontWeight:700,color:"#FECA57"}}>{hired[k]}</span>
                      <button style={pm} onClick={()=>hire(k)}>+</button>
                    </div>
                  </div>
                  {/* Skill level dots */}
                  <div style={{display:"flex",gap:2,padding:"0 5px 3px",alignItems:"center"}}>
                    {[1,2,3].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:i<=lv?"#A29BFE":"#2A2A4A",boxShadow:i===lv?"0 0 4px #A29BFE":"none"}}/>)}
                    <span style={{fontSize:10,color:"#555577",marginLeft:2}}>Lv{lv}/3</span>
                  </div>
                  {nextUpg&&<button style={{display:"block",width:"100%",background:money>=nextUpg.upgCost?"#A29BFE11":"transparent",border:`1px solid ${money>=nextUpg.upgCost?"#A29BFE44":"#222238"}`,color:money>=nextUpg.upgCost?"#A29BFE":"#3A3A5A",borderRadius:0,padding:"3px 5px",cursor:money>=nextUpg.upgCost?"pointer":"default",fontSize:10,fontFamily:"inherit",textAlign:"left"}} onClick={()=>upgradeStaff(k)}>
                    ⬆️ Lv.{lv+1} {nextUpg.desc?`${nextUpg.desc[lang]||nextUpg.desc.ko} `:""} (${nextUpg.upgCost.toLocaleString()})
                  </button>}
                </div>);
              })}
              <div style={{fontSize:10,color:"#8888AA",textAlign:"right",marginBottom:6}}>{t("mgr.wages")} <span style={{color:"#FF8888"}}>${wages}/d</span></div>
              <div style={{fontSize:10,color:"#FECA57",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>{t("mgr.loan")}</div>
              {LOAN_OPTS.map((opt,i)=>{const daily=Math.ceil(opt.amount*(1+opt.rate)/opt.days);return(<div key={i} style={{display:"flex",alignItems:"center",gap:4,padding:4,marginBottom:2,background:"#181828",border:"1px solid #222238",borderRadius:5}}>
                <div style={{fontSize:14}}>{opt.icon}</div>
                <div style={{flex:1}}><div style={{fontSize:10,fontWeight:700}}>{t(`loan.${opt.id}`)}</div><div style={{fontSize:10,color:"#FF8888"}}>${daily}/d</div></div>
                <button style={{background:"#FECA5711",border:"1px solid #FECA5744",color:"#FECA57",borderRadius:3,padding:"2px 5px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}} onClick={()=>takeLoan(opt)}>{t("mgr.take")}</button>
              </div>);})}
              {loans.map(l=>(<div key={l.id} style={{padding:4,marginBottom:2,background:"#181828",border:"1px solid #FF6B6B22",borderRadius:4}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:10,color:"#FF8888"}}>${l.remaining.toLocaleString()}</span><span style={{fontSize:10,color:"#8888AA"}}>${l.dailyPayment}/d</span></div>
                <div style={{height:3,background:"#1A1A2A",borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",borderRadius:99,background:"#FF6B6B",width:`${Math.max(0,(1-l.remaining/(l.amount*(1+l.rate)))*100)}%`}}/></div>
              </div>))}
            </>}

            {tab==="finance"&&<>
              {visitorFactors&&(
                <div style={{background:"#0A1220",border:"1px solid rgba(77,159,255,0.15)",borderRadius:8,padding:8,marginBottom:8}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#4D9FFF",letterSpacing:1,marginBottom:6}}>
                    📈 {lang==="ko"?"방문객 분석":"Visitor Analysis"}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:3}}>
                    {[
                      {label:lang==="ko"?"어트랙션":"Attraction", pct:Math.min(100,visitorFactors.attraction*2), col:"#FFD93D"},
                      {label:lang==="ko"?"날씨":"Weather", pct:Math.round(visitorFactors.weatherMult*100), col:visitorFactors.weatherMult>=1?"#00E5A0":"#FF5757"},
                      {label:lang==="ko"?"계절":"Season", pct:Math.round(visitorFactors.seasonMult*100), col:"#9B7FFF"},
                      {label:lang==="ko"?"만족도":"Happiness", pct:Math.round(visitorFactors.satMult*100), col:sat>70?"#00E5A0":sat>40?"#FFD93D":"#FF5757"},
                      {label:lang==="ko"?"요금 효율":"Fee Eff.", pct:Math.round(visitorFactors.feeMult*100), col:visitorFactors.feeMult>=1?"#00E5A0":"#FF9F43"},
                    ].map(({label,pct,col})=>(
                      <div key={label}>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:9,marginBottom:1}}>
                          <span style={{color:"#5A6A8A"}}>{label}</span>
                          <span style={{color:col,fontWeight:700}}>{pct}%</span>
                        </div>
                        <div style={{height:3,background:"#0D1530",borderRadius:99,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${Math.min(pct,200)/2}%`,background:col,borderRadius:99,transition:"width 0.5s"}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{marginTop:6,fontSize:10,color:"#4D9FFF",fontWeight:700,textAlign:"right"}}>
                    {lang==="ko"?"예상":"Est."} ~{visitorFactors.estimated}{lang==="ko"?"명/틱":"/tick"}
                  </div>
                </div>
              )}
              {/* 오늘 수익 요약 카드 */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:8}}>
                {[
                  {label:lang==="ko"?"💰 입장료":"💰 Admission",    val:Math.round(revBreak.adm),   col:"#FFD93D"},
                  {label:lang==="ko"?"🎢 어트랙션":"🎢 Rides",      val:Math.round(revBreak.ride),  col:"#FF6B9D"},
                  {label:lang==="ko"?"🍔 상업":"🍔 Shops",          val:Math.round(revBreak.shop),  col:"#48DBFB"},
                  {label:lang==="ko"?"🎫 패스":"🎫 Pass",            val:Math.round(revBreak.pass),  col:"#5EF6A0"},
                  {label:lang==="ko"?"🔧 유지비":"🔧 Maint.",        val:-Math.round(stats.maintenance*diffSettings.maintenanceMult), col:"#FF5757"},
                  {label:lang==="ko"?"👔 인건비":"👔 Wages",         val:-wages,                     col:"#FF9F43"},
                ].map(({label,val,col})=>(
                  <div key={label} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${col}22`,borderRadius:7,padding:"6px 8px",display:"flex",flexDirection:"column",gap:2}}>
                    <div style={{fontSize:9,color:"#4A5880"}}>{label}</div>
                    <div style={{fontSize:14,fontWeight:900,color:val>=0?col:"#FF5757",fontFamily:"'Barlow Condensed',sans-serif"}}>
                      {val>=0?"+":""}{val.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* 예상 일 순이익 강조 */}
              <div style={{background:estNet>=0?"rgba(0,229,160,0.07)":"rgba(255,87,87,0.07)",border:`1px solid ${estNet>=0?"#00E5A0":"#FF5757"}33`,borderRadius:8,padding:"7px 10px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:10,color:"#6B7CA1"}}>{lang==="ko"?"예상 일 순이익":"Est. Daily Profit"}</span>
                <span style={{fontSize:18,fontWeight:900,color:estNet>=0?"#00E5A0":"#FF5757",fontFamily:"'Barlow Condensed',sans-serif"}}>
                  {estNet>=0?"+":""}{estNet.toLocaleString()}
                </span>
              </div>

              <div style={{background:"#1A1A2A",border:"1px solid #A29BFE33",borderRadius:7,padding:8,marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div><div style={{fontSize:10,color:"#A29BFE",letterSpacing:2,textTransform:"uppercase"}}>{t("fin.rating")}</div><div style={{fontSize:10,color:"#555577",marginTop:1}}>{t("fin.weakest")}</div></div>
                  <div style={{textAlign:"right"}}><div style={{fontSize:14}}>{starStr}</div><div style={{fontSize:12,fontWeight:900,color:"#A29BFE"}}>{parkRating.final}pt</div></div>
                </div>
                {[{key:"attraction",label:t("met.attraction"),icon:"🎡",color:"#FF6B9D"},{key:"scenery",label:t("met.scenery"),icon:"🌳",color:"#1DD1A1"},{key:"satisfaction",label:t("met.satisfaction"),icon:"😊",color:"#5EF6A0"},{key:"operations",label:t("met.operations"),icon:"⚙️",color:"#48DBFB"}].map(m=>{
                  const score=Math.round(parkRating.scores[m.key]);
                  const isMin=score===Math.min(...Object.values(parkRating.scores).map(Math.round));
                  return(<div key={m.key} style={{marginBottom:5}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:1}}>
                      <div style={{display:"flex",gap:3,alignItems:"center"}}>
                        <span style={{fontSize:10}}>{m.icon}</span>
                        <span style={{fontSize:10,color:m.color}}>{m.label}</span>
                        {isMin&&<span style={{fontSize:10,color:"#FF4757",background:"#FF475718",borderRadius:2,padding:"0 2px"}}>{t("fin.lowest")}</span>}
                      </div>
                      <span style={{fontSize:10,fontWeight:700,color:m.color}}>{score}</span>
                    </div>
                    <div style={{background:"#0D0D1A",borderRadius:99,overflow:"hidden",height:5}}><div style={{height:"100%",borderRadius:99,background:m.color,width:`${score}%`,transition:"width 0.5s"}}/></div>
                    {score<10&&m.key==="scenery"&&<div style={{fontSize:10,color:"#1DD1A155",marginTop:2}}>💡 {lang==="ko"?"🌸 장식·분수·정원을 배치해보세요":"🌸 Place decorations, fountains or gardens"}</div>}
                    {score<10&&m.key==="attraction"&&<div style={{fontSize:10,color:"#FF6B9D55",marginTop:2}}>💡 {lang==="ko"?"🎡 놀이기구를 추가하세요":"🎡 Add more attractions"}</div>}
                    {score<15&&m.key==="satisfaction"&&<div style={{fontSize:10,color:"#5EF6A055",marginTop:2}}>💡 {lang==="ko"?"🚻 화장실·청소부를 배치하세요":"🚻 Add restrooms & janitors"}</div>}
                  </div>);
                })}
                <div style={{marginTop:5,fontSize:10,color:"#555577",textAlign:"center"}}>💡 {parkRating.stars}★ → {t("mgr.admission")} ${maxFee}</div>
              </div>

              <div style={{background:"#1A1A2A",border:"1px solid #FF9FF333",borderRadius:6,padding:7,marginBottom:7}}>
                <div style={{fontSize:10,color:"#FF9FF3",letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>💡 {t("fin.pricing")}</div>
                {[["admission",t("pm.admission"),"🎟️"],["per_ride",t("pm.per_ride"),"🎡"],["hybrid",t("pm.hybrid"),"💎"]].map(([mode,name,ic])=>(
                  <div key={mode} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 5px",marginBottom:2,background:pricingMode===mode?"#FF9FF318":"#181830",border:`1px solid ${pricingMode===mode?"#FF9FF3":"#222238"}`,borderRadius:5,cursor:"pointer"}} onClick={()=>setPricingMode(mode)}>
                    <span style={{fontSize:12}}>{ic}</span>
                    <span style={{fontSize:10,fontWeight:pricingMode===mode?700:400,color:pricingMode===mode?"#FF9FF3":"#8888AA"}}>{name}</span>
                    {pricingMode===mode&&<span style={{marginLeft:"auto",color:"#FF9FF3",fontSize:10}}>●</span>}
                  </div>
                ))}
              </div>

              {pricingMode!=="admission"&&Object.entries(ridePrices).filter(([k])=>cc[k]>0).length>0&&<>
                <div style={{fontSize:10,color:"#FECA57",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>{t("fin.ridePrices")}</div>
                {Object.entries(ridePrices).filter(([k])=>cc[k]>0).map(([k,price])=>{const bd=B[k];if(!bd) return null;return(<div key={k} style={{display:"flex",alignItems:"center",gap:4,padding:"3px 4px",marginBottom:2,background:"#181828",border:"1px solid #2A2A4A",borderRadius:4}}>
                  <span style={{fontSize:12}}>{bd.emoji}</span>
                  <div style={{flex:1,fontSize:10,fontWeight:700}}>{t(`b.${k}`)}</div>
                  <button style={pm} onClick={()=>setRidePrices(p=>({...p,[k]:Math.max(0,price-1)}))}>−</button>
                  <span style={{fontSize:10,fontWeight:700,color:"#FF9FF3",minWidth:22,textAlign:"center"}}>${price}</span>
                  <button style={pm} onClick={()=>setRidePrices(p=>({...p,[k]:Math.min(20,price+1)}))}>+</button>
                </div>);})}
              </>}

              <div style={{height:1,background:"#2A2A4A",margin:"6px 0"}}/>
              {revPieData.length>0&&<div style={{display:"flex",alignItems:"center",gap:5,marginBottom:6}}>
                <PieChart width={80} height={80}><Pie data={revPieData} cx={40} cy={40} innerRadius={18} outerRadius={38} dataKey="value" strokeWidth={0}>{revPieData.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie><Tooltip contentStyle={{background:"#1A1A2A",border:"1px solid #2A2A4A",fontSize:10,fontFamily:"'Courier New',monospace"}} formatter={v=>`$${Math.round(v).toLocaleString()}`}/></PieChart>
                <div style={{flex:1}}>{revPieData.map((d,i)=><div key={i} style={{display:"flex",gap:4,marginBottom:2,alignItems:"center"}}><div style={{width:5,height:5,borderRadius:"50%",background:d.color}}/><span style={{fontSize:10,color:"#8888AA",flex:1}}>{d.name}</span><span style={{fontSize:10,fontWeight:700,color:d.color}}>${Math.round(d.value).toLocaleString()}</span></div>)}</div>
              </div>}

              {chartData.length>2&&<>
                <div style={{fontSize:10,color:"#FECA57",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>{t("fin.revTrend", { days: chartData.length })}</div>
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={chartData} margin={{top:3,right:3,bottom:0,left:-22}}>
                    <XAxis dataKey="day" tick={{fontSize:10,fill:"#555577"}} tickLine={false} axisLine={false}/>
                    <YAxis tick={{fontSize:10,fill:"#555577"}} tickLine={false} axisLine={false} tickFormatter={v=>v>=1000?`${Math.round(v/1000)}k`:v}/>
                    <Tooltip contentStyle={{background:"#0D1535",border:"1px solid rgba(100,120,255,0.2)",borderRadius:8,fontSize:10}} formatter={v=>`$${Math.round(v).toLocaleString()}`} labelStyle={{color:"#888"}}/>
                    <Line type="monotone" dataKey="revenue" stroke="#FECA57" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="net" stroke="#5EF6A0" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="expenses" stroke="#FF6B6B" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </>}

              <div style={{display:"flex",justifyContent:"space-between",marginTop:5,padding:"4px 0"}}>
                <span style={{fontSize:10,color:"#8888AA"}}>{t("fin.estProfit")}</span>
                <span style={{fontSize:13,fontWeight:900,color:estNet>=0?"#5EF6A0":"#FF6B6B"}}>{estNet>=0?"+":""}${estNet.toLocaleString()}</span>
              </div>

              {/* Phase 2-4: Visitor Ratings */}
              <div style={{background:"#1A1A2A",border:"1px solid #FECA5733",borderRadius:6,padding:7,marginTop:6}}>
                <div style={{fontSize:10,color:"#FECA57",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>⭐ {lang==="ko"?"방문객 평점":"Visitor Ratings"}</div>
                <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
                  <span style={{fontSize:10}}>{[1,2,3,4,5].map(i=>i<=Math.round(avgVisitorRating)?"★":"☆").join("")}</span>
                  <span style={{fontSize:11,fontWeight:900,color:"#FECA57"}}>{avgVisitorRating.toFixed(1)}</span>
                  <span style={{fontSize:10,color:"#555577"}}>/5.0</span>
                  <span style={{fontSize:10,color:"#555577",marginLeft:"auto"}}>({visitorRatings.length})</span>
                </div>
                <div style={{height:4,background:"#0A0A14",borderRadius:99,overflow:"hidden"}}>
                  <div style={{height:"100%",background:avgVisitorRating>=4?"#5EF6A0":avgVisitorRating>=3?"#FECA57":"#FF6B6B",width:`${(avgVisitorRating/5)*100}%`,borderRadius:99,transition:"width 0.5s"}}/>
                </div>
                <div style={{fontSize:10,marginTop:3,display:"flex",alignItems:"center",gap:4}}>
                  {avgVisitorRating>=4.0
                    ?<span style={{color:"#00E5A0",background:"#00E5A018",borderRadius:3,padding:"1px 5px"}}>▲ +10% {lang==="ko"?"방문객 증가":"visitor boost"}</span>
                    :avgVisitorRating<2.5
                    ?<span style={{color:"#FF5757",background:"#FF575718",borderRadius:3,padding:"1px 5px"}}>▼ -10% {lang==="ko"?"방문객 감소":"visitor penalty"}</span>
                    :<span style={{color:"#4A5880",background:"rgba(255,255,255,0.04)",borderRadius:3,padding:"1px 5px"}}>{lang==="ko"?"— 보통 (3.5↑이면 보너스)":"— Neutral (3.5+ for bonus)"}</span>}
                  <span style={{color:"#2E3A5C",fontSize:10}}>({visitorRatings.length}{lang==="ko"?"개 평가":"reviews"})</span>
                </div>
              </div>

              {/* Phase 2-3: Recent Press Reviews */}
              {pressReviews.length>0&&<div style={{background:"#1A1A2A",border:"1px solid #A29BFE33",borderRadius:6,padding:7,marginTop:6}}>
                <div style={{fontSize:10,color:"#A29BFE",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>📰 {lang==="ko"?"최근 언론 평가":"Recent Press Reviews"}</div>
                {pressReviews.slice(-3).reverse().map((r,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:4,padding:"3px 4px",marginBottom:2,background:"#14142A",borderRadius:4}}>
                    <span style={{fontSize:11}}>{r.emoji}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:10,fontWeight:700,color:r.grade==="S"?"#FECA57":r.grade==="A"?"#5EF6A0":r.grade==="B"?"#48DBFB":r.grade==="C"?"#8888AA":"#FF6B6B"}}>{r.grade}{lang==="ko"?"등급":"grade"} · Day {r.day}</div>
                      <div style={{fontSize:10,color:"#666688"}}>{r.headline}</div>
                    </div>
                    <span style={{fontSize:10,color:"#8888AA"}}>{r.score}pt</span>
                  </div>
                ))}
              </div>}

              {/* Phase 2-6: Zone Mastery */}
              <div style={{background:"#1A1A2A",border:"1px solid #1DD1A133",borderRadius:6,padding:7,marginTop:6}}>
                <div style={{fontSize:10,color:"#1DD1A1",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>🎪 Zone Mastery</div>
                {Object.values(zoneMastery).every(zm=>zm.zoneTiles===0)&&(
                  <div style={{textAlign:"center",padding:"6px 0",color:"#2E3A5C",fontSize:10}}>
                    <div style={{fontSize:12,marginBottom:3}}>🎨</div>
                    {lang==="ko"?"건설 탭 → 구역 탭에서 구역을 지정하면 보너스 발동!":"Set zones in Build → Zone tab for bonuses!"}
                  </div>
                )}
                {Object.entries(zoneMastery).map(([ztype,zm])=>{
                  const z=ZONES[ztype];
                  if(zm.zoneTiles===0) return null; // 구역 없으면 숨김
                  return(<div key={ztype} style={{display:"flex",alignItems:"center",gap:4,marginBottom:3}}>
                    <span style={{fontSize:10}}>{z.emoji}</span>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:1}}>
                        <span style={{fontSize:10,color:zm.mastered?"#1DD1A1":z.color}}>{t(`z.${ztype}`)}</span>
                        <span style={{fontSize:10,color:zm.mastered?"#1DD1A1":"#555577"}}>{zm.mastered?`✅ +${Math.round(zm.bonus*100)}%`:`${zm.matchBlds}/${zm.minBld}`}</span>
                      </div>
                      <div style={{height:3,background:"#0A0A14",borderRadius:99,overflow:"hidden"}}>
                        <div style={{height:"100%",background:zm.mastered?"#1DD1A1":z.color,width:`${Math.min(1,zm.matchBlds/zm.minBld)*100}%`,borderRadius:99,transition:"width 0.5s"}}/>
                      </div>
                    </div>
                  </div>);
                })}
              </div>
            </>}

            {tab==="marketing"&&<>
              {gameMode!=="sandbox"&&rivals.length===0&&<div style={{background:"#FF475708",border:"1px solid #FF475722",borderRadius:6,padding:"6px 8px",marginBottom:6}}>
                <div style={{fontSize:10,color:"#FF4757",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>🏟️ {lang==="ko"?"경쟁 공원":"Rival Parks"}</div>
                <div style={{fontSize:10,color:"#4A5880",marginBottom:4}}>{lang==="ko"?`Day 20에 첫 경쟁자 등장 예정`:`First rival appears at Day 20`}</div>
                <div style={{height:3,background:"#0D0F1E",borderRadius:99,overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:99,background:"#FF4757",width:`${Math.min(100,(day/20)*100)}%`,transition:"width 0.5s"}}/>
                </div>
                <div style={{fontSize:10,color:"#FF475788",marginTop:3,textAlign:"right"}}>Day {day} / 20</div>
              </div>}
              {rivals.length>0&&<div style={{background:"#FF475711",border:"1px solid #FF475733",borderRadius:6,padding:7,marginBottom:6}}>
                <div style={{fontSize:10,color:"#FF4757",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>🏟️ {lang==="ko"?"경쟁 공원":"Rival Parks"}</div>
                {rivals.map(r=>{
                  const myPres=parkRating.final;
                  const total=myPres+r.prestige;
                  const myPct=total>0?Math.round(myPres/total*100):50;
                  return(<div key={r.id} style={{marginBottom:5,padding:"4px 5px",background:"#1A1A2A",borderRadius:4}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                      <span style={{fontSize:10,fontWeight:700}}>{r.emoji} {r.name[lang]||r.name.ko}</span>
                      <span style={{fontSize:10,color:"#FF6B6B"}}>Prestige: {Math.round(r.prestige)}</span>
                    </div>
                    <div style={{height:4,background:"#0A0A14",borderRadius:99,overflow:"hidden",display:"flex"}}>
                      <div style={{height:"100%",background:"#5EF6A0",width:`${myPct}%`,borderRadius:"99px 0 0 99px",transition:"width 0.5s"}}/>
                      <div style={{height:"100%",background:"#FF4757",flex:1,borderRadius:"0 99px 99px 0"}}/>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:1}}>
                      <span style={{fontSize:10,color:"#5EF6A0"}}>{lang==="ko"?"내 공원":"My Park"}: {myPres}pt</span>
                      <span style={{fontSize:10,color:"#FF6B6B"}}>{r.name[lang]||r.name.ko}: {Math.round(r.prestige)}pt</span>
                    </div>
                  </div>);
                })}
              </div>}
              {campaigns.length>0&&<div style={{marginBottom:5}}>{campaigns.map(c=><div key={c.id} style={{display:"flex",alignItems:"center",gap:4,padding:"3px 5px",marginBottom:2,background:"#FF9FF318",border:"1px solid #FF9FF333",borderRadius:4}}>
                <span style={{fontSize:11}}>{c.emoji}</span>
                <div style={{flex:1}}><div style={{fontSize:10,color:"#FF9FF3"}}>{t(`camp.${c.key}`)}</div><div style={{height:3,background:"#1A1A2A",borderRadius:99,marginTop:2,overflow:"hidden"}}><div style={{height:"100%",borderRadius:99,background:"#FF9FF3",width:`${(c.remaining/c.days)*100}%`}}/></div></div>
                <div style={{fontSize:10,color:"#FF9FF3"}}>{c.remaining}d</div>
              </div>)}</div>}
              {Object.entries(CAMPAIGNS_DATA).map(([key,camp])=>{const ok=money>=camp.cost;return(<div key={key} style={{display:"flex",alignItems:"center",gap:4,padding:"5px 5px",marginBottom:2,background:"#181828",border:"1px solid #222238",borderRadius:5,opacity:ok?1:0.5}}>
                <span style={{fontSize:14}}>{camp.emoji}</span>
                <div style={{flex:1}}><div style={{fontSize:10,fontWeight:700}}>{t(`camp.${key}`)}</div><div style={{fontSize:10,color:"#8888AA"}}>+{Math.round(camp.boost*100)}% · {camp.days}d · ${camp.cost.toLocaleString()}</div></div>
                <button style={{background:ok?"#FF9FF311":"transparent",border:`1px solid ${ok?"#FF9FF3":"#2A2A4A"}`,color:ok?"#FF9FF3":"#3A3A5A",borderRadius:3,padding:"2px 5px",cursor:ok?"pointer":"default",fontSize:10,fontFamily:"inherit"}} onClick={()=>ok&&launchCampaign(key)}>{t("btn.start")}</button>
              </div>);})}
              <div style={{height:1,background:"#2A2A4A",margin:"5px 0"}}/>
              <div style={{background:"#1A1A2A",border:`1px solid ${passOn?"#5EF6A044":"#2A2A4A"}`,borderRadius:6,padding:7}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:passOn?5:0}}>
                  <div style={{fontSize:10,fontWeight:700}}>🎫 {t("mkt.pass")}</div>
                  <button style={{background:passOn?"#5EF6A022":"#1A1A2A",border:`1px solid ${passOn?"#5EF6A0":"#3A3A5A"}`,color:passOn?"#5EF6A0":"#6666AA",borderRadius:4,padding:"2px 8px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}} onClick={()=>setPassOn(p=>!p)}>{passOn?"ON":"OFF"}</button>
                </div>
                {passOn&&<>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
                    <button style={{...pm,borderColor:"#FECA5744",color:"#FECA57"}} onClick={()=>setPassPrice(p=>Math.max(50,p-50))}>−</button>
                    <div style={{flex:1,textAlign:"center"}}><div style={{fontSize:16,fontWeight:900,color:"#5EF6A0",lineHeight:1}}>${passPrice}</div></div>
                    <button style={{...pm,borderColor:"#FECA5744",color:"#FECA57"}} onClick={()=>setPassPrice(p=>Math.min(500,p+50))}>+</button>
                  </div>
                  <div style={{display:"flex",gap:3}}>
                    {[[t("mkt.holders"),passHolders,"#5EF6A0"],[t("mkt.income"),"$"+passIncome,"#FECA57"]].map(([l,v,c])=><div key={l} style={{flex:1,padding:"3px 5px",background:"#14142A",borderRadius:4}}><div style={{fontSize:10,color:"#666688"}}>{l}</div><div style={{fontSize:10,fontWeight:700,color:c}}>{v}</div></div>)}
                  </div>
                </>}
              </div>
            </>}

            {tab==="research"&&<>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:researchPoints<2?4:6,padding:"4px 6px",background:"#1A1A2A",borderRadius:5,border:"1px solid #A29BFE33"}}>
                <div><div style={{fontSize:10,color:"#A29BFE",letterSpacing:2}}>{t("res.points")}</div><div style={{fontSize:16,fontWeight:900,color:"#A29BFE"}}>{researchPoints} RP</div></div>
                <div style={{textAlign:"right"}}><div style={{fontSize:10,color:"#666688"}}>{t("res.complete")}</div><div style={{fontSize:12,fontWeight:700,color:"#5EF6A0"}}>{researched.length}/{RESEARCH.length}</div></div>
              </div>
              {researchPoints<2&&<div style={{fontSize:10,color:"#4A5880",background:"#A29BFE08",border:"1px solid #A29BFE18",borderRadius:5,padding:"5px 7px",marginBottom:5,lineHeight:1.6}}>
                💡 {lang==="ko"?"방문객이 올수록 RP가 쌓입니다. 기본 2RP/일 + 방문객 20명당 +1RP":"RP earned daily. Base 2 RP/day + 1 RP per 20 visitors"}
              </div>}
              {Object.entries(RB_BRANCHES).map(([bKey,branch])=>{
                const items=RESEARCH.filter(r=>r.branch===bKey).sort((a,b)=>a.tier-b.tier);
                return(<div key={bKey} style={{marginBottom:6}}>
                  <div style={{display:"flex",alignItems:"center",gap:3,marginBottom:2,padding:"2px 4px",background:branch.color+"18",borderRadius:3,border:`1px solid ${branch.color}33`}}>
                    <span style={{fontSize:11}}>{branch.emoji}</span>
                    <span style={{fontSize:10,fontWeight:800,color:branch.color}}>{t(`br.${bKey}`)}</span>
                  </div>
                  {items.map(r=>{
                    const done=researched.includes(r.id),reqDone=!r.req||researched.includes(r.req);
                    const canDo=reqDone&&!done&&researchPoints>=r.cost,locked=!reqDone&&!done;
                    return(<div key={r.id} style={{display:"flex",alignItems:"center",gap:3,padding:"3px 4px",marginBottom:2,background:done?"#0A1A0A":locked?"#0A0A14":"#181828",border:`1px solid ${done?"#5EF6A044":locked?"#2A2A3A":branch.color+"44"}`,borderRadius:4,opacity:locked?0.5:1}}>
                      <span style={{fontSize:12,filter:locked?"grayscale(1)":"none"}}>{r.emoji}</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:10,fontWeight:700,color:done?"#5EF6A0":locked?"#555577":branch.color}}>{t(`res.${r.id}.name`)}{done?" ✅":locked?" 🔒":""}</div>
                        <div style={{fontSize:10,color:"#666688"}}>{t(`res.${r.id}.effect`)}</div>
                      </div>
                      {!done&&<button style={{background:canDo?branch.color+"22":"transparent",border:`1px solid ${canDo?branch.color:"#2A2A4A"}`,color:canDo?branch.color:"#3A3A5A",borderRadius:3,padding:"2px 4px",cursor:canDo?"pointer":"default",fontSize:10,fontFamily:"inherit"}} onClick={()=>canDo&&doResearch(r.id)}>{r.cost}RP</button>}
                    </div>);
                  })}
                </div>);
              })}
            </>}

            {tab==="mission"&&<>
              {/* 상업화 단계 패널 */}
              <div style={{background:`linear-gradient(135deg,${currentStage.gradFrom},${currentStage.gradTo})`,border:`2px solid ${currentStage.color}55`,borderRadius:8,padding:8,marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                  <span style={{fontSize:22,filter:`drop-shadow(0 0 6px ${currentStage.color}88)`}}>{currentStage.emoji}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:10,color:currentStage.color,letterSpacing:2,textTransform:"uppercase",marginBottom:1}}>STAGE {currentStage.id}/5</div>
                    <div style={{fontSize:10,fontWeight:900,color:currentStage.color}}>{currentStage.name[lang]||currentStage.name.ko}</div>
                    <div style={{fontSize:10,color:"#8888AA",marginTop:1}}>{currentStage.desc[lang]||currentStage.desc.ko}</div>
                  </div>
                </div>
                <div style={{fontSize:10,color:currentStage.color,background:currentStage.color+"18",borderRadius:3,padding:"2px 5px",marginBottom:5,display:"inline-block"}}>
                  ✨ {lang==="ko"?"보너스":"Bonus"}: {currentStage.bonus[lang]||currentStage.bonus.ko}
                </div>
                {/* 단계 바 */}
                <div style={{display:"flex",gap:2,marginBottom:currentStage.next?5:0}}>
                  {STAGES.map((st,i)=>(
                    <div key={st.id} style={{flex:1,height:4,borderRadius:99,background:st.id<=currentStage.id?st.color:"#1A1A2A",boxShadow:st.id===currentStage.id?`0 0 6px ${st.color}`:"none",transition:"all 0.3s"}}/>
                  ))}
                </div>
                {currentStage.next&&(()=>{
                  const nx=currentStage.next;
                  const nextSt=STAGES.find(s=>s.id===currentStage.id+1);
                  const bldPct=Math.min(1,totalBldCount/nx.bld);
                  const starPct=Math.min(1,parkRating.stars/nx.stars);
                  const monPct=Math.min(1,money/nx.money);
                  return(<div style={{fontSize:10,color:"#666688"}}>
                    <div style={{marginBottom:2}}>{lang==="ko"?"다음 단계":"Next"}: <span style={{color:nextSt?.color}}>{nextSt?.name[lang]||nextSt?.name.ko}</span></div>
                    {[
                      [lang==="ko"?"건물":"Bld",totalBldCount,nx.bld,bldPct,"#48DBFB"],
                      [lang==="ko"?"별점":"Stars",parkRating.stars,nx.stars,starPct,"#FECA57"],
                      [lang==="ko"?"자금":"$",`$${(money/1000).toFixed(0)}k`,`$${(nx.money/1000).toFixed(0)}k`,monPct,"#5EF6A0"],
                    ].map(([lbl,cur,req,pct,col])=>(
                      <div key={lbl} style={{display:"flex",alignItems:"center",gap:3,marginBottom:2}}>
                        <span style={{minWidth:22,color:"#555577"}}>{lbl}</span>
                        <div style={{flex:1,height:3,background:"#1A1A2A",borderRadius:99,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${pct*100}%`,background:pct>=1?col:col+"99",borderRadius:99,transition:"width 0.5s"}}/>
                        </div>
                        <span style={{minWidth:28,textAlign:"right",color:pct>=1?"#5EF6A0":"#555577"}}>{pct>=1?"✅":`${cur}/${req}`}</span>
                      </div>
                    ))}
                  </div>);
                })()}
                {!currentStage.next&&<div style={{fontSize:10,color:currentStage.color,fontWeight:700,textAlign:"center"}}>🏆 {lang==="ko"?"최고 단계 달성!":"Max Stage Reached!"}</div>}
              </div>

              {/* Phase 3-1: Holiday Event Panel */}
              {(activeHoliday||holidayHistory.length>0)&&<div style={{background:"#FECA5711",border:"1px solid #FECA5733",borderRadius:7,padding:7,marginBottom:6}}>
                <div style={{fontSize:10,color:"#FECA57",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>🎉 {lang==="ko"?"특별 이벤트":"Special Events"}</div>
                {activeHoliday?<div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3,padding:"4px 5px",background:"#FECA5718",borderRadius:5}}>
                  <span style={{fontSize:16}}>{activeHoliday.emoji}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:10,fontWeight:700,color:"#FECA57"}}>{activeHoliday.name[lang]||activeHoliday.name.ko}</div>
                    <div style={{fontSize:10,color:"#C7B8EA"}}>{activeHoliday.desc[lang]||activeHoliday.desc.ko}</div>
                    <div style={{fontSize:10,color:"#FECA57"}}>👥×{activeHoliday.visMult} · 😊+{activeHoliday.satMod} · {activeHoliday.remaining}d</div>
                  </div>
                </div>:<div style={{fontSize:10,color:"#666688",marginBottom:3}}>{lang==="ko"?"현재 이벤트 없음":"No active event"}</div>}
                {holidayHistory.slice(-3).reverse().map((h,i)=>{const ev=HOLIDAY_EVENTS.find(e=>e.id===h.id);return ev?(<div key={i} style={{fontSize:10,color:"#555577",padding:"1px 0"}}>✓ {ev.emoji} {ev.name[lang]||ev.name.ko} (Day {h.day})</div>):null;})}
              </div>}

              {/* Phase 3-2: Active Investment Panel */}
              {activeInvestment&&<div style={{background:"#5EF6A011",border:"1px solid #5EF6A033",borderRadius:7,padding:7,marginBottom:6}}>
                <div style={{fontSize:10,color:"#5EF6A0",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>💼 {lang==="ko"?"활성 투자":"Active Investment"}</div>
                {(()=>{const offer=INVESTOR_OFFERS.find(o=>o.id===activeInvestment.offerId);if(!offer) return null;
                  const goal=activeInvestment.goal;
                  const daysLeft=Math.max(0,activeInvestment.deadline-day);
                  const curVal=goal.target==="vis"?visitors:goal.target==="stars"?parkRating.stars:estNet;
                  const pct=Math.min(1,curVal/goal.value);
                  return(<>
                    <div style={{fontSize:10,fontWeight:700,color:offer.emoji==="💼"?"#5EF6A0":"#C7B8EA",marginBottom:2}}>{offer.emoji} {offer.name[lang]||offer.name.ko}</div>
                    <div style={{fontSize:10,color:"#C7B8EA",marginBottom:2}}>🎯 {goal.desc[lang]||goal.desc.ko}</div>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                      <span style={{fontSize:10,color:pct>=1?"#5EF6A0":"#FECA57"}}>{curVal}/{goal.value}</span>
                      <span style={{fontSize:10,color:daysLeft<5?"#FF4757":"#8888AA"}}>⏱ {daysLeft}d</span>
                    </div>
                    <div style={{height:4,background:"#0A0A14",borderRadius:99,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${pct*100}%`,background:pct>=1?"#5EF6A0":"#FECA57",borderRadius:99,transition:"width 0.5s"}}/>
                    </div>
                  </>);
                })()}
              </div>}

              {activeDisaster&&<div style={{background:"#FF475711",border:"2px solid #FF475788",borderRadius:7,padding:7,marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
                  <span style={{fontSize:22}}>{activeDisaster.emoji}</span>
                  <div style={{flex:1}}><div style={{fontSize:10,fontWeight:900,color:"#FF4757"}}>{t(`dis.${activeDisaster.id}`)}</div><div style={{fontSize:10,color:"#FF9F43"}}>{t(`dis.${activeDisaster.id}.desc`)}</div></div>
                  <div style={{textAlign:"right"}}><div style={{fontSize:14,fontWeight:900,color:"#FF4757"}}>{activeDisaster.remaining}d</div></div>
                </div>
                {activeDisaster.resolveCost>0&&<button style={{width:"100%",background:money>=activeDisaster.resolveCost?"#FF475722":"transparent",border:`2px solid ${money>=activeDisaster.resolveCost?"#FF4757":"#3A3A5A"}`,color:money>=activeDisaster.resolveCost?"#FF4757":"#3A3A5A",borderRadius:5,padding:"4px 0",cursor:money>=activeDisaster.resolveCost?"pointer":"default",fontSize:10,fontWeight:700,fontFamily:"inherit"}} onClick={resolveDisaster}>{t("mis.resolve")} -${activeDisaster.resolveCost.toLocaleString()}</button>}
              </div>}

              {gameMode==="campaign"&&currentScenarioData&&<>
                <div style={{background:`${currentScenarioData.color}11`,border:`1px solid ${currentScenarioData.color}33`,borderRadius:7,padding:8,marginBottom:7}}>
                  <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:6}}>
                    <span style={{fontSize:20}}>{currentScenarioData.emoji}</span>
                    <div><div style={{fontSize:10,fontWeight:800,color:currentScenarioData.color}}>{t(`scn.${currentScenarioData.id}`)}</div><div style={{fontSize:10,color:"#666688"}}>⏱ {t("mis.timeLeft", { days: Math.max(0,currentScenarioData.timeLimit-day) })}</div></div>
                  </div>
                  {currentScenarioData.goals.map(g=>{
                    const checkS={vis:visitors,sat,stars:parkRating.stars,net:estNet,brokenCount:stats.brokenCount,fee,coupleRatio:segs.couple||0,childRatio:segs.child||0,pres:parkRating.stars};
                    const achieved=g.check(checkS);
                    return(<div key={g.id} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 6px",marginBottom:2,background:achieved?"#5EF6A011":"#14142A",border:`1px solid ${achieved?"#5EF6A033":"#2A2A4A"}`,borderRadius:5}}>
                      <span style={{fontSize:14}}>{g.medal}</span>
                      <div style={{flex:1,fontSize:10,color:achieved?"#5EF6A0":"#8888AA"}}>{g.desc?.[lang]||g.desc?.ko||""}</div>
                      {achieved&&<span style={{fontSize:10}}>✅</span>}
                    </div>);
                  })}
                </div>
              </>}

              {activeDailyChallenge&&(
                <div style={{background:"linear-gradient(135deg,#0A1820,#081420)",border:`2px solid ${activeDailyChallenge.claimed?"#00E5A044":"#FFD93D44"}`,borderRadius:8,padding:8,marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
                    <span style={{fontSize:16}}>🎯</span>
                    <div style={{fontSize:11,fontWeight:900,color:activeDailyChallenge.claimed?"#00E5A0":"#FFD93D"}}>
                      {lang==="ko"?"일일 챌린지":"Daily Challenge"}
                    </div>
                    {activeDailyChallenge.claimed&&<span style={{fontSize:10,color:"#00E5A0",marginLeft:"auto"}}>✅ {lang==="ko"?"완료!":"Done!"}</span>}
                  </div>
                  <div style={{fontSize:10,color:"#C7B8EA",marginBottom:5}}>
                    {activeDailyChallenge.emoji} {activeDailyChallenge.name[lang]||activeDailyChallenge.name.ko}
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:10}}>
                    <span style={{color:"#8888AA"}}>{lang==="ko"?"보상":"Reward"}</span>
                    <span style={{color:"#FFD93D",fontWeight:700}}>
                      +${activeDailyChallenge.reward.$.toLocaleString()} +{activeDailyChallenge.reward.rp}RP
                    </span>
                  </div>
                  {!activeDailyChallenge.claimed&&(()=>{
                    const dcMs={vis:visitors,sat,net:estNet,clean,pres:parkRating.stars};
                    const cur=dcMs[activeDailyChallenge.goal.type]||0;
                    const tgt=activeDailyChallenge.goal.value;
                    const pct=Math.min(100,Math.round(cur/tgt*100));
                    return(
                      <div style={{marginTop:5}}>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:2}}>
                          <span style={{color:"#8888AA"}}>{lang==="ko"?"진행도":"Progress"}</span>
                          <span style={{color:"#FFD93D"}}>{cur}/{tgt} ({pct}%)</span>
                        </div>
                        <div style={{height:4,background:"#1A1A30",borderRadius:99,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#FFD93D,#FF9F43)",borderRadius:99,transition:"width 0.5s"}}/>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
              <div style={{fontSize:10,color:"#FECA57",letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>{t("mis.title")} ({completedMissions.length}/{MISSIONS.length})</div>
              {activeMissions.map(mId=>{
                const m=MISSIONS.find(x=>x.id===mId);if(!m) return null;
                const cc2=bldCounts(grid);
                const ms2={vis:visitors,sat,clean,pres:parkRating.stars,pass:passHolders,rides:Object.entries(cc2).filter(([k])=>B[k]?.cat==="ride"&&k!=="entrance").reduce((t,[,v])=>t+v,0),vips:vipCount,zones:zoneGrid.reduce((t,row)=>t+row.filter(Boolean).length,0),net:estNet,research:researched.length,debt:totalDebt,paths:Object.entries(cc2).filter(([k])=>B[k]?.cat==="path").reduce((t,[,v])=>t+v,0)};
                const ready=m.check(ms2);
                return(<div key={mId} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 6px",marginBottom:3,background:ready?"#0A1A14":"#14142A",border:`2px solid ${ready?"#5EF6A0":"#2A2A4A"}`,borderRadius:6}}>
                  <span style={{fontSize:14}}>{m.emoji}</span>
                  <div style={{flex:1}}><div style={{fontSize:10,fontWeight:700,color:ready?"#5EF6A0":"#E8E8F0"}}>{t(`mis.${m.id}`)}</div>
                    <div style={{display:"flex",gap:3,marginTop:1}}><span style={{fontSize:10,color:"#5EF6A0",background:"#5EF6A013",borderRadius:2,padding:"1px 3px"}}>+${m.reward.$.toLocaleString()}</span><span style={{fontSize:10,color:"#A29BFE",background:"#A29BFE13",borderRadius:2,padding:"1px 3px"}}>+{m.reward.rp}RP</span></div>
                  </div>
                  {ready&&<span style={{fontSize:13}}>🏆</span>}
                </div>);
              })}

              {/* Phase 3-5: League System Panel */}
              {(()=>{
                const curLeague=calcLeague(earnedMedals);
                const bronzeC=earnedMedals.filter(m=>["bronze","silver","gold"].includes(m.medalId)).length;
                const silverC=earnedMedals.filter(m=>["silver","gold"].includes(m.medalId)).length;
                const goldC=earnedMedals.filter(m=>m.medalId==="gold").length;
                const goldScen=new Set(earnedMedals.filter(m=>m.medalId==="gold").map(m=>m.scenarioId)).size;
                let nextLeague=LEAGUES[0];let nextDesc="";let nextPct=0;
                if(!curLeague){nextLeague=LEAGUES[0];nextDesc=`🥉 1${lang==="ko"?"개 필요":"needed"}`;nextPct=Math.min(1,bronzeC/1);}
                else if(curLeague.id==="bronze"){nextLeague=LEAGUES[1];nextDesc=`🥈 3${lang==="ko"?"개 필요":"needed"} (${silverC}/3)`;nextPct=Math.min(1,silverC/3);}
                else if(curLeague.id==="silver"){nextLeague=LEAGUES[2];nextDesc=`🥇 5${lang==="ko"?"개 필요":"needed"} (${goldC}/5)`;nextPct=Math.min(1,goldC/5);}
                else if(curLeague.id==="gold"){nextLeague=LEAGUES[3];nextDesc=`💎 ${lang==="ko"?"5개+전시나리오":"5 gold+all scenarios"} (${goldC}/5, ${goldScen}/5)`;nextPct=Math.min(1,Math.min(goldC/5,goldScen/5));}
                return(<div style={{background:"#1A1A2A",border:`1px solid ${curLeague?curLeague.color+"44":"#2A2A4A"}`,borderRadius:6,padding:7,marginTop:6}}>
                  <div style={{fontSize:10,color:curLeague?curLeague.color:"#666688",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>💎 {lang==="ko"?"리그 시스템":"League System"}</div>
                  <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
                    <span style={{fontSize:18}}>{curLeague?curLeague.emoji:"🏅"}</span>
                    <div>
                      <div style={{fontSize:10,fontWeight:700,color:curLeague?curLeague.color:"#666688"}}>{curLeague?(curLeague.name[lang]||curLeague.name.ko):(lang==="ko"?"리그 미가입":"No League")}</div>
                      <div style={{fontSize:10,color:"#666688"}}>🥉×{bronzeC} 🥈×{silverC} 🥇×{goldC}</div>
                    </div>
                  </div>
                  {curLeague?.id!=="diamond"&&<>
                    <div style={{fontSize:10,color:"#8888AA",marginBottom:2}}>{lang==="ko"?"다음":"Next"}: {nextLeague.name[lang]||nextLeague.name.ko} — {nextDesc}</div>
                    <div style={{height:3,background:"#0A0A14",borderRadius:99,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${nextPct*100}%`,background:nextLeague.color,borderRadius:99,transition:"width 0.5s"}}/>
                    </div>
                  </>}
                  {curLeague?.id==="diamond"&&<div style={{fontSize:10,color:"#A8D8EA",fontWeight:700,textAlign:"center"}}>💎 {lang==="ko"?"최고 리그 달성!":"Diamond League reached!"}</div>}
                </div>);
              })()}
            </>}

          </div>
        </div>

        {/* ── Panel Collapse Toggle ── */}
        <button onClick={()=>setPanelCollapsed(p=>!p)} style={{alignSelf:"stretch",width:isMobile?36:14,background:"rgba(100,120,255,0.08)",borderTop:"none",borderBottom:"none",borderLeft:"none",borderRight:"1px solid rgba(100,120,255,0.10)",color:"#4A5880",cursor:"pointer",fontSize:isMobile?16:10,fontFamily:"inherit",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.15s"}} title={panelCollapsed?"패널 열기":"패널 닫기"}>{panelCollapsed?"▶":"◀"}</button>

        {/* ── GRID + LOG ── */}
        <div className="grid-area" style={{flex:1,display:"flex",flexDirection:"column",padding:7,gap:5,overflow:"hidden",background:"var(--bg-deep)"}}
          onTouchStart={(e) => {
            if (e.touches.length === 2) {
              const dx = e.touches[0].clientX - e.touches[1].clientX;
              const dy = e.touches[0].clientY - e.touches[1].clientY;
              pinchRef.current = {
                active: true,
                startDist: Math.hypot(dx, dy),
                startScale: gridScale,
              };
              e.preventDefault();
            }
          }}
          onTouchMove={(e) => {
            if (pinchRef.current.active && e.touches.length === 2) {
              const dx = e.touches[0].clientX - e.touches[1].clientX;
              const dy = e.touches[0].clientY - e.touches[1].clientY;
              const dist = Math.hypot(dx, dy);
              const scale = Math.min(2.5, Math.max(0.5, pinchRef.current.startScale * (dist / pinchRef.current.startDist)));
              setGridScale(scale);
              const cx = ((e.touches[0].clientX + e.touches[1].clientX) / 2);
              const cy = ((e.touches[0].clientY + e.touches[1].clientY) / 2);
              const rect = e.currentTarget.getBoundingClientRect();
              setGridScaleOrigin({ x: ((cx - rect.left) / rect.width) * 100, y: ((cy - rect.top) / rect.height) * 100 });
              e.preventDefault();
            }
          }}
          onTouchEnd={() => { pinchRef.current.active = false; }}
        >
          {/* Feature 6: Disaster pre-warning banners */}
          {screen==="game"&&stats.brokenCount>0&&(
            <div style={{background:"rgba(255,87,87,0.12)",border:"1px solid rgba(255,87,87,0.5)",borderRadius:6,padding:"5px 10px",color:"#FF5757",fontSize:10,fontWeight:700,display:"flex",gap:6,alignItems:"center",marginBottom:4,flexShrink:0}}>
              ⚠️ 고장 시설 {stats.brokenCount}개 — 경영 탭에서 수리하거나 정비공을 고용하세요
            </div>
          )}
          {screen==="game"&&hired.mechanic===0&&stats.brokenCount===0&&(cc.rollerCoaster||cc.dropTower||cc.thrillRide)&&(
            <div style={{background:"rgba(255,159,67,0.10)",border:"1px solid rgba(255,159,67,0.4)",borderRadius:6,padding:"5px 10px",color:"#FF9F43",fontSize:10,fontWeight:700,display:"flex",gap:6,alignItems:"center",marginBottom:4,flexShrink:0}}>
              🔧 정비공 없음 — 고위험 어트랙션 고장 확률이 높습니다
            </div>
          )}
          {screen==="game"&&!ftueGoalDone&&tutorialStep===0&&stats.hasEntrance&&visitors===0&&(
            <div style={{background:"rgba(0,229,160,0.08)",border:"1px solid rgba(0,229,160,0.3)",borderRadius:6,padding:"5px 10px",color:"#00E5A0",fontSize:10,fontWeight:700,display:"flex",gap:8,alignItems:"center",marginBottom:4,flexShrink:0}}>
              <span style={{fontSize:14}}>🎯</span>
              <div style={{flex:1}}>
                <span style={{color:"#5EF6A0"}}>{lang==="ko"?"첫 번째 목표:":"First Goal:"}</span>
                {" "}{lang==="ko"?"▶ 재생 버튼을 눌러 방문객을 맞이하세요! (우상단 ▶ 버튼)":"▶ Press Play to welcome your first visitors! (▶ button, top right)"}
              </div>
              <button style={{background:"none",border:"none",color:"#2E3A5C",cursor:"pointer",fontSize:12,fontFamily:"inherit"}} onClick={()=>setFtueGoalDone(true)}>✕</button>
            </div>
          )}
          {bankruptcyDays>0&&bankruptcyDays<5&&screen==="game"&&(
            <div style={{background:"rgba(255,50,50,0.15)",border:"2px solid rgba(255,87,87,0.7)",borderRadius:6,padding:"5px 10px",color:"#FF5757",fontSize:10,fontWeight:700,display:"flex",gap:8,alignItems:"center",marginBottom:4,animation:"pulse 1s infinite",flexShrink:0}}>
              <span style={{fontSize:16}}>💸</span>
              <div style={{flex:1}}>
                {lang==="ko"?`파산 위험! ${5-bankruptcyDays}일 후 공원 폐쇄 — 수익을 늘리거나 비용을 줄이세요`:`Bankruptcy risk! Park closes in ${5-bankruptcyDays} days — increase revenue or cut costs`}
              </div>
            </div>
          )}
          {disasterWarning&&screen==="game"&&(
            <div style={{background:"rgba(255,150,0,0.12)",border:"2px solid rgba(255,150,0,0.5)",borderRadius:6,padding:"6px 10px",color:"#FF9F43",fontSize:10,fontWeight:700,display:"flex",gap:8,alignItems:"center",marginBottom:4,animation:"pulse 1.5s infinite",flexShrink:0}}>
              <span style={{fontSize:16}}>⚡</span>
              <div style={{flex:1}}>
                <div>{lang==="ko"?`${disasterWarning.dis.emoji} 위험 감지: ${t("dis."+disasterWarning.dis.id)}`:`${disasterWarning.dis.emoji} Risk: ${t("dis."+disasterWarning.dis.id)}`}</div>
                <div style={{fontSize:10,opacity:0.8}}>{lang==="ko"?`${disasterWarning.countdown}일 후 발생 예정`:`${disasterWarning.countdown} days until event`}</div>
              </div>
              <button onClick={mitigateDisaster} style={{background:"#FF9F4322",border:"1px solid #FF9F4388",color:"#FF9F43",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"inherit"}}>
                🛡️ {lang==="ko"?"대비 $800":"Mitigate $800"}
              </button>
            </div>
          )}
          {buildMode==="zone"&&zonePaint&&<div style={{display:"flex",alignItems:"center",gap:5,padding:"2px 8px",background:ZONES[zonePaint]?.bg||"#66668818",border:`1px solid ${ZONES[zonePaint]?.color||"#666688"}44`,borderRadius:4,flexShrink:0}}>
            <span style={{fontSize:11}}>{ZONES[zonePaint]?.emoji||"🚫"}</span>
            <span style={{fontSize:10,color:ZONES[zonePaint]?.color||"#666688",fontWeight:700}}>{ZONES[zonePaint]?t(`z.${zonePaint}`):t("z.clear")}</span>
            <button style={{marginLeft:"auto",background:"none",border:"1px solid #666688",color:"#888888",borderRadius:4,padding:"1px 6px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}} onClick={()=>setZonePaint(null)}>{t("misc.done")}</button>
          </div>}

          {/* Phase 2-3: Press Review Popup */}
          {pendingReview&&!pendingVIP&&!pendingInvestor&&<div style={{background:"linear-gradient(135deg,rgba(13,18,53,0.98),rgba(8,11,32,0.98))",border:`2px solid ${pendingReview.grade==="S"?"rgba(255,217,61,0.4)":pendingReview.grade==="A"?"rgba(0,229,160,0.4)":pendingReview.grade==="D"?"rgba(255,87,87,0.4)":"rgba(100,140,255,0.3)"}`,borderRadius:12,padding:"10px 14px",flexShrink:0,backdropFilter:"blur(8px)",boxShadow:"0 8px 40px rgba(0,0,0,0.6), inset 0 0 20px rgba(100,140,255,0.03)",animation:"slide-in 0.2s ease"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{fontSize:26,lineHeight:1}}>{pendingReview.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:10,color:"#9B7FFF",letterSpacing:2,marginBottom:1}}>📰 {lang==="ko"?"언론 평가":"Press Review"} · Day {day}</div>
                <div style={{fontSize:13,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1,color:pendingReview.grade==="S"?"#FFD93D":pendingReview.grade==="A"?"#00E5A0":pendingReview.grade==="D"?"#FF5757":"var(--text-primary)"}}>{pendingReview.grade}{lang==="ko"?"등급":"grade"}</div>
                <div style={{fontSize:10,color:"var(--text-secondary)",marginTop:1}}>"{pendingReview.headline}"</div>
                <div style={{fontSize:10,color:"#6B7CA1",marginTop:1}}>{lang==="ko"?"점수":"Score"}: {pendingReview.score}pt · {lang==="ko"?"방문객":"Visitor"} {pendingReview.visBoost>=0?"+":""}{Math.round(pendingReview.visBoost*100)}%</div>
              </div>
              <button style={{background:"rgba(255,217,61,0.12)",border:"1px solid rgba(255,217,61,0.4)",color:"#FFD93D",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:10,fontFamily:"inherit",whiteSpace:"nowrap",transition:"all 0.15s"}} onClick={()=>setPendingReview(null)}>{lang==="ko"?"확인":"OK"}</button>
            </div>
          </div>}

          {pendingInvestor&&!pendingVIP&&(()=>{const offer=pendingInvestor.offer;const penalty=Math.floor(offer.amount*offer.penalty);return(<div style={{background:"linear-gradient(135deg,rgba(13,18,53,0.98),rgba(8,11,32,0.98))",border:"2px solid rgba(100,140,255,0.2)",borderRadius:12,padding:"10px 14px",flexShrink:0,display:"flex",alignItems:"center",gap:9,backdropFilter:"blur(8px)",boxShadow:"0 8px 40px rgba(0,0,0,0.6)",animation:"slide-in 0.2s ease"}}>
            <div style={{fontSize:26,lineHeight:1}}>{offer.emoji}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:11,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",color:"#00E5A0",marginBottom:1}}>{offer.name[lang]||offer.name.ko}</div>
              <div style={{fontSize:10,color:"var(--text-secondary)",marginBottom:1}}>💰 +${offer.amount.toLocaleString()} · 🎯 {offer.goal.desc[lang]||offer.goal.desc.ko}</div>
              <div style={{fontSize:10,color:"#FF9F43"}}>⚠️ {lang==="ko"?"실패 시":"Fail penalty"}: -${penalty.toLocaleString()} · {pendingInvestor.expiresIn}d {lang==="ko"?"남음":"left"}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:3}}>
              <button style={{background:"rgba(0,229,160,0.12)",border:"2px solid rgba(0,229,160,0.5)",color:"#00E5A0",borderRadius:6,padding:"3px 10px",cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"inherit",transition:"all 0.15s"}} onClick={acceptInvestor}>{t("vip.accept")}</button>
              <button style={{background:"rgba(255,87,87,0.06)",border:"1px solid rgba(255,87,87,0.25)",color:"#FF5757",borderRadius:6,padding:"3px 10px",cursor:"pointer",fontSize:10,fontFamily:"inherit",transition:"all 0.15s"}} onClick={declineInvestor}>{t("vip.decline")}</button>
            </div>
          </div>);})()}

          {pendingVIP&&<div style={{background:"linear-gradient(135deg,rgba(13,18,53,0.98),rgba(8,11,32,0.98))",border:"2px solid rgba(100,140,255,0.2)",borderRadius:12,padding:"10px 14px",flexShrink:0,display:"flex",alignItems:"center",gap:9,backdropFilter:"blur(8px)",boxShadow:"0 8px 40px rgba(0,0,0,0.6), inset 0 0 20px rgba(100,140,255,0.03)",animation:"slide-in 0.2s ease"}}>
            <div style={{fontSize:26,lineHeight:1}}>{pendingVIP.emoji}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:11,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",color:"#FFD93D",marginBottom:1}}>{t(`vip.${pendingVIP.id}`)}</div>
              <div style={{fontSize:10,color:"var(--text-secondary)",marginBottom:1}}>{pendingVIP.bonusVis>0&&`👥+${pendingVIP.bonusVis}  `}{pendingVIP.bonusRev>0&&`💰+$${pendingVIP.bonusRev.toLocaleString()}  `}⭐+{pendingVIP.presBonus}</div>
              <div style={{fontSize:10,color:checkVIPReq(grid,pendingVIP.req)?"#00E5A0":"#FF5757"}}>{checkVIPReq(grid,pendingVIP.req)?t("vip.metReq"):t("vip.noReq")}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:3}}>
              <button style={{background:checkVIPReq(grid,pendingVIP.req)?"rgba(0,229,160,0.12)":"rgba(255,255,255,0.04)",border:`2px solid ${checkVIPReq(grid,pendingVIP.req)?"rgba(0,229,160,0.5)":"rgba(255,255,255,0.10)"}`,color:checkVIPReq(grid,pendingVIP.req)?"#00E5A0":"#2E3A5C",borderRadius:6,padding:"3px 10px",cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"inherit",transition:"all 0.15s"}} onClick={acceptVIP}>{t("vip.accept")}</button>
              <button style={{background:"rgba(255,87,87,0.06)",border:"1px solid rgba(255,87,87,0.25)",color:"#FF5757",borderRadius:6,padding:"3px 10px",cursor:"pointer",fontSize:10,fontFamily:"inherit",transition:"all 0.15s"}} onClick={()=>setPendingVIP(null)}>{t("vip.decline")}</button>
            </div>
          </div>}

          <div style={{position:"relative",flex:1,minHeight:0}}>
            <div style={{display:"grid",
              gridTemplateColumns:`repeat(${GC},1fr)`,
              gridTemplateRows:`repeat(${GR},1fr)`,
              gap:2,width:"100%",height:"100%",
              background:"#020408",borderRadius:10,padding:4,boxSizing:"border-box",
              border:"1px solid rgba(100,120,255,0.08)",
              boxShadow:"inset 0 0 40px rgba(0,0,0,0.8), 0 0 30px rgba(0,0,0,0.6)",
              transform:`scale(${gridScale})`,
              transformOrigin:`${gridScaleOrigin.x}% ${gridScaleOrigin.y}%`,
              transition:'transform 0.05s linear'}}
              onDoubleClick={()=>setGridScale(1)}>
              {grid.map((row,r)=>row.map((cell,c)=>{
                // ref 셀은 명시적 위치만 잡는 투명 스페이서
                if(cell?.ref){
                  return <div key={`${r}-${c}`} style={{gridColumn:c+1,gridRow:r+1,pointerEvents:"none"}} onClick={()=>handleGridClick(r,c)} onMouseEnter={()=>setHovered({r,c})} onMouseLeave={()=>setHovered(null)}/>;
                }

                const owned=ownedGrid[r][c];
                const bd=cell?B[cell.type]:null;
                const bw=cell?bd?.size?.w||1:1;
                const bh=cell?bd?.size?.h||1:1;
                // hover footprint 포함 여부
                const isInFootprint=hovered&&selected&&r>=hovered.r&&r<hovered.r+selH&&c>=hovered.c&&c<hovered.c+selW;
                const isSel=clickedTile?.r===r&&clickedTile?.c===c;
                const broken=cell?.broken;
                const zone=zoneGrid[r][c];
                const isPath=cell?.type==="_path"||cell?.type==="_pathFancy";
                const isFancy=cell?.type==="_pathFancy";
                const isDeco=cell&&bd?.cat==="deco";
                const isEntrance=cell?.type==="entrance";
                const isolated=cell&&!broken&&!isPath&&!isDeco&&anyGridPaths&&!hasBuildingPath(reachablePaths,r,c,bw,bh);
                const tutHighlight=(tutorialStep===1&&!cell&&owned)||
                                   (tutorialStep===2&&!cell&&owned&&stats.hasEntrance)||
                                   (tutorialStep===3&&!cell&&owned);
                const isDemolishHov=buildMode==="demolish"&&hovered?.r===r&&hovered?.c===c&&cell&&owned;
                const isMultiSelected=buildMode==="demolish"&&multiSelectedCells.has(`${r},${c}`);
                const isCongested=congestedCells.has(`${r},${c}`);
                const isRightBoundary=owned&&c+bw<GC&&!ownedGrid[r][c+bw];
                const isNextBuyable=!owned&&c>0&&ownedGrid[r][c-1]&&gameMode!=="sandbox";

                let bg="#080B18";
                if(!owned) bg="#04060E";
                else if(broken) bg="linear-gradient(135deg,rgba(255,87,87,0.2),rgba(255,87,87,0.05))";
                else if(isPath) bg=isFancy?"linear-gradient(135deg,#241C08,#1A1408)":"linear-gradient(135deg,#1A1208,#100C05)";
                else if(isEntrance) bg="linear-gradient(135deg,rgba(255,217,61,0.15),rgba(255,159,67,0.08))";
                else if(cell) bg=`linear-gradient(135deg,${bd.color}18,${bd.color}06)`;
                else if(zone) bg=ZONES[zone]?.bg||"#0C0F22";
                else if(isInFootprint&&selected) bg=hovFootprintValid?"rgba(0,229,160,0.10)":"rgba(255,87,87,0.10)";
                else bg="#080B18";
                if(isMultiSelected) bg="rgba(255,87,87,0.25)";

                let borderCol="rgba(255,255,255,0.04)";
                if(!owned) borderCol="rgba(255,255,255,0.02)";
                else if(isSel) borderCol="#FFD93D";
                else if(isDemolishHov) borderCol="#FF5757";
                else if(broken) borderCol="rgba(255,87,87,0.5)";
                else if(tutHighlight) borderCol="#FFD93D";
                else if(isPath) borderCol=isFancy?"rgba(212,175,55,0.4)":"rgba(139,115,85,0.3)";
                else if(isEntrance) borderCol="rgba(255,217,61,0.5)";
                else if(cell) borderCol=bd.color+"44";
                else if(isInFootprint&&selected) borderCol=hovFootprintValid?"rgba(0,229,160,0.5)":"rgba(255,87,87,0.5)";
                else borderCol="rgba(255,255,255,0.04)";
                if(isMultiSelected) borderCol="rgba(255,87,87,0.8)";

                return(<div key={`${r}-${c}`}
                  style={{
                    gridColumn:`${c+1} / span ${bw}`,
                    gridRow:`${r+1} / span ${bh}`,
                    border:`1px solid ${borderCol}`,
                    borderRight:isRightBoundary?`2px solid rgba(168,216,234,0.35)`:`1px solid ${borderCol}`,
                    borderRadius:5,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    cursor:owned?(buildMode==="demolish"&&cell?"crosshair":"pointer"):isNextBuyable?"pointer":"default",
                    transition:"border-color 0.12s,background 0.12s",
                    minHeight:0,overflow:"hidden",position:"relative",
                    background:isNextBuyable?"rgba(77,159,255,0.04)":bg,
                    boxShadow:isSel?`0 0 0 2px #FFD93D, 0 0 16px rgba(255,217,61,0.4)`:isRightBoundary?"4px 0 8px rgba(168,216,234,0.15)":broken?"0 0 8px rgba(255,87,87,0.3)":isDemolishHov?"0 0 8px rgba(255,87,87,0.4)":isCongested?"0 0 0 2px rgba(255,159,67,0.5),0 0 8px rgba(255,159,67,0.3)":isEntrance&&!broken?"0 0 12px rgba(255,217,61,0.2), inset 0 0 12px rgba(255,217,61,0.05)":cell&&!broken&&!isPath?`inset 0 0 8px ${bd.color}08`:"none",
                    opacity:!owned?0.12:1}}
                  onClick={()=>handleGridClick(r,c)} onMouseEnter={()=>setHovered({r,c})} onMouseLeave={()=>setHovered(null)}>

                  {!owned&&isNextBuyable&&<span style={{fontSize:10,opacity:0.6,color:"#4D9FFF"}}>🔓</span>}
                  {!owned&&!isNextBuyable&&<span style={{fontSize:10,opacity:0.5,color:"#333355"}}>▪</span>}

                  {owned&&isPath&&<>
                    <div style={{position:"absolute",inset:0,borderRadius:4,
                      background:isFancy
                        ?"linear-gradient(135deg,#D4AF3718 0%,#D4AF3730 50%,#D4AF3718 100%)"
                        :"linear-gradient(135deg,#8B735518 0%,#8B735530 50%,#8B735518 100%)"
                    }}/>
                    <div style={{position:"absolute",top:"42%",left:"15%",right:"15%",height:"16%",borderRadius:99,background:isFancy?"#D4AF3760":"#8B735560"}}/>
                    <div style={{position:"absolute",left:"42%",top:"15%",bottom:"15%",width:"16%",borderRadius:99,background:isFancy?"#D4AF3760":"#8B735560"}}/>
                  </>}

                  {owned&&isEntrance&&!broken&&<>
                    <div style={{position:"absolute",inset:0,background:"radial-gradient(circle at center,rgba(255,217,61,0.12),transparent 70%)",borderRadius:4}}/>
                    <div style={{position:"relative",zIndex:2,filter:"drop-shadow(0 0 8px rgba(255,217,61,0.7))"}}>
                      {hasBuildingIcon(cell.type)
                        ? getBuildingIcon(cell.type, "#FFD93D", 36)
                        : <span style={{fontSize:28,lineHeight:1}}>{bd.emoji}</span>}
                    </div>
                    {cell.level>0&&<div style={{position:"absolute",top:1,right:1,fontSize:10,color:"#FFD93D",fontWeight:900,zIndex:3,textShadow:"0 0 4px #FFD93D"}}>{"★".repeat(cell.level)}</div>}
                  </>}

                  {owned&&cell&&!isPath&&!isEntrance&&<>
                    {zone&&<div style={{position:"absolute",inset:0,background:ZONES[zone]?.bg,borderRadius:4,opacity:0.6}}/>}
                    <div style={{
                      position:"relative",zIndex:2,
                      opacity:broken?0.25:isDemolishHov?0.5:1,
                      filter:broken?"grayscale(1)":`drop-shadow(0 1px 3px rgba(0,0,0,0.8))`,
                      transition:"opacity 0.1s,filter 0.1s",
                    }}>
                      {hasBuildingIcon(cell.type)
                        ? getBuildingIcon(cell.type, bd.color, bw>=3?44:bw>=2?36:cell.level>=2?32:28)
                        : <span style={{fontSize:bw>=3?32:bw>=2?26:cell.level>=2?22:20,lineHeight:1}}>{bd.emoji}</span>}
                    </div>
                    {cell.level>0&&!broken&&<div style={{position:"absolute",top:2,right:3,fontSize:11,color:"#FFD93D",lineHeight:1.2,fontWeight:900,zIndex:3,textShadow:"0 0 3px #000"}}>{cell.level===2?"★★":"★"}</div>}
                    {broken&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:bw>=2?18:14,zIndex:3,background:"rgba(0,0,0,0.4)",borderRadius:4}}>🔧</div>}
                    {isolated&&!broken&&<div style={{position:"absolute",bottom:2,right:2,fontSize:11,zIndex:3,lineHeight:1,filter:"drop-shadow(0 0 2px #000)"}}>🔗</div>}
                    {ridePrices[cell.type]&&pricingMode!=="admission"&&!broken&&<div style={{position:"absolute",top:2,left:3,fontSize:9,color:"#FF9FF3",lineHeight:1.2,zIndex:3,textShadow:"0 0 2px #000"}}>${ridePrices[cell.type]}</div>}
                    {isDemolishHov&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:bw>=2?20:14,zIndex:4,background:"rgba(255,50,50,0.15)",borderRadius:4}}>🔨</div>}
                    {isCongested&&!broken&&<div style={{position:"absolute",top:2,right:2,fontSize:12,zIndex:5,lineHeight:1,filter:"drop-shadow(0 0 2px #000)"}}>🚶</div>}
                  </>}

                  {owned&&zone&&!cell&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,opacity:0.15}}>{ZONES[zone]?.emoji}</div>}
                  {owned&&cell&&!isPath&&zone&&<div style={{position:"absolute",bottom:2,left:2,width:5,height:5,borderRadius:"50%",background:ZONES[zone]?.color,zIndex:4,boxShadow:`0 0 3px ${ZONES[zone]?.color}`}}/>}

                  {tutHighlight&&<div style={{position:"absolute",inset:0,borderRadius:4,background:"#FECA5710",animation:"pulse 1s infinite"}}/>}
                  {/* footprint 미리보기 오버레이 */}
                  {isInFootprint&&selected&&!cell&&owned&&<div style={{position:"absolute",inset:0,borderRadius:4,background:hovFootprintValid?"rgba(0,229,160,0.08)":"rgba(255,87,87,0.08)"}}/>}
                  {buildParticles.filter(p=>p.r===r&&p.c===c).map(p=>(
                    <div key={p.id} className="build-flash" style={{background:p.color+"44"}}/>
                  ))}
                  {buildParticles.filter(p=>p.r===r&&p.c===c).flatMap(p=>
                    p.particles.map((pt,i)=>(
                      <div key={`${p.id}-${i}`} className="particle"
                        style={{'--tx':pt.tx,'--ty':pt.ty,background:pt.col,left:'50%',top:'50%',marginLeft:'-3px',marginTop:'-3px'}}/>
                    ))
                  )}
                </div>);
              }))}
            </div>

            {/* 미션 달성 flash */}
            {missionFlash&&<div style={{position:"absolute",inset:0,pointerEvents:"none",borderRadius:10,border:"3px solid #FFD93D",boxShadow:"0 0 30px rgba(255,217,61,0.5), inset 0 0 30px rgba(255,217,61,0.1)",zIndex:20,animation:"pulse-glow 0.8s ease"}}/>}
            {/* 스테이지 업 flash */}
            {stageUpFlash&&<div style={{position:"absolute",inset:0,pointerEvents:"none",borderRadius:10,
              border:`3px solid ${currentStage.color}`,
              boxShadow:`0 0 40px ${currentStage.color}66, inset 0 0 20px ${currentStage.color}22`,
              zIndex:20,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div style={{background:"rgba(0,0,0,0.85)",borderRadius:12,padding:"10px 20px",
                fontSize:13,fontWeight:900,color:currentStage.color,
                boxShadow:`0 4px 20px rgba(0,0,0,0.9)`,fontFamily:"'Barlow Condensed',monospace"}}>
                {currentStage.emoji} {currentStage.name[lang]||currentStage.name.ko}
              </div>
            </div>}
            {/* 투자 실패 flash */}
            {investFailFlash&&<div style={{position:"absolute",inset:0,pointerEvents:"none",borderRadius:10,background:"rgba(255,87,87,0.08)",border:"3px solid rgba(255,87,87,0.6)",zIndex:20,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div style={{background:"rgba(255,87,87,0.9)",borderRadius:12,padding:"10px 20px",fontSize:16,fontWeight:900,color:"#fff",boxShadow:"0 4px 20px rgba(0,0,0,0.8)",fontFamily:"'Barlow Condensed',monospace"}}>
                💸 -${investFailFlash.amount.toLocaleString()}
              </div>
            </div>}
            {visitorZeroReason && (
              <div style={{
                position:"absolute", top:"50%", left:"50%",
                transform:"translate(-50%,-50%)",
                background:"rgba(5,6,20,0.88)",
                border:"1px solid rgba(255,209,61,0.3)",
                borderRadius:12, padding:"10px 20px",
                textAlign:"center", zIndex:20, pointerEvents:"none",
                backdropFilter:"blur(4px)",
              }}>
                <div style={{fontSize:24, marginBottom:4}}>{visitorZeroReason.emoji}</div>
                <div style={{fontSize:11, color:"#FFD93D", fontWeight:700}}>{visitorZeroReason.msg}</div>
              </div>
            )}
            {firstVisitorCelebration&&(
              <div style={{
                position:"absolute",inset:0,zIndex:40,pointerEvents:"none",
                display:"flex",alignItems:"center",justifyContent:"center",
                background:"rgba(0,0,0,0.3)",
                borderRadius:6,
                animation:"pulse 0.5s ease",
              }}>
                <div style={{textAlign:"center",animation:"slide-in 0.4s ease"}}>
                  <div style={{fontSize:48,marginBottom:8,filter:"drop-shadow(0 0 20px rgba(255,217,61,1))"}}>🎊</div>
                  <div style={{
                    fontSize:20,fontWeight:900,color:"#FFD93D",
                    textShadow:"0 0 30px rgba(255,217,61,0.8)",
                    fontFamily:"'Barlow Condensed',sans-serif",
                    letterSpacing:2,
                  }}>
                    {lang==="ko"?"공원 오픈!":"PARK OPEN!"}
                  </div>
                  <div style={{fontSize:11,color:"#00E5A0",marginTop:4}}>
                    {lang==="ko"?"첫 번째 방문객이 도착했습니다! 🎉":"First visitors have arrived! 🎉"}
                  </div>
                </div>
              </div>
            )}
            {visitors>0&&<div style={{position:"absolute",inset:3,pointerEvents:"none",overflow:"hidden",borderRadius:6}}>
              {dots.map(dot=><div key={dot.id} style={{position:"absolute",left:`${(dot.c/GC)*100}%`,top:`${(dot.r/GR)*100}%`,width:`${(1/GC)*100}%`,height:`${(1/GR)*100}%`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,transition:"left 1.1s ease,top 1.1s ease",filter:"drop-shadow(0 2px 4px rgba(0,0,0,1))",zIndex:5}}>
                {dot.emoji}
              </div>)}
              {bubbles.filter(b=>b.expires>Date.now()).map(b=>(
                <div key={b.id} style={{
                  position:"absolute",
                  left:`${((b.c+0.5)/GC)*100}%`,
                  top:`${Math.max(0,(b.r/GR)*100-6)}%`,
                  transform:"translateX(-50%)",
                  background:"rgba(5,6,20,0.92)",
                  border:"1px solid rgba(255,255,255,0.18)",
                  borderRadius:10,
                  padding:"3px 8px",
                  fontSize:10,
                  color:"#EEF0FF",
                  whiteSpace:"nowrap",
                  zIndex:15,
                  pointerEvents:"none",
                  boxShadow:"0 2px 8px rgba(0,0,0,0.6)",
                  animation:"slide-in 0.2s ease",
                }}>
                  {b.text}
                  <div style={{
                    position:"absolute",bottom:-5,left:"50%",transform:"translateX(-50%)",
                    width:0,height:0,
                    borderLeft:"5px solid transparent",
                    borderRight:"5px solid transparent",
                    borderTop:"5px solid rgba(255,255,255,0.18)"
                  }}/>
                </div>
              ))}
            </div>}

            {tutorialStep>0&&tutorialStep<=5&&screen==="game"&&(
              <>
                {/* 반투명 전체 오버레이 */}
                <div style={{
                  position:"absolute",inset:0,zIndex:25,pointerEvents:"none",
                  background:"rgba(0,0,0,0.45)",borderRadius:6,
                }}/>
                {/* 단계별 가이드 카드 */}
                <div style={{
                  position:"absolute",bottom:16,left:"50%",transform:"translateX(-50%)",
                  background:"linear-gradient(135deg,#0D1535,#080B20)",
                  border:"2px solid #FFD93D88",
                  borderRadius:14,padding:"14px 20px",
                  zIndex:30,minWidth:260,maxWidth:340,
                  boxShadow:"0 8px 40px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,217,61,0.15)",
                  animation:"slide-in 0.3s ease",
                  pointerEvents:"auto",
                }}>
                  {/* 단계 표시 */}
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
                    <div style={{display:"flex",gap:4}}>
                      {[1,2,3,4,5].map(i=>(
                        <div key={i} style={{
                          width:i===tutorialStep?20:8,height:8,
                          borderRadius:99,
                          background:i<tutorialStep?"#00E5A0":i===tutorialStep?"#FFD93D":"#1A2040",
                          transition:"all 0.3s",
                          boxShadow:i===tutorialStep?"0 0 8px #FFD93D":i<tutorialStep?"0 0 4px #00E5A0":"none"
                        }}/>
                      ))}
                    </div>
                    <span style={{fontSize:10,color:"#4A5880",marginLeft:"auto"}}>{tutorialStep}/5</span>
                  </div>
                  {/* 단계별 내용 */}
                  {(()=>{
                    const allSteps=[
                      {emoji:"🎪",title:lang==="ko"?"[1/5] 입구 게이트 배치":"[1/5] Place Entrance Gate",
                       desc:lang==="ko"?"왼쪽 패널 '건설' 탭에서 🎪 입구 게이트를 선택하고\n그리드 아무 곳에나 클릭해서 배치하세요.\n입구가 없으면 방문객이 입장할 수 없어요!":"In the left Build tab, select 🎪 Entrance Gate\nand click the grid to place it.\nNo entrance = no visitors!"},
                      {emoji:"🛤️",title:lang==="ko"?"[2/5] 통로 연결":"[2/5] Connect with Paths",
                       desc:lang==="ko"?"입구 옆에 🟫 통로를 배치하세요.\n통로가 없으면 방문객이 어트랙션까지\n이동할 수 없어요. 연속으로 여러 개 배치하세요!":"Place paths 🟫 next to the entrance.\nVisitors need paths to reach attractions.\nPlace several to extend coverage!"},
                      {emoji:"🎡",title:lang==="ko"?"[3/5] 어트랙션 배치":"[3/5] Add Attractions",
                       desc:lang==="ko"?"통로 옆에 어트랙션을 배치하세요.\n관람차·회전목마부터 시작하고,\n여러 종류를 배치할수록 방문객이 늘어요!":"Place attractions next to paths.\nStart with Ferris Wheel or Carousel.\nMore variety = more visitors!"},
                      {emoji:"▶",title:lang==="ko"?"[4/5] 시간 시작":"[4/5] Start Time",
                       desc:lang==="ko"?"상단의 ▶ 버튼으로 시간을 진행시키세요.\n⏩ 빨리 감기, ⚡ 매우 빨리 감기도 있어요.\n방문객이 들어오기 시작할 거예요!":"Press ▶ to start time.\nUse ⏩ Fast or ⚡ Very Fast to speed up.\nVisitors will start arriving!"},
                      {emoji:"🎊",title:lang==="ko"?"[5/5] 수익 관리":"[5/5] Manage Revenue",
                       desc:lang==="ko"?"방문객이 왔군요! 왼쪽 '재무' 탭에서\n입장료를 조정하고 수익을 확인하세요.\n만족도(😊)가 높을수록 방문객이 늘어요!":"Visitors arrived! Go to Finance tab\nto adjust admission fee and track revenue.\nHigher satisfaction = more visitors!"},
                    ];
                    const steps=allSteps[Math.min(tutorialStep-1, allSteps.length-1)];
                    const totalSteps=allSteps.length;
                    return(
                      <>
                        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                          <div style={{fontSize:28,filter:"drop-shadow(0 0 8px rgba(255,217,61,0.6))"}}>{steps.emoji}</div>
                          <div style={{fontSize:13,fontWeight:900,color:"#FFD93D",lineHeight:1.2}}>{steps.title}</div>
                        </div>
                        <div style={{fontSize:10,color:"#8899CC",lineHeight:1.8,whiteSpace:"pre-line",marginBottom:12}}>{steps.desc}</div>
                      </>
                    );
                  })()}
                  {/* 버튼 */}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                    <button onClick={()=>setTutorialStep(0)}
                      style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.15)",
                        color:"#6B7CA1",borderRadius:8,padding:"5px 14px",cursor:"pointer",
                        fontSize:10,fontFamily:"inherit",transition:"all 0.15s"}}
                      onMouseEnter={e=>e.currentTarget.style.color="#DDE2FF"}
                      onMouseLeave={e=>e.currentTarget.style.color="#6B7CA1"}>
                      {lang==="ko"?"건너뛰기":"Skip"}
                    </button>
                    <button onClick={()=>{
                        if(tutorialStep>=5) setTutorialStep(0);
                        else setTutorialStep(s=>s+1);
                      }}
                      style={{background:"rgba(255,217,61,0.15)",border:"1px solid rgba(255,217,61,0.5)",
                        color:"#FFD93D",borderRadius:8,padding:"5px 16px",cursor:"pointer",
                        fontSize:10,fontWeight:700,fontFamily:"inherit",transition:"all 0.15s"}}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(255,217,61,0.25)"}
                      onMouseLeave={e=>e.currentTarget.style.background="rgba(255,217,61,0.15)"}>
                      {tutorialStep>=5?(lang==="ko"?"완료 ✓":"Done ✓"):(lang==="ko"?"다음 →":"Next →")}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div style={{background:"linear-gradient(90deg,#05060F,#08091A)",border:"1px solid rgba(100,120,255,0.08)",borderRadius:8,padding:"5px 10px",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:logCollapsed?0:3,cursor:"pointer"}} onClick={()=>setLogCollapsed(v=>!v)}>
              <div style={{fontSize:10,color:"#2E3A5C",letterSpacing:3,fontWeight:700,textTransform:"uppercase"}}>▸ Event Log</div>
              <span style={{fontSize:10,color:"#2E3A5C",transition:"transform 0.2s",display:"inline-block",transform:logCollapsed?"rotate(-90deg)":"rotate(0deg)"}}>▾</span>
            </div>
            {!logCollapsed&&logs.slice(0,5).map((l,i)=>{
              const col=l.startsWith("🚨")||l.startsWith("⚠️")||l.startsWith("💸")?"#FF5757":l.startsWith("✅")||l.startsWith("🎊")||l.startsWith("📣")||l.startsWith("🏗️")?"#00E5A0":l.startsWith("🔬")||l.startsWith("💾")||l.startsWith("⬆️")?"#9B7FFF":l.startsWith("📊")?"#FFD93D":"#6B7CA1";
              return(<div key={i} style={{fontSize:10,padding:"3px 0",borderBottom:i<4?"1px solid rgba(255,255,255,0.04)":"none",opacity:Math.max(0.3,1-i*0.15),color:col,display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:2,height:"100%",borderRadius:1,background:col,alignSelf:"stretch",minHeight:10,flexShrink:0,opacity:0.7}}/>
                {l}
              </div>);
            })}
          </div>
        </div>
      </div>

      {saveConfirm&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
          <div style={{background:"#0D1025",border:"2px solid rgba(255,217,61,0.4)",borderRadius:14,padding:"24px 32px",textAlign:"center",minWidth:260}}>
            <div style={{fontSize:24,marginBottom:8}}>💾</div>
            <div style={{fontSize:13,fontWeight:800,color:"#FFD93D",marginBottom:6}}>{lang==="ko"?"슬롯 덮어쓰기":"Overwrite Slot"} {saveConfirm.slotIdx+1}</div>
            <div style={{fontSize:10,color:"#6B7CA1",marginBottom:16}}>{lang==="ko"?"기존 저장 데이터가 사라집니다.":"Existing save data will be lost."}</div>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button onClick={()=>{saveToSlot(saveConfirm.slotIdx);setSaveConfirm(null);}} style={{background:"#FFD93D22",border:"2px solid #FFD93D",color:"#FFD93D",borderRadius:8,padding:"8px 20px",cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"inherit"}}>{lang==="ko"?"덮어쓰기":"Overwrite"}</button>
              <button onClick={()=>setSaveConfirm(null)} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.15)",color:"#6B7CA1",borderRadius:8,padding:"8px 20px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>{lang==="ko"?"취소":"Cancel"}</button>
            </div>
          </div>
        </div>
      )}

      {overwriteConfirm&&(
        <div style={{position:"fixed",inset:0,background:"rgba(2,5,16,0.85)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
          <div style={{background:"linear-gradient(135deg,#1A0A0A,#0D0D1A)",border:"2px solid rgba(255,159,67,0.5)",borderRadius:16,padding:"28px 36px",textAlign:"center",maxWidth:320,fontFamily:"'Rajdhani','Barlow Condensed',sans-serif"}}>
            <div style={{fontSize:36,marginBottom:8}}>🔄</div>
            <div style={{fontSize:16,fontWeight:900,color:"#FF9F43",marginBottom:6,letterSpacing:1}}>{lang==="ko"?"건물 덮어쓰기":"Replace Building"}</div>
            <div style={{fontSize:11,color:"#DDE2FF",marginBottom:4}}>{lang==="ko"?`기존: ${overwriteConfirm.existing?.type} → 신규: ${overwriteConfirm.newType}`:`Replace: ${overwriteConfirm.existing?.type} → ${overwriteConfirm.newType}`}</div>
            <div style={{fontSize:10,color:"#6B7CA1",marginBottom:16}}>{lang==="ko"?`기존 건물 환불: $${overwriteConfirm.refund?.toLocaleString()} (40%) + 신규 건설 비용 차감`:`Refund $${overwriteConfirm.refund?.toLocaleString()} (40%) then build new`}</div>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.15)",color:"#8899CC",borderRadius:8,padding:"8px 20px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit"}} onClick={()=>setOverwriteConfirm(null)}>{lang==="ko"?"취소":"Cancel"}</button>
              <button style={{background:"rgba(255,159,67,0.15)",border:"2px solid rgba(255,159,67,0.5)",color:"#FF9F43",borderRadius:8,padding:"8px 20px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit"}} onClick={()=>{
                const{r,c,existing,newType,refund}=overwriteConfirm;
                const bd=B[newType];
                if(ref.current.money+refund<bd.baseCost){addLog(t("log.noMoney"));setOverwriteConfirm(null);return;}
                setGrid(prev=>{const n=prev.map(row=>[...row]);n[r][c]={type:newType,level:0,broken:false};return n;});
                setMoney(m=>m+refund-bd.baseCost);
                addLog(lang==="ko"?`🔄 ${t(`b.${existing.type}`)} → ${t(`b.${newType}`)} 교체 완료`:`🔄 Replaced ${existing.type} with ${newType}`);
                if(soundOn) playSound("build");
                setOverwriteConfirm(null);
              }}>{lang==="ko"?"교체":"Replace"}</button>
            </div>
          </div>
        </div>
      )}

      {demolishConfirm&&(
          <div style={{position:"fixed",inset:0,background:"rgba(2,5,16,0.85)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
            <div style={{background:"linear-gradient(135deg,#1A0A0A,#0D0D1A)",border:"2px solid rgba(255,87,87,0.5)",borderRadius:16,padding:"28px 36px",textAlign:"center",maxWidth:320,fontFamily:"'Rajdhani','Barlow Condensed',sans-serif"}}>
              <div style={{fontSize:40,marginBottom:8}}>🔨</div>
              <div style={{fontSize:18,fontWeight:900,color:"#FF5757",marginBottom:6,letterSpacing:1}}>{lang==="ko"?"철거 확인":"Confirm Demolish"}</div>
              <div style={{fontSize:12,color:"#9B7FFF",marginBottom:4}}>{demolishConfirm.cell?`${lang==="ko"?"건물":"Building"}: ${demolishConfirm.cell.type}`:""}</div>
              <div style={{fontSize:11,color:"#6B7CA1",marginBottom:16}}>{lang==="ko"?`환불: $${demolishConfirm.refund?.toLocaleString()} (건설비 40%)`:`Refund: $${demolishConfirm.refund?.toLocaleString()} (40% of cost)`}</div>
              <div style={{display:"flex",gap:10,justifyContent:"center"}}>
                <button style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.15)",color:"#8899CC",borderRadius:8,padding:"8px 20px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit"}} onClick={()=>setDemolishConfirm(null)}>{lang==="ko"?"취소":"Cancel"}</button>
                <button style={{background:"rgba(255,87,87,0.15)",border:"2px solid rgba(255,87,87,0.5)",color:"#FF5757",borderRadius:8,padding:"8px 20px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit"}} onClick={confirmDemolish}>{lang==="ko"?"철거":"Demolish"}</button>
              </div>
            </div>
          </div>
        )}

      {scenarioResult&&(()=>{
        const bestMedal=earnedMedals.filter(m=>m.scenarioId===currentScenario).sort((a,b)=>['bronze','silver','gold'].indexOf(b.medalId)-['bronze','silver','gold'].indexOf(a.medalId))[0];
        return(
        <div style={{position:"fixed",inset:0,background:"rgba(2,5,16,0.92)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100}}>
          <div style={{background:"linear-gradient(135deg,#0D1235,#080B20)",border:`3px solid ${scenarioResult.medal?"rgba(255,217,61,0.5)":"rgba(255,87,87,0.4)"}`,borderRadius:20,padding:"36px 44px",textAlign:"center",maxWidth:380,boxShadow:`0 20px 60px rgba(0,0,0,0.8), 0 0 40px ${scenarioResult.medal?"rgba(255,217,61,0.1)":"rgba(255,87,87,0.1)"}`,animation:"slide-in 0.3s ease",fontFamily:"'Rajdhani','Barlow Condensed',sans-serif"}}>
            {scenarioResult.medal?(
              <>
                <div style={{fontSize:104,marginBottom:8}}>{scenarioResult.medal}</div>
                <div style={{fontSize:22,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:2,color:"#FFD93D",marginBottom:6}}>{t("res.success")}</div>
                <div style={{fontSize:12,color:"#9B7FFF",marginBottom:6}}>{t(`scn.${scenarioResult.scenario}`)}</div>
                <div style={{fontSize:10,color:"#6B7CA1",marginBottom:12}}>Day {scenarioResult.day} {t("misc.done")}</div>
                {bestMedal&&SCENARIO_CLEAR_REWARDS[bestMedal.medalId]&&(
                  <div style={{background:"rgba(255,217,61,0.1)",border:"1px solid #FFD93D44",borderRadius:8,padding:"8px 12px",marginTop:8,marginBottom:12,textAlign:"center"}}>
                    <div style={{fontSize:10,color:"#FFD93D",fontWeight:700}}>🎁 {lang==="ko"?"클리어 보상":"Clear Reward"}</div>
                    <div style={{fontSize:16,fontWeight:900,color:"#FFD93D",fontFamily:"'Barlow Condensed',sans-serif",marginTop:3}}>
                      +{SCENARIO_CLEAR_REWARDS[bestMedal.medalId].rp} RP
                    </div>
                    <div style={{fontSize:9,color:"#AA9933",marginTop:2}}>
                      {SCENARIO_CLEAR_REWARDS[bestMedal.medalId].bonus[lang]||SCENARIO_CLEAR_REWARDS[bestMedal.medalId].bonus.ko}
                    </div>
                  </div>
                )}
              </>
            ):(
              <>
                <div style={{fontSize:48,marginBottom:8}}>{scenarioResult.bankrupt?"💸":"⏰"}</div>
                <div style={{fontSize:20,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:2,color:"#FF5757",marginBottom:6}}>{scenarioResult.bankrupt?(lang==="ko"?"파산!":"Bankrupt!"):t("res.timeout")}</div>
                <div style={{fontSize:10,color:"#6B7CA1",marginBottom:20}}>{scenarioResult.bankrupt?(lang==="ko"?"5일 연속 적자로 공원이 폐쇄됐습니다.":"Park closed due to 5 consecutive days of losses."):t("res.failDesc")}</div>
              </>
            )}
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button style={{background:"rgba(255,217,61,0.12)",border:"2px solid rgba(255,217,61,0.5)",color:"#FFD93D",borderRadius:10,padding:"10px 20px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",transition:"all 0.15s"}} onClick={()=>{setScenarioResult(null);setSpeed(0);setScreen("menu");}}>{t("res.backMenu")}</button>
              <button style={{background:"rgba(0,229,160,0.12)",border:"2px solid rgba(0,229,160,0.4)",color:"#00E5A0",borderRadius:10,padding:"10px 20px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",transition:"all 0.15s"}} onClick={()=>setScenarioResult(null)}>{t("res.continue")}</button>
            </div>
          </div>
        </div>
        );
      })()}

    </div>
  );
}