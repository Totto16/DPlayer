import Keyboard from 'simple-keyboard';
import AllLayouts from 'simple-keyboard-layouts';

class HotkeyPanel {
    constructor(player) {
        this.container = player.template.hotkeyPanel;
        this.template = player.template;
        this.video = player.video;
        this.player = player;
        this.layout = this.getLayout();
        this.template.hotkeyPanelClose.addEventListener('click', () => {
            this.hide();
        });
        this.keyboard = new Keyboard({
            onChange: (input) => this.onChange(input),
            onKeyPress: (button) => this.onKeyPress(button),
            layout: this.layout,
        });
    }

    onChange(input) {
        document.querySelector('.input').value = input;
        console.log('Input changed', input);
    }

    onKeyPress(button) {
        console.log('Button pressed', button);
    }

    getLayout() {
        const tempLayouts = new AllLayouts();
        const code = this.player.languageFeatures.longCode;
        let layout = tempLayouts.get(code);
        console.log(layout);
        if (!layout) {
            layout = tempLayouts.get('english');
        }
        return layout.layout;
    }

    show() {
        this.update();
        this.container.classList.remove('dplayer-hotkey-panel-hide');
    }

    hide() {
        this.container.classList.add('dplayer-hotkey-panel-hide');
    }

    triggle() {
        if (this.container.classList.contains('dplayer-hotkey-panel-hide')) {
            this.show();
        } else {
            this.hide();
        }
    }

    update() {}
}

export default HotkeyPanel;
