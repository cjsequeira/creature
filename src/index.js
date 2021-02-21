'use strict'

// ****** Main code ******

// *** Imports
// styling and libraries
import 'bootstrap/dist/css/bootstrap.min.css';
import './custom.css';

// our own stuff
import { makeArgChain } from './util.js';
import {
    actionDispatch,
    advanceSim,
    doCreatureAct,
    startSim,
    stopSim,
    lockStore,
    unlockStore
} from './reduxlike/action_creators.js';
import {
    simGetRunning,
    storeIsLocked
} from './reduxlike/store_getters.js';
import { storeInit } from './reduxlike/store_init.js';
import { doUpdateLoop } from './sim/do_update_loop.js';


// *** HTML page references 
const creature_time_chart = 'page_time_chart';
const creature_geo_chart = 'page_geo_chart';
const creature_status_box = 'page_creature_status';


// *** Function-chaining function with our store action dispatcher already applied
const makeChainOfActionDispatch = makeArgChain(actionDispatch);


// *** UI update setup
// how often, ideally, to update the UI, in milliseconds
const UI_UPDATE_FREQ = 200.0;


// ***********************************************************************************
// *** Code that actually does stuff
// create a reference to an initialized store object
export let myStore = storeInit(
    document.getElementById(creature_time_chart).getContext('2d'),
    document.getElementById(creature_geo_chart).getContext('2d'),
    document.getElementById(creature_status_box)
);

// define web worker to update the sim
let simWorker = new Worker(new URL('./sim/worker_sim_loop.js', import.meta.url));

// establish the function we call when we receive a message from worker
simWorker.onmessage = (message) => simWorkerReceiver(message);

// change the sim status to running
myStore = actionDispatch(myStore, startSim());

// do the initial UI draw
myStore = doUpdateLoop(myStore);

// start repeatedly updating our UI at specific intervals of time
let requestId = setInterval(nonSimUpdate, UI_UPDATE_FREQ);

// start the web worker that updates the sim
simWorker.postMessage('start');
// ***********************************************************************************


// *** Time-based callback functions
// non-sim update function (primarily updates UI)
function nonSimUpdate() {
    myStore = doUpdateLoop(myStore);
};

// web worker sim update function
function simWorkerReceiver(message) {
    // if message is to advance...
    if (message.data === 'advance') {
        // is simulator running and store NOT LOCKED?
        if (simGetRunning(myStore) && !storeIsLocked(myStore)) {
            // yes: set store lock, do creature act, advance sim, unset store lock
            myStore = makeChainOfActionDispatch(
                lockStore(),
                doCreatureAct(myStore.creatureStore),
                advanceSim(),
                unlockStore()
            )(myStore);
        }
    }
};
