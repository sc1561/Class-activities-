(function () {
  "use strict";

  const TYPE = "monopoly-oman";
  let pack = null;
  let queue = [];
  let retry = [];
  let index = 0;
  let importedMode = false;
  let challengeOpen = false;

  const ready = (fn) => document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", fn) : fn();

  ready(() => {
    const rollButton = document.getElementById("rollDice");
    const endTurnButton = document.getElementById("endTurn");
    const classSelect = document.getElementById("classSelect");
    if (!rollButton || !endTurnButton || !classSelect) return;

    const panel = document.createElement("section");
    panel.id = "classactMonopolyLoader";
    panel.dir = "rtl";
    panel.innerHTML = `
      <style>
        #classactMonopolyLoader{background:rgba(255,255,255,.96);border:2px solid #d4af37;border-radius:18px;padding:18px;margin:18px auto;max-width:760px;text-align:center;box-shadow:0 10px 28px rgba(0,0,0,.16);font-family:Cairo,sans-serif}
        .cam-mode-row,.cam-actions{display:flex;justify-content:center;gap:10px;flex-wrap:wrap}.cam-mode{border:2px solid #0f766e;background:#fff;color:#0f766e;border-radius:12px;padding:10px 18px;font-weight:800;cursor:pointer}.cam-mode.active{background:#0f766e;color:#fff}.cam-import{display:none;margin-top:14px}.cam-import.active{display:block}.cam-file{display:block;margin:12px auto;max-width:420px;width:100%}.cam-status{min-height:25px;color:#0f766e;font-weight:800}
        .cam-overlay{position:fixed;inset:0;z-index:100000;background:rgba(4,20,26,.82);display:none;align-items:center;justify-content:center;padding:18px}.cam-overlay.active{display:flex}.cam-card{background:#fff;border:4px solid #d4af37;border-radius:24px;max-width:820px;width:100%;padding:28px;text-align:center;box-shadow:0 22px 70px rgba(0,0,0,.45);font-family:Cairo,sans-serif}.cam-counter{color:#0f766e;font-weight:800}.cam-question{font-size:clamp(1.35rem,3vw,2.15rem);line-height:1.7;font-weight:800;margin:20px 0}.cam-hint,.cam-answer{display:none;padding:14px;border-radius:12px;margin:12px auto}.cam-hint.show{display:block;background:#fff7d6}.cam-answer.show{display:block;background:#dcfce7;font-size:1.35rem;font-weight:800}.cam-actions button{border:0;border-radius:12px;padding:11px 17px;color:#fff;font-family:Cairo,sans-serif;font-weight:800;cursor:pointer}.cam-hint-btn{background:#d97706}.cam-answer-btn{background:#4f46e5}.cam-correct{background:#15803d}.cam-wrong{background:#b91c1c}
      </style>
      <h3>🎓 نمط التحدي المعرفي</h3>
      <div class="cam-mode-row"><button type="button" class="cam-mode active" data-mode="native">مونوبولي الأصلي</button><button type="button" class="cam-mode" data-mode="imported">مونوبولي بالأسئلة</button></div>
      <div class="cam-import"><p>بعد وصول اللاعب إلى المربع يظهر سؤال قبل متابعة الدور.</p><input class="cam-file" type="file" accept=".classact,application/json"><div class="cam-status" role="status"></div></div>`;
    classSelect.closest(".control-panel, .game-controls, .setup-section, .controls")?.prepend(panel) || classSelect.parentElement.parentElement.prepend(panel);

    const overlay = document.createElement("div");
    overlay.className = "cam-overlay";
    overlay.innerHTML = `<article class="cam-card"><div class="cam-counter"></div><div class="cam-question"></div><div class="cam-hint"></div><div class="cam-answer"></div><div class="cam-actions"><button type="button" class="cam-hint-btn">عرض التلميح</button><button type="button" class="cam-answer-btn">كشف الإجابة</button><button type="button" class="cam-correct">إجابة صحيحة — متابعة الدور</button><button type="button" class="cam-wrong">إجابة خاطئة — إنهاء الدور</button></div></article>`;
    document.body.appendChild(overlay);

    const importBox = panel.querySelector(".cam-import");
    const status = panel.querySelector(".cam-status");
    panel.querySelectorAll(".cam-mode").forEach((button) => button.addEventListener("click", () => {
      importedMode = button.dataset.mode === "imported";
      panel.querySelectorAll(".cam-mode").forEach((item) => item.classList.toggle("active", item === button));
      importBox.classList.toggle("active", importedMode);
    }));

    panel.querySelector(".cam-file").addEventListener("change", async (event) => {
      try {
        const file = event.target.files[0];
        if (!file) return;
        const data = JSON.parse(await file.text());
        if (data.format !== "classact" || data.version !== "1.0" || data.activityType !== TYPE) throw new Error("هذا الملف ليس مخصصًا لمونوبولي عُمان");
        const valid = Array.isArray(data.questions) ? data.questions.filter((q) => q && String(q.question || "").trim() && String(q.answer || "").trim()) : [];
        if (!valid.length) throw new Error("لا توجد أسئلة صالحة في الملف");
        pack = data; queue = orderQuestions(valid, data.settings?.questionOrder); retry = []; index = 0;
        status.textContent = `تم استيراد ${valid.length} سؤالًا بنجاح`;
      } catch (error) { pack = null; queue = []; status.textContent = error.message || "تعذر قراءة الملف"; }
    });

    rollButton.addEventListener("click", () => {
      if (!importedMode) return;
      if (!pack || !queue.length) { status.textContent = "استورد ملف مونوبولي عُمان أولًا"; return; }
      window.setTimeout(showChallenge, 1500);
    });

    overlay.querySelector(".cam-hint-btn").onclick = () => overlay.querySelector(".cam-hint").classList.add("show");
    overlay.querySelector(".cam-answer-btn").onclick = () => overlay.querySelector(".cam-answer").classList.add("show");
    overlay.querySelector(".cam-correct").onclick = () => resolve(false);
    overlay.querySelector(".cam-wrong").onclick = () => resolve(true);

    function showChallenge() {
      if (challengeOpen || !importedMode) return;
      if (index >= queue.length) {
        if (pack?.settings?.repeatWrongQuestions !== false && retry.length) { queue = retry.slice(); retry = []; index = 0; }
        else { queue = orderQuestions(pack.questions, pack.settings?.questionOrder); retry = []; index = 0; }
      }
      const q = queue[index];
      overlay.querySelector(".cam-counter").textContent = `تحدي المربع • السؤال ${index + 1} من ${queue.length}`;
      overlay.querySelector(".cam-question").textContent = q.question;
      const hint = overlay.querySelector(".cam-hint"); hint.textContent = q.hint ? `تلميح: ${q.hint}` : "لا يوجد تلميح إضافي"; hint.className = "cam-hint";
      const answer = overlay.querySelector(".cam-answer"); answer.textContent = `الإجابة: ${q.answer}`; answer.className = "cam-answer";
      challengeOpen = true; overlay.classList.add("active"); rollButton.disabled = true;
    }
    function resolve(wrong) {
      if (!challengeOpen) return;
      if (wrong) retry.push(queue[index]);
      index += 1; challengeOpen = false; overlay.classList.remove("active");
      if (wrong && !endTurnButton.disabled) endTurnButton.click();
    }
    function orderQuestions(list, order) {
      const copy = list.slice();
      if (order === "random") for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
      return copy;
    }
  });
})();
