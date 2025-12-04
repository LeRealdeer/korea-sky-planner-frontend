"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import { seasonColors } from "../../../../constants/seasonColors";
import styles from "./page.module.css";

const BASE_URL = "http://140.245.73.191:8080";

export default function SoulDetailPage() {
  const params = useParams();
  const router = useRouter();
  const soulId = params.soulId;

  const [soul, setSoul] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageType, setSelectedImageType] = useState("REPRESENTATIVE");

  useEffect(() => {
    if (soulId) {
      fetchSoulDetail();
    }
  }, [soulId]);

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

  const getImageByType = (type) => {
    return soul?.images?.find(img => img.imageType === type);
  };

  const imageTypes = [
    { key: "REPRESENTATIVE", label: "대표 사진" },
    { key: "WEARING", label: "착용샷" },
    { key: "NODE_CHART", label: "노드표" },
  ];

  if (loading) return <LoadingSpinner />;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!soul) return <div className={styles.noData}>영혼 정보가 없습니다.</div>;

  const currentImage = getImageByType(selectedImageType);

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <button onClick={() => router.back()} className={styles.backButton}>
          ← 뒤로가기
        </button>
        <Link href={`/sky/SeasonDictionary/souls/${soulId}/edit`} className={styles.editButton}>
          수정하기
        </Link>
      </div>

      {/* 영혼 정보 헤더 */}
      <div className={styles.soulHeader}>
        <div className={styles.badgeSection}>
          <div className={styles.orderBadge}>#{soul.orderNum}</div>
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
        
        {soul.location && (
          <p className={styles.location}>📍 {soul.location}</p>
        )}
      </div>

      {/* 이미지 섹션 */}
      <div className={styles.imageSection}>
        <div className={styles.imageTabs}>
          {imageTypes.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSelectedImageType(key)}
              className={`${styles.imageTab} ${selectedImageType === key ? styles.activeImageTab : ""}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className={styles.imageDisplay}>
          {currentImage?.url ? (
            <img 
              src={currentImage.url} 
              alt={`${soul.name} - ${imageTypes.find(t => t.key === selectedImageType)?.label}`}
              className={styles.soulImage}
            />
          ) : (
            <div className={styles.noImage}>이미지가 없습니다</div>
          )}
        </div>
      </div>

      {/* 키워드 */}
      {soul.keywords && soul.keywords.length > 0 && (
        <div className={styles.keywordsSection}>
          <h3 className={styles.sectionTitle}>키워드</h3>
          <div className={styles.keywords}>
            {soul.keywords.map((keyword, index) => (
              <span key={index} className={styles.keyword}>
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 설명 */}
      {soul.description && (
        <div className={styles.descriptionSection}>
          <h3 className={styles.sectionTitle}>설명</h3>
          <p className={styles.description}>{soul.description}</p>
        </div>
      )}

      {/* 제작자 */}
      {soul.creator && (
        <div className={styles.creatorSection}>
          <h3 className={styles.sectionTitle}>제작자</h3>
          <p className={styles.creator}>{soul.creator}</p>
        </div>
      )}

      {/* 유랑 정보 */}
      {soul.travelingVisits && soul.travelingVisits.length > 0 && (
        <div className={styles.visitsSection}>
          <h3 className={styles.sectionTitle}>유랑 이력</h3>
          <div className={styles.visitsList}>
            {soul.travelingVisits.map((visit, index) => (
              <div key={index} className={styles.visitCard}>
                <div className={styles.visitHeader}>
                  <span className={styles.visitNumber}>{visit.visitNumber}차 복각</span>
                  {visit.isWarbandVisit && (
                    <span className={styles.warbandBadge}>유랑단</span>
                  )}
                  {visit.isActive && (
                    <span className={styles.activeBadge}>🔥 진행중</span>
                  )}
                </div>
                <p className={styles.visitDate}>
                  {visit.startDate} ~ {visit.endDate}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}