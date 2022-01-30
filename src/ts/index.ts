import '../css/index.scss';
import './index.d.ts';
import { DPlayerOptions } from './options';
import DPlayer from './player';

console.log(`${'\n'} %c DPlayer v${DPLAYER_VERSION} ${BUILD_TIME} %c http://dplayer.js.org ${'\n'}${'\n'}`, 'color: #a912ee; background: #aaa; padding:5px 0;', 'background: #a912ee; color:#fff; padding:5px 0;');

/* New Format of starting Dplayer, it will start automatically, after its loaded, for available options see future ReadME //TODO(#33):  add readme !!!!*/

// TODO(#34): OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO VERY IMPORTANT BEFORE RELEASING THIS
// TODO(#35):  find an elegant way to handle unknown data, meaning down compiled js can have any types, the user can input any types!!!!

if (window.DPLAYER_AUTO) {
    if (typeof window.DPLAYER_AUTO.name === 'undefined' || typeof window.DPLAYER_AUTO.name !== 'string') {
        window.DPLAYER_AUTO.name = 'DPLAYER_AUTO_INSTANCE';
    }
    window[window.DPLAYER_AUTO.name] = new DPlayer(window.DPLAYER_AUTO.options);
    if (typeof window.DPLAYER_AUTO.callback === 'function') {
        window.DPLAYER_AUTO.callback(window[window.DPLAYER_AUTO.name] as DPlayer);
    } else if (typeof window.DPLAYER_AUTO.callback !== 'undefined') {
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

// TODO:  add to index.d.ts
export interface DPlayerDestroyable {
    destroy(): void;
}

export const isOfType = <T>(check: any): check is T => {
    const keys = Object.keys(check as T);
    for (let i = 0; i < keys.length; i++) {
        if ((check as T)[keys[i]] === undefined) {
            return false;
        }
    }
    return true;
};

export const isOfTypeAndNotNull = <T>(check: any): check is T => {
    const keys = Object.keys(check as T);
    for (let i = 0; i < keys.length; i++) {
        if ((check as T)[keys[i]] === undefined || (check as T)[keys[i]] === null) {
            return false;
        }
    }
    return true;
};

// TODO:  remove generic indexable Type!!
// ATTENTION use with cause, since we can't use every string to to that!
export interface StringIndexableObject {
    [index: string]: unknown;
}

function isNullish<T = any>(argument: T): boolean {
    if (argument === undefined) {
        return true;
    } else if (argument === null) {
        return true;
    } else if (argument === '') {
        return true;
    } else if (Array.isArray(argument) && argument.length === 0) {
        return true;
    } else if (Object.key(argument).length === 0) {
        return true;
    } else {
        return false;
    }
}

export { isNullish };

// actual progress: 1174 remaining errors (-333 from last time)
