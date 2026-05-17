// src/gameLogic.js — 순수 함수들

import {
  GC, GR, SAVE_KEY,
  TR as _TR,
  B, SEG_PULL, LEAGUES,
  WEATHERS, WEATHER_WEIGHTS, STAGES,
} from './gameData.js';

export function tFn(lang) {
  return (key, params) => {
    let str = _TR[lang]?.[key] ?? _TR.en?.[key] ?? key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), () => String(v));
      });
    }
    return str;
  };
}

export function pickWeather(si) {
  const w = WEATHER_WEIGHTS[si];
  const tot = w.reduce((a, b) => a + b, 0);
  let r = Math.random() * tot;
  for (let i = 0; i < WEATHERS.length; i++) {
    r -= w[i];
    if (r <= 0) return WEATHERS[i];
  }
  return WEATHERS[0];
}

export function getReachablePaths(grid) {
  let er = -1, ec = -1;
  outer: for (let r = 0; r < GR; r++) for (let c = 0; c < GC; c++) {
    if (grid[r][c]?.type === "entrance" && !grid[r][c]?.ref) { er = r; ec = c; break outer; }
  }
  const reach = new Set();
  if (er < 0) return reach;
  const q = [];
  // BFS seed: all neighbors of the entire entrance footprint
  const ew = B["entrance"]?.size?.w || 2;
  const eh = B["entrance"]?.size?.h || 1;
  for (let dr = 0; dr < eh; dr++) {
    for (let dc = 0; dc < ew; dc++) {
      [[er+dr-1,ec+dc],[er+dr+1,ec+dc],[er+dr,ec+dc-1],[er+dr,ec+dc+1]].forEach(([nr,nc])=>{
        if (nr>=0&&nr<GR&&nc>=0&&nc<GC) {
          const t=grid[nr][nc]?.type;
          if ((t==="_path"||t==="_pathFancy")) {
            const k=`${nr},${nc}`;
            if (!reach.has(k)) { reach.add(k); q.push([nr,nc]); }
          }
        }
      });
    }
  }
  while (q.length) {
    const [r, c] = q.shift();
    [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].forEach(([nr, nc]) => {
      if (nr >= 0 && nr < GR && nc >= 0 && nc < GC) {
        const t = grid[nr][nc]?.type;
        if (t === "_path" || t === "_pathFancy") {
          const k = `${nr},${nc}`;
          if (!reach.has(k)) { reach.add(k); q.push([nr, nc]); }
        }
      }
    });
  }
  return reach;
}

export function hasPath(reach, r, c) {
  return [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].some(
    ([nr, nc]) => nr >= 0 && nr < GR && nc >= 0 && nc < GC && reach.has(`${nr},${nc}`)
  );
}

export function hasBuildingPath(reach, anchorR, anchorC, w, h) {
  for (let dr = 0; dr < h; dr++)
    for (let dc = 0; dc < w; dc++)
      if (hasPath(reach, anchorR + dr, anchorC + dc)) return true;
  return false;
}

export function calcZoneInfo(zg) {
  const GR_=zg.length, GC_=zg[0]?.length||0;
  const visited=Array(GR_).fill(null).map(()=>Array(GC_).fill(false));
  const cellSize=Array(GR_).fill(null).map(()=>Array(GC_).fill(0));
  const cellAdjacentZones=Array(GR_).fill(null).map(()=>Array(GC_).fill(null).map(()=>new Set()));
  for(let r=0;r<GR_;r++) for(let c=0;c<GC_;c++) {
    if(!zg[r][c]||visited[r][c]) continue;
    const zone=zg[r][c];
    const queue=[[r,c]], cells=[];
    visited[r][c]=true;
    while(queue.length){
      const[cr,cc]=queue.shift(); cells.push([cr,cc]);
      for(const[nr,nc] of [[cr-1,cc],[cr+1,cc],[cr,cc-1],[cr,cc+1]]){
        if(nr>=0&&nr<GR_&&nc>=0&&nc<GC_&&!visited[nr][nc]&&zg[nr][nc]===zone){
          visited[nr][nc]=true; queue.push([nr,nc]);
        }
      }
    }
    cells.forEach(([cr,cc])=>{ cellSize[cr][cc]=cells.length; });
  }
  // Compute adjacent zone types for each cell
  for(let r=0;r<GR_;r++) for(let c=0;c<GC_;c++){
    if(!zg[r][c]) continue;
    for(const[nr,nc] of [[r-1,c],[r+1,c],[r,c-1],[r,c+1]]){
      if(nr>=0&&nr<GR_&&nc>=0&&nc<GC_&&zg[nr][nc]&&zg[nr][nc]!==zg[r][c]){
        cellAdjacentZones[r][c].add(zg[nr][nc]);
      }
    }
  }
  // Park-wide zone diversity bonus
  const allZoneTypes=new Set();
  for(let r=0;r<GR_;r++) for(let c=0;c<GC_;c++) if(zg[r][c]) allZoneTypes.add(zg[r][c]);
  const diversityBonus=allZoneTypes.size>=4?1.15:allZoneTypes.size>=3?1.08:allZoneTypes.size>=2?1.03:1.0;
  return{cellSize, cellAdjacentZones, diversityBonus, zoneTypeCount:allZoneTypes.size};
}

