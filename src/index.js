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
    mutableRender,
    queue_addStatusMessage
} from './reduxlike/action_creators.js';

import { actionGroup_NonsimActions } from './reduxlike/actiongroup_nonsimactions.js';

import { watchProps } from './reduxlike/watch_props.js';

import {
    simGetSavedClock,
    simGetRunning,
    storeIsLocked
} from './reduxlike/store_getters.js';

import { storeInit } from './reduxlike/store_init.js';


// *** Define argument-chaining function applied to our store action dispatcher
const applyArgChainActionDispatch = applyArgChain(actionDispatch);


// ***********************************************************************************
// *** Code that actually does stuff

// create our store by referencing an initialized store object
export let myStore = storeInit(
    document.getElementById(CREATURE_TIME_CHART).getContext('2d'),
    document.getElementById(CREATURE_GEO_CHART).getContext('2d'),
    document.getElementById(CREATURE_STATUS_BOX)
);

// dispatch a series of actions to our store
myStore = applyArgChainActionDispatch(myStore)(
    // change the sim status to running
    startSim(),

    // dispatch non-sim-related actions such as queuing initial chart draws
    actionGroup_NonsimActions(myStore),

    // do the initial UI draws
    mutableRender()
);

// start repeatedly updating our application at sim frequency
let requestId = setInterval(appUpdate, UPDATE_FREQ_SIM);

// ***********************************************************************************


// *** Time-based callback function
// REFACTOR WATCHER IDEA:
//  Consider an action type that saves the current version of a given object,
//  then another action type that checks the saved object against a different version of that object
//  and makes an object containing changes, that could be reviewed (e.g. with getCond?), and the
//  review could trigger the dispatching of an action, per code like the code below
// takes: nothing
// returns nothing
function appUpdate() {
    // is simulator running and store lock not set?
    if (
        simGetRunning(myStore) &&
        (!storeIsLocked(myStore))
    ) {
        // yes: dispatch a series of actions to the store to update the sim
        myStore = applyArgChainActionDispatch(myStore)(
            // set store lock
            lockStore(),

            // do physType acts
            myStore.physTypeStore.map(
                (this_physType, i) => doPhysTypeAct(this_physType)(i)
            ),

            // advance sim
            advanceSim(),

            // unset store lock
            unlockStore()
        );
    }

    // has UPDATE_FREQ_NONSIM time passed since last non-sim update
    //  and store lock not set?
    if (
        (performance.now() > (simGetSavedClock(myStore) + UPDATE_FREQ_NONSIM)) &&
        (!storeIsLocked(myStore))
    ) {
        // yes: dispatch a series of actions to the store to update the non-sim stuff
        myStore = applyArgChainActionDispatch(myStore)(
            // set store lock
            lockStore(),

            // update the non-sim parts of our app store
            actionGroup_NonsimActions(myStore),

            // render the application
            mutableRender(),

            // remember the current time
            saveClockForSim(performance.now()),

            // unset store lock
            unlockStore()
        )
    }
};
