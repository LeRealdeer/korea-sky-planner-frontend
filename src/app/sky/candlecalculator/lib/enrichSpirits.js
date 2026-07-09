import { AFFINITY_THRESHOLDS, TRANSITION_POINTS, MAX_LEVEL } from './affinity';

// 5단계 UI 노드의 구매 조건 = 4단계 개방 직후(18점)
// 4단계가 열리면 5단계 트리 아이템도 구매 가능하므로 unlockAffinity = 18
export function enrichSpiritsData(spiritsData) {
  return spiritsData.map(spirit => ({
    ...spirit,
    levels: spirit.levels.map(levelData => {
      const nonSeasonLeftNodes = levelData.leftNodes.filter(n => n.type !== 'season');
      const affinityPerLeft =
        levelData.level < MAX_LEVEL && nonSeasonLeftNodes.length > 0
          ? (TRANSITION_POINTS[levelData.level] ?? 0) / nonSeasonLeftNodes.length
          : 0;

      const unlockAffinity =
        levelData.level === MAX_LEVEL
          ? AFFINITY_THRESHOLDS[4]          // 18 — 5단계 노드는 28이 아니라 18 기준
          : (AFFINITY_THRESHOLDS[levelData.level] ?? 0);

      return {
        ...levelData,
        unlockAffinity,
        leftNodes: levelData.leftNodes.map(node => ({
          ...node,
          unlockAffinity,
          affinityGain: node.type !== 'season' ? affinityPerLeft : 0
        })),
        rightNodes: levelData.rightNodes.map(node => ({
          ...node,
          unlockAffinity,
          affinityGain: 0
        }))
      };
    })
  }));
}
