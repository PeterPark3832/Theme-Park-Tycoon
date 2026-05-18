import { STAFF, STAFF_UPGRADES, LOAN_OPTS } from './gameData.js';

export default function ManagePanel({
  dismissedHints, setDismissedHints,
  lang, t,
  sat, satTrend, satTrendColor,
  satFactors,
  segEntries, segs, totalSegW,
  revPerVis,
  varietyWarn, dominantPersonality,
  tutorialStep, tutTabVisited,
  fee, setFee,
  maxFee, gameMode,
  hired, hire, fire,
  staffLevels,
  stats, diffSettings, wages,
  money,
  upgradeStaff,
  loans, takeLoan,
}) {
  const pm={width:20,height:20,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",color:"var(--text-primary)",borderRadius:4,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit",padding:0,transition:"all 0.15s"};

  return (
    <>
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
    </>
  );
}
