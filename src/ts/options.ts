import { DPlayerSupportedLanguage } from './i18n.js';
import { StringIndexableObject } from './index.js';
import DPlayer from './player';
import { DPlayerSubTitleOptions, DPlayerSubTitleOptionsWeak } from './subtitle.js';
import utils from './utils';

const config = (options: DPlayerOptions, player: DPlayer): DplayerParsedOptions => {
    // default options
    const defaultOption: DPlayerDefaultOptions = {
        container: options.element || (document.querySelector('.dplayer') as HTMLElement),
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
        video: {},
        contextmenu: [
            {
                text: `DPlayer v${DPLAYER_VERSION}`,
                link: 'https://github.com/Totto16/DPlayer',
            },
        ],
        fullScreenPolicy: 'OnlyNormal', // available "OnlyNormal","OnlyWeb","Both" or 0,1,2
        highlightSkipArray: [/^\s*Opening\s*\d*$/i, /^\s*Ending\s*\d*$/i, /^\s*OP\s*\d*$/i, /^\s*ED\s*\d*$/i, /^\s*Intro\s*$/i, /^\s*Outro\s*$/i, /^\s*Credits\s*$/i, /^\s*Pause\s*$/i],
        highlightSkipMode: 'smoothPrompt', // available "smoothPrompt", "immediately", "smoothCancelPrompt", "always" or 0,1,2,3
        highlightSkip: false,
        skipDelay: 5000,
        hardSkipHighlights: false, // if we go backwards and end in a Skip Highlight, we normally stay there, but with that mode, we skip hard, that means, we skip the skip chapters ALWAYS
        mutex: true,
        pluginOptions: { hls: {}, flv: {}, dash: {}, webtorrent: {}, ass: {} },
        balloon: false,
    };

    // TODO somewhere initialize apiBackend

    for (const defaultKey in defaultOption) {
        if (defaultOption.hasOwnProperty(defaultKey) && !options.hasOwnProperty(defaultKey)) {
            options[defaultKey] = defaultOption[defaultKey];
        }
    }
    if (options.video && !options.video.type) {
        options.video.type = 'auto';
    }
    if (typeof options.danmaku === 'object' && options.danmaku) {
        options.danmaku.user = options.danmaku.user || 'DIYgod';
    }
    if (options.subtitle) {
        if (!options.subtitle.type) {
            options.subtitle.type = 'webvtt';
            if (/ass(#|\?|$)/i.exec(options.subtitle.url) || /ssa(#|\?|$)/i.exec(options.subtitle.url)) {
                options.subtitle.type = 'ass';
            }
        }
        options.subtitle.fontSize = options.subtitle.fontSize || '20px';
        options.subtitle.bottom = options.subtitle.bottom || '40px';
        options.subtitle.color = options.subtitle.color || '#fff';
    }
    if (options.video && !options.video.defaultQuality) {
        options.video.defaultQuality = 0;
    }
    if (options.video.quality) {
        options.video.url = options.video.quality[options.video.defaultQuality].url;
    }

    if (options.lang) {
        options.lang = options.lang.toLowerCase();
    }

    if (options.airplay) {
        options.airplay = typeof options.airplay === 'string' ? (options.airplay === 'vendor' ? utils.supportsAirplay() : false) : options.airplay;
    }

    if (options.chromecast) {
        options.chromecast = typeof options.chromecast === 'string' ? (options.chromecast === 'vendor' ? utils.supportsChromeCast() : false) : options.chromecast;
    }

    if (options.highlight) {
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

    if (options.theme) {
        console.warn('Setting the Theme in this way is deprecated!');
        const style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = `.dplayer { --dplayer-theme-color:${options.theme} !important; };`;
        document.head.appendChild(style);
        options.theme = null;
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

    options.contextmenu = [
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
                    player.notice(player.translate('hotkey_disabled'));
                }
            },
        },
    ].concat(options.contextmenu);

    return options;
};

export default config;

