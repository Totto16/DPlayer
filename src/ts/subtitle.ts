import DPlayer, { isNullish } from '.';
import Events from './events';

class Subtitle {
    player: DPlayer;
    container: HTMLDivElement;
    video: HTMLVideoElement;
    events: Events;
    options: DPlayerSubTitleOptions;
    instance?: DPlayerAssInstance;

    constructor(player: DPlayer, container: HTMLDivElement, options: DPlayerSubTitleOptions, events: Events) {
        this.player = player;
        this.container = container;
        this.video = player.video;
        this.options = options;
        this.events = events;

        this.init();
    }

    init() {
        switch (this.options.type) {
            case 'webvtt':
                this.container.style.fontSize = this.options.fontSize;
                this.container.style.bottom = this.options.bottom;
                this.container.style.color = this.options.color;

                if (this.video.textTracks && this.video.textTracks[0]) {
                    const track: TextTrack = this.video.textTracks[0];

                    track.oncuechange = () => {
                        console.log(track.cues);
                        if (track.activeCues === null || track.activeCues.length === 0) {
                            return;
                        }
                        const cue: VTTCue = track.activeCues[0] as VTTCue; // TODO test in the practical mode : https://developer.mozilla.org/en-US/docs/Web/API/VTTCue
                        this.container.innerHTML = '';
                        if (!isNullish(cue)) {
                            const template = document.createElement('div');
                            template.appendChild(cue.getCueAsHTML());
                            const trackHtml = template.innerHTML
                                .split(/\r?\n/)
                                .map((item) => `<p>${item}</p>`)
                                .join('');
                            this.container.innerHTML = trackHtml;
                        }
                        this.events.trigger('subtitle_change');
                    };
                }
                if (isNullish(this.player.user.get('subtitle'))) {
                    this.hide();
                }
                break;
            case 'ass':
                if (window.ass) {
                    // TODO add to global ass ?: ...
                    const options = {
                        video: this.player.video,
                        subUrl: this.options.url,
                    };
                    window.ass(
                        options,
                        this.player,
                        () => {
                            if (isNullish(this.player.user.get('subtitle'))) {
                                this.hide();
                            }
                        },
                        (SO: DPlayerAssInstance): void => {
                            this.instance = SO;
                        }
                    );
                } else {
                    this.player.notice("Error: Can't find ass support.", { warn: true });
                }
                break;
            default:
                // TODO yes ts says its not possible, but user input has to be treated as GARBAGE!!!!
                console.warn(`Not supported Subtitle type: ${this.options.type.toString()}`);
                break;
        }
    }

    show(): void {
        switch (this.options.type) {
            case 'webvtt':
                this.container.classList.remove('dplayer-subtitle-hide');
                this.events.trigger('subtitle_show');
                break;
            case 'ass':
                if (window.ass && this.instance !== undefined) {
                    this.instance.canvas.classList.remove('hide-force');
                    this.events.trigger('subtitle_show');
                }
                break;
            default:
                console.warn(`Not supported Subtitle type: ${this.options.type}`);
                break;
        }
    }

    hide(): void {
        switch (this.options.type) {
            case 'webvtt':
                this.container.classList.add('dplayer-subtitle-hide');
                this.events.trigger('subtitle_hide');
                break;
            case 'ass':
                if (window.ass && this.instance) {
                    // THIS Is bad, because we render the subtitles even if not shown, but the subtitle-octopus library doesn't support that, we could unload and reload the subs every time, but that is bad :( and takes time, maybe than the subs aren't synced well)
                    //   this.instance.setIsPaused(true, -1);
                    this.instance.canvas.classList.add('hide-force');
                    this.events.trigger('subtitle_hide');
                }
                break;
            default:
                // same as above
                console.warn(`Not supported Subtitle type: ${this.options.type.toString()}`);
                break;
        }
    }

    toggle(): void {
        switch (this.options.type) {
            case 'webvtt':
                if (this.container.classList.contains('dplayer-subtitle-hide')) {
                    this.show();
                } else {
                    this.hide();
                }
                break;
            case 'ass':
                if (window.ass && this.instance !== undefined) {
                    if (this.instance.canvas.classList.contains('hide-force')) {
                        this.show();
                    } else {
                        this.hide();
                    }
                }
                break;
            default:
                // garbage input checker
                console.warn(`Not supported Subtitle type: ${this.options.type.toString()}`);
                break;
        }
    }

    destroy(): void {
        if (this.instance) {
            this.instance.dispose();
        }
    }
}

export default Subtitle;

export interface DPlayerAssInstance {
    dispose: () => void;
    canvas: HTMLCanvasElement;
} // TODO, get right things here!

export interface DPlayerSubTitleOptionsWeak {
    url: string;
    type?: DPlayerSubTitleTypes;
    fontSize?: string;
    bottom?: string;
    color?: string;
}

export interface DPlayerSubTitleOptions {
    url: string;
    type: DPlayerSubTitleTypes;
    fontSize: string;
    bottom: string;
    color: string;
}

export type DPlayerSubTitleTypes = 'webvtt' | 'ass';
