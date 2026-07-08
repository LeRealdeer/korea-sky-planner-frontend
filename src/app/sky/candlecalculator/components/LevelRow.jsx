"use client";
import React from 'react';
import { theme, translations } from '../styles/theme';
import { NodeItem } from './NodeItem';
import { isLevelAccessible } from '../lib/affinity';

export function LevelRow({ level, nodeStates, onToggleNode, spiritId, currentAffinity, hasSeasonPass, language, isSimpleMode }) {
  const hasNodes = level.leftNodes.length > 0 || level.rightNodes.length > 0;
  if (!hasNodes) return null;

  const t = translations[language];
  const accessible = isSimpleMode ? true : isLevelAccessible(level.level, currentAffinity, true);
  const hasMultipleRight = level.rightNodes.length > 1;

  const labelColor = isSimpleMode || level.level === 1
    ? theme.colors.primary
    : accessible ? theme.colors.affinity : '#BDBDBD';

  const conditionFull = t.levelConditionFull?.[level.level] ?? '';
  const isNodeSeasonLocked = (node) => node.type === 'season' && !hasSeasonPass;

  const getNodeState = (nodeId) => {
    if (nodeStates.owned.has(nodeId))  return 'owned';
    if (nodeStates.target.has(nodeId)) return 'target';
    return null;
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: hasMultipleRight ? 'center' : 'flex-start',
      marginBottom: '8px', gap: '8px'
    }}>
      {/* 레벨 라벨 — 색상으로 접근성 표시, 호버 시 툴팁 */}
      <div
        title={conditionFull}
        style={{
          fontSize: '11px', color: labelColor, fontWeight: 'bold',
          width: '40px', textAlign: 'right',
          paddingTop: hasMultipleRight ? '0' : '22px',
          lineHeight: '1.3', flexShrink: 0,
          cursor: conditionFull ? 'help' : 'default'
        }}
      >
        {level.level}단계
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '70px 70px 70px',
        gap: '6px',
        alignItems: 'end'
      }}>
        {level.leftNodes[0] ? (
          <NodeItem node={level.leftNodes[0]}
            nodeState={getNodeState(level.leftNodes[0].id)}
            onToggle={() => onToggleNode(level.leftNodes[0].id)}
            isSeasonLocked={isNodeSeasonLocked(level.leftNodes[0])} />
        ) : <div style={{ width: '70px', height: '70px' }} />}

        {level.leftNodes[1] ? (
          <NodeItem node={level.leftNodes[1]}
            nodeState={getNodeState(level.leftNodes[1].id)}
            onToggle={() => onToggleNode(level.leftNodes[1].id)}
            isSeasonLocked={isNodeSeasonLocked(level.leftNodes[1])} />
        ) : <div style={{ width: '70px', height: '70px' }} />}

        <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '4px', alignItems: 'center' }}>
          {level.rightNodes.map(node => (
            <NodeItem key={node.id} node={node}
              nodeState={getNodeState(node.id)}
              onToggle={() => onToggleNode(node.id)}
              isSeasonLocked={isNodeSeasonLocked(node)} />
          ))}
        </div>
      </div>
    </div>
  );
}
