'use strict'

// ****** Main code ******
// REFACTOR: Must implement store getter methods so that store properties can be
//  accessed "in the middle" of generating new object for myStore

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
    actionDispatch,
    advanceSim,
    doNothing,
    mutableRender,
    queueAction_doActionGroup,
    saveClockForSim,
    startSim,
} from './reduxlike/action_creators.js';

import {
    actionGroup_NonsimActions, actionGroup_updateAllPhysTypes
} from './reduxlike/actiongroups.js';

import {
    simGetRunning,
    simGetSavedClock,
    storeIsLocked,
} from './reduxlike/store_getters.js';

import { storeInit } from './reduxlike/store_init.js';


// ***********************************************************************************
// *** Code that actually does stuff

// create our store by referencing an initialized store object
export let myStore = storeInit(
    document.getElementById(CREATURE_TIME_CHART).getContext('2d'),
    document.getElementById(CREATURE_GEO_CHART).getContext('2d'),
    document.getElementById(CREATURE_STATUS_BOX)
);

// dispatch a series of actions to our store
myStore = actionDispatch(myStore)(
    // do the initial UI draws
    mutableRender(),

    // queue dispatch non-sim-related actions
    // these actions will be dispatched on the *next* call to actionDispatch
    queueAction_doActionGroup(actionGroup_NonsimActions),

    // change the sim status to running
    startSim(),
);

// start repeatedly updating our application at sim frequency
setInterval(appUpdate, UPDATE_FREQ_SIM);

// ***********************************************************************************


// *** Time-based callback function
// takes: 
//  don't care
// returns nothing
function appUpdate(_) {
    // is simulator running and store lock not set?
    if (
        simGetRunning(myStore) &&
        (!storeIsLocked(myStore))
    ) {
        // yes: dispatch a series of actions to the store to update it
        myStore = actionDispatch(myStore)(
            // queue update of all physTypes
            // these actions will be dispatched on the *next* call to actionDispatch
            queueAction_doActionGroup(actionGroup_updateAllPhysTypes),

            // advance sim
            advanceSim(),

            // has UPDATE_FREQ_NONSIM time passed since last non-sim update?
            (performance.now() > (simGetSavedClock(myStore) + UPDATE_FREQ_NONSIM))
                // yes: dispatch a series of actions to the store to update the non-sim stuff
                ? [
                    // render the application
                    mutableRender(),

                    // remember the current time
                    saveClockForSim(performance.now()),

                    // queue update of the non-sim parts of our app store
                    // these actions will be dispatched on the *next* call to actionDispatch
                    queueAction_doActionGroup(actionGroup_NonsimActions),
                ]

                // no: do nothing
                : doNothing(),
        );
    }
};
