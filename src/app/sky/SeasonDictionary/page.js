"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "../../components/LoadingSpinner";
import { seasonColors, seasons as SEASON_ORDER } from "../../constants/seasonColors";
import styles from "./page.module.css";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function SeasonDictionaryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [allSouls, setAllSouls] = useState([]);
  const [grouped, setGrouped] = useState([]);       // 표시할 그룹 (필터 적용)
  const [openSeasons, setOpenSeasons] = useState({});

  const [selectedSeason, setSelectedSeason] = useState(""); // 선택된 시즌
  const [seasonInfo, setSeasonInfo] = useState(null);
  const [seasonInfoLoading, setSeasonInfoLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const urlQuery = searchParams.get("query") || "";
    const urlSeason = searchParams.get("season") || "";
    setSearchQuery(urlQuery);
    setSubmittedQuery(urlQuery);
    setSelectedSeason(urlSeason);
    if (urlSeason) fetchSeasonInfo(urlSeason);
    fetchAllSouls();
  }, []);

  useEffect(() => {
    if (allSouls.length > 0) buildGroups(allSouls, submittedQuery, selectedSeason);
  }, [allSouls, submittedQuery, selectedSeason]);

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
        const found = (data.data || []).find(s => s.name === seasonName);
        setSeasonInfo(found || null);
      }
    } catch (e) { setSeasonInfo(null); }
    finally { setSeasonInfoLoading(false); }
  };

  const buildGroups = (souls, query, season) => {
    const q = query.trim().toLowerCase();

    // 1) 키워드 검색 필터
    let filtered = q
      ? souls.filter(s =>
          s.name?.toLowerCase().includes(q) ||
          s.keywords?.some(k => k.toLowerCase().includes(q)) ||
          s.seasonName?.toLowerCase().includes(q)
        )
      : souls;

    // 2) 시즌 필터
    if (season) {
      filtered = filtered.filter(s => s.seasonName === season);
    }

    // 3) 시즌별 그룹핑
    const map = new Map();
    filtered.forEach(soul => {
      const sn = soul.seasonName || "기타";
      if (!map.has(sn)) map.set(sn, []);
      map.get(sn).push(soul);
    });

    // 4) orderNum 오름차순 정렬
    map.forEach(soulsInSeason => {
      soulsInSeason.sort((a, b) => (a.orderNum ?? 999) - (b.orderNum ?? 999));
    });

    // 5) SEASON_ORDER 기준 정렬
    const sortedGroups = [];
    SEASON_ORDER.forEach(sn => {
      if (map.has(sn)) sortedGroups.push({ seasonName: sn, souls: map.get(sn) });
    });
    map.forEach((s, sn) => {
      if (!SEASON_ORDER.includes(sn)) sortedGroups.push({ seasonName: sn, souls: s });
    });

    setGrouped(sortedGroups);

    // 전부 펼침
    const newOpen = {};
    sortedGroups.forEach(g => { newOpen[g.seasonName] = true; });
    setOpenSeasons(newOpen);
  };

  const toggleSeason = (seasonName) => {
    setOpenSeasons(prev => ({ ...prev, [seasonName]: !prev[seasonName] }));
  };

  // 시즌칩 클릭
  const handleSeasonClick = (seasonName) => {
    setSelectedSeason(seasonName);
    fetchSeasonInfo(seasonName);
    setSubmittedQuery("");
    setSearchQuery("");
    const params = new URLSearchParams();
    params.set("season", seasonName);
    router.push(`/sky/SeasonDictionary?${params.toString()}`);
  };

  // 전체보기
  const handleAllView = () => {
    setSelectedSeason("");
    setSeasonInfo(null);
    setSearchQuery("");
    setSubmittedQuery("");
    router.push("/sky/SeasonDictionary");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSubmittedQuery(searchQuery);
    setSelectedSeason("");
    setSeasonInfo(null);
    const params = new URLSearchParams();
    if (searchQuery) params.set("query", searchQuery);
    router.push(`/sky/SeasonDictionary?${params.toString()}`);
  };

  const handleClearSearch = () => {
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

      {/* ── 헤더 (시즌 선택 시 색 변경 + 인포 스트립) ── */}
      <div
        className={styles.header}
        style={seasonColor ? { background: seasonColor } : undefined}
      >
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            {selectedSeason ? `${selectedSeason} 시즌` : "시즌 대백과"}
          </h1>
          <p className={styles.subtitle}>영혼 이름이나 외형 키워드로 검색해보세요</p>

          {/* 시즌 인포 스트립 */}
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

        {/* 시즌 칩 */}
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

        {/* 전체보기 */}
        <div className={styles.allViewRow}>
          <button
            onClick={handleAllView}
            className={`${styles.allViewBtn} ${!selectedSeason ? styles.allViewBtnActive : ""}`}
          >
            전체보기
          </button>
        </div>

        {/* 검색창 */}
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
                        >
                          <div className={styles.imageWrapper}>
                            {repImg?.url
                              ? <img src={repImg.url} alt={soul.name} className={styles.cardImage} />
                              : <div className={styles.noImage}>—</div>
                            }
                          </div>
                          <div className={styles.cardContent}>
                            <p className={styles.soulName}>{soul.name}</p>
                            {soul.isSeasonGuide && (
                              <span className={styles.guideBadge}>가이드</span>
                            )}
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