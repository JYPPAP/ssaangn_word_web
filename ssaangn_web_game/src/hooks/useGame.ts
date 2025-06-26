/**
 * 게임 로직 커스텀 훅
 * 
 * 한글 단어 맞추기 게임의 핵심 기능들을 추상화한 커스텀 훅입니다.
 * Zustand 스토어를 래핑하여 컴포넌트에서 사용하기 쉬운 인터페이스를 제공합니다.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import type { HintType } from '../types/game';

/**
 * 게임 상태 인터페이스
 */
export interface UseGameReturn {
  // 현재 게임 상태
  currentWord: string;
  targetWord: string;
  gameStatus: 'playing' | 'won' | 'lost';
  attempts: number;
  rows: Array<{
    cells: Array<{
      char: string;
      hint: HintType | null;
    }>;
    isSubmitted: boolean;
  }>;
  currentRowIndex: number;
  
  // 게임 메타 정보
  isLoading: boolean;
  error: string | null;
  maxAttempts: number;
  remainingAttempts: number;
  progress: number; // 진행률 (0-100)
  
  // 게임 통계
  stats: {
    totalGames: number;
    gamesWon: number;
    gamesLost: number;
    winRate: number;
    currentStreak: number;
    bestScore: number;
  };
  
  // 게임 설정
  settings: {
    autoSave: boolean;
    showHints: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
    soundEnabled: boolean;
  };
  
  // 게임 액션들
  actions: {
    // 기본 게임 조작
    startNewGame: () => void;
    restartCurrentGame: () => void;
    submitWord: (word: string) => boolean;
    updateCurrentWord: (word: string) => void;
    
    // 자모 입력 관련
    inputJamo: (jamo: string) => void;
    backspace: () => void;
    
    // 고급 기능
    undoLastMove: () => void;
    resetAllData: () => void;
    
    // 설정 관리
    updateSettings: (settings: Partial<UseGameReturn['settings']>) => void;
    
    // 유틸리티
    isValidInput: (word: string) => boolean;
    getHintForWord: (word: string) => HintType[] | null;
  };
}

