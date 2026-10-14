(function(){
"use strict";
const IDS=["rollingSound","selectSound","clickSound","celebrationSound"];
const state={unlocked:false,queuedCelebration:false,celebrationFallback:null};
function get(id){return document.getElementById(id)}
function reset(media){if(!media)return;try{media.pause();media.currentTime=0}catch(_){}}
function stopExcept(id){IDS.forEach(key=>{if(key!==id)reset(get(key))})}
function unlock(){
  if(state.unlocked)return;
  state.unlocked=true;
  IDS.forEach(id=>{
    const media=get(id);if(!media)return;
    const wasMuted=media.muted,wasVolume=media.volume;
    try{
      media.muted=true;media.volume=0;
      const attempt=HTMLMediaElement.prototype.play.call(media);
      reset(media);
      if(attempt&&attempt.catch)attempt.catch(()=>{});
    }catch(_){}
    setTimeout(()=>{media.muted=wasMuted;media.volume=wasVolume},0);
  });
}
function install(){
  const rolling=get("rollingSound"),select=get("selectSound"),click=get("clickSound"),celebration=get("celebrationSound");
  if(!rolling||!select||!click||!celebration)return;
  rolling.volume=.42;select.volume=.72;click.volume=.35;celebration.volume=.68;
  IDS.forEach(id=>{const media=get(id);media.setAttribute("playsinline","");media.preload="auto";media.load()});
  const nativePlay=HTMLMediaElement.prototype.play;
  function direct(media){const p=nativePlay.call(media);if(p&&p.catch)p.catch(()=>{});return p}
  rolling.play=function(){stopExcept("rollingSound");this.currentTime=0;return direct(this)};
  select.play=function(){state.queuedCelebration=false;clearTimeout(state.celebrationFallback);reset(rolling);reset(celebration);this.currentTime=0;return direct(this)};
  click.play=function(){this.currentTime=0;return direct(this)};
  celebration.play=function(){
    const run=()=>{state.queuedCelebration=false;clearTimeout(state.celebrationFallback);reset(rolling);reset(this);this.currentTime=0;return direct(this)};
    if(select&&!select.paused&&!select.ended){
      state.queuedCelebration=true;
      const onEnd=()=>{select.removeEventListener("ended",onEnd);if(state.queuedCelebration)run()};
      select.addEventListener("ended",onEnd,{once:true});
      state.celebrationFallback=setTimeout(()=>{select.removeEventListener("ended",onEnd);if(state.queuedCelebration)run()},3500);
      return Promise.resolve();
    }
    return run();
  };
  document.addEventListener("pointerdown",unlock,{capture:true,once:true,passive:true});
  document.addEventListener("touchstart",unlock,{capture:true,once:true,passive:true});
  document.addEventListener("visibilitychange",()=>{if(document.hidden)IDS.forEach(id=>reset(get(id)))});
  window.addEventListener("pagehide",()=>IDS.forEach(id=>reset(get(id))));
}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",install):install();
})();