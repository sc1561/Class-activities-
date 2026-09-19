(function () {
    "use strict";

    const state = { mode: "normal", pack: null, queue: [], wrong: [], index: 0, cycle: 1 };

    function shuffle(items) {
        const result = [...items];
        for (let index = result.length - 1; index > 0; index -= 1) {
            const randomIndex = Math.floor(Math.random() * (index + 1));
            [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
        }
        return result;
    }

    function isValidPackage(pack) {
        return Boolean(pack && pack.format === "classact" && pack.version === "1.0" &&
            pack.activityType === "knowledge-race" && Array.isArray(pack.questions) &&
            pack.questions.length && pack.questions.every(question => question &&
                typeof question.question === "string" && question.question.trim() &&
                typeof question.answer === "string" && question.answer.trim()));
    }

    function orderedQuestions() {
        const questions = state.pack.questions.map(question => ({ ...question }));
        return state.pack.settings?.questionOrder === "sequential" ? questions : shuffle(questions);
    }

    function prepareQuestions() {
        state.queue = orderedQuestions();
        state.wrong = [];
        state.index = 0;
        state.cycle = 1;
    }

    function currentQuestion() {
        if (!state.pack) return null;
        if (state.index >= state.queue.length) {
            if (state.pack.settings?.repeatWrongQuestions && state.wrong.length) {
                state.queue = [...state.wrong];
                state.wrong = [];
            } else {
                state.queue = orderedQuestions();
                state.cycle += 1;
            }
            state.index = 0;
        }
        return state.queue[state.index] || null;
    }

    function ensureQuestionTools(questionBox) {
        let tools = questionBox.querySelector("#classactRaceTools");
        if (tools) return tools;

        tools = document.createElement("div");
        tools.id = "classactRaceTools";
        tools.innerHTML = `<div id="classactRaceMeta"></div><div id="classactRaceHint"></div><div id="classactRaceAnswer"></div><div class="classact-question-actions"><button type="button" data-classact-action="hint">💡 تلميح</button><button type="button" data-classact-action="answer">👁️ إظهار الإجابة</button></div>`;
        const evaluationButtons = questionBox.querySelector("#raceCorrectBtn")?.parentElement;
        questionBox.insertBefore(tools, evaluationButtons || null);
        tools.querySelector('[data-classact-action="hint"]').onclick = () => tools.querySelector("#classactRaceHint").classList.toggle("visible");
        tools.querySelector('[data-classact-action="answer"]').onclick = () => tools.querySelector("#classactRaceAnswer").classList.toggle("visible");
        return tools;
    }

    function renderQuestion() {
        if (state.mode !== "imported" || !state.pack) return;
        const questionBox = document.getElementById("raceQuestionBox");
        const questionText = document.getElementById("raceQuestion");
        const question = currentQuestion();
        if (!questionBox || !questionText || !question) return;

        const tools = ensureQuestionTools(questionBox);
        const cycleText = state.cycle > 1 ? ` • الدورة ${state.cycle}` : "";
        questionText.textContent = question.question;
        questionText.classList.add("classact-imported-question");
        tools.querySelector("#classactRaceMeta").textContent = `السؤال ${state.index + 1} من ${state.queue.length}${cycleText} • ${question.points || 10} نقاط • ${question.time || state.pack.settings?.defaultTime || 30} ثانية`;
        tools.querySelector("#classactRaceHint").textContent = question.hint ? `💡 ${question.hint}` : "لا يوجد تلميح لهذا السؤال.";
        tools.querySelector("#classactRaceAnswer").textContent = `✅ الإجابة النموذجية: ${question.answer}`;
        tools.querySelector("#classactRaceHint").classList.remove("visible");
        tools.querySelector("#classactRaceAnswer").classList.remove("visible");
        tools.hidden = false;
    }

    function advanceQuestion(wasWrong) {
        const question = currentQuestion();
        if (question && wasWrong) state.wrong.push(question);
        state.index += 1;
        window.setTimeout(renderQuestion, 260);
    }

    function hideImportedTools() {
        const tools = document.getElementById("classactRaceTools");
        if (tools) tools.hidden = true;
    }

    function mountLoader() {
        const selectionPanel = document.getElementById("selectionPanel");
        if (!selectionPanel || document.getElementById("classactRaceLoader")) return;

        selectionPanel.insertAdjacentHTML("afterbegin", `<section id="classactRaceLoader" class="classact-race-loader"><h3>📚 أسئلة سباق المعرفة</h3><div class="classact-race-modes"><button type="button" class="classact-race-mode active" data-mode="normal">سباق عادي</button><button type="button" class="classact-race-mode" data-mode="imported">سباق بأسئلة جاهزة</button></div><div class="classact-race-import"><label class="classact-race-file">📂 استيراد ملف .classact<input id="classactRaceFile" type="file" accept=".classact,application/json"></label><div class="classact-race-status">اختر ملف سباق معرفة من مركز إعداد الأنشطة.</div></div></section>`);

        const modes = selectionPanel.querySelectorAll(".classact-race-mode");
        const importBox = selectionPanel.querySelector(".classact-race-import");
        const status = selectionPanel.querySelector(".classact-race-status");

        modes.forEach(button => button.onclick = () => {
            state.mode = button.dataset.mode;
            modes.forEach(item => item.classList.toggle("active", item === button));
            importBox.classList.toggle("visible", state.mode === "imported");
            if (state.mode === "normal") hideImportedTools();
        });

        document.getElementById("classactRaceFile").onchange = async event => {
            const file = event.target.files[0];
            if (!file) return;
            try {
                const pack = JSON.parse(await file.text());
                if (!isValidPackage(pack)) throw new Error("invalid package");
                state.pack = pack;
                prepareQuestions();
                status.classList.remove("error");
                status.textContent = `تم تحميل «${pack.metadata?.title || file.name}» — ${pack.questions.length} سؤالًا.`;
            } catch (error) {
                state.pack = null;
                status.classList.add("error");
                status.textContent = "هذا الملف غير مخصص لسباق المعرفة. أنشئ ملفًا جديدًا بعد اختيار سباق المعرفة من مركز الإعداد.";
            }
        };

        document.getElementById("startRaceBtn").addEventListener("click", event => {
            if (state.mode === "imported" && !state.pack) {
                event.preventDefault();
                event.stopImmediatePropagation();
                status.classList.add("error");
                status.textContent = "استورد ملف سباق المعرفة أولًا قبل بدء السباق.";
            } else if (state.mode === "imported") {
                prepareQuestions();
            }
        }, true);
    }

    function handleDynamicRaceClick(event) {
        if (state.mode !== "imported" || !state.pack) return;
        const button = event.target.closest("button");
        if (!button) return;

        if (button.id === "startRealRaceBtn") prepareQuestions();
        if (button.id === "startRoundBtn") {
            window.setTimeout(renderQuestion, 50);
            window.setTimeout(renderQuestion, 300);
        }
        if (button.id === "raceCorrectBtn") advanceQuestion(false);
        if (button.id === "raceWrongBtn") advanceQuestion(true);
    }

    function observeDynamicRace() {
        document.addEventListener("click", handleDynamicRaceClick, true);
        const observer = new MutationObserver(() => {
            const questionBox = document.getElementById("raceQuestionBox");
            const questionText = document.getElementById("raceQuestion");
            const question = state.mode === "imported" && state.pack ? currentQuestion() : null;
            if (questionBox && questionText && question && questionBox.style.display !== "none" && questionText.textContent !== question.question) {
                window.setTimeout(renderQuestion, 0);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["style"] });
    }

    function mount() {
        mountLoader();
        observeDynamicRace();
    }

    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", mount) : mount();
})();
