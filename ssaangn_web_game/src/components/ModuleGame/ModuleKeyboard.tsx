/**
 * JavaScript modules를 활용한 한글 키보드 컴포넌트
 */

import React, { useEffect } from 'react';
import './ModuleKeyboard.css';

interface ModuleKeyboardProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  onHint?: () => void;
  disabled?: boolean;
  compact?: boolean;
  animated?: boolean;
  hintsUsed?: boolean;
}

const ModuleKeyboard: React.FC<ModuleKeyboardProps> = ({
  onKeyPress,
  onDelete,
  onSubmit,
  onHint,
  disabled = false,
  compact = false,
  animated = true,
  hintsUsed = false
}) => {

  // 컴팩트 키보드 레이아웃
  const compactKeyboardRows = [
    // 첫 번째 줄: ㅃㅉㄸㄲㅆㅒㅖ(지우기)
    ['ㅃ', 'ㅉ', 'ㄸ', 'ㄲ', 'ㅆ', 'ㅒ', 'ㅖ'],
    // 두 번째 줄: ㅂㅈㄷㄱㅅㅛㅕㅑㅐㅔ
    ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
    // 세 번째 줄: ㅁㄴㅇㄹㅎㅗㅓㅏㅣ
    ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
    // 네 번째 줄: ㅋㅌㅊㅍㅠㅜㅡ(입력)
    ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ']
  ];

  // 컴포넌트 마운트 시 키보드 색상 초기화
  useEffect(() => {
    const resetKeyboardColors = () => {
      // 모든 키보드 버튼의 색상 초기화
      const keyboardButtons = document.querySelectorAll('.keyboard-button');
      keyboardButtons.forEach((button) => {
        if (button instanceof HTMLElement) {
          button.style.backgroundColor = '';
          button.style.color = '';
          button.classList.remove('correct', 'present', 'absent', 'disabled');
        }
      });
    };

    // 약간의 지연 후 초기화 (DOM이 완전히 렌더링된 후)
    const timer = setTimeout(resetKeyboardColors, 100);
    return () => clearTimeout(timer);
  }, []);

  // 키 클릭 핸들러
  const handleKeyClick = (key: string) => {
    if (disabled) return;
    onKeyPress(key);
  };

  // 힌트 클릭 핸들러
  const handleHintClick = () => {
    if (disabled || hintsUsed) return;
    if (onHint) {
      onHint();
    }
  };

  // 키 클래스 생성
  const getKeyClass = (isSpecial = false) => {
    let className = 'keyboard-key';
    
    if (compact) className += ' compact';
    if (animated) className += ' animated';
    if (isSpecial) className += ' special';
    if (disabled) className += ' disabled';
    
    return className;
  };

  return (
    <div className={`module-keyboard ${compact ? 'compact' : ''} ${disabled ? 'disabled' : ''}`}>
      <div className="keyboard-header compact">
        <div className="keyboard-info">
          <span className="info-text">자음과 모음을 조합해서 2글자 단어를 만드세요</span>
        </div>
      </div>

      <div className="keyboard-layout compact-layout">
        {compactKeyboardRows.map((row, rowIndex) => (
          <div key={rowIndex} className="compact-key-row">
            {/* 글자 키들 */}
            {row.map(key => (
              <button
                key={key}
                className={`keyboard-button ${getKeyClass()}`}
                onClick={() => handleKeyClick(key)}
                disabled={disabled}
                aria-label={`한글 ${key}`}
                data-key={key}
              >
                {key}
              </button>
            ))}
            
            {/* 첫 번째 줄 끝에 힌트 버튼과 지우기 버튼 */}
            {rowIndex === 0 && (
              <>
                <button
                  className={`keyboard-button ${getKeyClass(true)} hint-button ${hintsUsed ? 'used' : ''}`}
                  onClick={handleHintClick}
                  disabled={disabled || hintsUsed}
                  aria-label={hintsUsed ? "힌트 사용됨" : "힌트"}
                  title={hintsUsed ? "이미 힌트를 사용했습니다" : "힌트 사용하기"}
                >
                  <span className="key-icon">{hintsUsed ? '🎃' : '🎃'}</span>
                </button>
                <button
                  className={`keyboard-button ${getKeyClass(true)} delete-button`}
                  onClick={onDelete}
                  disabled={disabled}
                  aria-label="지우기"
                >
                  <span className="key-icon">⌫</span>
                </button>
              </>
            )}
            
            {/* 네 번째 줄 끝에 입력 버튼 */}
            {rowIndex === 3 && (
              <button
                className={`keyboard-button ${getKeyClass(true)} submit-button`}
                onClick={onSubmit}
                disabled={disabled}
                aria-label="입력"
              >
                <span className="key-icon">✓</span>
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="keyboard-footer compact">
        <div className="keyboard-tips">
          <div className="tip-item">
            <span className="tip-icon">💡</span>
            <span className="tip-text">이중 자음/모음 자동 변환 지원</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleKeyboard;