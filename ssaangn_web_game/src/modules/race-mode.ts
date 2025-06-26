/**
 * 레이스 모드 모듈
 * 시간 제한 레이스 게임 기능을 담당합니다.
 * TODO: 추후 레이스 모드 기능 구현시 완성 예정
 */

import { 
    RACE_TIME_WINDOW,
    RACE_LAPS,
    NUMBER_OF_GUESSES
} from './constants';
import { 
    getSecretWordByDayIndex,
    numSecretWords
} from './word';
import * as helper from './helper_tools';
import { 
    sd_previousRaceHour,
    sd_previousRaceScore 
} from './storage';

// 레이스 게임 상태 변수들
export let g_isRaceGame = false;
export let g_raceWords: string[] = [];
export let g_raceLap = 0;
export let g_raceStartTime = 0;
export let g_raceLapTimes: number[] = [];
export let g_raceLapGuesses: number[] = [];

// 타입 정의
// interface RaceResult {
//     lap: number;
//     time: number;
//     guesses: number;
//     word: string;
// }

interface RaceStats {
    totalTime: number;
    totalGuesses: number;
    averageTime: number;
    bestLap: number;
}

/**
 * 레이스 모드 초기화
 */
export function initializeRaceMode(): void {
    g_isRaceGame = true;
    g_raceWords = [];
    g_raceLap = 0;
    g_raceStartTime = 0;
    g_raceLapTimes = [];
    g_raceLapGuesses = [];
    
    // TODO: 레이스용 단어 목록 생성
    generateRaceWords();
    
    console.log('🏁 레이스 모드 초기화 완료');
}

/**
 * 레이스용 단어 생성
 */
function generateRaceWords(): void {
    // TODO: 랜덤한 단어들을 선택하여 레이스 단어 목록 생성
    for (let i = 0; i < RACE_LAPS; i++) {
        const randomIndex = Math.floor(Math.random() * numSecretWords());
        const word = getSecretWordByDayIndex(randomIndex);
        g_raceWords.push(word);
    }
}

/**
 * 레이스 시작
 */
export function startRace(): void {
    if (!g_isRaceGame) {
        console.warn('레이스 모드가 초기화되지 않았습니다');
        return;
    }
    
    g_raceStartTime = Date.now();
    g_raceLap = 0;
    console.log('🏁 레이스 시작!');
}

/**
 * 랩 완료 처리
 */
export function completeLap(guesses: number): void {
    if (!g_isRaceGame) return;
    
    const lapTime = Date.now() - g_raceStartTime;
    g_raceLapTimes.push(lapTime);
    g_raceLapGuesses.push(guesses);
    g_raceLap++;
    
    if (g_raceLap < RACE_LAPS) {
        // 다음 랩 준비
        g_raceStartTime = Date.now();
        console.log(`🏁 랩 ${g_raceLap}/${RACE_LAPS} 완료`);
    } else {
        // 레이스 완료
        finishRace();
    }
}

/**
 * 레이스 완료 처리
 */
function finishRace(): void {
    const totalTime = g_raceLapTimes.reduce((sum, time) => sum + time, 0);
    const totalGuesses = g_raceLapGuesses.reduce((sum, guesses) => sum + guesses, 0);
    
    const raceStats: RaceStats = {
        totalTime,
        totalGuesses,
        averageTime: totalTime / RACE_LAPS,
        bestLap: Math.min(...g_raceLapTimes)
    };
    
    console.log('🏁 레이스 완료!', raceStats);
    
    // TODO: 레이스 결과 저장 및 표시
    saveRaceResult(raceStats);
    displayRaceResult(raceStats);
}

/**
 * 레이스 결과 저장
 */
function saveRaceResult(stats: RaceStats): void {
    const score = calculateRaceScore(stats);
    const currentHour = new Date().getHours();
    
    sd_previousRaceHour[0] = currentHour;
    sd_previousRaceScore[0] = score;
    
    helper.setStoredDataValue(sd_previousRaceHour);
    helper.setStoredDataValue(sd_previousRaceScore);
}

/**
 * 레이스 점수 계산
 */
function calculateRaceScore(stats: RaceStats): number {
    // TODO: 시간과 추측 횟수를 기반으로 점수 계산
    const timeBonus = Math.max(0, RACE_TIME_WINDOW * 1000 - stats.totalTime);
    const guessBonus = Math.max(0, (NUMBER_OF_GUESSES * RACE_LAPS - stats.totalGuesses) * 1000);
    
    return Math.floor((timeBonus + guessBonus) / 1000);
}

/**
 * 레이스 결과 표시
 */
function displayRaceResult(stats: RaceStats): void {
    // TODO: 레이스 결과 UI 표시
    console.log('레이스 결과:', {
        totalTime: `${(stats.totalTime / 1000).toFixed(2)}초`,
        totalGuesses: stats.totalGuesses,
        averageTime: `${(stats.averageTime / 1000).toFixed(2)}초`,
        bestLap: `${(stats.bestLap / 1000).toFixed(2)}초`
    });
}

/**
 * 현재 레이스 단어 가져오기
 */
export function getCurrentRaceWord(): string {
    if (!g_isRaceGame || g_raceLap >= g_raceWords.length) {
        return '';
    }
    return g_raceWords[g_raceLap];
}

/**
 * 레이스 진행률 가져오기
 */
export function getRaceProgress(): { current: number; total: number; percentage: number } {
    return {
        current: g_raceLap,
        total: RACE_LAPS,
        percentage: (g_raceLap / RACE_LAPS) * 100
    };
}

/**
 * 레이스 모드 종료
 */
export function exitRaceMode(): void {
    g_isRaceGame = false;
    g_raceWords = [];
    g_raceLap = 0;
    g_raceStartTime = 0;
    g_raceLapTimes = [];
    g_raceLapGuesses = [];
    
    console.log('🏁 레이스 모드 종료');
}

/**
 * 레이스 모드 상태 확인
 */
export function isRaceMode(): boolean {
    return g_isRaceGame;
}

/**
 * 남은 시간 계산
 */
export function getRemainingTime(): number {
    if (!g_isRaceGame || g_raceStartTime === 0) {
        return RACE_TIME_WINDOW * 1000;
    }
    
    const elapsed = Date.now() - g_raceStartTime;
    return Math.max(0, RACE_TIME_WINDOW * 1000 - elapsed);
}

/**
 * 레이스 타임아웃 처리
 */
export function handleRaceTimeout(): void {
    if (!g_isRaceGame) return;
    
    console.log('⏰ 레이스 타임아웃');
    // TODO: 타임아웃시 처리 로직
    exitRaceMode();
}