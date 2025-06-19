/**
 * 까치(Magpie) 기능 모듈
 * 까치 퍼즐 생성, 공유, 플레이 기능을 담당합니다.
 */

import { 
    MAGPIE_INFO_KEY,
    MAX_LETTERS,
    NUMBER_OF_GUESSES,
    EMOTE_CREATE_MAGPIE,
    EMOTE_COPY_MAGPIE,
    EMOTE_INPUT_MAGPIE,
    EMOTE_FINALIZE_MAGPIE,
    STORY_CHAPTERS
} from './constants.js';
import { 
    fullDictionaryIncludes 
} from './word.js';
import { 
    hangulSyllableToJamoComponentsText 
} from './hangul_tools.js';
import * as helper from './helper_tools.js';
import { 
    sd_previousCreatedMagpie,
    sd_storiesUnlocked,
    sd_storiesRead,
    sd_bestStreak
} from './storage.js';
import { 
    encryptWord,
    decryptWord,
    countJamoComponentsInOtherJamoComponents
} from './game-core.js';

// 까치 게임 상태 변수들
export let g_isMagpieGame = false;
export let g_creatingMagpie = false;

/**
 * URL에서 까치 단어 가져오기
 */
export function getMagpieWord() {
    if (location.search == undefined || location.search.length <= 0) {
        return undefined;
    }

    let searchInfo = decodeURIComponent(location.search).substring(1);
    let splitInfo = searchInfo.split('&');
    
    for (let i = 0; i < splitInfo.length; i++) {
        if (splitInfo[i].startsWith(MAGPIE_INFO_KEY)) {
            if (!canTryMagpie()) {
                showError("🐯 길조를 하려면 15챕터를 봐야 해요");
                return undefined;
            }

            let magpieInfo = splitInfo[i].substring(MAGPIE_INFO_KEY.length).split("_");
            if (magpieInfo.length < 3) {
                showError("🐯 길조가 안 돼요");
                return undefined;
            }

            if (magpieInfo[0].length < 2 || magpieInfo[0][magpieInfo[0].length - 1] != '월' ||
                magpieInfo[1].length < 2 || magpieInfo[1][magpieInfo[1].length - 1] != '일' ||
                magpieInfo[2].length != 2) {
                showError("🐯 길조가 안 돼요");
                return undefined;
            }

            let magpieMonth = parseInt(magpieInfo[0].substring(0, magpieInfo[0].length - 1));
            let magpieDate = parseInt(magpieInfo[1].substring(0, magpieInfo[1].length - 1));

            // 날짜 검증
            let currentDate = new Date();
            let localDate = (isLastDayOfTheMonth()) ? 33 : currentDate.getDate();
            let localMonth = currentDate.getMonth() + 1;

            if (magpieMonth != localMonth || magpieDate != localDate) {
                showError("🐯 길조의 날짜가 오늘이 아니에요");
                return undefined;
            }

            let magpieWord = decryptWord(magpieInfo[2]);

            if (!fullDictionaryIncludes(magpieWord)) {
                showError("🐯 길조의 암호가 안 돼요");
                return undefined;
            }

            // 비밀 단어와 겹치는지 확인
            import('./game-core.js').then(gameCore => {
                for (let other = 0; other < MAX_LETTERS; other++) {
                    let magpieJamoSet = hangulSyllableToJamoComponentsText(magpieWord[i]);
                    
                    if (countJamoComponentsInOtherJamoComponents(magpieJamoSet, gameCore.g_secretWordJamoSets[other]) > 0) {
                        showError("🐯 길조의 암호가 안 돼요");
                        return undefined;
                    }
                }
            });

            return magpieWord;
        }
    }

    return undefined;
}

/**
 * 까치 게임 시도
 */
export function tryMagpie() {
    let magpieWord = getMagpieWord();
    if (magpieWord == undefined) {
        return;
    }

    g_isMagpieGame = true;
    
    // 게임 코어에 까치 단어 설정
    import('./game-core.js').then(gameCore => {
        gameCore.g_secretWordString = magpieWord;
        gameCore.clearBoard();
    });

    // 까치용 키보드 준비
    prepareKeyboardForMagpie(true);

    console.log('🐦 까치 게임 시작:', magpieWord);
}

/**
 * 까치 생성 가능 여부 확인
 */
