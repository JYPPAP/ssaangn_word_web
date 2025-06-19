/**
 * 로컬스토리지 관리 커스텀 훅
 * 
 * 타입 안전성과 암호화를 지원하는 로컬스토리지 관리 훅입니다.
 * 자동 직렬화/역직렬화, 오류 처리, 실시간 동기화 기능을 제공합니다.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { safeEncodeData, safeDecodeData } from '../utils/encryption';

/**
 * 로컬스토리지 훅 옵션
 */
interface UseLocalStorageOptions {
  /** 암호화 사용 여부 (기본값: true) */
  encrypted?: boolean;
  /** 초기값 */
  defaultValue?: any;
  /** 직렬화 함수 */
  serializer?: {
    parse: (value: string) => any;
    stringify: (value: any) => string;
  };
  /** 오류 발생시 콜백 */
  onError?: (error: Error) => void;
  /** 값 변경시 콜백 */
  onChange?: (newValue: any, oldValue: any) => void;
}

// UseLocalStorageReturn은 더 이상 사용하지 않음 (배열 반환으로 변경)

/**
 * 로컬스토리지가 지원되는지 확인 (캐시됨)
 */
let _isLocalStorageSupported: boolean | null = null;
const isLocalStorageSupported = (): boolean => {
  if (_isLocalStorageSupported !== null) {
    return _isLocalStorageSupported;
  }
  
  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    _isLocalStorageSupported = true;
    return true;
  } catch {
    _isLocalStorageSupported = false;
    return false;
  }
};

/**
 * 로컬스토리지 커스텀 훅
 * 
 * @param key - 저장할 키
 * @param options - 옵션 객체
 * @returns 로컬스토리지 관리 객체
 * 
 * @example
 * ```tsx
 * // 기본 사용법
 * function Component() {
 *   const { value, setValue, removeValue } = useLocalStorage('user-settings', {
 *     defaultValue: { theme: 'light', language: 'ko' }
 *   });
 *   
 *   return (
 *     <div>
 *       <div>현재 테마: {value.theme}</div>
 *       <button onClick={() => setValue({ ...value, theme: 'dark' })}>
 *         다크 모드
 *       </button>
 *     </div>
 *   );
 * }
 * 
 * // 암호화된 저장소
 * function SecureComponent() {
 *   const { value, setValue } = useLocalStorage('secure-data', {
 *     encrypted: true,
 *     defaultValue: { token: '', userId: '' }
 *   });
 *   
 *   return <div>보안 데이터 관리</div>;
 * }
 * ```
 */
export const useLocalStorage = <T = any>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions = {}
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const {
    encrypted = true,
    serializer = JSON,
    onError,
    onChange
  } = options;

  const [value, setValue] = useState<T>(initialValue);
  const isSupported = useRef(isLocalStorageSupported()).current;
  const prevValueRef = useRef<T>(initialValue);

  /**
   * 로컬스토리지에서 값 읽기
   */
  const readValue = useCallback(async (): Promise<T> => {
    if (!isSupported) {
      return initialValue;
    }

    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }

      let parsedValue: T;
      
      if (encrypted) {
        // 암호화된 데이터 복호화
        const decryptedValue = await safeDecodeData<T>(item);
        if (decryptedValue === null) {
          // 암호화 복호화 실패시 일반 JSON 파싱 시도 (하위 호환성)
          parsedValue = serializer.parse(item);
        } else {
          parsedValue = decryptedValue;
        }
      } else {
        // 일반 JSON 파싱
        parsedValue = serializer.parse(item);
      }

      return parsedValue ?? initialValue;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('로컬스토리지 읽기 실패');
      onError?.(err);
      return initialValue;
    }
  }, [key, initialValue, encrypted, serializer, isSupported, onError]);

  /**
   * 로컬스토리지에 값 쓰기
   */
  const writeValue = useCallback(async (newValue: T): Promise<void> => {
    if (!isSupported) {
      return;
    }

    try {
      const oldValue = prevValueRef.current;
      
      let serializedValue: string;
      
      if (encrypted) {
        // 암호화하여 저장
        serializedValue = await safeEncodeData(newValue);
      } else {
        // 일반 JSON 직렬화
        serializedValue = serializer.stringify(newValue);
      }

      localStorage.setItem(key, serializedValue);
      
      setValue(newValue);
      prevValueRef.current = newValue;
      
      // 변경 콜백 호출
      onChange?.(newValue, oldValue);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('로컬스토리지 쓰기 실패');
      onError?.(err);
      throw err;
    }
  }, [key, encrypted, serializer, isSupported, onError, onChange]);

  /**
   * 값 설정 함수
   */
  const setStoredValue = useCallback(async (newValue: T | ((prev: T) => T)) => {
    try {
      const valueToStore = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(value)
        : newValue;
      
      await writeValue(valueToStore);
    } catch (error) {
      // 오류는 writeValue에서 이미 처리됨
    }
  }, [value, writeValue]);

  // removeStoredValue 함수는 현재 사용하지 않음

  // 초기 값 로드
  useEffect(() => {
    const loadInitialValue = async () => {
      try {
        const loadedValue = await readValue();
        setValue(loadedValue);
        prevValueRef.current = loadedValue;
      } catch (error) {
        // 오류는 readValue에서 이미 처리됨
      }
    };

    loadInitialValue();
  }, [readValue]);

  // 다른 탭에서의 변경 감지
  useEffect(() => {
    if (!isSupported) {
      return;
    }

    const handleStorageChange = async (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = await readValue();
          setValue(newValue);
          prevValueRef.current = newValue;
        } catch (error) {
          // 오류는 readValue에서 이미 처리됨
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, readValue, isSupported]);

  return [value, setStoredValue];
};

