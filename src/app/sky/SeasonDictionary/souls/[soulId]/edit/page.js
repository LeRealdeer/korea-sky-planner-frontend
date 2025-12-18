// src/app/sky/SeasonDictionary/souls/[soulId]/edit/page.js
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import styles from "./page.module.css";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://korea-sky-planner-backend-production.up.railway.app';

export default function SoulEditPage() {
  const router = useRouter();
  const params = useParams();
  const soulId = params.soulId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({
    representative: false,
    location: false,
    wearing: false,
    nodeChart: false,
  });
  const [error, setError] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [soul, setSoul] = useState(null);
  const [existingImages, setExistingImages] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    seasonId: "",
    orderNum: "",
    isSeasonGuide: false,
    keywords: "",
    description: "",
    creator: "",
  });

  useEffect(() => {
    fetchSeasons();
    fetchSoul();
  }, [soulId]);

  const fetchSeasons = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/seasons`);
      if (response.ok) {
        const data = await response.json();
        setSeasons(data.data || []);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchSoul = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/api/v1/souls/${soulId}`);
      if (!response.ok) throw new Error("영혼 정보를 불러올 수 없습니다.");

      const data = await response.json();
      const soulData = data.data;
      setSoul(soulData);
      setExistingImages(soulData.images || []);

      setFormData({
        name: soulData.name || "",
        seasonId: soulData.seasonId || "",
        orderNum: soulData.orderNum || "",
        isSeasonGuide: soulData.isSeasonGuide || false,
        keywords: soulData.keywords?.join(", ") || "",
        description: soulData.description || "",
        creator: soulData.creator || "",
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

  // ✅ 이미지 업로드 처리
  const handleImageUpload = async (e, imageType) => {
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

    setUploading(prev => ({ ...prev, [imageType]: true }));

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("imageType", imageType.toUpperCase());
      formDataUpload.append("soulId", soulId);

      const response = await fetch(`${BASE_URL}/api/v1/images`, {
        method: "POST",
        body: formDataUpload,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "이미지 업로드에 실패했습니다.");
      }

      const data = await response.json();
      const uploadedImage = data.data;

      // 기존 이미지 목록에 추가
      setExistingImages(prev => [...prev, uploadedImage]);

      alert(`${getImageTypeLabel(imageType)} 이미지가 업로드되었습니다!`);
    } catch (err) {
      alert(`이미지 업로드 실패: ${err.message}`);
    } finally {
      setUploading(prev => ({ ...prev, [imageType]: false }));
    }
  };

  // ✅ 이미지 삭제 처리
  const handleImageDelete = async (imageId) => {
    if (!confirm("이미지를 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`${BASE_URL}/api/v1/images/${imageId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("이미지 삭제에 실패했습니다.");

      setExistingImages(prev => prev.filter(img => img.id !== imageId));
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
      const selectedSeason = seasons.find(s => s.id === parseInt(formData.seasonId));
      if (!selectedSeason) {
        throw new Error("선택한 시즌을 찾을 수 없습니다.");
      }

const payload = {
  name: formData.name,
  seasonId: parseInt(formData.seasonId),
  seasonName: selectedSeason.name,
  orderNum: parseInt(formData.orderNum),
  isSeasonGuide: formData.isSeasonGuide,
  
  // ✅ 키워드 처리 수정
  keywords: formData.keywords
    .split(",")
    .map(k => k.trim())
    .filter(k => k.length > 0), // 빈 문자열 제거
  
  description: formData.description,
  creator: formData.creator,
  startDate: selectedSeason.startDate,
  endDate: selectedSeason.endDate,
};

      const response = await fetch(`${BASE_URL}/api/v1/souls/${soulId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "영혼 수정에 실패했습니다.");
      }

      alert("영혼이 성공적으로 수정되었습니다!");
      router.push(`/sky/SeasonDictionary/souls/${soulId}`);
    } catch (err) {
      setError(err.message);
      alert(`수정 실패: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("정말로 이 영혼을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`${BASE_URL}/api/v1/souls/${soulId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("영혼 삭제에 실패했습니다.");

      alert("영혼이 삭제되었습니다.");
      router.push("/sky/SeasonDictionary");
    } catch (err) {
      alert(`삭제 실패: ${err.message}`);
    }
  };

  const getImageTypeLabel = (type) => {
    const types = {
      representative: "대표 이미지",
      location: "위치 이미지",
      wearing: "착용샷",
      nodeChart: "노드표",
      REPRESENTATIVE: "대표 이미지",
      LOCATION: "위치 이미지",
      WEARING: "착용샷",
      NODE_CHART: "노드표",
    };
    return types[type] || type;
  };

  const getImagesByType = (type) => {
    return existingImages.filter(img => img.imageType === type.toUpperCase());
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>영혼 수정</h1>
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
        {/* 기본 정보 */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>기본 정보</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>영혼 이름 *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={styles.input}
              placeholder="예: 화음을 이루는 악단원"
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
            <p className={styles.hint}>시즌 내에서 몇 번째 영혼인지 입력하세요.</p>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="isSeasonGuide"
                checked={formData.isSeasonGuide}
                onChange={handleChange}
                className={styles.checkbox}
              />
              시즌 가이드
            </label>
          </div>
        </div>

        {/* 이미지 관리 */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>이미지</h2>
          
          {/* 대표 이미지 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>대표 이미지</label>
            <div className={styles.imageUploadContainer}>
              {getImagesByType("REPRESENTATIVE").map(img => (
                <div key={img.id} className={styles.imagePreviewContainer}>
                  <img 
                    src={img.url}
                    alt="대표 이미지"
                    className={styles.imagePreview}
                  />
                  <button
                    type="button"
                    onClick={() => handleImageDelete(img.id)}
                    className={styles.deleteImageButton}
                  >
                    삭제
                  </button>
                </div>
              ))}
              
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "representative")}
                  className={styles.fileInput}
                  id="representative-upload"
                  disabled={uploading.representative}
                />
                <label htmlFor="representative-upload" className={styles.uploadButton}>
                  {uploading.representative ? "업로드 중..." : "이미지 추가"}
                </label>
              </div>
            </div>
          </div>

          {/* 위치 이미지 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>위치 이미지</label>
            <div className={styles.imageUploadContainer}>
              {getImagesByType("LOCATION").map(img => (
                <div key={img.id} className={styles.imagePreviewContainer}>
                  <img 
                    src={img.url}
                    alt="위치 이미지"
                    className={styles.imagePreview}
                  />
                  <button
                    type="button"
                    onClick={() => handleImageDelete(img.id)}
                    className={styles.deleteImageButton}
                  >
                    삭제
                  </button>
                </div>
              ))}
              
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "location")}
                  className={styles.fileInput}
                  id="location-upload"
                  disabled={uploading.location}
                />
                <label htmlFor="location-upload" className={styles.uploadButton}>
                  {uploading.location ? "업로드 중..." : "이미지 추가"}
                </label>
              </div>
            </div>
          </div>

          {/* 착용샷 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>착용샷 (여러 개 가능)</label>
            <div className={styles.imageUploadContainer}>
              <div className={styles.multipleImagesContainer}>
                {getImagesByType("WEARING").map(img => (
                  <div key={img.id} className={styles.imagePreviewContainer}>
                    <img 
                      src={img.url}
                      alt="착용샷"
                      className={styles.imagePreview}
                    />
                    <button
                      type="button"
                      onClick={() => handleImageDelete(img.id)}
                      className={styles.deleteImageButton}
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
              
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "wearing")}
                  className={styles.fileInput}
                  id="wearing-upload"
                  disabled={uploading.wearing}
                />
                <label htmlFor="wearing-upload" className={styles.uploadButton}>
                  {uploading.wearing ? "업로드 중..." : "이미지 추가"}
                </label>
              </div>
            </div>
          </div>

          {/* 노드표 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>노드표</label>
            <div className={styles.imageUploadContainer}>
              {getImagesByType("NODE_CHART").map(img => (
                <div key={img.id} className={styles.imagePreviewContainer}>
                  <img 
                    src={img.url}
                    alt="노드표"
                    className={styles.imagePreview}
                  />
                  <button
                    type="button"
                    onClick={() => handleImageDelete(img.id)}
                    className={styles.deleteImageButton}
                  >
                    삭제
                  </button>
                </div>
              ))}
              
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "nodeChart")}
                  className={styles.fileInput}
                  id="nodeChart-upload"
                  disabled={uploading.nodeChart}
                />
                <label htmlFor="nodeChart-upload" className={styles.uploadButton}>
                  {uploading.nodeChart ? "업로드 중..." : "이미지 추가"}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>추가 정보</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>키워드 (쉼표로 구분)</label>
            <input
              type="text"
              name="keywords"
              value={formData.keywords}
              onChange={handleChange}
              className={styles.input}
              placeholder="예: 빨간 망토, 케이프, 키가 큼"
            />
            <p className={styles.hint}>검색에 도움이 되는 키워드를 쉼표로 구분하여 입력하세요.</p>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>설명</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={styles.textarea}
              rows="5"
              placeholder="영혼에 대한 설명을 입력하세요"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>제작자</label>
            <input
              type="text"
              name="creator"
              value={formData.creator}
              onChange={handleChange}
              className={styles.input}
              placeholder="제작자 이름"
            />
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