
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


const fieldHelp = {
  peter: {
    whatsapp_kontakte: {
      goal: "Jeden Tag neue Gespräche über WhatsApp starten.",
      counts: "Neue Kontakte anschreiben, Rückmeldungen beantworten und Gespräche beginnen.",
      notCounts: "Status posten, Nachrichten nur lesen oder Gruppenbeiträge ohne persönliches Gespräch.",
      actionLow: "Gehe dein Telefonbuch durch, aktiviere alte Kontakte, schreibe Empfehlungen an und starte 5 persönliche Nachrichten.",
      actionOk: "Ziel erreicht. Vereinbare jetzt Termine oder plane konkrete Nachfassungen.",
      focus: "Peter nutzt WhatsApp vor allem für direkte Kontakte, alte Bekanntschaften, Empfehlungen und schnelle Terminvereinbarungen."
    },
    whatsapp_nachfassungen: {
      goal: "Bestehende Kontakte weiterentwickeln.",
      counts: "Erinnerung senden, offene Frage klären, Termin anbieten oder Rückmeldung zum letzten Gespräch einholen.",
      notCounts: "Nur Emoji senden oder ohne klare Frage schreiben.",
      actionLow: "Öffne deine letzten Chats und fasse 5 offene Gespräche nach. Frage konkret nach dem nächsten Schritt.",
      actionOk: "Ziel erreicht. Prüfe, welche Nachfassungen nun zu Terminen werden können.",
      focus: "Peter nutzt Nachfassungen, um Gespräche nicht versanden zu lassen."
    },
    facebook_kontakte: {
      goal: "Neue Gespräche über Facebook aufbauen.",
      counts: "Sinnvoll kommentieren, Freundschaftsanfrage senden, persönliche Nachricht starten.",
      notCounts: "Nur scrollen, nur liken oder Beiträge lesen.",
      actionLow: "Kommentiere bei 5 passenden Kontakten und schreibe 3 persönliche Nachrichten.",
      actionOk: "Ziel erreicht. Entwickle die Kontakte in private Gespräche weiter.",
      focus: "Peter nutzt Facebook für persönliche Sichtbarkeit und warme Kontakte."
    },
    linkedin_kontakte: {
      goal: "Unternehmer und Selbständige erreichen.",
      counts: "Kontaktanfragen, Kommentare bei Unternehmern, private Erstnachrichten.",
      notCounts: "Nur Profilbesuche oder passives Lesen.",
      actionLow: "Suche Selbständige, Geschäftsführer und Inhaber im Raum Kassel plus 50 km. Sende 5 Kontaktanfragen.",
      actionOk: "Ziel erreicht. Starte jetzt aus den neuen Kontakten echte Gespräche.",
      focus: "Peter nutzt LinkedIn gezielt für Unternehmer, Inhaber, Geschäftsführer und Entscheider."
    },
    unternehmerkontakte: {
      goal: "Echte Unternehmergespräche anstoßen.",
      counts: "Telefonat, Nachricht, persönlicher Kontakt oder Terminvereinbarung mit Unternehmern.",
      notCounts: "Nur Liste erstellen oder Website anschauen.",
      actionLow: "Wähle 5 regionale Unternehmer aus und kontaktiere mindestens 3 davon persönlich.",
      actionOk: "Ziel erreicht. Frage nach Empfehlungen zu weiteren Unternehmern.",
      focus: "Peter fokussiert Handwerk, Mittelstand, Dienstleister und Unternehmernetzwerke."
    },
    empfehlungen: {
      goal: "Aktiv neue Namen und Kontakte erhalten.",
      counts: "Konkrete Empfehlungsfrage stellen und Name oder Kontakt erhalten.",
      notCounts: "Nur allgemein über Empfehlungen sprechen.",
      actionLow: "Stelle heute mindestens 3 konkrete Empfehlungsfragen: Wer fällt dir spontan ein?",
      actionOk: "Ziel erreicht. Sorge jetzt für Kontaktfreigabe und Termin.",
      focus: "Peter fragt nach Unternehmern, Selbständigen, Vertrieblern und Menschen mit Veränderungswunsch."
    },
    beitraege: {
      goal: "Sichtbarkeit aufbauen.",
      counts: "LinkedIn-, Facebook- oder WhatsApp-Beitrag veröffentlicht.",
      notCounts: "Nur Entwurf schreiben.",
      actionLow: "Wähle einen fertigen Beitrag aus dem Jahresplan und veröffentliche ihn heute.",
      actionOk: "Ziel erreicht. Beobachte Reaktionen und starte Gespräche aus Kommentaren.",
      focus: "Peter veröffentlicht Erfahrung, Unternehmertum und Menschlichkeit."
    },
    videos: {
      goal: "Persönlichkeit sichtbar machen.",
      counts: "Video aufgenommen oder veröffentlicht.",
      notCounts: "Nur über Video nachdenken.",
      actionLow: "Nimm ein 2-Minuten-Video aus dem Video-Jahresplan auf. Perfektion ist nicht das Ziel.",
      actionOk: "Ziel erreicht. Teile das Video zusätzlich im WhatsApp-Status.",
      focus: "Peter nutzt Videos für Vertrauen, Erfahrung und persönliche Nähe."
    }
  },
  martina: {
    kontakte: {
      goal: "Persönliche Gespräche starten.",
      counts: "Neue oder bestehende Kontakte anschreiben, Rückmeldungen beantworten, Gespräch beginnen.",
      notCounts: "Nur lesen oder Status anschauen.",
      actionLow: "Schreibe 3 persönliche Kontakte an. Nutze Alltag, Interesse und Beziehung als Einstieg.",
      actionOk: "Ziel erreicht. Prüfe, welche Kontakte für Kundenpflege oder Empfehlungen geeignet sind.",
      focus: "Martina nutzt Kontakte für persönliche Nähe und alltagsnahe Gespräche."
    },
    kundenkontakte: {
      goal: "Bestandskunden pflegen und reaktivieren.",
      counts: "Serviceanruf, WhatsApp-Nachricht, Rückfrage zur Nutzung, Einladung zum Austausch.",
      notCounts: "Nur Kundendaten ansehen.",
      actionLow: "Wähle 3 Kunden aus und frage nach Zufriedenheit, Nutzung und offenen Fragen.",
      actionOk: "Ziel erreicht. Frage bei zufriedenen Kunden nach Empfehlungen.",
      focus: "Martina fokussiert Bestandskunden, Empfehlungsgeber und Interessenten."
    },
    nachfassungen: {
      goal: "Offene Gespräche weiterführen.",
      counts: "Klare Nachfrage, Terminfrage, Erinnerung oder nächste Entscheidung anstoßen.",
      notCounts: "Nur belanglos melden ohne Richtung.",
      actionLow: "Öffne 3 offene Chats und frage: Was ist aus deiner Sicht der nächste sinnvolle Schritt?",
      actionOk: "Ziel erreicht. Plane die nächste Wiedervorlage.",
      focus: "Martina nutzt Nachfassungen freundlich, ruhig und verbindlich."
    },
    facebook_aktivitaet: {
      goal: "Sichtbarkeit und Beziehung über Facebook stärken.",
      counts: "Beitrag, Story, Kommentar oder persönlicher Messenger-Einstieg.",
      notCounts: "Nur scrollen oder fremde Beiträge lesen.",
      actionLow: "Poste eine persönliche Beobachtung oder kommentiere bei 5 passenden Kontakten.",
      actionOk: "Ziel erreicht. Starte aus Reaktionen persönliche Gespräche.",
      focus: "Martina zeigt Alltag, Lebenserfahrung, gemeinsame Entwicklung und Zusatzeinkommen."
    },
    empfehlungen: {
      goal: "Neue Kontakte aus bestehenden Beziehungen erhalten.",
      counts: "Konkrete Frage stellen und Namen oder Kontakt erhalten.",
      notCounts: "Nur hoffen, dass jemand empfiehlt.",
      actionLow: "Frage 2 zufriedene Kunden oder Bekannte: Wer fällt dir spontan ein?",
      actionOk: "Ziel erreicht. Bitte um kurze Kontaktfreigabe.",
      focus: "Martina fragt besonders bei Kunden, Bekannten und Menschen mit Vertrauen."
    },
    beitraege: {
      goal: "Regelmäßig sichtbar bleiben.",
      counts: "Facebook-, WhatsApp- oder LinkedIn-Beitrag veröffentlicht.",
      notCounts: "Nur Entwurf schreiben.",
      actionLow: "Veröffentliche einen kurzen Beitrag aus Alltag, Erfahrung oder Kundenpflege.",
      actionOk: "Ziel erreicht. Beobachte Reaktionen und antworte persönlich.",
      focus: "Martina postet alltagsnah, menschlich und glaubwürdig."
    },
    videos: {
      goal: "Vertrauen durch persönliche Ansprache schaffen.",
      counts: "Video aufgenommen oder veröffentlicht.",
      notCounts: "Nur Video planen.",
      actionLow: "Nimm ein kurzes 60- bis 90-Sekunden-Video auf. Thema: persönliche Erfahrung oder Gedanke des Tages.",
      actionOk: "Ziel erreicht. Nutze das Video auch im WhatsApp-Status.",
      focus: "Martina wirkt über Alltag, Authentizität und persönliche Perspektive."
    }
  }
};

