/**
 * 설정 및 테마 관리 모듈
 * 게임 설정, 테마 변경, 규칙 표시 등을 담당합니다.
 */

import { 
    THEME_DEFAULT,
    THEME_DARK,
    THEME_LIGHT,
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
    DATA_DESCRIPTION
} from './constants.js';
import * as helper from './helper_tools.js';
import { sd_settingTheme } from './storage.js';
import { fillInChatMessages, fillInLink, removeAllChildren } from './ui-helpers.js';

// 브라우저 감지
export let g_isSamsungBrowser = navigator.userAgent.match(/SamsungBrowser/i);

/**
 * 다크 모드 토글
 */
export function toggleDarkMode() {
    let isLight = (sd_settingTheme[0] == THEME_DEFAULT && !g_isSamsungBrowser) || sd_settingTheme[0] == THEME_LIGHT;
    
    if (isLight) {
        sd_settingTheme[0] = THEME_DARK;
        helper.setStoredDataValue(sd_settingTheme);
        
        let bodyElement = document.body;
        bodyElement.classList.remove("light-mode");
        bodyElement.classList.add("dark-mode");
    } else {
        sd_settingTheme[0] = THEME_LIGHT;
        helper.setStoredDataValue(sd_settingTheme);
        
        let bodyElement = document.body;
        bodyElement.classList.add("light-mode");
        bodyElement.classList.remove("dark-mode");
    }
    
    console.log('테마 변경:', isLight ? 'Dark' : 'Light');
}

/**
 * 테마 적용
 */
export function applyTheme(theme) {
    let bodyElement = document.body;
    
    // 기존 테마 클래스 제거
    bodyElement.classList.remove("light-mode", "dark-mode");
    
    switch (theme) {
        case THEME_LIGHT:
            bodyElement.classList.add("light-mode");
            break;
        case THEME_DARK:
            bodyElement.classList.add("dark-mode");
            break;
        case THEME_DEFAULT:
        default:
            // 브라우저에 따른 기본 테마
            if (g_isSamsungBrowser) {
                bodyElement.classList.add("dark-mode");
            }
            break;
    }
    
    sd_settingTheme[0] = theme;
    helper.setStoredDataValue(sd_settingTheme);
}

/**
 * 현재 테마 가져오기
 */
export function getCurrentTheme() {
    return sd_settingTheme[0];
}

/**
 * 라이트 모드 여부 확인
 */
export function isLightMode() {
    return (sd_settingTheme[0] == THEME_DEFAULT && !g_isSamsungBrowser) || sd_settingTheme[0] == THEME_LIGHT;
}

/**
 * 규칙 토글
 */
export function toggleRules() {
    // 다른 모달이 열려있는지 확인
    import('./statistics.js').then(statistics => {
        if (statistics.isBlockingDialogShowing()) {
            return;
        }
        
        let rulesBox = document.getElementById("rules-box");
        if (!rulesBox) {
            createRulesBox();
            rulesBox = document.getElementById("rules-box");
        }

        if (rulesBox.style.display != "flex") {
            showRules(rulesBox);
        } else {
            closeRules();
        }
    });
}

/**
 * 규칙 표시
 */