export function getZM(type, zone, zoneSize, adjacentZones) {
  if(!zone) return{am:1,rm:1,sm:1};
  if(zoneSize!==undefined&&zoneSize<3) return{am:1,rm:1,sm:1}; // min 3 cells to activate
  const sizeMult=zoneSize>=10?2.0:zoneSize>=6?1.5:1.0;
  const cat=B[type]?.cat;
  let am=1,rm=1,sm=1;
  if(zone==="thrill"){ if(cat==="ride") am=1.25*sizeMult; }
  else if(zone==="family"){ if(cat==="facility") sm=1.3*sizeMult; }
  else if(zone==="food"){ if(cat==="shop") rm=1.3*sizeMult; }
  else if(zone==="nature"){ if(type==="garden"||type==="fountain"){am=1.2*sizeMult;sm=1.3*sizeMult;} }
  else if(zone==="vip"){ rm=1.2*sizeMult; }
  // Cross-zone adjacency bonuses
  if(adjacentZones&&adjacentZones.size>0){
    if(zone==="thrill"&&adjacentZones.has("food")) rm=Math.max(rm,1.12);
    if(zone==="food"&&adjacentZones.has("thrill")) rm*=1.12;
    if(zone==="vip"&&adjacentZones.has("nature")){am*=1.1;rm*=1.1;}
    if(zone==="nature"&&adjacentZones.has("family")) sm*=1.15;
    if(zone==="family"&&adjacentZones.has("food")) sm*=1.1;
    if(zone==="family"&&adjacentZones.has("nature")) sm*=1.08;
  }
  return{am,rm,sm};
}

export function calcStats(grid, zg, hired, rb) {
  let attraction=0,rpv=0,maintenance=0,satBonus=0,capacity=0;
  let hasEntrance=false,brokenCount=0,isolatedCount=0;
  const anyPaths=grid.some(r=>r.some(c=>c?.type==="_path"||c?.type==="_pathFancy"));
  const reach=anyPaths?getReachablePaths(grid):new Set();
  const zoneInfo=calcZoneInfo(zg);
  // pre-count ride types for stacking diminishing returns
  const rideTypeCounts={};
  for(let r=0;r<GR;r++) for(let c=0;c<GC;c++){
    const cell=grid[r][c]; if(!cell||cell.ref||cell.broken) continue;
    const bd=B[cell.type]; if(bd?.cat==="ride"&&cell.type!=="entrance") rideTypeCounts[cell.type]=(rideTypeCounts[cell.type]||0)+1;
  }
  const rideTypeIdx={};
  for(let r=0;r<GR;r++) for(let c=0;c<GC;c++){
    const cell=grid[r][c]; if(!cell||cell.ref) continue;
    if(cell.broken){brokenCount++;continue;}
    const bd=B[cell.type]; if(!bd) continue;
    const st=bd.stats(cell.level);
    const zSize=zoneInfo.cellSize[r]?.[c]||0;
    const zAdj=zoneInfo.cellAdjacentZones[r]?.[c];
    const zm=getZM(cell.type,zg?.[r]?.[c],zSize,zAdj);
    const passive=bd.cat==="path"||bd.cat==="deco";
    const w=bd.size?.w||1, h=bd.size?.h||1;
    const ok=passive||!anyPaths||hasBuildingPath(reach,r,c,w,h);
    if(!ok) isolatedCount++;
    const pm=ok?1:0.6;
    // stacking diminishing returns: same ride type 3rd+ instance → ×0.8
    let stackMult=1;
    if(bd.cat==="ride"&&cell.type!=="entrance"){
      rideTypeIdx[cell.type]=(rideTypeIdx[cell.type]||0)+1;
      if(rideTypeIdx[cell.type]>=3) stackMult=0.8;
    }
    attraction+=st.attraction*zm.am*pm*stackMult*(bd.cat==="ride"?rb.attractionMult:1);
    rpv+=st.rpv*zm.rm*pm*(bd.cat==="shop"?rb.rpvMult:1);
    maintenance+=st.maintenance;
    satBonus+=(st.satBonus||0)*zm.sm*pm;
    if(st.cap>0) capacity+=Math.floor(st.cap*(bd.cat==="ride"?rb.capacityBonus:1));
    if(cell.type==="entrance") hasEntrance=true;
  }
  return{
    attraction:attraction*zoneInfo.diversityBonus,
    rpv:rpv*zoneInfo.diversityBonus,
    maintenance:maintenance*rb.maintenanceMult*Math.max(0.6,1-hired.mechanic*0.1),
    satBonus,capacity,hasEntrance,brokenCount,isolatedCount,
    zoneInfo,
  };
}

