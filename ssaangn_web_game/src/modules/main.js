/**
 * 메인 통합 모듈
 * 모든 모듈을 통합하고 게임을 초기화합니다.
 */

// 모든 모듈 import
import * as constants from './constants.js';
import * as storage from './storage.js';
import * as gameCore from './game-core.js';
import * as gameBoard from './game-board.js';
import * as keyboard from './keyboard.js';
import * as hints from './hints.js';
import * as statistics from './statistics.js';
import * as raceMode from './race-mode.js';
import * as magpie from './magpie.js';
import * as story from './story.js';
import * as uiHelpers from './ui-helpers.js';
import * as settings from './settings.js';
import * as debug from './debug.js';
import * as unlockables from './unlockables.js';

// 외부 의존성
import * as helper from './helper_tools.js';

// 전역 변수들
let g_gameInitialized = false;
let g_debugMode = false;

/**
 * 게임 초기화 및 시작
 */
export async function initializeGame() {
    try {
        console.log('🎮 게임 초기화 시작...');
        
        // 디버그 모드 초기화
        debug.initializeDebugMode();
        g_debugMode = debug.debugging;
        
        // 저장된 데이터 로드
        storage.getAllStoredData();
        console.log('💾 저장된 데이터 로드 완료');
        
        // 설정 초기화
        settings.initializeSettings();
        settings.setupSettingsShortcuts();
        console.log('⚙️ 설정 초기화 완료');
        
        // 날짜 및 게임 설정
        const serverUTCDate = helper.getServerTime();
        const dayNumber = helper.getLocalDayNumberStartingWithYMD(serverUTCDate, 2023, 11, 24);
        
        // 까치 게임 확인
        const magpieWord = magpie.getMagpieWord();
        if (magpieWord) {
            console.log('🐦 까치 게임 모드');
            magpie.tryMagpie();
        }
        
        // 게임 코어 초기화
        gameCore.initializeGame(dayNumber);
        console.log(`🗓️ 게임 날짜: ${dayNumber}, 비밀 단어 설정 완료`);
        
        // UI 초기화
        gameBoard.createBoardLayout();
        keyboard.setupKeyboardListeners();
        keyboard.prepareKeyboard();
        hints.resetHints();
        
        console.log('🎹 키보드 및 UI 초기화 완료');
        
        // 통계 시스템 초기화
        statistics.initializeStatistics();
        
        // 이전 게임 상태 복원
        restorePreviousGame();
        
        // 게임 이벤트 리스너 설정
        setupGameEventListeners();
        
        // 환영 메시지 표시
        showWelcomeMessage();
        
        // 디버그 모드에서 도움말 표시
        if (g_debugMode) {
            debug.showDebugHelp();
        }
        
        g_gameInitialized = true;
        console.log('✅ 게임 초기화 완료!');
        
    } catch (error) {
        console.error('❌ 게임 초기화 실패:', error);
        debug.logError(error, 'initializeGame');
        showErrorMessage('게임을 시작할 수 없습니다. 페이지를 새로고침해 주세요.');
    }
}

/**
 * 이전 게임 상태 복원
 */
function restorePreviousGame() {
    // 이전 추측들 복원
    if (storage.sd_previousGuesses[0] && storage.sd_previousHints[0]) {
        gameBoard.fillInPreviousGuesses(
            storage.sd_previousGuesses[0], 
            storage.sd_previousHints[0]
        );
        console.log('🔄 이전 게임 상태 복원 완료');
    }
    
    // 키보드 상태 복원
    keyboard.resetKeyboardState();
}

/**
 * 게임 이벤트 리스너 설정
 */
function setupGameEventListeners() {
    // 단어 제출 이벤트
    document.addEventListener('submitGuess', handleGuessSubmission);
    
    // 게임 리셋 이벤트
    document.addEventListener('resetGame', handleGameReset);
    
    // 설정 변경 이벤트
    document.addEventListener('settingsChanged', handleSettingsChange);
    
    console.log('🎯 게임 이벤트 리스너 설정 완료');
}

/**
 * 추측 제출 처리
 */
