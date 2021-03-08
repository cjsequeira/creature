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
    physTypeDoAct,
    saveClockForSim,
    savePhysType,
    startSim,
    uiAddStatusMessage,
    uiAddGeoChartData,
    uiAddTimeChartData,
} from './reduxlike/action_creators.js';

import { appStore } from './reduxlike/app_store.js';

import {
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

    
    // *** Add initial data to charts
    // queue render add glucose data to time chart
    uiAddTimeChartData
        (0)
        ('glucose'),

    // next, queue render add neuro data to time chart
    uiAddTimeChartData
        (1)
        ('neuro'),

    // next, queue render add x-y data to geo chart for this_physType
    uiAddGeoChartData
        (0)
        ('nah')
        ({
            x: 0,
            y: 0,
        })
        
);

// process all actions in the queue, which could be MORE THAN WE JUST PUSHED!
appStore.processActionQueue();

// start repeatedly updating our application at sim frequency
setInterval(appUpdate, UPDATE_FREQ_SIM);

// ***********************************************************************************


// *** Time-based callback function
// takes: 
//  don't care
// returns undefined
function appUpdate(_) {
    // is simulator running?
    if (simGetRunning(appStore.storeObj)) {
        // yes: push a series of actions to the action queue
        appStore.pushActionsToQueue(
            // save current states of all physTypes
            savePhysType(),

            // do all physType actions
            physTypeDoAct(),

            // advance sim
            advanceSim(),

            // has UPDATE_FREQ_NONSIM time passed since last non-sim update?
            (performance.now() > (simGetSavedClock(appStore.storeObj) + UPDATE_FREQ_NONSIM))
                // yes: dispatch a series of actions to the store to update the non-sim stuff
                ? [
                    // remember the current time
                    saveClockForSim(performance.now()),

                    /*
                    // is this_physType a Simple Creature?
                    (inGet('act') === actAsSimpleCreature)
                        // yes
                        ? [
                            // next, if creature is frozen, 
                            //  give termination message and stop simulator
                            (inGetCond('behavior') === 'frozen')
                                ? [
                                    // add journal entry
                                    addJournalEntry("Simulation ended"),

                                    // queue render add status message
                                    uiAddStatusMessage("*** Simulation ended"),

                                    // stop sim
                                    stopSim(),
                                ]
                                : doNothing(),
                        ]

                        // not a Simple Creature: don't return the actions above
                        : doNothing(),
                        */

                    // queue render add glucose data to time chart
                    uiAddTimeChartData
                        (0)
                        ('glucose'),

                    // next, queue render add neuro data to time chart
                    uiAddTimeChartData
                        (1)
                        ('neuro'),

                    // next, queue render add x-y data to geo chart for this_physType
                    uiAddGeoChartData
                        (0)
                        ('nah')
                        ({
                            x: 0,
                            y: 0,
                        }),
                ]

                // no: do nothing
                : doNothing(),
        );
    }

    // process all actions in the queue, which could be MORE THAN WE JUST PUSHED!
    appStore.processActionQueue();
};
