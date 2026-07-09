"use client";
import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import styles from './busTable.module.css';
import { mainRoute, seasonMaps, guideCategories, translations } from './busTableData';

const presetThemes = {
  blue: {
    background: 'linear-gradient(180deg, #e0f2fe 0%, #bae6fd 30%, #7dd3fc 60%, #38bdf8 100%)',
    border: '#0ea5e9',
    title: '#1e40af',
    mainBorder: '#3b82f6',
    selected: '#3b82f6',
    selectedText: '#1e40af',
    line: '#60a5fa'
  },
  red: {
    background: 'linear-gradient(180deg, #fee2e2 0%, #fecaca 30%, #fca5a5 60%, #f87171 100%)',
    border: '#ef4444',
    title: '#991b1b',
    mainBorder: '#dc2626',
    selected: '#dc2626',
    selectedText: '#991b1b',
    line: '#f87171'
  },
  yellow: {
    background: 'linear-gradient(180deg, #fef9c3 0%, #fef08a 30%, #fde047 60%, #facc15 100%)',
    border: '#eab308',
    title: '#854d0e',
    mainBorder: '#ca8a04',
    selected: '#ca8a04',
    selectedText: '#854d0e',
    line: '#fde047'
  },
  green: {
    background: 'linear-gradient(180deg, #d1f5d3 0%, #b5ebb7 30%, #8fe08f 60%, #6dd66f 100%)',
    border: '#4ade80',
    title: '#166534',
    mainBorder: '#22c55e',
    selected: '#22c55e',
    selectedText: '#166534',
    line: '#4ade80'
  },
  purple: {
    background: 'linear-gradient(180deg, #e9d5ff 0%, #d8b4fe 30%, #c084fc 60%, #a855f7 100%)',
    border: '#a855f7',
    title: '#6b21a8',
    mainBorder: '#9333ea',
    selected: '#9333ea',
    selectedText: '#6b21a8',
    line: '#c084fc'
  },
  // ✨ NEW: 빈티지 마법서 테마 (사진과 동일한 컨셉)
  vintage: {
    background: '#e3dcd1', // CSS에서 덮어쓰지만 Fallback용으로 추가
    border: '#8c7355',
    title: '#7a5a3a',
    mainBorder: '#183e42',
    selected: '#183e42',
    selectedText: '#ffffff',
    line: '#8c7355'
  }
};

// HEX to HSL 변환 함수 (원본 유지)
function hexToHSL(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h * 360, s * 100, l * 100];
}

// HSL to HEX 변환 함수 (원본 유지)
function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) { r = c; g = x; b = 0; } 
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; } 
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; } 
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; } 
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; } 
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

  const toHex = (n) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// 테마 생성 함수 (원본 유지)
function generateThemeFromColor(mainColor) {
  const [h, s, l] = hexToHSL(mainColor);
  return {
    background: `linear-gradient(180deg, ${hslToHex(h, s * 0.8, 92)} 0%, ${hslToHex(h, s * 0.9, 82)} 30%, ${hslToHex(h, s, 70)} 60%, ${hslToHex(h, s, 58)} 100%)`,
    border: hslToHex(h, s, 50),
    title: hslToHex(h, Math.min(s * 1.2, 100), 22),
    mainBorder: hslToHex(h, s, 48),
    selected: hslToHex(h, s, 48),
    selectedText: hslToHex(h, Math.min(s * 1.2, 100), 22),
    line: hslToHex(h, s, 62)
  };
}

