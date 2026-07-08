"use client";
import React, { useState } from 'react';
import { theme, translations } from '../styles/theme';

const BONUS_CANDLES = 31;

function GuideBox({ title, children }) {
  return (
    <div style={{
      background: '#F8FBFF', border: `1px solid ${theme.colors.border}`,
      borderRadius: '8px', padding: '12px 14px', marginBottom: '10px'
    }}>
      <div style={{ fontWeight: 'bold', fontSize: '13px', color: theme.colors.primary, marginBottom: '8px' }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function GuideLine({ children, indent = false, color }) {
  return (
    <div style={{
      fontSize: '12px', lineHeight: '1.7',
      color: color || theme.colors.textLight,
      paddingLeft: indent ? '16px' : '0'
    }}>
      {children}
    </div>
  );
}

function GuideSection({ label, children }) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ fontSize: '12px', fontWeight: 'bold', color: theme.colors.text, marginBottom: '3px' }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function SimpleGuide({ language }) {
  const isKo = language === 'ko';
  return (
    <>
      <GuideBox title={isKo ? '🕯️ 간단 계산기 사용법' : '🕯️ Simple Calculator Guide'}>
        <GuideSection label={isKo ? '사용 순서' : 'How to use'}>
          <GuideLine>① {isKo ? '구매하고 싶은 아이템을 클릭하세요 → 파란색으로 표시됩니다' : 'Click items you want to buy → they turn blue'}</GuideLine>
          <GuideLine>② {isKo ? '현재 보유 양초, 시즌패스 여부를 입력하세요' : 'Enter your current candles and season pass status'}</GuideLine>
          <GuideLine>③ {isKo ? '\'계산하기\'를 눌러 달성 가능 여부를 확인하세요' : 'Press \'Calculate\' to check if you can afford it'}</GuideLine>
        </GuideSection>
        <GuideSection label={isKo ? '참고사항' : 'Notes'}>
          <GuideLine>• {isKo ? '오전 5시 리셋 이후 양초를 이미 획득했다는 가정으로 계산합니다. 아직 오늘 일일 퀘스트를 하지 않으셨다면 해당 양초도 현재 보유량에 포함해주세요.' : 'Assumes you\'ve already collected today\'s candles after 5AM reset. Include today\'s candles if not yet collected.'}</GuideLine>
          <GuideLine>• {isKo ? `시패 구입 예정이라면 시즌패스 소유 '아니오' 선택 후 구매예정 체크를 눌러주세요. (+${BONUS_CANDLES}개 보너스)` : `If planning to buy season pass, select 'No' then check 'Plan to Buy'. (+${BONUS_CANDLES} bonus candles)`}</GuideLine>
          <GuideLine>• {isKo ? '시즌패스 소유 시 일일 양초 6개, 미소유 시 5개로 계산합니다.' : 'Daily candles: 6 with season pass, 5 without.'}</GuideLine>
        </GuideSection>
      </GuideBox>
    </>
  );
}

function FullGuide({ language }) {
  const isKo = language === 'ko';
  return (
    <>
      <GuideBox title={isKo ? '🤝 호감도 계산기 사용법' : '🤝 Affinity Calculator Guide'}>
        <GuideSection label={isKo ? '📌 사용 순서' : '📌 How to use'}>
          <GuideLine color={theme.colors.owned}>
            ① {isKo ? '보유 표시 모드' : 'Owned mode'} —
          </GuideLine>
          <GuideLine indent>
            {isKo
              ? '이미 가진 아이템을 클릭하세요 (회색으로 표시). 왼쪽 2개 아이템만 호감도에 반영됩니다. 오른쪽 아이템(시즌 아이템, 무료 이모트)은 호감도에 포함되지 않습니다.'
              : 'Click items you already own (turns grey). Only the 2 left-column items count for affinity. Right-column items (season items / free emotes) do NOT affect affinity.'}
          </GuideLine>
          <GuideLine color={theme.colors.affinity} indent={false}>
            ② {isKo ? '동행 일수 입력 (영혼 카드 내)' : 'Enter companion days (in each spirit card)'}
          </GuideLine>
          <GuideLine indent>
            {isKo
              ? '해당 영혼과 이미 동행한 날 수를 입력하세요. 동행 1일 = 호감도 1점 추가. 시즌 시작부터 매일 동행했다면 오늘까지의 날 수를 입력하세요.'
              : 'Enter how many days you\'ve already accompanied this spirit. 1 companion day = +1 affinity point.'}
          </GuideLine>
          <GuideLine color={theme.colors.target}>
            ③ {isKo ? '목표 지정 모드' : 'Target mode'} —
          </GuideLine>
          <GuideLine indent>
            {isKo
              ? '구매하고 싶은 아이템을 클릭하세요 (파란색으로 표시). 해당 아이템의 단계에 맞는 호감도가 필요합니다.'
              : 'Click items you want to buy (turns blue). You need sufficient affinity for that tier.'}
          </GuideLine>
          <GuideLine>④ {isKo ? '계산 방식 선택 후 \'계산하기\' 버튼' : 'Select calculation mode and press the button'}</GuideLine>
        </GuideSection>
      </GuideBox>

      <GuideBox title={isKo ? '💡 호감도 단계 상세' : '💡 Affinity Level Details'}>
        <GuideLine>
          {isKo
            ? '호감도는 아이템 구매와 동행으로 누적됩니다. 단계마다 필요 누적 포인트:'
            : 'Affinity accumulates from item purchases and companion days. Required cumulative points per level:'}
        </GuideLine>
        <div style={{
          margin: '6px 0', padding: '8px 10px',
          background: '#F1F8E9', borderRadius: '6px',
          fontSize: '11px', lineHeight: '2', color: theme.colors.text
        }}>
          <div>1단계 → 2단계: <b style={{ color: theme.colors.affinity }}>누적 4점</b> {isKo ? '(1단계 왼쪽 아이템 각 2점)' : '(Lv1 left items: 2pts each)'}</div>
          <div>2단계 → 3단계: <b style={{ color: theme.colors.affinity }}>누적 10점</b> {isKo ? '(2단계 왼쪽 아이템 각 3점)' : '(Lv2 left items: 3pts each)'}</div>
          <div>3단계 → 4단계: <b style={{ color: theme.colors.affinity }}>누적 18점 + 4단계 상호작용</b> {isKo ? '(3단계 각 4점)' : '(Lv3: 4pts each, + interaction)'}</div>
          <div>4단계 → 5단계: <b style={{ color: theme.colors.affinity }}>누적 28점</b> {isKo ? '(4단계 왼쪽 아이템 각 5점)' : '(Lv4 left items: 5pts each)'}</div>
        </div>
        <GuideLine>
          {isKo
            ? '※ 각 레벨의 전환 포인트(4/6/8/10)가 해당 레벨의 일반(왼쪽) 아이템 수로 균등 분배됩니다. 보유 표시 시 자동 계산됩니다.'
            : '※ Transition points (4/6/8/10) are divided equally among normal (left-column) items per level. Auto-calculated when items are marked owned.'}
        </GuideLine>
      </GuideBox>

      <GuideBox title={isKo ? '🔄 계산 방식 안내' : '🔄 Calculation Modes'}>
        <GuideSection label={isKo ? '양초 절약 모드' : 'Candle Saving Mode'}>
          <GuideLine>
            {isKo
              ? '현재 보유 양초 + 남은 시즌 기간 획득 양초로, 목표 아이템을 달성할 수 있는지 계산합니다. 부족한 호감도는 남은 동행일수를 영혼별로 배분하여 채웁니다. 동행일수가 부족해도 일부 목표만 달성 가능한 상황을 확인할 수 있습니다.'
              : 'Calculates whether your current candles + remaining season candles can cover all target items. Allocates remaining companion days to spirits with affinity shortfalls.'}
          </GuideLine>
        </GuideSection>
        <GuideSection label={isKo ? '최단 획득 모드' : 'Fastest Route Mode'}>
          <GuideLine>
            {isKo
              ? '오늘부터 매일 시뮬레이션해서, 며칠 후에 모든 목표 아이템을 달성할 수 있는지 알려줍니다. 기다릴수록 양초와 동행일수가 쌓이므로, 지금 당장은 불가능해도 며칠 후면 가능한 경우를 찾아줍니다.'
              : 'Simulates day by day from today to find the earliest date when all target items become achievable. Useful when current state is not enough but a few more days would do it.'}
          </GuideLine>
        </GuideSection>
      </GuideBox>

      <GuideBox title={isKo ? '⚠️ 참고사항' : '⚠️ Notes'}>
        <GuideLine>• {isKo ? '오전 5시 리셋 이후 양초를 이미 획득했다는 가정으로 계산합니다.' : 'Assumes daily candles already collected after 5AM reset.'}</GuideLine>
        <GuideLine>• {isKo ? `시패 구입 예정이라면 시즌패스 소유 '아니오' 선택 후 구매예정 체크. (+${BONUS_CANDLES}개 보너스)` : `Plan to buy season pass? Select 'No' then check 'Plan to Buy'. (+${BONUS_CANDLES} bonus candles)`}</GuideLine>
        <GuideLine>• {isKo ? '\'오늘 동행 완료\' 체크 시, 오늘의 동행 1점을 남은 동행일수에서 제외합니다.' : '\'Today\'s companion done\' excludes today from remaining companion day count.'}</GuideLine>
        <GuideLine>• {isKo ? '시즌패스 소유 시 일일 양초 6개, 미소유 시 5개로 계산합니다.' : 'Daily candles: 6 with season pass, 5 without.'}</GuideLine>
        <GuideLine>• {isKo ? '아이콘은 Sky Wiki 참고, 양초·하트 아이콘은 햇비님 제작 자료입니다.' : 'Icons from Sky Wiki; candle & heart icons by 햇비 Sky Solar.'}</GuideLine>
      </GuideBox>
    </>
  );
}

export function SettingsPanel({
  currentCandles, setCurrentCandles,
  ownsSeasonPass, setOwnsSeasonPass,
  buySeasonPass, setBuySeasonPass,
  remainingDays, totalRequired,
  calcMode, setCalcMode,
  todayCompanionDone, setTodayCompanionDone,
  language, isSimpleMode
}) {
  const t = translations[language];
  const [guideOpen, setGuideOpen] = useState(true);

  return (
    <div style={{
      background: theme.colors.white, padding: '20px', borderRadius: '12px',
      marginBottom: '20px', marginLeft: 'auto', marginRight: 'auto',
      border: `2px solid ${theme.colors.border}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: '800px'
    }}>
      {/* 접을 수 있는 가이드 섹션 */}
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={() => setGuideOpen(o => !o)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: theme.colors.primary, fontWeight: 'bold', fontSize: '13px',
            padding: '0 0 8px 0'
          }}
        >
          <span>{guideOpen ? '▾' : '▸'}</span>
          <span>{language === 'ko' ? '사용 방법 및 안내' : 'How to Use'}</span>
        </button>
        {guideOpen && (
          isSimpleMode
            ? <SimpleGuide language={language} />
            : <FullGuide language={language} />
        )}
      </div>

      <div style={{ marginBottom: '14px', fontWeight: 'bold', fontSize: '15px', color: theme.colors.primary }}>
        🕐 {t.remainingDays}: {remainingDays}{t.days}
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '14px', alignItems: 'flex-end' }}>
        {/* 현재 보유 양초 */}
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: theme.colors.text, fontWeight: '500' }}>
            {t.currentCandles}
          </label>
          <input type="number" value={currentCandles}
            onChange={(e) => setCurrentCandles(Number(e.target.value))}
            style={{ padding: '6px 10px', borderRadius: '6px', border: `2px solid ${theme.colors.border}`,
              background: theme.colors.white, color: theme.colors.text, width: '100px', fontSize: '13px' }}
          />
        </div>

        {/* 시즌패스 */}
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: theme.colors.text, fontWeight: '500' }}>
            {t.ownsSeasonPass}
          </label>
          <select value={ownsSeasonPass} onChange={(e) => setOwnsSeasonPass(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '6px', border: `2px solid ${theme.colors.border}`,
              background: theme.colors.white, color: theme.colors.text, fontSize: '13px', cursor: 'pointer' }}>
            <option value="yes">{t.yes}</option>
            <option value="no">{t.no}</option>
          </select>
        </div>

        {/* 시패 구매 예정 */}
        <div style={{ opacity: ownsSeasonPass === 'yes' ? 0.5 : 1 }}>
          <label style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: theme.colors.text,
            cursor: ownsSeasonPass === 'yes' ? 'not-allowed' : 'pointer', paddingBottom: '6px' }}>
            <input type="checkbox"
              checked={ownsSeasonPass === 'yes' ? false : buySeasonPass}
              onChange={() => setBuySeasonPass(!buySeasonPass)}
              disabled={ownsSeasonPass === 'yes'}
              style={{ marginRight: '6px', width: '16px', height: '16px', cursor: ownsSeasonPass === 'yes' ? 'not-allowed' : 'pointer' }}
            />
            {t.buySeasonPass} (+{BONUS_CANDLES}{t.bonusCandles})
          </label>
        </div>

        {/* 오늘 동행 완료 — 호감도 모드에서만 */}
        {!isSimpleMode && (
          <div>
            <label style={{ display: 'flex', alignItems: 'center', fontSize: '13px',
              color: todayCompanionDone ? theme.colors.affinity : theme.colors.text,
              cursor: 'pointer', paddingBottom: '6px', fontWeight: todayCompanionDone ? 'bold' : 'normal' }}>
              <input type="checkbox" checked={todayCompanionDone} onChange={() => setTodayCompanionDone(!todayCompanionDone)}
                style={{ marginRight: '6px', width: '16px', height: '16px', cursor: 'pointer', accentColor: theme.colors.affinity }} />
              🤝 {t.todayCompanionDone}
            </label>
          </div>
        )}
      </div>

      {/* 계산 방식 — 호감도 모드에서만 */}
      {!isSimpleMode && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', color: theme.colors.text, fontWeight: '500' }}>{t.calcMode}:</span>
          {['saving', 'fastest'].map(mode => (
            <button key={mode} onClick={() => setCalcMode(mode)}
              style={{
                padding: '5px 14px',
                background: calcMode === mode ? theme.colors.primary : theme.colors.white,
                color: calcMode === mode ? theme.colors.white : theme.colors.primary,
                border: `2px solid ${theme.colors.primary}`, borderRadius: '16px',
                cursor: 'pointer', fontWeight: calcMode === mode ? 'bold' : 'normal', fontSize: '12px'
              }}>
              {mode === 'saving' ? t.modeSaving : t.modeFastest}
            </button>
          ))}
        </div>
      )}

      {/* 선택 비용 표시 */}
      <div style={{
        padding: '10px 12px', background: theme.colors.background, borderRadius: '8px',
        fontSize: '14px', fontWeight: 'bold', color: theme.colors.primary,
        border: `2px solid ${theme.colors.border}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <span>🎯 {t.requiredCandles}</span>
        <span>{totalRequired}{t.bonusCandles}</span>
      </div>
    </div>
  );
}
