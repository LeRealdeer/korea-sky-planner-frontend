"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import LoadingSpinner from "../../../../../components/LoadingSpinner";
import styles from "./page.module.css";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SeasonEditPage() {
  const params = useParams();
  const router = useRouter();
  const seasonId = params.seasonId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    orderNum: "",
    startDate: "",
    endDate: "",
    color: "#667eea",
    isCollaboration: false,
  });

  useEffect(() => {
    if (seasonId) {
      fetchSeasonData();
    }
  }, [seasonId]);

  const fetchSeasonData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/api/v1/seasons/${seasonId}`);
      if (!response.ok) throw new Error("시즌 정보를 불러올 수 없습니다.");
      
      const data = await response.json();
      const season = data.data;

      setFormData({
        name: season.name || "",
        orderNum: season.orderNum || "",
        startDate: season.startDate || "",
        endDate: season.endDate || "",
        color: season.color || "#667eea",
        isCollaboration: season.isCollaboration || false,
      });
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
        name: formData.name,
        orderNum: parseInt(formData.orderNum),
        startDate: formData.startDate,
        endDate: formData.endDate,
        color: formData.color,
        isCollaboration: formData.isCollaboration,
      };

      const response = await fetch(`${BASE_URL}/api/v1/seasons/${seasonId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "시즌 수정에 실패했습니다.");
      }

      alert("시즌이 성공적으로 수정되었습니다!");
      router.push(`/sky/SeasonDictionary/seasons/${seasonId}`);
    } catch (err) {
      setError(err.message);
      alert(`수정 실패: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("정말로 이 시즌을 삭제하시겠습니까?\n시즌에 속한 모든 영혼도 함께 삭제됩니다.")) return;

    try {
      const response = await fetch(`${BASE_URL}/api/v1/seasons/${seasonId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("시즌 삭제에 실패했습니다.");

      alert("시즌이 삭제되었습니다.");
      router.push("/sky/SeasonDictionary/seasons");
    } catch (err) {
      alert(`삭제 실패: ${err.message}`);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>시즌 수정하기</h1>
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
          <h2 className={styles.sectionTitle}>기본 정보</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>시즌 이름 *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>순서 *</label>
            <input
              type="number"
              name="orderNum"
              value={formData.orderNum}
              onChange={handleChange}
              className={styles.input}
              required
            />
            <p className={styles.hint}>시즌의 순서 번호를 입력하세요. (중복 불가)</p>
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
            <label className={styles.label}>시즌 색상</label>
            <div className={styles.colorInputGroup}>
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className={styles.colorInput}
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className={styles.colorTextInput}
                placeholder="#667eea"
              />
            </div>
            <p className={styles.hint}>시즌을 대표하는 색상을 선택하세요.</p>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="isCollaboration"
                checked={formData.isCollaboration}
                onChange={handleChange}
                className={styles.checkbox}
              />
              콜라보 시즌
            </label>
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