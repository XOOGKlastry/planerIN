import {DAY_NAMES,JOB_TYPES,norm,text,uid,hash,isoDate,addDays,monday,today,defaultState,parseRows,mergeImport,removeImport,makeVisits,rankCandidates,routeSummary,exactRoute,validCoords,parseCoordinates,formatDuration,googleMapsUrl,googleSearchUrl,bookingUrl,streetViewUrl,haversine,validateBackup,parseParcelWkt} from './core.js';
import {resolveLocation,fetchMatrix,findMaterialYards,fetchRoute,findParcelAt,matrixKey,SERVICES,GESUT_LAYERS} from './network.js';
import {loadState,persistState} from './storage.js';

const $=s=>document.querySelector(s),root=$('#app'),modal=$('#modal');
const ALL_DAYS=[0,1,2,3,4];
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons={calendar:'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z',list:'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',upload:'M12 16V3m-5 5 5-5 5 5M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4',download:'M12 3v13m-5-5 5 5 5-5M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3',settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM4 4l3 1 2-3h6l2 3 3-1 2 5-2 3 2 3-2 5-3-1-2 3H9l-2-3-3 1-2-5 2-3-2-3Z',route:'M6 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm12 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM9 6h6a4 4 0 0 1 0 8H9a3 3 0 0 0 0 6h6',arrow:'m5 12 14-8-5 16-2-6-7-2Z',pin:'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',home:'m3 10 9-7 9 7M5 9v12h14V9M9 21v-8h6v8',check:'m5 12 4 4L19 6',close:'m6 6 12 12M6 18 18 6',clock:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v5l3 2',phone:'M6 3H3v4c0 8 6 14 14 14h4v-5l-5-2-2 2c-4-1-6-3-7-7l2-2-3-4Z',more:'M5 12h.01M12 12h.01M19 12h.01',up:'m6 15 6-6 6 6',down:'m6 9 6 6 6-6',left:'m14 6-6 6 6 6',right:'m10 6 6 6-6 6',file:'M14 2H5a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8l-6-6Zm0 0v6h6M8 13h8M8 17h5',plus:'M12 5v14M5 12h14',alert:'m12 3 10 18H2L12 3Zm0 6v5m0 3h.01',map:'m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Zm6-2v16m6-14v16',lock:'M7 10V7a5 5 0 1 1 10 0v3M5 10h14v11H5V10Zm7 4v3',share:'M12 16V2m-4 4 4-4 4 4M7 9H4v12h16V9h-3',target:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v3m0 14v3M2 12h3m14 0h3M5 5a10 10 0 0 1 14 14A10 10 0 0 1 5 5Z',wifi:'M3 8a15 15 0 0 1 18 0M6 12a10 10 0 0 1 12 0M9 16a5 5 0 0 1 6 0M12 20h.01',refresh:'M20 7v5h-5M4 17v-5h5M5 8a8 8 0 0 1 13-3l2 7M4 12l2 7a8 8 0 0 0 13-3',play:'m8 4 13 8-13 8V4Z',edit:'m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-4-4L5 15l-1 5Z',moon:'M20 14a8 8 0 1 1-9-9 7 7 0 0 0 9 9Z',eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',layers:'m12 3 9 5-9 5-9-5 9-5Z M3 13l9 5 9-5 M3 17l9 5 9-5'};
// A little peg-person marker (Street View "pegman" style) drawn filled, not stroked, so it reads at a
// glance — the generic eye icon disappeared next to the other buttons.
const pegmanSvg='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="5.2" r="3.2" fill="currentColor"/><path d="M12 9.5c-3 0-5 4.6-5 12.5h2.3l.9-8 .8 8h2l.8-8 .9 8H15c0-7.9-2-12.5-5-12.5Z" fill="currentColor"/></svg>';
// One accent colour per day of the week (Mon..Sun) — used for that day's route line and already-placed
// pins on the day map, and echoed as a small marker on its tile. Matched by index to the .map-pin.dayN
// classes in styles.css; no meaning beyond telling the seven days apart at a glance.
const DAY_COLORS=['#2f6fed','#16a34a','#d97706','#db2777','#7c3aed','#0891b2','#b91c1c'];
const icon=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${icons[name]||icons.list}"/></svg>`;
let state=defaultState(),view='week',selectedDay=0,busy=false,map=null,miniMap=null,toastTimer,search='',filter='all',selectedVisit=null,geoCandidates=[],geoTarget=null,importPreview=null,waitingWorker=null,deferredInstall=null,cancelGeo=false,saveError=null;
const selectedJobs=()=>state.jobs.filter(j=>j.week===state.settings.week&&(!state.settings.crew||j.crew===state.settings.crew));
const currentVisits=()=>makeVisits(selectedJobs(),state.locations);
const planKey=()=>`${state.settings.week}|${state.settings.crew||'*'}`;
const currentPlan=()=>state.plans[planKey()];
const formatDate=date=>new Date(`${date}T12:00:00`).toLocaleDateString('pl-PL',{day:'numeric',month:'long'});
const routeKey=(base,visits)=>validCoords(base)?hash(JSON.stringify([base.lat,base.lng,...visits.flatMap(v=>[v.id,v.location.lat,v.location.lng])])):'';
const matrixVisits=()=>{const p=currentPlan(),all=currentVisits();return (p?.matrix?.visitIds||[]).map(id=>all.find(v=>v.id===id)).filter(Boolean);};
function matrixValid(){const p=currentPlan(),vs=matrixVisits();return !!p?.matrix&&validCoords(state.settings.base)&&vs.length===p.matrix.visitIds.length&&p.matrix.key===matrixKey(state.settings.base,vs);}
function dayRoute(day){const all=currentVisits();return (currentPlan()?.routes?.[day]||[]).map(id=>all.find(v=>v.id===id)).filter(Boolean);}
// Ids already routed onto one of the plannable weekdays. A visit left over from when Saturday/Sunday
// were still selectable days doesn't count as placed — it resurfaces in the pool instead of vanishing.
function placedVisitIds(){return new Set(Object.entries(currentPlan()?.routes||{}).filter(([d])=>ALL_DAYS.includes(Number(d))).flatMap(([,ids])=>ids||[]));}
// Day-agnostic pairwise cost: the fetched matrix, padded for any visit it hasn't seen yet.
function baseCostContext(){
  const p=currentPlan(),vs=matrixVisits();let cost=matrixValid()?p.matrix.durations:null;
  for(const visit of currentVisits())if(!vs.some(v=>v.id===visit.id))vs.push(visit);
  if(cost&&cost.length<vs.length+1)cost=Array.from({length:vs.length+1},(_,i)=>Array.from({length:vs.length+1},(_,j)=>i===j?0:(cost[i]?.[j]??Infinity)));
  return {vs,cost};
}
// A day normally starts from base (index 0). If the day before ended with an overnight stay, it starts
// from that stop instead — only within the same week, so the very first day of a week always starts at base.
function dayAnchorIndex(day,vs){
  if(day<=0)return 0;
  const prevPlan=currentPlan();if(!prevPlan?.overnight?.[day-1])return 0;
  const lastId=(prevPlan.routes?.[day-1]||[]).at(-1);if(!lastId)return 0;
  const idx=vs.findIndex(v=>v.id===lastId);return idx>=0?idx+1:0;
}
function dayCostContext(day){
  const {vs,cost:baseCost}=baseCostContext();let cost=baseCost;
  const p=currentPlan(),route=dayRoute(day),anchor=dayAnchorIndex(day,vs);
  const geometry=anchor===0?p?.geometries?.[routeKey(state.settings.base,route)]:null;
  if(cost&&geometry?.legs?.length===route.length+1){cost=cost.map(r=>r.slice());let prev=0;for(let i=0;i<route.length;i++){const next=vs.findIndex(v=>v.id===route[i].id)+1;if(next>0){cost[prev][next]=geometry.legs[i].duration;prev=next;}}cost[prev][0]=geometry.legs.at(-1).duration;}
  return {vs,cost,anchor};
}
function dayDriving(day){const {vs,cost,anchor}=dayCostContext(day);const ids=currentPlan()?.routes?.[day]||[];return routeSummary(ids,vs.length?vs:currentVisits(),cost,anchor);}
function dayDistance(day){const p=currentPlan(),route=dayRoute(day);if(!route.length)return 0;const geometry=p?.geometries?.[routeKey(state.settings.base,route)];if(geometry)return geometry.distance; if(!matrixValid()||!p.matrix.distances)return null;let result=0,prev=0;for(const v of route){const i=p.matrix.visitIds.indexOf(v.id)+1,value=p.matrix.distances[prev]?.[i];if(!Number.isFinite(value))return null;result+=value;prev=i;}const back=p.matrix.distances[prev]?.[0];return Number.isFinite(back)?result+back:null;}
// Remaining pool for the week, ranked by travel time from the last stop already on this day (or the day's anchor if empty).
function nextStopCandidates(day){
  const {vs,cost,anchor}=dayCostContext(day);if(!cost)return null;
  const route=dayRoute(day),placed=placedVisitIds();
  const pool=currentVisits().filter(v=>!placed.has(v.id)&&validCoords(v.location)&&!v.blocked);
  const poolIndices=pool.map(v=>vs.findIndex(a=>a.id===v.id)+1).filter(i=>i>0);
  if(!poolIndices.length)return [];
  const lastId=route.at(-1)?.id,fromIndex=lastId?vs.findIndex(v=>v.id===lastId)+1:anchor;
  return rankCandidates(fromIndex,poolIndices,cost).map(r=>({...r,visit:vs[r.index-1]}));
}
// Flags a visit that's suspiciously close (under 10 minutes' drive) to another one anywhere in the
// week's pool — usually a near-duplicate address, or two points worth bundling into a single dojazd.
function proximityWarning(visitId){
  const {vs,cost}=baseCostContext();if(!cost)return null;
  const i=vs.findIndex(v=>v.id===visitId)+1;if(i<=0)return null;
  let best=null;
  for(let j=1;j<=vs.length;j++){
    if(j===i)continue;
    const a=cost[i]?.[j],b=cost[j]?.[i],seconds=Math.min(Number.isFinite(a)?a:Infinity,Number.isFinite(b)?b:Infinity);
    if(Number.isFinite(seconds)&&(!best||seconds<best.seconds))best={seconds,visit:vs[j-1]};
  }
  return best&&best.seconds<600?best:null;
}
function locationTitle(l){return [l.code,l.city].filter(Boolean).join(' · ')||l.label||'Adres';}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),6500);}
async function save({redraw=true}={}){state.updatedAt=new Date().toISOString();try{await persistState(state);saveError=null;}catch(error){saveError=error.message;toast(error.message);}if(redraw)render();}
function showModal(title,body,footer=''){if(miniMap){miniMap.remove();miniMap=null;}if(workMap){workMap.remove();workMap=null;}modal.innerHTML=`<div class="modal-header"><h2 id="modal-title">${esc(title)}</h2><button class="icon quiet" data-act="close" aria-label="Zamknij">${icon('close')}</button></div><div class="modal-content">${body}</div>${footer?`<div class="modal-footer">${footer}</div>`:''}`;if(!modal.open)modal.showModal();}
function closeModal(){if(busy)return toast('Poczekaj na zakończenie operacji.');modal.close();if(miniMap){miniMap.remove();miniMap=null;}if(workMap){workMap.remove();workMap=null;}}
function notice(message,action='',kind=''){return `<div class="notice ${kind}">${icon('alert')}<div class="grow">${message}</div>${action}</div>`;}
function render(){
  if(map){map.remove();map=null;}
  const jobs=selectedJobs(),vs=currentVisits(),unready=vs.filter(v=>!validCoords(v.location)||v.blocked),p=currentPlan();
  const nav=[['week','calendar','Tydzień'],['jobs','list','Zlecenia'],['import','upload','Import'],['settings','settings','Ustawienia']];
  const navHtml=mobile=>nav.map(([id,sym,label])=>`<button class="${mobile?'':'nav-item '}${view===id?'active':''}" data-act="view" data-view="${id}">${icon(sym)}<span>${label}</span>${!mobile&&id==='jobs'&&jobs.length?`<span class="badge-count">${jobs.length}</span>`:''}</button>`).join('');
  const titles={week:'Plan tygodnia',jobs:'Zlecenia',import:'Import planu',settings:'Ustawienia ekipy'};
  root.innerHTML=`<div class="shell"><aside class="sidebar"><div class="brand"><span class="brand-mark">P</span><span>PaczkoPlan<small>Plan ekipy</small></span></div><nav class="side-nav">${navHtml(false)}</nav><div class="side-bottom"><button data-act="export">${icon('share')}Przekaż plan</button><button data-act="install">${icon('download')}Zainstaluj</button><div class="side-note">Zapis na tym urządzeniu.<br>Nawigacja w Google Maps.</div></div></aside><main class="main"><header class="topbar"><div class="header-title"><div class="eyebrow">PaczkoPlan / ekipa w terenie</div><h1>${titles[view]}</h1><p>${view==='week'?`${formatDate(state.settings.week)} – ${formatDate(addDays(state.settings.week,ALL_DAYS.at(-1)))} ${state.settings.week.slice(0,4)}`:view==='jobs'?`${jobs.length} zleceń · ${vs.length} wizyt`:view==='import'?'Excel lub zapisany plan od kolegi':'Miejsce startu'}</p></div>${view==='week'?`<div class="top-actions"><button data-act="choose-excel">${icon('upload')}Importuj Excel</button><button data-act="refresh-matrix" ${busy||!jobs.length?'disabled':''}>${icon('route')}${busy?'Liczę…':'Policz odległości'}</button><button class="primary" data-act="optimize-day" ${busy||dayRoute(selectedDay).length<2?'disabled':''}>${icon('route')}Optymalizuj trasę</button></div>`:view==='jobs'?`<button class="primary" data-act="add-job">${icon('plus')}Dodaj zlecenie</button>`:''}</header>${!navigator.onLine?'<div class="offline-banner">Tryb offline. Zapisany plan i opisy są dostępne. Nowe odległości wymagają połączenia.</div>':''}${saveError?notice(esc(saveError),'<button class="small" data-act="export">Pobierz kopię</button>','error'):''}${waitingWorker?'<div class="update-bar">Dostępna nowa wersja.<button class="small" data-act="update">Zaktualizuj</button></div>':''}${view==='week'?renderWeek(vs,p,unready):view==='jobs'?renderJobs(jobs):view==='import'?renderImport():renderSettings()}<div class="statusbar" style="margin-top:20px">${icon('lock')}<span>${state.updatedAt?`Zapis ${new Date(state.updatedAt).toLocaleTimeString('pl-PL',{hour:'2-digit',minute:'2-digit'})} na tym urządzeniu`:'Plan jest przechowywany na urządzeniu'}</span></div></main><nav class="mobile-nav">${navHtml(true)}</nav></div>`;
  if(view==='week'&&vs.length)drawMap();
  const drop=$('#import-drop');if(drop){drop.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('drag-over');});drop.addEventListener('dragleave',()=>drop.classList.remove('drag-over'));drop.addEventListener('drop',e=>{e.preventDefault();drop.classList.remove('drag-over');const f=e.dataTransfer.files[0];if(f)readExcel(f);});}
  document.querySelectorAll('.stop[draggable]').forEach(card=>{card.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',card.dataset.id);e.dataTransfer.effectAllowed='move';});card.addEventListener('dragover',e=>{e.preventDefault();card.classList.add('drag-over');});card.addEventListener('dragleave',()=>card.classList.remove('drag-over'));card.addEventListener('drop',e=>{e.preventDefault();reorder(e.dataTransfer.getData('text/plain'),card.dataset.id);});});
}
function dayTile(day){
  const r=dayRoute(day),s=dayDriving(day),overnight=!!currentPlan()?.overnight?.[day],fromSleep=day>0&&!!currentPlan()?.overnight?.[day-1];
  const sub=overnight?'Nocleg tutaj':r.length?(s.hasMissing?'Sprawdź dojazdy':`Powrót ${formatDuration(s.back)}`):'Bez wizyt';
  return `<button class="day-tile ${day===selectedDay?'active':''} ${overnight?'overnight':''}" style="--day-color:${DAY_COLORS[day]}" data-act="day" data-day="${day}"><span class="day-name">${DAY_NAMES[day].slice(0,3)}<span class="day-long">${DAY_NAMES[day].slice(3)}</span></span><span class="day-num">${addDays(state.settings.week,day).slice(8)}</span><strong>${r.length} ${r.length===1?'punkt':'pkt'}</strong><small>${fromSleep?'Z noclegu · ':''}${sub}</small></button>`;
}
function renderWeek(vs,p,unready){
  if(!vs.length)return `${weekSelector()}<div class="empty-grid"><div class="panel panel-pad">${importDrop()}<div class="empty-summary"><div class="metric"><strong>01</strong><span>Importuj zlecenia</span></div><div class="metric"><strong>02</strong><span>Ustaw start</span></div><div class="metric"><strong>03</strong><span>Wybierz pierwszy przystanek</span></div></div></div><aside class="panel panel-pad aside-intro"><h2>Od Excela do wyjazdu</h2><div class="intro-step"><span>1</span><div><strong>Twój arkusz, bez przepisywania</strong><p>Kody paczkomatów, opisy i telefony zostają przy zleceniach.</p></div></div><div class="intro-step"><span>2</span><div><strong>Ty wybierasz kolejność</strong><p>Aplikacja podpowiada co jest po drodze — decyzja zawsze należy do Ciebie.</p></div></div><div class="intro-step"><span>3</span><div><strong>Jeden przycisk do Google Maps</strong><p>Wybierz następny paczkomat i ruszaj.</p></div></div><button style="margin-top:20px;width:100%" data-act="restore">${icon('file')}Wczytaj plan od kolegi</button></aside></div>`;
  if(!ALL_DAYS.includes(selectedDay))selectedDay=0;
  const summary=dayDriving(selectedDay),distance=dayDistance(selectedDay),route=dayRoute(selectedDay);
  const {vs:ctxVs,anchor}=dayCostContext(selectedDay);
  const anchorLocation=anchor===0?state.settings.base:ctxVs[anchor-1]?.location;
  const overnight=!!p?.overnight?.[selectedDay];
  return `${weekSelector()}${!validCoords(state.settings.base)?notice('<strong>Skąd ruszacie?</strong>Ustaw miejsce startu i powrotu, żeby widzieć podpowiedzi tras.','<button class="small" data-act="view" data-view="settings">Ustaw start</button>'):''}${unready.length?notice(`<strong>${unready.length} ${unready.length===1?'wizyta wymaga':'wizyt wymaga'} sprawdzenia</strong>${vs.filter(v=>!validCoords(v.location)).length} bez potwierdzonej lokalizacji · ${vs.filter(v=>v.blocked).length} czeka na zgodę na wyjazd.`,`<button class="small" data-act="resolve-all">Sprawdź lokalizacje</button>`):''}${p&&!matrixValid()?notice('Zmieniły się lokalizacje lub miejsce startu. Policz odległości ponownie, aby zobaczyć aktualne podpowiedzi.','','info'):''}${!p?notice('Zlecenia są wczytane. Wybierz pierwszy przystanek poniżej albo policz odległości, żeby zobaczyć co jest po drodze.','','info'):''}<div class="day-grid">${ALL_DAYS.map(dayTile).join('')}</div><div class="work-area"><section class="panel list-panel"><div class="panel-title"><h2>${DAY_NAMES[selectedDay]}, ${formatDate(addDays(state.settings.week,selectedDay))}</h2><div class="flex" style="gap:8px"><span class="pill">${route.filter(v=>v.done).length}/${route.length} wykonano</span>${route.length?`<button class="small quiet" data-act="reset-day">${icon('close')}Reset dnia</button>`:''}</div></div><div class="summary"><div><span>Przystanki</span><strong>${route.length}</strong></div><div><span>W drodze między nimi</span><strong>${route.length?formatDuration(summary.driving):'—'}</strong></div><div><span>Powrót do bazy stąd</span><strong class="${summary.back>=60?'warn':''}">${route.length||anchor!==0?(summary.hasMissing?'brak danych':formatDuration(summary.back)):'—'}</strong></div></div>${route.length?`<div class="route-start"><span class="base-icon">${icon('home')}</span><div><strong>${esc(anchorLocation?.label||'Miejsce startu')}</strong><span>${anchor!==0?'Start od miejsca noclegu':'Start trasy'}</span></div></div>${route.map((v,i)=>renderStop(v,i,summary.entries.find(e=>e.visit?.id===v.id))).join('')}${renderRouteEnd(selectedDay,summary,distance,overnight,route)}`:`<div class="list-empty">${icon('calendar')}<h3>Wybierz pierwszy przystanek</h3><p>Zobacz propozycje poniżej — zaczynaj od tego, co jest najbliżej.</p></div>`}</section><aside class="panel map-panel"><div class="map-toolbar"><h3>${icon('map')} Trasa dnia</h3><button class="small quiet" data-act="fit-map">Pokaż całość</button></div><div id="map" class="map-canvas" aria-label="Mapa punktów i trasy"></div><div class="map-foot"><span>Numer punktu = kolejność na liście</span><span>${distance!==null&&route.length?`${Math.round(distance/1000)} km`:''}</span></div><div class="map-note">Kolor trasy i numerów to ten dzień. Inne kolory pinezek pokazują dzień, na który przystanek jest już zaplanowany — kliknięcie przenosi go tutaj. ${route.length?'Czasy drogowe OSRM, bez bieżących korków. Google Maps wyznaczy dojazd podczas nawigacji.':'Na mapie są lokalizacje wybranego tygodnia.'}${route.length?`<button class="small" style="margin-top:10px" data-act="load-route">${icon('refresh')}Odśwież przebieg trasy</button>`:''}<button class="small" style="margin-top:10px" data-act="materials-route">${icon('map')}Znajdź składy po drodze</button></div></aside></div>${renderAddSection(selectedDay)}`;
}
function renderRouteEnd(day,summary,distance,overnight,route){
  const lastLocation=route.at(-1)?.location;
  if(overnight&&lastLocation)return `<div class="route-end overnight"><span class="base-icon">${icon('moon')}</span><div><strong>Nocleg: ${esc(lastLocation.label)}</strong><span>Kolejny dzień wystartuje stąd. <a href="${esc(bookingUrl(lastLocation))}" target="_blank" rel="noopener noreferrer">Szukaj noclegu (Booking.com)</a></span></div></div><div class="panel-pad" style="padding-top:0"><button class="small quiet" data-act="toggle-overnight" data-day="${day}">Jednak wracamy do bazy tego dnia</button></div>`;
  return `<div class="route-end"><span class="base-icon">${icon('home')}</span><div><strong class="${summary.back>=60?'warn':''}">${summary.hasMissing?'Powrót: brak danych':`Powrót do bazy: ${formatDuration(summary.back)} drogi`}</strong><span>${distance!==null?`${Math.round(distance/1000)} km łącznie`:''}</span></div></div><div class="panel-pad" style="padding-top:0"><button class="small quiet" data-act="toggle-overnight" data-day="${day}">${icon('moon')}Nocleg tutaj zamiast powrotu</button></div>`;
}
function weekSelector(){const crews=[...new Set(state.jobs.filter(j=>j.week===state.settings.week).map(j=>j.crew).filter(Boolean))];return `<div class="toolbar between"><div class="week-control"><button class="icon quiet" data-act="week-shift" data-offset="-7" aria-label="Poprzedni tydzień">${icon('left')}</button><input aria-label="Tydzień planu" id="week-picker" type="date" value="${state.settings.week}"><button class="icon quiet" data-act="week-shift" data-offset="7" aria-label="Następny tydzień">${icon('right')}</button></div>${crews.length>1?`<select id="crew-picker" aria-label="Ekipa"><option value="">Wszystkie ekipy</option>${crews.map(c=>`<option ${state.settings.crew===c?'selected':''}>${esc(c)}</option>`).join('')}</select>`:`<span class="meta">${esc(crews[0]||'Plan na urządzeniu')}</span>`}<button class="small quiet" data-act="export">${icon('share')}Przekaż plan</button></div>`;}
function renderStop(v,index,entry){
  const status=v.done?'done':v.jobs.some(j=>j.status==='doing')?'doing':'todo',near=proximityWarning(v.id);
  return `<article class="stop ${status} ${selectedVisit===v.id?'selected':''}" data-id="${esc(v.id)}" draggable="true"><div class="stop-number">${status==='done'?icon('check'):index+1}</div><div class="stop-body"><div class="stop-heading"><h3>${esc(locationTitle(v.location))}</h3>${entry?(Number.isFinite(entry.travel)?`<span class="stop-time">${formatDuration(entry.travel)} dojazdu</span>`:'<span class="stop-time warn">Brak danych o dojeździe</span>'):''}</div><div class="stop-address">${esc(v.location.label)}</div><div class="tags">${[...new Set(v.jobs.map(j=>j.type))].map(type=>`<span class="tag">${esc(type)}</span>`).join('')}${v.jobs.length>1?`<span class="tag blue">${v.jobs.length} zadania · 1 dojazd</span>`:''}${near?`<span class="tag red">${formatDuration(near.seconds/60)} od ${esc(locationTitle(near.visit.location))}</span>`:''}${v.blocked?'<span class="tag amber">Potwierdź wyjazd</span>':''}${!validCoords(v.location)?'<span class="tag amber">Sprawdź lokalizację</span>':''}${status==='doing'?'<span class="tag blue">W trakcie</span>':status==='done'?'<span class="tag green">Wykonano</span>':''}</div>${v.location.note?`<div class="note">${esc(v.location.note)}</div>`:''}<div class="stop-footer"><a class="nav-link" href="${esc(googleMapsUrl(v.location))}" target="_blank" rel="noopener noreferrer">${icon('arrow')}Prowadź</a><button class="small" data-act="visit" data-id="${esc(v.id)}">Szczegóły</button><button class="small" data-act="work-map" data-id="${esc(v.id)}">${icon('layers')}Zobacz miejsce pracy</button><button class="small" data-act="add-note" data-id="${esc(v.id)}">${icon('edit')}${v.location.note?'Notatka':'Dodaj notatkę'}</button><div class="stop-actions"><button class="move-button" data-act="move-up" data-id="${esc(v.id)}" aria-label="Przenieś ${esc(v.location.code)} wyżej">${icon('up')}</button><button class="move-button" data-act="move-down" data-id="${esc(v.id)}" aria-label="Przenieś ${esc(v.location.code)} niżej">${icon('down')}</button><button class="move-button" data-act="move-day" data-id="${esc(v.id)}" aria-label="Zmień dzień wizyty">${icon('calendar')}</button><button class="move-button" data-act="remove-stop" data-id="${esc(v.id)}" aria-label="Usuń ${esc(v.location.code)} z tego dnia">${icon('close')}</button></div></div></div></article>`;
}
function renderCandidate(v,rank,best,fromLabel){
  const disabled=v.blocked||!validCoords(v.location);let info='';
  if(rank){
    info=rank.from===null?'<span class="tag amber">Brak danych o dojeździe</span>':`<span class="tag ${best?'green':'blue'}">${best?'Najbliżej · ':''}${formatDuration(rank.from)} ${fromLabel}</span>`;
    if(rank.back!==null&&rank.back>=60)info+=`<span class="tag amber">Powrót ${formatDuration(rank.back)}</span>`;
  }
  const near=proximityWarning(v.id);if(near)info+=`<span class="tag red">${formatDuration(near.seconds/60)} od ${esc(locationTitle(near.visit.location))}</span>`;
  return `<article class="stop candidate"><div class="stop-number">${icon('plus')}</div><div class="stop-body"><div class="stop-heading"><h3>${esc(locationTitle(v.location))}</h3></div><div class="stop-address">${esc(v.location.label)}</div><div class="tags">${[...new Set(v.jobs.map(j=>j.type))].map(type=>`<span class="tag">${esc(type)}</span>`).join('')}${info}${v.blocked?'<span class="tag amber">Potwierdź wyjazd</span>':''}${!validCoords(v.location)?'<span class="tag amber">Brak lokalizacji</span>':''}</div>${v.location.note?`<div class="note">${esc(v.location.note)}</div>`:''}<div class="stop-footer">${validCoords(v.location)?`<a class="nav-link" href="${esc(googleMapsUrl(v.location))}" target="_blank" rel="noopener noreferrer">${icon('arrow')}Prowadź</a>`:''}<button class="small" data-act="visit" data-id="${esc(v.id)}">Szczegóły</button><button class="small primary" data-act="add-stop" data-id="${esc(v.id)}" ${disabled?'disabled':''}>${icon('plus')}Dodaj</button></div></div></article>`;
}
function renderAddSection(day){
  const placed=placedVisitIds();
  const pool=currentVisits().filter(v=>!placed.has(v.id));
  if(!pool.length)return '';
  const hasStops=dayRoute(day).length>0;
  const {anchor}=dayCostContext(day);
  const fromLabel=hasStops?'od ostatniego punktu':(anchor===0?'od bazy':'od miejsca noclegu');
  const heading=hasStops?'Dodaj kolejny przystanek':'Wybierz pierwszy przystanek na ten dzień';
  const ranked=nextStopCandidates(day);let body;
  if(ranked===null){
    body=`${notice('Policz odległości, żeby zobaczyć co jest po drodze.','<button class="small" data-act="refresh-matrix">Policz odległości</button>','info')}${pool.map(v=>renderCandidate(v,null)).join('')}`;
  }else{
    const rankedIds=new Set(ranked.map(r=>r.visit.id)),missing=pool.filter(v=>!rankedIds.has(v.id));
    body=`${ranked.map((r,i)=>renderCandidate(r.visit,r,i===0,fromLabel)).join('')}${missing.length?notice(`${missing.length} ${missing.length===1?'punkt czeka':'punktów czeka'} na lokalizację lub potwierdzenie wyjazdu.`,'','info'):''}${missing.map(v=>renderCandidate(v,null)).join('')}`;
  }
  return `<section class="panel" style="margin-top:22px"><div class="panel-title"><h2>${heading} <span class="muted">${pool.length}</span></h2></div>${body}</section>`;
}
function importDrop(){return `<div class="import-drop" id="import-drop" role="button" tabindex="0" data-act="choose-excel"><div class="import-symbol">${icon('upload')}</div><h2>Wczytaj tygodniowy Excel</h2><p>Wybierz plik z telefonu lub przeciągnij go tutaj na komputerze.</p><button class="primary" data-act="choose-excel">${icon('file')}Wybierz plik</button><div class="import-bottom">XLSX, XLS lub CSV · do 10 MB</div></div>`;}
function renderImport(){return `<div class="empty-grid"><section class="panel panel-pad">${importDrop()}<div class="flex wrap" style="margin-top:18px"><button data-act="restore">${icon('file')}Wczytaj plan od kolegi</button><button class="quiet" data-act="add-job">${icon('plus')}Wpisz ręcznie</button></div><div class="file-history"><h3>Ostatnie importy</h3>${state.imports.length?state.imports.slice(-5).reverse().map(f=>`<div class="file-row">${icon('file')}<div><strong>${esc(f.name)}</strong><small>${new Date(f.at).toLocaleDateString('pl-PL')} · ${f.count} zleceń</small></div><button class="small quiet" data-act="delete-import" data-id="${esc(f.digest)}" aria-label="Usuń import ${esc(f.name)}">${icon('close')}</button></div>`).join(''):'<p class="meta">Nie wczytano jeszcze żadnego pliku.</p>'}</div></section><aside class="panel panel-pad"><h2>Co zostaje z Excela</h2><div class="intro-step"><span>1</span><div><strong>Paczkomaty i terminy</strong><p>Kod paczkomatu, adres, ekipa i tydzień realizacji.</p></div></div><div class="intro-step"><span>2</span><div><strong>Cały opis pracy</strong><p>Rodzaj robót, uwagi, zgłoszenia i kontakt do miejsca.</p></div></div><div class="intro-step"><span>3</span><div><strong>Różne zadania, wspólna wizyta</strong><p>Prace przy tym samym paczkomacie można wykonać podczas jednego dojazdu.</p></div></div><p class="privacy-text" style="margin-top:22px">Plik jest odczytywany na urządzeniu. Do usług mapowych trafiają wyłącznie kody punktów, adresy lub współrzędne. Opisy prac i kontakty nie są wysyłane do usług trasowania.</p></aside></div>`;}
function renderJobs(jobs){const rows=jobs.filter(j=>{const l=state.locations[j.locationId],matches=norm(`${l.code} ${l.label} ${j.type} ${j.details}`).includes(norm(search));return matches&&(filter==='all'||filter==='missing'&&!validCoords(l)||filter==='confirm'&&j.requiresConfirmation&&!j.confirmed||filter==='todo'&&j.status!=='done'||filter==='done'&&j.status==='done');});return `${weekSelector()}<div class="toolbar"><input id="search-jobs" type="search" placeholder="Kod, adres lub opis pracy" value="${esc(search)}" aria-label="Szukaj zleceń"><select id="job-filter" aria-label="Filtr zleceń">${[['all','Wszystkie'],['todo','Do wykonania'],['done','Wykonane'],['missing','Brak lokalizacji'],['confirm','Do potwierdzenia']].map(([id,label])=>`<option value="${id}" ${id===filter?'selected':''}>${label}</option>`).join('')}</select><span class="filter-count">${rows.length} pozycji</span></div><section class="panel table-wrap"><table class="data-table"><thead><tr><th>Paczkomat / adres</th><th>Praca</th><th class="hide-mobile">Status</th><th></th></tr></thead><tbody>${rows.map(j=>{const l=state.locations[j.locationId],v=currentVisits().find(v=>v.jobs.some(a=>a.id===j.id));return `<tr><td><strong>${esc(locationTitle(l))}</strong><small>${esc(l.label)}</small></td><td>${esc(j.type)}${j.requiresConfirmation&&!j.confirmed?'<br><span class="tag amber">Potwierdź wyjazd</span>':''}${!validCoords(l)?'<br><span class="tag amber">Brak lokalizacji</span>':''}</td><td class="hide-mobile">${j.status==='done'?'Wykonano':j.status==='doing'?'W trakcie':'Do wykonania'}</td><td><button class="small" data-act="visit" data-id="${esc(v.id)}">Otwórz</button></td></tr>`;}).join('')||'<tr><td colspan="4" style="padding:40px;text-align:center">Brak zleceń w tym widoku.</td></tr>'}</tbody></table></section>`;}
function renderSettings(){const s=state.settings;return `<div class="settings-layout"><section class="panel panel-pad"><div class="form-section"><h2>Miejsce startu i powrotu</h2><p>Plan obejmuje dojazd z bazy i powrót w to samo miejsce, chyba że zaznaczysz nocleg w trasie.</p><div class="flex wrap"><button type="button" data-act="base">${icon('pin')}${s.base?'Zmień miejsce':'Wpisz adres'}</button><button type="button" data-act="base-gps">${icon('target')}Moja lokalizacja</button></div>${s.base?`<div class="base-info"><strong>${esc(s.base.label)}</strong><span class="meta">${s.base.lat.toFixed(5)}, ${s.base.lng.toFixed(5)}</span></div>`:''}</div><div class="form-section"><h2>Kopia i instalacja</h2><div class="flex wrap"><button data-act="export">${icon('share')}Przekaż plan</button><button data-act="restore">${icon('file')}Wczytaj kopię</button><button data-act="install">${icon('download')}Zainstaluj</button></div><p class="privacy-text" style="margin:17px 0 0">Każdy telefon ma własny zapis. Wyczyszczenie danych witryny usuwa plan z telefonu. Zapisz kopię przed zmianą urządzenia.</p></div></section><aside class="panel panel-pad settings-aside"><h2>Na iPhonie</h2><ol><li>Otwórz stronę w <strong>Safari</strong>.</li><li>Naciśnij <strong>Udostępnij</strong>.</li><li>Wybierz <strong>Do ekranu początkowego</strong> i otwieranie jako aplikację www.</li></ol><p>Po pierwszym otwarciu aplikacja zapisuje swoje pliki. Zlecenia i opisy możesz odczytać również bez zasięgu.</p><p>Nowe lokalizacje i liczenie odległości wymagają internetu.</p><button style="width:100%;margin-top:10px" data-act="export">${icon('download')}Pobierz kopię planu</button></aside></div>`;}

// Every point for the week is always on the map — stops already on the day (numbered, in route order)
// and the remaining pool (a "+" pin). Clicking a pool pin adds it as the day's next stop, so the order
// you click in on the map is the order it's driven in — the same "Dodaj" the list does, just from here.
function drawMap(){
  const el=$('#map');if(!el||!globalThis.L)return;
  map=L.map(el,{zoomControl:true,scrollWheelZoom:false}).setView([50.35,18.7],8);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
  const route=dayRoute(selectedDay),routeIds=new Set(route.map(v=>v.id)),points=[],dayColor=DAY_COLORS[selectedDay];
  const dayOfVisit=new Map();
  for(const [dayIndex,ids] of Object.entries(currentPlan()?.routes||{}))if(ALL_DAYS.includes(Number(dayIndex)))for(const id of ids||[])dayOfVisit.set(id,Number(dayIndex));
  if(validCoords(state.settings.base)){const b=state.settings.base;points.push([b.lat,b.lng]);L.marker([b.lat,b.lng],{icon:L.divIcon({className:'',html:'<div class="map-pin base">B</div>',iconSize:[32,32],iconAnchor:[16,16]})}).bindPopup(`<strong>Baza</strong><br>${esc(b.label)}`).addTo(map);}
  for(const v of currentVisits()){
    if(!validCoords(v.location))continue;
    const p=[v.location.lat,v.location.lng];points.push(p);
    const inRoute=routeIds.has(v.id),otherDay=inRoute?undefined:dayOfVisit.get(v.id),index=inRoute?route.findIndex(r=>r.id===v.id)+1:null;
    const dayClass=inRoute?`day${selectedDay}`:otherDay!==undefined?`day${otherDay}`:'candidate';
    const label=inRoute?index:otherDay!==undefined?DAY_NAMES[otherDay].slice(0,2):'+';
    const marker=L.marker(p,{icon:L.divIcon({className:'',html:`<div class="map-pin ${dayClass} ${v.blocked?'pending':''} ${v.id===selectedVisit?'active':''}">${label}</div>`,iconSize:[32,32],iconAnchor:[16,16]})}).addTo(map);
    const moveNote=otherDay!==undefined?`Zaplanowane na ${DAY_NAMES[otherDay]}. Kliknij, żeby przenieść na ${DAY_NAMES[selectedDay]}.<br>`:'Kliknij pinezkę, żeby dodać jako kolejny przystanek.<br>';
    marker.bindPopup(`<strong>${esc(locationTitle(v.location))}</strong><br>${esc(v.location.label)}<br>${inRoute?'':moveNote}<a href="${esc(googleMapsUrl(v.location))}" target="_blank" rel="noopener noreferrer">Google Maps</a>`);
    marker.on('click',async()=>{
      if(inRoute){selectedVisit=v.id;document.querySelectorAll('.stop').forEach(c=>c.classList.toggle('selected',c.dataset.id===v.id));return;}
      if(await addStop(selectedDay,v.id)){toast('Przystanek dodany.');loadDayRoute();}
    });
  }
  const geometry=currentPlan()?.geometries?.[routeKey(state.settings.base,route)];if(geometry?.geometry)L.geoJSON(geometry.geometry,{style:{color:dayColor,weight:5,opacity:.85}}).addTo(map);
  if(points.length)map.fitBounds(points,{padding:[35,35],maxZoom:15});setTimeout(()=>map?.invalidateSize(),100);
}
async function readExcel(file){
  if(busy)return;if(file.size>10*1024*1024)return toast('Maksymalny rozmiar pliku to 10 MB.');if(!globalThis.XLSX)return toast('Nie udało się otworzyć modułu Excela. Odśwież aplikację.');
  busy=true;showModal('Odczytuję Excel',`<div class="progress-box"><strong>${esc(file.name)}</strong><p>Rozpoznaję zlecenia, adresy i tydzień pracy…</p></div>`);
  try{
    const bytes=await file.arrayBuffer(),digest=globalThis.crypto?.subtle?Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(v=>v.toString(16).padStart(2,'0')).join(''):hash(`${file.name}|${file.size}|${file.lastModified}`);
    const workbook=XLSX.read(bytes,{type:'array',cellDates:false});
    const all={jobs:[],locations:{},issues:[],nonempty:0,duplicates:0};let recognized=0;
    for(const name of workbook.SheetNames){try{const parsed=parseRows(XLSX.utils.sheet_to_json(workbook.Sheets[name],{header:1,defval:null,raw:true}),{fileName:file.name,sheetName:name,XLSX,defaultWeek:state.settings.week});recognized++;all.jobs.push(...parsed.jobs);Object.assign(all.locations,parsed.locations);all.issues.push(...parsed.issues.map(i=>({...i,sheet:name})));all.nonempty+=parsed.nonempty;all.duplicates+=parsed.duplicates;}catch(e){all.issues.push({sheet:name,message:e.message});}}
    if(!recognized||!all.jobs.length)throw new Error('Nie znaleziono zleceń. Arkusz musi zawierać kolumnę „Nazwa PM” lub „Adres”.');
    if(all.jobs.length>1000)throw new Error('Plik ma więcej niż 1000 zleceń. Wczytaj mniejszy zakres.');
    importPreview={parsed:all,fileName:file.name,digest};
    const weeks=[...new Set(all.jobs.map(j=>j.week))];busy=false;
    showModal('Excel gotowy do wczytania',`<p class="muted">${esc(file.name)}</p><div class="empty-summary" style="margin:0 0 22px;padding:0;border:0"><div class="metric"><strong>${all.jobs.length}</strong><span>zleceń</span></div><div class="metric"><strong>${Object.keys(all.locations).length}</strong><span>lokalizacji</span></div><div class="metric"><strong>${weeks.length}</strong><span>${weeks.length===1?'tydzień':'tygodnie'}</span></div></div><p>Daty z arkusza oznaczają tygodnie realizacji. Sam wybierzesz kolejność i dni dla każdego zlecenia.</p>${state.imports.some(i=>i.digest===digest)?notice('Ten plik był już wczytany. Istniejące zlecenia zostaną zaktualizowane bez dublowania.','','info'):''}<p class="privacy-text">Uwagi o potwierdzeniu wyjazdu pozostają przy zadaniach.</p>${all.issues.length?`<details><summary>Uwagi do importu (${all.issues.length})</summary><ul class="issue-list">${all.issues.map(i=>`<li>${esc(i.sheet)}${i.row?`, wiersz ${i.row}`:''}: ${esc(i.message)}</li>`).join('')}</ul></details>`:''}`,`<button data-act="close">Anuluj</button><button class="primary" data-act="confirm-import">${icon('check')}Wczytaj zlecenia</button>`);
  }catch(error){busy=false;showModal('Nie udało się wczytać pliku',`<p>${esc(error.message)}</p>`,`<button data-act="close">Zamknij</button>`);}finally{$('#excel-input').value='';}
}
async function confirmImport(){if(!importPreview)return;const {parsed,fileName,digest}=importPreview;state=mergeImport(state,parsed,digest);state.imports.push({name:fileName,digest,count:parsed.jobs.length,at:new Date().toISOString()});state.imports=state.imports.slice(-30);state.settings.week=parsed.jobs[0].week;const crews=[...new Set(parsed.jobs.map(j=>j.crew))];if(crews.length===1)state.settings.crew=crews[0];view='week';selectedDay=0;importPreview=null;modal.close();await save();toast(`${state.importResult.added} nowych, ${state.importResult.updated} zaktualizowanych zleceń.`);await resolveAll();}
async function resolveAll(){
  if(busy)return;const locs=[...new Set(selectedJobs().map(j=>j.locationId))].map(id=>state.locations[id]).filter(l=>!validCoords(l));if(!locs.length)return toast('Wszystkie lokalizacje są ustalone. Potwierdzenia wyjazdu znajdziesz w szczegółach zleceń.');
  if(!navigator.onLine)return toast('Do wyszukania lokalizacji potrzebujesz internetu.');busy=true;cancelGeo=false;let found=0;
  showModal('Uzupełniam lokalizacje',`<div class="progress-box"><strong id="geo-progress-title">Sprawdzam kody paczkomatów</strong><progress id="geo-progress" max="${locs.length}" value="0"></progress><p id="geo-progress-text">0 z ${locs.length}</p></div><p class="privacy-text" style="margin-top:15px">Zapytania są wysyłane kolejno. Odnalezione punkty zapisują się na telefonie.</p>`,`<button data-act="cancel-geo">Przerwij</button>`);
  for(let i=0;i<locs.length;i++){if(cancelGeo)break;const l=locs[i];$('#geo-progress-title').textContent=l.code||l.label;try{const result=await resolveLocation(l);if(result.automatic&&result.candidates[0]){Object.assign(l,result.candidates[0],{label:l.label,geoStatus:'verified',geoSource:result.candidates[0].source});found++;}else{l.candidates=result.candidates;l.geoStatus=result.candidates.length?'review':'missing';}}catch(error){l.geoError=error.message;}$('#geo-progress').value=i+1;$('#geo-progress-text').textContent=`${i+1} z ${locs.length} · ${found} odnalezionych`;await save({redraw:false});}
  busy=false;modal.close();render();const left=locs.filter(l=>!validCoords(l));if(left.length){showModal('Sprawdź pozostałe adresy',`<p>Odnaleziono ${found} lokalizacji. ${left.length} ${left.length===1?'punkt wymaga':'punktów wymaga'} wskazania lub zatwierdzenia na mapie.</p>${left.map(l=>`<button class="location-result" data-act="location" data-id="${esc(l.id)}"><strong>${esc(locationTitle(l))}</strong><small>${esc(l.label)}</small></button>`).join('')}`,`<button data-act="close">Wróć do planu</button>`);}else toast(`Lokalizacje gotowe: ${found} punktów.`);
}

async function refreshMatrix(){
  if(busy)return;if(!navigator.onLine)return toast('Do policzenia odległości potrzebujesz internetu. Zapisany plan nadal działa.');
  if(!validCoords(state.settings.base)){view='settings';render();return toast('Ustaw miejsce startu i powrotu.');}
  const crews=[...new Set(selectedJobs().map(j=>j.crew).filter(Boolean))];if(crews.length>1&&!state.settings.crew)return toast('Wybierz jedną ekipę nad planem tygodnia.');
  const all=currentVisits();if(!all.length)return;
  const located=all.filter(v=>validCoords(v.location));if(!located.length)return resolveAll();
  busy=true;render();showModal('Liczę odległości',`<div class="progress-box"><strong>Pobieram drogowe czasy dojazdu…</strong><p>Między bazą a wszystkimi punktami tygodnia.</p></div>`);
  try{
    const matrix=await fetchMatrix(state.settings.base,located);
    const old=currentPlan();
    state.plans[planKey()]={routes:old?.routes||{},geometries:old?.geometries||{},overnight:old?.overnight||{},matrix};
    busy=false;modal.close();await save();toast('Odległości policzone. Sprawdź podpowiedzi przy każdym dniu.');
  }catch(error){busy=false;showModal('Nie udało się policzyć odległości',`<p>${esc(error.message)}</p><p class="privacy-text">Dotychczasowy plan pozostał zapisany. Możesz nadal dodawać przystanki bez podpowiedzi odległości.</p>`,`<button data-act="close">Wróć do planu</button>`);render();}
}
// Reorders the day's own stops for the shortest path from its anchor (base, or an overnight start) and
// back — never adds or removes anything, only asked for explicitly via "Optymalizuj kolejność".
async function optimizeDayOrder(day){
  const {vs,cost,anchor}=dayCostContext(day);
  if(!cost)return toast('Najpierw policz odległości.');
  const route=dayRoute(day);if(route.length<2)return toast('Za mało przystanków, żeby coś optymalizować.');
  const indices=route.map(v=>vs.findIndex(a=>a.id===v.id)+1);
  if(indices.some(i=>i<=0))return toast('Brakuje danych o dojeździe do części przystanków. Policz odległości ponownie.');
  const optimized=exactRoute(indices,cost,anchor);
  const p=currentPlan();if(!p)return;
  p.routes[day]=optimized.map(i=>vs[i-1].id);
  state.plans[planKey()]=p;await save();loadDayRoute();
  toast('Kolejność zoptymalizowana.');
}
async function deleteImport(digest){
  const entry=state.imports.find(i=>i.digest===digest);if(!entry)return;
  const count=state.jobs.filter(j=>j.importDigest===digest).length;
  const word=count===1?'zlecenie':count%10>=2&&count%10<=4&&!(count%100>=12&&count%100<=14)?'zlecenia':'zleceń';
  if(!confirm(`Usunąć import „${entry.name}” i ${count} ${word} z niego? Tego nie da się cofnąć.`))return;
  state=removeImport(state,digest);await save();toast('Import usunięty.');
}
async function resetDay(day){
  const route=dayRoute(day);if(!route.length)return toast('Ten dzień jest już pusty.');
  if(!confirm(`Usunąć wszystkie ${route.length} ${route.length===1?'przystanek':'przystanki'} z tego dnia? Wrócą do puli nieprzypisanych.`))return;
  const p=currentPlan();if(!p)return;
  p.routes[day]=[];state.plans[planKey()]=p;await save();
  toast('Dzień wyczyszczony.');
}
async function loadDayRoute(){
  const key=planKey(),day=selectedDay,p=state.plans[key],route=dayRoute(day),base=state.settings.base;
  if(!p||!validCoords(base)||!route.length||route.some(v=>!validCoords(v.location)))return;
  const {anchor}=dayCostContext(day);if(anchor!==0)return;
  const rKey=routeKey(base,route);if(p.geometries?.[rKey])return;
  try{const geometry=await fetchRoute(base,route);if(state.plans[key]!==p)return;p.geometries??={};p.geometries[rKey]=geometry;await save({redraw:false});if(planKey()===key&&selectedDay===day&&view==='week')render();}
  catch(error){toast(error.message);}
}
function showVisit(id){
  const v=currentVisits().find(v=>v.id===id);if(!v)return;selectedVisit=id;
  const location=v.location;
  showModal(locationTitle(location)||'Szczegóły wizyty',`<p class="muted">${esc(location.label)}</p><div class="flex wrap" style="margin-bottom:20px"><a class="nav-link" href="${esc(googleMapsUrl(location))}" target="_blank" rel="noopener noreferrer">${icon('arrow')}Google Maps</a><button class="small" data-act="location" data-id="${esc(location.id)}">${icon('pin')}${validCoords(location)?'Popraw pinezkę':'Ustal lokalizację'}</button><button class="small" data-act="work-map" data-id="${esc(id)}">${icon('layers')}Zobacz miejsce pracy</button><button class="small" data-act="materials" data-id="${esc(id)}">${icon('map')}Składy kruszywa w pobliżu</button></div><form id="visit-form" data-visit="${esc(id)}">${v.jobs.map(j=>`<section class="job-detail"><h3>${esc(j.type)}</h3><div class="meta">${esc(j.ticket||j.place||'Zlecenie własne')}${j.sourceRow?` · Excel, wiersz ${j.sourceRow}`:''}</div>${j.details?`<p style="margin-top:13px">${esc(j.details)}</p>`:''}${j.notes?`<div class="note">${esc(j.notes)}</div>`:''}<label class="field" style="margin-top:18px;max-width:220px">Status<select name="status:${esc(j.id)}"><option value="todo" ${j.status==='todo'?'selected':''}>Do wykonania</option><option value="doing" ${j.status==='doing'?'selected':''}>W trakcie</option><option value="done" ${j.status==='done'?'selected':''}>Wykonano</option></select></label>${j.requiresConfirmation?`<label class="check-row" style="margin-top:17px"><input type="checkbox" name="confirmed:${esc(j.id)}" ${j.confirmed?'checked':''}><span>Sprawdziłem warunek z uwag. Można jechać do tego zlecenia.</span></label>`:''}${j.phone?`<a class="nav-link" style="margin-top:15px;background:#edf3f7;color:#243f51" href="tel:${esc(j.phone.replace(/[^+\d]/g,''))}">${icon('phone')}${esc(j.phone)}</a>`:''}${Object.keys(j.source||{}).length?`<details class="source-details"><summary>Wszystkie dane z Excela</summary><dl>${Object.entries(j.source).map(([k,val])=>`<dt>${esc(k)}</dt><dd>${esc(val)}</dd>`).join('')}</dl></details>`:''}</section>`).join('')}</form>`,`<button data-act="move-day" data-id="${esc(id)}">Zmień dzień</button><button class="primary" type="submit" form="visit-form">Zapisz</button>`);
}
function showMoveDay(id){const v=currentVisits().find(v=>v.id===id);if(!v)return;const current=Object.entries(currentPlan()?.routes||{}).find(([,ids])=>ids.includes(id))?.[0];showModal('Przenieś wizytę',`<p><strong>${esc(locationTitle(v.location))}</strong></p><form id="move-form" data-visit="${esc(id)}"><label class="field">Dzień<select name="day">${ALL_DAYS.map(i=>`<option value="${i}" ${String(current)===String(i)?'selected':''}>${DAY_NAMES[i]}, ${formatDate(addDays(state.settings.week,i))}</option>`).join('')}</select></label></form>`,`<button data-act="close">Anuluj</button><button class="primary" form="move-form" type="submit">Przenieś</button>`);}
// Shared by "Dodaj" on a candidate and by the move-day dialog: place a visit at the end of a day's route.
async function addStop(day,id){
  const v=currentVisits().find(v=>v.id===id);if(!v)return false;
  if(v.blocked){toast('Najpierw potwierdź możliwość wyjazdu w szczegółach zlecenia.');return false;}
  if(!validCoords(v.location)){toast('Najpierw ustal lokalizację punktu.');return false;}
  const p=currentPlan()||{routes:{},geometries:{},overnight:{}};
  for(const ids of Object.values(p.routes))if(ids){const i=ids.indexOf(id);if(i>=0)ids.splice(i,1);}
  p.routes[day]??=[];p.routes[day].push(id);state.plans[planKey()]=p;await save();return true;
}
async function moveDayVisit(id,day){selectedDay=day;if(await addStop(day,id)){modal.close();toast('Wizyta przeniesiona.');loadDayRoute();}}
async function removeStop(id){const p=currentPlan();if(!p)return;for(const ids of Object.values(p.routes))if(ids){const i=ids.indexOf(id);if(i>=0)ids.splice(i,1);}await save();}
async function toggleOvernight(day){
  const p=currentPlan();if(!p)return;p.overnight=p.overnight||{};
  if(p.overnight[day])delete p.overnight[day];else p.overnight[day]=true;
  state.plans[planKey()]=p;await save();
  toast(p.overnight[day]?'Nocleg zaznaczony — następny dzień wystartuje stąd.':'Dzień znów kończy się powrotem do bazy.');
}
async function reorder(id,beforeId){const p=currentPlan(),route=p?.routes?.[selectedDay];if(!route||!route.includes(id)||id===beforeId)return;const old=route.indexOf(id),target=route.indexOf(beforeId);if(target<0)return;route.splice(old,1);route.splice(target,0,id);await save();loadDayRoute();}
async function moveBy(id,direction){const route=currentPlan()?.routes?.[selectedDay];if(!route)return;const i=route.indexOf(id),j=i+direction;if(i<0||j<0||j>=route.length)return;[route[i],route[j]]=[route[j],route[i]];await save();loadDayRoute();}

function renderMaterialsList(results,near){
  const el=$('#materials-results');if(!el)return;
  if(!results.length){el.innerHTML='<p class="meta">Nic nie znaleziono w OpenStreetMap w tym zasięgu. Spróbuj wyszukiwania w Google Maps powyżej.</p>';return;}
  el.innerHTML=results.map(r=>{const km=near&&validCoords(near)?(haversine(near,r)/1000).toFixed(1):null;return `<a class="location-result" href="${esc(googleMapsUrl(r))}" target="_blank" rel="noopener noreferrer"><strong>${esc(r.name)}</strong><small>${km?`${km} km · `:''}${esc(r.tags.shop||r.tags.landuse||'obiekt OSM')}</small></a>`;}).join('');
}
async function showMaterials(id){
  const v=currentVisits().find(v=>v.id===id);if(!v||!validCoords(v.location))return toast('Najpierw ustal lokalizację punktu.');
  const loc=v.location;
  showModal('Składy kruszywa w pobliżu',`<p class="muted">${esc(loc.label)}</p><div class="flex wrap" style="margin-bottom:16px"><a class="nav-link" href="${esc(googleSearchUrl('skład kruszywa',loc))}" target="_blank" rel="noopener noreferrer">${icon('arrow')}Szukaj w Google Maps</a></div><div id="materials-results"><p class="meta">Szukam w OpenStreetMap…</p></div>`,`<button data-act="close">Zamknij</button>`);
  if(!navigator.onLine){$('#materials-results').innerHTML='<p class="meta">Brak internetu — otwórz wyszukiwanie w Google Maps powyżej.</p>';return;}
  try{const results=await findMaterialYards({center:loc,radius:8000});if(modal.open)renderMaterialsList(results,loc);}catch(error){if($('#materials-results'))$('#materials-results').innerHTML=`<p class="meta">${esc(error.message)}</p>`;}
}
async function showMaterialsRoute(day){
  const route=dayRoute(day),points=[state.settings.base,...route.map(v=>v.location)].filter(validCoords);
  if(!points.length)return toast('Dodaj przynajmniej jeden przystanek albo ustaw bazę.');
  const lats=points.map(p=>p.lat),lngs=points.map(p=>p.lng);
  const bbox={south:Math.min(...lats)-0.05,north:Math.max(...lats)+0.05,west:Math.min(...lngs)-0.05,east:Math.max(...lngs)+0.05};
  showModal('Składy kruszywa po drodze',`<p class="muted">${DAY_NAMES[day]}, ${formatDate(addDays(state.settings.week,day))}</p><div class="flex wrap" style="margin-bottom:16px"><a class="nav-link" href="${esc(googleSearchUrl('skład kruszywa',points[0]))}" target="_blank" rel="noopener noreferrer">${icon('arrow')}Szukaj w Google Maps</a></div><div id="materials-results"><p class="meta">Szukam w OpenStreetMap…</p></div>`,`<button data-act="close">Zamknij</button>`);
  if(!navigator.onLine){$('#materials-results').innerHTML='<p class="meta">Brak internetu.</p>';return;}
  try{const results=await findMaterialYards({bbox});if(modal.open)renderMaterialsList(results,state.settings.base);}catch(error){if($('#materials-results'))$('#materials-results').innerHTML=`<p class="meta">${esc(error.message)}</p>`;}
}

function showNoteEditor(id){
  const v=currentVisits().find(v=>v.id===id);if(!v)return;
  showModal('Notatka przy punkcie',`<p class="muted">${esc(locationTitle(v.location))}</p><form id="note-form" data-location="${esc(v.location.id)}"><label class="field full">Notatka<textarea name="note" placeholder="np. brama zamknięta, dzwonić na domofon 12">${esc(v.location.note||'')}</textarea></label></form>`,`<button data-act="close">Anuluj</button>${v.location.note?`<button class="small" data-act="clear-note" data-id="${esc(id)}">Usuń notatkę</button>`:''}<button class="primary" type="submit" form="note-form">Zapisz</button>`);
}
async function saveNote(form){
  const locId=form.dataset.location,note=text(new FormData(form).get('note'));
  if(state.locations[locId])state.locations[locId].note=note;
  modal.close();await save();toast(note?'Notatka zapisana.':'Notatka usunięta.');
}
async function clearNote(id){
  const v=currentVisits().find(v=>v.id===id);if(!v)return;
  if(state.locations[v.location.id])state.locations[v.location.id].note='';
  modal.close();await save();toast('Notatka usunięta.');
}

// Five base maps, each a real small crop of that provider centred on the point being shown — not a
// generic icon — so the picker doubles as a preview of what each style actually looks like here.
const BASE_LAYERS=[
  {id:'osm',label:'Ulice',sub:'OpenStreetMap'},
  {id:'esri',label:'Satelita',sub:'Esri (szybsze)'},
  {id:'orto',label:'Satelita',sub:'GUGiK (nowsze)'},
  {id:'google-hybrid',label:'Google',sub:'hybryda'},
  {id:'google',label:'Google',sub:'mapa'},
];
function tileXY(lat,lng,z){
  const n=2**z,x=Math.floor((lng+180)/360*n),latRad=lat*Math.PI/180;
  const y=Math.floor((1-Math.log(Math.tan(latRad)+1/Math.cos(latRad))/Math.PI)/2*n);
  return {x,y};
}
function mercatorPoint(lat,lng){
  const x=lng*20037508.34/180;
  return [x,Math.log(Math.tan((90+lat)*Math.PI/360))/(Math.PI/180)*20037508.34/180];
}
function baseLayerThumbUrl(id,lat,lng){
  const z=17,{x,y}=tileXY(lat,lng,z);
  if(id==='esri')return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
  if(id==='orto'){const [mx,my]=mercatorPoint(lat,lng),half=150;return `${SERVICES.ortofoto}?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=Raster&STYLES=&FORMAT=image/jpeg&TRANSPARENT=false&CRS=EPSG:3857&WIDTH=128&HEIGHT=128&BBOX=${mx-half},${my-half},${mx+half},${my+half}`;}
  if(id==='google-hybrid')return `https://mt1.google.com/vt/lyrs=y&x=${x}&y=${y}&z=${z}`;
  if(id==='google')return `https://mt1.google.com/vt/lyrs=m&x=${x}&y=${y}&z=${z}`;
  return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
}
// Google tiles here are the unofficial `mtN.google.com/vt` endpoint (no key) many hobby map tools use —
// convenient for a 2-person internal app, but unsupported: Google can change or block it without notice.
function makeBaseTileLayer(id){
  if(id==='esri')return L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'Esri, Maxar, Earthstar Geographics'});
  if(id==='orto')return L.tileLayer.wms(SERVICES.ortofoto,{layers:'Raster',format:'image/jpeg',version:'1.3.0',maxZoom:19,attribution:'GUGiK ORTO'});
  if(id==='google-hybrid')return L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',{subdomains:['mt0','mt1','mt2','mt3'],maxZoom:20,attribution:'Google (nieoficjalne kafelki)'});
  if(id==='google')return L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{subdomains:['mt0','mt1','mt2','mt3'],maxZoom:20,attribution:'Google (nieoficjalne kafelki)'});
  return L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'});
}
let workMap=null,workBaseLayer=null,workBaseId='osm',workGesut=null,workGesutChecked=new Set(),workParcelsOn=false,workParcelsLayer=null,workParcelHighlight=null;
// A closer look at one address: a choice of base map, optional GESUT utility-line overlays
// (electric/gas/water/sewage/…), plus a plain link out to Street View. All free, no key anywhere.
// The GESUT lines are requested as ONE WMS layer with a comma-joined LAYERS param (updated via
// setParams as checkboxes change) rather than one tile layer per network type — checking several at
// once used to fire that many parallel tile requests at the same host, which starved the base map's
// own tile requests and made it appear to fail.
let workLoc=null;
function showWorkMap(id){
  const v=currentVisits().find(v=>v.id===id);if(!v||!validCoords(v.location))return toast('Najpierw ustal lokalizację punktu.');
  const loc=v.location,pano=streetViewUrl(loc);
  showModal(`Miejsce pracy — ${locationTitle(loc)}`,`${pano?`<a class="nav-link streetview-link" href="${esc(pano)}" target="_blank" rel="noopener noreferrer" style="margin-bottom:14px">${pegmanSvg}Street View</a>`:''}<div class="map-base-picker"><div class="map-base-title">Mapa bazowa</div><div class="map-base-row">${BASE_LAYERS.map(b=>`<button type="button" class="map-base-thumb ${b.id===workBaseId?'active':''}" data-act="base-layer" data-base="${b.id}" style="background-image:url('${esc(baseLayerThumbUrl(b.id,loc.lat,loc.lng))}')"><span>${esc(b.label)}</span><small>${esc(b.sub)}</small></button>`).join('')}</div></div><div id="work-map" class="map-canvas" style="height:400px;border-radius:10px;margin-top:12px"></div><label class="parcel-toggle" id="work-parcels"><input type="checkbox" data-parcels="1"><span>${icon('layers')}Działki ewidencyjne — kliknij mapę po włączeniu, żeby zobaczyć numer</span></label><div class="layer-toggles" id="work-layers">${GESUT_LAYERS.map(l=>`<label><input type="checkbox" data-layer="${esc(l.name)}"><span>${esc(l.title)}</span></label>`).join('')}</div><p class="privacy-text" style="margin-top:14px">Warstwy uzbrojenia terenu (GESUT) są widoczne dopiero przy bardzo dużym przybliżeniu — podjedź blisko punktu. Granice działek i ich numery pochodzą z usług ewidencji gruntów (EGiB/ULDK), a linie mediów z Krajowej Integracji Uzbrojenia Terenu — obie z Głównego Urzędu Geodezji i Kartografii i mogą nie obejmować wszystkich powiatów. Podkłady Google to nieoficjalne kafelki bez klucza — mogą przestać działać bez zapowiedzi.</p>`,`<button data-act="close">Zamknij</button>`);
  drawWorkMap(loc);
}
function drawWorkMap(loc){
  if(!globalThis.L)return;
  workLoc=loc;workGesut=null;workGesutChecked=new Set();workBaseId='osm';workParcelsOn=false;workParcelsLayer=null;workParcelHighlight=null;
  workMap=L.map('work-map',{zoomControl:true}).setView([loc.lat,loc.lng],19);
  workBaseLayer=makeBaseTileLayer(workBaseId).addTo(workMap);
  L.marker([loc.lat,loc.lng],{icon:L.divIcon({className:'',html:'<div class="map-pin active">•</div>',iconSize:[32,32],iconAnchor:[16,16]})}).addTo(workMap);
  // Parcel identification: only wired up when the "Działki" checkbox is on, so a stray click on the
  // work map otherwise does nothing.
  workMap.on('click',async e=>{
    if(!workParcelsOn)return;
    try{
      const {id,wkt}=await findParcelAt(e.latlng.lat,e.latlng.lng);
      const geo=parseParcelWkt(wkt);
      if(workParcelHighlight)workMap.removeLayer(workParcelHighlight);
      workParcelHighlight=L.geoJSON(geo,{style:{color:'#ffcf30',weight:3,fillColor:'#ffcf30',fillOpacity:.25}}).addTo(workMap);
      workParcelHighlight.bindPopup(`<strong>Działka</strong><br>${esc(id)}`).openPopup(e.latlng);
    }catch(error){toast(error.message||'Nie udało się sprawdzić działki w tym miejscu.');}
  });
  setTimeout(()=>workMap?.invalidateSize(),100);
}
function setWorkBaseLayer(id){
  if(!workMap||id===workBaseId)return;
  workBaseId=id;
  workMap.removeLayer(workBaseLayer);
  workBaseLayer=makeBaseTileLayer(id).addTo(workMap);
  workBaseLayer.bringToBack();
  if(workParcelsLayer)workParcelsLayer.bringToFront();
  if(workGesut)workGesut.bringToFront();
  if(workParcelHighlight)workParcelHighlight.bringToFront();
  document.querySelectorAll('[data-act="base-layer"]').forEach(b=>b.classList.toggle('active',b.dataset.base===id));
}
function toggleGesutLayer(name,checked){
  if(checked)workGesutChecked.add(name);else workGesutChecked.delete(name);
  const names=[...workGesutChecked].join(',');
  if(!names){if(workGesut)workMap.removeLayer(workGesut);return;}
  if(workGesut){workGesut.setParams({layers:names});if(!workMap.hasLayer(workGesut))workGesut.addTo(workMap);}
  else{workGesut=L.tileLayer.wms(SERVICES.gesut,{layers:names,format:'image/png',transparent:true,version:'1.3.0',maxZoom:19,attribution:'GUGiK KIUT'});workGesut.addTo(workMap);}
}
// One combined WMS layer for parcel boundaries (like GESUT above); the parcel number itself only shows
// up on click, via ULDK — a raster label layer at every zoom would just add clutter to a plain toggle.
function toggleParcelsLayer(on){
  workParcelsOn=on;
  if(!workMap)return;
  workMap.getContainer().classList.toggle('parcels-active',on);
  if(!on){
    if(workParcelsLayer){workMap.removeLayer(workParcelsLayer);workParcelsLayer=null;}
    if(workParcelHighlight){workMap.removeLayer(workParcelHighlight);workParcelHighlight=null;}
    return;
  }
  workParcelsLayer=L.tileLayer.wms(SERVICES.dzialki,{layers:'dzialki',format:'image/png',transparent:true,version:'1.3.0',maxZoom:19,attribution:'GUGiK EGiB'});
  workParcelsLayer.addTo(workMap);
  if(workGesut)workGesut.bringToFront();
}

