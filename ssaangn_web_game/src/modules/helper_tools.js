export const TIME_IN_A_SECOND = 1000;
export const TIME_IN_A_MINUTE = TIME_IN_A_SECOND * 60;
export const TIME_IN_AN_HOUR = TIME_IN_A_MINUTE * 60;
export const TIME_IN_A_DAY = TIME_IN_AN_HOUR * 24;

export const SDTypes = {
    BOOL: 0,
    INT: 1,
    STRING: 2,
}

export function clamp(num, low, high)
{
    if (num < low)
    {
        return low;
    }
    if (num > high)
    {
        return high;
    }
    return num;
}

export function remap(num, a, b, c, d)
{
    return c + (d - c) * (num - a) / (b - a);
}

export function degToRad(deg)
{
    return deg * (Math.PI / 180.0);
}

export function degreeToEdgeXY(deg)
{
    if (deg <= 45.0)
    {
        let c = 1.0 / Math.cos(degToRad(deg));
        let a = Math.sqrt(c * c - 1.0);
        return [-1, -a];
    }
    else if (deg <= 90.0)
    {
        let c = 1.0 / Math.cos(degToRad(90.0 - deg));
        let a = Math.sqrt(c * c - 1.0);
        return [-a, -1];
    }
    else if (deg <= 135.0)
    {
        let c = 1.0 / Math.cos(degToRad(deg - 90.0));
        let a = Math.sqrt(c * c - 1.0);
        return [a, -1];
    }
    else if (deg <= 180.0)
    {
        let c = 1.0 / Math.cos(degToRad(180.0 - deg));
        let a = Math.sqrt(c * c - 1.0);
        return [1, -a];
    }
    else if (deg <= 225.0)
    {
        let c = 1.0 / Math.cos(degToRad(deg - 180.0));
        let a = Math.sqrt(c * c - 1.0);
        return [1, a];
    }
    else if (deg <= 270.0)
    {
        let c = 1.0 / Math.cos(degToRad(270.0 - deg));
        let a = Math.sqrt(c * c - 1.0);
        return [a, 1];
    }
    else if (deg <= 315.0)
    {
        let c = 1.0 / Math.cos(degToRad(deg - 270.0));
        let a = Math.sqrt(c * c - 1.0);
        return [-a, 1];
    }
    else
    {
        let c = 1.0 / Math.cos(degToRad(360.0 - deg));
        let a = Math.sqrt(c * c - 1.0);
        return [-1, a];
    }
}

