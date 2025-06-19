/**
 * 모달 컴포넌트
 * 
 * 게임 결과, 설정, 도움말 등을 표시하는 범용 모달 컴포넌트입니다.
 * - 승리/패배 메시지 표시
 * - 새 게임 시작 기능
 * - 접근성 고려 (키보드 네비게이션, ARIA)
 * - 반응형 디자인
 * - 애니메이션 효과
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import Button from './Button';
import './Modal.css';

interface ModalProps {
  /** 모달 열림 상태 */
  isOpen: boolean;
  /** 모달 닫기 콜백 */
  onClose: () => void;
  /** 모달 제목 */
  title?: string;
  /** 모달 크기 */
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  /** 모달 타입 (색상 테마) */
  type?: 'default' | 'success' | 'error' | 'warning' | 'info';
  /** 배경 클릭으로 닫기 비활성화 */
  disableBackdropClose?: boolean;
  /** ESC 키로 닫기 비활성화 */
  disableEscapeClose?: boolean;
  /** 모달 헤더 숨김 */
  hideHeader?: boolean;
  /** 모달 푸터 숨김 */
  hideFooter?: boolean;
  /** 닫기 버튼 숨김 */
  hideCloseButton?: boolean;
  /** 커스텀 푸터 액션 */
  footerActions?: React.ReactNode;
  /** 모달 내용 */
  children: React.ReactNode;
  /** 애니메이션 사용 여부 */
  animated?: boolean;
  /** z-index 값 */
  zIndex?: number;
  /** 모달 열림 시 콜백 */
  onOpen?: () => void;
  /** 모달 닫힘 후 콜백 */
  onAfterClose?: () => void;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'medium',
  type = 'default',
  disableBackdropClose = false,
  disableEscapeClose = false,
  hideHeader = false,
  hideFooter = false,
  hideCloseButton = false,
  footerActions,
  children,
  animated = true,
  zIndex = 1000,
  onOpen,
  onAfterClose
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  // 모달 열림/닫힘 처리
  useEffect(() => {
    if (isOpen) {
      // 현재 포커스된 요소 저장
      previousFocusRef.current = document.activeElement;
      
      // body 스크롤 방지
      document.body.style.overflow = 'hidden';
      
      // 모달에 포커스
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);
      
      onOpen?.();
    } else {
      // body 스크롤 복원
      document.body.style.overflow = '';
      
      // 이전 포커스 복원
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
      
      onAfterClose?.();
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, onOpen, onAfterClose]);

  // ESC 키 처리
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && !disableEscapeClose) {
      onClose();
    }
    
    // 탭 트래핑 (모달 내부에서만 포커스 이동)
    if (event.key === 'Tab' && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  }, [onClose, disableEscapeClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, handleKeyDown]);

  // 배경 클릭 처리
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget && !disableBackdropClose) {
      onClose();
    }
  }, [onClose, disableBackdropClose]);

  // 모달 스타일 클래스
  const getModalClass = () => {
    return `modal-content modal-${size} modal-${type}`;
  };

  // 애니메이션 variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8, 
      y: 50 
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      y: 50,
      transition: { duration: 0.2 }
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="modal-backdrop"
          style={{ zIndex }}
          variants={animated ? backdropVariants : undefined}
          initial={animated ? "hidden" : undefined}
          animate={animated ? "visible" : undefined}
          exit={animated ? "exit" : undefined}
          onClick={handleBackdropClick}
        >
          <motion.div
            ref={modalRef}
            className={getModalClass()}
            variants={animated ? modalVariants : undefined}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            {!hideHeader && (
              <div className="modal-header">
                {title && (
                  <h2 id="modal-title" className="modal-title">
                    {title}
                  </h2>
                )}
                {!hideCloseButton && (
                  <Button
                    variant="ghost"
                    size="small"
                    className="modal-close-button"
                    onClick={onClose}
                    aria-label="모달 닫기"
                  >
                    ✕
                  </Button>
                )}
              </div>
            )}

            {/* 모달 본문 */}
            <div className="modal-body">
              {children}
            </div>

            {/* 모달 푸터 */}
            {!hideFooter && (
              <div className="modal-footer">
                {footerActions || (
                  <Button onClick={onClose}>
                    닫기
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // 포털을 사용하여 body에 렌더링
  return createPortal(modalContent, document.body);
};

/**
 * 게임 결과 모달 컴포넌트
 */
interface GameResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameStatus: 'won' | 'lost';
  attempts: number;
  targetWord: string;
  score?: number;
  onNewGame: () => void;
  onRestart?: () => void;
  animated?: boolean;
}

export const GameResultModal: React.FC<GameResultModalProps> = ({
  isOpen,
  onClose,
  gameStatus,
  attempts,
  targetWord,
  score = 0,
  onNewGame,
  onRestart,
  animated = true
}) => {
  const isWon = gameStatus === 'won';
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isWon ? '🎉 축하합니다!' : '😔 아쉽네요!'}
      type={isWon ? 'success' : 'error'}
      size="medium"
      animated={animated}
      hideFooter
    >
      <div className="game-result-content">
        <div className="result-icon">
          {isWon ? '🎉' : '😢'}
        </div>
        
        <div className="result-details">
          {isWon ? (
            <>
              <p className="result-message">
                <strong>{attempts}번</strong> 만에 정답을 맞추셨네요!
              </p>
              {score > 0 && (
                <p className="result-score">
                  점수: <strong>{score}점</strong>
                </p>
              )}
            </>
          ) : (
            <>
              <p className="result-message">
                정답은 <strong>"{targetWord}"</strong>였습니다.
              </p>
              <p className="result-encouragement">
                다시 한 번 도전해보세요!
              </p>
            </>
          )}
        </div>
        
        <div className="result-actions">
          <Button
            variant="primary"
            size="large"
            onClick={onNewGame}
            className="new-game-button"
          >
            새 게임
          </Button>
          
          {onRestart && (
            <Button
              variant="secondary"
              size="large"
              onClick={onRestart}
              className="restart-button"
            >
              다시 하기
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="medium"
            onClick={onClose}
            className="close-button"
          >
            닫기
          </Button>
        </div>
      </div>
    </Modal>
  );
};

/**
 * 설정 모달 컴포넌트
 */
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    soundEnabled: boolean;
    animationsEnabled: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
    autoSave: boolean;
  };
  onSettingsChange: (settings: Partial<SettingsModalProps['settings']>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="⚙️ 게임 설정"
      size="medium"
    >
      <div className="settings-content">
        <div className="setting-group">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => onSettingsChange({ soundEnabled: e.target.checked })}
            />
            <span>소리 효과</span>
          </label>
        </div>
        
        <div className="setting-group">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={settings.animationsEnabled}
              onChange={(e) => onSettingsChange({ animationsEnabled: e.target.checked })}
            />
            <span>애니메이션</span>
          </label>
        </div>
        
        <div className="setting-group">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={settings.autoSave}
              onChange={(e) => onSettingsChange({ autoSave: e.target.checked })}
            />
            <span>자동 저장</span>
          </label>
        </div>
        
        <div className="setting-group">
          <label className="setting-label">
            <span>난이도</span>
            <select
              value={settings.difficulty}
              onChange={(e) => onSettingsChange({ 
                difficulty: e.target.value as 'easy' | 'medium' | 'hard' 
              })}
            >
              <option value="easy">쉬움</option>
              <option value="medium">보통</option>
              <option value="hard">어려움</option>
            </select>
          </label>
        </div>
      </div>
    </Modal>
  );
};

