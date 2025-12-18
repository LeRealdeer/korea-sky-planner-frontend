"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import styles from "./page.module.css";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://korea-sky-planner-backend-production.up.railway.app';

export default function VisitCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedSoulId = searchParams.get("soulId"); // URL에서 영혼 ID 받기

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [souls, setSouls] = useState([]);

  const [formData, setFormData] = useState({
    soulId: preSelectedSoulId || "",
    visitNumber: "",
    startDate: "",
    endDate: "",
    isWarbandVisit: false,
  });

  useEffect(() => {
    fetchSouls();
  }, []);

  const fetchSouls = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/v1/souls/all`);
      if (response.ok) {
        const data = await response.json();
        setSouls(data.data || []);
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
        soulId: parseInt(formData.soulId),
        visitNumber: parseInt(formData.visitNumber),
        startDate: formData.startDate,
        endDate: formData.endDate,
        isWarbandVisit: formData.isWarbandVisit,
      };

      const response = await fetch(`${BASE_URL}/api/v1/visits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "유랑 이력 생성에 실패했습니다.");
      }

      alert("유랑 이력이 성공적으로 생성되었습니다!");
      
      // 영혼 상세 페이지로 이동
      router.push(`/sky/SeasonDictionary/souls/${formData.soulId}`);
    } catch (err) {
      setError(err.message);
      alert(`생성 실패: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>유랑 이력 추가</h1>
        <button onClick={() => router.back()} className={styles.cancelButton}>
          취소
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>유랑 정보</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>영혼 선택 *</label>
            <select
              name="soulId"
              value={formData.soulId}
              onChange={handleChange}
              className={styles.select}
              required
            >
              <option value="">영혼 선택</option>
              {souls.map(soul => (
                <option key={soul.id} value={soul.id}>
                  [{soul.seasonName}] {soul.name}
                </option>
              ))}
            </select>
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
            {saving ? "생성 중..." : "유랑 이력 추가"}
          </button>
        </div>
      </form>
    </div>
  );
}