class Subtitles {
    constructor(player, container, options, events) {
        this.player = player;
        this.container = container;
        this.video = player.video;
        this.options = options;
        this.events = events;
        this.subtitles = options.url;
        this.multiple = options.url.length > 2;

        this.init();
    }

    init() {
        switch (this.options.type) {
            case 'webvtt':
                if (this.multiple) {
                    this.player.template.mask.addEventListener('click', () => {
                        this.hideModal(); // also acts like the close button click, since its mask is over that
                    });

                    for (let i = 0; i < this.player.template.subtitlesItem.length; i++) {
                        this.player.template.subtitlesItem[i].addEventListener('click', () => {
                            if (this.subtitles[i].lang === 'off') {
                                if (!this.container.classList.contains('dplayer-subtitles-hide')) {
                                    this.hide();
                                }
                            } else {
                                if (this.container.classList.contains('dplayer-subtitles-hide')) {
                                    this.show();
                                }
                                if (this.player.options.subtitle.index !== i) {
                                    // clear subtitle show for new subtitle don't have now duration time. If don't, will display last subtitle.
                                    this.player.template.subtitle.innerHTML = `<p></p>`;
                                    // update video track src
                                    this.player.template.subtrack.src = this.player.template.subtitlesItem[i].dataset.subtitle;
                                    // update options current subindex for reload (such as changeQuality)
                                    this.player.options.subtitle.index = i;
                                    this.events.trigger('subtitle_change');
                                }
                            }
                            this.hideModal();
                        });
                    }
                }

                this.container.style.fontSize = this.options.fontSize;
                this.container.style.bottom = this.options.bottom;
                this.container.style.color = this.options.color;

                if (typeof this.video === 'undefined') {
                    // for security reasons!
                    console.error('[CRITICAL] BUG in Subtitle!');
                    return;
                }

                if (this.video.textTracks && this.video.textTracks[0]) {
                    const track = this.video.textTracks[0];
                    track.oncuechange = () => {
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
                if (this.multiple) {
                    console.error('Currently only webvtt type is supported by multiple Subtitles!');
                    return;
                }

                if (window.ass) {
                    const options = {
                        video: this.player.video,
                        subUrl: this.options.url,
                    };
                    window.ass(
                        options,
                        this.player,
                        () => {
                            if (!this.player.user.get('subtitle')) {
                                this.hide();
                            }
                        },
                        (SO) => {
                            this.instance = SO;
                        }
                    );
                } else {
                    this.player.notice("Error: Can't find ass support.", { warn: true });
                }
                break;
            default:
                console.warn(`Not supported Subtitle type: ${this.options.type}`);
                break;
        }
    }

    showModal() {
        if (this.multiple) {
            this.player.template.subtitlesBox.classList.add('dplayer-subtitles-box-open');
            this.player.template.mask.classList.add('dplayer-mask-show');
            this.player.controller.disableAutoHide = true;
        }
    }

    hideModal() {
        if (this.multiple) {
            this.player.template.subtitlesBox.classList.remove('dplayer-subtitles-box-open');
            this.player.template.mask.classList.remove('dplayer-mask-show');
            this.player.controller.disableAutoHide = false;
        }
    }

    hide() {
        if (this.multiple) {
            this.container.classList.add('dplayer-subtitles-hide');
            this.events.trigger('subtitle_hide');
        } else {
            switch (this.options.type) {
                case 'webvtt':
                    this.container.classList.add('dplayer-subtitles-hide');
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
    }

    // TODO(#74): ass is merely supported, but atm only for single ones!
    show() {
        if (this.multiple) {
            this.container.classList.remove('dplayer-subtitles-hide');
            this.events.trigger('subtitle_show');
        } else {
            switch (this.options.type) {
                case 'webvtt':
                    this.container.classList.remove('dplayer-subtitles-hide');
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
    }

    toggleModal() {
        if (this.player.template.subtitlesBox.classList.contains('dplayer-subtitles-box-open')) {
            this.hideModal();
        } else {
            this.showModal();
        }
    }

    toggle() {
        if (this.multiple) {
            this.toggleModal();
        } else {
            switch (this.options.type) {
                case 'webvtt':
                    if (this.container.classList.contains('dplayer-subtitles-hide')) {
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
    }

    // ass instances take up much ram , so its IMPORTANT to destroy them!
    destroy() {
        if (this.instance) {
            this.instance.dispose();
        }
    }
}

export default Subtitles;
