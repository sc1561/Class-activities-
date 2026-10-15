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

    document.body.classList.add("names-wheel-redesign");
    injectStyles();
    enhanceHeader();
    enhanceSetup(classSelect);
    enhanceResultActions();

    const loader = document.createElement("section");
    loader.id = "classactNamesWheelLoader";
    loader.dir = "rtl";
    loader.innerHTML = `
      <div class="can-heading"><span class="can-step">2</span><div><h3>طريقة اللعب</h3><p>اختر نوع البطاقة التي ستظهر بعد اختيار الطالب</p></div></div>
      <div class="can-modes" role="group" aria-label="طريقة اللعب">
        <button type="button" class="can-mode active" data-mode="native"><span>🎯</span><strong>مهام جاهزة</strong><small>بطاقات تعليمية من النشاط</small></button>
        <button type="button" class="can-mode" data-mode="imported"><span>📚</span><strong>أسئلة مستوردة</strong><small>استخدم قالب أسئلة الدرس</small></button>
      </div>
      <div class="can-import">
        <label class="can-file-label"><span>⬆️</span><strong>استيراد قالب الأسئلة</strong><small>ملف .classact أو JSON مخصص لبطاقات الأسماء</small><input class="can-file" type="file" accept=".classact,application/json"></label>
        <div class="can-status" role="status" aria-live="polite"></div>
      </div>`;
    (classSelect.closest(".class-selection, .selection-section, .control-section") || classSelect.parentElement.parentElement).appendChild(loader);

    const status = loader.querySelector(".can-status"), importBox = loader.querySelector(".can-import");
    loader.querySelectorAll(".can-mode").forEach((button) => button.addEventListener("click", () => {
      importedMode = button.dataset.mode === "imported";
      loader.querySelectorAll(".can-mode").forEach((item) => item.classList.toggle("active", item === button));
      importBox.classList.toggle("active", importedMode);
      updateModeBadge();
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
        status.className = "can-status success";
        status.textContent = `✓ تم استيراد ${valid.length} سؤالًا — النشاط جاهز`;
      } catch (error) {
        pack = null; questions = []; status.className = "can-status error";
        status.textContent = error.message || "تعذر قراءة الملف";
      }
    });

    spin.addEventListener("click", (event) => {
      if (!importedMode) return;
      if (!pack || !questions.length) {
        event.preventDefault(); event.stopImmediatePropagation();
        status.className = "can-status error"; status.textContent = "استورد قالب الأسئلة أولًا";
        loader.scrollIntoView({ behavior: "smooth", block: "center" }); return;
      }
      waiting = true;
    }, true);

    const observer = new MutationObserver(() => {
      if (importedMode && pack && waiting && isResultVisible()) window.setTimeout(renderQuestion, 80);
    });
    observer.observe(result, { attributes:true, childList:true, subtree:true });
    classSelect.addEventListener("change", () => {
      window.setTimeout(syncExperience, 180);
      window.setTimeout(syncExperience, 900);
    });
    syncExperience();

    function renderQuestion() {
      if (!importedMode || !pack || !waiting || !isResultVisible()) return;
      if (index >= questions.length) {
        if (pack.settings?.repeatWrongQuestions !== false && retry.length) { questions = retry.slice(); retry = []; index = 0; }
        else { questions = order(pack.questions, pack.settings?.questionOrder); retry = []; index = 0; }
      }
      const task = selectedPair.querySelector(".selected-task"); if (!task) return;
      const heading = task.querySelector("h4"); if (heading) heading.textContent = "سؤال الطالب";
      const icon = task.querySelector(".task-icon-large"); if (icon) icon.textContent = "❓";
      const title = task.querySelector(".task-title-large"); if (title) title.classList.add("can-native-task");
      const desc = task.querySelector(".task-desc-large"); if (desc) desc.classList.add("can-native-task");
      let box = task.querySelector(".can-question-box");
      if (!box) {
        box = document.createElement("div"); box.className = "can-question-box";
        box.innerHTML = `<div class="can-progress"></div><div class="can-question"></div><div class="can-hint"></div><div class="can-answer"></div><div class="can-actions"><button type="button" class="can-hint-btn">💡 تلميح</button><button type="button" class="can-answer-btn">👁 كشف الإجابة</button><button type="button" class="can-correct">✓ إجابة صحيحة</button><button type="button" class="can-wrong">↻ تحتاج مراجعة</button></div>`;
        task.appendChild(box);
        box.querySelector(".can-hint-btn").onclick=()=>box.querySelector(".can-hint").classList.add("show");
        box.querySelector(".can-answer-btn").onclick=()=>box.querySelector(".can-answer").classList.add("show");
        box.querySelector(".can-correct").onclick=()=>finish(false);
        box.querySelector(".can-wrong").onclick=()=>finish(true);
      }
      const q = questions[index];
      box.querySelector(".can-progress").textContent = `السؤال ${index + 1} من ${questions.length}`;
      box.querySelector(".can-question").textContent = q.question;
      const hint = box.querySelector(".can-hint"); hint.textContent = q.hint ? `💡 ${q.hint}` : "لا يوجد تلميح إضافي"; hint.className = "can-hint";
      const answer = box.querySelector(".can-answer"); answer.textContent = `✓ الإجابة: ${q.answer}`; answer.className = "can-answer";
      box.style.display = "block"; waiting = false;
    }

    function finish(isWrong) {
      const q=questions[index]; if(!q)return;
      if(isWrong)retry.push(q); index+=1;
      const box=selectedPair.querySelector(".can-question-box"); if(box)box.style.display="none";
      window.setTimeout(()=>nextRound.click(),220);
    }
    function isResultVisible(){return getComputedStyle(result).display!=="none" && result.offsetParent!==null;}
    function order(list,mode){const copy=list.slice();if(mode==="random")for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;}
  });

  function enhanceHeader(){
    const subtitle=document.querySelector(".subtitle");
    if(subtitle) subtitle.innerHTML="اختر طالبًا بعدالة، ثم اكشف له بطاقة سؤال أو مهمة تعليمية";
    const header=document.querySelector(".header");
    if(header&&!header.querySelector(".journey-steps")){
      const steps=document.createElement("div"); steps.className="journey-steps";
      steps.innerHTML='<span class="active">1 إعداد الجولة</span><span>2 اختيار بطاقة</span><span>3 كشف التحدي</span>';
      header.appendChild(steps);
    }
  }

  function enhanceSetup(classSelect){
    const selector=classSelect.closest(".class-selector");
    if(!selector)return;
    selector.classList.add("setup-card");
    const h3=selector.querySelector("h3");
    if(h3) h3.innerHTML='<span class="setup-step">1</span><span>اختر الصف الدراسي</span>';
  }

  function enhanceResultActions(){
    const labels={nextRoundBtn:"🔄 اختيار جديد",removeStudentBtn:"استبعاد من هذه الجولة",continueSelectionBtn:"إبقاء الطالب واختيار آخر"};
    Object.entries(labels).forEach(([id,label])=>{const el=document.getElementById(id);if(el){el.textContent=label;el.title=label;}});
    const close=document.getElementById("closeResultBtn"); if(close) close.setAttribute("aria-label","إغلاق النتيجة");
  }

  function updateModeBadge(){
    const header=document.querySelector(".cards-header p");
    if(header)header.textContent=importedMode?"سيظهر سؤال الدرس بعد كشف اسم الطالب":"سيظهر تحدٍ تعليمي بعد كشف اسم الطالب";
  }

  function syncExperience(){
    const select=document.getElementById("classSelect"), hasClass=select&&select.value;
    const welcome=document.getElementById("welcomeMessage");
    const selector=document.querySelector(".class-selector");
    if(selector)selector.classList.toggle("is-ready",!!hasClass);
    if(welcome){
      const lines=welcome.querySelectorAll("div,p,span");
      if(hasClass&&!welcome.classList.contains("ready-message")){
        welcome.classList.add("ready-message");
        welcome.innerHTML='<strong>✓ البطاقات جاهزة</strong><small>ابدأ الاختيار العشوائي أو اختر بطاقة مباشرة من الطاولة</small>';
      } else if(!hasClass&&welcome.classList.contains("ready-message")){
        welcome.classList.remove("ready-message");
        welcome.innerHTML='<strong>اختر الصف الدراسي</strong><small>ستظهر بطاقات الطلاب هنا بعد تحميل القائمة</small>';
      }
    }
    const spin=document.getElementById("spinButton");
    if(spin&&!spin.disabled&&!spin.dataset.cleanLabel){spin.innerHTML='<span aria-hidden="true">🎴</span> اختيار بطاقة عشوائيًا';spin.dataset.cleanLabel="1";}
    const total=document.querySelector('[data-stat="total"] .stat-value')?.textContent?.trim();
    document.querySelectorAll("body *").forEach((el)=>{
      if(el.children.length===0&&/\d+\/\d+ بطاقة متاحة/.test(el.textContent||"")) el.textContent=total?`🃏 ${total} بطاقة أسماء`:"🃏 بطاقات الأسماء جاهزة";
    });
    enhanceResultActions();
  }

  function injectStyles(){
    const style=document.createElement("style"); style.id="namesWheelRedesignStyles";
    style.textContent=`
      :root{--nw-ink:#102a2b;--nw-muted:#5d7272;--nw-primary:#087f76;--nw-primary-2:#13a89e;--nw-gold:#f4b942;--nw-card:#fffdf7;--nw-line:#dce9e6;--nw-danger:#c94646}
      body.names-wheel-redesign{background:radial-gradient(circle at 50% 0,#dff8f0 0,#d5eee8 28%,#b7ddd5 65%,#96cbc1 100%);color:var(--nw-ink)}
      .names-wheel-redesign body:before,.names-wheel-redesign::before{animation:none!important;opacity:.3}
      .names-wheel-redesign .cosmic-container{max-width:1180px;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.55);border-radius:28px;padding:clamp(14px,2.5vw,28px);box-shadow:0 22px 70px rgba(5,67,63,.16)}
      .names-wheel-redesign .header{padding:24px 0 20px}.names-wheel-redesign .header:before{display:none}
      .names-wheel-redesign .main-title{font-size:clamp(2rem,5vw,3.7rem);margin-bottom:8px;background:linear-gradient(90deg,#075f59,#0e9187);-webkit-background-clip:text;background-clip:text;animation:none;text-shadow:none}
      .names-wheel-redesign .subtitle{font-size:clamp(.95rem,2vw,1.15rem);color:var(--nw-muted);margin-bottom:16px}
      .journey-steps{display:flex;justify-content:center;gap:8px;flex-wrap:wrap}.journey-steps span{background:rgba(255,255,255,.62);border:1px solid rgba(8,127,118,.12);color:#54706d;padding:7px 13px;border-radius:999px;font-size:.78rem;font-weight:700}.journey-steps .active{background:var(--nw-primary);color:#fff}
      .names-wheel-redesign .control-buttons{top:16px;gap:10px}.names-wheel-redesign .control-btn{width:48px;height:48px;font-size:19px;box-shadow:0 7px 22px rgba(5,67,63,.15);border:1px solid #fff}
      .names-wheel-redesign .class-selector{padding:22px;margin:12px auto 22px;max-width:940px;background:rgba(255,255,255,.94);border:1px solid var(--nw-line);box-shadow:0 14px 40px rgba(5,67,63,.1);overflow:visible}
      .names-wheel-redesign .class-selector:before{background:var(--nw-primary);height:4px}.names-wheel-redesign .class-selector h3{margin-bottom:14px;color:var(--nw-ink);justify-content:flex-start;font-size:1.12rem}
      .setup-step,.can-step{display:inline-grid;place-items:center;width:32px;height:32px;border-radius:50%;background:var(--nw-primary);color:#fff;font-weight:900;font-size:.95rem;flex:none}
      .names-wheel-redesign .select-wrapper{border:1px solid #cfe1de;box-shadow:none;background:#fff}.names-wheel-redesign .class-select{padding:13px 16px;font-size:1rem}
      #classactNamesWheelLoader{background:#f7fbfa;border:1px solid #d9e8e5;border-radius:16px;padding:16px;margin:16px 0 0;text-align:right;box-shadow:none;font-family:Cairo,sans-serif}
      .can-heading{display:flex;gap:11px;align-items:center;margin-bottom:13px}.can-heading h3{margin:0!important;font-size:1.06rem!important;display:block!important;text-align:right!important;color:var(--nw-ink)!important}.can-heading p{font-size:.78rem;color:var(--nw-muted);margin:2px 0 0}
      .can-modes{display:grid;grid-template-columns:1fr 1fr;gap:10px}.can-mode{display:grid;grid-template-columns:auto 1fr;column-gap:10px;text-align:right;align-items:center;border:1px solid #d3e2df;background:#fff;color:var(--nw-ink);border-radius:13px;padding:12px 14px;font-family:Cairo,sans-serif;cursor:pointer;transition:.2s}.can-mode>span{grid-row:1/3;font-size:1.5rem}.can-mode strong{font-size:.92rem}.can-mode small{font-size:.72rem;color:var(--nw-muted)}.can-mode.active{border-color:var(--nw-primary);background:#e9f8f5;box-shadow:0 0 0 2px rgba(8,127,118,.1)}
      .can-import{display:none;margin-top:12px}.can-import.active{display:block}.can-file-label{display:flex;align-items:center;gap:10px;padding:13px;border:1px dashed #80bdb7;background:#fff;border-radius:12px;cursor:pointer}.can-file-label>span{font-size:1.4rem}.can-file-label strong,.can-file-label small{display:block}.can-file-label small{color:var(--nw-muted);font-size:.7rem}.can-file{display:none}.can-status{min-height:20px;margin-top:8px;font-weight:800;font-size:.82rem}.can-status.success{color:#087443}.can-status.error{color:#b93838}
      .names-wheel-redesign .result-display{min-height:94px;padding:17px;margin:0 auto 20px;max-width:940px;background:rgba(255,255,255,.85);border:1px solid var(--nw-line);box-shadow:none}.names-wheel-redesign .result-display:before{background:var(--nw-primary);height:3px}.names-wheel-redesign .welcome-message{font-size:1rem}.ready-message{display:flex;flex-direction:column;gap:3px;color:var(--nw-primary)!important}.ready-message strong{font-size:1.05rem}.ready-message small{font-size:.8rem;color:var(--nw-muted)}
      .names-wheel-redesign .cards-container{background:rgba(255,255,255,.9);border:1px solid var(--nw-line);border-radius:22px;padding:clamp(14px,2vw,24px);box-shadow:0 15px 42px rgba(5,67,63,.1)}
      .names-wheel-redesign .cards-header h3{color:var(--nw-ink);font-size:1.35rem}.names-wheel-redesign .cards-header p{color:var(--nw-muted)}
      .names-wheel-redesign .cards-grid{gap:12px}.names-wheel-redesign .name-card,.names-wheel-redesign .task-card{border-radius:14px;box-shadow:0 6px 16px rgba(5,67,63,.1);border:1px solid rgba(8,127,118,.16);transition:transform .2s,box-shadow .2s}.names-wheel-redesign .name-card:hover,.names-wheel-redesign .task-card:hover{transform:translateY(-4px);box-shadow:0 12px 26px rgba(5,67,63,.18)}
      .names-wheel-redesign .control-panel{padding:20px;gap:14px;background:rgba(255,255,255,.32);border:1px solid rgba(255,255,255,.65);box-shadow:none}.names-wheel-redesign .spin-button{min-width:min(330px,100%);padding:17px 30px;border-radius:15px;background:linear-gradient(135deg,var(--nw-primary),var(--nw-primary-2));animation:none;font-size:1.08rem;box-shadow:0 10px 24px rgba(8,127,118,.25)}.names-wheel-redesign .action-buttons{background:transparent;border:0;padding:0}.names-wheel-redesign .action-btn{min-width:130px;padding:11px 16px;border-radius:11px;box-shadow:none;font-size:.82rem}
      .names-wheel-redesign .stats-panel{background:rgba(255,255,255,.72);border:1px solid var(--nw-line);box-shadow:none}.names-wheel-redesign .stats-grid{grid-template-columns:repeat(5,1fr);gap:8px}.names-wheel-redesign .stat-item{background:#fff;border:1px solid #e1ecea;padding:11px 8px}.names-wheel-redesign .stat-value{font-size:1.45rem}.names-wheel-redesign .stat-label{font-size:.72rem}
      .names-wheel-redesign .final-result{position:fixed!important;inset:0!important;width:100%!important;height:100%!important;z-index:10050!important;background:rgba(3,31,30,.78)!important;backdrop-filter:blur(8px);display:none;overflow-y:auto!important;padding:clamp(12px,3vw,34px)!important;align-items:center!important;justify-content:center!important}.names-wheel-redesign .final-result[style*="block"],.names-wheel-redesign .final-result[style*="flex"]{display:flex!important}
      .names-wheel-redesign .result-container{width:min(760px,100%);max-height:calc(100vh - 28px);overflow-y:auto;background:#fffdf8;border-radius:24px;padding:clamp(18px,4vw,34px);border:0;box-shadow:0 28px 90px rgba(0,0,0,.3);position:relative}.names-wheel-redesign .close-result-btn{position:sticky;top:0;float:left;z-index:4;background:#edf4f2;color:var(--nw-ink)}
      .names-wheel-redesign .selected-pair{gap:15px}.names-wheel-redesign .selected-student,.names-wheel-redesign .selected-task{border:1px solid #e0ebe8;border-radius:17px;background:#fff;padding:18px;box-shadow:none}.names-wheel-redesign .student-name-large{font-size:clamp(1.35rem,4vw,2.4rem);line-height:1.55;color:var(--nw-primary)}
      .names-wheel-redesign .result-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.names-wheel-redesign .result-actions button{min-width:0!important;padding:12px 10px!important;border-radius:11px!important;font-family:Cairo,sans-serif!important;font-size:.8rem!important}.names-wheel-redesign .remove-btn{background:#fff0f0!important;color:#a53232!important;border:1px solid #f0c7c7!important}.names-wheel-redesign .continue-btn{background:#eaf7f4!important;color:#066b63!important;border:1px solid #b9ddd8!important}.names-wheel-redesign .next-round-btn{background:var(--nw-primary)!important;color:#fff!important}
      .can-native-task{display:none!important}.can-question-box{margin-top:10px}.can-progress{display:inline-block;padding:5px 10px;border-radius:999px;background:#e8f5f2;color:var(--nw-primary);font-size:.72rem;font-weight:800}.can-question{font-size:clamp(1.1rem,3vw,1.55rem);font-weight:900;line-height:1.8;margin:13px 0;color:var(--nw-ink)}.can-hint,.can-answer{display:none;padding:12px;border-radius:10px;margin:9px auto;font-size:.92rem}.can-hint.show{display:block;background:#fff6d8;color:#76550b}.can-answer.show{display:block;background:#dcf7e8;color:#14613a;font-weight:800}.can-actions{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}.can-actions button{border:0;border-radius:9px;padding:9px 12px;color:#fff;font-family:Cairo,sans-serif;font-weight:800;font-size:.78rem;cursor:pointer}.can-hint-btn{background:#b97a12}.can-answer-btn{background:#5260bb}.can-correct{background:#16834b}.can-wrong{background:#b64a4a}
      .names-wheel-redesign .settings-overlay{z-index:11000}.names-wheel-redesign .settings-modal{max-height:90vh;border:1px solid var(--nw-line);box-shadow:0 25px 80px rgba(0,0,0,.28)}.names-wheel-redesign .mode-title{color:var(--nw-ink)}.names-wheel-redesign .mode-desc,.names-wheel-redesign .speed-labels{color:var(--nw-muted)}
      @media(max-width:700px){.names-wheel-redesign .cosmic-container{padding:10px;border-radius:0}.names-wheel-redesign .header{padding-top:70px}.names-wheel-redesign .control-buttons{top:10px}.names-wheel-redesign .control-buttons.left{left:10px}.names-wheel-redesign .control-buttons.right{right:10px}.names-wheel-redesign .control-btn{width:42px;height:42px}.can-modes{grid-template-columns:1fr}.names-wheel-redesign .class-selector{padding:14px}.names-wheel-redesign .cards-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.names-wheel-redesign .stats-grid{grid-template-columns:repeat(2,1fr)}.names-wheel-redesign .stat-item:last-child{grid-column:1/-1}.names-wheel-redesign .result-actions{grid-template-columns:1fr}.names-wheel-redesign .result-container{max-height:calc(100dvh - 18px);padding:15px}.names-wheel-redesign .action-buttons{display:grid;grid-template-columns:1fr 1fr}.names-wheel-redesign .action-btn{min-width:0}.journey-steps span{font-size:.68rem;padding:6px 9px}}
      @media(prefers-reduced-motion:reduce){.names-wheel-redesign *{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important}}
    `;
    document.head.appendChild(style);
  }
})();
