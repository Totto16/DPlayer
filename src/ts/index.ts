import '../css/index.scss';
import { DPlayerOptions } from './options';
import DPlayer from './player';

console.log(`${'\n'} %c DPlayer v${DPLAYER_VERSION} ${BUILD_TIME} %c http://dplayer.js.org ${'\n'}${'\n'}`, 'color: #a912ee; background: #aaa; padding:5px 0;', 'background: #a912ee; color:#fff; padding:5px 0;');

/* New Format of starting Dplayer, it will start automatically, after its loaded, for available options see future ReadME //TODO add readme !!!!*/

// TODOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO VERY IMPORTANT BEFORE RELEASING THIS
//TODO find an elegant way to handle unkwon data, meaning down compiled js can have any types, the user can input any types!!!!

if (window.DPLAYER_AUTO) {
    if (!window.DPLAYER_AUTO.name) {
        window.DPLAYER_AUTO.name = 'DPLAYER_AUTO_INSTANCE';
    }
    window[window.DPLAYER_AUTO.name] = new DPlayer(window.DPLAYER_AUTO.options);
    if (typeof window.DPLAYER_AUTO.callback === 'function') {
        window.DPLAYER_AUTO.callback(window[window.DPLAYER_AUTO.name]);
    } else if (window.DPLAYER_AUTO.callback) {
        console.warn(`provided callback in 'window.DPLAYER_AUTO.callback' is not a function!`);
    }
    console.debug(`used 'window.DPLAYER_AUTO' to load DPLAYER automatically, you can find it's instance at 'window['${window.DPLAYER_AUTO.name}']'`);
}

export default DPlayer;

export interface DPlayerAutoObject {
    name?: string;
    callback?: DPlayerCreateAutoCallback;
    options?: DPlayerOptions;
}

export type DPlayerCreateAutoCallback = (instance: DPlayer) => void;
