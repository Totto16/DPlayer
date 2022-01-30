/*
W3C def language codes is :
    language-code = primary-code ( "-" subcode )
        primary-code    ISO 639-1   ( the names of language with 2 code )
        subcode         ISO 3166    ( the names of countries )

NOTE: use lower
Use this as shown below..... */

// abstract model for recognizing if valid translations are present
const GLOB_MODEL: DPlayerLanguageModel = {
    'danmaku-loading': [],
    top: [],
    bottom: [],
    rolling: [],
    'input-danmaku-enter': [],
    'about-author': [],
    'dplayer-feedback': [],
    'about-dplayer': [],
    'hotkey-info': [],
    loop: [],
    'speed-raw': [],
    speed: [{ symbol: '%s', name: 'Speed', example: '125%' }],
    'opacity-danmaku': [],
    normal: [],
    'please-input-danmaku': [],
    'set-danmaku-color': [],
    'set-danmaku-type': [],
    'show-danmaku': [],
    'video-failed': [],
    'danmaku-failed': [],
    'danmaku-send-failed': [],
    'switching-quality': [{ symbol: '%q', name: 'Quality', example: '720p' }],
    'switched-quality': [{ symbol: '%q', name: 'Quality', example: '720p' }],
    ff: [{ symbol: '%t', name: 'Time', example: '5 %m 10 %s' }],
    rew: [{ symbol: '%t', name: 'Time', example: '5 %m 10 %s' }],
    seconds: [{ symbol: '%s', name: 'Seconds', example: '15' }],
    minutes: [{ symbol: '%m', name: 'Minutes', example: '3' }],
    hours: [{ symbol: '%h', name: 'Hours', example: '4' }],
    'unlimited-danmaku': [],
    'send-danmaku': [],
    setting: [],
    fullscreen: [],
    'web-fullscreen': [],
    send: [],
    'saved-screenshot': [{ symbol: '%n', name: 'Screenshot name', example: 'Awesome_Video_24_04.png' }],
    'screenshot-raw': [],
    airplay: [],
    chromecast: [],
    'show-subs': [],
    'hide-subs': [],
    volume: [],
    live: [],
    'video-info': [],
    on: [],
    off: [],
    toggleplayer: [],
    left: [],
    right: [],
    up: [],
    down: [],
    cancelbothfullscreen: [],
    togglefullscreen: [],
    togglewebfullscreen: [],
    mute: [],
    screenshot: [],
    nextchapter: [],
    previouschapter: [],
    changeloop: [],
    speedup: [],
    speeddown: [],
    speednormal: [],
    'hotkey-disabled': [],
    skipped_chapter: [{ symbol: '%c', name: 'Chapter name', example: 'Opening' }],
    skip: [],
    skip_chapter: [{ symbol: '%c', name: 'Chapter name', example: 'Opening' }],
    cancel: [],
};

// Standard english translations
const GLOB_standard: DPlayerTranslationObject = require('../translations/en.json') as DPlayerTranslationObject; // TODO(#27):  read from json in tsscript
// add translation first to the folder and then here!
const GLOB_tranTxt: DPlayerAvaiableTranslationObject = {
    en: standard,
    'zh-cn': require('../translations/zh-cn.json'),
    'zh-tw': require('../translations/zh-tw.json'),
    'ko-kr': require('../translations/ko-kr.json'),
    de: require('../translations/de.json'),
};

class i18n {
    lang: DPlayerSupportedLanguage;
    fallbackLang: DPlayerLanguage;
    model: DPlayerLanguageModel;

    constructor(lang: DPlayerSupportedLanguage) {
        this.lang = lang;
        // in case someone says en-us, and en is present!
        this.fallbackLang = this.lang.includes('-') ? this.lang.split('-')[0] : this.lang;

        this.model = GLOB_MODEL;
    }

    translate(key?: DPlayerTranslateKey, replacement?: DPlayerReplacementTypes): null | DPlayerTranslatedString {
        if (typeof key === 'undefined') {
            console.error('key for translation not set!');
            return null;
        }
        if (typeof key !== 'string') {
            console.error(`key for translation is not a string, but a '${typeof key}'!`);
            return null;
        }
        // TODO(#28):  check if DPlayerTranslateKey
        const finalKey: DPlayerTranslateKey = key.toLowerCase() as DPlayerTranslateKey;
        let result = null;
        if (this.tranTxt[this.lang] && this.tranTxt[this.lang][finalKey]) {
            result = this.tranTxt[this.lang][finalKey];
        } else if (this.tranTxt[this.fallbackLang] && this.tranTxt[this.fallbackLang][finalKey]) {
            result = this.tranTxt[this.fallbackLang][finalKey];
        } else {
            result = this.standard[finalKey];
        }
        if (this.model[key].length > 0 && replacement) {
            result = result.replace(this.model[finalKey][0].symbol, replacement);
        }
        return result;
    }

