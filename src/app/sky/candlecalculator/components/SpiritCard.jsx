"use client";
import React from 'react';
import { theme, translations } from '../styles/theme';
import { LevelRow } from './LevelRow';
import { getAffinityLevel, getRequiredAffinity, computeAffinityFromOwned, MAX_AFFINITY, MAX_LEVEL } from '../lib/affinity';

export function SpiritCard({
  spirit, nodeStates, onToggleNode, onSelectAll, onClearAll,
  language, hasSeasonPass, isSimpleMode,
  companionDays, onChangeCompanionDays
}) {
  const t = translations[language];
  const days = companionDays ?? 0;

  // 보유 아이템에서 자동 계산된 호감도 + 동행 일수
  const ownedAffinity = computeAffinityFromOwned(spirit, nodeStates.owned);
  const currentAffinity = Math.min(ownedAffinity + days, MAX_AFFINITY);

  const currentLevel = getAffinityLevel(currentAffinity);
  const nextLevel = currentLevel < MAX_LEVEL ? currentLevel + 1 : null;
  const pointsToNext = nextLevel ? getRequiredAffinity(nextLevel) - currentAffinity : 0;

  // 선택된(목표) 양초만 합산해서 하단에 표시
  const selectedCandles = spirit.levels.reduce((sum, levelData) =>
    [...levelData.leftNodes, ...levelData.rightNodes].reduce((s, node) =>
      nodeStates.target.has(node.id) ? s + node.cost : s, sum), 0);

  const spiritImagePath = `/sky/calculator/s${spirit.id}.webp`;

  return (
    <div style={{
      border: `2px solid ${theme.colors.border}`,
      borderRadius: '12px',
      padding: '16px',
      background: theme.colors.white,
      width: '296px',
      boxSizing: 'border-box',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }}>
      {/* 영혼 이미지 */}
      <div style={{
        width: '100%', height: '90px',
        background: theme.colors.background, borderRadius: '8px', marginBottom: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${theme.colors.border}`, overflow: 'hidden'
      }}>
        <img
          src={spiritImagePath}
          alt={typeof spirit.name === 'object' ? spirit.name[language] : spirit.name}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
        />
        <div style={{ fontSize: '13px', color: theme.colors.textLight, display: 'none' }}>
          Spirit {spirit.id}
        </div>
      </div>

      {/* 영혼 이름 */}
      <div style={{
        fontSize: '13px', fontWeight: 'bold', marginBottom: '10px',
        textAlign: 'center', color: theme.colors.text, lineHeight: '1.3'
      }}>
        {typeof spirit.name === 'object' ? spirit.name[language] : spirit.name}
      </div>

      {/* 호감도 자동 계산 — 호감도 모드에서만 표시 */}
      {!isSimpleMode && (
        <div style={{
          marginBottom: '10px', padding: '8px 10px',
          background: '#F1F8E9', borderRadius: '8px',
          border: `1px solid ${theme.colors.affinity}33`, fontSize: '12px'
        }}>
          {/* 동행 일수 입력 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span style={{ color: theme.colors.affinity }}>🤝</span>
            <span style={{ color: theme.colors.text, fontSize: '11px' }}>
              {language === 'ko' ? '동행 일수' : 'Companion Days'}
            </span>
            <input
              type="number" min={0} max={28} value={days}
              onChange={(e) => {
                const v = Math.max(0, Math.min(28, Number(e.target.value) || 0));
                onChangeCompanionDays && onChangeCompanionDays(v);
              }}
              style={{
                width: '44px', padding: '2px 5px',
                borderRadius: '5px', border: `1.5px solid ${theme.colors.affinity}`,
                fontSize: '12px', textAlign: 'center'
              }}
            />
            <span style={{ color: theme.colors.textLight, fontSize: '11px' }}>
              {language === 'ko' ? '일' : 'days'}
            </span>
          </div>
          {/* 호감도 자동 계산 결과 */}
          <div style={{ fontSize: '10px', color: theme.colors.textLight, lineHeight: '1.6' }}>
            <span>
              {language === 'ko' ? '보유 아이템' : 'Owned items'}: {ownedAffinity.toFixed(1)}{t.points}
            </span>
            <span style={{ margin: '0 4px' }}>+</span>
            <span>
              {language === 'ko' ? '동행' : 'Companion'}: {days}{t.points}
            </span>
            <span style={{ margin: '0 4px' }}>=</span>
            <b style={{ color: theme.colors.affinity }}>
              {currentAffinity.toFixed(1)}{t.points} → {currentLevel}{language === 'ko' ? '단계' : 'Lv.'}
            </b>
          </div>
          <div style={{ fontSize: '10px', color: theme.colors.textLight, marginTop: '2px' }}>
            {nextLevel
              ? `${t.nextLevelIn}: ${pointsToNext.toFixed(1)}${t.points} (${nextLevel}${language === 'ko' ? '단계' : 'Lv.'})`
              : t.maxAffinity}
          </div>
        </div>
      )}

      {/* 전체선택 / 해제 */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
        <button
          onClick={() => onSelectAll(spirit)}
          style={{
            flex: 1, padding: '7px',
            background: theme.colors.primary, color: theme.colors.white,
            border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.target.style.background = theme.colors.primaryDark}
          onMouseLeave={(e) => e.target.style.background = theme.colors.primary}
        >
          {t.selectAll}
        </button>
        <button
          onClick={() => onClearAll(spirit)}
          style={{
            flex: 1, padding: '7px',
            background: theme.colors.white, color: theme.colors.primary,
            border: `2px solid ${theme.colors.primary}`, borderRadius: '6px',
            fontSize: '12px', fontWeight: 'bold', cursor: 'pointer'
          }}
          onMouseEnter={(e) => { e.target.style.background = theme.colors.primary; e.target.style.color = theme.colors.white; }}
          onMouseLeave={(e) => { e.target.style.background = theme.colors.white; e.target.style.color = theme.colors.primary; }}
        >
          {t.clear}
        </button>
      </div>

      {/* 레벨 행 */}
      <div style={{ marginBottom: '12px' }}>
        {spirit.levels.map(level => (
          <LevelRow
            key={level.level}
            level={level}
            nodeStates={nodeStates}
            onToggleNode={onToggleNode}
            spiritId={spirit.id}
            currentAffinity={currentAffinity}
            hasSeasonPass={hasSeasonPass}
            language={language}
            isSimpleMode={isSimpleMode}
          />
        ))}
      </div>

      {/* 합계 */}
      <div style={{
        borderTop: `2px solid ${theme.colors.border}`,
        paddingTop: '10px', fontSize: '13px', textAlign: 'center'
      }}>
        <div style={{ color: theme.colors.textLight, marginBottom: '4px', fontSize: '12px' }}>
          {t.total}: {spirit.totalCandles}{t.bonusCandles}
        </div>
        <div style={{ color: theme.colors.primary, fontWeight: 'bold', fontSize: '14px' }}>
          {t.selected}: {selectedCandles}{t.bonusCandles}
        </div>
      </div>
    </div>
  );
}
