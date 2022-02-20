import '../css/index.scss';
import { BUILD_TIME, DPLAYER_VERSION } from './global';
import { DPlayerOptions } from './options';
import DPlayer from './player';
console.log(`${'\n'} %c DPlayer v${DPLAYER_VERSION} ${BUILD_TIME} %c http://dplayer.js.org ${'\n'}${'\n'}`, 'color: #a912ee; background: #aaa; padding:5px 0;', 'background: #a912ee; color:#fff; padding:5px 0;');

/* New Format of starting Dplayer, it will start automatically, after its loaded, for available options see future ReadME //TODO(#33):  add readme !!!!*/

// TODO(#34): OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO VERY IMPORTANT BEFORE RELEASING THIS
// TODO(#35):  find an elegant way to handle unknown data, meaning down compiled js can have any types, the user can input any types!!!!
// TODO : Changed some things in the main js released, that has to be adopted!!!

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

// TODO(#36):  add to index.d.ts
export interface DPlayerDestroyable {
    destroy(): void;
}

export const isOfType = <T>(check: unknown): check is T => {
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

// TODO(#37):  remove generic indexable Type!!
// ATTENTION use with cause, since we can't use every string to to that!
export interface StringIndexableObject {
    [index: string]: unknown;
}

function isNullish<T = any>(argument: T): boolean {
    if (argument === undefined) {
        return true;
    } else if (argument === null) {
        return true;
    } else if (typeof argument === 'string' && argument === '') {
        return true;
    } else if (Array.isArray(argument) && argument.length === 0) {
        return true;
    } else if (Object.keys(argument).length === 0) {
        return true;
    } else {
        return false;
    }
}

export { isNullish };

// actual progress: 947 remaining errors (-227 from last time)
//                  821 remaining errors (-126 from last time)
//                  823 remaining errors (+2 from last time, but I fixed some important "Userland" JS things)
//                  548 remaining errors (-275 from last time)