/**
 * IsoGridCanvas.jsx — Phase 1: Isometric canvas renderer
 *
 * Replaces the CSS grid with a canvas-based isometric view.
 * Building placeholder boxes will be swapped for PNG sprites in Phase 2.
 *
 * Drawing pipeline per frame:
 *   1. Ground tiles   (back → front, painter's algorithm)
 *   2. Zone tints     (per tile)
 *   3. Hover / selection highlights
 *   4. Buildings      (placeholder isometric box or sprite when ready)
 *   5. Visitor dots   (colored circles)
 */
import { useRef, useEffect } from 'react';
import {
  isoToScreen, pickCell, inBounds,
  getBuildingDepth, getDotScreenPos, getBuildingAnchorScreen,
  calcCameraOrigin, zoomAtPoint, clampCameraPan,
  TILE_W, TILE_H,
} from './isoEngine.js';
import { GR, GC, B, ZONES } from './gameData.js';
import { getSprite } from './spriteLoader.js';

// ── Tile texture cache ───────────────────────────────────────────────────────

const TILE_TEX = {};
function loadTileTex(key, path) {
  if (TILE_TEX[key]) return;
  const img = new Image();
  img.src = path;
  TILE_TEX[key] = img;
}
// Pre-load all tile textures
loadTileTex('empty',      '/sprites/ground_empty.jpg');
loadTileTex('owned',      '/sprites/ground_owned.jpg');
loadTileTex('path',       '/sprites/ground_path.jpg');
loadTileTex('pathFancy',  '/sprites/ground_path_fancy.jpg');
loadTileTex('zone_thrill','/sprites/zone_thrill.jpg');
loadTileTex('zone_family','/sprites/zone_family.jpg');
loadTileTex('zone_food',  '/sprites/zone_food.jpg');
loadTileTex('zone_nature','/sprites/zone_nature.jpg');

// ── Constants ────────────────────────────────────────────────────────────────

const SEG_COLORS = {
  couple:  '#FF6B9D',
  family:  '#FF9F43',
  thrill:  '#FF4757',
  child:   '#48DBFB',
  general: '#C7B8EA',
};

const GROUND = {
  empty:     { fill: '#090C1C', stroke: '#141A30' },
  owned:     { fill: '#0D1124', stroke: '#1C254A' },
  path:      { fill: '#241D0D', stroke: '#3C3018' },
  pathFancy: { fill: '#382B07', stroke: '#604D14' },
};

const ZONE_TINT = {
  thrill:  'rgba(255,107,157,0.20)',
  family:  'rgba(77,159,255,0.20)',
  food:    'rgba(255,217,61,0.20)',
  nature:  'rgba(29,209,161,0.20)',
  vip:     'rgba(155,127,255,0.20)',
};

const ZOOM_MIN = 0.4;
const ZOOM_MAX = 4.0;

// Placeholder building height in logical px at zoom=1
function bldH(size) { return Math.max(36, (size.w + size.h) * 14); }

// ── Color utilities ──────────────────────────────────────────────────────────

function hexRgb(hex) {
  const h = hex.replace('#', '');
  return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16) };
}
function shade(hex, f) {
  const { r,g,b } = hexRgb(hex);
  return `rgb(${Math.min(255,r*f|0)},${Math.min(255,g*f|0)},${Math.min(255,b*f|0)})`;
}

// ── Draw primitives ──────────────────────────────────────────────────────────

function diamondPath(ctx, x, hw, y, hh) {
  ctx.beginPath();
  ctx.moveTo(x,      y);
  ctx.lineTo(x + hw, y + hh);
  ctx.lineTo(x,      y + 2 * hh);
  ctx.lineTo(x - hw, y + hh);
  ctx.closePath();
}

function drawDiamond(ctx, row, col, cam, fill, stroke, lineW = 0.5, texKey = null) {
  const { x, y } = isoToScreen(row, col, cam);
  const hw = (TILE_W / 2) * cam.zoom;
  const hh = (TILE_H / 2) * cam.zoom;
  diamondPath(ctx, x, hw, y, hh);
  const tex = texKey && TILE_TEX[texKey];
  if (tex?.complete && tex.naturalWidth > 0) {
    ctx.save();
    ctx.clip();
    ctx.drawImage(tex, x - hw, y, hw * 2, hh * 2);
    ctx.restore();
    diamondPath(ctx, x, hw, y, hh);
  } else {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineW; ctx.stroke(); }
}

