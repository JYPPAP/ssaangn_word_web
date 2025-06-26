/**
 * JavaScript modules를 TypeScript에서 사용하기 위한 래퍼
 */

import type {
  GameCoreModule,
  GameBoardModule,
  KeyboardModule,
  ConstantsModule,
  StorageModule,
  StatisticsModule,
  HangulToolsModule,
  HelperToolsModule,
  // ModuleImports,
  GameState,
  HintResult,
  GameStatistics,
  GameProgress,
  HintRequestResult,
  GuessSubmissionResult
} from '../types/modules';

// word.js에서 ALL_WORDS_Length 동적 임포트
let ALL_WORDS_Length: number = 1950; // 기본값, 초기화 시 업데이트됨

// 정적 imports
import * as gameCoreModule from '../modules/game-core';
import * as gameBoardModule from '../modules/game-board';
import * as keyboardModule from '../modules/keyboard';
import * as constantsModule from '../modules/constants';
import * as storageModule from '../modules/storage';
import * as statisticsModule from '../modules/statistics';
import * as hangulToolsModule from '../modules/hangul_tools';
import * as helperToolsModule from '../modules/helper_tools';
import * as wordModule from '../modules/word';

// 모듈들을 타입 안전하게 저장
let gameCore: GameCoreModule | null = null;
let gameBoard: GameBoardModule | null = null;
let keyboard: KeyboardModule | null = null;
let constants: ConstantsModule | null = null;
let storage: StorageModule | null = null;
let statistics: StatisticsModule | null = null;
let hangulTools: HangulToolsModule | null = null;
let helperTools: HelperToolsModule | null = null;

// 모듈 초기화
export const initializeModules = async (): Promise<boolean> => {
  try {
    // 정적으로 로드된 모듈들을 할당
    gameCore = gameCoreModule as unknown as GameCoreModule;
    gameBoard = gameBoardModule as GameBoardModule;
    keyboard = keyboardModule as unknown as KeyboardModule;
    constants = constantsModule as unknown as ConstantsModule;
    storage = storageModule as StorageModule;
    statistics = statisticsModule as StatisticsModule;
    hangulTools = hangulToolsModule as HangulToolsModule;
    helperTools = helperToolsModule as HelperToolsModule;
    
    // word 모듈에서 ALL_WORDS_Length 가져오기
    ALL_WORDS_Length = wordModule.ALL_WORDS_Length;
    console.log(`📚 단어 사전 크기: ${ALL_WORDS_Length}개`);

    console.log('🎮 게임 모듈 초기화 완료');
    return true;
  } catch (error) {
    console.error('❌ 게임 모듈 초기화 실패:', error);
    return false;
  }
};

