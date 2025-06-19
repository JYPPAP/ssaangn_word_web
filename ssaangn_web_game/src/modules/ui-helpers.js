/**
 * UI 헬퍼 함수들 모듈
 * 채팅 메시지, 링크, 공유, 클립보드, 애니메이션 등 UI 관련 유틸리티를 담당합니다.
 */

import { 
    CLIPBOARD_STYLE_EMOTE,
    CLIPBOARD_STYLE_SPOIL,
    EMOTE_CREATE_MAGPIE,
    EMOTE_SPOILERS,
    EMOTE_WORDS,
    EMOTE_GLOBAL_SCORES 
} from './constants.js';

/**
 * 채팅 메시지들을 요소에 채우기
 */
export function fillInChatMessages(messages, element) {
    if (!element) return;

    for (let i = 0; i < messages.length; i++) {
        let section = document.createElement("div");
        section.className = i % 2 == 0 ? "chat-right" : "chat-left";

        for (let j = 0; j < messages[i].length; j++) {
            let bubble = document.createElement("div");
            bubble.className = i % 2 == 0 ? "chat-bubble" : "reply-bubble";
            
            if (messages[i][j].startsWith("<")) {
                // HTML 내용
                bubble.innerHTML = messages[i][j];
                bubble.style.backgroundColor = "rgba(0,0,0,0)";
                bubble.style.padding = "0px";
            } else if (messages[i][j].startsWith("⏰") || messages[i][j].startsWith(EMOTE_CREATE_MAGPIE)) {
                // 특별한 메시지 (시간, 까치 등)
                bubble.innerHTML = messages[i][j];
                bubble.style.backgroundColor = "rgb(255, 169, 167)";
                bubble.style.border = "2px solid rgb(248, 49, 47)";
            } else {
                // 일반 텍스트
                bubble.textContent = messages[i][j];
            }

            section.appendChild(bubble);
        }

        element.appendChild(section);
    }
}

/**
 * 입력 박스 채우기
 */
export function fillInEntryBox(text, entryBoxId, element) {
    if (!element) return;

    let section = document.createElement("div");
    section.className = "chat-right";

    let bubble = document.createElement("input");
    bubble.id = entryBoxId;
    bubble.className = "chat-bubble";
    bubble.placeholder = text;
    bubble.textContent = text;
    bubble.style.backgroundColor = "rgb(50, 50, 150)";
    bubble.style.marginBottom = "-8px";

    section.appendChild(bubble);
    element.appendChild(section);
}

/**
 * 왼쪽 링크 채우기
 */
export function fillInLeftLink(text, url, element) {
    if (!element) return;

    let section = document.createElement("div");
    section.className = "chat-left";

    let bubble = document.createElement("div");
    bubble.className = "reply-bubble";
    bubble.textContent = text;
    bubble.classList.add("is-link");
    bubble.onclick = () => { window.open(url); };

    section.appendChild(bubble);
    element.appendChild(section);
}

/**
 * 링크 채우기
 */
export function fillInLink(text, func, element, clickReplace) {
    if (!element) return;

    let section = document.createElement("div");
    section.className = "chat-right";

    let bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    bubble.textContent = text;
    bubble.classList.add("is-link");

    if (clickReplace == undefined) {
        bubble.onclick = func;
    } else {
        bubble.onclick = () => {
            bubble.textContent = clickReplace;
            bubble.classList.remove("is-link");
            func();
            bubble.onclick = null;
        };
    }

    section.appendChild(bubble);
    element.appendChild(section);
}

/**
 * 기본 공유 링크들 채우기
 */
export function fillInShareLinksBasic(element) {
    if (!element) return;

    let section = document.createElement("div");
    section.className = "chat-choice";

    // 기본 공유 버튼
    let shareButton = document.createElement("div");
    shareButton.className = "chat-bubble choice-bubble";
    shareButton.textContent = "공유하기";
    shareButton.classList.add("is-link");
    shareButton.onclick = () => shareClipboard();

    section.appendChild(shareButton);
    element.appendChild(section);
}

