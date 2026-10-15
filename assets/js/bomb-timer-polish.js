(function () {
  'use strict';

  let audioUnlocked = false;
  let activeMedia = null;
  const nativePlay = HTMLMediaElement.prototype.play;

  HTMLMediaElement.prototype.play = function () {
    if (!audioUnlocked) {
      try { this.pause(); this.currentTime = 0; } catch (_) {}
      return Promise.resolve();
    }
    if (activeMedia && activeMedia !== this) {
      try { activeMedia.pause(); activeMedia.currentTime = 0; } catch (_) {}
    }
    activeMedia = this;
    const result = nativePlay.call(this);
    return result && typeof result.catch === 'function' ? result.catch(function () {}) : result;
  };

  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    document.documentElement.classList.add('bomb-audio-ready');
    const badge = document.getElementById('bombAudioBadge');
    if (badge) badge.textContent = '🔊 الصوت جاهز';
  }

  function stopAudio() {
    try { if (activeMedia) { activeMedia.pause(); activeMedia.currentTime = 0; } } catch (_) {}
    document.querySelectorAll('audio,video').forEach(function (media) {
      try { media.pause(); media.currentTime = 0; } catch (_) {}
    });
  }

  stopAudio();
  document.addEventListener('pointerdown', unlockAudio, { capture: true, once: true });
  document.addEventListener('keydown', unlockAudio, { capture: true, once: true });
  window.addEventListener('pagehide', stopAudio);

  const css = `
    :root{--bomb-night:#111827;--bomb-panel:#1f2937;--bomb-gold:#fbbf24;--bomb-orange:#f97316;--bomb-red:#ef4444;--bomb-green:#22c55e;--bomb-cyan:#22d3ee}
    body{background:radial-gradient(circle at 52% 28%,rgba(249,115,22,.12),transparent 30%),linear-gradient(145deg,#090f1d,#151829 55%,#0b1220)!important}
    .top-toolbar{background:rgba(9,15,29,.94)!important;border-bottom:1px solid rgba(251,191,36,.3)!important;box-shadow:0 10px 30px rgba(0,0,0,.28)!important;backdrop-filter:blur(12px)}
    .toolbar-btn{border:1px solid rgba(251,191,36,.25)!important;background:rgba(255,255,255,.055)!important;box-shadow:none!important}.toolbar-btn:hover{background:var(--bomb-gold)!important;color:#111827!important;transform:translateY(-2px)}
    .header{padding:2rem 1rem 1.5rem!important;background:linear-gradient(135deg,rgba(17,24,39,.94),rgba(31,41,55,.92))!important;border-bottom:1px solid rgba(251,191,36,.18)}
    .header-title{font-size:clamp(1.9rem,5vw,3.25rem)!important;background:linear-gradient(90deg,#fff7cc,#fbbf24,#fb923c)!important;background-clip:text!important;-webkit-background-clip:text!important;-webkit-text-fill-color:transparent;text-shadow:none!important}
    .header-subtitle{max-width:900px;margin:.65rem auto 0!important;color:#e5e7eb!important;line-height:1.9!important;font-size:clamp(.92rem,2vw,1.12rem)!important}
    .bomb-mode-guide{max-width:1050px;margin:1rem auto 0;display:grid;grid-template-columns:repeat(3,1fr);gap:.65rem}
    .bomb-mode-guide span{padding:.7rem .8rem;border-radius:14px;background:rgba(255,255,255,.065);border:1px solid rgba(255,255,255,.1);color:#f8fafc;font-weight:800;font-size:.85rem}
    .main-content{gap:1.25rem!important;align-items:start!important}.game-info{gap:.7rem!important}.info-card{background:linear-gradient(145deg,rgba(31,41,55,.97),rgba(17,24,39,.97))!important;border:1px solid rgba(251,191,36,.38)!important;border-radius:18px!important;box-shadow:0 10px 25px rgba(0,0,0,.18)!important;transition:.22s}.info-card:hover{transform:translateY(-3px);border-color:var(--bomb-gold)!important}
    .bomb-area{background:radial-gradient(circle at 50% 55%,rgba(251,191,36,.14),transparent 35%),linear-gradient(155deg,#111827,#1b2535)!important;border:1px solid rgba(251,191,36,.18);border-radius:28px!important;box-shadow:0 24px 60px rgba(0,0,0,.34)!important;padding:1.5rem!important}
    #bomb{filter:drop-shadow(0 0 22px rgba(251,191,36,.32));transition:.25s}.bomb-urgent #bomb{animation:bombUrgent .62s infinite;filter:drop-shadow(0 0 32px rgba(239,68,68,.75))}@keyframes bombUrgent{50%{transform:scale(1.055)}}
    #timerDisplay{font-size:clamp(1.65rem,4vw,2.5rem)!important}.bomb-urgent #timerDisplay{color:#fecaca!important;text-shadow:0 0 22px #ef4444!important}
    #bombMessage{max-width:620px;margin:1rem auto 0!important;border-radius:15px!important;line-height:1.7}
    .teacher-controls{background:linear-gradient(155deg,rgba(31,41,55,.98),rgba(17,24,39,.98))!important;border:1px solid rgba(251,191,36,.2)!important;border-radius:24px!important;box-shadow:0 22px 50px rgba(0,0,0,.28)!important;padding:1.25rem!important}
    .teacher-controls h3{color:#fff!important}.control-section{background:rgba(255,255,255,.035);padding:.75rem;border-radius:15px;margin-bottom:.65rem!important}
    .modern-select{background:#111827!important;color:#f8fafc!important;border:1px solid rgba(251,191,36,.4)!important;border-radius:13px!important;min-height:50px}.modern-select:focus{outline:0;border-color:var(--bomb-gold)!important;box-shadow:0 0 0 4px rgba(251,191,36,.14)!important}
    .classact-bomb-loader{background:linear-gradient(145deg,#fffaf0,#fff7ed)!important;border:0!important;border-radius:20px!important;box-shadow:0 12px 30px rgba(0,0,0,.18)!important}.classact-bomb-modes{display:grid!important;grid-template-columns:repeat(3,1fr)!important}.classact-bomb-mode{min-height:48px;border-radius:13px!important}.classact-bomb-mode.active{background:linear-gradient(135deg,#c2410c,#f97316)!important;box-shadow:0 8px 18px rgba(194,65,12,.23)}
    .classact-bomb-question{border:0!important;border-right:6px solid var(--bomb-orange)!important;border-radius:22px!important;box-shadow:0 18px 45px rgba(0,0,0,.22)!important;animation:bombCardIn .35s ease both}@keyframes bombCardIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
    .classact-bomb-text{background:linear-gradient(135deg,#fff7ed,#fffbeb)!important;font-size:clamp(1.08rem,3vw,1.5rem)!important}.classact-bomb-number{background:#111827;color:#fff;padding:.35rem .65rem;border-radius:999px;font-weight:900}
    .oman-btn{border-radius:14px!important;min-height:50px!important;transition:.2s!important}.oman-btn:hover{transform:translateY(-3px) scale(1.01)!important}
    #defuseBtn{background:linear-gradient(135deg,#22c55e,#15803d)!important;color:#fff!important;box-shadow:0 10px 24px rgba(34,197,94,.23)!important}#activateBombBtn{background:linear-gradient(135deg,#fb7185,#be123c)!important;box-shadow:0 10px 24px rgba(190,18,60,.23)!important}
    .bomb-audio-badge{position:fixed;top:5.2rem;left:1rem;z-index:1200;padding:.5rem .8rem;border-radius:999px;background:#fff7d6;color:#854d0e;border:1px solid #fde68a;font-size:.78rem;font-weight:900;box-shadow:0 8px 22px rgba(0,0,0,.2)}.bomb-audio-ready .bomb-audio-badge{background:#dcfce7;color:#166534;border-color:#86efac}
    .bomb-quick-guide{display:grid;grid-template-columns:repeat(4,1fr);gap:.55rem;margin:.8rem 0 1rem}.bomb-quick-guide div{padding:.65rem;border-radius:13px;background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.18);color:#e5e7eb;text-align:center;font-weight:800;font-size:.78rem}
    @media(max-width:850px){.bomb-mode-guide{grid-template-columns:1fr}.bomb-quick-guide{grid-template-columns:1fr 1fr}.classact-bomb-modes{grid-template-columns:1fr!important}.bomb-audio-badge{top:4.6rem;left:.5rem}.main-content{padding:.75rem!important}.teacher-controls,.bomb-area{border-radius:19px!important}}
    @media(max-width:480px){.bomb-quick-guide{grid-template-columns:1fr}.header{padding-top:1.2rem!important}.info-card{padding:.75rem!important}}
    @media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;animation-iteration-count:1!important;transition:none!important}}
  `;

  function rewriteLegacyCopy() {
    const subtitle = document.querySelector('.header-subtitle');
    if (subtitle) subtitle.textContent = 'تحدٍ سريع يدعم الأسئلة الشفهية، والقوالب المستوردة، والوضع المختلط. اختر الطالب، اعرض السؤال، ثم أوقف القنبلة قبل انتهاء الوقت!';

    const modalBody = document.querySelector('#instructionsModal .modal-body');
    if (modalBody) {
      modalBody.innerHTML = `
        <div class="bomb-instructions">
          <h3>🎯 هدف النشاط</h3>
          <p>يجيب الطالب قبل انتهاء المؤقت. الإجابة الصحيحة تُبطل القنبلة وتضيف النقاط، والخاطئة تفجّرها وتُنقل للسجل.</p>
          <h3>📚 اختر طريقة الأسئلة</h3>
          <p><b>شفهية:</b> يطرح المعلم السؤال مباشرة. <b>مستوردة:</b> يعرض النشاط سؤال القالب وتلميحه وإجابته. <b>مختلطة:</b> تستخدم القالب مع حرية الانتقال إلى سؤال شفهي.</p>
          <h3>🕹️ خطوات الجولة</h3>
          <ol><li>اختر الصف والطالب أو استخدم الاختيار العشوائي.</li><li>حدد طريقة الأسئلة وزمن الجولة.</li><li>اضغط «بدء المؤقت» واقرأ السؤال.</li><li>اضغط «إبطال القنبلة» للصحيحة أو «تفعيل القنبلة» للخاطئة.</li></ol>
          <div class="quick-tip"><b>أفضل تشغيل:</b> 10–20 سؤالًا، وزمن 30–60 ثانية للسؤال، مع جولة واحدة على الأقل لكل طالب.</div>
        </div>
        <button class="oman-btn gold" type="button" data-close-bomb-help>فهمت، لنبدأ!</button>`;
      modalBody.querySelector('[data-close-bomb-help]')?.addEventListener('click', function () {
        if (typeof window.closeModal === 'function') window.closeModal('instructionsModal');
        else document.getElementById('instructionsModal').style.display = 'none';
      });
    }
  }

  function mountEnhancements() {
    stopAudio();
    const style = document.createElement('style');
    style.id = 'bombTimerPolishCss';
    style.textContent = css;
    document.head.appendChild(style);

    const badge = document.createElement('div');
    badge.id = 'bombAudioBadge';
    badge.className = 'bomb-audio-badge';
    badge.setAttribute('role', 'status');
    badge.textContent = '🔇 الصوت يبدأ بعد تفاعلك';
    document.body.appendChild(badge);

    const header = document.querySelector('.header');
    if (header && !header.querySelector('.bomb-mode-guide')) {
      const guide = document.createElement('div');
      guide.className = 'bomb-mode-guide';
      guide.innerHTML = '<span>🎙️ شفهي: سؤال مباشر من المعلم</span><span>📚 مستورد: سؤال وتلميح وإجابة</span><span>✨ مختلط: مرونة بين الطريقتين</span>';
      header.appendChild(guide);
    }

    const controls = document.querySelector('.teacher-controls');
    if (controls && !controls.querySelector('.bomb-quick-guide')) {
      const quick = document.createElement('div');
      quick.className = 'bomb-quick-guide';
      quick.innerHTML = '<div>1️⃣ اختر الطريقة</div><div>2️⃣ اختر الطالب</div><div>3️⃣ ابدأ المؤقت</div><div>4️⃣ سجّل النتيجة</div>';
      const loader = document.getElementById('classactBombLoader');
      (loader || controls.firstElementChild)?.insertAdjacentElement('afterend', quick);
    }

    rewriteLegacyCopy();

    const timer = document.getElementById('timerDisplay');
    const area = document.querySelector('.bomb-area');
    if (timer && area) {
      const updateUrgency = function () {
        const parts = timer.textContent.trim().split(':').map(Number);
        const seconds = parts.length === 2 ? parts[0] * 60 + parts[1] : Number(timer.textContent);
        area.classList.toggle('bomb-urgent', Number.isFinite(seconds) && seconds > 0 && seconds <= 10);
      };
      new MutationObserver(updateUrgency).observe(timer, { childList: true, characterData: true, subtree: true });
      updateUrgency();
    }

    document.getElementById('soundBtn')?.setAttribute('aria-label', 'كتم أو تشغيل مؤثرات القنبلة');
  }

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', mountEnhancements) : mountEnhancements();
})();
