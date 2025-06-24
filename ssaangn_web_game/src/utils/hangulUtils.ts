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

/**
 * 자음인지 확인
 * @param char - 확인할 문자
 * @returns 자음 여부
 */
export const isConsonant = (char: string): boolean => {
  if (!char || char.length !== 1) return false;
  return CONSONANTS.includes(char) || FINAL_CONSONANTS.includes(char);
};

/**
 * 모음인지 확인
 * @param char - 확인할 문자
 * @returns 모음 여부
 */
export const isVowel = (char: string): boolean => {
  if (!char || char.length !== 1) return false;
  return VOWELS.includes(char);
};

/**
 * 이중자음 조합 맵
 */
const DOUBLE_CONSONANTS = {
  'ㄱㄱ': 'ㄲ',
  'ㄷㄷ': 'ㄸ',
  'ㅂㅂ': 'ㅃ',
  'ㅅㅅ': 'ㅆ',
  'ㅈㅈ': 'ㅉ',
  'ㄱㅅ': 'ㄳ',
  'ㄴㅈ': 'ㄵ',
  'ㄴㅎ': 'ㄶ',
  'ㄹㄱ': 'ㄺ',
  'ㄹㅁ': 'ㄻ',
  'ㄹㅂ': 'ㄼ',
  'ㄹㅅ': 'ㄽ',
  'ㄹㅌ': 'ㄾ',
  'ㄹㅍ': 'ㄿ',
  'ㄹㅎ': 'ㅀ',
  'ㅂㅅ': 'ㅄ'
} as const;

/**
 * 이중자음 분해 맵
 */
const DOUBLE_CONSONANTS_DECOMPOSED = Object.fromEntries(
  Object.entries(DOUBLE_CONSONANTS).map(([key, value]) => [value, key])
);

/**
 * 복합모음 조합 맵
 */
const COMPLEX_VOWELS = {
  'ㅗㅏ': 'ㅘ',
  'ㅗㅐ': 'ㅙ',
  'ㅗㅣ': 'ㅚ',
  'ㅜㅓ': 'ㅝ',
  'ㅜㅔ': 'ㅞ',
  'ㅜㅣ': 'ㅟ',
  'ㅡㅣ': 'ㅢ'
} as const;

/**
 * 복합모음 분해 맵
 */
const COMPLEX_VOWELS_DECOMPOSED = Object.fromEntries(
  Object.entries(COMPLEX_VOWELS).map(([key, value]) => [value, key])
);

/**
 * 한글 입력 상태 인터페이스
 */
export interface HangulInputState {
  consonant?: string;
  vowel?: string;
  finalConsonant?: string;
  completed: boolean;
}

/**
 * 한글 입력 처리 클래스
 */
export class HangulInput {
  private state: HangulInputState = { completed: false };
  
  /**
   * 자모 입력 처리
   * @param jamo - 입력할 자모
   * @returns 처리 결과 { char: 현재문자, overflow: 넘침문자, completed: 완성여부 }
   */
  inputJamo(jamo: string): { char: string; overflow?: string; completed: boolean } {
    // 자음 입력 처리
    if (isConsonant(jamo)) {
      return this.handleConsonantInput(jamo);
    }
    
    // 모음 입력 처리
    if (isVowel(jamo)) {
      return this.handleVowelInput(jamo);
    }
    
    return { char: '', completed: false };
  }
  
  /**
   * 자음 입력 처리
   */
  private handleConsonantInput(consonant: string): { char: string; overflow?: string; completed: boolean } {
    // 초성이 없는 경우 - 초성으로 설정
    if (!this.state.consonant) {
      this.state.consonant = consonant;
      this.state.completed = false;
      return { char: consonant, completed: false };
    }
    
    // 모음이 없는 경우 (초성만 있음) - 이중자음 조합 시도
    if (!this.state.vowel) {
      const doubleConsonant = DOUBLE_CONSONANTS[this.state.consonant + consonant as keyof typeof DOUBLE_CONSONANTS];
      if (doubleConsonant) {
        this.state.consonant = doubleConsonant;
        return { char: doubleConsonant, completed: false };
      } else {
        // 조합 불가능 - 새로운 글자 시작
        const prevChar = this.state.consonant;
        this.reset();
        this.state.consonant = consonant;
        return { char: consonant, overflow: prevChar, completed: true };
      }
    }
    
    // 받침이 없는 경우 - 받침으로 설정
    if (!this.state.finalConsonant) {
      this.state.finalConsonant = consonant;
      const char = this.getCurrentChar();
      this.state.completed = true;
      return { char, completed: true };
    }
    
    // 받침이 있는 경우 - 이중받침 조합 시도
    const doubleFinal = DOUBLE_CONSONANTS[this.state.finalConsonant + consonant as keyof typeof DOUBLE_CONSONANTS];
    if (doubleFinal) {
      this.state.finalConsonant = doubleFinal;
      const char = this.getCurrentChar();
      return { char, completed: true };
    } else {
      // 조합 불가능 - 받침을 초성으로 하는 새 글자 시작
      const prevChar = this.getCurrentChar();
      this.reset();
      this.state.consonant = consonant;
      return { char: consonant, overflow: prevChar, completed: true };
    }
  }
  
