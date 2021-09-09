// using https://github.com/libass/JavascriptSubtitlesOctopus in folder ass/

window.ass = (options) => {
    if (!window.SubtitlesOctopus) {
        console.error('SubtitlesOctopus is not defined, fatal Error!');
        return;
    }
    const default_options = {
        fonts: ['/test/font-1.ttf', '/test/font-2.ttf'],
        workerUrl: '/libassjs-worker.js',
        legacyWorkerUrl: '/libassjs-worker-legacy.js',
    };
    return new window.SubtitlesOctopus({ default_options, ...options });
};
