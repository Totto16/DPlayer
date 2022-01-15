import DPlayer from '.';

class Timer implements DPlayerTimerProperties2, DPlayerTimerProperties2, DPlayerTimerProperties3 {
    // TODO define that for every class, to see if they implement destroy() :  extends DestroyableInstance
    player: DPlayer;
    types: DPlayerTimerType[];
    fpsStart?: number; // could solve this with the above trick, but there are only these two
    fpsIndex?: number;

    constructor(player: DPlayer) {
        this.player = player;

        // nowadays this is supported by everything, at least nearly
        /* window.requestAnimationFrame =
            window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            }; */

        this.types = ['loading', 'info', 'fps'];

        this.init();
    }

    init(): void {
        this.types.map((item) => {
            if (item !== 'fps') {
                this[`init${item}Checker`]();
            }
            return item;
        });
    }

    initloadingChecker(): void {
        let lastPlayPos = 0;
        let currentPlayPos = 0;
        let bufferingDetected = false;
        this.loadingChecker = setInterval(() => {
            if (this.enableloadingChecker) {
                // whether the video is buffering
                currentPlayPos = this.player.video.currentTime;
                if (!bufferingDetected && currentPlayPos === lastPlayPos && !this.player.video.paused) {
                    this.player.container.classList.add('dplayer-loading');
                    bufferingDetected = true;
                }
                if (bufferingDetected && currentPlayPos > lastPlayPos && !this.player.video.paused) {
                    this.player.container.classList.remove('dplayer-loading');
                    bufferingDetected = false;
                }
                lastPlayPos = currentPlayPos;
            }
        }, 100);
    }

    initfpsChecker(): void {
        window.requestAnimationFrame(() => {
            if (this.enablefpsChecker === true) {
                this.initfpsChecker();
                if (typeof this.fpsStart === 'undefined') {
                    this.fpsStart = new Date().getTime();
                    this.fpsIndex = 0;
                } else {
                    this.fpsIndex = typeof this.fpsIndex === 'undefined' ? 0 : this.fpsIndex + 1;
                    const fpsCurrent = new Date().getTime();
                    if (fpsCurrent - this.fpsStart > 1000) {
                        this.player.infoPanel.fps((this.fpsIndex / (fpsCurrent - this.fpsStart)) * 1000);
                        this.fpsStart = new Date().getTime();
                        this.fpsIndex = 0;
                    }
                }
            } else {
                this.fpsStart = 0;
                this.fpsIndex = 0;
            }
        });
    }

    initinfoChecker(): void {
        this.infoChecker = setInterval(() => {
            if (this.enableinfoChecker) {
                this.player.infoPanel.update();
            }
        }, 1000);
    }

    enable(type: DPlayerTimerType) {
        this[`enable${type}Checker`] = true;

        if (type === 'fps') {
            this.initfpsChecker();
        }
    }

    disable(type: DPlayerTimerType) {
        this[`enable${type}Checker`] = false;
    }

    destroy(): void {
        this.types.map((item) => {
            this[`enable${item}Checker`] = false;
            this[`${item}Checker`] && clearInterval(this[`${item}Checker`]);
            return item;
        });
    }
}

export default Timer;

export type DPlayerTimerType = 'loading' | 'info' | 'fps';

export type DPlayerAvailableTimerProperties = DPlayerAvailableTimerFunctions | DPlayerAvailableTimerBooleans | DPlayerAvailableTimerTimeouts;

export type DPlayerAvailableTimerFunctions = `init${DPlayerTimerType}Checker`;

export type DPlayerAvailableTimerTimeouts = `${DPlayerTimerType}Checker`;

export type DPlayerAvailableTimerBooleans = `enable${DPlayerTimerType}Checker`;

export type DPlayerTimerProperties1 = {
    [type in DPlayerAvailableTimerFunctions]: () => void;
};

export type DPlayerTimerProperties2 = {
    [timeout in DPlayerAvailableTimerTimeouts]?: NodeJS.Timer;
};

export type DPlayerTimerProperties3 = {
    [bool in DPlayerAvailableTimerBooleans]?: boolean;
};

export type DPlayerTimerProperties = DPlayerTimerProperties1 & DPlayerTimerProperties2 & DPlayerTimerProperties3;
/* export type DPlayerTimerProperties = {
    [type in DPlayerAvailableTimerFunctions] : ()=>void;
    [timeout in DPlayerAvailableTimerTimeouts] : NodeJS.Timer;
    [bool in DPlayerAvailableTimerBooleans] : boolean;
} */
