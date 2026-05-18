import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis } from 'recharts';
import { ZONES, COMBOS, B } from './gameData.js';

const pm={width:20,height:20,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",color:"var(--text-primary)",borderRadius:4,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit",padding:0,transition:"all 0.15s"};

export default function FinancePanel({
  dismissedHints, setDismissedHints,
  lang, t,
  dailyHistory,
  estNet,
  totalRev,
  finRevOpen, setFinRevOpen,
  revBreak,
  finExpOpen, setFinExpOpen,
  stats,
  diffSettings,
  wages,
  loans,
  visitorFactors,
  sat,
  starStr,
  parkRating,
  maxFee,
  pricingMode, setPricingMode,
  ridePrices, setRidePrices,
  cc,
  revPieData,
  chartData,
  avgVisitorRating,
  visitorRatings,
  pressReviews,
  zoneMastery,
  activeCombos,
}) {
  return (
    <>
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

      {/* ── 시너지 조합 패널 ── */}
      <div style={{marginTop:10}}>
        <div style={{fontSize:10,color:"#9B7FFF",letterSpacing:2,textTransform:"uppercase",marginBottom:6,display:"flex",alignItems:"center",gap:6}}>
          <span>✨</span>
          <span>{lang==="ko"?"시너지 조합":"Synergy Combos"}</span>
          {activeCombos.length>0&&<span style={{background:"#9B7FFF33",border:"1px solid #9B7FFF55",borderRadius:20,padding:"1px 6px",fontSize:9,color:"#9B7FFF",marginLeft:"auto"}}>{activeCombos.length} {lang==="ko"?"활성":"active"}</span>}
        </div>
        {COMBOS.map(combo=>{
          const isActive=activeCombos.includes(combo.id);
          return(
            <div key={combo.id} style={{display:"flex",alignItems:"flex-start",gap:6,padding:"5px 7px",marginBottom:3,
              background:isActive?`${combo.color}12`:"rgba(255,255,255,0.02)",
              border:`1px solid ${isActive?combo.color+"55":"rgba(255,255,255,0.06)"}`,
              borderRadius:6,transition:"all 0.2s",opacity:isActive?1:0.45}}>
              <div style={{fontSize:16,lineHeight:1,marginTop:1}}>{combo.emoji}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:4}}>
                  <span style={{fontSize:11,fontWeight:700,color:isActive?combo.color:"#8899BB"}}>{combo.name[lang]||combo.name.ko}</span>
                  {combo.tier===3&&<span style={{fontSize:8,background:combo.color+"33",color:combo.color,borderRadius:3,padding:"1px 4px",flexShrink:0}}>{lang==="ko"?"TRIPLE":"TRIPLE"}</span>}
                  {isActive&&<span style={{fontSize:8,color:"#00E5A0",flexShrink:0}}>✅</span>}
                </div>
                <div style={{fontSize:10,color:isActive?"#DDE2FF":"#445566",marginTop:1}}>{combo.desc[lang]||combo.desc.ko}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:3,marginTop:3}}>
                  {combo.buildings.map(b=>(
                    <span key={b} style={{fontSize:9,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:3,padding:"1px 5px",color:"#6677AA"}}>
                      {B[b]?.emoji} {t(`b.${b}`)}
                    </span>
                  ))}
                  <span style={{fontSize:9,color:"#334455",padding:"1px 0"}}>({lang==="ko"?"반경":"radius"} {combo.radius})</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
