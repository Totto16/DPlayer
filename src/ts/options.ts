import { StringIndexableObject } from '.';
import { DPLAYER_VERSION } from './global';
import { DPlayerSupportedLanguage } from './i18n.js';
import DPlayer from './player';
import { DPlayerSubTitleOptionsWeak } from './subtitle.js';
import utils from './utils';

function OptionsError(errorString: string): Error {
    return new Error(`[ERROR] in Parsing Options: ${errorString}`);
}

/**
 * @throws when an safe is on
 */
function reportOptionsError(message: string, safe: boolean): void {
    if (safe) {
        throw OptionsError(message);
    } else {
        console.warn(`[WARN] in Parsing Options: ${message}`);
    }
}

function isNumberOrParsable(number: unknown): boolean {
    return typeof number === 'number' || (typeof number === 'string' && !isNaN(parseFloat(number)));
}

// TODO: is there a better way to get this list of available typeof results?
function is(type: 'string' | 'number' | 'bigint' | 'boolean' | 'symbol' | 'undefined' | 'object' | 'function'): (obj: unknown) => boolean {
    return (object: unknown): boolean => typeof object === type;
}

function hasTheseKeys<T extends NormalObject>(obj: T, keys: string[], hasToBeThere: boolean[] = [...obj].map(() => false), Constraints: ((arg: unknown, key: string) => boolean)[] = [...obj].map(() => () => true)): boolean {
    const ObjKeys = Object.keys(obj);

    return (
        Object.keys(obj).reduce((acc: boolean, elem: string) => keys.includes(elem) && acc, true) &&
        keys.reduce((acc: boolean, elem: string, index: number) => (hasToBeThere[index] ? ObjKeys.includes(elem) : true) && acc, true) &&
        keys.reduce((acc: boolean, elem: string, index: number) => Constraints[index](obj[elem], elem) && acc, true)
    );
}

/**
 * @throws when an error in parsing occurs
 */
