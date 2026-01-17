// src/app/sky/Images/upload/page.js
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import styles from "./page.module.css";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://korea-sky-planner-backend-production.up.railway.app';

export default function ImageUploadPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [souls, setSouls] = useState([]);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState([]); // 여러 파일 저장

  const [formData, setFormData] = useState({
    soulId: "",
    imageType: "REPRESENTATIVE",
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
    const selectedFiles = Array.from(e.target.files);
    
    // 파일 크기 및 타입 검증
    const validFiles = selectedFiles.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name}는 10MB를 초과하여 제외되었습니다.`);
        return false;
      }
      if (!file.type.startsWith("image/")) {
        alert(`${file.name}는 이미지 파일이 아니어서 제외되었습니다.`);
        return false;
      }
      return true;
    });

    // 미리보기 URL 생성
    const filesWithPreview = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setFiles(filesWithPreview);
  };

  const removeFile = (index) => {
    setFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview); // 메모리 해제
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (files.length === 0) {
      alert("파일을 선택해주세요.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      let successCount = 0;
      let failCount = 0;

      // 각 파일을 순차적으로 업로드
      for (let i = 0; i < files.length; i++) {
        const { file } = files[i];
        
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        uploadFormData.append("imageType", formData.imageType);

        // soulId가 있으면 영혼 연결, 없으면 임시 업로드
        let url = `${BASE_URL}/api/v1/images/upload`;
        if (formData.soulId) {
          url = `${BASE_URL}/api/v1/images`;
          uploadFormData.append("soulId", formData.soulId);
        }

        try {
          const response = await fetch(url, {
            method: "POST",
            body: uploadFormData,
          });

          if (response.ok) {
            successCount++;
          } else {
            failCount++;
            console.error(`${file.name} 업로드 실패`);
          }
        } catch (err) {
          failCount++;
          console.error(`${file.name} 업로드 오류:`, err);
        }
      }

      if (successCount > 0) {
        alert(`${successCount}개의 이미지가 성공적으로 업로드되었습니다!${failCount > 0 ? `\n(${failCount}개 실패)` : ''}`);
        router.push("/sky/SeasonDictionary/Images");
      } else {
        throw new Error("모든 이미지 업로드에 실패했습니다.");
      }
    } catch (err) {
      setError(err.message);
      alert(`업로드 실패: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // 컴포넌트 언마운트 시 메모리 해제
  useEffect(() => {
    return () => {
      files.forEach(({ preview }) => URL.revokeObjectURL(preview));
    };
  }, []);

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
            <label className={styles.label}>이미지 파일 * (여러 개 선택 가능)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={styles.fileInput}
              id="file-upload"
              multiple // 다중 선택 가능
              required
            />
            <label htmlFor="file-upload" className={styles.fileLabel}>
              📁 파일 선택 (여러 개 가능)
            </label>
            <p className={styles.hint}>최대 10MB, 이미지 파일만 가능 · 여러 개 동시 선택 가능</p>

            {/* 선택된 파일 미리보기 */}
            {files.length > 0 && (
              <div className={styles.previewGrid}>
                <div className={styles.previewHeader}>
                  선택된 파일: {files.length}개
                </div>
                {files.map(({ file, preview }, index) => (
                  <div key={index} className={styles.previewItem}>
                    <img src={preview} alt={`미리보기 ${index + 1}`} className={styles.preview} />
                    <div className={styles.previewInfo}>
                      <span className={styles.fileName}>{file.name}</span>
                      <span className={styles.fileSize}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className={styles.removeButton}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.formActions}>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={uploading || files.length === 0}
          >
            {uploading ? `업로드 중... (${files.length}개)` : `${files.length}개 이미지 업로드`}
          </button>
        </div>
      </form>
    </div>
  );
}