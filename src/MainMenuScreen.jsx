import {
  SCENARIOS, SCENARIO_DIFFICULTY, DIFFICULTY_SETTINGS,
  STARTING_PERKS, WEEKLY_CHALLENGES, LANG_FLAGS,
} from './gameData.js';
import { timeAgoL, writeSaveSlots } from './gameLogic.js';
import SettingsModal from './SettingsModal.jsx';

export default function MainMenuScreen({
  lang, changeLang, t,
  showSettings, setShowSettings,
  showAbout, setShowAbout,
  isMobile,
  saveSlots, setSaveSlots,
  loadFromSlot,
  menuSubScreen, setMenuSubScreen,
  hof, speedrunRecords,
  earnedMedals, discoveredSecrets,
  pendingScenarioId, setPendingScenarioId,
  pendingStartParams, setPendingStartParams,
  startGame,
  saveQuotaWarning, setSaveQuotaWarning,
  lifetimeRP,
  uiSettings, setUiSettings,
  soundOn, setSoundOn,
  bgMusicOn, setBgMusicOn,
  bgVolume, setBgVolume,
}) {
  const slots = saveSlots;
  return (<>
    <div className="screen-enter" style={{fontFamily:"'Rajdhani','Barlow Condensed',sans-serif",background:"radial-gradient(ellipse at 50% 0%, #0D1535 0%, #020510 60%)",color:"var(--text-primary)",height:"100%",overflowY:"auto",display:"flex",alignItems:"flex-start",justifyContent:"center",padding:20}}>
      {showSettings&&<SettingsModal uiSettings={uiSettings} setUiSettings={setUiSettings} soundOn={soundOn} setSoundOn={setSoundOn} bgMusicOn={bgMusicOn} setBgMusicOn={setBgMusicOn} bgVolume={bgVolume} setBgVolume={setBgVolume} onClose={()=>setShowSettings(false)} lang={lang}/>}
      {showAbout&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setShowAbout(false)}>
          <div role="dialog" aria-modal={true} aria-label={lang==="ko"?"소개":"About"} style={{background:"#0C1128",border:"1px solid rgba(120,140,255,0.3)",borderRadius:14,padding:"28px 32px",maxWidth:360,boxShadow:"0 8px 40px rgba(0,0,0,0.9)",fontFamily:"'Rajdhani','Barlow Condensed',sans-serif"}} onClick={e=>e.stopPropagation()}>
            <div style={{textAlign:"center",marginBottom:16}}>
              <div style={{fontSize:40,marginBottom:6}}>🎡</div>
              <div style={{fontSize:22,fontWeight:900,letterSpacing:4,color:"#FFD93D",fontFamily:"'Barlow Condensed',sans-serif"}}>PARCADIA</div>
              <div style={{fontSize:11,color:"#5566AA",marginTop:2,fontFamily:"'Space Mono',monospace"}}>v1.0.0</div>
            </div>
            <div style={{fontSize:11,color:"#8899BB",lineHeight:1.8,marginBottom:16,textAlign:"center"}}>
              {lang==="ko"?"8개 시나리오 · 27종 건물 · 날씨·재난·연구 시스템\n완전 무료 브라우저 경영 시뮬레이션":"8 scenarios · 27 buildings · weather, disaster & research\nFully free browser management simulation"}
            </div>
            <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(120,140,255,0.1)",borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:10,color:"#6B7CA1",lineHeight:1.8}}>
              <div>🎮 {lang==="ko"?"개발":"Dev"}: PeterPark3832</div>
              <div>🌐 {lang==="ko"?"지원 언어":"Languages"}: 한국어 · English</div>
              <div>⚙️ {lang==="ko"?"기술 스택":"Stack"}: React · Vite · Web Audio API</div>
              <div>🎵 {lang==="ko"?"사운드":"Sound"}: Procedural BGM + SFX</div>
              <div>📦 {lang==="ko"?"완전 무료 · 오프라인 지원 (PWA)":"Free forever · Offline ready (PWA)"}</div>
            </div>
            <div style={{textAlign:"center",fontSize:10,color:"#3A4A70",marginBottom:12}}>
              {lang==="ko"?"즐거운 공원 경영 되세요 🎢":"Have fun running your park 🎢"}
            </div>
            <button style={{width:"100%",padding:"8px 0",background:"rgba(100,120,255,0.1)",border:"1px solid rgba(100,120,255,0.25)",color:"#8899CC",borderRadius:7,cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:600}} onClick={()=>setShowAbout(false)}>{lang==="ko"?"닫기":"Close"}</button>
          </div>
        </div>
      )}
      <button onClick={()=>setShowSettings(true)} style={{position:"fixed",top:12,right:12,background:"rgba(100,120,255,0.12)",border:"1px solid rgba(100,120,255,0.3)",color:"#8899CC",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:16,fontFamily:"inherit",transition:"all 0.15s",zIndex:1000}} title={lang==="ko"?"설정":"Settings"}>⚙️</button>
      <div style={{width:"100%",maxWidth:680,margin:"auto"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
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
          {!(()=>{try{return!!localStorage.getItem('pt_academy_done');}catch{return false;}})()&&<div style={{background:"rgba(155,127,255,0.08)",border:"1px solid rgba(155,127,255,0.35)",borderRadius:8,padding:"8px 12px",marginBottom:10,display:"flex",gap:8,alignItems:"center",animation:"slide-in 0.3s ease"}}>
            <span style={{fontSize:16}}>🎓</span>
            <div style={{fontSize:10,color:"#9B7FFF",lineHeight:1.5,flex:1}}>{lang==="ko"?"처음 플레이하시나요? 아래 아카데미 버튼으로 17단계 가이드를 시작해보세요!":"First time? Hit Academy below for a guided 17-step walkthrough!"}</div>
          </div>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:24}}>
            {[
              {mode:"campaign",emoji:"🎯",name:t("mode.campaign"),time:{ko:"60-90분/시나리오",en:"60-90 min/scenario"},desc:t("mode.campaign.desc"),color:"#00E5A0",action:()=>setMenuSubScreen("scenario")},
              {mode:"sandbox", emoji:"🏗️",name:t("mode.sandbox"), time:{ko:"시간 제한 없음",en:"Unlimited"},desc:t("mode.sandbox.desc"), color:"#FFD93D",action:()=>setPendingStartParams({mode:"sandbox",scenarioId:null,diff:"normal"})},
              {mode:"challenge",emoji:"⚡",name:t("mode.challenge"),time:{ko:"30-45분",en:"30-45 min"},desc:t("mode.challenge.desc"),color:"#FF6B9D",action:()=>setMenuSubScreen("difficulty")},
              {mode:"tutorial",emoji:"🎓",name:lang==="ko"?"아카데미":"Academy",time:{ko:"약 20분",en:"~20 min"},desc:(()=>{const done=(()=>{try{return!!localStorage.getItem('pt_academy_done');}catch{return false;}})();return lang==="ko"?`처음 하시나요?\n5챕터 17단계 체험${done?" ✓ 완료":""}`:(`New to the game?\n5 chapters, 17 steps${done?" ✓ Done":""}`);})(),color:"#9B7FFF",action:()=>startGame("tutorial",null,"normal",null,null)},
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
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6}}>
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

          {saveQuotaWarning&&<div style={{marginTop:8,background:"rgba(255,87,87,0.10)",border:"1px solid rgba(255,87,87,0.4)",borderRadius:8,padding:"8px 12px",display:"flex",alignItems:"flex-start",gap:8,flexWrap:"wrap"}}>
            <span style={{fontSize:16}}>⚠️</span>
            <div style={{flex:1,minWidth:160}}>
              <div style={{fontSize:10,color:"#FF5757",fontWeight:700,marginBottom:4}}>{lang==="ko"?"저장 공간이 부족합니다.":"Storage quota exceeded."}</div>
              <button onClick={()=>{
                const oldest=saveSlots.map((s,i)=>({s,i})).filter(x=>x.s).sort((a,b)=>(a.s.meta?.savedAt||0)-(b.s.meta?.savedAt||0))[0];
                if(oldest){const n=[...saveSlots];n[oldest.i]=null;const sr=writeSaveSlots(n);if(!sr||sr.ok){setSaveSlots(n);setSaveQuotaWarning(false);}}
              }} style={{background:"rgba(255,87,87,0.15)",border:"1px solid rgba(255,87,87,0.5)",color:"#FF7F7F",borderRadius:5,padding:"3px 8px",cursor:"pointer",fontSize:10,fontFamily:"inherit",fontWeight:600}}>
                {lang==="ko"?"가장 오래된 슬롯 삭제":"Delete oldest save"}
              </button>
            </div>
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
                  {sc.goals.map(g=>{
                    const already=earnedMedals.some(m=>m.scenarioId===sc.id&&m.medalId===g.id);
                    return(<span key={g.id} style={{fontSize:9,padding:"2px 6px",background:already?"rgba(94,246,160,0.12)":"rgba(255,255,255,0.10)",border:`1px solid ${already?"rgba(94,246,160,0.4)":"rgba(255,255,255,0.18)"}`,borderRadius:3,color:already?"#5EF6A0":"#DDE2FF"}}>{g.medal} {g.desc?.[lang]||g.desc?.ko||""}</span>);
                  })}
                  {sc.hiddenGoals?.map(hg=>{
                    const unlocked=discoveredSecrets.has(`${sc.id}_${hg.id}`);
                    return(<span key={hg.id} style={{fontSize:9,padding:"2px 6px",background:unlocked?"rgba(162,155,254,0.12)":"rgba(255,255,255,0.04)",border:`1px solid ${unlocked?"rgba(162,155,254,0.4)":"rgba(255,255,255,0.08)"}`,borderRadius:3,color:unlocked?"#A29BFE":"#3A4A6A"}} title={unlocked?(hg.desc?.[lang]||hg.desc?.ko):(hg.hint?.[lang]||hg.hint?.ko)}>🔮 {unlocked?(lang==="ko"?"비밀 달성!":"Secret!"):"???"}</span>);
                  })}
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
            <div style={{background:`${sc.color}0A`,border:`1px solid ${sc.color}33`,borderRadius:10,padding:"10px 14px",marginBottom:16}}>
              <div style={{fontSize:10,color:"#B0BDD8",lineHeight:1.6,marginBottom:8}}>{t(`scn.${sc.id}.desc`)}</div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:6}}>
                {sc.goals.map(g=>{
                  const already=earnedMedals.some(m=>m.scenarioId===sc.id&&m.medalId===g.id);
                  return(<span key={g.id} style={{fontSize:9,padding:"2px 6px",background:already?"rgba(94,246,160,0.12)":"rgba(255,255,255,0.10)",border:`1px solid ${already?"rgba(94,246,160,0.4)":"rgba(255,255,255,0.18)"}`,borderRadius:3,color:already?"#5EF6A0":"#DDE2FF"}}>{g.medal} {g.desc?.[lang]||g.desc?.ko}</span>);
                })}
                {sc.hiddenGoals?.map(hg=>{
                  const unlocked=discoveredSecrets.has(`${sc.id}_${hg.id}`);
                  return(<span key={hg.id} style={{fontSize:9,padding:"2px 6px",background:unlocked?"rgba(162,155,254,0.12)":"rgba(255,255,255,0.05)",border:`1px solid ${unlocked?"rgba(162,155,254,0.5)":"rgba(255,255,255,0.10)"}`,borderRadius:3,color:unlocked?"#A29BFE":"#4A5A7A"}} title={unlocked?(hg.desc?.[lang]||hg.desc?.ko):(hg.hint?.[lang]||hg.hint?.ko)}>🔮 {unlocked?(hg.desc?.[lang]||hg.desc?.ko):(hg.hint?.[lang]||hg.hint?.ko)}</span>);
                })}
              </div>
              <div style={{display:"flex",gap:10,fontSize:10,color:"#7788BB"}}>
                <span>💰 ${sc.startMoney.toLocaleString()}</span>
                <span>⏱ {sc.timeLimit}{lang==="ko"?"일":"d"}</span>
                <span>{"★".repeat(sc.difficulty||1)}{"☆".repeat(5-(sc.difficulty||1))}</span>
              </div>
            </div>
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

        <div style={{textAlign:"center",marginTop:24,display:"flex",alignItems:"center",justifyContent:"center",gap:12}}>
          <span style={{fontSize:10,color:"#1A2040",fontFamily:"'Space Mono',monospace"}}>v1.0.0 · Parcadia</span>
          <button style={{background:"none",border:"1px solid rgba(120,140,255,0.2)",color:"#3A4A6A",borderRadius:5,padding:"2px 8px",cursor:"pointer",fontSize:9,fontFamily:"inherit",transition:"all 0.15s"}}
            onClick={()=>setShowAbout(true)}>ℹ️ {lang==="ko"?"소개":"About"}</button>
        </div>
      </div>
    </div>

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