function parseOptions(InputOptions: DPlayerOptions, defaultOptions: DPlayerDefaultOptions, safe = true): DplayerParsedOptions {
    let container;
    if (InputOptions.container instanceof HTMLElement) {
        container = InputOptions.container;
    } else {
        if (typeof defaultOptions.container === 'undefined' || defaultOptions.container === null) {
            throw OptionsError(`'options.container' is not a valid element or no '.dplayer' element found!`);
        }
        container = defaultOptions.container;
    }

    // ----------------- NEXT OPTION -----------------------------------
    let live;
    if (typeof InputOptions.live === 'boolean') {
        live = InputOptions.live;
    } else if (typeof InputOptions.live === 'undefined') {
        live = defaultOptions.live;
    } else {
        reportOptionsError(`'options.live' is not a boolean!`, safe);
        live = Boolean(InputOptions.live); // same as !! in js
    }

    // ----------------- NEXT OPTION -----------------------------------
    let autoplay;
    if (typeof InputOptions.autoplay === 'boolean') {
        autoplay = InputOptions.autoplay;
    } else if (typeof InputOptions.autoplay === 'undefined') {
        autoplay = defaultOptions.autoplay;
    } else {
        reportOptionsError(`'options.autoplay' is not a boolean!`, safe);
        autoplay = Boolean(InputOptions.autoplay);
    }

    // ----------------- NEXT OPTIONS -----------------------------------
    let theme;
    let themeName;
    if (typeof InputOptions.theme === 'string') {
        theme = InputOptions.theme;
        if (typeof InputOptions.themeName === 'string') {
            console.warn("[WARN] Options: The 'theme' and 'themeName' are set, only one is required, 'themeName' is ignored!");
        }
        themeName = 'standard';
    } else if (typeof InputOptions.theme === 'undefined') {
        if (typeof InputOptions.themeName === 'string') {
            themeName = InputOptions.themeName;
        } else {
            reportOptionsError(`'options.themeName' is not a string!`, safe);
            themeName = 'standard';
        }
    } else {
        reportOptionsError(`'options.theme' is not a string!`, safe);
        themeName = 'standard';
    }

    // ----------------- NEXT OPTION -----------------------------------
    let disableDarkMode;
    if (typeof InputOptions.disableDarkMode === 'boolean') {
        disableDarkMode = InputOptions.disableDarkMode;
    } else if (typeof InputOptions.disableDarkMode === 'undefined') {
        disableDarkMode = defaultOptions.disableDarkMode;
    } else {
        reportOptionsError(`'options.disableDarkMode' is not a boolean!`, safe);
        disableDarkMode = Boolean(InputOptions.disableDarkMode);
    }

    // ----------------- NEXT OPTION -----------------------------------
    let loop;
    if (typeof InputOptions.loop === 'boolean') {
        loop = InputOptions.loop;
    } else if (typeof InputOptions.loop === 'undefined') {
        loop = defaultOptions.loop;
    } else {
        reportOptionsError(`'options.loop' is not a boolean!`, safe);
        loop = Boolean(InputOptions.loop);
    }

    // ----------------- NEXT OPTION -----------------------------------
    let lang;
    if (typeof InputOptions.lang === 'string') {
        lang = InputOptions.lang;
    } else if (typeof InputOptions.lang === 'undefined') {
        lang = defaultOptions.lang;
    } else {
        reportOptionsError(`'options.lang' is not a string!`, safe);
        lang = defaultOptions.lang;
    }

    // ----------------- NEXT OPTION -----------------------------------
    let screenshot;
    if (typeof InputOptions.screenshot === 'boolean') {
        screenshot = InputOptions.screenshot;
    } else if (typeof InputOptions.screenshot === 'undefined') {
        screenshot = defaultOptions.screenshot;
    } else {
        reportOptionsError(`'options.screenshot' is not a boolean!`, safe);
        screenshot = Boolean(InputOptions.screenshot);
    }

    // ----------------- NEXT OPTION -----------------------------------
    let airplay: boolean | 'vendor';
    if (typeof InputOptions.airplay === 'boolean' || InputOptions.airplay === 'vendor') {
        airplay = InputOptions.airplay;
    } else if (typeof InputOptions.airplay === 'undefined') {
        airplay = defaultOptions.airplay;
    } else {
        reportOptionsError(`'options.airplay' is not a boolean or 'vendor'!`, safe);
        airplay = defaultOptions.airplay;
    }

    // ----------------- NEXT OPTION -----------------------------------
    let chromecast: boolean | 'vendor';
    if (typeof InputOptions.chromecast === 'boolean' || InputOptions.chromecast === 'vendor') {
        chromecast = InputOptions.chromecast;
    } else if (typeof InputOptions.chromecast === 'undefined') {
        chromecast = defaultOptions.chromecast;
    } else {
        reportOptionsError(`'options.chromecast' is not a boolean or 'vendor'!`, safe);
        chromecast = defaultOptions.chromecast;
    }

    // ----------------- NEXT OPTION -----------------------------------
    let hotkey;
    if (typeof InputOptions.hotkey === 'boolean') {
        hotkey = InputOptions.hotkey;
    } else if (typeof InputOptions.hotkey === 'undefined') {
        hotkey = defaultOptions.hotkey;
    } else {
        reportOptionsError(`'options.hotkey' is not a boolean!`, safe);
        hotkey = Boolean(InputOptions.hotkey);
    }

    // ----------------- NEXT OPTION -----------------------------------
    let advancedHotkeys;
    if (typeof InputOptions.advancedHotkeys === 'boolean') {
        advancedHotkeys = InputOptions.advancedHotkeys;
    } else if (typeof InputOptions.advancedHotkeys === 'undefined') {
        advancedHotkeys = defaultOptions.advancedHotkeys;
    } else {
        reportOptionsError(`'options.advancedHotkeys' is not a boolean!`, safe);
        advancedHotkeys = Boolean(InputOptions.advancedHotkeys);
    }

    // ----------------- NEXT OPTION -----------------------------------
    let preload: DPlayerPreloadOption;
    if (typeof InputOptions.preload === 'string' && (InputOptions.preload === 'none' || InputOptions.preload === 'metadata' || InputOptions.preload === 'auto')) {
        preload = InputOptions.preload;
    } else if (typeof InputOptions.preload === 'undefined') {
        preload = defaultOptions.preload;
    } else {
        reportOptionsError(`'options.preload' is not one of the possible string values!`, safe);
        preload = defaultOptions.preload;
    }

    // ----------------- NEXT OPTION -----------------------------------
    let logo; // can be undefined
    if (typeof InputOptions.logo === 'string') {
        logo = InputOptions.logo;
        // TODO: maybe check if the given URL is valid?
    } else if (typeof InputOptions.logo !== 'undefined') {
        reportOptionsError(`'options.logo' is not a string!`, safe);
    }

    // ----------------- NEXT OPTION -----------------------------------
    let volume;
    if (isNumberOrParsable(InputOptions.volume)) {
        volume = typeof InputOptions.volume === 'number' ? InputOptions.volume : parseFloat(InputOptions.volume as string);
    } else if (typeof InputOptions.volume === 'undefined') {
        volume = defaultOptions.volume;
    } else {
        reportOptionsError(`'options.volume' is not a number, or a string that can be parsed as number!`, safe);
        volume = defaultOptions.volume;
    }

    // ----------------- NEXT OPTION -----------------------------------
    let playbackSpeed: DPlayerPlaybackSpeedArray;
    if (Array.isArray(InputOptions.playbackSpeed) && InputOptions.playbackSpeed.length === 6 && InputOptions.playbackSpeed.reduce((acc: boolean, elem: unknown) => isNumberOrParsable(elem) && acc, true)) {
        playbackSpeed = InputOptions.playbackSpeed.map((elem: string | number) => (typeof elem === 'number' ? elem : parseFloat(elem))) as DPlayerPlaybackSpeedArray;
    } else if (typeof InputOptions.playbackSpeed === 'undefined') {
        playbackSpeed = defaultOptions.playbackSpeed;
    } else {
        reportOptionsError(`'options.playbackSpeed' is not a Array with the right length or the right elements in it (length has to be 6, every element has to be a number or a string that can be parsed as number)!`, safe);
        playbackSpeed = defaultOptions.playbackSpeed;
    }

    // ----------------- NEXT OPTION -----------------------------------
    // SEE TODO at the type def.
    const apiBackend = undefined;

    // ----------------- NEXT OPTION -----------------------------------
    let video: DplayerVideoOptions;
    if (typeof InputOptions.video === 'object' && InputOptions.video !== null && hasTheseKeys<DplayerVideoOptions>(InputOptions.video as DplayerVideoOptions, ['url', 'pic', 'thumbnails', 'type', 'customType', 'quality', 'defaultQuality'])) {
        video = InputOptions.video as DplayerVideoOptions;

        if (typeof video.url !== 'undefined' && typeof video.url !== 'string') {
            throw OptionsError(`'options.video.url' is not a string or undefined!`);
        }

        if (typeof video.pic !== 'undefined' && typeof video.pic !== 'string') {
            throw OptionsError(`'options.video.pic' is not a string or undefined!`);
        }

        if (typeof video.thumbnails !== 'undefined' && typeof video.thumbnails !== 'string') {
            throw OptionsError(`'options.video.thumbnails' is not a string or undefined!`);
        }

        if (typeof video.defaultQuality !== 'undefined' && !isNumberOrParsable(video.defaultQuality)) {
            throw OptionsError(`'options.video.defaultQuality' is not a number or string that can be parsed as number!`);
        }

        if (typeof video.quality !== 'undefined' && Array.isArray(video.quality)) {
            const allEntriesAreConform = video.quality.reduce((acc: boolean, elem: DPlayerVideoQuality) => hasTheseKeys<DPlayerVideoQuality>(elem, ['name', 'url', 'type'], [true, true, false]) && acc, true);
            if (!allEntriesAreConform) {
                throw OptionsError(`'options.video.quality' is not an Array or has not the right elements in the Array!`);
            }
        }

        let availableCustomTypes: string[] = [];

        if (typeof video.customType === 'object') {
            availableCustomTypes = Object.keys(video.customType);
        } else if (typeof video.customType !== 'undefined') {
            throw OptionsError(`'options.video.customType' is not an Object!`);
        }

        if (typeof video.type === 'string') {
            const isPredefinedType = ['auto', 'hls', 'flv', 'dash', 'webtorrent', 'normal'].includes(video.type);
            if (!isPredefinedType) {
                const isCustomType = availableCustomTypes.includes(video.type);
                if (!isCustomType) {
                    throw OptionsError(`'options.video.type' is not an avaiable video type, also no custom One!`);
                }
            }
        } else if (typeof video.type !== 'undefined') {
            throw OptionsError(`'options.video.type' is not a string!`);
        }
    } else if (typeof InputOptions.video === 'undefined') {
        video = defaultOptions.video;
    } else {
        reportOptionsError(`'options.video' is not an Object with the right keys, see the documentation for more information on how to format this!`, safe);
        video = defaultOptions.video;
    }

    // ----------------- NEXT OPTION -----------------------------------
    let highlightSkip;
    if (typeof InputOptions.highlightSkip === 'boolean') {
        highlightSkip = InputOptions.highlightSkip;
    } else if (typeof InputOptions.highlightSkip === 'undefined') {
        highlightSkip = defaultOptions.highlightSkip;
    } else {
        reportOptionsError(`'options.highlightSkip' is not a boolean!`, safe);
        highlightSkip = Boolean(InputOptions.highlightSkip);
    }

    // ----------------- NEXT OPTION -----------------------------------
    let hardSkipHighlights;
    if (typeof InputOptions.hardSkipHighlights === 'boolean') {
        hardSkipHighlights = InputOptions.hardSkipHighlights;
    } else if (typeof InputOptions.hardSkipHighlights === 'undefined') {
        hardSkipHighlights = defaultOptions.hardSkipHighlights;
    } else {
        reportOptionsError(`'options.hardSkipHighlights' is not a boolean!`, safe);
        hardSkipHighlights = Boolean(InputOptions.hardSkipHighlights);
    }

    // ----------------- NEXT OPTION -----------------------------------
    let mutex;
    if (typeof InputOptions.mutex === 'boolean') {
        mutex = InputOptions.mutex;
    } else if (typeof InputOptions.mutex === 'undefined') {
        mutex = defaultOptions.mutex;
    } else {
        reportOptionsError(`'options.mutex' is not a boolean!`, safe);
        mutex = Boolean(InputOptions.mutex);
    }

    // ----------------- NEXT OPTION -----------------------------------
    let balloon;
    if (typeof InputOptions.balloon === 'boolean') {
        balloon = InputOptions.balloon;
    } else if (typeof InputOptions.balloon === 'undefined') {
        balloon = defaultOptions.balloon;
    } else {
        reportOptionsError(`'options.balloon' is not a boolean!`, safe);
        balloon = Boolean(InputOptions.balloon);
    }

    // ----------------- NEXT OPTION -----------------------------------
    let fullScreenPolicy: DPlayerFullScreenOption;
    if (typeof InputOptions.fullScreenPolicy === 'string' || typeof InputOptions.fullScreenPolicy === 'number') {
        let isCorrect = false;
        if (isNumberOrParsable(InputOptions.fullScreenPolicy)) {
            const number = typeof InputOptions.fullScreenPolicy === 'number' ? InputOptions.fullScreenPolicy : parseInt(InputOptions.fullScreenPolicy);
            if (number >= 0 && number <= 2) {
                isCorrect = true;
            }
        }

        if (!isCorrect) {
            if (typeof InputOptions.fullScreenPolicy === 'string') {
                const lowerInput: string = InputOptions.fullScreenPolicy.toLowerCase();
                isCorrect = ['OnlyNormal', 'OnlyWeb', 'Both'].reduce((acc: boolean, elem: string) => elem.toLowerCase() === lowerInput || acc, false);
            }
        }
        if (isCorrect) {
            fullScreenPolicy = InputOptions.fullScreenPolicy as DPlayerFullScreenOption;
        } else {
            reportOptionsError(`'options.fullScreenPolicy' is not an available number or string!`, safe);
            fullScreenPolicy = defaultOptions.fullScreenPolicy;
        }
    } else if (typeof InputOptions.fullScreenPolicy === 'undefined') {
        fullScreenPolicy = defaultOptions.fullScreenPolicy;
    } else {
        reportOptionsError(`'options.fullScreenPolicy' is not a number or string!`, safe);
        fullScreenPolicy = defaultOptions.fullScreenPolicy;
    }

    // ----------------- NEXT OPTION -----------------------------------
    let highlightSkipMode: DPlayerSkipModeOption;
    if (typeof InputOptions.highlightSkipMode === 'string' || typeof InputOptions.highlightSkipMode === 'number') {
        let isCorrect = false;
        if (isNumberOrParsable(InputOptions.highlightSkipMode)) {
            const number = typeof InputOptions.highlightSkipMode === 'number' ? InputOptions.highlightSkipMode : parseInt(InputOptions.highlightSkipMode);
            if (number >= 0 && number <= 3) {
                isCorrect = true;
            }
        }

        if (!isCorrect) {
            if (typeof InputOptions.highlightSkipMode === 'string') {
                const lowerInput: string = InputOptions.highlightSkipMode.toLowerCase();
                isCorrect = ['smoothPrompt', 'immediately', 'smoothCancelPrompt', 'always'].reduce((acc: boolean, elem: string) => elem.toLowerCase() === lowerInput || acc, false);
            }
        }
        if (isCorrect) {
            highlightSkipMode = InputOptions.highlightSkipMode as DPlayerSkipModeOption;
        } else {
            reportOptionsError(`'options.highlightSkipMode' is not an available number or string!`, safe);
            highlightSkipMode = defaultOptions.highlightSkipMode;
        }
    } else if (typeof InputOptions.highlightSkipMode === 'undefined') {
        highlightSkipMode = defaultOptions.highlightSkipMode;
    } else {
        reportOptionsError(`'options.highlightSkipMode' is not a number or string!`, safe);
        highlightSkipMode = defaultOptions.highlightSkipMode;
    }

    // ----------------- NEXT OPTION -----------------------------------
    let contextmenu: DplayerContextMenuOption[];
    if (
        Array.isArray(InputOptions.contextmenu) &&
        (InputOptions.contextmenu as DplayerContextMenuOption[]).reduce(
            (acc: boolean, elem: DplayerContextMenuOption) =>
                hasTheseKeys<DplayerContextMenuOption>(elem, ['text', 'link', 'key', 'click'], [true, false, false, false], [is('string'), is('string'), is('string') /* TODO check if in DplayerTranslateKeys*/, is('function')]) && acc,
            true
        )
    ) {
        contextmenu = InputOptions.contextmenu as DplayerContextMenuOption[];
    } else if (typeof InputOptions.contextmenu === 'undefined') {
        contextmenu = defaultOptions.contextmenu;
    } else {
        reportOptionsError(`'options.contextmenu' is not an Array with elements that are correct Objects!`, safe);
        contextmenu = defaultOptions.contextmenu;
    }

    // ----------------- NEXT OPTION -----------------------------------
    let skipDelay;
    if (isNumberOrParsable(InputOptions.skipDelay)) {
        skipDelay = typeof InputOptions.skipDelay === 'number' ? InputOptions.skipDelay : parseFloat(InputOptions.skipDelay as string);
    } else if (typeof InputOptions.skipDelay === 'undefined') {
        skipDelay = defaultOptions.skipDelay;
    } else {
        reportOptionsError(`'options.skipDelay' is not a number, or a string that can be parsed as number!`, safe);
        skipDelay = defaultOptions.skipDelay;
    }

    // ----------------- NEXT OPTION -----------------------------------
    let highlightSkipArray: DPlayerHighlightSkiptTypes[];
    if (Array.isArray(InputOptions.highlightSkipArray) && InputOptions.highlightSkipArray.reduce((acc: boolean, elem: unknown) => (typeof elem === 'string' || elem instanceof RegExp) && acc, true)) {
        highlightSkipArray = InputOptions.highlightSkipArray as DPlayerHighlightSkiptTypes[];
    } else if (typeof InputOptions.highlightSkipArray === 'undefined') {
        highlightSkipArray = defaultOptions.highlightSkipArray;
    } else {
        reportOptionsError(`'options.highlightSkipArray' is not an Array with elements that are either string or a Regular Expression!`, safe);
        highlightSkipArray = defaultOptions.highlightSkipArray;
    }

    // ----------------- NEXT OPTION -----------------------------------
    let danmaku;
    // TODO

    // ----------------- NEXT OPTION -----------------------------------
    let pluginOptions: DPlayerPluginOptions;
    // TODO
    pluginOptions = defaultOptions.pluginOptions;
    if (InputOptions.pluginOptions !== 'undefined') {
        pluginOptions = InputOptions.pluginOptions as DPlayerPluginOptions;
    }

    // ----------------- NEXT OPTION -----------------------------------
    let API_URL;
    // TODO

    // ----------------- NEXT OPTION -----------------------------------
    let subtitle; // ATTENTION subtile / subtiles handling!!
    // TODO

    // ----------------- NEXT OPTION -----------------------------------
    let highlight; // ATTENTION highlight /highlights handling!!
    // TODO

    return {
        container,
        live,
        autoplay,
        theme,
        themeName,
        disableDarkMode,
        loop,
        lang,
        screenshot,
        airplay,
        chromecast,
        hotkey,
        advancedHotkeys,
        preload,
        logo,
        volume,
        playbackSpeed,
        apiBackend,
        video,
        balloon,
        mutex,
        hardSkipHighlights,
        highlightSkip,
        fullScreenPolicy,
        highlightSkipArray,
        contextmenu,
        highlightSkipMode,
        skipDelay,
        danmaku,
        pluginOptions,
        API_URL,
        subtitle,
        highlight,
    };
}

