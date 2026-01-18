console.log('Hello streaming-plus-sequencer');

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${('0' + minutes).slice(-2)}:${('0' + secs).slice(-2)}`;
  }
  return `${minutes}:${('0' + secs).slice(-2)}`;
};

const initSequencer = () => {
  const player = document.getElementById('video0');
  const video = document.getElementById('video0_html5_api') as HTMLVideoElement;

  if (!player || !video) {
    console.error('Player is not found');
    return;
  }

  // ライブ配信の場合は何もしない
  if (player.classList.contains('vjs-live')) {
    console.log('This page has live streaming video');
    return;
  }

  // 既に初期化済みの場合はスキップ
  if (document.querySelector('.sps-button')) {
    return;
  }

  const controlDisplayContainer = document.createElement('div');
  controlDisplayContainer.setAttribute('class', 'video-overlay-display-container');
  player.appendChild(controlDisplayContainer);

  const controlDisplay = document.createElement('div');
  controlDisplay.setAttribute('class', 'video-overlay-display');

  const controlTextElement = document.createElement('div');
  controlTextElement.setAttribute('class', 'video-overlay-display-text');

  controlDisplayContainer.appendChild(controlDisplay);
  controlDisplayContainer.appendChild(controlTextElement);

  const startAnimation = () => {
    controlDisplay.classList.remove('video-overlay-display-animation');
    controlTextElement.classList.remove('video-overlay-display-animation');
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        controlDisplay.classList.add('video-overlay-display-animation');
        controlTextElement.classList.add('video-overlay-display-animation');
      });
    });
  };

  const skip = () => {
    video.currentTime = video.currentTime + 10;
    controlDisplay.classList.remove('video-overlay-display-forward', 'video-overlay-display-volume-up', 'video-overlay-display-volume-down');
    controlDisplay.classList.add('video-overlay-display-skip');
    controlTextElement.textContent = formatTime(video.currentTime);
    startAnimation();
  };

  const forward = () => {
    video.currentTime = video.currentTime - 10;
    controlDisplay.classList.remove('video-overlay-display-skip', 'video-overlay-display-volume-up', 'video-overlay-display-volume-down');
    controlDisplay.classList.add('video-overlay-display-forward');
    controlTextElement.textContent = formatTime(video.currentTime);
    startAnimation();
  };

  const volumeUp = () => {
    video.volume = Math.min(1, video.volume + 0.1);
    controlDisplay.classList.remove('video-overlay-display-skip', 'video-overlay-display-forward', 'video-overlay-display-volume-down');
    controlDisplay.classList.add('video-overlay-display-volume-up');
    controlTextElement.textContent = `${Math.round(video.volume * 100)}%`;
    startAnimation();
  };

  const volumeDown = () => {
    video.volume = Math.max(0, video.volume - 0.1);
    controlDisplay.classList.remove('video-overlay-display-skip', 'video-overlay-display-forward', 'video-overlay-display-volume-up');
    controlDisplay.classList.add('video-overlay-display-volume-down');
    controlTextElement.textContent = `${Math.round(video.volume * 100)}%`;
    startAnimation();
  };

  const controlBarElements = document.getElementsByClassName('vjs-control-bar');
  const volumeControllerElements = document.getElementsByClassName('vjs-volume-panel');

  if (controlBarElements.length === 1 && volumeControllerElements.length === 1) {
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
      if (event.code === 'ArrowUp') {
        volumeUp();
      }
      if (event.code === 'ArrowDown') {
        volumeDown();
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

    console.log('Sequencer initialized');
  } else {
    console.error('control bar or volume controller is not found');
  }
};

// video.js の初期化を待つために MutationObserver を使用
const waitForPlayer = () => {
  const player = document.getElementById('video0');

  if (player) {
    // プレイヤーが見つかった場合、クラスの変化を監視
    const observer = new MutationObserver(() => {
      // vjs-has-started クラスが付与されたら初期化（プレイヤー準備完了）
      if (player.classList.contains('vjs-has-started')) {
        observer.disconnect();
        initSequencer();
      }
    });

    observer.observe(player, { attributes: true, attributeFilter: ['class'] });

    // 既に準備完了している場合は即時実行
    if (player.classList.contains('vjs-has-started')) {
      initSequencer();
    }
  } else {
    // プレイヤーがまだない場合は DOM の変化を監視
    const bodyObserver = new MutationObserver(() => {
      if (document.getElementById('video0')) {
        bodyObserver.disconnect();
        waitForPlayer();
      }
    });

    bodyObserver.observe(document.body, { childList: true, subtree: true });
  }
};

waitForPlayer();
