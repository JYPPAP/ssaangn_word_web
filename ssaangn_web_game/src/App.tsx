/**
 * 메인 앱 컴포넌트 - JavaScript modules 기반 한글 단어 맞추기 게임
 * 
 * 기존 React 컴포넌트들을 제거하고 JavaScript modules의 기능을 활용한
 * 새로운 게임 시스템으로 완전히 교체했습니다.
 * 
 * 주요 변경사항:
 * - JavaScript modules (game-core, game-board, keyboard) 활용
 * - 하루 1개 제한 제거, 무제한 게임 가능
 * - 원본 게임 로직 및 힌트 시스템 그대로 유지
 * - TypeScript와 React의 장점은 그대로 활용
 */

import React, { useEffect, useState } from 'react';
import ModuleGameApp from './components/ModuleGame/ModuleGameApp';
import './App.css';

interface AppSettings {
  darkMode: boolean;
  compactMode: boolean;
  animationsEnabled: boolean;
  soundEnabled: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
  compactMode: false,
  animationsEnabled: true,
  soundEnabled: false
};

const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // 설정 로드
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('game-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (err) {
      console.warn('설정 로드 실패:', err);
    }
    
    setIsLoading(false);
  }, []);

  // 설정 저장
  useEffect(() => {
    try {
      localStorage.setItem('game-settings', JSON.stringify(settings));
    } catch (err) {
      console.warn('설정 저장 실패:', err);
    }
  }, [settings]);

  // 다크모드 적용
  useEffect(() => {
    const root = document.documentElement;
    if (settings.darkMode) {
      root.classList.add('dark-mode');
    } else {
      root.classList.remove('dark-mode');
    }
  }, [settings.darkMode]);

  // 컴팩트 모드 적용
  useEffect(() => {
    const root = document.documentElement;
    if (settings.compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }
  }, [settings.compactMode]);

  // 전역 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+D: 다크모드 토글
      if (event.ctrlKey && event.key === 'd') {
        event.preventDefault();
        setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
      }
      
      // Ctrl+Shift+C: 컴팩트 모드 토글
      if (event.ctrlKey && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        setSettings(prev => ({ ...prev, compactMode: !prev.compactMode }));
      }
      
      // Ctrl+Shift+A: 애니메이션 토글
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        setSettings(prev => ({ ...prev, animationsEnabled: !prev.animationsEnabled }));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 앱 클래스 생성
  const getAppClass = () => {
    let className = 'app';
    if (settings.darkMode) className += ' dark-mode';
    if (settings.compactMode) className += ' compact-mode';
    if (!settings.animationsEnabled) className += ' no-animations';
    return className;
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-content">
          <div className="loading-spinner" />
          <h1>한글 단어 맞추기</h1>
          <p>게임을 준비하고 있습니다...</p>
        </div>
      </div>
    );
  }


  return (
    <div className={getAppClass()}>
      {/* 메인 게임 */}
      <ModuleGameApp 
        compact={settings.compactMode}
        animated={settings.animationsEnabled}
      />
    </div>
  );
};

export default App;