/**
 * 게임 로직 커스텀 훅
 * 
 * @example
 * ```tsx
 * function GameComponent() {
 *   const game = useGame();
 *   
 *   const handleSubmit = () => {
 *     if (game.actions.isValidInput(game.currentWord)) {
 *       game.actions.submitWord(game.currentWord);
 *     }
 *   };
 *   
 *   return (
 *     <div>
 *       <div>시도: {game.attempts}/{game.maxAttempts}</div>
 *       <div>상태: {game.gameStatus}</div>
 *       <button onClick={game.actions.startNewGame}>새 게임</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useGame = (): UseGameReturn => {
  const store = useGameStore();

  // 게임 진행률 계산
  const progress = useMemo(() => {
    if (store.settings.maxAttempts === 0) return 0;
    return Math.min(100, (store.attempts / store.settings.maxAttempts) * 100);
  }, [store.attempts, store.settings.maxAttempts]);

  // 남은 시도 횟수 계산
  const remainingAttempts = useMemo(() => {
    return Math.max(0, store.settings.maxAttempts - store.attempts);
  }, [store.attempts, store.settings.maxAttempts]);

  // 게임 액션들 메모이제이션
  const actions = useMemo(() => ({
    startNewGame: () => {
      store.resetGame();
    },
    
    restartCurrentGame: () => {
      store.restartGame();
    },
    
    submitWord: (word: string) => {
      return store.submitWord(word);
    },
    
    updateCurrentWord: (word: string) => {
      store.updateCurrentWord(word);
    },
    
    inputJamo: (jamo: string) => {
      store.inputJamo(jamo);
    },
    
    backspace: () => {
      store.backspace();
    },
    
    undoLastMove: () => {
      store.undoLastMove();
    },
    
    resetAllData: () => {
      store.clearGameData();
      store.resetStats();
      store.initializeGame();
    },
    
    updateSettings: (newSettings: Partial<UseGameReturn['settings']>) => {
      store.updateSettings(newSettings);
    },
    
    isValidInput: (word: string) => {
      return store.isValidInput(word);
    },
    
    getHintForWord: (word: string) => {
      if (!store.isValidInput(word) || !store.targetWord) {
        return null;
      }
      
      try {
        // TODO: import calculateHint properly
        return null;
      } catch {
        return null;
      }
    }
  }), [store]);

  return {
    // 현재 게임 상태
    currentWord: store.currentWord,
    targetWord: store.targetWord,
    gameStatus: store.gameStatus,
    attempts: store.attempts,
    rows: store.rows,
    currentRowIndex: store.currentRowIndex,
    
    // 메타 정보
    isLoading: store.isLoading,
    error: store.error,
    maxAttempts: store.settings.maxAttempts,
    remainingAttempts,
    progress,
    
    // 통계
    stats: {
      totalGames: store.stats.totalGames,
      gamesWon: store.stats.gamesWon,
      gamesLost: store.stats.gamesLost,
      winRate: store.stats.winRate,
      currentStreak: store.stats.currentStreak,
      bestScore: store.stats.bestScore
    },
    
    // 설정
    settings: {
      autoSave: store.settings.autoSave,
      showHints: store.settings.showHints,
      difficulty: store.settings.difficulty,
      soundEnabled: store.settings.soundEnabled
    },
    
    // 액션들
    actions
  };
};

/**
 * 게임 키보드 입력 처리 훅
 * 
 * @param onSubmit - 단어 제출 콜백
 * @param onDelete - 글자 삭제 콜백
 * @param onInput - 글자 입력 콜백
 * 
 * @example
 * ```tsx
 * function GameBoard() {
 *   const game = useGame();
 *   
 *   useGameKeyboard(
 *     () => game.actions.submitWord(game.currentWord),
 *     () => game.actions.updateCurrentWord(game.currentWord.slice(0, -1)),
 *     (char) => game.actions.updateCurrentWord(game.currentWord + char)
 *   );
 *   
 *   return <div>게임 보드</div>;
 * }
 * ```
 */
export const useGameKeyboard = (
  onSubmit?: () => void,
  onDelete?: () => void,
  onInput?: (char: string) => void
) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // 입력 필드에 포커스가 있으면 무시
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    const key = event.key;
    const isShiftPressed = event.shiftKey;
    
    // Enter 키 - 단어 제출
    if (key === 'Enter' && onSubmit) {
      event.preventDefault();
      onSubmit();
      return;
    }
    
    // Backspace 키 - 글자 삭제
    if (key === 'Backspace' && onDelete) {
      event.preventDefault();
      onDelete();
      return;
    }
    
    // Shift + 기본자음 조합으로 이중자음 입력
    if (onInput && isShiftPressed && key.length === 1) {
      const doubleConsonantMap: { [key: string]: string } = {
        'ㄱ': 'ㄲ',
        'ㄷ': 'ㄸ', 
        'ㅂ': 'ㅃ',
        'ㅅ': 'ㅆ',
        'ㅈ': 'ㅉ'
      };
      
      if (doubleConsonantMap[key]) {
        event.preventDefault();
        onInput(doubleConsonantMap[key]);
        return;
      }
    }
    
    // 한글 자모 및 완성 문자 입력 (ㄱ-ㅎ, ㅏ-ㅣ, 가-힣)
    if (onInput && key.length === 1 && /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(key)) {
      event.preventDefault();
      onInput(key);
      return;
    }
  }, [onSubmit, onDelete, onInput]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

