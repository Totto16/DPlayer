/* global DPLAYER_VERSION */
import defaultApiBackend from './api.js';
import utils from './utils.js';

export default (options, player) => {
    // default options
    const defaultOption = {
        container: options.element || document.getElementsByClassName('dplayer')[0],
        live: false,
        autoplay: false,
        once_delay: 100,
        themeName: 'standard',
        disableDarkMode: false,
        loop: false,
        lang: (navigator.language || navigator.browserLanguage).toLowerCase(),
        screenshot: true,
        airplay: 'vendor',
        chromecast: 'vendor',
        hotkey: true,
        advancedHotkeys: false,
        preload: 'metadata',
        volume: 0.7,
        playbackSpeed: [0.5, 0.75, 1, 1.25, 1.5, 2],
        apiBackend: defaultApiBackend,
        video: {},
        contextmenu: [
            {
                text: `DPlayer v${DPLAYER_VERSION}`,
                link: 'https://github.com/Totto16/DPlayer',
            },
        ],
        fullScreenPolicy: 'OnlyNormal', // available "OnlyNormal","OnlyWeb","Both" or 0,1,2

        highlightSkipArray: [/^Opening$/i, /^Ending$/i, /^OP$/i, /^ED$/i, /^Intro$/i, /^Outro$/i, /^Credits$/i, /^Pause$/i],
        highlightSkipMode: 'smoothPrompt', // available "smoothPrompt", "immediately", "smoothCancelPrompt", "always" or 0,1,2,3
        highlightSkip: false,
        hardSkipHighlights: false, // if we go backwards and end in a Skip Highlight, we normally stay there, but with that mode, we skip hard, that means, we skip the skip chapters ALWAYS
        mutex: true,
        pluginOptions: { hls: {}, flv: {}, dash: {}, webtorrent: {}, ass: {} },
        balloon: false,
    };
    for (const defaultKey in defaultOption) {
        if (defaultOption.hasOwnProperty(defaultKey) && !options.hasOwnProperty(defaultKey)) {
            options[defaultKey] = defaultOption[defaultKey];
        }
    }
    if (options.video && !options.video.type) {
        options.video.type = 'auto';
    }
    if (typeof options.danmaku === 'object' && options.danmaku) {
        !options.danmaku.user && (options.danmaku.user = 'DIYgod');
    }
    if (options.subtitle) {
        if (!options.subtitle.type) {
            options.subtitle.type = 'webvtt';
            if (/ass(#|\?|$)/i.exec(options.subtitle.url) || /ssa(#|\?|$)/i.exec(options.subtitle.url)) {
                options.subtitle.type = 'ass';
            }
        }
        !options.subtitle.fontSize && (options.subtitle.fontSize = '20px');
        !options.subtitle.bottom && (options.subtitle.bottom = '40px');
        !options.subtitle.color && (options.subtitle.color = '#fff');
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
        options.airplay = typeof options.airplay === 'string' && options.airplay === 'vendor' ? utils.supportsAirplay() : options.airplay;
    }

    if (options.chromecast) {
        options.chromecast = typeof options.chromecast === 'string' && options.chromecast === 'vendor' ? utils.supportsChromeCast() : options.chromecast;
    }

    if (options.highlight) {
        options.highlights = {
            marker: options.highlight,
            mode: 'auto',
        };
        options.highlight = null;
    }

    if (options.highlights && options.highlights.vtt) {
        options.highlights.marker = utils.parseVtt(options.highlights.vtt, (marker) => {
            player.options.highlights.marker = marker;
            player.events.trigger('highlight_change');
        });
    }

    if (options.highlights && !options.highlights.mode) {
        options.highlights.mode = 'auto';
    }

    if (options.highlights && options.highlights.marker && options.highlights.marker.length <= 0) {
        options.highlights = null;
    }
    if (options.highlightSkipMode) {
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
            click: (player) => {
                player.hotkeyPanel.hide();
                player.infoPanel.triggle();
            },
        },
        {
            key: 'hotkey-info',
            click: (player) => {
                if (player.options.hotkey) {
                    player.infoPanel.hide();
                    player.hotkeyPanel.triggle();
                } else {
                    player.notice(player.tran('hotkey_disabled'));
                }
            },
        },
    ].concat(options.contextmenu);

    return options;
};
