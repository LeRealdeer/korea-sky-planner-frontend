"use client";
import React, { useState } from 'react';
import { theme } from '../styles/theme';

function Row({ label, value, color, bold, indent }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      padding: '3px 0', fontSize: '13px', paddingLeft: indent ? '14px' : 0
    }}>
      <span style={{ color: indent ? theme.colors.textLight : theme.colors.text }}>{label}</span>
      <span style={{ fontWeight: bold ? 'bold' : 'normal', color: color || theme.colors.text }}>{value}</span>
    </div>
  );
}

export function SimpleResult({ simResult, language }) {
  const [simpleTarget, setSimpleTarget] = useState('');

  if (!simResult) return null;
  const isKo = language === 'ko';
  const unit = isKo ? '개' : ' candles';

  const {
    currentCandles, remainingDays, dailyCandles, seasonPassBonus,
    candlesFromDays, totalAvailableCandles
  } = simResult;

  const target = Number(simpleTarget) || 0;
  const hasTarget = simpleTarget !== '' && target > 0;
  const diff = totalAvailableCandles - target;
  const candlePossible = diff >= 0;
  const surplusDays = candlePossible && dailyCandles > 0
    ? Math.floor(diff / dailyCandles)
    : 0;

  return (
    <div style={{
      maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto',
      marginBottom: '30px',
      background: theme.colors.white, borderRadius: '12px',
      border: `2px solid ${theme.colors.border}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden'
    }}>
      <div style={{
        padding: '11px 16px', fontWeight: 'bold', fontSize: '14px',
        background: '#E3F2FD', color: theme.colors.primary, textAlign: 'center'
      }}>
        {isKo ? '간단 양초 계산기' : 'Simple Candle Calculator'}
      </div>

      <div style={{ padding: '18px 18px 14px' }}>

        {/* 양초 수급 브레이크다운 */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            fontSize: '11px', fontWeight: 'bold', color: theme.colors.textLight,
            borderBottom: `1px solid ${theme.colors.border}`,
            paddingBottom: '4px', marginBottom: '10px', letterSpacing: '0.5px'
          }}>
            {isKo ? '시즌 종료까지 획득 가능 양초' : 'Candles available by season end'}
          </div>
          <Row label={isKo ? '현재 보유' : 'Current'} value={`${currentCandles}${unit}`} />
          <Row
            label={isKo
              ? `+ 남은 ${remainingDays}일 × ${dailyCandles}개/일`
              : `+ ${remainingDays}d × ${dailyCandles}/day`}
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
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            padding: '6px 0 2px', borderTop: `1px solid ${theme.colors.border}`, marginTop: '4px'
          }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px', color: theme.colors.text }}>
              {isKo ? '총 획득 가능' : 'Total available'}
            </span>
            <span style={{
              fontWeight: 'bold', fontSize: '18px', color: theme.colors.primary
            }}>
              {totalAvailableCandles}{unit}
            </span>
          </div>
        </div>

        {/* 목표 입력 */}
        <div style={{
          background: '#F8FBFF', borderRadius: '10px', padding: '14px 16px',
          border: `1px solid ${theme.colors.border}`, marginBottom: '14px'
        }}>
          <div style={{ fontSize: '12px', color: theme.colors.textLight, marginBottom: '8px', fontWeight: 'bold' }}>
            {isKo ? '목표 양초 입력 (선택)' : 'Enter your target (optional)'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="number"
              min={0}
              value={simpleTarget}
              onChange={e => setSimpleTarget(e.target.value)}
              placeholder={isKo ? '필요한 양초 수' : 'Candles needed'}
              style={{
                flex: 1, padding: '8px 10px', fontSize: '15px', fontWeight: 'bold',
                borderRadius: '7px', border: `1.5px solid ${theme.colors.border}`,
                textAlign: 'center', color: theme.colors.text
              }}
            />
            <span style={{ fontSize: '13px', color: theme.colors.textLight }}>{unit.trim()}</span>
          </div>
        </div>

        {/* 결과 */}
        {hasTarget && (
          candlePossible ? (
            <div style={{
              padding: '12px 14px', borderRadius: '8px',
              background: '#E8F5E9', border: '1px solid #A5D6A7',
              fontSize: '14px', color: '#2E7D32', fontWeight: 'bold'
            }}>
              ✅ {isKo ? `양초 ${diff}개 여유` : `${diff} candles to spare`}
              {surplusDays > 0 && (
                <div style={{ fontWeight: 'normal', fontSize: '12px', marginTop: '4px', color: '#388E3C' }}>
                  {isKo
                    ? `시즌 종료 약 ${surplusDays}일 전에 목표 달성 가능`
                    : `Goal reached ~${surplusDays}d before season end`}
                </div>
              )}
            </div>
          ) : (
            <div style={{
              padding: '12px 14px', borderRadius: '8px',
              background: '#FFEBEE', border: '1px solid #EF9A9A',
              fontSize: '14px', color: '#C62828', fontWeight: 'bold'
            }}>
              ❌ {isKo ? `양초 ${Math.abs(diff)}개 부족합니다.` : `${Math.abs(diff)} candles short.`}
              <div style={{ fontSize: '12px', fontWeight: 'normal', marginTop: '4px', color: '#E65100' }}>
                💡 {isKo ? '현질하거나 2배 이벤트를 노리세요!' : 'Try cash packs or wait for a 2× candle event!'}
              </div>
            </div>
          )
        )}

        {!hasTarget && (
          <div style={{
            padding: '10px 14px', borderRadius: '8px',
            background: '#F3F8FF', border: `1px solid ${theme.colors.border}`,
            fontSize: '12px', color: theme.colors.textLight, textAlign: 'center'
          }}>
            {isKo
              ? '목표 양초를 입력하면 달성 가능 여부를 알려드립니다.'
              : 'Enter your target to check if it\'s achievable.'}
          </div>
        )}
      </div>
    </div>
  );
}
