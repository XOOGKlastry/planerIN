import {planWeek} from './core.js';
self.onmessage=event=>{try{const {visits,cost,settings}=event.data;self.postMessage({result:planWeek(visits,cost,settings)});}catch(error){self.postMessage({error:error.message});}};
