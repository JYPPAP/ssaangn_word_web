/**
 * 키보드 처리 모듈
 * 물리적 키보드와 가상 키보드 처리, 키 색상 관리를 담당합니다.
 */

import { 
    isHangulSyllable,
    isHangulConsonant,
    isHangulVowel,
    appendHangul,
    deleteOneJamo,
    keyboardKeyToJamoText,
    HANGUL_CONSONANT_VOWEL_LIST
} from './hangul_tools';
import { MAX_LETTERS } from './constants';
import { 
    g_currentGuess, 
    g_nextLetter, 
    incrementNextLetter,
    decrementNextLetter,
    setCurrentGuessLetter,
    pushCurrentGuessLetter,
    spliceCurrentGuess
} from './game-core';
import { updateCurrentGuessDisplay } from './game-board';

// 키보드 상태 변수들
export let g_keyboardState = new Map<string, { color: string; timestamp: number }>(); // 키별 상태 저장
export let g_disabledKeys = new Set<string>(); // 비활성화된 키들

/**
 * 키보드 준비 (색상 초기화 등)
 */
export function prepareKeyboard(): void {
    // 모든 키보드 키 초기화
    if (HANGUL_CONSONANT_VOWEL_LIST && Array.isArray(HANGUL_CONSONANT_VOWEL_LIST)) {
        HANGUL_CONSONANT_VOWEL_LIST.forEach(key => {
            resetKeyColor(key);
            enableKeyBoardKey(key);
        });
    } else {
        // fallback: 기본 한글 자모 리스트
        const hangulList = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎㅏㅐㅑㅒㅓㅔㅕㅖㅗㅛㅜㅠㅡㅣ";
        for (let i = 0; i < hangulList.length; i++) {
            const key = hangulList[i];
            resetKeyColor(key);
            enableKeyBoardKey(key);
        }
    }
    
    g_keyboardState.clear();
    g_disabledKeys.clear();
}

/**
 * 키보드 이름 수정 (UI 표시용)
 */
export function fixKeyboardNames(): void {
    const keyMappings = {
        'ㅃ': 'ㅂ',
        'ㅉ': 'ㅈ', 
        'ㄸ': 'ㄷ',
        'ㄲ': 'ㄱ',
        'ㅆ': 'ㅅ',
        'ㅒ': 'ㅐ',
        'ㅖ': 'ㅔ'
    };

    Object.entries(keyMappings).forEach(([original, replacement]) => {
        let element = getKeyboardKey(original);
        if (element) {
            element.textContent = replacement;
        }
    });
}


/**
 * 키보드 키 색상 변경 (지연 적용)
 */
export function shadeKeyBoardDelayed(letter: string, color: string, delay: number): void {
    setTimeout(() => {
        shadeKeyBoard(letter, color);
    }, delay);
}

/**
 * 키보드 키 색상 변경
 */
export function shadeKeyBoard(letter: string, color: string): void {
    const key = getKeyboardKey(letter);
    if (key) {
        key.style.backgroundColor = color;
        g_keyboardState.set(letter, { color, timestamp: Date.now() });
    }
}

/**
 * 키보드 키 색상 리셋
 */
export function resetKeyColor(letter: string): void {
    const key = getKeyboardKey(letter);
    if (key) {
        key.style.backgroundColor = "";
        g_keyboardState.delete(letter);
    }
}

/**
 * 일치하지 않는 키보드 키 비활성화
 */
export function disableKeyBoardUnmatched(): void {
    if (HANGUL_CONSONANT_VOWEL_LIST && Array.isArray(HANGUL_CONSONANT_VOWEL_LIST)) {
        HANGUL_CONSONANT_VOWEL_LIST.forEach(letter => {
            if (!g_keyboardState.has(letter)) {
                disableKeyBoardKey(letter);
            }
        });
    } else {
        // fallback: 기본 한글 자모 리스트
        const hangulList = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎㅏㅐㅑㅒㅓㅔㅕㅖㅗㅛㅜㅠㅡㅣ";
        for (let i = 0; i < hangulList.length; i++) {
            const letter = hangulList[i];
            if (!g_keyboardState.has(letter)) {
                disableKeyBoardKey(letter);
            }
        }
    }
}

/**
 * 키보드 키 비활성화
 */
export function disableKeyBoardKey(letter: string): void {
    const key = getKeyboardKey(letter);
    if (key) {
        key.classList.add('disabled');
        key.style.opacity = '0.3';
        g_disabledKeys.add(letter);
    }
}

