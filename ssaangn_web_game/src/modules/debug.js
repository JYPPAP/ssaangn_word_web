/**
 * 디버깅 유틸리티 모듈
 * 개발 환경에서의 디버깅, 유닛 테스트, 로깅 기능을 담당합니다.
 */

import { 
    MAX_LETTERS,
    NUMBER_OF_GUESSES,
    DATA_NONE,
    DATA_MATCH,
    DATA_COLOR,
    ALL_WORDS
} from './constants.js';
import { 
    hangulSyllableToJamoComponentsText 
} from './hangul_tools.js';

// 디버깅 상태 변수들
export let debugging = false;
export let debugWord = "";
export let debugDoUnitTests = false;
export let debugUnitTests = 0;

// 복원 범위 설정
export let g_restoreRangeLow = 261;
export let g_restoreRangeHigh = 262;

/**
 * 디버깅 모드 초기화
 */
export function initializeDebugMode() {
    // 로컬 개발 환경에서만 디버깅 활성화
    if (location.href.startsWith("http://127.0.0.1")) {
        debugging = true;
        console.log('🔧 디버깅 모드 활성화됨');
        
        // 디버그 정보 표시 요소 생성
        createDebugInfoElement();
    } else {
        // 프로덕션에서는 디버깅 비활성화
        debugging = false;
        debugWord = "";
        debugDoUnitTests = false;
        debugUnitTests = 0;
    }
}

/**
 * 디버그 정보 출력
 */
export function debugInfo(info) {
    if (!debugging) {
        return;
    }

    console.log('🔧 Debug:', info);
    
    let debugInfoElement = document.getElementById("debug-info-text");
    if (debugInfoElement) {
        debugInfoElement.style.visibility = 'visible';
        debugInfoElement.textContent += "\n" + info;
    }
}

/**
 * 유닛 테스트 단계 실행
 */
export function doUnitTestStep() {
    if (debugUnitTests <= 0) {
        debugInfo("Unit Tests Complete");
        return;
    }

    let unitTestError = false;

    // 키보드 버튼들의 색상 검증
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        if (elem.style.backgroundColor === DATA_NONE[DATA_COLOR]) {
            // 없음 색상인데 실제로는 단어에 포함된 경우
            let inWord = false;
            import('./game-core.js').then(gameCore => {
                for (let i = 0; i < MAX_LETTERS; i++) {
                    if (gameCore.g_secretWordJamoSets[i].includes(elem.innerHTML)) {
                        inWord = true;
                    }
                }

                if (inWord) {
                    unitTestError = true;
                }
            });
        } else if (elem.style.backgroundColor === DATA_MATCH[DATA_COLOR]) {
            // 일치 색상인데 실제로는 단어에 없는 경우
            let inWord = false;
            import('./game-core.js').then(gameCore => {
                for (let i = 0; i < MAX_LETTERS; i++) {
                    if (gameCore.g_secretWordJamoSets[i].includes(elem.innerHTML)) {
                        inWord = true;
                    }
                }

                if (!inWord) {
                    unitTestError = true;
                }
            });
        }
    }

    if (unitTestError) {
        import('./game-core.js').then(gameCore => {
            debugInfo("Unit Test Error: " + gameCore.g_secretWordString);
        });
        return;
    }

    debugUnitTests--;

    // 자동 게임 플레이 시뮬레이션
    import('./game-core.js').then(gameCore => {
        if (gameCore.g_guessesRemaining > 0) {
            // 현재 추측 초기화
            while (gameCore.g_currentGuess.length > 0) {
                import('./keyboard.js').then(keyboard => {
                    keyboard.deleteLetter();
                });
            }

            // 랜덤하게 힌트를 주거나 단어를 추측
            let chance = Math.floor(Math.random() * 4);
            if (gameCore.g_guessesRemaining < NUMBER_OF_GUESSES && gameCore.g_hintsRemaining > 0 && chance == 0) {
                import('./hints.js').then(hints => {
                    hints.giveRandomShadeHint();
                });
            } else {
                // 랜덤 단어로 추측
                let randomWord = ALL_WORDS[Math.floor(Math.random() * ALL_WORDS.length)];
                for (let i = 0; i < 2; i++) {
                    let letters = hangulSyllableToJamoComponentsText(randomWord[i]);
                    for (let j = 0; j < letters.length; j++) {
                        import('./keyboard.js').then(keyboard => {
                            keyboard.insertLetter(letters[j]);
                        });
                    }
                }
                
                import('./game-core.js').then(gameCore => {
                    gameCore.checkGuess(true);
                });
            }
        } else {
            // 게임 종료 시 새 게임 시작
            let randomWord = ALL_WORDS[Math.floor(Math.random() * ALL_WORDS.length)];
            gameCore.g_secretWordString = randomWord;
            gameCore.clearBoard();
            
            import('./keyboard.js').then(keyboard => {
                keyboard.prepareKeyboard();
            });
            
            setTimeout(() => {
                doUnitTestStep();
            }, 3000);
        }
    });
}

/**
 * 디버그 단어 설정
 */
export function setDebugWord(word) {
    if (debugging) {
        debugWord = word;
        debugInfo("Debug word set: " + word);
    }
}

/**
 * 유닛 테스트 시작
 */
export function startUnitTests(testCount = 10) {
    if (debugging) {
        debugDoUnitTests = true;
        debugUnitTests = testCount;
        debugInfo("Starting " + testCount + " unit tests");
        doUnitTestStep();
    }
}

/**
 * 유닛 테스트 중지
 */
