import Icons from './icons';
import tplPlayer from '../template/player.art';
// import * as tplPlayer from '../template/player.art';
import utils from './utils';
import DPlayer, { DPlayerDestroyable } from '.';
import { DPlayerOptions } from './options';
import { DPLayerTranslateFunction, DPlayerTranslateKey } from './i18n';
import { DPlayerBalloonHTML, DPlayerBalloonPosition } from './player';

class Template implements DPlayerDestroyable {
    // TODO see if that DPlayerDestroyable is useful
    player: DPlayer;
    container: HTMLElement;
    options: DPlayerOptions;
    index: number;
    translate: DPLayerTranslateFunction;

    volumeBar!: HTMLDivElement | null;
    volumeBarWrap!: HTMLDivElement | null;
    volumeBarWrapWrap!: HTMLDivElement | null;
    volumeButton!: HTMLDivElement | null;
    volumeButtonIcon!: HTMLDivElement | null;
    volumeIcon!: HTMLButtonElement | null;
    playedBar!: HTMLDivElement | null;
    loadedBar!: HTMLDivElement | null;
    playedBarWrap!: HTMLDivElement | null;
    barHighlight!: NodeListOf<HTMLDivElement> | null;
    barHighlightTop!: NodeListOf<HTMLDivElement> | null;
    playedBarTime!: HTMLDivElement | null;
    topChapterDiv!: HTMLDivElement | null;
    barInfoDiv!: HTMLDivElement | null;
    danmaku!: HTMLDivElement | null;
    danmakuLoading!: HTMLSpanElement | null;
    video!: HTMLVideoElement | null;
    bezel!: HTMLSpanElement | null;
    playButton!: HTMLButtonElement | null;
    mobilePlayButton!: HTMLButtonElement | null;
    videoWrap!: HTMLDivElement | null;
    controllerMask!: HTMLDivElement | null;
    ptime!: HTMLSpanElement | null;
    settingButton!: HTMLButtonElement | null;
    settingBox!: HTMLDivElement | null;
    mask!: HTMLDivElement | null;
    loop!: HTMLDivElement | null;
    loopToggle!: HTMLDivElement | null;
    showDanmaku!: HTMLDivElement | null;
    showDanmakuToggle!: HTMLInputElement | null;
    unlimitDanmaku!: HTMLDivElement | null;
    unlimitDanmakuToggle!: HTMLInputElement | null;
    speed!: HTMLDivElement | null;
    speedItem!: NodeListOf<HTMLDivElement> | null;
    danmakuOpacityBar!: HTMLDivElement | null;
    danmakuOpacityBarWrap!: HTMLDivElement | null;
    danmakuOpacityBarWrapWrap!: HTMLDivElement | null;
    danmakuOpacityBox!: HTMLDivElement | null;
    dtime!: HTMLSpanElement | null;
    controller!: HTMLDivElement | null;
    commentInput!: HTMLInputElement | null;
    commentButton!: HTMLButtonElement | null;
    commentSettingBox!: HTMLDivElement | null;
    commentSettingButton!: HTMLButtonElement | null;
    commentSettingFill!: SVGMPathElement | null;
    commentSendButton!: HTMLButtonElement | null;
    commentSendFill!: SVGMPathElement | null;
    commentColorSettingBox!: HTMLDivElement | null;
    browserFullButton!: HTMLButtonElement | null;
    webFullButton!: HTMLButtonElement | null;
    menu!: HTMLDivElement | null;
    menuItem!: NodeListOf<HTMLDivElement> | null;
    qualityList!: HTMLDivElement | null;
    cameraButton!: HTMLDivElement | null;
    airplayButton!: HTMLDivElement | null;
    chromecastButton!: HTMLDivElement | null;
    subtitleButton!: HTMLButtonElement | null;
    subtitleButtonInner!: HTMLSpanElement | null;
    subtitle!: HTMLDivElement | null;
    qualityButton!: HTMLButtonElement | null;
    barPreview!: HTMLDivElement | null;
    barWrap!: HTMLDivElement | null;
    noticeList!: HTMLDivElement | null;
    skipWindow!: HTMLDivElement | null;
    infoPanel!: HTMLDivElement | null;
    infoPanelClose!: HTMLDivElement | null;
    hotkeyPanel!: HTMLDivElement | null;
    hotkeyPanelClose!: HTMLDivElement | null;
    infoVersion!: HTMLSpanElement | null;
    infoFPS!: HTMLSpanElement | null;
    infoType!: HTMLSpanElement | null;
    infoUrl!: HTMLSpanElement | null;
    infoResolution!: HTMLSpanElement | null;
    infoDuration!: HTMLSpanElement | null;
    infoDanmakuId!: HTMLSpanElement | null;
    infoDanmakuApi!: HTMLSpanElement | null;
    infoDanmakuAmount!: HTMLSpanElement | null;

