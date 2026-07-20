"use client";
import React from 'react';
import { theme, translations } from '../styles/theme';
import { NodeItem } from './NodeItem';
const NODE_SIZE = 72;

export function LevelRow({
  levelData,
  spiritNodeStates = {},
  lockedNodeIds = new Set(),
  currentAffinity = 0,
  projectedAffinity = 0,
  brushState = 'planned',
  onSetNodeState,
  language
}) {
  const t = translations[language];
  const { level, leftNodes, rightNodes } = levelData;

  const threshold = levelData.unlockAffinity ?? 0;
  const nowAccessible  = currentAffinity   >= threshold;
  const projAccessible = projectedAffinity >= threshold;

  const labelColor = nowAccessible
    ? theme.colors.affinity
    : projAccessible ? theme.colors.companion
    : '#BDBDBD';

  const labelText = t.levelLabel?.[level] ?? `${level}단계`;
  const hasMultiRight = rightNodes.length > 1;

  const getState = (nodeId) => spiritNodeStates[nodeId] ?? 'none';

  return (
    <div style={{
      display: 'flex',
      alignItems: hasMultiRight ? 'center' : 'flex-start',
      marginBottom: '8px', gap: '6px',
      width: 'fit-content'
    }}>
      {/* 레벨 라벨 */}
      <div
        title={labelText}
        style={{
          width: '38px', flexShrink: 0, textAlign: 'right',
          fontSize: '10px', fontWeight: 'bold', color: labelColor,
          lineHeight: 1.3,
          paddingTop: hasMultiRight ? '0' : `${Math.floor(NODE_SIZE / 2) - 6}px`
        }}
      >
        {level}단계
      </div>

      {/* 3열 고정 그리드: leftNode1 | leftNode2 | rightNodes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `${NODE_SIZE}px ${NODE_SIZE}px ${NODE_SIZE}px`,
        gap: '5px',
        alignItems: 'end'
      }}>
        {/* 왼쪽 아이템 1 */}
        {leftNodes[0]
          ? <NodeItem
              node={leftNodes[0]}
              state={getState(leftNodes[0].id)}
              isLocked={lockedNodeIds.has(leftNodes[0].id)}
              canOwn={nowAccessible}
              brushState={brushState}
              onSetState={(next) => onSetNodeState?.(leftNodes[0].id, next, nowAccessible)}
              size={NODE_SIZE}
              language={language}
            />
          : <div style={{ width: NODE_SIZE, height: NODE_SIZE }} />
        }

        {/* 왼쪽 아이템 2 */}
        {leftNodes[1]
          ? <NodeItem
              node={leftNodes[1]}
              state={getState(leftNodes[1].id)}
              isLocked={lockedNodeIds.has(leftNodes[1].id)}
              canOwn={nowAccessible}
              brushState={brushState}
              onSetState={(next) => onSetNodeState?.(leftNodes[1].id, next, nowAccessible)}
              size={NODE_SIZE}
              language={language}
            />
          : <div style={{ width: NODE_SIZE, height: NODE_SIZE }} />
        }

        {/* 오른쪽 아이템들 (시즌/이모트) — column-reverse로 쌓기 */}
        <div style={{
          display: 'flex',
          flexDirection: hasMultiRight ? 'column-reverse' : 'column',
          gap: '4px', alignItems: 'center'
        }}>
          {rightNodes.map(node => (
            <NodeItem
              key={node.id}
              node={node}
              state={getState(node.id)}
              isLocked={lockedNodeIds.has(node.id)}
              canOwn={nowAccessible}
              brushState={brushState}
              onSetState={(next) => onSetNodeState?.(node.id, next, nowAccessible)}
              size={NODE_SIZE}
              language={language}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
