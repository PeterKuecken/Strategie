
const stateKey='kuecken_recruiting_cockpit_v13';
const activityKey='kuecken_activity_v13';
const todayKey=()=>new Date().toISOString().slice(0,10);

let state=JSON.parse(localStorage.getItem(stateKey)||'{}');
if(!state.checks)state.checks={};
if(!state.kpis)state.kpis={};

let activity=JSON.parse(localStorage.getItem(activityKey)||'{}');

const nav=document.getElementById('nav');
const view=document.getElementById('view');
const searchInput=document.getElementById('searchInput');

let current='heute';
let selectedChapterIndex=null;
let selectedActivityDate=todayKey();

const publishSections=['linkedin52','facebook52','videos52'];

const activityConfig={
  peter:[
    {key:'whatsapp_kontakte', label:'WhatsApp Kontakte', target:5, channel:'WhatsApp'},
    {key:'whatsapp_nachfassungen', label:'WhatsApp Nachfassungen', target:5, channel:'WhatsApp'},
    {key:'facebook_kontakte', label:'Facebook Kontakte', target:5, channel:'Facebook'},
    {key:'linkedin_kontakte', label:'LinkedIn Kontakte', target:5, channel:'LinkedIn'},
    {key:'unternehmerkontakte', label:'Unternehmerkontakte', target:3, channel:'Unternehmer'},
    {key:'empfehlungen', label:'Empfehlungen', target:3, channel:'Empfehlungen'},
    {key:'beitraege', label:'Beiträge veröffentlicht', target:1, channel:'Sichtbarkeit'},
    {key:'videos', label:'Videos veröffentlicht', target:1, channel:'Video'}
  ],
  martina:[
    {key:'kontakte', label:'Kontakte', target:3, channel:'WhatsApp'},
    {key:'kundenkontakte', label:'Kundenkontakte', target:3, channel:'Kunden'},
    {key:'nachfassungen', label:'Nachfassungen', target:3, channel:'Nachfassen'},
    {key:'facebook_aktivitaet', label:'Facebook Aktivität', target:1, channel:'Facebook'},
    {key:'empfehlungen', label:'Empfehlungen', target:2, channel:'Empfehlungen'},
    {key:'beitraege', label:'Beiträge veröffentlicht', target:1, channel:'Sichtbarkeit'},
    {key:'videos', label:'Videos veröffentlicht', target:1, channel:'Video'}
  ]
};

function save(){localStorage.setItem(stateKey,JSON.stringify(state))}
function saveActivity(){localStorage.setItem(activityKey,JSON.stringify(activity))}
function sectionById(id){return window.APP_CONTENT.sections.find(s=>s.id===id)}
function isPublishSection(id){return publishSections.includes(id)}

function renderNav(){
  nav.innerHTML='';
  window.APP_CONTENT.sections.forEach(s=>{
    const b=document.createElement('button');
    b.className='nav-btn'+(s.id===current?' active':'');
    b.textContent=s.navTitle || s.title;
    b.onclick=()=>go(s.id);
    nav.appendChild(b);
  });
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
  renderContent(s);
}

function renderDashboard(s){
  view.innerHTML=`
    <div class="card">
      <h2>${escapeHtml(s.title || '1. Heute')}</h2>
      <p>${escapeHtml(s.text || 'Das tägliche Arbeitscockpit für Peter und Martina.')}</p>
    </div>
    ${renderActivityCockpit()}
    ${renderProgressOverview()}
  `;
}

function renderActivityCockpit(){
  const date=selectedActivityDate || todayKey();
  return `
    <div class="card">
      <h3>Tageserfassung</h3>
      <div class="date-row">
        <label>Datum wählen:</label>
        <input type="date" value="${date}" onchange="selectedActivityDate=this.value; ensureActivityDate(this.value); render()">
        <button class="copy-btn" onclick="selectedActivityDate=todayKey(); ensureActivityDate(selectedActivityDate); render()">Heute anzeigen</button>
      </div>
      <p class="small">Die Historie bleibt unbegrenzt im Browser gespeichert. Sie geht nur verloren, wenn der Browser-Speicher gelöscht wird.</p>
    </div>
    <div class="grid">
      ${renderPersonInput('peter','Peter',date)}
      ${renderPersonInput('martina','Martina',date)}
    </div>
    ${renderDailyLossAnalysis(date)}
    ${renderPeriodSummaries()}
    ${renderHistoryTable()}
  `;
}