const OptionsHandler = (InputOptions: DPlayerOptions, player: DPlayer): DplayerParsedOptions => {
    // default options
    const defaultOptions: DPlayerDefaultOptions = {
        container: document.querySelector<HTMLElement>('.dplayer'),
        live: false,
        autoplay: false,
        themeName: 'standard',
        disableDarkMode: false,
        loop: false,
        lang: navigator.language.toLowerCase(), // navigator.browserLanguage isn't supported by anything nowadays!
        screenshot: true,
        airplay: 'vendor',
        chromecast: 'vendor',
        hotkey: true,
        advancedHotkeys: false,
        preload: 'metadata',
        volume: 0.7,
        playbackSpeed: [0.5, 0.75, 1, 1.25, 1.5, 2],
        video: {} as NormalObject,
        contextmenu: [
            {
                text: `DPlayer v${DPLAYER_VERSION}`,
                link: 'https://github.com/Totto16/DPlayer',
            } as DplayerContextMenuOption,
        ],
        fullScreenPolicy: 'OnlyNormal', // available "OnlyNormal","OnlyWeb","Both" or 0,1,2
        highlightSkipArray: [/^\s*opening\s*\d*$/i, /^\s*ending\s*\d*$/i, /^\s*op\s*\d*$/i, /^\s*ed\s*\d*$/i, /^\s*intro\s*$/i, /^\s*outro\s*$/i, /^\s*credits\s*$/i, /^\s*pause\s*$/i],
        highlightSkipMode: 'smoothPrompt', // available "smoothPrompt", "immediately", "smoothCancelPrompt", "always" or 0,1,2,3
        highlightSkip: false,
        skipDelay: 5000,
        hardSkipHighlights: false, // if we go backwards and end in a Skip Highlight, we normally stay there, but with that mode, we skip hard, that means, we skip the skip chapters ALWAYS
        mutex: true,
        pluginOptions: { hls: {}, flv: {}, dash: {}, webtorrent: {}, ass: {} },
        balloon: false,
    };

    // TODO(#39):  somewhere initialize apiBackend
    // can throw !!, if called with safe flag. otherwise it casts as much as possible (somethings can't be taken from nowhere, like the target container!
    const options: DplayerParsedOptions = parseOptions(InputOptions, defaultOptions, false);

    if (typeof options.video.type === 'undefined') {
        options.video.type = 'auto';
    }
    if (typeof options.danmaku === 'object' && Object.keys(options.danmaku).length > 0) {
        options.danmaku.user = options.danmaku.user ?? 'DIYgod';
    }
    if (options.subtitle) {
        if (!options.subtitle.type) {
            options.subtitle.type = 'webvtt';
            if (/ass(#|\?|$)/i.exec(options.subtitle.url) || /ssa(#|\?|$)/i.exec(options.subtitle.url)) {
                options.subtitle.type = 'ass';
            }
        }
        options.subtitle.fontSize = options.subtitle.fontSize ?? '20px';
        options.subtitle.bottom = options.subtitle.bottom ?? '40px';
        options.subtitle.color = options.subtitle.color ?? '#fff';
    }
    if (typeof options.video.defaultQuality === 'undefined') {
        options.video.defaultQuality = 0;
    }
    if (options.video.quality && typeof options.video.quality === 'object') {
        options.video.url = options.video.quality[options.video.defaultQuality].url;
    }

    if (typeof options.lang !== 'undefined') {
        options.lang = options.lang.toLowerCase();
    }

    if (typeof options.airplay !== 'undefined') {
        options.airplay = typeof options.airplay === 'string' ? utils.supportsAirplay() : options.airplay;
    }

    options.chromecast = typeof options.chromecast === 'string' ? utils.supportsChromeCast() : options.chromecast;

    if (options.highlight) {
        // TODO make PostProcessedOptions type xD
        options.highlights = {
            marker: options.highlight,
            mode: 'auto', // available 'auto', 'normal', 'top'
        };
        options.highlight = null;
    }

    if (options.highlights && options.highlights.vtt) {
        utils.parseVtt(
            options.highlights.vtt,
            (marker) => {
                if (!player.options.highlights) {
                    player.options.highlights = {};
                    console.warn(`Something really weird is going on, there is a bug somewhere! Please report that!`);
                }
                player.options.highlights.marker = marker;
                player.events.trigger('highlight_change');
            },
            0,
            options.API_URL,
            options.video.url
        );
    }

    if (options.highlights && !options.highlights.mode) {
        options.highlights.mode = 'auto';
    }

    if (options.highlights && options.highlights.marker && options.highlights.marker.length <= 0) {
        options.highlights = null;
    }
    if (typeof options.highlightSkipMode !== 'undefined') {
        switch (options.highlightSkipMode.toString().toLowerCase()) {
            case 'smoothprompt':
                break;
            case 'immediately':
                break;
            case 'smoothcancelprompt':
                break;
            case 'always':
                break;
            case '0':
                options.highlightSkipMode = 'smoothPrompt';
                break;
            case '1':
                options.highlightSkipMode = 'immediately';
                break;
            case '2':
                options.highlightSkipMode = 'smoothCancelPrompt';
                break;
            case '3':
                options.highlightSkipMode = 'always';
                break;
            default:
                console.warn(`'${options.highlightSkipMode}' highlightSkipMode option not available, set to default!`);
                options.highlightSkipMode = defaultOption.highlightSkipMode;
                break;
        }
        if (!options.highlightSkipArray) {
            options.highlightSkipArray = defaultOption.highlightSkipMode;
        }

        const temp = options.highlightSkipArray;
        options.highlightSkipArray = [];
        temp.forEach((a) => {
            if (a === '*') {
                options.highlightSkipArray.push(...defaultOption.highlightSkipArray);
                return;
            }
            if (!(a instanceof RegExp)) {
                let temp;
                try {
                    temp = new RegExp(a, 'i');
                    options.highlightSkipArray.push(temp);
                    return;
                } catch (e) {
                    console.warn(`String converted to RegExp not Valid, skipped: '${a}'`);
                    return;
                }
            }
            options.highlightSkipArray.push(a);
        });
    }

    if (options.theme !== undefined) {
        console.warn('Setting the Theme in this way is deprecated!');
        const style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `.dplayer { --dplayer-theme-color:${options.theme} !important; };`;
        document.head.appendChild(style);
        options.theme = undefined;
    }

    switch (options.fullScreenPolicy.toString().toLowerCase()) {
        case 'onlynormal':
            break;
        case 'onlyweb':
            break;
        case 'both':
            break;
        case '0':
            options.fullScreenPolicy = 'OnlyNormal';
            break;
        case '1':
            options.fullScreenPolicy = 'OnlyWeb';
            break;
        case '2':
            options.fullScreenPolicy = 'Both';
            break;
        default:
            console.warn(`'${options.fullScreenPolicy}' fullScreenPolicy option not available, set to default!`);
            options.fullScreenPolicy = defaultOption.fullScreenPolicy;
            break;
    }

    options.contextmenu = (
        [
            {
                key: 'video-info',
                click: (player: DPlayer) => {
                    player.hotkeyPanel.hide();
                    player.infoPanel.triggle();
                },
            },
            {
                key: 'hotkey-info',
                click: (player: DPlayer) => {
                    if (player.options.hotkey) {
                        player.infoPanel.hide();
                        player.hotkeyPanel.triggle();
                    } else {
                        player.notice(player.translate('hotkey-disabled'));
                    }
                },
            },
        ] as DplayerContextMenuOption[]
    ).concat(options.contextmenu);

    return options;
};

export default OptionsHandler;

interface DPlayerDefaultOptions extends StringIndexableObject {
    container?: HTMLElement | null;
    live: boolean;
    autoplay: boolean;
    themeName: string | 'standard';
    disableDarkMode: boolean;
    loop: boolean;
    lang: DPlayerSupportedLanguage | string;
    screenshot: boolean;
    airplay: boolean | 'vendor';
    chromecast: boolean | 'vendor';
    hotkey: boolean;
    advancedHotkeys: boolean;
    preload: DPlayerPreloadOption;
    volume: number;
    playbackSpeed: DPlayerPlaybackSpeedArray;
    video: DplayerVideoOptions;
    contextmenu: DplayerContextMenuOption[];
    fullScreenPolicy: DPlayerFullScreenOption;
    highlightSkipArray: DPlayerHighlightSkiptTypes[];
    highlightSkipMode: DPlayerSkipModeOption;
    highlightSkip: boolean;
    skipDelay: number; // @Deprecated
    hardSkipHighlights: boolean;
    mutex: boolean;
    pluginOptions: DPlayerPluginOptions;
    balloon: boolean;
}

export type DPlayerPlaybackSpeedArray = [number, number, number, number, number, number];

export type UserInput = unknown;

export type DPlayerHighlightSkiptTypes = RegExp | string;

export interface DPlayerOptions extends StringIndexableObject {
    container?: HTMLElement | UserInput;
    live?: boolean | UserInput;
    autoplay?: boolean | UserInput;
    theme?: string | UserInput; // @Deprecated
    themeName?: string | UserInput;
    disableDarkMode?: boolean | UserInput;
    loop?: boolean | UserInput;
    lang?: DPlayerSupportedLanguage | string | UserInput;
    screenshot?: boolean | UserInput;
    airplay?: boolean | 'vendor' | UserInput;
    chromecast?: boolean | 'vendor' | UserInput;
    hotkey?: boolean | UserInput;
    advancedHotkeys?: boolean | UserInput;
    preload?: DPlayerPreloadOption | UserInput;
    logo?: string | UserInput; // TODO(#41):  See where implemented
    volume?: number | string | UserInput;
    playbackSpeed?: [number, number, number, number, number, number] | UserInput;
    apiBackend?: any | UserInput; // of type DPlayerAPI, // TODO: implement that
    video?: DplayerVideoOptions | UserInput;
    subtitle?: DPlayerSubTitleOptionsWeak | UserInput;
    danmaku?: DPlayerDanmakuOption | UserInput;
    contextmenu?: DplayerContextMenuOption[] | UserInput;
    fullScreenPolicy?: DPlayerFullScreenOption | UserInput;
    highlightSkipArray?: (RegExp | string)[] | UserInput;
    highlightSkipMode?: DPlayerSkipModeOption | UserInput;
    highlightSkip?: boolean | UserInput;
    highlight?: DPlayerHighLightItem[] | UserInput;
    skipDelay?: number | UserInput;
    hardSkipHighlights?: boolean | UserInput;
    mutex?: boolean | UserInput;
    pluginOptions?: DPlayerPluginOptions | UserInput;
    balloon?: boolean | UserInput;
    API_URL?: string | UserInput;
}

export interface DplayerParsedOptions {
    // TODO(#42):  copy paste, for the lack of better solution!
    container: HTMLElement;
    live: boolean;
    autoplay: boolean;
    theme?: string; // @Deprecated
    themeName: string;
    disableDarkMode: boolean;
    loop: boolean;
    lang: DPlayerSupportedLanguage | string;
    screenshot: boolean;
    airplay: boolean | 'vendor';
    chromecast: boolean | 'vendor';
    hotkey: boolean;
    advancedHotkeys: boolean;
    preload: DPlayerPreloadOption;
    logo?: string; // TODO(#41):  See where implemented check if URL is valid in parserOptions
    volume: number;
    playbackSpeed: [number, number, number, number, number, number];
    apiBackend: undefined; // see TODO above
    video: DplayerVideoOptions;
    subtitle?: DPlayerSubTitleOptionsWeak;
    danmaku?: DPlayerDanmakuOption;
    contextmenu: DplayerContextMenuOption[];
    fullScreenPolicy: DPlayerFullScreenOption;
    highlightSkipArray: (RegExp | string)[];
    highlightSkipMode: DPlayerSkipModeOption;
    highlightSkip: boolean;
    highlight?: DPlayerHighLightItem[];
    skipDelay: number;
    hardSkipHighlights: boolean;
    mutex: boolean;
    pluginOptions?: DPlayerPluginOptions;
    balloon: boolean;
    API_URL?: string;
}

export type DPlayerPreloadOption = 'none' | 'metadata' | 'auto';

export type DPlayerAvailableVideoTypes = 'auto' | 'hls' | 'flv' | 'dash' | 'webtorrent' | 'normal';

export type DPlayerFullScreenOption = 'OnlyNormal' | 'OnlyWeb' | 'Both' | 0 | 1 | 2;

export type DPlayerSkipModeOption = 'smoothPrompt' | 'immediately' | 'smoothCancelPrompt' | 'always' | 0 | 1 | 2 | 3;

export interface DPlayerHighLightItem {
    text: string;
    time: number;
}

export interface DPlayerVideoQuality extends NormalObject {
    name: string;
    url: string;
    type?: string;
}

// yes every Normal JS Object is iterabel over the keys (strings) and indexable by them.
export interface NormalObject extends Iterable<string>, StringIndexableObject {}

// same as     [Symbol.iterator](): Iterator<string>;
export interface DplayerVideoOptions extends NormalObject {
    url?: string;
    pic?: string;
    thumbnails?: string;
    type?: DPlayerAvailableVideoTypes | string;
    customType?: DPlayerCustomTypeObject;
    quality?: DPlayerVideoQuality[];
    defaultQuality?: number;
}

export interface DPlayerDanmakuOption {
    id: string;
    api: string;
    token?: string;
    maximum?: string;
    addition?: string[];
    user?: string;
    bottom?: string;
    unlimited?: boolean;
}

export interface DplayerContextMenuOption extends NormalObject {
    // TODO(#43):  add missing
    text: string;
    link?: string;
    key?: string; // TODO(#44):  keyof translation available keys!
    click?: (player: DPlayer) => void;
    // Missing?
}

// TODO: add types
export interface DPlayerPluginOptions {
    hls: {};
    flv: {};
    dash: {};
    webtorrent: {};
    ass: DPlayerAssOptions;
}

export interface DPlayerCustomTypeObject {
    [typeName: string]: DPlayerCustomInitializzer;
}

export type DPlayerCustomInitializzer = (video: HTMLVideoElement, dplayer: DPlayer) => void;

export interface DPlayerAssOptions {
    // TODO:
}

// TODO(#45):   use, or try to use instanceof!! use the isOfType isOfTYpeOrNull!!! to check DPlayerOptionsInput
