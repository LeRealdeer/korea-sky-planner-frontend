"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import styles from "./page.module.css";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://korea-sky-planner-backend-production.up.railway.app';

export default function VisitEditPage() {
  const router = useRouter();
  const params = useParams();
  const visitId = params.visitId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [visit, setVisit] = useState(null);
  const [souls, setSouls] = useState([]);

  const [formData, setFormData] = useState({
    soulId: "",
    visitNumber: "",
    startDate: "",
    endDate: "",
    isWarbandVisit: false,
  });

  useEffect(() => {
    fetchSouls();
    fetchVisit();
  }, [visitId]);

  const fetchSouls = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/souls/all`);
      if (response.ok) {
        const data = await response.json();
        setSouls(data.data || []);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchVisit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/api/v1/visits/${visitId}`);
      if (!response.ok) throw new Error("유랑 이력 정보를 불러올 수 없습니다.");

      const data = await response.json();
      const visitData = data.data;
      setVisit(visitData);

      // 영혼 ID 가져오기 위해 영혼 조회
      const soulResponse = await fetch(`${BASE_URL}/api/v1/souls/${visitData.soulId || visitData.soul?.id}`);
      if (soulResponse.ok) {
        const soulData = await soulResponse.json();
        setFormData({
          soulId: soulData.data.id,
          visitNumber: visitData.visitNumber || "",
          startDate: visitData.startDate || "",
          endDate: visitData.endDate || "",
          isWarbandVisit: visitData.isWarbandVisit || false,
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        visitNumber: parseInt(formData.visitNumber),
        startDate: formData.startDate,
        endDate: formData.endDate,
        isWarbandVisit: formData.isWarbandVisit,
      };

      const response = await fetch(`${BASE_URL}/api/v1/visits/${visitId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "유랑 이력 수정에 실패했습니다.");
      }

      alert("유랑 이력이 성공적으로 수정되었습니다!");
      router.push(`/sky/SeasonDictionary/souls/${formData.soulId}`);
    } catch (err) {
      setError(err.message);
      alert(`수정 실패: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("정말로 이 유랑 이력을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`${BASE_URL}/api/v1/visits/${visitId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("유랑 이력 삭제에 실패했습니다.");

      alert("유랑 이력이 삭제되었습니다.");
      router.push(`/sky/SeasonDictionary/souls/${formData.soulId}`);
    } catch (err) {
      alert(`삭제 실패: ${err.message}`);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>유랑 이력 수정</h1>
        <div className={styles.headerButtons}>
          <button onClick={() => router.back()} className={styles.cancelButton}>
            취소
          </button>
          <button onClick={handleDelete} className={styles.deleteButton}>
            삭제
          </button>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>유랑 정보</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>영혼</label>
            <select
              name="soulId"
              value={formData.soulId}
              onChange={handleChange}
              className={styles.select}
              disabled
            >
              <option value="">영혼 선택</option>
              {souls.map(soul => (
                <option key={soul.id} value={soul.id}>
                  [{soul.seasonName}] {soul.name}
                </option>
              ))}
            </select>
            <p className={styles.hint}>영혼은 수정할 수 없습니다.</p>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>유랑 차수 *</label>
            <input
              type="number"
              name="visitNumber"
              value={formData.visitNumber}
              onChange={handleChange}
              className={styles.input}
              placeholder="예: 1 (1차 유랑)"
              min="0"
              required
            />
            <p className={styles.hint}>0 = 시즌 당시, 1 = 1차 유랑, 2 = 2차 유랑 ...</p>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>시작일 *</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>종료일 *</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="isWarbandVisit"
                checked={formData.isWarbandVisit}
                onChange={handleChange}
                className={styles.checkbox}
              />
              유랑단 방문
            </label>
            <p className={styles.hint}>유랑단으로 온 경우 체크하세요.</p>
          </div>
        </div>

        <div className={styles.formActions}>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={saving}
          >
            {saving ? "저장 중..." : "수정 완료"}
          </button>
        </div>
      </form>
    </div>
  );
}