/**
 * 키보드 키 활성화
 */
export function enableKeyBoardKey(letter: string): void {
    const key = getKeyboardKey(letter);
    if (key) {
        key.classList.remove('disabled');
        key.style.opacity = '1';
        g_disabledKeys.delete(letter);
    }
}

/**
 * 키보드 키 숨기기
 */
export function hideKeyBoardKey(letter: string): void {
    const key = getKeyboardKey(letter);
    if (key) {
        key.style.display = 'none';
    }
}

/**
 * 키보드 키 표시
 */
export function showKeyBoardKey(letter: string): void {
    const key = getKeyboardKey(letter);
    if (key) {
        key.style.display = '';
    }
}

/**
 * 키보드 키 색상 상태 가져오기
 */
export function getKeyBoardShade(letter: string): string | null {
    return g_keyboardState.get(letter)?.color || null;
}

/**
 * 다음 글자로 이동
 */
export function moveToNextLetter(): boolean {
    if (g_nextLetter < MAX_LETTERS - 1) {
        incrementNextLetter();
        updateCurrentGuessDisplay();
        return true;
    }
    return false;
}

/**
 * 글자 입력 처리
 */
export function insertLetter(pressedKey: string): boolean {
    if (g_disabledKeys.has(pressedKey)) {
        return false; // 비활성화된 키
    }

    if (g_nextLetter >= MAX_LETTERS) {
        return false; // 이미 최대 글자 수
    }

    // 한글 조합 처리
    let jamoText: string;
    
    // 이미 한글 문자라면 그대로 사용, 영어 키보드 입력이라면 변환
    if (isHangulConsonant(pressedKey) || isHangulVowel(pressedKey)) {
        jamoText = pressedKey;
    } else {
        jamoText = keyboardKeyToJamoText(pressedKey);
    }
    
    if (!jamoText) {
        return false;
    }

    // 현재 위치가 비어있으면 새 글자 시작
    if (g_nextLetter >= g_currentGuess.length) {
        pushCurrentGuessLetter("");
    }

    // 한글 조합
    let currentChar = g_currentGuess[g_nextLetter] || "";
    
    // 현재 문자가 비어있으면 새로운 문자 시작
    if (!currentChar) {
        setCurrentGuessLetter(g_nextLetter, jamoText);
        console.log(`새 문자 시작: "${jamoText}"`);
        updateCurrentGuessDisplay();
        return true;
    }
    
    // 현재 문자와 조합 가능한지 미리 체크
    let canCombine = false;
    
    // 1. 단일 자음에 모음 추가 가능
    if (isHangulConsonant(currentChar) && isHangulVowel(jamoText)) {
        canCombine = true;
    }
    // 2. 자음+모음 조합에 받침 추가 가능 (받침이 없는 경우)
    else if (isHangulSyllable(currentChar) && isHangulConsonant(jamoText)) {
        // 이미 받침이 있는지 확인 - hangul_tools.ts의 함수를 사용
        // 간단한 확인: 받침이 있는 완성형 글자인지 체크
        const hasNoFinalConsonant = (currentChar.charCodeAt(0) - '가'.charCodeAt(0)) % 28 === 0;
        canCombine = hasNoFinalConsonant;
    }
    // 3. 모음끼리 조합 (ㅗ+ㅏ=ㅘ 등)
    else if (isHangulSyllable(currentChar) && isHangulVowel(jamoText)) {
        // 복합 모음 조합 시도해볼 수 있음
        canCombine = true;
    }
    
    if (canCombine) {
        // 조합 시도
        const newChar = appendHangul(currentChar, jamoText);
        console.log(`한글 조합 시도: "${currentChar}" + "${jamoText}" = "${newChar}"`);
        console.log(`  - currentChar 길이: ${currentChar.length}, newChar 길이: ${newChar.length}`);
        console.log(`  - currentChar + jamoText: "${currentChar + jamoText}"`);
        console.log(`  - newChar === currentChar: ${newChar === currentChar}`);
        console.log(`  - newChar === currentChar + jamoText: ${newChar === currentChar + jamoText}`);
        
        // 조합이 성공했는지 확인 
        if (newChar !== currentChar && newChar !== currentChar + jamoText) {
            // 2글자 게임에서는 한 칸에 한 글자만 허용
            if (newChar.length === 1) {
                console.log(`조합 성공: "${newChar}" 설정`);
                setCurrentGuessLetter(g_nextLetter, newChar);
                updateCurrentGuessDisplay();
                return true;
            } else if (newChar.length === 2) {
                // 2글자 결과 (예: "헉" + "ㅣ" = "허기")는 분리해서 처리
                console.log(`2글자 조합 결과: "${newChar}" -> "${newChar[0]}" + "${newChar[1]}"`);
                setCurrentGuessLetter(g_nextLetter, newChar[0]);
                
                // 다음 위치로 이동해서 두 번째 글자 설정
                if (g_nextLetter < MAX_LETTERS - 1) {
                    incrementNextLetter();
                    if (g_nextLetter >= g_currentGuess.length) {
                        pushCurrentGuessLetter("");
                    }
                    setCurrentGuessLetter(g_nextLetter, newChar[1]);
                }
                
                updateCurrentGuessDisplay();
                return true;
            }
        } else {
            console.log(`조합 실패 - 다음 글자로 이동`);
        }
    }
    
    // 조합이 불가능하거나 실패한 경우 - 다음 글자로 이동
    if (g_nextLetter < MAX_LETTERS - 1) {
        incrementNextLetter();
        
        // 다음 위치에서 새로 시작
        if (g_nextLetter >= g_currentGuess.length) {
            pushCurrentGuessLetter("");
        }
        
        console.log(`다음 위치로 이동: 위치 ${g_nextLetter}, 새 문자: "${jamoText}"`);
        setCurrentGuessLetter(g_nextLetter, jamoText);
        updateCurrentGuessDisplay();
        return true;
    }
    
    return false;
}

