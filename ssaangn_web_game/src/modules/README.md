# 한글 단어 맞추기 게임 - 모듈화된 버전

원본 `script.js` 파일(5467줄, 130개 함수)을 기능별로 분리한 모듈화된 버전입니다.

## 📁 모듈 구조

### 🎯 핵심 모듈
- **`constants.js`** - 게임 상수 및 설정값 관리
- **`storage.js`** - 로컬스토리지 데이터 관리, 암호화/복호화
- **`game-core.js`** - 핵심 게임 로직, 단어 검증, 힌트 생성
- **`main.js`** - 모든 모듈 통합 및 게임 초기화

### 🎮 UI 관련 모듈
- **`game-board.js`** - 게임 보드 생성, 업데이트, 렌더링
- **`keyboard.js`** - 물리/가상 키보드 처리, 키 색상 관리
- **`hints.js`** - 힌트 시스템, 모달 표시, 색상 힌트

### 🚀 추가 기능 모듈 (향후 구현)
- **`statistics.js`** - 통계 및 점수 관리
- **`race-mode.js`** - 레이스 모드 기능
- **`magpie.js`** - 까치 기능
- **`story.js`** - 스토리 모드
- **`ui-helpers.js`** - UI 헬퍼 함수들

## 🔧 사용법

### HTML에서 모듈 로드
```html
<!-- 메인 모듈만 로드하면 다른 모듈들 자동 로드 -->
<script type="module" src="modules/main.js"></script>
```

### 개별 모듈 사용
```javascript
// 특정 기능만 필요한 경우
import { resetKeyboardState } from './modules/keyboard.js';
import { showHint } from './modules/hints.js';
import { saveGameProgress } from './modules/main.js';
```

## 📊 모듈별 기능

### Constants (상수)
- 게임 기본 설정 (최대 글자 수, 시도 횟수 등)
- 이모지 상수 (힌트, 메달, 기능별)
- 테마 설정
- 힌트 데이터 정의

### Storage (저장소)
- 로컬스토리지 데이터 정의
- 데이터 로드/저장 함수
- 암호화/복호화 유틸리티
- 데이터 내보내기/가져오기

### Game Core (게임 핵심)
- 게임 초기화 및 상태 관리
- 단어 검증 및 힌트 계산
- 승패 조건 확인
- 게임 상태 리셋

### Game Board (게임 보드)
- 보드 레이아웃 생성
- 추측 표시 및 업데이트
- 애니메이션 효과
- 보드 상태 저장/복원

### Keyboard (키보드)
- 물리적/가상 키보드 처리
- 한글 조합 로직
- 키 색상 관리
- 키 활성화/비활성화

### Hints (힌트)
- 힌트 데이터 관리
- 힌트 모달 표시
- 랜덤/수동 힌트 제공
- 키보드 색상 힌트

### Main (메인)
- 모든 모듈 통합
- 게임 초기화 및 이벤트 처리
- 게임 진행 관리
- 결과 표시 및 저장

## 🎨 장점

### 1. **가독성 향상**
- 5467줄 → 각 모듈 100-300줄로 분리
- 기능별 명확한 구분
- 코드 이해 및 유지보수 용이

### 2. **재사용성**
- 개별 모듈 독립적 사용 가능
- 다른 프로젝트에 모듈 단위 적용
- 테스트 및 디버깅 간소화

### 3. **확장성**
- 새 기능 추가 시 새 모듈로 분리
- 기존 코드 영향 최소화
- 점진적 개발 가능

### 4. **성능**
- 필요한 모듈만 로드
- 지연 로딩 (lazy loading) 적용 가능
- 메모리 사용량 최적화

## 🔄 마이그레이션 가이드

### 1. 기존 코드에서 모듈로
```javascript
// 기존 (script.js)
function insertLetter(key) { ... }

// 모듈화 후
import { insertLetter } from './modules/keyboard.js';
```

### 2. 전역 변수 접근
```javascript
// 기존
let g_secretWordString = "...";

// 모듈화 후
import { g_secretWordString } from './modules/game-core.js';
```

### 3. 이벤트 처리
```javascript
// 기존 - 전역 함수
function submitWord() { ... }

// 모듈화 후 - 이벤트 기반
document.dispatchEvent(new CustomEvent('submitGuess', { 
    detail: { guess: word } 
}));
```

## 🛠️ 개발 환경

### 필수 요구사항
- ES6 모듈 지원 브라우저
- 로컬 서버 (CORS 정책으로 인해)

### 개발 서버 실행
```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

## 📝 향후 개선 사항

1. **TypeScript 적용** - 타입 안정성 향상
2. **웹팩/롤업 번들링** - 배포 최적화
3. **단위 테스트** - Jest/Vitest 적용
4. **CSS 모듈화** - 스타일 분리
5. **PWA 기능** - 오프라인 지원

## 🤝 기여하기

1. 새 기능은 별도 모듈로 생성
2. 기존 모듈 수정 시 하위 호환성 유지
3. JSDoc 주석 작성
4. 테스트 코드 포함

## 📄 라이선스

원본 프로젝트와 동일한 라이선스 적용