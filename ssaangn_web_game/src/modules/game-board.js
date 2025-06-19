/**
 * 게임 보드 관리 모듈
 * 게임 보드의 생성, 업데이트, 렌더링을 담당합니다.
 */

import { NUMBER_OF_GUESSES, MAX_LETTERS } from './constants.js';
import { 
    g_currentGuess, 
    g_nextLetter, 
    g_boardState, 
    g_guessesRemaining,
    setBoardState,
    isCharacterAllWrong 
} from './game-core.js';

/**
 * 게임 보드 레이아웃 생성
 */
export function createBoardLayout() {
    let board = document.getElementById("game-board");
    if (!board) return;

    board.innerHTML = ""; // 기존 내용 제거

    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        let row = document.createElement("div");
        row.className = "letter-row";
        row.id = `letter-row-${i}`;

        for (let j = 0; j < MAX_LETTERS; j++) {
            let box = document.createElement("div");
            box.className = "letter-box";
            box.id = `letter-${i}-${j}`;
            row.appendChild(box);
        }

        board.appendChild(row);
    }
}

/**
 * 현재 글자 행 가져오기
 */
export function getCurrentLetterRow() {
    return NUMBER_OF_GUESSES - g_guessesRemaining;
}


/**
 * 특정 행을 추측으로 채우기
 */
function fillRowWithGuess(rowIndex, guess, hints) {
    if (rowIndex >= NUMBER_OF_GUESSES || guess.length !== MAX_LETTERS) return;

    for (let j = 0; j < MAX_LETTERS; j++) {
        let box = document.getElementById(`letter-${rowIndex}-${j}`);
        if (box) {
            box.textContent = guess[j];
            if (hints[j]) {
                box.innerHTML += `<span class="hint-emoji">${hints[j]}</span>`;
            }
            box.classList.add("filled");
        }
    }
}

/**
 * 현재 추측을 보드에 표시
 */
export function updateCurrentGuessDisplay() {
    let currentRow = getCurrentLetterRow();
    
    for (let i = 0; i < MAX_LETTERS; i++) {
        let box = document.getElementById(`letter-${currentRow}-${i}`);
        if (box) {
            if (i < g_currentGuess.length) {
                box.textContent = g_currentGuess[i];
                box.classList.add("filled");
            } else {
                box.textContent = "";
                box.classList.remove("filled");
            }
        }
    }
}

/**
 * 틀린 박스 상태 업데이트
 */
export function updateWrongBoxStatus(box) {
    if (!box) return;

    let letter = box.textContent;
    if (letter && isCharacterAllWrong(letter)) {
        box.classList.add("all-wrong");
    } else {
        box.classList.remove("all-wrong");
    }
}

/**
 * 보드 상태 저장
 */
export function saveBoardState() {
    // 현재 보드 상태를 g_boardState에 저장
    let newBoardState = [];
    
    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        let rowState = [];
        for (let j = 0; j < MAX_LETTERS; j++) {
            let box = document.getElementById(`letter-${i}-${j}`);
            if (box) {
                rowState.push({
                    letter: box.textContent || "",
                    classes: Array.from(box.classList),
                    innerHTML: box.innerHTML
                });
            }
        }
        newBoardState.push(rowState);
    }
    
    setBoardState(newBoardState);
}

/**
 * 보드 상태 복원
 */
export function restoreBoardState() {
    if (!g_boardState || g_boardState.length === 0) return;

    for (let i = 0; i < g_boardState.length && i < NUMBER_OF_GUESSES; i++) {
        for (let j = 0; j < g_boardState[i].length && j < MAX_LETTERS; j++) {
            let box = document.getElementById(`letter-${i}-${j}`);
            if (box && g_boardState[i][j]) {
                let state = g_boardState[i][j];
                box.textContent = state.letter;
                box.className = "letter-box " + state.classes.join(" ");
                if (state.innerHTML !== state.letter) {
                    box.innerHTML = state.innerHTML;
                }
            }
        }
    }
}

/**
 * 보드 애니메이션 적용
 */
export function animateRow(rowIndex, animationType = "flip") {
    for (let j = 0; j < MAX_LETTERS; j++) {
        let box = document.getElementById(`letter-${rowIndex}-${j}`);
        if (box) {
            box.classList.add(`animate-${animationType}`);
            
            // 애니메이션 완료 후 클래스 제거
            setTimeout(() => {
                box.classList.remove(`animate-${animationType}`);
            }, 600);
        }
    }
}

