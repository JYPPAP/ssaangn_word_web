/**
 * 통계 및 점수 시스템 모듈
 * 게임 통계, 점수 기록, 주간 상태, 메달 시스템을 담당합니다.
 */

import * as helper from './helper_tools.js';
import { 
    NUMBER_OF_GUESSES,
    WEEKLY_STATUS_ELEMENTS,
    WEEKDAY_NAMES,
    WEEKLY_STATUS_EMPTY,
    GLOBAL_STATS_REFRESH_COOLDOWN,
    GOLD_TO_SILVER,
    SILVER_TO_COPPER,
    EMOTE_MEDAL_GOLD,
    EMOTE_MEDAL_SILVER,
    EMOTE_MEDAL_COPPER
} from './constants.js';
// 전역 변수들
export let g_refreshUTCDate = new Date();

import {
    sd_weeklyStatus,
    sd_goldMedals,
    sd_silverMedals,
    sd_copperMedals,
    sd_globalStatsRequestTime,
    sd_globalStats,
    sd_previousRaceHour,
    sd_previousRaceScore,
    sd_successCount,
    sd_currentStreak,
    sd_bestStreak,
    sd_raceSuccessCount
} from './storage.js';

// 글로벌 통계 상태
export let g_globalStatsStatus = 0;
export let g_timeForGlobalStats = false;

/**
 * 날짜를 로컬 ISO 문자열로 변환
 */
export function getRefreshDateLocalISOString() {
    let localYear = g_refreshUTCDate.getFullYear();
    let localMonth = g_refreshUTCDate.getMonth() + 1;
    let localDate = g_refreshUTCDate.getDate();
    return localYear + "-" + (localMonth < 10 ? "0" : "") + localMonth + "-" + (localDate < 10 ? "0" : "") + localDate;
}

/**
 * 게임 종료 통계 기록
 */
export function endGameWriteStats(score, dayNumber, secretWord, refreshUTCDate) {
    if (location.href.startsWith("http://127.0.0.1")) {
        return;
    }

    let dateString = getRefreshDateLocalISOString();

    const xhr = new XMLHttpRequest();
    xhr.open("GET", `end_game.php?date=${encodeURIComponent(dateString)}&day_number=${dayNumber}&secret_word=${encodeURIComponent(secretWord)}&score=${score}`, true);
    xhr.send();
}

/**
 * 레이스 게임 종료 통계 기록
 */
export function endGameRaceWriteStats(score, raceHour, dayNumber) {
    sd_previousRaceHour[0] = raceHour;
    sd_previousRaceScore[0] = score;
    helper.setStoredDataValue(sd_previousRaceHour);
    helper.setStoredDataValue(sd_previousRaceScore);

    if (location.href.startsWith("http://127.0.0.1")) {
        return;
    }

    let dateString = getRefreshDateLocalISOString();

    const xhr = new XMLHttpRequest();
    xhr.open("GET", `end_game_race.php?date=${encodeURIComponent(dateString)}&day_number=${dayNumber}&hour_number=${raceHour}&score=${score}`, true);
    xhr.send();
}

/**
 * 글로벌 통계 가져오기
 */
export function getGlobalStats() {
    getGlobalStats_async().then(() => displayGlobalStats());
}

/**
 * 글로벌 레이스 통계 가져오기
 */
export function getGlobalRaceStats() {
    getGlobalRaceStats_async().then(() => displayGlobalStats());
}

/**
 * 글로벌 통계 토글
 */
export function toggleGlobalStats() {
    let globalStats = document.getElementById("global-stats");
    if (!globalStats) return;

    if (globalStats.style.display === "flex") {
        hideGlobalStats();
    } else {
        // 쿨다운 확인
        let currentTime = Date.now();
        let lastRequestTime = sd_globalStatsRequestTime[0];
        
        if (currentTime - lastRequestTime < GLOBAL_STATS_REFRESH_COOLDOWN * 1000) {
            // 쿨다운 중이면 저장된 데이터 표시
            displayGlobalStats();
        } else {
            getGlobalStats();
        }
    }
}

/**
 * 글로벌 통계 숨기기
 */
export function hideGlobalStats() {
    let globalStats = document.getElementById("global-stats");
    if (globalStats) {
        globalStats.style.display = "none";
    }
    g_globalStatsStatus = 0;
}

/**
 * 글로벌 통계 표시
 */
