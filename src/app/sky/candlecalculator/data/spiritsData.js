export const spiritsData = [
  {
    id: 1,
    name: {
      ko: "예술적인 기억",
      en: "Artistic Memory"
    },
    totalCandles: 103,
    levels: [
      {
        level: 5,
        leftNodes: [],
        rightNodes: [{ id: "s1_l5_s1", type: "season", cost: 3 }]
      },
      {
        level: 4,
        leftNodes: [
          { id: "s1_l4_n1", type: "normal", cost: 10 },
          //{ id: "s1_l4_n2", type: "normal", cost: 0 }
        ],
        rightNodes: [
          { id: "s1_l4_s1", type: "season", cost: 0 },
          { id: "s1_l4_s2", type: "season", cost: 0 }
        ]
      },
      {
        level: 3,
        leftNodes: [
          { id: "s1_l3_n1", type: "normal", cost: 22 },
          { id: "s1_l3_n2", type: "normal", cost: 22 },
          { id: "s1_l3_n3", type: "normal", cost: 10 },

        ],
        rightNodes: []
      },
      {
        level: 2,
        leftNodes: [
          { id: "s1_l2_n1", type: "normal", cost: 15 },
          { id: "s1_l2_n2", type: "normal", cost: 6 }
        ],
        rightNodes: [{ id: "s1_l2_s1", type: "season", cost: 0 }]
      },
      {
        level: 1,
        leftNodes: [
          { id: "s1_l1_n1", type: "normal", cost: 0 },
          { id: "s1_l1_n2", type: "normal", cost: 12 }
        ],
        rightNodes: [{ id: "s1_l1_s1", type: "normal", cost: 0 }]
      }
    ]
  },
  {
    id: 2,
    name: {
      ko: "네덜란드의 기억",
      en: "Dutch Memory"
    },
    totalCandles: 89,
    levels: [
      {
        level: 5,
        leftNodes: [],
        rightNodes: [{ id: "s2_l5_s1", type: "season", cost: 3 }]
      },
      {
        level: 4,
        leftNodes: [
          { id: "s2_l4_n1", type: "normal", cost: 26 },
          //{ id: "s2_l4_n2", type: "normal", cost: 0 }
        ],
        rightNodes: [
          { id: "s2_l4_s1", type: "season", cost: 0 },
          { id: "s2_l4_s2", type: "season", cost: 0 }
        ]
      },
      {
        level: 3,
        leftNodes: [
          { id: "s2_l3_n1", type: "normal", cost: 22 },
          { id: "s2_l3_n2", type: "normal", cost: 10 }
        ],
        rightNodes: [{ id: "s2_l3_s1", type: "season", cost: 0 }]
      },
      {
        level: 2,
        leftNodes: [
          { id: "s2_l2_n1", type: "normal", cost: 18 },
          { id: "s2_l2_n2", type: "normal", cost: 6 }
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
      ko: "소박한 기억",
      en: "Rustic Memory"
    },
    totalCandles: 89,
    levels: [
      {
        level: 5,
        leftNodes: [],
        rightNodes: [{ id: "s3_l5_s1", type: "season", cost: 3 }]
      },
      {
        level: 4,
        leftNodes: [
          { id: "s3_l4_n1", type: "normal", cost: 26 },
          //{ id: "s3_l4_n2", type: "normal", cost: 0 }
        ],
        rightNodes: [
          { id: "s3_l4_s1", type: "season", cost: 0 },
          { id: "s3_l4_s2", type: "season", cost: 0 }
        ]
      },
      {
        level: 3,
        leftNodes: [
          { id: "s3_l3_n1", type: "normal", cost: 22 },
          { id: "s3_l3_n2", type: "normal", cost: 8 }
        ],
        rightNodes: [{ id: "s3_l3_s1", type: "season", cost: 0 }]
      },
      {
        level: 2,
        leftNodes: [
          { id: "s3_l2_n1", type: "normal", cost: 18 },
          { id: "s3_l2_n2", type: "normal", cost: 8 }
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
      ko: "즐거운 기억",
      en: "jpyful Memory"
    },
    totalCandles: 111,
    levels: [
      {
        level: 5,
        leftNodes: [],
        rightNodes: [{ id: "s4_l5_s1", type: "season", cost: 3 }]
      },
      {
        level: 4,
        leftNodes: [
          { id: "s4_l4_n1", type: "normal", cost: 26 },
          { id: "s4_l4_n2", type: "normal", cost: 12 }
        ],
        rightNodes: [
          { id: "s4_l4_s1", type: "season", cost: 0 },
          //{ id: "s4_l4_s2", type: "season", cost: 0 }
        ]
      },
      {
        level: 3,
        leftNodes: [
          { id: "s4_l3_n1", type: "normal", cost: 22 },
          { id: "s4_l3_n2", type: "normal", cost: 22 },
          { id: "s4_l3_n3", type: "normal", cost: 8 }
        ],
        rightNodes: []
      },
      {
        level: 2,
        leftNodes: [
          { id: "s4_l2_n1", type: "normal", cost: 6 },
          //{ id: "s4_l2_n2", type: "normal", cost: 7 }
        ],
        rightNodes: [{ id: "s4_l2_s1", type: "season", cost: 0 },
          { id: "s4_l2_s2", type: "season", cost: 0 }
        ]
      },
      {
        level: 1,
        leftNodes: [
          { id: "s4_l1_n1", type: "normal", cost: 0 },
          { id: "s4_l1_n2", type: "normal", cost: 12 }
        ],
        rightNodes: [{ id: "s4_l1_s1", type: "normal", cost: 0 }]
      }
    ]
  }
];