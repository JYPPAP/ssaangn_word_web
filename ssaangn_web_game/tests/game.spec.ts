import { test, expect } from '@playwright/test';

// 테스트용 단어들
const TEST_WORDS = {
  SIMPLE: '볶음', // 간단한 단어
  COMPLEX_CONSONANT: '관전', // 복합 자음이 있는 단어  
  COMPLEX_VOWEL: '꽃잎', // 복합 모음이 있는 단어
  FINAL_CONSONANT: '뜻밖' // 종성이 있는 단어
};

test.describe('한글 단어 맞추기 게임', () => {
  test.beforeEach(async ({ page }) => {
    // 로컬 스토리지 초기화
    await page.goto('http://localhost:5174');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
    
    // 게임이 로드될 때까지 대기
    await expect(page.locator('.app')).toBeVisible();
  });

  test('게임 초기 상태 확인', async ({ page }) => {
    // 게임 보드가 표시되는지 확인
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
    
    // 가상 키보드가 표시되는지 확인
    await expect(page.locator('[data-testid="virtual-keyboard"]')).toBeVisible();
    
    // 초기 추측 칸이 비어있는지 확인
    const firstCell = page.locator('[data-testid="game-cell-0-0"]');
    await expect(firstCell).toHaveText('');
  });

  test('단어 입력 - "볶음"', async ({ page }) => {
    // 볶음 입력 테스트
    await inputWord(page, TEST_WORDS.SIMPLE);
    
    // 입력된 단어가 게임 보드에 표시되는지 확인
    await expect(page.locator('[data-testid="game-cell-0-0"]')).toHaveText('볶');
    await expect(page.locator('[data-testid="game-cell-0-1"]')).toHaveText('음');
    
    // 제출 버튼 클릭
    await page.locator('[data-testid="submit-button"]').click();
    
    // 힌트가 표시되는지 확인
    await expect(page.locator('[data-testid="hint-0-0"]')).toBeVisible();
    await expect(page.locator('[data-testid="hint-0-1"]')).toBeVisible();
  });

  test('단어 입력 - "관전" (복합 자음)', async ({ page }) => {
    await inputWord(page, TEST_WORDS.COMPLEX_CONSONANT);
    
    // 복합 자음이 올바르게 입력되었는지 확인
    await expect(page.locator('[data-testid="game-cell-0-0"]')).toHaveText('관');
    await expect(page.locator('[data-testid="game-cell-0-1"]')).toHaveText('전');
    
    await page.locator('[data-testid="submit-button"]').click();
    
    // 힌트 검증
    await validateHints(page, 0);
  });

  test('단어 입력 - "꽃잎" (복합 모음)', async ({ page }) => {
    await inputWord(page, TEST_WORDS.COMPLEX_VOWEL);
    
    // 복합 모음이 올바르게 입력되었는지 확인
    await expect(page.locator('[data-testid="game-cell-0-0"]')).toHaveText('꽃');
    await expect(page.locator('[data-testid="game-cell-0-1"]')).toHaveText('잎');
    
    await page.locator('[data-testid="submit-button"]').click();
    
    await validateHints(page, 0);
  });

  test('단어 입력 - "뜻밖" (종성)', async ({ page }) => {
    await inputWord(page, TEST_WORDS.FINAL_CONSONANT);
    
    // 종성이 포함된 단어가 올바르게 입력되었는지 확인
    await expect(page.locator('[data-testid="game-cell-0-0"]')).toHaveText('뜻');
    await expect(page.locator('[data-testid="game-cell-0-1"]')).toHaveText('밖');
    
    await page.locator('[data-testid="submit-button"]').click();
    
    await validateHints(page, 0);
  });

  test('한글 조합 입력 테스트', async ({ page }) => {
    // ㄱ + ㅏ = 가
    await page.locator('[data-testid="key-ㄱ"]').click();
    await page.locator('[data-testid="key-ㅏ"]').click();
    
    await expect(page.locator('[data-testid="game-cell-0-0"]')).toHaveText('가');
    
    // ㄴ + ㅏ + ㅁ = 남
    await page.locator('[data-testid="key-ㄴ"]').click();
    await page.locator('[data-testid="key-ㅏ"]').click();
    await page.locator('[data-testid="key-ㅁ"]').click();
    
    await expect(page.locator('[data-testid="game-cell-0-1"]')).toHaveText('남');
  });

  test('백스페이스 기능 테스트', async ({ page }) => {
    // 글자 입력
    await page.locator('[data-testid="key-ㄱ"]').click();
    await page.locator('[data-testid="key-ㅏ"]').click();
    await expect(page.locator('[data-testid="game-cell-0-0"]')).toHaveText('가');
    
    // 백스페이스로 모음 삭제
    await page.locator('[data-testid="backspace-button"]').click();
    await expect(page.locator('[data-testid="game-cell-0-0"]')).toHaveText('ㄱ');
    
    // 백스페이스로 자음 삭제
    await page.locator('[data-testid="backspace-button"]').click();
    await expect(page.locator('[data-testid="game-cell-0-0"]')).toHaveText('');
  });

  test('여러 추측 진행 테스트', async ({ page }) => {
    // 첫 번째 추측
    await inputWord(page, '가나');
    await page.locator('[data-testid="submit-button"]').click();
    
    // 두 번째 추측
    await inputWord(page, '다라');
    await page.locator('[data-testid="submit-button"]').click();
    
    // 두 행의 내용이 올바르게 표시되는지 확인
    await expect(page.locator('[data-testid="game-cell-0-0"]')).toHaveText('가');
    await expect(page.locator('[data-testid="game-cell-0-1"]')).toHaveText('나');
    await expect(page.locator('[data-testid="game-cell-1-0"]')).toHaveText('다');
    await expect(page.locator('[data-testid="game-cell-1-1"]')).toHaveText('라');
  });

  test('힌트 이모지 표시 확인', async ({ page }) => {
    await inputWord(page, TEST_WORDS.SIMPLE);
    await page.locator('[data-testid="submit-button"]').click();
    
    // 힌트 이모지가 유효한 힌트인지 확인
    const hint1 = await page.locator('[data-testid="hint-0-0"]').textContent();
    const hint2 = await page.locator('[data-testid="hint-0-1"]').textContent();
    
    const validHints = ['🥕', '🍄', '🧄', '🍆', '🍌', '🍎'];
    expect(validHints).toContain(hint1);
    expect(validHints).toContain(hint2);
  });

  test('키보드 상태 업데이트 확인', async ({ page }) => {
    await inputWord(page, TEST_WORDS.SIMPLE);
    await page.locator('[data-testid="submit-button"]').click();
    
    // 사용된 키들의 상태가 업데이트되었는지 확인
    // (실제 구현에 따라 클래스나 스타일 확인 필요)
    const usedKey = page.locator('[data-testid="key-ㅂ"]');
    await expect(usedKey).toHaveClass(/used|colored/);
  });
});

