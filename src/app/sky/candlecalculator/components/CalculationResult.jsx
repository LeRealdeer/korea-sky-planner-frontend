"use client";
import React from 'react';
import { theme, translations } from '../styles/theme';

function InfoRow({ label, value, color, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
      <span style={{ color: theme.colors.text }}>{label}</span>
      <span style={{ fontWeight: bold ? 'bold' : 'normal', color: color || theme.colors.text }}>{value}</span>
    </div>
  );
}

function Divider() {
  return <div style={{ borderTop: `1px solid ${theme.colors.border}`, margin: '10px 0' }} />;
}

/* ── 간단 계산기 결과 ──────────────────────────────── */
function SimpleResult({ r, t, unit }) {
  const neededCandles = r.totalRequired - r.currentCandles - r.bonus;
  const finalDays = neededCandles > 0 ? Math.ceil(neededCandles / r.dailyCandles) : 0;
  const canReachInSeason = finalDays <= r.remainingDays;

  return (
    <>
      <InfoRow label={`🕐 ${t.remainingSeasonDays}`} value={`${r.remainingDays}${t.days}`} color={theme.colors.primary} bold />
      <InfoRow label={`💰 ${t.dailyCandles}`} value={`${r.dailyCandles}${unit}`} />
      <Divider />
      <InfoRow label={t.currentCandlesLabel} value={`${r.currentCandles}${unit}`} />
      <InfoRow
        label={t.remainingPeriodCandles}
        value={`${r.seasonCandlesFromDays}${unit}`}
      />
      {r.bonus > 0 && (
        <InfoRow label={`✨ ${t.seasonPassBonus}`} value={`+${r.bonus}${unit}`} color={theme.colors.primary} />
      )}
      <Divider />
      <InfoRow label={`💎 ${t.totalObtainableCandles}`} value={`${r.totalAvailableCandles}${unit}`} color={theme.colors.primary} bold />
      <Divider />
      <div style={{ background: '#E3F2FD', padding: '10px', borderRadius: '6px', marginBottom: '12px' }}>
        <InfoRow label={`🎯 ${t.selected}`} value={`${r.totalRequired}${unit}`} bold />
      </div>
      <div style={{
        background: r.canAfford ? '#E8F5E9' : '#FFEBEE',
        padding: '12px', borderRadius: '8px', marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 'bold',
          color: r.canAfford ? '#2E7D32' : '#C62828' }}>
          <span>{r.canAfford ? `✅ ${t.remainingCandles}` : `⚠️ ${t.shortageCandles}`}</span>
          <span>{Math.abs(r.surplus)}{unit}</span>
        </div>
      </div>
      {neededCandles > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px',
          color: canReachInSeason ? theme.colors.primary : '#C62828', fontWeight: 'bold' }}>
          <span>{t.daysNeeded}</span>
          <span>{canReachInSeason ? `${finalDays}${t.days}` : `시즌 내 불가 (${finalDays}${t.days} 필요)`}</span>
        </div>
      )}
      {neededCandles <= 0 && (
        <div style={{ padding: '8px', background: '#E8F5E9', borderRadius: '6px', fontSize: '13px',
          color: '#2E7D32', fontWeight: 'bold', textAlign: 'center' }}>
          {t.alreadyEnough.replace('{amount}', Math.abs(neededCandles))}
        </div>
      )}
    </>
  );
}

