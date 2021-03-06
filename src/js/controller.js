import utils from './utils';
import Thumbnails from './thumbnails';
import Icons from './icons';
import { Subject } from 'rxjs';

let cast;
let runOnce = true;
let isCasting = false;

class Controller {
    constructor(player) {
        this.player = player;

        this.autoHideTimer = 0;
        if (!utils.isMobile) {
            this.setAutoHideHandler = this.setAutoHide.bind(this);
            this.player.container.addEventListener('mousemove', this.setAutoHideHandler);
            this.player.container.addEventListener('click', this.setAutoHideHandler);
            this.player.on('play', this.setAutoHideHandler);
            this.player.on('pause', this.setAutoHideHandler);
        }
        this.initPlayButton();
        this.initThumbnails();
        this.initPlayedBar();
        this.initFullButton();
        this.initQualityButton();
        this.initScreenshotButton();
        this.initSubtitleButton();
        this.initHighlights();
        this.initAirplayButton();
        this.initChromecastButton();
        if (!utils.isMobile) {
            this.initVolumeButton();
        }
    }

    initPlayButton() {
        this.player.template.playButton.addEventListener('click', () => {
            this.player.toggle();
        });

        this.player.template.mobilePlayButton.addEventListener('click', () => {
            this.player.toggle();
        });

        if (!utils.isMobile) {
            this.player.template.videoWrap.addEventListener('click', () => {
                this.player.toggle();
            });
            this.player.template.controllerMask.addEventListener('click', () => {
                this.player.toggle();
            });
        } else {
            this.player.template.videoWrap.addEventListener('click', () => {
                this.toggle();
            });
            this.player.template.controllerMask.addEventListener('click', () => {
                this.toggle();
            });
        }
    }