export function calcSegs(grid) {
  const sc = { family: 0, couple: 0, thrill: 0, child: 0 };
  for (let r = 0; r < GR; r++) for (let c = 0; c < GC; c++) {
    const cell = grid[r][c]; if (!cell || cell.ref || cell.broken) continue;
    const p = SEG_PULL[cell.type]; if (!p) continue;
    for (const [k, v] of Object.entries(p)) sc[k] = (sc[k] || 0) + v * (1 + cell.level * 0.3);
  }
  const tot = Object.values(sc).reduce((t, v) => t + v, 0);
  if (tot === 0) return { family: 0.2, couple: 0.2, thrill: 0.2, child: 0.1, general: 0.3 };
  const G = 0.12, rem = 1 - G, res = { general: G };
  for (const [k, v] of Object.entries(sc)) res[k] = (v / tot) * rem;
  return res;
}

export function segSatMod(grid, segs) {
  const cc = {};
  for (let r = 0; r < GR; r++) for (let c = 0; c < GC; c++) {
    const cell = grid[r][c]; if (cell && !cell.ref) cc[cell.type] = (cc[cell.type] || 0) + 1;
  }
  let mod = 0;
  if ((segs.family || 0) > 0.15) mod += (cc.carousel && cc.restroom) ? (segs.family * 8) : -(segs.family * 6);
  if ((segs.couple || 0) > 0.15) mod += (cc.fountain || cc.garden) ? (segs.couple * 10) : -(segs.couple * 7);
  if ((segs.thrill || 0) > 0.15) mod += (cc.rollerCoaster || cc.thrillRide || cc.dropTower) ? (segs.thrill * 10) : -(segs.thrill * 8);
  if ((segs.child || 0) > 0.1) mod += (cc.carousel || cc.iceCream || cc.miniTrain || cc.arcade) ? (segs.child * 7) : -(segs.child * 5);
  return Math.max(-15, Math.min(12, mod));
}

export function checkVIPReq(grid, req) {
  if (!req || !Object.keys(req).length) return true;
  const cc = {};
  for (let r = 0; r < GR; r++) for (let c = 0; c < GC; c++) {
    const cell = grid[r][c]; if (cell && !cell.ref) cc[cell.type] = (cc[cell.type] || 0) + 1;
  }
  return Object.entries(req).every(([k, v]) => (cc[k] || 0) >= v);
}

export function bldCounts(grid) {
  const c = {};
  for (let r = 0; r < GR; r++) for (let co = 0; co < GC; co++) {
    const cell = grid[r][co]; if (cell && !cell.ref) c[cell.type] = (c[cell.type] || 0) + 1;
  }
  return c;
}