/**
 * 게임 상태 변화 감지 훅
 * 
 * @param onGameStart - 게임 시작 콜백
 * @param onGameEnd - 게임 종료 콜백 (승리/패배)
 * @param onWordSubmit - 단어 제출 콜백
 * 
 * @example
 * ```tsx
 * function GameEffects() {
 *   useGameEffects(
 *     () => console.log('게임 시작!'),
 *     (status) => console.log('게임 종료:', status),
 *     (word, hints) => console.log('단어 제출:', word, hints)
 *   );
 *   
 *   return null;
 * }
 * ```
 */
export const useGameEffects = (
  onGameStart?: () => void,
  onGameEnd?: (status: 'won' | 'lost') => void,
  onWordSubmit?: (word: string, hints: HintType[]) => void
) => {
  const gameStatus = useGameStore(state => state.gameStatus);
  const attempts = useGameStore(state => state.attempts);
  const rows = useGameStore(state => state.rows);

  // 게임 시작 감지
  useEffect(() => {
    if (gameStatus === 'playing' && attempts === 0 && onGameStart) {
      onGameStart();
    }
  }, [gameStatus, attempts, onGameStart]);

  // 게임 종료 감지
  useEffect(() => {
    if ((gameStatus === 'won' || gameStatus === 'lost') && onGameEnd) {
      onGameEnd(gameStatus);
    }
  }, [gameStatus, onGameEnd]);

  // 단어 제출 감지
  useEffect(() => {
    const lastSubmittedRow = rows.find((row, index) => 
      row.isSubmitted && index === attempts - 1
    );
    
    if (lastSubmittedRow && onWordSubmit) {
      const word = lastSubmittedRow.cells.map(cell => cell.char).join('');
      const hints = lastSubmittedRow.cells.map(cell => cell.hint!);
      onWordSubmit(word, hints);
    }
  }, [rows, attempts, onWordSubmit]);
};

/**
 * 게임 통계 계산 훅
 * 
 * @returns 계산된 통계 데이터
 * 
 * @example
 * ```tsx
 * function StatsDisplay() {
 *   const stats = useGameStats();
 *   
 *   return (
 *     <div>
 *       <div>승률: {stats.winRate}%</div>
 *       <div>평균 시도: {stats.averageAttempts}</div>
 *       <div>현재 연승: {stats.currentStreak}</div>
 *     </div>
 *   );
 * }
 * ```
 */
export const useGameStats = () => {
  const stats = useGameStore(state => state.stats);
  
  return useMemo(() => ({
    ...stats,
    winRate: Math.round(stats.winRate * 10) / 10, // 소수점 1자리
    averageAttempts: Math.round(stats.averageAttempts * 10) / 10,
    efficiency: stats.totalGames > 0 
      ? Math.round((stats.gamesWon / Math.max(1, stats.averageAttempts)) * 100) 
      : 0
  }), [stats]);
};

/**
 * 게임 성과 분석 훅
 * 
 * @returns 성과 분석 데이터
 */
export const useGameAnalytics = () => {
  const stats = useGameStore(state => state.stats);
  const rows = useGameStore(state => state.rows);
  
  return useMemo(() => {
    const submittedRows = rows.filter(row => row.isSubmitted);
    const hintDistribution = {
      '🥕': 0, '🍄': 0, '🧄': 0, '🍆': 0, '🍌': 0, '🍎': 0
    };
    
    // 힌트 분포 계산
    submittedRows.forEach(row => {
      row.cells.forEach(cell => {
        if (cell.hint) {
          hintDistribution[cell.hint]++;
        }
      });
    });
    
    const totalHints = Object.values(hintDistribution).reduce((a, b) => a + b, 0);
    
    return {
      hintDistribution,
      accuracy: totalHints > 0 ? (hintDistribution['🥕'] / totalHints) * 100 : 0,
      efficiency: stats.gamesWon > 0 ? stats.bestScore / Math.max(1, stats.gamesWon) : 0,
      consistency: stats.totalGames > 1 ? 100 - (Math.abs(stats.winRate - 50) * 2) : 0
    };
  }, [stats, rows]);
};