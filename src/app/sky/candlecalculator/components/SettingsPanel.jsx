"use client";
import React, { useState } from 'react';
import { theme, translations } from '../styles/theme';

const BONUS_CANDLES     = 31;
const CASH_PACK_CANDLES = 15;
const CASH_PACK_PRICE   = 7700;

/* ── 상태 설명 칩 ───────────────────────────── */
function StateChip({ bg, border, dashed, label, desc }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '5px', flexShrink: 0,
        border: dashed ? `2px dashed ${border}` : `2px solid ${border}`,
        background: bg
      }} />
      <div style={{ fontSize: '12px', lineHeight: 1.4 }}>
        <b style={{ color: border }}>{label}</b>
        <span style={{ color: theme.colors.textLight }}> — {desc}</span>
      </div>
    </div>
  );
}

/* ── 가이드 ────────────────────────────────── */
function GuideSection({ title, children }) {
  return (
    <div style={{
      border: `1px solid ${theme.colors.border}`, borderRadius: '8px',
      padding: '12px 14px', marginBottom: '12px', background: theme.colors.white
    }}>
      <div style={{ fontWeight: 'bold', fontSize: '12px', color: theme.colors.primary, marginBottom: '10px' }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Guide({ isKo }) {
  return (
    <div style={{ paddingTop: '14px', paddingBottom: '20px' }}>

      <GuideSection title={isKo ? '🟦 아이템 상태 — 클릭으로 토글하기' : '🟦 Item States — Click to Toggle'}>
        <div style={{
          background: '#E3F2FD', borderRadius: '6px', padding: '8px 10px',
          fontSize: '11.5px', color: '#0D47A1', marginBottom: '10px', lineHeight: 1.7
        }}>
          {isKo ? (
            <>
              각 영혼 카드 위쪽에 <b>"클릭 시 적용: 예정 / 보유"</b> 버튼이 있어요.<br />
              원하는 상태를 먼저 고른 뒤, 아이템을 클릭하면 됩니다.<br />
              <b>같은 상태의 아이템을 다시 클릭하면 선택이 해제</b>됩니다.
            </>
          ) : (
            <>
              Each spirit card has a <b>"Click sets to: Planned / Owned"</b> button.<br />
              Pick a state first, then click items to apply it.<br />
              <b>Clicking an already-set item deselects it.</b>
            </>
          )}
        </div>
        <div style={{ marginBottom: '6px', fontSize: '11.5px', color: theme.colors.text }}>
          {isKo ? '예시) "예정" 선택 → 구매할 아이템 클릭 → 다시 클릭하면 해제' : 'e.g. Select "Planned" → click items to buy → click again to deselect'}
        </div>
        <StateChip bg={theme.colors.white}  border="#BDBDBD" label={isKo ? '기본 (선택 안 됨)' : 'Default (none)'}  desc={isKo ? '아무것도 반영되지 않는 초기 상태.' : 'Not counted toward cost or affinity.'} />
        <StateChip bg="#E3F2FD" border={theme.colors.planned}  label={isKo ? '예정 (파란색)' : 'Planned (blue)'}  desc={isKo ? '구매할 예정인 아이템. 양초 비용에 포함됩니다.' : 'Item you plan to buy. Included in candle cost.'} />
        <StateChip bg="#E8F5E9" border={theme.colors.affinity} label={isKo ? '보유 (초록색)' : 'Owned (green)'}  desc={isKo ? '이미 가진 아이템. 비용 제외, 호감도에만 반영.' : 'Already owned. Excluded from cost, counted in affinity.'} />
        <StateChip bg="#FFEBEE" border="#EF5350" dashed label={isKo ? '잠김 (빨간 점선)' : 'Locked (red dashed)'} desc={isKo ? '예정 상태지만 호감도 부족 또는 시즌패스 미보유로 현재 구매 불가. 양초 계산에서 제외됩니다.' : 'Planned but unpurchasable (low affinity or no pass). Excluded from candle cost.'} />
        <div style={{ fontSize: '11px', color: '#E65100', marginTop: '8px', lineHeight: 1.6 }}>
          {isKo
            ? '※ "보유" 선택 시 🔒 아이콘이 뜨는 아이템은 아직 호감도가 부족한 단계예요. 아랫단계 아이템부터 "보유"로 채워 호감도를 쌓아야 클릭할 수 있어요.'
            : '※ Items showing 🔒 while "Owned" is selected have insufficient affinity. Fill lower-level items as Owned first to unlock them.'}
        </div>
      </GuideSection>

      <GuideSection title={isKo ? '🤝 호감도 시스템' : '🤝 Affinity System'}>
        <div style={{
          background: '#FFF8E1', border: '1px solid #FFE082', borderRadius: '6px',
          padding: '10px 12px', fontSize: '12px', color: '#5D4037',
          marginBottom: '10px', lineHeight: 1.7
        }}>
          {isKo
            ? '⚠️ 반드시 아랫단계(1단계)부터 아이템을 체크해 호감도를 채워주세요! 윗단계 아이템은 아랫단계 호감도가 먼저 쌓여야 잠금이 해제됩니다. 5단계부터 체크하면 호감도가 없어서 잠긴 채로 남습니다.'
            : '⚠️ Always check items from Lv.1 up! Higher-level items stay locked until lower-level affinity is accumulated first. Checking Lv.5 first will leave it locked.'}
        </div>
        <div style={{ fontSize: '12px', lineHeight: '1.75', color: theme.colors.textLight, marginBottom: '10px' }}>
          {isKo
            ? '동행 하루 = +1점 · 왼쪽 일반 아이템 구매 시 추가 점수. 오른쪽 시즌 아이템은 호감도 미반영.'
            : 'Companion: +1pt/day · Left-column normal items give bonus pts. Right-column items do NOT count.'}
        </div>
        <div style={{
          background: '#F1F8E9', borderRadius: '6px', padding: '10px 12px',
          fontSize: '11px', lineHeight: '2.1', border: `1px solid ${theme.colors.border}`
        }}>
         {[
  { lv: isKo ? '1단계 일반 아이템' : 'Lv.1 normal items', pts: isKo ? '총 4점' : '2 pts each', threshold: isKo ? '→ 누적 4점 = 2단계 개방' : '→ 4 total = Lv.2' },
  { lv: isKo ? '2단계 일반 아이템' : 'Lv.2 normal items', pts: isKo ? '총 6점' : '3 pts each', threshold: isKo ? '→ 누적 10점 = 3단계 개방' : '→ 10 total = Lv.3' },
  { lv: isKo ? '3단계 일반 아이템' : 'Lv.3 normal items', pts: isKo ? '총 8점' : '4 pts each', threshold: isKo ? '→ 누적 18점 = 4단계 개방' : '→ 18 total = Lv.4' },
  { lv: isKo ? '4단계 일반 아이템' : 'Lv.4 normal items', pts: isKo ? '총 10점' : '5 pts each', threshold: isKo ? '→ 누적 28점 = 5단계 개방' : '→ 28 total = Lv.5' },
].map(r => (
  <div key={r.lv} style={{ display: 'flex', gap: '6px', color: theme.colors.text, flexWrap: 'wrap', marginBottom: '4px' }}>
    <span style={{ color: theme.colors.affinity, fontWeight: 'bold', width: '115px', flexShrink: 0 }}>{r.lv}</span>
    <span style={{ width: '45px', flexShrink: 0 }}>{r.pts}</span>
    <span style={{ color: theme.colors.textLight, flex: 1, minWidth: '120px', wordBreak: 'keep-all' }}>{r.threshold}</span>
  </div>
))}
          <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: `1px solid ${theme.colors.border}`, color: '#555', fontSize: '11px' }}>
            {isKo
              ? '5단계 개방 조건: 누적 28점 이상 + 4단계 상호작용 완료 (본 계산기는 완료 가정)'
              : 'Lv.4 requires 18+ pts + Lv.4 interaction (assumed done in this calculator)'}
          </div>
        </div>
      </GuideSection>

      <GuideSection title={isKo ? '🕯️ 양초 획득' : '🕯️ Candle Income'}>
        <div style={{ fontSize: '12px', lineHeight: '2', color: theme.colors.textLight }}>
          <div>• {isKo ? '시즌패스 보유 시 일일 6개, 미보유 시 5개 획득.' : 'Daily: 6 with season pass, 5 without.'}</div>
          <div>• {isKo ? '현재 보유 양초에 오늘치까지 포함하여 입력하세요 (오늘 이미 획득 가정).' : "Include today's candles in the current amount (assumed already collected)."}</div>
          <div>• {isKo ? `시패 구입 예정이라면 '아니오' 선택 후 구매예정 체크. (+${BONUS_CANDLES}개 보너스)` : `Plan to buy pass? Select 'No' then check 'Plan to Buy'. (+${BONUS_CANDLES} candles)`}</div>
        </div>
      </GuideSection>

      <div style={{ fontSize: '11px', color: '#888', paddingBottom: '4px', fontWeight: 'bold' }}>
        {isKo ? '• 아이콘은 Sky Wiki 참고, 양초·하트 아이콘은 햇비님 제작 자료입니다.' : '• Icons from Sky Wiki; candle & heart icons by 햇비 Sky Solar.'}
      </div>
    </div>
  );
}

/* ── 메인 ──────────────────────────────────── */
export function SettingsPanel({
  currentCandles, setCurrentCandles,
  ownsSeasonPass, setOwnsSeasonPass,
  buySeasonPass, setBuySeasonPass,
  cashPackCount, setCashPackCount,
  remainingDays,
  seasonEnd,
  cashCandles = 0,
  showCashPack = true,
  language
}) {
  const t = translations[language];
  const [guideOpen, setGuideOpen] = useState(false);
  const isKo = language === 'ko';

  // 숫자 입력을 문자열로 별도 관리 — "0"을 지우고 새 값을 타이핑하는 동안 빈 칸으로 둘 수 있게 함
  const [candlesText, setCandlesText] = useState(String(currentCandles));

  const hasPass = ownsSeasonPass === 'yes' || buySeasonPass;
  const dailyCandles = hasPass ? 6 : 5;
  const seasonPassBonus = ownsSeasonPass !== 'yes' && buySeasonPass ? BONUS_CANDLES : 0;
  const candlesFromDays = remainingDays * dailyCandles;
  const totalAvailableCandles = currentCandles + candlesFromDays + seasonPassBonus + cashCandles;
  const cashCost = cashPackCount * CASH_PACK_PRICE;

  return (
    <div style={{
      background: theme.colors.white, padding: '16px 20px',
      borderRadius: '12px', marginBottom: '16px',
      marginLeft: 'auto', marginRight: 'auto',
      border: `2px solid ${theme.colors.border}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
      maxWidth: '660px'
    }}>
      {/* 가이드 토글 — 맨 위에 배치 */}
      <div style={{ marginBottom: '14px' }}>
        <button
          onClick={() => setGuideOpen(o => !o)}
          style={{
            width: '100%', cursor: 'pointer',
            background: guideOpen ? '#1565C0' : theme.colors.primary,
            border: 'none',
            borderRadius: guideOpen ? '10px 10px 0 0' : '10px',
            padding: '12px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: '14px', color: '#fff', fontWeight: 'bold',
            boxShadow: guideOpen ? 'none' : '0 2px 6px rgba(33,150,243,0.35)'
          }}
        >
          <span>📖 {isKo ? '처음이신가요? 사용 방법 보기' : 'First time? How to Use'}</span>
          <span style={{
            fontSize: '20px', marginLeft: '8px', lineHeight: 1,
            display: 'inline-block',
            transform: guideOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }}>▼</span>
        </button>
        {!guideOpen && (
          <div style={{
            textAlign: 'center', fontSize: '11px', color: theme.colors.primary,
            marginTop: '4px', opacity: 0.7
          }}>
            {isKo ? '▼ 클릭하면 아이템 상태·호감도 설명을 볼 수 있어요' : '▼ Click to see item states & affinity guide'}
          </div>
        )}
        {guideOpen && (
          <div style={{
            border: `2px solid ${theme.colors.primary}`,
            borderTop: 'none', borderRadius: '0 0 10px 10px',
            padding: '0 16px',
            background: '#F8FBFF'
          }}>
            <Guide isKo={isKo} />
          </div>
        )}
      </div>

      {/* 입력 행 */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '14px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: theme.colors.textLight }}>
            {t.currentCandles}
          </label>
          <input
            type="number" value={candlesText} min={0}
            onChange={(e) => {
              const raw = e.target.value;
              setCandlesText(raw);
              if (raw === '') return; // 지우는 중엔 강제로 0을 채우지 않음 — 새 값을 이어서 입력 가능
              const num = Number(raw);
              if (!Number.isNaN(num)) setCurrentCandles(Math.max(0, num));
            }}
            onBlur={() => {
              const num = Math.max(0, Math.floor(Number(candlesText)) || 0);
              setCandlesText(String(num));
              setCurrentCandles(num);
            }}
            style={{
              width: '90px', padding: '6px 8px',
              borderRadius: '6px', border: `2px solid ${theme.colors.border}`,
              fontSize: '14px', textAlign: 'center'
            }}
          />
        </div>

        <div style={{ opacity: ownsSeasonPass === 'yes' ? 0.4 : 1 }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: theme.colors.textLight }}>
            {t.ownsSeasonPass}
          </label>
          <label style={{
            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px',
            cursor: ownsSeasonPass === 'yes' ? 'not-allowed' : 'pointer',
            color: buySeasonPass && ownsSeasonPass !== 'yes' ? theme.colors.primary : theme.colors.textLight
          }}>
            <input
              type="checkbox"
              checked={ownsSeasonPass === 'yes' ? false : buySeasonPass}
              onChange={() => setBuySeasonPass(!buySeasonPass)}
              disabled={ownsSeasonPass === 'yes'}
              style={{ width: '15px', height: '15px', accentColor: theme.colors.primary }}
            />
            {t.buySeasonPass} (+{BONUS_CANDLES}{t.bonusCandles})
          </label>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: theme.colors.textLight }}>
            {t.ownsSeasonPass}
          </label>
          <div style={{ display: 'flex', gap: '4px' }}>
            {['yes', 'no'].map(v => (
              <button key={v} onClick={() => setOwnsSeasonPass(v)} style={{
                padding: '6px 12px', fontSize: '13px', cursor: 'pointer',
                background: ownsSeasonPass === v ? theme.colors.primary : theme.colors.white,
                color: ownsSeasonPass === v ? theme.colors.white : theme.colors.primary,
                border: `2px solid ${theme.colors.primary}`, borderRadius: '6px',
                fontWeight: ownsSeasonPass === v ? 'bold' : 'normal'
              }}>
                {v === 'yes' ? t.yes : t.no}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 현질 팩 (+/- 버튼) */}
      {showCashPack && <div style={{
        display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
        marginBottom: '14px', padding: '10px 14px',
        background: '#FFFDE7', borderRadius: '8px', border: '1px solid #FFE082'
      }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#E65100' }}>
          {isKo ? '💳 현질 팩' : '💳 Cash Pack'}
        </div>
        <div style={{ fontSize: '11px', color: '#888' }}>
          {isKo ? `15개 / ${CASH_PACK_PRICE.toLocaleString()}원` : `15 candles / ₩${CASH_PACK_PRICE.toLocaleString()}`}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
          <button
            onClick={() => setCashPackCount(Math.max(0, cashPackCount - 1))}
            style={{
              width: '30px', height: '30px', borderRadius: '6px', fontSize: '18px',
              border: '2px solid #FFB300', background: '#FFF8E1',
              cursor: cashPackCount > 0 ? 'pointer' : 'not-allowed',
              opacity: cashPackCount > 0 ? 1 : 0.4,
              display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1
            }}
          >−</button>
          <div style={{
            minWidth: '40px', textAlign: 'center',
            fontWeight: 'bold', fontSize: '16px', color: cashPackCount > 0 ? '#E65100' : '#888'
          }}>
            {cashPackCount}
          </div>
          <button
            onClick={() => setCashPackCount(cashPackCount + 1)}
            style={{
              width: '30px', height: '30px', borderRadius: '6px', fontSize: '18px',
              border: '2px solid #FFB300', background: '#FFF8E1',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1
            }}
          >+</button>
          {cashPackCount > 0 && (
            <div style={{ fontSize: '12px', color: '#E65100', marginLeft: '4px' }}>
              → {cashPackCount * CASH_PACK_CANDLES}{isKo ? '개' : ''} / {cashCost.toLocaleString()}원
            </div>
          )}
        </div>
      </div>}

      {/* 양초 계산 과정 */}
      <div style={{
        background: '#F0F7FF', borderRadius: '8px', padding: '10px 14px',
        border: `1px solid ${theme.colors.border}`, fontSize: '13px', marginBottom: '12px'
      }}>
        {seasonEnd && (
          <div style={{
            fontSize: '11px', color: theme.colors.textLight,
            marginBottom: '8px', paddingBottom: '7px',
            borderBottom: `1px solid ${theme.colors.border}`
          }}>
            {isKo ? '⏰ 시즌 종료' : '⏰ Season ends'}{' '}
            <b style={{ color: theme.colors.primary }}>
              {seasonEnd.toLocaleDateString(isKo ? 'ko-KR' : 'en-US', { month: 'long', day: 'numeric', weekday: 'short' })}
            </b>
            <span style={{ marginLeft: '6px', color: '#E65100' }}>({remainingDays}{isKo ? '일 남음' : 'd left'})</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
          <span style={{ color: theme.colors.textLight }}>{isKo ? '현재 보유' : 'Current candles'}</span>
          <span>{currentCandles}{t.bonusCandles}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
          <span style={{ color: theme.colors.textLight }}>
            + {isKo ? `남은 ${remainingDays}일 × 일일 ${dailyCandles}개` : `${remainingDays}d × ${dailyCandles}/day`}
          </span>
          <span>= {candlesFromDays}{t.bonusCandles}</span>
        </div>
        {seasonPassBonus > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span style={{ color: theme.colors.textLight }}>+ {isKo ? '시패 보너스' : 'Pass bonus'}</span>
            <span style={{ color: theme.colors.primary }}>+{seasonPassBonus}{t.bonusCandles}</span>
          </div>
        )}
        {showCashPack && cashCandles > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span style={{ color: theme.colors.textLight }}>
              + {isKo ? `현질 ${cashPackCount}팩 × 15개` : `Cash ${cashPackCount} packs × 15`}
            </span>
            <span style={{ color: '#E65100' }}>+{cashCandles}{t.bonusCandles}</span>
          </div>
        )}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          marginTop: '6px', paddingTop: '6px',
          borderTop: `1px solid ${theme.colors.border}`,
          fontWeight: 'bold', color: theme.colors.primary
        }}>
          <span>{isKo ? '총 사용 가능 양초' : 'Total available'}</span>
          <span style={{ fontSize: '15px' }}>{totalAvailableCandles}{t.bonusCandles}</span>
        </div>
      </div>

    </div>
  );
}
