"use client";
import React from 'react';
import { theme } from '../styles/theme';

const MAX = 28;
const MARKERS = [4, 10, 18, 28];

export function AffinityBar({ currentAffinity = 0, futureCompanionAffinity = 0, plannedItemAffinity = 0 }) {
  const cur = Math.min(currentAffinity, MAX);
  const comp = Math.min(futureCompanionAffinity, Math.max(0, MAX - cur));
  const planned = Math.min(plannedItemAffinity, Math.max(0, MAX - cur - comp));

  const pct = (v) => `${(v / MAX) * 100}%`;

  const projectedTotal = Math.min(cur + comp + planned, MAX);

  return (
    <div style={{ width: '100%', marginTop: '6px', marginBottom: '4px' }}>
      {/* 바 */}
      <div style={{
        position: 'relative', height: '12px', borderRadius: '6px',
        background: theme.colors.barBg, overflow: 'visible'
      }}>
        {/* 현재 호감도 (green) */}
        {cur > 0 && (
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: pct(cur), background: theme.colors.affinity,
            borderRadius: '6px 0 0 6px'
          }} />
        )}
        {/* 앞으로 동행 (orange) */}
        {comp > 0 && (
          <div style={{
            position: 'absolute', left: pct(cur), top: 0, bottom: 0,
            width: pct(comp), background: theme.colors.companion
          }} />
        )}
        {/* 구매 예정 (blue) */}
        {planned > 0 && (
          <div style={{
            position: 'absolute', left: pct(cur + comp), top: 0, bottom: 0,
            width: pct(planned),
            background: theme.colors.planned,
            borderRadius: (cur + comp + planned >= MAX) ? '0 6px 6px 0' : '0'
          }} />
        )}
        {/* 마커 삼각형들 */}
        {MARKERS.map(m => (
          <div key={m} style={{
            position: 'absolute',
            left: `calc(${pct(m)} - 1px)`,
            top: 0, bottom: 0, width: '2px',
            background: 'rgba(255,255,255,0.7)'
          }} />
        ))}
      </div>

      {/* 마커 라벨 */}
      <div style={{ position: 'relative', height: '14px', marginTop: '2px' }}>
        {MARKERS.map(m => (
          <span key={m} style={{
            position: 'absolute',
            left: `calc(${pct(m)} - 6px)`,
            fontSize: '9px', color: theme.colors.textLight,
            transform: 'translateX(-50%)'
          }}>
            {m}
          </span>
        ))}
      </div>

      {/* 레전드 */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
        {cur > 0 && (
          <LegendDot color={theme.colors.affinity} label={`현재 ${+cur.toFixed(2)}점`} />
        )}
        {comp > 0 && (
          <LegendDot color={theme.colors.companion} label={`동행 +${+comp.toFixed(2)}점`} />
        )}
        {planned > 0 && (
          <LegendDot color={theme.colors.planned} label={`구매 +${+planned.toFixed(2)}점`} />
        )}
        <span style={{ fontSize: '10px', color: theme.colors.textLight, marginLeft: 'auto' }}>
          → {+projectedTotal.toFixed(2)}점
        </span>
      </div>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span style={{ fontSize: '10px', color: theme.colors.textLight }}>{label}</span>
    </div>
  );
}