export function calcParkRating(grid, zg, stats, sat, clean, prestigeBonus = 0) {
  const cc = bldCounts(grid);
  const rideTypes = Object.keys(cc).filter(k => B[k]?.cat === "ride" && k !== "entrance");
  const decoCount = Object.entries(cc).filter(([k]) => B[k]?.cat === "deco").reduce((t, [, v]) => t + v, 0);
  const pathCount = Object.entries(cc).filter(([k]) => B[k]?.cat === "path").reduce((t, [, v]) => t + v, 0);
  const zoneCount = zg.reduce((t, row) => t + row.filter(Boolean).length, 0);
  const attraction = Math.min(100, Math.min(40, rideTypes.length * 6) + Math.min(60, stats.attraction * 0.8));
  const scenery = Math.min(100, decoCount * 10 + zoneCount * 4 + pathCount * 2);
  const satisfaction = sat;
  const operations = Math.min(100, Math.max(0, clean * 0.5 + 50 - stats.brokenCount * 12 - stats.isolatedCount * 4));
  const scores = { attraction, scenery, satisfaction, operations };
  const vals = Object.values(scores);
  const avg = vals.reduce((t, v) => t + v, 0) / 4;
  const min = Math.min(...vals);
  const presBonus = Math.min(8, prestigeBonus * 0.05);
  const final = Math.round(avg * 0.65 + min * 0.35 + presBonus);
  const stars = final < 20 ? 1 : final < 40 ? 2 : final < 60 ? 3 : final < 78 ? 4 : 5;
  return { scores, final, stars };
}

export function calcRideTicketRev(cc, vis, totalAttr, ridePrices, pricingMode) {
  if (pricingMode === "admission") return 0;
  return Object.entries(cc)
    .filter(([k]) => B[k]?.cat === "ride" && k !== "entrance")
    .reduce((total, [type, cnt]) => {
      const price = ridePrices[type] || 0;
      if (!price) return total;
      const attr = B[type]?.stats(0).attraction || 0;
      const share = totalAttr > 0 ? (attr / totalAttr) * 1.3 : 0;
      return total + vis * share * price * cnt;
    }, 0);
}

export function avgShopMult(cc, shopMults) {
  let wp = 0, t = 0;
  Object.entries(cc).filter(([k]) => B[k]?.cat === "shop").forEach(([type, cnt]) => {
    const rpv = (B[type]?.stats(0).rpv || 0) * cnt;
    wp += rpv * (shopMults[type] || 1);
    t += rpv;
  });
  return t > 0 ? wp / t : 1;
}

export function calcStage(totalBld, stars, money) {
  let s = STAGES[0];
  for (const st of STAGES) {
    if (totalBld >= st.req.bld && stars >= st.req.stars && money >= st.req.money) s = st;
  }
  return s;
}

export function stageVisBonus(stage) { return [0, 0, 0.10, 0.15, 0.25, 0.40][stage.id] || 0; }
export function stageRevBonus(stage) { return [0, 0, 0, 0.10, 0.20, 0.30][stage.id] || 0; }

export function calcLeague(medals) {
  const bronzeCount = medals.filter(m => ["bronze", "silver", "gold"].includes(m.medalId)).length;
  const silverCount = medals.filter(m => ["silver", "gold"].includes(m.medalId)).length;
  const goldCount = medals.filter(m => m.medalId === "gold").length;
  const scenarios = new Set(medals.filter(m => m.medalId === "gold").map(m => m.scenarioId)).size;
  if (goldCount >= 5 && scenarios >= 5) return LEAGUES[3];
  if (goldCount >= 5) return LEAGUES[2];
  if (silverCount >= 3) return LEAGUES[1];
  if (bronzeCount >= 1) return LEAGUES[0];
  return null;
}

