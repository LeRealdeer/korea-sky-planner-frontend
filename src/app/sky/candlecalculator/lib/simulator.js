import { MAX_AFFINITY, getAffinityLevel, computeAffinityFromOwned } from './affinity';

export const CASH_PACK_CANDLES = 15;
export const CASH_PACK_PRICE   = 7700;

export function simulateSpirit(spirit, spiritState, hasSeasonPass) {
  const { pastCompanionDays = 0, futureCompanionDays = 0, nodeStates = {} } = spiritState ?? {};

  const ownedSet = new Set(
    Object.entries(nodeStates)
      .filter(([, s]) => s === 'owned')
      .map(([id]) => id)
  );
  const ownedAffinityGain = computeAffinityFromOwned(spirit, ownedSet);
  const currentAffinity = Math.min(ownedAffinityGain + pastCompanionDays, MAX_AFFINITY);
  let affinity = currentAffinity + futureCompanionDays;

  const sortedLevels = [...spirit.levels].sort((a, b) => a.level - b.level);
  let remaining = [];
  for (const levelData of sortedLevels) {
    for (const node of [...levelData.leftNodes, ...levelData.rightNodes]) {
      if (nodeStates[node.id] === 'planned') remaining.push({ node, levelData });
    }
  }

  const purchased = [];

  while (true) {
    const purchasable = remaining.filter(({ node }) => {
      if (affinity < (node.unlockAffinity ?? 0)) return false;
      if (node.type === 'season' && !hasSeasonPass) return false;
      return true;
    });
    if (purchasable.length === 0) break;

    const purchasedIds = new Set(purchasable.map(({ node }) => node.id));
    remaining = remaining.filter(({ node }) => !purchasedIds.has(node.id));
    purchased.push(...purchasable);

    for (const { node } of purchasable) {
      affinity += node.affinityGain ?? 0;
    }
  }

  const lockedPlannedNodes = remaining.map(({ node, levelData }) => {
    const seasonLocked = node.type === 'season' && !hasSeasonPass;
    return {
      node,
      level: levelData.level,
      reason: seasonLocked ? 'season' : 'affinity',
      requiredAffinity: seasonLocked ? null : (node.unlockAffinity ?? 0),
      missingAffinity: seasonLocked ? null : Math.max(0, (node.unlockAffinity ?? 0) - affinity)
    };
  });

  const plannedItemAffinity = Math.max(0, affinity - currentAffinity - futureCompanionDays);
  const projectedAffinity = Math.min(affinity, MAX_AFFINITY);
  const purchasablePlannedCost = purchased.reduce((s, { node }) => s + (node.cost ?? 0), 0);
  const lockedPlannedCost = lockedPlannedNodes.reduce((s, { node }) => s + (node.cost ?? 0), 0);

  return {
    ownedAffinity: ownedAffinityGain,
    pastCompanionAffinity: pastCompanionDays,
    futureCompanionAffinity: futureCompanionDays,
    plannedItemAffinity,
    currentAffinity,
    currentLevel: getAffinityLevel(currentAffinity),
    projectedAffinity,
    projectedLevel: getAffinityLevel(projectedAffinity),
    purchasedNodes: new Set(purchased.map(({ node }) => node.id)),
    lockedPlannedNodes,
    purchasablePlannedCost,
    lockedPlannedCost,
    totalPlannedCost: purchasablePlannedCost + lockedPlannedCost
  };
}

