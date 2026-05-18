import { SCENARIOS, SCENARIO_CLEAR_FLAVOR, SCENARIO_CLEAR_REWARDS } from './gameData.js';

export default function ScenarioResultModal({
  result, earnedMedals, currentScenario, difficulty, startPerk,
  totalRev, sat, stats, lang, t,
  onBackMenu, onRetry, onNextScenario, onContinue,
}) {
  if (!result) return null;

  const bestMedal = earnedMedals
    .filter(m => m.scenarioId === currentScenario)
    .sort((a, b) =>
      ['bronze','silver','gold','platinum'].indexOf(b.medalId) -
      ['bronze','silver','gold','platinum'].indexOf(a.medalId)
    )[0];

  const allScenarios = SCENARIOS.filter(s => s.id !== 's_sandbox');
  const curIdx = allScenarios.findIndex(s => s.id === result?.scenario);
  const nextScenario = curIdx >= 0 && curIdx < allScenarios.length - 1 ? allScenarios[curIdx + 1] : null;

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(2,5,16,0.92)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100}}>
      <div style={{background:"linear-gradient(135deg,#0D1235,#080B20)",border:`3px solid ${result.medal?"rgba(255,217,61,0.5)":"rgba(255,87,87,0.4)"}`,borderRadius:20,padding:"36px 44px",textAlign:"center",maxWidth:380,boxShadow:`0 20px 60px rgba(0,0,0,0.8), 0 0 40px ${result.medal?"rgba(255,217,61,0.1)":"rgba(255,87,87,0.1)"}`,animation:"slide-in 0.3s ease",fontFamily:"'Rajdhani','Barlow Condensed',sans-serif"}}>
        {result.medal ? (
          <>
            <div style={{fontSize:104,marginBottom:8}}>{result.medal}</div>
            <div style={{fontSize:22,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:2,color:"#FFD93D",marginBottom:6}}>{t("res.success")}</div>
            <div style={{fontSize:12,color:"#9B7FFF",marginBottom:6}}>{t(`scn.${result.scenario}`)}</div>
            <div style={{fontSize:10,color:"#6B7CA1",marginBottom:8}}>Day {result.day} {t("misc.done")}</div>
            {SCENARIO_CLEAR_FLAVOR?.[result.scenario] && (
              <div style={{fontSize:11,color:"#9B7FFF",fontStyle:"italic",marginBottom:12,lineHeight:1.6,padding:"8px 12px",background:"rgba(155,127,255,0.06)",borderRadius:6,border:"1px solid rgba(155,127,255,0.15)"}}>
                "{SCENARIO_CLEAR_FLAVOR[result.scenario][lang] || SCENARIO_CLEAR_FLAVOR[result.scenario].ko}"
              </div>
            )}
            {bestMedal && SCENARIO_CLEAR_REWARDS[bestMedal.medalId] && (
              <div style={{background:"rgba(255,217,61,0.1)",border:"1px solid #FFD93D44",borderRadius:8,padding:"8px 12px",marginTop:8,marginBottom:12,textAlign:"center"}}>
                <div style={{fontSize:10,color:"#FFD93D",fontWeight:700}}>🎁 {lang==="ko"?"클리어 보상":"Clear Reward"}</div>
                <div style={{fontSize:16,fontWeight:900,color:"#FFD93D",fontFamily:"'Barlow Condensed',sans-serif",marginTop:3}}>
                  +{SCENARIO_CLEAR_REWARDS[bestMedal.medalId].rp} RP
                </div>
                <div style={{fontSize:9,color:"#AA9933",marginTop:2}}>
                  {SCENARIO_CLEAR_REWARDS[bestMedal.medalId].bonus[lang] || SCENARIO_CLEAR_REWARDS[bestMedal.medalId].bonus.ko}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{fontSize:48,marginBottom:8}}>{result.bankrupt ? "💸" : "⏰"}</div>
            <div style={{fontSize:20,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:2,color:"#FF5757",marginBottom:6}}>
              {result.bankrupt ? (lang==="ko"?"파산!":"Bankrupt!") : t("res.timeout")}
            </div>
            <div style={{fontSize:10,color:"#6B7CA1",marginBottom:12}}>
              {result.bankrupt
                ? (lang==="ko"?"5일 연속 적자로 공원이 폐쇄됐습니다.":"Park closed due to 5 consecutive days of losses.")
                : t("res.failDesc")}
            </div>
            <div style={{background:"rgba(255,87,87,0.07)",border:"1px solid rgba(255,87,87,0.2)",borderRadius:8,padding:"10px 12px",marginBottom:16,textAlign:"left"}}>
              <div style={{fontSize:10,fontWeight:700,color:"#FF5757",letterSpacing:1,marginBottom:8}}>📊 {lang==="ko"?"실패 분석":"Failure Analysis"}</div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:10}}>
                <span style={{color:"#6B7CA1"}}>{lang==="ko"?"누적 수익":"Total Revenue"}</span>
                <span style={{color:"#FFD93D",fontWeight:700}}>${totalRev.toLocaleString()}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:10}}>
                <span style={{color:"#6B7CA1"}}>{lang==="ko"?"운영 일수":"Days Operated"}</span>
                <span style={{color:"#9B7FFF",fontWeight:700}}>{result.day}</span>
              </div>
              <div style={{fontSize:9,color:"#FF9F43",fontWeight:600,marginBottom:4}}>💡 {lang==="ko"?"개선 팁:":"Tips to improve:"}</div>
              {[
                sat < 50 && (lang==="ko"?"😊 만족도가 낮았습니다. 청소부를 고용하고 혼잡도를 줄이세요.":"😊 Low satisfaction. Hire janitors & reduce congestion."),
                totalRev < 1000 && (lang==="ko"?"💰 수익이 너무 적었습니다. 놀이기구를 늘리고 입장료를 조정하세요.":"💰 Too little revenue. Add attractions & adjust admission fees."),
                stats.hasEntrance === false && (lang==="ko"?"🎪 입구 게이트가 없었습니다. 반드시 배치하세요!":"🎪 No entrance gate was placed. This is required!"),
                stats.brokenCount > 2 && (lang==="ko"?"🔧 시설 고장이 많았습니다. 정비공을 고용하세요.":"🔧 Too many broken facilities. Hire mechanics."),
              ].filter(Boolean).slice(0, 2).map((tip, i) => (
                <div key={i} style={{fontSize:9,color:"#8899BB",marginBottom:3,paddingLeft:8,borderLeft:"2px solid #FF5757"}}>
                  {tip}
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
          <button style={{background:"rgba(255,217,61,0.12)",border:"2px solid rgba(255,217,61,0.5)",color:"#FFD93D",borderRadius:10,padding:"10px 20px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",transition:"all 0.15s"}}
            onClick={onBackMenu}>
            {t("res.backMenu")}
          </button>
          {!result?.medal && currentScenario && (
            <button style={{background:"linear-gradient(135deg,rgba(255,87,87,0.18),rgba(255,159,67,0.10))",border:"2px solid rgba(255,87,87,0.6)",color:"#FF7F7F",borderRadius:10,padding:"10px 20px",cursor:"pointer",fontSize:12,fontWeight:800,fontFamily:"inherit",transition:"all 0.15s",letterSpacing:1}}
              onClick={onRetry}>
              🔄 {lang==="ko"?"다시 시도":"Retry"}
            </button>
          )}
          {result?.medal && nextScenario && (
            <button style={{background:"linear-gradient(135deg,rgba(0,229,160,0.2),rgba(77,159,255,0.1))",border:"2px solid rgba(0,229,160,0.7)",color:"#00E5A0",borderRadius:10,padding:"10px 20px",cursor:"pointer",fontSize:12,fontWeight:800,fontFamily:"inherit",transition:"all 0.15s",letterSpacing:1}}
              onClick={() => onNextScenario(nextScenario)}>
              ▶ {lang==="ko"?`다음 시나리오: ${nextScenario.name?.ko||nextScenario.id}`:`Next: ${nextScenario.name?.en||nextScenario.id}`}
            </button>
          )}
          <button style={{background:"rgba(0,229,160,0.06)",border:"1px solid rgba(0,229,160,0.3)",color:"#00E5A0",borderRadius:10,padding:"10px 20px",cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit",transition:"all 0.15s"}}
            onClick={onContinue}>
            {t("res.continue")}
          </button>
        </div>
      </div>
    </div>
  );
}
