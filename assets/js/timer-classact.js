(function () {
  "use strict";
  const TYPE = "timer";
  let pack = null, questions = [], retry = [], index = 0, importedMode = false;
  const ready = (fn) => document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", fn) : fn();

  ready(() => {
    const duration = document.getElementById("timerDuration");
    const start = document.getElementById("startBtn");
    const reset = document.getElementById("resetBtn");
    const timerTime = document.getElementById("timerTime");
    if (!duration || !start || !reset || !timerTime) return;

    const loader = document.createElement("section");
    loader.id = "classactTimerLoader";
    loader.dir = "rtl";
    loader.innerHTML = `<style>
      #classactTimerLoader,.cati-card{background:rgba(255,255,255,.96);border:2px solid #0ea5e9;border-radius:18px;padding:18px;margin:16px auto;max-width:900px;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,.16);font-family:Cairo,sans-serif}.cati-modes,.cati-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}.cati-mode{border:2px solid #0284c7;background:#fff;color:#0284c7;border-radius:12px;padding:10px 18px;font-weight:800;cursor:pointer}.cati-mode.active{background:linear-gradient(135deg,#0284c7,#7c3aed);color:#fff}.cati-import{display:none;margin-top:14px}.cati-import.active{display:block}.cati-file{display:block;width:100%;max-width:430px;margin:12px auto}.cati-status{min-height:25px;color:#0369a1;font-weight:800}.cati-card{display:none;border-color:#7c3aed}.cati-card.active{display:block}.cati-counter{color:#0369a1;font-weight:800}.cati-question{font-size:clamp(1.3rem,3vw,2rem);font-weight:800;line-height:1.7;margin:15px 0}.cati-hint,.cati-answer{display:none;padding:12px;border-radius:11px;margin:10px auto}.cati-hint.show{display:block;background:#fff4c2}.cati-answer.show{display:block;background:#c9f7da;font-size:1.25rem;font-weight:800}.cati-actions button{border:0;border-radius:10px;padding:10px 15px;color:#fff;font-family:Cairo,sans-serif;font-weight:800;cursor:pointer}.cati-hint-btn{background:#d97706}.cati-answer-btn{background:#4f46e5}.cati-correct{background:#15803d}.cati-wrong{background:#b91c1c}</style>
      <h3>📚 وضع مؤقت الأسئلة</h3><div class="cati-modes"><button type="button" class="cati-mode active" data-mode="native">المؤقت العادي</button><button type="button" class="cati-mode" data-mode="imported">مؤقت الأسئلة</button></div>
      <div class="cati-import"><p>يُضبط المؤقت تلقائيًا حسب زمن كل سؤال.</p><input class="cati-file" type="file" accept=".classact,application/json"><div class="cati-status" role="status"></div></div>`;
    const settings = duration.closest(".settings-panel, .timer-settings, .settings-section") || duration.parentElement.parentElement;
    settings.parentElement.insertBefore(loader, settings);

    const card = document.createElement("section");
    card.className = "cati-card";
    card.innerHTML = `<div class="cati-counter"></div><div class="cati-question"></div><div class="cati-hint"></div><div class="cati-answer"></div><div class="cati-actions"><button type="button" class="cati-hint-btn">عرض التلميح</button><button type="button" class="cati-answer-btn">كشف الإجابة</button><button type="button" class="cati-correct">إجابة صحيحة</button><button type="button" class="cati-wrong">إجابة خاطئة</button></div>`;
    const display = timerTime.closest(".timer-display, .timer-circle, .timer-section") || timerTime.parentElement;
    display.parentElement.insertBefore(card, display);
    const importBox = loader.querySelector(".cati-import"), status = loader.querySelector(".cati-status");

    loader.querySelectorAll(".cati-mode").forEach((button) => button.addEventListener("click", () => {
      importedMode = button.dataset.mode === "imported";
      loader.querySelectorAll(".cati-mode").forEach((item) => item.classList.toggle("active", item === button));
      importBox.classList.toggle("active", importedMode); card.classList.toggle("active", importedMode && !!pack);
    }));
    loader.querySelector(".cati-file").addEventListener("change", async (event) => {
      try {
        const file = event.target.files[0]; if (!file) return;
        const data = JSON.parse(await file.text());
        if (data.format !== "classact" || data.version !== "1.0" || data.activityType !== TYPE) throw new Error("هذا الملف ليس مخصصًا للمؤقت التفاعلي");
        const valid = Array.isArray(data.questions) ? data.questions.filter((q) => q && String(q.question || "").trim() && String(q.answer || "").trim()) : [];
        if (!valid.length) throw new Error("لا توجد أسئلة صالحة في الملف");
        pack = data; questions = order(valid, data.settings?.questionOrder); retry = []; index = 0; status.textContent = `تم استيراد ${valid.length} سؤالًا بنجاح`; card.classList.add("active"); render();
      } catch (error) { pack = null; questions = []; card.classList.remove("active"); status.textContent = error.message || "تعذر قراءة الملف"; }
    });
    start.addEventListener("click", (event) => {
      if (!importedMode) return;
      if (!pack || !questions.length) { event.preventDefault(); event.stopImmediatePropagation(); status.textContent = "استورد ملف المؤقت أولًا"; return; }
    }, true);
    card.querySelector(".cati-hint-btn").onclick=()=>card.querySelector(".cati-hint").classList.add("show");
    card.querySelector(".cati-answer-btn").onclick=()=>card.querySelector(".cati-answer").classList.add("show");
    card.querySelector(".cati-correct").onclick=()=>advance(false);
    card.querySelector(".cati-wrong").onclick=()=>advance(true);

    function render() {
      if (!pack || !questions.length) return;
      if (index >= questions.length) {
        if (pack.settings?.repeatWrongQuestions !== false && retry.length) { questions = retry.slice(); retry = []; index = 0; }
        else { questions = order(pack.questions, pack.settings?.questionOrder); retry = []; index = 0; }
      }
      const q=questions[index], seconds=Math.max(5,Number(q.time)||Number(pack.settings?.defaultTime)||30);
      card.querySelector(".cati-counter").textContent=`السؤال ${index+1} من ${questions.length} • ${seconds} ثانية`;
      card.querySelector(".cati-question").textContent=q.question;
      const hint=card.querySelector(".cati-hint");hint.textContent=q.hint?`تلميح: ${q.hint}`:"لا يوجد تلميح إضافي";hint.className="cati-hint";
      const answer=card.querySelector(".cati-answer");answer.textContent=`الإجابة: ${q.answer}`;answer.className="cati-answer";
      setDuration(seconds); card.classList.add("active");
    }
    function advance(isWrong){const q=questions[index];if(!q)return;if(isWrong)retry.push(q);index+=1;reset.click();window.setTimeout(render,120);}
    function setDuration(seconds){duration.querySelectorAll("option[data-classact]").forEach(o=>o.remove());let option=[...duration.options].find(o=>Number(o.value)===seconds);if(!option){option=document.createElement("option");option.value=String(seconds);option.textContent=`${seconds} ثانية`;option.dataset.classact="true";duration.appendChild(option);}duration.value=String(seconds);duration.dispatchEvent(new Event("change",{bubbles:true}));reset.click();}
    function order(list,mode){const copy=list.slice();if(mode==="random")for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;}
  });
})();