export function getRB(r) {
  const h = id => r.includes(id);
  const baseMaint = h("o4") ? 0.70 : h("o3") ? 0.75 : h("o1") ? 0.85 : 1;
  return {
    attractionMult: (h("r1") ? 1.15 : 1) * (h("ex4") ? 1.30 : 1) * (h("r5") ? 1.20 : 1),
    breakMult: h("r2") ? (h("o5") ? 0.25 : 0.5) : (h("o5") ? 0.60 : 1),
    capacityBonus: (h("r3") ? 1.25 : 1) * (h("ex5") ? 1.50 : 1),
    vipUnlocked: h("r4"),
    admissionMult: (h("c1") ? 1.20 : 1) * (h("c5") ? 1.15 : 1),
    passRateMult: h("c2") ? 1.5 : 1,
    rpvMult: (h("c3") ? 1.20 : 1) * (h("c5") ? 1.25 : 1),
    passIncomeMult: h("c4") ? 1.5 : 1,
    maintenanceMult: h("ex3") ? baseMaint * 0.80 : baseMaint,
    autoRepairBonus: (h("o4") ? 0.2 : 0) + (h("ex3") ? 0.3 : 0),
    cleanBonus: h("o2") ? 5 : 0,
    prestigeRateMult: (h("p3") ? 1.56 : h("p1") ? 1.3 : 1) * (h("p5") ? 2.0 : 1),
    coupleBonus: h("p2") ? 0.20 : 0,
    globalVisBonus: (h("p4") ? 0.25 : 0) + (h("ex2") ? 0.20 : 0) + (h("p5") ? 0.35 : 0) + (h("ex5") ? 0.20 : 0),
    holidayEventMult: h("ex1") ? 1.30 : 1.0,
  };
}

export function loadSaveSlots() {
  const pad=(arr)=>Array.isArray(arr)&&arr.length<5?[...arr,...Array(5-arr.length).fill(null)]:arr||[null,null,null,null,null];
  try {
    const v2 = localStorage.getItem("parktycoon_v2_saves");
    if (v2) return pad(JSON.parse(v2));
    const v1 = localStorage.getItem("parktycoon_v1_saves");
    if (v1) {
      localStorage.setItem("parktycoon_v2_saves", v1);
      return pad(JSON.parse(v1));
    }
    return [null, null, null, null, null];
  } catch {
    return [null, null, null, null, null];
  }
}

export function writeSaveSlots(slots) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(slots));
    return { ok: true };
  } catch (e) {
    const isQuota = e instanceof DOMException &&
      (e.code === 22 || e.code === 1014 || e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED');
    return { ok: false, quota: isQuota };
  }
}

export const mkGrid = () => Array(GR).fill(null).map(() => Array(GC).fill(null));
export const mkOwned = (restrict) => Array(GR).fill(null).map((_, r) => Array(GC).fill(null).map((_, c) => {
  if (restrict) { return c >= restrict.cols[0] && c <= restrict.cols[1]; }
  return c >= 12 && c <= 27; // center 16 columns — expands left+right
}));

export function timeAgoL(ts, t) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return t("misc.just");
  if (s < 3600) return `${Math.floor(s / 60)}${t("misc.minsAgo")}`;
  if (s < 86400) return `${Math.floor(s / 3600)}${t("misc.hrsAgo")}`;
  return `${Math.floor(s / 86400)}${t("misc.daysAgo")}`;
}

