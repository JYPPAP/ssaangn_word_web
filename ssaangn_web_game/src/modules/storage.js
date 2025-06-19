/**
 * 로컬 스토리지 관리 모듈
 * 게임 데이터의 저장, 로드, 암호화/복호화를 담당합니다.
 */

import * as helper from './helper_tools.js';

// 저장 데이터 정의 (원본 script.js에서 이동)
export let sd_completedFirstDay = [false, helper.SDTypes.BOOL, "completedFirstDay"];
export let sd_seenTutorial = [false, helper.SDTypes.BOOL, "seenTutorial"];
export let sd_seenSubmit = [false, helper.SDTypes.BOOL, "seenSubmit"];
export let sd_seenHelp = [false, helper.SDTypes.BOOL, "seenHelp"];
export let sd_seenApple = [false, helper.SDTypes.BOOL, "seenApple"];
export let sd_seenBanana = [false, helper.SDTypes.BOOL, "seenBanana"];
export let sd_seenEggplant = [false, helper.SDTypes.BOOL, "seenEggplant"];
export let sd_seenGarlic = [false, helper.SDTypes.BOOL, "seenGarlic"];
export let sd_seenMushroom = [false, helper.SDTypes.BOOL, "seenMushroom"];
export let sd_seenCarrot = [false, helper.SDTypes.BOOL, "seenCarrot"];
export let sd_seenOrange = [false, helper.SDTypes.BOOL, "seenOrange"];
export let sd_seenKiwi = [false, helper.SDTypes.BOOL, "seenKiwi"];
export let sd_seenWelcomeBack = [false, helper.SDTypes.BOOL, "seenWelcomeBack"];
export let sd_seenStreakCongrats = [false, helper.SDTypes.BOOL, "seenStreakCongrats"];
export let sd_previousGuesses = ["", helper.SDTypes.STRING, "previousGuesses"];
export let sd_previousHints = ["", helper.SDTypes.STRING, "previousHints"];
export let sd_previousSecret = ["", helper.SDTypes.STRING, "previousSecret"];
export let sd_previousCreatedMagpie = ["", helper.SDTypes.STRING, "previousCreatedMagpie"];
export let sd_previousDayNumber = [0, helper.SDTypes.INT, "previousDayNumber"];
export let sd_storiesUnlocked = [0, helper.SDTypes.INT, "storiesUnlocked"];
export let sd_storiesRead = [0, helper.SDTypes.INT, "storiesRead"];
export let sd_successCount = [0, helper.SDTypes.INT, "successCount"];
export let sd_currentStreak = [0, helper.SDTypes.INT, "currentStreak"];
export let sd_bestStreak = [0, helper.SDTypes.INT, "bestStreak"];
export let sd_settingTheme = [0, helper.SDTypes.INT, "settingTheme"];
export let sd_raceSuccessCount = [0, helper.SDTypes.INT, "raceSuccessCount"];
export let sd_highwaterBackup = [0, helper.SDTypes.INT, "highwaterBackup"];
export let sd_highwaterDayNumber = [0, helper.SDTypes.INT, "highwaterDayNumber"];
export let sd_weeklyStatus = ["0,0,월욜,0,0,화욜,0,0,수욜,0,0,목욜,0,0,금욜,0,0,토욜,0,0,일욜", helper.SDTypes.STRING, "weeklyStatus"];
export let sd_goldMedals = [0, helper.SDTypes.INT, "goldMedals"];
export let sd_silverMedals = [0, helper.SDTypes.INT, "silverMedals"];
export let sd_copperMedals = [0, helper.SDTypes.INT, "copperMedals"];
export let sd_globalStatsRequestTime = [0, helper.SDTypes.INT, "globalStatsRequestTime"];
export let sd_globalStats = ["", helper.SDTypes.STRING, "globalStats"];
export let sd_unlockables = ["", helper.SDTypes.STRING, "unlockables"];
export let sd_previousRaceHour = [0, helper.SDTypes.INT, "previousRaceHour"];
export let sd_previousRaceScore = [0, helper.SDTypes.INT, "previousRaceScore"];
export let sd_testVal = [undefined, helper.SDTypes.INT, "testVal"];

/**
 * 모든 저장된 데이터를 로드합니다
 */
