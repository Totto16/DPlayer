import Keyboard from 'simple-keyboard';

class HotkeyPanel {
    constructor(player) {
        this.container = player.template.hotkeyPanel;
        this.template = player.template;
        this.video = player.video;
        this.player = player;
        this.layout = this.getLayout();
        this.hotkeys = this.player.hotkey.keys();
        this.template.hotkeyPanelClose.addEventListener('click', () => {
            this.hide();
        });

        const all = Array.from(document.getElementsByClassName('simple-keyboard'));
        const keyboard = all[all.length - 1];
        const name = `keyboard-hotkey-visualizer-${all.length}`;
        keyboard.classList.add(name);
        keyboard.classList.remove('simple-keyboard');

        const btThemes = [
            {
                class: 'constant-width',
                buttons: '{insert} {home} {pageup} {delete} {end} {pagedown} {whitespace} {arrowup} {arrowleft} {arrowdown} {arrowright}',
            },
        ];
        if (this.hotkeys.enabled.length > 0) {
            btThemes.push({
                class: 'shortcuts-enabled',
                buttons: this.hotkeys.enabled.map((obj) => obj.key).join(' '),
            });
        }
        if (this.hotkeys.disabled.length > 0) {
            btThemes.push({
                class: 'shortcuts-disabled',
                buttons: this.hotkeys.disabled.map((obj) => obj.key).join(' '),
            });
        }

        this.keyboard = new Keyboard(`.${name}`, {
            layout: this.layout,
            display: {
                '{altgreek}': 'Alt Gr',
                '{control}': 'Ctrl',
                '{OS}': 'OS',
                '{whitespace}': '\u0000',
                '{border}': '\u0000',
                '{home': '',
                '{function}': 'Fn',
                '{enter}': '\u23ce',
                '{enter2}': 'enter',
                '{space}': '\u2423',
                '{bksp}': '\u2190',
                '{tab}': '\u21b9',
                '{lock}': '\u21EA',
                '{shiftleft}': '\u21E7',
                '{shift}': '\u21E7',
            },
            theme: 'simple-keyboard hg-theme-default hg-layout-default',
            mergeDisplay: true,
            buttonAttributes: [
                ...this.hotkeys.all.map((obj) => ({
                    attribute: 'title',
                    value: this.player.translate(obj.tooltip),
                    buttons: obj.key,
                })),
                /*      ...this.hotkeys.map((obj) => ({
                    attribute: 'aria-label',
                    value: this.player.translate(obj.tooltip),
                    buttons: obj.key,
                })),
                ...this.hotkeys.map((obj) => ({
                    attribute: 'data-balloon-pos',
                    value:  'up',
                    buttons: obj.key,
                })), */ // Looks Better, but has problems with overflow-hidden
                ...this.hotkeys.all.map((obj) => ({
                    attribute: 'data-keyCode',
                    value: `${obj.keyCode}`,
                    buttons: obj.key,
                })),
            ],
            buttonTheme: [...btThemes],
            useButtonTag: false,
            inputPattern: new RegExp(`[${this.hotkeys.enabled.map((obj) => obj.key).join('')}]`),
            baseClass: name,
        });
    }

    getLayout() {
        const layout = {
            default: [
                '` 1 2 3 4 5 6 7 8 9 0 - = {bksp} {border} {insert} {home} {pageup}',
                '{tab} q w e r t y u i o p [ ] {enter} {border} {delete} {end} {pagedown}',
                "{lock} a s d f g h j k l ; ' {enter2} {border} {whitespace} {whitespace} {whitespace}",
                '{shiftleft} z x c v b n m , . / {shift} {border} {whitespace} {arrowup} {whitespace}',
                '{control} {OS} {alt} {space} {altgreek} {function} {control} {border} {arrowleft} {arrowdown} {arrowright}',
            ],
        };
        return layout;
    }

    show() {
        this.visible = true;
        this.container.classList.remove('dplayer-hotkey-panel-hide');
    }
    parse(keyCode) {
        if (this.visible) {
            const all = Array.from(this.container.getElementsByClassName('shortcuts-enabled'));
            all.forEach((div) => {
                const child = parseInt(div.getAttribute('data-keyCode'));
                if (child === keyCode) {
                    div.animate([{ backgroundColor: 'var(--dplayer-simple-keyboard-keys-bk-available)' }, { backgroundColor: 'var(--dplayer-simple-keyboard-keys-bk-pressed)' }], 150);
                }
            });
        }
    }
    hide() {
        this.visible = false;
        this.container.classList.add('dplayer-hotkey-panel-hide');
    }

    triggle() {
        if (this.container.classList.contains('dplayer-hotkey-panel-hide')) {
            this.show();
        } else {
            this.hide();
        }
    }
    destroy() {
        this.keyboard.destroy();
        this.destroyed = true;
    }
}

export default HotkeyPanel;
