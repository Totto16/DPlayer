import DPlayer, { DPlayerAutoObject } from '.';

declare namespace NodeJS {
    interface Global {
        DPLAYER_VERSION: string;
        GIT_TIME: string;
        GIT_HASH: string;
        BUILD_TIME: string;
    }
    interface Window {
        DPLAYER_AUTO?: DPlayerAutoObject;
        DPLAYER_INSTANCES: DPlayer[];
    }
}
