// buildingIcons.jsx — OS 무관 SVG 아이콘 세트 (27종)
// 각 아이콘은 (color, size) => JSX 형태로 export

const I = {}; // icon map

/* ═══════════════════════════════
   🎠 ATTRACTIONS (어트랙션)
═══════════════════════════════ */

// 입구 게이트 — 아치 + 깃발
I.entrance = (c, s) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none">
    <rect x="2"  y="9" width="3.5" height="13" rx="0.8" fill={c}/>
    <rect x="18.5" y="9" width="3.5" height="13" rx="0.8" fill={c}/>
    <path d="M5.5 9.5 C5.5 3.5 18.5 3.5 18.5 9.5" stroke={c} strokeWidth="2.5" fill={c+"18"} strokeLinecap="round"/>
    {/* 기둥 장식 */}
    <rect x="2" y="9" width="3.5" height="1.5" rx="0.5" fill={c+"BB"}/>
    <rect x="18.5" y="9" width="3.5" height="1.5" rx="0.5" fill={c+"BB"}/>
    {/* 깃발 */}
    <line x1="12" y1="3" x2="12" y2="7" stroke={c} strokeWidth="1.2"/>
    <polygon points="12,3 15.5,4.5 12,6" fill={c}/>
    {/* 바닥선 */}
    <line x1="0.5" y1="22" x2="23.5" y2="22" stroke={c} strokeWidth="1.2" opacity="0.4"/>
  </svg>
);

// 관람차 — 바퀴 + 곤돌라
I.ferrisWheel = (c, s) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none">
    <circle cx="12" cy="11" r="7.5" stroke={c} strokeWidth="2" fill={c+"0C"}/>
    {/* 스포크 */}
    {[0,45,90,135].map(deg => {
      const r = Math.PI * deg / 180;
      const x1 = 12 + 7.5 * Math.cos(r), y1 = 11 + 7.5 * Math.sin(r);
      const x2 = 12 - 7.5 * Math.cos(r), y2 = 11 - 7.5 * Math.sin(r);
      return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth="0.8" opacity="0.5"/>;
    })}
    <circle cx="12" cy="11" r="2.2" fill={c}/>
    {/* 곤돌라 4개 */}
    <rect x="9.5" y="2.5"  width="5" height="3" rx="1.2" fill={c}/>
    <rect x="17"  y="9.5"  width="4" height="3" rx="1.2" fill={c} opacity="0.85"/>
    <rect x="9.5" y="17.5" width="5" height="3" rx="1.2" fill={c} opacity="0.85"/>
    <rect x="3"   y="9.5"  width="4" height="3" rx="1.2" fill={c} opacity="0.85"/>
    {/* 지지대 */}
    <line x1="9.5" y1="19" x2="7"  y2="23" stroke={c} strokeWidth="1.5"/>
    <line x1="14.5" y1="19" x2="17" y2="23" stroke={c} strokeWidth="1.5"/>
  </svg>
);

// 롤러코스터 — 루프 트랙 + 카트
I.rollerCoaster = (c, s) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none">
    {/* 루프 */}
    <circle cx="14" cy="8" r="4.5" stroke={c} strokeWidth="2" fill="none"/>
    {/* 트랙 */}
    <path d="M1 18 C4 10 8 14 9.5 12.5" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M18.5 12.5 C20 11 22 15 23 18" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round"/>
    {/* 바닥 */}
    <line x1="0.5" y1="19" x2="23.5" y2="19" stroke={c} strokeWidth="1.2" opacity="0.4"/>
    {/* 카트 */}
    <rect x="7" y="11" width="5" height="3" rx="1" fill={c}/>
    <circle cx="8.5" cy="14.5" r="1.2" fill={c} opacity="0.7"/>
    <circle cx="11" cy="14.5" r="1.2" fill={c} opacity="0.7"/>
    {/* 지지대 */}
    <line x1="12" y1="4" x2="12" y2="2" stroke={c} strokeWidth="1.2" opacity="0.5"/>
  </svg>
);

// 회전목마 — 원형 캐노피 + 말들
I.carousel = (c, s) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none">
    {/* 캐노피 */}
    <ellipse cx="12" cy="7" rx="9" ry="3" fill={c} opacity="0.9"/>
    <path d="M3 7 L5 17 M21 7 L19 17" stroke={c} strokeWidth="1.5" opacity="0.6"/>
    {/* 중앙 기둥 */}
    <line x1="12" y1="5" x2="12" y2="20" stroke={c} strokeWidth="2.5"/>
    {/* 줄 */}
    <line x1="12" y1="8" x2="5"  y2="14" stroke={c} strokeWidth="1" opacity="0.6"/>
    <line x1="12" y1="8" x2="19" y2="14" stroke={c} strokeWidth="1" opacity="0.6"/>
    <line x1="12" y1="8" x2="12" y2="15" stroke={c} strokeWidth="1" opacity="0.6"/>
    {/* 말 */}
    <ellipse cx="5"  cy="16" rx="2" ry="1.5" fill={c} opacity="0.8"/>
    <ellipse cx="19" cy="16" rx="2" ry="1.5" fill={c} opacity="0.8"/>
    <ellipse cx="12" cy="17" rx="2" ry="1.5" fill={c} opacity="0.8"/>
    {/* 바닥 */}
    <ellipse cx="12" cy="20.5" rx="8" ry="1.5" fill={c} opacity="0.2"/>
  </svg>
);

