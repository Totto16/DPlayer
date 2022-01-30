import axios from 'axios';
import apiBackend, { DPlayerAPI, DPlayerBackendResponse } from './api';
import { Highlight } from './controller';
import { DPlayerOptions } from './options';

const isMobile = /mobile/i.test(window.navigator.userAgent);
const isChrome = /chrome/i.test(window.navigator.userAgent);
const isSafari = /safari/i.test(window.navigator.userAgent);
const isFirefox = /firefox/i.test(window.navigator.userAgent);

const utils: DPlayerUtils = {
    apiBackend,

    secondToTime: (second: number, delimiter = ':'): string => {
        second = second || 0;
        if (second === 0 || second === Infinity || second.toString() === 'NaN') {
            return `00${delimiter}00`;
        }
        const add0 = (num: number) => (num < 10 ? `0${num.toString()}` : num.toString());
        const hour = Math.floor(second / 3600);
        const min = Math.floor((second - hour * 3600) / 60);
        const sec = Math.floor(second - hour * 3600 - min * 60);
        return (hour > 0 ? [hour, min, sec] : [min, sec]).map(add0).join(delimiter);
    },

    getElementViewLeft: (element: HTMLElement): number => {
        let actualLeft = element.offsetLeft;
        let current = element.offsetParent;
        const elementScrollLeft = document.body.scrollLeft + document.documentElement.scrollLeft;
        if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement) {
            while (current !== null) {
                actualLeft += current.offsetLeft;
                current = current.offsetParent;
            }
        } else {
            while (current !== null && current !== element) {
                actualLeft += current.offsetLeft;
                current = current.offsetParent;
            }
        }
        return actualLeft - elementScrollLeft;
    },

    /**
    * optimize control play progress

    * optimize get element's view position,for float dialog video player
    * getBoundingClientRect 在 IE8 及以下返回的值缺失 width、height 值
    * getBoundingClientRect 在 Firefox 11 及以下返回的值会把 transform 的值也包含进去
    * getBoundingClientRect 在 Opera 10.5 及以下返回的值缺失 width、height 值
    */
    getBoundingClientRectViewLeft(element: HTMLElement) {
        const scrollTop = window.scrollY || window.pageYOffset || document.body.scrollTop + ((document.documentElement && document.documentElement.scrollTop) || 0);

        if (element.getBoundingClientRect) {
            if (typeof this.getBoundingClientRectViewLeft.offset !== 'number') {
                let temp = document.createElement('div');
                temp.style.cssText = 'position:absolute;top:0;left:0;';
                document.body.appendChild(temp);
                this.getBoundingClientRectViewLeft.offset = -temp.getBoundingClientRect().top - scrollTop;
                document.body.removeChild(temp);
                temp = null;
            }
            const rect = element.getBoundingClientRect();
            const offset = this.getBoundingClientRectViewLeft.offset;

            return rect.left + offset;
        } else {
            // not support getBoundingClientRect
            return this.getElementViewLeft(element);
        }
    },

    getScrollPosition(): DPlayerUtilsScrollPosition {
        return {
            left: window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0,
            top: window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0,
        };
    },

    setScrollPosition({ left = 0, top = 0 }: DPlayerUtilsScrollPosition): void {
        if (this.isFirefox) {
            document.documentElement.scrollLeft = left;
            document.documentElement.scrollTop = top;
        } else {
            window.scrollTo(left, top);
        }
    },

    isMobile,

    isFirefox,

    isChrome,

    isSafari,

    storage: {
        set: (key: string, value: unknown): void => {
            if (typeof value === 'object') {
                localStorage.setItem(key, JSON.stringify(value));
            } else if (typeof value === 'string') {
                localStorage.setItem(key, value);
            } else if (typeof value.toString === 'function') {
                localStorage.setItem(key, value.toString());
            } else {
                console.warn('In storage.set: unknwon Type provided.');
                return;
            }
        },

        get: (key: string) => localStorage.getItem(key),
    },

    encodeValueAsObject(val: any): DPlayerEncodedValue {
        return { value: val.toString(), type: typeof val };
    },

    decodeValueFromObject(obj) {
        const { value, type } = obj;
        if (type === 'number') {
            return parseFloat(value);
        } else if (type === 'string') {
            return value;
        } else if (type === 'object') {
            return JSON.parse(value);
        } else {
            return null;
        }
    },

    supportsAirplay: (): boolean => isSafari && !isChrome && !isFirefox,

    supportsChromeCast: (): boolean => isChrome && !isSafari && !isFirefox,

    nameMap: {
        dragStart: isMobile ? 'touchstart' : 'mousedown',
        dragMove: isMobile ? 'touchmove' : 'mousemove',
        dragEnd: isMobile ? 'touchend' : 'mouseup',
    },

    color2Number: (color: string): number => {
        if (color[0] === '#') {
            color = color.substr(1);
        }
        if (color.length === 3) {
            color = `${color[0]}${color[0]}${color[1]}${color[1]}${color[2]}${color[2]}`;
        }
        return (parseInt(color, 16) + 0x000000) & 0xffffff;
    },

    number2Color: (number: number): string => `#${`00000${number.toString(16)}`.slice(-6)}`,

    number2Type: (number: number): DPlayerUtilsTypes => {
        switch (number) {
            case 0:
                return 'right';
            case 1:
                return 'top';
            case 2:
                return 'bottom';
            default:
                return 'right';
        }
    },
    // parsing according to web standards (https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API)
    parseVtt(vtt_url: string, callback: DPlayerParseVttCallback, startOrEnd = 0, options: DPlayerOptions | null = null): string {
        if (vtt_url === 'API' && API_URL !== null) {
            const video_url = new URL(options.video.url);
            // TODO(#64):  this has to be customizable, to match it between naming conventions and file names!!!
            const parameter =
                options.video.type === 'hls'
                    ? video_url.pathname
                          .substring(0, video_url.pathname.lastIndexOf('/'))
                          .split('/')
                          .filter((str) => str !== '')
                          .join('-')
                    : video_url.pathname.substring(video_url.pathname.lastIndexOf('/') + 1);
            // TODO(#65):  here are some specs!
            // TODO:  version, 1 at the moment, get either reference or nothing/everything else means raw data!, type, vtt, or chapter, or thumbnails or etc TODO:
            api.backend({
                url: options.API_URL,
                query: {
                    version: '1',
                    get: 'reference',
                    type: 'vtt',
                    parameter,
                    mode: 'regex',
                },
            })
                .then((data: DPlayerBackendResponse | null) => {
                    if (data !== null) {
                        this.parseVtt(data, callback, startOrEnd);
                    } else {
                        // we don't need to print an error, the server reported, that there are no vtts available, nothing severe happened
                    }
                })
                .catch((error: Error) => {
                    console.error(`Error in API request for the Vtt Url!`, error);
                    return null;
                });
            return 'processing API request';
        } else if (vtt_url === 'API' && API_URL === null) {
            console.warn(`Tried to pass 'API' as vtt_url, but didn't specify 'API_URL'!`);
            return;
        }
        const marker: Highlight[] = [];
        axios
            .get(vtt_url)
            .then((response) => {
                const status_ok = [200, 301, 302];
                if (!status_ok.includes(response.status)) {
                    throw new Error('Incorrect Status');
                }
                if (response.headers['content-type'] !== 'text/vtt') {
                    throw new Error('Incorrect content-type, should be text/vtt');
                }
                if (!response.data) {
                    throw new Error('Empty Web-Vtt');
                }
                const data = response.data
                    .replaceAll('\r', '')
                    .split('\n')
                    .filter((a) => a.length > 0);
                data.forEach((text, i) => {
                    if (text.includes('-->')) {
                        const mark = {};
                        mark.text = data.length > i + 1 ? data[i + 1] : 'Error';
                        const endTime = text.split('-->')[startOrEnd].trim();
                        const multiplier = [1, 60, 60 * 60, 60 * 60 * 24]; // second, minute, hour, day
                        let index = 0;
                        const time = endTime
                            .split(':')
                            .reverse()
                            .reduce((sum, act) => {
                                let num = isNaN(parseFloat(act)) ? 0 : parseFloat(act);
                                num = num * multiplier[index];
                                index++;
                                return num + sum;
                            }, 0);
                        mark.time = time;
                        marker.push(mark);
                    }
                });
            })
            .catch((error) => {
                console.error(`Couldn't parse Vtt Url! Fetching Error!`, error);
                return null;
            })
            .finally(() => {
                callback(marker);
            });
        return 'processing';
    },
};

