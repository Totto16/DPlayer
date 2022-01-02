/*
W3C def language codes is :
    language-code = primary-code ( "-" subcode )
        primary-code    ISO 639-1   ( the names of language with 2 code )
        subcode         ISO 3166    ( the names of countries )

NOTE: use lower
Use this as shown below..... */

function i18n(lang) {
    this.lang = lang;
    // in case someone says en-us, and en is present!
    this.fallbackLang = this.lang.includes('-') ? this.lang.split('-')[0] : this.lang;
    this.translate = (key, replacement) => {
        if (!key) {
            console.error('key for translation not set!');
            return;
        }
        if (typeof key !== 'string') {
            console.error(`key for translation is not a string, but a '${typeof key}'!`);
            return;
        }
        key = key.toLowerCase();
        let result = null;
        if (tranTxt[this.lang] && tranTxt[this.lang][key]) {
            result = tranTxt[this.lang][key];
        } else if (tranTxt[this.fallbackLang] && tranTxt[this.fallbackLang][key]) {
            result = tranTxt[this.fallbackLang][key];
        } else {
            result = standard[key];
        }
        if (model[key].length > 0 && replacement) {
            result = result.replace(model[key][0].symbol, replacement);
        }
        return result;
    };
    this.checkPresentTranslations = checkPresentTranslations;
}

// abstract model for recognizing if valid translations are present
const model = {
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
const standard = require('../translations/en.json');
// add translation first to the folder and then here!
const tranTxt = {
    en: standard,
    'zh-cn': require('../translations/zh-cn.json'),
    'zh-tw': require('../translations/zh-tw.json'),
    'ko-kr': require('../translations/ko-kr.json'),
    de: require('../translations/de.json'),
};

function checkPresentTranslations(singleLanguage, debug) {
    if (!singleLanguage || debug) {
        Object.keys(tranTxt).forEach((language) => {
            checkSingleLanguage(language);
        });
    } else {
        checkSingleLanguage(singleLanguage);
    }
}

function checkSingleLanguage(language) {
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

export default i18n;

// Quick and dirty export function

/* let fs = require("fs");
(()=>{
    Object.keys(tranTxt).forEach(a=>{
        fs.writeFileSync(`..\\translations\\${a}.json`, JSON.stringify(tranTxt[a]));
    })
})() */
