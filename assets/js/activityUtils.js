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

  // Repair modal close controls used by older activities.
  document.addEventListener("click", function (event) {
    const closeControl = event.target.closest && event.target.closest(".close[data-modal], [data-close-modal]");
    if (closeControl) {
      const modalId = closeControl.dataset.modal || closeControl.dataset.closeModal;
      const modal = modalId ? document.getElementById(modalId) : closeControl.closest(".modal");
      if (modal) {
        modal.style.display = "none";
        modal.classList.remove("active", "show", "open");
        modal.setAttribute("aria-hidden", "true");
      }
      event.preventDefault();
      return;
    }

    if (event.target && event.target.classList && event.target.classList.contains("modal")) {
      event.target.style.display = "none";
      event.target.classList.remove("active", "show", "open");
      event.target.setAttribute("aria-hidden", "true");
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    document.querySelectorAll(".modal").forEach(function (modal) {
      if (window.getComputedStyle(modal).display !== "none") {
        modal.style.display = "none";
        modal.classList.remove("active", "show", "open");
        modal.setAttribute("aria-hidden", "true");
      }
    });
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