export default utils;

export interface DPlayerUtils {
    apiBackend: DPlayerAPI;
    secondToTime: (second: number, delimiter: string) => string;
    getElementViewLeft: (element: HTMLElement) => number;
    getScrollPosition: () => DPlayerUtilsScrollPosition;
    setScrollPosition: (position: DPlayerUtilsScrollPosition) => void;
    isMobile: boolean;
    isFirefox: boolean;
    isChrome: boolean;
    isSafari: boolean;
    supportsAirplay: () => boolean;
    supportsChromeCast: () => boolean;
    color2Number: (color: string) => number;
    number2Color: (number: number) => string;
    number2Type: (number: number) => DPlayerUtilsTypes;
    parseVtt: (vtt_url: string, callback: DPlayerParseVttCallback, startOrEnd: number, options: DPlayerOptions | null) => string;
}

export type DPlayerParseVttCallback = (marker: Highlight[]) => void;

export type DPlayerUtilsTypes = 'right' | 'top' | 'bottom';

export interface DPlayerUtilsScrollPosition {
    left: number;
    top: number;
}

export type TypesOfValues = 'undefined' | 'number' | 'string' | 'boolean' | 'bigint' | 'symbol' | 'object' | 'function';

export type DPlayerEncodedValue = {
    value: string;
    type: TypesOfValues;
};