/**
 * 세션스토리지 커스텀 훅
 * 
 * @param key - 저장할 키
 * @param defaultValue - 기본값
 * @returns 세션스토리지 관리 객체
 * 
 * @example
 * ```tsx
 * function Component() {
 *   const [currentPage, setCurrentPage] = useSessionStorage('current-page', 1);
 *   
 *   return (
 *     <div>
 *       <div>현재 페이지: {currentPage}</div>
 *       <button onClick={() => setCurrentPage(currentPage + 1)}>
 *         다음 페이지
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useSessionStorage = <T = any>(
  key: string,
  defaultValue?: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] => {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    try {
      const valueToStore = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(value)
        : newValue;
      
      setValue(valueToStore);
      sessionStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('세션스토리지 저장 실패:', error);
    }
  }, [key, value]);

  const removeValue = useCallback(() => {
    try {
      sessionStorage.removeItem(key);
      setValue(defaultValue!);
    } catch (error) {
      console.error('세션스토리지 삭제 실패:', error);
    }
  }, [key, defaultValue]);

  return [value, setStoredValue, removeValue];
};

/**
 * 로컬스토리지 배열 관리 훅
 * 
 * @param key - 저장할 키
 * @param defaultValue - 기본 배열
 * @returns 배열 관리 객체
 * 
 * @example
 * ```tsx
 * function TodoList() {
 *   const { 
 *     items: todos, 
 *     addItem: addTodo, 
 *     removeItem: removeTodo,
 *     updateItem: updateTodo,
 *     clearItems: clearTodos
 *   } = useLocalStorageArray('todos', []);
 *   
 *   return (
 *     <div>
 *       {todos.map(todo => (
 *         <div key={todo.id}>
 *           {todo.text}
 *           <button onClick={() => removeTodo(todo.id)}>삭제</button>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export const useLocalStorageArray = <T extends { id: string | number }>(
  key: string,
  defaultValue: T[] = []
) => {
  const [items, setItems] = useLocalStorage<T[]>(key, defaultValue);

  const addItem = useCallback(async (item: T) => {
    await setItems(prev => [...prev, item]);
  }, [setItems]);

  const removeItem = useCallback(async (id: string | number) => {
    await setItems(prev => prev.filter(item => item.id !== id));
  }, [setItems]);

  const updateItem = useCallback(async (id: string | number, updates: Partial<T>) => {
    await setItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
  }, [setItems]);

  const clearItems = useCallback(async () => {
    await setItems([]);
  }, [setItems]);

  const findItem = useCallback((id: string | number) => {
    return items.find(item => item.id === id);
  }, [items]);

  return {
    items,
    addItem,
    removeItem,
    updateItem,
    clearItems,
    findItem,
    count: items.length
  };
};

/**
 * 로컬스토리지 캐시 훅
 * 
 * @param key - 캐시 키
 * @param fetcher - 데이터 가져오기 함수
 * @param options - 캐시 옵션
 * @returns 캐시 관리 객체
 * 
 * @example
 * ```tsx
 * function UserProfile({ userId }: { userId: string }) {
 *   const { 
 *     data: user, 
 *     isLoading, 
 *     error, 
 *     refresh 
 *   } = useLocalStorageCache(
 *     `user-${userId}`,
 *     () => fetchUser(userId),
 *     { ttl: 5 * 60 * 1000 } // 5분 캐시
 *   );
 *   
 *   if (isLoading) return <div>로딩중...</div>;
 *   if (error) return <div>오류: {error.message}</div>;
 *   
 *   return <div>사용자: {user?.name}</div>;
 * }
 * ```
 */
export const useLocalStorageCache = <T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number; // Time to live in milliseconds
    refreshOnMount?: boolean;
    refreshOnFocus?: boolean;
  } = {}
) => {
  const { ttl = 5 * 60 * 1000, refreshOnMount = true, refreshOnFocus = false } = options;
  
  const [cache, setCache] = useLocalStorage<{
    data: T;
    timestamp: number;
  } | null>(key, null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const isExpired = useCallback(() => {
    if (!cache) return true;
    return Date.now() - cache.timestamp > ttl;
  }, [cache, ttl]);

  const fetchData = useCallback(async (force = false) => {
    if (!force && cache && !isExpired()) {
      return cache.data;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetcher();
      const newCache = {
        data,
        timestamp: Date.now()
      };
      await setCache(newCache);
      setIsLoading(false);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('데이터 가져오기 실패');
      setError(error);
      setIsLoading(false);
      throw error;
    }
  }, [cache, isExpired, fetcher, setCache]);

  // 초기 로드
  useEffect(() => {
    if (refreshOnMount) {
      fetchData();
    }
  }, [fetchData, refreshOnMount]);

  // 포커스시 새로고침
  useEffect(() => {
    if (!refreshOnFocus) return;

    const handleFocus = () => {
      if (isExpired()) {
        fetchData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchData, isExpired, refreshOnFocus]);

  return {
    data: cache?.data,
    isLoading,
    error,
    refresh: () => fetchData(true),
    isExpired: isExpired()
  };
};