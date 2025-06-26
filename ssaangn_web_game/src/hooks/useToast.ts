/**
 * Toast 알림 관리 훅
 * 
 * 토스트 메시지의 생성, 관리, 제거를 담당하는 커스텀 훅입니다.
 * - 자동 ID 생성
 * - 중복 메시지 방지 옵션
 * - 최대 개수 제한
 * - 타입별 기본 설정
 */

import { useState, useCallback, useRef } from 'react';
import type { ToastMessage, ToastType } from '../components/UI/Toast';

export interface UseToastOptions {
  /** 최대 토스트 개수 (기본값: 3) */
  maxToasts?: number;
  /** 기본 위치 (기본값: 'top-center') */
  position?: 'top-center' | 'top-right' | 'bottom-center' | 'bottom-right';
  /** 중복 메시지 방지 (기본값: true) */
  preventDuplicates?: boolean;
  /** 중복 확인 시간(ms) - 이 시간 내 같은 메시지 무시 (기본값: 1000) */
  duplicateDelay?: number;
}

export interface ToastOptions {
  /** 토스트 타입 */
  type?: ToastType;
  /** 제목 */
  title?: string;
  /** 커스텀 아이콘 */
  icon?: string;
  /** 표시 시간(ms) */
  duration?: number;
  /** 자동으로 사라지지 않음 */
  persistent?: boolean;
}

let toastIdCounter = 0;

/**
 * 고유 ID 생성
 */
const generateToastId = (): string => {
  return `toast-${++toastIdCounter}-${Date.now()}`;
};

/**
 * Toast 관리 훅
 */
export const useToast = (options: UseToastOptions = {}) => {
  const {
    maxToasts = 3,
    position = 'top-center',
    preventDuplicates = true,
    duplicateDelay = 1000
  } = options;

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const recentMessagesRef = useRef<Map<string, number>>(new Map());

  /**
   * 토스트 제거
   */
  const removeToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  /**
   * 모든 토스트 제거
   */
  const clearToasts = useCallback(() => {
    setToasts([]);
    recentMessagesRef.current.clear();
  }, []);

  /**
   * 중복 메시지 확인
   */
  const isDuplicate = useCallback((message: string): boolean => {
    if (!preventDuplicates) return false;
    
    const now = Date.now();
    const lastTime = recentMessagesRef.current.get(message);
    
    if (lastTime && now - lastTime < duplicateDelay) {
      return true;
    }
    
    recentMessagesRef.current.set(message, now);
    return false;
  }, [preventDuplicates, duplicateDelay]);

  /**
   * 토스트 추가
   */
  const addToast = useCallback((
    message: string, 
    options: ToastOptions = {}
  ): string => {
    // 중복 확인
    if (isDuplicate(message)) {
      console.log('Toast: 중복 메시지 무시됨:', message);
      return '';
    }

    const id = generateToastId();
    const newToast: ToastMessage = {
      id,
      type: options.type || 'info',
      message,
      title: options.title,
      icon: options.icon,
      duration: options.duration,
      persistent: options.persistent
    };

    setToasts(prevToasts => {
      const updatedToasts = [newToast, ...prevToasts];
      
      // 최대 개수 제한
      if (updatedToasts.length > maxToasts) {
        const removedToasts = updatedToasts.slice(maxToasts);
        removedToasts.forEach(toast => {
          setTimeout(() => removeToast(toast.id), 100);
        });
        return updatedToasts.slice(0, maxToasts);
      }
      
      return updatedToasts;
    });

    return id;
  }, [isDuplicate, maxToasts, removeToast]);

  /**
   * 타입별 토스트 생성 함수들
   */
  const showSuccess = useCallback((
    message: string, 
    options: Omit<ToastOptions, 'type'> = {}
  ) => {
    return addToast(message, { ...options, type: 'success' });
  }, [addToast]);

  const showError = useCallback((
    message: string, 
    options: Omit<ToastOptions, 'type'> = {}
  ) => {
    return addToast(message, { ...options, type: 'error' });
  }, [addToast]);

  const showWarning = useCallback((
    message: string, 
    options: Omit<ToastOptions, 'type'> = {}
  ) => {
    return addToast(message, { ...options, type: 'warning' });
  }, [addToast]);

  const showInfo = useCallback((
    message: string, 
    options: Omit<ToastOptions, 'type'> = {}
  ) => {
    return addToast(message, { ...options, type: 'info' });
  }, [addToast]);

  /**
   * 게임 전용 토스트 함수들
   */
  const showGameError = useCallback((errorType: 'invalid_length' | 'invalid_word' | 'all_wrong') => {
    const errorMessages = {
      invalid_length: {
        title: '입력 오류',
        message: '🐯 2개 글자를 입력하세요',
        icon: '📝'
      },
      invalid_word: {
        title: '단어 오류',
        message: '🐯 옳은 단어를 입력하세요', 
        icon: '📚'
      },
      all_wrong: {
        title: '힌트',
        message: '🐯 자음과 모음들이 모두 틀려요',
        icon: '💭'
      }
    };

    const config = errorMessages[errorType];
    return showError(config.message, {
      title: config.title,
      icon: config.icon,
      duration: 3000
    });
  }, [showError]);

  const showGameSuccess = useCallback((attempts: number) => {
    return showSuccess(`🎉 ${attempts}번만에 정답을 맞추셨네요!`, {
      title: '축하합니다!',
      icon: '🏆',
      duration: 4000
    });
  }, [showSuccess]);

  const showGameOver = useCallback((targetWord: string) => {
    return showError(`정답은 "${targetWord}"였습니다. 다시 도전해보세요!`, {
      title: '게임 종료',
      icon: '🎯',
      duration: 5000
    });
  }, [showError]);

  /**
   * 햅틱 피드백 함수
   */
  const triggerHapticFeedback = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    if (navigator.vibrate) {
      const patterns = {
        light: [10],
        medium: [25],
        heavy: [50]
      };
      navigator.vibrate(patterns[intensity]);
    }
  }, []);

  /**
   * 에러 토스트 + 햅틱 피드백
   */
  const showErrorWithFeedback = useCallback((
    message: string, 
    options: Omit<ToastOptions, 'type'> = {}
  ) => {
    triggerHapticFeedback('medium');
    return showError(message, options);
  }, [showError, triggerHapticFeedback]);

  return {
    // 상태
    toasts,
    position,
    
    // 기본 함수들
    addToast,
    removeToast,
    clearToasts,
    
    // 타입별 함수들
    showSuccess,
    showError,
    showWarning,
    showInfo,
    
    // 게임 전용 함수들
    showGameError,
    showGameSuccess,
    showGameOver,
    
    // 피드백 함수들
    showErrorWithFeedback,
    triggerHapticFeedback,
    
    // 유틸리티
    count: toasts.length,
    isEmpty: toasts.length === 0,
    isFull: toasts.length >= maxToasts
  };
};

/**
 * 전역 Toast 컨텍스트용 기본 훅
 */
export const useGlobalToast = () => {
  return useToast({
    maxToasts: 3,
    position: 'top-center',
    preventDuplicates: true,
    duplicateDelay: 500 // 더 빠른 반복을 위해 500ms로 단축
  });
};

export default useToast;