/* ── 호감도 계산기 — 영혼별 루트 카드 ───────────────── */
function SpiritRouteCard({ route, t, language, unit }) {
  const name = typeof route.name === 'object' ? route.name[language] : route.name;
  const isOk = route.achievable;

  return (
    <div style={{
      border: `1.5px solid ${isOk ? theme.colors.affinity : '#FFCC80'}`,
      borderRadius: '8px', marginBottom: '10px', overflow: 'hidden'
    }}>
      <div style={{
        background: isOk ? '#E8F5E9' : '#FFF8E1', padding: '8px 12px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <span style={{ fontWeight: 'bold', fontSize: '13px', color: theme.colors.text }}>{name}</span>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: isOk ? theme.colors.affinity : '#F57F17' }}>
          {route.targetLevel}{language === 'ko' ? '단계 목표' : ' target'}
        </span>
      </div>

      <div style={{ padding: '8px 12px', fontSize: '12px' }}>
        {/* 호감도 현황 */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
          <span style={{ color: theme.colors.textLight }}>
            {t.affinityStatus}: <b style={{ color: theme.colors.affinity }}>{route.currentAffinity.toFixed ? route.currentAffinity.toFixed(1) : route.currentAffinity}</b>
            {' / '}{route.requiredAffinity}
          </span>
          {route.affinityShortfall > 0
            ? <span style={{ color: '#E65100' }}>({t.affinityShortfall}: {route.affinityShortfall}{t.points})</span>
            : <span style={{ color: theme.colors.affinity }}>✅ {language === 'ko' ? '충족' : 'Met'}</span>}
        </div>

        {/* 동행 사용 */}
        {route.companionDaysUsed > 0 && (
          <div style={{ color: theme.colors.affinity, marginBottom: '4px' }}>
            🤝 {t.companionDaysUsed}: {route.companionDaysUsed}{t.days}
            <span style={{ color: theme.colors.textLight }}> (+{route.companionDaysUsed}{t.points})</span>
          </div>
        )}

        {/* 호감도 여전히 부족 */}
        {route.affinityStillShort > 0 && (
          <div style={{ padding: '4px 8px', background: '#FFEBEE', borderRadius: '4px',
            color: '#C62828', fontSize: '11px', marginBottom: '4px' }}>
            ⚠️ {language === 'ko'
              ? `호감도 ${route.affinityStillShort.toFixed(1)}점 부족 — 더 많은 동행일수가 필요합니다`
              : `Affinity short by ${route.affinityStillShort.toFixed(1)} pts — more companion days needed`}
          </div>
        )}

        <div style={{ marginTop: '4px', textAlign: 'right', color: theme.colors.primary, fontWeight: 'bold' }}>
          {language === 'ko' ? '목표 비용' : 'Target cost'}: {route.targetCost}{unit}
        </div>
      </div>
    </div>
  );
}

/* ── 호감도 계산기 결과 ──────────────────────────────── */
function FullResult({ r, t, unit, language, remainingDays }) {
  if (!r.hasTargets) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: theme.colors.textLight, fontSize: '14px' }}>
        {t.noTargetSelected}
      </div>
    );
  }

  return (
    <>
      <InfoRow label={`🕐 ${t.remainingSeasonDays}`} value={`${remainingDays}${t.days}`} color={theme.colors.primary} bold />
      <InfoRow label={`💎 ${t.totalObtainableCandles}`} value={`${r.totalAvailableCandles}${unit}`} color={theme.colors.primary} bold />
      <Divider />
      <InfoRow label={`🎯 ${t.targetItemCost}`} value={`${r.totalTargetCost}${unit}`} />
      <InfoRow label={`📦 ${t.totalNeededCandles}`} value={`${r.totalNeeded}${unit}`} bold />
      <Divider />
      <div style={{ background: r.canAfford ? '#E8F5E9' : '#FFEBEE', padding: '12px', borderRadius: '8px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 'bold',
          color: r.canAfford ? '#2E7D32' : '#C62828' }}>
          <span>{r.canAfford ? `✅ ${t.remainingCandles}` : `⚠️ ${t.shortageCandles}`}</span>
          <span>{Math.abs(r.surplus)}{unit}</span>
        </div>
      </div>

      {/* 동행 현황 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: theme.colors.affinity, marginBottom: '8px' }}>
        <span>🤝 {t.companionDaysUsed}</span>
        <span style={{ fontWeight: 'bold' }}>
          {r.totalCompanionUsed}{t.days} / {r.availableCompanionDays}{t.days} {t.availableCompanionDays}
        </span>
      </div>

      {/* 최단 획득 모드 */}
      {r.mode === 'fastest' && (
        <div style={{ padding: '10px 12px', borderRadius: '8px', marginBottom: '10px', fontWeight: 'bold',
          fontSize: '14px', textAlign: 'center',
          background: r.achievable ? '#E3F2FD' : '#FFEBEE',
          color: r.achievable ? theme.colors.primary : '#C62828' }}>
          {r.achievable
            ? r.daysFromNow === 0 ? t.noDaysNeeded : `${r.daysFromNow}${t.daysFromNow}`
            : t.notAchievable}
        </div>
      )}

      {/* 전체 달성 여부 (절약 모드) */}
      {r.mode === 'saving' && (
        <div style={{ padding: '8px 12px', borderRadius: '6px', marginBottom: '10px',
          fontWeight: 'bold', fontSize: '13px', textAlign: 'center',
          background: r.achievable ? '#E8F5E9' : '#FFF3E0',
          color: r.achievable ? '#2E7D32' : '#E65100' }}>
          {r.achievable ? t.achievable : t.notAchievable}
        </div>
      )}

      <Divider />
      <div style={{ fontWeight: 'bold', fontSize: '13px', color: theme.colors.text, marginBottom: '10px' }}>
        📋 {t.routeDetail}
      </div>
      {r.routeDetails.map(route => (
        <SpiritRouteCard key={route.spiritId} route={route} t={t} language={language} unit={unit} />
      ))}
    </>
  );
}

