
const D = window.GATE_DATA;
const state = JSON.parse(localStorage.getItem("gateDA2027") || '{"topics":{},"days":{},"theme":"dark"}');

function save(){localStorage.setItem("gateDA2027", JSON.stringify(state)); updateAll();}
function esc(s){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function topicKey(sec, i){return `${sec.id}-${i}`}

function updateAll(){
  const doneTopics = Object.values(state.topics).filter(Boolean).length;
  const totalTopics = D.sections.reduce((n,s)=>n+s.topics.length,0);
  const doneDays = Object.values(state.days).filter(Boolean).length;
  document.getElementById("completedCount").textContent = `${doneTopics}/${totalTopics}`;
  document.querySelectorAll(".section-card").forEach(c=>{
    const id=c.dataset.id, sec=D.sections.find(s=>s.id===id);
    const done=sec.topics.filter((_,i)=>state.topics[topicKey(sec,i)]).length;
    c.querySelector(".bar i").style.width=(done/sec.topics.length*100)+"%";
    c.querySelector(".progress-text").textContent=`${done}/${sec.topics.length} topics`;
  });
  renderDetail(currentSection);
  renderDaily();
}

function renderDashboard(){
  const el=document.getElementById("dashboardSections");
  el.innerHTML=D.sections.map(s=>`
    <div class="section-card" data-id="${s.id}" onclick="openSection('${s.id}')">
      <div class="num">0${s.num} · ${esc(s.days)}</div>
      <h3>${esc(s.title)}</h3><p>${esc(s.short)}</p>
      <div class="bar"><i></i></div><small class="progress-text" style="color:#9aa5bd;font-size:10px"></small>
    </div>`).join("");
}
function renderTimeline(){
  document.getElementById("timeline").innerHTML=D.phases.map(p=>`
    <div class="phase"><div><b>${fmt(p[0])} → ${fmt(p[1])}</b></div><div><strong>${esc(p[2])}</strong><p>${phaseAdvice(p[2])}</p></div></div>`).join("");
}
function phaseAdvice(label){
  if(label.includes("Probability")) return "Concepts → worked examples → PYQs → timed mini-test.";
  if(label.includes("Linear")) return "Matrix drills + eigen/SVD calculations + PYQs.";
  if(label.includes("Calculus")) return "Short, focused coverage; prioritize limits, derivatives, Taylor and extrema.";
  if(label.includes("Programming")) return "Trace Python, memorize no code blindly; practice complexity and algorithm behavior.";
  if(label.includes("Database")) return "SQL/relational algebra + normalization/indexing + warehouse concepts.";
  if(label.includes("Machine")) return "Spend the most time here: supervised → validation → neural nets → clustering → PCA.";
  if(label.includes("AI")) return "Trace search algorithms, reason with logic, then do uncertainty/inference problems.";
  if(label.includes("Integrated")) return "Mix all 7 sections; use an error notebook to drive revision.";
  return "Full mock under exam conditions, then repair weak areas. No new heavy topics.";
}
function fmt(x){return new Date(x+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}

let currentSection="probability";
function renderTabs(){
  document.getElementById("sectionTabs").innerHTML=D.sections.map(s=>`<button class="tab ${s.id===currentSection?'active':''}" onclick="openSection('${s.id}')">0${s.num} ${esc(s.title)}</button>`).join("");
}
function renderDetail(id){
  const s=D.sections.find(x=>x.id===id); if(!s)return;
  document.getElementById("sectionDetail").innerHTML=`
    <div class="card">
      <div class="detail-head"><div><span class="eyebrow">SECTION ${s.num} · ${esc(s.range)}</span><h3>${esc(s.title)}</h3><p style="color:#9aa5bd;margin:0">${esc(s.short)}</p></div><span class="difficulty">${esc(s.difficulty)}</span></div>
      <div class="detail-grid">
        <div><div class="card-head"><h3>Syllabus checklist</h3></div><div class="topic-list">
          ${s.topics.map((t,i)=>`<label class="topic ${state.topics[topicKey(s,i)]?'done':''}"><input type="checkbox" ${state.topics[topicKey(s,i)]?'checked':''} onchange="toggleTopic('${s.id}',${i})"><span>${esc(t)}</span></label>`).join("")}
        </div></div>
        <div><div class="card-head"><h3>Date plan</h3></div><div class="plan-list">
          ${s.plan.map(p=>`<div class="plan-row"><b>${esc(p[0])}</b><span>${esc(p[1])}</span></div>`).join("")}
        </div></div>
      </div>
    </div>`;
  renderTabs();
}
function openSection(id){currentSection=id; document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));document.getElementById("sections").classList.add("active");document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.view==="sections"));renderDetail(id);window.scrollTo({top:0,behavior:"smooth"});}
function toggleTopic(id,i){state.topics[topicKey(D.sections.find(s=>s.id===id),i)]=!state.topics[topicKey(D.sections.find(s=>s.id===id),i)];save();}
function renderResources(){
  const all=[];
  D.sections.forEach(s=>s.resources.forEach(r=>all.push({s,r})));
  document.getElementById("resourceList").innerHTML=all.map(({s,r})=>`
    <article class="resource"><span class="eyebrow">SECTION ${s.num} · ${esc(s.title)}</span><h4>${esc(r[0])}</h4><p>${esc(r[2])}</p><a class="link-btn" href="${r[1]}" target="_blank" rel="noopener">Open resource ↗</a></article>`).join("");
}
function renderDaily(){
  const q=(document.getElementById("trackerSearch")?.value||"").toLowerCase();
  const f=document.getElementById("trackerFilter")?.value||"all";
  const list=D.daily.filter(x=>{
    const done=!!state.days[x.date];
    const match=(x.date+" "+x.label+" "+x.task).toLowerCase().includes(q);
    return match && (f==="all"||(f==="done"&&done)||(f==="todo"&&!done));
  });
  document.getElementById("dailyList").innerHTML=list.map(x=>`
    <label class="daily ${state.days[x.date]?'done':''}"><input type="checkbox" ${state.days[x.date]?'checked':''} onchange="toggleDay('${x.date}')"><time>${fmt(x.date)}</time><span><b style="color:#eef2ff">${esc(x.label)}</b> — ${esc(x.task)}</span></label>`).join("");
}
function toggleDay(d){state.days[d]=!state.days[d];save();}
function setupNav(){
  document.querySelectorAll(".nav-btn").forEach(btn=>btn.addEventListener("click",()=>{
    const id=btn.dataset.view; document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));document.getElementById(id).classList.add("active");
    document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b===btn));
    document.getElementById("pageTitle").textContent=({dashboard:"GATE DA 2027 Master Planner",roadmap:"123-Day Roadmap",sections:"7-Section Syllabus",resources:"Study Materials & Videos",mocks:"PYQs & Mock Tests",tracker:"Daily Checklist",gateDetails:"GATE 2027 Details",syllabusPdf:"DA Syllabus PDF"})[id];
    window.scrollTo({top:0,behavior:"smooth"});
  }));
}
function countdown(){
  const target=new Date("2027-02-05T23:59:59");
  const now=new Date(); let d=Math.max(0,Math.ceil((target-now)/86400000));
  document.getElementById("daysLeft").textContent=d;
}
function setupTheme(){
  const apply=()=>{document.documentElement.dataset.theme=state.theme;document.getElementById("themeBtn").textContent=state.theme==="dark"?"☀":"☾";};
  document.getElementById("themeBtn").onclick=()=>{state.theme=state.theme==="dark"?"light":"dark";save();apply();};
  if(state.theme==="light"){
    const style=document.createElement("style");style.id="lightStyle";style.textContent=`:root{--bg:#f4f6fb;--panel:#fff;--panel2:#f0f3f8;--text:#101525;--muted:#667085;--line:#dfe4ee;--shadow:0 12px 35px rgba(16,21,37,.08)}.sidebar,.topbar{background:rgba(244,246,251,.9)}.countdown{background:#fff}.bar{background:#e4e8f0}`;document.head.appendChild(style);
  } apply();
}
document.getElementById("trackerSearch").addEventListener("input",renderDaily);
document.getElementById("trackerFilter").addEventListener("change",renderDaily);
document.getElementById("resetBtn").onclick=()=>{if(confirm("Reset all checklist progress?")){localStorage.removeItem("gateDA2027");location.reload();}};
renderDashboard();renderTimeline();renderResources();renderDetail(currentSection);setupNav();setupTheme();countdown();updateAll();
setInterval(countdown,60000);
window.openSection=openSection;window.toggleTopic=toggleTopic;window.toggleDay=toggleDay;
// ===== THEME TOGGLE =====
const themeBtn = document.getElementById("themeBtn");

themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");

    const isLight = document.body.classList.contains("light-theme");

    themeBtn.textContent = isLight ? "☀" : "☾";

    localStorage.setItem("gateTheme", isLight ? "light" : "dark");
});

// Load saved theme
const savedTheme = localStorage.getItem("gateTheme");

if (savedTheme === "light") {
    document.body.classList.add("light-theme");
    themeBtn.textContent = "☀";
} else {
    themeBtn.textContent = "☾";
}