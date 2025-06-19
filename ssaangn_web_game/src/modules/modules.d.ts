// JavaScript modules의 타입 선언

declare module './game-core.js' {
  export function initializeGame(wordIndex: number): void;
  export function initBoard(): void;
  export function getGameState(): any;
  export function insertLetter(letter: string): void;
  export function deleteLetter(): void;
  export function guessStringIsValid(): boolean;
  export function checkGuess(submitted: boolean): void;
  export function constructGuessString(): string;
  export function resetGameState(): void;
  export function yesNoMaybeListsFromComponents(char: string, index: number, submitted: boolean): string;
  export let g_secretWordString: string;
  export let g_currentGuess: string[];
}

declare module './game-board.js' {
  // 게임 보드 관련 함수들
}

declare module './keyboard.js' {
  export function getKeyboardState(): any;
  export function resetKeyboardState(): void;
  export function shadeKeyBoard(key: string, color: string): void;
}

declare module './constants.js' {
  export const EMOTE_MATCH: string;
  export const EMOTE_SIMILAR: string;
  export const EMOTE_MANY: string;
  export const EMOTE_EXISTS: string;
  export const EMOTE_OPPOSITE: string;
}

declare module './storage.js' {
  export function getAllStoredData(): void;
  export let sd_previousGuesses: string[];
  export let sd_previousHints: string[];
  export let sd_successCount: number[];
  export let sd_currentStreak: number[];
  export let sd_bestStreak: number[];
}

declare module './statistics.js' {
  export function increaseWinStats(): void;
  export function endGameWriteStats(attempts: number, timestamp: number, word: string, date: Date): void;
}

declare module './hangul_tools.js' {
  export function isHangulSyllable(char: string): boolean;
  export function isHangulConsonant(char: string): boolean;
  export function isHangulVowel(char: string): boolean;
  export function appendHangul(current: string, input: string): string;
  export function deleteOneJamo(current: string): string;
}

declare module './helper_tools.js' {
  export function setStoredDataValue(data: any): void;
}