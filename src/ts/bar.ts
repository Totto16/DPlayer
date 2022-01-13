class Bar {
    constructor(template, player, mode) {
        this.elements = {};
        this.elements.volume = template.volumeBar;
        this.elements.played = template.playedBar;
        this.elements.loaded = template.loadedBar;
        this.elements.danmaku = template.danmakuOpacityBar;
        this.mode = mode;
        this.player = player;
        this.previousRanges = [];
        this.previousMode = mode;
        this.RangesChanged = false;
    }

    /**
     * Update progress
     *
     * @param {String} type - Point out which bar it is
     * @param {Number} percentage
     */
    set(type, Obj) {
        let percentage, ranges, force;
        if (typeof Obj === 'number') {
            percentage = Obj;
            force = Obj.force ? true : false;
            ranges = [];
            for (let i = 0; i < this.player.video.buffered.length; i++) {
                const start = this.player.video.buffered.start(i);
                const end = this.player.video.buffered.end(i);
                ranges.push({ start, end });
            }
        } else {
            percentage = Obj.percentage;
            ranges = Obj.ranges;
            force = Obj.force ? true : false;
        }
        this.RangesChanged = !(JSON.stringify(ranges) === JSON.stringify(this.previousRanges)) || this.previousMode !== this.mode || force;
        if (!(JSON.stringify(ranges) === JSON.stringify(this.previousRanges))) {
            this.player.events.trigger('ranges_change', ranges);
        }

        const previousRanges = this.previousRanges;
        this.previousRanges = ranges;
        this.previousMode = this.mode;
        percentage = Math.max(percentage, 0);
        percentage = Math.min(percentage, 1);

        const LPercentage = this.player.video.buffered.length > 0 ? this.player.video.buffered.end(this.player.video.buffered.length - 1) / this.player.video.duration : percentage;

        switch (this.mode || 'nomode') {
            case 'normal':
                this.elements[type].style.width = `${percentage * 100}%`;
                if (this.RangesChanged && ranges && ranges.length > 0) {
                    type = 'loaded';
                    this.elements[type].style.width = `${LPercentage * 100}%`;
                    // this means some ranges are now together example: 1-20 and 40 -60, you load 20-40 and now you have only one range!
                    if (ranges.length < previousRanges.length) {
                        Array.from(this.elements[type].children).forEach((a) => this.elements[type].removeChild(a));
                    }
                    ranges.forEach((range, index) => {
                        const start = range.start;
                        const end = range.end;
                        const exists = Array.from(this.elements[type].children).filter((a) => a.getAttribute('data-index') === index.toString());
                        const Loaded_dur = this.player.video.duration * LPercentage;
                        let p;
                        if (exists.length > 0) {
                            p = exists[0];

                            p.style.left = `${(start / Loaded_dur) * 100}%`;
                            p.style.width = `${((end - start) / Loaded_dur) * 100}%`;
                            p.setAttribute('data-start', start);
                            p.setAttribute('data-end', end);
                        } else {
                            p = document.createElement('div');

                            p.classList.add('dplayer-loaded-strips');
                            p.setAttribute('data-index', index);
                            p.style.left = `${(start / Loaded_dur) * 100}%`;
                            p.style.width = `${((end - start) / Loaded_dur) * 100}%`;
                            p.setAttribute('data-start', start);
                            p.setAttribute('data-end', end);

                            this.elements[type].appendChild(p);
                        }
                    });
                }
                break;
            case 'side':
                break;
            case 'top':
                if (type === 'played') {
                    this.elements.played = this.player.container.querySelectorAll('.dplayer-played');
                    this.elements.played.forEach((played) => {
                        const parent = played.parentElement;
                        const start = parseFloat(parent.getAttribute('data-start'));
                        const end = parseFloat(parent.getAttribute('data-end'));
                        if (percentage >= end) {
                            played.style.width = '100%';
                            played.children[0].classList.add('invisible');
                        } else if (percentage < start) {
                            played.style.width = '0%';
                            played.children[0].classList.add('invisible');
                        } else if (percentage < end && percentage >= start) {
                            const all = end - start;
                            const inHere = percentage - start;
                            played.style.width = `${(inHere / all) * 100}%`;
                            played.children[0].classList.remove('invisible');
                        }
                    });
                } else if (type === 'loaded') {
                    this.elements.loaded = this.player.container.querySelectorAll('.dplayer-loaded');
                    this.elements.loaded.forEach((loaded) => {
                        const parent = loaded.parentElement;
                        const start = parseFloat(parent.getAttribute('data-start'));
                        const end = parseFloat(parent.getAttribute('data-end'));
                        if (percentage >= end) {
                            loaded.style.width = '100%';
                        } else if (percentage < start) {
                            loaded.style.width = '0%';
                        } else if (percentage < end && percentage >= start) {
                            const all = end - start;
                            const inHere = percentage - start;
                            loaded.style.width = `${(inHere / all) * 100}%`;
                        }
                    });
                } else {
                    this.elements[type].style.width = percentage * 100 + '%';
                }
                if (this.RangesChanged && ranges && ranges.length > 0) {
                    this.elements.loaded = this.player.container.querySelectorAll('.dplayer-loaded');
                    this.elements.loaded.forEach((loaded) => {
                        if (ranges.length < previousRanges.length) {
                            Array.from(loaded.children).forEach((a) => loaded.removeChild(a));
                        }
                        const parent = loaded.parentElement;
                        const start = parseFloat(parent.getAttribute('data-start'));
                        const end = parseFloat(parent.getAttribute('data-end'));
                        const abs_start = start * this.player.video.duration;
                        const abs_end = end * this.player.video.duration;
                        let progress = 0;
                        if (LPercentage >= end) {
                            loaded.style.width = '100%';
                            progress = 1;
                        } else if (LPercentage < start) {
                            loaded.style.width = '0%';
                            progress = 0;
                        } else if (LPercentage < end && LPercentage >= start) {
                            const all = end - start;
                            const inHere = LPercentage - start;
                            loaded.style.width = `${(inHere / all) * 100}%`;
                            progress = inHere / all;
                        }

                        const filtered_ranges = ranges.filter((range) => (range.start <= abs_end && range.start >= abs_start) || (range.end >= abs_start && range.end <= abs_end) || (range.end >= abs_end && range.start <= abs_start));
                        filtered_ranges.forEach((range, index) => {
                            const Loaded_dur = (abs_end - abs_start) * progress;
                            const start2 = Math.max(range.start - abs_start, 0);
                            const end2 = Math.min(range.end - abs_start, Loaded_dur);
                            const exists = Array.from(loaded.children).filter((a) => a.getAttribute('data-index') === index.toString());

                            let p;
                            if (exists.length > 0) {
                                p = exists[0];

                                p.style.left = `${(start2 / Loaded_dur) * 100}%`;
                                p.style.width = `${((end2 - start2) / Loaded_dur) * 100}%`;
                                p.setAttribute('data-start', start2);
                                p.setAttribute('data-end', end2);
                            } else {
                                p = document.createElement('div');

                                p.classList.add('dplayer-loaded-strips');
                                p.setAttribute('data-index', index);
                                p.style.left = `${(start2 / Loaded_dur) * 100}%`;
                                p.style.width = `${((end2 - start2) / Loaded_dur) * 100}%`;
                                p.setAttribute('data-start', start2);
                                p.setAttribute('data-end', end2);

                                loaded.appendChild(p);
                            }
                        });
                    });
                }

                break;
            case 'nomode':
                if (type === 'loaded') {
                    this.loaded = LPercentage;
                }
                this.elements[type].style.width = percentage * 100 + '%';
                if (this.RangesChanged && ranges && ranges.length > 0) {
                    type = 'loaded';
                    this.elements[type].style.width = LPercentage * 100 + '%';
                    // this means some ranges are now together example: 1-20 and 40 -60, you load 20-40 and now you have only one range!
                    if (ranges.length < previousRanges.length) {
                        Array.from(this.elements[type].children).forEach((a) => this.elements[type].removeChild(a));
                    }
                    ranges.forEach((range, index) => {
                        const start = range.start;
                        const end = range.end;
                        const exists = Array.from(this.elements[type].children).filter((a) => a.getAttribute('data-index') === index.toString());
                        const Loaded_dur = this.player.video.duration * LPercentage;
                        let p;
                        if (exists.length > 0) {
                            p = exists[0];

                            p.style.left = `${(start / Loaded_dur) * 100}%`;
                            p.style.width = `${((end - start) / Loaded_dur) * 100}%`;
                            p.setAttribute('data-start', start);
                            p.setAttribute('data-end', end);
                        } else {
                            p = document.createElement('div');

                            p.classList.add('dplayer-loaded-strips');
                            p.setAttribute('data-index', index);
                            p.style.left = `${(start / Loaded_dur) * 100}%`;
                            p.style.width = `${((end - start) / Loaded_dur) * 100}%`;
                            p.setAttribute('data-start', start);
                            p.setAttribute('data-end', end);

                            this.elements[type].appendChild(p);
                        }
                    });
                }
                break;
            default:
                console.warn('An internal Error occurred, severity:none');
                break;
        }
    }

    setMode(mode) {
        this.mode = mode;
        if (this.loaded) {
            this.set('loaded', this.loaded);
        }
    }
}

export default Bar;
