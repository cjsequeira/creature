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
    UPDATE_FREQ_SIM,
    UPDATE_FREQ_TIME_CHART,
    WORLD_NUM_FOOD,
    WORLD_SIZE_X,
    WORLD_SIZE_Y,
} from './const_vals.js';

import { getDefaultFoodType } from './phystypes/food_type';

import {
    action_addPhysType,
    action_advanceSimIfRunning,
    action_saveClockForSim,
    action_startSim,
    action_stopIfFrozen,
    action_uiAddGeoChartData,
    action_uiAddTimeChartSimpleCreatureData,
    action_updateSelectPhysTypesRand,
    dispatchActions,
    mapEventsToActions,
} from './reduxlike/action_creators.js';

import { storeInit } from './reduxlike/app_store.js';
import { event_updateAllPhysTypes } from './rulebook/event_creators';
import { mutable_renderFunction } from './reduxlike/renderers.js';
import { getSimRunning } from './reduxlike/store_getters.js';
import { rand_seededRand } from './sim/seeded_rand';


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
        // add a bunch of food
        //Array(2)
        Array(WORLD_NUM_FOOD)
            .fill(getDefaultFoodType())
            .map(
                (thisFood) => action_addPhysType(thisFood)
            ),

        // atomically randomize locations of all physTypes
        action_updateSelectPhysTypesRand
            // filter function: include all physTypes
            ((_) => true)

            // randomize conds: x and y
            (
                (seed1) => ({ x: rand_seededRand(0.1)(WORLD_SIZE_X - 0.1)(seed1) }),
                (seed2) => ({ y: rand_seededRand(0.1)(WORLD_SIZE_Y - 0.1)(seed2) }),
            ),

        // change the sim status to running
        action_startSim(),

        // add all initial simple creature data to time chart
        action_uiAddTimeChartSimpleCreatureData(),

        // add initial x-y data to geo chart
        action_uiAddGeoChartData(),
    );

// *** Time-based call-backs 
// Because JavaScript is single-threaded, these call-backs 
//  should never execute at the "same time"

// interval-driven callbacks
setInterval(appUpdateSim, UPDATE_FREQ_SIM);
setInterval(appUpdateTimeChart, UPDATE_FREQ_TIME_CHART);

// animation-frame-driven callbacks
requestAnimationFrame(appUpdateGeoChart);

// ***********************************************************************************


// *** Interval-driven callback function for simulator
// takes: 
//  don't care
// returns undefined
function appUpdateSim(_) {
    // is simulator running?
    if (getSimRunning(appStore)) {
        // yes: dispatch a series of actions 
        appStore = dispatchActions(appStore)
            (
                // send an event into the system: update all physTypes
                // the method below returns action(s)
                mapEventsToActions
                    (appStore)
                    (event_updateAllPhysTypes()),

                // if ALL creatures are now frozen, stop the sim
                action_stopIfFrozen(),

                // advance sim if running
                action_advanceSimIfRunning(),

                // save current clock
                action_saveClockForSim(),
            );
    }
};


// *** Interval-driven callback function for time data chart
// takes: 
//  don't care
// returns undefined
function appUpdateTimeChart(_) {
    // dispatch action to update time chart
    appStore = dispatchActions(appStore)
        (
            // add current simple creature data to time chart
            action_uiAddTimeChartSimpleCreatureData(),
        );
};


// *** Animation-frame-driven callback function for geo chart
// takes: 
//  don't care
// returns undefined
function appUpdateGeoChart(_) {
    // dispatch action to update geo chart
    appStore = dispatchActions(appStore)
        (
            // add current physType store x-y data to geo chart
            action_uiAddGeoChartData(),
        );

    // put self back in queue
    requestAnimationFrame(appUpdateGeoChart);
};
