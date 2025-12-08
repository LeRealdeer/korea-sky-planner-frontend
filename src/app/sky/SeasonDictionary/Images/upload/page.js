// src/app/sky/Images/upload/page.js
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../../../../components/LoadingSpinner";
import styles from "./page.module.css";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://korea-sky-planner-backend-production.up.railway.app';

export default function ImageUploadPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [souls, setSouls] = useState([]);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [formData, setFormData] = useState({
    soulId: "",
    imageType: "REPRESENTATIVE",
    file: null,
  });

  const imageTypes = [
    { value: "REPRESENTATIVE", label: "대표 이미지" },
    { value: "LOCATION", label: "위치 이미지" },
    { value: "WEARING", label: "착용샷" },
    { value: "NODE_CHART", label: "노드표" },
  ];

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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("파일 크기는 10MB를 초과할 수 없습니다.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    setFormData(prev => ({ ...prev, file }));

    // 미리보기
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.file) {
      alert("파일을 선택해주세요.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", formData.file);
      uploadFormData.append("imageType", formData.imageType);

      // ✅ soulId가 있으면 영혼 연결, 없으면 임시 업로드
      let url = `${BASE_URL}/api/v1/images/upload`;
      if (formData.soulId) {
        url = `${BASE_URL}/api/v1/images`;
        uploadFormData.append("soulId", formData.soulId);
      }

      const response = await fetch(url, {
        method: "POST",
        body: uploadFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "이미지 업로드에 실패했습니다.");
      }

      alert("이미지가 성공적으로 업로드되었습니다!");
      router.push("/sky/Images");
    } catch (err) {
      setError(err.message);
      alert(`업로드 실패: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>이미지 업로드</h1>
        <button onClick={() => router.back()} className={styles.cancelButton}>
          취소
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>이미지 정보</h2>

          <div className={styles.formGroup}>
            <label className={styles.label}>영혼 선택 (선택사항)</label>
            <select
              name="soulId"
              value={formData.soulId}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="">영혼 없이 업로드 (나중에 연결)</option>
              {souls.map(soul => (
                <option key={soul.id} value={soul.id}>
                  [{soul.seasonName}] {soul.name}
                </option>
              ))}
            </select>
            <p className={styles.hint}>
              영혼을 선택하지 않으면 임시로 업로드되며, 나중에 영혼 수정 시 연결할 수 있습니다.
            </p>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>이미지 타입 *</label>
            <select
              name="imageType"
              value={formData.imageType}
              onChange={handleChange}
              className={styles.select}
              required
            >
              {imageTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>이미지 파일 *</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={styles.fileInput}
              id="file-upload"
              required
            />
            <label htmlFor="file-upload" className={styles.fileLabel}>
              📁 파일 선택
            </label>
            <p className={styles.hint}>최대 10MB, 이미지 파일만 가능</p>

            {previewUrl && (
              <div className={styles.previewContainer}>
                <img src={previewUrl} alt="미리보기" className={styles.preview} />
              </div>
            )}
          </div>
        </div>

        <div className={styles.formActions}>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={uploading}
          >
            {uploading ? "업로드 중..." : "이미지 업로드"}
          </button>
        </div>
      </form>
    </div>
  );
}