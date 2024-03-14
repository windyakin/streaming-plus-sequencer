export default function () {
  console.log('Hello streaming-plus-sequencer');
  const player = document.getElementById('video0');
  const video = document.getElementById('video0_html5_api') as HTMLVideoElement;

  if (!player || !video) {
    console.error('Player is not found');
    return;
  }

  const playerHasClasses = player?.getAttribute('class')?.split(' ') || []

  if (playerHasClasses.indexOf('vjs-live') !== -1) {
    console.log('This page has live streaming video');
    return;
  }

  const controlDisplay = document.createElement('div');
  controlDisplay.setAttribute('class', 'video-overlay-display');

  player.appendChild(controlDisplay);

  const startAnimation = () => {
    controlDisplay.classList.remove('video-overlay-display-animation');
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        controlDisplay.classList.add('video-overlay-display-animation');
      });
    });
  };

  const skip = () => {
    video.currentTime = video.currentTime + 10;
    controlDisplay.classList.remove('video-overlay-display-forward');
    controlDisplay.classList.add('video-overlay-display-skip');
    startAnimation();
  }
  const forward = () => {
    video.currentTime = video.currentTime - 10;
    controlDisplay.classList.remove('video-overlay-display-skip');
    controlDisplay.classList.add('video-overlay-display-forward');
    startAnimation();
  }

  const controlBarElements = document.getElementsByClassName('vjs-control-bar');
  if (controlBarElements.length !== 1) {
    console.error('control bar is not found');
    return;
  }
  const volumeControllerElements = document.getElementsByClassName('vjs-volume-panel');
  if (volumeControllerElements.length !== 1) {
    console.error('volume controller is not found');
    return;
  }

  const forwardButton = document.createElement('button');
  forwardButton.setAttribute('class', 'vjs-play-control vjs-control vjs-button vjs-playing sps-button sps-forward-button');
  forwardButton.setAttribute('type', 'button');
  forwardButton.addEventListener('click', forward);

  const skipButton = document.createElement('button');
  skipButton.setAttribute('class', 'vjs-play-control vjs-control vjs-button vjs-playing sps-button sps-skip-button');
  skipButton.setAttribute('type', 'button');
  skipButton.addEventListener('click', skip);

  controlBarElements[0].insertBefore(forwardButton, volumeControllerElements.item(0));
  controlBarElements[0].insertBefore(skipButton, volumeControllerElements.item(0));

  const keyEventOverrideInput = document.createElement('input');
  keyEventOverrideInput.setAttribute('type', 'text');
  keyEventOverrideInput.setAttribute('id', 'sps-override-input');
  keyEventOverrideInput.addEventListener('keydown', (event) => {
    if (event.code === 'ArrowRight') {
      skip();
    }
    if (event.code === 'ArrowLeft') {
      forward();
    }
    if (event.code === 'Space') {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
  });
  player.appendChild(keyEventOverrideInput);

  player.addEventListener('click', () => {
    keyEventOverrideInput.focus();
  });
};