// 게임 코어 기능들
export const GameCoreService = {
  // 새 게임 시작 (하루 제한 없이)
  startNewGame: (): string => {
    if (!gameCore) throw new Error('게임 모듈이 초기화되지 않았습니다');
    
    // 랜덤한 단어 선택 (모든 단어 접근 가능)
    const randomIndex = Math.floor(Math.random() * ALL_WORDS_Length);
    gameCore.initializeGame(randomIndex);
    gameCore.initBoard();
    return gameCore.g_secretWordString;
  },

  // 현재 게임 상태 조회
  getGameState: (): GameState => {
    if (!gameCore) throw new Error('게임 모듈이 초기화되지 않았습니다');
    return gameCore.getGameState();
  },

  // 글자 입력
  insertLetter: (letter: string): void => {
    if (!gameCore) throw new Error('게임 모듈이 초기화되지 않았습니다');
    gameCore.insertLetter(letter);
  },

  // 글자 삭제
  deleteLetter: (): void => {
    if (!gameCore) throw new Error('게임 모듈이 초기화되지 않았습니다');
    gameCore.deleteLetter();
  },

  // 단어 제출 및 검증
  submitGuess: (): GuessSubmissionResult => {
    if (!gameCore) throw new Error('게임 모듈이 초기화되지 않았습니다');
    
    const currentGuess = gameCore.g_currentGuess;
    
    // 입력 검증
    if (!gameCore.guessStringIsValid()) {
      return {
        success: false,
        hints: [],
        isGameOver: false,
        isWin: false
      };
    }

    // 추측 처리
    gameCore.checkGuess(true);
    
    // 힌트 계산
    const hints: HintResult[] = [];
    for (let i = 0; i < currentGuess.length; i++) {
      const hintEmoji = gameCore.yesNoMaybeListsFromComponents(currentGuess[i], i, true);
      const hintData = getHintData(hintEmoji);
      hints.push({
        emoji: hintEmoji,
        color: hintData.color,
        description: hintData.description
      });
    }

    const gameState = gameCore.getGameState();
    
    return {
      success: true,
      hints,
      isGameOver: gameState.isGameOver,
      isWin: gameState.isGameWon
    };
  },

  // 게임 리셋
  resetGame: (): void => {
    if (!gameCore) throw new Error('게임 모듈이 초기화되지 않았습니다');
    gameCore.resetGameState();
    gameCore.initBoard();
  },

  // 현재 추측 문자열 가져오기
  getCurrentGuess: (): string => {
    if (!gameCore) throw new Error('게임 모듈이 초기화되지 않았습니다');
    return gameCore.constructGuessString();
  },

  // 단어 유효성 검사
  isValidWord: (word?: string): boolean => {
    if (!gameCore) throw new Error('게임 모듈이 초기화되지 않았습니다');
    
    // word 매개변수가 제공되면 사용, 그렇지 않으면 현재 추측 사용
    const wordToCheck = word || gameCore.constructGuessString();
    if (wordToCheck.length !== 2) return false;
    
    // 사전에 있는 단어인지 확인
    try {
      return gameCore.fullDictionaryIncludes(wordToCheck);
    } catch (err) {
      console.warn('단어 유효성 검사 실패:', err);
      return false;
    }
  },

  // 힌트 요청
  requestHint: (): HintRequestResult => {
    if (!gameCore || !hangulTools) throw new Error('게임 모듈이 초기화되지 않았습니다');
    
    try {
      // 이미 힌트를 사용했는지 확인
      if (gameCore.g_hintsUsed) {
        return {
          success: false,
          hint: null,
          message: '힌트는 게임당 한 번만 사용할 수 있습니다.'
        };
      }

      // Yes 리스트에서 아직 키보드에 표시되지 않은 자모 찾기
      const allYesJamos = [...(gameCore.g_yesList[0] || []), ...(gameCore.g_yesList[1] || [])];
      const allNoJamos = [...(gameCore.g_noList[0] || []), ...(gameCore.g_noList[1] || [])];
      
      // 정답에서 아직 발견되지 않은 자모 찾기
      const secretJamos: string[] = [];
      for (let i = 0; i < 2; i++) {
        if (gameCore.g_secretWordJamoSets[i]) {
          // g_secretWordJamoSets[i]는 문자열이므로 for...of로 순회
          const jamoString = gameCore.g_secretWordJamoSets[i];
          for (const jamo of jamoString) {
            if (!secretJamos.includes(jamo)) {
              secretJamos.push(jamo);
            }
          }
        }
      }
      
      // 힌트 줄 수 있는 자모 찾기 (정답에 있지만 아직 발견되지 않은 것)
      const hintableJamos = secretJamos.filter(jamo => 
        !allYesJamos.includes(jamo) && !allNoJamos.includes(jamo)
      );
      
      if (hintableJamos.length > 0) {
        // 랜덤하게 하나 선택
        const randomJamo = hintableJamos[Math.floor(Math.random() * hintableJamos.length)];
        
        // 힌트 사용 상태로 변경
        gameCore.setHintsUsed(true);
        
        return {
          success: true,
          hint: '🎃', // 호박 - 새로운 힌트
          message: `힌트: "${randomJamo}"가 정답에 포함되어 있습니다! 🎃`,
          jamo: randomJamo
        };
      } else {
        return {
          success: false,
          hint: null,
          message: '더 이상 줄 수 있는 힌트가 없습니다.'
        };
      }
    } catch (error) {
      console.error('힌트 요청 실패:', error);
      return {
        success: false,
        hint: null,
        message: '힌트를 가져오는 중 오류가 발생했습니다.'
      };
    }
  }
};

// 힌트 데이터 가져오기 (타입 안전성 개선)
const getHintData = (emoji: string): { color: string; description: string } => {
  if (!constants) return { color: '#666', description: '알 수 없음' };
  
  switch (emoji) {
    case constants.EMOTE_MATCH:
      return { color: 'rgb(255, 130, 45)', description: '정확해요!' };
    case constants.EMOTE_SIMILAR:
      return { color: 'rgb(248, 86, 155)', description: '비슷해요!' };
    case constants.EMOTE_MANY:
      return { color: 'rgb(229, 205, 179)', description: '많이 포함되어 있어요!' };
    case constants.EMOTE_EXISTS:
      return { color: 'rgb(140, 66, 179)', description: '포함되어 있어요!' };
    case constants.EMOTE_OPPOSITE:
      return { color: 'rgb(248, 214, 87)', description: '반대 위치에 있어요!' };
    default:
      return { color: '#666', description: '포함되어 있지 않아요' };
  }
};

