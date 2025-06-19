/**
 * 레이스 모드 모듈
 * 시간 제한 레이스 게임 기능을 담당합니다.
 */

import { 
    RACE_TIME_WINDOW,
    RACE_LAPS,
    NUMBER_OF_GUESSES,
    MAX_LETTERS,
    EMOTE_RACE_TIME
} from './constants.js';
import { 
    getSecretWordByDayIndex,
    numSecretWords
} from './word.js';
import * as helper from './helper_tools.js';
import { 
    sd_previousRaceHour,
    sd_previousRaceScore 
} from './storage.js';
import { decryptWordInternal } from './game-core.js';

// 레이스 게임 상태 변수들
export let g_isRaceGame = false;
export let g_raceWords = [];
export let g_raceLap = 0;
export let g_raceStartTime = 0;
export let g_raceLapTimes = [];
export let g_raceLapGuesses = [];
export let g_raceHour = 0;

/**
 * 레이스 게임 시도
 */
export function tryRace() {
    if (!canRace()) {
        showError("🐯 " + "33일이 아니에요");
        return;
    }

    let currentMinute = currentServerMinute();
    let nextRaceMinute = getNextRaceMinute();
    let timeAfterRaceStart = currentMinute - nextRaceMinute;
    
    if (timeAfterRaceStart < 0 || timeAfterRaceStart > RACE_TIME_WINDOW || g_isRaceGame || sd_previousRaceHour[0] == mostRecentRaceHour()) {
        if (currentMinute > nextRaceMinute) {
            nextRaceMinute += 60;
        }

        let timeToWait = nextRaceMinute - currentMinute;
        showError("🐯 " + timeToWait + "분 기다려 보세요");
        return;
    }

    g_raceHour = currentServerHourNonWrapped();
    g_isRaceGame = true;

    // 레이스 단어들 생성
    generateRaceWords();
    
    g_raceLap = 0;
    beginRaceLap();
    g_raceStartTime = new Date();

    console.log('🏁 레이스 게임 시작!');
}

/**
 * 레이스 단어들 생성
 */
function generateRaceWords() {
    g_raceWords = [];
    let numSecrets = numSecretWords();
    
    for (let i = 0; i < RACE_LAPS; i++) {
        let mulNumber = (g_raceHour * 3 + 113 * i) % numSecrets;
        if (mulNumber == 0) {
            mulNumber = numSecrets;
        }

        let firstMulNumber = mulNumber;
        let validWord = "";
        
        while (validWord == "") {
            let mul = Math.floor(helper.mulberry32(mulNumber - 1) * 30000);
            let mul2 = Math.floor(helper.mulberry32(mulNumber) * 30000);
            validWord = decryptWordInternal(getSecretWordByDayIndex(mulNumber), mul, mul2);
            
            mulNumber = (mulNumber + 1) % numSecrets;
            if (mulNumber == 0) {
                mulNumber = numSecrets;
            }

            if (hasOverlapWithRaceWordsList(validWord)) {
                if (mulNumber == firstMulNumber) {
                    // 유효한 단어를 찾을 수 없으면 그냥 시작
                    g_raceLap = 0;
                    beginRaceLap();
                    g_raceStartTime = new Date();
                    return;
                }
                validWord = "";
            }
        }

        g_raceWords.push(validWord);
    }
}

/**
 * 다음 레이스 랩
 */
export function nextRaceLap() {
    g_raceLapTimes.push(new Date());
    g_raceLapGuesses.push(NUMBER_OF_GUESSES - g_guessesRemaining + 1 - g_raceLap);

    g_raceLap++;
    g_guessesRemaining = 0; // 입력 방지

    setTimeout(() => {
        beginRaceLap();
    }, 1650);

    return g_raceLap < g_raceWords.length;
}

/**
 * 레이스 랩 시작
 */
