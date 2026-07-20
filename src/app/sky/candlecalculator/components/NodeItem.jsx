"use client";
import React from 'react';
import { theme } from '../styles/theme';

export function NodeItem({ node, state = 'none', isLocked = false, canOwn = true, brushState = 'planned', onSetState, size = 66, language = 'ko' }) {
  const isSeason = node.type === 'season';
  const isKo = language === 'ko';

  // 보유 브러시인데 호감도 부족하면 클릭 막기
  const clickBlocked = brushState === 'owned' && !canOwn;

  // 현재 상태가 브러시와 같으면 해제(none), 아니면 브러시 상태로 토글
  const handleClick = () => {
    if (clickBlocked) return;
    const next = state === brushState ? 'none' : brushState;
    onSetState?.(next);
  };

  const getBorder = () => {
    if (isLocked)            return `2px dashed ${theme.colors.locked}`;
    if (state === 'planned') return `2px solid ${theme.colors.planned}`;
    if (state === 'owned')   return `2px solid ${theme.colors.affinity}`;
    return `1.5px solid #BDBDBD`;
  };

  const getBg = () => {
    if (isLocked)            return '#FFEBEE';
    if (state === 'planned') return '#E3F2FD';
    if (state === 'owned')   return '#E8F5E9';
    return theme.colors.white;
  };

  const costColor = state === 'owned'   ? 'rgba(76,175,80,0.85)'
                  : state === 'planned' ? 'rgba(33,150,243,0.85)'
                  : 'rgba(0,0,0,0.55)';

  const baseName = typeof node.name === 'object' ? Object.values(node.name)[0] : (node.name ?? node.id);
  const tooltip = clickBlocked
    ? `${baseName} — ${isKo ? '아직 이 단계에 도달하지 못해 "보유"를 적용할 수 없어요. 아랫단계 아이템부터 보유로 설정해주세요.' : 'Not reached yet — set lower-level items to "Owned" first.'}`
    : baseName;

  return (
    <div
      onClick={handleClick}
      title={tooltip}
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        cursor: clickBlocked ? 'not-allowed' : 'pointer',
        borderRadius: '8px',
        border: getBorder(),
        background: getBg(),
        overflow: 'hidden',
        transition: 'all 0.15s',
        userSelect: 'none',
        flexShrink: 0,
        opacity: clickBlocked ? 0.6 : 1,
        boxShadow: state !== 'none' ? '0 2px 6px rgba(0,0,0,0.18)' : 'none'
      }}
    >
      {/* 아이템 이미지 */}
      <img
        src={`/sky/calculator/${node.id}.webp`}
        alt={node.id}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
        draggable={false}
      />
      <div style={{
        position: 'absolute', inset: 0,
        display: 'none', alignItems: 'center', justifyContent: 'center',
        background: '#E8E8E8', fontSize: '22px', color: '#999'
      }}>
        {isSeason ? '⭐' : '📦'}
      </div>

      {/* 시즌 아이콘 — 우상단 */}
      {isSeason && (
        <img
          src="/sky/calculator/season.webp"
          alt="season"
          style={{
            position: 'absolute', top: '2px', right: '2px',
            width: '14px', height: '14px', objectFit: 'contain',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))'
          }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
      )}
      {isSeason && (
        <span style={{
          display: 'none',
          position: 'absolute', top: '2px', right: '2px',
          fontSize: '10px'
        }}>⭐</span>
      )}

      {/* 비용 — 우하단 */}
      {node.cost > 0 && (
        <div style={{
          position: 'absolute', bottom: '2px', right: '2px',
          background: costColor, color: '#fff',
          fontSize: '9px', fontWeight: 'bold',
          padding: '1px 4px', borderRadius: '3px', lineHeight: 1.4,
          zIndex: 10
        }}>
          {node.cost}
        </div>
      )}

      {/* 상태 배지 — 좌상단 */}
      {state === 'owned'               && <Badge color={theme.colors.affinity} label="보유" />}
      {state === 'planned' && !isLocked && <Badge color={theme.colors.planned} label="예정" />}
      {isLocked                         && <Badge color={theme.colors.locked}  label="잠김" />}

      {/* 보유 적용 불가 안내 */}
      {clickBlocked && (
        <div style={{
          position: 'absolute', top: '2px', right: '2px',
          fontSize: '10px', lineHeight: 1,
          filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.4))',
          zIndex: 10
        }}>
          🔒
        </div>
      )}
    </div>
  );
}

function Badge({ color, label }) {
  return (
    <div style={{
      position: 'absolute', top: '2px', left: '2px',
      background: color, color: '#fff',
      fontSize: '8px', fontWeight: 'bold',
      padding: '1px 3px', borderRadius: '3px', lineHeight: 1.3,
      zIndex: 10
    }}>
      {label}
    </div>
  );
}