// 스릴 라이드 — 로켓/발사대
I.thrillRide = (c, s) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none">
    {/* 발사대 */}
    <rect x="10.5" y="14" width="3" height="8" rx="0.5" fill={c} opacity="0.5"/>
    {/* 카트 */}
    <rect x="9" y="10" width="6" height="5" rx="2" fill={c}/>
    {/* 로켓 헤드 */}
    <path d="M9 10 C9 6 12 3 12 3 C12 3 15 6 15 10" fill={c} opacity="0.85"/>
    {/* 날개 */}
    <path d="M9 13 L5 17 L9 15" fill={c} opacity="0.7"/>
    <path d="M15 13 L19 17 L15 15" fill={c} opacity="0.7"/>
    {/* 불꽃 */}
    <path d="M10.5 18 Q12 22 13.5 18" fill="#FF9F43" opacity="0.8"/>
    {/* 창문 */}
    <circle cx="12" cy="9" r="1.5" fill="white" opacity="0.3"/>
  </svg>
);

// 워터 슬라이드 — 파도형 슬라이드
I.waterRide = (c, s) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none">
    {/* 슬라이드 트랙 */}
    <path d="M3 4 C6 4 6 10 10 10 C14 10 14 4 18 4 C20 4 22 6 22 8"
      stroke={c} strokeWidth="3" fill="none" strokeLinecap="round"/>
    {/* 물 */}
    <path d="M2 16 Q5 14 8 16 Q11 18 14 16 Q17 14 20 16 Q22 17 23 16"
      stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7"/>
    <path d="M2 19 Q5 17 8 19 Q11 21 14 19 Q17 17 20 19 Q22 20 23 19"
      stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5"/>
    {/* 물방울 */}
    <circle cx="6" cy="12" r="1" fill={c} opacity="0.6"/>
    <circle cx="12" cy="13" r="0.8" fill={c} opacity="0.5"/>
    <circle cx="18" cy="12" r="1" fill={c} opacity="0.6"/>
    {/* 수영객 */}
    <circle cx="19" cy="8" r="2" fill={c} opacity="0.9"/>
    <line x1="19" y1="10" x2="19" y2="13" stroke={c} strokeWidth="1.5" opacity="0.8"/>
    {/* 계단 */}
    <rect x="1" y="2" width="3" height="3"  rx="0.5" fill={c} opacity="0.5"/>
    <rect x="1" y="5" width="2" height="2"  rx="0.5" fill={c} opacity="0.4"/>
  </svg>
);

// 범퍼카 — 탑뷰 자동차
I.bumperCars = (c, s) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none">
    {/* 경기장 */}
    <rect x="1" y="4" width="22" height="16" rx="3" stroke={c} strokeWidth="1.5" fill={c+"0A"}/>
    {/* 차 1 */}
    <rect x="4"  y="8" width="8" height="5" rx="2" fill={c}/>
    <circle cx="6"  cy="14" r="1.5" fill={c} opacity="0.7"/>
    <circle cx="10" cy="14" r="1.5" fill={c} opacity="0.7"/>
    {/* 차 2 */}
    <rect x="13" y="11" width="7" height="4" rx="2" fill={c} opacity="0.7"/>
    <circle cx="15" cy="16" r="1.3" fill={c} opacity="0.6"/>
    <circle cx="18" cy="16" r="1.3" fill={c} opacity="0.6"/>
    {/* 전극 */}
    <line x1="8"  y1="8" x2="8"  y2="5" stroke={c} strokeWidth="1"/>
    <line x1="16.5" y1="11" x2="16.5" y2="8" stroke={c} strokeWidth="1"/>
  </svg>
);

// 자이로드롭 — 높은 타워 + 낙하 플랫폼
I.dropTower = (c, s) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none">
    {/* 타워 */}
    <rect x="10.5" y="1" width="3" height="22" rx="0.8" fill={c} opacity="0.5"/>
    {/* 트러스 */}
    {[4,8,12,16].map(y => (
      <line key={y} x1="10.5" y1={y} x2="13.5" y2={y+2} stroke={c} strokeWidth="0.8" opacity="0.4"/>
    ))}
    {/* 꼭대기 */}
    <polygon points="12,0 10,3 14,3" fill={c}/>
    {/* 탑승 플랫폼 */}
    <rect x="7" y="7" width="10" height="4" rx="1.5" fill={c}/>
    {/* 사람들 */}
    <circle cx="9.5" cy="7.5" r="1" fill={c+"AA"}/>
    <circle cx="12"  cy="7.5" r="1" fill={c+"AA"}/>
    <circle cx="14.5" cy="7.5" r="1" fill={c+"AA"}/>
    {/* 충격 흡수 바닥 */}
    <rect x="6" y="20" width="12" height="2.5" rx="1" fill={c} opacity="0.4"/>
    {/* 낙하 표시선 */}
    <path d="M11.5 12 L11.5 19" stroke={c} strokeWidth="0.8" strokeDasharray="2,2" opacity="0.4"/>
    <path d="M12.5 12 L12.5 19" stroke={c} strokeWidth="0.8" strokeDasharray="2,2" opacity="0.4"/>
  </svg>
);

