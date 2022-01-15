import Events from './events';

class Thumbnails {
    container: HTMLElement;
    barWidth: number;
    size: number;
    events: Events;

    constructor(options: DPlayerThumbnailOptions) {
        this.container = options.container;
        this.barWidth = options.barWidth;
        this.size = 160;
        this.events = options.events;

        if (options.url === 'API') {
            // TODO implement!
            /*   this.api.requestThumbnail((response) => {
                this.container.style.backgroundImage = `url('${response.url}')`;
                this.container.style.backgroundColor = 'rgba(0, 0, 0, 0)';
                this.container.classList.remove('hidden');
                // https://ddl.amalgam-fansubs.moe/API/Dplayer
                // TODO API!!!
            }); */
        } else {
            this.container.style.backgroundImage = `url('${options.url}')`;
            this.container.style.backgroundColor = 'rgba(0, 0, 0, 0)';
            this.container.classList.remove('hidden');
        }
    }

    resize(ratio: number, barWrapWidth: number): void {
        const height = ratio * this.size;
        const width = this.size;
        this.container.style.width = `${width}px`;
        this.container.style.height = `${height}px`;
        this.container.style.top = `${-height + 2}px`;
        this.barWidth = barWrapWidth;
    }

    show(): void {
        if (typeof this.events !== 'undefined') {
            this.events.trigger('thumbnails_show');
        }
    }

    move(position: number): void {
        this.container.style.backgroundPosition = `-${(Math.ceil((position / this.barWidth) * 100) - 1) * this.size}px 0`;
    }

    hide(): void {
        if (typeof this.events !== 'undefined') {
            this.events.trigger('thumbnails_hide');
        }
    }
}

export default Thumbnails;

export interface DPlayerThumbnailOptions {
    url: string;
    container: HTMLElement;
    barWidth: number;
    events: Events;
}
