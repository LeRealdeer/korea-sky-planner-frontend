// src/app/sky/TravelingVisits/create/page.js
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import styles from "./page.module.css";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://korea-sky-planner-backend-production.up.railway.app';

export default function TravelingVisitCreatePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [souls, setSouls] = useState([]);

  const [formData, setFormData] = useState({
    soulId: "",
    visitNumber: 1,
    startDate: "",
    endDate: "",
    isWarbandVisit: false,
  });

  useEffect(() => {
    fetchSouls();
  }, []);

  const fetchSouls = async () => {
    setLoading(true);
    setError(null);

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
        throw new Error(errorData.error?.message || "유랑 기록 생성에 실패했습니다.");
      }

      alert("유랑 기록이 성공적으로 생성되었습니다!");
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
        <h1 className={styles.title}>유랑 기록 추가</h1>
        <button onClick={() => router.back()} className={styles.cancelButton}>
          취소
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>기본 정보</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>영혼 선택 *</label>
            <select
              name="soulId"
              value={formData.soulId}
              onChange={handleChange}
              className={styles.select}
              required
            >
              <option value="">영혼을 선택하세요</option>
              {souls.map(soul => (
                <option key={soul.id} value={soul.id}>
                  [{soul.seasonName}] {soul.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>방문 차수 *</label>
            <input
              type="number"
              name="visitNumber"
              value={formData.visitNumber}
              onChange={handleChange}
              className={styles.input}
              min="1"
              placeholder="예: 1"
              required
            />
            <p className={styles.hint}>1차, 2차, 3차... (0은 시즌 당시를 의미합니다)</p>
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
          </div>
        </div>

        <div className={styles.formActions}>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={saving}
          >
            {saving ? "생성 중..." : "유랑 기록 추가"}
          </button>
        </div>
      </form>
    </div>
  );
}