function ensureActivityDate(date){
  if(!activity[date])activity[date]={peter:{},martina:{}};
  if(!activity[date].peter)activity[date].peter={};
  if(!activity[date].martina)activity[date].martina={};
}

function renderPersonInput(person,title,date){
  ensureActivityDate(date);
  const fields=activityConfig[person];
  const stats=calcPersonStatsForDate(person,date);
  return `<div class="card">
    <h3>${title}</h3>
    ${renderScoreBadge(stats.percent)}
    <div class="activity-inputs">
      ${fields.map(f=>{
        const val=activity[date][person][f.key] ?? '';
        const percent=calcPercent(Number(val||0),f.target);
        return `<div class="activity-row ${trafficClass(percent)}">
          <div>
            <strong>${escapeHtml(f.label)}</strong>
            <small>Soll: ${f.target} · Bereich: ${escapeHtml(f.channel)}</small>
          </div>
          <input type="number" min="0" value="${val}" onchange="setActivity('${date}','${person}','${f.key}',this.value)">
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

function setActivity(date,person,key,value){
  ensureActivityDate(date);
  const n=value==='' ? '' : Math.max(0, Number(value));
  activity[date][person][key]=n;
  saveActivity();
  render();
}

function calcPercent(actual,target){
  if(!target)return 100;
  return Math.min(100, Math.round((actual/target)*100));
}

function calcPersonStatsForDate(person,date){
  ensureActivityDate(date);
  let target=0, actual=0;
  activityConfig[person].forEach(f=>{
    target+=f.target;
    actual+=Number(activity[date][person][f.key]||0);
  });
  return {actual,target,percent:target?Math.round((actual/target)*100):0};
}

function renderScoreBadge(percent){
  return `<div class="score-badge ${trafficClass(percent)}">Erfüllung: ${percent}%</div>`;
}

function trafficClass(percent){
  if(percent>=80)return 'traffic-green';
  if(percent>=50)return 'traffic-yellow';
  return 'traffic-red';
}

function renderDailyLossAnalysis(date){
  return `<div class="card">
    <h3>Verlustanalyse für ${formatDate(date)}</h3>
    <div class="grid">
      ${renderLossList('peter','Peter',date)}
      ${renderLossList('martina','Martina',date)}
    </div>
  </div>`;
}

function renderLossList(person,title,date){
  ensureActivityDate(date);
  const losses=activityConfig[person].map(f=>{
    const actual=Number(activity[date][person][f.key]||0);
    const missing=Math.max(0,f.target-actual);
    const percent=calcPercent(actual,f.target);
    return {...f,actual,missing,percent};
  }).filter(x=>x.missing>0).sort((a,b)=>a.percent-b.percent || b.missing-a.missing);

  if(!losses.length){
    return `<div><h4>${title}</h4><p class="ok-text">Alles erfüllt. Kein Verlust in den geplanten Bereichen.</p></div>`;
  }
  return `<div><h4>${title}</h4>
    <table class="mini-table">
      <thead><tr><th>Bereich</th><th>Soll</th><th>Ist</th><th>Erfüllung</th></tr></thead>
      <tbody>
        ${losses.map(x=>`<tr class="${trafficClass(x.percent)}"><td>${escapeHtml(x.label)}</td><td>${x.target}</td><td>${x.actual}</td><td>${x.percent}%</td></tr>`).join('')}
      </tbody>
    </table>
  </div>`;
}

function getAllDates(){
  return Object.keys(activity).sort();
}

function datesInCurrentWeek(){
  const now=new Date();
  const start=new Date(now);
  const day=(start.getDay()+6)%7;
  start.setDate(start.getDate()-day);
  start.setHours(0,0,0,0);
  const end=new Date(start);
  end.setDate(end.getDate()+7);
  return getAllDates().filter(d=>{
    const x=new Date(d+'T00:00:00');
    return x>=start && x<end;
  });
}

function datesInCurrentMonth(){
  const now=new Date();
  const ym=now.toISOString().slice(0,7);
  return getAllDates().filter(d=>d.startsWith(ym));
}

function datesInCurrentYear(){
  const y=String(new Date().getFullYear());
  return getAllDates().filter(d=>d.startsWith(y));
}

function renderPeriodSummaries(){
  return `<div class="card">
    <h3>Auswertung nach Zeitraum</h3>
    <div class="grid">
      ${renderPeriodBox('Diese Woche',datesInCurrentWeek())}
      ${renderPeriodBox('Dieser Monat',datesInCurrentMonth())}
      ${renderPeriodBox('Dieses Jahr',datesInCurrentYear())}
    </div>
  </div>`;
}

function renderPeriodBox(label,dates){
  const peter=calcPeriodStats('peter',dates);
  const martina=calcPeriodStats('martina',dates);
  return `<div class="period-box">
    <h4>${label}</h4>
    <p><strong>Peter:</strong> ${peter.percent}% · Ist ${peter.actual} von Soll ${peter.target}</p>
    <p><strong>Martina:</strong> ${martina.percent}% · Ist ${martina.actual} von Soll ${martina.target}</p>
    <details>
      <summary>Verlustbereiche anzeigen</summary>
      ${renderPeriodLosses('Peter',peter.losses)}
      ${renderPeriodLosses('Martina',martina.losses)}
    </details>
  </div>`;
}

function calcPeriodStats(person,dates){
  let target=0, actual=0;
  const lossMap={};
  dates.forEach(date=>{
    ensureActivityDate(date);
    activityConfig[person].forEach(f=>{
      const a=Number(activity[date][person][f.key]||0);
      target+=f.target;
      actual+=a;
      if(!lossMap[f.key])lossMap[f.key]={label:f.label,channel:f.channel,target:0,actual:0};
      lossMap[f.key].target+=f.target;
      lossMap[f.key].actual+=a;
    });
  });
  const losses=Object.values(lossMap).map(x=>{
    x.percent=x.target?Math.round((x.actual/x.target)*100):0;
    x.missing=Math.max(0,x.target-x.actual);
    return x;
  }).filter(x=>x.missing>0).sort((a,b)=>a.percent-b.percent || b.missing-a.missing);
  return {target,actual,percent:target?Math.round((actual/target)*100):0,losses};
}

function renderPeriodLosses(title,losses){
  if(!losses.length)return `<p class="ok-text">${title}: keine Verlustbereiche.</p>`;
  return `<h5>${title}</h5><ul class="loss-list">
    ${losses.slice(0,8).map(x=>`<li>${escapeHtml(x.label)}: ${x.actual}/${x.target} · ${x.percent}% · Verlust ${x.missing}</li>`).join('')}
  </ul>`;
}

function renderHistoryTable(){
  const dates=getAllDates().sort().reverse();
  if(!dates.length)return `<div class="card"><h3>Historie</h3><p>Noch keine Tagesdaten gespeichert.</p></div>`;
  return `<div class="card">
    <h3>Historie nach Tagen</h3>
    <p class="small">Alle gespeicherten Tage werden angezeigt.</p>
    <div class="table-wrap">
      <table class="history-table">
        <thead><tr><th>Datum</th><th>Peter</th><th>Martina</th><th>Gesamt</th><th>Größte Verluste</th></tr></thead>
        <tbody>
          ${dates.map(d=>{
            const p=calcPersonStatsForDate('peter',d);
            const m=calcPersonStatsForDate('martina',d);
            const totalTarget=p.target+m.target;
            const totalActual=p.actual+m.actual;
            const total=totalTarget?Math.round((totalActual/totalTarget)*100):0;
            return `<tr>
              <td><button class="link-button" onclick="selectedActivityDate='${d}'; render(); window.scrollTo({top:0,behavior:'smooth'});">${formatDate(d)}</button></td>
              <td class="${trafficClass(p.percent)}">${p.percent}%</td>
              <td class="${trafficClass(m.percent)}">${m.percent}%</td>
              <td class="${trafficClass(total)}">${total}%</td>
              <td>${escapeHtml(shortLossSummary(d))}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

function shortLossSummary(date){
  const p=topLoss('peter',date);
  const m=topLoss('martina',date);
  return `Peter: ${p || 'kein Verlust'} · Martina: ${m || 'kein Verlust'}`;
}

function topLoss(person,date){
  ensureActivityDate(date);
  const losses=activityConfig[person].map(f=>{
    const a=Number(activity[date][person][f.key]||0);
    return {label:f.label,percent:calcPercent(a,f.target),missing:Math.max(0,f.target-a)};
  }).filter(x=>x.missing>0).sort((a,b)=>a.percent-b.percent || b.missing-a.missing);
  return losses[0] ? `${losses[0].label} ${losses[0].percent}%` : '';
}

function formatDate(date){
  const [y,m,d]=date.split('-');
  return `${d}.${m}.${y}`;
}

function renderLinks(s){
  view.innerHTML=`<div class="card"><h2>${escapeHtml(s.title)}</h2><p>Direkter Einstieg in die wichtigsten Bereiche.</p></div>
  <div class="link-grid">${(s.links||[]).map(l=>`<button class="link-card" onclick="go('${l.target}')">${escapeHtml(l.label)}</button>`).join('')}</div>${renderProgressOverview()}`;
}

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

  const isWeekly=isPublishSection(s.id);
  let html=`<div class="card"><h2>${escapeHtml(s.title)}</h2>${(s.tags||[]).map(t=>`<span class="badge">${escapeHtml(t)}</span>`).join('')}`;
  html+=`<p class="small">Wähle unten ein Kapitel. Es öffnet sich danach als eigene Seite.</p></div>`;

  if(isWeekly){
    html+=renderProgressOverviewForSection(s.id);
    html+=`<div class="week-list">`;
    chapters.forEach((c,idx)=>{
      const status=localStorage.getItem(`content_status_${s.id}_${idx}`)||'Offen';
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

  const prev=idx>0 ? `<button class="copy-btn" onclick="openChapter(${idx-1})">Vorheriges Kapitel</button>` : "";
  const next=idx<(s.chapters.length-1) ? `<button class="copy-btn" onclick="openChapter(${idx+1})">Nächstes Kapitel</button>` : "";

  let statusBlock="";
  if(isPublishSection(s.id)){
    const currentStatus=localStorage.getItem(`content_status_${s.id}_${idx}`)||'Offen';
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
  if(status==='Veröffentlicht')return 'status-published';
  if(status==='Geplant')return 'status-planned';
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
  const s=sectionById(sectionId);
  if(!s || !s.chapters)return {total:0,published:0,planned:0,open:0};
  let total=s.chapters.length,published=0,planned=0,open=0;
  s.chapters.forEach((c,idx)=>{
    const val=localStorage.getItem(`content_status_${sectionId}_${idx}`)||'Offen';
    if(val==='Veröffentlicht')published++;
    else if(val==='Geplant')planned++;
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
  if(id==='linkedin52')return `<div class="card">${progressBar('linkedin52','LinkedIn Jahresplan')}</div>`;
  if(id==='facebook52')return `<div class="card">${progressBar('facebook52','Facebook Jahresplan')}</div>`;
  if(id==='videos52')return `<div class="card">${progressBar('videos52','Video Jahresplan')}</div>`;
  return "";
}

function setContentStatus(section,idx,value){
  localStorage.setItem(`content_status_${section}_${idx}`,value);
  showCopyNotice('Status gespeichert.');
  render();
}

function renderKpi(s){
  const d=todayKey();
  if(!state.kpis[d])state.kpis[d]={};
  view.innerHTML=`<div class="card"><h2>${escapeHtml(s.title)}</h2><p>${escapeHtml(s.text)}</p></div>
  <div class="card"><h3>Heute: ${d}</h3>${s.fields.map(f=>`<div class="kpi-row"><label>${escapeHtml(f)}</label><input type="number" min="0" value="${state.kpis[d][f]||''}" onchange="setKpi('${d}','${f}',this.value)"></div>`).join('')}</div>`;
}

function setKpi(d,f,val){if(!state.kpis[d])state.kpis[d]={};state.kpis[d][f]=val;save()}

function renderSearch(q){
  selectedChapterIndex=null;
  let hits=[];
  window.APP_CONTENT.sections.forEach(s=>{
    if(JSON.stringify(s).toLowerCase().includes(q)){
      (s.chapters||[{title:s.title,body:s.text||''}]).forEach((c,idx)=>{
        if(JSON.stringify(c).toLowerCase().includes(q)||s.title.toLowerCase().includes(q))hits.push({section:s,chapter:c,idx});
      });
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
  view.innerHTML=html;
}

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

document.getElementById('resetBtn').onclick=()=>{
  const d=todayKey();
  Object.keys(state.checks).forEach(k=>{if(k.includes(d))delete state.checks[k]});
  state.kpis[d]={};
  save();
  render();
};

searchInput.addEventListener('input',()=>{selectedChapterIndex=null;render()});
ensureActivityDate(todayKey());
render();
