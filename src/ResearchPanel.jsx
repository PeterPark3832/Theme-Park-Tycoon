import { RESEARCH, RB_BRANCHES } from './gameData.js';

export default function ResearchPanel({
  dismissedHints, setDismissedHints,
  lang, t,
  researchPoints, setResearchPoints,
  researched,
  doResearch,
  resImpact,
  parkRating,
  gameMode, currentScenario, difficulty, startPerk,
  prestigeBonus, setPrestigeBonus,
  startGame, addLog,
}) {
  const allResearched = researched.length >= RESEARCH.length;
  const is5Star = parkRating.stars >= 5;

  const RP_COSMETICS = [
    {id:"rpc_fancy_path",cost:20,emoji:"🟫",name:{ko:"황금 통로 테마",en:"Golden Path Theme"},desc:{ko:"통로가 황금빛으로 빛납니다",en:"Paths shimmer with golden hue"},apply:()=>addLog(lang==="ko"?"✨ 황금 통로 테마 적용! (장식 효과)":"✨ Golden Path Theme applied!")},
    {id:"rpc_confetti",cost:15,emoji:"🎊",name:{ko:"축제 폭죽 효과",en:"Festival Confetti"},desc:{ko:"방문객 도착시 폭죽 효과 강화",en:"Enhanced confetti on visitor arrival"},apply:()=>addLog(lang==="ko"?"🎊 축제 폭죽 효과 활성화!":"🎊 Festival Confetti enabled!")},
    {id:"rpc_neon",cost:25,emoji:"💜",name:{ko:"네온 건물 테두리",en:"Neon Building Borders"},desc:{ko:"건물에 네온 빛 테두리 효과",en:"Neon glow borders on buildings"},apply:()=>addLog(lang==="ko"?"💜 네온 테두리 효과 활성화!":"💜 Neon borders enabled!")},
  ];

  return (
    <>
      {!dismissedHints.includes("tab_research") && (
        <div style={{background:"rgba(162,155,254,0.06)",border:"1px solid rgba(162,155,254,0.3)",borderRadius:7,padding:"7px 10px",marginBottom:6,display:"flex",gap:8,alignItems:"flex-start",animation:"slide-in 0.2s ease"}}>
          <span style={{fontSize:14,flexShrink:0}}>🔬</span>
          <div style={{flex:1,fontSize:10,color:"#A29BFE",lineHeight:1.6}}>{lang==="ko"?"RP(연구 포인트)로 영구 업그레이드를 해금하세요. 먼저 🎠 놀이기구 브랜치의 고성능 엔진을 추천합니다":"Spend RP to unlock permanent upgrades. Start with 🎠 Ride branch — High Perf. Engine is recommended"}</div>
          <button style={{background:"none",border:"none",color:"#7788BB",cursor:"pointer",fontSize:12,flexShrink:0}} onClick={()=>{const nd=[...dismissedHints,"tab_research"];setDismissedHints(nd);try{localStorage.setItem('dismissedHints',JSON.stringify(nd));}catch{}}}>✕</button>
        </div>
      )}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:researchPoints<2?4:6,padding:"4px 6px",background:"#1A1A2A",borderRadius:5,border:"1px solid #A29BFE33"}}>
        <div><div style={{fontSize:10,color:"#A29BFE",letterSpacing:2}}>{t("res.points")}</div><div style={{fontSize:16,fontWeight:900,color:"#A29BFE"}}>{researchPoints} RP</div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:10,color:"#666688"}}>{t("res.complete")}</div><div style={{fontSize:12,fontWeight:700,color:"#5EF6A0"}}>{researched.length}/{RESEARCH.length}</div></div>
      </div>
      {researchPoints < 2 && (
        <div style={{fontSize:10,color:"#7788BB",background:"#A29BFE08",border:"1px solid #A29BFE18",borderRadius:5,padding:"5px 7px",marginBottom:5,lineHeight:1.6}}>
          💡 {lang==="ko"?"방문객이 올수록 RP가 쌓입니다. 기본 2RP/일 + 방문객 20명당 +1RP":"RP earned daily. Base 2 RP/day + 1 RP per 20 visitors"}
        </div>
      )}
      {Object.entries(RB_BRANCHES).map(([bKey, branch]) => {
        const items = RESEARCH.filter(r => r.branch === bKey).sort((a, b) => a.tier - b.tier);
        return (
          <div key={bKey} style={{marginBottom:6}}>
            <div style={{display:"flex",alignItems:"center",gap:3,marginBottom:2,padding:"2px 4px",background:branch.color+"18",borderRadius:3,border:`1px solid ${branch.color}33`}}>
              <span style={{fontSize:11}}>{branch.emoji}</span>
              <span style={{fontSize:10,fontWeight:800,color:branch.color}}>{t(`br.${bKey}`)}</span>
            </div>
            {items.map(r => {
              const done = researched.includes(r.id), reqDone = !r.req || researched.includes(r.req);
              const canDo = reqDone && !done && researchPoints >= r.cost, locked = !reqDone && !done;
              return (
                <div key={r.id} style={{display:"flex",alignItems:"center",gap:3,padding:"3px 4px",marginBottom:2,background:done?"#0A1A0A":locked?"#0A0A14":"#181828",border:`1px solid ${done?"#5EF6A044":locked?"#2A2A3A":branch.color+"44"}`,borderRadius:4,opacity:locked?0.5:1}}>
                  <span style={{fontSize:12,filter:locked?"grayscale(1)":"none"}}>{r.emoji}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:10,fontWeight:700,color:done?"#5EF6A0":locked?"#555577":branch.color}}>{t(`res.${r.id}.name`)}{done?" ✅":locked?" 🔒":""}</div>
                    <div style={{fontSize:10,color:"#666688"}}>{t(`res.${r.id}.effect`)}</div>
                    {!done && (()=>{const imp=resImpact(r.id);return imp?<div style={{fontSize:9,color:"#A29BFE",marginTop:1}}>↳ {imp}</div>:null;})()}
                  </div>
                  {!done && (
                    <button style={{background:canDo?branch.color+"22":"transparent",border:`1px solid ${canDo?branch.color:"#2A2A4A"}`,color:canDo?branch.color:"#3A3A5A",borderRadius:3,padding:"2px 4px",cursor:canDo?"pointer":"default",fontSize:10,fontFamily:"inherit"}}
                      onClick={() => canDo && doResearch(r.id)}>{r.cost}RP</button>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      {researchPoints >= 5 && researched.length >= Math.floor(RESEARCH.length / 2) && (()=>{
        const unlockedCosmetics = (()=>{try{return JSON.parse(localStorage.getItem('pt_cosmetics')||'[]');}catch{return[];}})();
        return (
          <div style={{marginTop:8,background:"rgba(255,217,61,0.04)",border:"1px solid rgba(255,217,61,0.2)",borderRadius:6,padding:"8px 8px 4px"}}>
            <div style={{fontSize:9,color:"#FFD93D",letterSpacing:2,textTransform:"uppercase",marginBottom:6,fontWeight:700}}>✨ {lang==="ko"?"코스메틱 언락":"Cosmetic Unlocks"}</div>
            {RP_COSMETICS.map(c => {
              const owned = unlockedCosmetics.includes(c.id);
              const canBuy = !owned && researchPoints >= c.cost;
              return (
                <div key={c.id} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 4px",marginBottom:4,background:owned?"rgba(0,229,160,0.05)":"rgba(255,255,255,0.02)",border:`1px solid ${owned?"rgba(0,229,160,0.2)":"rgba(255,217,61,0.15)"}`,borderRadius:4}}>
                  <span style={{fontSize:14}}>{c.emoji}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:10,fontWeight:700,color:owned?"#00E5A0":"#FFD93D"}}>{c.name[lang]||c.name.ko}{owned?" ✅":""}</div>
                    <div style={{fontSize:9,color:"#666688"}}>{c.desc[lang]||c.desc.ko}</div>
                  </div>
                  {!owned && (
                    <button style={{background:canBuy?"rgba(255,217,61,0.15)":"transparent",border:`1px solid ${canBuy?"rgba(255,217,61,0.4)":"#2A2A4A"}`,color:canBuy?"#FFD93D":"#3A3A5A",borderRadius:3,padding:"2px 5px",cursor:canBuy?"pointer":"default",fontSize:10,fontFamily:"inherit",flexShrink:0}}
                      onClick={()=>{
                        if(!canBuy) return;
                        setResearchPoints(p=>p-c.cost);
                        const nc=[...unlockedCosmetics,c.id];
                        try{localStorage.setItem('pt_cosmetics',JSON.stringify(nc));}catch{}
                        c.apply();
                      }}>{c.cost}RP</button>
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}

      {allResearched && is5Star && (
        <div style={{marginTop:10,background:"linear-gradient(135deg,rgba(255,217,61,0.08),rgba(155,127,255,0.08))",border:"2px solid rgba(255,217,61,0.4)",borderRadius:8,padding:10}}>
          <div style={{fontSize:10,color:"#FFD93D",fontWeight:800,letterSpacing:2,marginBottom:4}}>👑 {lang==="ko"?"프레스티지 재시작":"PRESTIGE RESTART"}</div>
          <div style={{fontSize:10,color:"#A29BFE",lineHeight:1.6,marginBottom:8}}>
            {lang==="ko"?"모든 연구를 완료하고 5성 공원을 달성했습니다! 프레스티지 재시작으로 영구 방문객 보너스 +20%를 얻고 새 게임을 시작할 수 있습니다.":"All research done & 5★ park achieved! Prestige restart grants a permanent +20% visitor bonus for your next run."}
          </div>
          <div style={{fontSize:10,color:"#FFD93D",background:"rgba(255,217,61,0.08)",borderRadius:4,padding:"3px 6px",marginBottom:8,display:"inline-block"}}>
            {lang==="ko"?"현재 프레스티지 보너스":"Current prestige bonus"}: +{Math.round(prestigeBonus)}pt
          </div>
          <button style={{width:"100%",background:"linear-gradient(135deg,rgba(255,217,61,0.25),rgba(155,127,255,0.15))",border:"1px solid rgba(255,217,61,0.6)",color:"#FFD93D",borderRadius:6,padding:"7px 0",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:800,letterSpacing:1}}
            onClick={()=>{
              const bonusToKeep = prestigeBonus + 20;
              startGame(gameMode || "sandbox", currentScenario, difficulty, startPerk, null);
              setTimeout(() => setPrestigeBonus(bonusToKeep), 100);
              addLog(lang==="ko"?`👑 프레스티지 재시작! 영구 보너스 +${bonusToKeep}pt 유지됩니다`:`👑 Prestige restart! Permanent bonus +${bonusToKeep}pt carries over`);
            }}>
            👑 {lang==="ko"?"프레스티지 재시작":"Prestige Restart"} (+20pt)
          </button>
        </div>
      )}
    </>
  );
}