/**
 * 보드 하이라이트 효과
 */
export function highlightRow(rowIndex, highlight = true) {
    let row = document.getElementById(`letter-row-${rowIndex}`);
    if (row) {
        if (highlight) {
            row.classList.add("highlighted");
        } else {
            row.classList.remove("highlighted");
        }
    }
}

/**
 * 보드 초기화
 */
export function clearBoardDisplay() {
    let board = document.getElementById("game-board");
    if (!board) return;

    // 모든 박스 초기화
    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        for (let j = 0; j < MAX_LETTERS; j++) {
            let box = document.getElementById(`letter-${i}-${j}`);
            if (box) {
                box.textContent = "";
                box.className = "letter-box";
                box.innerHTML = "";
            }
        }
        
        // 행 하이라이트 제거
        highlightRow(i, false);
    }
}

/**
 * 현재 입력 위치 표시
 */
export function showCurrentInputPosition() {
    let currentRow = getCurrentLetterRow();
    let currentCol = g_nextLetter;
    
    // 이전 커서 제거
    document.querySelectorAll('.letter-box.cursor').forEach(box => {
        box.classList.remove('cursor');
    });
    
    // 새 커서 표시
    if (currentCol < MAX_LETTERS) {
        let box = document.getElementById(`letter-${currentRow}-${currentCol}`);
        if (box) {
            box.classList.add('cursor');
        }
    }
}

/**
 * 보드 검증 표시
 */
export function showValidationFeedback(isValid) {
    let currentRow = getCurrentLetterRow();
    let row = document.getElementById(`letter-row-${currentRow}`);
    
    if (row) {
        if (isValid) {
            row.classList.remove('invalid');
            row.classList.add('valid');
        } else {
            row.classList.remove('valid');
            row.classList.add('invalid');
            
            // 무효한 입력 애니메이션
            setTimeout(() => {
                row.classList.remove('invalid');
            }, 1000);
        }
    }
}

/**
 * 동적 보드 레이아웃 생성
 */
export function createDynamicBoardLayout() {
    let board = document.getElementById("game-board");
    
    if (!board) {
        board = document.createElement("div");
        board.id = "game-board";
        board.className = "game-board";
        document.body.appendChild(board);
    }

    // 기존 내용 지우기
    removeAllChildren(board);

    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        let row = document.createElement("div");
        row.className = "letter-row";
        row.id = `letter-row-${i}`;

        // 글자 입력 박스들
        for (let j = 0; j < MAX_LETTERS; j++) {
            let box = document.createElement("div");
            box.className = "letter-box";
            box.id = `letter-${i}-${j}`;
            row.appendChild(box);
        }

        // 힌트 박스들
        for (let j = 0; j < MAX_LETTERS; j++) {
            let box = document.createElement("div");
            box.className = "letter-box hint-box";
            box.id = `hint-${i}-${j}`;
            box.onclick = (e) => {
                import('./hints.js').then(hints => {
                    hints.showHint(box);
                });
            };
            row.appendChild(box);
        }

        // 힌트 이미지 박스들
        for (let j = 0; j < MAX_LETTERS; j++) {
            let box = document.createElement("div");
            box.className = `letter-box hint-box-image${j + 1} no-click`;
            box.id = `hint-image-${i}-${j}`;
            row.appendChild(box);
        }

        board.appendChild(row);
    }
    
    console.log('🎮 게임 보드 레이아웃 생성 완료');
}

/**
 * 환영 메시지 표시
 */
