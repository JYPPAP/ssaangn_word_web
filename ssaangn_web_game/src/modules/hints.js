/**
 * 힌트 시스템 모듈
 * 게임 힌트 생성, 표시, 관리를 담당합니다.
 */

import {
    DATA_MATCH,
    DATA_SIMILAR, 
    DATA_MANY,
    DATA_EXISTS,
    DATA_OPPOSITE,
    DATA_NONE,
    EMOTE_MATCH,
    EMOTE_SIMILAR,
    EMOTE_MANY,
    EMOTE_EXISTS,
    EMOTE_OPPOSITE,
    EMOTE_NONE,
    DATA_EMOTE,
    DATA_NAME,
    DATA_COLOR,
    DATA_DESCRIPTION
} from './constants.js';

// 힌트 상태 변수들
export let g_hintsRemaining = 1;
export let g_hintList = [];

/**
 * 이모지로부터 힌트 데이터 가져오기
 */
export function getDataFromEmote(emote) {
    switch (emote) {
        case EMOTE_MATCH: return DATA_MATCH;
        case EMOTE_SIMILAR: return DATA_SIMILAR;
        case EMOTE_MANY: return DATA_MANY;
        case EMOTE_EXISTS: return DATA_EXISTS;
        case EMOTE_OPPOSITE: return DATA_OPPOSITE;
        case EMOTE_NONE: return DATA_NONE;
        default: return null;
    }
}

/**
 * 랜덤 색상 힌트 제공
 */
export function giveRandomShadeHint() {
    if (g_hintsRemaining <= 0) {
        return false;
    }

    // 사용 가능한 힌트 이모지들
    const availableHints = [
        EMOTE_MATCH, EMOTE_SIMILAR, EMOTE_MANY, 
        EMOTE_EXISTS, EMOTE_OPPOSITE, EMOTE_NONE
    ];

    // 랜덤 힌트 선택
    let randomIndex = Math.floor(Math.random() * availableHints.length);
    let selectedHint = availableHints[randomIndex];
    
    return giveShadeHint(selectedHint, false);
}

/**
 * 특정 색상 힌트 제공
 */
export function giveShadeHint(hint, manual = false) {
    if (!manual && g_hintsRemaining <= 0) {
        return false;
    }

    let hintData = getDataFromEmote(hint);
    if (!hintData) {
        return false;
    }

    // 힌트 사용
    if (!manual) {
        g_hintsRemaining--;
    }

    // 힌트 표시
    showHintNotification(hintData);
    
    // 힌트 기록
    g_hintList.push({
        emote: hint,
        timestamp: Date.now(),
        manual: manual
    });

    return true;
}

/**
 * 힌트 알림 표시
 */
