class Bar {
    constructor(template, player, mode) {
        this.elements = {};
        this.elements.volume = template.volumeBar;
        this.elements.played = template.playedBar;
        this.elements.loaded = template.loadedBar;
        this.elements.danmaku = template.danmakuOpacityBar;
        this.mode = mode;
        this.player = player;
    }

    /**
     * Update progress
     *
     * @param {String} type - Point out which bar it is
     * @param {Number} percentage
     * @param {String} direction - Point out the direction of this bar, Should be height or width
     */
    set(type, percentage, direction) {
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
                console.log(type, direction, percentage);
                this.elements[type].style[direction] = percentage * 100 + '%';
            }
        } else {
            if (type === 'loaded') {
                this.loaded = percentage;
            }
            this.elements[type].style[direction] = percentage * 100 + '%';
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
