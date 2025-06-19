/**
 * 스토리 모드 모듈
 * 게임 내 스토리 시스템, 챕터 관리, 잠금 해제 기능을 담당합니다.
 */

import { 
    STORY_TEXT,
    STORY_CHAPTERS,
    STORY_PICS,
    EMOTE_MEDAL_COPPER
} from './constants.js';
import * as helper from './helper_tools.js';
import { 
    sd_storiesUnlocked,
    sd_storiesRead
} from './storage.js';

/**
 * 스토리 선택 화면 표시
 */
export function showStorySelect() {
    let storySelect = document.getElementById("story-select");
    if (!storySelect) {
        createStorySelectElement();
        storySelect = document.getElementById("story-select");
    }
    
    helper.removeAllChildren(storySelect);
    storySelect.style.display = "flex";

    // 배경 요소
    let storySelectBackground = document.createElement("div");
    storySelectBackground.className = "day-review-background";
    storySelectBackground.classList.add("spin");
    storySelectBackground.classList.add("no-click");
    storySelect.appendChild(storySelectBackground);

    // 챕터 표시 영역
    let chapterDisplay = document.createElement("div");
    chapterDisplay.className = "collection-display";
    storySelect.appendChild(chapterDisplay);

    generateChapterCovers(chapterDisplay);
}

/**
 * 챕터 커버들 생성
 */
function generateChapterCovers(container) {
    let totalStories = 0;
    
    for (let i = 0; i < STORY_CHAPTERS.length; i++) {
        // 잠금 해제 여부 확인
        if (!(sd_storiesUnlocked[0] > totalStories || sd_storiesRead[0] == totalStories)) {
            break;
        }

        let isLocked = false;
        if (STORY_CHAPTERS[i][2] != "") {
            isLocked = !hasUnlockable(STORY_CHAPTERS[i][2]);
        }

        let chapterCover = createChapterCover(i, isLocked);
        container.appendChild(chapterCover);

        totalStories += STORY_CHAPTERS[i][0];
    }

    // 닫기 버튼 추가
    let closeButton = document.createElement("button");
    closeButton.className = "story-close-btn";
    closeButton.textContent = "닫기";
    closeButton.onclick = closeStorySelect;
    container.appendChild(closeButton);
}

/**
 * 챕터 커버 생성
 */
function createChapterCover(chapterIndex, isLocked) {
    let chapterCover = document.createElement("div");
    chapterCover.className = "chapter-cover";
    
    if (chapterIndex % 3 == 0 && chapterIndex != 0) {
        chapterCover.classList.add("startrow-margin");
    }
    
    chapterCover.style.backgroundImage = `url(chapter${chapterIndex + 1}.png)`;

    if (isLocked) {
        addUnlockablePricing(chapterCover, chapterIndex);
    } else {
        chapterCover.onclick = () => showStoryBook(chapterIndex);
    }

    return chapterCover;
}

/**
 * 잠금 해제 가격 표시 추가
 */
function addUnlockablePricing(chapterCover, chapterIndex) {
    let viableCost = calculateViableCost(6);
    let coinList = [];

    // 구리 코인
    for (let coin = 0; coin < viableCost[2]; coin++) {
        let copperCoin = document.createElement("div");
        copperCoin.className = "day-review-name";
        copperCoin.classList.add("score-copper");
        copperCoin.classList.add("score-price");
        copperCoin.textContent = "값";
        chapterCover.appendChild(copperCoin);
        coinList.push(copperCoin);
    }

    // 은 코인
    for (let coin = 0; coin < viableCost[1]; coin++) {
        let silverCoin = document.createElement("div");
        silverCoin.className = "day-review-name";
        silverCoin.classList.add("score-silver");
        silverCoin.classList.add("score-price");
        silverCoin.textContent = "값";
        chapterCover.appendChild(silverCoin);
        coinList.push(silverCoin);
    }

    // 금 코인
    for (let coin = 0; coin < viableCost[0]; coin++) {
        let goldCoin = document.createElement("div");
        goldCoin.className = "day-review-name";
        goldCoin.classList.add("score-gold");
        goldCoin.classList.add("score-price");
        goldCoin.textContent = "값";
        chapterCover.appendChild(goldCoin);
        coinList.push(goldCoin);
    }

    chapterCover.onclick = () => {
        if (addUnlockable(STORY_CHAPTERS[chapterIndex][2], viableCost[0], viableCost[1], viableCost[2])) {
            sd_storiesUnlocked[0]++;
            helper.setStoredDataValue(sd_storiesUnlocked);
            showStoryBook(chapterIndex);
        } else {
            // 구매 실패 시 코인 애니메이션
            for (let coin of coinList) {
                restartAnimationViaDup(coin, "plump");
            }
            // 메달 부족 알림
            import('./hints.js').then(hints => {
                hints.explainHint(EMOTE_MEDAL_COPPER);
            });
        }
    };
}