/**
 * 공유 링크들 채우기
 */
export function fillInShareLinks(element) {
    if (!element) return;

    let section = document.createElement("div");
    section.className = "chat-choice";

    // 이모지 공유
    let emojiShare = document.createElement("div");
    emojiShare.className = "chat-bubble choice-bubble";
    emojiShare.textContent = "🎯 이모지로 공유";
    emojiShare.classList.add("is-link");
    emojiShare.onclick = () => shareClipboard();
    section.appendChild(emojiShare);

    // 단어 공유
    let wordShare = document.createElement("div");
    wordShare.className = "chat-bubble choice-bubble";
    wordShare.textContent = `${EMOTE_WORDS} 단어 포함 공유`;
    wordShare.classList.add("is-link");
    wordShare.onclick = () => shareClipboardWords();
    section.appendChild(wordShare);

    // 글로벌 통계
    let globalStats = document.createElement("div");
    globalStats.className = "chat-bubble choice-bubble";
    globalStats.textContent = `${EMOTE_GLOBAL_SCORES} 글로벌 통계`;
    globalStats.classList.add("is-link");
    globalStats.onclick = () => {
        import('./statistics.js').then(stats => {
            stats.toggleGlobalStats();
        });
    };
    section.appendChild(globalStats);

    element.appendChild(section);
}

/**
 * 클립보드 공유
 */
export function shareClipboard() {
    shareClipboardInternal(CLIPBOARD_STYLE_EMOTE);
}

/**
 * 단어 포함 클립보드 공유
 */
export function shareClipboardWords() {
    shareClipboardInternal(CLIPBOARD_STYLE_SPOIL);
}

/**
 * 클립보드 공유 내부 구현
 */
export function shareClipboardInternal(clipboardStyle) {
    import('./game-core.js').then(gameCore => {
        let gameStamp = getCurrentDateStamp();
        let allGuesses = "";
        let scoreText = "";

        // 게임 결과에 따른 텍스트 생성
        if (gameCore.isGameWon()) {
            let attempts = gameCore.g_attempts || 0;
            scoreText = clipboardStyle == CLIPBOARD_STYLE_EMOTE ? 
                getScoreEmoji(attempts) : `${attempts}번만에 성공`;

            // 추측들 수집
            allGuesses = collectGuessesForSharing(clipboardStyle);
        } else {
            scoreText = clipboardStyle == CLIPBOARD_STYLE_EMOTE ? "🐯" : "실패";
        }

        let clipboardOutput = `쌍근 ${gameStamp}${scoreText}${allGuesses}  \nhttps://ssaangn.com`;

        // 까치 링크 추가 (필요시)
        import('./magpie.js').then(magpie => {
            if (magpie.canCreateMagpie()) {
                let searchLink = magpie.magpieSearchLink(gameCore.constructGuessString());
                clipboardOutput += "/" + searchLink;
            }
        });

        doClipboard(clipboardOutput);
    });
}

/**
 * 클립보드 표시용 변환
 */
export function makeClipboardDisplay(clipboardOutput) {
    return clipboardOutput.replaceAll("  \n", "&nbsp;&nbsp;<BR>");
}

/**
 * 클립보드에 복사 실행
 */
export function doClipboard(clipboardOutput) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(clipboardOutput).then(() => {
            console.log('클립보드에 복사됨');
            showClipboardSuccess();
        }).catch(err => {
            console.error('클립보드 복사 실패:', err);
            fallbackCopyToClipboard(clipboardOutput);
        });
    } else {
        fallbackCopyToClipboard(clipboardOutput);
    }
}

/**
 * 폴백 클립보드 복사
 */
function fallbackCopyToClipboard(text) {
    let textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        console.log('폴백으로 클립보드에 복사됨');
        showClipboardSuccess();
    } catch (err) {
        console.error('폴백 복사도 실패:', err);
        showClipboardError();
    }
    
    document.body.removeChild(textArea);
}

/**
 * 스포일러 순환
 */
