/**
 * 게임 로직 관련 유틸리티 함수들
 * 
 * 한글 단어 맞추기 게임의 핵심 로직을 담당합니다.
 * 힌트 시스템: 🥕🍄🧄🍆🍌🍎
 */

import type { HintType } from '../types/game';
import { getHangulComponents, isValidHangulWord } from './hangulUtils';

/**
 * 힌트 시스템 설명
 * 🥕 당연하죠~ (Perfect Match) - 해당 글자와 완전히 일치
 * 🍄 비슷해요~ (Similar) - 자음과 모음 중 2개 이상 일치 + 첫 자음 일치
 * 🧄 많을 거예요~ (Many Components) - 자음과 모음 중 2개 이상 일치 + 첫 자음 불일치
 * 🍆 가지고 있어요~ (Has Component) - 자음과 모음 중 1개만 일치
 * 🍌 반대로요~ (Opposite) - 반대편 글자에서 자음/모음 일치
 * 🍎 사과를 받아주세요~ (No Match) - 일치하는 자음/모음 없음
 */

/**
 * 입력 단어와 정답 단어를 비교하여 각 글자별 힌트를 계산
 * @param inputWord - 사용자가 입력한 2글자 단어
 * @param targetWord - 정답 2글자 단어
 * @returns 각 글자별 힌트 배열
 * 
 * @example
 * calculateHint('사과', '사랑')
 * // ['🥕', '🍆'] - 첫 글자 완전 일치, 둘째 글자 1개 성분 일치
 * 
 * calculateHint('강아', '사랑')
 * // ['🧄', '🍌'] - 첫 글자 2개 성분 일치(첫 자음 불일치), 둘째 글자 반대편 일치
 */
export const calculateHint = (inputWord: string, targetWord: string): HintType[] => {
  // 입력 검증
  if (!isValidHangulWord(inputWord) || !isValidHangulWord(targetWord)) {
    throw new Error('유효하지 않은 한글 단어입니다.');
  }

  if (inputWord.length !== 2 || targetWord.length !== 2) {
    throw new Error('2글자 단어만 지원됩니다.');
  }

  const inputChars = Array.from(inputWord);
  const targetChars = Array.from(targetWord);
  const hints: HintType[] = [];

  for (let i = 0; i < inputChars.length; i++) {
    const inputChar = inputChars[i];
    const targetChar = targetChars[i];

    // 🥕 완전 일치 - 글자가 정확히 같음
    if (inputChar === targetChar) {
      hints.push('🥕');
      continue;
    }

    // 각 글자의 자음, 모음 성분 분해
    const inputComponents = getHangulComponents(inputChar);
    const targetComponents = getHangulComponents(targetChar);
    const otherTargetComponents = getHangulComponents(targetChars[1 - i]);

    // 현재 위치에서 일치하는 성분 개수 계산
    const currentMatches = inputComponents.filter(comp =>
      targetComponents.includes(comp)
    ).length;

    // 반대편 위치에서 일치하는 성분 개수 계산
    const otherMatches = inputComponents.filter(comp =>
      otherTargetComponents.includes(comp)
    ).length;

    // 힌트 우선순위에 따른 판정
    if (currentMatches >= 2 && inputComponents[0] === targetComponents[0]) {
      // 🍄 비슷해요 - 2개 이상 성분 일치 + 첫 자음 일치
      hints.push('🍄');
    } else if (currentMatches >= 2) {
      // 🧄 많을 거예요 - 2개 이상 성분 일치 + 첫 자음 불일치
      hints.push('🧄');
    } else if (otherMatches >= 1) {
      // 🍌 반대로요 - 반대편 글자에서 1개 이상 성분 일치
      hints.push('🍌');
    } else if (currentMatches === 1) {
      // 🍆 가지고 있어요 - 현재 위치에서 1개 성분 일치
      hints.push('🍆');
    } else {
      // 🍎 사과해요 - 일치하는 성분 없음
      hints.push('🍎');
    }
  }

  return hints;
};