export function getAllStoredData() {
    helper.getStoredDataValue(sd_completedFirstDay);
    helper.getStoredDataValue(sd_seenTutorial);
    helper.getStoredDataValue(sd_seenSubmit);
    helper.getStoredDataValue(sd_seenHelp);
    helper.getStoredDataValue(sd_seenApple);
    helper.getStoredDataValue(sd_seenBanana);
    helper.getStoredDataValue(sd_seenEggplant);
    helper.getStoredDataValue(sd_seenGarlic);
    helper.getStoredDataValue(sd_seenMushroom);
    helper.getStoredDataValue(sd_seenCarrot);
    helper.getStoredDataValue(sd_seenOrange);
    helper.getStoredDataValue(sd_seenKiwi);
    helper.getStoredDataValue(sd_seenWelcomeBack);
    helper.getStoredDataValue(sd_seenStreakCongrats);
    helper.getStoredDataValue(sd_previousGuesses);
    helper.getStoredDataValue(sd_previousHints);
    helper.getStoredDataValue(sd_previousSecret);
    helper.getStoredDataValue(sd_previousCreatedMagpie);
    helper.getStoredDataValue(sd_previousDayNumber);
    helper.getStoredDataValue(sd_storiesUnlocked);
    helper.getStoredDataValue(sd_storiesRead);
    helper.getStoredDataValue(sd_successCount);
    helper.getStoredDataValue(sd_currentStreak);
    helper.getStoredDataValue(sd_bestStreak);
    helper.getStoredDataValue(sd_settingTheme);
    helper.getStoredDataValue(sd_raceSuccessCount);
    helper.getStoredDataValue(sd_highwaterBackup);
    helper.getStoredDataValue(sd_highwaterDayNumber);
    helper.getStoredDataValue(sd_weeklyStatus);
    helper.getStoredDataValue(sd_goldMedals);
    helper.getStoredDataValue(sd_silverMedals);
    helper.getStoredDataValue(sd_copperMedals);
    helper.getStoredDataValue(sd_globalStatsRequestTime);
    helper.getStoredDataValue(sd_globalStats);
    helper.getStoredDataValue(sd_unlockables);
    helper.getStoredDataValue(sd_previousRaceHour);
    helper.getStoredDataValue(sd_previousRaceScore);
    helper.getStoredDataValue(sd_testVal);
}

/**
 * 숫자를 한글 코드로 변환
 */
export function numToHangulCode(num, key) {
    return String.fromCharCode(key.codePointAt() + num);
}

/**
 * 한글 코드를 숫자로 변환
 */
export function hangulCodeToNum(code, key) {
    return code.codePointAt() - key.codePointAt();
}

/**
 * 모든 저장된 데이터를 내보내기
 */
export function exportAllStoredData() {
    let exportedData = "";
    
    exportedData += numToHangulCode(sd_completedFirstDay[0] ? 1 : 0, 'ㄱ');
    exportedData += numToHangulCode(sd_seenTutorial[0] ? 1 : 0, 'ㄴ');
    exportedData += numToHangulCode(sd_seenSubmit[0] ? 1 : 0, 'ㄷ');
    exportedData += numToHangulCode(sd_seenHelp[0] ? 1 : 0, 'ㄹ');
    exportedData += numToHangulCode(sd_seenApple[0] ? 1 : 0, 'ㅁ');
    exportedData += numToHangulCode(sd_seenBanana[0] ? 1 : 0, 'ㅂ');
    exportedData += numToHangulCode(sd_seenEggplant[0] ? 1 : 0, 'ㅅ');
    exportedData += numToHangulCode(sd_seenGarlic[0] ? 1 : 0, 'ㅇ');
    exportedData += numToHangulCode(sd_seenMushroom[0] ? 1 : 0, 'ㅈ');
    exportedData += numToHangulCode(sd_seenCarrot[0] ? 1 : 0, 'ㅊ');
    exportedData += numToHangulCode(sd_seenOrange[0] ? 1 : 0, 'ㅋ');
    exportedData += numToHangulCode(sd_seenKiwi[0] ? 1 : 0, 'ㅌ');
    exportedData += numToHangulCode(sd_seenWelcomeBack[0] ? 1 : 0, 'ㅍ');
    exportedData += numToHangulCode(sd_seenStreakCongrats[0] ? 1 : 0, 'ㅎ');

    // 인코딩된 숫자 데이터들도 추가
    exportedData += helper.encodeNumber(sd_previousDayNumber[0], 'ㄱ');
    exportedData += helper.encodeNumber(sd_storiesUnlocked[0], 'ㄴ');
    exportedData += helper.encodeNumber(sd_storiesRead[0], 'ㄷ');
    exportedData += helper.encodeNumber(sd_successCount[0], 'ㄹ');
    exportedData += helper.encodeNumber(sd_currentStreak[0], 'ㅁ');
    exportedData += helper.encodeNumber(sd_bestStreak[0], 'ㅂ');
    exportedData += helper.encodeNumber(sd_settingTheme[0], 'ㅅ');
    exportedData += helper.encodeNumber(sd_raceSuccessCount[0], 'ㅇ');
    exportedData += helper.encodeNumber(sd_goldMedals[0], 'ㅈ');
    exportedData += helper.encodeNumber(sd_silverMedals[0], 'ㅊ');
    exportedData += helper.encodeNumber(sd_copperMedals[0], 'ㅋ');

    return exportedData;
}

