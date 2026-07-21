"use client";
import React, { useState } from 'react';
import { theme, translations } from '../styles/theme';
import { LevelRow } from './LevelRow';
import { AffinityBar } from './AffinityBar';

export function SpiritCard({
  spirit,
  spiritState = {},
  spiritResult = {},
  onSetNodeState,
  onClearSpirit,
  onSelectAll,
  onChangePastDays,
  onChangeFutureDays,
  language,
  simple = false
}) {
  const t = translations[language];
  const isKo = language === 'ko';
  const [brushState, setBrushState] = useState('planned');
  const { pastCompanionDays = 0, futureCompanionDays = 0, nodeStates = {} } = spiritState;

  const BRUSH_OPTIONS = [
    { value: 'planned', label: { ko: '예정', en: 'Planned' }, color: theme.colors.planned },
    { value: 'owned',   label: { ko: '보유', en: 'Owned' },   color: theme.colors.affinity }
  ];

  const {
    currentAffinity = 0,
    projectedAffinity = 0,
    currentLevel = 1,
    projectedLevel = 1,
    plannedItemAffinity = 0,
    lockedPlannedNodes = []
  } = spiritResult;

  const lockedNodeIds = simple ? new Set() : new Set(lockedPlannedNodes.map(l => l.node.id));
  const spiritName = typeof spirit.name === 'object' ? spirit.name[language] : spirit.name;

  // 5단계가 위, 1단계가 아래
  const sortedLevels = [...spirit.levels].sort((a, b) => b.level - a.level);

  return (
    <div style={{
      border: `2px solid ${theme.colors.border}`,
      borderRadius: '12px', padding: '14px',
      background: theme.colors.white,
      width: '100%', boxSizing: 'border-box',
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
    }}>
      {/* 영혼 이미지 */}
      <div style={{
        width: '100%', height: '80px',
        background: theme.colors.background, borderRadius: '8px',
        marginBottom: '10px', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${theme.colors.border}`
      }}>
        <img
          src={`/sky/calculator/s${spirit.id}.webp`}
          alt={spiritName}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
        />
        <div style={{ fontSize: '12px', color: theme.colors.textLight, display: 'none' }}>{spiritName}</div>
      </div>

      {/* 영혼 이름 */}
      <div style={{
        fontSize: '13px', fontWeight: 'bold', textAlign: 'center',
        color: theme.colors.text, marginBottom: '10px'
      }}>
        {spiritName}
      </div>

      {/* 동행 입력 (풀 모드만) */}
      {!simple && (
        <div style={{
          display: 'flex', gap: '8px', marginBottom: '10px',
          background: '#F8FBFF', borderRadius: '8px', padding: '8px',
          border: `1px solid ${theme.colors.border}`
        }}>
          <CompanionInput
            label={t.pastCompanionDays}
            value={pastCompanionDays}
            unit={t.companionDayUnit}
            onChange={(v) => onChangePastDays?.(v)}
            color={theme.colors.affinity}
          />
          <div style={{ width: '1px', background: theme.colors.border, alignSelf: 'stretch' }} />
          <CompanionInput
            label={t.futureCompanionDays}
            value={futureCompanionDays}
            unit={t.companionDayUnit}
            onChange={(v) => onChangeFutureDays?.(v)}
            color={theme.colors.companion}
          />
        </div>
      )}

      {/* 호감도 현황 (풀 모드만) */}
      {!simple && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <AffinityChip
              label={t.currentAffinityLabel}
              value={`${currentAffinity.toFixed(1)}${t.points}`}
              level={currentLevel}
              color={theme.colors.affinity}
            />
            <AffinityChip
              label={t.projectedAffinityLabel}
              value={`${projectedAffinity.toFixed(1)}${t.points}`}
              level={projectedLevel}
              color={theme.colors.companion}
              right
            />
          </div>
          <AffinityBar
            currentAffinity={currentAffinity}
            futureCompanionAffinity={futureCompanionDays}
            plannedItemAffinity={plannedItemAffinity}
          />
        </>
      )}


      {/* 클릭 시 적용 브러시 (예정/보유) */}
      {!simple && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          margin: '8px 0 4px', padding: '6px 8px',
          background: '#F8FBFF', borderRadius: '8px', border: `1px solid ${theme.colors.border}`
        }}>
          <span style={{ fontSize: '11px', color: theme.colors.textLight, fontWeight: 'bold' }}>
            {isKo ? '클릭 시 적용' : 'Click sets to'}
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {BRUSH_OPTIONS.map(opt => {
              const selected = brushState === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setBrushState(opt.value)}
                  style={{
                    padding: '4px 12px', fontSize: '11px', fontWeight: selected ? 'bold' : 'normal',
                    borderRadius: '6px', cursor: 'pointer',
                    border: `1.5px solid ${opt.color}`,
                    background: selected ? opt.color : '#fff',
                    color: selected ? '#fff' : opt.color
                  }}
                >
                  {opt.label[isKo ? 'ko' : 'en']}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 전체 선택 / 초기화 */}
      <div style={{ display: 'flex', gap: '5px', margin: '8px 0 6px' }}>
        <button
          onClick={() => onSelectAll?.()}
          style={{
            flex: 1, padding: '5px 0', fontSize: '11px', fontWeight: 'bold',
            background: theme.colors.primary, color: '#fff',
            border: 'none', borderRadius: '8px', cursor: 'pointer',
            letterSpacing: '0.3px'
          }}
        >
          {language === 'ko' ? '전체 선택' : 'Select All'}
        </button>
        <button
          onClick={() => onClearSpirit?.()}
          style={{
            flex: 1, padding: '5px 0', fontSize: '11px', fontWeight: 'bold',
            background: '#F5F5F5', color: '#757575',
            border: '1px solid #E0E0E0', borderRadius: '8px', cursor: 'pointer',
            letterSpacing: '0.3px'
          }}
        >
          {t.clear}
        </button>
      </div>

      {/* 레벨 행: 5단계→1단계 순으로 렌더 (1단계가 맨 아래) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {sortedLevels.map((levelData, idx) => (
          <LevelRow
            key={levelData.level}
            levelData={levelData}
            spiritNodeStates={nodeStates}
            lockedNodeIds={lockedNodeIds}
            currentAffinity={simple ? 28 : currentAffinity}
            projectedAffinity={simple ? 28 : projectedAffinity}
            brushState={brushState}
            onSetNodeState={onSetNodeState}
            language={language}
            showDivider={idx < sortedLevels.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

function CompanionInput({ label, value, unit, onChange, color }) {
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontSize: '10px', color, fontWeight: 'bold', marginBottom: '3px' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
        <input
          type="number" min={0} max={28} value={value}
          onChange={(e) => onChange(Math.max(0, Math.min(28, Number(e.target.value) || 0)))}
          style={{
            width: '42px', padding: '3px 4px', textAlign: 'center',
            borderRadius: '5px', border: `1.5px solid ${color}`,
            fontSize: '13px', fontWeight: 'bold', color
          }}
        />
        <span style={{ fontSize: '10px', color: '#999' }}>{unit}</span>
      </div>
    </div>
  );
}

function AffinityChip({ label, value, level, color, right }) {
  return (
    <div style={{ textAlign: right ? 'right' : 'left' }}>
      <div style={{ color: '#999', fontSize: '10px', marginBottom: '1px' }}>{label}</div>
      <div style={{ color, fontWeight: 'bold', fontSize: '12px' }}>
        {value} <span style={{ fontSize: '10px', opacity: 0.8 }}>({level}단계)</span>
      </div>
    </div>
  );
}