function fieldExplanation(person, key, actual, target){
  const h = fieldHelp[person] && fieldHelp[person][key];
  if(!h) return "";
  const ok = Number(actual) >= Number(target);
  return `<details class="field-help">
    <summary>Erklärung und nächster Schritt</summary>
    <p><strong>Ziel:</strong> ${escapeHtml(h.goal)}</p>
    <p><strong>Das zählt:</strong> ${escapeHtml(h.counts)}</p>
    <p><strong>Das zählt nicht:</strong> ${escapeHtml(h.notCounts)}</p>
    <p><strong>Fokus:</strong> ${escapeHtml(h.focus)}</p>
    <p class="${ok ? 'traffic-green' : 'traffic-red'}"><strong>Empfehlung:</strong> ${escapeHtml(ok ? h.actionOk : h.actionLow)}</p>
  </details>`;
}

function fieldInterpretation(person, f, actual){
  const ok = Number(actual) >= Number(f.target);
  const diff = Number(actual) - Number(f.target);
  if(ok){
    return `${f.label}: ${actual} von ${f.target}. Im Soll oder darüber. Nächster Schritt: Ergebnis in Gespräche, Termine oder Empfehlungen umwandeln.`;
  }
  return `${f.label}: ${actual} von ${f.target}. Es fehlen ${Math.abs(diff)}. Nächster Schritt: ${fieldHelp[person]?.[f.key]?.actionLow || 'Heute gezielt nacharbeiten.'}`;
}