export default function BusTable() {
  const [language, setLanguage] = useState('ko');
  const [theme, setTheme] = useState('blue');
  const [customColor, setCustomColor] = useState('#3b82f6');
  const [useCustomColor, setUseCustomColor] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [hue, setHue] = useState(210);
  const [saturation, setSaturation] = useState(80);
  const [lightness, setLightness] = useState(55);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [driverName, setDriverName] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  
  const captureRef = useRef(null);
  const fileInputRef = useRef(null);

  const t = translations[language];
  const currentRoute = mainRoute[language];
  const currentSeasonMaps = seasonMaps[language];
  const currentCategories = guideCategories[language];
  const currentTheme = useCustomColor 
    ? generateThemeFromColor(customColor) 
    : presetThemes[theme];

  // (상태 토글 및 변경 함수들 - 원본과 동일하여 생략 가능하나 완벽 호환을 위해 유지)
  const toggleLocation = (id) => {
    setSelectedLocations(prev => prev.includes(id) ? prev.filter(locId => locId !== id) : [...prev, id]);
  };

  const toggleOption = (categoryId, itemId, value, isMultiple) => {
    const key = `${categoryId}_${itemId}`;
    setSelectedOptions(prev => {
      const currentValues = prev[key] || [];
      if (isMultiple) {
        return currentValues.includes(value)
          ? { ...prev, [key]: currentValues.filter(v => v !== value) }
          : { ...prev, [key]: [...currentValues, value] };
      }
      return currentValues.includes(value) ? { ...prev, [key]: [] } : { ...prev, [key]: [value] };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setProfileImage(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  // 슬라이더 및 프리셋 핸들러 생략 (원본 그대로 사용)
  const handleCustomColorSelect = (color) => {
    const [h, s, l] = hexToHSL(color);
    setHue(h); setSaturation(s); setLightness(l);
    setCustomColor(color); setUseCustomColor(true);
  };

  const handlePresetTheme = (themeName) => {
    setTheme(themeName);
    setUseCustomColor(false);
  };

  const handleDownload = async () => {
    if (!captureRef.current) return;
    try {
      window.scrollTo(0, 0);
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      });
      const link = document.createElement('a');
      link.download = `Sky_Bus_Route_${new Date().toISOString().slice(0,10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('다운로드 실패:', error);
      alert('다운로드에 실패했습니다.');
    }
  };

  return (
    <div className={styles.container}>
      {/* 사용법 패널 (원본 유지) */}
      <div className={styles.instructionsPanel}>
         {/* ... (생략: 기존 코드와 동일) ... */}
      </div>

      {/* 상단 컨트롤 영역 */}
      <div className={styles.topControls}>
        <div className={styles.languageToggleContainer}>
          <button onClick={() => setLanguage('ko')} className={language === 'ko' ? styles.activeLang : ''}>한국어</button>
          <span>/</span>
          <button onClick={() => setLanguage('en')} className={language === 'en' ? styles.activeLang : ''}>English</button>
        </div>

        <div className={styles.colorSelector}>
          <span className={styles.colorLabel}>테마:</span>
          {/* 기존 5개 프리셋 버튼 유지 */}
          <button className={`${styles.colorButton} ${!useCustomColor && theme === 'blue' ? styles.activeColor : ''}`} onClick={() => handlePresetTheme('blue')} style={{ background: 'linear-gradient(135deg, #bae6fd, #38bdf8)' }} />
          <button className={`${styles.colorButton} ${!useCustomColor && theme === 'red' ? styles.activeColor : ''}`} onClick={() => handlePresetTheme('red')} style={{ background: 'linear-gradient(135deg, #fecaca, #f87171)' }} />
          <button className={`${styles.colorButton} ${!useCustomColor && theme === 'yellow' ? styles.activeColor : ''}`} onClick={() => handlePresetTheme('yellow')} style={{ background: 'linear-gradient(135deg, #fef08a, #facc15)' }} />
          <button className={`${styles.colorButton} ${!useCustomColor && theme === 'green' ? styles.activeColor : ''}`} onClick={() => handlePresetTheme('green')} style={{ background: 'linear-gradient(135deg, #bef264, #84cc16)' }} />
          <button className={`${styles.colorButton} ${!useCustomColor && theme === 'purple' ? styles.activeColor : ''}`} onClick={() => handlePresetTheme('purple')} style={{ background: 'linear-gradient(135deg, #d8b4fe, #a855f7)' }} />
          
          {/* ✨ NEW: 빈티지 테마 버튼 (책 아이콘 적용) */}
          <button 
            className={`${styles.colorButton} ${!useCustomColor && theme === 'vintage' ? styles.activeColor : ''}`}
            onClick={() => handlePresetTheme('vintage')}
            style={{ background: '#183e42', border: '2px solid #8c7355' }}
            title="마법서 테마"
          >
            📜
          </button>

          <div className={styles.colorPickerWrapper}>
            <button className={`${styles.colorButton} ${useCustomColor ? styles.activeColor : ''}`} onClick={() => setShowColorPicker(!showColorPicker)} style={{ background: useCustomColor ? customColor : 'linear-gradient(135deg, #ffffff, #e5e7eb)', position: 'relative' }}>
              <span className={styles.colorPickerLabel}>🎨</span>
            </button>
          </div>
        </div>

        {/* 커스텀 컬러 피커 모달 (원본 유지) ... 생략 ... */}
      </div>

      {/* ✨ 핵심: data-theme 속성을 추가하여 CSS가 빈티지 모드일 때만 스타일을 오버라이드 하도록 설정 */}
      <div 
        ref={captureRef} 
        className={styles.captureArea} 
        data-theme={useCustomColor ? 'custom' : theme}
        style={{ 
          background: currentTheme.background,
          borderColor: currentTheme.border
        }}
      >
        {/* 헤더 */}
        <div className={styles.header}>
          <h1 className={styles.title} style={{ color: currentTheme.title }}>{t.title}</h1>
          <div className={styles.profileSection}>
            <div 
              className={styles.profileImageWrapper}
              onClick={() => fileInputRef.current?.click()}
              style={{ borderColor: currentTheme.mainBorder }}
            >
              {profileImage ? (
                <img src={profileImage} alt="프로필" className={styles.profileImage} />
              ) : (
                <span className={styles.profilePlaceholder}>👤</span>
              )}
            </div>
            <div className={styles.profileInfo}>
              <label className={styles.profileLabel}>{t.driverLabel}</label>
              <input type="text" className={styles.profileInput} placeholder={t.driverPlaceholder} value={driverName} onChange={(e) => setDriverName(e.target.value)} style={{ color: currentTheme.title }} />
              <input type="text" className={styles.profileIntro} placeholder={t.introPlaceholder} value={introduction} onChange={(e) => setIntroduction(e.target.value)} />
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className={styles.hiddenFileInput} />
          </div>
        </div>

        {/* 메인 노선도 (원본 구조 그대로 유지) */}
        <div className={styles.routeSection} style={{ borderColor: currentTheme.mainBorder }}>
          <div className={styles.routeMap}>
            <style jsx>{`.${styles.routeMap}::before { background: ${currentTheme.line} !important; }`}</style>
            
            {currentRoute.map((location) => {
              const isMainSelected = selectedLocations.includes(location.id);
              return (
                <div key={location.id} className={styles.locationWrapper}>
                  <div
                    className={`${styles.mainLocation} ${isMainSelected ? styles.mainLocationSelected : ''}`}
                    onClick={() => toggleLocation(location.id)}
                    style={{
                      borderColor: isMainSelected ? currentTheme.selected : currentTheme.mainBorder,
                      backgroundColor: isMainSelected ? currentTheme.selected : 'white',
                      color: isMainSelected ? 'white' : currentTheme.title
                    }}
                  >
                    {isMainSelected && <span className={styles.checkmark}>✓</span>}
                    <div>{location.icon}</div>
                    <div>{location.name}</div>
                  </div>
                  
                  {location.subLocations.length > 0 && (
                    <div className={styles.subLocations}>
                      {location.subLocations.map((sub) => {
                        const isSubSelected = selectedLocations.includes(sub.id);
                        return (
                          <div
                            key={sub.id}
                            className={`${styles.subLocation} ${isSubSelected ? styles.subLocationSelected : ''}`}
                            onClick={() => toggleLocation(sub.id)}
                            style={{
                              borderColor: isSubSelected ? currentTheme.selected : '#cbd5e1',
                              backgroundColor: isSubSelected ? currentTheme.selected : 'white',
                              color: isSubSelected ? 'white' : '#64748b'
                            }}
                          >
                            {sub.name}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* 시즌맵 */}
          <div className={styles.seasonMapSection}>
            <div className={styles.seasonMapTitle}>{t.seasonMapTitle}</div>
            <div className={styles.seasonMapList}>
              {currentSeasonMaps.map((map) => {
                const isSelected = selectedLocations.includes(map.id);
                return (
                  <div key={map.id} className={`${styles.seasonMapItem} ${isSelected ? styles.seasonMapItemSelected : ''}`} onClick={() => toggleLocation(map.id)}>
                    {map.icon} {map.name}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 옵션 영역 */}
        <div className={styles.optionsWrapper}>
          <div className={styles.categorySection}>
            <h2 className={styles.categoryTitle} style={{ color: currentTheme.title }}>{currentCategories.info.title}</h2>
            <div className={styles.optionsGrid}>
              {currentCategories.info.items.map((item) => (
                <div key={item.id} className={styles.optionGroup}>
                  <div className={styles.optionHeader} style={{ color: currentTheme.title }}>
                    <span>{item.icon}</span><span>{item.title}</span>
                  </div>
                  <div className={styles.optionButtons}>
                    {item.options.map((opt, index) => {
                      const key = `info_${item.id}`;
                      const isSelected = selectedOptions[key]?.includes(opt);
                      return (
                        <button
                          key={index}
                          className={`${styles.optionButton} ${isSelected ? styles.optionButtonSelected : ''}`}
                          onClick={() => toggleOption('info', item.id, opt, item.multiple)}
                          style={{
                            backgroundColor: isSelected ? currentTheme.selected : '#f1f5f9',
                            borderColor: isSelected ? currentTheme.selectedText : '#cbd5e1',
                            color: isSelected ? 'white' : '#64748b'
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 모두의 에티켓 */}
          <div className={styles.categorySection}>
            <h2 className={styles.categoryTitle} style={{ color: currentTheme.title }}>{currentCategories.etiquette.title}</h2>
            <div className={styles.optionsGrid}>
              {currentCategories.etiquette.items.map((item) => (
                <div key={item.id} className={styles.optionGroup}>
                  <div className={styles.optionHeader} style={{ color: currentTheme.title }}>
                    <span>{item.icon}</span><span>{item.title}</span>
                  </div>
                  <div className={styles.optionButtons}>
                    {item.options.map((opt, index) => {
                      const key = `etiquette_${item.id}`;
                      const isSelected = selectedOptions[key]?.includes(opt);
                      return (
                        <button
                          key={index}
                          className={`${styles.optionButton} ${isSelected ? styles.optionButtonSelected : ''}`}
                          onClick={() => toggleOption('etiquette', item.id, opt, true)}
                          style={{
                            backgroundColor: isSelected ? currentTheme.selected : '#f1f5f9',
                            borderColor: isSelected ? currentTheme.selectedText : '#cbd5e1',
                            color: isSelected ? 'white' : '#64748b'
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 다운로드 버튼 */}
      <div className={styles.downloadSection}>
        <button className={styles.downloadBtn} onClick={handleDownload}>{t.downloadButton}</button>
      </div>
    </div>
  );
}