/**
 * 스토리북 표시
 */
export function showStoryBook(chapter) {
    // 스토리 선택 화면 숨기기
    let storySelect = document.getElementById("story-select");
    if (storySelect && storySelect.style.display == "flex") {
        storySelect.style.display = "none";
    }

    let storyBook = document.getElementById("story-book");
    if (!storyBook) {
        createStoryBookElement();
        storyBook = document.getElementById("story-book");
    }

    helper.removeAllChildren(storyBook);

    // 스토리 내용 생성
    let messages = generateStoryMessages(chapter);
    let storyContent = generateStoryContent(chapter);
    
    messages.push(storyContent);

    // 스토리 표시
    fillInChatMessages(messages, storyBook);
    fillInLink("닫기", closeStoryBook, storyBook);

    storyBook.style.display = "flex";
    storyBook.scrollTop = 0;

    // 다른 UI 요소들 숨기기
    hideOtherUIElements();

    // 스토리 읽기 기록 업데이트
    updateStoryReadProgress(chapter);
}

/**
 * 스토리 메시지 생성
 */
function generateStoryMessages(chapter) {
    let messages = [];
    
    if (chapter == 0) {
        messages.push(["이야기 해 주실래요?"]);
    } else {
        messages.push([`${chapter + 1}화 이야기를 해 주실래요?`]);
    }
    
    return messages;
}

/**
 * 스토리 내용 생성
 */
function generateStoryContent(chapter) {
    let currentChapter = 0;
    let currentPart = 0;
    let storybook = [];
    let storiesToDisplay = sd_storiesUnlocked[0];
    let storyPic = 0;
    let readUpTo = 0;

    for (readUpTo; readUpTo < storiesToDisplay && readUpTo < STORY_TEXT.length; ++readUpTo) {
        currentPart++;
        
        if (currentPart > STORY_CHAPTERS[currentChapter][0]) {
            currentPart = 1;
            currentChapter++;
        }

        if (currentChapter < chapter) {
            // 이미지 건너뛰기
            while (storyPic < STORY_PICS.length && STORY_PICS[storyPic][0] == readUpTo) {
                storyPic++;
            }
            continue;
        }

        // 챕터 시작 이미지
        if (currentPart == 1) {
            storybook.push(`<img src='chapter${currentChapter + 1}.png' class='reply-image'>`);
        }

        // 스토리 텍스트
        storybook.push(`[${currentPart}/${STORY_CHAPTERS[currentChapter][0]}] ${STORY_TEXT[readUpTo]}`);

        // 스토리 이미지들
        while (storyPic < STORY_PICS.length && STORY_PICS[storyPic][0] == readUpTo) {
            storybook.push(STORY_PICS[storyPic][1]);
            storyPic++;
        }

        // 챕터 완료 확인
        if (currentPart == STORY_CHAPTERS[currentChapter][0]) {
            readUpTo++;
            break;
        }
    }

    // 계속하기 메시지
    if (currentPart < STORY_CHAPTERS[currentChapter][0]) {
        storybook.push("이야기를 다 알고 싶으신다면 또 이겨주세요!");
    } else {
        if (currentChapter < STORY_CHAPTERS.length - 1) {
            storybook.push(`여기서 끝이 아니죠! ${currentChapter + 2}화를 보고 싶으신다면 또 이겨주세요!`);
        } else {
            storybook.push("끝!");
        }
    }

    return storybook;
}

/**
 * 스토리북 닫기
 */