function showRules(rulesBox) {
    if (!rulesBox.firstChild) {
        removeAllChildren(rulesBox);

        let messages = [];
        messages.push(["규칙이 뭐예요?"]);
        messages.push([
            "1. 암호는\n2글자입니다", 
            "2. 7번의 시도안에 암호를 맞춰보세요", 
            "3. 추측한 자음과 모음에\n힌트가 주어집니다"
        ]);
        
        messages.push(["자음과 모음이 뭐예요?"]);
        messages.push([
            "자음~\nㄱㄴㄷㄹㅁㅂㅅ\nㅇㅈㅊㅋㅌㅍㅎ\nㄲㄸㅃㅆㅉ", 
            "모음~\nㅏㅐㅑㅒㅓㅔㅕ\nㅖㅗㅛㅜㅠㅡㅣ"
        ]);
        
        messages.push(["힌트들의 뜻이 뭐예요?"]);
        messages.push([
            "간단하게\n" + 
            EMOTE_MATCH + " 당연하죠~\n" + 
            EMOTE_SIMILAR + " 비슷해요~\n" + 
            EMOTE_MANY + " 많을 거예요~\n" + 
            EMOTE_EXISTS + " 가지고 있어요~\n" + 
            EMOTE_OPPOSITE + " 반대로요~\n" + 
            EMOTE_NONE + " 사과를 받아주세요~"
        ]);
        
        messages.push(["무슨 말이에요?"]);
        messages.push([
            DATA_MATCH[DATA_DESCRIPTION], 
            DATA_SIMILAR[DATA_DESCRIPTION], 
            DATA_MANY[DATA_DESCRIPTION], 
            DATA_EXISTS[DATA_DESCRIPTION], 
            DATA_OPPOSITE[DATA_DESCRIPTION], 
            DATA_NONE[DATA_DESCRIPTION]
        ]);
        
        messages.push(["보기가 있어요?"]);
        messages.push([
            "예를 들면\n'관계'라는 정답은\n" +
            "올해 🍆🍎\n" +
            "인사 🍆🍌\n" +
            "악보 🧄🍌\n" +
            "과일 🍄🍎\n" +
            "관점 🥕🍎\n" +
            "관계 🥕🥕"
        ]);

        fillInChatMessages(messages, rulesBox);
        fillInLink("닫기", closeRules, rulesBox);
    }

    rulesBox.style.display = "flex";
    rulesBox.scrollTop = 0;
    
    // 다른 UI 요소들 숨기기
    hideOtherUIElements();
}

/**
 * 규칙 박스 닫기
 */
export function closeRules() {
    let rulesBox = document.getElementById("rules-box");
    if (rulesBox) {
        rulesBox.style.display = "none";
    }
}

/**
 * 설정 박스 표시
 */
export function showSettings() {
    let settingsBox = document.getElementById("settings-box");
    if (!settingsBox) {
        createSettingsBox();
        settingsBox = document.getElementById("settings-box");
    }

    removeAllChildren(settingsBox);

    let messages = [];
    messages.push(["설정을 바꿔요?"]);
    
    // 설정 옵션들
    let settingsOptions = [];
    
    // 테마 설정
    let currentTheme = getCurrentTheme();
    let themeText = currentTheme === THEME_LIGHT ? "라이트 모드" : 
                   currentTheme === THEME_DARK ? "다크 모드" : "기본 테마";
    settingsOptions.push(`🎨 테마: ${themeText}`);
    
    // 사운드 설정 (임시)
    settingsOptions.push("🔊 사운드: 켜짐");
    
    // 애니메이션 설정 (임시)
    settingsOptions.push("✨ 애니메이션: 켜짐");
    
    messages.push(settingsOptions);

    fillInChatMessages(messages, settingsBox);
    
    // 설정 변경 버튼들
    addSettingsButtons(settingsBox);
    
    fillInLink("닫기", closeSettings, settingsBox);

    settingsBox.style.display = "flex";
    settingsBox.scrollTop = 0;
    
    hideOtherUIElements();
}

/**
 * 설정 변경 버튼들 추가
 */
function addSettingsButtons(settingsBox) {
    // 테마 변경 버튼
    fillInLink("테마 변경", () => {
        toggleDarkMode();
        // 설정 박스 다시 표시 (업데이트된 정보로)
        setTimeout(() => showSettings(), 100);
    }, settingsBox, "테마가 변경되었습니다!");
    
    // 데이터 내보내기 버튼
    import('./magpie.js').then(magpie => {
        if (magpie.canExportImport()) {
            fillInLink("데이터 내보내기", exportGameData, settingsBox);
            fillInLink("데이터 가져오기", importGameData, settingsBox);
        }
    });
    
    // 초기화 버튼
    fillInLink("⚠️ 모든 데이터 초기화", () => {
        if (confirm("정말로 모든 게임 데이터를 초기화하시겠습니까?")) {
            resetAllGameData();
            closeSettings();
        }
    }, settingsBox);
}

