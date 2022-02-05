import DPlayer from '.';
import { DPlayerTranslateKey } from './i18n';
import utils from './utils.js';

// all available options!
const keys: DPlayerKeyMapping = {
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

const advancedKeys: DPlayerAdvancedKeyMapping = {
    ' ': 'togglePlayer',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
    ArrowDown: 'down',
    Escape: 'cancelBothFullscreen',
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
    player: DPlayer;
    doHotKeyHandler: DPlayerHotkeyHandler;
    destroyed?: boolean;
    enabledKeys?: DPlayerHotkeysStorage;
    disabledKeys?: DPlayerHotkeysStorage;

    constructor(player: DPlayer) {
        this.player = player;
        this.doHotKeyHandler = this.doHotKey.bind(this);
        if (this.player.options.hotkey ?? false) {
            // WOW
            document.addEventListener('keydown', this.doHotKeyHandler);
            this.enabledKeys = { keys: utils.deepCopyObject<DPlayerKeyMapping>(keys), advancedKeys: utils.deepCopyObject<DPlayerAdvancedKeyMapping>(advancedKeys) };
            this.disabledKeys = { keys: {}, advancedKeys: {} };
            // fullscreen handling
            switch (this.player.options.fullScreenPolicy?.toString().toLowerCase()) {
                case 'onlynormal':
                    this.disabledKeys.keys = { ...this.disabledKeys.keys, 87: keys[87] };
                    delete this.enabledKeys.keys[87];
                    this.disabledKeys.advancedKeys = { ...this.disabledKeys.advancedKeys, w: advancedKeys.w };
                    delete this.enabledKeys.advancedKeys.w;
                    break;
                case 'onlyweb':
                    this.disabledKeys.keys = { ...this.disabledKeys.keys, 70: keys[70] };
                    delete this.enabledKeys.keys[70]; // cancelBothFullscreen
                    break;
                case 'both':
                    // nothing, we are already set up!
                    break;
                default:
                    console.warn(`'options.fullScreenPolicy' not set correctly, this should not occur!`);
                    break;
            }
        }
    }

    doHotKey(e?: Event): void {
        if (this.player.focus ?? false) {
            const tag = document.activeElement?.tagName.toUpperCase();
            const editable = document.activeElement?.getAttribute('contenteditable');
            if (tag !== 'INPUT' && tag !== 'TEXTAREA' && editable !== '' && editable !== 'true') {
                const event = e || window.event;
                if (!(event instanceof KeyboardEvent)) {
                    return;
                }
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
                        // go back 5 seconds, // TODO maybe allow left movement, and then also right one?
                        event.preventDefault();
                        if (this.player.options.live ?? false) {
                            break;
                        }
                        this.player.seek(this.player.video.currentTime - 5);
                        this.player.controller.setAutoHide();
                        break;
                    case 'right':
                        // go forward 5 seconds
                        event.preventDefault();
                        if (this.player.options.live ?? false) {
                            break;
                        }
                        this.player.seek(this.player.video.currentTime + 5);
                        this.player.controller.setAutoHide();
                        break;
                    case 'up':
                        // increase volume
                        event.preventDefault();
                        percentage = (this.player.volume() ?? 0) + 0.1;
                        this.player.volume(percentage);
                        break;
                    case 'down':
                        // lower volume
                        event.preventDefault();
                        percentage = (this.player.volume() ?? 0) - 0.1;
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

    key(event: Event): undefined | DPlayerKeyMappingValues {
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

    keys(): DPlayerHotkeysStorageExport {
        const enabled: DPlayerNamedKeys[] = Object.entries(this.enabledKeys?.keys ?? []).map(([index, name]) => {
            const key = String.fromCharCode(parseInt(index)).toLowerCase().replace(' ', '{space}').replace('%', '{arrowleft}').replace('&', '{arrowup}').replace("'", '{arrowright}').replace('(', '{arrowdown}');
            return { key, tooltip: name, keyCode: index };
        });
        const disabled: DPlayerNamedKeys[] = Object.entries(this.disabledKeys?.keys ?? []).map(([index, name]) => {
            const key = String.fromCharCode(parseInt(index)).toLowerCase().replace(' ', '{space}').replace('%', '{arrowleft}').replace('&', '{arrowup}').replace("'", '{arrowright}').replace('(', '{arrowdown}');
            return { key, tooltip: name, keyCode: index };
        });
        return { enabled, disabled, all: enabled.concat(disabled) };
    }

    destroy(): void {
        if (this.player.options.hotkey ?? false) {
            document.removeEventListener('keydown', this.doHotKeyHandler);
        }
        this.destroyed = true;
    }
}

export default HotKey;

export type DPlayerKeyMappingKeys = 32 | 37 | 39 | 38 | 40 | 27 | 70 | 87 | 77 | 83 | 68 | 65 | 76 | 86 | 67 | 78;

export type DPlayerKeyMappingValues =
    | 'togglePlayer'
    | 'left'
    | 'right'
    | 'up'
    | 'down'
    | 'stopPlayer'
    | 'toggleFullscreen'
    | 'toggleWebFullscreen'
    | 'cancelBothFullscreen'
    | 'mute'
    | 'screenshot'
    | 'nextChapter'
    | 'previousChapter'
    | 'changeLoop'
    | 'speedUp'
    | 'speedDown'
    | 'speedNormal';

export type DPlayerAdvancedKeyMappingKeys =
    | ' '
    | 'ArrowLeft'
    | 'ArrowRight'
    | 'ArrowUp'
    | 'ArrowDown'
    | 'Escape'
    | 'f'
    | 'w'
    | 'MediaPlayPause'
    | 'MediaStop'
    | 'AudioVolumeMute'
    | 'm'
    | 's'
    | 'MediaTrackPrevious'
    | 'MediaTrackNext'
    | 'd'
    | 'a'
    | 'l'
    | 'v'
    | 'c'
    | 'n';

export type DPlayerHotkeyHandler = (e: Event) => void;

export type DPlayerAdvancedKeyMapping = {
    [key in DPlayerAdvancedKeyMappingKeys]?: DPlayerKeyMappingValues;
};

export type DPlayerKeyMapping = {
    [key in DPlayerKeyMappingKeys]?: DPlayerKeyMappingValues;
};

export interface DPlayerHotkeysStorage {
    keys: DPlayerKeyMapping;
    advancedKeys: DPlayerAdvancedKeyMapping;
}

export interface DPlayerHotkeysStorageExport {
    enabled: DPlayerNamedKeys[];
    disabled: DPlayerNamedKeys[];
    all: DPlayerNamedKeys[];
}

export type DPlayerNamedKeys = {
    key: string;
    tooltip: DPlayerTranslateKey;
    keyCode: DPlayerKeyMappingKeys;
};
