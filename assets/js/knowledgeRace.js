// منطق واجهة اختيار الصف والمتنافسين وحلبة السباق الاحترافية
// يعتمد على studentData.json لجلب الصفوف والطلاب

let classes = [];
let students = [];
let selectedClass = null;
let selectedCompetitors = [];
let selectionMode = null; // 'random' or 'manual'

// عناصر الواجهة
const classSelect = document.getElementById('classSelect');
const studentsSection = document.getElementById('studentsSection');
const randomSelectBtn = document.getElementById('randomSelectBtn');
const manualSelectBtn = document.getElementById('manualSelectBtn');
const manualStudentsList = document.getElementById('manualStudentsList');
const confirmCompetitorsBtn = document.getElementById('confirmCompetitorsBtn');
const teamsRow = document.getElementById('teamsRow');
const arenaControls = document.getElementById('arenaControls');

// تحميل بيانات الطلاب والصفوف
fetch('../../data/studentData.json')
  .then(res => res.json())
  .then(data => {
    classes = data.classes || [];
    students = data.students || [];
    fillClassSelect();
  });

function fillClassSelect() {
  classes.forEach(cls => {
    const opt = document.createElement('option');
    opt.value = cls.id;
    opt.textContent = cls.name;
    classSelect.appendChild(opt);
  });
}

classSelect.addEventListener('change', () => {
  selectedClass = classSelect.value;
  if (selectedClass) {
    studentsSection.style.display = '';
    selectionMode = null;
    selectedCompetitors = [];
    manualStudentsList.style.display = 'none';
    confirmCompetitorsBtn.style.display = 'none';
  } else {
    studentsSection.style.display = 'none';
  }
});

randomSelectBtn.addEventListener('click', () => {
  selectionMode = 'random';
  manualStudentsList.style.display = 'none';
  confirmCompetitorsBtn.style.display = '';
  // اختيار 2-4 متنافسين عشوائياً من الصف
  const classStudents = students.filter(s => s.classId == selectedClass);
  const n = Math.min(4, classStudents.length);
  selectedCompetitors = shuffle(classStudents).slice(0, n);
});

manualSelectBtn.addEventListener('click', () => {
  selectionMode = 'manual';
  manualStudentsList.style.display = '';
  confirmCompetitorsBtn.style.display = '';
  renderManualStudentsList();
});

function renderManualStudentsList() {
  manualStudentsList.innerHTML = '';
  const classStudents = students.filter(s => s.classId == selectedClass);
  classStudents.forEach(stu => {
    const div = document.createElement('div');
    div.className = 'student-checkbox';
    div.innerHTML = `<input type="checkbox" value="${stu.id}" id="stu_${stu.id}"> <label for="stu_${stu.id}">${stu.name}</label>`;
    manualStudentsList.appendChild(div);
  });
}

confirmCompetitorsBtn.addEventListener('click', () => {
  if (selectionMode === 'manual') {
    const checked = manualStudentsList.querySelectorAll('input[type=checkbox]:checked');
    if (checked.length < 2) {
      showSmartMessage('اختر على الأقل متنافسين!');
      return;
    }
    selectedCompetitors = Array.from(checked).map(chk => {
      return students.find(s => s.id == chk.value);
    });
  }
  if (selectedCompetitors.length < 2) {
    showSmartMessage('يجب اختيار متنافسين على الأقل!');
    return;
  }
  // إظهار الحلبة وبطاقات المتنافسين
  document.getElementById('setupSection').style.display = 'none';
  teamsRow.style.display = '';
  arenaControls.style.display = '';
  renderCompetitorsArena();
  showSmartMessage('استعدوا للسباق!');
});

function renderCompetitorsArena() {
  teamsRow.innerHTML = '';
  selectedCompetitors.forEach((stu, idx) => {
    const card = document.createElement('div');
    card.className = 'team-card';
    card.innerHTML = `
      <div class="team-name">${stu.name}</div>
      <div class="team-progress"><div class="team-progress-bar" id="progress_${stu.id}" style="width:0%"></div></div>
      <div class="team-score" id="score_${stu.id}">النقاط: 0</div>
      <div class="team-icon"><i class="fas fa-rocket"></i></div>
    `;
    teamsRow.appendChild(card);
  });
}