export function canCreateMagpie() {
    if (!finishedReadingStory(1) && !isHangulDay()) {
        return false;
    }

    // 승리했고 최소 한 번의 추측이 남아있는지 확인
    import('./game-core.js').then(gameCore => {
        let atLeastOneGuessRemains = gameCore.g_finalVictoryGuesses != undefined && 
                                     gameCore.g_finalVictoryGuesses < NUMBER_OF_GUESSES;
        
        return !gameCore.g_isPracticeGame && !isSpecialMode() && (atLeastOneGuessRemains || isHangulDay());
    });
}

/**
 * 까치 시도 가능 여부 확인
 */
export function canTryMagpie() {
    return finishedReadingStory(1) || isHangulDay();
}

/**
 * 까치 최종화
 */
export function finalizeMagpie() {
    import('./game-core.js').then(gameCore => {
        if (!gameCore.guessStringIsValid()) {
            showError("🐯 옳은 단어를 입력하세요");
            return;
        }

        let guessString = gameCore.constructGuessString();

        if (g_creatingMagpie) {
            sd_previousCreatedMagpie[0] = guessString;
            helper.setStoredDataValue(sd_previousCreatedMagpie);

            // 보드에 까치 표시
            displayMagpieOnBoard(guessString);
        }

        g_creatingMagpie = false;
        setMagpieButton(EMOTE_COPY_MAGPIE);

        // 공유 링크 생성
        let searchLink = magpieSearchLink(guessString);
        let clipboardOutput = "https://ssaangn.com/" + searchLink;
        
        // 클립보드에 복사
        copyToClipboard(clipboardOutput);
        
        console.log('🐦 까치 퍼즐 생성 완료:', clipboardOutput);
    });
}

/**
 * 까치 검색 링크 생성
 */
export function magpieSearchLink(guessString) {
    let encrypted = encryptWord(guessString);
    let currentDate = new Date();
    let localDate = (isLastDayOfTheMonth()) ? 33 : currentDate.getDate();
    let localMonth = currentDate.getMonth() + 1;

    return "?" + MAGPIE_INFO_KEY + localMonth + "월_" + localDate + "일_" + encrypted;
}

/**
 * 까치 버튼 상태 설정
 */
export function setMagpieButton(state) {
    let gameOver = document.getElementById("game-over");
    if (gameOver) {
        gameOver.style.display = (state == EMOTE_CREATE_MAGPIE || state == EMOTE_COPY_MAGPIE) ? "flex" : "none";
    }

    let rows = document.getElementsByClassName("letter-row");
    if (rows.length > 0) {
        let row = rows[NUMBER_OF_GUESSES - 1];

        if (state == EMOTE_CREATE_MAGPIE) {
            if (sd_previousCreatedMagpie[0] != "") {
                state = EMOTE_COPY_MAGPIE;
                displayPreviousMagpie(row);
            } else {
                clearMagpieRow(row);
            }
        }

        updateMagpieButton(state);
    }
}

/**
 * 이전 까치 표시
 */
function displayPreviousMagpie(row) {
    for (let i = 0; i < MAX_LETTERS; i++) {
        let magpieWord = row.children[i];
        if (magpieWord) {
            magpieWord.textContent = sd_previousCreatedMagpie[0][i];
            magpieWord.style.backgroundColor = '#8B4513'; // 까치 색상
            magpieWord.classList.add("filled-box");
        }
    }
}

/**
 * 까치 행 초기화
 */
function clearMagpieRow(row) {
    for (let i = 0; i < MAX_LETTERS; i++) {
        let magpieWord = row.children[i];
        if (magpieWord) {
            magpieWord.textContent = "";
            magpieWord.style.backgroundColor = "";
            magpieWord.classList.remove("filled-box");
        }
    }
}

/**
 * 보드에 까치 표시
 */
function displayMagpieOnBoard(guessString) {
    let rows = document.getElementsByClassName("letter-row");
    if (rows.length > 0) {
        let row = rows[NUMBER_OF_GUESSES - 1];
        
        for (let i = 0; i < MAX_LETTERS; i++) {
            let box = row.children[i];
            if (box) {
                // 애니메이션 효과
                restartAnimationViaDup(box, "plump");
                box.style.backgroundColor = '#8B4513'; // 까치 색상
                box.classList.add("filled-box");
                box.textContent = guessString[i];
            }
        }
    }
}