export function simulateAll(spiritsData, spiritStates, settings) {
  const {
    currentCandles, ownsSeasonPass, buySeasonPass,
    remainingDays, cashPackCount = 0
  } = settings;

  const hasSeasonPass = ownsSeasonPass === 'yes' || buySeasonPass;
  const dailyCandles = hasSeasonPass ? 6 : 5;
  const seasonPassBonus = (ownsSeasonPass !== 'yes' && buySeasonPass) ? 31 : 0;
  const cashCandles = cashPackCount * CASH_PACK_CANDLES;
  const cashCost    = cashPackCount * CASH_PACK_PRICE;
  const candlesFromDays = remainingDays * dailyCandles;
  const totalAvailableCandles = currentCandles + candlesFromDays + seasonPassBonus + cashCandles;

  const spiritResults = spiritsData.map(spirit => ({
    spiritId: spirit.id,
    name: spirit.name,
    ...simulateSpirit(spirit, spiritStates[spirit.id], hasSeasonPass)
  }));

  const totalPlannedCost = spiritResults.reduce((s, r) => s + r.totalPlannedCost, 0);
  const purchasablePlannedCost = spiritResults.reduce((s, r) => s + r.purchasablePlannedCost, 0);
  const lockedPlannedCost = spiritResults.reduce((s, r) => s + r.lockedPlannedCost, 0);

  const totalFutureCompanionDays = spiritsData.reduce(
    (s, sp) => s + (spiritStates[sp.id]?.futureCompanionDays ?? 0), 0
  );

  // 잠긴 아이템은 실제로 구매 불가 → 구매 가능한 항목만 비용으로 차감
  const candleDifference = totalAvailableCandles - purchasablePlannedCost;
  const remainingCompanionDays = remainingDays - totalFutureCompanionDays;

  const candlePossible    = candleDifference >= 0;
  const companionPossible = remainingCompanionDays >= 0;
  const affinityPossible  = lockedPlannedCost === 0;

  const hasAnyActivity = spiritResults.some(r =>
    r.totalPlannedCost > 0 || r.ownedAffinity > 0 ||
    r.pastCompanionAffinity > 0 || r.futureCompanionAffinity > 0
  );

  return {
    // 입력 파생값 (상세 표시용)
    currentCandles, remainingDays, dailyCandles, seasonPassBonus,
    candlesFromDays, cashPackCount, cashCandles, cashCost,
    hasSeasonPass,
    // 총계
    totalAvailableCandles,
    totalPlannedCost, purchasablePlannedCost, lockedPlannedCost,
    candleDifference, candlePossible,
    totalFutureCompanionDays, remainingCompanionDays, companionPossible,
    affinityPossible,
    isPlanFeasible: candlePossible && companionPossible && affinityPossible,
    hasAnyActivity, spiritResults
  };
}

// ── 간단 계산기용: 호감도 잠금 없이 양초 비용만 계산 ─────────────────────
export function simulateSimple(spiritsData, spiritStates, settings) {
  const {
    currentCandles, ownsSeasonPass, buySeasonPass,
    remainingDays, cashPackCount = 0
  } = settings;

  const hasSeasonPass   = ownsSeasonPass === 'yes' || buySeasonPass;
  const dailyCandles    = hasSeasonPass ? 6 : 5;
  const seasonPassBonus = (ownsSeasonPass !== 'yes' && buySeasonPass) ? 31 : 0;
  const cashCandles     = cashPackCount * CASH_PACK_CANDLES;
  const cashCost        = cashPackCount * CASH_PACK_PRICE;
  const candlesFromDays = remainingDays * dailyCandles;
  const totalAvailableCandles = currentCandles + candlesFromDays + seasonPassBonus + cashCandles;

  // 호감도 잠금 없이: 시즌패스 조건만 적용
  const spiritResults = spiritsData.map(spirit => {
    const nodeStates = spiritStates[spirit.id]?.nodeStates ?? {};
    let totalPlannedCost = 0;
    for (const levelData of spirit.levels) {
      for (const node of [...levelData.leftNodes, ...levelData.rightNodes]) {
        if (nodeStates[node.id] === 'planned') {
          if (node.type === 'season' && !hasSeasonPass) continue; // 시패 없으면 시즌 아이템 제외
          totalPlannedCost += node.cost ?? 0;
        }
      }
    }
    return { spiritId: spirit.id, name: spirit.name, totalPlannedCost };
  });

  const totalPlannedCost  = spiritResults.reduce((s, r) => s + r.totalPlannedCost, 0);
  const candleDifference  = totalAvailableCandles - totalPlannedCost;
  const candlePossible    = candleDifference >= 0;

  return {
    currentCandles, remainingDays, dailyCandles, seasonPassBonus,
    candlesFromDays, cashPackCount, cashCandles, cashCost, hasSeasonPass,
    totalAvailableCandles, totalPlannedCost,
    candleDifference, candlePossible,
    spiritResults
  };
}
