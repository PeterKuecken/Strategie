
const stateKey='kuecken_recruiting_cockpit_v11';
const todayKey=()=>new Date().toISOString().slice(0,10);
let state=JSON.parse(localStorage.getItem(stateKey)||'{}');
if(!state.checks)state.checks={}; if(!state.kpis)state.kpis={};
const nav=document.getElementById('nav'), view=document.getElementById('view'), searchInput=document.getElementById('searchInput');
let current='heute';
let selectedChapterIndex=null;

const publishSections = ['linkedin52','facebook52','videos52'];

function save(){localStorage.setItem(stateKey,JSON.stringify(state))}
function sectionById(id){return window.APP_CONTENT.sections.find(s=>s.id===id)}
function isPublishSection(id){return publishSections.includes(id)}

function renderNav(){
  nav.innerHTML='';
  window.APP_CONTENT.sections.forEach(s=>{
    const b=document.createElement('button');
    b.className='nav-btn'+(s.id===current?' active':'');
    b.textContent=s.navTitle || s.title;
    b.onclick=()=>go(s.id);
    nav.appendChild(b)
  })
}

function render(){
  renderNav();
  const q=searchInput.value.trim().toLowerCase();
  if(q)return renderSearch(q);
  const s=sectionById(current);
  if(!s)return;
  if(s.type==='dashboard')return renderDashboard(s);
  if(s.type==='kpi')return renderKpi(s);
  if(s.type==='links')return renderLinks(s);
  renderContent(s)
}

function renderDashboard(s){
  const d=todayKey();
  const peter = Array.isArray(s.peter) ? s.peter : [];
  const martina = Array.isArray(s.martina) ? s.martina : [];
  view.innerHTML=`<div class="card"><h2>${escapeHtml(s.title)}</h2><p>${escapeHtml(s.text||'Das tägliche Arbeitscockpit für Peter und Martina.')}</p></div>
  <div class="grid">
    <div class="card"><h3>Peter</h3>${peter.map((t,i)=>checkRow(`peter_${d}_${i}`,t)).join('')}</div>
    <div class="card"><h3>Martina</h3>${martina.map((t,i)=>checkRow(`martina_${d}_${i}`,t)).join('')}</div>
  </div>
  <div class="card"><h3>Schnellzugriff</h3>
    <button class="primary" onclick="go('schnellzugriff')">Alle Bereiche öffnen</button>
    <button class="primary" onclick="go('e9')">Vorlagen öffnen</button>
    <button class="primary" onclick="go('linkedin52')">LinkedIn öffnen</button>
    <button class="primary" onclick="go('facebook52')">Facebook öffnen</button>
    <button class="primary" onclick="go('videos52')">Videos öffnen</button>
  </div>${renderProgressOverview()}`
}

function renderLinks(s){
  view.innerHTML=`<div class="card"><h2>${escapeHtml(s.title)}</h2><p>Direkter Einstieg in die wichtigsten Bereiche.</p></div>
  <div class="link-grid">${(s.links||[]).map(l=>`<button class="link-card" onclick="go('${l.target}')">${escapeHtml(l.label)}</button>`).join('')}</div>${renderProgressOverview()}`;
}

function checkRow(key,label){
  return `<label class="checkrow"><input type="checkbox" ${state.checks[key]?'checked':''} onchange="toggleCheck('${key}',this.checked)"> <span>${escapeHtml(label)}</span></label>`
}
function toggleCheck(key,val){state.checks[key]=val;save()}

function go(id){
  current=id;
  selectedChapterIndex=null;
  searchInput.value='';
  render();
  setTimeout(()=>window.scrollTo({top:0,behavior:'smooth'}),0);
}

function openChapter(idx){
  selectedChapterIndex=idx;
  render();
  setTimeout(()=>window.scrollTo({top:0,behavior:'smooth'}),0);
}

function backToOverview(){
  selectedChapterIndex=null;
  render();
  setTimeout(()=>window.scrollTo({top:0,behavior:'smooth'}),0);
}

function renderContent(s){
  const chapters=s.chapters||[];
  if(selectedChapterIndex!==null && chapters[selectedChapterIndex]){
    return renderSingleChapter(s, chapters[selectedChapterIndex], selectedChapterIndex);
  }

  const isWeekly = isPublishSection(s.id);
  let html=`<div class="card"><h2>${escapeHtml(s.title)}</h2>${(s.tags||[]).map(t=>`<span class="badge">${escapeHtml(t)}</span>`).join('')}`;
  html+=`<p class="small">Wähle unten ein Kapitel. Es öffnet sich danach als eigene Seite.</p></div>`;

  if(isWeekly){
    html+=renderProgressOverviewForSection(s.id);
    html+=`<div class="week-list">`;
    chapters.forEach((c,idx)=>{
      const status = localStorage.getItem(`content_status_${s.id}_${idx}`)||'Offen';
      html+=`<button class="week-row status-row ${statusClass(status)}" onclick="openChapter(${idx})"><span>${escapeHtml(c.title)}</span><small>${escapeHtml(status)}</small></button>`;
    });
    html+=`</div>`;
  } else {
    html+=`<div class="chapter-list">`;
    chapters.forEach((c,idx)=>{
      html+=`<button class="chapter-row" onclick="openChapter(${idx})"><span>${escapeHtml(c.title)}</span><small>öffnen</small></button>`;
    });
    html+=`</div>`;
  }
  view.innerHTML=html;
}

function renderSingleChapter(s,c,idx){
  let html=`<div class="card single-page">
    <button class="copy-btn" onclick="backToOverview()">Zurück zur Übersicht</button>
    <h2>${escapeHtml(s.title)}</h2>
    <h3>${escapeHtml(c.title)}</h3>
  `;
  if(c.body)html+=`<div class="chapter-body">${escapeHtml(c.body)}</div>`;
  (c.templates||[]).forEach((t,ti)=>{
    const id=`single-${s.id}-${idx}-${ti}`;
    html+=`<div class="template" id="${id}">${escapeHtml(t)}</div><button class="copy-btn" onclick="copyFromElement('${id}')">Text kopieren</button>`;
  });
  html+=`</div>`;

  const prev = idx>0 ? `<button class="copy-btn" onclick="openChapter(${idx-1})">Vorheriges Kapitel</button>` : "";
  const next = idx<(s.chapters.length-1) ? `<button class="copy-btn" onclick="openChapter(${idx+1})">Nächstes Kapitel</button>` : "";

  let statusBlock = "";
  if(isPublishSection(s.id)){
    const statusKey=`content_status_${s.id}_${idx}`;
    const currentStatus=localStorage.getItem(statusKey)||'Offen';
    statusBlock=`<div class="status-control ${statusClass(currentStatus)}">
      <label><strong>Status dieses Inhalts:</strong></label>
      <select class="${statusClass(currentStatus)}" onchange="setContentStatus('${s.id}',${idx},this.value)">
        <option ${currentStatus==='Offen'?'selected':''}>Offen</option>
        <option ${currentStatus==='Geplant'?'selected':''}>Geplant</option>
        <option ${currentStatus==='Veröffentlicht'?'selected':''}>Veröffentlicht</option>
      </select>
    </div>`;
  }

  html+=`<div class="card">${statusBlock}${prev}${next}</div>`;
  view.innerHTML=html;
}

function statusClass(status){
  if(status==='Veröffentlicht') return 'status-published';
  if(status==='Geplant') return 'status-planned';
  return 'status-open';
}

async function copyFromElement(id){
  const el=document.getElementById(id);
  if(!el)return;
  const text=el.innerText || el.textContent || '';
  await copyText(text);
}

async function copyText(text){
  try{
    if(navigator.clipboard && window.isSecureContext){
      await navigator.clipboard.writeText(text);
      showCopyNotice('Text kopiert.');
      return;
    }
  }catch(e){}
  try{
    const ta=document.createElement('textarea');
    ta.value=text;
    ta.setAttribute('readonly','');
    ta.style.position='fixed';
    ta.style.top='-1000px';
    ta.style.left='-1000px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok=document.execCommand('copy');
    document.body.removeChild(ta);
    showCopyNotice(ok ? 'Text kopiert.' : 'Kopieren nicht möglich. Text bitte markieren.');
  }catch(e){
    showCopyNotice('Kopieren nicht möglich. Text bitte markieren.');
  }
}

function showCopyNotice(msg){
  let n=document.getElementById('copyNotice');
  if(!n){
    n=document.createElement('div');
    n.id='copyNotice';
    n.className='copy-notice';
    document.body.appendChild(n);
  }
  n.textContent=msg;
  n.classList.add('show');
  setTimeout(()=>n.classList.remove('show'),1600);
}

