// src/app/sky/travelingSprits/oldestSprits/page.js
"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import { seasonColors } from "../../../constants/seasonColors";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const SESSION_KEY_TAB       = "oldestPage_tab";
const SESSION_KEY_OLDEST    = "oldestPage_oldest";
const SESSION_KEY_UNVISITED = "oldestPage_unvisited";
const SESSION_KEY_SCROLL    = "oldestPage_scroll";

// 날짜 파싱
const parseDate = (str) => {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export default function OldestSpiritsPage() {
  const router = useRouter();

  // 탭: "oldest" | "unvisited"
  const [activeTab, setActiveTab] = useState("oldest");

  // 오래된 유랑
  const [spirits, setSpirits] = useState([]);
  const [loadingOldest, setLoadingOldest] = useState(true);
  const [loadingMoreOldest, setLoadingMoreOldest] = useState(false);
  const [pageOldest, setPageOldest] = useState(0);
  const [hasMoreOldest, setHasMoreOldest] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  // 미복각 영혼
  const [unvisited, setUnvisited] = useState([]);
  const [loadingUnvisited, setLoadingUnvisited] = useState(false);
  const [unvisitedLoaded, setUnvisitedLoaded] = useState(false);

  // 미복각 시즌별 접기
  const [openSeasons, setOpenSeasons] = useState({});

  const [error, setError] = useState(null);

  // 무한스크롤 ref (오래된 유랑)
  const observerRef = useRef();
  const lastSpiritRef = useCallback((node) => {
    if (loadingMoreOldest) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMoreOldest) loadMoreOldest();
    });
    if (node) observerRef.current.observe(node);
  }, [loadingMoreOldest, hasMoreOldest]);

  // ── 초기화: 세션에서 복원 ──
  useEffect(() => {
    const savedTab      = sessionStorage.getItem(SESSION_KEY_TAB);
    const savedOldest   = sessionStorage.getItem(SESSION_KEY_OLDEST);
    const savedUnvisited= sessionStorage.getItem(SESSION_KEY_UNVISITED);
    const savedScroll   = sessionStorage.getItem(SESSION_KEY_SCROLL);

    if (savedTab) setActiveTab(savedTab);

    if (savedOldest) {
      try {
        const { spirits: s, page: p, hasMore: h, total: t } = JSON.parse(savedOldest);
        setSpirits(s || []);
        setPageOldest(p || 0);
        setHasMoreOldest(h ?? true);
        setTotalElements(t || 0);
        setLoadingOldest(false);
      } catch { fetchOldest(); }
    } else {
      fetchOldest();
    }

    if (savedUnvisited) {
      try {
        const parsed = JSON.parse(savedUnvisited);
        setUnvisited(parsed || []);
        setUnvisitedLoaded(true);
        buildUnvisitedGroups(parsed || []);
      } catch { /* 필요할 때 로드 */ }
    }

    if (savedScroll) {
      setTimeout(() => window.scrollTo(0, parseInt(savedScroll)), 100);
      sessionStorage.removeItem(SESSION_KEY_SCROLL);
    }
  }, []);

  // 페이지 떠날 때 스크롤 저장
  useEffect(() => {
    const saveScroll = () => {
      sessionStorage.setItem(SESSION_KEY_SCROLL, window.scrollY.toString());
    };
    const links = document.querySelectorAll("a");
    links.forEach(l => l.addEventListener("click", saveScroll));
    return () => links.forEach(l => l.removeEventListener("click", saveScroll));
  }, [spirits, unvisited]);

  // 탭 변경 시 세션 저장
  const switchTab = (tab) => {
    setActiveTab(tab);
    sessionStorage.setItem(SESSION_KEY_TAB, tab);
    if (tab === "unvisited" && !unvisitedLoaded) fetchUnvisited();
  };

  // ── 오래된 유랑 fetch ──
  const fetchOldest = async (pageNum = 0, append = false) => {
    append ? setLoadingMoreOldest(true) : setLoadingOldest(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/souls/oldest-spirits?page=${pageNum}&size=20`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const pd = data.data;
      const newSpirits = append
        ? (prev => {
            const merged = [...prev, ...(pd.content || [])];
            saveOldestSession(merged, pageNum, !pd.last, pd.totalElements || totalElements);
            return merged;
          })
        : pd.content || [];

      if (!append) {
        setSpirits(newSpirits);
        setTotalElements(pd.totalElements || 0);
        saveOldestSession(newSpirits, pageNum, !pd.last, pd.totalElements || 0);
      } else {
        setSpirits(prev => {
          const merged = [...prev, ...(pd.content || [])];
          saveOldestSession(merged, pageNum, !pd.last, totalElements);
          return merged;
        });
      }
      setHasMoreOldest(!pd.last);
      setPageOldest(pageNum);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingOldest(false);
      setLoadingMoreOldest(false);
    }
  };

  const loadMoreOldest = () => {
    if (loadingMoreOldest || !hasMoreOldest) return;
    fetchOldest(pageOldest + 1, true);
  };

  const saveOldestSession = (s, p, h, t) => {
    sessionStorage.setItem(SESSION_KEY_OLDEST, JSON.stringify({ spirits: s, page: p, hasMore: h, total: t }));
  };

  // ── 미복각 영혼 fetch ──
  const fetchUnvisited = async () => {
    setLoadingUnvisited(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/souls/all`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const all = data.data || [];
      const filtered = all
        .filter(s => !s.seasonGuide && (s.totalVisits ?? 0) === 0)
        .sort((a, b) => {
          // 시즌 종료일 오래된 순 → 같으면 orderNum 순
          const ea = parseDate(a.endDate), eb = parseDate(b.endDate);
          if (ea && eb && ea - eb !== 0) return ea - eb;
          return (a.orderNum ?? 999) - (b.orderNum ?? 999);
        });
      setUnvisited(filtered);
      setUnvisitedLoaded(true);
      buildUnvisitedGroups(filtered);
      sessionStorage.setItem(SESSION_KEY_UNVISITED, JSON.stringify(filtered));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingUnvisited(false);
    }
  };

  // 미복각 시즌별 그룹핑
  const [unvisitedGrouped, setUnvisitedGrouped] = useState([]);

  const buildUnvisitedGroups = (souls) => {
    const map = new Map();
    souls.forEach(s => {
      const sn = s.seasonName || "기타";
      if (!map.has(sn)) map.set(sn, []);
      map.get(sn).push(s);
    });
    // 시즌 종료일 오래된 순 정렬
    const groups = [];
    map.forEach((soulsInSeason, sn) => {
      soulsInSeason.sort((a, b) => (a.orderNum ?? 999) - (b.orderNum ?? 999));
      groups.push({ seasonName: sn, souls: soulsInSeason, endDate: soulsInSeason[0]?.endDate });
    });
    groups.sort((a, b) => {
      const ea = parseDate(a.endDate), eb = parseDate(b.endDate);
      if (ea && eb) return ea - eb;
      return 0;
    });
    setUnvisitedGrouped(groups);
    // 기본 전부 펼침
    const open = {};
    groups.forEach(g => { open[g.seasonName] = true; });
    setOpenSeasons(open);
  };

  const toggleSeason = (sn) => setOpenSeasons(prev => ({ ...prev, [sn]: !prev[sn] }));

  // 시즌 종료 후 며칠째
  const today = new Date(); today.setHours(0,0,0,0);
  const getDaysSince = (endDateStr) => {
    const end = parseDate(endDateStr);
    if (!end) return null;
    const days = Math.floor((today - end) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : null;
  };

  // ── 포맷 헬퍼 ──
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
  };

  const formatDateShort = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${y}.${m}.${d}`;
  };

  const formatDaysSince = (days) => {
    if (days === 0) return "🔥 현재 진행중";
    if (days < 7) return `${days}일째`;
    if (days < 30) return `${days}일째`;
    if (days < 90) return `${Math.floor(days / 7)}주째`;
    if (days < 365) {
      const months = Math.floor(days / 30);
      const rem = days % 30;
      return rem > 7 ? `${months}개월 ${Math.floor(rem / 7)}주째` : `${months}개월째`;
    }
    const years = Math.floor(days / 365);
    const remMonths = Math.floor((days % 365) / 30);
    return remMonths > 0 ? `${years}년 ${remMonths}개월째` : `${years}년째`;
  };

  const getStatusClass = (days, isActive) => {
    if (isActive) return styles.statusActive;
    if (days < 30) return styles.statusRecent;
    if (days < 180) return styles.statusModerate;
    if (days < 365) return styles.statusOld;
    return styles.statusVeryOld;
  };

  // ── 렌더 ──
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {activeTab === "oldest" ? "🕰️ 오래된 영혼들" : "💤 미복각 영혼들"}
        </h1>
        <p className={styles.subtitle}>
          {activeTab === "oldest"
            ? "가장 오랫동안 만나지 못한 영혼들을 순서대로 정리하였습니다."
            : "한 번도 유랑을 오지 않은 영혼들이에요."}
        </p>
        <div className={styles.navigation}>
          <button onClick={() => router.push("/sky/travelingSprits/travelingEncyclopedia")} className={styles.navButton}>
            전체 유랑 목록
          </button>
        </div>
      </div>

      {/* 탭 */}
      <div className={styles.tabRow}>
        <button
          className={`${styles.tabBtn} ${activeTab === "oldest" ? styles.tabBtnActive : ""}`}
          onClick={() => switchTab("oldest")}
        >
          🕰️ 오래된 유랑
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === "unvisited" ? styles.tabBtnActive : ""}`}
          onClick={() => switchTab("unvisited")}
        >
          💤 미복각 영혼
          {unvisitedLoaded && (
            <span className={styles.tabCount}>{unvisited.length}</span>
          )}
        </button>
      </div>

      {error && <div className={styles.error}>오류: {error}</div>}

      {/* ── 오래된 유랑 탭 ── */}
      {activeTab === "oldest" && (
        <>
          {loadingOldest ? (
            <div className={styles.loading}>데이터를 불러오는 중...</div>
          ) : (
            <>
              <div className={styles.statsBar}>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>{totalElements}</span>
                  <span className={styles.statLabel}>등록된 영혼</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>
                    {spirits.filter(s => s.daysSinceLastVisit > 730).length}
                  </span>
                  <span className={styles.statLabel}>2년 이상</span>
                </div>
              </div>

              <div className={styles.spiritsList}>
                {spirits.map((item, index) => {
                  const { soul, daysSinceLastVisit, lastVisitDate, isActive, visitNumber } = item;
                  const repImg = soul.images?.find(img => img.imageType === "REPRESENTATIVE");
                  const isLast = index === spirits.length - 1;

                  let rank = 1;
                  if (index > 0) {
                    let startIdx = index;
                    for (let i = index - 1; i >= 0; i--) {
                      if (spirits[i].daysSinceLastVisit === daysSinceLastVisit) startIdx = i;
                      else break;
                    }
                    rank = startIdx + 1;
                  }

                  return (
                    <Link
                      key={`${soul.id}-${index}`}
                      href={`/sky/SeasonDictionary/souls/${soul.id}`}
                      className={styles.spiritCard}
                      ref={isLast ? lastSpiritRef : null}
                    >
                      <div className={styles.rankBadge}>#{rank}</div>
                      <div className={styles.imageSection}>
                        {repImg?.url
                          ? <img src={repImg.url} alt={soul.name} className={styles.spiritImage} />
                          : <div className={styles.noImage}>이미지 없음</div>
                        }
                      </div>
                      <div className={styles.infoSection}>
                        <div className={styles.nameRow}>
                          <span className={styles.seasonBadge} style={{ backgroundColor: seasonColors[soul.seasonName] || "#888" }}>
                            {soul.seasonName}
                          </span>
                          <h3 className={styles.spiritName}>{soul.name}</h3>
                        </div>
                        <div className={styles.detailsRow}>
                          <span className={styles.rerunCount}>{visitNumber}차 복각</span>
                        </div>
                        <div className={styles.dateInfo}>
                          <span>마지막 방문: {formatDate(lastVisitDate)}</span>
                        </div>
                      </div>
                      <div className={styles.statusSection}>
                        <div className={`${styles.statusBadge} ${getStatusClass(daysSinceLastVisit, isActive)}`}>
                          {formatDaysSince(daysSinceLastVisit)}
                        </div>
                        <div className={styles.daysCount}>
                          {!isActive && (
                            <>
                              <strong>{daysSinceLastVisit.toLocaleString()}</strong>일
                              {daysSinceLastVisit > 1000 && " 💔"}
                              {daysSinceLastVisit > 500 && daysSinceLastVisit <= 1000 && " 😢"}
                              {daysSinceLastVisit > 100 && daysSinceLastVisit <= 500 && " 🥺"}
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {loadingMoreOldest && (
                <div className={styles.loadingMore}>
                  <div className={styles.spinner} />
                  <span>더 많은 영혼들을 불러오는 중...</span>
                </div>
              )}
              {!hasMoreOldest && spirits.length > 0 && (
                <div className={styles.endMessage}>모든 영혼을 다 보았습니다. 총 {spirits.length}개</div>
              )}
            </>
          )}
        </>
      )}

      {/* ── 미복각 영혼 탭 ── */}
      {activeTab === "unvisited" && (
        <>
          {loadingUnvisited ? (
            <div className={styles.loading}>데이터를 불러오는 중...</div>
          ) : unvisitedGrouped.length === 0 && unvisitedLoaded ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🎉</div>
              <h3>미복각 영혼이 없습니다!</h3>
              <p>모든 영혼이 유랑을 왔었네요.</p>
            </div>
          ) : (
            <>
              <div className={styles.statsBar}>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>{unvisited.length}</span>
                  <span className={styles.statLabel}>미복각 영혼</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>{unvisitedGrouped.length}</span>
                  <span className={styles.statLabel}>해당 시즌 수</span>
                </div>
              </div>

              <div className={styles.accordionList}>
                {unvisitedGrouped.map(({ seasonName, souls, endDate }) => {
                  const color = seasonColors[seasonName] || "#888";
                  const isOpen = openSeasons[seasonName] ?? true;
                  const days = getDaysSince(endDate);

                  return (
                    <div key={seasonName} className={styles.seasonSection}>
                      <button
                        className={styles.seasonHeader}
                        onClick={() => toggleSeason(seasonName)}
                        style={{ borderLeftColor: color }}
                      >
                        <div className={styles.seasonHeaderLeft}>
                          <span className={styles.seasonDot} style={{ backgroundColor: color }} />
                          <span className={styles.seasonName}>{seasonName}</span>
                          <span className={styles.seasonCount}>{souls.length}개</span>
                          {days && (
                            <span className={styles.sinceTag}>
                              {formatDateShort(endDate)} 종료 · {days}일째
                            </span>
                          )}
                        </div>
                        <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}>›</span>
                      </button>

                      {isOpen && (
                        <div className={styles.unvisitedGrid}>
                          {souls.map(soul => {
                            const repImg = soul.images?.find(img => img.imageType === "REPRESENTATIVE");
                            return (
                              <Link
                                key={soul.id}
                                href={`/sky/SeasonDictionary/souls/${soul.id}`}
                                className={styles.unvisitedCard}
                              >
                                <div className={styles.unvisitedImgWrap}>
                                  {repImg?.url
                                    ? <img src={repImg.url} alt={soul.name} className={styles.unvisitedImg} />
                                    : <div className={styles.noImage}>—</div>
                                  }
                                </div>
                                <div className={styles.unvisitedInfo}>
                                  <p className={styles.unvisitedName}>{soul.name}</p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}