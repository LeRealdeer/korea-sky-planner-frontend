"use client";
import React from 'react';
import { theme, translations } from '../styles/theme';

export function SettingsPanel({
  currentCandles, setCurrentCandles,
  ownsSeasonPass, setOwnsSeasonPass,
  buySeasonPass, setBuySeasonPass,
  remainingDays, totalRequired,
  calcMode, setCalcMode,
  todayCompanionDone, setTodayCompanionDone,
  language, isSimpleMode
}) {
  const BONUS_CANDLES = 31;
  const t = translations[language];

  return (
    <div style={{
      background: theme.colors.white, padding: '20px', borderRadius: '12px',
      marginBottom: '20px', marginLeft: 'auto', marginRight: 'auto',
      border: `2px solid ${theme.colors.border}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: '800px'
    }}>
      {/* 공지 */}
      <div style={{
        marginBottom: '16px', padding: '12px', background: theme.colors.background,
        borderRadius: '6px', fontSize: '12px', lineHeight: '1.6', color: theme.colors.textLight
      }}>
        {t.notices.map((notice, index) => {
          const text = notice.replace('{BONUS_CANDLES}', BONUS_CANDLES);
          if (index === 0) {
            const parts = text.split('Sky Wiki');
            return (
              <div key={index} style={{ marginBottom: '4px' }}>
                {parts[0]}
                <a href="https://sky-children-of-the-light.fandom.com/wiki/Season_of_Carnival"
                  target="_blank" rel="noopener noreferrer"
                  style={{ color: theme.colors.primary, textDecoration: 'underline', fontWeight: 'bold' }}>
                  Sky Wiki
                </a>
                {parts[1]}
              </div>
            );
          }
          return <div key={index} style={{ marginBottom: index < t.notices.length - 1 ? '4px' : '0' }}>{text}</div>;
        })}
      </div>

      <div style={{ marginBottom: '14px', fontWeight: 'bold', fontSize: '15px', color: theme.colors.primary }}>
        🕐 {t.remainingDays}: {remainingDays}{t.days}
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '14px', alignItems: 'flex-end' }}>
        {/* 현재 보유 양초 */}
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: theme.colors.text, fontWeight: '500' }}>
            {t.currentCandles}
          </label>
          <input type="number" value={currentCandles}
            onChange={(e) => setCurrentCandles(Number(e.target.value))}
            style={{ padding: '6px 10px', borderRadius: '6px', border: `2px solid ${theme.colors.border}`,
              background: theme.colors.white, color: theme.colors.text, width: '100px', fontSize: '13px' }}
          />
        </div>

        {/* 시즌패스 */}
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: theme.colors.text, fontWeight: '500' }}>
            {t.ownsSeasonPass}
          </label>
          <select value={ownsSeasonPass} onChange={(e) => setOwnsSeasonPass(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '6px', border: `2px solid ${theme.colors.border}`,
              background: theme.colors.white, color: theme.colors.text, fontSize: '13px', cursor: 'pointer' }}>
            <option value="yes">{t.yes}</option>
            <option value="no">{t.no}</option>
          </select>
        </div>

        {/* 시패 구매 예정 */}
        <div style={{ opacity: ownsSeasonPass === 'yes' ? 0.5 : 1 }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: theme.colors.text,
            cursor: ownsSeasonPass === 'yes' ? 'not-allowed' : 'pointer', paddingBottom: '6px' }}>
            <input type="checkbox"
              checked={ownsSeasonPass === 'yes' ? false : buySeasonPass}
              onChange={() => setBuySeasonPass(!buySeasonPass)}
              disabled={ownsSeasonPass === 'yes'}
              style={{ marginRight: '6px', width: '16px', height: '16px', cursor: ownsSeasonPass === 'yes' ? 'not-allowed' : 'pointer' }}
            />
            {t.buySeasonPass} (+{BONUS_CANDLES}{t.bonusCandles})
          </label>
        </div>

        {/* 오늘 동행 완료 — 호감도 모드에서만 */}
        {!isSimpleMode && (
          <div>
            <label style={{ display: 'flex', alignItems: 'center', fontSize: '13px',
              color: todayCompanionDone ? theme.colors.affinity : theme.colors.text,
              cursor: 'pointer', paddingBottom: '6px', fontWeight: todayCompanionDone ? 'bold' : 'normal' }}>
              <input type="checkbox" checked={todayCompanionDone} onChange={() => setTodayCompanionDone(!todayCompanionDone)}
                style={{ marginRight: '6px', width: '16px', height: '16px', cursor: 'pointer', accentColor: theme.colors.affinity }} />
              🤝 {t.todayCompanionDone}
            </label>
          </div>
        )}
      </div>

      {/* 계산 방식 — 호감도 모드에서만 */}
      {!isSimpleMode && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', color: theme.colors.text, fontWeight: '500' }}>{t.calcMode}:</span>
          {['saving', 'fastest'].map(mode => (
            <button key={mode} onClick={() => setCalcMode(mode)}
              style={{
                padding: '5px 14px',
                background: calcMode === mode ? theme.colors.primary : theme.colors.white,
                color: calcMode === mode ? theme.colors.white : theme.colors.primary,
                border: `2px solid ${theme.colors.primary}`, borderRadius: '16px',
                cursor: 'pointer', fontWeight: calcMode === mode ? 'bold' : 'normal', fontSize: '12px'
              }}>
              {mode === 'saving' ? t.modeSaving : t.modeFastest}
            </button>
          ))}
        </div>
      )}

      {/* 선택 비용 표시 */}
      <div style={{
        padding: '10px 12px', background: theme.colors.background, borderRadius: '8px',
        fontSize: '14px', fontWeight: 'bold', color: theme.colors.primary,
        border: `2px solid ${theme.colors.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <span>🎯 {t.requiredCandles}</span>
        <span>{totalRequired}{t.bonusCandles}</span>
      </div>
    </div>
  );
}
