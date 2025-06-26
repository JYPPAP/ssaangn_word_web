export const TIME_IN_A_SECOND = 1000;
export const TIME_IN_A_MINUTE = TIME_IN_A_SECOND * 60;
export const TIME_IN_AN_HOUR = TIME_IN_A_MINUTE * 60;
export const TIME_IN_A_DAY = TIME_IN_AN_HOUR * 24;

export const SDTypes = {
    BOOL: 0,
    INT: 1,
    STRING: 2,
} as const;

export type SDType = typeof SDTypes[keyof typeof SDTypes];

export function clamp(num: number, low: number, high: number): number {
    if (num < low) {
        return low;
    }
    if (num > high) {
        return high;
    }
    return num;
}

export function remap(num: number, a: number, b: number, c: number, d: number): number {
    return c + (d - c) * (num - a) / (b - a);
}

export function degToRad(deg: number): number {
    return deg * (Math.PI / 180.0);
}

export function degreeToEdgeXY(deg: number): [number, number] {
    if (deg <= 45.0) {
        const c = 1.0 / Math.cos(degToRad(deg));
        const a = Math.sqrt(c * c - 1.0);
        return [-1, -a];
    }
    else if (deg <= 90.0) {
        const c = 1.0 / Math.cos(degToRad(90.0 - deg));
        const a = Math.sqrt(c * c - 1.0);
        return [-a, -1];
    }
    else if (deg <= 135.0) {
        const c = 1.0 / Math.cos(degToRad(deg - 90.0));
        const a = Math.sqrt(c * c - 1.0);
        return [a, -1];
    }
    else if (deg <= 180.0) {
        const c = 1.0 / Math.cos(degToRad(180.0 - deg));
        const a = Math.sqrt(c * c - 1.0);
        return [1, -a];
    }
    else if (deg <= 225.0) {
        const c = 1.0 / Math.cos(degToRad(deg - 180.0));
        const a = Math.sqrt(c * c - 1.0);
        return [1, a];
    }
    else if (deg <= 270.0) {
        const c = 1.0 / Math.cos(degToRad(270.0 - deg));
        const a = Math.sqrt(c * c - 1.0);
        return [a, 1];
    }
    else if (deg <= 315.0) {
        const c = 1.0 / Math.cos(degToRad(deg - 270.0));
        const a = Math.sqrt(c * c - 1.0);
        return [-a, 1];
    }
    else {
        const c = 1.0 / Math.cos(degToRad(360.0 - deg));
        const a = Math.sqrt(c * c - 1.0);
        return [-1, a];
    }
}

