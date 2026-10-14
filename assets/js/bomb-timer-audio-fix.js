(function () {
  'use strict';

  const NativeAudio = window.Audio;
  const local = {
    click: '../assets/media/sounds/Click.mp3',
    start: '../assets/media/sounds/start-timer.mp3',
    tick: '../assets/media/sounds/countdown-beep.mp3',
    success: '../assets/media/sounds/clap.mp3',
    end: '../assets/media/sounds/end-timer.mp3'
  };

  function safeSource(source) {
    if (!source || typeof source !== 'string') return local.click;
    if (/^(data:|blob:)/i.test(source)) return source;
    if (/^\.\.\/assets\/media\/sounds\//i.test(source)) return source;

    const value = source.toLowerCase();
    if (/tick|count|warning|clock|fuse/.test(value)) return local.tick;
    if (/success|correct|defus|win|cheer|clap|honor|point/.test(value)) return local.success;
    if (/bomb|explos|wrong|fail|danger|end/.test(value)) return local.end;
    if (/start|begin|launch/.test(value)) return local.start;
    return local.click;
  }

  function SafeAudio(source) {
    const audio = new NativeAudio(safeSource(source));
    audio.preload = 'auto';
    audio.setAttribute('playsinline', '');
    const nativePlay = audio.play.bind(audio);
    audio.play = function () {
      const result = nativePlay();
      if (result && typeof result.catch === 'function') result.catch(function () {});
      return result;
    };
    return audio;
  }

  SafeAudio.prototype = NativeAudio.prototype;
  try { window.Audio = SafeAudio; } catch (_) {}

  window.setupTimerDurationSelect = window.setupTimerDurationSelect || function () {
    const select = document.getElementById('timerDurationSelect');
    if (!select || select.dataset.classactReady === '1') return;
    select.dataset.classactReady = '1';
    select.addEventListener('change', function () {
      const seconds = Number.parseInt(select.value, 10);
      if (!Number.isFinite(seconds) || seconds <= 0) return;
      try {
        if (typeof customTimerDuration !== 'undefined') customTimerDuration = seconds;
      } catch (_) {}
    });
  };

  function stopAudio() {
    document.querySelectorAll('audio').forEach(function (audio) {
      try { audio.pause(); audio.currentTime = 0; } catch (_) {}
    });
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden && window.kingdomAudio) {
      try { window.kingdomAudio.pause(); } catch (_) {}
    }
  });
  window.addEventListener('pagehide', stopAudio);
})();