export function displayWelcomeMessages() {
    let welcomeBox = document.getElementById("welcome-box");
    
    if (!welcomeBox) {
        welcomeBox = document.createElement("div");
        welcomeBox.id = "welcome-box";
        welcomeBox.className = "welcome-modal";
        document.body.appendChild(welcomeBox);
    }

    // 레이스 게임인지 확인
    import('./race-mode.js').then(raceMode => {
        if (raceMode.g_isRaceGame) {
            removeAllChildren(welcomeBox);

            let messages = [];
            messages.push(["33분이에요~"]);
            messages.push(["오호! 삼삼이네요~", "보물찾기 할래요"]);

            import('./ui-helpers.js').then(uiHelpers => {
                uiHelpers.fillInChatMessages(messages, welcomeBox);
                
                // 레이스 시작 버튼
                uiHelpers.fillInLink("보물찾기 시작!", () => {
                    raceMode.beginRaceLap();
                    closeWelcomeBox();
                }, welcomeBox);
            });

            welcomeBox.style.display = "flex";
            return;
        }
    });

    // 일반 게임 환영 메시지
    import('./storage.js').then(storage => {
        if (storage.sd_completedFirstDay && !storage.sd_completedFirstDay[0]) {
            removeAllChildren(welcomeBox);

            let messages = [];
            messages.push(["안녕하세요!"]);
            messages.push(["한글 단어 맞추기 게임에 오신 것을 환영합니다!"]);
            messages.push(["연습 게임부터 시작해보세요."]);

            import('./ui-helpers.js').then(uiHelpers => {
                uiHelpers.fillInChatMessages(messages, welcomeBox);
                uiHelpers.fillInLink("시작하기", closeWelcomeBox, welcomeBox);
            });

            welcomeBox.style.display = "flex";
        }
    });
}

/**
 * 환영 박스 닫기
 */
function closeWelcomeBox() {
    let welcomeBox = document.getElementById("welcome-box");
    if (welcomeBox) {
        welcomeBox.style.display = "none";
    }
}

/**
 * 이전 추측들 채우기
 */
export function fillInPreviousGuesses(guessesString, hintsString) {
    if (!guessesString || !hintsString) return;

    let guesses = guessesString.split(',');
    let hints = hintsString.split(',');

    for (let i = 0; i < guesses.length && i < NUMBER_OF_GUESSES; i++) {
        let guess = guesses[i];
        let hint = hints[i];

        if (guess.length === MAX_LETTERS && hint.length === MAX_LETTERS) {
            // 추측 문자 채우기
            for (let j = 0; j < MAX_LETTERS; j++) {
                let letterBox = document.getElementById(`letter-${i}-${j}`);
                if (letterBox) {
                    letterBox.textContent = guess[j];
                    letterBox.classList.add('filled', 'submitted');
                }

                let hintBox = document.getElementById(`hint-${i}-${j}`);
                if (hintBox) {
                    hintBox.textContent = hint[j];
                    hintBox.classList.add('filled');
                    
                    // 힌트에 따른 색상 적용
                    import('./hints.js').then(hintsModule => {
                        let hintData = hintsModule.getDataFromEmote(hint[j]);
                        if (hintData && hintData.length > 1) {
                            hintBox.style.backgroundColor = hintData[1]; // DATA_COLOR index
                        }
                    });
                }
            }
        }
    }
    
    console.log(`🔄 이전 추측 복원: ${guesses.length}개 행`);
}

/**
 * 보드에 추측과 힌트 업데이트
 */
export function updateBoardWithGuess(guessString, letterColors, letterEmotes, manual = false) {
    let currentRow = getCurrentLetterRow();

    for (let i = 0; i < MAX_LETTERS; i++) {
        // 글자 박스 업데이트
        let letterBox = document.getElementById(`letter-${currentRow}-${i}`);
        if (letterBox) {
            letterBox.textContent = guessString[i];
            letterBox.style.backgroundColor = letterColors[i];
            letterBox.classList.add('filled', 'submitted');
        }

        // 힌트 박스 업데이트
        let hintBox = document.getElementById(`hint-${currentRow}-${i}`);
        if (hintBox) {
            hintBox.textContent = letterEmotes[i];
            hintBox.style.backgroundColor = letterColors[i];
            hintBox.classList.add('filled');
        }

        // 힌트 이미지 박스 업데이트
        let hintImageBox = document.getElementById(`hint-image-${currentRow}-${i}`);
        if (hintImageBox) {
            import('./hints.js').then(hintsModule => {
                let hintData = hintsModule.getDataFromEmote(letterEmotes[i]);
                if (hintData && hintData.length > 5) {
                    hintImageBox.style.backgroundImage = `url(${hintData[5]})`; // DATA_IMAGE index
                    if (hintData.length > 6) {
                        hintImageBox.classList.add(hintData[6]); // DATA_REVEAL index
                    }
                }
            });
        }
    }

    // 행 애니메이션 (수동 입력인 경우)
    if (manual) {
        animateRow(currentRow, 'submit');
    }
    
    console.log(`📝 보드 업데이트: 행 ${currentRow}, 추측 "${guessString}"`);
}