  /**
   * 모음 입력 처리
   */
  private handleVowelInput(vowel: string): { char: string; overflow?: string; completed: boolean } {
    // 초성이 없는 경우 - ㅇ을 초성으로 설정
    if (!this.state.consonant) {
      this.state.consonant = 'ㅇ';
      this.state.vowel = vowel;
      const char = this.getCurrentChar();
      return { char, completed: false };
    }
    
    // 모음이 없는 경우 - 모음으로 설정
    if (!this.state.vowel) {
      this.state.vowel = vowel;
      const char = this.getCurrentChar();
      return { char, completed: false };
    }
    
    // 복합모음 조합 시도
    const complexVowel = COMPLEX_VOWELS[this.state.vowel + vowel as keyof typeof COMPLEX_VOWELS];
    if (complexVowel) {
      this.state.vowel = complexVowel;
      const char = this.getCurrentChar();
      return { char, completed: false };
    }
    
    // 받침이 있는 경우 - 받침을 초성으로 하는 새 글자 시작
    if (this.state.finalConsonant) {
      // 이중받침인 경우 분해 처리
      const decomposed = DOUBLE_CONSONANTS_DECOMPOSED[this.state.finalConsonant];
      if (decomposed && decomposed.length === 2) {
        const [first, second] = decomposed;
        this.state.finalConsonant = first;
        const prevChar = this.getCurrentChar();
        this.reset();
        this.state.consonant = second;
        this.state.vowel = vowel;
        const newChar = this.getCurrentChar();
        return { char: newChar, overflow: prevChar, completed: true };
      } else {
        // 단일받침인 경우
        const finalConsonant = this.state.finalConsonant;
        this.state.finalConsonant = undefined;
        const prevChar = this.getCurrentChar();
        this.reset();
        this.state.consonant = finalConsonant;
        this.state.vowel = vowel;
        const newChar = this.getCurrentChar();
        return { char: newChar, overflow: prevChar, completed: true };
      }
    }
    
    // 받침이 없는 경우 - 새로운 글자 시작
    const prevChar = this.getCurrentChar();
    this.reset();
    this.state.consonant = 'ㅇ';
    this.state.vowel = vowel;
    const newChar = this.getCurrentChar();
    return { char: newChar, overflow: prevChar, completed: true };
  }
  
  /**
   * 현재 상태로 한글 문자 생성
   */
  private getCurrentChar(): string {
    if (!this.state.consonant || !this.state.vowel) {
      return this.state.consonant || this.state.vowel || '';
    }
    
    const composed = composeHangul(
      this.state.consonant,
      this.state.vowel,
      this.state.finalConsonant
    );
    
    return composed || '';
  }
  
  /**
   * 백스페이스 처리
   */
  backspace(): { char: string; completed: boolean } {
    // 받침이 있는 경우 - 받침 제거
    if (this.state.finalConsonant) {
      // 이중받침인 경우 분해
      const decomposed = DOUBLE_CONSONANTS_DECOMPOSED[this.state.finalConsonant];
      if (decomposed && decomposed.length === 2) {
        this.state.finalConsonant = decomposed[0];
      } else {
        this.state.finalConsonant = undefined;
      }
      const char = this.getCurrentChar();
      return { char, completed: false };
    }
    
    // 모음이 있는 경우 - 모음 제거 또는 분해
    if (this.state.vowel) {
      const decomposed = COMPLEX_VOWELS_DECOMPOSED[this.state.vowel];
      if (decomposed && decomposed.length === 2) {
        this.state.vowel = decomposed[0];
        const char = this.getCurrentChar();
        return { char, completed: false };
      } else {
        this.state.vowel = undefined;
        const char = this.state.consonant || '';
        return { char, completed: false };
      }
    }
    
    // 초성만 있는 경우 - 초성 제거 또는 분해
    if (this.state.consonant) {
      const decomposed = DOUBLE_CONSONANTS_DECOMPOSED[this.state.consonant];
      if (decomposed && decomposed.length === 2) {
        this.state.consonant = decomposed[0];
        const char = this.state.consonant;
        return { char, completed: false };
      } else {
        this.reset();
        return { char: '', completed: true };
      }
    }
    
    return { char: '', completed: true };
  }
  
  /**
   * 상태 초기화
   */
  reset(): void {
    this.state = { completed: false };
  }
  
  /**
   * 현재 상태 반환
   */
  getState(): HangulInputState {
    return { ...this.state };
  }
  
  /**
   * 완성된 문자 반환
   */
  getChar(): string {
    return this.getCurrentChar();
  }
}