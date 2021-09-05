class Bezel {
    constructor(container) {
        this.container = container;
        this.ClickFunctionHandler = this.ClickFunction.bind(this);
        this.container.addEventListener('animationend', this.ClickFunctionHandler);
    }

    ClickFunction() {
        this.container.classList.remove('dplayer-bezel-transition');
    }

    switch(icon) {
        this.container.innerHTML = icon;
        this.container.classList.add('dplayer-bezel-transition');
    }

    destroy() {
        this.container.removeEventListener('animationend', this.ClickFunctionHandler);
        this.destroyed = true;
    }
}

export default Bezel;