/**
 * 도움말 포인터 표시
 */
export function showHelpPointer(name, positionX, positionY) {
    let pointer = document.getElementById(`help-pointer-${name}`);
    
    if (!pointer) {
        pointer = document.createElement("div");
        pointer.id = `help-pointer-${name}`;
        pointer.className = "help-pointer";
        document.body.appendChild(pointer);
    }

    pointer.style.left = positionX + "px";
    pointer.style.top = positionY + "px";
    pointer.style.display = "block";
    
    // 자동 숨기기
    setTimeout(() => {
        hideHelpPointer(name);
    }, 5000);
}

/**
 * 요소에 도움말 포인터 표시
 */
export function showHelpPointerOnElement(name, element) {
    if (!element) return;

    let rect = element.getBoundingClientRect();
    let positionX = rect.left + rect.width / 2;
    let positionY = rect.top - 50; // 요소 위에 표시

    showHelpPointer(name, positionX, positionY);
}

/**
 * 도움말 포인터 숨기기
 */
export function hideHelpPointer(name) {
    let pointer = document.getElementById(`help-pointer-${name}`);
    if (pointer) {
        pointer.style.display = "none";
    }
}

/**
 * 필요시 도움말 포인터들 표시
 */
export function showHelpPointersIfNeeded() {
    import('./storage.js').then(storage => {
        // 제출 키 도움말
        if (!storage.sd_seenSubmit[0]) {
            let submitKey = document.getElementById("submit-key");
            if (submitKey) {
                showHelpPointerOnElement("submit-key", submitKey);
            }
        }

        // 힌트 버튼 도움말 (힌트 기능이 있는 경우)
        if (storage.sd_seenHint && !storage.sd_seenHint[0]) {
            let hintButton = document.getElementById("hint-button");
            if (hintButton) {
                showHelpPointerOnElement("hint-button", hintButton);
            }
        }
    });
}

/**
 * 제출 포인터 표시 (필요시)
 */
export function showSubmitPointerIfNeeded() {
    import('./storage.js').then(storage => {
        if (!storage.sd_seenSubmit[0] && g_currentGuess.length === MAX_LETTERS) {
            let submitKey = document.getElementById("submit-key");
            if (submitKey) {
                showHelpPointerOnElement("submit-key", submitKey);
            }
        }
    });
}

/**
 * 게임 오버 화면 표시
 */
export function showGameOver(messages, manual = false) {
    let gameOverElement = document.getElementById("game-over");
    
    if (!gameOverElement) {
        gameOverElement = document.createElement("div");
        gameOverElement.id = "game-over";
        gameOverElement.className = "game-over-modal";
        document.body.appendChild(gameOverElement);
    }

    removeAllChildren(gameOverElement);

    // 메시지 표시
    import('./ui-helpers.js').then(uiHelpers => {
        uiHelpers.fillInChatMessages(messages, gameOverElement);
        
        // 공유 버튼들 (연습 게임이 아닌 경우)
        import('./game-core.js').then(gameCore => {
            if (!gameCore.g_isPracticeGame) {
                uiHelpers.fillInShareLinks(gameOverElement);
            }
        });

        // 까치 버튼 (가능한 경우)
        import('./magpie.js').then(magpie => {
            if (magpie.canCreateMagpie()) {
                uiHelpers.fillInLink("🐦 까치 만들기", () => {
                    magpie.setMagpieButton("🐦");
                }, gameOverElement);
            }
        });

        // 닫기 버튼
        uiHelpers.fillInLink("닫기", () => {
            gameOverElement.style.display = "none";
        }, gameOverElement);
    });

    gameOverElement.style.display = "flex";
    gameOverElement.scrollTop = 0;
    
    console.log('🏁 게임 오버 화면 표시');
}

/**
 * 모든 자식 요소 제거
 */
function removeAllChildren(element) {
    if (element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }
}

/**
 * 게임 보드 초기화
 */
export function initializeBoard() {
    console.log('🎮 게임 보드 초기화 시작');
    
    // 보드 레이아웃 생성 (DOM이 없는 환경에서는 스킵)
    if (typeof document !== 'undefined') {
        createDynamicBoardLayout();
        clearBoardDisplay();
    }
    
    console.log('✅ 게임 보드 초기화 완료');
}