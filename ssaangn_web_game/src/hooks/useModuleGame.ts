/**
 * JavaScript modules를 활용한 게임 훅
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  initializeModules, 
  GameCoreService, 
  KeyboardService, 
  StatisticsService, 
  HangulService, 
  StorageService,
  isModulesReady
} from '../services/GameModules';
import type { GameState, HintResult } from '../services/GameModules';

export interface ModuleGameState {
  // 게임 상태
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  
  // 게임 진행 상태
  gameStatus: 'idle' | 'playing' | 'won' | 'lost';
  currentWord: string;
  targetWord: string;
  attempts: number;
  maxAttempts: number;
  hintsUsed: boolean;
  
  // 게임 보드
  board: Array<{
    letters: string[];
    hints: HintResult[];
    submitted: boolean;
  }>;
  
  // 현재 입력
  currentGuess: string[];
  currentRow: number;
  
  // 통계
  statistics: {
    totalGames: number;
    totalWins: number;
    currentStreak: number;
    bestStreak: number;
  };
  
  // 액션
  actions: {
    startNewGame: () => Promise<void>;
    inputLetter: (letter: string) => void;
    deleteLetter: () => void;
    submitGuess: () => Promise<void>;
    resetGame: () => void;
    requestHint: () => { success: boolean; hint: string | null; message: string; jamo?: string };
  };
}

export const useModuleGame = (): ModuleGameState => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [currentWord, setCurrentWord] = useState('');
  const [targetWord, setTargetWord] = useState('');
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 7; // 기본 최대 시도 횟수
  const [hintsUsed, setHintsUsed] = useState(false);
  
  const [board, setBoard] = useState<Array<{
    letters: string[];
    hints: HintResult[];
    submitted: boolean;
  }>>([]);
  
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [currentRow, setCurrentRow] = useState(0);
  
  const [statistics, setStatistics] = useState({
    totalGames: 0,
    totalWins: 0,
    currentStreak: 0,
    bestStreak: 0
  });

  const gameStateRef = useRef<GameState | null>(null);

  // 모듈 초기화
  useEffect(() => {
    const initGame = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🔄 게임 모듈 초기화 중...');
        const success = await initializeModules();
        
        if (!success) {
          throw new Error('게임 모듈 초기화에 실패했습니다');
        }

        // 저장된 데이터 로드
        StorageService.loadAllData();
        
        // 통계 로드
        const stats = StatisticsService.getStatistics();
        setStatistics(stats);
        
        // 보드 초기화
        initializeBoard();
        
        // 자동으로 첫 게임 시작
        const firstGameWord = GameCoreService.startNewGame();
        setTargetWord(firstGameWord);
        setGameStatus('playing');
        
        setIsInitialized(true);
        console.log('✅ 게임 모듈 초기화 완료');
        
      } catch (err) {
        console.error('❌ 게임 초기화 실패:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
      } finally {
        setIsLoading(false);
      }
    };

    initGame();
  }, []);

  // 보드 초기화
  const initializeBoard = useCallback(() => {
    const newBoard = Array(maxAttempts).fill(null).map(() => ({
      letters: ['', ''],
      hints: [],
      submitted: false
    }));
    setBoard(newBoard);
    setCurrentRow(0);
    setCurrentGuess(['', '']);
    setAttempts(0);
  }, [maxAttempts]);

  // 새 게임 시작
  const startNewGame = useCallback(async () => {
    if (!isModulesReady()) {
      setError('게임 모듈이 준비되지 않았습니다');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // 랜덤 단어로 새 게임 시작 (하루 제한 제거)
      const newTargetWord = GameCoreService.startNewGame();
      setTargetWord(newTargetWord);
      
      // 게임 상태 초기화
      initializeBoard();
      setGameStatus('playing');
      setCurrentWord('');
      setHintsUsed(false);
      
      // 키보드 리셋
      KeyboardService.resetKeyboard();
      
      console.log('🎮 새 게임 시작! 목표 단어:', newTargetWord);
      
    } catch (err) {
      console.error('❌ 새 게임 시작 실패:', err);
      setError('새 게임을 시작할 수 없습니다');
    } finally {
      setIsLoading(false);
    }
  }, [initializeBoard]);

  // 글자 입력
  const inputLetter = useCallback((letter: string) => {
    if (!isModulesReady() || gameStatus !== 'playing') return;

    try {
      // 한글 검증
      if (!HangulService.isHangulSyllable(letter) && 
          !HangulService.isHangulConsonant(letter) && 
          !HangulService.isHangulVowel(letter)) {
        return;
      }

      // 키보드 모듈을 통해 글자 입력 (한글 조합 처리)
      const success = KeyboardService.insertLetter(letter);
      
      if (success) {
        // 게임 상태 업데이트
        const gameState = GameCoreService.getGameState();
        gameStateRef.current = gameState;
        
        setCurrentGuess([...gameState.currentGuess]);
        setCurrentWord(gameState.currentGuess.join(''));
        
        // 보드 업데이트 (현재 행)
        setBoard(prev => {
          const newBoard = [...prev];
          newBoard[currentRow] = {
            ...newBoard[currentRow],
            letters: [...gameState.currentGuess]
          };
          return newBoard;
        });
      }
      
    } catch (err) {
      console.error('❌ 글자 입력 실패:', err);
      setError('글자를 입력할 수 없습니다');
    }
  }, [gameStatus, currentRow]);

  // 글자 삭제
  const deleteLetter = useCallback(() => {
    if (!isModulesReady() || gameStatus !== 'playing') return;

    try {
      // 키보드 모듈을 통해 글자 삭제 (한글 조합 처리)
      const success = KeyboardService.deleteLetter();
      
      if (success) {
        // 게임 상태 업데이트
        const gameState = GameCoreService.getGameState();
        gameStateRef.current = gameState;
        
        setCurrentGuess([...gameState.currentGuess]);
        setCurrentWord(gameState.currentGuess.join(''));
        
        // 보드 업데이트 (현재 행)
        setBoard(prev => {
          const newBoard = [...prev];
          newBoard[currentRow] = {
            ...newBoard[currentRow],
            letters: [...gameState.currentGuess]
          };
          return newBoard;
        });
      }
      
    } catch (err) {
      console.error('❌ 글자 삭제 실패:', err);
      setError('글자를 삭제할 수 없습니다');
    }
  }, [gameStatus, currentRow]);

  // 단어 제출
  const submitGuess = useCallback(async () => {
    if (!isModulesReady() || gameStatus !== 'playing') return;

    try {
      setError(null);
      
      // 입력 완성 검증
      const currentGuessString = GameCoreService.getCurrentGuess();
      if (currentGuessString.length !== 2) {
        setError('2글자를 모두 입력해주세요');
        return;
      }

      // 단어 유효성 검증
      if (!GameCoreService.isValidWord(currentGuessString)) {
        setError('올바른 단어를 입력해주세요');
        return;
      }

      // 추측 제출
      const result = GameCoreService.submitGuess();
      
      if (!result.success) {
        setError('단어를 제출할 수 없습니다');
        return;
      }

      // 보드 업데이트 (힌트 추가)
      setBoard(prev => {
        const newBoard = [...prev];
        newBoard[currentRow] = {
          letters: [...currentGuess],
          hints: result.hints,
          submitted: true
        };
        return newBoard;
      });

      // 키보드 색상 업데이트
      for (let i = 0; i < currentGuess.length; i++) {
        const letter = currentGuess[i];
        const hint = result.hints[i];
        KeyboardService.setKeyColor(letter, hint.color);
      }

      // 시도 횟수 증가
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      // 게임 종료 확인
      if (result.isWin) {
        setGameStatus('won');
        StatisticsService.recordGameResult(true, newAttempts);
        
        // 통계 업데이트
        const newStats = StatisticsService.getStatistics();
        setStatistics(newStats);
        
        console.log('🎉 게임 승리!');
        
      } else if (result.isGameOver || newAttempts >= maxAttempts) {
        setGameStatus('lost');
        StatisticsService.recordGameResult(false, newAttempts);
        
        // 통계 업데이트
        const newStats = StatisticsService.getStatistics();
        setStatistics(newStats);
        
        console.log('😔 게임 패배');
        
      } else {
        // 다음 행으로 이동
        setCurrentRow(prev => prev + 1);
        setCurrentGuess(['', '']);
        setCurrentWord('');
      }

      // 게임 진행상황 저장
      const submittedGuesses = board.slice(0, currentRow + 1)
        .filter(row => row.submitted)
        .map(row => row.letters.join(''));
      const submittedHints = board.slice(0, currentRow + 1)
        .filter(row => row.submitted)
        .map(row => row.hints.map(h => h.emoji).join(''));
        
      StorageService.saveGameProgress(submittedGuesses, submittedHints);
      
    } catch (err) {
      console.error('❌ 단어 제출 실패:', err);
      setError('단어를 제출할 수 없습니다');
    }
  }, [gameStatus, currentGuess, currentRow, attempts, maxAttempts, board]);

  // 힌트 요청
  const requestHint = useCallback(() => {
    if (!isModulesReady()) {
      return {
        success: false,
        hint: null,
        message: '게임 모듈이 준비되지 않았습니다'
      };
    }

    try {
      const result = GameCoreService.requestHint();
      
      // 힌트 사용 상태 업데이트
      if (result.success) {
        const gameState = GameCoreService.getGameState();
        setHintsUsed(gameState.hintsUsed);
      }
      
      return result;
    } catch (err) {
      console.error('❌ 힌트 요청 실패:', err);
      return {
        success: false,
        hint: null,
        message: '힌트를 가져올 수 없습니다'
      };
    }
  }, []);

  // 게임 리셋
  const resetGame = useCallback(() => {
    if (!isModulesReady()) return;

    try {
      GameCoreService.resetGame();
      KeyboardService.resetKeyboard();
      
      initializeBoard();
      setGameStatus('idle');
      setCurrentWord('');
      setTargetWord('');
      setHintsUsed(false);
      setError(null);
      
      console.log('🔄 게임 리셋 완료');
      
    } catch (err) {
      console.error('❌ 게임 리셋 실패:', err);
      setError('게임을 리셋할 수 없습니다');
    }
  }, [initializeBoard]);

  return {
    // 상태
    isInitialized,
    isLoading,
    error,
    
    // 게임 진행 상태
    gameStatus,
    currentWord,
    targetWord,
    attempts,
    maxAttempts,
    hintsUsed,
    
    // 게임 보드
    board,
    currentGuess,
    currentRow,
    
    // 통계
    statistics,
    
    // 액션
    actions: {
      startNewGame,
      inputLetter,
      deleteLetter,
      submitGuess,
      resetGame,
      requestHint
    }
  };
};