function _getAudioCtx() {
  try {
    if (!window._ptAudioCtx || window._ptAudioCtx.state === 'closed') {
      window._ptAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (window._ptAudioCtx.state === 'suspended') window._ptAudioCtx.resume().catch(() => {});
    return window._ptAudioCtx;
  } catch { return null; }
}

let _sfxVol = 1.0;
export function setSfxVolume(v){ _sfxVol = Math.max(0, Math.min(1, v)); }

export function playSound(type, bldType) {
  try {
    const ctx = _getAudioCtx(); if (!ctx) return;
    const now = ctx.currentTime;
    const note = (f, t, dur, wt, vol) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = wt; o.frequency.value = f;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol * _sfxVol, t + 0.015);
      g.gain.linearRampToValueAtTime(0, t + dur);
      o.start(t); o.stop(t + dur + 0.01);
    };
    // determine building category for contextual build sound
    const isShop = ["snackBar","iceCream","restaurant","giftShop","arcade"].includes(bldType);
    const isRide = ["rollerCoaster","thrillRide","dropTower","carousel","miniTrain"].includes(bldType);
    switch (type) {
      case "build":
        if (isShop) {
          // coin register: two quick high notes
          note(1046, now, 0.08, "sine", 0.18); note(1318, now + 0.09, 0.08, "sine", 0.14);
        } else if (isRide) {
          // mechanical chug: low sawtooth ramp
          note(110, now, 0.06, "sawtooth", 0.20); note(138, now + 0.06, 0.06, "sawtooth", 0.18); note(165, now + 0.12, 0.10, "sawtooth", 0.14);
        } else {
          // default: rising scale
          note(523, now, 0.12, "sine", 0.18); note(659, now + 0.10, 0.10, "sine", 0.15); note(880, now + 0.20, 0.12, "sine", 0.12);
        }
        break;
      case "demolish": note(220, now, 0.08, "sawtooth", 0.22); note(150, now+0.07, 0.08, "sawtooth", 0.18); note(80, now+0.15, 0.10, "sawtooth", 0.14); break;
      case "upgrade": note(440, now, 0.08, "sine", 0.15); note(550, now+0.08, 0.08, "sine", 0.14); note(660, now+0.16, 0.10, "sine", 0.13); note(880, now+0.26, 0.12, "sine", 0.12); break;
      case "mission": note(523, now, 0.12, "sine", 0.20); note(659, now+0.12, 0.12, "sine", 0.18); note(784, now+0.24, 0.18, "sine", 0.16); break;
      case "disaster": note(160, now, 0.12, "square", 0.25); note(120, now+0.10, 0.14, "square", 0.22); note(80, now+0.22, 0.18, "square", 0.18); break;
      case "weather": note(350, now, 0.15, "sine", 0.08); break;
      case "buyLand":
        note(261, now,       0.10, "sine",     0.18);
        note(392, now+0.09,  0.10, "sine",     0.16);
        note(523, now+0.18,  0.12, "sine",     0.15);
        note(784, now+0.30,  0.22, "triangle", 0.14);
        break;
      case "hire":
        note(880,  now,      0.06, "triangle", 0.14);
        note(1108, now+0.07, 0.09, "triangle", 0.12);
        break;
      case "combo":
        [523,659,784,988,1175,1319].forEach((f,i)=>{ note(f, now+i*0.045, 0.20, "sine", Math.max(0.05, 0.13-i*0.015)); });
        break;
      case "achievement":
        note(392,  now,      0.10, "triangle", 0.18);
        note(494,  now+0.10, 0.10, "triangle", 0.18);
        note(587,  now+0.20, 0.10, "triangle", 0.18);
        note(784,  now+0.30, 0.38, "triangle", 0.22);
        note(523,  now+0.30, 0.38, "sine",     0.12);
        note(659,  now+0.30, 0.38, "sine",     0.10);
        break;
      case "fanfare":
        // triumphant fanfare: C-E-G-C arpeggio
        note(523, now,       0.15, "triangle", 0.22);
        note(659, now+0.14,  0.15, "triangle", 0.22);
        note(784, now+0.28,  0.15, "triangle", 0.22);
        note(1046,now+0.42,  0.30, "triangle", 0.20);
        note(523, now,       0.55, "sine",     0.10);
        break;
      default: return;
    }
  } catch (e) {}
}

export function startDisasterDrum(volume = 0.18) {
  try {
    const ctx = _getAudioCtx(); if (!ctx) return () => {};
    const mg = ctx.createGain(); mg.gain.value = volume; mg.connect(ctx.destination);
    let stopped = false;
    const beat = () => {
      if (stopped) return;
      const t = ctx.currentTime;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(mg); o.type = 'sine';
      o.frequency.setValueAtTime(80, t); o.frequency.exponentialRampToValueAtTime(35, t + 0.2);
      g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      o.start(t); o.stop(t + 0.3);
      setTimeout(beat, 1400);
    };
    beat();
    return () => { stopped = true; try { mg.disconnect(); } catch {} };
  } catch { return () => {}; }
}

export function startCrowdNoise() {
  try {
    const ctx = _getAudioCtx(); if (!ctx) return { setVolume: () => {}, stop: () => {} };
    const bufLen = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const bpf = ctx.createBiquadFilter(); bpf.type = 'bandpass'; bpf.frequency.value = 800; bpf.Q.value = 0.5;
    const gainNode = ctx.createGain(); gainNode.gain.value = 0;
    src.connect(bpf); bpf.connect(gainNode); gainNode.connect(ctx.destination);
    src.start();
    return {
      setVolume: v => { gainNode.gain.setTargetAtTime(Math.max(0, Math.min(0.12, v)), ctx.currentTime, 0.5); },
      stop: () => { try { src.stop(); gainNode.disconnect(); } catch {} },
    };
  } catch { return { setVolume: () => {}, stop: () => {} }; }
}
