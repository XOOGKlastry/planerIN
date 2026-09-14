import {norm,validCoords,haversine,hash} from './core.js';

export const SERVICES={points:'https://api-shipx-pl.easypack24.net/v1/points/',geocoder:'https://nominatim.openstreetmap.org/search',router:'https://router.project-osrm.org',overpass:'https://overpass-api.de/api/interpreter',ortofoto:'https://mapy.geoportal.gov.pl/wss/service/PZGIK/ORTO/WMS/StandardResolution',gesut:'https://integracja.gugik.gov.pl/cgi-bin/KrajowaIntegracjaUzbrojeniaTerenu',dzialki:'https://integracja.gugik.gov.pl/cgi-bin/KrajowaIntegracjaEwidencjiGruntow',uldk:'https://uldk.gugik.gov.pl/'};
// GESUT lines from the national KIUT service (Główny Urząd Geodezji i Kartografii), one WMS layer per
// network type — only rendered by the server at very close zoom (street level), same as in geoportal.gov.pl.
export const GESUT_LAYERS=[
  {name:'przewod_wodociagowy',title:'Wodociągowa'},
  {name:'przewod_kanalizacyjny',title:'Kanalizacyjna'},
  {name:'przewod_elektroenergetyczny',title:'Elektroenergetyczna'},
  {name:'przewod_gazowy',title:'Gazowa'},
  {name:'przewod_cieplowniczy',title:'Ciepłownicza'},
  {name:'przewod_telekomunikacyjny',title:'Telekomunikacyjna'},
  {name:'przewod_specjalny',title:'Specjalna'},
  {name:'przewod_niezidentyfikowany',title:'Niezidentyfikowane'},
  {name:'przewod_urzadzenia',title:'Urządzenia'},
];
let queue=Promise.resolve(),lastRequest=0;
// Public services are shared. No parallel bulk requests or autocomplete.
export function request(url,{timeout=25000,...options}={}){
  const run=async()=>{const pause=Math.max(0,1200-(Date.now()-lastRequest));if(pause)await new Promise(r=>setTimeout(r,pause));lastRequest=Date.now();
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);
    try{const response=await fetch(url,{...options,signal:controller.signal});if(!response.ok)throw new Error(`Usługa odpowiedziała ${response.status}. Spróbuj później.`);return await response.json();}
    catch(error){if(error.name==='AbortError')throw new Error('Usługa nie odpowiedziała na czas. Plan pozostaje zapisany.');throw error;}finally{clearTimeout(timer);}
  };
  const result=queue.then(run,run);queue=result.catch(()=>{});return result;
}
export function geocodeQuery(location){
  let label=location.label||'',city=location.city||'';
  // This input often starts with a shop name. Prefer the city and street tail.
  const position=city?norm(label).indexOf(norm(city)):-1;
  if(position>=0)label=label.slice(position);
  return [...new Set([label,position<0?city:'',location.postal,'Polska'].filter(Boolean))].join(', ');
}
export async function resolveLocation(location){
  if(location.code){
    try{const data=await request(`${SERVICES.points}${encodeURIComponent(location.code)}`);const p={lat:Number(data.location?.latitude),lng:Number(data.location?.longitude)};
      if(data.name===location.code&&data.location&&validCoords(p))return {candidates:[{...p,label:[data.address_details?.street,data.address_details?.building_number,data.address_details?.city].filter(Boolean).join(' '),source:'InPost Points',precise:true,sourceUrl:`${SERVICES.points}${encodeURIComponent(location.code)}`,fetchedAt:new Date().toISOString()}],automatic:true};
    }catch{/* New/inactive points or changed API access: use address candidates. */}
  }
  const query=geocodeQuery(location),params=new URLSearchParams({q:query,format:'jsonv2',countrycodes:'pl',limit:'4',addressdetails:'1'});
  const data=await request(`${SERVICES.geocoder}?${params}`);
  const candidates=(Array.isArray(data)?data:[]).map(v=>({lat:Number(v.lat),lng:Number(v.lon),label:v.display_name,source:'OpenStreetMap / Nominatim',sourceUrl:`https://www.openstreetmap.org/${v.osm_type}/${v.osm_id}`,precise:!!v.address?.house_number,fetchedAt:new Date().toISOString()})).filter(validCoords);
  return {candidates,automatic:false};
}
export function matrixKey(base,visits){return hash(JSON.stringify([SERVICES.router,base.lat,base.lng,...visits.flatMap(v=>[v.id,v.location.lat,v.location.lng])]));}
export async function fetchMatrix(base,visits){
  if(!validCoords(base))throw new Error('Najpierw ustaw miejsce startu.');
  if(visits.length>70)throw new Error('W jednym tygodniu można przeliczyć do 70 lokalizacji. Wybierz jedną ekipę lub mniejszy zakres.');
  const points=[base,...visits.map(v=>v.location)];if(points.some(p=>!validCoords(p)))throw new Error('Nie wszystkie lokalizacje mają współrzędne.');
  const coordinates=points.map(p=>`${p.lng.toFixed(6)},${p.lat.toFixed(6)}`).join(';');
  const url=`${SERVICES.router}/table/v1/driving/${coordinates}?annotations=duration,distance`;
  const data=await request(url,{timeout:45000});
  if(data.code!=='Ok'||!Array.isArray(data.durations)||data.durations.length!==points.length||data.durations.some(r=>r.length!==points.length))throw new Error('Nie udało się wyznaczyć macierzy dojazdów. Nie zastępuję jej odległością w linii prostej.');
  const snapped=[];
  (data.sources||[]).forEach((p,i)=>{if(p.location){const distance=haversine(points[i],{lat:p.location[1],lng:p.location[0]});if(distance>400)snapped.push({index:i,distance:Math.round(distance)});}});
  if(snapped.length)throw new Error(`Punkt ${snapped[0].index===0?'startu':visits[snapped[0].index-1].location.code||visits[snapped[0].index-1].location.label} jest ${snapped[0].distance} m od drogi rozpoznanej przez silnik. Popraw pinezkę przy wjeździe.`);
  return {key:matrixKey(base,visits),durations:data.durations.map(r=>r.map(v=>Number.isFinite(v)&&v>=0?v:Infinity)),distances:data.distances??null,visitIds:visits.map(v=>v.id),provider:'OSRM',fetchedAt:new Date().toISOString()};
}
// Building-materials / aggregate yards near a point or along a day's stops, via the free OSM Overpass API.
// `center`+`radius` (metres) searches around one point; `bbox` searches a rectangle (a day's route span).
export async function findMaterialYards({center,radius=8000,bbox}={}){
  const area=center?`(around:${radius},${center.lat},${center.lng})`:bbox?`(${bbox.south},${bbox.west},${bbox.north},${bbox.east})`:null;
  if(!area)throw new Error('Brak punktu lub obszaru do wyszukania.');
  const tags=['shop=building_materials','landuse=quarry','shop=trade'];
  const clauses=tags.flatMap(tag=>[`node["${tag.split('=')[0]}"="${tag.split('=')[1]}"]${area};`,`way["${tag.split('=')[0]}"="${tag.split('=')[1]}"]${area};`]).join('');
  const query=`[out:json][timeout:25];(${clauses});out center 40;`;
  const data=await request(SERVICES.overpass,{method:'POST',timeout:30000,headers:{'Content-Type':'application/x-www-form-urlencoded'},body:`data=${encodeURIComponent(query)}`});
  return (data.elements||[]).map(el=>({id:`osm:${el.type}/${el.id}`,name:el.tags?.name||el.tags?.brand||'Skład bez nazwy',lat:el.lat??el.center?.lat,lng:el.lon??el.center?.lon,tags:el.tags||{},osmUrl:`https://www.openstreetmap.org/${el.type}/${el.id}`})).filter(p=>validCoords(p));
}
// Looks up the cadastral parcel under one point via ULDK (Usługa Lokalizacji Działek Katastralnych), the
// national GUGiK service — plain text, not JSON, so it can't go through request()'s shared queue.
export async function findParcelAt(lat,lng){
  const url=`${SERVICES.uldk}?request=GetParcelByXY&xy=${lng.toFixed(6)},${lat.toFixed(6)},4326&result=id,geom_wkt&srid=4326`;
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
  let response;
  try{response=await fetch(url,{signal:controller.signal});}
  catch(error){if(error.name==='AbortError')throw new Error('Usługa działek nie odpowiedziała na czas.');throw error;}
  finally{clearTimeout(timer);}
  if(!response.ok)throw new Error(`Usługa działek odpowiedziała ${response.status}.`);
  const lines=(await response.text()).trim().split('\n');
  if(lines[0]!=='0')throw new Error('Brak działki ewidencyjnej w tym miejscu.');
  const [id,wkt]=(lines[1]||'').split('|');
  if(!id||!wkt)throw new Error('Nie udało się odczytać odpowiedzi usługi działek.');
  return {id,wkt};
}
export async function fetchRoute(base,visits){
  if(!visits.length)return null;
  const points=[base,...visits.map(v=>v.location),base],coordinates=points.map(p=>`${p.lng.toFixed(6)},${p.lat.toFixed(6)}`).join(';');
  const data=await request(`${SERVICES.router}/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=false&continue_straight=false`,{timeout:40000});
  if(data.code!=='Ok'||!data.routes?.[0])throw new Error('Nie udało się pobrać przebiegu trasy. Lista punktów jest dostępna.');
  const route=data.routes[0];return {geometry:route.geometry,distance:route.distance,duration:route.duration,legs:route.legs.map(l=>({duration:l.duration,distance:l.distance})),fetchedAt:new Date().toISOString()};
}
