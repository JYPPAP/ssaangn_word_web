/**
 * 로컬 스토리지 관리 모듈
 * 게임 데이터의 저장, 로드, 암호화/복호화를 담당합니다.
 */

import * as helper from './helper_tools';

// 저장 데이터 정의 (원본 script.js에서 이동)
export const sd_completedFirstDay: helper.StoredDataEntry<boolean> = [false, helper.SDTypes.BOOL, "completedFirstDay"];
export const sd_seenTutorial: helper.StoredDataEntry<boolean> = [false, helper.SDTypes.BOOL, "seenTutorial"];
export const sd_seenSubmit: helper.StoredDataEntry<boolean> = [false, helper.SDTypes.BOOL, "seenSubmit"];
export const sd_seenHelp: helper.StoredDataEntry<boolean> = [false, helper.SDTypes.BOOL, "seenHelp"];
export const sd_seenApple: helper.StoredDataEntry<boolean> = [false, helper.SDTypes.BOOL, "seenApple"];
export const sd_seenBanana: helper.StoredDataEntry<boolean> = [false, helper.SDTypes.BOOL, "seenBanana"];
export const sd_seenEggplant: helper.StoredDataEntry<boolean> = [false, helper.SDTypes.BOOL, "seenEggplant"];
export const sd_seenGarlic: helper.StoredDataEntry<boolean> = [false, helper.SDTypes.BOOL, "seenGarlic"];
export const sd_seenMushroom: helper.StoredDataEntry<boolean> = [false, helper.SDTypes.BOOL, "seenMushroom"];
export const sd_seenCarrot: helper.StoredDataEntry<boolean> = [false, helper.SDTypes.BOOL, "seenCarrot"];
export const sd_seenOrange: helper.StoredDataEntry<boolean> = [false, helper.SDTypes.BOOL, "seenOrange"];
export const sd_seenKiwi: helper.StoredDataEntry<boolean> = [false, helper.SDTypes.BOOL, "seenKiwi"];
export const sd_seenWelcomeBack: helper.StoredDataEntry<boolean> = [false, helper.SDTypes.BOOL, "seenWelcomeBack"];
export const sd_seenStreakCongrats: helper.StoredDataEntry<boolean> = [false, helper.SDTypes.BOOL, "seenStreakCongrats"];
export const sd_previousGuesses: helper.StoredDataEntry<string> = ["", helper.SDTypes.STRING, "previousGuesses"];
export const sd_previousHints: helper.StoredDataEntry<string> = ["", helper.SDTypes.STRING, "previousHints"];
export const sd_previousSecret: helper.StoredDataEntry<string> = ["", helper.SDTypes.STRING, "previousSecret"];
export const sd_previousCreatedMagpie: helper.StoredDataEntry<string> = ["", helper.SDTypes.STRING, "previousCreatedMagpie"];
export const sd_previousDayNumber: helper.StoredDataEntry<number> = [0, helper.SDTypes.INT, "previousDayNumber"];
export const sd_storiesUnlocked: helper.StoredDataEntry<number> = [0, helper.SDTypes.INT, "storiesUnlocked"];
export const sd_storiesRead: helper.StoredDataEntry<number> = [0, helper.SDTypes.INT, "storiesRead"];
export const sd_successCount: helper.StoredDataEntry<number> = [0, helper.SDTypes.INT, "successCount"];
export const sd_currentStreak: helper.StoredDataEntry<number> = [0, helper.SDTypes.INT, "currentStreak"];
export const sd_bestStreak: helper.StoredDataEntry<number> = [0, helper.SDTypes.INT, "bestStreak"];
export const sd_settingTheme: helper.StoredDataEntry<number> = [0, helper.SDTypes.INT, "settingTheme"];
export const sd_raceSuccessCount: helper.StoredDataEntry<number> = [0, helper.SDTypes.INT, "raceSuccessCount"];
export const sd_highwaterBackup: helper.StoredDataEntry<number> = [0, helper.SDTypes.INT, "highwaterBackup"];
export const sd_highwaterDayNumber: helper.StoredDataEntry<number> = [0, helper.SDTypes.INT, "highwaterDayNumber"];
export const sd_weeklyStatus: helper.StoredDataEntry<string> = ["0,0,월욜,0,0,화욜,0,0,수욜,0,0,목욜,0,0,금욜,0,0,토욜,0,0,일욜", helper.SDTypes.STRING, "weeklyStatus"];
export const sd_goldMedals: helper.StoredDataEntry<number> = [0, helper.SDTypes.INT, "goldMedals"];
export const sd_silverMedals: helper.StoredDataEntry<number> = [0, helper.SDTypes.INT, "silverMedals"];
export const sd_copperMedals: helper.StoredDataEntry<number> = [0, helper.SDTypes.INT, "copperMedals"];
export const sd_globalStatsRequestTime: helper.StoredDataEntry<number> = [0, helper.SDTypes.INT, "globalStatsRequestTime"];
export const sd_globalStats: helper.StoredDataEntry<string> = ["", helper.SDTypes.STRING, "globalStats"];
export const sd_unlockables: helper.StoredDataEntry<string> = ["", helper.SDTypes.STRING, "unlockables"];
export const sd_previousRaceHour: helper.StoredDataEntry<number> = [0, helper.SDTypes.INT, "previousRaceHour"];
export const sd_previousRaceScore: helper.StoredDataEntry<number> = [0, helper.SDTypes.INT, "previousRaceScore"];
export const sd_testVal: helper.StoredDataEntry<number | undefined> = [undefined, helper.SDTypes.INT, "testVal"];

/**
 * 모든 저장된 데이터를 로드합니다
 */
export function getAllStoredData(): void {
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
export function numToHangulCode(num: number, key: string): string {
    return String.fromCharCode(key.codePointAt(0)! + num);
}

/**
 * 한글 코드를 숫자로 변환
 */
export function hangulCodeToNum(code: string, key: string): number {
    return code.codePointAt(0)! - key.codePointAt(0)!;
}

/**
 * 모든 저장된 데이터를 내보내기
 */
export function exportAllStoredData(): string {
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
export function importAllStoredData(data: string): boolean {
    if (!data || data.length < 20) {
        return false;
    }
    
    return importAllStoredDataInternal(data);
}

/**
 * 내부 데이터 가져오기 구현
 */
function importAllStoredDataInternal(data: string): boolean {
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