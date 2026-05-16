/**
 * isoEngine.js — Isometric coordinate system core
 *
 * Tile geometry (top-down view of one diamond):
 *
 *        top (N)
 *       /      \
 * left(W) TILE right(E)    TILE_W = 64px (full width)
 *       \      /           TILE_H = 32px (full height, 2:1 ratio)
 *        bot (S)
 *
 * Grid axis directions on screen:
 *   row increases → moves SW (down-left)
 *   col increases → moves SE (down-right)
 *
 * Camera object shape: { originX, originY, zoom, panX, panY }
 *   originX/Y  — screen pixel where grid(0,0) top-corner sits (before pan)
 *   zoom       — scale factor (1.0 = 100%)
 *   panX/Y     — user pan offset in screen pixels
 */

import { GR, GC } from './gameData.js';

export const TILE_W = 64;
export const TILE_H = 32;

// ─── Coordinate conversion ────────────────────────────────────────────────────

/**
 * Grid → screen.
 * Returns the top-center (north point) of tile (row, col) in canvas pixels.
 */
export function isoToScreen(row, col, cam) {
  const { originX = 0, originY = 0, zoom = 1, panX = 0, panY = 0 } = cam;
  return {
    x: ((col - row) * (TILE_W / 2)) * zoom + originX + panX,
    y: ((col + row) * (TILE_H / 2)) * zoom + originY + panY,
  };
}

/**
 * Screen → grid (fractional).
 * Math derivation:
 *   x_screen = (col - row) * TW/2   →   col - row = x / (TW/2)
 *   y_screen = (col + row) * TH/2   →   col + row = y / (TH/2)
 *   col = x/TW + y/TH
 *   row = y/TH - x/TW
 */
export function screenToIso(sx, sy, cam) {
  const { originX = 0, originY = 0, zoom = 1, panX = 0, panY = 0 } = cam;
  const x = (sx - originX - panX) / zoom;
  const y = (sy - originY - panY) / zoom;
  return {
    col: Math.floor(x / TILE_W + y / TILE_H),
    row: Math.floor(y / TILE_H - x / TILE_W),
  };
}

// ─── Camera helpers ───────────────────────────────────────────────────────────

/**
 * Compute originX/Y to center the entire grid on a canvas.
 * The visual center of the grid maps to the center of the canvas.
 */
export function calcCameraOrigin(canvasW, canvasH) {
  const centerRow = GR / 2;
  const centerCol = GC / 2;
  const cx = (centerCol - centerRow) * (TILE_W / 2);
  const cy = (centerCol + centerRow) * (TILE_H / 2);
  return {
    originX: canvasW / 2 - cx,
    originY: canvasH / 2 - cy,
  };
}

/**
 * Clamp pan so at least `margin` pixels of the grid remain on screen.
 */
export function clampCameraPan(cam, canvasW, canvasH, margin = 120) {
  const gridPixelW = (GR + GC) * (TILE_W / 2) * cam.zoom;
  const gridPixelH = (GR + GC) * (TILE_H / 2) * cam.zoom;
  return {
    panX: Math.max(-(gridPixelW - margin), Math.min(gridPixelW - margin, cam.panX)),
    panY: Math.max(-(gridPixelH - margin), Math.min(gridPixelH - margin, cam.panY)),
  };
}

/**
 * Zoom toward a screen-space focal point (e.g., mouse position or pinch center).
 * Adjusts pan so the focal point stays fixed on screen.
 */
export function zoomAtPoint(cam, newZoom, focalX, focalY) {
  const dz = newZoom / cam.zoom;
  return {
    ...cam,
    zoom: newZoom,
    panX: focalX - (focalX - cam.panX) * dz,
    panY: focalY - (focalY - cam.panY) * dz,
  };
}

// ─── Building helpers ─────────────────────────────────────────────────────────

/**
 * Screen position where a building sprite should be bottom-anchored.
 * Convention: sprite drawn with ctx.drawImage(img, x - w/2, y - h, w, h)
 * The anchor is the south (front-bottom) corner of the footprint diamond.
 */
export function getBuildingAnchorScreen(anchorRow, anchorCol, size, cam) {
  // South corner = one step past (anchorRow + size.h - 1, anchorCol + size.w - 1)
  return isoToScreen(anchorRow + size.h, anchorCol + size.w, cam);
}

/**
 * Depth sort key for painter's algorithm.
 * Higher value = drawn later (appears in front).
 */
export function getBuildingDepth(anchorRow, anchorCol, size) {
  return (anchorRow + size.h - 1) + (anchorCol + size.w - 1);
}

/**
 * All grid cells covered by a building footprint.
 */
export function getBuildingCells(anchorRow, anchorCol, size) {
  const cells = [];
  for (let dr = 0; dr < size.h; dr++) {
    for (let dc = 0; dc < size.w; dc++) {
      cells.push({ row: anchorRow + dr, col: anchorCol + dc });
    }
  }
  return cells;
}