let geoSelection=null;
function showLocation(id){const l=id==='base'?(state.settings.base||{label:'',city:'',postal:''}):state.locations[id];if(!l)return;geoTarget=id;geoCandidates=l.candidates||[];geoSelection=validCoords(l)?{lat:l.lat,lng:l.lng,label:l.label,source:l.geoSource||'Ręcznie'}:null;
  showModal(id==='base'?'Miejsce startu i powrotu':`Lokalizacja ${l.code||''}`,`<form id="geo-form"><label class="field">Adres lub współrzędne<input name="query" id="geo-query" value="${esc(l.label)}" placeholder="Ulica, numer, miejscowość lub 50.123, 18.456" required></label><button type="submit" style="margin-top:12px">${icon('pin')}Wyszukaj</button></form><div id="geo-results"></div><div id="mini-map" class="mini-map"></div><p class="field-hint">Dotknij mapy, aby ustawić dokładny punkt przy wjeździe. Możesz też wkleić współrzędne z Google Maps.</p><div id="geo-selection" class="base-info"></div>`,`<button data-act="close">Anuluj</button><button class="primary" id="save-location" data-act="save-location" ${geoSelection?'':'disabled'}>Zapisz lokalizację</button>`);
  renderGeoResults();drawMiniMap();updateGeoSelection();
}
function renderGeoResults(){const el=$('#geo-results');if(!el)return;el.innerHTML=geoCandidates.map((c,i)=>`<button class="location-result" data-act="geo-candidate" data-index="${i}"><strong>${esc(c.label)}</strong><small>${esc(c.source)}${c.precise?' · dokładny adres':' · sprawdź punkt na mapie'}</small></button>`).join('');}
function drawMiniMap(){if(!globalThis.L)return;miniMap=L.map('mini-map',{scrollWheelZoom:false}).setView(geoSelection?[geoSelection.lat,geoSelection.lng]:[50.35,18.7],geoSelection?16:8);L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(miniMap);miniMap.on('click',e=>{geoSelection={lat:e.latlng.lat,lng:e.latlng.lng,label:$('#geo-query').value,source:'Pinezka użytkownika'};updateGeoSelection();});setTimeout(()=>{miniMap?.invalidateSize();updateGeoSelection();},100);}
function updateGeoSelection(){const el=$('#geo-selection');if(!el)return;el.innerHTML=geoSelection?`<strong>Wybrany punkt</strong><span>${geoSelection.lat.toFixed(6)}, ${geoSelection.lng.toFixed(6)}</span>`:'Wybierz wynik wyszukiwania lub punkt na mapie.';$('#save-location').disabled=!geoSelection;
  if(miniMap){miniMap.eachLayer(layer=>{if(layer instanceof L.Marker)miniMap.removeLayer(layer);});if(geoSelection)L.marker([geoSelection.lat,geoSelection.lng],{icon:L.divIcon({className:'',html:'<div class="map-pin active">✓</div>',iconSize:[32,32],iconAnchor:[16,16]})}).addTo(miniMap);}
}
async function searchGeo(query){const direct=parseCoordinates(query);if(direct){geoSelection={...direct,label:query,source:'Współrzędne użytkownika'};miniMap?.setView([direct.lat,direct.lng],16);updateGeoSelection();return;}
  const target=geoTarget;$('#geo-results').innerHTML='<p class="meta" style="margin-top:16px">Szukam adresu…</p>';try{const original=target==='base'?null:state.locations[target];const result=await resolveLocation({...original,code:norm(query)===norm(original?.label)?original?.code:'',label:query,city:original?.city||'',postal:original?.postal||''});if(target!==geoTarget||!modal.open)return;geoCandidates=result.candidates;renderGeoResults();if(!geoCandidates.length)$('#geo-results').innerHTML='<p class="meta" style="margin-top:16px">Brak wyników. Podaj ulicę i miejscowość lub wskaż punkt na mapie.</p>';else{const c=geoCandidates[0];miniMap?.setView([c.lat,c.lng],c.precise?17:14);}}catch(error){if($('#geo-results'))$('#geo-results').innerHTML=`<p class="meta">${esc(error.message)}</p>`;}}