export function mulberry32(a: number): number {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

export function generateRandomPercentageList(num: number): number[] {
    const list: number[] = [];
    let total = 0;
    
    for (let i = 0; i < num; i++) {
        list[i] = Math.random() * (i + 1) * 10 + (i + 1) * 10;
        total += list[i];
    }

    for (let i = 0; i < num; i++) {
        list[i] /= total;
    }

    return list;
}

export function convertListToString(list: any[], separator?: string): string {
    if (list.length <= 0) {
        return '';
    }

    if (separator === undefined) {
        separator = ',';
    }

    let outString = list[0];
    for (let i = 1; i < list.length; i++) {
        outString += separator + list[i];
    }
    return outString;
}

export function binarySearch<T>(array: T[], value: T): number {
    let min = 0;
    let max = array.length - 1;

    while (min <= max) {
        const current = Math.floor((max + min) / 2);

        if (value === array[current]) {
            return current;
        }

        if (value < array[current]) {
            max = current - 1;
        }
        else {
            min = current + 1;
        }
    }

    return -1;
}

export function binarySearchIncludes<T>(array: T[], value: T): boolean {
    return binarySearch(array, value) !== -1;
}

export function getLocalDayNumberStartingWithYMD(utcDate: Date, startYear: number, startMonth: number, startDay: number): number {
    const firstDate = new Date(startYear, startMonth, startDay);
    return Math.floor((getLocalTime(utcDate) - getLocalTime(firstDate)) / TIME_IN_A_DAY) + 1;
}

export function getKoreanDayNumberStartingWithYMD(utcDate: Date, startYear: number, startMonth: number, startDay: number): number {
    const firstDate = new Date(startYear, startMonth, startDay);
    return Math.floor((getKoreanTime(utcDate) - getLocalTime(firstDate)) / TIME_IN_A_DAY) + 1;
}

function getKoreanTime(utcDate: Date): number {
    return getZoneTime(utcDate, -9 * 60);
}

function getLocalTime(utcDate: Date): number {
    return getZoneTime(utcDate, utcDate.getTimezoneOffset());
}

function getZoneTime(utcDate: Date, timezoneOffset: number): number {
    return utcDate.getTime() - timezoneOffset * TIME_IN_A_MINUTE;
}

export function getServerTime(): Date {
    let g_xmlHttp: XMLHttpRequest;
    try {
        // FF, Opera, Safari, Chrome
        g_xmlHttp = new XMLHttpRequest();
    }
    catch (err1) {
        // IE
        try {
            g_xmlHttp = new (window as any).ActiveXObject('Msxml2.XMLHTTP');
        }
        catch (err2) {
            try {
                g_xmlHttp = new (window as any).ActiveXObject('Microsoft.XMLHTTP');
            }
            catch (err3) {
                // AJAX not supported, use CPU time.
                return new Date();
            }
        }
    }

    g_xmlHttp.open('HEAD', window.location.href.toString(), false);
    g_xmlHttp.setRequestHeader("Content-Type", "text/html");
    g_xmlHttp.send('');
    return new Date(g_xmlHttp.getResponseHeader("Date") || '');
}

// Stored data types
export type StoredDataEntry<T> = [T, SDType, string];

// Stored data is in this format [value, type, name]
// EX: let sd_seenTutorial: StoredDataEntry<boolean> = [false, SDTypes.BOOL, "seenTutorial"];

export function getStoredDataValue<T>(sd: StoredDataEntry<T>): void {
    const value = getStoredData(sd[1], sd[2]);
    if (value !== undefined) {
        sd[0] = value as T;
    }
}

export function setStoredDataValue<T>(sd: StoredDataEntry<T>): void {
    setStoredData(sd[1], sd[2], sd[0]);
}

function getStoredData(sdType: SDType, sdName: string): any {
    const value = localStorage.getItem(sdName);
    if (value === null) {
        return undefined;
    }

    switch (sdType) {
        case SDTypes.BOOL: return parseInt(value) !== 0;
        case SDTypes.INT: return parseInt(value);
        case SDTypes.STRING: return value;
    }

    return undefined;
}

function setStoredData(sdType: SDType, sdName: string, value: any): void {
    switch (sdType) {
        case SDTypes.BOOL: 
            localStorage.setItem(sdName, value === true ? "1" : "0"); 
            break;
        case SDTypes.INT: 
            localStorage.setItem(sdName, value.toString()); 
            break;
        case SDTypes.STRING: 
            localStorage.setItem(sdName, value); 
            break;
    }
}

export function isElementScrolledToBottom(element: Element): boolean {
    return element.scrollTop + element.clientHeight >= element.scrollHeight - 1;
}

export function getElementPositionTop(element: Element): number {
    return parseInt(element.getBoundingClientRect().top + window.scrollY + '');
}

export function getElementPositionBottom(element: Element): number {
    return parseInt(element.getBoundingClientRect().bottom + window.scrollY + '');
}

export function getElementPositionCenterY(element: Element): number {
    return parseInt(((getElementPositionTop(element) + getElementPositionBottom(element)) / 2) + '');
}

export function getElementPositionLeft(element: Element): number {
    return parseInt(element.getBoundingClientRect().left + window.scrollX + '');
}

export function getElementPositionRight(element: Element): number {
    return parseInt(element.getBoundingClientRect().right + window.scrollX + '');
}

export function getElementPositionCenterX(element: Element): number {
    return parseInt(((getElementPositionLeft(element) + getElementPositionRight(element)) / 2) + '');
}

export function removeAllChildren(element: Element): void {
    while (element.firstChild) {
        element.removeChild(element.lastChild!);
    }
}

const g_preloadedImages: HTMLImageElement[] = [];
export function preloadImages(...imagePaths: string[]): void {
    for (let i = 0; i < imagePaths.length; i++) {
        const img = new Image();
        img.src = imagePaths[i];
        g_preloadedImages.push(img);
    }
}

// Number encoding/decoding functions for storage
export function encodeNumber(num: number, baseChar: string): string {
    let result = "";
    const baseCode = baseChar.charCodeAt(0);
    
    if (num === 0) {
        return String.fromCharCode(baseCode);
    }
    
    while (num > 0) {
        result = String.fromCharCode(baseCode + (num % 10)) + result;
        num = Math.floor(num / 10);
    }
    
    return result;
}

export function decodeNumber(data: string, index: number, baseChar: string): { value: number; newIndex: number } {
    const baseCode = baseChar.charCodeAt(0);
    let num = 0;
    let newIndex = index;
    
    while (newIndex < data.length) {
        const charCode = data.charCodeAt(newIndex);
        const digit = charCode - baseCode;
        
        if (digit < 0 || digit > 9) {
            break;
        }
        
        num = num * 10 + digit;
        newIndex++;
    }
    
    return { value: num, newIndex: newIndex };
}