export default function SettingsModal({uiSettings,setUiSettings,soundOn,setSoundOn,bgMusicOn,setBgMusicOn,bgVolume,setBgVolume,onClose,lang}){
  const fzLabel={small:lang==="ko"?"작게":"Small",medium:lang==="ko"?"보통":"Medium",large:lang==="ko"?"크게":"Large"};
  return(
    <div role="presentation" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div role="dialog" aria-modal={true} aria-label={lang==="ko"?"설정":"Settings"} style={{background:"#0C1128",border:"1px solid rgba(100,120,255,0.3)",borderRadius:12,padding:24,minWidth:"min(280px,calc(100vw - 32px))",maxWidth:"min(360px,calc(100vw - 24px))",boxShadow:"0 8px 40px rgba(0,0,0,0.8)"}} onClick={e=>e.stopPropagation()}>
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
        {soundOn&&<div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:"#8899BB",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>{lang==="ko"?"효과음 볼륨":"SFX Volume"}</div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:10,color:"#6B7CA1",minWidth:24}}>🔉</span>
            <input type="range" min="0" max="100" value={Math.round((uiSettings.sfxVol??1)*100)} onChange={e=>setUiSettings(p=>({...p,sfxVol:Number(e.target.value)/100}))}
              style={{flex:1,accentColor:"#00E5A0",cursor:"pointer"}}/>
            <span style={{fontSize:10,color:"#6B7CA1",minWidth:28}}>{Math.round((uiSettings.sfxVol??1)*100)}%</span>
          </div>
        </div>}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:"#8899BB",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>{lang==="ko"?"색각 지원 모드":"Colorblind Mode"}</div>
          <button style={{width:"100%",padding:"7px 0",background:uiSettings.colorBlind?"rgba(255,159,67,0.15)":"rgba(255,255,255,0.04)",border:`1px solid ${uiSettings.colorBlind?"rgba(255,159,67,0.5)":"rgba(255,255,255,0.10)"}`,color:uiSettings.colorBlind?"#FF9F43":"#8899BB",borderRadius:6,cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:600,transition:"all 0.15s"}}
            onClick={()=>setUiSettings(p=>({...p,colorBlind:!p.colorBlind}))}>{uiSettings.colorBlind?(lang==="ko"?"🎨 색각 모드 켜짐":"🎨 Colorblind On"):(lang==="ko"?"🎨 색각 모드 꺼짐":"🎨 Colorblind Off")}</button>
        </div>
        <button style={{width:"100%",padding:"8px 0",background:"rgba(100,120,255,0.12)",border:"1px solid rgba(100,120,255,0.3)",color:"#8899CC",borderRadius:6,cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:600,marginTop:4}} onClick={onClose}>{lang==="ko"?"닫기":"Close"}</button>
      </div>
    </div>
  );
}
