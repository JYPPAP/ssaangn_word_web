/**
 * 한글 분해/조합 관련 유틸리티 함수들
 * 
 * 한글 완성형 문자를 자음, 모음, 받침으로 분해하고
 * 게임 로직에 필요한 문자 비교 기능을 제공합니다.
 */

import type { HangulDecomposed } from "../types/game";

// 한글 자음 배열 (초성 + 종성용)
const CONSONANTS = [
  'ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
  'ㄲ', 'ㄸ', 'ㅃ', 'ㅆ', 'ㅉ'
];

// 한글 모음 배열 (중성용)
const VOWELS = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅛ', 
  'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅢ'
];

// 종성 자음 배열 (받침용 - 공백 포함)
const FINAL_CONSONANTS = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ',
  'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

/**
 * 한글 문자가 완성형 한글인지 확인
 * @param char - 확인할 문자
 * @returns 완성형 한글 여부
 * 
 * @example
 * isHangul('가') // true
 * isHangul('a') // false
 * isHangul('ㄱ') // false
 */
export const isHangul = (char: string): boolean => {
  if (!char || char.length !== 1) return false;
  const code = char.charCodeAt(0);
  return code >= 0xAC00 && code <= 0xD7A3;
};

/**
 * 한글 완성형 문자를 자음, 모음, 받침으로 분해
 * @param char - 분해할 한글 문자
 * @returns 분해된 자음, 모음, 받침 객체 또는 null
 * 
 * @example
 * decomposeHangul('안') 
 * // { consonant: 'ㅇ', vowel: 'ㅏ', finalConsonant: 'ㄴ' }
 * 
 * decomposeHangul('가')
 * // { consonant: 'ㄱ', vowel: 'ㅏ', finalConsonant: undefined }
 */
export const decomposeHangul = (char: string): HangulDecomposed | null => {
  if (!isHangul(char)) return null;

  const code = char.charCodeAt(0) - 0xAC00;
  
  // 한글 완성형 계산 공식
  const consonantIndex = Math.floor(code / 588);
  const vowelIndex = Math.floor((code % 588) / 28);
  const finalConsonantIndex = code % 28;

  return {
    consonant: CONSONANTS[consonantIndex],
    vowel: VOWELS[vowelIndex],
    finalConsonant: finalConsonantIndex > 0 ? FINAL_CONSONANTS[finalConsonantIndex] : undefined
  };
};

/**
 * 한글 자음, 모음, 받침을 조합하여 완성형 문자 생성
 * @param consonant - 초성 자음
 * @param vowel - 중성 모음
 * @param finalConsonant - 종성 자음 (선택사항)
 * @returns 조합된 한글 문자 또는 null
 * 
 * @example
 * composeHangul('ㄱ', 'ㅏ') // '가'
 * composeHangul('ㅇ', 'ㅏ', 'ㄴ') // '안'
 */
export const composeHangul = (
  consonant: string, 
  vowel: string, 
  finalConsonant?: string
): string | null => {
  const consonantIndex = CONSONANTS.indexOf(consonant);
  const vowelIndex = VOWELS.indexOf(vowel);
  const finalConsonantIndex = finalConsonant ? FINAL_CONSONANTS.indexOf(finalConsonant) : 0;

  if (consonantIndex === -1 || vowelIndex === -1 || 
      (finalConsonant && finalConsonantIndex === -1)) {
    return null;
  }

  const code = 0xAC00 + (consonantIndex * 588) + (vowelIndex * 28) + finalConsonantIndex;
  return String.fromCharCode(code);
};

/**
 * 단어의 모든 문자를 자음, 모음 성분으로 분해하여 배열로 반환
 * @param word - 분해할 한글 단어
 * @returns 자음, 모음, 받침이 포함된 배열
 * 
 * @example
 * getHangulComponents('안녕')
 * // ['ㅇ', 'ㅏ', 'ㄴ', 'ㄴ', 'ㅕ', 'ㅇ']
 * 
 * getHangulComponents('사랑')
 * // ['ㅅ', 'ㅏ', 'ㄹ', 'ㅏ', 'ㅇ']
 */
export const getHangulComponents = (word: string): string[] => {
  const components: string[] = [];

  for (const char of word) {
    const decomposed = decomposeHangul(char);
    if (decomposed) {
      components.push(decomposed.consonant, decomposed.vowel);
      if (decomposed.finalConsonant) {
        components.push(decomposed.finalConsonant);
      }
    }
  }

  return components;
};

/**
 * 두 한글 문자의 자음, 모음 성분 비교
 * @param char1 - 첫 번째 문자
 * @param char2 - 두 번째 문자
 * @returns 일치하는 성분의 개수
 * 
 * @example
 * compareHangulComponents('가', '강')
 * // 2 (ㄱ, ㅏ 일치)
 * 
 * compareHangulComponents('사', '랑')
 * // 1 (ㅏ 일치)
 */
export const compareHangulComponents = (char1: string, char2: string): number => {
  const components1 = getHangulComponents(char1);
  const components2 = getHangulComponents(char2);

  return components1.filter(comp => components2.includes(comp)).length;
};

/**
 * 한글 단어가 유효한지 검사 (모든 문자가 완성형 한글인지)
 * @param word - 검사할 단어
 * @returns 유효성 여부
 * 
 * @example
 * isValidHangulWord('안녕') // true
 * isValidHangulWord('hello') // false
 * isValidHangulWord('안녕a') // false
 */
export const isValidHangulWord = (word: string): boolean => {
  if (!word || word.length === 0) return false;
  return Array.from(word).every(char => isHangul(char));
};