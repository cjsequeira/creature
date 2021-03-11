'use strict'

// ****** Code for creating actions ******

// *** Our imports
import {
    ACTION_COMPARE_COMPARE_PHYSTYPE,
    ACTION_COMPARE_LOG_CHANGED_BEHAVIORS,
    ACTION_COMPARE_SAVE_PHYSTYPE,
    ACTION_COMPARE_STOP_IF_FROZEN,
    ACTION_DO_NOTHING,
    ACTION_JOURNAL_ADD_ENTRY,
    ACTION_PHYSTYPE_DO_ACT,
    ACTION_PHYSTYPE_UPDATE_PHYSTYPE,
    ACTION_SIM_ADVANCE,
    ACTION_SIM_SAVE_CLOCK,
    ACTION_SIM_START,
    ACTION_SIM_STOP,
    ACTION_STORE_LOCK,
    ACTION_STORE_UNLOCK,
    ACTION_UI_ADD_GEO_CHART_DATA,
    ACTION_UI_ADD_TIME_CHART_DATA,
} from '../const_vals.js';

import { remainderReducer } from './reducer_remainder.js';
import { simReducer } from './reducer_sim.js';


// *** Add journal entry
// takes:
//  msgStringType: message, as string
//  don't care: storeType
// returns actionType
export const addJournalEntry = (msgStringType) =>
({
    type: ACTION_JOURNAL_ADD_ENTRY,
    msgStringType
});


// *** Comparing and testing physTypes
// compare current physTypes with store of saved physTypes
// takes: 
//  selectFunc: test function for selecting physTypes from saved and current physType store
//      signature: (physType) => boolean
//  compareFunc: function for comparing selected physTypes 
//      signature: (old physType) => (new physType) => bool
// returns actionType
export const comparePhysTypes = (selectFunc) => (compareFunc) =>
({
    type: ACTION_COMPARE_COMPARE_PHYSTYPE,
    selectFunc,
    compareFunc,
});

// log behavior changes into the app store journal
// takes:
//  don't care
// returns actionType
export const logChangedBehaviors = (_) => 
({
    type: ACTION_COMPARE_LOG_CHANGED_BEHAVIORS,
});

// save all physTypes for later comparison
// takes: 
//  don't care
// returns actionType
export const savePhysType = (_) =>
({
    type: ACTION_COMPARE_SAVE_PHYSTYPE,
});

// stop if frozen
// takes: 
//  don't care
// returns actionType
export const stopIfFrozen = (_) =>
({
    type: ACTION_COMPARE_STOP_IF_FROZEN,
});


// *** Do nothing
// takes: 
//  don't care: storeType
// returns actionType
export const doNothing = (_) =>
({
    type: ACTION_DO_NOTHING,
});


// *** Update app store properties related to UI
// add geo chart data
// takes:
//  don't care
// returns actionType
export const uiAddGeoChartData = (_) =>
({
    type: ACTION_UI_ADD_GEO_CHART_DATA,
});

// add time chart data for simple creature
// takes:
//  dataIndexIntType: chart data index, as int
//  labelStringType: label for legend, as string
//  timeValFloatTuple: floating-point data coordinate, as {time, value}
//  don't care: storeType
// returns actionType
export const uiAddTimeChartSimpleCreatureData = (offsetIntType) => (condStringType) =>
({
    type: ACTION_UI_ADD_TIME_CHART_DATA,
    offsetIntType,
    condStringType,
});


// *** Sim control
// advance sim time
// takes: 
//  don't care: storeType
// returns actionType
export const advanceSim = (_) =>
({
    type: ACTION_SIM_ADVANCE,
});

// save system clock
// takes: 
//  clockFloatType: clock value, as float
//  don't care: storeType
// returns actionType
export const saveClockForSim = (clockFloatType) =>
({
    type: ACTION_SIM_SAVE_CLOCK,
    clockFloatType
});

// start sim
// takes: 
//  don't care: storeType
// returns actionType
export const startSim = (_) =>
({
    type: ACTION_SIM_START,
});

// stop sim
// takes: 
//  don't care: storeType
// returns actionType
export const stopSim = (_) =>
({
    type: ACTION_SIM_STOP,
});


// *** Store: Lock and unlock for write access
// lock store
// takes: 
//  don't care: storeType
// returns actionType
export const lockStore = (_) =>
({
    type: ACTION_STORE_LOCK,
});

// unlock store
// takes: 
//  don't care: storeType
// returns actionType
export const unlockStore = (_) =>
({
    type: ACTION_STORE_UNLOCK,
})


// *** physType store actions
// update physType with the given physType using the same ID
// takes:
//  physType
// returns actionType
export const action_UpdatePhysType = (physType) =>
({
    type: ACTION_PHYSTYPE_UPDATE_PHYSTYPE,
    physType,
})


// *** storeType template with reducers for specific properties
export const storeTypeTemplate = {
    sim: simReducer,

    // REFACTOR
    remainder: remainderReducer,
};