async function saveLocation(){if(!validCoords(geoSelection))return;const point={lat:geoSelection.lat,lng:geoSelection.lng,geoStatus:'verified',geoSource:geoSelection.source||'Ręcznie',fetchedAt:geoSelection.fetchedAt||new Date().toISOString(),sourceUrl:geoSelection.sourceUrl||null};if(geoTarget==='base'){state.settings.base={...point,label:$('#geo-query').value||geoSelection.label||'Baza'};}else Object.assign(state.locations[geoTarget],point);modal.close();if(miniMap){miniMap.remove();miniMap=null;}await save();toast('Lokalizacja zapisana.');}
function gpsBase(){if(!navigator.geolocation)return toast('Ta przeglądarka nie udostępnia lokalizacji.');toast('Czekam na lokalizację telefonu…');navigator.geolocation.getCurrentPosition(async p=>{state.settings.base={lat:p.coords.latitude,lng:p.coords.longitude,label:'Baza — lokalizacja telefonu',geoStatus:'verified',geoSource:'GPS',accuracy:p.coords.accuracy};await save();toast(p.coords.accuracy>100?'Lokalizacja zapisana, ale GPS jest niedokładny. Popraw pinezkę.':'Miejsce startu zapisane.');},()=>toast('Nie udało się odczytać GPS. Wpisz adres startu.'),{enableHighAccuracy:true,timeout:15000,maximumAge:30000});}

