"use client";
import React, { useState } from 'react';
import { theme } from '../styles/theme';

function Row({ label, value, color, bold, indent }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      padding: '2px 0', fontSize: '12px',
      paddingLeft: indent ? '12px' : 0
    }}>
      <span style={{ color: indent ? theme.colors.textLight : theme.colors.text }}>
        {label}
      </span>
      <span style={{ fontWeight: bold ? 'bold' : 'normal', color: color || theme.colors.text }}>
        {value}
      </span>
    </div>
  );
}

function Section({ title, children, color }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{
        fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px',
        color: color || theme.colors.textLight,
        borderBottom: `1px solid ${theme.colors.border}`,
        paddingBottom: '4px', marginBottom: '8px'
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

/* ── 영혼별 접이식 카드 ───────────────────────── */
function SpiritCard({ r, language }) {
  const [open, setOpen] = useState(false);
  const name = typeof r.name === 'object' ? r.name[language] : r.name;
  const hasLocked = r.lockedPlannedNodes.length > 0;
  const hasActivity = r.totalPlannedCost > 0 || r.ownedAffinity > 0 || r.pastCompanionAffinity > 0 || r.futureCompanionAffinity > 0;
  if (!hasActivity) return null;

  return (
    <div style={{
      border: `1.5px solid ${hasLocked ? '#FFCC80' : theme.colors.border}`,
      borderRadius: '8px', marginBottom: '6px', overflow: 'hidden', fontSize: '12px'
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '8px 12px',
          background: hasLocked ? '#FFF8E1' : '#F8FBFF',
          border: 'none', cursor: 'pointer', textAlign: 'left'
        }}
      >
        <span style={{ fontWeight: 'bold', color: theme.colors.text }}>{name}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
          {hasLocked && <span style={{ color: '#E65100', fontWeight: 'bold' }}>⚠️ {r.lockedPlannedNodes.length}개 잠김</span>}
          {r.totalPlannedCost > 0 && <span style={{ color: theme.colors.planned }}>{r.totalPlannedCost}개</span>}
          <span style={{ color: theme.colors.textLight }}>{open ? '▾' : '▸'}</span>
        </span>
      </button>

      {open && (
        <div style={{ padding: '10px 12px', background: theme.colors.white, borderTop: `1px solid ${theme.colors.border}` }}>
          <div style={{ fontSize: '11px', lineHeight: 2, color: theme.colors.textLight, marginBottom: '6px' }}>
            {r.ownedAffinity > 0      && <div>보유 아이템: <b style={{ color: theme.colors.affinity }}>+{r.ownedAffinity.toFixed(1)}점</b></div>}
            {r.pastCompanionAffinity > 0  && <div>이미 동행: <b style={{ color: theme.colors.affinity }}>+{r.pastCompanionAffinity}점</b></div>}
            {r.futureCompanionAffinity > 0 && <div style={{ color: theme.colors.companion }}>앞으로 동행: <b>+{r.futureCompanionAffinity}점</b></div>}
            {r.plannedItemAffinity > 0    && <div style={{ color: theme.colors.planned }}>구매 예정: <b>+{r.plannedItemAffinity.toFixed(1)}점</b></div>}
            <div style={{ borderTop: `1px solid ${theme.colors.border}`, marginTop: '3px', paddingTop: '3px' }}>
              예상 호감도: <b style={{ color: theme.colors.affinity }}>{r.projectedAffinity.toFixed(1)}점</b> ({r.projectedLevel}단계)
            </div>
          </div>

          {r.lockedPlannedNodes.length > 0 && (
            <div>
              <div style={{ color: '#E65100', fontWeight: 'bold', fontSize: '11px', marginBottom: '4px' }}>
                잠긴 아이템 ({r.lockedPlannedNodes.length}개)
              </div>
              {r.lockedPlannedNodes.map(({ node, level, reason, requiredAffinity }, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '3px 6px', background: '#FFF3E0', borderRadius: '4px',
                  marginBottom: '3px', fontSize: '11px'
                }}>
                  <span>{level}단계 {node.type === 'season' ? '시즌 아이템' : '아이템'}</span>
                  <span style={{ color: '#E65100' }}>
                    {reason === 'season' ? '시즌패스 필요' : `호감도 ${requiredAffinity}점 필요`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── 메인 ──────────────────────────────────── */
export function CalculationResult({ simResult, language }) {
  if (!simResult) return null;
  const isKo = language === 'ko';
  const unit = isKo ? '개' : ' candles';

  const {
    currentCandles, remainingDays, dailyCandles, seasonPassBonus,
    candlesFromDays, cashPackCount, cashCandles, cashCost,
    totalAvailableCandles,
    totalPlannedCost, purchasablePlannedCost, lockedPlannedCost,
    candleDifference, candlePossible,
    remainingCompanionDays, companionPossible,
    affinityPossible,
    spiritResults
  } = simResult;

  const totalLockedCount = spiritResults.reduce((s, r) => s + r.lockedPlannedNodes.length, 0);

  return (
    <div style={{
      maxWidth: '660px', marginLeft: 'auto', marginRight: 'auto',
      marginBottom: '30px',
      background: theme.colors.white, borderRadius: '12px',
      border: `2px solid ${theme.colors.border}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden'
    }}>
      {/* 헤더 */}
      <div style={{
        padding: '11px 16px', fontWeight: 'bold', fontSize: '14px',
        background: '#E3F2FD', color: theme.colors.primary,
        textAlign: 'center'
      }}>
        {isKo ? '계산 결과' : 'Calculation Result'}
      </div>

      <div style={{ padding: '14px 16px' }}>

        {/* ── 양초 수급 ── */}
        <Section title={isKo ? '양초 수급' : 'Candle Supply'}>
          <Row
            label={isKo ? '현재 보유' : 'Current'}
            value={`${currentCandles}${unit}`}
          />
          <Row
            label={isKo ? `+ 남은 ${remainingDays}일 × ${dailyCandles}개/일` : `+ ${remainingDays}d × ${dailyCandles}/day`}
            value={`${candlesFromDays}${unit}`}
            indent
          />
          {seasonPassBonus > 0 && (
            <Row
              label={isKo ? '+ 시즌패스 보너스' : '+ Season pass bonus'}
              value={`+${seasonPassBonus}${unit}`}
              color={theme.colors.primary}
              indent
            />
          )}
          {cashCandles > 0 && (
            <Row
              label={isKo ? `+ 현질 ${cashPackCount}팩 × 15개` : `+ Cash ${cashPackCount}×15`}
              value={`+${cashCandles}${unit}`}
              color="#E65100"
              indent
            />
          )}
          <Row
            label={isKo ? '= 시즌 종료까지 총 획득 가능' : '= Total collectable by season end'}
            value={`${totalAvailableCandles}${unit}`}
            bold
            color={theme.colors.primary}
          />
          {cashPackCount > 0 && (
            <div style={{
              marginTop: '4px', padding: '5px 8px', borderRadius: '6px',
              background: '#FFF8E1', fontSize: '11px', color: '#E65100'
            }}>
              {isKo
                ? `현질 ${cashPackCount}팩: ${cashCost.toLocaleString()}원 지출 · ${cashCandles}개 획득`
                : `Cash ${cashPackCount} packs: ₩${cashCost.toLocaleString()} · ${cashCandles} candles`}
            </div>
          )}
        </Section>

        {/* ── 구매 계획 ── */}
        {totalPlannedCost > 0 && (
          <Section title={isKo ? '구매 계획' : 'Purchase Plan'}>
            <Row
              label={isKo ? '구매 예정 총' : 'Total planned'}
              value={`${totalPlannedCost}${unit}`}
              bold
            />
            {lockedPlannedCost > 0 && (
              <>
                <Row
                  label={isKo ? '└ 구매 가능' : '└ Purchasable'}
                  value={`${purchasablePlannedCost}${unit}`}
                  color={theme.colors.affinity}
                  indent
                />
                <Row
                  label={isKo ? '└ 잠김 (호감도/시패 부족)' : '└ Locked'}
                  value={`-${lockedPlannedCost}${unit}`}
                  color={theme.colors.locked}
                  indent
                />
                <div style={{
                  marginTop: '6px', padding: '6px 10px', borderRadius: '6px',
                  background: '#FFF8E1', border: '1px solid #FFE082',
                  fontSize: '11px', color: '#795548', lineHeight: 1.5
                }}>
                  {isKo
                    ? `⚠️ 잠긴 아이템(${lockedPlannedCost}개 양초)은 구매 불가이므로 실제 지출에서 제외됩니다. 아래 여유 양초는 잠긴 비용이 환원된 값입니다.`
                    : `⚠️ Locked items (${lockedPlannedCost} candles) are excluded from actual spending. The surplus below reflects this.`}
                </div>
              </>
            )}
          </Section>
        )}

        {/* ── 종합 결과 ── */}
        <Section title={isKo ? '종합 결과' : 'Summary'}>
          {/* 양초 */}
          {candlePossible ? (() => {
            const surplusDays = Math.floor(candleDifference / dailyCandles);
            // 호감도·동행 조건까지 모두 충족해야 "목표 달성 가능" 문구 표시
            const fullyFeasible = affinityPossible && companionPossible;
            return (
              <div style={{
                padding: '8px 12px', borderRadius: '8px', marginBottom: '6px',
                background: '#E8F5E9', border: '1px solid #A5D6A7',
                fontSize: '13px', color: '#2E7D32', fontWeight: 'bold'
              }}>
                ✅ {isKo
                  ? `양초 ${candleDifference}개 여유`
                  : `${candleDifference} candles to spare`}
                {surplusDays > 0 && fullyFeasible && (
                  <span style={{ fontWeight: 'normal', fontSize: '12px', marginLeft: '6px', color: '#388E3C' }}>
                    {isKo
                      ? `(시즌 종료 약 ${surplusDays}일 전에 목표 달성 가능)`
                      : `(goal reached ~${surplusDays}d before season end)`}
                  </span>
                )}
                {!fullyFeasible && (
                  <span style={{ fontWeight: 'normal', fontSize: '12px', marginLeft: '6px', color: '#E65100' }}>
                    {isKo ? '(아래 조건 해결 필요)' : '(resolve issues below first)'}
                  </span>
                )}
              </div>
            );
          })() : (
            <div style={{
              padding: '8px 12px', borderRadius: '8px', marginBottom: '6px',
              background: '#FFEBEE', border: '1px solid #EF9A9A',
              fontSize: '13px', color: '#C62828', fontWeight: 'bold'
            }}>
              ❌ {isKo
                ? `양초 ${Math.abs(candleDifference)}개 부족합니다.`
                : `${Math.abs(candleDifference)} candles short.`}
              <div style={{ fontSize: '11px', fontWeight: 'normal', marginTop: '3px', color: '#E65100' }}>
                💡 {isKo ? '현질하거나 2배 이벤트를 노리세요!' : 'Try cash packs or wait for a 2× candle event!'}
              </div>
            </div>
          )}

          {/* 동행 */}
          {companionPossible ? (
            <div style={{
              padding: '8px 12px', borderRadius: '8px', marginBottom: '6px',
              background: '#E8F5E9', border: '1px solid #A5D6A7',
              fontSize: '13px', color: '#2E7D32'
            }}>
              ✅ {isKo
                ? `동행 일수 여유 ${remainingCompanionDays}일 있습니다.`
                : `${remainingCompanionDays} companion days remaining.`}
            </div>
          ) : (
            <div style={{
              padding: '8px 12px', borderRadius: '8px', marginBottom: '6px',
              background: '#FFEBEE', border: '1px solid #EF9A9A',
              fontSize: '13px', color: '#C62828'
            }}>
              ❌ {isKo
                ? `동행 일수 ${Math.abs(remainingCompanionDays)}일 초과합니다.`
                : `${Math.abs(remainingCompanionDays)} companion days over budget.`}
            </div>
          )}

          {/* 호감도/잠김 */}
          {affinityPossible ? (
            <div style={{
              padding: '8px 12px', borderRadius: '8px', marginBottom: '6px',
              background: '#E8F5E9', border: '1px solid #A5D6A7',
              fontSize: '13px', color: '#2E7D32'
            }}>
              ✅ {isKo ? '모든 예정 아이템 달성 가능합니다.' : 'All planned items are reachable.'}
            </div>
          ) : (
            <div style={{
              padding: '8px 12px', borderRadius: '8px', marginBottom: '6px',
              background: '#FFF8E1', border: '1px solid #FFD54F',
              fontSize: '13px', color: '#E65100'
            }}>
              ⚠️ {isKo
                ? `${totalLockedCount}개 아이템이 잠겨 있습니다. 아래 영혼별 상세를 확인하세요.`
                : `${totalLockedCount} item(s) locked. See spirit details below.`}
            </div>
          )}
        </Section>

        {/* ── 영혼별 상세 ── */}
        {spiritResults?.some(r =>
          r.totalPlannedCost > 0 || r.ownedAffinity > 0 ||
          r.pastCompanionAffinity > 0 || r.futureCompanionAffinity > 0
        ) && (
          <>
            <div style={{
              fontWeight: 'bold', fontSize: '11px', color: theme.colors.textLight,
              letterSpacing: '0.5px', borderBottom: `1px solid ${theme.colors.border}`,
              paddingBottom: '4px', marginBottom: '8px'
            }}>
              {isKo ? '영혼별 상세 (클릭해서 펼치기)' : 'Per-spirit details (click to expand)'}
            </div>
            {spiritResults.map(r => (
              <SpiritCard key={r.spiritId} r={r} language={language} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
