// src/app/sky/TravelingVisits/manage/page.js
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import styles from "./page.module.css";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://korea-sky-planner-backend-production.up.railway.app';

export default function TravelingVisitsManagePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [visits, setVisits] = useState([]);
  const [filteredVisits, setFilteredVisits] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    fetchVisits();
  }, [currentPage]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = visits.filter(visit =>
        visit.soulName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        visit.seasonName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredVisits(filtered);
    } else {
      setFilteredVisits(visits);
    }
  }, [searchQuery, visits]);

  const fetchVisits = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/souls/traveling-visits?page=${currentPage}&size=${pageSize}`
      );

      if (!response.ok) {
        throw new Error("유랑 이력을 불러오는데 실패했습니다.");
      }

      const data = await response.json();
      const content = data.data?.content || [];
      
      setVisits(content);
      setFilteredVisits(content);
      setTotalPages(data.data?.totalPages || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (visitId) => {
    if (!confirm("정말로 이 유랑 이력을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/v1/visits/${visitId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("삭제에 실패했습니다.");
      }

      alert("유랑 이력이 삭제되었습니다.");
      fetchVisits(); // 목록 새로고침
    } catch (err) {
      alert(`삭제 실패: ${err.message}`);
    }
  };

  const handleEdit = (visitId) => {
    router.push(`/sky/TravelingVisits/${visitId}/edit`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getStatusBadge = (startDate, endDate) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (today >= start && today <= end) {
      return <span className={styles.badgeActive}>진행중</span>;
    } else if (today > end) {
      return <span className={styles.badgeEnded}>종료</span>;
    } else {
      return <span className={styles.badgeUpcoming}>예정</span>;
    }
  };

  if (loading && currentPage === 0) return <LoadingSpinner />;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>유랑 이력 관리</h1>
        <div className={styles.headerActions}>
          <button
            onClick={() => router.push("/sky/TravelingVisits/create")}
            className={styles.createButton}
          >
            + 새 유랑 추가
          </button>
          <button
            onClick={() => router.push("/sky/travelingSprits/travelingEncyclopedia")}
            className={styles.backButton}
          >
            목록으로
          </button>
        </div>
      </div>

      <div className={styles.searchSection}>
        <input
          type="text"
          placeholder="영혼 이름 또는 시즌명으로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        <span className={styles.resultCount}>
          총 {filteredVisits.length}개의 유랑 이력
        </span>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>시즌</th>
              <th>영혼 이름</th>
              <th>방문 차수</th>
              <th>시작일</th>
              <th>종료일</th>
              <th>유랑단</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {filteredVisits.length === 0 ? (
              <tr>
                <td colSpan="8" className={styles.emptyState}>
                  유랑 이력이 없습니다.
                </td>
              </tr>
            ) : (
              filteredVisits.map((visit) => (
                <tr key={visit.__travelingVisitId}>
                  <td>
                    <span
                      className={styles.seasonBadge}
                      style={{ backgroundColor: visit.seasonColor || "#999" }}
                    >
                      {visit.seasonName}
                    </span>
                  </td>
                  <td className={styles.soulName}>{visit.name}</td>
                  <td className={styles.visitNumber}>
                    {visit.visitNumber}차
                  </td>
                  <td>{formatDate(visit.startDate)}</td>
                  <td>{formatDate(visit.endDate)}</td>
                  <td className={styles.centered}>
                    {visit.isWarbandVisit ? "✓" : "-"}
                  </td>
                  <td className={styles.centered}>
                    {getStatusBadge(visit.startDate, visit.endDate)}
                  </td>
                  <td className={styles.actions}>
                    <button
                      onClick={() => handleEdit(visit.__travelingVisitId)}
                      className={styles.editButton}
                      title="수정"
                    >
                      ✏️ 수정
                    </button>
                    <button
                      onClick={() => handleDelete(visit.__travelingVisitId)}
                      className={styles.deleteButton}
                      title="삭제"
                    >
                      🗑️ 삭제
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className={styles.pageButton}
          >
            이전
          </button>
          <span className={styles.pageInfo}>
            {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage >= totalPages - 1}
            className={styles.pageButton}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}