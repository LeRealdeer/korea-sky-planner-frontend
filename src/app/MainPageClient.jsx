'use client';

import { useRouter } from 'next/navigation';
import styles from './MainPage.module.css';

export default function MainPageClient() {
  const router = useRouter();

  const navigateTo = (path) => {
    if (path.startsWith('http')) {
      window.open(path, '_blank', 'noopener,noreferrer');
    } else {
      router.push(path);
    }
  };

  const menu = [
    { title: '키 재기',      img: '/sky/extra/height.png',            path: '/sky/height' },
    { title: '시즌 대백과',  img: '/sky/extra/seasonDictionary.png',  path: '/sky/SeasonDictionary' },
    { title: '양초 계산기',  img: '/sky/extra/calculator.png',        path: '/sky/candlecalculator' },
    { title: '유랑 대백과',  img: '/sky/extra/dictionary.png',        path: '/sky/travelingSprits/travelingEncyclopedia' },
    { title: '오래된 유랑',  img: '/sky/extra/oldestSprits.png',      path: '/sky/travelingSprits/oldestSprits' },
    { title: '버스 노선표',  img: '/sky/extra/busTable.png',          path: '/sky/busTable' },
    { title: '악보 만들기',  img: '/sky/extra/musicEditor.png',       path: '/sky/musicEditor' },
    { title: '성향 테스트',  img: '/sky/extra/mbti.png',              path: '/sky/mbti' },
    { title: '크레딧',       img: '/sky/extra/profile.png',           path: '/sky/credit' },
  ];

  return (
    <div className={styles.pageWrapper}>

      {/* ── 히어로 ── */}
      <section className={styles.heroSection}>
        <div className={styles.heroBg} />
        <div className={styles.heroOverlay} />

        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>✦ 비공식 팬사이트</div>
          <h1 className={styles.heroTitle}>스카이 플래너</h1>
          <p className={styles.heroSubtitle}>
            thatgamecompany의 Sky: Children of the Light<br />
            한국 유저를 위한 계산기 · 대백과 · 유랑 정보
          </p>

          {/* 바로가기 버튼 */}
          <div className={styles.heroLinks}>
            <a href="https://cafe.naver.com/blacknbiqa" target="_blank" rel="noopener noreferrer" className={styles.heroLinkBtn}>
              네이버 카페
            </a>
            <a href="https://game.naver.com/lounge/thatskylounge/home" target="_blank" rel="noopener noreferrer" className={styles.heroLinkBtn}>
              게임 라운지
            </a>
          </div>
        </div>

        <div className={styles.scrollHint}>scroll</div>

        {/* 만든이 */}
        <span className={styles.heroMaker}>만든이 진사슴</span>
      </section>

      {/* ── 공지 배너 ── */}
      <div className={styles.announcementBanner}>
        <div className={styles.announceItem}>
          <span className={styles.announceIcon}>🕯️</span>
          <span className={styles.announceText}>
            <strong>[NEW]</strong> 반고흐 시즌 양초 계산기 신버전 업데이트 — 지금 확인해보세요!
          </span>
          <button className={styles.announceBtn} onClick={() => navigateTo('/sky/candlecalculator')}>
            바로가기
          </button>
        </div>
        <div className={styles.announceDivider} />
        <div className={styles.announceItem}>
          <span className={styles.announceIcon}>🎨</span>
          <span className={styles.announceText}>
            <strong>[NEW]</strong> 버스 노선표 컬러 팔레트 복구 — 원하는 색상으로 나만의 노선표를 꾸며보세요!
          </span>
          <button className={styles.announceBtn} onClick={() => navigateTo('/sky/busTable')}>
            바로가기
          </button>
        </div>
      </div>

      {/* ── 메뉴 그리드 ── */}
      <section className={styles.menuSection}>
        <p className={styles.menuSectionTitle}>— Features —</p>
        <div className={styles.menuGrid}>
          {menu.map(({ title, img, path }) => (
            <button key={title} className={styles.menuCard} onClick={() => navigateTo(path)}>
              <img src={img} alt={title} className={styles.cardBg} />
              <div className={styles.cardOverlay} />
              <span className={styles.label}>{title}</span>
            </button>
          ))}
        </div>
      </section>

    </div>
  );
}