function showHintNotification(hintData) {
    let notification = document.createElement('div');
    notification.className = 'hint-notification';
    notification.innerHTML = `
        <div class="hint-icon" style="background-color: ${hintData[DATA_COLOR]}">
            ${hintData[DATA_EMOTE]}
        </div>
        <div class="hint-content">
            <div class="hint-title">${hintData[DATA_NAME]}</div>
            <div class="hint-description">${hintData[DATA_DESCRIPTION]}</div>
        </div>
    `;

    // 알림 표시
    document.body.appendChild(notification);
    
    // 애니메이션
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // 자동 제거
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

/**
 * 힌트 모달 표시
 */
export function showHint(boxElement) {
    if (!boxElement) return;

    let modal = document.getElementById('hint-modal');
    if (!modal) {
        createHintModal();
        modal = document.getElementById('hint-modal');
    }

    // 모든 힌트 설명 표시
    let content = modal.querySelector('.hint-content');
    if (content) {
        content.innerHTML = `
            <h3>힌트 가이드</h3>
            <div class="hint-guide">
                ${generateHintGuideHTML()}
            </div>
            <div class="hint-actions">
                <button onclick="closeHint()" class="btn-secondary">닫기</button>
                <button onclick="giveRandomShadeHint()" class="btn-primary" ${g_hintsRemaining <= 0 ? 'disabled' : ''}>
                    힌트 사용 (${g_hintsRemaining}개 남음)
                </button>
            </div>
        `;
    }

    modal.style.display = 'block';
    modal.classList.add('show');
}

/**
 * 힌트 가이드 HTML 생성
 */
function generateHintGuideHTML() {
    const hints = [DATA_MATCH, DATA_SIMILAR, DATA_MANY, DATA_EXISTS, DATA_OPPOSITE, DATA_NONE];
    
    return hints.map(hintData => `
        <div class="hint-item">
            <div class="hint-emoji" style="background-color: ${hintData[DATA_COLOR]}">
                ${hintData[DATA_EMOTE]}
            </div>
            <div class="hint-info">
                <div class="hint-name">${hintData[DATA_NAME]}</div>
                <div class="hint-desc">${hintData[DATA_DESCRIPTION]}</div>
            </div>
        </div>
    `).join('');
}

/**
 * 힌트 설명 모달
 */
export function explainHint(icon) {
    let hintData = getDataFromEmote(icon);
    if (!hintData) return;

    let modal = document.getElementById('hint-explain-modal');
    if (!modal) {
        createHintExplainModal();
        modal = document.getElementById('hint-explain-modal');
    }

    let content = modal.querySelector('.explain-content');
    if (content) {
        content.innerHTML = `
            <div class="explain-header">
                <div class="explain-icon" style="background-color: ${hintData[DATA_COLOR]}">
                    ${hintData[DATA_EMOTE]}
                </div>
                <h3>${hintData[DATA_NAME]}</h3>
            </div>
            <div class="explain-description">
                ${hintData[DATA_DESCRIPTION]}
            </div>
            <div class="explain-actions">
                <button onclick="closeHintExplain()" class="btn-primary">확인</button>
            </div>
        `;
    }

    modal.style.display = 'block';
    modal.classList.add('show');
}

/**
 * 힌트 모달 생성
 */
function createHintModal() {
    let modal = document.createElement('div');
    modal.id = 'hint-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-backdrop" onclick="closeHint()"></div>
        <div class="modal-container">
            <div class="hint-content"></div>
        </div>
    `;
    document.body.appendChild(modal);
}

/**
 * 힌트 설명 모달 생성
 */
function createHintExplainModal() {
    let modal = document.createElement('div');
    modal.id = 'hint-explain-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-backdrop" onclick="closeHintExplain()"></div>
        <div class="modal-container">
            <div class="explain-content"></div>
        </div>
    `;
    document.body.appendChild(modal);
}

/**
 * 힌트 모달 닫기
 */
export function closeHint() {
    let modal = document.getElementById('hint-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

/**
 * 힌트 설명 모달 닫기
 */
export function closeHintExplain() {
    let modal = document.getElementById('hint-explain-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

/**
 * 힌트 색상으로 키보드 색칠
 */
export function colorKeyboardFromClues(clues) {
    if (!clues || clues.length === 0) return;

    import('./keyboard.js').then(keyboard => {
        clues.forEach(clue => {
            if (clue.letter && clue.hint) {
                let hintData = getDataFromEmote(clue.hint);
                if (hintData) {
                    keyboard.shadeKeyBoard(clue.letter, hintData[DATA_COLOR]);
                }
            }
        });
    });
}

/**
 * 힌트 상태 리셋
 */
export function resetHints() {
    g_hintsRemaining = 1;
    g_hintList = [];
}

/**
 * 사용된 힌트 기록 가져오기
 */
export function getHintHistory() {
    return [...g_hintList];
}

/**
 * 남은 힌트 개수 가져오기
 */
export function getRemainingHints() {
    return g_hintsRemaining;
}

/**
 * 힌트 개수 설정
 */
export function setRemainingHints(count) {
    g_hintsRemaining = Math.max(0, count);
}

// 전역 함수로 등록 (HTML onclick에서 사용)
window.closeHint = closeHint;
window.closeHintExplain = closeHintExplain;
window.giveRandomShadeHint = giveRandomShadeHint;
window.explainHint = explainHint;