    initHighlights() {
        // TODO add buttons for previous and next chapters!!!!!
        this.player.on(['durationchange', 'highlight_change'], () => {
            if (this.player.video.duration && this.player.video.duration !== 1 && this.player.video.duration !== Infinity) {
                if (this.player.options.highlights && this.player.options.highlights.marker && Array.isArray(this.player.options.highlights.marker) && this.player.options.highlights.marker.length > 0) {
                    const marker = this.player.options.highlights.marker.map((mark) => {
                        const corrected = mark;
                        if (typeof mark.time !== 'number') {
                            corrected.time = parseFloat(mark.time);
                        }
                        return corrected;
                    });

                    if (this.player.options.highlights.mode === 'auto') {
                        if (marker[0].time === 0) {
                            this.player.options.highlights.mode = 'top';
                        } else {
                            this.player.options.highlights.mode = 'normal';
                        }
                    }

                    // NOTICE  only necessary if we change chapters on the fly
                    // remove previous highlights
                    /* this.player.template.barHighlight.forEach((item) => {
                        this.player.template.playedBarWrap.removeChild(item);
                    });
 */

                    /* this.player.template.barHighlightTop.forEach((item) => {
                        this.player.template.playedBarWrap.removeChild(item);
                    }); */

                    // TODO check if this also works if loaded after the first chapter is passed, maybe the API call from getVtts is slow, or the chapters are small, or the user gets the time to skip manually to another chapter, event based things can happen before or after the user does something, so there migh t be a bug!!
                    const inbetween = 1;
                    switch (this.player.options.highlights.mode) {
                        case 'normal':
                            for (let i = 0; i < marker.length; i++) {
                                if (typeof marker[i].text === 'undefined' || typeof marker[i].time === 'undefined') {
                                    console.warn('highlights format not correct');
                                    continue;
                                }
                                const p = document.createElement('div');
                                p.classList.add('dplayer-highlight');
                                const percent = (marker[i].time / this.player.video.duration) * 100;
                                p.style.left = `${percent}%`;
                                p.innerHTML = `<span class="dplayer-highlight-text">${marker[i].text}</span>`;
                                this.player.template.playedBarWrap.insertBefore(p, this.player.template.barInfoDiv);
                                if (marker[0].time === 0) {
                                    console.warn('The mode "normal" isn\'t meant for chapters beginning at the start, however its required for the other modes, consider using those!');
                                } else {
                                    this.chapters = { marker, mode: 'normal', currentChapter: -1 };
                                }
                            }
                            this.player.bar.setMode('normal');
                            // TODO If implemented trigger checkSkipState with actual chapter!!!!
                            break;
                        case 'top':
                            this.player.template.playedBarWrap.querySelectorAll('.dplayer-bar').forEach((item) => {
                                this.player.template.playedBarWrap.removeChild(item);
                            });
                            for (let i = 0; i < marker.length; i++) {
                                if (typeof marker[i].text === 'undefined' || typeof marker[i].time === 'undefined') {
                                    console.warn('highlights format not correct');
                                    continue;
                                }
                                const p = document.createElement('div');
                                // p.classList.add('dplayer-highlight-top');
                                p.classList.add('dplayer-bar');
                                p.classList.add('dplayer-highlight-top');
                                const end = (i < marker.length - 1 ? marker[i + 1].time / this.player.video.duration : 1) * 100;
                                const start = (marker[i].time / this.player.video.duration) * 100;
                                p.style.left = start === 0 ? `${start}%` : `calc(${start}% + ${inbetween}px)`;
                                p.style.right = end === 100 ? `0%` : `calc(${100 - end}% + ${inbetween}px)`;
                                p.style.position = 'absolute';
                                p.style.width = 'unset';
                                p.setAttribute('data-start', start / 100);
                                p.setAttribute('data-end', end / 100);
                                p.innerHTML = `<div class="dplayer-loaded"></div>
                                <div class="dplayer-played" style="background: var(--dplayer-theme-color);">
                                    <span class="dplayer-thumb${i === 0 ? '' : ' invisible'}" style="background: -var(--dplayer-theme-color);"></span>
                                </div>`;
                                // p.innerHTML = `<span class="dplayer-highlight-top-text">${marker[i].text}</span>`;
                                this.player.template.playedBarWrap.appendChild(p);

                                if (marker[0].time !== 0) {
                                    console.warn('The mode "top" must have a chapter that starts at 0 / the beginning chapters beginning at the start, however its not required for the "normal" mode, consider using that mode!');
                                } else {
                                    this.chapters = {
                                        marker,
                                        mode: 'top',
                                        currentChapter: 0,
                                        getTextByTime: (time) => {
                                            for (let i = 0; i < marker.length; i++) {
                                                const end = i < marker.length - 1 ? marker[i + 1].time : this.player.video.duration;
                                                if (time < end) {
                                                    return marker[i].text;
                                                }
                                            }
                                        },
                                    };
                                    this.player.template.topChapterDiv.classList.remove('hidden');
                                }
                            }
                            this.player.bar.setMode('top');

                            // TODO trigger checkSkipState with actual chapter, not the first!!!!! Maybe that is already correct, check if it works!
                            this.updateChapters({}, this.player, true);

                            break;
                        default:
                            console.warn(`No valid mode for highlights defined: ${this.player.options.highlights.mode}`);
                    }
                }
            }
            this.player.events.trigger('progress'); // update loaded!
        });
        this.player.on('chapter', (event) => {
            this.checkSkipState.call(this, event);
        });
    }
    checkSkipState(event) {
        if (!this.player.options.highlightSkip) {
            this.player.events.trigger('cancelskip');
            return;
        }
        switch (event.type) {
            case 'simple':
                break;
            case 'next':
                this.player.options.highlightSkipArray.some((a) => {
                    if (event.current.text.match(a)) {
                        this.skipHighlight.call(this, event.next, event.current.text);
                        return true;
                    }
                    return false;
                });
                break;
            case 'previous':
                if (this.player.options.hardSkipHighlights) {
                    this.player.options.highlightSkipArray.some((a) => {
                        if (event.current.text.match(a)) {
                            this.skipHighlight.call(this, event.previous, event.current.text);
                        }
                        return false;
                    });
                }
                break;
            default:
                console.warn("This shouldn't be Called, we only have three types of chapter events!");
        }
    }
    changeSkipHighlight(value) {
        if (this.player.options.highlightSkip === value) {
            return;
        }
        this.player.options.highlightSkip = value;
        const { marker, mode, currentChapter } = this.chapters;
        const previous = currentChapter >= 1 ? marker[currentChapter - 1] : null;
        const current = currentChapter >= 0 && currentChapter < marker.length ? marker[currentChapter] : null;
        const next = currentChapter < marker.length - 1 ? marker[currentChapter + 1] : null;
        switch (mode) {
            case 'normal':
                // we never skip 'normal' mode chapters, so this is redundant!
                // this.checkSkipState({ type: 'simple', direction: 'next', surpassed: next });
                break;
            case 'side':
                break;
            case 'top':
                this.checkSkipState({ type: 'next', previous, current, next });
                break;
        }
    }