export function displayGlobalStats() {
    let globalStats = document.getElementById("global-stats");
    if (!globalStats) return;

    try {
        let statsData = JSON.parse(sd_globalStats[0] || '{}');
        
        let content = `
            <div class="stats-header">
                <h3>🌍 글로벌 통계</h3>
                <button onclick="hideGlobalStats()" class="close-btn">✕</button>
            </div>
            <div class="stats-content">
                ${generateStatsHTML(statsData)}
            </div>
        `;
        
        globalStats.innerHTML = content;
        globalStats.style.display = "flex";
        g_globalStatsStatus = 2;
        
    } catch (error) {
        console.error('글로벌 통계 표시 오류:', error);
        globalStats.innerHTML = `
            <div class="stats-header">
                <h3>통계를 불러올 수 없습니다</h3>
                <button onclick="hideGlobalStats()" class="close-btn">✕</button>
            </div>
        `;
        globalStats.style.display = "flex";
    }
}

/**
 * 통계 HTML 생성
 */
function generateStatsHTML(statsData) {
    if (!statsData || Object.keys(statsData).length === 0) {
        return '<p>통계 데이터가 없습니다.</p>';
    }

    return `
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-label">총 플레이어</div>
                <div class="stat-value">${statsData.totalPlayers || 0}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">오늘의 성공률</div>
                <div class="stat-value">${statsData.todaySuccessRate || 0}%</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">평균 시도 횟수</div>
                <div class="stat-value">${statsData.averageAttempts || 0}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label">가장 어려웠던 단어</div>
                <div class="stat-value">${statsData.hardestWord || '-'}</div>
            </div>
        </div>
    `;
}

/**
 * 비동기 글로벌 통계 가져오기
 */
export async function getGlobalStats_async() {
    g_globalStatsStatus = 1;
    
    try {
        let dateString = getRefreshDateLocalISOString();
        let dayNumber = helper.getLocalDayNumberStartingWithYMD(new Date(), 2023, 11, 24);
        
        const response = await fetch(`get_global_stats.php?date=${encodeURIComponent(dateString)}&day_number=${dayNumber}`);
        const data = await response.text();
        
        sd_globalStats[0] = data;
        sd_globalStatsRequestTime[0] = Date.now();
        helper.setStoredDataValue(sd_globalStats);
        helper.setStoredDataValue(sd_globalStatsRequestTime);
        
        g_globalStatsStatus = 2;
        
    } catch (error) {
        console.error('글로벌 통계 가져오기 실패:', error);
        g_globalStatsStatus = 0;
    }
}

/**
 * 비동기 글로벌 레이스 통계 가져오기
 */
export async function getGlobalRaceStats_async() {
    g_globalStatsStatus = 1;
    
    try {
        let dateString = getRefreshDateLocalISOString();
        let dayNumber = helper.getLocalDayNumberStartingWithYMD(new Date(), 2023, 11, 24);
        let raceHour = new Date().getHours();
        
        const response = await fetch(`get_global_race_stats.php?date=${encodeURIComponent(dateString)}&day_number=${dayNumber}&hour_number=${raceHour}`);
        const data = await response.text();
        
        sd_globalStats[0] = data;
        sd_globalStatsRequestTime[0] = Date.now();
        helper.setStoredDataValue(sd_globalStats);
        helper.setStoredDataValue(sd_globalStatsRequestTime);
        
        g_globalStatsStatus = 2;
        
    } catch (error) {
        console.error('글로벌 레이스 통계 가져오기 실패:', error);
        g_globalStatsStatus = 0;
    }
}

/**
 * 승리 통계 증가
 */
export function increaseWinStats() {
    sd_successCount[0]++;
    sd_currentStreak[0]++;
    
    if (sd_currentStreak[0] > sd_bestStreak[0]) {
        sd_bestStreak[0] = sd_currentStreak[0];
    }
    
    helper.setStoredDataValue(sd_successCount);
    helper.setStoredDataValue(sd_currentStreak);
    helper.setStoredDataValue(sd_bestStreak);
}

/**
 * 주간 상태 업데이트
 */
export function updateWeeklyStatus(dayNumber, guessesRemaining, secretWord, refreshUTCDate) {
    if (!canEarnMedals()) {
        return;
    }

    let currentDayOfWeek = getWeeklyStatusDayOfTheWeek(refreshUTCDate);
    let weeklyStatus = getWeeklyStatus();
    let index = currentDayOfWeek * WEEKLY_STATUS_ELEMENTS;
    
    weeklyStatus[index] = dayNumber;
    weeklyStatus[index + 1] = NUMBER_OF_GUESSES - (guessesRemaining - 1);
    weeklyStatus[index + 2] = secretWord;

    sd_weeklyStatus[0] = "";
    for (let i = 0; i < weeklyStatus.length; i++) {
        sd_weeklyStatus[0] += weeklyStatus[i];
        if (i < weeklyStatus.length - 1) {
            sd_weeklyStatus[0] += ",";
        }
    }

    helper.setStoredDataValue(sd_weeklyStatus);
}

