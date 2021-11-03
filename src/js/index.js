import '../css/index.scss';
import DPlayer from './player';

/* global DPLAYER_VERSION  GIT_TIME */
console.log(`${'\n'} %c DPlayer v${DPLAYER_VERSION} ${GIT_TIME} %c http://dplayer.js.org ${'\n'}${'\n'}`, 'color: #a912ee; background: #aaa; padding:5px 0;', 'background: #a912ee; color:#fff; padding:5px 0;');

/* New Format of starting Dplayer, it will start automatically, after its loaded, for available options see future ReadME //TODO add readme !!!!*/

if (window.DPLAYER_AUTO) {
    if (!window.DPLAYER_AUTO.name) {
        window.DPLAYER_AUTO.name = 'DPLAYER_AUTO_INSTANCE';
    }
    window[window.DPLAYER_AUTO.name] = new DPlayer(window.DPLAYER_AUTO.options);

    console.debug(`used 'window.DPLAYER_AUTO' to load DPLAYER automatically, you can find it's instance at 'window[${window.DPLAYER_AUTO.name}]'`);
}

export default DPlayer;
