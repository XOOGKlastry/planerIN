import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {parseRows,mergeImport,removeImport,defaultState,makeVisits,monday,isoDate,routeCost,improveRoute,exactRoute,rankCandidates,routeSummary,googleMapsUrl,googleSearchUrl,bookingUrl,streetViewUrl,googleRouteUrl,validateBackup,parseCoordinates,parseParcelWkt} from '../dist/core.js';
const headers=['Data','Nazwa PM','Nazwa lokalizacji','Miasto','Zaplanowane prace','Podłoże','Zgłoszenie','Miejsce','Uwagi Global','Czas [min]'];
const rows=[headers,['2026-09-14','TEST01M','Sklep Opole Testowa 1','Opole','Serwis','Opis A','Z1','','',60],['2026-09-14','TEST01M','Sklep Opole Testowa 1','Opole','Pomiary','Opis B','Z2','','',45],['2026-09-14','TEST02M','Sklep Opole Testowa 2','Opole','Pomiary','Opis C','','M2','nie jechać bez potwierdzenia','']];
test('dates are calendar dates, week starts Monday',()=>{assert.equal(monday('2026-09-20'),'2026-09-14');assert.equal(monday('2026-09-14'),'2026-09-14');assert.equal(isoDate('14.09.2026'),'2026-09-14');assert.equal(isoDate('31.02.2026'),null);});
test('import preserves distinct jobs at same location and flags source condition',()=>{const parsed=parseRows(rows);assert.equal(parsed.jobs.length,3);assert.equal(Object.keys(parsed.locations).length,2);const vs=makeVisits(parsed.jobs,parsed.locations);assert.equal(vs.length,2);assert.equal(vs[0].jobs.length,2);assert.equal(vs[1].blocked,true);assert.equal(parsed.jobs[2].ticket,'');});
test('reimport is idempotent and retains user status and coordinates',()=>{const parsed=parseRows(rows);let state=mergeImport(defaultState(),parsed);state.jobs[0].status='done';Object.assign(state.locations['pm:TEST01M'],{lat:50,lng:18,geoStatus:'verified'});state=mergeImport(state,parsed);assert.equal(state.jobs.length,3);assert.equal(state.jobs[0].status,'done');assert.equal(state.locations['pm:TEST01M'].lat,50);});
test('visit identifier is stable across reimport regardless of job status',()=>{const p=parseRows(rows),before=makeVisits(p.jobs,p.locations)[0].id;p.jobs[0].status='done';assert.equal(makeVisits(p.jobs,p.locations)[0].id,before);});
const visits=n=>Array.from({length:n},(_,i)=>({id:`v${i}`,jobs:[]}));
const matrix=n=>Array.from({length:n+1},(_,i)=>Array.from({length:n+1},(_,j)=>i===j?0:600));
test('candidates are ranked nearest-first from the last stop, unreachable ones last',()=>{
  const cost=[[0,500,100,Infinity],[500,0,900,Infinity],[100,900,0,Infinity],[Infinity,Infinity,Infinity,0]];
  const ranked=rankCandidates(0,[1,2,3],cost);
  assert.deepEqual(ranked.map(r=>r.index),[2,1,3]);
  assert.equal(ranked[0].from,100/60);
  assert.equal(ranked[1].from,500/60);
  assert.equal(ranked[2].from,null);
  assert.equal(ranked[2].back,null);
});
test('route summary totals travel between stops separately from the trip home, and flags missing legs',()=>{
  const vs=visits(2),c=[[0,600,100],[700,0,1200],[1800,900,0]];
  const result=routeSummary(['v0','v1'],vs,c);
  assert.equal(result.entries[0].travel,10);
  assert.equal(result.entries[1].travel,20);
  assert.equal(result.driving,30);
  assert.equal(result.back,30);
  assert.equal(result.hasMissing,false);
});
test('route summary can start from a stop other than base (overnight the day before)',()=>{
  const vs=visits(1),c=[[0,900,300],[900,0,100],[300,100,0]];
  const result=routeSummary(['v0'],vs,c,2);
  assert.equal(result.entries[0].travel,100/60);
  assert.equal(result.back,900/60);
});
test('directed route optimizer matches exhaustive enumeration (base start)',()=>{
  const c=[[0,2,30,9,10],[20,0,1,70,30],[3,10,0,2,7],[80,2,10,0,1],[2,7,4,9,0]],arr=[1,2,3,4];
  const perm=a=>a.length?a.flatMap((v,i)=>perm(a.filter((_,j)=>j!==i)).map(p=>[v,...p])):[[]];
  const best=Math.min(...perm(arr).map(r=>routeCost(r,c)));
  assert.equal(routeCost(exactRoute(arr,c),c),best);
  assert.ok(routeCost(improveRoute(arr,c),c)<=routeCost(arr,c));
});
test('directed route optimizer honours a non-base start index (overnight anchor)',()=>{
  const c=[[0,5,5,5],[5,0,1,9],[5,1,0,1],[5,9,1,0]],arr=[1,2,3];
  const perm=a=>a.length?a.flatMap((v,i)=>perm(a.filter((_,j)=>j!==i)).map(p=>[v,...p])):[[]];
  const best=Math.min(...perm(arr).map(r=>routeCost(r,c,1)));
  assert.equal(routeCost(exactRoute(arr,c,1),c,1),best);
});
test('route optimizer finds the cheaper order when one direction is much worse',()=>{
  const c=[[0,5,100],[5,0,1],[3,1,0]];
  assert.deepEqual(exactRoute([2,1],c),[1,2]);
  assert.equal(routeCost(exactRoute([2,1],c),c),9);
});
test('route optimizer never fabricates a finite cost when no tour exists',()=>{
  const c=[[0,5,Infinity],[5,0,1],[Infinity,1,0]];
  assert.ok(!Number.isFinite(routeCost(exactRoute([1,2],c),c)));
});
test('missing route data is flagged, not silently treated as zero-cost',()=>{
  const result=routeSummary(['v0','missing'],visits(1),matrix(1));
  assert.equal(result.hasMissing,true);
  assert.equal(result.entries.length,1);
});
test('an empty day starting at base has no driving and no missing-data flag',()=>{
  const result=routeSummary([],visits(2),matrix(2));
  assert.equal(result.driving,0);assert.equal(result.back,0);assert.equal(result.hasMissing,false);
});
test('merged jobs are tagged with the import digest that brought them in',()=>{
  const parsed=parseRows(rows);
  const state=mergeImport(defaultState(),parsed,'digest-1');
  assert.ok(state.jobs.every(j=>j.importDigest==='digest-1'));
});
test('removeImport deletes only that import\'s jobs, drops now-unused locations, keeps the rest',()=>{
  const rowsB=[headers,['2026-09-14','OTHER1M','Inny sklep','Opole','Serwis','','','','','']];
  let state=mergeImport(defaultState(),parseRows(rows),'digest-1');
  state=mergeImport(state,parseRows(rowsB),'digest-2');
  state.imports.push({name:'a.xlsx',digest:'digest-1',count:3,at:new Date().toISOString()},{name:'b.xlsx',digest:'digest-2',count:1,at:new Date().toISOString()});
  const before=state.jobs.length;
  state=removeImport(state,'digest-1');
  assert.equal(state.jobs.length,before-3);
  assert.ok(state.jobs.every(j=>j.importDigest==='digest-2'));
  assert.ok(!state.locations['pm:TEST01M']);
  assert.ok(state.locations['pm:OTHER1M']);
  assert.ok(!state.imports.some(i=>i.digest==='digest-1'));
  assert.ok(state.imports.some(i=>i.digest==='digest-2'));
});
test('Google Maps, search and Street View URLs use coordinates and encode free text',()=>{
  assert.equal(new URL(googleMapsUrl({lat:50.1,lng:18.2})).searchParams.get('destination'),'50.1,18.2');
  assert.match(googleMapsUrl({label:'Łódź, A & B'}),/^https:\/\/www.google.com\/maps\/dir/);
  assert.equal(parseCoordinates('50.123, 18.456').lat,50.123);
  assert.match(googleSearchUrl('skład kruszywa',{lat:50.1,lng:18.2}),/maps\/search\/sk%C5%82ad/);
  assert.match(bookingUrl({label:'Rynek 1',city:'Opole'}),/^https:\/\/www\.booking\.com\/searchresults\.pl\.html\?ss=/);
  assert.equal(streetViewUrl({lat:50.1,lng:18.2}),'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=50.1,18.2');
  assert.equal(streetViewUrl({label:'no coords'}),null);
});
test('whole-route Google Maps link keeps stop order, ends at the last point, and stays within 9 waypoints',()=>{
  const points=Array.from({length:12},(_,i)=>({lat:50+i/100,lng:18+i/100}));
  const url=new URL(googleRouteUrl(points));
  assert.equal(url.searchParams.get('destination'),'50.09,18.09');
  const waypoints=url.searchParams.get('waypoints').split('|');
  assert.equal(waypoints.length,9);
  assert.equal(waypoints[0],'50,18');
  assert.equal(url.searchParams.get('origin'),null,'origin is left to the phone\'s own location');
  assert.equal(new URL(googleRouteUrl([{lat:50.1,lng:18.2}])).searchParams.get('waypoints'),null);
  assert.equal(googleRouteUrl([{label:'no coords'}]),null);
});
test('backup validation rejects bad structure and job references, accepts a fresh state',()=>{
  assert.throws(()=>validateBackup({...defaultState(),jobs:[{id:'x'}]}));
  assert.throws(()=>validateBackup({...defaultState(),settings:{...defaultState().settings,week:'not-a-date'}}));
  assert.doesNotThrow(()=>validateBackup(defaultState()));
});
test('backup validation rejects a route holding a raw matrix index instead of a visit id',()=>{
  const bad={...defaultState(),plans:{x:{routes:{0:[2]}}}};
  assert.throws(()=>validateBackup(bad));
});
test('default settings have no day-of-week picker and no Google API key field',()=>{
  const s=defaultState().settings;
  assert.ok(!('days' in s));
  assert.ok(!('googleApiKey' in s));
});
test('parcel WKT (as returned by ULDK) parses into GeoJSON, holes and SRID prefix included',()=>{
  const withHole=parseParcelWkt('SRID=4326;POLYGON((18.1 50.1,18.2 50.1,18.2 50.2,18.1 50.2,18.1 50.1),(18.14 50.14,18.16 50.14,18.16 50.16,18.14 50.14))');
  assert.equal(withHole.type,'Polygon');
  assert.equal(withHole.coordinates.length,2);
  assert.deepEqual(withHole.coordinates[0][0],[18.1,50.1]);
  assert.equal(withHole.coordinates[1].length,4);
  const multi=parseParcelWkt('MULTIPOLYGON(((18.1 50.1,18.2 50.1,18.2 50.2,18.1 50.1)),((19.1 51.1,19.2 51.1,19.2 51.2,19.1 51.1)))');
  assert.equal(multi.type,'MultiPolygon');
  assert.equal(multi.coordinates.length,2);
  assert.deepEqual(multi.coordinates[1][0][0],[19.1,51.1]);
  assert.throws(()=>parseParcelWkt('POINT(18.1 50.1)'));
});
test('real T38 workbook has 20 jobs, 19 locations and 2 visit restrictions', {skip:!process.env.T38_EXCEL},()=>{const context={console,Buffer,Uint8Array,ArrayBuffer,Date};vm.createContext(context);vm.runInContext(fs.readFileSync(new URL('../dist/vendor/xlsx.full.min.js',import.meta.url),'utf8'),context);const XLSX=context.XLSX;const w=XLSX.read(fs.readFileSync(process.env.T38_EXCEL),{type:'buffer'});const p=parseRows(XLSX.utils.sheet_to_json(w.Sheets[w.SheetNames[0]],{header:1,defval:null,raw:true}),{XLSX});assert.equal(p.jobs.length,20);assert.equal(Object.keys(p.locations).length,19);assert.equal(makeVisits(p.jobs,p.locations).length,19);assert.equal(p.jobs.filter(j=>j.requiresConfirmation).length,2);assert.equal(p.jobs.filter(j=>!j.ticket).length,6);assert.deepEqual([...new Set(p.jobs.map(j=>j.week))],['2026-09-14']);assert.equal(p.jobs.filter(j=>j.locationId==='pm:SIED01M').length,2);});
