'use strict'

// ****** Main code ******

// *** Imports
// styling and libraries
import 'bootstrap/dist/css/bootstrap.min.css';
import './custom.css';

// our own stuff
import {
    CREATURE_GEO_CHART,
    CREATURE_TIME_CHART,
    CREATURE_STATUS_BOX,
    UPDATE_FREQ_NONSIM,
    UPDATE_FREQ_SIM,
} from './const_vals.js';

import { makeArgChain } from './util.js';

import {
    actionDispatch,
    advanceSim,
    doPhysTypeAct,
    saveClockForSim,
    startSim,
    stopSim,
    lockStore,
    unlockStore
} from './reduxlike/action_creators.js';

import {
    simGetSavedClock,
    simGetRunning,
    storeIsLocked
} from './reduxlike/store_getters.js';

import { storeInit } from './reduxlike/store_init.js';
import { doNonSimUpdate } from './do_nonsim_update.js';


// *** Define function-chaining function applied to our store action dispatcher
const makeArgChainActionDispatch = makeArgChain(actionDispatch);


// ***********************************************************************************
// *** Code that actually does stuff

// create a reference to an initialized store object
export let myStore = storeInit(
    document.getElementById(CREATURE_TIME_CHART).getContext('2d'),
    document.getElementById(CREATURE_GEO_CHART).getContext('2d'),
    document.getElementById(CREATURE_STATUS_BOX)
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
    // is simulator running and store lock not set?
    if (
        simGetRunning(myStore) &&
        (!storeIsLocked(myStore))
    ) {
        // yes: set store lock, do creature act, advance sim, unset store lock
        myStore = makeArgChainActionDispatch(myStore)(
            lockStore(),
            myStore.creatureStore.map((this_creature, i) => doPhysTypeAct(this_creature, i)),
            advanceSim(),
            unlockStore()
        );
    }


    //myStore = doNonSimUpdate(myStore);

    // if UPDATE_FREQ_NONSIM time has passed since last non-sim update
    //  AND store lock not set, then update non-sim
    if (
        (performance.now() > (simGetSavedClock(myStore) + UPDATE_FREQ_NONSIM)) &&
        (!storeIsLocked(myStore))
    ) {
        // update the non-sim parts of our app store
        myStore = doNonSimUpdate(myStore);

        // remember the current time
        myStore = actionDispatch(myStore, saveClockForSim(performance.now()));
    }
};