// 미니 기차 — 측면 기관차
I.miniTrain = (c, s) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none">
    {/* 기관차 몸체 */}
    <rect x="1" y="12" width="14" height="7" rx="1.5" fill={c}/>
    {/* 운전실 */}
    <rect x="12" y="9" width="6" height="10" rx="1.5" fill={c} opacity="0.85"/>
    {/* 굴뚝 */}
    <rect x="3" y="8" width="3" height="5" rx="1" fill={c} opacity="0.8"/>
    {/* 연기 */}
    <circle cx="4.5" cy="6.5" r="1.5" fill={c} opacity="0.3"/>
    <circle cx="6.5" cy="5"   r="2"   fill={c} opacity="0.2"/>
    <circle cx="8.5" cy="4"   r="1.5" fill={c} opacity="0.15"/>
    {/* 창문 */}
    <rect x="13.5" y="10.5" width="3.5" height="3" rx="0.8" fill="white" opacity="0.3"/>
    <rect x="4" y="13.5" width="3" height="2.5" rx="0.5" fill="white" opacity="0.25"/>
    <rect x="8" y="13.5" width="3" height="2.5" rx="0.5" fill="white" opacity="0.25"/>
    {/* 바퀴 */}
    <circle cx="4"  cy="20" r="2.5" stroke={c} strokeWidth="1.5" fill={c+"30"}/>
    <circle cx="10" cy="20" r="2.5" stroke={c} strokeWidth="1.5" fill={c+"30"}/>
    <circle cx="16" cy="20" r="2.5" stroke={c} strokeWidth="1.5" fill={c+"30"}/>
    {/* 레일 */}
    <line x1="0.5" y1="22.5" x2="23.5" y2="22.5" stroke={c} strokeWidth="1" opacity="0.4"/>
    {/* 뒤 객차 */}
    <rect x="19" y="13" width="4.5" height="6" rx="1" fill={c} opacity="0.6"/>
    <circle cx="20.5" cy="20" r="2" stroke={c} strokeWidth="1.2" fill={c+"20"}/>
    <circle cx="23"   cy="20" r="2" stroke={c} strokeWidth="1.2" fill={c+"20"}/>
  </svg>
);

// 귀신의 집 — 으스스한 집
I.hauntedHouse = (c, s) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none">
    {/* 집 몸체 */}
    <rect x="3" y="11" width="18" height="12" rx="0.8" fill={c} opacity="0.6"/>
    {/* 지붕 */}
    <polygon points="12,1 1,12 23,12" fill={c} opacity="0.85"/>
    {/* 탑 */}
    <polygon points="17,8 15,12 19,12" fill={c}/>
    {/* 문 */}
    <path d="M10 23 L10 17 Q12 15 14 17 L14 23" fill="black" opacity="0.4"/>
    {/* 창문 (으스스하게 빛나는) */}
    <rect x="5" y="14" width="4" height="4" rx="0.5" fill={c} opacity="0.9"/>
    <rect x="15" y="14" width="4" height="4" rx="0.5" fill={c} opacity="0.9"/>
    {/* 유령 */}
    <ellipse cx="12" cy="7.5" rx="2.5" ry="2.5" fill="white" opacity="0.6"/>
    <path d="M9.5 9.5 Q12 12 14.5 9.5 Q14.5 11 13.5 10.5 Q12 12 10.5 10.5 Q9.5 11 9.5 9.5Z" fill="white" opacity="0.6"/>
    {/* 눈 */}
    <circle cx="11" cy="7" r="0.7" fill={c}/>
    <circle cx="13" cy="7" r="0.7" fill={c}/>
  </svg>
);

// 4D 시네마 — 필름 릴 + 3D 안경
I.cinema4D = (c, s) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none">
    {/* 스크린 */}
    <rect x="2" y="2" width="20" height="14" rx="1.5" fill={c} opacity="0.15" stroke={c} strokeWidth="1.5"/>
    {/* 3D 영화 효과 (빔) */}
    <path d="M12 8 L2 14" stroke={c} strokeWidth="1" opacity="0.3"/>
    <path d="M12 8 L22 14" stroke={c} strokeWidth="1" opacity="0.3"/>
    {/* 영사기 */}
    <circle cx="12" cy="8" r="3" fill={c}/>
    <circle cx="12" cy="8" r="1.5" fill={c} opacity="0.5"/>
    {/* 3D 안경 */}
    <rect x="4"  y="18" width="6" height="4" rx="1.5" fill={c} opacity="0.85"/>
    <rect x="14" y="18" width="6" height="4" rx="1.5" fill={c} opacity="0.7"/>
    <line x1="10" y1="20" x2="14" y2="20" stroke={c} strokeWidth="1.5"/>
    {/* 렌즈 색상 */}
    <rect x="5"  y="19" width="4" height="2" rx="1" fill="white" opacity="0.2"/>
    <rect x="15" y="19" width="4" height="2" rx="1" fill="white" opacity="0.15"/>
    {/* 필름 띠 */}
    <rect x="0.5" y="2" width="1.5" height="14" fill={c} opacity="0.3"/>
    <rect x="22" y="2"  width="1.5" height="14" fill={c} opacity="0.3"/>
  </svg>
);

// 열기구 — 풍선 + 바구니
I.balloonRide = (c, s) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none">
    {/* 열기구 본체 */}
    <ellipse cx="12" cy="9" rx="8" ry="9" fill={c} opacity="0.8"/>
    {/* 무늬 */}
    <path d="M12 0 L12 18" stroke="white" strokeWidth="0.8" opacity="0.3"/>
    <path d="M4 9 Q8 5 12 9 Q16 13 20 9" stroke="white" strokeWidth="0.8" opacity="0.25"/>
    <path d="M4.5 6 Q8 9 12 6 Q16 3 19.5 6" stroke="white" strokeWidth="0.8" opacity="0.2"/>
    {/* 밧줄 */}
    <line x1="8"  y1="17.5" x2="8"  y2="19" stroke={c} strokeWidth="1.2"/>
    <line x1="16" y1="17.5" x2="16" y2="19" stroke={c} strokeWidth="1.2"/>
    <line x1="8"  y1="19"   x2="9"  y2="20" stroke={c} strokeWidth="1"/>
    <line x1="16" y1="19"   x2="15" y2="20" stroke={c} strokeWidth="1"/>
    {/* 바구니 */}
    <rect x="9" y="20" width="6" height="4" rx="1" fill={c} opacity="0.9"/>
    {/* 불꽃 */}
    <path d="M11 20 Q12 17.5 13 20" stroke="#FF9F43" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
  </svg>
);

/* ═══════════════════════════════
   🍔 SHOPS (상업)
═══════════════════════════════ */

