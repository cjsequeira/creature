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
    uiAddTimeChartSimpleCreatureData,
    addJournalEntry,
    comparePhysTypes,
    logChangedBehaviors,
} from './reduxlike/action_creators.js';

import { appStore } from './reduxlike/app_store.js';

import {
    physTypePropChanged,
    simGetCurTime,
    simGetRunning,
    simGetSavedClock,
    storeIsLocked,
} from './reduxlike/store_getters.js';
import { watchProps } from './reduxlike/watch_props';
import { actAsSimpleCreature } from './creatures/simple_creature';





// ***********************************************************************************
// *** Code that actually does stuff

// init our global app store object using some pointers to web page elements
appStore.storeInit(
    document.getElementById(CREATURE_TIME_CHART).getContext('2d'),
    document.getElementById(CREATURE_GEO_CHART).getContext('2d'),
    document.getElementById(CREATURE_STATUS_BOX)
);

// dispatch an initial series of actions
appStore.dispatchActions(
    // change the sim status to running
    startSim(),

    // add initial glucose data to time chart
    uiAddTimeChartSimpleCreatureData
        (0)
        ('glucose'),

    // add initial neuro data to time chart
    uiAddTimeChartSimpleCreatureData
        (1)
        ('neuro'),

    // add initial x-y data to geo chart
    uiAddGeoChartData
        (0)
        ('nah')
        ({
            x: 0,
            y: 0,
        }),
);

// start repeatedly updating our application at sim frequency
setInterval(appUpdate, UPDATE_FREQ_SIM);

// ***********************************************************************************


// *** Time-based callback function
// takes: 
//  don't care
// returns undefined
function appUpdate(_) {
    // is simulator running?
    if (appStore.getSimProp('running')) {
        // yes: dispatch a series of actions
        appStore.dispatchActions(
            // save current states of all physTypes
            savePhysType(),

            // do all physType actions
            physTypeDoAct(),

            // compare updated creatureTypes against saved creatureTypes to see
            //  if any behaviors changed
            comparePhysTypes
                // selection function: select all creatureTypes
                ((testPhysType) => testPhysType.act === actAsSimpleCreature)

                // comparison function: did creatureTypes 'conds.behavior' property change?
                ((oldCreatureType) => (newCreatureType) =>
                    physTypePropChanged(
                        watchProps(oldCreatureType)(newCreatureType)('conds.behavior')
                    )('conds.behavior')
                ),

            // log creatureTypes with changed behaviors
            logChangedBehaviors(),

            // advance sim
            advanceSim(),
        );
    }


    if (appStore.storeObj.remainder.passedComparePhysTypeStore.length > 0) {
        console.log(appStore.getSimProp('curTime') + '*** ' + 
        appStore.storeObj.remainder.passedComparePhysTypeStore.length.toString() + 
        '---- ' + appStore.storeObj.remainder.passedComparePhysTypeStore[0].name
        );
    }


    // has UPDATE_FREQ_NONSIM time passed since last non-sim update?
    if (performance.now() > (appStore.getSimProp('savedClock') + UPDATE_FREQ_NONSIM)) {
        // yes: dispatch a series of actions to the store to update the non-sim stuff
        appStore.dispatchActions(
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

            // queue render add glucose data to time chart for simple creatures
            uiAddTimeChartSimpleCreatureData
                (0)
                ('glucose'),

            // next, queue render add neuro data to time chart for simple creatures
            uiAddTimeChartSimpleCreatureData
                (1)
                ('neuro'),

            // next, queue render add x-y data to geo chart for all physTypes
            uiAddGeoChartData
                (0)
                ('nah')
                ({
                    x: 0,
                    y: 0,
                }),
        );
    }
};