async function handleGuessSubmission(event) {
    const guess = event.detail.guess;
    
    if (!gameCore.guessStringIsValid()) {
        showErrorMessage('유효하지 않은 단어입니다.');
        gameBoard.showValidationFeedback(false);
        return;
    }
    
    console.log(`📝 단어 제출: ${guess}`);
    
    // 힌트 계산
    const hintsForGuess = calculateHintsForGuess(guess);
    
    // 보드 업데이트
    const currentRow = gameBoard.getCurrentLetterRow();
    updateBoardWithGuess(currentRow, guess, hintsForGuess);
    
    // 키보드 색상 업데이트
    updateKeyboardColors(guess, hintsForGuess);
    
    // 게임 상태 확인
    const isWin = checkWinCondition(guess, hintsForGuess);
    const isGameOver = gameCore.g_guessesRemaining <= 1 || isWin;
    
    if (isGameOver) {
        await endGame(isWin);
    } else {
        // 다음 턴 준비
        gameCore.g_guessesRemaining--;
        gameCore.g_currentGuess = [];
        gameCore.g_nextLetter = 0;
        gameBoard.updateCurrentGuessDisplay();
    }
    
    // 진행 상황 저장
    saveGameProgress();
}

/**
 * 추측에 대한 힌트 계산
 */
function calculateHintsForGuess(guess) {
    const hints = [];
    
    for (let i = 0; i < guess.length; i++) {
        const hintEmote = gameCore.yesNoMaybeListsFromComponents(guess[i], i, true);
        hints.push(hintEmote);
    }
    
    return hints;
}

/**
 * 보드에 추측과 힌트 업데이트
 */
function updateBoardWithGuess(rowIndex, guess, hintsArray) {
    for (let i = 0; i < guess.length; i++) {
        const box = document.getElementById(`letter-${rowIndex}-${i}`);
        if (box) {
            box.textContent = guess[i];
            
            // 힌트 표시
            const hintData = hints.getDataFromEmote(hintsArray[i]);
            if (hintData) {
                box.style.backgroundColor = hintData[constants.DATA_COLOR];
                box.innerHTML += `<span class="hint-emoji">${hintsArray[i]}</span>`;
            }
            
            box.classList.add('filled', 'submitted');
        }
    }
    
    // 행 애니메이션
    gameBoard.animateRow(rowIndex, 'flip');
}

/**
 * 키보드 색상 업데이트
 */
function updateKeyboardColors(guess, hintsArray) {
    for (let i = 0; i < guess.length; i++) {
        const letter = guess[i];
        const hintEmote = hintsArray[i];
        const hintData = hints.getDataFromEmote(hintEmote);
        
        if (hintData) {
            keyboard.shadeKeyBoard(letter, hintData[constants.DATA_COLOR]);
        }
    }
}

/**
 * 승리 조건 확인
 */
function checkWinCondition(guess, hintsArray) {
    return hintsArray.every(hint => hint === constants.EMOTE_MATCH);
}

/**
 * 게임 종료 처리
 */
async function endGame(isWin) {
    console.log(`🏁 게임 종료 - ${isWin ? '승리' : '패배'}`);
    
    // 통계 업데이트
    updateGameStatistics(isWin);
    
    // 결과 표시
    showGameResult(isWin);
    
    // 키보드 비활성화
    keyboard.disableKeyBoardUnmatched();
    
    // 게임 상태 저장
    saveGameProgress(true);
}

/**
 * 게임 통계 업데이트
 */
function updateGameStatistics(isWin) {
    // 통계 모듈을 통한 업데이트
    statistics.updateGameResult(isWin, gameCore.g_guessesRemaining);
    
    // 주간 상태 업데이트
    statistics.updateWeeklyStatus(isWin);
    
    // 스토리 잠금 해제 확인
    if (isWin && storage.sd_currentStreak[0] > 0) {
        story.checkStoryUnlock();
    }
}

/**
 * 게임 결과 표시
 */