// 키보드 서비스
export const KeyboardService = {
  // 키보드 상태 가져오기
  getKeyboardState: () => {
    if (!keyboard) throw new Error('키보드 모듈이 초기화되지 않았습니다');
    return keyboard.g_keyboardState;
  },

  // 키보드 리셋
  resetKeyboard: () => {
    if (!keyboard) throw new Error('키보드 모듈이 초기화되지 않았습니다');
    keyboard.prepareKeyboard();
  },

  // 키 색상 설정
  setKeyColor: (key: string, color: string) => {
    if (!keyboard) throw new Error('키보드 모듈이 초기화되지 않았습니다');
    keyboard.shadeKeyBoard(key, color);
  },

  // 글자 입력 (한글 조합 처리)
  insertLetter: (letter: string): boolean => {
    if (!keyboard) throw new Error('키보드 모듈이 초기화되지 않았습니다');
    return keyboard.insertLetter(letter);
  },

  // 글자 삭제 (한글 조합 처리)
  deleteLetter: (): boolean => {
    if (!keyboard) throw new Error('키보드 모듈이 초기화되지 않았습니다');
    return keyboard.deleteLetter();
  }
};

// 통계 서비스
export const StatisticsService = {
  // 게임 결과 기록
  recordGameResult: (isWin: boolean, attempts: number) => {
    if (!statistics) throw new Error('통계 모듈이 초기화되지 않았습니다');
    
    if (isWin) {
      statistics.increaseWinStats();
    }
    
    // 통계 업데이트
    statistics.endGameWriteStats(isWin ? attempts : 0, Date.now(), '', new Date());
  },

  // 통계 조회
  getStatistics: (): GameStatistics => {
    if (!storage) throw new Error('저장소 모듈이 초기화되지 않았습니다');
    
    return {
      totalGames: storage.sd_successCount[0] || 0,
      totalWins: storage.sd_successCount[0] || 0,
      currentStreak: storage.sd_currentStreak[0] || 0,
      bestStreak: storage.sd_bestStreak[0] || 0
    };
  }
};

// 한글 도구 서비스
export const HangulService = {
  // 한글 음절인지 확인
  isHangulSyllable: (char: string): boolean => {
    if (!hangulTools) throw new Error('한글 도구 모듈이 초기화되지 않았습니다');
    return hangulTools.isHangulSyllable(char);
  },

  // 한글 자음인지 확인
  isHangulConsonant: (char: string): boolean => {
    if (!hangulTools) throw new Error('한글 도구 모듈이 초기화되지 않았습니다');
    return hangulTools.isHangulConsonant(char);
  },

  // 한글 모음인지 확인
  isHangulVowel: (char: string): boolean => {
    if (!hangulTools) throw new Error('한글 도구 모듈이 초기화되지 않았습니다');
    return hangulTools.isHangulVowel(char);
  },

  // 한글 입력 처리
  appendHangul: (current: string, input: string): string => {
    if (!hangulTools) throw new Error('한글 도구 모듈이 초기화되지 않았습니다');
    return hangulTools.appendHangul(current, input);
  },

  // 한글 삭제 처리
  deleteOneJamo: (current: string): string => {
    if (!hangulTools) throw new Error('한글 도구 모듈이 초기화되지 않았습니다');
    return hangulTools.deleteOneJamo(current);
  }
};

// 저장소 서비스
export const StorageService = {
  // 모든 저장된 데이터 로드
  loadAllData: () => {
    if (!storage) throw new Error('저장소 모듈이 초기화되지 않았습니다');
    storage.getAllStoredData();
  },

  // 게임 진행상황 저장
  saveGameProgress: (guesses: string[], hints: string[]) => {
    if (!storage || !helperTools) throw new Error('저장소 모듈이 초기화되지 않았습니다');
    
    storage.sd_previousGuesses[0] = guesses.join(',');
    storage.sd_previousHints[0] = hints.join(',');
    
    helperTools.setStoredDataValue(storage.sd_previousGuesses);
    helperTools.setStoredDataValue(storage.sd_previousHints);
  },

  // 게임 진행상황 로드
  loadGameProgress: (): GameProgress => {
    if (!storage) throw new Error('저장소 모듈이 초기화되지 않았습니다');
    
    return {
      guesses: storage.sd_previousGuesses[0] ? storage.sd_previousGuesses[0].split(',') : [],
      hints: storage.sd_previousHints[0] ? storage.sd_previousHints[0].split(',') : []
    };
  }
};

// 상수 조회
export const getConstants = (): ConstantsModule => {
  if (!constants) throw new Error('상수 모듈이 초기화되지 않았습니다');
  return constants;
};

// 모듈 준비 상태 확인
export const isModulesReady = (): boolean => {
  return !!(gameCore && gameBoard && keyboard && constants && storage && statistics && hangulTools && helperTools);
};