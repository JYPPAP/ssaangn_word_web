/**
 * 게임 행 컴포넌트
 * 
 * 각 시도를 나타내는 행으로, 입력 영역(2칸)과 결과 영역(2칸)으로 구성됩니다.
 * - 현재 입력 중인 행 하이라이트
 * - 제출된 행의 결과 표시
 * - 애니메이션 효과
 * - 힌트 시각화
 */

import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameRow as GameRowType, HintType } from '../../types/game';
import GameCell from './GameCell';

interface GameRowProps {
  /** 행 데이터 */
  row: GameRowType;
  /** 현재 활성 행 여부 */
  isActive: boolean;
  /** 완료된 행 여부 */
  isCompleted: boolean;
  /** 대기 중인 행 여부 */
  isPending: boolean;
  /** 현재 입력 중인 단어 */
  currentWord: string;
  /** 힌트 표시 여부 */
  showHints?: boolean;
  /** 애니메이션 사용 여부 */
  animated?: boolean;
}

const GameRow: React.FC<GameRowProps> = ({ 
  row, 
  isActive, 
  isCompleted,
  isPending,
  currentWord, 
  showHints = true,
  animated = true
}) => {
  const [revealHints, setRevealHints] = useState(false);

  // 각 셀에 표시할 문자 계산
  const getDisplayChar = (index: number): string => {
    if (row.isSubmitted) {
      return row.cells[index].char;
    }
    if (isActive && currentWord[index]) {
      return currentWord[index];
    }
    return '';
  };

  // 힌트 공개 애니메이션
  useEffect(() => {
    if (isCompleted && showHints) {
      const timer = setTimeout(() => {
        setRevealHints(true);
      }, 300); // 행 완료 후 300ms 지연
      return () => clearTimeout(timer);
    }
  }, [isCompleted, showHints]);

  // 행 상태에 따른 클래스
  const getRowClass = () => {
    let className = 'game-row';
    if (isActive) className += ' active';
    if (isCompleted) className += ' completed';
    if (isPending) className += ' pending';
    
    // 완벽한 답 체크 (모든 힌트가 🥕)
    if (isCompleted && row.cells.every(cell => cell.hint === '🥕')) {
      className += ' perfect';
    }
    
    return className;
  };

  // 행 점수 계산
  const rowScore = useMemo(() => {
    if (!isCompleted) return null;
    
    const hintScores = {
      '🥕': 10, // 완전 일치
      '🍄': 8,  // 비슷해요
      '🧄': 6,  // 많을 거예요
      '🍆': 4,  // 가지고 있어요
      '🍌': 2,  // 반대로요
      '🍎': 0   // 사과해요
    };
    
    return row.cells.reduce((total, cell) => {
      return total + (hintScores[cell.hint!] || 0);
    }, 0);
  }, [isCompleted, row.cells]);

  // 애니메이션 variants
  const rowVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.3,
        staggerChildren: 0.1 
      }
    },
    completed: {
      scale: [1, 1.02, 1],
      transition: { duration: 0.4 }
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring" as const, stiffness: 200 }
    }
  };

  const separatorVariants = {
    hidden: { scaleX: 0 },
    visible: { 
      scaleX: 1,
      transition: { duration: 0.3, delay: 0.2 }
    }
  };

  return (
    <motion.div
      className={getRowClass()}
      variants={animated ? rowVariants : undefined}
      initial={animated ? "hidden" : undefined}
      animate={animated ? (isCompleted ? "completed" : "visible") : undefined}
      layout={animated}
    >
      {/* 입력 섹션 */}
      <motion.div 
        className="input-section"
        variants={animated ? sectionVariants : undefined}
      >
        <GameCell
          char={getDisplayChar(0)}
          hint={null}
          isInput={true}
          isActive={isActive && currentWord.length === 0}
          animated={animated}
        />
        <GameCell
          char={getDisplayChar(1)}
          hint={null}
          isInput={true}
          isActive={isActive && currentWord.length === 1}
          animated={animated}
        />
      </motion.div>

      {/* 구분선 */}
      <motion.div 
        className="row-separator"
        variants={animated ? separatorVariants : undefined}
      >
        <div className="separator-line" />
        <div className="separator-arrow">→</div>
      </motion.div>

      {/* 결과 섹션 */}
      <motion.div 
        className="result-section"
        variants={animated ? sectionVariants : undefined}
      >
        <AnimatePresence>
          {showHints && (revealHints || !animated) && (
            <>
              <GameCell
                char=""
                hint={row.cells[0].hint}
                isInput={false}
                revealed={revealHints}
                animated={animated}
                delay={0}
              />
              <GameCell
                char=""
                hint={row.cells[1].hint}
                isInput={false}
                revealed={revealHints}
                animated={animated}
                delay={0.1}
              />
            </>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 행 점수 표시 */}
      <AnimatePresence>
        {isCompleted && rowScore !== null && (
          <motion.div
            className="row-score"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ delay: 0.5 }}
          >
            <span className="score-value">{rowScore}</span>
            <span className="score-label">점</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 완벽한 답 효과 */}
      <AnimatePresence>
        {isCompleted && row.cells.every(cell => cell.hint === '🥕') && (
          <motion.div
            className="perfect-effect"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1.5, 2],
            }}
            transition={{ 
              duration: 1.5,
              times: [0, 0.5, 1]
            }}
          >
            ✨
          </motion.div>
        )}
      </AnimatePresence>

      {/* 행 힌트 요약 */}
      {isCompleted && showHints && (
        <div className="row-summary">
          <div className="hint-distribution">
            {(['🥕', '🍄', '🧄', '🍆', '🍌', '🍎'] as HintType[]).map(hintType => {
              const count = row.cells.filter(cell => cell.hint === hintType).length;
              if (count === 0) return null;
              
              return (
                <motion.span
                  key={hintType}
                  className={`hint-count hint-${hintType}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  {hintType}×{count}
                </motion.span>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default GameRow;