// using https://github.com/libass/JavascriptSubtitlesOctopus in folder ass/

// Subtitle Octopus has many bugs and errors, some of them are: - When you seek the subtitles get shown even if the video hasn't loaded yet!
//                                                              - The Browser Image decoding isn't available to an coding error! (I'll fixed that)
//                                                              - fonts are complicated and its hard to only load the necessary fonts, I have a font folder with over 400 fonts but i don't want them to load all, it would be better to load them when needed on a set folder! (this could be solved with a font config file on the server, that it understands, currently you can define something like availableFonts{'arial':'whatever.ttf'}, but thats not enough!)

import SubtitlesOctopus from './js/subtitles-octopus.js';

// To define async functions compiled to regenerators!
import 'regenerator-runtime/runtime.js';

const ass = async (options, player, onReady, callback) => {
    if (!SubtitlesOctopus) {
        console.error('SubtitlesOctopus is not defined, fatal Error!');
        return;
    }
    const { allFonts, usedFonts } = await getAvaiableFonts('/fonts/config.json', '');
    const default_options = {
        workerUrl: 'subtitles-octopus-worker.js',
        legacyWorkerUrl: 'subtitles-octopus-worker-legacy.js',
        fallbackFont: '/fonts/arialbd.ttf', // Fallback font to be used in case none can be loaded / or has special characters
        fonts: usedFonts,
        availableFonts: allFonts,
        onReady,
        onError: (err) => {
            console.error(err);
        },
        debug: true,
        lossyRender: true, // is in beta but doesn't freeze the player, may be skipping some subs!
    };
    // only to import them, you shouldn't do that, but its better then hardcoding it into webpack config
    // eslint-disable-next-line no-unused-vars
    const worker = require('!!file-loader?name=ass/[name].[ext]!./js/subtitles-octopus-worker.js');
    // eslint-disable-next-line no-unused-vars
    //  const data = require('!!file-loader?name=ass/[name].[ext]!./js/subtitles-octopus-worker.data');
    // eslint-disable-next-line no-unused-vars
    const wasm = require('!!file-loader?name=ass/[name].[ext]!./js/subtitles-octopus-worker.wasm');
    // eslint-disable-next-line no-unused-vars
    //  const worker_l = require('!!file-loader?name=ass/[name].[ext]!./js/subtitles-octopus-worker-legacy.js');
    // eslint-disable-next-line no-unused-vars
    //  const data_l = require('!!file-loader?name=ass/[name].[ext]!./js/subtitles-octopus-worker-legacy.data');
    options = { ...default_options, ...options };
    player.options.pluginOptions.ass = options;
    const SO = new SubtitlesOctopus(options);
    if (callback) {
        callback(SO);
    }
    return SO;
};

async function getAvaiableFonts(location = 'https://ddl.amalgam-fansubs.moe/fonts/config.json', url = 'https://ddl.amalgam-fansubs.moe') {
    // {"arial": "/font1.ttf"}
    return await new Promise((resolve) => {
        fetch(location)
            .then((response) => response.json())
            .then((data) => {
                Object.keys(data).forEach((a) => {
                    data[a] = `${url}${data[a]}`;
                });
                resolve({ allFonts: data, usedFonts: Object.values(data) });
            })
            .catch((err) => {
                console.error(err);
                resolve({ allFonts: [], usedFonts: {} });
            });
    });
}

export default ass;
