// src/app/components/NoticePanel.js
"use client";

import React from "react";
import styles from "./NoticePanel.module.css";
import { SEASON_LIST } from "../constants/seasonColors";

export default function NoticePanel({ 
  onSeasonClick, 
  onAllView, 
  onGoHome,
  onWarbandClick
}) {
  return (
    <div className={styles.noticePanel}>
      <h2 className={styles.noticeTitle}>유랑 대백과</h2>
      {/* 출처 정보 */}
      <div className={styles.creditSection}>
        {/* <h3 className={styles.creditTitle}>📸 이미지 출처</h3> */}
        <ul className={styles.creditList}>
          <li>
            <strong>노드표 & 위치:</strong>{" "}
            <a
              href="https://discord.gg/skyinfographicsdatabase"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.creditLink}
            >
              Sky Infographics Database (공식 디스코드)
            </a>
          </li>
          <li>
            <strong>대표 이미지:</strong>{" "}
            <a
              href="https://sky-children-of-the-light.fandom.com/wiki/Sky:_Children_of_the_Light_Wiki"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.creditLink}
            >
              Sky Wiki
            </a>
          </li>
          <li>
            <strong>착용샷:</strong> 망고님, 엔님, 무륵님께서 도와주셨습니다
          </li>
        </ul>
      </div>
      
      <p className={styles.noticeDescription}>
        찾고 있는 유랑이 기억나지 않을 때 검색창에 키워드를 입력해
        검색해주세요.
        <br />
        <span className={styles.noticeExample}>
          (ex - 족제비, 유랑단, 수염)
        </span>
      </p>
      <div className={styles.oldestSpiritsContainer}>
        <button className={styles.oldestSpiritsButton} onClick={onGoHome}>
          <span className={styles.oldestSpiritsIcon}>🕰️</span>
          <span className={styles.oldestSpiritsText}>오래된 유랑</span>
          <span className={styles.oldestSpiritsArrow}>→</span>
        </button>
      </div>
      
      <p className={styles.noticeSubDescription}>
        아래 시즌 이름을 클릭하면 자동 검색됩니다:
      </p>
      <div className={styles.seasonChipsContainer}>
        {SEASON_LIST.map((season) => (
          <button
            key={season.name}
            className={styles.seasonChip}
            style={{ backgroundColor: season.color }}
            onClick={() => onSeasonClick(season.name)}
          >
            {season.name}
          </button>
        ))}
      </div>
      <div className={styles.filterChipsContainer}>
        <button
          className={styles.filterChipSoul}
          onClick={onWarbandClick}
        >
          유랑단
        </button>
        <button className={styles.filterChip} onClick={onAllView}>
          전체보기
        </button>
      </div>
    </div>
  );
}