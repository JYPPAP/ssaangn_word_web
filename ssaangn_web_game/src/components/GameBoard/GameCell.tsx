/**
 * 게임 셀 컴포넌트
 * 
 * 개별 글자나 힌트를 표시하는 셀입니다.
 * - 입력 셀: 사용자가 입력한 한글 문자 표시
 * - 결과 셀: 힌트 이모지 표시 (🥕🍄🧄🍆🍌🍎)
 * - 애니메이션 효과 및 시각적 피드백
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { HintType } from '../../types/game';

interface GameCellProps {
  /** 표시할 문자 (입력 셀용) */
  char: string;
  /** 힌트 타입 (결과 셀용) */
  hint: HintType | null;
  /** 입력 셀 여부 */
  isInput: boolean;
  /** 활성 상태 (현재 커서 위치) */
  isActive?: boolean;
  /** 힌트 공개 여부 */
  revealed?: boolean;
  /** 애니메이션 사용 여부 */
  animated?: boolean;
  /** 애니메이션 지연 시간 */
  delay?: number;
}

// 힌트별 색상 및 설명 매핑
const HINT_CONFIG = {
  '🥕': {
    name: '당연하죠',
    description: '해당 글자와 완전히 일치',
    color: '#ff6b35',
    bgColor: '#fff5f2'
  },
  '🍄': {
    name: '비슷해요',
    description: '자음과 모음 중 2개 이상 일치 + 첫 자음 일치',
    color: '#8b5a3c',
    bgColor: '#f5f1ed'
  },
  '🧄': {
    name: '많을 거예요',
    description: '자음과 모음 중 2개 이상 일치 + 첫 자음 불일치',
    color: '#f4f3f0',
    bgColor: '#faf9f8'
  },
  '🍆': {
    name: '가지고 있어요',
    description: '자음과 모음 중 1개만 일치',
    color: '#663399',
    bgColor: '#f7f0ff'
  },
  '🍌': {
    name: '반대로요',
    description: '반대편 글자에서 자음/모음 일치',
    color: '#ffeb3b',
    bgColor: '#fffef7'
  },
  '🍎': {
    name: '사과해요',
    description: '일치하는 자음/모음 없음',
    color: '#ff1744',
    bgColor: '#fff1f1'
  }
} as const;

const GameCell: React.FC<GameCellProps> = ({ 
  char, 
  hint, 
  isInput, 
  isActive = false,
  revealed = true,
  animated = true,
  delay = 0
}) => {
  // 셀 설정 계산
  const cellConfig = useMemo(() => {
    const hasContent = isInput ? !!char : !!hint;
    const hintConfig = hint ? HINT_CONFIG[hint] : null;
    
    return {
      hasContent,
      hintConfig,
      displayValue: isInput ? char : hint,
      isEmpty: !hasContent
    };
  }, [char, hint, isInput]);

  // CSS 클래스 생성
  const getCellClass = () => {
    let className = 'game-cell';
    
    if (isInput) {
      className += ' input-cell';
      if (cellConfig.hasContent) className += ' filled';
      if (isActive) className += ' active';
    } else {
      className += ' result-cell';
      if (cellConfig.hasContent) className += ' has-hint';
      if (hint) className += ` hint-${hint}`;
      if (revealed) className += ' revealed';
    }
    
    return className;
  };

  // 인라인 스타일 (힌트 색상 적용)
  const getCellStyle = () => {
    if (!isInput && hint && cellConfig.hintConfig) {
      return {
        '--hint-color': cellConfig.hintConfig.color,
        '--hint-bg': cellConfig.hintConfig.bgColor
      } as React.CSSProperties;
    }
    return {};
  };

  // 애니메이션 variants
  const cellVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      rotateY: -90
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotateY: 0,
      transition: { 
        type: "spring", 
        stiffness: 200, 
        damping: 20,
        delay 
      }
    },
    filled: {
      scale: [1, 1.1, 1],
      transition: { duration: 0.3 }
    },
    revealed: {
      rotateY: [180, 0],
      transition: { duration: 0.6, delay }
    },
    pulse: {
      scale: [1, 1.05, 1],
      transition: { 
        duration: 1.5, 
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { delay: delay + 0.1 }
    }
  };

  return (
    <motion.div
      className={getCellClass()}
      style={getCellStyle()}
      variants={animated ? cellVariants : undefined}
      initial={animated ? "hidden" : undefined}
      animate={animated ? [
        "visible",
        ...(cellConfig.hasContent ? ["filled"] : []),
        ...(isActive ? ["pulse"] : []),
        ...(!isInput && revealed ? ["revealed"] : [])
      ] : undefined}
      whileHover={isInput ? { scale: 1.02 } : undefined}
      whileTap={isInput ? { scale: 0.98 } : undefined}
      layout={animated}
    >
      {/* 셀 내용 */}
      <AnimatePresence mode="wait">
        {cellConfig.hasContent && (
          <motion.div
            className="cell-content"
            variants={animated ? contentVariants : undefined}
            initial={animated ? "hidden" : undefined}
            animate={animated ? "visible" : undefined}
            exit={animated ? "hidden" : undefined}
            key={cellConfig.displayValue}
          >
            {cellConfig.displayValue}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 활성 커서 */}
      <AnimatePresence>
        {isActive && !cellConfig.hasContent && (
          <motion.div
            className="cell-cursor"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              transition: { 
                duration: 1, 
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            exit={{ opacity: 0 }}
          >
            |
          </motion.div>
        )}
      </AnimatePresence>

      {/* 힌트 설명 툴팁 */}
      {!isInput && hint && cellConfig.hintConfig && (
        <div className="cell-tooltip">
          <div className="tooltip-content">
            <div className="tooltip-title">
              {hint} {cellConfig.hintConfig.name}
            </div>
            <div className="tooltip-description">
              {cellConfig.hintConfig.description}
            </div>
          </div>
        </div>
      )}

      {/* 입력 가이드 */}
      {isInput && !cellConfig.hasContent && !isActive && (
        <div className="cell-guide">
          <span>?</span>
        </div>
      )}
    </motion.div>
  );
};

export default GameCell;