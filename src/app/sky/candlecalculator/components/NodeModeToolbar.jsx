"use client";
import React from 'react';
import { theme, translations } from '../styles/theme';

const MODES = [
  { key: 'target', color: theme.colors.target, bg: '#E3F2FD' },
  { key: 'owned',  color: theme.colors.owned,  bg: '#F5F5F5' }
];

export function NodeModeToolbar({ selectionMode, onChangeMode, language }) {
  const t = translations[language];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
      <div style={{ fontSize: '13px', color: theme.colors.textLight, fontWeight: '500' }}>
        {t.selectionMode}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {MODES.map(mode => {
          const isActive = selectionMode === mode.key;
          const label = t[`mode${mode.key.charAt(0).toUpperCase() + mode.key.slice(1)}`];
          return (
            <button key={mode.key} onClick={() => onChangeMode(mode.key)}
              title={t.selectionModeDesc?.[mode.key]}
              style={{
                padding: '8px 20px',
                background: isActive ? mode.color : theme.colors.white,
                color: isActive ? theme.colors.white : mode.color,
                border: `2px solid ${mode.color}`,
                borderRadius: '20px', cursor: 'pointer',
                fontWeight: 'bold', fontSize: '13px', transition: 'all 0.2s',
                boxShadow: isActive ? `0 2px 8px ${mode.color}55` : 'none'
              }}>
              {label}
            </button>
          );
        })}
      </div>
      {selectionMode && (
        <div style={{
          fontSize: '11px', color: theme.colors.textLight, textAlign: 'center',
          padding: '4px 12px', borderRadius: '12px',
          background: MODES.find(m => m.key === selectionMode)?.bg
        }}>
          {t.selectionModeDesc?.[selectionMode]}
        </div>
      )}
    </div>
  );
}
