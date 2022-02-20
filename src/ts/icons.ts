// @ts-ignore
const play = (await import('../assets/play.svg')) as string;
// @ts-ignore
const pause = (await import('../assets/pause.svg')) as string;
// @ts-ignore
const volumeUp = (await import('../assets/volume-up.svg')) as string;
// @ts-ignore
const volumeDown = (await import('../assets/volume-down.svg')) as string;
// @ts-ignore
const volumeOff = (await import('../assets/volume-off.svg')) as string;
// @ts-ignore
const full = (await import('../assets/full.svg')) as string;
// @ts-ignore
const fullWeb = (await import('../assets/full-web.svg')) as string;
// @ts-ignore
const setting = (await import('../assets/setting.svg')) as string;
// @ts-ignore
const right = (await import('../assets/right.svg')) as string;
// @ts-ignore
const comment = (await import('../assets/comment.svg')) as string;
// @ts-ignore
const commentOff = (await import('../assets/comment-off.svg')) as string;
// @ts-ignore
const send = (await import('../assets/send.svg')) as string;
// @ts-ignore
const pallette = (await import('../assets/pallette.svg')) as string;
// @ts-ignore
const camera = (await import('../assets/camera.svg')) as string;
// @ts-ignore
const airplay = (await import('../assets/airplay.svg')) as string;
// @ts-ignore
const subtitle = (await import('../assets/subtitle.svg')) as string;
// @ts-ignore
const loading = (await import('../assets/loading.svg')) as string;
// @ts-ignore
const chromecast = (await import('../assets/chromecast.svg')) as string;

const Icons: DPlayerIconObject = {
    play,
    pause,
    volumeUp,
    volumeDown,
    volumeOff,
    full,
    fullWeb,
    setting,
    right,
    comment,
    commentOff,
    send,
    pallette,
    camera,
    subtitle,
    loading,
    airplay,
    chromecast,
};

export default Icons;

export type DPlayerIconNames = 'play' | 'pause' | 'volumeUp' | 'volumeDown' | 'volumeOff' | 'full' | 'fullWeb' | 'setting' | 'right' | 'comment' | 'commentOff' | 'send' | 'pallette' | 'camera' | 'subtitle' | 'loading' | 'airplay' | 'chromecast';

export type DPlayerIconObject = {
    [icon in DPlayerIconNames]: string; // by webpack parsed inline svgs! Will be assigned to an innerHTML
};