// 헬퍼 함수들
async function inputWord(page: any, word: string) {
  for (const char of word) {
    // 한글 문자를 자모로 분해하여 입력
    const jamos = decomposeHangul(char);
    for (const jamo of jamos) {
      await page.locator(`[data-testid="key-${jamo}"]`).click();
      await page.waitForTimeout(50); // 입력 간 짧은 대기
    }
  }
}

async function validateHints(page: any, row: number) {
  // 각 힌트가 유효한 이모지인지 확인
  for (let col = 0; col < 2; col++) {
    const hint = await page.locator(`[data-testid="hint-${row}-${col}"]`).textContent();
    const validHints = ['🥕', '🍄', '🧄', '🍆', '🍌', '🍎'];
    expect(validHints).toContain(hint);
  }
}

// 한글 문자를 자모로 분해하는 함수 (간단 버전)
function decomposeHangul(char: string): string[] {
  const charCode = char.charCodeAt(0);
  const base = charCode - 0xAC00;
  
  if (base < 0 || base >= 11172) {
    return [char]; // 한글이 아닌 경우 그대로 반환
  }
  
  const initialIndex = Math.floor(base / 588);
  const medialIndex = Math.floor((base % 588) / 28);
  const finalIndex = base % 28;
  
  const initials = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
  const medials = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅛㅜㅠㅡㅣ';
  const finals = ' ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ';
  
  const result = [initials[initialIndex], medials[medialIndex]];
  if (finalIndex > 0) {
    result.push(finals[finalIndex]);
  }
  
  return result;
}