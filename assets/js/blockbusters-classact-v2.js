(function () {
  "use strict";

  const TEAM = {
    green: { label: "الفريق الأخضر", icon: "🟢", other: "red" },
    red: { label: "الفريق الأحمر", icon: "🔴", other: "green" }
  };

  const state = {
    mode: "oral",
    pack: null,
    byLetter: new Map(),
    usedByLetter: new Map(),
    bypass: null,
    cell: null,
    activeTeam: "green",
    phase: "answer",
    question: null,
    timer: null,
    timeLeft: 0,
    sound: true,
    gameStarted: false,
    gameFinished: false,
    stats: freshStats()
  };

  function freshStats() {
    return {
      green: { correct: 0, wrong: 0, steals: 0, hints: 0, points: 0, totalTime: 0, answers: 0 },
      red: { correct: 0, wrong: 0, steals: 0, hints: 0, points: 0, totalTime: 0, answers: 0 }
    };
  }

  const css = `
  .classact-b-loader{background:linear-gradient(135deg,#f8fafc,#eff6ff);border:2px solid #dbeafe;border-radius:18px;padding:1.25rem;margin-bottom:1.5rem;box-shadow:0 10px 30px rgba(30,64,175,.08)}
  .classact-b-loader h3{margin:0 0 .35rem;color:#1b365d}.classact-b-intro{margin:0 0 1rem;color:#64748b;font-size:.92rem}
  .classact-b-modes{display:flex;gap:.65rem;flex-wrap:wrap}.classact-b-mode{border:2px solid #cbd5e1;background:#fff;color:#334155;border-radius:12px;padding:.72rem 1rem;font-family:inherit;font-weight:800;cursor:pointer;transition:.2s}
  .classact-b-mode.active{background:#1b365d;color:#fff;border-color:#1b365d;transform:translateY(-1px);box-shadow:0 6px 16px rgba(27,54,93,.22)}
  .classact-b-import{display:none;margin-top:1rem}.classact-b-import.visible{display:block}.classact-b-file{display:inline-flex;background:#2563eb;color:#fff;border-radius:11px;padding:.78rem 1rem;font-weight:800;cursor:pointer}.classact-b-file input{display:none}
  .classact-b-status{margin-top:.75rem;color:#475569;line-height:1.7}.classact-b-status.success{color:#166534}.classact-b-status.warn{color:#92400e}.classact-b-status.error{color:#b91c1c}
  .classact-turn{display:none;align-items:center;justify-content:center;gap:.65rem;margin:0 auto 1rem;width:min(700px,100%);padding:.8rem 1rem;border-radius:14px;font-weight:900;background:#fff;box-shadow:0 8px 22px rgba(15,23,42,.1);border:2px solid #e2e8f0}.classact-turn.show{display:flex}.classact-turn.green{border-color:#22c55e;color:#166534}.classact-turn.red{border-color:#ef4444;color:#991b1b}
  .classact-q-modal,.classact-final{position:fixed;inset:0;z-index:5000;background:rgba(15,23,42,.82);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:1rem}
  .classact-q-card{width:min(760px,100%);max-height:94vh;overflow:auto;background:#fff;border-radius:26px;padding:1.5rem;box-shadow:0 28px 90px rgba(0,0,0,.42);text-align:right;animation:classactPop .28s ease-out}
  @keyframes classactPop{from{opacity:0;transform:scale(.88) translateY(20px)}to{opacity:1;transform:none}}
  .classact-q-head{display:flex;align-items:center;justify-content:space-between;gap:1rem}.classact-q-head h2{margin:0;color:#1b365d}.classact-q-close{border:0;background:#f1f5f9;border-radius:10px;width:2.7rem;height:2.7rem;font-size:1.2rem;cursor:pointer}
  .classact-q-top{display:flex;gap:.75rem;align-items:center;justify-content:space-between;margin:.9rem 0;flex-wrap:wrap}.classact-q-turn{font-weight:900;padding:.55rem .8rem;border-radius:999px;background:#eff6ff;color:#1e3a8a}.classact-q-timer{font-size:1.35rem;font-weight:900;min-width:82px;text-align:center;padding:.45rem .7rem;border-radius:12px;background:#0f172a;color:#fff}.classact-q-timer.danger{background:#b91c1c;animation:classactPulse .7s infinite}
  @keyframes classactPulse{50%{transform:scale(1.08)}}
  .classact-q-meta{color:#64748b;font-weight:700}.classact-q-text{font-size:clamp(1.15rem,3vw,1.55rem);font-weight:900;line-height:1.9;padding:1.25rem;background:#f8fafc;border-right:6px solid #f59e0b;border-radius:14px;margin-top:.75rem}
  .classact-q-hint,.classact-q-answer,.classact-steal{display:none;margin-top:1rem;padding:1rem;border-radius:13px;font-weight:700}.visible{display:block!important}.classact-q-hint{background:#fffbeb;color:#92400e}.classact-q-answer{background:#ecfdf5;color:#166534}.classact-steal{background:#fff1f2;color:#9f1239;border:2px solid #fecdd3;text-align:center;font-size:1.05rem}
  .classact-q-actions{display:flex;gap:.7rem;flex-wrap:wrap;margin-top:1.2rem}.classact-q-actions button{border:0;border-radius:11px;padding:.82rem 1rem;font-family:inherit;font-weight:900;cursor:pointer;transition:.18s}.classact-q-actions button:active{transform:scale(.96)}
  .classact-hint-btn{background:#fef3c7;color:#92400e}.classact-answer-btn{background:#dbeafe;color:#1e40af}.classact-correct-btn{background:#16a34a;color:#fff}.classact-wrong-btn{background:#dc2626;color:#fff}.classact-skip-btn{background:#e2e8f0;color:#334155}.classact-steal-btn{background:#7c3aed;color:#fff}.classact-noanswer-btn{background:#475569;color:#fff}
  .classact-toast{position:fixed;z-index:6000;left:50%;top:92px;transform:translateX(-50%);padding:.85rem 1.3rem;border-radius:999px;color:#fff;font-weight:900;box-shadow:0 12px 35px rgba(0,0,0,.25);animation:classactToast 2.4s forwards;white-space:nowrap;max-width:92vw}.classact-toast.good{background:#15803d}.classact-toast.bad{background:#b91c1c}.classact-toast.info{background:#1d4ed8}@keyframes classactToast{0%{opacity:0;transform:translate(-50%,-20px)}12%,82%{opacity:1;transform:translate(-50%,0)}100%{opacity:0;transform:translate(-50%,-16px)}}
  .classact-final{overflow:auto}.classact-final-card{position:relative;width:min(920px,100%);background:linear-gradient(145deg,#fff,#fffbeb);border-radius:30px;padding:2rem;text-align:center;box-shadow:0 30px 100px rgba(0,0,0,.5);overflow:hidden;animation:classactPop .45s ease-out}.classact-crown{font-size:4.6rem;animation:classactFloat 1.7s ease-in-out infinite}.classact-final h2{font-size:clamp(2rem,6vw,3.5rem);margin:.2rem 0;color:#92400e}.classact-final-sub{font-size:1.2rem;font-weight:800;color:#475569}.classact-final-score{font-size:2rem;font-weight:900;margin:1rem;color:#1b365d}
  @keyframes classactFloat{50%{transform:translateY(-10px) rotate(4deg)}}
  .classact-report{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem;margin:1.3rem 0;text-align:right}.classact-report-team{background:#fff;border:2px solid #e2e8f0;border-radius:18px;padding:1rem}.classact-report-team.green{border-color:#86efac}.classact-report-team.red{border-color:#fca5a5}.classact-report-team h3{margin:0 0 .7rem}.classact-metrics{display:grid;grid-template-columns:repeat(2,1fr);gap:.55rem}.classact-metric{background:#f8fafc;border-radius:10px;padding:.65rem;text-align:center}.classact-metric b{display:block;font-size:1.25rem;color:#0f172a}.classact-final-actions{display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap}.classact-final-actions button{border:0;border-radius:12px;padding:.9rem 1.2rem;font-family:inherit;font-weight:900;cursor:pointer}.classact-again{background:#1b365d;color:#fff}.classact-home{background:#e2e8f0;color:#1e293b}
  .classact-confetti{position:fixed;z-index:5500;top:-20px;width:12px;height:20px;border-radius:3px;animation:classactFall linear forwards;pointer-events:none}@keyframes classactFall{to{transform:translate3d(var(--drift),110vh,0) rotate(900deg)}}
  #hexagonBoard .hex-cell.classact-near{box-shadow:0 0 0 4px #facc15,0 0 24px #f59e0b;animation:classactPulse 1s infinite}
  @media(max-width:600px){.classact-q-card{padding:1rem;border-radius:19px}.classact-q-actions button{width:100%}.classact-report{grid-template-columns:1fr}.classact-final-card{padding:1.2rem}.classact-b-mode{flex:1;min-width:130px}.classact-turn{font-size:.9rem}}
  `;

  function normalizeLetter(value) {
    return String(value || "").trim().replace(/[إأآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/ؤ/g, "و").replace(/ئ/g, "ي").replace(/[ًٌٍَُِّْـ\s]/g, "").charAt(0);
  }

  function questionLetter(q) {
    return normalizeLetter(q.letter || q.answer);
  }

  function valid(pack) {
    return Boolean(pack && pack.format === "classact" && pack.activityType === "blockbusters" && Array.isArray(pack.questions) && pack.questions.length && pack.questions.every(q => q && typeof q.question === "string" && q.question.trim() && typeof q.answer === "string" && q.answer.trim()));
  }

  function addCss() {
    document.getElementById("classactBlockbustersCss")?.remove();
    const style = document.createElement("style");
    style.id = "classactBlockbustersCss";
    style.textContent = css;
    document.head.append(style);
  }

  function audioTone(freq, duration, type = "sine", gain = .08, delay = 0) {
    if (!state.sound) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      window.__classactAudio = window.__classactAudio || new Ctx();
      const ctx = window.__classactAudio;
      if (ctx.state === "suspended") ctx.resume();
      const osc = ctx.createOscillator(), vol = ctx.createGain(), start = ctx.currentTime + delay;
      osc.type = type; osc.frequency.setValueAtTime(freq, start);
      vol.gain.setValueAtTime(0, start); vol.gain.linearRampToValueAtTime(gain, start + .02); vol.gain.exponentialRampToValueAtTime(.001, start + duration);
      osc.connect(vol); vol.connect(ctx.destination); osc.start(start); osc.stop(start + duration);
    } catch (_) {}
  }

  function sound(kind) {
    // الإجابة الصحيحة والفوز لهما مؤثران في اللعبة الأصلية؛ لا نكرر الصوت هنا.
    if (kind === "correct") return;
    if (kind === "wrong") { audioTone(210,.3,"sawtooth",.06); audioTone(155,.34,"sawtooth",.05,.16); }
    if (kind === "win") return;
    if (kind === "tick") audioTone(760,.06,"square",.025);
  }

  function toast(message, type = "info") {
    const el = document.createElement("div");
    el.className = `classact-toast ${type}`;
    el.textContent = message;
    document.body.append(el);
    setTimeout(()=>el.remove(),2500);
  }

  function buildQuestionIndex() {
    state.byLetter.clear(); state.usedByLetter.clear();
    (state.pack?.questions || []).forEach((q, index) => {
      const letter = questionLetter(q);
      if (!letter) return;
      if (!state.byLetter.has(letter)) state.byLetter.set(letter, []);
      state.byLetter.get(letter).push({ ...q, __index: index });
    });
  }

  function nextQuestion(letter) {
    const key = normalizeLetter(letter), list = state.byLetter.get(key) || [];
    if (!list.length) return null;
    let used = state.usedByLetter.get(key) || new Set();
    let available = list.filter(q => !used.has(q.__index));
    if (!available.length) { used = new Set(); available = [...list]; }
    const q = available[Math.floor(Math.random() * available.length)];
    used.add(q.__index); state.usedByLetter.set(key, used);
    return q;
  }

  function coverage(pack) {
    const boardLetters = [...document.querySelectorAll("#hexagonBoard .hex-cell")].map(c=>normalizeLetter(c.textContent));
    const provided = new Set(pack.questions.map(questionLetter).filter(Boolean));
    const missing = [...new Set(boardLetters.filter(l=>!provided.has(l)))];
    return { provided: provided.size, missing };
  }

  function setTurn(team) {
    state.activeTeam = team;
    const bar = document.getElementById("classactTurnBar");
    if (!bar) return;
    bar.className = `classact-turn show ${team}`;
    bar.innerHTML = `<span>${TEAM[team].icon}</span><span>الدور الآن: ${TEAM[team].label} — اختاروا حرفًا</span>`;
  }

  function resetRoundState() {
    clearInterval(state.timer); state.timer = null;
    state.phase = "answer"; state.question = null; state.cell = null;
  }

  function closeQuestion() {
    clearInterval(state.timer); state.timer = null;
    document.getElementById("classactBlockbustersQuestion")?.remove();
    state.cell = null;
  }

  function startTimer(seconds, node, onExpire) {
    clearInterval(state.timer);
    state.timeLeft = Math.max(5, Number(seconds) || 30);
    const paint = () => { node.textContent = `⏱️ ${state.timeLeft}`; node.classList.toggle("danger", state.timeLeft <= 5); };
    paint();
    state.timer = setInterval(()=>{
      state.timeLeft--; paint();
      if (state.timeLeft <= 5 && state.timeLeft > 0) sound("tick");
      if (state.timeLeft <= 0) { clearInterval(state.timer); state.timer = null; onExpire(); }
    },1000);
  }

  function elapsed(seconds) { return Math.max(0, (Number(seconds)||30) - state.timeLeft); }

  function showQuestion(cell) {
    const letter = cell.textContent.trim(), normalized = normalizeLetter(letter);
    const imported = state.mode !== "oral" ? nextQuestion(normalized) : null;
    if (state.mode === "imported" && !imported) {
      toast(`لا يوجد سؤال مرتبط بحرف «${letter}» — يمكنك استخدام الوضع المختلط`, "bad");
      return;
    }
    closeQuestion(); state.cell = cell; state.question = imported; state.phase = "answer";
    const q = imported || { question: `اطرح سؤالًا شفهيًا تكون إجابته بحرف «${letter}»`, answer: "يقيّم المعلم الإجابة الشفهية", hint: "يمكن للمعلم تقديم تلميح شفهي", points: 100, time: 30 };
    const seconds = Number(q.time || state.pack?.settings?.defaultTime || 30);
    const modal = document.createElement("div");
    modal.id = "classactBlockbustersQuestion"; modal.className = "classact-q-modal";
    modal.innerHTML = `<section class="classact-q-card" role="dialog" aria-modal="true" aria-labelledby="classactQuestionTitle">
      <div class="classact-q-head"><h2 id="classactQuestionTitle">🧩 تحدي حرف «${letter}»</h2><button class="classact-q-close" type="button" aria-label="إغلاق">✕</button></div>
      <div class="classact-q-top"><div class="classact-q-turn">${TEAM[state.activeTeam].icon} محاولة ${TEAM[state.activeTeam].label}</div><div class="classact-q-timer"></div></div>
      <div class="classact-q-meta">${imported ? "سؤال مرتبط بالحرف" : "سؤال شفهي"} • ${q.points || 100} نقطة${state.mode === "mixed" && !imported ? " • لا يوجد سؤال مستورد لهذا الحرف" : ""}</div>
      <div class="classact-q-text"></div><div class="classact-q-hint"></div><div class="classact-q-answer"></div><div class="classact-steal"></div>
      <div class="classact-q-actions">
        <button type="button" class="classact-hint-btn">💡 تلميح</button><button type="button" class="classact-answer-btn">👁️ إظهار الإجابة</button>
        <button type="button" class="classact-correct-btn">✅ إجابة صحيحة</button><button type="button" class="classact-wrong-btn">❌ إجابة خاطئة</button><button type="button" class="classact-skip-btn">⏭️ تخطي</button>
      </div></section>`;
    modal.querySelector(".classact-q-text").textContent = q.question;
    const hint = modal.querySelector(".classact-q-hint"), answer = modal.querySelector(".classact-q-answer"), steal = modal.querySelector(".classact-steal"), actions = modal.querySelector(".classact-q-actions");
    hint.textContent = `💡 ${q.hint || "لا يوجد تلميح مكتوب لهذا السؤال."}`;
    answer.textContent = `✅ الإجابة النموذجية: ${q.answer}`;
    const timerNode = modal.querySelector(".classact-q-timer");
    const expire = () => handleWrong(modal, seconds, true);
    startTimer(seconds, timerNode, expire);
    modal.querySelector(".classact-q-close").onclick = closeQuestion;
    modal.querySelector(".classact-hint-btn").onclick = () => { hint.classList.toggle("visible"); state.stats[state.activeTeam].hints++; };
    modal.querySelector(".classact-answer-btn").onclick = () => answer.classList.toggle("visible");
    modal.querySelector(".classact-correct-btn").onclick = () => award(state.activeTeam, Number(q.points)||100, false, seconds);
    modal.querySelector(".classact-wrong-btn").onclick = () => handleWrong(modal, seconds, false);
    modal.querySelector(".classact-skip-btn").onclick = () => { state.activeTeam = TEAM[state.activeTeam].other; setTurn(state.activeTeam); closeQuestion(); toast("تم تجاوز السؤال وانتقل الدور", "info"); };
    modal.addEventListener("click", e=>{ if(e.target===modal) closeQuestion(); });
    document.body.append(modal);

    function handleWrong(root, originalSeconds, timedOut) {
      if (state.phase !== "answer") return;
      clearInterval(state.timer); state.timer = null;
      const first = state.activeTeam, stealing = TEAM[first].other;
      state.stats[first].wrong++; state.stats[first].answers++; state.stats[first].totalTime += elapsed(originalSeconds);
      sound("wrong"); state.phase = "steal";
      steal.classList.add("visible"); steal.textContent = `${timedOut ? "⏰ انتهى الوقت" : "إجابة غير صحيحة"} — فرصة إضافية لـ ${TEAM[stealing].label}`;
      root.querySelector(".classact-q-turn").textContent = `${TEAM[stealing].icon} فرصة إضافية: ${TEAM[stealing].label}`;
      actions.innerHTML = `<button type="button" class="classact-answer-btn">👁️ إظهار الإجابة</button><button type="button" class="classact-steal-btn">⚡ إجابة صحيحة في الفرصة الإضافية</button><button type="button" class="classact-noanswer-btn">🚫 لم يُجب أحد</button>`;
      actions.querySelector(".classact-answer-btn").onclick = ()=>answer.classList.toggle("visible");
      actions.querySelector(".classact-steal-btn").onclick = ()=>award(stealing, Math.round((Number(q.points)||100)*.75), true, 15);
      actions.querySelector(".classact-noanswer-btn").onclick = ()=>{ state.stats[stealing].wrong++; state.stats[stealing].answers++; state.activeTeam = stealing; setTurn(state.activeTeam); closeQuestion(); toast("بقي الحرف متاحًا وانتقل الدور", "info"); };
      startTimer(15, timerNode, ()=>actions.querySelector(".classact-noanswer-btn")?.click());
    }
  }

  function award(team, points, stolen, seconds) {
    if (!state.cell || state.gameFinished || state.phase === "committing") return;
    state.phase = "committing";
    const questionModal = document.getElementById("classactBlockbustersQuestion");
    const pressedButton = questionModal?.querySelector(".classact-correct-btn,.classact-steal-btn");
    if (pressedButton) {
      pressedButton.disabled = true;
      pressedButton.textContent = "⏳ جارٍ تسجيل النقطة...";
    }
    clearInterval(state.timer); state.timer = null;
    const target = state.cell;
    const s = state.stats[team];
    s.correct++; s.answers++; s.points += points; s.totalTime += elapsed(seconds); if (stolen) s.steals++;
    closeQuestion(); sound("correct");
    // نعطّل اعتراض الحروف مؤقتًا حتى تصل النقرة الداخلية إلى منطق اللعبة الأصلي
    // من دون أن تُعيد فتح نافذة السؤال مرة ثانية.
    document.removeEventListener("click", intercept, true);
    target.click();

    const teamButtonId = team === "green" ? "selectGreenTeamBtn" : "selectRedTeamBtn";
    let attempts = 0;
    const finishAward = () => {
      document.addEventListener("click", intercept, true);
      state.phase = "answer";
      state.activeTeam = TEAM[team].other;
      setTurn(state.activeTeam);
      toast(`${TEAM[team].icon} تم تسجيل الإجابة الصحيحة! +${points} نقطة`, "good");
      setTimeout(()=>{ highlightNearWin(); const winner = detectWinner(); if (winner) showFinale(winner); },250);
    };
    const commitWhenReady = () => {
      const selectionModal = document.getElementById("teamSelectionModal");
      const teamButton = document.getElementById(teamButtonId);
      const modalReady = selectionModal && (
        selectionModal.classList.contains("show") ||
        getComputedStyle(selectionModal).display !== "none"
      );
      if (teamButton && modalReady) {
        teamButton.click();
        finishAward();
        return;
      }
      attempts++;
      if (attempts < 24) {
        setTimeout(commitWhenReady, 50);
        return;
      }
      // حماية احتياطية للمتصفحات البطيئة: تنفيذ الاختيار مرة واحدة بعد اكتمال مهلة الانتظار.
      teamButton?.click();
      finishAward();
    };
    commitWhenReady();
  }

  function cellOwners() {
    return [...document.querySelectorAll("#hexagonBoard .hex-cell")].map(cell=>cell.classList.contains("green") ? "green" : cell.classList.contains("red") ? "red" : null);
  }

  function detectWinner() {
    const a = cellOwners(); if (a.length < 25) return null;
    for (let r=0;r<5;r++) if ([0,1,2,3,4].every(c=>a[r*5+c]==="green")) return { team:"green", cells:[0,1,2,3,4].map(c=>r*5+c), reason:"أكمل صفًا أفقيًا كاملًا" };
    for (let c=0;c<5;c++) if ([0,1,2,3,4].every(r=>a[r*5+c]==="red")) return { team:"red", cells:[0,1,2,3,4].map(r=>r*5+c), reason:"أكمل عمودًا رأسيًا كاملًا" };
    if (a.every(Boolean)) {
      const green = a.filter(x=>x==="green").length, red = a.filter(x=>x==="red").length;
      const team = state.stats.green.points === state.stats.red.points ? (green>=red?"green":"red") : (state.stats.green.points>state.stats.red.points?"green":"red");
      return { team, cells:[], reason:"حصل على أعلى نتيجة بعد اكتمال اللوحة" };
    }
    return null;
  }

  function highlightNearWin() {
    const cells=[...document.querySelectorAll("#hexagonBoard .hex-cell")], a=cellOwners(); cells.forEach(c=>c.classList.remove("classact-near"));
    for(let r=0;r<5;r++){const ids=[0,1,2,3,4].map(c=>r*5+c), own=ids.filter(i=>a[i]==="green");if(own.length===4)ids.filter(i=>!a[i]).forEach(i=>cells[i]?.classList.add("classact-near"));}
    for(let c=0;c<5;c++){const ids=[0,1,2,3,4].map(r=>r*5+c), own=ids.filter(i=>a[i]==="red");if(own.length===4)ids.filter(i=>!a[i]).forEach(i=>cells[i]?.classList.add("classact-near"));}
  }

  function confetti() {
    const colors=["#facc15","#22c55e","#ef4444","#3b82f6","#a855f7","#fff"];
    for(let i=0;i<110;i++) setTimeout(()=>{const p=document.createElement("i");p.className="classact-confetti";p.style.left=Math.random()*100+"vw";p.style.background=colors[i%colors.length];p.style.setProperty("--drift",(Math.random()*240-120)+"px");p.style.animationDuration=(2.6+Math.random()*2.4)+"s";document.body.append(p);setTimeout(()=>p.remove(),5200)},i*18);
  }

  function metric(team, key) { return state.stats[team][key]; }
  function accuracy(team) { const s=state.stats[team]; return s.answers ? Math.round(s.correct/s.answers*100) : 0; }
  function average(team) { const s=state.stats[team]; return s.answers ? Math.round(s.totalTime/s.answers) : 0; }

  function showFinale(result) {
    if (state.gameFinished) return; state.gameFinished = true; clearInterval(state.timer);
    const cells=[...document.querySelectorAll("#hexagonBoard .hex-cell")]; result.cells.forEach((i,n)=>setTimeout(()=>cells[i]?.classList.add("classact-near"),n*180));
    setTimeout(()=>{ sound("win"); confetti(); document.querySelectorAll(".victory-modal,.modal-overlay.show").forEach(x=>{if(x.id!=="classactBlockbustersFinal")x.classList.remove("show")});
      const winner=result.team, loser=TEAM[winner].other;
      const final=document.createElement("div");final.id="classactBlockbustersFinal";final.className="classact-final";
      final.innerHTML=`<section class="classact-final-card"><div class="classact-crown">🏆</div><h2>${TEAM[winner].label} هو البطل!</h2><div class="classact-final-sub">${result.reason}</div><div class="classact-final-score">${metric(winner,"points")} نقطة مقابل ${metric(loser,"points")} نقطة</div>
      <div class="classact-report">${[winner,loser].map((t,i)=>`<article class="classact-report-team ${t}"><h3>${i===0?"🥇 البطل":"🥈 الوصيف"} — ${TEAM[t].label}</h3><div class="classact-metrics"><div class="classact-metric"><b>${metric(t,"correct")}</b>صحيحة</div><div class="classact-metric"><b>${metric(t,"wrong")}</b>خاطئة</div><div class="classact-metric"><b>${metric(t,"steals")}</b>فرص إضافية ناجحة</div><div class="classact-metric"><b>${accuracy(t)}%</b>دقة</div><div class="classact-metric"><b>${average(t)}ث</b>متوسط الإجابة</div><div class="classact-metric"><b>${metric(t,"hints")}</b>تلميحات</div></div></article>`).join("")}</div>
      <div class="classact-final-actions"><button class="classact-again">🔄 لعبة جديدة</button><button class="classact-home">🏠 صفحة الأنشطة</button></div></section>`;
      final.querySelector(".classact-again").onclick=()=>location.reload(); final.querySelector(".classact-home").onclick=()=>location.href="../main.html"; document.body.append(final);
    },650);
  }

  function mountLoader() {
    const panel=document.getElementById("settingsPanel"); if(!panel||document.getElementById("classactBlockbustersLoader"))return;
    panel.insertAdjacentHTML("afterbegin",`<section id="classactBlockbustersLoader" class="classact-b-loader"><h3>📚 طريقة الأسئلة</h3><p class="classact-b-intro">اختر الأسئلة الشفهية، أو استورد قالبًا ترتبط فيه كل إجابة بحرفها تلقائيًا.</p><div class="classact-b-modes"><button type="button" class="classact-b-mode active" data-mode="oral">🎙️ أسئلة شفوية</button><button type="button" class="classact-b-mode" data-mode="imported">📚 أسئلة مستوردة</button><button type="button" class="classact-b-mode" data-mode="mixed">✨ وضع مختلط</button></div><div class="classact-b-import"><label class="classact-b-file">📂 استيراد ملف .classact<input id="classactBlockbustersFile" type="file" accept=".classact,application/json"></label><div class="classact-b-status">يفضل 25 سؤالًا على الأقل، سؤال لكل حرف في اللوحة.</div></div></section>`);
    const modes=panel.querySelectorAll(".classact-b-mode"),box=panel.querySelector(".classact-b-import"),status=panel.querySelector(".classact-b-status");
    modes.forEach(button=>button.onclick=()=>{state.mode=button.dataset.mode;modes.forEach(item=>item.classList.toggle("active",item===button));box.classList.toggle("visible",state.mode!=="oral")});
    document.getElementById("classactBlockbustersFile").onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const pack=JSON.parse(await file.text());if(!valid(pack))throw new Error("invalid");state.pack=pack;buildQuestionIndex();const c=coverage(pack);status.className=`classact-b-status ${c.missing.length?"warn":"success"}`;status.textContent=c.missing.length?`تم تحميل ${pack.questions.length} سؤالًا. حروف بلا أسئلة: ${c.missing.join("، ")}. استخدم الوضع المختلط لإكمالها شفهيًا.`:`✅ تم تحميل «${pack.metadata?.title||file.name}» — ${pack.questions.length} سؤالًا وتغطية جميع الحروف.`}catch(_){state.pack=null;status.className="classact-b-status error";status.textContent="هذا الملف غير مخصص لمسابقة الحروف أو بياناته غير مكتملة."}};
    document.getElementById("startGameBtn")?.addEventListener("click",e=>{if(state.mode!=="oral"&&!state.pack){e.preventDefault();e.stopImmediatePropagation();status.className="classact-b-status error";status.textContent="استورد قالب مسابقة الحروف أولًا، أو اختر الأسئلة الشفهية.";return}state.gameStarted=true;state.gameFinished=false;state.stats=freshStats();state.usedByLetter.clear();setTimeout(()=>{mountTurnBar();setTurn("green")},450)},true);
  }

  function mountTurnBar(){const area=document.getElementById("gameArea");if(!area||document.getElementById("classactTurnBar"))return;area.insertAdjacentHTML("beforebegin",`<div id="classactTurnBar" class="classact-turn"></div>`)}

  function watchOriginalVictory(){
    const observer=new MutationObserver(()=>{
      if(state.gameFinished||document.getElementById("classactBlockbustersFinal"))return;
      const title=document.getElementById("victoryTitle");
      const original=document.querySelector(".victory-modal.show,.victory-modal .modal-overlay.show,#victoryModal.show");
      if(!title||(!original&&!title.offsetParent))return;
      const text=title.textContent||"",team=text.includes("الأخضر")?"green":text.includes("الأحمر")?"red":null;
      if(!team)return;
      const detected=detectWinner(),result=detected&&detected.team===team?detected:{team,cells:[],reason:team==="green"?"أكمل صفًا أفقيًا كاملًا":"أكمل عمودًا رأسيًا كاملًا"};
      setTimeout(()=>showFinale(result),180);
    });
    observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["class"]});
  }

  function intercept(e) {
    const cell=e.target.closest("#hexagonBoard .hex-cell"); if(!cell||cell.classList.contains("selected")||cell.classList.contains("green")||cell.classList.contains("red")||state.gameFinished)return;
    if(state.bypass===cell){state.bypass=null;return}
    e.preventDefault();e.stopImmediatePropagation();showQuestion(cell);
  }

  function mount() {
    addCss(); mountLoader(); watchOriginalVictory(); document.addEventListener("click",intercept,true);
    const soundBtn=document.getElementById("soundBtn");soundBtn?.addEventListener("click",()=>{state.sound=!state.sound},true);
  }

  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",mount):mount();
})();
