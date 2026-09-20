(function () {
  "use strict";
  const TYPE = "pyramid-knowledge";
  let pack = null, questions = [], retry = [], index = 0, importedMode = false, awaiting = false;
  const ready = (fn) => document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", fn) : fn();

  ready(() => {
    const classSelect = document.getElementById("classSelect");
    const start = document.getElementById("startGameBtn");
    const correct = document.getElementById("correctBtn");
    const wrong = document.getElementById("wrongBtn");
    const nativeQuestion = document.getElementById("currentQuestion");
    const player = document.getElementById("currentPlayerName");
    const level = document.getElementById("currentPlayerLevel");
    if (!classSelect || !start || !correct || !wrong || !nativeQuestion || !player) return;

    const loader = document.createElement("section");
    loader.id = "classactPyramidLoader";
    loader.dir = "rtl";
    loader.innerHTML = `<style>
      #classactPyramidLoader,.cap-card{background:rgba(16,20,40,.94);border:2px solid #ffd700;border-radius:20px;padding:18px;margin:16px auto;max-width:850px;text-align:center;box-shadow:0 12px 34px rgba(0,0,0,.4);color:#fff;font-family:Cairo,sans-serif}.cap-modes,.cap-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}.cap-mode{border:2px solid #ffd700;background:transparent;color:#ffd700;border-radius:12px;padding:10px 18px;font-weight:800;cursor:pointer}.cap-mode.active{background:linear-gradient(135deg,#ffd700,#ff6b35);color:#151515}.cap-import{display:none;margin-top:14px}.cap-import.active{display:block}.cap-file{display:block;width:100%;max-width:430px;margin:12px auto}.cap-status{min-height:25px;color:#7fffd4;font-weight:800}.cap-card{display:none;border-color:#00f5ff}.cap-card.active{display:block}.cap-context{color:#ffd700;font-weight:800}.cap-question{font-size:clamp(1.35rem,3vw,2.1rem);font-weight:800;line-height:1.7;margin:16px 0}.cap-hint,.cap-answer{display:none;padding:13px;border-radius:12px;margin:12px auto;color:#151515}.cap-hint.show{display:block;background:#fff3bf}.cap-answer.show{display:block;background:#b7f7d0;font-size:1.3rem;font-weight:800}.cap-actions button{border:0;border-radius:11px;padding:10px 16px;color:#fff;font-family:Cairo,sans-serif;font-weight:800;cursor:pointer}.cap-hint-btn{background:#d97706}.cap-answer-btn{background:#4f46e5}</style>
      <h3>🧠 أسئلة هرم المعرفة</h3><div class="cap-modes"><button type="button" class="cap-mode active" data-mode="native">أسئلة المعلم</button><button type="button" class="cap-mode" data-mode="imported">أسئلة مستوردة</button></div>
      <div class="cap-import"><p>يظهر سؤال جديد للمتسابق وفق مستوى الهرم الحالي.</p><input class="cap-file" type="file" accept=".classact,application/json"><div class="cap-status" role="status"></div></div>`;
    (classSelect.closest(".setup-section") || classSelect.parentElement).prepend(loader);

    const card = document.createElement("section");
    card.className = "cap-card";
    card.innerHTML = `<div class="cap-context"></div><div class="cap-question"></div><div class="cap-hint"></div><div class="cap-answer"></div><div class="cap-actions"><button type="button" class="cap-hint-btn">عرض التلميح</button><button type="button" class="cap-answer-btn">كشف الإجابة</button></div>`;
    nativeQuestion.insertAdjacentElement("afterend", card);
    const status = loader.querySelector(".cap-status"), importBox = loader.querySelector(".cap-import");

    loader.querySelectorAll(".cap-mode").forEach((button) => button.addEventListener("click", () => {
      importedMode = button.dataset.mode === "imported";
      loader.querySelectorAll(".cap-mode").forEach((item) => item.classList.toggle("active", item === button));
      importBox.classList.toggle("active", importedMode);
      if (!importedMode) { card.classList.remove("active"); nativeQuestion.style.display = ""; awaiting = false; }
    }));
    loader.querySelector(".cap-file").addEventListener("change", async (event) => {
      try {
        const file = event.target.files[0]; if (!file) return;
        const data = JSON.parse(await file.text());
        if (data.format !== "classact" || data.version !== "1.0" || data.activityType !== TYPE) throw new Error("هذا الملف ليس مخصصًا لهرم المعرفة");
        const valid = Array.isArray(data.questions) ? data.questions.filter((q) => q && String(q.question || "").trim() && String(q.answer || "").trim()) : [];
        if (!valid.length) throw new Error("لا توجد أسئلة صالحة في الملف");
        pack = data; questions = order(valid, data.settings?.questionOrder); retry = []; index = 0;
        status.textContent = `تم استيراد ${valid.length} سؤالًا بنجاح`;
      } catch (error) { pack = null; questions = []; status.textContent = error.message || "تعذر قراءة الملف"; }
    });
    start.addEventListener("click", (event) => {
      if (!importedMode) return;
      if (!pack || !questions.length) { event.preventDefault(); event.stopImmediatePropagation(); status.textContent = "استورد ملف هرم المعرفة أولًا"; return; }
      questions = order(pack.questions, pack.settings?.questionOrder); retry = []; index = 0; awaiting = false;
      window.setTimeout(render, 1200);
    }, true);
    correct.addEventListener("click", () => finish(false));
    wrong.addEventListener("click", () => finish(true));
    card.querySelector(".cap-hint-btn").onclick = () => card.querySelector(".cap-hint").classList.add("show");
    card.querySelector(".cap-answer-btn").onclick = () => card.querySelector(".cap-answer").classList.add("show");

    const observer = new MutationObserver(() => { if (importedMode && pack && buttonsVisible() && !awaiting) window.setTimeout(render, 120); });
    observer.observe(player, { childList:true, characterData:true, subtree:true });
    if (level) observer.observe(level, { childList:true, characterData:true, subtree:true });

    function render() {
      if (!importedMode || !pack || awaiting || !buttonsVisible()) return;
      if (index >= questions.length) {
        if (pack.settings?.repeatWrongQuestions !== false && retry.length) { questions = retry.slice(); retry = []; index = 0; }
        else { questions = order(pack.questions, pack.settings?.questionOrder); retry = []; index = 0; }
      }
      const q = questions[index];
      card.querySelector(".cap-context").textContent = `${player.textContent.trim()} • ${level?.textContent.trim() || "مستوى الهرم الحالي"} • السؤال ${index + 1} من ${questions.length}`;
      card.querySelector(".cap-question").textContent = q.question;
      const hint = card.querySelector(".cap-hint"); hint.textContent = q.hint ? `تلميح: ${q.hint}` : "لا يوجد تلميح إضافي"; hint.className = "cap-hint";
      const answer = card.querySelector(".cap-answer"); answer.textContent = `الإجابة: ${q.answer}`; answer.className = "cap-answer";
      nativeQuestion.style.display = "none"; card.classList.add("active"); awaiting = true;
    }
    function finish(isWrong) {
      if (!importedMode || !awaiting || !questions[index]) return;
      if (isWrong) retry.push(questions[index]); index += 1; awaiting = false; card.classList.remove("active"); nativeQuestion.style.display = "";
      window.setTimeout(render, 500);
    }
    function buttonsVisible() { return getComputedStyle(correct).display !== "none" && getComputedStyle(wrong).display !== "none"; }
    function order(list, mode) { const copy = list.slice(); if (mode === "random") for (let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];} return copy; }
  });
})();