/**
 * 설정 박스 닫기
 */
export function closeSettings() {
    let settingsBox = document.getElementById("settings-box");
    if (settingsBox) {
        settingsBox.style.display = "none";
    }
}

/**
 * 게임 데이터 내보내기
 */
function exportGameData() {
    import('./storage.js').then(storage => {
        let exportedData = storage.exportAllStoredData();
        
        // 클립보드에 복사
        if (navigator.clipboard) {
            navigator.clipboard.writeText(exportedData).then(() => {
                alert("게임 데이터가 클립보드에 복사되었습니다!");
            });
        } else {
            // 텍스트 영역에 표시
            let textArea = document.createElement("textarea");
            textArea.value = exportedData;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert("게임 데이터가 클립보드에 복사되었습니다!");
        }
    });
}

/**
 * 게임 데이터 가져오기
 */
function importGameData() {
    let importData = prompt("게임 데이터를 입력하세요:");
    if (importData) {
        import('./storage.js').then(storage => {
            if (storage.importAllStoredData(importData)) {
                alert("게임 데이터를 성공적으로 가져왔습니다!");
                location.reload(); // 페이지 새로고침
            } else {
                alert("유효하지 않은 데이터입니다.");
            }
        });
    }
}

/**
 * 모든 게임 데이터 초기화
 */
function resetAllGameData() {
    // 로컬스토리지 완전 초기화
    localStorage.clear();
    
    // 페이지 새로고침
    location.reload();
}

/**
 * 다른 UI 요소들 숨기기
 */
function hideOtherUIElements() {
    // 스토리북 숨기기
    let storyBook = document.getElementById("story-book");
    if (storyBook) {
        storyBook.style.display = "none";
    }
    
    // 스토리 선택 숨기기
    let storySelect = document.getElementById("story-select");
    if (storySelect) {
        storySelect.style.display = "none";
    }
}

/**
 * 규칙 박스 생성
 */
function createRulesBox() {
    let rulesBox = document.createElement("div");
    rulesBox.id = "rules-box";
    rulesBox.className = "rules-modal";
    rulesBox.style.display = "none";
    document.body.appendChild(rulesBox);
}

/**
 * 설정 박스 생성
 */
function createSettingsBox() {
    let settingsBox = document.createElement("div");
    settingsBox.id = "settings-box";
    settingsBox.className = "settings-modal";
    settingsBox.style.display = "none";
    document.body.appendChild(settingsBox);
}

/**
 * 설정 초기화 (앱 시작시)
 */
export function initializeSettings() {
    // 저장된 테마 적용
    applyTheme(sd_settingTheme[0]);
    
    console.log('설정 초기화 완료, 현재 테마:', getCurrentTheme());
}

/**
 * 키보드 단축키 설정
 */
export function setupSettingsShortcuts() {
    document.addEventListener('keydown', (event) => {
        // Ctrl + , : 설정 열기
        if (event.ctrlKey && event.key === ',') {
            event.preventDefault();
            showSettings();
        }
        
        // F1: 규칙 열기
        if (event.key === 'F1') {
            event.preventDefault();
            toggleRules();
        }
        
        // Ctrl + Shift + D: 다크모드 토글
        if (event.ctrlKey && event.shiftKey && event.key === 'D') {
            event.preventDefault();
            toggleDarkMode();
        }
    });
}

/**
 * 현재 설정 상태 가져오기
 */
export function getSettingsState() {
    return {
        theme: getCurrentTheme(),
        isLightMode: isLightMode(),
        isSamsungBrowser: g_isSamsungBrowser
    };
}

// 전역 함수로 등록
window.toggleDarkMode = toggleDarkMode;
window.toggleRules = toggleRules;
window.showSettings = showSettings;
window.closeRules = closeRules;
window.closeSettings = closeSettings;