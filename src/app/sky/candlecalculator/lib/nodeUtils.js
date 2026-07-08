export function toggleNodeInMode(nodeId, mode, nodeStates) {
  const wasInOwned = nodeStates.owned.has(nodeId);
  const wasInTarget = nodeStates.target.has(nodeId);

  const newOwned = new Set(nodeStates.owned);
  const newTarget = new Set(nodeStates.target);

  newOwned.delete(nodeId);
  newTarget.delete(nodeId);

  if (mode === 'owned' && !wasInOwned) newOwned.add(nodeId);
  else if (mode === 'target' && !wasInTarget) newTarget.add(nodeId);

  return { owned: newOwned, target: newTarget };
}

export function calcCostFromNodeIds(spirit, nodeIds) {
  let total = 0;
  for (const levelData of spirit.levels) {
    for (const node of [...levelData.leftNodes, ...levelData.rightNodes]) {
      if (nodeIds.has(node.id)) total += node.cost;
    }
  }
  return total;
}