    skipHighlight(chapter, name) {
        switch (this.player.options.highlightSkipMode.toString().toLowerCase()) {
            case 'smoothprompt':
                this.showSkipPrompt.call(this, false, this.player.options.skipDelay, name, () => {
                    this.player.seek(chapter.time, true);
                    this.player.notice(this.player.translate('skipped_chapter', name));
                });
                break;
            case 'immediately':
                this.player.seek(chapter.time, true);
                this.player.notice(this.player.translate('skipped_chapter', name));
                break;
            case 'smoothcancelprompt':
                this.showSkipPrompt.call(this, true, this.player.options.skipDelay, name, () => {
                    this.player.seek(chapter.time, true);
                    this.player.notice(this.player.translate('skipped_chapter', name));
                });
                break;
            case 'always':
                this.showSkipPrompt.call(this, false, -1, name, () => {
                    this.player.seek(chapter.time, true);
                    this.player.notice(this.player.translate('skipped_chapter', name));
                });
                break;
            default:
                console.warn(`'options.highlightSkipMode' not set correctly, this should not occur!`);
                break;
        }
    }
    showSkipPrompt(cancellable, timeShown, name, callback) {
        const prompt = this.player.template.skipWindow;
        const button = prompt.querySelector('.skip');
        const text = prompt.querySelector('.title');
        const progress = prompt.querySelector('.progress');
        if (timeShown > 0) {
            if (cancellable) {
                button.innerText = this.player.translate('cancel');
                text.innerText = this.player.translate('skip_chapter', name);

                const timeoutID = setTimeout(() => {
                    button.onclick = null;
                    prompt.style.display = 'none';
                    callback();
                }, timeShown);
                button.onclick = () => {
                    button.onclick = null;
                    prompt.style.display = 'none';
                    clearTimeout(timeoutID);
                };
                const UUIDs = this.player.once(
                    ['chapter', 'cancelskip'],
                    (_, { UUID }) => {
                        button.onclick = null;
                        prompt.style.display = 'none';
                        clearTimeout(timeoutID);
                        const remainingUUIDs = UUIDs.filter((u) => u !== UUID);
                        // if wwe remove the uuid from itself, its dangerous!!
                        this.player.events.removeByUUID(remainingUUIDs);
                    },
                    true
                );
            } else {
                button.innerText = this.player.translate('skip');
                text.innerText = this.player.translate('skip_chapter', name);
                const timeoutID = setTimeout(() => {
                    button.onclick = null;
                    prompt.style.display = 'none';
                }, timeShown);
                button.onclick = () => {
                    button.onclick = null;
                    prompt.style.display = 'none';
                    clearTimeout(timeoutID);
                    callback();
                };

                const UUIDs = this.player.once(
                    ['chapter', 'cancelskip'],
                    (_, { UUID }) => {
                        button.onclick = null;
                        prompt.style.display = 'none';
                        clearTimeout(timeoutID);
                        const remainingUUIDs = UUIDs.filter((u) => u !== UUID);
                        // if wwe remove the uuid from itself, its dangerous!!
                        this.player.events.removeByUUID(remainingUUIDs);
                    },
                    true
                );
            }
            progress.style.display = 'unset';
            progress.animate([{ width: '0%' }, { width: '100%' }], timeShown);
        } else {
            button.innerText = this.player.translate('skip');
            text.innerText = this.player.translate('skip_chapter', name);
            progress.style.display = 'none';
            button.onclick = () => {
                button.onclick = null;
                // prompt.style.display = 'none';
                callback();
            };

            const UUIDs = this.player.once(
                ['chapter', 'cancelskip'],
                (_, { UUID }) => {
                    button.onclick = null;
                    prompt.style.display = 'none';
                    const remainingUUIDs = UUIDs.filter((u) => u !== UUID);
                    // if wwe remove the uuid from itself, its dangerous!!
                    this.player.events.removeByUUID(remainingUUIDs);
                },
                true
            );
        }
        prompt.style.display = 'flex';

        // circle.animate([{ backgroundColor: 'var(--dplayer-simple-keyboard-keys-bk-available)' }, { backgroundColor: 'var(--dplayer-simple-keyboard-keys-bk-pressed)' }], 150);
    }