// 푸드코트 — 이동 식품 카트
I.foodStall = (c, s) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none">
    {/* 차양 */}
    <path d="M2 10 L22 10 L19 5 L5 5 Z" fill={c} opacity="0.9"/>
    {/* 물결 장식 */}
    <path d="M2 10 Q4 12 6 10 Q8 8 10 10 Q12 12 14 10 Q16 8 18 10 Q20 12 22 10" stroke="white" strokeWidth="1" fill="none" opacity="0.4"/>
    {/* 카운터 */}
    <rect x="3" y="10" width="18" height="8" rx="0.8" fill={c} opacity="0.6"/>
    {/* 음식 아이템 */}
    <circle cx="8"  cy="14" r="2.5" fill={c} opacity="0.9"/>
    <rect   x="6.5" y="14" width="3" height="1.5" rx="0.3" fill={c}/>
    <circle cx="16" cy="14" r="2"   fill={c} opacity="0.85"/>
    {/* 바퀴 */}
    <circle cx="6"  cy="20" r="2" stroke={c} strokeWidth="1.5" fill={c+"20"}/>
    <circle cx="18" cy="20" r="2" stroke={c} strokeWidth="1.5" fill={c+"20"}/>
    {/* 기둥 */}
    <line x1="12" y1="5" x2="12" y2="3" stroke={c} strokeWidth="2"/>
  </svg>
);

// 아이스크림 — 콘
I.iceCream = (c, s) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none">
    {/* 콘 */}
    <polygon points="12,23 5,10 19,10" fill={c} opacity="0.7"/>
    {/* 콘 무늬 */}
    <line x1="8"  y1="13" x2="11" y2="23" stroke="white" strokeWidth="0.8" opacity="0.25"/>
    <line x1="12" y1="10" x2="13" y2="23" stroke="white" strokeWidth="0.8" opacity="0.25"/>
    {/* 스쿱 1 */}
    <circle cx="12" cy="9"  r="5" fill={c} opacity="0.9"/>
    {/* 스쿱 2 (위) */}
    <circle cx="12" cy="5"  r="4" fill={c}/>
    {/* 하이라이트 */}
    <circle cx="10.5" cy="3.5" r="1.5" fill="white" opacity="0.35"/>
    {/* 초콜릿 */}
    <path d="M9 5 Q12 8 15 5" stroke={c+"AA"} strokeWidth="1.2" fill="none"/>
    {/* 토핑 */}
    <circle cx="12" cy="1.5" r="1.5" fill={c}/>
  </svg>
);

// 기념품점 — 쇼핑백
I.giftShop = (c, s) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none">
    {/* 가방 몸체 */}
    <rect x="4" y="9" width="16" height="14" rx="2" fill={c} opacity="0.75"/>
    {/* 손잡이 */}
    <path d="M9 9 C9 5 15 5 15 9" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round"/>
    {/* 리본 */}
    <line x1="12" y1="9" x2="12" y2="23" stroke="white" strokeWidth="1.5" opacity="0.4"/>
    <line x1="4"  y1="16" x2="20" y2="16" stroke="white" strokeWidth="1.5" opacity="0.4"/>
    {/* 나비 리본 */}
    <path d="M10 15 Q12 13 14 15 Q12 17 10 15" fill="white" opacity="0.5"/>
    {/* 별 장식 */}
    <circle cx="12" cy="16" r="1.2" fill="white" opacity="0.6"/>
    {/* 가게 간판 */}
    <rect x="3" y="4" width="18" height="3" rx="1" fill={c} opacity="0.9"/>
    <circle cx="8"  cy="5.5" r="0.8" fill="white" opacity="0.5"/>
    <circle cx="12" cy="5.5" r="0.8" fill="white" opacity="0.5"/>
    <circle cx="16" cy="5.5" r="0.8" fill="white" opacity="0.5"/>
  </svg>
);

// 오락실 — 아케이드 캐비닛
I.arcade = (c, s) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none">
    {/* 캐비닛 본체 */}
    <rect x="5" y="6" width="14" height="17" rx="1.5" fill={c} opacity="0.7"/>
    {/* 상단 베젤 */}
    <rect x="5" y="3" width="14" height="5" rx="1.5" fill={c}/>
    {/* 스크린 */}
    <rect x="7" y="7" width="10" height="8" rx="1" fill={c} opacity="0.9"/>
    {/* 스크린 내용 (픽셀) */}
    <rect x="9"  y="9"  width="2" height="2" fill="white" opacity="0.5"/>
    <rect x="13" y="9"  width="2" height="2" fill="white" opacity="0.5"/>
    <rect x="11" y="11" width="2" height="2" fill="white" opacity="0.5"/>
    <rect x="9"  y="13" width="2" height="2" fill="white" opacity="0.3"/>
    <rect x="13" y="13" width="2" height="2" fill="white" opacity="0.3"/>
    {/* 조이스틱 */}
    <circle cx="9"  cy="19" r="2" fill={c}/>
    <circle cx="9"  cy="19" r="0.8" fill="white" opacity="0.5"/>
    {/* 버튼들 */}
    <circle cx="14" cy="18" r="1.2" fill={c}/>
    <circle cx="17" cy="18" r="1.2" fill={c} opacity="0.8"/>
    <circle cx="15.5" cy="21" r="1.2" fill={c} opacity="0.7"/>
    {/* 제목 */}
    <text x="12" y="6" textAnchor="middle" fontSize="2.5" fill="white" opacity="0.7" fontFamily="monospace">ARCADE</text>
  </svg>
);

