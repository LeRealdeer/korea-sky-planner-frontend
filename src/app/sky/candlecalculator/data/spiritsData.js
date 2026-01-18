// 레벨별로 왼쪽 2열(일반), 오른쪽 1열(시즌)로 분리
export const spiritsData = [
  {
    id: 1,
    name: {
      ko: "빛수선 챔피언",
      en: "Lightmending Champion"
    },
    totalCandles: 90,
    levels: [
      {
        level: 5,
        leftNodes: [],
        rightNodes: [{ id: "s1_l5_s1", type: "season", cost: 3 }]
      },
      {
        level: 4,
        leftNodes: [
          { id: "s1_l4_n1", type: "normal", cost: 15 },
          { id: "s1_l4_n2", type: "normal", cost: 0 }
        ],
        rightNodes: [{ id: "s1_l4_s1", type: "season", cost: 0 },
          { id: "s1_l4_s2", type: "season", cost: 0 }
        ],
      },
      {
        level: 3,
        leftNodes: [
          { id: "s1_l3_n1", type: "normal", cost: 28 },
          { id: "s1_l3_n2", type: "normal", cost: 9 }
        ],
        rightNodes: [{ id: "s1_l3_s1", type: "season", cost: 0 }]
      },
      {
        level: 2,
        leftNodes: [
          { id: "s1_l2_n1", type: "normal", cost: 25 },
          { id: "s1_l2_n2", type: "normal", cost: 6 }
        ],
        rightNodes: [{ id: "s1_l2_s1", type: "season", cost: 0 }]
      },
      {
        level: 1,
        leftNodes: [
          { id: "s1_l1_n1", type: "normal", cost: 0 },
          { id: "s1_l1_n2", type: "normal", cost: 4 }
        ],
        rightNodes: [{ id: "s1_l1_s1", type: "normal", cost: 0 }]
      }
    ]
  },
  {
    id: 2,
    name: {
      ko: "빛수선 개척자",
      en: "Lightmending Pioneer"
    },
    totalCandles: 86,
    levels: [
      {
        level: 5,
        leftNodes: [],
        rightNodes: [{ id: "s2_l5_s1", type: "season", cost: 3 }]
      },
      {
        level: 4,
        leftNodes: [
          { id: "s2_l4_n1", type: "normal", cost: 15 },
          { id: "s2_l4_n2", type: "normal", cost: 0 }
        ],
        rightNodes: [
          { id: "s2_l4_s1", type: "season", cost: 0 },
          { id: "s2_l4_s2", type: "season", cost: 0 }
        ],
      },
      {
        level: 3,
        leftNodes: [
          { id: "s2_l3_n1", type: "normal", cost: 28 },
          { id: "s2_l3_n2", type: "normal", cost: 30 }
        ],
        rightNodes: [{ id: "s2_l3_s1", type: "season", cost: 0 }]
      },
      {
        level: 2,
        leftNodes: [
          { id: "s2_l2_n1", type: "normal", cost: 6 }
        ],
        rightNodes: [{ id: "s2_l2_s1", type: "season", cost: 0 }]
      },
      {
        level: 1,
        leftNodes: [
          { id: "s2_l1_n1", type: "normal", cost: 0 },
          { id: "s2_l1_n2", type: "normal", cost: 4 }
        ],
        rightNodes: [{ id: "s2_l1_s1", type: "normal", cost: 0 }]
      }
    ]
  },
  {
    id: 3,
    name: {
      ko: "빛수선 빛학자",
      en: "Lightmending Light Scholar"
    },
    totalCandles: 102,
    levels: [
      {
        level: 5,
        leftNodes: [],
        rightNodes: [{ id: "s3_l5_s1", type: "season", cost: 3 }]
      },
      {
        level: 4,
        leftNodes: [
          { id: "s3_l4_n1", type: "normal", cost: 12 },
          { id: "s3_l4_n2", type: "normal", cost: 0 }
        ],
        rightNodes: [
          { id: "s3_l4_s1", type: "season", cost: 0 },
          { id: "s3_l4_s2", type: "season", cost: 0 }
        ],
      },
      {
        level: 3,
        leftNodes: [
          { id: "s3_l3_n1", type: "normal", cost: 28 },
          { id: "s3_l3_n2", type: "normal", cost: 30 }
        ],
        rightNodes: [{ id: "s3_l3_s1", type: "season", cost: 0 }]
      },
      {
        level: 2,
        leftNodes: [
          { id: "s3_l2_n1", type: "normal", cost: 25 }
        ],
        rightNodes: [{ id: "s3_l2_s1", type: "season", cost: 0 }]
      },
      {
        level: 1,
        leftNodes: [
          { id: "s3_l1_n1", type: "normal", cost: 0 },
          { id: "s3_l1_n2", type: "normal", cost: 4 }
        ],
        rightNodes: [{ id: "s3_l1_s1", type: "normal", cost: 0 }]
      }
    ]
  },
  {
    id: 4,
    name: {
      ko: "빛수선 빛잡이",
      en: "Lightmending Light Catcher"
    },
    totalCandles: 105,
    levels: [
      {
        level: 5,
        leftNodes: [],
        rightNodes: [{ id: "s4_l5_s1", type: "season", cost: 3 }]
      },
      {
        level: 4,
        leftNodes: [
          { id: "s4_l4_n1", type: "normal", cost: 38 },
          { id: "s4_l4_n2", type: "normal", cost: 0 }
        ],
        rightNodes: [
          { id: "s4_l4_s1", type: "season", cost: 0 },
          { id: "s4_l4_s2", type: "season", cost: 0 }
        ],
      },
      {
        level: 3,
        leftNodes: [
          { id: "s4_l3_n1", type: "normal", cost: 28 },
          { id: "s4_l3_n2", type: "normal", cost: 11 }
        ],
        rightNodes: [{ id: "s4_l3_s1", type: "season", cost: 0 }]
      },
      {
        level: 2,
        leftNodes: [
          { id: "s4_l2_n1", type: "normal", cost: 6 }
        ],
        rightNodes: [{ id: "s4_l2_s1", type: "season", cost: 0 }]
      },
      {
        level: 1,
        leftNodes: [
          { id: "s4_l1_n1", type: "normal", cost: 0 },
          { id: "s4_l1_n2", type: "normal", cost: 19 }
        ],
        rightNodes: [{ id: "s4_l1_s1", type: "normal", cost: 0 }]
      }
    ]
  },
 
];