/**
 * 모든 저장된 데이터를 가져오기
 */
export function importAllStoredData(data) {
    if (!data || data.length < 20) {
        return false;
    }
    
    return importAllStoredDataInternal(data);
}

/**
 * 내부 데이터 가져오기 구현
 */
function importAllStoredDataInternal(data) {
    try {
        let index = 0;
        
        // Boolean 데이터들
        sd_completedFirstDay[0] = hangulCodeToNum(data[index++], 'ㄱ') === 1;
        sd_seenTutorial[0] = hangulCodeToNum(data[index++], 'ㄴ') === 1;
        sd_seenSubmit[0] = hangulCodeToNum(data[index++], 'ㄷ') === 1;
        sd_seenHelp[0] = hangulCodeToNum(data[index++], 'ㄹ') === 1;
        sd_seenApple[0] = hangulCodeToNum(data[index++], 'ㅁ') === 1;
        sd_seenBanana[0] = hangulCodeToNum(data[index++], 'ㅂ') === 1;
        sd_seenEggplant[0] = hangulCodeToNum(data[index++], 'ㅅ') === 1;
        sd_seenGarlic[0] = hangulCodeToNum(data[index++], 'ㅇ') === 1;
        sd_seenMushroom[0] = hangulCodeToNum(data[index++], 'ㅈ') === 1;
        sd_seenCarrot[0] = hangulCodeToNum(data[index++], 'ㅊ') === 1;
        sd_seenOrange[0] = hangulCodeToNum(data[index++], 'ㅋ') === 1;
        sd_seenKiwi[0] = hangulCodeToNum(data[index++], 'ㅌ') === 1;
        sd_seenWelcomeBack[0] = hangulCodeToNum(data[index++], 'ㅍ') === 1;
        sd_seenStreakCongrats[0] = hangulCodeToNum(data[index++], 'ㅎ') === 1;

        // 숫자 데이터들
        const prevDay = helper.decodeNumber(data, index, 'ㄱ');
        sd_previousDayNumber[0] = prevDay.value;
        index = prevDay.newIndex;

        const storiesUnlocked = helper.decodeNumber(data, index, 'ㄴ');
        sd_storiesUnlocked[0] = storiesUnlocked.value;
        index = storiesUnlocked.newIndex;

        const storiesRead = helper.decodeNumber(data, index, 'ㄷ');
        sd_storiesRead[0] = storiesRead.value;
        index = storiesRead.newIndex;

        const successCount = helper.decodeNumber(data, index, 'ㄹ');
        sd_successCount[0] = successCount.value;
        index = successCount.newIndex;

        const currentStreak = helper.decodeNumber(data, index, 'ㅁ');
        sd_currentStreak[0] = currentStreak.value;
        index = currentStreak.newIndex;

        const bestStreak = helper.decodeNumber(data, index, 'ㅂ');
        sd_bestStreak[0] = bestStreak.value;
        index = bestStreak.newIndex;

        const settingTheme = helper.decodeNumber(data, index, 'ㅅ');
        sd_settingTheme[0] = settingTheme.value;
        index = settingTheme.newIndex;

        const raceSuccessCount = helper.decodeNumber(data, index, 'ㅇ');
        sd_raceSuccessCount[0] = raceSuccessCount.value;
        index = raceSuccessCount.newIndex;

        const goldMedals = helper.decodeNumber(data, index, 'ㅈ');
        sd_goldMedals[0] = goldMedals.value;
        index = goldMedals.newIndex;

        const silverMedals = helper.decodeNumber(data, index, 'ㅊ');
        sd_silverMedals[0] = silverMedals.value;
        index = silverMedals.newIndex;

        const copperMedals = helper.decodeNumber(data, index, 'ㅋ');
        sd_copperMedals[0] = copperMedals.value;
        index = copperMedals.newIndex;

        return true;
    } catch (error) {
        console.error('데이터 가져오기 실패:', error);
        return false;
    }
}