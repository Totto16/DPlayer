// all available options!
const keys = {
    32: 'togglePlayer',
    37: 'left',
    39: 'right',
    38: 'up',
    40: 'down',
    27: 'cancelBothFullscreen',
    70: 'toggleFullscreen',
    87: 'toggleWebFullscreen',
    77: 'mute',
    83: 'screenshot',
    68: 'nextChapter',
    65: 'previousChapter',
    76: 'changeLoop',
    86: 'speedUp',
    67: 'speedDown',
    78: 'speedNormal',
};

// TODO(#78): add option for subtitle select, disabled if no subtitles are loaded, add toggle and swichting hotkeys

const advancedKeys = {
    ' ': 'togglePlayer',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
    ArrowDown: 'down',
    Escape: 'cancelFullscreen',
    f: 'toggleFullscreen',
    w: 'toggleWebFullscreen',
    MediaPlayPause: 'togglePlayer',
    MediaStop: 'stopPlayer',
    AudioVolumeMute: 'mute',
    m: 'mute',
    s: 'screenshot',
    MediaTrackPrevious: 'nextChapter',
    MediaTrackNext: 'previousChapter',
    d: 'nextChapter',
    a: 'previousChapter',
    l: 'changeLoop',
    v: 'speedUp',
    c: 'speedDown',
    n: 'speedNormal',
};

class HotKey {
    constructor(player) {
        this.player = player;
        this.doHotKeyHandler = this.doHotKey.bind(this);
        if (this.player.options.hotkey) {
            document.addEventListener('keydown', this.doHotKeyHandler);
            this.enabledKeys = { keys, advancedKeys };
            this.disabledKeys = { keys: {}, advancedKeys: {} };
            // fullscreen handling
            switch (this.player.options.fullScreenPolicy.toString().toLowerCase()) {
                case 'onlynormal':
                    this.disabledKeys.keys = { ...this.disabledKeys.keys, 87: keys[87] };
                    delete this.enabledKeys.keys[87];
                    this.disabledKeys.advancedKeys = { ...this.disabledKeys.advancedKeys, w: advancedKeys.w };
                    delete this.enabledKeys.advancedKeys.w;
                    break;
                case 'onlyweb':
                    this.disabledKeys.keys = { ...this.disabledKeys.keys, 70: keys[70] };
                    delete this.enabledKeys.keys[70];
                    this.disabledKeys.advancedKeys = { ...this.disabledKeys.advancedKeys, f: advancedKeys.f };
                    delete this.enabledKeys.advancedKeys.f;
                    break;
                case 'both':
                    // nothing, we are already set up!
                    break;
                default:
                    console.warn(`'options.fullScreenPolicy' not set correctly, this should not occur!`);
                    break;
            }
            // TODO(#76): debug an issue regarding multiple instances of inherited "advancedKeys" objects (their getting deleted) , maybe a deep copy solves the problem!
            console.log(this.disabledKeys, this.enabledKeys.keys);
        }
    }

    doHotKey(e) {
        if (this.player.focus) {
            const tag = document.activeElement.tagName.toUpperCase();
            const editable = document.activeElement.getAttribute('contenteditable');
            if (tag !== 'INPUT' && tag !== 'TEXTAREA' && editable !== '' && editable !== 'true') {
                const event = e || window.event;
                let percentage;
                this.player.hotkeyPanel.parse(event.keyCode);
                switch (this.key(event)) {
                    case 'togglePlayer':
                        // toggle player pause / resume
                        event.preventDefault();
                        this.player.toggle();
                        break;
                    case 'stopPlayer':
                        // stop player
                        event.preventDefault();
                        this.player.pause();
                        break;
                    case 'left':
                        // go back 5 seconds
                        event.preventDefault();
                        if (this.player.options.live) {
                            break;
                        }
                        this.player.seek(this.player.video.currentTime - 5);
                        this.player.controller.setAutoHide();
                        break;
                    case 'right':
                        // go forward 5 seconds
                        event.preventDefault();
                        if (this.player.options.live) {
                            break;
                        }
                        this.player.seek(this.player.video.currentTime + 5);
                        this.player.controller.setAutoHide();
                        break;
                    case 'up':
                        // increase volume
                        event.preventDefault();
                        percentage = this.player.volume() + 0.1;
                        this.player.volume(percentage);
                        break;
                    case 'down':
                        // lower volume
                        event.preventDefault();
                        percentage = this.player.volume() - 0.1;
                        this.player.volume(percentage);
                        break;
                    case 'toggleFullscreen':
                        // toggle Fullscreen
                        event.preventDefault();
                        this.player.fullScreen.toggle('browser');
                        break;
                    case 'cancelBothFullscreen':
                        // cancel WEB fullscreen
                        event.preventDefault();
                        if (this.player.fullScreen.isFullScreen('web')) {
                            this.player.fullScreen.cancel('web');
                        }
                        // cancel fullscreen
                        event.preventDefault();
                        if (this.player.fullScreen.isFullScreen('browser')) {
                            this.player.fullScreen.cancel('browser');
                        }
                        break;
                    case 'toggleWebFullscreen':
                        // toggle WEB Fullscreen
                        event.preventDefault();
                        this.player.fullScreen.toggle('web');
                        break;
                    case 'mute':
                        // mute / demute player
                        event.preventDefault();
                        this.player.controller.muteChanger();
                        break;
                    case 'screenshot':
                        // mute / demute player
                        event.preventDefault();
                        if (this.player.options.screenshot) {
                            this.player.controller.SaveScreenshot();
                        }
                        break;
                    case 'changeLoop':
                        // change the loop status
                        event.preventDefault();
                        this.player.setting.toggleLoop();
                        break;
                    case 'speedUp':
                        // player speed increase
                        event.preventDefault();
                        this.player.setting.EditSpeed(1);
                        break;
                    case 'speedDown':
                        // make player speed slower
                        event.preventDefault();
                        this.player.setting.EditSpeed(-1);
                        break;
                    case 'speedNormal':
                        // sets player speed to normal, 1
                        event.preventDefault();
                        this.player.speed(1);
                        break;
                    case 'previousChapter':
                        // goes to the previous chapter, if we have chapters
                        event.preventDefault();
                        this.player.controller.goToChapter(0); // 0 because we go to the current chapter beginning
                        break;
                    case 'nextChapter':
                        // goes to the next chapter, if we have chapters
                        event.preventDefault();
                        this.player.controller.goToChapter(1);
                        break;
                }
            }
        }
    }

