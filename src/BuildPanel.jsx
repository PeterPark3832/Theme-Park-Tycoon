import React from "react";
import { getReachablePaths, hasPath, playSound } from './gameLogic.js';
import { ZONES, PARCELS, B, SEG_PULL, DEFAULT_RIDE_PRICES, MAX_FEE_BY_STARS } from './gameData.js';
import { getBuildingIcon, hasBuildingIcon } from './buildingIcons.jsx';

const rideList=Object.entries(B).filter(([,b])=>b.cat==="ride");
const shopList=Object.entries(B).filter(([,b])=>b.cat==="shop");
const facilList=Object.entries(B).filter(([,b])=>b.cat==="facility");
const pathList=Object.entries(B).filter(([,b])=>b.cat==="path");
const decoList=Object.entries(B).filter(([,b])=>b.cat==="deco");

export default function BuildPanel({
  lang, t,
  tutorialStep,
  sc,
  buildMode, setBuildMode,
  selected, setSelected,
  zonePaint, setZonePaint,
  multiSelectedCells, setMultiSelectedCells,
  zoneFtueShown, setZoneFtueShown,
  setShowZoneFtue,
  lastDemolishGrid,
  undoDemolish,
  lastBuildGrid, lastBuilt,
  undoBuild,
  clickedTile, setClickedTile,
  grid, setGrid,
  zoneGrid,
  zoneMastery,
  pricingMode,
  ridePrices,
  stats,
  day,
  parkRating,
  fee,
  gameMode,
  startPerk,
  segData,
  clean,
  visitors,
  soundOn,
  addLog,
  setMoney,
  money,
  buildCatFilter, setBuildCatFilter,
  buildFavs, setBuildFavs,
  buildSearch, setBuildSearch,
  buyParcel,
  hovered, setHovered,
  setShowBldInfo,
  currentScenarioData,
  weeklyChallengeMod,
  researched,
  parcels,
  ownedGrid,
  ownedCount,
  repairBuilding,
  upgradeBuilding,
  demolish,
}) {
  return (
    <>
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
                  <button onClick={()=>setBuildCatFilter(buildCatFilter==="fav"?null:"fav")}
                    style={{flex:1,background:buildCatFilter==="fav"?"rgba(255,215,0,0.2)":"rgba(255,255,255,0.04)",border:`1px solid ${buildCatFilter==="fav"?"rgba(255,215,0,0.6)":"rgba(255,255,255,0.08)"}`,borderRadius:4,padding:"3px 2px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:1,fontFamily:"inherit",transition:"all 0.15s",boxShadow:buildCatFilter==="fav"?"0 0 6px rgba(255,215,0,0.4)":"none"}}>
                    <span style={{fontSize:12}}>⭐</span>
                    <span style={{fontSize:7,color:buildCatFilter==="fav"?"#FFD700":"#5566AA",letterSpacing:0.5,fontWeight:buildCatFilter==="fav"?700:400}}>{lang==="ko"?"즐겨찾기":"Favs"}</span>
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
                {/* Favorites-only view */}
                {buildCatFilter==="fav"&&(()=>{
                  const allBuildings=[...rideList,...shopList,...facilList,...pathList,...decoList];
                  const favList=allBuildings.filter(([id])=>buildFavs.has(id));
                  if(favList.length===0) return(<div style={{textAlign:"center",padding:"16px 8px",color:"#5566AA",fontSize:11}}>{lang==="ko"?"⭐ 즐겨찾기한 건물이 없습니다.\n건물 옆 ⭐ 버튼을 눌러 추가하세요.":"⭐ No favorites yet.\nTap ⭐ next to a building to add it."}</div>);
                  return(<div><div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#FFD700",margin:"4px 0 4px",paddingLeft:4,borderLeft:"2px solid #FFD70066"}}>{lang==="ko"?"즐겨찾기":"Favorites"}</div>
                  {favList.map(([id,bd])=>{
                    const isBanned=currentScenarioData?.bannedBuildings?.includes(id)||weeklyChallengeMod?.bannedBuildings?.includes(id);
                    const isLocked=(bd.locked&&!researched.includes("r4")&&gameMode!=="sandbox")||isBanned;
                    const ok=money>=bd.baseCost&&!isLocked,sel=selected===id;
                    return(<div key={id} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 8px",marginBottom:2,background:sel?`${bd.color}18`:"rgba(255,255,255,0.03)",border:sel?`1px solid ${bd.color}88`:`1px solid ${bd.color}22`,borderLeft:sel?`3px solid ${bd.color}`:`3px solid ${bd.color}66`,borderRadius:6,cursor:ok?"pointer":"default",opacity:isLocked?0.35:ok?1:0.35}} onClick={()=>ok&&setSelected(sel?null:id)}>
                      <div style={{width:24,height:24,borderRadius:5,background:`${bd.color}18`,border:`1px solid ${bd.color}33`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        {hasBuildingIcon(id)?getBuildingIcon(id,bd.color,18):<span style={{fontSize:13}}>{bd.emoji}</span>}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:10,fontWeight:700,color:"var(--text-primary)",lineHeight:1.2}}>{t(`b.${id}`)}</div>
                        <div style={{fontSize:9,color:ok?"#FFD93D":"#FF5757",fontFamily:"'Barlow Condensed',monospace"}}>{bd.baseCost===0?t("bld.free"):`$${bd.baseCost.toLocaleString()}`}</div>
                      </div>
                      <button style={{background:"none",border:"none",cursor:"pointer",fontSize:14,padding:2,color:"#FFD700"}} onClick={e=>{e.stopPropagation();setBuildFavs(prev=>{const n=new Set(prev);n.delete(id);try{localStorage.setItem('pt_buildFavs',JSON.stringify([...n]));}catch{}return n;});}} title={lang==="ko"?"즐겨찾기 제거":"Remove favorite"}>⭐</button>
                    </div>);
                  })}</div>);
                })()}
                {[[t("cat.ride"),"ride",rideList],[t("cat.shop"),"shop",shopList],[t("cat.facility"),"facility",facilList],[t("cat.path"),"path",pathList],[t("cat.deco"),"deco",decoList]].map(([lbl,cat,list])=>{
                  if(buildCatFilter&&buildCatFilter!==cat&&buildCatFilter!=="fav") return null;
                  if(buildCatFilter==="fav") return null;
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
                          <button style={{background:"none",border:"none",cursor:"pointer",fontSize:12,padding:"0 2px",color:buildFavs.has(id)?"#FFD700":"#3A4A6A",flexShrink:0,lineHeight:1}} onClick={e=>{e.stopPropagation();setBuildFavs(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);try{localStorage.setItem('pt_buildFavs',JSON.stringify([...n]));}catch{}return n;});}} title={lang==="ko"?"즐겨찾기":"Favorite"}>{buildFavs.has(id)?"⭐":"☆"}</button>
                          <button style={{background:"none",border:"none",cursor:"pointer",fontSize:11,padding:"0 2px",color:"#4D9FFF88",flexShrink:0,lineHeight:1}} onClick={e=>{e.stopPropagation();setShowBldInfo(id);}} title={lang==="ko"?"건물 정보":"Building info"}>ℹ</button>
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
    </>
  );
}
