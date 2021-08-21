class HotKey {
    constructor(player) {
        this.player = player;
        this.doHotKeyHandler = this.doHotKey.bind(this);
        if (this.player.options.hotkey) {
            document.addEventListener('keydown', this.doHotKeyHandler);
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
                    case 'cancelFullscreen':
                        // cancel fullscreen
                        event.preventDefault();
                        if (this.player.fullScreen.isFullScreen()) {
                            this.player.fullScreen.cancel();
                        }
                        break;
                    case 'toggleFullscreen':
                        // toggle Fullscreen
                        event.preventDefault();
                        this.player.fullScreen.toggle();
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
                }
            }
        }
    }

    key(event) {
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

    keys() {
        const Shortcuts = [];
        for (let i = 32; i <= 90; i++) {
            const rep_key = this.key({ keyCode: i });
            if (rep_key) {
                const key = String.fromCharCode(i).toLowerCase().replace(' ', '{space}').replace('%', '{arrowleft}').replace('&', '{arrowup}').replace("'", '{arrowright}').replace('(', '{arrowdown}');

                Shortcuts.push({ key, tooltip: rep_key, keyCode: i });
            }
        }
        return Shortcuts;
    }

    destroy() {
        if (this.player.options.hotkey) {
            document.removeEventListener('keydown', this.doHotKeyHandler);
        }
        document.removeEventListener('keydown', this.cancelFullScreenHandler);
    }
}

export default HotKey;