    keyOLD(event) {
        switch (event.keyCode) {
            case 32:
                return 'togglePlayer';
            case 37:
                return 'left';
            case 39:
                return 'right';
            case 38:
                return 'up';
            case 40:
                return 'down';
            case 27:
                return 'cancelFullscreen';
            case 70:
                return 'toggleFullscreen';
            case 77:
                return 'mute';
            case 83:
                return 'screenshot';
            case 68:
                return 'nextChapter';
            case 65:
                return 'previousChapter';
            case 76:
                return 'changeLoop';
            case 86:
                return 'speedUp';
            case 67:
                return 'speedDown';
            case 78:
                return 'speedNormal';
        }
        // String Names to be extra sure! (Useful for mediaPlay Buttons on PC!)
        if (this.player.options.advancedHotkeys) {
            switch (event.key) {
                case ' ':
                    return 'togglePlayer';
                case 'ArrowLeft':
                    return 'left';
                case 'ArrowRight':
                    return 'right';
                case 'ArrowUp':
                    return 'up';
                case 'ArrowDown':
                    return 'down';
                case 'Escape':
                    return 'cancelFullscreen';
                case 'f':
                    return 'toggleFullscreen';
                case 'MediaPlayPause':
                    return 'togglePlayer';
                case 'MediaStop':
                    return 'stopPlayer';
                case 'AudioVolumeMute':
                    return 'mute';
                case 'm':
                    return 'mute';
                case 's':
                    return 'screenshot';
                case 'MediaTrackPrevious':
                    return 'nextChapter';
                case 'MediaTrackNext':
                    return 'previousChapter';
                case 'd':
                    return 'nextChapter';
                case 'a':
                    return 'previousChapter';
                case 'l':
                    return 'changeLoop';
                case 'v':
                    return 'speedUp';
                case 'c':
                    return 'speedDown';
                case 'n':
                    return 'speedNormal';
            }
        }
    }

    key(event) {
        if (this.enabledKeys.keys[event.keyCode]) {
            return this.enabledKeys.keys[event.keyCode];
        }
        // String Names to be extra sure! (Useful for mediaPlay Buttons on PC!)
        if (this.player.options.advancedHotkeys) {
            if (this.enabledKeys.advancedKeys[event.keyCode]) {
                return this.enabledKeys.advancedKeys[event.keyCode];
            }
        }
    }

    keysOld() {
        const enabled = [];
        for (let i = 32; i <= 90; i++) {
            const rep_key = this.key({ keyCode: i });
            if (rep_key) {
                const key = String.fromCharCode(i).toLowerCase().replace(' ', '{space}').replace('%', '{arrowleft}').replace('&', '{arrowup}').replace("'", '{arrowright}').replace('(', '{arrowdown}');
                enabled.push({ key, tooltip: rep_key, keyCode: i });
            }
        }
        return enabled;
    }

    keys() {
        const enabled = Object.entries(this.enabledKeys.keys).map((a) => {
            const [index, name] = a;
            const key = String.fromCharCode(index).toLowerCase().replace(' ', '{space}').replace('%', '{arrowleft}').replace('&', '{arrowup}').replace("'", '{arrowright}').replace('(', '{arrowdown}');
            return { key, tooltip: name, keyCode: index };
        });
        console.log(this.disabledKeys);
        const disabled = Object.entries(this.disabledKeys.keys).map((a) => {
            const [index, name] = a;
            const key = String.fromCharCode(index).toLowerCase().replace(' ', '{space}').replace('%', '{arrowleft}').replace('&', '{arrowup}').replace("'", '{arrowright}').replace('(', '{arrowdown}');
            return { key, tooltip: name, keyCode: index };
        });
        return { enabled, disabled, all: enabled.concat(disabled) };
    }

    destroy() {
        if (this.player.options.hotkey) {
            document.removeEventListener('keydown', this.doHotKeyHandler);
        }
        document.removeEventListener('keydown', this.cancelFullScreenHandler);
        this.destroyed = true;
    }
}

export default HotKey;
