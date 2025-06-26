/**
 * Toast 알림 컴포넌트
 * 
 * 게임 중 에러, 경고, 정보 메시지를 표시하는 토스트 시스템입니다.
 * - 자동으로 사라지는 알림
 * - 여러 토스트 동시 표시 지원
 * - 다양한 타입별 스타일링
 * - 부드러운 애니메이션 효과
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import './Toast.css';

export type ToastType = 'error' | 'warning' | 'info' | 'success';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  icon?: string;
  persistent?: boolean; // 자동으로 사라지지 않음
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
  index: number;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
  position?: 'top-center' | 'top-right' | 'bottom-center' | 'bottom-right';
  maxToasts?: number;
}

// 타입별 기본 설정
const TOAST_CONFIG = {
  error: {
    icon: '⚠️',
    defaultDuration: 4000,
    color: '#dc3545'
  },
  warning: {
    icon: '⚠️', 
    defaultDuration: 3500,
    color: '#ffc107'
  },
  info: {
    icon: 'ℹ️',
    defaultDuration: 3000,
    color: '#17a2b8'
  },
  success: {
    icon: '✅',
    defaultDuration: 2500,
    color: '#28a745'
  }
} as const;

/**
 * 개별 Toast 컴포넌트
 */
const Toast: React.FC<ToastProps> = ({ toast, onClose, index }) => {
  const [isVisible, setIsVisible] = useState(true);
  const config = TOAST_CONFIG[toast.type];
  
  // 자동 제거 타이머
  useEffect(() => {
    if (!toast.persistent) {
      const duration = toast.duration || config.defaultDuration;
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose(toast.id), 300); // 애니메이션 완료 후 제거
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [toast, config, onClose]);

  // 클릭으로 제거
  const handleClick = () => {
    setIsVisible(false);
    setTimeout(() => onClose(toast.id), 300);
  };

  // 애니메이션 variants
  const toastVariants = {
    hidden: { 
      opacity: 0, 
      y: -50, 
      scale: 0.9,
      filter: 'blur(4px)'
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      filter: 'blur(0px)',
      transition: { 
        type: "spring" as const, 
        stiffness: 300, 
        damping: 20,
        delay: index * 0.1 // 순차적 등장
      }
    },
    exit: { 
      opacity: 0, 
      y: -30, 
      scale: 0.95,
      filter: 'blur(2px)',
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      className={`toast toast-${toast.type}`}
      variants={toastVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "exit"}
      exit="exit"
      onClick={handleClick}
      style={{
        '--toast-color': config.color,
        '--toast-index': index
      } as React.CSSProperties}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* 진행률 바 */}
      {!toast.persistent && (
        <motion.div
          className="toast-progress"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ 
            duration: (toast.duration || config.defaultDuration) / 1000,
            ease: 'linear'
          }}
        />
      )}

      {/* 토스트 내용 */}
      <div className="toast-content">
        <div className="toast-icon">
          {toast.icon || config.icon}
        </div>
        
        <div className="toast-text">
          {toast.title && (
            <div className="toast-title">{toast.title}</div>
          )}
          <div className="toast-message">{toast.message}</div>
        </div>
        
        <button 
          className="toast-close"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          aria-label="토스트 닫기"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
};

/**
 * Toast 컨테이너 컴포넌트
 */
export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onClose,
  position = 'top-center',
  maxToasts = 3
}) => {
  // 최대 개수 제한
  const displayToasts = toasts.slice(0, maxToasts);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (displayToasts.length === 0) return null;

  const toastContainer = (
    <div className={`toast-container toast-container-${position}`}>
      <motion.div
        className="toast-list"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence mode="popLayout">
          {displayToasts.map((toast, index) => (
            <Toast
              key={toast.id}
              toast={toast}
              onClose={onClose}
              index={index}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );

  // 포털을 사용하여 body에 렌더링
  return createPortal(toastContainer, document.body);
};

/**
 * 게임 전용 Toast 메시지들
 */
export const GAME_TOASTS = {
  INVALID_LENGTH: {
    type: 'error' as ToastType,
    title: '입력 오류',
    message: '🐯 2개 글자를 입력하세요',
    icon: '📝'
  },
  INVALID_WORD: {
    type: 'error' as ToastType,
    title: '단어 오류', 
    message: '🐯 옳은 단어를 입력하세요',
    icon: '📚'
  },
  ALL_WRONG: {
    type: 'warning' as ToastType,
    title: '힌트',
    message: '🐯 자음과 모음들이 모두 틀려요',
    icon: '💭'
  },
  GAME_WON: {
    type: 'success' as ToastType,
    title: '축하합니다!',
    message: '🎉 정답을 맞추셨습니다!',
    icon: '🏆'
  },
  GAME_LOST: {
    type: 'error' as ToastType,
    title: '게임 종료',
    message: '😔 다음에 다시 도전해보세요!',
    icon: '🎯'
  }
} as const;

export default Toast;