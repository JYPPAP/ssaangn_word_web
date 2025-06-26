/**
 * 게임 핵심 로직 모듈
 * 단어 검증, 힌트 생성, 게임 상태 관리 등 핵심 기능을 담당합니다.
 */

import {
    getSecretWordByDayIndex,
    numSecretWords,
    fullDictionaryIncludes
} from './word';

import { 
    hangulSyllableToJamoComponentsText,
    isHangulSyllable,
    isHangulConsonant
} from './hangul_tools';
import * as helper from './helper_tools';
import { 
    MAX_LETTERS, 
    NUMBER_OF_GUESSES,
    EMOTE_MATCH,
    EMOTE_SIMILAR,
    EMOTE_MANY,
    EMOTE_EXISTS,
    EMOTE_OPPOSITE,
    EMOTE_NONE,
    DATA_MATCH,
    DATA_SIMILAR,
    DATA_MANY,
    DATA_EXISTS,
    DATA_OPPOSITE,
    DATA_NONE,
    DATA_COLOR
} from './constants';
import { 
    sd_previousSecret,
    sd_previousGuesses,
    sd_previousHints,
    sd_previousDayNumber,
    sd_previousCreatedMagpie,
    sd_globalStats,
    sd_globalStatsRequestTime,
    sd_currentStreak,
    sd_seenSubmit,
    sd_successCount,
    sd_bestStreak
} from './storage';

// 타입 정의
interface JamoSet {
    [index: number]: string;
    length: number;
}

type GuessArray = string[];
type BoardStateArray = any[];

// 게임 상태 변수들
export let g_secretWordString: string = "";
export let g_secretWordJamoSets: JamoSet[] | undefined = undefined;
export let g_dayNumber: number = 0;
export let g_guessesRemaining: number = NUMBER_OF_GUESSES;
export let g_currentGuess: GuessArray = [];
export let g_nextLetter: number = 0;
export let g_boardState: BoardStateArray = [];

// 추가 게임 상태 변수들
export let g_debugging: boolean = false;
export let g_isPracticeGame: boolean = false;
export let g_invalidWordCount: number = 0;
export let g_finalVictoryGuesses: number | undefined = undefined;
export let g_hintsUsed: boolean = false;

// 상수들
export const MAX_INVALID_WORDS = 3;
export const PRACTICE_WORD_BACKUP = "연습";
export const COLOR_MAYBE = "#888"; // 중간 색상

/**
 * 보드 상태 초기화
 */
export function clearBoardState() {
    g_boardState = [];
}

/**
 * 보드 상태 설정
 */
export function setBoardState(newState: BoardStateArray): void {
    g_boardState = newState;
}

/**
 * 다음 글자 위치 증가
 */
export function incrementNextLetter(): void {
    g_nextLetter++;
}

/**
 * 다음 글자 위치 감소
 */
export function decrementNextLetter(): void {
    g_nextLetter--;
}

/**
 * 다음 글자 위치 설정
 */
export function setNextLetter(value: number): void {
    g_nextLetter = value;
}

/**
 * 힌트 사용 상태 설정
 */
export function setHintsUsed(value: boolean): void {
    g_hintsUsed = value;
}

/**
 * 현재 추측 배열에 글자 설정
 */
export function setCurrentGuessLetter(index: number, letter: string): void {
    if (index >= 0 && index < MAX_LETTERS) {
        // 배열 크기 조정
        while (g_currentGuess.length <= index) {
            g_currentGuess.push("");
        }
        g_currentGuess[index] = letter;
    }
}

/**
 * 현재 추측 배열에 글자 추가
 */
export function pushCurrentGuessLetter(letter: string): void {
    if (g_currentGuess.length < MAX_LETTERS) {
        g_currentGuess.push(letter);
    }
}

/**
 * 현재 추측 배열에서 글자 제거
 */
