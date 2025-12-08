"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { seasonColors } from "../../../constants/seasonColors";
import styles from "./page.module.css";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;;

export default function SeasonsListPage() {
  const router = useRouter();
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSeasons();
  }, []);

  const fetchSeasons = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/api/v1/seasons`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      setSeasons(data.data || []);
    } catch (err) {
      setError(err.message);
      setSeasons([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    return `${parts[0]}.${parts[1]}.${parts[2]}`;
  };

  return (
    <div className={styles.container}>
{/* 헤더 */}
<div className={styles.header}>
  <h1 className={styles.title}>시즌 목록</h1>
  <div className={styles.headerButtons}>
    <Link href="/sky/SeasonDictionary" className={styles.backButton}>
      영혼별로 보기
    </Link>
    <Link href="/sky/SeasonDictionary/seasons/create" className={styles.createButton}>
      시즌 만들기
    </Link>
  </div>
</div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className={styles.error}>Error: {error}</div>
      ) : seasons.length === 0 ? (
        <p className={styles.noData}>시즌 정보가 없습니다.</p>
      ) : (
        <div className={styles.seasonsGrid}>
          {seasons.map((season) => (
            <Link
              key={season.id}
              href={`/sky/SeasonDictionary/seasons/${season.id}`}
              className={styles.seasonCard}
              style={{
                borderColor: seasonColors[season.name] || "#e5e7eb",
              }}
            >
              <div 
                className={styles.seasonHeader}
                style={{ backgroundColor: seasonColors[season.name] || "#888" }}
              >
                <div className={styles.seasonOrder}>#{season.orderNum}</div>
                <h2 className={styles.seasonName}>{season.name}</h2>
                {season.isCollaboration && (
                  <span className={styles.collabBadge}>콜라보</span>
                )}
              </div>

              <div className={styles.seasonBody}>
                {season.emblemIcon && (
                  <div className={styles.emblemSection}>
                    <img 
                      src={season.emblemIcon} 
                      alt={`${season.name} 엠블럼`}
                      className={styles.emblemImage}
                    />
                  </div>
                )}

                <div className={styles.seasonInfo}>
                  {season.startDate && season.endDate && (
                    <p className={styles.infoRow}>
                      <span className={styles.infoLabel}>기간:</span>
                      <span className={styles.infoValue}>
                        {formatDate(season.startDate)} ~ {formatDate(season.endDate)}
                      </span>
                    </p>
                  )}
                  
                  {season.durationDays && (
                    <p className={styles.infoRow}>
                      <span className={styles.infoLabel}>진행일수:</span>
                      <span className={styles.infoValue}>{season.durationDays}일</span>
                    </p>
                  )}

                  {season.soulCount !== undefined && (
                    <p className={styles.infoRow}>
                      <span className={styles.infoLabel}>영혼 수:</span>
                      <span className={styles.infoValue}>{season.soulCount}개</span>
                    </p>
                  )}
                </div>

                {season.seasonMap && (
                  <div className={styles.mapSection}>
                    <img 
                      src={season.seasonMap} 
                      alt={`${season.name} 맵`}
                      className={styles.mapImage}
                    />
                  </div>
                )}
              </div>

              <div className={styles.seasonFooter}>
                <button className={styles.detailButton}>
                  상세보기 →
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}