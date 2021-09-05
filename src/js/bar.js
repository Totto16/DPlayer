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
        this.RangesChanged = false;
    }

    /**
     * Update progress
     *
     * @param {String} type - Point out which bar it is
     * @param {Number} percentage
     */
    set(type, Obj) {
        let percentage, ranges;
        if (typeof Obj === 'number') {
            percentage = Obj;
            ranges = [];
            for (let i = 0; i < this.player.video.buffered.length; i++) {
                const start = this.player.video.buffered.start(i);
                const end = this.player.video.buffered.end(i);
                ranges.push({ start, end });
            }
        } else {
            percentage = Obj.percentage;
            ranges = Obj.ranges;
        }
        this.RangesChanged = !(JSON.stringify(ranges) === JSON.stringify(this.previousRanges));
        const previousRanges = this.previousRanges;
        this.previousRanges = ranges;
        // console.log(this.RangesChanged ? JSON.stringify(ranges) : null);
        percentage = Math.max(percentage, 0);
        percentage = Math.min(percentage, 1);
        if (this.mode === 'top') {
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
        } else {
            const LPercentage = this.player.video.buffered.length > 0 ? this.player.video.buffered.end(this.player.video.buffered.length - 1) / this.player.video.duration : percentage;
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