function renderDeepRecommendations(person, title, date){
  ensureActivityDate(date);
  const rows = activityConfig[person].map(f=>{
    const actual = Number(activity[date][person][f.key] || 0);
    return {f, actual, ok: actual >= f.target};
  });
  const weak = rows.filter(r=>!r.ok);
  const strong = rows.filter(r=>r.ok);
  return `<div class="card">
    <h3>Handlungsempfehlungen ${escapeHtml(title)}</h3>
    <h4>Unter Soll</h4>
    ${weak.length ? `<ul class="loss-list">${weak.map(r=>`<li class="traffic-red">${escapeHtml(fieldInterpretation(person,r.f,r.actual))}</li>`).join('')}</ul>` : `<p class="ok-text">Alle Tätigkeitsbereiche sind im Soll.</p>`}
    <h4>Im Soll oder darüber</h4>
    ${strong.length ? `<ul class="loss-list">${strong.map(r=>`<li class="traffic-green">${escapeHtml(fieldInterpretation(person,r.f,r.actual))}</li>`).join('')}</ul>` : `<p>Noch kein Bereich im Soll.</p>`}
  </div>`;
}

function renderWeekMonthYearGuidance(){
  return `<div class="card">
    <h3>So liest du die Auswertungen</h3>
    <p><strong>Woche:</strong> Zeigt, ob die tägliche Umsetzung stabil genug ist. Wenn ein Bereich rot ist, blocke für die nächste Woche feste Arbeitszeit.</p>
    <p><strong>Monat:</strong> Zeigt Gewohnheiten. Rot im Monat bedeutet, dass der Bereich nicht zufällig schwach war, sondern zu wenig Priorität hatte.</p>
    <p><strong>Jahr:</strong> Zeigt den größten Hebel. Dort, wo über Monate rot bleibt, verliert ihr Reichweite, Gespräche und Partnerchancen.</p>
    <p><strong>Konkrete Regel:</strong> Rot wird nicht diskutiert. Rot wird geplant. Lege für jeden roten Bereich sofort eine feste Aktion für morgen fest.</p>
  </div>`;
}

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
      <h2>${escapeHtml(s.title || '1. Arbeitscockpit')}</h2>
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
    ${renderDailyLossAnalysis(date)}${renderDeepRecommendations('peter','Peter',date)}${renderDeepRecommendations('martina','Martina',date)}
    ${renderPeriodSummaries()}${renderWeekMonthYearGuidance()}
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
        return `<div class="activity-row ${targetClass(Number(val||0), f.target)}">
          <div>
            <strong>${escapeHtml(f.label)}</strong>
            <small>Soll: ${f.target} · Bereich: ${escapeHtml(f.channel)}</small>
          </div>
          <input type="number" min="0" value="${val}" onchange="setActivity('${date}','${person}','${f.key}',this.value)">
        </div>${fieldExplanation(person, f.key, Number(val||0), f.target)}`;
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
  if(percent>=100)return 'traffic-green';
  return 'traffic-red';
}

