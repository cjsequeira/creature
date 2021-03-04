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
    addJournalEntry,
    advanceSim,
    doNothing,
    doPhysTypeAct,
    lockStore,
    mutableRender,
    queue_addStatusMessage,
    queue_comparePhysType,
    saveClockForSim,
    savePhysType,
    startSim,
    stopSim,
    unlockStore,
} from './reduxlike/action_creators.js';

import { actionGroup_dispatchActionQueue, actionGroup_NonsimActions } from './reduxlike/actiongroups.js';

import {
    physTypeGet,
    physTypeGetCond,
    physTypePropChanged,
    simGetSavedClock,
    simGetRunning,
    storeIsLocked
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
    startSim(),

    // dispatch non-sim-related actions such as queuing initial chart draws
    actionGroup_NonsimActions(myStore),

    // do the initial UI draws
    mutableRender()
]);

// start repeatedly updating our application at sim frequency
let requestId = setInterval(appUpdate, UPDATE_FREQ_SIM);

// ***********************************************************************************


// *** Time-based callback function
// REFACTOR WATCHER IDEA:
//  Consider an action type that saves a given object, then an action type that 
//  compares a given object with the saved object and calls an action-generating
//  callback function. That call-back function would always give an action,
//  which could be "do nothing"
// takes: nothing
// returns nothing
function appUpdate() {
    // is simulator running and store lock not set?
    if (
        simGetRunning(myStore) &&
        (!storeIsLocked(myStore))
    ) {
        // yes: dispatch a series of actions to the store to update the sim
        myStore = actionDispatch(myStore)([
            // set store lock
            lockStore(),

            // dispatch actions in myStore queue
            actionGroup_dispatchActionQueue(myStore),

            // do physType acts
            myStore.physTypeStore.map(
                (this_physType, i) => [
                    // save the current state of this physType
                    savePhysType(this_physType)(i),

                    // do the physType "act"
                    doPhysTypeAct(this_physType)(i),

                    // compare the new state of this physType to saved state 
                    //  and queue additional actions
                    queue_comparePhysType
                        ((creatureType) =>
                            // creatureType behavior changed?
                            (physTypePropChanged(creatureType)('conds.behavior'))
                                // yes:
                                ? [
                                    // announce in journal
                                    addJournalEntry
                                        (myStore.journal)
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
                                : doNothing()
                        )
                        ('conds.behavior')
                        (i)
                ]
            ),

            // advance sim
            advanceSim(),

            // unset store lock
            unlockStore()
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
            lockStore(),

            // dispatch actions in myStore queue
            actionGroup_dispatchActionQueue(myStore),

            // update the non-sim parts of our app store
            actionGroup_NonsimActions(myStore),

            // render the application
            mutableRender(),

            // remember the current time
            saveClockForSim(performance.now()),

            // unset store lock
            unlockStore()
        ])
    }
};
