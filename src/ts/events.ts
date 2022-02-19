class Events {
    events: DPlayerEventStorage;
    currentUUID: number;
    videoEvents: (keyof DPlayerVideoEventMap)[];
    playerEvents: (keyof DPlayerPlayerEventMap)[];

    constructor() {
        this.events = {};
        this.currentUUID = 0;
        this.videoEvents = [
            'abort',
            'canplay',
            'canplaythrough',
            'durationchange',
            'emptied',
            'ended',
            'error',
            'loadeddata',
            'loadedmetadata',
            'loadstart',
            'mozaudioavailable',
            'pause',
            'play',
            'playing',
            'progress',
            'ratechange',
            'seeked',
            'seeking',
            'stalled',
            'suspend',
            'timeupdate',
            'volumechange',
            'waiting',
        ];
        this.playerEvents = [
            'screenshot',
            'thumbnails_show',
            'thumbnails_hide',
            'danmaku_show',
            'danmaku_hide',
            'danmaku_clear',
            'danmaku_loaded',
            'danmaku_send',
            'danmaku_opacity',
            'contextmenu_show',
            'contextmenu_hide',
            'notice_show',
            'notice_hide',
            'quality_start',
            'quality_end',
            'destroy',
            'resize',
            'fullscreen',
            'fullscreen_cancel',
            'webfullscreen',
            'webfullscreen_cancel',
            'subtitle_show',
            'subtitle_hide',
            'subtitle_change',
            'chapter',
            'highlight_change',
            'cancelskip',
            'ranges_change',
        ];
    }

    on<K extends keyof DPlayerEventMap>(name: (K | '*' | 'all') | (keyof DPlayerEventMap | '*' | 'all')[], callback: DPlayerEventCallback<K> | DPlayerEventCallback<keyof DPlayerEventMap>, once = false, delayed = false): UUID | UUID[] {
        if (name === 'all' || name === '*') {
            name = [...this.playerEvents, ...this.videoEvents];
        }

        if (Array.isArray(name)) {
            return (name as (keyof DPlayerEventMap)[])
                .map((event: keyof DPlayerEventMap): UUID[] => {
                    const result = this.on<keyof DPlayerEventMap>(event, callback as DPlayerEventCallback<keyof DPlayerEventMap>, once, delayed);
                    if (!Array.isArray(result)) {
                        return [result];
                    }
                    return result;
                })
                .reduce((acc, curr) => acc.concat(curr), []);
        } else {
            if (this.type(name) && typeof callback === 'function') {
                if (typeof this.events[name] === 'undefined') {
                    this.events[name] = [];
                }
                const UUID = this.currentUUID++;
                (this.events[name] as DPlayerEventStorageItem<K>[]).push({ callback, once, delayed, UUID });
                return UUID;
            }
        }
        return null;
    }

    once<K extends keyof DPlayerEventMap>(name: (K | '*' | 'all') | (K | '*' | 'all')[], callback: DPlayerEventCallback<K>, delayed = false): UUID | UUID[] | null {
        return this.on(name, callback, true, delayed);
    }

    off<K extends keyof DPlayerEventMap>(name: K): boolean {
        if (this.type(name)) {
            if (this.events[name]) {
                this.events[name] = [];
                return true;
            }
        }
        return false;
    }

    removeByUUID(uuid: UUID | UUID[]): boolean {
        if (Array.isArray(uuid)) {
            return uuid.every((a) => this.removeByUUID(a));
        } else {
            if (typeof uuid === 'number') {
                const allEvents: (keyof DPlayerEventMap)[] = [...this.videoEvents, ...this.playerEvents];
                for (let i = 0; i < allEvents.length; i++) {
                    // this.#InternalRemoveByUUID(uuid, allEvents[i]);

                    const array: DPlayerEventStorageItem<keyof DPlayerEventMap>[] | undefined = this.events[allEvents[i]] as DPlayerEventStorageItem<keyof DPlayerEventMap>[];
                    if (typeof array === 'undefined' || array.length === 0) {
                        continue;
                    }
                    for (let j = 0; j < array.length; j++) {
                        const { UUID } = array[j];
                        if (UUID === uuid) {
                            // here I have to modify the original array!
                            (this.events[allEvents[i]] as DPlayerEventStorageItem<keyof DPlayerEventMap>[]).splice(j, 1);
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    trigger<K extends keyof DPlayerEventMap>(name: K, info?: DPlayerEventInfo<K>): boolean {
        if (typeof this.events[name] !== 'undefined' && (this.events[name] as DPlayerEventStorageItem<K>[]).length > 0) {
            for (let i = 0; i < (this.events[name] as DPlayerEventStorageItem<K>[]).length; i++) {
                if (!(this.events[name] as DPlayerEventStorageItem<K>[])[i].delayed) {
                    (this.events[name] as DPlayerEventStorageItem<K>[])[i].callback(info, { UUID: (this.events[name] as DPlayerEventStorageItem<K>[])[i].UUID, event: name });
                }
            }
            for (let i = (this.events[name] as DPlayerEventStorageItem<K>[]).length - 1; i > 0; i--) {
                if ((this.events[name] as DPlayerEventStorageItem<K>[])[i].delayed) {
                    (this.events[name] as DPlayerEventStorageItem<K>[])[i].delayed = false;
                } else if ((this.events[name] as DPlayerEventStorageItem<K>[])[i].once) {
                    (this.events[name] as DPlayerEventStorageItem<K>[]).splice(i, 1);
                }
            }
            return true;
        }
        return false;
    }
    // TODO(#22): OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO VERY IMPORTANT BEFORE RELEASING THIS
    // TODO(#23):  find an elegant way to handle unkwon data, meaning down compiled js can have any types, the user can input any types!!!!
    type<K extends keyof DPlayerEventMap>(name: K): DPlayerEventType | null {
        if (this.playerEvents.indexOf(name as keyof DPlayerPlayerEventMap) !== -1) {
            return 'player';
        } else if (this.videoEvents.indexOf(name as keyof DPlayerVideoEventMap) !== -1) {
            return 'video';
        }

        console.error(`Unknown event name: ${name}`);
        return null;
    }

    destroy(): void {
        const allEvents: (keyof DPlayerEventMap)[] = [...this.videoEvents, ...this.playerEvents];
        for (let i = 0; i < allEvents.length; i++) {
            this.off(allEvents[i]);
        }
    }
}

export default Events;

export type DPlayerEventType = 'player' | 'video';

export interface DPlayerEventMap extends DPlayerVideoEventMap, DPlayerPlayerEventMap {}

// A Selection of HTMLVideoElementEventMap
export interface DPlayerVideoEventMap {
    abort: UIEvent;
    canplay: Event;
    canplaythrough: Event;
    durationchange: Event;
    emptied: Event;
    ended: Event;
    error: ErrorEvent;
    loadeddata: Event;
    loadedmetadata: Event;
    loadstart: Event;
    pause: Event;
    play: Event;
    playing: Event;
    progress: ProgressEvent;
    ratechange: Event;
    seeked: Event;
    seeking: Event;
    stalled: Event;
    suspend: Event;
    timeupdate: Event;
    volumechange: Event;
    waiting: Event;
    mozaudioavailable: Event; // NOn standard, only Firefox
}

// TODO fill all return types!!
export interface DPlayerPlayerEventMap {
    screenshot: Event;
    thumbnails_show: Event;
    thumbnails_hide: Event;
    danmaku_show: Event;
    danmaku_hide: Event;
    danmaku_clear: Event;
    danmaku_loaded: Event;
    danmaku_send: Event;
    danmaku_opacity: Event;
    contextmenu_show: Event;
    contextmenu_hide: Event;
    notice_show: Event;
    notice_hide: Event;
    quality_start: Event;
    quality_end: Event;
    destroy: Event;
    resize: Event;
    fullscreen: Event;
    fullscreen_cancel: Event;
    webfullscreen: Event;
    webfullscreen_cancel: Event;
    subtitle_show: Event;
    subtitle_hide: Event;
    subtitle_change: Event;
    chapter: Event;
    highlight_change: Event;
    cancelskip: Event;
    ranges_change: Event;
}

export interface DPlayerEventStorageItem<K extends keyof DPlayerEventMap> {
    callback: DPlayerEventCallback<K>;
    once: boolean;
    delayed: boolean;
    UUID: UUID;
}

export type DPlayerEventStorage = {
    [K in keyof DPlayerEventMap]?: DPlayerEventStorageItem<K>[];
};

export type UUID = number | null; // For the moment, also doesn't need to be changed, but to make sure everybody sees, that its UNIQUE!

export type DPlayerEventProperties = { UUID: UUID; event: keyof DPlayerEventMap };

// TODO make it optional, so that some [ĸ] may return or others not!! (set them to undefined instead of Event, or undefined | whateverEvent)
export type DPlayerEventInfo<K extends keyof DPlayerEventMap> = DPlayerEventMap[K] | undefined;

//  for the moment // TODO(#24):  add better info handling tied to the event name!

export type DPlayerEventCallback<K extends keyof DPlayerEventMap> = (info: DPlayerEventInfo<K>, properties: DPlayerEventProperties) => void;
