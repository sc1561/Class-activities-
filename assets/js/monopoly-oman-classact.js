(function () {
  "use strict";

  const TYPE = "monopoly-oman";
  const BUILTIN_QUESTIONS = [
    {question:"ما عاصمة سلطنة عُمان؟",answer:"مسقط",hint:"تقع على ساحل بحر عُمان",difficulty:"easy",points:10},
    {question:"ما العملة الرسمية في سلطنة عُمان؟",answer:"الريال العُماني",hint:"تنقسم إلى 1000 بيسة",difficulty:"easy",points:10},
    {question:"إلى كم بيسة ينقسم الريال العُماني الواحد؟",answer:"1000 بيسة",hint:"ألف جزء",difficulty:"easy",points:10},
    {question:"ما اسم المحافظة التي تشتهر بموسم الخريف؟",answer:"ظفار",hint:"تقع في جنوب السلطنة",difficulty:"easy",points:10},
    {question:"ما المدينة العُمانية المشهورة بسوقها وقلعتها التاريخية؟",answer:"نزوى",hint:"كانت عاصمة لعُمان في فترات تاريخية",difficulty:"easy",points:10},
    {question:"ما اسم المضيق الذي تطل عليه محافظة مسندم؟",answer:"مضيق هرمز",hint:"ممر مائي عالمي مهم",difficulty:"medium",points:20},
    {question:"ما البحر الذي يحد سلطنة عُمان من الجنوب والشرق؟",answer:"بحر العرب",hint:"جزء من المحيط الهندي",difficulty:"easy",points:10},
    {question:"ما اسم أعلى جبل في سلطنة عُمان؟",answer:"جبل شمس",hint:"يقع في محافظة الداخلية",difficulty:"easy",points:10},
    {question:"في أي محافظة تقع مدينة صلالة؟",answer:"محافظة ظفار",hint:"جنوب السلطنة",difficulty:"easy",points:10},
    {question:"ما الولاية المشهورة بصناعة السفن التقليدية؟",answer:"صور",hint:"تقع في محافظة جنوب الشرقية",difficulty:"medium",points:20},
    {question:"ما اسم القلعة الشهيرة المدرجة ضمن قائمة التراث العالمي في ولاية بهلاء؟",answer:"قلعة بهلاء",hint:"تحمل اسم الولاية",difficulty:"easy",points:10},
    {question:"ما اسم اللباس الرجالي التقليدي الشائع في عُمان؟",answer:"الدشداشة العُمانية",hint:"لباس أبيض غالبًا",difficulty:"easy",points:10},
    {question:"ما اسم الخنجر التقليدي الذي يظهر في الشعار الوطني العُماني؟",answer:"الخنجر العُماني",hint:"يرتدى في المناسبات الرسمية",difficulty:"easy",points:10},
    {question:"ما المحافظة التي تقع فيها ولاية خصب؟",answer:"مسندم",hint:"في أقصى شمال السلطنة",difficulty:"medium",points:20},
    {question:"ما اسم الصحراء المشهورة بالكثبان الرملية في شمال الشرقية؟",answer:"رمال الشرقية",hint:"تعرف أيضًا برمال وهيبة",difficulty:"medium",points:20},
    {question:"إذا كان معك 500 بيسة وأضفت 250 بيسة، فكم يصبح المجموع؟",answer:"750 بيسة",hint:"اجمع 500 + 250",difficulty:"easy",points:10},
    {question:"اشترى لاعب عقارًا بـ200 ريال وبقي معه 1300 ريال. كم كان معه قبل الشراء؟",answer:"1500 ريال",hint:"اجمع المتبقي مع ثمن العقار",difficulty:"medium",points:20},
    {question:"دفع لاعب إيجارًا قدره 75 ريالًا من أصل 600 ريال. كم بقي معه؟",answer:"525 ريالًا",hint:"600 - 75",difficulty:"easy",points:10},
    {question:"إذا امتلك فريق 3 عقارات قيمة كل منها 120 ريالًا، فما القيمة الإجمالية؟",answer:"360 ريالًا",hint:"3 × 120",difficulty:"easy",points:10},
    {question:"ارتفع سعر عقار من 200 إلى 250 ريالًا. ما مقدار الزيادة؟",answer:"50 ريالًا",hint:"250 - 200",difficulty:"easy",points:10},
    {question:"ما القرار المالي الأفضل: إنفاق كل المال أم الاحتفاظ بجزء للطوارئ؟",answer:"الاحتفاظ بجزء للطوارئ",hint:"فكر في المصروفات غير المتوقعة",difficulty:"easy",points:10},
    {question:"لماذا نضع ميزانية قبل الشراء؟",answer:"لتنظيم الإنفاق وتجنب نفاد المال",hint:"خطط قبل أن تدفع",difficulty:"medium",points:20},
    {question:"إذا كان دخل الفريق 400 ريال ومصروفه 275 ريالًا، فما صافي المبلغ؟",answer:"125 ريالًا",hint:"الدخل ناقص المصروف",difficulty:"medium",points:20},
    {question:"أيّهما أكبر: 0.750 ريال أم 700 بيسة؟",answer:"0.750 ريال (750 بيسة)",hint:"حوّل الريال إلى بيسة",difficulty:"medium",points:20},
    {question:"قسم 900 ريال بالتساوي على 3 لاعبين. كم نصيب كل لاعب؟",answer:"300 ريال",hint:"900 ÷ 3",difficulty:"easy",points:10},
    {question:"ما فائدة الاستثمار في أصل يحقق دخلًا دوريًا؟",answer:"زيادة الدخل وبناء قيمة مستقبلية",hint:"العقار قد يحقق إيجارًا",difficulty:"medium",points:20},
    {question:"اذكر موردًا طبيعيًا مهمًا للاقتصاد العُماني.",answer:"النفط أو الغاز الطبيعي أو الثروة السمكية",hint:"توجد أكثر من إجابة صحيحة",difficulty:"easy",points:10},
    {question:"لماذا تعد الموانئ مهمة لاقتصاد سلطنة عُمان؟",answer:"للتجارة والنقل والاستيراد والتصدير",hint:"تربط السلطنة بالأسواق العالمية",difficulty:"medium",points:20},
    {question:"ما السلوك الصحيح عند اختلاف أعضاء الفريق على قرار شراء؟",answer:"الاستماع والتشاور ثم اتخاذ قرار مشترك",hint:"التعاون قبل القرار",difficulty:"easy",points:10},
    {question:"إذا كانت فرصة الربح كبيرة لكن احتمال الخسارة مرتفع، فما المفهوم المالي المقصود؟",answer:"المخاطرة",hint:"كل استثمار له احتمال ربح وخسارة",difficulty:"hard",points:30},
    {question:"كيف يمكن للفريق تقليل المخاطر المالية في اللعبة؟",answer:"تنويع الممتلكات والاحتفاظ بسيولة وعدم الإنفاق الكامل",hint:"لا تضع كل المال في خيار واحد",difficulty:"hard",points:30},
    {question:"ما الفرق بين الحاجة والرغبة عند اتخاذ قرار الشراء؟",answer:"الحاجة ضرورية، أما الرغبة فيمكن الاستغناء عنها أو تأجيلها",hint:"اسأل: هل أستطيع الاستمرار بدونها؟",difficulty:"medium",points:20},
    {question:"إذا زادت قيمة عقار بنسبة 10% وكان سعره 300 ريال، فما قيمته الجديدة؟",answer:"330 ريالًا",hint:"10% من 300 تساوي 30",difficulty:"hard",points:30},
    {question:"اشترى فريق عقارين بـ180 ريالًا لكل منهما ودفع 40 ريالًا رسومًا. ما الإجمالي؟",answer:"400 ريال",hint:"180 + 180 + 40",difficulty:"medium",points:20},
    {question:"لماذا يجب قراءة شروط الصفقة قبل الموافقة عليها؟",answer:"لفهم الالتزامات والتكاليف والمخاطر",hint:"القرار الواعي يحتاج معلومات",difficulty:"medium",points:20}
  ].map((q, i) => ({id:`oman-${i+1}`,hint:"",time:q.difficulty==="hard"?45:q.difficulty==="medium"?35:25,...q}));

  let importedPack = null;
  let mode = "builtin";
  let queue = [];
  let retry = [];
  let index = 0;
  let challengeOpen = false;
  let correctCount = 0;
  let wrongCount = 0;

  const ready = (fn) => document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", fn) : fn();
  ready(init);

  function init() {
    const rollButton = document.getElementById("rollDice");
    const endTurnButton = document.getElementById("endTurn");
    const classSelect = document.getElementById("classSelect");
    const startButton = document.getElementById("startGameBtn");
    const setupButton = document.getElementById("setupPlayersBtn");
    const playersCountInput = document.getElementById("playersCount");
    if (!rollButton || !endTurnButton || !classSelect) return;

    queue = orderQuestions(BUILTIN_QUESTIONS, "random");

    const panel = document.createElement("section");
    panel.id = "classactMonopolyLoader";
    panel.dir = "rtl";
    panel.innerHTML = `
      <style>
        #classactMonopolyLoader{background:rgba(255,255,255,.98);color:#172033;border:3px solid #d4af37;border-radius:22px;padding:16px;margin:14px auto;max-width:760px;text-align:center;box-shadow:0 14px 38px rgba(0,0,0,.22);font-family:Cairo,sans-serif}.cam-game-live #classactMonopolyLoader{display:none!important}
        .cam-title{display:flex;align-items:center;justify-content:space-between;gap:10px}.cam-title h3{margin:0;font-size:1.35rem}.cam-guide-btn{border:0;border-radius:12px;padding:9px 13px;background:#475569;color:#fff;font-weight:800;cursor:pointer}.cam-intro{margin:8px 0 12px}.cam-mode-row,.cam-actions{display:flex;justify-content:center;gap:10px;flex-wrap:wrap}.cam-mode{flex:1;min-width:230px;border:3px solid #0f766e;background:#fff;color:#0f766e;border-radius:15px;padding:14px 18px;font-size:1rem;font-weight:900;cursor:pointer}.cam-mode.active{background:#0f766e;color:#fff;box-shadow:0 0 0 4px rgba(15,118,110,.16)}.cam-import{display:none;margin-top:12px}.cam-import.active{display:block}.cam-file{display:block;margin:10px auto;max-width:460px;width:100%}.cam-status{min-height:28px;margin-top:10px;padding:8px;border-radius:10px;background:#f1f5f9;color:#0f766e;font-weight:800}.cam-details{margin-top:10px}.cam-details summary{cursor:pointer;color:#475569;font-weight:800}.cam-count-guide{margin:9px auto 0;max-width:680px;background:#fff7d6;border:1px solid #f2c94c;border-radius:12px;padding:9px;font-weight:700}.cam-progress{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-top:10px}.cam-step{padding:7px 4px;border-radius:10px;background:#e2e8f0;font-size:.8rem;font-weight:800}.cam-step.done{background:#dcfce7;color:#166534}.cam-step.current{outline:3px solid #f59e0b;background:#fff7d6}
        .cam-overlay,.cam-guide-overlay{position:fixed;inset:0;z-index:100000;background:rgba(4,20,26,.86);display:none;align-items:center;justify-content:center;padding:18px}.cam-overlay.active,.cam-guide-overlay.active{display:flex}.cam-card,.cam-guide-card{background:#fff;color:#172033;border:4px solid #d4af37;border-radius:24px;max-width:850px;width:100%;padding:28px;text-align:center;box-shadow:0 22px 70px rgba(0,0,0,.45);font-family:Cairo,sans-serif;max-height:92vh;overflow:auto}.cam-guide-card{text-align:right}.cam-guide-card h2{text-align:center}.cam-guide-list{display:grid;gap:12px}.cam-guide-item{border:2px solid #e2e8f0;border-radius:15px;padding:14px}.cam-guide-item strong{color:#0f766e;font-size:1.08rem}.cam-guide-footer{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:18px}.cam-guide-footer button{border:0;border-radius:12px;padding:12px 20px;font-weight:800;cursor:pointer;color:#fff;background:#0f766e}.cam-guide-footer .secondary{background:#475569}
        .cam-counter{color:#0f766e;font-weight:800}.cam-player{color:#7c3aed;font-weight:900;margin-top:6px}.cam-question{font-size:clamp(1.35rem,3vw,2.15rem);line-height:1.7;font-weight:800;margin:20px 0}.cam-meta{display:flex;justify-content:center;gap:10px;flex-wrap:wrap}.cam-badge{background:#eef2ff;border-radius:999px;padding:6px 12px;font-weight:800}.cam-hint,.cam-answer{display:none;padding:14px;border-radius:12px;margin:12px auto}.cam-hint.show{display:block;background:#fff7d6}.cam-answer.show{display:block;background:#dcfce7;font-size:1.35rem;font-weight:800}.cam-actions button{border:0;border-radius:12px;padding:11px 17px;color:#fff;font-family:Cairo,sans-serif;font-weight:800;cursor:pointer}.cam-hint-btn{background:#d97706}.cam-answer-btn{background:#4f46e5}.cam-correct{background:#15803d}.cam-wrong{background:#b91c1c}.cam-score{margin-top:12px;font-weight:800;color:#334155}
        .cam-turn-hud{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:99990;width:min(94vw,760px);display:none;grid-template-columns:minmax(180px,1fr) auto;align-items:center;gap:12px;background:rgba(15,23,42,.97);color:#fff;border:3px solid #d4af37;border-radius:22px;padding:12px 16px;box-shadow:0 16px 45px rgba(0,0,0,.42);font-family:Cairo,sans-serif}.cam-game-live .cam-turn-hud{display:grid}.cam-turn-info{text-align:right}.cam-turn-label{font-size:.82rem;color:#fde68a;font-weight:800}.cam-turn-player{font-size:clamp(1.15rem,2.8vw,1.65rem);font-weight:900;line-height:1.35}.cam-turn-instruction{font-size:.87rem;color:#cbd5e1;font-weight:700}.cam-turn-actions{display:flex;gap:9px;align-items:center}.cam-turn-actions #rollDice{min-width:170px!important;min-height:60px!important;font-size:1.2rem!important;font-weight:900!important;background:#f59e0b!important;color:#172033!important;border:0!important;border-radius:16px!important;box-shadow:0 6px 0 #b45309!important}.cam-turn-actions #rollDice:not(:disabled){animation:camPulse 1.6s infinite}.cam-turn-actions #rollDice:disabled{opacity:.48!important;box-shadow:none!important}.cam-turn-actions #endTurn{min-height:52px!important;border-radius:14px!important;font-weight:800!important}.cam-mini-settings{width:44px;height:44px;border:0;border-radius:50%;background:#334155;color:#fff;font-size:1.15rem;cursor:pointer}.cam-dice-help{display:none!important}@keyframes camPulse{50%{transform:scale(1.045);box-shadow:0 8px 0 #b45309,0 0 0 9px rgba(245,158,11,.18)}}
        body.cam-game-live{padding-bottom:108px}.cam-game-live #startGameBtn,.cam-game-live #setupPlayersBtn,.cam-game-live #classSelect,.cam-game-live #playersCount,.cam-game-live label[for="classSelect"],.cam-game-live label[for="playersCount"]{display:none!important}.cam-original-placeholder{display:none}
        @media(max-width:650px){.cam-title{align-items:flex-start}.cam-progress{grid-template-columns:1fr 1fr}.cam-card,.cam-guide-card{padding:18px}.cam-actions button{width:100%}.cam-turn-hud{bottom:7px;padding:9px;grid-template-columns:1fr}.cam-turn-info{text-align:center}.cam-turn-actions{justify-content:center}.cam-turn-actions #rollDice{min-width:155px!important;min-height:54px!important}.cam-turn-actions #endTurn{min-height:48px!important}body.cam-game-live{padding-bottom:165px}}
      </style>
      <div class="cam-title"><h3>🎓 تجهيز مونوبولي التعليمي</h3><button type="button" class="cam-guide-btn">❔ طريقة اللعب</button></div>
      <p class="cam-intro">اختر نوع اللعبة فقط، ثم استخدم إعدادات الصف واللاعبين الموجودة أسفل هذه البطاقة.</p>
      <div class="cam-mode-row"><button type="button" class="cam-mode active" data-mode="builtin">مونوبولي الأصلي — أسئلة جاهزة</button><button type="button" class="cam-mode" data-mode="imported">مونوبولي بالأسئلة — قالب المعلم</button></div>
      <div class="cam-import"><p>أنشئ قالب مونوبولي في مركز إعداد الأنشطة، املأه بالأسئلة، ثم استورده هنا.</p><input class="cam-file" type="file" accept=".classact,application/json"></div>
      <div class="cam-status" role="status"></div>
      <details class="cam-details"><summary>عرض تقدّم الإعداد وعدد الأسئلة المقترح</summary><div class="cam-count-guide"></div><div class="cam-progress"><div class="cam-step" data-step="1">1. الأسئلة</div><div class="cam-step" data-step="2">2. الصف</div><div class="cam-step" data-step="3">3. اللاعبون</div><div class="cam-step" data-step="4">4. اللعب</div></div></details>`;
    (classSelect.closest(".control-panel, .game-controls, .setup-section, .controls") || classSelect.parentElement.parentElement).prepend(panel);

    const overlay = document.createElement("div");
    overlay.className = "cam-overlay";
    overlay.innerHTML = `<article class="cam-card"><div class="cam-counter"></div><div class="cam-player"></div><div class="cam-question"></div><div class="cam-meta"><span class="cam-badge cam-difficulty"></span><span class="cam-badge cam-points"></span><span class="cam-badge cam-timer"></span></div><div class="cam-hint"></div><div class="cam-answer"></div><div class="cam-actions"><button type="button" class="cam-hint-btn">💡 عرض التلميح</button><button type="button" class="cam-answer-btn">👁️ كشف الإجابة</button><button type="button" class="cam-correct">✅ إجابة صحيحة — متابعة الدور</button><button type="button" class="cam-wrong">❌ إجابة خاطئة — إنهاء الدور</button></div><div class="cam-score"></div></article>`;
    document.body.appendChild(overlay);

    const guide = document.createElement("div");
    guide.className = "cam-guide-overlay";
    guide.innerHTML = `<article class="cam-guide-card"><h2>🧭 الموجّه التفاعلي لإعداد اللعبة</h2><div class="cam-guide-list"><div class="cam-guide-item"><strong>1️⃣ اختر نوع مونوبولي</strong><p><b>الأصلي:</b> يحتوي على ${BUILTIN_QUESTIONS.length} سؤالًا جاهزًا عن عُمان والوعي المالي والحساب. <b>بالأسئلة:</b> يستورد المعلم قالبًا خاصًا بالدرس.</p></div><div class="cam-guide-item"><strong>2️⃣ اختر الصف وعدد اللاعبين</strong><p>اختر الشعبة، ثم حدد من 2 إلى 6 لاعبين. يمكن أن يكون اللاعب طالبًا أو ممثلًا لفريق.</p></div><div class="cam-guide-item"><strong>3️⃣ جهّز الأسئلة</strong><p class="cam-guide-recommend"></p><p>القاعدة المثالية: خمسة أسئلة لكل لاعب، مع خمسة أسئلة احتياطية. يمكن تكرار الأسئلة الخاطئة في نهاية القائمة.</p></div><div class="cam-guide-item"><strong>4️⃣ ابدأ والعب</strong><p>اضغط «إعداد اللاعبين»، اختر الأسماء، أكد الاختيار، ثم اضغط «بدء اللعبة». في كل دور اضغط «رمي النرد» مرة واحدة وانتظر ظهور السؤال.</p></div><div class="cam-guide-item"><strong>🎯 منطق التعلم</strong><p>يتحرك اللاعب أولًا ثم يجيب: الإجابة الصحيحة تسمح بمتابعة إجراءات المربع، والخاطئة تنهي الدور وتعيد السؤال لاحقًا. استخدم كشف الإجابة بعد أن يجيب الطالب شفهيًا.</p></div></div><div class="cam-guide-footer"><button type="button" class="cam-guide-start">ابدأ الإعداد الآن</button><button type="button" class="secondary cam-guide-close">إغلاق</button></div></article>`;
    document.body.appendChild(guide);

    const diceHelp = document.createElement("div");
    diceHelp.className = "cam-dice-help";
    document.body.appendChild(diceHelp);

    const turnHud = document.createElement("aside");
    turnHud.className = "cam-turn-hud";
    turnHud.setAttribute("aria-live", "polite");
    turnHud.innerHTML = `<div class="cam-turn-info"><div class="cam-turn-label">الدور الآن</div><div class="cam-turn-player">بانتظار بدء اللعبة</div><div class="cam-turn-instruction">اختر اللاعبين ثم ابدأ اللعبة</div></div><div class="cam-turn-actions"><span class="cam-roll-slot"></span><span class="cam-end-slot"></span><button type="button" class="cam-mini-settings" title="فتح التعليمات">❔</button></div>`;
    document.body.appendChild(turnHud);
    const rollPlaceholder = document.createElement("span");
    const endPlaceholder = document.createElement("span");
    rollPlaceholder.className = endPlaceholder.className = "cam-original-placeholder";
    rollButton.before(rollPlaceholder);
    endTurnButton.before(endPlaceholder);

    const importBox = panel.querySelector(".cam-import");
    const status = panel.querySelector(".cam-status");
    const countGuide = panel.querySelector(".cam-count-guide");

    panel.querySelectorAll(".cam-mode").forEach((button) => button.addEventListener("click", () => {
      mode = button.dataset.mode;
      panel.querySelectorAll(".cam-mode").forEach((item) => item.classList.toggle("active", item === button));
      importBox.classList.toggle("active", mode === "imported");
      status.textContent = mode === "builtin" ? `جاهز: ${BUILTIN_QUESTIONS.length} سؤالًا مدمجًا` : "استورد قالب مونوبولي قبل بدء اللعب";
      refreshGuide();
    }));

    panel.querySelector(".cam-file").addEventListener("change", async (event) => {
      try {
        const file = event.target.files[0];
        if (!file) return;
        const data = JSON.parse(await file.text());
        if (data.format !== "classact" || data.version !== "1.0" || data.activityType !== TYPE) throw new Error("هذا الملف ليس مخصصًا لمونوبولي سلطنة عُمان");
        const valid = Array.isArray(data.questions) ? data.questions.filter((q) => q && String(q.question || "").trim() && String(q.answer || "").trim()) : [];
        if (!valid.length) throw new Error("لا توجد أسئلة صالحة في الملف");
        importedPack = data;
        queue = orderQuestions(valid, data.settings?.questionOrder || "random"); retry = []; index = 0;
        const recommended = recommendedCount();
        status.textContent = valid.length >= recommended ? `✅ تم استيراد ${valid.length} سؤالًا — العدد مناسب` : `⚠️ تم استيراد ${valid.length} سؤالًا؛ الموصى به ${recommended}. ستُعاد الأسئلة عند انتهائها.`;
      } catch (error) {
        importedPack = null; queue = [];
        status.textContent = `❌ ${error.message || "تعذر قراءة الملف"}`;
      }
      refreshGuide();
    });

    panel.querySelector(".cam-guide-btn").onclick = openGuide;
    turnHud.querySelector(".cam-mini-settings").onclick = openGuide;
    guide.querySelector(".cam-guide-close").onclick = closeGuide;
    guide.querySelector(".cam-guide-start").onclick = () => { closeGuide(); panel.scrollIntoView({behavior:"smooth",block:"center"}); };
    guide.addEventListener("click", (event) => { if (event.target === guide) closeGuide(); });

    if (startButton) startButton.addEventListener("click", () => window.setTimeout(refreshGuide, 350));

    classSelect.addEventListener("change", refreshGuide);
    playersCountInput?.addEventListener("change", refreshGuide);
    setupButton?.addEventListener("click", () => window.setTimeout(refreshGuide, 500));

    rollButton.addEventListener("click", (event) => {
      if (challengeOpen) { event.preventDefault(); event.stopImmediatePropagation(); return; }
      if (mode === "imported" && (!importedPack || !queue.length)) {
        event.preventDefault(); event.stopImmediatePropagation();
        status.textContent = "❌ استورد قالب الأسئلة أولًا، أو اختر مونوبولي الأصلي";
        showDiceHelp("استورد قالب الأسئلة أولًا، أو اختر «مونوبولي الأصلي».");
        panel.scrollIntoView({behavior:"smooth",block:"center"});
        return;
      }
      setHudInstruction("🎲 تم رمي النرد… انتظر حركة القطعة ثم أجب عن السؤال.");
      window.setTimeout(showChallenge, 1650);
    }, true);

    overlay.querySelector(".cam-hint-btn").onclick = () => overlay.querySelector(".cam-hint").classList.add("show");
    overlay.querySelector(".cam-answer-btn").onclick = () => overlay.querySelector(".cam-answer").classList.add("show");
    overlay.querySelector(".cam-correct").onclick = () => resolve(false);
    overlay.querySelector(".cam-wrong").onclick = () => resolve(true);

    const observer = new MutationObserver(refreshGuide);
    [rollButton,endTurnButton,startButton,setupButton].filter(Boolean).forEach((el)=>observer.observe(el,{attributes:true,attributeFilter:["disabled"]}));
    const turnObserver = new MutationObserver(() => window.requestAnimationFrame(refreshTurnHud));
    turnObserver.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["class","disabled"]});

    status.textContent = `جاهز: ${BUILTIN_QUESTIONS.length} سؤالًا مدمجًا`;
    refreshGuide();
    refreshTurnHud();

    function openGuide(){ guide.querySelector(".cam-guide-recommend").textContent = recommendationText(); guide.classList.add("active"); }
    function closeGuide(){ guide.classList.remove("active"); }

    function recommendedCount(){
      const players = Math.max(2, Number(playersCountInput?.value || 2));
      return players * 5 + 5;
    }
    function recommendationText(){
      const players = Math.max(2, Number(playersCountInput?.value || 2));
      return `لعدد ${players} لاعبين نوصي بـ${recommendedCount()} سؤالًا: نحو 5 أسئلة لكل لاعب و5 أسئلة احتياطية. هذا مناسب لحصة من 25 إلى 40 دقيقة.`;
    }
    function refreshGuide(){
      const questionReady = mode === "builtin" || !!importedPack;
      const classReady = !!classSelect.value;
      const playersReady = !!(startButton && !startButton.disabled) || !!(rollButton && !rollButton.disabled);
      const started = !!(rollButton && !rollButton.disabled) || !!(endTurnButton && !endTurnButton.disabled);
      const states=[questionReady,classReady,playersReady,started];
      panel.querySelectorAll(".cam-step").forEach((step,i)=>{
        step.classList.toggle("done",states[i]);
        step.classList.toggle("current",!states[i] && states.slice(0,i).every(Boolean));
      });
      countGuide.textContent = recommendationText() + (mode === "builtin" ? ` البنك الجاهز يحتوي على ${BUILTIN_QUESTIONS.length} سؤالًا.` : "");
      document.body.classList.toggle("cam-game-live", started);
      if(started){
        if(rollButton.parentElement !== turnHud.querySelector(".cam-roll-slot")) turnHud.querySelector(".cam-roll-slot").appendChild(rollButton);
        if(endTurnButton.parentElement !== turnHud.querySelector(".cam-end-slot")) turnHud.querySelector(".cam-end-slot").appendChild(endTurnButton);
      }else{
        if(rollButton.previousElementSibling !== rollPlaceholder) rollPlaceholder.after(rollButton);
        if(endTurnButton.previousElementSibling !== endPlaceholder) endPlaceholder.after(endTurnButton);
      }
      refreshTurnHud();
    }

    function refreshTurnHud(){
      const player=currentPlayerName();
      const playerText=player ? `👤 ${player}` : "👤 اللاعب الحالي";
      const playerNode=turnHud.querySelector(".cam-turn-player");
      if(playerNode.textContent!==playerText) playerNode.textContent=playerText;
      if(challengeOpen) return setHudInstruction("🧠 السؤال مفتوح الآن — أجب ثم اختر صحيحة أو خاطئة.");
      if(!rollButton.disabled) return setHudInstruction("🎲 دورك جاهز — اضغط زر رمي النرد.");
      if(!endTurnButton.disabled) return setHudInstruction("✅ أكمل إجراءات المربع ثم اضغط إنهاء الدور.");
      setHudInstruction("⏳ انتظر انتقال الدور إلى اللاعب التالي.");
    }

    function setHudInstruction(message){ const node=turnHud.querySelector(".cam-turn-instruction"); if(node.textContent!==message) node.textContent=message; }

    function showChallenge(){
      if (challengeOpen) return;
      const source = mode === "builtin" ? BUILTIN_QUESTIONS : importedPack?.questions || [];
      if (!queue.length || index >= queue.length) {
        if (mode === "imported" && importedPack?.settings?.repeatWrongQuestions !== false && retry.length) queue = retry.splice(0);
        else queue = orderQuestions(source, mode === "builtin" ? "random" : importedPack?.settings?.questionOrder || "random");
        index = 0;
      }
      const q = queue[index];
      if (!q) return;
      const player = currentPlayerName();
      overlay.querySelector(".cam-counter").textContent = `${mode === "builtin" ? "سؤال مونوبولي الجاهز" : "سؤال الدرس"} • ${index + 1} من ${queue.length}`;
      overlay.querySelector(".cam-player").textContent = player ? `🎯 دور: ${player}` : "🎯 تحدي هذا الدور";
      overlay.querySelector(".cam-question").textContent = q.question;
      overlay.querySelector(".cam-difficulty").textContent = `المستوى: ${difficultyLabel(q.difficulty)}`;
      overlay.querySelector(".cam-points").textContent = `${Number(q.points)||10} نقطة`;
      overlay.querySelector(".cam-timer").textContent = `${Number(q.time)||30} ثانية مقترحة`;
      const hint=overlay.querySelector(".cam-hint"); hint.textContent=q.hint?`تلميح: ${q.hint}`:"فكر جيدًا واستعن بفريقك"; hint.className="cam-hint";
      const answer=overlay.querySelector(".cam-answer"); answer.textContent=`الإجابة: ${q.answer}`; answer.className="cam-answer";
      updateScore();
      challengeOpen=true; overlay.classList.add("active"); rollButton.disabled=true;
      refreshTurnHud();
    }

    function resolve(wrong){
      if(!challengeOpen)return;
      if(wrong){ retry.push(queue[index]); wrongCount+=1; } else correctCount+=1;
      index+=1; challengeOpen=false; overlay.classList.remove("active");
      updateScore();
      if(wrong && !endTurnButton.disabled) endTurnButton.click();
      setHudInstruction(wrong ? "❌ انتهى الدور، وسيعود السؤال لاحقًا." : "✅ إجابة صحيحة؛ أكمل إجراءات المربع ثم اضغط إنهاء الدور.");
      refreshGuide();
    }
    function updateScore(){ overlay.querySelector(".cam-score").textContent=`النتيجة المعرفية: ${correctCount} صحيحة • ${wrongCount} تحتاج مراجعة`; }
    function currentPlayerName(){
      const headings=[...document.querySelectorAll("h2,h3,h4,.player-name")];
      const explicit=document.querySelector('[data-current-player],.current-player,.active-player,[aria-current="true"]');
      const found=headings.find(e=>/دورك/.test(e.textContent||"")) || explicit?.querySelector?.("h2,h3,h4,.player-name") || explicit;
      return (found?.dataset?.currentPlayer || found?.textContent || "").replace(/👑|👤|◀|دورك|الدور الآن|دور اللاعب|اللاعب الحالي|في السجن|[:：]/g,"").trim();
    }
    function showDiceHelp(message){ diceHelp.textContent=message; diceHelp.classList.add("show"); window.clearTimeout(showDiceHelp.timer); showDiceHelp.timer=window.setTimeout(()=>diceHelp.classList.remove("show"),5000); }
    function difficultyLabel(value){ return value==="hard"?"متقدم":value==="medium"?"متوسط":"سهل"; }
  }

  function orderQuestions(list, order){
    const copy=(list||[]).filter(q=>q&&String(q.question||"").trim()&&String(q.answer||"").trim()).slice();
    if(order==="random") for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}
    return copy;
  }
})();
