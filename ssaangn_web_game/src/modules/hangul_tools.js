const JAMO_TABLE_START = 'ᄀ';
const JAMO_CONSONANT_START = 'ᄀ';
const JAMO_CONSONANT_END = 'ᄒ';
const JAMO_VOWEL_START = 'ᅡ';
const JAMO_VOWEL_END = 'ᅵ';

const HANGUL_SYLLABLE_TABLE_START = '가';
const HANGUL_SYLLABLE_TABLE_END = '힣';
const HANGUL_SYLLABLE_CONSONANT_SPAN = '까'.codePointAt() - '가'.codePointAt();
const HANGUL_SYLLABLE_VOWEL_SPAN = '개'.codePointAt() - '가'.codePointAt();

export const HANGUL_CONSONANT_COMPONENTS = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
export const HANGUL_VOWEL_COMPONENTS = "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅛㅜㅠㅡㅣ";
export const HANGUL_CONSONANT_VOWEL_LIST = HANGUL_CONSONANT_COMPONENTS + HANGUL_VOWEL_COMPONENTS;

export const HANGUL_VOWEL_PAIRING =
    [ //  ㅏ ㅐ  ㅑ ㅒ ㅓ ㅔ ㅕ ㅖ  ㅗ ㅛ ㅜ ㅠ  ㅡ ㅣ
        /*ㅏ*/[0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
        /*ㅐ*/[0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
        /*ㅑ*/[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        /*ㅒ*/[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        /*ㅓ*/[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        /*ㅔ*/[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        /*ㅕ*/[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        /*ㅖ*/[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        /*ㅗ*/[1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        /*ㅛ*/[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        /*ㅜ*/[0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1],
        /*ㅠ*/[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        /*ㅡ*/[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        /*ㅣ*/[0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0],
    ];

export const HANGUL_CONSONANT_PAIRING =
    [ //     ㄱ  ㄲ ㄴ ㄷ ㄸ ㄹ ㅁ  ㅂ ㅃ ㅅ ㅆ ㅇ ㅈ  ㅉ ㅊ ㅋ ㅌ ㅍ ㅎ
        /*  */[1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
        /*ㄱ*/[1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        /*ㄲ*/[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        /*ㄴ*/[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
        /*ㄷ*/[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        /*ㄸ*/[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        /*ㄹ*/[1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1],
        /*ㅁ*/[1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        /*ㅂ*/[1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        /*ㅃ*/[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        /*ㅅ*/[1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        /*ㅆ*/[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        /*ㅇ*/[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        /*ㅈ*/[1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        /*ㅉ*/[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        /*ㅊ*/[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        /*ㅋ*/[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        /*ㅌ*/[1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        /*ㅍ*/[1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        /*ㅎ*/[1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

const BATCHIM_INDEX_NONE = hangulSyllableToHangulBatchimIndex('가');
const BATCHIM_INDEX_ㄱ = hangulSyllableToHangulBatchimIndex('각');
const BATCHIM_INDEX_ㄲ = hangulSyllableToHangulBatchimIndex('갂');
const BATCHIM_INDEX_ㄳ = hangulSyllableToHangulBatchimIndex('갃');
const BATCHIM_INDEX_ㄴ = hangulSyllableToHangulBatchimIndex('간');
const BATCHIM_INDEX_ㄵ = hangulSyllableToHangulBatchimIndex('갅');
const BATCHIM_INDEX_ㄶ = hangulSyllableToHangulBatchimIndex('갆');
const BATCHIM_INDEX_ㄷ = hangulSyllableToHangulBatchimIndex('갇');
const BATCHIM_INDEX_ㄹ = hangulSyllableToHangulBatchimIndex('갈');
const BATCHIM_INDEX_ㄺ = hangulSyllableToHangulBatchimIndex('갉');
const BATCHIM_INDEX_ㄻ = hangulSyllableToHangulBatchimIndex('갊');
const BATCHIM_INDEX_ㄼ = hangulSyllableToHangulBatchimIndex('갋');
const BATCHIM_INDEX_ㄽ = hangulSyllableToHangulBatchimIndex('갌');
const BATCHIM_INDEX_ㄾ = hangulSyllableToHangulBatchimIndex('갍');
const BATCHIM_INDEX_ㄿ = hangulSyllableToHangulBatchimIndex('갎');
const BATCHIM_INDEX_ㅀ = hangulSyllableToHangulBatchimIndex('갏');
const BATCHIM_INDEX_ㅁ = hangulSyllableToHangulBatchimIndex('감');
const BATCHIM_INDEX_ㅂ = hangulSyllableToHangulBatchimIndex('갑');
const BATCHIM_INDEX_ㅄ = hangulSyllableToHangulBatchimIndex('값');
const BATCHIM_INDEX_ㅅ = hangulSyllableToHangulBatchimIndex('갓');
const BATCHIM_INDEX_ㅆ = hangulSyllableToHangulBatchimIndex('갔');
const BATCHIM_INDEX_ㅇ = hangulSyllableToHangulBatchimIndex('강');
const BATCHIM_INDEX_ㅈ = hangulSyllableToHangulBatchimIndex('갖');
const BATCHIM_INDEX_ㅊ = hangulSyllableToHangulBatchimIndex('갗');
const BATCHIM_INDEX_ㅋ = hangulSyllableToHangulBatchimIndex('갘');
const BATCHIM_INDEX_ㅌ = hangulSyllableToHangulBatchimIndex('같');
const BATCHIM_INDEX_ㅍ = hangulSyllableToHangulBatchimIndex('갚');
const BATCHIM_INDEX_ㅎ = hangulSyllableToHangulBatchimIndex('갛');

const CONSONANT_INDEX_ㄱ = jamoConsonantIndex('ᄀ');
const CONSONANT_INDEX_ㄲ = jamoConsonantIndex('ᄁ');
const CONSONANT_INDEX_ㄴ = jamoConsonantIndex('ᄂ');
const CONSONANT_INDEX_ㄷ = jamoConsonantIndex('ᄃ');
const CONSONANT_INDEX_ㄸ = jamoConsonantIndex('ᄄ');
const CONSONANT_INDEX_ㄹ = jamoConsonantIndex('ᄅ');
const CONSONANT_INDEX_ㅁ = jamoConsonantIndex('ᄆ');
const CONSONANT_INDEX_ㅂ = jamoConsonantIndex('ᄇ');
const CONSONANT_INDEX_ㅃ = jamoConsonantIndex('ᄈ');
const CONSONANT_INDEX_ㅅ = jamoConsonantIndex('ᄉ');
const CONSONANT_INDEX_ㅆ = jamoConsonantIndex('ᄊ');
const CONSONANT_INDEX_ㅇ = jamoConsonantIndex('ᄋ');
const CONSONANT_INDEX_ㅈ = jamoConsonantIndex('ᄌ');
const CONSONANT_INDEX_ㅉ = jamoConsonantIndex('ᄍ');
const CONSONANT_INDEX_ㅊ = jamoConsonantIndex('ᄎ');
const CONSONANT_INDEX_ㅋ = jamoConsonantIndex('ᄏ');
const CONSONANT_INDEX_ㅌ = jamoConsonantIndex('ᄐ');
const CONSONANT_INDEX_ㅍ = jamoConsonantIndex('ᄑ');
const CONSONANT_INDEX_ㅎ = jamoConsonantIndex('ᄒ');

const VOWEL_INDEX_ㅏ = jamoVowelToVowelIndex('ㅏ');
const VOWEL_INDEX_ㅐ = jamoVowelToVowelIndex('ㅐ');
const VOWEL_INDEX_ㅑ = jamoVowelToVowelIndex('ㅑ');
const VOWEL_INDEX_ㅒ = jamoVowelToVowelIndex('ㅒ');
const VOWEL_INDEX_ㅓ = jamoVowelToVowelIndex('ㅓ');
const VOWEL_INDEX_ㅔ = jamoVowelToVowelIndex('ㅔ');
const VOWEL_INDEX_ㅕ = jamoVowelToVowelIndex('ㅕ');
const VOWEL_INDEX_ㅖ = jamoVowelToVowelIndex('ㅖ');
const VOWEL_INDEX_ㅗ = jamoVowelToVowelIndex('ㅗ');
const VOWEL_INDEX_ㅘ = jamoVowelToVowelIndex('ㅘ');
const VOWEL_INDEX_ㅙ = jamoVowelToVowelIndex('ㅙ');
const VOWEL_INDEX_ㅚ = jamoVowelToVowelIndex('ㅚ');
const VOWEL_INDEX_ㅛ = jamoVowelToVowelIndex('ㅛ');
const VOWEL_INDEX_ㅜ = jamoVowelToVowelIndex('ㅜ');
const VOWEL_INDEX_ㅝ = jamoVowelToVowelIndex('ㅝ');
const VOWEL_INDEX_ㅞ = jamoVowelToVowelIndex('ㅞ');
const VOWEL_INDEX_ㅟ = jamoVowelToVowelIndex('ㅟ');
const VOWEL_INDEX_ㅠ = jamoVowelToVowelIndex('ㅠ');
const VOWEL_INDEX_ㅡ = jamoVowelToVowelIndex('ㅡ');
const VOWEL_INDEX_ㅢ = jamoVowelToVowelIndex('ㅢ');
const VOWEL_INDEX_ㅣ = jamoVowelToVowelIndex('ㅣ');

export function toJamo(character)
{
    switch (character)
    {
        case 'ㄱ': return 'ᄀ';
        case 'ㄲ': return 'ᄁ';
        case 'ㄴ': return 'ᄂ';
        case 'ㄷ': return 'ᄃ';
        case 'ㄸ': return 'ᄄ';
        case 'ㄹ': return 'ᄅ';
        case 'ㅁ': return 'ᄆ';
        case 'ㅂ': return 'ᄇ';
        case 'ㅃ': return 'ᄈ';
        case 'ㅅ': return 'ᄉ';
        case 'ㅆ': return 'ᄊ';
        case 'ㅇ': return 'ᄋ';
        case 'ㅈ': return 'ᄌ';
        case 'ㅉ': return 'ᄍ';
        case 'ㅊ': return 'ᄎ';
        case 'ㅋ': return 'ᄏ';
        case 'ㅌ': return 'ᄐ';
        case 'ㅍ': return 'ᄑ';
        case 'ㅎ': return 'ᄒ';
        case 'ㅏ': return 'ᅡ';
        case 'ㅐ': return 'ᅢ';
        case 'ㅑ': return 'ᅣ';
        case 'ㅒ': return 'ᅤ';
        case 'ㅓ': return 'ᅥ';
        case 'ㅔ': return 'ᅦ';
        case 'ㅕ': return 'ᅧ';
        case 'ㅖ': return 'ᅨ';
        case 'ㅗ': return 'ᅩ';
        case 'ㅛ': return 'ᅭ';
        case 'ㅜ': return 'ᅮ';
        case 'ㅠ': return 'ᅲ';
        case 'ㅡ': return 'ᅳ';
        case 'ㅣ': return 'ᅵ';
        case 'ㅘ': return 'ᅪ';
        case 'ㅙ': return 'ᅫ';
        case 'ㅚ': return 'ᅬ';
        case 'ㅝ': return 'ᅯ';
        case 'ㅞ': return 'ᅰ';
        case 'ㅟ': return 'ᅱ';
        case 'ㅢ': return 'ᅴ';
    }

    return character;
}

export function isHangulConsonant(character)
{
    if (character.length != 1)
    {
        return false;
    }

    character = toJamo(character);

    return character >= JAMO_CONSONANT_START && character <= JAMO_CONSONANT_END;
}

export function isHangulVowel(character)
{
    if (character.length != 1)
    {
        return false;
    }

    character = toJamo(character);

    return character >= JAMO_VOWEL_START && character <= JAMO_VOWEL_END;
}

export function isHangulSyllable(character)
{
    if (character.length != 1)
    {
        return false;
    }

    return character >= HANGUL_SYLLABLE_TABLE_START && character <= HANGUL_SYLLABLE_TABLE_END;
}

export function hasBatchim(character)
{
    if (!isHangulSyllable(character))
    {
        return false;
    }

    let offset = hangulSyllableToHangulBatchimIndex(character);
    return offset != BATCHIM_INDEX_NONE;
}

function jamoConsonantIndex(character)
{
    if (!isHangulConsonant(character))
    {
        return undefined;
    }

    character = toJamo(character);

    return character.charCodeAt(0) - JAMO_TABLE_START.codePointAt();
}

function jamoConsonantToHangulSyllables(character)
{
    if (!isHangulConsonant(character))
    {
        return undefined;
    }

    character = toJamo(character);

    return jamoConsonantIndex(character) * HANGUL_SYLLABLE_CONSONANT_SPAN + HANGUL_SYLLABLE_TABLE_START.codePointAt();
}

function jamoVowelToVowelIndex(character)
{
    if (!isHangulVowel(character))
    {
        return undefined;
    }

    character = toJamo(character);

    let code = character.charCodeAt(0);
    return code - JAMO_VOWEL_START.codePointAt();
}

function jamoVowelToHangulSyllableOffset(character)
{
    return jamoVowelToVowelIndex(character) * HANGUL_SYLLABLE_VOWEL_SPAN;
}

function hangulSyllableToHangulBatchimIndex(character)
{
    if (!isHangulSyllable(character))
    {
        return undefined;
    }

    let code = character.charCodeAt(0);
    return (code - HANGUL_SYLLABLE_TABLE_START.codePointAt()) % HANGUL_SYLLABLE_VOWEL_SPAN;
}

function hangulBatchimIndexToJamoConsonant(index)
{
    switch (index)
    {
        case BATCHIM_INDEX_ㄱ:
        case BATCHIM_INDEX_ㄺ: return 'ᄀ';
        case BATCHIM_INDEX_ㄲ: return 'ᄁ';
        case BATCHIM_INDEX_ㄴ: return 'ᄂ';
        case BATCHIM_INDEX_ㄷ: return 'ᄃ';
        case BATCHIM_INDEX_ㄹ: return 'ᄅ';
        case BATCHIM_INDEX_ㄻ:
        case BATCHIM_INDEX_ㅁ: return 'ᄆ';
        case BATCHIM_INDEX_ㄼ:
        case BATCHIM_INDEX_ㅂ: return 'ᄇ';
        case BATCHIM_INDEX_ㄳ:
        case BATCHIM_INDEX_ㄽ:
        case BATCHIM_INDEX_ㅄ:
        case BATCHIM_INDEX_ㅅ: return 'ᄉ';
        case BATCHIM_INDEX_ㅆ: return 'ᄊ';
        case BATCHIM_INDEX_ㅇ: return 'ᄋ';
        case BATCHIM_INDEX_ㄵ:
        case BATCHIM_INDEX_ㅈ: return 'ᄌ';
        case BATCHIM_INDEX_ㅊ: return 'ᄎ';
        case BATCHIM_INDEX_ㅋ: return 'ᄏ';
        case BATCHIM_INDEX_ㄾ:
        case BATCHIM_INDEX_ㅌ: return 'ᄐ';
        case BATCHIM_INDEX_ㄿ:
        case BATCHIM_INDEX_ㅍ: return 'ᄑ';
        case BATCHIM_INDEX_ㄶ:
        case BATCHIM_INDEX_ㅀ:
        case BATCHIM_INDEX_ㅎ: return 'ᄒ';
    }

    return undefined;
}

function hangulSyllableToFirstConsonantJamoText(character)
{
    let index = hangulSyllableToHangulConsonantIndex(character);
    if (index === undefined)
    {
        return undefined;
    }

    switch (index)
    {
        case CONSONANT_INDEX_ㄱ: return 'ㄱ';
        case CONSONANT_INDEX_ㄲ: return 'ㄲ';
        case CONSONANT_INDEX_ㄴ: return 'ㄴ';
        case CONSONANT_INDEX_ㄷ: return 'ㄷ';
        case CONSONANT_INDEX_ㄸ: return 'ㄸ';
        case CONSONANT_INDEX_ㄹ: return 'ㄹ';
        case CONSONANT_INDEX_ㅁ: return 'ㅁ';
        case CONSONANT_INDEX_ㅂ: return 'ㅂ';
        case CONSONANT_INDEX_ㅃ: return 'ㅃ';
        case CONSONANT_INDEX_ㅅ: return 'ㅅ';
        case CONSONANT_INDEX_ㅆ: return 'ㅆ';
        case CONSONANT_INDEX_ㅇ: return 'ㅇ';
        case CONSONANT_INDEX_ㅈ: return 'ㅈ';
        case CONSONANT_INDEX_ㅉ: return 'ㅉ';
        case CONSONANT_INDEX_ㅊ: return 'ㅊ';
        case CONSONANT_INDEX_ㅋ: return 'ㅋ';
        case CONSONANT_INDEX_ㅌ: return 'ㅌ';
        case CONSONANT_INDEX_ㅍ: return 'ㅍ';
        case CONSONANT_INDEX_ㅎ: return 'ㅎ';
    }

    return undefined;
}

function jamoVowelIndexToJamoText(index)
{
    switch (index)
    {
        case VOWEL_INDEX_ㅏ: return 'ㅏ';
        case VOWEL_INDEX_ㅐ: return 'ㅐ';
        case VOWEL_INDEX_ㅑ: return 'ㅑ';
        case VOWEL_INDEX_ㅒ: return 'ㅒ';
        case VOWEL_INDEX_ㅓ: return 'ㅓ';
        case VOWEL_INDEX_ㅔ: return 'ㅔ';
        case VOWEL_INDEX_ㅕ: return 'ㅕ';
        case VOWEL_INDEX_ㅖ: return 'ㅖ';
        case VOWEL_INDEX_ㅗ: return 'ㅗ';
        case VOWEL_INDEX_ㅘ: return 'ㅗㅏ';
        case VOWEL_INDEX_ㅙ: return 'ㅗㅐ';
        case VOWEL_INDEX_ㅚ: return 'ㅗㅣ';
        case VOWEL_INDEX_ㅛ: return 'ㅛ';
        case VOWEL_INDEX_ㅜ: return 'ㅜ';
        case VOWEL_INDEX_ㅝ: return 'ㅜㅓ';
        case VOWEL_INDEX_ㅞ: return 'ㅜㅔ';
        case VOWEL_INDEX_ㅟ: return 'ㅜㅣ';
        case VOWEL_INDEX_ㅠ: return 'ㅠ';
        case VOWEL_INDEX_ㅡ: return 'ㅡ';
        case VOWEL_INDEX_ㅢ: return 'ㅡㅣ';
        case VOWEL_INDEX_ㅣ: return 'ㅣ';
    }

    return undefined;
}

function jamoBatchimIndexToJamoText(index)
{
    if (index < BATCHIM_INDEX_NONE ||
        index > BATCHIM_INDEX_ㅎ)
    {
        return undefined;
    }

    switch (index)
    {
        case BATCHIM_INDEX_NONE: return '';
        case BATCHIM_INDEX_ㄱ: return 'ㄱ';
        case BATCHIM_INDEX_ㄲ: return 'ㄲ';
        case BATCHIM_INDEX_ㄳ: return 'ㄱㅅ';
        case BATCHIM_INDEX_ㄴ: return 'ㄴ';
        case BATCHIM_INDEX_ㄵ: return 'ㄴㅈ';
        case BATCHIM_INDEX_ㄶ: return 'ㄴㅎ';
        case BATCHIM_INDEX_ㄷ: return 'ㄷ';
        case BATCHIM_INDEX_ㄹ: return 'ㄹ';
        case BATCHIM_INDEX_ㄺ: return 'ㄹㄱ';
        case BATCHIM_INDEX_ㄻ: return 'ㄹㅁ';
        case BATCHIM_INDEX_ㄼ: return 'ㄹㅂ';
        case BATCHIM_INDEX_ㄽ: return 'ㄹㅅ';
        case BATCHIM_INDEX_ㄾ: return 'ㄹㅌ';
        case BATCHIM_INDEX_ㄿ: return 'ㄹㅍ';
        case BATCHIM_INDEX_ㅀ: return 'ㄹㅎ';
        case BATCHIM_INDEX_ㅁ: return 'ㅁ';
        case BATCHIM_INDEX_ㅂ: return 'ㅂ';
        case BATCHIM_INDEX_ㅄ: return 'ㅂㅅ';
        case BATCHIM_INDEX_ㅅ: return 'ㅅ';
        case BATCHIM_INDEX_ㅆ: return 'ㅆ';
        case BATCHIM_INDEX_ㅇ: return 'ㅇ';
        case BATCHIM_INDEX_ㅈ: return 'ㅈ';
        case BATCHIM_INDEX_ㅊ: return 'ㅊ';
        case BATCHIM_INDEX_ㅋ: return 'ㅋ';
        case BATCHIM_INDEX_ㅌ: return 'ㅌ';
        case BATCHIM_INDEX_ㅍ: return 'ㅍ';
        case BATCHIM_INDEX_ㅎ: return 'ㅎ';
    }

    return undefined;
}

function hangulSyllableToHangulConsonantIndex(character)
{
    if (!isHangulSyllable(character))
    {
        return undefined;
    }

    let code = character.charCodeAt(0);
    return Math.floor((code - HANGUL_SYLLABLE_TABLE_START.codePointAt()) / HANGUL_SYLLABLE_CONSONANT_SPAN);
}

export function hangulSyllableToHangulVowelIndex(character)
{
    if (!isHangulSyllable(character))
    {
        return undefined;
    }

    let code = character.charCodeAt(0);
    return Math.floor((code - HANGUL_SYLLABLE_TABLE_START.codePointAt() - (hangulSyllableToHangulConsonantIndex(character) * HANGUL_SYLLABLE_CONSONANT_SPAN)) / HANGUL_SYLLABLE_VOWEL_SPAN);
}

export function appendHangul(previous, pressedKey)
{
    if (isHangulConsonant(previous))
    {
        if (!isHangulVowel(pressedKey))
        {
            return previous;
        }

        return String.fromCharCode(jamoConsonantToHangulSyllables(previous) + jamoVowelToHangulSyllableOffset(pressedKey));
    }

    let appendedVowel = appendVowel(previous, pressedKey);
    if (appendedVowel != undefined)
    {
        return appendedVowel;
    }

    let appendedBatchim = appendBatchim(previous, pressedKey);
    if (appendedBatchim != undefined)
    {
        return appendedBatchim;
    }

    return previous + pressedKey;
}

function appendVowel(previous, pressedKey)
{
    if (!isHangulSyllable(previous))
    {
        return undefined;
    }

    if (!isHangulVowel(pressedKey))
    {
        return undefined;
    }

    let syllables = hangulSyllableToHangulConsonantIndex(previous) * HANGUL_SYLLABLE_CONSONANT_SPAN + HANGUL_SYLLABLE_TABLE_START.codePointAt();
    let vowelIndex = hangulSyllableToHangulVowelIndex(previous);
    let offset = hangulSyllableToHangulBatchimIndex(previous);

    switch (offset)
    {
        case BATCHIM_INDEX_NONE:
            break;

        default:
            let nextConsonant = hangulBatchimIndexToJamoConsonant(offset);
            if (nextConsonant === undefined)
            {
                return undefined;
            }

            return deleteOneBatchim(previous) +
                String.fromCharCode(jamoConsonantToHangulSyllables(nextConsonant) + jamoVowelToVowelIndex(pressedKey) * HANGUL_SYLLABLE_VOWEL_SPAN);
    }

    let character = toJamo(pressedKey);

    switch (vowelIndex)
    {
        case VOWEL_INDEX_ㅗ:
            switch (character)
            {
                case 'ᅡ': return String.fromCharCode(syllables + VOWEL_INDEX_ㅘ * HANGUL_SYLLABLE_VOWEL_SPAN);
                case 'ᅢ': return String.fromCharCode(syllables + VOWEL_INDEX_ㅙ * HANGUL_SYLLABLE_VOWEL_SPAN);
                case 'ᅵ': return String.fromCharCode(syllables + VOWEL_INDEX_ㅚ * HANGUL_SYLLABLE_VOWEL_SPAN);
            }
            break;

        case VOWEL_INDEX_ㅜ:
            switch (character)
            {
                case 'ᅥ': return String.fromCharCode(syllables + VOWEL_INDEX_ㅝ * HANGUL_SYLLABLE_VOWEL_SPAN);
                case 'ᅦ': return String.fromCharCode(syllables + VOWEL_INDEX_ㅞ * HANGUL_SYLLABLE_VOWEL_SPAN);
                case 'ᅵ': return String.fromCharCode(syllables + VOWEL_INDEX_ㅟ * HANGUL_SYLLABLE_VOWEL_SPAN);
            }
            break;

        case VOWEL_INDEX_ㅡ:
            switch (character)
            {
                case 'ᅵ': return String.fromCharCode(syllables + VOWEL_INDEX_ㅢ * HANGUL_SYLLABLE_VOWEL_SPAN);
            }
            break;
    }

    return undefined;
}

function appendBatchim(previous, pressedKey)
{
    if (!isHangulSyllable(previous))
    {
        return undefined;
    }

    if (!isHangulConsonant(pressedKey))
    {
        return undefined;
    }

    let consonantIndex = jamoConsonantIndex(pressedKey);

    let syllables = hangulSyllableToHangulConsonantIndex(previous) * HANGUL_SYLLABLE_CONSONANT_SPAN + HANGUL_SYLLABLE_TABLE_START.codePointAt() +
        hangulSyllableToHangulVowelIndex(previous) * HANGUL_SYLLABLE_VOWEL_SPAN;
    let offset = hangulSyllableToHangulBatchimIndex(previous);
    switch (offset)
    {
        case BATCHIM_INDEX_NONE:
            switch (consonantIndex)
            {
                case CONSONANT_INDEX_ㄱ: return String.fromCharCode(syllables + BATCHIM_INDEX_ㄱ);
                case CONSONANT_INDEX_ㄲ: return String.fromCharCode(syllables + BATCHIM_INDEX_ㄲ);
                case CONSONANT_INDEX_ㄴ: return String.fromCharCode(syllables + BATCHIM_INDEX_ㄴ);
                case CONSONANT_INDEX_ㄷ: return String.fromCharCode(syllables + BATCHIM_INDEX_ㄷ);
                case CONSONANT_INDEX_ㄹ: return String.fromCharCode(syllables + BATCHIM_INDEX_ㄹ);
                case CONSONANT_INDEX_ㅁ: return String.fromCharCode(syllables + BATCHIM_INDEX_ㅁ);
                case CONSONANT_INDEX_ㅂ: return String.fromCharCode(syllables + BATCHIM_INDEX_ㅂ);
                case CONSONANT_INDEX_ㅅ: return String.fromCharCode(syllables + BATCHIM_INDEX_ㅅ);
                case CONSONANT_INDEX_ㅆ: return String.fromCharCode(syllables + BATCHIM_INDEX_ㅆ);
                case CONSONANT_INDEX_ㅇ: return String.fromCharCode(syllables + BATCHIM_INDEX_ㅇ);
                case CONSONANT_INDEX_ㅈ: return String.fromCharCode(syllables + BATCHIM_INDEX_ㅈ);
                case CONSONANT_INDEX_ㅊ: return String.fromCharCode(syllables + BATCHIM_INDEX_ㅊ);
                case CONSONANT_INDEX_ㅋ: return String.fromCharCode(syllables + BATCHIM_INDEX_ㅋ);
                case CONSONANT_INDEX_ㅌ: return String.fromCharCode(syllables + BATCHIM_INDEX_ㅌ);
                case CONSONANT_INDEX_ㅍ: return String.fromCharCode(syllables + BATCHIM_INDEX_ㅍ);
                case CONSONANT_INDEX_ㅎ: return String.fromCharCode(syllables + BATCHIM_INDEX_ㅎ);
            }
            break;

        case BATCHIM_INDEX_ㄱ:
            switch (consonantIndex)
            {
                case CONSONANT_INDEX_ㅅ: return String.fromCharCode(syllables + BATCHIM_INDEX_ㄳ);
            }
            break;

        case BATCHIM_INDEX_ㄴ:
            switch (consonantIndex)
            {
                case CONSONANT_INDEX_ㅈ: return String.fromCharCode(syllables + BATCHIM_INDEX_ㄵ);
                case CONSONANT_INDEX_ㅎ: return String.fromCharCode(syllables + BATCHIM_INDEX_ㄶ);
            }
            break;

        case BATCHIM_INDEX_ㄹ:
            switch (consonantIndex)
            {
                case CONSONANT_INDEX_ㄱ: return String.fromCharCode(syllables + BATCHIM_INDEX_ㄺ);
                case CONSONANT_INDEX_ㅁ: return String.fromCharCode(syllables + BATCHIM_INDEX_ㄻ);
                case CONSONANT_INDEX_ㅂ: return String.fromCharCode(syllables + BATCHIM_INDEX_ㄼ);
                case CONSONANT_INDEX_ㅅ: return String.fromCharCode(syllables + BATCHIM_INDEX_ㄽ);
                case CONSONANT_INDEX_ㅌ: return String.fromCharCode(syllables + BATCHIM_INDEX_ㄾ);
                case CONSONANT_INDEX_ㅍ: return String.fromCharCode(syllables + BATCHIM_INDEX_ㄿ);
                case CONSONANT_INDEX_ㅎ: return String.fromCharCode(syllables + BATCHIM_INDEX_ㅀ);
            }
            break;

        case BATCHIM_INDEX_ㅂ:
            switch (consonantIndex)
            {
                case CONSONANT_INDEX_ㅅ: return String.fromCharCode(syllables + BATCHIM_INDEX_ㅄ);
            }
            break;
    }

    return undefined;
}

export function deleteOneJamo(previous)
{
    if (!isHangulSyllable(previous))
    {
        return "";
    }

    if (hasBatchim(previous))
    {
        return deleteOneBatchim(previous);
    }

    return deleteOneVowel(previous);
}

function deleteOneVowel(previous)
{
    if (hasBatchim(previous))
    {
        return previous;
    }

    if (!isHangulSyllable(previous))
    {
        return previous;
    }

    let syllables = hangulSyllableToHangulConsonantIndex(previous) * HANGUL_SYLLABLE_CONSONANT_SPAN + HANGUL_SYLLABLE_TABLE_START.codePointAt();
    let vowelIndex = hangulSyllableToHangulVowelIndex(previous);

    switch (vowelIndex)
    {
        case VOWEL_INDEX_ㅘ:
        case VOWEL_INDEX_ㅙ:
        case VOWEL_INDEX_ㅚ:
            return String.fromCharCode(syllables + VOWEL_INDEX_ㅗ * HANGUL_SYLLABLE_VOWEL_SPAN);

        case VOWEL_INDEX_ㅝ:
        case VOWEL_INDEX_ㅞ:
        case VOWEL_INDEX_ㅟ:
            return String.fromCharCode(syllables + VOWEL_INDEX_ㅜ * HANGUL_SYLLABLE_VOWEL_SPAN);

        case VOWEL_INDEX_ㅢ:
            return String.fromCharCode(syllables + VOWEL_INDEX_ㅡ * HANGUL_SYLLABLE_VOWEL_SPAN);
    }

    return hangulSyllableToFirstConsonantJamoText(previous);
}

function deleteOneBatchim(previous)
{
    if (!hasBatchim(previous))
    {
        return previous;
    }

    let syllables = hangulSyllableToHangulConsonantIndex(previous) * HANGUL_SYLLABLE_CONSONANT_SPAN + HANGUL_SYLLABLE_TABLE_START.codePointAt() +
        hangulSyllableToHangulVowelIndex(previous) * HANGUL_SYLLABLE_VOWEL_SPAN;
    let offset = hangulSyllableToHangulBatchimIndex(previous);

    switch (offset)
    {
        case BATCHIM_INDEX_ㄱ:
        case BATCHIM_INDEX_ㄲ:
        case BATCHIM_INDEX_ㄴ:
        case BATCHIM_INDEX_ㄷ:
        case BATCHIM_INDEX_ㄹ:
        case BATCHIM_INDEX_ㅁ:
        case BATCHIM_INDEX_ㅂ:
        case BATCHIM_INDEX_ㅅ:
        case BATCHIM_INDEX_ㅆ:
        case BATCHIM_INDEX_ㅇ:
        case BATCHIM_INDEX_ㅈ:
        case BATCHIM_INDEX_ㅊ:
        case BATCHIM_INDEX_ㅋ:
        case BATCHIM_INDEX_ㅌ:
        case BATCHIM_INDEX_ㅍ:
        case BATCHIM_INDEX_ㅎ:
            return String.fromCharCode(syllables);

        case BATCHIM_INDEX_ㄳ:
            return String.fromCharCode(syllables + BATCHIM_INDEX_ㄱ);

        case BATCHIM_INDEX_ㄵ:
        case BATCHIM_INDEX_ㄶ:
            return String.fromCharCode(syllables + BATCHIM_INDEX_ㄴ);

        case BATCHIM_INDEX_ㄺ:
        case BATCHIM_INDEX_ㄻ:
        case BATCHIM_INDEX_ㄼ:
        case BATCHIM_INDEX_ㄽ:
        case BATCHIM_INDEX_ㄾ:
        case BATCHIM_INDEX_ㄿ:
        case BATCHIM_INDEX_ㅀ:
            return String.fromCharCode(syllables + BATCHIM_INDEX_ㄹ);

        case BATCHIM_INDEX_ㅄ:
            return String.fromCharCode(syllables + BATCHIM_INDEX_ㅂ);
    }

    return character;
}

/* 수정 전 원본 코드 */
export function hangulSyllableToJamoComponentsText(character)
{
    if (!isHangulSyllable(character))
    {
        return character;
    }

    let result = hangulSyllableToFirstConsonantJamoText(character);

    let vowelIndex = hangulSyllableToHangulVowelIndex(character);
    result += jamoVowelIndexToJamoText(vowelIndex);

    let offset = hangulSyllableToHangulBatchimIndex(character);
    result += jamoBatchimIndexToJamoText(offset);

    return result;
}

export function keyboardKeyToJamoText(pressedKey)
{
    if (pressedKey.length != 1)
    {
        return pressedKey;
    }

    switch (pressedKey)
    {
        case 'q': return 'ㅂ';
        case 'Q': return 'ㅃ';
        case 'w': return 'ㅈ';
        case 'W': return 'ㅉ';
        case 'e': return 'ㄷ';
        case 'E': return 'ㄸ';
        case 'r': return 'ㄱ';
        case 'R': return 'ㄲ';
        case 't': return 'ㅅ';
        case 'T': return 'ㅆ';
        case 'y': case 'Y': return 'ㅛ';
        case 'u': case 'U': return 'ㅕ';
        case 'i': case 'I': return 'ㅑ';
        case 'o': return 'ㅐ';
        case 'O': return 'ㅒ';
        case 'p': return 'ㅔ';
        case 'P': return 'ㅖ';

        case 'a': case 'A': return 'ㅁ';
        case 's': case 'S': return 'ㄴ';
        case 'd': case 'D': return 'ㅇ';
        case 'f': case 'F': return 'ㄹ';
        case 'g': case 'G': return 'ㅎ';
        case 'h': case 'H': return 'ㅗ';
        case 'j': case 'J': return 'ㅓ';
        case 'k': case 'K': return 'ㅏ';
        case 'l': case 'L': return 'ㅣ';

        case 'z': case 'Z': return 'ㅋ';
        case 'x': case 'X': return 'ㅌ';
        case 'c': case 'C': return 'ㅊ';
        case 'v': case 'V': return 'ㅍ';
        case 'b': case 'B': return 'ㅠ';
        case 'n': case 'N': return 'ㅜ';
        case 'm': case 'M': return 'ㅡ';

        case '\\': return '₩';
    }

    return pressedKey;
}

function vowelToPairingIndex(vowel)
{
    if (vowel.length != 1)
    {
        return -1;
    }

    switch (vowel)
    {
        case 'ㅏ': return 0;
        case 'ㅐ': return 1;
        case 'ㅑ': return 2;
        case 'ㅒ': return 3;
        case 'ㅓ': return 4;
        case 'ㅔ': return 5;
        case 'ㅕ': return 6;
        case 'ㅖ': return 7;
        case 'ㅗ': return 8;
        case 'ㅛ': return 9;
        case 'ㅜ': return 10;
        case 'ㅠ': return 11;
        case 'ㅡ': return 12;
        case 'ㅣ': return 13;
    }

    return -1;
}

function consonantToPairingIndex(vowel)
{
    if (vowel.length != 1)
    {
        return -1;
    }

    switch (vowel)
    {
        case ' ': return 0;
        case 'ㄱ': return 1;
        case 'ㄲ': return 2;
        case 'ㄴ': return 3;
        case 'ㄷ': return 4;
        case 'ㄸ': return 5;
        case 'ㄹ': return 6;
        case 'ㅁ': return 7;
        case 'ㅂ': return 8;
        case 'ㅃ': return 9;
        case 'ㅅ': return 10;
        case 'ㅆ': return 11;
        case 'ㅇ': return 12;
        case 'ㅈ': return 13;
        case 'ㅉ': return 14;
        case 'ㅊ': return 15;
        case 'ㅋ': return 16;
        case 'ㅌ': return 17;
        case 'ㅍ': return 18;
        case 'ㅎ': return 19;
    }

    return -1;
}

export function getUnpairableVowels(vowel)
{
    let unpairable = [];
    if (vowel.length != 1)
    {
        return unpairable;
    }

    let indexA = vowelToPairingIndex(vowel);
    if (indexA < 0)
    {
        return unpairable;
    }

    for (let i = 0; i < HANGUL_VOWEL_COMPONENTS.length; i++)
    {
        if (HANGUL_VOWEL_COMPONENTS[i] == vowel)
        {
            continue;
        }

        let indexB = vowelToPairingIndex(HANGUL_VOWEL_COMPONENTS[i]);
        if (indexB < 0)
        {
            continue;
        }

        if (HANGUL_VOWEL_PAIRING[indexA][indexB] != 0)
        {
            continue;
        }

        unpairable.push(HANGUL_VOWEL_COMPONENTS[i]);
    }

    return unpairable;
}

export function areUnpairableVowels(vowelA, vowelB)
{
    if (vowelA.length != 1 || vowelB.length != 1)
    {
        return false;
    }

    if (vowelA == vowelB)
    {
        return false;
    }

    let indexA = vowelToPairingIndex(vowelA);
    if (indexA < 0)
    {
        return false;
    }

    let indexB = vowelToPairingIndex(vowelB);
    if (indexB < 0)
    {
        return false;
    }

    return HANGUL_VOWEL_PAIRING[indexA][indexB] == 0;
}

export function getUnpairableConsonants(consonant)
{
    let unpairable = [];
    if (consonant.length != 1)
    {
        return unpairable;
    }

    let indexA = consonantToPairingIndex(consonant);
    if (indexA < 0)
    {
        return unpairable;
    }

    for (let i = 0; i < HANGUL_CONSONANT_COMPONENTS.length; i++)
    {
        let indexB = consonantToPairingIndex(HANGUL_CONSONANT_COMPONENTS[i]);
        if (indexB < 0)
        {
            continue;
        }

        if (HANGUL_CONSONANT_PAIRING[indexA][indexB] != 0)
        {
            continue;
        }

        unpairable.push(HANGUL_CONSONANT_COMPONENTS[i]);
    }

    return unpairable;
}

export function areUnpairableConsonants(consonantA, consonantB)
{
    if (consonantA.length != 1 || consonantB.length != 1)
    {
        return false;
    }

    if (consonantA == consonantB)
    {
        return false;
    }

    let indexA = consonantToPairingIndex(consonantA);
    if (indexA < 0)
    {
        return false;
    }

    let indexB = consonantToPairingIndex(consonantB);
    if (indexB < 0)
    {
        return false;
    }

    return HANGUL_CONSONANT_PAIRING[indexA][indexB] == 0;
}