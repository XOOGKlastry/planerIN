import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {parseRows,mergeImport,defaultState,makeVisits,monday,isoDate,routeCost,rankCandidates,routeSummary,googleMapsUrl,validateBackup,parseCoordinates} from '../dist/core.js';
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
test('missing route data is flagged, not silently treated as zero-cost',()=>{
  const result=routeSummary(['v0','missing'],visits(1),matrix(1));
  assert.equal(result.hasMissing,true);
  assert.equal(result.entries.length,1);
});
test('an empty day has no driving and no missing-data flag',()=>{
  const result=routeSummary([],visits(2),matrix(2));
  assert.equal(result.driving,0);assert.equal(result.back,0);assert.equal(result.hasMissing,false);
});
test('Google Maps URLs use coordinates and encode address fallback',()=>{assert.equal(new URL(googleMapsUrl({lat:50.1,lng:18.2})).searchParams.get('destination'),'50.1,18.2');assert.match(googleMapsUrl({label:'Łódź, A & B'}),/^https:\/\/www.google.com\/maps\/dir/);assert.equal(parseCoordinates('50.123, 18.456').lat,50.123);});
test('backup validation rejects bad structure and job references',()=>{assert.throws(()=>validateBackup({...defaultState(),settings:{...defaultState().settings,days:[]}}));assert.throws(()=>validateBackup({...defaultState(),jobs:[{id:'x'}]}));assert.doesNotThrow(()=>validateBackup(defaultState()));});
test('real T38 workbook has 20 jobs, 19 locations and 2 visit restrictions', {skip:!process.env.T38_EXCEL},()=>{const context={console,Buffer,Uint8Array,ArrayBuffer,Date};vm.createContext(context);vm.runInContext(fs.readFileSync(new URL('../dist/vendor/xlsx.full.min.js',import.meta.url),'utf8'),context);const XLSX=context.XLSX;const w=XLSX.read(fs.readFileSync(process.env.T38_EXCEL),{type:'buffer'});const p=parseRows(XLSX.utils.sheet_to_json(w.Sheets[w.SheetNames[0]],{header:1,defval:null,raw:true}),{XLSX});assert.equal(p.jobs.length,20);assert.equal(Object.keys(p.locations).length,19);assert.equal(makeVisits(p.jobs,p.locations).length,19);assert.equal(p.jobs.filter(j=>j.requiresConfirmation).length,2);assert.equal(p.jobs.filter(j=>!j.ticket).length,6);assert.deepEqual([...new Set(p.jobs.map(j=>j.week))],['2026-09-14']);assert.equal(p.jobs.filter(j=>j.locationId==='pm:SIED01M').length,2);});