/**
 * 게임 승리 조건 확인
 * @param inputWord - 입력 단어
 * @param targetWord - 정답 단어
 * @returns 승리 여부
 * 
 * @example
 * checkWinCondition('사랑', '사랑') // true
 * checkWinCondition('사과', '사랑') // false
 */
export const checkWinCondition = (inputWord: string, targetWord: string): boolean => {
  return inputWord === targetWord;
};

/**
 * 게임 패배 조건 확인 (최대 시도 횟수 초과)
 * @param attempts - 현재 시도 횟수
 * @param maxAttempts - 최대 시도 횟수 (기본값: 7)
 * @returns 패배 여부
 * 
 * @example
 * checkLoseCondition(7, 7) // true
 * checkLoseCondition(5, 7) // false
 */
export const checkLoseCondition = (attempts: number, maxAttempts: number = 7): boolean => {
  return attempts >= maxAttempts;
};

/**
 * 힌트 통계 계산 (디버깅 및 분석용)
 * @param hints - 힌트 배열
 * @returns 각 힌트별 개수
 * 
 * @example
 * calculateHintStats(['🥕', '🍄', '🍎'])
 * // { '🥕': 1, '🍄': 1, '🧄': 0, '🍆': 0, '🍌': 0, '🍎': 1 }
 */
export const calculateHintStats = (hints: HintType[]) => {
  const stats = {
    '🥕': 0, // 완전 일치
    '🍄': 0, // 비슷해요
    '🧄': 0, // 많을 거예요
    '🍆': 0, // 가지고 있어요
    '🍌': 0, // 반대로요
    '🍎': 0  // 사과해요
  };

  hints.forEach(hint => {
    stats[hint]++;
  });

  return stats;
};

/**
 * 게임 난이도 점수 계산
 * @param attempts - 시도 횟수
 * @param maxAttempts - 최대 시도 횟수
 * @param hints - 모든 힌트 배열
 * @returns 점수 (0-100)
 * 
 * @example
 * calculateScore(3, 7, [['🥕', '🍄'], ['🍄', '🧄'], ['🥕', '🥕']])
 * // 높은 점수 (적은 시도 + 좋은 힌트)
 */
export const calculateScore = (
  attempts: number, 
  maxAttempts: number = 7, 
  allHints: HintType[][] = []
): number => {
  if (attempts >= maxAttempts) return 0;

  // 기본 점수 (시도 횟수에 반비례)
  const baseScore = Math.max(0, 100 - (attempts * 10));

  // 힌트 품질 보너스 (🥕이 많을수록 높은 점수)
  const hintBonus = allHints.flat().filter(hint => hint === '🥕').length * 5;

  return Math.min(100, baseScore + hintBonus);
};

/**
 * 게임 진행 상태 타입
 */
export type GameProgress = {
  isWon: boolean;
  isLost: boolean;
  isOngoing: boolean;
  currentAttempt: number;
  remainingAttempts: number;
  score: number;
};

/**
 * 현재 게임 진행 상태 계산
 * @param inputWord - 현재 입력 단어
 * @param targetWord - 정답 단어
 * @param attempts - 시도 횟수
 * @param allHints - 모든 힌트 기록
 * @param maxAttempts - 최대 시도 횟수
 * @returns 게임 진행 상태 객체
 */
export const getGameProgress = (
  inputWord: string,
  targetWord: string,
  attempts: number,
  allHints: HintType[][] = [],
  maxAttempts: number = 7
): GameProgress => {
  const isWon = checkWinCondition(inputWord, targetWord);
  const isLost = checkLoseCondition(attempts, maxAttempts);
  const isOngoing = !isWon && !isLost;
  const score = isWon ? calculateScore(attempts, maxAttempts, allHints) : 0;

  return {
    isWon,
    isLost,
    isOngoing,
    currentAttempt: attempts,
    remainingAttempts: Math.max(0, maxAttempts - attempts),
    score
  };
};