'use strict'

// ****** Main code ******

// *** Imports
// styling and libraries
import 'bootstrap/dist/css/bootstrap.min.css';
import './custom.css';

// our own stuff
import {
    HTML_CREATURE_GEO_CHART,
    HTML_CREATURE_PHYSTYPE_CONTAINER,
    HTML_CREATURE_STATUS_BOX,
    HTML_CREATURE_TIME_CHART,
    UPDATE_FREQ_TIME_CHART,
    WORLD_NUM_FOOD,
    WORLD_SIZE_X,
    WORLD_SIZE_Y,
} from './const_vals.js';

import { getDefaultFoodType } from './phystypes/food_type';

import {
    action_addPhysType,
    action_advanceSimIfRunning,
    action_forceChangesListUpdate,
    action_startSim,
    action_stopIfFrozen,
    action_uiAddGeoChartData,
    action_uiAddTimeChartSimpleCreatureData,
    action_updateSelectPhysTypesRand,
    imp_dispatchActions,
} from './reduxlike/action_creators.js';

import { sideEffect_storeInit } from './reduxlike/app_store.js';
import { event_updateAllPhysTypes } from './rulebook/event_creators';
import { imp_mutable_renderFunction } from './reduxlike/renderers.js';
import { mapEventsToActions } from './rulebook/rulebook.js';

import {
    getSimCurTime,
    getSimRunning,
    getUIProp,
} from './reduxlike/store_getters.js';

import { randM_seededRand } from './sim/seeded_rand';
import { getDefaultSimpleCreature } from './phystypes/simple_creature';


// ***********************************************************************************
// *** Code that actually does stuff

// init our global app store object using some pointers to web page elements
// SIDE EFFECT: creates new ChartJS objects
var appStore = sideEffect_storeInit
    (
        document.getElementById(HTML_CREATURE_TIME_CHART).getContext('2d'),
        document.getElementById(HTML_CREATURE_GEO_CHART).getContext('2d'),
        document.getElementById(HTML_CREATURE_PHYSTYPE_CONTAINER),
        document.getElementById(HTML_CREATURE_STATUS_BOX),
        imp_mutable_renderFunction
    );

// dispatch an initial series of actions
appStore = imp_dispatchActions
    (
        appStore,
        [
            // Simple Creature Vinny
            action_addPhysType
                ({
                    ...getDefaultSimpleCreature(),

                    name: 'Vinny',
                    color: '#f7036cff',
                }),

            // Simple Creature Johnny
            action_addPhysType
                ({
                    ...getDefaultSimpleCreature(),

                    name: 'Johnny',
                    color: '#0000ccff',
                }),

            // add a bunch of food
            //Array(2)
            Array(WORLD_NUM_FOOD)
                .fill(getDefaultFoodType())
                .map(
                    (thisFood) => action_addPhysType(thisFood)
                ),

            // atomically randomize locations of all physTypes
            action_updateSelectPhysTypesRand
                (
                    // filter function: include all physTypes
                    (_) => true,

                    // randomize conds: x and y
                    (seed1) => ({ x: randM_seededRand(0.1, WORLD_SIZE_X - 0.1)(seed1) }),
                    (seed2) => ({ y: randM_seededRand(0.1, WORLD_SIZE_Y - 0.1)(seed2) }),
                ),

            // add all initial simple creature data to time chart
            action_uiAddTimeChartSimpleCreatureData(),

            // add initial x-y data to geo chart
            action_uiAddGeoChartData(),

            // force the journal to render to the status box
            action_forceChangesListUpdate('remainder', 'journal'),

            // change the sim status to running
            action_startSim(),
        ]
    );

// Start updating application at animation-frame frequency
requestAnimationFrame(imp_appUpdate);

// ***********************************************************************************


// *** Animation-frame-driven callback function for application
// takes: 
//  don't care
// returns undefined
function imp_appUpdate(_) {
    // is simulator running?
    if (getSimRunning(appStore)) {
        // yes: dispatch a series of actions to advance simulator
        appStore = imp_dispatchActions
            (
                appStore,
                [
                    // send an event into the system: update all physTypes
                    // the method below returns action(s)
                    mapEventsToActions
                        (
                            appStore,
                            event_updateAllPhysTypes()
                        ),

                    // if ALL creatures are now frozen, stop the sim
                    action_stopIfFrozen(),

                    // advance sim if running
                    action_advanceSimIfRunning(),
                ]
            );
    }

    // dispatch action to update geo chart
    appStore = imp_dispatchActions
        (
            appStore,

            // add current physType store x-y data to geo chart
            action_uiAddGeoChartData(),
        );

    // enough time elapsed since we last updated the time chart?
    if (getSimCurTime(appStore) > (getUIProp(appStore)('chartTimeLastClock') + UPDATE_FREQ_TIME_CHART)) {
        // dispatch action to update time chart
        appStore = imp_dispatchActions
            (
                appStore,

                // add current simple creature data to time chart
                action_uiAddTimeChartSimpleCreatureData(),
            );
    }

    // put self back in animation queue
    requestAnimationFrame(imp_appUpdate);
};
