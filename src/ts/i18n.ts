/*
W3C def language codes is :
    language-code = primary-code ( "-" subcode )
        primary-code    ISO 639-1   ( the names of language with 2 code )
        subcode         ISO 3166    ( the names of countries )

NOTE: use lower
Use this as shown below..... */

// remove later on
const DEBUG = true;

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
    'skipped-chapter': [{ symbol: '%c', name: 'Chapter name', example: 'Opening' }],
    skip: [],
    'skip-chapter': [{ symbol: '%c', name: 'Chapter name', example: 'Opening' }],
    cancel: [],
};

// Standard english translations
// the good here is, that TS checks the json if all the right keys are set :)
const GlobalStandard: DPlayerTranslationObject = await import('../translations/en.json');

// add translation first to the folder and then here!
const GlobalTranTxt: DPlayerAvailableTranslationObject = {
    en: GlobalStandard,
    'zh-cn': await import('../translations/zh-cn.json'),
    'zh-tw': await import('../translations/zh-tw.json'),
    'ko-kr': await import('../translations/ko-kr.json'),
    de: await import('../translations/de.json'),
};

class i18n {
    lang: DPlayerSupportedLanguage | null;
    fallbackLang: DPlayerSupportedLanguage | null;
    model: DPlayerLanguageModel;
    translations: DPlayerAvailableTranslationObject;
    standard: DPlayerTranslationObject;

    constructor(lang: DPlayerSupportedLanguage | string, checkResultingLanguage = false) {
        if (Object.keys(GlobalTranTxt).includes(lang)) {
            this.lang = lang as DPlayerSupportedLanguage;
        } else {
            this.lang = null;
        }
        // in case someone says en-us, and en is present!
        const fallBack: string = lang.includes('-') ? lang.split('-')[0] : lang;
        if (Object.keys(GlobalTranTxt).includes(fallBack)) {
            this.fallbackLang = fallBack as DPlayerSupportedLanguage;
        } else {
            this.fallbackLang = null;
        }

        if (this.lang !== null && checkResultingLanguage === true) {
            this.checkPresentTranslations(this.lang, DEBUG);
        } else if (this.fallbackLang !== null && checkResultingLanguage === true) {
            this.checkPresentTranslations(this.fallbackLang, DEBUG);
        }

        this.model = GLOB_MODEL;
        this.translations = GlobalTranTxt;
        this.standard = GlobalStandard;
    }

    translate(key?: DPlayerTranslateKey | string, replacement?: DPlayerReplacementTypes | DPlayerReplacementTypes[]): DPlayerTranslatedString | null {
        if (typeof key === 'undefined') {
            console.error('key for translation not set!');
            return null;
        }
        if (typeof key !== 'string') {
            console.error(`key for translation is not a string, but a '${typeof key}'!`);
            return null;
        }
        // TODOOOOOOOOOOOo(#28):  check if DPlayerTranslateKey !!!!!!!
        const finalKey: DPlayerTranslateKey = key.toLowerCase() as DPlayerTranslateKey;
        let result: DPlayerTranslatedString;
        if (this.lang !== null) {
            result = this.translations[this.lang][finalKey];
        } else if (this.fallbackLang !== null) {
            result = this.translations[this.fallbackLang][finalKey];
        } else {
            result = this.standard[finalKey];
        }
        if (this.model[finalKey].length > 0 && typeof replacement !== 'undefined') {
            if (!Array.isArray(replacement)) {
                replacement = [replacement];
            }
            for (let i = 0; i < this.model[finalKey].length; i++) {
                result = result.replace(this.model[finalKey][i].symbol, replacement[i].toString());
            }
        } else if (this.model[key as DPlayerTranslateKey].length > 0 && typeof replacement === 'undefined') {
            console.error('[ERROR] Translate: A Replacement value is missing, you have to provide one!');
        }
        return result;
    }

    checkPresentTranslations(singleLanguage?: DPlayerSupportedLanguage, debug?: boolean): void {
        if (typeof singleLanguage === 'undefined' || debug === true) {
            (Object.keys(this.translations) as DPlayerSupportedLanguage[]).forEach((language: DPlayerSupportedLanguage) => {
                this.checkSingleLanguage(language);
            });
        } else {
            this.checkSingleLanguage(singleLanguage);
        }
    }

    checkSingleLanguage(language: DPlayerSupportedLanguage): void {
        const translation = this.translations[language];
        (Object.entries(this.model) as [DPlayerTranslateKey, DPlayerLanguageModelDescription[]][]).forEach(([key, value]) => {
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
    | 'skipped-chapter'
    | 'skip'
    | 'skip-chapter'
    | 'cancel';

export type DPlayerTranslatedString = string;

export type DPlayerReplacementTypes = string | number; // TODO(#29):  check on key by looking it uup in the model!!!!

export type DPlayerLanguageModel = {
    [index in DPlayerTranslateKey]: DPlayerLanguageModelDescription[];
};

export interface DPlayerLanguageModelDescription {
    symbol: string;
    name: string;
    example: string; // TODO(#30):  get from symbol or name!!!
}

export type DPlayerTranslationObject = {
    [index in DPlayerTranslateKey]: string;
};

export type DPlayerAvailableTranslationObject = {
    [language in DPlayerSupportedLanguage]: DPlayerTranslationObject;
};

export type DPLayerTranslateFunction = (key?: DPlayerTranslateKey, replacement?: DPlayerReplacementTypes) => null | DPlayerTranslatedString;
