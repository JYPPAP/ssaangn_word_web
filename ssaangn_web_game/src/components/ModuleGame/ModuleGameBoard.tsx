/**
 * JavaScript modules를 활용한 게임 보드 컴포넌트
 */

import React from 'react';
import type { HintResult } from '../../types/modules';
import './ModuleGameBoard.css';

interface GameCell {
  letters: string[];
  hints: HintResult[];
  submitted: boolean;
}

interface ModuleGameBoardProps {
  board: GameCell[];
  currentRow: number;
  currentGuess: string[];
  animated?: boolean;
  compact?: boolean;
}

const ModuleGameBoard: React.FC<ModuleGameBoardProps> = ({
  board,
  currentRow,
  currentGuess,
  animated = true,
  compact = false
}) => {
  
  const getCellClass = (rowIndex: number, cellIndex: number, cell: GameCell) => {
    let className = 'game-cell';
    
    if (compact) className += ' compact';
    if (animated) className += ' animated';
    
    // 제출된 행
    if (cell.submitted) {
      className += ' submitted';
      
      // 힌트에 따른 색상
      if (cell.hints[cellIndex]) {
        const hint = cell.hints[cellIndex];
        switch (hint.emoji) {
          case '🥕': // 정확
            className += ' correct';
            break;
          case '🍄': // 비슷
            className += ' similar';
            break;
          case '🧄': // 많음
            className += ' many';
            break;
          case '🍆': // 존재
            className += ' exists';
            break;
          case '🍌': // 반대
            className += ' opposite';
            break;
          default: // 없음
            className += ' none';
        }
      }
    }
    // 현재 입력 중인 행
    else if (rowIndex === currentRow) {
      className += ' current';
      
      // 현재 입력된 글자가 있는 셀
      if (currentGuess[cellIndex]) {
        className += ' filled';
      }
      
      // 현재 입력 위치
      if (cellIndex === currentGuess.findIndex(char => char === '')) {
        className += ' active';
      }
    }
    // 비어있는 행
    else {
      className += ' empty';
    }
    
    return className;
  };

  const getCellContent = (rowIndex: number, cellIndex: number, cell: GameCell) => {
    if (cell.submitted) {
      return cell.letters[cellIndex] || '';
    } else if (rowIndex === currentRow) {
      return currentGuess[cellIndex] || '';
    } else {
      return '';
    }
  };

  const getHintElement = (hint: HintResult) => {
    return (
      <div 
        className="cell-hint"
        title={hint.description}
        style={{ backgroundColor: hint.color }}
      >
        <span className="hint-emoji">{hint.emoji}</span>
      </div>
    );
  };

  return (
    <div className={`module-game-board ${compact ? 'compact' : ''}`}>
      <div className="board-header">
        <h2 className="board-title">
          <span className="title-icon">🎯</span>
          한글 단어 맞추기
        </h2>
        <div className="board-info">
          <span className="info-text">2글자 한글 단어를 맞춰보세요!</span>
        </div>
      </div>
      
      <div className="board-grid">
        {board.map((row, rowIndex) => (
          <div 
            key={rowIndex} 
            className={`board-row ${rowIndex === currentRow ? 'current-row' : ''}`}
          >
            <div className="row-number">
              {rowIndex + 1}
            </div>
            
            <div className="row-cells">
              {[0, 1].map(cellIndex => (
                <div
                  key={cellIndex}
                  className={getCellClass(rowIndex, cellIndex, row)}
                  data-row={rowIndex}
                  data-cell={cellIndex}
                >
                  <div className="cell-content">
                    <span className="cell-letter">
                      {getCellContent(rowIndex, cellIndex, row)}
                    </span>
                  </div>
                  
                  {row.submitted && row.hints[cellIndex] && (
                    getHintElement(row.hints[cellIndex])
                  )}
                </div>
              ))}
            </div>
            
            <div className="row-status">
              {row.submitted && (
                <div className="row-result">
                  {row.hints.every(hint => hint.emoji === '🥕') ? (
                    <span className="result-correct">✓</span>
                  ) : (
                    <div className="result-hints">
                      {row.hints.map((hint, idx) => (
                        <span key={idx} className="mini-hint" title={hint.description}>
                          {hint.emoji}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {rowIndex === currentRow && (
                <div className="row-current">
                  <span className="current-indicator">→</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="board-footer">
        <div className="hint-legend">
          <div className="legend-title">힌트 설명</div>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-emoji">🥕</span>
              <span className="legend-text">정확해요!</span>
            </div>
            <div className="legend-item">
              <span className="legend-emoji">🍄</span>
              <span className="legend-text">비슷해요!</span>
            </div>
            <div className="legend-item">
              <span className="legend-emoji">🧄</span>
              <span className="legend-text">많이 포함되어 있어요!</span>
            </div>
            <div className="legend-item">
              <span className="legend-emoji">🍆</span>
              <span className="legend-text">포함되어 있어요!</span>
            </div>
            <div className="legend-item">
              <span className="legend-emoji">🍌</span>
              <span className="legend-text">반대 위치에 있어요!</span>
            </div>
            <div className="legend-item">
              <span className="legend-emoji">🍎</span>
              <span className="legend-text">포함되어 있지 않아요</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleGameBoard;