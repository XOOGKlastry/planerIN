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
export function mergeImport(state, parsed, importDigest=null) {
  const byId=new Map(state.jobs.map(j=>[j.sourceKey||j.id,j])); let added=0,updated=0;
  for(const job of parsed.jobs){const old=byId.get(job.sourceKey),tagged={...job,importDigest}; if(old){updated++; byId.set(job.sourceKey,{...old,...tagged,id:old.id,status:old.status,confirmed:old.confirmed,startedAt:old.startedAt,finishedAt:old.finishedAt});}else{added++;byId.set(job.sourceKey,tagged);}}
  const locations={...state.locations};
  for(const [id,loc] of Object.entries(parsed.locations)){const old=locations[id]; locations[id]=old?{...old,...loc,lat:old.lat??loc.lat,lng:old.lng??loc.lng,geoStatus:old.geoStatus==='verified'?'verified':loc.geoStatus,geoSource:old.geoSource??loc.geoSource}:loc;}
  return {...state,jobs:[...byId.values()],locations,importResult:{added,updated}};
}
// Removes every job tagged with this import's digest, then drops any locations nothing references anymore.
// A route can be left pointing at a visit id that no longer exists — dayRoute() already filters those
// out silently (the same as it does for any other stale reference), so nothing else needs to change.
export function removeImport(state, digest) {
  const jobs=state.jobs.filter(j=>j.importDigest!==digest);
  const usedLocations=new Set(jobs.map(j=>j.locationId));
  const locations=Object.fromEntries(Object.entries(state.locations).filter(([id])=>usedLocations.has(id)));
  return {...state,jobs,locations,imports:state.imports.filter(i=>i.digest!==digest)};
}
export function makeVisits(jobs, locations) {
  const grouped=new Map();
  for(const job of jobs) {
    const key=job.locationId;
    if(!grouped.has(key))grouped.set(key,{id:`v:${hash(key)}`,locationId:job.locationId,location:locations[job.locationId],jobs:[]});
    grouped.get(key).jobs.push(job);
  }
  // A visit is done when every job at that stop is done, and parked for later ("na później") when nothing is
  // left to do now — the crew put it aside instead of deleting it, so it stays out of the day but keeps its data.
  return [...grouped.values()].map(v=>{
    const done=v.jobs.every(j=>j.status==='done');
    return {...v,id:`v:${hash(v.jobs.map(j=>j.id).sort().join('|'))}`,blocked:v.jobs.some(j=>j.requiresConfirmation&&!j.confirmed),done,later:!done&&v.jobs.every(j=>j.status==='done'||j.status==='later')};
  });
}
export function routeCost(route,cost,startIndex=0){let total=0,prev=startIndex;for(const i of route){const leg=cost[prev]?.[i];if(!Number.isFinite(leg))return Infinity;total+=leg;prev=i;} const end=cost[prev]?.[0];return total+(Number.isFinite(end)?end:Infinity);}
// Directed 2-opt fallback for routes too long for the exact solver below.
export function improveRoute(route,cost,startIndex=0) {
  let best=route.slice(),bestCost=routeCost(best,cost,startIndex),changed=true,round=0;
  while(changed&&round++<30){changed=false; for(let i=0;i<best.length-1;i++)for(let j=i+1;j<best.length;j++){const next=[...best.slice(0,i),...best.slice(i,j+1).reverse(),...best.slice(j+1)];const c=routeCost(next,cost,startIndex);if(c<bestCost-0.1){best=next;bestCost=c;changed=true;}}}
  return best;
}
// Exact directed TSP (subset DP, O(n^2 2^n)) for reordering a day's own stops into the shortest path
// from startIndex (base, or an overnight anchor) through all of them and back to base. Manual "Dodaj"
// order is never touched automatically — this only runs when the user asks via "Optymalizuj kolejność".
export function exactRoute(route,cost,startIndex=0){
  if(route.length<2)return route.slice(); if(route.length>11)return improveRoute(route,cost,startIndex);
  const n=route.length,size=1<<n,dp=Array.from({length:size},()=>Array(n).fill(Infinity)),parent=Array.from({length:size},()=>Array(n).fill(-1));
  for(let i=0;i<n;i++)dp[1<<i][i]=cost[startIndex]?.[route[i]]??Infinity;
  for(let mask=1;mask<size;mask++)for(let last=0;last<n;last++)if(mask&(1<<last))for(let next=0;next<n;next++)if(!(mask&(1<<next))){const v=dp[mask][last]+(cost[route[last]]?.[route[next]]??Infinity),m=mask|(1<<next);if(v<dp[m][next]){dp[m][next]=v;parent[m][next]=last;}}
  let last=0;for(let i=1;i<n;i++)if(dp[size-1][i]+(cost[route[i]]?.[0]??Infinity)<dp[size-1][last]+(cost[route[last]]?.[0]??Infinity))last=i;
  if(!Number.isFinite(dp[size-1][last]+(cost[route[last]]?.[0]??Infinity)))return route.slice();
  let mask=size-1;const result=[];while(last>=0){result.unshift(route[last]);const prev=parent[mask][last];mask^=1<<last;last=prev;} return result;
}
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
export function googleMapsUrl(location,base) {
  const destination=validCoords(location)?`${location.lat},${location.lng}`:[location.label,location.city,location.postal,'Polska'].filter(Boolean).join(', ');
  const params=new URLSearchParams({api:'1',destination,travelmode:'driving',dir_action:'navigate'});
  if(base&&validCoords(base))params.set('origin',`${base.lat},${base.lng}`);
  return `https://www.google.com/maps/dir/?${params}`;
}
// The remaining stops as one Google Maps route from wherever the phone is now (origin omitted = device
// location). Google allows at most 9 waypoints (only 3 in mobile browsers; the Maps app takes 9), so only
// the first 10 points are kept — enough for the next stretch of the day.
export function googleRouteUrl(points) {
  const valid=points.filter(validCoords).slice(0,10);
  if(!valid.length)return null;
  const at=p=>`${p.lat},${p.lng}`;
  const params=new URLSearchParams({api:'1',destination:at(valid.at(-1)),travelmode:'driving'});
  if(valid.length>1)params.set('waypoints',valid.slice(0,-1).map(at).join('|'));
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
// Parses the WKT the ULDK parcel lookup returns (POLYGON or MULTIPOLYGON, with an optional "SRID=n;"
// prefix) into GeoJSON coordinates Leaflet can draw directly, holes included.
export function parseParcelWkt(wkt) {
  const clean=text(wkt).replace(/^SRID=\d+;/i,'');
  const type=(clean.match(/^\s*(\w+)/)||[])[1]?.toUpperCase();
  const ring=part=>part.trim().split(',').map(pair=>pair.trim().split(/\s+/).map(Number));
  if(type==='POLYGON'){
    const rings=clean.match(/\(([^()]*)\)/g)||[];
    if(!rings.length)throw new Error('Nieznana geometria działki.');
    return {type:'Polygon',coordinates:rings.map(r=>ring(r.slice(1,-1)))};
  }
  if(type==='MULTIPOLYGON'){
    const body=clean.slice(clean.indexOf('(')+1,clean.lastIndexOf(')'));
    const groups=[];let depth=0,start=0;
    for(let i=0;i<body.length;i++){
      if(body[i]==='('){if(depth===0)start=i;depth++;}
      else if(body[i]===')'){depth--;if(depth===0)groups.push(body.slice(start,i+1));}
    }
    if(!groups.length)throw new Error('Nieznana geometria działki.');
    return {type:'MultiPolygon',coordinates:groups.map(g=>(g.match(/\(([^()]*)\)/g)||[]).map(r=>ring(r.slice(1,-1))))};
  }
  throw new Error('Nieznana geometria działki.');
}
export function validateBackup(data) {
  if(!data||data.version!==VERSION||!Array.isArray(data.jobs)||!data.locations||!data.settings||!data.plans)throw new Error('To nie jest plik planu szlaq.');
  if(data.jobs.length>3000)throw new Error('Plik ma zbyt wiele zleceń.');
  if(!isoDate(data.settings.week))throw new Error('Niepoprawne ustawienia planu.');
  if(data.settings.base&&!validCoords(data.settings.base))throw new Error('Niepoprawne współrzędne bazy.');
  const jobIds=new Set();
  for(const job of data.jobs){if(!job.id||jobIds.has(job.id)||!data.locations[job.locationId]||!isoDate(job.week)||!['todo','doing','done','later'].includes(job.status))throw new Error('Niepoprawne zlecenie w kopii planu.');jobIds.add(job.id);}
  for(const p of Object.values(data.plans)){
    if(!p.routes||Object.entries(p.routes).some(([d,ids])=>!/^\d$/.test(d)||+d>6||!Array.isArray(ids)||ids.some(id=>typeof id!=='string')))throw new Error('Niepoprawna trasa w kopii planu.');
    const ids=Object.values(p.routes).flat();if(new Set(ids).size!==ids.length)throw new Error('Wizyta występuje w kilku dniach.');
    if(p.overnight&&Object.entries(p.overnight).some(([d,v])=>!/^\d$/.test(d)||+d>6||typeof v!=='boolean'))throw new Error('Niepoprawny nocleg w kopii planu.');
    if(p.matrix){const n=p.matrix.visitIds?.length+1;if(!Number.isInteger(n)||n>71||!Array.isArray(p.matrix.durations)||p.matrix.durations.length!==n||p.matrix.durations.some(row=>!Array.isArray(row)||row.length!==n||row.some(v=>v!==null&&v!==Infinity&&(!Number.isFinite(v)||v<0))))throw new Error('Niepoprawne czasy przejazdu w kopii planu.');}
  }
  return data;
}
