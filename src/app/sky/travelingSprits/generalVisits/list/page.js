// src/app/sky/travelingSprits/generalVisits/list/page.js
"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NoticePanel from "../../../../components/NoticePanel";
import SearchBar from "../../../../components/SearchBar";
import ViewModeTabs from "../../../../components/ViewModeTabs";
import SoulCardGrid from "../../../../components/SoulCardGrid";
import SoulListView from "../../../../components/SoulListView";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import styles from "./list.module.css";

const STORE_KEY = "soulListState_v1";

function SoulListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ===== 상태 =====
  const [souls, setSouls] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [loading, setLoading] = useState(true);
  const [isFetchingNext, setIsFetchingNext] = useState(false);
  const [error, setError] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // ===== refs =====
  const bottomSentinelRef = useRef(null);
  const soulsLenRef = useRef(0);
  const didBootstrapRef = useRef(false);
  const minLoadedPageRef = useRef(null);
  const maxLoadedPageRef = useRef(null);
  const targetSoulIdRef = useRef(null);

  // ===== 유틸 함수들 =====
  const formatDate = (dateStr) => {
    const parts = dateStr.split("-");
    return isMobile && parts.length === 3
      ? `${parts[0].slice(-2)}.${parts[1]}.${parts[2]}`
      : dateStr;
  };

  const mergeUniqueById = (prev, next) => {
    const seen = new Set(prev.map((x) => x.id));
    const dedupedNext = [];
    for (const item of next) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        dedupedNext.push(item);
      }
    }
    return [...prev, ...dedupedNext];
  };

  const uniqueById = (arr) => {
    const seen = new Set();
    return arr.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  };

  const getHashSoulId = () => {
    if (typeof window === "undefined") return null;
    const h = window.location.hash || "";
    const m = h.match(/^#soul-(\d+)$/);
    return m ? m[1] : null;
  };

  const scrollToSoulId = (soulId) => {
    if (!soulId) return;
    let tries = 0;
    const seek = () => {
      const byId = document.getElementById(`soul-${soulId}`);
      const byAttr = document.querySelector(`[data-soul-id="${soulId}"]`);
      const el = byId || byAttr;
      if (el) {
        const rect = el.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        window.scrollTo({ top, behavior: "auto" });
      } else if (tries < 240) {
        tries += 1;
        requestAnimationFrame(seek);
      }
    };
    requestAnimationFrame(seek);
  };

  // ===== API 함수들 =====
  const annotate = (arr, pageNumber) =>
    (Array.isArray(arr) ? arr : []).map((it) => ({
      ...it,
      __page: pageNumber,
    }));

  const fetchPageContent = async (pageNumber) => {
    const url = `http://localhost:8080/api/v1/souls?page=${pageNumber}&size=20`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const pageData = json.data;
    
    const content = Array.isArray(pageData.content) ? pageData.content : [];
    const pages = pageData.totalPages || 1;
    const total = pageData.totalElements || 0;

    return { 
      content: annotate(content, pageNumber), 
      pages,
      total
    };
  };

  // 검색 API (페이징 지원)
  const fetchSearchResults = async (query, pageNumber = 0) => {
    const url = `http://korea-sky-planner.com/api/v1/souls/search?query=${encodeURIComponent(query)}&page=${pageNumber}&size=20`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const pageData = json.data;
    
    const content = Array.isArray(pageData.content) ? pageData.content : [];
    const pages = pageData.totalPages || 1;
    const total = pageData.totalElements || 0;

    return { 
      content: annotate(content, pageNumber), 
      pages,
      total
    };
  };

  // 범용 로더
  const fetchSoulsAny = async (pageNumber, query, { append = false } = {}) => {
    const trimmed = (query || "").trim();

    const isInitialAppend = append && soulsLenRef.current === 0;
    if (append) {
      if (isInitialAppend) setLoading(true);
      setIsFetchingNext(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      let result;
      
      if (trimmed !== "") {
        // 검색 모드
        result = await fetchSearchResults(trimmed, pageNumber);
      } else {
        // 전체 목록 모드
        result = await fetchPageContent(pageNumber);
      }

      const { content, pages, total } = result;
      
      setTotalPages(pages);
      setTotalElements(total);

      if (append) {
        setSouls((prev) => mergeUniqueById(prev, content));
        if (minLoadedPageRef.current == null)
          minLoadedPageRef.current = pageNumber;
        if (
          maxLoadedPageRef.current == null ||
          pageNumber > maxLoadedPageRef.current
        ) {
          maxLoadedPageRef.current = pageNumber;
        }
      } else {
        setSouls(uniqueById(content));
        minLoadedPageRef.current = pageNumber;
        maxLoadedPageRef.current = pageNumber;
      }
    } catch (err) {
      setError(err.message || "데이터를 불러오는 중 오류가 발생했습니다.");
      setSouls([]);
    } finally {
      if (append) {
        setIsFetchingNext(false);
        if (isInitialAppend) setLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  // ===== 이벤트 핸들러들 =====
  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const handleGoHome = () => {
    router.push("/sky/travelingSprits/oldestSprits");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("mode", viewMode);
    if (searchQuery) params.set("query", searchQuery);
    const targetUrl = `/sky/travelingSprits/generalVisits/list${
      params.toString() ? "?" + params.toString() : ""
    }`;

    setSouls([]);
    setSubmittedQuery(searchQuery);
    minLoadedPageRef.current = null;
    maxLoadedPageRef.current = null;
    targetSoulIdRef.current = null;

    if (typeof window !== "undefined" && window.location.hash) {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }

    const currentUrl = window.location.pathname + window.location.search;
    if (currentUrl === targetUrl) {
      setLoading(true);
      fetchSoulsAny(0, searchQuery, { append: false });
    } else {
      router.push(targetUrl);
    }
    requestAnimationFrame(() => window.scrollTo(0, 0));
  };

  const handleSeasonClick = (seasonName) => {
    const params = new URLSearchParams();
    params.set("mode", viewMode);
    params.set("query", seasonName);
    const targetUrl = `/sky/travelingSprits/generalVisits/list?${params.toString()}`;

    setSouls([]);
    setSearchQuery(seasonName);
    setSubmittedQuery(seasonName);
    minLoadedPageRef.current = null;
    maxLoadedPageRef.current = null;
    targetSoulIdRef.current = null;

    if (typeof window !== "undefined" && window.location.hash) {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }

    const currentUrl = window.location.pathname + window.location.search;
    if (currentUrl === targetUrl) {
      setLoading(true);
      fetchSoulsAny(0, seasonName, { append: false });
    } else {
      router.push(targetUrl);
    }
    requestAnimationFrame(() => window.scrollTo(0, 0));
  };

  const handleAllView = () => {
    setSouls([]);
    setSearchQuery("");
    setSubmittedQuery("");
    minLoadedPageRef.current = null;
    maxLoadedPageRef.current = null;
    targetSoulIdRef.current = null;

    if (typeof window !== "undefined" && window.location.hash) {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }

    const params = new URLSearchParams();
    params.set("mode", viewMode);
    const targetUrl = `/sky/travelingSprits/generalVisits/list?${params.toString()}`;

    const currentUrl = window.location.pathname + window.location.search;
    if (currentUrl === targetUrl) {
      setLoading(true);
      fetchSoulsAny(0, "", { append: false });
    } else {
      router.push(targetUrl);
    }
    requestAnimationFrame(() => window.scrollTo(0, 0));
  };

  const handleViewModeChange = (mode) => {
    const params = new URLSearchParams();
    params.set("mode", mode);
    if (submittedQuery) params.set("query", submittedQuery);
    const targetUrl = `/sky/travelingSprits/generalVisits/list?${params.toString()}`;

    setSouls([]);
    setViewMode(mode);
    minLoadedPageRef.current = null;
    maxLoadedPageRef.current = null;
    targetSoulIdRef.current = null;

    if (typeof window !== "undefined" && window.location.hash) {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }

    const currentUrl = window.location.pathname + window.location.search;
    if (currentUrl === targetUrl) {
      setLoading(true);
      fetchSoulsAny(0, submittedQuery, { append: false });
    } else {
      router.push(targetUrl);
    }
    requestAnimationFrame(() => window.scrollTo(0, 0));
  };

  const saveOnClick = (clickedSoul) => {
    try {
      sessionStorage.setItem(
        STORE_KEY,
        JSON.stringify({
          viewMode,
          query: submittedQuery,
          clickedSoulId: clickedSoul?.id ?? null,
          clickedPage:
            typeof clickedSoul?.__page === "number" ? clickedSoul.__page : null,
          scrollY: window.scrollY,
          ts: Date.now(),
        })
      );
    } catch {}
    const params = new URLSearchParams();
    params.set("mode", viewMode);
    if (submittedQuery) params.set("query", submittedQuery);
    const listUrl = `/sky/travelingSprits/generalVisits/list${
      params.toString() ? "?" + params.toString() : ""
    }#soul-${clickedSoul?.id}`;
    window.history.replaceState(null, "", listUrl);
  };

  // ===== useEffect들 =====
  
  // 반응형 설정
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // 클라이언트 플래그
  useEffect(() => {
    setIsClient(true);
  }, []);

  // URL → state
  useEffect(() => {
    const initialMode = searchParams.get("mode") || "list";
    const initialQuery = searchParams.get("query") || "";
    setViewMode(initialMode);
    setSearchQuery(initialQuery);
    setSubmittedQuery(initialQuery);
  }, [searchParams]);

  // 길이 ref
  useEffect(() => {
    soulsLenRef.current = souls.length;
  }, [souls]);

  // 스크롤 복원 끔
  useEffect(() => {
    if (typeof window === "undefined") return;
    const prev = window.history.scrollRestoration;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    return () => {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = prev || "auto";
      }
    };
  }, []);

  // 초기 로드
  useEffect(() => {
    if (!isClient) return;
    
    setSouls([]);
    minLoadedPageRef.current = null;
    maxLoadedPageRef.current = null;
    fetchSoulsAny(0, submittedQuery, { append: false });
  }, [submittedQuery, viewMode, isClient]);

  // 해시 변경 이벤트
  useEffect(() => {
    if (!isClient) return;
    const onHash = () => {
      const id = getHashSoulId();
      if (id) {
        scrollToSoulId(id);
        setTimeout(() => scrollToSoulId(id), 50);
        setTimeout(() => scrollToSoulId(id), 250);
      }
    };
    window.addEventListener("hashchange", onHash);
    onHash();
    return () => window.removeEventListener("hashchange", onHash);
  }, [isClient]);

  // ===== 무한 스크롤 (검색 결과 포함) =====
  useEffect(() => {
    if (!isClient) return;
    if (!bottomSentinelRef.current) return;

    const hasMore =
      maxLoadedPageRef.current != null &&
      maxLoadedPageRef.current + 1 < totalPages &&
      !error;

    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        
        if (
          first.isIntersecting &&
          !loading &&
          !isFetchingNext &&
          maxLoadedPageRef.current != null &&
          maxLoadedPageRef.current + 1 < totalPages
        ) {
          const nextPage = maxLoadedPageRef.current + 1;
          setIsFetchingNext(true);
          
          (async () => {
            try {
              let result;
              if (submittedQuery.trim() !== "") {
                result = await fetchSearchResults(submittedQuery, nextPage);
              } else {
                result = await fetchPageContent(nextPage);
              }
              
              const { content } = result;
              setSouls((prev) => mergeUniqueById(prev, content));
              
              if (
                maxLoadedPageRef.current == null ||
                nextPage > maxLoadedPageRef.current
              ) {
                maxLoadedPageRef.current = nextPage;
              }
              if (minLoadedPageRef.current == null) {
                minLoadedPageRef.current = nextPage;
              }
            } catch (err) {
              console.error('페이지 로드 실패:', err);
              setError(err.message || "다음 페이지 로드 실패");
            } finally {
              setIsFetchingNext(false);
            }
          })();
        }
      },
      { root: null, rootMargin: "100px", threshold: 0 }
    );

    observer.observe(bottomSentinelRef.current);
    return () => observer.disconnect();
  }, [
    isClient,
    loading,
    isFetchingNext,
    submittedQuery,
    totalPages,
    error,
    viewMode
  ]);

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
      ) : souls.length === 0 ? (
        <p>검색 결과가 없습니다.</p>
      ) : viewMode === "card" ? (
        <>
          <SoulCardGrid
            souls={souls}
            viewMode={viewMode}
            submittedQuery={submittedQuery}
            isMobile={isMobile}
            formatDate={formatDate}
            onCardClick={saveOnClick}
          />
          
          {maxLoadedPageRef.current != null &&
            maxLoadedPageRef.current + 1 < totalPages && (
              <>
                {isFetchingNext && <LoadingSpinner />}
                <div ref={bottomSentinelRef} style={{ height: 1 }} />
              </>
            )}
        </>
      ) : (
        <>
          <SoulListView
            souls={souls}
            viewMode={viewMode}
            submittedQuery={submittedQuery}
            onCardClick={saveOnClick}
            lastSoulElementRef={bottomSentinelRef}
            isFetchingNext={isFetchingNext}
            hasMore={maxLoadedPageRef.current != null && maxLoadedPageRef.current + 1 < totalPages && !error}
          />
          
          {isFetchingNext && (
            <div style={{ textAlign: "center", padding: "1rem" }}>
              <LoadingSpinner message="더 많은 영혼들을 불러오는 중..." />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SoulListPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SoulListContent />
    </Suspense>
  );
}