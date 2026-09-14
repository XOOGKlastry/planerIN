// Pure data and route functions. Coordinates are WGS84, costs in seconds/metres.
export const VERSION = 3;
export const DAY_NAMES = ['Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota','Niedziela'];
export const JOB_TYPES = ['Pomiary','Serwis','Prace dodatkowe','Prace gwarancyjne','Montaż'];
export const norm = value => String(value ?? '').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ł/g,'l').replace(/Ł/g,'L').toLowerCase().replace(/\s+/g,' ').trim();
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
  return {version:VERSION,jobs:[],locations:{},plans:{},imports:[],settings:{week:monday(today()),crew:'',base:null},updatedAt:null};
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
    const source={}; headers.forEach((h,i)=>{if(h&&text(row[i]))source[h]=row[i] instanceof Date?isoDate(row[i]):row[i];});
    const rawCoords=parseCoordinates(get(row,'Współrzędne','GPS','Lokalizacja'));
    const latRaw=get(row,'Lat','Latitude','Szerokość'),lngRaw=get(row,'Lon','Lng','Longitude','Długość');
    const columnCoords=latRaw!==''&&lngRaw!==''?{lat:Number(String(latRaw).replace(',','.')),lng:Number(String(lngRaw).replace(',','.'))}:null;
    const coords=rawCoords||(validCoords(columnCoords)?columnCoords:null);
    locations[locationId]={id:locationId,code,label:label||code,city,postal,...coords,geoStatus:coords?'verified':'missing',geoSource:coords?'Excel':null};
    jobs.push({id:sourceKey,sourceKey,locationId,week,crew,type,details,notes,ticket,place,source,sourceRow:index+1,sourceSheet:sheetName,sourceFile:fileName,phone:[get(row,'Telefony'),get(row,'Nr telefonu techniczne'),get(row,'Nr telefonu administracja')].map(text).find(Boolean)||'',requiresConfirmation:/nie jechac|bez potwierdzenia|sprawdzic u koordynatora/.test(norm(notes)),confirmed:false,status:'todo'});
  }
  return {jobs,locations,issues,nonempty,duplicates};
}
export function mergeImport(state, parsed) {
  const byId=new Map(state.jobs.map(j=>[j.sourceKey||j.id,j])); let added=0,updated=0;
  for(const job of parsed.jobs){const old=byId.get(job.sourceKey); if(old){updated++; byId.set(job.sourceKey,{...old,...job,id:old.id,status:old.status,confirmed:old.confirmed,startedAt:old.startedAt,finishedAt:old.finishedAt});}else{added++;byId.set(job.sourceKey,job);}}
  const locations={...state.locations};
  for(const [id,loc] of Object.entries(parsed.locations)){const old=locations[id]; locations[id]=old?{...old,...loc,lat:old.lat??loc.lat,lng:old.lng??loc.lng,geoStatus:old.geoStatus==='verified'?'verified':loc.geoStatus,geoSource:old.geoSource??loc.geoSource}:loc;}
  return {...state,jobs:[...byId.values()],locations,importResult:{added,updated}};
}
export function makeVisits(jobs, locations) {
  const grouped=new Map();
  for(const job of jobs) {
    const key=job.locationId;
    if(!grouped.has(key))grouped.set(key,{id:`v:${hash(key)}`,locationId:job.locationId,location:locations[job.locationId],jobs:[]});
    grouped.get(key).jobs.push(job);
  }
  return [...grouped.values()].map(v=>({...v,id:`v:${hash(v.jobs.map(j=>j.id).sort().join('|'))}`,blocked:v.jobs.some(j=>j.requiresConfirmation&&!j.confirmed),done:v.jobs.every(j=>j.status==='done')}));
}
export function routeCost(route,cost){let total=0,prev=0;for(const i of route){const leg=cost[prev]?.[i];if(!Number.isFinite(leg))return Infinity;total+=leg;prev=i;} const end=cost[prev]?.[0];return total+(Number.isFinite(end)?end:Infinity);}
// Rank the remaining pool by travel time from the last chosen stop (fromIndex; 0 = base), nearest first.
// Unreachable candidates (no route data) sort last rather than being hidden, so nothing silently disappears.
export function rankCandidates(fromIndex, poolIndices, cost) {
  return poolIndices.map(index=>{
    const legSeconds=cost?.[fromIndex]?.[index],backSeconds=cost?.[index]?.[0];
    return {index,from:Number.isFinite(legSeconds)?legSeconds/60:null,back:Number.isFinite(backSeconds)?backSeconds/60:null};
  }).sort((a,b)=>{
    if(a.from===null&&b.from===null)return 0;
    if(a.from===null)return 1; if(b.from===null)return -1;
    return a.from-b.from;
  });
}
// Travel time for a day built by hand: the leg into each stop, running total, and the trip back to base (index 0)
// from the last one. startIndex lets a day begin somewhere other than base (an overnight stay the day before).
export function routeSummary(routeIds, visits, cost, startIndex=0) {
  let prev=startIndex,driving=0,hasMissing=false; const entries=[];
  const lookup=new Map(visits.map((v,i)=>[v.id,{visit:v,index:i+1}]));
  for(const id of routeIds) {
    const found=lookup.get(id); if(!found){hasMissing=true;continue;}
    const {visit,index}=found,seconds=cost?.[prev]?.[index];
    const travel=Number.isFinite(seconds)?seconds/60:null;
    if(travel===null)hasMissing=true; else driving+=travel;
    entries.push({visit,travel}); prev=index;
  }
  const backSeconds=cost?.[prev]?.[0];
  const back=Number.isFinite(backSeconds)?backSeconds/60:null;
  if(back===null)hasMissing=true;
  return {entries,driving,back,hasMissing};
}
// One-shot suggestion: chain the remaining pool onto each day (nearest-next), starting a new day once it
// hits the stop or drive-time cap. Existing stops on a day are kept and only extended, never reordered.
export function autoDistribute(days, anchors, routes, poolIndices, cost, {maxStopsPerDay=6,maxDriveMinutes=180}={}) {
  const result=Object.fromEntries(days.map(d=>[d,[...(routes[d]||[])]]));
  const remaining=new Set(poolIndices);
  for(const day of days) {
    if(!remaining.size)break;
    let last=result[day].length?result[day].at(-1):(anchors[day]??0);
    let driveSeconds=0,count=result[day].length;
    while(remaining.size&&count<maxStopsPerDay&&driveSeconds<maxDriveMinutes*60) {
      let best=null;
      for(const index of remaining){const leg=cost?.[last]?.[index];if(Number.isFinite(leg)&&(!best||leg<best.cost))best={index,cost:leg};}
      if(!best)break;
      result[day].push(best.index);remaining.delete(best.index);last=best.index;driveSeconds+=best.cost;count++;
    }
  }
  return {routes:result,leftover:[...remaining]};
}
export function googleMapsUrl(location,base) {
  const destination=validCoords(location)?`${location.lat},${location.lng}`:[location.label,location.city,location.postal,'Polska'].filter(Boolean).join(', ');
  const params=new URLSearchParams({api:'1',destination,travelmode:'driving',dir_action:'navigate'});
  if(base&&validCoords(base))params.set('origin',`${base.lat},${base.lng}`);
  return `https://www.google.com/maps/dir/?${params}`;
}
export function streetViewUrl(location) {
  if(!validCoords(location))return null;
  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${location.lat},${location.lng}`;
}
export function googleSearchUrl(query, near) {
  const url=`https://www.google.com/maps/search/${encodeURIComponent(query)}`;
  return near&&validCoords(near)?`${url}/@${near.lat},${near.lng},13z`:url;
}
export function bookingUrl(location) {
  const query=[location.label,location.city].filter(Boolean).join(', ')||(validCoords(location)?`${location.lat},${location.lng}`:'');
  return `https://www.booking.com/searchresults.pl.html?ss=${encodeURIComponent(query)}`;
}
export function validateBackup(data) {
  if(!data||data.version!==VERSION||!Array.isArray(data.jobs)||!data.locations||!data.settings||!data.plans)throw new Error('To nie jest plik planu PaczkoPlan.');
  if(data.jobs.length>3000)throw new Error('Plik ma zbyt wiele zleceń.');
  if(!isoDate(data.settings.week))throw new Error('Niepoprawne ustawienia planu.');
  if(data.settings.base&&!validCoords(data.settings.base))throw new Error('Niepoprawne współrzędne bazy.');
  const jobIds=new Set();
  for(const job of data.jobs){if(!job.id||jobIds.has(job.id)||!data.locations[job.locationId]||!isoDate(job.week)||!['todo','doing','done'].includes(job.status))throw new Error('Niepoprawne zlecenie w kopii planu.');jobIds.add(job.id);}
  for(const p of Object.values(data.plans)){
    if(!p.routes||Object.entries(p.routes).some(([d,ids])=>!/^\d$/.test(d)||+d>6||!Array.isArray(ids)||ids.some(id=>typeof id!=='string')))throw new Error('Niepoprawna trasa w kopii planu.');
    const ids=Object.values(p.routes).flat();if(new Set(ids).size!==ids.length)throw new Error('Wizyta występuje w kilku dniach.');
    if(p.overnight&&Object.entries(p.overnight).some(([d,v])=>!/^\d$/.test(d)||+d>6||typeof v!=='boolean'))throw new Error('Niepoprawny nocleg w kopii planu.');
    if(p.matrix){const n=p.matrix.visitIds?.length+1;if(!Number.isInteger(n)||n>71||!Array.isArray(p.matrix.durations)||p.matrix.durations.length!==n||p.matrix.durations.some(row=>!Array.isArray(row)||row.length!==n||row.some(v=>v!==null&&v!==Infinity&&(!Number.isFinite(v)||v<0))))throw new Error('Niepoprawne czasy przejazdu w kopii planu.');}
  }
  return data;
}