function drawBuildingBox(ctx, row, col, size, color, level, broken, cam) {
  const h   = bldH(size) * cam.zoom;
  const N   = isoToScreen(row,          col,           cam);
  const E   = isoToScreen(row,          col + size.w,  cam);
  const S   = isoToScreen(row + size.h, col + size.w,  cam);
  const W   = isoToScreen(row + size.h, col,           cam);
  const Nt  = { x: N.x, y: N.y - h };
  const Et  = { x: E.x, y: E.y - h };
  const St  = { x: S.x, y: S.y - h };
  const Wt  = { x: W.x, y: W.y - h };

  // Level 0 = 60 %, level 1 = 80 %, level 2 = 100 % brightness
  const br  = [0.6, 0.8, 1.0][level] ?? 0.6;
  const top = shade(color, br);
  const lft = shade(color, br * 0.55);
  const rgt = shade(color, br * 0.70);
  const out = broken ? '#FF4757' : shade(color, br * 0.32);

  // Left face (SW wall)
  ctx.beginPath();
  ctx.moveTo(Wt.x,Wt.y); ctx.lineTo(St.x,St.y); ctx.lineTo(S.x,S.y); ctx.lineTo(W.x,W.y);
  ctx.closePath(); ctx.fillStyle = lft; ctx.fill();
  ctx.strokeStyle = out; ctx.lineWidth = broken ? 1.5 : 0.4; ctx.stroke();

  // Right face (SE wall)
  ctx.beginPath();
  ctx.moveTo(Et.x,Et.y); ctx.lineTo(St.x,St.y); ctx.lineTo(S.x,S.y); ctx.lineTo(E.x,E.y);
  ctx.closePath(); ctx.fillStyle = rgt; ctx.fill();
  ctx.strokeStyle = out; ctx.lineWidth = broken ? 1.5 : 0.4; ctx.stroke();

  // Top face
  ctx.beginPath();
  ctx.moveTo(Nt.x,Nt.y); ctx.lineTo(Et.x,Et.y); ctx.lineTo(St.x,St.y); ctx.lineTo(Wt.x,Wt.y);
  ctx.closePath(); ctx.fillStyle = top; ctx.fill();
  ctx.strokeStyle = broken ? '#FF475788' : shade(color, br * 1.4);
  ctx.lineWidth = broken ? 1.5 : 0.4; ctx.stroke();

  // Level stars on top face
  if (level > 0) {
    const mx = (Nt.x + St.x) / 2, my = (Nt.y + St.y) / 2;
    ctx.font = `bold ${Math.max(7, 9 * cam.zoom)}px sans-serif`;
    ctx.fillStyle = '#FFD93D';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(level === 2 ? '★★' : '★', mx, my);
  }

  // Broken wrench
  if (broken) {
    const mx = (Nt.x + St.x) / 2, my = (Nt.y + St.y) / 2 - 10 * cam.zoom;
    ctx.font = `${Math.max(10, 13 * cam.zoom)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔧', mx, my);
  }
}

function drawDot(ctx, dot, cam) {
  const pos  = getDotScreenPos(dot.r, dot.c, cam, 0.5, 0.75);
  const r    = Math.max(2.5, 4.5 * cam.zoom);
  const col  = SEG_COLORS[dot.segType] || '#C7B8EA';
  ctx.save();
  ctx.globalAlpha = dot.state === 'leaving' ? 0.35 : 1;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
  ctx.fillStyle = col;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.55)';
  ctx.lineWidth = 0.7;
  ctx.stroke();
  ctx.restore();
}

// ── Component ────────────────────────────────────────────────────────────────

export default function IsoGridCanvas({
  grid, zoneGrid, ownedGrid, obstacleMap,
  dots, clickedTile,
  selected, selBd, buildMode, hovFootprintValid,
  multiSelectedCells,
  isMobile,
  onCellClick, onCellHover, onCellLeave, onDragBuild,
}) {
  const canvasRef = useRef(null);
  const drawRef   = useRef(null);
  const rafRef    = useRef(null);
  const camRef    = useRef({ originX: 0, originY: 0, zoom: isMobile ? 0.7 : 1.0, panX: 0, panY: 0 });
  const stateRef  = useRef({});
  const hoverRef  = useRef(null);
  const drag      = useRef({ type: null, sx0: 0, sy0: 0, panX0: 0, panY0: 0, lastCell: null, moved: false });
  const pinch     = useRef({ on: false, d0: 0, z0: 1, mx: 0, my: 0 });

  // Sync React state → ref every render so the rAF loop sees latest values
  useEffect(() => {
    stateRef.current = {
      grid, zoneGrid, ownedGrid, obstacleMap,
      dots, clickedTile,
      selected, selBd, buildMode, hovFootprintValid,
      multiSelectedCells,
    };
  });

  // ── Canvas resize (DPR-aware) ──────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const dpr    = window.devicePixelRatio || 1;

    function resize() {
      const { width: w, height: h } = canvas.parentElement.getBoundingClientRect();
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width  = `${w}px`;
      canvas.style.height = `${h}px`;
      const { originX, originY } = calcCameraOrigin(w, h);
      camRef.current = { ...camRef.current, originX, originY };
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);
    resize();
    return () => ro.disconnect();
  }, []);

  // ── Scroll-wheel zoom (non-passive) ────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    function onWheel(e) {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const fx = e.clientX - rect.left;
      const fy = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      const newZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, camRef.current.zoom * factor));
      camRef.current = zoomAtPoint(camRef.current, newZoom, fx, fy);
    }
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, []);

  // ── rAF draw loop ──────────────────────────────────────────────────────────
  useEffect(() => {
    function tick() {
      drawRef.current?.();
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Assigned below — always points to latest closure (reads stateRef/camRef)
  drawRef.current = function draw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const ctx = canvas.getContext('2d');
    const W   = canvas.width  / dpr;
    const H   = canvas.height / dpr;
    const {
      grid, zoneGrid, ownedGrid,
      dots, clickedTile,
      selected, selBd, buildMode, hovFootprintValid,
      multiSelectedCells,
    } = stateRef.current;
    const cam   = camRef.current;
    const hover = hoverRef.current;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#070A1C';
    ctx.fillRect(0, 0, W, H);

    // ─ Collect renderable items ─
    const items = [];
    if (grid) {
      for (let r = 0; r < GR; r++) {
        for (let c = 0; c < GC; c++) {
          const cell = grid[r][c];
          if (cell?.ref) continue; // non-anchor cells skipped (drawn via anchor)
          const bd   = cell ? B[cell.type] : null;
          const size = bd?.size || { w: 1, h: 1 };
          items.push({ row: r, col: c, cell, size,
            zone:  zoneGrid?.[r]?.[c] || null,
            owned: ownedGrid?.[r]?.[c] || false,
          });
        }
      }
      // Painter's algorithm: low (row+col) = back, high = front
      items.sort((a, b) =>
        getBuildingDepth(a.row, a.col, a.size) -
        getBuildingDepth(b.row, b.col, b.size)
      );
    }

    // ─ 1. Ground tiles ─
    for (const { row, col, cell, zone, owned } of items) {
      const isPath  = cell?.type === '_path' || cell?.type === '_pathFancy';
      const isFancy = cell?.type === '_pathFancy';
      let texKey, g;
      if (!owned)        { texKey = 'empty';     g = GROUND.empty; }
      else if (isFancy)  { texKey = 'pathFancy';  g = GROUND.pathFancy; }
      else if (isPath)   { texKey = 'path';       g = GROUND.path; }
      else               { texKey = 'owned';      g = GROUND.owned; }
      drawDiamond(ctx, row, col, cam, g.fill, g.stroke, 0.5, texKey);
      if (zone) {
        const zoneTex = `zone_${zone}`;
        if (TILE_TEX[zoneTex]) {
          drawDiamond(ctx, row, col, cam, ZONE_TINT[zone] || 'rgba(255,255,255,0.15)', null, 0, zoneTex);
        } else if (ZONE_TINT[zone]) {
          drawDiamond(ctx, row, col, cam, ZONE_TINT[zone], null);
        }
      }
    }

    // ─ 2. Hover / footprint preview ─
    if (hover) {
      if (selected && selBd && buildMode === 'build') {
        const sw  = selBd.size?.w || 1, sh = selBd.size?.h || 1;
        const col = hovFootprintValid ? 'rgba(0,229,160,0.22)' : 'rgba(255,87,87,0.22)';
        const str = hovFootprintValid ? '#00E5A066'           : '#FF475766';
        for (let dr = 0; dr < sh; dr++)
          for (let dc = 0; dc < sw; dc++)
            drawDiamond(ctx, hover.row + dr, hover.col + dc, cam, col, str, 1);
      } else if (buildMode === 'demolish') {
        drawDiamond(ctx, hover.row, hover.col, cam, 'rgba(255,87,87,0.15)', '#FF475744', 1);
      } else {
        drawDiamond(ctx, hover.row, hover.col, cam, 'rgba(255,255,255,0.07)', '#FFFFFF22', 0.6);
      }
    }

    // ─ 3. Selection highlights ─
    if (clickedTile) {
      const bd   = B[clickedTile.cell?.type];
      const size = bd?.size || { w: 1, h: 1 };
      for (let dr = 0; dr < size.h; dr++)
        for (let dc = 0; dc < size.w; dc++)
          drawDiamond(ctx, clickedTile.r + dr, clickedTile.c + dc, cam, 'rgba(255,217,61,0.20)', '#FFD93D88', 1.5);
    }
    if (multiSelectedCells?.size) {
      for (const key of multiSelectedCells) {
        const [r, c] = key.split(',').map(Number);
        drawDiamond(ctx, r, c, cam, 'rgba(255,87,87,0.20)', '#FF475788', 1.5);
      }
    }

    // ─ 4. Buildings ─
    for (const { row, col, cell, size } of items) {
      if (!cell || cell.ref) continue;
      const isPath = cell.type === '_path' || cell.type === '_pathFancy';
      if (isPath) continue;
      const bd = B[cell.type];
      if (!bd) continue;
      const level = cell.level || 0;

      const sprite = getSprite(cell.type, level);
      if (sprite) {
        // Anchor at south (front-bottom) corner of footprint
        const anchor = getBuildingAnchorScreen(row, col, size, cam);
        // Scale: sprite width = footprint diagonal width (1:1)
        const fW = (size.w + size.h) * (TILE_W / 2) * cam.zoom;
        const sW = fW;
        const sH = (sprite.naturalHeight / sprite.naturalWidth) * sW;
        ctx.drawImage(sprite, anchor.x - sW / 2, anchor.y - sH, sW, sH);
        // Broken: red outline + wrench icon, no fill so sprite stays visible
        if (cell.broken) {
          ctx.save();
          ctx.strokeStyle = '#FF4757';
          ctx.lineWidth = 2 * cam.zoom;
          ctx.strokeRect(anchor.x - sW / 2, anchor.y - sH, sW, sH);
          ctx.restore();
          ctx.font = `${Math.max(10, 14 * cam.zoom)}px sans-serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('🔧', anchor.x, anchor.y - sH * 0.6);
        }
      } else {
        drawBuildingBox(ctx, row, col, size, bd.color || '#4D9FFF', level, !!cell.broken, cam);
      }
    }

    // ─ 5. Visitor dots ─
    if (dots) {
      for (const dot of dots) {
        if (!inBounds(Math.floor(dot.r), Math.floor(dot.c))) continue;
        drawDot(ctx, dot, cam);
      }
    }

    ctx.restore();
  };

  // ── Interaction helpers ────────────────────────────────────────────────────

  function canvasXY(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    return { sx: e.clientX - rect.left, sy: e.clientY - rect.top };
  }

  function cellAt(sx, sy) { return pickCell(sx, sy, camRef.current); }

  function onMouseDown(e) {
    if (e.button !== 0) return; // left button only
    const { sx, sy } = canvasXY(e);
    const cell = cellAt(sx, sy);
    const { selected: sel, buildMode: bm } = stateRef.current;
    const selSize = stateRef.current.selBd?.size;
    const is1x1   = (selSize?.w || 1) === 1 && (selSize?.h || 1) === 1;
    const isBuild  = bm === 'build' && sel && is1x1;
    const isDemol  = bm === 'demolish';

    if (isBuild || isDemol) {
      drag.current = { type: bm, sx0: sx, sy0: sy, lastCell: cell, moved: false, panX0: 0, panY0: 0 };
      if (cell && isBuild) onDragBuild?.(cell.row, cell.col);
    } else {
      drag.current = { type: 'pan', sx0: sx, sy0: sy, panX0: camRef.current.panX, panY0: camRef.current.panY, moved: false, lastCell: null };
    }
    e.preventDefault();
  }

  function onMouseMove(e) {
    const { sx, sy } = canvasXY(e);
    const d  = drag.current;
    const dx = sx - d.sx0, dy = sy - d.sy0;
    if (Math.hypot(dx, dy) > 3) d.moved = true;

    // Camera pan
    if (d.type === 'pan' && d.moved) {
      const canvas = canvasRef.current;
      const dpr    = window.devicePixelRatio || 1;
      camRef.current = clampCameraPan(
        { ...camRef.current, panX: d.panX0 + dx, panY: d.panY0 + dy },
        canvas.width / dpr, canvas.height / dpr
      );
    }

    // Drag-build / drag-demolish
    if ((d.type === 'build' || d.type === 'demolish') && d.moved) {
      const cell = cellAt(sx, sy);
      if (cell && (!d.lastCell || d.lastCell.row !== cell.row || d.lastCell.col !== cell.col)) {
        d.lastCell = cell;
        onDragBuild?.(cell.row, cell.col);
      }
    }

    // Hover
    const cell = cellAt(sx, sy);
    if (cell) {
      if (!hoverRef.current || hoverRef.current.row !== cell.row || hoverRef.current.col !== cell.col) {
        hoverRef.current = cell;
        onCellHover?.(cell);
      }
    } else if (hoverRef.current) {
      hoverRef.current = null;
      onCellLeave?.();
    }
  }

  function onMouseUp(e) {
    const d = drag.current;
    if (!d.moved) {
      const { sx, sy } = canvasXY(e);
      const cell = cellAt(sx, sy);
      if (cell) onCellClick?.(cell.row, cell.col);
    }
    drag.current = { type: null, moved: false, sx0: 0, sy0: 0, panX0: 0, panY0: 0, lastCell: null };
  }

  function onMouseLeave() {
    drag.current.type = null;
    hoverRef.current  = null;
    onCellLeave?.();
  }

  // Touch
  function touchDist(t) { return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY); }

  function onTouchStart(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.touches.length === 2) {
      const rect = canvasRef.current.getBoundingClientRect();
      pinch.current = {
        on: true,
        d0: touchDist(e.touches),
        z0: camRef.current.zoom,
        mx: (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left,
        my: (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top,
        panX0: camRef.current.panX,
        panY0: camRef.current.panY,
      };
      drag.current.type = null;
    } else if (e.touches.length === 1) {
      onMouseDown({ button: 0, clientX: e.touches[0].clientX, clientY: e.touches[0].clientY, preventDefault: () => {} });
    }
  }

  function onTouchMove(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.touches.length === 2 && pinch.current.on) {
      const dist    = touchDist(e.touches);
      const newZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, pinch.current.z0 * dist / pinch.current.d0));
      camRef.current = zoomAtPoint(camRef.current, newZoom, pinch.current.mx, pinch.current.my);
    } else if (e.touches.length === 1 && !pinch.current.on) {
      onMouseMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
    }
  }

  function onTouchEnd(e) {
    e.preventDefault();
    e.stopPropagation();
    pinch.current.on = false;
    if (e.changedTouches.length > 0 && e.touches.length === 0) {
      onMouseUp({ clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY });
    }
  }

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%', cursor: 'crosshair', touchAction: 'none' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    />
  );
}
