"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import { seasonColors } from "../../../../constants/seasonColors";
import styles from "./page.module.css";

const BASE_URL = "korea-sky-planner-backend-production.up.railway.app";

export default function SeasonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const seasonId = params.seasonId;

  const [season, setSeason] = useState(null);
  const [souls, setSouls] = useState([]);
  const [inAppItems, setInAppItems] = useState([]);
  const [activeTab, setActiveTab] = useState("souls");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (seasonId) {
      fetchSeasonDetail();
    }
  }, [seasonId]);

const fetchSeasonDetail = async () => {
  setLoading(true);
  setError(null);

  try {
    // 시즌 기본 정보
    const seasonResponse = await fetch(`${BASE_URL}/api/v1/seasons/${seasonId}`);
    if (!seasonResponse.ok) throw new Error("시즌 정보를 불러올 수 없습니다.");
    const seasonData = await seasonResponse.json();
    const seasonInfo = seasonData.data;
    setSeason(seasonInfo);

    // 해당 시즌의 영혼들만 조회 (seasonId가 아닌 seasonName으로 필터링)
    const soulsResponse = await fetch(
      `${BASE_URL}/api/v1/souls?seasonName=${encodeURIComponent(seasonInfo.name)}&size=100`
    );
    if (!soulsResponse.ok) throw new Error("영혼 정보를 불러올 수 없습니다.");
    const soulsData = await soulsResponse.json();
    
    // 백엔드에서 필터링이 안 되는 경우 프론트에서 추가 필터링
    const filteredSouls = (soulsData.data.content || []).filter(
      soul => soul.seasonId === parseInt(seasonId)
    );
    setSouls(filteredSouls);

    // 해당 시즌의 인앱 아이템만 조회
    const itemsResponse = await fetch(`${BASE_URL}/api/v1/in-app-items?seasonId=${seasonId}`);
    if (itemsResponse.ok) {
      const itemsData = await itemsResponse.json();
      setInAppItems(itemsData.data || []);
    }
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    return `${parts[0]}.${parts[1]}.${parts[2]}`;
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!season) return <div className={styles.noData}>시즌 정보가 없습니다.</div>;

  // 시즌 가이드와 일반 영혼 분리
  const seasonGuides = souls.filter(soul => soul.isSeasonGuide);
  const regularSouls = souls.filter(soul => !soul.isSeasonGuide);

  return (
    <div className={styles.container}>
      {/* 시즌 헤더 */}
      <div 
        className={styles.seasonHeader}
        style={{ backgroundColor: seasonColors[season.name] || "#888" }}
      >
{/* 헤더에 수정 버튼 추가 */}
<div className={styles.header}>
  <button onClick={() => router.back()} className={styles.backButton}>
    ← 뒤로가기
  </button>
  <Link href={`/sky/SeasonDictionary/seasons/${seasonId}/edit`} className={styles.editButton}>
    수정하기
  </Link>
</div>
        
        <div className={styles.headerContent}>
          {season.emblemIcon && (
            <img 
              src={season.emblemIcon} 
              alt={`${season.name} 엠블럼`}
              className={styles.emblemLarge}
            />
          )}
          <div className={styles.seasonTitleSection}>
            <div className={styles.seasonOrder}>#{season.orderNum}</div>
            <h1 className={styles.seasonTitle}>{season.name}</h1>
            {season.isCollaboration && (
              <span className={styles.collabBadge}>콜라보 시즌</span>
            )}
          </div>
        </div>

        <div className={styles.seasonStats}>
          {season.startDate && season.endDate && (
            <div className={styles.statItem}>
              <span className={styles.statLabel}>기간</span>
              <span className={styles.statValue}>
                {formatDate(season.startDate)} ~ {formatDate(season.endDate)}
              </span>
            </div>
          )}
          {season.durationDays && (
            <div className={styles.statItem}>
              <span className={styles.statLabel}>진행일수</span>
              <span className={styles.statValue}>{season.durationDays}일</span>
            </div>
          )}
          <div className={styles.statItem}>
            <span className={styles.statLabel}>영혼 수</span>
            <span className={styles.statValue}>{souls.length}개</span>
          </div>
        </div>
      </div>

      {/* 시즌 맵 */}
      {season.seasonMap && (
        <div className={styles.mapSection}>
          <img 
            src={season.seasonMap} 
            alt={`${season.name} 맵`}
            className={styles.mapImage}
          />
        </div>
      )}

      {/* 탭 */}
      <div className={styles.tabs}>
        <button
          onClick={() => setActiveTab("souls")}
          className={`${styles.tab} ${activeTab === "souls" ? styles.activeTab : ""}`}
        >
          시즌 영혼 ({regularSouls.length})
        </button>
        <button
          onClick={() => setActiveTab("guides")}
          className={`${styles.tab} ${activeTab === "guides" ? styles.activeTab : ""}`}
        >
          시즌 가이드 ({seasonGuides.length})
        </button>
        <button
          onClick={() => setActiveTab("items")}
          className={`${styles.tab} ${activeTab === "items" ? styles.activeTab : ""}`}
        >
          인앱 아이템 ({inAppItems.length})
        </button>
      </div>

      {/* 시즌 영혼 리스트 */}
      {activeTab === "souls" && (
        <div className={styles.soulsGrid}>
          {regularSouls.length === 0 ? (
            <p className={styles.noData}>이 시즌의 영혼이 없습니다.</p>
          ) : (
            regularSouls.map((soul) => {
              const representativeImage = soul.images?.find(img => img.imageType === "REPRESENTATIVE");
              
              return (
                <Link
                  key={soul.id}
                  href={`/sky/SeasonDictionary/souls/${soul.id}`}
                  className={styles.soulCard}
                >
                  <div className={styles.imageWrapper}>
                    {representativeImage?.url ? (
                      <img src={representativeImage.url} alt={soul.name} className={styles.cardImage} />
                    ) : (
                      <div className={styles.noImage}>이미지 없음</div>
                    )}
                  </div>
                  <div className={styles.cardContent}>
                    <h3 className={styles.soulName}>{soul.name}</h3>
                    {soul.location && (
                      <p className={styles.location}>📍 {soul.location}</p>
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}

      {/* 시즌 가이드 리스트 */}
      {activeTab === "guides" && (
        <div className={styles.soulsGrid}>
          {seasonGuides.length === 0 ? (
            <p className={styles.noData}>이 시즌의 가이드가 없습니다.</p>
          ) : (
            seasonGuides.map((soul) => {
              const representativeImage = soul.images?.find(img => img.imageType === "REPRESENTATIVE");
              
              return (
                <Link
                  key={soul.id}
                  href={`/sky/SeasonDictionary/souls/${soul.id}`}
                  className={styles.soulCard}
                >
                  <div className={styles.imageWrapper}>
                    {representativeImage?.url ? (
                      <img src={representativeImage.url} alt={soul.name} className={styles.cardImage} />
                    ) : (
                      <div className={styles.noImage}>이미지 없음</div>
                    )}
                    <div className={styles.guideBadgeOverlay}>시즌 가이드</div>
                  </div>
                  <div className={styles.cardContent}>
                    <h3 className={styles.soulName}>{soul.name}</h3>
                    {soul.location && (
                      <p className={styles.location}>📍 {soul.location}</p>
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}

      {/* 인앱 아이템 리스트 */}
      {activeTab === "items" && (
        <div className={styles.itemsGrid}>
          {inAppItems.length === 0 ? (
            <p className={styles.noData}>이 시즌의 인앱 아이템이 없습니다.</p>
          ) : (
            inAppItems.map((item, index) => (
              <div key={index} className={styles.itemCard}>
                {item.imageUrl && (
                  <div className={styles.itemImageWrapper}>
                    <img src={item.imageUrl} alt={item.name} className={styles.itemImage} />
                  </div>
                )}
                <div className={styles.itemContent}>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  {item.price && (
                    <p className={styles.itemPrice}>{item.price}</p>
                  )}
                  {item.keywords && item.keywords.length > 0 && (
                    <div className={styles.itemKeywords}>
                      {item.keywords.map((kw, i) => (
                        <span key={i} className={styles.keyword}>{kw}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}