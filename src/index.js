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

import { actAsSimpleCreature } from './creatures/simple_creature';

import {
    action_advanceSimIfRunning,
    action_comparePhysTypes,
    action_logChangedBehaviors,
    action_saveAllPhysTypes,
    action_saveClockForSim,
    action_startSim,
    action_stopIfFrozen,
    action_uiAddGeoChartData,
    action_uiAddTimeChartSimpleCreatureData,
    dispatchActions,
    mapEventsToActions,
} from './reduxlike/action_creators.js';

import { storeInit } from './reduxlike/app_store.js';
import { event_updateAllPhysTypes } from './rulebook/event_creators';
import { mutable_renderFunction } from './reduxlike/renderers.js';

import {
    getPhysTypeRootKey,
    didPhysTypePropChange,
    getSimRunning,
    getSimSavedClock,
    getPhysTypeStore,
} from './reduxlike/store_getters.js';


// ***********************************************************************************
// *** Code that actually does stuff

// init our global app store object using some pointers to web page elements
var appStore = storeInit
    (document.getElementById(CREATURE_TIME_CHART).getContext('2d'))
    (document.getElementById(CREATURE_GEO_CHART).getContext('2d'))
    (document.getElementById(CREATURE_STATUS_BOX))
    (mutable_renderFunction);

// dispatch an initial series of actions
appStore = dispatchActions(appStore)
    (
        // change the sim status to running
        action_startSim(),

        // add all initial simple creature glucose data to time chart at index 0
        action_uiAddTimeChartSimpleCreatureData(0)('glucose'),

        // add all initial simple creature neuro data to time chart at index 1
        action_uiAddTimeChartSimpleCreatureData(1)('neuro'),

        // add initial x-y data to geo chart
        action_uiAddGeoChartData(),
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
    if (getSimRunning(appStore)) {
        // yes: dispatch a series of actions
        appStore = dispatchActions(appStore)
            (
                // save current states of all physTypes
                action_saveAllPhysTypes(),

                // send an event into the system: update all physTypes
                // the method below returns action(s)
                mapEventsToActions(appStore)
                    (event_updateAllPhysTypes(getPhysTypeStore(appStore))),

                // compare updated creatureTypes against saved creatureTypes to see
                //  if any behaviors changed
                action_comparePhysTypes
                    // selection function: select all creatureTypes
                    ((ptToTest) => getPhysTypeRootKey(ptToTest)('act') === actAsSimpleCreature)

                    // comparison function: did creatureType 'conds.behavior' property change?
                    ((oldCt) => (newCt) =>
                        didPhysTypePropChange(oldCt)(newCt)('conds.behavior')),

                // journal: log creatureTypes with changed behaviors as computed due 
                //  to action_comparePhysTypes action above
                action_logChangedBehaviors(),

                // if any creatureType now has a behavior of 'frozen', update the journal
                //  and stop the sim
                action_stopIfFrozen(),

                // advance sim if running
                action_advanceSimIfRunning(),
            );

        // has UPDATE_FREQ_NONSIM time passed since last non-sim update?
        if (performance.now() > (getSimSavedClock(appStore) + UPDATE_FREQ_NONSIM)) {
            // yes: dispatch a series of actions to the store to update the non-sim stuff
            appStore = dispatchActions(appStore)
                (
                    // remember the current time
                    action_saveClockForSim(performance.now()),

                    // add all simple creature glucose data to time chart at index 0
                    action_uiAddTimeChartSimpleCreatureData(0)('glucose'),

                    // add all simple creature neuro data to time chart at index 1
                    action_uiAddTimeChartSimpleCreatureData(1)('neuro'),

                    // add all x-y data to geo chart
                    action_uiAddGeoChartData(),
                );
        }
    }
};