    checkPresentTranslations(singleLanguage?: DPlayerSupportedLanguage, debug: boolean) {
        if (typeof singleLanguage === 'undefined' || debug) {
            Object.keys(this.tranTxt).forEach((language) => {
                checkSingleLanguage(language);
            });
        } else {
            checkSingleLanguage(singleLanguage);
        }
    }

    checkSingleLanguage(language) {
        const translation = tranTxt[language];
        Object.entries(model).forEach(([key, value]) => {
            if (!translation[key]) {
                console.info(`Translation for ${language} has no key ${key}!`);
            } else if (value.length > 0) {
                value.forEach(({ symbol, name, example }) => {
                    if (!translation[key].includes(symbol)) {
                        console.info(`Translation for ${language} misses the symbol ${symbol} in ${key}, it represents ${name}, example value ${example}!`);
                    }
                });
            }
        });
    }
}

export default i18n;

export type DPlayerSupportedLanguage = 'de' | 'en' | 'ko-kr' | 'zh-cn' | 'zh-tw';

export type DPlayerLanguage = string;

export type DPlayerTranslateKey =
    | 'danmaku-loading'
    | 'top'
    | 'bottom'
    | 'rolling'
    | 'input-danmaku-enter'
    | 'about-author'
    | 'dplayer-feedback'
    | 'about-dplayer'
    | 'hotkey-info'
    | 'loop'
    | 'speed-raw'
    | 'speed'
    | 'opacity-danmaku'
    | 'normal'
    | 'please-input-danmaku'
    | 'set-danmaku-color'
    | 'set-danmaku-type'
    | 'show-danmaku'
    | 'video-failed'
    | 'danmaku-failed'
    | 'danmaku-send-failed'
    | 'switching-quality'
    | 'switched-quality'
    | 'ff'
    | 'rew'
    | 'seconds'
    | 'minutes'
    | 'hours'
    | 'unlimited-danmaku'
    | 'send-danmaku'
    | 'setting'
    | 'fullscreen'
    | 'web-fullscreen'
    | 'send'
    | 'saved-screenshot'
    | 'screenshot-raw'
    | 'airplay'
    | 'chromecast'
    | 'show-subs'
    | 'hide-subs'
    | 'volume'
    | 'live'
    | 'video-info'
    | 'on'
    | 'off'
    | 'toggleplayer'
    | 'left'
    | 'right'
    | 'up'
    | 'down'
    | 'cancelbothfullscreen'
    | 'togglefullscreen'
    | 'togglewebfullscreen'
    | 'mute'
    | 'screenshot'
    | 'nextchapter'
    | 'previouschapter'
    | 'changeloop'
    | 'speedup'
    | 'speeddown'
    | 'speednormal'
    | 'hotkey-disabled'
    | 'skipped_chapter'
    | 'skip'
    | 'skip_chapter'
    | 'cancel';

export type DPlayerTranslatedString = string;

export type DPlayerReplacementTypes = string | number; // TODO(#29):  check on key by looking it uup in the model!!!!

export type DPlayerLanguageModel = {
    [index in DPlayerTranslateKey]?: DPlayerLanguageModelDescription[];
};

export interface DPlayerLanguageModelDescription {
    symbol: string;
    name: string;
    example: string; // TODO:  get from symbol or name!!!
}

export type DPlayerTranslationObject = {
    [index in DPlayerTranslateKey]?: string[];
};

export type DPlayerAvaiableTranslationObject = {
    [language in DPlayerSupportedLanguage]?: DPlayerTranslationObject;
};

export type DPLayerTranslateFunction = (key?: DPlayerTranslateKey, replacement?: DPlayerReplacementTypes) => null | DPlayerTranslatedString;

// Quick and dirty export function

/* let fs = require("fs");
(()=>{
    Object.keys(tranTxt).forEach(a=>{
        fs.writeFileSync(`..\\translations\\${a}.json`, JSON.stringify(tranTxt[a]));
    })
})() */
