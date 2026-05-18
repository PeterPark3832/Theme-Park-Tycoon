/**
 * spriteLoader.js — Building sprite cache
 *
 * Sprite key convention:  {type}_{level}  e.g. "carousel_0", "carousel_1", "carousel_2"
 * Expected asset path:    /sprites/{type}_{level}.png
 *
 * Usage:
 *   preloadSprites(['entrance','carousel',...])  — call once on game start
 *   getSprite('carousel', 1)                     — returns HTMLImageElement or null
 */

const CACHE = new Map();

/** Load one sprite into cache. Returns the Image object (may not be loaded yet). */
export function loadSprite(type, level = 0) {
  const key = `${type}_${level}`;
  if (CACHE.has(key)) return CACHE.get(key);
  const img = new Image();
  img.src = `/sprites/${key}.png`;
  CACHE.set(key, img);
  return img;
}

/**
 * Get a fully-loaded sprite, or null if still loading / not found.
 * Falls back to lower level sprites if requested level isn't ready.
 */
export function getSprite(type, level = 0) {
  for (let lv = level; lv >= 0; lv--) {
    const img = CACHE.get(`${type}_${lv}`);
    if (img?.complete && img.naturalWidth > 0) return img;
  }
  return null;
}

/**
 * Preload all 3 level variants for each building type in the list.
 * Call once when the game screen loads.
 */
export function preloadSprites(typeList) {
  for (const type of typeList) {
    for (let lv = 0; lv <= 2; lv++) loadSprite(type, lv);
  }
}

/** Returns true when every preloaded sprite has finished loading. */
export function allSpritesLoaded() {
  for (const img of CACHE.values()) {
    if (!img.complete || img.naturalWidth === 0) return false;
  }
  return true;
}