// رسائل ذكية ومؤثرات
function showSmartMessage(msg) {
  let el = document.getElementById('smartMsg');
  if (!el) {
    el = document.createElement('div');
    el.id = 'smartMsg';
    el.style.position = 'fixed';
    el.style.top = '32px';
    el.style.left = '50%';
    el.style.transform = 'translateX(-50%)';
    el.style.background = 'rgba(255,255,255,0.95)';
    el.style.color = 'var(--accent-gold)';
    el.style.fontWeight = 'bold';
    el.style.fontSize = '1.3rem';
    el.style.padding = '16px 32px';
    el.style.borderRadius = '18px';
    el.style.boxShadow = '0 4px 24px 0 #0002';
    el.style.zIndex = 9999;
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.display = '';
  setTimeout(() => { el.style.display = 'none'; }, 2000);
}

function shuffle(arr) {
  return arr.map(a => [Math.random(), a]).sort().map(a => a[1]);
}

// ... لاحقاً: منطق السباق، التقدم، المؤثرات، الفوز ...

// --- منطق السباق الاحترافي ---
let raceActive = false;
let racePaused = false;

let scores = {};
let progress = {};
let stats = {};
const raceDistance = 10; // عدد النقاط المطلوبة للفوز

const startRaceBtn = document.getElementById('startRaceBtn');
const nextQuestionBtn = document.getElementById('nextQuestionBtn');
const correctBtn = document.getElementById('correctBtn');
const wrongBtn = document.getElementById('wrongBtn');
const pauseBtn = document.getElementById('pauseBtn');

let currentTurn = 0;

startRaceBtn.addEventListener('click', () => {
  if (raceActive) return;
  raceActive = true;
  racePaused = false;
  scores = {};
  progress = {};
  stats = {};
  selectedCompetitors.forEach(stu => {
    scores[stu.id] = 0;
    progress[stu.id] = 0;
    stats[stu.id] = { correct: 0, wrong: 0 };
    document.getElementById('progress_' + stu.id).style.width = '0%';
    document.getElementById('score_' + stu.id).textContent = 'النقاط: 0';
  });
  currentTurn = 0;
  showStatsPanel();
  showSmartMessage('انطلق السباق!');
  playSound('start');
  highlightCurrent();
});

pauseBtn.addEventListener('click', () => {
  if (!raceActive) return;
  racePaused = !racePaused;
  showSmartMessage(racePaused ? 'تم إيقاف السباق مؤقتاً' : 'استئناف السباق!');
});

nextQuestionBtn.addEventListener('click', () => {
  if (!raceActive || racePaused) return;
  currentTurn = (currentTurn + 1) % selectedCompetitors.length;
  highlightCurrent();
  showSmartMessage(randomEncourage());
});

correctBtn.addEventListener('click', () => {
  if (!raceActive || racePaused) return;
  const stu = selectedCompetitors[currentTurn];
  scores[stu.id] += 1;
  stats[stu.id].correct += 1;
  updateProgress(stu.id);
  playSound('correct');
  showSmartMessage('أحسنت يا ' + stu.name + '!');
  updateStatsPanel();
  if (scores[stu.id] >= raceDistance) {
    finishRace(stu);
  } else {
    nextQuestionBtn.click();
  }
});

wrongBtn.addEventListener('click', () => {
  if (!raceActive || racePaused) return;
  const stu = selectedCompetitors[currentTurn];
  stats[stu.id].wrong += 1;
  playSound('wrong');
  showSmartMessage('حظاً أوفر يا ' + stu.name + '!');
  updateStatsPanel();
  nextQuestionBtn.click();
});

function updateProgress(stuId) {
  const percent = Math.min(100, (scores[stuId] / raceDistance) * 100);
  document.getElementById('progress_' + stuId).style.width = percent + '%';
  document.getElementById('score_' + stuId).textContent = 'النقاط: ' + scores[stuId];
  animateRocket(stuId, percent);
}

function highlightCurrent() {
  // إزالة التمييز
  document.querySelectorAll('.team-card').forEach(card => card.classList.remove('active-turn'));
  // تمييز المتسابق الحالي
  const stu = selectedCompetitors[currentTurn];
  const card = Array.from(document.querySelectorAll('.team-card')).find(c => c.querySelector('.team-name').textContent === stu.name);
  if (card) card.classList.add('active-turn');
}

function finishRace(winner) {
  raceActive = false;
  showSmartMessage('🎉 مبروك للفائز: ' + winner.name + ' 🎉');
  playSound('win');
  confettiEffect();
  showHonorBoard();
}

// --- إحصائيات مباشرة ---
function showStatsPanel() {
  let panel = document.getElementById('statsPanel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'statsPanel';
    panel.style.position = 'fixed';
    panel.style.bottom = '24px';
    panel.style.left = '24px';
    panel.style.background = 'rgba(255,255,255,0.92)';
    panel.style.color = 'var(--oman-red)';
    panel.style.borderRadius = '18px';
    panel.style.boxShadow = '0 4px 24px #FFD70033';
    panel.style.padding = '18px 28px';
    panel.style.fontSize = '1.1rem';
    panel.style.zIndex = 1000;
    document.body.appendChild(panel);
  }
  updateStatsPanel();
}

function updateStatsPanel() {
  const panel = document.getElementById('statsPanel');
  if (!panel) return;
  let html = '<b>إحصائيات المتسابقين</b><br><table style="margin-top:8px;font-size:1rem;min-width:180px;">';
  html += '<tr><th>الاسم</th><th>صحيح</th><th>خطأ</th></tr>';
  selectedCompetitors.forEach(stu => {
    html += `<tr><td>${stu.name}</td><td style="color:green">${stats[stu.id]?.correct||0}</td><td style="color:#b00">${stats[stu.id]?.wrong||0}</td></tr>`;
  });
  html += '</table>';
  panel.innerHTML = html;
}

// --- لوحة الشرف ---
function showHonorBoard() {
  let board = document.getElementById('honorBoard');
  if (board) board.remove();
  board = document.createElement('div');
  board.id = 'honorBoard';
  board.style.position = 'fixed';
  board.style.top = '50%';
  board.style.left = '50%';
  board.style.transform = 'translate(-50%,-50%)';
  board.style.background = 'linear-gradient(135deg,#fffbe6 60%,#ffe7b2 100%)';
  board.style.color = '#b8860b';
  board.style.border = '4px solid #FFD700';
  board.style.borderRadius = '32px';
  board.style.boxShadow = '0 8px 48px #FFD70055';
  board.style.padding = '38px 48px 32px 48px';
  board.style.textAlign = 'center';
  board.style.zIndex = 2000;
  board.innerHTML = `<h2 style="font-size:2.2rem;margin-bottom:18px;">🏆 لوحة الشرف</h2>`;
  // ترتيب المتسابقين حسب النقاط
  const sorted = [...selectedCompetitors].sort((a,b)=>scores[b.id]-scores[a.id]);
  sorted.forEach((stu,idx)=>{
    board.innerHTML += `<div style="font-size:1.3rem;margin:10px 0;"><b>${idx+1}. ${stu.name}</b> <span style="color:green">(${scores[stu.id]} نقطة)</span></div>`;
  });
  board.innerHTML += `<div style="margin-top:22px;"><button onclick="document.getElementById('honorBoard').remove()" style="background:var(--accent-gold);color:#fff;font-size:1.1rem;padding:10px 28px;border:none;border-radius:12px;box-shadow:0 2px 8px #FFD70033;cursor:pointer;">إغلاق</button></div>`;
  document.body.appendChild(board);
  confettiEffect();
}

function randomEncourage() {
  const msgs = [
    'منافسة مشتعلة!','من يتقدم؟','من سيفوز؟','شدوا الهمة!','أجواء حماسية!','السباق يزداد إثارة!','من الأقوى اليوم؟','من الأقرب للفوز؟'
  ];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

function playSound(type) {
  const sounds = {
    start: '../assets/media/sounds/kingdom-sounds/battle-horn.mp3',
    correct: '../assets/media/sounds/kingdom-sounds/perfect-score.mp3',
    wrong: '../assets/media/sounds/kingdom-sounds/ai-beep.mp3',
    win: '../assets/media/sounds/kingdom-sounds/crown-ceremony.mp3',
    click: '../assets/media/sounds/kingdom-sounds/button-hover.mp3',
    encourage: '../assets/media/sounds/kingdom-sounds/achievement-unlock.mp3',
    next: '../assets/media/sounds/kingdom-sounds/bonus-collect.mp3',
    pause: '../assets/media/sounds/kingdom-sounds/book-close.mp3'
  };
  if (sounds[type]) {
    const audio = new Audio(sounds[type]);
    audio.play();
  }
}

// تفعيل صوت عند الضغط على أزرار التحكم
[startRaceBtn, nextQuestionBtn, correctBtn, wrongBtn, pauseBtn].forEach(btn => {
  btn.addEventListener('click', () => playSound('click'));
});

function confettiEffect() {
  if (window.confetti) {
    confetti({
      particleCount: 200,
      spread: 90,
      origin: { y: 0.6 }
    });
  }
}

function animateRocket(stuId, percent) {
  // حركة أيقونة الصاروخ على المضمار
  const bar = document.getElementById('progress_' + stuId);
  const icon = bar.parentElement.parentElement.querySelector('.team-icon');
  icon.style.transform = `translateX(${percent}%) scale(1.2)`;
  setTimeout(() => { icon.style.transform = 'translateX(0) scale(1)'; }, 700);
}
