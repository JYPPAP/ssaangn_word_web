/**
 * JavaScript 모듈들의 TypeScript 타입 정의
 */

// 게임 상태 인터페이스
export interface GameState {
  secretWordString: string;
  currentGuess: string[];
  guessesRemaining: number;
  boardState: any[];
  isGameOver: boolean;
  isGameWon: boolean;
  yesList: string[][];
  noList: string[][];
  hotComboList: any[];
  hintList: any[];
  hintsUsed: boolean;
}

// 힌트 결과 인터페이스
export interface HintResult {
  emoji: string;
  color: string;
  description: string;
}

// 게임 코어 모듈
export interface GameCoreModule {
  initializeGame: (dayIndex: number) => void;
  initBoard: () => void;
  getGameState: () => GameState;
  insertLetter: (letter: string) => void;
  deleteLetter: () => void;
  checkGuess: (validate: boolean) => void;
  guessStringIsValid: () => boolean;
  constructGuessString: () => string;
  fullDictionaryIncludes: (word: string) => boolean;
  yesNoMaybeListsFromComponents: (char: string, position: number, validate: boolean) => string;
  resetGameState: () => void;
  setHintsUsed: (used: boolean) => void;
  g_secretWordString: string;
  g_currentGuess: string[];
  g_hintsUsed: boolean;
  g_yesList: string[][];
  g_noList: string[][];
  g_secretWordJamoSets: string[];
}

// 게임 보드 모듈
export interface GameBoardModule {
  [key: string]: any;
}

// 키보드 모듈
export interface KeyboardModule {
  g_keyboardState: { [key: string]: string };
  prepareKeyboard: () => void;
  shadeKeyBoard: (key: string, color: string) => void;
  insertLetter: (letter: string) => boolean;
  deleteLetter: () => boolean;
}

// 힌트 데이터 배열 타입
type HintDataArray = [
  string, // EMOTE
  string, // NAME
  string, // SHORT
  string, // COLOR
  string, // LIMAGE
  string, // IMAGE
  string, // REVEAL
  string  // DESCRIPTION
];

// 상수 모듈
export interface ConstantsModule {
  MAX_LETTERS: number;
  NUMBER_OF_GUESSES: number;
  EMOTE_MATCH: string;
  EMOTE_SIMILAR: string;
  EMOTE_MANY: string;
  EMOTE_EXISTS: string;
  EMOTE_OPPOSITE: string;
  EMOTE_NONE: string;
  DATA_MATCH: HintDataArray;
  DATA_SIMILAR: HintDataArray;
  DATA_MANY: HintDataArray;
  DATA_EXISTS: HintDataArray;
  DATA_OPPOSITE: HintDataArray;
  DATA_NONE: HintDataArray;
  DATA_COLOR: 3; // 배열 인덱스로 타입 지정
  DATA_EMOTE: 0;
  DATA_NAME: 1;
  DATA_SHORT: 2;
  DATA_LIMAGE: 4;
  DATA_IMAGE: 5;
  DATA_REVEAL: 6;
  DATA_DESCRIPTION: 7;
}

// 저장소 모듈
export interface StorageModule {
  sd_previousGuesses: string[];
  sd_previousHints: string[];
  sd_successCount: number[];
  sd_currentStreak: number[];
  sd_bestStreak: number[];
  getAllStoredData: () => void;
}

// 통계 모듈
export interface StatisticsModule {
  increaseWinStats: () => void;
  endGameWriteStats: (attempts: number, timestamp: number, extra: string, date: Date) => void;
}

// 한글 도구 모듈
export interface HangulToolsModule {
  isHangulSyllable: (char: string) => boolean;
  isHangulConsonant: (char: string) => boolean;
  isHangulVowel: (char: string) => boolean;
  appendHangul: (current: string, input: string) => string;
  deleteOneJamo: (current: string) => string;
  hangulSyllableToJamoComponentsText: (syllable: string) => string;
}

// 헬퍼 도구 모듈
export interface HelperToolsModule {
  setStoredDataValue: (data: any) => void;
  [key: string]: any;
}

// 모듈 로더 함수 타입
export type ModuleLoader<T> = () => Promise<T>;

// 동적 임포트 결과 타입
export interface ModuleImports {
  gameCore: GameCoreModule;
  gameBoard: GameBoardModule;
  keyboard: KeyboardModule;
  constants: ConstantsModule;
  storage: StorageModule;
  statistics: StatisticsModule;
  hangulTools: HangulToolsModule;
  helperTools: HelperToolsModule;
}

// 통계 정보 인터페이스
export interface GameStatistics {
  totalGames: number;
  totalWins: number;
  currentStreak: number;
  bestStreak: number;
}

// 게임 진행 상황 인터페이스
export interface GameProgress {
  guesses: string[];
  hints: string[];
}

// 힌트 요청 결과 인터페이스
export interface HintRequestResult {
  success: boolean;
  hint: string | null;
  message: string;
  jamo?: string;
}

// 단어 제출 결과 인터페이스
export interface GuessSubmissionResult {
  success: boolean;
  hints: HintResult[];
  isGameOver: boolean;
  isWin: boolean;
}