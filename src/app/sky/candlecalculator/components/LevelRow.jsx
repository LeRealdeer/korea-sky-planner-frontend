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
  language,
  showDivider = false
}) {
  const t = translations[language];
  const { level, leftNodes, rightNodes } = levelData;

  const rightDisplayNodes = rightNodes.length > 0
    ? rightNodes
    : (leftNodes[2] ? [leftNodes[2]] : []);

  const threshold = levelData.unlockAffinity ?? 0;
  const nowAccessible  = currentAffinity   >= threshold;
  const projAccessible = projectedAffinity >= threshold;

  const labelColor = nowAccessible
    ? theme.colors.affinity
    : projAccessible ? theme.colors.companion
    : '#BDBDBD';

  const labelText = t.levelLabel?.[level] ?? `${level}단계`;
  const hasMultiRight = rightDisplayNodes.length > 1;
  const getState = (nodeId) => spiritNodeStates[nodeId] ?? 'none';

  return (
    <div style={{ width: 'fit-content' }}>
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

          <div style={{
            display: 'flex',
            flexDirection: hasMultiRight ? 'column-reverse' : 'column',
            gap: '4px', alignItems: 'center'
          }}>
            {rightDisplayNodes.map(node => (
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
      {showDivider && (
        <div style={{ width: '100%', height: '1px', background: '#E8E8E8', margin: '2px 0 6px' }} />
      )}
    </div>
  );
}
