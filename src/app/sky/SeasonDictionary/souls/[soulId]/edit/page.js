"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import LoadingSpinner from "../../../../../components/LoadingSpinner";
import { seasonColors } from "../../../../../constants/seasonColors";
import styles from "./page.module.css";

const BASE_URL = "";

export default function SoulEditPage() {
  const params = useParams();
  const router = useRouter();
  const soulId = params.soulId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
const [uploading, setUploading] = useState({
  representative: false,
  location: false,  // 추가!
  wearing: false,
  nodeChart: false,
});

const [previewImages, setPreviewImages] = useState({
  representative: null,
  location: null,  // 추가!
  wearing: null,
  nodeChart: null,
});
  const [error, setError] = useState(null);
  const [seasons, setSeasons] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    seasonId: "",
    location: "",
    orderNum: "",
    isSeasonGuide: false,
    keywords: "",
    description: "",
    creator: "",
    representativeImageUrl: "",
    wearingImageUrl: "",
    nodeChartImageUrl: "",
  });


  const [originalImageUrls, setOriginalImageUrls] = useState({
    representative: "",
    wearing: "",
    nodeChart: "",
  });

  useEffect(() => {
    fetchData();
  }, [soulId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 시즌 목록 가져오기
      const seasonsResponse = await fetch(`${BASE_URL}/api/v1/seasons`);
      if (seasonsResponse.ok) {
        const seasonsData = await seasonsResponse.json();
        setSeasons(seasonsData.data || []);
      }

      // 영혼 정보 가져오기
      const soulResponse = await fetch(`${BASE_URL}/api/v1/souls/${soulId}`);
      if (!soulResponse.ok) throw new Error("영혼 정보를 불러올 수 없습니다.");
      
      const soulData = await soulResponse.json();
      const soul = soulData.data;

      const representativeImage = soul.images?.find(img => img.imageType === "REPRESENTATIVE");
      const wearingImage = soul.images?.find(img => img.imageType === "WEARING");
      const nodeChartImage = soul.images?.find(img => img.imageType === "NODE_CHART");

      const repUrl = representativeImage?.url || "";
      const wearUrl = wearingImage?.url || "";
      const nodeUrl = nodeChartImage?.url || "";

      setFormData({
        name: soul.name || "",
        seasonId: soul.seasonId || "",
        location: soul.location || "",
        orderNum: soul.orderNum || "",
        isSeasonGuide: soul.isSeasonGuide || false,
        keywords: soul.keywords ? soul.keywords.join(", ") : "",
        description: soul.description || "",
        creator: soul.creator || "",
        representativeImageUrl: repUrl,
        wearingImageUrl: wearUrl,
        nodeChartImageUrl: nodeUrl,
      });

      setOriginalImageUrls({
        representative: repUrl,
        wearing: wearUrl,
        nodeChart: nodeUrl,
      });

      setPreviewImages({
        representative: repUrl,
        wearing: wearUrl,
        nodeChart: nodeUrl,
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

  const handleImageUpload = async (e, imageType) => {
    const file = e.target.files[0];
    if (!file) return;

    // 파일 크기 체크 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("파일 크기는 10MB를 초과할 수 없습니다.");
      return;
    }

    // 이미지 파일 체크
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

      if (!response.ok) throw new Error("이미지 업로드에 실패했습니다.");

      const data = await response.json();
      const imageUrl = data.data.url;

      // 기존 이미지가 있고, 원본 이미지와 다르면 삭제
      const oldUrl = formData[`${imageType}ImageUrl`];
      if (oldUrl && oldUrl !== originalImageUrls[imageType]) {
        try {
          await fetch(`${BASE_URL}/api/v1/images`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: oldUrl }),
          });
        } catch (err) {
          console.error("기존 이미지 삭제 실패:", err);
        }
      }

      // URL 업데이트
      setFormData(prev => ({
        ...prev,
        [`${imageType}ImageUrl`]: imageUrl
      }));

      // 미리보기 업데이트
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages(prev => ({
          ...prev,
          [imageType]: reader.result
        }));
      };
      reader.readAsDataURL(file);

    } catch (err) {
      alert(`이미지 업로드 실패: ${err.message}`);
    } finally {
      setUploading(prev => ({ ...prev, [imageType]: false }));
    }
  };

  const handleImageDelete = async (imageType) => {
    const imageUrl = formData[`${imageType}ImageUrl`];
    if (!imageUrl) return;

    if (!confirm("이미지를 삭제하시겠습니까?")) return;

    try {
      // 원본 이미지가 아닌 경우에만 서버에서 삭제
      if (imageUrl !== originalImageUrls[imageType]) {
        const response = await fetch(`${BASE_URL}/api/v1/images`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: imageUrl }),
        });

        if (!response.ok) throw new Error("이미지 삭제에 실패했습니다.");
      }

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
      const payload = {
        name: formData.name,
        seasonId: parseInt(formData.seasonId),
        location: formData.location,
        orderNum: parseInt(formData.orderNum),
        isSeasonGuide: formData.isSeasonGuide,
        keywords: formData.keywords.split(",").map(k => k.trim()).filter(k => k),
        description: formData.description,
        creator: formData.creator,
        images: [
          { imageType: "REPRESENTATIVE", url: formData.representativeImageUrl },
          { imageType: "WEARING", url: formData.wearingImageUrl },
          { imageType: "NODE_CHART", url: formData.nodeChartImageUrl },
        ].filter(img => img.url),
      };

      const response = await fetch(`${BASE_URL}/api/v1/souls/${soulId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("영혼 수정에 실패했습니다.");

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

  if (loading) return <LoadingSpinner />;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>영혼 수정하기</h1>
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
            <label className={styles.label}>영혼 이름 *</label>
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
            <label className={styles.label}>위치</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={styles.input}
              placeholder="예: 초원 - 나비 평원"
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
              
              {previewImages.representative && (
                <div className={styles.imagePreviewContainer}>
                  <img 
                    src={previewImages.representative}
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
            <p className={styles.hint}>영혼의 메인 이미지를 업로드하세요. (최대 10MB)</p>
          </div>

          {/* 착용샷 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>착용샷</label>
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
                {uploading.wearing ? "업로드 중..." : "이미지 선택"}
              </label>
              
              {previewImages.wearing && (
                <div className={styles.imagePreviewContainer}>
                  <img 
                    src={previewImages.wearing}
                    alt="착용샷 미리보기"
                    className={styles.imagePreview}
                  />
                  <button
                    type="button"
                    onClick={() => handleImageDelete("wearing")}
                    className={styles.deleteImageButton}
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>
            <p className={styles.hint}>아이템을 착용한 모습의 이미지를 업로드하세요.</p>
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
    
    {previewImages.location && (
      <div className={styles.imagePreviewContainer}>
        <img 
          src={previewImages.location}
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
  <p className={styles.hint}>영혼의 위치를 보여주는 이미지를 업로드하세요.</p>
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
              
              {previewImages.nodeChart && (
                <div className={styles.imagePreviewContainer}>
                  <img 
                    src={previewImages.nodeChart}
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
            <p className={styles.hint}>영혼의 노드 트리 이미지를 업로드하세요.</p>
          </div>
        </div>

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