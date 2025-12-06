"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import { seasonColors } from "../../../../constants/seasonColors";
import styles from "./page.module.css";

const BASE_URL = "";

export default function SoulDetailPage() {
  const params = useParams();
  const router = useRouter();
  const soulId = params.soulId;

  const [soul, setSoul] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <LoadingSpinner />;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!soul) return <div className={styles.noData}>영혼 정보가 없습니다.</div>;

  const representativeImage = getImageByType("REPRESENTATIVE");
  const locationImage = getImageByType("LOCATION");
  const wearingImage = getImageByType("WEARING");
  const nodeChartImage = getImageByType("NODE_CHART");

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

      {/* 메인 콘텐츠 */}
      <div className={styles.mainContent}>
        {/* 대표 이미지 및 기본 정보 */}
        <div className={styles.mainSection}>
          <div className={styles.imageWrapper}>
            {representativeImage?.url ? (
              <img 
                src={representativeImage.url} 
                alt={soul.name}
                className={styles.mainImage}
              />
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
                <span className={styles.infoLabel}>순서</span>
                <span className={styles.infoValue}>#{soul.orderNum}</span>
              </div>
              
              {soul.creator && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>제작자</span>
                  <span className={styles.infoValue}>{soul.creator}</span>
                </div>
              )}

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>복각 횟수</span>
                <span className={styles.infoValue}>{soul.totalVisits || 0}회</span>
              </div>
            </div>

            {/* 키워드 */}
            {soul.keywords && soul.keywords.length > 0 && (
              <div className={styles.keywordsBox}>
                {soul.keywords.map((keyword, index) => (
                  <span key={index} className={styles.keyword}>
                    {keyword}
                  </span>
                ))}
              </div>
            )}

            {/* 유랑 이력 */}
            {soul.travelingVisits && soul.travelingVisits.length > 0 && (
              <div className={styles.visitsBox}>
                <h3 className={styles.boxTitle}>유랑 이력</h3>
                <div className={styles.visitsList}>
                  {soul.travelingVisits.map((visit, index) => (
                    <div key={index} className={styles.visitItem}>
                      <span className={styles.visitNumber}>
                        {visit.visitNumber}차
                        {visit.isWarbandVisit && " (유랑단)"}
                      </span>
                      <span className={styles.visitDate}>
                        {visit.startDate} ~ {visit.endDate}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 추가 이미지 */}
        <div className={styles.additionalImages}>
          {locationImage?.url && (
            <div className={styles.imageCard}>
              <h3 className={styles.imageTitle}>위치</h3>
              <img 
                src={locationImage.url} 
                alt="위치"
                className={styles.additionalImage}
              />
            </div>
          )}

          {wearingImage?.url && (
            <div className={styles.imageCard}>
              <h3 className={styles.imageTitle}>착용샷</h3>
              <img 
                src={wearingImage.url} 
                alt="착용샷"
                className={styles.additionalImage}
              />
            </div>
          )}

          {nodeChartImage?.url && (
            <div className={styles.imageCard}>
              <h3 className={styles.imageTitle}>노드표</h3>
              <img 
                src={nodeChartImage.url} 
                alt="노드표"
                className={styles.additionalImage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}