export function closeStoryBook() {
    let storyBook = document.getElementById("story-book");
    if (storyBook) {
        storyBook.style.display = "none";
    }
}

/**
 * 스토리 선택 닫기
 */
export function closeStorySelect() {
    let storySelect = document.getElementById("story-select");
    if (storySelect) {
        storySelect.style.display = "none";
    }
}

/**
 * 스토리 읽기 진행도 업데이트
 */
function updateStoryReadProgress(chapter) {
    let currentProgress = sd_storiesRead[0];
    let chapterStart = 0;
    
    for (let i = 0; i < chapter; i++) {
        chapterStart += STORY_CHAPTERS[i][0];
    }
    
    let newProgress = Math.max(currentProgress, chapterStart + STORY_CHAPTERS[chapter][0]);
    
    if (newProgress > sd_storiesRead[0]) {
        sd_storiesRead[0] = newProgress;
        helper.setStoredDataValue(sd_storiesRead);
    }
}

/**
 * 다른 UI 요소들 숨기기
 */
function hideOtherUIElements() {
    // 도움말 포인터 숨기기
    import('./game-board.js').then(gameBoard => {
        // hideHelpPointer("");
    });

    // 규칙 박스 숨기기
    let rulesBox = document.getElementById("rules-box");
    if (rulesBox) {
        rulesBox.style.display = "none";
    }

    // 설정 박스 숨기기
    let settingsBox = document.getElementById("settings-box");
    if (settingsBox) {
        settingsBox.style.display = "none";
    }
}

/**
 * 스토리 선택 요소 생성
 */
function createStorySelectElement() {
    let storySelect = document.createElement("div");
    storySelect.id = "story-select";
    storySelect.className = "story-select-modal";
    storySelect.style.display = "none";
    document.body.appendChild(storySelect);
}

/**
 * 스토리북 요소 생성
 */
function createStoryBookElement() {
    let storyBook = document.createElement("div");
    storyBook.id = "story-book";
    storyBook.className = "story-book-modal";
    storyBook.style.display = "none";
    document.body.appendChild(storyBook);
}

/**
 * 스토리 완료 여부 확인
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
 * 현재 스토리 진행도 가져오기
 */
export function getStoryProgress() {
    return {
        storiesUnlocked: sd_storiesUnlocked[0],
        storiesRead: sd_storiesRead[0],
        totalChapters: STORY_CHAPTERS.length,
        totalStories: STORY_TEXT.length
    };
}

/**
 * 다음 잠금 해제할 스토리 가져오기
 */
export function getNextUnlockableStory() {
    let totalUnlocked = 0;
    
    for (let i = 0; i < STORY_CHAPTERS.length; i++) {
        totalUnlocked += STORY_CHAPTERS[i][0];
        
        if (sd_storiesUnlocked[0] < totalUnlocked) {
            return {
                chapterIndex: i,
                chapterTitle: STORY_CHAPTERS[i][1],
                requiredStories: totalUnlocked
            };
        }
    }
    
    return null; // 모든 스토리 잠금 해제됨
}

// 임시 함수들 (실제로는 다른 모듈에서 가져와야 함)
function hasUnlockable(unlockableId) {
    // 실제 구현 필요
    return Math.random() > 0.5; // 임시
}

function calculateViableCost(cost) {
    // 실제 구현 필요
    return [1, 2, 3]; // [금, 은, 구리] 임시
}

function addUnlockable(unlockableId, gold, silver, copper) {
    // 실제 구현 필요
    return Math.random() > 0.3; // 임시
}

function restartAnimationViaDup(element, animationName) {
    if (element) {
        element.classList.remove(animationName);
        void element.offsetWidth; // 리플로우 강제 실행
        element.classList.add(animationName);
    }
}

function fillInChatMessages(messages, container) {
    // 실제 구현 필요
    let content = messages.flat().join('<br>');
    container.innerHTML = content;
}

function fillInLink(text, callback, container) {
    let link = document.createElement("button");
    link.textContent = text;
    link.onclick = callback;
    link.className = "story-link-btn";
    container.appendChild(link);
}

// 전역 함수로 등록
window.showStorySelect = showStorySelect;
window.showStoryBook = showStoryBook;
window.closeStoryBook = closeStoryBook;