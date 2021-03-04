'use strict'

// ****** Main code ******

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
    addJournalEntry,
    advanceSim,
    doNothing,
    lockStore,
    mutableRender,
    physTypeDoAct,
    queue_addStatusMessage,
    queue_comparePhysType,
    saveClockForSim,
    savePhysType,
    startSim,
    unlockStore,
} from './reduxlike/action_creators.js';

import {
    actionGroup_createActionsFromFuncQueue,
    actionGroup_NonsimActions
} from './reduxlike/actiongroups.js';

import {
    physTypeGet,
    physTypeGetCond,
    physTypePropChanged,
    simGetRunning,
    simGetSavedClock,
    storeIsLocked,
} from './reduxlike/store_getters.js';

import { storeInit } from './reduxlike/store_init.js';


// *** Creature behavior strings
// REFACTOR
const behaviorStrings = {
    idling: "is chillin'! Yeeeah...",
    eating: "is eating!! Nom...",
    sleeping: "is sleeping! Zzzz...",
    wandering: "is wandering! Wiggity whack!",
    frozen: "is frozen! Brrrr....."
};


// ***********************************************************************************
// *** Code that actually does stuff

// create our store by referencing an initialized store object
export let myStore = storeInit(
    document.getElementById(CREATURE_TIME_CHART).getContext('2d'),
    document.getElementById(CREATURE_GEO_CHART).getContext('2d'),
    document.getElementById(CREATURE_STATUS_BOX)
);

// dispatch a series of actions to our store
myStore = actionDispatch(myStore)([
    // change the sim status to running
    startSim,

    // dispatch non-sim-related actions such as queuing initial chart draws
    actionGroup_NonsimActions,

    // do the initial UI draws
    mutableRender
]);

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
        // yes: dispatch a series of actions to the store to update the sim
        myStore = actionDispatch(myStore)([
            // set store lock
            lockStore,

            // create actions from myStore action func queue
            actionGroup_createActionsFromFuncQueue,

            // do physType acts
            myStore.physTypeStore.map(
                (this_physType, i) => [
                    // save the current state of this physType
                    savePhysType(this_physType)(i),

                    // do the physType "act"
                    physTypeDoAct(this_physType)(i),

                    // use a callback to compare the new state of this physType to saved state 
                    //  and queue additional actions
                    queue_comparePhysType
                        ((creatureType) =>
                            // creatureType behavior changed?
                            (physTypePropChanged(creatureType)('conds.behavior'))
                                // yes:
                                ? [
                                    // announce in journal
                                    addJournalEntry
                                        (
                                            physTypeGet(creatureType)('name') + ' ' +
                                            behaviorStrings[physTypeGetCond(creatureType)('behavior')]
                                        ),

                                    // announce in status box
                                    queue_addStatusMessage
                                        (myStore.ui.status_box)
                                        (
                                            physTypeGet(creatureType)('name') + ' ' +
                                            behaviorStrings[physTypeGetCond(creatureType)('behavior')]
                                        )
                                ]

                                // no, or not a creatureType: do nothing
                                : doNothing
                        )
                        ('conds.behavior')
                        (i)
                ]
            ),

            // advance sim
            advanceSim,

            // unset store lock
            unlockStore
        ]);
    }

    // has UPDATE_FREQ_NONSIM time passed since last non-sim update
    //  and store lock not set?
    if (
        (performance.now() > (simGetSavedClock(myStore) + UPDATE_FREQ_NONSIM)) &&
        (!storeIsLocked(myStore))
    ) {
        // yes: dispatch a series of actions to the store to update the non-sim stuff
        myStore = actionDispatch(myStore)([
            // set store lock
            lockStore,

            // create actions from myStore action func queue
            actionGroup_createActionsFromFuncQueue,

            // update the non-sim parts of our app store
            actionGroup_NonsimActions,

            // render the application
            mutableRender,

            // remember the current time
            saveClockForSim(performance.now()),

            // unset store lock
            unlockStore
        ])
    }
};