function showAddJob(){showModal('Dodaj zlecenie',`<form id="add-job-form" class="form-grid"><label class="field">Kod paczkomatu<input name="code" placeholder="np. RSL05HP"></label><label class="field">Tydzień<input type="date" name="week" value="${state.settings.week}" required></label><label class="field full">Adres / nazwa lokalizacji<input name="address" placeholder="Ulica, numer, miejscowość" required></label><label class="field">Rodzaj pracy<select name="type">${JOB_TYPES.map(type=>`<option>${esc(type)}</option>`).join('')}</select></label><label class="field full">Opis pracy<textarea name="details"></textarea></label><label class="field full">Telefon<input type="tel" name="phone"></label><label class="field full">Uwagi<textarea name="notes"></textarea></label></form>`,`<button data-act="close">Anuluj</button><button type="submit" form="add-job-form" class="primary">Dodaj zlecenie</button>`);}
async function addJob(form){const f=new FormData(form),code=text(f.get('code')).toUpperCase(),label=text(f.get('address')),week=monday(f.get('week'));if(!label)return;
  const id=uid(),locationId=code?`pm:${code}`:`manual:${uid()}`;state.locations[locationId]??={id:locationId,code,label,city:'',postal:'',geoStatus:'missing'};state.jobs.push({id,sourceKey:id,locationId,week,crew:state.settings.crew,type:text(f.get('type')),details:text(f.get('details')),notes:text(f.get('notes')),phone:text(f.get('phone')),status:'todo',requiresConfirmation:/nie jechac|bez potwierdzenia/.test(norm(f.get('notes'))),confirmed:false,source:{}});state.settings.week=week;modal.close();view='week';await save();toast('Zlecenie dodane.');}
