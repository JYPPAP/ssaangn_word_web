/**
 * Zustand를 사용한 게임 상태 관리 스토어
 * 
 * 한글 단어 맞추기 게임의 모든 상태와 액션을 관리합니다.
 * - 게임 초기화, 단어 입력, 제출, 힌트 계산
 * - 로컬스토리지 저장/로드
 * - 게임 상태 관리 (playing/won/lost)
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type { GameState, GameRow } from '../types/game';
import { calculateHint, checkWinCondition, checkLoseCondition, calculateScore, getGameProgress } from '../utils/gameLogic';
import { encryptData, decryptData } from '../utils/encryption';
import { WORD_LIST, isValidWord } from '../data/dictionary';
import { isValidHangulWord, HangulInput } from '../utils/hangulUtils';

/**
 * 게임 통계 인터페이스
 */
interface GameStats {
  totalGames: number;
  gamesWon: number;
  gamesLost: number;
  bestScore: number;
  averageAttempts: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
}

/**
 * 게임 설정 인터페이스
 */
interface GameSettings {
  maxAttempts: number;
  autoSave: boolean;
  showHints: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  soundEnabled: boolean;
}

/**
 * 확장된 게임 스토어 인터페이스
 */
interface GameStore extends GameState {
  // 게임 통계 및 설정
  stats: GameStats;
  settings: GameSettings;
  
  // 게임 진행 상태
  isLoading: boolean;
  error: string | null;
  
  // 한글 입력기
  hangulInputs: HangulInput[];
  
  // 핵심 게임 액션
  initializeGame: () => void;
  submitWord: (word: string) => boolean;
  updateCurrentWord: (word: string) => void;
  
  // 자모 입력 관련
  inputJamo: (jamo: string) => void;
  backspace: () => void;
  
  // 게임 제어
  resetGame: () => void;
  restartGame: () => void;
  undoLastMove: () => void;
  
  // 데이터 관리
  saveGameState: () => Promise<void>;
  loadGameState: () => Promise<boolean>;
  clearGameData: () => void;
  
  // 설정 관리
  updateSettings: (settings: Partial<GameSettings>) => Promise<void>;
  
  // 통계 관리
  updateStats: () => Promise<void>;
  resetStats: () => void;
  
  // 유틸리티
  getGameProgress: () => ReturnType<typeof getGameProgress>;
  isValidInput: (word: string) => boolean;
  getCurrentScore: () => number;
}

/**
 * 초기 게임 행 생성
 */
const createInitialRows = (): GameRow[] => {
  return Array.from({ length: 7 }, () => ({
    cells: [
      { char: '', hint: null },
      { char: '', hint: null }
    ],
    isSubmitted: false
  }));
};

/**
 * 초기 게임 통계
 */
const createInitialStats = (): GameStats => ({
  totalGames: 0,
  gamesWon: 0,
  gamesLost: 0,
  bestScore: 0,
  averageAttempts: 0,
  winRate: 0,
  currentStreak: 0,
  bestStreak: 0
});

/**
 * 초기 게임 설정
 */
const createInitialSettings = (): GameSettings => ({
  maxAttempts: 7,
  autoSave: true,
  showHints: true,
  difficulty: 'medium',
  soundEnabled: true
});

/**
 * 로컬스토리지 키 상수
 */
const STORAGE_KEYS = {
  GAME_STATE: 'hangul-game-state',
  GAME_STATS: 'hangul-game-stats',
  GAME_SETTINGS: 'hangul-game-settings'
} as const;

/**
 * Zustand 스토어 생성 (devtools와 selector 지원)
 */
