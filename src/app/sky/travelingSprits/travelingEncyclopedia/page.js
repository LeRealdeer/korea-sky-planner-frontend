// src/app/sky/travelingSprits/travelingEncyclopedia/page.js
"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  Suspense,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NoticePanel from "../../../components/NoticePanel";
import SearchBar from "../../../components/SearchBar";
import ViewModeTabs from "../../../components/ViewModeTabs";
import LoadingSpinner from "../../../components/LoadingSpinner";
import Link from "next/link";
import styles from "./page.module.css";

const BASE_URL = "http://localhost:8080";

function TravelingEncyclopediaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [visits, setVisits] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const bottomSentinelRef = useRef(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const initialMode = searchParams.get("mode") || "list";
    const initialQuery = searchParams.get("query") || "";
    setViewMode(initialMode);
    setSearchQuery(initialQuery);
    setSubmittedQuery(initialQuery);
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
    params.set("mode", viewMode);
    if (searchQuery) params.set("query", searchQuery);

    setSubmittedQuery(searchQuery);
    setPage(0);
    router.push(
      `/sky/travelingSprits/travelingEncyclopedia?${params.toString()}`
    );
  };

  const handleSeasonClick = (seasonName) => {
    const params = new URLSearchParams();
    params.set("mode", viewMode);
    params.set("query", seasonName);

    setSearchQuery(seasonName);
    setSubmittedQuery(seasonName);
    setPage(0);
    router.push(
      `/sky/travelingSprits/travelingEncyclopedia?${params.toString()}`
    );
  };

  const handleAllView = () => {
    setSearchQuery("");
    setSubmittedQuery("");
    setPage(0);
    router.push(`/sky/travelingSprits/travelingEncyclopedia?mode=${viewMode}`);
  };

  const handleGoHome = () => {
    router.push("/sky/travelingSprits/oldestSprits");
  };

  const handleViewModeChange = (mode) => {
    const params = new URLSearchParams();
    params.set("mode", mode);
    if (submittedQuery) params.set("query", submittedQuery);

    setViewMode(mode);
    router.push(
      `/sky/travelingSprits/travelingEncyclopedia?${params.toString()}`
    );
  };

  const formatDate = (dateStr) => {
    const parts = dateStr.split("-");
    return isMobile && parts.length === 3
      ? `${parts[0].slice(-2)}.${parts[1]}.${parts[2]}`
      : dateStr;
  };

  const seasonColors = {
    감사: "#FFD700",
    빛추: "#FF6347",
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
    사슴: "#A1887F",
    보금자리: "#795548",
    듀엣: "#FFEB3B",
    무민: "#CDDC39",
    광채: "#FF1493",
    파랑새: "#1E90FF",
    불씨: "#FF4500",
  };

  return (
    <div className={styles.container}>
      <NoticePanel
        onSeasonClick={handleSeasonClick}
        onAllView={handleAllView}
        onGoHome={handleGoHome}
      />

      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
      />

      <ViewModeTabs
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className={styles.error}>Error: {error}</div>
      ) : visits.length === 0 ? (
        <p>해당 조건에 맞는 유랑이 없습니다.</p>
      ) : viewMode === "card" ? (
        <>
          <div className={styles.cardsGrid}>
            {visits.map((item, index) => {
              const {
                id,
                name,
                seasonName,
                orderNum,
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
              const isLast = index === visits.length - 1;

              return (
                <Link
                  key={`${item.id}-${index}`}
                  href={`/sky/SeasonDictionary/souls/${item.id}`}
                  className={styles.spiritCard}
                  ref={isLast ? bottomSentinelRef : null}
                >
                  <div className={styles.imageWrapperSquare}>
                    {representativeImage?.url ? (
                      <img
                        src={representativeImage.url}
                        alt={name}
                        className={styles.cardImage}
                      />
                    ) : (
                      <div className={styles.noImage}>No Image</div>
                    )}
                    {/* 좌측 상단 순서 배지 */}
                    <div className={styles.orderBadge}>
                      #{orderNum < 0 ? Math.abs(orderNum) : orderNum}
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <p className={styles.firstLine}>
                      <span
                        className={styles.seasonName}
                        style={{
                          backgroundColor: seasonColors[seasonName] || "#444",
                        }}
                      >
                        {seasonName}
                      </span>
                      <span className={styles.soulName}>{name}</span>
                    </p>
                    <p className={styles.secondLine}>
                      {orderNum < 0 ? (
                        <strong style={{ color: "#FF8C00" }}>
                          {isMobile
                            ? `#${Math.abs(orderNum)}`
                            : `${Math.abs(orderNum)}번째 유랑단`}
                        </strong>
                      ) : (
                        `${orderNum}번째`
                      )}{" "}
                      |{" "}
                      <strong style={{ color: "#dc2626" }}>
                        {visitNumber}차 복각
                      </strong>
                    </p>
                    <p className={styles.thirdLine}>
                      {formatDate(startDate)} ~ {formatDate(endDate)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {submittedQuery.trim() === "" && hasMore && (
            <>
              {loadingMore && <LoadingSpinner />}
              <div ref={bottomSentinelRef} style={{ height: 1 }} />
            </>
          )}
        </>
      ) : (
        <>
          <div className={styles.spiritsList}>
            {visits.map((item, index) => {
              const {
                id,
                name,
                seasonName,
                orderNum,
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
              const isLast = index === visits.length - 1;

              return (
                <Link
                  key={`${item.id}-${index}`}
                  href={`/sky/SeasonDictionary/souls/${item.id}`}
                  className={styles.spiritCard}
                  ref={isLast ? bottomSentinelRef : null}
                >
                  <div className={styles.rankBadge}>
                    #{orderNum < 0 ? Math.abs(orderNum) : orderNum}
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
                        {orderNum < 0 ? (
                          <span
                            style={{ color: "#FF8C00", fontWeight: "bold" }}
                          >
                            {Math.abs(orderNum)}번째 유랑단
                          </span>
                        ) : (
                          `${orderNum}번째`
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