export function spliceCurrentGuess(index: number, deleteCount: number): void {
    if (index >= 0 && index < g_currentGuess.length) {
        g_currentGuess.splice(index, deleteCount);
    }
}
export let g_yesList: string[][] = [[], []];
export let g_noList: string[][] = [[], []];
export let g_hotComboList: any[][] = [[], []];
export let g_hintList: string[] = [];
export let g_foundMatch: boolean[] = [false, false];

/**
 * 게임 초기화
 */
export function initializeGame(dayNumber: number): void {
    g_dayNumber = dayNumber;
    g_secretWordString = getSecretWordByDayIndex(dayNumber);
    
    // 암호화된 단어 복호화
    const numSecrets = numSecretWords();
    let mulNumber = dayNumber % numSecrets;
    if (mulNumber == 0) {
        mulNumber = numSecrets;
    }
    const mul = Math.floor(helper.mulberry32(mulNumber - 1) * 30000);
    const mul2 = Math.floor(helper.mulberry32(mulNumber) * 30000);
    g_secretWordString = decryptWord(g_secretWordString, mul, mul2);
    
    createSecretWordJamoSets();
    refreshIfSecretWordChanged();
}

/**
 * 비밀 단어의 자모 세트 생성
 */
export function createSecretWordJamoSets() {
    g_secretWordJamoSets = Array(MAX_LETTERS);
    for (let i = 0; i < MAX_LETTERS; i++) {
        g_secretWordJamoSets[i] = hangulSyllableToJamoComponentsText(g_secretWordString[i]);
    }
}

/**
 * 비밀 단어가 변경되었는지 확인하고 새로 고침
 */
export function refreshIfSecretWordChanged(): void {
    if (sd_previousSecret[0] == g_secretWordString) {
        // 비밀 단어가 변경되지 않음
        return;
    }

    if (sd_previousDayNumber[0] + 1 < g_dayNumber) {
        // 하루 이상 건너뛰면 연속 기록 잃음
        sd_currentStreak[0] = 0;
        helper.setStoredDataValue(sd_currentStreak);
    }

    // 새 게임 시작
    sd_previousSecret[0] = g_secretWordString;
    sd_previousGuesses[0] = "";
    sd_previousHints[0] = "";
    sd_previousDayNumber[0] = g_dayNumber;
    sd_previousCreatedMagpie[0] = "";
    sd_globalStats[0] = "";
    sd_globalStatsRequestTime[0] = 0;
    
    helper.setStoredDataValue(sd_previousSecret);
    helper.setStoredDataValue(sd_previousGuesses);
    helper.setStoredDataValue(sd_previousHints);
    helper.setStoredDataValue(sd_previousDayNumber);
    helper.setStoredDataValue(sd_previousCreatedMagpie);
    helper.setStoredDataValue(sd_globalStats);
    helper.setStoredDataValue(sd_globalStatsRequestTime);
}

/**
 * 현재 추측 문자열 구성
 */
export function constructGuessString() {
    let guessString = "";
    for (let i = 0; i < g_currentGuess.length; i++) {
        guessString += g_currentGuess[i];
    }
    return guessString;
}

/**
 * 추측 문자열이 유효한지 확인
 */
export function guessStringIsValid() {
    if (g_currentGuess.length != MAX_LETTERS) {
        return false;
    }

    for (let i = 0; i < g_currentGuess.length; i++) {
        if (!isHangulSyllable(g_currentGuess[i])) {
            return false;
        }
    }

    let guessString = constructGuessString();
    return fullDictionaryIncludes(guessString);
}

/**
 * 단어 암호화
 */
export function encryptWord(wordString: string): string {
    return wordString; // 간단한 구현, 실제로는 더 복잡한 암호화 로직
}

/**
 * 단어 복호화
 */
export function decryptWord(wordString: string, mul1: number, mul2: number): string {
    return decryptWordInternal(wordString, mul1, mul2);
}

/**
 * 내부 단어 복호화 구현
 */
