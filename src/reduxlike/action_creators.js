'use strict'

// ****** Code for creating actions ******

// *** Our imports
import {
    ACTION_COMPARE_SAVE_PHYSTYPE,
    ACTION_DO_NOTHING,
    ACTION_JOURNAL_ADD_ENTRY,
    ACTION_PHYSTYPE_DO_ACT,
    ACTION_UI_ADD_GEO_CHART_DATA,
    ACTION_UI_ADD_STATUS_MESSAGE,
    ACTION_UI_ADD_TIME_CHART_DATA,
    ACTION_SIM_ADVANCE,
    ACTION_SIM_SAVE_CLOCK,
    ACTION_SIM_START,
    ACTION_SIM_STOP,
    ACTION_STORE_LOCK,
    ACTION_STORE_UNLOCK,
} from '../const_vals.js';

import { simReducer } from './reducer_sim.js';
import { remainderReducer } from './reducer_remainder.js';


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


// *** Comparing physTypes
// save all physTypes for later comparison
// takes: 
//  don't care
// returns actionType
export const savePhysType = (_) =>
({
    type: ACTION_COMPARE_SAVE_PHYSTYPE,
});


// compare physType with store of saved physTypes at given index
// takes: 
//  indexIntType: index of physType in physType store to compare with
//      physType at same index in store of saved physTypes
//  don't care: storeType
// returns actionType


// *** Do all physType actions
// takes:
//  don't care
// returns actionType
export const physTypeDoAct = (_) =>
({
    type: ACTION_PHYSTYPE_DO_ACT,
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
//  dataIndexIntType: chart data index, as int
//  colorStringType: color for the data, as string
//  xyFloatTuple: floating-point data coordinate, as {x, y}
//  don't care: storeType
// returns actionType
export const uiAddGeoChartData = (dataIndexIntType) => (colorStringType) => (xyFloatTuple) =>
({
    type: ACTION_UI_ADD_GEO_CHART_DATA,
    dataIndexIntType,
    colorStringType,
    xyFloatTuple
});

// add time chart data
// takes:
//  dataIndexIntType: chart data index, as int
//  labelStringType: label for legend, as string
//  timeValFloatTuple: floating-point data coordinate, as {time, value}
//  don't care: storeType
// returns actionType
export const uiAddTimeChartData = (dataIndexIntType) => (labelStringType) => (timeValFloatTuple) =>
({
    type: ACTION_UI_ADD_TIME_CHART_DATA,
    dataIndexIntType,
    labelStringType,
    timeValFloatTuple
});

// add status message
// takes:
//  msgStringType: message, as string
//  don't care: storeType
// returns actionType
export const uiAddStatusMessage = (msgStringType) =>
({
    type: ACTION_UI_ADD_STATUS_MESSAGE,
    msgStringType
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


// *** storeType template with reducers for specific properties
export const storeTypeTemplate = {
    sim: simReducer,

    // REFACTOR
    remainder: remainderReducer,
};
