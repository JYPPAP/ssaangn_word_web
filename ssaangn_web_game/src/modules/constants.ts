/**
 * 게임 상수 및 설정값들
 * 원본 script.js에서 분리된 모든 상수들을 관리합니다.
 */

// 게임 기본 설정
export const MAX_LETTERS = 2;
export const NUMBER_OF_GUESSES = 7;
export const RACE_TIME_WINDOW = 7;
export const RACE_LAPS = 3;
export const PRACTICE_WORD = "노래";
export const PRACTICE_WORD_BACKUP = "무대";
export const WEEKLY_STATUS_EMPTY = "0,0,월욜,0,0,화욜,0,0,수욜,0,0,목욜,0,0,금욜,0,0,토욜,0,0,일욜";
export const WEEKLY_STATUS_ELEMENTS = 3;
export const WEEKDAY_NAMES = ["월", "화", "수", "목", "금", "토", "일"];
export const MAGPIE_INFO_KEY = "길조=";
export const CLIPBOARD_STYLE_EMOTE = 0;
export const CLIPBOARD_STYLE_SPOIL = 1;
export const MAX_INVALID_WORDS = 50;
export const GLOBAL_STATS_REFRESH_COOLDOWN = 60;
export const GOLD_TO_SILVER = 2;
export const SILVER_TO_COPPER = 3;

// 테마 설정
export const THEME_DEFAULT = 0;
export const THEME_DARK = 1;
export const THEME_LIGHT = 2;

// 힌트 이모지
export const EMOTE_MATCH = '🥕';
export const EMOTE_SIMILAR = '🍄';
export const EMOTE_MANY = '🧄';
export const EMOTE_EXISTS = '🍆';
export const EMOTE_OPPOSITE = '🍌';
export const EMOTE_NONE = '🍎';
export const EMOTE_HINT = '🎃';
export const EMOTE_ALL = '🥝';
export const EMOTE_KIWI = '🥝'; // 키위(다래) - 이미 주황색인 자모 힌트

// 메달 이모지
export const EMOTE_MEDAL_GOLD = '🥇';
export const EMOTE_MEDAL_SILVER = '🥈';
export const EMOTE_MEDAL_COPPER = '🥉';

// 기능 이모지
export const EMOTE_SPOILERS = '👁️';
export const EMOTE_WORDS = '🐴';
export const EMOTE_GLOBAL_SCORES = '🍉';
export const EMOTE_RACE_TIME = '⏱️';
export const EMOTE_MAGPIE = '🐦';
export const EMOTE_CREATE_MAGPIE = '✏️';
export const EMOTE_INPUT_MAGPIE = '❌';
export const EMOTE_FINALIZE_MAGPIE = '📬';
export const EMOTE_COPY_MAGPIE = '📪';

// 데이터 인덱스
export const DATA_EMOTE = 0;
export const DATA_NAME = 1;
export const DATA_SHORT = 2;
export const DATA_COLOR = 3;
export const DATA_LIMAGE = 4;
export const DATA_IMAGE = 5;
export const DATA_REVEAL = 6;
export const DATA_DESCRIPTION = 7;

// 힌트 데이터
export const DATA_MATCH = [EMOTE_MATCH, "당근", "ㄷ", "rgb(255, 130, 45)", "carrot.png", "carrot.png", "big-reveal", EMOTE_MATCH + " 당연하죠~\n해당 글자와 일치해요"];
export const DATA_SIMILAR = [EMOTE_SIMILAR, "버섯", "ㅄ", "rgb(248, 86, 155)", "mushroom.png", "mushroom.png", "medium-reveal", EMOTE_SIMILAR + " 비슷해요~\n자음과 모음 중 2개 이상이 일치하고 첫 자음도 일치해요"];
export const DATA_MANY = [EMOTE_MANY, "마늘", "ㅁ", "rgb(229, 205, 179)", "garlic.png", "garlic.png", "medium-reveal", EMOTE_MANY + " 많을 거예요~\n자음과 모음 중 2개 이상이 있지만 첫 자음은 일치하지 않아요"];
export const DATA_EXISTS = [EMOTE_EXISTS, "가지", "ㄱ", "rgb(140, 66, 179)", "eggplant.png", "eggplant.png", "small-reveal", EMOTE_EXISTS + " 가지고 있어요~\n입력한 자음과 모음 중 하나만 있어요"];
export const DATA_OPPOSITE = [EMOTE_OPPOSITE, "바난", "ㅂ", "rgb(248, 214, 87)", "banana_left.png", "banana.png", "small-reveal", EMOTE_OPPOSITE + " 반대로요~\n입력한 자음과 모음 중 1개 이상 있긴 있는데 반대쪽 글자에서 일치해요"];
export const DATA_NONE = [EMOTE_NONE, "사과", "ㅅ", "rgb(255, 70, 45)", "apple.png", "apple.png", "none-reveal", EMOTE_NONE + " 사과해요~\n입력한 자음과 모음이 정답에 없어요"];
