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

export function startMusicEngine(mg,ctx){
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