/* ── 메인 컴포넌트 ──────────────────────────────────── */
export function CalculationResult({ remainingDays, onCalculate, calcResult, calcMode, viewMode, language }) {
  const t = translations[language];
  const unit = t.bonusCandles;

  const btnLabel = viewMode === 'simple'
    ? t.calculate
    : calcMode === 'saving' ? t.calculateSaving : t.calculateFastest;

  const modeLabel = calcResult
    ? calcResult.type === 'simple'
      ? (language === 'ko' ? '간단 계산기' : 'Simple')
      : calcResult.mode === 'saving' ? t.modeSaving : t.modeFastest
    : null;

  return (
    <div style={{
      background: theme.colors.white, padding: '16px', borderRadius: '12px',
      marginTop: '24px', marginBottom: '30px', marginLeft: 'auto', marginRight: 'auto',
      border: `2px solid ${theme.colors.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      maxWidth: '640px', width: '100%', boxSizing: 'border-box'
    }}>
      <button
        onClick={onCalculate}
        style={{
          padding: '12px 24px', background: theme.colors.primary, color: theme.colors.white,
          border: 'none', borderRadius: '8px', cursor: 'pointer',
          fontSize: '15px', fontWeight: 'bold', width: '100%', maxWidth: '240px',
          display: 'block', marginLeft: 'auto', marginRight: 'auto',
          marginBottom: calcResult ? '20px' : '0'
        }}
        onMouseEnter={(e) => e.target.style.background = theme.colors.primaryDark}
        onMouseLeave={(e) => e.target.style.background = theme.colors.primary}
      >
        {btnLabel}
      </button>

      {calcResult && (
        <div style={{ background: theme.colors.background, borderRadius: '8px',
          border: `2px solid ${theme.colors.primary}`, overflow: 'hidden' }}>
          <div style={{ background: theme.colors.primary, color: theme.colors.white,
            padding: '12px', fontWeight: 'bold', fontSize: '15px', textAlign: 'center' }}>
            {t.calculationResult}
            {modeLabel && (
              <span style={{ fontSize: '12px', fontWeight: 'normal', opacity: 0.85 }}> ({modeLabel})</span>
            )}
          </div>
          <div style={{ padding: '16px' }}>
            {calcResult.type === 'simple'
              ? <SimpleResult r={calcResult} t={t} unit={unit} />
              : <FullResult r={calcResult} t={t} unit={unit} language={language} remainingDays={remainingDays} />}
          </div>
        </div>
      )}
    </div>
  );
}
