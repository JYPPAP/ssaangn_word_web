/**
 * 게임 보드 관리 모듈
 * 게임 보드의 생성, 업데이트, 렌더링을 담당합니다.
 */

import { NUMBER_OF_GUESSES, MAX_LETTERS } from './constants';

// 타입 정의
interface CellState {
    letter: string;
    classes: string[];
    innerHTML: string;
}

type RowState = CellState[];
type BoardState = RowState[];
import { 
    g_currentGuess, 
    g_nextLetter, 
    g_boardState, 
    g_guessesRemaining,
    setBoardState,
    isCharacterAllWrong 
} from './game-core';

/**
 * 게임 보드 레이아웃 생성
 */
export function createBoardLayout(): void {
    const board = document.getElementById("game-board");
    if (!board) return;

    board.innerHTML = ""; // 기존 내용 제거

    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        const row = document.createElement("div");
        row.className = "letter-row";
        row.id = `letter-row-${i}`;

        for (let j = 0; j < MAX_LETTERS; j++) {
            const box = document.createElement("div");
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


// Removed unused fillRowWithGuess function

/**
 * 현재 추측을 보드에 표시
 */
export function updateCurrentGuessDisplay(): void {
    const currentRow = getCurrentLetterRow();
    
    for (let i = 0; i < MAX_LETTERS; i++) {
        const box = document.getElementById(`letter-${currentRow}-${i}`);
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
export function updateWrongBoxStatus(box: HTMLElement | null): void {
    if (!box) return;

    const letter = box.textContent;
    if (letter && isCharacterAllWrong(letter)) {
        box.classList.add("all-wrong");
    } else {
        box.classList.remove("all-wrong");
    }
}

/**
 * 보드 상태 저장
 */
export function saveBoardState(): void {
    // 현재 보드 상태를 g_boardState에 저장
    const newBoardState: BoardState = [];
    
    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        const rowState: RowState = [];
        for (let j = 0; j < MAX_LETTERS; j++) {
            const box = document.getElementById(`letter-${i}-${j}`);
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
export function restoreBoardState(): void {
    if (!g_boardState || g_boardState.length === 0) return;

    for (let i = 0; i < g_boardState.length && i < NUMBER_OF_GUESSES; i++) {
        for (let j = 0; j < g_boardState[i].length && j < MAX_LETTERS; j++) {
            const box = document.getElementById(`letter-${i}-${j}`);
            if (box && g_boardState[i][j]) {
                const state = g_boardState[i][j];
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
export function animateRow(rowIndex: number, animationType: string = "flip"): void {
    for (let j = 0; j < MAX_LETTERS; j++) {
        const box = document.getElementById(`letter-${rowIndex}-${j}`);
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
export function highlightRow(rowIndex: number, highlight: boolean = true): void {
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
export function showValidationFeedback(isValid: boolean): void {
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
            box.onclick = () => {
                // TODO: Implement hints functionality when available
                console.log('Hint clicked for box:', box);
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

            // TODO: Implement UI helpers functionality
            // Display messages
            messages.forEach(message => {
                const messageEl = document.createElement('p');
                messageEl.textContent = message[0];
                welcomeBox.appendChild(messageEl);
            });
            
            // 레이스 시작 버튼
            const startButton = document.createElement('button');
            startButton.textContent = "보물찾기 시작!";
            startButton.onclick = () => {
                // TODO: Implement race mode when available
                closeWelcomeBox();
            };
            welcomeBox.appendChild(startButton);

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

            // TODO: Implement UI helpers functionality
            // Display messages
            messages.forEach(message => {
                const messageEl = document.createElement('p');
                messageEl.textContent = message[0];
                welcomeBox.appendChild(messageEl);
            });
            
            // 시작하기 버튼
            const startButton = document.createElement('button');
            startButton.textContent = "시작하기";
            startButton.onclick = closeWelcomeBox;
            welcomeBox.appendChild(startButton);

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
export function fillInPreviousGuesses(guessesString: string, hintsString: string): void {
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
                    
                    // TODO: Implement hint color mapping when hints module is available
                    // For now, use a basic color mapping based on emoji
                    const emojiColorMap: Record<string, string> = {
                        '🥕': '#4CAF50', // green
                        '🍄': '#FF9800', // orange  
                        '🧄': '#9C27B0', // purple
                        '🍆': '#2196F3', // blue
                        '🍌': '#FFEB3B', // yellow
                        '🍎': '#F44336'  // red
                    };
                    hintBox.style.backgroundColor = emojiColorMap[hint[j]] || '#9E9E9E';
                }
            }
        }
    }
    
    console.log(`🔄 이전 추측 복원: ${guesses.length}개 행`);
}

/**
 * 보드에 추측과 힌트 업데이트
 */
export function updateBoardWithGuess(guessString: string, letterColors: string[], letterEmotes: string[], manual: boolean = false): void {
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
            // TODO: Implement hint data processing when hints module is available
            hintImageBox.style.backgroundColor = letterColors[i];
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
export function showHelpPointer(name: string, positionX: number, positionY: number): void {
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
export function showHelpPointerOnElement(name: string, element: HTMLElement): void {
    if (!element) return;

    let rect = element.getBoundingClientRect();
    let positionX = rect.left + rect.width / 2;
    let positionY = rect.top - 50; // 요소 위에 표시

    showHelpPointer(name, positionX, positionY);
}

/**
 * 도움말 포인터 숨기기
 */
export function hideHelpPointer(name: string): void {
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

        // TODO: Implement hint functionality when available
        // if (storage.sd_seenHint && !storage.sd_seenHint[0]) {
        //     let hintButton = document.getElementById("hint-button");
        //     if (hintButton) {
        //         showHelpPointerOnElement("hint-button", hintButton);
        //     }
        // }
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
export function showGameOver(messages: string[][], _manual: boolean = false): void {
    let gameOverElement = document.getElementById("game-over");
    
    if (!gameOverElement) {
        gameOverElement = document.createElement("div");
        gameOverElement.id = "game-over";
        gameOverElement.className = "game-over-modal";
        document.body.appendChild(gameOverElement);
    }

    removeAllChildren(gameOverElement);

    // 메시지 표시
    messages.forEach(message => {
        const messageEl = document.createElement('p');
        messageEl.textContent = message[0];
        gameOverElement.appendChild(messageEl);
    });
    
    // 공유 버튼들 (연습 게임이 아닌 경우)
    import('./game-core').then(gameCore => {
        if (!gameCore.g_isPracticeGame) {
            // TODO: Implement share functionality
            const shareButton = document.createElement('button');
            shareButton.textContent = "공유하기";
            gameOverElement.appendChild(shareButton);
        }
    });

    // 까치 버튼 (가능한 경우)
    // TODO: Implement magpie functionality when available
    
    // 닫기 버튼
    const closeButton = document.createElement('button');
    closeButton.textContent = "닫기";
    closeButton.onclick = () => {
        gameOverElement.style.display = "none";
    };
    gameOverElement.appendChild(closeButton);

    gameOverElement.style.display = "flex";
    gameOverElement.scrollTop = 0;
    
    console.log('🏁 게임 오버 화면 표시');
}

/**
 * 모든 자식 요소 제거
 */
function removeAllChildren(element: HTMLElement | null): void {
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