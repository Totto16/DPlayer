/* global DPLAYER_VERSION */
import defaultApiBackend from './api.js';
import utils from './utils.js';

export default (options, player) => {
    // default options
    const defaultOption = {
        container: options.element || document.getElementsByClassName('dplayer')[0],
        live: false,
        autoplay: false,
        theme: '#b7daff',
        loop: false,
        lang: (navigator.language || navigator.browserLanguage).toLowerCase(),
        screenshot: false,
        airplay: 'vendor',
        chromecast: 'vendor',
        hotkey: true,
        advancedHotkeys: false,
        preload: 'metadata',
        volume: 0.7,
        playbackSpeed: [0.5, 0.75, 1, 1.25, 1.5, 2],
        apiBackend: defaultApiBackend,
        video: {},
        contextmenu: [],
        mutex: true,
        pluginOptions: { hls: {}, flv: {}, dash: {}, webtorrent: {}, mkv: {}, ass: {} },
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

    options.contextmenu = options.contextmenu.concat([
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
                player.infoPanel.hide();
                player.hotkeyPanel.triggle();
            },
        },
        {
            text: `DPlayer v${DPLAYER_VERSION}`,
            link: 'https://github.com/Totto16/DPlayer',
        },
    ]);

    return options;
};
