// 노드 ID로 현재 상태 반환: 'owned' | 'target' | 'candidate' | null
export function getNodeState(nodeId, nodeStates) {
  if (nodeStates.owned.has(nodeId)) return 'owned';
  if (nodeStates.target.has(nodeId)) return 'target';
  if (nodeStates.candidate.has(nodeId)) return 'candidate';
  return null;
}

// 특정 모드에서 노드 클릭 토글:
// - 이미 현재 모드에 있으면 제거 (토글 오프)
// - 다른 모드에 있으면 그 모드에서 제거 후 현재 모드에 추가
// - 없으면 현재 모드에 추가
export function toggleNodeInMode(nodeId, mode, nodeStates) {
  const wasInOwned = nodeStates.owned.has(nodeId);
  const wasInTarget = nodeStates.target.has(nodeId);
  const wasInCandidate = nodeStates.candidate.has(nodeId);

  const newOwned = new Set(nodeStates.owned);
  const newTarget = new Set(nodeStates.target);
  const newCandidate = new Set(nodeStates.candidate);

  newOwned.delete(nodeId);
  newTarget.delete(nodeId);
  newCandidate.delete(nodeId);

  if (mode === 'owned' && !wasInOwned) newOwned.add(nodeId);
  else if (mode === 'target' && !wasInTarget) newTarget.add(nodeId);
  else if (mode === 'candidate' && !wasInCandidate) newCandidate.add(nodeId);

  return { owned: newOwned, target: newTarget, candidate: newCandidate };
}

// 영혼의 특정 노드 ID 집합에서 양초 합산
export function calcCostFromNodeIds(spirit, nodeIds) {
  let total = 0;
  for (const levelData of spirit.levels) {
    for (const node of [...levelData.leftNodes, ...levelData.rightNodes]) {
      if (nodeIds.has(node.id)) total += node.cost;
    }
  }
  return total;
}
