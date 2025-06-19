/**
 * 잠금 해제 가능한 아이템 관리 모듈
 * 게임 내 언락 요소들을 관리합니다.
 */

import * as storage from './storage.js';

/**
 * 잠금 해제 가능한 아이템이 있는지 확인
 * @param {string} name - 아이템 이름
 * @returns {boolean} 아이템 존재 여부
 */
export function hasUnlockable(name) {
    if (!storage.g_unlockables) {
        return false;
    }
    
    return storage.g_unlockables.some(unlockable => unlockable.name === name);
}

/**
 * 새로운 잠금 해제 아이템 추가
 * @param {string} name - 아이템 이름
 * @param {number} costGold - 골드 메달 비용
 * @param {number} costSilver - 실버 메달 비용  
 * @param {number} costCopper - 구리 메달 비용
 */
export function addUnlockable(name, costGold, costSilver, costCopper) {
    if (!storage.g_unlockables) {
        storage.g_unlockables = [];
    }
    
    // 이미 존재하는 아이템인지 확인
    if (hasUnlockable(name)) {
        return;
    }
    
    const unlockable = {
        name: name,
        costGold: costGold,
        costSilver: costSilver,
        costCopper: costCopper,
        unlocked: false,
        dateUnlocked: null
    };
    
    storage.g_unlockables.push(unlockable);
    storage.saveUnlockables();
}

/**
 * 구리 메달 비용을 기반으로 실행 가능한 비용 계산
 * @param {number} costCopper - 구리 메달 비용
 * @returns {Object} 계산된 메달 비용 {gold, silver, copper}
 */
export function calculateViableCost(costCopper) {
    if (costCopper <= 0) {
        return { gold: 0, silver: 0, copper: 0 };
    }
    
    // 상수 정의
    const GOLD_TO_SILVER = 2;
    const SILVER_TO_COPPER = 3;
    
    let remainingCopper = costCopper;
    let gold = 0;
    let silver = 0;
    
    // 골드로 변환 가능한 만큼 계산
    const goldValue = GOLD_TO_SILVER * SILVER_TO_COPPER; // 6구리 = 1골드
    if (remainingCopper >= goldValue) {
        gold = Math.floor(remainingCopper / goldValue);
        remainingCopper = remainingCopper % goldValue;
    }
    
    // 실버로 변환 가능한 만큼 계산
    if (remainingCopper >= SILVER_TO_COPPER) {
        silver = Math.floor(remainingCopper / SILVER_TO_COPPER);
        remainingCopper = remainingCopper % SILVER_TO_COPPER;
    }
    
    return {
        gold: gold,
        silver: silver,
        copper: remainingCopper
    };
}

/**
 * 아이템 잠금 해제
 * @param {string} name - 잠금 해제할 아이템 이름
 * @returns {boolean} 잠금 해제 성공 여부
 */
export function unlockItem(name) {
    if (!storage.g_unlockables) {
        return false;
    }
    
    const unlockable = storage.g_unlockables.find(item => item.name === name);
    if (!unlockable || unlockable.unlocked) {
        return false;
    }
    
    // 비용 확인
    if (storage.g_goldMedals >= unlockable.costGold &&
        storage.g_silverMedals >= unlockable.costSilver &&
        storage.g_copperMedals >= unlockable.costCopper) {
        
        // 비용 차감
        storage.g_goldMedals -= unlockable.costGold;
        storage.g_silverMedals -= unlockable.costSilver;
        storage.g_copperMedals -= unlockable.costCopper;
        
        // 아이템 잠금 해제
        unlockable.unlocked = true;
        unlockable.dateUnlocked = new Date().toISOString();
        
        // 저장
        storage.saveMedals();
        storage.saveUnlockables();
        
        return true;
    }
    
    return false;
}

/**
 * 잠금 해제된 아이템 목록 반환
 * @returns {Array} 잠금 해제된 아이템 배열
 */
export function getUnlockedItems() {
    if (!storage.g_unlockables) {
        return [];
    }
    
    return storage.g_unlockables.filter(item => item.unlocked);
}

/**
 * 잠금 해제 가능한 아이템 목록 반환 (충분한 메달 보유)
 * @returns {Array} 잠금 해제 가능한 아이템 배열
 */
export function getUnlockableItems() {
    if (!storage.g_unlockables) {
        return [];
    }
    
    return storage.g_unlockables.filter(item => {
        if (item.unlocked) return false;
        
        return storage.g_goldMedals >= item.costGold &&
               storage.g_silverMedals >= item.costSilver &&
               storage.g_copperMedals >= item.costCopper;
    });
}