/**
 * 도움말 모달 컴포넌트
 */
interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="❓ 게임 방법"
      size="large"
    >
      <div className="help-content">
        <section className="help-section">
          <h3>🎯 게임 목표</h3>
          <p>숨겨진 2글자 한글 단어를 7번의 시도 안에 맞춰보세요!</p>
        </section>
        
        <section className="help-section">
          <h3>🕹️ 게임 방법</h3>
          <ol>
            <li>2글자 한글 단어를 입력하세요</li>
            <li>각 글자에 대한 힌트를 확인하세요</li>
            <li>힌트를 바탕으로 정답을 추리하세요</li>
            <li>7번 안에 정답을 맞추면 승리!</li>
          </ol>
        </section>
        
        <section className="help-section">
          <h3>💡 힌트 설명</h3>
          <div className="hint-explanations">
            <div className="hint-item">
              <span className="hint-emoji">🥕</span>
              <div>
                <strong>당연하죠~</strong>
                <p>해당 글자와 완전히 일치합니다</p>
              </div>
            </div>
            
            <div className="hint-item">
              <span className="hint-emoji">🍄</span>
              <div>
                <strong>비슷해요~</strong>
                <p>자음과 모음 중 2개 이상이 일치하고 첫 자음도 일치합니다</p>
              </div>
            </div>
            
            <div className="hint-item">
              <span className="hint-emoji">🧄</span>
              <div>
                <strong>많을 거예요~</strong>
                <p>자음과 모음 중 2개 이상이 있지만 첫 자음은 일치하지 않습니다</p>
              </div>
            </div>
            
            <div className="hint-item">
              <span className="hint-emoji">🍆</span>
              <div>
                <strong>가지고 있어요~</strong>
                <p>입력한 자음과 모음 중 하나만 있습니다</p>
              </div>
            </div>
            
            <div className="hint-item">
              <span className="hint-emoji">🍌</span>
              <div>
                <strong>반대로요~</strong>
                <p>입력한 자음과 모음이 반대쪽 글자에서 일치합니다</p>
              </div>
            </div>
            
            <div className="hint-item">
              <span className="hint-emoji">🍎</span>
              <div>
                <strong>사과를 받아주세요~</strong>
                <p>정답에 일치하는 자음과 모음이 없습니다</p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="help-section">
          <h3>⌨️ 키보드 단축키</h3>
          <div className="keyboard-shortcuts">
            <div className="shortcut-item">
              <kbd>Enter</kbd>
              <span>단어 제출</span>
            </div>
            <div className="shortcut-item">
              <kbd>Backspace</kbd>
              <span>글자 삭제</span>
            </div>
            <div className="shortcut-item">
              <kbd>Esc</kbd>
              <span>모달 닫기</span>
            </div>
          </div>
        </section>
      </div>
    </Modal>
  );
};

export default Modal;