    initThumbnails() {
        if (this.player.options.video.thumbnails) {
            this.thumbnails = new Thumbnails({
                container: this.player.template.barPreview,
                barWidth: this.player.template.barWrap.offsetWidth,
                url: this.player.options.video.thumbnails,
                events: this.player.events,
                // TODO API
            });
            this.player.on('loadedmetadata', () => {
                // TODO calculate rigth size!!! for moving!
                this.thumbnails.resize(this.player.video.videoHeight / this.player.video.videoWidth, this.player.template.barWrap.offsetWidth);
            });
        }
    }

    initPlayedBar() {
        const thumbMove = (e) => {
            this.moving = true;
            const x = e.clientX || e.changedTouches[0].clientX;
            if (!x) {
                return;
            }
            let percentage = (x - utils.getBoundingClientRectViewLeft(this.player.template.playedBarWrap)) / this.player.template.playedBarWrap.clientWidth;
            if (this.chapters && this.chapters.mode === 'top') {
                // percentage = we should compute the time based on the gaps, so that ist correct, but with inbetween = 1 it should be fine also like this
            }
            percentage = this.clamp(0, percentage, 1);
            this.player.bar.set('played', percentage);
            this.player.template.ptime.innerHTML = utils.secondToTime(percentage * this.player.video.duration);
        };

        const thumbUp = (e) => {
            document.removeEventListener(utils.nameMap.dragEnd, thumbUp);
            document.removeEventListener(utils.nameMap.dragMove, thumbMove);
            this.moving = false;
            const x = e.clientX || e.changedTouches[0].clientX;
            if (!x) {
                return;
            }
            let percentage = (x - utils.getBoundingClientRectViewLeft(this.player.template.playedBarWrap)) / this.player.template.playedBarWrap.clientWidth;
            if (this.chapters && this.chapters.mode === 'top') {
                // percentage = we should compute the time based on the gaps, so that ist correct, but with inbetween = 1 it should be fine also like this
            }
            percentage = this.clamp(0, percentage, 1);
            this.player.bar.set('played', percentage);
            this.updateChapters({ percentage }, this.player);
            this.player.seek(percentage * this.player.video.duration);
            this.player.timer.enable('progress');
        };

        this.player.template.playedBarWrap.addEventListener(utils.nameMap.dragStart, () => {
            this.player.timer.disable('progress');
            document.addEventListener(utils.nameMap.dragMove, thumbMove);
            document.addEventListener(utils.nameMap.dragEnd, thumbUp);
        });

        this.player.template.playedBarWrap.addEventListener(utils.nameMap.dragMove, (e) => {
            if (this.player.video.duration) {
                const px = this.player.template.playedBarWrap.getBoundingClientRect().left;
                const tx = (e.clientX || e.changedTouches[0].clientX) - px;
                if (tx < 0 || tx > this.player.template.playedBarWrap.offsetWidth) {
                    return;
                }
                const time = this.player.video.duration * (tx / this.player.template.playedBarWrap.offsetWidth);
                if (utils.isMobile) {
                    this.thumbnails && this.thumbnails.show();
                }
                this.thumbnails && this.thumbnails.move(tx);
                // 7px margin in the flex-div!! 20px margin after each progressbar, we want 5 px margin as a result, so we get these formulas! (20 -5 +7)
                const ElemWidth = (parseFloat(window.getComputedStyle(this.player.template.barInfoDiv).width.replace('px', '')) + 14) / 2;
                const percentage = this.clamp(-22, tx - ElemWidth, this.player.template.playedBarWrap.offsetWidth + 22 - 2 * ElemWidth);
                this.player.template.barInfoDiv.style.left = `${percentage}px`;
                this.player.template.barInfoDiv.classList.remove('hidden');
                this.player.template.playedBarTime.innerText = utils.secondToTime(time);
                if (this.chapters && this.chapters.mode === 'top') {
                    this.player.template.topChapterDiv.innerText = this.chapters.getTextByTime(time);
                }
            }
        });

        this.player.template.playedBarWrap.addEventListener(utils.nameMap.dragEnd, () => {
            if (utils.isMobile) {
                this.thumbnails && this.thumbnails.hide();
            }
        });

        if (!utils.isMobile) {
            this.player.template.playedBarWrap.addEventListener('mouseenter', () => {
                if (this.player.video.duration) {
                    this.thumbnails && this.thumbnails.show();
                    this.player.template.barInfoDiv.classList.remove('hidden');
                }
            });

            this.player.template.playedBarWrap.addEventListener('mouseleave', () => {
                if (this.player.video.duration) {
                    this.thumbnails && this.thumbnails.hide();
                    this.player.template.barInfoDiv.classList.add('hidden');
                }
            });
        }
    }

