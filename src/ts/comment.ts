import DPlayer from '.';
import utils from './utils';

class Comment {
    player: DPlayer;
    constructor(player: DPlayer) {
        this.player = player;

        this.player.template.mask.addEventListener('click', () => {
            this.hide();
        });
        this.player.template.commentButton.addEventListener('click', () => {
            this.show();
        });
        this.player.template.commentSettingButton.addEventListener('click', () => {
            this.toggleSetting();
        });

        this.player.template.commentColorSettingBox.addEventListener('click', () => {
            const sele: HTMLElement | null = this.player.template.commentColorSettingBox.querySelector<HTMLInputElement>('input:checked+span');
            if (typeof sele !== 'undefined') {
                const colorElem: HTMLElement | null = this.player.template.commentColorSettingBox.querySelector<HTMLInputElement>('input:checked');
                const color: string = colorElem ? colorElem.getAttribute('value') ?? '#fff' : '#fff'; // TODO: use the default (white) option instead of hardcoding it
                this.player.template.commentSettingFill.style.fill = color;
                this.player.template.commentInput.style.color = color;
                this.player.template.commentSendFill.style.fill = color;
            }
        });

        this.player.template.commentInput.addEventListener('click', () => {
            this.hideSetting();
        });
        this.player.template.commentInput.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.keyCode === 13) {
                // `Enter` Keycode
                this.send();
            }
        });

        this.player.template.commentSendButton?.addEventListener('click', () => {
            this.send();
        });
    }

    show(): void {
        this.player.controller.disableAutoHide = true;
        this.player.template.controller.classList.add('dplayer-controller-comment');
        this.player.template.mask.classList.add('dplayer-mask-show');
        this.player.container.classList.add('dplayer-show-controller');
        this.player.template.commentInput.focus();
    }

    hide(): void {
        this.player.template.controller.classList.remove('dplayer-controller-comment');
        this.player.template.mask.classList.remove('dplayer-mask-show');
        this.player.container.classList.remove('dplayer-show-controller');
        this.player.controller.disableAutoHide = false;
        this.hideSetting();
    }

    showSetting(): void {
        this.player.template.commentSettingBox.classList.add('dplayer-comment-setting-open');
    }

    hideSetting(): void {
        this.player.template.commentSettingBox.classList.remove('dplayer-comment-setting-open');
    }

    toggleSetting(): void {
        if (this.player.template.commentSettingBox.classList.contains('dplayer-comment-setting-open')) {
            this.hideSetting();
        } else {
            this.showSetting();
        }
    }

    send(): void {
        this.player.template.commentInput.blur();

        // text can't be empty
        if (!this.player.template.commentInput.value.replace(/^\s+|\s+$/g, '')) {
            this.player.notice(this.player.translate('please-input-danmaku'));
            return;
        }

        this.player.danmaku.send(
            {
                text: this.player.template.commentInput.value,
                color: utils.color2Number(this.player.container.querySelector('.dplayer-comment-setting-color input:checked').value),
                type: parseInt(this.player.container.querySelector('.dplayer-comment-setting-type input:checked').value),
            },
            () => {
                this.player.template.commentInput.value = '';
                this.hide();
            }
        );
    }
}

export default Comment;
