/**
 * 로컬스토리지 암호화/복호화 유틸리티
 * 
 * Web Crypto API를 사용하여 게임 데이터를 안전하게 저장합니다.
 * 브라우저 네이티브 API를 사용하므로 외부 라이브러리가 필요하지 않습니다.
 */

// 암호화에 사용할 고정 키 (실제 운영에서는 더 안전한 키 관리 필요)
const ENCRYPTION_KEY = 'hangul-word-game-2024-secret-key-for-localStorage';

/**
 * 문자열을 ArrayBuffer로 변환
 * @param str - 변환할 문자열
 * @returns ArrayBuffer
 */
const stringToArrayBuffer = (str: string): ArrayBuffer => {
  const encoder = new TextEncoder();
  return encoder.encode(str);
};

/**
 * ArrayBuffer를 문자열로 변환
 * @param buffer - 변환할 ArrayBuffer
 * @returns 문자열
 */
const arrayBufferToString = (buffer: ArrayBuffer): string => {
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
};

/**
 * ArrayBuffer를 Base64 문자열로 변환
 * @param buffer - 변환할 ArrayBuffer
 * @returns Base64 문자열
 */
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

/**
 * Base64 문자열을 ArrayBuffer로 변환
 * @param base64 - Base64 문자열
 * @returns ArrayBuffer
 */
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

/**
 * 암호화 키 생성 (PBKDF2 사용)
 * @param password - 기본 패스워드
 * @param salt - 솔트 값
 * @returns CryptoKey
 */
const deriveKey = async (password: string, salt: ArrayBuffer): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

/**
 * 데이터 암호화 (Web Crypto API 사용)
 * @param data - 암호화할 데이터 객체
 * @returns 암호화된 문자열 (Base64 인코딩)
 * 
 * @example
 * const gameData = { score: 100, level: 5 };
 * const encrypted = await encryptData(gameData);
 * localStorage.setItem('gameData', encrypted);
 */
export const encryptData = async (data: any): Promise<string> => {
  try {
    const jsonString = JSON.stringify(data);
    const plaintext = stringToArrayBuffer(jsonString);

    // 랜덤 솔트와 IV 생성
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // 키 생성
    const key = await deriveKey(ENCRYPTION_KEY, salt);

    // 암호화
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      plaintext
    );

    // 솔트 + IV + 암호화된 데이터를 연결하여 Base64로 인코딩
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);

    return arrayBufferToBase64(combined.buffer);
  } catch (error) {
    console.error('데이터 암호화 실패:', error);
    throw new Error('암호화 중 오류가 발생했습니다.');
  }
};

/**
 * 데이터 복호화 (Web Crypto API 사용)
 * @param encryptedData - 암호화된 데이터 문자열
 * @returns 복호화된 데이터 객체 또는 null
 * 
 * @example
 * const encrypted = localStorage.getItem('gameData');
 * if (encrypted) {
 *   const gameData = await decryptData(encrypted);
 *   console.log(gameData); // { score: 100, level: 5 }
 * }
 */
export const decryptData = async <T>(encryptedData: string): Promise<T | null> => {
  try {
    const combined = base64ToArrayBuffer(encryptedData);
    const combinedBytes = new Uint8Array(combined);

    // 솔트, IV, 암호화된 데이터 분리
    const salt = combinedBytes.slice(0, 16);
    const iv = combinedBytes.slice(16, 28);
    const encrypted = combinedBytes.slice(28);

    // 키 생성
    const key = await deriveKey(ENCRYPTION_KEY, salt);

    // 복호화
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encrypted
    );

    const jsonString = arrayBufferToString(decrypted);
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('데이터 복호화 실패:', error);
    return null;
  }
};

/**
 * 간단한 Base64 인코딩/디코딩 (Web Crypto API를 지원하지 않는 환경용 폴백)
 */

/**
 * 데이터를 Base64로 인코딩 (폴백용)
 * @param data - 인코딩할 데이터
 * @returns Base64 인코딩된 문자열
 */
export const encodeBase64 = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data);
    return btoa(unescape(encodeURIComponent(jsonString)));
  } catch (error) {
    console.error('Base64 인코딩 실패:', error);
    return '';
  }
};

/**
 * Base64 문자열을 데이터로 디코딩 (폴백용)
 * @param encodedData - Base64 인코딩된 문자열
 * @returns 디코딩된 데이터 또는 null
 */
export const decodeBase64 = <T>(encodedData: string): T | null => {
  try {
    const jsonString = decodeURIComponent(escape(atob(encodedData)));
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Base64 디코딩 실패:', error);
    return null;
  }
};

/**
 * 브라우저가 Web Crypto API를 지원하는지 확인
 * @returns Web Crypto API 지원 여부
 */
export const isWebCryptoSupported = (): boolean => {
  return typeof crypto !== 'undefined' && 
         typeof crypto.subtle !== 'undefined' &&
         typeof crypto.subtle.encrypt === 'function';
};

/**
 * 안전한 데이터 저장 (암호화 지원 여부에 따라 자동 선택)
 * @param data - 저장할 데이터
 * @returns 암호화/인코딩된 문자열
 * 
 * @example
 * const gameState = { level: 1, score: 0 };
 * const encoded = await safeEncodeData(gameState);
 * localStorage.setItem('gameState', encoded);
 */
export const safeEncodeData = async (data: any): Promise<string> => {
  if (isWebCryptoSupported()) {
    try {
      return await encryptData(data);
    } catch (error) {
      console.warn('암호화 실패, Base64 인코딩으로 대체:', error);
      return encodeBase64(data);
    }
  } else {
    console.warn('Web Crypto API 미지원, Base64 인코딩 사용');
    return encodeBase64(data);
  }
};

/**
 * 안전한 데이터 복원 (암호화/인코딩 방식 자동 감지)
 * @param encodedData - 암호화/인코딩된 데이터
 * @returns 복원된 데이터 또는 null
 * 
 * @example
 * const encoded = localStorage.getItem('gameState');
 * if (encoded) {
 *   const gameState = await safeDecodeData(encoded);
 *   console.log(gameState);
 * }
 */
export const safeDecodeData = async <T>(encodedData: string): Promise<T | null> => {
  if (isWebCryptoSupported()) {
    // 먼저 암호화된 데이터로 시도
    const decryptedData = await decryptData<T>(encodedData);
    if (decryptedData !== null) {
      return decryptedData;
    }
  }
  
  // 암호화 복호화 실패시 Base64 디코딩 시도
  return decodeBase64<T>(encodedData);
};

/**
 * 기존 코드와의 호환성을 위한 동기 함수들
 * (내부적으로는 Base64 인코딩 사용)
 */

/**
 * 동기 데이터 암호화 (Base64 인코딩 사용)
 * @param data - 암호화할 데이터
 * @returns 인코딩된 문자열
 * 
 * @deprecated 가능하면 safeEncodeData 사용 권장
 */
export const encryptDataSync = (data: any): string => {
  return encodeBase64(data);
};

/**
 * 동기 데이터 복호화 (Base64 디코딩 사용)
 * @param encryptedData - 인코딩된 데이터
 * @returns 복호화된 데이터 또는 null
 * 
 * @deprecated 가능하면 safeDecodeData 사용 권장
 */
export const decryptDataSync = <T>(encryptedData: string): T | null => {
  return decodeBase64<T>(encryptedData);
};

// 기존 코드와의 호환성을 위한 alias (동기 버전 우선 사용)
// export { encryptDataSync as encryptData };
// export { decryptDataSync as decryptData };