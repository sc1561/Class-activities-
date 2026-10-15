(function(){
  "use strict";

  // لا يسمح بأي صوت قبل أول تفاعل حقيقي من المستخدم.
  let audioUnlocked=false;
  const nativePlay=HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play=function(){
    if(!audioUnlocked){
      try{this.pause();this.currentTime=0;}catch(_error){}
      return Promise.resolve();
    }
    return nativePlay.apply(this,arguments).catch(()=>{});
  };
  const unlockAudio=()=>{
    if(audioUnlocked)return;
    audioUnlocked=true;
    document.documentElement.classList.add("timer-audio-ready");
  };
  window.addEventListener("pointerdown",unlockAudio,{capture:true,once:true});
  window.addEventListener("keydown",unlockAudio,{capture:true,once:true});

  const ready=(fn)=>document.readyState==="loading"?document.addEventListener("DOMContentLoaded",fn):fn();
  ready(()=>{
    document.body.classList.add("timer-modern");
    document.querySelectorAll("audio").forEach(audio=>{audio.pause();try{audio.currentTime=0;}catch(_error){}});
    injectStyles();
    buildExperience();
  });

  function buildExperience(){
    const display=document.querySelector(".timer-display");
    const time=document.getElementById("timerTime");
    const status=document.getElementById("statusIndicator");
    const start=document.getElementById("startBtn");
    const pause=document.getElementById("pauseBtn");
    const reset=document.getElementById("resetBtn");
    const stop=document.getElementById("stopBtn");
    if(!display||!time||!start)return;

    const header=document.querySelector(".header-subtitle");
    if(header)header.textContent="وقت واضح، تركيز أعلى، وإنجاز ممتع داخل الصف";

    const guide=document.createElement("div");
    guide.className="timer-journey";
    guide.innerHTML='<span class="active">1 اختر الوقت</span><span>2 ابدأ المهمة</span><span>3 احتفل بالإنجاز</span>';
    document.querySelector(".header-card")?.appendChild(guide);

    const scene=document.createElement("div");
    scene.className="timer-scene";
    scene.setAttribute("aria-hidden","true");
    scene.innerHTML='<i></i><i></i><i></i><i></i><div class="timer-focus-label">وقت التركيز</div>';
    display.prepend(scene);

    const hint=document.createElement("div");
    hint.className="timer-smart-hint";
    hint.innerHTML='<span>✨</span><div><strong>جاهز لبدء المهمة</strong><small>اختر المدة ثم اضغط «ابدأ المؤقت»</small></div>';
    display.appendChild(hint);

    const actions=document.querySelector(".timer-controls");
    if(actions){
      actions.setAttribute("aria-label","أدوات التحكم بالمؤقت");
      start.innerHTML='<span>▶</span><span>ابدأ التركيز</span>';
    }

    const soundBadge=document.createElement("div");
    soundBadge.className="audio-privacy-badge";
    soundBadge.innerHTML='<span>🔇</span><b>الصوت يبدأ بعد تفاعلك فقط</b>';
    display.appendChild(soundBadge);
    const markReady=()=>{soundBadge.innerHTML='<span>🔊</span><b>الصوت جاهز</b>';soundBadge.classList.add("ready");};
    window.addEventListener("pointerdown",markReady,{once:true});
    window.addEventListener("keydown",markReady,{once:true});

    [start,pause,reset,stop].filter(Boolean).forEach(btn=>btn.addEventListener("click",()=>{
      display.classList.add("timer-impact");
      window.setTimeout(()=>display.classList.remove("timer-impact"),420);
    }));

    let previous=time.textContent.trim();
    const observer=new MutationObserver(()=>{
      const value=time.textContent.trim();
      if(value!==previous){
        previous=value;
        time.classList.remove("tick-pop");
        void time.offsetWidth;
        time.classList.add("tick-pop");
      }
      syncState(display,status,hint);
    });
    observer.observe(time,{childList:true,subtree:true,characterData:true,attributes:true});
    if(status)observer.observe(status,{childList:true,subtree:true,attributes:true});

    const modal=document.getElementById("completionModal")||document.querySelector(".completion-modal");
    if(modal){
      const celebration=new MutationObserver(()=>{
        if(modal.classList.contains("show"))launchCelebration();
      });
      celebration.observe(modal,{attributes:true,attributeFilter:["class"]});
    }
    syncState(display,status,hint);
  }

  function syncState(display,status,hint){
    const text=(status?.textContent||"").trim();
    display.classList.toggle("is-running",/جاري|يعمل|تشغيل/.test(text));
    display.classList.toggle("is-paused",/مؤقت|متوقف/.test(text));
    display.classList.toggle("is-finished",/انته|مكتمل/.test(text));
    const strong=hint?.querySelector("strong"),small=hint?.querySelector("small");
    if(!strong||!small)return;
    if(display.classList.contains("is-running")){strong.textContent="الوقت يعمل الآن";small.textContent="ركّز على المهمة… كل ثانية تقرّبك من الإنجاز";}
    else if(display.classList.contains("is-paused")){strong.textContent="المؤقت متوقف مؤقتًا";small.textContent="يمكنك المتابعة من النقطة نفسها";}
    else if(display.classList.contains("is-finished")){strong.textContent="أحسنتم! انتهى الوقت";small.textContent="حان وقت مشاركة النتائج والاحتفال بالإنجاز";}
    else{strong.textContent="جاهز لبدء المهمة";small.textContent="اختر المدة ثم اضغط «ابدأ التركيز»";}
  }

  function launchCelebration(){
    const layer=document.createElement("div");layer.className="timer-celebration";layer.setAttribute("aria-hidden","true");
    const colors=["#0ea5a0","#f4b942","#ff6b4a","#7c5cff","#40c878"];
    for(let i=0;i<46;i++){
      const bit=document.createElement("i");
      bit.style.setProperty("--x",`${Math.random()*100}vw`);bit.style.setProperty("--r",`${Math.random()*720-360}deg`);
      bit.style.setProperty("--d",`${1.8+Math.random()*1.8}s`);bit.style.setProperty("--delay",`${Math.random()*.45}s`);
      bit.style.background=colors[i%colors.length];layer.appendChild(bit);
    }
    document.body.appendChild(layer);window.setTimeout(()=>layer.remove(),4300);
  }

  function injectStyles(){
    const style=document.createElement("style");style.id="timerModernStyles";
    style.textContent=`
      :root{--tm-ink:#123332;--tm-muted:#657a78;--tm-primary:#087f76;--tm-primary2:#13aaa0;--tm-gold:#f4b942;--tm-panel:#fffefa;--tm-line:#d8e7e4}
      body.timer-modern{background:radial-gradient(circle at 50% -10%,#effbf7 0,#d9f0e9 34%,#b8ddd4 72%,#8fc9bd 100%);color:var(--tm-ink)}body.timer-modern:before{animation:none;opacity:.28}
      .timer-modern .main-container{max-width:1080px;padding-top:18px}.timer-modern .header{margin-bottom:18px}.timer-modern .header-card{padding:22px;background:rgba(255,255,255,.88);border:1px solid rgba(255,255,255,.8);box-shadow:0 16px 44px rgba(7,72,67,.1)}.timer-modern .header-card:before{height:4px;background:linear-gradient(90deg,var(--tm-primary),var(--tm-gold))}.timer-modern .header-title{font-size:clamp(1.75rem,4vw,2.45rem);color:var(--tm-primary);text-shadow:none;margin-bottom:3px}.timer-modern .header-subtitle{font-size:clamp(.88rem,2vw,1.02rem);color:var(--tm-muted)}
      .timer-journey{display:flex;justify-content:center;gap:7px;flex-wrap:wrap;margin-top:12px}.timer-journey span{padding:6px 11px;border-radius:999px;background:#eef5f3;color:#637875;font-size:.7rem;font-weight:800}.timer-journey .active{background:var(--tm-primary);color:#fff}
      .timer-modern .control-btn{width:45px;height:45px;font-size:18px;box-shadow:0 6px 18px rgba(5,70,65,.14);border:1px solid #fff}.timer-modern #classactTimerLoader{max-width:100%;margin:0 0 16px!important;padding:14px!important;border:1px solid #d5e6e3!important;border-radius:15px!important;box-shadow:none!important;background:rgba(255,255,255,.88)!important}.timer-modern #classactTimerLoader h3{font-size:1rem;margin-bottom:9px}.timer-modern .cati-mode{padding:8px 14px!important;font-size:.8rem;border-width:1px!important}.timer-modern .cati-mode.active{background:var(--tm-primary)!important;border-color:var(--tm-primary)!important}
      .timer-modern .timer-settings{padding:20px;margin-bottom:18px;background:rgba(255,255,255,.9);border:1px solid var(--tm-line);box-shadow:0 14px 38px rgba(5,70,65,.09)}.timer-modern .timer-settings h3{font-size:1.15rem;margin-bottom:14px}.timer-modern .settings-grid{grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}.timer-modern .setting-group{padding:14px;border:1px solid var(--tm-line);box-shadow:none}.timer-modern .setting-group:hover{transform:none;box-shadow:0 6px 18px rgba(5,70,65,.08)}.timer-modern .timer-select{padding:11px 14px;font-size:.88rem;border:1px solid #cbdeda}.timer-modern .preset-times{display:flex;gap:7px;overflow-x:auto;margin-top:10px;padding:3px 1px 7px;scrollbar-width:thin}.timer-modern .preset-btn{min-width:105px;padding:9px 12px;border-radius:999px;background:#eef7f5;color:var(--tm-primary);border:1px solid #c7e2de;box-shadow:none;font-size:.75rem}.timer-modern .preset-btn:hover{transform:translateY(-2px);background:var(--tm-primary);color:#fff;box-shadow:0 7px 16px rgba(8,127,118,.18)}
      .timer-modern .timer-display{min-height:430px;padding:30px 24px 22px;margin-bottom:16px;background:linear-gradient(145deg,#063c39,#052f2c);border:1px solid rgba(255,255,255,.25);box-shadow:0 22px 54px rgba(3,50,47,.24);color:#fff;isolation:isolate}.timer-modern .timer-display:before{animation:none;background:radial-gradient(circle at center,rgba(31,183,170,.18),transparent 55%);inset:0;width:auto;height:auto}.timer-scene{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:-1}.timer-scene:before,.timer-scene:after{content:"";position:absolute;border:1px solid rgba(104,224,210,.15);border-radius:50%;left:50%;top:48%;transform:translate(-50%,-50%)}.timer-scene:before{width:410px;height:410px}.timer-scene:after{width:520px;height:520px}.timer-scene i{position:absolute;width:8px;height:8px;background:var(--tm-gold);border-radius:50%;left:50%;top:48%;box-shadow:0 0 16px var(--tm-gold);animation:orbit 8s linear infinite}.timer-scene i:nth-child(2){animation-duration:11s;animation-delay:-3s;background:#3cdbc9}.timer-scene i:nth-child(3){animation-duration:14s;animation-delay:-7s;transform-origin:0 205px}.timer-scene i:nth-child(4){animation-duration:17s;animation-delay:-11s;background:#fff}.timer-focus-label{position:absolute;top:17px;left:50%;transform:translateX(-50%);padding:5px 13px;border:1px solid rgba(255,255,255,.18);border-radius:999px;color:#c8e6e1;font-size:.72rem;font-weight:800;letter-spacing:.04em}
      .timer-modern .timer-circle-container{width:min(300px,72vw);height:min(300px,72vw);margin-bottom:14px}.timer-modern .timer-bg-circle{stroke:rgba(255,255,255,.12)}.timer-modern .timer-progress-circle{stroke:#31d5c4;filter:drop-shadow(0 0 10px rgba(49,213,196,.42))}.timer-modern .timer-time{font-size:clamp(3rem,9vw,5rem);color:#fff;text-shadow:0 7px 28px rgba(0,0,0,.38);letter-spacing:.03em}.timer-modern .status-indicator{padding:9px 17px;margin-bottom:12px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.08);color:#d7ebe7;border-radius:999px;font-size:.84rem}.timer-smart-hint{display:flex;align-items:center;gap:9px;min-width:min(380px,92%);padding:10px 14px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.13);border-radius:13px}.timer-smart-hint>span{font-size:1.4rem}.timer-smart-hint strong,.timer-smart-hint small{display:block}.timer-smart-hint strong{font-size:.86rem}.timer-smart-hint small{font-size:.68rem;color:#b9d4cf}.audio-privacy-badge{position:absolute;bottom:12px;left:14px;display:flex;align-items:center;gap:5px;color:#aac5c0;font-size:.62rem}.audio-privacy-badge.ready{color:#6de0d2}
      .timer-modern .timer-controls{position:sticky;bottom:10px;z-index:80;margin:0 auto 18px;padding:10px;max-width:850px;gap:8px;background:rgba(255,255,255,.82);border:1px solid rgba(255,255,255,.75);border-radius:17px;backdrop-filter:blur(18px);box-shadow:0 12px 38px rgba(5,70,65,.17)}.timer-modern .timer-btn{min-width:125px;padding:11px 16px;border-radius:11px;font-size:.83rem;box-shadow:none}.timer-modern .start-btn{background:linear-gradient(135deg,var(--tm-primary),var(--tm-primary2))}.timer-modern .pause-btn{background:#d98c18}.timer-modern .reset-btn{background:#607875}.timer-modern .stop-btn{background:#c44949}.timer-modern .sound-settings-btn{background:#6555b6}
      .timer-modern .timer-stats,.timer-modern .advanced-settings{padding:19px;margin-bottom:18px;border:1px solid var(--tm-line);box-shadow:0 12px 32px rgba(5,70,65,.08)}.timer-modern .stats-grid{grid-template-columns:repeat(4,1fr);gap:9px}.timer-modern .stat-item{padding:13px;background:#f6faf9;border:1px solid #dfebe8}.timer-modern .stat-number{font-size:1.35rem;color:var(--tm-primary)}
      .timer-modern .completion-modal{backdrop-filter:blur(10px);background:rgba(3,34,32,.8)}.timer-modern .modal-content{border-radius:24px;border:1px solid rgba(255,255,255,.7);box-shadow:0 28px 90px rgba(0,0,0,.34)}.timer-modern .modal-content:before{height:5px;background:linear-gradient(90deg,var(--tm-primary),var(--tm-gold))}
      .tick-pop{animation:tickPop .18s ease-out}.timer-impact{animation:displayImpact .38s ease-out}.timer-display.is-running .timer-focus-label{color:#73f2df;border-color:rgba(115,242,223,.35)}.timer-display.is-running .timer-scene{animation:sceneBreath 2.4s ease-in-out infinite}.timer-display.is-finished{box-shadow:0 0 0 3px var(--tm-gold),0 26px 70px rgba(244,185,66,.28)}
      .timer-celebration{position:fixed;inset:0;z-index:3000;pointer-events:none;overflow:hidden}.timer-celebration i{position:absolute;left:var(--x);top:-18px;width:10px;height:18px;border-radius:3px;animation:confettiFall var(--d) ease-in var(--delay) forwards}
      @keyframes orbit{from{transform:rotate(0) translateX(205px) rotate(0)}to{transform:rotate(360deg) translateX(205px) rotate(-360deg)}}@keyframes tickPop{50%{transform:translate(-50%,-50%) scale(1.055)}}@keyframes displayImpact{50%{transform:scale(.992)}}@keyframes sceneBreath{50%{opacity:.72}}@keyframes confettiFall{to{transform:translateY(110vh) rotate(var(--r));opacity:.9}}
      @media(max-width:700px){.timer-modern .main-container{padding:8px}.timer-modern .header-card{padding:70px 12px 16px}.timer-modern .settings-grid{grid-template-columns:1fr}.timer-modern .timer-settings{padding:13px}.timer-modern .timer-display{min-height:390px;padding:28px 10px 18px}.timer-modern .timer-controls{display:grid;grid-template-columns:1fr 1fr;bottom:5px}.timer-modern .timer-btn{min-width:0;padding:10px 7px;font-size:.72rem}.timer-modern .stats-grid{grid-template-columns:1fr 1fr}.timer-smart-hint{min-width:94%}.audio-privacy-badge{position:static;margin-top:9px}.timer-scene:after{width:390px;height:390px}}
      @media(prefers-reduced-motion:reduce){.timer-modern *{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important}}
    `;
    document.head.appendChild(style);
  }
})();
