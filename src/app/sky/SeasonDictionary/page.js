"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "../../components/LoadingSpinner";
import { seasonColors, seasons } from "../../constants/seasonColors";
import styles from "./page.module.css";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function SeasonDictionaryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [souls, setSouls] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("");
  const [viewMode, setViewMode] = useState("card");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const [seasonInfo, setSeasonInfo] = useState(null);
  const [seasonInfoLoading, setSeasonInfoLoading] = useState(false);

  const bottomSentinelRef = useRef(null);
  const isRestoringScroll = useRef(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const saveState = () => {
      sessionStorage.setItem('seasonDict_scrollY', window.scrollY.toString());
      sessionStorage.setItem('seasonDict_viewMode', viewMode);
      sessionStorage.setItem('seasonDict_season', selectedSeason);
      sessionStorage.setItem('seasonDict_query', submittedQuery);
      sessionStorage.setItem('seasonDict_page', page.toString());
      sessionStorage.setItem('seasonDict_souls', JSON.stringify(souls));
    };
    const links = document.querySelectorAll('a[href*="/souls/"]');
    links.forEach(link => link.addEventListener('click', saveState));
    return () => links.forEach(link => link.removeEventListener('click', saveState));
  }, [viewMode, selectedSeason, submittedQuery, page, souls]);

  useEffect(() => {
    const urlMode = searchParams.get("mode");
    const urlSeason = searchParams.get("season");
    const urlQuery = searchParams.get("query");

    const savedScrollY = sessionStorage.getItem('seasonDict_scrollY');
    const savedMode = sessionStorage.getItem('seasonDict_viewMode');
    const savedSeason = sessionStorage.getItem('seasonDict_season');
    const savedQuery = sessionStorage.getItem('seasonDict_query');
    const savedPage = sessionStorage.getItem('seasonDict_page');
    const savedSouls = sessionStorage.getItem('seasonDict_souls');

    const isBackNavigation = savedScrollY !== null;

    if (isBackNavigation) {
      const restoredSeason = savedSeason || urlSeason || "";
      setViewMode(savedMode || urlMode || "card");
      setSelectedSeason(restoredSeason);
      setSearchQuery(savedQuery || urlQuery || "");
      setSubmittedQuery(savedQuery || urlQuery || "");
      setPage(parseInt(savedPage || "0"));

      if (savedSouls) {
        try {
          setSouls(JSON.parse(savedSouls));
          setLoading(false);
        } catch (e) {}
      }

      isRestoringScroll.current = true;
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollY));
        isRestoringScroll.current = false;
        sessionStorage.removeItem('seasonDict_scrollY');
        sessionStorage.removeItem('seasonDict_souls');
      }, 100);

      if (restoredSeason) fetchSeasonInfo(restoredSeason);
    } else {
      const initialSeason = urlSeason || "";
      setViewMode(urlMode || "card");
      setSelectedSeason(initialSeason);
      setSearchQuery(urlQuery || "");
      setSubmittedQuery(urlQuery || "");
      if (initialSeason) fetchSeasonInfo(initialSeason);
    }
  }, [searchParams]);

  const fetchSeasonInfo = async (seasonName) => {
    if (!seasonName) { setSeasonInfo(null); return; }
    setSeasonInfoLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/v1/seasons`);
      if (response.ok) {
        const data = await response.json();
        const found = (data.data || []).find(s => s.name === seasonName);
        setSeasonInfo(found || null);
      }
    } catch (e) {
      setSeasonInfo(null);
    } finally {
      setSeasonInfoLoading(false);
    }
  };

  const fetchSouls = async (pageNum = 0, query = "", season = "", isAppend = false) => {
    if (isAppend) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      let url = `${BASE_URL}/api/v1/souls?page=${pageNum}&size=20`;
      if (query.trim()) url += `&query=${encodeURIComponent(query)}`;
      if (season) url += `&seasonName=${encodeURIComponent(season)}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const pageData = data.data;

      if (isAppend) {
        setSouls(prev => [...prev, ...(pageData.content || [])]);
      } else {
        setSouls(pageData.content || []);
      }

      setHasMore(!pageData.last);
      setPage(pageNum);
    } catch (err) {
      setError(err.message);
      setSouls([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (isRestoringScroll.current) return;
    fetchSouls(0, submittedQuery, selectedSeason, false);
  }, [submittedQuery, selectedSeason]);

  useEffect(() => {
    if (!bottomSentinelRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore)
          fetchSouls(page + 1, submittedQuery, selectedSeason, true);
      },
      { root: null, rootMargin: "100px", threshold: 0 }
    );
    observer.observe(bottomSentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, page, submittedQuery, selectedSeason]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("mode", viewMode);
    if (searchQuery) params.set("query", searchQuery);
    if (selectedSeason) params.set("season", selectedSeason);
    setSubmittedQuery(searchQuery);
    setPage(0);
    sessionStorage.removeItem('seasonDict_scrollY');
    sessionStorage.removeItem('seasonDict_souls');
    router.push(`/sky/SeasonDictionary?${params.toString()}`);
  };

  const handleSeasonClick = (seasonName) => {
    const params = new URLSearchParams();
    params.set("mode", viewMode);
    if (searchQuery) params.set("query", searchQuery);
    params.set("season", seasonName);
    setSelectedSeason(seasonName);
    setPage(0);
    fetchSeasonInfo(seasonName);
    sessionStorage.removeItem('seasonDict_scrollY');
    sessionStorage.removeItem('seasonDict_souls');
    router.push(`/sky/SeasonDictionary?${params.toString()}`);
  };

  const handleAllView = () => {
    setSelectedSeason("");
    setSearchQuery("");
    setSubmittedQuery("");
    setPage(0);
    setSeasonInfo(null);
    sessionStorage.removeItem('seasonDict_scrollY');
    sessionStorage.removeItem('seasonDict_souls');
    router.push(`/sky/SeasonDictionary?mode=${viewMode}`);
  };

  const handleViewModeChange = (mode) => {
    const params = new URLSearchParams();
    params.set("mode", mode);
    if (submittedQuery) params.set("query", submittedQuery);
    if (selectedSeason) params.set("season", selectedSeason);
    setViewMode(mode);
    sessionStorage.removeItem('seasonDict_scrollY');
    sessionStorage.removeItem('seasonDict_souls');
    router.push(`/sky/SeasonDictionary?${params.toString()}`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${y}.${m}.${d}`;
  };

  const seasonColor = selectedSeason ? (seasonColors[selectedSeason] || "#667eea") : undefined;

  return (
    <div className={styles.container}>

      {/* ── 정보 배너 ── */}
      <div className={styles.infoBanner}>
        <div className={styles.infoBannerInner}>
          <span className={styles.bannerItem}>
            아이콘 제공:&nbsp;
            <a
              href="https://sky-children-of-the-light.fandom.com/wiki/Sky:_Children_of_the_Light_Wiki"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.wikiLink}
            >
              📖 Sky Fandom Wiki
            </a>
          </span>
          <span className={styles.bannerDot}>·</span>
          <span className={styles.bannerItem}>
            노드표·위치표 제공:&nbsp;
            <a
              href="https://discord.com/invite/skyinfographicsdatabase"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.wikiLink}
            >
              🎮 Sky Infographics Database
            </a>
          </span>
          <span className={styles.bannerDot}>·</span>
          <span className={styles.bannerItem}>
            착용샷 제공: <strong>무륵, 엔, 망고, 도연, 햇비</strong>님
          </span>
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
          <p className={styles.subtitle}>
            찾고 있는 영혼이 기억나지 않을 때 검색창에 키워드를 입력해 검색해주세요.
          </p>

          {selectedSeason && (
            <div className={styles.seasonInfoStrip}>
              {seasonInfoLoading ? (
                <div className={styles.infoStripLoading}>정보 불러오는 중...</div>
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

      {/* ── 시즌 칩 ── */}
      <div className={styles.seasonChipsWrapper}>
        <p className={styles.seasonChipsTitle}>
          아래 시즌 이름을 클릭하면 자동 검색됩니다:
        </p>
        <div className={styles.seasonChips}>
          <button
            onClick={handleAllView}
            className={`${styles.seasonChip} ${!selectedSeason ? styles.active : ""}`}
            style={{ backgroundColor: "#667eea" }}
          >
            전체보기
          </button>
          {seasons.map((season) => (
            <button
              key={season}
              onClick={() => handleSeasonClick(season)}
              className={`${styles.seasonChip} ${selectedSeason === season ? styles.active : ""}`}
              style={{ backgroundColor: seasonColors[season] || "#888" }}
            >
              {season}
            </button>
          ))}
        </div>
      </div>

      {/* ── 검색 + 뷰 토글 ── */}
      <div className={styles.searchAndFilter}>
        <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="영혼 이름, 키워드 검색..."
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>검색</button>
        </form>

        <div className={styles.viewModeToggle}>
          <button
            onClick={() => handleViewModeChange("card")}
            className={`${styles.viewButton} ${viewMode === "card" ? styles.activeView : ""}`}
          >
            카드 뷰
          </button>
          <button
            onClick={() => handleViewModeChange("list")}
            className={`${styles.viewButton} ${viewMode === "list" ? styles.activeView : ""}`}
          >
            리스트 뷰
          </button>
        </div>
      </div>

      {/* ── 영혼 목록 ── */}
      {loading && page === 0 ? (
        <LoadingSpinner />
      ) : error ? (
        <div className={styles.error}>Error: {error}</div>
      ) : souls.length === 0 ? (
        <p className={styles.noData}>해당 조건에 맞는 영혼이 없습니다.</p>
      ) : viewMode === "card" ? (
        <>
          <div className={styles.cardsGrid}>
            {souls.map((soul, index) => {
              const representativeImage = soul.images?.find(img => img.imageType === "REPRESENTATIVE");
              const isLast = index === souls.length - 1;
              return (
                <Link
                  key={soul.id}
                  href={`/sky/SeasonDictionary/souls/${soul.id}`}
                  className={styles.soulCard}
                  ref={isLast ? bottomSentinelRef : null}
                >
                  <div className={styles.imageWrapper}>
                    {representativeImage?.url ? (
                      <img src={representativeImage.url} alt={soul.name} className={styles.cardImage} />
                    ) : (
                      <div className={styles.noImage}>이미지 없음</div>
                    )}
                  </div>
                  <div className={styles.cardContent}>
                    <span
                      className={styles.seasonBadge}
                      style={{ backgroundColor: seasonColors[soul.seasonName] || "#888" }}
                    >
                      {soul.seasonName}
                    </span>
                    <h3 className={styles.soulName}>{soul.name}</h3>
                    {soul.isSeasonGuide && (
                      <span className={styles.guideBadge}>시즌 가이드</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
          {loadingMore && (
            <div className={styles.loadingMoreSpinner}>
              <div className={styles.spinner} />
              <span>불러오는 중...</span>
            </div>
          )}
          {!loadingMore && hasMore && (
            <div ref={bottomSentinelRef} style={{ height: 1 }} />
          )}
        </>
      ) : (
        <>
          <div className={styles.spiritsList}>
            {souls.map((soul, index) => {
              const representativeImage = soul.images?.find(img => img.imageType === "REPRESENTATIVE");
              const isLast = index === souls.length - 1;
              return (
                <Link
                  key={soul.id}
                  href={`/sky/SeasonDictionary/souls/${soul.id}`}
                  className={styles.spiritCard}
                  ref={isLast ? bottomSentinelRef : null}
                >
                  <div className={styles.imageSection}>
                    {representativeImage?.url ? (
                      <img src={representativeImage.url} alt={soul.name} className={styles.spiritImage} />
                    ) : (
                      <div className={styles.noImage}>이미지 없음</div>
                    )}
                  </div>
                  <div className={styles.infoSection}>
                    <div className={styles.nameRow}>
                      <span
                        className={styles.seasonBadge}
                        style={{ backgroundColor: seasonColors[soul.seasonName] || "#888" }}
                      >
                        {soul.seasonName}
                      </span>
                      <h3 className={styles.spiritName}>{soul.name}</h3>
                      {soul.isSeasonGuide && (
                        <span className={styles.guideBadge}>시즌 가이드</span>
                      )}
                    </div>
                    {soul.keywords && soul.keywords.length > 0 && (
                      <div className={styles.keywords}>
                        {soul.keywords.slice(0, 3).map((kw, i) => (
                          <span key={i} className={styles.keyword}>{kw}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
          {loadingMore && (
            <div className={styles.loadingMoreSpinner}>
              <div className={styles.spinner} />
              <span>불러오는 중...</span>
            </div>
          )}
          {!loadingMore && hasMore && (
            <div ref={bottomSentinelRef} style={{ height: 1 }} />
          )}
        </>
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