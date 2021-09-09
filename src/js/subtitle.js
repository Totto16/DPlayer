class Subtitle {
    constructor(player, container, options, events) {
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
                    const track = this.video.textTracks[0];

                    track.oncuechange = () => {
                        console.log(track.cues);
                        const cue = track.activeCues[0];
                        this.container.innerHTML = '';
                        if (cue) {
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
                if (!this.player.user.get('subtitle')) {
                    this.hide();
                }
                break;
            case 'ass':
                if (window.ass) {
                    const options = {
                        video: this.player.video,
                        subUrl: this.options.url,
                    };
                    this.instance = window.ass(options, this.player, () => {
                        if (!this.player.user.get('subtitle')) {
                            this.hide();
                        }
                    });
                } else {
                    this.player.notice("Error: Can't find ass support.", { warn: true });
                }
                break;
            default:
                console.warn(`Not supported Subtitle type: ${this.options.type}`);
                break;
        }
    }

    show() {
        switch (this.options.type) {
            case 'webvtt':
                this.container.classList.remove('dplayer-subtitle-hide');
                this.events.trigger('subtitle_show');
                break;
            case 'ass':
                if (window.ass && this.instance) {
                    this.instance.canvas.classList.remove('hide-force');
                    this.events.trigger('subtitle_show');
                }
                break;
            default:
                console.warn(`Not supported Subtitle type: ${this.options.type}`);
                break;
        }
    }

    hide() {
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
                console.warn(`Not supported Subtitle type: ${this.options.type}`);
                break;
        }
    }

    toggle() {
        switch (this.options.type) {
            case 'webvtt':
                if (this.container.classList.contains('dplayer-subtitle-hide')) {
                    this.show();
                } else {
                    this.hide();
                }
                break;
            case 'ass':
                if (window.ass && this.instance) {
                    if (this.instance.canvas.classList.contains('hide-force')) {
                        this.show();
                    } else {
                        this.hide();
                    }
                }
                break;
            default:
                console.warn(`Not supported Subtitle type: ${this.options.type}`);
                break;
        }
    }

    destroy() {
        if (this.instance) {
            this.instance.dispose();
        }
    }
}

export default Subtitle;
