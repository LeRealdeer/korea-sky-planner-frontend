"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://korea-sky-planner-backend-production.up.railway.app';

export default function IAPItemCreatePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const [seasons, setSeasons] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    seasonId: "",
    category: "",
    purchaseType: "PAID",
    priceInfo: "",
    keywords: "",
    imageUrl: "",
  });

  useEffect(() => {
    fetchSeasons();
  }, []);

  const fetchSeasons = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/api/v1/seasons`);
      if (response.ok) {
        const data = await response.json();
        setSeasons(data.data || []);
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

  const handleImageUpload = async (e) => {
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

    setUploading(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("imageType", "IAP_ITEM");

      const response = await fetch(`${BASE_URL}/api/v1/images/upload`, {
        method: "POST",
        body: formDataUpload,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "이미지 업로드에 실패했습니다.");
      }

      const data = await response.json();
      const imageUrl = data.data.url;

      setFormData(prev => ({
        ...prev,
        imageUrl: imageUrl
      }));

      setImagePreview(imageUrl);
      alert('이미지가 업로드되었습니다!');

    } catch (err) {
      alert(`이미지 업로드 실패: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleImageDelete = async () => {
    if (!formData.imageUrl) return;
    if (!confirm("이미지를 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`${BASE_URL}/api/v1/images`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: formData.imageUrl }),
      });

      if (!response.ok) throw new Error("이미지 삭제에 실패했습니다.");

      setFormData(prev => ({ ...prev, imageUrl: "" }));
      setImagePreview(null);
      alert("이미지가 삭제되었습니다.");
    } catch (err) {
      alert(`이미지 삭제 실패: ${err.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        seasonId: parseInt(formData.seasonId),
        category: formData.category,
        purchaseType: formData.purchaseType,
        priceInfo: formData.priceInfo,
        keywords: formData.keywords.split(",").map(k => k.trim()).filter(k => k),
        imageUrl: formData.imageUrl,
      };

      const response = await fetch(`${BASE_URL}/api/v1/iap-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "IAP 아이템 생성에 실패했습니다.");
      }

      alert("IAP 아이템이 성공적으로 생성되었습니다!");
      router.push("/sky/SeasonDictionary");
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
        <h1 className={styles.title}>새 IAP 아이템 만들기</h1>
        <button onClick={() => router.back()} className={styles.cancelButton}>
          취소
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>기본 정보</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>아이템 이름 *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={styles.input}
              placeholder="예: 빨간 뿔"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>시즌 *</label>
            <select
              name="seasonId"
              value={formData.seasonId}
              onChange={handleChange}
              className={styles.select}
              required
            >
              <option value="">시즌 선택</option>
              {seasons.map(season => (
                <option key={season.id} value={season.id}>
                  {season.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>카테고리</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={styles.input}
              placeholder="예: 뿔, 꼬리, 가면, 케이프"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>구매 방식 *</label>
            <select
              name="purchaseType"
              value={formData.purchaseType}
              onChange={handleChange}
              className={styles.select}
              required
            >
              <option value="PAID">유료 (현금)</option>
              <option value="CANDLE">양초</option>
              <option value="BOTH">둘 다 가능</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>가격 정보</label>
            <input
              type="text"
              name="priceInfo"
              value={formData.priceInfo}
              onChange={handleChange}
              className={styles.input}
              placeholder='예: "$9.99" 또는 "75 양초"'
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>키워드 (쉼표로 구분)</label>
            <input
              type="text"
              name="keywords"
              value={formData.keywords}
              onChange={handleChange}
              className={styles.input}
              placeholder="예: 빨강, 악마, 뿔"
            />
          </div>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>아이템 이미지</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>이미지</label>
            <div className={styles.imageUploadContainer}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className={styles.fileInput}
                id="image-upload"
                disabled={uploading}
              />
              <label htmlFor="image-upload" className={styles.uploadButton}>
                {uploading ? "업로드 중..." : "이미지 선택"}
              </label>
              
              {(imagePreview || formData.imageUrl) && (
                <div className={styles.imagePreviewContainer}>
                  <img 
                    src={imagePreview || formData.imageUrl}
                    alt="아이템 이미지 미리보기"
                    className={styles.imagePreview}
                  />
                  <button
                    type="button"
                    onClick={handleImageDelete}
                    className={styles.deleteImageButton}
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.formActions}>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={saving}
          >
            {saving ? "생성 중..." : "IAP 아이템 만들기"}
          </button>
        </div>
      </form>
    </div>
  );
}