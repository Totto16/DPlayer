import play from '../assets/play.svg';
import pause from '../assets/pause.svg';
import volumeUp from '../assets/volume-up.svg';
import volumeDown from '../assets/volume-down.svg';
import volumeOff from '../assets/volume-off.svg';
import full from '../assets/full.svg';
import fullWeb from '../assets/full-web.svg';
import setting from '../assets/setting.svg';
import right from '../assets/right.svg';
import comment from '../assets/comment.svg';
import commentOff from '../assets/comment-off.svg';
import send from '../assets/send.svg';
import pallette from '../assets/pallette.svg';
import camera from '../assets/camera.svg';
import airplay from '../assets/airplay.svg';
import subtitle from '../assets/subtitle.svg';
import loading from '../assets/loading.svg';
import chromecast from '../assets/chromecast.svg';

const Icons: DPlayerIconObject = {
    play: play as string,
    pause: pause as string,
    volumeUp: volumeUp as string,
    volumeDown: volumeDown as string,
    volumeOff: volumeOff as string,
    full: full as string,
    fullWeb: fullWeb as string,
    setting: setting as string,
    right: right as string,
    comment: comment as string,
    commentOff: commentOff as string,
    send: send as string,
    pallette: pallette as string,
    camera: camera as string,
    subtitle: subtitle as string,
    loading: loading as string,
    airplay: airplay as string,
    chromecast: chromecast as string,
};

export default Icons;

export type DPlayerIconNames = 'play' | 'pause' | 'volumeUp' | 'volumeDown' | 'volumeOff' | 'full' | 'fullWeb' | 'setting' | 'right' | 'comment' | 'commentOff' | 'send' | 'pallette' | 'camera' | 'subtitle' | 'loading' | 'airplay' | 'chromecast';

export type DPlayerIconObject = {
    [icon in DPlayerIconNames]: string; // by webpack parsed inline svgs! Will be assigned to an innerHTML
};
