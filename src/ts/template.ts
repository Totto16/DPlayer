import Icons from './icons';
import tplPlayer from '../template/player.art';
// import * as tplPlayer from '../template/player.art';
import utils from './utils';
import DPlayer, { DPlayerDestroyable } from '.';
import { DPlayerOptions } from './options';
import { DPLayerTranslateFunction, DPlayerTranslateKey } from './i18n';
import { DPlayerBalloonHTML, DPlayerBalloonPosition } from './player';

class Template implements DPlayerDestroyable {
    // TODO(#55):  see if that DPlayerDestroyable is useful
    player: DPlayer;
    container: HTMLElement;
    options: DPlayerOptions;
    index: number;
    translate: DPLayerTranslateFunction;

    // its assured that those exist and are not null, empty, if not the constructor throws an Error!
    volumeBar!: HTMLDivElement;
    volumeBarWrap!: HTMLDivElement;
    volumeBarWrapWrap!: HTMLDivElement;
    volumeButton!: HTMLDivElement;
    volumeButtonIcon!: HTMLDivElement;
    volumeIcon!: HTMLButtonElement;
    playedBar!: HTMLDivElement;
    loadedBar!: HTMLDivElement;
    playedBarWrap!: HTMLDivElement;
    barHighlight!: NodeListOf<HTMLDivElement>;
    barHighlightTop!: NodeListOf<HTMLDivElement>;
    playedBarTime!: HTMLDivElement;
    topChapterDiv!: HTMLDivElement;
    barInfoDiv!: HTMLDivElement;
    danmaku!: HTMLDivElement;
    danmakuLoading!: HTMLSpanElement;
    video!: HTMLVideoElement;
    bezel!: HTMLSpanElement;
    playButton!: HTMLButtonElement;
    mobilePlayButton!: HTMLButtonElement;
    videoWrap!: HTMLDivElement;
    controllerMask!: HTMLDivElement;
    ptime!: HTMLSpanElement;
    settingButton!: HTMLButtonElement;
    settingBox!: HTMLDivElement;
    mask!: HTMLDivElement;
    loop!: HTMLDivElement;
    loopToggle!: HTMLDivElement;
    showDanmaku!: HTMLDivElement;
    showDanmakuToggle!: HTMLInputElement;
    unlimitDanmaku!: HTMLDivElement;
    unlimitDanmakuToggle!: HTMLInputElement;
    speed!: HTMLDivElement;
    speedItem!: NodeListOf<HTMLDivElement>;
    danmakuOpacityBar!: HTMLDivElement;
    danmakuOpacityBarWrap!: HTMLDivElement;
    danmakuOpacityBarWrapWrap!: HTMLDivElement;
    danmakuOpacityBox!: HTMLDivElement;
    dtime!: HTMLSpanElement;
    controller!: HTMLDivElement;
    commentInput!: HTMLInputElement;
    commentButton!: HTMLButtonElement;
    commentSettingBox!: HTMLDivElement;
    commentSettingButton!: HTMLButtonElement;
    commentSettingFill!: SVGMPathElement;
    commentSendButton!: HTMLButtonElement;
    commentSendFill!: SVGMPathElement;
    commentColorSettingBox!: HTMLDivElement;
    browserFullButton!: HTMLButtonElement;
    webFullButton!: HTMLButtonElement;
    menu!: HTMLDivElement;
    menuItem!: NodeListOf<HTMLDivElement>;
    qualityList!: HTMLDivElement;
    cameraButton!: HTMLDivElement;
    airplayButton!: HTMLDivElement;
    chromecastButton!: HTMLDivElement;
    subtitleButton!: HTMLButtonElement;
    subtitleButtonInner!: HTMLSpanElement;
    subtitle!: HTMLDivElement;
    qualityButton!: HTMLButtonElement;
    barPreview!: HTMLDivElement;
    barWrap!: HTMLDivElement;
    noticeList!: HTMLDivElement;
    skipWindow!: HTMLDivElement;
    infoPanel!: HTMLDivElement;
    infoPanelClose!: HTMLDivElement;
    hotkeyPanel!: HTMLDivElement;
    hotkeyPanelClose!: HTMLDivElement;
    infoVersion!: HTMLSpanElement;
    infoFPS!: HTMLSpanElement;
    infoType!: HTMLSpanElement;
    infoUrl!: HTMLSpanElement;
    infoResolution!: HTMLSpanElement;
    infoDuration!: HTMLSpanElement;
    infoDanmakuId!: HTMLSpanElement;
    infoDanmakuApi!: HTMLSpanElement;
    infoDanmakuAmount!: HTMLSpanElement;

    /**
     * @throws {Error}
     */
    constructor(options: DPlayerTemplateOptions) {
        this.container = options.container;
        this.options = options.options;
        this.player = options.player;
        this.index = options.index;
        this.translate = options.translate;
        try {
            this.init();
        } catch (err) {
            console.error('[FATAL] Error in retrieving Needed HTML Elements from Template, this is (probably) an internal BUG! Please report this!');
            throw new Error("Couldn't initialize the Templates Needed!");
        }
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
                pic: this.options.video?.pic,
                screenshot: this.options.screenshot,
                airplay: this.options.airplay,
                chromecast: this.options.chromecast,
                preload: this.options.preload,
                url: this.options.video?.url,
                subtitle: this.options.subtitle,
            },
        }); // TODO(#56):  change

        this.volumeBar = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-volume-bar-inner');
        this.volumeBarWrap = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-volume-bar');
        this.volumeBarWrapWrap = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-volume-bar-wrap');
        this.volumeButton = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-volume');
        this.volumeButtonIcon = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-volume-icon');
        this.volumeIcon = this.#saveQuerySelector<HTMLButtonElement>(this.container, '.dplayer-volume-icon .dplayer-icon-content');
        this.playedBar = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-played');
        this.loadedBar = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-loaded');
        this.playedBarWrap = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-bar-wrap');
        this.barHighlight = this.#saveQuerySelectorAll<HTMLDivElement>(this.playedBarWrap, '.dplayer-highlight');
        this.barHighlightTop = this.#saveQuerySelectorAll<HTMLDivElement>(this.playedBarWrap, '.dplayer-highlight-top');
        this.playedBarTime = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-bar-time');
        this.topChapterDiv = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-thumb-text');
        this.barInfoDiv = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-info-div');
        this.danmaku = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-danmaku');
        this.danmakuLoading = this.#saveQuerySelector<HTMLSpanElement>(this.container, '.dplayer-danloading');
        this.video = this.#saveQuerySelector<HTMLVideoElement>(this.container, '.dplayer-video-current');
        this.bezel = this.#saveQuerySelector<HTMLSpanElement>(this.container, '.dplayer-bezel-icon');
        this.playButton = this.#saveQuerySelector<HTMLButtonElement>(this.container, '.dplayer-play-icon');
        this.mobilePlayButton = this.#saveQuerySelector<HTMLButtonElement>(this.container, '.dplayer-mobile-play');
        this.videoWrap = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-video-wrap');
        this.controllerMask = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-controller-mask');
        this.ptime = this.#saveQuerySelector<HTMLSpanElement>(this.container, '.dplayer-ptime');
        this.settingButton = this.#saveQuerySelector<HTMLButtonElement>(this.container, '.dplayer-setting-icon');
        this.settingBox = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-setting-box');
        this.mask = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-mask');
        this.loop = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-setting-loop');
        this.loopToggle = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-setting-loop .dplayer-toggle-setting-input');
        this.showDanmaku = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-setting-showdan');
        this.showDanmakuToggle = this.#saveQuerySelector<HTMLInputElement>(this.container, '.dplayer-showdan-setting-input');
        this.unlimitDanmaku = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-setting-danunlimit');
        this.unlimitDanmakuToggle = this.#saveQuerySelector<HTMLInputElement>(this.container, '.dplayer-danunlimit-setting-input');
        this.speed = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-setting-speed');
        this.speedItem = this.#saveQuerySelectorAll<HTMLDivElement>(this.container, '.dplayer-setting-speed-item');
        this.danmakuOpacityBar = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-danmaku-bar-inner');
        this.danmakuOpacityBarWrap = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-danmaku-bar');
        this.danmakuOpacityBarWrapWrap = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-danmaku-bar-wrap');
        this.danmakuOpacityBox = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-setting-danmaku');
        this.dtime = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-dtime');
        this.controller = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-controller');
        this.commentInput = this.#saveQuerySelector<HTMLInputElement>(this.container, '.dplayer-comment-input');
        this.commentButton = this.#saveQuerySelector<HTMLButtonElement>(this.container, '.dplayer-comment-icon');
        this.commentSettingBox = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-comment-setting-box');
        this.commentSettingButton = this.#saveQuerySelector<HTMLButtonElement>(this.container, '.dplayer-comment-setting-icon');
        this.commentSettingFill = this.#saveQuerySelector<SVGMPathElement>(this.container, '.dplayer-comment-setting-icon path');
        this.commentSendButton = this.#saveQuerySelector<HTMLButtonElement>(this.container, '.dplayer-send-icon');
        this.commentSendFill = this.#saveQuerySelector<SVGMPathElement>(this.container, '.dplayer-send-icon path');
        this.commentColorSettingBox = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-comment-setting-color');
        this.browserFullButton = this.#saveQuerySelector<HTMLButtonElement>(this.container, '.dplayer-full-icon');
        this.webFullButton = this.#saveQuerySelector<HTMLButtonElement>(this.container, '.dplayer-full-in-icon');
        this.menu = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-menu');
        this.menuItem = this.#saveQuerySelectorAll<HTMLDivElement>(this.container, '.dplayer-menu-item');
        this.qualityList = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-quality-list');
        this.cameraButton = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-camera-icon');
        this.airplayButton = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-airplay-icon');
        this.chromecastButton = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-chromecast-icon');
        this.subtitleButton = this.#saveQuerySelector<HTMLButtonElement>(this.container, '.dplayer-subtitle-icon');
        this.subtitleButtonInner = this.#saveQuerySelector<HTMLSpanElement>(this.container, '.dplayer-subtitle-icon .dplayer-icon-content');
        this.subtitle = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-subtitle');
        this.qualityButton = this.#saveQuerySelector<HTMLButtonElement>(this.container, '.dplayer-quality-icon');
        this.barPreview = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-bar-preview');
        this.barWrap = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-bar-wrap');
        this.noticeList = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-notice-list');
        this.skipWindow = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-skip-window');
        this.infoPanel = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-info-panel');
        this.infoPanelClose = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-info-panel-close');
        this.hotkeyPanel = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-hotkey-panel');
        this.hotkeyPanelClose = this.#saveQuerySelector<HTMLDivElement>(this.container, '.dplayer-hotkey-panel-close');
        this.infoVersion = this.#saveQuerySelector<HTMLSpanElement>(this.container, '.dplayer-info-panel-item-version .dplayer-info-panel-item-data');
        this.infoFPS = this.#saveQuerySelector<HTMLSpanElement>(this.container, '.dplayer-info-panel-item-fps .dplayer-info-panel-item-data');
        this.infoType = this.#saveQuerySelector<HTMLSpanElement>(this.container, '.dplayer-info-panel-item-type .dplayer-info-panel-item-data');
        this.infoUrl = this.#saveQuerySelector<HTMLSpanElement>(this.container, '.dplayer-info-panel-item-url .dplayer-info-panel-item-data');
        this.infoResolution = this.#saveQuerySelector<HTMLSpanElement>(this.container, '.dplayer-info-panel-item-resolution .dplayer-info-panel-item-data');
        this.infoDuration = this.#saveQuerySelector<HTMLSpanElement>(this.container, '.dplayer-info-panel-item-duration .dplayer-info-panel-item-data');
        this.infoDanmakuId = this.#saveQuerySelector<HTMLSpanElement>(this.container, '.dplayer-info-panel-item-danmaku-id .dplayer-info-panel-item-data');
        this.infoDanmakuApi = this.#saveQuerySelector<HTMLSpanElement>(this.container, '.dplayer-info-panel-item-danmaku-api .dplayer-info-panel-item-data');
        this.infoDanmakuAmount = this.#saveQuerySelector<HTMLSpanElement>(this.container, '.dplayer-info-panel-item-danmaku-amount .dplayer-info-panel-item-data');
        // TODO(#57):  add buttons for previous and next chapters!!!!! ( in inithighlight)
    }
    /**
     * @private
     * @throws {Error}
     */
    #saveQuerySelector<T extends HTMLElement | Element>(parent: HTMLElement | Element | Document, selector: string): T {
        const el: T | null = parent.querySelector(selector);
        if (el === null) {
            throw new Error(`Query Selector ${selector} didn't match any elements.`);
        }
        return el;
    }
    /**
     * @private
     * @throws {Error}
     */
    #saveQuerySelectorAll<T extends HTMLElement | Element>(parent: HTMLElement | Element | Document, selector: string): NodeListOf<T> {
        const el: NodeListOf<T> | null = parent.querySelectorAll(selector);
        if (el.length === 0) {
            throw new Error(`Query Selector All ${selector} didn't match any elements.`);
        }
        return el;
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
        // TODO(#58):  maybe do something, maybe not!
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

/* function isOfTypeAndNotNull<T>(arg0: this): boolean {
    throw new Error('Function not implemented.');
}
 */
