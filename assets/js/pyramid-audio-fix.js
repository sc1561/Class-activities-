(function () {
  'use strict';
  const NativeAudio = window.Audio;
  const misplaced = new Set(['achievement-unlock.mp3', 'battle-victory.mp3', 'crowd-cheer.mp3']);
  function PyramidAudio(source) {
    if (typeof source === 'string') {
      const prefix = '../assets/media/sounds/';
      const name = source.startsWith(prefix) ? source.slice(prefix.length) : '';
      if (misplaced.has(name)) source = prefix + 'kingdom-sounds/' + name;
    }
    const audio = source === undefined ? new NativeAudio() : new NativeAudio(source);
    audio.setAttribute('playsinline', '');
    return audio;
  }
  PyramidAudio.prototype = NativeAudio.prototype;
  window.Audio = PyramidAudio;
}());