function showGameResult(isWin) {
    const modal = document.createElement('div');
    modal.className = 'game-result-modal';
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-container">
            <div class="result-content">
                <h2>${isWin ? '🎉 축하합니다!' : '😔 아쉽네요!'}</h2>
                <p>${isWin 
                    ? `${constants.NUMBER_OF_GUESSES - gameCore.g_guessesRemaining + 1}번 만에 성공하셨네요!` 
                    : `정답은 "${gameCore.g_secretWordString}"였습니다.`
                }</p>
                <div class="result-stats">
                    <div>성공: ${storage.sd_successCount[0]}회</div>
                    <div>현재 연속: ${storage.sd_currentStreak[0]}회</div>
                    <div>최고 연속: ${storage.sd_bestStreak[0]}회</div>
                </div>
                <div class="result-actions">
                    <button onclick="shareResult()" class="btn-secondary">공유하기</button>
                    <button onclick="resetGame()" class="btn-primary">새 게임</button>
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
 * 게임 진행 상황 저장
 */
function saveGameProgress(isComplete = false) {
    // 현재 추측들과 힌트들을 문자열로 저장
    const guesses = [];
    const hints = [];
    
    // 보드에서 데이터 수집
    for (let i = 0; i < constants.NUMBER_OF_GUESSES; i++) {
        let rowGuess = "";
        let rowHints = "";
        
        for (let j = 0; j < constants.MAX_LETTERS; j++) {
            const box = document.getElementById(`letter-${i}-${j}`);
            if (box && box.classList.contains('submitted')) {
                rowGuess += box.textContent || "";
                const hintEmoji = box.querySelector('.hint-emoji');
                rowHints += hintEmoji ? hintEmoji.textContent : "";
            }
        }
        
        if (rowGuess) {
            guesses.push(rowGuess);
            hints.push(rowHints);
        }
    }
    
    // 저장
    storage.sd_previousGuesses[0] = guesses.join(',');
    storage.sd_previousHints[0] = hints.join(',');
    
    helper.setStoredDataValue(storage.sd_previousGuesses);
    helper.setStoredDataValue(storage.sd_previousHints);
    
    console.log('💾 게임 진행 상황 저장 완료');
}

/**
 * 게임 리셋 처리
 */
function handleGameReset() {
    console.log('🔄 게임 리셋');
    
    // 게임 상태 초기화
    gameCore.resetGameState();
    gameBoard.clearBoardDisplay();
    keyboard.resetKeyboardState();
    hints.resetHints();
    
    // UI 업데이트
    gameBoard.updateCurrentGuessDisplay();
    
    console.log('✅ 게임 리셋 완료');
}

/**
 * 설정 변경 처리
 */
function handleSettingsChange(event) {
    const settings = event.detail;
    console.log('⚙️ 설정 변경:', settings);
    
    // 설정 적용
    if (settings.theme !== undefined) {
        applyTheme(settings.theme);
    }
}

/**
 * 테마 적용
 */
function applyTheme(theme) {
    const body = document.body;
    body.classList.remove('theme-default', 'theme-dark', 'theme-light');
    
    switch (theme) {
        case constants.THEME_DARK:
            body.classList.add('theme-dark');
            break;
        case constants.THEME_LIGHT:
            body.classList.add('theme-light');
            break;
        default:
            body.classList.add('theme-default');
    }
    
    storage.sd_settingTheme[0] = theme;
    helper.setStoredDataValue(storage.sd_settingTheme);
}

/**
 * 환영 메시지 표시
 */
function showWelcomeMessage() {
    if (!storage.sd_completedFirstDay[0]) {
        console.log('👋 첫 방문자 환영 메시지');
        // 첫 방문자 튜토리얼 등
    }
}

/**
 * 오류 메시지 표시
 */
function showErrorMessage(message) {
    console.error('❌', message);
    
    // 간단한 토스트 메시지
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

/**
 * 공용 함수들을 전역으로 노출
 */
window.initializeGame = initializeGame;
window.resetGame = handleGameReset;
window.shareResult = () => uiHelpers.shareClipboard();

// 모듈별 주요 함수들도 전역으로 노출
window.showStorySelect = story.showStorySelect;
window.showSettings = settings.showSettings;
window.toggleRules = settings.toggleRules;
window.toggleDarkMode = settings.toggleDarkMode;
window.showGlobalStats = statistics.showGlobalStats;
window.startRaceMode = raceMode.startRaceMode;
window.tryMagpie = magpie.tryMagpie;
window.finalizeMagpie = magpie.finalizeMagpie;

// 페이지 로드 시 자동 초기화
document.addEventListener('DOMContentLoaded', initializeGame);

// 모듈 export
export {
    initializeGame,
    handleGameReset as resetGame,
    saveGameProgress,
    showErrorMessage,
    g_debugMode,
    // 각 모듈들도 재export
    constants,
    storage,
    gameCore,
    gameBoard,
    keyboard,
    hints,
    statistics,
    raceMode,
    magpie,
    story,
    uiHelpers,
    settings,
    debug,
    unlockables
};