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
    addJournalEntry,
    advanceSim,
    clearActionFuncQueue,
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
    actionGroup_NonsimActions
} from './reduxlike/actiongroups.js';

import {
    getUIProp,
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
    // REFACTOR
    actionGroup_NonsimActions(myStore),

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
        // yes: dispatch a series of actions to the store to update it
        myStore = actionDispatch(myStore)(
            // do physType act for each physType in physType store
            // REFACTOR
            myStore.remainder.physTypeStore.map(
                (this_physType, i) => [
                    // save the current state of this physType
                    savePhysType(this_physType)(i),

                    // do the physType "act"
                    physTypeDoAct(this_physType)(i),

                    // use a callback to compare the new state of this physType to saved state 
                    //  and queue additional actions
                    queue_comparePhysType
                        (checkBehaviorChanged)  // callback taking creatureType
                        ('conds.behavior')      // physType property to watch
                        (i)                     // index into physType store for this physType
                ]
            ),

            // advance sim
            advanceSim,

            // has UPDATE_FREQ_NONSIM time passed since last non-sim update?
            (performance.now() > (simGetSavedClock(myStore) + UPDATE_FREQ_NONSIM))
                // yes: dispatch a series of actions to the store to update the non-sim stuff
                ? [
                    // update the non-sim parts of our app store
                    // REFACTOR
                    actionGroup_NonsimActions(myStore),

                    // render the application
                    mutableRender,

                    // remember the current time
                    saveClockForSim(performance.now()),
                ]

                // no: do nothing
                : doNothing,
        );
    }
};


function checkBehaviorChanged(creatureType) {
    // creatureType behavior changed?
    return (physTypePropChanged(creatureType)('conds.behavior'))
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
                (getUIProp(myStore)('status_box'))
                (
                    physTypeGet(creatureType)('name') + ' ' +
                    behaviorStrings[physTypeGetCond(creatureType)('behavior')]
                )
        ]

        // no, or not a creatureType: do nothing
        : doNothing
};