// VIP 라운지 — 소파
I.vipLounge = (c, s) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none">
    {/* 별 왕관 */}
    <polygon points="12,1 13.5,5 17.5,5 14,7.5 15.5,11.5 12,9 8.5,11.5 10,7.5 6.5,5 10.5,5" fill={c} opacity="0.9"/>
    {/* 소파 등받이 */}
    <rect x="3" y="13" width="18" height="5" rx="2.5" fill={c}/>
    {/* 팔걸이 좌 */}
    <rect x="1" y="14" width="4" height="8" rx="1.5" fill={c} opacity="0.85"/>
    {/* 팔걸이 우 */}
    <rect x="19" y="14" width="4" height="8" rx="1.5" fill={c} opacity="0.85"/>
    {/* 방석 */}
    <rect x="5" y="18" width="6" height="4" rx="1.5" fill={c} opacity="0.7"/>
    <rect x="13" y="18" width="6" height="4" rx="1.5" fill={c} opacity="0.7"/>
    {/* 다리 */}
    <rect x="5"  y="22" width="2" height="2" rx="0.5" fill={c} opacity="0.6"/>
    <rect x="17" y="22" width="2" height="2" rx="0.5" fill={c} opacity="0.6"/>
  </svg>
);

/* ═══════════════════════════════
   🌿 FACILITIES (편의시설)
═══════════════════════════════ */

// 화장실 — WC 아이콘
I.restroom = (c, s) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none">
    {/* 건물 */}
    <rect x="2" y="8" width="20" height="15" rx="1.5" fill={c} opacity="0.3" stroke={c} strokeWidth="1.5"/>
    {/* WC 텍스트 */}
    <text x="12" y="18" textAnchor="middle" fontSize="6" fill={c} fontWeight="bold" fontFamily="sans-serif">WC</text>
    {/* 여성 */}
    <circle cx="8" cy="5" r="2.5" fill={c}/>
    <path d="M5 11 Q8 9 11 11 L10 15 L6 15 Z" fill={c}/>
    {/* 남성 */}
    <circle cx="16" cy="5" r="2.5" fill={c} opacity="0.75"/>
    <rect x="13.5" y="10" width="5" height="6" rx="1" fill={c} opacity="0.75"/>
    {/* 구분선 */}
    <line x1="12" y1="8" x2="12" y2="23" stroke={c} strokeWidth="1.5" opacity="0.5"/>
    {/* 아이콘 구분선 */}
    <path d="M8 11 L8 15" stroke={c} strokeWidth="1.2" opacity="0.5"/>
  </svg>
);

// 정원 — 나무 실루엣
I.garden = (c, s) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none">
    {/* 큰 나무 */}
    <ellipse cx="12" cy="8" rx="6" ry="7" fill={c}/>
    <ellipse cx="12" cy="5" rx="4.5" ry="5" fill={c} opacity="0.8"/>
    <rect x="10.5" y="13" width="3" height="8" rx="0.8" fill={c} opacity="0.7"/>
    {/* 작은 나무 왼쪽 */}
    <ellipse cx="5" cy="15" rx="3.5" ry="4" fill={c} opacity="0.7"/>
    <rect x="4" y="17.5" width="2" height="5.5" rx="0.5" fill={c} opacity="0.6"/>
    {/* 작은 나무 오른쪽 */}
    <ellipse cx="19" cy="14" rx="3.5" ry="4.5" fill={c} opacity="0.7"/>
    <rect x="18" y="17" width="2" height="6" rx="0.5" fill={c} opacity="0.6"/>
    {/* 하이라이트 */}
    <ellipse cx="10" cy="6" rx="2" ry="3" fill="white" opacity="0.12"/>
  </svg>
);

// 분수대 — 물 아치
I.fountain = (c, s) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none">
    {/* 바닥 수조 */}
    <ellipse cx="12" cy="21" rx="10" ry="2.5" fill={c} opacity="0.3" stroke={c} strokeWidth="1.2"/>
    {/* 중간 수조 */}
    <ellipse cx="12" cy="17" rx="6" ry="1.8" fill={c} opacity="0.5" stroke={c} strokeWidth="1.2"/>
    {/* 기둥 */}
    <rect x="11" y="12" width="2" height="7" rx="0.5" fill={c} opacity="0.7"/>
    {/* 물 아치 */}
    <path d="M12 12 Q7 7 5 12"  stroke={c} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    <path d="M12 12 Q17 7 19 12" stroke={c} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    <path d="M12 12 Q10 6 12 4"  stroke={c} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    <path d="M12 12 Q14 6 12 4"  stroke={c} strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.6"/>
    {/* 물방울 */}
    <circle cx="5"  cy="12.5" r="1.2" fill={c} opacity="0.6"/>
    <circle cx="19" cy="12.5" r="1.2" fill={c} opacity="0.6"/>
    <circle cx="12" cy="4.5"  r="1.2" fill={c} opacity="0.8"/>
    {/* 잔물결 */}
    <ellipse cx="12" cy="21" rx="7"  ry="1.5" stroke={c} strokeWidth="0.8" fill="none" opacity="0.4"/>
    <ellipse cx="12" cy="21" rx="4"  ry="1"   stroke={c} strokeWidth="0.8" fill="none" opacity="0.3"/>
  </svg>
);

// 미니 골프 — 홀 + 깃발
I.miniGolf = (c, s) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none">
    {/* 그린 (페어웨이) */}
    <ellipse cx="12" cy="19" rx="10" ry="4" fill={c} opacity="0.25"/>
    {/* 홀 */}
    <ellipse cx="18" cy="19" rx="2" ry="1" fill="black" opacity="0.4"/>
    {/* 핀 */}
    <line x1="18" y1="18" x2="18" y2="8" stroke={c} strokeWidth="1.5"/>
    <polygon points="18,8 18,13 22,10.5" fill={c} opacity="0.9"/>
    {/* 장애물 언덕 */}
    <ellipse cx="10" cy="17" rx="5" ry="2.5" fill={c} opacity="0.4"/>
    {/* 공 */}
    <circle cx="4" cy="18" r="2" fill="white" stroke={c} strokeWidth="1"/>
    <circle cx="3.5" cy="17.5" r="0.5" fill={c} opacity="0.3"/>
    {/* 클럽 */}
    <line x1="6" y1="18" x2="2" y2="10" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="2" y1="10" x2="2.5" y2="8" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    {/* 별 (홀인원 느낌) */}
    <circle cx="7" cy="5" r="1.5" fill={c} opacity="0.4"/>
    <circle cx="12" cy="3" r="2" fill={c} opacity="0.5"/>
    <circle cx="17" cy="5" r="1.5" fill={c} opacity="0.4"/>
  </svg>
);