    initFullButton() {
        switch (this.player.options.fullScreenPolicy.toString().toLowerCase()) {
            case 'onlynormal':
                this.player.template.webFullButton.classList.add('only-normal-mode');
                break;
            case 'onlyweb':
                this.player.template.browserFullButton.classList.add('only-web-mode');
                break;
            case 'both':
                this.player.template.browserFullButton.classList.add('both-mode');
                this.player.template.webFullButton.classList.add('both-mode');
                break;
            default:
                console.warn(`'options.fullScreenPolicy' not set correctly, this should not occur!`);
                break;
        }
        this.player.template.browserFullButton.addEventListener('click', () => {
            this.player.fullScreen.toggle('browser');
        });

        this.player.template.webFullButton.addEventListener('click', () => {
            this.player.fullScreen.toggle('web');
        });
    }

    initVolumeButton() {
        const vWidth = 35;

        const volumeMove = (event) => {
            const e = event || window.event;
            const percentage = ((e.clientX || e.changedTouches[0].clientX) - utils.getBoundingClientRectViewLeft(this.player.template.volumeBarWrap) - 5.5) / vWidth;
            this.player.volume(percentage);
        };
        const volumeUp = () => {
            document.removeEventListener(utils.nameMap.dragEnd, volumeUp);
            document.removeEventListener(utils.nameMap.dragMove, volumeMove);
            this.player.template.volumeButton.classList.remove('dplayer-volume-active');
        };

        this.player.template.volumeBarWrapWrap.addEventListener('click', (event) => {
            const e = event || window.event;
            const percentage = ((e.clientX || e.changedTouches[0].clientX) - utils.getBoundingClientRectViewLeft(this.player.template.volumeBarWrap) - 5.5) / vWidth;
            this.player.volume(percentage);
        });
        this.player.template.volumeBarWrapWrap.addEventListener(utils.nameMap.dragStart, () => {
            document.addEventListener(utils.nameMap.dragMove, volumeMove);
            document.addEventListener(utils.nameMap.dragEnd, volumeUp);
            this.player.template.volumeButton.classList.add('dplayer-volume-active');
        });
        this.player.template.volumeButtonIcon.addEventListener('click', () => {
            this.muteChanger.call(this);
        });
    }

    initQualityButton() {
        if (this.player.options.video.quality) {
            this.player.template.qualityList.addEventListener('click', (e) => {
                if (e.target.classList.contains('dplayer-quality-item')) {
                    this.player.switchQuality(e.target.dataset.index);
                }
            });
        }
    }

    initScreenshotButton() {
        if (this.player.options.screenshot) {
            this.player.template.cameraButton.addEventListener('click', () => {
                this.SaveScreenshot.call(this);
            });
        }
    }

    initAirplayButton() {
        if (this.player.options.airplay) {
            if (window.WebKitPlaybackTargetAvailabilityEvent) {
                this.player.video.addEventListener(
                    'webkitplaybacktargetavailabilitychanged',
                    function (event) {
                        switch (event.availability) {
                            case 'available':
                                this.template.airplayButton.disable = false;
                                break;

                            default:
                                this.template.airplayButton.disable = true;
                        }

                        this.template.airplayButton.addEventListener(
                            'click',
                            function () {
                                this.video.webkitShowPlaybackTargetPicker();
                            }.bind(this)
                        );
                    }.bind(this.player)
                );
            } else {
                this.player.template.airplayButton.style.display = 'none';
            }
        }
    }

