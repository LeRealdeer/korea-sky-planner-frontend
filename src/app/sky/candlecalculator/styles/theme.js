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
    selected: '#2196F3',
    hover: '#BBDEFB',
    season: '#FFD700',
    affinity: '#4CAF50',
    owned: '#757575',
    target: '#2196F3',
    candidate: '#FF9800',
    seasonLocked: '#BDBDBD',
    interaction4: '#9C27B0'
  }
};

export const translations = {
  ko: {
    title: '스카이 양초 계산기',
    subtitle: '카니발의 시즌',
    remainingDays: '남은 시즌 일수',
    currentCandles: '현재 보유 양초',
    ownsSeasonPass: '시즌 패스 소유',
    yes: '예',
    no: '아니오',
    buySeasonPass: '시패 구입 예정',
    bonusCandles: '개',
    requiredCandles: '목표 아이템 비용',
    selectAll: '전체선택',
    clear: '해제',
    total: '전체',
    selected: '선택',
    calculate: '계산하기!',
    calculateSaving: '양초 절약 계산',
    calculateFastest: '최단 획득 계산',
    calculationResult: '📊 계산 결과',
    remainingSeasonDays: '🕐 남은 시즌 일수',
    days: '일',
    dailyCandles: '💰 일일 획득 양초',
    currentCandlesLabel: '현재 보유 양초',
    remainingPeriodCandles: '남은 기간 획득 양초',
    seasonPassBonus: '시패 보너스',
    totalObtainableCandles: '총 획득 가능 양초',
    targetItemCost: '목표 아이템 비용',
    affinityBoostCost: '호감도 보충 비용',
    totalNeededCandles: '총 필요 양초',
    neededCandles: '필요한 추가 양초\n(선택 양초 - 현재 양초)',
    remainingCandles: '남는 양초',
    shortageCandles: '부족한 양초',
    daysNeeded: '⏱️ 선택한 아이템까지 필요 일수',
    backToMain: '메인화면으로',
    alreadyEnough: '이미 {amount}개 남습니다!',
    afterPurchase: '구입하고도 {amount}개 남습니다!',

    // 계산 방식
    calcMode: '계산 방식',
    modeSaving: '양초 절약',
    modeFastest: '최단 획득',

    // 선택 모드
    selectionMode: '선택 모드',
    modeTarget: '목표 지정',
    modeOwned: '보유 표시',
    modeCandidate: '구매 후보',
    selectionModeDesc: {
      target: '원하는 아이템을 목표로 지정 (파란색)',
      owned: '이미 보유한 아이템 표시 (회색)',
      candidate: '호감도 보충용 구매 후보 지정 (주황색)'
    },

    // 호감도
    currentAffinityLabel: '현재 호감도',
    currentLevelLabel: '현재 단계',
    nextLevelIn: '다음 단계까지',
    points: '점',
    interaction4DoneLabel: '4단계 상호작용 완료',
    maxAffinity: 'MAX',

    // 레벨 조건 라벨
    levelCondition: {
      1: '항상',
      2: '🤝4',
      3: '🤝10',
      4: '🤝18+⚡',
      5: '🤝28'
    },
    levelConditionFull: {
      1: '항상 구매 가능',
      2: '호감도 4점 필요',
      3: '호감도 10점 필요',
      4: '호감도 18점 + 상호작용 필요',
      5: '호감도 28점 필요'
    },

    // 노드 상태 뱃지
    ownedBadge: '보유',
    targetBadge: '목표',
    candidateBadge: '후보',
    seasonPassRequired: '패스 필요',

    // 동행
    todayCompanionDone: '오늘 동행 완료',
    companionDaysNeeded: '필요 동행일수',
    companionDaysUsed: '동행 사용',
    availableCompanionDays: '남은 동행 가능',

    // 결과
    routeDetail: '영혼별 루트',
    achievable: '✅ 달성 가능',
    notAchievable: '❌ 달성 불가',
    daysFromNow: '일 후 획득 가능',
    noDaysNeeded: '지금 바로 가능!',
    affinityShortfall: '호감도 부족',
    candidateItemsNeeded: '후보 아이템 구매 필요',
    interaction4Warning: '⚡ 4단계 상호작용 필요',
    noTargetSelected: '🎯 목표 아이템을 선택해주세요',
    affinityGain: '점 획득',
    affinityStatus: '호감도',

    notices: [
      '• 아이콘은 Sky Wiki에서 참고하였으며, 양초와 하트 아이콘은 햇비님 제작 자료입니다.',
      '• 5시 리셋 이후 양초를 얻었다는 가정 하에 계산됩니다. 아직 리셋 전 오늘 일퀘를 안하셨다면 일퀘 양초를 포함해서 계산해주세요.',
      '• 구매 예정이라면 시패 보유 여부 아니오 선택 후 구매예정 버튼을 눌러주세요.',
      '• 호감도 시스템: 영혼과 동행하면 하루 1점, 아이템 구매 시 레벨 전환 포인트를 아이템 수로 나눈 점수를 획득합니다. 누적 4점→2단계, 10점→3단계, 18점+상호작용→4단계, 28점→5단계.',
      '• 선택 모드를 바꾸면서 목표(파란), 보유(회색), 구매 후보(주황) 아이템을 지정하세요.'
    ]
  },
  en: {
    title: 'Sky Candle Calculator',
    subtitle: 'Season of Carnival',
    remainingDays: 'Remaining Season Days',
    currentCandles: 'Current Candles',
    ownsSeasonPass: 'Season Pass',
    yes: 'Yes',
    no: 'No',
    buySeasonPass: 'Plan to Buy Season Pass',
    bonusCandles: 'candles',
    requiredCandles: 'Target Item Cost',
    selectAll: 'Select All',
    clear: 'Clear',
    total: 'Total',
    selected: 'Selected',
    calculate: 'Calculate!',
    calculateSaving: 'Candle Saving Route',
    calculateFastest: 'Fastest Route',
    calculationResult: '📊 Calculation Result',
    remainingSeasonDays: '🕐 Days Left',
    days: ' days',
    dailyCandles: '💰 Daily Candles',
    currentCandlesLabel: 'Current Candles',
    remainingPeriodCandles: 'Obtainable Candles',
    seasonPassBonus: 'Season Pass Bonus',
    totalObtainableCandles: 'Total Obtainable',
    targetItemCost: 'Target Item Cost',
    affinityBoostCost: 'Affinity Boost Cost',
    totalNeededCandles: 'Total Needed',
    neededCandles: 'Needed Candles',
    remainingCandles: 'Extra Candles',
    shortageCandles: 'Short by',
    daysNeeded: '⏱️ Days Needed',
    backToMain: 'Back to Main',
    alreadyEnough: 'You already have {amount} extra!',
    afterPurchase: 'You will have {amount} extra after purchase!',

    calcMode: 'Calc Mode',
    modeSaving: 'Save Candles',
    modeFastest: 'Fastest',

    selectionMode: 'Selection Mode',
    modeTarget: 'Set Target',
    modeOwned: 'Mark Owned',
    modeCandidate: 'Candidate',
    selectionModeDesc: {
      target: 'Mark items you want to obtain (blue)',
      owned: 'Mark items you already own (grey)',
      candidate: 'Mark items you can buy for affinity (orange)'
    },

    currentAffinityLabel: 'Affinity',
    currentLevelLabel: 'Current Level',
    nextLevelIn: 'To next level',
    points: ' pts',
    interaction4DoneLabel: 'Lv.4 Interaction Done',
    maxAffinity: 'MAX',

    levelCondition: {
      1: 'Always',
      2: '🤝4',
      3: '🤝10',
      4: '🤝18+⚡',
      5: '🤝28'
    },
    levelConditionFull: {
      1: 'Always available',
      2: 'Affinity 4 required',
      3: 'Affinity 10 required',
      4: 'Affinity 18 + Interaction required',
      5: 'Affinity 28 required'
    },

    ownedBadge: 'Own',
    targetBadge: 'Tgt',
    candidateBadge: 'Cand',
    seasonPassRequired: 'Pass req.',

    todayCompanionDone: "Today's companion done",
    companionDaysNeeded: 'Companion days needed',
    companionDaysUsed: 'Companion used',
    availableCompanionDays: 'Companion available',

    routeDetail: 'Per-spirit route',
    achievable: '✅ Achievable',
    notAchievable: '❌ Not achievable',
    daysFromNow: ' days from now',
    noDaysNeeded: 'Achievable right now!',
    affinityShortfall: 'Affinity shortfall',
    candidateItemsNeeded: 'Need candidate items',
    interaction4Warning: '⚡ Lv.4 interaction required',
    noTargetSelected: '🎯 Please select target items',
    affinityGain: ' pts',
    affinityStatus: 'Affinity',

    notices: [
      '• Icons referenced from Sky Wiki, candle and heart icons by 햇비 Sky Solar.',
      "• Calculated assuming candles obtained after daily reset. Include today's candles if not yet collected.",
      "• Select 'No' for Season Pass and check 'Plan to Buy' if purchasing.",
      '• Affinity system: 1 point/day when accompanying a spirit. Buying items grants points (transition points ÷ item count per level). Thresholds: 4pts→Lv2, 10pts→Lv3, 18pts+interaction→Lv4, 28pts→Lv5.',
      '• Switch Selection Mode to mark Target (blue), Owned (grey), and Candidate (orange) items.'
    ]
  }
};