/* ═══════════════════════════════
   🛤️ PATHS (통로)
═══════════════════════════════ */

// 일반 통로 — 블록 패턴
I._path = (c, s) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none">
    {/* 블록 타일 패턴 */}
    {[[1,1],[7,1],[13,1],[19,1],[4,7],[10,7],[16,7],[1,13],[7,13],[13,13],[19,13],[4,19],[10,19],[16,19]].map(([x,y],i) => (
      <rect key={i} x={x} y={y} width="5" height="5" rx="0.5" fill={c} opacity={0.35 + (i%3)*0.15}/>
    ))}
    {/* 줄눈 */}
    <line x1="0" y1="6.5"  x2="24" y2="6.5"  stroke={c} strokeWidth="0.8" opacity="0.3"/>
    <line x1="0" y1="12.5" x2="24" y2="12.5" stroke={c} strokeWidth="0.8" opacity="0.3"/>
    <line x1="0" y1="18.5" x2="24" y2="18.5" stroke={c} strokeWidth="0.8" opacity="0.3"/>
    <line x1="6.5"  y1="0" x2="6.5"  y2="24" stroke={c} strokeWidth="0.8" opacity="0.3"/>
    <line x1="12.5" y1="0" x2="12.5" y2="24" stroke={c} strokeWidth="0.8" opacity="0.3"/>
    <line x1="18.5" y1="0" x2="18.5" y2="24" stroke={c} strokeWidth="0.8" opacity="0.3"/>
  </svg>
);

// 고급 통로 — 마름모 장식 패턴
I._pathFancy = (c, s) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none">
    {/* 마름모 타일 */}
    {[[12,2],[2,12],[22,12],[12,22],[2,2],[22,2],[2,22],[22,22],[7,7],[17,7],[7,17],[17,17],[12,12]].map(([x,y],i) => (
      <polygon key={i} points={`${x},${y-4} ${x+4},${y} ${x},${y+4} ${x-4},${y}`}
        fill={c} opacity={i===12?0.7:0.3 + (i%3)*0.1}/>
    ))}
    {/* 경계선 */}
    <rect x="0.5" y="0.5" width="23" height="23" stroke={c} strokeWidth="0.8" fill="none" opacity="0.3"/>
    {/* 중앙 장식 */}
    <circle cx="12" cy="12" r="2" fill={c} opacity="0.6"/>
  </svg>
);

/* ═══════════════════════════════
   🌸 DECORATIONS (장식)
═══════════════════════════════ */

// 벤치 — 측면 벤치
I.bench = (c, s) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none">
    {/* 등받이 */}
    <rect x="3" y="9" width="18" height="2.5" rx="1.2" fill={c}/>
    {/* 좌석 */}
    <rect x="2" y="14" width="20" height="3" rx="1.2" fill={c} opacity="0.85"/>
    {/* 등받이 지지대 */}
    <rect x="6"  y="9" width="1.5" height="5.5" rx="0.5" fill={c} opacity="0.7"/>
    <rect x="16.5" y="9" width="1.5" height="5.5" rx="0.5" fill={c} opacity="0.7"/>
    {/* 다리 앞 */}
    <rect x="4"  y="17" width="2" height="6" rx="0.8" fill={c} opacity="0.75"/>
    <rect x="18" y="17" width="2" height="6" rx="0.8" fill={c} opacity="0.75"/>
    {/* 다리 뒤 */}
    <rect x="6"  y="14.5" width="1.5" height="5.5" rx="0.5" fill={c} opacity="0.5"/>
    <rect x="16.5" y="14.5" width="1.5" height="5.5" rx="0.5" fill={c} opacity="0.5"/>
    {/* 나무 결 */}
    <line x1="4" y1="15" x2="20" y2="15" stroke="white" strokeWidth="0.5" opacity="0.15"/>
    <line x1="4" y1="16" x2="20" y2="16" stroke="white" strokeWidth="0.5" opacity="0.1"/>
  </svg>
);

// 가로등 — 포스트 + 구형 전등
I.lamp = (c, s) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none">
    {/* 빛 후광 */}
    <circle cx="12" cy="6" r="5" fill={c} opacity="0.15"/>
    {/* 전등 구 */}
    <circle cx="12" cy="6" r="3.5" fill={c} opacity="0.9"/>
    <circle cx="10.5" cy="4.5" r="1.5" fill="white" opacity="0.4"/>
    {/* 연결부 */}
    <rect x="11" y="9" width="2" height="2" rx="0.5" fill={c}/>
    {/* 가로 암 */}
    <rect x="8" y="9.5" width="8" height="1.5" rx="0.5" fill={c} opacity="0.8"/>
    {/* 기둥 */}
    <rect x="11" y="10" width="2" height="12" rx="0.8" fill={c} opacity="0.8"/>
    {/* 기둥 굽음 (곡선) */}
    <path d="M12 10 Q12 8 10 8" stroke={c} strokeWidth="1.5" fill="none"/>
    {/* 바닥 받침 */}
    <rect x="9" y="22" width="6" height="2" rx="1" fill={c} opacity="0.6"/>
    {/* 빛줄기 */}
    <line x1="12" y1="9.5" x2="8"  y2="14" stroke={c} strokeWidth="0.8" opacity="0.2"/>
    <line x1="12" y1="9.5" x2="16" y2="14" stroke={c} strokeWidth="0.8" opacity="0.2"/>
    <line x1="12" y1="9.5" x2="12" y2="15" stroke={c} strokeWidth="0.8" opacity="0.2"/>
  </svg>
);

