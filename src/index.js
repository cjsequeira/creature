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

import { doNonSimUpdate } from './do_nonsim_update.js';
import { applyArgChain } from './util.js';

import {
    actionDispatch,
    advanceSim,
    doPhysTypeAct,
    saveClockForSim,
    startSim,
    stopSim,
    lockStore,
    unlockStore,
    mutableRender
} from './reduxlike/action_creators.js';

import {
    simGetSavedClock,
    simGetRunning,
    storeIsLocked
} from './reduxlike/store_getters.js';

import { storeInit } from './reduxlike/store_init.js';


// *** Define function-chaining function applied to our store action dispatcher
const applyArgChainActionDispatch = applyArgChain(actionDispatch);


// ***********************************************************************************
// *** Code that actually does stuff

// create a reference to an initialized store object
export let myStore = storeInit(
    document.getElementById(CREATURE_TIME_CHART).getContext('2d'),
    document.getElementById(CREATURE_GEO_CHART).getContext('2d'),
    document.getElementById(CREATURE_STATUS_BOX)
);

// change the sim status to running
myStore = actionDispatch(myStore)(startSim());

// do the initial non-sim draw
myStore = doNonSimUpdate(myStore);
myStore = actionDispatch(myStore)(mutableRender());

// start repeatedly updating our application at sim frequency
let requestId = setInterval(appUpdate, UPDATE_FREQ_SIM);

// ***********************************************************************************


// *** Time-based callback function
// takes: nothing
// returns nothing
function appUpdate() {
    // is simulator running and store lock not set?
    if (
        simGetRunning(myStore) &&
        (!storeIsLocked(myStore))
    ) {
        // yes: set store lock, do physType act, advance sim, unset store lock
        myStore = applyArgChainActionDispatch(myStore)(
            lockStore(),
            myStore.physTypeStore.map(
                (this_physType, i) => doPhysTypeAct(this_physType)(i)
            ),
            advanceSim(),
            unlockStore()
        );
    }

    // has UPDATE_FREQ_NONSIM time passed since last non-sim update
    //  AND store lock not set?
    if (
        (performance.now() > (simGetSavedClock(myStore) + UPDATE_FREQ_NONSIM)) &&
        (!storeIsLocked(myStore))
    ) {
        // update the non-sim parts of our app store
        myStore = doNonSimUpdate(myStore);

        // render the application
        myStore = actionDispatch(myStore)(mutableRender());

        // remember the current time
        myStore = actionDispatch(myStore)(saveClockForSim(performance.now()));
    }
};
