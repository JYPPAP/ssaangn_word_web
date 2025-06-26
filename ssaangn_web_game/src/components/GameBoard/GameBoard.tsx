/**
 * 게임 보드 컴포넌트
 *
 * 7줄의 게임 행을 표시하며, 각 행은 입력 영역과 결과 영역으로 구성됩니다.
 * - 현재 입력 중인 행 하이라이트
 * - 힌트 아이콘 색상별 표시
 * - 게임 상태에 따른 시각적 피드백
 * - 애니메이션 효과
 */

import React, {useMemo} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {useGame, useGameKeyboard} from '../../hooks';
import { useGlobalToast } from '../../hooks/useToast';
import { ToastContainer } from '../UI/Toast';
import GameRow from './GameRow';
import './GameBoard.css';

interface GameBoardProps {
  /** 애니메이션 사용 여부 (기본값: true) */
  animated?: boolean;
  /** 컴팩트 모드 (작은 화면용) */
  compact?: boolean;
  /** 힌트 표시 여부 */
  showHints?: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({
                                               animated = true,
                                               compact = false,
                                               showHints = true
                                             }) => {
  const game = useGame();
  const toast = useGlobalToast();

  // 키보드 입력 처리
  useGameKeyboard(
    () => {
      if (game.currentWord.length === 2) {
        game.actions.submitWord(game.currentWord);
      } else {
        toast.showGameError('invalid_length');
      }
    },
    () => {
      if (game.currentWord.length > 0) {
        game.actions.updateCurrentWord(game.currentWord.slice(0, -1));
      }
    },
    (char) => {
      if (game.currentWord.length < 2) {
        game.actions.updateCurrentWord(game.currentWord + char);
      }
    }
  );

  // 게임 보드 상태 계산
  const boardState = useMemo(() => {
    const totalRows = game.rows.length;
    const completedRows = game.rows.filter(row => row.isSubmitted).length;
    const progressPercentage = (completedRows / totalRows) * 100;

    return {
      totalRows,
      completedRows,
      progressPercentage,
      hasActiveRow: game.gameStatus === 'playing',
      currentRowIndex: game.currentRowIndex
    };
  }, [game.rows, game.gameStatus, game.currentRowIndex]);

  // 게임 상태에 따른 보드 클래스
  const getBoardClass = () => {
    let className = 'game-board';
    if (compact) className += ' compact';
    if (game.gameStatus === 'won') className += ' won';
    if (game.gameStatus === 'lost') className += ' lost';
    if (game.isLoading) className += ' loading';
    return className;
  };

  // 애니메이션 variants
  const boardVariants = {
    hidden: {opacity: 0, y: 20},
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {duration: 0.3}
    }
  };

  const rowVariants = {
    hidden: {opacity: 0, x: -20},
    visible: {
      opacity: 1,
      x: 0,
      transition: {type: "spring" as const, stiffness: 100}
    }
  };

  return (
    <div className={getBoardClass()}>
      {/* 진행률 표시 */}
      <div className="board-progress">
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{width: 0}}
            animate={{width: `${boardState.progressPercentage}%`}}
            transition={{duration: 0.5}}
          />
        </div>
        <span className="progress-text">
          {boardState.completedRows}/{boardState.totalRows} 시도
        </span>
      </div>

      {/* 게임 행들 */}
      <motion.div
        className="board-rows"
        variants={animated ? boardVariants : undefined}
        initial={animated ? "hidden" : undefined}
        animate={animated ? "visible" : undefined}
        exit={animated ? "exit" : undefined}
      >
        {game.rows.map((row, index) => {
          const isActive = index === game.currentRowIndex && game.gameStatus === 'playing';
          const isCompleted = row.isSubmitted;
          const isPending = index > game.currentRowIndex;

          return (
            <motion.div
              key={`row-${index}`}
              variants={animated ? rowVariants : undefined}
              layout={animated}
              className={`row-container ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isPending ? 'pending' : ''}`}
            >
              <div className="row-number">{index + 1}</div>
              <GameRow
                row={row}
                isActive={isActive}
                isCompleted={isCompleted}
                isPending={isPending}
                currentWord={isActive ? game.currentWord : ''}
                showHints={showHints}
                animated={animated}
              />

              {/* 행 상태 인디케이터 */}
              <div className="row-status">
                <AnimatePresence>
                  {isCompleted && (
                    <motion.div
                      className={`status-icon ${game.gameStatus === 'won' && index === game.currentRowIndex - 1 ? 'winning' : ''}`}
                      initial={{scale: 0}}
                      animate={{scale: 1}}
                      exit={{scale: 0}}
                      transition={{delay: 0.3}}
                    >
                      {row.cells.every(cell => cell.hint === '🥕') ? '🎉' : '✓'}
                    </motion.div>
                  )}
                  {isActive && (
                    <motion.div
                      className="status-icon active"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      ⏳
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })
        }
      </motion.div>


      {/* 게임 상태 메시지 */}
      <AnimatePresence>
        {game.gameStatus !== 'playing' && (
          <motion.div
            className={`game-result ${game.gameStatus}`}
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -20}}
            transition={{delay: 0.5}}
          >
            {game.gameStatus === 'won' ? (
              <div className="result-content">
                <div className="result-icon">🎉</div>
                <div className="result-text">
                  <h3>축하합니다!</h3>
                  <p>{game.attempts}번 만에 성공하셨네요!</p>
                  <p>점수: 0점</p>
                </div>
              </div>
            ) : (
              <div className="result-content">
                <div className="result-icon">😢</div>
                <div className="result-text">
                  <h3>아쉽네요!</h3>
                  <p>정답은 "<strong>{game.targetWord}</strong>"였습니다.</p>
                  <p>다시 도전해보세요!</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast 컨테이너 */}
      <ToastContainer
        toasts={toast.toasts}
        onClose={toast.removeToast}
        position={toast.position}
        maxToasts={3}
      />

      {/* 기존 오류 메시지 (Toast로 대체될 예정) */}
      <AnimatePresence>
        {game.error && (
          <motion.div
            className="error-message"
            initial={{opacity: 0, y: 10}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -10}}
          >
            <span className="error-icon">⚠️</span>
            {game.error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 로딩 오버레이 */}
      <AnimatePresence>
        {game.isLoading && (
          <motion.div
            className="loading-overlay"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
          >
            <div className="loading-spinner">
              <motion.div
                className="spinner"
                animate={{rotate: 360}}
                transition={{duration: 1, repeat: Infinity, ease: "linear"}}
              />
              <span>처리 중...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameBoard;