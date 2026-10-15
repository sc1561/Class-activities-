(function () {
  'use strict';

  // لا يسمح لأي صوت أن يبدأ قبل أول تفاعل صريح من المستخدم.
  let audioUnlocked = false;
  const nativePlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    if (!audioUnlocked) {
      try { this.pause(); this.currentTime = 0; } catch (_) {}
      return Promise.resolve();
    }
    // مؤثر واحد واضح في كل لحظة؛ يمنع تراكب النقرة مع النجاح أو الفوز.
    if (this.tagName === 'AUDIO') {
      document.querySelectorAll('audio').forEach(function (other) {
        if (other === this) return;
        try { other.pause(); other.currentTime = 0; } catch (_) {}
      }, this);
    }
    const result = nativePlay.call(this);
    return result && typeof result.catch === 'function' ? result.catch(function () {}) : result;
  };

  function stopAllAudio() {
    document.querySelectorAll('audio,video').forEach(function (media) {
      try { media.pause(); media.currentTime = 0; } catch (_) {}
    });
  }

  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    document.documentElement.classList.add('bb-audio-ready');
    const badge = document.getElementById('bbAudioBadge');
    if (badge) {
      badge.textContent = '🔊 الصوت جاهز';
      badge.setAttribute('aria-label', 'الصوت جاهز ويعمل عند أحداث اللعبة');
    }
  }

  stopAllAudio();
  window.addEventListener('pageshow', stopAllAudio, { once: true });
  document.addEventListener('pointerdown', unlockAudio, { capture: true, once: true });
  document.addEventListener('keydown', unlockAudio, { capture: true, once: true });

  const css = `
    :root{--bb-ink:#082f49;--bb-night:#071d2b;--bb-cyan:#22d3ee;--bb-green:#16a34a;--bb-red:#e11d48;--bb-gold:#fbbf24}
    body{background:radial-gradient(circle at 12% 10%,rgba(34,211,238,.13),transparent 26%),radial-gradient(circle at 88% 22%,rgba(251,191,36,.11),transparent 24%),linear-gradient(145deg,#f8fbff,#eef7f7 55%,#f8fafc)!important}
    .control-header{background:rgba(7,29,43,.94)!important;border:0!important;box-shadow:0 8px 28px rgba(7,29,43,.18)!important}
    .app-title{color:#fff!important}.control-btn{background:rgba(255,255,255,.1)!important;color:#fff!important;border-color:rgba(255,255,255,.18)!important}
    .control-btn:hover{background:#fff!important;color:var(--bb-ink)!important;border-color:#fff!important}
    .main-container{max-width:1500px!important}.game-header{padding:1.35rem 1.5rem!important;background:linear-gradient(125deg,#082f49,#0f5164)!important;color:#fff!important;box-shadow:0 18px 45px rgba(8,47,73,.2)!important}
    .game-header:before{height:5px!important;background:linear-gradient(90deg,var(--bb-green),var(--bb-gold),var(--bb-red))!important}
    .game-title{font-size:clamp(1.65rem,4vw,2.65rem)!important;background:linear-gradient(90deg,#fff,#cffafe,#fde68a)!important;background-clip:text!important;-webkit-background-clip:text!important}
    .game-subtitle{color:#d8f6fb!important}.settings-panel{border:1px solid rgba(8,47,73,.08)!important;box-shadow:0 14px 35px rgba(15,23,42,.09)!important}
    .settings-panel:before{content:'جهّز الفرق ← اختر النمط ← ابدأ التحدي';display:block;margin:-.25rem 0 1.25rem;padding:.75rem 1rem;border-radius:14px;background:#ecfeff;color:#155e75;font-weight:800;text-align:center}
    .setting-select{background:#fbfdff!important}.setting-select:focus{border-color:var(--bb-cyan)!important;box-shadow:0 0 0 4px rgba(34,211,238,.16)!important}
    .action-btn{border-radius:16px!important;min-height:52px;box-shadow:0 8px 18px rgba(15,23,42,.12)!important}.action-btn:hover{transform:translateY(-3px) scale(1.015)!important}
    #startGameBtn{background:linear-gradient(135deg,#0f766e,#16a34a)!important}#resetGameBtn{background:linear-gradient(135deg,#334155,#0f172a)!important}
    .game-area{position:relative;align-items:stretch!important;background:linear-gradient(145deg,#071d2b,#0b3445)!important;padding:1.2rem;border-radius:28px;box-shadow:0 22px 55px rgba(7,29,43,.28)!important}
    .bb-match-hud{grid-column:1/-1;display:grid;grid-template-columns:1fr auto 1fr;gap:.8rem;align-items:center;color:#fff;margin-bottom:.15rem}
    .bb-route{display:flex;align-items:center;justify-content:center;gap:.55rem;padding:.7rem 1rem;border-radius:999px;font-weight:800}.bb-route.green{background:rgba(22,163,74,.24);border:1px solid rgba(74,222,128,.42)}.bb-route.red{background:rgba(225,29,72,.23);border:1px solid rgba(251,113,133,.42)}
    .bb-turn{padding:.72rem 1rem;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);border-radius:16px;text-align:center;font-weight:800}
    .board-container{background:rgba(255,255,255,.98)!important;border:0!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.4),0 14px 32px rgba(0,0,0,.24)!important}
    .board-title{color:var(--bb-ink)!important;margin-bottom:1rem!important}.hexagon-board{max-width:650px!important;gap:.65rem!important}
    .hex-cell{background:linear-gradient(145deg,#fff,#e8f2f5)!important;border-color:#b9d4dc!important;border-radius:22px!important;box-shadow:0 6px 0 #a8c5ce,0 10px 18px rgba(7,29,43,.11);min-height:72px;isolation:isolate}
    .hex-cell:hover{transform:translateY(-5px) rotate(-1deg)!important;border-color:var(--bb-gold)!important;box-shadow:0 9px 0 #d6a91a,0 15px 24px rgba(7,29,43,.17)!important}.hex-cell:active{transform:translateY(1px) scale(.96)!important;box-shadow:0 3px 0 #94a3b8!important}
    .hex-cell.green{background:linear-gradient(145deg,#22c55e,#15803d)!important;border-color:#86efac!important;box-shadow:0 6px 0 #166534,0 10px 18px rgba(22,101,52,.25)!important}.hex-cell.red{background:linear-gradient(145deg,#fb4268,#be123c)!important;border-color:#fda4af!important;box-shadow:0 6px 0 #881337,0 10px 18px rgba(136,19,55,.25)!important}
    .hex-cell.bb-pop{animation:bbTilePop .42s cubic-bezier(.2,.9,.25,1.4)}@keyframes bbTilePop{50%{transform:scale(1.17) rotate(3deg)}}
    .team-panel{border:0!important;color:#fff!important;box-shadow:0 14px 30px rgba(0,0,0,.2)!important}.team-panel.green{background:linear-gradient(160deg,#166534,#15803d)!important}.team-panel.red{background:linear-gradient(160deg,#9f1239,#be123c)!important}
    .team-panel .team-name,.team-panel .team-score,.team-panel .team-strategy{color:#fff!important}.team-members{background:rgba(255,255,255,.14)!important;color:#fff!important}.team-score{text-shadow:0 4px 12px rgba(0,0,0,.25)}
    .modal-overlay{background:rgba(2,15,23,.8)!important}.modal-content{border:1px solid rgba(255,255,255,.55);box-shadow:0 30px 80px rgba(0,0,0,.42)!important;animation:bbModalIn .32s ease both}@keyframes bbModalIn{from{transform:translateY(18px) scale(.95);opacity:0}to{transform:none;opacity:1}}
    .team-selection-modal .modal-content,#teamSelectionModal .modal-content{max-width:650px!important;background:linear-gradient(160deg,#fff,#f1fbfc)!important}.team-selection-title{font-size:clamp(1.15rem,3vw,1.55rem)!important;line-height:1.8;padding:1rem;background:#fff;border-radius:16px;box-shadow:0 8px 24px rgba(8,47,73,.08)}
    .team-btn{min-height:58px;border-radius:18px!important}.team-btn:hover{transform:translateY(-4px) scale(1.025)!important}
    #victoryModal .modal-content{overflow:hidden;background:linear-gradient(150deg,#fff7d6,#fff,#e6fffb)!important}.victory-animation{font-size:4.5rem!important}.victory-title{color:var(--bb-ink);text-shadow:0 2px #fff}
    .bb-audio-badge{position:fixed;top:5.45rem;left:1rem;z-index:1100;padding:.48rem .8rem;border-radius:999px;background:#fff7d6;color:#854d0e;border:1px solid #fde68a;font-size:.78rem;font-weight:800;box-shadow:0 8px 20px rgba(15,23,42,.12);transition:.25s}.bb-audio-ready .bb-audio-badge{background:#dcfce7;color:#166534;border-color:#86efac}
    .bb-confetti{position:fixed;top:-20px;z-index:3000;width:10px;height:18px;border-radius:3px;pointer-events:none;animation:bbFall 2.7s linear forwards}@keyframes bbFall{to{transform:translate3d(var(--drift),110vh,0) rotate(780deg);opacity:.9}}
    @media(max-width:1200px){.bb-match-hud{order:-2}.team-panel.green{order:-1}.board-container{order:0}.team-panel.red{order:1}}
    @media(max-width:768px){.bb-audio-badge{top:7.3rem;left:.55rem}.game-area{padding:.7rem!important;border-radius:20px!important}.bb-match-hud{grid-template-columns:1fr 1fr}.bb-turn{grid-column:1/-1;grid-row:1}.hexagon-board{gap:.35rem!important}.hex-cell{min-height:54px!important;border-radius:15px!important}.board-container{padding:.85rem!important}.game-header{padding:1rem!important}.settings-panel:before{font-size:.85rem}}
    @media(prefers-reduced-motion:reduce){.hex-cell,.action-btn,.modal-content{animation:none!important;transition:none!important}.bb-confetti{display:none!important}}
  `;

  function celebrate() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const colors = ['#16a34a', '#e11d48', '#fbbf24', '#22d3ee', '#ffffff'];
    for (let i = 0; i < 58; i++) {
      const bit = document.createElement('i');
      bit.className = 'bb-confetti';
      bit.style.left = Math.random() * 100 + 'vw';
      bit.style.background = colors[i % colors.length];
      bit.style.setProperty('--drift', (Math.random() * 180 - 90) + 'px');
      bit.style.animationDelay = (Math.random() * .55) + 's';
      bit.style.animationDuration = (2.1 + Math.random() * 1.4) + 's';
      document.body.appendChild(bit);
      setTimeout(function () { bit.remove(); }, 4200);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    stopAllAudio();
    const style = document.createElement('style');
    style.id = 'blockbusters-polish-styles';
    style.textContent = css;
    document.head.appendChild(style);

    const badge = document.createElement('div');
    badge.id = 'bbAudioBadge';
    badge.className = 'bb-audio-badge';
    badge.setAttribute('role', 'status');
    badge.textContent = '🔇 الصوت يبدأ بعد تفاعلك';
    document.body.appendChild(badge);

    const area = document.getElementById('gameArea');
    if (area && !area.querySelector('.bb-match-hud')) {
      const hud = document.createElement('div');
      hud.className = 'bb-match-hud';
      hud.innerHTML = '<div class="bb-route green">🟢 الأخضر: صِل الصفوف ← →</div><div class="bb-turn">🎯 اختر حرفًا ثم امنح النقطة للفريق المستحق</div><div class="bb-route red">🔴 الأحمر: صِل الأعمدة ↑ ↓</div>';
      area.insertBefore(hud, area.firstChild);
    }

    document.addEventListener('click', function (event) {
      const cell = event.target.closest('.hex-cell');
      if (!cell) return;
      cell.classList.remove('bb-pop');
      void cell.offsetWidth;
      cell.classList.add('bb-pop');
      setTimeout(function () { cell.classList.remove('bb-pop'); }, 500);
    });

    const victory = document.getElementById('victoryModal');
    if (victory) {
      let wasOpen = victory.classList.contains('show');
      new MutationObserver(function () {
        const isOpen = victory.classList.contains('show');
        if (isOpen && !wasOpen) celebrate();
        wasOpen = isOpen;
      }).observe(victory, { attributes: true, attributeFilter: ['class', 'style'] });
    }

    const soundBtn = document.getElementById('soundBtn');
    if (soundBtn) soundBtn.setAttribute('aria-label', 'كتم أو تشغيل مؤثرات اللعبة');
    document.querySelectorAll('.hex-cell').forEach(function (cell) {
      cell.setAttribute('role', 'button');
      cell.setAttribute('tabindex', '0');
      cell.setAttribute('aria-label', 'اختيار الحرف ' + cell.textContent.trim());
    });
  });
})();
