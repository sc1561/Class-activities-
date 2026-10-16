(function () {
  "use strict";
  const TYPE = "names-wheel";
  let pack = null, questions = [], retry = [], index = 0, importedMode = false, waiting = false;
  let score = 0, streak = 0, answered = 0;
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
    if (result.parentElement !== document.body) document.body.appendChild(result);
    enhanceHeader();
    enhanceSetup(classSelect);
    enhanceResultActions();
    const jokerStage = createJokerStage(spin, result, selectedPair, nextRound);

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
        pack = data; questions = order(valid, data.settings?.questionOrder); retry = []; index = 0; score = 0; streak = 0; answered = 0;
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
    spin.addEventListener("click", () => {
      if (!spin.disabled) jokerStage.start();
    });

    const observer = new MutationObserver(() => {
      if (importedMode && pack && waiting && isResultVisible()) window.setTimeout(renderQuestion, 80);
      if (isResultVisible()) window.setTimeout(() => jokerStage.reveal(importedMode), 220);
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
        box.innerHTML = `<div class="can-scorebar"><span>⭐ النقاط <b class="can-score">0</b></span><span>🔥 المتتالية <b class="can-streak">0</b></span><span>✅ المجاب <b class="can-answered">0</b></span></div><div class="can-progress"></div><div class="can-question"></div><div class="can-options"></div><div class="can-feedback" role="status" aria-live="polite"></div><div class="can-hint"></div><div class="can-answer"></div><div class="can-actions"><button type="button" class="can-hint-btn">💡 تلميح</button><button type="button" class="can-answer-btn">👁 كشف الإجابة</button><button type="button" class="can-correct">✓ إجابة صحيحة</button><button type="button" class="can-wrong">↻ تحتاج مراجعة</button></div>`;
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
      box.querySelector(".can-score").textContent = score;
      box.querySelector(".can-streak").textContent = streak;
      box.querySelector(".can-answered").textContent = answered;
      const feedback = box.querySelector(".can-feedback"); feedback.textContent = ""; feedback.className = "can-feedback";
      const options = box.querySelector(".can-options");
      const rawAlternatives = Array.isArray(q.alternatives) ? q.alternatives : String(q.alternatives || "").split("|");
      const choices = [...new Set([q.answer, ...rawAlternatives].map((item) => String(item || "").trim()).filter(Boolean))];
      options.innerHTML = "";
      const hasChoices = choices.length >= 2;
      box.classList.toggle("has-options", hasChoices);
      box.querySelector(".can-correct").style.display = hasChoices ? "none" : "";
      box.querySelector(".can-wrong").style.display = hasChoices ? "none" : "";
      if (hasChoices) {
        order(choices, "random").forEach((choice, choiceIndex) => {
          const button = document.createElement("button");
          button.type = "button"; button.className = `can-option option-${choiceIndex % 4}`; button.textContent = choice;
          button.onclick = () => gradeChoice(button, choice, q, box);
          options.appendChild(button);
        });
      }
      box.style.display = "block"; waiting = false;
    }

    function gradeChoice(button, choice, q, box) {
      if (box.classList.contains("answered")) return;
      box.classList.add("answered");
      const correct = normalize(choice) === normalize(q.answer);
      box.querySelectorAll(".can-option").forEach((item) => {
        item.disabled = true;
        if (normalize(item.textContent) === normalize(q.answer)) item.classList.add("correct");
      });
      const feedback = box.querySelector(".can-feedback");
      if (correct) {
        const earned = Number(q.points) || 10;
        streak += 1; score += earned + Math.max(0, streak - 1) * 2;
        button.classList.add("correct"); feedback.className = "can-feedback correct";
        feedback.textContent = streak > 1 ? `إجابة صحيحة! +${earned} ونقطتا تتابع لكل سلسلة 🔥` : `إجابة صحيحة! +${earned} نقطة 🎉`;
        celebrate(box);
      } else {
        streak = 0; button.classList.add("wrong"); feedback.className = "can-feedback wrong";
        feedback.textContent = `الإجابة الصحيحة: ${q.answer}`;
      }
      answered += 1;
      box.querySelector(".can-score").textContent = score;
      box.querySelector(".can-streak").textContent = streak;
      box.querySelector(".can-answered").textContent = answered;
      window.setTimeout(() => finish(!correct), correct ? 1150 : 1900);
    }

    function finish(isWrong) {
      const q=questions[index]; if(!q)return;
      if(isWrong)retry.push(q); index+=1;
      const box=selectedPair.querySelector(".can-question-box");
      if(box){box.style.display="none";box.classList.remove("answered");}
      window.setTimeout(()=>nextRound.click(),220);
    }

    function normalize(value){return String(value||"").trim().replace(/[إأآ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").replace(/[ًٌٍَُِّْـ\s.,،؛;:!?؟'"()\[\]-]/g,"").toLowerCase();}
    function celebrate(host){
      for(let i=0;i<18;i++){const bit=document.createElement("i");bit.className="can-confetti";bit.style.setProperty("--x",`${Math.random()*220-110}px`);bit.style.setProperty("--r",`${Math.random()*720-360}deg`);bit.style.background=["#f4b942","#13a89e","#ef5b5b","#5d78e8"][i%4];host.appendChild(bit);setTimeout(()=>bit.remove(),1100);}
    }
    function isResultVisible(){return getComputedStyle(result).display!=="none" && result.getClientRects().length>0;}
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

  function createJokerStage(spin, result, selectedPair, nextRound){
    document.body.classList.add("joker-mode");
    const host=document.querySelector(".cards-container")||document.getElementById("nameCardsSystem")?.parentElement;
    const stage=document.createElement("section");
    stage.className="joker-stage";
    stage.innerHTML=`
      <div class="joker-stage-head"><div><span>🃏</span><h3>موزّع البطاقات الذكي</h3></div><p>بطاقة للطالب وبطاقة للتحدي</p></div>
      <div class="joker-table" aria-live="polite">
        <div class="flying-cards" aria-hidden="true"></div>
        <article class="joker-card student-card">
          <div class="joker-card-inner"><div class="joker-back"><span>👤</span><b>بطاقة الطالب</b></div><div class="joker-front"><small>الطالب المختار</small><div class="joker-student-name">—</div></div></div>
        </article>
        <button type="button" class="joker-deck" aria-label="ابدأ توزيع البطاقات"><span>🃏</span><b>ابدأ التوزيع</b><small>اختيار عشوائي عادل</small></button>
        <article class="joker-card challenge-card">
          <div class="joker-card-inner"><div class="joker-back"><span>🎯</span><b>بطاقة التحدي</b></div><div class="joker-front"><small>المهمة أو السؤال</small><div class="joker-challenge-text">—</div></div></div>
        </article>
      </div>
      <div class="joker-status">اختر الصف ثم اضغط «ابدأ التوزيع»</div>
      <div class="joker-actions">
        <button type="button" data-action="keep">إبقاء الطالب واختيار آخر</button>
        <button type="button" data-action="remove">استبعاد من هذه الجولة</button>
        <button type="button" data-action="new">🔄 اختيار جديد</button>
      </div>`;
    if(host)host.insertAdjacentElement("beforebegin",stage);
    const deck=stage.querySelector(".joker-deck"), status=stage.querySelector(".joker-status");
    const studentCard=stage.querySelector(".student-card"), challengeCard=stage.querySelector(".challenge-card");
    let running=false, revealed=false;
    deck.addEventListener("click",()=>{if(!spin.disabled)spin.click();else status.textContent="اختر الصف الدراسي أولًا";});
    stage.querySelector('[data-action="new"]').onclick=()=>{nextRound.click();reset();window.setTimeout(()=>spin.click(),260);};
    stage.querySelector('[data-action="keep"]').onclick=()=>{document.getElementById("continueSelectionBtn")?.click();reset();};
    stage.querySelector('[data-action="remove"]').onclick=()=>{document.getElementById("removeStudentBtn")?.click();reset();};
    function start(){
      if(running)return; running=true;revealed=false;
      stage.classList.remove("revealed");stage.classList.add("dealing");
      studentCard.classList.remove("flipped");challengeCard.classList.remove("flipped");
      stage.querySelector(".joker-student-name").textContent="—";stage.querySelector(".joker-challenge-text").textContent="—";
      status.textContent="توزيع سريع… البطاقات تختار الآن";
      stage.scrollIntoView({behavior:"smooth",block:"center"});
    }
    function reveal(isImported){
      if(revealed)return; revealed=true; running=false; stage.classList.remove("dealing");
      const student=selectedPair.querySelector(".student-name-large")?.textContent?.trim()||selectedPair.querySelector(".selected-student")?.innerText?.replace(/الطالب المختار|🎉/g,"").trim()||"الطالب المختار";
      let challenge="";
      const question=selectedPair.querySelector(".can-question")?.textContent?.trim();
      if(isImported&&question)challenge=question;
      if(!challenge)challenge=selectedPair.querySelector(".task-title-large")?.textContent?.trim()||selectedPair.querySelector(".task-desc-large")?.textContent?.trim()||"سؤال شفهي من المعلم";
      stage.querySelector(".joker-student-name").textContent=student;
      stage.querySelector(".joker-challenge-text").textContent=challenge;
      window.setTimeout(()=>studentCard.classList.add("flipped"),120);
      window.setTimeout(()=>{challengeCard.classList.add("flipped");stage.classList.add("revealed");status.textContent="تم اختيار الطالب والتحدي بنجاح";},850);
    }
    function reset(){revealed=false;running=false;stage.classList.remove("dealing","revealed");studentCard.classList.remove("flipped");challengeCard.classList.remove("flipped");status.textContent="اضغط «ابدأ التوزيع» لجولة جديدة";}
    return{start,reveal,reset};
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
      } else if(!hasClass&&!welcome.dataset.cleaned){
        welcome.dataset.cleaned="1";
        welcome.innerHTML='<strong>اختر الصف الدراسي</strong><small>ستظهر بطاقات الطلاب هنا بعد تحميل القائمة</small>';
      }
    }
    const spin=document.getElementById("spinButton");
    if(spin&&!spin.disabled&&!spin.dataset.cleanLabel){spin.innerHTML='<span aria-hidden="true">🎴</span> اختيار بطاقة عشوائيًا';spin.dataset.cleanLabel="1";}
    const total=document.querySelector('[data-stat="total"] .stat-value')?.textContent?.trim();
    document.querySelectorAll(".name-cards-system .welcome-message, #nameSelectionAnimation .welcome-message").forEach((el)=>{
      if(/بطاقة متاحة|بطاقات الطلاب جاهزة/.test(el.textContent||"")){
        const cardCount=document.querySelectorAll("#nameCardsGrid .name-card").length;
        const available=cardCount||document.querySelector('[data-stat="available"] .stat-value')?.textContent?.trim()||total||"";
        el.innerHTML=`<strong>🎴 بطاقات الطلاب جاهزة</strong><br>${available} طالبًا متاحًا<br><small>اضغط «اختيار بطاقة عشوائيًا» لبدء الجولة</small>`;
      }
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
      .joker-mode .cards-container{display:none!important}.joker-stage{max-width:940px;margin:0 auto 22px;background:linear-gradient(145deg,#073f3b,#062f2c);border:1px solid rgba(255,255,255,.24);border-radius:26px;padding:clamp(18px,3vw,30px);box-shadow:0 20px 50px rgba(3,45,42,.26);color:#fff;overflow:hidden}.joker-stage-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px}.joker-stage-head>div{display:flex;align-items:center;gap:9px}.joker-stage-head span{font-size:1.7rem}.joker-stage-head h3{font-size:1.25rem;margin:0}.joker-stage-head p{font-size:.78rem;color:#b9d8d3}.joker-table{min-height:320px;display:grid;grid-template-columns:minmax(190px,1fr) 150px minmax(190px,1fr);align-items:center;justify-items:center;gap:clamp(12px,3vw,30px);position:relative;perspective:1300px;padding:14px}.joker-card{width:min(240px,100%);height:290px;perspective:1100px;z-index:3}.joker-card-inner{width:100%;height:100%;position:relative;transform-style:preserve-3d;transition:transform .72s cubic-bezier(.2,.8,.2,1)}.joker-card.flipped .joker-card-inner{transform:rotateY(180deg)}.joker-back,.joker-front{position:absolute;inset:0;backface-visibility:hidden;border-radius:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:20px;border:2px solid rgba(255,255,255,.62);box-shadow:0 17px 38px rgba(0,0,0,.28)}.student-card .joker-back{background:linear-gradient(145deg,#0ea69a,#08736c)}.challenge-card .joker-back{background:linear-gradient(145deg,#efb329,#c97b12)}.joker-back:after{content:"";position:absolute;inset:10px;border:1px dashed rgba(255,255,255,.5);border-radius:14px}.joker-back span{font-size:4rem;filter:drop-shadow(0 6px 8px rgba(0,0,0,.2))}.joker-back b{margin-top:18px;font-size:1.05rem}.joker-front{transform:rotateY(180deg);background:#fffdf5;color:var(--nw-ink);border-color:#f3d88a}.joker-front small{color:var(--nw-primary);font-weight:800;margin-bottom:13px}.joker-student-name{font-size:clamp(1.05rem,2.4vw,1.45rem);font-weight:900;line-height:1.65}.joker-challenge-text{font-size:clamp(.95rem,2vw,1.22rem);font-weight:800;line-height:1.75}.joker-deck{width:130px;height:180px;border:0;border-radius:17px;background:repeating-linear-gradient(45deg,#181b23 0 8px,#2a2e39 8px 16px);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;box-shadow:-7px 7px 0 #f5c84b,-13px 13px 0 #fff,0 18px 32px rgba(0,0,0,.36);z-index:4;font-family:Cairo,sans-serif}.joker-deck span{font-size:3.2rem}.joker-deck b{font-size:.88rem}.joker-deck small{font-size:.62rem;color:#cad3d1;margin-top:4px}.flying-cards{position:absolute;inset:0;pointer-events:none}.joker-stage.dealing .joker-deck{animation:deckPulse .24s infinite alternate}.joker-stage.dealing .flying-cards:before,.joker-stage.dealing .flying-cards:after{content:"🃏";position:absolute;left:50%;top:48%;width:74px;height:104px;border-radius:10px;background:#fff;color:#151923;display:grid;place-items:center;font-size:2.2rem;box-shadow:0 10px 25px rgba(0,0,0,.28);z-index:6}.joker-stage.dealing .flying-cards:before{animation:dealLeft .34s linear infinite}.joker-stage.dealing .flying-cards:after{animation:dealRight .34s linear .17s infinite}.joker-stage.dealing .joker-card{filter:brightness(.72)}.joker-actions{display:none;gap:9px;justify-content:center;flex-wrap:wrap;margin-top:14px}.joker-stage.revealed .joker-actions{display:flex}.joker-actions button{border:1px solid rgba(255,255,255,.25);border-radius:10px;padding:10px 14px;background:rgba(255,255,255,.12);color:#fff;font-family:Cairo,sans-serif;font-weight:700;cursor:pointer}.joker-actions button[data-action="new"]{background:#0d988e}.joker-actions button[data-action="remove"]{background:#a33b3b}.joker-status{text-align:center;color:#cae2de;font-size:.83rem;font-weight:700;margin-top:10px;min-height:24px}.joker-mode .final-result{opacity:0!important;pointer-events:none!important;transform:scale(.95)!important}.joker-mode .final-result .can-question-box{display:block}
      @keyframes dealLeft{0%{transform:translate(-50%,-50%) rotate(0) scale(.8);opacity:.2}45%{opacity:1}100%{transform:translate(-330%,-65%) rotate(-28deg) scale(1);opacity:0}}@keyframes dealRight{0%{transform:translate(-50%,-50%) rotate(0) scale(.8);opacity:.2}45%{opacity:1}100%{transform:translate(230%,-65%) rotate(28deg) scale(1);opacity:0}}@keyframes deckPulse{to{transform:translateY(-6px) rotate(1deg);filter:brightness(1.22)}}
      .names-wheel-redesign .cards-header h3{color:var(--nw-ink);font-size:1.35rem}.names-wheel-redesign .cards-header p{color:var(--nw-muted)}
      .names-wheel-redesign .cards-grid{gap:12px}.names-wheel-redesign .name-card,.names-wheel-redesign .task-card{border-radius:14px;box-shadow:0 6px 16px rgba(5,67,63,.1);border:1px solid rgba(8,127,118,.16);transition:transform .2s,box-shadow .2s}.names-wheel-redesign .name-card:hover,.names-wheel-redesign .task-card:hover{transform:translateY(-4px);box-shadow:0 12px 26px rgba(5,67,63,.18)}
      .names-wheel-redesign .control-panel{padding:20px;gap:14px;background:rgba(255,255,255,.32);border:1px solid rgba(255,255,255,.65);box-shadow:none}.names-wheel-redesign .spin-button{min-width:min(330px,100%);padding:17px 30px;border-radius:15px;background:linear-gradient(135deg,var(--nw-primary),var(--nw-primary-2));animation:none;font-size:1.08rem;box-shadow:0 10px 24px rgba(8,127,118,.25)}.names-wheel-redesign .action-buttons{background:transparent;border:0;padding:0}.names-wheel-redesign .action-btn{min-width:130px;padding:11px 16px;border-radius:11px;box-shadow:none;font-size:.82rem}
      .names-wheel-redesign .stats-panel{background:rgba(255,255,255,.72);border:1px solid var(--nw-line);box-shadow:none}.names-wheel-redesign .stats-grid{grid-template-columns:repeat(5,1fr);gap:8px}.names-wheel-redesign .stat-item{background:#fff;border:1px solid #e1ecea;padding:11px 8px}.names-wheel-redesign .stat-value{font-size:1.45rem}.names-wheel-redesign .stat-label{font-size:.72rem}
      .names-wheel-redesign .final-result{position:fixed!important;inset:0!important;width:100%!important;height:100%!important;z-index:10050!important;background:rgba(3,31,30,.78)!important;backdrop-filter:blur(8px);display:none;overflow-y:auto!important;padding:clamp(12px,3vw,34px)!important;align-items:center!important;justify-content:center!important}.names-wheel-redesign .final-result[style*="block"],.names-wheel-redesign .final-result[style*="flex"]{display:flex!important}
      .names-wheel-redesign .result-container{width:min(760px,100%);max-height:calc(100vh - 28px);overflow-y:auto;background:#fffdf8;border-radius:24px;padding:clamp(18px,4vw,34px);border:0;box-shadow:0 28px 90px rgba(0,0,0,.3);position:relative}.names-wheel-redesign .close-result-btn{position:sticky;top:0;float:left;z-index:4;background:#edf4f2;color:var(--nw-ink)}
      .names-wheel-redesign .selected-pair{gap:15px}.names-wheel-redesign .selected-student,.names-wheel-redesign .selected-task{border:1px solid #e0ebe8;border-radius:17px;background:#fff;padding:18px;box-shadow:none}.names-wheel-redesign .student-name-large{font-size:clamp(1.35rem,4vw,2.4rem);line-height:1.55;color:var(--nw-primary)}
      .names-wheel-redesign .result-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.names-wheel-redesign .result-actions button{min-width:0!important;padding:12px 10px!important;border-radius:11px!important;font-family:Cairo,sans-serif!important;font-size:.8rem!important}.names-wheel-redesign .remove-btn{background:#fff0f0!important;color:#a53232!important;border:1px solid #f0c7c7!important}.names-wheel-redesign .continue-btn{background:#eaf7f4!important;color:#066b63!important;border:1px solid #b9ddd8!important}.names-wheel-redesign .next-round-btn{background:var(--nw-primary)!important;color:#fff!important}
      .can-native-task{display:none!important}.can-question-box{margin-top:10px;position:relative}.can-scorebar{display:flex;gap:7px;justify-content:center;flex-wrap:wrap;margin-bottom:9px}.can-scorebar span{background:#f2f7f6;border:1px solid #dbe8e6;border-radius:999px;padding:5px 9px;font-size:.7rem;font-weight:800}.can-scorebar b{color:var(--nw-primary)}.can-progress{display:inline-block;padding:5px 10px;border-radius:999px;background:#e8f5f2;color:var(--nw-primary);font-size:.72rem;font-weight:800}.can-question{font-size:clamp(1.1rem,3vw,1.55rem);font-weight:900;line-height:1.8;margin:13px 0;color:var(--nw-ink)}.can-hint,.can-answer{display:none;padding:12px;border-radius:10px;margin:9px auto;font-size:.92rem}.can-hint.show{display:block;background:#fff6d8;color:#76550b}.can-answer.show{display:block;background:#dcf7e8;color:#14613a;font-weight:800}.can-actions{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}.can-actions button{border:0;border-radius:9px;padding:9px 12px;color:#fff;font-family:Cairo,sans-serif;font-weight:800;font-size:.78rem;cursor:pointer}.can-hint-btn{background:#b97a12}.can-answer-btn{background:#5260bb}.can-correct{background:#16834b}.can-wrong{background:#b64a4a}
      .names-wheel-redesign .settings-overlay{z-index:11000}.names-wheel-redesign .settings-modal{max-height:90vh;border:1px solid var(--nw-line);box-shadow:0 25px 80px rgba(0,0,0,.28)}.names-wheel-redesign .mode-title{color:var(--nw-ink)}.names-wheel-redesign .mode-desc,.names-wheel-redesign .speed-labels{color:var(--nw-muted)}
      @media(max-width:700px){.names-wheel-redesign .cosmic-container{padding:10px;border-radius:0}.names-wheel-redesign .header{padding-top:70px}.names-wheel-redesign .control-buttons{top:10px}.names-wheel-redesign .control-buttons.left{left:10px}.names-wheel-redesign .control-buttons.right{right:10px}.names-wheel-redesign .control-btn{width:42px;height:42px}.can-modes{grid-template-columns:1fr}.names-wheel-redesign .class-selector{padding:14px}.names-wheel-redesign .cards-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.names-wheel-redesign .stats-grid{grid-template-columns:repeat(2,1fr)}.names-wheel-redesign .stat-item:last-child{grid-column:1/-1}.names-wheel-redesign .result-actions{grid-template-columns:1fr}.names-wheel-redesign .result-container{max-height:calc(100dvh - 18px);padding:15px}.names-wheel-redesign .action-buttons{display:grid;grid-template-columns:1fr 1fr}.names-wheel-redesign .action-btn{min-width:0}.journey-steps span{font-size:.68rem;padding:6px 9px}.joker-stage{padding:14px;border-radius:19px}.joker-stage-head{display:block;text-align:center}.joker-stage-head>div{justify-content:center}.joker-stage-head p{margin-top:5px}.joker-table{grid-template-columns:1fr 1fr;min-height:270px;gap:9px;padding:6px}.joker-deck{position:absolute;width:86px;height:116px;z-index:7}.joker-deck span{font-size:2.1rem}.joker-deck b{font-size:.68rem}.joker-deck small{display:none}.joker-card{height:245px;width:100%}.joker-back,.joker-front{padding:11px}.joker-back span{font-size:2.8rem}.joker-back b{font-size:.8rem}.joker-student-name,.joker-challenge-text{font-size:.83rem}.joker-stage:not(.dealing):not(.revealed) .joker-card{opacity:.34}.joker-stage.revealed .joker-deck{opacity:0;pointer-events:none}.joker-actions{display:none;grid-template-columns:1fr}.can-options{grid-template-columns:1fr}.joker-stage.revealed .joker-actions{display:grid}}
      @media(prefers-reduced-motion:reduce){.names-wheel-redesign *{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important}}
    `;
    document.head.appendChild(style);
  }
})();