async function saveVisit(form){const v=currentVisits().find(v=>v.id===form.dataset.visit);if(!v)return;const f=new FormData(form),now=new Date().toISOString();for(const job of v.jobs){job.confirmed=f.has(`confirmed:${job.id}`);const status=f.get(`status:${job.id}`);if(status!==job.status){job.status=status;if(status==='doing')job.startedAt??=now;if(status==='done')job.finishedAt=now;if(status==='todo'){job.startedAt=null;job.finishedAt=null;}}}modal.close();await save();toast('Zlecenia zapisane.');}

async function exportPlan(){
  const copy=structuredClone(state);delete copy.importResult;
  const blob=new Blob([JSON.stringify(copy,null,2)],{type:'application/json'}),name=`PaczkoPlan-${state.settings.week}.json`,file=new File([blob],name,{type:'application/json'});
  if(navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file],title:'Plan ekipy — PaczkoPlan'});return;}catch(e){if(e.name==='AbortError')return;}}
  download(blob,name);toast('Kopia planu gotowa. Wyślij plik koledze lub zapisz go w Plikach.');
}
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
let restorePreview=null;
async function readBackup(file){if(file.size>20*1024*1024)return toast('Kopia planu jest zbyt duża.');try{const parsed=validateBackup(JSON.parse(await file.text()));for(const p of Object.values(parsed.plans)){if(p.matrix?.durations)p.matrix.durations=p.matrix.durations.map(r=>r.map(v=>v===null?Infinity:v));}restorePreview=parsed;showModal('Wczytaj zapisany plan',`<p>Plik zawiera <strong>${parsed.jobs.length} zleceń</strong>.</p><p>Wczytanie zastąpi plan na tym urządzeniu. Przed zmianą możesz pobrać obecną kopię.</p>`,`<button data-act="export">Zapisz obecną kopię</button><button class="primary" data-act="confirm-restore">Wczytaj plan</button>`);}catch(error){toast(error.message);}finally{$('#backup-input').value='';}}
async function install(){if(deferredInstall){await deferredInstall.prompt();deferredInstall=null;return;}const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone;if(standalone)return toast('PaczkoPlan jest już otwarty jako aplikacja.');showModal('Dodaj PaczkoPlan do telefonu',`<div class="install-instructions"><h3>iPhone</h3><ol><li>Otwórz tę stronę w <strong>Safari</strong>.</li><li>Naciśnij <strong>Udostępnij</strong>.</li><li>Wybierz <strong>Do ekranu początkowego</strong>.</li><li>Włącz otwieranie jako aplikację www i naciśnij <strong>Dodaj</strong>.</li></ol><h3>Android</h3><p>W menu Chrome wybierz <strong>Zainstaluj aplikację</strong> lub <strong>Dodaj do ekranu głównego</strong>.</p><p class="privacy-text">Po instalacji otwórz aplikację i wczytaj Excel albo plik planu. Safari i aplikacja z ekranu głównego mogą przechowywać osobne dane — w razie potrzeby przenieś je kopią planu.</p></div>`,`<button class="primary" data-act="close">Rozumiem</button>`);}

