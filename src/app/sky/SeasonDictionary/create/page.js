"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../../../components/LoadingSpinner";
import { seasonColors } from "../../../constants/seasonColors";
import styles from "./page.module.css";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://korea-sky-planner-backend-production.up.railway.app';

export default function SoulCreatePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({
    representative: false,
    location: false,
    wearing: false,
    nodeChart: false,
  });

  const [previewImages, setPreviewImages] = useState({
    representative: null,
    location: null,
    wearing: [],
    nodeChart: null,
  });
  
  const [error, setError] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [travelingVisits, setTravelingVisits] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    seasonId: "",
    orderNum: "",
    isSeasonGuide: false,
    keywords: "",
    description: "",
    creator: "",
    representativeImageUrl: "",
    locationImageUrl: "",
    wearingImageUrls: [],
    nodeChartImageUrl: "",
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const addTravelingVisit = () => {
    setTravelingVisits([...travelingVisits, {
      visitNumber: travelingVisits.length + 1,
      startDate: '',
      endDate: '',
      isWarbandVisit: false
    }]);
  };

  const removeTravelingVisit = (index) => {
    const updated = travelingVisits.filter((_, i) => i !== index);
    const reordered = updated.map((visit, idx) => ({
      ...visit,
      visitNumber: idx + 1
    }));
    setTravelingVisits(reordered);
  };

  const handleVisitChange = (index, field, value) => {
    const updated = [...travelingVisits];
    updated[index] = { ...updated[index], [field]: value };
    setTravelingVisits(updated);
  };

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

      if (imageType === "wearing") {
        setFormData(prev => ({
          ...prev,
          wearingImageUrls: [...prev.wearingImageUrls, imageUrl]
        }));
        setPreviewImages(prev => ({
          ...prev,
          wearing: [...prev.wearing, imageUrl]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [`${imageType}ImageUrl`]: imageUrl
        }));
        setPreviewImages(prev => ({
          ...prev,
          [imageType]: imageUrl
        }));
      }

      alert('이미지가 업로드되었습니다!');

    } catch (err) {
      alert(`이미지 업로드 실패: ${err.message}`);
    } finally {
      setUploading(prev => ({ ...prev, [imageType]: false }));
    }
  };

  const handleImageDelete = async (imageType, index = null) => {
    if (imageType === "wearing" && index !== null) {
      const imageUrl = formData.wearingImageUrls[index];
      if (!imageUrl) return;

      if (!confirm("이미지를 삭제하시겠습니까?")) return;

      try {
        const response = await fetch(`${BASE_URL}/api/v1/images`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: imageUrl }),
        });

        if (!response.ok) throw new Error("이미지 삭제에 실패했습니다.");

        setFormData(prev => ({
          ...prev,
          wearingImageUrls: prev.wearingImageUrls.filter((_, i) => i !== index)
        }));

        setPreviewImages(prev => ({
          ...prev,
          wearing: prev.wearing.filter((_, i) => i !== index)
        }));

        alert("이미지가 삭제되었습니다.");
      } catch (err) {
        alert(`이미지 삭제 실패: ${err.message}`);
      }
      return;
    }

    const imageUrl = formData[`${imageType}ImageUrl`];
    if (!imageUrl) return;

    if (!confirm("이미지를 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`${BASE_URL}/api/v1/images`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: imageUrl }),
      });

      if (!response.ok) throw new Error("이미지 삭제에 실패했습니다.");

      setFormData(prev => ({
        ...prev,
        [`${imageType}ImageUrl`]: ""
      }));

      setPreviewImages(prev => ({
        ...prev,
        [imageType]: null
      }));

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
        keywords: formData.keywords.split(",").map(k => k.trim()).filter(k => k),
        description: formData.description,
        creator: formData.creator,
        startDate: selectedSeason.startDate,
        endDate: selectedSeason.endDate,
        images: [
          formData.representativeImageUrl && { imageType: "REPRESENTATIVE", url: formData.representativeImageUrl },
          formData.locationImageUrl && { imageType: "LOCATION", url: formData.locationImageUrl },
          ...formData.wearingImageUrls.map(url => ({ imageType: "WEARING", url })),
          formData.nodeChartImageUrl && { imageType: "NODE_CHART", url: formData.nodeChartImageUrl },
        ].filter(Boolean),
      };

      const response = await fetch(`${BASE_URL}/api/v1/souls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "영혼 생성에 실패했습니다.");
      }

      const result = await response.json();
      const createdSoulId = result.data.id;

      // 유랑 기록 저장
      if (travelingVisits.length > 0) {
        for (const visit of travelingVisits) {
          try {
            const visitPayload = {
              soulId: createdSoulId,
              visitNumber: visit.visitNumber,
              startDate: visit.startDate,
              endDate: visit.endDate,
              isWarbandVisit: visit.isWarbandVisit || false
            };

            await fetch(`${BASE_URL}/api/v1/visits`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(visitPayload),
            });
          } catch (visitErr) {
            console.error('유랑 기록 저장 실패:', visitErr);
          }
        }
      }

      alert("영혼이 성공적으로 생성되었습니다!");
      router.push(`/sky/SeasonDictionary/souls/${createdSoulId}`);
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
        <h1 className={styles.title}>새 영혼 만들기</h1>
        <button onClick={() => router.back()} className={styles.cancelButton}>
          취소
        </button>
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

        {/* 이미지 */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>이미지</h2>
          
          {/* 대표 이미지 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>대표 이미지</label>
            <div className={styles.imageUploadContainer}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "representative")}
                className={styles.fileInput}
                id="representative-upload"
                disabled={uploading.representative}
              />
              <label htmlFor="representative-upload" className={styles.uploadButton}>
                {uploading.representative ? "업로드 중..." : "이미지 선택"}
              </label>
              
              {(previewImages.representative || formData.representativeImageUrl) && (
                <div className={styles.imagePreviewContainer}>
                  <img 
                    src={previewImages.representative || formData.representativeImageUrl}
                    alt="대표 이미지 미리보기"
                    className={styles.imagePreview}
                  />
                  <button
                    type="button"
                    onClick={() => handleImageDelete("representative")}
                    className={styles.deleteImageButton}
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 위치 이미지 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>위치 이미지</label>
            <div className={styles.imageUploadContainer}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "location")}
                className={styles.fileInput}
                id="location-upload"
                disabled={uploading.location}
              />
              <label htmlFor="location-upload" className={styles.uploadButton}>
                {uploading.location ? "업로드 중..." : "이미지 선택"}
              </label>
              
              {(previewImages.location || formData.locationImageUrl) && (
                <div className={styles.imagePreviewContainer}>
                  <img 
                    src={previewImages.location || formData.locationImageUrl}
                    alt="위치 이미지 미리보기"
                    className={styles.imagePreview}
                  />
                  <button
                    type="button"
                    onClick={() => handleImageDelete("location")}
                    className={styles.deleteImageButton}
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 착용샷 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>착용샷 (여러 개 가능)</label>
            <div className={styles.imageUploadContainer}>
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
              
              {previewImages.wearing.length > 0 && (
                <div className={styles.multipleImagesContainer}>
                  {previewImages.wearing.map((img, index) => (
                    <div key={index} className={styles.imagePreviewContainer}>
                      <img 
                        src={img}
                        alt={`착용샷 ${index + 1}`}
                        className={styles.imagePreview}
                      />
                      <button
                        type="button"
                        onClick={() => handleImageDelete("wearing", index)}
                        className={styles.deleteImageButton}
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 노드표 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>노드표</label>
            <div className={styles.imageUploadContainer}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "nodeChart")}
                className={styles.fileInput}
                id="nodeChart-upload"
                disabled={uploading.nodeChart}
              />
              <label htmlFor="nodeChart-upload" className={styles.uploadButton}>
                {uploading.nodeChart ? "업로드 중..." : "이미지 선택"}
              </label>
              
              {(previewImages.nodeChart || formData.nodeChartImageUrl) && (
                <div className={styles.imagePreviewContainer}>
                  <img 
                    src={previewImages.nodeChart || formData.nodeChartImageUrl}
                    alt="노드표 미리보기"
                    className={styles.imagePreview}
                  />
                  <button
                    type="button"
                    onClick={() => handleImageDelete("nodeChart")}
                    className={styles.deleteImageButton}
                  >
                    삭제
                  </button>
                </div>
              )}
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

        {/* 유랑 기록 */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>유랑 기록</h2>
          
          <button
            type="button"
            onClick={addTravelingVisit}
            className={styles.addVisitButton}
          >
            + 유랑 기록 추가
          </button>

          {travelingVisits.length > 0 && (
            <div className={styles.visitsList}>
              {travelingVisits.map((visit, index) => (
                <div key={index} className={styles.visitItem}>
                  <div className={styles.visitHeader}>
                    <span className={styles.visitNumber}>{visit.visitNumber}차 유랑</span>
                    <button
                      type="button"
                      onClick={() => removeTravelingVisit(index)}
                      className={styles.removeVisitButton}
                    >
                      삭제
                    </button>
                  </div>

                  <div className={styles.visitGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>시작일 *</label>
                      <input
                        type="date"
                        value={visit.startDate}
                        onChange={(e) => handleVisitChange(index, 'startDate', e.target.value)}
                        className={styles.input}
                        required={travelingVisits.length > 0}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>종료일 *</label>
                      <input
                        type="date"
                        value={visit.endDate}
                        onChange={(e) => handleVisitChange(index, 'endDate', e.target.value)}
                        className={styles.input}
                        required={travelingVisits.length > 0}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={visit.isWarbandVisit}
                          onChange={(e) => handleVisitChange(index, 'isWarbandVisit', e.target.checked)}
                          className={styles.checkbox}
                        />
                        유랑단 방문
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.formActions}>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={saving}
          >
            {saving ? "생성 중..." : "영혼 만들기"}
          </button>
        </div>
      </form>
    </div>
  );
}