(function () {
  "use strict";

  const TYPE = "tower-game";
  let pack = null;
  let questions = [];
  let retry = [];
  let index = 0;
  let importedMode = false;
  let awaitingResult = false;
  let activeQuestion = null;
  let activePlayer = "";
  let builtFloors = 0;
  const playerScores = new Map();

  const ready = (fn) => document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", fn) : fn();

  ready(() => {
    const classSelect = document.getElementById("classSelect");
    const startButton = document.getElementById("startGameBtn");
    const correctButton = document.getElementById("correctBtn");
    const wrongButton = document.getElementById("wrongBtn");
    const interactionMessage = document.getElementById("interactionMessage");
    const playerName = document.getElementById("currentPlayerName");
    if (!classSelect || !startButton || !correctButton || !wrongButton || !interactionMessage || !playerName) return;

    const loader = document.createElement("section");
    loader.id = "classactTowerLoader";
    loader.dir = "rtl";
    loader.innerHTML = `
      <style>
        #classactTowerLoader,.cat-question-card{background:rgba(255,255,255,.96);border:2px solid #f4c542;border-radius:18px;padding:18px;margin:16px auto;max-width:820px;text-align:center;box-shadow:0 10px 28px rgba(0,0,0,.16);font-family:Cairo,sans-serif}.cat-mode-row,.cat-actions{display:flex;justify-content:center;gap:10px;flex-wrap:wrap}.cat-mode{border:2px solid #6d28d9;background:#fff;color:#6d28d9;border-radius:12px;padding:10px 18px;font-weight:800;cursor:pointer}.cat-mode.active{background:#6d28d9;color:#fff}.cat-import{display:none;margin-top:14px}.cat-import.active{display:block}.cat-file{display:block;margin:12px auto;max-width:430px;width:100%}.cat-status{min-height:26px;color:#6d28d9;font-weight:800}.cat-question-card{display:none;border-color:#6d28d9}.cat-question-card.active{display:block}.cat-counter{color:#6d28d9;font-weight:800}.cat-question{font-size:clamp(1.3rem,3vw,2rem);font-weight:800;line-height:1.7;margin:16px 0}.cat-hint,.cat-answer{display:none;margin:12px auto;padding:13px;border-radius:12px}.cat-hint.show{display:block;background:#fff7d6}.cat-answer.show{display:block;background:#dcfce7;font-size:1.3rem;font-weight:800}.cat-tower-meter{margin:12px auto;max-width:680px;background:#e2e8f0;border-radius:999px;height:14px;overflow:hidden}.cat-tower-meter i{display:block;height:100%;width:0;background:linear-gradient(90deg,#f59e0b,#8b5cf6,#06b6d4);transition:.45s}.cat-floor-label{font-weight:900;color:#6d28d9}.cat-options{display:none;grid-template-columns:1fr 1fr;gap:10px;margin:14px auto;max-width:740px}.cat-options.show{display:grid}.cat-option{border:3px solid transparent;border-radius:14px;padding:13px;font-family:Cairo,sans-serif;font-weight:900;cursor:pointer;transition:.2s;color:#172033}.cat-option:nth-child(4n+1){background:#dbeafe;border-color:#60a5fa}.cat-option:nth-child(4n+2){background:#dcfce7;border-color:#4ade80}.cat-option:nth-child(4n+3){background:#fef3c7;border-color:#fbbf24}.cat-option:nth-child(4n){background:#fce7f3;border-color:#f472b6}.cat-option:hover{transform:translateY(-3px)}.cat-option.correct{background:#16a34a;color:#fff;border-color:#14532d}.cat-option.wrong{background:#dc2626;color:#fff;border-color:#7f1d1d}.cat-option:disabled{cursor:not-allowed;opacity:.82}.cat-scoreboard{display:flex;gap:7px;justify-content:center;flex-wrap:wrap;margin-top:12px}.cat-score{background:#f5f3ff;color:#5b21b6;border-radius:999px;padding:5px 10px;font-weight:800}.cat-guide{margin:12px auto 0;background:#f8fafc;border-right:5px solid #f4c542;border-radius:12px;padding:10px;text-align:right;line-height:1.8}.cat-actions button{border:0;border-radius:11px;padding:10px 16px;color:#fff;font-family:Cairo,sans-serif;font-weight:800;cursor:pointer}.cat-hint-btn{background:#d97706}.cat-answer-btn{background:#4f46e5}
        @media(max-width:650px){.cat-options{grid-template-columns:1fr}.cat-actions button{flex:1}}
      </style>
      <h3>📚 أسئلة البطولة</h3>
      <div class="cat-mode-row"><button type="button" class="cat-mode active" data-mode="native">أسئلة المعلم</button><button type="button" class="cat-mode" data-mode="imported">أسئلة مستوردة</button></div>
      <div class="cat-import"><p>سيظهر سؤال جديد لكل طالب عند بدء دوره.</p><input class="cat-file" type="file" accept=".classact,application/json"><div class="cat-status" role="status"></div></div><div class="cat-guide"><b>🏗️ منطق البرج:</b> الإجابة الصحيحة تبني طابقًا وتزيد رصيد الطالب. عند وجود ثلاثة خيارات خاطئة في القالب تظهر أربعة صناديق ويُصحح الاختيار تلقائيًا، وإلا يقيّم المعلم الإجابة شفهيًا.</div>`;
    const setup = classSelect.closest(".setup-section, .game-setup, .setup-container, .settings-panel") || classSelect.parentElement.parentElement;
    setup.prepend(loader);

    const card = document.createElement("section");
    card.className = "cat-question-card";
    card.innerHTML = `<div class="cat-counter"></div><div class="cat-floor-label">🏗️ الطوابق المبنية: 0</div><div class="cat-tower-meter"><i></i></div><div class="cat-question"></div><div class="cat-hint"></div><div class="cat-answer"></div><div class="cat-options"></div><div class="cat-actions"><button type="button" class="cat-hint-btn">عرض التلميح</button><button type="button" class="cat-answer-btn">كشف الإجابة</button></div><div class="cat-scoreboard"></div>`;
    interactionMessage.insertAdjacentElement("afterend", card);

    const importBox = loader.querySelector(".cat-import");
    const status = loader.querySelector(".cat-status");
    loader.querySelectorAll(".cat-mode").forEach((button) => button.addEventListener("click", () => {
      importedMode = button.dataset.mode === "imported";
      loader.querySelectorAll(".cat-mode").forEach((item) => item.classList.toggle("active", item === button));
      importBox.classList.toggle("active", importedMode);
      card.classList.toggle("active", importedMode && awaitingResult);
    }));

    loader.querySelector(".cat-file").addEventListener("change", async (event) => {
      try {
        const file = event.target.files[0];
        if (!file) return;
        const data = JSON.parse(await file.text());
        if (data.format !== "classact" || data.version !== "1.0" || data.activityType !== TYPE) throw new Error("هذا الملف ليس مخصصًا لبرج الأسماء");
        const valid = Array.isArray(data.questions) ? data.questions.filter((q) => q && String(q.question || "").trim() && String(q.answer || "").trim()) : [];
        if (!valid.length) throw new Error("لا توجد أسئلة صالحة في الملف");
        pack = data; questions = order(valid, data.settings?.questionOrder); retry = []; index = 0;
        status.textContent = `تم استيراد ${valid.length} سؤالًا بنجاح`;
      } catch (error) { pack = null; questions = []; status.textContent = error.message || "تعذر قراءة الملف"; }
    });

    startButton.addEventListener("click", (event) => {
      if (!importedMode) return;
      if (!pack || !questions.length) { event.preventDefault(); event.stopImmediatePropagation(); status.textContent = "استورد ملف برج الأسماء أولًا"; return; }
      retry = []; index = 0; questions = order(pack.questions, pack.settings?.questionOrder);
      window.setTimeout(renderForTurn, 500);
    }, true);
    correctButton.addEventListener("click", () => finishQuestion(false));
    wrongButton.addEventListener("click", () => finishQuestion(true));
    card.querySelector(".cat-hint-btn").onclick = () => card.querySelector(".cat-hint").classList.add("show");
    card.querySelector(".cat-answer-btn").onclick = () => card.querySelector(".cat-answer").classList.add("show");

    const observer = new MutationObserver(() => {
      if (importedMode && pack && isResultButtonVisible() && !awaitingResult) window.setTimeout(renderForTurn, 100);
    });
    observer.observe(playerName, { childList: true, characterData: true, subtree: true });
    observer.observe(interactionMessage, { childList: true, characterData: true, subtree: true });

    function renderForTurn() {
      if (!importedMode || !pack || awaitingResult || !isResultButtonVisible()) return;
      if (index >= questions.length) {
        if (pack.settings?.repeatWrongQuestions !== false && retry.length) { questions = retry.slice(); retry = []; index = 0; }
        else { questions = order(pack.questions, pack.settings?.questionOrder); retry = []; index = 0; }
      }
      const q = questions[index];
      activeQuestion = q; activePlayer = playerName.textContent.trim() || "الطالب";
      card.querySelector(".cat-counter").textContent = `${playerName.textContent.trim()} • السؤال ${index + 1} من ${questions.length}`;
      card.querySelector(".cat-question").textContent = q.question;
      const hint = card.querySelector(".cat-hint"); hint.textContent = q.hint ? `تلميح: ${q.hint}` : "لا يوجد تلميح إضافي"; hint.className = "cat-hint";
      const answer = card.querySelector(".cat-answer"); answer.textContent = `الإجابة: ${q.answer}`; answer.className = "cat-answer";
      renderChoices(q); updateTowerStats();
      interactionMessage.style.display = "none"; card.classList.add("active"); awaitingResult = true;
    }
    function finishQuestion(wrong) {
      if (!importedMode || !awaitingResult || !questions[index]) return;
      if (wrong) retry.push(questions[index]);
      else { builtFloors += 1; playerScores.set(activePlayer,(playerScores.get(activePlayer)||0)+(Number(activeQuestion?.points)||10)); if(typeof window.confetti==="function")window.confetti({particleCount:65,spread:60,origin:{y:.72}}); }
      index += 1; awaitingResult = false; card.classList.remove("active"); interactionMessage.style.display = "";
      window.setTimeout(renderForTurn, 450);
    }
    function renderChoices(q) {
      const box=card.querySelector(".cat-options"),actions=card.querySelector(".cat-actions");
      const alternatives=Array.isArray(q.alternativeAnswers)?q.alternativeAnswers.map(v=>String(v).trim()).filter(Boolean):[];
      box.innerHTML=""; box.classList.toggle("show",alternatives.length>=2); actions.style.display=alternatives.length>=2?"none":"";
      if(alternatives.length<2)return;
      const choices=order([...alternatives.slice(0,3).map(text=>({text,correct:false})),{text:String(q.answer),correct:true}],"random");
      choices.forEach(item=>{const btn=document.createElement("button");btn.type="button";btn.className="cat-option";btn.textContent=item.text;btn.onclick=()=>{box.querySelectorAll("button").forEach(v=>v.disabled=true);btn.classList.add(item.correct?"correct":"wrong");if(!item.correct)[...box.children].find(v=>v.textContent===String(q.answer))?.classList.add("correct");card.querySelector(".cat-answer").classList.add("show");window.setTimeout(()=>item.correct?correctButton.click():wrongButton.click(),850)};box.appendChild(btn)});
    }
    function updateTowerStats(){card.querySelector(".cat-floor-label").textContent=`🏗️ الطوابق المبنية: ${builtFloors}`;const target=Math.max(1,pack?.questions?.length||25);card.querySelector(".cat-tower-meter i").style.width=`${Math.min(100,builtFloors/target*100)}%`;card.querySelector(".cat-scoreboard").innerHTML=[...playerScores.entries()].sort((a,b)=>b[1]-a[1]).map(([name,score],i)=>`<span class="cat-score">${i===0?"👑":"⭐"} ${name}: ${score}</span>`).join("")}
    function isResultButtonVisible() { return getComputedStyle(correctButton).display !== "none" && getComputedStyle(wrongButton).display !== "none"; }
    function order(list, mode) {
      const copy = list.slice();
      if (mode === "random") for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
      return copy;
    }
  });
})();
