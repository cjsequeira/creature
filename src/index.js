'use strict'

// ****** Main code ******
// REFACTOR: Figure out how to compare objects and announce based on comparison

// *** Imports
// styling and libraries
import 'bootstrap/dist/css/bootstrap.min.css';
import './custom.css';

// our own stuff
import {
    CREATURE_GEO_CHART,
    CREATURE_STATUS_BOX,
    CREATURE_TIME_CHART,
    UPDATE_FREQ_NONSIM,
    UPDATE_FREQ_SIM,
} from './const_vals.js';

import {
    advanceSim,
    doNothing,
    saveClockForSim,
    startSim,
    uiAddStatusMessage,
} from './reduxlike/action_creators.js';

import { appStore } from './reduxlike/app_store.js';

import {
    actionGroup_NonsimActions,
    actionGroup_updateAllPhysTypes
} from './reduxlike/actiongroups.js';

import {
    simGetRunning,
    simGetSavedClock,
    storeIsLocked,
} from './reduxlike/store_getters.js';

import { storeInit } from './reduxlike/store_init.js';


// ***********************************************************************************
// *** Code that actually does stuff

// create our store in "appStore" using some pointers to web page elements
storeInit(
    document.getElementById(CREATURE_TIME_CHART).getContext('2d'),
    document.getElementById(CREATURE_GEO_CHART).getContext('2d'),
    document.getElementById(CREATURE_STATUS_BOX)
);

// push a series of actions to the action queue in our app store
appStore.pushActionsToQueue(
    // change the sim status to running
    startSim(),

    // dispatch non-sim-related actions
    actionGroup_NonsimActions(appStore.storeObj),
);

// process all actions in the queue, which could be MORE THAN WE JUST PUSHED!
appStore.processActionQueue();

// start repeatedly updating our application at sim frequency
setInterval(appUpdate, UPDATE_FREQ_SIM);

// ***********************************************************************************


// *** Time-based callback function
// takes: 
//  don't care
// returns nothing
function appUpdate(_) {
    // is simulator running?
    if (simGetRunning(appStore.storeObj)) {
        // yes: push a series of actions to the action queue
        appStore.pushActionsToQueue(
            // has UPDATE_FREQ_NONSIM time passed since last non-sim update?
            (performance.now() > (simGetSavedClock(appStore.storeObj) + UPDATE_FREQ_NONSIM))
                // yes: dispatch a series of actions to the store to update the non-sim stuff
                ? [
                    // remember the current time
                    saveClockForSim(performance.now()),

                    // update the non-sim parts of our app store
                    actionGroup_NonsimActions(appStore.storeObj),
                ]

                // no: do nothing
                : doNothing(),

            // update all physTypes
            actionGroup_updateAllPhysTypes(),

            // advance sim
            advanceSim(),
        );
    }

    // process all actions in the queue, which could be MORE THAN WE JUST PUSHED!
    appStore.processActionQueue();
};