export function stopUnitTests() {
    debugDoUnitTests = false;
    debugUnitTests = 0;
    debugInfo("Unit tests stopped");
}

/**
 * 게임 상태 덤프
 */
export function dumpGameState() {
    if (!debugging) return;

    import('./game-core.js').then(gameCore => {
        debugInfo("=== Game State Dump ===");
        debugInfo("Secret Word: " + gameCore.g_secretWordString);
        debugInfo("Current Guess: " + gameCore.g_currentGuess.join(''));
        debugInfo("Guesses Remaining: " + gameCore.g_guessesRemaining);
        debugInfo("Hints Remaining: " + gameCore.g_hintsRemaining);
        debugInfo("Is Practice Game: " + gameCore.g_isPracticeGame);
        debugInfo("Is Magpie Game: " + gameCore.g_isMagpieGame);
        debugInfo("Day Number: " + gameCore.g_dayNumber);
    });
}

/**
 * 키보드 상태 덤프
 */
export function dumpKeyboardState() {
    if (!debugging) return;

    debugInfo("=== Keyboard State Dump ===");
    
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        let color = elem.style.backgroundColor || 'default';
        debugInfo(`Key: ${elem.innerHTML}, Color: ${color}`);
    }
}

/**
 * 로컬스토리지 상태 덤프
 */
export function dumpStorageState() {
    if (!debugging) return;

    debugInfo("=== Storage State Dump ===");
    
    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        let value = localStorage.getItem(key);
        debugInfo(`${key}: ${value}`);
    }
}

/**
 * 성능 측정 시작
 */
export function startPerformanceTimer(label) {
    if (debugging) {
        console.time('🔧 ' + label);
    }
}

/**
 * 성능 측정 종료
 */
export function endPerformanceTimer(label) {
    if (debugging) {
        console.timeEnd('🔧 ' + label);
    }
}

/**
 * 메모리 사용량 체크
 */
export function checkMemoryUsage() {
    if (debugging && performance.memory) {
        debugInfo("=== Memory Usage ===");
        debugInfo("Used: " + Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + " MB");
        debugInfo("Total: " + Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + " MB");
        debugInfo("Limit: " + Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + " MB");
    }
}

/**
 * 에러 로깅
 */
export function logError(error, context = '') {
    if (debugging) {
        debugInfo("ERROR" + (context ? " in " + context : "") + ": " + error.message);
        console.error('🔧 Debug Error:', error, context);
    }
}

/**
 * 경고 로깅
 */
export function logWarning(message, context = '') {
    if (debugging) {
        debugInfo("WARNING" + (context ? " in " + context : "") + ": " + message);
        console.warn('🔧 Debug Warning:', message, context);
    }
}

/**
 * 디버그 정보 표시 요소 생성
 */
function createDebugInfoElement() {
    let debugInfo = document.getElementById("debug-info-text");
    if (!debugInfo) {
        debugInfo = document.createElement("div");
        debugInfo.id = "debug-info-text";
        debugInfo.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            width: 300px;
            max-height: 200px;
            overflow-y: auto;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            border-radius: 5px;
            visibility: hidden;
        `;
        document.body.appendChild(debugInfo);
    }
}

/**
 * 디버그 정보 초기화
 */
export function clearDebugInfo() {
    let debugInfoElement = document.getElementById("debug-info-text");
    if (debugInfoElement) {
        debugInfoElement.textContent = "";
        debugInfoElement.style.visibility = 'hidden';
    }
}

/**
 * 디버깅 모드 토글
 */
export function toggleDebugMode() {
    debugging = !debugging;
    console.log('🔧 디버깅 모드 ' + (debugging ? '활성화' : '비활성화'));
    
    if (!debugging) {
        clearDebugInfo();
    }
}

/**
 * 현재 디버깅 상태 가져오기
 */
export function getDebugState() {
    return {
        debugging,
        debugWord,
        debugDoUnitTests,
        debugUnitTests,
        restoreRangeLow: g_restoreRangeLow,
        restoreRangeHigh: g_restoreRangeHigh
    };
}

/**
 * 개발자 콘솔에 도움말 표시
 */
export function showDebugHelp() {
    if (debugging) {
        console.log(`
🔧 디버깅 도움말:
- debugInfo(info): 디버그 정보 출력
- dumpGameState(): 게임 상태 덤프
- dumpKeyboardState(): 키보드 상태 덤프
- dumpStorageState(): 저장소 상태 덤프
- startUnitTests(count): 유닛 테스트 시작
- stopUnitTests(): 유닛 테스트 중지
- setDebugWord(word): 디버그 단어 설정
- checkMemoryUsage(): 메모리 사용량 체크
- toggleDebugMode(): 디버깅 모드 토글
        `);
    }
}

// 전역 디버그 함수 등록 (개발 환경에서만)
if (debugging) {
    window.debugInfo = debugInfo;
    window.dumpGameState = dumpGameState;
    window.dumpKeyboardState = dumpKeyboardState;
    window.dumpStorageState = dumpStorageState;
    window.startUnitTests = startUnitTests;
    window.stopUnitTests = stopUnitTests;
    window.setDebugWord = setDebugWord;
    window.checkMemoryUsage = checkMemoryUsage;
    window.toggleDebugMode = toggleDebugMode;
    window.showDebugHelp = showDebugHelp;
}

// 에러 핸들러 등록
window.addEventListener('error', (event) => {
    logError(event.error, 'Global Error Handler');
});

window.addEventListener('unhandledrejection', (event) => {
    logError(new Error(event.reason), 'Unhandled Promise Rejection');
});