export function decryptWordInternal(wordString: string, _mul1: number, _mul2: number): string {
    // 실제 복호화 로직 구현 필요
    // 여기서는 간단한 버전만 제공
    return wordString;
}

/**
 * 자모 성분 수 계산 (중복 방지 버전)
 * 추측 자모에서 정답 자모와 일치하는 개수를 정확히 계산합니다.
 * 정답에 있는 자모의 개수를 초과하여 계산하지 않습니다.
 */
export function countJamoComponentsInOtherJamoComponents(setA: string, setB: string): number {
    return countJamoMatches(setA, setB);
}

/**
 * 새로운 자모 매칭 함수 (중복 계산 방지)
 * @param guessJamo 추측한 자모 문자열
 * @param targetJamo 정답 자모 문자열
 * @returns 올바르게 계산된 일치 자모 개수
 */
function countJamoMatches(guessJamo: string, targetJamo: string): number {
    const targetCount = new Map<string, number>();
    const usedCount = new Map<string, number>();
    
    // 정답 자모의 개수 세기
    for (const jamo of targetJamo) {
        targetCount.set(jamo, (targetCount.get(jamo) || 0) + 1);
    }
    
    // 추측 자모에서 일치하는 개수 세기 (정답 개수 초과 불가)
    let matches = 0;
    for (const jamo of guessJamo) {
        const targetAvailable = targetCount.get(jamo) || 0;
        const alreadyUsed = usedCount.get(jamo) || 0;
        
        if (alreadyUsed < targetAvailable) {
            matches++;
            usedCount.set(jamo, alreadyUsed + 1);
        }
    }
    
    return matches;
}

/**
 * 글자가 모든 면에서 틀렸는지 확인
 */
export function isCharacterAllWrong(character: string): boolean {
    const jamoComponents = hangulSyllableToJamoComponentsText(character);
    
    if (!g_secretWordJamoSets) return true;
    
    for (let i = 0; i < MAX_LETTERS; i++) {
        if (countJamoComponentsInOtherJamoComponents(jamoComponents, g_secretWordJamoSets[i] as string) > 0) {
            return false;
        }
    }
    return true;
}

/**
 * 예/아니오/많음 리스트를 자모 성분으로부터 생성
 */
export function yesNoMaybeListsFromComponents(character: string, index: number, _checkUniques: boolean): string {
    const guessJamoComponents = hangulSyllableToJamoComponentsText(character);
    
    if (!g_secretWordJamoSets || !g_secretWordJamoSets[index]) {
        return EMOTE_NONE;
    }
    
    const secretJamoComponents = g_secretWordJamoSets[index] as string;
    const matchCount = countJamoComponentsInOtherJamoComponents(guessJamoComponents, secretJamoComponents);
    // const totalGuessComponents = guessJamoComponents.length;
    // const totalSecretComponents = secretJamoComponents.length;
    
    console.log(`🔍 힌트 계산: "${character}" (위치 ${index})`);
    console.log(`  - 정답: "${g_secretWordString}"`);
    console.log(`  - 추측 자모: [${guessJamoComponents}]`);
    console.log(`  - 정답 자모[${index}]: [${secretJamoComponents}]`);
    console.log(`  - 일치 개수: ${matchCount}`);
    
    // 안전한 첫자음 비교를 위한 검증
    const hasValidFirstConsonant = guessJamoComponents.length > 0 && 
                                   secretJamoComponents.length > 0;
    const firstConsonantMatch = hasValidFirstConsonant && 
                               guessJamoComponents[0] === secretJamoComponents[0];
    
    // 힌트 결정 로직 (개선된 버전)
    if (character === g_secretWordString[index]) {
        console.log(`  ✅ 완전 일치 -> 🥕`);
        return EMOTE_MATCH;
    } else if (matchCount >= 2 && firstConsonantMatch) {
        console.log(`  ✅ 비슷함 (2개+ 일치 + 첫자음 일치) -> 🍄`);
        return EMOTE_SIMILAR;
    } else if (matchCount >= 2) {
        console.log(`  ✅ 많음 (2개+ 일치) -> 🧄`);
        return EMOTE_MANY;
    } else if (matchCount === 1) {
        console.log(`  ✅ 존재함 (현재 위치에서 1개 일치) -> 🍆`);
        return EMOTE_EXISTS;
    } else { // matchCount === 0
        // 현재 위치에서 0개 일치인 경우에만 반대 위치 확인
        const oppositeIndex = index === 0 ? 1 : 0;
        if (oppositeIndex < g_secretWordJamoSets.length) {
            const oppositeMatchCount = countJamoComponentsInOtherJamoComponents(guessJamoComponents, g_secretWordJamoSets[oppositeIndex] as string);
            console.log(`  - 반대 위치[${oppositeIndex}] 자모: [${g_secretWordJamoSets[oppositeIndex]}]`);
            console.log(`  - 반대 위치 일치 개수: ${oppositeMatchCount}`);
            if (oppositeMatchCount > 0) {
                console.log(`  ✅ 반대 위치 -> 🍌`);
                return EMOTE_OPPOSITE;
            }
        }
        console.log(`  ✅ 없음 -> 🍎`);
        return EMOTE_NONE;
    }
}

