/**
 * 까치(Magpie) 기능 모듈
 * 까치 퍼즐 생성, 공유, 플레이 기능을 담당합니다.
 * TODO: 추후 까치 기능 구현시 완성 예정
 */

import { 
    MAGPIE_INFO_KEY,
    MAX_LETTERS,
    NUMBER_OF_GUESSES
} from './constants';
import { 
    fullDictionaryIncludes 
} from './word';
import { 
    hangulSyllableToJamoComponentsText 
} from './hangul_tools';
import * as helper from './helper_tools';
import { 
    sd_previousCreatedMagpie,
    sd_storiesUnlocked,
    sd_bestStreak
} from './storage';

// 까치 게임 상태 변수들
export let g_isMagpieGame = false;
export let g_magpieWord = '';
export let g_magpieCreator = '';
export let g_magpieHints: string[] = [];
export let g_magpieGuesses: string[] = [];
export let g_magpieCurrentGuess = '';

// 타입 정의
interface MagpieData {
    word: string;
    creator: string;
    created: number;
    hints: string[];
    difficulty: 'easy' | 'medium' | 'hard';
}

interface MagpieResult {
    success: boolean;
    attempts: number;
    timeSpent: number;
    word: string;
}

/**
 * 까치 모드 초기화
 */
export function initializeMagpieMode(magpieData?: MagpieData): void {
    g_isMagpieGame = true;
    g_magpieGuesses = [];
    g_magpieCurrentGuess = '';
    
    if (magpieData) {
        g_magpieWord = magpieData.word;
        g_magpieCreator = magpieData.creator;
        g_magpieHints = magpieData.hints;
    } else {
        // 새로운 까치 퍼즐 생성 모드
        g_magpieWord = '';
        g_magpieCreator = '';
        g_magpieHints = [];
    }
    
    console.log('🐦 까치 모드 초기화 완료');
}

/**
 * 까치 퍼즐 생성
 */
export function createMagpiePuzzle(word: string, creator: string): MagpieData | null {
    // 단어 유효성 검사
    if (!isValidMagpieWord(word)) {
        console.warn('유효하지 않은 까치 단어:', word);
        return null;
    }
    
    const magpieData: MagpieData = {
        word: word,
        creator: creator,
        created: Date.now(),
        hints: generateMagpieHints(word),
        difficulty: calculateDifficulty(word)
    };
    
    // 생성된 까치 저장
    saveMagpieData(magpieData);
    
    console.log('🐦 까치 퍼즐 생성 완료:', word);
    return magpieData;
}

/**
 * 까치 단어 유효성 검사
 */
function isValidMagpieWord(word: string): boolean {
    if (!word || word.length !== MAX_LETTERS) {
        return false;
    }
    
    return fullDictionaryIncludes(word);
}

/**
 * 까치 힌트 생성
 */
function generateMagpieHints(word: string): string[] {
    const hints: string[] = [];
    
    // 자모 분해 힌트
    for (let i = 0; i < word.length; i++) {
        const jamos = hangulSyllableToJamoComponentsText(word[i]);
        hints.push(`${i + 1}번째 글자의 자모: ${jamos}`);
    }
    
    // TODO: 추가 힌트 로직 구현
    // - 의미 힌트
    // - 유사 단어 힌트
    // - 카테고리 힌트
    
    return hints;
}

/**
 * 난이도 계산
 */
function calculateDifficulty(word: string): 'easy' | 'medium' | 'hard' {
    // TODO: 단어의 복잡도를 기반으로 난이도 계산
    const jamoCount = word.split('').reduce((count, char) => {
        return count + hangulSyllableToJamoComponentsText(char).length;
    }, 0);
    
    if (jamoCount <= 6) return 'easy';
    if (jamoCount <= 8) return 'medium';
    return 'hard';
}

/**
 * 까치 데이터 저장
 */
function saveMagpieData(magpieData: MagpieData): void {
    const encodedData = encodeMagpieData(magpieData);
    sd_previousCreatedMagpie[0] = encodedData;
    helper.setStoredDataValue(sd_previousCreatedMagpie);
}

/**
 * 까치 데이터 인코딩
 */
function encodeMagpieData(magpieData: MagpieData): string {
    // TODO: 까치 데이터를 안전하게 인코딩
    return JSON.stringify(magpieData);
}

/**
 * 까치 데이터 디코딩
 */
