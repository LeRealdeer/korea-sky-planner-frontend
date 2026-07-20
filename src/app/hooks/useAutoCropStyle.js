// src/app/hooks/useAutoCropStyle.js
"use client";

import { useEffect, useState } from "react";

// 캐릭터가 박스 안에서 균일한 크기로 보이도록, 이미지마다 캔버스로 실제
// 캐릭터(투명/배경이 아닌 픽셀)의 바운딩 박스를 찾아 그 부분만 확대/크롭하는 훅.
// 원본 이미지마다 캐릭터 주변 여백이 제각각이라 object-fit만으로는 크기를 맞출 수 없어서 필요함.

const TARGET_FRAC = 0.86;   // 바운딩 박스가 박스의 몇 %를 채울지
const SAMPLE_SIZE = 120;    // 판별용 축소 캔버스 한 변 크기(성능용)
const BG_ALPHA_THRESHOLD = 12;
const BG_COLOR_DELTA = 20;
const MIN_CONTENT_FRAC = 0.03; // 이보다 작은 바운딩 박스는 노이즈로 간주
const MAX_SCALE = 6;

const styleCache = new Map();  // url -> style object | null
const inFlight = new Map();    // url -> Promise<style|null>

function detectBoundingBox(data, w, h) {
  let hasAlpha = false;
  for (let i = 3; i < data.length; i += 4 * 23) {
    if (data[i] < 250) { hasAlpha = true; break; }
  }

  let bgR = 255, bgG = 255, bgB = 255;
  if (!hasAlpha) {
    const corners = [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1]];
    let r = 0, g = 0, b = 0;
    corners.forEach(([x, y]) => {
      const idx = (y * w + x) * 4;
      r += data[idx]; g += data[idx + 1]; b += data[idx + 2];
    });
    bgR = r / 4; bgG = g / 4; bgB = b / 4;
  }

  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      let isForeground;
      if (hasAlpha) {
        isForeground = data[idx + 3] > BG_ALPHA_THRESHOLD;
      } else {
        const dr = data[idx] - bgR, dg = data[idx + 1] - bgG, db = data[idx + 2] - bgB;
        isForeground = Math.sqrt(dr * dr + dg * dg + db * db) > BG_COLOR_DELTA;
      }
      if (isForeground) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) return null;
  const bw = maxX - minX + 1, bh = maxY - minY + 1;
  if (bw < w * MIN_CONTENT_FRAC || bh < h * MIN_CONTENT_FRAC) return null;
  return { minX, minY, maxX, maxY, bw, bh };
}

// box 한 변을 1로 두고, 캐릭터 바운딩 박스가 TARGET_FRAC을 채우도록
// (그리고 최소한 box를 완전히 덮도록) 확대·이동한 절대좌표 스타일을 계산
function computeCropStyle(bbox, w, h) {
  const cx = (bbox.minX + bbox.maxX + 1) / 2;
  const cy = (bbox.minY + bbox.maxY + 1) / 2;

  const fitScale = TARGET_FRAC / Math.max(bbox.bw, bbox.bh);
  const coverScale = 1 / Math.min(w, h);
  const scale = Math.min(MAX_SCALE, Math.max(fitScale, coverScale));

  const renderedW = scale * w;
  const renderedH = scale * h;
  const left = 0.5 - (cx / w) * renderedW;
  const top = 0.5 - (cy / h) * renderedH;

  return {
    position: "absolute",
    left: `${left * 100}%`,
    top: `${top * 100}%`,
    width: `${renderedW * 100}%`,
    height: `${renderedH * 100}%`,
    maxWidth: "none",
    objectFit: "fill",
  };
}

function loadAndCompute(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const scale = Math.min(1, SAMPLE_SIZE / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.max(1, Math.round(img.naturalWidth * scale));
        const h = Math.max(1, Math.round(img.naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, w, h);
        const { data } = ctx.getImageData(0, 0, w, h);
        const bbox = detectBoundingBox(data, w, h);
        resolve(bbox ? computeCropStyle(bbox, w, h) : null);
      } catch {
        resolve(null); // CORS 등으로 픽셀 판독 실패 시 크롭 없이 기본 표시로 폴백
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// 반환값을 그대로 <img style={...}> 에 꽂으면 됨. null이면 아직 계산 중이거나 크롭 불가 → 기본 표시 유지.
export function useAutoCropStyle(url) {
  const [style, setStyle] = useState(() => (url ? styleCache.get(url) ?? null : null));

  useEffect(() => {
    if (!url) { setStyle(null); return; }
    if (styleCache.has(url)) { setStyle(styleCache.get(url)); return; }

    let cancelled = false;
    if (!inFlight.has(url)) inFlight.set(url, loadAndCompute(url));

    inFlight.get(url).then((result) => {
      styleCache.set(url, result);
      inFlight.delete(url);
      if (!cancelled) setStyle(result);
    });

    return () => { cancelled = true; };
  }, [url]);

  return style;
}