    initChromecast() {
        const script = window.document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('src', 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1');
        window.document.body.appendChild(script);

        window.__onGCastApiAvailable = (isAvailable) => {
            if (isAvailable) {
                cast = window.chrome.cast;
                const sessionRequest = new cast.SessionRequest(cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);
                const apiConfig = new cast.ApiConfig(
                    sessionRequest,
                    () => {},
                    (status) => {
                        if (status === cast.ReceiverAvailability.AVAILABLE) {
                            console.info('chromecast: ', status);
                        }
                    }
                );
                cast.initialize(apiConfig, () => {});
            }
        };
    }

    initChromecastButton() {
        if (this.player.options.chromecast) {
            if (runOnce) {
                runOnce = false;
                this.initChromecast();
            }
            const discoverDevices = () => {
                const subj = new Subject();
                cast.requestSession(
                    (s) => {
                        this.session = s;
                        subj.next('CONNECTED');
                        launchMedia(this.player.options.video.url);
                    },
                    (err) => {
                        if (err.code === 'cancel') {
                            this.session = undefined;
                            subj.next('CANCEL');
                        } else {
                            console.error('Error selecting a cast device', err);
                        }
                    }
                );
                return subj;
            };

            const launchMedia = (media) => {
                const mediaInfo = new cast.media.MediaInfo(media);
                const request = new cast.media.LoadRequest(mediaInfo);

                if (!this.session) {
                    window.open(media);
                    return false;
                }
                this.session.loadMedia(request, onMediaDiscovered.bind(this, 'loadMedia'), onMediaError).play();
                return true;
            };

            const onMediaDiscovered = (how, media) => {
                this.currentMedia = media;
            };

            const onMediaError = (err) => {
                console.error('Error launching media', err);
            };

            this.player.template.chromecastButton.addEventListener('click', () => {
                if (isCasting) {
                    isCasting = false;
                    this.currentMedia.stop();
                    this.session.stop();
                    this.initChromecast();
                } else {
                    isCasting = true;
                    discoverDevices();
                }
            });
        }
    }

    initSubtitleButton() {
        if (this.player.options.subtitle) {
            // if multiple than don't show this
            this.player.events.on('subtitle_show', () => {
                this.player.template.subtitleButton.dataset.balloon = this.player.translate('hide-subs');
                this.player.template.subtitleButtonInner.style.opacity = '';
                this.player.user.set('subtitle', 1);
            });
            this.player.events.on('subtitle_hide', () => {
                this.player.template.subtitleButton.dataset.balloon = this.player.translate('show-subs');
                this.player.template.subtitleButtonInner.style.opacity = '0.4';
                this.player.user.set('subtitle', 0);
            });

            this.player.template.subtitleButton.addEventListener('click', () => {
                this.player.subtitles.toggle();
            });
        }
    }

    setAutoHide() {
        this.show();
        clearTimeout(this.autoHideTimer);
        this.autoHideTimer = setTimeout(() => {
            if (this.player.video.played.length && !this.player.paused && !this.disableAutoHide) {
                this.hide();
            }
        }, 3000);
    }

    show() {
        this.player.container.classList.remove('dplayer-hide-controller');
    }

    hide() {
        this.player.container.classList.add('dplayer-hide-controller');
        this.player.setting.hide();
        this.player.comment && this.player.comment.hide();
        if (this.player.subtitles) { // only hide if present!
            this.player.subtitles.hideModal();
        }
    }

    isShow() {
        return !this.player.container.classList.contains('dplayer-hide-controller');
    }

    toggle() {
        if (this.isShow()) {
            this.hide();
        } else {
            this.show();
        }
    }
    updateChapters(object = {}, player = this.player, start = false) {
        // percentage, or time + duration, or we can get that from the video   player.video.currentTime , player.video.duration
        let { percentage, time, duration } = object;
        if (percentage) {
            duration = duration || player.video.duration;
            time = time || percentage * duration;
        } else if (time) {
            duration = duration || player.video.duration;
            percentage = percentage || time / duration;
        } else if (duration) {
            time = time || player.video.currentTime;
            percentage = percentage || time / duration;
        } else {
            duration = duration || player.video.duration;
            time = time || player.video.currentTime;
            percentage = percentage || time / duration;
        }

        if (this.chapters) {
            const { marker, mode, currentChapter } = this.chapters;
            const previous = currentChapter >= 1 ? marker[currentChapter - 1] : null;
            const next = currentChapter < marker.length - 1 ? marker[currentChapter + 1] : null;
            const current = currentChapter >= 0 && currentChapter < marker.length ? marker[currentChapter] : null;
            const previous_condition = current && current.time > time;
            const next_condition = next && next.time <= time;
            switch (mode) {
                case 'normal':
                    if (previous_condition) {
                        this.chapters.currentChapter--;
                        this.player.events.trigger('chapter', { type: 'simple', direction: 'previous', surpassed: current });
                    } else if (next_condition) {
                        this.chapters.currentChapter++;
                        this.player.events.trigger('chapter', { type: 'simple', direction: 'next', surpassed: next });
                    }
                    break;
                case 'side':
                    break;
                case 'top':
                    if (previous_condition) {
                        this.chapters.currentChapter--;
                        this.player.events.trigger('chapter', { type: 'previous', previous: currentChapter >= 2 ? marker[currentChapter - 2] : null, current: previous, next: current });
                    } else if (next_condition) {
                        this.chapters.currentChapter++;
                        this.player.events.trigger('chapter', { type: 'next', previous: current, current: next, next: currentChapter < marker.length - 2 ? marker[currentChapter + 2] : null });
                    } else if (start === true) {
                        this.player.events.trigger('chapter', { type: 'next', previous, current, next });
                    }
                    break;
            }
        }
    }

    goToChapter(number) {
        if (!this.chapters) {
            return;
        }
        const { marker, mode, currentChapter } = this.chapters;
        const actualTime = this.player.video.currentTime;
        let goToChapter = currentChapter + number;
        let togo;
        // Threshold is made for backtracing, that means, if you press Previous Chapter and you are only Threshold seconds in, you don't go back Threshold seconds, but to the previous chapter!
        const Threshold = 1.5;
        switch (mode) {
            case 'top':
                togo = goToChapter >= 0 && goToChapter < marker.length ? marker[goToChapter] : goToChapter === marker.length ? { time: this.player.video.duration } : null;
                if (number === 0 && Math.abs(togo.time - actualTime) <= Threshold) {
                    goToChapter--;
                    togo = goToChapter >= 0 && goToChapter < marker.length ? marker[goToChapter] : goToChapter === marker.length ? { time: this.player.video.duration } : null;
                }
                if (togo !== null) {
                    this.player.seek(togo.time);
                }
                break;
            case 'side':
                break;
            case 'normal':
                togo = goToChapter >= 0 && goToChapter < marker.length ? marker[goToChapter] : goToChapter === marker.length ? { time: this.player.video.duration } : goToChapter === -1 ? { time: 0 } : null;
                if (number === 0 && Math.abs(togo.time - actualTime) <= Threshold) {
                    goToChapter--;
                    togo = goToChapter >= 0 && goToChapter < marker.length ? marker[goToChapter] : goToChapter === marker.length ? { time: this.player.video.duration } : goToChapter === -1 ? { time: 0 } : null;
                }
                if (togo !== null) {
                    this.player.seek(togo.time);
                }
                break;
        }
    }

    muteChanger() {
        if (this.player.video.muted) {
            this.player.video.muted = false;
            this.player.switchVolumeIcon();
            this.player.bar.set('volume', this.player.volume());
        } else {
            this.player.video.muted = true;
            this.player.template.volumeIcon.innerHTML = Icons.volumeOff;
            this.player.bar.set('volume', 0);
        }
    }

    SaveScreenshot() {
        this.player.template.cameraButton.classList.add('taking-screenshot');
        const canvas = document.createElement('canvas');
        canvas.width = this.player.video.videoWidth;
        canvas.height = this.player.video.videoHeight;
        canvas.getContext('2d').drawImage(this.player.video, 0, 0, canvas.width, canvas.height);

        let dataURL;
        canvas.toBlob((blob) => {
            // if video hasn't loaded yet, we get an error
            if (blob) {
                dataURL = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = dataURL;
                const temp = new URL(this.player.video.currentSrc).pathname;
                const name = decodeURI(temp.substring(temp.lastIndexOf('/') + 1));
                const time = utils.secondToTime(this.player.video.currentTime, '_');
                const downloadName = `${name}_Screenshot_${time}.png`;
                link.download = downloadName;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                this.player.events.trigger('screenshot', dataURL);
                this.player.notice(this.player.translate('saved-screenshot', downloadName));
                document.body.removeChild(link);
                URL.revokeObjectURL(dataURL);
                this.player.container.click();
            } else {
                console.info('Screenshot Error, video not loaded yet!');
            }
            this.player.template.cameraButton.classList.remove('taking-screenshot');
        });
    }

    clamp(min, number, max) {
        const z = Math.max(Math.min(number, max), min);
        return z;
    }
    destroy() {
        if (!utils.isMobile) {
            this.player.container.removeEventListener('mousemove', this.setAutoHideHandler);
            this.player.container.removeEventListener('click', this.setAutoHideHandler);
        }
        clearTimeout(this.autoHideTimer);
        this.destroyed = true;
    }
}

export default Controller;
