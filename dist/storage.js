let dbPromise;
function database(){
  return dbPromise??=new Promise((resolve,reject)=>{
    if(!globalThis.indexedDB){reject(new Error('Przeglądarka nie udostępnia pamięci lokalnej. Otwórz aplikację w zwykłym Safari.'));return;}
    const request=indexedDB.open('paczkoplan',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('data');
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(new Error('Nie udało się otworzyć zapisu na urządzeniu.'));
  });
}
export async function loadState(){const db=await database();return new Promise((resolve,reject)=>{const r=db.transaction('data').objectStore('data').get('state');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
export async function persistState(state){const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction('data','readwrite');tx.objectStore('data').put(state,'state');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(new Error('Nie udało się zapisać zmian. Pobierz kopię planu, zanim zamkniesz aplikację.'));tx.onabort=()=>reject(new Error('Zapis został przerwany. Pobierz kopię planu.'));});}
