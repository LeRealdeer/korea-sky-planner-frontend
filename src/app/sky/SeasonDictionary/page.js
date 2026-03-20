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
  const [grouped, setGrouped] = useState([]);
  const [openSeasons, setOpenSeasons] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 시즌 섹션 ref (스크롤용)
  const sectionRefs = useRef({});

  useEffect(() => {
    const urlQuery = searchParams.get("query") || "";
    setSearchQuery(urlQuery);
    setSubmittedQuery(urlQuery);
    fetchAllSouls();
  }, []);

  useEffect(() => {
    if (allSouls.length > 0) buildGroups(allSouls, submittedQuery);
  }, [allSouls, submittedQuery]);

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

  const buildGroups = (souls, query) => {
    const q = query.trim().toLowerCase();

    const filtered = q
      ? souls.filter(s =>
          s.name?.toLowerCase().includes(q) ||
          s.keywords?.some(k => k.toLowerCase().includes(q)) ||
          s.seasonName?.toLowerCase().includes(q)
        )
      : souls;

    const map = new Map();
    filtered.forEach(soul => {
      const sn = soul.seasonName || "기타";
      if (!map.has(sn)) map.set(sn, []);
      map.get(sn).push(soul);
    });

    // 각 시즌 내 영혼을 orderNum 오름차순 정렬
    map.forEach((soulsInSeason, sn) => {
      soulsInSeason.sort((a, b) => (a.orderNum ?? 999) - (b.orderNum ?? 999));
    });

    // SEASON_ORDER 기준 정렬
    const sortedGroups = [];
    SEASON_ORDER.forEach(sn => {
      if (map.has(sn)) sortedGroups.push({ seasonName: sn, souls: map.get(sn) });
    });
    map.forEach((s, sn) => {
      if (!SEASON_ORDER.includes(sn)) sortedGroups.push({ seasonName: sn, souls: s });
    });

    setGrouped(sortedGroups);

    // 기본: 전부 펼침
    const newOpen = {};
    sortedGroups.forEach(g => { newOpen[g.seasonName] = true; });
    setOpenSeasons(newOpen);
  };

  const toggleSeason = (seasonName) => {
    setOpenSeasons(prev => ({ ...prev, [seasonName]: !prev[seasonName] }));
  };

  // 시즌칩 클릭 → 해당 섹션으로 스크롤 + 펼치기
  const handleChipClick = (seasonName) => {
    setOpenSeasons(prev => ({ ...prev, [seasonName]: true }));
    setTimeout(() => {
      sectionRefs.current[seasonName]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSubmittedQuery(searchQuery);
    const params = new URLSearchParams();
    if (searchQuery) params.set("query", searchQuery);
    router.push(`/sky/SeasonDictionary?${params.toString()}`);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSubmittedQuery("");
    router.push("/sky/SeasonDictionary");
  };

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
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>시즌 대백과</h1>
          <p className={styles.subtitle}>영혼 이름이나 외형 키워드로 검색해보세요</p>
        </div>
      </div>

      {/* ── 컨트롤 카드 (칩 + 검색) ── */}
      <div className={styles.controlCard}>

        {/* 시즌 칩 */}
        <p className={styles.chipGuide}>시즌 이름을 클릭하면 해당 시즌으로 이동합니다:</p>
        <div className={styles.seasonChips}>
          {SEASON_ORDER.map(season => {
            const color = seasonColors[season] || "#888";
            const exists = grouped.some(g => g.seasonName === season);
            return (
              <button
                key={season}
                onClick={() => handleChipClick(season)}
                className={styles.seasonChip}
                style={{ backgroundColor: color, opacity: exists ? 1 : 0.35 }}
                disabled={!exists}
              >
                {season}
              </button>
            );
          })}
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
              <div
                key={seasonName}
                className={styles.seasonSection}
                ref={el => { sectionRefs.current[seasonName] = el; }}
              >
                {/* 시즌 헤더 */}
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

                {/* 영혼 카드 그리드 */}
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