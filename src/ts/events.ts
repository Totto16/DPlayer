class Events {
    events: DPlayerEventStorage;
    currentUUID: number;
    videoEvents: DPlayerVideoEvent[];
    playerEvents: DPlayerPlayerEvent[];

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

    /**
     *
     * @param {event | event[]} name
     * @param {function} callback
     * @param {boolean} once
     * @param {boolean} delayed //IMPORTANT, this is for not executing it right when in a call!! For more see notes below
     * @returns number | number[] uuids
     */
    on(name: (DPlayerEvent | '*' | 'all') | (DPlayerEvent | '*' | 'all')[], callback: DPlayerEventCallback, once = false, delayed = false): UUID | UUID[] | null {
        if (name === 'all' || name === '*') {
            name = [...this.playerEvents, ...this.videoEvents];
        }

        if (Array.isArray(name)) {
            return (name as DPlayerEvent[]).map((event: DPlayerEvent): UUID => this.on(event, callback, once, delayed) as UUID);
        } else {
            if (this.type(name) && typeof callback === 'function') {
                if (typeof this.events[name] === 'undefined') {
                    this.events[name] = [];
                }
                const UUID = this.currentUUID++;
                this.events[name].push({ callback, once, delayed, UUID });
                return UUID;
            }
        }
        return null;
    }

    once(name: (DPlayerEvent | '*' | 'all') | (DPlayerEvent | '*' | 'all')[], callback: DPlayerEventCallback, delayed = false): UUID | UUID[] | null {
        return this.on(name, callback, true, delayed);
    }

    off(name: DPlayerEvent): boolean {
        if (this.type(name)) {
            if (this.events[name]) {
                this.events[name] = null;
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
                const allEvents = this.videoEvents.concat(this.playerEvents);
                for (let i = 0; i < allEvents.length; i++) {
                    const array: DPlayerEventStorageItem[] = this.events[allEvents[i]];
                    if (typeof array === 'undefined' || array.length === 0) {
                        continue;
                    }
                    for (let j = 0; j < array.length; j++) {
                        const { UUID } = array[j];
                        if (UUID === uuid) {
                            this.events[allEvents[i]].splice(j, 1);
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    trigger(name, info) {
        if (this.events[name] && this.events[name].length > 0) {
            for (let i = 0; i < this.events[name].length; i++) {
                if (!this.events[name][i].delayed) {
                    this.events[name][i].callback(info, { UUID: this.events[name][i].UUID, event: name });
                }
            }
            for (let i = this.events[name].length - 1; i > 0; i--) {
                if (this.events[name][i].delayed) {
                    this.events[name][i].delayed = false;
                } else if (this.events[name][i].once) {
                    this.events[name].splice(i, 1);
                }
            }
        }
    }

    type(name) {
        if (this.playerEvents.indexOf(name) !== -1) {
            return 'player';
        } else if (this.videoEvents.indexOf(name) !== -1) {
            return 'video';
        }

        console.error(`Unknown event name: ${name}`);
        return null;
    }

    destroy() {
        Object.keys(this.events).forEach((key) => {
            this.off(key);
        });
    }
}

export default Events;

export type DPlayerEvent = DPlayerVideoEvent | DPlayerPlayerEvent;

export type DPlayerVideoEvent =
    | 'abort'
    | 'canplay'
    | 'canplaythrough'
    | 'durationchange'
    | 'emptied'
    | 'ended'
    | 'error'
    | 'loadeddata'
    | 'loadedmetadata'
    | 'loadstart'
    | 'mozaudioavailable'
    | 'pause'
    | 'play'
    | 'playing'
    | 'progress'
    | 'ratechange'
    | 'seeked'
    | 'seeking'
    | 'stalled'
    | 'suspend'
    | 'timeupdate'
    | 'volumechange'
    | 'waiting';

export type DPlayerPlayerEvent =
    | 'screenshot'
    | 'thumbnails_show'
    | 'thumbnails_hide'
    | 'danmaku_show'
    | 'danmaku_hide'
    | 'danmaku_clear'
    | 'danmaku_loaded'
    | 'danmaku_send'
    | 'danmaku_opacity'
    | 'contextmenu_show'
    | 'contextmenu_hide'
    | 'notice_show'
    | 'notice_hide'
    | 'quality_start'
    | 'quality_end'
    | 'destroy'
    | 'resize'
    | 'fullscreen'
    | 'fullscreen_cancel'
    | 'webfullscreen'
    | 'webfullscreen_cancel'
    | 'subtitle_show'
    | 'subtitle_hide'
    | 'subtitle_change'
    | 'chapter'
    | 'highlight_change'
    | 'cancelskip'
    | 'ranges_change';

export interface DPlayerEventStorageItem {
    callback: DPlayerEventCallback;
    once: boolean;
    delayed: boolean;
    UUID: UUID;
}

export interface DPlayerEventStorage {
    [index: DPlayerEvent]: DPlayerEventStorageItem[];
}

export type UUID = number; // For the moment, also doesn't need to be changed, but to make sure everybody sees, that its UNIQUE!

export type DPlayerEventProperties = { UUID: UUID; event: keyof DPlayerEvent };

export type DPlayerEventInfo = unknown; //  for the moment // TODO add better info handling tied to the event name!

export type DPlayerEventCallback = (info: DPlayerEventInfo, properties: DPlayerEventProperties) => void;
