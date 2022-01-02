class Events {
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
            'ranges_change',
            'all',
        ];
    }

    on(name, callback, delayed = false, once = false) {
        if (name === 'all' || name === '*') {
            name = [...this.playerEvents, ...this.videoEvents];
        }
        if (Array.isArray(name)) {
            name.forEach((a) => this.on(a, callback));
        } else {
            if (this.type(name) && typeof callback === 'function') {
                if (!this.events[name]) {
                    this.events[name] = [];
                }
                const UUID = this.currentUUID++;
                // TODO remove delayed option!!!
                // NEVER USE THAT, it is a race condition between user and CPU, and the time is variable!!!!!!!!!!!! if user is faster then that its a weird buggy behavior!!
                if (typeof delayed === 'number') {
                    const ID = setTimeout(() => {
                        const temp = this.events[name].filter((item) => item.UUID === UUID);
                        if (temp.length > 0) {
                            temp[0].delayed = false;
                        } else {
                            console.error(`CRITICAL, this is a critical BUG in the once method, if the delay is to big, or somthing other weird happens with the timing, you get really weird errors, please don't use this!!!!!`);
                            console.log(`%cCRITICAL`, 'color: white; background: red; padding:5px 0; font-size: 100px;');
                        }
                        clearTimeout(ID);
                    }, delayed);
                    this.events[name].push({ callback, delayed: true, once, UUID });
                } else {
                    this.events[name].push({ callback, delayed: !!delayed, once, UUID });
                }
            }
        }
    }

    once(name, callback, delayed) {
        this.on(name, callback, delayed, true);
    }

    off(name) {
        if (this.type(name)) {
            if (this.events[name]) {
                this.events[name] = null;
            }
        }
    }
    trigger(name, info) {
        if (this.events[name] && this.events[name].length > 0) {
            for (let i = 0; i < this.events[name].length; i++) {
                if (!this.events[name][i].delayed) {
                    this.events[name][i].callback(info);
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
