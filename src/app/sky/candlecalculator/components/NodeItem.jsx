"use client";
import React from 'react';
import { theme } from '../styles/theme';

// nodeState: 'owned' | 'target' | 'candidate' | null
export function NodeItem({ node, nodeState, onToggle, isSeasonLocked }) {
  const isSeason = node.type === 'season';
  const imagePath = `/sky/calculator/${node.id}.webp`;

  const getBorder = () => {
    if (isSeasonLocked) return `2px solid ${theme.colors.seasonLocked}`;
    if (nodeState === 'target')    return `3px solid ${theme.colors.target}`;
    if (nodeState === 'owned')     return `2px solid ${theme.colors.owned}`;
    if (nodeState === 'candidate') return `2px dashed ${theme.colors.candidate}`;
    return `2px solid ${theme.colors.border}`;
  };

  const getBackground = () => {
    if (isSeasonLocked)             return '#F5F5F5';
    if (nodeState === 'target')     return '#E3F2FD';
    if (nodeState === 'owned')      return '#F5F5F5';
    if (nodeState === 'candidate')  return '#FFF3E0';
    return theme.colors.white;
  };

  const getCostColor = () => {
    if (isSeasonLocked)             return '#9E9E9E';
    if (nodeState === 'candidate')  return theme.colors.candidate;
    if (nodeState === 'owned')      return theme.colors.owned;
    if (nodeState === 'target')     return theme.colors.primary;
    return '#90A4AE';
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onClick={isSeasonLocked ? undefined : onToggle}
        style={{
          width: '70px', height: '70px',
          border: getBorder(),
          borderRadius: '8px',
          cursor: isSeasonLocked ? 'not-allowed' : 'pointer',
          background: getBackground(),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', transition: 'all 0.15s',
          boxShadow: nodeState === 'target' ? '0 2px 8px rgba(33,150,243,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden', opacity: isSeasonLocked ? 0.5 : 1
        }}
        onMouseEnter={(e) => {
          if (!isSeasonLocked && !nodeState) e.currentTarget.style.background = theme.colors.hover;
        }}
        onMouseLeave={(e) => {
          if (!nodeState) e.currentTarget.style.background = theme.colors.white;
        }}
      >
        <img src={imagePath} alt={node.id}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
        />
        <div style={{ fontSize: '28px', display: 'none' }}>{isSeason ? '⭐' : '📦'}</div>

        {isSeason && !isSeasonLocked && (
          <div style={{ position: 'absolute', top: '2px', right: '2px', width: '18px', height: '18px', zIndex: 10 }}>
            <img src="/sky/calculator/season.webp" alt="season"
              style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} />
          </div>
        )}

        {isSeasonLocked && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
            🔒
          </div>
        )}

        {/* 보유 체크 */}
        {nodeState === 'owned' && (
          <div style={{
            position: 'absolute', top: '2px', left: '2px',
            background: theme.colors.owned, color: '#fff',
            width: '16px', height: '16px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '10px', fontWeight: 'bold', zIndex: 10
          }}>✓</div>
        )}

        {node.cost > 0 && (
          <div style={{
            position: 'absolute', bottom: '3px', right: '3px',
            background: getCostColor(), color: '#fff',
            padding: '1px 4px', borderRadius: '3px',
            fontSize: '10px', fontWeight: 'bold', lineHeight: '1.2', zIndex: 10
          }}>
            {node.cost}
          </div>
        )}
      </div>
    </div>
  );
}
