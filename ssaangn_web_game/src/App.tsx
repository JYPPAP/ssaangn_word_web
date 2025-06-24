import React, { useEffect, useState } from 'react';
import ModuleGameApp from './components/ModuleGame/ModuleGameApp';
import './App.css';

interface AppSettings {
  darkMode: boolean;
  animationsEnabled: boolean;
  soundEnabled: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  darkMode: false,
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

  // 전역 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+D: 다크모드 토글
      if (event.ctrlKey && event.key === 'd') {
        event.preventDefault();
        setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
      }
      
      // Ctrl+Shift+A: 애니메이션 토글
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        setSettings(prev => ({ ...prev, animationsEnabled: !prev.animationsEnabled }));
      }
    };
    // cleanup 함수로 메모리 누수 방지
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 앱 클래스 생성
  const getAppClass = () => {
    let className = 'app';
    if (settings.darkMode) className += ' dark-mode';
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
        animated={settings.animationsEnabled}
      />
    </div>
  );
};

export default App;