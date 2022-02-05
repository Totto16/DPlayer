class Bezel {
    container: HTMLSpanElement;
    ClickFunctionHandler: DPlayerBezelClickFunctionHandler;
    destroyed?: boolean;
    constructor(container: HTMLSpanElement) {
        this.container = container;
        this.ClickFunctionHandler = this.ClickFunction.bind(this);
        this.container.addEventListener('animationend', this.ClickFunctionHandler);
    }

    ClickFunction(): void {
        this.container.classList.remove('dplayer-bezel-transition');
    }

    switch(icon: string): void {
        this.container.innerHTML = icon;
        this.container.classList.add('dplayer-bezel-transition');
    }

    destroy(): void {
        this.container.removeEventListener('animationend', this.ClickFunctionHandler);
        this.destroyed = true;
    }
}

export default Bezel;

export type DPlayerBezelClickFunctionHandler = () => void;
