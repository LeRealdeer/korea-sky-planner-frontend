export const theme = {
  colors: {
    primary: '#2196F3',
    primaryDark: '#1976D2',
    primaryLight: '#64B5F6',
    white: '#FFFFFF',
    background: '#F5F9FF',
    text: '#1A1A1A',
    textLight: '#666666',
    border: '#E3F2FD',
    hover: '#BBDEFB',
    affinity: '#4CAF50',
    affinityDark: '#2E7D32',
    planned: '#2196F3',
    owned: '#4CAF50',
    locked: '#EF5350',
    season: '#FFD700',
    seasonLocked: '#BDBDBD',
    companion: '#FF9800',
    barBg: '#E0E0E0'
  }
};

export const translations = {
  ko: {
    title: '스카이 양초 계산기',
    subtitle: '구매 계획 시뮬레이터 · 카니발의 시즌',

    remainingDays: '남은 시즌 일수',
    days: '일',
    currentCandles: '현재 보유 양초',
    ownsSeasonPass: '시즌패스 보유',
    yes: '예',
    no: '아니오',
    buySeasonPass: '시패 구입 예정',
    bonusCandles: '개',
    dailyCandlesLabel: '일일 획득 양초',

    planned: '구매 예정',
    owned: '보유',

    pastCompanionDays: '이미 동행',
    futureCompanionDays: '앞으로 동행',
    companionDayUnit: '일',

    currentAffinityLabel: '현재 호감도',
    projectedAffinityLabel: '예상 호감도',
    currentLevelLabel: '현재 단계',
    projectedLevelLabel: '예상 단계',
    points: '점',
    maxAffinity: 'MAX (28점)',

    levelLabel: {
      1: '1단계 · 항상 구매 가능',
      2: '2단계 (호감도 4점 이상)',
      3: '3단계 (호감도 10점 이상)',
      4: '4단계 (호감도 18점 이상)',
      5: '5단계 (호감도 28점 이상)'
    },

    selectAll: '전체 계획',
    clear: '초기화',

    planFeasible: '✅ 계획 가능',
    planNotFeasible: '❌ 계획 불가능',
    totalPlannedCost: '구매 예정 총 양초',
    purchasableCost: '구매 가능한 양초',
    lockedCost: '잠긴 아이템 양초',
    totalAvailableCandles: '사용 가능 총 양초',
    surplusLabel: '남는 양초',
    shortageLabel: '부족한 양초',
    companionWarning: '앞으로 동행 예정 일수 합계({total}일)가 남은 시즌 일수({remaining}일)를 초과합니다.',
    lockedItemsSummary: '잠긴 아이템 요약',
    lockedReasonAffinity: '호감도 부족 (필요: {required}점)',
    lockedReasonSeason: '시즌패스 필요',
    noPlannedItems: '아이템을 클릭해 구매 계획을 세워보세요.\n클릭 → 구매 예정(파란색) → 보유(초록색) → 해제',

    spiritDetail: '영혼별 상세',
    ownedAffinityGain: '보유 아이템 호감도',
    pastCompanionGain: '이미 동행 호감도',
    futureCompanionGain: '앞으로 동행 호감도',
    plannedAffinityGain: '구매 예정 호감도',
    purchasableItems: '구매 가능 예정 아이템',
    lockedItems: '잠긴 아이템',

    backToMain: '메인화면으로',

    guideTitle: '사용 방법',
    guideSteps: [
      '아이템 클릭 → 구매 예정(파란색) → 보유 중(초록색) → 해제 순으로 상태가 바뀝니다.',
      '보유 중으로 표시한 아이템은 이미 구매한 것으로, 양초 비용에서 제외되고 호감도에는 반영됩니다.',
      '이미 동행한 일수와 앞으로 동행할 일수를 입력하면 호감도가 자동 계산됩니다.',
      '호감도가 높아지면 더 높은 단계의 아이템을 구매할 수 있습니다. 시뮬레이터가 자동으로 계산합니다.',
      '앞으로 동행 예정 일수 합계는 남은 시즌 일수를 넘을 수 없습니다 (하루에 한 영혼만 동행 가능).',
    ],

    notices: [
      '• 아이콘은 Sky Wiki에서 참고하였으며, 양초와 하트 아이콘은 햇비님 제작 자료입니다.',
    ]
  },

  en: {
    title: 'Sky Candle Calculator',
    subtitle: 'Purchase Plan Simulator · Season of Carnival',

    remainingDays: 'Remaining Season Days',
    days: ' days',
    currentCandles: 'Current Candles',
    ownsSeasonPass: 'Season Pass',
    yes: 'Yes',
    no: 'No',
    buySeasonPass: 'Plan to Buy Pass',
    bonusCandles: ' candles',
    dailyCandlesLabel: 'Daily candles',

    planned: 'Planned',
    owned: 'Owned',

    pastCompanionDays: 'Past companion',
    futureCompanionDays: 'Future companion',
    companionDayUnit: 'd',

    currentAffinityLabel: 'Current Affinity',
    projectedAffinityLabel: 'Projected Affinity',
    currentLevelLabel: 'Current Level',
    projectedLevelLabel: 'Projected Level',
    points: ' pts',
    maxAffinity: 'MAX (28 pts)',

    levelLabel: {
      1: 'Lv.1 · Always available',
      2: 'Lv.2 (Affinity 4+)',
      3: 'Lv.3 (Affinity 10+)',
      4: 'Lv.4 (Affinity 18+)',
      5: 'Lv.5 (Affinity 28+)'
    },

    selectAll: 'Plan All',
    clear: 'Reset',

    planFeasible: '✅ Plan is feasible',
    planNotFeasible: '❌ Plan not feasible',
    totalPlannedCost: 'Total planned candles',
    purchasableCost: 'Purchasable candles',
    lockedCost: 'Locked item candles',
    totalAvailableCandles: 'Total available candles',
    surplusLabel: 'Surplus candles',
    shortageLabel: 'Shortage candles',
    companionWarning: 'Total future companion days ({total}d) exceeds remaining season days ({remaining}d).',
    lockedItemsSummary: 'Locked Items',
    lockedReasonAffinity: 'Affinity too low (need: {required} pts)',
    lockedReasonSeason: 'Season pass required',
    noPlannedItems: 'Click items to plan purchases.\nClick → Planned (blue) → Owned (green) → Clear',

    spiritDetail: 'Per-spirit details',
    ownedAffinityGain: 'Owned item affinity',
    pastCompanionGain: 'Past companion affinity',
    futureCompanionGain: 'Future companion affinity',
    plannedAffinityGain: 'Planned purchase affinity',
    purchasableItems: 'Purchasable planned items',
    lockedItems: 'Locked items',

    backToMain: 'Back to Main',

    guideTitle: 'How to Use',
    guideSteps: [
      'Click an item to cycle: Planned (blue) → Owned (green) → None.',
      'Owned items are already purchased — excluded from candle cost, but included in affinity.',
      'Enter past and future companion days per spirit to auto-calculate affinity.',
      'Higher affinity unlocks higher tiers. The simulator calculates purchase order automatically.',
      'Total future companion days cannot exceed remaining season days (one spirit per day).',
    ],

    notices: [
      '• Icons from Sky Wiki; candle & heart icons by 햇비 Sky Solar.',
    ]
  }
};
