(function(){
  "use strict";
  const STORE="classact_custom_rosters_v1",ACTIVE="classact_custom_roster_active_v1";
  function read(){try{const value=JSON.parse(localStorage.getItem(STORE)||"[]");return Array.isArray(value)?value:[]}catch(_){return[]}}
  function active(){try{const id=localStorage.getItem(ACTIVE);return read().find(g=>g.id===id&&Array.isArray(g.participants)&&g.participants.length)||null}catch(_){return null}}
  function payload(group){return {[group.title||"مجموعة الورشة"]:group.participants.map(p=>typeof p==="string"?p:p.name).filter(Boolean)} }
  const originalFetch=typeof window.fetch==="function"?window.fetch.bind(window):null;
  if(originalFetch){window.fetch=function(input,init){const url=typeof input==="string"?input:(input&&input.url)||"";const group=active();if(group&&/(^|\/)(studentData|students)(\.min)?\.json(?:[?#]|$)/i.test(url)){const body=JSON.stringify(payload(group));return Promise.resolve(new Response(body,{status:200,headers:{"Content-Type":"application/json;charset=utf-8","X-ClassAct-Roster":"local"}}))}return originalFetch(input,init)}}
  window.ClassActRoster={read,active,payload,activate(id){localStorage.setItem(ACTIVE,id)},deactivate(){localStorage.removeItem(ACTIVE)},keys:{STORE,ACTIVE}};
  function banner(){const group=active();if(!group||document.getElementById("classactRosterBanner"))return;const style=document.createElement("style");style.textContent="#classactRosterBanner{position:fixed;left:12px;bottom:12px;z-index:2147482500;background:#082f49ee;color:#fff;border:2px solid #22d3ee;border-radius:14px;padding:9px 12px;font:700 14px system-ui;box-shadow:0 8px 25px #0007;direction:rtl}#classactRosterBanner a{color:#fde68a;margin-right:8px}";document.head.append(style);const box=document.createElement("div");box.id="classactRosterBanner";box.innerHTML=`👥 وضع الورشة: <b>${String(group.title).replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[s]))}</b> (${group.participants.length}) <a href="${location.pathname.includes('/activities/')?'../new/':'new/'}">إدارة</a>`;document.body.append(box)}
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",banner):banner();
})();
