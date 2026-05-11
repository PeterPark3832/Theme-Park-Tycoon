import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import {
  GC, GR, TICK, SL, SAVE_KEY,
  SEASONS, HOLIDAY_EVENTS, INVESTOR_OFFERS, MAP_TYPES, LEAGUES,
  BREAK_CHANCE, ZONES, PARCELS, SEGS, SEG_PULL,
  CAMPAIGNS_DATA, VIP_EVENTS, RB_BRANCHES, RESEARCH, MISSIONS, DISASTERS,
  WEATHERS, WEATHER_WEIGHTS, DEFAULT_RIDE_PRICES, DEFAULT_SHOP_MULTS, MAX_FEE_BY_STARS,
  LANG_FLAGS, TR, SCENARIOS, DIFFICULTY_SETTINGS, STAGES, B,
  STAFF, STAFF_UPGRADES, RIVAL_PARKS, FRANCHISES, ZONE_MASTERY, LOAN_OPTS, DOTS, TUTORIAL_STEPS, DAILY_CHALLENGES, SCENARIO_CLEAR_REWARDS, SCENARIO_DIFFICULTY,
} from './gameData.js';
import { getBuildingIcon, hasBuildingIcon } from './buildingIcons.jsx';
import {
  tFn, pickWeather, getReachablePaths, hasPath, getZM, calcStats, calcSegs,
  segSatMod, checkVIPReq, bldCounts, calcParkRating, calcRideTicketRev, avgShopMult,
  calcStage, stageVisBonus, stageRevBonus, calcLeague, getRB,
  loadSaveSlots, writeSaveSlots, mkGrid, mkOwned, timeAgoL, playSound,
} from './gameLogic.js';