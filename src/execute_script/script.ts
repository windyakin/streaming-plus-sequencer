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

  const skip = () => {
    video.currentTime = video.currentTime + 10;
  }
  const forward = () => {
    video.currentTime = video.currentTime - 10;
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
};
