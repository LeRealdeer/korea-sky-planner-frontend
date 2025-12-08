"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { seasonColors } from "../../../../constants/seasonColors";
import styles from "./page.module.css";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SeasonCreatePage() {
  const router = useRouter();
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

      const response = await fetch(`${BASE_URL}/api/v1/seasons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "시즌 생성에 실패했습니다.");
      }

      const result = await response.json();
      alert("시즌이 성공적으로 생성되었습니다!");
      router.push(`/sky/SeasonDictionary/seasons/${result.data.id}`);
    } catch (err) {
      setError(err.message);
      alert(`생성 실패: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>새 시즌 만들기</h1>
        <button onClick={() => router.back()} className={styles.cancelButton}>
          취소
        </button>
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
              placeholder="예: 감사"
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
              placeholder="예: 1"
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
            {saving ? "생성 중..." : "시즌 만들기"}
          </button>
        </div>
      </form>
    </div>
  );
}