export function beginRaceLap() {
    if (g_raceLap < g_raceWords.length) {
        // 게임 코어에서 비밀 단어 설정
        import('./game-core.js').then(gameCore => {
            gameCore.g_secretWordString = g_raceWords[g_raceLap];
        });
    }

    // 보드 초기화
    import('./game-core.js').then(gameCore => {
        gameCore.clearBoard();
    });

    if (g_raceLap < g_raceWords.length) {
        prepareKeyboardForRace();
    }

    // 이전 랩들의 결과 표시
    displayPreviousLaps();

    if (g_raceLap >= g_raceWords.length) {
        g_guessesRemaining = 0;
        finishRace();
    }
}

/**
 * 이전 랩들 표시
 */
function displayPreviousLaps() {
    import('./game-board.js').then(gameBoard => {
        for (let lap = 0; lap < g_raceLap; lap++) {
            // 보드에 이전 랩 결과 표시
            let rowIndex = lap;
            
            for (let i = 0; i < MAX_LETTERS; i++) {
                let box = document.getElementById(`letter-${rowIndex}-${i}`);
                if (box) {
                    box.textContent = g_raceWords[lap][i];
                    box.style.color = '#ff6b35'; // 레이스 색상
                    box.classList.add("filled-box");
                    
                    // 시간 정보 표시
                    if (i == 0) {
                        box.innerHTML += `<span class="race-info">${g_raceLapGuesses[lap]}트</span>`;
                    } else {
                        let timeInSeconds = getRaceLapSeconds(lap, lap - 1);
                        let timeInMinutes = Math.floor(timeInSeconds / 60);
                        timeInSeconds %= 60;
                        let timeDisplay = (timeInMinutes > 0 ? timeInMinutes + "분\n" : "") + timeInSeconds + "초";
                        box.innerHTML += `<span class="race-time">${timeDisplay}</span>`;
                    }
                }
            }
        }
    });
}

/**
 * 레이스 랩 시간 계산
 */
export function getRaceLapSeconds(lap, previousLap) {
    let totalSeconds = 0;
    for (let i = lap; i > previousLap; i--) {
        let previousLapTime = (i - 1 < 0) ? g_raceStartTime.getTime() : g_raceLapTimes[i - 1].getTime();
        let lapTime = g_raceLapTimes[i].getTime() - previousLapTime;
        totalSeconds += Math.floor(lapTime / helper.TIME_IN_A_SECOND);
    }
    return totalSeconds;
}

/**
 * 레이스 단어 목록과 중복 확인
 */
export function hasOverlapWithRaceWordsList(word) {
    return g_raceWords.includes(word);
}

/**
 * 레이스 가능 여부 확인
 */
export function canRace() {
    // 특정 조건 확인 (예: 날짜가 33일인지)
    let currentDate = new Date().getDate();
    return currentDate % 33 === 0; // 예시 조건
}

/**
 * 레이스 통계 표시 여부
 */
export function shouldDisplayRaceStats() {
    return g_isRaceGame;
}

/**
 * 현재 서버 시간 (분)
 */
export function currentServerMinute() {
    let now = new Date();
    return now.getMinutes();
}

/**
 * 현재 서버 시간 (시간, 래핑 없음)
 */
export function currentServerHourNonWrapped() {
    let now = new Date();
    return now.getHours();
}

/**
 * 가장 최근 레이스 시간
 */
export function mostRecentRaceHour() {
    let currentHour = currentServerHourNonWrapped();
    let currentMinute = currentServerMinute();
    let nextRaceMinute = getNextRaceMinute();
    
    if (currentMinute >= nextRaceMinute) {
        return currentHour;
    } else {
        return currentHour - 1;
    }
}

/**
 * 다음 레이스 분
 */
export function getNextRaceMinute() {
    // 매시 30분에 레이스 시작
    return 30;
}

/**
 * 다음 레이스 시간
 */
export function getNextRaceHour() {
    let currentHour = currentServerHourNonWrapped();
    let currentMinute = currentServerMinute();
    let nextRaceMinute = getNextRaceMinute();
    let nextRaceHour = currentHour + (currentMinute < nextRaceMinute ? 0 : 1);
    return nextRaceHour >= 1 ? nextRaceHour : 12;
}

/**
 * 레이스용 키보드 준비
 */
