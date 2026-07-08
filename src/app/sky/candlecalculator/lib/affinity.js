// 누적 호감도 포인트 임계값 (레벨별)
export const AFFINITY_THRESHOLDS = { 1: 0, 2: 4, 3: 10, 4: 18, 5: 28 };
export const MAX_AFFINITY = 28;
export const MAX_LEVEL = 5;

// 레벨 전환에 필요한 포인트 (L → L+1)
const TRANSITION_POINTS = { 1: 4, 2: 6, 3: 8, 4: 10 };

export function getAffinityLevel(points) {
  let level = 1;
  for (const [lvl, threshold] of Object.entries(AFFINITY_THRESHOLDS)) {
    if (points >= threshold) level = Math.max(level, Number(lvl));
  }
  return level;
}

export function getRequiredAffinity(level) {
  return AFFINITY_THRESHOLDS[Math.min(level, MAX_LEVEL)] ?? 0;
}

export function getTransitionPoints(fromLevel) {
  return TRANSITION_POINTS[fromLevel] ?? 0;
}

// 레벨당 호감도 포인트: leftNodes(일반 구매 아이템)만 분모에 포함
// rightNodes는 시즌 아이템이거나 무료 상호작용 이모트이므로 제외
export function getAffinityPerItem(spirit, level) {
  if (level >= MAX_LEVEL) return 0;
  const levelData = spirit.levels.find(l => l.level === level);
  if (!levelData) return 0;
  const eligibleCount = levelData.leftNodes.filter(n => n.type !== 'season').length;
  return eligibleCount > 0 ? getTransitionPoints(level) / eligibleCount : 0;
}

// 보유 아이템(owned)에서 자동 계산되는 호감도 합산
// leftNodes만 집계 (rightNodes = 시즌 아이템 or 무료 이모트, 호감도 미포함)
export function computeAffinityFromOwned(spirit, ownedNodes) {
  let total = 0;
  for (const levelData of spirit.levels) {
    const ap = getAffinityPerItem(spirit, levelData.level);
    for (const node of levelData.leftNodes) {
      if (node.type !== 'season' && ownedNodes.has(node.id)) {
        total += ap;
      }
    }
  }
  return Math.min(total, MAX_AFFINITY);
}

// 현재 호감도와 4단계 상호작용 여부를 기반으로 레벨 접근 가능 여부 판단
export function isLevelAccessible(level, currentAffinity, interaction4Done = false) {
  if (level === 1) return true;
  if (level === 4 && !interaction4Done) return false;
  return currentAffinity >= AFFINITY_THRESHOLDS[level];
}