export function decodeMagpieData(encodedData: string): MagpieData | null {
    try {
        return JSON.parse(encodedData);
    } catch (error) {
        console.error('까치 데이터 디코딩 실패:', error);
        return null;
    }
}

/**
 * 까치 공유 링크 생성
 */
export function generateMagpieShareLink(magpieData: MagpieData): string {
    const encodedData = encodeMagpieData(magpieData);
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?${MAGPIE_INFO_KEY}=${encodeURIComponent(encodedData)}`;
}

/**
 * URL에서 까치 데이터 추출
 */
export function extractMagpieFromURL(): MagpieData | null {
    const urlParams = new URLSearchParams(window.location.search);
    const magpieInfo = urlParams.get(MAGPIE_INFO_KEY);
    
    if (!magpieInfo) {
        return null;
    }
    
    return decodeMagpieData(decodeURIComponent(magpieInfo));
}

/**
 * 까치 추측 처리
 */
export function processMagpieGuess(guess: string): boolean {
    if (!g_isMagpieGame || !guess) {
        return false;
    }
    
    g_magpieGuesses.push(guess);
    
    if (guess === g_magpieWord) {
        completeMagpieGame(true);
        return true;
    }
    
    if (g_magpieGuesses.length >= NUMBER_OF_GUESSES) {
        completeMagpieGame(false);
        return false;
    }
    
    return false;
}

/**
 * 까치 게임 완료
 */
function completeMagpieGame(success: boolean): void {
    const result: MagpieResult = {
        success,
        attempts: g_magpieGuesses.length,
        timeSpent: 0, // TODO: 실제 시간 측정
        word: g_magpieWord
    };
    
    console.log('🐦 까치 게임 완료:', result);
    
    if (success) {
        unlockMagpieRewards();
    }
    
    // TODO: 결과 표시 UI
    displayMagpieResult(result);
}

/**
 * 까치 보상 해제
 */
function unlockMagpieRewards(): void {
    // TODO: 까치 완료시 스토리 챕터 해제 등
    if (sd_bestStreak[0] >= 3) {
        sd_storiesUnlocked[0] = Math.max(sd_storiesUnlocked[0], 1);
        helper.setStoredDataValue(sd_storiesUnlocked);
    }
}

/**
 * 까치 결과 표시
 */
function displayMagpieResult(result: MagpieResult): void {
    // TODO: 까치 결과 UI 표시
    console.log('까치 결과:', {
        success: result.success ? '성공' : '실패',
        attempts: `${result.attempts}/${NUMBER_OF_GUESSES}`,
        word: result.word
    });
}

/**
 * 힌트 가져오기
 */
export function getMagpieHint(index: number): string {
    if (index < 0 || index >= g_magpieHints.length) {
        return '';
    }
    return g_magpieHints[index];
}

/**
 * 사용 가능한 힌트 개수
 */
export function getAvailableHintsCount(): number {
    return g_magpieHints.length;
}

/**
 * 현재 까치 게임 상태
 */
export function getMagpieGameState(): {
    word: string;
    creator: string;
    guesses: string[];
    hintsUsed: number;
    remaining: number;
} {
    return {
        word: g_magpieWord,
        creator: g_magpieCreator,
        guesses: [...g_magpieGuesses],
        hintsUsed: 0, // TODO: 사용된 힌트 추적
        remaining: NUMBER_OF_GUESSES - g_magpieGuesses.length
    };
}

/**
 * 까치 모드 종료
 */
export function exitMagpieMode(): void {
    g_isMagpieGame = false;
    g_magpieWord = '';
    g_magpieCreator = '';
    g_magpieHints = [];
    g_magpieGuesses = [];
    g_magpieCurrentGuess = '';
    
    console.log('🐦 까치 모드 종료');
}

/**
 * 까치 모드 상태 확인
 */
export function isMagpieMode(): boolean {
    return g_isMagpieGame;
}

/**
 * 클립보드에 까치 링크 복사
 */
export async function copyMagpieToClipboard(magpieData: MagpieData): Promise<boolean> {
    try {
        const shareLink = generateMagpieShareLink(magpieData);
        await navigator.clipboard.writeText(shareLink);
        console.log('🐦 까치 링크 복사 완료');
        return true;
    } catch (error) {
        console.error('까치 링크 복사 실패:', error);
        return false;
    }
}