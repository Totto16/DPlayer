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

    on(name: (DPlayerEvent | '*' | 'all') | (DPlayerEvent | '*' | 'all')[], callback: DPlayerEventCallback, once = false, delayed = false): UUID | UUID[] {
        if (name === 'all' || name === '*') {
            name = [...this.playerEvents, ...this.videoEvents];
        }

        if (Array.isArray(name)) {
            return (name as DPlayerEvent[])
                .map((event: DPlayerEvent): UUID[] => {
                    const result = this.on(event, callback, once, delayed);
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
                (this.events[name] as DPlayerEventStorageItem[]).push({ callback, once, delayed, UUID });
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
                const allEvents: DPlayerEvent[] = [...this.videoEvents, ...this.playerEvents];
                for (let i = 0; i < allEvents.length; i++) {
                    const array: DPlayerEventStorageItem[] | undefined = this.events[allEvents[i]];
                    if (typeof array === 'undefined' || array.length === 0) {
                        continue;
                    }
                    for (let j = 0; j < array.length; j++) {
                        const { UUID } = array[j];
                        if (UUID === uuid) {
                            (this.events[allEvents[i]] as DPlayerEventStorageItem[]).splice(j, 1);
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    trigger(name: DPlayerEvent, info?: DPlayerEventInfo): boolean {
        if (typeof this.events[name] !== 'undefined' && (this.events[name] as DPlayerEventStorageItem[]).length > 0) {
            for (let i = 0; i < (this.events[name] as DPlayerEventStorageItem[]).length; i++) {
                if (!(this.events[name] as DPlayerEventStorageItem[])[i].delayed) {
                    (this.events[name] as DPlayerEventStorageItem[])[i].callback(info, { UUID: (this.events[name] as DPlayerEventStorageItem[])[i].UUID, event: name });
                }
            }
            for (let i = (this.events[name] as DPlayerEventStorageItem[]).length - 1; i > 0; i--) {
                if ((this.events[name] as DPlayerEventStorageItem[])[i].delayed) {
                    (this.events[name] as DPlayerEventStorageItem[])[i].delayed = false;
                } else if ((this.events[name] as DPlayerEventStorageItem[])[i].once) {
                    (this.events[name] as DPlayerEventStorageItem[]).splice(i, 1);
                }
            }
            return true;
        }
        return false;
    }
    // TODOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO VERY IMPORTANT BEFORE RELEASING THIS
    // TODO find an elegant way to handle unkwon data, meaning down compiled js can have any types, the user can input any types!!!!
    type(name: DPlayerEvent): DPlayerEventType | null {
        if (this.playerEvents.indexOf(name as DPlayerPlayerEvent) !== -1) {
            return 'player';
        } else if (this.videoEvents.indexOf(name as DPlayerVideoEvent) !== -1) {
            return 'video';
        }

        console.error(`Unknown event name: ${name}`);
        return null;
    }

    destroy(): void {
        const allEvents: DPlayerEvent[] = [...this.videoEvents, ...this.playerEvents];
        for (let i = 0; i < allEvents.length; i++) {
            this.off(allEvents[i]);
        }
    }
}

export default Events;

export type DPlayerEventType = 'player' | 'video';

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

export type DPlayerEventStorage = {
    [index in DPlayerEvent]?: DPlayerEventStorageItem[];
};

export type UUID = number | null; // For the moment, also doesn't need to be changed, but to make sure everybody sees, that its UNIQUE!

export type DPlayerEventProperties = { UUID: UUID; event: DPlayerEvent };

export type DPlayerEventInfo = unknown; //  for the moment // TODO add better info handling tied to the event name!

export type DPlayerEventCallback = (info: DPlayerEventInfo, properties: DPlayerEventProperties) => void;

/* //TODO use these + add new ones!
export enum DPlayerEvents {
    abort = 'abort',
    canplay = 'canplay',
    canplaythrough = 'canplaythrough',
    durationchange = 'durationchange',
    emptied = 'emptied',
    ended = 'ended',
    error = 'error',
    loadeddata = 'loadeddata',
    loadedmetadata = 'loadedmetadata',
    loadstart = 'loadstart',
    mozaudioavailable = 'mozaudioavailable',
    pause = 'pause',
    play = 'play',
    playing = 'playing',
    progress = 'progress',
    ratechange = 'ratechange',
    seeked = 'seeked',
    seeking = 'seeking',
    stalled = 'stalled',
    suspend = 'suspend',
    timeupdate = 'timeupdate',
    volumechange = 'volumechange',
    waiting = 'waiting',
    screenshot = 'screenshot',
    thumbnails_show = 'thumbnails_show',
    thumbnails_hide = 'thumbnails_hide',
    danmaku_show = 'danmaku_show',
    danmaku_hide = 'danmaku_hide',
    danmaku_clear = 'danmaku_clear',
    danmaku_loaded = 'danmaku_loaded',
    danmaku_send = 'danmaku_send',
    danmaku_opacity = 'danmaku_opacity',
    contextmenu_show = 'contextmenu_show',
    contextmenu_hide = 'contextmenu_hide',
    notice_show = 'notice_show',
    notice_hide = 'notice_hide',
    quality_start = 'quality_start',
    quality_end = 'quality_end',
    destroy = 'destroy',
    resize = 'resize',
    fullscreen = 'fullscreen',
    fullscreen_cancel = 'fullscreen_cancel',
    subtitle_show = 'subtitle_show',
    subtitle_hide = 'subtitle_hide',
    subtitle_change = 'subtitle_change',
}
 */
