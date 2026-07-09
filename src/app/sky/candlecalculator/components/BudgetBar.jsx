"use client";
import React from 'react';

export function BudgetBar({
  candlePossible, candleDifference, totalAvailableCandles, totalPlannedCost,
  companionPossible, remainingCompanionDays, remainingDays, totalFutureCompanionDays,
  language
}) {
  const isKo = language === 'ko';

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: '#F5F9FF',
      borderBottom: '2px solid #E3F2FD',
      boxShadow: '0 3px 8px rgba(33,150,243,0.12)',
      padding: '8px 20px',
      marginLeft: '-20px', marginRight: '-20px'
    }}>
      <div style={{
        maxWidth: '660px', margin: '0 auto',
        display: 'flex', gap: '8px'
      }}>
        {/* 양초 예산 */}
        <div style={{
          flex: 1, minWidth: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 12px', borderRadius: '9px',
          background: candlePossible ? '#E8F5E9' : '#FFEBEE',
          border: `1.5px solid ${candlePossible ? '#81C784' : '#EF9A9A'}`
        }}>
          <div>
            <div style={{ fontSize: '10px', color: '#888', marginBottom: '1px' }}>
              {isKo ? '양초 예산' : 'Candle Budget'}
            </div>
            <div style={{ fontSize: '11px', color: '#666' }}>
              {totalAvailableCandles}{isKo ? '개' : ''} − {totalPlannedCost}{isKo ? '개' : ''}
            </div>
          </div>
          <div style={{
            fontWeight: 'bold', fontSize: '18px', lineHeight: 1,
            color: candlePossible ? '#2E7D32' : '#C62828'
          }}>
            {candlePossible ? '+' : '−'}{Math.abs(candleDifference)}{isKo ? '개' : ''}
          </div>
        </div>

        {/* 동행 예산 */}
        <div style={{
          flex: 1, minWidth: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 12px', borderRadius: '9px',
          background: companionPossible ? '#E8F5E9' : '#FFEBEE',
          border: `1.5px solid ${companionPossible ? '#81C784' : '#EF9A9A'}`
        }}>
          <div>
            <div style={{ fontSize: '10px', color: '#888', marginBottom: '1px' }}>
              {isKo ? '동행 예산' : 'Companion Budget'}
            </div>
            <div style={{ fontSize: '11px', color: '#666' }}>
              {remainingDays}일 − {totalFutureCompanionDays}일
            </div>
          </div>
          <div style={{
            fontWeight: 'bold', fontSize: '18px', lineHeight: 1,
            color: companionPossible ? '#2E7D32' : '#C62828'
          }}>
            {companionPossible ? '+' : '−'}{Math.abs(remainingCompanionDays)}일
          </div>
        </div>
      </div>
    </div>
  );
}
