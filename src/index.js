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
import { doNonSimUpdate } from './do_nonsim_update.js';


// *** HTML page references 
const creature_time_chart = 'page_time_chart';
const creature_geo_chart = 'page_geo_chart';
const creature_status_box = 'page_creature_status';


// *** Function-chaining function with our store action dispatcher already applied
const makeChainOfActionDispatch = makeArgChain(actionDispatch);


// *** Timing loop setup
// how often (ideally) to update the non-sim and the simulator in milliseconds
// simulator frequency should be MORE FREQUENT than non-sim
const UPDATE_FREQ_NONSIM = 100.0;
const UPDATE_FREQ_SIM = 50;
let lastClock = 0.0;


// ***********************************************************************************
// *** Code that actually does stuff
// create a reference to an initialized store object
export let myStore = storeInit(
    document.getElementById(creature_time_chart).getContext('2d'),
    document.getElementById(creature_geo_chart).getContext('2d'),
    document.getElementById(creature_status_box)
);

// change the sim status to running
myStore = actionDispatch(myStore, startSim());

// do the initial non-sim draw
myStore = doNonSimUpdate(myStore);

// start repeatedly updating our application at sim frequency
let requestId = setInterval(appUpdate, UPDATE_FREQ_SIM);

// ***********************************************************************************


// *** Time-based callback function
function appUpdate() {
    // is simulator running and store NOT LOCKED?
    if (simGetRunning(myStore) && (!storeIsLocked(myStore))) {
        // yes: set store lock, do creature act, advance sim, unset store lock
        myStore = makeChainOfActionDispatch(
            lockStore(),
            myStore.creatureStore.map((creature, i) => doCreatureAct(creature, i)),
            advanceSim(),
            unlockStore()
        )(myStore);
    }

    // if UPDATE_FREQ_non-sim time has passed since last non-sim update
    //  AND store NOT LOCKED, then update non-sim
    if ((performance.now() > (lastClock + UPDATE_FREQ_NONSIM)) && (!storeIsLocked(myStore))
    ) {
        myStore = doNonSimUpdate(myStore);

        lastClock = performance.now();
    }
};
