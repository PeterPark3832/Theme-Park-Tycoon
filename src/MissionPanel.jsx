import { bldCounts, calcLeague } from './gameLogic.js';
import { STAGES, RESEARCH, MISSIONS, ACHIEVEMENTS, LEAGUES, INVESTOR_OFFERS, HOLIDAY_EVENTS, B } from './gameData.js';

export default function MissionPanel({
  dismissedHints, setDismissedHints,
  lang, t,
  day,
  grid,
  stats,
  hired,
  gameMode,
  sandboxGoal, setSandboxGoal,
  visitors,
  parkRating,
  researched,
  currentStage,
  totalBldCount,
  money,
  setMoney,
  activeHoliday, holidayHistory,
  activeInvestment,
  estNet,
  isInsured, setIsInsured,
  addLog,
  activeDisaster,
  resolveDisaster,
  currentScenario, currentScenarioData,
  scenarioTimeLimit,
  sat,
  segs,
  fee,
  loans,
  discoveredSecrets,
  activeDailyChallenge,
  clean,
  activeMissions,
  completedMissions,
  passHolders,
  vipCount,
  zoneGrid,
  profitStreakDays,
  totalVis,
  staffLevels,
  totalDebt,
  weeklyBadges,
  speed,
  earnedMedals,
  earnedAchievements,
}) {
  return (
    <>
      {!dismissedHints.includes("tab_mission")&&<div style={{background:"rgba(94,246,160,0.06)",border:"1px solid rgba(94,246,160,0.3)",borderRadius:7,padding:"7px 10px",marginBottom:6,display:"flex",gap:8,alignItems:"flex-start",animation:"slide-in 0.2s ease"}}>
        <span style={{fontSize:14,flexShrink:0}}>🎯</span>
        <div style={{flex:1,fontSize:10,color:"#5EF6A0",lineHeight:1.6}}>{lang==="ko"?"미션을 달성하면 RP와 보너스 자금을 얻어요. 달성률이 높을수록 리그 등급이 오릅니다!":"Complete missions for RP & bonus cash. Higher completion rate = higher league rank!"}</div>
        <button style={{background:"none",border:"none",color:"#7788BB",cursor:"pointer",fontSize:12,flexShrink:0}} onClick={()=>{const nd=[...dismissedHints,"tab_mission"];setDismissedHints(nd);try{localStorage.setItem('dismissedHints',JSON.stringify(nd));}catch{}}}>✕</button>
      </div>}
      {day>=30&&!dismissedHints.includes("late_systems")&&(
        <div style={{background:"rgba(255,159,67,0.06)",border:"1px solid rgba(255,159,67,0.3)",borderRadius:7,padding:"7px 10px",marginBottom:6,display:"flex",gap:8,alignItems:"flex-start",animation:"slide-in 0.2s ease"}}>
          <span style={{fontSize:14,flexShrink:0}}>💡</span>
          <div style={{flex:1,fontSize:10,color:"#FF9F43",lineHeight:1.7}}>{lang==="ko"?"후반 시스템: VIP 이벤트(경영→VIP탭), 라이벌(마케팅탭), 건물 콤보(같은 카테고리 인접 배치), 구역 숙련도(구역 탭)를 활용하면 수익이 크게 오릅니다!":"Late-game: VIP Events (Manage→VIP), Rival Parks (Marketing), Building Combos (place same category adjacent), Zone Mastery (Zone tab) — these multiply income significantly!"}</div>
          <button style={{background:"none",border:"none",color:"#7788BB",cursor:"pointer",fontSize:12,flexShrink:0}} onClick={()=>{const nd=[...dismissedHints,"late_systems"];setDismissedHints(nd);try{localStorage.setItem('dismissedHints',JSON.stringify(nd));}catch{}}}>✕</button>
        </div>
      )}
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
      {gameMode==="sandbox"&&!sandboxGoal&&(
        <div style={{background:"rgba(77,159,255,0.06)",border:"1px solid rgba(77,159,255,0.2)",borderRadius:8,padding:8,marginBottom:6}}>
          <div style={{fontSize:9,color:"#4D9FFF",letterSpacing:2,textTransform:"uppercase",marginBottom:5,fontWeight:700}}>🎮 {lang==="ko"?"샌드박스 목표":"SANDBOX GOALS"}</div>
          {[
            {done:visitors>=100,  label:{ko:"방문객 100명 달성",    en:"Reach 100 visitors"}},
            {done:parkRating.stars>=3, label:{ko:"별점 3성 달성",   en:"Reach 3-star rating"}},
            {done:researched.length>=Math.floor(RESEARCH.length/2),label:{ko:"연구 절반 이상 완료",en:"Complete half the research tree"}},
            {done:parkRating.stars>=5&&researched.length>=RESEARCH.length,label:{ko:"5성+전체 연구 → 프레스티지!",en:"5★+all research → Prestige!"}},
          ].map((g,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
              <span style={{fontSize:10,flexShrink:0}}>{g.done?"✅":"⬜"}</span>
              <span style={{fontSize:10,color:g.done?"#4D9FFF":"#8899BB",textDecoration:g.done?"line-through":"none"}}>{g.label[lang]||g.label.ko}</span>
            </div>
          ))}
        </div>
      )}
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

      {/* 재난 보험 */}
      <div style={{background:isInsured?"rgba(0,229,160,0.06)":"rgba(255,87,87,0.04)",border:`1px solid ${isInsured?"rgba(0,229,160,0.3)":"rgba(255,87,87,0.2)"}`,borderRadius:7,padding:"7px 9px",marginBottom:6,display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:18}}>{isInsured?"🛡️":"🚨"}</span>
        <div style={{flex:1}}>
          <div style={{fontSize:10,fontWeight:700,color:isInsured?"#00E5A0":"#FF9F43"}}>{lang==="ko"?isInsured?"재난 보험 가입중":"재난 보험 미가입":isInsured?"Insurance Active":"No Insurance"}</div>
          <div style={{fontSize:9,color:"#5566AA"}}>{lang==="ko"?isInsured?"피해 50% 감소 · 기간 50% 단축 · $200/일":"$8,000 일시불 · 피해 50% 감소 · $200/일 유지비":isInsured?"50% damage reduction · 50% shorter · $200/day":"$8,000 upfront · 50% damage reduction · $200/day"}</div>
        </div>
        <button style={{background:isInsured?"rgba(255,87,87,0.12)":"rgba(0,229,160,0.12)",border:`1px solid ${isInsured?"rgba(255,87,87,0.4)":"rgba(0,229,160,0.4)"}`,color:isInsured?"#FF5757":"#00E5A0",borderRadius:5,padding:"3px 9px",cursor:(!isInsured&&money<8000)?"default":"pointer",fontSize:9,fontWeight:700,fontFamily:"inherit",opacity:(!isInsured&&money<8000)?0.4:1}} onClick={()=>{if(isInsured){setIsInsured(false);addLog(lang==="ko"?"🛡️ 재난 보험 해지":"🛡️ Insurance cancelled");}else if(money>=8000){setMoney(m=>m-8000);setIsInsured(true);addLog(lang==="ko"?"🛡️ 재난 보험 가입! 재난 피해 50% 감소":"🛡️ Insurance activated! 50% disaster damage reduction");}}}>{isInsured?(lang==="ko"?"해지":"Cancel"):(lang==="ko"?"-$8,000 가입":"-$8,000 Insure")}</button>
      </div>
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
            const checkS={vis:visitors,sat,stars:parkRating.stars,net:estNet,brokenCount:stats.brokenCount,fee,coupleRatio:segs.couple||0,childRatio:segs.child||0,pres:parkRating.stars,debt:loans.reduce((t,l)=>t+l.remaining,0)};
            const achieved=g.check(checkS);
            return(<div key={g.id} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 6px",marginBottom:2,background:achieved?"#5EF6A011":"#14142A",border:`1px solid ${achieved?"#5EF6A033":"#2A2A4A"}`,borderRadius:5}}>
              <span style={{fontSize:14}}>{g.medal}</span>
              <div style={{flex:1,fontSize:10,color:achieved?"#5EF6A0":"#8888AA"}}>{g.desc?.[lang]||g.desc?.ko||""}</div>
              {achieved&&<span style={{fontSize:10}}>✅</span>}
            </div>);
          })}
          {currentScenarioData.hiddenGoals?.map(hg=>{
            const secretKey=`${currentScenario}_${hg.id}`;
            const unlocked=discoveredSecrets.has(secretKey);
            return(<div key={hg.id} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 6px",marginBottom:2,background:unlocked?"rgba(162,155,254,0.08)":"rgba(255,255,255,0.02)",border:`1px solid ${unlocked?"rgba(162,155,254,0.3)":"rgba(255,255,255,0.06)"}`,borderRadius:5}}>
              <span style={{fontSize:14}}>🔮</span>
              <div style={{flex:1,fontSize:10,color:unlocked?"#A29BFE":"#4A5A7A"}}>{unlocked?(hg.desc?.[lang]||hg.desc?.ko):(hg.hint?.[lang]||hg.hint?.ko)}</div>
              {unlocked&&<span style={{fontSize:10}}>✅</span>}
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
    </>
  );
}
