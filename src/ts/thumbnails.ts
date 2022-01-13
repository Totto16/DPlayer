class Thumbnails {
    constructor(options) {
        this.container = options.container;
        this.barWidth = options.barWidth;
        this.size = 160;
        this.events = options.events;

        if (options.url === 'API') {
            this.api.requestThumbnail((response) => {
                this.container.style.backgroundImage = `url('${response.url}')`;
                this.container.style.backgroundColor = 'rgba(0, 0, 0, 0)';
                this.container.classList.remove('hidden');
                // https://ddl.amalgam-fansubs.moe/API/Dplayer
                // TODO API!!!
            });
        } else {
            this.container.style.backgroundImage = `url('${options.url}')`;
            this.container.style.backgroundColor = 'rgba(0, 0, 0, 0)';
            this.container.classList.remove('hidden');
        }
    }

    resize(ratio, barWrapWidth) {
        const height = ratio * this.size;
        const width = this.size;
        this.container.style.width = `${width}px`;
        this.container.style.height = `${height}px`;
        this.container.style.top = `${-height + 2}px`;
        this.barWidth = barWrapWidth;
    }

    show() {
        this.events && this.events.trigger('thumbnails_show');
    }

    move(position) {
        this.container.style.backgroundPosition = `-${(Math.ceil((position / this.barWidth) * 100) - 1) * this.size}px 0`;
    }

    hide() {
        this.events && this.events.trigger('thumbnails_hide');
    }
}

export default Thumbnails;
