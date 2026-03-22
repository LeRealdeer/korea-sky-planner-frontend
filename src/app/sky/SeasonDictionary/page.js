"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "../../components/LoadingSpinner";
import { seasonColors, seasons as SEASON_ORDER } from "../../constants/seasonColors";
import styles from "./page.module.css";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const SK_SOULS    = "seasonDict_souls";
const SK_QUERY    = "seasonDict_query";
const SK_SEASON   = "seasonDict_season";
const SK_SCROLL   = "seasonDict_scroll";
const SK_OPEN     = "seasonDict_open";

function SeasonDictionaryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [allSouls, setAllSouls]       = useState([]);
  const [grouped, setGrouped]         = useState([]);
  const [openSeasons, setOpenSeasons] = useState({});

  const [selectedSeason, setSelectedSeason]       = useState("");
  const [seasonInfo, setSeasonInfo]               = useState(null);
  const [seasonInfoLoading, setSeasonInfoLoading] = useState(false);

  const [searchQuery, setSearchQuery]       = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);

  const isRestoring = useRef(false);

  // ── 초기화: 세션 복원 or 새 로드 ──
  useEffect(() => {
    const urlQuery  = searchParams.get("query")  || "";
    const urlSeason = searchParams.get("season") || "";

    const savedSouls  = sessionStorage.getItem(SK_SOULS);
    const savedScroll = sessionStorage.getItem(SK_SCROLL);
    const savedQuery  = sessionStorage.getItem(SK_QUERY);
    const savedSeason = sessionStorage.getItem(SK_SEASON);
    const savedOpen   = sessionStorage.getItem(SK_OPEN);

    const isBack = savedSouls !== null;

    if (isBack) {
      // 세션 복원
      isRestoring.current = true;
      try {
        const souls   = JSON.parse(savedSouls);
        const query   = savedQuery  ?? urlQuery;
        const season  = savedSeason ?? urlSeason;
        const openMap = savedOpen ? JSON.parse(savedOpen) : null;

        setAllSouls(souls);
        setSearchQuery(query);
        setSubmittedQuery(query);
        setSelectedSeason(season);
        setLoading(false);
        if (season) fetchSeasonInfo(season);

        // 그룹 빌드 후 스크롤 복원
        buildGroupsSync(souls, query, season, openMap);

        if (savedScroll) {
          setTimeout(() => {
            window.scrollTo(0, parseInt(savedScroll));
            isRestoring.current = false;
          }, 120);
        } else {
          isRestoring.current = false;
        }
      } catch {
        isRestoring.current = false;
        setSearchQuery(urlQuery);
        setSubmittedQuery(urlQuery);
        setSelectedSeason(urlSeason);
        if (urlSeason) fetchSeasonInfo(urlSeason);
        fetchAllSouls();
      }
    } else {
      // 새 로드
      setSearchQuery(urlQuery);
      setSubmittedQuery(urlQuery);
      setSelectedSeason(urlSeason);
      if (urlSeason) fetchSeasonInfo(urlSeason);
      fetchAllSouls();
    }
  }, []);

  // allSouls 바뀌면 그룹 재계산 (새 로드 시)
  useEffect(() => {
    if (allSouls.length > 0 && !isRestoring.current) {
      buildGroupsSync(allSouls, submittedQuery, selectedSeason, null);
    }
  }, [allSouls]);

  // submittedQuery / selectedSeason 바뀌면 재계산 (세션 복원 후 변경 시)
  useEffect(() => {
    if (allSouls.length > 0 && !isRestoring.current) {
      buildGroupsSync(allSouls, submittedQuery, selectedSeason, null);
    }
  }, [submittedQuery, selectedSeason]);

  // 카드 클릭 시 상태 저장
  const saveSession = () => {
    sessionStorage.setItem(SK_SOULS,  JSON.stringify(allSouls));
    sessionStorage.setItem(SK_QUERY,  submittedQuery);
    sessionStorage.setItem(SK_SEASON, selectedSeason);
    sessionStorage.setItem(SK_SCROLL, window.scrollY.toString());
    sessionStorage.setItem(SK_OPEN,   JSON.stringify(openSeasons));
  };

  // 세션 초기화 (검색/시즌 변경 시)
  const clearSession = () => {
    sessionStorage.removeItem(SK_SOULS);
    sessionStorage.removeItem(SK_SCROLL);
    sessionStorage.removeItem(SK_OPEN);
  };

  // ── fetch ──
  const fetchAllSouls = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/souls/all`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setAllSouls(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeasonInfo = async (seasonName) => {
    if (!seasonName) { setSeasonInfo(null); return; }
    setSeasonInfoLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/v1/seasons`);
      if (res.ok) {
        const data = await res.json();
        setSeasonInfo((data.data || []).find(s => s.name === seasonName) || null);
      }
    } catch { setSeasonInfo(null); }
    finally { setSeasonInfoLoading(false); }
  };

  // ── 그룹 빌드 ──
  const buildGroupsSync = (souls, query, season, openMap) => {
    const q = query.trim().toLowerCase();

    let filtered = q
      ? souls.filter(s =>
          s.name?.toLowerCase().includes(q) ||
          s.keywords?.some(k => k.toLowerCase().includes(q)) ||
          s.seasonName?.toLowerCase().includes(q)
        )
      : souls;

    if (season) filtered = filtered.filter(s => s.seasonName === season);

    const map = new Map();
    filtered.forEach(soul => {
      const sn = soul.seasonName || "기타";
      if (!map.has(sn)) map.set(sn, []);
      map.get(sn).push(soul);
    });

    map.forEach(soulsInSeason => {
      soulsInSeason.sort((a, b) => (a.orderNum ?? 999) - (b.orderNum ?? 999));
    });

    const sortedGroups = [];
    SEASON_ORDER.forEach(sn => {
      if (map.has(sn)) sortedGroups.push({ seasonName: sn, souls: map.get(sn) });
    });
    map.forEach((s, sn) => {
      if (!SEASON_ORDER.includes(sn)) sortedGroups.push({ seasonName: sn, souls: s });
    });

    setGrouped(sortedGroups);

    if (openMap) {
      setOpenSeasons(openMap);
    } else {
      const newOpen = {};
      sortedGroups.forEach(g => { newOpen[g.seasonName] = true; });
      setOpenSeasons(newOpen);
    }
  };

  const toggleSeason = (seasonName) => {
    setOpenSeasons(prev => ({ ...prev, [seasonName]: !prev[seasonName] }));
  };

  // ── 핸들러 ──
  const handleSeasonClick = (seasonName) => {
    clearSession();
    setSelectedSeason(seasonName);
    fetchSeasonInfo(seasonName);
    setSubmittedQuery("");
    setSearchQuery("");
    const params = new URLSearchParams();
    params.set("season", seasonName);
    router.push(`/sky/SeasonDictionary?${params.toString()}`);
  };

  const handleAllView = () => {
    clearSession();
    setSelectedSeason("");
    setSeasonInfo(null);
    setSearchQuery("");
    setSubmittedQuery("");
    router.push("/sky/SeasonDictionary");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    clearSession();
    setSubmittedQuery(searchQuery);
    setSelectedSeason("");
    setSeasonInfo(null);
    const params = new URLSearchParams();
    if (searchQuery) params.set("query", searchQuery);
    router.push(`/sky/SeasonDictionary?${params.toString()}`);
  };

  const handleClearSearch = () => {
    clearSession();
    setSearchQuery("");
    setSubmittedQuery("");
    router.push("/sky/SeasonDictionary");
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${y}.${m}.${d}`;
  };

  const seasonColor = selectedSeason ? (seasonColors[selectedSeason] || "#667eea") : undefined;
  const totalCount = grouped.reduce((sum, g) => sum + g.souls.length, 0);

  return (
    <div className={styles.container}>

      {/* ── 출처 박스 ── */}
      <div className={styles.creditSection}>
        <div className={styles.creditBox}>
          <p className={styles.creditLine}>
            <strong>노드표 &amp; 위치:</strong>{" "}
            <a href="https://discord.com/invite/skyinfographicsdatabase" target="_blank" rel="noopener noreferrer" className={styles.creditLink}>
              Sky Infographics Database (공식 디스코드)
            </a>
          </p>
          <p className={styles.creditLine}>
            <strong>아이콘:</strong>{" "}
            <a href="https://sky-children-of-the-light.fandom.com/wiki/Sky:_Children_of_the_Light_Wiki" target="_blank" rel="noopener noreferrer" className={styles.creditLink}>
              Sky Fandom Wiki
            </a>
          </p>
          <p className={styles.creditLine}>
            <strong>착용샷:</strong> 무륵, 엔, 망고, 도연, 햇비님께서 도와주셨습니다
          </p>
        </div>
      </div>

      {/* ── 헤더 ── */}
      <div
        className={styles.header}
        style={seasonColor ? { background: seasonColor } : undefined}
      >
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            {selectedSeason ? `${selectedSeason} 시즌` : "시즌 대백과"}
          </h1>
          <p className={styles.subtitle}>영혼 이름이나 외형 키워드로 검색해보세요</p>

          {selectedSeason && (
            <div className={styles.seasonInfoStrip}>
              {seasonInfoLoading ? (
                <span className={styles.infoStripLoading}>로딩 중...</span>
              ) : seasonInfo ? (
                <>
                  {seasonInfo.orderNum != null && (
                    <div className={styles.infoStripItem}>
                      <span className={styles.infoStripLabel}>시즌 순서</span>
                      <span className={styles.infoStripValue}>{seasonInfo.orderNum}번째 시즌</span>
                    </div>
                  )}
                  {seasonInfo.startDate && seasonInfo.endDate && (
                    <>
                      <div className={styles.infoStripDivider} />
                      <div className={styles.infoStripItem}>
                        <span className={styles.infoStripLabel}>진행 기간</span>
                        <span className={styles.infoStripValue}>
                          {formatDate(seasonInfo.startDate)} – {formatDate(seasonInfo.endDate)}
                        </span>
                      </div>
                    </>
                  )}
                  {seasonInfo.durationDays && (
                    <>
                      <div className={styles.infoStripDivider} />
                      <div className={styles.infoStripItem}>
                        <span className={styles.infoStripLabel}>진행일수</span>
                        <span className={styles.infoStripValue}>{seasonInfo.durationDays}일</span>
                      </div>
                    </>
                  )}
                  {seasonInfo.isCollaboration && (
                    <>
                      <div className={styles.infoStripDivider} />
                      <div className={styles.infoStripItem}>
                        <span className={styles.collabTag}>콜라보 시즌</span>
                      </div>
                    </>
                  )}
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* ── 컨트롤 카드 ── */}
      <div className={styles.controlCard}>
        <p className={styles.chipGuide}>시즌 이름을 클릭하면 해당 시즌만 볼 수 있어요:</p>

        <div className={styles.seasonChips}>
          {SEASON_ORDER.map(season => (
            <button
              key={season}
              onClick={() => handleSeasonClick(season)}
              className={`${styles.seasonChip} ${selectedSeason === season ? styles.chipActive : ""}`}
              style={{ backgroundColor: seasonColors[season] || "#888" }}
            >
              {season}
            </button>
          ))}
        </div>

        <div className={styles.allViewRow}>
          <button
            onClick={handleAllView}
            className={`${styles.allViewBtn} ${!selectedSeason ? styles.allViewBtnActive : ""}`}
          >
            전체보기
          </button>
        </div>

        <div className={styles.searchWrapper}>
          <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="영혼 이름, 키워드 검색..."
              className={styles.searchInput}
            />
            {searchQuery && (
              <button type="button" className={styles.clearBtn} onClick={handleClearSearch}>✕</button>
            )}
            <button type="submit" className={styles.searchButton}>검색</button>
          </form>
          {submittedQuery && (
            <p className={styles.searchResult}>
              <strong>"{submittedQuery}"</strong> 검색 결과 — {totalCount}개 영혼
            </p>
          )}
        </div>
      </div>

      {/* ── 영혼 목록 ── */}
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <p className={styles.stateMsg}>오류: {error}</p>
      ) : grouped.length === 0 ? (
        <p className={styles.stateMsg}>검색 결과가 없습니다.</p>
      ) : (
        <div className={styles.accordionList}>
          {grouped.map(({ seasonName, souls }) => {
            const color = seasonColors[seasonName] || "#888";
            const isOpen = openSeasons[seasonName] ?? true;

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
                  </div>
                  <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}>›</span>
                </button>

                {isOpen && (
                  <div className={styles.soulsGrid}>
                    {souls.map(soul => {
                      const repImg = soul.images?.find(img => img.imageType === "REPRESENTATIVE");
                      return (
                        <Link
                          key={soul.id}
                          href={`/sky/SeasonDictionary/souls/${soul.id}`}
                          className={styles.soulCard}
                          onClick={saveSession}
                        >
                          <div className={styles.imageWrapper}>
                            {repImg?.url
                              ? <img src={repImg.url} alt={soul.name} className={styles.cardImage} />
                              : <div className={styles.noImage}>—</div>
                            }
                          </div>
                          <div className={styles.cardContent}>
                            <p className={styles.soulName}>{soul.name}</p>

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
      )}
    </div>
  );
}

export default function SeasonDictionaryPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SeasonDictionaryContent />
    </Suspense>
  );
}