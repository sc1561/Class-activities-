(function () {
  "use strict";
  const TYPE = "names-wheel";
  let pack = null, questions = [], retry = [], index = 0, importedMode = false, waiting = false;
  const ready = (fn) => document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", fn) : fn();

  ready(() => {
    const classSelect = document.getElementById("classSelect");
    const spin = document.getElementById("spinButton");
    const result = document.getElementById("finalResult");
    const selectedPair = document.getElementById("selectedPair");
    const nextRound = document.getElementById("nextRoundBtn");
    if (!classSelect || !spin || !result || !selectedPair || !nextRound) return;

    const loader = document.createElement("section");
    loader.id = "classactNamesWheelLoader";
    loader.dir = "rtl";
    loader.innerHTML = `<style>
      #classactNamesWheelLoader{background:rgba(255,255,255,.96);border:2px solid #7c3aed;border-radius:18px;padding:18px;margin:16px auto;max-width:850px;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,.16);font-family:Cairo,sans-serif}.can-modes,.can-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}.can-mode{border:2px solid #7c3aed;background:#fff;color:#7c3aed;border-radius:12px;padding:10px 18px;font-weight:800;cursor:pointer}.can-mode.active{background:linear-gradient(135deg,#7c3aed,#db2777);color:#fff}.can-import{display:none;margin-top:14px}.can-import.active{display:block}.can-file{display:block;width:100%;max-width:430px;margin:12px auto}.can-status{min-height:25px;color:#6d28d9;font-weight:800}.can-question{font-size:clamp(1.2rem,2.6vw,1.8rem);font-weight:800;line-height:1.7;margin:12px 0}.can-hint,.can-answer{display:none;padding:12px;border-radius:11px;margin:10px auto}.can-hint.show{display:block;background:#fff4c2}.can-answer.show{display:block;background:#c9f7da;font-size:1.2rem;font-weight:800}.can-actions button{border:0;border-radius:10px;padding:9px 14px;color:#fff;font-family:Cairo,sans-serif;font-weight:800;cursor:pointer}.can-hint-btn{background:#d97706}.can-answer-btn{background:#4f46e5}.can-correct{background:#15803d}.can-wrong{background:#b91c1c}.can-native-task{display:none!important}</style>
      <h3>📚 نمط الأسئلة الذكية</h3><div class="can-modes"><button type="button" class="can-mode active" data-mode="native">بطاقات المهام</button><button type="button" class="can-mode" data-mode="imported">أسئلة مستوردة</button></div>
      <div class="can-import"><p>بعد اختيار الطالب ستظهر له بطاقة سؤال بدل بطاقة المهمة.</p><input class="can-file" type="file" accept=".classact,application/json"><div class="can-status" role="status"></div></div>`;
    (classSelect.closest(".class-selection, .selection-section, .control-section") || classSelect.parentElement.parentElement).appendChild(loader);

    const status = loader.querySelector(".can-status"), importBox = loader.querySelector(".can-import");
    loader.querySelectorAll(".can-mode").forEach((button) => button.addEventListener("click", () => {
      importedMode = button.dataset.mode === "imported";
      loader.querySelectorAll(".can-mode").forEach((item) => item.classList.toggle("active", item === button));
      importBox.classList.toggle("active", importedMode);
      if (!importedMode) {
        selectedPair.querySelectorAll(".can-native-task").forEach((item) => item.classList.remove("can-native-task"));
        const box = selectedPair.querySelector(".can-question-box"); if (box) box.style.display = "none";
      }
    }));
    loader.querySelector(".can-file").addEventListener("change", async (event) => {
      try {
        const file = event.target.files[0]; if (!file) return;
        const data = JSON.parse(await file.text());
        if (data.format !== "classact" || data.version !== "1.0" || data.activityType !== TYPE) throw new Error("هذا الملف ليس مخصصًا لبطاقات الأسماء الذكية");
        const valid = Array.isArray(data.questions) ? data.questions.filter((q) => q && String(q.question || "").trim() && String(q.answer || "").trim()) : [];
        if (!valid.length) throw new Error("لا توجد أسئلة صالحة في الملف");
        pack = data; questions = order(valid, data.settings?.questionOrder); retry = []; index = 0;
        status.textContent = `تم استيراد ${valid.length} سؤالًا بنجاح`;
      } catch (error) { pack = null; questions = []; status.textContent = error.message || "تعذر قراءة الملف"; }
    });
    spin.addEventListener("click", (event) => {
      if (!importedMode) return;
      if (!pack || !questions.length) { event.preventDefault(); event.stopImmediatePropagation(); status.textContent = "استورد ملف بطاقات الأسماء أولًا"; return; }
      waiting = true;
    }, true);

    const observer = new MutationObserver(() => {
      if (importedMode && pack && waiting && isResultVisible()) window.setTimeout(renderQuestion, 80);
    });
    observer.observe(result, { attributes:true, childList:true, subtree:true });

    function renderQuestion() {
      if (!importedMode || !pack || !waiting || !isResultVisible()) return;
      if (index >= questions.length) {
        if (pack.settings?.repeatWrongQuestions !== false && retry.length) { questions = retry.slice(); retry = []; index = 0; }
        else { questions = order(pack.questions, pack.settings?.questionOrder); retry = []; index = 0; }
      }
      const task = selectedPair.querySelector(".selected-task"); if (!task) return;
      task.querySelector("h4").textContent = "📚 السؤال المختار";
      const icon = task.querySelector(".task-icon-large"); if (icon) icon.textContent = "❓";
      const title = task.querySelector(".task-title-large"); if (title) title.classList.add("can-native-task");
      const desc = task.querySelector(".task-desc-large"); if (desc) desc.classList.add("can-native-task");
      let box = task.querySelector(".can-question-box");
      if (!box) { box = document.createElement("div"); box.className = "can-question-box"; box.innerHTML = `<div class="can-question"></div><div class="can-hint"></div><div class="can-answer"></div><div class="can-actions"><button type="button" class="can-hint-btn">عرض التلميح</button><button type="button" class="can-answer-btn">كشف الإجابة</button><button type="button" class="can-correct">إجابة صحيحة</button><button type="button" class="can-wrong">إجابة خاطئة</button></div>`; task.appendChild(box); box.querySelector(".can-hint-btn").onclick=()=>box.querySelector(".can-hint").classList.add("show"); box.querySelector(".can-answer-btn").onclick=()=>box.querySelector(".can-answer").classList.add("show"); box.querySelector(".can-correct").onclick=()=>finish(false); box.querySelector(".can-wrong").onclick=()=>finish(true); }
      const q = questions[index]; box.querySelector(".can-question").textContent = q.question;
      const hint = box.querySelector(".can-hint"); hint.textContent = q.hint ? `تلميح: ${q.hint}` : "لا يوجد تلميح إضافي"; hint.className = "can-hint";
      const answer = box.querySelector(".can-answer"); answer.textContent = `الإجابة: ${q.answer}`; answer.className = "can-answer";
      box.style.display = "block"; waiting = false;
    }
    function finish(isWrong) { const q=questions[index]; if(!q)return; if(isWrong)retry.push(q); index+=1; const box=selectedPair.querySelector(".can-question-box"); if(box)box.style.display="none"; window.setTimeout(()=>nextRound.click(),180); }
    function isResultVisible(){return getComputedStyle(result).display!=="none" && result.offsetParent!==null;}
    function order(list,mode){const copy=list.slice();if(mode==="random")for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;}
  });
})();