function targetClass(actual,target){
  return Number(actual) >= Number(target) ? 'traffic-green' : 'traffic-red';
}

function targetStatus(actual,target){
  return Number(actual) >= Number(target) ? 'Im Soll' : 'Unter Soll';
}

function renderDailyLossAnalysis(date){
  return `<div class="card">
    <h3>Tätigkeitsergebnis für ${formatDate(date)}</h3>
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
    return `<div><h4>${title}</h4><p class="ok-text">Alles erfüllt. Kein Unter Soll in den geplanten Bereichen.</p></div>`;
  }
  const allRows=activityConfig[person].map(f=>{
    const actual=Number(activity[date][person][f.key]||0);
    const percent=calcPercent(actual,f.target);
    return {...f,actual,percent};
  });
  return `<div><h4>${title}</h4>
    <table class="mini-table">
      <thead><tr><th>Bereich</th><th>Soll</th><th>Ist</th><th>Status</th><th>Erfüllung</th></tr></thead>
      <tbody>
        ${allRows.map(x=>`<tr class="${targetClass(x.actual,x.target)}"><td>${escapeHtml(x.label)}</td><td>${x.target}</td><td>${x.actual}</td><td>${targetStatus(x.actual,x.target)}</td><td>${x.percent}%</td></tr>`).join('')}
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
    <p class="${targetClass(peter.actual,peter.target)}"><strong>Peter:</strong> ${peter.percent}% · Ist ${peter.actual} von Soll ${peter.target} · ${targetStatus(peter.actual,peter.target)}</p>
    <p class="${targetClass(martina.actual,martina.target)}"><strong>Martina:</strong> ${martina.percent}% · Ist ${martina.actual} von Soll ${martina.target} · ${targetStatus(martina.actual,martina.target)}</p>
    <details>
      <summary>Tätigkeitsbereiche anzeigen</summary>
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
  if(!losses.length)return `<p class="ok-text">${title}: keine Tätigkeitsbereiche.</p>`;
  return `<h5>${title}</h5><ul class="loss-list">
    ${losses.slice(0,8).map(x=>`<li>${escapeHtml(x.label)}: ${x.actual}/${x.target} · ${x.percent}% · Unter Soll ${x.missing}</li>`).join('')}
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
        <thead><tr><th>Datum</th><th>Peter</th><th>Martina</th><th>Gesamt</th><th>Tätigkeitsergebnis</th></tr></thead>
        <tbody>
          ${dates.map(d=>{
            const p=calcPersonStatsForDate('peter',d);
            const m=calcPersonStatsForDate('martina',d);
            const totalTarget=p.target+m.target;
            const totalActual=p.actual+m.actual;
            const total=totalTarget?Math.round((totalActual/totalTarget)*100):0;
            return `<tr>
              <td><button class="link-button" onclick="selectedActivityDate='${d}'; render(); window.scrollTo({top:0,behavior:'smooth'});">${formatDate(d)}</button></td>
              <td class="${targetClass(p.actual,p.target)}">${p.percent}%</td>
              <td class="${targetClass(m.actual,m.target)}">${m.percent}%</td>
              <td class="${targetClass(totalActual,totalTarget)}">${total}%</td>
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
  return `Peter: ${p || 'alles im Soll'} · Martina: ${m || 'alles im Soll'}`;
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
