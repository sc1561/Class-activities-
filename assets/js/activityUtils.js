(function () {
  "use strict";

  // Compatibility layer for school browsers and restricted networks.
  // Visual and audio effects must never stop the activity itself.
  if (typeof window.confetti !== "function") {
    window.confetti = function () {
      return Promise.resolve();
    };
  }

  if (typeof window.HTMLMediaElement !== "undefined") {
    const mediaPrototype = window.HTMLMediaElement.prototype;
    if (!mediaPrototype.__classActivitiesSafePlay) {
      const nativePlay = mediaPrototype.play;
      mediaPrototype.play = function () {
        try {
          const result = nativePlay.call(this);
          if (result && typeof result.catch === "function") {
            return result.catch(function () {
              return false;
            });
          }
          return result;
        } catch (error) {
          return Promise.resolve(false);
        }
      };
      Object.defineProperty(mediaPrototype, "__classActivitiesSafePlay", {
        value: true,
        configurable: false,
        enumerable: false
      });
    }
  }

  window.addEventListener("unhandledrejection", function (event) {
    const reason = event.reason;
    const name = reason && reason.name;
    if (name === "NotAllowedError" || name === "NotSupportedError" || name === "AbortError") {
      event.preventDefault();
    }
  });

  window.ClassActivitiesCompat = {
    safePlay: function (media) {
      if (!media || typeof media.play !== "function") return Promise.resolve(false);
      try {
        const result = media.play();
        return result && typeof result.catch === "function"
          ? result.catch(function () { return false; })
          : Promise.resolve(true);
      } catch (error) {
        return Promise.resolve(false);
      }
    },
    effectsAvailable: typeof window.confetti === "function"
  };
})();
