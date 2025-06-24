/**
 * JavaScript modules를 활용한 메인 게임 앱 컴포넌트
 */

import React, { useState, useEffect } from 'react';
import { useModuleGame } from '../../hooks/useModuleGame';
import ModuleGameBoard from './ModuleGameBoard';
import ModuleKeyboard from './ModuleKeyboard';
import './ModuleGameApp.css';

interface ModuleGameAppProps {
  animated?: boolean;
}

const ModuleGameApp: React.FC<ModuleGameAppProps> = ({
  animated = true
}) => {
  const game = useModuleGame();
  
  // UI 상태
  const [showResult, setShowResult] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // 키보드 이벤트 리스너
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 게임이 진행 중일 때만 키보드 입력 처리
      if (game.gameStatus !== 'playing') return;
      
      const key = event.key;
      
      // Enter 키 - 제출
      if (key === 'Enter') {
        event.preventDefault();
        handleSubmit();
        return;
      }
      
      // Backspace 키 - 삭제
      if (key === 'Backspace') {
        event.preventDefault();
        game.actions.deleteLetter();
        return;
      }
      
      // 한글 입력 (ㄱ-ㅎ, ㅏ-ㅣ)
      if (/^[ㄱ-ㅎㅏ-ㅣ]$/.test(key)) {
        event.preventDefault();
        game.actions.inputLetter(key);
        return;
      }
      
      // 영어 키보드를 한글로 변환
      const englishToKorean: { [key: string]: string } = {
        'q': 'ㅂ', 'w': 'ㅈ', 'e': 'ㄷ', 'r': 'ㄱ', 't': 'ㅅ',
        'y': 'ㅛ', 'u': 'ㅕ', 'i': 'ㅑ', 'o': 'ㅐ', 'p': 'ㅔ',
        'a': 'ㅁ', 's': 'ㄴ', 'd': 'ㅇ', 'f': 'ㄹ', 'g': 'ㅎ',
        'h': 'ㅗ', 'j': 'ㅓ', 'k': 'ㅏ', 'l': 'ㅣ',
        'z': 'ㅋ', 'x': 'ㅌ', 'c': 'ㅊ', 'v': 'ㅍ',
        'b': 'ㅠ', 'n': 'ㅜ', 'm': 'ㅡ'
      };
      
      if (englishToKorean[key.toLowerCase()]) {
        event.preventDefault();
        game.actions.inputLetter(englishToKorean[key.toLowerCase()]);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [game.gameStatus, game.actions]);

  // 게임 종료 시 결과 모달 표시
  useEffect(() => {
    if (game.gameStatus === 'won' || game.gameStatus === 'lost') {
      const timer = setTimeout(() => {
        setShowResult(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    } else {
      setShowResult(false);
    }
  }, [game.gameStatus]);

  // 에러 알림 표시
  useEffect(() => {
    if (game.error) {
      setNotification(game.error);
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [game.error]);

  // 키보드 입력 핸들러
  const handleKeyPress = (key: string) => {
    game.actions.inputLetter(key);
  };

  const handleDelete = () => {
    game.actions.deleteLetter();
  };

  const handleSubmit = () => {
    game.actions.submitGuess();
  };

  // 새 게임 시작
  const handleNewGame = () => {
    game.actions.startNewGame();
    setShowResult(false);
  };

  // 힌트 요청
  const handleHint = () => {
    const hintResult = game.actions.requestHint();
    
    if (hintResult.success && hintResult.jamo) {
      // 힌트 자모를 키보드에 당근색으로 표시
      try {
        // GameModules의 KeyboardService를 통해 키 색상 설정
        import('../../services/GameModules').then(({ KeyboardService, getConstants }) => {
          const constants = getConstants();
          KeyboardService.setKeyColor(hintResult.jamo!, constants.DATA_MATCH[constants.DATA_COLOR]);
        });
      } catch (err) {
        console.warn('키보드 색상 설정 실패:', err);
      }
      
      // 힌트 아이콘과 메시지 표시
      setNotification(`${hintResult.hint} ${hintResult.message}`);
    } else {
      // 실패 시 메시지 표시
      setNotification(hintResult.message);
    }
    
    // 3초 후 알림 제거
    setTimeout(() => setNotification(null), 3000);
  };


  // 승률 계산
  const winRate = game.statistics.totalGames > 0 
    ? Math.round((game.statistics.totalWins / game.statistics.totalGames) * 100) 
    : 0;

  // 로딩 상태
  if (game.isLoading && !game.isInitialized) {
    return (
      <div className="module-game-loading">
        <div className="loading-content">
          <div className="loading-spinner" />
          <h2>게임 준비 중...</h2>
          <p>한글 단어 맞추기 게임을 준비하고 있습니다</p>
        </div>
      </div>
    );
  }

  // 초기화 오류
  if (game.error && !game.isInitialized) {
    return (
      <div className="module-game-error">
        <div className="error-content">
          <h2>🚫 게임을 시작할 수 없습니다</h2>
          <p>{game.error}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            페이지 새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`module-game-app`}>
      {/* 메인 게임 영역 */}
      <main className="game-main">
        <div className="game-container">
          {/* 새 게임 버튼 (보드 우측 상단 고정) */}
          <div className="game-controls">
            <button
              className="new-game-button"
              onClick={handleNewGame}
              disabled={game.isLoading}
              title="새 게임 시작"
            >
              {game.isLoading ? '⏳' : '🔄'}
            </button>
          </div>
          
          <ModuleGameBoard
            board={game.board}
            currentRow={game.currentRow}
            currentGuess={game.currentGuess}
            animated={animated}
          />
          
          <ModuleKeyboard
            onKeyPress={handleKeyPress}
            onDelete={handleDelete}
            onSubmit={handleSubmit}
            onHint={handleHint}
            disabled={game.gameStatus !== 'playing' || game.isLoading}
            animated={animated}
            hintsUsed={game.hintsUsed}
          />
        </div>
      </main>

      {/* 알림 */}
      {notification && (
        <div className="notification-overlay">
          <div className="notification">
            <span className="notification-icon">⚠️</span>
            <span className="notification-text">{notification}</span>
          </div>
        </div>
      )}

      {/* 게임 결과 모달 */}
      {showResult && (
        <div className="result-modal-overlay">
          <div className="result-modal">
            <div className="result-header">
              <h2 className="result-title">
                {game.gameStatus === 'won' ? '🎉 축하합니다!' : '😔 아쉽네요!'}
              </h2>
            </div>
            
            <div className="result-content">
              {game.gameStatus === 'won' ? (
                <div className="win-content">
                  <p className="result-message">
                    <strong>{game.attempts}번</strong>만에 단어를 맞추셨네요!
                  </p>
                  <div className="word-reveal">
                    <span className="word-label">정답:</span>
                    <span className="word-text">{game.targetWord}</span>
                  </div>
                </div>
              ) : (
                <div className="lose-content">
                  <p className="result-message">
                    이번엔 맞추지 못했네요
                  </p>
                  <div className="word-reveal">
                    <span className="word-label">정답은:</span>
                    <span className="word-text">{game.targetWord}</span>
                  </div>
                </div>
              )}
              
              <div className="result-stats">
                <div className="stat-grid">
                  <div className="stat-item">
                    <span className="stat-label">총 게임</span>
                    <span className="stat-value">{game.statistics.totalGames}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">승률</span>
                    <span className="stat-value">{winRate}%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">현재 연승</span>
                    <span className="stat-value">{game.statistics.currentStreak}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">최고 연승</span>
                    <span className="stat-value">{game.statistics.bestStreak}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="result-actions">
              <button
                className="result-button secondary"
                onClick={() => setShowResult(false)}
              >
                닫기
              </button>
              <button
                className="result-button primary"
                onClick={handleNewGame}
              >
                새 게임
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 통계 모달 */}
      {showStats && (
        <div className="stats-modal-overlay">
          <div className="stats-modal">
            <div className="stats-header">
              <h2 className="stats-title">📊 게임 통계</h2>
              <button
                className="close-button"
                onClick={() => setShowStats(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="stats-content">
              <div className="stats-summary">
                <div className="summary-item">
                  <span className="summary-value">{game.statistics.totalGames}</span>
                  <span className="summary-label">총 게임 수</span>
                </div>
                <div className="summary-item">
                  <span className="summary-value">{winRate}%</span>
                  <span className="summary-label">승률</span>
                </div>
                <div className="summary-item">
                  <span className="summary-value">{game.statistics.currentStreak}</span>
                  <span className="summary-label">현재 연승</span>
                </div>
                <div className="summary-item">
                  <span className="summary-value">{game.statistics.bestStreak}</span>
                  <span className="summary-label">최고 연승</span>
                </div>
              </div>
              
              <div className="stats-details">
                <h3>게임 기록</h3>
                <div className="detail-item">
                  <span className="detail-label">승리:</span>
                  <span className="detail-value">{game.statistics.totalWins}게임</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">패배:</span>
                  <span className="detail-value">{game.statistics.totalGames - game.statistics.totalWins}게임</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 게임 완료 상태 표시 */}
      {(game.gameStatus === 'won' || game.gameStatus === 'lost') && (
        <div className="game-status-overlay">
          <div className={`status-badge ${game.gameStatus}`}>
            {game.gameStatus === 'won' ? '승리!' : '패배'}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleGameApp;