// types/game.ts
export type HintType = '🥕' | '🍄' | '🧄' | '🍆' | '🍌' | '🍎';

export interface GameCell {
  char: string;
  hint: HintType | null;
}

export interface GameRow {
  cells: GameCell[];
  isSubmitted: boolean;
}

export interface Word {
  id: number;
  text: string;
  meaning: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface GameState {
  currentWord: string;
  targetWord: string;
  rows: GameRow[];
  currentRowIndex: number;
  gameStatus: 'playing' | 'won' | 'lost';
  attempts: number;
}

export interface GameSettings {
  maxLives: number;
  timeLimit: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface GameStats {
  totalGames: number;
  highScore: number;
  averageScore: number;
  wordsGuessed: number;
}

export interface HangulDecomposed {
  consonant: string;
  vowel: string;
  finalConsonant?: string;
}