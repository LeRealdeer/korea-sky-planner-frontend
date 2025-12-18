"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import styles from "./page.module.css";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://korea-sky-planner-backend-production.up.railway.app';

export default function SoulCreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [seasons, setSeasons] = useState([]);
  const [error, setError] = useState(null);
  
  // 업로드된 이미지들 (미리보기용)
  const [uploadedImages, setUploadedImages] = useState({
    representative: [],
    location: [],
    wearing: [],
    nodeChart: [],
  });

  const [uploading, setUploading] = useState({
    representative: false,
    location: false,
    wearing: false,
    nodeChart: false,
  });

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
  }, []);

  const fetchSeasons = async () => {
    setLoading(true);
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

  // ✅ 이미지 업로드 - 임시 저장 (soulId 없이)
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

      console.log("🔼 이미지 업로드 시작:", imageType);

      const response = await fetch(`${BASE_URL}/api/v1/images/upload`, {
        method: "POST",
        body: formDataUpload,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "이미지 업로드에 실패했습니다.");
      }

      const data = await response.json();
      const uploadedImage = data.data;

      console.log("✅ 업로드 성공:", uploadedImage);

      // ⭐ 미리보기를 위해 state에 추가
      setUploadedImages(prev => ({
        ...prev,
        [imageType]: [...prev[imageType], {
          id: uploadedImage.id,
          url: uploadedImage.url,
          fileName: uploadedImage.fileName,
          imageType: uploadedImage.imageType
        }]
      }));

      alert(`${getImageTypeLabel(imageType)} 이미지가 업로드되었습니다!`);
    } catch (err) {
      console.error("❌ 업로드 실패:", err);
      alert(`이미지 업로드 실패: ${err.message}`);
    } finally {
      setUploading(prev => ({ ...prev, [imageType]: false }));
    }
  };

  // ✅ 이미지 삭제
  const handleImageDelete = async (imageId, imageType) => {
    if (!confirm("이미지를 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`${BASE_URL}/api/v1/images/${imageId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("이미지 삭제에 실패했습니다.");

      // state에서 제거
      setUploadedImages(prev => ({
        ...prev,
        [imageType]: prev[imageType].filter(img => img.id !== imageId)
      }));

      alert("이미지가 삭제되었습니다.");
    } catch (err) {
      alert(`이미지 삭제 실패: ${err.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1️⃣ 영혼 생성
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
      };

      console.log("🔼 영혼 생성 시작:", payload);

      const createResponse = await fetch(`${BASE_URL}/api/v1/souls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.error?.message || "영혼 생성에 실패했습니다.");
      }

      const createData = await createResponse.json();
      const createdSoul = createData.data;
      console.log("✅ 영혼 생성 성공:", createdSoul);

      // 2️⃣ 업로드된 이미지들을 영혼에 연결
      const allImages = [
        ...uploadedImages.representative,
        ...uploadedImages.location,
        ...uploadedImages.wearing,
        ...uploadedImages.nodeChart,
      ];

      console.log("🔗 이미지 연결 시작:", allImages);

      for (const image of allImages) {
        const connectResponse = await fetch(`${BASE_URL}/api/v1/images/${image.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ soulId: createdSoul.id }),
        });

        if (!connectResponse.ok) {
          console.error(`❌ 이미지 연결 실패: ${image.id}`);
        } else {
          console.log(`✅ 이미지 연결 성공: ${image.id}`);
        }
      }

      alert("영혼이 성공적으로 생성되었습니다!");
      router.push(`/sky/SeasonDictionary/souls/${createdSoul.id}`);
    } catch (err) {
      setError(err.message);
      alert(`생성 실패: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getImageTypeLabel = (type) => {
    const types = {
      representative: "대표 이미지",
      location: "위치 이미지",
      wearing: "착용샷",
      nodeChart: "노드표",
    };
    return types[type] || type;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>영혼 생성</h1>
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

        {/* 이미지 업로드 */}
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>이미지</h2>
          
          {/* 대표 이미지 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>대표 이미지</label>
            
            {/* ⭐ 업로드된 이미지 미리보기 */}
            {uploadedImages.representative.length > 0 && (
              <div className={styles.imagePreviewList}>
                {uploadedImages.representative.map(img => (
                  <div key={img.id} className={styles.imagePreviewContainer}>
                    <img 
                      src={img.url}
                      alt="대표 이미지"
                      className={styles.imagePreview}
                      onError={(e) => {
                        console.error("❌ 이미지 로드 실패:", img.url);
                        e.target.src = "/placeholder.png";
                      }}
                    />
                    <p className={styles.imageFileName}>{img.fileName}</p>
                    <button
                      type="button"
                      onClick={() => handleImageDelete(img.id, "representative")}
                      className={styles.deleteImageButton}
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}
            
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

          {/* 위치 이미지 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>위치 이미지</label>
            
            {uploadedImages.location.length > 0 && (
              <div className={styles.imagePreviewList}>
                {uploadedImages.location.map(img => (
                  <div key={img.id} className={styles.imagePreviewContainer}>
                    <img 
                      src={img.url}
                      alt="위치 이미지"
                      className={styles.imagePreview}
                      onError={(e) => {
                        console.error("❌ 이미지 로드 실패:", img.url);
                        e.target.src = "/placeholder.png";
                      }}
                    />
                    <p className={styles.imageFileName}>{img.fileName}</p>
                    <button
                      type="button"
                      onClick={() => handleImageDelete(img.id, "location")}
                      className={styles.deleteImageButton}
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}
            
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

          {/* 착용샷 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>착용샷 (여러 개 가능)</label>
            
            {uploadedImages.wearing.length > 0 && (
              <div className={styles.imagePreviewList}>
                {uploadedImages.wearing.map(img => (
                  <div key={img.id} className={styles.imagePreviewContainer}>
                    <img 
                      src={img.url}
                      alt="착용샷"
                      className={styles.imagePreview}
                      onError={(e) => {
                        console.error("❌ 이미지 로드 실패:", img.url);
                        e.target.src = "/placeholder.png";
                      }}
                    />
                    <p className={styles.imageFileName}>{img.fileName}</p>
                    <button
                      type="button"
                      onClick={() => handleImageDelete(img.id, "wearing")}
                      className={styles.deleteImageButton}
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}
            
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

          {/* 노드표 */}
          <div className={styles.formGroup}>
            <label className={styles.label}>노드표</label>
            
            {uploadedImages.nodeChart.length > 0 && (
              <div className={styles.imagePreviewList}>
                {uploadedImages.nodeChart.map(img => (
                  <div key={img.id} className={styles.imagePreviewContainer}>
                    <img 
                      src={img.url}
                      alt="노드표"
                      className={styles.imagePreview}
                      onError={(e) => {
                        console.error("❌ 이미지 로드 실패:", img.url);
                        e.target.src = "/placeholder.png";
                      }}
                    />
                    <p className={styles.imageFileName}>{img.fileName}</p>
                    <button
                      type="button"
                      onClick={() => handleImageDelete(img.id, "nodeChart")}
                      className={styles.deleteImageButton}
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            )}
            
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
              placeholder="영혼에 대한 설명"
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
            disabled={loading}
          >
            {loading ? "생성 중..." : "생성하기"}
          </button>
        </div>
      </form>
    </div>
  );
}