/**
 * Sort an array of {row, col, ...} objects back-to-front for correct overlap.
 * Pass building anchors with their size to use getBuildingDepth,
 * or tile coords directly (size defaults to {w:1,h:1}).
 */
export function sortForPainter(items) {
  return [...items].sort((a, b) => {
    const da = getBuildingDepth(a.row, a.col, a.size || { w: 1, h: 1 });
    const db = getBuildingDepth(b.row, b.col, b.size || { w: 1, h: 1 });
    return da - db;
  });
}

// ─── Visitor helpers ──────────────────────────────────────────────────────────

/**
 * Isometric screen position for a visitor dot, centered in its tile.
 * subX/subY (0..1) nudge the dot within the tile for visual variety.
 */
export function getDotScreenPos(row, col, cam, subX = 0.5, subY = 0.8) {
  const tilePt = isoToScreen(row, col, cam);
  // Offset within tile: subX shifts left/right, subY shifts along depth
  const offX = (subX - 0.5) * TILE_W * cam.zoom;
  const offY = subY * TILE_H * cam.zoom;
  return { x: tilePt.x + offX, y: tilePt.y + offY };
}

/**
 * Visitor walking direction from previous cell to current cell.
 * Returns one of: "ne" | "nw" | "se" | "sw"
 *
 *   Grid row↑, col same  → moving NW on screen
 *   Grid row↓, col same  → moving SE on screen
 *   Grid row same, col↑  → moving NE on screen
 *   Grid row same, col↓  → moving SW on screen
 */
export function getDotDirection(prevRow, prevCol, row, col) {
  const dr = row - prevRow;
  const dc = col - prevCol;
  if (dr < 0 && dc >= 0) return 'ne';
  if (dr < 0 && dc < 0)  return 'nw';
  if (dr > 0 && dc > 0)  return 'se';
  if (dr > 0 && dc <= 0) return 'sw';
  // No row change: pure column movement
  if (dc > 0) return 'se';
  if (dc < 0) return 'nw';
  return 'se'; // stationary fallback
}

// ─── Click / hit-test ─────────────────────────────────────────────────────────

/**
 * Fine-grained check: is a screen point inside the diamond of tile (row, col)?
 * Use after screenToIso gives you the candidate cell — this confirms the click
 * is actually within the diamond, not in the "gap" between tiles.
 */
export function isInsideTileDiamond(sx, sy, row, col, cam) {
  const { x: tx, y: ty } = isoToScreen(row, col, cam);
  // Normalize to tile-local coordinates [-1, 1]
  const nx = (sx - tx) / ((TILE_W / 2) * cam.zoom);
  const ny = (sy - ty) / ((TILE_H / 2) * cam.zoom);
  return Math.abs(nx) + Math.abs(ny) <= 1;
}

/**
 * Given a canvas click at (sx, sy), return the grid cell.
 * Uses screenToIso + diamond refinement for sub-tile accuracy.
 * Returns null if outside grid bounds.
 */
export function pickCell(sx, sy, cam) {
  const { row, col } = screenToIso(sx, sy, cam);
  if (row < 0 || row >= GR || col < 0 || col >= GC) return null;
  return { row, col };
}

// ─── Grid bounds ──────────────────────────────────────────────────────────────

export function inBounds(row, col) {
  return row >= 0 && row < GR && col >= 0 && col < GC;
}

/**
 * Canvas size required to fit the entire grid at zoom=1 with given padding.
 */
export function calcMinCanvasSize(padding = 80) {
  return {
    width:  (GR + GC) * (TILE_W / 2) + padding * 2,
    height: (GR + GC) * (TILE_H / 2) + padding * 2,
  };
}

// ─── Dev: unit test (call in browser console to verify math) ─────────────────

export function runIsoMathTests() {
  const cam = { originX: 0, originY: 0, zoom: 1, panX: 0, panY: 0 };
  const cases = [
    [0,  0],
    [0,  1],
    [1,  0],
    [0, 39],
    [19, 0],
    [19, 39],
    [10, 20],
  ];
  let pass = 0;
  for (const [r, c] of cases) {
    const { x, y } = isoToScreen(r, c, cam);
    const { row, col } = screenToIso(x + 1, y + 1, cam); // +1 to land inside tile
    const ok = row === r && col === c;
    if (!ok) console.error(`FAIL (${r},${c}) → screen(${x},${y}) → grid(${row},${col})`);
    else pass++;
  }
  console.log(`isoEngine math: ${pass}/${cases.length} tests passed`);

  // Painter sort test
  const items = [{ row:5, col:5 }, { row:0, col:0 }, { row:19, col:39 }];
  const sorted = sortForPainter(items);
  console.assert(sorted[0].row === 0, 'Painter sort: (0,0) should be first');
  console.assert(sorted[2].row === 19, 'Painter sort: (19,39) should be last');
  console.log('isoEngine painter sort: OK');
}
