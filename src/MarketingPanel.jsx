import { CAMPAIGNS_DATA } from './gameData.js';

export default function MarketingPanel({
  dismissedHints, setDismissedHints,
  lang, t,
  gameMode,
  rivals,
  day,
  parkRating,
  campaigns,
  currentScenarioData,
  tutorialStep,
  money,
  passOn, setPassOn,
  passPrice, setPassPrice,
  passHolders, passIncome,
  launchCampaign,
}) {
  const pm={width:20,height:20,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",color:"var(--text-primary)",borderRadius:4,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit",padding:0,transition:"all 0.15s"};

  return (
    <>
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
    </>
  );
}
