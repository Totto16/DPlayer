/* global DPLAYER_VERSION */
import defaultApiBackend from './api.js';
import utils from './utils.js';

export default (options, player) => {
    // default options
    const defaultOption = {
        container: options.element || document.getElementsByClassName('dplayer')[0],
        live: false,
        autoplay: false,
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
        advanced: {
            highlightSkipArray: ['Opening', 'Ending', 'OP', 'ED', 'Intro', 'Outro', 'Credits', 'Pause'],
            highlightSkipMode: 'smoothPrompt', // available "smoothPrompt", "immediately", "smoothCancelPrompt" , "loadingSkip" or 0,1,2,3
            highlightSkip: false,
        },
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
        if (options.video.quality === 'auto') {
            // maybe require hsl for that, so that we have per example:
            /*      #EXTM3U
            #EXT-X-VERSION:6
            #EXT-X-STREAM-INF:BANDWIDTH=3547276,RESOLUTION=1920x1080
            1019.m3u8
             */
            // TODO get network speed and than decide, we have to get a) network speed
            // b) bitrate of the avaiable options!
            /*  var xhr = new XMLHttpRequest;
        xhr.onreadystatechange = function () {
        if (xhr.readyState != 4) {
            return;
        }
        alert(xhr.status);
        };
        https://stackoverflow.com/questions/5529718/how-to-detect-internet-speed-in-javascript
        xhr.open('GET', 'https://somesite.com/something.smt', true);
        xhr.setRequestHeader('Range', 'bytes=100-200'); // the bytes (incl.) you request
        xhr.send(null); */
        }
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
    if (options.advanced && options.advanced.highlightSkip) {
        switch (options.advanced.highlightSkipMode.toString().toLowerCase()) {
            case 'smoothprompt':
                break;
            case 'immediately':
                break;
            case 'smoothcancelprompt':
                break;
            case 'loadingskip':
                break;
            case '0':
                options.advanced.highlightSkipMode = 'smoothPrompt';
                break;
            case '1':
                options.advanced.highlightSkipMode = 'immediately';
                break;
            case '2':
                options.advanced.highlightSkipMode = 'smoothCancelPrompt';
                break;
            case '3':
                options.advanced.highlightSkipMode = 'loadingSkip';
                break;
            default:
                console.warn(`'${options.advanced.highlightSkipMode}' highlightSkipMode option not available, set to default!`);
                options.advanced.highlightSkipMode = defaultOption.advanced.highlightSkipMode;
                break;
        }
        if (!options.advanced.highlightSkipArray) {
            options.advanced.highlightSkipArray = defaultOption.advanced.highlightSkipMode;
        }
        options.advanced.highlightSkipArray.forEach((a) => {
            if (a === '*') {
                options.advanced.highlightSkipArray.concat(defaultOption.advanced.highlightSkipArray);
            }
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
                    player.notice(player.trans('hotkey_disabled'));
                }
            },
        },
    ].concat(options.contextmenu);

    return options;
};
