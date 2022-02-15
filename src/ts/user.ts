import DPlayer, { StringIndexableObject } from '.';
import utils from './utils';

class User {
    storageName: DPlayerUserStorageKeys;
    default: DPlayerUserStorageValues;
    data: DPlayerUserStorageValues;

    constructor(player: DPlayer) {
        this.storageName = {
            opacity: 'dplayer-danmaku-opacity',
            volume: 'dplayer-volume',
            unlimited: 'dplayer-danmaku-unlimited',
            danmaku: 'dplayer-danmaku-show',
            subtitle: 'dplayer-subtitle-show',
            // TODO(#62):  add other useful like selected quality index, current time etc
        };
        this.default = {
            opacity: 0.7,
            volume: player.options.hasOwnProperty('volume') ? player.options.volume : 0.7,
            unlimited: player.options.danmaku && player.options.danmaku.unlimited,
            danmaku: 1,
            subtitle: 1,
        };
        this.data = {};

        this.init();
    }

    // TODO: differentiate between Object, string, number, boolean
    init(): void {
        for (let i = 0; i < Object.keys(this.storageName).length; i++) {
            const item: DPlayerUserStorageInternalKeys = (Object.keys(this.storageName) as DPlayerUserStorageInternalKeys[])[i];
            const name = this.storageName[item];
            this.data[item] = parseFloat(utils.storage.get(name) || this.default[item]);
        }
    }

    get<T extends Storable>(key: DPlayerUserStorageInternalKeys): T {
        return this.data[key];
    }

    getWithDefault<T extends Storable>(key: DPlayerUserStorageInternalKeys, defaultValue: T): T {
        const value = this.get<T>(key);
        if (value !== undefined) {
            return value;
        }
        return defaultValue;
    }

    set(key: DPlayerUserStorageInternalKeys, value: string) {
        // TODO(#63):  valueOf DPlayerUserStorageValues
        this.data[key] = value;
        utils.storage.set(this.storageName[key], value);
    }
}

export default User;

export type DPlayerUserStorageInternalKeys = 'opacity' | 'volume' | 'unlimited' | 'danmaku' | 'subtitle';

export type DPlayerUserStorageKeys = {
    [index in DPlayerUserStorageInternalKeys]: string;
};

// ATTENTION Update both DPlayerUserStorageInternalKeys and this!
export type DPlayerUserStorageValues = {
    opacity?: number;
    volume?: number;
    unlimited?: boolean;
    danmaku?: number;
    subtitle?: number;
};

export type Storable = StringIndexableObject | string | number | boolean;
