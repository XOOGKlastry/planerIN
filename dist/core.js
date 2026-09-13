// Pure data and route functions. Coordinates are WGS84, costs in seconds/metres.
export const VERSION = 1;
export const DAY_NAMES = ['Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota','Niedziela'];
export const DEFAULT_DURATIONS = { 'Pomiary':45, 'Serwis':60, 'Prace dodatkowe':90, 'Prace gwarancyjne':60, 'Montaż':180 };
export const norm = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l').replace(/Ł/g,'L').toLowerCase().replace(/\s+/g,' ').trim();
export const text = value => String(value ?? '').trim();
export const uid = () => globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export function hash(value) {
  let h = 2166136261;
  for (const char of value) { h ^= char.charCodeAt(0); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36);
}
export function isoDate(value, XLSX) {
  if (value instanceof Date && !isNaN(value)) return `${value.getFullYear()}-${String(value.getMonth()+1).padStart(2,'0')}-${String(value.getDate()).padStart(2,'0')}`;
  if (typeof value === 'number' && XLSX) {
    const d = XLSX.SSF.parse_date_code(value);
    return d ? `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}` : null;
  }
  const s = text(value); let m;
  if ((m = s.match(/^(\d{4})-(\d{2})-(\d{2})/))) {
    const d = new Date(`${m[1]}-${m[2]}-${m[3]}T12:00:00`);
    return !isNaN(d) && d.getMonth()+1 === +m[2] && d.getDate() === +m[3] ? m[0] : null;
  }
  if ((m = s.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/))) return isoDate(`${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`);
  return null;
}
export function addDays(date, count) {
  const d = new Date(`${date}T12:00:00`); d.setDate(d.getDate()+count);
  return isoDate(d);
}
export function monday(date) {
  const d = new Date(`${date}T12:00:00`);
  return addDays(date, -(d.getDay()+6)%7);
}
export const today = () => isoDate(new Date());
export const timeMinutes = s => { const [h,m] = String(s).split(':').map(Number); return h*60+m; };
export function formatTime(minutes) {
  if (!Number.isFinite(minutes)) return '—';
  const v = Math.round(minutes);
  return `${String(Math.floor(v/60)%24).padStart(2,'0')}:${String((v%60+60)%60).padStart(2,'0')}${v>=1440?' (+1 dzień)':''}`;
}
export function formatDuration(minutes) {
  if (!Number.isFinite(minutes)) return '—';
  const m = Math.round(minutes); return m>=60 ? `${Math.floor(m/60)} h ${m%60 ? `${m%60} min`:''}`.trim() : `${m} min`;
}
export const validCoords = p => !!p && Number.isFinite(p.lat) && Number.isFinite(p.lng) && Math.abs(p.lat)<=90 && Math.abs(p.lng)<=180;
export function haversine(a,b) {
  const rad=x=>x*Math.PI/180, dlat=rad(b.lat-a.lat), dlon=rad(b.lng-a.lng);
  const v=Math.sin(dlat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dlon/2)**2;
  return 6371000*2*Math.atan2(Math.sqrt(v),Math.sqrt(Math.max(0,1-v)));
}
export function parseCoordinates(value) {
  const s = text(value);
  const match = s.match(/(?:@|q=|query=|ll=)?(-?\d{1,2}\.\d+)\s*[,; ]\s*(-?\d{1,3}\.\d+)/);
  if (!match) return null;
  const p={lat:+match[1],lng:+match[2]}; return validCoords(p) ? p : null;
}
export function defaultState() {
  return {version:VERSION,jobs:[],locations:{},plans:{},imports:[],settings:{week:monday(today()),crew:'',start:'07:00',end:'17:00',days:[0,1,2,3,4],base:null,durations:{...DEFAULT_DURATIONS}},updatedAt:null};
}
export function parseRows(rows, {fileName='Import',sheetName='Arkusz',XLSX,defaultWeek=monday(today())}={}) {
  let headerIndex=rows.findIndex(r=>r.some(c=>['nazwa pm','paczkomat','kod paczkomatu','adres','nazwa lokalizacji'].includes(norm(c))));
  if(headerIndex<0) throw new Error(`Arkusz „${sheetName}”: nie znaleziono kolumny Nazwa PM lub Adres.`);
  const headers=rows[headerIndex].map(text), normalized=headers.map(norm);
  const get=(row,...keys)=>{ for(const key of keys){const i=normalized.indexOf(norm(key)); if(i>=0&&row[i]!==null&&row[i]!==undefined&&text(row[i])!=='') return row[i];} return '';};
  const jobs=[],locations={},issues=[],seen=new Set(); let nonempty=0,duplicates=0;
  for(let index=headerIndex+1;index<rows.length;index++) {
    const row=rows[index]; if(!row.some(v=>text(v)!=='')) continue; nonempty++;
    const code=text(get(row,'Nazwa PM','Paczkomat','Kod paczkomatu')).toUpperCase();
    const label=text(get(row,'Nazwa lokalizacji','Adres','Address'));
    const city=text(get(row,'Miasto','Miejscowość'));
    const postal=text(get(row,'Kod pocztowy'));
    if(!code&&!label){issues.push({row:index+1,message:'Brak kodu paczkomatu i adresu.'});continue;}
    const dateValue=get(row,'Data','Tydzień','Data wykonania');
    const date=isoDate(dateValue,XLSX);
    if(dateValue&&!date) issues.push({row:index+1,message:'Nieczytelna data — przyjęto wybrany tydzień.'});
    const week=date?monday(date):defaultWeek;
    const type=text(get(row,'Zaplanowane prace','Typ pracy','Typ'))||'Serwis';
    const details=text(get(row,'Podłoże','Opis','Opis prac','Szczegóły'));
    const notes=[get(row,'Uwagi Global'),get(row,'Komentarz GPBS'),get(row,'Uwagi')].map(text).filter(Boolean).join('\n');
    const ticket=text(get(row,'Zgłoszenie','Nr zlecenia','ID zlecenia'));
    const place=text(get(row,'Miejsce'));
    const crew=text(get(row,'Ekipy','Ekipa'));
    const locationId=code?`pm:${code}`:`addr:${hash(norm([label,city,postal].join('|')))}`;
    const identity=JSON.stringify([week,crew,locationId,ticket||place,type,ticket?'':details]);
    const sourceKey=`job:${hash(identity)}`;
    if(seen.has(sourceKey)){ duplicates++;issues.push({row:index+1,message:'Identyczne zlecenie występuje już w tym imporcie.'});continue;} seen.add(sourceKey);
    const minuteInput=get(row,'Czas [min]','Czas min','Czas usługi','Czas pracy','Minuty');
    const minutes=Number(String(minuteInput).replace(',','.'));
    const explicitMinutes=minuteInput!==''&&Number.isFinite(minutes)&&minutes>0&&minutes<=1440;
    const duration=explicitMinutes?minutes:(DEFAULT_DURATIONS[type]??60);
    const source={}; headers.forEach((h,i)=>{if(h&&text(row[i]))source[h]=row[i] instanceof Date?isoDate(row[i]):row[i];});
    const rawCoords=parseCoordinates(get(row,'Współrzędne','GPS','Lokalizacja'));
    const latRaw=get(row,'Lat','Latitude','Szerokość'),lngRaw=get(row,'Lon','Lng','Longitude','Długość');
    const columnCoords=latRaw!==''&&lngRaw!==''?{lat:Number(String(latRaw).replace(',','.')),lng:Number(String(lngRaw).replace(',','.'))}:null;
    const coords=rawCoords||(validCoords(columnCoords)?columnCoords:null);
    locations[locationId]={id:locationId,code,label:label||code,city,postal,...coords,geoStatus:coords?'verified':'missing',geoSource:coords?'Excel':null};
    jobs.push({id:sourceKey,sourceKey,locationId,week,crew,type,details,notes,ticket,place,source,sourceRow:index+1,sourceSheet:sheetName,sourceFile:fileName,duration,durationConfirmed:explicitMinutes,phone:[get(row,'Telefony'),get(row,'Nr telefonu techniczne'),get(row,'Nr telefonu administracja')].map(text).find(Boolean)||'',requiresConfirmation:/nie jechac|bez potwierdzenia|sprawdzic u koordynatora/.test(norm(notes)),confirmed:false,status:'todo',lockedDay:null,priority:/pilne/.test(norm(get(row,'Priorytet')))});
  }
  return {jobs,locations,issues,nonempty,duplicates};
}
export function mergeImport(state, parsed) {
  const byId=new Map(state.jobs.map(j=>[j.sourceKey||j.id,j])); let added=0,updated=0;
  for(const job of parsed.jobs){const old=byId.get(job.sourceKey); if(old){updated++; byId.set(job.sourceKey,{...old,...job,id:old.id,status:old.status,duration:old.duration,durationConfirmed:old.durationConfirmed,lockedDay:old.lockedDay,confirmed:old.confirmed,startedAt:old.startedAt,finishedAt:old.finishedAt});}else{added++;byId.set(job.sourceKey,job);}}
  const locations={...state.locations};
  for(const [id,loc] of Object.entries(parsed.locations)){const old=locations[id]; locations[id]=old?{...old,...loc,lat:old.lat??loc.lat,lng:old.lng??loc.lng,geoStatus:old.geoStatus==='verified'?'verified':loc.geoStatus,geoSource:old.geoSource??loc.geoSource}:loc;}
  return {...state,jobs:[...byId.values()],locations,importResult:{added,updated}};
}
export function makeVisits(jobs, locations) {
  const grouped=new Map();
  for(const job of jobs) {
    // A manual day constraint creates a separate visit when incompatible.
    const key=`${job.locationId}|${job.lockedDay??'any'}`;
    if(!grouped.has(key))grouped.set(key,{id:`v:${hash(key)}`,locationId:job.locationId,location:locations[job.locationId],jobs:[],lockedDay:job.lockedDay});
    grouped.get(key).jobs.push(job);
  }
  return [...grouped.values()].map(v=>({...v,id:`v:${hash(v.jobs.map(j=>j.id).sort().join('|'))}`,duration:v.jobs.reduce((s,j)=>s+j.duration,0),blocked:v.jobs.some(j=>j.requiresConfirmation&&!j.confirmed),done:v.jobs.every(j=>j.status==='done'),priority:v.jobs.some(j=>j.priority)}));
}
export function routeCost(route,cost){let total=0,prev=0;for(const i of route){const leg=cost[prev]?.[i];if(!Number.isFinite(leg))return Infinity;total+=leg;prev=i;} const end=cost[prev]?.[0];return total+(Number.isFinite(end)?end:Infinity);}
// Directed 2-opt: compare the entire path, including reversed internal arcs.
export function improveRoute(route,cost) {
  let best=route.slice(),bestCost=routeCost(best,cost),changed=true,round=0;
  while(changed&&round++<30){changed=false; for(let i=0;i<best.length-1;i++)for(let j=i+1;j<best.length;j++){const next=[...best.slice(0,i),...best.slice(i,j+1).reverse(),...best.slice(j+1)];const c=routeCost(next,cost);if(c<bestCost-0.1){best=next;bestCost=c;changed=true;}}}
  return best;
}
// Exact directed TSP for small day routes; subset DP O(n² 2^n).
export function exactRoute(route,cost){
  if(route.length<2)return route.slice(); if(route.length>11)return improveRoute(route,cost);
  const n=route.length,size=1<<n,dp=Array.from({length:size},()=>Array(n).fill(Infinity)),parent=Array.from({length:size},()=>Array(n).fill(-1));
  for(let i=0;i<n;i++)dp[1<<i][i]=cost[0][route[i]];
  for(let mask=1;mask<size;mask++)for(let last=0;last<n;last++)if(mask&(1<<last))for(let next=0;next<n;next++)if(!(mask&(1<<next))){const v=dp[mask][last]+cost[route[last]][route[next]],m=mask|(1<<next);if(v<dp[m][next]){dp[m][next]=v;parent[m][next]=last;}}
  let last=0;for(let i=1;i<n;i++)if(dp[size-1][i]+cost[route[i]][0]<dp[size-1][last]+cost[route[last]][0])last=i;
  if(!Number.isFinite(dp[size-1][last]+cost[route[last]][0]))return route.slice();
  let mask=size-1;const result=[];while(last>=0){result.unshift(route[last]);const prev=parent[mask][last];mask^=1<<last;last=prev;} return result;
}
// Insertion favours cheap detours into a day already in use over a fresh round trip, which can leave later
// days completely empty even when work could be spread out. Move one unpinned visit per empty day, taken from
// whichever busier day can spare it, so a work day is only left free when there is genuinely nothing to give it.
function fillEmptyDays(routes,days,cost,capacity,visits) {
  for(const day of days) {
    if(routes[day].length)continue;
    let best=null;
    for(const donor of days) {
      if(donor===day||routes[donor].length<=1)continue;
      for(const index of routes[donor]) {
        if(visits[index-1].lockedDay!==null)continue;
        const standalone=routeCost([index],cost)+visits[index-1].duration*60;
        if(standalone>capacity)continue;
        if(!best||standalone<best.standalone)best={donor,index,standalone};
      }
    }
    if(best){routes[best.donor]=exactRoute(routes[best.donor].filter(i=>i!==best.index),cost);routes[day]=[best.index];}
  }
  return routes;
}
export function planWeek(visits,cost,settings) {
  const capacity=(timeMinutes(settings.end)-timeMinutes(settings.start))*60;
  if(!Number.isFinite(capacity)||capacity<=0)throw new Error('Godzina końca musi być późniejsza od początku pracy.');
  if(!settings.days.length)throw new Error('Wybierz przynajmniej jeden dzień pracy.');
  const indices=visits.map((v,i)=>i+1),service=i=>visits[i-1].duration*60;
  const load=r=>routeCost(r,cost)+r.reduce((s,i)=>s+service(i),0);
  let best=null;
  // Several deterministic insertion orders reduce the greedy partition bias.
  for(let seed=0;seed<8;seed++){
    const routes=Object.fromEntries(settings.days.map(d=>[d,[]])),unassigned=[];
    const order=indices.slice().sort((a,b)=>{
      const A=visits[a-1],B=visits[b-1];
      if((A.lockedDay!==null)!==(B.lockedDay!==null))return A.lockedDay!==null?-1:1;
      if(A.priority!==B.priority)return A.priority?-1:1;
      if(seed===0)return (cost[0][b]+service(b))-(cost[0][a]+service(a));
      if(seed===1)return service(b)-service(a);
      return parseInt(hash(`${seed}|${A.id}`),36)-parseInt(hash(`${seed}|${B.id}`),36);
    });
    for(const index of order){
      const visit=visits[index-1];let candidate=null;
      if(visit.blocked){unassigned.push({index,reason:'Wymaga potwierdzenia przed wyjazdem'});continue;}
      for(const day of settings.days){if(visit.lockedDay!==null&&visit.lockedDay!==day)continue;
        const old=routes[day],oldCost=routeCost(old,cost);
        for(let pos=0;pos<=old.length;pos++){const trial=[...old.slice(0,pos),index,...old.slice(pos)],duration=load(trial);if(duration>capacity)continue;
          const score=routeCost(trial,cost)-oldCost+duration*0.025;
          if(!candidate||score<candidate.score)candidate={day,trial,score};
        }
      }
      if(candidate)routes[candidate.day]=candidate.trial;else unassigned.push({index,reason:visit.lockedDay!==null&&!settings.days.includes(visit.lockedDay)?'Przypięty dzień nie jest dniem pracy':'Nie mieści się w godzinach pracy lub brak dojazdu'});
    }
    for(const day of settings.days)routes[day]=exactRoute(routes[day],cost);
    // Relocate between days while respecting time and fixed-day constraints.
    for(let round=0;round<3;round++){
      let changed=false;
      for(const from of settings.days)for(const index of routes[from].slice()){
        if(visits[index-1].lockedDay!==null)continue;
        for(const to of settings.days){if(from===to)continue;
          const a=routes[from].filter(i=>i!==index),b=exactRoute([...routes[to],index],cost);
          if(load(b)<=capacity&&routeCost(a,cost)+routeCost(b,cost)<routeCost(routes[from],cost)+routeCost(routes[to],cost)-1){routes[from]=a;routes[to]=b;changed=true;break;}
        }
      } if(!changed)break;
    }
    for(const day of settings.days)routes[day]=exactRoute(routes[day],cost);
    fillEmptyDays(routes,settings.days,cost,capacity,visits);
    const score=unassigned.reduce((s,u)=>s+(visits[u.index-1].priority?2:1)*1e9,0)+Object.values(routes).reduce((s,r)=>s+routeCost(r,cost),0);
    if(!best||score<best.score)best={routes,unassigned,score};
  }
  return {routes:Object.fromEntries(Object.entries(best.routes).map(([day,r])=>[day,r.map(i=>visits[i-1].id)])),unassigned:best.unassigned.map(u=>({id:visits[u.index-1].id,reason:u.reason})),createdAt:new Date().toISOString(),provider:'OSRM',visits:visits.map(v=>v.id)};
}
export function schedule(routeIds,visits,cost,start,dayDate) {
  let clock=timeMinutes(start),prev=0,driving=0,work=0,hasMissing=false;const entries=[];
  const lookup=new Map(visits.map((v,i)=>[v.id,{visit:v,index:i+1}]));
  for(const id of routeIds){const found=lookup.get(id);if(!found){hasMissing=true;clock=NaN;continue;}
    const {visit,index}=found,seconds=cost?.[prev]?.[index];const travel=Number.isFinite(seconds)?seconds/60:null;
    if(travel===null){clock=NaN;hasMissing=true;}else{clock+=travel;driving+=travel;}
    const arrival=clock;let finish=clock+visit.duration;
    const completed=visit.jobs.every(j=>j.status==='done'&&j.finishedAt);
    if(completed){const actual=new Date(Math.max(...visit.jobs.map(j=>new Date(j.finishedAt).getTime())));if(isoDate(actual)===dayDate)finish=actual.getHours()*60+actual.getMinutes();}
    entries.push({visit,travel,arrival,finish});clock=finish;work+=visit.duration;prev=index;
  }
  const back=routeIds.length?(Number.isFinite(cost?.[prev]?.[0])?cost[prev][0]/60:null):0;
  if(back===null){clock=NaN;hasMissing=true;}else{clock+=back;driving+=back;}
  return {entries,finish:clock,driving,work,back,hasMissing};
}
export function googleMapsUrl(location,base) {
  const destination=validCoords(location)?`${location.lat},${location.lng}`:[location.label,location.city,location.postal,'Polska'].filter(Boolean).join(', ');
  const params=new URLSearchParams({api:'1',destination,travelmode:'driving',dir_action:'navigate'});
  if(base&&validCoords(base))params.set('origin',`${base.lat},${base.lng}`);
  return `https://www.google.com/maps/dir/?${params}`;
}
export function validateBackup(data) {
  if(!data||data.version!==VERSION||!Array.isArray(data.jobs)||!data.locations||!data.settings||!data.plans)throw new Error('To nie jest plik planu PaczkoPlan.');
  if(data.jobs.length>3000)throw new Error('Plik ma zbyt wiele zleceń.');
  const timePattern=/^(?:[01]\d|2[0-3]):[0-5]\d$/;
  if(!timePattern.test(data.settings.start)||!timePattern.test(data.settings.end)||timeMinutes(data.settings.end)<=timeMinutes(data.settings.start)||!isoDate(data.settings.week))throw new Error('Niepoprawne ustawienia planu.');
  if(!Array.isArray(data.settings.days)||!data.settings.days.length||data.settings.days.some(d=>!Number.isInteger(d)||d<0||d>6))throw new Error('Niepoprawne dni pracy.');
  if(data.settings.base&&!validCoords(data.settings.base))throw new Error('Niepoprawne współrzędne bazy.');
  if(!data.settings.durations||Object.values(data.settings.durations).some(v=>!Number.isFinite(v)||v<=0||v>1440))throw new Error('Niepoprawne czasy usług.');
  const jobIds=new Set();
  for(const job of data.jobs){if(!job.id||jobIds.has(job.id)||!data.locations[job.locationId]||!Number.isFinite(job.duration)||job.duration<=0||job.duration>1440||!isoDate(job.week)||!['todo','doing','done'].includes(job.status)||!(job.lockedDay===null||Number.isInteger(job.lockedDay)&&job.lockedDay>=0&&job.lockedDay<=6))throw new Error('Niepoprawne zlecenie w kopii planu.');jobIds.add(job.id);}
  for(const p of Object.values(data.plans)){
    if(!p.routes||Object.entries(p.routes).some(([d,ids])=>!/^\d$/.test(d)||+d>6||!Array.isArray(ids)||ids.some(id=>typeof id!=='string')))throw new Error('Niepoprawna trasa w kopii planu.');
    const ids=Object.values(p.routes).flat();if(new Set(ids).size!==ids.length)throw new Error('Wizyta występuje w kilku dniach.');
    if(p.matrix){const n=p.matrix.visitIds?.length+1;if(!Number.isInteger(n)||n>71||!Array.isArray(p.matrix.durations)||p.matrix.durations.length!==n||p.matrix.durations.some(row=>!Array.isArray(row)||row.length!==n||row.some(v=>v!==null&&v!==Infinity&&(!Number.isFinite(v)||v<0))))throw new Error('Niepoprawne czasy przejazdu w kopii planu.');}
  }
  return data;
}