/**
 * 게임 보드 지우기
 */
export function clearBoard(): void {
    g_currentGuess = [];
    g_nextLetter = 0;
    g_boardState = [];
    g_yesList = [[], []];
    g_noList = [[], []];
    g_hotComboList = [[], []];
    g_hintList = [];
    g_foundMatch = [false, false];
    g_guessesRemaining = NUMBER_OF_GUESSES;
}

/**
 * 게임 상태 리셋
 */
export function resetGameState(): void {
    clearBoard();
    g_finalVictoryGuesses = undefined;
    g_invalidWordCount = 0;
    g_hintsUsed = false;
}

/**
 * 추측 검증 및 처리
 */
export function checkGuess(manual: boolean = false): void {
    const guessString = constructGuessString();

    // 모든 문자가 틀린지 확인
    let allWrong = true;
    for (const val of g_currentGuess) {
        if (!isCharacterAllWrong(val)) {
            allWrong = false;
        }
    }

    // 입력 길이 검증
    if (guessString.length != MAX_LETTERS || isHangulConsonant(guessString[MAX_LETTERS - 1])) {
        showError("🐯 2개 글자를 입력하세요");
        return;
    }

    // 사전 단어 검증
    if (!fullDictionaryIncludes(guessString)) {
        showError("🐯 옳은 단어를 입력하세요");

        if (manual && !g_debugging) {
            if (g_invalidWordCount < MAX_INVALID_WORDS && (window as any).goatcounter) {
                (window as any).goatcounter.count({
                    path: guessString,
                    title: 'invalid',
                    event: true,
                });
            }
            g_invalidWordCount++;
        }
        return;
    }

    // 모든 문자가 틀린 경우
    if (allWrong) {
        showError("🐯 자음과 모음들이 모두 틀려요");
        return;
    }

    // 제출 힌트 처리
    if (!sd_seenSubmit[0]) {
        sd_seenSubmit[0] = true;
        helper.setStoredDataValue(sd_seenSubmit);
        import('./game-board.js').then(gameBoard => {
            gameBoard.hideHelpPointer("submit-key");
        });
    }

    // 연습 게임에서 첫 추측이 정답과 겹치는 경우 단어 변경
    if (g_isPracticeGame && g_guessesRemaining == NUMBER_OF_GUESSES &&
        (g_currentGuess[0] == g_secretWordString[0] || g_currentGuess[1] == g_secretWordString[1])) {
        g_secretWordString = PRACTICE_WORD_BACKUP;
        createSecretWordJamoSets();
    }

    // const secretWord = Array.from(g_secretWordString);
    const shadeDelay = manual ? 700 : 0;

    const letterColor: string[] = [DATA_NONE[DATA_COLOR], DATA_NONE[DATA_COLOR]];
    const letterEmote: string[] = [EMOTE_NONE, EMOTE_NONE];

    // 현재 추측의 자모 분해
    const currentGuessJamoSets: string[] = Array(MAX_LETTERS);
    for (let i = 0; i < MAX_LETTERS; i++) {
        currentGuessJamoSets[i] = hangulSyllableToJamoComponentsText(g_currentGuess[i]);
    }

    // 각 글자별 힌트 계산 - yesNoMaybeListsFromComponents 함수 사용
    for (let i = 0; i < MAX_LETTERS; i++) {
        // 힌트 계산
        letterEmote[i] = yesNoMaybeListsFromComponents(g_currentGuess[i], i, true);
        
        // 힌트에 따른 색상 설정
        switch (letterEmote[i]) {
            case EMOTE_MATCH:
                letterColor[i] = DATA_MATCH[DATA_COLOR];
                g_foundMatch[i] = true;
                break;
            case EMOTE_SIMILAR:
                letterColor[i] = DATA_SIMILAR[DATA_COLOR];
                break;
            case EMOTE_MANY:
                letterColor[i] = DATA_MANY[DATA_COLOR];
                break;
            case EMOTE_EXISTS:
                letterColor[i] = DATA_EXISTS[DATA_COLOR];
                break;
            case EMOTE_OPPOSITE:
                letterColor[i] = DATA_OPPOSITE[DATA_COLOR];
                break;
            default:
                letterColor[i] = DATA_NONE[DATA_COLOR];
                break;
        }
        
        // 자모별 Yes/No 리스트 업데이트
        for (let jamoChar = 0; jamoChar < currentGuessJamoSets[i].length; jamoChar++) {
            const letter = currentGuessJamoSets[i][jamoChar];
            
            // 힌트에 따른 자모 분류
            if (letterEmote[i] === EMOTE_MATCH) {
                // 완전 일치 - Yes 리스트에 추가
                addToYesList(letter, i);
            } else if (letterEmote[i] === EMOTE_SIMILAR || letterEmote[i] === EMOTE_MANY) {
                // 비슷함/많음 - 일부 자모는 Yes, 일부는 Maybe
                if (jamoChar === 0 && letterEmote[i] === EMOTE_SIMILAR) {
                    // 첫 자음이 일치하는 경우
                    addToYesList(letter, i);
                }
            } else if (letterEmote[i] === EMOTE_NONE) {
                // 없음 - No 리스트에 추가
                addToNoList(letter, i);
            }
            
            // 키보드 색상 업데이트
            import('./keyboard.js').then(keyboard => {
                keyboard.shadeKeyBoardDelayed(letter, letterColor[i], shadeDelay);
            });
        }
    }

    // 보드 업데이트
    import('./game-board.js').then(gameBoard => {
        gameBoard.updateBoardWithGuess(guessString, letterColor, letterEmote, manual);
    });

    // 게임 상태 업데이트
    g_guessesRemaining--;
    g_currentGuess = [];
    g_nextLetter = 0;

    // 현재 입력 디스플레이 업데이트 (새로운 행으로 이동)
    import('./game-board.js').then(gameBoard => {
        gameBoard.updateCurrentGuessDisplay();
    });

    // 승리 확인
    const isWin = letterEmote.every(emote => emote === EMOTE_MATCH);
    const isGameOver = g_guessesRemaining <= 0 || isWin;

    if (isGameOver) {
        endGame(isWin, manual);
    } else {
        // 키보드 색상 업데이트
        import('./keyboard.js').then(keyboard => {
            keyboard.colorKeyboardFromClues();
        });
        
        // 도움말 포인터 표시
        import('./game-board.js').then(gameBoard => {
            gameBoard.showHelpPointersIfNeeded();
        });
    }

    console.log(`🎯 추측: ${guessString}, 결과: ${letterEmote.join('')}, 남은 횟수: ${g_guessesRemaining}`);
}

