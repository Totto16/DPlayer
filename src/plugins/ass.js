// using https://github.com/libass/JavascriptSubtitlesOctopus in folder ass/

// Subtitle Octopus has many bugs and errors, some of them are: - When you seek the subtitles get shown even if the video hasn't loaded yet!
//                                                              - The Browser Image decoding isn't available to an coding error! (maybe I'll fix that)
//                                                              - fonts are complicated and its hard to only load the necessary fonts, I have a font folder with over 400 fonts but i don't want them to load all, it would be better to load them when needed on a set folder! (this could be solved with a font config file on the server, that it understands, currently you can define something like availableFonts{'arial':'whatever.ttf'}, but thats not enough!)

import SubtitlesOctopus from './js/subtitles-octopus.js';

const ass = (options, player, onReady) => {
    if (!SubtitlesOctopus) {
        console.error('SubtitlesOctopus is not defined, fatal Error!');
        return;
    }
    const default_options = {
        fonts: [],
        workerUrl: 'subtitles-octopus-worker.js',
        legacyWorkerUrl: 'subtitles-octopus-worker-legacy.js',
        onReady,
        onError: (err) => {
            console.log(err);
        },
        debug: true,
        lossyRender: true, // is in beta but doesn't freeze the player, may be skipping some subs!
    };
    // only to import them, you shouldn't do that, but its better then hardcoding it into webpack config
    // eslint-disable-next-line no-unused-vars
    const worker = require('!!file-loader?name=ass/[name].[ext]!./js/subtitles-octopus-worker.js');
    // eslint-disable-next-line no-unused-vars
    const data = require('!!file-loader?name=ass/[name].[ext]!./js/subtitles-octopus-worker.data');
    // eslint-disable-next-line no-unused-vars
    const wasm = require('!!file-loader?name=ass/[name].[ext]!./js/subtitles-octopus-worker.wasm');
    // eslint-disable-next-line no-unused-vars
    const worker_l = require('!!file-loader?name=ass/[name].[ext]!./js/subtitles-octopus-worker-legacy.js');
    // eslint-disable-next-line no-unused-vars
    const data_l = require('!!file-loader?name=ass/[name].[ext]!./js/subtitles-octopus-worker-legacy.data');
    options = { ...default_options, ...options };
    player.options.pluginOptions.ass = options;
    return new SubtitlesOctopus(options);
};

export default ass;
