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
        this.keyboard = new Keyboard({
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
            mergeDisplay: true,
            buttonAttributes: [
                ...this.hotkeys.map((obj) => ({
                    attribute: 'title',
                    value: this.player.tran(obj.tooltip),
                    buttons: obj.key,
                })),
                ...this.hotkeys.map((obj) => ({
                    attribute: 'data-keyCode',
                    value: `${obj.keyCode}`,
                    buttons: obj.key,
                })),
            ],
            buttonTheme: [
                {
                    class: 'shortcuts-enabled',
                    buttons: this.hotkeys.map((obj) => obj.key).join(' '),
                },
                {
                    class: 'constant-width',
                    buttons: '{insert} {home} {pageup} {delete} {end} {pagedown} {whitespace} {arrowup} {arrowleft} {arrowdown} {arrowright}',
                },
            ],
            useButtonTag: false,
            inputPattern: new RegExp(`[${this.hotkeys.map((obj) => obj.key).join('')}]`),
            baseClass: 'keyboard-hotkey-visualizer',
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
                    console.log(div);
                    div.animate(
                        [
                            {
                                'background-color': '#00ff10',
                            },
                            {
                                'background-color': '#00b7ff',
                            },
                        ],
                        2000
                    );
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
}

export default HotkeyPanel;