    constructor(options: DPlayerTemplateOptions) {
        this.container = options.container;
        this.options = options.options;
        this.player = options.player;
        this.index = options.index;
        this.translate = options.translate;
        this.init();
        if (!this.checkTemplate()) {
            console.error('[FATAL] Error in retrieving Needed HTML Elements from Template, this is an internal BUG! Please report this!');
        }
    }

    checkTemplate(): boolean {
        return isOfTypeAndNotNull<Template>(this);
    }

    init(): void {
        this.container.innerHTML = (tplPlayer as DPlayerARTInitializeFunction)({
            options: this.options,
            index: this.index,
            translate: this.translate,
            balloon: (a: DPlayerTranslateKey, b: DPlayerBalloonPosition): DPlayerBalloonHTML => this.player.balloon.call(this.player, a, b),
            icons: Icons,
            mobile: utils.isMobile,
            video: {
                current: true,
                pic: this.options.video.pic,
                screenshot: this.options.screenshot,
                airplay: this.options.airplay,
                chromecast: this.options.chromecast,
                preload: this.options.preload,
                url: this.options.video.url,
                subtitle: this.options.subtitle,
            },
        }); // TODO change

        this.volumeBar = this.container.querySelector('.dplayer-volume-bar-inner');
        this.volumeBarWrap = this.container.querySelector('.dplayer-volume-bar');
        this.volumeBarWrapWrap = this.container.querySelector('.dplayer-volume-bar-wrap');
        this.volumeButton = this.container.querySelector('.dplayer-volume');
        this.volumeButtonIcon = this.container.querySelector('.dplayer-volume-icon');
        this.volumeIcon = this.container.querySelector('.dplayer-volume-icon .dplayer-icon-content');
        this.playedBar = this.container.querySelectorAll('.dplayer-played');
        this.loadedBar = this.container.querySelector('.dplayer-loaded');
        this.playedBarWrap = this.container.querySelector('.dplayer-bar-wrap');
        this.barHighlight = this.playedBarWrap?.querySelectorAll('.dplayer-highlight') ?? null;
        this.barHighlightTop = this.playedBarWrap?.querySelectorAll('.dplayer-highlight-top') ?? null;
        this.playedBarTime = this.container.querySelector('.dplayer-bar-time');
        this.topChapterDiv = this.container.querySelector('.dplayer-thumb-text');
        this.barInfoDiv = this.container.querySelector('.dplayer-info-div');
        this.danmaku = this.container.querySelector('.dplayer-danmaku');
        this.danmakuLoading = this.container.querySelector('.dplayer-danloading');
        this.video = this.container.querySelector('.dplayer-video-current');
        this.bezel = this.container.querySelector('.dplayer-bezel-icon');
        this.playButton = this.container.querySelector('.dplayer-play-icon');
        this.mobilePlayButton = this.container.querySelector('.dplayer-mobile-play');
        this.videoWrap = this.container.querySelector('.dplayer-video-wrap');
        this.controllerMask = this.container.querySelector('.dplayer-controller-mask');
        this.ptime = this.container.querySelector('.dplayer-ptime');
        this.settingButton = this.container.querySelector('.dplayer-setting-icon');
        this.settingBox = this.container.querySelector('.dplayer-setting-box');
        this.mask = this.container.querySelector('.dplayer-mask');
        this.loop = this.container.querySelector('.dplayer-setting-loop');
        this.loopToggle = this.container.querySelector('.dplayer-setting-loop .dplayer-toggle-setting-input');
        this.showDanmaku = this.container.querySelector('.dplayer-setting-showdan');
        this.showDanmakuToggle = this.container.querySelector('.dplayer-showdan-setting-input');
        this.unlimitDanmaku = this.container.querySelector('.dplayer-setting-danunlimit');
        this.unlimitDanmakuToggle = this.container.querySelector('.dplayer-danunlimit-setting-input');
        this.speed = this.container.querySelector('.dplayer-setting-speed');
        this.speedItem = this.container.querySelectorAll('.dplayer-setting-speed-item');
        this.danmakuOpacityBar = this.container.querySelector('.dplayer-danmaku-bar-inner');
        this.danmakuOpacityBarWrap = this.container.querySelector('.dplayer-danmaku-bar');
        this.danmakuOpacityBarWrapWrap = this.container.querySelector('.dplayer-danmaku-bar-wrap');
        this.danmakuOpacityBox = this.container.querySelector('.dplayer-setting-danmaku');
        this.dtime = this.container.querySelector('.dplayer-dtime');
        this.controller = this.container.querySelector('.dplayer-controller');
        this.commentInput = this.container.querySelector('.dplayer-comment-input');
        this.commentButton = this.container.querySelector('.dplayer-comment-icon');
        this.commentSettingBox = this.container.querySelector('.dplayer-comment-setting-box');
        this.commentSettingButton = this.container.querySelector('.dplayer-comment-setting-icon');
        this.commentSettingFill = this.container.querySelector('.dplayer-comment-setting-icon path');
        this.commentSendButton = this.container.querySelector('.dplayer-send-icon');
        this.commentSendFill = this.container.querySelector('.dplayer-send-icon path');
        this.commentColorSettingBox = this.container.querySelector('.dplayer-comment-setting-color');
        this.browserFullButton = this.container.querySelector('.dplayer-full-icon');
        this.webFullButton = this.container.querySelector('.dplayer-full-in-icon');
        this.menu = this.container.querySelector('.dplayer-menu');
        this.menuItem = this.container.querySelectorAll('.dplayer-menu-item');
        this.qualityList = this.container.querySelector('.dplayer-quality-list');
        this.cameraButton = this.container.querySelector('.dplayer-camera-icon');
        this.airplayButton = this.container.querySelector('.dplayer-airplay-icon');
        this.chromecastButton = this.container.querySelector('.dplayer-chromecast-icon');
        this.subtitleButton = this.container.querySelector('.dplayer-subtitle-icon');
        this.subtitleButtonInner = this.container.querySelector('.dplayer-subtitle-icon .dplayer-icon-content');
        this.subtitle = this.container.querySelector('.dplayer-subtitle');
        this.qualityButton = this.container.querySelector('.dplayer-quality-icon');
        this.barPreview = this.container.querySelector('.dplayer-bar-preview');
        this.barWrap = this.container.querySelector('.dplayer-bar-wrap');
        this.noticeList = this.container.querySelector('.dplayer-notice-list');
        this.skipWindow = this.container.querySelector('.dplayer-skip-window');
        this.infoPanel = this.container.querySelector('.dplayer-info-panel');
        this.infoPanelClose = this.container.querySelector('.dplayer-info-panel-close');
        this.hotkeyPanel = this.container.querySelector('.dplayer-hotkey-panel');
        this.hotkeyPanelClose = this.container.querySelector('.dplayer-hotkey-panel-close');
        this.infoVersion = this.container.querySelector('.dplayer-info-panel-item-version .dplayer-info-panel-item-data');
        this.infoFPS = this.container.querySelector('.dplayer-info-panel-item-fps .dplayer-info-panel-item-data');
        this.infoType = this.container.querySelector('.dplayer-info-panel-item-type .dplayer-info-panel-item-data');
        this.infoUrl = this.container.querySelector('.dplayer-info-panel-item-url .dplayer-info-panel-item-data');
        this.infoResolution = this.container.querySelector('.dplayer-info-panel-item-resolution .dplayer-info-panel-item-data');
        this.infoDuration = this.container.querySelector('.dplayer-info-panel-item-duration .dplayer-info-panel-item-data');
        this.infoDanmakuId = this.container.querySelector('.dplayer-info-panel-item-danmaku-id .dplayer-info-panel-item-data');
        this.infoDanmakuApi = this.container.querySelector('.dplayer-info-panel-item-danmaku-api .dplayer-info-panel-item-data');
        this.infoDanmakuAmount = this.container.querySelector('.dplayer-info-panel-item-danmaku-amount .dplayer-info-panel-item-data');
        // TODO add buttons for previous and next chapters!!!!! ( in inithighlight)
    }
    static NewNotice(options: DPlayerNoticeOptions): HTMLDivElement {
        const { text, opacity, mode, type, DontAnimate } = options;
        const notice = document.createElement('div');
        notice.classList.add('dplayer-notice');
        notice.style.opacity = opacity.toString();
        notice.innerText = text;
        if (DontAnimate) {
            notice.classList.add('dont_animate');
        }
        notice.setAttribute('mode', mode);
        notice.setAttribute('type', type);
        return notice;
    }