// 화단 — 꽃 모음
I.flowerBed = (c, s) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none">
    {/* 화단 테두리 */}
    <rect x="1" y="17" width="22" height="6" rx="1.5" fill={c} opacity="0.3" stroke={c} strokeWidth="1"/>
    {/* 흙 */}
    <rect x="2" y="18" width="20" height="4" rx="1" fill={c} opacity="0.2"/>
    {/* 줄기들 */}
    <line x1="5"  y1="17" x2="5"  y2="12" stroke={c} strokeWidth="1.5" opacity="0.7"/>
    <line x1="12" y1="17" x2="12" y2="10" stroke={c} strokeWidth="1.5" opacity="0.7"/>
    <line x1="19" y1="17" x2="19" y2="12" stroke={c} strokeWidth="1.5" opacity="0.7"/>
    <line x1="8.5"  y1="17" x2="9"  y2="13.5" stroke={c} strokeWidth="1.2" opacity="0.6"/>
    <line x1="15.5" y1="17" x2="15" y2="13.5" stroke={c} strokeWidth="1.2" opacity="0.6"/>
    {/* 꽃들 */}
    {[[5,10],[12,8],[19,10],[9,12],[15,12]].map(([x,y],i) => (
      <g key={i}>
        {[0,72,144,216,288].map(deg => {
          const r = Math.PI * deg / 180;
          return <ellipse key={deg} cx={x + 2.5*Math.cos(r)} cy={y + 2.5*Math.sin(r)} rx="2" ry="1.5"
            transform={`rotate(${deg} ${x + 2.5*Math.cos(r)} ${y + 2.5*Math.sin(r)})`}
            fill={c} opacity={0.6 + i*0.05}/>;
        })}
        <circle cx={x} cy={y} r="1.8" fill="white" opacity="0.6"/>
      </g>
    ))}
  </svg>
);

// 안내판 — 정보 표지판
I.parkSign = (c, s) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none">
    {/* 기둥 */}
    <rect x="11" y="13" width="2" height="10" rx="0.8" fill={c} opacity="0.7"/>
    {/* 표지판 */}
    <rect x="2" y="3" width="20" height="12" rx="2" fill={c} opacity="0.85"/>
    {/* 안쪽 */}
    <rect x="3.5" y="4.5" width="17" height="9" rx="1.2" fill={c} opacity="0.4"/>
    {/* i 아이콘 */}
    <circle cx="12" cy="7" r="1.5" fill="white" opacity="0.9"/>
    <rect x="11" y="9.5" width="2" height="3" rx="0.8" fill="white" opacity="0.9"/>
    {/* 기둥 꽂히는 바닥 */}
    <ellipse cx="12" cy="23" rx="3.5" ry="1" fill={c} opacity="0.4"/>
    {/* 모서리 장식 */}
    <circle cx="4"  cy="4"  r="0.8" fill="white" opacity="0.3"/>
    <circle cx="20" cy="4"  r="0.8" fill="white" opacity="0.3"/>
    <circle cx="4"  cy="14" r="0.8" fill="white" opacity="0.3"/>
    <circle cx="20" cy="14" r="0.8" fill="white" opacity="0.3"/>
  </svg>
);

/* ═══════════════════════════════
   🆕 PHASE 4 BUILDINGS
═══════════════════════════════ */

// 원형극장 — 반원형 객석 + 무대
I.amphitheater = (c, s) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none">
    {/* 무대 */}
    <rect x="4" y="19" width="16" height="3.5" rx="0.8" fill={c}/>
    <rect x="2" y="21" width="20" height="2" rx="0.5" fill={c} opacity="0.6"/>
    {/* 공연자 */}
    <circle cx="12" cy="18" r="1.8" fill={c}/>
    {/* 객석 호 (3단) */}
    <path d="M5 18.5 Q12 15 19 18.5" stroke={c} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    <path d="M3 15.5 Q12 10.5 21 15.5" stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8"/>
    <path d="M1.5 12 Q12 5.5 22.5 12" stroke={c} strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.6"/>
    {/* 관객 점 */}
    {[[7,18],[12,17.5],[17,18],[5.5,15],[12,14],[18.5,15]].map(([x,y],i)=>(
      <circle key={i} cx={x} cy={y} r="0.9" fill={c} opacity={0.5+i*0.05}/>
    ))}
    {/* 기둥 */}
    <rect x="4.5" y="13" width="1.2" height="6" rx="0.4" fill={c} opacity="0.45"/>
    <rect x="18.3" y="13" width="1.2" height="6" rx="0.4" fill={c} opacity="0.45"/>
    {/* 조명 효과 */}
    <path d="M10 2 L11 8" stroke={c} strokeWidth="0.8" opacity="0.3"/>
    <path d="M14 2 L13 8" stroke={c} strokeWidth="0.8" opacity="0.3"/>
  </svg>
);

// 커피숍 — 컵 + 스팀
I.coffeeCafe = (c, s) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none">
    {/* 스팀 */}
    <path d="M8 8 Q9.5 6 8 4"  stroke={c} strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.55"/>
    <path d="M12 7 Q13.5 5 12 3" stroke={c} strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.7"/>
    <path d="M16 8 Q17.5 6 16 4" stroke={c} strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.55"/>
    {/* 컵 몸통 */}
    <path d="M5 10 L6.5 21 L17.5 21 L19 10 Z" fill={c} opacity="0.8"/>
    {/* 커피 표면 */}
    <ellipse cx="12" cy="10" rx="7" ry="2" fill={c}/>
    <ellipse cx="12" cy="10" rx="4.5" ry="1.2" fill="white" opacity="0.12"/>
    {/* 컵 장식 띠 */}
    <path d="M5.8 14.5 L18.2 14.5" stroke="white" strokeWidth="0.7" opacity="0.15"/>
    {/* 핸들 */}
    <path d="M19 12 C22.5 12 22.5 19 19 19" stroke={c} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    {/* 받침대 */}
    <ellipse cx="12" cy="21.5" rx="8.5" ry="1.5" fill={c} opacity="0.35"/>
  </svg>
);

