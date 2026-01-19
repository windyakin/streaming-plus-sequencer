console.log('Hello streaming-plus-sequencer');

const initSequencer = () => {
  const player = document.getElementById('video0');
  const video = document.getElementById('video0_html5_api') as HTMLVideoElement;

  if (!player || !video) {
    console.error('Player is not found');
    return;
  }

  // ライブ配信の場合は表示したくないのだが、バグでライブ配信のときも表示されていたので、
  // 一旦表示する方向に変更（将来的にオプションで切り替えられるようにするかも）
  // if (player.classList.contains('vjs-live')) {
  //   console.log('This page has live streaming video');
  //   return;
  // }

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

  const overlayIconClasses = [
    'video-overlay-display-skip',
    'video-overlay-display-forward',
    'video-overlay-display-volume-up',
    'video-overlay-display-volume-down',
    'video-overlay-display-play',
    'video-overlay-display-pause',
  ] as const;

  type OverlayIconClass = (typeof overlayIconClasses)[number];

  const showOverlay = (iconClass: OverlayIconClass, text: string | null = null) => {
    controlDisplay.classList.remove(...overlayIconClasses);
    controlDisplay.classList.add(iconClass);
    controlTextElement.textContent = text || '';
    // アニメーションをリセットして再開
    controlDisplay.classList.remove('video-overlay-display-animation');
    controlTextElement.classList.remove('video-overlay-display-animation');
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        controlDisplay.classList.add('video-overlay-display-animation');
        controlTextElement.classList.add('video-overlay-display-animation');
      });
    });
  };

  const skip = () => {
    video.currentTime = video.currentTime + 10;
    showOverlay('video-overlay-display-skip');
  };

  const forward = () => {
    video.currentTime = video.currentTime - 10;
    showOverlay('video-overlay-display-forward');
  };

  const volumeUp = () => {
    video.volume = Math.min(1, video.volume + 0.1);
    showOverlay('video-overlay-display-volume-up', `${Math.round(video.volume * 100)}%`);
  };

  const volumeDown = () => {
    video.volume = Math.max(0, video.volume - 0.1);
    showOverlay('video-overlay-display-volume-down', `${Math.round(video.volume * 100)}%`);
  };

  const togglePlayPause = () => {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  // シーク中・動画終了時はplay/pauseオーバーレイを表示しない
  let isSeeking = false;
  let isEnded = false;
  let pendingPlayPauseTimer: number | null = null;

  const cancelPendingPlayPause = () => {
    if (pendingPlayPauseTimer !== null) {
      clearTimeout(pendingPlayPauseTimer);
      pendingPlayPauseTimer = null;
    }
  };

  video.addEventListener('seeking', () => {
    isSeeking = true;
    cancelPendingPlayPause();
  });

  video.addEventListener('seeked', () => {
    // seeked後も少し待ってからフラグを解除（play/pauseイベントが遅れて来る場合に対応）
    pendingPlayPauseTimer = window.setTimeout(() => {
      isSeeking = false;
      pendingPlayPauseTimer = null;
    }, 50);
  });

  video.addEventListener('ended', () => {
    isEnded = true;
    cancelPendingPlayPause();
  });

  // 動画の再生/一時停止イベントをリッスン
  video.addEventListener('play', () => {
    isEnded = false;
    if (isSeeking) return;
    cancelPendingPlayPause();
    pendingPlayPauseTimer = window.setTimeout(() => {
      if (!isSeeking) {
        showOverlay('video-overlay-display-play');
      }
      pendingPlayPauseTimer = null;
    }, 50);
  });

  video.addEventListener('pause', () => {
    if (isSeeking || isEnded) return;
    cancelPendingPlayPause();
    pendingPlayPauseTimer = window.setTimeout(() => {
      if (!isSeeking && !isEnded) {
        showOverlay('video-overlay-display-pause');
      }
      pendingPlayPauseTimer = null;
    }, 50);
  });

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
        togglePlayPause();
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
