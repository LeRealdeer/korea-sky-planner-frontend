import { getRequiredAffinity } from './affinity';
import { calcCostFromNodeIds } from './nodeUtils';

function getTargetLevel(spirit, targetNodes) {
  let max = 0;
  for (const levelData of spirit.levels) {
    const has = [...levelData.leftNodes, ...levelData.rightNodes].some(n => targetNodes.has(n.id));
    if (has) max = Math.max(max, levelData.level);
  }
  return max > 0 ? max : null;
}

// 양초 절약 모드: 동행일수를 최대한 활용하여 최소 양초로 목표 달성
export function planCandleSavingRoute({
  spiritsData, nodeStates,
  affinityPoints, interaction4Completed,
  currentCandles, ownsSeasonPass, buySeasonPass,
  remainingDays, todayCompanionDone,
  _companionOverride
}) {
  const hasPass = ownsSeasonPass === 'yes' || buySeasonPass;
  const dailyCandles = hasPass ? 6 : 5;
  const bonusCandles = (ownsSeasonPass !== 'yes' && buySeasonPass) ? 31 : 0;
  const totalAvailableCandles = currentCandles + remainingDays * dailyCandles + bonusCandles;
  const availableCompanionDays = _companionOverride ??
    (remainingDays + (todayCompanionDone ? 0 : 1));

  const { owned: ownedNodes, target: targetNodes } = nodeStates;

  const spiritPlans = spiritsData.map(spirit => {
    const targetLevel = getTargetLevel(spirit, targetNodes);
    if (!targetLevel) return null;

    const currentAffinity = affinityPoints[spirit.id] ?? 0;
    const requiredAffinity = getRequiredAffinity(targetLevel);
    const affinityShortfall = Math.max(0, requiredAffinity - currentAffinity);

    const toBuyIds = new Set([...targetNodes].filter(id => !ownedNodes.has(id)));
    const targetCost = calcCostFromNodeIds(spirit, toBuyIds);

    return { spirit, targetLevel, currentAffinity, requiredAffinity, affinityShortfall, targetCost };
  }).filter(Boolean);

  if (spiritPlans.length === 0) {
    return {
      mode: 'saving', hasTargets: false,
      totalAvailableCandles, totalTargetCost: 0,
      totalNeeded: 0, surplus: totalAvailableCandles, canAfford: true,
      totalCompanionUsed: 0, availableCompanionDays, routeDetails: [], achievable: true
    };
  }

  // 동행일수 배분: 호감도 부족이 많은 영혼 우선
  let compRemaining = availableCompanionDays;
  const companionAlloc = {};
  const sorted = [...spiritPlans].sort((a, b) => b.affinityShortfall - a.affinityShortfall);
  for (const sp of sorted) {
    const alloc = Math.min(sp.affinityShortfall, compRemaining);
    companionAlloc[sp.spirit.id] = alloc;
    compRemaining -= alloc;
  }

  let totalTargetCost = 0;
  let totalCompanionUsed = 0;
  const routeDetails = [];

  for (const sp of spiritPlans) {
    const companionDays = companionAlloc[sp.spirit.id] || 0;
    const affinityStillShort = Math.max(0, sp.affinityShortfall - companionDays);

    totalTargetCost += sp.targetCost;
    totalCompanionUsed += companionDays;

    routeDetails.push({
      spiritId: sp.spirit.id,
      name: sp.spirit.name,
      targetLevel: sp.targetLevel,
      currentAffinity: sp.currentAffinity,
      requiredAffinity: sp.requiredAffinity,
      affinityShortfall: sp.affinityShortfall,
      companionDaysUsed: companionDays,
      affinityStillShort,
      targetCost: sp.targetCost,
      achievable: affinityStillShort <= 0
    });
  }

  const surplus = totalAvailableCandles - totalTargetCost;

  return {
    mode: 'saving', hasTargets: true,
    totalAvailableCandles, totalTargetCost,
    totalNeeded: totalTargetCost, surplus, canAfford: surplus >= 0,
    totalCompanionUsed, availableCompanionDays, routeDetails,
    achievable: surplus >= 0 && routeDetails.every(r => r.achievable)
  };
}

// 최단 획득 모드: 매일 시뮬레이션하여 달성 가능한 가장 빠른 날 반환
export function planFastestRoute(params) {
  const { remainingDays, currentCandles, ownsSeasonPass, buySeasonPass, todayCompanionDone } = params;
  const hasPass = ownsSeasonPass === 'yes' || buySeasonPass;
  const dailyCandles = hasPass ? 6 : 5;
  const bonusCandles = (ownsSeasonPass !== 'yes' && buySeasonPass) ? 31 : 0;
  const baseCompanion = todayCompanionDone ? 0 : 1;

  for (let day = 0; day <= remainingDays; day++) {
    const simCandles = currentCandles + day * dailyCandles + bonusCandles;
    const simCompanion = baseCompanion + day;

    const result = planCandleSavingRoute({
      ...params,
      currentCandles: simCandles,
      buySeasonPass: false,
      remainingDays: 0,
      todayCompanionDone: true,
      _companionOverride: simCompanion
    });

    if (result.achievable) {
      return { ...result, mode: 'fastest', daysFromNow: day, achievable: true };
    }
  }

  const finalResult = planCandleSavingRoute({
    ...params,
    currentCandles: currentCandles + remainingDays * dailyCandles + bonusCandles,
    buySeasonPass: false,
    remainingDays: 0,
    todayCompanionDone: true,
    _companionOverride: baseCompanion + remainingDays
  });

  return { ...finalResult, mode: 'fastest', daysFromNow: null, achievable: false };
}
