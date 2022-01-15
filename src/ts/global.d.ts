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
