/**
 * 가상 키보드 컴포넌트
 * 
 * 한글 자모 배열 키보드를 제공합니다.
 * - 모바일 친화적인 터치 인터페이스
 * - 시각적 피드백 및 애니메이션
 * - 게임 상태에 따른 버튼 활성화/비활성화
 * - 키보드 레이아웃 커스터마이징
 * - 햅틱 피드백 (모바일)
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame, useGameKeyboard } from '../../hooks';
import './VirtualKeyboard.css';

// 한글 키보드 레이아웃 (기본 자모만)
const HANGUL_LAYOUT = [
  // 첫 번째 줄 - 자음
  ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅁ', 'ㄴ', 'ㅇ', 'ㄹ'],
  // 두 번째 줄 - 자음
  ['ㅎ', 'ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅆ', 'ㄲ', 'ㄸ', 'ㅃ', 'ㅉ'],
  // 세 번째 줄 - 모음
  ['ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
  // 네 번째 줄 - 모음
  ['ㅡ', 'ㅠ', 'ㅜ']
];

// 키 타입 정의
type KeyType = 'consonant' | 'vowel' | 'action';

interface VirtualKeyboardProps {
  /** 컴팩트 모드 (작은 화면용) */
  compact?: boolean;
  /** 애니메이션 사용 여부 */
  animated?: boolean;
  /** 햅틱 피드백 사용 여부 */
  hapticFeedback?: boolean;
  /** 키보드 레이아웃 모드 */
  layoutMode?: 'standard' | 'split' | 'floating';
  /** 소리 효과 사용 여부 */
  soundEnabled?: boolean;
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  compact = false,
  animated = true,
  hapticFeedback = true,
  layoutMode = 'standard',
  soundEnabled = false
}) => {
  const game = useGame();
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  // 키 조합 상태는 나중에 필요시 구현

  // 햅틱 피드백 함수
  const triggerHapticFeedback = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!hapticFeedback || !navigator.vibrate) return;
    
    const patterns = {
      light: [10],
      medium: [25],
      heavy: [50]
    };
    
    navigator.vibrate(patterns[intensity]);
  }, [hapticFeedback]);

  // 소리 효과 함수
  const playSound = useCallback((type: 'key' | 'submit' | 'delete' | 'error') => {
    if (!soundEnabled) return;
    
    // Web Audio API를 사용한 간단한 사운드 생성
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    const frequencies = {
      key: 800,
      submit: 1000,
      delete: 600,
      error: 400
    };
    
    oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }, [soundEnabled]);


  // 키 입력 처리 - 단순화된 버전
  const handleKeyPress = useCallback((key: string) => {
    if (game.gameStatus !== 'playing') {
      triggerHapticFeedback('heavy');
      playSound('error');
      return;
    }

    // 키 시각적 피드백
    setPressedKeys(prev => new Set(prev).add(key));
    setTimeout(() => {
      setPressedKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }, 150);

    triggerHapticFeedback('light');
    playSound('key');

    // 자모를 게임보드로 직접 전달
    game.actions.inputJamo(key);
  }, [game, triggerHapticFeedback, playSound]);


  // 백스페이스 처리
  const handleBackspace = useCallback(() => {
    triggerHapticFeedback('medium');
    playSound('delete');
    game.actions.backspace();
  }, [game, triggerHapticFeedback, playSound]);

  // 단어 제출 처리
  const handleSubmit = useCallback(() => {
    if (game.currentWord.length !== 2) {
      triggerHapticFeedback('heavy');
      playSound('error');
      return;
    }

    triggerHapticFeedback('heavy');
    playSound('submit');
    game.actions.submitWord(game.currentWord);
  }, [game, triggerHapticFeedback, playSound]);

  // 키보드 단축키 처리
  useGameKeyboard(
    handleSubmit,
    handleBackspace,
    (char) => {
      const allChars = HANGUL_LAYOUT.flat();
      if (allChars.includes(char)) {
        handleKeyPress(char);
      }
    }
  );

  // 키보드 스타일 클래스
  const getKeyboardClass = () => {
    let className = 'virtual-keyboard';
    if (compact) className += ' compact';
    if (layoutMode !== 'standard') className += ` ${layoutMode}`;
    return className;
  };

  // 키 스타일 클래스
  const getKeyClass = (key: string, keyType: KeyType) => {
    let className = `keyboard-key ${keyType}-key`;
    if (pressedKeys.has(key)) className += ' pressed';
    if (game.gameStatus !== 'playing') className += ' disabled';
    return className;
  };

  // 애니메이션 variants
  const keyboardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.05 
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: "spring", 
        stiffness: 100 
      }
    }
  };

  const keyVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring", stiffness: 200 }
    },
    pressed: {
      scale: 0.95,
      backgroundColor: '#007bff',
      color: 'white',
      transition: { duration: 0.1 }
    }
  };

  return (
    <motion.div
      className={getKeyboardClass()}
      variants={animated ? keyboardVariants : undefined}
      initial={animated ? "hidden" : undefined}
      animate={animated ? "visible" : undefined}
    >
      {/* 단순화된 키보드 레이아웃 */}
      <div className="keyboard-rows">
        {HANGUL_LAYOUT.map((row, rowIndex) => (
          <motion.div
            key={rowIndex}
            className="keyboard-row"
            variants={animated ? rowVariants : undefined}
          >
            {row.map((key) => {
              const isConsonant = 'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎㄲㄸㅃㅆㅉ'.includes(key);
              const keyType = isConsonant ? 'consonant' : 'vowel';
              
              return (
                <motion.button
                  key={key}
                  className={getKeyClass(key, keyType)}
                  variants={animated ? keyVariants : undefined}
                  animate={pressedKeys.has(key) ? "pressed" : "visible"}
                  onClick={() => handleKeyPress(key)}
                  disabled={game.gameStatus !== 'playing'}
                  whileTap={{ scale: 0.9 }}
                >
                  <span className="key-main">{key}</span>
                </motion.button>
              );
            })}
          </motion.div>
        ))}
      </div>

      {/* 액션 버튼들 */}
      <motion.div 
        className="keyboard-actions"
        variants={animated ? rowVariants : undefined}
      >
        <motion.button
          className={getKeyClass('backspace', 'action')}
          variants={animated ? keyVariants : undefined}
          onClick={handleBackspace}
          disabled={game.gameStatus !== 'playing'}
          whileTap={{ scale: 0.95 }}
        >
          <span className="action-icon">⌫</span>
          <span className="action-text">지우기</span>
        </motion.button>
        
        <motion.button
          className={getKeyClass('submit', 'action')}
          variants={animated ? keyVariants : undefined}
          onClick={handleSubmit}
          disabled={game.currentWord.length !== 2 || game.gameStatus !== 'playing'}
          whileTap={{ scale: 0.95 }}
        >
          <span className="action-icon">⏎</span>
          <span className="action-text">입력</span>
        </motion.button>
      </motion.div>

      {/* 게임 상태 표시 */}
      <AnimatePresence>
        {game.gameStatus !== 'playing' && (
          <motion.div
            className="keyboard-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="overlay-content">
              {game.gameStatus === 'won' ? '🎉 게임 승리!' : '😔 게임 종료'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VirtualKeyboard;