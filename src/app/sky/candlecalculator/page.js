"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { spiritsData as rawSpiritsData } from './data/spiritsData';
import { enrichSpiritsData } from './lib/enrichSpirits';
import { theme, translations } from './styles/theme';
import { SpiritCard } from './components/SpiritCard';
import { SettingsPanel } from './components/SettingsPanel';
import { BudgetBar } from './components/BudgetBar';
import { CalculationResult } from './components/CalculationResult';
import { simulateAll } from './lib/simulator';
import { LegacyCalculator } from './LegacyCalculator';

const spiritsData = enrichSpiritsData(rawSpiritsData);

const SEASON_END = new Date("2026-10-02T16:00:00+09:00");

function getRemainingDays() {
  const diffMs = SEASON_END.getTime() - Date.now();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

const initSpiritStates = () =>
  Object.fromEntries(spiritsData.map(s => [s.id, {
    pastCompanionDays: 0,
    futureCompanionDays: 0,
    nodeStates: {}
  }]));

export default function CandleCalculator() {
  const router = useRouter();
  const [language, setLanguage] = useState('ko');
  const [version, setVersion] = useState('new');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.navigator) {
      if (!window.navigator.language.toLowerCase().includes('ko')) setLanguage('en');
    }
  }, []);

  const [currentCandles, setCurrentCandles] = useState(0);
  const [ownsSeasonPass, setOwnsSeasonPass] = useState('yes');
  const [buySeasonPass, setBuySeasonPass] = useState(false);
  const [remainingDays, setRemainingDays] = useState(getRemainingDays);
  const [spiritStates, setSpiritStates] = useState(initSpiritStates);
  const [cashPackCount, setCashPackCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setRemainingDays(getRemainingDays()), 60000);
    return () => clearInterval(id);
  }, []);

  const settings = useMemo(() => ({
    currentCandles, ownsSeasonPass, buySeasonPass, remainingDays, cashPackCount
  }), [currentCandles, ownsSeasonPass, buySeasonPass, remainingDays, cashPackCount]);

  const simResult = useMemo(
    () => simulateAll(spiritsData, spiritStates, settings),
    [spiritStates, settings]
  );

  // 상태 버튼(없음/예정/보유)에서 직접 선택한 값을 반영. canOwn=false면 '보유' 지정을 무시(방어용, 버튼 자체가 비활성화됨)
  const setNodeState = (spiritId, nodeId, newState, canOwn = true) => {
    if (newState === 'owned' && !canOwn) return;
    setSpiritStates(prev => {
      const ss = prev[spiritId] ?? { pastCompanionDays: 0, futureCompanionDays: 0, nodeStates: {} };
      const newNodeStates = newState === 'none'
        ? Object.fromEntries(Object.entries(ss.nodeStates).filter(([k]) => k !== nodeId))
        : { ...ss.nodeStates, [nodeId]: newState };
      return { ...prev, [spiritId]: { ...ss, nodeStates: newNodeStates } };
    });
  };

  const clearSpirit = (spiritId) => {
    setSpiritStates(prev => ({
      ...prev,
      [spiritId]: { ...prev[spiritId], nodeStates: {} }
    }));
  };

  const selectAllSpirit = (spiritId) => {
    const spirit = spiritsData.find(s => s.id === spiritId);
    if (!spirit) return;
    const allNodes = {};
    for (const levelData of spirit.levels) {
      for (const node of [...levelData.leftNodes, ...levelData.rightNodes]) {
        allNodes[node.id] = 'planned';
      }
    }
    setSpiritStates(prev => ({
      ...prev,
      [spiritId]: { ...prev[spiritId], nodeStates: allNodes }
    }));
  };

  const updateSpiritDays = (spiritId, field, value) => {
    setSpiritStates(prev => ({
      ...prev,
      [spiritId]: { ...prev[spiritId], [field]: value }
    }));
  };

  const t = translations[language];
  const isKo = language === 'ko';

  return (
    <div style={{
      maxWidth: '1200px', margin: '0 auto', padding: '20px',
      fontFamily: 'sans-serif', background: theme.colors.background, minHeight: '100vh'
    }}>
      {/* 언어 전환 */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', gap: '10px' }}>
        {['ko', 'en'].map(lang => (
          <button key={lang} onClick={() => setLanguage(lang)} style={{
            padding: '6px 14px',
            background: language === lang ? theme.colors.primary : theme.colors.white,
            color: language === lang ? theme.colors.white : theme.colors.primary,
            border: `2px solid ${theme.colors.primary}`,
            borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px'
          }}>
            {lang === 'ko' ? '한국어' : 'English'}
          </button>
        ))}
      </div>

      {/* 타이틀 */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: theme.colors.primary, marginBottom: '6px' }}>
          {t.title}
        </h1>
        <p style={{ color: theme.colors.textLight, fontSize: '13px' }}>{t.subtitle}</p>
      </div>

      {/* 버전 탭 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0', marginBottom: '24px' }}>
        {[
          { key: 'new', label: '신버전 (호감도)' },
          { key: 'legacy', label: '구버전' }
        ].map(({ key, label }, i) => (
          <button
            key={key}
            onClick={() => setVersion(key)}
            style={{
              padding: '8px 22px', fontSize: '13px', fontWeight: version === key ? 'bold' : 'normal',
              cursor: 'pointer',
              background: version === key ? theme.colors.primary : theme.colors.white,
              color: version === key ? '#fff' : theme.colors.primary,
              border: `2px solid ${theme.colors.primary}`,
              borderRadius: i === 0 ? '8px 0 0 8px' : '0 8px 8px 0',
              borderLeft: i === 1 ? 'none' : undefined,
              transition: 'all 0.15s'
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 구버전 */}
      {version === 'legacy' && <LegacyCalculator language={language} />}

      {/* 신버전 */}
      {version === 'new' && <>

      {/* 설정 패널 */}
      <SettingsPanel
        currentCandles={currentCandles}
        setCurrentCandles={setCurrentCandles}
        ownsSeasonPass={ownsSeasonPass}
        setOwnsSeasonPass={setOwnsSeasonPass}
        buySeasonPass={buySeasonPass}
        setBuySeasonPass={setBuySeasonPass}
        cashPackCount={cashPackCount}
        setCashPackCount={setCashPackCount}
        remainingDays={remainingDays}
        seasonEnd={SEASON_END}
        cashCandles={simResult.cashCandles}
        showCashPack={isKo}
        language={language}
      />

      {/* 예산 바 */}
      <BudgetBar
        candlePossible={simResult.candlePossible}
        candleDifference={simResult.candleDifference}
        totalAvailableCandles={simResult.totalAvailableCandles}
        purchasablePlannedCost={simResult.purchasablePlannedCost}
        lockedPlannedCost={simResult.lockedPlannedCost}
        companionPossible={simResult.companionPossible}
        remainingCompanionDays={simResult.remainingCompanionDays}
        remainingDays={remainingDays}
        totalFutureCompanionDays={simResult.totalFutureCompanionDays}
        language={language}
      />
{/* 영혼 카드 그리드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', /* 💡 모바일에 맞춰 280px로 수정 */
        justifyContent: 'center', 
        gap: '20px',
        width: '100%',
        maxWidth: '660px',
        margin: '16px auto 30px auto',
        padding: '0 10px', /* 좌우 여백 살짝 추가 */
        boxSizing: 'border-box'
      }}>
        {spiritsData.map(spirit => {
          const spiritResult = simResult.spiritResults?.find(r => r.spiritId === spirit.id) ?? {};
          return (
            <SpiritCard
              key={spirit.id}
              spirit={spirit}
              spiritState={spiritStates[spirit.id]}
              spiritResult={spiritResult}
              onSetNodeState={(nodeId, newState, canOwn) => setNodeState(spirit.id, nodeId, newState, canOwn)}
              onClearSpirit={() => clearSpirit(spirit.id)}
              onSelectAll={() => selectAllSpirit(spirit.id)}
              onChangePastDays={(days) => updateSpiritDays(spirit.id, 'pastCompanionDays', days)}
              onChangeFutureDays={(days) => updateSpiritDays(spirit.id, 'futureCompanionDays', days)}
              language={language}
            />
          );
        })}
      </div>

      {/* 계산 결과 */}
      <CalculationResult simResult={simResult} language={language} />

      {/* 메인화면 버튼 */}
      <div style={{ textAlign: 'center', marginTop: '30px', marginBottom: '20px' }}>
        <button
          onClick={() => router.push('/')}
          style={{
            padding: '12px 32px',
            background: theme.colors.white, color: theme.colors.primary,
            border: `2px solid ${theme.colors.primary}`,
            borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold'
          }}
          onMouseEnter={(e) => { e.target.style.background = theme.colors.primary; e.target.style.color = theme.colors.white; }}
          onMouseLeave={(e) => { e.target.style.background = theme.colors.white; e.target.style.color = theme.colors.primary; }}
        >
          {t.backToMain}
        </button>
      </div>

      </>}
    </div>
  );
}