export function cycleSpoilers() {
    let spoilerElements = document.querySelectorAll('.spoiler');
    spoilerElements.forEach(element => {
        if (element.classList.contains('revealed')) {
            element.classList.remove('revealed');
        } else {
            element.classList.add('revealed');
        }
    });
}

/**
 * 애니메이션 재시작
 */
export function restartAnimationViaDup(element, animationName) {
    if (!element) return;

    let parent = element.parentNode;
    let nextSibling = element.nextSibling;
    
    // 요소 제거
    parent.removeChild(element);
    
    // 리플로우 강제 실행
    void parent.offsetWidth;
    
    // 요소 다시 추가
    if (nextSibling) {
        parent.insertBefore(element, nextSibling);
    } else {
        parent.appendChild(element);
    }
    
    // 애니메이션 클래스 추가
    element.classList.add(animationName);
}

/**
 * 토스트 메시지 표시
 */
export function showToast(message, type = 'info', duration = 3000) {
    let toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // 스타일 적용
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        border-radius: 6px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    // 타입별 색상
    switch(type) {
        case 'success':
            toast.style.backgroundColor = '#4CAF50';
            break;
        case 'error':
            toast.style.backgroundColor = '#f44336';
            break;
        case 'warning':
            toast.style.backgroundColor = '#ff9800';
            break;
        default:
            toast.style.backgroundColor = '#2196F3';
    }
    
    document.body.appendChild(toast);
    
    // 애니메이션
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // 자동 제거
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
}

/**
 * 모달 표시
 */
export function showModal(title, content, buttons = []) {
    let modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-container">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="this.closest('.custom-modal').remove()">✕</button>
            </div>
            <div class="modal-content">
                ${content}
            </div>
            <div class="modal-actions">
                ${buttons.map(btn => 
                    `<button class="btn ${btn.class || 'btn-secondary'}" 
                             onclick="${btn.onclick || 'this.closest(\'.custom-modal\').remove()'}">${btn.text}</button>`
                ).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('show');
    }, 100);
    
    return modal;
}

/**
 * 에러 메시지 표시
 * @param {string} errorText - 표시할 에러 메시지
 */
export function showError(errorText) {
    showToast(errorText, 'error', 3000);
    console.error('Game Error:', errorText);
}

/**
 * 현재 날짜 스탬프 가져오기
 */
function getCurrentDateStamp() {
    let now = new Date();
    let month = now.getMonth() + 1;
    let date = now.getDate();
    return `${month}/${date} `;
}

/**
 * 점수 이모지 가져오기
 */
function getScoreEmoji(attempts) {
    if (attempts <= 2) return '🥇';
    if (attempts <= 4) return '🥈';
    if (attempts <= 6) return '🥉';
    return '🎯';
}

/**
 * 공유용 추측들 수집
 */
function collectGuessesForSharing(clipboardStyle) {
    // 실제 구현에서는 게임 보드에서 추측들을 수집
    return ""; // 임시
}

/**
 * 클립보드 성공 메시지
 */
function showClipboardSuccess() {
    showToast('클립보드에 복사되었습니다!', 'success');
}

/**
 * 클립보드 오류 메시지
 */
function showClipboardError() {
    showToast('클립보드 복사에 실패했습니다.', 'error');
}

/**
 * 로딩 스피너 표시
 */
export function showLoadingSpinner(message = '로딩 중...') {
    let spinner = document.createElement('div');
    spinner.id = 'loading-spinner';
    spinner.className = 'loading-overlay';
    spinner.innerHTML = `
        <div class="loading-content">
            <div class="spinner"></div>
            <div class="loading-message">${message}</div>
        </div>
    `;
    
    document.body.appendChild(spinner);
    return spinner;
}

/**
 * 로딩 스피너 숨기기
 */
export function hideLoadingSpinner() {
    let spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.remove();
    }
}

/**
 * 요소의 모든 자식 제거
 */
export function removeAllChildren(element) {
    if (element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }
}

// 전역 함수로 등록
window.shareClipboard = shareClipboard;
window.shareClipboardWords = shareClipboardWords;
window.cycleSpoilers = cycleSpoilers;