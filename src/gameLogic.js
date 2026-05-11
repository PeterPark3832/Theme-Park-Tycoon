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
    if (grid[r][c]?.type === "entrance") { er = r; ec = c; break outer; }
  }
  const reach = new Set();
  if (er < 0) return reach;
  const q = [];
  [[er - 1, ec], [er + 1, ec], [er, ec - 1], [er, ec + 1]].forEach(([nr, nc]) => {
    if (nr >= 0 && nr < GR && nc >= 0 && nc < GC) {
      const t = grid[nr][nc]?.type;
      if (t === "_path" || t === "_pathFancy") {
        const k = `${nr},${nc}`;
        if (!reach.has(k)) { reach.add(k); q.push([nr, nc]); }
      }
    }
  });
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
  for(let r=0;r<GR;r++) for(let c=0;c<GC;c++){
    const cell=grid[r][c]; if(!cell) continue;
    if(cell.broken){brokenCount++;continue;}
    const bd=B[cell.type]; if(!bd) continue;
    const st=bd.stats(cell.level);
    const zSize=zoneInfo.cellSize[r]?.[c]||0;
    const zAdj=zoneInfo.cellAdjacentZones[r]?.[c];
    const zm=getZM(cell.type,zg?.[r]?.[c],zSize,zAdj);
    const passive=bd.cat==="path"||bd.cat==="deco";
    const ok=passive||!anyPaths||hasPath(reach,r,c);
    if(!ok) isolatedCount++;
    const pm=ok?1:0.6;
    attraction+=st.attraction*zm.am*pm*(bd.cat==="ride"?rb.attractionMult:1);
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
    const cell = grid[r][c]; if (!cell || cell.broken) continue;
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
    const cell = grid[r][c]; if (cell) cc[cell.type] = (cc[cell.type] || 0) + 1;
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
    const cell = grid[r][c]; if (cell) cc[cell.type] = (cc[cell.type] || 0) + 1;
  }
  return Object.entries(req).every(([k, v]) => (cc[k] || 0) >= v);
}

export function bldCounts(grid) {
  const c = {};
  for (let r = 0; r < GR; r++) for (let co = 0; co < GC; co++) {
    const cell = grid[r][co]; if (cell) c[cell.type] = (c[cell.type] || 0) + 1;
  }
  return c;
}

export function calcParkRating(grid, zg, stats, sat, clean) {
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
  const final = Math.round(avg * 0.65 + min * 0.35);
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
    attractionMult: (h("r1") ? 1.15 : 1) * (h("ex4") ? 1.30 : 1),
    breakMult: h("r2") ? 0.5 : 1,
    capacityBonus: h("r3") ? 1.25 : 1,
    vipUnlocked: h("r4"),
    admissionMult: h("c1") ? 1.20 : 1,
    passRateMult: h("c2") ? 1.5 : 1,
    rpvMult: h("c3") ? 1.20 : 1,
    passIncomeMult: h("c4") ? 1.5 : 1,
    maintenanceMult: h("ex3") ? baseMaint * 0.80 : baseMaint,
    autoRepairBonus: (h("o4") ? 0.2 : 0) + (h("ex3") ? 0.3 : 0),
    cleanBonus: h("o2") ? 5 : 0,
    prestigeRateMult: h("p3") ? 1.56 : h("p1") ? 1.3 : 1,
    coupleBonus: h("p2") ? 0.20 : 0,
    globalVisBonus: (h("p4") ? 0.25 : 0) + (h("ex2") ? 0.20 : 0),
    holidayEventMult: h("ex1") ? 1.30 : 1.0,
  };
}

export function loadSaveSlots() {
  try {
    // v2 먼저 시도
    const v2 = localStorage.getItem("parktycoon_v2_saves");
    if (v2) return JSON.parse(v2);

    // v1 마이그레이션
    const v1 = localStorage.getItem("parktycoon_v1_saves");
    if (v1) {
      // v2로 저장 (자동 마이그레이션)
      localStorage.setItem("parktycoon_v2_saves", v1);
      return JSON.parse(v1);
    }

    return [null, null, null];
  } catch {
    return [null, null, null];
  }
}

export function writeSaveSlots(slots) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(slots)); } catch {}
}

export const mkGrid = () => Array(GR).fill(null).map(() => Array(GC).fill(null));
export const mkOwned = (restrict) => Array(GR).fill(null).map((_, r) => Array(GC).fill(null).map((_, c) => {
  if (restrict) { return c >= restrict.cols[0] && c <= restrict.cols[1]; }
  return c <= 7;
}));

export function timeAgoL(ts, t) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return t("misc.just");
  if (s < 3600) return `${Math.floor(s / 60)}${t("misc.minsAgo")}`;
  if (s < 86400) return `${Math.floor(s / 3600)}${t("misc.hrsAgo")}`;
  return `${Math.floor(s / 86400)}${t("misc.daysAgo")}`;
}

export function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    const now = ctx.currentTime;
    switch (type) {
      case "build": osc.type = "sine"; osc.frequency.setValueAtTime(523, now); osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); gain.gain.setValueAtTime(0.18, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22); break;
      case "demolish": osc.type = "sawtooth"; osc.frequency.setValueAtTime(220, now); osc.frequency.exponentialRampToValueAtTime(80, now + 0.15); gain.gain.setValueAtTime(0.22, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22); break;
      case "upgrade": osc.type = "sine"; osc.frequency.setValueAtTime(440, now); osc.frequency.setValueAtTime(550, now + 0.08); osc.frequency.setValueAtTime(660, now + 0.16); gain.gain.setValueAtTime(0.15, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3); break;
      case "mission": osc.type = "sine"; osc.frequency.setValueAtTime(523, now); osc.frequency.setValueAtTime(659, now + 0.12); osc.frequency.setValueAtTime(784, now + 0.24); gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45); break;
      case "disaster": osc.type = "square"; osc.frequency.setValueAtTime(160, now); osc.frequency.exponentialRampToValueAtTime(100, now + 0.3); gain.gain.setValueAtTime(0.25, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35); break;
      case "weather": osc.type = "sine"; osc.frequency.setValueAtTime(350, now); gain.gain.setValueAtTime(0.08, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15); break;
      default: return;
    }
    osc.start(now); osc.stop(now + 0.5);
  } catch (e) {}
}