export const useGameStore = create<GameStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // 기본 게임 상태
      currentWord: '',
      targetWord: '',
      rows: createInitialRows(),
      currentRowIndex: 0,
      gameStatus: 'playing',
      attempts: 0,
      
      // 확장 상태
      stats: createInitialStats(),
      settings: createInitialSettings(),
      isLoading: false,
      error: null,
      
      // 한글 입력기 (각 셀마다 하나씩)
      hangulInputs: [new HangulInput(), new HangulInput()],

      /**
       * 게임 초기화
       */
      initializeGame: () => {
        set({ isLoading: true, error: null });
        
        try {
          const { settings } = get();
          let availableWords = WORD_LIST;
          
          // 난이도별 단어 필터링 (향후 확장 가능)
          if (settings.difficulty === 'easy') {
            availableWords = WORD_LIST.filter(word => word.length === 2);
          }
          
          const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
          
          set({
            targetWord: randomWord,
            currentWord: '',
            rows: createInitialRows(),
            currentRowIndex: 0,
            gameStatus: 'playing',
            attempts: 0,
            hangulInputs: [new HangulInput(), new HangulInput()],
            isLoading: false,
            error: null
          });
          
          if (settings.autoSave) {
            get().saveGameState();
          }
        } catch (error) {
          set({ 
            isLoading: false, 
            error: '게임 초기화 중 오류가 발생했습니다.' 
          });
        }
      },

      /**
       * 현재 입력 단어 업데이트
       */
      updateCurrentWord: (word: string) => {
        if (word.length <= 2 && get().gameStatus === 'playing') {
          set({ currentWord: word, error: null });
        }
      },

      /**
       * 자모 입력 처리 - 한글 입력기를 사용한 조합 처리
       */
      inputJamo: (jamo: string) => {
        const state = get();
        if (state.gameStatus !== 'playing' || state.currentRowIndex >= state.settings.maxAttempts) {
          return;
        }

        const newRows = [...state.rows];
        const currentRow = newRows[state.currentRowIndex];
        const newHangulInputs = [...state.hangulInputs];
        
        // 현재 행에서 활성 셀 찾기 (빈 셀이 있으면 그 셀, 없으면 마지막 셀)
        let cellIndex = -1;
        for (let i = 0; i < currentRow.cells.length; i++) {
          if (!currentRow.cells[i].char) {
            cellIndex = i;
            break;
          }
        }
        
        // 모든 셀이 차 있으면 마지막 셀에 계속 입력
        if (cellIndex === -1) {
          cellIndex = currentRow.cells.length - 1;
        }

        // 해당 셀의 한글 입력기로 자모 입력 처리
        const inputResult = newHangulInputs[cellIndex].inputJamo(jamo);
        
        // 현재 셀 업데이트
        currentRow.cells[cellIndex] = {
          char: inputResult.char,
          hint: null
        };
        
        // overflow가 있으면 다음 셀로 이동
        if (inputResult.overflow && cellIndex < currentRow.cells.length - 1) {
          const nextCellIndex = cellIndex + 1;
          newHangulInputs[nextCellIndex].reset();
          const nextResult = newHangulInputs[nextCellIndex].inputJamo(inputResult.overflow);
          currentRow.cells[nextCellIndex] = {
            char: nextResult.char,
            hint: null
          };
        }
        
        set({ 
          rows: newRows, 
          hangulInputs: newHangulInputs,
          error: null 
        });

        // 2글자가 모두 입력되었으면 currentWord 업데이트
        if (currentRow.cells.every(cell => cell.char)) {
          const word = currentRow.cells.map(cell => cell.char).join('');
          set({ currentWord: word });
        }
      },

      /**
       * 백스페이스 처리 - 한글 입력기를 사용한 분해 처리
       */
      backspace: () => {
        const state = get();
        if (state.gameStatus !== 'playing') {
          return;
        }

        const newRows = [...state.rows];
        const currentRow = newRows[state.currentRowIndex];
        const newHangulInputs = [...state.hangulInputs];
        
        // 현재 행에서 마지막으로 입력된 셀 찾기
        let cellIndex = -1;
        for (let i = currentRow.cells.length - 1; i >= 0; i--) {
          if (currentRow.cells[i].char) {
            cellIndex = i;
            break;
          }
        }

        // 입력된 셀이 있으면 한글 입력기로 백스페이스 처리
        if (cellIndex !== -1) {
          const backspaceResult = newHangulInputs[cellIndex].backspace();
          
          currentRow.cells[cellIndex] = {
            char: backspaceResult.char,
            hint: null
          };
          
          // 완전히 삭제되고 이전 셀이 있으면 이전 셀로 이동
          if (backspaceResult.completed && backspaceResult.char === '' && cellIndex > 0) {
            newHangulInputs[cellIndex].reset();
            // 이전 셀은 그대로 유지 (추가 백스페이스 처리 안함)
          }
          
          set({ 
            rows: newRows, 
            hangulInputs: newHangulInputs,
            currentWord: '', 
            error: null 
          });
        }
      },

      /**
       * 단어 제출 및 힌트 계산
       */
      submitWord: (word: string) => {
        const state = get();

        // 입력 검증
        if (!state.isValidInput(word)) {
          set({ error: '올바른 2글자 한글 단어를 입력해주세요.' });
          return false;
        }

        if (state.gameStatus !== 'playing') {
          set({ error: '게임이 종료되었습니다.' });
          return false;
        }

        if (state.currentRowIndex >= state.settings.maxAttempts) {
          set({ error: '더 이상 시도할 수 없습니다.' });
          return false;
        }

        try {
          set({ isLoading: true });
          
          const hints = calculateHint(word, state.targetWord);
          const newRows = [...state.rows];

          newRows[state.currentRowIndex] = {
            cells: [
              { char: word[0], hint: hints[0] },
              { char: word[1], hint: hints[1] }
            ],
            isSubmitted: true
          };

          const isWin = checkWinCondition(word, state.targetWord);
          const isLose = checkLoseCondition(state.attempts + 1, state.settings.maxAttempts);
          
          let newGameStatus: GameState['gameStatus'] = 'playing';
          if (isWin) newGameStatus = 'won';
          else if (isLose) newGameStatus = 'lost';

          set({
            rows: newRows,
            currentRowIndex: state.currentRowIndex + 1,
            gameStatus: newGameStatus,
            attempts: state.attempts + 1,
            currentWord: '',
            hangulInputs: [new HangulInput(), new HangulInput()],
            isLoading: false,
            error: null
          });

          // 게임 종료시 통계 업데이트
          if (newGameStatus !== 'playing') {
            get().updateStats();
          }

          if (state.settings.autoSave) {
            get().saveGameState();
          }

          return true;
        } catch (error) {
          set({ 
            isLoading: false, 
            error: '단어 제출 중 오류가 발생했습니다.' 
          });
          return false;
        }
      },

      /**
       * 게임 리셋 (새로운 단어로 시작)
       */
      resetGame: () => {
        localStorage.removeItem(STORAGE_KEYS.GAME_STATE);
        get().initializeGame();
      },

      /**
       * 게임 재시작 (같은 단어로 다시)
       */
      restartGame: () => {
        const { settings } = get();
        set({
          currentWord: '',
          rows: createInitialRows(),
          currentRowIndex: 0,
          gameStatus: 'playing',
          attempts: 0,
          hangulInputs: [new HangulInput(), new HangulInput()],
          error: null
        });
        
        if (settings.autoSave) {
          get().saveGameState();
        }
      },

      /**
       * 마지막 수 되돌리기
       */
      undoLastMove: () => {
        const state = get();
        if (state.currentRowIndex > 0 && state.gameStatus === 'playing') {
          const newRows = [...state.rows];
          const prevRowIndex = state.currentRowIndex - 1;
          
          newRows[prevRowIndex] = {
            cells: [
              { char: '', hint: null },
              { char: '', hint: null }
            ],
            isSubmitted: false
          };

          set({
            rows: newRows,
            currentRowIndex: prevRowIndex,
            attempts: Math.max(0, state.attempts - 1),
            currentWord: '',
            hangulInputs: [new HangulInput(), new HangulInput()],
            error: null
          });

          if (state.settings.autoSave) {
            get().saveGameState();
          }
        }
      },

      /**
       * 게임 상태 저장
       */
      saveGameState: async () => {
        try {
          const state = get();
          const gameData = {
            targetWord: state.targetWord,
            rows: state.rows,
            currentRowIndex: state.currentRowIndex,
            gameStatus: state.gameStatus,
            attempts: state.attempts,
            timestamp: Date.now()
          };

          const encrypted = await encryptData(gameData);
          localStorage.setItem(STORAGE_KEYS.GAME_STATE, encrypted);
        } catch (error) {
          console.error('게임 상태 저장 실패:', error);
        }
      },

      /**
       * 게임 상태 로드
       */
      loadGameState: async () => {
        try {
          const encrypted = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
          if (encrypted) {
            const gameData = await decryptData(encrypted);
            if (gameData && (gameData as any).targetWord) {
              set({
                targetWord: (gameData as any).targetWord,
                rows: (gameData as any).rows || createInitialRows(),
                currentRowIndex: (gameData as any).currentRowIndex || 0,
                gameStatus: (gameData as any).gameStatus || 'playing',
                attempts: (gameData as any).attempts || 0,
                error: null
              });
              return true;
            }
          }
        } catch (error) {
          console.error('게임 상태 로드 실패:', error);
          set({ error: '저장된 게임을 불러올 수 없습니다.' });
        }
        return false;
      },

      /**
       * 게임 데이터 전체 삭제
       */
      clearGameData: () => {
        localStorage.removeItem(STORAGE_KEYS.GAME_STATE);
        localStorage.removeItem(STORAGE_KEYS.GAME_STATS);
        set({
          stats: createInitialStats(),
          error: null
        });
      },

      /**
       * 설정 업데이트
       */
      updateSettings: async (newSettings: Partial<GameSettings>) => {
        const { settings } = get();
        const updatedSettings = { ...settings, ...newSettings };
        
        set({ settings: updatedSettings });
        
        try {
          const encrypted = await encryptData(updatedSettings);
          localStorage.setItem(STORAGE_KEYS.GAME_SETTINGS, encrypted);
        } catch (error) {
          console.error('설정 저장 실패:', error);
        }
      },

      /**
       * 통계 업데이트
       */
      updateStats: async () => {
        const state = get();
        const { stats, gameStatus, attempts } = state;
        
        if (gameStatus === 'playing') return;

        const isWin = gameStatus === 'won';
        const newStats: GameStats = {
          totalGames: stats.totalGames + 1,
          gamesWon: stats.gamesWon + (isWin ? 1 : 0),
          gamesLost: stats.gamesLost + (isWin ? 0 : 1),
          bestScore: isWin ? Math.max(stats.bestScore, state.getCurrentScore()) : stats.bestScore,
          averageAttempts: 0, // 계산됨
          winRate: 0, // 계산됨
          currentStreak: isWin ? stats.currentStreak + 1 : 0,
          bestStreak: 0 // 계산됨
        };

        // 평균 시도 횟수 계산
        newStats.averageAttempts = newStats.totalGames > 0 
          ? (stats.averageAttempts * stats.totalGames + attempts) / newStats.totalGames
          : attempts;

        // 승률 계산
        newStats.winRate = newStats.totalGames > 0 
          ? (newStats.gamesWon / newStats.totalGames) * 100
          : 0;

        // 최고 연승 기록 계산
        newStats.bestStreak = Math.max(stats.bestStreak, newStats.currentStreak);

        set({ stats: newStats });

        try {
          const encrypted = await encryptData(newStats);
          localStorage.setItem(STORAGE_KEYS.GAME_STATS, encrypted);
        } catch (error) {
          console.error('통계 저장 실패:', error);
        }
      },

      /**
       * 통계 리셋
       */
      resetStats: () => {
        const initialStats = createInitialStats();
        set({ stats: initialStats });
        localStorage.removeItem(STORAGE_KEYS.GAME_STATS);
      },

      /**
       * 게임 진행 상태 가져오기
       */
      getGameProgress: () => {
        const state = get();
        const allHints = state.rows
          .filter(row => row.isSubmitted)
          .map(row => row.cells.map(cell => cell.hint!));
        
        return getGameProgress(
          state.currentWord,
          state.targetWord,
          state.attempts,
          allHints,
          state.settings.maxAttempts
        );
      },

      /**
       * 입력 유효성 검사
       */
      isValidInput: (word: string) => {
        return word.length === 2 && 
               isValidHangulWord(word) && 
               isValidWord(word);
      },

      /**
       * 현재 점수 계산
       */
      getCurrentScore: () => {
        const state = get();
        if (state.gameStatus !== 'won') return 0;
        
        const allHints = state.rows
          .filter(row => row.isSubmitted)
          .map(row => row.cells.map(cell => cell.hint!));
        
        return calculateScore(state.attempts, state.settings.maxAttempts, allHints);
      }
    })),
    {
      name: 'hangul-game-store',
      partialize: (state: GameStore) => ({
        settings: state.settings,
        stats: state.stats
      })
    }
  )
);

/**
 * 스토어 초기화 (앱 시작시 호출)
 */
export const initializeStore = async () => {
  const store = useGameStore.getState();
  
  try {
    // 설정 로드
    const settingsData = localStorage.getItem(STORAGE_KEYS.GAME_SETTINGS);
    if (settingsData) {
      const settings = await decryptData(settingsData);
      if (settings) {
        await store.updateSettings(settings as Partial<GameSettings>);
      }
    }

    // 통계 로드
    const statsData = localStorage.getItem(STORAGE_KEYS.GAME_STATS);
    if (statsData) {
      const stats = await decryptData(statsData);
      if (stats) {
        useGameStore.setState({ stats: stats as GameStats });
      }
    }

    // 게임 상태 로드 시도
    const hasGameState = await store.loadGameState();
    
    // 저장된 게임이 없으면 새 게임 시작
    if (!hasGameState) {
      store.initializeGame();
    }
  } catch (error) {
    console.error('스토어 초기화 실패:', error);
    store.initializeGame();
  }
};