// 포토부스 — 카메라 + 사진 스트립
I.photoBooth = (c, s) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none">
    {/* 부스 몸체 */}
    <rect x="4" y="5" width="14" height="14" rx="2" fill={c} opacity="0.7"/>
    {/* 부스 지붕 */}
    <rect x="3" y="3" width="16" height="3.5" rx="1.5" fill={c}/>
    {/* 렌즈 외부링 */}
    <circle cx="12" cy="12" r="4.5" stroke={c} strokeWidth="2" fill={c+"18"}/>
    {/* 렌즈 내부 */}
    <circle cx="12" cy="12" r="2.8" fill={c} opacity="0.9"/>
    <circle cx="12" cy="12" r="1.4" fill="white" opacity="0.2"/>
    <circle cx="10.8" cy="10.8" r="0.7" fill="white" opacity="0.4"/>
    {/* 플래시 */}
    <polygon points="16.5,4.5 18.5,6 16.5,7.5 17.5,6" fill={c} opacity="0.9"/>
    {/* 사진 스트립 (하단) */}
    {[0,1,2].map(i=>(
      <rect key={i} x={5+i*5} y="20" width="4" height="3" rx="0.5" fill={c} opacity={0.7-i*0.15}/>
    ))}
    {/* 셔터 버튼 */}
    <circle cx="6.5" cy="12" r="1.2" fill={c} opacity="0.85"/>
    <circle cx="6.5" cy="12" r="0.5" fill="white" opacity="0.4"/>
  </svg>
);

// 응급처치소 — 십자가 + 의료 건물
I.firstAid = (c, s) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none">
    {/* 건물 */}
    <rect x="3" y="10" width="18" height="13" rx="1.2" fill={c} opacity="0.5" stroke={c} strokeWidth="1.3"/>
    {/* 지붕 삼각형 */}
    <polygon points="12,2 1,11 23,11" fill={c} opacity="0.8"/>
    {/* 십자가 */}
    <rect x="9.5" y="14" width="5" height="1.8" rx="0.5" fill="white" opacity="0.85"/>
    <rect x="10.6" y="12.5" width="2.8" height="5.5" rx="0.5" fill="white" opacity="0.85"/>
    {/* 문 */}
    <rect x="10.5" y="18.5" width="3" height="4.5" rx="0.5" fill={c} opacity="0.8"/>
    {/* 창문 */}
    <rect x="5" y="14" width="3" height="3" rx="0.5" fill={c} opacity="0.7"/>
    <rect x="16" y="14" width="3" height="3" rx="0.5" fill={c} opacity="0.7"/>
    {/* 빛나는 십자가 후광 */}
    <circle cx="12" cy="15.5" r="4" fill={c} opacity="0.08"/>
  </svg>
);

// 어린이 놀이터 — 미끄럼틀 + 그네
I.kidsPlayground = (c, s) => (
  <svg viewBox="0 0 24 24" width={s} height={s} fill="none">
    {/* 그네 A프레임 */}
    <line x1="1.5" y1="21" x2="8"   y2="5"  stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="14.5" y1="21" x2="8"  y2="5"  stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    {/* 그네 상단 바 */}
    <line x1="1.5" y1="21" x2="14.5" y2="21" stroke={c} strokeWidth="1.2" opacity="0.4"/>
    {/* 그네 줄 */}
    <line x1="5"  y1="5.5" x2="5.5"  y2="14" stroke={c} strokeWidth="1" opacity="0.7"/>
    <line x1="11" y1="5.5" x2="10.5" y2="14" stroke={c} strokeWidth="1" opacity="0.7"/>
    {/* 그네 시트 */}
    <rect x="4.5" y="14" width="7" height="2" rx="1" fill={c}/>
    {/* 미끄럼틀 플랫폼 */}
    <rect x="16" y="7" width="5" height="2" rx="0.8" fill={c}/>
    {/* 미끄럼틀 계단 기둥 */}
    <rect x="20" y="9" width="1.5" height="12" rx="0.5" fill={c} opacity="0.6"/>
    {/* 미끄럼틀 */}
    <path d="M16 9 L17.5 21" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
    {/* 미끄럼틀 가드 */}
    <line x1="15.5" y1="8" x2="16.5" y2="8" stroke={c} strokeWidth="1.5" opacity="0.6"/>
    {/* 바닥 */}
    <line x1="0.5" y1="22" x2="23.5" y2="22" stroke={c} strokeWidth="1.2" opacity="0.35"/>
    {/* 어린이 */}
    <circle cx="8" cy="12" r="1.5" fill={c} opacity="0.8"/>
  </svg>
);

/* ═══════════════════════════════
   Export
═══════════════════════════════ */

/**
 * 건물 타입별 SVG 아이콘 반환
 * @param {string} type - 건물 타입 (B 객체의 키)
 * @param {string} color - 건물 색상 (B[type].color)
 * @param {number} size - 렌더링 크기 (px)
 * @returns {JSX.Element|null}
 */
export function getBuildingIcon(type, color, size = 20) {
  const fn = I[type];
  if (!fn) return null;
  return fn(color, size);
}

/** 해당 타입의 아이콘이 존재하는지 */
export function hasBuildingIcon(type) {
  return type in I;
}

/** 모든 아이콘 타입 목록 */
export const ICON_TYPES = Object.keys(I);
