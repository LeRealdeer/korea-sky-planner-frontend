"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { spiritsData } from './data/spiritsData';
import { theme, translations } from './styles/theme';
import { SpiritCard } from './components/SpiritCard';
import { SettingsPanel } from './components/SettingsPanel';
import { CalculationResult } from './components/CalculationResult';
import { NodeModeToolbar } from './components/NodeModeToolbar';
import { SimpleCandleCalculator } from './components/SimpleCandleCalculator';
import { planCandleSavingRoute, planFastestRoute } from './lib/routePlanner';
import { toggleNodeInMode } from './lib/nodeUtils';
import { computeAffinityFromOwned, MAX_AFFINITY } from './lib/affinity';

const SEASON_END = new Date("2026-07-03T16:00:00+09:00");

function getRemainingDays() {
  const diffMs = SEASON_END.getTime() - Date.now();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export default function CandleCalculator() {
  const router = useRouter();
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.navigator) {
      if (window.navigator.language.toLowerCase().includes('ko')) setLanguage('ko');
    }
  }, []);

  // ── 뷰 모드 ────────────────────────────────────────
  const [viewMode, setViewMode] = useState('simple'); // 'simple' | 'full'

  // ── 기본 설정 ──────────────────────────────────────
  const [currentCandles, setCurrentCandles] = useState(0);
  const [ownsSeasonPass, setOwnsSeasonPass] = useState("yes");
  const [buySeasonPass, setBuySeasonPass] = useState(false);
  const [remainingDays, setRemainingDays] = useState(getRemainingDays);
  const [calcMode, setCalcMode] = useState('saving');
  const [todayCompanionDone, setTodayCompanionDone] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setRemainingDays(getRemainingDays()), 60000);
    return () => clearInterval(interval);
  }, []);

  // ── 노드 상태 (3-way: owned / target / candidate) ──
  const [nodeStates, setNodeStates] = useState({
    owned: new Set(),
    target: new Set(),
    candidate: new Set()
  });

  // ── 선택 모드 (호감도 탭에서만 표시) ───────────────
  const [selectionMode, setSelectionMode] = useState('target');

  // ── 영혼별 동행 일수 (이미 동행한 날, 기본 0) ──────
  const [companionDays, setCompanionDays] = useState(() =>
    Object.fromEntries(spiritsData.map(s => [s.id, 0]))
  );

  // ── 계산 결과 ──────────────────────────────────────
  const [calcResult, setCalcResult] = useState(null);

  // 탭 전환 시 이전 결과 초기화
  useEffect(() => { setCalcResult(null); }, [viewMode]);

  // ── 파생 상태 ──────────────────────────────────────
  const hasSeasonPass = ownsSeasonPass === 'yes' || buySeasonPass;
  const isSimpleMode = viewMode === 'simple';

  // 목표(target) 노드 비용 합산
  const totalSelectedCost = useMemo(() => {
    let total = 0;
    spiritsData.forEach(spirit =>
      spirit.levels.forEach(levelData =>
        [...levelData.leftNodes, ...levelData.rightNodes].forEach(node => {
          if (nodeStates.target.has(node.id)) total += node.cost;
        })
      )
    );
    return total;
  }, [nodeStates]);

  // ── 핸들러 ─────────────────────────────────────────
  const toggleNode = (nodeId) => {
    const node = spiritsData
      .flatMap(s => s.levels.flatMap(l => [...l.leftNodes, ...l.rightNodes]))
      .find(n => n.id === nodeId);
    if (node?.type === 'season' && !hasSeasonPass) return;

    const mode = isSimpleMode ? 'target' : selectionMode;
    setNodeStates(prev => toggleNodeInMode(nodeId, mode, prev));
  };

  const selectAllForSpirit = (spirit) => {
    const mode = isSimpleMode ? 'target' : selectionMode;
    setNodeStates(prev => {
      const newOwned = new Set(prev.owned);
      const newTarget = new Set(prev.target);
      const newCandidate = new Set(prev.candidate);
      spirit.levels.forEach(levelData =>
        [...levelData.leftNodes, ...levelData.rightNodes].forEach(node => {
          if (node.type === 'season' && !hasSeasonPass) return;
          newOwned.delete(node.id);
          newTarget.delete(node.id);
          newCandidate.delete(node.id);
          if (mode === 'owned')     newOwned.add(node.id);
          else if (mode === 'target')    newTarget.add(node.id);
          else if (mode === 'candidate') newCandidate.add(node.id);
        })
      );
      return { owned: newOwned, target: newTarget, candidate: newCandidate };
    });
  };

  const clearAllForSpirit = (spirit) => {
    setNodeStates(prev => {
      const newOwned = new Set(prev.owned);
      const newTarget = new Set(prev.target);
      const newCandidate = new Set(prev.candidate);
      spirit.levels.forEach(levelData =>
        [...levelData.leftNodes, ...levelData.rightNodes].forEach(node => {
          newOwned.delete(node.id);
          newTarget.delete(node.id);
          newCandidate.delete(node.id);
        })
      );
      return { owned: newOwned, target: newTarget, candidate: newCandidate };
    });
  };

  const setSpiritCompanionDays = (spiritId, days) => {
    setCompanionDays(prev => ({ ...prev, [spiritId]: days }));
  };

  const handleCalculate = () => {
    if (isSimpleMode) {
      const dailyCandles = hasSeasonPass ? 6 : 5;
      const bonus = (ownsSeasonPass !== 'yes' && buySeasonPass) ? 31 : 0;
      const seasonCandlesFromDays = remainingDays * dailyCandles;
      const totalAvailableCandles = currentCandles + seasonCandlesFromDays + bonus;
      const surplus = totalAvailableCandles - totalSelectedCost;
      setCalcResult({
        type: 'simple',
        remainingDays,
        dailyCandles,
        currentCandles,
        bonus,
        seasonCandlesFromDays,
        totalAvailableCandles,
        totalRequired: totalSelectedCost,
        canAfford: surplus >= 0,
        surplus
      });
      return;
    }

    // 보유 아이템 + 동행 일수로 영혼별 현재 호감도 자동 계산
    const computedAffinity = Object.fromEntries(
      spiritsData.map(s => {
        const owned = computeAffinityFromOwned(s, nodeStates.owned);
        const total = Math.min(owned + (companionDays[s.id] ?? 0), MAX_AFFINITY);
        return [s.id, total];
      })
    );
    const interaction4Completed = Object.fromEntries(spiritsData.map(s => [s.id, true]));
    const params = {
      spiritsData, nodeStates, affinityPoints: computedAffinity, interaction4Completed,
      currentCandles, ownsSeasonPass, buySeasonPass,
      remainingDays, todayCompanionDone
    };
    const result = calcMode === 'saving'
      ? planCandleSavingRoute(params)
      : planFastestRoute(params);
    setCalcResult(result);
  };

  const t = translations[language];

  return (
    <div style={{
      maxWidth: '1200px', margin: '0 auto', padding: '20px',
      fontFamily: 'sans-serif', background: theme.colors.background, minHeight: '100vh'
    }}>
      {/* 언어 전환 */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', gap: '12px' }}>
        {['ko', 'en'].map(lang => (
          <button key={lang} onClick={() => setLanguage(lang)} style={{
            padding: '8px 16px',
            background: language === lang ? theme.colors.primary : theme.colors.white,
            color: language === lang ? theme.colors.white : theme.colors.text,
            border: `2px solid ${theme.colors.primary}`,
            borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px'
          }}>
            {lang === 'ko' ? '한국어' : 'English'}
          </button>
        ))}
      </div>

      {/* 타이틀 */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: theme.colors.primary, marginBottom: '8px' }}>
          {t.title}
        </h1>
        <p style={{ color: theme.colors.textLight, fontSize: '14px' }}>{t.subtitle}</p>
      </div>

      {/* 탭 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          border: `2px solid ${theme.colors.primary}`,
          borderRadius: '10px',
          overflow: 'hidden'
        }}>
          {[
            { mode: 'simple', icon: '⚡', label: language === 'ko' ? '간단 계산기' : 'Simple' },
            { mode: 'full',   icon: '🤝', label: language === 'ko' ? '호감도 계산기' : 'Affinity' }
          ].map((tab, i) => (
            <button key={tab.mode} onClick={() => setViewMode(tab.mode)} style={{
              padding: '10px 24px',
              background: viewMode === tab.mode ? theme.colors.primary : theme.colors.white,
              color: viewMode === tab.mode ? theme.colors.white : theme.colors.primary,
              border: 'none',
              borderRight: i === 0 ? `1px solid ${theme.colors.primary}` : 'none',
              cursor: 'pointer',
              fontWeight: 'bold', fontSize: '14px'
            }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 설정 패널 */}
      <SettingsPanel
        currentCandles={currentCandles}
        setCurrentCandles={setCurrentCandles}
        ownsSeasonPass={ownsSeasonPass}
        setOwnsSeasonPass={setOwnsSeasonPass}
        buySeasonPass={buySeasonPass}
        setBuySeasonPass={setBuySeasonPass}
        remainingDays={remainingDays}
        totalRequired={totalSelectedCost}
        calcMode={calcMode}
        setCalcMode={setCalcMode}
        todayCompanionDone={todayCompanionDone}
        setTodayCompanionDone={setTodayCompanionDone}
        language={language}
        isSimpleMode={isSimpleMode}
      />

      {/* 선택 모드 툴바 — 호감도 탭에서만 */}
      {!isSimpleMode && (
        <NodeModeToolbar
          selectionMode={selectionMode}
          onChangeMode={setSelectionMode}
          language={language}
        />
      )}

      {/* 영혼 카드 — 한 줄에 2개 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, auto)',
        gap: '20px',
        justifyContent: 'center',
        marginBottom: '30px'
      }}>
        {spiritsData.map(spirit => (
          <SpiritCard
            key={spirit.id}
            spirit={spirit}
            nodeStates={nodeStates}
            onToggleNode={toggleNode}
            onSelectAll={selectAllForSpirit}
            onClearAll={clearAllForSpirit}
            language={language}
            hasSeasonPass={hasSeasonPass}
            isSimpleMode={isSimpleMode}
            companionDays={companionDays[spirit.id]}
            onChangeCompanionDays={(days) => setSpiritCompanionDays(spirit.id, days)}
          />
        ))}
      </div>

      {/* 계산 결과 */}
      <CalculationResult
        remainingDays={remainingDays}
        onCalculate={handleCalculate}
        calcResult={calcResult}
        calcMode={calcMode}
        viewMode={viewMode}
        language={language}
      />

      {/* 양초 구매 가격 계산기 (한국어만) */}
      {language === 'ko' && <SimpleCandleCalculator />}

      {/* 메인화면 버튼 */}
      <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '20px' }}>
        <button
          onClick={() => router.push('/')}
          style={{
            padding: '12px 32px',
            background: theme.colors.white, color: theme.colors.primary,
            border: `2px solid ${theme.colors.primary}`,
            borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold'
          }}
          onMouseEnter={(e) => { e.target.style.background = theme.colors.primary; e.target.style.color = theme.colors.white; }}
          onMouseLeave={(e) => { e.target.style.background = theme.colors.white; e.target.style.color = theme.colors.primary; }}
        >
          {t.backToMain}
        </button>
      </div>
    </div>
  );
}
