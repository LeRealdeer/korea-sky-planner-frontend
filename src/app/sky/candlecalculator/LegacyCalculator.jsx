"use client";
import React, { useState } from 'react';
import { spiritsData as rawSpiritsData } from './data/spiritsData';
import { theme } from './styles/theme';

const BONUS_CANDLES = 31;
const SEASON_END = new Date("2026-10-02T16:00:00+09:00");

function getRemainingDays() {
  return Math.max(0, Math.floor((SEASON_END.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

/* ─── 구버전 번역 ─────────────────────────────────────────── */
const legacyT = {
  ko: {
    title: '스카이 양초 계산기',
    subtitle: '구버전',
    remainingDays: '남은 시즌 일수',
    currentCandles: '현재 보유 양초',
    ownsSeasonPass: '시즌 패스 소유',
    yes: '예', no: '아니오',
    buySeasonPass: '시패 구입 예정',
    bonusCandles: '개',
    requiredCandles: '필요한 양초',
    selectAll: '전체선택', clear: '해제',
    calculate: '계산하기!',
    calculationResult: '📊 계산 결과',
    remainingSeasonDays: '🕐 남은 시즌 일수', days: '일',
    dailyCandles: '💰 일일 획득 양초',
    currentCandlesLabel: '현재 보유 양초',
    remainingPeriodCandles: '남은 기간 획득 양초',
    seasonPassBonus: '시패 보너스',
    totalObtainableCandles: '총 획득 가능 양초',
    neededCandles: '필요한 추가 양초\n(선택 양초 - 현재 양초)',
    remainingCandles: '남는 양초', shortageCandles: '부족한 양초',
    daysNeeded: '⏱️ 선택한 아이템까지 필요 일수',
    backToMain: '메인화면으로',
    alreadyEnough: '이미 {amount}개 남습니다!',
    notices: [
      '• 아이콘은 Sky Wiki에서 참고하였으며, 양초와 하트 아이콘은 햇비님 제작 자료입니다.',
      '• 오후 5시 리셋 이후 양초를 얻었다는 가정 하에 계산됩니다. 아직 리셋 전 오늘 일퀘를 안하셨다면 일퀘 양초를 포함해서 계산해주세요.',
      '• 구매 예정이라면 시패 보유 여부 아니오 선택 후 구매예정 버튼을 눌러주세요.',
      '• (시즌초 2배 이벤트 미포함) 오른쪽 하단의 숫자는 재화 개수입니다.'
    ]
  },
  en: {
    title: 'Sky Candle Calculator',
    subtitle: 'Legacy',
    remainingDays: 'Remaining Season Days',
    currentCandles: 'Current Candles',
    ownsSeasonPass: 'Season Pass',
    yes: 'Yes', no: 'No',
    buySeasonPass: 'Plan to Buy Season Pass',
    bonusCandles: 'candles',
    requiredCandles: 'Required Candles',
    selectAll: 'Select All', clear: 'Clear',
    calculate: 'Calculate!',
    calculationResult: '📊 Calculation Result',
    remainingSeasonDays: '🕐 Days Left', days: 'days',
    dailyCandles: '💰 Daily Candles',
    currentCandlesLabel: 'Current Candles',
    remainingPeriodCandles: 'Obtainable Candles',
    seasonPassBonus: 'Season Pass Bonus',
    totalObtainableCandles: 'Total Obtainable',
    neededCandles: 'Needed Candles',
    remainingCandles: 'Extra Candles', shortageCandles: 'Short by',
    daysNeeded: '⏱️ Days Needed',
    backToMain: 'Back to Main',
    alreadyEnough: 'You already have {amount} extra!',
    notices: [
      '• Icons referenced from Sky Wiki, candle and heart icons by 햇비 Sky Solar.',
      "• Calculated assuming candles obtained after 5 PM reset. (Include today's dailies candles if not completed yet)",
      "• Select 'No' for Season Pass and if you plan to get one, check 'Plan to Buy a Season Pass'.",
      '• Numbers in bottom right show item price (excluding season start 2x event).'
    ]
  }
};

/* ─── NodeItem ───────────────────────────────────────────── */
function LegacyNodeItem({ node, isSelected, onToggle }) {
  const isSeason = node.type === 'season';
  return (
    <div
      onClick={onToggle}
      title={node.id}
      style={{
        position: 'relative', width: '70px', height: '70px',
        border: isSelected ? `3px solid ${theme.colors.planned}` : '2px solid #BDBDBD',
        borderRadius: '8px', cursor: 'pointer',
        background: isSelected ? '#E3F2FD' : theme.colors.white,
        overflow: 'hidden', transition: 'all 0.15s', userSelect: 'none',
        boxShadow: isSelected ? '0 2px 8px rgba(33,150,243,0.25)' : '0 1px 3px rgba(0,0,0,0.08)'
      }}
    >
      <img
        src={`/sky/calculator/${node.id}.webp`} alt={node.id}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
        draggable={false}
      />
      <div style={{ position: 'absolute', inset: 0, display: 'none', alignItems: 'center', justifyContent: 'center', background: '#E8E8E8', fontSize: '22px', color: '#999' }}>
        {isSeason ? '⭐' : '📦'}
      </div>
      {isSeason && (
        <img src="/sky/calculator/season.webp" alt="season"
          style={{ position: 'absolute', top: '2px', right: '2px', width: '14px', height: '14px', objectFit: 'contain', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      )}
      {node.cost > 0 && (
        <div style={{
          position: 'absolute', bottom: '2px', right: '2px',
          background: isSelected ? theme.colors.planned : '#9E9E9E',
          color: '#fff', fontSize: '9px', fontWeight: 'bold',
          padding: '1px 4px', borderRadius: '3px', lineHeight: 1.4, zIndex: 10
        }}>{node.cost}</div>
      )}
    </div>
  );
}

/* ─── LevelRow ───────────────────────────────────────────── */
function LegacyLevelRow({ levelData, selectedNodes, onToggle }) {
  const { level, leftNodes, rightNodes } = levelData;
  const rightDisplayNodes = rightNodes.length > 0
    ? rightNodes
    : (leftNodes[2] ? [leftNodes[2]] : []);
  const hasMultiRight = rightDisplayNodes.length > 1;

  return (
    <div style={{ width: 'fit-content', marginBottom: '8px' }}>
      <div style={{ display: 'flex', alignItems: hasMultiRight ? 'center' : 'flex-start', gap: '6px' }}>
        <div style={{
          width: '38px', flexShrink: 0, textAlign: 'right',
          fontSize: '10px', fontWeight: 'bold', color: theme.colors.primary,
          lineHeight: 1.3,
          paddingTop: hasMultiRight ? '0' : '28px'
        }}>
          {level}단계
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '70px 70px 70px', gap: '5px', alignItems: 'end' }}>
          {leftNodes[0]
            ? <LegacyNodeItem node={leftNodes[0]} isSelected={selectedNodes.has(leftNodes[0].id)} onToggle={() => onToggle(leftNodes[0].id)} />
            : <div style={{ width: 70, height: 70 }} />
          }
          {leftNodes[1]
            ? <LegacyNodeItem node={leftNodes[1]} isSelected={selectedNodes.has(leftNodes[1].id)} onToggle={() => onToggle(leftNodes[1].id)} />
            : <div style={{ width: 70, height: 70 }} />
          }
          <div style={{ display: 'flex', flexDirection: hasMultiRight ? 'column-reverse' : 'column', gap: '4px', alignItems: 'center' }}>
            {rightDisplayNodes.map(node => (
              <LegacyNodeItem key={node.id} node={node} isSelected={selectedNodes.has(node.id)} onToggle={() => onToggle(node.id)} />
            ))}
            {rightDisplayNodes.length === 0 && <div style={{ width: 70, height: 70 }} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── SpiritCard ─────────────────────────────────────────── */
function LegacySpiritCard({ spirit, selectedNodes, onToggle, onSelectAll, onClearAll, t }) {
  const spiritName = typeof spirit.name === 'object' ? (spirit.name.ko ?? Object.values(spirit.name)[0]) : spirit.name;
  const selectedCost = spirit.levels.reduce((sum, lv) =>
    sum + [...lv.leftNodes, ...lv.rightNodes].filter(n => selectedNodes.has(n.id)).reduce((s, n) => s + (n.cost ?? 0), 0), 0);
  const totalCost = spirit.levels.reduce((sum, lv) =>
    sum + [...lv.leftNodes, ...lv.rightNodes].reduce((s, n) => s + (n.cost ?? 0), 0), 0);
  const sortedLevels = [...spirit.levels].sort((a, b) => b.level - a.level);

  return (
    <div style={{ border: `2px solid ${theme.colors.border}`, borderRadius: '12px', padding: '14px', background: theme.colors.white, width: '100%', boxSizing: 'border-box', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
      <div style={{ width: '100%', height: '80px', background: theme.colors.background, borderRadius: '8px', marginBottom: '10px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${theme.colors.border}` }}>
        <img src={`/sky/calculator/s${spirit.id}.webp`} alt={spiritName}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
        />
        <div style={{ fontSize: '12px', color: theme.colors.textLight, display: 'none' }}>{spiritName}</div>
      </div>
      <div style={{ fontSize: '13px', fontWeight: 'bold', textAlign: 'center', color: theme.colors.text, marginBottom: '10px' }}>{spiritName}</div>
      <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
        <button onClick={() => onSelectAll(spirit)} style={{ flex: 1, padding: '5px 0', fontSize: '11px', fontWeight: 'bold', background: theme.colors.primary, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          {t.selectAll}
        </button>
        <button onClick={() => onClearAll(spirit)} style={{ flex: 1, padding: '5px 0', fontSize: '11px', fontWeight: 'bold', background: '#F5F5F5', color: '#757575', border: '1px solid #E0E0E0', borderRadius: '8px', cursor: 'pointer' }}>
          {t.clear}
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {sortedLevels.map(lv => (
          <LegacyLevelRow key={lv.level} levelData={lv} selectedNodes={selectedNodes} onToggle={onToggle} />
        ))}
      </div>
      <div style={{ borderTop: `2px solid ${theme.colors.border}`, paddingTop: '10px', marginTop: '6px', textAlign: 'center' }}>
        <div style={{ fontSize: '11px', color: theme.colors.textLight, marginBottom: '3px' }}>{t.total} {totalCost}{t.bonusCandles}</div>
        <div style={{ fontSize: '15px', fontWeight: 'bold', color: theme.colors.planned }}>{t.selected} {selectedCost}{t.bonusCandles}</div>
      </div>
    </div>
  );
}

/* ─── SettingsPanel ──────────────────────────────────────── */
function LegacySettingsPanel({ currentCandles, setCurrentCandles, ownsSeasonPass, setOwnsSeasonPass, buySeasonPass, setBuySeasonPass, remainingDays, totalRequired, t }) {
  return (
    <div style={{ background: theme.colors.white, padding: '20px', borderRadius: '12px', marginBottom: '24px', marginLeft: 'auto', marginRight: 'auto', border: `2px solid ${theme.colors.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: '800px' }}>
      {/* 설명 문구 */}
      <div style={{ marginBottom: '16px', padding: '12px', background: theme.colors.background, borderRadius: '6px', fontSize: '12px', lineHeight: '1.6', color: theme.colors.textLight }}>
        {t.notices.map((notice, i) => {
          const text = notice.replace('{BONUS_CANDLES}', BONUS_CANDLES);
          if (i === 0) {
            const parts = text.split('Sky Wiki');
            return (
              <div key={i} style={{ marginBottom: i < t.notices.length - 1 ? '4px' : '0' }}>
                {parts[0]}
                <a href="https://sky-children-of-the-light.fandom.com/wiki/Season_of_Lightseek"
                  target="_blank" rel="noopener noreferrer"
                  style={{ color: theme.colors.primary, textDecoration: 'underline', fontWeight: 'bold' }}>
                  Sky Wiki
                </a>
                {parts[1]}
              </div>
            );
          }
          return <div key={i} style={{ marginBottom: i < t.notices.length - 1 ? '4px' : '0' }}>{text}</div>;
        })}
      </div>

      <div style={{ marginBottom: '14px', fontWeight: 'bold', fontSize: '15px', color: theme.colors.primary }}>
        {t.remainingDays}: {remainingDays}{t.days}
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '14px', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: theme.colors.text, fontWeight: '500' }}>{t.currentCandles}</label>
          <input type="number" value={currentCandles}
            onChange={(e) => setCurrentCandles(Math.max(0, Number(e.target.value) || 0))}
            style={{ padding: '6px 10px', borderRadius: '6px', border: `2px solid ${theme.colors.border}`, background: theme.colors.white, color: theme.colors.text, width: '100px', fontSize: '13px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: theme.colors.text, fontWeight: '500' }}>{t.ownsSeasonPass}</label>
          <select value={ownsSeasonPass} onChange={(e) => setOwnsSeasonPass(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '6px', border: `2px solid ${theme.colors.border}`, background: theme.colors.white, color: theme.colors.text, fontSize: '13px', cursor: 'pointer' }}>
            <option value="yes">{t.yes}</option>
            <option value="no">{t.no}</option>
          </select>
        </div>
        <div style={{ opacity: ownsSeasonPass === 'yes' ? 0.5 : 1 }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: theme.colors.text, cursor: ownsSeasonPass === 'yes' ? 'not-allowed' : 'pointer', paddingBottom: '6px' }}>
            <input type="checkbox"
              checked={ownsSeasonPass === 'yes' ? false : buySeasonPass}
              onChange={() => setBuySeasonPass(p => !p)}
              disabled={ownsSeasonPass === 'yes'}
              style={{ marginRight: '6px', width: '16px', height: '16px', cursor: ownsSeasonPass === 'yes' ? 'not-allowed' : 'pointer' }}
            />
            {t.buySeasonPass} (+{BONUS_CANDLES}{t.bonusCandles})
          </label>
        </div>
      </div>

      <div style={{ marginTop: '12px', padding: '12px', background: theme.colors.background, borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', color: theme.colors.primary, border: `2px solid ${theme.colors.border}`, textAlign: 'center' }}>
        {t.requiredCandles}: {totalRequired}{t.bonusCandles}
      </div>
    </div>
  );
}

/* ─── CalculationResult ──────────────────────────────────── */
function LegacyCalculationResult({ onCalculate, calcResult, t }) {
  return (
    <div style={{ background: theme.colors.white, padding: '16px', borderRadius: '12px', marginTop: '30px', marginBottom: '30px', marginLeft: 'auto', marginRight: 'auto', border: `2px solid ${theme.colors.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: '600px', width: '100%', boxSizing: 'border-box' }}>
      <button onClick={onCalculate}
        style={{ padding: '12px 24px', background: theme.colors.primary, color: theme.colors.white, border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', transition: 'background 0.2s', width: '100%', maxWidth: '200px', display: 'block', marginLeft: 'auto', marginRight: 'auto', marginBottom: calcResult ? '20px' : '0' }}
        onMouseEnter={(e) => e.target.style.background = '#1976D2'}
        onMouseLeave={(e) => e.target.style.background = theme.colors.primary}
      >
        {t.calculate}
      </button>

      {calcResult && (
        <div style={{ background: theme.colors.background, borderRadius: '8px', border: `2px solid ${theme.colors.primary}`, overflow: 'hidden' }}>
          <div style={{ background: theme.colors.primary, color: theme.colors.white, padding: '12px', fontWeight: 'bold', fontSize: '15px', textAlign: 'center' }}>
            {t.calculationResult}
          </div>
          <div style={{ padding: '16px' }}>
            {[
              [t.remainingSeasonDays, `${calcResult.remainingDays}${t.days}`],
              [t.dailyCandles, `${calcResult.dailyCandleCount}${t.bonusCandles}`]
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                <span>{label}</span>
                <span style={{ fontWeight: 'bold', color: theme.colors.primary }}>{val}</span>
              </div>
            ))}
            <div style={{ borderTop: `2px solid ${theme.colors.border}`, margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span>{t.currentCandlesLabel}</span>
              <span style={{ fontWeight: 'bold' }}>{calcResult.currentCandles}{t.bonusCandles}</span>
            </div>
            <div style={{ marginBottom: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>{t.remainingPeriodCandles}</span>
                <span style={{ fontWeight: 'bold' }}>{calcResult.seasonCandlesFromDays}{t.bonusCandles}</span>
              </div>
              <div style={{ fontSize: '11px', color: theme.colors.textLight, textAlign: 'right' }}>
                ({calcResult.dailyCandleCount}{t.bonusCandles} × {calcResult.remainingDays}{t.days})
              </div>
            </div>
            {calcResult.bonusText && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px', color: theme.colors.primary }}>
                <span>{t.seasonPassBonus}</span>
                <span style={{ fontWeight: 'bold' }}>+31{t.bonusCandles}</span>
              </div>
            )}
            <div style={{ borderTop: `2px solid ${theme.colors.border}`, margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px', fontWeight: 'bold', color: theme.colors.primary }}>
              <span>{t.totalObtainableCandles}</span>
              <span>{calcResult.totalSeasonCandles}{t.bonusCandles}</span>
            </div>
            <div style={{ borderTop: `2px solid ${theme.colors.border}`, margin: '12px 0' }} />
            <div style={{ background: '#E3F2FD', padding: '10px', borderRadius: '6px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold', color: theme.colors.text }}>
                <span>{t.selected}</span>
                <span>{calcResult.totalRequired}{t.bonusCandles}</span>
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold', marginBottom: '6px' }}>
                <span style={{ whiteSpace: 'pre-line' }}>{t.neededCandles}</span>
                <span>{calcResult.neededCandles}{t.bonusCandles}</span>
              </div>
              <div style={{ fontSize: '12px', color: theme.colors.textLight, textAlign: 'right' }}>
                ({calcResult.totalRequired} - {calcResult.currentCandles}{calcResult.hasBonus ? ' - 31' : ''} = {calcResult.neededCandles})
              </div>
              {calcResult.neededCandles < 0 && (
                <div style={{ marginTop: '8px', padding: '8px', background: '#E8F5E9', borderRadius: '6px', fontSize: '13px', color: '#2E7D32', textAlign: 'center', fontWeight: 'bold' }}>
                  {t.alreadyEnough.replace('{amount}', Math.abs(calcResult.neededCandles))}
                </div>
              )}
            </div>
            <div style={{ background: calcResult.difference >= 0 ? '#E8F5E9' : '#FFEBEE', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 'bold', color: calcResult.difference >= 0 ? '#2E7D32' : '#C62828' }}>
                <span>{calcResult.difference >= 0 ? '✅ ' + t.remainingCandles : '⚠️ ' + t.shortageCandles}</span>
                <span>{Math.abs(calcResult.difference)}{t.bonusCandles}</span>
              </div>
            </div>
            {calcResult.neededCandles > 0 && calcResult.finalDays >= 0 && calcResult.finalDays <= calcResult.remainingDays && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: theme.colors.primary, fontWeight: 'bold' }}>
                <span>{t.daysNeeded}</span>
                <span>{calcResult.finalDays}{t.days}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── 메인 컴포넌트 ──────────────────────────────────────── */
export function LegacyCalculator({ language = 'ko' }) {
  const t = legacyT[language] ?? legacyT.ko;
  const [selectedNodes, setSelectedNodes] = useState(new Set());
  const [currentCandles, setCurrentCandles] = useState(0);
  const [ownsSeasonPass, setOwnsSeasonPass] = useState('yes');
  const [buySeasonPass, setBuySeasonPass] = useState(false);
  const [remainingDays] = useState(getRemainingDays);
  const [calcResult, setCalcResult] = useState(null);

  const totalRequired = rawSpiritsData.reduce((sum, spirit) =>
    sum + spirit.levels.reduce((ls, lv) =>
      ls + [...lv.leftNodes, ...lv.rightNodes]
        .filter(n => selectedNodes.has(n.id))
        .reduce((s, n) => s + (n.cost ?? 0), 0), 0), 0);

  const handleCalculate = () => {
    const dailyCandleCount = ownsSeasonPass === 'yes' || (ownsSeasonPass === 'no' && buySeasonPass) ? 6 : 5;
    const seasonCandlesFromDays = remainingDays * dailyCandleCount;
    const extraCandles = ownsSeasonPass === 'no' && buySeasonPass ? BONUS_CANDLES : 0;
    const totalSeasonCandles = currentCandles + seasonCandlesFromDays + extraCandles;
    const difference = totalSeasonCandles - totalRequired;
    const neededCandles = totalRequired - currentCandles - extraCandles;
    const finalDays = Math.ceil(neededCandles / dailyCandleCount);
    const bonusText = extraCandles > 0 ? ` + ${t.seasonPassBonus} ${BONUS_CANDLES}${t.bonusCandles}` : '';
    setCalcResult({ remainingDays, dailyCandleCount, currentCandles, seasonCandlesFromDays, bonusText, totalSeasonCandles, totalRequired, difference, neededCandles, finalDays, hasBonus: extraCandles > 0 });
  };

  const toggle = (nodeId) => setSelectedNodes(prev => { const n = new Set(prev); n.has(nodeId) ? n.delete(nodeId) : n.add(nodeId); return n; });
  const selectAll = (spirit) => setSelectedNodes(prev => { const n = new Set(prev); spirit.levels.forEach(lv => [...lv.leftNodes, ...lv.rightNodes].forEach(nd => n.add(nd.id))); return n; });
  const clearAll = (spirit) => setSelectedNodes(prev => { const n = new Set(prev); spirit.levels.forEach(lv => [...lv.leftNodes, ...lv.rightNodes].forEach(nd => n.delete(nd.id))); return n; });

  return (
    <div>
      <LegacySettingsPanel
        currentCandles={currentCandles} setCurrentCandles={setCurrentCandles}
        ownsSeasonPass={ownsSeasonPass} setOwnsSeasonPass={setOwnsSeasonPass}
        buySeasonPass={buySeasonPass} setBuySeasonPass={setBuySeasonPass}
        remainingDays={remainingDays} totalRequired={totalRequired} t={t}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', justifyContent: 'center', gap: '20px', width: '100%', maxWidth: '660px', margin: '0 auto', padding: '0 10px', boxSizing: 'border-box' }}>
        {rawSpiritsData.map(spirit => (
          <LegacySpiritCard key={spirit.id} spirit={spirit} selectedNodes={selectedNodes} onToggle={toggle} onSelectAll={selectAll} onClearAll={clearAll} t={t} />
        ))}
      </div>

      <LegacyCalculationResult onCalculate={handleCalculate} calcResult={calcResult} t={t} />
    </div>
  );
}