/**
 * 주간 상태의 요일 가져오기
 */
export function getWeeklyStatusDayOfTheWeek(refreshUTCDate) {
    let currentDayOfWeek = refreshUTCDate.getDay() - 1;
    if (currentDayOfWeek < 0) {
        currentDayOfWeek = 6;
    }
    return currentDayOfWeek;
}

/**
 * 주간 상태 가져오기
 */
export function getWeeklyStatus() {
    let weeklyStatus = sd_weeklyStatus[0].split(",");
    if (sd_weeklyStatus[0] == "" || weeklyStatus.length != WEEKDAY_NAMES.length * WEEKLY_STATUS_ELEMENTS) {
        sd_weeklyStatus[0] = WEEKLY_STATUS_EMPTY;
        helper.setStoredDataValue(sd_weeklyStatus);
        weeklyStatus = sd_weeklyStatus[0].split(",");
    }
    return weeklyStatus;
}

/**
 * 주간 상태가 준비되면 표시
 */
export function displayWeeklyStatusIfReady() {
    if (!canEarnMedals()) {
        return;
    }

    let weeklyStatus = getWeeklyStatus();
    let weeklyText = "쌍근 일주일 실적  \n";

    let bestDay = -1;
    let bestDayScore = 5;
    let expectedFinalDay = 0;
    
    for (let i = 0; i < WEEKDAY_NAMES.length; i++) {
        let index = i * WEEKLY_STATUS_ELEMENTS;
        if (weeklyStatus[index] != 0) {
            weeklyText += WEEKDAY_NAMES[i] + " ";
            expectedFinalDay = Math.floor(weeklyStatus[index]) + (WEEKDAY_NAMES.length - 1 - i);
            let score = weeklyStatus[index + 1];
            
            if (score <= bestDayScore) {
                bestDay = i;
                bestDayScore = score;
            }
            
            weeklyText += score + "점  \n";
        }
    }

    // 주간 리뷰 표시 로직 (필요시 구현)
    console.log('주간 상태:', weeklyText);
}

/**
 * 점수에 따른 메달 증가
 */
export function increaseMedalForScore(score) {
    if (!canEarnMedals()) {
        return;
    }

    if (score <= GOLD_TO_SILVER) {
        sd_goldMedals[0]++;
        helper.setStoredDataValue(sd_goldMedals);
    } else if (score <= SILVER_TO_COPPER) {
        sd_silverMedals[0]++;
        helper.setStoredDataValue(sd_silverMedals);
    } else {
        sd_copperMedals[0]++;
        helper.setStoredDataValue(sd_copperMedals);
    }
}

/**
 * 메달 획득 가능 여부 확인
 */
export function canEarnMedals() {
    return !location.href.startsWith("http://127.0.0.1");
}

/**
 * 차단 다이얼로그 표시 여부 확인
 */
export function isBlockingDialogShowing() {
    let weeklyEnd = document.getElementById("weekly-review");
    if (weeklyEnd && weeklyEnd.style.display == "flex") {
        return true;
    }

    let globalStats = document.getElementById("global-stats");
    if (globalStats && globalStats.style.display == "flex") {
        return true;
    }

    return false;
}

/**
 * 현재 통계 상태 가져오기
 */
export function getCurrentStats() {
    return {
        successCount: sd_successCount[0],
        currentStreak: sd_currentStreak[0],
        bestStreak: sd_bestStreak[0],
        raceSuccessCount: sd_raceSuccessCount[0],
        goldMedals: sd_goldMedals[0],
        silverMedals: sd_silverMedals[0],
        copperMedals: sd_copperMedals[0]
    };
}

/**
 * 메달 통계 HTML 생성
 */
export function generateMedalStatsHTML() {
    return `
        <div class="medal-stats">
            <div class="medal-item">
                <span class="medal-icon">${EMOTE_MEDAL_GOLD}</span>
                <span class="medal-count">${sd_goldMedals[0]}</span>
            </div>
            <div class="medal-item">
                <span class="medal-icon">${EMOTE_MEDAL_SILVER}</span>
                <span class="medal-count">${sd_silverMedals[0]}</span>
            </div>
            <div class="medal-item">
                <span class="medal-icon">${EMOTE_MEDAL_COPPER}</span>
                <span class="medal-count">${sd_copperMedals[0]}</span>
            </div>
        </div>
    `;
}

// 전역 함수로 등록
window.hideGlobalStats = hideGlobalStats;
window.toggleGlobalStats = toggleGlobalStats;