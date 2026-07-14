// 시즌칩 등에서 쓰는 시즌별 색상의 단일 소스.
// 새 시즌이 열리면 여기에만 추가하면 됨 (seasons.js는 이 파일로 통합됨).
export const seasonColors = {
  "감사": "#ff7801",
  "빛 추적자": "#f7e146",
  "친밀": "#7fcd61",
  "리듬": "#4544c9",
  "마법": "#8a00e3",
  "낙원": "#45a300",
  "예언": "#d6d6d6",
  "꿈": "#ff186d",
  "협력": "#539000",
  "어린왕자": "#ffe846",
  "비행": "#40c9ff",
  "심해": "#0042a9",
  "공연": "#a900e5",
  "파편": "#adadad",
  "오로라": "#ff96a9",
  "기억": "#009375",
  "성장": "#a53100",
  "순간": "#ff8800",
  "재생": "#52a7ff",
  "구색록": "#d10001",
  "보금자리": "#a15e34",
  "듀엣": "#ff50a9",
  "무민": "#6ce641",
  "광채": "#ff3749",
  "파랑새": "#2d4cff",
  "불씨": "#ff3b30",
  "이주": "#60c3d7",
  "빛수선": "#5839ab",
  "카니발": "#8b008b"
};

// 객체 key 순서를 그대로 유지 (등록 순 = 시즌 진행 순)
export const seasons = Object.keys(seasonColors);

// { name, color } 배열이 필요한 곳(목록 렌더링, .find() 조회)용
export const SEASON_LIST = seasons.map((name) => ({ name, color: seasonColors[name] }));

export const getSeasonColor = (seasonName) => seasonColors[seasonName] || "#888888";
