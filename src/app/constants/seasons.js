// constants/seasons.js
export const SEASON_LIST = [
  { name: "감사", color: "#ff7801" },
  { name: "빛 추적자", color: "#f7e146" },
  { name: "친밀", color: "#7fcd61" },
  { name: "리듬", color: "#4544c9" },
  { name: "마법", color: "#8a00e3" },
  { name: "낙원", color: "#45a300" },
  { name: "예언", color: "#d6d6d6" },
  { name: "꿈", color: "#ff186d" },
  { name: "협력", color: "#539000" },
  { name: "어린왕자", color: "#ffe846" },
  { name: "비행", color: "#40c9ff" },
  { name: "심해", color: "#0042a9" },
  { name: "공연", color: "#a900e5" },
  { name: "파편", color: "#adadad" },
  { name: "오로라", color: "#ff96a9" },
  { name: "기억", color: "#009375" },
  { name: "성장", color: "#a53100" },
  { name: "순간", color: "#ff8800" },
  { name: "재생", color: "#52a7ff" },
  { name: "구색록", color: "#d10001" },
  { name: "보금자리", color: "#a15e34" },
  { name: "듀엣", color: "#ff50a9" },
  { name: "무민", color: "#6ce641" },
  { name: "광채", color: "#ff3749" },
  { name: "파랑새", color: "#2d4cff" },
  { name: "불씨", color: "#ff3b30" },
  { name: "이주", color: "#60c3d7" },
  { name: "빛수선", color: "#5839ab" }
];

// 시즌 이름으로 색상 찾기 헬퍼 함수
export const getSeasonColor = (seasonName) => {
  const season = SEASON_LIST.find(s => s.name === seasonName);
  return season ? season.color : "#888888";
};