import DPlayer from '.';
import { BUILD_TIME, DPLAYER_VERSION } from './global';
import Template from './template';

class InfoPanel {
    container: HTMLElement;
    template: Template;
    player: DPlayer;
    video: HTMLVideoElement;
    beginTime?: number;

    constructor(player: DPlayer) {
        this.container = player.template.infoPanel; // TODO(#38):  remove !
        this.template = player.template;
        this.video = player.video;
        this.player = player;

        this.template.infoPanelClose?.addEventListener('click', () => {
            this.hide();
        });
    }

    show(): void {
        this.beginTime = Date.now();
        this.update();
        this.player.timer.enable('info');
        this.player.timer.enable('fps');
        this.container.classList.remove('dplayer-info-panel-hide');
    }

    hide(): void {
        this.player.timer.disable('info');
        this.player.timer.disable('fps');
        this.container.classList.add('dplayer-info-panel-hide');
    }

    triggle(): void {
        if (this.container.classList.contains('dplayer-info-panel-hide')) {
            this.show();
        } else {
            this.hide();
        }
    }

    update(): void {
        this.template.infoVersion!.innerHTML = `v${DPLAYER_VERSION} ${BUILD_TIME}`;
        this.template.infoType!.innerHTML = this.player.type;
        this.template.infoUrl!.innerHTML = this.player.options.video.url;
        this.template.infoResolution!.innerHTML = `${this.player.video.videoWidth} x ${this.player.video.videoHeight}`;
        this.template.infoDuration!.innerHTML = this.player.video.duration;
        if (this.player.options.danmaku) {
            this.template.infoDanmakuId!.innerHTML = this.player.options.danmaku.id;
            this.template.infoDanmakuApi!.innerHTML = this.player.options.danmaku.api;
            this.template.infoDanmakuAmount!.innerHTML = this.player.danmaku.dan.length;
        }
    }

    fps(value: number): void {
        this.template.infoFPS!.innerHTML = `${value.toFixed(1)}`;
    }
}

export default InfoPanel;