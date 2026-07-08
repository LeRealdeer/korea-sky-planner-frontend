import { getRequiredAffinity, getAffinityPerItem } from './affinity';
import { calcCostFromNodeIds } from './nodeUtils';

function getTargetLevel(spirit, targetNodes) {
  let max = 0;
  for (const levelData of spirit.levels) {
    const has = [...levelData.leftNodes, ...levelData.rightNodes].some(n => targetNodes.has(n.id));
    if (has) max = Math.max(max, levelData.level);
  }
  return max > 0 ? max : null;
}

// 호감도 보충을 위해 구매 후보 아이템을 greedy하게 선택
// (호감도 효율 높은 순, 동일하면 저렴한 순)
function pickCandidatesForAffinity(spirit, candidateNodes, ownedNodes, affinityNeeded) {
  if (affinityNeeded <= 0) return { picked: [], totalCost: 0, totalAffinity: 0 };

  const items = [];
  for (const levelData of spirit.levels) {
    const ap = getAffinityPerItem(spirit, levelData.level);
    if (ap <= 0) continue;
    for (const node of [...levelData.leftNodes, ...levelData.rightNodes]) {
      if (node.type !== 'season' && candidateNodes.has(node.id) && !ownedNodes.has(node.id)) {
        items.push({ node, level: levelData.level, affinityGain: ap, cost: node.cost });
      }
    }
  }

  items.sort((a, b) => b.affinityGain - a.affinityGain || a.cost - b.cost);

  const picked = [];
  let totalAffinity = 0;
  let totalCost = 0;
  for (const item of items) {
    if (totalAffinity >= affinityNeeded) break;
    picked.push(item);
    totalAffinity += item.affinityGain;
    totalCost += item.cost;
  }

  return { picked, totalCost, totalAffinity };
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

  const { owned: ownedNodes, target: targetNodes, candidate: candidateNodes } = nodeStates;

  // 영혼별 목표 분석
  const spiritPlans = spiritsData.map(spirit => {
    const targetLevel = getTargetLevel(spirit, targetNodes);
    if (!targetLevel) return null;

    const currentAffinity = affinityPoints[spirit.id] ?? 2;
    const requiredAffinity = getRequiredAffinity(targetLevel);
    const affinityShortfall = Math.max(0, requiredAffinity - currentAffinity);
    const interaction4Needed = targetLevel >= 4 && !(interaction4Completed[spirit.id] ?? false);

    // 이미 보유한 아이템 제외 후 목표 아이템 비용 계산
    const toBuyIds = new Set([...targetNodes].filter(id => !ownedNodes.has(id)));
    const targetCost = calcCostFromNodeIds(spirit, toBuyIds);

    return { spirit, targetLevel, currentAffinity, requiredAffinity, affinityShortfall, interaction4Needed, targetCost };
  }).filter(Boolean);

  if (spiritPlans.length === 0) {
    return {
      mode: 'saving', hasTargets: false,
      totalAvailableCandles, totalTargetCost: 0, totalCandidateCost: 0,
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
  let totalCandidateCost = 0;
  let totalCompanionUsed = 0;
  const routeDetails = [];

  for (const sp of spiritPlans) {
    const companionDays = companionAlloc[sp.spirit.id] || 0;
    const afterCompanion = sp.affinityShortfall - companionDays;

    const { picked, totalCost: cCost, totalAffinity: cAffinity } = pickCandidatesForAffinity(
      sp.spirit, candidateNodes, ownedNodes, afterCompanion
    );

    totalTargetCost += sp.targetCost;
    totalCandidateCost += cCost;
    totalCompanionUsed += companionDays;

    const affinityStillShort = Math.max(0, afterCompanion - cAffinity);

    routeDetails.push({
      spiritId: sp.spirit.id,
      name: sp.spirit.name,
      targetLevel: sp.targetLevel,
      currentAffinity: sp.currentAffinity,
      requiredAffinity: sp.requiredAffinity,
      affinityShortfall: sp.affinityShortfall,
      companionDaysUsed: companionDays,
      candidateItemsPicked: picked,
      candidateCost: cCost,
      affinityStillShort,
      targetCost: sp.targetCost,
      interaction4Needed: sp.interaction4Needed,
      achievable: affinityStillShort <= 0 && !sp.interaction4Needed
    });
  }

  const totalNeeded = totalTargetCost + totalCandidateCost;
  const surplus = totalAvailableCandles - totalNeeded;

  return {
    mode: 'saving', hasTargets: true,
    totalAvailableCandles, totalTargetCost, totalCandidateCost,
    totalNeeded, surplus, canAfford: surplus >= 0,
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

  // 시즌 내 달성 불가 — 마지막 날 기준 결과 반환
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
