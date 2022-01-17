/* declare namespace DPlayerTypes {
    // TODO use this!

    // TODO remove generic indexable Type!!
    // ATTENTION use with cause, since we can't use every string to to that!
    interface StringIndexableObject {
        [index: string]: unknown;
    }
} */

/* eslint-disable no-var */
import DPlayer, { DPlayerAutoObject } from '.';

declare global {
    interface Window {
        [name: string]: unknown;

        DPLAYER_AUTO?: DPlayerAutoObject;
        DPLAYER_INSTANCES: DPlayer[];
        // nowadays this is supported by everything, at least nearly
        /*   requestAnimationFrame?:(callback: FrameRequestCallback)=> number;
        msRequestAnimationFrame?:(callback: FrameRequestCallback)=> number;
        oRequestAnimationFrame?:(callback: FrameRequestCallback)=> number;
        mozRequestAnimationFrame?:(callback: FrameRequestCallback)=> number;
        webkitRequestAnimationFrame?:(callback: FrameRequestCallback)=> number; */
    }
}

declare var DPLAYER_VERSION: string;
declare var GIT_TIME: string;
declare var GIT_HASH: string;
declare var BUILD_TIME: string;

declare module '*.svg' {
    const content: string;
    export default content;
}

declare module '*.art' {
    const content: HTMLElement;
    export default content;
}

/* export const isOfType = <T>(check: any): check is T => {
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
}; */
