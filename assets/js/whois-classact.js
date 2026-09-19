(function () {
  "use strict";

  const EXPECTED_TYPE = "whois";
  let pack = null;
  let questions = [];
  let wrongQuestions = [];
  let index = 0;
  let importedMode = false;

  const ready = (callback) => document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", callback)
    : callback();

  ready(() => {
    const startButton = document.getElementById("startGameBtn");
    const nativeGame = document.getElementById("gameArea");
    if (!startButton || !nativeGame) return;
    let nativeStartDisabled = startButton.disabled;

    const controls = startButton.closest(".controls") || startButton.parentElement;
    const loader = document.createElement("section");
    loader.id = "classactWhoisLoader";
    loader.dir = "rtl";
    loader.innerHTML = `
      <style>
        #classactWhoisLoader,.classact-whois-game{background:rgba(255,255,255,.94);border-radius:22px;padding:22px;margin:0 0 24px;box-shadow:0 12px 35px rgba(31,41,55,.16);font-family:Cairo,sans-serif}
        .classact-mode-row,.classact-actions{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}
        .classact-mode{border:2px solid #667eea;background:#fff;color:#4c51bf;padding:12px 20px;border-radius:14px;font-weight:700;cursor:pointer}
        .classact-mode.active{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff}
        .classact-import{display:none;margin-top:18px;text-align:center}.classact-import.active{display:block}
        .classact-file{display:block;margin:14px auto;max-width:430px;width:100%}
        .classact-status{min-height:27px;font-weight:700;color:#4c51bf}
        .classact-whois-game{display:none;text-align:center}.classact-whois-game.active{display:block}
        .classact-counter{color:#667eea;font-weight:800}.classact-clue{font-size:clamp(1.35rem,3vw,2.2rem);font-weight:800;margin:22px 0;line-height:1.7}
        .classact-hint,.classact-answer{display:none;margin:14px auto;padding:15px;border-radius:14px;max-width:760px}.classact-hint.show{display:block;background:#fff7d6}.classact-answer.show{display:block;background:#dcfce7;font-size:1.45rem;font-weight:800}
        .classact-actions button{padding:12px 18px;border:0;border-radius:13px;color:#fff;font-family:Cairo,sans-serif;font-weight:800;cursor:pointer}.ca-hint{background:#f59e0b}.ca-reveal{background:#6366f1}.ca-correct{background:#16a34a}.ca-wrong{background:#dc2626}.ca-exit{background:#64748b}
      </style>
      <h3>طريقة اللعب</h3>
      <div class="classact-mode-row">
        <button type="button" class="classact-mode active" data-mode="native">تخمين الطلاب</button>
        <button type="button" class="classact-mode" data-mode="imported">تخمين معرفي</button>
      </div>
      <div class="classact-import">
        <p>استورد ملف النشاط؛ سيظهر السؤال كتلميح وتبقى الإجابة مخفية حتى كشفها.</p>
        <input class="classact-file" type="file" accept=".classact,application/json">
        <div class="classact-status" role="status"></div>
      </div>`;
    controls.parentNode.insertBefore(loader, controls);

    const gamePanel = document.createElement("section");
    gamePanel.className = "classact-whois-game";
    gamePanel.innerHTML = `
      <div class="classact-counter"></div><div class="classact-clue"></div>
      <div class="classact-hint"></div><div class="classact-answer"></div>
      <div class="classact-actions">
        <button type="button" class="ca-hint">عرض التلميح</button><button type="button" class="ca-reveal">كشف الإجابة</button>
        <button type="button" class="ca-correct">إجابة صحيحة</button><button type="button" class="ca-wrong">إجابة خاطئة</button><button type="button" class="ca-exit">العودة للإعداد</button>
      </div>`;
    nativeGame.parentNode.insertBefore(gamePanel, nativeGame);

    const importBox = loader.querySelector(".classact-import");
    const status = loader.querySelector(".classact-status");
    loader.querySelectorAll(".classact-mode").forEach((button) => button.addEventListener("click", () => {
      if (!importedMode) nativeStartDisabled = startButton.disabled;
      importedMode = button.dataset.mode === "imported";
      loader.querySelectorAll(".classact-mode").forEach((item) => item.classList.toggle("active", item === button));
      importBox.classList.toggle("active", importedMode);
      startButton.disabled = importedMode ? false : nativeStartDisabled;
    }));

    loader.querySelector(".classact-file").addEventListener("change", async (event) => {
      try {
        const file = event.target.files[0];
        if (!file) return;
        const data = JSON.parse(await file.text());
        if (data.format !== "classact" || data.version !== "1.0" || data.activityType !== EXPECTED_TYPE) throw new Error("هذا الملف ليس مخصصًا لنشاط من هو؟");
        const valid = Array.isArray(data.questions) ? data.questions.filter((q) => q && String(q.question || "").trim() && String(q.answer || "").trim()) : [];
        if (!valid.length) throw new Error("لا توجد أسئلة صالحة في الملف");
        pack = data; questions = valid; status.textContent = `تم استيراد ${valid.length} سؤالًا بنجاح`;
      } catch (error) { pack = null; questions = []; status.textContent = error.message || "تعذر قراءة الملف"; }
    });

    startButton.addEventListener("click", (event) => {
      if (!importedMode) return;
      event.preventDefault(); event.stopImmediatePropagation();
      if (!pack || !questions.length) { status.textContent = "استورد ملف من هو؟ أولًا"; return; }
      index = 0; wrongQuestions = []; controls.style.display = "none"; loader.style.display = "none"; nativeGame.style.display = "none"; gamePanel.classList.add("active"); render();
    }, true);

    gamePanel.querySelector(".ca-hint").onclick = () => gamePanel.querySelector(".classact-hint").classList.add("show");
    gamePanel.querySelector(".ca-reveal").onclick = () => gamePanel.querySelector(".classact-answer").classList.add("show");
    gamePanel.querySelector(".ca-correct").onclick = () => advance(false);
    gamePanel.querySelector(".ca-wrong").onclick = () => advance(true);
    gamePanel.querySelector(".ca-exit").onclick = reset;

    function render() {
      if (index >= questions.length) {
        const repeatWrong = pack.settings && pack.settings.repeatWrong !== false;
        if (repeatWrong && wrongQuestions.length) { questions = wrongQuestions.slice(); wrongQuestions = []; index = 0; }
        else { gamePanel.querySelector(".classact-counter").textContent = "اكتمل النشاط"; gamePanel.querySelector(".classact-clue").textContent = "أحسنتم! انتهت جميع الأسئلة."; gamePanel.querySelector(".classact-hint").className = "classact-hint"; gamePanel.querySelector(".classact-answer").className = "classact-answer"; return; }
      }
      const item = questions[index];
      gamePanel.querySelector(".classact-counter").textContent = `السؤال ${index + 1} من ${questions.length}`;
      gamePanel.querySelector(".classact-clue").textContent = item.question;
      const hint = gamePanel.querySelector(".classact-hint"); hint.textContent = item.hint ? `تلميح إضافي: ${item.hint}` : "لا يوجد تلميح إضافي"; hint.className = "classact-hint";
      const answer = gamePanel.querySelector(".classact-answer"); answer.textContent = `الإجابة: ${item.answer}`; answer.className = "classact-answer";
    }
    function advance(wrong) { if (index >= questions.length) return; if (wrong) wrongQuestions.push(questions[index]); index += 1; render(); }
    function reset() { gamePanel.classList.remove("active"); controls.style.display = ""; loader.style.display = ""; nativeGame.style.display = ""; }
  });
})();