interface DPlayerDefaultOptions {
    container?: HTMLElement;
    live?: boolean;
    autoplay?: boolean;
    themeName?: string;
    disableDarkMode?: boolean;
    loop?: boolean;
    lang?: DPlayerSupportedLanguage | string;
    screenshot?: boolean;
    airplay?: boolean | 'vendor';
    chromecast?: boolean | 'vendor';
    hotkey?: boolean;
    advancedHotkeys?: boolean;
    preload?: DPlayerPreloadOption;
    logo?: string; // TODO See where implemented
    volume?: number;
    playbackSpeed?: [number, number, number, number, number, number];
    video?: DplayerVideoOptions | {};
    contextmenu?: DplayerContextMenuOption[];
    fullScreenPolicy?: DPlayerFullScreenOption;
    highlightSkipArray?: (RegExp | string)[];
    highlightSkipMode?: DPlayerSkipModeOption;
    highlightSkip?: boolean;
    skipDelay?: number;
    hardSkipHighlights?: boolean;
    mutex?: boolean;
    pluginOptions?: DPlayerPluginOptions;
    balloon?: boolean;
}

export interface DPlayerOptions extends StringIndexableObject {
    element?: HTMLElement; // @deprecated
    container?: HTMLElement;
    live?: boolean;
    autoplay?: boolean;
    theme?: string; // @Deprecated
    themeName?: string;
    disableDarkMode?: boolean;
    loop?: boolean;
    lang?: DPlayerSupportedLanguage | string;
    screenshot?: boolean;
    airplay?: boolean | 'vendor';
    chromecast?: boolean | 'vendor';
    hotkey?: boolean;
    advancedHotkeys?: boolean;
    preload?: DPlayerPreloadOption;
    logo?: string; // TODO See where implemented
    volume?: number;
    playbackSpeed?: [number, number, number, number, number, number];
    apiBackend?: DPlayerAPIBackendOption;
    video?: DplayerVideoOptions;
    subtitle?: DPlayerSubTitleOptionsWeak;
    danmaku?: DPlayerDanmakuOption;
    contextmenu?: DplayerContextMenuOption[];
    fullScreenPolicy?: DPlayerFullScreenOption;
    highlightSkipArray?: (RegExp | string)[];
    highlightSkipMode?: DPlayerSkipModeOption;
    highlightSkip?: boolean;
    highlight?: DPlayerHighLightItemOption[];
    skipDelay?: number;
    hardSkipHighlights?: boolean;
    mutex?: boolean;
    pluginOptions?: DPlayerPluginOptions;
    balloon?: boolean;
}

export interface DplayerParsedOptions extends DPlayerOptions {
    test: boolean; // TODO copy paste, for the lack of better solution!
}

export type DPlayerPreloadOption = 'none' | 'metadata' | 'auto';

export type DPlayerAvailableVideoTypes = 'auto' | 'hls' | 'flv' | 'dash' | 'webtorrent' | 'normal';

export type DPlayerFullScreenOption = 'OnlyNormal' | 'OnlyWeb' | 'Both' | 0 | 1 | 2;

export type DPlayerSkipModeOption = 'smoothPrompt' | 'immediately' | 'smoothCancelPrompt' | 'always' | 0 | 1 | 2 | 3;

export interface DPlayerHighLightItem {
    text: string;
    time: number;
}

export interface DPlayerVideoQuality {
    name: string;
    url: string;
    type?: string | undefined;
}

export interface DplayerVideoOptions {
    url: string;
    pic?: string;
    thumbnails?: string;
    type?: DPlayerAvailableVideoTypes | string;
    customType?: unknown;
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

export interface DplayerContextMenuOption {
    // TODO add missing
    text: string;
    link?: string;
    key?: string; // TODO keyof translation available keys!
    click?: (player: DPlayer) => void;
    // Missing?
}

export interface DPlayerPluginOptions {
    hls: {};
    flv: {};
    dash: {};
    webtorrent: {};
    ass: DPlayerAssOptions;
}

export interface DPlayerAssOptions {
    //TODO
}

// TODO  use, or try to use instanceof!! use the isOfType isOfTYpeOrNull!!! to check DPlayerOptionsInput