export function mulberry32(a)
{
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

export function generateRandomPercentageList(num)
{
    let list = [];
    let total = 0;
    for (let i = 0; i < num; i++)
    {
        list[i] = Math.random() * (i + 1) * 10 + (i + 1) * 10;
        total += list[i];
    }

    for (let i = 0; i < num; i++)
    {
        list[i] /= total;
    }

    return list;
}

export function convertListToString(list, seperator)
{
    if (list.length <= 0)
    {
        return list;
    }

    if (seperator === undefined)
    {
        seperator = ',';
    }

    let outString = list[0];
    for (let i = 1; i < list.length; i++)
    {
        outString += seperator + list[i];
    }
    return outString
}

export function binarySearch(array, value)
{
    let min = 0;
    let max = array.length - 1;

    while (min <= max)
    {
        let current = Math.floor((max + min) / 2);

        if (value == array[current])
        {
            return current;
        }

        if (value < array[current])
        {
            max = current - 1;
        }
        else
        {
            min = current + 1;
        }
    }

    return -1;
}

export function binarySearchIncludes(array, value)
{
    return binarySearch(array, value) != -1;
}

export function getLocalDayNumberStartingWithYMD(utcDate, startYear, startMonth, startDay)
{
    let firstDate = new Date(startYear, startMonth, startDay);
    return Math.floor((getLocalTime(utcDate) - getLocalTime(firstDate)) / TIME_IN_A_DAY) + 1;
}

export function getKoreanDayNumberStartingWithYMD(utcDate, startYear, startMonth, startDay)
{
    let firstDate = new Date(startYear, startMonth, startDay);
    return Math.floor((getKoreanTime(utcDate) - getLocalTime(firstDate)) / TIME_IN_A_DAY) + 1;
}

function getKoreanTime(utcDate)
{
    return getZoneTime(utcDate, -9 * 60);
}

function getLocalTime(utcDate)
{
    return getZoneTime(utcDate, utcDate.getTimezoneOffset());
}

function getZoneTime(utcDate, timezoneOffset)
{
    return utcDate.getTime() - timezoneOffset * TIME_IN_A_MINUTE;
}

export function getServerTime()
{
    var g_xmlHttp;
    try
    {
        //FF, Opera, Safari, Chrome
        g_xmlHttp = new XMLHttpRequest();
    }
    catch (err1)
    {
        //IE
        try
        {
            g_xmlHttp = new ActiveXObject('Msxml2.XMLHTTP');
        }
        catch (err2)
        {
            try
            {
                g_xmlHttp = new ActiveXObject('Microsoft.XMLHTTP');
            }
            catch (eerr3)
            {
                //AJAX not supported, use CPU time.
                return new Date();
            }
        }
    }

    g_xmlHttp.open('HEAD', window.location.href.toString(),false);
    g_xmlHttp.setRequestHeader("Content-Type", "text/html");
    g_xmlHttp.send('');
    return new Date(g_xmlHttp.getResponseHeader("Date"));
}


// Stored data is in this format [value, type, name]
// EX: let sd_seenTutorial = [false, SDTypes.BOOL, "seenTutorial"];

export function getStoredDataValue(sd)
{
    let value = getStoredData(sd[1], sd[2]);
    if (value != undefined)
    {
        sd[0] = value;
    }
}

export function setStoredDataValue(sd)
{
    setStoredData(sd[1], sd[2], sd[0]);
}

function getStoredData(sdType, sdName)
{
    var value = localStorage.getItem(sdName);
    if (value == null)
    {
        return undefined;
    }

    switch(sdType) {
        case SDTypes.BOOL: return parseInt(value) != 0;
        case SDTypes.INT: return parseInt(value);
        case SDTypes.STRING: return value;
    }

    return undefined;
}

function setStoredData(sdType, sdName, value)
{
    switch(sdType) {
        case SDTypes.BOOL: localStorage.setItem(sdName, value == true ? "1" : "0"); break;
        case SDTypes.INT: localStorage.setItem(sdName, value.toString()); break;
        case SDTypes.STRING: localStorage.setItem(sdName, value); break;
    }

    return undefined;
}

export function isElementScrolledToBottom(element)
{
    return element.scrollTop + element.clientHeight >= element.scrollHeight - 1;
}

export function getElementPositionTop(element)
{
    return parseInt(element.getBoundingClientRect().top + window.scrollY);
}

export function getElementPositionBottom(element)
{
    return parseInt(element.getBoundingClientRect().bottom + window.scrollY);
}

export function getElementPositionCenterY(element)
{
    return parseInt((getElementPositionTop(element) + getElementPositionBottom(element)) / 2);
}

export function getElementPositionLeft(element)
{
    return parseInt(element.getBoundingClientRect().left + window.scrollX);
}

export function getElementPositionRight(element)
{
    return parseInt(element.getBoundingClientRect().right + window.scrollX);
}

export function getElementPositionCenterX(element)
{
    return parseInt((getElementPositionLeft(element) + getElementPositionRight(element)) / 2);
}

export function removeAllChildren(element)
{
    while (element.firstChild)
    {
        element.removeChild(element.lastChild);
    }
}

let g_preloadedImages = [];
export function preloadImages()
{
    for (let i = 0; i < arguments.length; i++)
    {
        g_preloadedImages.push(new Image());
        g_preloadedImages[g_preloadedImages.length - 1].src = arguments[i];
    }
}

// Number encoding/decoding functions for storage
export function encodeNumber(num, baseChar) {
    let result = "";
    let baseCode = baseChar.charCodeAt(0);
    
    if (num === 0) {
        return String.fromCharCode(baseCode);
    }
    
    while (num > 0) {
        result = String.fromCharCode(baseCode + (num % 10)) + result;
        num = Math.floor(num / 10);
    }
    
    return result;
}

export function decodeNumber(data, index, baseChar) {
    let baseCode = baseChar.charCodeAt(0);
    let num = 0;
    let newIndex = index;
    
    while (newIndex < data.length) {
        let charCode = data.charCodeAt(newIndex);
        let digit = charCode - baseCode;
        
        if (digit < 0 || digit > 9) {
            break;
        }
        
        num = num * 10 + digit;
        newIndex++;
    }
    
    return { value: num, newIndex: newIndex };
}