    destroy(): void {
        // TODO maybe do something, maybe not!
    }
}

export default Template;

export type DPlayerNoticeModes = 'override' | 'normal';

export type DPlayerNoticeTypes = 'normal' | string; // for the moment, since this can vary!

export interface DPlayerNoticeOptions {
    text: string;
    opacity: number;
    mode: DPlayerNoticeModes;
    type: DPlayerNoticeTypes;
    DontAnimate: boolean;
}

export type DPlayerTemplateElements = {
    [elementName in DPlayerTemplateElementNames]: HTMLElement;
};

export type DPlayerTemplateElementNames =
    | 'volumeBar'
    | 'volumeBarWrap'
    | 'volumeBarWrapWrap'
    | 'volumeButton'
    | 'volumeButtonIcon'
    | 'volumeIcon'
    | 'playedBar'
    | 'loadedBar'
    | 'playedBarWrap'
    | 'barHighlight'
    | 'barHighlightTop'
    | 'playedBarTime'
    | 'topChapterDiv'
    | 'barInfoDiv'
    | 'danmaku'
    | 'danmakuLoading'
    | 'video'
    | 'bezel'
    | 'playButton'
    | 'mobilePlayButton'
    | 'videoWrap'
    | 'controllerMask'
    | 'ptime'
    | 'settingButton'
    | 'settingBox'
    | 'mask'
    | 'loop'
    | 'loopToggle'
    | 'showDanmaku'
    | 'showDanmakuToggle'
    | 'unlimitDanmaku'
    | 'unlimitDanmakuToggle'
    | 'speed'
    | 'speedItem'
    | 'danmakuOpacityBar'
    | 'danmakuOpacityBarWrap'
    | 'danmakuOpacityBarWrapWrap'
    | 'danmakuOpacityBox'
    | 'dtime'
    | 'controller'
    | 'commentInput'
    | 'commentButton'
    | 'commentSettingBox'
    | 'commentSettingButton'
    | 'commentSettingFill'
    | 'commentSendButton'
    | 'commentSendFill'
    | 'commentColorSettingBox'
    | 'browserFullButton'
    | 'webFullButton'
    | 'menu'
    | 'menuItem'
    | 'qualityList'
    | 'cameraButton'
    | 'airplayButton'
    | 'chromecastButton'
    | 'subtitleButton'
    | 'subtitleButtonInner'
    | 'subtitle'
    | 'qualityButton'
    | 'barPreview'
    | 'barWrap'
    | 'noticeList'
    | 'skipWindow'
    | 'infoPanel'
    | 'infoPanelClose'
    | 'hotkeyPanel'
    | 'hotkeyPanelClose'
    | 'infoVersion'
    | 'infoFPS'
    | 'infoType'
    | 'infoUrl'
    | 'infoResolution'
    | 'infoDuration'
    | 'infoDanmakuId'
    | 'infoDanmakuApi'
    | 'infoDanmakuAmount';

export interface DPlayerTemplateOptions {
    player: DPlayer;
    container: HTMLElement;
    options: DPlayerOptions;
    index: number;
    translate: DPLayerTranslateFunction;
}

export type DPlayerARTInitializeFunction = (options: DplayerARTOptions) => string;

export type DplayerARTOptions = {
    [x: string]: unknown;
};

function isOfTypeAndNotNull<T>(arg0: this): boolean {
    throw new Error('Function not implemented.');
}