/**
 * 게임 종료 처리
 */
export function endGame(success: boolean, manual: boolean = false): void {
    console.log(`🏁 게임 종료 - ${success ? '승리' : '패배'}`);

    if (success) {
        g_finalVictoryGuesses = NUMBER_OF_GUESSES - g_guessesRemaining;
        
        if (!g_isPracticeGame) {
            increaseWinStats();
        }
    } else {
        g_finalVictoryGuesses = undefined;
        
        if (!g_isPracticeGame) {
            // 연속 기록 초기화
            sd_currentStreak[0] = 0;
            helper.setStoredDataValue(sd_currentStreak);
        }
    }

    // 키보드 비활성화
    import('./keyboard.js').then(keyboard => {
        keyboard.disableKeyBoardUnmatched();
    });

    // 게임 결과 표시
    const messages: string[][] = [];
    if (success) {
        if (g_isPracticeGame) {
            messages.push(["연습이 끝났어요!"]);
            messages.push(["이제 진짜 게임을 시작해봐요!"]);
        } else {
            const attempts = NUMBER_OF_GUESSES - g_guessesRemaining;
            messages.push([`${attempts}번만에 맞췄어요!`]);
            
            // 점수에 따른 메시지
            if (attempts <= 2) {
                messages.push(["🥇 놀라워요!"]);
            } else if (attempts <= 4) {
                messages.push(["🥈 훌륭해요!"]);
            } else {
                messages.push(["🥉 잘했어요!"]);
            }
        }
    } else {
        messages.push(["아쉬워요!"]);
        messages.push([`정답은 "${g_secretWordString}"였어요.`]);
    }

    // 게임 오버 화면 표시
    import('./game-board.js').then(gameBoard => {
        gameBoard.showGameOver(messages, manual);
    });

    // 통계 업데이트
    if (!g_isPracticeGame) {
        import('./statistics.js').then(statistics => {
            statistics.endGameWriteStats(
                success ? (g_finalVictoryGuesses || 0) : 0,
                g_dayNumber,
                g_secretWordString,
                new Date()
            );
        });
    }
}