/**
 * 까치용 키보드 준비
 */
function prepareKeyboardForMagpie(tryMagpie) {
    import('./keyboard.js').then(keyboard => {
        keyboard.prepareKeyboard();
        
        if (tryMagpie) {
            // 까치 모드용 키보드 설정
            let keyboardElement = document.getElementById('keyboard');
            if (keyboardElement) {
                keyboardElement.classList.add('magpie-mode');
            }
        }
    });
}

/**
 * 까치 버튼 업데이트
 */
function updateMagpieButton(state) {
    let button = document.getElementById('magpie-button');
    if (button) {
        button.textContent = state;
        button.onclick = () => {
            if (state === EMOTE_CREATE_MAGPIE) {
                startCreatingMagpie();
            } else if (state === EMOTE_COPY_MAGPIE) {
                copyMagpieLink();
            }
        };
    }
}

/**
 * 까치 생성 시작
 */
function startCreatingMagpie() {
    g_creatingMagpie = true;
    setMagpieButton(EMOTE_INPUT_MAGPIE);
    console.log('🐦 까치 생성 모드 시작');
}

/**
 * 까치 링크 복사
 */
function copyMagpieLink() {
    if (sd_previousCreatedMagpie[0]) {
        let searchLink = magpieSearchLink(sd_previousCreatedMagpie[0]);
        let clipboardOutput = "https://ssaangn.com/" + searchLink;
        copyToClipboard(clipboardOutput);
    }
}

/**
 * 스토리 읽기 완료 확인
 */
export function finishedReadingStory(chapter) {
    let chapterIndex = chapter - 1;
    if (chapterIndex >= 0 && chapterIndex < STORY_CHAPTERS.length) {
        return sd_storiesUnlocked[0] >= STORY_CHAPTERS[chapterIndex][0] && 
               sd_storiesRead[0] >= STORY_CHAPTERS[chapterIndex][0];
    }
    return false;
}

/**
 * 데이터 가져오기/내보내기 가능 여부
 */
export function canExportImport() {
    return sd_bestStreak[0] >= 2 || finishedReadingStory(1);
}

/**
 * 한글날 여부 확인
 */
function isHangulDay() {
    let currentDate = new Date();
    return currentDate.getMonth() + 1 === 10 && currentDate.getDate() === 9;
}

/**
 * 특별 모드 여부 확인
 */
function isSpecialMode() {
    return g_isMagpieGame; // 또는 다른 특별 모드들
}

/**
 * 월말 여부 확인
 */
function isLastDayOfTheMonth() {
    let currentDate = new Date();
    let lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    return currentDate.getDate() === lastDay;
}

/**
 * 애니메이션 재시작
 */
function restartAnimationViaDup(element, animationName) {
    if (element) {
        element.classList.remove(animationName);
        void element.offsetWidth; // 리플로우 강제 실행
        element.classList.add(animationName);
    }
}

/**
 * 클립보드에 복사
 */
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('클립보드에 복사됨:', text);
            showSuccess('링크가 클립보드에 복사되었습니다!');
        }).catch(err => {
            console.error('클립보드 복사 실패:', err);
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

/**
 * 폴백 클립보드 복사
 */
function fallbackCopyToClipboard(text) {
    let textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        console.log('폴백으로 클립보드에 복사됨');
        showSuccess('링크가 클립보드에 복사되었습니다!');
    } catch (err) {
        console.error('폴백 복사도 실패:', err);
        showError('클립보드 복사에 실패했습니다.');
    }
    
    document.body.removeChild(textArea);
}

/**
 * 까치 상태 리셋
 */
export function resetMagpieState() {
    g_isMagpieGame = false;
    g_creatingMagpie = false;
}

/**
 * 현재 까치 상태 가져오기
 */
export function getMagpieState() {
    return {
        isMagpieGame: g_isMagpieGame,
        creatingMagpie: g_creatingMagpie,
        previousCreatedMagpie: sd_previousCreatedMagpie[0]
    };
}

// 임시 함수들 (실제로는 다른 모듈에서 import)
function showError(message) {
    console.error('까치 오류:', message);
}

function showSuccess(message) {
    console.log('까치 성공:', message);
}

// 전역 함수로 등록
window.tryMagpie = tryMagpie;
window.finalizeMagpie = finalizeMagpie;