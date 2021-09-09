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
        console.log(this.options.type);
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
                break;
            case 'ass':
                if (window.ass) {
                    const options = {
                        video: this.player.video,
                        subUrl: this.options.url,
                    };
                    this.instance = window.ass(options);
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
        this.container.classList.remove('dplayer-subtitle-hide');
        this.events.trigger('subtitle_show');
    }

    hide() {
        this.container.classList.add('dplayer-subtitle-hide');
        this.events.trigger('subtitle_hide');
    }

    toggle() {
        if (this.container.classList.contains('dplayer-subtitle-hide')) {
            this.show();
        } else {
            this.hide();
        }
    }
}

export default Subtitle;