/**
 * 승리 통계 증가
 */
function increaseWinStats(): void {
    sd_successCount[0]++;
    sd_currentStreak[0]++;
    
    if (sd_currentStreak[0] > sd_bestStreak[0]) {
        sd_bestStreak[0] = sd_currentStreak[0];
        helper.setStoredDataValue(sd_bestStreak);
    }
    
    helper.setStoredDataValue(sd_successCount);
    helper.setStoredDataValue(sd_currentStreak);
}

/**
 * 문자 입력 처리
 */
export function insertLetter(pressedKey: string): void {
    if (g_guessesRemaining === 0) {
        return;
    }

    if (g_currentGuess.length < MAX_LETTERS) {
        g_currentGuess[g_nextLetter] = pressedKey;
        g_nextLetter += 1;
        
        // 보드 업데이트
        import('./game-board.js').then(gameBoard => {
            gameBoard.updateCurrentGuessDisplay();
        });
        
        console.log(`📝 문자 입력: ${pressedKey}, 현재 추측: ${g_currentGuess.join('')}`);
    }
}

/**
 * 문자 삭제 처리
 */
export function deleteLetter(): void {
    if (g_nextLetter > 0) {
        g_nextLetter -= 1;
        g_currentGuess[g_nextLetter] = "";
        
        // 보드 업데이트
        import('./game-board.js').then(gameBoard => {
            gameBoard.updateCurrentGuessDisplay();
        });
        
        console.log(`🔙 문자 삭제, 현재 추측: ${g_currentGuess.join('')}`);
    }
}

/**
 * 오류 메시지 표시 (Toast 방식으로 개선)
 */