document.addEventListener('click',async event=>{
  const button=event.target.closest('[data-act]');if(!button||button.disabled)return;const action=button.dataset.act,id=button.dataset.id;
  if(busy&&!['cancel-geo'].includes(action))return;
  try{switch(action){
    case 'view':view=button.dataset.view;render();window.scrollTo({top:0});break;
    case 'choose-excel':event.stopPropagation();$('#excel-input').click();break;
    case 'restore':$('#backup-input').click();break;
    case 'close':closeModal();break;
    case 'confirm-import':await confirmImport();break;
    case 'resolve-all':await resolveAll();break;
    case 'cancel-geo':cancelGeo=true;button.disabled=true;button.textContent='Kończę bieżące zapytanie…';break;
    case 'day':selectedDay=Number(button.dataset.day);render();loadDayRoute();break;
    case 'week-shift':state.settings.week=addDays(state.settings.week,Number(button.dataset.offset));state.settings.crew='';await save();break;
    case 'refresh-matrix':await refreshMatrix();break;
    case 'optimize-day':await optimizeDayOrder(selectedDay);break;
    case 'reset-day':await resetDay(selectedDay);break;
    case 'toggle-overnight':await toggleOvernight(Number(button.dataset.day));break;
    case 'materials':await showMaterials(id);break;
    case 'materials-route':await showMaterialsRoute(selectedDay);break;
    case 'work-map':showWorkMap(id);break;
    case 'base-layer':setWorkBaseLayer(button.dataset.base);break;
    case 'add-note':showNoteEditor(id);break;
    case 'clear-note':await clearNote(id);break;
    case 'fit-map':drawMapAgain();break;
    case 'load-route':{const p=currentPlan();if(p?.geometries)delete p.geometries[routeKey(state.settings.base,dayRoute(selectedDay))];await loadDayRoute();break;}
    case 'visit':showVisit(id);break;
    case 'move-up':await moveBy(id,-1);break;
    case 'move-down':await moveBy(id,1);break;
    case 'move-day':showMoveDay(id);break;
    case 'add-stop':if(await addStop(selectedDay,id)){toast('Przystanek dodany.');loadDayRoute();}break;
    case 'remove-stop':await removeStop(id);toast('Przystanek usunięty z dnia.');break;
    case 'delete-import':await deleteImport(id);break;
    case 'base':showLocation('base');break;
    case 'base-gps':gpsBase();break;
    case 'location':showLocation(id);break;
    case 'geo-candidate':geoSelection=geoCandidates[Number(button.dataset.index)];miniMap?.setView([geoSelection.lat,geoSelection.lng],17);updateGeoSelection();break;
    case 'save-location':await saveLocation();break;
    case 'add-job':showAddJob();break;
    case 'export':await exportPlan();break;
    case 'confirm-restore':if(restorePreview){state=restorePreview;restorePreview=null;modal.close();view='week';await save();toast('Plan wczytany.');}break;
    case 'install':await install();break;
    case 'update':await save({redraw:false});waitingWorker?.postMessage({type:'SKIP_WAITING'});break;
  }}catch(error){toast(error.message||'Nie udało się wykonać tej operacji.');}
});
function drawMapAgain(){if(map){map.remove();map=null;}drawMap();}
document.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target.id==='import-drop'){event.preventDefault();$('#excel-input').click();}});
document.addEventListener('submit',async event=>{event.preventDefault();const form=event.target;if(busy)return;try{if(form.id==='visit-form')await saveVisit(form);if(form.id==='geo-form')await searchGeo(new FormData(form).get('query'));if(form.id==='add-job-form')await addJob(form);if(form.id==='move-form')await moveDayVisit(form.dataset.visit,Number(new FormData(form).get('day')));if(form.id==='note-form')await saveNote(form);}catch(e){toast(e.message);}});
document.addEventListener('change',async event=>{const el=event.target;if(el.dataset.parcels!==undefined){if(workMap)toggleParcelsLayer(el.checked);return;}if(el.closest?.('#work-layers')){if(workMap)toggleGesutLayer(el.dataset.layer,el.checked);return;}if(el.id==='week-picker'){if(!isoDate(el.value))return;state.settings.week=monday(el.value);state.settings.crew='';await save();}if(el.id==='crew-picker'){state.settings.crew=el.value;await save();}if(el.id==='job-filter'){filter=el.value;render();}if(el.id==='excel-input'&&el.files[0])await readExcel(el.files[0]);if(el.id==='backup-input'&&el.files[0])await readBackup(el.files[0]);});
let searchTimer;document.addEventListener('input',event=>{if(event.target.id==='search-jobs'){search=event.target.value;clearTimeout(searchTimer);searchTimer=setTimeout(()=>{render();const e=$('#search-jobs');if(e){e.focus();e.setSelectionRange(search.length,search.length);}},200);}});
modal.addEventListener('cancel',e=>{if(busy)e.preventDefault();});
window.addEventListener('online',()=>{render();toast('Połączenie przywrócone.');});window.addEventListener('offline',()=>render());
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstall=event;});
try{const saved=await loadState();if(saved)state=validateBackup(saved);}catch(error){saveError=error.message;}
selectedDay=(new Date().getDay()+6)%7;render();
if('serviceWorker'in navigator&&location.protocol!=='file:'){
  navigator.serviceWorker.register('./sw.js').then(reg=>{
    if(reg.waiting){waitingWorker=reg.waiting;render();}
    reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller){waitingWorker=worker;render();}});});
    // A home-screen PWA is usually "reopened" by the OS resuming a frozen tab, not by a real page load —
    // register() above then never re-runs, so it alone would miss updates for days. Re-checking whenever
    // the app comes back to the foreground catches the version pushed while it was in the background.
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')reg.update().catch(()=>{});});
    window.addEventListener('focus',()=>reg.update().catch(()=>{}));
  }).catch(()=>toast('Nie udało się przygotować aplikacji do pracy offline. Otwórz stronę ponownie z internetem.'));
  let refreshing=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!refreshing&&waitingWorker){refreshing=true;location.reload();}});
}
if(navigator.storage?.persist)navigator.storage.persist().catch(()=>{});
