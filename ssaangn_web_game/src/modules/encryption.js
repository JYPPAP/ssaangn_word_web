/**
 * 암호화 및 유틸리티 함수 모듈
 * 단어 암호화/복호화, 날짜/시간 관련 유틸리티를 담당합니다.
 */

/**
 * 숫자를 한글 코드로 변환
 */
export function numToHangulCode(num, key) {
    return String.fromCharCode(num + key);
}

/**
 * 한글 코드를 숫자로 변환
 */
export function hangulCodeToNum(code, key) {
    return code.charCodeAt(0) - key;
}

/**
 * 단어 암호화
 */
export function encryptWord(wordString) {
    return encryptWordInternal(wordString, 22, 168);
}

/**
 * 단어 복호화
 */
export function decryptWord(wordString) {
    return decryptWordInternal(wordString, 22, 168);
}

/**
 * 단어 암호화 내부 구현
 */
function encryptWordInternal(wordString, mul1, mul2) {
    let encrypted = "";
    
    for (let i = 0; i < wordString.length; i++) {
        let charCode = wordString.charCodeAt(i);
        let key = i * mul1 + mul2;
        encrypted += numToHangulCode(charCode, key);
    }
    
    return encrypted;
}

/**
 * 단어 복호화 내부 구현
 */
function decryptWordInternal(wordString, mul1, mul2) {
    let decrypted = "";
    
    for (let i = 0; i < wordString.length; i++) {
        let key = i * mul1 + mul2;
        let charCode = hangulCodeToNum(wordString[i], key);
        decrypted += String.fromCharCode(charCode);
    }
    
    return decrypted;
}

/**
 * 현재 서버 시간 가져오기
 */
export function currentServerTime() {
    return new Date();
}

/**
 * 현재 서버 분 가져오기
 */
export function currentServerMinute() {
    return currentServerTime().getMinutes();
}

/**
 * 현재 서버 시간 (랩핑되지 않음)
 */
export function currentServerHourNonWrapped() {
    return currentServerTime().getHours();
}

/**
 * 월말 여부 확인
 */
export function isLastDayOfTheMonth() {
    let currentDate = new Date();
    let lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    return currentDate.getDate() === lastDay;
}

/**
 * 새로고침 날짜 ISO 문자열 가져오기
 */
export function getRefreshDateLocalISOString() {
    let now = new Date();
    let localISOTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString();
    return localISOTime.substring(0, 10);
}

/**
 * 가장 최근 레이스 시간 가져오기
 */
export function mostRecentRaceHour() {
    let currentHour = currentServerHourNonWrapped();
    return Math.floor(currentHour / 7) * 7;
}

/**
 * 다음 레이스 분 가져오기
 */
export function getNextRaceMinute() {
    let currentMinute = currentServerMinute();
    return 60 - currentMinute;
}

/**
 * 다음 레이스 시간 가져오기
 */
export function getNextRaceHour() {
    let currentHour = currentServerHourNonWrapped();
    let nextRaceHour = Math.floor(currentHour / 7) * 7 + 7;
    
    if (nextRaceHour >= 24) {
        nextRaceHour = 0;
    }
    
    return nextRaceHour;
}

/**
 * URL에 특정 키가 있는지 확인
 */
export function hasSearchInfoKey(key) {
    if (!location.search || location.search.length <= 0) {
        return false;
    }

    let searchInfo = decodeURIComponent(location.search).substring(1);
    let splitInfo = searchInfo.split('&');
    
    for (let i = 0; i < splitInfo.length; i++) {
        if (splitInfo[i].startsWith(key)) {
            return true;
        }
    }
    
    return false;
}

/**
 * 특수 모드 여부 확인
 */
export function isSpecialMode() {
    // 까치 게임이나 레이스 모드 등 확인
    import('./magpie.js').then(magpie => {
        return magpie.g_isMagpieGame;
    });
    
    import('./race-mode.js').then(raceMode => {
        return raceMode.g_isRaceMode;
    });
    
    return false; // 기본값
}

/**
 * 한글날 여부 확인
 */
export function isHangulDay() {
    let currentDate = new Date();
    return currentDate.getMonth() + 1 === 10 && currentDate.getDate() === 9;
}

/**
 * 레이스 통계 표시 여부 확인
 */
export function shouldDisplayRaceStats() {
    import('./race-mode.js').then(raceMode => {
        return raceMode.canRace();
    });
    return false; // 기본값
}

/**
 * 레이스 가능 여부 확인
 */
export function canRace() {
    return !isSpecialMode();
}

/**
 * 보안을 위한 랜덤 지연
 */
export function securityDelay() {
    return new Promise(resolve => {
        setTimeout(resolve, Math.random() * 100 + 50);
    });
}

/**
 * 날짜 비교 유틸리티
 */
export function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

/**
 * 시간 차이 계산 (분 단위)
 */
export function getMinutesDifference(date1, date2) {
    return Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60);
}

/**
 * 시간 차이 계산 (시간 단위)
 */
export function getHoursDifference(date1, date2) {
    return Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60);
}

/**
 * 날짜 형식화 (YYYY-MM-DD)
 */
export function formatDate(date) {
    return date.toISOString().substring(0, 10);
}

/**
 * 시간 형식화 (HH:MM)
 */
export function formatTime(date) {
    return date.toTimeString().substring(0, 5);
}

/**
 * 현재 날짜의 요일 가져오기 (0=일요일)
 */
export function getCurrentDayOfWeek() {
    return new Date().getDay();
}

/**
 * 한국 시간대로 날짜 변환
 */
export function toKoreanTime(date) {
    return new Date(date.getTime() + (9 * 60 * 60 * 1000));
}

/**
 * UTC 시간을 로컬 시간으로 변환
 */
export function utcToLocal(utcDate) {
    return new Date(utcDate.getTime() - (utcDate.getTimezoneOffset() * 60000));
}

/**
 * 디버깅용 타임스탬프
 */
export function getDebugTimestamp() {
    return new Date().toISOString();
}

console.log('🔐 암호화 및 유틸리티 모듈 로드 완료');