function getSectionProgress(sectionId){
  const s = sectionById(sectionId);
  if(!s || !s.chapters) return {total:0, published:0, planned:0, open:0};
  let total=s.chapters.length, published=0, planned=0, open=0;
  s.chapters.forEach((c,idx)=>{
    const val=localStorage.getItem(`content_status_${sectionId}_${idx}`)||'Offen';
    if(val==='Veröffentlicht') published++;
    else if(val==='Geplant') planned++;
    else open++;
  });
  return {total,published,planned,open};
}

function progressBar(sectionId,label){
  const p=getSectionProgress(sectionId);
  const pct=p.total ? Math.round((p.published/p.total)*100) : 0;
  return `<div class="progress-card">
    <div class="progress-head"><strong>${escapeHtml(label)}</strong><span>${p.published} von ${p.total} veröffentlicht</span></div>
    <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
    <div class="progress-meta">Geplant: ${p.planned} · Offen: ${p.open} · Fortschritt: ${pct}%</div>
  </div>`;
}

function renderProgressOverview(){
  return `<div class="card"><h3>Fortschritt Jahrespläne</h3>
    ${progressBar('linkedin52','LinkedIn Jahresplan')}
    ${progressBar('facebook52','Facebook Jahresplan')}
    ${progressBar('videos52','Video Jahresplan')}
  </div>`;
}

function renderProgressOverviewForSection(id){
  if(id==='linkedin52') return `<div class="card">${progressBar('linkedin52','LinkedIn Jahresplan')}</div>`;
  if(id==='facebook52') return `<div class="card">${progressBar('facebook52','Facebook Jahresplan')}</div>`;
  if(id==='videos52') return `<div class="card">${progressBar('videos52','Video Jahresplan')}</div>`;
  return "";
}

function setContentStatus(section, idx, value){
  localStorage.setItem(`content_status_${section}_${idx}`, value);
  showCopyNotice('Status gespeichert.');
  render();
}

function renderKpi(s){
  const d=todayKey();
  if(!state.kpis[d])state.kpis[d]={};
  view.innerHTML=`<div class="card"><h2>${escapeHtml(s.title)}</h2><p>${escapeHtml(s.text)}</p></div>
  <div class="card"><h3>Heute: ${d}</h3>${s.fields.map(f=>`<div class="kpi-row"><label>${escapeHtml(f)}</label><input type="number" min="0" value="${state.kpis[d][f]||''}" onchange="setKpi('${d}','${f}',this.value)"></div>`).join('')}</div>`
}
function setKpi(d,f,val){if(!state.kpis[d])state.kpis[d]={};state.kpis[d][f]=val;save()}

function renderSearch(q){
  selectedChapterIndex=null;
  let hits=[];
  window.APP_CONTENT.sections.forEach(s=>{
    if(JSON.stringify(s).toLowerCase().includes(q)){
      (s.chapters||[{title:s.title,body:s.text||''}]).forEach((c,idx)=>{
        if(JSON.stringify(c).toLowerCase().includes(q)||s.title.toLowerCase().includes(q))hits.push({section:s,chapter:c,idx})
      })
    }
  });
  let html=`<div class="card"><h2>Suche</h2><p>${hits.length} Treffer für „${escapeHtml(q)}“</p></div>`;
  hits.slice(0,120).forEach(h=>{
    html+=`<div class="card"><h3>${escapeHtml(h.section.title)}: ${escapeHtml(h.chapter.title)}</h3>`;
    if(h.chapter.body)html+=`<p>${escapeHtml(h.chapter.body).slice(0,700)}${h.chapter.body.length>700?'...':''}</p>`;
    (h.chapter.templates||[]).slice(0,2).forEach((t,idx)=>{
      const id='search-'+Math.random().toString(36).slice(2);
      html+=`<div class="template" id="${id}">${escapeHtml(t).slice(0,900)}${t.length>900?'...':''}</div><button class="copy-btn" onclick="copyFromElement('${id}')">Text kopieren</button>`;
    });
    html+=`<button class="copy-btn" onclick="current='${h.section.id}'; searchInput.value=''; selectedChapterIndex=${h.idx}; render(); window.scrollTo({top:0,behavior:'smooth'});">Kapitel öffnen</button></div>`;
  });
  view.innerHTML=html
}

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))
}

document.getElementById('resetBtn').onclick=()=>{
  const d=todayKey();
  Object.keys(state.checks).forEach(k=>{if(k.includes(d))delete state.checks[k]});
  state.kpis[d]={};
  save();
  render()
}
searchInput.addEventListener('input',()=>{selectedChapterIndex=null;render()});
render();
