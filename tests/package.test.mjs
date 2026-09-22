import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
test('HTML references existing local assets and has install metadata',()=>{const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.match(html,/<html lang="pl"/);assert.match(html,/rel="manifest"/);for(const match of html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g))assert.ok(fs.existsSync(path.join(root,match[1])),match[1]);});
test('PWA manifest uses relative paths and real icons',()=>{const m=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));assert.equal(m.display,'standalone');assert.equal(m.start_url,'./');for(const icon of m.icons){const bytes=fs.readFileSync(path.join(root,icon.src));assert.equal(bytes.subarray(1,4).toString(),'PNG');const width=bytes.readUInt32BE(16);assert.equal(icon.sizes,`${width}x${width}`);}});
test('offline shell contains every executable module and each file exists',()=>{const source=fs.readFileSync(path.join(root,'sw.js'),'utf8');const files=vm.runInNewContext(source.match(/const FILES=(\[[^;]+\]);/)[1]);for(const file of files)assert.ok(fs.existsSync(path.join(root,file)),file);for(const module of ['app.js','core.js','network.js','storage.js'])assert.ok(files.includes(`./${module}`));assert.match(source,/url.origin!==self.location.origin/);});
test('no Waze/Apple Maps, no Google Routes API or Distance Matrix, and no Google API key anywhere',()=>{const app=fs.readFileSync(path.join(root,'app.js'),'utf8');const network=fs.readFileSync(path.join(root,'network.js'),'utf8');assert.doesNotMatch(app+network,/waze\.com|maps\.apple\.com|routes\.googleapis\.com|maps\.googleapis\.com|AIza|googleApiKey/);assert.doesNotMatch(app,/name="break|name="przerw/);assert.doesNotMatch(app,/Paczk om/);});
test('driving distances only ever come from the free OSRM router',()=>{const network=fs.readFileSync(path.join(root,'network.js'),'utf8');assert.match(network,/export async function fetchMatrix\(/);assert.doesNotMatch(network,/DistanceMatrixService|fetchMatrixGoogle/);});
test('GESUT layer names match the national KIUT service (water/sewage/electric/gas/heating/telecom/other)',()=>{const network=fs.readFileSync(path.join(root,'network.js'),'utf8');for(const name of ['przewod_wodociagowy','przewod_kanalizacyjny','przewod_elektroenergetyczny','przewod_gazowy','przewod_cieplowniczy','przewod_telekomunikacyjny'])assert.match(network,new RegExp(name));});
test('day-optimize and day-reset actions are wired up, reset asks for confirmation',()=>{const app=fs.readFileSync(path.join(root,'app.js'),'utf8');assert.match(app,/case 'optimize-day':await optimizeDayOrder\(selectedDay\)/);assert.match(app,/case 'reset-day':await resetDay\(selectedDay\)/);const resetFn=app.slice(app.indexOf('async function resetDay'),app.indexOf('async function resetDay')+400);assert.match(resetFn,/confirm\(/);});
test('the work-map base layer picker offers all five requested sources, each with its own thumbnail',()=>{const app=fs.readFileSync(path.join(root,'app.js'),'utf8');for(const id of ['osm','esri','orto','google-hybrid','google'])assert.ok(app.includes(`id:'${id}'`),`missing base layer ${id}`);assert.match(app,/function baseLayerThumbUrl/);assert.match(app,/function makeBaseTileLayer/);});
test('base layer picker sits above the map as plain HTML, not floating on top of it',()=>{const app=fs.readFileSync(path.join(root,'app.js'),'utf8');const workMapIdx=app.indexOf(`id="work-map"`),pickerIdx=app.indexOf('class="map-base-picker"');assert.ok(pickerIdx>=0&&pickerIdx<workMapIdx,'picker markup must come before the map canvas in the DOM');assert.doesNotMatch(app,/L\.control\(\{position:'topleft'\}\)/);});
test('the auto-distribute module has been removed entirely',()=>{const app=fs.readFileSync(path.join(root,'app.js'),'utf8');const core=fs.readFileSync(path.join(root,'core.js'),'utf8');assert.doesNotMatch(app+core,/autoDistribute|auto-distribute|Zaproponuj rozkład/);});
test('optimize-route is a primary button in the day bar, which stays pinned while scrolling the stops',()=>{
  const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
  const styles=fs.readFileSync(path.join(root,'styles.css'),'utf8');
  const bar=app.slice(app.indexOf('function renderDayBar'),app.indexOf('function renderRoute'));
  assert.match(bar,/class="primary optimize" data-act="optimize-day"/);
  assert.match(styles,/\.daybar\{position:sticky;top:0/);
});
test('an entire import can be deleted, with confirmation, removing only its own jobs',()=>{const app=fs.readFileSync(path.join(root,'app.js'),'utf8');assert.match(app,/case 'delete-import':await deleteImport\(id\)/);const fn=app.slice(app.indexOf('async function deleteImport'),app.indexOf('async function deleteImport')+400);assert.match(fn,/confirm\(/);const core=fs.readFileSync(path.join(root,'core.js'),'utf8');assert.match(core,/export function removeImport/);});
test('parcels (działki) can be toggled on the work map, identified by click via ULDK, with a distinct base layer for boundaries',()=>{
  const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
  const network=fs.readFileSync(path.join(root,'network.js'),'utf8');
  const core=fs.readFileSync(path.join(root,'core.js'),'utf8');
  assert.match(app,/data-parcels="1"/);
  assert.match(app,/function toggleParcelsLayer/);
  assert.match(app,/workMap\.on\('click'/);
  assert.match(network,/export async function findParcelAt/);
  assert.match(core,/export function parseParcelWkt/);
});
test('a visit under 20 minutes from another gets a very visible proximity warning, in both the day list and the candidate list',()=>{
  const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
  assert.match(app,/function proximityWarning/);
  const seconds=app.match(/return best&&best\.seconds<(\d+)\?best:null/);
  assert.ok(seconds&&Number(seconds[1])===1200,'threshold must be 20 minutes (1200s)');
  const stopFn=app.slice(app.indexOf('function renderStop'),app.indexOf('function renderCandidate'));
  const candidateFn=app.slice(app.indexOf('function renderCandidate'),app.indexOf('function renderAddSection'));
  assert.match(stopFn,/near\?`<span class="flag red"/);
  assert.match(candidateFn,/flag red/);
});
test('each day of the week has its own colour, used for the map route/pins and echoed on its tile',()=>{
  const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
  const match=app.match(/const DAY_COLORS=\[([^\]]+)\]/);
  assert.ok(match);
  const colors=match[1].split(',').map(s=>s.trim().replace(/'/g,''));
  assert.equal(colors.length,7);
  assert.equal(new Set(colors).size,7,'all seven day colours must be distinct');
  assert.match(app,/--day-color:\$\{DAY_COLORS\[day\]\}/);
  const styles=fs.readFileSync(path.join(root,'styles.css'),'utf8');
  for(let i=0;i<7;i++)assert.match(styles,new RegExp(`\\.map-pin\\.day${i}\\{`));
});
test('only the five weekdays are plannable — no Saturday/Sunday tab, and nothing left over from them can be silently lost',()=>{
  const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
  const match=app.match(/const ALL_DAYS=\[([^\]]+)\]/);
  assert.ok(match);
  assert.deepEqual(match[1].split(',').map(s=>Number(s.trim())),[0,1,2,3,4]);
  assert.doesNotMatch(app,/day-grid seven/);
  assert.match(app,/function placedVisitIds\(\)\{return new Set\(Object\.entries\(currentPlan\(\)\?\.routes\|\|\{\}\)\.filter\(\(\[d\]\)=>ALL_DAYS\.includes\(Number\(d\)\)\)/);
  assert.match(app,/ALL_DAYS\.map\(i=>`<option value="\$\{i\}"/,'move-visit dropdown must only offer weekdays');
});
test('the "add a stop" candidate list caps at a handful of cards with a show-more toggle, instead of unfolding the whole pool',()=>{
  const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
  assert.match(app,/const CANDIDATE_LIMIT=5/);
  assert.match(app,/case 'show-more-candidates':addSectionExpanded=true/);
  assert.match(app,/case 'show-fewer-candidates':addSectionExpanded=false/);
  const fn=app.slice(app.indexOf('function renderAddSection'),app.indexOf('function importDrop'));
  assert.match(fn,/Math\.min\(CANDIDATE_LIMIT,items\.length\)/);
  assert.match(fn,/data-act="show-more-candidates"/);
});
test('"Zobacz miejsce pracy" is compact — one chip row for parcels+GESUT layers (not a multi-row checkbox grid), Street View as a small icon button',()=>{
  const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
  const styles=fs.readFileSync(path.join(root,'styles.css'),'utf8');
  const fn=app.slice(app.indexOf('function showWorkMap'),app.indexOf('function drawWorkMap'));
  assert.match(fn,/class="chip-row" id="work-layers"/);
  assert.match(fn,/class="icon-btn streetview-link"/);
  assert.doesNotMatch(app,/class="layer-toggles"/);
  assert.match(styles,/\.chip-row\{/);
  assert.match(styles,/\.icon-btn\{/);
});
test('the day is one timeline — start, legs, stops, next-stop suggestions, return — with stop actions folded until opened',()=>{
  const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
  const styles=fs.readFileSync(path.join(root,'styles.css'),'utf8');
  const route=app.slice(app.indexOf('function renderRoute'),app.indexOf('function renderRouteEnd'));
  assert.match(route,/\$\{startRow\}\$\{renderDoneGroup\(route\)\}\$\{stops\}\$\{renderAddSection\(day\)\}\$\{end\}/);
  assert.match(app,/case 'toggle-stop':setOpenStop\(id\)/);
  assert.match(styles,/\.stop-actions\{display:none/);
  assert.match(styles,/\.stop\.open \.stop-actions\{display:flex\}/);
});
test('a finished stop leaves the active route — one-tap toggle, folded "Zrobione" group, out of suggestions, map and optimizing',()=>{
  const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
  const styles=fs.readFileSync(path.join(root,'styles.css'),'utf8');
  assert.match(app,/case 'toggle-done':await toggleDone\(id\)/);
  assert.match(app,/case 'toggle-done-list':showDone=!showDone/);
  assert.match(app.slice(app.indexOf('function renderStop'),app.indexOf('function renderCandidate')),/<button class="tool check" data-act="toggle-done"/);
  const route=app.slice(app.indexOf('function renderRoute'),app.indexOf('function renderRouteEnd'));
  assert.match(route,/route\.map\(\(v,i\)=>v\.done\?'':/);
  assert.match(route,/function renderDoneGroup/);
  assert.match(app.slice(app.indexOf('function renderAddSection'),app.indexOf('function importDrop')),/!placed\.has\(v\.id\)&&!v\.done/);
  assert.match(app.slice(app.indexOf('function nextStopCandidates'),app.indexOf('function proximityWarning')),/!v\.blocked&&!v\.done/);
  assert.match(app.slice(app.indexOf('async function optimizeDayOrder'),app.indexOf('async function deleteImport')),/\[\.\.\.done\.map\(v=>v\.id\),\.\.\.optimized\.map/);
  assert.match(app.slice(app.indexOf('function drawMap'),app.indexOf('function setOpenStop')),/if\(v\.done&&!inRoute\)continue/);
  assert.match(styles,/\.map-pin\.done\{/);
});
test('phones and tablets switch between the list and the map instead of stacking them',()=>{
  const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
  const styles=fs.readFileSync(path.join(root,'styles.css'),'utf8');
  assert.match(app,/case 'pane':\{pane=button\.dataset\.pane/);
  const tablet=styles.slice(styles.indexOf('@media(max-width:850px)'),styles.indexOf('@media(max-width:650px)'));
  assert.match(tablet,/\.work-area\[data-pane="list"\] \.map-panel,\.work-area\[data-pane="map"\] \.route-panel\{display:none\}/);
});
test('every icon-only button carries a spoken label',()=>{
  const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
  const tags=[...app.matchAll(/<(?:a|button) class="(?:tool|act icon-only|cand-add)[^"]*"[^>]*>/g)].map(m=>m[0]);
  assert.ok(tags.length>=10,`expected many icon buttons, found ${tags.length}`);
  for(const tag of tags)assert.match(tag,/aria-label="/,tag);
});
test('the day bar opens the whole remaining route in Google Maps',()=>{
  const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
  const bar=app.slice(app.indexOf('function renderDayBar'),app.indexOf('function renderRoute'));
  assert.match(bar,/googleRouteUrl\(/);
  assert.match(bar,/title="Prowadź całą trasę w Google Maps"/);
});