/**
 * 글자 삭제 처리
 */
export function deleteLetter(): boolean {
    if (g_nextLetter <= 0 && (!g_currentGuess[0] || g_currentGuess[0] === "")) {
        return false; // 삭제할 것이 없음
    }

    // 현재 위치에 미완성 글자가 있으면 자모 삭제
    if (g_nextLetter < g_currentGuess.length && g_currentGuess[g_nextLetter]) {
        const currentChar = g_currentGuess[g_nextLetter];
        const newChar = deleteOneJamo(currentChar);
        
        if (newChar !== currentChar) {
            if (newChar === "") {
                setCurrentGuessLetter(g_nextLetter, "");
            } else {
                setCurrentGuessLetter(g_nextLetter, newChar);
            }
            updateCurrentGuessDisplay();
            return true;
        }
    }

    // 이전 위치로 이동해서 삭제
    if (g_nextLetter > 0) {
        decrementNextLetter();
        const currentChar = g_currentGuess[g_nextLetter] || "";
        const newChar = deleteOneJamo(currentChar);
        
        if (newChar === "") {
            spliceCurrentGuess(g_nextLetter, 1);
        } else {
            setCurrentGuessLetter(g_nextLetter, newChar);
        }
        
        updateCurrentGuessDisplay();
        return true;
    }

    return false;
}

/**
 * 키보드 키 요소 가져오기
 */
export function getKeyboardKey(letter: string): HTMLElement | undefined {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        if (elem.textContent === letter || elem.id.startsWith(letter)) {
            return elem as HTMLElement;
        }
    }
    return undefined;
}

/**
 * 힌트에 따라 키보드 색상 업데이트
 */
export function colorKeyboardFromClues(): void {
    // 게임 코어에서 힌트 정보를 가져와서 키보드 색상 업데이트
    import('./game-core').then(gameCore => {
        import('./constants').then(constants => {
            // Yes 리스트 (당근 색상) - 정확한 위치의 자모들
            for (let pos = 0; pos < 2; pos++) {
                if (gameCore.g_yesList[pos]) {
                    gameCore.g_yesList[pos].forEach(letter => {
                        shadeKeyBoard(letter, constants.DATA_MATCH[constants.DATA_COLOR]);
                    });
                }
            }
            
            // No 리스트 (사과 색상) - 없는 자모들
            for (let pos = 0; pos < 2; pos++) {
                if (gameCore.g_noList[pos]) {
                    gameCore.g_noList[pos].forEach(letter => {
                        shadeKeyBoard(letter, constants.DATA_NONE[constants.DATA_COLOR]);
                    });
                }
            }
            
            console.log('🎨 키보드 색상 업데이트 완료');
        });
    });
}
