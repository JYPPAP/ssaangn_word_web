// data/dictionary.ts
import type { Word } from '../types/game';

export const dictionary: Word[] = [
  {
    id: 1,
    text: '사랑',
    meaning: '남을 아끼고 귀중히 여기는 마음',
    difficulty: 'easy'
  },
  {
    id: 2,
    text: '행복',
    meaning: '만족스러운 상태',
    difficulty: 'easy'
  },
  {
    id: 3,
    text: '희망',
    meaning: '앞으로 이루어질 좋은 일에 대한 기대',
    difficulty: 'easy'
  },
  {
    id: 4,
    text: '노력',
    meaning: '목적을 이루기 위해 애를 씀',
    difficulty: 'medium'
  },
  {
    id: 5,
    text: '성공',
    meaning: '목적한 일을 이루어냄',
    difficulty: 'medium'
  },
  {
    id: 6,
    text: '도전',
    meaning: '어려운 일에 맞서 싸움',
    difficulty: 'medium'
  },
  {
    id: 7,
    text: '지혜',
    meaning: '사물의 이치를 깨달아 아는 슬기',
    difficulty: 'hard'
  },
  {
    id: 8,
    text: '인연',
    meaning: '사람과 사람 사이의 관계',
    difficulty: 'hard'
  },
  {
    id: 9,
    text: '소망',
    meaning: '바라는 마음',
    difficulty: 'hard'
  }
];

// 게임에서 사용할 단어 목록 (text만 추출)
export const WORD_LIST = dictionary.map(word => word.text);

// 단어 유효성 검사
export const isValidWord = (word: string): boolean => {
  return dictionary.some(w => w.text === word);
};