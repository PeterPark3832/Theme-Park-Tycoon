import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import {
  GC, GR, TICK, SL, SAVE_KEY,
  SEASONS, HOLIDAY_EVENTS, INVESTOR_OFFERS, MAP_TYPES, LEAGUES,
  BREAK_CHANCE, ZONES, PARCELS, SEGS, SEG_PULL,
  CAMPAIGNS_DATA, VIP_EVENTS, RB_BRANCHES, RESEARCH, MISSIONS, DISASTERS,
  WEATHERS, WEATHER_WEIGHTS, DEFAULT_RIDE_PRICES, DEFAULT_SHOP_MULTS, MAX_FEE_BY_STARS,
  LANG_FLAGS, TR, SCENARIOS, DIFFICULTY_SETTINGS, STAGES, B, STARTING_PERKS, WEEKLY_CHALLENGES,
  STAFF, STAFF_UPGRADES, RIVAL_PARKS, FRANCHISES, ZONE_MASTERY, LOAN_OPTS, DOTS, TUTORIAL_STEPS, DAILY_CHALLENGES, SCENARIO_CLEAR_REWARDS, SCENARIO_DIFFICULTY,
  RIVAL_EVENTS, ACHIEVEMENTS, BONUS_EVENTS, SCENARIO_CLEAR_FLAVOR, BUILDING_EVENTS,
} from './gameData.js';
import { getBuildingIcon, hasBuildingIcon } from './buildingIcons.jsx';
import {
  tFn, pickWeather, getReachablePaths, hasPath, hasBuildingPath, getZM, calcStats, calcSegs,
  segSatMod, checkVIPReq, bldCounts, calcParkRating, calcRideTicketRev, avgShopMult,
  calcStage, stageVisBonus, stageRevBonus, calcLeague, getRB,
  loadSaveSlots, writeSaveSlots, mkGrid, mkOwned, timeAgoL, playSound, startDisasterDrum, startCrowdNoise,
} from './gameLogic.js';

// ── Background Music Engine ──────────────────────────────────────────────────
const _BPM=110,_BEAT=60/_BPM,_N=_BEAT/2;
const _HZ={F2:87.31,G2:98.00,A2:110.00,C3:130.81,D3:146.83,E3:164.81,F3:174.61,G3:196.00,A3:220.00,B3:246.94,C4:261.63,D4:293.66,E4:329.63,F4:349.23,G4:392.00,A4:440.00,B4:493.88,C5:523.25,D5:587.33,E5:659.25,G5:783.99};
// Phase 0 — Early (days 1-20): light, cheerful
const _CHORDS0=[
  {a:[_HZ.C4,_HZ.E4,_HZ.G4,_HZ.C5,_HZ.G4,_HZ.E4,_HZ.C4,_HZ.E4],b:_HZ.C3,m:[_HZ.E5,_HZ.D5,_HZ.C5,_HZ.G4]},
  {a:[_HZ.A3,_HZ.C4,_HZ.E4,_HZ.A4,_HZ.E4,_HZ.C4,_HZ.A3,_HZ.C4],b:_HZ.A2,m:[_HZ.A4,_HZ.A4,_HZ.G4,_HZ.A4]},
  {a:[_HZ.F3,_HZ.A3,_HZ.C4,_HZ.F4,_HZ.C4,_HZ.A3,_HZ.F3,_HZ.A3],b:_HZ.F2,m:[_HZ.C5,_HZ.A4,_HZ.G4,_HZ.F4]},
  {a:[_HZ.G3,_HZ.B3,_HZ.D4,_HZ.G4,_HZ.D4,_HZ.B3,_HZ.G3,_HZ.B3],b:_HZ.G2,m:[_HZ.G4,_HZ.A4,_HZ.B4,_HZ.C5]},
];
// Phase 1 — Mid (days 21-60): energetic, syncopated
const _CHORDS1=[
  {a:[_HZ.C4,_HZ.G4,_HZ.C5,_HZ.E5,_HZ.C5,_HZ.G4,_HZ.E4,_HZ.G4],b:_HZ.C3,m:[_HZ.G5,_HZ.E5,_HZ.D5,_HZ.C5]},
  {a:[_HZ.D4,_HZ.A4,_HZ.D5,_HZ.F4,_HZ.D4,_HZ.A3,_HZ.D4,_HZ.F4],b:_HZ.D3,m:[_HZ.A4,_HZ.D5,_HZ.A4,_HZ.F4]},
  {a:[_HZ.A3,_HZ.E4,_HZ.A4,_HZ.C5,_HZ.A4,_HZ.E4,_HZ.C4,_HZ.E4],b:_HZ.A2,m:[_HZ.C5,_HZ.B4,_HZ.A4,_HZ.G4]},
  {a:[_HZ.G3,_HZ.D4,_HZ.G4,_HZ.B4,_HZ.G4,_HZ.D4,_HZ.B3,_HZ.D4],b:_HZ.G2,m:[_HZ.D5,_HZ.B4,_HZ.G4,_HZ.D4]},
];
// Phase 2 — Late (days 60+): grand, layered
const _CHORDS2=[
  {a:[_HZ.C4,_HZ.E4,_HZ.G4,_HZ.C5,_HZ.E5,_HZ.C5,_HZ.G4,_HZ.E4],b:_HZ.C3,m:[_HZ.G5,_HZ.E5,_HZ.G5,_HZ.C5]},
  {a:[_HZ.F3,_HZ.C4,_HZ.F4,_HZ.A4,_HZ.C5,_HZ.A4,_HZ.F4,_HZ.C4],b:_HZ.F2,m:[_HZ.C5,_HZ.A4,_HZ.C5,_HZ.F4]},
  {a:[_HZ.G3,_HZ.B3,_HZ.D4,_HZ.G4,_HZ.B4,_HZ.G4,_HZ.D4,_HZ.B3],b:_HZ.G2,m:[_HZ.D5,_HZ.B4,_HZ.D5,_HZ.G4]},
  {a:[_HZ.A3,_HZ.C4,_HZ.E4,_HZ.A4,_HZ.C5,_HZ.A4,_HZ.E4,_HZ.C4],b:_HZ.A2,m:[_HZ.E5,_HZ.C5,_HZ.E5,_HZ.A4]},
];
const _PHASE_CHORDS=[_CHORDS0,_CHORDS1,_CHORDS2];
function _startMusicEngine(mg,ctx){
  let ch=0,ni=0,next=ctx.currentTime+0.05,phase=0;
  function osc(f,t,dur,type,vol){
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.connect(g);g.connect(mg);o.type=type;o.frequency.value=f;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+0.015);
    g.gain.setValueAtTime(vol*0.75,t+dur*0.75);g.gain.linearRampToValueAtTime(0,t+dur-0.01);
    o.start(t);o.stop(t+dur);
  }
  function hihat(t){
    const len=Math.floor(ctx.sampleRate*0.055),buf=ctx.createBuffer(1,len,ctx.sampleRate),d=buf.getChannelData(0);
    for(let i=0;i<len;i++) d[i]=Math.random()*2-1;
    const src=ctx.createBufferSource();src.buffer=buf;
    const hpf=ctx.createBiquadFilter();hpf.type='highpass';hpf.frequency.value=9000;
    const g=ctx.createGain();g.gain.setValueAtTime(0.05,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.05);
    src.connect(hpf);hpf.connect(g);g.connect(mg);src.start(t);src.stop(t+0.06);
  }
  function kick(t){
    const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(mg);o.type='sine';
    o.frequency.setValueAtTime(170,t);o.frequency.exponentialRampToValueAtTime(45,t+0.14);
    g.gain.setValueAtTime(0.22,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.18);
    o.start(t);o.stop(t+0.2);
  }
  // Phase 2 extra: sustained pad for grandeur
  function pad(f,t,vol){
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.connect(g);g.connect(mg);o.type='sine';o.frequency.value=f;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+0.3);
    g.gain.setValueAtTime(vol,t+_N*6);g.gain.linearRampToValueAtTime(0,t+_N*8);
    o.start(t);o.stop(t+_N*8+0.1);
  }
  function tick(){
    while(next<ctx.currentTime+0.4){
      const t=next,chords=_PHASE_CHORDS[phase],c=chords[ch%chords.length];
      const vol0=phase===0?0.13:phase===1?0.15:0.12;
      const vol1=phase===0?0.09:phase===1?0.11:0.08;
      const vol2=phase===0?0.17:phase===1?0.18:0.20;
      osc(c.a[ni],t,_N*0.88,'triangle',vol0);
      if(ni%2===0) osc(c.m[ni>>1],t,_N*1.9,'sine',vol1);
      // Second melody layer — alternate beats, slightly higher for variation
      if(ni%2===1&&phase>=1) osc(c.m[Math.min(3,(ni-1)>>1)+1>3?3:(ni-1)>>1]*1.25,t,_N*0.85,'triangle',vol1*0.65);
      if(ni===0){
        osc(c.b,t,_N*7.8,'sine',vol2);
        if(phase===2) pad(c.b*2,t,0.06);
      }
      hihat(t);
      if(ni===0||ni===4) kick(t);
      // phase 1: extra off-beat kick for energy
      if(phase===1&&ni===2) kick(t);
      next+=_N;
      if(++ni>=8){ni=0;ch=(ch+1)%chords.length;}
    }
  }
  const id=setInterval(tick,80);tick();
  return {
    cleanup:()=>clearInterval(id),
    setPhase:(p)=>{phase=Math.max(0,Math.min(2,p));},
  };
}

function SettingsModal({uiSettings,setUiSettings,soundOn,setSoundOn,bgMusicOn,setBgMusicOn,bgVolume,setBgVolume,onClose,lang}){
  const fzLabel={small:lang==="ko"?"작게":"Small",medium:lang==="ko"?"보통":"Medium",large:lang==="ko"?"크게":"Large"};
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:"#0C1128",border:"1px solid rgba(100,120,255,0.3)",borderRadius:12,padding:24,minWidth:280,maxWidth:360,boxShadow:"0 8px 40px rgba(0,0,0,0.8)"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div style={{fontSize:16,fontWeight:700,letterSpacing:2,color:"#DDE2FF"}}>{lang==="ko"?"⚙️ 설정":"⚙️ Settings"}</div>
          <button style={{background:"none",border:"none",color:"#8899BB",cursor:"pointer",fontSize:16,fontFamily:"inherit"}} onClick={onClose}>✕</button>
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:"#8899BB",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>{lang==="ko"?"글씨 크기":"Font Size"}</div>
          <div style={{display:"flex",gap:6}}>
            {["small","medium","large"].map(sz=>(
              <button key={sz} style={{flex:1,padding:"7px 0",background:uiSettings.fontSize===sz?"rgba(77,159,255,0.15)":"rgba(255,255,255,0.04)",border:`1px solid ${uiSettings.fontSize===sz?"rgba(77,159,255,0.6)":"rgba(255,255,255,0.10)"}`,color:uiSettings.fontSize===sz?"#4D9FFF":"#8899BB",borderRadius:6,cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:uiSettings.fontSize===sz?700:400,transition:"all 0.15s"}}
                onClick={()=>setUiSettings(p=>({...p,fontSize:sz}))}>{fzLabel[sz]}</button>
            ))}
          </div>
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:"#8899BB",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>{lang==="ko"?"효과음":"SFX"}</div>
          <button style={{width:"100%",padding:"7px 0",background:soundOn?"rgba(0,229,160,0.12)":"rgba(255,255,255,0.04)",border:`1px solid ${soundOn?"rgba(0,229,160,0.4)":"rgba(255,255,255,0.10)"}`,color:soundOn?"#00E5A0":"#8899BB",borderRadius:6,cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:600,transition:"all 0.15s"}}
            onClick={()=>setSoundOn(s=>!s)}>{soundOn?(lang==="ko"?"🔊 켜짐":"🔊 On"):(lang==="ko"?"🔇 꺼짐":"🔇 Off")}</button>
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:"#8899BB",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>{lang==="ko"?"배경음악":"Music"}</div>
          <button style={{width:"100%",padding:"7px 0",background:bgMusicOn?"rgba(168,139,255,0.15)":"rgba(255,255,255,0.04)",border:`1px solid ${bgMusicOn?"rgba(168,139,255,0.5)":"rgba(255,255,255,0.10)"}`,color:bgMusicOn?"#A88BFF":"#8899BB",borderRadius:6,cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:600,transition:"all 0.15s",marginBottom:8}}
            onClick={()=>setBgMusicOn(s=>!s)}>{bgMusicOn?(lang==="ko"?"🎵 켜짐":"🎵 On"):(lang==="ko"?"🎵 꺼짐":"🎵 Off")}</button>
          {bgMusicOn&&<div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:10,color:"#6B7CA1",minWidth:24}}>🔈</span>
            <input type="range" min="0" max="100" value={Math.round(bgVolume*100)} onChange={e=>setBgVolume(Number(e.target.value)/100)}
              style={{flex:1,accentColor:"#A88BFF",cursor:"pointer"}}/>
            <span style={{fontSize:10,color:"#6B7CA1",minWidth:28}}>{Math.round(bgVolume*100)}%</span>
          </div>}
        </div>
        <button style={{width:"100%",padding:"8px 0",background:"rgba(100,120,255,0.12)",border:"1px solid rgba(100,120,255,0.3)",color:"#8899CC",borderRadius:6,cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:600,marginTop:4}} onClick={onClose}>{lang==="ko"?"닫기":"Close"}</button>
      </div>
    </div>
  );
}

const rideList=Object.entries(B).filter(([,b])=>b.cat==="ride");
const shopList=Object.entries(B).filter(([,b])=>b.cat==="shop");
const facilList=Object.entries(B).filter(([,b])=>b.cat==="facility");
const pathList=Object.entries(B).filter(([,b])=>b.cat==="path");
const decoList=Object.entries(B).filter(([,b])=>b.cat==="deco");

export default function ParkTycoon(){
  const [screen,setScreen]=useState("menu");
  const [gameMode,setGameMode]=useState(null);
  const [currentScenario,setCurrentScenario]=useState(null);
  const [pendingScenarioId,setPendingScenarioId]=useState(null); // 난이도 선택 대기 중인 시나리오
  const [scenarioTimeLimit,setScenarioTimeLimit]=useState(0); // 난이도 적용 후 실제 제한 시간
  const [difficulty,setDifficulty]=useState("normal");
  const [tutorialStep,setTutorialStep]=useState(0);
  const [tutDone,setTutDone]=useState(()=>!!localStorage.getItem('pt_tut_done'));
  const [tutFlash,setTutFlash]=useState(false);
  const [tutTabVisited,setTutTabVisited]=useState(false);
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
  const [dots,setDots]=useState(()=>Array(40).fill(null).map((_,i)=>({id:i,r:Math.floor(Math.random()*GR),c:Math.floor(Math.random()*GC),emoji:DOTS[i%DOTS.length]})));
  const [gridPopups,setGridPopups]=useState([]);
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
  const [langChosen,setLangChosen]=useState(()=>!!localStorage.getItem("pt_lang_chosen"));
  const t=useMemo(()=>tFn(lang),[lang]);
  const changeLang=useCallback(l=>{setLang(l);localStorage.setItem("pt_lang",l);},[]);
  const chooseLang=useCallback(l=>{setLang(l);localStorage.setItem("pt_lang",l);localStorage.setItem("pt_lang_chosen","1");setLangChosen(true);},[]);

  // Phase 2 states
  const [staffLevels,setStaffLevels]=useState({janitor:1,mechanic:1,security:1,entertainer:1});
  const [rivals,setRivals]=useState([]);
  const [pressReviews,setPressReviews]=useState([]);
  const [pendingReview,setPendingReview]=useState(null);
  const [missionFlash,setMissionFlash]=useState(false); // 미션 달성 flash 연출
  const [investFailFlash,setInvestFailFlash]=useState(null); // 투자 실패 {amount}
  const [visitorRatings,setVisitorRatings]=useState([]);

  // Phase 3 states
  const [activeHoliday,setActiveHoliday]=useState(null);
  const [holidayHistory,setHolidayHistory]=useState([]);
  const [pendingInvestor,setPendingInvestor]=useState(null);
  const [activeInvestment,setActiveInvestment]=useState(null);
  const [investmentHistory,setInvestmentHistory]=useState([]);
  const [mapType,setMapType]=useState("default");
  const [earnedMedals,setEarnedMedals]=useState([]);

  // UI-only states (not saved)
  const [bp,setBp]=useState(()=>window.innerWidth<600?"mobile":window.innerWidth<1024?"tablet":"pc");
  const isMobile=bp==="mobile";
  const isTablet=bp==="tablet";
  const isPC=bp==="pc";
  const [panelCollapsed,setPanelCollapsed]=useState(false);
  const [logCollapsed,setLogCollapsed]=useState(false);
  const [buildParticles,setBuildParticles]=useState([]); // [{id,r,c,color,particles:[{tx,ty,col}]}]
  const [saveConfirm,setSaveConfirm]=useState(null); // null | {slotIdx}
  const [stageUpFlash,setStageUpFlash]=useState(false);
  const [medalFlash,setMedalFlash]=useState(null);
  const prevStageRef=useRef(1);
  const prevMasteryRef=useRef({});
  const [bubbles,setBubbles]=useState([]); // [{id,r,c,text,expires}]
  const [disasterWarning,setDisasterWarning]=useState(null); // null|{dis,countdown,mitigated}
  const [firstVisitorCelebration,setFirstVisitorCelebration]=useState(false);
  const [ftueGoalDone,setFtueGoalDone]=useState(false);
  const [dismissedHints,setDismissedHints]=useState(()=>{try{return JSON.parse(localStorage.getItem('dismissedHints'))||[];}catch{return[];}});
  const firstVisitorRef=useRef(false);
  const [showVisBreakdown,setShowVisBreakdown]=useState(false);
  const [showSatTooltip,setShowSatTooltip]=useState(false);
  const [satTooltipPos,setSatTooltipPos]=useState({x:0,y:0});
  const [gridScale,setGridScale]=useState(()=>window.innerWidth<600?1.8:1.0);
  const [gridScaleOrigin,setGridScaleOrigin]=useState({x:50,y:50});
  const [gridPan,setGridPan]=useState({x:0,y:0});
  const pinchRef=useRef({active:false, startDist:0, startScale:1});
  const panRef=useRef({active:false, startX:0, startY:0, startPanX:0, startPanY:0});

  // Saved states for daily challenge
  const [activeDailyChallenge,setActiveDailyChallenge]=useState(null); // null|{...dc, startDay, claimed}
  const [dailyChallengeHistory,setDailyChallengeHistory]=useState([]);
  const [bankruptcyDays,setBankruptcyDays]=useState(0); // 연속 적자 일수
  const [profitStreakDays,setProfitStreakDays]=useState(0); // 연속 흑자 일수
  const [pendingSeasonalAction,setPendingSeasonalAction]=useState(null); // null | {event, expiresDay}
  const [startPerk,setStartPerk]=useState(null); // null | "disasterGuard"|"rpBoost"|"premiumGate"
  const [pendingStartParams,setPendingStartParams]=useState(null); // null | {mode, scenarioId, diff, wc}
  const [weeklyChallengeMod,setWeeklyChallengeMod]=useState(null); // active weekly challenge modifier
  const [demolishConfirm,setDemolishConfirm]=useState(null); // null | {r,c,cell,refund}
  const [multiSelectedCells,setMultiSelectedCells]=useState(()=>new Set());
  const [overwriteConfirm,setOverwriteConfirm]=useState(null); // null | {r,c,existing,newType,refund}
  const [showKeyboardHelp,setShowKeyboardHelp]=useState(false);
  const [soundOn,setSoundOn]=useState(true);
  const [bgMusicOn,setBgMusicOn]=useState(()=>{try{return localStorage.getItem('pt_bgmusic')==='1';}catch{return false;}});
  const [bgVolume,setBgVolume]=useState(()=>{try{return parseFloat(localStorage.getItem('pt_bgvol'))||0.4;}catch{return 0.4;}});
  const bgMusicRef=useRef(null); // {ctx, masterGain, cleanup, setPhase}
  const bgVolumeRef=useRef(bgVolume);
  const disasterDrumRef=useRef(null); // cleanup fn for disaster bass drum
  const [uiSettings,setUiSettings]=useState(()=>{try{return JSON.parse(localStorage.getItem('uiSettings'))||{fontSize:'medium'};}catch{return{fontSize:'medium'};}});
  const [showSettings,setShowSettings]=useState(false);
  const [bottomSheetOpen,setBottomSheetOpen]=useState(false);
  const [placementPreview,setPlacementPreview]=useState(null);
  const [minimapOpen,setMinimapOpen]=useState(false);
  const [tutCardOffsetY,setTutCardOffsetY]=useState(0); // mobile drag offset (px upward from bottom)
  const tutCardDragRef=useRef({active:false,startY:0,startOffset:0});
  const [logOverlayExpanded,setLogOverlayExpanded]=useState(true);
  // Phase 3 new states
  const [weatherForecast,setWeatherForecast]=useState([]);
  const [rivalEventActive,setRivalEventActive]=useState(null); // {event,remaining,rivalName}
  const [earnedAchievements,setEarnedAchievements]=useState([]);
  const [achievementFlash,setAchievementFlash]=useState(null);
  const [lastDemolishGrid,setLastDemolishGrid]=useState(null);
  const [lastBuildGrid,setLastBuildGrid]=useState(null);
  const [lastBuilt,setLastBuilt]=useState(null);
  const buildUndoTimerRef=useRef(null);
  const [buildSearch,setBuildSearch]=useState("");
  const [buildCatFilter,setBuildCatFilter]=useState(null);
  const undoTimerRef=useRef(null);
  const dragBuildRef=useRef({active:false,mode:null,selected:null,moved:false,startR:-1,startC:-1});
  const lastBonusEventRef=useRef(null);
  const quietHintShownRef=useRef(new Set());

  // New gameplay-improvements states
  const [statTooltip,setStatTooltip]=useState(null); // null | string
  const [finRevOpen,setFinRevOpen]=useState(true);
  const [finExpOpen,setFinExpOpen]=useState(true);
  const [showFireworks,setShowFireworks]=useState(false);
  const fireworksTimerRef=useRef(null);
  const [segArrivalShown,setSegArrivalShown]=useState(false);
  const [zoneFtueShown,setZoneFtueShown]=useState(false);
  const [showZoneFtue,setShowZoneFtue]=useState(false);
  const [weeklyBadges,setWeeklyBadges]=useState([]);
  const [sandboxGoal,setSandboxGoal]=useState(null); // null | {type,target,label,achieved}
  const [lifetimeRP,setLifetimeRP]=useState(()=>{try{return parseInt(localStorage.getItem('pt_lifetimeRP')||'0',10)||0;}catch{return 0;}});
  const [hof,setHof]=useState(()=>{try{return JSON.parse(localStorage.getItem('pt_hof')||'{}');}catch{return{};}});
  const [speedrunRecords,setSpeedrunRecords]=useState(()=>{try{return JSON.parse(localStorage.getItem('pt_speedrun')||'{}');}catch{return{};}});
  const [saveQuotaWarning,setSaveQuotaWarning]=useState(false);
  const prevEarnedMedalsLenRef=useRef(0);
  const prevStarsRef=useRef(0);
  const tickCountRef=useRef(0);

  const ref=useRef();
  const diffSettings=DIFFICULTY_SETTINGS[difficulty]||DIFFICULTY_SETTINGS.normal;
  ref.current={grid,zoneGrid,ownedGrid,money,sat,clean,fee,hired,day,speed,loans,visitors,segData,campaigns,pendingVIP,passOn,passPrice,passHolders,prestigeBonus,totalVis:totalVis,researched,researchPoints,activeMissions,completedMissions,activeDisaster,ridePrices,shopMults,pricingMode,gameMode,currentScenario,difficulty,scenarioResult,weather,weatherTimer,staffLevels,rivals,pressReviews,visitorRatings,activeHoliday,holidayHistory,pendingInvestor,activeInvestment,investmentHistory,mapType,earnedMedals,disasterWarning,activeDailyChallenge,dailyChallengeHistory,bankruptcyDays,profitStreakDays,soundOn,ftueGoalDone,scenarioTimeLimit,rivalEventActive,lang,lastBuilt,startPerk,weeklyChallengeMod,sandboxGoal,segArrivalShown};

  const season=SEASONS[Math.floor(((day-1)%120)/SL)];
  const rb=getRB(researched);
  const addLog=msg=>setLogs(p=>[msg,...p.slice(0,9)]);

  const getFullState=useCallback(()=>({
    version:"2.2",
    grid,zoneGrid,ownedGrid,parcels,money,day,visitors,sat,clean,fee,hired,totalRev,totalVis,loans,campaigns,passOn,passPrice,passHolders,prestigeBonus,vipCount,researched,researchPoints,activeMissions,completedMissions,ridePrices,shopMults,pricingMode,dailyHistory,gameMode,currentScenario,difficulty,scenarioTimeLimit,
    staffLevels,rivals,pressReviews,visitorRatings,
    activeHoliday,holidayHistory,pendingInvestor,activeInvestment,investmentHistory,mapType,earnedMedals,
    activeDailyChallenge,dailyChallengeHistory,profitStreakDays,startPerk,weeklyChallengeMod,
    lifetimeRP,weeklyBadges,
    meta:{day,money,stars:calcParkRating(grid,zoneGrid,calcStats(grid,zoneGrid,hired,rb),sat,clean).stars,mode:gameMode,scenario:currentScenario,savedAt:Date.now()},
  }),[grid,zoneGrid,ownedGrid,parcels,money,day,visitors,sat,clean,fee,hired,totalRev,totalVis,loans,campaigns,passOn,passPrice,passHolders,prestigeBonus,vipCount,researched,researchPoints,activeMissions,completedMissions,ridePrices,shopMults,pricingMode,dailyHistory,gameMode,currentScenario,difficulty,scenarioTimeLimit,rb,staffLevels,rivals,pressReviews,visitorRatings,activeHoliday,holidayHistory,pendingInvestor,activeInvestment,investmentHistory,mapType,earnedMedals,activeDailyChallenge,dailyChallengeHistory,profitStreakDays,startPerk,weeklyChallengeMod,lifetimeRP,weeklyBadges]);

  const saveToSlot=useCallback((slotIdx)=>{
    const state=getFullState();
    const newSlots=[...loadSaveSlots()];
    newSlots[slotIdx]=state;
    const saveResult=writeSaveSlots(newSlots);
    if(saveResult&&!saveResult.ok){
      if(saveResult.quota) setSaveQuotaWarning(true);
    } else {
      setSaveSlots(newSlots);
      setLastSavedSlot(slotIdx);
      addLog(t("log.saved", { slot: slotIdx + 1 }));
    }
    setTimeout(()=>setLastSavedSlot(null),2000);
  },[getFullState, t]);

  const exportSaveURL = useCallback(async () => {
    try {
      const state = getFullState();
      const json = JSON.stringify(state);
      let encoded;
      try {
        // gzip compression via CompressionStream (Chrome 80+, Firefox 113+, Safari 16.4+)
        const buf = await new Response(
          new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'))
        ).arrayBuffer();
        const bytes = new Uint8Array(buf);
        let b64 = '';
        for (let i = 0; i < bytes.length; i++) b64 += String.fromCharCode(bytes[i]);
        encoded = 'z:' + btoa(b64);
      } catch {
        // fallback: no compression
        encoded = btoa(encodeURIComponent(json));
      }
      const url = `${window.location.origin}${window.location.pathname}?save=${encoded}`;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        addLog(lang==="ko"?"📋 저장 URL 복사됨!":"📋 Save URL copied!");
      } else {
        window.prompt(lang==="ko"?"저장 URL (복사하세요):":"Save URL:", url);
      }
    } catch(e) {
      addLog(lang==="ko"?"❌ 내보내기 실패":"❌ Export failed");
    }
  }, [getFullState, addLog, lang]);

  const sharePark = useCallback(async () => {
    const rating = calcParkRating(grid, zoneGrid, calcStats(grid, zoneGrid, hired, rb), sat, clean);
    const stars = "⭐".repeat(rating.stars);
    const text = lang === "ko"
      ? `🎡 Parcadia — ${stars}\n방문객: ${visitors.toLocaleString()}명 | Day ${day} | 순이익: $${Math.max(0,dailyHistory[dailyHistory.length-1]?.net||0).toLocaleString()}\n`
      : `🎡 Parcadia — ${stars}\nVisitors: ${visitors.toLocaleString()} | Day ${day} | Net: $${Math.max(0,dailyHistory[dailyHistory.length-1]?.net||0).toLocaleString()}\n`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Parcadia 🎡", text, url: window.location.href });
        addLog(lang==="ko"?"📤 공유됨!":"📤 Shared!");
      } else {
        await navigator.clipboard.writeText(text + window.location.href);
        addLog(lang==="ko"?"📋 공유 텍스트 복사됨!":"📋 Share text copied!");
      }
    } catch { addLog(lang==="ko"?"❌ 공유 실패":"❌ Share failed"); }
  }, [grid, zoneGrid, hired, rb, sat, clean, visitors, day, dailyHistory, lang, addLog]);

  const loadFromSlot=useCallback((slotData)=>{
    if(!slotData) return;
    // version migration
    if(!slotData.version) {
      // v1.x → v2.2: ensure staffLevels and other Phase-2+ fields exist
      slotData = {...slotData, version:"2.2",
        staffLevels: slotData.staffLevels||{janitor:1,mechanic:1,security:1,entertainer:1},
        rivals: slotData.rivals||[], pressReviews: slotData.pressReviews||[],
        earnedMedals: slotData.earnedMedals||[], lifetimeRP: slotData.lifetimeRP||0,
        weeklyBadges: slotData.weeklyBadges||[],
      };
    }
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
    setProfitStreakDays(slotData.profitStreakDays||0);
    setStartPerk(slotData.startPerk||null);
    setWeeklyChallengeMod(slotData.weeklyChallengeMod||null);
    if(slotData.lifetimeRP) setLifetimeRP(slotData.lifetimeRP);
    if(slotData.weeklyBadges) setWeeklyBadges(slotData.weeklyBadges);
    setScenarioResult(null);
    setSpeed(0);
    setScreen("game");
  },[]);

  const startGame=useCallback((mode,scenarioId,diff,perk=null,wc=null)=>{
    const diffConf=DIFFICULTY_SETTINGS[diff||"normal"];
    if(mode!=="campaign") setScenarioTimeLimit(0);
    let startMoney=diffConf.startMoney;
    if(wc?.moneyMult) startMoney=Math.floor(startMoney*(wc.moneyMult));
    setStartPerk(perk||null);
    setWeeklyChallengeMod(wc||null);
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
    } else if(mode==="challenge"&&wc?.gridRestrict){
      startOwned=mkOwned(wc.gridRestrict);
    }
    if(wc?.timeLimit&&mode!=="campaign") setScenarioTimeLimit(wc.timeLimit);

    // Easy challenge: pre-place entrance + carousel + food stall to accelerate early game
    if(diff==="easy"&&mode==="challenge"&&!scenarioId){
      const cr=Math.floor(GR/2),cc2=Math.floor(GC/2);
      const freeE=(w,h,pr,pc)=>{const ok=(r,c)=>{if(r<2||r+h>GR-2||c<2||c+w>GC-2) return false;for(let dr=0;dr<h;dr++) for(let dc=0;dc<w;dc++) if(startGrid[r+dr]?.[c+dc]) return false;return true;};if(ok(pr,pc)) return [pr,pc];for(let d=1;d<10;d++){for(let dr=-d;dr<=d;dr++) for(let dc=-d;dc<=d;dc++) if((Math.abs(dr)===d||Math.abs(dc)===d)&&ok(pr+dr,pc+dc)) return [pr+dr,pc+dc];}return null;};
      const ep=freeE(2,1,cr,Math.floor(GC*0.35));
      if(ep){startGrid[ep[0]][ep[1]]={type:"entrance",level:0,broken:false};startGrid[ep[0]][ep[1]+1]={type:"entrance",ref:[ep[0],ep[1]]};}
      const cp=freeE(2,2,cr-1,Math.floor(GC*0.42));
      if(cp){startGrid[cp[0]][cp[1]]={type:"carousel",level:0,broken:false};for(let dr=0;dr<2;dr++) for(let dc=0;dc<2;dc++) if(dr||dc) startGrid[cp[0]+dr][cp[1]+dc]={type:"carousel",ref:[cp[0],cp[1]]};}
      const fp=freeE(1,1,cr,Math.floor(GC*0.5));
      if(fp) startGrid[fp[0]][fp[1]]={type:"foodStall",level:0,broken:false};
    }

    // freeBuild perk: pre-place carousel and snack bar, avoiding preBuilt collisions
    if(perk==="freeBuild"&&mode!=="sandbox"){
      const cr=Math.floor(GR/2),cc2=Math.floor(GC/2);
      // Find first free w×h block near a preferred position (spiral outward)
      const findFree=(w,h,prefR,prefC)=>{
        const ok=(r,c)=>{
          if(r<2||r+h>GR-2||c<2||c+w>GC-2) return false;
          for(let dr=0;dr<h;dr++) for(let dc=0;dc<w;dc++) if(startGrid[r+dr]?.[c+dc]) return false;
          return true;
        };
        if(ok(prefR,prefC)) return [prefR,prefC];
        for(let d=1;d<12;d++){
          for(let dr=-d;dr<=d;dr++) for(let dc=-d;dc<=d;dc++){
            if(Math.abs(dr)===d||Math.abs(dc)===d) if(ok(prefR+dr,prefC+dc)) return [prefR+dr,prefC+dc];
          }
        }
        return null;
      };
      const carPos=findFree(2,2,cr,cc2-1);
      if(carPos){
        const [r,c]=carPos;
        startGrid[r][c]={type:"carousel",level:0,broken:false};
        startGrid[r+1][c]={type:"carousel",ref:[r,c]};
        startGrid[r][c+1]={type:"carousel",ref:[r,c]};
        startGrid[r+1][c+1]={type:"carousel",ref:[r,c]};
        const fsPos=findFree(1,1,r,c+3);
        if(fsPos) startGrid[fsPos[0]][fsPos[1]]={type:"foodStall",level:0,broken:false};
      }
    }

    // lifetimeRP meta-progression bonus for campaign starts
    const ltRP=parseInt(localStorage.getItem('pt_lifetimeRP')||'0',10)||0;
    const lifetimeBonus=mode==="campaign"?Math.min(10000,Math.floor(ltRP*500)):0;
    if(lifetimeBonus>0) startMoney+=lifetimeBonus;

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
    setRivals([]);setPressReviews([]);setVisitorRatings([]);setPendingReview(null);
    setActiveHoliday(null);setHolidayHistory([]);setPendingInvestor(null);setActiveInvestment(null);setInvestmentHistory([]);
    setActiveDailyChallenge(null);setDailyChallengeHistory([]);setDisasterWarning(null);setBubbles([]);
    setFirstVisitorCelebration(false);firstVisitorRef.current=false;
    // Reset session-specific states
    setSegArrivalShown(false);setZoneFtueShown(false);setShowZoneFtue(false);setSandboxGoal(null);setShowFireworks(false);tickCountRef.current=0;
    const newMapType=mode==="sandbox"?"default":mode==="campaign"?({s2:"beach",s3:"default",s5:"forest"}[scenarioId]||"default"):MAP_TYPES[Math.floor(Math.random()*MAP_TYPES.length)].id;
    setMapType(newMapType);
    setSelected(null);setClickedTile(null);setBuildMode("build");setZonePaint(null);setSaveConfirm(null);setStageUpFlash(false);prevStageRef.current=1;setBankruptcyDays(0);setProfitStreakDays(0);setPendingSeasonalAction(null);setPendingStartParams(null);
    setTab("build");

    setTutorialStep(0);

    const startLog = mode === "sandbox" 
      ? t("log.startSandbox")
      : mode === "campaign" 
      ? t("log.startCampaign", { name: t(`scn.${scenarioId}`), desc: t(`scn.${scenarioId}.desc`) }) 
      : t("log.startChallenge", { name: t(`diff.${diff}`), money: startMoney.toLocaleString() });
    
    setLogs([startLog]);
    setScreen("game");
  },[t]);

  useEffect(()=>{
    const scale=uiSettings.fontSize==='small'?0.85:uiSettings.fontSize==='large'?1.2:1.0;
    document.body.style.zoom=scale;
    try{localStorage.setItem('uiSettings',JSON.stringify(uiSettings));}catch{}
  },[uiSettings]);

  useEffect(()=>{ setTutCardOffsetY(0); },[tutorialStep]);
  // 5단계 튜토리얼: 스텝 5(직원 고용) 도달 시 경영 탭 자동 오픈
  useEffect(()=>{
    if(!tutorialStep) return;
    if(tutorialStep===5) setTab("manage");
  },[tutorialStep]);

  useEffect(()=>{
    if(tutorialStep===0||screen!=="game") return;
    const hasEntrance=grid.some(r=>r.some(c=>c?.type==="entrance"));
    const hasPathTile=grid.some(r=>r.some(c=>c?.type==="_path"||c?.type==="_pathFancy"));
    const hasRide=grid.some(r=>r.some(c=>c&&B[c.type]?.cat==="ride"&&c.type!=="entrance"));
    const hasZone=zoneGrid.flat().some(v=>v);
    const advance=(n)=>{setTutFlash(true);setTimeout(()=>setTutFlash(false),700);setTutorialStep(n);};
    // 스텝 1-3: 건설 액션 완료
    if(tutorialStep===1&&hasEntrance) advance(2);
    else if(tutorialStep===2&&hasPathTile) advance(3);
    else if(tutorialStep===3&&hasRide) advance(4);
    // 스텝 4: 재생 + 첫 방문객 도착까지 대기
    else if(tutorialStep===4&&speed>0&&visitors>0) advance(5);
    // 스텝 5: 직원 고용 → 완료 (6)
    else if(tutorialStep===5&&(hired.janitor>0||hired.mechanic>0||hired.entertainer>0)) advance(6);
  },[grid,speed,hired,tutorialStep,screen,zoneGrid,visitors]);

  useEffect(()=>{
    const handleResize=()=>{
      const w=window.innerWidth;
      const newBp=w<600?"mobile":w<1024?"tablet":"pc";
      setBp(newBp);
      if(newBp==="mobile") setPanelCollapsed(true);
      if(newBp==="pc") setPanelCollapsed(false);
    };
    window.addEventListener('resize',handleResize);
    handleResize(); // call once on mount
    return()=>window.removeEventListener('resize',handleResize);
  },[]);

  // Phase 2-6: Zone Mastery calculation (must be before useEffect that depends on it)
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

  // 구역 보너스 활성화 시 floating text 연출
  useEffect(()=>{
    if(screen!=="game") return;
    Object.entries(zoneMastery).forEach(([k,v])=>{
      if(v.mastered&&!prevMasteryRef.current[k]){
        const ts=Date.now();
        const col=ZONES[k]?.color||"#5EF6A0";
        setGridPopups(p=>[...p.slice(-6),{id:ts,text:`✨ ${ZONES[k]?.emoji||""} +${Math.round(v.bonus*100)}% 구역 보너스 활성화!`,color:col,r:Math.floor(GR/2),c:Math.floor(GC/2),expires:ts+3500}]);
      }
      prevMasteryRef.current[k]=v.mastered;
    });
  },[zoneMastery,screen]);

  useEffect(()=>{
    if(speed===0||screen!=="game") return;
    const ms=speed===3?TICK/5:speed===2?TICK/2.5:TICK;
    const id=setInterval(()=>{
      const{grid:g,zoneGrid:zg,sat:s0,clean:cl0,fee,hired,day,loans,campaigns:camps,passOn:pe,passPrice:pp,passHolders:ph,prestigeBonus:pb,researched:res,activeMissions:ams,completedMissions:cms,activeDisaster:ad,ridePrices:rp,shopMults:sm,pricingMode:pm,gameMode:gm,currentScenario:cs,difficulty:diff,scenarioResult:sr,weather:wth,weatherTimer:wthTimer,staffLevels:sLvls,rivals:rivalsCur,pressReviews:prevReviews,visitorRatings:vRatings,activeHoliday:ah,holidayHistory:hhist,pendingInvestor:pinv,activeInvestment:ainv,investmentHistory:invHist,mapType:mtype,earnedMedals:emed}=ref.current;
      const ssn=SEASONS[Math.floor(((day-1)%120)/SL)];
      const seasonIdx=Math.floor(((day-1)%120)/SL);
      const rb=getRB(res);
      const diffConf=DIFFICULTY_SETTINGS[diff]||DIFFICULTY_SETTINGS.normal;

      // Phase 2-1: mechanic level bonuses
      const mechUpg=STAFF_UPGRADES.mechanic[Math.min(sLvls.mechanic-1,2)];
      const mechRepairMult=mechUpg.repairMult||0.3;
      const mechBreakMult=mechUpg.breakMult||0.3;
      // Phase 1-4: scenario-specific constraint data
      const scnDataTick=SCENARIOS.find(sc=>sc.id===cs);
      const scnConstraints=scnDataTick?.constraints||{};
      const scnBreakMult=scnConstraints.breakChanceMult||1;
      const newGrid=g.map(row=>row.map(cell=>{
        if(!cell||cell.ref) return cell;
        const bc=BREAK_CHANCE[cell.type];if(!bc) return cell;
        if(cell.broken) return(hired.mechanic>0&&Math.random()<(hired.mechanic*mechRepairMult+rb.autoRepairBonus))?{...cell,broken:false}:cell;
        return Math.random()<Math.max(0.001,bc*scnBreakMult*rb.breakMult*(1-hired.mechanic*mechBreakMult))?{...cell,broken:true}:cell;
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

      const segsRaw=calcSegs(newGrid);
      // coupleBoost perk: override couple proportion to 0.60
      const segs=ref.current.startPerk==="coupleBoost"
        ?{...segsRaw,couple:0.60,family:Math.min(segsRaw.family||0,0.15),thrill:Math.min(segsRaw.thrill||0,0.10),child:Math.min(segsRaw.child||0,0.08),general:Math.max(0,(1-0.60-(Math.min(segsRaw.family||0,0.15))-(Math.min(segsRaw.thrill||0,0.10))-(Math.min(segsRaw.child||0,0.08))))}
        :segsRaw;
      const spendMult=(segs.family||0)*1.2+(segs.couple||0)*1.5+(segs.thrill||0)*0.8+(segs.child||0)*0.5+(segs.general||0)*1.0;
      const parkRat=calcParkRating(newGrid,zg,s,s0,cl0,pb);
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

      // Phase 1-4: scenario constraint sat rules
      let scnSatMod=0;
      if(scnConstraints.satRules&&gm==="campaign"){
        for(const rule of scnConstraints.satRules){
          if(rule.type==="coupleBelow"&&(segs.couple||0)<rule.threshold) scnSatMod+=rule.penalty||0;
          else if(rule.type==="coupleAbove"&&(segs.couple||0)>=rule.threshold) scnSatMod+=rule.bonus||0;
          else if(rule.type==="feeLow"&&fee<rule.threshold) scnSatMod+=rule.penalty||0;
          else if(rule.type==="feeHigh"&&fee>=rule.threshold) scnSatMod+=rule.bonus||0;
          else if(rule.type==="noRestroom"&&!cc2.restroom) scnSatMod+=rule.penalty||0;
          else if(rule.type==="noWaterRide"&&!cc2.waterRide) scnSatMod+=rule.penalty||0;
          else if(rule.type==="familyAbove"&&(segs.family||0)>rule.threshold) scnSatMod+=rule.penalty||0;
          else if(rule.type==="starBelow"&&(day+1)>=(rule.afterDay||0)&&parkRat.stars<rule.threshold) scnSatMod+=rule.penalty||0;
        }
      }
      const scnFeeCapPen=(scnConstraints.admFeeCap&&fee>scnConstraints.admFeeCap&&gm==="campaign")?(scnConstraints.admFeeCapPenalty||0):0;

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
      const rivalSteal=gm!=="sandbox"?Math.min(0.20,totalRivalPres/(parkRat.final*2+totalRivalPres+1)*0.4):0;
      // Phase 3-2: Rival events
      const curRivalEvent=ref.current.rivalEventActive;
      let newRivalEvent=curRivalEvent;
      if(curRivalEvent){
        newRivalEvent=curRivalEvent.remaining>1?{...curRivalEvent,remaining:curRivalEvent.remaining-1}:null;
        if(!newRivalEvent) addLog(lang==="ko"?`✅ 경쟁사 이벤트 종료 — 정상 운영 재개`:`✅ Rival event ended — normal operations resumed`);
      } else if(newRivals.length>0&&gm!=="sandbox"&&(day+1)%12===0&&Math.random()<0.4){
        const ev=RIVAL_EVENTS[Math.floor(Math.random()*RIVAL_EVENTS.length)];
        const rival=newRivals[Math.floor(Math.random()*newRivals.length)];
        const rName=rival.name[lang]||rival.name.ko;
        newRivalEvent={...ev,remaining:ev.dur,rivalName:rName};
        addLog(`${ev.emoji} ${lang==="ko"?`${rName}: ${ev.name.ko}! ${ev.desc.ko}`:`${rName}: ${ev.name.en}! ${ev.desc.en}`}`);
        if(ref.current.soundOn) playSound("disaster");
      }
      setRivalEventActive(newRivalEvent);
      const rivalEventVisMult=newRivalEvent?newRivalEvent.visMult:1.0;
      const rivalEventSatPen=newRivalEvent?newRivalEvent.satPen:0;
      const curMap=MAP_TYPES.find(m=>m.id===mtype)||MAP_TYPES[0];
      const mapVisMult=curMap.visMultSeason[seasonIdx]||1;
      const holidayVisMult=ah?(1+(ah.visMult-1)*rb.holidayEventMult)*(ah.actionBoosted?ah.actionVisMult||1.15:1):1;
      // s7 night cycle: daytime=0.55x, nighttime=1.55x, 3-day periods
      const scnData=SCENARIOS.find(sc=>sc.id===cs);
      const nightCycle=scnData?.nightCycle;
      const nightPhase=nightCycle?(Math.floor(day/3)%2===1):false;
      const s7VisMult=nightCycle?(nightPhase?1.55:0.55):1;
      if(nightCycle&&day%3===0&&day>0) addLog(nightPhase?(lang==="ko"?"🌙 야간 영업 시작! 방문객 급증":"🌙 Night opens! Visitor surge"):(lang==="ko"?"☀️ 낮 시간 — 방문객 감소":"☀️ Daytime — visitors reduced"));
      // Opening bonus: Grand Opening buzz fades over first 7 days
      const openingBonus=day<=3?1.5:day<=7?1.2:1.0;
      const rawVis=Math.max(0,Math.floor(s.attraction*2.5*(1+hired.entertainer*(0.05+entVisMult))*(0.4+(s0/100)*0.9)*ssn.mult*feeEff*(1+campBoost)*(1+(parkRat.stars-1)*0.10)*(1+rb.globalVisBonus)*(1+rb.coupleBonus*(segs.couple||0))*feePenalty*stgVisMult*wth.visMult*ratingVisMult*(1-rivalSteal)*mapVisMult*holidayVisMult*openingBonus*rivalEventVisMult*s7VisMult));
      const congested=s.capacity>0&&rawVis>s.capacity;
      let vis=Math.floor(Math.max(0,(congested?s.capacity*1.05:rawVis)*visMult));
      if(s.hasEntrance&&s.attraction>0&&vis<3) vis=3;
      // Press review visitor boost/penalty (active for 12 days after review)
      const activeReview=prevReviews.length>0?prevReviews[prevReviews.length-1]:null;
      const pressVisBoost=(activeReview&&(day+1-activeReview.day)<=12)?(activeReview.grade==="S"?0.20:activeReview.grade==="A"?0.10:activeReview.grade==="C"?-0.05:activeReview.grade==="D"?-0.15:0):0;
      vis=Math.max(0,Math.round(vis*(1+pressVisBoost)));

      const admRev=pm!=="per_ride"?vis*fee*rb.admissionMult:0;
      const rideRev=calcRideTicketRev(cc2,vis,s.attraction,rp,pm);
      const shopMul=avgShopMult(cc2,sm);
      const shopRev=vis*s.rpv*spendMult*shopMul;
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
      const coupleBoostSat=ref.current.startPerk==="coupleBoost"?5:0;
      const newSat=Math.min(100,Math.max(5,s0+hired.janitor*janSatBonus+hired.security*secSatBonus+s.satBonus+baseSatDelta+cleanMod+(congested&&vis>0?-5:0)+Math.min(0,-s.brokenCount*2)+segSatMod(newGrid,segs)+Math.min(0,-s.isolatedCount)+(fee>maxFee?-6:0)-satPenExtra+wth.satMod+holidaySatMod-rivalEventSatPen*0.5+coupleBoostSat+scnSatMod+scnFeeCapPen));

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
      const disasterGuardActive=ref.current.startPerk==="disasterGuard"&&day<10;
      const wcDisasterMult=ref.current.weeklyChallengeMod?.disasterMult||1;
      const fastResearchDisMult=ref.current.startPerk==="fastResearch"?1.5:1;
      if(!newDisaster&&!dWarn&&gm!=="sandbox"&&!disasterGuardActive&&day>=10&&Math.random()<0.015*diffConf.disasterMult*disasterPen*wcDisasterMult*fastResearchDisMult+(newSat<40?0.01:0)){
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
          const disTs=Date.now();
          setGridPopups(prev=>[...prev.slice(-5),{id:disTs,text:`🚨 ${t("dis."+d.id)}`,color:"#FF5757",r:8,c:15,expires:disTs+3000}]);
          if(ref.current.soundOn) playSound("disaster");
          saveToSlot(0);
        }
      }

      // Mid-game bonus events (~4% chance per day, from day 20 onwards; scale with stage)
      if(!newDisaster&&!dWarn&&gm!=="sandbox"&&day>=20&&Math.random()<0.04){
        const evPool=BONUS_EVENTS.filter(e=>e.id!==lastBonusEventRef.current);
        const ev=(evPool.length?evPool:BONUS_EVENTS)[Math.floor(Math.random()*(evPool.length||BONUS_EVENTS.length))];
        lastBonusEventRef.current=ev.id;
        const evStageScale=[1,1,1.5,2,3,4][curStage.id]||1;
        const evMoney=Math.round((ev.reward.$||0)*evStageScale);
        const evRp=Math.round((ev.reward.rp||0)*evStageScale);
        if(evMoney>0) setMoney(m=>m+evMoney);
        if(evRp>0) setResearchPoints(rp=>rp+evRp);
        addLog(`${ev.emoji} ${lang==="ko"?ev.name.ko:ev.name.en}!${evMoney>0?` +$${evMoney.toLocaleString()}`:""}${evRp>0?` +${evRp}RP`:""}`);
        const evTs=Date.now();
        const evLabel=`${ev.emoji} ${evMoney>0?`+$${evMoney.toLocaleString()}`:""}${evRp>0?` +${evRp}RP`:""}`;
        setGridPopups(prev=>[...prev.slice(-5),{id:evTs,text:evLabel,color:"#5EF6A0",r:8,c:15,expires:evTs+2800}]);
        if(ref.current.soundOn) playSound("mission");
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
        if(prestigeMod!==0) setPrestigeBonus(pb=>pb+Math.round(prestigeMod*rb.prestigeRateMult));
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
      const ms={vis,sat:newSat,clean:newClean,pres:parkRat.stars,pass:newPH,rides:rideCount,vips:ref.current.vipCount,zones:zoneTiles,net,research:res.length,debt:newLoans.reduce((t,l)=>t+l.remaining,0),paths:pathCount,profitStreak:ref.current.profitStreakDays,totalVis:ref.current.totalVis,staffMaxed:Object.values(sLvls).every(v=>v>=3)};
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
            setMedalFlash(best.medal);
            setTimeout(()=>setMedalFlash(null),3500);
            setSpeed(0);
            addLog(t("log.medalAchieved", {medal: best.medal, desc: best.desc}));
            setEarnedMedals(prev=>{
              const exists=prev.find(m=>m.scenarioId===cs&&m.medalId===best.id);
              if(exists) return prev;
              return [...prev,{scenarioId:cs,medalId:best.id,day:day+1}];
            });
            if(['gold','platinum'].includes(best.id)){
              setSpeedrunRecords(prev=>{const cur=prev[cs];if(!cur||day+1<cur){const n={...prev,[cs]:day+1};try{localStorage.setItem('pt_speedrun',JSON.stringify(n));}catch{}return n;}return prev;});
            }
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
          const stageScale=[1,1,1.5,2,3,4][curStage.id]||1;
          const scaledMoney=Math.round(adc.reward.$*stageScale);
          const scaledRp=Math.round(adc.reward.rp*stageScale);
          setMoney(m=>m+scaledMoney);
          setResearchPoints(rp=>rp+scaledRp);
          setActiveDailyChallenge(prev=>prev?{...prev,claimed:true}:null);
          setDailyChallengeHistory(h=>[...h,adc.id]);
          setWeeklyBadges(prev=>[...prev,{id:"wk_"+Date.now(),name:adc.name[lang]||adc.name.ko,emoji:"🏅",earned:day+1}]);
          addLog(`✅ ${lang==="ko"?`챌린지 완료: ${adc.name.ko}! +$${scaledMoney.toLocaleString()} +${scaledRp}RP`:`Challenge done: ${adc.name.en}! +$${scaledMoney.toLocaleString()} +${scaledRp}RP`}`);
          if(ref.current.soundOn) playSound("mission");
        }
      }

      // Feature 2: Day 1-5 slow day hint
      if(day<=5&&vis<5&&ref.current.speed<2&&[1,3,5].includes(day)&&!quietHintShownRef.current.has(day)){
        quietHintShownRef.current.add(day);
        addLog(lang==="ko"?`💡 Day${day}: 조용하네요 — ⏩ 빠른배속으로 시간을 넘겨보세요!`:`💡 Day${day}: Slow day — try ⏩ fast-forward!`);
      }

      // Feature 3: Random building special events (1.5% chance per tick)
      if(Math.random()<0.015){
        const builtCells=ref.current.grid.flat().filter(c=>c&&!c.ref&&BUILDING_EVENTS[c.type]);
        if(builtCells.length>0){
          const cell=builtCells[Math.floor(Math.random()*builtCells.length)];
          const evts=BUILDING_EVENTS[cell.type];
          const evt=evts[Math.floor(Math.random()*evts.length)];
          addLog(ref.current.lang==="ko"?evt.ko:evt.en);
          if(evt.satBonus) setSat(s=>Math.min(100,s+evt.satBonus));
          if(evt.moneyBonus) setMoney(m=>m+evt.moneyBonus);
          const evtGrid=ref.current.grid;
          const evtR=evtGrid.findIndex(row=>row.some(c=>c&&c.type===cell.type&&!c.ref));
          const evtC=evtR>=0?evtGrid[evtR].findIndex(c=>c&&c.type===cell.type&&!c.ref):-1;
          if(evtR>=0&&evtC>=0){
            const evtTs=Date.now();
            const evtTxt=ref.current.lang==="ko"?evt.ko.split(' ').slice(0,3).join(' '):evt.en.split(' ').slice(0,4).join(' ');
            setBubbles(p=>[...p.filter(b=>b.expires>Date.now()),{id:evtTs,r:evtR,c:evtC,text:evtTxt,expires:evtTs+4000}]);
          }
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
        // Phase 3-4: generate 2-day weather forecast on weather change
        setWeatherForecast([pickWeather(si),pickWeather(si)]);
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
          if(evtForSeason.actionCost){
            setPendingSeasonalAction({event:evtForSeason,expiresDay:day+3});
          }
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
      // Opening buzz log
      if(day===3) addLog(lang==="ko"?"🎉 오픈 버즈 약화 — 방문객 +20% 보너스 (Day 7까지)":"🎉 Opening buzz fading — +20% visitor bonus until Day 7");
      if(day===7) addLog(lang==="ko"?"📊 오픈 특수 기간 종료 — 정상 운영 시작":"📊 Opening period ended — normal operations begin");
      // Quiet-day speed hint (Day 1/3/5, visitors<5, speed<2)
      if([1,3,5].includes(day)&&vis<5&&ref.current.speed<2&&!quietHintShownRef.current.has(day)){
        quietHintShownRef.current.add(day);
        addLog(lang==="ko"?`💡 Day${day}: 조용하네요 — ⏩ 빠른배속으로 시간을 넘겨보세요!`:`💡 Day${day}: Slow day — try ⏩ fast-forward!`);
      }
      // Building special events (1.5% chance per tick)
      if(Math.random()<0.015){
        const eventCells=newGrid.flat().filter(c=>c&&!c.ref&&!c.broken&&BUILDING_EVENTS[c.type]);
        if(eventCells.length>0){
          const cell=eventCells[Math.floor(Math.random()*eventCells.length)];
          const evt=BUILDING_EVENTS[cell.type][Math.floor(Math.random()*BUILDING_EVENTS[cell.type].length)];
          addLog(lang==="ko"?evt.ko:evt.en);
          if(evt.satBonus) setSat(s=>Math.min(100,s+evt.satBonus));
          if(evt.moneyBonus) setMoney(m=>m+evt.moneyBonus);
          // Find origin cell position for bubble
          let evtR=-1,evtC=-1;
          outer2: for(let rr=0;rr<GR;rr++) for(let cc2=0;cc2<GC;cc2++){if(newGrid[rr][cc2]===cell){evtR=rr;evtC=cc2;break outer2;}}
          if(evtR>=0) setBubbles(p=>[...p.filter(b=>b.expires>Date.now()).slice(-3),{id:Date.now(),r:evtR,c:evtC,text:(lang==="ko"?evt.ko:evt.en).slice(0,18),expires:Date.now()+4000}]);
        }
      }
      setGrid(newGrid);setSat(newSat);setClean(newClean);setSegData(segs);
      setMoney(m=>m+net+mM);setVisitors(vis);setLoans(newLoans);setCampaigns(newCamps);
      setPassHolders(newPH);setActiveDisaster(newDisaster);
      setTotalRev(r=>{const nr=r+Math.max(0,totalRevDay);if(r===0&&nr>0) addLog(lang==="ko"?`💰 첫 수익 $${Math.floor(totalRevDay).toLocaleString()} 달성! 경영 탭에서 직원을 고용해보세요 🧹`:`💰 First revenue $${Math.floor(totalRevDay).toLocaleString()}! Head to Manage tab to hire staff 🧹`);return nr;});setTotalVis(t=>t+vis);setDay(d=>d+1);
      // RP: 기본 3/일 + 방문객 20명당 +1 (최대 +5) + 미션 보상 + perk 보너스
      const rpBase=Math.min(10,4+Math.floor(vis/20));
      const rpGain=(ref.current.startPerk==="rpBoost"?rpBase*2:ref.current.startPerk==="fastResearch"?Math.floor(rpBase*1.5):rpBase)+mR;
      setResearchPoints(p=>p+rpGain);
      // lifetimeRP meta-progression accumulation
      setLifetimeRP(p=>{const nv=p+rpGain;try{localStorage.setItem('pt_lifetimeRP',String(nv));}catch{}return nv;});
      // Hall of Fame: update best records
      setHof(prev=>{const nv={vis:Math.max(prev.vis||0,vis),day:Math.max(prev.day||0,day+1),net:Math.max(prev.net||0,net)};if(nv.vis!==(prev.vis||0)||nv.day!==(prev.day||0)||nv.net!==(prev.net||0)){try{localStorage.setItem('pt_hof',JSON.stringify(nv));}catch{}return nv;}return prev;});
      setActiveMissions(newActive);setCompletedMissions(newCompleted);
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
      setProfitStreakDays(net>0?(ref.current.profitStreakDays||0)+1:0);
      if (newBkDays >= 5) {
        setScenarioResult({medal:null, scenario:cs, day:day+1, bankrupt:true});
        setSpeed(0);
        addLog(lang==="ko" ? "💸 파산! 5일 연속 적자로 공원이 폐쇄됐습니다." : "💸 Bankrupt! Park closed due to sustained losses.");
        return;
      }

      // Revenue floating popup every 3 ticks
      tickCountRef.current=(tickCountRef.current||0)+1;
      if(tickCountRef.current%3===0&&totalRevDay>0&&vis>0){
        const popTs=Date.now();
        const pr=Math.floor(Math.random()*(GR-4))+2;
        const pc=Math.floor(Math.random()*(GC-4))+2;
        setGridPopups(prev=>[...prev.slice(-6),{id:popTs,text:`+$${Math.floor(totalRevDay).toLocaleString()}`,color:"#00E5A0",r:pr,c:pc,expires:popTs+2200}]);
      }

      // Sandbox goal check
      const sg=ref.current.sandboxGoal;
      if(sg&&!sg.achieved){
        const sgMs={vis,sat:newSat,net,clean:newClean,stars:parkRat.stars,money:ref.current.money+net,day:day+1};
        let achieved=false;
        if(sg.type==="vis"&&sgMs.vis>=sg.target) achieved=true;
        else if(sg.type==="sat"&&sgMs.sat>=sg.target) achieved=true;
        else if(sg.type==="money"&&sgMs.money>=sg.target) achieved=true;
        else if(sg.type==="stars"&&sgMs.stars>=sg.target) achieved=true;
        if(achieved){
          setSandboxGoal(prev=>prev?{...prev,achieved:true}:null);
          addLog(`🎯 ${lang==="ko"?`목표 달성: ${sg.label}!`:`Goal achieved: ${sg.label}!`}`);
          if(ref.current.soundOn) playSound("mission");
        }
      }

      // Fireworks on new medal or 5-star rating first time
      const prevMedLen=prevEarnedMedalsLenRef.current;
      const newMedLen=emed.length; // will be updated by setEarnedMedals above
      const prevStars=prevStarsRef.current;
      if((newMedLen>prevMedLen)||(parkRat.stars>=5&&prevStars<5)){
        setShowFireworks(true);
        if(fireworksTimerRef.current) clearTimeout(fireworksTimerRef.current);
        fireworksTimerRef.current=setTimeout(()=>setShowFireworks(false),3000);
      }
      prevEarnedMedalsLenRef.current=newMedLen;
      prevStarsRef.current=parkRat.stars;

      // segArrivalShown: one-time banner when first visitors arrive
      if(vis>0&&!ref.current.segArrivalShown){
        setSegArrivalShown(true);
      }

      if(!completing.length) addLog(warn||sEvt||t("log.daySummary", {day: day+1, vis, net: (net>=0?"+":"")+"$"+net.toLocaleString()}));
    },ms);
    return()=>clearInterval(id);
  },[speed,screen,t]);

  // === Pre-hook derivations (needed by useEffect dep arrays below) ===
  const stats=calcStats(grid,zoneGrid,hired,rb);
  const cc=bldCounts(grid);
  const parkRating=calcParkRating(grid,zoneGrid,stats,sat,clean,prestigeBonus);
  const totalBldCount=Object.values(cc).reduce((t,v)=>t+v,0);
  const currentStage=calcStage(totalBldCount,parkRating.stars,money);
  const stageProgress=currentStage.next?{
    bld:Math.min(1,totalBldCount/currentStage.next.bld),
    stars:Math.min(1,parkRating.stars/currentStage.next.stars),
    money:Math.min(1,money/currentStage.next.money),
  }:null;

  // Phase 3-5: achievement checking
  useEffect(()=>{
    if(screen!=="game") return;
    const goldMedals=earnedMedals.filter(m=>m.medalId==="gold").length;
    const totalLoans=loans.reduce((t,l)=>t+l.remaining,0);
    const achState={totalVis,stars:parkRating.stars,money,stageId:currentStage.id,clean,sat,day,goldMedals,totalLoans};
    const newOnes=ACHIEVEMENTS.filter(a=>!earnedAchievements.includes(a.id)&&a.check(achState));
    if(newOnes.length>0){
      setEarnedAchievements(prev=>[...prev,...newOnes.map(a=>a.id)]);
      const first=newOnes[0];
      setAchievementFlash(first);
      setTimeout(()=>setAchievementFlash(null),3500);
      addLog(`${first.emoji} ${lang==="ko"?`업적 달성: ${first.name.ko}!`:`Achievement: ${first.name.en}!`}`);
    }
  },[totalVis,parkRating.stars,money,currentStage.id,clean,sat,day,earnedMedals,loans]);

  const lastAutoSaveDay=useRef(-1);
  useEffect(()=>{
    if(screen!=="game"||day<2) return;
    if(day%2===0&&lastAutoSaveDay.current!==day){
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
      const pathSet=new Set(paths.map(p=>`${p.r},${p.c}`));
      // Build weighted segment pool once per tick for proportional dot emoji distribution
      const segKeys=Object.keys(SEGS);
      const totalW=segKeys.reduce((s,k)=>s+(segData[k]||0),0)||1;
      const segPool=[];segKeys.forEach(k=>{const cnt=Math.max(1,Math.round((segData[k]||0)/totalW*20));for(let j=0;j<cnt;j++) segPool.push(k);});
      setDots(prev=>prev.map((dot,dotIdx)=>{
        const sk=segPool[dotIdx%segPool.length]||"general";
        if(paths.length>2){
          // Step along adjacent path tiles for organic walking movement
          const adj=[];
          for(const[dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]){const nr=dot.r+dr,nc=dot.c+dc;if(pathSet.has(`${nr},${nc}`)) adj.push({r:nr,c:nc});}
          if(adj.length>0){const nxt=adj[Math.floor(Math.random()*adj.length)];return{...dot,r:nxt.r,c:nxt.c,emoji:SEGS[sk].emoji};}
          const snap=paths[Math.floor(Math.random()*Math.min(8,paths.length))];
          return{...dot,r:snap.r,c:snap.c,emoji:SEGS[sk].emoji};
        }
        const base=pool[Math.floor(Math.random()*pool.length)];
        return{...dot,r:Math.max(0,Math.min(GR-1,base.r+Math.floor(Math.random()*3)-1)),c:Math.max(0,Math.min(GC-1,base.c+Math.floor(Math.random()*3)-1)),emoji:SEGS[sk].emoji};
      }));
      // 15% 확률로 랜덤 방문객 말풍선 (2-2: 실제 상태 기반 컨텍스트 메시지)
      if(Math.random()<0.25&&ref.current.visitors>0){
        const curSat=ref.current.sat;
        const curClean=ref.current.clean;
        const brokenNow=ref.current.grid.flat().filter(c=>c&&!c.ref&&c.broken).length;
        let msgs;
        const isKo=ref.current.lang==="ko";
        if(curSat>75){
          msgs=isKo?["😊 재밌어요!","🎉 신났다!","👍 대박이야!","🎠 즐거워요!","⭐ 또 올게요!"]:["😊 So fun!","🎉 Excited!","👍 Amazing!","🎠 Enjoying it!","⭐ Coming back!"];
        } else if(curSat>50){
          msgs=isKo?["🤔 그냥 그래요","😐 보통이네..","💭 더 있으면 좋겠는데"]:["🤔 It's okay","😐 Pretty average..","💭 Could be better"];
        } else {
          const base=isKo?["🚫 별로예요","👎 실망이에요"]:["🚫 Not great","👎 Disappointed"];
          if(brokenNow>0) base.push(...(isKo?["😢 기구 고장났어요!","🔧 수리해주세요"]:["😢 Ride is broken!","🔧 Please fix it"]));
          if(curClean<40) base.push(...(isKo?["🗑️ 너무 더러워요!","😷 청소 좀.."]:["🗑️ Too dirty!","😷 Need cleaning.."]));
          if(curClean>=40&&brokenNow===0) base.push(...(isKo?["😤 혼잡해!","💸 입장료 비싸요"]:["😤 So crowded!","💸 Tickets too pricey"]));
          msgs=base;
        }
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
      if((e.key==="r"||e.key==="R")&&!e.ctrlKey&&!e.metaKey&&ref.current.lastBuilt){
        setSelected(ref.current.lastBuilt);setBuildMode("build");
      }
      if(e.code==="Tab"){e.preventDefault();const tabs=["build","manage","finance","marketing","research","mission"];setTab(t=>{const i=tabs.indexOf(t);return tabs[(i+1)%tabs.length];});}
      if((e.key==="b"||e.key==="B")&&!e.ctrlKey&&!e.metaKey){setBuildMode("build");setZonePaint(null);setSelected(null);}
      if((e.key==="d"||e.key==="D")&&!e.ctrlKey&&!e.metaKey){setBuildMode("demolish");setSelected(null);}
      if((e.key==="z"||e.key==="Z")&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey){setBuildMode("zone");setSelected(null);}
    };
    window.addEventListener("keydown",handler);
    return()=>window.removeEventListener("keydown",handler);
  },[screen]);

  // 드래그 건설/철거용 전역 mouseup
  useEffect(()=>{
    const handler=()=>{dragBuildRef.current={...dragBuildRef.current,active:false,moved:false};};
    window.addEventListener("mouseup",handler);
    return()=>window.removeEventListener("mouseup",handler);
  },[]);

  // 배경음악 persistence
  useEffect(()=>{try{localStorage.setItem('pt_bgmusic',bgMusicOn?'1':'0');}catch{}},[bgMusicOn]);
  useEffect(()=>{bgVolumeRef.current=bgVolume;try{localStorage.setItem('pt_bgvol',String(bgVolume));}catch{}
    if(bgMusicRef.current?.masterGain){
      const{masterGain,ctx}=bgMusicRef.current;
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.setValueAtTime(bgVolume*0.5,ctx.currentTime);
    }
  },[bgVolume]);

  // 배경음악 start/stop
  useEffect(()=>{
    if(bgMusicOn&&screen==='game'){
      if(bgMusicRef.current) return;
      try{
        const ctx=new(window.AudioContext||window.webkitAudioContext)();
        const masterGain=ctx.createGain();
        masterGain.gain.setValueAtTime(bgVolumeRef.current*0.5,ctx.currentTime);
        masterGain.connect(ctx.destination);
        const engine=_startMusicEngine(masterGain,ctx);
        bgMusicRef.current={ctx,masterGain,cleanup:engine.cleanup,setPhase:engine.setPhase};
      }catch{}
    } else {
      if(!bgMusicRef.current) return;
      const{cleanup,masterGain,ctx}=bgMusicRef.current;
      bgMusicRef.current=null;
      cleanup();
      try{masterGain.gain.linearRampToValueAtTime(0,ctx.currentTime+0.3);setTimeout(()=>{try{ctx.close();}catch{}},400);}catch{}
    }
  },[bgMusicOn,screen]);

  // Music phase: 0=early(day<21), 1=mid(day<61), 2=late(day>=61)
  useEffect(()=>{
    const phase=day<21?0:day<61?1:2;
    bgMusicRef.current?.setPhase?.(phase);
  },[day]);

  // Crowd murmur — volume scales with visitors
  const crowdRef=useRef(null);
  useEffect(()=>{
    if(screen!=='game'||!soundOn){crowdRef.current?.stop();crowdRef.current=null;return;}
    if(!crowdRef.current) crowdRef.current=startCrowdNoise();
    crowdRef.current.setVolume(Math.min(0.10, visitors*0.0003));
  },[screen,soundOn,visitors]);

  // Disaster drum — start low bass loop on warning, reduce BGM gain for tension
  useEffect(()=>{
    if(disasterWarning&&soundOn){
      if(!disasterDrumRef.current) disasterDrumRef.current=startDisasterDrum(0.14);
      if(bgMusicRef.current?.masterGain&&bgMusicRef.current?.ctx){
        const{masterGain,ctx}=bgMusicRef.current;
        masterGain.gain.cancelScheduledValues(ctx.currentTime);
        masterGain.gain.linearRampToValueAtTime(bgVolumeRef.current*0.15,ctx.currentTime+1.2);
      }
    } else {
      if(disasterDrumRef.current){disasterDrumRef.current();disasterDrumRef.current=null;}
      if(bgMusicRef.current?.masterGain&&bgMusicRef.current?.ctx){
        const{masterGain,ctx}=bgMusicRef.current;
        masterGain.gain.cancelScheduledValues(ctx.currentTime);
        masterGain.gain.linearRampToValueAtTime(bgVolumeRef.current*0.5,ctx.currentTime+1.5);
      }
    }
    return()=>{if(!disasterWarning&&disasterDrumRef.current){disasterDrumRef.current();disasterDrumRef.current=null;}};
  },[disasterWarning,soundOn]);

  // Tab visibility — pause tick when hidden
  useEffect(()=>{
    const prevSpeedRef={v:0};
    const handler=()=>{
      if(document.hidden){prevSpeedRef.v=ref.current.speed;setSpeed(0);}
      else setSpeed(prevSpeedRef.v||0);
    };
    document.addEventListener('visibilitychange',handler);
    return()=>document.removeEventListener('visibilitychange',handler);
  },[]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const saveParam = params.get('save');
    if (!saveParam || screen !== 'menu') return;
    (async () => {
      try {
        let state;
        if (saveParam.startsWith('z:')) {
          // gzip-compressed format
          const b64 = saveParam.slice(2);
          const bin = atob(b64);
          const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
          const json = await new Response(
            new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))
          ).text();
          state = JSON.parse(json);
        } else {
          // legacy format
          state = JSON.parse(decodeURIComponent(atob(saveParam)));
        }
        loadFromSlot(state);
        window.history.replaceState({}, '', window.location.pathname);
        addLog(lang==="ko"?"📂 URL에서 세이브 불러옴!":"📂 Save loaded from URL!");
      } catch(e) {
        // silently fail on corrupt saves
      }
    })();
  }, []); // 마운트 시 1회만

  // obstacleMap must be declared BEFORE handleGridClick to avoid TDZ in minified bundle
  const currentScenarioData=currentScenario?SCENARIOS.find(s=>s.id===currentScenario):null;
  const nightPhase=currentScenarioData?.nightCycle?(Math.floor(day/3)%2===1):false;
  const obstacleMap=useMemo(()=>{
    if(!currentScenarioData?.obstacles) return {};
    return Object.fromEntries(currentScenarioData.obstacles.map(o=>[`${o.r},${o.c}`,o]));
  },[currentScenario]);

  const handleGridClick=(r,c,skipPreview=false)=>{
    const{ownedGrid:og,grid:g,money:m}=ref.current;
    if(!og[r][c]){addLog(t("log.unownedLand"));return;}
    if(isMobile&&!skipPreview&&buildMode==="build"&&selected){setPlacementPreview({r,c});return;}
    if(obstacleMap[`${r},${c}`]&&buildMode==="build"&&selected){addLog(lang==="ko"?"⛰️ 지형 장애물이 있어 건설 불가":"⛰️ Terrain obstacle — cannot build here");return;}

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

    const savedGrid=grid.map(row=>[...row]);
    setLastBuildGrid(savedGrid);
    if(buildUndoTimerRef.current) clearTimeout(buildUndoTimerRef.current);
    buildUndoTimerRef.current=setTimeout(()=>setLastBuildGrid(null),30000);
    setGrid(prev=>{
      const n=prev.map(row=>[...row]);
      n[r][c]={type:selected,level:0,broken:false};
      for(let dr=0;dr<bh;dr++) for(let dc=0;dc<bw;dc++){
        if(dr===0&&dc===0) continue;
        n[r+dr][c+dc]={type:selected,ref:[r,c]};
      }
      return n;
    });
    setMoney(mo=>mo-bd.baseCost+(selected==="entrance"?500:0));setLastBuilt(selected);addLog(t("log.build",{name:t(`b.${selected}`)}));if(selected==="entrance") addLog(lang==="ko"?"🎪 개장 보너스 +$500!":"🎪 Grand Opening bonus +$500!");if(soundOn) playSound("build",selected);
    const pId=Date.now();
    const pColor=B[selected]?.color||"#FFD93D";
    const particles=Array.from({length:12},(_,i)=>{
      const angle=(i/12)*Math.PI*2; const dist=28+Math.random()*30;
      return{tx:`${Math.cos(angle)*dist}px`,ty:`${Math.sin(angle)*dist}px`,col:i%3===0?"#FFD93D":pColor};
    });
    const satB=B[selected]?.stats?.(0)?.satBonus||0;
    setBuildParticles(prev=>[...prev,{id:pId,r,c,color:pColor,particles,label:satB>0?`+${satB}😊`:null}]);
    setTimeout(()=>setBuildParticles(prev=>prev.filter(p=>p.id!==pId)),800);
  };
  const upgradeBuilding=()=>{const{r,c,cell}=clickedTile;if(cell.level>=2||cell.broken) return;const cost=B[cell.type].upgradeCost[cell.level];if(!cost) return;if(ref.current.money<cost){addLog(t("log.noMoney"));return;}const lv=cell.level+1;setGrid(prev=>{const n=prev.map(r=>[...r]);n[r][c]={...cell,level:lv};return n;});setMoney(m=>m-cost);setClickedTile(p=>({...p,cell:{...p.cell,level:lv}}));addLog(t("log.upgrade", {name: t(`b.${cell.type}`), lv: lv+1}));if(soundOn) playSound("upgrade");};
  const repairBuilding=()=>{const{r,c,cell}=clickedTile;if(!cell.broken) return;const cost=Math.max(500,Math.floor(B[cell.type].baseCost*0.15));if(ref.current.money<cost){addLog(t("log.repairNoMoney"));return;}setGrid(prev=>{const n=prev.map(r=>[...r]);n[r][c]={...cell,broken:false};return n;});setMoney(m=>m-cost);setClickedTile(p=>({...p,cell:{...p.cell,broken:false}}));addLog(t("log.repair"));};
  const demolish=()=>{const{r,c,cell}=clickedTile;const refund=Math.floor(B[cell.type].baseCost*0.4);setDemolishConfirm({r,c,cell,refund});};
  const confirmDemolish=()=>{if(!demolishConfirm) return;const{r,c,cell,refund}=demolishConfirm;const bw=B[cell.type]?.size?.w||1;const bh=B[cell.type]?.size?.h||1;const savedGrid=grid.map(row=>[...row]);setLastDemolishGrid(savedGrid);if(undoTimerRef.current) clearTimeout(undoTimerRef.current);undoTimerRef.current=setTimeout(()=>setLastDemolishGrid(null),30000);setGrid(prev=>{const n=prev.map(row=>[...row]);for(let dr=0;dr<bh;dr++) for(let dc=0;dc<bw;dc++) n[r+dr][c+dc]=null;return n;});setMoney(m=>m+refund);addLog(t("log.demolish"));setClickedTile(null);if(soundOn) playSound("demolish");setDemolishConfirm(null);};
  const undoDemolish=()=>{if(!lastDemolishGrid) return;setGrid(lastDemolishGrid);setLastDemolishGrid(null);if(undoTimerRef.current) clearTimeout(undoTimerRef.current);addLog(lang==="ko"?"↩️ 철거 취소됨":"↩️ Demolish undone");};
  const undoBuild=()=>{if(!lastBuildGrid) return;const cost=B[lastBuilt]?.baseCost||0;setGrid(lastBuildGrid);setMoney(m=>m+cost);setLastBuildGrid(null);if(buildUndoTimerRef.current) clearTimeout(buildUndoTimerRef.current);addLog(lang==="ko"?"↩️ 건설 취소됨":"↩️ Build undone");};

  const handleDragEnter=(r,c)=>{
    const drag=dragBuildRef.current;
    if(!drag.active) return;
    if(drag.mode==="build"){
      const sel=drag.selected;if(!sel) return;
      const bd=B[sel];if(!bd||(bd.size?.w||1)!==1||(bd.size?.h||1)!==1) return;
      const{ownedGrid:og,grid:g,money:m}=ref.current;
      if(!og[r][c]||g[r][c]||obstacleMap[`${r},${c}`]||m<bd.baseCost) return;
      setGrid(prev=>{const n=prev.map(row=>[...row]);n[r][c]={type:sel,level:0,broken:false};return n;});
      setMoney(mo=>mo-bd.baseCost);
      setLastBuilt(sel);
    } else if(drag.mode==="demolish"){
      const{grid:g}=ref.current;if(!g[r][c]) return;
      let ar=r,ac=c;if(g[r][c].ref)[ar,ac]=g[r][c].ref;
      const anchorCell=g[ar][ac];
      const bw=B[anchorCell?.type]?.size?.w||1,bh=B[anchorCell?.type]?.size?.h||1;
      const cells=[];for(let dr=0;dr<bh;dr++) for(let dc=0;dc<bw;dc++) cells.push(`${ar+dr},${ac+dc}`);
      setMultiSelectedCells(prev=>{const n=new Set(prev);cells.forEach(k=>n.add(k));return n;});
    }
  };
  const hire=k=>{if(weeklyChallengeMod?.noStaff){addLog(lang==="ko"?"🚫 이번 챌린지: 직원 고용 불가":"🚫 This challenge: no staff allowed");return;}if(ref.current.money<STAFF[k].hire){addLog(t("log.noMoney"));return;}setHired(h=>({...h,[k]:h[k]+1}));setMoney(m=>m-STAFF[k].hire);addLog(t("log.hire", {name: t(`st.${k}`)}));};
  const fire=k=>{if(hired[k]<=0)return;setHired(h=>({...h,[k]:h[k]-1}));addLog(t("log.fire", {name: t(`st.${k}`)}));};
  const takeLoan=opt=>{
    if(loans.length>=2){addLog(lang==="ko"?"대출은 최대 2개까지만 가능합니다":"Maximum 2 loans at once");return;}
    if(opt.amount>money*2){addLog(lang==="ko"?"대출 한도 초과 (현재 자금의 2배)":"Loan limit exceeded (2× current funds)");return;}
    const total=Math.floor(opt.amount*(1+opt.rate));const daily=Math.ceil(total/opt.days);setLoans(l=>[...l,{id:Date.now(),amount:opt.amount,remaining:total,dailyPayment:daily,rate:opt.rate}]);setMoney(m=>m+opt.amount);addLog(t("log.loan"));
  };
  const buyParcel=p=>{if(currentScenarioData?.noParcels){addLog(lang==="ko"?"🚫 이 시나리오는 토지 매입 불가":"🚫 Land purchase not allowed in this scenario");return;}if(ref.current.money<p.cost){addLog(t("log.noMoney"));return;}if(p.req&&!parcels.includes(p.req)){addLog(t("log.needPrevParcel"));return;}setOwnedGrid(prev=>{const n=prev.map(r=>[...r]);for(let r=0;r<GR;r++) for(let co=p.cols[0];co<=p.cols[1];co++) n[r][co]=true;return n;});setParcels(prev=>[...prev,p.id]);setMoney(m=>m-p.cost);addLog(t("log.parcelBought",{name:p.label?.[lang]||p.label?.ko||p.label}));};
  const launchCampaign=key=>{const c=CAMPAIGNS_DATA[key];if(ref.current.money<c.cost){addLog(t("log.noMoney"));return;}setCampaigns(p=>[...p,{id:Date.now(),key,emoji:c.emoji,boost:c.boost,seg:c.seg,remaining:c.days,days:c.days}]);setMoney(m=>m-c.cost);addLog(t("log.campaignStart", {name: t(`camp.${key}`)}));};
  const acceptVIP=()=>{const evt=pendingVIP;const ok=checkVIPReq(ref.current.grid,evt.req);if(!ok){addLog(t("log.vipReqFail", {name: t(`vip.${evt.id}`)}));setPendingVIP(null);return;}setMoney(m=>m+evt.bonusRev);setPrestigeBonus(s=>s+evt.presBonus);setVipCount(v=>v+1);setPendingVIP(null);addLog(t("log.vipSuccess", {name: t(`vip.${evt.id}`)}));};
  const resolveDisaster=()=>{if(!activeDisaster?.resolveCost) return;if(ref.current.money<activeDisaster.resolveCost){addLog(t("log.resolveNoMoney"));return;}setMoney(m=>m-activeDisaster.resolveCost);setActiveDisaster(null);addLog(t("log.disasterSolved"));if(soundOn) playSound("fanfare");};
  const mitigateDisaster=()=>{
    const cost=800;
    if(money<cost){addLog(t("log.noMoney"));return;}
    setMoney(m=>m-cost);
    setDisasterWarning(null);
    addLog(`🛡️ ${lang==="ko"?"재난 대비 완료! 위험이 해소됐습니다.":"Disaster mitigated! Threat neutralized."}`);
    if(soundOn) playSound("fanfare");
  };
  const takeSnapshot = () => {
    const CELL = 28;
    const PAD = 6;   // outer padding
    const FOOT = 44; // footer height
    const W = GC * CELL;
    const H = GR * CELL;
    const canvas = document.createElement('canvas');
    canvas.width  = W + PAD * 2;
    canvas.height = H + PAD * 2 + FOOT;
    const ctx = canvas.getContext('2d');

    // — outer background —
    ctx.fillStyle = '#020510';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // — grid background —
    ctx.fillStyle = '#07090F';
    ctx.fillRect(PAD, PAD, W, H);

    // — cells —
    for (let r = 0; r < GR; r++) {
      for (let c = 0; c < GC; c++) {
        const x = PAD + c * CELL;
        const y = PAD + r * CELL;
        const cell  = grid[r][c];
        const owned = ownedGrid[r][c];
        const zone  = zoneGrid[r][c];
        const isPath   = cell?.type === '_path';
        const isFancy  = cell?.type === '_pathFancy';
        const isEntrance = cell?.type === 'entrance';
        const broken = cell?.broken;

        // cell background
        if (isPath) {
          ctx.fillStyle = '#1A1208';
        } else if (isFancy) {
          ctx.fillStyle = '#241C08';
        } else if (isEntrance) {
          ctx.fillStyle = 'rgba(255,217,61,0.18)';
        } else if (owned) {
          if (zone) {
            const zd = ZONES[zone];
            ctx.fillStyle = zd ? zd.bg.replace('18','55') : '#1A1A30';
          } else if (cell && !cell.ref) {
            const bd = B[cell.type];
            ctx.fillStyle = bd ? bd.color + '22' : '#0D1128';
          } else {
            ctx.fillStyle = '#0D1128';
          }
        } else {
          ctx.fillStyle = '#05060E';
        }
        ctx.fillRect(x, y, CELL - 1, CELL - 1);

        // path tile — draw golden inset rectangle instead of emoji
        if (isPath || isFancy) {
          ctx.fillStyle = isFancy ? 'rgba(212,175,55,0.65)' : 'rgba(160,120,50,0.55)';
          ctx.fillRect(x + 3, y + 3, CELL - 7, CELL - 7);
          if (isFancy) {
            ctx.strokeStyle = 'rgba(255,217,61,0.4)';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(x + 4, y + 4, CELL - 9, CELL - 9);
          }
          continue;
        }

        // cell border
        if (owned) {
          ctx.strokeStyle = cell ? 'rgba(255,255,255,0.07)' : 'rgba(100,120,255,0.10)';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x + 0.5, y + 0.5, CELL - 2, CELL - 2);
        }

        // broken overlay
        if (broken) {
          ctx.fillStyle = 'rgba(255,87,87,0.18)';
          ctx.fillRect(x, y, CELL - 1, CELL - 1);
        }

        // emoji (anchor cell only, skip ref cells and paths)
        if (cell && !cell.ref) {
          const bd = B[cell.type];
          ctx.font = `${CELL * 0.6}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.globalAlpha = broken ? 0.45 : 1;
          ctx.fillText(bd?.emoji || '', x + CELL / 2, y + CELL / 2 + 1);
          ctx.globalAlpha = 1;
        }
      }
    }

    // — outer border —
    ctx.strokeStyle = 'rgba(100,120,255,0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(PAD + 0.5, PAD + 0.5, W - 1, H - 1);

    // — footer bar —
    const fy = PAD + H;
    ctx.fillStyle = 'rgba(6,9,28,0.95)';
    ctx.fillRect(0, fy, canvas.width, FOOT + PAD);
    ctx.fillStyle = 'rgba(100,120,255,0.15)';
    ctx.fillRect(0, fy, canvas.width, 1);

    // footer text
    ctx.fillStyle = '#FFD93D';
    ctx.font = 'bold 13px "Barlow Condensed", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎡 PARCADIA', PAD + 4, fy + 14);
    ctx.fillStyle = '#8899CC';
    ctx.font = '11px monospace';
    ctx.fillText(`Day ${day}`, PAD + 4, fy + 30);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#FFD93D';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`⭐${parkRating.stars}  👥${visitors}${lang==="ko"?"명":" ppl"}  😊${Math.round(sat)}%`, canvas.width - PAD - 4, fy + 22);

    // download
    const link = document.createElement('a');
    link.download = `parcadia-day${day}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    addLog(`📷 ${lang === "ko" ? "스냅샷 저장됨!" : "Snapshot saved!"}`);
  };
  const doResearch=id=>{const r=RESEARCH.find(x=>x.id===id);if(!r) return;if(weeklyChallengeMod?.noResearch){addLog(lang==="ko"?"🚫 이번 챌린지: 연구 불가":"🚫 This challenge: no research allowed");return;}if(researchPoints<r.cost){addLog(t("log.rpLacking"));return;}if(r.req&&!researched.includes(r.req)){addLog(t("log.resReq"));return;}if(researched.includes(id)) return;setResearched(p=>{const n=[...p,id];if(n.length===RESEARCH.length){setTimeout(()=>{addLog(lang==="ko"?"🏆 모든 연구 완료! '레전드 어워드' 도전이 해금됐습니다!":"🏆 All research complete! 'Legend Award' challenge unlocked!");setSandboxGoal({type:"vis",target:500,label:{ko:"🏆 레전드 어워드: 방문객 500명",en:"🏆 Legend Award: 500 Visitors"},achieved:false,legend:true});},100);}return n;});setResearchPoints(p=>p-r.cost);addLog(t("log.resComplete", {name: t(`res.${r.id}.name`)}));};
  const resImpact=(id)=>{
    const rbN=getRB([...researched,id]);
    const fK=n=>n>=1000?`$${(n/1000).toFixed(1)}k`:`$${n}`;
    const aw=(a,b)=>a!==b?`${a} → ${b}`:null;
    const ak=(a,b)=>a!==b?`${fK(a)} → ${fK(b)}`:null;
    const attr=Math.round(stats.attraction);
    const mCur=Math.round(stats.maintenance*diffSettings.maintenanceMult);
    const adm=Math.round(revBreak.adm),shop=Math.round(revBreak.shop),pas=Math.round(revBreak.pass);
    const ko=lang==="ko";
    switch(id){
      case "r1":case "ex4":{const nA=Math.round(stats.attraction*rbN.attractionMult/rb.attractionMult);return attr>0?aw(attr,nA):null;}
      case "r2":return ko?"고장률 -50%":"Breakdown -50%";
      case "r3":{const c=stats.capacity,cN=Math.round(c*rbN.capacityBonus/rb.capacityBonus);return c>0?aw(c,cN):null;}
      case "r4":return null;
      case "c1":{const b=Math.round(adm*rbN.admissionMult/rb.admissionMult);return adm>0?ak(adm,b):null;}
      case "c2":return ko?"패스 판매 ×1.5":"Pass sales ×1.5";
      case "c3":{const b=Math.round(shop*rbN.rpvMult/rb.rpvMult);return shop>0?ak(shop,b):null;}
      case "c4":{const b=Math.round(pas*rbN.passIncomeMult/rb.passIncomeMult);return pas>0?ak(pas,b):null;}
      case "o1":case "o3":case "o4":case "ex3":{const mN=Math.round(mCur*rbN.maintenanceMult/rb.maintenanceMult);return mCur>0?ak(mCur,mN):null;}
      case "o2":return ko?"청결 +5/일":"Clean +5/day";
      case "p1":return ko?"명성 ×1.3":"Prestige ×1.3";
      case "p2":return ko?"커플 방문객 +20%":"Couple vis +20%";
      case "p3":return ko?"명성 ×1.56":"Prestige ×1.56";
      case "p4":case "ex2":{const vN=Math.round(visitors*(1+rbN.globalVisBonus)/Math.max(0.01,1+rb.globalVisBonus));return visitors>0?aw(visitors,vN):null;}
      case "ex1":return ko?"이벤트 부스트 ×1.3":"Event boost ×1.3";
      default:return null;
    }
  };
  const upgradeStaff=k=>{const cur=staffLevels[k];if(cur>=3) return;const upg=STAFF_UPGRADES[k][cur];if(!upg) return;if(money<upg.upgCost){addLog(t("log.noMoney"));return;}setMoney(m=>m-upg.upgCost);setStaffLevels(p=>({...p,[k]:cur+1}));addLog(`⬆️ ${t(`st.${k}`)} Lv.${cur+1}!`);};
  const acceptInvestor=()=>{const offer=pendingInvestor.offer;setMoney(m=>m+offer.amount);setActiveInvestment({offerId:offer.id,amount:offer.amount,goal:offer.goal,deadline:day+offer.goal.days});setPendingInvestor(null);addLog(`💼 ${offer.name[lang]||offer.name.ko} ${lang==="ko"?"수락!":"accepted!"} +$${offer.amount.toLocaleString()}`);saveToSlot(0);};;
  const declineInvestor=()=>{setPendingInvestor(null);addLog(`💼 ${lang==="ko"?"투자 거절.":"Investment declined."}`);};;
  const acceptSeasonalAction=()=>{
    if(!pendingSeasonalAction) return;
    const cost=pendingSeasonalAction.event.actionCost;
    if(money<cost){addLog(t("log.noMoney"));return;}
    setMoney(m=>m-cost);
    setActiveHoliday(ah=>ah?{...ah,actionBoosted:true}:ah);
    addLog(`${pendingSeasonalAction.event.emoji} ${pendingSeasonalAction.event.actionBonus[lang]||pendingSeasonalAction.event.actionBonus.ko}`);
    setPendingSeasonalAction(null);
  };
  const declineSeasonalAction=()=>setPendingSeasonalAction(null);


  // stats, cc, parkRating, totalBldCount, currentStage computed above (pre-hook section)
  // 호버 footprint 계산 (선택된 건물의 배치 가능 여부 미리보기)
  const selBd=selected?B[selected]:null;
  const selW=selBd?.size?.w||1, selH=selBd?.size?.h||1;
  let hovFootprintValid=true;
  if(hovered&&selected){
    outer: for(let dr=0;dr<selH;dr++) for(let dc=0;dc<selW;dc++){
      const nr=hovered.r+dr,nc=hovered.c+dc;
      if(nr>=GR||nc>=GC||!ownedGrid[nr]?.[nc]||grid[nr]?.[nc]||obstacleMap[`${nr},${nc}`]){hovFootprintValid=false;break outer;}
    }
  }
  const segs=calcSegs(grid);
  const spendMult=(segs.family||0)*1.2+(segs.couple||0)*1.5+(segs.thrill||0)*0.8+(segs.child||0)*0.5+(segs.general||0)*1.0;
  const wages=Object.entries(hired).reduce((t,[k,v])=>t+STAFF[k].daily*v,0);
  const loanPay=loans.reduce((t,l)=>t+l.dailyPayment,0);
  const totalDebt=loans.reduce((t,l)=>t+l.remaining,0);
  const campBoost=campaigns.reduce((t,c)=>t+c.boost,0);
  const passIncome=passOn?Math.floor(passHolders*passPrice/365*rb.passIncomeMult):0;
  const maxFee=gameMode==="sandbox"?999:(MAX_FEE_BY_STARS[parkRating.stars]+(startPerk==="premiumGate"?10:0));
  const shopMultiplier=avgShopMult(cc,shopMults);
  const rideTicketEst=calcRideTicketRev(cc,visitors,stats.attraction,ridePrices,pricingMode);
  const admRevEst=pricingMode!=="per_ride"?visitors*fee*rb.admissionMult:0;
  const shopRevEst=visitors*stats.rpv*spendMult*shopMultiplier;
  const estNet=Math.round(admRevEst+rideTicketEst+shopRevEst+passIncome-stats.maintenance*diffSettings.maintenanceMult-wages-loanPay);
  const prevDayNet=dailyHistory.length>=1?dailyHistory[dailyHistory.length-1].net:null;
  const netTrendArrow=prevDayNet===null?"":(estNet>prevDayNet?" ▲":estNet<prevDayNet?" ▼":"");
  const ownedCount=ownedGrid.reduce((t,row)=>t+row.filter(Boolean).length,0);

  // Phase 2-4: average visitor rating
  const avgVisitorRating=visitorRatings.length>0?visitorRatings.reduce((s,r)=>s+r,0)/visitorRatings.length:3;
  const sc=season.color;
  // totalBldCount, currentStage already declared in pre-hook section above

  const anyGridPaths=grid.some(r=>r.some(c=>c?.type==="_path"||c?.type==="_pathFancy"));
  const reachablePaths=useMemo(()=>anyGridPaths?getReachablePaths(grid):new Set(),[grid,anyGridPaths]);
  const starStr="⭐".repeat(parkRating.stars)+"☆".repeat(5-parkRating.stars);
  const chartData=dailyHistory.slice(-14);
  const revPieData=useMemo(()=>[{name:t("rev.admission"),value:revBreak.adm,color:"#FECA57"},{name:t("rev.rides"),value:Math.round(revBreak.ride),color:"#FF6B9D"},{name:t("rev.shop"),value:Math.round(revBreak.shop),color:"#48DBFB"},{name:t("rev.pass"),value:revBreak.pass,color:"#5EF6A0"}].filter(d=>d.value>0),[revBreak, t]);
  const weatherParticles=useMemo(()=>{
    if(weather.id==="rainy")  return Array.from({length:14},(_,i)=>({id:i,x:(i/14)*100+1, delay:i*0.13, dur:0.65+i%3*0.10}));
    if(weather.id==="stormy") return Array.from({length:22},(_,i)=>({id:i,x:(i/22)*100+0.5,delay:i*0.09, dur:0.42+i%4*0.05}));
    return [];
  },[weather.id]);
  const pm={width:20,height:20,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",color:"var(--text-primary)",borderRadius:4,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit",padding:0,transition:"all 0.15s"};

  const hasResearchAvailable=RESEARCH.some(r=>!researched.includes(r.id)&&researchPoints>=r.cost&&(!r.req||researched.includes(r.req)));

  // Pre-computed: satisfaction breakdown (avoids IIFE TDZ in minified build)
  const satFactors=[
    {label:lang==="ko"?"🏗️ 시설 보너스":"🏗️ Attraction",  val:+stats.satBonus.toFixed(1),     tip:lang==="ko"?"놀이기구·편의시설이 높을수록 증가":"Higher-rated rides boost satisfaction"},
    {label:lang==="ko"?"🧹 청소부":"🧹 Janitors",          val:hired.janitor>0?+(hired.janitor*4).toFixed(0):0, tip:lang==="ko"?"청소부 1명당 약 +4":"~+4 per janitor"},
    {label:lang==="ko"?"☀️ 날씨":"☀️ Weather",             val:weather.satMod,                 tip:weather.name?.[lang]||weather.name?.ko||""},
    {label:lang==="ko"?"🔧 고장":"🔧 Broken Rides",        val:-(stats.brokenCount*2),         tip:lang==="ko"?`고장 ${stats.brokenCount}개 — 정비공 고용 권장`:`${stats.brokenCount} broken — hire mechanic`},
    {label:lang==="ko"?"💸 입장료":"💸 Admission",          val:fee>maxFee?-6:0,                tip:lang==="ko"?fee>maxFee?`$${maxFee} 한도 초과!`:"적정 수준":"Fee within limit"},
    {label:lang==="ko"?"🚶 혼잡":"🚶 Congestion",          val:congestedCells.size>0?-5:0,     tip:lang==="ko"?congestedCells.size>0?"놀이기구 추가 필요":"쾌적함":"Comfortable"},
    {label:lang==="ko"?"🧹 청결도":"🧹 Cleanliness",        val:clean<40?-4:clean<60?-2:0,     tip:lang==="ko"?`청결도 ${Math.round(clean)}%`:`Cleanliness ${Math.round(clean)}%`},
    {label:lang==="ko"?"📉 자연 감소":"📉 Natural Decay",   val:-0.2,                           tip:lang==="ko"?"시간이 지나면 자연 감소":"Slowly decays over time"},
  ];
  const satPrev=dailyHistory.length>=3?dailyHistory[dailyHistory.length-3]?.sat:null;
  const satTrend=satPrev!=null?(sat>satPrev?"▲":sat<satPrev?"▼":"→"):"→";
  const satTrendColor=satTrend==="▲"?"#00E5A0":satTrend==="▼"?"#FF5757":"#FFD93D";

  // Pre-computed: visitor profile panel
  const segEntries=Object.entries(SEGS);
  const totalSegW=segEntries.reduce((s,[k])=>s+(segs[k]||0),0)||1;
  const lastDayRev=dailyHistory.length>=1?dailyHistory[dailyHistory.length-1].revenue:null;
  const revPerVis=lastDayRev!=null&&visitors>0?(lastDayRev/Math.max(1,visitors)).toFixed(1):null;
  const ridePersonalityMap=grid.flat().filter(c=>c&&!c.ref&&B[c.type]?.personality).reduce((acc,c)=>{
    const w=B[c.type].personality.who?.ko||"";
    acc[w]=(acc[w]||0)+1;
    return acc;
  },{});
  const dominantPersonality=Object.entries(ridePersonalityMap).sort((a,b)=>b[1]-a[1]);
  const varietyWarn=dominantPersonality.length>0&&dominantPersonality[0][1]>=3&&(dominantPersonality[1]?.[1]||0)<2;

  const hasNoPath = stats.hasEntrance && !grid.flat().some(c=>c?.type==="_path"||c?.type==="_pathFancy");
  const visitorZeroReason = screen === "game" && visitors === 0 && speed > 0 ? (
    !stats.hasEntrance    ? { emoji: "🎪", msg: lang === "ko" ? "입구 게이트를 먼저 배치하세요 (건설 탭)" : "Place an Entrance Gate first (Build tab)" } :
    hasNoPath             ? { emoji: "🛤️", msg: lang === "ko" ? "입구에서 놀이기구까지 통로(🟫)를 연결하세요" : "Connect paths (🟫) from entrance to attractions" } :
    stats.attraction < 5  ? { emoji: "🎡", msg: lang === "ko" ? "놀이기구를 추가하면 방문객이 옵니다 (건설 탭)" : "Add attractions to get visitors (Build tab)" } :
    fee > maxFee          ? { emoji: "💸", msg: lang === "ko" ? `입장료가 너무 높습니다 (현재 한도: $${maxFee})` : `Admission fee too high (current limit: $${maxFee})` } :
    sat < 20              ? { emoji: "😔", msg: lang === "ko" ? "만족도가 너무 낮습니다 — 고장난 시설을 수리하세요" : "Satisfaction too low — repair broken facilities" } :
    day <= 2              ? { emoji: "⏳", msg: lang === "ko" ? "공원 오픈 초반! 곧 방문객이 도착합니다…" : "Just opened! Visitors are on their way…" } :
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
    const openingBonus2 = day<=3?1.5:day<=7?1.2:1.0;
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
      openingBonus:openingBonus2>1?openingBonus2:null,
      estimated:   Math.round(baseVis * feeEff2 * ssn2.mult * weather.visMult * (0.4+(sat/100)*0.9) * stgVisMult2 * (1+campBoost2) * openingBonus2),
    };
  })() : null;


  if(!langChosen){
    return(
      <div style={{fontFamily:"'Rajdhani','Barlow Condensed',sans-serif",background:"radial-gradient(ellipse at 50% 0%,#0D1535 0%,#020510 60%)",color:"#DDE2FF",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div style={{textAlign:"center",maxWidth:420}}>
          <div style={{fontSize:44,marginBottom:12}}>🎡</div>
          <div style={{fontSize:36,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:6,color:"#FFD93D",textShadow:"0 0 40px rgba(255,217,61,0.5)",lineHeight:1,marginBottom:8}}>PARCADIA</div>
          <div style={{fontSize:13,color:"#7788BB",marginBottom:28,letterSpacing:1}}>언어를 선택하세요 · Choose your language</div>
          <div style={{display:"flex",flexDirection:"column",gap:12,alignItems:"center"}}>
            <button onClick={()=>chooseLang("ko")} style={{width:240,padding:"14px 0",background:"rgba(255,217,61,0.08)",border:"2px solid rgba(255,217,61,0.4)",color:"#FFD93D",borderRadius:12,cursor:"pointer",fontSize:16,fontFamily:"inherit",fontWeight:700,letterSpacing:2,transition:"all 0.15s"}}>🇰🇷 한국어</button>
            <button onClick={()=>chooseLang("en")} style={{width:240,padding:"14px 0",background:"rgba(77,159,255,0.08)",border:"2px solid rgba(77,159,255,0.4)",color:"#4D9FFF",borderRadius:12,cursor:"pointer",fontSize:16,fontFamily:"inherit",fontWeight:700,letterSpacing:2,transition:"all 0.15s"}}>🇺🇸 English</button>
          </div>
        </div>
      </div>
    );
  }

  if(screen==="menu"){
    const slots=saveSlots;
    return(<>
      <div style={{fontFamily:"'Rajdhani','Barlow Condensed',sans-serif",background:"radial-gradient(ellipse at 50% 0%, #0D1535 0%, #020510 60%)",color:"var(--text-primary)",height:"100%",overflowY:"auto",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        {showSettings&&<SettingsModal uiSettings={uiSettings} setUiSettings={setUiSettings} soundOn={soundOn} setSoundOn={setSoundOn} bgMusicOn={bgMusicOn} setBgMusicOn={setBgMusicOn} bgVolume={bgVolume} setBgVolume={setBgVolume} onClose={()=>setShowSettings(false)} lang={lang}/>}
        <button onClick={()=>setShowSettings(true)} style={{position:"fixed",top:12,right:12,background:"rgba(100,120,255,0.12)",border:"1px solid rgba(100,120,255,0.3)",color:"#8899CC",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:16,fontFamily:"inherit",transition:"all 0.15s",zIndex:1000}} title={lang==="ko"?"설정":"Settings"}>⚙️</button>
        <div style={{width:"100%",maxWidth:680}}>
          <div style={{textAlign:"center",marginBottom:28}}>
            {/* 플로팅 이모지 장식 */}
            <div style={{display:"flex",justifyContent:"center",gap:16,marginBottom:12,fontSize:22,opacity:0.7}}>
              {["🎡","🎢","🎠","🎪","🚂","🎆"].map((em,i)=>(
                <span key={i} style={{display:"inline-block",animation:`float ${2+i*0.3}s ease-in-out infinite alternate`,animationDelay:`${i*0.2}s`}}>{em}</span>
              ))}
            </div>
            <div style={{fontSize:42,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:6,color:"#FFD93D",textShadow:"0 0 40px rgba(255,217,61,0.5), 0 0 80px rgba(255,159,67,0.3)",lineHeight:1}}>PARCADIA</div>
            <div style={{fontSize:14,letterSpacing:2,color:"#DDE2FF",fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",marginTop:8,marginBottom:3}}>
              {lang==="ko"?"내 손으로 짓는 꿈의 테마파크":"Build Your Dream Park. One Ride at a Time."}
            </div>
            <div style={{fontSize:10,letterSpacing:3,color:"#5566AA",fontWeight:500,fontFamily:"'Barlow Condensed',sans-serif",marginBottom:5}}>BUILD · MANAGE · THRIVE</div>
            <div style={{fontSize:10,color:"#6677AA",letterSpacing:1}}>
              {lang==="ko"?"🎯 8개 시나리오  🏗️ 27종 건물  ⚡ 무료 플레이":"🎯 8 Scenarios  🏗️ 27 Buildings  ⚡ Free to Play"}
            </div>
          </div>
          <div style={{marginBottom:24}}>
            <div style={{fontSize:10,color:"#7788BB",textAlign:"center",letterSpacing:3,textTransform:"uppercase",marginBottom:8}}>{t("lang.select")}</div>
            <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap"}}>
              {Object.entries(LANG_FLAGS).map(([code,label])=>(
                <button key={code} style={{background:lang===code?"rgba(255,217,61,0.12)":"rgba(255,255,255,0.03)",border:`1px solid ${lang===code?"#FFD93D":"rgba(255,255,255,0.08)"}`,color:lang===code?"#FFD93D":"#6B7CA1",borderRadius:20,padding:"4px 12px",cursor:"pointer",fontSize:10,fontFamily:"inherit",fontWeight:lang===code?700:400,transition:"all 0.15s"}}
                  onClick={()=>changeLang(code)}>{label}</button>
              ))}
            </div>
          </div>

          {!menuSubScreen&&<>
            <div style={{fontSize:10,color:"#7788BB",textAlign:"center",letterSpacing:3,textTransform:"uppercase",marginBottom:12}}>{t("menu.newGame")}</div>
            {!tutDone&&<div style={{background:"rgba(155,127,255,0.08)",border:"1px solid rgba(155,127,255,0.35)",borderRadius:8,padding:"8px 12px",marginBottom:10,display:"flex",gap:8,alignItems:"center",animation:"slide-in 0.3s ease"}}>
              <span style={{fontSize:16}}>🎓</span>
              <div style={{fontSize:10,color:"#9B7FFF",lineHeight:1.5,flex:1}}>{lang==="ko"?"처음 플레이하시나요? 아래 튜토리얼 버튼으로 8단계 가이드를 시작해보세요!":"First time? Hit Tutorial below for a guided 8-step walkthrough!"}</div>
            </div>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:24}}>
              {[
                {mode:"campaign",emoji:"🎯",name:t("mode.campaign"),time:{ko:"60-90분/시나리오",en:"60-90 min/scenario"},desc:t("mode.campaign.desc"),color:"#00E5A0",action:()=>setMenuSubScreen("scenario")},
                {mode:"sandbox", emoji:"🏗️",name:t("mode.sandbox"), time:{ko:"시간 제한 없음",en:"Unlimited"},desc:t("mode.sandbox.desc"), color:"#FFD93D",action:()=>setPendingStartParams({mode:"sandbox",scenarioId:null,diff:"normal"})},
                {mode:"challenge",emoji:"⚡",name:t("mode.challenge"),time:{ko:"30-45분",en:"30-45 min"},desc:t("mode.challenge.desc"),color:"#FF6B9D",action:()=>setMenuSubScreen("difficulty")},
                {mode:"tutorial",emoji:"🎓",name:lang==="ko"?"튜토리얼":"Tutorial",time:{ko:"약 15분",en:"~15 min"},desc:lang==="ko"?`처음 하시나요?\n단계별로 게임을 배워보세요${tutDone?" ✓ 완료":""}`:(`New to the game?\nLearn step by step${tutDone?" ✓ Done":""}`),color:"#9B7FFF",action:()=>{startGame("sandbox",null,"normal",null,null);setTutorialStep(1);}},
              ].map(({mode,emoji,name,time,desc,color,action})=>(
                <button key={mode} style={{background:"rgba(255,255,255,0.02)",border:`2px solid ${color}22`,borderRadius:14,padding:"20px 14px",cursor:"pointer",textAlign:"center",fontFamily:"inherit",transition:"all 0.2s",backdropFilter:"blur(4px)"}}
                  onMouseEnter={e=>{e.currentTarget.style.border=`2px solid ${color}`;e.currentTarget.style.background=color+"0A";e.currentTarget.style.boxShadow=`0 8px 30px ${color}22, inset 0 0 20px ${color}06`;}}
                  onMouseLeave={e=>{e.currentTarget.style.border=`2px solid ${color}22`;e.currentTarget.style.background="rgba(255,255,255,0.02)";e.currentTarget.style.boxShadow="none";}}
                  onClick={action}>
                  <div style={{fontSize:28,marginBottom:8}}>{emoji}</div>
                  <div style={{fontSize:12,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1,color,marginBottom:5}}>{name}</div>
                  <div style={{fontSize:10,color:"#6B7CA1",lineHeight:1.5,whiteSpace:"pre-line",marginBottom:5}}>{desc}</div>
                  <div style={{fontSize:9,color:color+"BB",background:color+"11",borderRadius:4,padding:"2px 6px",display:"inline-block"}}>⏱ {time[lang]||time.ko}</div>
                </button>
              ))}
            </div>
            {isMobile&&<div style={{textAlign:"center",fontSize:10,color:"#FF9F43",marginBottom:10,padding:"5px 10px",background:"rgba(255,159,67,0.06)",border:"1px solid rgba(255,159,67,0.2)",borderRadius:6}}>📱 {lang==="ko"?"PC·태블릿에서 플레이하면 더 좋은 경험을 즐기실 수 있어요":"Best experienced on PC or tablet"}</div>}
            <div style={{fontSize:10,color:"#7788BB",textAlign:"center",letterSpacing:3,textTransform:"uppercase",marginBottom:10}}>{t("menu.loadGame")}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {slots.map((slot,i)=>(
                <div key={i} style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${slot?"rgba(100,120,255,0.15)":"rgba(255,255,255,0.06)"}`,borderRadius:10,padding:12}}>
                  {slot?.meta?(
                    <>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                        <div style={{fontSize:10,color:"#7788BB"}}>Slot {i+1}</div>
                        <div style={{fontSize:10,color:"#7788BB"}}>{timeAgoL(slot.meta.savedAt,t)}</div>
                      </div>
                      <div style={{fontSize:10,color:"#FFD93D",marginBottom:2}}>📅 {t("misc.day")} {slot.meta.day}</div>
                      <div style={{fontSize:10,color:"#00E5A0",marginBottom:2}}>💰 ${slot.meta.money?.toLocaleString()}</div>
                      <div style={{fontSize:10,marginBottom:8}}>{"⭐".repeat(slot.meta.stars||1)}</div>
                      <div style={{fontSize:10,color:"#9B7FFF",marginBottom:8}}>
                        {slot.meta.mode==="campaign"?`🎯 ${t(`scn.${slot.meta.scenario}`)||t("mode.campaign")}`:slot.meta.mode==="sandbox"?t("misc.sandbox"):`⚡ ${t("mode.challenge")}`}
                      </div>
                      <div style={{display:"flex",gap:4}}>
                        <button style={{flex:1,background:"rgba(155,127,255,0.12)",border:"1px solid rgba(155,127,255,0.3)",color:"#9B7FFF",borderRadius:5,padding:"4px 0",cursor:"pointer",fontSize:10,fontFamily:"inherit",transition:"all 0.15s"}} onClick={()=>loadFromSlot(slot)}>{t("menu.loadGame")}</button>
                        <button style={{background:"rgba(255,87,87,0.08)",border:"1px solid rgba(255,87,87,0.25)",color:"#FF5757",borderRadius:5,padding:"4px 6px",cursor:"pointer",fontSize:10,fontFamily:"inherit",transition:"all 0.15s"}} onClick={()=>{const n=[...slots];n[i]=null;const sr=writeSaveSlots(n);if(!sr||sr.ok){setSaveSlots(n);}else if(sr.quota){setSaveQuotaWarning(true);}}}>{t("menu.deleteSlot")}</button>
                      </div>
                    </>
                  ):(
                    <div style={{textAlign:"center",padding:"12px 0"}}>
                      <div style={{fontSize:10,color:"#7788BB",marginBottom:4}}>Slot {i+1}</div>
                      <div style={{fontSize:11,color:"#7788BB"}}>{t("menu.emptySlot")}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 🏆 명예의 전당 */}
            {(hof.vis||hof.day||hof.net)&&<div style={{marginTop:8,background:"rgba(255,217,61,0.04)",border:"1px solid rgba(255,217,61,0.15)",borderRadius:10,padding:"10px 14px"}}>
              <div style={{fontSize:9,color:"#FFD93D",letterSpacing:3,textTransform:"uppercase",marginBottom:6,fontWeight:700}}>🏆 {lang==="ko"?"명예의 전당":"Hall of Fame"}</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {hof.vis>0&&<div style={{flex:1,textAlign:"center",background:"rgba(77,159,255,0.06)",borderRadius:6,padding:"4px 8px",border:"1px solid rgba(77,159,255,0.15)"}}>
                  <div style={{fontSize:8,color:"#4D9FFF",letterSpacing:1}}>{lang==="ko"?"최다 방문객":"BEST VISITORS"}</div>
                  <div style={{fontSize:16,fontWeight:900,color:"#4D9FFF",fontFamily:"'Barlow Condensed',sans-serif"}}>{hof.vis.toLocaleString()}</div>
                </div>}
                {hof.day>0&&<div style={{flex:1,textAlign:"center",background:"rgba(0,229,160,0.06)",borderRadius:6,padding:"4px 8px",border:"1px solid rgba(0,229,160,0.15)"}}>
                  <div style={{fontSize:8,color:"#00E5A0",letterSpacing:1}}>{lang==="ko"?"최장 운영":"LONGEST RUN"}</div>
                  <div style={{fontSize:16,fontWeight:900,color:"#00E5A0",fontFamily:"'Barlow Condensed',sans-serif"}}>Day {hof.day}</div>
                </div>}
                {hof.net>0&&<div style={{flex:1,textAlign:"center",background:"rgba(255,217,61,0.06)",borderRadius:6,padding:"4px 8px",border:"1px solid rgba(255,217,61,0.15)"}}>
                  <div style={{fontSize:8,color:"#FFD93D",letterSpacing:1}}>{lang==="ko"?"최고 일수익":"BEST NET/DAY"}</div>
                  <div style={{fontSize:16,fontWeight:900,color:"#FFD93D",fontFamily:"'Barlow Condensed',sans-serif"}}>${hof.net.toLocaleString()}</div>
                </div>}
              </div>
              {Object.keys(speedrunRecords).length>0&&<div style={{marginTop:6,display:"flex",gap:4,flexWrap:"wrap"}}>
                {Object.entries(speedrunRecords).map(([scId,d])=>{const sc2=SCENARIOS.find(s=>s.id===scId);return sc2?(<span key={scId} style={{fontSize:9,background:"rgba(255,217,61,0.08)",border:"1px solid rgba(255,217,61,0.2)",borderRadius:4,padding:"2px 6px",color:"#FFD93D"}}>{sc2.emoji} 🥇 Day{d}</span>):null;})}
              </div>}
            </div>}

            {/* 저장 공간 부족 경고 */}
            {saveQuotaWarning&&<div style={{marginTop:8,background:"rgba(255,87,87,0.10)",border:"1px solid rgba(255,87,87,0.4)",borderRadius:8,padding:"8px 12px",display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16}}>⚠️</span>
              <div style={{flex:1,fontSize:10,color:"#FF5757",fontWeight:700}}>{lang==="ko"?"저장 공간이 부족합니다. 브라우저 설정에서 사이트 데이터를 정리하거나 저장 슬롯을 삭제하세요.":"Storage quota exceeded. Clear browser site data or delete a save slot."}</div>
              <button onClick={()=>setSaveQuotaWarning(false)} style={{background:"none",border:"none",color:"#7788BB",cursor:"pointer",fontSize:14}}>✕</button>
            </div>}
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
                      {[
                        {d:1,bg:"rgba(0,229,160,0.15)",bd:"rgba(0,229,160,0.4)",col:"#00E5A0",ko:"추천 시작",en:"STARTER"},
                        {d:2,bg:"rgba(77,159,255,0.15)",bd:"rgba(77,159,255,0.4)",col:"#4D9FFF",ko:"입문",en:"BEGINNER"},
                        {d:3,bg:"rgba(255,159,67,0.15)",bd:"rgba(255,159,67,0.4)",col:"#FF9F43",ko:"중급",en:"INTERMEDIATE"},
                        {d:4,bg:"rgba(255,87,87,0.15)",bd:"rgba(255,87,87,0.4)",col:"#FF5757",ko:"고급",en:"ADVANCED"},
                        {d:5,bg:"rgba(200,50,50,0.18)",bd:"rgba(200,50,50,0.5)",col:"#FF3333",ko:"전문가",en:"EXPERT"},
                      ].filter(b=>b.d===(sc.difficulty||1)).map(b=>(
                        <div key={b.d} style={{fontSize:9,background:b.bg,border:`1px solid ${b.bd}`,color:b.col,borderRadius:3,padding:"1px 5px",letterSpacing:1}}>{lang==="ko"?b.ko:b.en}</div>
                      ))}
                    </div>
                  </div>
                  <div style={{fontSize:11,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",color:sc.color,marginBottom:3}}>{t(`scn.${sc.id}`)}</div>
                  <div style={{fontSize:10,color:"#B0BDD8",lineHeight:1.5,marginBottom:5}}>{t(`scn.${sc.id}.desc`)}</div>
                  <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:4}}>
                    {sc.goals.map(g=><span key={g.id} style={{fontSize:9,padding:"2px 6px",background:"rgba(255,255,255,0.10)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:3,color:"#DDE2FF"}}>{g.medal} {g.desc?.[lang]||g.desc?.ko||""}</span>)}
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#9BA8CC"}}>
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
                <div style={{fontSize:10,color:"#B0BDD8",lineHeight:1.6,marginBottom:8}}>{t(`scn.${sc.id}.desc`)}</div>
                <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:6}}>
                  {sc.goals.map(g=><span key={g.id} style={{fontSize:9,padding:"2px 6px",background:"rgba(255,255,255,0.10)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:3,color:"#DDE2FF"}}>{g.medal} {g.desc?.[lang]||g.desc?.ko}</span>)}
                </div>
                <div style={{display:"flex",gap:10,fontSize:10,color:"#7788BB"}}>
                  <span>💰 ${sc.startMoney.toLocaleString()}</span>
                  <span>⏱ {sc.timeLimit}{lang==="ko"?"일":"d"}</span>
                  <span>{"★".repeat(sc.difficulty||1)}{"☆".repeat(5-(sc.difficulty||1))}</span>
                </div>
              </div>

              {/* 난이도 선택 */}
              <div style={{fontSize:10,color:"#7788BB",textAlign:"center",letterSpacing:3,textTransform:"uppercase",marginBottom:10}}>
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
                      onClick={()=>setPendingStartParams({mode:"campaign",scenarioId:pendingScenarioId,diff:sd.diffKey})}>
                      <div style={{fontSize:24,marginBottom:6}}>{sd.emoji}</div>
                      <div style={{fontSize:13,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1,color:sd.color,marginBottom:4}}>{sd.label[lang]||sd.label.ko}</div>
                      <div style={{fontSize:10,color:"#7788BB",lineHeight:1.6,marginBottom:8}}>{sd.desc[lang]||sd.desc.ko}</div>
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
                  onClick={()=>setPendingStartParams({mode:"challenge",scenarioId:null,diff:key})}>
                  <div style={{fontSize:24,marginBottom:6}}>{diff.emoji}</div>
                  <div style={{fontSize:12,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",color:"#FF6B9D",marginBottom:3}}>{t(`diff.${key}`)}</div>
                  <div style={{fontSize:10,color:"#6B7CA1",marginBottom:6}}>{t(`diff.${key}.desc`)}</div>
                  <div style={{fontSize:10,fontWeight:700,color:"#FFD93D",fontFamily:"'Barlow Condensed',monospace"}}>${diff.startMoney.toLocaleString()}</div>
                </button>
              ))}
            </div>
            {/* 이번 주 챌린지 */}
            {(()=>{
              const wc=WEEKLY_CHALLENGES[Math.floor(Date.now()/(7*24*60*60*1000))%WEEKLY_CHALLENGES.length];
              return(<div style={{marginTop:12,background:"linear-gradient(135deg,rgba(255,107,157,0.08),rgba(155,127,255,0.06))",border:"2px solid rgba(255,107,157,0.3)",borderRadius:12,padding:"12px 14px"}}>
                <div style={{fontSize:9,color:"#FF6B9D",letterSpacing:3,textTransform:"uppercase",marginBottom:6}}>🗓️ {lang==="ko"?"이번 주 챌린지":"THIS WEEK'S CHALLENGE"}</div>
                <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:8}}>
                  <span style={{fontSize:24,lineHeight:1}}>{wc.emoji}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:800,color:"#FF6B9D",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1,marginBottom:2}}>{wc.title[lang]||wc.title.ko}</div>
                    <div style={{fontSize:10,color:"#8899BB",lineHeight:1.5}}>{wc.desc[lang]||wc.desc.ko}</div>
                  </div>
                </div>
                <button style={{width:"100%",background:"rgba(255,107,157,0.15)",border:"2px solid rgba(255,107,157,0.5)",color:"#FF6B9D",borderRadius:8,padding:"8px 0",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700,transition:"all 0.15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,107,157,0.25)";e.currentTarget.style.boxShadow="0 4px 16px rgba(255,107,157,0.3)";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,107,157,0.15)";e.currentTarget.style.boxShadow="none";}}
                  onClick={()=>setPendingStartParams({mode:"challenge",scenarioId:null,diff:"normal",wc})}>
                  {lang==="ko"?"이번 주 챌린지 시작":"Start This Week's Challenge"}
                </button>
              </div>);
            })()}
          </>}

          {/* 하단 버전 정보 */}
          <div style={{textAlign:"center",marginTop:24,fontSize:10,color:"#1A2040",fontFamily:"'Space Mono',monospace"}}>
            v1.0.0 · Parcadia · {lang==="ko"?"무료 경영 시뮬레이션":"Free Management Sim"}
          </div>
        </div>
      </div>

      {/* 시작 특성 선택 모달 */}
      {pendingStartParams&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.82)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)"}} onClick={()=>setPendingStartParams(null)}>
          <div style={{background:"linear-gradient(180deg,#0C1128 0%,#070919 100%)",border:"1px solid rgba(120,140,255,0.3)",borderRadius:18,padding:28,minWidth:320,maxWidth:460,boxShadow:"0 16px 60px rgba(0,0,0,0.9)",animation:"building-appear 0.25s cubic-bezier(0.34,1.56,0.64,1)"}} onClick={e=>e.stopPropagation()}>
            <div style={{textAlign:"center",marginBottom:6}}>
              <div style={{fontSize:9,color:"#7788BB",letterSpacing:3,textTransform:"uppercase",marginBottom:4}}>{lang==="ko"?"시작 전 특성 선택":"CHOOSE YOUR STARTING PERK"}</div>
              <div style={{fontSize:13,fontWeight:800,color:"#DDE2FF",fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1}}>🎯 {lang==="ko"?"1개만 선택 가능 — 다음 게임에는 새로 선택":"Pick one — choose again each new game"}</div>
              {pendingStartParams.mode==="campaign"&&lifetimeRP>0&&(
                <div style={{marginTop:8,background:"rgba(162,155,254,0.1)",border:"1px solid rgba(162,155,254,0.25)",borderRadius:6,padding:"4px 10px",display:"inline-block"}}>
                  <span style={{fontSize:9,color:"#A29BFE"}}>🔬 {lang==="ko"?"누적 RP 보너스":"Lifetime RP Bonus"}: </span>
                  <span style={{fontSize:10,fontWeight:700,color:"#FFD93D"}}>+${Math.min(10000,Math.floor(lifetimeRP*500)).toLocaleString()}</span>
                </div>
              )}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:16}}>
              {STARTING_PERKS.map(p=>(
                <button key={p.id}
                  style={{background:`${p.color}0A`,border:`2px solid ${p.color}44`,borderRadius:12,padding:"14px 16px",cursor:"pointer",textAlign:"left",fontFamily:"inherit",transition:"all 0.2s",display:"flex",alignItems:"flex-start",gap:12}}
                  onMouseEnter={e=>{e.currentTarget.style.background=`${p.color}1A`;e.currentTarget.style.borderColor=p.color;e.currentTarget.style.boxShadow=`0 4px 20px ${p.color}33`;}}
                  onMouseLeave={e=>{e.currentTarget.style.background=`${p.color}0A`;e.currentTarget.style.borderColor=`${p.color}44`;e.currentTarget.style.boxShadow="none";}}
                  onClick={()=>{startGame(pendingStartParams.mode,pendingStartParams.scenarioId,pendingStartParams.diff,p.id,pendingStartParams.wc||null);setPendingStartParams(null);}}>
                  <span style={{fontSize:26,lineHeight:1,filter:`drop-shadow(0 0 8px ${p.color}88)`}}>{p.emoji}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:800,color:p.color,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1,marginBottom:2}}>{p.name[lang]||p.name.ko}</div>
                    <div style={{fontSize:10,color:"#8899BB",lineHeight:1.5}}>{p.desc[lang]||p.desc.ko}</div>
                  </div>
                </button>
              ))}
            </div>
            <button style={{marginTop:14,width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:"#6677AA",borderRadius:8,padding:"8px 0",cursor:"pointer",fontFamily:"inherit",fontSize:10,transition:"all 0.15s"}}
              onClick={()=>{startGame(pendingStartParams.mode,pendingStartParams.scenarioId,pendingStartParams.diff,null,pendingStartParams.wc||null);setPendingStartParams(null);}}>
              {lang==="ko"?"특성 없이 시작":"Start without a perk"}
            </button>
          </div>
        </div>
      )}
    </>);
  }

  // ════════════════════════════════════════════════════════
  // ── GAME SCREEN ─────────────────────────────────────────
  return(
    <div style={{fontFamily:"'Rajdhani','Barlow Condensed',sans-serif",background:"var(--bg-deep)",color:"var(--text-primary)",height:"100%",display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {showSettings&&<SettingsModal uiSettings={uiSettings} setUiSettings={setUiSettings} soundOn={soundOn} setSoundOn={setSoundOn} onClose={()=>setShowSettings(false)} lang={lang}/>}
      {/* 키보드 단축키 도움말 모달 */}
      {showKeyboardHelp&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setShowKeyboardHelp(false)}>
          <div style={{background:"#0C1128",border:"1px solid rgba(100,120,255,0.35)",borderRadius:14,padding:24,minWidth:300,maxWidth:400,boxShadow:"0 8px 40px rgba(0,0,0,0.8)",backdropFilter:"blur(12px)"}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
              <div style={{fontSize:15,fontWeight:700,letterSpacing:2,color:"#DDE2FF"}}>⌨️ {lang==="ko"?"키보드 단축키":"Keyboard Shortcuts"}</div>
              <button style={{background:"none",border:"none",color:"#8899BB",cursor:"pointer",fontSize:16,fontFamily:"inherit"}} onClick={()=>setShowKeyboardHelp(false)}>✕</button>
            </div>
            {[
              {key:"Tab",    desc:{ko:"다음 탭으로 이동",     en:"Cycle to next tab"}},
              {key:"B",      desc:{ko:"건설 모드",             en:"Build mode"}},
              {key:"D",      desc:{ko:"철거 모드",             en:"Demolish mode"}},
              {key:"Z",      desc:{ko:"구역 페인트 모드",      en:"Zone paint mode"}},
              {key:"R",      desc:{ko:"마지막 건물 다시 배치", en:"Repeat last build"}},
              {key:"1 / 2 / 3", desc:{ko:"게임 속도 변경",   en:"Change game speed"}},
            ].map(({key,desc})=>(
              <div key={key} style={{display:"flex",alignItems:"center",gap:12,padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                <div style={{minWidth:80,display:"flex",gap:4,flexWrap:"wrap"}}>
                  {key.split(" / ").map(k=>(
                    <span key={k} style={{background:"rgba(100,120,255,0.12)",border:"1px solid rgba(100,120,255,0.35)",borderRadius:5,padding:"2px 8px",fontSize:11,fontWeight:700,color:"#9DB4FF",fontFamily:"monospace",letterSpacing:1}}>{k}</span>
                  ))}
                </div>
                <span style={{fontSize:12,color:"#8899BB"}}>{desc[lang]||desc.en}</span>
              </div>
            ))}
            <div style={{marginTop:14,fontSize:10,color:"#3A4A6A",textAlign:"center"}}>{lang==="ko"?"그리드 클릭으로 건설 / 드래그로 다중 배치":"Click grid to build / Drag to place multiple"}</div>
          </div>
        </div>
      )}
      {/* Phase 3-5: 업적 달성 플래시 알림 */}
      {achievementFlash&&(
        <div style={{position:"fixed",bottom:24,right:20,zIndex:9998,background:`rgba(5,8,28,0.97)`,border:`2px solid ${achievementFlash.col}`,borderRadius:12,padding:"10px 16px",display:"flex",gap:10,alignItems:"center",boxShadow:`0 4px 24px rgba(0,0,0,0.8), 0 0 20px ${achievementFlash.col}44`,animation:"slide-in 0.3s ease",backdropFilter:"blur(10px)",maxWidth:280}}>
          <span style={{fontSize:28,filter:`drop-shadow(0 0 6px ${achievementFlash.col})`}}>{achievementFlash.emoji}</span>
          <div>
            <div style={{fontSize:9,color:achievementFlash.col,letterSpacing:2,textTransform:"uppercase",marginBottom:2}}>{lang==="ko"?"🏅 업적 달성":"🏅 ACHIEVEMENT"}</div>
            <div style={{fontSize:13,fontWeight:800,color:"#DDE2FF",fontFamily:"'Barlow Condensed',sans-serif"}}>{achievementFlash.name[lang]||achievementFlash.name.ko}</div>
            <div style={{fontSize:10,color:"#6B7CA1",marginTop:1}}>{achievementFlash.desc[lang]||achievementFlash.desc.ko}</div>
          </div>
        </div>
      )}
      {/* Phase 3-2: 라이벌 이벤트 배너 */}
      {rivalEventActive&&screen==="game"&&(
        <div style={{position:"fixed",top:72,left:"50%",transform:"translateX(-50%)",zIndex:150,background:`rgba(5,8,28,0.97)`,border:`1px solid ${rivalEventActive.col}77`,borderRadius:8,padding:"5px 14px",display:"flex",gap:8,alignItems:"center",backdropFilter:"blur(8px)",pointerEvents:"none",animation:"slide-in 0.3s ease"}}>
          <span style={{fontSize:14}}>{rivalEventActive.emoji}</span>
          <span style={{fontSize:10,fontWeight:700,color:rivalEventActive.col}}>{rivalEventActive.name[lang]||rivalEventActive.name.ko}</span>
          <span style={{fontSize:9,color:"#555577"}}>{rivalEventActive.remaining}d</span>
        </div>
      )}
      {speed===0&&!scenarioResult&&day>1&&(
        <div onClick={()=>setSpeed(1)} style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:"rgba(5,8,28,0.92)",border:"2px solid rgba(120,140,255,0.4)",borderRadius:14,padding:"12px 20px",zIndex:200,cursor:"pointer",backdropFilter:"blur(10px)",pointerEvents:"auto",minWidth:220,boxShadow:"0 8px 40px rgba(0,0,0,0.8)"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:stats.brokenCount>0||clean<40||sat<50?8:0,animation:"pulse 1.5s ease-in-out infinite"}}>
            <span style={{fontSize:20}}>⏸</span>
            <span style={{fontSize:13,fontWeight:700,color:"#DDE2FF",letterSpacing:2,fontFamily:"'Barlow Condensed',sans-serif"}}>{lang==="ko"?"일시정지 — 클릭하여 재개":"PAUSED — Click to Resume"}</span>
          </div>
          {/* 2-3: 오늘의 문제점 요약 */}
          {(()=>{
            const issues=[];
            if(stats.brokenCount>0) issues.push({emoji:"🔧",col:"#FF9F43",msg:lang==="ko"?`${stats.brokenCount}개 시설 고장 — 수리 필요`:`${stats.brokenCount} broken rides — repair needed`});
            if(clean<40) issues.push({emoji:"🗑️",col:"#FF5757",msg:lang==="ko"?`청결도 ${Math.round(clean)}% — 청소부 부족`:`Cleanliness ${Math.round(clean)}% — need janitors`});
            if(sat<50&&sat>0) issues.push({emoji:"😔",col:"#FF6B9D",msg:lang==="ko"?`만족도 ${Math.round(sat)}% — 방문객 감소 중`:`Satisfaction ${Math.round(sat)}% — visitors leaving`});
            if(hired.janitor===0&&hired.mechanic===0&&day>3) issues.push({emoji:"👷",col:"#4D9FFF",msg:lang==="ko"?"직원 없음 — 경영 탭에서 고용하세요":"No staff — hire in Manage tab"});
            if(hasNoPath&&stats.hasEntrance) issues.push({emoji:"🛤️",col:"#FFD93D",msg:lang==="ko"?"통로 없음 — 놀이기구 수익 -40%":"No paths — ride income -40%"});
            if(issues.length===0) return null;
            return(<div style={{borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:8}} onClick={e=>e.stopPropagation()}>
              <div style={{fontSize:9,color:"#444466",letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>{lang==="ko"?"⚠ 현재 문제점":"⚠ CURRENT ISSUES"}</div>
              {issues.slice(0,3).map(({emoji,col,msg},i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"3px 0",fontSize:10,color:col,fontWeight:600}}>
                  <span>{emoji}</span><span>{msg}</span>
                </div>
              ))}
            </div>);
          })()}
        </div>
      )}

      {/* TOP BAR — 2행 구조 (PC/tablet only) */}
      {!isMobile&&<div style={{background:"linear-gradient(180deg,#0A0D22 0%,#07091A 100%)",borderBottom:"1px solid rgba(100,120,255,0.15)",boxShadow:"0 2px 20px rgba(0,0,0,0.5)",flexShrink:0}}>
        {/* 1행: 로고 / 모드 / 날씨·별점·단계 / 저장·속도 */}
        <div className="topbar-row1" style={{display:"flex",alignItems:"center",gap:4,padding:"3px 8px",overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
          <button style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.10)",color:"#6B7CA1",borderRadius:5,padding:"3px 7px",cursor:"pointer",fontSize:10,fontFamily:"inherit",whiteSpace:"nowrap",transition:"all 0.15s"}} onClick={()=>{setSpeed(0);setScreen("menu");}}>{t("btn.menu")}</button>
          <div style={{fontSize:13,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:4,color:"transparent",background:"linear-gradient(135deg,#FFD93D,#FF9F43)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",whiteSpace:"nowrap"}}>🎡 PARCADIA</div>
          <div style={{fontSize:10,borderRadius:4,padding:"2px 6px",background:gameMode==="sandbox"?"rgba(255,217,61,0.10)":gameMode==="campaign"?"rgba(0,229,160,0.10)":"rgba(255,107,157,0.10)",border:`1px solid ${gameMode==="sandbox"?"rgba(255,217,61,0.3)":gameMode==="campaign"?"rgba(0,229,160,0.3)":"rgba(255,107,157,0.3)"}`,color:gameMode==="sandbox"?"#FFD93D":gameMode==="campaign"?"#00E5A0":"#FF6B9D",whiteSpace:"nowrap",fontWeight:600}}>
            {gameMode==="sandbox"?t("misc.sandbox"):gameMode==="campaign"?`🎯 ${t(`scn.${currentScenarioData?.id}`)||(lang==="ko"?"캠페인":"Campaign")}`:`⚡ ${t(`diff.${difficulty}`)}`}
          </div>
          {gameMode==="campaign"&&scenarioTimeLimit>0&&(
            <div style={{fontSize:10,padding:"2px 5px",background:day>scenarioTimeLimit-5?"rgba(255,71,87,0.12)":"rgba(255,255,255,0.04)",border:`1px solid ${day>scenarioTimeLimit-5?"rgba(255,71,87,0.5)":"rgba(255,255,255,0.08)"}`,borderRadius:4,color:day>scenarioTimeLimit-5?"#FF5757":"#6B7CA1",whiteSpace:"nowrap"}}>
              ⏱ {Math.max(0,scenarioTimeLimit-day)}d
            </div>
          )}
          <div style={{flex:1}}/>
          {/* 날씨 + 3-4: 예보 */}
          <div style={{display:"flex",alignItems:"center",gap:2,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:4,padding:"2px 6px"}}>
            <span style={{fontSize:12}}>{weather.emoji}</span>
            <span style={{fontSize:10,color:"#6B7CA1"}}>{weather.name[lang]||weather.name.ko}</span>
            {weatherForecast.length>0&&<>
              <span style={{fontSize:9,color:"#333355",margin:"0 1px"}}>→</span>
              {weatherForecast.slice(0,2).map((w,i)=>(
                <span key={i} title={w.name[lang]||w.name.ko} style={{fontSize:10,opacity:0.5+i*0.15,filter:"grayscale(0.3)"}}>{w.emoji}</span>
              ))}
            </>}
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
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1,background:`${currentStage.color}12`,border:`1px solid ${currentStage.color}33`,borderRadius:4,padding:"2px 6px",cursor:"pointer",transition:"all 0.15s"}} onClick={()=>setTab("mission")}>
            <div style={{display:"flex",alignItems:"center",gap:2,whiteSpace:"nowrap"}}>
              <span style={{fontSize:10}}>{currentStage.emoji}</span>
              <span style={{fontSize:10,fontWeight:700,color:currentStage.color}}>S{currentStage.id}{!currentStage.next?"★":""}</span>
              {stageProgress&&<span style={{fontSize:8,color:"#333355"}}>→S{currentStage.id+1}</span>}
            </div>
            {stageProgress&&(
              <div style={{display:"flex",gap:1}}>
                {[{pct:stageProgress.bld,col:"#48DBFB"},{pct:stageProgress.stars,col:"#FECA57"},{pct:stageProgress.money,col:"#5EF6A0"}].map(({pct,col},i)=>(
                  <div key={i} style={{width:13,height:2,background:"#111128",borderRadius:99,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct*100}%`,background:pct>=1?col:col+"88",borderRadius:99,transition:"width 0.5s"}}/>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* 주간 배지 인디케이터 */}
          {weeklyBadges.length>0&&(
            <div title={`${weeklyBadges.length} badge${weeklyBadges.length>1?"s":""}`} onClick={()=>setTab("mission")} style={{display:"flex",alignItems:"center",gap:2,background:"rgba(255,217,61,0.1)",border:"1px solid rgba(255,217,61,0.3)",borderRadius:4,padding:"2px 6px",cursor:"pointer",flexShrink:0}}>
              <span style={{fontSize:10}}>🏅</span>
              <span style={{fontSize:10,fontWeight:700,color:"#FFD93D"}}>{weeklyBadges.length}</span>
            </div>
          )}
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
            style={{background:"rgba(100,120,255,0.08)",border:"1px solid rgba(100,120,255,0.2)",color:soundOn?"#8899CC":"#7788BB",borderRadius:5,padding:"3px 7px",cursor:"pointer",fontSize:12,fontFamily:"inherit",transition:"all 0.15s"}}
          >
            {soundOn?"🔊":"🔇"}
          </button>
          <button
            onClick={()=>setBgMusicOn(s=>!s)}
            title={bgMusicOn?(lang==="ko"?"배경음악 끄기":"Music off"):(lang==="ko"?"배경음악 켜기":"Music on")}
            style={{background:bgMusicOn?"rgba(168,139,255,0.12)":"rgba(100,120,255,0.08)",border:`1px solid ${bgMusicOn?"rgba(168,139,255,0.4)":"rgba(100,120,255,0.2)"}`,color:bgMusicOn?"#A88BFF":"#7788BB",borderRadius:5,padding:"3px 7px",cursor:"pointer",fontSize:12,fontFamily:"inherit",transition:"all 0.15s"}}
          >
            🎵
          </button>
          <button
            onClick={()=>setShowSettings(true)}
            title={lang==="ko"?"설정":"Settings"}
            style={{background:"rgba(100,120,255,0.08)",border:"1px solid rgba(100,120,255,0.2)",color:"#8899CC",borderRadius:5,padding:"3px 7px",cursor:"pointer",fontSize:12,fontFamily:"inherit",transition:"all 0.15s"}}
          >
            ⚙️
          </button>
          {/* 키보드 단축키 도움말 */}
          <button
            onClick={()=>setShowKeyboardHelp(true)}
            title={lang==="ko"?"키보드 단축키":"Keyboard Shortcuts"}
            style={{background:"rgba(100,120,255,0.08)",border:"1px solid rgba(100,120,255,0.2)",color:"#8899CC",borderRadius:5,padding:"3px 7px",cursor:"pointer",fontSize:11,fontFamily:"inherit",transition:"all 0.15s"}}
          >
            ⌨️
          </button>
          {/* URL Export */}
          <button
            onClick={exportSaveURL}
            title={lang==="ko"?"저장 URL 공유":"Share Save URL"}
            style={{background:"rgba(100,120,255,0.08)",border:"1px solid rgba(100,120,255,0.2)",color:"#8899CC",borderRadius:5,padding:"3px 7px",cursor:"pointer",fontSize:11,fontFamily:"inherit",transition:"all 0.15s"}}
          >
            🔗
          </button>
          {/* Social Share */}
          <button
            onClick={sharePark}
            title={lang==="ko"?"공원 소셜 공유":"Share park"}
            style={{background:"rgba(0,229,160,0.08)",border:"1px solid rgba(0,229,160,0.2)",color:"#00D090",borderRadius:5,padding:"3px 7px",cursor:"pointer",fontSize:11,fontFamily:"inherit",transition:"all 0.15s"}}
          >
            📤
          </button>
          {/* 속도 */}
          <div style={{display:"flex",gap:2}}>
            {[["⏸",0],["▶",1],["⏩",2],["⚡",3]].map(([ic,sp])=>{
              const spCol=sp===0?"#7788BB":sp===1?"#00E5A0":sp===2?"#FF9F43":"#FF6B9D";
              return(<button key={sp} title={sp===0?(lang==="ko"?"일시정지":"Pause"):sp===1?(lang==="ko"?"보통 속도":"Normal"):sp===2?(lang==="ko"?"빨리 감기":"Fast"):lang==="ko"?"매우 빨리 감기":"Very Fast"} style={{background:speed===sp?`${spCol}18`:"rgba(255,255,255,0.04)",border:`1px solid ${speed===sp?spCol:"rgba(255,255,255,0.08)"}`,color:speed===sp?spCol:"#7788BB",borderRadius:4,padding:"2px 4px",cursor:"pointer",fontSize:11,fontFamily:"inherit",transition:"all 0.15s",boxShadow:speed===sp?`0 0 8px ${spCol}44`:"none"}} onClick={()=>setSpeed(sp)}>{ic}</button>);
            })}
          </div>
        </div>
        {/* 2행: 스탯 카드 */}
        {/* 시나리오 진행 게이지 */}
        {gameMode==="campaign"&&scenarioTimeLimit>0&&(
          <div style={{padding:"2px 12px",borderTop:"1px solid rgba(255,255,255,0.04)"}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:9,color:"#6B7CA1",whiteSpace:"nowrap",flexShrink:0}}>📅 {lang==="ko"?"시나리오 진행":"Progress"}</span>
              <div style={{flex:1,height:4,background:"rgba(255,255,255,0.06)",borderRadius:99,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${Math.min(100,day/scenarioTimeLimit*100).toFixed(1)}%`,background:day>scenarioTimeLimit*0.85?"#FF5757":day>scenarioTimeLimit*0.6?"#FFD93D":"#00E5A0",borderRadius:99,transition:"width 0.5s"}}/>
              </div>
              <span style={{fontSize:9,color:day>scenarioTimeLimit*0.85?"#FF5757":"#6B7CA1",flexShrink:0,whiteSpace:"nowrap"}}>{day}/{scenarioTimeLimit}d</span>
            </div>
          </div>
        )}
        <div className="topbar-stats" style={{display:"flex",gap:4,padding:"4px 12px",borderTop:"1px solid rgba(255,255,255,0.06)",overflowX:"auto",alignItems:"center"}}>
          {/* stat tooltip overlay */}
          {statTooltip&&(
            <div onClick={()=>setStatTooltip(null)} style={{position:"fixed",inset:0,zIndex:9998,cursor:"pointer"}}>
              <div onClick={e=>e.stopPropagation()} style={{position:"fixed",top:"60px",left:"50%",transform:"translateX(-50%)",background:"rgba(8,12,32,0.97)",border:"1px solid rgba(100,120,255,0.3)",borderRadius:10,padding:"12px 16px",zIndex:9999,minWidth:260,maxWidth:340,backdropFilter:"blur(10px)",animation:"slide-in 0.15s ease"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#A0B0FF",letterSpacing:1}}>{statTooltip.title}</div>
                  <button onClick={()=>setStatTooltip(null)} style={{background:"none",border:"none",color:"#556688",cursor:"pointer",fontSize:13,lineHeight:1,padding:"0 2px"}}>✕</button>
                </div>
                <div style={{fontSize:10,color:"#8899BB",lineHeight:1.6}}>{statTooltip.desc}</div>
              </div>
            </div>
          )}
          {[
            {ic:"💰",v:`$${money.toLocaleString()}`,l:t("lbl.budget"),  col:"#FFD93D",big:true,primary:true,isVis:false},
            {ic:"👥",v:visitors.toLocaleString(),   l:t("lbl.visitors"), col:"#4D9FFF",big:true,primary:true,isVis:true, tipKey:"vis"},
            {ic:"😊",v:`${Math.round(sat)}%`,        l:t("lbl.satisfaction"),col:sat>70?"#00E5A0":sat>40?"#FFD93D":"#FF5757",big:true,primary:true,isVis:false,isSat:true, tipKey:"sat"},
            {ic:"__sep__"},
            {ic:"🧹",v:`${Math.round(clean)}%`,      l:t("lbl.cleanliness"), col:clean>70?"#00E5A0":clean>40?"#FFD93D":"#FF5757",big:false,primary:false,isVis:false, tipKey:"clean"},
            {ic:estNet>=0?"📈":"📉",v:`${estNet>=0?"+":""}$${Math.abs(estNet)>=1000?`${(Math.abs(estNet)/1000).toFixed(1)}k`:Math.abs(estNet)}${netTrendArrow}`,l:lang==="ko"?"일 순이익":"Net/Day",col:estNet>=0?"#5EF6A0":"#FF6B6B",big:false,primary:false,isVis:false},
            {ic:"📅",v:`Day ${day}`,                 l:t("lbl.day"),    col:"#9B7FFF",big:false,primary:false,isVis:false},
            {ic:"🔬",v:`${researchPoints}RP`,         l:lang==="ko"?"연구 포인트":"Research",col:"#A29BFE",big:false,primary:false,isVis:false, tipKey:"rp"},
            ...(totalDebt>0?[{ic:"💳",v:`$${(totalDebt/1000).toFixed(0)}k`,l:t("lbl.loan"),col:"#FF5757",big:false,primary:false,isVis:false}]:[]),
            ...(activeDisaster?[{ic:"🚨",v:`${activeDisaster.remaining}d`,l:t("lbl.disaster"),col:"#FF5757",big:false,primary:false,isVis:false}]:[]),
          ].map(({ic,v,l,col,big,primary,isVis,isSat,tipKey})=>{
            if(ic==="__sep__") return <div key="__sep__" style={{width:1,alignSelf:"stretch",background:"rgba(255,255,255,0.12)",margin:"2px 3px",flexShrink:0}}/>;
            const STAT_TIPS={
              vis:{title:lang==="ko"?"👥 방문객":"👥 Visitors",desc:lang==="ko"?"놀이기구 점수, 만족도, 요금, 날씨, 계절에 따라 결정됩니다. 입구가 있어야 방문객이 들어올 수 있어요.\nVisitors depend on attraction score, satisfaction, fees, weather & season. Requires an entrance gate.":"Visitors depend on attraction score, satisfaction, fees, weather & season. Requires an entrance gate."},
              sat:{title:lang==="ko"?"😊 만족도":"😊 Satisfaction",desc:lang==="ko"?"청결도, 시설 품질, 요금, 혼잡도가 영향을 줍니다. 만족도가 높을수록 방문객이 더 오고 수익이 늘어요.\nAffected by cleanliness, facility quality, fees & congestion. Higher satisfaction = more visitors & revenue.":"Affected by cleanliness, facility quality, fees & congestion. Higher satisfaction = more visitors & revenue."},
              clean:{title:lang==="ko"?"🧹 청결도":"🧹 Cleanliness",desc:lang==="ko"?"방문객이 많을수록 더러워지고, 청소부를 고용하면 올라갑니다. 청결도 30% 미만이면 만족도가 크게 떨어져요.\nGets dirty with visitors; hire janitors to maintain. Below 30% causes big satisfaction penalty.":"Gets dirty with visitors; hire janitors to maintain. Below 30% causes big satisfaction penalty."},
              rp:{title:lang==="ko"?"🔬 연구 포인트":"🔬 Research Points",desc:lang==="ko"?"매일 방문객 수에 비례해 획득합니다. 연구 탭에서 공원 업그레이드에 사용하세요.\nEarned daily based on visitor count. Spend in the Research tab to unlock permanent park upgrades.":"Earned daily based on visitor count. Spend in the Research tab to unlock permanent park upgrades."},
            };
            const valFontSize=big?16:primary?13:10;
            const lblColor=primary?"#5566AA":"#3A4A6A";
            return(
            <div key={l} style={{position:"relative",display:"flex",alignItems:"center",gap:1}}>
              <div
                onClick={isVis?()=>setShowVisBreakdown(x=>!x):undefined}
                onMouseEnter={isSat?(e)=>{const r=e.currentTarget.getBoundingClientRect();const tw=200,th=180;const x=Math.max(8,Math.min(r.left,window.innerWidth-tw-8));const y=r.bottom+4+th>window.innerHeight?r.top-th-4:r.bottom+4;setSatTooltipPos({x,y});setShowSatTooltip(true);}:undefined}
                onMouseLeave={isSat?()=>setShowSatTooltip(false):undefined}
                style={{display:"flex",alignItems:"center",gap:4,background:big?"rgba(255,255,255,0.05)":primary?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.025)",border:`1px solid ${isVis&&showVisBreakdown?"#4D9FFF66":isSat&&showSatTooltip?col+"66":big?col+"33":primary?col+"22":"rgba(255,255,255,0.06)"}`,borderRadius:8,padding:big?"3px 10px":primary?"3px 9px":"3px 7px",whiteSpace:"nowrap",flexShrink:0,cursor:isVis||isSat?"pointer":"default",transition:"border-color 0.15s",opacity:primary?1:0.85}}>
                <span style={{fontSize:big?14:primary?12:10}}>{ic}</span>
                <div>
                  <div style={{fontSize:primary?9:8,color:lblColor,textTransform:"uppercase",letterSpacing:1,lineHeight:1,fontWeight:600}}>{l}{isVis&&<span style={{marginLeft:3,fontSize:8,color:"#4D9FFF44"}}>{showVisBreakdown?"▲":"▼"}</span>}{isSat&&<span style={{marginLeft:2,fontSize:7,color:col+"66"}}>▼</span>}</div>
                  <div style={{fontSize:valFontSize,fontWeight:big?900:primary?800:700,fontFamily:"'Barlow Condensed',sans-serif",color:primary?col:col+"CC",lineHeight:1.1}}>{v}</div>
                </div>
              </div>
              {tipKey&&STAT_TIPS[tipKey]&&<button onClick={()=>setStatTooltip(st=>st?.title===STAT_TIPS[tipKey].title?null:STAT_TIPS[tipKey])} style={{background:"none",border:"1px solid rgba(100,120,255,0.2)",borderRadius:"50%",width:13,height:13,fontSize:7,color:"#5566AA",cursor:"pointer",padding:0,lineHeight:1,flexShrink:0}}>?</button>}
              {/* 만족도 hover 툴팁 */}
              {isSat&&showSatTooltip&&(
                <div style={{position:"fixed",top:satTooltipPos.y,left:satTooltipPos.x,background:"rgba(8,12,32,0.97)",border:`1px solid ${col}44`,borderRadius:8,padding:"8px 10px",zIndex:9999,minWidth:180,backdropFilter:"blur(8px)",animation:"slide-in 0.15s ease",pointerEvents:"none"}}>
                  <div style={{fontSize:9,fontWeight:700,color:col,letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>😊 {lang==="ko"?"만족도 영향 요인":"Satisfaction Factors"}</div>
                  {[
                    {label:lang==="ko"?"🏗️ 시설 보너스":"🏗️ Facilities", val:+stats.satBonus.toFixed(1), pos:stats.satBonus>=0},
                    {label:lang==="ko"?`☀️ 날씨 (${weather.id})`:`☀️ Weather`, val:weather.satMod, pos:weather.satMod>=0},
                    {label:lang==="ko"?"🔧 고장 시설":"🔧 Broken", val:-(stats.brokenCount*5), pos:stats.brokenCount===0},
                    {label:lang==="ko"?"💸 입장료":"💸 Admission", val:fee>maxFee?-5:0, pos:fee<=maxFee},
                    {label:lang==="ko"?"🚶 혼잡도":"🚶 Crowd", val:congestedCells.size>0?-8:0, pos:congestedCells.size===0},
                    {label:lang==="ko"?"📉 자연 감소":"📉 Natural", val:-0.18, pos:false},
                  ].map(({label,val,pos})=>(
                    <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"1.5px 0",gap:8}}>
                      <span style={{fontSize:9,color:"#9BA8CC"}}>{label}</span>
                      <span style={{fontSize:10,fontWeight:700,color:pos?"#00E5A0":"#FF5757",fontFamily:"'Barlow Condensed',sans-serif",flexShrink:0}}>
                        {val>0?"+":""}{val}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );})}
          {/* 2-4: 구역 시너지 활성 배지 */}
          {(()=>{
            const mastered=Object.entries(zoneMastery).filter(([,zm])=>zm.mastered);
            if(mastered.length===0) return null;
            const totalBonus=mastered.reduce((t,[,zm])=>t+zm.bonus,0);
            return(
              <div title={mastered.map(([k,zm])=>`${ZONES[k]?.emoji} +${Math.round(zm.bonus*100)}%`).join(" · ")}
                style={{display:"flex",alignItems:"center",gap:3,background:"rgba(29,209,161,0.08)",border:"1px solid rgba(29,209,161,0.3)",borderRadius:6,padding:"2px 7px",cursor:"pointer",flexShrink:0,whiteSpace:"nowrap"}} onClick={()=>setTab("mission")}>
                <span style={{fontSize:10}}>⚡</span>
                <div>
                  <div style={{fontSize:8,color:"#1DD1A188",letterSpacing:1,textTransform:"uppercase",lineHeight:1}}>ZONE</div>
                  <div style={{fontSize:10,fontWeight:700,color:"#1DD1A1",fontFamily:"'Barlow Condensed',sans-serif",lineHeight:1.1}}>+{Math.round(totalBonus*100)}%</div>
                </div>
              </div>
            );
          })()}
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
                {label:lang==="ko"?"⭐ 놀이기구 점수":"⭐ Attraction", val:visitorFactors.attraction, unit:"pts"},
                {label:lang==="ko"?"🌱 기본 예상":"🌱 Base Estimate", val:visitorFactors.baseVis, unit:"명", highlight:true},
                {label:lang==="ko"?"☀️ 날씨 보정":"☀️ Weather", val:`×${visitorFactors.weatherMult}`, unit:""},
                {label:lang==="ko"?"📅 계절 보정":"📅 Season", val:`×${visitorFactors.seasonMult}`, unit:""},
                {label:lang==="ko"?"😊 만족도":"😊 Happiness", val:`×${visitorFactors.satMult}`, unit:""},
                {label:lang==="ko"?"💸 요금 효율":"💸 Fee Eff.", val:`×${visitorFactors.feeMult}`, unit:""},
                ...(visitorFactors.campBoost>0?[{label:lang==="ko"?"📣 캠페인":"📣 Campaign", val:`+${visitorFactors.campBoost}%`, unit:""}]:[]),
                ...(visitorFactors.openingBonus?[{label:lang==="ko"?"🎉 오픈 보너스":"🎉 Opening Buzz", val:`×${visitorFactors.openingBonus}`, unit:"", highlight:true}]:[]),
              ].map(({label,val,unit,highlight})=>(
                <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"2px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                  <span style={{fontSize:9,color:"#9BA8CC"}}>{label}</span>
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
      </div>}

      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        {isMobile && bottomSheetOpen && (
          <div onClick={() => setBottomSheetOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:190}} />
        )}
        <div className="side-panel" style={
          isMobile?(bottomSheetOpen?{position:"fixed",left:0,right:0,bottom:56,height:"62vh",background:"linear-gradient(180deg,#0C1030 0%,#08091E 100%)",borderTop:"2px solid rgba(120,140,255,0.25)",borderRadius:"16px 16px 0 0",zIndex:200,display:"flex",flexDirection:"column",animation:"sheet-up 0.28s cubic-bezier(0.32,0.72,0,1)",boxShadow:"0 -8px 40px rgba(0,0,0,0.7)",overflow:"hidden"}:{display:"none"}):
          isPC?{width:216,minWidth:216,overflow:"hidden",background:"linear-gradient(180deg,#090C20 0%,#070919 100%)",borderRight:"1px solid rgba(100,120,255,0.10)",display:"flex",flexDirection:"column",flexShrink:0}:
          {width:panelCollapsed?0:190,minWidth:panelCollapsed?0:190,overflow:panelCollapsed?"hidden":"visible",transition:"width 0.2s",background:"linear-gradient(180deg,#090C20 0%,#070919 100%)",borderRight:"1px solid rgba(100,120,255,0.10)",boxShadow:"4px 0 20px rgba(0,0,0,0.3)",display:"flex",flexDirection:"column",flexShrink:0}
        }>
          {/* Mobile: drag handle + close button */}
          {isMobile&&(
            <div onClick={()=>setBottomSheetOpen(false)} style={{display:"flex",justifyContent:"center",alignItems:"center",padding:"8px 0 4px",flexShrink:0,cursor:"pointer",position:"relative"}}>
              <div style={{width:36,height:4,background:"rgba(255,255,255,0.15)",borderRadius:99}}/>
              <button onClick={(e)=>{e.stopPropagation();setBottomSheetOpen(false);}} style={{position:"absolute",right:12,background:"none",border:"none",color:"#445580",cursor:"pointer",fontSize:18,padding:"4px 8px",lineHeight:1}}>✕</button>
            </div>
          )}
          <div style={{display:"flex",background:"rgba(0,0,0,0.3)",borderBottom:"1px solid rgba(255,255,255,0.06)",flexShrink:0,flexWrap:"wrap"}}>
            {[
              {k:"build",    ic:"🏗️", label:{ko:"건설",en:"Build"}},
              {k:"manage",   ic:"⚙️", label:{ko:"경영",en:"Mgmt"}},
              {k:"finance",  ic:"💰", label:{ko:"재무",en:"Fin"}},
              {k:"marketing",ic:"📣", label:{ko:"마케팅",en:"Mkt"}},
              {k:"research", ic:"🔬", label:{ko:"연구",en:"R&D"}},
              {k:"mission",  ic:"🎯", label:{ko:"미션",en:"Quest"}},
            ].map(({k,ic,label})=>{
                const isTutTab=(tutorialStep===5&&k==="manage")||(tutorialStep===6&&k==="finance")||(tutorialStep===7&&k==="marketing")||(tutorialStep===8&&k==="build")||(tutorialStep===9&&k==="research");
                return(
                <button key={k} style={{flex:"1 1 30%",minWidth:0,padding:"5px 2px",background:tab===k?"rgba(255,255,255,0.08)":isTutTab?"rgba(255,217,61,0.08)":"transparent",border:"none",borderBottom:`2px solid ${tab===k?sc:isTutTab?"#FFD93D":"transparent"}`,color:tab===k?sc:isTutTab?"#FFD93D":"#3A4A70",cursor:"pointer",fontFamily:"inherit",fontWeight:tab===k||isTutTab?700:400,transition:"all 0.15s",position:"relative",display:"flex",flexDirection:"column",alignItems:"center",gap:1,animation:isTutTab?"pulse 1.5s infinite":"none",boxShadow:isTutTab?"0 0 10px rgba(255,217,61,0.3)":"none"}} onClick={()=>setTab(k)}>
                  <span style={{fontSize:13}}>{ic}</span>
                  <span style={{fontSize:9,lineHeight:1}}>{label[lang]||label.ko}</span>
                  {k==="research"&&hasResearchAvailable&&!isTutTab&&<div style={{position:"absolute",top:2,right:4,width:6,height:6,borderRadius:"50%",background:"#00E5A0",boxShadow:"0 0 4px #00E5A0"}}/>}
                  {isTutTab&&<div style={{position:"absolute",top:2,right:4,width:8,height:8,borderRadius:"50%",background:"#FFD93D",boxShadow:"0 0 6px #FFD93D",animation:"pulse 1s infinite"}}/>}
                </button>);
            })}
          </div>

          <div style={{flex:1,overflowY:"auto",padding:"5px 7px"}}>

            {tab==="build"&&<>
              <div style={{display:"flex",gap:2,marginBottom:4}}>
                {[["build","🏗️","tab.build"],["zone","🎨","zone"],["demolish","🔨","demolish"],["map","🗺️","map"]].map(([m,ic,lk])=>{
                  const label=lk==="tab.build"?t("tab.build"):lk==="zone"?(lang==="ko"?"구역":"Zone"):lk==="demolish"?(lang==="ko"?"철거":"Demo"):t("map.land");
                  const active=buildMode===m;
                  const col=m==="demolish"?"#FF6B6B":sc;
                  const isZoneTut=tutorialStep===8&&m==="zone";
                  return(<button key={m} style={{flex:1,padding:"3px 0",background:active?(m==="demolish"?"#FF6B6B18":"#1E1E40"):isZoneTut?"rgba(255,217,61,0.10)":"#181830",border:`1px solid ${active?col:isZoneTut?"#FFD93D":"#2A2A4A"}`,color:active?col:isZoneTut?"#FFD93D":"#6666AA",borderRadius:4,cursor:"pointer",fontSize:10,fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:1,animation:isZoneTut?"pulse 1.5s infinite":"none",boxShadow:isZoneTut?"0 0 8px rgba(255,217,61,0.4)":"none"}} onClick={()=>{setBuildMode(m);setSelected(null);if(m!=="zone")setZonePaint(null);setMultiSelectedCells(new Set());if(m==="zone"&&!zoneFtueShown){setZoneFtueShown(true);setShowZoneFtue(true);}}}>
                    <span style={{fontSize:11}}>{ic}</span>
                    <span>{label}</span>
                  </button>);
                })}
              </div>

              {buildMode==="build"&&day>1&&(()=>{
                const issues=[];
                if(stats.isolatedCount>0) issues.push({sev:"red",msg:lang==="ko"?`경로 미연결 건물 ${stats.isolatedCount}개 — 통로로 연결하세요`:`${stats.isolatedCount} building(s) not path-connected`});
                const feeMax=gameMode==="sandbox"?999:(MAX_FEE_BY_STARS[parkRating.stars]+(startPerk==="premiumGate"?10:0));
                if(fee>feeMax) issues.push({sev:"yellow",msg:lang==="ko"?`입장료($${fee})가 ${parkRating.stars}성 한도($${feeMax}) 초과`:`Admission $${fee} exceeds ${parkRating.stars}★ cap ($${feeMax})`});
                const hasRestroom=grid.flat().some(c=>c&&c.type==="restroom");
                if(!hasRestroom&&(segData.family||0)>0.2) issues.push({sev:"yellow",msg:lang==="ko"?"화장실 없음 — 가족 방문객 만족도 페널티":"No restroom — family satisfaction penalty"});
                if(stats.brokenCount>2) issues.push({sev:"yellow",msg:lang==="ko"?`고장 ${stats.brokenCount}개 — 정비공 필요`:`${stats.brokenCount} broken — hire mechanic`});
                if(clean<35&&visitors>10) issues.push({sev:"red",msg:lang==="ko"?"청결도 위험 — 방문객 만족도 급감":"Critical cleanliness — satisfaction dropping"});
                if(stats.attraction<5&&day>3) issues.push({sev:"red",msg:lang==="ko"?"놀이기구 부족 — 방문객 없음":"Need attractions — no visitors"});
                const top=issues.slice(0,3);
                if(!top.length) return null;
                return(<div style={{marginBottom:6,borderRadius:6,overflow:"hidden",border:"1px solid rgba(255,159,67,0.2)"}}>
                  <div style={{background:"rgba(255,159,67,0.08)",padding:"3px 7px",fontSize:9,color:"#FF9F43",letterSpacing:2,fontWeight:700}}>⚠️ {lang==="ko"?"현재 문제":"ISSUES"} ({top.length})</div>
                  {top.map((iss,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 7px",background:i%2===0?"rgba(0,0,0,0.15)":"transparent",borderTop:"1px solid rgba(255,255,255,0.03)"}}>
                      <span style={{fontSize:8,flexShrink:0,color:iss.sev==="red"?"#FF5757":"#FECA57"}}>{iss.sev==="red"?"🔴":"🟡"}</span>
                      <span style={{fontSize:9,color:"#AABBCC",lineHeight:1.4}}>{iss.msg}</span>
                    </div>
                  ))}
                </div>);
              })()}

              {buildMode==="demolish"&&<div style={{padding:"6px 5px",background:"#FF6B6B0D",border:"1px solid #FF6B6B33",borderRadius:5,marginBottom:4,textAlign:"center"}}>
                <div style={{fontSize:13,marginBottom:2}}>🔨</div>
                <div style={{fontSize:10,color:"#FF6B6B",fontWeight:700}}>{lang==="ko"?"철거 모드":"Demolish Mode"}</div>
                <div style={{fontSize:10,color:"#FF8888",marginTop:2}}>{lang==="ko"?"건물 클릭 → 선택, 다중 선택 가능":"Click to select, multi-select allowed"}</div>
                {lastDemolishGrid&&<button style={{marginTop:4,width:"100%",padding:"5px 0",background:"rgba(100,120,255,0.12)",border:"1px solid rgba(100,120,255,0.4)",color:"#9B9FFF",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"inherit"}} onClick={undoDemolish}>↩️ {lang==="ko"?"철거 취소":"Undo Demolish"}</button>}
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
                {lastBuildGrid&&<button style={{marginBottom:4,width:"100%",padding:"5px 0",background:"rgba(100,120,255,0.12)",border:"1px solid rgba(100,120,255,0.4)",color:"#9B9FFF",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"inherit"}} onClick={undoBuild}>↩️ {lang==="ko"?"건설 취소 (30초)":"Undo Build (30s)"}</button>}
                {selected?<div style={{display:"flex",gap:2,marginBottom:3}}>
                  <button style={{flex:1,background:"#FF6B6B0E",border:"1px solid #FF6B6B44",color:"#FF6B6B",borderRadius:4,padding:3,cursor:"pointer",fontSize:10,fontFamily:"inherit"}} onClick={()=>setSelected(null)}>{t("bld.cancel", { name: t(`b.${selected}`) })}</button>
                </div>:<div style={{display:"flex",flexDirection:"column",gap:2,marginBottom:3}}>
                  <div style={{fontSize:10,color:"#3A4488",textAlign:"center",padding:"2px",background:"#14142A",borderRadius:3}}>{t("bld.hint")}</div>
                  {lastBuilt&&<div style={{fontSize:9,color:"#556688",textAlign:"center",padding:"2px 4px",background:"#0E0E1E",borderRadius:3,cursor:"pointer"}} onClick={()=>{setSelected(lastBuilt);setBuildMode("build");}} title={lang==="ko"?"R키로도 선택 가능":"Also press R to re-select"}>⟳ R — {t(`b.${lastBuilt}`)}</div>}
                </div>}
                {/* 클릭된 건물 패널을 목록 상단에 표시 */}
                {!selected&&clickedTile?.cell&&(()=>{
                  const{r,c,cell}=clickedTile;
                  const bd=B[cell.type];
                  const st=bd.stats(cell.level);
                  const upCost=cell.level<2?bd.upgradeCost[cell.level]:null;
                  const nextSt=cell.level<2?bd.stats(cell.level+1):null;
                  const attrDelta=nextSt?Math.round(nextSt.attraction-st.attraction):0;
                  const maintDelta=nextSt?Math.round(nextSt.maintenance-st.maintenance):0;
                  const capDelta=nextSt&&nextSt.cap>0?(nextSt.cap-st.cap):0;
                  const rpc=Math.max(500,Math.floor(bd.baseCost*0.15));
                  const anyPaths2=grid.some(r=>r.some(c=>c?.type==="_path"||c?.type==="_pathFancy"));
                  const reach3=anyPaths2?getReachablePaths(grid):new Set();
                  const ok3=bd.cat==="path"||bd.cat==="deco"||!anyPaths2||hasPath(reach3,r,c);
                  return(<div style={{marginBottom:8,padding:10,background:`linear-gradient(135deg,${bd.color}0A,rgba(255,255,255,0.02))`,border:`2px solid ${cell.broken?"rgba(255,87,87,0.4)":bd.color+"66"}`,borderRadius:10,boxShadow:`0 2px 12px ${cell.broken?"rgba(255,87,87,0.2)":bd.color+"22"}`}}>
                    {cell.broken&&<div style={{fontSize:10,color:"#FF5757",marginBottom:4,fontWeight:600}}>🔧 {lang==="ko"?"수리비":"Repair"}: ${rpc.toLocaleString()}</div>}
                    {!ok3&&!cell.broken&&<div style={{fontSize:10,color:"#FF9F43",marginBottom:3,background:"rgba(255,159,67,0.08)",borderRadius:3,padding:"2px 5px"}}>{t("bld.pathNote")}</div>}
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                      <div style={{width:32,height:32,borderRadius:8,background:`${bd.color}22`,border:`1px solid ${bd.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,filter:cell.broken?"grayscale(1) opacity(0.4)":"none"}}>{bd.emoji}</div>
                      <div>
                        <div style={{fontSize:11,fontWeight:800,color:"var(--text-primary)"}}>{t(`b.${cell.type}`)}</div>
                        <div style={{display:"inline-block",fontSize:10,padding:"1px 6px",background:`${bd.color}22`,border:`1px solid ${bd.color}55`,borderRadius:4,color:bd.color,fontWeight:700,marginTop:1}}>Lv{cell.level+1}</div>
                      </div>
                      <button style={{marginLeft:"auto",fontSize:10,color:"#7788BB",background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}} onClick={()=>setClickedTile(null)}>✕</button>
                    </div>
                    <div style={{fontSize:10,color:"#6B7CA1",marginBottom:4}}>
                      ⭐{Math.round(st.attraction)}{st.maintenance>0&&<> · 💰-${Math.round(st.maintenance)}</>}{st.cap>0&&<> · 👥{st.cap}</>}
                    </div>
                    {/* 2-1: 일 수익 예상 */}
                    {(()=>{
                      const zone2=zoneGrid[r]?.[c];
                      const zm2=zone2?zoneMastery[zone2]:null;
                      const zoneMult=zm2?.mastered?1+zm2.bonus:1;
                      const admEst=pricingMode!=="per_ride"&&cell.type==="entrance"?Math.round(visitors*fee):0;
                      const shopEst=st.rpv>0?Math.round(visitors*st.rpv*zoneMult):0;
                      const rideTicket=pricingMode==="per_ride"&&bd.cat==="ride"&&cell.type!=="entrance"?(ridePrices[cell.type]??DEFAULT_RIDE_PRICES[cell.type]??5):0;
                      if(!admEst&&!shopEst&&!rideTicket) return null;
                      return(
                        <div style={{fontSize:10,color:"#5EF6A0",marginBottom:6,background:"rgba(94,246,160,0.06)",border:"1px solid rgba(94,246,160,0.15)",borderRadius:4,padding:"3px 7px",display:"flex",gap:8,alignItems:"center"}}>
                          <span>💵</span>
                          {admEst>0&&<span>~${admEst.toLocaleString()}/{lang==="ko"?"일":"day"}</span>}
                          {shopEst>0&&<span>~${shopEst.toLocaleString()}/{lang==="ko"?"일":"day"}{zm2?.mastered&&<span style={{color:"#FECA57",marginLeft:3}}>⚡+{Math.round(zm2.bonus*100)}%</span>}</span>}
                          {rideTicket>0&&<span>🎟️ ${rideTicket}/{lang==="ko"?"인":"pp"}</span>}
                        </div>
                      );
                    })()}
                    {upCost&&nextSt&&<div style={{display:"flex",gap:6,marginBottom:3,padding:"3px 6px",background:"rgba(255,255,255,0.03)",borderRadius:4,fontSize:10,color:"#6B7CA1"}}>
                      <span style={{color:"#AABBFF"}}>Lv{cell.level+2}:</span>
                      {attrDelta>0&&<span>⭐+{attrDelta}</span>}
                      {maintDelta>0&&<span style={{color:"#FF9F43"}}>💰+${maintDelta}</span>}
                      {capDelta>0&&<span>👥+{capDelta}</span>}
                      {nextSt.rpv>st.rpv&&<span style={{color:"#5EF6A0"}}>💵+{Math.round(nextSt.rpv-st.rpv)}</span>}
                    </div>}
                    <div style={{display:"flex",gap:3}}>
                      {cell.broken
                        ?<button style={{flex:2,padding:"5px 0",background:money>=rpc?"rgba(255,159,67,0.15)":"transparent",border:`1px solid ${money>=rpc?"rgba(255,159,67,0.6)":"rgba(255,255,255,0.08)"}`,color:money>=rpc?"#FF9F43":"#7788BB",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"inherit"}} onClick={repairBuilding}>{t("bld.repair",{cost:`$${rpc.toLocaleString()}`})}</button>
                        :cell.level<2&&upCost>0
                        ?<button style={{flex:2,padding:"5px 0",background:money>=upCost?`${bd.color}22`:"transparent",border:`1px solid ${money>=upCost?bd.color+"77":"rgba(255,255,255,0.08)"}`,color:money>=upCost?bd.color:"#7788BB",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"inherit"}} onClick={upgradeBuilding}>{t("bld.upgrade",{cost:`$${upCost.toLocaleString()}`})}</button>
                        :<div style={{flex:2,fontSize:10,color:"#00E5A0",fontWeight:700,display:"flex",alignItems:"center"}}>✅ {t("bld.max")}</div>}
                      <button style={{flex:1,padding:"5px 0",background:"rgba(255,87,87,0.1)",border:"1px solid rgba(255,87,87,0.4)",color:"#FF5757",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"inherit"}} onClick={demolish}>🔨</button>
                    </div>
                  </div>);
                })()}
                {/* Building search */}
                <input
                  type="text"
                  placeholder={lang==="ko"?"건물 검색...":"Search buildings..."}
                  value={buildSearch}
                  onChange={e=>setBuildSearch(e.target.value)}
                  style={{width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:5,padding:"4px 8px",color:"#DDE2FF",fontSize:11,fontFamily:"inherit",outline:"none",marginBottom:6}}
                />
                {/* 카테고리 필터 바 */}
                <div style={{display:"flex",gap:2,marginBottom:6,background:"rgba(0,0,0,0.3)",borderRadius:6,padding:3}}>
                  <button onClick={()=>setBuildCatFilter(null)}
                    style={{flex:1,background:!buildCatFilter?"rgba(255,217,61,0.15)":"rgba(255,255,255,0.04)",border:`1px solid ${!buildCatFilter?"rgba(255,217,61,0.5)":"rgba(255,255,255,0.08)"}`,borderRadius:4,padding:"3px 2px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:1,fontFamily:"inherit",transition:"all 0.15s",boxShadow:!buildCatFilter?"0 0 6px rgba(255,217,61,0.3)":"none"}}>
                    <span style={{fontSize:12}}>🔍</span>
                    <span style={{fontSize:7,color:!buildCatFilter?"#FFD93D":"#5566AA",letterSpacing:0.5,fontWeight:!buildCatFilter?700:400}}>{lang==="ko"?"전체":"All"}</span>
                  </button>
                  {[["🎠","ride",t("cat.ride")],["🍔","shop",t("cat.shop")],["🌿","facility",t("cat.facility")],["🛤️","path",t("cat.path")],["🌸","deco",t("cat.deco")]].map(([ic,cat,lbl])=>{
                    const active=buildCatFilter===cat;
                    return(
                      <button key={cat} title={lbl} onClick={()=>setBuildCatFilter(buildCatFilter===cat?null:cat)}
                        style={{flex:1,background:active?"rgba(255,217,61,0.15)":"rgba(255,255,255,0.04)",border:`1px solid ${active?"rgba(255,217,61,0.5)":"rgba(255,255,255,0.08)"}`,borderRadius:4,padding:"3px 2px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:1,fontFamily:"inherit",transition:"all 0.15s",boxShadow:active?"0 0 6px rgba(255,217,61,0.3)":"none"}}>
                        <span style={{fontSize:13}}>{ic}</span>
                        <span style={{fontSize:7,color:active?"#FFD93D":"#5566AA",letterSpacing:0.5,fontWeight:active?700:400}}>{lbl.replace(/^[^\s]+ /,"").slice(0,4)}</span>
                      </button>
                    );
                  })}
                </div>
                {[[t("cat.ride"),"ride",rideList],[t("cat.shop"),"shop",shopList],[t("cat.facility"),"facility",facilList],[t("cat.path"),"path",pathList],[t("cat.deco"),"deco",decoList]].map(([lbl,cat,list])=>{
                  if(buildCatFilter&&buildCatFilter!==cat) return null;
                  const filteredList=buildSearch.trim()?list.filter(([id])=>{const name=t(`b.${id}`)||id;return name.toLowerCase().includes(buildSearch.toLowerCase())||id.toLowerCase().includes(buildSearch.toLowerCase());}):list;
                  if(filteredList.length===0) return null;
                  return(
                  <div key={lbl} data-cat={cat}>
                    <div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#7788BB",margin:"8px 0 4px",paddingLeft:4,borderLeft:"2px solid rgba(255,255,255,0.15)"}}>{lbl}</div>
                    {filteredList.map(([id,bd])=>{
                      const isBanned=currentScenarioData?.bannedBuildings?.includes(id)||weeklyChallengeMod?.bannedBuildings?.includes(id);
                      const isLocked=(bd.locked&&!researched.includes("r4")&&gameMode!=="sandbox")||isBanned;
                      const ok=money>=bd.baseCost&&!isLocked,sel=selected===id;
                      const isBldHov=hovered===id;
                      const isTutTarget=(tutorialStep===1&&id==="entrance")||
                                        (tutorialStep===2&&(id==="_path"||id==="_pathFancy"))||
                                        (tutorialStep===3&&["ferrisWheel","carousel","thrillRide","miniTrain"].includes(id));
                      const baseShadow=sel?`0 0 12px ${bd.color}22, inset 0 0 12px ${bd.color}08`:"none";
                      const segPull=SEG_PULL[id];
                      const segScore=segPull&&visitors>0?Math.max(1,Math.min(5,Math.round(Object.entries(segPull).reduce((s,[k,w])=>s+w*(segData[k]||0),0)/2.5*4)+1)):null;
                      return(<div key={id} onMouseEnter={()=>setHovered(id)} onMouseLeave={()=>setHovered(null)}>
                        <div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 8px",marginBottom:isBldHov?0:2,background:sel?`${bd.color}18`:"rgba(255,255,255,0.03)",border:sel?`1px solid ${bd.color}88`:`1px solid ${bd.color}22`,borderLeft:sel?`3px solid ${bd.color}`:`3px solid ${bd.color}66`,borderRadius:isBldHov?"6px 6px 0 0":6,cursor:ok?"pointer":isLocked?"not-allowed":"default",opacity:isLocked?0.35:ok?1:0.35,transition:"all 0.12s",outline:isTutTarget?"2px solid #FFD93D":"none",outlineOffset:isTutTarget?2:0,animation:isTutTarget?"pulse 1.5s infinite":"none",boxShadow:isTutTarget?`0 0 20px rgba(255,217,61,0.6), ${baseShadow}`:baseShadow}} onClick={()=>ok&&setSelected(sel?null:id)}>
                          <div style={{width:28,height:28,borderRadius:6,background:`${bd.color}18`,border:`1px solid ${bd.color}33`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,overflow:"hidden"}}>
                            {hasBuildingIcon(id)
                              ? getBuildingIcon(id, bd.color, 22)
                              : <span style={{fontSize:15}}>{bd.emoji}</span>}
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:10,fontWeight:700,color:"var(--text-primary)",lineHeight:1.2}}>{t(`b.${id}`)}{isBanned?" 🚫":isLocked?" 🔒":""}</div>
                            <div style={{display:"flex",alignItems:"center",gap:4}}>
                              <div style={{fontSize:10,fontWeight:600,color:money>=bd.baseCost?"#FFD93D":"#FF5757",fontFamily:"'Barlow Condensed',monospace"}}>{bd.baseCost===0?t("bld.free"):`$${bd.baseCost.toLocaleString()}`}</div>
                              {segScore&&<div style={{fontSize:8,color:"#FECA57",letterSpacing:0.5,lineHeight:1}}>{'★'.repeat(segScore)+'☆'.repeat(5-segScore)}</div>}
                            </div>
                            {bd.stats(0).attraction>0&&<div style={{fontSize:8,color:"#4D9FFF88",lineHeight:1}}>👥 ~+{Math.round(bd.stats(0).attraction*0.8)}{lang==="ko"?"명":"vis"}</div>}
                          </div>
                          {bd.stats(0).attraction>0&&<span style={{fontSize:10,padding:"1px 5px",background:"rgba(255,217,61,0.12)",border:"1px solid rgba(255,217,61,0.3)",borderRadius:4,color:"#FFD93D",fontWeight:700,fontFamily:"'Barlow Condensed',monospace",flexShrink:0}}>⭐{bd.stats(0).attraction}</span>}
                        </div>
                        {isBldHov&&<div style={{background:"#1A1A3A",borderRadius:"0 0 5px 5px",padding:"4px 6px",marginBottom:2,fontSize:10,color:"#C7B8EA",lineHeight:1.6,border:`1px solid ${bd.color}22`,borderTop:"none"}}>
                          {isLocked&&<div style={{color:"#FF9F43",fontWeight:700,marginBottom:2}}>🔒 {lang==="ko"?"연구 탭 → VIP 언락 (r4) 필요":"Research tab → VIP Unlock (r4) required"}</div>}
                          {bd.flavor&&<div style={{color:"#A29BFE",fontStyle:"italic",marginBottom:3,fontSize:9}}>✨ {bd.flavor[lang]||bd.flavor.ko}</div>}
                          {bd.personality&&<div style={{display:"flex",gap:4,marginBottom:3,flexWrap:"wrap"}}>
                            <span style={{fontSize:8,background:"rgba(255,107,157,0.15)",border:"1px solid rgba(255,107,157,0.35)",borderRadius:4,padding:"1px 5px",color:"#FF6B9D"}}>💥{"★".repeat(bd.personality.exc)}{"☆".repeat(5-bd.personality.exc)}</span>
                            <span style={{fontSize:8,background:"rgba(95,39,205,0.15)",border:"1px solid rgba(95,39,205,0.35)",borderRadius:4,padding:"1px 5px",color:"#A29BFE"}}>👻{"★".repeat(bd.personality.fear)}{"☆".repeat(5-bd.personality.fear)}</span>
                            <span style={{fontSize:8,background:"rgba(255,159,67,0.15)",border:"1px solid rgba(255,159,67,0.35)",borderRadius:4,padding:"1px 5px",color:"#FF9F43"}}>👨‍👩‍👧{"★".repeat(bd.personality.fam)}{"☆".repeat(5-bd.personality.fam)}</span>
                            <span style={{fontSize:8,background:"rgba(100,181,246,0.12)",border:"1px solid rgba(100,181,246,0.3)",borderRadius:4,padding:"1px 5px",color:"#64B5F6"}}>🎯 {bd.personality.who[lang]||bd.personality.who.ko}</span>
                          </div>}
                          {bd.stats(0).attraction>0&&<div>⭐ {lang==="ko"?"놀이기구":"Attraction"} +{bd.stats(0).attraction}</div>}
                          {bd.stats(0).maintenance>0&&<div>🔧 {lang==="ko"?"유지비":"Upkeep"} ${bd.stats(0).maintenance}/{lang==="ko"?"일":"day"}</div>}
                          {bd.stats(0).satBonus>0&&<div>😊 {lang==="ko"?"만족도":"Happiness"} +{bd.stats(0).satBonus}</div>}
                          {bd.stats(0).rpv>0&&<div>💰 {lang==="ko"?"수익/방문객":"Rev/visitor"} +{bd.stats(0).rpv}</div>}
                          {bd.stats(0).cap>0&&<div>👥 {lang==="ko"?"수용인원":"Capacity"} +{bd.stats(0).cap}</div>}
                        </div>}
                      </div>);
                    })}
                  </div>
                );})}
                {clickedTile?.cell&&(()=>{
                  const{r,c,cell}=clickedTile;
                  const bd=B[cell.type];
                  const st=bd.stats(cell.level);
                  const upCost=cell.level<2?bd.upgradeCost[cell.level]:null;
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
                      {cell.broken?<button style={{flex:2,padding:"5px 0",background:money>=rpc?`linear-gradient(135deg,rgba(255,159,67,0.15),rgba(255,159,67,0.05))`:"transparent",border:`1px solid ${money>=rpc?"rgba(255,159,67,0.5)":"rgba(255,255,255,0.08)"}`,color:money>=rpc?"#FF9F43":"#7788BB",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"inherit"}} onClick={repairBuilding}>{t("bld.repair", { cost: `$${rpc.toLocaleString()}` })}</button>
                      :cell.level<2&&upCost>0?<button style={{flex:2,padding:"5px 0",background:money>=upCost?`linear-gradient(135deg,${bd.color}22,${bd.color}0A)`:"transparent",border:`1px solid ${money>=upCost?bd.color+"66":"rgba(255,255,255,0.08)"}`,color:money>=upCost?bd.color:"#7788BB",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"inherit",boxShadow:money>=upCost?`0 2px 8px ${bd.color}22`:"none"}} onClick={upgradeBuilding}>{t("bld.upgrade", { cost: `$${upCost.toLocaleString()}` })}</button>
                      :<div style={{flex:2,fontSize:10,color:"#00E5A0",display:"flex",alignItems:"center",fontWeight:700}}>{t("bld.max")}</div>}
                      <button style={{flex:1,padding:"5px 0",background:"rgba(255,87,87,0.08)",border:"1px solid rgba(255,87,87,0.3)",color:"#FF5757",borderRadius:6,cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"inherit"}} onClick={demolish}>{t("bld.demolish").split(" ")[0]}</button>
                    </div>
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
                {currentScenarioData?.noParcels&&<div style={{background:"rgba(255,87,87,0.10)",border:"1px solid rgba(255,87,87,0.35)",borderRadius:5,padding:"5px 8px",marginBottom:6,fontSize:10,color:"#FF8888",fontWeight:700}}>🚫 {lang==="ko"?"이 시나리오: 토지 매입 불가":"This scenario: no land purchase"}</div>}
                {PARCELS.map(p=>{const owned=parcels.includes(p.id),reqOk=!p.req||parcels.includes(p.req);return(<div key={p.id} style={{display:"flex",alignItems:"center",gap:4,padding:5,marginBottom:3,background:"#181828",border:`1px solid ${owned?"#A29BFE33":"#222238"}`,borderRadius:5,opacity:owned?0.5:1}}>
                  <div style={{fontSize:18}}>{owned?"✅":p.icon}</div>
                  <div style={{flex:1}}><div style={{fontSize:10,fontWeight:700}}>{p.label?.[lang]||p.label?.ko||p.label}</div><div style={{fontSize:10,color:"#8888AA"}}>${p.cost.toLocaleString()}</div></div>
                  {!owned&&<button style={{background:reqOk&&money>=p.cost?"#A29BFE11":"transparent",border:`1px solid ${reqOk&&money>=p.cost?"#A29BFE":"#2A2A4A"}`,color:reqOk&&money>=p.cost?"#A29BFE":"#3A3A5A",borderRadius:4,padding:"3px 5px",cursor:reqOk&&money>=p.cost?"pointer":"default",fontSize:10,fontFamily:"inherit"}} onClick={()=>buyParcel(p)}>{t("map.buy")}</button>}
                </div>);})}
              </>}
            </>}

            {tab==="manage"&&<>
              {!dismissedHints.includes("tab_manage")&&<div style={{background:"rgba(0,229,160,0.06)",border:"1px solid rgba(0,229,160,0.3)",borderRadius:7,padding:"7px 10px",marginBottom:6,display:"flex",gap:8,alignItems:"flex-start",animation:"slide-in 0.2s ease"}}>
                <span style={{fontSize:14,flexShrink:0}}>🧹</span>
                <div style={{flex:1,fontSize:10,color:"#00E5A0",lineHeight:1.6}}>{lang==="ko"?"직원 고용으로 청결도·만족도를 올리세요. 청소부→청결도, 정비공→고장예방, 퍼포머→방문객 보너스":"Hire staff to boost cleanliness & satisfaction. Janitor→cleanliness, Mechanic→prevent breakdowns, Entertainer→visitor bonus"}</div>
                <button style={{background:"none",border:"none",color:"#7788BB",cursor:"pointer",fontSize:12,flexShrink:0}} onClick={()=>{const nd=[...dismissedHints,"tab_manage"];setDismissedHints(nd);try{localStorage.setItem('dismissedHints',JSON.stringify(nd));}catch{}}}>✕</button>
              </div>}
              <div style={{background:"#0C1128",border:"1px solid #FFD93D33",borderRadius:8,padding:8,marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#FFD93D"}}>😊 {lang==="ko"?"만족도 분석":"Satisfaction Analysis"}</div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{fontSize:18,fontWeight:900,color:sat>=70?"#00E5A0":sat>=45?"#FFD93D":"#FF5757",lineHeight:1}}>{Math.round(sat)}%</div>
                    <span style={{fontSize:12,color:satTrendColor,fontWeight:700}}>{satTrend}</span>
                  </div>
                </div>
                <div style={{height:6,background:"#1A1A30",borderRadius:99,overflow:"hidden",marginBottom:6}}>
                  <div style={{height:"100%",width:`${Math.min(100,sat)}%`,borderRadius:99,transition:"width 0.5s",background:sat>=70?"linear-gradient(90deg,#00E5A0,#5EF6A0)":sat>=45?"linear-gradient(90deg,#FFD93D,#FECA57)":"linear-gradient(90deg,#FF5757,#FF8888)"}}/>
                </div>
                {satFactors.filter(f=>f.val!==0).map(({label,val})=>(
                  <div key={label} style={{display:"flex",alignItems:"center",gap:4,fontSize:9,padding:"2px 0",borderBottom:"1px solid #1A1A3088"}}>
                    <span style={{color:"#8888AA",flex:1}}>{label}</span>
                    <div style={{height:4,width:Math.max(2,Math.min(40,Math.abs(val)*4)),borderRadius:99,background:val>0?"#00E5A088":"#FF575788",flexShrink:0}}/>
                    <span style={{color:val>0?"#00E5A0":"#FF5757",fontWeight:700,minWidth:24,textAlign:"right"}}>{val>0?"+":""}{Math.round(val)}</span>
                  </div>
                ))}
                {satFactors.every(f=>f.val>=0)&&sat<50&&<div style={{fontSize:9,color:"#FF9F4388",marginTop:3,textAlign:"center"}}>⚠️ {lang==="ko"?"자연 감소보다 보너스가 부족합니다":"Bonuses not outpacing natural decay"}</div>}
              </div>
              <div style={{background:"#0C1128",border:"1px solid #A29BFE33",borderRadius:8,padding:8,marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#A29BFE"}}>👥 {lang==="ko"?"방문객 분석":"Visitor Profile"}</div>
                  {revPerVis&&<div style={{fontSize:9,color:"#FECA57",fontWeight:700}}>💵 ${revPerVis}/{lang==="ko"?"명":"vis"}</div>}
                </div>
                <div style={{display:"flex",height:6,borderRadius:99,overflow:"hidden",marginBottom:5,gap:1}}>
                  {segEntries.map(([k,s])=>{const w=(segs[k]||0)/totalSegW*100;return w>0?<div key={k} style={{width:`${w}%`,background:s.color,opacity:0.85}}/>:null;})}
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:"2px 8px"}}>
                  {segEntries.map(([k,s])=>{const pct=Math.round((segs[k]||0)/totalSegW*100);return pct>0?(<div key={k} style={{display:"flex",alignItems:"center",gap:2,fontSize:9}}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:s.color,flexShrink:0}}/>
                    <span style={{color:"#8899BB"}}>{s.emoji} {pct}%</span>
                  </div>):null;})}
                </div>
                {varietyWarn&&<div style={{marginTop:5,fontSize:9,color:"#FF9F43",background:"rgba(255,159,67,0.08)",borderRadius:4,padding:"3px 6px"}}>
                  ⚠️ {lang==="ko"?`"${dominantPersonality[0][0]}" 유형 집중 — 다른 성격의 놀이기구 추가로 방문객 다양화 권장`:`"${dominantPersonality[0][0]}" type dominant — add different personality rides to diversify visitors`}
                </div>}
              </div>
              {tutorialStep===6&&!tutTabVisited&&(
                <div style={{background:"rgba(255,217,61,0.10)",border:"2px solid rgba(255,217,61,0.5)",borderRadius:7,padding:"6px 10px",marginBottom:6,display:"flex",gap:8,alignItems:"center",animation:"pulse 2s infinite"}}>
                  <span style={{fontSize:16}}>👆</span>
                  <div style={{fontSize:10,color:"#FFD93D",fontWeight:700,lineHeight:1.5}}>{lang==="ko"?"아래 ＋ 버튼을 눌러 입장료를 올려보세요!\n입장료 전략이 수익에 직결됩니다.":"Press ＋ to raise the admission fee!\nPricing strategy directly impacts profit."}</div>
                </div>
              )}
              <div style={{background:"#1A1A2A",border:`${tutorialStep===6?"2px solid #FFD93D88":"1px solid #FECA5733"}`,borderRadius:6,padding:8,marginBottom:7,boxShadow:tutorialStep===6?"0 0 12px rgba(255,217,61,0.25)":"none",transition:"all 0.3s"}}>
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
              {(()=>{const totalMaint=Math.round(stats.maintenance*diffSettings.maintenanceMult);const totalExpenses=totalMaint+wages;return(<div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:6,padding:"3px 5px",background:"rgba(255,87,87,0.06)",border:"1px solid rgba(255,87,87,0.15)",borderRadius:4}}>
                <span style={{color:"#8888AA"}}>{lang==="ko"?"💸 일일 지출 합계":"💸 Total Daily Costs"}</span>
                <span style={{color:"#FF8888",fontWeight:700}}>-${totalExpenses.toLocaleString()}/d <span style={{color:"#555577",fontWeight:400}}>({lang==="ko"?"유지비":"Maint."} ${totalMaint} + {lang==="ko"?"인건비":"Wages"} ${wages})</span></span>
              </div>);})()}
              <div style={{fontSize:10,color:"#FECA57",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>{t("mgr.loan")}</div>
              {LOAN_OPTS.map((opt,i)=>{const daily=Math.ceil(opt.amount*(1+opt.rate)/opt.days);const totalInterest=Math.ceil(opt.amount*opt.rate);return(<div key={i} style={{display:"flex",alignItems:"center",gap:4,padding:4,marginBottom:2,background:"#181828",border:"1px solid #222238",borderRadius:5}}>
                <div style={{fontSize:14}}>{opt.icon}</div>
                <div style={{flex:1}}><div style={{fontSize:10,fontWeight:700}}>{t(`loan.${opt.id}`)}</div><div style={{fontSize:10,color:"#FF8888"}}>${daily}/d · {lang==="ko"?"총 이자":"interest"} +${totalInterest.toLocaleString()}</div></div>
                <button style={{background:"#FECA5711",border:"1px solid #FECA5744",color:"#FECA57",borderRadius:3,padding:"2px 5px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}} onClick={()=>takeLoan(opt)}>{t("mgr.take")}</button>
              </div>);})}
              {loans.map(l=>{
                const totalAmount=Math.round(l.amount*(1+l.rate));
                const paidPct=Math.max(0,Math.min(100,((totalAmount-l.remaining)/totalAmount)*100));
                const dailyInt=Math.round(l.amount*l.rate/l.days);
                return(<div key={l.id} style={{padding:5,marginBottom:2,background:"#181828",border:"1px solid #FF6B6B22",borderRadius:4}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:1}}>
                    <span style={{fontSize:10,color:"#FF8888",fontWeight:700}}>{lang==="ko"?"잔액":"Balance"} ${l.remaining.toLocaleString()}</span>
                    <span style={{fontSize:10,color:"#8888AA"}}>${l.dailyPayment}/d</span>
                  </div>
                  <div style={{fontSize:9,color:"#556066",marginBottom:3}}>{lang==="ko"?"원금":"Principal"} ${l.amount.toLocaleString()} + {lang==="ko"?"이자":"Int"} ${Math.round(l.amount*l.rate).toLocaleString()} · {lang==="ko"?"이자/일":"Int/d"} ${dailyInt}</div>
                  <div style={{height:3,background:"#1A1A2A",borderRadius:99,overflow:"hidden"}}>
                    <div style={{height:"100%",borderRadius:99,background:"linear-gradient(90deg,#FF6B6B,#FF9F43)",width:`${paidPct}%`,transition:"width 0.5s"}}/>
                  </div>
                </div>);
              })}
            </>}

            {tab==="finance"&&<>
              {!dismissedHints.includes("tab_finance")&&<div style={{background:"rgba(255,217,61,0.06)",border:"1px solid rgba(255,217,61,0.3)",borderRadius:7,padding:"7px 10px",marginBottom:6,display:"flex",gap:8,alignItems:"flex-start",animation:"slide-in 0.2s ease"}}>
                <span style={{fontSize:14,flexShrink:0}}>💰</span>
                <div style={{flex:1,fontSize:10,color:"#FFD93D",lineHeight:1.6}}>{lang==="ko"?"일 순이익 = 수익(입장료+탑승료+상업) - 유지비 - 인건비 - 대출이자. 입장료 전략과 요금 탭을 조정해보세요":"Net/day = Revenue - Maintenance - Wages - Loan interest. Adjust pricing strategy & fee tabs to maximize profit"}</div>
                <button style={{background:"none",border:"none",color:"#7788BB",cursor:"pointer",fontSize:12,flexShrink:0}} onClick={()=>{const nd=[...dismissedHints,"tab_finance"];setDismissedHints(nd);try{localStorage.setItem('dismissedHints',JSON.stringify(nd));}catch{}}}>✕</button>
              </div>}
              {/* 순이익 히어로 블록 — Enhanced */}
              {(()=>{
                const last3net=dailyHistory.slice(-3);
                const trendDir=last3net.length>=2?(last3net[last3net.length-1].net>last3net[0].net?"up":last3net[last3net.length-1].net<last3net[0].net?"down":"flat"):"flat";
                const trendArrow=trendDir==="up"?"↑":trendDir==="down"?"↓":"→";
                const trendCol=trendDir==="up"?"#00E5A0":trendDir==="down"?"#FF5757":"#FFD93D";
                return(
                <div style={{background:estNet>=0?"linear-gradient(135deg,rgba(0,229,160,0.14),rgba(0,229,160,0.04))":"linear-gradient(135deg,rgba(255,87,87,0.14),rgba(255,87,87,0.04))",border:`2px solid ${estNet>=0?"#00E5A066":"#FF575766"}`,borderRadius:12,padding:"14px 16px",marginBottom:8,textAlign:"center",boxShadow:`0 4px 20px ${estNet>=0?"rgba(0,229,160,0.08)":"rgba(255,87,87,0.08)"}`}}>
                  <div style={{fontSize:9,color:"#6B7CA1",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>{lang==="ko"?"오늘":"Today"} · {lang==="ko"?"일 순이익 (추정)":"Est. Daily Net Profit"}</div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                    <div style={{fontSize:32,fontWeight:900,color:estNet>=0?"#00E5A0":"#FF5757",fontFamily:"'Barlow Condensed',sans-serif",lineHeight:1,letterSpacing:-1}}>
                      {estNet>=0?"+":""}{estNet.toLocaleString()}
                    </div>
                    {last3net.length>=2&&<span style={{fontSize:24,fontWeight:900,color:trendCol,lineHeight:1,fontFamily:"'Barlow Condensed',sans-serif"}}>{trendArrow}</span>}
                  </div>
                  <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:6}}>
                    <span style={{fontSize:9,color:"#556688"}}>{lang==="ko"?"누적 수익":"Total Rev"}: <span style={{color:"#FFD93D",fontWeight:700}}>${totalRev.toLocaleString()}</span></span>
                    {last3net.length>=2&&<span style={{fontSize:9,color:"#556688"}}>{lang==="ko"?"3일 추세":"3d trend"}: <span style={{color:trendCol,fontWeight:700}}>{trendArrow}</span></span>}
                  </div>
                </div>
                );
              })()}
              {/* 수익 상세 아코디언 */}
              <div style={{background:"#0A1220",border:"1px solid rgba(255,217,61,0.15)",borderRadius:8,marginBottom:6,overflow:"hidden"}}>
                <div onClick={()=>setFinRevOpen(o=>!o)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",cursor:"pointer",userSelect:"none"}}>
                  <span style={{fontSize:10,fontWeight:700,color:"#FFD93D",letterSpacing:1}}>📥 {lang==="ko"?"수익 상세":"Revenue Detail"}</span>
                  <span style={{fontSize:10,color:"#FFD93D44"}}>{finRevOpen?"▲":"▼"}</span>
                </div>
                {finRevOpen&&<div style={{padding:"0 10px 8px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
                  {[
                    {label:lang==="ko"?"💰 입장료":"💰 Admission", val:Math.round(revBreak.adm), col:"#FFD93D"},
                    {label:lang==="ko"?"🎢 놀이기구":"🎢 Rides",   val:Math.round(revBreak.ride),col:"#FF6B9D"},
                    {label:lang==="ko"?"🍔 상업":"🍔 Shops",       val:Math.round(revBreak.shop),col:"#48DBFB"},
                    {label:lang==="ko"?"🎫 시즌패스":"🎫 Pass",    val:Math.round(revBreak.pass),col:"#5EF6A0"},
                  ].map(({label,val,col})=>(
                    <div key={label} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${col}22`,borderRadius:7,padding:"5px 8px"}}>
                      <div style={{fontSize:9,color:"#7788BB"}}>{label}</div>
                      <div style={{fontSize:13,fontWeight:900,color:col,fontFamily:"'Barlow Condensed',sans-serif"}}>+{val.toLocaleString()}</div>
                    </div>
                  ))}
                </div>}
              </div>
              {/* 지출 상세 아코디언 */}
              <div style={{background:"#0A1220",border:"1px solid rgba(255,87,87,0.15)",borderRadius:8,marginBottom:8,overflow:"hidden"}}>
                <div onClick={()=>setFinExpOpen(o=>!o)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",cursor:"pointer",userSelect:"none"}}>
                  <span style={{fontSize:10,fontWeight:700,color:"#FF5757",letterSpacing:1}}>📤 {lang==="ko"?"지출 상세":"Expense Detail"}</span>
                  <span style={{fontSize:10,color:"#FF575744"}}>{finExpOpen?"▲":"▼"}</span>
                </div>
                {finExpOpen&&<div style={{padding:"0 10px 8px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
                  {[
                    {label:lang==="ko"?"🔧 유지비":"🔧 Maintenance", val:Math.round(stats.maintenance*diffSettings.maintenanceMult), col:"#FF5757"},
                    {label:lang==="ko"?"👔 인건비":"👔 Wages",        val:wages, col:"#FF9F43"},
                    ...(loans.length>0?[{label:lang==="ko"?"💳 대출":"💳 Loans", val:loans.reduce((t,l)=>t+l.dailyPayment,0), col:"#FF6B9D"}]:[]),
                  ].map(({label,val,col})=>(
                    <div key={label} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${col}22`,borderRadius:7,padding:"5px 8px"}}>
                      <div style={{fontSize:9,color:"#7788BB"}}>{label}</div>
                      <div style={{fontSize:13,fontWeight:900,color:col,fontFamily:"'Barlow Condensed',sans-serif"}}>-{val.toLocaleString()}</div>
                    </div>
                  ))}
                </div>}
              </div>
              {visitorFactors&&(
                <div style={{background:"#0A1220",border:"1px solid rgba(77,159,255,0.15)",borderRadius:8,padding:8,marginBottom:8}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#4D9FFF",letterSpacing:1,marginBottom:6}}>
                    📈 {lang==="ko"?"방문객 분석":"Visitor Analysis"}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:3}}>
                    {[
                      {label:lang==="ko"?"놀이기구":"Attraction", pct:Math.min(100,visitorFactors.attraction*2), col:"#FFD93D"},
                      {label:lang==="ko"?"날씨":"Weather", pct:Math.round(visitorFactors.weatherMult*100), col:visitorFactors.weatherMult>=1?"#00E5A0":"#FF5757"},
                      {label:lang==="ko"?"계절":"Season", pct:Math.round(visitorFactors.seasonMult*100), col:"#9B7FFF"},
                      {label:lang==="ko"?"만족도":"Happiness", pct:Math.round(visitorFactors.satMult*100), col:sat>70?"#00E5A0":sat>40?"#FFD93D":"#FF5757"},
                      {label:lang==="ko"?"요금 효율":"Fee Eff.", pct:Math.round(visitorFactors.feeMult*100), col:visitorFactors.feeMult>=1?"#00E5A0":"#FF9F43"},
                    ].map(({label,pct,col})=>(
                      <div key={label}>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:9,marginBottom:1}}>
                          <span style={{color:"#9BA8CC"}}>{label}</span>
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
                    :<span style={{color:"#7788BB",background:"rgba(255,255,255,0.04)",borderRadius:3,padding:"1px 5px"}}>{lang==="ko"?"— 보통 (3.5↑이면 보너스)":"— Neutral (3.5+ for bonus)"}</span>}
                  <span style={{color:"#7788BB",fontSize:10}}>({visitorRatings.length}{lang==="ko"?"개 평가":"reviews"})</span>
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
                  <div style={{textAlign:"center",padding:"6px 0",color:"#7788BB",fontSize:10}}>
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
              {!dismissedHints.includes("tab_marketing")&&<div style={{background:"rgba(255,107,157,0.06)",border:"1px solid rgba(255,107,157,0.3)",borderRadius:7,padding:"7px 10px",marginBottom:6,display:"flex",gap:8,alignItems:"flex-start",animation:"slide-in 0.2s ease"}}>
                <span style={{fontSize:14,flexShrink:0}}>📣</span>
                <div style={{flex:1,fontSize:10,color:"#FF6B9D",lineHeight:1.6}}>{lang==="ko"?"캠페인으로 특정 방문객 세그먼트를 공략하고 방문객 수를 늘리세요. TV→일반, SNS→커플, 이벤트→가족":"Run campaigns to target visitor segments. TV→General, SNS→Couples, Event→Families"}</div>
                <button style={{background:"none",border:"none",color:"#7788BB",cursor:"pointer",fontSize:12,flexShrink:0}} onClick={()=>{const nd=[...dismissedHints,"tab_marketing"];setDismissedHints(nd);try{localStorage.setItem('dismissedHints',JSON.stringify(nd));}catch{}}}>✕</button>
              </div>}
              {gameMode!=="sandbox"&&rivals.length===0&&<div style={{background:"#FF475708",border:"1px solid #FF475722",borderRadius:6,padding:"6px 8px",marginBottom:6}}>
                <div style={{fontSize:10,color:"#FF4757",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>🏟️ {lang==="ko"?"경쟁 공원":"Rival Parks"}</div>
                <div style={{fontSize:10,color:"#7788BB",marginBottom:4}}>{lang==="ko"?`Day 20에 첫 경쟁자 등장 예정`:`First rival appears at Day 20`}</div>
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
              {currentScenarioData?.allowedCampaigns&&(
                <div style={{background:"rgba(255,87,87,0.06)",border:"1px solid rgba(255,87,87,0.2)",borderRadius:5,padding:"4px 7px",marginBottom:5,fontSize:9,color:"#FF8888"}}>
                  🚫 {lang==="ko"?`캠페인 제한: ${currentScenarioData.allowedCampaigns.join(', ')} 만 허용`:`Restricted: ${currentScenarioData.allowedCampaigns.join(', ')} only`}
                </div>
              )}
              {tutorialStep===7&&campaigns.length===0&&(
                <div style={{background:"rgba(255,107,157,0.10)",border:"2px solid rgba(255,107,157,0.5)",borderRadius:7,padding:"6px 10px",marginBottom:6,display:"flex",gap:8,alignItems:"center",animation:"pulse 2s infinite"}}>
                  <span style={{fontSize:16}}>👆</span>
                  <div style={{fontSize:10,color:"#FF6B9D",fontWeight:700,lineHeight:1.5}}>{lang==="ko"?"아래 '실행' 버튼을 눌러 첫 캠페인을 시작해보세요!\n광고 효과로 방문객이 늘어납니다.":"Click '실행' below to launch your first campaign!\nAd campaigns bring in more visitors."}</div>
                </div>
              )}
              {Object.entries(CAMPAIGNS_DATA).map(([key,camp],idx)=>{
                const scnAllowed=currentScenarioData?.allowedCampaigns;
                const banned=scnAllowed&&!scnAllowed.includes(key);
                const ok=money>=camp.cost&&!banned;
                const isTutCamp=tutorialStep===7&&campaigns.length===0&&idx===0&&ok;
                return(<div key={key} style={{display:"flex",alignItems:"center",gap:4,padding:"5px 5px",marginBottom:2,background:"#181828",border:`${isTutCamp?"2px solid rgba(255,107,157,0.6)":"1px solid #222238"}`,borderRadius:5,opacity:banned?0.3:ok?1:0.5,boxShadow:isTutCamp?"0 0 10px rgba(255,107,157,0.3)":"none",transition:"all 0.3s"}}>
                  <span style={{fontSize:14}}>{camp.emoji}</span>
                  <div style={{flex:1}}><div style={{fontSize:10,fontWeight:700}}>{t(`camp.${key}`)}{banned?<span style={{color:"#FF5757",fontSize:9}}> 🚫</span>:""}</div><div style={{fontSize:10,color:"#8888AA"}}>+{Math.round(camp.boost*100)}% · {camp.days}d · ${camp.cost.toLocaleString()}</div></div>
                  <button style={{background:ok?(isTutCamp?"rgba(255,107,157,0.25)":"#FF9FF311"):"transparent",border:`1px solid ${ok?(isTutCamp?"#FF6B9D":"#FF9FF3"):"#2A2A4A"}`,color:ok?(isTutCamp?"#FF6B9D":"#FF9FF3"):"#3A3A5A",borderRadius:3,padding:"2px 5px",cursor:ok?"pointer":"default",fontSize:10,fontWeight:isTutCamp?700:400,fontFamily:"inherit",animation:isTutCamp?"pulse 1.5s infinite":"none"}} onClick={()=>ok&&launchCampaign(key)}>{t("btn.start")}</button>
                </div>);
              })}
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
              {!dismissedHints.includes("tab_research")&&<div style={{background:"rgba(162,155,254,0.06)",border:"1px solid rgba(162,155,254,0.3)",borderRadius:7,padding:"7px 10px",marginBottom:6,display:"flex",gap:8,alignItems:"flex-start",animation:"slide-in 0.2s ease"}}>
                <span style={{fontSize:14,flexShrink:0}}>🔬</span>
                <div style={{flex:1,fontSize:10,color:"#A29BFE",lineHeight:1.6}}>{lang==="ko"?"RP(연구 포인트)로 영구 업그레이드를 해금하세요. 먼저 🎠 놀이기구 브랜치의 고성능 엔진을 추천합니다":"Spend RP to unlock permanent upgrades. Start with 🎠 Ride branch — High Perf. Engine is recommended"}</div>
                <button style={{background:"none",border:"none",color:"#7788BB",cursor:"pointer",fontSize:12,flexShrink:0}} onClick={()=>{const nd=[...dismissedHints,"tab_research"];setDismissedHints(nd);try{localStorage.setItem('dismissedHints',JSON.stringify(nd));}catch{}}}>✕</button>
              </div>}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:researchPoints<2?4:6,padding:"4px 6px",background:"#1A1A2A",borderRadius:5,border:"1px solid #A29BFE33"}}>
                <div><div style={{fontSize:10,color:"#A29BFE",letterSpacing:2}}>{t("res.points")}</div><div style={{fontSize:16,fontWeight:900,color:"#A29BFE"}}>{researchPoints} RP</div></div>
                <div style={{textAlign:"right"}}><div style={{fontSize:10,color:"#666688"}}>{t("res.complete")}</div><div style={{fontSize:12,fontWeight:700,color:"#5EF6A0"}}>{researched.length}/{RESEARCH.length}</div></div>
              </div>
              {researchPoints<2&&<div style={{fontSize:10,color:"#7788BB",background:"#A29BFE08",border:"1px solid #A29BFE18",borderRadius:5,padding:"5px 7px",marginBottom:5,lineHeight:1.6}}>
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
                        {!done&&(()=>{const imp=resImpact(r.id);return imp?<div style={{fontSize:9,color:"#A29BFE",marginTop:1}}>↳ {imp}</div>:null;})()}
                      </div>
                      {!done&&<button style={{background:canDo?branch.color+"22":"transparent",border:`1px solid ${canDo?branch.color:"#2A2A4A"}`,color:canDo?branch.color:"#3A3A5A",borderRadius:3,padding:"2px 4px",cursor:canDo?"pointer":"default",fontSize:10,fontFamily:"inherit"}} onClick={()=>canDo&&doResearch(r.id)}>{r.cost}RP</button>}
                    </div>);
                  })}
                </div>);
              })}
            </>}

            {tab==="mission"&&<>
              {!dismissedHints.includes("tab_mission")&&<div style={{background:"rgba(94,246,160,0.06)",border:"1px solid rgba(94,246,160,0.3)",borderRadius:7,padding:"7px 10px",marginBottom:6,display:"flex",gap:8,alignItems:"flex-start",animation:"slide-in 0.2s ease"}}>
                <span style={{fontSize:14,flexShrink:0}}>🎯</span>
                <div style={{flex:1,fontSize:10,color:"#5EF6A0",lineHeight:1.6}}>{lang==="ko"?"미션을 달성하면 RP와 보너스 자금을 얻어요. 달성률이 높을수록 리그 등급이 오릅니다!":"Complete missions for RP & bonus cash. Higher completion rate = higher league rank!"}</div>
                <button style={{background:"none",border:"none",color:"#7788BB",cursor:"pointer",fontSize:12,flexShrink:0}} onClick={()=>{const nd=[...dismissedHints,"tab_mission"];setDismissedHints(nd);try{localStorage.setItem('dismissedHints',JSON.stringify(nd));}catch{}}}>✕</button>
              </div>}
              {day<=30&&(()=>{
                const anyPaths2=grid.flat().some(c=>c?.type==="_path"||c?.type==="_pathFancy");
                const rideTypes=['ferrisWheel','rollerCoaster','carousel','thrillRide','waterRide','bumperCars','dropTower','miniTrain','hauntedHouse','cinema4D','balloonRide','miniGolf','amphitheater'];
                const rideCount=grid.flat().filter(c=>c&&!c.ref&&rideTypes.includes(c.type)).length;
                const hasStaff=Object.values(hired).some(v=>v>0);
                const steps=[
                  {done:stats.hasEntrance,ko:"입구 게이트 배치",       en:"Place entrance gate"},
                  {done:anyPaths2,         ko:"통로로 건물 연결",        en:"Connect buildings with paths"},
                  {done:rideCount>=3,      ko:"놀이기구 3개 이상 건설",  en:"Build 3+ attractions"},
                  {done:hasStaff,          ko:"직원 1명 이상 고용",      en:"Hire at least 1 staff"},
                ];
                if(steps.every(s=>s.done)) return null;
                return(<div style={{background:"linear-gradient(135deg,rgba(0,229,160,0.06),rgba(0,229,160,0.02))",border:"1px solid rgba(0,229,160,0.2)",borderRadius:8,padding:8,marginBottom:6}}>
                  <div style={{fontSize:9,color:"#00E5A0",letterSpacing:2,textTransform:"uppercase",marginBottom:6,fontWeight:700}}>📋 {lang==="ko"?"시작 가이드":"START GUIDE"}</div>
                  {steps.map((s,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                      <span style={{fontSize:11,flexShrink:0}}>{s.done?"✅":"⬜"}</span>
                      <span style={{fontSize:10,color:s.done?"#00E5A0":"#8899BB",textDecoration:s.done?"line-through":"none"}}>{lang==="ko"?s.ko:s.en}</span>
                    </div>
                  ))}
                </div>);
              })()}
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
                    <div style={{fontSize:10,color:"#FECA57"}}>👥×{activeHoliday.visMult}{activeHoliday.actionBoosted?`×${activeHoliday.actionVisMult||1.15}`:""} · 😊+{activeHoliday.satMod} · {activeHoliday.remaining}d</div>
                    {activeHoliday.actionBoosted&&<div style={{fontSize:9,color:"#5EF6A0",fontWeight:700}}>✨ {lang==="ko"?"이벤트 부스트 활성":"Event boost active"}!</div>}
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
                    <div><div style={{fontSize:10,fontWeight:800,color:currentScenarioData.color}}>{t(`scn.${currentScenarioData.id}`)}</div><div style={{fontSize:10,color:"#666688"}}>⏱ {t("mis.timeLeft", { days: Math.max(0,scenarioTimeLimit-day) })}</div></div>
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
                {/* Phase 1-4: Scenario constraint rules panel */}
                {currentScenarioData.constraints&&(currentScenarioData.constraints.breakChanceMemo||currentScenarioData.constraints.satRules?.length>0||currentScenarioData.constraints.admFeeCap)&&(
                  <div style={{background:"rgba(162,155,254,0.06)",border:"1px solid rgba(162,155,254,0.2)",borderRadius:7,padding:8,marginBottom:7}}>
                    <div style={{fontSize:9,fontWeight:700,color:"#A29BFE",letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>⚖️ {lang==="ko"?"시나리오 규칙":"Scenario Rules"}</div>
                    {currentScenarioData.constraints.breakChanceMemo&&(
                      <div style={{display:"flex",alignItems:"center",gap:5,padding:"3px 5px",marginBottom:3,background:"rgba(255,159,67,0.08)",border:"1px solid rgba(255,159,67,0.2)",borderRadius:4}}>
                        <span style={{fontSize:11}}>🔧</span>
                        <span style={{fontSize:9,color:"#FF9F43",flex:1}}>{currentScenarioData.constraints.breakChanceMemo[lang]||currentScenarioData.constraints.breakChanceMemo.ko}</span>
                      </div>
                    )}
                    {currentScenarioData.constraints.admFeeCap&&(
                      <div style={{display:"flex",alignItems:"center",gap:5,padding:"3px 5px",marginBottom:3,background:fee>currentScenarioData.constraints.admFeeCap?"rgba(255,87,87,0.10)":"rgba(94,246,160,0.06)",border:`1px solid ${fee>currentScenarioData.constraints.admFeeCap?"rgba(255,87,87,0.3)":"rgba(94,246,160,0.2)"}`,borderRadius:4}}>
                        <span style={{fontSize:11}}>{fee>currentScenarioData.constraints.admFeeCap?"⚠️":"✅"}</span>
                        <span style={{fontSize:9,color:fee>currentScenarioData.constraints.admFeeCap?"#FF5757":"#5EF6A0",flex:1}}>{lang==="ko"?`입장료 상한 $${currentScenarioData.constraints.admFeeCap} — 현재 $${fee}`:`Fee cap $${currentScenarioData.constraints.admFeeCap} — current $${fee}`}</span>
                        {fee>currentScenarioData.constraints.admFeeCap&&<span style={{fontSize:9,color:"#FF5757",fontWeight:700}}>{currentScenarioData.constraints.admFeeCapPenalty}/일</span>}
                      </div>
                    )}
                    {currentScenarioData.constraints.satRules?.map((rule,ri)=>{
                      const coupleRatio=segs.couple||0;
                      const familyRatio=segs.family||0;
                      const hasRestroom=!!(grid.flat().some(c=>c&&!c.ref&&c.type==="restroom"));
                      const hasWaterRide=!!(grid.flat().some(c=>c&&!c.ref&&c.type==="waterRide"));
                      let active=false;
                      if(rule.type==="coupleBelow") active=coupleRatio<rule.threshold;
                      else if(rule.type==="coupleAbove") active=coupleRatio>=rule.threshold;
                      else if(rule.type==="feeLow") active=fee<rule.threshold;
                      else if(rule.type==="feeHigh") active=fee>=rule.threshold;
                      else if(rule.type==="noRestroom") active=!hasRestroom;
                      else if(rule.type==="noWaterRide") active=!hasWaterRide;
                      else if(rule.type==="familyAbove") active=familyRatio>rule.threshold;
                      else if(rule.type==="starBelow") active=day>=(rule.afterDay||0)&&parkRating.stars<rule.threshold;
                      const isBad=active&&(rule.penalty!==undefined);
                      const isGood=active&&(rule.bonus!==undefined&&!rule.penalty);
                      const col=isBad?"#FF5757":isGood?"#00E5A0":"#666688";
                      const bg=isBad?"rgba(255,87,87,0.08)":isGood?"rgba(0,229,160,0.06)":"rgba(255,255,255,0.02)";
                      const border=isBad?"rgba(255,87,87,0.25)":isGood?"rgba(0,229,160,0.2)":"rgba(255,255,255,0.06)";
                      return(
                        <div key={ri} style={{display:"flex",alignItems:"center",gap:5,padding:"3px 5px",marginBottom:3,background:bg,border:`1px solid ${border}`,borderRadius:4}}>
                          <span style={{fontSize:11}}>{isBad?"⚠️":isGood?"✅":"⬜"}</span>
                          <span style={{fontSize:9,color:col,flex:1}}>{rule.desc[lang]||rule.desc.ko}</span>
                          {active&&rule.penalty&&<span style={{fontSize:9,color:"#FF5757",fontWeight:700}}>{rule.penalty}/일</span>}
                          {active&&rule.bonus&&<span style={{fontSize:9,color:"#00E5A0",fontWeight:700}}>+{rule.bonus}/일</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
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
              {/* 첫 게임 시작 체크리스트 — day 8 이전 또는 미완료 단계 있을 때만 표시 */}
              {day<=8&&(()=>{
                const hasEntrance=stats.hasEntrance;
                const hasRide=grid.flat().some(c=>c&&!c.ref&&B[c.type]?.cat==="ride"&&c.type!=="entrance");
                const hasPath=grid.flat().some(c=>c?.type==="_path"||c?.type==="_pathFancy");
                const hasStaff=hired.janitor>0||hired.mechanic>0;
                const isRunning=speed>0;
                const steps=[
                  {done:hasEntrance, ko:"입구 게이트 배치", en:"Place Entrance Gate"},
                  {done:hasRide,     ko:"놀이기구 1개 건설", en:"Build 1 Attraction"},
                  {done:hasPath,     ko:"통로로 연결",       en:"Connect with Paths"},
                  {done:hasStaff,    ko:"직원 1명 고용",     en:"Hire 1 Staff Member"},
                  {done:isRunning,   ko:"▶ 눌러서 개장",    en:"Press ▶ to Open"},
                ];
                const allDone=steps.every(s=>s.done);
                if(allDone) return null;
                return(<div style={{background:"rgba(0,229,160,0.06)",border:"1px solid rgba(0,229,160,0.2)",borderRadius:8,padding:"7px 8px",marginBottom:8}}>
                  <div style={{fontSize:9,fontWeight:700,color:"#5EF6A0",letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>🚀 {lang==="ko"?"시작 가이드":"START GUIDE"}</div>
                  {steps.map((s,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:5,padding:"2px 0",fontSize:9,color:s.done?"#5EF6A0":"#8899BB",textDecoration:s.done?"line-through":"none"}}>
                      <span style={{fontSize:10}}>{s.done?"✅":"⬜"}</span>
                      <span>{lang==="ko"?s.ko:s.en}</span>
                    </div>
                  ))}
                </div>);
              })()}
              {/* 샌드박스 목표 선택 */}
              {gameMode==="sandbox"&&<div style={{background:"rgba(155,127,255,0.07)",border:"1px solid rgba(155,127,255,0.2)",borderRadius:8,padding:"8px 10px",marginBottom:8}}>
                <div style={{fontSize:10,fontWeight:700,color:"#9B7FFF",letterSpacing:1,marginBottom:6}}>🎯 {lang==="ko"?"목표 선택":"Choose Goal"}</div>
                {[
                  {type:"vis",  target:200, label:lang==="ko"?"👥 방문객 200명 달성":"👥 Reach 200 visitors"},
                  {type:"sat",  target:90,  label:lang==="ko"?"😊 만족도 90% 달성":"😊 Reach 90% satisfaction"},
                  {type:"money",target:100000,label:lang==="ko"?"💰 자금 $100,000 달성":"💰 Accumulate $100,000"},
                  {type:"stars",target:5,   label:lang==="ko"?"⭐ 5성급 공원 달성":"⭐ Achieve 5-star rating"},
                ].map(goal=>{
                  const isActive=sandboxGoal?.type===goal.type;
                  const isAchieved=sandboxGoal?.type===goal.type&&sandboxGoal?.achieved;
                  return(
                    <div key={goal.type} onClick={()=>setSandboxGoal(isActive?null:{...goal,achieved:false})} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 6px",marginBottom:3,background:isAchieved?"rgba(0,229,160,0.12)":isActive?"rgba(155,127,255,0.12)":"rgba(255,255,255,0.03)",border:`1px solid ${isAchieved?"#00E5A0":isActive?"#9B7FFF":"rgba(255,255,255,0.08)"}`,borderRadius:5,cursor:"pointer",transition:"all 0.15s"}}>
                      <span style={{fontSize:9,color:isAchieved?"#00E5A0":isActive?"#9B7FFF":"#6677AA",flex:1}}>{goal.label}</span>
                      {isAchieved&&<span style={{fontSize:10}}>✅</span>}
                      {isActive&&!isAchieved&&<span style={{fontSize:8,color:"#9B7FFF"}}>●</span>}
                    </div>
                  );
                })}
              </div>}
              {/* 주간 배지 */}
              {weeklyBadges.length>0&&<div style={{background:"rgba(255,217,61,0.06)",border:"1px solid rgba(255,217,61,0.2)",borderRadius:8,padding:"8px 10px",marginBottom:8}}>
                <div style={{fontSize:10,fontWeight:700,color:"#FFD93D",letterSpacing:1,marginBottom:6}}>🏅 {lang==="ko"?"획득 배지":"Earned Badges"} ({weeklyBadges.length})</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                  {weeklyBadges.map(b=>(
                    <div key={b.id} title={`${b.name} (Day ${b.earned})`} style={{display:"flex",alignItems:"center",gap:3,background:"rgba(255,217,61,0.1)",border:"1px solid rgba(255,217,61,0.3)",borderRadius:4,padding:"2px 5px"}}>
                      <span style={{fontSize:11}}>{b.emoji}</span>
                      <span style={{fontSize:8,color:"#FFD93D",maxWidth:60,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.name}</span>
                    </div>
                  ))}
                </div>
              </div>}
              <div style={{fontSize:10,color:"#FECA57",letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>{t("mis.title")} ({completedMissions.length}/{MISSIONS.length})</div>
              {activeMissions.map(mId=>{
                const m=MISSIONS.find(x=>x.id===mId);if(!m) return null;
                const cc2=bldCounts(grid);
                const ms2={vis:visitors,sat,clean,pres:parkRating.stars,pass:passHolders,rides:Object.entries(cc2).filter(([k])=>B[k]?.cat==="ride"&&k!=="entrance").reduce((t,[,v])=>t+v,0),vips:vipCount,zones:zoneGrid.reduce((t,row)=>t+row.filter(Boolean).length,0),net:estNet,research:researched.length,debt:totalDebt,paths:Object.entries(cc2).filter(([k])=>B[k]?.cat==="path").reduce((t,[,v])=>t+v,0),profitStreak:profitStreakDays,totalVis,staffMaxed:Object.values(staffLevels).every(v=>v>=3)};
                const ready=m.check(ms2);
                return(<div key={mId} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 6px",marginBottom:3,background:ready?"#0A1A14":"#14142A",border:`2px solid ${ready?"#5EF6A0":"#2A2A4A"}`,borderRadius:6}}>
                  <span style={{fontSize:14}}>{m.emoji}</span>
                  <div style={{flex:1}}><div style={{fontSize:10,fontWeight:700,color:ready?"#5EF6A0":"#E8E8F0"}}>{t(`mis.${m.id}`)}</div>
                    {m.desc&&<div style={{fontSize:9,color:"#6B7CA1",marginTop:1,lineHeight:1.3}}>{m.desc[lang]||m.desc.ko}</div>}
                    <div style={{display:"flex",gap:3,marginTop:2}}><span style={{fontSize:10,color:"#5EF6A0",background:"#5EF6A013",borderRadius:2,padding:"1px 3px"}}>+${m.reward.$.toLocaleString()}</span><span style={{fontSize:10,color:"#A29BFE",background:"#A29BFE13",borderRadius:2,padding:"1px 3px"}}>+{m.reward.rp}RP</span></div>
                  </div>
                  {ready&&<span style={{fontSize:13}}>🏆</span>}
                </div>);
              })}

              {/* Stage 5 Legendary Park panel */}
              {currentStage.id>=5&&(
                <div style={{background:"linear-gradient(135deg,rgba(255,107,157,0.08),rgba(155,127,255,0.06))",border:"1px solid rgba(255,107,157,0.35)",borderRadius:8,padding:"8px 10px",marginTop:6,marginBottom:6}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                    <span style={{fontSize:20,filter:"drop-shadow(0 0 8px #FF6B9D)"}}>🌟</span>
                    <div>
                      <div style={{fontSize:11,fontWeight:800,color:"#FF6B9D",letterSpacing:2,textTransform:"uppercase"}}>{lang==="ko"?"전설적인 공원":"LEGENDARY PARK"}</div>
                      <div style={{fontSize:9,color:"#9B7FFF"}}>{lang==="ko"?"스테이지 5 달성! 세계가 주목합니다":"Stage 5 achieved! World is watching"}</div>
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:3,marginBottom:5}}>
                    {[
                      {ic:"📈",lbl:lang==="ko"?"수익":"Revenue",val:"+30%",col:"#5EF6A0"},
                      {ic:"👥",lbl:lang==="ko"?"방문객":"Visitors",val:"+40%",col:"#4D9FFF"},
                      {ic:"⭐",lbl:lang==="ko"?"명성":"Prestige",val:"MAX",col:"#FFD93D"},
                      {ic:"🏆",lbl:lang==="ko"?"단계":"Stage",val:"MAX",col:"#FF6B9D"},
                    ].map(({ic,lbl,val,col})=>(
                      <div key={lbl} style={{background:`${col}10`,border:`1px solid ${col}33`,borderRadius:5,padding:"3px 6px",display:"flex",alignItems:"center",gap:4}}>
                        <span style={{fontSize:11}}>{ic}</span>
                        <div>
                          <div style={{fontSize:8,color:col,opacity:0.7,lineHeight:1}}>{lbl}</div>
                          <div style={{fontSize:10,fontWeight:700,color:col,lineHeight:1}}>{val}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{fontSize:9,color:"#6B7CA1",textAlign:"center"}}>{lang==="ko"?"남은 미션을 완료해 전설의 이름을 남기세요":"Complete remaining missions to cement your legacy"}</div>
                </div>
              )}

              {/* Phase 3-5: League System Panel — show after day 20 or when medals earned */}
              {(earnedMedals.length>0||day>=20)&&(()=>{
                const curLeague=calcLeague(earnedMedals);
                const bronzeC=earnedMedals.filter(m=>["bronze","silver","gold","platinum"].includes(m.medalId)).length;
                const silverC=earnedMedals.filter(m=>["silver","gold","platinum"].includes(m.medalId)).length;
                const goldC=earnedMedals.filter(m=>["gold","platinum"].includes(m.medalId)).length;
                const platinumC=earnedMedals.filter(m=>m.medalId==="platinum").length;
                const goldScen=new Set(earnedMedals.filter(m=>["gold","platinum"].includes(m.medalId)).map(m=>m.scenarioId)).size;
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
                      <div style={{fontSize:10,color:"#666688"}}>🥉×{bronzeC} 🥈×{silverC} 🥇×{goldC}{platinumC>0?` 🏅×${platinumC}`:""}</div>
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

              {/* Phase 3-5: 업적 목록 — day 10+ 또는 업적 달성 시 표시 */}
              {(earnedAchievements.length>0||day>=10)&&<div style={{marginTop:6}}>
                <div style={{fontSize:10,color:"#FFD93D",letterSpacing:2,textTransform:"uppercase",marginBottom:5}}>
                  🏅 {lang==="ko"?"업적":"Achievements"} ({earnedAchievements.length}/{ACHIEVEMENTS.length})
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:3}}>
                  {ACHIEVEMENTS.map(a=>{
                    const earned=earnedAchievements.includes(a.id);
                    return(
                      <div key={a.id} style={{display:"flex",alignItems:"flex-start",gap:4,padding:"4px 5px",background:earned?`${a.col}18`:"#0E0E1E",border:`1px solid ${earned?a.col+"44":"#1E1E2E"}`,borderRadius:5,opacity:earned?1:0.45,transition:"opacity 0.2s"}}>
                        <span style={{fontSize:13,flexShrink:0,filter:earned?`drop-shadow(0 0 4px ${a.col})`:"grayscale(1) opacity(0.4)"}}>{a.emoji}</span>
                        <div style={{minWidth:0}}>
                          <div style={{fontSize:9,fontWeight:earned?700:400,color:earned?a.col:"#555577",lineHeight:1.3,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{a.name[lang]||a.name.ko}</div>
                          {earned&&a.desc&&<div style={{fontSize:8,color:"#4A5A7A",lineHeight:1.3,marginTop:1,whiteSpace:"normal"}}>{a.desc[lang]||a.desc.ko}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>}
            </>}

          </div>
        </div>

        {/* ── Panel Collapse Toggle (tablet only, not mobile) ── */}
        {!isPC&&!isMobile&&<button onClick={()=>setPanelCollapsed(p=>!p)} style={{alignSelf:"stretch",width:14,background:"rgba(100,120,255,0.08)",borderTop:"none",borderBottom:"none",borderLeft:"none",borderRight:"1px solid rgba(100,120,255,0.10)",color:"#7788BB",cursor:"pointer",fontSize:10,fontFamily:"inherit",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.15s"}} title={panelCollapsed?(lang==="ko"?"패널 열기":"Open panel"):(lang==="ko"?"패널 닫기":"Close panel")}>{panelCollapsed?"▶":"◀"}</button>}

        {/* ── GRID + LOG ── */}
        <div className="grid-area" style={{flex:1,display:"flex",flexDirection:"column",padding:isMobile?2:7,gap:isMobile?2:5,overflow:"hidden",background:"var(--bg-deep)",touchAction:isMobile?"none":"auto"}}
          onTouchStart={(e) => {
            if (e.touches.length === 2) {
              panRef.current.active = false;
              const dx = e.touches[0].clientX - e.touches[1].clientX;
              const dy = e.touches[0].clientY - e.touches[1].clientY;
              pinchRef.current = {
                active: true,
                startDist: Math.hypot(dx, dy),
                startScale: gridScale,
              };
              e.preventDefault();
            } else if (e.touches.length === 1 && gridScale > 1.05) {
              panRef.current = {
                active: true,
                startX: e.touches[0].clientX,
                startY: e.touches[0].clientY,
                startPanX: gridPan.x,
                startPanY: gridPan.y,
              };
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
            } else if (panRef.current.active && e.touches.length === 1) {
              const dx = e.touches[0].clientX - panRef.current.startX;
              const dy = e.touches[0].clientY - panRef.current.startY;
              setGridPan({ x: panRef.current.startPanX + dx, y: panRef.current.startPanY + dy });
              e.preventDefault();
            }
          }}
          onTouchEnd={() => { pinchRef.current.active = false; panRef.current.active = false; }}
        >
          {/* Banners + event popups — in grid-area on tablet/mobile, in right panel on PC */}
          {!isPC&&<>
          {/* Feature 6: Disaster pre-warning banners */}
          {screen==="game"&&stats.brokenCount>0&&(
            <div style={{background:"rgba(255,87,87,0.12)",border:"1px solid rgba(255,87,87,0.5)",borderRadius:6,padding:"5px 10px",color:"#FF5757",fontSize:10,fontWeight:700,display:"flex",gap:6,alignItems:"center",marginBottom:4,flexShrink:0,position:"relative",zIndex:10}}>
              {lang==="ko"?`⚠️ 고장 시설 ${stats.brokenCount}개 — 경영 탭에서 수리하거나 정비공을 고용하세요`:`⚠️ ${stats.brokenCount} broken ride${stats.brokenCount>1?"s":""} — repair in Manage tab or hire a mechanic`}
            </div>
          )}
          {!isMobile&&screen==="game"&&hired.mechanic===0&&stats.brokenCount===0&&(cc.rollerCoaster||cc.dropTower||cc.thrillRide)&&(
            <div style={{background:"rgba(255,159,67,0.10)",border:"1px solid rgba(255,159,67,0.4)",borderRadius:6,padding:"5px 10px",color:"#FF9F43",fontSize:10,fontWeight:700,display:"flex",gap:6,alignItems:"center",marginBottom:4,flexShrink:0,position:"relative",zIndex:10}}>
              {lang==="ko"?"🔧 정비공 없음 — 고위험 놀이기구 고장 확률이 높습니다":"🔧 No mechanic — high-risk attractions have increased breakdown chance"}
            </div>
          )}
          {/* 튜토리얼 완료 후 방향 허브 — day 7까지 표시, 모바일 제외 */}
          {!isMobile&&screen==="game"&&tutDone&&tutorialStep===0&&day<=7&&day>=1&&(()=>{
            const nextGoals=[
              visitors<50&&{emoji:"👥",text:lang==="ko"?"방문객 50명 달성 — 놀이기구 다양화":"Reach 50 visitors — add variety"},
              sat<70&&{emoji:"😊",text:lang==="ko"?"만족도 70%+ — 청소부 고용 & 입장료 조정":"Satisfaction 70%+ — hire janitor & adjust fee"},
              !hired.mechanic&&stats.brokenCount>0&&{emoji:"🔧",text:lang==="ko"?"고장 발생! 정비공 고용 필요":"Breakdown! Hire a mechanic"},
              hired.janitor===0&&{emoji:"🧹",text:lang==="ko"?"청소부 없음 — 청결도 하락 중":"No janitor — cleanliness dropping"},
              stats.attraction<30&&{emoji:"🎡",text:lang==="ko"?"놀이기구 추가로 매력도 올리기":"Add more rides to boost attraction"},
              parkRating.stars<3&&{emoji:"⭐",text:lang==="ko"?"별점 3★ 달성 → 더 높은 입장료 가능":"Reach 3★ → unlock higher admission fee"},
            ].filter(Boolean).slice(0,3);
            if(!nextGoals.length) return null;
            return(
              <div style={{background:"rgba(0,229,160,0.06)",border:"1px solid rgba(0,229,160,0.25)",borderRadius:7,padding:"7px 10px",marginBottom:4,flexShrink:0}}>
                <div style={{fontSize:9,color:"#00E5A088",fontWeight:700,letterSpacing:2,marginBottom:5,textTransform:"uppercase"}}>🎓 {lang==="ko"?"다음에 할 일":"What's Next"} (Day {day})</div>
                {nextGoals.map(({emoji,text},i)=>(
                  <div key={i} style={{display:"flex",gap:6,alignItems:"flex-start",padding:"2px 0",borderBottom:i<nextGoals.length-1?"1px solid rgba(0,229,160,0.08)":"none"}}>
                    <span style={{fontSize:12,flexShrink:0}}>{emoji}</span>
                    <span style={{fontSize:9,color:"#8899CC",lineHeight:1.5}}>{text}</span>
                  </div>
                ))}
              </div>
            );
          })()}
          {!isMobile&&screen==="game"&&!ftueGoalDone&&tutorialStep===0&&stats.hasEntrance&&visitors===0&&(
            <div style={{background:"rgba(0,229,160,0.08)",border:"1px solid rgba(0,229,160,0.3)",borderRadius:6,padding:"5px 10px",color:"#00E5A0",fontSize:10,fontWeight:700,display:"flex",gap:8,alignItems:"center",marginBottom:4,flexShrink:0}}>
              <span style={{fontSize:14}}>🎯</span>
              <div style={{flex:1}}>
                <span style={{color:"#5EF6A0"}}>{lang==="ko"?"첫 번째 목표:":"First Goal:"}</span>
                {" "}{lang==="ko"?"▶ 재생 버튼을 눌러 방문객을 맞이하세요! (우상단 ▶ 버튼)":"▶ Press Play to welcome your first visitors! (▶ button, top right)"}
              </div>
              <button style={{background:"none",border:"none",color:"#7788BB",cursor:"pointer",fontSize:12,fontFamily:"inherit"}} onClick={()=>setFtueGoalDone(true)}>✕</button>
            </div>
          )}
          {!isMobile&&screen==="game"&&tutorialStep===0&&(()=>{
            const hints=[
              {id:"h_entrance", show:day>=2&&!stats.hasEntrance,
               emoji:"🎪", col:"#FF5757",
               msg:lang==="ko"?"입구 게이트가 없습니다 — 건설 탭에서 입구를 먼저 배치하세요":"No entrance gate — place an Entrance Gate first in the Build tab"},
              {id:"h_fee",  show:day>=3&&fee>MAX_FEE_BY_STARS[parkRating.stars]&&visitors>0,
               emoji:"💸", col:"#FF5757",
               msg:lang==="ko"?`입장료($${fee})가 현재 별점(${parkRating.stars}★) 한도 $${MAX_FEE_BY_STARS[parkRating.stars]}를 초과합니다 — 방문객이 급감합니다`:`Admission fee ($${fee}) exceeds ${parkRating.stars}★ limit ($${MAX_FEE_BY_STARS[parkRating.stars]}) — visitors are dropping`},
              {id:"h_staff", show:day>=4&&hired.janitor===0&&hired.mechanic===0&&!stats.brokenCount,
               emoji:"🧹", col:"#4D9FFF",
               msg:lang==="ko"?"청소부·정비공이 없으면 청결도↓ + 시설 고장↑ — 경영 탭에서 직원을 고용하세요":"No janitor/mechanic → cleanliness↓ + breakdowns↑ — hire staff in Manage tab"},
              {id:"h_broken", show:day>=3&&stats.brokenCount>=3&&hired.mechanic===0,
               emoji:"🔧", col:"#FF9F43",
               msg:lang==="ko"?`고장난 시설 ${stats.brokenCount}개 — 정비공 고용 또는 경영 탭에서 직접 수리하세요`:`${stats.brokenCount} broken facilities — hire a Mechanic or repair manually in Manage tab`},
              {id:"h_path",  show:day>=3&&stats.hasEntrance&&grid.flat().some(c=>c&&!c.ref&&B[c.type]?.cat==="ride"&&c.type!=="entrance")&&!grid.flat().some(c=>c?.type==="_path"||c?.type==="_pathFancy"),
               emoji:"🛤️", col:"#FF9F43",
               msg:lang==="ko"?"놀이기구에 통로가 연결되지 않으면 수익이 -40%입니다 — 건설 탭 → 통로를 연결하세요":"Rides without paths lose -40% income — go to Build → place paths"},
              {id:"h_sat",   show:day>=6&&sat<50&&sat>0&&visitors>0,
               emoji:"😟", col:"#FF6B9D",
               msg:lang==="ko"?"만족도가 낮으면 방문객이 줄어듭니다 — 😊 버튼에 마우스를 올려 원인을 확인하세요":"Low happiness drives away visitors — hover 😊 icon to see causes"},
              {id:"h_congest", show:day>=5&&visitors>0&&congestedCells.size>0&&stats.brokenCount===0,
               emoji:"🚶", col:"#FF9F43",
               msg:lang==="ko"?"공원이 혼잡합니다! 놀이기구를 추가해 수용인원을 늘리거나 입장료를 올리세요":"Park is over capacity! Add more attractions or raise the admission fee"},
              {id:"h_research", show:day>=5&&researchPoints>=3&&researched.length===0,
               emoji:"🔬", col:"#A29BFE",
               msg:lang==="ko"?"연구 포인트가 쌓였습니다! 연구 탭에서 업그레이드하세요":"Research points available! Go to the Research tab to unlock upgrades"},
              {id:"h_zone", show:day>=3&&visitors>5&&zoneGrid.flat().every(v=>!v)&&grid.flat().filter(c=>c&&!c.ref&&B[c.type]?.cat==="ride").length>=2,
               emoji:"🎨", col:"#5EF6A0",
               msg:lang==="ko"?"구역(Zone)을 지정하면 놀이기구 효율이 +25~30% 상승합니다 — 건설 탭 → 구역 페인트":"Designate Zones for +25-30% attraction efficiency — Build tab → Zone Paint"},
              {id:"h_land", show:day>=10&&gameMode!=="sandbox"&&parcels.length===0&&money>8000,
               emoji:"🏕️", col:"#4D9FFF",
               msg:lang==="ko"?"토지를 구매하면 공원을 확장할 수 있어요! 건설 탭 → 토지 구매에서 확인하세요":"Buy more land to expand your park! Build tab → Land Purchase"},
            ];
            const activeHint=hints.find(h=>h.show&&!dismissedHints.includes(h.id));
            if(!activeHint) return null;
            return(
              <div style={{background:`${activeHint.col}12`,border:`1px solid ${activeHint.col}55`,borderRadius:6,padding:"5px 10px",color:activeHint.col,fontSize:10,fontWeight:700,display:"flex",gap:8,alignItems:"center",marginBottom:4,flexShrink:0,animation:"slide-in 0.2s ease"}}>
                <span style={{fontSize:14}}>{activeHint.emoji}</span>
                <div style={{flex:1,lineHeight:1.4}}>{activeHint.msg}</div>
                <button style={{background:"none",border:"none",color:"#7788BB",cursor:"pointer",fontSize:12,fontFamily:"inherit",flexShrink:0}} onClick={()=>{const nd=[...dismissedHints,activeHint.id];setDismissedHints(nd);try{localStorage.setItem('dismissedHints',JSON.stringify(nd));}catch{}}}>✕</button>
              </div>
            );
          })()}
          {bankruptcyDays>0&&bankruptcyDays<5&&screen==="game"&&(
            <div style={{background:"rgba(255,50,50,0.15)",border:"2px solid rgba(255,87,87,0.7)",borderRadius:6,padding:"5px 10px",color:"#FF5757",fontSize:10,fontWeight:700,display:"flex",gap:8,alignItems:"center",marginBottom:4,animation:"pulse 1s infinite",flexShrink:0}}>
              <span style={{fontSize:16}}>💸</span>
              <div style={{flex:1}}>
                {lang==="ko"?`파산 위험! ${5-bankruptcyDays}일 후 공원 폐쇄 — 수익을 늘리거나 비용을 줄이세요`:`Bankruptcy risk! Park closes in ${5-bankruptcyDays} days — increase revenue or cut costs`}
              </div>
            </div>
          )}
          {disasterWarning&&screen==="game"&&(
            disasterWarning.countdown>=2?(
              <div style={{background:"rgba(255,200,0,0.08)",border:"2px solid rgba(255,200,0,0.35)",borderRadius:6,padding:"6px 10px",color:"#FFD060",fontSize:10,fontWeight:700,display:"flex",gap:8,alignItems:"center",marginBottom:4,flexShrink:0}}>
                <span style={{fontSize:16}}>🌡️</span>
                <div style={{flex:1}}>
                  <div>{lang==="ko"?`🌡️ 징후 감지: ${t("dis."+disasterWarning.dis.id)}`:`🌡️ Early Signs: ${t("dis."+disasterWarning.dis.id)}`}</div>
                  <div style={{fontSize:10,opacity:0.8}}>{lang==="ko"?`${disasterWarning.countdown}일 후 발생 예정`:`${disasterWarning.countdown} days until event`}</div>
                </div>
                <button onClick={mitigateDisaster} style={{background:"#FFD06022",border:"1px solid #FFD06088",color:"#FFD060",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"inherit"}}>
                  🛡️ {lang==="ko"?"대비 $800":"Mitigate $800"}
                </button>
              </div>
            ):(
              <div style={{background:"rgba(255,80,0,0.15)",border:"2px solid rgba(255,80,0,0.6)",borderRadius:6,padding:"6px 10px",color:"#FF5722",fontSize:10,fontWeight:700,display:"flex",gap:8,alignItems:"center",marginBottom:4,animation:"pulse 1s infinite",flexShrink:0}}>
                <span style={{fontSize:16}}>⚠️</span>
                <div style={{flex:1}}>
                  <div>{lang==="ko"?`⚠️ 위험! ${t("dis."+disasterWarning.dis.id)}`:`⚠️ DANGER! ${t("dis."+disasterWarning.dis.id)}`}</div>
                  <div style={{fontSize:10,opacity:0.8}}>{lang==="ko"?"내일 발생 예정!":"Strikes tomorrow!"}</div>
                </div>
                <button onClick={mitigateDisaster} style={{background:"#FF572222",border:"1px solid #FF572288",color:"#FF5722",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"inherit"}}>
                  🛡️ {lang==="ko"?"대비 $800":"Mitigate $800"}
                </button>
              </div>
            )
          )}
          </>}
          {buildMode==="zone"&&zonePaint&&<div style={{display:"flex",alignItems:"center",gap:5,padding:"2px 8px",background:ZONES[zonePaint]?.bg||"#66668818",border:`1px solid ${ZONES[zonePaint]?.color||"#666688"}44`,borderRadius:4,flexShrink:0}}>
            <span style={{fontSize:11}}>{ZONES[zonePaint]?.emoji||"🚫"}</span>
            <span style={{fontSize:10,color:ZONES[zonePaint]?.color||"#666688",fontWeight:700}}>{ZONES[zonePaint]?t(`z.${zonePaint}`):t("z.clear")}</span>
            <button style={{marginLeft:"auto",background:"none",border:"1px solid #666688",color:"#888888",borderRadius:4,padding:"1px 6px",cursor:"pointer",fontSize:10,fontFamily:"inherit"}} onClick={()=>setZonePaint(null)}>{t("misc.done")}</button>
          </div>}

          {!isPC&&<>
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

          {pendingSeasonalAction&&day<=pendingSeasonalAction.expiresDay&&(
            <div style={{background:"linear-gradient(135deg,rgba(13,18,53,0.98),rgba(8,11,32,0.98))",border:"2px solid rgba(255,217,61,0.35)",borderRadius:12,padding:"10px 14px",flexShrink:0,display:"flex",alignItems:"center",gap:9,backdropFilter:"blur(8px)",boxShadow:"0 8px 40px rgba(0,0,0,0.6)",animation:"slide-in 0.2s ease"}}>
              <div style={{fontSize:26,lineHeight:1}}>{pendingSeasonalAction.event.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:11,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",color:"#FFD93D",marginBottom:1}}>{lang==="ko"?"🎉 이벤트 부스트 선택":"🎉 Event Boost Option"}</div>
                <div style={{fontSize:10,color:"var(--text-secondary)",marginBottom:1}}>{pendingSeasonalAction.event.actionBonus[lang]||pendingSeasonalAction.event.actionBonus.ko}</div>
                <div style={{fontSize:10,color:"#FF9F43"}}>💰 -${(pendingSeasonalAction.event.actionCost||0).toLocaleString()} · {Math.max(0,pendingSeasonalAction.expiresDay-day)}d {lang==="ko"?"남음":"left"}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                <button style={{background:money>=(pendingSeasonalAction.event.actionCost||0)?"rgba(255,217,61,0.15)":"rgba(255,255,255,0.04)",border:`2px solid ${money>=(pendingSeasonalAction.event.actionCost||0)?"rgba(255,217,61,0.6)":"rgba(255,255,255,0.10)"}`,color:money>=(pendingSeasonalAction.event.actionCost||0)?"#FFD93D":"#7788BB",borderRadius:6,padding:"3px 10px",cursor:money>=(pendingSeasonalAction.event.actionCost||0)?"pointer":"default",fontSize:10,fontWeight:700,fontFamily:"inherit",transition:"all 0.15s"}} onClick={acceptSeasonalAction}>{t("vip.accept")}</button>
                <button style={{background:"rgba(255,87,87,0.06)",border:"1px solid rgba(255,87,87,0.25)",color:"#FF5757",borderRadius:6,padding:"3px 10px",cursor:"pointer",fontSize:10,fontFamily:"inherit",transition:"all 0.15s"}} onClick={declineSeasonalAction}>{t("vip.decline")}</button>
              </div>
            </div>
          )}

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
              <button style={{background:checkVIPReq(grid,pendingVIP.req)?"rgba(0,229,160,0.12)":"rgba(255,255,255,0.04)",border:`2px solid ${checkVIPReq(grid,pendingVIP.req)?"rgba(0,229,160,0.5)":"rgba(255,255,255,0.10)"}`,color:checkVIPReq(grid,pendingVIP.req)?"#00E5A0":"#7788BB",borderRadius:6,padding:"3px 10px",cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"inherit",transition:"all 0.15s"}} onClick={acceptVIP}>{t("vip.accept")}</button>
              <button style={{background:"rgba(255,87,87,0.06)",border:"1px solid rgba(255,87,87,0.25)",color:"#FF5757",borderRadius:6,padding:"3px 10px",cursor:"pointer",fontSize:10,fontFamily:"inherit",transition:"all 0.15s"}} onClick={()=>setPendingVIP(null)}>{t("vip.decline")}</button>
            </div>
          </div>}
          </>}

          <div style={{position:"relative",flex:1,minHeight:0,overflow:"hidden"}}>
            {/* Mobile HUD corners */}
            {isMobile&&screen==="game"&&(
              <div className="mobile-hud">
                {/* Top-left: money + visitors */}
                <div className="mobile-hud-tl hud-chip-row">
                  <div className="hud-chip">
                    <span style={{fontSize:13}}>💰</span>
                    <span style={{fontSize:13,fontWeight:700,color:"#FFD93D"}}>${money>=1000?`${(money/1000).toFixed(1)}k`:money.toLocaleString()}</span>
                  </div>
                  <div className="hud-chip">
                    <span style={{fontSize:13}}>👥</span>
                    <span style={{fontSize:13,fontWeight:700,color:"#4D9FFF"}}>{visitors}</span>
                  </div>
                </div>
                {/* Top-right: speed controls */}
                <div className="mobile-hud-tr">
                  <div className="hud-chip" style={{gap:6}}>
                    {[["⏸",0],["▶",1],["⏩",2],["⚡",3]].map(([ic,sp])=>(
                      <button key={sp} onClick={()=>setSpeed(sp)} style={{background:speed===sp?"rgba(0,229,160,0.2)":"none",border:"none",color:speed===sp?"#00E5A0":"#445580",borderRadius:6,padding:"3px 5px",cursor:"pointer",fontSize:14,minWidth:28,minHeight:28}}>{ic}</button>
                    ))}
                  </div>
                </div>
                {/* Bottom-left: sat + stars + day */}
                <div className="mobile-hud-bl hud-chip-row">
                  <div className="hud-chip">
                    <span style={{fontSize:13}}>😊</span>
                    <span style={{fontSize:13,fontWeight:700,color:sat>=70?"#00E5A0":sat>=40?"#FFD93D":"#FF5757"}}>{sat}</span>
                    <span style={{fontSize:10,color:"#445580"}}>%</span>
                  </div>
                  <div className="hud-chip">
                    <span style={{fontSize:10,color:"#FFD93D"}}>{"⭐".repeat(parkRating?.stars||0)}{"☆".repeat(5-(parkRating?.stars||0))}</span>
                    <span style={{fontSize:10,color:"#6B7CA1",marginLeft:2}}>D{day}</span>
                  </div>
                </div>
                {/* Bottom-right: minimap + settings + home */}
                <div className="mobile-hud-br hud-chip-row" style={{alignItems:"flex-end"}}>
                  <button onClick={()=>setMinimapOpen(v=>!v)} className="hud-chip" style={{border:`1px solid ${minimapOpen?"rgba(0,229,160,0.4)":"rgba(120,140,255,0.18)"}`,color:minimapOpen?"#00E5A0":"#6B7CA1",cursor:"pointer",fontSize:12,background:"rgba(6,8,22,0.82)"}}>🗺️</button>
                  <button onClick={()=>setShowSettings(true)} className="hud-chip" style={{cursor:"pointer",fontSize:12,color:"#6B7CA1",background:"rgba(6,8,22,0.82)"}}>⚙️</button>
                  <button onClick={()=>{setSpeed(0);setScreen("menu");}} className="hud-chip" style={{cursor:"pointer",fontSize:12,color:"#FF6B9D",background:"rgba(6,8,22,0.82)",border:"1px solid rgba(255,107,157,0.3)"}} title={lang==="ko"?"메인으로":"Main Menu"}>🏠</button>
                </div>
              </div>
            )}
            {/* Minimap canvas (mobile) */}
            {isMobile&&minimapOpen&&(
              <div className="minimap-overlay" onClick={()=>setMinimapOpen(false)} title={lang==="ko"?"미니맵 닫기":"Close minimap"}>
                <canvas ref={el=>{
                  if(!el) return;
                  const ctx=el.getContext('2d');
                  const cw=160,ch=80;
                  el.width=cw;el.height=ch;
                  ctx.fillStyle='#070A1A';
                  ctx.fillRect(0,0,cw,ch);
                  const cSize=cw/GC;const rSize=ch/GR;
                  grid.forEach((row,r2)=>row.forEach((cell2,c2)=>{
                    if(!cell2||cell2.ref) return;
                    const bd2=B[cell2.type];
                    const col2=bd2?.cat==="ride"?"#FF6B9D":bd2?.cat==="shop"?"#FFD93D":bd2?.cat==="facility"?"#4D9FFF":bd2?.cat==="path"?"#445580":bd2?.cat==="deco"?"#00E5A0":"#8899BB";
                    ctx.fillStyle=cell2.broken?"#FF3333":col2;
                    ctx.fillRect(c2*cSize+0.5,r2*rSize+0.5,cSize-1,rSize-1);
                  }));
                }} style={{display:"block",width:160,height:80}}/>
              </div>
            )}
            <div style={{display:"grid",
              gridTemplateColumns:`repeat(${GC},1fr)`,
              gridTemplateRows:`repeat(${GR},1fr)`,
              gap:isMobile?1:2,width:"100%",height:"100%",
              background:"#020408",borderRadius:isMobile?4:10,padding:isMobile?2:4,boxSizing:"border-box",
              border:"1px solid rgba(100,120,255,0.08)",
              boxShadow:"inset 0 0 40px rgba(0,0,0,0.8), 0 0 30px rgba(0,0,0,0.6)",
              transform:`scale(${gridScale}) translate(${gridPan.x/gridScale}px,${gridPan.y/gridScale}px)`,
              transformOrigin:`${gridScaleOrigin.x}% ${gridScaleOrigin.y}%`,
              transition:'transform 0.05s linear',
              userSelect:"none"}}
              onDoubleClick={()=>{setGridScale(s=>s>=1.8?1.0:s>=1.3?1.8:1.3);setGridPan({x:0,y:0});setGridScaleOrigin({x:50,y:50});}}>
              {grid.map((row,r)=>row.map((cell,c)=>{
                // ref 셀은 명시적 위치만 잡는 투명 스페이서
                if(cell?.ref){
                  return <div key={`${r}-${c}`} style={{gridColumn:c+1,gridRow:r+1,pointerEvents:"none"}} onClick={()=>handleGridClick(r,c)} onMouseEnter={()=>setHovered({r,c})} onMouseLeave={()=>setHovered(null)}/>;
                }

                const owned=ownedGrid[r][c];
                const obstacle=obstacleMap[`${r},${c}`];
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
                                   (tutorialStep===3&&!cell&&owned)||
                                   (tutorialStep===8&&!cell&&owned&&!zone);
                const isDemolishHov=buildMode==="demolish"&&hovered?.r===r&&hovered?.c===c&&cell&&owned;
                const isMultiSelected=buildMode==="demolish"&&multiSelectedCells.has(`${r},${c}`);
                const isCongested=congestedCells.has(`${r},${c}`);
                const isRightBoundary=owned&&c+bw<GC&&!ownedGrid[r][c+bw];
                const isNextBuyable=!owned&&gameMode!=="sandbox"&&((c>0&&ownedGrid[r][c-1])||(c<GC-1&&ownedGrid[r][c+1]));

                const OBS_STYLE={rock:{bg:"rgba(70,50,30,0.55)",bd:"rgba(120,90,55,0.6)",emoji:"🪨"},water:{bg:"rgba(10,70,180,0.40)",bd:"rgba(40,130,255,0.55)",emoji:"💧"},rubble:{bg:"rgba(90,80,60,0.50)",bd:"rgba(140,120,90,0.5)",emoji:"🧱"},deadtree:{bg:"rgba(25,55,15,0.50)",bd:"rgba(40,90,25,0.5)",emoji:"🌵"}};
                let bg="#0C1028";
                if(!owned) bg="#050710";
                else if(obstacle) bg=OBS_STYLE[obstacle.type]?.bg||"rgba(60,60,40,0.4)";
                else if(broken) bg="linear-gradient(135deg,rgba(255,87,87,0.22),rgba(255,87,87,0.06))";
                else if(isPath) bg=isFancy?"linear-gradient(135deg,#241C08,#1A1408)":"linear-gradient(135deg,#1A1208,#100C05)";
                else if(isEntrance) bg="linear-gradient(135deg,rgba(255,217,61,0.18),rgba(255,159,67,0.10))";
                else if(cell) bg=cell.level>=2?`linear-gradient(135deg,${bd.color}44,${bd.color}18)`:cell.level>=1?`linear-gradient(135deg,${bd.color}38,${bd.color}14)`:`linear-gradient(135deg,${bd.color}28,${bd.color}0E)`;
                else if(zone) bg=ZONES[zone]?.bg||"#0C0F22";
                else if(isInFootprint&&selected) bg=hovFootprintValid?"rgba(0,229,160,0.12)":"rgba(255,87,87,0.12)";
                else bg="#0C1028";
                if(isMultiSelected) bg="rgba(255,87,87,0.25)";

                let borderCol="rgba(255,255,255,0.04)";
                if(!owned) borderCol="rgba(255,255,255,0.02)";
                else if(obstacle) borderCol=OBS_STYLE[obstacle.type]?.bd||"rgba(100,90,60,0.5)";
                else if(isSel) borderCol="#FFD93D";
                else if(isDemolishHov) borderCol="#FF5757";
                else if(broken) borderCol="rgba(255,87,87,0.5)";
                else if(tutHighlight) borderCol="#FFD93D";
                else if(isPath) borderCol=isFancy?"rgba(212,175,55,0.4)":"rgba(139,115,85,0.3)";
                else if(isEntrance) borderCol="rgba(255,217,61,0.5)";
                else if(isolated) borderCol="rgba(255,87,87,0.75)";
                else if(cell) borderCol=cell.level>=2?bd.color+"AA":cell.level>=1?bd.color+"77":bd.color+"55";
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
                    cursor:owned?(obstacle&&selected?"not-allowed":buildMode==="demolish"&&cell?"crosshair":"pointer"):isNextBuyable?"pointer":"default",
                    transition:"border-color 0.12s,background 0.12s",
                    minHeight:0,overflow:"hidden",position:"relative",
                    background:isNextBuyable?"rgba(77,159,255,0.04)":bg,
                    boxShadow:isSel?`0 0 0 2px #FFD93D, 0 0 16px rgba(255,217,61,0.4)`:isRightBoundary?"4px 0 8px rgba(168,216,234,0.15)":broken?"0 0 8px rgba(255,87,87,0.3)":isDemolishHov?"0 0 8px rgba(255,87,87,0.4)":isCongested?"0 0 0 2px rgba(255,159,67,0.5),0 0 8px rgba(255,159,67,0.3)":isEntrance&&!broken?`0 0 14px rgba(255,217,61,0.3), inset 0 0 14px rgba(255,217,61,0.08)`:cell&&!broken&&!isPath?(cell.level>=2?`0 0 12px ${bd.color}77, inset 0 0 12px ${bd.color}33`:cell.level>=1?`0 0 7px ${bd.color}55, inset 0 0 10px ${bd.color}22`:`0 0 5px ${bd.color}33, inset 0 0 8px ${bd.color}14`):"none",
                    opacity:!owned?0.12:1}}
                  onMouseDown={(e)=>{
                    if(e.button!==0) return;
                    const isSingle=(B[selected]?.size?.w||1)===1&&(B[selected]?.size?.h||1)===1;
                    if(buildMode==="build"&&selected&&isSingle){
                      dragBuildRef.current={active:true,mode:"build",selected,moved:false,startR:r,startC:c};
                    } else if(buildMode==="demolish"){
                      dragBuildRef.current={active:true,mode:"demolish",moved:false,startR:r,startC:c};
                    }
                  }}
                  onClick={(e)=>{
                    if(dragBuildRef.current.moved&&buildMode==="demolish") return;
                    handleGridClick(r,c);
                  }}
                  onMouseEnter={()=>{
                    setHovered({r,c});
                    if(dragBuildRef.current.active&&(r!==dragBuildRef.current.startR||c!==dragBuildRef.current.startC)){
                      dragBuildRef.current.moved=true;
                      handleDragEnter(r,c);
                    }
                  }}
                  onMouseLeave={()=>setHovered(null)}>

                  {/* Build preview icon at hover origin cell */}
                  {isInFootprint&&selected&&hovered?.r===r&&hovered?.c===c&&!cell&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",opacity:0.6,pointerEvents:"none",zIndex:4}}>
                    {hasBuildingIcon(selected)?getBuildingIcon(selected,hovFootprintValid?"#00E5A0":"#FF5757",Math.min(32,Math.max(14,Math.floor(gridScale*(selBd?.size?.w||1)*14)))):B[selected]?.emoji||"🏗️"}
                  </div>}
                  {/* Mobile placement preview ghost */}
                  {placementPreview&&placementPreview.r===r&&placementPreview.c===c&&<div style={{position:"absolute",inset:0,borderRadius:4,border:"2px solid rgba(0,229,160,0.8)",boxShadow:"0 0 12px rgba(0,229,160,0.5)",animation:"pulse-glow 1s ease-in-out infinite",zIndex:5,pointerEvents:"none",background:"rgba(0,229,160,0.08)"}}/>}
                  {!owned&&isNextBuyable&&<span style={{fontSize:10,opacity:0.6,color:"#4D9FFF"}}>🔓</span>}
                  {!owned&&!isNextBuyable&&<span style={{fontSize:10,opacity:0.5,color:"#333355"}}>▪</span>}

                  {owned&&obstacle&&<>
                    <div style={{position:"absolute",inset:0,borderRadius:4,background:OBS_STYLE[obstacle.type]?.bg,opacity:0.7}}/>
                    <span style={{position:"relative",zIndex:2,fontSize:14,filter:"drop-shadow(0 1px 3px rgba(0,0,0,0.9))"}}>{OBS_STYLE[obstacle.type]?.emoji||"⛰️"}</span>
                    {isInFootprint&&selected&&<div style={{position:"absolute",inset:0,borderRadius:4,background:"rgba(255,87,87,0.25)",zIndex:3}}/>}
                  </>}

                  {owned&&!obstacle&&isPath&&<>
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
                    <div style={{position:"relative",zIndex:2}}>
                      {hasBuildingIcon(cell.type)
                        ? getBuildingIcon(cell.type, "#FFD93D", 36)
                        : <span style={{fontSize:28,lineHeight:1}}>{bd.levelEmoji?.[cell.level]??bd.emoji}</span>}
                    </div>
                    {cell.level>0&&<div style={{position:"absolute",top:1,right:1,fontSize:10,color:"#FFD93D",fontWeight:900,zIndex:3,textShadow:"0 0 4px #FFD93D"}}>{"★".repeat(cell.level)}</div>}
                  </>}

                  {owned&&cell&&!isPath&&!isEntrance&&<>
                    {zone&&<div style={{position:"absolute",inset:0,background:ZONES[zone]?.color,borderRadius:4,opacity:0.1}}/>}
                    {/* 2-5: 대형 건물 배경 그라데이션 */}
                    {bw>=3&&!broken&&<>
                      <div style={{position:"absolute",inset:0,borderRadius:4,background:`radial-gradient(circle at 50% 50%,${bd.color}28 0%,transparent 70%)`,zIndex:1}}/>
                      <div style={{position:"absolute",inset:0,borderRadius:4,background:`linear-gradient(135deg,${bd.color}14 0%,transparent 50%,${bd.color}0A 100%)`,zIndex:1}}/>
                    </>}
                    <div style={{
                      position:"relative",zIndex:2,
                      opacity:broken?0.25:isDemolishHov?0.5:1,
                      filter:broken?"grayscale(1)":"none",
                      transition:"opacity 0.1s,filter 0.1s",
                      animation:!broken?({carousel:"carousel-spin 4s linear infinite",fountain:"fountain-wave 1.8s ease-in-out infinite",rollerCoaster:"roller-shake 0.35s ease-in-out infinite"}[cell.type]||undefined):undefined,
                    }}>
                      {hasBuildingIcon(cell.type)
                        ? getBuildingIcon(cell.type, bd.color, bw>=3?46:bw>=2?38:cell.level>=2?34:30)
                        : <span style={{fontSize:bw>=3?34:bw>=2?28:cell.level>=2?24:22,lineHeight:1}}>{bd.levelEmoji?.[cell.level]??bd.emoji}</span>}
                    </div>
                    {/* 건물 타입 색상 하단 바 */}
                    {!broken&&<div style={{position:"absolute",bottom:0,left:"10%",right:"10%",height:2,borderRadius:"0 0 1px 1px",background:bd.color,opacity:cell.level>=2?0.85:cell.level>=1?0.65:0.45,zIndex:3}}/>}
                    {cell.level>0&&!broken&&<div style={{position:"absolute",top:2,right:3,fontSize:11,color:"#FFD93D",lineHeight:1.2,fontWeight:900,zIndex:3,textShadow:"0 0 3px #000"}}>{cell.level===2?"★★":"★"}</div>}
                    {bw>=3&&!broken&&<div style={{position:"absolute",top:2,left:3,fontSize:8,color:bd.color,opacity:0.7,fontWeight:700,zIndex:3,fontFamily:"'Barlow Condensed',monospace",lineHeight:1}}>{bw}×{bh}</div>}
                    {broken&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:bw>=2?18:14,zIndex:3,background:"rgba(0,0,0,0.4)",borderRadius:4}}>🔧</div>}
                    {isolated&&!broken&&<>
                      <div style={{position:"absolute",inset:0,borderRadius:4,border:"2px solid rgba(255,87,87,0.7)",zIndex:3,pointerEvents:"none",animation:"pulse-glow 2s ease-in-out infinite"}}/>
                      <div style={{position:"absolute",bottom:0,left:0,right:0,background:"rgba(255,87,87,0.82)",borderRadius:"0 0 3px 3px",zIndex:4,textAlign:"center",fontSize:8,fontWeight:700,color:"#fff",lineHeight:"14px",letterSpacing:0.5}}>{lang==="ko"?"통로없음":"No path"}</div>
                    </>}
                    {ridePrices[cell.type]&&pricingMode!=="admission"&&!broken&&<div style={{position:"absolute",top:2,left:3,fontSize:9,color:"#FF9FF3",lineHeight:1.2,zIndex:3,textShadow:"0 0 2px #000"}}>${ridePrices[cell.type]}</div>}
                    {isDemolishHov&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:bw>=2?20:14,zIndex:4,background:"rgba(255,50,50,0.15)",borderRadius:4}}>🔨</div>}
                    {isCongested&&!broken&&<div style={{position:"absolute",top:2,right:2,fontSize:12,zIndex:5,lineHeight:1,filter:"drop-shadow(0 0 2px #000)"}}>🚶</div>}
                  </>}

                  {owned&&zone&&!cell&&<>
                    <div style={{position:"absolute",inset:0,borderRadius:4,background:ZONES[zone]?.color,opacity:0.15,pointerEvents:"none"}}/>
                    <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,opacity:0.45,pointerEvents:"none"}}>{ZONES[zone]?.emoji}</div>
                  </>}
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
                  {buildParticles.filter(p=>p.r===r&&p.c===c&&p.label).map(p=>(
                    <div key={`lbl-${p.id}`} style={{position:"absolute",top:"20%",left:"50%",transform:"translateX(-50%)",fontSize:10,fontWeight:900,color:"#FFD93D",textShadow:"0 0 6px #000",whiteSpace:"nowrap",zIndex:35,animation:"float-up 0.8s ease-out forwards",pointerEvents:"none"}}>{p.label}</div>
                  ))}
                </div>);
              }))}
            </div>

            {/* 주야간 오버레이 — s7 야간 공포 분위기 */}
            {screen==="game"&&nightPhase&&(
              <div style={{position:"absolute",inset:0,borderRadius:10,zIndex:6,pointerEvents:"none",background:"rgba(0,0,20,0.40)",transition:"background 1.5s ease"}}/>
            )}

            {/* 날씨 비주얼 오버레이 */}
            {screen==="game"&&(weather.id==="rainy"||weather.id==="stormy"||weather.id==="foggy"||weather.id==="rainbow")&&(
              <div style={{position:"absolute",inset:0,borderRadius:10,zIndex:7,pointerEvents:"none",overflow:"hidden"}}>
                {(weather.id==="rainy"||weather.id==="stormy")&&<>
                  {weatherParticles.map(p=>(
                    <div key={p.id} style={{position:"absolute",top:0,left:`${p.x}%`,width:weather.id==="stormy"?1.5:1,height:weather.id==="stormy"?20:13,background:weather.id==="stormy"?"rgba(160,210,255,0.6)":"rgba(100,160,255,0.42)",borderRadius:1,animation:`rain-fall ${p.dur}s linear ${p.delay}s infinite`}}/>
                  ))}
                  {weather.id==="stormy"&&<div style={{position:"absolute",inset:0,background:"rgba(0,10,50,0.18)",animation:"lightning 5s ease-in-out 1.5s infinite"}}/>}
                </>}
                {weather.id==="foggy"&&<>
                  <div style={{position:"absolute",inset:0,background:"rgba(160,180,230,0.09)",animation:"fog-drift 8s ease-in-out infinite"}}/>
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(140,170,220,0.10) 0%,transparent 60%)"}}/>
                </>}
                {weather.id==="rainbow"&&<div style={{position:"absolute",inset:0,background:"linear-gradient(130deg,rgba(255,80,80,0.07) 0%,rgba(255,180,40,0.06) 18%,rgba(255,240,50,0.05) 34%,rgba(60,230,120,0.06) 50%,rgba(50,140,255,0.06) 68%,rgba(160,60,255,0.05) 100%)",animation:"rainbow-glow 3s ease-in-out infinite"}}/>}
              </div>
            )}

            {/* 미션 달성 flash */}
            {missionFlash&&<div style={{position:"absolute",inset:0,pointerEvents:"none",borderRadius:10,border:"3px solid #FFD93D",boxShadow:"0 0 30px rgba(255,217,61,0.5), inset 0 0 30px rgba(255,217,61,0.1)",zIndex:20,animation:"pulse-glow 0.8s ease"}}/>}
            {/* 스테이지 업 flash */}
            {stageUpFlash&&<div style={{position:"absolute",inset:0,pointerEvents:"none",borderRadius:10,
              border:`3px solid ${currentStage.color}`,
              boxShadow:`0 0 60px ${currentStage.color}88, 0 0 120px ${currentStage.color}44, inset 0 0 40px ${currentStage.color}22`,
              zIndex:20,display:"flex",alignItems:"center",justifyContent:"center",
              background:`radial-gradient(ellipse at center, ${currentStage.color}08 0%, transparent 70%)`}}>
              <div style={{textAlign:"center",animation:"building-appear 0.4s cubic-bezier(0.34,1.56,0.64,1)"}}>
                <div style={{fontSize:36,marginBottom:4,filter:`drop-shadow(0 0 12px ${currentStage.color})`}}>{currentStage.emoji}</div>
                <div style={{background:"rgba(0,0,0,0.88)",borderRadius:14,padding:"10px 24px",
                  fontSize:9,letterSpacing:4,color:currentStage.color,fontWeight:800,
                  textTransform:"uppercase",marginBottom:6,
                  boxShadow:`0 0 30px ${currentStage.color}55, 0 4px 20px rgba(0,0,0,0.9)`}}>
                  {lang==="ko"?"⬆ 단계 상승":"⬆ STAGE UP"}
                </div>
                <div style={{background:"rgba(0,0,0,0.92)",borderRadius:12,padding:"8px 20px",
                  fontSize:18,fontWeight:900,color:currentStage.color,
                  boxShadow:`0 4px 24px rgba(0,0,0,0.9)`,fontFamily:"'Barlow Condensed',monospace",
                  letterSpacing:2,border:`1px solid ${currentStage.color}44`}}>
                  {currentStage.name[lang]||currentStage.name.ko}
                </div>
              </div>
            </div>}
            {/* 메달 획득 flash */}
            {medalFlash&&<div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:21,display:"flex",alignItems:"center",justifyContent:"center",animation:"building-appear 0.35s cubic-bezier(0.34,1.56,0.64,1)"}}>
              <div style={{textAlign:"center",background:"radial-gradient(ellipse at center, rgba(255,217,61,0.15) 0%, transparent 70%)",borderRadius:20,padding:"20px 30px"}}>
                <div style={{fontSize:72,filter:"drop-shadow(0 0 20px rgba(255,217,61,0.8))",animation:"float 1.5s ease-in-out infinite"}}>{medalFlash}</div>
                <div style={{fontSize:14,fontWeight:900,color:"#FFD93D",letterSpacing:3,textTransform:"uppercase",fontFamily:"'Barlow Condensed',sans-serif",textShadow:"0 0 20px rgba(255,217,61,0.8)"}}>CLEAR!</div>
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
                background:"rgba(5,6,20,0.93)",
                border:"2px solid rgba(255,209,61,0.5)",
                borderRadius:14, padding:"16px 24px",
                textAlign:"center", zIndex:20, pointerEvents:"none",
                backdropFilter:"blur(8px)",
                boxShadow:"0 8px 32px rgba(0,0,0,0.7)",
                minWidth:200,
              }}>
                <div style={{fontSize:32, marginBottom:6}}>{visitorZeroReason.emoji}</div>
                <div style={{fontSize:9, color:"#7788BB", letterSpacing:2, textTransform:"uppercase", marginBottom:4}}>
                  {lang==="ko"?"방문객 없음 — 원인":"NO VISITORS — REASON"}
                </div>
                <div style={{fontSize:12, color:"#FFD93D", fontWeight:700, lineHeight:1.5}}>{visitorZeroReason.msg}</div>
              </div>
            )}
            {firstVisitorCelebration&&(
              <div style={{
                position:"absolute",inset:0,zIndex:40,pointerEvents:"none",
                display:"flex",alignItems:"center",justifyContent:"center",
                background:"rgba(0,0,0,0.55)",
                borderRadius:6,
                animation:"pulse 0.5s ease",
              }}>
                {/* confetti dots */}
                {[...Array(12)].map((_,i)=>(
                  <div key={i} style={{position:"absolute",width:8,height:8,borderRadius:"50%",background:["#FFD93D","#00E5A0","#FF6B9D","#4D9FFF","#FF9F43"][i%5],left:`${10+i*7}%`,top:`${15+Math.sin(i)*20}%`,animation:`float-up ${1.5+i*0.3}s ease-out forwards`,opacity:0.9,animationDelay:`${i*0.1}s`}}/>
                ))}
                <div style={{textAlign:"center",animation:"slide-in 0.4s ease",background:"linear-gradient(135deg,rgba(13,18,53,0.97),rgba(8,11,32,0.97))",border:"2px solid rgba(255,217,61,0.6)",borderRadius:16,padding:"20px 32px",boxShadow:"0 8px 40px rgba(255,217,61,0.3),0 0 80px rgba(255,217,61,0.1)"}}>
                  <div style={{fontSize:52,marginBottom:10,filter:"drop-shadow(0 0 24px rgba(255,217,61,1))"}}>🎊</div>
                  <div style={{
                    fontSize:26,fontWeight:900,color:"#FFD93D",
                    textShadow:"0 0 30px rgba(255,217,61,0.8)",
                    fontFamily:"'Barlow Condensed',sans-serif",
                    letterSpacing:3,marginBottom:6,
                  }}>
                    {lang==="ko"?"공원 오픈!":"PARK OPEN!"}
                  </div>
                  <div style={{fontSize:13,color:"#00E5A0",fontWeight:700,marginBottom:4}}>
                    {lang==="ko"?`첫 방문객 ${visitors}명이 도착했습니다! 🎉`:`${visitors} visitor${visitors!==1?"s":""} just arrived! 🎉`}
                  </div>
                  <div style={{fontSize:10,color:"#7788BB",marginTop:4}}>{lang==="ko"?"🎵 파크 오픈 사운드":"🎵 Park open!"}</div>
                </div>
              </div>
            )}
            {visitors>0&&<div style={{position:"absolute",inset:3,pointerEvents:"none",overflow:"hidden",borderRadius:6}}>
              {dots.slice(0,Math.min(40,Math.max(4,Math.round(visitors/4)))).map(dot=>{
                const isSimple=visitors<20;
                const dotColors=["#4D9FFF","#00E5A0","#FFD93D","#FF9F43","#FF6B9D"];
                return(<div key={dot.id} style={{position:"absolute",left:`${(dot.c/GC)*100}%`,top:`${(dot.r/GR)*100}%`,width:`${(1/GC)*100}%`,height:`${(1/GR)*100}%`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:isSimple?9:11,transition:"left 1.1s ease,top 1.1s ease",filter:"drop-shadow(0 2px 4px rgba(0,0,0,1))",zIndex:5,animation:`visitor-wander ${3+dot.id%3}s ease-in-out infinite`,animationDelay:`${(dot.id*0.4)%3}s`}}>
                  {isSimple?<span style={{color:dotColors[dot.id%dotColors.length],fontSize:8}}>●</span>:dot.emoji}
                </div>);
              })}
              {gridPopups.filter(p=>p.expires>Date.now()).map(p=>(
                <div key={p.id} style={{position:"absolute",left:`${(p.c/GC)*100}%`,top:`${(p.r/GR)*100}%`,color:p.color,fontSize:14,fontWeight:900,animation:"float-up 2.8s ease-out forwards",pointerEvents:"none",zIndex:20,whiteSpace:"nowrap",textShadow:`0 0 8px ${p.color},0 2px 8px rgba(0,0,0,0.95)`,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.5}}>{p.text}</div>
              ))}
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

            {tutorialStep>0&&tutorialStep<=6&&screen==="game"&&(
              <>
                {/* 배경 오버레이 */}
                <div style={{position:isMobile?"fixed":"absolute",inset:0,zIndex:isMobile?240:25,pointerEvents:"none",
                  background:tutorialStep===6?"rgba(0,0,0,0.75)":"rgba(0,0,0,0.38)",borderRadius:isMobile?0:6,transition:"background 0.5s"}}/>
                {/* 단계 완료 flash */}
                {tutFlash&&<div style={{position:"absolute",inset:0,zIndex:26,pointerEvents:"none",borderRadius:6,
                  background:"rgba(0,229,160,0.20)",animation:"build-flash 0.5s ease-out forwards"}}/>}

                {/* ── 완료 화면 (step 6) ── */}
                {tutorialStep===6?(
                  <div style={{position:isMobile?"fixed":"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
                    background:"linear-gradient(135deg,#0D1535,#080B20)",border:"2px solid #00E5A088",
                    borderRadius:18,padding:isMobile?"20px 20px 16px":"28px 28px 22px",zIndex:isMobile?250:30,
                    minWidth:isMobile?Math.min(window.innerWidth-32,300):280,maxWidth:isMobile?Math.min(window.innerWidth-24,340):360,textAlign:"center",
                    boxShadow:"0 12px 60px rgba(0,0,0,0.95),0 0 0 1px rgba(0,229,160,0.2)",
                    animation:"slide-in 0.4s ease",pointerEvents:"auto"}}>
                    <div style={{fontSize:50,marginBottom:8,filter:"drop-shadow(0 0 14px rgba(0,229,160,0.6))"}}>🎊</div>
                    <div style={{fontSize:17,fontWeight:900,color:"#00E5A0",marginBottom:6}}>
                      {lang==="ko"?"튜토리얼 완료!":"Tutorial Complete!"}
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:14,textAlign:"left"}}>
                      {(lang==="ko"
                        ?["🎪 입구 게이트 배치","🛤️ 통로 연결","🎡 놀이기구 건설","▶ 첫 방문객 입장","🧹 직원 고용"]
                        :["🎪 Placed Entrance","🛤️ Connected Paths","🎡 Built a Ride","▶ First Visitor!","🧹 Hired Staff"]
                      ).map(s=>(
                        <div key={s} style={{fontSize:10,color:"#00E5A0",display:"flex",alignItems:"center",gap:6}}>
                          <span style={{fontSize:12}}>✓</span>{s}
                        </div>
                      ))}
                    </div>
                    <div style={{fontSize:10,color:"#7788BB",lineHeight:1.6,marginBottom:16}}>
                      {lang==="ko"?"이제 시나리오 모드에서 실전 목표에 도전해보세요! 🏆\n더 많은 기능은 직접 탐험하며 발견하세요.":"Now try Scenario mode for real challenges! 🏆\nExplore the rest — research, zones, marketing — on your own."}
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      <button onClick={()=>{try{localStorage.setItem('pt_tut_done','1');}catch{}setTutDone(true);setMoney(m=>m+1000);addLog(lang==="ko"?"🎓 튜토리얼 완료 보너스 +$1,000!":"🎓 Tutorial bonus +$1,000!");setTutorialStep(0);}}
                        style={{background:"rgba(0,229,160,0.18)",border:"2px solid rgba(0,229,160,0.6)",
                          color:"#00E5A0",borderRadius:10,padding:"10px 20px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit"}}>
                        {lang==="ko"?"✓ +$1,000 보너스 받고 계속하기":"✓ Claim +$1,000 Bonus & Continue"}
                      </button>
                      <button onClick={()=>{try{localStorage.setItem('pt_tut_done','1');}catch{}setTutDone(true);setMoney(m=>m+1000);addLog(lang==="ko"?"🎓 튜토리얼 완료 보너스 +$1,000!":"🎓 Tutorial bonus +$1,000!");setTutorialStep(0);setScreen("menu");}}
                        style={{background:"rgba(155,127,255,0.12)",border:"1px solid rgba(155,127,255,0.4)",
                          color:"#9B7FFF",borderRadius:10,padding:"8px 20px",cursor:"pointer",fontSize:10,fontWeight:700,fontFamily:"inherit"}}>
                        {lang==="ko"?"🏆 시나리오 모드 도전하기":"🏆 Go to Scenario Mode"}
                      </button>
                    </div>
                  </div>
                ):(
                  /* ── 일반 단계 카드 (steps 1-5) ── */
                  <div style={{
                    position:isMobile?"fixed":"absolute",
                    ...(isMobile
                      ? (bottomSheetOpen ? {top:68} : {bottom:64+tutCardOffsetY})
                      : {bottom:16}),
                    left:"50%",transform:"translateX(-50%)",
                    background:"linear-gradient(135deg,#0D1535,#080B20)",border:"2px solid #FFD93D88",
                    borderRadius:14,padding:isMobile?"10px 14px":"14px 20px",
                    zIndex:isMobile?250:30,
                    minWidth:isMobile?Math.min(window.innerWidth-32,300):270,maxWidth:isMobile?Math.min(window.innerWidth-24,340):350,
                    boxShadow:"0 8px 40px rgba(0,0,0,0.9),0 0 0 1px rgba(255,217,61,0.15)",
                    animation:tutCardOffsetY===0?"slide-in 0.3s ease":"none",pointerEvents:"auto",
                    touchAction:"none"}}
                    onTouchStart={isMobile?(e)=>{
                      tutCardDragRef.current={active:true,startY:e.touches[0].clientY,startOffset:tutCardOffsetY};
                    }:undefined}
                    onTouchMove={isMobile?(e)=>{
                      if(!tutCardDragRef.current.active) return;
                      const dy=tutCardDragRef.current.startY-e.touches[0].clientY; // positive = dragged up
                      const next=Math.max(-60,Math.min(window.innerHeight-200,tutCardDragRef.current.startOffset+dy));
                      setTutCardOffsetY(next);
                      e.stopPropagation();
                    }:undefined}
                    onTouchEnd={isMobile?()=>{tutCardDragRef.current.active=false;}:undefined}>
                    {/* 드래그 핸들 (모바일) */}
                    {isMobile&&<div style={{display:"flex",justifyContent:"center",marginBottom:8,marginTop:-4,cursor:"grab"}}>
                      <div style={{width:32,height:4,borderRadius:99,background:"rgba(255,217,61,0.35)"}}/>
                    </div>}

                    {/* 페이즈 라벨 + progress dots */}
                    <div style={{marginBottom:10}}>
                      {(()=>{
                        const phases=[
                          {label:lang==="ko"?"🏗️ 건설":"🏗️ Build",steps:[1,2,3],color:"#64B5F6"},
                          {label:lang==="ko"?"🎪 개장":"🎪 Open",steps:[4],color:"#FFD93D"},
                          {label:lang==="ko"?"⚙️ 운영":"⚙️ Ops",steps:[5],color:"#00E5A0"},
                        ];
                        const curPhase=phases.find(p=>p.steps.includes(tutorialStep));
                        return(
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,padding:"0 2px"}}>
                            {phases.map(ph=>(
                              <div key={ph.label} style={{fontSize:8,color:ph===curPhase?ph.color:"#2A3A5A",fontWeight:ph===curPhase?800:400,transition:"all 0.3s"}}>
                                {ph.label}
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                      <div style={{display:"flex",alignItems:"center",gap:5}}>
                        <div style={{display:"flex",gap:3,flex:1}}>
                          {[1,2,3,4,5].map(i=>(
                            <div key={i} style={{flex:i===tutorialStep?2:1,height:5,borderRadius:99,
                              background:i<tutorialStep?"#00E5A0":i===tutorialStep?"#FFD93D":"#1A2040",
                              transition:"all 0.3s",
                              boxShadow:i===tutorialStep?"0 0 5px #FFD93D":i<tutorialStep?"0 0 3px #00E5A0":"none"}}/>
                          ))}
                        </div>
                        <span style={{fontSize:9,color:"#7788BB",flexShrink:0}}>{tutorialStep}/5</span>
                      </div>
                    </div>

                    {/* 단계 내용 */}
                    {(()=>{
                      const needsTabVisit=false;
                      const canNext=true;

                      const step4Obj=(()=>{
                        if(speed===0) return {emoji:"▶",
                          title:lang==="ko"?"[4/5] 시간 시작":"[4/5] Start Time",
                          target:lang==="ko"?"↗ 우상단 ▶ 버튼 클릭":"↗ Click ▶ button (top right)",
                          desc:lang==="ko"?"우상단 ▶ 버튼을 눌러 시간을 시작하세요!\n⏩ 빨리감기로 속도를 높일 수 있어요.\n방문객이 들어오면 자동으로 다음 단계!":"Click ▶ at the top right to start time!\nUse ⏩ to speed things up.\nVisitors arriving = next step auto-starts!"};
                        if(visitors===0) return {emoji:"⏩",
                          title:lang==="ko"?"[4/5] 첫 방문객 기다리는 중":"[4/5] Waiting for Visitors",
                          target:lang==="ko"?"↗ ⏩ 버튼으로 빨리감기":"↗ Use ⏩ to fast-forward",
                          desc:lang==="ko"?"시간이 흐르고 있어요! ⏩ 빨리감기를 써보세요.\n방문객이 입장하는 순간 자동으로 다음 단계!\n수익 사이클이 시작됩니다 📈":"Time is running! Try ⏩ to speed up.\nThe moment a visitor enters, next step starts!\nWatch the revenue cycle begin 📈"};
                        return {emoji:"🎉",
                          title:lang==="ko"?"[4/5] 방문객 입장!":"[4/5] Visitors Arriving!",
                          target:lang==="ko"?"자동 진행 중…":"Auto-advancing…",
                          desc:lang==="ko"?"방문객이 들어왔어요! 수익이 발생 중입니다 💰\n잠시 후 자동으로 다음 단계로 넘어갑니다.":"Visitors are here! Revenue is flowing 💰\nNext step begins shortly."};
                      })();

                      const allSteps=[
                        /* 1 */ {emoji:"🎪",
                          title:lang==="ko"?"[1/5] 입구 게이트 배치":"[1/5] Place Entrance Gate",
                          target:lang==="ko"?"← 건설 탭 선택 후 배치":"← Build tab → place on grid",
                          desc:lang==="ko"?"🎪 입구 게이트를 선택해 노란 칸에 배치하세요.\n입구가 없으면 방문객이 들어올 수 없어요!":"Select 🎪 Entrance Gate and click a highlighted cell.\nNo entrance = no visitors!"},
                        /* 2 */ {emoji:"🛤️",
                          title:lang==="ko"?"[2/5] 통로 연결":"[2/5] Connect with Paths",
                          target:lang==="ko"?"← 건설 탭 → 통로 선택":"← Build tab → select Path",
                          desc:lang==="ko"?"입구 옆 칸에 통로를 놓으세요.\n통로 없이는 방문객이 놀이기구에 못 가요.\n드래그하면 여러 개를 한 번에 놓을 수 있어요!":"Place paths next to the entrance.\nVisitors need paths to reach rides.\nDrag to place multiple at once!"},
                        /* 3 */ {emoji:"🎡",
                          title:lang==="ko"?"[3/5] 놀이기구 배치":"[3/5] Add a Ride",
                          target:lang==="ko"?"← 건설 탭 → 관람차/회전목마":"← Build tab → Ferris Wheel / Carousel",
                          desc:lang==="ko"?"통로 옆에 놀이기구를 배치하세요.\n관람차·회전목마부터 시작해보세요.\n다양한 종류일수록 더 많은 방문객이 와요!":"Place a ride next to a path.\nStart with the Ferris Wheel or Carousel.\nVariety attracts more visitor types!"},
                        /* 4 */ step4Obj,
                        /* 5 */ {emoji:"🧹",
                          title:lang==="ko"?"[5/5] 직원 고용":"[5/5] Hire Staff",
                          target:lang==="ko"?"← ⚙️ 경영 탭 클릭":"← Click ⚙️ Manage tab",
                          desc:lang==="ko"?"⚙️ 경영 탭에서 직원을 고용하세요.\n🧹 청소부: 청결도 유지\n🔧 정비공: 놀이기구 수리\n직원 없이는 만족도가 떨어져요!":"⚙️ Manage tab → Hire Staff.\n🧹 Janitor keeps the park clean.\n🔧 Mechanic fixes broken rides.\nNo staff = dropping satisfaction!"},
                      ];

                      const steps=allSteps[Math.min(tutorialStep-1, allSteps.length-1)];
                      return(
                        <>
                          <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:8}}>
                            <div style={{fontSize:24,filter:"drop-shadow(0 0 8px rgba(255,217,61,0.6))",flexShrink:0,marginTop:2}}>{steps.emoji}</div>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:11,fontWeight:900,color:"#FFD93D",lineHeight:1.2,marginBottom:4}}>{steps.title}</div>
                              {/* 시각적 목표 인디케이터 — 펄싱 pill */}
                              <div style={{display:"inline-flex",alignItems:"center",gap:4,
                                background:"rgba(255,217,61,0.10)",border:"1px solid rgba(255,217,61,0.35)",
                                borderRadius:20,padding:"2px 9px",
                                fontSize:9,color:"#FFD93D",fontWeight:700,
                                animation:"pulse 2s infinite"}}>
                                📍 {steps.target}
                              </div>
                            </div>
                          </div>
                          <div style={{fontSize:10,color:"#8899CC",lineHeight:1.7,whiteSpace:"pre-line",marginBottom:12}}>{steps.desc}</div>
                          {/* 행동 미완료 시 안내 배너 */}
                          {needsTabVisit&&!tutTabVisited&&(
                            <div style={{background:"rgba(255,217,61,0.08)",border:"1px solid rgba(255,217,61,0.3)",borderRadius:6,padding:"5px 10px",marginBottom:8,fontSize:9,color:"#FFD93DAA",textAlign:"center",animation:"pulse 2s infinite"}}>
                              {tutorialStep===6
                                ?(lang==="ko"?"⚙️ 경영 탭 입장료 ＋/－ 버튼을 눌러야 다음으로 진행됩니다":"Press ＋/－ on admission fee in Manage tab to continue")
                                :(lang==="ko"?"📣 캠페인 '실행' 버튼을 눌러야 다음으로 진행됩니다":"Click '실행' in Marketing tab to continue")}
                            </div>
                          )}
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                            <button onClick={()=>{try{localStorage.setItem('pt_tut_done','1');}catch{}setTutDone(true);setTutorialStep(0);}}
                              style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",
                                color:"#6B7CA1",borderRadius:8,padding:"5px 12px",cursor:"pointer",fontSize:9,fontFamily:"inherit"}}>
                              {lang==="ko"?"건너뛰기":"Skip"}
                            </button>
                            <button
                              disabled={!canNext}
                              onClick={()=>{if(canNext) setTutorialStep(s=>Math.min(s+1,6));}}
                              style={{background:canNext?"rgba(255,217,61,0.15)":"rgba(255,255,255,0.04)",
                                border:`1px solid ${canNext?"rgba(255,217,61,0.5)":"rgba(255,255,255,0.12)"}`,
                                color:canNext?"#FFD93D":"#3A4A6A",borderRadius:8,padding:"5px 16px",
                                cursor:canNext?"pointer":"not-allowed",fontSize:10,fontWeight:700,fontFamily:"inherit",transition:"all 0.2s"}}
                              onMouseEnter={e=>canNext&&(e.currentTarget.style.background="rgba(255,217,61,0.25)")}
                              onMouseLeave={e=>canNext&&(e.currentTarget.style.background="rgba(255,217,61,0.15)")}>
                              {(needsTabVisit&&!tutTabVisited)
                                ? tutorialStep===6
                                  ?(lang==="ko"?"입장료를 먼저 조정하세요":"Adjust fee first")
                                  :(lang==="ko"?"캠페인을 먼저 실행하세요":"Launch campaign first")
                                : (lang==="ko"?"다음 →":"Next →")}
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </>
            )}
          </div>

          {!isPC&&!isMobile&&<div style={{background:"linear-gradient(90deg,#05060F,#08091A)",border:"1px solid rgba(100,120,255,0.08)",borderRadius:8,padding:"5px 10px",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:logCollapsed?0:3,cursor:"pointer"}} onClick={()=>setLogCollapsed(v=>!v)}>
              <div style={{fontSize:10,color:"#7788BB",letterSpacing:3,fontWeight:700,textTransform:"uppercase"}}>▸ Event Log</div>
              <span style={{fontSize:10,color:"#7788BB",transition:"transform 0.2s",display:"inline-block",transform:logCollapsed?"rotate(-90deg)":"rotate(0deg)"}}>▾</span>
            </div>
            {!logCollapsed&&logs.slice(0,5).map((l,i)=>{
              const col=l.startsWith("🚨")||l.startsWith("⚠️")||l.startsWith("💸")?"#FF5757":l.startsWith("✅")||l.startsWith("🎊")||l.startsWith("📣")||l.startsWith("🏗️")?"#00E5A0":l.startsWith("🔬")||l.startsWith("💾")||l.startsWith("⬆️")?"#9B7FFF":l.startsWith("📊")?"#FFD93D":"#6B7CA1";
              return(<div key={i} style={{fontSize:10,padding:"3px 0",borderBottom:i<4?"1px solid rgba(255,255,255,0.04)":"none",opacity:Math.max(0.3,1-i*0.15),color:col,display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:2,height:"100%",borderRadius:1,background:col,alignSelf:"stretch",minHeight:10,flexShrink:0,opacity:0.7}}/>
                {l}
              </div>);
            })}
          </div>}
        </div>

        {/* ── RIGHT PANEL (PC only) ── */}
        {isPC&&screen==="game"&&(
          <div style={{width:220,minWidth:220,flexShrink:0,display:"flex",flexDirection:"column",background:"linear-gradient(180deg,#080B1E 0%,#060818 100%)",borderLeft:"1px solid rgba(100,120,255,0.10)",overflowY:"auto"}}>
            {/* Events section */}
            <div style={{padding:"8px 8px 4px",flexShrink:0}}>
              <div style={{fontSize:9,color:"#3A4A6A",letterSpacing:3,textTransform:"uppercase",fontWeight:700,marginBottom:6}}>⚡ {lang==="ko"?"알림":"Alerts"}</div>

              {stats.brokenCount>0&&(
                <div style={{background:"rgba(255,87,87,0.10)",border:"1px solid rgba(255,87,87,0.4)",borderRadius:6,padding:"6px 8px",color:"#FF5757",fontSize:10,fontWeight:700,marginBottom:4,lineHeight:1.4}}>
                  {lang==="ko"?`⚠️ 고장 시설 ${stats.brokenCount}개 — 경영 탭에서 수리하세요`:`⚠️ ${stats.brokenCount} broken ride${stats.brokenCount>1?"s":""} — go to Manage`}
                </div>
              )}
              {hired.mechanic===0&&stats.brokenCount===0&&(cc.rollerCoaster||cc.dropTower||cc.thrillRide)&&(
                <div style={{background:"rgba(255,159,67,0.08)",border:"1px solid rgba(255,159,67,0.35)",borderRadius:6,padding:"6px 8px",color:"#FF9F43",fontSize:10,fontWeight:700,marginBottom:4,lineHeight:1.4}}>
                  {lang==="ko"?"🔧 정비공 없음 — 고위험 놀이기구 고장 확률↑":"🔧 No mechanic — breakdown risk↑"}
                </div>
              )}
              {!ftueGoalDone&&tutorialStep===0&&stats.hasEntrance&&visitors===0&&(
                <div style={{background:"rgba(0,229,160,0.07)",border:"1px solid rgba(0,229,160,0.3)",borderRadius:6,padding:"6px 8px",color:"#00E5A0",fontSize:10,fontWeight:700,marginBottom:4,lineHeight:1.4,display:"flex",gap:6,alignItems:"flex-start"}}>
                  <span>🎯</span>
                  <div style={{flex:1}}>{lang==="ko"?"재생 버튼을 눌러 방문객을 맞이하세요!":"Press ▶ to welcome your first visitors!"}</div>
                  <button style={{background:"none",border:"none",color:"#7788BB",cursor:"pointer",fontSize:11,padding:0,lineHeight:1}} onClick={()=>setFtueGoalDone(true)}>✕</button>
                </div>
              )}
              {tutorialStep===0&&(()=>{
                const hints=[
                  {id:"h_staff",show:day>=4&&hired.janitor===0&&hired.mechanic===0&&!stats.brokenCount,col:"#4D9FFF",msg:lang==="ko"?"🧹 청소부·정비공 없음 — 경영 탭에서 고용":"🧹 No janitor/mechanic — hire in Manage"},
                  {id:"h_path",show:day>=3&&stats.hasEntrance&&grid.flat().filter(Boolean).some(c=>c&&!c.ref&&B[c.type]?.cat==="ride"&&c.type!=="entrance")&&!grid.flat().some(c=>c?.type==="_path"||c?.type==="_pathFancy"),col:"#FF9F43",msg:lang==="ko"?"🛤️ 통로 없음 — 수익 -40%":"🛤️ No paths — income -40%"},
                  {id:"h_sat",show:day>=6&&sat<50&&sat>0&&visitors>0,col:"#FF6B9D",msg:lang==="ko"?"😟 만족도 낮음 — 😊 아이콘 호버":"😟 Low happiness — hover 😊"},
                  {id:"h_research",show:day>=10&&researchPoints>=5&&researched.length===0,col:"#A29BFE",msg:lang==="ko"?"🔬 연구 포인트 활용 가능":"🔬 Research points available"},
                ];
                const h=hints.find(x=>x.show&&!dismissedHints.includes(x.id));
                if(!h) return null;
                return(
                  <div style={{background:`${h.col}10`,border:`1px solid ${h.col}44`,borderRadius:6,padding:"6px 8px",color:h.col,fontSize:10,fontWeight:700,marginBottom:4,lineHeight:1.4,display:"flex",gap:6,alignItems:"flex-start"}}>
                    <div style={{flex:1}}>{h.msg}</div>
                    <button style={{background:"none",border:"none",color:"#7788BB",cursor:"pointer",fontSize:11,padding:0,flexShrink:0}} onClick={()=>{const nd=[...dismissedHints,h.id];setDismissedHints(nd);try{localStorage.setItem('dismissedHints',JSON.stringify(nd));}catch{}}}>✕</button>
                  </div>
                );
              })()}
              {bankruptcyDays>0&&bankruptcyDays<5&&(
                <div style={{background:"rgba(255,50,50,0.12)",border:"2px solid rgba(255,87,87,0.6)",borderRadius:6,padding:"6px 8px",color:"#FF5757",fontSize:10,fontWeight:700,marginBottom:4,lineHeight:1.4,animation:"pulse 1s infinite"}}>
                  💸 {lang==="ko"?`파산 위험! ${5-bankruptcyDays}일 남음`:`Bankruptcy! ${5-bankruptcyDays} days left`}
                </div>
              )}
              {disasterWarning&&(
                disasterWarning.countdown>=2?(
                  <div style={{background:"rgba(255,200,0,0.08)",border:"2px solid rgba(255,200,0,0.35)",borderRadius:6,padding:"6px 8px",color:"#FFD060",fontSize:10,fontWeight:700,marginBottom:4,lineHeight:1.4}}>
                    <div>🌡️ {lang==="ko"?`징후 감지: ${t("dis."+disasterWarning.dis.id)}`:`Early Signs: ${t("dis."+disasterWarning.dis.id)}`}</div>
                    <div style={{opacity:0.75,fontSize:9,marginBottom:4}}>{lang==="ko"?`${disasterWarning.countdown}일 후 발생`:`${disasterWarning.countdown} days away`}</div>
                    <button onClick={mitigateDisaster} style={{background:"#FFD06020",border:"1px solid #FFD06070",color:"#FFD060",borderRadius:4,padding:"2px 8px",cursor:"pointer",fontSize:9,fontWeight:700,fontFamily:"inherit"}}>🛡️ {lang==="ko"?"대비 $800":"Mitigate $800"}</button>
                  </div>
                ):(
                  <div style={{background:"rgba(255,80,0,0.15)",border:"2px solid rgba(255,80,0,0.6)",borderRadius:6,padding:"6px 8px",color:"#FF5722",fontSize:10,fontWeight:700,marginBottom:4,lineHeight:1.4,animation:"pulse 1s infinite"}}>
                    <div>⚠️ {lang==="ko"?`위험! ${t("dis."+disasterWarning.dis.id)}`:`DANGER! ${t("dis."+disasterWarning.dis.id)}`}</div>
                    <div style={{opacity:0.75,fontSize:9,marginBottom:4}}>{lang==="ko"?"내일 발생 예정!":"Strikes tomorrow!"}</div>
                    <button onClick={mitigateDisaster} style={{background:"#FF572220",border:"1px solid #FF572270",color:"#FF5722",borderRadius:4,padding:"2px 8px",cursor:"pointer",fontSize:9,fontWeight:700,fontFamily:"inherit"}}>🛡️ {lang==="ko"?"대비 $800":"Mitigate $800"}</button>
                  </div>
                )
              )}

              {/* Event popups */}
              {pendingReview&&!pendingVIP&&!pendingInvestor&&(
                <div style={{background:"linear-gradient(135deg,rgba(13,18,53,0.98),rgba(8,11,32,0.98))",border:`2px solid ${pendingReview.grade==="S"?"rgba(255,217,61,0.4)":pendingReview.grade==="A"?"rgba(0,229,160,0.4)":pendingReview.grade==="D"?"rgba(255,87,87,0.4)":"rgba(100,140,255,0.3)"}`,borderRadius:10,padding:"8px 10px",marginBottom:4,animation:"slide-in 0.2s ease"}}>
                  <div style={{fontSize:9,color:"#9B7FFF",letterSpacing:2,marginBottom:3}}>📰 {lang==="ko"?"언론 평가":"Press Review"} · Day {day}</div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:20}}>{pendingReview.emoji}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",color:pendingReview.grade==="S"?"#FFD93D":pendingReview.grade==="A"?"#00E5A0":pendingReview.grade==="D"?"#FF5757":"var(--text-primary)"}}>{pendingReview.grade} {lang==="ko"?"등급":"grade"}</div>
                      <div style={{fontSize:9,color:"var(--text-secondary)",lineHeight:1.3}}>"{pendingReview.headline}"</div>
                    </div>
                    <button style={{background:"rgba(255,217,61,0.12)",border:"1px solid rgba(255,217,61,0.4)",color:"#FFD93D",borderRadius:5,padding:"3px 8px",cursor:"pointer",fontSize:9,fontFamily:"inherit",whiteSpace:"nowrap"}} onClick={()=>setPendingReview(null)}>{lang==="ko"?"확인":"OK"}</button>
                  </div>
                </div>
              )}
              {pendingInvestor&&!pendingVIP&&(()=>{const offer=pendingInvestor.offer;const penalty=Math.floor(offer.amount*offer.penalty);return(
                <div style={{background:"linear-gradient(135deg,rgba(13,18,53,0.98),rgba(8,11,32,0.98))",border:"2px solid rgba(100,140,255,0.2)",borderRadius:10,padding:"8px 10px",marginBottom:4,animation:"slide-in 0.2s ease"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                    <span style={{fontSize:20}}>{offer.emoji}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:11,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",color:"#00E5A0"}}>{offer.name[lang]||offer.name.ko}</div>
                      <div style={{fontSize:9,color:"#FF9F43"}}>⚠️ {lang==="ko"?"실패 시":"Fail"}: -${penalty.toLocaleString()} · {pendingInvestor.expiresIn}d</div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:4}}>
                    <button style={{flex:1,background:"rgba(0,229,160,0.12)",border:"2px solid rgba(0,229,160,0.5)",color:"#00E5A0",borderRadius:5,padding:"3px 0",cursor:"pointer",fontSize:9,fontWeight:700,fontFamily:"inherit"}} onClick={acceptInvestor}>{t("vip.accept")}</button>
                    <button style={{flex:1,background:"rgba(255,87,87,0.06)",border:"1px solid rgba(255,87,87,0.25)",color:"#FF5757",borderRadius:5,padding:"3px 0",cursor:"pointer",fontSize:9,fontFamily:"inherit"}} onClick={declineInvestor}>{t("vip.decline")}</button>
                  </div>
                </div>
              );})()}
              {pendingVIP&&(
                <div style={{background:"linear-gradient(135deg,rgba(13,18,53,0.98),rgba(8,11,32,0.98))",border:"2px solid rgba(100,140,255,0.2)",borderRadius:10,padding:"8px 10px",marginBottom:4,animation:"slide-in 0.2s ease"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                    <span style={{fontSize:20}}>{pendingVIP.emoji}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:11,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",color:"#FFD93D"}}>{t(`vip.${pendingVIP.id}`)}</div>
                      <div style={{fontSize:9,color:checkVIPReq(grid,pendingVIP.req)?"#00E5A0":"#FF5757"}}>{checkVIPReq(grid,pendingVIP.req)?t("vip.metReq"):t("vip.noReq")}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:4}}>
                    <button style={{flex:1,background:checkVIPReq(grid,pendingVIP.req)?"rgba(0,229,160,0.12)":"rgba(255,255,255,0.04)",border:`2px solid ${checkVIPReq(grid,pendingVIP.req)?"rgba(0,229,160,0.5)":"rgba(255,255,255,0.10)"}`,color:checkVIPReq(grid,pendingVIP.req)?"#00E5A0":"#7788BB",borderRadius:5,padding:"3px 0",cursor:"pointer",fontSize:9,fontWeight:700,fontFamily:"inherit"}} onClick={acceptVIP}>{t("vip.accept")}</button>
                    <button style={{flex:1,background:"rgba(255,87,87,0.06)",border:"1px solid rgba(255,87,87,0.25)",color:"#FF5757",borderRadius:5,padding:"3px 0",cursor:"pointer",fontSize:9,fontFamily:"inherit"}} onClick={()=>setPendingVIP(null)}>{t("vip.decline")}</button>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{height:1,background:"rgba(100,120,255,0.08)",flexShrink:0}}/>

            {/* Event log */}
            <div style={{flex:1,overflowY:"auto",padding:"8px 8px"}}>
              <div style={{fontSize:9,color:"#3A4A6A",letterSpacing:3,textTransform:"uppercase",fontWeight:700,marginBottom:6}}>📋 {lang==="ko"?"이벤트 로그":"Event Log"}</div>
              {logs.map((l,i)=>{
                const col=l.startsWith("🚨")||l.startsWith("⚠️")||l.startsWith("💸")?"#FF5757":l.startsWith("✅")||l.startsWith("🎊")||l.startsWith("📣")||l.startsWith("🏗️")?"#00E5A0":l.startsWith("🔬")||l.startsWith("💾")||l.startsWith("⬆️")?"#9B7FFF":l.startsWith("📊")?"#FFD93D":"#6B7CA1";
                return(
                  <div key={i} style={{fontSize:10,padding:"3px 0",borderBottom:"1px solid rgba(255,255,255,0.04)",opacity:Math.max(0.35,1-i*0.08),color:col,display:"flex",alignItems:"center",gap:5}}>
                    <div style={{width:2,minHeight:10,borderRadius:1,background:col,alignSelf:"stretch",flexShrink:0,opacity:0.7}}/>
                    <span style={{lineHeight:1.4}}>{l}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 폭죽/컨페티 효과 */}
      {showFireworks&&(
        <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9000,overflow:"hidden"}}>
          {Array.from({length:20},(_,i)=>{
            const colors=["#FFD93D","#FF6B9D","#00E5A0","#4D9FFF","#9B7FFF","#FF9F43"];
            const col=colors[i%colors.length];
            const left=`${5+Math.random()*90}%`;
            const delay=`${Math.random()*1.5}s`;
            const dur=`${2+Math.random()*1.5}s`;
            return(<div key={i} style={{position:"absolute",top:"-20px",left,width:8,height:8,borderRadius:"50%",background:col,animation:`confetti-fall ${dur} ${delay} ease-in forwards`}}/>);
          })}
        </div>
      )}
      {/* 첫 방문객 세그먼트 배너 */}
      {segArrivalShown&&visitors>0&&(()=>{
        const domSeg=Object.entries(segData||{}).sort((a,b)=>b[1]-a[1])[0];
        if(!domSeg) return null;
        const segInfo={couple:{emoji:"💑",ko:"커플",en:"Couples",tip:{ko:"커플은 감성적인 경험을 선호해요. 분수·정원을 배치하세요.",en:"Couples love romantic experiences. Place fountains & gardens."}},family:{emoji:"👨‍👩‍👧",ko:"가족",en:"Families",tip:{ko:"가족은 어린이 놀이기구를 좋아해요. 회전목마 등을 늘리세요.",en:"Families love kid rides. Add carousels & family attractions."}},thrill:{emoji:"😱",ko:"스릴",en:"Thrill Seekers",tip:{ko:"스릴 방문객은 롤러코스터를 원해요!",en:"Thrill seekers want roller coasters!"}},child:{emoji:"👶",ko:"어린이",en:"Children",tip:{ko:"어린이는 안전한 소형 놀이기구를 선호해요.",en:"Children prefer safe small attractions."}},general:{emoji:"🚶",ko:"일반",en:"General",tip:{ko:"다양한 시설을 균형 있게 배치하세요.",en:"Balance a variety of facilities."}}};
        const info=segInfo[domSeg[0]]||{emoji:"👥",ko:"일반",en:"General",tip:{ko:"균형 잡힌 공원을 만드세요.",en:"Build a balanced park."}};
        return(
          <div style={{position:"fixed",bottom:16,right:16,zIndex:8000,background:"rgba(8,12,32,0.96)",border:"1px solid rgba(100,120,255,0.3)",borderRadius:12,padding:"12px 16px",maxWidth:260,backdropFilter:"blur(10px)",animation:"slide-in 0.3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
              <div style={{fontSize:11,fontWeight:700,color:"#A0B0FF"}}>
                {info.emoji} {lang==="ko"?`주요 방문객: ${info.ko}`:`Main Visitors: ${info.en}`}
              </div>
              <button onClick={()=>setSegArrivalShown(false)} style={{background:"none",border:"none",color:"#556688",cursor:"pointer",fontSize:12,padding:"0 2px",lineHeight:1}}>✕</button>
            </div>
            <div style={{fontSize:9,color:"#8899BB",lineHeight:1.6}}>{info.tip[lang]||info.tip.ko}</div>
          </div>
        );
      })()}
      {/* 구역 FTUE 모달 */}
      {showZoneFtue&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:9500,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setShowZoneFtue(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:"linear-gradient(135deg,#0D1230,#080B20)",border:"2px solid rgba(155,127,255,0.4)",borderRadius:16,padding:"24px 28px",maxWidth:320,animation:"slide-in 0.3s ease",fontFamily:"'Rajdhani','Barlow Condensed',sans-serif"}}>
            <div style={{fontSize:32,textAlign:"center",marginBottom:8}}>🎨</div>
            <div style={{fontSize:16,fontWeight:900,color:"#9B7FFF",letterSpacing:2,textAlign:"center",marginBottom:6}}>{lang==="ko"?"구역 시스템":"Zone System"}</div>
            <div style={{fontSize:10,color:"#8899BB",lineHeight:1.8,marginBottom:12}}>
              {lang==="ko"
                ?"구역 탭에서 타일을 클릭해 테마 구역을 지정하세요.\n같은 구역의 건물이 3칸 이상 연결되면 보너스가 발동됩니다!\n\n🎠 놀이 구역: 방문객 +보너스\n🌿 자연 구역: 만족도 +보너스\n🍔 음식 구역: 수익 +보너스"
                :"Paint theme zones on your park tiles in the Zone tab.\nWhen 3+ connected buildings share a zone, bonuses activate!\n\n🎠 Fun Zone: Visitor bonus\n🌿 Nature Zone: Satisfaction bonus\n🍔 Food Zone: Revenue bonus"}
            </div>
            <button onClick={()=>setShowZoneFtue(false)} style={{width:"100%",background:"rgba(155,127,255,0.15)",border:"2px solid rgba(155,127,255,0.4)",color:"#9B7FFF",borderRadius:8,padding:"8px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit"}}>{lang==="ko"?"알겠어요!":"Got it!"}</button>
          </div>
        </div>
      )}
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

      {/* Mobile placement confirmation bar */}
      {isMobile&&placementPreview&&(
        <div className="placement-bar">
          <span style={{fontSize:12,color:"#8899BB",fontFamily:"'Rajdhani',sans-serif",whiteSpace:"nowrap"}}>
            {selected?t(`b.${selected}`):""} ({placementPreview.r},{placementPreview.c})
          </span>
          <button onClick={()=>{handleGridClick(placementPreview.r,placementPreview.c,true);setPlacementPreview(null);}}
            style={{background:"rgba(0,229,160,0.18)",border:"1px solid rgba(0,229,160,0.5)",color:"#00E5A0",borderRadius:20,padding:"6px 14px",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"inherit",minHeight:36}}>
            ✅ {lang==="ko"?"배치":"Place"}
          </button>
          <button onClick={()=>setPlacementPreview(null)}
            style={{background:"rgba(255,87,87,0.12)",border:"1px solid rgba(255,87,87,0.4)",color:"#FF5757",borderRadius:20,padding:"6px 14px",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"inherit",minHeight:36}}>
            ❌
          </button>
        </div>
      )}

      {/* Mobile: collapsible event log overlay above bottom nav */}
      {isMobile&&screen==="game"&&!bottomSheetOpen&&logs.length>0&&(
        <div style={{position:"fixed",bottom:180,right:8,zIndex:195,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
          {logOverlayExpanded&&(
            <div style={{background:"rgba(4,5,16,0.90)",border:"1px solid rgba(100,120,255,0.15)",borderRadius:10,padding:"5px 10px",backdropFilter:"blur(10px)",maxWidth:"80vw",minWidth:160}}>
              {logs.slice(0,3).map((l,i)=>{
                const col=l.startsWith("🚨")||l.startsWith("⚠️")||l.startsWith("💸")?"#FF5757":l.startsWith("✅")||l.startsWith("🎊")||l.startsWith("📣")||l.startsWith("🏗️")?"#00E5A0":l.startsWith("🔬")||l.startsWith("💾")||l.startsWith("⬆️")?"#9B7FFF":l.startsWith("📊")?"#FFD93D":"#5566AA";
                return <div key={i} style={{fontSize:9,color:col,opacity:i===0?1:0.5,lineHeight:1.5,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{l}</div>;
              })}
            </div>
          )}
          <button onClick={()=>setLogOverlayExpanded(v=>!v)}
            style={{background:"rgba(4,5,16,0.88)",border:"1px solid rgba(100,120,255,0.20)",borderRadius:20,padding:"3px 8px",cursor:"pointer",fontSize:10,color:"#5566AA",display:"flex",alignItems:"center",gap:3,backdropFilter:"blur(8px)"}}>
            📋 {logOverlayExpanded?(lang==="ko"?"접기":"Hide"):(lang==="ko"?"로그":"Log")}
          </button>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      {isMobile&&screen==="game"&&(
        <nav className="mobile-bottom-nav">
          {[
            {k:"build",    ic:"🏗️", label:{ko:"건설",en:"Build"}},
            {k:"manage",   ic:"⚙️", label:{ko:"경영",en:"Manage"}},
            {k:"finance",  ic:"💰", label:{ko:"재무",en:"Finance"}},
            {k:"research", ic:"🔬", label:{ko:"연구",en:"R&D"}},
            {k:"mission",  ic:"🎯", label:{ko:"미션",en:"Quest"}},
          ].map(({k,ic,label})=>(
            <button key={k}
              className={tab===k&&bottomSheetOpen?"active":""}
              onClick={()=>{
                if(tab===k&&bottomSheetOpen){setBottomSheetOpen(false);}
                else{setTab(k);setBottomSheetOpen(true);}
              }}
              style={{fontSize:10,color:tab===k&&bottomSheetOpen?"#00E5A0":"#445580"}}>
              <span style={{fontSize:20}}>{ic}</span>
              <span>{label[lang]||label.ko}</span>
              {k==="research"&&hasResearchAvailable&&<div style={{position:"absolute",top:6,right:"28%",width:7,height:7,borderRadius:"50%",background:"#00E5A0"}}/>}
            </button>
          ))}
        </nav>
      )}

      {scenarioResult&&(()=>{
        const bestMedal=earnedMedals.filter(m=>m.scenarioId===currentScenario).sort((a,b)=>['bronze','silver','gold','platinum'].indexOf(b.medalId)-['bronze','silver','gold','platinum'].indexOf(a.medalId))[0];
        return(
        <div style={{position:"fixed",inset:0,background:"rgba(2,5,16,0.92)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100}}>
          <div style={{background:"linear-gradient(135deg,#0D1235,#080B20)",border:`3px solid ${scenarioResult.medal?"rgba(255,217,61,0.5)":"rgba(255,87,87,0.4)"}`,borderRadius:20,padding:"36px 44px",textAlign:"center",maxWidth:380,boxShadow:`0 20px 60px rgba(0,0,0,0.8), 0 0 40px ${scenarioResult.medal?"rgba(255,217,61,0.1)":"rgba(255,87,87,0.1)"}`,animation:"slide-in 0.3s ease",fontFamily:"'Rajdhani','Barlow Condensed',sans-serif"}}>
            {scenarioResult.medal?(
              <>
                <div style={{fontSize:104,marginBottom:8}}>{scenarioResult.medal}</div>
                <div style={{fontSize:22,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:2,color:"#FFD93D",marginBottom:6}}>{t("res.success")}</div>
                <div style={{fontSize:12,color:"#9B7FFF",marginBottom:6}}>{t(`scn.${scenarioResult.scenario}`)}</div>
                <div style={{fontSize:10,color:"#6B7CA1",marginBottom:8}}>Day {scenarioResult.day} {t("misc.done")}</div>
                {SCENARIO_CLEAR_FLAVOR?.[scenarioResult.scenario]&&(
                  <div style={{fontSize:11,color:"#9B7FFF",fontStyle:"italic",marginBottom:12,lineHeight:1.6,padding:"8px 12px",background:"rgba(155,127,255,0.06)",borderRadius:6,border:"1px solid rgba(155,127,255,0.15)"}}>
                    "{SCENARIO_CLEAR_FLAVOR[scenarioResult.scenario][lang]||SCENARIO_CLEAR_FLAVOR[scenarioResult.scenario].ko}"
                  </div>
                )}
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
                <div style={{fontSize:10,color:"#6B7CA1",marginBottom:12}}>{scenarioResult.bankrupt?(lang==="ko"?"5일 연속 적자로 공원이 폐쇄됐습니다.":"Park closed due to 5 consecutive days of losses."):t("res.failDesc")}</div>
                {/* 실패 분석 */}
                <div style={{background:"rgba(255,87,87,0.07)",border:"1px solid rgba(255,87,87,0.2)",borderRadius:8,padding:"10px 12px",marginBottom:16,textAlign:"left"}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#FF5757",letterSpacing:1,marginBottom:8}}>📊 {lang==="ko"?"실패 분석":"Failure Analysis"}</div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:10}}>
                    <span style={{color:"#6B7CA1"}}>{lang==="ko"?"누적 수익":"Total Revenue"}</span>
                    <span style={{color:"#FFD93D",fontWeight:700}}>${totalRev.toLocaleString()}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:10}}>
                    <span style={{color:"#6B7CA1"}}>{lang==="ko"?"운영 일수":"Days Operated"}</span>
                    <span style={{color:"#9B7FFF",fontWeight:700}}>{scenarioResult.day}</span>
                  </div>
                  <div style={{fontSize:9,color:"#FF9F43",fontWeight:600,marginBottom:4}}>💡 {lang==="ko"?"개선 팁:":"Tips to improve:"}</div>
                  {[
                    sat<50&&(lang==="ko"?"😊 만족도가 낮았습니다. 청소부를 고용하고 혼잡도를 줄이세요.":"😊 Low satisfaction. Hire janitors & reduce congestion."),
                    totalRev<1000&&(lang==="ko"?"💰 수익이 너무 적었습니다. 놀이기구를 늘리고 입장료를 조정하세요.":"💰 Too little revenue. Add attractions & adjust admission fees."),
                    stats.hasEntrance===false&&(lang==="ko"?"🎪 입구 게이트가 없었습니다. 반드시 배치하세요!":"🎪 No entrance gate was placed. This is required!"),
                    stats.brokenCount>2&&(lang==="ko"?"🔧 시설 고장이 많았습니다. 정비공을 고용하세요.":"🔧 Too many broken facilities. Hire mechanics."),
                  ].filter(Boolean).slice(0,2).map((tip,i)=>(
                    <div key={i} style={{fontSize:9,color:"#8899BB",marginBottom:3,paddingLeft:8,borderLeft:"2px solid #FF5757"}}>
                      {tip}
                    </div>
                  ))}
                </div>
              </>
            )}
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button style={{background:"rgba(255,217,61,0.12)",border:"2px solid rgba(255,217,61,0.5)",color:"#FFD93D",borderRadius:10,padding:"10px 20px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",transition:"all 0.15s"}} onClick={()=>{setScenarioResult(null);setSpeed(0);setScreen("menu");}}>{t("res.backMenu")}</button>
              <button style={{background:"rgba(0,229,160,0.12)",border:"2px solid rgba(0,229,160,0.4)",color:"#00E5A0",borderRadius:10,padding:"10px 20px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",transition:"all 0.15s"}} onClick={()=>{setScenarioResult(null);setSpeed(1);}}>{t("res.continue")}</button>
            </div>
          </div>
        </div>
        );
      })()}

    </div>
  );
}