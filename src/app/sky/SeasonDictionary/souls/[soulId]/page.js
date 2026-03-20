"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import { seasonColors } from "../../../../constants/seasonColors";
import styles from "./page.module.css";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SoulDetailPage() {
  const params = useParams();
  const router = useRouter();
  const soulId = params.soulId;

  const [soul, setSoul] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentWearingIndex, setCurrentWearingIndex] = useState(0);

  // 키워드 편집 상태
  const [isEditingKeywords, setIsEditingKeywords] = useState(false);
  const [editKeywords, setEditKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [savingKeywords, setSavingKeywords] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (soulId) fetchSoulDetail();
  }, [soulId]);

  // 편집 모드 진입 시 input 포커스
  useEffect(() => {
    if (isEditingKeywords && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditingKeywords]);

  const fetchSoulDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/api/v1/souls/${soulId}`);
      if (!response.ok) throw new Error("영혼 정보를 불러올 수 없습니다.");
      const data = await response.json();
      setSoul(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getImagesByType = (type) => soul?.images?.filter(img => img.imageType === type) || [];
  const getImageByType = (type) => soul?.images?.find(img => img.imageType === type);

  // ── 키워드 편집 핸들러 ──

  const handleEditStart = () => {
    setEditKeywords([...(soul.keywords || [])]);
    setNewKeyword("");
    setIsEditingKeywords(true);
  };

  const handleEditCancel = () => {
    setIsEditingKeywords(false);
    setNewKeyword("");
  };

  const handleKeywordDelete = (index) => {
    setEditKeywords(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeywordAdd = () => {
    const trimmed = newKeyword.trim();
    if (!trimmed) return;
    if (editKeywords.includes(trimmed)) {
      setNewKeyword("");
      return;
    }
    setEditKeywords(prev => [...prev, trimmed]);
    setNewKeyword("");
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleKeywordAdd();
    }
    if (e.key === "Escape") {
      handleEditCancel();
    }
  };

  const handleSaveKeywords = async () => {
    setSavingKeywords(true);
    try {
      const response = await fetch(`${BASE_URL}/api/v1/souls/${soulId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: soul.name,
          seasonId: soul.seasonId,
          seasonName: soul.seasonName,
          orderNum: soul.orderNum,
          startDate: soul.startDate,
          endDate: soul.endDate,
          keywords: editKeywords,
          creator: soul.creator,
          description: soul.description,
          isSeasonGuide: soul.isSeasonGuide,
        }),
      });
      if (!response.ok) throw new Error("저장에 실패했습니다.");
      // 로컬 상태 업데이트 (재fetch 없이)
      setSoul(prev => ({ ...prev, keywords: editKeywords }));
      setIsEditingKeywords(false);
    } catch (err) {
      alert(`저장 실패: ${err.message}`);
    } finally {
      setSavingKeywords(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!soul) return <div className={styles.noData}>영혼 정보가 없습니다.</div>;

  const representativeImage = getImageByType("REPRESENTATIVE");
  const locationImage = getImageByType("LOCATION");
  const wearingImages = getImagesByType("WEARING");
  const nodeChartImage = getImageByType("NODE_CHART");

  const handlePrevWearing = () => {
    setCurrentWearingIndex(prev => prev === 0 ? wearingImages.length - 1 : prev - 1);
  };
  const handleNextWearing = () => {
    setCurrentWearingIndex(prev => prev === wearingImages.length - 1 ? 0 : prev + 1);
  };

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <button onClick={() => router.back()} className={styles.backButton}>
          ← 뒤로가기
        </button>
      </div>

      {/* 메인 콘텐츠 */}
      <div className={styles.mainContent}>
        {/* 대표 이미지 및 기본 정보 */}
        <div className={styles.mainSection}>
          <div className={styles.imageWrapper}>
            {representativeImage?.url ? (
              <img src={representativeImage.url} alt={soul.name} className={styles.mainImage} />
            ) : (
              <div className={styles.noImage}>이미지 없음</div>
            )}
          </div>

          <div className={styles.infoBox}>
            <div className={styles.badges}>
              <span
                className={styles.seasonBadge}
                style={{ backgroundColor: seasonColors[soul.seasonName] || "#888" }}
              >
                {soul.seasonName}
              </span>
              {soul.isSeasonGuide && (
                <span className={styles.guideBadge}>시즌 가이드</span>
              )}
            </div>

            <h1 className={styles.soulName}>{soul.name}</h1>

            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>복각 횟수</span>
                <span className={styles.infoValue}>{soul.totalVisits || 0}회</span>
              </div>
            </div>

            {/* ── 키워드 영역 ── */}
            <div className={styles.keywordsSection}>
              <div className={styles.keywordsHeader}>
                <span className={styles.keywordsTitle}>키워드</span>
                {!isEditingKeywords ? (
                  <button
                    className={styles.editBtn}
                    onClick={handleEditStart}
                    title="키워드 편집"
                  >
                    ✏️ 편집
                  </button>
                ) : (
                  <div className={styles.editActions}>
                    <button
                      className={styles.saveBtn}
                      onClick={handleSaveKeywords}
                      disabled={savingKeywords}
                    >
                      {savingKeywords ? "저장 중..." : "저장"}
                    </button>
                    <button
                      className={styles.cancelBtn}
                      onClick={handleEditCancel}
                      disabled={savingKeywords}
                    >
                      취소
                    </button>
                  </div>
                )}
              </div>

              {/* 보기 모드 */}
              {!isEditingKeywords && (
                <div className={styles.keywordsBox}>
                  {soul.keywords && soul.keywords.length > 0 ? (
                    soul.keywords.map((keyword, index) => (
                      <span key={index} className={styles.keyword}>{keyword}</span>
                    ))
                  ) : (
                    <span className={styles.noKeywords}>키워드 없음 — 편집 버튼으로 추가해보세요</span>
                  )}
                </div>
              )}

              {/* 편집 모드 */}
              {isEditingKeywords && (
                <div className={styles.keywordsEditBox}>
                  {/* 기존 키워드 (X 버튼으로 삭제) */}
                  <div className={styles.editKeywordsList}>
                    {editKeywords.length > 0 ? (
                      editKeywords.map((kw, i) => (
                        <span key={i} className={styles.editKeywordTag}>
                          {kw}
                          <button
                            className={styles.keywordDeleteBtn}
                            onClick={() => handleKeywordDelete(i)}
                            aria-label={`${kw} 삭제`}
                          >
                            ×
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className={styles.noKeywords}>키워드를 추가해보세요</span>
                    )}
                  </div>

                  {/* 새 키워드 입력 */}
                  <div className={styles.keywordInputRow}>
                    <input
                      ref={inputRef}
                      type="text"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyDown={handleInputKeyDown}
                      placeholder="키워드 입력 후 Enter"
                      className={styles.keywordInput}
                      maxLength={20}
                    />
                    <button
                      className={styles.keywordAddBtn}
                      onClick={handleKeywordAdd}
                      disabled={!newKeyword.trim()}
                    >
                      추가
                    </button>
                  </div>
                  <p className={styles.editHint}>Enter로 추가 · Esc로 취소</p>
                </div>
              )}
            </div>

            {/* 유랑 이력 */}
            {soul.travelingVisits && soul.travelingVisits.length > 0 && (
              <div className={styles.visitsBox}>
                <h3 className={styles.boxTitle}>유랑 이력</h3>
                <div className={styles.visitsList}>
                  {soul.travelingVisits.map((visit, index) => {
                    const isWarband = visit.isWarbandVisit || (visit.globalOrder && visit.globalOrder < 0);
                    const displayOrder = visit.globalOrder ? Math.abs(visit.globalOrder) : null;
                    return (
                      <div key={index} className={styles.visitItem}>
                        <div className={styles.visitInfo}>
                          <div className={styles.visitHeader}>
                            <span className={styles.visitNumber}>{visit.visitNumber}차</span>
                            {displayOrder && (
                              <span className={isWarband ? styles.globalOrderWarband : styles.globalOrder}>
                                {displayOrder}번째 {isWarband ? "유랑단" : "유랑"}
                              </span>
                            )}
                          </div>
                          <span className={styles.visitDate}>
                            {visit.startDate} ~ {visit.endDate}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 추가 이미지 */}
        <div className={styles.imagesSection}>
          {locationImage?.url && (
            <div className={styles.fullWidthImageCard}>
              <h3 className={styles.sectionTitle}>📍 위치</h3>
              <div className={styles.fullImageWrapper}>
                <img src={locationImage.url} alt="위치" className={styles.fullImage} />
              </div>
            </div>
          )}

          {wearingImages.length > 0 && (
            <div className={styles.fullWidthImageCard}>
              <h3 className={styles.sectionTitle}>
                👕 착용샷 {wearingImages.length > 1 && `(${currentWearingIndex + 1}/${wearingImages.length})`}
              </h3>
              <div className={styles.sliderWrapper}>
                {wearingImages.length > 1 && (
                  <button onClick={handlePrevWearing} className={`${styles.sliderButton} ${styles.sliderButtonPrev}`} aria-label="이전 이미지">‹</button>
                )}
                <div className={styles.sliderImageWrapper}>
                  <img src={wearingImages[currentWearingIndex].url} alt={`착용샷 ${currentWearingIndex + 1}`} className={styles.fullImage} />
                </div>
                {wearingImages.length > 1 && (
                  <button onClick={handleNextWearing} className={`${styles.sliderButton} ${styles.sliderButtonNext}`} aria-label="다음 이미지">›</button>
                )}
              </div>
              {wearingImages.length > 1 && (
                <div className={styles.indicators}>
                  {wearingImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentWearingIndex(index)}
                      className={`${styles.indicator} ${index === currentWearingIndex ? styles.indicatorActive : ''}`}
                      aria-label={`${index + 1}번째 이미지로 이동`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {nodeChartImage?.url && (
            <div className={styles.fullWidthImageCard}>
              <h3 className={styles.sectionTitle}>🗺️ 노드표</h3>
              <div className={styles.fullImageWrapper}>
                <img src={nodeChartImage.url} alt="노드표" className={styles.fullImage} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}