function prepareKeyboardForRace() {
    import('./keyboard.js').then(keyboard => {
        keyboard.prepareKeyboard();
        
        // 레이스 모드 특별 키보드 설정
        let keyboardElement = document.getElementById('keyboard');
        if (keyboardElement) {
            keyboardElement.classList.add('race-mode');
        }
    });
}

/**
 * 레이스 완료
 */
function finishRace() {
    let totalTime = Date.now() - g_raceStartTime.getTime();
    let totalSeconds = Math.floor(totalTime / 1000);
    let score = calculateRaceScore();
    
    console.log(`🏁 레이스 완료! 총 시간: ${totalSeconds}초, 점수: ${score}`);
    
    // 레이스 통계 저장
    import('./statistics.js').then(statistics => {
        statistics.endGameRaceWriteStats(score, g_raceHour, helper.getLocalDayNumberStartingWithYMD(new Date(), 2023, 11, 24));
    });
    
    // 결과 표시
    showRaceResult(totalSeconds, score);
}

/**
 * 레이스 점수 계산
 */
function calculateRaceScore() {
    let totalGuesses = g_raceLapGuesses.reduce((sum, guesses) => sum + guesses, 0);
    let totalTime = Date.now() - g_raceStartTime.getTime();
    let timeBonus = Math.max(0, 300 - Math.floor(totalTime / 1000)); // 5분 보너스
    
    return Math.max(1, (RACE_LAPS * 2) - totalGuesses + Math.floor(timeBonus / 10));
}

/**
 * 레이스 결과 표시
 */
function showRaceResult(totalSeconds, score) {
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    
    let modal = document.createElement('div');
    modal.className = 'race-result-modal';
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-container">
            <div class="race-result-content">
                <h2>🏁 레이스 완료!</h2>
                <div class="race-stats">
                    <div class="stat-item">
                        <span class="stat-label">총 시간</span>
                        <span class="stat-value">${minutes}분 ${seconds}초</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">완주한 랩</span>
                        <span class="stat-value">${g_raceLap}/${RACE_LAPS}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">점수</span>
                        <span class="stat-value">${score}점</span>
                    </div>
                </div>
                <div class="lap-details">
                    ${generateLapDetailsHTML()}
                </div>
                <div class="race-actions">
                    <button onclick="closeRaceResult()" class="btn-primary">확인</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('show');
    }, 100);
}

/**
 * 랩 세부 정보 HTML 생성
 */
function generateLapDetailsHTML() {
    return g_raceWords.map((word, index) => {
        if (index < g_raceLapGuesses.length) {
            let timeInSeconds = index < g_raceLapTimes.length ? getRaceLapSeconds(index, index - 1) : 0;
            return `
                <div class="lap-item">
                    <span class="lap-word">${word}</span>
                    <span class="lap-guesses">${g_raceLapGuesses[index]}트</span>
                    <span class="lap-time">${timeInSeconds}초</span>
                </div>
            `;
        }
        return '';
    }).join('');
}

/**
 * 레이스 결과 모달 닫기
 */
function closeRaceResult() {
    let modal = document.querySelector('.race-result-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
}

/**
 * 레이스 상태 리셋
 */
export function resetRaceState() {
    g_isRaceGame = false;
    g_raceWords = [];
    g_raceLap = 0;
    g_raceStartTime = 0;
    g_raceLapTimes = [];
    g_raceLapGuesses = [];
    g_raceHour = 0;
}

/**
 * 현재 레이스 상태 가져오기
 */
export function getRaceState() {
    return {
        isRaceGame: g_isRaceGame,
        raceWords: g_raceWords,
        raceLap: g_raceLap,
        raceStartTime: g_raceStartTime,
        raceLapTimes: g_raceLapTimes,
        raceLapGuesses: g_raceLapGuesses,
        raceHour: g_raceHour
    };
}

// 에러 표시 함수 (임시)
function showError(message) {
    console.error('레이스 오류:', message);
    // 실제로는 UI에 오류 메시지 표시
}

// 전역 함수로 등록
window.closeRaceResult = closeRaceResult;