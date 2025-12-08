// src/app/sky/Images/page.js
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "../../../components/LoadingSpinner";
import styles from "./page.module.css";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://korea-sky-planner-backend-production.up.railway.app';

export default function ImagesPage() {
  const router = useRouter();

  const [images, setImages] = useState([]);
  const [filterSoulId, setFilterSoulId] = useState("");
  const [filterImageType, setFilterImageType] = useState("");
  const [souls, setSouls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const bottomSentinelRef = useRef(null);

  const imageTypes = [
    { value: "", label: "전체" },
    { value: "REPRESENTATIVE", label: "대표 이미지" },
    { value: "LOCATION", label: "위치 이미지" },
    { value: "WEARING", label: "착용샷" },
    { value: "NODE_CHART", label: "노드표" },
  ];

  useEffect(() => {
    fetchSouls();
  }, []);

  useEffect(() => {
    fetchImages(0, false);
  }, [filterSoulId, filterImageType]);

  const fetchSouls = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/souls/all`);
      if (response.ok) {
        const data = await response.json();
        setSouls(data.data || []);
      }
    } catch (err) {
      console.error("영혼 목록 조회 실패:", err);
    }
  };

  const fetchImages = async (pageNum = 0, isAppend = false) => {
    setLoading(!isAppend);
    setError(null);

    try {
      let url = `${BASE_URL}/api/v1/images?page=${pageNum}&size=20`;
      
      if (filterSoulId) {
        url += `&soulId=${filterSoulId}`;
      }
      if (filterImageType) {
        url += `&imageType=${filterImageType}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      const pageData = data.data;

      if (isAppend) {
        setImages(prev => [...prev, ...(pageData.content || [])]);
      } else {
        setImages(pageData.content || []);
      }
      
      setHasMore(!pageData.last);
      setPage(pageNum);
    } catch (err) {
      setError(err.message);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!bottomSentinelRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          fetchImages(page + 1, true);
        }
      },
      { root: null, rootMargin: "100px", threshold: 0 }
    );

    observer.observe(bottomSentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, page]);

  const handleDelete = async (imageId, imageUrl) => {
    if (!confirm("정말로 이 이미지를 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`${BASE_URL}/api/v1/images/${imageId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("이미지 삭제에 실패했습니다.");

      alert("이미지가 삭제되었습니다.");
      fetchImages(0, false);
    } catch (err) {
      alert(`삭제 실패: ${err.message}`);
    }
  };

  const getImageTypeLabel = (type) => {
    const found = imageTypes.find(t => t.value === type);
    return found ? found.label : type;
  };

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>이미지 관리</h1>
          <p className={styles.subtitle}>
            모든 이미지를 한 곳에서 관리합니다
          </p>
          <Link href="/sky/SeasonDictionary/Images/upload" className={styles.uploadButton}>
            📤 이미지 업로드
          </Link>
        </div>
      </div>

      {/* 필터 */}
      <div className={styles.filterSection}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>영혼 필터:</label>
          <select
            value={filterSoulId}
            onChange={(e) => setFilterSoulId(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">전체</option>
            {souls.map(soul => (
              <option key={soul.id} value={soul.id}>
                [{soul.seasonName}] {soul.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>타입 필터:</label>
          <select
            value={filterImageType}
            onChange={(e) => setFilterImageType(e.target.value)}
            className={styles.filterSelect}
          >
            {imageTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 이미지 그리드 */}
      {loading && page === 0 ? (
        <LoadingSpinner />
      ) : error ? (
        <div className={styles.error}>Error: {error}</div>
      ) : images.length === 0 ? (
        <p className={styles.noData}>이미지가 없습니다.</p>
      ) : (
        <div className={styles.imagesGrid}>
          {images.map((image, index) => {
            const isLast = index === images.length - 1;
            const soulName = souls.find(s => s.id === image.soulId)?.name || "연결 안됨";

            return (
              <div
                key={image.id}
                className={styles.imageCard}
                ref={isLast ? bottomSentinelRef : null}
              >
                <div className={styles.imageWrapper}>
                  <img 
                    src={image.url} 
                    alt={image.fileName}
                    className={styles.image}
                  />
                  <div className={styles.imageOverlay}>
                    <button
                      onClick={() => handleDelete(image.id, image.url)}
                      className={styles.deleteButton}
                    >
                      🗑️ 삭제
                    </button>
                  </div>
                </div>

                <div className={styles.imageInfo}>
                  <div className={styles.imageType}>
                    {getImageTypeLabel(image.imageType)}
                  </div>
                  <div className={styles.soulName}>{soulName}</div>
                  <div className={styles.fileName}>{image.fileName}</div>
                  <div className={styles.fileSize}>
                    {(image.fileSize / 1024).toFixed(2)} KB
                  </div>
                  <div className={styles.uploadDate}>
                    {new Date(image.uploadedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasMore && <div ref={bottomSentinelRef} style={{ height: 1 }} />}
    </div>
  );
}