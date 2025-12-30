// src/app/sky/travelingSprits/travelingEncyclopedia/page.js
"use client";

import React, {
  useEffect,
  useState,
  useRef,
  Suspense,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NoticePanel from "../../../components/NoticePanel";
import SearchBar from "../../../components/SearchBar";
import LoadingSpinner from "../../../components/LoadingSpinner";
import Link from "next/link";
import styles from "./page.module.css";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function TravelingEncyclopediaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [visits, setVisits] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showWarbandOnly, setShowWarbandOnly] = useState(false);

  const bottomSentinelRef = useRef(null);
  const isRestoringScroll = useRef(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ✅ 페이지 떠나기 전 상태 저장
  useEffect(() => {
    const saveState = () => {
      sessionStorage.setItem('travelingEncy_scrollY', window.scrollY.toString());
      sessionStorage.setItem('travelingEncy_query', submittedQuery);
      sessionStorage.setItem('travelingEncy_warband', showWarbandOnly.toString());
      sessionStorage.setItem('travelingEncy_page', page.toString());
      sessionStorage.setItem('travelingEncy_visits', JSON.stringify(visits));
    };

    const links = document.querySelectorAll('a[href*="/souls/"]');
    links.forEach(link => {
      link.addEventListener('click', saveState);
    });

    return () => {
      links.forEach(link => {
        link.removeEventListener('click', saveState);
      });
    };
  }, [submittedQuery, showWarbandOnly, page, visits]);

  // ✅ URL + sessionStorage 복원
  useEffect(() => {
    const urlQuery = searchParams.get("query");
    const urlWarband = searchParams.get("warband");
    
    const savedScrollY = sessionStorage.getItem('travelingEncy_scrollY');
    const savedQuery = sessionStorage.getItem('travelingEncy_query');
    const savedWarband = sessionStorage.getItem('travelingEncy_warband');
    const savedPage = sessionStorage.getItem('travelingEncy_page');
    const savedVisits = sessionStorage.getItem('travelingEncy_visits');
    
    const isBackNavigation = savedScrollY !== null;

    if (isBackNavigation) {
      console.log('Restoring traveling encyclopedia state');
      
      // 상태 복원
      const restoredQuery = savedQuery || urlQuery || "";
      const restoredWarband = savedWarband === "true" || urlWarband === "true";
      
      setSearchQuery(restoredQuery);
      setSubmittedQuery(restoredQuery);
      setShowWarbandOnly(restoredWarband);
      setPage(parseInt(savedPage || "0"));
      
      // 데이터 복원
      if (savedVisits) {
        try {
          setVisits(JSON.parse(savedVisits));
          setLoading(false);
        } catch (e) {
          console.error('Failed to restore visits:', e);
        }
      }
      
      // 스크롤 복원
      isRestoringScroll.current = true;
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollY));
        isRestoringScroll.current = false;
        
        // 복원 후 세션 스토리지 클리어
        sessionStorage.removeItem('travelingEncy_scrollY');
        sessionStorage.removeItem('travelingEncy_visits');
      }, 100);
    } else {
      // 새로 진입
      setSearchQuery(urlQuery || "");
      setSubmittedQuery(urlQuery || "");
      setShowWarbandOnly(urlWarband === "true");
    }
  }, [searchParams]);

  const fetchVisits = async (pageNum = 0, query = "", isAppend = false) => {
    if (isAppend) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      let url = "";
      if (query.trim() !== "") {
        url = `${BASE_URL}/api/v1/souls/search?query=${encodeURIComponent(
          query
        )}`;
      } else {
        url = `${BASE_URL}/api/v1/souls/traveling-visits?page=${pageNum}&size=20`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (query.trim() !== "") {
        setVisits(data.data || []);
        setHasMore(false);
        setTotalElements(data.data?.length || 0);
      } else {
        const pageData = data.data;
        if (isAppend) {
          setVisits((prev) => [...prev, ...(pageData.content || [])]);
        } else {
          setVisits(pageData.content || []);
        }
        setHasMore(!pageData.last);
        setTotalElements(pageData.totalElements || 0);
        setPage(pageNum);
      }
    } catch (err) {
      setError(err.message);
      setVisits([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    // 뒤로가기로 복원된 경우 fetch 생략
    if (isRestoringScroll.current) return;
    
    fetchVisits(0, submittedQuery, false);
  }, [submittedQuery]);

  useEffect(() => {
    if (!bottomSentinelRef.current || !hasMore || submittedQuery.trim() !== "")
      return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore) {
          fetchVisits(page + 1, submittedQuery, true);
        }
      },
      { root: null, rootMargin: "100px", threshold: 0 }
    );

    observer.observe(bottomSentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, page, submittedQuery]);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("query", searchQuery);
    if (showWarbandOnly) params.set("warband", "true");

    setSubmittedQuery(searchQuery);
    setPage(0);
    
    // 세션 스토리지 클리어 (새 검색)
    sessionStorage.removeItem('travelingEncy_scrollY');
    sessionStorage.removeItem('travelingEncy_visits');
    
    router.push(
      `/sky/travelingSprits/travelingEncyclopedia?${params.toString()}`
    );
  };

  const handleSeasonClick = (seasonName) => {
    const params = new URLSearchParams();
    params.set("query", seasonName);
    if (showWarbandOnly) params.set("warband", "true");

    setSearchQuery(seasonName);
    setSubmittedQuery(seasonName);
    setPage(0);
    
    sessionStorage.removeItem('travelingEncy_scrollY');
    sessionStorage.removeItem('travelingEncy_visits');
    
    router.push(
      `/sky/travelingSprits/travelingEncyclopedia?${params.toString()}`
    );
  };

  const handleAllView = () => {
    setSearchQuery("");
    setSubmittedQuery("");
    setShowWarbandOnly(false);
    setPage(0);
    
    sessionStorage.removeItem('travelingEncy_scrollY');
    sessionStorage.removeItem('travelingEncy_visits');
    
    router.push(`/sky/travelingSprits/travelingEncyclopedia`);
  };

  const handleGoHome = () => {
    router.push("/sky/travelingSprits/oldestSprits");
  };

  const handleWarbandClick = () => {
    setShowWarbandOnly(true);
    setSearchQuery("");
    setSubmittedQuery("");
    setPage(0);
    
    sessionStorage.removeItem('travelingEncy_scrollY');
    sessionStorage.removeItem('travelingEncy_visits');
    
    router.push(`/sky/travelingSprits/travelingEncyclopedia?warband=true`);
  };

  const formatDate = (dateStr) => {
    const parts = dateStr.split("-");
    return isMobile && parts.length === 3
      ? `${parts[0].slice(-2)}.${parts[1]}.${parts[2]}`
      : dateStr;
  };

  const seasonColors = {
    감사: "#FFD700",
    "빛 추적자": "#FF6347",
    친밀: "#4CAF50",
    리듬: "#3F51B5",
    마법: "#9C27B0",
    낙원: "#FF5722",
    예언: "#9E9E9E",
    꿈: "#00BCD4",
    협력: "#8BC34A",
    어린왕자: "#FFC107",
    비행: "#03A9F4",
    심해: "#2196F3",
    공연: "#FF4081",
    파편: "#607D8B",
    오로라: "#673AB7",
    기억: "#009688",
    성장: "#8BC34A",
    순간: "#FF9800",
    재생: "#3F51B5",
    구색록: "#A1887F",
    보금자리: "#795548",
    듀엣: "#FFEB3B",
    무민: "#CDDC39",
    광채: "#FF1493",
    파랑새: "#1E90FF",
    불씨: "#FF4500",
  };

  const filteredVisits = showWarbandOnly 
    ? visits.filter(item => item.globalOrder < 0)
    : visits;

  return (
    <div className={styles.container}>
      <NoticePanel
        onSeasonClick={handleSeasonClick}
        onAllView={handleAllView}
        onGoHome={handleGoHome}
        onWarbandClick={handleWarbandClick}
      />

      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
      />

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className={styles.error}>Error: {error}</div>
      ) : filteredVisits.length === 0 ? (
        <p>해당 조건에 맞는 유랑이 없습니다.</p>
      ) : (
        <>
          <div className={styles.spiritsList}>
            {filteredVisits.map((item, index) => {
              const {
                id,
                name,
                seasonName,
                orderNum,
                globalOrder,
                startDate,
                endDate,
                visitNumber,
                isWarbandVisit,
                isActive,
                images,
              } = item;

              const representativeImage = images?.find(
                (img) => img.imageType === "REPRESENTATIVE"
              );
              const isLast = index === filteredVisits.length - 1;
              const isWarband = globalOrder < 0;

              return (
                <Link
                  key={`${item.id}-${index}`}
                  href={`/sky/SeasonDictionary/souls/${item.id}`}
                  className={styles.spiritCard}
                  ref={isLast ? bottomSentinelRef : null}
                >
                  <div className={`${styles.rankBadge} ${isWarband ? styles.warbandRankBadge : ''}`}>
                    #{Math.abs(globalOrder)}
                  </div>

                  <div className={styles.imageSection}>
                    {representativeImage?.url ? (
                      <img
                        src={representativeImage.url}
                        alt={name}
                        className={styles.spiritImage}
                      />
                    ) : (
                      <div className={styles.noImage}>이미지 없음</div>
                    )}
                  </div>

                  <div className={styles.infoSection}>
                    <div className={styles.nameRow}>
                      <span
                        className={styles.seasonBadge}
                        style={{
                          backgroundColor: seasonColors[seasonName] || "#888",
                        }}
                      >
                        {seasonName}
                      </span>
                      <h3 className={styles.spiritName}>{name}</h3>
                    </div>

                    <div className={styles.detailsRow}>
                      <span className={styles.orderNumber}>
                        {isWarband ? (
                          <span style={{ color: "#FF8C00", fontWeight: "bold" }}>
                            {Math.abs(globalOrder)}번째 유랑단
                          </span>
                        ) : (
                          <span style={{ color: "#667eea", fontWeight: "bold" }}>
                            {globalOrder}번째 유랑
                          </span>
                        )}
                      </span>
                      <span className={styles.rerunCount}>
                        {visitNumber}차 복각
                      </span>
                    </div>

                    <div className={styles.dateInfo}>
                      <span>
                        기간: {formatDate(startDate)} ~ {formatDate(endDate)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {loadingMore && (
            <LoadingSpinner message="더 많은 유랑을 불러오는 중..." />
          )}
        </>
      )}
    </div>
  );
}

export default function TravelingEncyclopediaPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <TravelingEncyclopediaContent />
    </Suspense>
  );
}