function showError(errorText: string): void {
    // DOM 기반 에러 표시 (기존 방식 유지)
    const errorBubble = document.getElementById("error-message");
    if (errorBubble) {
        errorBubble.innerText = errorText;
        errorBubble.classList.remove("fade-in-out"); // 기존 클래스 제거
        errorBubble.classList.add("show"); // 표시
        errorBubble.style.opacity = "1";
        errorBubble.style.transform = "translateY(0)";
        
        // 3초 후 자동 제거
        setTimeout(() => {
            if (errorBubble) {
                errorBubble.style.opacity = "0";
                errorBubble.style.transform = "translateY(-10px)";
                setTimeout(() => {
                    errorBubble.classList.remove("show");
                    errorBubble.innerText = "";
                }, 300);
            }
        }, 3000);
    }
    
    // React Toast 시스템으로 이벤트 발송 (추후 연동용)
    if (typeof window !== 'undefined' && (window as any).gameToastSystem) {
        const toastSystem = (window as any).gameToastSystem;
        
        // 에러 타입 자동 감지
        let errorType = 'invalid_word';
        if (errorText.includes('2개 글자')) {
            errorType = 'invalid_length';
        } else if (errorText.includes('자음과 모음')) {
            errorType = 'all_wrong';
        }
        
        toastSystem.showGameError(errorType);
    }
    
    // 햅틱 피드백 (모바일)
    if (navigator.vibrate) {
        navigator.vibrate([25]);
    }
    
    console.warn('⚠️ 게임 오류:', errorText);
}


// 전역 함수로 등록 (브라우저 환경에서만)
if (typeof window !== 'undefined') {
    (window as any).checkGuess = checkGuess;
    (window as any).insertLetter = insertLetter;
    (window as any).deleteLetter = deleteLetter;
}

/**
 * 게임 종료 여부 확인
 */
export function isGameOver(): boolean {
    return g_guessesRemaining <= 0 || g_foundMatch.every(match => match);
}

/**
 * 승리 여부 확인
 */
export function isGameWon(): boolean {
    return g_foundMatch.every(match => match);
}

/**
 * 현재 게임 상태 가져오기
 */
export function getGameState(): {
    secretWord: string;
    secretWordString: string;
    currentGuess: string[];
    guessesRemaining: number;
    boardState: any[];
    isGameOver: boolean;
    isGameWon: boolean;
    yesList: string[][];
    noList: string[][];
    hotComboList: any[][];
    hintList: string[];
    hintsUsed: boolean;
} {
    return {
        secretWord: g_secretWordString,
        secretWordString: g_secretWordString,
        currentGuess: g_currentGuess,
        guessesRemaining: g_guessesRemaining,
        boardState: g_boardState,
        isGameOver: isGameOver(),
        isGameWon: isGameWon(),
        yesList: g_yesList,
        noList: g_noList,
        hotComboList: g_hotComboList,
        hintList: g_hintList,
        hintsUsed: g_hintsUsed
    };
}

/**
 * yes 리스트에 글자 추가
 * @param {string} letter - 추가할 글자
 * @param {number} index - 위치 인덱스 (0 또는 1)
 */
export function addToYesList(letter: string, index: number): void {
    if (g_yesList[index].indexOf(letter) === -1) {
        g_yesList[index].push(letter);
    }
}

/**
 * no 리스트에 글자 추가
 * @param {string} letter - 추가할 글자
 * @param {number} index - 위치 인덱스 (0 또는 1)
 */
export function addToNoList(letter: string, index: number): void {
    if (g_noList[index].indexOf(letter) === -1) {
        g_noList[index].push(letter);
    }
}

/**
 * 핫 콤보 리스트에 조합 추가
 * @param {string} combo - 추가할 조합
 * @param {number} index - 위치 인덱스 (0 또는 1)
 * @param {number} min - 최소값
 * @param {number} max - 최대값
 */
export function addToHotComboList(combo: string, index: number, min: number, max: number): void {
    const hotComboEntry = {
        combo: combo,
        min: min,
        max: max
    };
    
    // 기존에 같은 조합이 있는지 확인
    const existingIndex = g_hotComboList[index].findIndex(entry => entry.combo === combo);
    if (existingIndex === -1) {
        g_hotComboList[index].push(hotComboEntry);
    } else {
        // 기존 항목 업데이트
        g_hotComboList[index][existingIndex] = hotComboEntry;
    }
}

/**
 * no 리스트에 여러 글자 추가
 * @param {string} letters - 추가할 글자들
 * @param {number} index - 위치 인덱스 (0 또는 1)
 */
export function addManyToNoList(letters: string, index: number): void {
    for (let i = 0; i < letters.length; i++) {
        addToNoList(letters[i], index);
    }
}

/**
 * 자모 구성요소 외의 모든 글자를 no 리스트에 추가
 * @param {string} jamoComponents - 자모 구성요소
 * @param {number} index - 위치 인덱스 (0 또는 1)
 */
export function addAllOthersToNoList(jamoComponents: string, index: number): void {
    // 한글 자음 목록
    const consonants = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
    const vowels = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
    const finals = 'ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ';
    
    // 자음 처리
    for (let i = 0; i < consonants.length; i++) {
        if (jamoComponents.indexOf(consonants[i]) === -1) {
            addToNoList(consonants[i], index);
        }
    }
    
    // 모음 처리
    for (let i = 0; i < vowels.length; i++) {
        if (jamoComponents.indexOf(vowels[i]) === -1) {
            addToNoList(vowels[i], index);
        }
    }
    
    // 종성 처리
    for (let i = 0; i < finals.length; i++) {
        if (jamoComponents.indexOf(finals[i]) === -1) {
            addToNoList(finals[i], index);
        }
    }
}

/**
 * 받침이 없는 글자들을 no 리스트에 추가
 * @param {number} index - 위치 인덱스 (0 또는 1)
 */
export function addNonBatchimToNoList(index: number): void {
    // 받침이 없는 한글 자음들
    const nonBatchimConsonants = 'ㄲㄸㅃㅆㅉ';
    addManyToNoList(nonBatchimConsonants, index);
}

/**
 * 핫 콤보를 깨뜨리는지 확인
 * @param {number} index - 위치 인덱스 (0 또는 1)
 * @param {Array} testList - 테스트할 리스트
 * @returns {boolean} 핫 콤보를 깨뜨리는지 여부
 */
export function breaksAnyHotCombo(index: number, testList: string[]): boolean {
    for (let i = 0; i < g_hotComboList[index].length; i++) {
        const hotCombo = g_hotComboList[index][i];
        let matchCount = 0;
        
        for (let j = 0; j < testList.length; j++) {
            if (hotCombo.combo.indexOf(testList[j]) !== -1) {
                matchCount++;
            }
        }
        
        if (matchCount < hotCombo.min || matchCount > hotCombo.max) {
            return true;
        }
    }
    
    return false;
}

/**
 * 게임 보드 초기화
 */
export function initBoard(): void {
    g_guessesRemaining = NUMBER_OF_GUESSES;
    g_currentGuess = [];
    g_nextLetter = 0;
    g_boardState = [];
    g_yesList = [[], []];
    g_noList = [[], []];
    g_hotComboList = [[], []];
    g_hintList = [];
    g_foundMatch = [false, false];
    
    // 게임 보드 UI 초기화
    import('./game-board.js').then(gameBoard => {
        gameBoard.initializeBoard();
    });
}

/**
 * 스토리 버튼 업데이트
 */
export function updateStoryButton(): void {
    // TODO: Import story module when available
    // import('./story.js').then(story => {
    //     story.updateStoryButtonState();
    // });
    console.log('Story button update skipped - module not available');
}

// word.ts 함수들을 re-export
export { getSecretWordByDayIndex, numSecretWords, fullDictionaryIncludes } from './word';